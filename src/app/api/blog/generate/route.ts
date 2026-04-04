import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api-auth'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { authorized } = await verifyAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Clé API manquante' }, { status: 500 })
    }

    const body = await req.json()
    const { articleType, subject, keyword, country, length: len, generateFaq, generateTable } = body

    if (!subject) {
      return NextResponse.json({ error: 'Sujet requis' }, { status: 400 })
    }

    const words = len === 'short' ? 800 : len === 'long' ? 2500 : 1500
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: `Rédacteur SEO automobile pour DRAZONO (www.drazono.com), import véhicules chinois Afrique. Prix en EUR et FCFA. Prénoms africains. Paragraphes courts. Tu dois répondre UNIQUEMENT avec un objet JSON valide. Ne mets PAS de backticks, pas de texte avant ou après. Commence directement par { et termine par }.`,
      messages: [{
        role: 'user',
        content: `Écris un article "${articleType || 'guide'}" sur: ${subject}. ${keyword ? 'Mot-clé: ' + keyword + '.' : ''} Pays: ${country || 'Général'}. ${words} mots. ${generateFaq !== false ? 'Inclus FAQ.' : ''} ${generateTable !== false ? 'Inclus tableau comparatif.' : ''} Format JSON: {"title":"...","slug":"...","content":"markdown","meta_description":"...","keywords":["..."],"faq":[{"question":"...","answer":"..."}],"suggested_articles":["..."]}.`,
      }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    console.log('[blog] len:', text.length, 'stop:', msg.stop_reason)

    let result
    try {
      result = JSON.parse(text)
    } catch {
      const m = text.match(/\{[\s\S]*\}/)
      if (m) {
        try { result = JSON.parse(m[0]) } catch { /* fall through */ }
      }
    }

    if (!result) {
      console.error('[blog] parse failed, first 300:', text.substring(0, 300))
      return NextResponse.json({ error: 'Réponse IA invalide. Réessayez.' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error('[blog] error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
