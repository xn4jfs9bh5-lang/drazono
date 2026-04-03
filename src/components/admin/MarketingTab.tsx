'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Loader2, RefreshCw, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface FunnelData {
  visitors: number
  vehicleViews: number
  whatsappClicks: number
  contacts: number
}

interface TopVehicle {
  vehicle_id: string
  brand: string
  model: string
  clicks: number
}

const FUNNEL_COLORS = ['#1845CC', '#3B6EF8', '#25D366', '#D4A017']

export default function MarketingTab() {
  const [funnel, setFunnel] = useState<FunnelData | null>(null)
  const [topConverting, setTopConverting] = useState<TopVehicle[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setLoading(true)

    try {
      const res = await fetch('/api/analytics/dashboard')
      if (res.ok) {
        const data = await res.json()
        setFunnel(data.funnel)

        // Get top converting vehicles from topVehicles data
        if (data.topVehicles?.length > 0) {
          const vehicleIds = data.topVehicles.slice(0, 5).map((v: { id: string }) => v.id)
          const { data: vehicles } = await supabase
            .from('vehicles')
            .select('id, brand, model')
            .in('id', vehicleIds)

          const vehicleMap = new Map((vehicles ?? []).map(v => [v.id, v]))
          setTopConverting(
            data.topVehicles.slice(0, 5).map((v: { id: string; views: number }) => {
              const info = vehicleMap.get(v.id)
              return {
                vehicle_id: v.id,
                brand: info?.brand ?? 'N/A',
                model: info?.model ?? '',
                clicks: v.views,
              }
            })
          )
        }
      }
    } catch {
      // silent
    }

    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const funnelData = funnel ? [
    { name: 'Visiteurs', value: funnel.visitors },
    { name: 'Vues vehicules', value: funnel.vehicleViews },
    { name: 'Clics WhatsApp', value: funnel.whatsappClicks },
    { name: 'Formulaires', value: funnel.contacts },
  ] : []

  function pct(a: number, b: number): string {
    if (b === 0) return '0%'
    return `${Math.round((a / b) * 100)}%`
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#111827] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-500" />
          Marketing &amp; Conversion
        </h2>
        <button onClick={fetchData} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-medium text-[#111827] mb-4">Entonnoir de conversion (30 jours)</h3>
        {funnelData.length > 0 ? (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {funnelData.map((_, i) => (
                      <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Visiteur → Vue</p>
                <p className="text-lg font-bold text-[#111827]">{pct(funnel?.vehicleViews ?? 0, funnel?.visitors ?? 0)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Vue → WhatsApp</p>
                <p className="text-lg font-bold text-[#111827]">{pct(funnel?.whatsappClicks ?? 0, funnel?.vehicleViews ?? 0)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total conversion</p>
                <p className="text-lg font-bold text-[#111827]">{pct(funnel?.whatsappClicks ?? 0, funnel?.visitors ?? 0)}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">Pas de donnees disponibles</p>
        )}
      </div>

      {/* Top Converting Vehicles */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-medium text-[#111827] mb-4">Top vehicules (par vues)</h3>
        {topConverting.length > 0 ? (
          <div className="space-y-3">
            {topConverting.map((v, i) => (
              <div key={v.vehicle_id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-[#111827]">{v.brand} {v.model}</span>
                </div>
                <span className="text-sm font-semibold text-brand-500">{v.clicks} vues</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">Pas de donnees disponibles</p>
        )}
      </div>
    </div>
  )
}
