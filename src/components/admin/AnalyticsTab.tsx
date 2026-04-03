'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Eye, MessageCircle, Mail, Users, Smartphone, Monitor, Loader2, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DashboardData {
  visitsPerDay: { date: string; count: number }[]
  topPages: { page: string; views: number }[]
  totals: { totalViews: number; vehicleViews: number; whatsappClicks: number; newsletterSignups: number; contactForms: number }
  devices: { mobile: number; desktop: number }
  sources: { source: string; count: number }[]
  funnel: { visitors: number; vehicleViews: number; whatsappClicks: number; contacts: number }
}

const COLORS = ['#1845CC', '#7C3AED', '#10B981', '#F59E0B']

export default function AnalyticsTab() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-400">Chargement analytics...</span>
      </div>
    )
  }

  if (!data) {
    return <p className="text-center text-gray-400 py-12">Impossible de charger les analytics.</p>
  }

  const deviceData = [
    { name: 'Mobile', value: data.devices.mobile },
    { name: 'Desktop', value: data.devices.desktop },
  ].filter(d => d.value > 0)

  const funnelSteps = [
    { label: 'Visiteurs', value: data.funnel.visitors, color: 'bg-blue-500' },
    { label: 'Vues vehicules', value: data.funnel.vehicleViews, color: 'bg-indigo-500' },
    { label: 'Clics WhatsApp', value: data.funnel.whatsappClicks, color: 'bg-emerald-500' },
    { label: 'Demandes', value: data.funnel.contacts, color: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Visites (7j)', value: data.totals.totalViews, icon: Eye, color: 'text-blue-600 bg-blue-50' },
          { label: 'Vues vehicules', value: data.totals.vehicleViews, icon: BarChart3, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Clics WhatsApp', value: data.totals.whatsappClicks, icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Inscriptions', value: data.totals.newsletterSignups, icon: Mail, color: 'text-violet-600 bg-violet-50' },
          { label: 'Contacts', value: data.totals.contactForms, icon: Users, color: 'text-amber-600 bg-amber-50' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${kpi.color}`}>
              <kpi.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-[#111827]">{kpi.value}</p>
            <p className="text-xs text-gray-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visits chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            Visites par jour
          </h3>
          {data.visitsPerDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.visitsPerDay}>
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1845CC" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">Pas encore de donnees</p>
          )}
        </div>

        {/* Device split */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-gray-400" />
            Appareils
          </h3>
          {deviceData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                    {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-gray-600"><Monitor className="w-3 h-3" />Desktop</span>
                <span className="flex items-center gap-1.5 text-xs text-gray-600"><Smartphone className="w-3 h-3" />Mobile</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">Pas de donnees</p>
          )}
        </div>
      </div>

      {/* Funnel + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-[#111827] mb-4">Entonnoir de conversion</h3>
          <div className="space-y-3">
            {funnelSteps.map((step, i) => {
              const rate = i > 0 && funnelSteps[i - 1].value > 0
                ? Math.round((step.value / funnelSteps[i - 1].value) * 100)
                : 100
              const width = funnelSteps[0].value > 0
                ? Math.max(10, (step.value / funnelSteps[0].value) * 100)
                : 10
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{step.label}</span>
                    <span className="text-gray-500">{step.value} {i > 0 ? `(${rate}%)` : ''}</span>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${step.color} rounded-full transition-all`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sources */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-[#111827] mb-4">Sources de trafic</h3>
          {data.sources.length > 0 ? (
            <div className="space-y-3">
              {data.sources.sort((a, b) => b.count - a.count).map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{s.source}</span>
                  <span className="text-sm font-medium text-[#111827]">{s.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">Pas encore de donnees</p>
          )}
        </div>
      </div>

      {/* Top pages */}
      {data.topPages.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-[#111827] mb-4">Top pages</h3>
          <div className="space-y-2">
            {data.topPages.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate mr-4">{p.page}</span>
                <span className="font-medium text-[#111827] shrink-0">{p.views}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
