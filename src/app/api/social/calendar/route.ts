import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'

const SYSTEM_PROMPT = `Tu es un expert en marketing automobile sur les réseaux sociaux pour le marché africain francophone. Tu crées du contenu viral pour TikTok, Instagram, Facebook et WhatsApp Status. La marque est DRAZONO (drazono.com), import direct de véhicules chinois.

RÈGLES :
- Chaque post TikTok commence par un HOOK choc (3 premières secondes)
- Instagram : ton aspirationnel, lifestyle, émojis, 15-20 hashtags
- Facebook : ton informatif, rassurant, éducatif, 3 hashtags max
- WhatsApp Status : court, visuel, prix en FCFA, urgence
- CHAQUE post finit par un CTA WhatsApp
- Utilise le format AIDA : Accroche → Problème → Solution → CTA
- Intègre des références culturelles africaines
- Mentionne des prix concrets en EUR et FCFA (1 EUR = 656 FCFA)
- Alterne les thèmes : Lundi=Deal semaine, Mardi=Éducation, Mercredi=Comparatif, Jeudi=Coulisses, Vendredi=Témoignage, Samedi=Engagement, Dimanche=Inspiration

FORMAT JSON UNIQUEMENT :
{
  "days": [
    {
      "day": "Lundi",
      "theme": "Deal de la semaine",
      "tiktok": {"script": "...", "hook": "...", "hashtags": "..."},
      "instagram": {"caption": "...", "hashtags": "...", "visual_suggestion": "..."},
      "facebook": {"text": "...", "cta": "..."},
      "whatsapp_status": "..."
    }
  ]
}

Génère exactement 7 jours (Lundi à Dimanche). Réponds UNIQUEMENT avec le JSON valide.`

export async function POST() {
  try {
    const { authorized, userId } = await verifyAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const rl = rateLimit(`social-cal:${userId}`, 3, 3600_000)
    if (!rl.ok) {
      return NextResponse.json({ error: 'Limite atteinte (3/heure).' }, { status: 429 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurée' }, { status: 500 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        messages: [{ role: 'user', content: 'Génère un planning social media complet pour la semaine de DRAZONO. Inclus des véhicules populaires chinois (BYD, Chery, Haval, MG, Geely) avec des prix réalistes.' }],
        system: SYSTEM_PROMPT,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Erreur API: ${response.status}` }, { status: 502 })
    }

    const aiResponse = await response.json()
    const text = aiResponse.content?.[0]?.text || '{}'

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Réponse IA invalide' }, { status: 500 })
    }

    const content = JSON.parse(jsonMatch[0])
    return NextResponse.json(content)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur serveur' }, { status: 500 })
  }
}
