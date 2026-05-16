import { useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useTripStream() {
  const [messages, setMessages] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const startTrip = useCallback(async (tripData) => {
    setLoading(true)
    setMessages([])
    setResult(null)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/trip/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Failed to start trip planning')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.status === 'complete') {
              setResult({ result: data.result, route: data.route || null, tripRequest: tripData })
              setLoading(false)
            } else {
              setMessages((prev) => [...prev, data.message])
            }
          } catch {
            // partial chunk, skip
          }
        }
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }, [])

  return { startTrip, messages, result, loading, error }
}
