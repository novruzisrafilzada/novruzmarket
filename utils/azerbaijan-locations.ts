export const AZERBAIJAN_LOCATIONS = [
  'Bakı',
  'Gəncə',
  'Sumqayıt',
  'Mingəçevir',
  'Şirvan',
  'Naxçıvan',
  'Xankəndi',
  'Yevlax',
  'Naftalan',
  'Şəki',
  'Lənkəran',
  'Quba',
  'Qusar',
  'Xaçmaz',
  'Siyəzən',
  'Şabran',
  'Xızı',
  'Abşeron',
  'Hacıqabul',
  'Salyan',
  'Neftçala',
  'Biləsuvar',
  'Cəlilabad',
  'Masallı',
  'Lerik',
  'Yardımlı',
  'Astara',
  'Saatlı',
  'Sabirabad',
  'İmişli',
  'Beyləqan',
  'Ağcabədi',
  'Ağdam',
  'Bərdə',
  'Tərtər',
  'Goranboy',
  'Samux',
  'Göygöl',
  'Daşkəsən',
  'Gədəbəy',
  'Tovuz',
  'Ağstafa',
  'Qazax',
  'Şəmkir',
  'Kürdəmir',
  'Ucar',
  'Zərdab',
  'Ağsu',
  'İsmayıllı',
  'Qəbələ',
  'Oğuz',
  'Qax',
  'Zaqatala',
  'Balakən',
  'Şamaxı',
  'Qobustan',
  'Ağdaş',
  'Göyçay',
  'Şamaxı',
  'Yevlax rayonu',
  'Füzuli',
  'Cəbrayıl',
  'Zəngilan',
  'Qubadlı',
  'Laçın',
  'Kəlbəcər',
  'Şuşa',
  'Xocalı',
  'Xocavənd',
  'Ağdərə',
  'Ordubad',
  'Culfa',
  'Babək',
  'Şahbuz',
  'Sədərək',
  'Kəngərli',
  'Suraxanı',
  'Sabunçu',
  'Xəzər',
  'Nizami',
  'Yasamal',
  'Binəqədi',
  'Nərimanov',
  'Nəsimi',
  'Səbail',
  'Xətai',
  'Pirallahı',
  'Qaradağ'
] as const

export const normalizeAzerbaijanLocation = (value: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ə/g, 'e')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')

export const AZERBAIJAN_LOCATION_SET = new Set(
  AZERBAIJAN_LOCATIONS.map((item) => normalizeAzerbaijanLocation(item))
)

export const matchAzerbaijanLocation = (value: string) => {
  const normalized = normalizeAzerbaijanLocation(value)
  return AZERBAIJAN_LOCATIONS.find((item) => normalizeAzerbaijanLocation(item) === normalized) || ''
}
