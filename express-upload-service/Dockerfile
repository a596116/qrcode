FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 設置環境變數
ENV NODE_ENV=production
ENV PORT=3000
ENV SITE_URL=https://api-qrcode.twhaodai.com
ENV TZ="Asia/Taipei"

# 安裝pnpm
RUN npm install -g pnpm

# 複製package.json和lock文件
COPY package.json ./
COPY pnpm-lock.yaml ./

# 安裝依賴
RUN pnpm install 

# 創建必要的目錄
RUN mkdir -p uploads qrcodes && \
    chmod -R 777 uploads qrcodes

# 複製應用代碼
COPY . .

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["node", "index.js"]
