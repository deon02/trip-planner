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
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-8 sm:pt-12">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-[13px] text-black/40 hover:text-foreground transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Plan another
          </button>

          {!saved ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-full bg-foreground text-white text-[13px] font-semibold hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              {saving ? 'Saving…' : user ? 'Save trip' : 'Sign in to save'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-full border border-black/[0.12] text-[13px] font-medium text-black/60 hover:border-black/[0.30] hover:text-foreground transition-all"
            >
              Saved → Dashboard
            </button>
          )}
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Your Itinerary</h1>
          <p className="text-[15px] text-black/50 leading-relaxed">{result.summary}</p>
        </div>

        {result.budget_warning && (
          <div className="mb-6 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl px-4 py-3 text-sm">
            Estimated cost (€{result.total_estimated_cost_usd}) exceeds your budget. See daily tips for savings ideas.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {[
            { value: `€${result.total_estimated_cost_usd}`, label: 'Estimated total' },
            { value: result.days?.length, label: 'Days planned' },
          ].map(stat => (
            <div key={stat.label} className="border border-black/[0.08] rounded-2xl p-5 text-center bg-white">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-[12px] text-black/40 mt-1.5 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Flights */}
        {result.flights?.length > 0 && (
          <section className="mb-10">
            <SectionHeader title="Flight Options" />
            <div className="space-y-2.5">
              {result.flights.map((f, i) => <FlightCard key={i} flight={f} />)}
            </div>
          </section>
        )}

        {/* Hotels */}
        {result.hotels?.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              title="Pick your hotel"
              subtitle="Select one — it sets the start point for your daily map routes."
            />
            <div className="space-y-2.5">
              {result.hotels.map((h, i) => (
                <HotelCard
                  key={i}
                  hotel={h}
                  selected={selectedHotel?.name === h.name}
                  onSelect={() => handleHotelSelect(h)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Map */}
        <section className="mb-10">
          <SectionHeader
            title={`Map — Day ${activeDay + 1}`}
            subtitle={selectedHotel ? `Starting from ${selectedHotel.name}` : 'Select a hotel above to set your route start'}
          />
          <div className="rounded-2xl overflow-hidden border border-black/[0.08]">
            <MapView days={result.days} activeDay={activeDay} selectedHotel={selectedHotel} />
          </div>
        </section>

        {/* Itinerary */}
        <section className="mb-10">
          <SectionHeader title="Day by Day" />
          <ItineraryView days={result.days} activeDay={activeDay} setActiveDay={setActiveDay} />
        </section>

      </div>
    </div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="text-[12px] text-black/40 mt-0.5">{subtitle}</p>}
    </div>
  )
}
