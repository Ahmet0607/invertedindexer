"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useData } from "@/lib/store/data-context"
import type { Employee } from "@/lib/store/types"

interface EmployeeFormProps {
  employee?: Employee
  mode: "create" | "edit"
}

export function EmployeeForm({ employee, mode }: EmployeeFormProps) {
  const router = useRouter()
  const { departments, addEmployee, updateEmployee } = useData()

  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    position: employee?.position || "",
    departmentId: employee?.departmentId || "",
    status: employee?.status || "active",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }
    if (!formData.position.trim()) {
      newErrors.position = "Position is required"
    }
    if (!formData.departmentId) {
      newErrors.departmentId = "Department is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    if (mode === "create") {
      const newEmployee = addEmployee({
        name: formData.name,
        email: formData.email,
        position: formData.position,
        departmentId: formData.departmentId,
        status: formData.status as "active" | "inactive",
      })
      router.push(`/employees/${newEmployee.id}`)
    } else if (employee) {
      updateEmployee(employee.id, {
        name: formData.name,
        email: formData.email,
        position: formData.position,
        departmentId: formData.departmentId,
        status: formData.status as "active" | "inactive",
      })
      router.push(`/employees/${employee.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="john@company.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, position: e.target.value }))
            }
            placeholder="Software Engineer"
          />
          {errors.position && (
            <p className="text-sm text-destructive">{errors.position}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.departmentId}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, departmentId: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.departmentId && (
            <p className="text-sm text-destructive">{errors.departmentId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit">
          {mode === "create" ? "Add Employee" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
