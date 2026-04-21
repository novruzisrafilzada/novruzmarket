import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  if (authStore.isLoggedIn) return
  const redirect = encodeURIComponent(to.fullPath || '/')
  return navigateTo(`/login?redirect=${redirect}`)
})

