'use client'

import { useState, useEffect, useMemo } from 'react'
import { BRANDS, BODY_TYPES, FUEL_TYPES } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import type { Vehicle } from '@/lib/types'
import VehicleCard from '@/components/vehicles/VehicleCard'
import FadeIn from '@/components/motion/FadeIn'
import { RotateCcw, Loader2 } from 'lucide-react'

export default function CataloguePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [brand, setBrand] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [fuelType, setFuelType] = useState('')
  const [condition, setCondition] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [yearMin, setYearMin] = useState('')
  const [sort, setSort] = useState('recent')

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .in('status', ['disponible', 'vendu', 'réservé'])
        .order('created_at', { ascending: false })
      setVehicles(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = useMemo(() => {
    let list = [...vehicles]

    if (brand) list = list.filter(v => v.brand === brand)
    if (bodyType) list = list.filter(v => v.body_type === bodyType)
    if (fuelType) list = list.filter(v => v.fuel_type === fuelType)
    if (condition) list = list.filter(v => v.condition === condition)
    if (priceMin) list = list.filter(v => v.price_eur >= Number(priceMin))
    if (priceMax) list = list.filter(v => v.price_eur <= Number(priceMax))
    if (yearMin) list = list.filter(v => v.year >= Number(yearMin))

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price_eur - b.price_eur)
        break
      case 'price-desc':
        list.sort((a, b) => b.price_eur - a.price_eur)
        break
      case 'popular':
        list.sort((a, b) => b.views_count - a.views_count)
        break
      default:
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return list
  }, [vehicles, brand, bodyType, fuelType, condition, priceMin, priceMax, yearMin, sort])

  const resetFilters = () => {
    setBrand('')
    setBodyType('')
    setFuelType('')
    setCondition('')
    setPriceMin('')
    setPriceMax('')
    setYearMin('')
  }

  const selectClass = "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
  const inputClass = "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight mb-2">
            Catalogue
          </h1>
          <p className="text-gray-500 mb-8">
            Trouvez votre véhicule chinois au meilleur prix.
          </p>
        </FadeIn>

        {/* Filters */}
        <FadeIn delay={0.1}>
          <div className="bg-[#FAFAFA] rounded-2xl p-4 sm:p-6 mb-8 border border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <select value={brand} onChange={e => setBrand(e.target.value)} className={selectClass}>
                <option value="">Toutes les marques</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              <select value={bodyType} onChange={e => setBodyType(e.target.value)} className={selectClass}>
                <option value="">Type de carrosserie</option>
                {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <select value={fuelType} onChange={e => setFuelType(e.target.value)} className={selectClass}>
                <option value="">Carburant</option>
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>

              <select value={condition} onChange={e => setCondition(e.target.value)} className={selectClass}>
                <option value="">État</option>
                <option value="neuf">Neuf</option>
                <option value="occasion">Occasion</option>
              </select>

              <input
                type="number"
                placeholder="Prix min (€)"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                className={inputClass}
              />

              <input
                type="number"
                placeholder="Prix max (€)"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                className={inputClass}
              />

              <select value={yearMin} onChange={e => setYearMin(e.target.value)} className={selectClass}>
                <option value="">Année minimum</option>
                {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <button
                onClick={resetFilters}
                className="h-10 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Réinitialiser
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Sort + Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-[#111827]">{filtered.length}</span> véhicule{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </p>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="recent">Plus récent</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="popular">Plus populaire</option>
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
            <span className="text-gray-400">Chargement...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Aucun véhicule ne correspond à vos critères.</p>
            <button onClick={resetFilters} className="mt-4 text-[#2563EB] text-sm font-medium hover:underline">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((vehicle, i) => (
              <FadeIn key={vehicle.id} delay={i * 0.05}>
                <VehicleCard vehicle={vehicle} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
