const express = require('express')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const { randomUUID } = require('crypto')
const QRCode = require('qrcode')

const app = express()
const port = process.env.PORT || 3000

// 中間件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 設置靜態文件夾
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/qrcodes', express.static(path.join(__dirname, 'qrcodes')))
app.use(express.static(path.join(__dirname, 'public')))

// 創建上傳目錄
const uploadDir = path.join(__dirname, 'uploads')
const qrCodesDir = path.join(__dirname, 'qrcodes')

// 確保目錄存在
fs.mkdirSync(uploadDir, { recursive: true })
fs.mkdirSync(qrCodesDir, { recursive: true })

// 設置檔案上傳配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const fileUuid = randomUUID()
    const fileExt = path.extname(file.originalname)

    // 根據檔案類型設置前綴
    let prefix = 'file'
    if (file.mimetype.startsWith('image/')) {
      prefix = 'image'
    } else if (file.mimetype.startsWith('video/')) {
      prefix = 'video'
    }

    cb(null, `${prefix}-${fileUuid}${fileExt}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB上限
  },
  fileFilter: function (req, file, cb) {
    // 驗證檔案類型
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/')
    ) {
      cb(null, true)
    } else {
      cb(new Error('不支援的檔案類型，請上傳圖片或影片'))
    }
  },
})

// 檔案上傳路由
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '未收到檔案' })
    }

    const file = req.file
    // 修正從檔案名中提取UUID的邏輯，避免截斷
    const fileNameParts = file.filename.split('-')
    const fileUuid =
      fileNameParts.length > 1
        ? // 保留除了前綴之外的所有部分，以處理UUID中可能包含的破折號
          fileNameParts.slice(1).join('-').split('.')[0]
        : file.filename.split('.')[0]

    const isImage = file.mimetype.startsWith('image/')
    const isVideo = file.mimetype.startsWith('video/')

    // 檔案URL
    const fileUrl = `/uploads/${file.filename}`

    // QR碼文件名
    const qrCodeFileName = `qrcode-${fileUuid}.png`
    const qrCodePath = path.join(qrCodesDir, qrCodeFileName)

    // 檔案資訊
    const fileInfo = {
      originalFileName: file.originalname,
      name: file.filename,
      size: file.size,
      type: file.mimetype,
      timestamp: new Date().toISOString(),
      uuid: fileUuid,
    }

    // 根據檔案類型生成不同的QR碼內容
    let qrContent = ''
    const siteUrl =
      process.env.SITE_URL ||
      process.env.NUXT_PUBLIC_SITE_URL ||
      `http://localhost:${port}`

    if ((isImage && file.size < 50000) || (!isImage && !isVideo)) {
      // 對於小圖像或其他檔案，QR碼包含檔案URL
      qrContent = `${siteUrl}${fileUrl}`
    } else {
      // 對於大型圖像和視訊，QR碼只包含檔案資訊
      qrContent = JSON.stringify({
        fileInfo,
        fileUrl: `${siteUrl}${fileUrl}`,
        message: '檔案太大，無法直接包含在QR碼中。此QR碼包含檔案資訊和連結。',
      })
    }

    // QR碼配置
    const qrCodeOptions = {
      errorCorrectionLevel: 'L',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    }

    // 生成QR碼
    await QRCode.toFile(qrCodePath, qrContent, qrCodeOptions)

    // QR碼URL
    const qrCodeUrl = `/qrcodes/${qrCodeFileName}`

    return res.json({
      success: true,
      fileUrl: `${siteUrl}${fileUrl}`,
      qrCodeUrl: `${siteUrl}${qrCodeUrl}`,
      fileInfo,
      isLargeFile: (isImage && file.size >= 50000) || isVideo,
    })
  } catch (error) {
    console.error('上傳處理錯誤:', error)
    return res.status(500).json({
      success: false,
      message: '檔案上傳處理錯誤',
      error: error.message,
    })
  }
})

// 獲取檔案清單
app.get('/api/files', async (req, res) => {
  try {
    const uploadFiles = fs.readdirSync(uploadDir)
    const qrCodeFiles = fs.readdirSync(qrCodesDir)
    const siteUrl =
      process.env.SITE_URL ||
      process.env.NUXT_PUBLIC_SITE_URL ||
      `http://localhost:${port}`

    // 處理QR碼文件
    const qrCodesList = qrCodeFiles.map((fileName) => {
      // 從QR碼檔案名提取UUID (qrcode-UUID.png)
      // 修正提取UUID的邏輯，避免破折號導致的問題
      let qrUuid = ''
      if (fileName.startsWith('qrcode-')) {
        // 移除前綴'qrcode-'和副檔名'.png'
        qrUuid = fileName.substring(7, fileName.length - 4)
      } else {
        qrUuid = fileName
      }

      return {
        id: fileName,
        uuid: qrUuid,
        path: `${siteUrl}/qrcodes/${fileName}`,
        created: new Date(),
      }
    })

    // 處理上傳的文件
    const filesList = uploadFiles.map((fileName) => {
      const filePath = path.join(uploadDir, fileName)
      const fileStats = fs.statSync(filePath)

      // 確定文件類型
      let fileType = 'other'
      // 依據檔案名前綴判斷類型
      if (fileName.startsWith('image')) {
        fileType = 'image'
      } else if (fileName.startsWith('video')) {
        fileType = 'video'
      } else if (fileName.match(/\.(jpg|jpeg|png|gif|webp|svg|heic|avif)$/i)) {
        fileType = 'image'
      } else if (fileName.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
        fileType = 'video'
      }

      // 提取UUID（根據命名格式：prefix-UUID + 副檔名）
      const fileNameParts = fileName.split('-')
      const fileUuid =
        fileNameParts.length > 1
          ? fileNameParts.slice(1).join('-').split('.')[0]
          : fileName.split('.')[0]

      return {
        id: fileName,
        uuid: fileUuid,
        path: `${siteUrl}/uploads/${fileName}`,
        type: fileType,
        size: fileStats.size,
        created: fileStats.mtime,
      }
    })

    res.json({
      success: true,
      files: filesList,
      qrCodes: qrCodesList,
    })
  } catch (error) {
    console.error('獲取檔案列表錯誤:', error)
    res.status(500).json({
      success: false,
      message: '獲取檔案列表失敗',
      error: error.message,
    })
  }
})

// 獲取單個檔案資訊
app.get('/api/file/:id', (req, res) => {
  try {
    const fileId = req.params.id
    const filePath = path.join(uploadDir, fileId)
    const siteUrl =
      process.env.SITE_URL ||
      process.env.NUXT_PUBLIC_SITE_URL ||
      `http://localhost:${port}`

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '找不到檔案',
      })
    }

    const fileStats = fs.statSync(filePath)
    const fileType = fileId.startsWith('image')
      ? 'image'
      : fileId.startsWith('video')
      ? 'video'
      : 'other'

    res.json({
      success: true,
      fileInfo: {
        id: fileId,
        path: `${siteUrl}/uploads/${fileId}`,
        type: fileType,
        size: fileStats.size,
        created: fileStats.mtime,
      },
    })
  } catch (error) {
    console.error('獲取檔案資訊錯誤:', error)
    res.status(500).json({
      success: false,
      message: '獲取檔案資訊失敗',
      error: error.message,
    })
  }
})

// 刪除檔案
app.delete('/api/file/:id', (req, res) => {
  try {
    const fileId = req.params.id
    const filePath = path.join(uploadDir, fileId)

    // 檢查檔案是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '找不到檔案',
      })
    }

    // 嘗試找到對應的QR碼檔案
    const fileNameParts = fileId.split('-')
    const fileUuid =
      fileNameParts.length > 1
        ? fileNameParts.slice(1).join('-').split('.')[0]
        : fileId.split('.')[0]

    const qrCodePath = path.join(qrCodesDir, `qrcode-${fileUuid}.png`)

    // 刪除檔案
    fs.unlinkSync(filePath)

    // 如果QR碼存在，也刪除
    if (fs.existsSync(qrCodePath)) {
      fs.unlinkSync(qrCodePath)
    }

    res.json({
      success: true,
      message: '檔案已成功刪除',
    })
  } catch (error) {
    console.error('刪除檔案錯誤:', error)
    res.status(500).json({
      success: false,
      message: '刪除檔案失敗',
      error: error.message,
    })
  }
})

// 啟動伺服器
app.listen(port, () => {
  console.log(`伺服器已啟動，運行在 http://localhost:${port}`)
})
