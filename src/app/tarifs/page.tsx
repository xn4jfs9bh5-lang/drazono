import { Metadata } from 'next'
import { Check, X, Video, Ship, FileCheck, MessageCircle, Users, Package } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import { WHATSAPP_NUMBER } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Tarifs et services — DRAZONO',
  description: 'Découvrez nos tarifs transparents et services : commission incluse, transport maritime, inspection vidéo, accompagnement douanier.',
}

const included = [
  'Recherche et sélection des meilleurs véhicules',
  'Vérification de la disponibilité auprès du vendeur',
  'Confirmation des photos et spécifications',
  'Traduction et communication avec le vendeur chinois',
  'Accompagnement WhatsApp tout au long du processus',
  'Facture proforma',
]

const notIncluded = [
  'Transport maritime (devis personnalisé)',
  'Dédouanement dans votre pays',
  'Immatriculation locale',
  'Assurance transport',
]

const optionalServices = [
  {
    icon: Ship,
    title: 'Transport maritime',
    description: 'Devis personnalisé selon le port de destination. Conteneur ou RoRo selon le véhicule.',
  },
  {
    icon: Video,
    title: 'Inspection vidéo',
    description: 'Un agent en Chine filme le véhicule en détail : moteur, châssis, intérieur, extérieur.',
  },
  {
    icon: FileCheck,
    title: 'Accompagnement douanier',
    description: 'Mise en relation avec un transitaire partenaire dans votre pays pour faciliter le dédouanement.',
  },
]

export default function TarifsPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight mb-4">
              Tarifs et services
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Transparence totale sur nos services et notre commission.
            </p>
          </div>
        </FadeIn>

        {/* Commission explanation */}
        <FadeIn delay={0.1}>
          <div className="bg-brand-500/5 border border-brand-500/10 rounded-2xl p-6 sm:p-8 mb-12 text-center">
            <h2 className="text-xl font-bold text-[#111827] mb-2">Notre commission</h2>
            <p className="text-gray-600 leading-relaxed">
              DRAZONO prend une commission de service <strong>incluse dans le prix affiché</strong>.
              Pas de frais cachés, pas de surprise. Le prix que vous voyez est le prix que vous payez.
            </p>
          </div>
        </FadeIn>

        {/* Included / Not included */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <FadeIn delay={0.15}>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-[#111827] mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                Ce qui est inclus
              </h3>
              <ul className="space-y-3">
                {included.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-[#111827] mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </div>
                Non inclus (disponible en option)
              </h3>
              <ul className="space-y-3">
                {notIncluded.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <X className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>

        {/* Optional services */}
        <FadeIn delay={0.25}>
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight text-center mb-8">
            Services optionnels
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {optionalServices.map((service, i) => (
            <FadeIn key={i} delay={0.3 + i * 0.08}>
              <div className="bg-[#FAFAFA] rounded-2xl border border-gray-100 p-6 text-center">
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <service.icon className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="font-semibold text-[#111827] mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Section B2B */}
        <FadeIn delay={0.4}>
          <div className="bg-[#0A1325] rounded-2xl p-8 sm:p-10 text-center">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
              Vous êtes revendeur ou professionnel ?
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8">
              Conditions avantageuses pour les commandes en volume.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <Package className="w-5 h-5 text-brand-500 mx-auto mb-2" />
                <p className="text-sm text-white font-medium">Commande groupée</p>
                <p className="text-xs text-gray-400 mt-1">À partir de 3 véhicules</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <FileCheck className="w-5 h-5 text-brand-500 mx-auto mb-2" />
                <p className="text-sm text-white font-medium">Devis personnalisé B2B</p>
                <p className="text-xs text-gray-400 mt-1">Adapté à vos besoins</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <Check className="w-5 h-5 text-brand-500 mx-auto mb-2" />
                <p className="text-sm text-white font-medium">Conditions négociables</p>
                <p className="text-xs text-gray-400 mt-1">Tarifs dégressifs sur volume</p>
              </div>
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, je suis revendeur et souhaite un devis pour [X] véhicules. Merci de me recontacter.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-8 py-3.5 rounded-full font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Demander un devis B2B sur WhatsApp
            </a>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
