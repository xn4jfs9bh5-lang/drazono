import FadeIn from '@/components/motion/FadeIn'

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight mb-8">
            Politique de confidentialité
          </h1>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Données collectées</h2>
              <p>Lors de votre inscription et utilisation de DRAZONO, nous pouvons collecter :</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone (optionnel)</li>
                <li>Pays et ville (optionnel)</li>
                <li>Historique de navigation sur le site</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Utilisation des données</h2>
              <p>Vos données sont utilisées pour :</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Gérer votre compte et vos favoris</li>
                <li>Vous contacter concernant vos demandes</li>
                <li>Vous envoyer des alertes véhicules (si activées)</li>
                <li>Améliorer nos services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Stockage</h2>
              <p>Vos données sont stockées de manière sécurisée sur Supabase (infrastructure cloud). L&apos;accès est restreint et protégé par authentification.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Durée de conservation</h2>
              <p>Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données sont effacées sous 30 jours.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Vos droits (RGPD)</h2>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Droit d&apos;accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit de suppression</li>
                <li>Droit à la portabilité</li>
              </ul>
              <p className="mt-2">Pour exercer ces droits, contactez-nous à contact@drazono.com.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Cookies</h2>
              <p>DRAZONO utilise des cookies essentiels au fonctionnement du site (authentification, préférences). Aucun cookie publicitaire n&apos;est utilisé.</p>
            </section>

            <p className="text-sm text-gray-400 mt-8">Dernière mise à jour : mars 2026</p>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
