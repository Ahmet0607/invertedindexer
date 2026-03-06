"use client"

import { use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Edit, Users, Package, CheckCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/equipment/status-badge"
import { useData } from "@/lib/store/data-context"

interface DepartmentDetailPageProps {
  params: Promise<{ id: string }>
}

export default function DepartmentDetailPage({
  params,
}: DepartmentDetailPageProps) {
  const { id } = use(params)
  const { getDepartmentById, employees, getEquipmentByDepartment } = useData()

  const department = getDepartmentById(id)

  if (!department) {
    notFound()
  }

  const departmentEmployees = employees.filter(
    (e) => e.departmentId === department.id
  )
  const activeEmployees = departmentEmployees.filter((e) => e.status === "active")
  const departmentEquipment = getEquipmentByDepartment(department.id)
  const assignedEquipment = departmentEquipment.filter(
    (e) => e.status === "assigned"
  )

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Departments", href: "/departments" },
          { label: department.name },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {department.name}
            </h1>
            {department.description && (
              <p className="text-muted-foreground">{department.description}</p>
            )}
          </div>
          <Button asChild>
            <Link href={`/departments/${department.id}/edit`}>
              <Edit className="mr-2 size-4" />
              Edit Department
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Employees
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{activeEmployees.length}</span>
              <span className="text-sm text-muted-foreground ml-1">
                of {departmentEmployees.length} total
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Equipment
              </CardTitle>
              <Package className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {departmentEquipment.length}
              </span>
              <span className="text-sm text-muted-foreground ml-1">items</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Currently Assigned
              </CardTitle>
              <CheckCircle className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{assignedEquipment.length}</span>
              <span className="text-sm text-muted-foreground ml-1">items</span>
            </CardContent>
          </Card>
        </div>

        {/* Employees */}
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {departmentEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No employees in this department
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <Link
                          href={`/employees/${employee.id}`}
                          className="hover:underline font-medium"
                        >
                          {employee.name}
                        </Link>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            employee.status === "active" ? "default" : "secondary"
                          }
                          className={
                            employee.status === "active"
                              ? "bg-emerald-500/15 text-emerald-500"
                              : ""
                          }
                        >
                          {employee.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            {departmentEquipment.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No equipment assigned to this department
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentEquipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link
                          href={`/equipment/${item.id}`}
                          className="hover:underline"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {item.brand}
                            </span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.serialNumber}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
