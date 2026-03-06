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

interface AssignedEquipment {
  id: string
  name: string
  brand: string
  serial_number: string
  employee: { id: string; name: string } | null
}

export function ReturnForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [equipment, setEquipment] = useState<AssignedEquipment[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState("")
  const [newStatus, setNewStatus] = useState("available")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    async function fetchAssignedEquipment() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("equipment")
        .select("id, name, brand, serial_number, employee:assigned_to(id, name)")
        .eq("user_id", user.id)
        .eq("status", "assigned")

      setEquipment(data || [])
    }
    fetchAssignedEquipment()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEquipment) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Update equipment status and clear assigned_to
      await supabase
        .from("equipment")
        .update({
          status: newStatus,
          assigned_to: null,
        })
        .eq("id", selectedEquipment)

      // Update assignment history with return date
      await supabase
        .from("assignment_history")
        .update({
          returned_date: new Date().toISOString(),
          notes: notes || undefined,
        })
        .eq("equipment_id", selectedEquipment)
        .is("returned_date", null)

      router.push("/assignments")
      router.refresh()
    } catch (error) {
      console.error("Error processing return:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectedItem = equipment.find((e) => e.id === selectedEquipment)

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Return Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment to Return</Label>
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {equipment.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - {item.brand} (Assigned to: {item.employee?.name || "Unknown"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {equipment.length === 0 && (
              <p className="text-sm text-muted-foreground">No assigned equipment to return</p>
            )}
          </div>

          {selectedItem && (
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm">
                <strong>Currently assigned to:</strong> {selectedItem.employee?.name || "Unknown"}
              </p>
              <p className="text-sm">
                <strong>Serial Number:</strong> {selectedItem.serial_number}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Equipment Condition</Label>
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
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the return condition..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !selectedEquipment}>
              {loading ? "Processing..." : "Process Return"}
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
