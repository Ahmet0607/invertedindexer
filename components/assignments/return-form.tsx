"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/lib/store/data-context"

const returnSchema = z.object({
  equipmentId: z.string().min(1, "Please select equipment"),
  condition: z.string().min(1, "Please specify the condition"),
  notes: z.string().optional(),
})

type ReturnFormValues = z.infer<typeof returnSchema>

export function ReturnForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedEquipmentId = searchParams.get("equipmentId")

  const {
    equipment,
    returnEquipment,
    getEmployeeById,
    getDepartmentById,
  } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Only show assigned equipment
  const assignedEquipment = equipment.filter((e) => e.status === "assigned")

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      equipmentId: preselectedEquipmentId || "",
      condition: "Good",
      notes: "",
    },
  })

  const onSubmit = async (data: ReturnFormValues) => {
    setIsSubmitting(true)
    try {
      returnEquipment(data.equipmentId, data.condition, data.notes)
      router.push("/assignments")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedEquipment = assignedEquipment.find(
    (e) => e.id === form.watch("equipmentId")
  )
  const assignedEmployee = selectedEquipment?.assignedEmployeeId
    ? getEmployeeById(selectedEquipment.assignedEmployeeId)
    : null
  const department = assignedEmployee?.departmentId
    ? getDepartmentById(assignedEmployee.departmentId)
    : null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Equipment to Return</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="equipmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment to return" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assignedEquipment.length === 0 ? (
                        <SelectItem value="" disabled>
                          No assigned equipment
                        </SelectItem>
                      ) : (
                        assignedEquipment.map((item) => {
                          const emp = item.assignedEmployeeId
                            ? getEmployeeById(item.assignedEmployeeId)
                            : null
                          return (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} - {emp?.name || "Unknown"}
                            </SelectItem>
                          )
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedEquipment && assignedEmployee && (
              <div className="rounded-lg border p-4 bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{selectedEquipment.name}</p>
                  <Badge variant="secondary">Assigned</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedEquipment.brand} - {selectedEquipment.serialNumber}
                </p>
                <div className="pt-2 border-t mt-2">
                  <p className="text-xs text-muted-foreground">
                    Currently assigned to
                  </p>
                  <p className="text-sm font-medium">{assignedEmployee.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {assignedEmployee.position} - {department?.name}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Return Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition When Returned</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                      <SelectItem value="Needs Maintenance">
                        Needs Maintenance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any issues or notes about the returned equipment..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || assignedEquipment.length === 0}
          >
            {isSubmitting ? "Processing..." : "Return Equipment"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
