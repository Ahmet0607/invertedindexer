"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { PRODUCTS } from "@/lib/products"
import Checkout from "@/components/checkout"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)

  const handleSelectPlan = (planId: string) => {
    if (planId === 'basic') {
      // Basic is free, no checkout needed
      return
    }
    setSelectedPlan(planId)
    setShowCheckout(true)
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

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {PRODUCTS.map((product) => (
            <Card 
              key={product.id} 
              className={`relative flex flex-col ${product.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {product.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
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
                  variant={product.popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(product.id)}
                  disabled={product.id === 'basic'}
                >
                  {product.id === 'basic' ? 'Current Plan' : `Upgrade to ${product.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Complete your subscription</DialogTitle>
            </DialogHeader>
            {selectedPlan && <Checkout productId={selectedPlan} />}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
