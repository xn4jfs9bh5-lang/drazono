import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/api-auth'
import { getResend } from '@/lib/resend'
import { createAdminClient } from '@/lib/supabase-server'
import { SITE_URL, WHATSAPP_NUMBER } from '@/lib/constants'

const schema = z.object({
  vehicleId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    const { authorized } = await verifyAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const resend = getResend()
    if (!resend) {
      return NextResponse.json({ error: 'RESEND_API_KEY non configurée' }, { status: 500 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { vehicleId } = parsed.data

    // Fetch vehicle
    const { data: vehicle, error: vErr } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single()

    if (vErr || !vehicle) {
      return NextResponse.json({ error: 'Véhicule introuvable' }, { status: 404 })
    }

    // Fetch subscribers
    const { data: subscribers } = await supabase
      .from('email_subscriptions')
      .select('email')

    if (!subscribers?.length) {
      return NextResponse.json({ sent: 0, message: 'Aucun abonné' })
    }

    // Check already sent (idempotency)
    const { data: alreadySent } = await supabase
      .from('email_logs')
      .select('email')
      .eq('vehicle_id', vehicleId)
      .eq('success', true)

    const sentSet = new Set(alreadySent?.map(e => e.email) ?? [])
    const toSend = subscribers.filter(s => !sentSet.has(s.email))

    if (toSend.length === 0) {
      return NextResponse.json({ sent: 0, message: 'Emails déjà envoyés' })
    }

    const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n)
    const imageUrl = vehicle.images?.[0] || ''
    const vehicleUrl = `${SITE_URL}/vehicule/${vehicle.id}`
    const waMsg = encodeURIComponent(`Bonjour, je suis intéressé par le ${vehicle.brand} ${vehicle.model} ${vehicle.year} à ${fmt(vehicle.price_eur)}€ sur DRAZONO.`)

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">

<tr><td style="background:#0A1325;padding:20px 24px;text-align:center">
<span style="color:#1845CC;font-weight:800;font-size:22px">D</span><span style="color:#fff;font-weight:800;font-size:22px">RAZONO</span>
</td></tr>

${imageUrl ? `<tr><td><img src="${imageUrl}" alt="${vehicle.brand} ${vehicle.model}" style="width:100%;display:block;max-height:300px;object-fit:cover" /></td></tr>` : ''}

<tr><td style="padding:24px">
<div style="display:inline-block;background:#fee2e2;color:#b91c1c;font-size:11px;font-weight:600;padding:4px 10px;border-radius:99px;margin-bottom:12px">Direct Chine</div>
<h1 style="margin:8px 0 4px;font-size:22px;color:#111827">${vehicle.brand} ${vehicle.model} ${vehicle.year}</h1>
<p style="margin:0;font-size:28px;font-weight:800;color:#1845CC">${fmt(vehicle.price_eur)} €</p>
<p style="margin:4px 0 0;font-size:14px;color:#6b7280">≈ ${fmt(vehicle.price_fcfa || vehicle.price_eur * 656)} FCFA</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px">
<tr>
<td style="padding:4px 0"><a href="${vehicleUrl}" style="display:block;text-align:center;background:#1845CC;color:#fff;padding:14px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">Voir ce véhicule</a></td>
</tr>
<tr>
<td style="padding:4px 0"><a href="https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}" style="display:block;text-align:center;background:#25D366;color:#fff;padding:14px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">Je suis intéressé — WhatsApp</a></td>
</tr>
</table>
</td></tr>

<tr><td style="padding:0 24px 20px;text-align:center">
<p style="font-size:11px;color:#9ca3af;margin:0">Vous recevez cet email car vous êtes inscrit aux alertes DRAZONO.</p>
<p style="font-size:11px;margin:4px 0 0"><a href="${SITE_URL}" style="color:#9ca3af">Se désabonner</a></p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

    // Send in batches of 10
    let sentCount = 0
    const BATCH = 10
    for (let i = 0; i < toSend.length; i += BATCH) {
      const batch = toSend.slice(i, i + BATCH)
      const results = await Promise.allSettled(
        batch.map(sub =>
          resend.emails.send({
            from: 'DRAZONO <onboarding@resend.dev>',
            to: sub.email,
            subject: `Nouveau : ${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${fmt(vehicle.price_eur)}€`,
            html,
          })
        )
      )

      // Log results
      const logs = results.map((r, idx) => ({
        vehicle_id: vehicleId,
        email: batch[idx].email,
        success: r.status === 'fulfilled',
        error: r.status === 'rejected' ? String(r.reason) : null,
      }))
      await supabase.from('email_logs').insert(logs)
      sentCount += results.filter(r => r.status === 'fulfilled').length
    }

    return NextResponse.json({ sent: sentCount, total: toSend.length })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
