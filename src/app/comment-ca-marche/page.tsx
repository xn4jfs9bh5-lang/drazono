'use client'

import { Search, MessageCircle, ShieldCheck, CreditCard, ShoppingCart, Ship, Clock, Banknote, RefreshCw, Timer, Landmark } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const steps = [
  {
    icon: Search,
    title: 'Explorez le catalogue',
    description: 'Parcourez nos véhicules vérifiés. Filtrez par marque, budget, type de carrosserie. Chaque véhicule a été sélectionné et vérifié par notre équipe.',
    delay: '0-24h',
    delayLabel: 'Vérification vendeur',
  },
  {
    icon: MessageCircle,
    title: 'Contactez-nous sur WhatsApp',
    description: 'Posez vos questions, demandez des infos supplémentaires, des photos ou vidéos récentes. Réponse en moins de 2 heures, 7j/7.',
    delay: '24-48h',
    delayLabel: 'Confirmation disponibilité',
  },
  {
    icon: ShieldCheck,
    title: 'Vérification en Chine',
    description: 'On contacte le vendeur chinois via WeChat pour confirmer la disponibilité, le prix exact, et obtenir des photos/vidéos récentes du véhicule.',
    delay: '48-72h',
    delayLabel: 'Signature proforma',
  },
  {
    icon: CreditCard,
    title: 'Confirmez et versez l\'acompte',
    description: 'Une fois satisfait, confirmez votre commande. Un acompte de 10% sécurise le véhicule. Vous recevez une facture proforma détaillée.',
    delay: '1-2 semaines',
    delayLabel: 'Préparation export',
  },
  {
    icon: ShoppingCart,
    title: 'Commande au vendeur',
    description: 'On finalise l\'achat auprès du vendeur chinois. Vous recevez une confirmation et un suivi de votre commande.',
    delay: '30-60 jours',
    delayLabel: 'Transport maritime',
  },
  {
    icon: Ship,
    title: 'Livraison (optionnelle)',
    description: 'Si vous souhaitez le transport, on organise l\'expédition maritime jusqu\'à votre port ou ville de destination. Devis personnalisé selon votre localisation.',
    delay: '1-2 semaines',
    delayLabel: 'Dédouanement local',
  },
]

const faqs = [
  {
    question: 'Comment se passe le paiement ?',
    answer: 'Acompte de 10% à la confirmation, solde avant expédition. Une facture proforma détaillée vous est fournie à chaque étape.',
  },
  {
    question: 'Quels sont les délais ?',
    answer: 'Validation de la commande en 48h. Transport maritime : 30 à 60 jours selon la destination. Nous vous tenons informé à chaque étape.',
  },
  {
    question: 'Les véhicules sont-ils garantis ?',
    answer: 'Les véhicules neufs bénéficient de la garantie constructeur. Pour l\'occasion, une inspection détaillée est possible en option avant achat.',
  },
  {
    question: 'Comment fonctionne le transport ?',
    answer: 'Transport maritime en conteneur ou RoRo (Roll-on Roll-off). Le choix dépend du véhicule et de la destination. Devis personnalisé fourni.',
  },
  {
    question: 'Quels sont les frais de douane ?',
    answer: 'Les frais de douane varient selon le pays de destination. Nous vous fournissons une estimation détaillée avant confirmation de la commande.',
  },
  {
    question: 'Et les pièces détachées ?',
    answer: 'Les marques chinoises développent rapidement leur réseau en Afrique. Nous pouvons également sourcer des pièces détachées directement en Chine.',
  },
  {
    question: 'Que se passe-t-il si le véhicule n\'est plus disponible ?',
    answer: 'On vous propose des alternatives similaires correspondant à vos critères, ou remboursement intégral de l\'acompte sous 48h.',
  },
  {
    question: 'DRAZONO est revendeur ou intermédiaire ?',
    answer: 'DRAZONO est un intermédiaire de confiance. Nous facilitons l\'achat entre vous et le vendeur chinois vérifié, en assurant transparence et sécurité.',
  },
]

export default function CommentCaMarchePage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight mb-4">
              Comment ça marche
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              De la découverte à la livraison, un processus simple, transparent et accompagné.
            </p>
          </div>
        </FadeIn>

        {/* Steps */}
        <div className="space-y-8 mb-20">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-brand-500/20 transition-all">
                <div className="flex gap-6 items-start">
                  <div className="shrink-0">
                    <div className="w-16 h-16 bg-brand-500/15 rounded-2xl flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-brand-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-brand-500">
                        Étape {i + 1}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        {step.delay} — {step.delayLabel}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#111827] mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Transparence financière */}
        <FadeIn delay={0.5}>
          <div className="bg-[#0A1325] rounded-2xl p-8 sm:p-10 mb-20">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Banknote className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                Comment on gère votre argent
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto">
                Transparence totale sur le processus financier.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-brand-500" />
                  <h3 className="text-sm font-semibold text-white">Acompte</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">10% à la commande pour sécuriser le véhicule</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-brand-500" />
                  <h3 className="text-sm font-semibold text-white">Solde</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">Payé avant expédition, après confirmation finale</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <RefreshCw className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Remboursement</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">Intégral si véhicule indisponible</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Timer className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">Délai remboursement</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">Sous 48h ouvrées maximum</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:col-span-2 lg:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <Landmark className="w-5 h-5 text-brand-500" />
                  <h3 className="text-sm font-semibold text-white">Mode de paiement</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">Virement bancaire international — traçable et sécurisé</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* FAQ */}
        <FadeIn>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight text-center mb-10">
              Questions fréquentes
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-gray-100 rounded-xl px-4">
                  <AccordionTrigger className="text-left text-[#111827] hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
