export const useMoney = () => {
  const formatMoney = (value: number) => {
    const n = Number(value || 0)
    const sign = n < 0 ? '-' : ''
    const abs = Math.abs(n)
    const fixed = abs.toFixed(2)
    const [i, d] = fixed.split('.')
    const withSep = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    return `₼${sign}${withSep},${d}`
  }

  return { formatMoney }
}
