# QR碼生成工具

一個簡單的工具，可以上傳圖片或影片並生成QR碼連結。

## 項目結構

- `web/` - 前端Nuxt.js應用
- `express-upload-service/` - 後端Express服務器，處理文件上傳和QR碼生成

## 安裝依賴

首先，安裝根目錄的依賴：

```bash
npm install
```

然後，安裝所有子項目的依賴：

```bash
npm run install
```

## 開發模式

要同時啟動前端和後端服務，只需運行：

```bash
npm run dev
```

這將會：
- 啟動前端Web服務，默認在 http://localhost:4088
- 啟動後端API服務，默認在 http://localhost:3000

## 單獨啟動服務

如果需要單獨啟動某個服務：

### 只啟動前端

```bash
npm run dev:web
```

### 只啟動後端

```bash
npm run dev:server
```

## 生產環境

構建前端應用：

```bash
npm run build
```

同時啟動前端和後端服務：

```bash
npm run start
```

## 環境變數

可以在各自的目錄中設置環境變數：

### 前端 (web/.env)

```
NUXT_PUBLIC_SITE_URL=https://你的網站域名
API_SERVER_URL=https://你的API伺服器域名
```

### 後端 (express-upload-service/.env)

```
PORT=3000
SITE_URL=https://你的網站域名
```

## 使用Docker運行

本項目提供了Docker配置，可以輕鬆地在容器中運行整個應用。

### 使用Docker Compose (推薦)

1. 確保已安裝 Docker 和 Docker Compose
2. 運行以下命令啟動應用：

```bash
docker-compose up -d
```

這將：
- 構建Docker映像
- 啟動容器
- 前端服務在 http://localhost:4088
- 後端服務在 http://localhost:3000
- 掛載上傳的文件和生成的QR碼到本地目錄

### 手動構建和運行Docker映像

或者，您可以手動構建和運行Docker映像：

```bash
# 構建映像
docker build -t qrcode-app .

# 運行容器
docker run -d \
  -p 4088:4088 \
  -p 3000:3000 \
  -v $(pwd)/express-upload-service/uploads:/app/express-upload-service/uploads \
  -v $(pwd)/express-upload-service/qrcodes:/app/express-upload-service/qrcodes \
  --name qrcode-app \
  qrcode-app
```

### 停止和刪除Docker容器

```bash
# 使用Docker Compose
docker-compose down

# 或者手動操作
docker stop qrcode-app
docker rm qrcode-app
``` 