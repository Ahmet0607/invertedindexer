"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/lib/store/data-context"

export default function DepartmentsPage() {
  const { departments, employees, getEquipmentByDepartment } = useData()

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Departments" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">
              {departments.length} departments in your organization
            </p>
          </div>
          <Button asChild>
            <Link href="/departments/new">
              <Plus className="mr-2 size-4" />
              Add Department
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {departments.map((department) => {
            const deptEmployees = employees.filter(
              (e) => e.departmentId === department.id
            )
            const deptEquipment = getEquipmentByDepartment(department.id)
            const activeEmployees = deptEmployees.filter(
              (e) => e.status === "active"
            )

            return (
              <Link key={department.id} href={`/departments/${department.id}`}>
                <Card className="transition-colors hover:bg-muted/50 cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                    {department.description && (
                      <p className="text-sm text-muted-foreground">
                        {department.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">
                          {activeEmployees.length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Active Employees
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{deptEquipment.length}</p>
                        <p className="text-xs text-muted-foreground">
                          Total Equipment
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {
                            deptEquipment.filter((e) => e.status === "assigned")
                              .length
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Assigned
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
