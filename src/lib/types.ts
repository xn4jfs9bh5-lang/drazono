export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  price_eur: number
  price_fcfa: number
  mileage: number
  fuel_type: string
  transmission: string
  power: string
  color: string
  seats: number
  doors: number
  body_type: string
  condition: 'neuf' | 'occasion'
  description: string
  images: string[]
  status: 'disponible' | 'vendu' | 'réservé' | 'brouillon'
  views_count: number
  featured: boolean
  verified: boolean
  video_url: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  name: string
  phone: string | null
  country: string | null
  city: string | null
  role: 'client' | 'admin'
  avatar_url: string | null
  created_at: string
}

export interface ContactRequest {
  id: string
  user_id: string | null
  vehicle_id: string | null
  name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  content: string
  cover_image: string
  published: boolean
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  user_id: string
  brand: string | null
  max_price: number | null
  body_type: string | null
  fuel_type: string | null
  is_active: boolean
  created_at: string
}
