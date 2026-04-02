import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import ScrollToTop from '@/components/layout/ScrollToTop'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'DRAZONO — Import véhicules chinois au meilleur prix',
  description: 'Véhicules neufs et d\'occasion depuis la Chine. Prix réel vendeur, livraison mondiale en option.',
  openGraph: {
    title: 'DRAZONO — Import véhicules chinois au meilleur prix',
    description: 'Véhicules neufs et d\'occasion depuis la Chine. Prix réel vendeur, livraison mondiale en option.',
    siteName: 'DRAZONO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DRAZONO — Import véhicules chinois au meilleur prix',
    description: 'Véhicules neufs et d\'occasion depuis la Chine. Prix réel vendeur, livraison mondiale en option.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-[#111827]">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
        <ScrollToTop />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
