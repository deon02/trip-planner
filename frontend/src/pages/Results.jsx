import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import FlightCard from '../components/trip/FlightCard'
import HotelCard from '../components/trip/HotelCard'
import MapView from '../components/trip/MapView'
import ItineraryView from '../components/trip/ItineraryView'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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
    <div className="min-h-screen pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">

        <div className="flex flex-wrap items-center gap-2 justify-between mb-6 sm:mb-8">
          <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2" onClick={() => navigate('/')}>
            ← Plan another trip
          </Button>
          {!saved ? (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : user ? 'Save trip' : 'Sign in to save'}
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
              Saved — View dashboard
            </Button>
          )}
        </div>

        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">Your Itinerary</h1>
          <p className="text-muted-foreground text-sm">{result.summary}</p>
        </div>

        {result.budget_warning && (
          <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
            Estimated cost (€{result.total_estimated_cost_usd}) exceeds your budget. Check daily tips for savings.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-semibold">€{result.total_estimated_cost_usd}</p>
              <p className="text-xs text-muted-foreground mt-1">Estimated total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-semibold">{result.days?.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Days planned</p>
            </CardContent>
          </Card>
        </div>

        {result.hotels?.length > 0 && (
          <>
            <div className="mb-3">
              <h2 className="text-sm font-semibold">Hotel Options</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Select one to set it as your daily route start</p>
            </div>
            <div className="space-y-2 mb-6 sm:mb-8">
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

        <Separator className="mb-5" />

        <div className="flex flex-wrap items-baseline gap-2 mb-3">
          <h2 className="text-sm font-semibold">Map — Day {activeDay + 1}</h2>
          {selectedHotel && (
            <span className="text-xs text-muted-foreground truncate">starting from {selectedHotel.name}</span>
          )}
        </div>
        <div className="mb-6 sm:mb-8">
          <MapView days={result.days} activeDay={activeDay} selectedHotel={selectedHotel} />
        </div>

        <Separator className="mb-5" />

        <h2 className="text-sm font-semibold mb-3">Day by Day</h2>
        <div className="mb-6 sm:mb-8">
          <ItineraryView days={result.days} activeDay={activeDay} setActiveDay={setActiveDay} />
        </div>

        {result.flights?.length > 0 && (
          <>
            <Separator className="mb-5" />
            <h2 className="text-sm font-semibold mb-3">Flight Options</h2>
            <div className="space-y-2">
              {result.flights.map((f, i) => <FlightCard key={i} flight={f} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
