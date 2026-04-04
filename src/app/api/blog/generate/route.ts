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

const SYSTEM_PROMPT = `Tu es un expert en rédaction SEO spécialisé dans l'automobile et l'import de véhicules chinois pour l'Afrique de l'Ouest. Tu rédiges en français courant, naturel, jamais robotique. Ton ton est celui d'un conseiller de confiance qui connaît les réalités du terrain africain.

Tu écris pour DRAZONO (www.drazono.com), plateforme d'import direct de véhicules chinois (BYD, Chery, Geely, Haval, MG, NIO, Xpeng) sans intermédiaire. Support WhatsApp, livraison mondiale.

RÈGLES OBLIGATOIRES :
- Commence TOUJOURS par une histoire ou un fait choc, jamais par "Dans cet article"
- Utilise des prénoms africains dans les exemples (Moussa, Fatou, Kofi, Awa)
- Prix TOUJOURS en EUR ET en FCFA (1 EUR = 656 FCFA)
- Compare avec les prix européens/japonais pour montrer l'économie
- Paragraphes courts : max 4-5 lignes
- Au moins un tableau comparatif par article
- Inclus une section FAQ de 5 questions minimum
- Termine TOUJOURS par un CTA WhatsApp DRAZONO
- Sous-titres H2/H3 actionnables et spécifiques
- Mentionne l'avantage DRAZONO naturellement (zéro intermédiaire, prix usine, support WhatsApp)
- Adresse les objections (fiabilité, pièces détachées, garantie)
- Ajoute une section "Ce que les gens demandent sur WhatsApp" avec 3 vraies questions

FORMAT DE SORTIE JSON UNIQUEMENT :
{
  "title": "titre SEO 60 caractères max",
  "slug": "slug-url-optimise",
  "content": "contenu markdown complet avec H1 H2 H3 tableaux listes",
  "meta_description": "description SEO 155 caractères max",
  "keywords": ["mot-cle-1", "mot-cle-2"],
  "faq": [{"question": "...", "answer": "..."}],
  "suggested_articles": ["Titre article lié 1", "Titre article lié 2", "Titre article lié 3"]
}

Réponds UNIQUEMENT avec le JSON valide, sans aucun texte autour.`

const LENGTH_MAP = { short: '800', medium: '1500', long: '2500' }

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
      return NextResponse.json({ error: 'Limite atteinte (5/heure). Réessayez plus tard.' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides: ' + parsed.error.message }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurée dans les variables d\'environnement Vercel' }, { status: 500 })
    }

    const v = parsed.data
    const wordCount = LENGTH_MAP[v.length]

    const prompt = `Rédige un article de type "${v.articleType}" sur le sujet suivant :

Sujet : ${v.subject}
${v.keyword ? `Mot-clé principal SEO : ${v.keyword}` : ''}
Pays cible : ${v.country}
Longueur cible : environ ${wordCount} mots
${v.generateFaq ? 'Inclure une FAQ de 5-7 questions' : 'Pas de FAQ'}
${v.generateTable ? 'Inclure au moins un tableau comparatif détaillé' : ''}

Génère l'article complet au format JSON comme spécifié.`

    // Attempt 1
    let response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
        system: SYSTEM_PROMPT,
      }),
    })

    // Retry once on failure
    if (!response.ok) {
      console.log('[blog/generate] Attempt 1 failed:', response.status)
      await new Promise(r => setTimeout(r, 2000))
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
          system: SYSTEM_PROMPT,
        }),
      })
    }

    if (!response.ok) {
      const errBody = await response.text().catch(() => 'No response body')
      console.error('[blog/generate] Anthropic error:', response.status, errBody)
      return NextResponse.json({
        error: `Erreur API Anthropic (${response.status}). Vérifiez votre clé API et réessayez.`,
        details: errBody.slice(0, 300),
      }, { status: 502 })
    }

    const aiResponse = await response.json()
    const text = aiResponse.content?.[0]?.text

    if (!text) {
      console.error('[blog/generate] No text in response:', JSON.stringify(aiResponse).slice(0, 500))
      return NextResponse.json({ error: 'La réponse de l\'IA est vide. Réessayez.' }, { status: 500 })
    }

    // Find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[blog/generate] No JSON found in:', text.slice(0, 500))
      return NextResponse.json({ error: 'L\'IA n\'a pas retourné de JSON valide. Réessayez.' }, { status: 500 })
    }

    try {
      const content = JSON.parse(jsonMatch[0])
      return NextResponse.json(content)
    } catch (parseErr) {
      console.error('[blog/generate] JSON parse error:', parseErr)
      return NextResponse.json({ error: 'Erreur de parsing JSON. Réessayez.' }, { status: 500 })
    }
  } catch (err) {
    console.error('[blog/generate] Unexpected error:', err)
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Erreur serveur inattendue',
    }, { status: 500 })
  }
}
