'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-5xl font-bold text-red-500 mb-4">Oups</p>
        <h1 className="text-2xl font-bold text-[#111827] mb-2">Une erreur est survenue</h1>
        <p className="text-gray-600 mb-8">
          Quelque chose s&apos;est mal passé. Veuillez réessayer.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-10 px-6 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
