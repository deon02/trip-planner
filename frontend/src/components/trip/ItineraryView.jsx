const SLOT_CONFIG = {
  morning:   { label: 'Morning',   color: 'text-amber-600',   dot: 'bg-amber-400' },
  afternoon: { label: 'Afternoon', color: 'text-emerald-600', dot: 'bg-emerald-400' },
  evening:   { label: 'Evening',   color: 'text-indigo-500',  dot: 'bg-indigo-400' },
}

export default function ItineraryView({ days, activeDay, setActiveDay }) {
  const day = days[activeDay]

  return (
    <div>
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-all ${
              activeDay === i
                ? 'bg-foreground text-white'
                : 'bg-black/[0.04] text-black/50 hover:bg-black/[0.08] hover:text-foreground'
            }`}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      {/* Day card */}
      <div className="border border-black/[0.08] rounded-2xl bg-white overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-black/[0.05] flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">{day.date}</p>
          <p className="text-xs text-black/40">
            {day.weather.condition} · {day.weather.temp_low}°–{day.weather.temp_high}°C
          </p>
        </div>

        {/* Slots */}
        <div className="divide-y divide-black/[0.04]">
          {['morning', 'afternoon', 'evening'].map(slot => {
            const config = SLOT_CONFIG[slot]
            return (
              <div key={slot} className="px-5 py-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center pt-0.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
                    <div className="w-px flex-1 bg-black/[0.05] mt-2" />
                  </div>
                  <div className="min-w-0 pb-2">
                    <p className={`text-[11px] font-semibold tracking-wide uppercase mb-1 ${config.color}`}>
                      {config.label}
                    </p>
                    <p className="font-semibold text-sm text-foreground">{day[slot].place}</p>
                    <p className="text-sm text-black/50 mt-0.5 leading-relaxed">{day[slot].activity}</p>
                    <p className="text-[11px] text-black/30 mt-1.5">{day[slot].duration_hours}h estimated</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tips */}
        {day.tips && (
          <div className="px-5 py-4 bg-black/[0.02] border-t border-black/[0.05]">
            <p className="text-[11px] font-semibold text-black/40 uppercase tracking-wide mb-1.5">Tip</p>
            <p className="text-[13px] text-black/60 leading-relaxed">{day.tips}</p>
          </div>
        )}
      </div>
    </div>
  )
}
