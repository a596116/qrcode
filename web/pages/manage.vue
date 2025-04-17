<template>
  <div class="container p-2 mx-auto">
    <div class="relative flex items-center mb-8">
      <h1
        class="w-full text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-700"
      >
        檔案管理
      </h1>
    </div>

    <div class="max-w-5xl p-6 mx-auto bg-white rounded-lg shadow-lg">
      <!-- 頁面說明 -->
      <div
        class="p-4 mb-6 text-sm text-indigo-700 border-l-4 border-indigo-500 alert bg-indigo-50"
      >
        <p><strong>說明：</strong></p>
        <ul class="pl-5 mt-1 list-disc">
          <li>此頁面顯示所有已上傳的檔案和生成的QR碼</li>
          <li>您可以下載檔案和QR碼，或刪除不再需要的記錄</li>
          <li>刪除檔案或QR碼後無法復原，請謹慎操作</li>
        </ul>
      </div>

      <!-- 載入中狀態 -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-12"
      >
        <div
          class="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"
        ></div>
        <p class="mt-4 text-gray-600">載入中，請稍候...</p>
      </div>

      <!-- 錯誤訊息 -->
      <div
        v-if="error"
        class="px-4 py-3 mt-4 text-red-700 bg-red-100 border border-red-400 rounded-md"
      >
        {{ error }}
      </div>

      <!-- 操作結果訊息 -->
      <div
        v-if="resultMessage"
        class="px-4 py-3 mt-4 text-blue-700 bg-blue-100 border border-blue-400 rounded-md"
      >
        {{ resultMessage }}
      </div>

      <!-- 空狀態 -->
      <div
        v-if="!loading && !error && combinedItems.length === 0"
        class="py-12 text-center"
      >
        <p class="text-lg text-gray-500">目前沒有任何上傳的檔案</p>
      </div>

      <!-- 檔案與QR碼列表 -->
      <div
        v-if="!loading && combinedItems.length > 0 && dataProcessed"
        class="mt-8"
      >
        <h2 class="mb-4 text-xl font-semibold">
          所有檔案與QR碼 ({{ combinedItems.length }})
        </h2>

        <!-- 檔案卡片列表 -->
        <div class="grid grid-cols-1 gap-6">
          <div
            v-for="item in combinedItems"
            :key="item.id"
            class="overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg"
          >
            <div class="p-4 sm:p-6">
              <!-- 檔案信息和QR碼 -->
              <div
                class="flex flex-col md:flex-row md:items-start md:justify-between"
              >
                <!-- 檔案信息部分 -->
                <div class="flex-grow md:pr-6">
                  <div class="flex items-start">
                    <div class="flex-shrink-0 mr-4">
                      <div
                        v-if="item.fileType === 'image'"
                        class="relative w-24 h-24 overflow-hidden rounded-md"
                      >
                        <ClientOnly>
                          <img
                            :src="
                              item.processedImagePath || item.filePath || ''
                            "
                            class="object-contain w-full h-full"
                            @error="
                              item.processedImagePath =
                                '/images/broken-image.svg'
                            "
                          />
                        </ClientOnly>
                        <div
                          class="absolute inset-0 flex items-center justify-center transition-opacity bg-black bg-opacity-0 rounded-md opacity-0 hover:opacity-100 hover:bg-opacity-20"
                        >
                          <a
                            :href="item.filePath || ''"
                            target="_blank"
                            class="p-1 text-white bg-blue-600 rounded-full"
                            title="查看檔案"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="w-5 h-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fill-rule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                      <div
                        v-else-if="item.fileType === 'video'"
                        class="relative flex items-center justify-center w-24 h-24 bg-blue-100 rounded-md"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-8 h-8 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"
                          />
                        </svg>
                        <div
                          v-if="item.filePath"
                          class="absolute inset-0 flex items-center justify-center transition-opacity bg-black bg-opacity-0 rounded-md opacity-0 hover:opacity-100 hover:bg-opacity-20"
                        >
                          <a
                            :href="item.filePath || ''"
                            target="_blank"
                            class="p-1 text-white bg-blue-600 rounded-full"
                            title="查看影片"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="w-5 h-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fill-rule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                      <div
                        v-else
                        class="relative flex items-center justify-center w-24 h-24 bg-gray-100 rounded-md"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-8 h-8 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        <div
                          v-if="item.filePath"
                          class="absolute inset-0 flex items-center justify-center transition-opacity bg-black bg-opacity-0 rounded-md opacity-0 hover:opacity-100 hover:bg-opacity-20"
                        >
                          <a
                            :href="item.filePath || ''"
                            target="_blank"
                            class="p-1 text-white bg-blue-600 rounded-full"
                            title="查看檔案"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="w-5 h-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fill-rule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 class="text-lg font-medium text-gray-900">
                        {{ item.originalFileName || '獨立QR碼' }}
                      </h3>
                      <p class="mt-1 text-sm text-gray-500">
                        <template v-if="item.originalFileName && item.fileSize">
                          {{ formatFileSize(item.fileSize) }} · 上傳於
                          {{ formatDate(item.created) }}
                        </template>
                        <template v-else>
                          建立於 {{ formatDate(item.created) }}
                        </template>
                      </p>
                      <p class="mt-1 text-xs text-gray-500 truncate">
                        ID: {{ item.id }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- QR碼圖片 -->
                <div class="flex-shrink-0 mt-4 md:mt-0 md:ml-6">
                  <div v-if="item.qrCodePath" class="relative">
                    <img
                      :src="item.qrCodePath"
                      alt="QR碼"
                      class="object-cover w-40 h-40 border border-gray-200 rounded-md"
                    />
                    <div
                      class="absolute inset-0 flex items-center justify-center transition-opacity bg-black bg-opacity-0 rounded-md opacity-0 hover:opacity-100 hover:bg-opacity-20"
                    >
                      <a
                        :href="item.qrCodePath"
                        target="_blank"
                        class="p-1 text-white bg-blue-600 rounded-full"
                        title="查看QR碼"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-5 h-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fill-rule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div
                    v-else
                    class="flex items-center justify-center w-40 h-40 bg-gray-100 rounded-md"
                  >
                    <span class="text-xs text-gray-400">無關聯QR碼</span>
                  </div>
                </div>
              </div>

              <!-- 操作按鈕 -->
              <div
                class="flex flex-wrap items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-100"
              >
                <a
                  v-if="item.filePath"
                  :href="item.filePath || ''"
                  target="_blank"
                  class="inline-flex items-center px-3 py-1.5 text-sm rounded-md transition-all duration-300 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fill-rule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  查看檔案
                </a>
                <button
                  @click="downloadFile(item.filePath)"
                  class="inline-flex items-center px-3 py-1.5 text-sm rounded-md transition-all duration-300 border border-blue-600 text-blue-600 hover:bg-blue-50 hover:shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  下載檔案
                </button>
                <button
                  @click="downloadQrCode(item.qrCodePath)"
                  class="inline-flex items-center px-3 py-1.5 text-sm rounded-md transition-all duration-300 border border-purple-600 text-purple-600 hover:bg-purple-50 hover:shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  下載QR碼
                </button>
                <button
                  @click="deleteItem(item)"
                  class="inline-flex items-center px-3 py-1.5 text-sm rounded-md transition-all duration-300 border border-red-600 text-red-600 hover:bg-red-50 hover:shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 刪除確認對話框 -->
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      >
        <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
          <h3 class="text-lg font-medium text-gray-900">確認刪除</h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">
              您確定要刪除這個記錄嗎？此操作無法撤銷。
            </p>

            <div
              class="p-3 mt-3 border-l-4 border-indigo-500 rounded bg-indigo-50"
            >
              <p class="text-sm font-medium text-indigo-700">
                系統將自動同時刪除關聯的檔案和QR碼，確保資源完整清理。
              </p>
            </div>

            <div
              v-if="itemToDelete && itemToDelete.originalFileName"
              class="mt-3 text-sm text-gray-600"
            >
              <span class="font-medium">檔案名稱: </span
              >{{ itemToDelete.originalFileName }}
            </div>
          </div>

          <div class="flex justify-end mt-6 space-x-3">
            <button
              @click="cancelDelete"
              class="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
            >
              取消
            </button>
            <button
              @click="confirmDelete"
              class="px-4 py-2 text-sm font-medium text-white transition-colors border border-transparent rounded-md bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              確認刪除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClientOnly } from '#components'
import { ref, onMounted, computed, watch } from 'vue'
import { apiRequest, getApiFileUrl } from '~/utils/api'

// 頁面元數據
useSeoMeta({
  title: '檔案管理 - QR碼工具',
  description: '管理已上傳的檔案和生成的QR碼',
})

// HEIC處理相關
let heic2any: any = null

// 狀態變數
const loading = ref(true)
const error = ref<string | null>(null)
const resultMessage = ref<string | null>(null)
const rawFiles = ref<any[]>([])
const rawQrCodes = ref<any[]>([])
const dataProcessed = ref(false)

// 刪除相關狀態
const showDeleteConfirm = ref(false)
const deleteRelated = ref<boolean>(true)
const itemToDelete = ref<any>(null)

// 定義檔案和QR碼的類型
interface FileItem {
  id: number
  originalFileName: string
  path: string
  size: number
  created: string
  qrCode?: any // 添加qrCode屬性
}

interface QrCodeItem {
  id: number
  path: string
  created: string
}

// 定義組合後項目的類型
interface CombinedItem {
  id: number
  originalFileName: string
  filePath: string | null
  fileSize: number | null
  qrCodeId: number | null
  qrCodePath: string | null
  created: string
  fileType: string | null
  processedImagePath?: string // 添加處理後的圖片路徑屬性
}

const files = ref<FileItem[]>([])
const qrCodes = ref<QrCodeItem[]>([])

// 獲取檔案和QR碼列表
const fetchItems = async () => {
  loading.value = true
  error.value = null
  resultMessage.value = null

  try {
    const response = await apiRequest('api/files')
    const data = await response.json()

    if (data.success) {
      rawFiles.value = data.files || []
      rawQrCodes.value = data.qrCodes || []
    } else {
      error.value = data.error || '獲取檔案列表失敗'
    }
  } catch (err) {
    console.error('獲取檔案列表時發生錯誤:', err)
    error.value = '無法連接到伺服器'
  } finally {
    loading.value = false
  }
}

// 格式化檔案大小
const formatFileSize = (bytes: number) => {
  if (!bytes || bytes < 0) return '0 bytes'
  if (bytes < 1024) return `${bytes} bytes`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// 格式化日期
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW')
  } catch (e) {
    return dateString || '-'
  }
}

// 檢查並處理HEIC圖片
const processHeicImage = async (url: string): Promise<string> => {
  if (!url) return url

  // 檢查是否為HEIC格式
  const isHeic =
    url.toLowerCase().includes('.heic') || url.toLowerCase().includes('/heic')

  if (isHeic && heic2any && process.client) {
    try {
      // 獲取完整URL
      const fullUrl = getApiFileUrl(url)

      // 獲取HEIC檔案內容
      const response = await fetch(fullUrl)
      const blob = await response.blob()

      // 轉換HEIC為JPEG
      const convertedBlob = await heic2any({
        blob: blob,
        toType: 'image/jpeg',
      })

      // 創建新的URL
      return URL.createObjectURL(convertedBlob)
    } catch (error) {
      console.error('轉換HEIC錯誤:', error)
      return url // 如果失敗，返回原始URL
    }
  }

  return url
}

// 組合檔案和QR碼到單一列表
const combinedItems = computed(() => {
  // 判斷是否有數據
  if (!rawFiles.value || !rawQrCodes.value) return []

  // 這裡保存全部要顯示的綜合數據
  const combinedList: CombinedItem[] = []

  // 使用兩個 Map 來存儲文件和QR碼對應的隨機碼
  const randomCodeToFileMap = new Map<string, any>()
  const randomCodeToQrCodeMap = new Map<string, any>()

  // 使用此集合來跟踪已經處理過的QR碼ID
  const usedQrCodeIds = new Set<number>()

  // 重置處理陣列
  files.value = []
  qrCodes.value = []

  // 從檔案中提取亂碼部分
  for (const file of rawFiles.value) {
    let randomCode = null

    // 提取檔案名中的亂碼部分
    if (file.name) {
      const prefixMatch = file.name.match(
        /^(image|video|file)-(.+?)(\.[^.]+)?$/
      )
      if (prefixMatch) {
        // 檔案名格式為：prefix-{亂碼}
        randomCode = prefixMatch[2] // 第二個捕獲組是亂碼部分
      } else if (
        file.name.startsWith('image') ||
        file.name.startsWith('video')
      ) {
        // 舊格式支援：image{亂碼} 或 video{亂碼}
        const prefix = file.name.startsWith('image') ? 'image' : 'video'
        randomCode = file.name.substring(prefix.length)
      }

      // 如果找到亂碼，添加到映射
      if (randomCode) {
        randomCodeToFileMap.set(randomCode, file)
      }
    }

    // 保留原有的ID索引
    files.value.push({
      id: file.id,
      originalFileName: file.originalFileName || file.name,
      path: file.path,
      size: file.size,
      created: file.created,
      qrCode: file.qrCode,
    })
  }

  // 從QR碼提取亂碼部分
  for (const qrCode of rawQrCodes.value) {
    let randomCode = null

    // 提取QR碼名中的亂碼部分
    if (qrCode.path) {
      const pathParts = qrCode.path.split('/')
      const fileName = pathParts[pathParts.length - 1]

      if (fileName && fileName.startsWith('qrcode-')) {
        // QR碼名格式為：qrcode-{亂碼}
        randomCode = fileName.substring('qrcode-'.length).split('.')[0]
      } else if (fileName && fileName.startsWith('qrcode')) {
        // 舊格式支援：qrcode{亂碼}
        randomCode = fileName.substring('qrcode'.length).split('.')[0]
      }

      // 如果找到亂碼，添加到映射
      if (randomCode) {
        randomCodeToQrCodeMap.set(randomCode, qrCode)
      }
    }

    // 保留原有的ID索引
    qrCodes.value.push({
      id: qrCode.id,
      path: qrCode.path,
      created: qrCode.created,
    })
  }

  // 2. 使用亂碼關聯組合檔案和QR碼
  // 先處理所有檔案
  for (const file of files.value) {
    let matchedQrCode = null
    let randomCode = null

    // 查看原始檔案中是否已關聯QR碼
    const originalFile = rawFiles.value.find((f) => f.id === file.id)
    if (originalFile && originalFile.qrCode) {
      matchedQrCode = originalFile.qrCode
    } else {
      // 提取檔案中的亂碼
      if (file.originalFileName) {
        const prefixMatch = file.originalFileName.match(
          /^(image|video|file)-(.+?)(\.[^.]+)?$/
        )
        if (prefixMatch) {
          // 檔案名格式為：prefix-{亂碼}
          randomCode = prefixMatch[2] // 第二個捕獲組是亂碼部分
        } else if (
          file.originalFileName.startsWith('image') ||
          file.originalFileName.startsWith('video')
        ) {
          // 舊格式支援：image{亂碼} 或 video{亂碼}
          const prefix = file.originalFileName.startsWith('image')
            ? 'image'
            : 'video'
          randomCode = file.originalFileName.substring(prefix.length)
        }
      }

      // 根據檔案路徑提取亂碼
      if (!randomCode && file.path) {
        const pathParts = file.path.split('/')
        const fileName = pathParts[pathParts.length - 1]

        const prefixMatch = fileName.match(
          /^(image|video|file)-(.+?)(\.[^.]+)?$/
        )
        if (prefixMatch) {
          randomCode = prefixMatch[2]
        }
      }

      // 尋找對應的QR碼 (優先使用亂碼匹配)
      if (randomCode && randomCodeToQrCodeMap.has(randomCode)) {
        // 方法1: 使用亂碼匹配
        matchedQrCode = randomCodeToQrCodeMap.get(randomCode)
      } else if (qrCodes.value.find((qr) => qr.id === file.id)) {
        // 方法3: ID完全相同
        matchedQrCode = qrCodes.value.find((qr) => qr.id === file.id)
      } else {
        // 方法4: 其他匹配方法（保留原先邏輯）
        for (const qrCode of qrCodes.value) {
          // 如果QR碼ID包含在文件名中
          if (
            file.originalFileName &&
            file.originalFileName.includes(qrCode.id.toString())
          ) {
            matchedQrCode = qrCode
            break
          }
        }
      }
    }

    // 根據檔案名判斷檔案類型
    const getFileTypeFromName = (fileName: string): string | null => {
      if (!fileName) return null

      // 從原始檔案取得類型
      const originalFile = rawFiles.value.find((f) => f.id === file.id)
      if (originalFile && originalFile.type) {
        return originalFile.type
      }

      // 檢查前綴-亂碼格式
      if (fileName.match(/^image-/)) return 'image'
      if (fileName.match(/^video-/)) return 'video'

      // 檢查舊的格式
      if (fileName.startsWith('image')) return 'image'
      if (fileName.startsWith('video')) return 'video'

      // 檢查副檔名
      if (fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image'
      if (fileName.match(/\.(mp4|webm|ogg|mov|avi)$/i)) return 'video'

      return 'other'
    }

    // 從ID或路徑中提取檔案名
    const getFileName = (id: string | number, path?: string): string => {
      if (typeof id === 'string' && id.includes('.')) return id
      if (path) {
        const parts = path.split('/')
        return parts[parts.length - 1]
      }
      return String(id)
    }

    // 添加組合項目
    const combinedItem = {
      id: file.id,
      originalFileName: file.originalFileName,
      filePath: file.path,
      fileSize: file.size,
      created: file.created,
      qrCodeId: matchedQrCode?.id || null,
      qrCodePath: matchedQrCode?.path || null,
      fileType: getFileTypeFromName(getFileName(file.id, file.path)),
    }

    // 如果找到匹配的QR碼，標記為已使用
    if (matchedQrCode) {
      usedQrCodeIds.add(matchedQrCode.id)
    }

    combinedList.push(combinedItem)
  }

  // 3. 處理剩餘的QR碼（檢查是否有根據亂碼可關聯的檔案）
  for (const qrCode of qrCodes.value) {
    if (!usedQrCodeIds.has(qrCode.id)) {
      let matchedFile: FileItem | null = null
      let randomCode: string | null = null

      // 提取QR碼中的亂碼
      if (qrCode.path) {
        const pathParts = qrCode.path.split('/')
        const fileName = pathParts[pathParts.length - 1]

        if (fileName && fileName.startsWith('qrcode-')) {
          randomCode = fileName.substring('qrcode-'.length).split('.')[0]
        } else if (fileName && fileName.startsWith('qrcode')) {
          randomCode = fileName.substring('qrcode'.length).split('.')[0]
        }
      }

      // 檢查是否有檔案與此QR碼有相同的亂碼
      if (randomCode && randomCodeToFileMap.has(randomCode)) {
        matchedFile = randomCodeToFileMap.get(randomCode) || null

        // 如果找到匹配的檔案，更新已存在的組合項
        if (matchedFile) {
          const existingItemIndex = combinedList.findIndex(
            (item) => item.id === matchedFile!.id
          )
          if (existingItemIndex !== -1) {
            combinedList[existingItemIndex].qrCodeId = qrCode.id
            combinedList[existingItemIndex].qrCodePath = qrCode.path
            usedQrCodeIds.add(qrCode.id)
            continue // 跳過創建新項目
          }
        }
      }

      // 添加獨立QR碼項目
      combinedList.push({
        id: qrCode.id,
        originalFileName: '', // 使用空字串而非 null
        filePath: null,
        fileSize: null,
        created: qrCode.created,
        qrCodeId: qrCode.id,
        qrCodePath: qrCode.path,
        fileType: null,
      })
    }
  }

  console.log('生成的組合項目數:', combinedList.length)
  return combinedList
})

// 處理HEIC圖片預覽
const processHeicImages = async () => {
  if (!combinedItems.value || combinedItems.value.length === 0 || !heic2any)
    return

  for (const item of combinedItems.value) {
    if (item.fileType === 'image' && item.filePath) {
      // 檢查是否為HEIC檔案
      const isHeic =
        item.originalFileName?.toLowerCase().endsWith('.heic') ||
        item.originalFileName?.toLowerCase().endsWith('.heif') ||
        item.filePath.toLowerCase().includes('.heic') ||
        item.filePath.toLowerCase().includes('.heif')

      if (isHeic) {
        // 添加處理後的圖片路徑屬性
        item.processedImagePath = await processHeicImage(item.filePath)
      }
    }
  }

  dataProcessed.value = true
}

// 刪除項目
const deleteItem = (item: CombinedItem) => {
  itemToDelete.value = item
  showDeleteConfirm.value = true
}

// 取消刪除
const cancelDelete = () => {
  showDeleteConfirm.value = false
  itemToDelete.value = null
}

// 確認刪除
const confirmDelete = async () => {
  if (!itemToDelete.value) return

  try {
    loading.value = true
    showDeleteConfirm.value = false

    // 準備API所需的參數
    let fileId = ''
    let fileType = 'upload'

    // 打印詳細的刪除信息
    console.log('開始刪除項目:', itemToDelete.value)

    if (
      itemToDelete.value.qrCodePath &&
      (!itemToDelete.value.filePath || !itemToDelete.value.originalFileName)
    ) {
      // 這是只有QR碼的情況
      const qrCodePath = itemToDelete.value.qrCodePath
      fileId = qrCodePath.split('/').pop() || ''
      fileType = 'qrcode'
      console.log('準備刪除QR碼:', {
        qrCodePath: qrCodePath,
        fileId: fileId,
        itemDetails: itemToDelete.value,
      })
    } else if (itemToDelete.value.filePath) {
      // 這是有檔案的情況
      const filePath = itemToDelete.value.filePath
      fileId = filePath.split('/').pop() || ''
      fileType = 'upload'
      console.log('準備刪除檔案:', {
        filePath: filePath,
        fileId: fileId,
        hasQrCode: !!itemToDelete.value.qrCodePath,
        qrCodePath: itemToDelete.value.qrCodePath,
        itemDetails: itemToDelete.value,
      })
    } else {
      // 處理異常情況
      console.error('刪除錯誤: 無法確定要刪除的檔案信息', itemToDelete.value)
      error.value = '無法確定要刪除的檔案信息'
      loading.value = false
      return
    }

    const payload = {
      fileId: fileId,
      fileType: fileType,
      deleteRelated: true,
    }

    console.log('發送刪除請求:', payload)

    const response = await apiRequest('api/files/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    console.log('刪除結果:', result)

    if (result.success) {
      resultMessage.value = result.deletedRelated
        ? `記錄刪除成功 (關聯項目已一併刪除)`
        : `記錄刪除成功`

      // 重新獲取列表
      await fetchItems()
    } else {
      console.error('刪除失敗:', result.error)
      error.value = result.error || '刪除失敗'
    }
  } catch (err) {
    console.error('刪除檔案時發生錯誤:', err)
    error.value = '操作過程中發生錯誤'
  } finally {
    loading.value = false
    itemToDelete.value = null
  }
}

// 在頁面加載後處理HEIC圖片
onNuxtReady(async () => {
  await fetchItems()
  // 數據加載後處理HEIC圖片
  if (import.meta.client) {
    import('heic2any').then((module) => {
      heic2any = module.default
      processHeicImages()
    })
  }
})

watch(
  combinedItems,
  () => {
    if (combinedItems.value.length > 0) {
      processHeicImages()
    }
  },
  { immediate: true }
)

// 添加以下函數到script部分
const downloadFile = (filePath: string): void => {
  if (!filePath) return

  // 解析URL獲取檔案ID
  const fileId = filePath.split('/').pop()
  if (!fileId) return

  // 使用伺服器API進行下載
  const downloadUrl = getApiFileUrl(`/api/download/file/${fileId}`)

  // 使用瀏覽器原生方法打開下載
  window.open(downloadUrl, '_blank')
}

const downloadQrCode = (qrPath: string): void => {
  if (!qrPath) return

  // 解析URL獲取QR碼ID
  const qrId = qrPath.split('/').pop()
  if (!qrId) return

  // 使用伺服器API進行下載
  const downloadUrl = getApiFileUrl(`/api/download/qrcode/${qrId}`)

  // 使用瀏覽器原生方法打開下載
  window.open(downloadUrl, '_blank')
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>
