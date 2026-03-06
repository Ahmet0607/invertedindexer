"use client"

import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import Checkout from "@/components/checkout"
import { PRODUCTS } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.planId as string
  
  const product = PRODUCTS.find(p => p.id === planId)
  
  if (!product || !product.priceId) {
    return (
      <>
        <Header title="Checkout" description="Complete your subscription" />
        <div className="flex-1 p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Invalid plan selected</p>
            <Button onClick={() => router.push("/pricing")} className="mt-4">
              Back to Pricing
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Checkout" description={`Subscribe to ${product.name}`} />
      <div className="flex-1 p-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/pricing")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pricing
        </Button>
        
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="text-muted-foreground">{product.description}</p>
            <p className="text-3xl font-bold mt-2">
              ${(product.priceInCents / 100).toFixed(2)}<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
          </div>
          
          <Checkout productId={planId} />
        </div>
      </div>
    </>
  )
}
