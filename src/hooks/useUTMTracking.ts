'use client'

import { useEffect } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'

const UTM_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign',
  'utm_content', 'utm_term',
] as const

const STORAGE_KEY = 'drazono_attribution_v1'
const EXPIRY_KEY = 'drazono_attribution_expiry'
const TTL = 30 * 24 * 60 * 60 * 1000 // 30 days

export function useUTMTracking() {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check expiration
    const expiry = localStorage.getItem(EXPIRY_KEY)
    if (expiry && Date.now() > Number(expiry)) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(EXPIRY_KEY)
    }

    // Capture UTMs from URL
    const utms: Record<string, string> = {}
    let hasUtms = false
    UTM_KEYS.forEach(key => {
      const val = searchParams.get(key)
      if (val) { utms[key] = val; hasUtms = true }
    })

    // First-touch only — do not overwrite
    if (hasUtms && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...utms,
        referrer: document.referrer || undefined,
        landing_path: `${pathname}${window.location.search}`,
        first_seen_at: new Date().toISOString(),
      }))
      localStorage.setItem(EXPIRY_KEY, (Date.now() + TTL).toString())
    }
  }, [pathname, searchParams])
}

export function getStoredUTMs(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
