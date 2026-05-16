export default function HotelCard({ hotel, selected, onSelect }) {
  const stars = Math.round(hotel.rating / 2)

  return (
    <div className={`border rounded-xl p-4 bg-white transition-all ${
      selected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:shadow-md'
    }`}>
      <div className="flex justify-between items-start">
        <span className="font-semibold text-gray-900">{hotel.name}</span>
        <span className="text-lg font-bold text-green-600">
          €{hotel.price_per_night_usd.toFixed(0)}
          <span className="text-xs font-normal text-gray-400">/night</span>
        </span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-yellow-400 text-sm">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
        <span className="text-xs text-gray-500">{hotel.rating}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{hotel.address}</p>
      <button
        onClick={onSelect}
        className={`mt-3 w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          selected
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
        }`}
      >
        {selected ? '✓ Route starts here' : 'Use as route start'}
      </button>
    </div>
  )
}
