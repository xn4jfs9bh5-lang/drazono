'use client'

import { useState } from 'react'
import FadeIn from '@/components/motion/FadeIn'
import { Calculator, MessageCircle } from 'lucide-react'
import { EUR_TO_FCFA, WHATSAPP_NUMBER } from '@/lib/constants'

const COUNTRIES = [
  { name: 'Burkina Faso', duty: 0.30, transport: 1200 },
  { name: 'Sénégal', duty: 0.25, transport: 1100 },
  { name: 'Côte d\'Ivoire', duty: 0.25, transport: 1100 },
  { name: 'Mali', duty: 0.30, transport: 1300 },
  { name: 'Bénin', duty: 0.25, transport: 1000 },
  { name: 'Togo', duty: 0.25, transport: 1000 },
  { name: 'Niger', duty: 0.30, transport: 1400 },
  { name: 'France', duty: 0.10, transport: 800 },
  { name: 'Belgique', duty: 0.10, transport: 850 },
  { name: 'Canada', duty: 0.15, transport: 1500 },
  { name: 'Autre', duty: 0.20, transport: 1200 },
]

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n))
}

export default function CostSimulator() {
  const [price, setPrice] = useState(15000)
  const [countryIdx, setCountryIdx] = useState(0)

  const country = COUNTRIES[countryIdx]
  const transport = country.transport
  const duties = Math.round(price * country.duty)
  const total = price + transport + duties
  const totalFcfa = total * EUR_TO_FCFA

  const waMsg = `Bonjour, je souhaite un devis précis pour un véhicule à ${fmt(price)}€ livré au ${country.name}. Merci !`

  return (
    <section id="simulateur" className="py-20 bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-[#2563EB]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-6 h-6 text-[#2563EB]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
              Estimez votre budget total
            </h2>
            <p className="text-gray-500 mt-2">
              Prix véhicule + transport + douane estimés
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix du véhicule (EUR)</label>
                <input
                  type="number"
                  value={price || ''}
                  onChange={e => setPrice(Number(e.target.value) || 0)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="15000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pays de destination</label>
                <select
                  value={countryIdx}
                  onChange={e => setCountryIdx(Number(e.target.value))}
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  {COUNTRIES.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {price > 0 && (
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Prix véhicule</span>
                  <span className="text-[#111827] font-medium">{fmt(price)} &euro;</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transport estimé</span>
                  <span className="text-[#111827] font-medium">{fmt(transport)} &euro;</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Droits de douane estimés (~{Math.round(country.duty * 100)}%)</span>
                  <span className="text-[#111827] font-medium">{fmt(duties)} &euro;</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-semibold text-[#111827]">Total estimé</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#2563EB]">{fmt(total)} &euro;</p>
                    <p className="text-sm text-gray-500">≈ {fmt(totalFcfa)} FCFA</p>
                  </div>
                </div>
              </div>
            )}

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-medium text-sm transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Obtenir un devis précis sur WhatsApp
            </a>

            <p className="text-xs text-gray-400 text-center mt-4">
              Estimation indicative. Devis personnalisé gratuit via WhatsApp.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
