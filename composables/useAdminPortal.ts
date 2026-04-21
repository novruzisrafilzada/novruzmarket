export const sanitizeAdminPortalSegment = (value: string) => {
  const cleaned = String(value || 'admin')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '')
  if (!cleaned || ['api', '_nuxt', 'login', 'signup', 'seller'].includes(cleaned)) return 'admin'
  return cleaned
}

export const useAdminPortal = () => {
  const pathSegment = useState('admin-portal-segment', () => 'admin')
  const loaded = useState('admin-portal-loaded', () => false)
  const adminPathSegment = computed(() => sanitizeAdminPortalSegment(pathSegment.value))
  const adminBasePath = computed(() => `/${adminPathSegment.value}`)

  const setAdminPathSegment = (value: string) => {
    pathSegment.value = sanitizeAdminPortalSegment(value)
    loaded.value = true
  }

  const adminPath = (value?: string) => {
    const suffix = String(value || '').replace(/^\/+/, '')
    return suffix ? `${adminBasePath.value}/${suffix}` : adminBasePath.value
  }

  return {
    adminPathSegment,
    adminBasePath,
    adminPathLoaded: loaded,
    setAdminPathSegment,
    adminPath
  }
}
