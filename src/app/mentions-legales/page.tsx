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
              <p>DRAZONO<br />Fondateur : Brayann<br />Email : contact@drazono.com</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Hébergement</h2>
              <p>Ce site est hébergé par Vercel Inc.<br />440 N Barranca Ave #4133<br />Covina, CA 91723<br />États-Unis</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Propriété intellectuelle</h2>
              <p>L&apos;ensemble du contenu de ce site (textes, images, logos) est la propriété de DRAZONO. Toute reproduction est interdite sans autorisation préalable.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111827] mb-3">Responsabilité</h2>
              <p>DRAZONO s&apos;efforce de fournir des informations exactes et à jour. Cependant, des erreurs peuvent survenir. DRAZONO ne saurait être tenu responsable des dommages résultant de l&apos;utilisation de ce site.</p>
            </section>

            <p className="text-sm text-gray-400 mt-8">Dernière mise à jour : mars 2026</p>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
