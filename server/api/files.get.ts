import { readdir, stat, mkdir } from 'fs/promises'
import { join, basename, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    // 獲取運行時配置
    const config = useRuntimeConfig()

    // 判斷是開發環境還是生產環境
    const isDev = process.env.NODE_ENV === 'development'

    // 根據環境決定根路徑
    let basePath
    if (isDev) {
      // 開發環境使用項目根目錄
      basePath = process.cwd()
    } else {
      // 生產環境，確保使用正確的路徑
      basePath = resolve(process.cwd())
    }

    // 建立完整路徑
    const uploadDir = resolve(basePath, String(config.uploadDir))
    const qrCodesDir = resolve(basePath, String(config.qrcodesDir))

    console.log('環境:', isDev ? '開發環境' : '生產環境')
    console.log('基礎路徑:', basePath)
    console.log('上傳目錄路徑:', uploadDir)
    console.log('QR碼目錄路徑:', qrCodesDir)

    // 檢查目錄是否存在，不存在則創建
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
      console.log('已創建上傳目錄:', uploadDir)
    }

    if (!existsSync(qrCodesDir)) {
      await mkdir(qrCodesDir, { recursive: true })
      console.log('已創建QR碼目錄:', qrCodesDir)
    }

    // 讀取上傳目錄中的所有文件
    const uploadFiles = await readdir(uploadDir)
    const qrCodeFiles = await readdir(qrCodesDir)

    // 處理QR碼文件
    const qrCodesList = qrCodeFiles.map((fileName) => {
      // 從QR碼檔案名提取UUID (qrcode-UUID.png)
      const qrUuid = fileName.startsWith('qrcode-')
        ? fileName.replace('qrcode-', '').replace(/\.png$/, '')
        : fileName.replace('qrcode', '').replace(/\.png$/, '') // 支援舊格式

      return {
        id: fileName,
        uuid: qrUuid,
        path: `/qrcodes/${fileName}`,
        created: new Date(), // 默認值，將在下面更新
      }
    })

    // 處理上傳的文件
    const filesList = await Promise.all(
      uploadFiles.map(async (fileName) => {
        const filePath = join(uploadDir, fileName)
        const fileStats = await stat(filePath)

        // 確定文件類型
        let fileType = 'other'
        // 依據檔案名前綴判斷類型
        if (fileName.startsWith('image')) {
          fileType = 'image'
        } else if (fileName.startsWith('video')) {
          fileType = 'video'
        } else if (
          fileName.match(/\.(jpg|jpeg|png|gif|webp|svg|heic|avif)$/i)
        ) {
          fileType = 'image'
        } else if (fileName.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
          fileType = 'video'
        }

        // 提取UUID（根據新的命名格式：prefix-UUID + 副檔名）
        let fileUuid = ''
        let originalFileName = fileName

        if (fileName.match(/^(image|video|file)-[a-f0-9-]+\.[^.]+$/i)) {
          // 新格式：prefix-UUID + 副檔名
          const parts = fileName.split('-')
          const prefix = parts[0]

          // 取得除了前綴之外的其餘部分並移除副檔名
          fileUuid = fileName
            .substring(prefix.length + 1)
            .replace(/\.[^.]+$/, '')
          originalFileName = `${prefix}_file${fileUuid.substring(0, 8)}` // 創建一個更友好的顯示名稱
        } else if (
          fileName.startsWith('image') ||
          fileName.startsWith('video') ||
          fileName.startsWith('file')
        ) {
          // 舊格式1：prefix + UUID + 副檔名
          const prefix = fileName.startsWith('image')
            ? 'image'
            : fileName.startsWith('video')
            ? 'video'
            : 'file'

          fileUuid = fileName.substring(prefix.length).replace(/\.[^.]+$/, '')
          originalFileName = `${prefix}_file${fileUuid.substring(0, 8)}`
        } else if (fileName.includes('-')) {
          // 舊格式2：UUID-原始文件名
          fileUuid = fileName.split('-')[0]
          originalFileName = fileName.split('-').slice(1).join('-')
        }

        // 尋找對應的QR碼 - 使用精確UUID匹配
        const matchingQrCode = qrCodesList.find((qr) => qr.uuid === fileUuid)

        return {
          id: fileName,
          uuid: fileUuid,
          name: originalFileName,
          originalFileName,
          path: `/uploads/${fileName}`,
          size: fileStats.size,
          type: fileType,
          created: fileStats.birthtime,
          lastAccessed: fileStats.atime,
          qrCode: matchingQrCode || null,
        }
      })
    )

    // 更新QR碼的創建日期
    qrCodesList.forEach((qr) => {
      const matchingFile = filesList.find((file) => file.uuid === qr.uuid)
      if (matchingFile) {
        qr.created = matchingFile.created
      }
    })

    // 建立對應關係：為QR碼找到對應的文件
    const qrCodesWithFiles = qrCodesList.map((qr) => {
      // 使用精確UUID匹配
      const matchingFile = filesList.find((file) => file.uuid === qr.uuid)

      return {
        ...qr,
        file: matchingFile
          ? {
              id: matchingFile.id,
              name: matchingFile.name,
              path: matchingFile.path,
              type: matchingFile.type,
            }
          : null,
      }
    })

    // 返回結果
    return {
      success: true,
      files: filesList.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      ),
      qrCodes: qrCodesWithFiles,
    }
  } catch (error) {
    console.error('獲取文件列表錯誤:', error)
    return {
      success: false,
      error: '無法獲取文件列表',
    }
  }
})
