export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.$pinia.use(({ store }) => {
    if (store.$id === 'products' || store.$id === 'orders' || store.$id === 'topDeals' || store.$id === 'banners' || store.$id === 'sliders' || store.$id === 'blog' || store.$id === 'settings' || store.$id === 'toast' || store.$id === 'faq' || store.$id === 'logs' || store.$id === 'registeredUsers' || store.$id === 'categories') return
    const key = `pinia:${store.$id}`

    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        store.$patch(parsed)
      }
    } catch {}

    store.$subscribe((_mutation, state) => {
      try {
        localStorage.setItem(key, JSON.stringify(state))
      } catch {}
    })
  })
})
