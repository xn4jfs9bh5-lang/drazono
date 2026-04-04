import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase-server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const client = new Anthropic()

const schema = z.object({
  brand: z.string(), model: z.string(), year: z.number(),
  price_eur: z.number(), price_fcfa: z.number(),
  condition: z.string(), fuel_type: z.string(), power: z.string(),
  description: z.string().optional(), url: z.string(),
  vehicleId: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
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
        tiktok: `🔥 ${v.brand} ${v.model} ${v.year} — ${fmt(v.price_eur)}€ direct Chine\n#drazono`,
        facebook: `${v.brand} ${v.model} ${v.year} à ${fmt(v.price_eur)}€ sur DRAZONO.\n${v.url}`,
        instagram: `${v.brand} ${v.model} — ${fmt(v.price_eur)}€ 🇨🇳\n#drazono`,
        whatsapp: `*${v.brand} ${v.model} ${v.year}* — ${fmt(v.price_eur)}€\n${v.url}`,
        source: 'fallback',
      })
    }

    let fullText = ''
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `Marketing auto Afrique. JSON valide uniquement, pas de backticks. Commence par { termine par }.`,
      messages: [{
        role: 'user',
        content: `4 posts courts pour ${v.brand} ${v.model} ${v.year}, ${fmt(v.price_eur)}€/${fmt(v.price_fcfa)} FCFA, ${v.fuel_type}. Lien: ${v.url}. JSON: {"tiktok":"max 150 chars","facebook":"max 200 chars","instagram":"max 150 chars","whatsapp":"max 150 chars"} avec #drazono`,
      }],
    })

    stream.on('text', (t) => { fullText += t })
    await stream.finalMessage()

    let content
    try { content = JSON.parse(fullText) } catch {
      const m = fullText.match(/\{[\s\S]*\}/)
      if (m) try { content = JSON.parse(m[0]) } catch { /* */ }
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
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur serveur'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
