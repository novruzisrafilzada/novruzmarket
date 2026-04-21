export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return

  const authStore = useAuthStore()

  if (!authStore.isLoggedIn) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (authStore.user?.role !== 'Satıcı' || authStore.user?.status === 'Deaktiv') {
    return navigateTo('/profile')
  }
})
