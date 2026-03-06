import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { EquipmentTable } from "@/components/equipment/equipment-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function EquipmentPage() {
  const supabase = await createClient()
  
  const { data: equipment } = await supabase
    .from("equipment")
    .select(`
      *,
      category:categories(id, name, color),
      department:departments(id, name),
      employee:employees(id, name)
    `)
    .order("created_at", { ascending: false })

  const { data: categories } = await supabase.from("categories").select("*")
  const { data: departments } = await supabase.from("departments").select("*")

  return (
    <>
      <Header title="Equipment" description="Manage your equipment inventory" />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {equipment?.length || 0} total items
            </p>
          </div>
          <Button asChild>
            <Link href="/equipment/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Link>
          </Button>
        </div>
        <EquipmentTable 
          equipment={equipment || []} 
          categories={categories || []}
          departments={departments || []}
        />
      </div>
    </>
  )
}
