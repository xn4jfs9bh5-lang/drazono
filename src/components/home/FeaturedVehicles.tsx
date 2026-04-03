'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Rocket, Bell } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import VehicleCard from '@/components/vehicles/VehicleCard'
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton'
import { supabase } from '@/lib/supabase'
import type { Vehicle } from '@/lib/types'

export default function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('featured', true)
        .eq('status', 'disponible')
        .order('created_at', { ascending: false })
        .limit(4)
      setVehicles(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
              Véhicules à la une
            </h2>
            <Link
              href="/catalogue"
              className="text-brand-500 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1 transition-colors"
            >
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
          </div>
        ) : vehicles.length === 0 ? (
          <FadeIn>
            <div className="text-center py-16 bg-[#FAFAFA] rounded-2xl border border-gray-100">
              <Rocket className="w-12 h-12 text-brand-500/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#111827] mb-2">
                Nouveaux véhicules bientôt disponibles
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                Notre catalogue est en cours de mise à jour. Inscrivez-vous pour être alerté en premier.
              </p>
              <a href="#newsletter" className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-brand-600 transition-colors">
                <Bell className="w-4 h-4" />
                M&apos;alerter des nouveautés
              </a>
            </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((vehicle, i) => (
              <FadeIn key={vehicle.id} delay={i * 0.1}>
                <VehicleCard vehicle={vehicle} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
