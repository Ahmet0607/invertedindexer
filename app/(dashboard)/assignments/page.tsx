"use client"

import Link from "next/link"
import { format, parseISO } from "date-fns"
import { Plus, RotateCcw } from "lucide-react"
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

export default function AssignmentsPage() {
  const { equipment, assignmentHistory, getEmployeeById, getDepartmentById } = useData()

  // Get all currently assigned equipment with their assignment dates
  const assignedEquipment = equipment.filter((e) => e.status === "assigned").map((item) => {
    // Find the active assignment record for this equipment
    const activeAssignment = assignmentHistory.find(
      (h) => h.equipmentId === item.id && !h.returnedDate
    )
    return { ...item, assignedDate: activeAssignment?.assignedDate }
  })

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assignments" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Current Assignments
            </h1>
            <p className="text-muted-foreground">
              {assignedEquipment.length} items currently assigned
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/assignments/new">
                <Plus className="mr-2 size-4" />
                New Assignment
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/assignments/return">
                <RotateCcw className="mr-2 size-4" />
                Return Equipment
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="hidden lg:table-cell">Assigned Date</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden sm:table-cell">Serial Number</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedEquipment.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No equipment currently assigned
                  </TableCell>
                </TableRow>
              ) : (
                assignedEquipment.map((item) => {
                  const employee = item.assignedEmployeeId
                    ? getEmployeeById(item.assignedEmployeeId)
                    : null
                  const department = employee?.departmentId
                    ? getDepartmentById(employee.departmentId)
                    : null

                  return (
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
                      <TableCell>
                        {employee ? (
                          <Link
                            href={`/employees/${employee.id}`}
                            className="hover:underline"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm">{employee.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {employee.position}
                              </span>
                            </div>
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Unknown
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {item.assignedDate
                          ? format(parseISO(item.assignedDate), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {department ? (
                          <Link
                            href={`/departments/${department.id}`}
                            className="hover:underline"
                          >
                            {department.name}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell font-mono text-sm">
                        {item.serialNumber}
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/assignments/return?equipmentId=${item.id}`}
                          >
                            Return
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
