FROM node:18-alpine AS builder

# 設置工作目錄
WORKDIR /app

# 設置環境變數
ENV NODE_ENV=production
ENV NUXT_PUBLIC_SITE_URL=http://localhost:4088
ENV API_SERVER_URL=http://localhost:3000

# 安裝pnpm
RUN npm install -g pnpm

# 複製package.json和lock文件
COPY package.json ./
COPY pnpm-lock.yaml ./

# 安裝依賴
RUN pnpm install 

# 複製應用代碼
COPY . .

# 構建應用
RUN pnpm run build

# 生產階段
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 設置環境變數
ENV NODE_ENV=production
ENV PORT=4088
ENV TZ="Asia/Taipei"

# 安裝pnpm
RUN npm install -g pnpm

# 複製package.json
COPY package.json ./

# 僅安裝生產依賴
RUN pnpm install --prod 

# 從構建階段複製構建產物
COPY --from=builder /app/.output ./.output

# 暴露端口
EXPOSE 4088

# 啟動應用
CMD ["node", ".output/server/index.mjs"]
