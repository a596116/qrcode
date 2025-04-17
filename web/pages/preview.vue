<template>
  <div class="preview-container">
    <!-- 導航欄 -->
    <div
      class="fixed top-0 left-0 right-0 z-10 px-6 py-4 bg-white shadow-md navbar"
    >
      <div class="container flex items-center justify-between mx-auto">
        <a
          href="/"
          class="flex items-center text-blue-600 transition hover:text-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
          返回
        </a>
        <h1 class="text-xl font-bold text-gray-800">檔案預覽</h1>
        <div class="flex space-x-3">
          <button
            v-if="canFullscreen"
            @click="toggleFullscreen"
            class="text-gray-600 transition hover:text-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
              />
            </svg>
          </button>
          <a
            v-if="fileUrl"
            :href="fileUrl"
            download
            class="text-gray-600 transition hover:text-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- 檔案預覽區域 -->
    <div class="px-6 pt-20 pb-10 preview-content">
      <div class="container mx-auto">
        <!-- 載入中提示 -->
        <div
          v-if="loading"
          class="flex flex-col items-center justify-center h-80"
        >
          <div
            class="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"
          ></div>
          <p class="mt-4 text-gray-600">載入中，請稍候...</p>
        </div>

        <!-- 錯誤提示 -->
        <div
          v-else-if="error"
          class="px-4 py-3 mt-6 text-red-700 bg-red-100 border border-red-400 rounded-md"
        >
          {{ error }}
        </div>

        <!-- 圖片預覽 -->
        <div v-else-if="fileType === 'image'" class="preview-image">
          <div
            class="flex items-center justify-center p-4 bg-gray-100 rounded-lg"
            style="min-height: 65vh"
          >
            <div
              class="relative image-container cursor-zoom-in"
              style="width: 100%; height: auto; overflow: hidden"
              @click="openFullscreen"
            >
              <!-- 主圖片 -->
              <img
                ref="imageRef"
                :src="fileUrl || ''"
                alt="圖片預覽"
                class="object-contain max-w-full mx-auto"
              />
            </div>
          </div>
        </div>

        <!-- 放大鏡效果 -->
        <div
          v-if="isHovering && fileType === 'image'"
          class="fixed z-50 pointer-events-none magnifier"
          :style="{
            left: `${magnifierX}px`,
            top: `${magnifierY}px`,
            width: `${magnifierSize}px`,
            height: `${magnifierSize}px`,
            backgroundImage: `url(${fileUrl || ''})`,
            backgroundPosition: `calc(-${
              magnifierX - magnifierSize / 2
            }px * ${zoomLevel} + 50%) calc(-${
              magnifierY - magnifierSize / 2
            }px * ${zoomLevel} + 50%)`,
            backgroundSize: `${zoomLevel * 100}%`,
            backgroundRepeat: 'no-repeat',
          }"
        ></div>

        <!-- 全屏預覽模態框 -->
        <div
          v-if="isFullscreenOpen && fileType === 'image'"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          @click="closeFullscreen"
        >
          <button
            class="absolute z-50 p-2 text-white transition bg-black rounded-full bg-opacity-70 top-4 right-4 hover:bg-opacity-100"
            @click.stop="closeFullscreen"
            style="top: 20px; right: 20px"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div class="relative max-w-full max-h-full p-4">
            <img
              :src="fileUrl || ''"
              class="max-w-full max-h-[90vh] object-contain"
              @click.stop
            />
          </div>
        </div>

        <!-- 影片預覽 -->
        <div v-else-if="fileType === 'video'" class="preview-video">
          <div class="p-4 bg-gray-100 rounded-lg">
            <video
              ref="videoRef"
              controls
              class="w-full rounded shadow-lg"
              :src="fileUrl || ''"
            >
              您的瀏覽器不支援影片標籤。
            </video>
          </div>
        </div>

        <!-- 檔案資訊 -->
        <div v-if="fileInfo" class="p-6 mt-8 bg-white rounded-lg shadow-md">
          <h2 class="mb-4 text-lg font-semibold text-gray-800">檔案資訊</h2>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="info-item">
              <span class="text-gray-500">檔案名稱：</span>
              <span class="text-gray-800">{{ fileInfo.name }}</span>
            </div>
            <div class="info-item">
              <span class="text-gray-500">檔案類型：</span>
              <span class="text-gray-800">{{ fileInfo.type }}</span>
            </div>
            <div class="info-item">
              <span class="text-gray-500">檔案大小：</span>
              <span class="text-gray-800">{{ fileInfo.size }}</span>
            </div>
            <div class="info-item">
              <span class="text-gray-500">上傳時間：</span>
              <span class="text-gray-800">{{ fileInfo.uploadTime }}</span>
            </div>
          </div>
        </div>

        <!-- QR碼資訊 -->
        <div v-if="qrCodeUrl" class="p-6 mt-6 bg-white rounded-lg shadow-md">
          <h2 class="mb-4 text-lg font-semibold text-gray-800">QR碼</h2>
          <div class="flex flex-col items-center">
            <img
              :src="qrCodeUrl"
              alt="QR Code"
              class="max-w-full p-2 border rounded-md max-h-48"
            />
            <button
              @click="downloadQrCode"
              class="px-4 py-2 mt-4 font-medium text-white transition bg-green-500 rounded-md hover:bg-green-600"
            >
              下載QR碼
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiRequest, getApiFileUrl } from '~/utils/api'

// 路由和參數
const route = useRoute()
const router = useRouter()

// 狀態變數
const loading = ref(true)
const error = ref<string | null>(null)
const fileUrl = ref<string | null>(null)
const qrCodeUrl = ref<string | null>(null)
const fileType = ref<'image' | 'video' | null>(null)
const fileInfo = ref<any>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

// 放大鏡相關變數
const isHovering = ref(false)
const magnifierX = ref(0)
const magnifierY = ref(0)
const magnifierSize = ref(150) // 放大鏡尺寸調小
const zoomLevel = ref(2.5) // 放大倍率調整

// 全屏預覽相關
const isFullscreenOpen = ref(false)

// 放大鏡功能
const setupMagnifier = () => {
  if (!imageRef.value) return

  const imageContainer = imageRef.value.parentElement
  if (!imageContainer) return

  imageContainer.addEventListener('mouseenter', () => {
    isHovering.value = true
  })

  imageContainer.addEventListener('mousemove', (e) => {
    if (!imageRef.value || !imageContainer) return

    // 獲取圖片容器相對於視窗的坐標
    const rect = imageContainer.getBoundingClientRect()

    // 滑鼠在視窗中的位置
    magnifierX.value = e.clientX
    magnifierY.value = e.clientY
  })

  imageContainer.addEventListener('mouseleave', () => {
    isHovering.value = false
  })
}

// 全屏預覽功能
const openFullscreen = () => {
  isFullscreenOpen.value = true
}

const closeFullscreen = () => {
  isFullscreenOpen.value = false
}

// 計算屬性
const canFullscreen = computed(() => {
  return fileType.value === 'image' || fileType.value === 'video'
})

// 方法
const fetchFileInfo = async () => {
  loading.value = true
  error.value = null

  try {
    // 從路由參數獲取檔案ID
    const fileId = route.params.id

    if (!fileId) {
      error.value = '無效的檔案ID'
      loading.value = false
      return
    }

    // 從API獲取檔案資訊
    const response = await apiRequest(`api/files/${fileId}`)

    if (!response.ok) {
      throw new Error('無法獲取檔案資訊')
    }

    const data = await response.json()

    // 設置檔案資訊
    fileUrl.value = data.fileUrl
    qrCodeUrl.value = data.qrCodeUrl
    fileType.value = data.fileType
    fileInfo.value = {
      name: data.fileName,
      type: data.fileType === 'image' ? '圖片' : '影片',
      size: formatFileSize(data.fileSize),
      uploadTime: formatDate(data.uploadTime),
    }
  } catch (err) {
    console.error('獲取檔案資訊時發生錯誤:', err)
    error.value = '無法加載檔案，請稍後再試'
  } finally {
    loading.value = false
  }
}

// 格式化檔案大小
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} bytes`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW')
  } catch (e) {
    return dateString
  }
}

// 全螢幕切換
const toggleFullscreen = () => {
  if (fileType.value === 'image') {
    openFullscreen()
  } else if (fileType.value === 'video' && videoRef.value) {
    if (!document.fullscreenElement) {
      videoRef.value.requestFullscreen().catch((err) => {
        console.error(`無法進入全螢幕模式: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }
}

// 添加以下函數到script部分
const downloadFile = (): void => {
  if (!fileUrl.value) return

  // 解析URL獲取檔案ID
  const fileId = fileUrl.value.split('/').pop()
  if (!fileId) return

  // 使用伺服器API進行下載
  const downloadUrl = getApiFileUrl(`/api/download/file/${fileId}`)

  // 使用瀏覽器原生方法打開下載
  window.open(downloadUrl, '_blank')
}

const downloadQrCode = (): void => {
  if (!qrCodeUrl.value) return

  // 解析URL獲取QR碼ID
  const qrId = qrCodeUrl.value.split('/').pop()
  if (!qrId) return

  // 使用伺服器API進行下載
  const downloadUrl = getApiFileUrl(`/api/download/qrcode/${qrId}`)

  // 使用瀏覽器原生方法打開下載
  window.open(downloadUrl, '_blank')
}

// 生命週期鉤子
onMounted(() => {
  // 從URL獲取參數
  if (route.query.fileUrl) {
    fileUrl.value = route.query.fileUrl as string
    // 如果是相對路徑，轉換為完整URL
    if (fileUrl.value.startsWith('/')) {
      fileUrl.value = getApiFileUrl(fileUrl.value)
    }
  }

  if (route.query.qrCodeUrl) {
    qrCodeUrl.value = route.query.qrCodeUrl as string
    // 如果是相對路徑，轉換為完整URL
    if (qrCodeUrl.value.startsWith('/')) {
      qrCodeUrl.value = getApiFileUrl(qrCodeUrl.value)
    }
  }

  if (route.query.fileType) {
    fileType.value = route.query.fileType as 'image' | 'video'
  }

  // 如果有足夠的參數，直接顯示預覽，否則從API獲取
  if (fileUrl.value && fileType.value) {
    // 創建簡單的檔案資訊
    fileInfo.value = {
      name: route.query.fileName || '未知檔案',
      type: fileType.value === 'image' ? '圖片' : '影片',
      size: route.query.fileSize || '未知大小',
      uploadTime: formatDate(new Date().toISOString()),
    }

    // 設置頁面標題和描述
    document.title = `${fileInfo.value.name} - 檔案預覽`

    // 設置meta標籤
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        `預覽${fileInfo.value.type}檔案：${fileInfo.value.name}`
      )
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = `預覽${fileInfo.value.type}檔案：${fileInfo.value.name}`
      document.head.appendChild(meta)
    }

    loading.value = false
  } else if (route.params.id) {
    // 如果有檔案ID但沒有其他參數，從API獲取資訊
    fetchFileInfo()
  } else {
    // 如果沒有足夠的參數
    error.value = '無效的檔案預覽請求'
    loading.value = false
  }

  // 設定放大鏡
  setTimeout(() => {
    setupMagnifier()
  }, 500)
})
</script>

<style scoped>
.preview-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

.preview-image .image-container {
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.info-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.magnifier {
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border: 2px solid white;
  border-radius: 50%;
  background-color: transparent; /* 移除白色背景 */
  overflow: hidden;
}
</style>
