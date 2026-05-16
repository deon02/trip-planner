import { useState } from 'react'
import { DatePicker } from '@/components/ui/date-picker'
import { PlaceInput } from '@/components/ui/place-input'
import { INTERESTS } from '../../constants'

const labelClass = "block text-[11px] font-semibold tracking-widest text-black/40 uppercase mb-2"
const inputClass = "h-11 w-full rounded-xl border border-black/[0.10] bg-transparent px-3.5 text-sm text-foreground outline-none transition-all placeholder:text-black/30 focus:border-foreground/30 focus:ring-2 focus:ring-black/[0.08]"

export default function TripForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    destination: '',
    origin: '',
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
    if (!form.start_date || !form.end_date) return
    onSubmit({ ...form, budget: parseInt(form.budget, 10) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>From</label>
          <PlaceInput
            value={form.origin}
            onChange={val => setForm(p => ({ ...p, origin: val }))}
            placeholder="City, Country"
            required
          />
        </div>
        <div>
          <label className={labelClass}>To</label>
          <PlaceInput
            value={form.destination}
            onChange={val => setForm(p => ({ ...p, destination: val }))}
            placeholder="City, Country"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Departure</label>
          <DatePicker
            value={form.start_date}
            onChange={val => setForm(p => ({
              ...p,
              start_date: val,
              end_date: p.end_date && p.end_date < val ? '' : p.end_date,
            }))}
            placeholder="Select date"
          />
        </div>
        <div>
          <label className={labelClass}>Return</label>
          <DatePicker
            value={form.end_date}
            onChange={val => setForm(p => ({ ...p, end_date: val }))}
            placeholder="Select date"
            minDate={form.start_date || undefined}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Budget (EUR)</label>
        <input
          type="number"
          min="100"
          className={inputClass}
          placeholder="2,000"
          value={form.budget}
          onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Interests</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {INTERESTS.map(interest => {
            const val = interest.toLowerCase()
            const active = form.interests.includes(val)
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(val)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
                  active
                    ? 'bg-foreground text-white border-foreground'
                    : 'bg-transparent text-foreground/60 border-black/[0.12] hover:border-foreground/40 hover:text-foreground'
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
        disabled={loading || !form.start_date || !form.end_date}
        className="w-full h-11 rounded-full bg-foreground text-white text-sm font-semibold transition-all hover:opacity-80 active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none mt-2"
      >
        {loading ? 'Planning your trip…' : 'Plan My Trip'}
      </button>

    </form>
  )
}
