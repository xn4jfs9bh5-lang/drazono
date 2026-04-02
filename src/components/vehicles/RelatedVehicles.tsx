'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Vehicle } from '@/lib/types'
import VehicleCard from '@/components/vehicles/VehicleCard'

export default function RelatedVehicles({ limit = 2 }: { limit?: number }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'disponible')
        .order('views_count', { ascending: false })
        .limit(limit)
      setVehicles(data ?? [])
    }
    fetch()
  }, [limit])

  if (vehicles.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {vehicles.map(v => (
        <VehicleCard key={v.id} vehicle={v} />
      ))}
    </div>
  )
}
