import { readBlogPosts } from '~/server/utils/blog-db'
import { readPages } from '~/server/utils/pages-db'
import { readProducts } from '~/server/utils/products-db'
import { readUsers } from '~/server/utils/users-db'
import { buildBlogHref, isBlogPostPublic } from '~/utils/blog'
import { buildProductHref } from '~/utils/product-route'

const escapeXml = (value: string) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

export default defineEventHandler(async (event) => {
  const origin = getRequestURL(event).origin
  const [products, posts, pages, users] = await Promise.all([
    readProducts(),
    readBlogPosts(),
    readPages(),
    readUsers()
  ])

  const urls = [
    '/',
    '/shop',
    '/blog',
    '/contact',
    '/about',
    '/faq',
    ...products.filter((product) => product.status === 'Aktiv').map((product) => buildProductHref(product)),
    ...posts.filter((post) => isBlogPostPublic(post)).map((post) => buildBlogHref(post)),
    ...pages.filter((page) => page.status === 'Aktiv').map((page) => page.slug === 'about' ? '/about' : page.slug === 'contact' ? '/contact' : `/${page.slug}`),
    ...users.filter((user) => user.role === 'Satıcı' && user.status === 'Aktiv').map((user) => `/sellers/${user.id}`)
  ]

  const uniqueUrls = [...new Set(urls)]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map((path) => `  <url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`).join('\n')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return xml
})
