# 基礎階段 - 安裝依賴
FROM node:18-alpine AS deps

# 安裝pnpm
RUN npm install -g pnpm

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
WORKDIR /app/web
RUN pnpm install --frozen-lockfile --prod
WORKDIR /app/express-upload-service
RUN pnpm install --frozen-lockfile --prod
WORKDIR /app

# 構建階段 - 構建前端應用
FROM node:18-alpine AS builder
RUN npm install -g pnpm

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/web/node_modules ./web/node_modules

# 僅複製必要的前端代碼進行構建
COPY web ./web/
COPY package.json ./

# 構建前端應用
WORKDIR /app/web
RUN pnpm run build

# 生產階段 - 最終映像
FROM node:18-alpine AS runner

# 安裝工具以支持並行運行多個服務
RUN npm install -g npm-run-all pnpm

# 創建非root用戶
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 qrcodeuser && \
    mkdir -p /app/express-upload-service/uploads /app/express-upload-service/qrcodes && \
    chown -R qrcodeuser:nodejs /app

# 設置工作目錄
WORKDIR /app

# 複製啟動腳本
COPY start.sh ./
RUN chmod +x start.sh

# 複製構建好的前端應用
COPY --from=builder --chown=qrcodeuser:nodejs /app/web/.output /app/web/.output
COPY --from=builder --chown=qrcodeuser:nodejs /app/web/package.json /app/web/

# 複製後端應用
COPY --from=deps --chown=qrcodeuser:nodejs /app/express-upload-service/node_modules /app/express-upload-service/node_modules
COPY --chown=qrcodeuser:nodejs express-upload-service /app/express-upload-service/
COPY --chown=qrcodeuser:nodejs package.json ./

# 設置環境變數
ENV PORT=3000
ENV NODE_ENV=production
ENV NUXT_PUBLIC_SITE_URL=http://localhost:4088
ENV API_SERVER_URL=http://localhost:3000

# 設置正確的權限
RUN chmod -R 777 /app/express-upload-service/uploads /app/express-upload-service/qrcodes

# 切換到非root用戶
USER qrcodeuser

# 暴露前端和後端端口
EXPOSE 4088 3000

# 啟動服務
CMD ["./start.sh"] 