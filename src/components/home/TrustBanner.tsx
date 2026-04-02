'use client'

import { Shield, CheckCircle, Ship, Zap, Flag } from 'lucide-react'
import { motion } from 'framer-motion'

const items = [
  { icon: Shield, label: 'Achat sécurisé', color: 'text-[#2563EB] bg-blue-50' },
  { icon: CheckCircle, label: 'Véhicules vérifiés', color: 'text-emerald-600 bg-emerald-50' },
  { icon: Ship, label: 'Livraison mondiale', color: 'text-indigo-600 bg-indigo-50' },
  { icon: Zap, label: 'Réponse &lt; 2h', color: 'text-amber-600 bg-amber-50' },
  { icon: Flag, label: 'Direct Chine', color: 'text-red-600 bg-red-50' },
]

export default function TrustBanner() {
  return (
    <section className="bg-white border-y border-gray-100 py-5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 sm:gap-6 sm:justify-between overflow-x-auto no-scrollbar px-1">
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2.5 shrink-0"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              viewport={{ once: true }}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <span
                className="text-sm font-medium text-[#111827] whitespace-nowrap"
                dangerouslySetInnerHTML={{ __html: item.label }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
