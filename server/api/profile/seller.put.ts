import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { readCategories } from '~/server/utils/categories-db'
import { readUsers, writeUsers } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event, { required: true, roles: ['Satıcı'] })
  const body = await readBody<any>(event)
  const users = await readUsers()
  const sellerIndex = users.findIndex((user) => Number(user.id) === Number(currentUser.id) && user.role === 'Satıcı')

  if (sellerIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Satıcı hesabı tapılmadı' })
  }

  const rawCategoryIds = Array.isArray(body?.sellerProfile?.categoryIds) ? body.sellerProfile.categoryIds : []
  const categoryIds = [...new Set(rawCategoryIds.map((value: any) => Number(value)).filter((value: number) => Number.isFinite(value) && value > 0))]
  const categories = await readCategories()
  const validIds = new Set(categories.filter((category) => category.parentId === null).map((category) => Number(category.id)))
  if (categoryIds.some((categoryId) => !validIds.has(Number(categoryId)))) {
    throw createError({ statusCode: 400, statusMessage: 'Kateqoriya seçimi yanlışdır' })
  }

  const current = users[sellerIndex]
  users[sellerIndex] = {
    ...current,
    phone: String(body?.phone ?? current.phone ?? '').trim() || current.phone,
    sellerProfile: {
      ...(current.sellerProfile || {}),
      shopName: String(body?.sellerProfile?.shopName ?? current.sellerProfile?.shopName ?? current.name).trim(),
      phone: String(body?.sellerProfile?.phone ?? current.sellerProfile?.phone ?? current.phone ?? '').trim(),
      note: String(body?.sellerProfile?.note ?? current.sellerProfile?.note ?? '').trim(),
      profileImage: String(body?.sellerProfile?.profileImage ?? current.sellerProfile?.profileImage ?? '').trim(),
      coverImage: String(body?.sellerProfile?.coverImage ?? current.sellerProfile?.coverImage ?? '').trim(),
      categoryIds
    }
  }

  await writeUsers(users)

  return {
    success: true,
    sellerProfile: users[sellerIndex].sellerProfile
  }
})
