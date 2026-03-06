'use server'

import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'

export async function startCheckoutSession(productId: string) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  if (product.priceInCents === 0) {
    throw new Error('Cannot checkout for free products')
  }

  // Create Checkout Session for subscription
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: 'cad',
          product_data: {
            name: `EquipTrack ${product.name} Plan`,
            description: product.description,
          },
          unit_amount: product.priceInCents,
          recurring: product.interval !== 'one_time' ? {
            interval: product.interval,
          } : undefined,
        },
        quantity: 1,
      },
    ],
    mode: product.interval !== 'one_time' ? 'subscription' : 'payment',
  })

  return session.client_secret
}

export async function getCheckoutSessionStatus(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  
  return {
    status: session.status,
    customerEmail: session.customer_details?.email,
  }
}
