'use client'

import { Clock, Search, FileText } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'

const steps = [
  {
    icon: Clock,
    title: 'Réponse en moins de 2h',
    description: 'On vous répond rapidement avec toutes les informations nécessaires.',
  },
  {
    icon: Search,
    title: 'Vérification disponibilité',
    description: 'On contacte le vendeur en Chine via WeChat pour confirmer.',
  },
  {
    icon: FileText,
    title: 'Devis personnalisé',
    description: 'On vous envoie tous les détails et le prix final.',
  },
]

export default function AfterWhatsApp() {
  return (
    <section className="py-20 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight text-center mb-4">
            Ce qui se passe après votre message WhatsApp
          </h2>
          <p className="text-gray-600 text-center max-w-xl mx-auto mb-14">
            Un processus simple, rapide et transparent.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-brand-500" />
                </div>
                <span className="text-xs font-bold text-brand-500 mb-2 block">Étape {i + 1}</span>
                <h3 className="font-semibold text-[#111827] mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
