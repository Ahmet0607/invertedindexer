import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { EquipmentForm } from "@/components/equipment/equipment-form"

export default async function NewEquipmentPage() {
  const supabase = await createClient()
  
  const { data: categories } = await supabase.from("categories").select("id, name")
  const { data: departments } = await supabase.from("departments").select("id, name")

  return (
    <>
      <Header title="Add Equipment" description="Add a new item to your inventory" />
      <div className="flex-1 p-6">
        <EquipmentForm 
          categories={categories || []} 
          departments={departments || []} 
        />
      </div>
    </>
  )
}
