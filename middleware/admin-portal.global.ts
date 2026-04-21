export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const { adminBasePath, adminPathSegment } = useAdminPortal()

  const canonicalAdmin = to.path === '/admin' || to.path.startsWith('/admin/')
  const aliasAdmin = to.path === adminBasePath.value || to.path.startsWith(`${adminBasePath.value}/`)

  if (!canonicalAdmin && !aliasAdmin) return

  if (adminPathSegment.value !== 'admin' && canonicalAdmin) {
    return navigateTo(to.fullPath.replace(/^\/admin(?=\/|$)/, adminBasePath.value), { replace: true })
  }

  if (!authStore.isLoggedIn) {
    await authStore.fetchSession()
  }

  if (authStore.user?.role !== 'Admin') {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
