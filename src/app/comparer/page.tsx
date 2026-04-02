'use client'

import { useState, useEffect } from 'react'
import FadeIn from '@/components/motion/FadeIn'
import { supabase } from '@/lib/supabase'
import { EUR_TO_FCFA } from '@/lib/constants'
import type { Vehicle } from '@/lib/types'
import Image from 'next/image'
import { ArrowLeftRight, Car, ChevronDown } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

function VehicleSelector({ vehicles, selected, onChange }: {
  vehicles: Vehicle[]
  selected: string
  onChange: (id: string) => void
}) {
  return (
    <div className="relative">
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <select
        value={selected}
        onChange={e => onChange(e.target.value)}
        className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
      >
        <option value="">Choisir un véhicule</option>
        {vehicles.map(v => (
          <option key={v.id} value={v.id}>
            {v.brand} {v.model} {v.year} — {fmt(v.price_eur)}€
          </option>
        ))}
      </select>
    </div>
  )
}

function VehiclePreview({ vehicle }: { vehicle: Vehicle | undefined }) {
  if (!vehicle) {
    return (
      <div className="aspect-[4/3] bg-gray-100 rounded-xl flex flex-col items-center justify-center">
        <Car className="w-10 h-10 text-gray-300 mb-2" />
        <span className="text-sm text-gray-400">Sélectionnez un véhicule</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
        {vehicle.images?.[0] ? (
          <Image src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model}`} fill className="object-cover" sizes="400px" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-10 h-10 text-gray-300" />
          </div>
        )}
      </div>
      <h3 className="font-semibold text-[#111827] text-center">
        {vehicle.brand} {vehicle.model} {vehicle.year}
      </h3>
      <p className="text-center text-xl font-bold text-[#2563EB]">{fmt(vehicle.price_eur)} €</p>
    </div>
  )
}

const SPECS: { key: keyof Vehicle | 'price_fcfa_calc'; label: string }[] = [
  { key: 'price_eur', label: 'Prix (EUR)' },
  { key: 'price_fcfa_calc', label: 'Prix (FCFA)' },
  { key: 'year', label: 'Année' },
  { key: 'mileage', label: 'Kilométrage' },
  { key: 'fuel_type', label: 'Carburant' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'power', label: 'Puissance' },
  { key: 'seats', label: 'Places' },
  { key: 'body_type', label: 'Carrosserie' },
  { key: 'condition', label: 'État' },
]

function getSpecValue(v: Vehicle, key: string): string {
  if (key === 'price_eur') return `${fmt(v.price_eur)} €`
  if (key === 'price_fcfa_calc') return `${fmt(v.price_fcfa || v.price_eur * EUR_TO_FCFA)} FCFA`
  if (key === 'mileage') return v.mileage === 0 ? '0 km (neuf)' : `${fmt(v.mileage)} km`
  if (key === 'condition') return v.condition === 'neuf' ? 'Neuf' : 'Occasion'
  return String((v as unknown as Record<string, unknown>)[key] ?? '—')
}

export default function ComparerPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [idA, setIdA] = useState('')
  const [idB, setIdB] = useState('')

  useEffect(() => {
    supabase
      .from('vehicles')
      .select('*')
      .in('status', ['disponible', 'vendu', 'réservé'])
      .order('brand')
      .then(({ data }) => setVehicles(data ?? []))
  }, [])

  const vehicleA = vehicles.find(v => v.id === idA)
  const vehicleB = vehicles.find(v => v.id === idB)

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-[#2563EB]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight className="w-7 h-7 text-[#2563EB]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
              Comparer des véhicules
            </h1>
            <p className="text-gray-500 mt-2">
              Sélectionnez 2 véhicules pour les comparer côte à côte
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <VehicleSelector vehicles={vehicles} selected={idA} onChange={setIdA} />
              <VehiclePreview vehicle={vehicleA} />
            </div>
            <div className="space-y-4">
              <VehicleSelector vehicles={vehicles} selected={idB} onChange={setIdB} />
              <VehiclePreview vehicle={vehicleB} />
            </div>
          </div>
        </FadeIn>

        {vehicleA && vehicleB && (
          <FadeIn delay={0.2}>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 text-gray-500 font-medium w-1/3">Caractéristique</th>
                    <th className="text-center py-3 px-4 text-[#111827] font-semibold">{vehicleA.brand} {vehicleA.model}</th>
                    <th className="text-center py-3 px-4 text-[#111827] font-semibold">{vehicleB.brand} {vehicleB.model}</th>
                  </tr>
                </thead>
                <tbody>
                  {SPECS.map((spec, i) => (
                    <tr key={spec.key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="py-3 px-4 text-gray-500">{spec.label}</td>
                      <td className="py-3 px-4 text-center text-[#111827] font-medium">{getSpecValue(vehicleA, spec.key)}</td>
                      <td className="py-3 px-4 text-center text-[#111827] font-medium">{getSpecValue(vehicleB, spec.key)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
