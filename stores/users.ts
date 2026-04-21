import { defineStore } from 'pinia'

export interface User {
  id: number
  name: string
  email: string
  role: 'Admin' | 'Menecer' | 'Müştəri'
  status: 'Aktiv' | 'Deaktiv'
  date: string
}

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [
      { id: 1, name: 'Ayxan Məmmədov', email: 'ayxan@mail.com', role: 'Admin', status: 'Aktiv', date: '2024-03-29' },
      { id: 2, name: 'Leyla Əliyeva', email: 'leyla@mail.com', role: 'Menecer', status: 'Aktiv', date: '2024-03-28' },
      { id: 3, name: 'Nicat Qasımov', email: 'nicat@mail.com', role: 'Müştəri', status: 'Deaktiv', date: '2024-03-27' },
    ] as User[],
  }),
  actions: {
    addUser(user: Omit<User, 'id' | 'date'>) {
      const newId = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1
      const date = new Date().toISOString().split('T')[0]
      this.users.push({ ...user, id: newId, date })
    },
    updateUser(id: number, updatedUser: Partial<User>) {
      const index = this.users.findIndex(u => u.id === id)
      if (index !== -1) {
        this.users[index] = { ...this.users[index], ...updatedUser }
      }
    },
    deleteUser(id: number) {
      this.users = this.users.filter(u => u.id !== id)
    }
  }
})
