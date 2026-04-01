'use client'

import FadeIn from '@/components/motion/FadeIn'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Moussa D.',
    country: 'Burkina Faso',
    text: 'J\'ai trouvé mon BYD Atto 3 sur DRAZONO à un prix imbattable. Le processus était simple, Brayann m\'a accompagné du début à la fin. Je recommande à 100%.',
  },
  {
    name: 'Aminata K.',
    country: 'Côte d\'Ivoire',
    text: 'Sceptique au début, j\'ai été convaincue par la transparence. Photos réelles, prix honnête, réponse rapide sur WhatsApp. Mon Chery Tiggo est arrivé en parfait état.',
  },
  {
    name: 'Ibrahim S.',
    country: 'Sénégal',
    text: 'En tant que revendeur, DRAZONO m\'a ouvert un nouveau marché. Les prix Chine sont imbattables et la qualité est vraiment au rendez-vous. Partenariat gagnant.',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight text-center mb-14">
            Ce que disent nos clients
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-gray-100">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#2563EB]">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.country}</p>
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
