import { useAuthStore, type AuthUser } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const fetcher = useRequestFetch()

  try {
    const user = await fetcher<AuthUser>('/api/auth/me')
    authStore.setSession(user)
  } catch {
    authStore.setSession(null)
  }
})
