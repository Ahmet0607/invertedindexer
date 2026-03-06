"use client"

import { Header } from "@/components/header"
import { DepartmentForm } from "@/components/departments/department-form"

export default function NewDepartmentPage() {
  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Departments", href: "/departments" },
          { label: "New Department" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Department
          </h1>
          <p className="text-muted-foreground">
            Add a new department to your organization
          </p>
        </div>

        <DepartmentForm mode="create" />
      </div>
    </>
  )
}
