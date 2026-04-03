'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Car, Globe, Clock, Tag } from 'lucide-react'
import CountUp from './CountUp'

export default function HeroSection() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/catalogue?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/catalogue')
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=1920&q=80)' }}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A1325]/90 via-[#0A1325]/80 to-[#0A1325]/70" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Subtle particles */}
      <div className="hero-particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            style={{
              left: `${8 + (i * 7.5) % 85}%`,
              top: `${15 + (i * 11) % 70}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${5 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-gray-400 mb-4 font-medium">
            Import direct Chine
          </p>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-[-0.02em]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
        >
          <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Conduisez le futur.
          </span>
          <br />
          <span className="text-white/40">Au meilleur prix.</span>
        </motion.h1>

        {/* Decorative line under title */}
        <motion.div
          className="mt-4 h-[2px] w-16 rounded-full"
          style={{ background: 'var(--gradient-brand)' }}
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 64 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        />

        <motion.p
          className="mt-6 text-gray-400 text-base sm:text-lg max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          Véhicules neufs et d&apos;occasion depuis la Chine. Prix réel vendeur,
          livraison mondiale en option, zéro intermédiaire.
        </motion.p>

        {/* Search bar */}
        <motion.form
          onSubmit={handleSearch}
          className="mt-8 flex w-full max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.38 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Recherchez une marque, un modèle..."
              className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-l-full bg-white/95 backdrop-blur-sm text-[#111827] text-sm sm:text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xl"
            />
          </div>
          <button
            type="submit"
            className="btn-shimmer h-12 sm:h-14 px-6 sm:px-8 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded-r-full transition-colors shadow-2xl"
          >
            Rechercher
          </button>
        </motion.form>

        <motion.div
          className="mt-6 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <Link
            href="/catalogue"
            className="btn-shimmer inline-flex items-center justify-center bg-white text-[#0A1325] px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors shadow-lg"
          >
            Explorer le catalogue
          </Link>
          <Link
            href="/#simulateur"
            className="inline-flex items-center justify-center border border-white/25 text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            Voir les prix
          </Link>
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div
        className="relative z-10 border-t border-white/10 bg-[#0A1325]/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.65 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {[
              { value: 50, suffix: '+', label: 'Véhicules', icon: Car },
              { value: 15, suffix: '+', label: 'Marques', icon: Tag },
              { value: 30, suffix: '', label: 'Pays livrés', icon: Globe },
              { value: 2, suffix: 'h', label: 'Réponse moyenne', icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="py-6 px-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <stat.icon className="w-4 h-4 text-brand-500" />
                  <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {stat.suffix === 'h' ? '<' : ''}<CountUp end={stat.value} duration={1500} />{stat.suffix}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
