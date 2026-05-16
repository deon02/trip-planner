# TripMind

An AI-powered trip planner that spawns specialized agents in parallel to fetch real travel data — flights, hotels, weather, attractions, and map routes — then synthesizes everything into a day-by-day itinerary with a live map.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│   TripForm → SSE Stream → ItineraryView + MapView       │
└─────────────────────┬───────────────────────────────────┘
                      │ POST /api/trip/stream (SSE)
┌─────────────────────▼───────────────────────────────────┐
│                   FastAPI Backend                        │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Orchestrator (LangGraph)            │    │
│  │                                                  │    │
│  │   asyncio.gather() — all agents run in parallel  │    │
│  │                                                  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │    │
│  │  │ Weather  │ │ Flights  │ │     Hotels        │ │    │
│  │  │ Agent    │ │ Agent    │ │     Agent         │ │    │
│  │  └────┬─────┘ └────┬─────┘ └────────┬─────────┘ │    │
│  │       │            │                │            │    │
│  │  ┌────▼─────────────────────────────▼─────────┐ │    │
│  │  │         Attractions Agent                   │ │    │
│  │  └────────────────────┬───────────────────────┘ │    │
│  │                       │ (chained)                │    │
│  │  ┌────────────────────▼───────────────────────┐ │    │
│  │  │         Routing Agent (Mapbox)             │ │    │
│  │  └────────────────────────────────────────────┘ │    │
│  │                                                  │    │
│  │   Claude (claude-sonnet-4-6) synthesizes all     │    │
│  │   agent results into structured JSON itinerary   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │      Supabase         │
          │  Auth + Trips (RLS)   │
          └───────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router v6 |
| Map | Mapbox GL JS |
| Backend | FastAPI, Python 3.12 |
| AI Orchestration | Claude Sonnet 4.6 (Anthropic) |
| Auth & Database | Supabase (PostgreSQL + RLS) |
| Weather | OpenWeatherMap API |
| Attractions | OpenTripMap API |
| Flights | Sky Scrapper via RapidAPI |
| Hotels | Booking.com via RapidAPI |
| Directions | Mapbox Directions API |
| Config | Pydantic Settings |

---

## Agent Loop

1. User submits form → `POST /api/trip/stream`
2. Orchestrator spawns **5 agents in parallel** via `asyncio.gather()`:
   - `weather_agent` → OpenWeatherMap 5-day forecast
   - `flight_agent` → Sky Scrapper flight search
   - `hotel_agent` → Booking.com hotel search
   - `attractions_agent` → OpenTripMap POI search
   - `routing_agent` → Mapbox walking directions *(chained after attractions)*
3. Agent completions stream to frontend via **Server-Sent Events**
4. All results passed to **Claude Sonnet 4.6** with a structured system prompt
5. Claude returns a day-by-day JSON itinerary
6. Frontend renders interactive map, day tabs, flight/hotel cards

---

## Project Structure

```
trip-planner/
├── backend/
│   ├── config.py               # Pydantic Settings — single source of truth for env vars
│   ├── main.py                 # FastAPI app, CORS, logging setup
│   ├── agents/
│   │   ├── orchestrator.py     # Parallel agent coordination + Claude synthesis
│   │   ├── weather_agent.py    # OpenWeatherMap
│   │   ├── attractions_agent.py# OpenTripMap
│   │   ├── flight_agent.py     # Sky Scrapper (RapidAPI)
│   │   ├── hotel_agent.py      # Booking.com (RapidAPI)
│   │   └── routing_agent.py    # Mapbox Directions
│   ├── api/
│   │   └── trip.py             # POST /api/trip, POST /api/trip/stream
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response models
│   ├── db/
│   │   └── supabase.py         # Supabase client (Phase 4)
│   └── cache/
│       └── redis.py            # Upstash Redis (Phase 5)
│
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/
        │   │   └── Navbar.jsx          # Auth-aware navigation
        │   └── trip/
        │       ├── TripForm.jsx        # Trip input form
        │       ├── ItineraryView.jsx   # Day-tab itinerary
        │       ├── MapView.jsx         # Mapbox map + per-day routes
        │       ├── FlightCard.jsx      # Flight option card
        │       └── HotelCard.jsx       # Hotel card with route-start selection
        ├── constants/
        │   └── index.js               # Shared constants (interests, colors)
        ├── context/
        │   └── AuthContext.jsx        # Supabase auth state
        ├── hooks/
        │   └── useTripStream.js       # SSE streaming hook
        ├── lib/
        │   ├── api.js                 # REST API client
        │   └── supabase.js            # Supabase JS client
        └── pages/
            ├── Home.jsx               # Landing + form + agent progress
            ├── Results.jsx            # Full trip results
            ├── Login.jsx              # Auth page
            └── Dashboard.jsx         # Saved trips
```

---

## Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- Accounts: Anthropic, Supabase, Mapbox, OpenWeatherMap, OpenTripMap, RapidAPI

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Copy the root `.env.example` to `.env` and fill in your keys:

```env
ANTHROPIC_API_KEY=
OPENWEATHERMAP_API_KEY=
OPENTRIPMAP_API_KEY=
AVIATIONSTACK_API_KEY=
RAPIDAPI_KEY=
MAPBOX_TOKEN=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

```bash
uvicorn main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### Frontend

```bash
cd frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_MAPBOX_TOKEN=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

```bash
npm run dev
# → http://localhost:5173
```

### Database

Run `supabase_schema.sql` in your Supabase SQL Editor to create the `trips` table with Row Level Security.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/trip` | Generate itinerary (blocking) |
| `POST` | `/api/trip/stream` | Generate itinerary (SSE stream) |

### Request body (`/api/trip`)

```json
{
  "destination": "Paris, France",
  "origin": "New York",
  "start_date": "2026-06-01",
  "end_date": "2026-06-05",
  "budget": 2000,
  "interests": ["culture", "food", "history"]
}
```

---

## Roadmap

| Phase | Status | Description |
|---|---|---|
| 1 | ✅ | Scaffold, weather + attractions agents, basic itinerary |
| 2 | ✅ | Flight + hotel agents, SSE streaming |
| 3 | ✅ | Mapbox map, routing agent, day-filtered routes |
| 4 | ✅ | Supabase auth, trip saving, dashboard |
| 5 | 🔜 | Upstash Redis caching, UI polish, deploy to Vercel + Railway |
