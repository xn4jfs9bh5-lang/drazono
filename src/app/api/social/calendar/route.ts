import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

const SYSTEM_PROMPT = `Tu es un expert en marketing automobile sur les réseaux sociaux pour le marché africain francophone. Tu crées du contenu viral pour TikTok, Instagram, Facebook et WhatsApp Status. La marque est DRAZONO (www.drazono.com), import direct de véhicules chinois.

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
    const apiKey = process.env.ANTHROPIC_API_KEY
    console.log('[social/calendar] API Key present:', !!apiKey)

    const { authorized, userId } = await verifyAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const rl = rateLimit(`social-cal:${userId}`, 3, 3600_000)
    if (!rl.ok) {
      return NextResponse.json({ error: 'Limite atteinte (3/heure).' }, { status: 429 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurée dans les variables d\'environnement Vercel' }, { status: 500 })
    }

    const requestBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content: 'Génère un planning social media complet pour la semaine de DRAZONO. Inclus des véhicules populaires chinois (BYD, Chery, Haval, MG, Geely) avec des prix réalistes. Le site est www.drazono.com.' }],
      system: SYSTEM_PROMPT,
    }

    // Attempt 1
    let response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    })

    // Retry once on failure
    if (!response.ok) {
      console.log('[social/calendar] Attempt 1 failed:', response.status)
      await new Promise(r => setTimeout(r, 2000))
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      })
    }

    if (!response.ok) {
      const errBody = await response.text().catch(() => 'No response body')
      console.error('[social/calendar] Anthropic error:', response.status, errBody)
      return NextResponse.json({
        error: `Erreur API Anthropic (${response.status}). Vérifiez votre clé API.`,
        details: errBody.slice(0, 300),
      }, { status: 502 })
    }

    const aiResponse = await response.json()
    const text = aiResponse.content?.[0]?.text

    if (!text) {
      console.error('[social/calendar] No text in response:', JSON.stringify(aiResponse).slice(0, 500))
      return NextResponse.json({ error: 'La réponse de l\'IA est vide. Réessayez.' }, { status: 500 })
    }

    // Find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[social/calendar] No JSON found in:', text.slice(0, 500))
      return NextResponse.json({ error: 'L\'IA n\'a pas retourné de JSON valide. Réessayez.' }, { status: 500 })
    }

    try {
      const content = JSON.parse(jsonMatch[0])
      return NextResponse.json(content)
    } catch (parseErr) {
      console.error('[social/calendar] JSON parse error:', parseErr)
      return NextResponse.json({ error: 'Erreur de parsing JSON. Réessayez.' }, { status: 500 })
    }
  } catch (err) {
    console.error('[social/calendar] Unexpected error:', err)
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Erreur serveur inattendue',
    }, { status: 500 })
  }
}
