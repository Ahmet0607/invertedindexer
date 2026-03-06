"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/lib/store/data-context"

export default function EmployeesPage() {
  const { employees, getDepartmentById, getEquipmentByEmployee } = useData()

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Employees" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">
              {employees.length} employees registered
            </p>
          </div>
          <Button asChild>
            <Link href="/employees/new">
              <Plus className="mr-2 size-4" />
              Add Employee
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Equipment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const department = getDepartmentById(employee.departmentId)
                const assignedEquipment = getEquipmentByEmployee(employee.id)

                return (
                  <TableRow key={employee.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/employees/${employee.id}`}
                        className="font-medium hover:underline"
                      >
                        {employee.name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {employee.position}
                    </TableCell>
                    <TableCell>
                      {department ? (
                        <Link
                          href={`/departments/${department.id}`}
                          className="hover:underline"
                        >
                          {department.name}
                        </Link>
                      ) : (
                        "Unknown"
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {employee.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          employee.status === "active" ? "default" : "secondary"
                        }
                        className={
                          employee.status === "active"
                            ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25"
                            : ""
                        }
                      >
                        {employee.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">
                        {assignedEquipment.length}
                      </span>
                      <span className="text-muted-foreground ml-1">items</span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
