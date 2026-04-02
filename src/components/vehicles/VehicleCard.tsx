'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Fuel, Calendar, Gauge, Eye, Car } from 'lucide-react'
import { Vehicle } from '@/lib/types'
import { EUR_TO_FCFA } from '@/lib/constants'
import { motion } from 'framer-motion'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price)
}

function isNew(createdAt: string): boolean {
  const diff = Date.now() - new Date(createdAt).getTime()
  return diff < 7 * 24 * 60 * 60 * 1000
}

function pseudoRandom(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 100
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

  const isPopular = vehicle.views_count > 10
  const isRecent = isNew(vehicle.created_at)
  const showLastUnit = pseudoRandom(vehicle.id) < 30

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/vehicule/${vehicle.id}`} className="block group">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
          {/* Image */}
          <div className="relative h-56 bg-gray-100 overflow-hidden">
            {vehicle.images?.[0] ? (
              <Image
                src={vehicle.images[0]}
                alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                <Car className="w-10 h-10 text-gray-300 mb-1" />
                <span className="text-gray-400 text-xs">{vehicle.brand} {vehicle.model}</span>
              </div>
            )}

            {/* Badges top-left */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${conditionBadge.bg}`}>
                {conditionBadge.label}
              </span>
              {statusBadge && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              )}
              {isRecent && !statusBadge && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                  Nouveau
                </span>
              )}
              {isPopular && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                  Populaire
                </span>
              )}
            </div>

            {/* Badge top-right: last unit */}
            {showLastUnit && vehicle.status === 'disponible' && (
              <div className="absolute top-3 right-12">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-500 text-white">
                  Dernière unité
                </span>
              </div>
            )}

            {/* Favorite */}
            <button
              className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
              onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
              aria-label="Ajouter aux favoris"
            >
              <Heart className="w-4 h-4 text-gray-600" />
            </button>

            {/* Views + bottom badge */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700">
                  Vérifié DRAZONO
                </span>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {vehicle.views_count}
              </span>
            </div>
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
              ≈ {formatPrice(vehicle.price_fcfa || vehicle.price_eur * EUR_TO_FCFA)} FCFA
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
