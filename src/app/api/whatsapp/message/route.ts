import { NextResponse } from 'next/server'
import { z } from 'zod'
import { WHATSAPP_NUMBER } from '@/lib/constants'
import { createAdminClient } from '@/lib/supabase-server'

const schema = z.object({
  type: z.enum(['info', 'transport', 'conseil', 'urgence']),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  price: z.number().optional(),
  vehicleId: z.string().optional(),
  country: z.string().optional(),
  budget: z.number().optional(),
  bodyType: z.string().optional(),
  sessionId: z.string().optional(),
})

const templates: Record<string, (v: z.infer<typeof schema>) => string> = {
  info: (v) =>
    `Bonjour Brayann 👋 Je viens de voir le ${v.brand || ''} ${v.model || ''} ${v.year || ''} à ${v.price ? new Intl.NumberFormat('fr-FR').format(v.price) + '€' : ''} sur DRAZONO. Est-il encore disponible ? Je souhaite avoir plus d'infos sur l'état et les options.`,
  transport: (v) =>
    `Bonjour Brayann, je suis intéressé par le ${v.brand || ''} ${v.model || ''} sur DRAZONO. Pouvez-vous me faire un devis complet transport + dédouanement vers ${v.country || '[pays]'} ? Merci`,
  conseil: (v) =>
    `Bonjour, j'ai un budget de ${v.budget ? new Intl.NumberFormat('fr-FR').format(v.budget) + '€' : '[budget]'} et cherche un ${v.bodyType || 'véhicule'}. Quelles sont vos meilleures recommandations actuellement ?`,
  urgence: (v) =>
    `Bonjour Brayann 🔥 Le ${v.brand || ''} ${v.model || ''} ${v.year || ''} m'intéresse beaucoup ! Est-il encore disponible ? Je veux avancer rapidement.`,
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const data = parsed.data
    const template = templates[data.type]
    const message = template(data)
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

    // Track the click
    if (data.sessionId) {
      const supabase = createAdminClient()
      await supabase.from('analytics_events').insert({
        event_type: 'whatsapp_click',
        vehicle_id: data.vehicleId || null,
        session_id: data.sessionId,
        page: data.vehicleId ? `/vehicule/${data.vehicleId}` : null,
      }).then()
    }

    return NextResponse.json({ url, message })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
