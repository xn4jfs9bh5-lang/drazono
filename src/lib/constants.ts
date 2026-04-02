export const SITE_NAME = 'DRAZONO'
export const SITE_DESCRIPTION = 'Véhicules neufs et d\'occasion depuis la Chine. Prix réel vendeur, livraison mondiale en option.'
export const SITE_URL = 'https://drazono.vercel.app'

// TODO: remplacer par le vrai numéro WhatsApp de Brayann
export const WHATSAPP_NUMBER = '22607000000'
export const WHATSAPP_DEFAULT_MESSAGE = 'Bonjour, je suis intéressé par un véhicule sur DRAZONO.'
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`

export const CONTACT_EMAIL = 'contact@drazono.com'

export const EUR_TO_FCFA = 656

export const BRANDS = [
  'BYD', 'Chery', 'Geely', 'Great Wall', 'Haval', 'JAC Motors',
  'Dongfeng', 'BAIC', 'Changan', 'MG', 'NIO', 'Xpeng', 'Li Auto'
] as const

export const BODY_TYPES = [
  'SUV', 'Berline', 'Pick-up', 'Citadine', 'Utilitaire'
] as const

export const FUEL_TYPES = [
  'Essence', 'Diesel', 'Électrique', 'Hybride'
] as const

export const TRANSMISSIONS = [
  'Manuelle', 'Automatique'
] as const

export const NAV_LINKS = [
  { label: 'Catalogue', href: '/catalogue' },
  { label: 'Comment ça marche', href: '/comment-ca-marche' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
] as const
