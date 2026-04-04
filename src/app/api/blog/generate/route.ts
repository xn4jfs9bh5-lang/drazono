import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

const schema = z.object({
  articleType: z.string(),
  subject: z.string().min(3).max(300),
  keyword: z.string().max(200).optional(),
  country: z.string(),
  length: z.enum(['short', 'medium', 'long']),
  generateFaq: z.boolean(),
  generateTable: z.boolean(),
})

const SYSTEM_PROMPT = `Expert SEO automobile, import véhicules chinois pour l'Afrique de l'Ouest. Rédige pour DRAZONO (www.drazono.com), import direct sans intermédiaire.

RÈGLES :
- Commence par une histoire ou fait choc, jamais "Dans cet article"
- Prénoms africains (Moussa, Fatou, Kofi, Awa)
- Prix en EUR ET FCFA (1 EUR = 656 FCFA)
- Paragraphes courts (4-5 lignes max)
- Tableau comparatif obligatoire
- FAQ 5 questions minimum
- CTA WhatsApp DRAZONO à la fin
- Mentionne : zéro intermédiaire, prix usine, support WhatsApp

JSON UNIQUEMENT :
{"title":"...","slug":"...","content":"markdown complet","meta_description":"155 chars max","keywords":["..."],"faq":[{"question":"...","answer":"..."}],"suggested_articles":["...","...","..."]}`

const LENGTH_MAP = { short: '800', medium: '1500', long: '2500' }

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

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    console.log('[blog/generate] API Key present:', !!apiKey)

    const { authorized, userId } = await verifyAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const rl = rateLimit(`blog:${userId}`, 5, 3600_000)
    if (!rl.ok) {
      return NextResponse.json({ error: 'Limite atteinte (5/heure).' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurée' }, { status: 500 })
    }

    const v = parsed.data
    const wordCount = LENGTH_MAP[v.length]

    const prompt = `Article "${v.articleType}" — Sujet : ${v.subject}
${v.keyword ? `SEO : ${v.keyword}` : ''}
Pays : ${v.country} | ~${wordCount} mots
${v.generateFaq ? 'Avec FAQ' : 'Sans FAQ'} | ${v.generateTable ? 'Avec tableau' : 'Sans tableau'}
Réponds en JSON uniquement.`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 55000)

    let fullText: string
    try {
      fullText = await streamAnthropic(apiKey, SYSTEM_PROMPT, prompt, controller.signal)
    } finally {
      clearTimeout(timeout)
    }

    if (!fullText) {
      return NextResponse.json({ error: 'Réponse IA vide. Réessayez.' }, { status: 500 })
    }

    const jsonMatch = fullText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[blog/generate] No JSON in:', fullText.slice(0, 300))
      return NextResponse.json({ error: 'Pas de JSON dans la réponse IA.' }, { status: 500 })
    }

    try {
      return NextResponse.json(JSON.parse(jsonMatch[0]))
    } catch {
      return NextResponse.json({ error: 'JSON invalide dans la réponse.' }, { status: 500 })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur'
    console.error('[blog/generate] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
