"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Tag } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name: string
  description: string
  color: string
  equipmentCount: number
}

// Sample data - will be replaced with Supabase
const initialCategories: Category[] = [
  { id: "1", name: "Laptops", description: "Portable computers and notebooks", color: "#3b82f6", equipmentCount: 12 },
  { id: "2", name: "Monitors", description: "Display screens and monitors", color: "#10b981", equipmentCount: 8 },
  { id: "3", name: "Phones", description: "Mobile phones and devices", color: "#f59e0b", equipmentCount: 15 },
  { id: "4", name: "Furniture", description: "Office furniture and fixtures", color: "#8b5cf6", equipmentCount: 25 },
  { id: "5", name: "Vehicles", description: "Company vehicles and transport", color: "#ef4444", equipmentCount: 5 },
  { id: "6", name: "Tools", description: "Equipment and hand tools", color: "#6366f1", equipmentCount: 30 },
]

const colorOptions = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
  "#6366f1", "#ec4899", "#14b8a6", "#f97316", "#84cc16"
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "", color: "#6366f1" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...formData }
          : cat
      ))
    } else {
      setCategories([...categories, {
        id: Date.now().toString(),
        ...formData,
        equipmentCount: 0
      }])
    }
    setIsDialogOpen(false)
    setEditingCategory(null)
    setFormData({ name: "", description: "", color: "#6366f1" })
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, description: category.description, color: category.color })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id))
  }

  const openNewDialog = () => {
    setEditingCategory(null)
    setFormData({ name: "", description: "", color: "#6366f1" })
    setIsDialogOpen(true)
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Categories" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Equipment Categories</h1>
            <p className="text-muted-foreground">
              Organize your equipment by type
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="mr-2 size-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
                <DialogDescription>
                  {editingCategory ? "Update the category details" : "Create a new equipment category"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Laptops"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this category"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`size-8 rounded-full border-2 transition-all ${
                            formData.color === color ? "border-foreground scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{editingCategory ? "Save Changes" : "Add Category"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: category.color + "20" }}
                    >
                      <Tag className="size-5" style={{ color: category.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {category.equipmentCount} items
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-0"
                    style={{ backgroundColor: category.color + "20", color: category.color }}
                  >
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description || "No description"}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                    <Pencil className="mr-2 size-3" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="mr-2 size-3" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{category.name}&quot;? This will not delete the equipment in this category, but they will become uncategorized.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(category.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
