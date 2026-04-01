'use client'

import { Search, MessageCircle, ShieldCheck, CreditCard, ShoppingCart, Ship } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const steps = [
  {
    icon: Search,
    title: 'Explorez le catalogue',
    description: 'Parcourez nos véhicules vérifiés. Filtrez par marque, budget, type de carrosserie. Chaque véhicule a été sélectionné et vérifié par notre équipe.',
  },
  {
    icon: MessageCircle,
    title: 'Contactez-nous sur WhatsApp',
    description: 'Posez vos questions, demandez des infos supplémentaires, des photos ou vidéos récentes. Réponse en moins de 2 heures, 7j/7.',
  },
  {
    icon: ShieldCheck,
    title: 'Vérification en Chine',
    description: 'On contacte le vendeur chinois via WeChat pour confirmer la disponibilité, le prix exact, et obtenir des photos/vidéos récentes du véhicule.',
  },
  {
    icon: CreditCard,
    title: 'Confirmez et versez l\'acompte',
    description: 'Une fois satisfait, confirmez votre commande. Un acompte de 10% sécurise le véhicule. Vous recevez une facture proforma détaillée.',
  },
  {
    icon: ShoppingCart,
    title: 'Commande au vendeur',
    description: 'On finalise l\'achat auprès du vendeur chinois. Vous recevez une confirmation et un suivi de votre commande.',
  },
  {
    icon: Ship,
    title: 'Livraison (optionnelle)',
    description: 'Si vous souhaitez le transport, on organise l\'expédition maritime jusqu\'à votre port ou ville de destination. Devis personnalisé selon votre localisation.',
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
            <p className="text-gray-500 max-w-xl mx-auto">
              De la découverte à la livraison, un processus simple, transparent et accompagné.
            </p>
          </div>
        </FadeIn>

        {/* Steps */}
        <div className="space-y-8 mb-20">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="flex gap-6 items-start">
                <div className="shrink-0">
                  <div className="w-14 h-14 bg-[#2563EB]/10 rounded-2xl flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-[#2563EB]" />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#2563EB] block mb-1">
                    Étape {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-[#111827] mb-2">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

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
                  <AccordionContent className="text-gray-500 leading-relaxed">
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
