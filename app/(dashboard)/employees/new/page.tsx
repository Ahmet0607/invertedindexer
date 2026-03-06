"use client"

import { Header } from "@/components/header"
import { EmployeeForm } from "@/components/employees/employee-form"

export default function NewEmployeePage() {
  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Employees", href: "/employees" },
          { label: "New Employee" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Add New Employee
          </h1>
          <p className="text-muted-foreground">
            Add a new employee to your organization
          </p>
        </div>

        <EmployeeForm mode="create" />
      </div>
    </>
  )
}
