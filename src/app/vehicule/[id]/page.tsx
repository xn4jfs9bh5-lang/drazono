'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { EUR_TO_FCFA, WHATSAPP_NUMBER } from '@/lib/constants'
import type { Vehicle } from '@/lib/types'
import VehicleCard from '@/components/vehicles/VehicleCard'
import FadeIn from '@/components/motion/FadeIn'
import {
  Heart, Share2, MessageCircle, Ship, HelpCircle,
  Calendar, Gauge, Fuel, Cog, Zap, Palette,
  Users, DoorOpen, Car, AlertTriangle, ChevronLeft
} from 'lucide-react'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price)
}

export default function VehiclePage() {
  const params = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [similar, setSimilar] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    async function fetch() {
      if (!params.id) return

      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', params.id)
        .single()

      setVehicle(data)

      if (data) {
        // Increment views
        supabase
          .from('vehicles')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', data.id)
          .then()

        // Fetch similar
        const { data: sim } = await supabase
          .from('vehicles')
          .select('*')
          .neq('id', data.id)
          .eq('status', 'disponible')
          .or(`brand.eq.${data.brand},body_type.eq.${data.body_type}`)
          .limit(4)
        setSimilar(sim ?? [])
      }

      setLoading(false)
    }
    fetch()
  }, [params.id])

  if (loading) {
    return (
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-40 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-24 bg-gray-100 rounded-xl" />
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="h-12 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="pt-28 pb-20 text-center">
        <h1 className="text-2xl font-bold text-[#111827] mb-4">Véhicule introuvable</h1>
        <Link href="/catalogue" className="text-[#2563EB] hover:underline">Retour au catalogue</Link>
      </div>
    )
  }

  const whatsappMessages = [
    {
      icon: MessageCircle,
      label: 'Je veux plus de détails sur ce véhicule',
      message: `Bonjour, je suis intéressé par le ${vehicle.brand} ${vehicle.model} ${vehicle.year} à ${formatPrice(vehicle.price_eur)}€ sur DRAZONO. Pouvez-vous me donner plus de détails ?`,
    },
    {
      icon: Ship,
      label: 'Je veux un devis transport + douane',
      message: `Bonjour, je souhaite un devis de transport pour le ${vehicle.brand} ${vehicle.model} vers [pays]. Merci !`,
    },
    {
      icon: HelpCircle,
      label: 'Je veux un conseil pour choisir',
      message: `Bonjour, j'hésite entre plusieurs véhicules sur DRAZONO, pouvez-vous me conseiller ?`,
    },
  ]

  const specs = [
    { icon: Calendar, label: 'Année', value: vehicle.year },
    { icon: Gauge, label: 'Kilométrage', value: vehicle.mileage === 0 ? '0 km (neuf)' : `${formatPrice(vehicle.mileage)} km` },
    { icon: Fuel, label: 'Carburant', value: vehicle.fuel_type },
    { icon: Cog, label: 'Transmission', value: vehicle.transmission },
    { icon: Zap, label: 'Puissance', value: vehicle.power },
    { icon: Palette, label: 'Couleur', value: vehicle.color },
    { icon: Users, label: 'Places', value: vehicle.seats },
    { icon: DoorOpen, label: 'Portes', value: vehicle.doors },
    { icon: Car, label: 'Carrosserie', value: vehicle.body_type },
  ]

  const images = vehicle.images?.length ? vehicle.images : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    brand: { '@type': 'Brand', name: vehicle.brand },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: vehicle.mileage, unitCode: 'KMT' },
    fuelType: vehicle.fuel_type,
    vehicleTransmission: vehicle.transmission,
    color: vehicle.color,
    numberOfDoors: vehicle.doors,
    seatingCapacity: vehicle.seats,
    description: vehicle.description,
    image: images[0] || undefined,
    offers: {
      '@type': 'Offer',
      price: vehicle.price_eur,
      priceCurrency: 'EUR',
      availability: vehicle.status === 'disponible' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://drazono.vercel.app/vehicule/${vehicle.id}`,
    },
  }

  return (
    <div className="pt-20 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <FadeIn>
          <Link href="/catalogue" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#2563EB] mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Retour au catalogue
          </Link>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <FadeIn>
            <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden">
              {images.length > 0 ? (
                <Image
                  src={images[activeImage]}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-400">{vehicle.brand} {vehicle.model} — Pas de photo</span>
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${vehicle.condition === 'neuf' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {vehicle.condition === 'neuf' ? 'Neuf' : 'Occasion'}
                </span>
                {vehicle.verified && (
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
                    Vérifié DRAZONO
                  </span>
                )}
              </div>
              {vehicle.status === 'vendu' && (
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-100 text-red-700">Vendu</span>
                </div>
              )}
              {vehicle.status === 'réservé' && (
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">Réservé</span>
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-[#2563EB]' : 'border-transparent'}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="120px" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </FadeIn>

          {/* Info */}
          <FadeIn delay={0.15}>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </h1>

              <p className="text-3xl sm:text-4xl font-bold text-[#2563EB] mt-3">
                {formatPrice(vehicle.price_eur)} €
              </p>
              <p className="text-base text-gray-500 mt-1">
                ≈ {formatPrice(vehicle.price_fcfa || vehicle.price_eur * EUR_TO_FCFA)} FCFA
              </p>

              {/* Transport notice */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800">
                  Transport en option — contactez-nous pour un devis personnalisé
                </p>
              </div>

              {/* WhatsApp buttons */}
              <div className="mt-6 space-y-3">
                {whatsappMessages.map((wa, i) => (
                  <a
                    key={i}
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(wa.message)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full p-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl transition-colors"
                  >
                    <wa.icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{wa.label}</span>
                  </a>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Heart className="w-4 h-4" />
                  Ajouter aux favoris
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
              </div>

              {/* Availability warning */}
              <p className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Sous réserve de disponibilité fournisseur
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Specs */}
        <FadeIn delay={0.2}>
          <div className="mt-12">
            <h2 className="text-xl font-bold text-[#111827] mb-6">Fiche technique</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {specs.map((spec) => (
                <div key={spec.label} className="p-4 bg-[#FAFAFA] rounded-xl border border-gray-100">
                  <spec.icon className="w-5 h-5 text-[#2563EB] mb-2" />
                  <p className="text-xs text-gray-500">{spec.label}</p>
                  <p className="text-sm font-semibold text-[#111827] mt-0.5">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Description */}
        <FadeIn delay={0.25}>
          <div className="mt-12">
            <h2 className="text-xl font-bold text-[#111827] mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
          </div>
        </FadeIn>

        {/* Video */}
        {vehicle.video_url && (
          <FadeIn delay={0.27}>
            <div className="mt-12">
              <h2 className="text-xl font-bold text-[#111827] mb-4">Vidéo</h2>
              {(() => {
                const url = vehicle.video_url!
                const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
                if (ytMatch) {
                  return (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                        title="Vidéo du véhicule"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  )
                }
                return (
                  <video controls className="w-full rounded-2xl" preload="metadata">
                    <source src={url} />
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                )
              })()}
            </div>
          </FadeIn>
        )}

        {/* Similar vehicles */}
        {similar.length > 0 && (
          <FadeIn delay={0.3}>
            <div className="mt-16">
              <h2 className="text-xl font-bold text-[#111827] mb-6">Véhicules similaires</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similar.map(v => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
