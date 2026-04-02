'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, MessageCircle, User, LogOut } from 'lucide-react'
import { NAV_LINKS, WHATSAPP_URL } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/75 backdrop-blur-lg border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-white font-bold text-xl tracking-tight">
              <span className="text-[#2563EB]">D</span>RAZONO
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link-underline text-gray-300 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/espace-client"
                    className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mon compte
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
                    aria-label="Se déconnecter"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Connexion
                </Link>
              )}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#0F172A] px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>

            <button
              className="md:hidden text-white p-1"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              ref={overlayRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-[#0F172A] border-l border-white/10 md:hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
                <span className="text-white font-bold text-lg">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-gray-400 hover:text-white p-1"
                  aria-label="Fermer le menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-gray-300 hover:text-white hover:bg-white/5 text-sm py-3 px-3 rounded-lg transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-t border-white/10 my-4" />

                {user ? (
                  <>
                    <Link
                      href="/espace-client"
                      className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/5 text-sm py-3 px-3 rounded-lg transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Mon compte
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false) }}
                      className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 text-sm py-3 px-3 rounded-lg transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/5 text-sm py-3 px-3 rounded-lg transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Connexion
                  </Link>
                )}
              </div>

              {/* WhatsApp CTA */}
              <div className="px-5 pb-6">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-3 rounded-full text-sm font-medium transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contacter sur WhatsApp
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
