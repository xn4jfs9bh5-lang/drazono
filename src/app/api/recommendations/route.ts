import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() { /* read-only */ },
        },
      }
    )

    const { data: { user } } = await supabaseAuth.auth.getUser()
    const supabase = createAdminClient()

    if (user) {
      // Check if user has favorites
      const { data: favs } = await supabase
        .from('favorites')
        .select('vehicle_id')
        .eq('user_id', user.id)
        .limit(5)

      if (favs && favs.length > 0) {
        // Get favorite vehicle details for content-based filtering
        const favIds = favs.map(f => f.vehicle_id)
        const { data: seeds } = await supabase
          .from('vehicles')
          .select('brand, body_type, fuel_type, price_eur')
          .in('id', favIds)

        if (seeds && seeds.length > 0) {
          // Find similar vehicles not in favorites
          const brands = Array.from(new Set(seeds.map(s => s.brand)))
          const bodyTypes = Array.from(new Set(seeds.map(s => s.body_type)))

          const { data: candidates } = await supabase
            .from('vehicles')
            .select('*')
            .eq('status', 'disponible')
            .not('id', 'in', `(${favIds.join(',')})`)
            .or(`brand.in.(${brands.join(',')}),body_type.in.(${bodyTypes.join(',')})`)
            .order('created_at', { ascending: false })
            .limit(6)

          return NextResponse.json({
            vehicles: candidates ?? [],
            source: 'favorites',
            reason: 'Base sur vos favoris',
          })
        }
      }

      // Fallback: top vehicles by views for authenticated users
      const { data: popular } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'disponible')
        .order('views_count', { ascending: false })
        .limit(6)

      return NextResponse.json({
        vehicles: popular ?? [],
        source: 'views',
        reason: 'Les plus populaires',
      })
    }

    // Not authenticated: recent vehicles
    const { data: recent } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'disponible')
      .order('created_at', { ascending: false })
      .limit(6)

    return NextResponse.json({
      vehicles: recent ?? [],
      source: 'recent',
      reason: 'Nouveautes',
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
