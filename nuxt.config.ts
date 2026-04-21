// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },
  pinia: {
    storesDirs: ['./stores/**'],
  },
  css: ['./assets/css/main.css'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  sourcemap: {
    client: false,
    server: false
  },
  typescript: {
    strict: true
  },
  devServer: {
    port: 3000,
    host: 'localhost'
  },
  vite: {
    build: {
      modulePreload: {
        polyfill: false
      }
    },
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'swiper/vue',
        'swiper/modules',
        'lucide-vue-next',
      ]
    }
  }
})
