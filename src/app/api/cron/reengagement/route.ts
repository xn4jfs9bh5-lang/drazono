import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { WHATSAPP_NUMBER } from '@/lib/constants'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.drazono.com'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('x-cron-secret')
    ?? req.headers.get('authorization')?.replace('Bearer ', '')
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

  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString()

  // Find inactive users: registered > 14 days ago, no recent reengagement
  const { data: candidates } = await supabase
    .from('profiles')
    .select('id, email, name')
    .eq('role', 'client')
    .neq('email_unsubscribed', true)
    .lt('created_at', fourteenDaysAgo)
    .limit(50)

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

  // Get top 3 recent vehicles as fallback
  const { data: topVehicles } = await supabase
    .from('vehicles')
    .select('id, brand, model, year, price_eur, price_fcfa')
    .eq('status', 'disponible')
    .order('created_at', { ascending: false })
    .limit(3)

  let sent = 0
  let skipped = 0

  for (const user of candidates ?? []) {
    if (!user.email) { skipped++; continue }

    // Check if already re-engaged recently
    const { data: recentLog } = await supabase
      .from('reengagement_logs')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', fourteenDaysAgo)
      .limit(1)

    if (recentLog && recentLog.length > 0) { skipped++; continue }

    // Get user favorites
    const { data: favs } = await supabase
      .from('favorites')
      .select('vehicle_id, vehicles(id, brand, model, year, price_eur, price_fcfa, status)')
      .eq('user_id', user.id)
      .limit(3)

    interface VehicleInfo {
      id: string; brand: string; model: string; year: number;
      price_eur: number; price_fcfa?: number; status?: string;
    }

    const availableFavs: VehicleInfo[] = []
    for (const f of favs ?? []) {
      const v = f.vehicles as unknown as VehicleInfo | VehicleInfo[] | null
      if (!v || Array.isArray(v)) continue
      if (v.status === 'disponible') availableFavs.push(v)
    }

    const vehiclesToShow: VehicleInfo[] = availableFavs.length > 0
      ? availableFavs
      : ((topVehicles ?? []) as VehicleInfo[])
    const firstName = user.name?.split(' ')[0] || 'Client'

    const vehicleListHtml = vehiclesToShow.map(vData => {
      return `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9">
        <strong>${vData.brand} ${vData.model} ${vData.year}</strong><br>
        <span style="color:#1845CC;font-weight:700">${fmt(vData.price_eur)} EUR</span>
        <span style="color:#666"> (≈ ${fmt(vData.price_fcfa || vData.price_eur * 656)} FCFA)</span><br>
        <a href="${SITE_URL}/vehicule/${vData.id}" style="color:#1845CC;font-size:13px">Voir le vehicule →</a>
      </td></tr>`
    }).join('')

    const subject = availableFavs.length > 0
      ? `${firstName}, votre ${availableFavs[0].brand} vous attend`
      : `${firstName}, decouvrez nos derniers vehicules`

    const result = await resend.emails.send({
      from: fromEmail,
      to: user.email,
      subject,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif">
<table width="100%" style="background:#f8fafc;padding:32px 16px"><tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
<tr><td style="background:#0A1325;padding:20px 24px;text-align:center">
<span style="color:#1845CC;font-weight:800;font-size:22px">D</span><span style="color:#fff;font-weight:800;font-size:22px">RAZONO</span>
</td></tr>
<tr><td style="padding:24px">
<h2 style="color:#1845CC;margin:0 0 12px">Bonjour ${firstName} !</h2>
<p>${availableFavs.length > 0
  ? 'Vos vehicules favoris sont toujours disponibles :'
  : 'Decouvrez nos derniers vehicules :'}</p>
<table width="100%" cellpadding="0" cellspacing="0">${vehicleListHtml}</table>
<p style="margin-top:20px"><a href="${SITE_URL}/catalogue" style="display:inline-block;background:#1845CC;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Voir tout le catalogue</a></p>
<p><a href="https://wa.me/${WHATSAPP_NUMBER}" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Contacter sur WhatsApp</a></p>
</td></tr>
<tr><td style="padding:0 24px 20px;text-align:center">
<p style="font-size:11px;color:#9ca3af"><a href="${SITE_URL}/api/emails/unsubscribe?email=${encodeURIComponent(user.email)}" style="color:#9ca3af">Se desabonner</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    })

    await supabase.from('reengagement_logs').insert({
      user_id: user.id,
      campaign_key: 'inactive_14d',
      status: result.error ? 'failed' : 'sent',
      error_message: result.error?.message ?? null,
    })

    if (!result.error) {
      sent++
      await supabase.from('profiles')
        .update({ last_reengagement_at: new Date().toISOString() })
        .eq('id', user.id)
    }
  }

  return NextResponse.json({ sent, skipped })
}
