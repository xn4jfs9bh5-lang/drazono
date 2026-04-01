import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-6xl font-bold text-[#2563EB] mb-4">404</p>
        <h1 className="text-2xl font-bold text-[#111827] mb-2">Page introuvable</h1>
        <p className="text-gray-500 mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-6 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/catalogue"
            className="inline-flex items-center justify-center h-10 px-6 border border-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Voir le catalogue
          </Link>
        </div>
      </div>
    </div>
  )
}
