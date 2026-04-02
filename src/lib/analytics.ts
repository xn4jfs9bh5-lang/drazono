'use client'

type EventType = 'page_view' | 'vehicle_view' | 'whatsapp_click' | 'catalogue_search' | 'newsletter_signup' | 'contact_form'

let sessionId: string | null = null

function getSessionId(): string {
  if (sessionId) return sessionId
  if (typeof window === 'undefined') return 'ssr'
  const stored = localStorage.getItem('dz_sid')
  if (stored) { sessionId = stored; return stored }
  const id = crypto.randomUUID()
  localStorage.setItem('dz_sid', id)
  sessionId = id
  return id
}

function getDevice(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  return window.innerWidth < 768 ? 'mobile' : 'desktop'
}

let lastTrack = 0

export function trackEvent(
  eventType: EventType,
  extra?: { page?: string; vehicleId?: string }
) {
  if (typeof window === 'undefined') return

  // Debounce: min 200ms between events
  const now = Date.now()
  if (now - lastTrack < 200) return
  lastTrack = now

  const payload = {
    event_type: eventType,
    session_id: getSessionId(),
    device: getDevice(),
    referrer: document.referrer || undefined,
    page: extra?.page || window.location.pathname,
    vehicle_id: extra?.vehicleId,
  }

  // Fire-and-forget using sendBeacon for reliability
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/track', blob)
  } else {
    fetch('/api/analytics/track', { method: 'POST', body: blob, keepalive: true }).catch(() => {})
  }
}
