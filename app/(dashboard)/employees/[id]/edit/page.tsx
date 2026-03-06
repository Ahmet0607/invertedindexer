"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { EmployeeForm } from "@/components/employees/employee-form"
import { useData } from "@/lib/store/data-context"

interface EditEmployeePageProps {
  params: Promise<{ id: string }>
}

export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = use(params)
  const { getEmployeeById } = useData()

  const employee = getEmployeeById(id)

  if (!employee) {
    notFound()
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Employees", href: "/employees" },
          { label: employee.name, href: `/employees/${employee.id}` },
          { label: "Edit" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Employee
          </h1>
          <p className="text-muted-foreground">
            Update employee information
          </p>
        </div>

        <EmployeeForm employee={employee} mode="edit" />
      </div>
    </>
  )
}
