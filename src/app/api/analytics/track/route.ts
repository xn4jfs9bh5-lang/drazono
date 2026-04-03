import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

const schema = z.object({
  event_type: z.enum([
    'page_view', 'vehicle_view', 'whatsapp_click',
    'catalogue_search', 'newsletter_signup', 'contact_form',
  ]),
  page: z.string().max(500).optional(),
  vehicle_id: z.string().uuid().optional(),
  session_id: z.string().max(100),
  referrer: z.string().max(500).optional(),
  device: z.enum(['mobile', 'desktop']).optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(200).optional(),
  utm_content: z.string().max(200).optional(),
  utm_term: z.string().max(200).optional(),
  landing_path: z.string().max(500).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid' }, { status: 400 })
    }

    // Rate limit: 60 events/minute per session
    const rl = rateLimit(`analytics:${parsed.data.session_id}`, 60, 60_000)
    if (!rl.ok) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    const supabase = createAdminClient()
    await supabase.from('analytics_events').insert({
      event_type: parsed.data.event_type,
      page: parsed.data.page,
      vehicle_id: parsed.data.vehicle_id || null,
      session_id: parsed.data.session_id,
      referrer: parsed.data.referrer,
      device: parsed.data.device,
      utm_source: parsed.data.utm_source || null,
      utm_medium: parsed.data.utm_medium || null,
      utm_campaign: parsed.data.utm_campaign || null,
      utm_content: parsed.data.utm_content || null,
      utm_term: parsed.data.utm_term || null,
      landing_path: parsed.data.landing_path || null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
