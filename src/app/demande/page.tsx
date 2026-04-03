'use client'

import { useState } from 'react'
import FadeIn from '@/components/motion/FadeIn'
import { BRANDS, BODY_TYPES, WHATSAPP_NUMBER } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { MessageCircle, CheckCircle, Loader2, Search } from 'lucide-react'

const COUNTRIES = [
  'Burkina Faso', 'Sénégal', 'Côte d\'Ivoire', 'Mali', 'Bénin',
  'Togo', 'Niger', 'France', 'Belgique', 'Canada', 'Autre',
]

export default function DemandePage() {
  const [form, setForm] = useState({
    name: '', email: '', whatsapp: '', brand: '', model: '',
    body_type: '', budget: '', country: '', message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Entrez votre nom'); return }
    if (!form.email.trim() || !form.email.includes('@')) { toast.error('Entrez un email valide'); return }
    if (!form.whatsapp.trim()) { toast.error('Entrez votre numéro WhatsApp'); return }

    setSubmitting(true)
    const { error } = await supabase.from('contact_requests').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: 'sourcing_personnalise',
      message: [
        `WhatsApp: ${form.whatsapp}`,
        form.brand && `Marque: ${form.brand}`,
        form.model && `Modèle: ${form.model}`,
        form.body_type && `Type: ${form.body_type}`,
        form.budget && `Budget: ${form.budget}€`,
        form.country && `Pays: ${form.country}`,
        form.message && `Message: ${form.message}`,
      ].filter(Boolean).join('\n'),
    })

    if (error) {
      toast.error('Erreur, réessayez')
    } else {
      setDone(true)
    }
    setSubmitting(false)
  }

  const inputClass = 'w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

  if (done) {
    const waMsg = `Bonjour, je viens de soumettre une demande personnalisée sur DRAZONO.\nNom: ${form.name}\nMarque: ${form.brand || 'Non précisée'}\nBudget: ${form.budget || 'Non précisé'}€\nPays: ${form.country || 'Non précisé'}`
    return (
      <div className="pt-28 pb-20 min-h-screen">
        <div className="max-w-md mx-auto px-4 text-center">
          <FadeIn>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#111827] mb-3">Demande envoyée !</h1>
            <p className="text-gray-600 mb-8">
              Notre équipe va analyser votre demande et vous recontacter sous 24h.
              Pour accélérer le processus, contactez-nous directement sur WhatsApp.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-3 rounded-full font-medium text-sm transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Continuer sur WhatsApp
            </a>
          </FadeIn>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-brand-500" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
              Vous ne trouvez pas votre véhicule idéal ?
            </h1>
            <p className="text-gray-600 mt-3 max-w-lg mx-auto">
              Dites-nous ce que vous cherchez, on sourcera pour vous en Chine.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} className={inputClass} placeholder="+226..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marque souhaitée</label>
                <select value={form.brand} onChange={e => set('brand', e.target.value)} className={inputClass}>
                  <option value="">Toutes</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modèle (optionnel)</label>
                <input type="text" value={form.model} onChange={e => set('model', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de carrosserie</label>
                <select value={form.body_type} onChange={e => set('body_type', e.target.value)} className={inputClass}>
                  <option value="">Tous</option>
                  {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget maximum (EUR)</label>
                <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays de destination</label>
                <select value={form.country} onChange={e => set('country', e.target.value)} className={inputClass}>
                  <option value="">Sélectionner</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message / précisions</label>
              <textarea
                value={form.message}
                onChange={e => set('message', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Envoyer ma demande
            </button>
          </form>
        </FadeIn>
      </div>
    </div>
  )
}
