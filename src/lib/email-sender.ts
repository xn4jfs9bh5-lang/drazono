import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailPayload {
  from: string
  to: string
  subject: string
  html: string
}

interface IdempotencyCheck {
  vehicle_id?: string
  recipient_email: string
  campaign_type: string
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

/**
 * Check idempotency: skip if already sent for this vehicle+email+campaign combo
 */
export async function shouldSkipEmail(check: IdempotencyCheck): Promise<boolean> {
  const supabase = getServiceClient()
  const query = supabase
    .from('email_logs')
    .select('id')
    .eq('email', check.recipient_email)
    .eq('success', true)

  if (check.vehicle_id) {
    query.eq('vehicle_id', check.vehicle_id)
  }

  const { data } = await query.limit(1)
  return (data?.length ?? 0) > 0
}

/**
 * Send email with exponential retry (max 3 attempts)
 */
export async function sendWithRetry(
  payload: EmailPayload,
  meta?: { vehicle_id?: string; campaign_type?: string },
  maxRetries = 3
): Promise<void> {
  const supabase = getServiceClient()

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { error } = await resend.emails.send(payload)
      if (error) throw new Error(error.message)

      // Log success
      await supabase.from('email_logs').insert({
        vehicle_id: meta?.vehicle_id ?? null,
        email: payload.to,
        success: true,
        error: null,
      })
      return
    } catch (err) {
      if (attempt === maxRetries - 1) {
        // Log failure on last attempt
        await supabase.from('email_logs').insert({
          vehicle_id: meta?.vehicle_id ?? null,
          email: payload.to,
          success: false,
          error: err instanceof Error ? err.message : String(err),
        })
        throw err
      }
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
    }
  }
}
