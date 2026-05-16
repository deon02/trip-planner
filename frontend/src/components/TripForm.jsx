import { useState } from 'react'

const INTERESTS = ['Culture', 'Food', 'Nature', 'History', 'Art', 'Shopping', 'Nightlife', 'Sport']

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
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-lg">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            type="text"
            required
            placeholder="e.g. New York"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.origin}
            onChange={e => setForm(p => ({ ...p, origin: e.target.value }))}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="text"
            required
            placeholder="e.g. Paris, France"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.destination}
            onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.start_date}
            onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.end_date}
            onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Budget (EUR)</label>
        <input
          type="number"
          required
          min="100"
          placeholder="e.g. 2000"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.budget}
          onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map(interest => {
            const val = interest.toLowerCase()
            const active = form.interests.includes(val)
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(val)}
                className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {interest}
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Planning...' : 'Plan My Trip'}
      </button>
    </form>
  )
}
