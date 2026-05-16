import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const SLOT_COLORS = { morning: '#f59e0b', afternoon: '#10b981', evening: '#6366f1' }

async function geocodeAddress(query) {
  const resp = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?limit=1&access_token=${mapboxgl.accessToken}`
  )
  const data = await resp.json()
  return data.features?.[0]?.center || null
}

async function fetchRoute(waypoints) {
  if (waypoints.length < 2) return null
  const coords = waypoints.map(w => `${w[0]},${w[1]}`).join(';')
  const resp = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
  )
  const data = await resp.json()
  return data.routes?.[0]?.geometry || null
}

function waitForLoad(map) {
  return new Promise(resolve => {
    if (map.loaded()) resolve()
    else map.once('load', resolve)
  })
}

export default function MapView({ days, activeDay, selectedHotel }) {
  const container = useRef(null)
  const map = useRef(null)
  const markers = useRef([])

  const day = days?.[activeDay]

  // Init map once
  useEffect(() => {
    if (map.current || !container.current) return

    const center = days?.[0]?.morning?.lng
      ? [days[0].morning.lng, days[0].morning.lat]
      : [0, 20]

    map.current = new mapboxgl.Map({
      container: container.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: 13,
    })
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Redraw when day or hotel changes
  useEffect(() => {
    if (!map.current || !day) return

    const draw = async () => {
      await waitForLoad(map.current)

      // Clear markers
      markers.current.forEach(m => m.remove())
      markers.current = []

      // Clear route
      if (map.current.getLayer('route-line')) map.current.removeLayer('route-line')
      if (map.current.getSource('route')) map.current.removeSource('route')

      const waypoints = []

      // Hotel start point
      if (selectedHotel) {
        const coords = await geocodeAddress(
          selectedHotel.address || selectedHotel.name
        )
        if (coords) {
          waypoints.push(coords)
          const el = Object.assign(document.createElement('div'), {
            style: `width:18px;height:18px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.4);cursor:pointer`,
          })
          markers.current.push(
            new mapboxgl.Marker(el)
              .setLngLat(coords)
              .setPopup(
                new mapboxgl.Popup({ offset: 14 }).setHTML(
                  `<p style="font-weight:600;font-size:12px;margin:0">🏨 ${selectedHotel.name}</p>
                   <p style="font-size:11px;color:#6b7280;margin:2px 0 0">Starting point</p>`
                )
              )
              .addTo(map.current)
          )
        }
      }

      // Day activity markers
      for (const slot of ['morning', 'afternoon', 'evening']) {
        const act = day[slot]
        if (!act?.lat || !act?.lng) continue
        waypoints.push([act.lng, act.lat])

        const el = Object.assign(document.createElement('div'), {
          style: `width:14px;height:14px;border-radius:50%;background:${SLOT_COLORS[slot]};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer`,
        })
        markers.current.push(
          new mapboxgl.Marker(el)
            .setLngLat([act.lng, act.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 12 }).setHTML(
                `<p style="font-weight:600;font-size:12px;margin:0">${act.place}</p>
                 <p style="font-size:11px;color:#6b7280;margin:2px 0 0">Day ${day.day} · ${slot}</p>`
              )
            )
            .addTo(map.current)
        )
      }

      // Draw route
      const geometry = await fetchRoute(waypoints)
      if (geometry) {
        map.current.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', geometry },
        })
        map.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          paint: { 'line-color': '#3b82f6', 'line-width': 3, 'line-opacity': 0.8 },
        })
      }

      // Fly to day center
      if (day.morning?.lng) {
        map.current.flyTo({ center: [day.morning.lng, day.morning.lat], zoom: 13, duration: 700 })
      }
    }

    draw()
  }, [activeDay, selectedHotel, days])

  if (!import.meta.env.VITE_MAPBOX_TOKEN) {
    return (
      <div className="w-full h-[400px] rounded-xl bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Add VITE_MAPBOX_TOKEN to enable the map</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div ref={container} className="w-full h-[400px] rounded-xl overflow-hidden shadow-sm" />
      <div className="flex gap-4 text-xs text-gray-400">
        <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />Morning</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />Afternoon</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-1" />Evening</span>
        {selectedHotel && <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />Hotel start</span>}
      </div>
    </div>
  )
}
