import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase-server'
import { extractJSON } from '@/lib/extract-json'

export const maxDuration = 60

const schema = z.object({
  brand: z.string(),
  model: z.string(),
  year: z.number(),
  price_eur: z.number(),
  price_fcfa: z.number(),
  condition: z.string(),
  fuel_type: z.string(),
  power: z.string(),
  description: z.string().optional(),
  url: z.string(),
  vehicleId: z.string().uuid().optional(),
})

export async function POST(req: Request) {
  try {
    const { authorized, userId } = await verifyAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const rl = rateLimit(`social:${userId}`, 10, 3600_000)
    if (!rl.ok) {
      return NextResponse.json({ error: 'Limite atteinte (10/heure).' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const v = parsed.data
    const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

    // Check cache if vehicleId provided
    if (v.vehicleId) {
      const supabase = createAdminClient()
      const { data: cached } = await supabase
        .from('vehicles')
        .select('social_posts_cache')
        .eq('id', v.vehicleId)
        .single()

      if (cached?.social_posts_cache) {
        return NextResponse.json({ ...cached.social_posts_cache, source: 'cache' })
      }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Fallback: basic templates without AI
      return NextResponse.json({
        tiktok: `🔥 ${v.brand} ${v.model} ${v.year} à seulement ${fmt(v.price_eur)}€ ! Direct Chine 🇨🇳\n\n#drazono #${v.brand.toLowerCase()} #voiturechinoise #importchine`,
        facebook: `🚗 Nouveau sur DRAZONO !\n\n${v.brand} ${v.model} ${v.year} — ${v.condition === 'neuf' ? 'Neuf' : 'Occasion'}\n💰 ${fmt(v.price_eur)}€ (≈ ${fmt(v.price_fcfa)} FCFA)\n⚡ ${v.fuel_type} • ${v.power}\n\n🇨🇳 Import direct Chine\n📱 WhatsApp pour plus d'infos\n\n${v.url}`,
        instagram: `${v.brand} ${v.model} ${v.year} 🚗\n${fmt(v.price_eur)}€ — Direct Chine 🇨🇳\n\n#drazono #${v.brand.toLowerCase()} #voiturechinoise #importauto`,
        whatsapp: `🚗 *${v.brand} ${v.model} ${v.year}*\n💰 ${fmt(v.price_eur)}€ | ${fmt(v.price_fcfa)} FCFA\n🇨🇳 Direct Chine\n👉 ${v.url}`,
        source: 'fallback',
      })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'Expert marketing automobile pour l\'Afrique de l\'Ouest. Contenu viral, authentique, orienté conversion. Réponds UNIQUEMENT en JSON valide, sans backticks ni texte autour.',
      messages: [{
        role: 'user',
        content: `Contenu marketing pour : ${v.brand} ${v.model} ${v.year}
Prix: ${fmt(v.price_eur)}€ / ${fmt(v.price_fcfa)} FCFA
État: ${v.condition === 'neuf' ? 'Neuf' : 'Occasion'} | ${v.fuel_type} | ${v.power}
Lien: ${v.url}
${v.description ? `Description: ${v.description.slice(0, 300)}` : ''}

JSON avec 4 clés : tiktok, facebook, instagram, whatsapp
Hashtags #drazono #voiturechinoise #importchine obligatoires.`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    const content = extractJSON(text)
    if (!content) {
      // Fallback on parse failure
      return NextResponse.json({
        tiktok: `🔥 ${v.brand} ${v.model} ${v.year} — ${fmt(v.price_eur)}€ direct Chine 🇨🇳\n#drazono #voiturechinoise`,
        facebook: `Nouveau : ${v.brand} ${v.model} ${v.year} à ${fmt(v.price_eur)}€ sur DRAZONO.\n${v.url}`,
        instagram: `${v.brand} ${v.model} — ${fmt(v.price_eur)}€ 🇨🇳\n#drazono #voiturechinoise`,
        whatsapp: `*${v.brand} ${v.model} ${v.year}* — ${fmt(v.price_eur)}€\n${v.url}`,
        source: 'fallback',
      })
    }

    // Cache result
    if (v.vehicleId) {
      const supabase = createAdminClient()
      await supabase
        .from('vehicles')
        .update({ social_posts_cache: content })
        .eq('id', v.vehicleId)
    }

    return NextResponse.json({ ...content, source: 'ai' })
  } catch (err) {
    console.error('[social/generate] Error:', err)
    const msg = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
