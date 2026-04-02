'use client'

import FadeIn from '@/components/motion/FadeIn'
import { Star, Quote } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
  {
    name: 'Moussa D.',
    country: 'Burkina Faso',
    date: 'Mars 2026',
    vehicle: 'A acheté un BYD Atto 3',
    text: 'J\'ai trouvé mon BYD Atto 3 sur DRAZONO à un prix imbattable. Le processus était simple, Brayann m\'a accompagné du début à la fin. Je recommande à 100%.',
  },
  {
    name: 'Aminata K.',
    country: 'Côte d\'Ivoire',
    date: 'Février 2026',
    vehicle: 'A acheté un Chery Tiggo 8',
    text: 'Sceptique au début, j\'ai été convaincue par la transparence. Photos réelles, prix honnête, réponse rapide sur WhatsApp. Mon Chery Tiggo est arrivé en parfait état.',
  },
  {
    name: 'Ibrahim S.',
    country: 'Sénégal',
    date: 'Janvier 2026',
    vehicle: 'Revendeur partenaire',
    text: 'En tant que revendeur, DRAZONO m\'a ouvert un nouveau marché. Les prix Chine sont imbattables et la qualité est vraiment au rendez-vous. Partenariat gagnant.',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-[-0.02em] text-center">
            Ce que disent nos clients
          </h2>
          <span className="section-title-line" />
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative h-full flex flex-col">
                <Quote className="w-8 h-8 text-[#2563EB]/10 absolute top-5 right-5" />
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5 flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Vehicle tag */}
                <p className="text-xs text-emerald-600 font-medium mb-3 flex items-center gap-1">
                  <span>&#10003;</span> {t.vehicle}
                </p>

                <div className="flex items-center gap-3">
                  <Image
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=2563EB&color=fff&size=80&bold=true`}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                    unoptimized
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.country} &middot; {t.date}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
