import { defineStore } from 'pinia'

export interface Role {
  id: number
  name: string
  permissions: string[]
}

export const usePermissionStore = defineStore('permissions', {
  state: () => ({
    roles: [
      { id: 1, name: 'Super Admin', permissions: ['all'] },
      { id: 2, name: 'Menecer', permissions: ['products.view', 'products.edit', 'orders.view', 'orders.edit'] },
      { id: 3, name: 'Satış Meneceri', permissions: ['orders.view', 'orders.edit'] },
      { id: 4, name: 'Redaktor', permissions: ['blog.view', 'blog.edit', 'pages.view', 'pages.edit'] }
    ] as Role[],
    availablePermissions: [
      { id: 'products.view', name: 'Məhsulları görmək' },
      { id: 'products.edit', name: 'Məhsulları redaktə etmək' },
      { id: 'orders.view', name: 'Sifarişləri görmək' },
      { id: 'orders.edit', name: 'Sifarişləri idarə etmək' },
      { id: 'users.view', name: 'İstifadəçiləri görmək' },
      { id: 'users.edit', name: 'İstifadəçiləri idarə etmək' },
      { id: 'settings.view', name: 'Ayarları görmək' },
      { id: 'settings.edit', name: 'Ayarları dəyişmək' }
    ]
  }),
  actions: {
    updateRolePermissions(roleId: number, permissions: string[]) {
      const role = this.roles.find(r => r.id === roleId)
      if (role) role.permissions = permissions
    }
  }
})
