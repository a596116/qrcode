import { readMultipartFormData } from 'h3'
import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { join, resolve } from 'path'
import QRCode from 'qrcode'

export default defineEventHandler(async (event) => {
  try {
    // 獲取上傳的表單數據
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      return {
        success: false,
        error: '沒有收到檔案',
      }
    }

    // 找到檔案欄位
    const fileField = formData.find((field) => field.name === 'file')
    if (!fileField || !fileField.filename) {
      return {
        success: false,
        error: '沒有收到檔案',
      }
    }

    // 取得顏色參數
    const darkColorField = formData.find((field) => field.name === 'darkColor')
    const lightColorField = formData.find(
      (field) => field.name === 'lightColor'
    )
    const darkColor = darkColorField
      ? new TextDecoder().decode(darkColorField.data)
      : '#000000'
    const lightColor = lightColorField
      ? new TextDecoder().decode(lightColorField.data)
      : '#ffffff'

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

    console.log('上傳目錄路徑:', uploadDir)
    console.log('QR碼目錄路徑:', qrCodesDir)

    try {
      await mkdir(uploadDir, { recursive: true })
      await mkdir(qrCodesDir, { recursive: true })
    } catch (e) {
      console.error('創建目錄失敗:', e)
    }

    // 生成唯一UUID（兩者共用同一個UUID，確保關聯）
    const fileUuid = randomUUID()

    // 檢查檔案類型
    const isImageExtension = (filename: string): boolean => {
      const ext = filename.split('.').pop()?.toLowerCase() || ''
      return [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'svg',
        'heic',
        'avif',
      ].includes(ext)
    }

    const isImage =
      fileField.type?.startsWith('image/') ||
      isImageExtension(fileField.filename) ||
      false
    const isVideo = fileField.type?.startsWith('video/') || false

    // 生成檔案名（使用前綴-亂碼的命名規則）
    let prefix = 'file'
    if (isImage) {
      prefix = 'image'
    } else if (isVideo) {
      prefix = 'video'
    }

    const fileName = `${prefix}-${fileUuid}${getFileExt(fileField.filename)}`
    const filePath = join(uploadDir, fileName)

    // 儲存檔案
    await writeFile(filePath, fileField.data)

    // 檔案基本資訊
    const fileInfo = {
      originalFileName: fileField.filename, // 保存原始檔案名
      name: fileName, // 儲存新的檔案名
      size: fileField.data.length,
      type: fileField.type || 'application/octet-stream',
      timestamp: new Date().toISOString(),
      uuid: fileUuid,
    }

    // 檔案URL
    const fileUrl = `/uploads/${fileName}`

    // QR碼文件名（使用qrcode-前綴+相同的UUID）
    const qrCodeFileName = `qrcode-${fileUuid}.png`
    const qrCodePath = join(qrCodesDir, qrCodeFileName)

    // 根據檔案類型生成不同的QR碼內容
    let qrContent = ''

    if ((isImage && fileField.data.length < 50000) || (!isImage && !isVideo)) {
      // 對於小圖像或其他檔案，QR碼包含檔案URL
      qrContent = `${config.public.siteUrl || ''}${fileUrl}`
    } else {
      // 對於大型圖像和視訊，QR碼只包含檔案資訊
      qrContent = JSON.stringify({
        fileInfo,
        fileUrl: `${config.public.siteUrl || ''}${fileUrl}`,
        message: '檔案太大，無法直接包含在QR碼中。此QR碼包含檔案資訊和連結。',
      })
    }

    // 生成QR碼
    const qrCodeOptions = {
      errorCorrectionLevel: 'L' as const,
      margin: 1,
      width: 300,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    }

    await QRCode.toFile(qrCodePath, qrContent, qrCodeOptions)

    // QR碼URL
    const qrCodeUrl = `/qrcodes/${qrCodeFileName}`

    return {
      success: true,
      fileUrl,
      qrCodeUrl,
      fileInfo,
      isLargeFile: (isImage && fileField.data.length >= 50000) || isVideo,
    }
  } catch (error) {
    console.error('上傳處理錯誤:', error)
    return {
      success: false,
      error: '檔案上傳處理錯誤',
    }
  }
})

// 獲取檔案副檔名的輔助函數
function getFileExt(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? `.${parts.pop()}` : ''
}
