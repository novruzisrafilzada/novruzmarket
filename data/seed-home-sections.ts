export default {
  ui: {
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
  },
  promoStrip: {
    enabled: true,
    speedSec: 30,
    itemsI18n: [
      { az: 'PULSUZ ÇATDIRILMA', ru: 'БЕСПЛАТНАЯ ДОСТАВКА', en: 'FREE DELIVERY' },
      { az: '30% ENDİRİM', ru: 'СКИДКА 30%', en: '30% OFF' },
      { az: 'YENİ MƏHSULLAR', ru: 'НОВЫЕ ТОВАРЫ', en: 'NEW PRODUCTS' }
    ]
  },
  news: {
    enabled: true,
    titleI18n: { az: 'Yeniliklər', ru: 'Новинки', en: 'New arrivals' },
    badgeI18n: { az: 'YENİLİK', ru: 'НОВИНКА', en: 'NEW' },
    days: 7
  },
  topSelling: {
    enabled: true,
    titleI18n: { az: 'Ən çox satılan məhsullar', ru: 'Топ продаж', en: 'Top selling products' },
    categoryIds: [] as number[],
    productLimit: 10,
    showQuickView: false
  },
  topProducts: {
    enabled: true,
    titleI18n: { az: 'Top Məhsullar', ru: 'Топ товары', en: 'Top products' },
    productIds: [] as number[]
  },
  featuredCategories: {
    enabled: true,
    titleI18n: { az: 'Seçilmiş kateqoriyalar', ru: 'Избранные категории', en: 'Featured categories' },
    subtitleI18n: { az: 'Müasir və sürətli keçid üçün seçilmiş kolleksiyalar', ru: 'Подборки для быстрого современного перехода', en: 'Curated collections for a modern quick start' },
    limit: 8
  },
  featuredSellers: {
    enabled: true,
    titleI18n: { az: 'Seçilmiş mağazalar', ru: 'Избранные магазины', en: 'Featured stores' },
    subtitleI18n: { az: 'Platformada önə çıxan satıcıları kəşf edin', ru: 'Откройте магазины, выделенные на платформе', en: 'Discover sellers highlighted on the platform' },
    limit: 4
  },
  sellerProducts: {
    enabled: true,
    titleI18n: { az: 'Seçilmiş satıcı məhsulları', ru: 'Товары продавцов', en: 'Seller picks' },
    subtitleI18n: { az: 'Mağazalardan modern vitrin məhsulları', ru: 'Современная витрина товаров от продавцов', en: 'Modern showcase products from sellers' },
    limit: 8
  },
  trendingNow: {
    enabled: true,
    titleI18n: { az: 'İndi trenddə', ru: 'Сейчас в тренде', en: 'Trending now' },
    subtitleI18n: { az: 'Ən çox baxılan və maraq doğuran məhsullar', ru: 'Самые просматриваемые и интересные товары', en: 'Most viewed and engaging products' },
    limit: 4
  },
  popularSearches: {
    enabled: true,
    titleI18n: { az: 'Populyar axtarışlar', ru: 'Популярные поиски', en: 'Popular searches' },
    subtitleI18n: { az: 'Alıcıların ən çox axtardığı istiqamətlərdən sürətli keçid edin', ru: 'Быстрый переход к самым популярным запросам покупателей', en: 'Jump into the most searched terms shoppers use' },
    limit: 8
  },
  shopByBudget: {
    enabled: true,
    titleI18n: { az: 'Büdcəyə görə alış-veriş', ru: 'Покупки по бюджету', en: 'Shop by budget' },
    subtitleI18n: { az: 'Büdcənizə uyğun məhsulları bir kliklə kəşf edin', ru: 'Откройте товары по своему бюджету в один клик', en: 'Discover products by your budget in one click' },
    cards: [
      { labelI18n: { az: '50 AZN-ə qədər', ru: 'До 50 AZN', en: 'Under 50 AZN' }, subtitleI18n: { az: 'Gündəlik sərfəli seçimlər', ru: 'Доступные ежедневные товары', en: 'Affordable daily picks' }, minPrice: 0, maxPrice: 50, href: '/shop?maxPrice=50' },
      { labelI18n: { az: '50 - 150 AZN', ru: '50 - 150 AZN', en: '50 - 150 AZN' }, subtitleI18n: { az: 'Ən çox seçilən balanslı seçimlər', ru: 'Самый популярный сбалансированный выбор', en: 'Most popular balanced picks' }, minPrice: 50, maxPrice: 150, href: '/shop?minPrice=50&maxPrice=150' },
      { labelI18n: { az: '150 - 500 AZN', ru: '150 - 500 AZN', en: '150 - 500 AZN' }, subtitleI18n: { az: 'Daha premium modellər', ru: 'Более премиальные модели', en: 'More premium models' }, minPrice: 150, maxPrice: 500, href: '/shop?minPrice=150&maxPrice=500' },
      { labelI18n: { az: '500+ AZN', ru: '500+ AZN', en: '500+ AZN' }, subtitleI18n: { az: 'Top cihazlar və premium texnologiya', ru: 'Топ устройства и премиум технологии', en: 'Top devices and premium tech' }, minPrice: 500, maxPrice: 0, href: '/shop?minPrice=500' }
    ]
  },
  bestRatedProducts: {
    enabled: true,
    titleI18n: { az: 'Ən yüksək reytinqli məhsullar', ru: 'Лучшие по рейтингу', en: 'Best rated products' },
    subtitleI18n: { az: 'Müştərilərin daha çox bəyəndiyi məhsullar', ru: 'Товары с лучшими оценками покупателей', en: 'Products loved by customers the most' },
    limit: 8
  },
  shopByBrand: {
    enabled: true,
    titleI18n: { az: 'Brendə görə alış-veriş', ru: 'Покупки по брендам', en: 'Shop by brand' },
    subtitleI18n: { az: 'Sevdiyiniz markalara birbaşa keçid edin', ru: 'Переходите напрямую к любимым брендам', en: 'Jump directly to the brands shoppers trust' },
    cards: [
      { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', href: '/shop?q=Apple' },
      { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', href: '/shop?q=Samsung' },
      { name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', href: '/shop?q=Sony' },
      { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', href: '/shop?q=Nike' }
    ]
  },
  frequentlyBoughtTogether: {
    enabled: true,
    titleI18n: { az: 'Birlikdə tez-tez alınır', ru: 'Часто покупают вместе', en: 'Frequently bought together' },
    subtitleI18n: { az: 'Sifariş tarixçəsinə əsasən ən çox birlikdə alınan məhsullar', ru: 'Пары товаров, которые чаще всего заказывают вместе', en: 'Pairs of products customers most often buy together' },
    limit: 4
  },
  sellerTrustMetrics: {
    enabled: true,
    titleI18n: { az: 'Satıcı etibar göstəriciləri', ru: 'Метрики доверия продавцов', en: 'Seller trust metrics' },
    subtitleI18n: { az: 'Etibar, stok və satış aktivliyinə görə önə çıxan mağazalar', ru: 'Магазины с лучшими показателями доверия, наличия и продаж', en: 'Stores leading in trust, stock depth and sales activity' },
    limit: 4
  },
  flashDeals: {
    enabled: true,
    titleI18n: { az: 'Ani fürsətlər', ru: 'Мгновенные предложения', en: 'Flash deals' },
    subtitleI18n: { az: 'Vaxtı məhdud endirimləri qaçırmayın', ru: 'Не пропустите предложения с ограниченным временем', en: 'Catch limited-time deals before they end' },
    ctaLabelI18n: { az: 'İndi al', ru: 'Купить', en: 'Shop now' }
  },
  verifiedSellers: {
    enabled: true,
    titleI18n: { az: 'Yoxlanılmış mağazalar', ru: 'Проверенные магазины', en: 'Verified sellers' },
    subtitleI18n: { az: 'PRO statusu olan və önə çıxan mağazalar', ru: 'Магазины со статусом PRO и усиленной витриной', en: 'Featured sellers with PRO status and boosted presence' },
    limit: 4
  },
  buyerProtection: {
    enabled: true,
    titleI18n: { az: 'Alıcı qorunması', ru: 'Защита покупателя', en: 'Buyer protection' },
    subtitleI18n: { az: 'Marketplace alış-verişində etibar və rahatlıq üçün əsas üstünlüklər', ru: 'Ключевые преимущества для безопасной и комфортной покупки', en: 'Core benefits for secure and comfortable marketplace shopping' },
    items: [
      { icon: 'shield', titleI18n: { az: 'Təhlükəsiz ödəniş', ru: 'Безопасная оплата', en: 'Secure payment' }, subtitleI18n: { az: 'Ödəniş mərhələləri qorunur', ru: 'Этапы оплаты защищены', en: 'Checkout is protected' } },
      { icon: 'truck', titleI18n: { az: 'Sürətli çatdırılma', ru: 'Быстрая доставка', en: 'Fast delivery' }, subtitleI18n: { az: 'Satıcı və regiona görə çevik çatdırılma', ru: 'Гибрая доставка по продавцу и региону', en: 'Flexible shipping by seller and region' } },
      { icon: 'rotate-ccw', titleI18n: { az: 'Rahat qaytarma', ru: 'Лёгкий возврат', en: 'Easy returns' }, subtitleI18n: { az: 'Uyğun sifarişlər üçün rahat qaytarma', ru: 'Удобный возврат для подходящих заказов', en: 'Easy returns for eligible orders' } },
      { icon: 'badge-check', titleI18n: { az: 'Yoxlanılmış satıcılar', ru: 'Проверенные продавцы', en: 'Verified sellers' }, subtitleI18n: { az: 'Daha güvənli mağaza seçimi', ru: 'Более надёжный выбор магазина', en: 'A more trustworthy store choice' } }
    ]
  },
  marketHighlights: {
    enabled: true,
    titleI18n: { az: 'Marketplace üstünlükləri', ru: 'Преимущества платформы', en: 'Marketplace highlights' },
    subtitleI18n: { az: 'Platformanın güclü tərəflərini bir baxışda görün', ru: 'Сильные стороны платформы с первого взгляда', en: 'See the platform strengths at a glance' }
  },
  recentlyViewed: {
    enabled: true,
    titleI18n: { az: 'Əvvəl baxdıqlarınız', ru: 'Вы смотрели', en: 'Recently viewed' }
  },
  experienceBuilder: {
    audienceMode: 'general',
    sectionOrder: ['hero', 'campaignBlocks', 'features', 'popularSearches', 'shopByBudget', 'shopByBrand', 'flashDeals', 'storyNewArrivals', 'storyTrending', 'topDeals', 'bannerAfterTopDeals', 'topSelling', 'bestRatedProducts', 'frequentlyBoughtTogether', 'topProducts', 'bannerAfterTopProducts', 'storyWeeklyPick', 'storyEditorsPick', 'featuredCategories', 'featuredSellers', 'sellerTrustMetrics', 'verifiedSellers', 'sellerProducts', 'buyerProtection', 'trendingNow', 'lookbook', 'ugcShowcase', 'recentlyViewed', 'marketHighlights']
  },
  campaignBlocks: [
    {
      enabled: true,
      audience: 'all',
      titleI18n: { az: 'Yeni mövsüm seçimi', ru: 'Новый сезон', en: 'New season picks' },
      subtitleI18n: { az: 'Trend məhsullar və premium seçimlər bir yerdə.', ru: 'Трендовые товары и премиум подборки в одном месте.', en: 'Trending products and premium edits in one place.' },
      ctaLabelI18n: { az: 'Kəşf et', ru: 'Открыть', en: 'Explore' },
      href: '/shop',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80'
    }
  ],
  storytelling: {
    newArrivals: {
      enabled: true,
      titleI18n: { az: 'Yeni gələnlər', ru: 'Новые поступления', en: 'New arrivals' },
      subtitleI18n: { az: 'Son əlavə edilən kreativ məhsullar', ru: 'Последние креативные поступления', en: 'Fresh creative additions' },
      limit: 8
    },
    trending: {
      enabled: true,
      titleI18n: { az: 'Trenddə olanlar', ru: 'Сейчас в тренде', en: 'Trending now' },
      subtitleI18n: { az: 'İstifadəçilərin ən çox baxdığı seçimlər', ru: 'Выбор, который чаще всего просматривают', en: 'Most-viewed picks by shoppers' },
      limit: 8
    },
    weeklyPick: {
      enabled: true,
      titleI18n: { az: 'Bu həftənin seçimi', ru: 'Выбор недели', en: 'This week’s pick' },
      subtitleI18n: { az: 'Komandamızın seçdiyi məhsullar', ru: 'Товары, выбранные нашей командой', en: 'Handpicked items by our team' },
      productIds: []
    },
    editorsPick: {
      enabled: true,
      titleI18n: { az: 'Redaktor seçimi', ru: 'Выбор редактора', en: 'Editor’s choice' },
      subtitleI18n: { az: 'Stil və istifadə rahatlığı üçün seçilmiş məhsullar', ru: 'Товары для стиля и удобства', en: 'Selected for style and ease of use' },
      productIds: []
    }
  },
  lookbook: {
    enabled: true,
    titleI18n: { az: 'Lookbook', ru: 'Лукбук', en: 'Lookbook' },
    subtitleI18n: { az: 'Hazır kombinlər və ilham verən vitrinlər', ru: 'Готовые подборки и вдохновляющие витрины', en: 'Ready-made combinations and inspiring edits' },
    blocks: [
      {
        titleI18n: { az: 'Minimalist gündəlik stil', ru: 'Минималистичный стиль', en: 'Minimal daily style' },
        subtitleI18n: { az: 'Yüngül tonlar və rahat seçimlər', ru: 'Лёгкие оттенки и комфортные товары', en: 'Light tones and easy picks' },
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
        href: '/shop'
      }
    ]
  },
  ugcShowcase: {
    enabled: true,
    titleI18n: { az: 'Influencer & UGC vitrinləri', ru: 'Витрины UGC', en: 'Influencer & UGC showcase' },
    subtitleI18n: { az: 'İstifadəçi məzmunu ilə daha güclü etibar yaradın', ru: 'Создайте больше доверия с пользовательским контентом', en: 'Build stronger trust with user content' },
    cards: [
      {
        creator: 'Aylin',
        handle: '@stylewithaylin',
        textI18n: { az: 'Bu seçimlər gündəlik stilimi tamamlamağa kömək edir.', ru: 'Эти подборки помогают завершить мой повседневный стиль.', en: 'These selections complete my daily style.' },
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
        href: '/shop'
      }
    ]
  }
} as const
