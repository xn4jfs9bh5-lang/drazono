'use client'

import { Check, X } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'

const rows = [
  {
    criteria: 'Origine véhicules',
    drazono: 'Chine (prix usine)',
    others: 'Europe (prix revendeur)',
    win: true,
  },
  {
    criteria: 'Contact',
    drazono: 'WhatsApp direct',
    others: 'Formulaires froids',
    win: true,
  },
  {
    criteria: 'Prix',
    drazono: 'Prix réel vendeur',
    others: 'Prix + marge revendeur',
    win: true,
  },
  {
    criteria: 'Vérification',
    drazono: 'Chaque véhicule vérifié',
    others: 'Pas de vérification',
    win: true,
  },
  {
    criteria: 'Design',
    drazono: 'Mobile-first 2026',
    others: 'Desktop, chargé de pubs',
    win: true,
  },
  {
    criteria: 'Cible',
    drazono: 'Mondiale',
    others: 'Marché local',
    win: true,
  },
]

export default function ComparisonTable() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight text-center mb-14">
            DRAZONO vs Autres plateformes
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-sm font-medium text-gray-500 py-4 pr-4">Critère</th>
                  <th className="text-left text-sm font-bold text-[#2563EB] py-4 px-4">DRAZONO</th>
                  <th className="text-left text-sm font-medium text-gray-400 py-4 pl-4">AutoScout24 / LaCentrale</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="text-sm text-gray-600 py-4 pr-4">{row.criteria}</td>
                    <td className="text-sm text-[#111827] font-medium py-4 px-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-500" />
                        {row.drazono}
                      </span>
                    </td>
                    <td className="text-sm text-gray-400 py-4 pl-4">
                      <span className="inline-flex items-center gap-1.5">
                        <X className="w-4 h-4 text-red-400" />
                        {row.others}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
