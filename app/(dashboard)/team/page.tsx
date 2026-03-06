"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Mail, Trash2, Users, Copy, Check, Crown, Shield, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Invitation {
  id: string
  email: string
  status: string
  token: string
  created_at: string
  expires_at: string
}

interface TeamMember {
  id: string
  user_id: string
  role: string
  created_at: string
  profiles: {
    first_name: string | null
    last_name: string | null
  } | null
}

export default function TeamPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [sending, setSending] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [invitationsRes, membersRes] = await Promise.all([
      supabase
        .from("team_invitations")
        .select("*")
        .eq("team_owner_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("team_members")
        .select("*, profiles(first_name, last_name)")
        .eq("team_owner_id", user.id)
        .order("created_at", { ascending: false })
    ])

    if (invitationsRes.data) setInvitations(invitationsRes.data)
    if (membersRes.data) setMembers(membersRes.data as TeamMember[])
    setLoading(false)
  }

  const sendInvitation = async () => {
    if (!inviteEmail) return
    setSending(true)
    setError(null)
    setInviteLink(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("You must be logged in")
      setSending(false)
      return
    }

    const token = crypto.randomUUID()

    const { error: insertError } = await supabase
      .from("team_invitations")
      .insert({
        email: inviteEmail,
        team_owner_id: user.id,
        token,
        status: "pending"
      })

    if (insertError) {
      setError(insertError.message)
      setSending(false)
      return
    }

    const link = `${window.location.origin}/invite/${token}`
    setInviteLink(link)
    fetchTeamData()
    setSending(false)
  }

  const copyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const deleteInvitation = async (id: string) => {
    await supabase.from("team_invitations").delete().eq("id", id)
    fetchTeamData()
  }

  const removeMember = async (id: string) => {
    await supabase.from("team_members").delete().eq("id", id)
    fetchTeamData()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const resetDialog = () => {
    setInviteEmail("")
    setInviteRole("member")
    setError(null)
    setInviteLink(null)
    setCopied(false)
  }

  const roleIcons: Record<string, React.ReactNode> = {
    admin: <Shield className="h-4 w-4 text-blue-500" />,
    member: <User className="h-4 w-4 text-muted-foreground" />,
    viewer: <User className="h-4 w-4 text-muted-foreground" />,
  }

  return (
    <>
      <Header title="Team" description="Manage your team members and invitations" />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Team Members</h2>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetDialog()
          }}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to a colleague to join your team.
                </DialogDescription>
              </DialogHeader>
              
              {!inviteLink ? (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin - Full access</SelectItem>
                        <SelectItem value="member">Member - Can edit</SelectItem>
                        <SelectItem value="viewer">Viewer - Read only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Share this link with <strong>{inviteEmail}</strong>:
                    </p>
                    <div className="flex gap-2">
                      <Input readOnly value={inviteLink} className="text-xs" />
                      <Button variant="outline" size="icon" onClick={copyLink}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This invitation link will expire in 7 days.
                  </p>
                </div>
              )}

              <DialogFooter>
                {!inviteLink ? (
                  <Button onClick={sendInvitation} disabled={sending || !inviteEmail}>
                    {sending ? "Sending..." : "Send Invitation"}
                  </Button>
                ) : (
                  <Button onClick={() => { setDialogOpen(false); resetDialog(); }}>
                    Done
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Members
            </CardTitle>
            <CardDescription>People who have access to your equipment data</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : members.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No team members yet. Invite someone to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        {member.profiles?.first_name} {member.profiles?.last_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {roleIcons[member.role]}
                          <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                            {member.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(member.created_at)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removeMember(member.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
            <CardDescription>Invitations waiting to be accepted</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : invitations.filter(i => i.status === "pending").length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No pending invitations.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.filter(i => i.status === "pending").map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invitation.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(invitation.created_at)}</TableCell>
                      <TableCell>{formatDate(invitation.expires_at)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => deleteInvitation(invitation.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
