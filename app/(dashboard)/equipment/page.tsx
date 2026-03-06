import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { EquipmentTable } from "@/components/equipment/equipment-table"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default async function EquipmentPage() {
  const supabase = await createClient()
  
  const { data: equipment } = await supabase
    .from("equipment")
    .select(`
      *,
      category:categories(id, name, color),
      department:departments(id, name),
      employee:employees(id, name)
    `)
    .order("created_at", { ascending: false })

  const { data: categories } = await supabase.from("categories").select("*")
  const { data: departments } = await supabase.from("departments").select("*")
  
  // Get subscription info
  const { data: { user } } = await supabase.auth.getUser()
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, equipment_limit")
    .eq("user_id", user?.id)
    .single()
  
  const equipmentLimit = subscription?.equipment_limit ?? 5
  const plan = subscription?.plan ?? "basic"
  const currentCount = equipment?.length ?? 0
  const usagePercent = equipmentLimit === -1 ? 0 : Math.min((currentCount / equipmentLimit) * 100, 100)
  const isAtLimit = equipmentLimit !== -1 && currentCount >= equipmentLimit
  const isNearLimit = equipmentLimit !== -1 && currentCount >= equipmentLimit * 0.8

  return (
    <>
      <Header title="Equipment" description="Manage your equipment inventory" />
      <div className="flex-1 space-y-4 p-6">
        {isAtLimit && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have reached your equipment limit ({currentCount}/{equipmentLimit}). 
              <Link href="/pricing" className="ml-1 underline font-medium">
                Upgrade your plan
              </Link> to add more equipment.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {currentCount} {equipmentLimit === -1 ? "items" : `of ${equipmentLimit} items`}
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted">
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </span>
            </p>
            {equipmentLimit !== -1 && (
              <Progress value={usagePercent} className={`h-2 w-48 ${isNearLimit ? "[&>div]:bg-yellow-500" : ""} ${isAtLimit ? "[&>div]:bg-red-500" : ""}`} />
            )}
          </div>
          <Button asChild disabled={isAtLimit}>
            <Link href="/equipment/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Link>
          </Button>
        </div>
        <EquipmentTable 
          equipment={equipment || []} 
          categories={categories || []}
          departments={departments || []}
        />
      </div>
    </>
  )
}
