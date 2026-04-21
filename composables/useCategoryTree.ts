import { computed } from 'vue'
import { useCategoryStore, type Category } from '~/stores/categories'

export const useCategoryTree = () => {
  const categoryStore = useCategoryStore()
  const { lang } = useT()

  const locale = computed(() => (lang.value === 'ru' ? 'ru' : lang.value === 'en' ? 'en' : 'az'))

  const labelOf = (category: Category | null | undefined) => {
    if (!category) return ''
    const code = lang.value
    return (category.nameI18n as any)?.[code] || category.nameI18n.az || category.nameI18n.ru || category.nameI18n.en || category.slug
  }

  const byId = computed(() => new Map(categoryStore.categories.map(category => [category.id, category] as const)))

  const childrenByParent = computed(() => {
    const map = new Map<number | null, Category[]>()
    for (const category of categoryStore.categories) {
      const key = category.parentId === null ? null : Number(category.parentId)
      const list = map.get(key) || []
      list.push(category)
      map.set(key, list)
    }
    for (const [key, list] of map.entries()) {
      map.set(key, list.sort((left, right) => labelOf(left).localeCompare(labelOf(right), locale.value)))
    }
    return map
  })

  const rootCategories = computed(() => childrenByParent.value.get(null) || [])

  const getChildren = (parentId: number | null | undefined) => {
    const key = parentId === null || parentId === undefined ? null : Number(parentId)
    return childrenByParent.value.get(key) || []
  }

  const getDescendantIds = (categoryId: number) => {
    const ids: number[] = []
    const walk = (id: number) => {
      const children = getChildren(id)
      for (const child of children) {
        ids.push(child.id)
        walk(child.id)
      }
    }
    walk(categoryId)
    return ids
  }

  const getBreadcrumb = (categoryId: number | null | undefined) => {
    if (categoryId === null || categoryId === undefined) return []
    const trail: Category[] = []
    let current = byId.value.get(Number(categoryId)) || null
    while (current) {
      trail.unshift(current)
      current = current.parentId === null ? null : byId.value.get(Number(current.parentId)) || null
    }
    return trail
  }

  const flatOptions = computed(() => {
    const rows: Array<{ id: number; depth: number; label: string; category: Category }> = []
    const walk = (category: Category, depth: number) => {
      rows.push({ id: category.id, depth, label: labelOf(category), category })
      for (const child of getChildren(category.id)) walk(child, depth + 1)
    }
    for (const root of rootCategories.value) walk(root, 0)
    return rows
  })

  return {
    byId,
    rootCategories,
    childrenByParent,
    flatOptions,
    labelOf,
    getChildren,
    getDescendantIds,
    getBreadcrumb
  }
}
