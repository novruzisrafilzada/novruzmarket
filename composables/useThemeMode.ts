export const useThemeMode = () => {
  const themeMode = useState<'light' | 'dark'>('theme-mode', () => 'light')

  const applyThemeMode = (value: 'light' | 'dark') => {
    themeMode.value = value
    if (process.client) {
      document.documentElement.dataset.themeMode = value
      document.documentElement.style.colorScheme = value
      localStorage.setItem('markett-theme-mode', value)
    }
  }

  const initThemeMode = (allowed = true) => {
    if (!process.client) return
    if (!allowed) {
      applyThemeMode('light')
      return
    }
    const stored = localStorage.getItem('markett-theme-mode')
    if (stored === 'dark' || stored === 'light') {
      applyThemeMode(stored)
      return
    }
    applyThemeMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }

  return { themeMode, applyThemeMode, initThemeMode }
}
