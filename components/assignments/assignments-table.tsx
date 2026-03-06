"use client"

import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Assignment {
  id: string
  assigned_date: string
  returned_date: string | null
  notes: string | null
  equipment: { id: string; name: string; serial_number: string } | null
  employee: { id: string; name: string } | null
}

interface Props {
  assignments: Assignment[]
}

export function AssignmentsTable({ assignments }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment</TableHead>
            <TableHead>Serial Number</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead>Returned Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No assignment history. Assign equipment to employees to track history.
              </TableCell>
            </TableRow>
          ) : (
            assignments.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.equipment?.name || "Unknown"}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {item.equipment?.serial_number || "-"}
                </TableCell>
                <TableCell>{item.employee?.name || "Unknown"}</TableCell>
                <TableCell>
                  {format(new Date(item.assigned_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {item.returned_date 
                    ? format(new Date(item.returned_date), "MMM d, yyyy")
                    : "-"
                  }
                </TableCell>
                <TableCell>
                  <Badge variant={item.returned_date ? "secondary" : "default"}>
                    {item.returned_date ? "Returned" : "Active"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
