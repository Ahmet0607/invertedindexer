"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Camera, Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import type { Equipment, EquipmentStatus } from "@/lib/store/types"

const equipmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchasePrice: z.coerce.number().min(0, "Price must be a positive number"),
  warrantyMonths: z.coerce.number().min(0).optional(),
  maintenanceIntervalMonths: z.coerce.number().min(0).optional(),
  departmentId: z.string().optional(),
  status: z.enum([
    "available",
    "assigned",
    "maintenance",
    "damaged",
    "lost",
  ] as const),
  notes: z.string().optional(),
})

type EquipmentFormValues = z.infer<typeof equipmentSchema>

interface EquipmentFormProps {
  equipment?: Equipment
  mode: "create" | "edit"
}

export function EquipmentForm({ equipment, mode }: EquipmentFormProps) {
  const router = useRouter()
  const { departments, addEquipment, updateEquipment } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | undefined>(equipment?.imageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Convert to base64 for local storage
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageUrl(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: equipment?.name || "",
      brand: equipment?.brand || "",
      serialNumber: equipment?.serialNumber || "",
      purchaseDate: equipment?.purchaseDate || "",
      purchasePrice: equipment?.purchasePrice || 0,
      warrantyMonths: equipment?.warrantyMonths || undefined,
      maintenanceIntervalMonths: equipment?.maintenanceIntervalMonths || undefined,
      departmentId: equipment?.departmentId || undefined,
      status: equipment?.status || "available",
      notes: equipment?.notes || "",
    },
  })

  const onSubmit = async (data: EquipmentFormValues) => {
    setIsSubmitting(true)
    try {
      if (mode === "create") {
        addEquipment({
          name: data.name,
          brand: data.brand,
          serialNumber: data.serialNumber,
          purchaseDate: data.purchaseDate,
          purchasePrice: data.purchasePrice,
          warrantyMonths: data.warrantyMonths,
          maintenanceIntervalMonths: data.maintenanceIntervalMonths,
          departmentId: data.departmentId,
          status: data.status,
          notes: data.notes,
          imageUrl: imageUrl,
        })
        router.push("/equipment")
      } else if (equipment) {
        updateEquipment(equipment.id, {
          name: data.name,
          brand: data.brand,
          serialNumber: data.serialNumber,
          purchaseDate: data.purchaseDate,
          purchasePrice: data.purchasePrice,
          warrantyMonths: data.warrantyMonths,
          maintenanceIntervalMonths: data.maintenanceIntervalMonths,
          departmentId: data.departmentId,
          status: data.status,
          notes: data.notes,
          imageUrl: imageUrl,
        })
        router.push(`/equipment/${equipment.id}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipment Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Equipment preview"
                    className="h-48 w-48 rounded-lg object-cover border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 size-8"
                    onClick={removeImage}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-dashed bg-muted/50">
                  <ImageIcon className="size-12 text-muted-foreground" />
                </div>
              )}
              <div className="flex gap-2">
                {/* Hidden file input for gallery upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="file-upload"
                />
                {/* Hidden file input for camera capture - uses native device camera */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="camera-capture"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 size-4" />
                  Upload Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="mr-2 size-4" />
                  Take Photo
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload an image or use your camera to take a photo
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. MacBook Pro 16" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Apple" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. C02XL1Q6JG5L" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Purchase Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="warrantyMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warranty (months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Optional"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maintenanceIntervalMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Interval (months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Optional"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
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
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Status is automatically updated when equipment is assigned
                    or returned
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information about this equipment..."
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Equipment"
                : "Save Changes"}
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
