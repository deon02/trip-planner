import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

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
    <div className="min-h-screen pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Trips</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{user?.email}</p>
          </div>
          <Button size="sm" onClick={() => navigate('/')}>New trip</Button>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-4xl mb-4">🗺</p>
            <p className="text-base font-medium text-foreground/70">No saved trips yet</p>
            <p className="text-sm mt-1">Plan a trip and save it to see it here</p>
            <Button className="mt-6" size="sm" onClick={() => navigate('/')}>Plan a trip</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map(trip => (
              <Card
                key={trip.id}
                className="cursor-pointer hover:shadow-md hover:-translate-y-px hover:shadow-indigo-100 transition-all duration-200"
                onClick={() => navigate('/results', { state: { result: trip.itinerary } })}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{trip.destination}</h3>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {trip.start_date} → {trip.end_date} · €{trip.budget} budget
                      </p>
                      {trip.interests?.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-2.5">
                          {trip.interests.map(i => (
                            <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5 capitalize">
                              {i}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => deleteTrip(e, trip.id)}
                      className="text-muted-foreground/40 hover:text-destructive transition-colors text-lg leading-none mt-0.5 flex-shrink-0"
                      aria-label="Delete trip"
                    >
                      ×
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
