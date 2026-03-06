import 'server-only'

import Stripe from 'stripe'

// Create Stripe client lazily to avoid build errors when env vars are missing
let _stripe: Stripe | null = null

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!_stripe) {
      const key = process.env.STRIPE_SECRET_KEY
      if (!key) {
        throw new Error('STRIPE_SECRET_KEY is not set')
      }
      _stripe = new Stripe(key)
    }
    return (_stripe as any)[prop]
  }
})
