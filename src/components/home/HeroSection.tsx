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

        {/* Search bar */}
        <motion.form
          onSubmit={handleSearch}
          className="mt-8 flex w-full max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Recherchez une marque, un modèle, un type..."
              className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-l-full bg-white text-[#111827] text-sm sm:text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] shadow-lg"
            />
          </div>
          <button
            type="submit"
            className="h-12 sm:h-14 px-6 sm:px-8 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm rounded-r-full transition-colors shadow-lg"
          >
            Rechercher
          </button>
        </motion.form>

        <motion.div
          className="mt-6 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
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
              { value: 50, suffix: '+', label: 'Véhicules', icon: Car },
              { value: 15, suffix: '+', label: 'Marques', icon: Tag },
              { value: 30, suffix: '', label: 'Pays livrés', icon: Globe },
              { value: 2, suffix: 'h', label: 'Réponse moyenne', icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="py-6 px-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <stat.icon className="w-4 h-4 text-[#2563EB]" />
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {stat.suffix === 'h' ? '<' : ''}<CountUp end={stat.value} />{stat.suffix}
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
