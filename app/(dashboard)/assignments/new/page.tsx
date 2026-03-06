import { Suspense } from "react"
import { Header } from "@/components/header"
import { AssignmentForm } from "@/components/assignments/assignment-form"

export default function NewAssignmentPage() {
  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assignments", href: "/assignments" },
          { label: "New Assignment" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Assignment
          </h1>
          <p className="text-muted-foreground">
            Assign equipment to an employee
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <AssignmentForm />
        </Suspense>
      </div>
    </>
  )
}
