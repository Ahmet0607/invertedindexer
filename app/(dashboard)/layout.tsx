import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DataProvider } from "@/lib/store/data-context"
import { SubscriptionProvider } from "@/lib/subscription/subscription-context"
import { TeamProvider } from "@/lib/team/team-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SubscriptionProvider>
      <TeamProvider>
        <DataProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </DataProvider>
      </TeamProvider>
    </SubscriptionProvider>
  )
}
