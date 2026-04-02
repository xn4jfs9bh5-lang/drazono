'use client'

import { useState } from 'react'
import { X, Copy, RefreshCw, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { SITE_URL } from '@/lib/constants'
import type { Vehicle } from '@/lib/types'

interface Props {
  vehicle: Vehicle
  onClose: () => void
}

interface Content {
  tiktok: string
  facebook: string
  instagram: string
  whatsapp: string
  source?: string
}

const LIMITS: Record<string, number> = { tiktok: 150, facebook: 500, instagram: 200, whatsapp: 200 }
const LABELS: Record<string, string> = { tiktok: 'TikTok / Reels', facebook: 'Facebook', instagram: 'Instagram', whatsapp: 'Groupe WhatsApp' }

export default function SocialGeneratorModal({ vehicle, onClose }: Props) {
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          price_eur: vehicle.price_eur,
          price_fcfa: vehicle.price_fcfa || vehicle.price_eur * 656,
          condition: vehicle.condition,
          fuel_type: vehicle.fuel_type,
          power: vehicle.power,
          description: vehicle.description,
          url: `${SITE_URL}/vehicule/${vehicle.id}`,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Erreur de generation')
        return
      }
      const data = await res.json()
      setContent(data)
    } catch {
      toast.error('Erreur reseau')
    } finally {
      setLoading(false)
    }
  }

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    toast.success('Copie !')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-[#111827]">Generateur de posts sociaux</h3>
            <p className="text-xs text-gray-500 mt-0.5">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {!content ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-6 text-sm">
                Generez automatiquement des posts optimises pour chaque plateforme.
              </p>
              <button
                onClick={generate}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Generer les posts
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {(['tiktok', 'facebook', 'instagram', 'whatsapp'] as const).map(key => {
                const text = content[key]
                if (!text) return null
                const limit = LIMITS[key]
                const isOver = text.length > limit + 50 // some tolerance for hashtags
                return (
                  <div key={key} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#111827]">{LABELS[key]}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${isOver ? 'text-red-500' : 'text-gray-400'}`}>
                          {text.length} chars
                        </span>
                        <button
                          onClick={() => copyText(key, text)}
                          className="flex items-center gap-1 text-xs text-[#2563EB] hover:text-blue-700 font-medium"
                        >
                          {copied === key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied === key ? 'Copie' : 'Copier'}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{text}</p>
                  </div>
                )
              })}

              {content.source === 'fallback' && (
                <p className="text-xs text-amber-600 text-center">
                  Genere sans IA (cle API non configuree). Configurez ANTHROPIC_API_KEY pour des posts optimises.
                </p>
              )}

              <div className="flex justify-center pt-2">
                <button
                  onClick={generate}
                  disabled={loading}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Regenerer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
