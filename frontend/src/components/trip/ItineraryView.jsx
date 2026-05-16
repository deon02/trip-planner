import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const SLOT_VARIANT = {
  morning: 'bg-amber-50 text-amber-700 border-amber-200',
  afternoon: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  evening: 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 border ${
              activeDay === i
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
            }`}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <p className="font-semibold text-sm">{day.date}</p>
            <p className="text-xs text-muted-foreground">
              {day.weather.condition} · {day.weather.temp_low}°–{day.weather.temp_high}°C
            </p>
          </div>

          <div className="space-y-4">
            {['morning', 'afternoon', 'evening'].map((slot, idx) => (
              <div key={slot}>
                {idx > 0 && <Separator className="mb-4" />}
                <div className="flex gap-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md capitalize h-fit w-[4.5rem] text-center flex-shrink-0 border ${SLOT_VARIANT[slot]}`}>
                    {slot}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{day[slot].place}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{day[slot].activity}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{day[slot].duration_hours}h</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {day.tips && (
            <>
              <Separator className="mt-4 mb-3" />
              <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2.5 leading-relaxed">
                {day.tips}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
