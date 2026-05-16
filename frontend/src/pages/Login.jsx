import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const inputClass = "h-11 w-full rounded-xl border border-black/[0.10] bg-transparent px-3.5 text-sm text-foreground outline-none transition-all placeholder:text-black/30 focus:border-foreground/30 focus:ring-2 focus:ring-black/[0.08]"
const labelClass = "block text-[11px] font-semibold tracking-widest text-black/40 uppercase mb-2"

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else navigate('/')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Check your email to confirm your account, then sign in.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-52px)] bg-[#f5f5f7] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_24px_rgba(0,0,0,0.06)] px-8 py-10">

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-[13px] text-black/40 hover:text-foreground transition-colors mb-10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <h1 className="text-3xl font-bold tracking-tight mb-1">
          {mode === 'login' ? 'Welcome back.' : 'Create account.'}
        </h1>
        <p className="text-[14px] text-black/40 mb-8">
          {mode === 'login' ? 'Sign in to access your saved trips.' : 'Start planning and saving trips.'}
        </p>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-[13px]">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl px-4 py-3 text-[13px]">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              className={inputClass}
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              required
              minLength={6}
              className={inputClass}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-foreground text-white text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-30 disabled:pointer-events-none mt-2"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-black/[0.06] text-center">
          <p className="text-[13px] text-black/40">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null) }}
              className="text-foreground font-semibold hover:opacity-60 transition-opacity"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}
