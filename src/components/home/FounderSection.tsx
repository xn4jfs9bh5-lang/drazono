'use client'

import FadeIn from '@/components/motion/FadeIn'
import { CheckCircle, Star, MapPin } from 'lucide-react'

export default function FounderSection() {
  return (
    <section className="py-20 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Avatar SVG illustration */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1845CC] to-[#1E40AF] flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <circle cx="60" cy="40" r="22" fill="rgba(255,255,255,0.9)" />
                  <ellipse cx="60" cy="105" rx="35" ry="30" fill="rgba(255,255,255,0.9)" />
                  <circle cx="60" cy="40" r="18" fill="rgba(255,255,255,0.3)" />
                </svg>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle className="w-3 h-3" />
                  Vendeur vérifié
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                  <Star className="w-3 h-3" />
                  5/5
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                  <MapPin className="w-3 h-3" />
                  Burkina Faso
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight mb-4">
                Qui est derrière DRAZONO
              </h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                Je m&apos;appelle <strong>Brayann</strong>, fondateur de DRAZONO. Après avoir créé
                BF Auto Market, une plateforme d&apos;importation de véhicules d&apos;occasion pour le
                Burkina Faso, j&apos;ai décidé d&apos;ouvrir l&apos;accès aux véhicules chinois au monde entier.
              </p>
              <p className="text-gray-600 leading-relaxed mb-3">
                Les véhicules chinois sont 2 à 3 fois moins chers que leurs équivalents
                européens ou japonais, et leur qualité a explosé ces dernières années.
                Mon objectif : vous permettre d&apos;y accéder au prix réel du vendeur,
                sans intermédiaire inutile.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Chaque véhicule sur DRAZONO est vérifié personnellement. Je communique
                directement avec les vendeurs chinois via WeChat. <strong>Transparence et
                confiance</strong>, c&apos;est ma promesse.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
