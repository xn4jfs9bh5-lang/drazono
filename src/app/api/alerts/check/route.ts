import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const AlertRow = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  brand: z.string().nullable(),
  body_type: z.string().nullable(),
  fuel_type: z.string().nullable(),
  max_price: z.number().nullable(),
  is_active: z.boolean(),
})

function assertSecret(req: NextRequest) {
  const h = req.headers.get('x-cron-secret')
    ?? req.headers.get('authorization')?.replace('Bearer ', '')
  const valid = process.env.CRON_SECRET
  if (!valid || h !== valid) throw new Error('Unauthorized')
}

export async function POST(req: NextRequest) {
  try {
    assertSecret(req)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.drazono.com'
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ ok: false, error: 'RESEND_API_KEY missing' }, { status: 500 })
    }

    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'DRAZONO <onboarding@resend.dev>'

    // Fetch active alerts + available vehicles
    const [alertsRes, vehiclesRes] = await Promise.all([
      supabase.from('alerts').select('*').eq('is_active', true).limit(200),
      supabase.from('vehicles').select('*').eq('status', 'disponible')
        .order('created_at', { ascending: false }).limit(300),
    ])

    const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n)
    let sentCount = 0

    for (const alert of alertsRes.data ?? []) {
      const parsed = AlertRow.safeParse(alert)
      if (!parsed.success) continue
      const a = parsed.data

      for (const vehicle of vehiclesRes.data ?? []) {
        if (a.brand && vehicle.brand !== a.brand) continue
        if (a.body_type && vehicle.body_type !== a.body_type) continue
        if (a.fuel_type && vehicle.fuel_type !== a.fuel_type) continue
        if (a.max_price && vehicle.price_eur > a.max_price) continue

        // Check duplicate notification
        const { data: existing } = await supabase
          .from('alert_notifications')
          .select('id')
          .eq('alert_id', a.id)
          .eq('vehicle_id', vehicle.id)
          .eq('channel', 'email')
          .maybeSingle()
        if (existing) continue

        // Get user email
        const { data: profile } = await supabase
          .from('profiles').select('email, name')
          .eq('id', a.user_id).maybeSingle()
        if (!profile?.email) continue

        const vehicleUrl = `${siteUrl}/vehicule/${vehicle.id}`

        const result = await resend.emails.send({
          from: fromEmail,
          to: profile.email,
          subject: `Nouveau ${vehicle.brand} ${vehicle.model} correspond a votre alerte`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#1845CC">Votre alerte a trouve une correspondance !</h2>
            <p><strong>${vehicle.brand} ${vehicle.model} ${vehicle.year}</strong></p>
            <p>Prix : <strong>${fmt(vehicle.price_eur)} EUR</strong>
              (≈ ${fmt(vehicle.price_fcfa || vehicle.price_eur * 656)} FCFA)</p>
            <p><a href="${vehicleUrl}" style="background:#1845CC;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Voir ce vehicule</a></p>
            <p style="color:#666;font-size:12px">Acompte 100% remboursable si indisponible</p>
          </div>`,
        })

        await supabase.from('alert_notifications').insert({
          alert_id: a.id,
          vehicle_id: vehicle.id,
          channel: 'email',
          status: result.error ? 'failed' : 'sent',
          error_message: result.error?.message ?? null,
          sent_at: result.error ? null : new Date().toISOString(),
        })

        if (!result.error) sentCount++
      }
    }

    return NextResponse.json({ ok: true, sentCount })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error'
    return NextResponse.json(
      { ok: false, error: msg },
      { status: msg === 'Unauthorized' ? 401 : 500 }
    )
  }
}
