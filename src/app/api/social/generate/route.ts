import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase-server'

export const maxDuration = 60

const schema = z.object({
  brand: z.string(), model: z.string(), year: z.number(),
  price_eur: z.number(), price_fcfa: z.number(),
  condition: z.string(), fuel_type: z.string(), power: z.string(),
  description: z.string().optional(), url: z.string(),
  vehicleId: z.string().uuid().optional(),
})

export async function POST(req: Request) {
  const { authorized } = await verifyAdmin()
  if (!authorized) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    const v = parsed.data
    const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

    // Check cache
    if (v.vehicleId) {
      const sb = createAdminClient()
      const { data: cached } = await sb.from('vehicles').select('social_posts_cache').eq('id', v.vehicleId).single()
      if (cached?.social_posts_cache) return NextResponse.json({ ...cached.social_posts_cache, source: 'cache' })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        tiktok: `🔥 ${v.brand} ${v.model} ${v.year} — ${fmt(v.price_eur)}€ direct Chine\n#drazono #voiturechinoise`,
        facebook: `${v.brand} ${v.model} ${v.year} à ${fmt(v.price_eur)}€ sur DRAZONO.\n${v.url}`,
        instagram: `${v.brand} ${v.model} — ${fmt(v.price_eur)}€ 🇨🇳\n#drazono`,
        whatsapp: `*${v.brand} ${v.model} ${v.year}* — ${fmt(v.price_eur)}€\n${v.url}`,
        source: 'fallback',
      })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `Marketing automobile Afrique. Contenu viral. Tu dois répondre UNIQUEMENT avec un objet JSON valide. Pas de backticks, pas de texte avant ou après. Commence par { et termine par }.`,
      messages: [{ role: 'user', content: `Posts pour: ${v.brand} ${v.model} ${v.year}, ${fmt(v.price_eur)}€ / ${fmt(v.price_fcfa)} FCFA, ${v.condition}, ${v.fuel_type}. Lien: ${v.url}. JSON: {"tiktok":"...","facebook":"...","instagram":"...","whatsapp":"..."}. Hashtags #drazono #voiturechinoise.` }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    let content
    try { content = JSON.parse(text) } catch {
      const m = text.match(/\{[\s\S]*\}/)
      if (m) try { content = JSON.parse(m[0]) } catch { /* fall through */ }
    }

    if (!content) {
      return NextResponse.json({
        tiktok: `🔥 ${v.brand} ${v.model} ${v.year} — ${fmt(v.price_eur)}€ direct Chine\n#drazono`,
        facebook: `${v.brand} ${v.model} ${v.year} à ${fmt(v.price_eur)}€.\n${v.url}`,
        instagram: `${v.brand} ${v.model} — ${fmt(v.price_eur)}€\n#drazono`,
        whatsapp: `*${v.brand} ${v.model} ${v.year}* — ${fmt(v.price_eur)}€\n${v.url}`,
        source: 'fallback',
      })
    }

    if (v.vehicleId) {
      const sb = createAdminClient()
      await sb.from('vehicles').update({ social_posts_cache: content }).eq('id', v.vehicleId)
    }

    return NextResponse.json({ ...content, source: 'ai' })
  } catch (e) {
    console.error('[social/generate]', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 })
  }
}
