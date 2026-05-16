export default function HotelCard({ hotel, selected, onSelect }) {
  const stars = Math.min(5, Math.round(hotel.rating / 2))

  return (
    <div className={`border rounded-2xl p-5 transition-all bg-white ${
      selected ? 'border-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.9)]' : 'border-black/[0.08]'
    }`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] text-foreground truncate">{hotel.name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-amber-400 text-[11px] tracking-tight">
              {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
            </span>
            <span className="text-[11px] text-black/40">{hotel.rating}</span>
          </div>
          {hotel.address && (
            <p className="text-xs text-black/40 mt-1.5 truncate">{hotel.address}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-[15px] text-foreground">€{hotel.price_per_night_usd.toFixed(0)}</p>
          <p className="text-[11px] text-black/40 mt-0.5">/ night</p>
        </div>
      </div>

      <button
        onClick={onSelect}
        className={`w-full h-10 rounded-xl text-[13px] font-semibold transition-all ${
          selected
            ? 'bg-foreground text-white hover:opacity-80'
            : 'bg-black/[0.04] text-foreground hover:bg-black/[0.08]'
        }`}
      >
        {selected ? '✓ Selected as route start' : 'Select this hotel'}
      </button>
    </div>
  )
}
