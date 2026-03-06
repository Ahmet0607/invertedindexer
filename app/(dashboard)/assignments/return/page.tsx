import { Suspense } from "react"
import { Header } from "@/components/header"
import { ReturnForm } from "@/components/assignments/return-form"

export default function ReturnEquipmentPage() {
  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assignments", href: "/assignments" },
          { label: "Return Equipment" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Return Equipment
          </h1>
          <p className="text-muted-foreground">
            Process equipment return from an employee
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <ReturnForm />
        </Suspense>
      </div>
    </>
  )
}
