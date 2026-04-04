import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { articleType, subject, keyword, country, length: len, generateFaq, generateTable } = await req.json()
    if (!subject) return NextResponse.json({ error: 'Sujet requis' }, { status: 400 })

    const words = len === 'short' ? 800 : len === 'long' ? 2500 : 1500

    let fullText = ''
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: `Rédacteur SEO automobile pour DRAZONO (www.drazono.com), import véhicules chinois Afrique. Prix en EUR et FCFA. Prénoms africains. Paragraphes courts. Tu dois répondre UNIQUEMENT avec un objet JSON valide. Ne mets PAS de backticks, pas de texte avant ou après. Commence directement par { et termine par }.`,
      messages: [{
        role: 'user',
        content: `Écris un article "${articleType || 'guide'}" sur: ${subject}. ${keyword ? 'Mot-clé: ' + keyword + '.' : ''} Pays: ${country || 'Général'}. ${words} mots. ${generateFaq !== false ? 'Inclus FAQ.' : ''} ${generateTable !== false ? 'Inclus tableau comparatif.' : ''} Format JSON: {"title":"...","slug":"...","content":"markdown","meta_description":"...","keywords":["..."],"faq":[{"question":"...","answer":"..."}],"suggested_articles":["..."]}.`,
      }],
    })

    stream.on('text', (text) => { fullText += text })
    await stream.finalMessage()

    console.log('[blog] len:', fullText.length)

    let result
    try { result = JSON.parse(fullText) } catch {
      const m = fullText.match(/\{[\s\S]*\}/)
      if (m) try { result = JSON.parse(m[0]) } catch { /* */ }
    }

    if (!result) {
      console.error('[blog] parse fail:', fullText.substring(0, 300))
      return NextResponse.json({ error: 'Génération échouée, réessayez.' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur'
    console.error('[blog] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
