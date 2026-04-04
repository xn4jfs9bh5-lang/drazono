export const SITE_NAME = 'DRAZONO'
export const SITE_DESCRIPTION = 'Véhicules neufs et d\'occasion depuis la Chine. Prix réel vendeur, livraison mondiale en option.'
export const SITE_URL = 'https://www.drazono.com'

// TODO: remplacer par le vrai numéro WhatsApp de Brayann
// Set NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local to override
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '22607000000'
export const WHATSAPP_DEFAULT_MESSAGE = 'Bonjour, je suis intéressé par un véhicule sur DRAZONO.'
export const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`
export const WHATSAPP_URL = `${WHATSAPP_BASE}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`

export const CONTACT_EMAIL = 'contact@drazono.com'

export const EUR_TO_FCFA = 656

export const BRANDS = [
  'BYD', 'Chery', 'Geely', 'Great Wall', 'Haval', 'JAC Motors',
  'Dongfeng', 'BAIC', 'Changan', 'MG', 'NIO', 'Xpeng', 'Li Auto',
  'AITO', 'Zeekr', 'Voyah', 'Ora', 'Wuling', 'SAIC', 'Lynk & Co',
  'Denza', 'Avatr', 'Jaecoo', 'Omoda', 'Deepal', 'Neta',
  'Leapmotor', 'Hozon', 'Aion', 'GAC', 'Roewe', 'Baojun',
] as const

export const BODY_TYPES = [
  'SUV', 'Berline', 'Citadine', 'Pick-up', 'Coupé', 'Cabriolet',
  'Monospace', 'Break', 'Utilitaire', 'Camionnette',
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
