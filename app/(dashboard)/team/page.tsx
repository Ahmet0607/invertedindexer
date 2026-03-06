"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Shield, 
  User, 
  Crown,
  Copy,
  Check,
  RefreshCw,
  X
} from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTeam } from "@/lib/team/team-context"
import type { TeamRole } from "@/lib/team/types"

const roleIcons: Record<TeamRole, React.ReactNode> = {
  owner: <Crown className="size-4 text-yellow-500" />,
  admin: <Shield className="size-4 text-blue-500" />,
  member: <User className="size-4 text-muted-foreground" />,
}

const roleLabels: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
}

export default function TeamPage() {
  const { members, invitations, inviteMember, removeMember, revokeInvitation, resendInvitation } = useTeam()
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<TeamRole>("member")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteError("Please enter an email address")
      return
    }

    setIsInviting(true)
    setInviteError(null)

    const result = await inviteMember(inviteEmail.trim(), inviteRole)
    
    if (result.success && result.inviteLink) {
      setInviteLink(result.inviteLink)
    } else {
      setInviteError(result.error || "Failed to send invitation")
    }

    setIsInviting(false)
  }

  const copyInviteLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const resetInviteDialog = () => {
    setInviteEmail("")
    setInviteRole("member")
    setInviteError(null)
    setInviteLink(null)
    setCopied(false)
  }

  const pendingInvitations = invitations.filter(i => i.status === "pending")

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Team" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
            <p className="text-muted-foreground">
              Manage your team members and invitations
            </p>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={(open) => {
            setInviteDialogOpen(open)
            if (!open) resetInviteDialog()
          }}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 size-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation link to add a new member to your team.
                </DialogDescription>
              </DialogHeader>
              
              {!inviteLink ? (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email address</label>
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member - Can view and edit equipment</SelectItem>
                        <SelectItem value="admin">Admin - Full access except billing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {inviteError && (
                    <p className="text-sm text-destructive">{inviteError}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Share this link with <strong>{inviteEmail}</strong>:
                    </p>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={inviteLink}
                        className="text-xs"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyInviteLink}
                      >
                        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
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
                  <Button onClick={handleInvite} disabled={isInviting}>
                    {isInviting ? "Sending..." : "Send Invitation"}
                  </Button>
                ) : (
                  <Button onClick={() => {
                    setInviteDialogOpen(false)
                    resetInviteDialog()
                  }}>
                    Done
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Members</CardTitle>
            <CardDescription>
              {members.length} member{members.length !== 1 ? "s" : ""} in your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{member.name}</span>
                        <span className="text-sm text-muted-foreground">{member.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {roleIcons[member.role]}
                        <span className="capitalize">{roleLabels[member.role]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {format(parseISO(member.joinedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {member.role !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => removeMember(member.id)}
                            >
                              Remove from Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Invitations</CardTitle>
              <CardDescription>
                {pendingInvitations.length} invitation{pendingInvitations.length !== 1 ? "s" : ""} waiting to be accepted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden sm:table-cell">Expires</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 text-muted-foreground" />
                          <span>{invitation.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {roleIcons[invitation.role]}
                          <span className="capitalize">{roleLabels[invitation.role]}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {format(parseISO(invitation.expiresAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => resendInvitation(invitation.id)}
                            title="Resend invitation"
                          >
                            <RefreshCw className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => revokeInvitation(invitation.id)}
                            title="Revoke invitation"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
