"use client"

import Link from "next/link"
import {
  Package,
  PackageCheck,
  PackageX,
  Wrench,
  AlertTriangle,
  Plus,
  ClipboardList,
  Search,
} from "lucide-react"
import { Header } from "@/components/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { RecentAssignments } from "@/components/dashboard/recent-assignments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/lib/store/data-context"

export default function DashboardPage() {
  const { getEquipmentStats, company } = useData()
  const stats = getEquipmentStats()

  return (
    <>
      <Header breadcrumbs={[{ label: "Dashboard" }]} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            {company.name} equipment overview
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <MetricCard
            title="Total Equipment"
            value={stats.total}
            icon={Package}
            description="All registered items"
          />
          <MetricCard
            title="Assigned"
            value={stats.assigned}
            icon={PackageCheck}
            variant="info"
            description="Currently in use"
          />
          <MetricCard
            title="Available"
            value={stats.available}
            icon={PackageX}
            variant="success"
            description="Ready to assign"
          />
          <MetricCard
            title="Maintenance"
            value={stats.maintenance}
            icon={Wrench}
            variant="warning"
            description="Under service"
          />
          <MetricCard
            title="Damaged"
            value={stats.damaged}
            icon={AlertTriangle}
            variant="danger"
            description="Needs attention"
          />
          <MetricCard
            title="Lost"
            value={stats.lost}
            icon={Search}
            variant="danger"
            description="Missing items"
          />
        </div>

        {/* Quick Actions and Recent */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild className="justify-start">
                <Link href="/equipment/new">
                  <Plus className="mr-2 size-4" />
                  Add Equipment
                </Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start">
                <Link href="/assignments/new">
                  <ClipboardList className="mr-2 size-4" />
                  New Assignment
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/equipment">
                  <Package className="mr-2 size-4" />
                  View All Equipment
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <RecentAssignments />
          </div>
        </div>
      </div>
    </>
  )
}
