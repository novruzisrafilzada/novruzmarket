import { defineStore } from 'pinia'

export interface RegisteredUser {
  id: number
  name: string
  email: string
  role: 'Müştəri'
  status: 'Aktiv'
  date: string
}

export const useRegisteredUserStore = defineStore('registeredUsers', {
  state: () => ({
    hydrated: false,
    users: [] as RegisteredUser[]
  }),
  actions: {
    setUsers(users: RegisteredUser[]) {
      this.users = users
      this.hydrated = true
    },
    async fetchUsers() {
      const users = await $fetch<RegisteredUser[]>('/api/admin/registered-users')
      this.setUsers(users)
    }
  }
})

