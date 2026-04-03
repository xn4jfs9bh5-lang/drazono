'use client'

import { useEffect, useState } from 'react'
import type { Vehicle } from '@/lib/types'
import VehicleCard from '@/components/vehicles/VehicleCard'
import { Sparkles } from 'lucide-react'

export default function RecommendedVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/recommendations')
        if (!res.ok) return
        const data = await res.json()
        setVehicles(data.vehicles ?? [])
        setReason(data.reason ?? '')
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || vehicles.length === 0) return null

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-brand-500" />
        <h2 className="text-lg font-bold text-[#111827]">Vehicules recommandes pour vous</h2>
      </div>
      {reason && (
        <p className="text-sm text-gray-600 mb-4">{reason}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map(v => (
          <VehicleCard key={v.id} vehicle={v} />
        ))}
      </div>
    </div>
  )
}
