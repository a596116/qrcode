#!/bin/sh

echo "Starting Nuxt preview service..."
cd /app/web

# 檢查.output目錄是否存在
if [ -d ".output" ]; then
  echo "Found .output directory, starting preview..."
  NODE_ENV=production PORT=4088 node .output/server/index.mjs
else
  echo "ERROR: .output directory not found!"
  echo "Contents of web directory:"
  ls -la
  exit 1
fi 