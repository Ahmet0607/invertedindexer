export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  priceId: string
  equipmentLimit: number | null // null means unlimited
  features: string[]
  popular?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for individuals and small teams getting started.',
    priceInCents: 0,
    priceId: '', // Free tier, no Stripe price
    equipmentLimit: 5,
    features: [
      'Up to 5 equipment items',
      'Basic reporting',
      'Email support',
      '1 team member',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing businesses that need more capacity.',
    priceInCents: 599,
    priceId: 'price_1T7rtxA5S7WDIty3sbaGxmIp',
    equipmentLimit: 50,
    popular: true,
    features: [
      'Up to 50 equipment items',
      'Advanced reporting',
      'Priority email support',
      'Up to 5 team members',
      'Warranty alerts',
      'Photo uploads',
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'For large organizations with unlimited needs.',
    priceInCents: 999,
    priceId: 'price_1T7ruuA5S7WDIty3CYAjbkop',
    equipmentLimit: null,
    features: [
      'Unlimited equipment items',
      'Custom reporting',
      'Phone & email support',
      'Unlimited team members',
      'Warranty alerts',
      'Photo uploads',
      'API access',
      'Custom integrations',
    ],
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id)
}

export function getProductByPriceId(priceId: string): Product | undefined {
  return PRODUCTS.find((product) => product.priceId === priceId)
}
