<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Users, Search, Plus, Edit, Trash2, X, User as UserIcon, Shield } from 'lucide-vue-next'
import { useUserStore, type User } from '~/stores/users'
import { useRegisteredUserStore } from '~/stores/registeredUsers'

definePageMeta({ layout: 'admin' })

const userStore = useUserStore()
const registeredUserStore = useRegisteredUserStore()
const searchQuery = ref('')
const isModalOpen = ref(false)
const editingUser = ref<User | null>(null)

const userForm = ref({
  name: '',
  email: '',
  role: 'Müştəri' as User['role'],
  status: 'Aktiv' as User['status']
})

const filteredUsers = computed(() => {
  return userStore.users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredRegisteredUsers = computed(() => {
  return registeredUserStore.users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const openModal = (user?: User) => {
  if (user) {
    editingUser.value = user
    userForm.value = {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }
  } else {
    editingUser.value = null
    userForm.value = {
      name: '',
      email: '',
      role: 'Müştəri',
      status: 'Aktiv'
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingUser.value = null
}

const saveUser = () => {
  if (editingUser.value) {
    userStore.updateUser(editingUser.value.id, userForm.value)
  } else {
    userStore.addUser(userForm.value)
  }
  closeModal()
}

const deleteUser = (id: number) => {
  if (confirm('Bu istifadəçini silmək istədiyinizə əminsiniz?')) {
    userStore.deleteUser(id)
  }
}

onMounted(async () => {
  if (!registeredUserStore.hydrated) await registeredUserStore.fetchUsers()
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">İstifadəçi İdarəetməsi</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Sistemdəki bütün istifadəçiləri və rolları buradan idarə edin.</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-blue-600 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all"
      >
        <Plus class="w-4 h-4 mr-2" /> Yeni İstifadəçi
      </button>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full md:w-80 focus-within:border-blue-600 transition-all">
          <Search class="w-4 h-4 text-gray-400 mr-3" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Ad və ya email ilə axtar..." 
            class="bg-transparent border-none outline-none text-sm w-full" 
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th class="px-8 py-4">İstifadəçi</th>
              <th class="px-8 py-4">Rol</th>
              <th class="px-8 py-4">Status</th>
              <th class="px-8 py-4">Qeydiyyat</th>
              <th class="px-8 py-4 text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-8 py-6">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-3 text-blue-600 font-bold border border-gray-100">
                    {{ user.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-800">{{ user.name }}</p>
                    <p class="text-[10px] text-gray-400 font-medium">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center text-sm font-medium text-gray-600">
                  <Shield class="w-4 h-4 mr-2 text-gray-400" />
                  {{ user.role }}
                </div>
              </td>
              <td class="px-8 py-6">
                <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', user.status === 'Aktiv' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                  {{ user.status.toUpperCase() }}
                </span>
              </td>
              <td class="px-8 py-6 text-sm text-gray-500 font-medium">{{ user.date }}</td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button @click="openModal(user)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit class="w-4 h-4" /></button>
                  <button @click="deleteUser(user.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50 flex items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-gray-900">Qeydiyyatdan keçmiş istifadəçilər</h2>
          <p class="text-gray-500 mt-1 font-medium text-sm">Saytda qeydiyyatdan keçən müştərilər burda görünür.</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th class="px-8 py-4">İstifadəçi</th>
              <th class="px-8 py-4">Rol</th>
              <th class="px-8 py-4">Status</th>
              <th class="px-8 py-4">Qeydiyyat</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="user in filteredRegisteredUsers" :key="user.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-8 py-6">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-3 text-blue-600 font-bold border border-gray-100">
                    {{ user.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-800">{{ user.name }}</p>
                    <p class="text-[10px] text-gray-400 font-medium">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center text-sm font-medium text-gray-600">
                  <Shield class="w-4 h-4 mr-2 text-gray-400" />
                  {{ user.role }}
                </div>
              </td>
              <td class="px-8 py-6">
                <span class="px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                  {{ user.status.toUpperCase() }}
                </span>
              </td>
              <td class="px-8 py-6 text-sm text-gray-500 font-medium">{{ user.date }}</td>
            </tr>
            <tr v-if="filteredRegisteredUsers.length === 0">
              <td colspan="4" class="px-8 py-10 text-center text-gray-500 font-medium">Heç bir qeydiyyatlı istifadəçi yoxdur.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in duration-300">
        <div class="shrink-0 p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/95 backdrop-blur">
          <h2 class="text-2xl font-extrabold text-gray-900">{{ editingUser ? 'İstifadəçini Redaktə Et' : 'Yeni İstifadəçi' }}</h2>
          <button @click="closeModal" class="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 transition-all border border-gray-100">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveUser" class="flex-1 overflow-y-auto p-8 pr-5 space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tam Adı</label>
            <input v-model="userForm.name" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Məsələn: Ayxan Məmmədov" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
            <input v-model="userForm.email" required type="email" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="example@mail.com" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Rol</label>
              <select v-model="userForm.role" required class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option>Admin</option>
                <option>Menecer</option>
                <option>Müştəri</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
              <select v-model="userForm.status" required class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option>Aktiv</option>
                <option>Deaktiv</option>
              </select>
            </div>
          </div>

          <div class="sticky bottom-0 flex items-center space-x-4 border-t border-gray-100 bg-white/95 pt-4 backdrop-blur">
            <button type="button" @click="closeModal" class="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all">Ləğv Et</button>
            <button type="submit" class="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Yadda Saxla</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
