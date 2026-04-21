export const useHomeAnalytics = () => {
  const trackHomeSectionAction = async (section: string, target: string, action: 'click' | 'add_to_cart' = 'click') => {
    try {
      await $fetch('/api/analytics/home-section-click', {
        method: 'POST',
        body: { section, target, action }
      })
    } catch {
    }
  }

  const trackHomeSectionClick = async (section: string, target: string) => {
    await trackHomeSectionAction(section, target, 'click')
  }

  const trackHomeSectionAddToCart = async (section: string, target: string) => {
    await trackHomeSectionAction(section, target, 'add_to_cart')
  }

  return { trackHomeSectionClick, trackHomeSectionAddToCart, trackHomeSectionAction }
}
