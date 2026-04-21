const registerAdminAliasRoutes = (router: ReturnType<typeof useRouter>, segment: string) => {
  if (segment === 'admin') return
  for (const route of router.getRoutes()) {
    if (!(route.path === '/admin' || route.path.startsWith('/admin/'))) continue
    const component = route.components?.default
    if (!component) continue
    const aliasPath = `/${segment}${route.path.slice('/admin'.length)}`
    const routeName = typeof route.name === 'string' ? `${route.name}__portal_alias` : undefined
    if (routeName && router.hasRoute(routeName)) continue
    router.addRoute({
      path: aliasPath,
      name: routeName,
      component,
      props: route.props && typeof route.props === 'object' ? (route.props as any).default : route.props,
      meta: route.meta
    })
  }
}

export default defineNuxtPlugin(async () => {
  const router = useRouter()
  const { setAdminPathSegment } = useAdminPortal()
  let segment = 'admin'
  try {
    const data = await $fetch<{ pathSegment: string }>('/api/admin/portal/public')
    segment = sanitizeAdminPortalSegment(String(data?.pathSegment || 'admin'))
  } catch {}
  setAdminPathSegment(segment)
  registerAdminAliasRoutes(router, segment)
})
