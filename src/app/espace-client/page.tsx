'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Heart, Bell, Clock, FileText, LogOut } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import { supabase } from '@/lib/supabase'
import { BRANDS, BODY_TYPES, FUEL_TYPES } from '@/lib/constants'

const tabs = [
  { id: 'profile', label: 'Mon profil', icon: User },
  { id: 'favorites', label: 'Mes favoris', icon: Heart },
  { id: 'alerts', label: 'Mes alertes', icon: Bell },
  { id: 'history', label: 'Consultés récemment', icon: Clock },
  { id: 'requests', label: 'Mes demandes', icon: FileText },
]

export default function EspaceClientPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', country: '', city: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('name, email, phone, country, city')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile({
        name: data.name || '',
        email: data.email || user.email || '',
        phone: data.phone || '',
        country: data.country || '',
        city: data.city || '',
      })
    } else {
      setProfile(p => ({ ...p, email: user.email || '' }))
    }
    setLoading(false)
    }
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('profiles').update({
      name: profile.name.trim(),
      phone: profile.phone.trim() || null,
      country: profile.country.trim() || null,
      city: profile.city.trim() || null,
    }).eq('id', user.id)

    setSaving(false)
    setSaveMsg(error ? 'Erreur lors de la sauvegarde.' : 'Profil mis à jour !')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[#111827] tracking-tight">
              Espace client
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </FadeIn>

        <div className="flex flex-col md:flex-row gap-8">
          <FadeIn delay={0.1}>
            <nav className="w-full md:w-56 shrink-0 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#2563EB]/10 text-[#2563EB] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-lg font-bold text-[#111827] mb-6">Mon profil</h2>
                  <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input
                        type="text"
                        required
                        maxLength={100}
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <input
                        type="tel"
                        maxLength={20}
                        value={profile.phone}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                      <input
                        type="text"
                        maxLength={50}
                        value={profile.country}
                        onChange={e => setProfile({ ...profile, country: e.target.value })}
                        className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                      <input
                        type="text"
                        maxLength={50}
                        value={profile.city}
                        onChange={e => setProfile({ ...profile, city: e.target.value })}
                        className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    {saveMsg && (
                      <p className={`text-sm ${saveMsg.includes('Erreur') ? 'text-red-500' : 'text-emerald-600'}`}>
                        {saveMsg}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="h-10 px-6 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div>
                  <h2 className="text-lg font-bold text-[#111827] mb-6">Mes favoris</h2>
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">Aucun favori pour le moment.</p>
                    <p className="text-sm text-gray-400 mt-1">Cliquez sur le coeur d&apos;un véhicule pour l&apos;ajouter.</p>
                  </div>
                </div>
              )}

              {activeTab === 'alerts' && (
                <div>
                  <h2 className="text-lg font-bold text-[#111827] mb-6">Mes alertes</h2>
                  <p className="text-sm text-gray-500 mb-6">Configurez une alerte pour être notifié quand un véhicule correspondant est ajouté.</p>
                  <form className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                      <select className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        <option value="">Toutes les marques</option>
                        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget max (&#8364;)</label>
                      <input type="number" className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" placeholder="ex: 15000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        <option value="">Tous les types</option>
                        {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Carburant</label>
                      <select className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        <option value="">Tous</option>
                        {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <button type="button" className="h-10 px-6 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
                      Créer l&apos;alerte
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h2 className="text-lg font-bold text-[#111827] mb-6">Consultés récemment</h2>
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">Aucun véhicule consulté récemment.</p>
                  </div>
                </div>
              )}

              {activeTab === 'requests' && (
                <div>
                  <h2 className="text-lg font-bold text-[#111827] mb-6">Mes demandes</h2>
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">Aucune demande en cours.</p>
                    <p className="text-sm text-gray-400 mt-1">Vos demandes de contact et devis apparaîtront ici.</p>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
