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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Loading your trips...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-3xl mx-auto px-6 pt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
            <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            + New trip
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🗺</p>
            <p className="text-lg font-medium text-gray-500">No saved trips yet</p>
            <p className="text-sm mt-1">Plan a trip and save it to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map(trip => (
              <div
                key={trip.id}
                onClick={() => navigate('/results', { state: { result: trip.itinerary } })}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg">{trip.destination}</h3>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {trip.start_date} → {trip.end_date} · €{trip.budget} budget
                    </p>
                    {trip.interests?.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {trip.interests.map(i => (
                          <span key={i} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full capitalize">
                            {i}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => deleteTrip(e, trip.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors ml-4 text-xl leading-none"
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
