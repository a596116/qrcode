/**
 * API請求工具，使用環境變數中配置的API服務器URL
 */

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiServerUrl

  // 確保endpoint以/開頭
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`

  // 建立完整的API URL
  const url = `${apiBaseUrl}${normalizedEndpoint}`

  // 執行請求
  try {
    const response = await fetch(url, options)
    return response
  } catch (error) {
    console.error(`API請求錯誤 (${url}):`, error)
    throw error
  }
}

/**
 * 獲取API文件URL
 * @param path 文件路徑
 * @returns 完整的文件URL
 */
export function getApiFileUrl(path: string): string {
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiServerUrl

  // 確保path以/開頭
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${apiBaseUrl}${normalizedPath}`
}
