import { Metadata } from 'next'
import FadeIn from '@/components/motion/FadeIn'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente — DRAZONO',
}

export default function CGVPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight mb-8">
            Conditions Générales de Vente
          </h1>

          <div className="prose-custom space-y-6 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">1. Objet</h2>
              <p>Les présentes CGV régissent les relations entre DRAZONO et ses clients. DRAZONO agit en qualité d&apos;intermédiaire facilitant l&apos;achat de véhicules auprès de vendeurs chinois vérifiés. DRAZONO n&apos;est pas un revendeur de véhicules.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">2. Rôle de DRAZONO</h2>
              <p>DRAZONO est un intermédiaire de confiance. Nous facilitons la transaction entre l&apos;acheteur et le vendeur chinois en assurant : la vérification du véhicule, la communication avec le vendeur, la coordination logistique (si demandée).</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">3. Disponibilité</h2>
              <p>Tous les véhicules affichés sur DRAZONO sont <strong>sous réserve de disponibilité fournisseur</strong>. La disponibilité est confirmée après contact avec le vendeur chinois via WeChat.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">4. Acompte et paiement</h2>
              <p>Un acompte de 10% du prix du véhicule est demandé pour sécuriser la commande. Le solde est dû avant expédition. Une facture proforma détaillée est fournie à chaque étape.</p>
              <p>En cas d&apos;indisponibilité du véhicule après versement de l&apos;acompte, celui-ci est <strong>intégralement remboursé sous 48h</strong>.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">5. Annulation</h2>
              <p>Le client peut annuler sa commande avant la finalisation de l&apos;achat auprès du vendeur chinois. L&apos;acompte est remboursé. Après finalisation de l&apos;achat, l&apos;acompte n&apos;est pas remboursable.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">6. Transport et livraison</h2>
              <p>Le transport est un service optionnel. Un devis personnalisé est fourni selon la destination. Les délais de transport maritime sont indicatifs (30 à 60 jours) et peuvent varier selon les conditions maritimes.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">7. Risques</h2>
              <p>Le client est informé des risques potentiels : retard de transport maritime, blocage douanier, fluctuation des taux de change. DRAZONO ne peut être tenu responsable de ces aléas extérieurs.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">8. Litiges</h2>
              <p>En cas de litige, les parties s&apos;engagent à chercher une solution amiable. À défaut, le litige sera soumis aux tribunaux compétents.</p>
            </section>

            <p className="text-sm text-gray-400 mt-8">Dernière mise à jour : mars 2026</p>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
