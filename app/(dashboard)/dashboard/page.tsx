import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, PackageCheck, PackageX, Wrench, AlertTriangle, Search, Clock } from "lucide-react"
import { WarrantyAlerts } from "@/components/dashboard/warranty-alerts"
import { formatDistanceToNow } from "date-fns"

async function getStats(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never) {
  const { data: equipment } = await supabase.from("equipment").select("status")
  
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

async function getRecentActivity(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never) {
  const { data: recentEquipment } = await supabase
    .from("equipment")
    .select("id, name, status, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5)
  
  return recentEquipment || []
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const stats = await getStats(supabase)
  const recentActivity = await getRecentActivity(supabase)

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
                  {recentActivity.map((item) => (
                    <li key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{item.status}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                      </span>
                    </li>
                  ))}
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
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Use the sidebar to navigate and manage your equipment, employees, and departments.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
