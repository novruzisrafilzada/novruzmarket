export default [
  {
    id: 1,
    title: '20% ENDİRİM',
    subtitle: 'Elektronika',
    titleI18n: { az: '20% ENDİRİM', ru: 'СКИДКА 20%', en: '20% OFF' },
    subtitleI18n: { az: 'Elektronika', ru: 'Электроника', en: 'Electronics' },
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    link: '/shop',
    position: 'Top',
    status: 'Aktiv'
  },
  {
    id: 2,
    title: 'YENİ',
    subtitle: 'Aksesuarlar',
    titleI18n: { az: 'YENİ', ru: 'НОВОЕ', en: 'NEW' },
    subtitleI18n: { az: 'Aksesuarlar', ru: 'Аксессуары', en: 'Accessories' },
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
    link: '/shop',
    position: 'Middle',
    status: 'Aktiv'
  },
  {
    id: 3,
    title: 'İNDİ',
    subtitle: 'Oyun Dünyası',
    titleI18n: { az: 'İNDİ', ru: 'СЕЙЧАС', en: 'NOW' },
    subtitleI18n: { az: 'Oyun Dünyası', ru: 'Мир игр', en: 'Gaming world' },
    image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=1200&q=80',
    link: '/shop',
    position: 'Bottom',
    status: 'Aktiv'
  },
  {
    id: 4,
    title: 'TOP',
    subtitle: 'Mağaza vitrini',
    titleI18n: { az: 'TOP', ru: 'ТОП', en: 'TOP' },
    subtitleI18n: { az: 'Mağaza vitrini', ru: 'Витрина магазина', en: 'Shop showcase' },
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80',
    link: '/shop',
    position: 'Shop',
    status: 'Aktiv'
  }
] as const
