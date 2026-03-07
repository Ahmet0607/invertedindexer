"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, isPast, isToday } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { logActivity } from "@/lib/activity-log"

interface Assignment {
  id: string
  assigned_date: string
  returned_date: string | null
  expected_return_date: string | null
  notes: string | null
  equipment: { id: string; name: string; serial_number: string } | null
  employee: { id: string; name: string } | null
}

interface Props {
  assignments: Assignment[]
}

export function AssignmentsTable({ assignments }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [newStatus, setNewStatus] = useState("available")
  const [returnNotes, setReturnNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const handleReturnClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setNewStatus("available")
    setReturnNotes("")
    setReturnDialogOpen(true)
  }

  const handleReturn = async () => {
    if (!selectedAssignment) return
    setLoading(true)

    try {
      // Update equipment status
      await supabase
        .from("equipment")
        .update({
          status: newStatus,
          assigned_to: null,
        })
        .eq("id", selectedAssignment.equipment?.id)

      // Update assignment history
      await supabase
        .from("assignment_history")
        .update({
          returned_date: new Date().toISOString(),
          notes: returnNotes || selectedAssignment.notes,
        })
        .eq("id", selectedAssignment.id)

      // Log activity
      await logActivity(
        "returned",
        "assignment",
        `${selectedAssignment.equipment?.name} from ${selectedAssignment.employee?.name}`,
        selectedAssignment.equipment?.id
      )

      setReturnDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error processing return:", error)
    } finally {
      setLoading(false)
    }
  }

  const getExpectedReturnBadge = (expectedDate: string | null) => {
    if (!expectedDate) return null
    const date = new Date(expectedDate)
    if (isPast(date) && !isToday(date)) {
      return <Badge variant="destructive" className="ml-2">Overdue</Badge>
    }
    if (isToday(date)) {
      return <Badge variant="secondary" className="ml-2">Due Today</Badge>
    }
    return null
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead>Expected Return</TableHead>
              <TableHead>Returned Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
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
                    {item.expected_return_date ? (
                      <span className="flex items-center">
                        {format(new Date(item.expected_return_date), "MMM d, yyyy")}
                        {!item.returned_date && getExpectedReturnBadge(item.expected_return_date)}
                      </span>
                    ) : "-"}
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
                  <TableCell className="text-right">
                    {!item.returned_date && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReturnClick(item)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Return
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Equipment</DialogTitle>
            <DialogDescription>
              Process the return of {selectedAssignment?.equipment?.name} from {selectedAssignment?.employee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Equipment Condition</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available (Good Condition)</SelectItem>
                  <SelectItem value="maintenance">Needs Maintenance</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Return Notes (Optional)</Label>
              <Textarea
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Add any notes about the return..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturn} disabled={loading}>
              {loading ? "Processing..." : "Confirm Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
