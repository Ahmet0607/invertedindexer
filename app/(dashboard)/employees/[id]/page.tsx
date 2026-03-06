"use client"

import { use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format, parseISO } from "date-fns"
import { Edit, Mail, Building2, Briefcase, Package } from "lucide-react"
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

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { id } = use(params)
  const {
    getEmployeeById,
    getDepartmentById,
    getEquipmentByEmployee,
    getAssignmentHistoryByEmployee,
    getEquipmentById,
  } = useData()

  const employee = getEmployeeById(id)

  if (!employee) {
    notFound()
  }

  const department = getDepartmentById(employee.departmentId)
  const assignedEquipment = getEquipmentByEmployee(employee.id)
  const assignmentHistory = getAssignmentHistoryByEmployee(employee.id)

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Employees", href: "/employees" },
          { label: employee.name },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {employee.name}
              </h1>
              <Badge
                variant={employee.status === "active" ? "default" : "secondary"}
                className={
                  employee.status === "active"
                    ? "bg-emerald-500/15 text-emerald-500"
                    : ""
                }
              >
                {employee.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{employee.position}</p>
          </div>
          <Button asChild>
            <Link href={`/employees/${employee.id}/edit`}>
              <Edit className="mr-2 size-4" />
              Edit Employee
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email</CardTitle>
              <Mail className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <a
                href={`mailto:${employee.email}`}
                className="text-sm hover:underline"
              >
                {employee.email}
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Department</CardTitle>
              <Building2 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {department ? (
                <Link
                  href={`/departments/${department.id}`}
                  className="text-sm hover:underline"
                >
                  {department.name}
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground">Unknown</span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Assigned Equipment
              </CardTitle>
              <Package className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{assignedEquipment.length}</span>
              <span className="text-sm text-muted-foreground ml-1">items</span>
            </CardContent>
          </Card>
        </div>

        {/* Currently Assigned Equipment */}
        {assignedEquipment.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Currently Assigned Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedEquipment.map((item) => (
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
            </CardContent>
          </Card>
        )}

        {/* Assignment History */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment History</CardTitle>
          </CardHeader>
          <CardContent>
            {assignmentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No assignment history
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Returned Date</TableHead>
                    <TableHead>Condition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignmentHistory.map((record) => {
                    const equipment = getEquipmentById(record.equipmentId)
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          {equipment ? (
                            <Link
                              href={`/equipment/${equipment.id}`}
                              className="hover:underline font-medium"
                            >
                              {equipment.name}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">
                              Unknown equipment
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(record.assignedDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {record.returnedDate ? (
                            format(parseISO(record.returnedDate), "MMM d, yyyy")
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {record.conditionWhenAssigned}
                            {record.conditionWhenReturned && (
                              <span className="text-muted-foreground">
                                {" "}
                                → {record.conditionWhenReturned}
                              </span>
                            )}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
