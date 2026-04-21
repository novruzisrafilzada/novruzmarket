import type { CategoryFilterGroup, CategoryFilterSchema } from '~/server/utils/category-filters-db'
import type { CategoryRecord } from '~/server/utils/categories-db'

const TEMPLATE_UPDATED_AT = '2026-04-21T00:00:00.000Z'

const normalizeText = (value: string) => String(value || '')
  .toLowerCase()
  .replace(/[ə]/g, 'e')
  .replace(/[ı]/g, 'i')
  .replace(/[ö]/g, 'o')
  .replace(/[ü]/g, 'u')
  .replace(/[ş]/g, 's')
  .replace(/[ç]/g, 'c')
  .replace(/[ğ]/g, 'g')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const hasAny = (haystack: string, needles: string[]) => needles.some((needle) => haystack.includes(normalizeText(needle)))

const createGroup = (key: string, label: string, options: string[]): CategoryFilterGroup => ({
  key,
  label,
  options: Array.from(new Set(options.map((item) => String(item || '').trim()).filter(Boolean)))
})

const mergeGroups = (...parts: CategoryFilterGroup[][]) => {
  const byKey = new Map<string, CategoryFilterGroup>()
  for (const group of parts.flat()) {
    if (!byKey.has(group.key)) {
      byKey.set(group.key, { ...group, options: [...group.options] })
      continue
    }
    const current = byKey.get(group.key)!
    current.options = Array.from(new Set([...current.options, ...group.options]))
  }
  return Array.from(byKey.values())
}

export type ResolvedCategoryFilterSchema = CategoryFilterSchema & {
  source: 'auto' | 'custom'
  templateRootCategoryId?: number
}

const commonGroups = {
  color: () => createGroup('reng', 'Rəng', ['Qara', 'Ağ', 'Boz', 'Mavi', 'Qırmızı', 'Yaşıl', 'Sarı', 'Bej']),
  size: () => createGroup('olcu', 'Ölçü', ['XS', 'S', 'M', 'L', 'XL', 'XXL']),
  material: () => createGroup('material', 'Material', ['Pambıq', 'Dəri', 'Plastik', 'Metal', 'Şüşə', 'Taxta']),
  gender: () => createGroup('cins', 'Cins', ['Kişi', 'Qadın', 'Uniseks']),
  age: () => createGroup('yas-qrupu', 'Yaş qrupu', ['0-12 ay', '1-3 yaş', '4-6 yaş', '7-12 yaş', '13+ yaş']),
  volume: () => createGroup('hecm', 'Həcm', ['100 ml', '250 ml', '500 ml', '750 ml', '1 L', '2 L']),
  weight: () => createGroup('ceki', 'Çəki', ['100 q', '250 q', '500 q', '1 kq', '2 kq', '5 kq']),
  pack: () => createGroup('qablasdirma', 'Qablaşdırma', ['Tək', '2-li paket', '4-lü paket', '6-lı paket', 'Set']),
  connection: () => createGroup('baglanti', 'Bağlantı', ['USB', 'USB-C', 'Bluetooth', 'Wi-Fi', 'AUX', 'HDMI']),
  compatibility: () => createGroup('uygunluq', 'Uyğunluq', ['Universal', 'Android', 'iPhone', 'Sedan', 'SUV', 'Hetchbek']),
  power: () => createGroup('guc', 'Güc', ['10 W', '20 W', '50 W', '100 W', '500 W', '1000 W']),
  installation: () => createGroup('qurasdirma', 'Quraşdırma', ['Masaüstü', 'Divar', 'Ankastre', 'Portativ', 'Asma']),
  energy: () => createGroup('enerji-sinfi', 'Enerji sinfi', ['A', 'A+', 'A++', 'B', 'C']),
  platform: () => createGroup('platforma', 'Platforma', ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Universal'])
}

const apparelGroups = () => mergeGroups([
  commonGroups.size(),
  commonGroups.color(),
  createGroup('material', 'Material', ['Pambıq', 'Denim', 'Trikotaj', 'Polyester', 'Dəri', 'Kətan']),
  createGroup('movsum', 'Mövsüm', ['Yay', 'Payız', 'Qış', 'Bahar', 'Dörd mövsüm'])
])

const footwearGroups = () => mergeGroups([
  createGroup('olcu', 'Ölçü', ['36', '37', '38', '39', '40', '41', '42', '43', '44']),
  commonGroups.color(),
  createGroup('material', 'Material', ['Dəri', 'Süni dəri', 'Tekstil', 'Süet', 'Rezin']),
  createGroup('movsum', 'Mövsüm', ['Yay', 'Payız', 'Qış', 'Dörd mövsüm'])
])

const electronicsGroups = () => mergeGroups([
  commonGroups.color(),
  commonGroups.connection(),
  createGroup('yaddas', 'Yaddaş', ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB']),
  createGroup('ekran-olcusu', 'Ekran ölçüsü', ['6"', '10"', '13"', '15.6"', '27"', '32"'])
])

const gamingGroups = () => mergeGroups([
  commonGroups.platform(),
  commonGroups.connection(),
  commonGroups.color(),
  commonGroups.compatibility()
])

const foodGroups = () => mergeGroups([
  commonGroups.weight(),
  commonGroups.pack(),
  createGroup('nov', 'Növ', ['Klassik', 'Premium', 'Dietik', 'Orqanik', 'Uşaq üçün']),
  createGroup('mense', 'Mənşə', ['Yerli', 'Türkiyə', 'Avropa', 'Asiya'])
])

const beautyGroups = () => mergeGroups([
  commonGroups.volume(),
  createGroup('tesir', 'Təsir', ['Nəmləndirici', 'Qidalandırıcı', 'Bərpaedici', 'Parıldadıcı', 'Qoruyucu']),
  createGroup('tip', 'Tip', ['Quru dəri', 'Yağlı dəri', 'Həssas dəri', 'Bütün tiplər', 'Normal saç', 'Quru saç']),
  commonGroups.color()
])

const healthGroups = () => mergeGroups([
  createGroup('forma', 'Forma', ['Tablet', 'Kapsul', 'Toz', 'Məhlul', 'Sprey']),
  createGroup('miqdar', 'Miqdar', ['10 ədəd', '20 ədəd', '30 ədəd', '60 ədəd', '90 ədəd']),
  commonGroups.age(),
  createGroup('teyinat', 'Təyinat', ['İmmunitet', 'Ortopedik dəstək', 'Gündəlik baxım', 'Bərpa', 'Uşaq üçün'])
])

const homeGroups = () => mergeGroups([
  commonGroups.color(),
  commonGroups.material(),
  createGroup('olcu-format', 'Ölçü / Format', ['Kiçik', 'Orta', 'Böyük', '2-li set', '4-lü set']),
  createGroup('stil', 'Stil', ['Minimal', 'Modern', 'Klassik', 'Skandinaviya'])
])

const applianceGroups = () => mergeGroups([
  commonGroups.energy(),
  commonGroups.power(),
  createGroup('hecm-tutum', 'Həcm / Tutum', ['1 L', '2 L', '5 L', '20 L', '50 L']),
  commonGroups.color()
])

const tvAudioGroups = () => mergeGroups([
  createGroup('ekran-olcusu', 'Ekran ölçüsü', ['32"', '43"', '50"', '55"', '65"', '75"']),
  createGroup('keyfiyyet', 'Keyfiyyət', ['HD', 'Full HD', '4K', '8K']),
  commonGroups.connection(),
  commonGroups.color()
])

const cleaningGroups = () => mergeGroups([
  commonGroups.volume(),
  createGroup('qoxu', 'Qoxu', ['Limon', 'Lavanda', 'Fresh', 'Neytral', 'Gül']),
  commonGroups.pack(),
  createGroup('seht', 'Səth', ['Universal', 'Mətbəx', 'Hamam', 'Şüşə', 'Parça'])
])

const officeGroups = () => mergeGroups([
  commonGroups.color(),
  commonGroups.material(),
  createGroup('format', 'Format', ['A4', 'A5', 'Pocket', 'Mini', 'Standart']),
  createGroup('dil-seviyye', 'Dil / Səviyyə', ['AZ', 'EN', 'RU', 'Başlanğıc', 'Orta', 'Peşəkar'])
])

const autoGroups = () => mergeGroups([
  commonGroups.compatibility(),
  commonGroups.color(),
  commonGroups.material(),
  createGroup('olcu', 'Ölçü', ['Kiçik', 'Orta', 'Böyük', 'Standart'])
])

const resolveGroupsByRoot = (rootSlug: string, haystack: string) => {
  switch (rootSlug) {
    case 'avtomobil-mehsullari':
      if (hasAny(haystack, ['muherrik yagi', 'motor yagi', 'yag', 'oil'])) {
        return mergeGroups([
          createGroup('qatiliq', 'Qatılıq', ['0W-20', '5W-30', '5W-40', '10W-40', '15W-40']),
          createGroup('yag-novu', 'Yağ növü', ['Tam sintetik', 'Yarı sintetik', 'Mineral']),
          createGroup('muherrik-tipi', 'Mühərrik tipi', ['Benzin', 'Dizel', 'Hibrid']),
          commonGroups.volume()
        ])
      }
      if (hasAny(haystack, ['akkumulyator', 'starter', 'kompressor', 'invertor'])) {
        return mergeGroups([
          createGroup('gerginlik', 'Gərginlik', ['12 V', '24 V']),
          createGroup('tutum', 'Tutum', ['45 Ah', '60 Ah', '75 Ah', '90 Ah']),
          createGroup('yanacaq-cereyan', 'Start cərəyanı', ['360 A', '480 A', '600 A', '720 A']),
          commonGroups.compatibility()
        ])
      }
      if (hasAny(haystack, ['teker', 'tekerlek', 'sin', 'disk'])) {
        return mergeGroups([
          createGroup('diametr', 'Diametr', ['14"', '15"', '16"', '17"', '18"', '19"']),
          createGroup('movsum', 'Mövsüm', ['Yay', 'Qış', 'Dörd mövsüm']),
          createGroup('en', 'En', ['185', '195', '205', '215', '225', '235']),
          createGroup('material', 'Material', ['Polad', 'Alüminium', 'Kompozit'])
        ])
      }
      if (hasAny(haystack, ['fara', 'isiq', 'lampa'])) {
        return mergeGroups([
          createGroup('texnologiya', 'Texnologiya', ['LED', 'Halogen', 'Xenon']),
          createGroup('soket', 'Soket tipi', ['H1', 'H4', 'H7', 'HB3', 'HB4']),
          createGroup('isig-rengi', 'İşıq rəngi', ['İlıq ağ', 'Soyuq ağ', 'Ağ']),
          commonGroups.compatibility()
        ])
      }
      if (hasAny(haystack, ['registrator', 'naviqator', 'kamera'])) {
        return mergeGroups([
          createGroup('icaze', 'Görüntü keyfiyyəti', ['HD', 'Full HD', '2K', '4K']),
          commonGroups.connection(),
          createGroup('ekran-olcusu', 'Ekran ölçüsü', ['2"', '3"', '5"', '7"']),
          createGroup('yaddaş-desteyi', 'Yaddaş dəstəyi', ['32 GB', '64 GB', '128 GB'])
        ])
      }
      if (hasAny(haystack, ['filtr', 'antifriz', 'maye', 'kimya', 'temizlik'])) {
        return mergeGroups([
          commonGroups.volume(),
          commonGroups.compatibility(),
          createGroup('movsum', 'Mövsüm', ['Yay', 'Qış', 'Dörd mövsüm']),
          createGroup('formula', 'Formula', ['Konsentrat', 'Hazır', 'Ekoloji'])
        ])
      }
      return autoGroups()

    case 'elektronika':
      if (hasAny(haystack, ['telefon', 'smartfon', 'iphone'])) {
        return mergeGroups([
          createGroup('yaddas', 'Yaddaş', ['64 GB', '128 GB', '256 GB', '512 GB']),
          commonGroups.color(),
          commonGroups.connection(),
          createGroup('zemanet', 'Zəmanət', ['6 ay', '12 ay', '24 ay'])
        ])
      }
      if (hasAny(haystack, ['noutbuk', 'laptop', 'komputer', 'pc', 'monitor', 'video kart'])) {
        return mergeGroups([
          createGroup('ram', 'RAM', ['8 GB', '16 GB', '32 GB', '64 GB']),
          createGroup('yaddas', 'Yaddaş', ['256 GB SSD', '512 GB SSD', '1 TB SSD', '2 TB SSD']),
          createGroup('ekran-olcusu', 'Ekran ölçüsü', ['13"', '14"', '15.6"', '27"', '32"']),
          commonGroups.color()
        ])
      }
      if (hasAny(haystack, ['router', 'modem', 'wifi', 'ups', 'telefon'])) {
        return mergeGroups([
          commonGroups.connection(),
          createGroup('standart', 'Standart', ['Wi-Fi 5', 'Wi-Fi 6', '4G', '5G']),
          createGroup('port-sayi', 'Port sayı', ['2 port', '4 port', '8 port']),
          commonGroups.color()
        ])
      }
      if (hasAny(haystack, ['kamera', 'smart isig', 'sensor', 'smart priz', 'tehlukesizlik'])) {
        return mergeGroups([
          commonGroups.connection(),
          commonGroups.installation(),
          commonGroups.color(),
          commonGroups.power()
        ])
      }
      if (hasAny(haystack, ['oyun', 'gaming', 'stream', 'konsol'])) {
        return gamingGroups()
      }
      return electronicsGroups()

    case 'ev-ve-bag-ucun':
      if (hasAny(haystack, ['metbex', 'qab qacaq', 'qazan', 'tava', 'sufre'])) {
        return mergeGroups([
          createGroup('material', 'Material', ['Paslanmaz polad', 'Keramika', 'Şüşə', 'Plastik', 'Taxta']),
          commonGroups.color(),
          createGroup('olcu-format', 'Ölçü / Format', ['2 nəfərlik', '4 nəfərlik', '6 nəfərlik', 'Böyük']),
          createGroup('set', 'Set tipi', ['Tək', '2-li set', '4-lü set', '6-lı set'])
        ])
      }
      if (hasAny(haystack, ['hamam', 'desmal', 'xalat', 'temizlik'])) {
        return mergeGroups([
          commonGroups.material(),
          commonGroups.color(),
          createGroup('olcu-format', 'Ölçü / Format', ['50x90', '70x140', 'Tək', 'Set']),
          createGroup('tip', 'Tip', ['Hamam', 'Mətbəx', 'Universal'])
        ])
      }
      if (hasAny(haystack, ['bag', 'suvarma', 'manqal', 'piknik'])) {
        return mergeGroups([
          commonGroups.material(),
          commonGroups.color(),
          commonGroups.power(),
          createGroup('olcu-format', 'Ölçü / Format', ['Kiçik', 'Orta', 'Böyük', 'Qatlanan'])
        ])
      }
      if (hasAny(haystack, ['lampa', 'led', 'isig'])) {
        return mergeGroups([
          createGroup('isig-rengi', 'İşıq rəngi', ['İlıq ağ', 'Təbii ağ', 'Soyuq ağ']),
          commonGroups.power(),
          commonGroups.installation(),
          commonGroups.color()
        ])
      }
      return homeGroups()

    case 'sexsi-esyalar':
      if (hasAny(haystack, ['geyim', 'don', 'koynek', 'salvar', 'cins', 'bluz', 'ust geyim'])) {
        return mergeGroups([apparelGroups(), [commonGroups.gender()]])
      }
      if (hasAny(haystack, ['ayaqqabi'])) {
        return mergeGroups([footwearGroups(), [commonGroups.gender()]])
      }
      if (hasAny(haystack, ['saat', 'bijuteriya', 'gumus', 'zinet', 'eynek'])) {
        return mergeGroups([
          createGroup('material', 'Material', ['Polad', 'Gümüş', 'Qızıl örtük', 'Dəri', 'Akril']),
          commonGroups.color(),
          createGroup('stil', 'Stil', ['Gündəlik', 'Klassik', 'Premium', 'Sport']),
          commonGroups.gender()
        ])
      }
      if (hasAny(haystack, ['canta', 'camadan', 'seyahet', 'pasport', 'rukzak'])) {
        return mergeGroups([
          commonGroups.color(),
          createGroup('material', 'Material', ['Dəri', 'Parça', 'ABS', 'Polikarbonat', 'Polyester']),
          createGroup('hecm-tutum', 'Həcm / Tutum', ['5 L', '10 L', '20 L', '40 L', '60 L']),
          createGroup('format', 'Format', ['Bel çantası', 'Çiyin çantası', 'Laptop çantası', 'Böyük çamadan'])
        ])
      }
      return mergeGroups([homeGroups(), [commonGroups.gender()]])

    case 'qida-mehsullari-ve-ickiler':
      if (hasAny(haystack, ['su', 'mineral', 'sire', 'cay', 'qehve', 'icki'])) {
        return mergeGroups([
          commonGroups.volume(),
          createGroup('dad', 'Dad', ['Klassik', 'Meyvəli', 'Limonlu', 'Şəkərsiz']),
          commonGroups.pack(),
          createGroup('temperatur', 'Servis tipi', ['Soyuq', 'İlıq', 'Universal'])
        ])
      }
      if (hasAny(haystack, ['sokolad', 'pecenye', 'snack', 'qoz'])) {
        return mergeGroups([
          commonGroups.weight(),
          createGroup('dad', 'Dad', ['Şokoladlı', 'Vanilli', 'Duzlu', 'Qarışıq']),
          commonGroups.pack(),
          createGroup('mense', 'Mənşə', ['Yerli', 'Türkiyə', 'Avropa'])
        ])
      }
      if (hasAny(haystack, ['sud', 'yogurt', 'pendir', 'yumurta'])) {
        return mergeGroups([
          commonGroups.weight(),
          createGroup('yagliliq', 'Yağlılıq', ['0%', '1.5%', '3.2%', 'Tam yağlı']),
          commonGroups.pack(),
          createGroup('mense', 'Mənşə', ['Yerli', 'Ferma', 'İdxal'])
        ])
      }
      if (hasAny(haystack, ['tomat', 'sous', 'konserv', 'edviyyat', 'tursu'])) {
        return mergeGroups([
          commonGroups.weight(),
          createGroup('dad', 'Dad', ['Acılı', 'Şirin', 'Klassik', 'Qarışıq']),
          commonGroups.pack(),
          createGroup('nov', 'Növ', ['Sous', 'Pasta', 'Konserv', 'Ədviyyat'])
        ])
      }
      return foodGroups()

    case 'meiset-texnikasi':
      if (hasAny(haystack, ['kondisioner', 'qizdirici', 'ventilyator', 'hava temizleyici'])) {
        return mergeGroups([
          commonGroups.power(),
          createGroup('otaq-olcusu', 'Otaq ölçüsü', ['15 m2', '25 m2', '35 m2', '50 m2']),
          commonGroups.energy(),
          commonGroups.color()
        ])
      }
      if (hasAny(haystack, ['soyuducu', 'mikrodalga', 'blender', 'mikser', 'caydan', 'kofe'])) {
        return mergeGroups([
          commonGroups.power(),
          createGroup('hecm-tutum', 'Həcm / Tutum', ['1 L', '1.7 L', '20 L', '30 L', '300 L']),
          commonGroups.installation(),
          commonGroups.color()
        ])
      }
      if (hasAny(haystack, ['paltaryuyan', 'tozsoran', 'utuler', 'buxarli'])) {
        return mergeGroups([
          commonGroups.power(),
          commonGroups.energy(),
          createGroup('hecm-tutum', 'Həcm / Tutum', ['2 L', '5 L', '7 kq', '9 kq']),
          commonGroups.color()
        ])
      }
      return applianceGroups()

    case 'tv-audio-ve-video':
      if (hasAny(haystack, ['tv', 'oled', 'qled', 'proyektor', 'media player'])) {
        return mergeGroups([
          createGroup('ekran-olcusu', 'Ekran ölçüsü', ['32"', '43"', '50"', '55"', '65"', '75"']),
          createGroup('keyfiyyet', 'Keyfiyyət', ['Full HD', '4K', '8K']),
          createGroup('smart-platforma', 'Smart platforma', ['Android TV', 'Google TV', 'webOS', 'Tizen']),
          commonGroups.color()
        ])
      }
      if (hasAny(haystack, ['soundbar', 'kolon', 'mikrofon', 'receiver', 'subwoofer'])) {
        return mergeGroups([
          commonGroups.connection(),
          commonGroups.power(),
          createGroup('kanal', 'Kanal', ['2.0', '2.1', '5.1', '7.1']),
          commonGroups.color()
        ])
      }
      if (hasAny(haystack, ['kamera', 'lens', 'tripod', 'studiya', 'action'])) {
        return mergeGroups([
          createGroup('icaze', 'Görüntü keyfiyyəti', ['Full HD', '2K', '4K']),
          commonGroups.connection(),
          createGroup('lens-tip', 'Lens tipi', ['Wide', 'Prime', 'Zoom', 'Universal']),
          commonGroups.color()
        ])
      }
      return tvAudioGroups()

    case 'gozellik':
      if (hasAny(haystack, ['makiyaj', 'uz', 'goz', 'dodaq', 'firca'])) {
        return mergeGroups([
          commonGroups.color(),
          createGroup('bitis', 'Bitiş', ['Mat', 'Parlaq', 'Təbii', 'Saten']),
          createGroup('tip', 'Tip', ['Quru dəri', 'Yağlı dəri', 'Həssas dəri', 'Bütün tiplər']),
          commonGroups.volume()
        ])
      }
      if (hasAny(haystack, ['sac', 'sampun', 'serum', 'styling'])) {
        return mergeGroups([
          createGroup('sac-tipi', 'Saç tipi', ['Quru saç', 'Yağlı saç', 'Zədələnmiş saç', 'Bütün tiplər']),
          createGroup('tesir', 'Təsir', ['Bərpaedici', 'Parıldadıcı', 'Həcm verən', 'Qoruyucu']),
          commonGroups.volume(),
          createGroup('formula', 'Formula', ['Sulfatsız', 'Keratinli', 'Bitkisel', 'Standart'])
        ])
      }
      if (hasAny(haystack, ['etir', 'parfum', 'parfumeriya'])) {
        return mergeGroups([
          commonGroups.volume(),
          commonGroups.gender(),
          createGroup('qoxu-ailesi', 'Qoxu ailəsi', ['Fresh', 'Çiçəkli', 'Odunsu', 'Şərq']),
          createGroup('konsentrasiya', 'Konsentrasiya', ['EDT', 'EDP', 'Parfum'])
        ])
      }
      if (hasAny(haystack, ['dirnaq', 'manikur', 'gel'])) {
        return mergeGroups([
          commonGroups.color(),
          createGroup('effekt', 'Effekt', ['Klassik', 'Parlaq', 'Mat', 'Uzunömürlü']),
          commonGroups.volume(),
          createGroup('formula', 'Formula', ['Gel', 'Standart', 'Vitaminli'])
        ])
      }
      return beautyGroups()

    case 'saglamliq':
      if (hasAny(haystack, ['vitamin', 'omega', 'protein', 'amino', 'kreatin'])) {
        return mergeGroups([
          createGroup('forma', 'Forma', ['Tablet', 'Kapsul', 'Toz', 'Maye']),
          createGroup('miqdar', 'Miqdar', ['20 ədəd', '30 ədəd', '60 ədəd', '90 ədəd', '1 kq', '2 kq']),
          commonGroups.age(),
          createGroup('teyinat', 'Təyinat', ['İmmunitet', 'Enerji', 'Əzələ dəstəyi', 'Gündəlik vitamin'])
        ])
      }
      if (hasAny(haystack, ['tonometr', 'termometr', 'ilk yardim', 'maska', 'antiseptik'])) {
        return mergeGroups([
          createGroup('teyinat', 'Təyinat', ['Ev istifadəsi', 'Peşəkar', 'Gündəlik qoruma']),
          createGroup('olcu-format', 'Ölçü / Format', ['Kiçik', 'Standart', 'Böyük']),
          commonGroups.material(),
          createGroup('istifade', 'İstifadə tipi', ['Birdəfəlik', 'Təkrar istifadə'])
        ])
      }
      if (hasAny(haystack, ['ortopediya', 'bandaj', 'korset', 'altliq'])) {
        return mergeGroups([
          commonGroups.size(),
          commonGroups.material(),
          createGroup('destek', 'Dəstək səviyyəsi', ['Yüngül', 'Orta', 'Güclü']),
          createGroup('zona', 'Bədən zonası', ['Bel', 'Diz', 'Bilək', 'Ayaq'])
        ])
      }
      if (hasAny(haystack, ['ana', 'korpe', 'gigiyena', 'qidalandirma'])) {
        return mergeGroups([
          commonGroups.age(),
          commonGroups.volume(),
          createGroup('teyinat', 'Təyinat', ['Gigiyena', 'Qidalandırma', 'Baxım', 'Monitorinq']),
          commonGroups.material()
        ])
      }
      return healthGroups()

    case 'usaqlar-ucun':
      if (hasAny(haystack, ['geyim', 'ayaqqabi'])) {
        return mergeGroups([
          createGroup('yas-qrupu', 'Yaş qrupu', ['0-12 ay', '1-3 yaş', '4-6 yaş', '7-12 yaş']),
          apparelGroups(),
          [createGroup('cins', 'Cins', ['Oğlan', 'Qız', 'Uniseks'])]
        ])
      }
      if (hasAny(haystack, ['oyuncaq', 'puzzle', 'oyun'])) {
        return mergeGroups([
          commonGroups.age(),
          commonGroups.material(),
          createGroup('qidalanma', 'Enerji / Qidalanma', ['Batareyalı', 'Şarjlı', 'Mexaniki']),
          createGroup('tema', 'Tema', ['Təhsil', 'Əyləncə', 'Yaradıcılıq', 'Ailə oyunu'])
        ])
      }
      if (hasAny(haystack, ['korpe', 'besik', 'arabasi', 'bez', 'gigiyena'])) {
        return mergeGroups([
          commonGroups.age(),
          commonGroups.material(),
          commonGroups.color(),
          createGroup('teyinat', 'Təyinat', ['Gəzinti', 'Yuxu', 'Gigiyena', 'Qidalandırma'])
        ])
      }
      if (hasAny(haystack, ['mekteb', 'yaradiciliq', 'defterxana', 'boyama'])) {
        return mergeGroups([
          commonGroups.age(),
          commonGroups.color(),
          createGroup('format', 'Format', ['A4', 'A5', 'Set', 'Mini']),
          createGroup('fenn', 'Mövzu', ['Yazı', 'Rəsm', 'Riyaziyyat', 'Yaradıcı fəaliyyət'])
        ])
      }
      if (hasAny(haystack, ['otaq', 'dekor', 'lampa'])) {
        return mergeGroups([
          commonGroups.color(),
          commonGroups.material(),
          commonGroups.age(),
          createGroup('stil', 'Stil', ['Sevimli', 'Minimal', 'Tematik', 'Universal'])
        ])
      }
      return mergeGroups([homeGroups(), [commonGroups.age()]])

    case 'meiset-kimyasi':
      return cleaningGroups()

    case 'kitablar-hobbi-ve-ofis':
      if (hasAny(haystack, ['kitab', 'edebiyyat', 'tedris'])) {
        return mergeGroups([
          createGroup('dil', 'Dil', ['AZ', 'EN', 'RU', 'TR']),
          createGroup('uzluk', 'Üzlük', ['Yumşaq', 'Sərt']),
          commonGroups.age(),
          createGroup('janr', 'Janr', ['Bədii', 'Tədris', 'Biznes', 'Uşaq'])
        ])
      }
      if (hasAny(haystack, ['ofis', 'mekteb', 'defter', 'qelem', 'marker', 'kagiz'])) {
        return mergeGroups([
          commonGroups.color(),
          commonGroups.material(),
          createGroup('format', 'Format', ['A4', 'A5', 'Mini', 'Standart']),
          commonGroups.pack()
        ])
      }
      if (hasAny(haystack, ['hobbi', 'diy', 'musiqi', 'studiya'])) {
        return mergeGroups([
          commonGroups.material(),
          createGroup('olcu-format', 'Ölçü / Format', ['Kiçik', 'Orta', 'Böyük', 'Set']),
          createGroup('seviyye', 'Səviyyə', ['Başlanğıc', 'Orta', 'Peşəkar']),
          commonGroups.color()
        ])
      }
      return officeGroups()

    case 'bir-gaming':
      return gamingGroups()

    default:
      return []
  }
}

const buildCategoryHaystack = (category: CategoryRecord, byId: Map<number, CategoryRecord>) => {
  const parts: string[] = []
  let cursor: CategoryRecord | undefined = category
  const seen = new Set<number>()
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id)
    parts.unshift([
      cursor.slug,
      cursor.nameI18n.az,
      cursor.nameI18n.ru,
      cursor.nameI18n.en
    ].filter(Boolean).join(' '))
    cursor = cursor.parentId !== null ? byId.get(cursor.parentId) : undefined
  }
  return normalizeText(parts.join(' '))
}

const buildGeneratedSchema = (category: CategoryRecord, byId: Map<number, CategoryRecord>): ResolvedCategoryFilterSchema | null => {
  const rootId = category.parentId === null
    ? category.id
    : (() => {
        let cursor: CategoryRecord | undefined = category
        let root: CategoryRecord | undefined = category
        const seen = new Set<number>()
        while (cursor && !seen.has(cursor.id)) {
          seen.add(cursor.id)
          root = cursor
          cursor = cursor.parentId !== null ? byId.get(cursor.parentId) : undefined
        }
        return root?.id || category.id
      })()
  const rootCategory = byId.get(rootId)
  if (!rootCategory) return null
  const groups = resolveGroupsByRoot(rootCategory.slug, buildCategoryHaystack(category, byId))
  return {
    categoryId: category.id,
    groups,
    updatedAt: TEMPLATE_UPDATED_AT,
    source: 'auto',
    templateRootCategoryId: rootCategory.id
  }
}

export const buildResolvedCategoryFilterSchemas = (
  categories: CategoryRecord[],
  explicitSchemas: CategoryFilterSchema[]
) => {
  const byId = new Map(categories.map((category) => [category.id, category] as const))
  const explicitById = new Map(explicitSchemas.map((schema) => [Number(schema.categoryId), schema] as const))

  return categories.map((category) => {
    const explicit = explicitById.get(Number(category.id))
    if (explicit) {
      return {
        ...explicit,
        source: 'custom' as const,
        templateRootCategoryId: Number(category.id)
      }
    }
    return buildGeneratedSchema(category, byId)
  }).filter(Boolean) as ResolvedCategoryFilterSchema[]
}

export const resolveCategoryFilterSchema = (
  categoryId: number,
  categories: CategoryRecord[],
  explicitSchemas: CategoryFilterSchema[]
) => {
  const explicit = explicitSchemas.find((schema) => Number(schema.categoryId) === Number(categoryId))
  if (explicit) {
    return {
      ...explicit,
      source: 'custom' as const,
      templateRootCategoryId: Number(categoryId)
    }
  }
  const byId = new Map(categories.map((category) => [category.id, category] as const))
  const category = byId.get(Number(categoryId))
  if (!category) return null
  return buildGeneratedSchema(category, byId)
}
