import Link from 'next/link'
import FadeIn from '@/components/motion/FadeIn'
import { MailX } from 'lucide-react'

export default function DesabonnementPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4 text-center">
        <FadeIn>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MailX className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-xl font-bold text-[#111827] mb-2">
              Vous avez été désabonné
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Vous ne recevrez plus d&apos;emails de DRAZONO.
              Vous pouvez toujours visiter notre catalogue.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/catalogue"
                className="inline-flex items-center justify-center h-11 px-6 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Voir le catalogue
              </Link>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-brand-500 transition-colors"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
