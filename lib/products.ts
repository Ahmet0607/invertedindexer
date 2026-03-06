export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  priceDisplay: string
  interval: 'month' | 'year' | 'one_time'
  features: string[]
  equipmentLimit: number | null
  popular?: boolean
}

// HST rate for Ontario (13%)
const HST_RATE = 0.13

// Base prices before HST
const PRO_PRICE = 999 // $9.99
const ADVANCED_PRICE = 1599 // $15.99

// Calculate price with HST
const withHST = (priceInCents: number) => Math.round(priceInCents * (1 + HST_RATE))

export const PRODUCTS: Product[] = [
  {
    id: 'basic-free',
    name: 'Basic',
    description: 'Perfect for small teams getting started',
    priceInCents: 0,
    priceDisplay: 'Free',
    interval: 'month',
    equipmentLimit: 5,
    features: [
      'Up to 5 equipment items',
      'Basic assignment tracking',
      'Email support',
      'Single user',
    ],
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    description: 'Best for growing businesses',
    priceInCents: withHST(PRO_PRICE), // $9.99 + HST = $11.29
    priceDisplay: '$11.29',
    interval: 'month',
    equipmentLimit: 50,
    popular: true,
    features: [
      'Up to 50 equipment items',
      'Full assignment history',
      'Team collaboration (up to 5 users)',
      'Priority email support',
      'Export reports',
    ],
  },
  {
    id: 'advanced-monthly',
    name: 'Advanced',
    description: 'For enterprises with unlimited needs',
    priceInCents: withHST(ADVANCED_PRICE), // $15.99 + HST = $18.07
    priceDisplay: '$18.07',
    interval: 'month',
    equipmentLimit: null, // Unlimited
    features: [
      'Unlimited equipment items',
      'Full assignment history',
      'Unlimited team members',
      'Priority phone & email support',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated account manager',
    ],
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export function getProductByPlan(plan: 'basic' | 'pro' | 'advanced'): Product | undefined {
  const mapping: Record<string, string> = {
    basic: 'basic-free',
    pro: 'pro-monthly',
    advanced: 'advanced-monthly',
  }
  return PRODUCTS.find((p) => p.id === mapping[plan])
}
