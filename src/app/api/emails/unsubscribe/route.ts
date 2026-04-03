import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  const token = req.nextUrl.searchParams.get('token')

  if (!email) {
    return new Response('Lien invalide', { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  // If token provided, verify it
  if (token) {
    const { data: sub } = await supabase
      .from('email_subscriptions')
      .select('id, unsubscribe_token')
      .eq('email', email)
      .maybeSingle()

    if (sub && sub.unsubscribe_token !== token) {
      return new Response('Token invalide', { status: 403 })
    }
  }

  // Unsubscribe from email_subscriptions
  await supabase
    .from('email_subscriptions')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('email', email)

  // Also mark profile as unsubscribed
  await supabase
    .from('profiles')
    .update({ email_unsubscribed: true })
    .eq('email', email)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drazono.vercel.app'
  return Response.redirect(`${siteUrl}/desabonnement`)
}
