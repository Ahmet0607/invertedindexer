import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { EquipmentForm } from "@/components/equipment/equipment-form"
import { notFound } from "next/navigation"

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: equipment } = await supabase
    .from("equipment")
    .select("*")
    .eq("id", id)
    .single()

  if (!equipment) {
    notFound()
  }

  const { data: categories } = await supabase.from("categories").select("id, name")
  const { data: departments } = await supabase.from("departments").select("id, name")

  return (
    <>
      <Header title="Edit Equipment" description="Update equipment details" />
      <div className="flex-1 p-6">
        <EquipmentForm 
          equipment={equipment}
          categories={categories || []} 
          departments={departments || []} 
        />
      </div>
    </>
  )
}
