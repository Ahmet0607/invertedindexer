"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { DepartmentForm } from "@/components/departments/department-form"
import { useData } from "@/lib/store/data-context"

interface EditDepartmentPageProps {
  params: Promise<{ id: string }>
}

export default function EditDepartmentPage({ params }: EditDepartmentPageProps) {
  const { id } = use(params)
  const { getDepartmentById } = useData()

  const department = getDepartmentById(id)

  if (!department) {
    notFound()
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Departments", href: "/departments" },
          { label: department.name, href: `/departments/${department.id}` },
          { label: "Edit" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Department
          </h1>
          <p className="text-muted-foreground">
            Update department information
          </p>
        </div>

        <DepartmentForm department={department} mode="edit" />
      </div>
    </>
  )
}
