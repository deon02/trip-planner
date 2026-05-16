import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TripForm from '../components/trip/TripForm'
import { useTripStream } from '../hooks/useTripStream'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const AGENT_STEPS = [
  { key: 'weather',     label: 'Weather forecast'       },
  { key: 'flights',     label: 'Flight options'          },
  { key: 'hotels',      label: 'Hotel availability'      },
  { key: 'attractions', label: 'Attractions & POIs'      },
  { key: 'routing',     label: 'Mapping daily routes'    },
  { key: 'building',    label: 'Building itinerary (AI)' },
]

function AgentRow({ label, status }) {
  return (
    <li className="flex items-center gap-3">
      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
        {status === 'running' && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
            status === 'done'
              ? 'bg-emerald-500'
              : status === 'running'
              ? 'bg-amber-400'
              : 'bg-border'
          }`}
        />
      </span>
      <span
        className={`text-sm transition-colors duration-300 ${
          status === 'done'
            ? 'text-foreground'
            : status === 'running'
            ? 'text-foreground/80'
            : 'text-muted-foreground/50'
        }`}
      >
        {label}
      </span>
      {status === 'done' && (
        <span className="ml-auto text-xs text-emerald-500 font-medium">Done</span>
      )}
      {status === 'running' && (
        <span className="ml-auto text-xs text-amber-500 font-medium">Working…</span>
      )}
    </li>
  )
}

export default function Home() {
  const { startTrip, agents, result, loading, error } = useTripStream()
  const navigate = useNavigate()

  useEffect(() => {
    if (result) navigate('/results', { state: result })
  }, [result, navigate])

  const doneCount = Object.values(agents).filter(s => s === 'done').length
  const progress = Math.round((doneCount / AGENT_STEPS.length) * 100)
  const hasStarted = Object.values(agents).some(s => s !== 'idle')

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

      {loading && hasStarted && (
        <Card className="mb-4 w-full max-w-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent progress</p>
              <p className="text-xs font-semibold tabular-nums text-foreground">{progress}%</p>
            </div>

            <div className="w-full h-1 bg-border rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <ul className="space-y-3">
              {AGENT_STEPS.map(({ key, label }) => (
                <AgentRow key={key} label={label} status={agents[key]} />
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
