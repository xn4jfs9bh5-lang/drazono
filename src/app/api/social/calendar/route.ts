import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const client = new Anthropic()

export async function POST() {
  try {
    let fullText = ''
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `Marketing auto Afrique. DRAZONO (www.drazono.com). Prix EUR+FCFA. JSON valide uniquement, pas de backticks. Commence par { termine par }.`,
      messages: [{
        role: 'user',
        content: `7 posts réseaux sociaux DRAZONO, 1 par jour lun-dim. Alterne TikTok/Instagram/Facebook/WhatsApp. Véhicules chinois BYD Chery Haval MG prix réels. JSON: {"days":[{"day":"Lundi","platform":"TikTok","theme":"Deal","content":"texte max 200 chars","hashtags":"#drazono"}]}`,
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
