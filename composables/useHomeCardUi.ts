import { computed } from 'vue'

const defaultUi = {
  cardBorders: false,
  hoverLift: true,
  showRating: true,
  showRatingMobile: true,
  cardSurfaceBg: '#FFFFFF',
  cardImageBg: '#F7F8FA',
  cardBorderColor: '#E5E7EB',
  cardTitleColor: '#0068C9',
  cardPriceColor: '#111827',
  cardMutedColor: '#6B7280',
  cardBadgeBg: '#67B317',
  cardBadgeText: '#FFFFFF',
  cardActionBg: '#FFD200',
  cardActionText: '#111827',
  cardActionHoverBg: '#F4C400',
  cardSoldBarColor: '#E11D48',
  quickActionBg: '#FFFFFF',
  quickActionIcon: '#4B5563',
  countdownBg: '#D71920',
  countdownText: '#FFFFFF'
}

export const useHomeCardUi = (homeStore: { config: any }) => {
  const ui = computed(() => {
    const cfg: any = homeStore.config
    return {
      ...defaultUi,
      ...(cfg?.ui || {}),
      cardBorders: typeof cfg?.ui?.cardBorders === 'boolean' ? cfg.ui.cardBorders : defaultUi.cardBorders,
      hoverLift: typeof cfg?.ui?.hoverLift === 'boolean' ? cfg.ui.hoverLift : defaultUi.hoverLift,
      showRating: typeof cfg?.ui?.showRating === 'boolean' ? cfg.ui.showRating : defaultUi.showRating,
      showRatingMobile: typeof cfg?.ui?.showRatingMobile === 'boolean' ? cfg.ui.showRatingMobile : defaultUi.showRatingMobile
    }
  })

  const styleVars = computed(() => ({
    '--home-card-surface': ui.value.cardSurfaceBg,
    '--home-card-image-bg': ui.value.cardImageBg,
    '--home-card-border': ui.value.cardBorderColor,
    '--home-card-title': ui.value.cardTitleColor,
    '--home-card-price': ui.value.cardPriceColor,
    '--home-card-muted': ui.value.cardMutedColor,
    '--home-card-badge-bg': ui.value.cardBadgeBg,
    '--home-card-badge-text': ui.value.cardBadgeText,
    '--home-card-action-bg': ui.value.cardActionBg,
    '--home-card-action-text': ui.value.cardActionText,
    '--home-card-action-hover-bg': ui.value.cardActionHoverBg,
    '--home-card-sold-bar': ui.value.cardSoldBarColor,
    '--home-card-quick-bg': ui.value.quickActionBg,
    '--home-card-quick-icon': ui.value.quickActionIcon,
    '--home-countdown-bg': ui.value.countdownBg,
    '--home-countdown-text': ui.value.countdownText
  }))

  return { ui, styleVars }
}
