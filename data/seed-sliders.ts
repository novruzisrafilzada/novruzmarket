export default [
  {
    id: 1,
    title: 'Yeni iPhone 15 Pro',
    subtitle: 'İndi kəşf edin, ən yaxşı qiymətə!',
    titleI18n: { az: 'Yeni iPhone 15 Pro', ru: 'Новый iPhone 15 Pro', en: 'New iPhone 15 Pro' },
    subtitleI18n: { az: 'İndi kəşf edin, ən yaxşı qiymətə!', ru: 'Откройте сейчас по лучшей цене!', en: 'Discover it now at the best price!' },
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=80',
    link: '/shop',
    animate: true,
    status: 'Aktiv'
  },
  {
    id: 2,
    title: 'Oyun Dünyası',
    subtitle: 'Bütün oyun konsolları və aksesuarlar',
    titleI18n: { az: 'Oyun Dünyası', ru: 'Мир игр', en: 'Gaming world' },
    subtitleI18n: { az: 'Bütün oyun konsolları və aksesuarlar', ru: 'Все игровые консоли и аксессуары', en: 'All gaming consoles and accessories' },
    image: 'https://images.unsplash.com/photo-1605906302484-3c582e043683?auto=format&fit=crop&w=1200&q=80',
    link: '/shop',
    animate: true,
    status: 'Aktiv'
  }
] as const
