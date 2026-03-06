"use client"

import Link from "next/link"
import { Plus, AlertCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { EquipmentTable } from "@/components/equipment/equipment-table"
import { useData } from "@/lib/store/data-context"
import { useSubscription } from "@/lib/subscription/subscription-context"

export default function EquipmentPage() {
  const { equipment } = useData()
  const { canAddEquipment, getRemainingSlots, planDetails, currentPlan } = useSubscription()

  const equipmentCount = equipment.length
  const canAdd = canAddEquipment(equipmentCount)
  const remainingSlots = getRemainingSlots(equipmentCount)

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Equipment" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Equipment</h1>
              <Badge variant="outline" className="capitalize">
                {currentPlan} Plan
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {planDetails.equipmentLimit === null
                ? `${equipmentCount} items - Unlimited`
                : `${equipmentCount} of ${planDetails.equipmentLimit} items used`}
            </p>
          </div>
          <div className="flex gap-2">
            {!canAdd && (
              <Button asChild variant="outline">
                <Link href="/pricing">Upgrade Plan</Link>
              </Button>
            )}
            <Button asChild disabled={!canAdd}>
              <Link href={canAdd ? "/equipment/new" : "#"}>
                <Plus className="mr-2 size-4" />
                Add Equipment
              </Link>
            </Button>
          </div>
        </div>

        {!canAdd && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              You have reached your equipment limit ({planDetails.equipmentLimit} items).{" "}
              <Link href="/pricing" className="font-medium underline">
                Upgrade your plan
              </Link>{" "}
              to add more equipment.
            </AlertDescription>
          </Alert>
        )}

        {canAdd && remainingSlots !== null && remainingSlots <= 2 && (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              You have {remainingSlots} equipment slot{remainingSlots === 1 ? "" : "s"} remaining.{" "}
              <Link href="/pricing" className="font-medium underline">
                Upgrade your plan
              </Link>{" "}
              for more capacity.
            </AlertDescription>
          </Alert>
        )}

        <EquipmentTable />
      </div>
    </>
  )
}
