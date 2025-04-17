#!/bin/sh

echo "啟動QR碼服務..."

# 確保目錄存在
mkdir -p /app/express-upload-service/uploads /app/express-upload-service/qrcodes
chmod -R 777 /app/express-upload-service/uploads /app/express-upload-service/qrcodes

# 啟動後端服務
echo "Starting backend service..."
cd /app/express-upload-service && NODE_ENV=production pnpm run start &
BACKEND_PID=$!

# 等待後端啟動
echo "Waiting for backend to start..."
sleep 3

# 啟動前端服務
echo "Starting frontend service..."
cd /app/web && NODE_ENV=production pnpm run preview &
FRONTEND_PID=$!

# 設置捕獲SIGTERM信號
echo "Services started. Press Ctrl+C to stop."
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGTERM SIGINT

# 等待所有子進程
wait 