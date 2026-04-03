'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Fuel, Calendar, Gauge, Eye, Car, Ship } from 'lucide-react'
import { Vehicle } from '@/lib/types'
import { EUR_TO_FCFA } from '@/lib/constants'

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
    ? { label: 'Neuf', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
    : { label: 'Occasion', className: 'bg-amber-50 text-amber-700 border border-amber-200' }

  const statusBadge = vehicle.status === 'vendu'
    ? { label: 'Vendu', className: 'bg-gray-100 text-gray-500 border border-gray-200' }
    : vehicle.status === 'réservé'
    ? { label: 'Réservé', className: 'bg-blue-50 text-blue-700 border border-blue-200' }
    : null

  const isPopular = vehicle.views_count > 10
  const isRecent = isNew(vehicle.created_at)
  const showLastUnit = pseudoRandom(vehicle.id) < 30

  return (
    <Link href={`/vehicule/${vehicle.id}`} className="block group">
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
        {/* Image — 4:3 ratio */}
        <div className="relative aspect-[4/3] bg-gray-100 rounded-t-2xl overflow-hidden">
          {vehicle.images?.[0] ? (
            <Image
              src={vehicle.images[0]}
              alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
              fill
              className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
              <Car className="w-10 h-10 text-gray-300 mb-1" />
              <span className="text-gray-400 text-xs">{vehicle.brand} {vehicle.model}</span>
            </div>
          )}

          {/* Dark gradient overlay at bottom of photo */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${conditionBadge.className}`}>
              {conditionBadge.label}
            </span>
            {statusBadge && (
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            )}
            {isRecent && !statusBadge && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 backdrop-blur-sm">
                Nouveau
              </span>
            )}
            {isPopular && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 backdrop-blur-sm">
                Populaire
              </span>
            )}
          </div>

          {/* Badge top-right: last unit */}
          {showLastUnit && vehicle.status === 'disponible' && (
            <div className="absolute top-3 right-12">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-500 text-white">
                Dernière unité
              </span>
            </div>
          )}

          {/* Favorite */}
          <button
            className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
            aria-label="Ajouter aux favoris"
          >
            <Heart className="w-4 h-4 text-gray-600" />
          </button>

          {/* Views at bottom-right of photo */}
          <div className="absolute bottom-3 right-3">
            <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/90 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {vehicle.views_count}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[#111827] text-[15px] leading-snug group-hover:text-brand-500 transition-colors">
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-drazono-red text-white shadow-sm shrink-0 mt-0.5">
              <Ship className="w-3 h-3" />
              Direct Chine
            </span>
          </div>

          {/* Price */}
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900 tracking-[-0.02em]">
              {formatPrice(vehicle.price_eur)} &euro;
            </p>
            <p className="text-sm font-semibold text-amber-600">
              ≈ {formatPrice(vehicle.price_fcfa || vehicle.price_eur * EUR_TO_FCFA)} FCFA
            </p>
            <p className="text-xs text-gray-500 italic mt-0.5">+ Transport + Douane</p>
          </div>

          <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {vehicle.year}
            </span>
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-gray-400" />
              {vehicle.mileage === 0 ? '0 km' : `${formatPrice(vehicle.mileage)} km`}
            </span>
            <span className="flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-gray-400" />
              {vehicle.fuel_type}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
