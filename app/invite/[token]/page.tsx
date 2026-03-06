"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "expired" | "accepted">("loading")
  const [invitation, setInvitation] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkInvitation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const checkInvitation = async () => {
    const { data, error } = await supabase
      .from("team_invitations")
      .select("*")
      .eq("token", token)
      .single()

    if (error || !data) {
      setStatus("invalid")
      return
    }

    if (data.status === "accepted") {
      setStatus("accepted")
      return
    }

    if (new Date(data.expires_at) < new Date()) {
      setStatus("expired")
      return
    }

    setInvitation(data)
    setStatus("valid")
  }

  const acceptInvitation = async () => {
    setProcessing(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Redirect to sign up with the invitation token
      router.push(`/auth/sign-up?invite=${token}`)
      return
    }

    // Add user to team
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        user_id: user.id,
        team_owner_id: invitation.team_owner_id,
        role: "member"
      })

    if (memberError) {
      console.error("Error adding member:", memberError)
      setProcessing(false)
      return
    }

    // Update invitation status
    await supabase
      .from("team_invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id)

    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>EquipTracking</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Checking invitation...</p>
            </div>
          )}

          {status === "valid" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                You have been invited to join a team on EquipTracking.
              </p>
              <p className="font-medium">
                Invited email: {invitation?.email}
              </p>
              <Button onClick={acceptInvitation} disabled={processing} className="w-full">
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Accept Invitation"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                By accepting, you will have access to the team's equipment data.
              </p>
            </div>
          )}

          {status === "invalid" && (
            <div className="space-y-4 py-4">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <p className="text-muted-foreground">
                This invitation link is invalid or has already been used.
              </p>
              <Button asChild variant="outline">
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            </div>
          )}

          {status === "expired" && (
            <div className="space-y-4 py-4">
              <XCircle className="mx-auto h-12 w-12 text-yellow-500" />
              <p className="text-muted-foreground">
                This invitation link has expired. Please ask the team owner to send a new invitation.
              </p>
              <Button asChild variant="outline">
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            </div>
          )}

          {status === "accepted" && (
            <div className="space-y-4 py-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <p className="text-muted-foreground">
                This invitation has already been accepted.
              </p>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
