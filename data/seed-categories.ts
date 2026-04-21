export type CategoryI18n = {
  az: string
  ru: string
  en: string
}

export type SeedCategory = {
  id: number
  parentId: number | null
  slug: string
  icon: string
  image?: string
  featuredOnHome?: boolean
  nameI18n: CategoryI18n
}

const seedCategories: SeedCategory[] = [
  {
    id: 1,
    parentId: null,
    slug: 'planset-mobil',
    icon: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    featuredOnHome: true,
    nameI18n: { az: 'Planşet & Mobil', ru: 'Планшеты и мобильные', en: 'Tablets & Mobile' }
  },
  { id: 2, parentId: 1, slug: 'telefonlar', icon: 'Smartphone', nameI18n: { az: 'Telefonlar', ru: 'Телефоны', en: 'Phones' } },
  { id: 3, parentId: 1, slug: 'plansetler', icon: 'Tablet', nameI18n: { az: 'Planşetlər', ru: 'Планшеты', en: 'Tablets' } },
  { id: 4, parentId: 1, slug: 'mobil-aksesuarlar', icon: 'Cable', nameI18n: { az: 'Aksesuarlar', ru: 'Аксессуары', en: 'Accessories' } },
  {
    id: 10,
    parentId: null,
    slug: 'laptop-komputer',
    icon: 'Laptop',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
    featuredOnHome: true,
    nameI18n: { az: 'Laptop & Kompüter', ru: 'Ноутбуки и компьютеры', en: 'Laptops & Computers' }
  },
  { id: 11, parentId: 10, slug: 'gaming-laptoplar', icon: 'Laptop', nameI18n: { az: 'Gaming Laptoplar', ru: 'Игровые ноутбуки', en: 'Gaming laptops' } },
  { id: 12, parentId: 10, slug: 'ofis-komputerleri', icon: 'PcCase', nameI18n: { az: 'Ofis Kompüterləri', ru: 'Офисные компьютеры', en: 'Office PCs' } },
  { id: 13, parentId: 10, slug: 'monitorlar', icon: 'Monitor', nameI18n: { az: 'Monitorlar', ru: 'Мониторы', en: 'Monitors' } },
  {
    id: 20,
    parentId: null,
    slug: 'reqemsal-elektronika',
    icon: 'Cpu',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    featuredOnHome: true,
    nameI18n: { az: 'Rəqəmsal & Elektronika', ru: 'Цифровая электроника', en: 'Digital & Electronics' }
  },
  { id: 21, parentId: 20, slug: 'televizorlar', icon: 'Tv', nameI18n: { az: 'Televizorlar', ru: 'Телевизоры', en: 'TVs' } },
  { id: 22, parentId: 20, slug: 'aqqilli-saatlar', icon: 'Watch', nameI18n: { az: 'Ağıllı Saatlar', ru: 'Умные часы', en: 'Smart watches' } },
  { id: 23, parentId: 20, slug: 'ev-elektronikasi', icon: 'Plug', nameI18n: { az: 'Ev Elektronikası', ru: 'Электроника для дома', en: 'Home electronics' } },
  {
    id: 30,
    parentId: null,
    slug: 'kamera-qulaqliq',
    icon: 'Camera',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    featuredOnHome: true,
    nameI18n: { az: 'Kamera & Qulaqlıq', ru: 'Камеры и наушники', en: 'Cameras & Headphones' }
  },
  { id: 31, parentId: 30, slug: 'kameralar', icon: 'Camera', nameI18n: { az: 'Kameralar', ru: 'Камеры', en: 'Cameras' } },
  { id: 32, parentId: 30, slug: 'qulaqliqlar', icon: 'Headphones', nameI18n: { az: 'Qulaqlıqlar', ru: 'Наушники', en: 'Headphones' } },
  {
    id: 40,
    parentId: null,
    slug: 'dekor-mebel',
    icon: 'Sofa',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    featuredOnHome: true,
    nameI18n: { az: 'Dekor & Mebel', ru: 'Декор и мебель', en: 'Decor & Furniture' }
  },
  { id: 41, parentId: 40, slug: 'ev-dekoru', icon: 'Home', nameI18n: { az: 'Ev Dekoru', ru: 'Декор для дома', en: 'Home decor' } },
  { id: 42, parentId: 40, slug: 'mebel', icon: 'Sofa', nameI18n: { az: 'Mebel', ru: 'Мебель', en: 'Furniture' } },
  {
    id: 50,
    parentId: null,
    slug: 'deb-geyim',
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80',
    featuredOnHome: true,
    nameI18n: { az: 'Dəb & Geyim', ru: 'Мода и одежда', en: 'Fashion & Clothing' }
  },
  { id: 51, parentId: 50, slug: 'kisi-geyimleri', icon: 'Shirt', nameI18n: { az: 'Kişi Geyimləri', ru: 'Мужская одежда', en: "Men's clothing" } },
  { id: 52, parentId: 50, slug: 'qadin-geyimleri', icon: 'Shirt', nameI18n: { az: 'Qadın Geyimləri', ru: 'Женская одежда', en: "Women's clothing" } }
]

export default seedCategories
