export const slugifyProductName = (value: string) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9əöğüşçı\s-]/gi, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const parseProductRouteId = (value: string | number | undefined | null) => {
  const raw = String(value || '').trim()
  const match = raw.match(/^(\d+)/)
  return match ? Number(match[1]) : Number(raw)
}

export const buildProductHref = (product: { id?: number | string, name?: string }) => {
  const id = Number(product?.id || 0)
  const slug = slugifyProductName(String(product?.name || ''))
  return slug ? `/product/${id}-${slug}` : `/product/${id}`
}
