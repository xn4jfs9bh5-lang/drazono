'use client'

import { useState } from 'react'
import FadeIn from '@/components/motion/FadeIn'
import { Bell, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      toast.error('Entrez un email valide')
      return
    }

    setLoading(true)
    const { error } = await supabase
      .from('email_subscriptions')
      .insert({ email: email.trim().toLowerCase() })

    if (error) {
      if (error.code === '23505') {
        toast.info('Vous êtes déjà inscrit !')
        setDone(true)
      } else {
        toast.error('Erreur, réessayez plus tard')
      }
    } else {
      setDone(true)
      toast.success('Inscription réussie !')
    }
    setLoading(false)
  }

  return (
    <section className="py-16 bg-[#0F172A]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6 text-[#2563EB]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Ne ratez aucune nouvelle arrivée
          </h2>
          <p className="text-gray-400 mt-2 mb-8">
            Soyez alerté en avant-première des nouveaux véhicules
          </p>

          {done ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Vous serez alerté en avant-première !</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                className="flex-1 h-12 rounded-l-full bg-white/10 border border-white/20 text-white placeholder:text-gray-500 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-12 px-6 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white rounded-r-full font-medium text-sm transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Je m\'abonne'}
              </button>
            </form>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Soyez parmi les premiers informés
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
