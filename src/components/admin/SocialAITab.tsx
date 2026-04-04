'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { EUR_TO_FCFA } from '@/lib/constants'
import type { Vehicle } from '@/lib/types'
import {
  Loader2, Calendar, Copy, Car, CheckCircle, Clock,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TikTokPost { script: string; hook: string; hashtags: string }
interface InstaPost { caption: string; hashtags: string; visual_suggestion: string }
interface FacebookPost { text: string; cta: string }

interface DayPlan {
  day: string
  theme: string
  tiktok: TikTokPost
  instagram: InstaPost
  facebook: FacebookPost
  whatsapp_status: string
}

interface VehiclePosts {
  tiktok: string
  instagram: string
  facebook: string
  whatsapp: string
  source: string
}

interface CalendarHistory {
  id: string
  created_at: string
  days: DayPlan[]
}

// ---------------------------------------------------------------------------
// Platform colors
// ---------------------------------------------------------------------------

const PLATFORM_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  tiktok: { bg: 'bg-black', text: 'text-white', label: 'TikTok' },
  instagram: { bg: 'bg-[#E1306C]', text: 'text-white', label: 'Instagram' },
  facebook: { bg: 'bg-[#1877F2]', text: 'text-white', label: 'Facebook' },
  whatsapp: { bg: 'bg-[#25D366]', text: 'text-white', label: 'WhatsApp' },
}

function PlatformBadge({ platform }: { platform: string }) {
  const s = PLATFORM_STYLES[platform] || { bg: 'bg-gray-200', text: 'text-gray-700', label: platform }
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success('Copié !')
        setTimeout(() => setCopied(false), 2000)
      }}
      className="p-1 rounded hover:bg-gray-100 transition-colors shrink-0"
      title="Copier"
    >
      {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
    </button>
  )
}

function fmt(n: number) { return new Intl.NumberFormat('fr-FR').format(n) }

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SocialAITab() {
  const [view, setView] = useState<'calendar' | 'vehicle' | 'history'>('calendar')

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-100 pb-3">
        {([
          { id: 'calendar' as const, label: 'Planning semaine', icon: Calendar },
          { id: 'vehicle' as const, label: 'Post véhicule', icon: Car },
          { id: 'history' as const, label: 'Historique', icon: Clock },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === tab.id ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'calendar' && <CalendarView />}
      {view === 'vehicle' && <VehiclePostView />}
      {view === 'history' && <HistoryView />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section A — Calendar View
// ---------------------------------------------------------------------------

function CalendarView() {
  const [days, setDays] = useState<DayPlan[]>([])
  const [generating, setGenerating] = useState(false)

  async function generateWeek() {
    setGenerating(true)
    try {
      const res = await fetch('/api/social/calendar', { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Erreur de génération')
        setGenerating(false)
        return
      }
      const data = await res.json()
      setDays(data.days ?? [])

      // Save to Supabase
      const weekStart = new Date().toISOString().slice(0, 10)
      await supabase.from('social_calendar').insert(
        (data.days ?? []).flatMap((d: DayPlan, i: number) => [
          { week_start: weekStart, day_number: i, theme: d.theme, platform: 'tiktok', content: JSON.stringify(d.tiktok), status: 'draft' },
          { week_start: weekStart, day_number: i, theme: d.theme, platform: 'instagram', content: JSON.stringify(d.instagram), status: 'draft' },
          { week_start: weekStart, day_number: i, theme: d.theme, platform: 'facebook', content: JSON.stringify(d.facebook), status: 'draft' },
          { week_start: weekStart, day_number: i, theme: d.theme, platform: 'whatsapp', content: d.whatsapp_status, status: 'draft' },
        ])
      )

      toast.success('Planning généré et sauvegardé !')
    } catch {
      toast.error('Erreur réseau')
    }
    setGenerating(false)
  }

  function exportWeek() {
    if (!days.length) return
    const text = days.map(d => {
      return `=== ${d.day} — ${d.theme} ===

[TikTok]
Hook: ${d.tiktok.hook}
Script: ${d.tiktok.script}
Hashtags: ${d.tiktok.hashtags}

[Instagram]
${d.instagram.caption}
Hashtags: ${d.instagram.hashtags}
Visuel: ${d.instagram.visual_suggestion}

[Facebook]
${d.facebook.text}
CTA: ${d.facebook.cta}

[WhatsApp Status]
${d.whatsapp_status}
`
    }).join('\n\n')
    navigator.clipboard.writeText(text)
    toast.success('Planning complet copié !')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={generateWeek}
          disabled={generating}
          className="flex items-center gap-2 h-10 px-5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération...</> : <><Calendar className="w-4 h-4" /> Générer planning semaine</>}
        </button>
        {days.length > 0 && (
          <button onClick={exportWeek} className="flex items-center gap-2 h-10 px-4 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Copy className="w-4 h-4" /> Exporter semaine
          </button>
        )}
      </div>

      {days.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {days.map((d, i) => (
            <DayCard key={i} day={d} />
          ))}
        </div>
      )}
    </div>
  )
}

function DayCard({ day }: { day: DayPlan }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
        <p className="font-semibold text-[#111827] text-sm">{day.day}</p>
        <p className="text-xs text-gray-500">{day.theme}</p>
      </div>
      <div className="p-3 space-y-3">
        {/* TikTok */}
        <PostBlock platform="tiktok" content={`${day.tiktok.hook}\n\n${day.tiktok.script}\n\n${day.tiktok.hashtags}`}>
          <p className="text-[11px] text-gray-400 mb-1 font-semibold uppercase">Hook:</p>
          <p className="text-xs text-[#111827] font-medium mb-1">{day.tiktok.hook}</p>
          <p className="text-xs text-gray-600 line-clamp-3">{day.tiktok.script}</p>
        </PostBlock>
        {/* Instagram */}
        <PostBlock platform="instagram" content={`${day.instagram.caption}\n\n${day.instagram.hashtags}`}>
          <p className="text-xs text-gray-600 line-clamp-3">{day.instagram.caption}</p>
          <p className="text-[10px] text-gray-400 mt-1 italic">Visuel: {day.instagram.visual_suggestion}</p>
        </PostBlock>
        {/* Facebook */}
        <PostBlock platform="facebook" content={`${day.facebook.text}\n\n${day.facebook.cta}`}>
          <p className="text-xs text-gray-600 line-clamp-3">{day.facebook.text}</p>
        </PostBlock>
        {/* WhatsApp */}
        <PostBlock platform="whatsapp" content={day.whatsapp_status}>
          <p className="text-xs text-gray-600">{day.whatsapp_status}</p>
        </PostBlock>
      </div>
    </div>
  )
}

function PostBlock({ platform, content, children }: { platform: string; content: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-lg p-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <PlatformBadge platform={platform} />
        <CopyBtn text={content} />
      </div>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section B — Vehicle Post
// ---------------------------------------------------------------------------

function VehiclePostView() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [posts, setPosts] = useState<VehiclePosts | null>(null)

  const loadVehicles = useCallback(async () => {
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    setVehicles(data ?? [])
  }, [])

  useEffect(() => { loadVehicles() }, [loadVehicles])

  const selected = vehicles.find(v => v.id === selectedId)

  async function generatePosts() {
    if (!selected) return
    setGenerating(true)
    setPosts(null)

    try {
      const res = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: selected.brand,
          model: selected.model,
          year: selected.year,
          price_eur: selected.price_eur,
          price_fcfa: selected.price_fcfa || selected.price_eur * EUR_TO_FCFA,
          condition: selected.condition,
          fuel_type: selected.fuel_type,
          power: selected.power || '',
          description: selected.description || '',
          url: `https://www.drazono.com/vehicule/${selected.id}`,
          vehicleId: selected.id,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur réseau' }))
        toast.error(err.error || 'Erreur de génération')
        setGenerating(false)
        return
      }

      const data = await res.json()
      setPosts(data)
      toast.success(data.source === 'cache' ? 'Posts chargés depuis le cache' : 'Posts générés !')
    } catch {
      toast.error('Erreur réseau')
    }
    setGenerating(false)
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-[#111827] mb-4">Post rapide véhicule</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Sélectionner un véhicule</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.brand} {v.model} {v.year} — {fmt(v.price_eur)} EUR</option>
              ))}
            </select>
          </div>
          {selected && (
            <div className="text-sm text-gray-600 flex flex-col justify-center">
              <p><strong>{selected.brand} {selected.model} {selected.year}</strong></p>
              <p>{fmt(selected.price_eur)} EUR / {fmt(selected.price_fcfa || selected.price_eur * EUR_TO_FCFA)} FCFA</p>
              <p>{selected.fuel_type} &middot; {selected.condition === 'neuf' ? 'Neuf' : 'Occasion'}</p>
            </div>
          )}
        </div>
        <button
          onClick={generatePosts}
          disabled={generating || !selectedId}
          className="flex items-center gap-2 h-10 px-5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération...</> : <><Car className="w-4 h-4" /> Générer posts</>}
        </button>
      </div>

      {posts && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { platform: 'tiktok', content: posts.tiktok },
            { platform: 'instagram', content: posts.instagram },
            { platform: 'facebook', content: posts.facebook },
            { platform: 'whatsapp', content: posts.whatsapp },
          ] as const).map(p => (
            <div key={p.platform} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <PlatformBadge platform={p.platform} />
                <CopyBtn text={p.content} />
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-line">{p.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section C — History
// ---------------------------------------------------------------------------

function HistoryView() {
  const [history, setHistory] = useState<CalendarHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('social_calendar')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      // Group by week_start
      const grouped = new Map<string, CalendarHistory>()
      for (const row of data ?? []) {
        const key = row.week_start
        if (!grouped.has(key)) {
          grouped.set(key, { id: key, created_at: row.created_at, days: [] })
        }
      }

      // Reconstruct days from individual platform rows
      const dayMap = new Map<string, Map<number, Partial<DayPlan>>>()
      const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
      for (const row of data ?? []) {
        const key = row.week_start
        if (!dayMap.has(key)) dayMap.set(key, new Map())
        const dm = dayMap.get(key)!
        if (!dm.has(row.day_number)) dm.set(row.day_number, { day: DAYS[row.day_number] || `Jour ${row.day_number}`, theme: row.theme || '' })
        const d = dm.get(row.day_number)!
        try {
          if (row.platform === 'tiktok') d.tiktok = JSON.parse(row.content)
          else if (row.platform === 'instagram') d.instagram = JSON.parse(row.content)
          else if (row.platform === 'facebook') d.facebook = JSON.parse(row.content)
          else if (row.platform === 'whatsapp') d.whatsapp_status = row.content
        } catch {
          // skip malformed
        }
      }

      const result: CalendarHistory[] = []
      Array.from(grouped.entries()).forEach(([key, entry]) => {
        const dm = dayMap.get(key)
        if (dm) {
          const days: DayPlan[] = []
          Array.from(dm.values()).forEach(d => {
            days.push({
              day: d.day || '',
              theme: d.theme || '',
              tiktok: d.tiktok || { script: '', hook: '', hashtags: '' },
              instagram: d.instagram || { caption: '', hashtags: '', visual_suggestion: '' },
              facebook: d.facebook || { text: '', cta: '' },
              whatsapp_status: d.whatsapp_status || '',
            })
          })
          entry.days = days
        }
        result.push(entry)
      })

      setHistory(result)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-200" />
        <p>Aucun planning généré pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {history.map(h => (
        <div key={h.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setExpanded(expanded === h.id ? null : h.id)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-medium text-[#111827]">Semaine du {new Date(h.id).toLocaleDateString('fr-FR')}</span>
              <span className="text-xs text-gray-400">{h.days.length} jours</span>
            </div>
            <CheckCircle className="w-4 h-4 text-gray-300" />
          </button>
          {expanded === h.id && (
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {h.days.map((d, i) => (
                <DayCard key={i} day={d} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
