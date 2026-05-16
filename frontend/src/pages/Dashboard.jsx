import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/login'); return }

    supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTrips(data || [])
        setLoading(false)
      })
  }, [user, navigate])

  async function deleteTrip(e, id) {
    e.stopPropagation()
    await supabase.from('trips').delete().eq('id', id)
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  if (loading) return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="h-8 w-32 bg-black/[0.06] rounded-xl mb-2 animate-pulse" />
            <div className="h-3.5 w-44 bg-black/[0.04] rounded-lg animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-black/[0.06] rounded-full animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-black/[0.03] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14">

        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
            <p className="text-[13px] text-black/40 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-full bg-foreground text-white text-[13px] font-semibold hover:opacity-80 transition-opacity"
          >
            New trip
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-5">🗺</p>
            <p className="text-base font-semibold text-foreground mb-1">No saved trips yet</p>
            <p className="text-[13px] text-black/40 mb-6">Plan a trip and save it to see it here.</p>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-full bg-foreground text-white text-[13px] font-semibold hover:opacity-80 transition-opacity"
            >
              Plan a trip
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {trips.map(trip => (
              <div
                key={trip.id}
                className="border border-black/[0.08] rounded-2xl p-5 bg-white cursor-pointer hover:border-black/[0.20] transition-all"
                onClick={() => navigate('/results', { state: { result: trip.itinerary } })}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[15px] text-foreground truncate">{trip.destination}</h3>
                    <p className="text-[12px] text-black/40 mt-1">
                      {trip.start_date} → {trip.end_date} · €{trip.budget}
                    </p>
                    {trip.interests?.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-2.5">
                        {trip.interests.map(i => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-full bg-black/[0.04] text-[11px] font-medium text-black/50 capitalize"
                          >
                            {i}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => deleteTrip(e, trip.id)}
                    className="text-black/20 hover:text-red-500 transition-colors text-xl leading-none mt-0.5 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50"
                    aria-label="Delete trip"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
