export const orderStatuses = [
  'Gözləyir',
  'Təsdiqləndi',
  'Hazırlanır',
  'Göndərildi',
  'Çatdırıldı',
  'Ləğv istəyi',
  'Qaytarma istəyi',
  'İptal edildi',
  'Qaytarıldı'
] as const

export type OrderStatus = typeof orderStatuses[number]

export const statusToColor = (status: string) => {
  switch (status) {
    case 'Təsdiqləndi':
      return 'bg-green-100 text-green-700'
    case 'Hazırlanır':
      return 'bg-indigo-100 text-indigo-700'
    case 'Göndərildi':
      return 'bg-sky-100 text-sky-700'
    case 'Çatdırıldı':
      return 'bg-blue-100 text-blue-700'
    case 'Ləğv istəyi':
    case 'Qaytarma istəyi':
      return 'bg-amber-100 text-amber-700'
    case 'İptal edildi':
    case 'Qaytarıldı':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-yellow-100 text-yellow-700'
  }
}

export const statusNeedsInventoryRestore = (status: string) =>
  status === 'İptal edildi' || status === 'Qaytarıldı'
