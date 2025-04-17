#!/bin/sh

echo "啟動QR碼服務..."

# 顯示目錄結構以進行調試
echo "Current directory: $(pwd)"
echo "Directory listing:"
ls -la
echo "Web directory:"
ls -la /app/web || echo "Web directory not found!"
echo "Express service directory:"
ls -la /app/express-upload-service || echo "Express service directory not found!"

# 確保目錄存在
mkdir -p /app/express-upload-service/uploads /app/express-upload-service/qrcodes
chmod -R 777 /app/express-upload-service/uploads /app/express-upload-service/qrcodes

# 啟動後端服務
echo "Starting backend service..."
if [ -d "/app/express-upload-service" ]; then
  cd /app/express-upload-service && NODE_ENV=production pnpm run start &
  BACKEND_PID=$!
  echo "Backend service started with PID: $BACKEND_PID"
else
  echo "ERROR: express-upload-service directory not found!"
  exit 1
fi

# 等待後端啟動
echo "Waiting for backend to start..."
sleep 3

# 啟動前端服務
echo "Starting frontend service..."
if [ -d "/app/web" ]; then
  cd /app && ./web-start.sh &
  FRONTEND_PID=$!
  echo "Frontend service started with PID: $FRONTEND_PID"
else
  echo "ERROR: web directory not found!"
  echo "Contents of /app:"
  ls -la /app
  exit 1
fi

# 設置捕獲SIGTERM信號
echo "Services started. Press Ctrl+C to stop."
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGTERM SIGINT

# 等待所有子進程
wait 