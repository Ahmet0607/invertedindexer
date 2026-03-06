"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { PRODUCTS } from "@/lib/products"

export default function PricingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSelectPlan = (planId: string) => {
    if (planId === 'basic') {
      return
    }
    setSelectedPlan(planId)
  }

  const handleUpgrade = () => {
    if (selectedPlan) {
      router.push(`/checkout/${selectedPlan}`)
    }
  }

  return (
    <>
      <Header title="Pricing" description="Choose the plan that's right for you" />
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
          <p className="text-muted-foreground mt-2">
            Start free and upgrade as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto items-end">
          {PRODUCTS.map((product) => {
            const isSelected = selectedPlan === product.id
            const isBasic = product.id === 'basic'
            
            return (
              <Card 
                key={product.id} 
                onClick={() => !isBasic && handleSelectPlan(product.id)}
                className={`relative flex flex-col transition-all duration-200 ${
                  isSelected 
                    ? 'border-2 border-foreground shadow-xl scale-105 z-10' 
                    : 'border hover:border-muted-foreground/50'
                } ${!isBasic ? 'cursor-pointer' : ''}`}
              >
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-4">
                    <span className="text-4xl font-bold">
                      ${(product.priceInCents / 100).toFixed(2)}
                    </span>
                    {product.priceInCents > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={isSelected ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isSelected) {
                        handleUpgrade()
                      } else if (!isBasic) {
                        handleSelectPlan(product.id)
                      }
                    }}
                    disabled={isBasic}
                  >
                    {isBasic 
                      ? 'Current Plan' 
                      : isSelected 
                        ? 'Continue to Payment' 
                        : `Select ${product.name}`
                    }
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </>
  )
}
