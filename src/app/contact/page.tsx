'use client'

import { useState } from 'react'
import { MessageCircle, Mail, Send } from 'lucide-react'
import { WHATSAPP_URL, CONTACT_EMAIL } from '@/lib/constants'
import FadeIn from '@/components/motion/FadeIn'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Save to Supabase contact_requests table
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
            <p className="text-gray-500">
              Réponse moyenne en moins de 2 heures.
            </p>
          </div>
        </FadeIn>

        {/* WhatsApp CTA */}
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

        {/* Form */}
        <FadeIn delay={0.2}>
          <div className="bg-[#FAFAFA] rounded-2xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[#111827] mb-6">Formulaire de contact</h2>

            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">Message envoyé !</h3>
                <p className="text-gray-500">Nous vous répondrons dans les plus brefs délais.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <select
                    required
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="vehicle-info">Infos sur un véhicule</option>
                    <option value="transport-quote">Devis transport</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Envoyer
                </button>
              </form>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
