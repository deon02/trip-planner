import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function FlightCard({ flight }) {
  const dep = new Date(flight.departure)
  const arr = new Date(flight.arrival)
  const fmt = d => isNaN(d) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <Card className="hover:shadow-md hover:-translate-y-px hover:shadow-indigo-100 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {flight.airline?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{flight.airline}</p>
              <p className="text-xs text-muted-foreground">{flight.duration}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm font-semibold">€{flight.price_usd}</Badge>
        </div>
        <Separator className="my-3" />
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold">{fmt(dep)}</span>
          <div className="flex-1 flex items-center gap-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-muted-foreground px-1">✈</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <span className="font-semibold">{fmt(arr)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
