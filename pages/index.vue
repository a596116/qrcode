<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl px-4 py-8 mx-auto sm:py-12">
      <div class="mb-10 text-center">
        <h1
          class="mb-3 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          簡易QR碼生成器
        </h1>
        <p class="max-w-2xl mx-auto text-lg leading-relaxed text-gray-700">
          上傳圖片或影片，立即獲取QR碼連結，讓分享變得簡單高效！
        </p>
      </div>

      <div class="p-6 mb-8 bg-white shadow-lg rounded-xl sm:p-8">
        <h2 class="mb-6 text-2xl font-semibold text-gray-800">上傳您的檔案</h2>

        <div
          v-if="isProcessing"
          class="flex flex-col items-center justify-center py-12"
        >
          <div
            class="w-16 h-16 mb-4 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"
          ></div>
          <p class="text-lg text-gray-600">上傳中，請稍候...</p>
        </div>

        <div
          v-else-if="error"
          class="p-4 mb-6 border-l-4 border-red-500 bg-red-50"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="w-5 h-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">錯誤</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="space-y-6">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div class="space-y-4">
                <label
                  for="file"
                  class="block mb-1 text-sm font-medium text-gray-700"
                  >選擇檔案</label
                >
                <div
                  class="flex flex-col items-center justify-center p-6 transition border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-purple-500 bg-gray-50"
                  @click="
                    () => {
                      if (fileInput) fileInput.click()
                    }
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-12 h-12 mb-3 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label
                      for="file-upload"
                      class="relative font-medium text-purple-600 rounded-md cursor-pointer hover:text-purple-500"
                    >
                      <span>點擊上傳檔案</span>
                      <input
                        id="file"
                        ref="fileInput"
                        type="file"
                        class="sr-only"
                        accept="image/*,video/*"
                        @change="handleFileChange"
                      />
                    </label>
                    <p class="pl-1">或拖放至此</p>
                  </div>
                  <p class="mt-2 text-xs text-gray-500">
                    支援的檔案格式: 圖片 (PNG, JPG, GIF)、影片 (MP4, WEBM)
                  </p>
                  <p class="mt-1 text-xs text-gray-500">
                    檔案大小限制: 圖片 10MB、影片 100MB
                  </p>
                </div>
              </div>

              <div v-if="selectedFile" class="space-y-4">
                <h3 class="text-sm font-medium text-gray-700">檔案預覽</h3>
                <div
                  class="flex items-center justify-center p-2 overflow-hidden bg-gray-100 border border-gray-200 rounded-lg"
                  style="min-height: 200px"
                >
                  <img
                    v-if="fileType === 'image'"
                    :src="filePreview!"
                    class="max-w-full rounded max-h-60"
                  />
                  <video
                    v-else-if="fileType === 'video'"
                    :src="filePreview!"
                    controls
                    class="max-w-full rounded max-h-60"
                  ></video>
                  <div v-else class="p-4 text-center">
                    <p class="text-gray-500">無法預覽此檔案類型</p>
                  </div>
                </div>
                <div class="flex items-center text-sm text-gray-700">
                  <span class="mr-2 font-medium">檔案名稱:</span>
                  {{ selectedFile.name }}
                </div>
                <div class="flex items-center text-sm text-gray-700">
                  <span class="mr-2 font-medium">檔案大小:</span>
                  {{ fileSizeFormatted }}
                </div>
              </div>
            </div>

            <div v-if="selectedFile" class="pt-4">
              <button
                v-if="!(qrCodeUrl && fileUrl)"
                @click="uploadFile"
                class="w-full px-6 py-3 font-medium text-white transition-all duration-300 transform rounded-lg shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 md:w-auto hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isProcessing || !selectedFile"
              >
                <span class="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  上傳並生成QR碼
                </span>
              </button>
              <div
                v-else
                class="flex items-center justify-start text-sm text-green-600 animate-pulse"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                上傳成功！您可以使用下方的「上傳另一個檔案」按鈕繼續上傳。
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="qrCodeUrl && fileUrl"
          class="pt-6 mt-8 border-t border-gray-200"
        >
          <h3 class="mb-4 text-lg font-semibold text-gray-800">上傳成功！</h3>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 class="mb-2 font-medium text-gray-700">檔案連結</h4>
              <div class="flex items-center">
                <input
                  type="text"
                  readonly
                  :value="fullFileUrl"
                  class="block w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                  @click="copyLinkToClipboard(fullFileUrl)"
                  class="px-3 py-2 ml-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  :class="{ 'bg-green-100 text-green-600': fileUrlCopied }"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    v-if="!fileUrlCopied"
                  >
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path
                      d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    v-else
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div class="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 class="mb-2 font-medium text-gray-700">QR碼連結</h4>
              <div class="flex items-center">
                <input
                  type="text"
                  readonly
                  :value="fullQrCodeUrl"
                  class="block w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                  @click="copyLinkToClipboard(fullQrCodeUrl)"
                  class="px-3 py-2 ml-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  :class="{ 'bg-green-100 text-green-600': qrUrlCopied }"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    v-if="!qrUrlCopied"
                  >
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path
                      d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    v-else
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
            <div class="flex flex-col items-center">
              <h4 class="mb-3 font-medium text-gray-700">下載QR碼</h4>
              <div
                class="p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <img :src="qrCodeUrl" alt="QR Code" class="w-48 h-48 mx-auto" />
                <a
                  :href="qrCodeUrl"
                  download
                  class="flex items-center justify-center px-4 py-2 mt-3 text-sm text-white transition bg-purple-600 rounded-md hover:bg-purple-700"
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
                </a>
              </div>
            </div>

            <div class="flex flex-col">
              <h4 class="mb-3 font-medium text-gray-700">可掃描此QR碼</h4>
              <div
                class="flex flex-col justify-center flex-1 p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <p class="mb-2 text-gray-600">
                  使用您的智能手機相機掃描左側的QR碼，以便直接訪問您的文件。
                </p>
                <p class="mb-4 text-gray-600">
                  或者，您可以分享QR碼連結給他人，讓他們可以快速訪問您的檔案。
                </p>
                <button
                  @click="resetForm"
                  class="flex items-center justify-center w-full px-4 py-2 mt-auto text-sm text-gray-700 transition bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  上傳另一個檔案
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-4 mt-8 text-sm text-gray-600 border-t border-gray-200">
        <p class="text-center">
          上傳的檔案將存儲在服務器上，QR碼將連結到上傳的檔案。
        </p>
        <div class="flex justify-center mt-6">
          <NuxtLink
            to="/manage"
            class="flex items-center px-10 py-4 text-base font-semibold text-white transition-all duration-300 transform rounded-lg shadow-lg bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 hover:shadow-2xl hover:-translate-y-1 animate-pulse hover:animate-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            查看管理檔案和QR碼
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

useSeoMeta({
  title: '圖片/影片轉QR碼工具',
  description: '上傳圖片或影片，生成QR碼，方便分享和訪問',
})

const router = useRouter()
const selectedFile = ref<File | null>(null)
const filePreview = ref<string | null>(null)
const fileType = ref<string | null>(null)
const qrCodeUrl = ref<string | null>(null)
const fileUrl = ref<string | null>(null)
const error = ref<string | null>(null)
const resultMessage = ref<string | null>(null)
const isProcessing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const fileUrlCopied = ref(false)
const qrUrlCopied = ref(false)
const previewUrlCopied = ref(false)

// 引入heic2any套件
let heic2any: any = null

// 在客戶端環境中導入heic2any
onMounted(() => {
  if (process.client) {
    import('heic2any').then((module) => {
      heic2any = module.default
    })
  }
})

const fullFileUrl = computed(() => {
  if (!fileUrl.value) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}${fileUrl.value}`
})

const fullQrCodeUrl = computed(() => {
  if (!qrCodeUrl.value) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}${qrCodeUrl.value}`
})

const fullPreviewUrl = computed(() => {
  if (!fileUrl.value) return ''
  const baseUrl = window.location.origin
  const previewPath = fileUrl.value.replace('/file/', '/preview/')
  return `${baseUrl}${previewPath}`
})

const fileSizeFormatted = computed(() => {
  if (!selectedFile.value) return ''
  return formatFileSize(selectedFile.value.size)
})

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const copyLinkToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)

    if (text === fullFileUrl.value) {
      fileUrlCopied.value = true
      setTimeout(() => {
        fileUrlCopied.value = false
      }, 2000)
    } else if (text === fullQrCodeUrl.value) {
      qrUrlCopied.value = true
      setTimeout(() => {
        qrUrlCopied.value = false
      }, 2000)
    } else if (text === fullPreviewUrl.value) {
      previewUrlCopied.value = true
      setTimeout(() => {
        previewUrlCopied.value = false
      }, 2000)
    }
  } catch (err) {
    console.error('無法複製到剪貼簿：', err)
    alert('複製失敗，請手動複製。')
  }
}

const handleFileChange = (event: Event): void => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) {
    return
  }

  const file = input.files[0]
  selectedFile.value = file
  error.value = null
  resultMessage.value = null
  qrCodeUrl.value = null
  fileUrl.value = null
  fileUrlCopied.value = false
  qrUrlCopied.value = false
  previewUrlCopied.value = false

  // 檢查是否為圖片類型
  const isImageType = (fileType: string): boolean => {
    // 檢查MIME類型
    if (fileType.startsWith('image/')) return true

    // 檢查檔案副檔名
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    return ['heic', 'avif'].includes(extension)
  }

  if (isImageType(file.type)) {
    fileType.value = 'image'
    if (file.size > 10 * 1024 * 1024) {
      error.value = '圖片大小不能超過 10MB'
      selectedFile.value = null
      return
    }
  } else if (file.type.startsWith('video/')) {
    fileType.value = 'video'
    if (file.size > 100 * 1024 * 1024) {
      error.value = '影片大小不能超過 100MB'
      selectedFile.value = null
      return
    }
  } else {
    error.value = '不支援的檔案類型，請上傳圖片或影片'
    selectedFile.value = null
    return
  }

  createFilePreview(file)
}

const createFilePreview = (file: File): void => {
  // 檢查是否為HEIC檔案
  const isHeic =
    file.type === 'image/heic' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heif')

  if (isHeic && heic2any) {
    // 如果是HEIC檔案，先轉換為JPEG
    heic2any({ blob: file, toType: 'image/jpeg' })
      .then((convertedBlob: Blob) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            filePreview.value = e.target.result
          }
        }
        reader.onerror = () => {
          error.value = '讀取檔案時發生錯誤'
        }
        reader.readAsDataURL(convertedBlob)
      })
      .catch((err: Error) => {
        console.error('轉換HEIC檔案失敗：', err)
        error.value = '無法預覽HEIC檔案，但仍可上傳'
      })
  } else {
    // 一般檔案直接讀取
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        filePreview.value = e.target.result
      }
    }
    reader.onerror = () => {
      error.value = '讀取檔案時發生錯誤'
    }
    reader.readAsDataURL(file)
  }
}

const uploadFile = async (): Promise<void> => {
  if (!selectedFile.value) {
    error.value = '請選擇檔案'
    return
  }

  isProcessing.value = true
  error.value = null
  resultMessage.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    if (fileType.value) {
      formData.append('fileType', fileType.value)
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || '上傳失敗')
    }

    // 設定 URL
    if (data.qrCodeUrl) {
      qrCodeUrl.value = data.qrCodeUrl || ''
    }

    if (data.fileUrl) {
      fileUrl.value = data.fileUrl || ''
    }

    resultMessage.value = '檔案上傳成功，已生成QR碼！'
  } catch (err) {
    console.error('上傳錯誤：', err)
    error.value = err instanceof Error ? err.message : '上傳過程中發生錯誤'
  } finally {
    isProcessing.value = false
  }
}

const goToPreview = (): void => {
  if (!fullPreviewUrl.value) return
  window.open(fullPreviewUrl.value, '_blank')
}

const resetForm = (): void => {
  selectedFile.value = null
  fileType.value = null
  filePreview.value = null
  error.value = null
  resultMessage.value = null
  qrCodeUrl.value = null
  fileUrl.value = null
  fileUrlCopied.value = false
  qrUrlCopied.value = false
  previewUrlCopied.value = false

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f9fafb;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23a78bfa' fill-opacity='0.07'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.min-h-screen {
  animation: gradient-shift 15s ease infinite;
  background-size: 400% 400%;
}
</style>
