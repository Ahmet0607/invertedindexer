import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { EmployeesTable } from "@/components/employees/employees-table"

export default async function EmployeesPage() {
  const supabase = await createClient()
  
  const { data: employees } = await supabase
    .from("employees")
    .select(`
      *,
      department:departments(id, name)
    `)
    .order("created_at", { ascending: false })

  const { data: departments } = await supabase.from("departments").select("*")

  return (
    <>
      <Header title="Employees" description="Manage your team members" />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {employees?.length || 0} employees
          </p>
          <Button asChild>
            <Link href="/employees/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        </div>
        <EmployeesTable employees={employees || []} departments={departments || []} />
      </div>
    </>
  )
}
