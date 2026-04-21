import { defineStore } from 'pinia'

export interface Brand {
  id: number
  name: string
  logo: string
  status: 'Aktiv' | 'Deaktiv'
}

export const useBrandStore = defineStore('brands', {
  state: () => ({
    brands: [
      { id: 1, name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', status: 'Aktiv' },
      { id: 2, name: 'Samsung', logo: '', status: 'Aktiv' },
      { id: 3, name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', status: 'Aktiv' },
      { id: 4, name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', status: 'Aktiv' },
      { id: 5, name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', status: 'Aktiv' }
    ] as Brand[],
  }),
  actions: {
    addBrand(brand: Omit<Brand, 'id'>) {
      const newId = this.brands.length > 0 ? Math.max(...this.brands.map(b => b.id)) + 1 : 1
      this.brands.push({ ...brand, id: newId })
    },
    updateBrand(id: number, updatedBrand: Partial<Brand>) {
      const index = this.brands.findIndex(b => b.id === id)
      if (index !== -1) {
        this.brands[index] = { ...this.brands[index], ...updatedBrand }
      }
    },
    deleteBrand(id: number) {
      this.brands = this.brands.filter(b => b.id !== id)
    }
  }
})
