"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar } from "lucide-react"
import Link from "next/link"

interface ExpiringEquipment {
  id: string
  name: string
  brand: string
  warranty_expiry: string
  days_left: number
}

export function WarrantyAlerts() {
  const [expiringItems, setExpiringItems] = useState<ExpiringEquipment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExpiringWarranties()
  }, [])

  const fetchExpiringWarranties = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get equipment with warranty expiring in the next 30 days
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const today = new Date().toISOString().split("T")[0]
    const futureDate = thirtyDaysFromNow.toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("equipment")
      .select("id, name, brand, warranty_expiry")
      .eq("user_id", user.id)
      .not("warranty_expiry", "is", null)
      .gte("warranty_expiry", today)
      .lte("warranty_expiry", futureDate)
      .order("warranty_expiry", { ascending: true })

    if (data) {
      const itemsWithDays = data.map(item => {
        const expiryDate = new Date(item.warranty_expiry!)
        const todayDate = new Date()
        const diffTime = expiryDate.getTime() - todayDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return {
          ...item,
          warranty_expiry: item.warranty_expiry!,
          days_left: diffDays
        }
      })
      setExpiringItems(itemsWithDays)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Warranty Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (expiringItems.length === 0) {
    return null
  }

  return (
    <Card className="border-yellow-200 dark:border-yellow-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Warranty Alerts
        </CardTitle>
        <CardDescription>Equipment with warranties expiring soon</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expiringItems.map((item) => (
            <Link
              key={item.id}
              href={`/equipment/${item.id}/edit`}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.brand}</p>
                </div>
              </div>
              <Badge variant={item.days_left <= 7 ? "destructive" : "secondary"}>
                {item.days_left} days left
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
