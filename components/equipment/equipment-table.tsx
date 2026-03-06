"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, MoreHorizontal, Eye, Pencil, Trash2, Download, FileSpreadsheet, FileText } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StatusBadge } from "./status-badge"
import { useData } from "@/lib/store/data-context"
import type { Equipment, EquipmentStatus } from "@/lib/store/types"
import { parseISO, format } from "date-fns"
import { exportToCSV, exportToPDF, formatCurrency, formatDate } from "@/lib/export"

// Helper function to safely format dates without timezone issues
function formatPurchaseDate(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, "MMM d, yyyy")
  } catch {
    return dateString
  }
}

export function EquipmentTable() {
  const {
    equipment,
    departments,
    employees,
    deleteEquipment,
    getEmployeeById,
    getDepartmentById,
  } = useData()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | "all">("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const searchLower = search.toLowerCase()
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(searchLower) ||
        item.brand.toLowerCase().includes(searchLower) ||
        item.serialNumber.toLowerCase().includes(searchLower)

      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      const matchesDepartment = departmentFilter === "all" || item.departmentId === departmentFilter

      return matchesSearch && matchesStatus && matchesDepartment
    })
  }, [equipment, search, statusFilter, departmentFilter])

  const handleDelete = () => {
    if (deleteId) {
      deleteEquipment(deleteId)
      setDeleteId(null)
    }
  }

  const exportColumns = [
    { key: "name" as const, header: "Name" },
    { key: "brand" as const, header: "Brand" },
    { key: "serialNumber" as const, header: "Serial Number" },
    { key: "status" as const, header: "Status" },
    { key: "department" as const, header: "Department" },
    { key: "assignedTo" as const, header: "Assigned To" },
    { key: "purchaseDate" as const, header: "Purchase Date" },
    { key: "purchasePrice" as const, header: "Purchase Price" },
  ]

  const getExportData = () => {
    return filteredEquipment.map((item) => ({
      name: item.name,
      brand: item.brand,
      serialNumber: item.serialNumber,
      status: item.status,
      department: getDepartment(item)?.name || "",
      assignedTo: getAssignedEmployee(item)?.name || "",
      purchaseDate: formatDate(item.purchaseDate),
      purchasePrice: formatCurrency(item.purchasePrice),
    }))
  }

  const handleExportCSV = () => {
    exportToCSV(getExportData(), "equipment-list", exportColumns)
  }

  const handleExportPDF = () => {
    exportToPDF(getExportData(), "equipment-list", "Equipment List", exportColumns)
  }

  const getAssignedEmployee = (item: Equipment) => {
    if (!item.assignedEmployeeId) return null
    return getEmployeeById(item.assignedEmployeeId)
  }

  const getDepartment = (item: Equipment) => {
    if (!item.departmentId) return null
    return getDepartmentById(item.departmentId)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, brand, or serial number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as EquipmentStatus | "all")}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="damaged">Damaged</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-2 size-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCSV}>
              <FileSpreadsheet className="mr-2 size-4" />
              Export to CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF}>
              <FileText className="mr-2 size-4" />
              Export to PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead className="hidden md:table-cell">Serial</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
              <TableHead className="hidden sm:table-cell">Department</TableHead>
              <TableHead className="hidden lg:table-cell">Purchase Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipment.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No equipment found
                </TableCell>
              </TableRow>
            ) : (
              filteredEquipment.map((item) => {
                const employee = getAssignedEmployee(item)
                const department = getDepartment(item)
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs text-muted-foreground">{item.brand}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm">
                      {item.serialNumber}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {employee ? (
                        <span className="text-sm">{employee.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {department ? (
                        <span className="text-sm">{department.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatPurchaseDate(item.purchaseDate)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/equipment/${item.id}`}>
                              <Eye className="mr-2 size-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/equipment/${item.id}/edit`}>
                              <Pencil className="mr-2 size-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(item.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this equipment? This action cannot be undone and will also remove all assignment history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
