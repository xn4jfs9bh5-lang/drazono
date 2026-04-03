'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck, Star, UserCheck, Handshake } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import { supabase } from '@/lib/supabase'

export default function TrustProof() {
  const [requestCount, setRequestCount] = useState<number | null>(null)

  useEffect(() => {
    async function fetchCount() {
      const { count } = await supabase
        .from('contact_requests')
        .select('id', { count: 'exact', head: true })
      setRequestCount(count ?? 0)
    }
    fetchCount()
  }, [])

  return (
    <section className="py-16 sm:py-20 bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight mb-3">
              Ils nous font confiance
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Transparence, garanties concrètes et accompagnement humain.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Avis vérifiés */}
          <FadeIn delay={0.05}>
            <a
              href="https://g.page/r/drazono/review"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-2xl border border-gray-100 p-5 text-center hover:border-[#2563EB]/30 hover:shadow-sm transition-all"
            >
              <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="font-semibold text-[#111827] text-sm mb-1">Avis vérifiés</h3>
              <p className="text-xs text-gray-500">Consultez nos avis sur Google</p>
            </a>
          </FadeIn>

          {/* Fondateur vérifié */}
          <FadeIn delay={0.1}>
            <a
              href="https://www.linkedin.com/in/brayann-tarpaga"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-2xl border border-gray-100 p-5 text-center hover:border-[#2563EB]/30 hover:shadow-sm transition-all"
            >
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h3 className="font-semibold text-[#111827] text-sm mb-1">Fondateur vérifié</h3>
              <p className="text-xs text-gray-500">Brayann Tarpaga — LinkedIn</p>
            </a>
          </FadeIn>

          {/* Demandes traitées */}
          <FadeIn delay={0.15}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Handshake className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-[#111827] text-sm mb-1">
                {requestCount === null ? '...' : requestCount > 0 ? `${requestCount} demande${requestCount > 1 ? 's' : ''} traitée${requestCount > 1 ? 's' : ''}` : 'Premiers clients bienvenus'}
              </h3>
              <p className="text-xs text-gray-500">
                {requestCount !== null && requestCount > 0
                  ? 'Et ce n\'est que le début'
                  : 'Soyez parmi les premiers'}
              </p>
            </div>
          </FadeIn>

          {/* Acompte remboursable */}
          <FadeIn delay={0.2}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-[#111827] text-sm mb-1">Acompte 100% remboursable</h3>
              <p className="text-xs text-gray-500">Garanti par contrat</p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
