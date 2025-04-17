import { unlink, readdir } from 'fs/promises'
import { join, resolve } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    // 獲取請求體
    const body = await readBody(event)

    if (!body.fileId || !body.fileType) {
      return {
        success: false,
        error: '缺少必要參數',
      }
    }

    // 獲取運行時配置
    const config = useRuntimeConfig()

    // 確定應用程序根目錄和目錄路徑
    const projectRoot = resolve(process.cwd())
    const uploadDir = resolve(
      projectRoot,
      String(config.uploadDir || 'public/uploads')
    )
    const qrCodesDir = resolve(
      projectRoot,
      String(config.qrcodesDir || 'public/qrcodes')
    )

    // 根據類型確定文件路徑
    let filePath
    let relatedPath = null // 關聯文件路徑

    console.log('接收到刪除請求:', body)
    console.log('上傳目錄路徑:', uploadDir)
    console.log('QR碼目錄路徑:', qrCodesDir)

    // 檢查目錄是否存在
    if (!existsSync(uploadDir)) {
      console.error('上傳目錄不存在!')
    }
    if (!existsSync(qrCodesDir)) {
      console.error('QR碼目錄不存在!')
    }

    // 列出所有文件
    try {
      const allUploadFiles = await readdir(uploadDir)
      const allQrCodeFiles = await readdir(qrCodesDir)
      console.log('所有上傳文件:', allUploadFiles)
      console.log('所有QR碼文件:', allQrCodeFiles)
    } catch (err) {
      console.error('讀取目錄失敗:', err)
    }

    if (body.fileType === 'upload') {
      filePath = join(uploadDir, body.fileId)
      console.log('要刪除的文件完整路徑:', filePath)

      // 如果需要同時刪除關聯的QR碼
      if (body.deleteRelated === true) {
        try {
          // 從檔案名中提取唯一標識符 - 嘗試多種方式
          const originalFileId = body.fileId
          const possibleIdentifiers = []

          // 1. 嘗試提取標識符方式1: 前綴-標識符.擴展名
          if (originalFileId.includes('-')) {
            const parts = originalFileId.split('-')
            if (parts.length > 1) {
              const secondPart = parts[1]
              const identifierWithoutExt = secondPart.includes('.')
                ? secondPart.split('.')[0]
                : secondPart
              possibleIdentifiers.push(identifierWithoutExt)
            }
          }

          // 2. 嘗試提取標識符方式2: 不考慮前綴，直接取文件名(不含擴展名)
          if (originalFileId.includes('.')) {
            possibleIdentifiers.push(originalFileId.split('.')[0])
          } else {
            possibleIdentifiers.push(originalFileId)
          }

          // 3. 嘗試方式3: 使用完整文件名
          possibleIdentifiers.push(originalFileId)

          // 4. 嘗試方式4: 如果文件名是image{uuid}或video{uuid}，提取uuid部分
          if (
            originalFileId.startsWith('image') ||
            originalFileId.startsWith('video')
          ) {
            const prefix = originalFileId.startsWith('image')
              ? 'image'
              : 'video'
            const uuid = originalFileId.substring(prefix.length).split('.')[0]
            possibleIdentifiers.push(uuid)
          }

          console.log('提取的可能標識符:', possibleIdentifiers)

          // 讀取QR碼目錄
          const qrCodeFiles = await readdir(qrCodesDir)

          // 嘗試找對應的QR碼文件
          let matchingQrCode = null

          for (const identifier of possibleIdentifiers) {
            console.log(`嘗試用標識符 "${identifier}" 匹配QR碼...`)

            // 方法1: 精確匹配標識符
            const exactMatch = qrCodeFiles.find((qrName) => {
              const qrIdentifier = qrName.startsWith('qrcode-')
                ? qrName.substring('qrcode-'.length).split('.')[0]
                : qrName.startsWith('qrcode')
                ? qrName.substring('qrcode'.length).split('.')[0]
                : qrName.split('.')[0]

              const result = qrIdentifier === identifier
              console.log(
                `比較: QR碼標識符 "${qrIdentifier}" == 文件標識符 "${identifier}" => ${result}`
              )
              return result
            })

            if (exactMatch) {
              matchingQrCode = exactMatch
              console.log(`找到精確匹配的QR碼: ${matchingQrCode}`)
              break
            }

            // 方法2: 包含關係匹配
            const containsMatch = qrCodeFiles.find((qrName) =>
              qrName.includes(identifier)
            )
            if (containsMatch) {
              matchingQrCode = containsMatch
              console.log(`找到包含關係匹配的QR碼: ${matchingQrCode}`)
              break
            }

            // 方法3: 檢查文件ID是否在QR碼文件名中
            const fileIdMatch = qrCodeFiles.find((qrName) => {
              // 從QR碼提取ID部分
              const qrIdentifier = qrName.startsWith('qrcode-')
                ? qrName.substring('qrcode-'.length).split('.')[0]
                : qrName.startsWith('qrcode')
                ? qrName.substring('qrcode'.length).split('.')[0]
                : qrName.split('.')[0]

              // 檢查是否互相包含
              return (
                identifier.includes(qrIdentifier) ||
                qrIdentifier.includes(identifier)
              )
            })

            if (fileIdMatch) {
              matchingQrCode = fileIdMatch
              console.log(`找到ID部分互相包含的QR碼: ${matchingQrCode}`)
              break
            }
          }

          // 檢查是否有相同ID的文件和QR碼
          if (!matchingQrCode) {
            const fileIdStr = originalFileId.split('.')[0]
            const sameIdMatch = qrCodeFiles.find((qrName) => {
              const qrIdStr = qrName.split('.')[0]
              return qrIdStr === fileIdStr
            })

            if (sameIdMatch) {
              matchingQrCode = sameIdMatch
              console.log(`找到相同ID的QR碼: ${matchingQrCode}`)
            }
          }

          // 如果仍未找到，嘗試更寬鬆的匹配
          if (!matchingQrCode && qrCodeFiles.length > 0) {
            // 嘗試所有可能的QR碼名稱格式
            const originalId = originalFileId.split('.')[0] // 去除擴展名

            for (const qrFile of qrCodeFiles) {
              const qrFileWithoutExt = qrFile.split('.')[0] // 去除擴展名

              // 檢查QR碼文件名是否包含原始文件ID的一部分
              if (
                originalId.length > 4 &&
                qrFileWithoutExt.includes(originalId.substring(0, 5))
              ) {
                matchingQrCode = qrFile
                console.log(`找到部分匹配的QR碼 (前5個字符): ${matchingQrCode}`)
                break
              }

              // 檢查原始文件ID是否包含QR碼文件名的一部分
              if (
                qrFileWithoutExt.length > 4 &&
                originalId.includes(qrFileWithoutExt.substring(0, 5))
              ) {
                matchingQrCode = qrFile
                console.log(
                  `原始文件包含QR碼部分 (前5個字符): ${matchingQrCode}`
                )
                break
              }
            }
          }

          if (matchingQrCode) {
            relatedPath = join(qrCodesDir, matchingQrCode)
            console.log('找到關聯QR碼, 完整路徑:', relatedPath)
          } else {
            console.log('未找到任何關聯QR碼')
          }
        } catch (err) {
          console.error('提取文件標識符或尋找QR碼時出錯:', err)
        }
      }
    } else if (body.fileType === 'qrcode') {
      filePath = join(qrCodesDir, body.fileId)
      console.log('要刪除的QR碼完整路徑:', filePath)

      // 如果需要同時刪除關聯的文件
      if (body.deleteRelated === true) {
        try {
          // 從QR碼文件名提取UUID
          const originalQrId = body.fileId
          const possibleIdentifiers = []

          // 1. 標準格式: qrcode-{標識符}.png
          if (originalQrId.startsWith('qrcode-')) {
            const identifier = originalQrId
              .substring('qrcode-'.length)
              .split('.')[0]
            possibleIdentifiers.push(identifier)
          }
          // 2. 舊格式: qrcode{標識符}.png
          else if (originalQrId.startsWith('qrcode')) {
            const identifier = originalQrId
              .substring('qrcode'.length)
              .split('.')[0]
            possibleIdentifiers.push(identifier)
          }

          // 3. 不帶前綴的標識符(去除擴展名)
          if (originalQrId.includes('.')) {
            possibleIdentifiers.push(originalQrId.split('.')[0])
          } else {
            possibleIdentifiers.push(originalQrId)
          }

          // 4. 完整文件名
          possibleIdentifiers.push(originalQrId)

          console.log('提取的可能QR碼標識符:', possibleIdentifiers)

          // 讀取上傳目錄
          const uploadFiles = await readdir(uploadDir)

          // 嘗試找對應的檔案
          let matchingFile = null

          for (const identifier of possibleIdentifiers) {
            console.log(`嘗試用QR碼標識符 "${identifier}" 匹配檔案...`)

            // 方法1: 檢查前綴-標識符格式
            const exactMatch = uploadFiles.find((fileName) => {
              if (fileName.includes('-')) {
                const parts = fileName.split('-')
                if (parts.length > 1) {
                  const fileIdentifier = parts[1].includes('.')
                    ? parts[1].split('.')[0]
                    : parts[1]

                  const result = fileIdentifier === identifier
                  console.log(
                    `比較: 文件標識符 "${fileIdentifier}" == QR碼標識符 "${identifier}" => ${result}`
                  )
                  return result
                }
              }
              return false
            })

            if (exactMatch) {
              matchingFile = exactMatch
              console.log(`找到精確匹配的檔案: ${matchingFile}`)
              break
            }

            // 方法2: 包含關係匹配
            const containsMatch = uploadFiles.find((fileName) =>
              fileName.includes(identifier)
            )
            if (containsMatch) {
              matchingFile = containsMatch
              console.log(`找到包含關係匹配的檔案: ${matchingFile}`)
              break
            }

            // 方法3: 檢查標識符是否在文件名中
            const identifierMatch = uploadFiles.find((fileName) => {
              let fileIdPart = ''

              // 提取文件名中的標識符部分
              if (fileName.includes('-')) {
                const parts = fileName.split('-')
                fileIdPart = parts[1]
                  ? parts[1].includes('.')
                    ? parts[1].split('.')[0]
                    : parts[1]
                  : ''
              } else if (fileName.includes('.')) {
                fileIdPart = fileName.split('.')[0]
              } else {
                fileIdPart = fileName
              }

              // 檢查互相包含關係
              return (
                fileIdPart.includes(identifier) ||
                identifier.includes(fileIdPart)
              )
            })

            if (identifierMatch) {
              matchingFile = identifierMatch
              console.log(`找到標識符互相包含的檔案: ${matchingFile}`)
              break
            }
          }

          // 如果仍未找到，嘗試更寬鬆的匹配
          if (!matchingFile && uploadFiles.length > 0) {
            const qrId = originalQrId.split('.')[0] // 去除擴展名

            for (const uploadFile of uploadFiles) {
              const uploadFileWithoutExt = uploadFile.split('.')[0] // 去除擴展名

              // 檢查上傳文件名是否包含QR碼ID的一部分
              if (
                qrId.length > 4 &&
                uploadFileWithoutExt.includes(qrId.substring(0, 5))
              ) {
                matchingFile = uploadFile
                console.log(`找到部分匹配的檔案 (前5個字符): ${matchingFile}`)
                break
              }

              // 檢查QR碼ID是否包含上傳文件名的一部分
              if (
                uploadFileWithoutExt.length > 4 &&
                qrId.includes(uploadFileWithoutExt.substring(0, 5))
              ) {
                matchingFile = uploadFile
                console.log(`QR碼包含檔案部分 (前5個字符): ${matchingFile}`)
                break
              }
            }
          }

          if (matchingFile) {
            relatedPath = join(uploadDir, matchingFile)
            console.log('找到關聯檔案, 完整路徑:', relatedPath)
          } else {
            console.log('未找到任何關聯檔案')
          }
        } catch (err) {
          console.error('提取QR碼標識符或尋找文件時出錯:', err)
        }
      }
    } else {
      return {
        success: false,
        error: '不支持的文件類型',
      }
    }

    // 檢查文件是否存在
    if (!existsSync(filePath)) {
      console.error('要刪除的主文件不存在!', filePath)
      return {
        success: false,
        error: '要刪除的文件不存在',
      }
    }

    // 刪除主文件
    try {
      await unlink(filePath)
      console.log('成功刪除主文件:', filePath)
    } catch (err) {
      console.error('刪除主文件失敗:', err)
      return {
        success: false,
        error: '刪除文件失敗',
      }
    }

    // 如果有關聯文件且需要刪除
    if (relatedPath) {
      try {
        // 檢查關聯文件是否存在
        if (!existsSync(relatedPath)) {
          console.error('關聯文件不存在!', relatedPath)
        } else {
          await unlink(relatedPath)
          console.log('成功刪除關聯文件:', relatedPath)
        }
      } catch (err) {
        console.error('刪除關聯文件失敗:', err)
        // 不中斷處理，繼續返回成功
      }
    }

    return {
      success: true,
      message: '文件刪除成功',
      deletedRelated: relatedPath !== null,
    }
  } catch (error) {
    console.error('刪除文件錯誤:', error)
    return {
      success: false,
      error: '刪除文件時發生錯誤',
    }
  }
})
