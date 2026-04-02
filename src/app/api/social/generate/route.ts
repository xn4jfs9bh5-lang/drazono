import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'

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
})

export async function POST(req: Request) {
  try {
    const { authorized, userId } = await verifyAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Rate limit: 10 generations/hour per admin
    const rl = rateLimit(`social:${userId}`, 10, 3600_000)
    if (!rl.ok) {
      return NextResponse.json({ error: 'Limite atteinte (10/heure). Réessayez plus tard.' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const v = parsed.data
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // Fallback: generate basic templates without AI
      return NextResponse.json({
        tiktok: `🔥 ${v.brand} ${v.model} ${v.year} à seulement ${new Intl.NumberFormat('fr-FR').format(v.price_eur)}€ ! Direct Chine, prix imbattable 🇨🇳\n\n#drazono #${v.brand.toLowerCase()} #voiturechinoise #importchine #voitureafrique`,
        facebook: `🚗 Nouveau sur DRAZONO !\n\n${v.brand} ${v.model} ${v.year} — ${v.condition === 'neuf' ? 'Neuf' : 'Occasion'}\n💰 ${new Intl.NumberFormat('fr-FR').format(v.price_eur)}€ (≈ ${new Intl.NumberFormat('fr-FR').format(v.price_fcfa)} FCFA)\n⚡ ${v.fuel_type} • ${v.power}\n\n${v.description ? v.description.slice(0, 200) : ''}\n\n🇨🇳 Import direct Chine — prix réel vendeur\n📱 Contactez-nous sur WhatsApp pour plus d'infos\n\n${v.url}`,
        instagram: `${v.brand} ${v.model} ${v.year} 🚗\n${new Intl.NumberFormat('fr-FR').format(v.price_eur)}€ — Direct Chine 🇨🇳\n\n#drazono #${v.brand.toLowerCase()} #voiturechinoise #importauto #voitureafrique #${v.fuel_type.toLowerCase()}`,
        whatsapp: `🚗 *${v.brand} ${v.model} ${v.year}*\n💰 ${new Intl.NumberFormat('fr-FR').format(v.price_eur)}€ | ${new Intl.NumberFormat('fr-FR').format(v.price_fcfa)} FCFA\n🇨🇳 Direct Chine\n👉 ${v.url}`,
        source: 'fallback',
      })
    }

    const prompt = `Génère du contenu marketing pour ce véhicule :
Marque: ${v.brand}
Modèle: ${v.model}
Année: ${v.year}
Prix: ${new Intl.NumberFormat('fr-FR').format(v.price_eur)}€ / ${new Intl.NumberFormat('fr-FR').format(v.price_fcfa)} FCFA
État: ${v.condition === 'neuf' ? 'Neuf' : 'Occasion'}
Carburant: ${v.fuel_type}
Puissance: ${v.power}
Lien: ${v.url}
${v.description ? `Description: ${v.description.slice(0, 300)}` : ''}

Génère exactement 4 formats en JSON :
{
  "tiktok": "(max 150 chars + hashtags, accroche choc sur le prix)",
  "facebook": "(300-500 chars, détaillé, CTA WhatsApp)",
  "instagram": "(max 200 chars + hashtags ciblés)",
  "whatsapp": "(max 200 chars, court et percutant avec lien)"
}

Inclus toujours les hashtags #drazono #voiturechinoise #importchine.
Réponds UNIQUEMENT avec le JSON, sans aucun texte autour.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        system: 'Tu es un expert en marketing automobile pour l\'Afrique de l\'Ouest et la diaspora africaine. Tu crées du contenu viral, authentique et orienté conversion. Ton ton est dynamique, professionnel et accessible. Réponds toujours en JSON valide uniquement.',
      }),
    })

    if (!response.ok) {
      // Fallback to basic templates
      return NextResponse.json({
        tiktok: `🔥 ${v.brand} ${v.model} ${v.year} — ${new Intl.NumberFormat('fr-FR').format(v.price_eur)}€ direct Chine 🇨🇳\n#drazono #voiturechinoise`,
        facebook: `Nouveau : ${v.brand} ${v.model} ${v.year} à ${new Intl.NumberFormat('fr-FR').format(v.price_eur)}€ sur DRAZONO. Import direct Chine.\n${v.url}`,
        instagram: `${v.brand} ${v.model} — ${new Intl.NumberFormat('fr-FR').format(v.price_eur)}€ 🇨🇳\n#drazono #voiturechinoise`,
        whatsapp: `*${v.brand} ${v.model} ${v.year}* — ${new Intl.NumberFormat('fr-FR').format(v.price_eur)}€\n${v.url}`,
        source: 'fallback',
      })
    }

    const aiResponse = await response.json()
    const text = aiResponse.content?.[0]?.text || '{}'

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Réponse IA invalide' }, { status: 500 })
    }

    const content = JSON.parse(jsonMatch[0])
    return NextResponse.json({ ...content, source: 'ai' })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
