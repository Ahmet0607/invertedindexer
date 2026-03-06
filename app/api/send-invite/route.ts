import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: Request) {
  try {
    const { email, inviteLink, inviterEmail } = await req.json()

    if (!email || !inviteLink) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if Resend is configured
    if (!resend) {
      console.log('RESEND_API_KEY not configured, using manual link approach')
      return NextResponse.json({ 
        success: true, 
        method: 'manual',
        message: 'Email service not configured. Please share the link manually.'
      })
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'EquipTracking <onboarding@resend.dev>',
      to: email,
      subject: 'You have been invited to join a team on EquipTracking',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background-color: #f5f5f5;">
            <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h1 style="color: #111; font-size: 24px; margin-bottom: 16px;">You're Invited!</h1>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                <strong>${inviterEmail}</strong> has invited you to join their team on EquipTracking - an equipment management platform.
              </p>
              <a href="${inviteLink}" style="display: inline-block; background-color: #111; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 16px;">
                Accept Invitation
              </a>
              <p style="color: #999; font-size: 14px; margin-top: 32px;">
                This invitation will expire in 7 days. If you didn't expect this email, you can safely ignore it.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
              <p style="color: #999; font-size: 12px;">
                EquipTracking - Equipment Management Made Simple
              </p>
            </div>
          </body>
        </html>
      `
    })

    if (error) {
      console.log('Resend error:', error.message)
      return NextResponse.json({ 
        success: true, 
        method: 'manual',
        message: 'Failed to send email. Please share the link manually.'
      })
    }

    return NextResponse.json({ 
      success: true, 
      method: 'email',
      message: 'Invitation email sent successfully!'
    })
  } catch (error) {
    console.error('Error sending invite:', error)
    return NextResponse.json({ 
      success: true, 
      method: 'manual',
      message: 'Error occurred. Please share the link manually.'
    })
  }
}
