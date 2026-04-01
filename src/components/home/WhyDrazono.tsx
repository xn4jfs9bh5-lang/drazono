'use client'

import { BadgeCheck, DollarSign, Globe, Headphones } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'

const reasons = [
  {
    icon: DollarSign,
    title: 'Prix réel vendeur',
    description: 'Zéro intermédiaire, vous payez le prix du vendeur chinois.',
  },
  {
    icon: BadgeCheck,
    title: 'Véhicules vérifiés',
    description: 'Disponibilité et photos confirmées avant publication.',
  },
  {
    icon: Globe,
    title: 'Livraison mondiale',
    description: 'Transport en option vers 30+ pays. Devis personnalisé.',
  },
  {
    icon: Headphones,
    title: 'Support WhatsApp',
    description: 'Réponse moyenne en moins de 2 heures.',
  },
]

export default function WhyDrazono() {
  return (
    <section className="py-20 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight text-center mb-14">
            Pourquoi DRAZONO
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow text-center">
                <div className="w-12 h-12 bg-[#2563EB]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <reason.icon className="w-6 h-6 text-[#2563EB]" />
                </div>
                <h3 className="font-semibold text-[#111827] mb-2">{reason.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{reason.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
