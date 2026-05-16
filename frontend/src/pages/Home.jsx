import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TripForm from '../components/trip/TripForm'
import { useTripStream } from '../hooks/useTripStream'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const AGENT_LABELS = {
  weather: 'Weather',
  attractions: 'Attractions',
  flights: 'Flights',
  hotels: 'Hotels',
  routing: 'Routes',
}

export default function Home() {
  const { startTrip, messages, result, loading, error } = useTripStream()
  const navigate = useNavigate()

  useEffect(() => {
    if (result) navigate('/results', { state: result })
  }, [result, navigate])

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Plan your next trip</h1>
        <p className="text-muted-foreground">AI agents research flights, hotels, weather, and attractions in seconds.</p>
      </div>

      {error && (
        <div className="mb-4 w-full max-w-lg bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading && messages.length > 0 && (
        <Card className="mb-4 w-full max-w-lg">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Agents working</p>
            <ul className="space-y-2">
              {messages.map((msg, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse flex-shrink-0" />
                  <span className="text-foreground/80">{msg}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="w-full max-w-lg shadow-sm">
        <CardContent className="p-6">
          <TripForm onSubmit={startTrip} loading={loading} />
        </CardContent>
      </Card>

      <Separator className="my-8 max-w-lg w-full" />
      <p className="text-xs text-muted-foreground text-center">
        Powered by Claude · Mapbox · real-time flight & hotel data
      </p>
    </div>
  )
}
