// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxt/image'],
  css: ['~/assets/css/main.css'],

  devServer: {
    port: 4088,
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // 添加運行時配置
  runtimeConfig: {
    // 文件存儲路徑配置 - 開發模式使用public目錄，生產模式使用.output/public目錄
    uploadDir: process.env.UPLOAD_DIR || '.output/public/uploads',
    qrcodesDir: process.env.QRCODES_DIR || '.output/public/qrcodes',
    public: {
      siteUrl:
        process.env.NUXT_PUBLIC_SITE_URL || 'https://qrcode.twhaodai.com',
      apiServerUrl:
        process.env.API_SERVER_URL || 'https://api-qrcode.twhaodai.com',
    },
  },
})
