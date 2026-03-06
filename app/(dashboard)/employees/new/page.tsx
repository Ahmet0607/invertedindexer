import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { EmployeeForm } from "@/components/employees/employee-form"

export default async function NewEmployeePage() {
  const supabase = await createClient()
  const { data: departments } = await supabase.from("departments").select("id, name")

  return (
    <>
      <Header title="Add Employee" description="Add a new team member" />
      <div className="flex-1 p-6">
        <EmployeeForm departments={departments || []} />
      </div>
    </>
  )
}
