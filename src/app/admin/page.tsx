'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Car, Users, MessageSquare, Bell, Plus,
  Eye, Heart, TrendingUp
} from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import { MOCK_VEHICLES } from '@/lib/mock-data'
import { BRANDS, BODY_TYPES, FUEL_TYPES, TRANSMISSIONS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'

const adminTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vehicles', label: 'Véhicules', icon: Car },
  { id: 'add-vehicle', label: 'Ajouter', icon: Plus },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'requests', label: 'Demandes', icon: MessageSquare },
  { id: 'alerts', label: 'Alertes', icon: Bell },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for Supabase to restore session from cookies before checking
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) {
          // No session after auth is ready → not logged in
          if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
            window.location.href = '/login'
          }
          return
        }

        // Session exists — check admin role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (!profile || profile.role !== 'admin') {
          window.location.href = '/espace-client'
          return
        }

        setAuthorized(true)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const vehicles = MOCK_VEHICLES
  const available = vehicles.filter(v => v.status === 'disponible').length
  const sold = vehicles.filter(v => v.status === 'vendu').length
  const topViewed = [...vehicles].sort((a, b) => b.views_count - a.views_count).slice(0, 5)

  if (loading || !authorized) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Vérification des permissions...</p>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
              Panel Admin
            </h1>
            <span className="text-xs font-medium px-3 py-1 bg-red-100 text-red-700 rounded-full">
              Admin
            </span>
          </div>
        </FadeIn>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <nav className="w-full md:w-52 shrink-0 space-y-1">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0F172A] text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Véhicules en ligne', value: available, icon: Car, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Véhicules vendus', value: sold, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Clients inscrits', value: 0, icon: Users, color: 'bg-purple-50 text-purple-600' },
                    { label: 'Contacts reçus', value: 0, icon: MessageSquare, color: 'bg-amber-50 text-amber-600' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-bold text-[#111827]">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Top viewed */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-[#111827] mb-4 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    Top 5 — Plus consultés
                  </h3>
                  <div className="space-y-3">
                    {topViewed.map((v, i) => (
                      <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-700">{i + 1}. {v.brand} {v.model} {v.year}</span>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{v.views_count}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />0</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vehicles' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-[#111827]">Gestion des véhicules</h3>
                  <button
                    onClick={() => setActiveTab('add-vehicle')}
                    className="flex items-center gap-2 h-9 px-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 text-gray-500 font-medium">Véhicule</th>
                        <th className="text-left py-3 text-gray-500 font-medium">Prix</th>
                        <th className="text-left py-3 text-gray-500 font-medium">État</th>
                        <th className="text-left py-3 text-gray-500 font-medium">Statut</th>
                        <th className="text-left py-3 text-gray-500 font-medium">Vues</th>
                        <th className="text-right py-3 text-gray-500 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((v) => (
                        <tr key={v.id} className="border-b border-gray-50">
                          <td className="py-3 font-medium text-[#111827]">{v.brand} {v.model} {v.year}</td>
                          <td className="py-3 text-gray-600">{new Intl.NumberFormat('fr-FR').format(v.price_eur)} €</td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${v.condition === 'neuf' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {v.condition}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              v.status === 'disponible' ? 'bg-blue-100 text-blue-700' :
                              v.status === 'vendu' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500">{v.views_count}</td>
                          <td className="py-3 text-right">
                            <button className="text-xs text-[#2563EB] hover:underline mr-3">Modifier</button>
                            <button className="text-xs text-red-500 hover:underline">Supprimer</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'add-vehicle' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-[#111827] mb-6">Ajouter un véhicule</h3>
                <form className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                      <select className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        <option value="">Sélectionner</option>
                        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                      <input type="text" className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                      <input type="number" className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix EUR</label>
                      <input type="number" className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" placeholder="Le FCFA se calcule auto" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage</label>
                      <input type="number" className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Carburant</label>
                      <select className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                      <select className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Puissance</label>
                      <input type="text" className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" placeholder="ex: 150ch" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                      <input type="text" className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Places</label>
                      <input type="number" className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Portes</label>
                      <input type="number" className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type de carrosserie</label>
                      <select className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
                      <select className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        <option value="neuf">Neuf</option>
                        <option value="occasion">Occasion</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={4} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                      <p className="text-sm text-gray-400">Glissez vos photos ici ou cliquez pour parcourir</p>
                      <p className="text-xs text-gray-300 mt-1">PNG, JPG jusqu&apos;à 10MB</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" className="rounded border-gray-300" />
                      Mis en avant (apparaît sur l&apos;accueil)
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" className="h-10 px-6 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
                      Publier
                    </button>
                    <button type="button" className="h-10 px-6 border border-gray-200 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
                      Brouillon
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-[#111827] mb-6">Clients inscrits</h3>
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">Aucun client inscrit pour le moment.</p>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-[#111827] mb-6">Demandes de contact</h3>
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">Aucune demande pour le moment.</p>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-[#111827] mb-6">Alertes internes</h3>
                <div className="space-y-3">
                  {vehicles.filter(v => v.views_count > 50).map(v => (
                    <div key={v.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                      <span className="text-sm text-amber-800">
                        <strong>{v.brand} {v.model}</strong> a dépassé {v.views_count} vues
                      </span>
                      <Eye className="w-4 h-4 text-amber-600" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
