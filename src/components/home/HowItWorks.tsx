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
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-[-0.02em] text-center">
            Comment ça marche
          </h2>
          <span className="section-title-line" />
          <p className="text-gray-600 text-center max-w-2xl mx-auto mt-4 mb-14">
            De la découverte à la livraison, un processus simple et transparent.
          </p>
        </FadeIn>

        {/* Desktop: connected steps with vertical line */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Vertical connecting line — desktop only */}
          <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-[#1845CC]/20 via-[#1845CC]/10 to-transparent -translate-x-1/2 pointer-events-none" />

          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="relative p-6 rounded-2xl bg-[#FAFAFA] border border-gray-100 hover:border-brand-500/20 transition-all hover:shadow-md group">
                <span
                  className="text-3xl font-bold tracking-tight mb-3 block"
                  style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <step.icon className="w-8 h-8 text-brand-500 mb-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                <h3 className="font-semibold text-[#111827] text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
