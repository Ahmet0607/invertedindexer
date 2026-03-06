import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DepartmentsTable } from "@/components/departments/departments-table"
import { DepartmentDialog } from "@/components/departments/department-dialog"

export default async function DepartmentsPage() {
  const supabase = await createClient()
  
  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <>
      <Header title="Departments" description="Manage your company departments" />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {departments?.length || 0} departments
          </p>
          <DepartmentDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DepartmentDialog>
        </div>
        <DepartmentsTable departments={departments || []} />
      </div>
    </>
  )
}
