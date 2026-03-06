"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/lib/store/data-context"
import { formatDistanceToNow, parseISO } from "date-fns"

export function RecentAssignments() {
  const { assignmentHistory, equipment, getEquipmentById } = useData()

  // Get the 5 most recent assignments (sorted by date)
  const recentAssignments = [...assignmentHistory]
    .sort(
      (a, b) =>
        parseISO(b.assignedDate).getTime() - parseISO(a.assignedDate).getTime()
    )
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Assignments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentAssignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assignments yet</p>
        ) : (
          recentAssignments.map((assignment) => {
            const equipmentItem = getEquipmentById(assignment.equipmentId)
            return (
              <div
                key={assignment.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {equipmentItem?.name || "Unknown Equipment"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {assignment.employeeName} - {assignment.departmentName}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={assignment.returnedDate ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {assignment.returnedDate ? "Returned" : "Active"}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(parseISO(assignment.assignedDate), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
