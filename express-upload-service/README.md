# Express 檔案上傳服務

這是一個使用 Express.js 開發的檔案上傳服務，可以接收圖片和影片檔案，並為上傳的檔案生成QR碼。

## 功能特點

- 檔案上傳（支援圖片和影片）
- 自動生成QR碼
- 檔案大小限制（圖片10MB，影片100MB）
- RESTful API 設計
- 簡單的檔案管理功能

## 安裝與運行

### 前置需求

- Node.js (建議 v14.x 或更高版本)
- npm 或 yarn

### 安裝步驟

1. 複製專案

```bash
git clone https://your-repository-url/express-upload-service.git
cd express-upload-service
```

2. 安裝依賴

```bash
npm install
```

3. 運行服務

```bash
# 開發模式（使用 nodemon 自動重啟）
npm run dev

# 產品模式
npm start
```

伺服器預設在 http://localhost:3000 運行

## API 接口說明

### 上傳檔案

**POST** `/api/upload`

- 需要 `multipart/form-data` 格式
- 參數：
  - `file`: 檔案（必須是圖片或影片）

回應示例：
```json
{
  "success": true,
  "fileUrl": "/uploads/image-uuid.jpg",
  "qrCodeUrl": "/qrcodes/qrcode-uuid.png",
  "fileInfo": {
    "originalFileName": "example.jpg",
    "name": "image-uuid.jpg",
    "size": 123456,
    "type": "image/jpeg",
    "timestamp": "2023-01-01T12:00:00.000Z",
    "uuid": "uuid"
  },
  "isLargeFile": false
}
```

### 獲取檔案列表

**GET** `/api/files`

回應示例：
```json
{
  "success": true,
  "files": [
    {
      "id": "image-uuid.jpg",
      "uuid": "uuid",
      "path": "/uploads/image-uuid.jpg",
      "type": "image",
      "size": 123456,
      "created": "2023-01-01T12:00:00.000Z"
    }
  ],
  "qrCodes": [
    {
      "id": "qrcode-uuid.png",
      "uuid": "uuid",
      "path": "/qrcodes/qrcode-uuid.png",
      "created": "2023-01-01T12:00:00.000Z"
    }
  ]
}
```

### 獲取單個檔案資訊

**GET** `/api/file/:id`

- 參數：
  - `id`: 檔案ID

回應示例：
```json
{
  "success": true,
  "fileInfo": {
    "id": "image-uuid.jpg",
    "path": "/uploads/image-uuid.jpg",
    "type": "image",
    "size": 123456,
    "created": "2023-01-01T12:00:00.000Z"
  }
}
```

### 刪除檔案

**DELETE** `/api/file/:id`

- 參數：
  - `id`: 檔案ID

回應示例：
```json
{
  "success": true,
  "message": "檔案已成功刪除"
}
```

## 環境變數

- `PORT`: 服務運行端口（預設為 3000）
- `SITE_URL`: 站點基本URL，用於生成QR碼內容（預設為 `http://localhost:[PORT]`）

## 前端整合示例

### 使用 fetch API 上傳檔案

```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      console.log('檔案上傳成功', result);
    } else {
      console.error('上傳失敗', result.message);
    }
  } catch (error) {
    console.error('上傳過程中發生錯誤', error);
  }
};
```

## 授權

MIT 