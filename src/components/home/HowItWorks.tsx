'use client'

import { Search, MessageCircle, ShieldCheck, CreditCard, ShoppingCart, Ship } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'

const steps = [
  {
    icon: Search,
    title: 'Parcourez le catalogue',
    description: 'Explorez nos véhicules vérifiés. Filtrez par marque, budget, type de carrosserie.',
  },
  {
    icon: MessageCircle,
    title: 'Contactez-nous sur WhatsApp',
    description: 'Posez vos questions, demandez des infos supplémentaires. Réponse en moins de 2h.',
  },
  {
    icon: ShieldCheck,
    title: 'Vérification en Chine',
    description: 'On contacte le vendeur via WeChat pour confirmer disponibilité, prix et photos récentes.',
  },
  {
    icon: CreditCard,
    title: 'Confirmez et versez l\'acompte',
    description: 'Un acompte de 10% sécurise le véhicule. Facture proforma fournie.',
  },
  {
    icon: ShoppingCart,
    title: 'Commande au vendeur',
    description: 'On finalise l\'achat auprès du vendeur chinois. Vous recevez une confirmation.',
  },
  {
    icon: Ship,
    title: 'Livraison (optionnelle)',
    description: 'Transport maritime jusqu\'à votre port/ville de destination. Devis personnalisé.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight text-center mb-4">
            Comment ça marche
          </h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-14">
            De la découverte à la livraison, un processus simple et transparent.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="relative p-6 rounded-2xl bg-[#FAFAFA] border border-gray-100 hover:border-[#2563EB]/20 transition-colors">
                <span className="text-xs font-bold text-[#2563EB] mb-3 block">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <step.icon className="w-8 h-8 text-[#2563EB] mb-4" strokeWidth={1.5} />
                <h3 className="font-semibold text-[#111827] text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
