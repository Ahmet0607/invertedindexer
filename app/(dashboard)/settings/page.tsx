import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <>
      <Header title="Settings" description="Manage your account settings" />
      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={profile?.first_name || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={profile?.last_name || ""} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={profile?.company_name || ""} disabled />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
