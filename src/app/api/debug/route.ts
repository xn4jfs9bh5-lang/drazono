import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasKey: !!process.env.ANTHROPIC_API_KEY,
    keyStart: process.env.ANTHROPIC_API_KEY?.substring(0, 15) || 'MISSING',
    nodeVersion: process.version,
    env: process.env.NODE_ENV,
  })
}
