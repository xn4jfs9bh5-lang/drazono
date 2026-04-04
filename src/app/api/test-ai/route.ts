import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function GET() {
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: 'Réponds uniquement avec ce JSON: {"test": "ok"}',
      }],
    })

    const text = message.content[0].type === 'text'
      ? message.content[0].text : 'no text'

    return NextResponse.json({
      success: true,
      rawText: text,
      stopReason: message.stop_reason,
      model: message.model,
    })
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number; constructor?: { name?: string } }
    return NextResponse.json({
      success: false,
      error: err.message || 'Unknown error',
      status: err.status,
      type: err.constructor?.name,
    }, { status: 500 })
  }
}
