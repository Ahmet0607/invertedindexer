import { Suspense } from "react"
import { Header } from "@/components/header"
import { AssignmentForm } from "@/components/assignments/assignment-form"

export default function NewAssignmentPage() {
  return (
    <>
      <Header title="New Assignment" description="Assign equipment to an employee" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <AssignmentForm />
        </Suspense>
      </div>
    </>
  )
}
