<script setup lang="ts">
import { 
  LayoutDashboard, 
  Package, 
  ListTree, 
  ShoppingCart, 
  Users, 
  Tag, 
  Ticket, 
  FileText, 
  Layout, 
  Image as ImageIcon, 
  Flag, 
  Clock,
  HelpCircle,
  Globe, 
  Truck, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  BarChart, 
  ShieldCheck, 
  History,
  Mail,
  Store,
  Wallet,
  LogOut,
  Bell,
  Search,
  SlidersHorizontal,
  Smartphone
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useAdminPortal } from '~/composables/useAdminPortal'

const authStore = useAuthStore()
const router = useRouter()
const { adminPath } = useAdminPortal()

const menuItems = computed(() => [
  { name: 'İdarə paneli', icon: LayoutDashboard, path: adminPath() },
  { name: 'Təcrübə qurucusu', icon: Layout, path: adminPath('experience-builder') },
  { name: 'Böyümə mərkəzi', icon: Bell, path: adminPath('growth-lab') },
  { name: 'Axtarış analitikası', icon: Search, path: adminPath('search-intelligence') },
  { name: 'Məhsullar', icon: Package, path: adminPath('products') },
  { name: 'Kateqoriyalar', icon: ListTree, path: adminPath('categories') },
  { name: 'Kateqoriya Filtrləri', icon: SlidersHorizontal, path: adminPath('category-filters') },
  { name: 'Sifarişlər', icon: ShoppingCart, path: adminPath('orders') },
  { name: 'İstifadəçilər', icon: Users, path: adminPath('users') },
  { name: 'Satıcılar', icon: Store, path: adminPath('sellers') },
  { name: 'Satıcı ödənişləri', icon: Wallet, path: adminPath('seller-payouts') },
  { name: 'Brendlər', icon: Tag, path: adminPath('brands') },
  { name: 'Kuponlar', icon: Ticket, path: adminPath('coupons') },
  { name: 'Bloq', icon: FileText, path: adminPath('blog') },
  { name: 'Bülleten', icon: Mail, path: adminPath('newsletter') },
  { name: 'Email Avtomatlaşdırma', icon: Mail, path: adminPath('email-automation') },
  { name: 'Səhifələr', icon: Layout, path: adminPath('pages') },
  { name: 'Footer Linkləri', icon: Layout, path: adminPath('footer-links') },
  { name: 'FAQ', icon: HelpCircle, path: adminPath('faq') },
  { name: 'Slayder', icon: ImageIcon, path: adminPath('slider') },
  { name: 'Hero Bannerlər', icon: ImageIcon, path: adminPath('hero-banners') },
  { name: 'Bannerlar', icon: Flag, path: adminPath('banners') },
  { name: 'Günün Endirimi', icon: Clock, path: adminPath('top-deals') },
  { name: 'Ana Səhifə Bölmələri', icon: Layout, path: adminPath('home-sections') },
  { name: 'Mağaza təcrübəsi', icon: SlidersHorizontal, path: adminPath('shop-experience') },
  { name: 'Mobil tətbiq görünüşü', icon: Smartphone, path: adminPath('mobile-experience') },
  { name: 'Ana səhifə analitikası', icon: BarChart, path: adminPath('homepage-analytics') },
  { name: 'Məhsul Blokları', icon: Layout, path: adminPath('product-info-blocks') },
  { name: 'Məhsul təcrübəsi', icon: Layout, path: adminPath('product-experience') },
  { name: 'Açılış Animasiya', icon: Bell, path: adminPath('entry-experience') },
  { name: 'Valyuta & Dil', icon: Globe, path: adminPath('settings') },
  { name: 'Çatdırılma', icon: Truck, path: adminPath('shipping') },
  { name: 'Səbət və checkout', icon: ShoppingCart, path: adminPath('cart-checkout') },
  { name: 'Ödəniş Metodları', icon: CreditCard, path: adminPath('payments') },
  { name: 'Mesajlar & Rəylər', icon: MessageSquare, path: adminPath('feedback') },
  { name: 'Dizayn', icon: ImageIcon, path: adminPath('design') },
  { name: 'Buraxılış yoxlaması', icon: ShieldCheck, path: adminPath('launch-checklist') },
  { name: 'Ayarlar', icon: Settings, path: adminPath('settings') },
  { name: 'Hesabatlar', icon: BarChart, path: adminPath('reports') },
  { name: 'İcazələr', icon: ShieldCheck, path: adminPath('permissions') },
  { name: 'Sistem Logları', icon: History, path: adminPath('logs') },
])

const adminInitials = computed(() => {
  const base = String(authStore.user?.username || authStore.user?.name || 'AD').trim()
  return base.slice(0, 2).toUpperCase()
})

const logout = async () => {
  await authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-gray-300 flex-shrink-0 flex flex-col transition-all duration-300">
      <div class="p-6 flex items-center border-b border-gray-800">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <Package class="w-5 h-5 text-white" />
        </div>
        <span class="text-xl font-bold text-white tracking-tight">Admin<span class="text-blue-500">Panel</span></span>
      </div>
      
      <nav class="flex-grow overflow-y-auto py-6 custom-scrollbar">
        <ul class="space-y-1 px-4">
          <li v-for="item in menuItems" :key="item.name">
            <NuxtLink 
              :to="item.path" 
              class="flex items-center px-4 py-3 rounded-xl transition-all hover:bg-gray-800 hover:text-white group"
              active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            >
              <component :is="item.icon" class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              <span class="text-sm font-medium">{{ item.name }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t border-gray-800">
        <button class="flex items-center w-full px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all group" @click="logout">
          <LogOut class="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
          <span class="text-sm font-medium">Çıxış</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-grow flex flex-col overflow-hidden">
      <!-- Top Header -->
      <header class="min-h-20 bg-white border-b border-gray-100 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between px-4 md:px-8 py-4 flex-shrink-0">
        <div class="flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 w-full xl:max-w-md group focus-within:border-blue-600 transition-all">
          <Search class="w-4 h-4 text-gray-400 mr-3 group-focus-within:text-blue-600" />
          <input 
            type="text" 
            placeholder="Axtarış..." 
            class="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
        
        <div class="flex items-center justify-between xl:justify-end space-x-6">
          <div class="relative cursor-pointer group">
            <Bell class="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">3</span>
          </div>
          
          <div class="flex items-center space-x-4 pl-6 border-l border-gray-100 cursor-pointer group">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-bold text-gray-800 group-hover:text-blue-600">{{ authStore.user?.name || 'Admin' }}</p>
              <p class="text-xs text-gray-500 uppercase tracking-tighter">Super Admin</p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-transparent group-hover:border-blue-600 transition-all">
              {{ adminInitials }}
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-grow overflow-auto bg-gray-50/50 p-4 md:p-8 custom-scrollbar">
        <div v-if="authStore.user?.mustChangePassword" class="mb-6 rounded-[2rem] border border-amber-100 bg-amber-50 px-6 py-5">
          <div class="text-sm font-extrabold text-amber-700">Təhlükəsizlik bildirişi</div>
          <div class="mt-1 text-sm font-medium text-amber-700">Standart admin məlumatları aktivdir. Ayarlar bölməsindən admin şifrəsini dəyişin.</div>
        </div>
        <div class="min-w-0">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>
