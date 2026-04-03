'use client'

import { useRef } from 'react'
import FadeIn from '@/components/motion/FadeIn'
import { useInView } from 'framer-motion'

const savings = [
  { model: 'BYD Seal EV', europe: 35000, drazono: 18500, percent: 47 },
  { model: 'Haval H6', europe: 28000, drazono: 14200, percent: 49 },
  { model: 'Chery Tiggo 8', europe: 32000, drazono: 16800, percent: 47 },
  { model: 'MG4 EV', europe: 25000, drazono: 13800, percent: 45 },
]

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

function AnimatedPercent({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <span ref={ref} className="inline-flex items-center gap-1 text-emerald-700 font-bold text-base">
      -{isInView ? value : 0}%
    </span>
  )
}

export default function SavingsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
              Combien pouvez-vous économiser ?
            </h2>
            <p className="text-gray-600 mt-3 max-w-xl mx-auto">
              Comparez les prix européens avec les prix DRAZONO, direct usine Chine.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 text-gray-600 font-medium">Modèle</th>
                  <th className="text-right py-4 text-gray-600 font-medium">Prix Europe</th>
                  <th className="text-right py-4 text-gray-600 font-medium">Prix DRAZONO</th>
                  <th className="text-right py-4 text-gray-600 font-medium">Économie</th>
                </tr>
              </thead>
              <tbody>
                {savings.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-medium text-[#111827]">{row.model}</td>
                    <td className="py-4 text-right text-gray-400 line-through">{formatPrice(row.europe)} &euro;</td>
                    <td className="py-4 text-right font-bold text-brand-500">{formatPrice(row.drazono)} &euro;</td>
                    <td className="py-4 text-right">
                      <AnimatedPercent value={row.percent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>

        <FadeIn delay={0.5}>
          <p className="text-center text-xs text-gray-400 mt-6">
            Prix indicatifs hors transport et douane. Devis personnalisé gratuit sur WhatsApp.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
