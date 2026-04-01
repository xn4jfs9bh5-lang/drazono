'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import CountUp from './CountUp'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-gradient-to-b from-[#0F172A] to-[#1E293B] overflow-hidden">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-gray-400 mb-4 font-medium">
            Import direct Chine
          </p>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          Conduisez le futur.
          <br />
          <span className="text-white/50">Au meilleur prix.</span>
        </motion.h1>

        <motion.p
          className="mt-6 text-gray-400 text-base sm:text-lg max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Véhicules neufs et d&apos;occasion depuis la Chine. Prix réel vendeur,
          livraison mondiale en option, zéro intermédiaire.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          <Link
            href="/catalogue"
            className="inline-flex items-center justify-center bg-white text-[#0F172A] px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            Explorer le catalogue
          </Link>
          <Link
            href="/comment-ca-marche"
            className="inline-flex items-center justify-center border border-white/30 text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            Comment ça marche
          </Link>
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div
        className="relative z-10 border-t border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {[
              { value: 200, suffix: '+', label: 'Véhicules' },
              { value: 15, suffix: '+', label: 'Marques' },
              { value: 30, suffix: '', label: 'Pays livrés' },
              { value: 2, suffix: 'h', label: 'Réponse moyenne' },
            ].map((stat, i) => (
              <div key={i} className="py-6 px-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  <CountUp end={stat.value} />{stat.suffix}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
