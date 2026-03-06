import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, PackageCheck, PackageX, Wrench, AlertTriangle, Search, Clock, Plus, UserPlus, ArrowLeftRight, Building2, User, FolderOpen, Mail } from "lucide-react"
import { WarrantyAlerts } from "@/components/dashboard/warranty-alerts"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

async function getStats(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, userId: string) {
  const { data: equipment } = await supabase
    .from("equipment")
    .select("status")
    .eq("user_id", userId)
  
  const stats = {
    total: equipment?.length || 0,
    available: equipment?.filter(e => e.status === "available").length || 0,
    assigned: equipment?.filter(e => e.status === "assigned").length || 0,
    maintenance: equipment?.filter(e => e.status === "maintenance").length || 0,
    damaged: equipment?.filter(e => e.status === "damaged").length || 0,
    lost: equipment?.filter(e => e.status === "lost").length || 0,
  }
  
  return stats
}

async function getRecentActivity(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, userId: string) {
  // Try to get from activity_log first
  const { data: activityLog, error: activityError } = await supabase
    .from("activity_log")
    .select("id, action, entity_type, entity_name, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)
  
  if (!activityError && activityLog && activityLog.length > 0) {
    return activityLog.map(item => ({
      id: item.id,
      name: item.entity_name,
      action: item.action,
      entity_type: item.entity_type,
      created_at: item.created_at
    }))
  }
  
  // Fallback to equipment if activity_log doesn't exist or is empty
  const { data: recentEquipment } = await supabase
    .from("equipment")
    .select("id, name, status, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(5)
  
  return (recentEquipment || []).map(item => ({
    id: item.id,
    name: item.name,
    action: "updated",
    entity_type: "equipment",
    created_at: item.updated_at
  }))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please log in</div>
  }
  
  const stats = await getStats(supabase, user.id)
  const recentActivity = await getRecentActivity(supabase, user.id)

  const metrics = [
    { title: "Total Equipment", value: stats.total, icon: Package, color: "text-foreground" },
    { title: "Available", value: stats.available, icon: PackageX, color: "text-green-500" },
    { title: "Assigned", value: stats.assigned, icon: PackageCheck, color: "text-blue-500" },
    { title: "Maintenance", value: stats.maintenance, icon: Wrench, color: "text-yellow-500" },
    { title: "Damaged", value: stats.damaged, icon: AlertTriangle, color: "text-orange-500" },
    { title: "Lost", value: stats.lost, icon: Search, color: "text-red-500" },
  ]

  return (
    <>
      <Header title="Dashboard" description="Overview of your equipment" />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <WarrantyAlerts />
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <ul className="space-y-3">
                  {recentActivity.map((item) => {
                    const getIcon = () => {
                      switch (item.entity_type) {
                        case "equipment": return <Package className="h-4 w-4 text-blue-500" />
                        case "employee": return <User className="h-4 w-4 text-green-500" />
                        case "department": return <Building2 className="h-4 w-4 text-purple-500" />
                        case "category": return <FolderOpen className="h-4 w-4 text-orange-500" />
                        case "assignment": return <ArrowLeftRight className="h-4 w-4 text-cyan-500" />
                        case "team_member": return <Mail className="h-4 w-4 text-pink-500" />
                        default: return <Clock className="h-4 w-4 text-muted-foreground" />
                      }
                    }
                    return (
                      <li key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          {getIcon()}
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.action} {item.entity_type}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent activity. Add equipment to get started.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
                <Link href="/equipment/new">
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Add Equipment</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
                <Link href="/employees/new">
                  <UserPlus className="h-5 w-5" />
                  <span className="text-xs">Add Employee</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
                <Link href="/assignments/new">
                  <ArrowLeftRight className="h-5 w-5" />
                  <span className="text-xs">Assign Equipment</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
                <Link href="/departments">
                  <Building2 className="h-5 w-5" />
                  <span className="text-xs">Departments</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
