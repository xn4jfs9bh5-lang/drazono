'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle, AlertTriangle, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  // Supabase puts the recovery token in the URL hash fragment
  // and auto-exchanges it for a session on page load
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setTokenValid(true)
      } else if (event === 'INITIAL_SESSION') {
        // Check if we have a session (token was valid)
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user && tokenValid === null) {
            // User has a session — might be from recovery or existing login
            // Check URL for recovery indicators
            const hash = window.location.hash
            if (hash.includes('type=recovery') || hash.includes('access_token')) {
              setTokenValid(true)
            } else {
              // Existing session — allow password change
              setTokenValid(true)
            }
          } else if (!user && tokenValid === null) {
            setTokenValid(false)
          }
        })
      }
    })

    // Fallback: after 3s if no event fired, check session
    const timer = setTimeout(() => {
      if (tokenValid === null) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          setTokenValid(!!user)
        })
      }
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [tokenValid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (updateError) {
      setError(updateError.message === 'New password should be different from the old password.'
        ? 'Le nouveau mot de passe doit être différent de l\'ancien.'
        : updateError.message)
    } else {
      setSuccess(true)
      // Sign out so they can log in fresh
      await supabase.auth.signOut()
    }
  }

  // Loading state while checking token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-[#0A1325] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Vérification du lien...</p>
        </div>
      </div>
    )
  }

  // Invalid/expired token
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-[#0A1325] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-brand-500">D</span>
              <span className="text-white">RAZONO</span>
            </h1>
          </div>
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700/50 p-6 sm:p-8 shadow-xl">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-white font-semibold text-lg mb-2">Lien invalide ou expiré</h2>
            <p className="text-slate-400 text-sm mb-6">
              Ce lien de réinitialisation n&apos;est plus valide. Demandez-en un nouveau.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full h-11 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Renvoyer un lien
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#0A1325] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-brand-500">D</span>
              <span className="text-white">RAZONO</span>
            </h1>
          </div>
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700/50 p-6 sm:p-8 shadow-xl">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-white font-semibold text-lg mb-2">Mot de passe modifié</h2>
            <p className="text-slate-400 text-sm mb-6">
              Votre mot de passe a été changé avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full h-11 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Password reset form
  return (
    <div className="min-h-screen bg-[#0A1325] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-brand-500">D</span>
            <span className="text-white">RAZONO</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Réinitialisation du mot de passe</p>
        </div>

        {/* Card */}
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700/50 p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-slate-400" />
            <h2 className="text-white font-semibold text-lg">Nouveau mot de passe</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-600 bg-slate-800/50 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Min. 8 caractères"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-600 bg-slate-800/50 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Confirmez votre mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Modification...
                </>
              ) : (
                'Changer mon mot de passe'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
