'use client'

import { useCallback, useState } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { startCheckoutSession } from '@/app/actions/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutProps {
  productId: string
  productName: string
  onClose?: () => void
}

export function Checkout({ productId, productName, onClose }: CheckoutProps) {
  const fetchClientSecret = useCallback(
    () => startCheckoutSession(productId),
    [productId]
  )

  return (
    <div className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
}

export function CheckoutDialog({ open, onOpenChange, productId, productName }: CheckoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subscribe to {productName}</DialogTitle>
        </DialogHeader>
        <Checkout 
          productId={productId} 
          productName={productName} 
          onClose={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  )
}
