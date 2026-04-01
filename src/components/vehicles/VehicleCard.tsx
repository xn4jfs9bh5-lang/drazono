'use client'

import Link from 'next/link'
import { Heart, Fuel, Calendar, Gauge } from 'lucide-react'
import { Vehicle } from '@/lib/types'
import { motion } from 'framer-motion'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price)
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const conditionBadge = vehicle.condition === 'neuf'
    ? { label: 'Neuf', bg: 'bg-emerald-100 text-emerald-700' }
    : { label: 'Occasion', bg: 'bg-amber-100 text-amber-700' }

  const statusBadge = vehicle.status === 'vendu'
    ? { label: 'Vendu', bg: 'bg-red-100 text-red-700' }
    : vehicle.status === 'réservé'
    ? { label: 'Réservé', bg: 'bg-orange-100 text-orange-700' }
    : null

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/vehicule/${vehicle.id}`} className="block group">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-gray-400 text-sm">{vehicle.brand} {vehicle.model}</span>
            </div>

            {/* Badges top */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${conditionBadge.bg}`}>
                {conditionBadge.label}
              </span>
              {statusBadge && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              )}
            </div>

            {/* Badges bottom */}
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                Vérifié DRAZONO ✓
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700">
                🇨🇳 Direct Chine
              </span>
            </div>

            {/* Favorite */}
            <button
              className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
              onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
              aria-label="Ajouter aux favoris"
            >
              <Heart className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-semibold text-[#111827] text-base group-hover:text-[#2563EB] transition-colors">
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </h3>
            <p className="text-lg font-bold text-[#2563EB] mt-1">
              {formatPrice(vehicle.price_eur)} €
            </p>
            <p className="text-xs text-gray-500">
              ≈ {formatPrice(vehicle.price_fcfa)} FCFA
            </p>

            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {vehicle.year}
              </span>
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5" />
                {vehicle.mileage === 0 ? '0 km' : `${formatPrice(vehicle.mileage)} km`}
              </span>
              <span className="flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5" />
                {vehicle.fuel_type}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
