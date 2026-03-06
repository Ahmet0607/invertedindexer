"use client"

import { use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format, parseISO } from "date-fns"
import { Pencil, ArrowLeftRight, RotateCcw, ImageIcon } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/equipment/status-badge"
import { AssignmentHistory } from "@/components/equipment/assignment-history"
import { useData } from "@/lib/store/data-context"

interface EquipmentDetailPageProps {
  params: Promise<{ id: string }>
}

export default function EquipmentDetailPage({
  params,
}: EquipmentDetailPageProps) {
  const { id } = use(params)
  const { getEquipmentById, getEmployeeById, getDepartmentById } = useData()

  const equipment = getEquipmentById(id)

  if (!equipment) {
    notFound()
  }

  const assignedEmployee = equipment.assignedEmployeeId
    ? getEmployeeById(equipment.assignedEmployeeId)
    : null
  const department = equipment.departmentId
    ? getDepartmentById(equipment.departmentId)
    : null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Equipment", href: "/equipment" },
          { label: equipment.name },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {equipment.name}
              </h1>
              <StatusBadge status={equipment.status} />
            </div>
            <p className="text-muted-foreground">
              {equipment.brand} - {equipment.serialNumber}
            </p>
          </div>
          <div className="flex gap-2">
            {equipment.status === "available" && (
              <Button asChild>
                <Link href={`/assignments/new?equipmentId=${equipment.id}`}>
                  <ArrowLeftRight className="mr-2 size-4" />
                  Assign
                </Link>
              </Button>
            )}
            {equipment.status === "assigned" && (
              <Button asChild variant="secondary">
                <Link href={`/assignments/return?equipmentId=${equipment.id}`}>
                  <RotateCcw className="mr-2 size-4" />
                  Return
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href={`/equipment/${equipment.id}/edit`}>
                <Pencil className="mr-2 size-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Equipment Photo */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Equipment Photo</CardTitle>
            </CardHeader>
            <CardContent>
              {equipment.imageUrl ? (
                <img
                  src={equipment.imageUrl}
                  alt={equipment.name}
                  className="h-64 w-full rounded-lg object-contain border bg-muted/20"
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed bg-muted/50">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="size-12" />
                    <p className="text-sm">No photo available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Equipment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Serial Number</p>
                  <p className="font-mono text-sm">{equipment.serialNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Brand</p>
                  <p className="text-sm">{equipment.brand}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Purchase Date</p>
                  <p className="text-sm">
                    {format(parseISO(equipment.purchaseDate), "MMMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Purchase Price</p>
                  <p className="text-sm">
                    {formatCurrency(equipment.purchasePrice)}
                  </p>
                </div>
                {equipment.warrantyMonths && (
                  <div>
                    <p className="text-xs text-muted-foreground">Warranty</p>
                    <p className="text-sm">{equipment.warrantyMonths} months</p>
                  </div>
                )}
                {equipment.maintenanceIntervalMonths && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Maintenance Interval
                    </p>
                    <p className="text-sm">
                      Every {equipment.maintenanceIntervalMonths} months
                    </p>
                  </div>
                )}
              </div>
              {equipment.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{equipment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedEmployee ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Assigned To
                      </p>
                      <p className="text-sm font-medium">
                        {assignedEmployee.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {assignedEmployee.position}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="text-sm">
                        {department?.name || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm">{assignedEmployee.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This equipment is not currently assigned to anyone
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assignment History */}
        <AssignmentHistory equipmentId={equipment.id} />
      </div>
    </>
  )
}
