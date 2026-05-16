import { useState, useRef, useEffect } from 'react'

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

function parseSuggestion(feature) {
  const city = feature.text
  const country = feature.context?.find(c => c.id.startsWith('country'))?.text
  const region = feature.context?.find(c => c.id.startsWith('region'))?.text
  const regionPart = region && region.toLowerCase() !== city.toLowerCase() ? region : null
  const parts = [regionPart, country].filter(Boolean)
  const backendValue = country ? `${city}, ${country}` : feature.place_name
  const fullLabel = [city, ...parts].join(', ')
  return { id: feature.id, city, fullLabel, backendValue }
}

export function PlaceInput({ value, onChange, placeholder, required }) {
  const [inputVal, setInputVal] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const timerRef = useRef(null)
  const selectedRef = useRef(false)

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  function handleChange(e) {
    const val = e.target.value
    setInputVal(val)
    selectedRef.current = false
    onChange(val)

    clearTimeout(timerRef.current)
    if (val.length < 2) { setSuggestions([]); setOpen(false); return }

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?types=place,locality&limit=6&language=en&access_token=${TOKEN}`
        )
        const data = await res.json()
        const parsed = (data.features || []).map(parseSuggestion)
        setSuggestions(parsed)
        setOpen(parsed.length > 0)
      } catch {
        setSuggestions([])
      }
    }, 280)
  }

  function handleSelect(s) {
    selectedRef.current = true
    setInputVal(s.fullLabel)
    onChange(s.backendValue)
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <input
        className="h-11 w-full rounded-xl border border-black/[0.10] bg-transparent px-3.5 text-sm text-foreground outline-none transition-all placeholder:text-black/30 focus:border-foreground/30 focus:ring-2 focus:ring-black/[0.08]"
        placeholder={placeholder}
        value={inputVal}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoComplete="off"
        required={required}
      />

      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-white rounded-xl border border-black/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.10)] overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleSelect(s)}
              className={`w-full px-4 py-2.5 text-left hover:bg-black/[0.04] transition-colors text-[13px] text-foreground ${i < suggestions.length - 1 ? 'border-b border-black/[0.04]' : ''}`}
            >
              {s.fullLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
