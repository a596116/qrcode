FROM node:18-alpine

# 安裝pnpm
RUN npm install -g pnpm

# 安裝工具以支持並行運行多個服務
RUN npm install -g npm-run-all

# 設置工作目錄
WORKDIR /app

# 複製package.json文件
COPY package.json ./

# 安裝根目錄依賴
RUN pnpm install

# 複製前端和後端的package.json
COPY web/package.json ./web/
COPY express-upload-service/package.json ./express-upload-service/

# 安裝前端和後端依賴
RUN cd web && pnpm install
RUN cd express-upload-service && pnpm install

# 複製所有項目文件
COPY . .

# 構建前端應用
RUN cd web && pnpm run build

# 設置環境變數
ENV PORT=3000
ENV NUXT_PUBLIC_SITE_URL=http://localhost:4088
ENV API_SERVER_URL=http://localhost:3000

# 創建上傳和QR碼目錄
RUN mkdir -p express-upload-service/uploads express-upload-service/qrcodes

# 暴露前端和後端端口
EXPOSE 4088 3000

# 啟動服務
CMD ["npm", "run", "start"] 