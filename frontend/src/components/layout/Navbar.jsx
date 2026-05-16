import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.07]">
      <div className="max-w-5xl mx-auto px-6 h-[52px] flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="text-sm font-semibold text-foreground tracking-tight hover:opacity-60 transition-opacity"
        >
          TripMind
        </button>

        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-black/[0.04]"
              >
                My Trips
              </button>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm text-foreground/50 hover:text-foreground transition-colors rounded-lg hover:bg-black/[0.04]"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 text-sm font-medium bg-foreground text-white rounded-full hover:opacity-80 transition-opacity"
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
