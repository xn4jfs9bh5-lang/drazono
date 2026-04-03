'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { BRANDS, BODY_TYPES, FUEL_TYPES } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import type { Vehicle } from '@/lib/types'
import VehicleCard from '@/components/vehicles/VehicleCard'
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton'
import FadeIn from '@/components/motion/FadeIn'
import { RotateCcw, Search, SlidersHorizontal, X, Rocket, MessageCircle, Bell } from 'lucide-react'
import Link from 'next/link'
import { WHATSAPP_NUMBER } from '@/lib/constants'

export default function CataloguePage() {
  return (
    <Suspense fallback={
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-72 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    }>
      <CatalogueContent />
    </Suspense>
  )
}

function CatalogueContent() {
  const searchParams = useSearchParams()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '')
  const [brand, setBrand] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [fuelType, setFuelType] = useState('')
  const [condition, setCondition] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [yearMin, setYearMin] = useState('')
  const [sort, setSort] = useState('recent')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

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

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(v =>
        `${v.brand} ${v.model} ${v.body_type} ${v.fuel_type}`.toLowerCase().includes(q)
      )
    }
    if (brand) list = list.filter(v => v.brand === brand)
    if (bodyType) list = list.filter(v => v.body_type === bodyType)
    if (fuelType) list = list.filter(v => v.fuel_type === fuelType)
    if (condition) list = list.filter(v => v.condition === condition)
    if (priceMin) list = list.filter(v => v.price_eur >= Number(priceMin))
    if (priceMax) list = list.filter(v => v.price_eur <= Number(priceMax))
    if (yearMin) list = list.filter(v => v.year >= Number(yearMin))

    switch (sort) {
      case 'price-asc': list.sort((a, b) => a.price_eur - b.price_eur); break
      case 'price-desc': list.sort((a, b) => b.price_eur - a.price_eur); break
      case 'popular': list.sort((a, b) => b.views_count - a.views_count); break
      default: list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return list
  }, [vehicles, searchQuery, brand, bodyType, fuelType, condition, priceMin, priceMax, yearMin, sort])

  const resetFilters = () => {
    setSearchQuery('')
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

  const filterContent = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <div className="col-span-2 sm:col-span-3 lg:col-span-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher une marque, un modèle..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        />
      </div>
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
      <input type="number" placeholder="Prix min (€)" value={priceMin} onChange={e => setPriceMin(e.target.value)} className={inputClass} />
      <input type="number" placeholder="Prix max (€)" value={priceMax} onChange={e => setPriceMax(e.target.value)} className={inputClass} />
      <select value={yearMin} onChange={e => setYearMin(e.target.value)} className={selectClass}>
        <option value="">Année minimum</option>
        {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <button onClick={resetFilters} className="h-10 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors">
        <RotateCcw className="w-4 h-4" />
        Réinitialiser
      </button>
    </div>
  )

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight mb-2">Catalogue</h1>
          <p className="text-gray-500 mb-8">Trouvez votre véhicule chinois au meilleur prix.</p>
        </FadeIn>

        {/* Desktop filters */}
        <FadeIn delay={0.1}>
          <div className="hidden sm:block bg-[#FAFAFA] rounded-2xl p-4 sm:p-6 mb-8 border border-gray-100">
            {filterContent}
          </div>
        </FadeIn>

        {/* Mobile filter button */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 h-10 px-4 bg-[#FAFAFA] border border-gray-200 rounded-lg text-sm text-gray-700 w-full justify-center"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
          </button>
        </div>

        {/* Mobile bottom sheet */}
        {mobileFiltersOpen && (
          <>
            <div className="fixed inset-0 z-50 bg-black/40 sm:hidden" onClick={() => setMobileFiltersOpen(false)} />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto sm:hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#111827]">Filtres</h3>
                <button onClick={() => setMobileFiltersOpen(false)} aria-label="Fermer les filtres">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              {filterContent}
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-4 w-full h-10 bg-[#2563EB] text-white rounded-lg text-sm font-medium"
              >
                Voir {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
              </button>
            </div>
          </>
        )}

        {/* Sort + Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-[#111827]">{loading ? '...' : filtered.length}</span> véhicule{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </p>
          <select value={sort} onChange={e => setSort(e.target.value)} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
            <option value="recent">Plus récent</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="popular">Plus populaire</option>
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
          </div>
        ) : vehicles.length === 0 ? (
          /* Catalogue completely empty — launch state */
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Rocket className="w-8 h-8 text-[#2563EB]" />
            </div>
            <h2 className="text-xl font-bold text-[#111827] mb-2">
              Nous pr&eacute;parons notre premier stock
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Soyez parmi les premiers &agrave; &ecirc;tre alert&eacute;. Inscrivez-vous pour recevoir une notification d&egrave;s qu&apos;un v&eacute;hicule est disponible.
            </p>

            {/* Alert form */}
            <div className="max-w-sm mx-auto mb-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const email = formData.get('alert-email')
                  if (email) {
                    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Bonjour, je souhaite être alerté dès qu'un véhicule est disponible. Mon email : ${email}`)}`, '_blank')
                  }
                }}
                className="flex gap-2"
              >
                <input
                  name="alert-email"
                  type="email"
                  required
                  placeholder="votre@email.com"
                  className="flex-1 h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <button
                  type="submit"
                  className="h-11 px-5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
                >
                  <Bell className="w-4 h-4" />
                  M&apos;alerter
                </button>
              </form>
            </div>

            {/* Marques disponibles prochainement */}
            <div className="mb-8">
              <p className="text-sm text-gray-400 mb-3">Marques disponibles prochainement</p>
              <div className="flex flex-wrap justify-center gap-2">
                {BRANDS.map(b => (
                  <span key={b} className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-gray-600">{b}</span>
                ))}
              </div>
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, je souhaite être contacté en priorité dès qu\'un véhicule est disponible sur DRAZONO.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-3 rounded-full text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Me contacter en priorit&eacute;
            </a>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Aucun v&eacute;hicule ne correspond &agrave; vos crit&egrave;res.</p>
            <button onClick={resetFilters} className="mt-4 text-[#2563EB] text-sm font-medium hover:underline">
              R&eacute;initialiser les filtres
            </button>
            <div className="mt-6">
              <Link href="/demande" className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                Faire une demande personnalis&eacute;e
              </Link>
            </div>
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
