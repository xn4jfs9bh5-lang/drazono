'use client'

import { useState, useEffect, useCallback, useRef, type ChangeEvent, type DragEvent } from 'react'
import {
  LayoutDashboard, Car, Users, MessageSquare, Bell, Plus,
  Eye, Heart, TrendingUp, Trash2, Edit3, Search, X, Upload,
  CheckCircle, AlertTriangle, Loader2, ChevronDown, Image as ImageIcon,
  Filter, RefreshCw
} from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import { BRANDS, BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, EUR_TO_FCFA } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import type { Vehicle } from '@/lib/types'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = 'dashboard' | 'vehicles' | 'add-vehicle' | 'edit-vehicle' | 'clients' | 'requests' | 'alerts'

interface DashboardStats {
  total: number
  available: number
  sold: number
  reserved: number
  draft: number
  totalViews: number
  totalFavorites: number
  contacts: number
  clients: number
}

const EMPTY_FORM = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  price_eur: 0,
  mileage: 0,
  fuel_type: 'Essence',
  transmission: 'Automatique',
  power: '',
  color: '',
  seats: 5,
  doors: 5,
  body_type: 'SUV',
  condition: 'neuf' as 'neuf' | 'occasion',
  description: '',
  featured: false,
  status: 'brouillon' as Vehicle['status'],
  video_url: '',
}

const adminTabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vehicles', label: 'Vehicules', icon: Car },
  { id: 'add-vehicle', label: 'Ajouter', icon: Plus },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'requests', label: 'Demandes', icon: MessageSquare },
  { id: 'alerts', label: 'Alertes', icon: Bell },
]

const STATUS_OPTIONS: { value: Vehicle['status']; label: string; color: string }[] = [
  { value: 'disponible', label: 'Disponible', color: 'bg-blue-100 text-blue-700' },
  { value: 'vendu', label: 'Vendu', color: 'bg-red-100 text-red-700' },
  { value: 'réservé', label: 'Reservé', color: 'bg-amber-100 text-amber-700' },
  { value: 'brouillon', label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadge(status: Vehicle['status']) {
  const opt = STATUS_OPTIONS.find(o => o.value === status) ?? STATUS_OPTIONS[3]
  return <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${opt.color}`}>{opt.label}</span>
}

function conditionBadge(condition: string) {
  return condition === 'neuf'
    ? <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Neuf</span>
    : <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Occasion</span>
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading')

  // Data
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [stats, setStats] = useState<DashboardStats>({ total: 0, available: 0, sold: 0, reserved: 0, draft: 0, totalViews: 0, totalFavorites: 0, contacts: 0, clients: 0 })
  const [loading, setLoading] = useState(true)

  // Vehicle list filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Form state
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------

  const checkRole = useCallback(async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profile?.role === 'admin') {
      setAuthStatus('authorized')
    } else {
      setAuthStatus('denied')
      window.location.href = '/espace-client'
    }
  }, [])

  useEffect(() => {
    let redirected = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (redirected) return
      if (event === 'INITIAL_SESSION') {
        if (!session) {
          redirected = true
          window.location.href = '/login'
        } else {
          checkRole(session.user.id)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [checkRole])

  // -------------------------------------------------------------------------
  // Fetch data
  // -------------------------------------------------------------------------

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[ADMIN] fetch vehicles:', error)
      toast.error('Erreur lors du chargement des vehicules')
    } else {
      setVehicles(data ?? [])
    }
    setLoading(false)
  }, [])

  const fetchStats = useCallback(async () => {
    const [vehiclesRes, contactsRes, clientsRes] = await Promise.all([
      supabase.from('vehicles').select('status, views_count'),
      supabase.from('contact_requests').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
    ])

    const vList = vehiclesRes.data ?? []
    setStats({
      total: vList.length,
      available: vList.filter(v => v.status === 'disponible').length,
      sold: vList.filter(v => v.status === 'vendu').length,
      reserved: vList.filter(v => v.status === 'réservé').length,
      draft: vList.filter(v => v.status === 'brouillon').length,
      totalViews: vList.reduce((s, v) => s + (v.views_count || 0), 0),
      totalFavorites: 0,
      contacts: contactsRes.count ?? 0,
      clients: clientsRes.count ?? 0,
    })
  }, [])

  useEffect(() => {
    if (authStatus === 'authorized') {
      fetchVehicles()
      fetchStats()
    }
  }, [authStatus, fetchVehicles, fetchStats])

  // -------------------------------------------------------------------------
  // Photo handling
  // -------------------------------------------------------------------------

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  function addPhotos(files: FileList | File[]) {
    const newFiles = Array.from(files).filter(f => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast.error(`Type non autorisé : ${f.name}. Seuls JPEG, PNG et WebP sont acceptés.`)
        return false
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} dépasse 5 MB.`)
        return false
      }
      return true
    })
    if (newFiles.length === 0) return
    const total = photos.length + newFiles.length
    if (total > 10) {
      toast.error('Maximum 10 photos par vehicule')
      return
    }
    setPhotos(prev => [...prev, ...newFiles])
    newFiles.forEach(f => {
      const reader = new FileReader()
      reader.onload = e => setPhotoPreviews(prev => [...prev, e.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  function removeExistingImage(index: number) {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  function onDragOver(e: DragEvent) { e.preventDefault(); setIsDragging(true) }
  function onDragLeave(e: DragEvent) { e.preventDefault(); setIsDragging(false) }
  function onDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) addPhotos(e.dataTransfer.files)
  }
  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) addPhotos(e.target.files)
    e.target.value = ''
  }

  async function uploadPhotos(vehicleId: string): Promise<string[]> {
    const MIME_TO_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
    const urls: string[] = []
    for (const file of photos) {
      const ext = MIME_TO_EXT[file.type] || 'jpg'
      const safeName = `${Date.now()}-${crypto.randomUUID()}.${ext}`
      const path = `${vehicleId}/${safeName}`
      const { error } = await supabase.storage.from('vehicles').upload(path, file, {
        upsert: true,
        contentType: file.type,
      })
      if (error) {
        if (process.env.NODE_ENV === 'development') console.error('[ADMIN] upload error:', error)
        toast.error(`Erreur upload : ${file.name}`)
      } else {
        const { data: urlData } = supabase.storage.from('vehicles').getPublicUrl(path)
        urls.push(urlData.publicUrl)
      }
    }
    return urls
  }

  // -------------------------------------------------------------------------
  // CRUD
  // -------------------------------------------------------------------------

  async function handleSubmitVehicle() {
    // Validation
    if (!form.brand) { toast.error('Selectionnez une marque'); return }
    if (!form.model.trim()) { toast.error('Entrez un modele'); return }
    if (!form.year || form.year < 2000 || form.year > new Date().getFullYear() + 1) { toast.error('Entrez une annee valide'); return }
    if (form.price_eur <= 0) { toast.error('Entrez un prix valide'); return }

    setSubmitting(true)
    try {
      const vehicleData = {
        brand: form.brand,
        model: form.model.trim(),
        year: form.year,
        price_eur: form.price_eur,
        mileage: form.mileage,
        fuel_type: form.fuel_type,
        transmission: form.transmission,
        power: form.power.trim(),
        color: form.color.trim(),
        seats: form.seats,
        doors: form.doors,
        body_type: form.body_type,
        condition: form.condition,
        description: form.description.trim(),
        featured: form.featured,
        status: form.status,
        video_url: form.video_url.trim() || null,
      }

      if (editingId) {
        // Update
        let imageUrls = [...existingImages]
        if (photos.length > 0) {
          const newUrls = await uploadPhotos(editingId)
          imageUrls = [...imageUrls, ...newUrls]
        }

        const { error } = await supabase
          .from('vehicles')
          .update({ ...vehicleData, images: imageUrls, updated_at: new Date().toISOString() })
          .eq('id', editingId)

        if (error) throw error
        toast.success('Vehicule mis a jour avec succes')
      } else {
        // Insert
        const { data: inserted, error } = await supabase
          .from('vehicles')
          .insert({ ...vehicleData, images: [], views_count: 0, verified: false })
          .select()
          .single()

        if (error) throw error

        if (photos.length > 0 && inserted) {
          const imageUrls = await uploadPhotos(inserted.id)
          await supabase
            .from('vehicles')
            .update({ images: imageUrls })
            .eq('id', inserted.id)
        }
        toast.success('Vehicule ajoute avec succes !')
      }

      // Reset
      setForm(EMPTY_FORM)
      setPhotos([])
      setPhotoPreviews([])
      setExistingImages([])
      setEditingId(null)
      setActiveTab('vehicles')
      fetchVehicles()
      fetchStats()
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') console.error('[ADMIN] submit:', err)
      const e = err as { message?: string; code?: string }
      const msg = e?.message || 'Une erreur est survenue. Réessayez.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteVehicle(id: string) {
    setDeleting(true)
    try {
      // Delete images from storage
      const vehicle = vehicles.find(v => v.id === id)
      if (vehicle?.images?.length) {
        const paths = vehicle.images.map(url => {
          const parts = url.split('/vehicles/')
          return parts[parts.length - 1]
        }).filter(Boolean)
        if (paths.length) {
          await supabase.storage.from('vehicles').remove(paths)
        }
      }

      const { error } = await supabase.from('vehicles').delete().eq('id', id)
      if (error) throw error

      toast.success('Vehicule supprime')
      setDeleteTarget(null)
      fetchVehicles()
      fetchStats()
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') console.error('[ADMIN] delete:', err)
      const e = err as { message?: string }
      toast.error(e?.message || 'Erreur lors de la suppression.')
    } finally {
      setDeleting(false)
    }
  }

  async function handleStatusChange(id: string, newStatus: Vehicle['status']) {
    const { error } = await supabase
      .from('vehicles')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      toast.error(`Erreur changement statut: ${error.message}`)
    } else {
      const labels: Record<string, string> = { disponible: 'publie', vendu: 'marque comme vendu', 'réservé': 'marque comme reserve', brouillon: 'mis en brouillon' }
      toast.success(`Vehicule ${labels[newStatus] ?? 'mis a jour'}`)
      fetchVehicles()
      fetchStats()
    }
  }

  function startEdit(vehicle: Vehicle) {
    setForm({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      price_eur: vehicle.price_eur,
      mileage: vehicle.mileage,
      fuel_type: vehicle.fuel_type,
      transmission: vehicle.transmission,
      power: vehicle.power,
      color: vehicle.color,
      seats: vehicle.seats,
      doors: vehicle.doors,
      body_type: vehicle.body_type,
      condition: vehicle.condition,
      description: vehicle.description,
      featured: vehicle.featured,
      status: vehicle.status,
      video_url: vehicle.video_url ?? '',
    })
    setExistingImages(vehicle.images ?? [])
    setPhotos([])
    setPhotoPreviews([])
    setEditingId(vehicle.id)
    setActiveTab('add-vehicle')
  }

  // -------------------------------------------------------------------------
  // Filtered vehicles
  // -------------------------------------------------------------------------

  const filteredVehicles = vehicles.filter(v => {
    const matchSearch = searchQuery === '' ||
      `${v.brand} ${v.model} ${v.year}`.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || v.status === statusFilter
    return matchSearch && matchStatus
  })

  // -------------------------------------------------------------------------
  // Render guards
  // -------------------------------------------------------------------------

  if (authStatus === 'loading') {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-3" />
        <p className="text-gray-400">Chargement...</p>
      </div>
    )
  }

  if (authStatus === 'denied') {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Acces refuse. Redirection...</p>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------

  const inputClass = 'w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Panel Admin</h1>
            <span className="text-xs font-medium px-3 py-1 bg-red-100 text-red-700 rounded-full">Admin</span>
          </div>
        </FadeIn>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <nav className="w-full md:w-52 shrink-0 space-y-1">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id === 'add-vehicle' && activeTab !== 'add-vehicle') { setEditingId(null); setForm(EMPTY_FORM); setPhotos([]); setPhotoPreviews([]); setExistingImages([]) } }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  activeTab === tab.id || (tab.id === 'add-vehicle' && activeTab === 'edit-vehicle')
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
          <div className="flex-1 min-w-0">

            {/* ==================== DASHBOARD ==================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-[#111827]">Vue d&apos;ensemble</h2>
                  <button onClick={() => { fetchVehicles(); fetchStats() }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
                    <RefreshCw className="w-3.5 h-3.5" /> Actualiser
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Vehicules en ligne', value: stats.available, icon: Car, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Vehicules vendus', value: stats.sold, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Reserves', value: stats.reserved, icon: CheckCircle, color: 'bg-amber-50 text-amber-600' },
                    { label: 'Brouillons', value: stats.draft, icon: Edit3, color: 'bg-gray-50 text-gray-600' },
                    { label: 'Total vues', value: stats.totalViews, icon: Eye, color: 'bg-indigo-50 text-indigo-600' },
                    { label: 'Clients inscrits', value: stats.clients, icon: Users, color: 'bg-purple-50 text-purple-600' },
                    { label: 'Contacts recus', value: stats.contacts, icon: MessageSquare, color: 'bg-pink-50 text-pink-600' },
                    { label: 'Total vehicules', value: stats.total, icon: LayoutDashboard, color: 'bg-cyan-50 text-cyan-600' },
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
                    Top 5 — Plus consultes
                  </h3>
                  {vehicles.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">Aucun vehicule</p>
                  ) : (
                    <div className="space-y-3">
                      {[...vehicles].sort((a, b) => b.views_count - a.views_count).slice(0, 5).map((v, i) => (
                        <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <span className="text-sm text-gray-700">{i + 1}. {v.brand} {v.model} {v.year}</span>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{v.views_count}</span>
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />0</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== VEHICLE LIST ==================== */}
            {activeTab === 'vehicles' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="font-semibold text-[#111827]">Gestion des vehicules</h3>
                  <button
                    onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setPhotos([]); setPhotoPreviews([]); setExistingImages([]); setActiveTab('add-vehicle') }}
                    className="flex items-center gap-2 h-9 px-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>

                {/* Search + filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un vehicule..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="h-9 pl-9 pr-8 rounded-lg border border-gray-200 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                      <option value="all">Tous les statuts</option>
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">Chargement...</span>
                  </div>
                ) : filteredVehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">{vehicles.length === 0 ? 'Aucun vehicule. Ajoutez-en un !' : 'Aucun resultat pour cette recherche.'}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 text-gray-500 font-medium">Vehicule</th>
                          <th className="text-left py-3 text-gray-500 font-medium">Prix</th>
                          <th className="text-left py-3 text-gray-500 font-medium">Etat</th>
                          <th className="text-left py-3 text-gray-500 font-medium">Statut</th>
                          <th className="text-left py-3 text-gray-500 font-medium">Vues</th>
                          <th className="text-right py-3 text-gray-500 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVehicles.map(v => (
                          <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                {v.images?.[0] ? (
                                  <img src={v.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-[#111827]">{v.brand} {v.model}</p>
                                  <p className="text-xs text-gray-400">{v.year} &middot; {v.mileage > 0 ? `${formatPrice(v.mileage)} km` : 'Neuf'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-gray-600">{formatPrice(v.price_eur)} &euro;</td>
                            <td className="py-3">{conditionBadge(v.condition)}</td>
                            <td className="py-3">
                              <div className="relative group">
                                {statusBadge(v.status)}
                                <div className="hidden group-hover:block absolute z-10 top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[140px]">
                                  {STATUS_OPTIONS.filter(o => o.value !== v.status).map(o => (
                                    <button
                                      key={o.value}
                                      onClick={() => handleStatusChange(v.id, o.value)}
                                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700"
                                    >
                                      Passer en &laquo; {o.label} &raquo;
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-gray-500">{v.views_count}</td>
                            <td className="py-3 text-right space-x-2">
                              <button onClick={() => startEdit(v)} className="text-xs text-[#2563EB] hover:underline">Modifier</button>
                              <button onClick={() => setDeleteTarget(v.id)} className="text-xs text-red-500 hover:underline">Supprimer</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-gray-400 mt-3">{filteredVehicles.length} vehicule{filteredVehicles.length > 1 ? 's' : ''} affiche{filteredVehicles.length > 1 ? 's' : ''}</p>
                  </div>
                )}
              </div>
            )}

            {/* ==================== ADD / EDIT VEHICLE ==================== */}
            {(activeTab === 'add-vehicle' || activeTab === 'edit-vehicle') && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-[#111827] mb-6">
                  {editingId ? 'Modifier le vehicule' : 'Ajouter un vehicule'}
                </h3>
                <div className="space-y-5 max-w-3xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Brand */}
                    <div>
                      <label className={labelClass}>Marque *</label>
                      <select value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className={inputClass}>
                        <option value="">Selectionner</option>
                        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    {/* Model */}
                    <div>
                      <label className={labelClass}>Modele *</label>
                      <input type="text" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} className={inputClass} />
                    </div>
                    {/* Year */}
                    <div>
                      <label className={labelClass}>Annee</label>
                      <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} className={inputClass} />
                    </div>
                    {/* Price EUR */}
                    <div>
                      <label className={labelClass}>Prix EUR *</label>
                      <input type="number" value={form.price_eur || ''} onChange={e => setForm(f => ({ ...f, price_eur: Number(e.target.value) }))} className={inputClass} />
                      {form.price_eur > 0 && (
                        <p className="text-xs text-gray-400 mt-1">{formatPrice(Math.round(form.price_eur * EUR_TO_FCFA))} FCFA</p>
                      )}
                    </div>
                    {/* Mileage */}
                    <div>
                      <label className={labelClass}>Kilometrage</label>
                      <input type="number" value={form.mileage || ''} onChange={e => setForm(f => ({ ...f, mileage: Number(e.target.value) }))} className={inputClass} />
                    </div>
                    {/* Fuel */}
                    <div>
                      <label className={labelClass}>Carburant</label>
                      <select value={form.fuel_type} onChange={e => setForm(f => ({ ...f, fuel_type: e.target.value }))} className={inputClass}>
                        {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    {/* Transmission */}
                    <div>
                      <label className={labelClass}>Transmission</label>
                      <select value={form.transmission} onChange={e => setForm(f => ({ ...f, transmission: e.target.value }))} className={inputClass}>
                        {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    {/* Power */}
                    <div>
                      <label className={labelClass}>Puissance</label>
                      <input type="text" value={form.power} onChange={e => setForm(f => ({ ...f, power: e.target.value }))} className={inputClass} placeholder="ex: 150ch" />
                    </div>
                    {/* Color */}
                    <div>
                      <label className={labelClass}>Couleur</label>
                      <input type="text" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className={inputClass} />
                    </div>
                    {/* Seats */}
                    <div>
                      <label className={labelClass}>Places</label>
                      <input type="number" value={form.seats} onChange={e => setForm(f => ({ ...f, seats: Number(e.target.value) }))} className={inputClass} />
                    </div>
                    {/* Doors */}
                    <div>
                      <label className={labelClass}>Portes</label>
                      <input type="number" value={form.doors} onChange={e => setForm(f => ({ ...f, doors: Number(e.target.value) }))} className={inputClass} />
                    </div>
                    {/* Body type */}
                    <div>
                      <label className={labelClass}>Carrosserie</label>
                      <select value={form.body_type} onChange={e => setForm(f => ({ ...f, body_type: e.target.value }))} className={inputClass}>
                        {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    {/* Condition */}
                    <div>
                      <label className={labelClass}>Etat</label>
                      <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value as 'neuf' | 'occasion' }))} className={inputClass}>
                        <option value="neuf">Neuf</option>
                        <option value="occasion">Occasion</option>
                      </select>
                    </div>
                    {/* Status */}
                    <div>
                      <label className={labelClass}>Statut de publication</label>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Vehicle['status'] }))} className={inputClass}>
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <span className={`text-xs ${form.description.length > 1000 ? 'text-red-500' : 'text-gray-400'}`}>
                        {form.description.length}/1000
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value.slice(0, 1000) }))}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none transition-colors"
                    />
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className={labelClass}>URL Video (optionnel)</label>
                    <input
                      type="url"
                      value={form.video_url}
                      onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                      className={inputClass}
                      placeholder="https://youtube.com/watch?v=... ou lien direct .mp4"
                    />
                    {form.video_url && (
                      <p className="text-xs text-gray-400 mt-1">La video sera affichee sur la fiche vehicule</p>
                    )}
                  </div>

                  {/* Photos */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Photos ({existingImages.length + photos.length}/10)
                    </label>

                    {/* Existing images (edit mode) */}
                    {existingImages.length > 0 && (
                      <div className="flex flex-wrap gap-3 mb-3">
                        {existingImages.map((url, i) => (
                          <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(i)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New photo previews */}
                    {photoPreviews.length > 0 && (
                      <div className="flex flex-wrap gap-3 mb-3">
                        {photoPreviews.map((src, i) => (
                          <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(i)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Drag & drop zone */}
                    <div
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                        isDragging ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Glissez vos photos ici ou <span className="text-[#2563EB] font-medium">cliquez pour parcourir</span></p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP &mdash; max 10MB par fichier</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Featured */}
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    Mis en avant (apparait sur l&apos;accueil)
                  </label>

                  {/* Submit */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSubmitVehicle}
                      disabled={submitting}
                      className="flex items-center gap-2 h-10 px-6 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      {editingId ? 'Mettre a jour' : form.status === 'disponible' ? 'Publier' : 'Enregistrer'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setPhotos([]); setPhotoPreviews([]); setExistingImages([]); setActiveTab('vehicles') }}
                        className="h-10 px-6 border border-gray-200 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== CLIENTS ==================== */}
            {activeTab === 'clients' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-[#111827] mb-6">Clients inscrits</h3>
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">Aucun client inscrit pour le moment.</p>
                </div>
              </div>
            )}

            {/* ==================== REQUESTS ==================== */}
            {activeTab === 'requests' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-[#111827] mb-6">Demandes de contact</h3>
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">Aucune demande pour le moment.</p>
                </div>
              </div>
            )}

            {/* ==================== ALERTS ==================== */}
            {activeTab === 'alerts' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-[#111827] mb-6">Alertes internes</h3>
                {vehicles.filter(v => v.views_count > 50).length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">Aucune alerte pour le moment.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vehicles.filter(v => v.views_count > 50).map(v => (
                      <div key={v.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                        <span className="text-sm text-amber-800">
                          <strong>{v.brand} {v.model}</strong> a depasse {v.views_count} vues
                        </span>
                        <Eye className="w-4 h-4 text-amber-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== DELETE MODAL ==================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-[#111827]">Confirmer la suppression</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Cette action est irreversible. Le vehicule et toutes ses photos seront definitivement supprimes.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="h-9 px-4 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteVehicle(deleteTarget)}
                disabled={deleting}
                className="flex items-center gap-2 h-9 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
