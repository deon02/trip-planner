import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TripForm from '../components/trip/TripForm'
import { useTripStream } from '../hooks/useTripStream'

const AGENT_ICONS = {
  weather: '🌤',
  attractions: '🗺',
  flights: '✈️',
  hotels: '🏨',
}

export default function Home() {
  const { startTrip, messages, result, loading, error } = useTripStream()
  const navigate = useNavigate()

  useEffect(() => {
    if (result) {
      navigate('/results', { state: result })
    }
  }, [result, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">TripMind</h1>
        <p className="text-gray-500 text-lg">AI-powered trip planning in seconds</p>
      </div>

      {error && (
        <div className="mb-4 w-full max-w-lg bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading && messages.length > 0 && (
        <div className="mb-6 w-full max-w-lg bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-3">Agent progress</p>
          <ul className="space-y-2">
            {messages.map((msg, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-lg">
        <TripForm onSubmit={startTrip} loading={loading} />
      </div>
    </div>
  )
}
