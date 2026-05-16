import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HotelCard({ hotel, selected, onSelect }) {
  const stars = Math.min(5, Math.round(hotel.rating / 2))

  return (
    <Card className={`transition-all duration-200 ${selected ? 'ring-2 ring-primary shadow-md shadow-indigo-100' : 'hover:shadow-md hover:-translate-y-px hover:shadow-indigo-100'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{hotel.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-amber-400 text-xs">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
              <span className="text-xs text-muted-foreground">{hotel.rating}</span>
            </div>
            {hotel.address && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{hotel.address}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-sm">€{hotel.price_per_night_usd.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">per night</p>
          </div>
        </div>
        <Button variant={selected ? 'default' : 'outline'} size="sm" className="w-full mt-3 text-xs" onClick={onSelect}>
          {selected ? '✓ Route starts here' : 'Use as route start'}
        </Button>
      </CardContent>
    </Card>
  )
}
