import { readProducts, writeProducts } from '~/server/utils/products-db'

export interface ProductRepository {
  getAll(): Promise<any[]>
  saveAll(items: any[]): Promise<void>
}

export const productRepository: ProductRepository = {
  async getAll() {
    return await readProducts()
  },
  async saveAll(items: any[]) {
    await writeProducts(items)
  }
}
