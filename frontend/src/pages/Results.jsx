import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import FlightCard from '../components/trip/FlightCard'
import HotelCard from '../components/trip/HotelCard'
import MapView from '../components/trip/MapView'
import ItineraryView from '../components/trip/ItineraryView'

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeDay, setActiveDay] = useState(0)
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!state?.result) {
    navigate('/')
    return null
  }

  const { result, route, tripRequest } = state

  function handleHotelSelect(hotel) {
    setSelectedHotel(prev => prev?.name === hotel.name ? null : hotel)
  }

  async function handleSave() {
    if (!user) { navigate('/login'); return }
    setSaving(true)
    await supabase.from('trips').insert({
      user_id: user.id,
      destination: tripRequest?.destination || result.days?.[0]?.date || 'Unknown',
      origin: tripRequest?.origin || null,
      start_date: tripRequest?.start_date || result.days?.[0]?.date,
      end_date: tripRequest?.end_date || result.days?.at(-1)?.date,
      budget: tripRequest?.budget || 0,
      interests: tripRequest?.interests || [],
      itinerary: result,
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-3xl mx-auto px-6 pt-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/')} className="text-blue-600 hover:underline text-sm">
            ← Plan another trip
          </button>
          {!saved ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : user ? 'Save trip' : 'Sign in to save'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              ✓ Saved — View dashboard
            </button>
          )}
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Itinerary</h1>
          <p className="text-gray-500">{result.summary}</p>
        </div>

        {result.budget_warning && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
            ⚠️ Estimated cost (€{result.total_estimated_cost_usd}) exceeds your budget. Check daily tips for savings.
          </div>
        )}

        <div className="flex gap-4 mb-8 text-center">
          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">€{result.total_estimated_cost_usd}</p>
            <p className="text-xs text-gray-400 mt-1">Estimated total</p>
          </div>
          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{result.days?.length}</p>
            <p className="text-xs text-gray-400 mt-1">Days planned</p>
          </div>
        </div>

        {result.hotels?.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Hotel Options</h2>
            <p className="text-xs text-gray-400 mb-3">Select a hotel to set it as your daily route starting point</p>
            <div className="space-y-3 mb-8">
              {result.hotels.map((h, i) => (
                <HotelCard
                  key={i}
                  hotel={h}
                  selected={selectedHotel?.name === h.name}
                  onSelect={() => handleHotelSelect(h)}
                />
              ))}
            </div>
          </>
        )}

        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Map — Day {activeDay + 1}
          {selectedHotel && (
            <span className="text-sm font-normal text-blue-600 ml-2">
              starting from {selectedHotel.name}
            </span>
          )}
        </h2>
        <div className="mb-8">
          <MapView days={result.days} activeDay={activeDay} selectedHotel={selectedHotel} />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-3">Day by Day</h2>
        <div className="mb-8">
          <ItineraryView days={result.days} activeDay={activeDay} setActiveDay={setActiveDay} />
        </div>

        {result.flights?.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Flight Options</h2>
            <div className="space-y-3">
              {result.flights.map((f, i) => <FlightCard key={i} flight={f} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
