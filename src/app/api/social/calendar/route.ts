import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api-auth'

export const maxDuration = 60

export async function POST() {
  try {
    const { authorized } = await verifyAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Clé API manquante' }, { status: 500 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: `Expert marketing auto réseaux sociaux Afrique. DRAZONO (www.drazono.com). Prix en EUR et FCFA. Tu dois répondre UNIQUEMENT avec un objet JSON valide. Ne mets PAS de backticks, pas de texte avant ou après. Commence directement par { et termine par }.`,
      messages: [{
        role: 'user',
        content: `Planning social 7 jours DRAZONO. Véhicules chinois (BYD, Chery, Haval, MG) prix réalistes. Format JSON: {"days":[{"day":"Lundi","theme":"...","tiktok":{"script":"...","hook":"...","hashtags":"..."},"instagram":{"caption":"...","hashtags":"...","visual_suggestion":"..."},"facebook":{"text":"...","cta":"..."},"whatsapp_status":"..."}]}. 7 jours Lundi à Dimanche.`,
      }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    console.log('[calendar] len:', text.length, 'stop:', msg.stop_reason)

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
      console.error('[calendar] parse failed, first 300:', text.substring(0, 300))
      return NextResponse.json({ error: 'Réponse IA invalide. Réessayez.' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error('[calendar] error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
