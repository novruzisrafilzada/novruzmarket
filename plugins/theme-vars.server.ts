import { useSettingsStore } from '~/stores/settings'
import { computed } from 'vue'

const cssFrom = (d: any) => {
  const primary = String(d?.primaryColor || '#2B3E95')
  const accent = String(d?.accentColor || '#FACC15')
  const appBg = String(d?.appBg || '#FFFFFF')
  const appText = String(d?.appText || '#1F2937')
  const surfaceBg = String(d?.surfaceBg || '#FFFFFF')
  const borderColor = String(d?.borderColor || '#E5E7EB')
  const footerBg = String(d?.footerBg || '#030712')
  const footerText = String(d?.footerText || '#E5E7EB')
  const footerMuted = String(d?.footerMuted || '#9CA3AF')
  const footerBorder = String(d?.footerBorder || '#111827')
  const mobile = Math.max(240, Number(d?.heroHeightMobile || 460))
  const desktop = Math.max(240, Number(d?.heroHeightDesktop || 500))
  const headerNavBg = String(d?.headerNavBg || primary)
  const headerNavLinkDefault = String(d?.headerNavLinkDefault || 'rgba(255,255,255,0.9)')
  const headerNavLinkHover = String(d?.headerNavLinkHover || '#FFFFFF')
  const headerNavLinkActive = String(d?.headerNavLinkActive || accent)
  const deptBtnBg = String(d?.deptBtnBg || 'rgba(255,255,255,0.10)')
  const deptBtnBorder = String(d?.deptBtnBorder || 'rgba(255,255,255,0.15)')
  const deptBtnText = String(d?.deptBtnText || '#FFFFFF')
  const deptBtnHoverBg = String(d?.deptBtnHoverBg || accent)
  const deptBtnHoverBorder = String(d?.deptBtnHoverBorder || deptBtnHoverBg)
  const deptBtnHoverText = String(d?.deptBtnHoverText || primary)
  const deptBtnActiveBg = String(d?.deptBtnActiveBg || deptBtnHoverBg)
  const deptBtnActiveBorder = String(d?.deptBtnActiveBorder || deptBtnActiveBg)
  const deptBtnActiveText = String(d?.deptBtnActiveText || deptBtnHoverText)
  const deptMenuWidth = Math.max(320, Number(d?.deptMenuWidth || 760))
  const deptMenuMaxHeight = Math.max(240, Number(d?.deptMenuMaxHeight || 420))
  const heroSectionBgDesktop = String(d?.heroSectionBgDesktop || primary)
  const themeBgDark = '#07111f'
  const surfaceDark = '#0f172a'
  const surfaceSoftDark = '#162235'
  const textDark = '#e5eefc'
  const textMutedDark = '#94a9c9'
  const borderDark = '#22314a'
  return `
:root{
  --color-primary:${primary};
  --color-accent:${accent};
  --app-bg:${appBg};
  --app-text:${appText};
  --surface-bg:${surfaceBg};
  --border-color:${borderColor};
  --footer-bg:${footerBg};
  --footer-text:${footerText};
  --footer-muted:${footerMuted};
  --footer-border:${footerBorder};
  --header-nav-bg:${headerNavBg};
  --header-nav-link-default:${headerNavLinkDefault};
  --header-nav-link-hover:${headerNavLinkHover};
  --header-nav-link-active:${headerNavLinkActive};
  --dept-btn-bg:${deptBtnBg};
  --dept-btn-border:${deptBtnBorder};
  --dept-btn-text:${deptBtnText};
  --dept-btn-hover-bg:${deptBtnHoverBg};
  --dept-btn-hover-border:${deptBtnHoverBorder};
  --dept-btn-hover-text:${deptBtnHoverText};
  --dept-btn-active-bg:${deptBtnActiveBg};
  --dept-btn-active-border:${deptBtnActiveBorder};
  --dept-btn-active-text:${deptBtnActiveText};
  --dept-menu-width:${deptMenuWidth}px;
  --dept-menu-max-h:${deptMenuMaxHeight}px;
  --hero-section-bg-desktop:${heroSectionBgDesktop};
  --hero-height-mobile:${mobile}px;
  --hero-height-desktop:${desktop}px;
  --hero-height:clamp(260px, 45vh, var(--hero-height-mobile));
  --theme-bg:${appBg};
  --theme-surface:${surfaceBg};
  --theme-surface-soft:#f8fafc;
  --theme-text:${appText};
  --theme-text-muted:#6b7280;
  --theme-border:${borderColor};
}
:root[data-theme-mode='dark']{
  --app-bg:${themeBgDark};
  --app-text:${textDark};
  --surface-bg:${surfaceDark};
  --border-color:${borderDark};
  --footer-bg:${themeBgDark};
  --footer-text:${textDark};
  --footer-muted:${textMutedDark};
  --footer-border:${borderDark};
  --theme-bg:${themeBgDark};
  --theme-surface:${surfaceDark};
  --theme-surface-soft:${surfaceSoftDark};
  --theme-text:${textDark};
  --theme-text-muted:${textMutedDark};
  --theme-border:${borderDark};
}
html, body{
  background:var(--theme-bg);
  color:var(--theme-text);
}
[data-theme-mode='dark'] .bg-white,
[data-theme-mode='dark'] .bg-white\\/70,
[data-theme-mode='dark'] .bg-white\\/60,
[data-theme-mode='dark'] .bg-white\\/50,
[data-theme-mode='dark'] .bg-white\\/95,
[data-theme-mode='dark'] .bg-white\\/90,
[data-theme-mode='dark'] .bg-white\\/80,
[data-theme-mode='dark'] .bg-gray-50,
[data-theme-mode='dark'] .bg-gray-50\\/50,
[data-theme-mode='dark'] .bg-gray-50\\/80,
[data-theme-mode='dark'] .bg-gray-50\\/70,
[data-theme-mode='dark'] .bg-blue-50,
[data-theme-mode='dark'] .bg-blue-50\\/50,
[data-theme-mode='dark'] .bg-indigo-50,
[data-theme-mode='dark'] .bg-slate-50{
  background-color:var(--theme-surface) !important;
  color:var(--theme-text) !important;
}
[data-theme-mode='dark'] .bg-gray-100,
[data-theme-mode='dark'] .bg-slate-100,
[data-theme-mode='dark'] .bg-amber-50,
[data-theme-mode='dark'] .bg-red-50,
[data-theme-mode='dark'] .bg-emerald-50{
  background-color:var(--theme-surface-soft) !important;
}
[data-theme-mode='dark'] .text-gray-900,
[data-theme-mode='dark'] .text-gray-800,
[data-theme-mode='dark'] .text-slate-900,
[data-theme-mode='dark'] .text-slate-800{
  color:var(--theme-text) !important;
}
[data-theme-mode='dark'] .text-gray-700,
[data-theme-mode='dark'] .text-gray-600,
[data-theme-mode='dark'] .text-gray-500,
[data-theme-mode='dark'] .text-gray-400,
[data-theme-mode='dark'] .text-gray-300,
[data-theme-mode='dark'] .text-gray-200,
[data-theme-mode='dark'] .text-slate-700,
[data-theme-mode='dark'] .text-slate-600,
[data-theme-mode='dark'] .text-slate-500,
[data-theme-mode='dark'] .text-slate-400{
  color:var(--theme-text-muted) !important;
}
[data-theme-mode='dark'] .border-gray-50,
[data-theme-mode='dark'] .border-gray-100,
[data-theme-mode='dark'] .border-gray-200,
[data-theme-mode='dark'] .border-gray-300,
[data-theme-mode='dark'] .border-slate-100,
[data-theme-mode='dark'] .border-slate-200,
[data-theme-mode='dark'] .border-slate-300,
[data-theme-mode='dark'] .divide-gray-50,
[data-theme-mode='dark'] .divide-gray-100{
  border-color:var(--theme-border) !important;
}
[data-theme-mode='dark'] input,
[data-theme-mode='dark'] textarea,
[data-theme-mode='dark'] select{
  background-color:var(--theme-surface-soft) !important;
  color:var(--theme-text) !important;
  border-color:var(--theme-border) !important;
}
[data-theme-mode='dark'] ::placeholder{
  color:var(--theme-text-muted);
}
[data-theme-mode='dark'] .shadow-sm,
[data-theme-mode='dark'] .shadow-lg,
[data-theme-mode='dark'] .shadow-xl,
[data-theme-mode='dark'] .shadow-2xl{
  box-shadow:0 10px 30px rgba(0,0,0,0.35) !important;
}
@media (min-width: 640px){
  :root{ --hero-height:clamp(360px, 42vw, var(--hero-height-desktop)); }
}
`.trim()
}

export default defineNuxtPlugin(async () => {
  const settingsStore = useSettingsStore()
  if (!settingsStore.hydrated) {
    const fetcher = useRequestFetch()
    const settings = await fetcher('/api/settings')
    settingsStore.setAll(settings as any)
  }

  const css = computed(() => cssFrom((settingsStore.settings as any).design))
  useHead(() => ({
    style: [{ key: 'theme-vars', id: 'theme-vars', children: css.value }]
  }))
})
