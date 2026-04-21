import {
  Accessibility,
  Armchair,
  Baby,
  Backpack,
  Bath,
  Bed,
  Bell,
  Briefcase,
  Cable,
  Camera,
  Car,
  CarFront,
  ChefHat,
  Circle,
  CircleDot,
  Cookie,
  Cpu,
  Disc,
  Droplets,
  Dumbbell,
  Fan,
  Gamepad2,
  GitBranch,
  Glasses,
  Headphones,
  Home,
  HousePlug,
  Lamp,
  Laptop,
  Lightbulb,
  Mic,
  Milk,
  Monitor,
  Music,
  Package,
  Paintbrush,
  Palette,
  PcCase,
  PencilRuler,
  Plug,
  Radar,
  ScanSearch,
  Scissors,
  ScrollText,
  Shield,
  ShieldCheck,
  Shirt,
  Smartphone,
  Snowflake,
  Sofa,
  Soup,
  Sparkles,
  Sun,
  Tablet,
  Trees,
  Tv,
  UtensilsCrossed,
  Video,
  Watch,
  Wifi,
  Wrench
} from 'lucide-vue-next'

const iconMap: Record<string, any> = {
  Accessibility,
  Armchair,
  Baby,
  Backpack,
  Bath,
  Bed,
  Bell,
  Briefcase,
  Cable,
  Camera,
  Car,
  CarFront,
  ChefHat,
  Circle,
  CircleDot,
  Cookie,
  Cpu,
  Disc,
  Droplets,
  Dumbbell,
  Fan,
  Gamepad2,
  GitBranch,
  Glasses,
  Headphones,
  Home,
  HousePlug,
  Lamp,
  Laptop,
  Lightbulb,
  Mic,
  Milk,
  Monitor,
  Music,
  Package,
  Paintbrush,
  Palette,
  PcCase,
  PencilRuler,
  Plug,
  Radar,
  ScanSearch,
  Scissors,
  ScrollText,
  Shield,
  ShieldCheck,
  Shirt,
  Smartphone,
  Snowflake,
  Sofa,
  Soup,
  Sparkles,
  Sun,
  Tablet,
  Trees,
  Tv,
  UtensilsCrossed,
  Video,
  Watch,
  Wifi,
  Wrench
}

const tones = [
  { surface: '#EEF2FF', surfaceStrong: '#DBE7FF', border: '#D6E2FF', icon: '#2B3E95' },
  { surface: '#ECFDF3', surfaceStrong: '#D9FBE8', border: '#C5F4DA', icon: '#047857' },
  { surface: '#FFF7CC', surfaceStrong: '#FFE999', border: '#FFE082', icon: '#8A6A00' },
  { surface: '#FFF1F2', surfaceStrong: '#FFD9DE', border: '#FFC7D0', icon: '#BE123C' },
  { surface: '#F5F3FF', surfaceStrong: '#E9E3FF', border: '#DCD2FF', icon: '#6D28D9' },
  { surface: '#ECFEFF', surfaceStrong: '#CFFAFE', border: '#B5F2F7', icon: '#0F766E' }
] as const

const slugIconOverrides: Record<string, any> = {
  'qida-mehsullari-ve-ickiler': UtensilsCrossed,
  'meiset-texnikasi': Home,
  'tv-audio-ve-video': Tv,
  'gozellik': Sparkles,
  'saglamliq': ShieldCheck,
  'usaqlar-ucun': Baby,
  'meiset-kimyasi': Droplets,
  'kitablar-hobbi-ve-ofis': ScrollText,
  'bir-gaming': Gamepad2,
  'elektronika': Monitor,
  'sexsi-esyalar': Shirt,
  'ev-ve-bag-ucun': Sofa
}

const keywordIconRules: Array<{ keywords: string[]; icon: any }> = [
  { keywords: ['avtomobil', 'registrator', 'naviqator', 'obd', 'starter'], icon: CarFront },
  { keywords: ['telefon', 'smartfon', 'iphone'], icon: Smartphone },
  { keywords: ['multimedia', 'audio', 'video', 'dinamik'], icon: Tv },
  { keywords: ['kamera', 'foto'], icon: Camera },
  { keywords: ['komputer', 'pc', 'noutbuk', 'laptop'], icon: Laptop },
  { keywords: ['monitor'], icon: Monitor },
  { keywords: ['oyun', 'gaming', 'gamepad', 'konsol'], icon: Gamepad2 },
  { keywords: ['kitab', 'qelem', 'ofis', 'hobby', 'hobbi'], icon: ScrollText },
  { keywords: ['gozellik', 'parfum', 'baxim', 'makiyaj', 'kosmetika'], icon: Sparkles },
  { keywords: ['usaq', 'oyuncaq', 'korpə', 'korpe'], icon: Baby },
  { keywords: ['ev', 'bag', 'mebel', 'divan', 'oturacaq', 'salon'], icon: Sofa },
  { keywords: ['bagaj', 'organizer', 'saxlama'], icon: Briefcase },
  { keywords: ['isiq', 'fara', 'lampa'], icon: Lightbulb },
  { keywords: ['filtr', 'antifriz', 'maye', 'kimya', 'temizlik'], icon: Droplets },
  { keywords: ['teker', 'tekerlek', 'sin', 'disk', 'bolt'], icon: CircleDot },
  { keywords: ['akkumulyator', 'kabel', 'invertor', 'kompressor'], icon: Cable },
  { keywords: ['aksesuar', 'aksesuarlari', 'qapaq', 'uzluk', 'ayaqalti'], icon: Wrench },
  { keywords: ['musiqi', 'mikrofon', 'qulaqliq'], icon: Headphones },
  { keywords: ['geyim', 'paltar', 'koynek', 'shirt'], icon: Shirt },
  { keywords: ['saat'], icon: Watch },
  { keywords: ['wifi', 'router'], icon: Wifi },
  { keywords: ['kuxna', 'metbex', 'qida', 'yemek'], icon: UtensilsCrossed }
]

const normalizeSlug = (value: string) => String(value || '').trim().toLowerCase()

const inferIconFromSlug = (slug: string) => {
  const normalized = normalizeSlug(slug)
  if (!normalized) return null
  for (const rule of keywordIconRules) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.icon
    }
  }
  return null
}

export const useCategoryPresentation = () => {
  const iconFor = (input: string | { icon?: string | null; slug?: string | null } | null | undefined) => {
    if (typeof input === 'string') {
      return iconMap[String(input || '').trim()] || Package
    }
    const iconName = String(input?.icon || '').trim()
    const slug = normalizeSlug(input?.slug || '')
    if (slug && (iconName === '' || iconName === 'Package') && slugIconOverrides[slug]) {
      return slugIconOverrides[slug]
    }
    const inferred = inferIconFromSlug(slug)
    if (iconMap[iconName] && iconName !== 'Package') return iconMap[iconName]
    return slugIconOverrides[slug] || inferred || CircleDot
  }

  const toneFor = (category: { id?: number | string } | null | undefined) => {
    const raw = Number(category?.id || 0)
    const index = Math.abs(Number.isFinite(raw) ? raw : 0) % tones.length
    return tones[index]
  }

  const cardStyleFor = (category: { id?: number | string } | null | undefined) => {
    const tone = toneFor(category)
    return {
      background: `linear-gradient(180deg, ${tone.surface} 0%, #ffffff 100%)`,
      borderColor: tone.border
    }
  }

  const iconWrapStyleFor = (category: { id?: number | string } | null | undefined) => {
    const tone = toneFor(category)
    return {
      backgroundColor: tone.surfaceStrong,
      color: tone.icon
    }
  }

  const iconColorStyleFor = (category: { id?: number | string } | null | undefined) => {
    const tone = toneFor(category)
    return {
      color: tone.icon
    }
  }

  return {
    iconFor,
    toneFor,
    cardStyleFor,
    iconWrapStyleFor,
    iconColorStyleFor
  }
}
