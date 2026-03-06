import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PWAInstallBanner } from "@/components/pwa-install-banner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PWAInstallBanner />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
