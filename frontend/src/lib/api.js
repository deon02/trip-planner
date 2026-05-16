const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function planTrip(tripData) {
  const res = await fetch(`${API_BASE}/api/trip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tripData),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to plan trip')
  }
  return res.json()
}
