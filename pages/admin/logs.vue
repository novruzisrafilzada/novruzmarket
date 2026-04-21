<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Activity, Search, User, Monitor, Clock } from 'lucide-vue-next'
import { useLogStore } from '~/stores/logs'

definePageMeta({ layout: 'admin' })

const logStore = useLogStore()
const searchQuery = ref('')

const filteredLogs = computed(() => {
  return logStore.logs.filter(l => 
    l.user.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    l.action.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(async () => {
  if (!logStore.hydrated) await logStore.fetchLogs()
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Sistem Logları</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Sistemdə baş verən bütün əməliyyatların tarixçəsini buradan izləyin.</p>
      </div>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full md:w-80 focus-within:border-blue-600 transition-all">
          <Search class="w-4 h-4 text-gray-400 mr-3" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="İstifadəçi və ya əməliyyat..." 
            class="bg-transparent border-none outline-none text-sm w-full" 
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th class="px-8 py-4">İstifadəçi</th>
              <th class="px-8 py-4">Əməliyyat</th>
              <th class="px-8 py-4">IP Ünvan</th>
              <th class="px-8 py-4">Tarix</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-8 py-6">
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3 text-gray-400">
                    <User class="w-4 h-4" />
                  </div>
                  <span class="text-sm font-bold text-gray-800">{{ log.user }}</span>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center">
                  <Activity class="w-4 h-4 mr-2 text-blue-600" />
                  <span class="text-sm font-medium text-gray-600">{{ log.action }}</span>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center text-xs font-bold text-gray-400">
                  <Monitor class="w-3.5 h-3.5 mr-2" />
                  {{ log.ip }}
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center text-xs font-medium text-gray-500">
                  <Clock class="w-3.5 h-3.5 mr-2" />
                  {{ log.date }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
