"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { EquipmentForm } from "@/components/equipment/equipment-form"
import { useData } from "@/lib/store/data-context"

interface EditEquipmentPageProps {
  params: Promise<{ id: string }>
}

export default function EditEquipmentPage({ params }: EditEquipmentPageProps) {
  const { id } = use(params)
  const { getEquipmentById } = useData()

  const equipment = getEquipmentById(id)

  if (!equipment) {
    notFound()
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Equipment", href: "/equipment" },
          { label: equipment.name, href: `/equipment/${equipment.id}` },
          { label: "Edit" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Equipment
          </h1>
          <p className="text-muted-foreground">
            Update equipment information
          </p>
        </div>
        <EquipmentForm equipment={equipment} mode="edit" />
      </div>
    </>
  )
}
