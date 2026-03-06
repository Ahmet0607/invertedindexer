import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { AssignmentsTable } from "@/components/assignments/assignments-table"

export default async function AssignmentsPage() {
  const supabase = await createClient()
  
  const { data: assignments } = await supabase
    .from("assignment_history")
    .select(`
      *,
      equipment:equipment(id, name, serial_number),
      employee:employees(id, name)
    `)
    .order("assigned_date", { ascending: false })

  return (
    <>
      <Header title="Assignments" description="Track equipment assignments" />
      <div className="flex-1 space-y-4 p-6">
        <p className="text-sm text-muted-foreground">
          {assignments?.length || 0} assignment records
        </p>
        <AssignmentsTable assignments={assignments || []} />
      </div>
    </>
  )
}
