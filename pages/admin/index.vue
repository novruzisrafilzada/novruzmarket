<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  MoreVertical,
  ChevronRight,
  Search,
  Filter,
  Download,
  Tag,
  Ticket
} from 'lucide-vue-next'
import { useProductStore } from '~/stores/products'
import { useOrderStore } from '~/stores/orders'

definePageMeta({
  layout: 'admin'
})

const productStore = useProductStore()
const orderStore = useOrderStore()
const { formatMoney } = useMoney()
const { adminPath } = useAdminPortal()

onMounted(async () => {
  await Promise.all([
    orderStore.fetchOrders(),
    productStore.fetchProducts()
  ])
})

const downloadOrderReport = () => {
  if (!process.client) return
  const rows = [
    ['Sifariş ID', 'Müştəri', 'Email', 'Tarix', 'Status', 'Məbləğ'],
    ...orderStore.orders.map((order) => [
      String(order.id || ''),
      String(order.customer || ''),
      String(order.email || ''),
      String(order.date || ''),
      String(order.status || ''),
      String(order.amount || 0)
    ])
  ]
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'admin-orders-report.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const stats = computed(() => [
  { 
    name: 'Ümumi Gəlir', 
    value: formatMoney(orderStore.orders.reduce((acc, o) => acc + o.amount, 0)), 
    change: '+12.5%', 
    trend: 'up', 
    icon: DollarSign, 
    color: 'text-blue-600', 
    bg: 'bg-blue-100' 
  },
  { 
    name: 'Ümumi Sifarişlər', 
    value: orderStore.orders.length.toString(), 
    change: '+8.2%', 
    trend: 'up', 
    icon: ShoppingCart, 
    color: 'text-green-600', 
    bg: 'bg-green-100' 
  },
  { 
    name: 'Yeni Müştərilər', 
    value: '432', 
    change: '-2.4%', 
    trend: 'down', 
    icon: Users, 
    color: 'text-purple-600', 
    bg: 'bg-purple-100' 
  },
  { 
    name: 'Stokda Olan', 
    value: productStore.products.reduce((acc, p) => acc + p.stock, 0).toString(), 
    change: '+5.1%', 
    trend: 'up', 
    icon: Package, 
    color: 'text-orange-600', 
    bg: 'bg-orange-100' 
  },
])

const recentOrders = computed(() => orderStore.orders.slice(0, 5))

const lowStockProducts = computed(() => 
  productStore.products
    .filter(p => p.stock <= 5)
    .slice(0, 3)
)
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Xoş gəlmisiniz, Admin! Budur bu günün statistikası.</p>
      </div>
      <div class="flex items-center space-x-3">
        <button type="button" class="bg-white border border-gray-100 px-6 py-3 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-all flex items-center shadow-sm" @click="downloadOrderReport">
          <Download class="w-4 h-4 mr-3" />
          Hesabatı Yüklə
        </button>
        <NuxtLink :to="adminPath('products')" class="bg-blue-600 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 hover:shadow-xl transition-all shadow-lg shadow-blue-200">
          Yeni Məhsul
        </NuxtLink>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.name" class="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
        <div class="flex items-center justify-between mb-6">
          <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110', stat.bg, stat.color]">
            <component :is="stat.icon" class="w-7 h-7" />
          </div>
          <div :class="['flex items-center px-3 py-1 rounded-full text-xs font-bold', stat.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600']">
            <component :is="stat.trend === 'up' ? TrendingUp : TrendingDown" class="w-3 h-3 mr-1" />
            {{ stat.change }}
          </div>
        </div>
        <p class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{{ stat.name }}</p>
        <h3 class="text-3xl font-extrabold text-gray-900">{{ stat.value }}</h3>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Orders Table -->
      <div class="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div class="p-8 border-b border-gray-50 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">Son Sifarişlər</h2>
          <NuxtLink :to="adminPath('orders')" class="text-blue-600 text-sm font-bold flex items-center hover:translate-x-1 transition-transform">
            Hamısına bax <ChevronRight class="w-4 h-4 ml-1" />
          </NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <th class="px-8 py-4">Sifariş ID</th>
                <th class="px-8 py-4">Müştəri</th>
                <th class="px-8 py-4">Tarix</th>
                <th class="px-8 py-4">Məbləğ</th>
                <th class="px-8 py-4">Status</th>
                <th class="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50/50 transition-colors group">
                <td class="px-8 py-6 text-sm font-bold text-blue-600">{{ order.id }}</td>
                <td class="px-8 py-6">
                  <div class="flex items-center">
                    <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mr-3">
                      {{ order.customer.split(' ').map(n => n[0]).join('') }}
                    </div>
                    <span class="text-sm font-bold text-gray-800">{{ order.customer }}</span>
                  </div>
                </td>
                <td class="px-8 py-6 text-sm text-gray-500 font-medium">{{ order.date }}</td>
                <td class="px-8 py-6 text-sm font-extrabold text-gray-900">{{ formatMoney(order.amount) }}</td>
                <td class="px-8 py-6">
                  <span :class="['px-3 py-1.5 rounded-xl text-xs font-bold', order.statusColor]">
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <button class="text-gray-400 hover:text-blue-600 transition-colors">
                    <MoreVertical class="w-5 h-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Low Stock & Quick Actions -->
      <div class="space-y-8">
        <!-- Low Stock -->
        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-8 flex items-center">
            <Package class="w-6 h-6 mr-3 text-orange-500" />
            Azalan Stok
          </h2>
          <div class="space-y-6">
            <div v-for="product in lowStockProducts" :key="product.id" class="flex items-center group cursor-pointer">
              <div class="w-16 h-16 rounded-2xl bg-gray-50 p-2 mr-4 border border-gray-100 group-hover:scale-110 transition-transform">
                <img :src="product.image" :alt="product.name" class="w-full h-full object-contain" />
              </div>
              <div class="flex-grow">
                <h4 class="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">{{ product.name }}</h4>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-400">{{ formatMoney(product.price) }}</span>
                  <span class="text-xs font-extrabold px-3 py-1 bg-red-50 text-red-600 rounded-full">
                    Stok: {{ product.stock }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <NuxtLink :to="adminPath('products')" class="w-full mt-10 bg-gray-50 hover:bg-gray-100 text-gray-800 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center group">
            Hamısına bax <ChevronRight class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </NuxtLink>
        </div>

        <!-- Quick Actions -->
        <div class="bg-blue-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200 group">
          <div class="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <h2 class="text-xl font-bold mb-6 relative z-10">Sürətli Əməliyyat</h2>
          <div class="grid grid-cols-2 gap-4 relative z-10">
            <NuxtLink :to="adminPath('products')" class="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center justify-center transition-all">
              <Package class="w-6 h-6 mb-2" />
              <span class="text-xs font-bold uppercase tracking-widest">Məhsul</span>
            </NuxtLink>
            <NuxtLink :to="adminPath('categories')" class="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center justify-center transition-all">
              <Tag class="w-6 h-6 mb-2" />
              <span class="text-xs font-bold uppercase tracking-widest">Kateqoriya</span>
            </NuxtLink>
            <NuxtLink :to="adminPath('coupons')" class="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center justify-center transition-all">
              <Ticket class="w-6 h-6 mb-2" />
              <span class="text-xs font-bold uppercase tracking-widest">Kupon</span>
            </NuxtLink>
            <NuxtLink :to="adminPath('users')" class="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center justify-center transition-all">
              <Users class="w-6 h-6 mb-2" />
              <span class="text-xs font-bold uppercase tracking-widest">Admin</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
