export default function FlightCard({ flight }) {
  const dep = new Date(flight.departure)
  const arr = new Date(flight.arrival)
  const fmt = d => isNaN(d) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="border border-black/[0.08] rounded-2xl p-4 hover:border-black/[0.15] transition-colors bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black/[0.04] flex items-center justify-center text-[11px] font-bold text-black/50 tracking-tight">
            {flight.airline?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{flight.airline}</p>
            <p className="text-xs text-black/40 mt-0.5">{flight.duration}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-foreground">€{flight.price_usd}</p>
          <p className="text-[11px] text-black/40 mt-0.5">per person</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold tabular-nums">{fmt(dep)}</span>
        <div className="flex-1 flex items-center gap-1.5 mx-1">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-black/30 text-xs">✈</span>
          <div className="h-px flex-1 bg-black/10" />
        </div>
        <span className="font-semibold tabular-nums">{fmt(arr)}</span>
      </div>
    </div>
  )
}
