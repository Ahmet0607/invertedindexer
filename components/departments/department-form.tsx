"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useData } from "@/lib/store/data-context"
import type { Department } from "@/lib/store/types"

interface DepartmentFormProps {
  department?: Department
  mode: "create" | "edit"
}

export function DepartmentForm({ department, mode }: DepartmentFormProps) {
  const router = useRouter()
  const { addDepartment, updateDepartment } = useData()

  const [formData, setFormData] = useState({
    name: department?.name || "",
    description: department?.description || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Department name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    if (mode === "create") {
      const newDepartment = addDepartment({
        name: formData.name,
        description: formData.description || undefined,
      })
      router.push(`/departments/${newDepartment.id}`)
    } else if (department) {
      updateDepartment(department.id, {
        name: formData.name,
        description: formData.description || undefined,
      })
      router.push(`/departments/${department.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Department Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Engineering"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Brief description of the department"
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit">
          {mode === "create" ? "Create Department" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
