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
    // 默認使用項目根目錄下的public目錄
    uploadDir: process.env.UPLOAD_DIR || 'public/uploads',
    qrcodesDir: process.env.QRCODES_DIR || 'public/qrcodes',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
    },
  },
})
