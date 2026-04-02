import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { authorized } = await verifyAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const supabase = createAdminClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch all events from last 7 days
    const { data: events } = await supabase
      .from('analytics_events')
      .select('event_type, page, vehicle_id, session_id, device, referrer, created_at')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: true })

    const all = events ?? []

    // Visits per day
    const dayMap = new Map<string, number>()
    all.filter(e => e.event_type === 'page_view').forEach(e => {
      const day = e.created_at.slice(0, 10)
      dayMap.set(day, (dayMap.get(day) ?? 0) + 1)
    })
    const visitsPerDay = Array.from(dayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Top vehicles
    const vMap = new Map<string, number>()
    all.filter(e => e.event_type === 'vehicle_view' && e.vehicle_id).forEach(e => {
      vMap.set(e.vehicle_id!, (vMap.get(e.vehicle_id!) ?? 0) + 1)
    })
    const topVehicles = Array.from(vMap.entries())
      .map(([id, views]) => ({ id, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Top pages
    const pMap = new Map<string, number>()
    all.filter(e => e.page).forEach(e => {
      pMap.set(e.page!, (pMap.get(e.page!) ?? 0) + 1)
    })
    const topPages = Array.from(pMap.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Totals
    const totalViews = all.filter(e => e.event_type === 'page_view').length
    const whatsappClicks = all.filter(e => e.event_type === 'whatsapp_click').length
    const vehicleViews = all.filter(e => e.event_type === 'vehicle_view').length
    const newsletterSignups = all.filter(e => e.event_type === 'newsletter_signup').length
    const contactForms = all.filter(e => e.event_type === 'contact_form').length

    // Device split
    const mobile = all.filter(e => e.device === 'mobile').length
    const desktop = all.filter(e => e.device === 'desktop').length

    // Referrer sources
    const srcMap = new Map<string, number>()
    all.filter(e => e.event_type === 'page_view').forEach(e => {
      let src = 'direct'
      if (e.referrer) {
        if (e.referrer.includes('google') || e.referrer.includes('bing')) src = 'search'
        else if (e.referrer.includes('facebook') || e.referrer.includes('instagram') || e.referrer.includes('tiktok') || e.referrer.includes('twitter')) src = 'social'
        else src = 'other'
      }
      srcMap.set(src, (srcMap.get(src) ?? 0) + 1)
    })
    const sources = Array.from(srcMap.entries()).map(([source, count]) => ({ source, count }))

    // Funnel
    const uniqueSessions = new Set(all.map(e => e.session_id)).size
    const sessionsWithVehicle = new Set(all.filter(e => e.event_type === 'vehicle_view').map(e => e.session_id)).size
    const sessionsWithWA = new Set(all.filter(e => e.event_type === 'whatsapp_click').map(e => e.session_id)).size
    const sessionsWithContact = new Set(all.filter(e => e.event_type === 'contact_form').map(e => e.session_id)).size

    return NextResponse.json({
      visitsPerDay,
      topVehicles,
      topPages,
      totals: { totalViews, vehicleViews, whatsappClicks, newsletterSignups, contactForms },
      devices: { mobile, desktop },
      sources,
      funnel: {
        visitors: uniqueSessions,
        vehicleViews: sessionsWithVehicle,
        whatsappClicks: sessionsWithWA,
        contacts: sessionsWithContact,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
