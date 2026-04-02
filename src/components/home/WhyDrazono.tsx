'use client'

import { BadgeCheck, DollarSign, Globe, Headphones } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import { motion } from 'framer-motion'

const reasons = [
  {
    icon: DollarSign,
    title: 'Prix réel vendeur',
    description: 'Zéro intermédiaire, vous payez le prix du vendeur chinois.',
    gradient: 'from-blue-500/10 to-indigo-500/5',
  },
  {
    icon: BadgeCheck,
    title: 'Véhicules vérifiés',
    description: 'Disponibilité et photos confirmées avant publication.',
    gradient: 'from-emerald-500/10 to-teal-500/5',
  },
  {
    icon: Globe,
    title: 'Livraison mondiale',
    description: 'Transport en option vers 30+ pays. Devis personnalisé.',
    gradient: 'from-violet-500/10 to-purple-500/5',
  },
  {
    icon: Headphones,
    title: 'Support WhatsApp',
    description: 'Réponse moyenne en moins de 2 heures.',
    gradient: 'from-amber-500/10 to-orange-500/5',
  },
]

export default function WhyDrazono() {
  return (
    <section className="py-20 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-[-0.02em] text-center">
            Pourquoi DRAZONO
          </h2>
          <span className="section-title-line" />
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {reasons.map((reason, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <motion.div
                className={`bg-gradient-to-br ${reason.gradient} rounded-2xl p-6 border border-gray-100/80 text-center h-full`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm"
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <reason.icon className="w-7 h-7 text-[#2563EB]" />
                </motion.div>
                <h3 className="font-semibold text-[#111827] mb-2 text-[15px]">{reason.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{reason.description}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
