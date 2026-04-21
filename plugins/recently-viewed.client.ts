export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const currentRoute = useRoute()

  const record = (id: number) => {
    if (!Number.isFinite(id) || id <= 0) return
    try {
      const key = 'recentlyViewedProductIds'
      const raw = localStorage.getItem(key)
      const parsed = raw ? JSON.parse(raw) : []
      const arr: number[] = Array.isArray(parsed) ? parsed.map((n: any) => Number(n)).filter((n: any) => Number.isFinite(n) && n > 0) : []
      const next = [id, ...arr.filter(x => x !== id)].slice(0, 12)
      localStorage.setItem(key, JSON.stringify(next))
    } catch {}
  }

  router.afterEach((to) => {
    const id = Number((to.params as any)?.id)
    if (to.path.startsWith('/product/') && Number.isFinite(id)) record(id)
  })

  const initialId = Number((currentRoute.params as any)?.id)
  if (currentRoute.path.startsWith('/product/') && Number.isFinite(initialId)) {
    record(initialId)
  }
})
