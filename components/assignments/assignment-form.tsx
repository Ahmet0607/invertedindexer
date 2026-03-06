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
  FormDescription,
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
import { useData } from "@/lib/store/data-context"

const assignmentSchema = z.object({
  equipmentId: z.string().min(1, "Please select equipment"),
  employeeId: z.string().min(1, "Please select an employee"),
  condition: z.string().min(1, "Please specify the condition"),
  notes: z.string().optional(),
})

type AssignmentFormValues = z.infer<typeof assignmentSchema>

export function AssignmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedEquipmentId = searchParams.get("equipmentId")

  const { equipment, employees, departments, assignEquipment, getDepartmentById } =
    useData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Only show available equipment
  const availableEquipment = equipment.filter((e) => e.status === "available")

  // Only show active employees
  const activeEmployees = employees.filter((e) => e.status === "active")

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      equipmentId: preselectedEquipmentId || "",
      employeeId: "",
      condition: "Good",
      notes: "",
    },
  })

  const onSubmit = async (data: AssignmentFormValues) => {
    setIsSubmitting(true)
    try {
      assignEquipment(
        data.equipmentId,
        data.employeeId,
        data.condition,
        data.notes
      )
      router.push("/assignments")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedEquipment = availableEquipment.find(
    (e) => e.id === form.watch("equipmentId")
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Equipment</CardTitle>
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
                        <SelectValue placeholder="Select equipment to assign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableEquipment.length === 0 ? (
                        <SelectItem value="" disabled>
                          No available equipment
                        </SelectItem>
                      ) : (
                        availableEquipment.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - {item.brand} ({item.serialNumber})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Only available equipment is shown
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedEquipment && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm font-medium">{selectedEquipment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedEquipment.brand} - {selectedEquipment.serialNumber}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assign To</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeEmployees.map((emp) => {
                        const dept = getDepartmentById(emp.departmentId)
                        return (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {dept?.name || "Unknown Dept"}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Only active employees are shown
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition When Assigned</FormLabel>
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
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
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
                      placeholder="Any additional notes about this assignment..."
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
            disabled={isSubmitting || availableEquipment.length === 0}
          >
            {isSubmitting ? "Assigning..." : "Assign Equipment"}
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
