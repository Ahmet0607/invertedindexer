import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { email, inviteLink, inviterEmail } = await req.json()

    if (!email || !inviteLink) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Use Supabase Edge Function or direct SMTP
    // For now, we'll use Supabase's built-in email via Auth
    // This is a workaround - ideally you'd use Resend, SendGrid, etc.
    
    // Since Supabase doesn't have a direct email API for custom emails,
    // we'll use the invite user functionality which sends an email
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: inviteLink,
      data: {
        invited_by: inviterEmail,
        invite_type: 'team_member'
      }
    })

    if (error) {
      // If admin invite fails (likely due to permissions), 
      // we still have the manual link approach
      console.log('Admin invite failed, using manual link approach:', error.message)
      return NextResponse.json({ 
        success: true, 
        method: 'manual',
        message: 'Invitation created. Please share the link manually.'
      })
    }

    return NextResponse.json({ 
      success: true, 
      method: 'email',
      message: 'Invitation email sent successfully!'
    })
  } catch (error) {
    console.error('Error sending invite:', error)
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
  }
}
