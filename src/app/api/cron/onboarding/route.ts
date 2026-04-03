import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getOnboardingTemplate } from '@/lib/onboarding'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')?.replace('Bearer ', '')
    ?? req.headers.get('x-cron-secret')
  const valid = process.env.CRON_SECRET
  if (!valid || authHeader !== valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY missing' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  const { Resend } = await import('resend')
  const resend = new Resend(resendKey)
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'DRAZONO <onboarding@resend.dev>'

  const { data: pending } = await supabase
    .from('user_email_sequences')
    .select('id, user_id, step_key')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .limit(50)

  let sent = 0
  let failed = 0

  for (const entry of pending ?? []) {
    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', entry.user_id)
      .maybeSingle()

    if (!profile?.email) {
      await supabase.from('user_email_sequences')
        .update({ status: 'failed', error_message: 'No profile email' })
        .eq('id', entry.id)
      failed++
      continue
    }

    const template = getOnboardingTemplate(entry.step_key, profile.name || 'Client', profile.email)
    if (!template) {
      await supabase.from('user_email_sequences')
        .update({ status: 'cancelled' })
        .eq('id', entry.id)
      continue
    }

    const result = await resend.emails.send({
      from: fromEmail,
      to: profile.email,
      subject: template.subject,
      html: template.html,
    })

    await supabase.from('user_email_sequences')
      .update({
        status: result.error ? 'failed' : 'sent',
        sent_at: result.error ? null : new Date().toISOString(),
        error_message: result.error?.message ?? null,
      })
      .eq('id', entry.id)

    if (result.error) { failed++ } else { sent++ }
  }

  return NextResponse.json({ sent, failed })
}
