"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { SubscriptionPlan, PlanDetails } from "./types"
import { PLANS, getPlanEquipmentLimit } from "./types"

interface SubscriptionState {
  currentPlan: SubscriptionPlan
  planDetails: PlanDetails
  equipmentLimit: number | null
  isLoading: boolean
}

interface SubscriptionActions {
  upgradePlan: (plan: SubscriptionPlan) => void
  canAddEquipment: (currentCount: number) => boolean
  getRemainingSlots: (currentCount: number) => number | null
}

type SubscriptionStore = SubscriptionState & SubscriptionActions

const SubscriptionContext = createContext<SubscriptionStore | null>(null)

const STORAGE_KEY = "equiptrack-subscription"

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>("basic")
  const [isLoading, setIsLoading] = useState(true)

  // Load subscription from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.plan && PLANS[data.plan as SubscriptionPlan]) {
          setCurrentPlan(data.plan)
        }
      } catch {
        // Invalid data, use default
      }
    }
    setIsLoading(false)
  }, [])

  // Save to localStorage when plan changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ plan: currentPlan }))
    }
  }, [currentPlan, isLoading])

  const upgradePlan = useCallback((plan: SubscriptionPlan) => {
    setCurrentPlan(plan)
  }, [])

  const equipmentLimit = getPlanEquipmentLimit(currentPlan)

  const canAddEquipment = useCallback(
    (currentCount: number) => {
      if (equipmentLimit === null) return true // Unlimited
      return currentCount < equipmentLimit
    },
    [equipmentLimit]
  )

  const getRemainingSlots = useCallback(
    (currentCount: number) => {
      if (equipmentLimit === null) return null // Unlimited
      return Math.max(0, equipmentLimit - currentCount)
    },
    [equipmentLimit]
  )

  const store: SubscriptionStore = {
    currentPlan,
    planDetails: PLANS[currentPlan],
    equipmentLimit,
    isLoading,
    upgradePlan,
    canAddEquipment,
    getRemainingSlots,
  }

  return (
    <SubscriptionContext.Provider value={store}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
