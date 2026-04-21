import { defineStore } from 'pinia'

export interface Log {
  id: number
  user: string
  action: string
  ip: string
  date: string
}

export const useLogStore = defineStore('logs', {
  state: () => ({
    hydrated: false,
    logs: [] as Log[],
  }),
  actions: {
    setLogs(logs: Log[]) {
      this.logs = logs
      this.hydrated = true
    },
    async fetchLogs() {
      const logs = await $fetch<Log[]>('/api/logs')
      this.setLogs(logs)
    }
  }
})
