export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked'
export type TeamRole = 'owner' | 'admin' | 'member'

export interface TeamMember {
  id: string
  companyId: string
  userId: string
  email: string
  name: string
  role: TeamRole
  status: 'active' | 'inactive'
  joinedAt: string
}

export interface TeamInvitation {
  id: string
  companyId: string
  email: string
  role: TeamRole
  invitedBy: string
  invitedByName: string
  status: InviteStatus
  token: string
  createdAt: string
  expiresAt: string
}

export interface TeamContextType {
  members: TeamMember[]
  invitations: TeamInvitation[]
  isLoading: boolean
  inviteMember: (email: string, role: TeamRole) => Promise<{ success: boolean; error?: string; inviteLink?: string }>
  removeMember: (memberId: string) => void
  updateMemberRole: (memberId: string, role: TeamRole) => void
  revokeInvitation: (invitationId: string) => void
  resendInvitation: (invitationId: string) => Promise<{ success: boolean; error?: string }>
}
