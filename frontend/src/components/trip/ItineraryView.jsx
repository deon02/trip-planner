
const SLOT_STYLES = {
  morning: 'bg-amber-50 text-amber-700',
  afternoon: 'bg-emerald-50 text-emerald-700',
  evening: 'bg-indigo-50 text-indigo-700',
}

export default function ItineraryView({ days, activeDay, setActiveDay }) {
  const day = days[activeDay]

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeDay === i
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900">{day.date}</h3>
          <span className="text-sm text-gray-400">
            {day.weather.condition} · {day.weather.temp_low}°–{day.weather.temp_high}°C
          </span>
        </div>

        <div className="space-y-4">
          {['morning', 'afternoon', 'evening'].map(slot => (
            <div key={slot} className="flex gap-3">
              <span className={`text-xs font-semibold px-2 py-1 rounded capitalize h-fit w-20 text-center flex-shrink-0 ${SLOT_STYLES[slot]}`}>
                {slot}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-gray-800 text-sm">{day[slot].place}</p>
                <p className="text-gray-500 text-sm">{day[slot].activity}</p>
                <p className="text-gray-400 text-xs mt-0.5">{day[slot].duration_hours}h</p>
              </div>
            </div>
          ))}
        </div>

        {day.tips && (
          <p className="mt-4 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
            💡 {day.tips}
          </p>
        )}
      </div>
    </div>
  )
}
