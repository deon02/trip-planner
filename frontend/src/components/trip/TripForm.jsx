import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { INTERESTS } from '../../constants'

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="origin">From</Label>
          <Input
            id="origin"
            placeholder="New York"
            value={form.origin}
            onChange={e => setForm(p => ({ ...p, origin: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="destination">To</Label>
          <Input
            id="destination"
            placeholder="Paris, France"
            value={form.destination}
            onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="start_date">Departure</Label>
          <Input
            id="start_date"
            type="date"
            value={form.start_date}
            onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end_date">Return</Label>
          <Input
            id="end_date"
            type="date"
            value={form.end_date}
            onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="budget">Budget (EUR)</Label>
        <Input
          id="budget"
          type="number"
          min="100"
          placeholder="2000"
          value={form.budget}
          onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Interests</Label>
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

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? 'Planning your trip…' : 'Plan My Trip'}
      </Button>
    </form>
  )
}
