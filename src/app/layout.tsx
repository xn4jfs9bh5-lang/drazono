import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LayoutShell from '@/components/layout/LayoutShell'
import AnalyticsTracker from '@/components/layout/AnalyticsTracker'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'DRAZONO — Import véhicules chinois au meilleur prix',
    template: '%s — DRAZONO',
  },
  description: 'Achetez des véhicules neufs et d\'occasion importés directement de Chine. BYD, Chery, Geely, Haval — prix usine, livraison mondiale, zéro intermédiaire.',
  metadataBase: new URL('https://www.drazono.com'),
  openGraph: {
    title: 'DRAZONO — Import véhicules chinois au meilleur prix',
    description: 'Véhicules neufs et d\'occasion depuis la Chine. Prix réel vendeur, livraison dans 30+ pays.',
    siteName: 'DRAZONO',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.drazono.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DRAZONO — Import véhicules chinois au meilleur prix',
    description: 'Véhicules neufs et d\'occasion depuis la Chine. Prix réel vendeur, livraison dans 30+ pays.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.drazono.com' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-[#111827]">
        <LayoutShell>
          {children}
        </LayoutShell>
        <AnalyticsTracker />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
