export default {
  siteName: 'Duka Market',
  siteLogo: 'https://dukamarket.com/logo.png',
  siteEmail: 'support@dukamarket.com',
  sitePhone: '+994 50 123 45 67',
  address: 'Bakı, Azərbaycan',
  language: 'az',
  socials: {
    whatsapp: 'https://wa.me/994501234567',
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    youtube: 'https://youtube.com/',
  },
  heroAnimations: true,
  appPromo: {
    enabled: true,
    title: 'DukaMarket Tətbiqini İndi Yükləyin!',
    subtitle: 'iOS və Android üçün tətbiqimiz var. Endirimlərdən ilk sən xəbər tut.',
    image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80',
    iosLink: '#',
    androidLink: '#'
  },
  creativeSuite: {
    recentSalesPopupEnabled: true,
    waitlistEnabled: true,
    lowStockThreshold: 5,
    loyaltyEnabled: true,
    pointsPerOrderUnit: 1,
    firstOrderBonusPoints: 50,
    referralRewardPoints: 35,
    badgeThresholds: [
      { label: 'Bronze', minPoints: 0 },
      { label: 'Silver', minPoints: 150 },
      { label: 'Gold', minPoints: 400 },
      { label: 'Platinum', minPoints: 900 }
    ],
    searchSynonyms: [
      { term: 'iphone', aliases: ['telefon', 'mobil'] },
      { term: 'apple', aliases: ['aple'] }
    ],
    didYouMeanEnabled: true,
    popularSearchesEnabled: true,
    seasonalTheme: 'none',
    darkModeEnabled: true,
    featuredSellerLabel: 'Featured seller'
  },
  productUsageGuide: {
    enabled: true,
    cards: [
      {
        enabled: true,
        title: 'Size / fit guide',
        text: 'Məhsul ölçüləri və istifadə forması üçün xüsusiyyət və variasiyaları müqayisə edin.'
      },
      {
        enabled: true,
        title: 'Usage guide',
        text: 'Məhsulu uzunömürlü istifadə üçün texniki xüsusiyyətlərə uyğun formada istifadə edin.'
      },
      {
        enabled: true,
        title: 'Best pairing',
        text: 'Bu məhsulu uyğun aksesuar və oxşar məhsulla birlikdə almaq daha yaxşı təcrübə yaradır.'
      }
    ]
  },
  contactPage: {
    heroBadge: 'Contact Hub',
    heroTitle: 'Bizimlə əlaqə saxlayın',
    heroSubtitle: 'Sifariş, əməkdaşlıq, mağaza dəstəyi və ümumi suallar üçün ən uyğun kanaldan bizə yazın və ya zəng edin.',
    primaryCtaLabel: 'WhatsApp ilə yaz',
    primaryCtaHref: 'https://wa.me/994501234567',
    secondaryCtaLabel: 'Mağazaya keç',
    secondaryCtaHref: '/shop',
    whatsappLabel: 'Canlı dəstək',
    showSocials: true,
    showBusinessHours: true,
    showFaq: true,
    infoCards: [
      { key: 'address', enabled: true, label: 'Ünvan', description: 'Ofis və görüş nöqtəsi' },
      { key: 'phone', enabled: true, label: 'Telefon', description: 'Birbaşa satış və dəstək xətti' },
      { key: 'email', enabled: true, label: 'E-poçt', description: 'Sorğu və əməkdaşlıq üçün' },
      { key: 'whatsapp', enabled: true, label: 'WhatsApp', description: 'Sürətli mesaj dəstəyi' }
    ],
    businessHours: [
      { day: 'B.e - C.', hours: '09:00 - 18:00' },
      { day: 'Şənbə', hours: '10:00 - 15:00' },
      { day: 'Bazar', hours: 'İstirahət' }
    ],
    faqs: [
      { enabled: true, question: 'Cavab müddəti nə qədərdir?', answer: 'İş saatlarında gələn sorğular adətən 15-30 dəqiqə ərzində cavablanır.' },
      { enabled: true, question: 'Topdan və əməkdaşlıq üçün necə yaza bilərəm?', answer: 'Email və ya WhatsApp üzərindən əməkdaşlıq mövzusu ilə bizə yazın.' },
      { enabled: true, question: 'Sifariş problemi üçün hansı kanal uyğundur?', answer: 'Ən sürətli həll üçün telefon və ya WhatsApp kanalından istifadə edin.' }
    ]
  },
  cartCheckout: {
    cartBadge: 'Cart Experience',
    cartTitle: 'Səbətinizi tamamlayın',
    cartSubtitle: 'Seçilən məhsulları yoxlayın, kupon tətbiq edin və bir neçə addımda sifarişi tamamlayın.',
    vatIncludedLabel: 'ƏDV daxildir (18%)',
    vatIncludedDescription: 'Qiymətlərə ƏDV əvvəlcədən daxil edilib, checkout zamanı əlavə vergi hesablanmır.',
    vatRatePercent: 18,
    showVatIncluded: true,
    enableCityAutofill: true,
    preferredCityDetection: 'device_then_ip',
    cartAccentBg: '#EFF6FF',
    cartAccentText: '#1D4ED8',
    checkoutAccentBg: '#EFF6FF',
    checkoutAccentText: '#1D4ED8',
    cartHighlights: [
      { enabled: true, label: 'Təhlükəsiz checkout' },
      { enabled: true, label: 'Canlı kupon dəstəyi' },
      { enabled: true, label: 'Aydın sifariş xülasəsi' }
    ],
    checkoutBadge: 'Secure Checkout',
    checkoutTitle: 'Sifarişi təhlükəsiz tamamlayın',
    checkoutSubtitle: 'Ünvan, çatdırılma və ödəniş axınını bir yerdə daha aydın və rahat idarə edin.',
    checkoutSupportTitle: 'Checkout dəstəyi',
    checkoutSupportText: 'Çatdırılma və ödənişlə bağlı sualınız olduqda dəstək komandamız operativ cavab verir.',
    showCartStickySummary: true,
    showCheckoutSupport: true,
    checkoutTrustBadges: [
      { enabled: true, label: 'Şəffaf məbləğ' },
      { enabled: true, label: 'Qorunan ödəniş' },
      { enabled: true, label: 'İzlənən sifariş' }
    ]
  },
  mobileExperience: {
    enabled: true,
    compactTypography: true,
    stickyHeader: true,
    bottomTabBar: true,
    hideHeavyFooterOnMobile: true,
    catalogHelperHeadings: false,
    densityProfiles: {
      home: 'compact',
      shop: 'compact',
      product: 'compact',
      cart: 'compact',
      checkout: 'compact'
    }
  },
  googleMapsEmbedUrl: '',
  flashSale: {
    enabled: true,
    badge: 'NEW',
    text: 'Flash Satış: 50%-ə qədər endirim!'
  },
  homeFeatures: [
    {
      enabled: true,
      icon: 'Truck',
      title: { az: 'Pulsuz çatdırılma', ru: 'Бесплатная доставка', en: 'Free shipping' },
      description: { az: '$120-dan yuxarı bütün sifarişlər üçün', ru: 'Для заказов от $120', en: 'For orders over $120' },
    },
    {
      enabled: true,
      icon: 'ShieldCheck',
      title: { az: 'Təhlükəsiz ödəniş', ru: 'Безопасная оплата', en: 'Secure payment' },
      description: { az: '100% təhlükəsiz ödəniş zəmanəti', ru: '100% гарантия безопасности', en: '100% secure payment' },
    },
    {
      enabled: true,
      icon: 'Headphones',
      title: { az: '24/7 Yardım mərkəzi', ru: 'Поддержка 24/7', en: '24/7 Support' },
      description: { az: 'Hər zaman sizin xidmətinizdəyik', ru: 'Мы всегда на связи', en: 'We are always here' },
    },
    {
      enabled: true,
      icon: 'RotateCcw',
      title: { az: 'Dostluq xidməti', ru: 'Лёгкий возврат', en: 'Easy returns' },
      description: { az: '30 gün ərzində qaytarma zəmanəti', ru: 'Возврат в течение 30 дней', en: '30-day returns' },
    }
  ],
  productInfoBlocks: [
    {
      enabled: true,
      icon: 'Truck',
      image: '',
      title: { az: 'Pulsuz çatdırılma', ru: 'Бесплатная доставка', en: 'Free shipping' },
      description: { az: 'Seçilmiş məhsullarda pulsuz çatdırılma.', ru: 'Бесплатная доставка на выбранные товары.', en: 'Free shipping on selected items.' },
      detailTitle: { az: 'Çatdırılma məlumatı', ru: 'Информация о доставке', en: 'Shipping details' },
      detailIntro: {
        az: 'Bu məhsul üçün çatdırılma məlumatları və əsas göndərilmə şərtləri burada göstərilir.',
        ru: 'Здесь отображается информация о доставке и основные условия отправки.',
        en: 'Shipping information and key delivery terms are shown here.'
      },
      detailRows: [
        {
          label: { az: 'Kuryer', ru: 'Курьер', en: 'Courier' },
          value: { az: 'Postcargo, Starex, Limak və digər yerli partnyorlar', ru: 'Postcargo, Starex, Limak и другие локальные партнеры', en: 'Postcargo, Starex, Limak and local partners' }
        },
        {
          label: { az: 'Çatdırılma vaxtı', ru: 'Срок доставки', en: 'Delivery time' },
          value: { az: '1-4 iş günü', ru: '1-4 рабочих дня', en: '1-4 business days' }
        },
        {
          label: { az: 'Xərc', ru: 'Стоимость', en: 'Cost' },
          value: { az: 'Pulsuz çatdırılma', ru: 'Бесплатная доставка', en: 'Free delivery' }
        }
      ],
      detailCards: [],
      detailNotes: [
        {
          text: {
            az: 'Məhsul sifarişdən sonra izlənilir və gecikmə olduğu halda dəstək komandamız sizə məlumat verir.',
            ru: 'После заказа вы получаете отслеживание и поддержку при задержках.',
            en: 'Orders are tracked and our support team assists in case of delays.'
          }
        }
      ],
      detailHtml: {
        az: '<div class="space-y-4"><div class="grid gap-3"><div class="rounded-2xl border border-gray-100 overflow-hidden"><div class="grid grid-cols-[160px,1fr]"><div class="bg-gray-50 px-5 py-4 font-bold text-gray-700">Kuryer</div><div class="px-5 py-4 text-gray-700">Postcargo, Starex, Limak və digər yerli partnyorlar</div></div><div class="grid grid-cols-[160px,1fr] border-t border-gray-100"><div class="bg-gray-50 px-5 py-4 font-bold text-gray-700">Çatdırılma vaxtı</div><div class="px-5 py-4 text-gray-700">1-4 iş günü ərzində</div></div><div class="grid grid-cols-[160px,1fr] border-t border-gray-100"><div class="bg-gray-50 px-5 py-4 font-bold text-gray-700">Xərc</div><div class="px-5 py-4 text-gray-700">Bu məhsul üçün pulsuz göndərmə aktivdir</div></div></div></div><div class="rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4 text-sm font-medium text-emerald-800">Məhsul sifarişdən sonra izlənilir və gecikmə olduğu halda dəstək komandamız sizə məlumat verir.</div></div>',
        ru: '<p>Информация о бесплатной доставке доступна для выбранных товаров.</p>',
        en: '<p>Free shipping details are available for selected products.</p>'
      }
    },
    {
      enabled: true,
      icon: 'BadgeCheck',
      image: '',
      title: { az: 'Sifariş qarantisi', ru: 'Гарантия заказа', en: 'Order guarantee' },
      description: { az: 'Sifarişiniz izlənir və dəstək verilir.', ru: 'Отслеживание и поддержка заказа.', en: 'Order tracking and support.' },
      detailTitle: { az: 'Sifariş zəmanəti', ru: 'Гарантия заказа', en: 'Order guarantee' },
      detailIntro: {
        az: 'Sifarişinizin təhlükəsizliyi və zəmanət qaydaları bu hissədə göstərilir.',
        ru: 'Здесь отображаются гарантии и правила безопасности заказа.',
        en: 'Order safety and guarantee details are shown in this section.'
      },
      detailRows: [],
      detailCards: [
        {
          title: { az: 'Təhlükəsizlik və məxfilik', ru: 'Безопасность и конфиденциальность', en: 'Security and privacy' },
          description: { az: 'Təhlükəsiz ödəniş, məxfilik təminatı və qorunan sifariş tarixçəsi.', ru: 'Безопасная оплата, защита конфиденциальности и истории заказа.', en: 'Secure payments, privacy protection, and protected order history.' }
        },
        {
          title: { az: 'Çatdırılma zəmanəti', ru: 'Гарантия доставки', en: 'Delivery guarantee' },
          description: { az: 'Gecikmə zamanı dəstək, izləmə kodu və operativ həll.', ru: 'Поддержка при задержке, трек-код и оперативное решение.', en: 'Delay support, tracking code, and quick resolution.' }
        }
      ],
      detailNotes: [],
      detailHtml: {
        az: '<div class="grid gap-4 sm:grid-cols-2"><div class="rounded-2xl border border-gray-100 bg-gray-50 p-5"><div class="text-base font-extrabold text-gray-900">Təhlükəsizlik və məxfilik</div><ul class="mt-3 space-y-2 text-sm font-medium text-gray-600"><li>• Təhlükəsiz ödəniş</li><li>• Məxfilik təminatı</li><li>• Sifariş tarixçəsi qorunur</li></ul></div><div class="rounded-2xl border border-gray-100 bg-gray-50 p-5"><div class="text-base font-extrabold text-gray-900">Çatdırılma zəmanəti</div><ul class="mt-3 space-y-2 text-sm font-medium text-gray-600"><li>• Gecikmə zamanı dəstək</li><li>• Sifariş izləmə kodu</li><li>• Məhsul problemi üçün operativ həll</li></ul></div></div>',
        ru: '<p>Подробная гарантия заказа редактируется администратором.</p>',
        en: '<p>Detailed order guarantee content can be edited by the admin.</p>'
      }
    },
    {
      enabled: true,
      icon: 'CreditCard',
      image: '',
      title: { az: 'Təhlükəsiz ödəmələr', ru: 'Безопасные платежи', en: 'Secure payments' },
      description: { az: 'Ödənişlər təhlükəsiz şəkildə qorunur.', ru: 'Платежи защищены.', en: 'Payments are protected.' },
      detailTitle: { az: 'Ödəniş təhlükəsizliyi', ru: 'Безопасность платежей', en: 'Payment security' },
      detailIntro: {
        az: 'Kart və digər ödəniş metodları təhlükəsiz checkout axını üzərindən idarə olunur.',
        ru: 'Карты и другие методы оплаты управляются через безопасный checkout.',
        en: 'Card and other payment methods are managed through a secure checkout flow.'
      },
      detailRows: [],
      detailCards: [
        {
          title: { az: 'Qoruma səviyyələri', ru: 'Уровни защиты', en: 'Protection layers' },
          description: { az: 'Təhlükəsiz checkout, təsdiqlənmiş status və ödəniş tarixçəsi.', ru: 'Безопасный checkout, подтвержденный статус и история платежей.', en: 'Secure checkout, confirmed status, and payment history.' }
        }
      ],
      detailNotes: [],
      detailHtml: {
        az: '<div class="space-y-4"><p class="text-sm font-medium text-gray-600">Kart ödənişləri və digər metodlar təhlükəsiz şəkildə emal edilir. Ödəniş statusu admin paneldən izlənə bilir.</p><div class="rounded-2xl border border-gray-100 bg-gray-50 p-5"><div class="text-sm font-extrabold text-gray-900">Qoruma səviyyələri</div><ul class="mt-3 space-y-2 text-sm font-medium text-gray-600"><li>• Təhlükəsiz checkout axını</li><li>• Təsdiqlənmiş ödəniş statusu</li><li>• Sifariş və ödəniş tarixçəsi</li></ul></div></div>',
        ru: '<p>Платежи проходят через безопасный checkout и контролируются администратором.</p>',
        en: '<p>Payments are processed through a secure checkout flow and tracked by the admin.</p>'
      }
    },
    {
      enabled: true,
      icon: 'Sparkles',
      image: '',
      title: { az: 'Niyə bizi seçməlisiz', ru: 'Почему выбирают нас', en: 'Why choose us' },
      description: { az: 'Keyfiyyət, dəstək və sərfəli qiymət.', ru: 'Качество, поддержка и выгодные цены.', en: 'Quality, support, and best prices.' },
      detailTitle: { az: 'Bizim üstünlüklər', ru: 'Наши преимущества', en: 'Why shop with us' },
      detailIntro: {
        az: 'Mağazamızın əsas üstünlükləri və istifadəçi faydaları burada göstərilir.',
        ru: 'Здесь показаны основные преимущества и ценность нашего магазина.',
        en: 'This section highlights the key benefits of shopping with us.'
      },
      detailRows: [],
      detailCards: [
        {
          title: { az: 'Seçilmiş məhsullar', ru: 'Отобранные товары', en: 'Curated products' },
          description: { az: 'Yalnız təsdiqlənmiş satıcılar və keyfiyyətli məhsullar təqdim olunur.', ru: 'Только проверенные продавцы и качественные товары.', en: 'Only verified sellers and quality products are presented.' }
        },
        {
          title: { az: 'Dəstək və rahatlıq', ru: 'Поддержка и удобство', en: 'Support and convenience' },
          description: { az: 'Qeydiyyat, sifariş və ödəniş axınları rahat idarə olunur.', ru: 'Регистрация, заказ и оплата управляются удобно.', en: 'Registration, ordering, and payments are easy to manage.' }
        }
      ],
      detailNotes: [],
      detailHtml: {
        az: '<div class="grid gap-4 sm:grid-cols-2"><div class="rounded-2xl border border-gray-100 p-5"><div class="text-base font-extrabold text-gray-900">Seçilmiş məhsullar</div><p class="mt-2 text-sm font-medium text-gray-600">Saytda yalnız təsdiqlənmiş satıcılar və keyfiyyətli məhsullar təqdim olunur.</p></div><div class="rounded-2xl border border-gray-100 p-5"><div class="text-base font-extrabold text-gray-900">Dəstək və rahatlıq</div><p class="mt-2 text-sm font-medium text-gray-600">Qeydiyyat, sifariş, çatdırılma və ödəniş axınları bir mərkəzdən rahat idarə olunur.</p></div></div>',
        ru: '<p>Преимущества магазина можно редактировать из админ панели.</p>',
        en: '<p>Store benefits can be customized from the admin panel.</p>'
      }
    }
  ],
  newsletter: {
    enabled: true,
    title: { az: 'Bülletenimizə abunə olun', ru: 'Подпишитесь на рассылку', en: 'Subscribe to our newsletter' },
    subtitle: { az: 'Hər şənbə günü yeni endirim kuponu əldə edin.', ru: 'Получайте купоны на скидку каждую субботу.', en: 'Get discount coupons every Saturday.' },
    placeholder: { az: 'E-poçt ünvanınızı daxil edin', ru: 'Введите email', en: 'Enter your email' },
    button: { az: 'Abunə ol', ru: 'Подписаться', en: 'Subscribe' }
  },
  newsletterAutomation: {
    enabled: false,
    onNewProduct: true,
    onNewBlog: true,
    onNewBanner: false,
    onNewSlider: false
  },
  emailAutomation: {
    enabled: false,
    testTo: '',
    onWelcomeSignup: true,
    onWelcomeNewsletterSubscribe: true,
    onOrderCreated: true,
    onOrderStatusChanged: true,
    welcomeSubject: 'Xoş gəldiniz, {{name}}!',
    welcomeHtml: '<h2>Xoş gəldiniz, {{name}}!</h2><p>{{siteName}} saytına qeydiyyatınız uğurla tamamlandı.</p>',
    newsletterWelcomeSubject: 'Abunə olduğunuz üçün təşəkkürlər!',
    newsletterWelcomeHtml: '<h2>Təşəkkürlər!</h2><p>{{siteName}} bülleteninə abunə oldunuz: {{email}}</p>',
    orderCreatedSubject: 'Sifarişiniz qəbul olundu: #{{orderId}}',
    orderCreatedHtml: '<h2>Sifarişiniz qəbul olundu</h2><p>Sifariş nömrəsi: <b>#{{orderId}}</b></p><p>Status: {{status}}</p>',
    orderStatusSubject: 'Sifariş yeniləndi: #{{orderId}} ({{status}})',
    orderStatusHtml: '<h2>Sifariş statusu yeniləndi</h2><p>Sifariş nömrəsi: <b>#{{orderId}}</b></p><p>Yeni status: <b>{{status}}</b></p>'
  },
  sellerPromotion: {
    sectionEnabled: true,
    sectionTitle: { az: 'Satıcılar', ru: 'Продавцы', en: 'Sellers' },
    sectionSubtitle: { az: 'Platformada önə çıxan mağazalar', ru: 'Выделенные магазины платформы', en: 'Featured stores on the platform' },
    sectionCta: { az: 'Hamısına bax', ru: 'Смотреть все', en: 'View all' },
    sectionLabel: 'Satıcılar',
    sectionLimit: 4,
    featuredBadgeText: 'PRO',
    paymentReceiverName: '',
    paymentReceiverCard: '',
    paymentReceiverBank: '',
    paymentInstructions: 'Ödəniş etdikdən sonra sorğu göndərin, admin təsdiqlədikdən sonra mağazanız önə çıxarılacaq.',
    plans: [
      { days: 1, label: '1 gün', price: 5, enabled: true },
      { days: 3, label: '3 gün', price: 12, enabled: true },
      { days: 7, label: '7 gün', price: 25, enabled: true },
      { days: 15, label: '15 gün', price: 45, enabled: true },
      { days: 30, label: '1 ay', price: 75, enabled: true }
    ]
  },
  sellerCommissionRate: 10,
  footerLinkGroups: [
    {
      key: 'customerServices',
      title: { az: 'Müştəri xidmətləri', ru: 'Обслуживание клиентов', en: 'Customer Services' },
      items: [
        { label: { az: 'Yeni müştərilər', ru: 'Новые клиенты', en: 'New customers' }, href: '/new-customers' },
        { label: { az: 'Hesabdan istifadə', ru: 'Использование аккаунта', en: 'Using your account' }, href: '/account-usage' },
        { label: { az: 'Sifariş vermə', ru: 'Оформление заказа', en: 'Placing orders' }, href: '/ordering-guide' },
        { label: { az: 'Ödəmə üsulları', ru: 'Способы оплаты', en: 'Payment methods' }, href: '/payment-methods' },
        { label: { az: 'Çatdırılma', ru: 'Доставка', en: 'Delivery' }, href: '/delivery-info' },
        { label: { az: 'Sifariş problemləri', ru: 'Проблемы с заказом', en: 'Order issues' }, href: '/order-issues' }
      ]
    },
    {
      key: 'customerSupport',
      title: { az: 'Müştəri dəstəyi', ru: 'Поддержка клиентов', en: 'Customer Support' },
      items: [
        { label: { az: 'Yardım mərkəzi', ru: 'Центр помощи', en: 'Help center' }, href: '/help-center' },
        { label: { az: 'Əlaqə', ru: 'Контакты', en: 'Contact' }, href: '/contact' },
        { label: { az: 'Sui-istifadə bildir', ru: 'Сообщить о нарушении', en: 'Report abuse' }, href: '/report-abuse' },
        { label: { az: 'Mübahisə aç', ru: 'Открыть спор', en: 'Open a dispute' }, href: '/open-dispute' },
        { label: { az: 'Siyasət və qaydalar', ru: 'Политики и правила', en: 'Policies' }, href: '/policies' }
      ]
    },
    {
      key: 'myAccount',
      title: { az: 'Hesabım', ru: 'Мой аккаунт', en: 'My Account' },
      items: [
        { label: { az: 'Məhsul dəstəyi', ru: 'Поддержка товара', en: 'Product support' }, href: '/product-support' },
        { label: { az: 'Sifariş vermə', ru: 'Оформление заказа', en: 'Placing orders' }, href: '/ordering-guide' },
        { label: { az: 'Alış-veriş səbəti', ru: 'Корзина', en: 'Shopping cart' }, href: '/cart-guide' },
        { label: { az: 'Sevimlilər', ru: 'Избранное', en: 'Wishlist' }, href: '/wishlist-guide' },
        { label: { az: 'Şərtlər', ru: 'Условия', en: 'Terms' }, href: '/terms' }
      ]
    },
    {
      key: 'quickLinks',
      title: { az: 'Sürətli keçidlər', ru: 'Быстрые ссылки', en: 'Quick Links' },
      items: [
        { label: { az: 'Mağaza yeri', ru: 'Расположение магазина', en: 'Store location' }, href: '/store-location' },
        { label: { az: 'Hesabım', ru: 'Мой аккаунт', en: 'My account' }, href: '/profile' },
        { label: { az: 'Sifariş izləmə', ru: 'Отслеживание заказа', en: 'Order tracking' }, href: '/order-tracking' },
        { label: { az: 'FAQ', ru: 'FAQ', en: 'FAQ' }, href: '/faq' }
      ]
    }
  ],
  footerContent: {
    aboutText: {
      az: 'Duka Market ən son elektronika və dəb məhsulları üçün sizin bir nömrəli ünvanınızdır.',
      ru: 'Duka Market — ваш главный адрес для современной электроники и модных товаров.',
      en: 'Duka Market is your go-to destination for modern electronics and fashion products.'
    },
    copyrightText: {
      az: 'Copyright © {{siteName}}. Bütün hüquqlar qorunur.',
      ru: 'Copyright © {{siteName}}. Все права защищены.',
      en: 'Copyright © {{siteName}}. All rights reserved.'
    }
  },
  customCode: {
    customCss: '',
    headScript: '',
    bodyEndScript: ''
  },
  integrations: {
    emailVerificationEnabled: false,
    phoneVerificationEnabled: false,
    smsProvider: '',
    smsApiKey: '',
    smsApiSecret: '',
    smsFrom: '',
    smsWebhookUrl: '',
    emailApiKey: '',
    emailFrom: '',
    hostingWebhook: '',
    domainName: '',
    paymentProvider: 'stripe',
    paymentApiKey: '',
    paymentSecret: '',
    paymentCallbackUrl: '',
    analyticsApiKey: ''
  },
  paymentMethods: [
    {
      key: 'card',
      name: 'Kart ilə ödəniş',
      provider: 'Stripe',
      description: 'Stripe hosted checkout ilə təhlükəsiz onlayn ödəniş',
      enabled: true
    },
    {
      key: 'cash',
      name: 'Nağd ödəniş',
      provider: 'Qapıda ödəniş',
      description: 'Məhsul təhvil veriləndə ödəniş edin',
      enabled: true
    }
  ],
  entryExperience: {
    splashEnabled: true,
    safeModeEnabled: true,
    showOncePerSession: true,
    maxDurationMs: 950,
    popupEnabled: true,
    icon: 'Sparkles',
    splashTitle: {
      az: 'novruzmarket',
      ru: 'novruzmarket',
      en: 'novruzmarket'
    },
    splashSubtitle: {
      az: 'Yeni vitrin yüklənir...',
      ru: 'Загружается новая витрина...',
      en: 'Loading your new storefront...'
    },
    popupBadge: {
      az: 'Yeni bildiriş',
      ru: 'Новое уведомление',
      en: 'New notice'
    },
    gradientFrom: '#2B3E95',
    gradientVia: '#3147A8',
    gradientTo: '#3C59D6',
    accentColor: '#FACC15',
    popupTitle: {
      az: 'Axtardığınız hər şey NovruzMarket-də!',
      ru: 'Всё, что вы ищете, на NovruzMarket!',
      en: 'Everything you need is on NovruzMarket!'
    },
    popupSubtitle: {
      az: 'Sizə uyğun kateqoriya və yenilikləri göstərməyimiz üçün seçim edin.',
      ru: 'Выберите интересующее направление, чтобы мы показали подходящие категории и новинки.',
      en: 'Choose your interest so we can show relevant categories and new arrivals.'
    },
    primaryActionLabel: { az: 'Qadın', ru: 'Женщинам', en: 'Women' },
    primaryActionHref: '/shop?gender=women',
    secondaryActionLabel: { az: 'Kişi', ru: 'Мужчинам', en: 'Men' },
    secondaryActionHref: '/shop?gender=men'
  },
  design: {
    primaryColor: '#2B3E95',
    accentColor: '#FACC15',
    appBg: '#FFFFFF',
    appText: '#1F2937',
    surfaceBg: '#FFFFFF',
    borderColor: '#E5E7EB',
    footerBg: '#030712',
    footerText: '#E5E7EB',
    footerMuted: '#9CA3AF',
    footerBorder: '#111827',
    headerShowLogo: true,
    homeLayout: 1,
    heroHeightMobile: 460,
    heroHeightDesktop: 500,
    homeBannersLayout: 'carousel',
    homeBannersPlacement: 'afterFeatures',
    heroAutoplayEnabled: true,
    heroAutoplayDelayMs: 5000,
    heroTransitionSpeedMs: 700,
    heroEffect: 'slide',
    heroLoop: true,
    heroPagination: true,
    heroSectionBgDesktop: '#2B3E95',
    headerNavBg: '#2B3E95',
    headerNavLinkDefault: 'rgba(255,255,255,0.9)',
    headerNavLinkHover: '#FFFFFF',
    headerNavLinkActive: '#FACC15',
    deptBtnBg: 'rgba(255,255,255,0.10)',
    deptBtnBorder: 'rgba(255,255,255,0.15)',
    deptBtnText: '#FFFFFF',
    deptBtnHoverBg: '#FACC15',
    deptBtnHoverBorder: '#FACC15',
    deptBtnHoverText: '#2B3E95',
    deptBtnActiveBg: '#FACC15',
    deptBtnActiveBorder: '#FACC15',
    deptBtnActiveText: '#2B3E95',
    deptMenuWidth: 760,
    deptMenuMaxHeight: 420
  },
  currency: 'AZN',
  notifications: true,
  maintenanceMode: false,
  seo: {
    title: 'Duka Market - Onlayn Mağaza',
    description: 'Ən yaxşı məhsullar ən uyğun qiymətə.',
    keywords: 'ecommerce, shopping, azerbaijan',
  },
} as const
