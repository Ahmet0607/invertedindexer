"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react"
import { logActivity } from "@/lib/activity-log"

interface Props {
  categories: { id: string; name: string }[]
  departments: { id: string; name: string }[]
  equipment?: {
    id: string
    name: string
    brand: string
    serial_number: string
    category_id: string | null
    department_id: string | null
    status: string
    purchase_date: string
    purchase_price: number
    warranty_expiry: string | null
    photo_url: string | null
    notes: string | null
  }
}

export function EquipmentForm({ categories, departments, equipment }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(equipment?.photo_url || null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    setPhotoFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const uploadPhoto = async (file: File, userId: string): Promise<string | null> => {
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from("equipment-photos")
      .upload(fileName, file)
    
    if (error) {
      console.error("Upload error:", error)
      return null
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from("equipment-photos")
      .getPublicUrl(fileName)
    
    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("You must be logged in")
      setLoading(false)
      return
    }

    // Check equipment limit for new equipment only
    if (!equipment) {
      // Get user's subscription
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan, equipment_limit")
        .eq("user_id", user.id)
        .single()
      
      // Default to basic plan limits if no subscription found
      const equipmentLimit = subscription?.equipment_limit ?? 5
      const plan = subscription?.plan ?? "basic"
      
      // Count current equipment
      const { count } = await supabase
        .from("equipment")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
      
      const currentCount = count ?? 0
      
      // Check if limit reached (advanced plan has unlimited = -1 or very high number)
      if (equipmentLimit !== -1 && currentCount >= equipmentLimit) {
        const planNames: Record<string, string> = {
          basic: "Basic (5 items)",
          pro: "Pro (50 items)",
          advanced: "Advanced (unlimited)"
        }
        setError(`You have reached your equipment limit (${currentCount}/${equipmentLimit}). Please upgrade to ${plan === "basic" ? "Pro" : "Advanced"} plan to add more equipment.`)
        setLoading(false)
        return
      }
    }

    let photoUrl = equipment?.photo_url || null
    
    // Upload new photo if selected
    if (photoFile) {
      const uploadedUrl = await uploadPhoto(photoFile, user.id)
      if (uploadedUrl) {
        photoUrl = uploadedUrl
      }
    } else if (!photoPreview && equipment?.photo_url) {
      // Photo was removed
      photoUrl = null
    }

    const warrantyExpiry = formData.get("warranty_expiry") as string
    
    const serialNumber = formData.get("serial_number") as string

    // Check if serial number already exists (for new equipment or if changed during edit)
    if (!equipment || equipment.serial_number !== serialNumber) {
      const { data: existingEquipment } = await supabase
        .from("equipment")
        .select("id")
        .eq("serial_number", serialNumber)
        .eq("user_id", user.id)
        .single()
      
      if (existingEquipment) {
        setError("This serial number is already added. Please use a unique serial number.")
        setLoading(false)
        return
      }
    }

    const returnDate = formData.get("return_date") as string
    const currentStatus = formData.get("status") as string
    
    // If return date is set, automatically set status to available and clear assignment
    const finalStatus = returnDate ? "available" : currentStatus

    const data: Record<string, unknown> = {
      name: formData.get("name") as string,
      brand: formData.get("brand") as string,
      serial_number: serialNumber,
      category_id: formData.get("category_id") || null,
      department_id: formData.get("department_id") || null,
      status: finalStatus,
      purchase_date: formData.get("purchase_date") as string,
      purchase_price: parseFloat(formData.get("purchase_price") as string),
      warranty_expiry: warrantyExpiry || null,
      photo_url: photoUrl,
      notes: formData.get("notes") || null,
      user_id: user.id,
    }
    
    // Clear assignment if returning
    if (returnDate) {
      data.assigned_to = null
    }
    
    // If equipment is being returned, update the assignment history
    if (returnDate && equipment) {
      await supabase
        .from("assignment_history")
        .update({ returned_date: returnDate })
        .eq("equipment_id", equipment.id)
        .is("returned_date", null)
    }

    let result
    if (equipment) {
      result = await supabase
        .from("equipment")
        .update(data)
        .eq("id", equipment.id)
    } else {
      result = await supabase.from("equipment").insert(data)
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    // Log activity
    await logActivity(
      equipment ? "updated" : "added",
      "equipment",
      data.name,
      equipment?.id
    )

    router.push("/equipment")
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{equipment ? "Edit Equipment" : "Add New Equipment"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Photo Upload Section */}
          <div className="space-y-3">
            <Label>Equipment Photo</Label>
            <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-6">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Equipment preview"
                    className="h-48 w-48 rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-8 w-8"
                    onClick={removePhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-muted">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <div className="flex gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload from Device
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={equipment?.name}
                placeholder="MacBook Pro 14"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                name="brand"
                required
                defaultValue={equipment?.brand}
                placeholder="Apple"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number *</Label>
              <Input
                id="serial_number"
                name="serial_number"
                required
                defaultValue={equipment?.serial_number}
                placeholder="ABC123XYZ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue={equipment?.status || "available"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select name="category_id" defaultValue={equipment?.category_id || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department_id">Department</Label>
              <Select name="department_id" defaultValue={equipment?.department_id || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date *</Label>
              <Input
                id="purchase_date"
                name="purchase_date"
                type="date"
                required
                defaultValue={equipment?.purchase_date}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price *</Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="0.01"
                required
                defaultValue={equipment?.purchase_price}
                placeholder="1999.99"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="warranty_expiry">Warranty Expiry Date</Label>
              <Input
                id="warranty_expiry"
                name="warranty_expiry"
                type="date"
                defaultValue={equipment?.warranty_expiry || ""}
              />
              <p className="text-xs text-muted-foreground">
                You will be notified 1 month before warranty expires
              </p>
            </div>
            {equipment?.status === "assigned" && (
              <div className="space-y-2">
                <Label htmlFor="return_date">Return Date</Label>
                <Input
                  id="return_date"
                  name="return_date"
                  type="date"
                />
                <p className="text-xs text-muted-foreground">
                  Set a return date to mark equipment as returned and available
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={equipment?.notes || ""}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : equipment ? "Update Equipment" : "Add Equipment"}
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
