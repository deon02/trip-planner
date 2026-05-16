import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { INTERESTS } from '../../constants'

const inputClass = "h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
const labelClass = "block text-sm font-medium mb-1.5"

export default function TripForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    destination: '',
    origin: 'New York',
    start_date: '',
    end_date: '',
    budget: '',
    interests: [],
  })

  function toggleInterest(interest) {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ ...form, budget: parseInt(form.budget, 10) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="origin">From</label>
          <input
            id="origin"
            className={inputClass}
            placeholder="New York"
            value={form.origin}
            onChange={e => setForm(p => ({ ...p, origin: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="destination">To</label>
          <input
            id="destination"
            className={inputClass}
            placeholder="Paris, France"
            value={form.destination}
            onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="start_date">Departure</label>
          <input
            id="start_date"
            type="date"
            className={inputClass}
            value={form.start_date}
            onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="end_date">Return</label>
          <input
            id="end_date"
            type="date"
            className={inputClass}
            value={form.end_date}
            onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="budget">Budget (EUR)</label>
        <input
          id="budget"
          type="number"
          min="100"
          className={inputClass}
          placeholder="2000"
          value={form.budget}
          onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Interests</label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map(interest => {
            const val = interest.toLowerCase()
            const active = form.interests.includes(val)
            return (
              <button key={interest} type="button" onClick={() => toggleInterest(val)}>
                <Badge variant={active ? 'default' : 'outline'} className="cursor-pointer text-xs px-3 py-1">
                  {interest}
                </Badge>
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="submit"
        className="w-full h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-medium transition-all hover:from-indigo-600 hover:to-violet-600 hover:shadow-md hover:shadow-indigo-200 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
        disabled={loading}
      >
        {loading ? 'Planning your trip…' : 'Plan My Trip'}
      </button>
    </form>
  )
}
