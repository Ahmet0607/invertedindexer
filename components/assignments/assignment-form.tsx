"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { logActivity } from "@/lib/activity-log"

interface Equipment {
  id: string
  name: string
  brand: string
  serial_number: string
}

interface Employee {
  id: string
  name: string
  email: string
}

export function AssignmentForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [equipmentRes, employeesRes] = await Promise.all([
        supabase
          .from("equipment")
          .select("id, name, brand, serial_number")
          .eq("user_id", user.id)
          .eq("status", "available"),
        supabase
          .from("employees")
          .select("id, name, email")
          .eq("user_id", user.id)
          .eq("status", "active"),
      ])

      setEquipment(equipmentRes.data || [])
      setEmployees(employeesRes.data || [])
    }
    fetchData()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEquipment || !selectedEmployee) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Update equipment status and assigned_to
      await supabase
        .from("equipment")
        .update({
          status: "assigned",
          assigned_to: selectedEmployee,
        })
        .eq("id", selectedEquipment)

      // Create assignment history record
      await supabase.from("assignment_history").insert({
        equipment_id: selectedEquipment,
        employee_id: selectedEmployee,
        notes,
        user_id: user.id,
      })

      // Log activity
      const equipmentItem = equipment.find(e => e.id === selectedEquipment)
      const employeeItem = employees.find(e => e.id === selectedEmployee)
      await logActivity(
        "assigned",
        "assignment",
        `${equipmentItem?.name} to ${employeeItem?.name}`,
        selectedEquipment
      )

      router.push("/assignments")
      router.refresh()
    } catch (error) {
      console.error("Error creating assignment:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Assignment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment</Label>
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {equipment.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - {item.brand} ({item.serial_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {equipment.length === 0 && (
              <p className="text-sm text-muted-foreground">No available equipment</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee">Assign To</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {employees.length === 0 && (
              <p className="text-sm text-muted-foreground">No active employees</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this assignment..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !selectedEquipment || !selectedEmployee}>
              {loading ? "Creating..." : "Create Assignment"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
