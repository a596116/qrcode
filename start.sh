#!/bin/sh

# 顯示目錄結構以進行調試
echo "Current directory: $(pwd)"
echo "Listing root directory:"
ls -la

# 檢查express-upload-service目錄
if [ -d "express-upload-service" ]; then
  echo "express-upload-service directory exists"
  echo "Contents of express-upload-service:"
  ls -la express-upload-service
else
  echo "ERROR: express-upload-service directory does not exist!"
  exit 1
fi

# 檢查web目錄
if [ -d "web" ]; then
  echo "web directory exists"
  echo "Contents of web:"
  ls -la web
else
  echo "ERROR: web directory does not exist!"
  exit 1
fi

# 啟動後端服務
echo "Starting backend service..."
cd express-upload-service && pnpm run start &
BACKEND_PID=$!

# 等待後端啟動
sleep 5

# 啟動前端服務
echo "Starting frontend service..."
cd /app/web && pnpm run preview &
FRONTEND_PID=$!

# 設置捕獲SIGTERM信號
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGTERM SIGINT

# 等待所有子進程完成
wait 