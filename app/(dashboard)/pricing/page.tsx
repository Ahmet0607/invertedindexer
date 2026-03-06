"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/lib/subscription/subscription-context"
import { PLANS, formatPrice, type SubscriptionPlan } from "@/lib/subscription/types"
import { CheckoutDialog } from "@/components/checkout"

// Map subscription plans to Stripe product IDs
const PLAN_TO_PRODUCT: Record<SubscriptionPlan, string> = {
  basic: "basic-free",
  pro: "pro-monthly",
  advanced: "advanced-monthly",
}

export default function PricingPage() {
  const { currentPlan, upgradePlan } = useSubscription()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{ id: SubscriptionPlan; name: string } | null>(null)

  const handleSelectPlan = (planId: SubscriptionPlan, planName: string) => {
    if (planId === "basic") {
      upgradePlan(planId)
    } else {
      // Open Stripe checkout for paid plans
      setSelectedPlan({ id: planId, name: planName })
      setCheckoutOpen(true)
    }
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pricing" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-8 p-6">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-2 text-muted-foreground">
            Choose the plan that fits your business needs. All prices are in CAD and include HST.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto w-full">
          {(Object.values(PLANS) as typeof PLANS[SubscriptionPlan][]).map((plan) => {
            const isCurrentPlan = currentPlan === plan.id
            const isDowngrade =
              (currentPlan === "advanced" && plan.id !== "advanced") ||
              (currentPlan === "pro" && plan.id === "basic")

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">Free</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">
                            {formatPrice(plan.price)}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          + {formatPrice(plan.hstRate)} HST = {formatPrice(plan.totalPrice)} total
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium">
                      {plan.equipmentLimit === null
                        ? "Unlimited equipment"
                        : `Up to ${plan.equipmentLimit} equipment items`}
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="size-4 mt-0.5 text-primary shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "secondary" : plan.popular ? "default" : "outline"}
                    disabled={isCurrentPlan}
                    onClick={() => handleSelectPlan(plan.id, plan.name)}
                  >
                    {isCurrentPlan
                      ? "Current Plan"
                      : isDowngrade
                      ? "Downgrade"
                      : plan.price === 0
                      ? "Get Started"
                      : "Upgrade"}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            All paid plans include a 14-day free trial. Cancel anytime.
            Need a custom plan for your enterprise? Contact us at{" "}
            <a href="mailto:sales@equiptrack.app" className="text-primary hover:underline">
              sales@equiptrack.app
            </a>
          </p>
        </div>
      </div>

      {selectedPlan && (
        <CheckoutDialog
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          productId={PLAN_TO_PRODUCT[selectedPlan.id]}
          productName={selectedPlan.name}
        />
      )}
    </>
  )
}
