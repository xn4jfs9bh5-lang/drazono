import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { articleType, subject, keyword, country } = await req.json()
    if (!subject) return NextResponse.json({ error: 'Sujet requis' }, { status: 400 })

    let fullText = ''
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `Rédacteur SEO auto DRAZONO (www.drazono.com), import véhicules chinois Afrique. Prix EUR+FCFA. Réponds UNIQUEMENT en JSON valide, pas de backticks. Commence par { termine par }.`,
      messages: [{
        role: 'user',
        content: `Article court (500 mots) type "${articleType || 'guide'}" sur: ${subject}. ${keyword ? 'SEO: ' + keyword : ''} Pays: ${country || 'Général'}. JSON: {"title":"max 60 chars","slug":"url-slug","content":"markdown 500 mots","meta_description":"max 155 chars"}`,
      }],
    })

    stream.on('text', (t) => { fullText += t })
    await stream.finalMessage()

    let result
    try { result = JSON.parse(fullText) } catch {
      const m = fullText.match(/\{[\s\S]*\}/)
      if (m) try { result = JSON.parse(m[0]) } catch { /* */ }
    }

    if (!result) return NextResponse.json({ error: 'Génération échouée, réessayez.' }, { status: 500 })
    return NextResponse.json(result)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur serveur'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
