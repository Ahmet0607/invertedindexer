export type SubscriptionPlan = "basic" | "pro" | "advanced"

export interface PlanDetails {
  id: SubscriptionPlan
  name: string
  description: string
  price: number // Base price in CAD
  hstRate: number // 13% HST
  totalPrice: number // Price + HST
  equipmentLimit: number | null // null = unlimited
  features: string[]
  popular?: boolean
}

export const HST_RATE = 0.13 // 13% HST

export const PLANS: Record<SubscriptionPlan, PlanDetails> = {
  basic: {
    id: "basic",
    name: "Basic",
    description: "Perfect for small teams getting started",
    price: 0,
    hstRate: 0,
    totalPrice: 0,
    equipmentLimit: 5,
    features: [
      "Up to 5 equipment items",
      "Basic equipment tracking",
      "Assignment management",
      "Mobile app access",
      "Email support",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Best for growing businesses",
    price: 9.99,
    hstRate: 9.99 * HST_RATE,
    totalPrice: 9.99 * (1 + HST_RATE),
    equipmentLimit: 50,
    popular: true,
    features: [
      "Up to 50 equipment items",
      "Everything in Basic",
      "Advanced reporting",
      "Equipment history & analytics",
      "Priority email support",
      "Export to CSV/PDF",
    ],
  },
  advanced: {
    id: "advanced",
    name: "Advanced",
    description: "For large organizations with unlimited needs",
    price: 15.99,
    hstRate: 15.99 * HST_RATE,
    totalPrice: 15.99 * (1 + HST_RATE),
    equipmentLimit: null, // Unlimited
    features: [
      "Unlimited equipment items",
      "Everything in Pro",
      "Custom branding",
      "API access",
      "Dedicated account manager",
      "24/7 phone & email support",
      "Advanced integrations",
    ],
  },
}

export function getPlanEquipmentLimit(plan: SubscriptionPlan): number | null {
  return PLANS[plan].equipmentLimit
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(price)
}
