"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { TeamMember, TeamInvitation, TeamContextType, TeamRole, InviteStatus } from "./types"

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// Generate invitation token
const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

const TeamContext = createContext<TeamContextType | null>(null)

// Initial mock data
const initialMembers: TeamMember[] = [
  {
    id: "member-1",
    companyId: "company-1",
    userId: "user-1",
    email: "admin@company.com",
    name: "Admin User",
    role: "owner",
    status: "active",
    joinedAt: new Date().toISOString(),
  },
]

const initialInvitations: TeamInvitation[] = []

export function TeamProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [invitations, setInvitations] = useState<TeamInvitation[]>(initialInvitations)
  const [isLoading] = useState(false)

  const inviteMember = useCallback(async (email: string, role: TeamRole) => {
    // Check if email is already a member
    const existingMember = members.find(m => m.email.toLowerCase() === email.toLowerCase())
    if (existingMember) {
      return { success: false, error: "This email is already a team member" }
    }

    // Check if there's already a pending invitation
    const existingInvite = invitations.find(
      i => i.email.toLowerCase() === email.toLowerCase() && i.status === "pending"
    )
    if (existingInvite) {
      return { success: false, error: "An invitation has already been sent to this email" }
    }

    const token = generateToken()
    const newInvitation: TeamInvitation = {
      id: generateId(),
      companyId: "company-1",
      email,
      role,
      invitedBy: "user-1",
      invitedByName: "Admin User",
      status: "pending",
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }

    setInvitations(prev => [...prev, newInvitation])

    // Generate invite link
    const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${token}`
    
    return { success: true, inviteLink }
  }, [members, invitations])

  const removeMember = useCallback((memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }, [])

  const updateMemberRole = useCallback((memberId: string, role: TeamRole) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, role } : m
    ))
  }, [])

  const revokeInvitation = useCallback((invitationId: string) => {
    setInvitations(prev => prev.map(i => 
      i.id === invitationId ? { ...i, status: "revoked" as InviteStatus } : i
    ))
  }, [])

  const resendInvitation = useCallback(async (invitationId: string) => {
    const invitation = invitations.find(i => i.id === invitationId)
    if (!invitation) {
      return { success: false, error: "Invitation not found" }
    }

    // Generate new token and update expiry
    const newToken = generateToken()
    setInvitations(prev => prev.map(i => 
      i.id === invitationId 
        ? { 
            ...i, 
            token: newToken, 
            status: "pending" as InviteStatus,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          } 
        : i
    ))

    return { success: true }
  }, [invitations])

  const value: TeamContextType = {
    members,
    invitations,
    isLoading,
    inviteMember,
    removeMember,
    updateMemberRole,
    revokeInvitation,
    resendInvitation,
  }

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}
