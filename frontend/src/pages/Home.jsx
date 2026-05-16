import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TripForm from '../components/trip/TripForm'
import { useTripStream } from '../hooks/useTripStream'

const AGENT_STEPS = [
  { key: 'weather',     label: 'Weather forecast'       },
  { key: 'flights',     label: 'Flight options'          },
  { key: 'hotels',      label: 'Hotel availability'      },
  { key: 'attractions', label: 'Attractions & points of interest' },
  { key: 'routing',     label: 'Mapping daily routes'    },
  { key: 'building',    label: 'Building your itinerary' },
]

function AgentRow({ label, status }) {
  return (
    <li className="flex items-center gap-3 py-1">
      <span className="relative flex h-2 w-2 flex-shrink-0">
        {status === 'running' && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full transition-colors duration-500 ${
          status === 'done' ? 'bg-emerald-500' : status === 'running' ? 'bg-amber-400' : 'bg-black/20'
        }`} />
      </span>
      <span className={`text-[13px] transition-colors duration-300 ${
        status === 'done' ? 'text-foreground' : status === 'running' ? 'text-foreground' : 'text-black/30'
      }`}>
        {label}
      </span>
      {status === 'done' && (
        <span className="ml-auto text-[11px] font-medium text-emerald-600">Done</span>
      )}
      {status === 'running' && (
        <span className="ml-auto text-[11px] font-medium text-amber-600">Working…</span>
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
    <div className="min-h-[calc(100vh-52px)] bg-white flex flex-col">

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-10">
        <div className="w-full max-w-xl">

          <div className="mb-10 text-center">
            <h1 className="text-4xl sm:text-[56px] font-bold tracking-tight leading-[1.05] text-foreground mb-4">
              Plan your<br className="hidden sm:block" /> perfect trip.
            </h1>
            <p className="text-[15px] sm:text-base text-black/50 leading-relaxed max-w-sm mx-auto">
              AI agents research flights, hotels, weather, and attractions in seconds.
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {loading && hasStarted && (
            <div className="mb-5 bg-black/[0.02] border border-black/[0.06] rounded-2xl px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-widest text-black/40 uppercase">
                  Planning your trip
                </span>
                <span className="text-[11px] font-semibold tabular-nums text-black/50">{progress}%</span>
              </div>
              <div className="w-full h-[3px] bg-black/[0.06] rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <ul className="space-y-0.5">
                {AGENT_STEPS.map(({ key, label }) => (
                  <AgentRow key={key} label={label} status={agents[key]} />
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white border border-black/[0.08] rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] p-6 sm:p-8">
            <TripForm onSubmit={startTrip} loading={loading} />
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="pb-10 text-center">
        <p className="text-[12px] text-black/30 tracking-wide">
          Powered by Claude · Mapbox · real-time flight &amp; hotel data
        </p>
      </div>

    </div>
  )
}
