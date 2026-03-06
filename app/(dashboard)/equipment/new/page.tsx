"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EquipmentForm } from "@/components/equipment/equipment-form"
import { useData } from "@/lib/store/data-context"
import { useSubscription } from "@/lib/subscription/subscription-context"

export default function NewEquipmentPage() {
  const { equipment } = useData()
  const { canAddEquipment, planDetails, currentPlan } = useSubscription()

  const equipmentCount = equipment.length
  const canAdd = canAddEquipment(equipmentCount)

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Equipment", href: "/equipment" },
          { label: "New Equipment" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Add New Equipment
          </h1>
          <p className="text-muted-foreground">
            Register new equipment to your inventory
          </p>
        </div>

        {canAdd ? (
          <EquipmentForm mode="create" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="size-5 text-destructive" />
                Equipment Limit Reached
              </CardTitle>
              <CardDescription>
                Your {currentPlan} plan allows up to {planDetails.equipmentLimit} equipment items.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Upgrade Required</AlertTitle>
                <AlertDescription>
                  You currently have {equipmentCount} equipment items, which is the maximum
                  for your plan. Upgrade to add more equipment.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/pricing">View Pricing Plans</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/equipment">Back to Equipment</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
