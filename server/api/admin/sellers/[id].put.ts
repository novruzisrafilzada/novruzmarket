import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { readCategories } from '~/server/utils/categories-db'
import { readUsers, writeUsers } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const actor = await getRequestUser(event, { required: true, roles: ['Admin'] })

  const sellerId = Number((event.context.params as any).id)
  if (!Number.isFinite(sellerId) || sellerId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Satıcı identifikatoru yanlışdır' })
  }

  const body = await readBody<any>(event)
  const users = await readUsers()
  const sellerIndex = users.findIndex((user) => Number(user.id) === sellerId && user.role === 'Satıcı')
  if (sellerIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Satıcı tapılmadı' })
  }

  const rawCategoryIds = Array.isArray(body?.sellerProfile?.categoryIds) ? body.sellerProfile.categoryIds : []
  const categoryIds = [...new Set(rawCategoryIds.map((value: any) => Number(value)).filter((value: number) => Number.isFinite(value) && value > 0))]
  const categories = await readCategories()
  const validIds = new Set(categories.filter((category) => category.parentId === null).map((category) => Number(category.id)))
  if (categoryIds.some((categoryId) => !validIds.has(Number(categoryId)))) {
    throw createError({ statusCode: 400, statusMessage: 'Kateqoriya seçimi yanlışdır' })
  }

  const current = users[sellerIndex]
  const currentStatus = String(current.sellerProfile?.verifiedStatus || 'Yoxdur') as 'Yoxdur' | 'Gözləyir' | 'Təsdiqləndi'
  const requestedVerifiedStatus = String(body?.sellerProfile?.verifiedStatus ?? current.sellerProfile?.verifiedStatus ?? 'Yoxdur')
  const verifiedStatus = requestedVerifiedStatus === 'Təsdiqləndi'
    ? 'Təsdiqləndi'
    : requestedVerifiedStatus === 'Gözləyir'
      ? 'Gözləyir'
      : 'Yoxdur'
  const verifiedNote = String(body?.sellerProfile?.verifiedNote ?? current.sellerProfile?.verifiedNote ?? '').trim()
  const previousHistory = Array.isArray(current.sellerProfile?.verificationHistory) ? current.sellerProfile?.verificationHistory : []
  const nextHistory = [...previousHistory]
  const currentDocs = Array.isArray(current.sellerProfile?.verificationDocuments) ? current.sellerProfile?.verificationDocuments : []
  const statusChanged = currentStatus !== verifiedStatus
  if (statusChanged || (verifiedNote && verifiedNote !== String(current.sellerProfile?.verifiedNote || '').trim())) {
    nextHistory.unshift({
      at: new Date().toISOString(),
      by: actor.name || actor.email || 'Admin',
      fromStatus: currentStatus,
      toStatus: verifiedStatus,
      note: verifiedNote || undefined
    })
  }
  const nextDocuments = Array.isArray(body?.sellerProfile?.verificationDocuments)
    ? body.sellerProfile.verificationDocuments.map((item: any, index: number) => {
        const existing = currentDocs.find((doc: any) => String(doc.id) === String(item?.id || ''))
        const nextStatus = String(item?.status || existing?.status || 'pending')
        const prevStatus = String(existing?.status || 'pending')
        const status = nextStatus === 'approved' ? 'approved' : nextStatus === 'rejected' ? 'rejected' : 'pending'
        return {
          id: String(item?.id || existing?.id || `${current.id}-doc-${Date.now()}-${index}`),
          title: String(item?.title || existing?.title || '').trim(),
          url: String(item?.url || existing?.url || '').trim(),
          status,
          uploadedAt: String(item?.uploadedAt || existing?.uploadedAt || new Date().toISOString()),
          reviewedAt: status !== prevStatus && status !== 'pending' ? new Date().toISOString() : String(item?.reviewedAt || existing?.reviewedAt || ''),
          reviewedBy: status !== prevStatus && status !== 'pending' ? (actor.name || actor.email || 'Admin') : String(item?.reviewedBy || existing?.reviewedBy || ''),
          note: String(item?.note || existing?.note || '').trim()
        }
      }).filter((item: any) => item.title && item.url)
    : currentDocs
  const nextSellerProfile = {
    ...(current.sellerProfile || {}),
    shopName: String(body?.sellerProfile?.shopName ?? current.sellerProfile?.shopName ?? current.name).trim(),
    phone: String(body?.sellerProfile?.phone ?? current.sellerProfile?.phone ?? current.phone ?? '').trim(),
    note: String(body?.sellerProfile?.note ?? current.sellerProfile?.note ?? '').trim(),
    profileImage: String(body?.sellerProfile?.profileImage ?? current.sellerProfile?.profileImage ?? '').trim(),
    coverImage: String(body?.sellerProfile?.coverImage ?? current.sellerProfile?.coverImage ?? '').trim(),
    categoryIds,
    tagline: String(body?.sellerProfile?.tagline ?? current.sellerProfile?.tagline ?? '').trim(),
    storefrontLayout: String(body?.sellerProfile?.storefrontLayout ?? current.sellerProfile?.storefrontLayout ?? 'classic').trim(),
    themeColor: String(body?.sellerProfile?.themeColor ?? current.sellerProfile?.themeColor ?? '').trim(),
    campaignHeadline: String(body?.sellerProfile?.campaignHeadline ?? current.sellerProfile?.campaignHeadline ?? '').trim(),
    heroLabel: String(body?.sellerProfile?.heroLabel ?? current.sellerProfile?.heroLabel ?? '').trim(),
    verifiedStatus,
    verifiedAt: verifiedStatus === 'Təsdiqləndi'
      ? String(body?.sellerProfile?.verifiedAt ?? current.sellerProfile?.verifiedAt ?? new Date().toISOString())
      : '',
    verifiedByName: verifiedStatus === 'Təsdiqləndi' ? (actor.name || actor.email || 'Admin') : '',
    verifiedNote,
    verificationHistory: nextHistory.slice(0, 20),
    verificationDocuments: nextDocuments.slice(0, 20)
  }

  users[sellerIndex] = {
    ...current,
    sellerProfile: nextSellerProfile,
    phone: String(body?.phone ?? current.phone ?? '').trim() || current.phone
  }

  await writeUsers(users)

  return {
    success: true,
    seller: {
      id: users[sellerIndex].id,
      shopName: users[sellerIndex].sellerProfile?.shopName || users[sellerIndex].name,
      profileImage: users[sellerIndex].sellerProfile?.profileImage || '',
      coverImage: users[sellerIndex].sellerProfile?.coverImage || '',
      categoryIds: users[sellerIndex].sellerProfile?.categoryIds || [],
      note: users[sellerIndex].sellerProfile?.note || '',
      phone: users[sellerIndex].sellerProfile?.phone || users[sellerIndex].phone || '',
      verifiedStatus: users[sellerIndex].sellerProfile?.verifiedStatus || 'Yoxdur',
      verifiedAt: users[sellerIndex].sellerProfile?.verifiedAt || '',
      verifiedByName: users[sellerIndex].sellerProfile?.verifiedByName || '',
      verifiedNote: users[sellerIndex].sellerProfile?.verifiedNote || '',
      verificationHistory: users[sellerIndex].sellerProfile?.verificationHistory || [],
      verificationDocuments: users[sellerIndex].sellerProfile?.verificationDocuments || []
    }
  }
})
