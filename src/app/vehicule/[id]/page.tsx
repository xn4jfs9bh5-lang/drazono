'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { EUR_TO_FCFA, WHATSAPP_NUMBER } from '@/lib/constants'
import type { Vehicle } from '@/lib/types'
import VehicleCard from '@/components/vehicles/VehicleCard'
import FadeIn from '@/components/motion/FadeIn'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Share2, MessageCircle, Ship, HelpCircle,
  Calendar, Gauge, Fuel, Cog, Zap, Palette,
  Users, DoorOpen, Car, AlertTriangle, ChevronLeft,
  ChevronRight, X, Eye, Shield, Camera, Check,
  Copy, Clock, BadgeCheck, ChevronDown, Home
} from 'lucide-react'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number) { return new Intl.NumberFormat('fr-FR').format(Math.round(n)) }

// ---------------------------------------------------------------------------
// Customs duty data per country (2024 official rates)
// ---------------------------------------------------------------------------
interface CountryDuty {
  name: string
  region: 'west-africa' | 'europe' | 'canada'
  transport: number
  dutyRate: number
  vatRate: number
  otherRate: number
  isFcfa: boolean
}

const COUNTRIES: CountryDuty[] = [
  { name: 'Burkina Faso', region: 'west-africa', transport: 1500, dutyRate: 0.20, vatRate: 0.18, otherRate: 0.01, isFcfa: true },
  { name: 'Sénégal', region: 'west-africa', transport: 1450, dutyRate: 0.20, vatRate: 0.18, otherRate: 0.023, isFcfa: true },
  { name: 'Côte d\'Ivoire', region: 'west-africa', transport: 1450, dutyRate: 0.20, vatRate: 0.18, otherRate: 0.023, isFcfa: true },
  { name: 'Mali', region: 'west-africa', transport: 1550, dutyRate: 0.20, vatRate: 0.18, otherRate: 0.01, isFcfa: true },
  { name: 'Bénin', region: 'west-africa', transport: 1400, dutyRate: 0.20, vatRate: 0.18, otherRate: 0.01, isFcfa: true },
  { name: 'Togo', region: 'west-africa', transport: 1400, dutyRate: 0.20, vatRate: 0.18, otherRate: 0.00, isFcfa: true },
  { name: 'Niger', region: 'west-africa', transport: 1600, dutyRate: 0.20, vatRate: 0.19, otherRate: 0.01, isFcfa: true },
  { name: 'France', region: 'europe', transport: 1100, dutyRate: 0.065, vatRate: 0.20, otherRate: 0.00, isFcfa: false },
  { name: 'Belgique', region: 'europe', transport: 1100, dutyRate: 0.065, vatRate: 0.21, otherRate: 0.00, isFcfa: false },
  { name: 'Canada', region: 'canada', transport: 2000, dutyRate: 0.061, vatRate: 0.05, otherRate: 0.09, isFcfa: false },
]

function calcDuty(priceEur: number, country: CountryDuty) {
  const transport = country.transport
  const insurance = priceEur * 0.02
  const cif = priceEur + transport + insurance
  const duty = cif * country.dutyRate
  const vat = (cif + duty) * country.vatRate
  const other = cif * country.otherRate
  const totalTaxes = duty + vat + other
  const total = priceEur + transport + insurance + totalTaxes
  return { transport, insurance, cif, duty, vat, other, totalTaxes, total }
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function VehiclePage() {
  const params = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [similar, setSimilar] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [viewers, setViewers] = useState(0)
  const [countryIdx, setCountryIdx] = useState(0)
  const [showSticky, setShowSticky] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // Random viewers count
  useEffect(() => {
    setViewers(3 + Math.floor(Math.random() * 10))
    const interval = setInterval(() => {
      setViewers(3 + Math.floor(Math.random() * 10))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Sticky bar on mobile
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fetch vehicle
  useEffect(() => {
    async function load() {
      if (!params.id) return
      const { data } = await supabase.from('vehicles').select('*').eq('id', params.id).single()
      setVehicle(data)
      if (data) {
        supabase.from('vehicles').update({ views_count: (data.views_count || 0) + 1 }).eq('id', data.id).then()
        const { data: sim } = await supabase
          .from('vehicles').select('*').neq('id', data.id).eq('status', 'disponible')
          .or(`brand.eq.${data.brand},body_type.eq.${data.body_type}`).limit(4)
        setSimilar(sim ?? [])
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  const prevImage = useCallback(() => {
    if (!vehicle?.images?.length) return
    setActiveImage(i => (i - 1 + vehicle.images.length) % vehicle.images.length)
  }, [vehicle])

  const nextImage = useCallback(() => {
    if (!vehicle?.images?.length) return
    setActiveImage(i => (i + 1) % vehicle.images.length)
  }, [vehicle])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true)
    toast.success('Lien copié !')
    setTimeout(() => setLinkCopied(false), 2000)
  }

  // --- Loading skeleton ---
  if (loading) {
    return (
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-60 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-48" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-20 bg-gray-100 rounded-xl" />
              <div className="space-y-3"><div className="h-12 bg-gray-200 rounded-xl" /><div className="h-12 bg-gray-200 rounded-xl" /></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="pt-28 pb-20 text-center">
        <Car className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#111827] mb-2">Véhicule introuvable</h1>
        <p className="text-gray-600 mb-6">Ce véhicule a peut-être été vendu ou retiré.</p>
        <Link href="/catalogue" className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-brand-600 transition-colors">
          Voir le catalogue
        </Link>
      </div>
    )
  }

  const images = vehicle.images?.length ? vehicle.images : []
  const country = COUNTRIES[countryIdx]
  const dutyCalc = calcDuty(vehicle.price_eur, country)

  const waBase = `https://wa.me/${WHATSAPP_NUMBER}?text=`
  const waMessages = [
    { label: 'Je veux plus de détails', icon: MessageCircle, style: 'bg-[#25D366] hover:bg-[#20BA5C] text-white font-bold text-base',
      msg: `Bonjour, je suis intéressé par le ${vehicle.brand} ${vehicle.model} ${vehicle.year} à ${fmt(vehicle.price_eur)}€ sur DRAZONO. Pouvez-vous me donner plus de détails ?` },
    { label: 'Devis transport + douane', icon: Ship, style: 'border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5',
      msg: `Bonjour, je souhaite un devis de transport et douane pour le ${vehicle.brand} ${vehicle.model} ${vehicle.year}. Merci !` },
    { label: 'Je veux un conseil', icon: HelpCircle, style: 'border border-gray-200 text-gray-600 hover:bg-gray-50',
      msg: `Bonjour, j'hésite entre plusieurs véhicules sur DRAZONO, pouvez-vous me conseiller ?` },
  ]

  const specs = [
    { icon: Calendar, label: 'Année', value: String(vehicle.year), color: 'text-blue-600 bg-blue-50' },
    { icon: Gauge, label: 'Kilométrage', value: vehicle.mileage === 0 ? '0 km (neuf)' : `${fmt(vehicle.mileage)} km`, color: 'text-emerald-600 bg-emerald-50' },
    { icon: Fuel, label: 'Carburant', value: vehicle.fuel_type, color: 'text-amber-600 bg-amber-50' },
    { icon: Cog, label: 'Transmission', value: vehicle.transmission, color: 'text-violet-600 bg-violet-50' },
    { icon: Zap, label: 'Puissance', value: vehicle.power, color: 'text-red-600 bg-red-50' },
    { icon: Palette, label: 'Couleur', value: vehicle.color, color: 'text-pink-600 bg-pink-50' },
    { icon: Users, label: 'Places', value: String(vehicle.seats), color: 'text-indigo-600 bg-indigo-50' },
    { icon: DoorOpen, label: 'Portes', value: String(vehicle.doors), color: 'text-teal-600 bg-teal-50' },
    { icon: Car, label: 'Carrosserie', value: vehicle.body_type, color: 'text-gray-600 bg-gray-100' },
  ]

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Car',
    name: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    brand: { '@type': 'Brand', name: vehicle.brand }, model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: vehicle.mileage, unitCode: 'KMT' },
    fuelType: vehicle.fuel_type, vehicleTransmission: vehicle.transmission,
    color: vehicle.color, numberOfDoors: vehicle.doors, seatingCapacity: vehicle.seats,
    description: vehicle.description, image: images[0] || undefined,
    offers: { '@type': 'Offer', price: vehicle.price_eur, priceCurrency: 'EUR',
      availability: vehicle.status === 'disponible' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://drazono.vercel.app/vehicule/${vehicle.id}` },
  }

  return (
    <div className="pt-20 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <FadeIn>
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-brand-500 transition-colors"><Home className="w-3.5 h-3.5" /></Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/catalogue" className="hover:text-brand-500 transition-colors">Catalogue</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#111827] font-medium truncate">{vehicle.brand} {vehicle.model} {vehicle.year}</span>
          </nav>
        </FadeIn>

        {/* Urgency banner */}
        <FadeIn>
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-sm text-amber-800 flex items-center gap-2">
              <Eye className="w-4 h-4 shrink-0" />
              <span><strong>{viewers} personnes</strong> regardent ce véhicule en ce moment</span>
            </p>
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Disponibilité non garantie
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ==================== GALLERY ==================== */}
          <FadeIn>
            <div>
              {/* Main image */}
              <div
                className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                onClick={() => images.length > 0 && setLightbox(true)}
              >
                {images.length > 0 ? (
                  <Image src={images[activeImage]} alt={`${vehicle.brand} ${vehicle.model}`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" unoptimized />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                    <Car className="w-12 h-12 text-gray-300 mb-2" />
                    <span className="text-gray-400 text-sm">Pas de photo disponible</span>
                  </div>
                )}

                {/* Photo counter */}
                {images.length > 0 && (
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    {activeImage + 1}/{images.length}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${vehicle.condition === 'neuf' ? 'bg-emerald-100/90 text-emerald-700' : 'bg-amber-100/90 text-amber-700'}`}>
                    {vehicle.condition === 'neuf' ? 'Neuf' : 'Occasion'}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-100/90 text-blue-700 backdrop-blur-sm flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" /> Vérifié DRAZONO
                  </span>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50/90 text-red-700 backdrop-blur-sm">
                    Direct Chine
                  </span>
                </div>

                {/* Status overlay */}
                {vehicle.status !== 'disponible' && (
                  <div className="absolute top-4 right-4 mt-10">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${vehicle.status === 'vendu' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {vehicle.status === 'vendu' ? 'Vendu' : 'Réservé'}
                    </span>
                  </div>
                )}

                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); prevImage() }} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" aria-label="Photo précédente">
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextImage() }} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" aria-label="Photo suivante">
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)} className={`relative shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImage === i ? 'border-brand-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                      <Image src={img} alt="" fill className="object-cover" sizes="80px" unoptimized />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>

          {/* ==================== INFO PANEL ==================== */}
          <FadeIn delay={0.1}>
            <div>
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-[-0.02em] leading-tight">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </h1>

              {/* Views */}
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {vehicle.views_count} consultations
              </p>

              {/* Price */}
              <div className="mt-4">
                <p className="text-3xl sm:text-4xl font-bold text-brand-500 tracking-tight">
                  {fmt(vehicle.price_eur)} &euro;
                </p>
                <p className="text-base text-gray-600 mt-0.5">
                  ≈ {fmt(vehicle.price_fcfa || vehicle.price_eur * EUR_TO_FCFA)} FCFA
                </p>
              </div>

              {/* Transport notice */}
              <div className="mt-5 p-4 bg-blue-50/70 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800">
                  Transport en option — contactez-nous pour un devis personnalisé
                </p>
              </div>

              {/* WhatsApp CTAs */}
              <div className="mt-5 space-y-2.5">
                <a href={`${waBase}${encodeURIComponent(waMessages[0].msg)}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-14 bg-[#25D366] hover:bg-[#20BA5C] text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all">
                  <MessageCircle className="w-5 h-5 shrink-0" />
                  {waMessages[0].label}
                </a>
                <a href={`${waBase}${encodeURIComponent(waMessages[1].msg)}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-12 border-2 border-[#25D366] text-[#25D366] font-semibold text-sm rounded-2xl hover:bg-[#25D366]/5 transition-all">
                  <Ship className="w-5 h-5 shrink-0" />
                  {waMessages[1].label}
                </a>
                <a href={`${waBase}${encodeURIComponent(waMessages[2].msg)}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-11 text-[#25D366] font-medium text-sm underline underline-offset-2 hover:text-[#20BA5C] transition-colors">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  {waMessages[2].label}
                </a>
              </div>

              {/* Share actions */}
              <div className="mt-5 flex gap-2.5">
                <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors" aria-label="Copier le lien">
                  {linkCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {linkCopied ? 'Copié !' : 'Copier le lien'}
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Regarde ce véhicule sur DRAZONO : ${vehicle.brand} ${vehicle.model} — ${window?.location?.href || ''}`)}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4" /> WhatsApp
                </a>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors" aria-label="Ajouter aux favoris">
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              {/* Availability */}
              <p className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Sous réserve de disponibilité fournisseur
              </p>
            </div>
          </FadeIn>
        </div>

        {/* ==================== TRUST BLOCK ==================== */}
        <FadeIn delay={0.15}>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { icon: BadgeCheck, label: 'Véhicule vérifié par DRAZONO', color: 'text-blue-600' },
              { icon: Shield, label: 'Acompte remboursable si indisponible', color: 'text-emerald-600' },
              { icon: Camera, label: 'Photos réelles du vendeur', color: 'text-violet-600' },
              { icon: Zap, label: 'Réponse garantie < 2h', color: 'text-amber-600' },
              { icon: Ship, label: 'Livraison mondiale disponible', color: 'text-indigo-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl">
                <item.icon className={`w-5 h-5 shrink-0 mt-0.5 ${item.color}`} />
                <span className="text-xs text-gray-600 leading-relaxed">{item.label}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ==================== SPECS ==================== */}
        <FadeIn delay={0.18}>
          <div className="mt-12">
            <h2 className="text-xl font-bold text-[#111827] tracking-[-0.02em]">Fiche technique</h2>
            <span className="section-title-line !mx-0 !mt-2 !mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${spec.color}`}>
                    <spec.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{spec.label}</p>
                    <p className="text-sm font-semibold text-[#111827]">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ==================== DESCRIPTION ==================== */}
        {vehicle.description && (
          <FadeIn delay={0.2}>
            <div className="mt-12">
              <h2 className="text-xl font-bold text-[#111827] tracking-[-0.02em]">Description</h2>
              <span className="section-title-line !mx-0 !mt-2 !mb-4" />
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{vehicle.description}</p>
            </div>
          </FadeIn>
        )}

        {/* ==================== VIDEO ==================== */}
        {vehicle.video_url && (
          <FadeIn delay={0.22}>
            <div className="mt-12">
              <h2 className="text-xl font-bold text-[#111827] tracking-[-0.02em] mb-4">Vidéo</h2>
              {(() => {
                const url = vehicle.video_url!
                const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
                if (ytMatch) return <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg"><iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`} title="Vidéo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" /></div>
                return <video controls className="w-full rounded-2xl shadow-lg" preload="metadata"><source src={url} /></video>
              })()}
            </div>
          </FadeIn>
        )}

        {/* ==================== COST CALCULATOR ==================== */}
        <FadeIn delay={0.25}>
          <div className="mt-12">
            <h2 className="text-xl font-bold text-[#111827] tracking-[-0.02em]">Estimez le coût total</h2>
            <span className="section-title-line !mx-0 !mt-2 !mb-6" />
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pays de destination</label>
                <div className="relative">
                  <select value={countryIdx} onChange={e => setCountryIdx(Number(e.target.value))} className="w-full sm:w-72 h-11 rounded-lg border border-gray-200 px-4 pr-10 text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {COUNTRIES.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Prix véhicule</span><span className="font-medium text-[#111827]">{fmt(vehicle.price_eur)} &euro;</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Transport estimé ({country.region === 'west-africa' ? 'Afrique' : country.region === 'europe' ? 'Europe' : 'Canada'})</span><span className="font-medium text-[#111827]">{fmt(dutyCalc.transport)} &euro;</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Assurance transport (~2%)</span><span className="font-medium text-[#111827]">{fmt(dutyCalc.insurance)} &euro;</span></div>
                <div className="border-t border-gray-100 pt-2.5" />
                <div className="flex justify-between"><span className="text-gray-600">Droits de douane ({Math.round(country.dutyRate * 100)}%)</span><span className="font-medium text-[#111827]">{fmt(dutyCalc.duty)} &euro;</span></div>
                <div className="flex justify-between"><span className="text-gray-600">TVA ({Math.round(country.vatRate * 100)}%)</span><span className="font-medium text-[#111827]">{fmt(dutyCalc.vat)} &euro;</span></div>
                {country.otherRate > 0 && <div className="flex justify-between"><span className="text-gray-600">Autres taxes ({(country.otherRate * 100).toFixed(1)}%)</span><span className="font-medium text-[#111827]">{fmt(dutyCalc.other)} &euro;</span></div>}
                <div className="border-t border-gray-200 pt-3 mt-1" />
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-[#111827] text-base">Total estimé</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-500">{fmt(dutyCalc.total)} &euro;</p>
                    {country.isFcfa && <p className="text-sm text-gray-600">≈ {fmt(dutyCalc.total * EUR_TO_FCFA)} FCFA</p>}
                  </div>
                </div>
              </div>

              <a href={`${waBase}${encodeURIComponent(`Bonjour, je souhaite un devis précis pour le ${vehicle.brand} ${vehicle.model} ${vehicle.year} livré au ${country.name}. Merci !`)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 mt-5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-medium text-sm transition-colors">
                <MessageCircle className="w-5 h-5" /> Obtenir un devis précis sur WhatsApp
              </a>

              <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                Estimations indicatives basées sur les taux officiels 2024. Le montant réel peut varier selon l&apos;état du véhicule, sa valeur déclarée, les frais de commissionnaire en douane et les réglementations locales. Contactez-nous pour un devis précis et personnalisé.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* ==================== WHY DRAZONO ==================== */}
        <FadeIn delay={0.28}>
          <div className="mt-14">
            <h2 className="text-xl font-bold text-[#111827] tracking-[-0.02em] text-center">Pourquoi acheter via DRAZONO ?</h2>
            <span className="section-title-line" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {[
                { title: 'Économisez 40 à 60%', desc: 'Prix direct usine vs concessionnaires européens', color: 'text-emerald-600 bg-emerald-50' },
                { title: 'Véhicule vérifié', desc: 'Photos confirmées, disponibilité vérifiée via WeChat', color: 'text-blue-600 bg-blue-50' },
                { title: 'Accompagnement A→Z', desc: 'De la sélection à la livraison, on gère tout', color: 'text-violet-600 bg-violet-50' },
                { title: 'Remboursement garanti', desc: 'Acompte 100% remboursé si véhicule indisponible', color: 'text-amber-600 bg-amber-50' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#111827] text-sm">{item.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ==================== PROCESS TIMELINE ==================== */}
        <FadeIn delay={0.3}>
          <div className="mt-14">
            <h2 className="text-xl font-bold text-[#111827] tracking-[-0.02em] text-center mb-8">Processus d&apos;achat</h2>
            <div className="flex items-center justify-center gap-0 overflow-x-auto no-scrollbar pb-2">
              {['Contact', 'Vérification', 'Acompte', 'Commande', 'Livraison'].map((step, i) => (
                <div key={i} className="flex items-center shrink-0">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-bold">{i + 1}</div>
                    <span className="text-xs text-gray-600 mt-1.5 font-medium whitespace-nowrap">{step}</span>
                  </div>
                  {i < 4 && <div className="w-8 sm:w-14 h-px bg-brand-500/30 mx-1 sm:mx-2 mt-[-18px]" />}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ==================== SIMILAR ==================== */}
        {similar.length > 0 && (
          <FadeIn delay={0.32}>
            <div className="mt-16">
              <h2 className="text-xl font-bold text-[#111827] tracking-[-0.02em]">Vous aimerez aussi</h2>
              <span className="section-title-line !mx-0 !mt-2 !mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similar.map(v => <VehicleCard key={v.id} vehicle={v} />)}
              </div>
            </div>
          </FadeIn>
        )}
      </div>

      {/* ==================== LIGHTBOX ==================== */}
      <AnimatePresence>
        {lightbox && images.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center" onClick={() => setLightbox(false)}>
            <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10" aria-label="Fermer"><X className="w-6 h-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); prevImage() }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors" aria-label="Précédent"><ChevronLeft className="w-6 h-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); nextImage() }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors" aria-label="Suivant"><ChevronRight className="w-6 h-6" /></button>
            <div className="relative w-full max-w-4xl aspect-[4/3] mx-4" onClick={e => e.stopPropagation()}>
              <Image src={images[activeImage]} alt={`${vehicle.brand} ${vehicle.model}`} fill className="object-contain" sizes="90vw" unoptimized />
            </div>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">{activeImage + 1} / {images.length}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MOBILE STICKY BAR ==================== */}
      <AnimatePresence>
        {showSticky && vehicle.status === 'disponible' && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 md:hidden"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
            <div className="flex gap-3 max-w-7xl mx-auto">
              <a href={`${waBase}${encodeURIComponent(waMessages[0].msg)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 flex-1 h-12 bg-[#25D366] hover:bg-[#20BA5C] text-white rounded-2xl text-sm font-bold transition-colors">
                <MessageCircle className="w-5 h-5" /> Contacter
              </a>
              <button className="flex items-center justify-center w-12 h-12 border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 transition-colors" aria-label="Ajouter aux favoris">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
