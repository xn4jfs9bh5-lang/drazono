import FadeIn from '@/components/motion/FadeIn'

export default function MentionsLegalesPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight mb-8">
            Mentions légales
          </h1>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Éditeur du site</h2>
              <ul className="space-y-1">
                <li><strong>Nom :</strong> DRAZONO</li>
                <li><strong>Fondateur :</strong> Brayann Tarpaga</li>
                {/* TODO: configurer le domaine email contact@drazono.com — en attendant, le mail de contact reste tarpaga10@gmail.com côté réception */}
                <li><strong>Email :</strong> contact@drazono.com</li>
                <li><strong>Pays d&apos;opération :</strong> Burkina Faso / International</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Nature de l&apos;activité</h2>
              <p>
                DRAZONO est une <strong>plateforme d&apos;intermédiation</strong> entre les acheteurs et les vendeurs
                de véhicules en Chine. DRAZONO n&apos;est pas un revendeur et n&apos;est pas propriétaire des véhicules
                présentés sur le site. DRAZONO facilite la mise en relation, la vérification et
                l&apos;accompagnement à l&apos;achat.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Hébergement</h2>
              <p>
                Ce site est hébergé par :<br />
                <strong>Vercel Inc.</strong><br />
                340 S Lemon Ave #4133<br />
                Walnut, CA 91789<br />
                États-Unis<br />
                <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline">
                  vercel.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Propriété intellectuelle</h2>
              <p>L&apos;ensemble du contenu de ce site (textes, images, logos) est la propriété de DRAZONO. Toute reproduction est interdite sans autorisation préalable.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Responsabilité</h2>
              <p>
                DRAZONO s&apos;efforce de fournir des informations exactes et à jour. Cependant, des erreurs
                peuvent survenir. En tant que plateforme d&apos;intermédiation, DRAZONO ne saurait être tenu
                responsable des transactions directes entre acheteurs et vendeurs, ni des dommages
                résultant de l&apos;utilisation de ce site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Données personnelles</h2>
              <p>
                Les données collectées via ce site sont utilisées uniquement dans le cadre de la relation
                commerciale. Pour plus d&apos;informations, consultez notre{' '}
                <a href="/politique-confidentialite" className="text-[#2563EB] hover:underline">
                  politique de confidentialité
                </a>.
              </p>
            </section>

            <p className="text-sm text-gray-400 mt-8">Dernière mise à jour : avril 2026</p>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
