import { Suspense } from "react"
import { Header } from "@/components/header"
import { ReturnForm } from "@/components/assignments/return-form"

export default function ReturnEquipmentPage() {
  return (
    <>
      <Header title="Return Equipment" description="Process equipment return from an employee" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <ReturnForm />
        </Suspense>
      </div>
    </>
  )
}
