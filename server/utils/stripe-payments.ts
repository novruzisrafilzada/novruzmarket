import { createError } from 'h3'

const stripeApiBase = 'https://api.stripe.com/v1'

const encodeParams = (params: Record<string, string>) => {
  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    body.append(key, value)
  }
  return body
}

export const createStripeCheckoutSession = async (args: {
  secretKey: string
  successUrl: string
  cancelUrl: string
  currency: string
  customerEmail: string
  items: Array<{ name: string; price: number; qty: number }>
  adjustments?: Array<{ name: string; amount: number }>
  metadata?: Record<string, string>
}) => {
  const params: Record<string, string> = {
    mode: 'payment',
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    'billing_address_collection': 'required',
    'customer_email': args.customerEmail
  }

  const lineItems = [
    ...args.items.map((item) => ({
      name: String(item.name || 'Məhsul'),
      unitAmount: Math.round(Number(item.price || 0) * 100),
      quantity: Math.max(1, Number(item.qty || 1))
    })),
    ...(args.adjustments || [])
      .filter((item) => Number(item.amount || 0) !== 0)
      .map((item) => ({
        name: String(item.name || 'Adjustment'),
        unitAmount: Math.round(Number(item.amount || 0) * 100),
        quantity: 1
      }))
  ]

  lineItems.forEach((item, index) => {
    params[`line_items[${index}][quantity]`] = String(Math.max(1, Number(item.quantity || 1)))
    params[`line_items[${index}][price_data][currency]`] = String(args.currency || 'azn').toLowerCase()
    params[`line_items[${index}][price_data][unit_amount]`] = String(item.unitAmount)
    params[`line_items[${index}][price_data][product_data][name]`] = item.name
  })

  Object.entries(args.metadata || {}).forEach(([key, value]) => {
    params[`metadata[${key}]`] = value
  })

  const response = await fetch(`${stripeApiBase}/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: encodeParams(params)
  })

  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.url || !data?.id) {
    throw createError({ statusCode: 400, statusMessage: data?.error?.message || 'Stripe sessiyası yaradıla bilmədi' })
  }

  return data as { id: string; url: string; payment_status?: string; status?: string; metadata?: Record<string, string> }
}

export const getStripeCheckoutSession = async (secretKey: string, sessionId: string) => {
  const response = await fetch(`${stripeApiBase}/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`
    }
  })

  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.id) {
    throw createError({ statusCode: 400, statusMessage: data?.error?.message || 'Stripe sessiyası oxuna bilmədi' })
  }

  return data as { id: string; payment_status?: string; status?: string; metadata?: Record<string, string> }
}
