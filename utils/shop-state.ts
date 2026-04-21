export const resolveShopViewMode = (value: string | null | undefined) =>
  value === 'list' || value === 'grid' ? value : 'grid'
