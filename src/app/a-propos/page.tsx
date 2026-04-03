import { Metadata } from 'next'
import { ShieldCheck, Camera, MessageCircle, Eye } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'

export const metadata: Metadata = {
  title: 'À propos — DRAZONO',
  description: 'Découvrez l\'histoire de DRAZONO, la plateforme d\'import de véhicules chinois. Fondée par Brayann, transparence et confiance.',
}

const commitments = [
  { icon: Eye, title: 'Transparence totale', description: 'Prix réel, pas de frais cachés, commission incluse dans le prix affiché.' },
  { icon: Camera, title: 'Photos réelles', description: 'Photos fournies par les vendeurs chinois, pas de banque d\'images.' },
  { icon: ShieldCheck, title: 'Véhicules vérifiés', description: 'Chaque véhicule est vérifié avant publication sur le site.' },
  { icon: MessageCircle, title: 'Support humain', description: 'Un vrai humain vous répond sur WhatsApp, pas un robot.' },
]

export default function AProposPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight mb-4">
              À propos de DRAZONO
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Rendre les véhicules chinois accessibles au monde entier.
            </p>
          </div>
        </FadeIn>

        {/* Founder section */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col md:flex-row items-center gap-10 mb-20">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0">
              <span className="text-5xl font-bold text-white">B</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#111827] mb-4">L&apos;histoire de DRAZONO</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                Je m&apos;appelle <strong>Brayann</strong>, fondateur de DRAZONO. Mon premier projet,
                <strong> BF Auto Market</strong>, est une plateforme d&apos;importation de véhicules
                d&apos;occasion pour le Burkina Faso avec scraping automatique de 18 sites internationaux.
              </p>
              <p className="text-gray-600 leading-relaxed mb-3">
                Cette expérience m&apos;a ouvert les yeux sur une opportunité immense : les véhicules chinois.
                <strong> 2 à 3 fois moins chers</strong> que les équivalents japonais ou européens, avec une
                qualité qui a explosé ces dernières années. BYD est devenu le n°1 mondial des véhicules électriques.
              </p>
              <p className="text-gray-600 leading-relaxed">
                DRAZONO est né de cette vision : <strong>connecter directement les acheteurs du monde entier
                aux vendeurs chinois</strong>, sans intermédiaire inutile, avec transparence et confiance.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Why Chinese vehicles */}
        <FadeIn delay={0.2}>
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-[#111827] text-center mb-10">
              Pourquoi les véhicules chinois ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'Qualité en hausse spectaculaire', text: 'BYD, Chery, Geely rivalisent avec les marques japonaises et européennes. BYD est n°1 mondial des VE.' },
                { title: 'Prix 2-3x moins cher', text: 'À équipement équivalent, un véhicule chinois coûte 2 à 3 fois moins qu\'un européen ou japonais.' },
                { title: 'Technologies avancées', text: 'Électrique, hybride, écrans connectés, conduite assistée. La Chine est à la pointe de l\'innovation automobile.' },
                { title: 'Export Chine → Afrique en boom', text: 'Les exportations de véhicules chinois vers l\'Afrique sont en pleine croissance, avec un réseau de pièces en développement.' },
              ].map((item, i) => (
                <div key={i} className="bg-[#FAFAFA] rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-[#111827] mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Commitments */}
        <FadeIn delay={0.3}>
          <div>
            <h2 className="text-2xl font-bold text-[#111827] text-center mb-10">
              Notre engagement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {commitments.map((c, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <c.icon className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#111827] mb-1">{c.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
