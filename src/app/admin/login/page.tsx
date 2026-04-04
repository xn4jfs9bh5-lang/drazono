'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, ShieldAlert } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const handleForgotPassword = async () => {
    if (!email) { setError('Entrez votre email d\'abord.'); return }
    setError('')
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (resetError) {
      setError(resetError.message)
    } else {
      setResetSent(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Email ou mot de passe incorrect.')
        setLoading(false)
        return
      }

      // Check admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut()
        setError('Accès refusé. Ce portail est réservé aux administrateurs.')
        setLoading(false)
        return
      }

      // Admin confirmed — redirect
      window.location.href = '/admin'
    } catch {
      setError('Erreur de connexion. Vérifiez votre connexion internet.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-[#1845CC]">D</span>
            <span className="text-white">RAZONO</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Administration</p>
        </div>

        {/* Card */}
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700/50 p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert className="w-5 h-5 text-slate-400" />
            <h2 className="text-white font-semibold text-lg">Connexion admin</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}
          {resetSent && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400">
              Un email de réinitialisation a été envoyé.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-600 bg-slate-800/50 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1845CC] focus:border-transparent"
                placeholder="admin@drazono.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-600 bg-slate-800/50 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1845CC] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <button type="button" onClick={handleForgotPassword} className="text-xs text-slate-400 hover:text-white transition-colors">
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#1845CC] hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Portail réservé aux administrateurs DRAZONO
        </p>
      </div>
    </div>
  )
}
