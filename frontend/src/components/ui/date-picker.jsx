import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'

function formatDisplay(date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function ChevronLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function DatePicker({ value, onChange, placeholder = 'Select date', minDate }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selected = value ? new Date(value + 'T12:00:00') : undefined

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  function handleSelect(date) {
    if (!date) return
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`h-11 w-full rounded-xl border px-3.5 text-sm text-left flex items-center justify-between gap-2 outline-none transition-all
          ${open ? 'border-foreground/30 ring-2 ring-black/[0.08]' : 'border-black/[0.10] hover:border-foreground/25'}
          ${selected ? 'text-foreground' : 'text-black/30'}`}
      >
        <span>{selected ? formatDisplay(selected) : placeholder}</span>
        <svg className="text-black/25 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 w-[300px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-black/[0.06] p-4">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={minDate ? { before: new Date(minDate + 'T12:00:00') } : undefined}
            defaultMonth={selected || (minDate ? new Date(minDate + 'T12:00:00') : new Date())}
            showOutsideDays
            classNames={{
              root: '',
              months: '',
              month: '',
              month_caption: 'flex items-center justify-between mb-3 px-1',
              caption_label: 'text-[14px] font-semibold text-foreground',
              nav: 'flex items-center gap-1',
              button_previous: 'w-7 h-7 rounded-full flex items-center justify-center text-black/40 hover:bg-black/[0.06] hover:text-foreground transition-colors',
              button_next: 'w-7 h-7 rounded-full flex items-center justify-center text-black/40 hover:bg-black/[0.06] hover:text-foreground transition-colors',
              weeks: 'mt-1',
              weekdays: 'flex mb-1',
              weekday: 'flex-1 h-8 flex items-center justify-center text-[11px] font-semibold text-black/30',
              week: 'flex',
              day: 'flex-1 flex items-center justify-center p-0.5',
              day_button: 'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium transition-all cursor-pointer hover:bg-black/[0.06] text-foreground',
              selected: '[&>button]:bg-foreground [&>button]:text-white [&>button]:hover:bg-foreground/85',
              today: '[&>button]:font-bold [&>button]:underline [&>button]:decoration-dotted [&>button]:decoration-black/40 [&>button]:underline-offset-2',
              outside: '[&>button]:text-black/20',
              disabled: '[&>button]:text-black/20 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent',
            }}
            components={{
              Chevron: ({ orientation }) => orientation === 'left' ? <ChevronLeft /> : <ChevronRight />,
            }}
          />
        </div>
      )}
    </div>
  )
}
