import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'
import { extractJSON } from '@/lib/extract-json'

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

IMPORTANT: Réponds UNIQUEMENT avec du JSON valide. Aucun texte avant ou après. Aucun backtick. Juste le JSON brut.

Format :
{"title":"...","slug":"...","content":"markdown complet","meta_description":"155 chars max","keywords":["..."],"faq":[{"question":"...","answer":"..."}],"suggested_articles":["...","...","..."]}`

const LENGTH_MAP = { short: '800', medium: '1500', long: '2500' }

export async function POST(req: Request) {
  try {
    console.log('[blog/generate] API Key present:', !!process.env.ANTHROPIC_API_KEY)

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurée' }, { status: 500 })
    }

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

    const v = parsed.data
    const wordCount = LENGTH_MAP[v.length]

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Article "${v.articleType}" — Sujet : ${v.subject}
${v.keyword ? `SEO : ${v.keyword}` : ''}
Pays : ${v.country} | ~${wordCount} mots
${v.generateFaq ? 'Avec FAQ' : 'Sans FAQ'} | ${v.generateTable ? 'Avec tableau' : 'Sans tableau'}
Réponds en JSON uniquement.`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    console.log('[blog/generate] Response length:', text.length)
    console.log('[blog/generate] First 200:', text.substring(0, 200))

    if (!text) {
      return NextResponse.json({ error: 'Réponse IA vide. Réessayez.' }, { status: 500 })
    }

    const result = extractJSON(text)
    if (!result) {
      console.error('[blog/generate] Failed to parse:', text.substring(0, 500))
      return NextResponse.json({ error: 'JSON invalide. Réessayez.', debug: text.substring(0, 300) }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[blog/generate] Error:', err)
    const msg = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
