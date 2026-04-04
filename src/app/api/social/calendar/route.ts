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
      max_tokens: 4096,
      system: `Expert marketing auto réseaux sociaux Afrique. DRAZONO (www.drazono.com). Prix en EUR et FCFA. Tu dois répondre UNIQUEMENT avec un objet JSON valide. Ne mets PAS de backticks, pas de texte avant ou après. Commence directement par { et termine par }.`,
      messages: [{
        role: 'user',
        content: `Planning social 7 jours DRAZONO. Véhicules chinois (BYD, Chery, Haval, MG) prix réalistes. Format JSON: {"days":[{"day":"Lundi","theme":"...","tiktok":{"script":"...","hook":"...","hashtags":"..."},"instagram":{"caption":"...","hashtags":"...","visual_suggestion":"..."},"facebook":{"text":"...","cta":"..."},"whatsapp_status":"..."}]}. 7 jours Lundi à Dimanche.`,
      }],
    })

    stream.on('text', (text) => { fullText += text })
    await stream.finalMessage()

    console.log('[calendar] len:', fullText.length)

    let result
    try { result = JSON.parse(fullText) } catch {
      const m = fullText.match(/\{[\s\S]*\}/)
      if (m) try { result = JSON.parse(m[0]) } catch { /* */ }
    }

    if (!result) {
      console.error('[calendar] parse fail:', fullText.substring(0, 300))
      return NextResponse.json({ error: 'Génération échouée, réessayez.' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur'
    console.error('[calendar] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
