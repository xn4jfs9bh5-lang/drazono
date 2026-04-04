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

IMPORTANT: Réponds UNIQUEMENT avec le JSON demandé. Pas de texte avant, pas de texte après, pas de backticks. Juste le JSON brut.

Format 7 jours :
{"days":[{"day":"Lundi","theme":"...","tiktok":{"script":"...","hook":"...","hashtags":"..."},"instagram":{"caption":"...","hashtags":"...","visual_suggestion":"..."},"facebook":{"text":"...","cta":"..."},"whatsapp_status":"..."}]}`

async function streamAnthropic(apiKey: string, system: string, userPrompt: string, signal: AbortSignal): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      stream: true,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    }),
    signal,
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`Anthropic ${response.status}: ${errBody.slice(0, 200)}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        if (parsed.type === 'content_block_delta') {
          fullText += parsed.delta?.text || ''
        }
      } catch { /* skip malformed SSE lines */ }
    }
  }

  return fullText
}

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
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurée' }, { status: 500 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 55000)

    let fullText: string
    try {
      fullText = await streamAnthropic(
        apiKey,
        SYSTEM_PROMPT,
        'Planning social DRAZONO semaine complète. Véhicules chinois populaires (BYD, Chery, Haval, MG) avec prix réalistes. Posts courts et percutants. JSON uniquement.',
        controller.signal,
      )
    } finally {
      clearTimeout(timeout)
    }

    console.log('[social/calendar] Raw text length:', fullText.length)
    console.log('[social/calendar] First 200 chars:', fullText.substring(0, 200))
    console.log('[social/calendar] Last 200 chars:', fullText.substring(fullText.length - 200))

    if (!fullText) {
      return NextResponse.json({ error: 'Réponse IA vide.' }, { status: 500 })
    }

    const result = extractJSON(fullText)
    if (!result) {
      console.error('[social/calendar] Failed to parse. Text:', fullText.substring(0, 500))
      return NextResponse.json({ error: 'JSON invalide. Réessayez.' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur'
    console.error('[social/calendar] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
