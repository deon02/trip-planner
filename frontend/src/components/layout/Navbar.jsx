import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
      <button onClick={() => navigate('/')} className="font-bold text-gray-900 text-lg tracking-tight">
        TripMind
      </button>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              My Trips
            </button>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 font-medium"
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  )
}
