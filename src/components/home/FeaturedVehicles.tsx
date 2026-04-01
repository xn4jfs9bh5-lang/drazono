'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import VehicleCard from '@/components/vehicles/VehicleCard'
import { MOCK_VEHICLES } from '@/lib/mock-data'

export default function FeaturedVehicles() {
  const featured = MOCK_VEHICLES.filter(v => v.featured).slice(0, 4)

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
              className="text-[#2563EB] hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1 transition-colors"
            >
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((vehicle, i) => (
            <FadeIn key={vehicle.id} delay={i * 0.1}>
              <VehicleCard vehicle={vehicle} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
