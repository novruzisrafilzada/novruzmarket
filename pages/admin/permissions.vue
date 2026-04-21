<script setup lang="ts">
import { ref } from 'vue'
import { Shield, Check, X, ShieldAlert, ShieldCheck, Lock } from 'lucide-vue-next'
import { usePermissionStore, type Role } from '~/stores/permissions'

definePageMeta({ layout: 'admin' })

const permissionStore = usePermissionStore()
const selectedRoleId = ref(permissionStore.roles[0].id)

const selectedRole = computed(() => 
  permissionStore.roles.find(r => r.id === selectedRoleId.value)
)

const togglePermission = (permId: string) => {
  if (!selectedRole.value) return
  
  const currentPerms = [...selectedRole.value.permissions]
  const index = currentPerms.indexOf(permId)
  
  if (index === -1) {
    currentPerms.push(permId)
  } else {
    currentPerms.splice(index, 1)
  }
  
  permissionStore.updateRolePermissions(selectedRoleId.value, currentPerms)
}

const hasPermission = (permId: string) => {
  return selectedRole.value?.permissions.includes('all') || selectedRole.value?.permissions.includes(permId)
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Rollar və İcazələr</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">İstifadəçi rollarını və onların sistemdəki icazələrini tənzimləyin.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Roles List -->
      <div class="lg:col-span-1 space-y-4">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-4">Mövcud Rollar</h3>
        <button 
          v-for="role in permissionStore.roles" 
          :key="role.id"
          @click="selectedRoleId = role.id"
          :class="['w-full p-6 rounded-[2rem] border text-left transition-all flex items-center justify-between group', 
            selectedRoleId === role.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200']"
        >
          <div class="flex items-center">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center mr-4', 
              selectedRoleId === role.id ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-blue-50']">
              <Shield :class="['w-5 h-5', selectedRoleId === role.id ? 'text-white' : 'text-blue-600']" />
            </div>
            <span class="font-bold text-sm">{{ role.name }}</span>
          </div>
          <ShieldCheck v-if="selectedRoleId === role.id" class="w-5 h-5 opacity-60" />
        </button>
      </div>

      <!-- Permissions Management -->
      <div class="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold text-gray-900">{{ selectedRole?.name }} - İcazələr</h3>
            <p class="text-sm text-gray-400 font-medium">Bu rol üçün icazələri aşağıdan aktiv/deaktiv edin.</p>
          </div>
          <Lock class="w-6 h-6 text-gray-300" />
        </div>

        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="perm in permissionStore.availablePermissions" 
            :key="perm.id"
            @click="togglePermission(perm.id)"
            :class="['p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group',
              hasPermission(perm.id) ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-50 opacity-60 hover:opacity-100']"
          >
            <div class="flex items-center">
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center mr-3', 
                hasPermission(perm.id) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400']">
                <Check v-if="hasPermission(perm.id)" class="w-4 h-4" />
                <X v-else class="w-4 h-4" />
              </div>
              <span class="text-sm font-bold text-gray-700">{{ perm.name }}</span>
            </div>
            <div v-if="selectedRole?.permissions.includes('all')" class="text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">Full Access</div>
          </div>
        </div>
        
        <div class="p-8 bg-gray-50/50 border-t border-gray-50 flex items-center text-xs text-gray-400 font-medium">
          <ShieldAlert class="w-4 h-4 mr-2 text-yellow-500" />
          Diqqət: Super Admin icazələri bütün sistemə tam giriş imkanı verir və dəyişdirilə bilməz.
        </div>
      </div>
    </div>
  </div>
</template>
