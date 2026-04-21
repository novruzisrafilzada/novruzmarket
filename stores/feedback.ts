import { defineStore } from 'pinia'

export interface Feedback {
  id: number
  user: string
  product: string
  rating: number
  comment: string
  date: string
  status: 'Təsdiqləndi' | 'Gözləyir' | 'Rədd edildi'
}

export interface Message {
  id: number
  name: string
  email: string
  subject: string
  message: string
  date: string
  isRead: boolean
}

export const useFeedbackStore = defineStore('feedback', {
  state: () => ({
    reviews: [
      { id: 1, user: 'Ayxan M.', product: 'iPhone 15 Pro', rating: 5, comment: 'Əla məhsuldur, çox bəyəndim!', date: '2024-03-29', status: 'Təsdiqləndi' },
      { id: 2, user: 'Leyla Ə.', product: 'Sony PS5', rating: 4, comment: 'Bir az gec çatdırıldı amma keyfiyyət yaxşıdır.', date: '2024-03-28', status: 'Gözləyir' }
    ] as Feedback[],
    messages: [
      { id: 1, name: 'Nicat Q.', email: 'nicat@mail.com', subject: 'Əməkdaşlıq', message: 'Sizinlə topdan satış üçün əməkdaşlıq etmək istəyirik.', date: '2024-03-29', isRead: false },
      { id: 2, name: 'Günay H.', email: 'gunay@mail.com', subject: 'Çatdırılma haqqında', message: 'Sifarişim nə vaxt çatacaq?', date: '2024-03-27', isRead: true }
    ] as Message[]
  }),
  actions: {
    updateReviewStatus(id: number, status: Feedback['status']) {
      const review = this.reviews.find(r => r.id === id)
      if (review) review.status = status
    },
    deleteReview(id: number) {
      this.reviews = this.reviews.filter(r => r.id !== id)
    },
    markMessageAsRead(id: number) {
      const msg = this.messages.find(m => m.id === id)
      if (msg) msg.isRead = true
    },
    deleteMessage(id: number) {
      this.messages = this.messages.filter(m => m.id !== id)
    }
  }
})
