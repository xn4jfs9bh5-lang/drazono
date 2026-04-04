import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'
import { extractJSON } from '@/lib/extract-json'

export const maxDuration = 60

const SYSTEM_PROMPT = `Expert marketing auto réseaux sociaux, marché africain francophone. Marque : DRAZONO (www.drazono.com), import direct véhicules chinois.

RÈGLES :
- TikTok : HOOK choc en 3 sec + script court
- Instagram : lifestyle, émojis, 15 hashtags
- Facebook : informatif, rassurant, 3 hashtags max
- WhatsApp Status : court, prix FCFA, urgence
- CTA WhatsApp sur chaque post
- Prix en EUR et FCFA (1 EUR = 656 FCFA)
- Thèmes : Lun=Deal, Mar=Éducation, Mer=Comparatif, Jeu=Coulisses, Ven=Témoignage, Sam=Engagement, Dim=Inspiration

IMPORTANT: Réponds UNIQUEMENT avec du JSON valide. Aucun texte avant ou après. Aucun backtick. Juste le JSON brut.

Format 7 jours :
{"days":[{"day":"Lundi","theme":"...","tiktok":{"script":"...","hook":"...","hashtags":"..."},"instagram":{"caption":"...","hashtags":"...","visual_suggestion":"..."},"facebook":{"text":"...","cta":"..."},"whatsapp_status":"..."}]}`

export async function POST() {
  try {
    console.log('[social/calendar] API Key present:', !!process.env.ANTHROPIC_API_KEY)

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurée' }, { status: 500 })
    }

    const { authorized, userId } = await verifyAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const rl = rateLimit(`social-cal:${userId}`, 3, 3600_000)
    if (!rl.ok) {
      return NextResponse.json({ error: 'Limite atteinte (3/heure).' }, { status: 429 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: 'Planning social DRAZONO semaine complète. Véhicules chinois populaires (BYD, Chery, Haval, MG) avec prix réalistes. Posts courts et percutants. JSON uniquement.',
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    console.log('[social/calendar] Response length:', text.length)
    console.log('[social/calendar] First 200:', text.substring(0, 200))

    if (!text) {
      return NextResponse.json({ error: 'Réponse IA vide.' }, { status: 500 })
    }

    const result = extractJSON(text)
    if (!result) {
      console.error('[social/calendar] Failed to parse:', text.substring(0, 500))
      return NextResponse.json({ error: 'JSON invalide. Réessayez.', debug: text.substring(0, 300) }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[social/calendar] Error:', err)
    const msg = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
