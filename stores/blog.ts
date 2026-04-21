import { defineStore } from 'pinia'
import type { BlogPostStatus } from '~/utils/blog'

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  date: string
  category: string
  status: BlogPostStatus
  author: string
  tags: string[]
  featured: boolean
  readingTime: number
  publishedAt: string
  updatedAt: string
  seo: {
    title: string
    description: string
    keywords: string
  }
}

export const useBlogStore = defineStore('blog', {
  state: () => ({
    hydrated: false,
    posts: [] as BlogPost[],
  }),
  actions: {
    setPosts(posts: BlogPost[]) {
      this.posts = posts
      this.hydrated = true
    },
    async fetchPosts() {
      if (process.server) return
      const posts = await $fetch<BlogPost[]>('/api/blog')
      this.setPosts(posts)
      return posts
    },
    async addPost(post: Omit<BlogPost, 'id' | 'date' | 'readingTime' | 'updatedAt'>) {
      if (process.server) return
      const created = await $fetch<BlogPost>('/api/blog', { method: 'POST', body: post })
      this.posts.unshift(created)
      this.hydrated = true
      return created
    },
    async updatePost(id: number, updatedPost: Partial<BlogPost>) {
      if (process.server) return
      const updated = await $fetch<BlogPost>(`/api/blog/${id}`, { method: 'PUT', body: updatedPost })
      const index = this.posts.findIndex(p => p.id === id)
      if (index !== -1) this.posts[index] = updated
      this.hydrated = true
      return updated
    },
    async deletePost(id: number) {
      if (process.server) return
      await $fetch(`/api/blog/${id}`, { method: 'DELETE' })
      this.posts = this.posts.filter(p => p.id !== id)
    }
  }
})
