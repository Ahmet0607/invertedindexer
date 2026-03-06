"use client"

import { format, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/lib/store/data-context"

interface AssignmentHistoryProps {
  equipmentId: string
}

export function AssignmentHistory({ equipmentId }: AssignmentHistoryProps) {
  const { getAssignmentHistoryByEquipment } = useData()
  const history = getAssignmentHistoryByEquipment(equipmentId)

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assignment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No assignment history for this equipment
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Assignment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {history.map((entry, index) => (
            <div key={entry.id} className="relative pb-6 last:pb-0">
              {/* Timeline line */}
              {index < history.length - 1 && (
                <div className="absolute left-[7px] top-4 h-full w-px bg-border" />
              )}

              {/* Timeline dot */}
              <div className="absolute left-0 top-1.5 size-3.5 rounded-full border-2 border-background bg-primary" />

              <div className="ml-6 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-sm">
                    {entry.employeeName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.departmentName}
                  </span>
                  <Badge
                    variant={entry.returnedDate ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {entry.returnedDate ? "Returned" : "Active"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Assigned:{" "}
                    {format(parseISO(entry.assignedDate), "MMM d, yyyy")}
                  </span>
                  {entry.returnedDate && (
                    <span>
                      Returned:{" "}
                      {format(parseISO(entry.returnedDate), "MMM d, yyyy")}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span className="text-muted-foreground">
                    Condition when assigned:{" "}
                    <span className="text-foreground">
                      {entry.conditionWhenAssigned}
                    </span>
                  </span>
                  {entry.conditionWhenReturned && (
                    <span className="text-muted-foreground">
                      Condition when returned:{" "}
                      <span className="text-foreground">
                        {entry.conditionWhenReturned}
                      </span>
                    </span>
                  )}
                </div>

                {entry.notes && (
                  <p className="text-xs text-muted-foreground italic">
                    {entry.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
