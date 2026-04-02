'use client'

import { Shield, CheckCircle, Ship, Zap, Flag } from 'lucide-react'
import { motion } from 'framer-motion'

const items = [
  { icon: Shield, label: 'Achat sécurisé', color: 'text-[#2563EB]' },
  { icon: CheckCircle, label: 'Véhicules vérifiés', color: 'text-emerald-600' },
  { icon: Ship, label: 'Livraison mondiale', color: 'text-indigo-600' },
  { icon: Zap, label: 'Réponse < 2h', color: 'text-amber-600' },
  { icon: Flag, label: 'Direct Chine', color: 'text-red-600' },
]

export default function TrustBanner() {
  return (
    <section className="bg-white border-y border-gray-100 py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 overflow-x-auto no-scrollbar">
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2.5 shrink-0"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center ${item.color}`}>
                <item.icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-medium text-[#111827] whitespace-nowrap">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
