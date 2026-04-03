'use client'

import { useState } from 'react'
import { MessageCircle, Mail, Send } from 'lucide-react'
import { WHATSAPP_URL, CONTACT_EMAIL } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import FadeIn from '@/components/motion/FadeIn'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('contact_requests').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject,
      message: form.message.trim(),
    })

    if (insertError) {
      setError('Erreur lors de l\'envoi. Veuillez réessayer ou nous contacter sur WhatsApp.')
      setLoading(false)
      return
    }

    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight mb-4">
              Contactez-nous
            </h1>
            <p className="text-gray-600">
              Réponse moyenne en moins de 2 heures.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full p-5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-2xl transition-colors mb-4"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-lg font-semibold">Écrivez-nous sur WhatsApp</span>
          </a>
        </FadeIn>

        <FadeIn delay={0.15}>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center justify-center gap-2 w-full p-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors mb-10"
          >
            <Mail className="w-4 h-4" />
            <span className="text-sm">{CONTACT_EMAIL}</span>
          </a>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="bg-[#FAFAFA] rounded-2xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[#111827] mb-6">Formulaire de contact</h2>

            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">Message envoyé !</h3>
                <p className="text-gray-600">Nous vous répondrons dans les plus brefs délais.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    maxLength={200}
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <select
                    required
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="Infos sur un véhicule">Infos sur un véhicule</option>
                    <option value="Devis transport">Devis transport</option>
                    <option value="Partenariat">Partenariat</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    maxLength={2000}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer'}
                </button>
              </form>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
