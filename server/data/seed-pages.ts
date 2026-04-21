export type PageI18n = { az: string; ru: string; en: string }
export type PageSection = { titleI18n?: PageI18n; contentI18n?: PageI18n }
export type PageFaq = { questionI18n?: PageI18n; answerI18n?: PageI18n }

export type Page = {
  id: number
  slug: string
  status: 'Aktiv' | 'Deaktiv'
  title: string
  content: string
  titleI18n?: PageI18n
  contentI18n?: PageI18n
  heroBgImage?: string
  pageLayout?: 'basic' | 'faq'
  sections?: PageSection[]
  faqs?: PageFaq[]
}

export const seedPages: Page[] = [
  {
    id: 1,
    slug: 'about',
    status: 'Aktiv',
    title: 'Haqqımızda',
    content: 'Duka Market haqqında ətraflı məlumat...',
    titleI18n: { az: 'Haqqımızda', ru: 'О нас', en: 'About Us' },
    contentI18n: {
      az: 'Duka Market haqqında ətraflı məlumat...',
      ru: 'Подробная информация о Duka Market...',
      en: 'More information about Duka Market...'
    },
    heroBgImage: ''
  },
  {
    id: 2,
    slug: 'contact',
    status: 'Aktiv',
    title: 'Əlaqə',
    content: 'Bizimlə əlaqə vasitələri...',
    titleI18n: { az: 'Əlaqə', ru: 'Контакты', en: 'Contact' },
    contentI18n: {
      az: 'Bizimlə əlaqə vasitələri...',
      ru: 'Контактная информация...',
      en: 'Contact information...'
    }
  },
  {
    id: 3,
    slug: 'faq',
    status: 'Aktiv',
    title: 'FAQ',
    content: 'Tez-tez verilən suallar...',
    titleI18n: { az: 'FAQ', ru: 'FAQ', en: 'FAQ' },
    contentI18n: {
      az: 'Tez-tez verilən suallar...',
      ru: 'Часто задаваемые вопросы...',
      en: 'Frequently asked questions...'
    }
  },
  {
    id: 4,
    slug: 'terms',
    status: 'Aktiv',
    title: 'İstifadə Qaydaları',
    content: 'Platformadan istifadə edərkən təqdim olunan məlumatların doğruluğu, sifariş qaydaları, ödəniş və çatdırılma şərtləri istifadəçi tərəfindən qəbul olunur.',
    titleI18n: { az: 'İstifadə Qaydaları', ru: 'Условия использования', en: 'Terms of Use' },
    contentI18n: {
      az: 'Platformadan istifadə edərkən təqdim olunan məlumatların doğruluğu, sifariş qaydaları, ödəniş və çatdırılma şərtləri istifadəçi tərəfindən qəbul olunur.',
      ru: 'При использовании платформы пользователь принимает правила заказа, оплаты, доставки и достоверность предоставленных данных.',
      en: 'By using the platform, the customer accepts ordering, payment, delivery rules and the accuracy of submitted information.'
    }
  },
  {
    id: 5,
    slug: 'seller-terms',
    status: 'Aktiv',
    title: 'Satıcı Qaydaları',
    content: 'Satıcılar yalnız öz məhsullarını yerləşdirə, real stok göstərə, sifarişləri vaxtında icra etməli və müştəri ilə düzgün kommunikasiya saxlamalıdır.',
    titleI18n: { az: 'Satıcı Qaydaları', ru: 'Правила продавца', en: 'Seller Terms' },
    contentI18n: {
      az: 'Satıcılar yalnız öz məhsullarını yerləşdirə, real stok göstərə, sifarişləri vaxtında icra etməli və müştəri ilə düzgün kommunikasiya saxlamalıdır.',
      ru: 'Продавец обязан размещать только свои товары, показывать актуальные остатки и вовремя обрабатывать заказы.',
      en: 'Sellers must list only their own products, keep stock accurate and process orders on time.'
    }
  },
  {
    id: 6,
    slug: 'privacy-policy',
    status: 'Aktiv',
    title: 'Məxfilik Siyasəti',
    content: 'İstifadəçi məlumatları sifariş, çatdırılma və xidmət keyfiyyətinin artırılması məqsədi ilə qorunaraq saxlanılır.',
    titleI18n: { az: 'Məxfilik Siyasəti', ru: 'Политика конфиденциальности', en: 'Privacy Policy' },
    contentI18n: {
      az: 'İstifadəçi məlumatları sifariş, çatdırılma və xidmət keyfiyyətinin artırılması məqsədi ilə qorunaraq saxlanılır.',
      ru: 'Данные пользователей хранятся защищенно для выполнения заказа, доставки и улучшения сервиса.',
      en: 'User data is stored securely for order processing, delivery and service improvement.'
    }
  },
  {
    id: 7,
    slug: 'new-customers',
    status: 'Aktiv',
    title: 'Yeni müştərilər',
    content: 'Yeni müştərilər üçün qeydiyyat, ilk sifariş və platformadan istifadə üzrə əsas məlumatlar.',
    titleI18n: { az: 'Yeni müştərilər', ru: 'Новые клиенты', en: 'New customers' },
    contentI18n: {
      az: 'Yeni müştərilər üçün qeydiyyat, ilk sifariş və platformadan istifadə üzrə əsas məlumatlar.',
      ru: 'Основная информация для новых клиентов: регистрация, первый заказ и использование платформы.',
      en: 'Basic information for new customers about registration, first orders and using the platform.'
    }
  },
  {
    id: 8,
    slug: 'account-usage',
    status: 'Aktiv',
    title: 'Hesabdan istifadə',
    content: 'Şəxsi hesabı idarə etmək, məlumatları yeniləmək və sifariş tarixçəsinə baxmaq qaydaları.',
    titleI18n: { az: 'Hesabdan istifadə', ru: 'Использование аккаунта', en: 'Using your account' },
    contentI18n: {
      az: 'Şəxsi hesabı idarə etmək, məlumatları yeniləmək və sifariş tarixçəsinə baxmaq qaydaları.',
      ru: 'Правила управления аккаунтом, обновления данных и просмотра истории заказов.',
      en: 'Guidelines for managing your account, updating details and viewing order history.'
    }
  },
  {
    id: 9,
    slug: 'ordering-guide',
    status: 'Aktiv',
    title: 'Sifariş vermə',
    content: 'Məhsulu səbətə əlavə etmə, checkout və sifarişi təsdiqləmə addımları burada təsvir olunur.',
    titleI18n: { az: 'Sifariş vermə', ru: 'Оформление заказа', en: 'Placing orders' },
    contentI18n: {
      az: 'Məhsulu səbətə əlavə etmə, checkout və sifarişi təsdiqləmə addımları burada təsvir olunur.',
      ru: 'Здесь описаны шаги добавления товара в корзину, оформления и подтверждения заказа.',
      en: 'This page explains adding items to cart, checkout and confirming an order.'
    }
  },
  {
    id: 10,
    slug: 'payment-methods',
    status: 'Aktiv',
    title: 'Ödəmə üsulları',
    content: 'Kart, nağd və digər mümkün ödəniş üsulları haqqında məlumatı buradan yeniləyə bilərsiniz.',
    titleI18n: { az: 'Ödəmə üsulları', ru: 'Способы оплаты', en: 'Payment methods' },
    contentI18n: {
      az: 'Kart, nağd və digər mümkün ödəniş üsulları haqqında məlumatı buradan yeniləyə bilərsiniz.',
      ru: 'Здесь можно обновить информацию о банковских картах, наличной оплате и других способах оплаты.',
      en: 'You can update information about cards, cash and other payment methods here.'
    }
  },
  {
    id: 11,
    slug: 'delivery-info',
    status: 'Aktiv',
    title: 'Çatdırılma',
    content: 'Çatdırılma müddəti, bölgələr, tariflər və kuryer xidməti haqqında məlumat.',
    titleI18n: { az: 'Çatdırılma', ru: 'Доставка', en: 'Delivery' },
    contentI18n: {
      az: 'Çatdırılma müddəti, bölgələr, tariflər və kuryer xidməti haqqında məlumat.',
      ru: 'Информация о сроках доставки, регионах, тарифах и курьерской службе.',
      en: 'Information about delivery times, regions, rates and courier service.'
    }
  },
  {
    id: 12,
    slug: 'order-issues',
    status: 'Aktiv',
    title: 'Sifariş problemləri',
    content: 'Gecikmə, natamam çatdırılma və digər sifariş problemləri üzrə yardım səhifəsi.',
    titleI18n: { az: 'Sifariş problemləri', ru: 'Проблемы с заказом', en: 'Order issues' },
    contentI18n: {
      az: 'Gecikmə, natamam çatdırılma və digər sifariş problemləri üzrə yardım səhifəsi.',
      ru: 'Страница помощи по задержкам, неполной доставке и другим проблемам с заказом.',
      en: 'Help page for delays, incomplete deliveries and other order issues.'
    }
  },
  {
    id: 13,
    slug: 'help-center',
    status: 'Aktiv',
    title: 'Yardım mərkəzi',
    content: 'Ən çox verilən suallar, istifadə təlimatları və dəstək materialları.',
    titleI18n: { az: 'Yardım mərkəzi', ru: 'Центр помощи', en: 'Help center' },
    contentI18n: {
      az: 'Ən çox verilən suallar, istifadə təlimatları və dəstək materialları.',
      ru: 'Частые вопросы, инструкции и материалы поддержки.',
      en: 'Frequently asked questions, guides and support materials.'
    }
  },
  {
    id: 14,
    slug: 'report-abuse',
    status: 'Aktiv',
    title: 'Sui-istifadə bildir',
    content: 'Platformada qayda pozuntusu və ya sui-istifadə halları barədə bildiriş forması üçün məlumat.',
    titleI18n: { az: 'Sui-istifadə bildir', ru: 'Сообщить о нарушении', en: 'Report abuse' },
    contentI18n: {
      az: 'Platformada qayda pozuntusu və ya sui-istifadə halları barədə bildiriş forması üçün məlumat.',
      ru: 'Информация для сообщения о нарушениях и злоупотреблениях на платформе.',
      en: 'Information for reporting violations and abuse on the platform.'
    }
  },
  {
    id: 15,
    slug: 'open-dispute',
    status: 'Aktiv',
    title: 'Mübahisə aç',
    content: 'Sifariş və ödənişlə bağlı mübahisə yaratmaq üçün tələb olunan addımlar.',
    titleI18n: { az: 'Mübahisə aç', ru: 'Открыть спор', en: 'Open a dispute' },
    contentI18n: {
      az: 'Sifariş və ödənişlə bağlı mübahisə yaratmaq üçün tələb olunan addımlar.',
      ru: 'Шаги для открытия спора по заказу или оплате.',
      en: 'Steps required to open a dispute about an order or payment.'
    }
  },
  {
    id: 16,
    slug: 'policies',
    status: 'Aktiv',
    title: 'Siyasət və qaydalar',
    content: 'Qaytarma, məxfilik, istifadə və digər platforma siyasətlərinin ümumi icmalı.',
    titleI18n: { az: 'Siyasət və qaydalar', ru: 'Политики и правила', en: 'Policies' },
    contentI18n: {
      az: 'Qaytarma, məxfilik, istifadə və digər platforma siyasətlərinin ümumi icmalı.',
      ru: 'Обзор политик возврата, конфиденциальности, использования и других правил платформы.',
      en: 'Overview of return, privacy, usage and other platform policies.'
    }
  },
  {
    id: 17,
    slug: 'product-support',
    status: 'Aktiv',
    title: 'Məhsul dəstəyi',
    content: 'Məhsulun istifadəsi, zəmanət və servis yardımı haqqında məlumat.',
    titleI18n: { az: 'Məhsul dəstəyi', ru: 'Поддержка товара', en: 'Product support' },
    contentI18n: {
      az: 'Məhsulun istifadəsi, zəmanət və servis yardımı haqqında məlumat.',
      ru: 'Информация об использовании товара, гарантии и сервисной поддержке.',
      en: 'Information about product usage, warranty and service support.'
    }
  },
  {
    id: 18,
    slug: 'cart-guide',
    status: 'Aktiv',
    title: 'Alış-veriş səbəti',
    content: 'Səbəti idarə etmək, say dəyişmək və checkout-a keçmək qaydaları.',
    titleI18n: { az: 'Alış-veriş səbəti', ru: 'Корзина', en: 'Shopping cart' },
    contentI18n: {
      az: 'Səbəti idarə etmək, say dəyişmək və checkout-a keçmək qaydaları.',
      ru: 'Как управлять корзиной, менять количество и переходить к оформлению.',
      en: 'How to manage the cart, change quantities and proceed to checkout.'
    }
  },
  {
    id: 19,
    slug: 'wishlist-guide',
    status: 'Aktiv',
    title: 'Sevimlilər',
    content: 'Sevimli məhsulları saxlamaq, izləmək və sonradan almaq üçün təlimat.',
    titleI18n: { az: 'Sevimlilər', ru: 'Избранное', en: 'Wishlist' },
    contentI18n: {
      az: 'Sevimli məhsulları saxlamaq, izləmək və sonradan almaq üçün təlimat.',
      ru: 'Инструкция по сохранению избранных товаров и их последующей покупке.',
      en: 'Guide to saving favourite products and buying them later.'
    }
  },
  {
    id: 20,
    slug: 'store-location',
    status: 'Aktiv',
    title: 'Mağaza yeri',
    content: 'Fiziki mağaza ünvanı, xəritə və iş saatları haqqında məlumat.',
    titleI18n: { az: 'Mağaza yeri', ru: 'Расположение магазина', en: 'Store location' },
    contentI18n: {
      az: 'Fiziki mağaza ünvanı, xəritə və iş saatları haqqında məlumat.',
      ru: 'Информация об адресе магазина, карте и часах работы.',
      en: 'Information about store address, map and working hours.'
    }
  },
  {
    id: 21,
    slug: 'returns-policy',
    status: 'Aktiv',
    title: 'Qaytarma siyasəti',
    content: 'Qaytarma şərtləri, müddətlər və geri ödəniş qaydaları bu səhifədə yerləşdirilir.',
    titleI18n: { az: 'Qaytarma siyasəti', ru: 'Политика возврата', en: 'Returns policy' },
    contentI18n: {
      az: 'Qaytarma şərtləri, müddətlər və geri ödəniş qaydaları bu səhifədə yerləşdirilir.',
      ru: 'На этой странице размещаются условия возврата, сроки и правила возврата средств.',
      en: 'Return conditions, timelines, and refund rules are managed on this page.'
    }
  },
  {
    id: 22,
    slug: 'shipping-policy',
    status: 'Aktiv',
    title: 'Çatdırılma siyasəti',
    content: 'Çatdırılma zonaları, müddətlər, daşıyıcılar və xüsusi şərtlər bu səhifədə idarə olunur.',
    titleI18n: { az: 'Çatdırılma siyasəti', ru: 'Политика доставки', en: 'Shipping policy' },
    contentI18n: {
      az: 'Çatdırılma zonaları, müddətlər, daşıyıcılar və xüsusi şərtlər bu səhifədə idarə olunur.',
      ru: 'Зоны доставки, сроки, перевозчики и специальные условия управляются на этой странице.',
      en: 'Delivery zones, timelines, carriers, and special terms are managed on this page.'
    }
  }
]
