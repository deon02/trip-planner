export default function FlightCard({ flight }) {
  const departure = new Date(flight.departure)
  const arrival = new Date(flight.arrival)

  const fmt = (d) =>
    isNaN(d) ? flight.departure : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <span className="font-semibold text-gray-900">{flight.airline}</span>
        <span className="text-lg font-bold text-blue-600">€{flight.price_usd}</span>
      </div>
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
        <span>{fmt(departure)}</span>
        <span className="flex-1 border-t border-dashed border-gray-300" />
        <span className="text-xs text-gray-400">{flight.duration}</span>
        <span className="flex-1 border-t border-dashed border-gray-300" />
        <span>{fmt(arrival)}</span>
      </div>
    </div>
  )
}
