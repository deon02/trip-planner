import asyncio
import json
import logging
from typing import AsyncGenerator

import anthropic

from agents.weather_agent import fetch_weather
from agents.attractions_agent import fetch_attractions
from agents.flight_agent import fetch_flights
from agents.hotel_agent import fetch_hotels
from agents.routing_agent import fetch_route
from config import settings
from models.schemas import TripRequest

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are TripMind, an expert travel planning AI. You receive structured data
from multiple travel APIs and synthesize it into a clear, practical,
day-by-day travel itinerary.

## Core planning rules — follow these strictly:

### No repetition
Every place name in the itinerary must be unique across the ENTIRE trip.
Never assign the same place to two different time slots, even on different days.
Each morning/afternoon/evening slot must have a different place.

### Geographic clustering per day
Each day should focus on a single neighborhood or area of the city.
Group nearby attractions together so the morning → afternoon → evening flow
is a natural walk or short transit — not a zigzag across the city.
Use the coordinates in the attractions data to judge proximity.
A good day reads like: "north of the river" or "the old town quarter", not random scattered points.

### Destination size honesty
Count the unique, quality attractions in the data. If the destination cannot
fill the requested number of days with distinct, non-repeated places:
- Say so clearly in the "summary" field (e.g., "Barcelona is best explored in 4 days;
  your 7-day booking gives you time for a day trip to Montserrat or Sitges.")
- On days where content runs thin, set tips to a frank note like:
  "Today's area overlaps with Day 2 — consider a half-day trip to [nearby town]
  instead of spending a full day here."
- Do NOT invent fake or low-quality filler activities just to pad the schedule.

### Fitting a day into one area
Where the city's geography allows it, design each day so the user could
realistically visit all three slots without a vehicle — just walking or one metro ride.
If a destination is small enough that one day covers it well, say so in the summary.

## Output format
Return a JSON object with this exact structure:
{
  "summary": "2-3 sentence overview — include honest advice if the trip length is too long for the destination",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "weather": { "condition": "", "temp_high": 0, "temp_low": 0 },
      "morning": { "activity": "", "place": "", "duration_hours": 0, "lat": 0, "lng": 0 },
      "afternoon": { "activity": "", "place": "", "duration_hours": 0, "lat": 0, "lng": 0 },
      "evening": { "activity": "", "place": "", "duration_hours": 0, "lat": 0, "lng": 0 },
      "tips": ""
    }
  ],
  "flights": [
    { "airline": "", "departure": "", "arrival": "", "price_usd": 0, "duration": "" }
  ],
  "hotels": [
    { "name": "", "rating": 0, "price_per_night_usd": 0, "address": "" }
  ],
  "total_estimated_cost_usd": 0,
  "budget_warning": true or false
}

Always respect the user's budget. If estimated cost exceeds budget, set
budget_warning to true and suggest cheaper alternatives in the tips field.
Stay practical and specific — real place names, real timings, real costs.
Use the attraction coordinates from the routing data when assigning lat/lng to activities.
"""


def _sse(status: str, message: str, data: dict | None = None) -> str:
    payload: dict = {"status": status, "message": message}
    if data:
        payload["data"] = data
    return f"data: {json.dumps(payload)}\n\n"


async def _call_claude(results: dict, request: TripRequest) -> dict:
    num_days = (request.end_date - request.start_date).days + 1

    attractions = results.get("attractions", {}).get("attractions", [])
    num_slots = num_days * 3  # morning + afternoon + evening

    user_message = f"""
Plan a {num_days}-day trip to {request.destination}.
Travel dates: {request.start_date} to {request.end_date}
Origin: {request.origin}
Budget: €{request.budget} total
Interests: {', '.join(request.interests) if request.interests else 'general sightseeing'}

The itinerary needs {num_slots} unique place slots ({num_days} days × 3 slots).
There are {len(attractions)} attractions in the data.
{"WARNING: Fewer attractions than slots — apply the destination size honesty rules. Do not repeat any place." if len(attractions) < num_slots else "Assign each attraction to at most one slot. Cluster by geography per day."}

Weather forecast:
{json.dumps(results.get("weather", {}), indent=2)}

Nearby attractions with coordinates (use these for geographic clustering):
{json.dumps(results.get("attractions", {}), indent=2)}

Mapbox route between attractions:
{json.dumps(results.get("routing", {}), indent=2)}

Flight options:
{json.dumps(results.get("flights", {}), indent=2)}

Hotel options:
{json.dumps(results.get("hotels", {}), indent=2)}

Use real attraction coordinates (lat/lng) in activity slots.
If flight or hotel data is empty, estimate realistic options.
Return ONLY the JSON object. No markdown, no explanation.
"""

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    logger.info("Itinerary generated for %s", request.destination)
    return json.loads(raw)


async def run_orchestrator(request: TripRequest) -> dict:
    weather_data, attractions_data, flight_data, hotel_data = await asyncio.gather(
        fetch_weather(request.destination, request.start_date, request.end_date),
        fetch_attractions(request.destination, request.interests),
        fetch_flights(request.origin, request.destination, request.start_date, request.end_date),
        fetch_hotels(request.destination, request.start_date, request.end_date, request.budget),
    )
    routing_data = await fetch_route(attractions_data)
    return await _call_claude(
        {"weather": weather_data, "attractions": attractions_data,
         "flights": flight_data, "hotels": hotel_data, "routing": routing_data},
        request,
    )


async def run_orchestrator_stream(request: TripRequest) -> AsyncGenerator[str, None]:
    yield _sse("starting", "Spawning agents in parallel...")

    weather_task = asyncio.create_task(fetch_weather(request.destination, request.start_date, request.end_date))
    attractions_task = asyncio.create_task(fetch_attractions(request.destination, request.interests))
    flight_task = asyncio.create_task(fetch_flights(request.origin, request.destination, request.start_date, request.end_date))
    hotel_task = asyncio.create_task(fetch_hotels(request.destination, request.start_date, request.end_date, request.budget))

    task_meta = {
        weather_task: ("weather", "Weather forecast ready"),
        attractions_task: ("attractions", "Attractions data ready"),
        flight_task: ("flights", "Flight options found"),
        hotel_task: ("hotels", "Hotel options found"),
    }

    pending = set(task_meta.keys())
    results: dict = {}
    routing_task = None

    while pending or (routing_task and not routing_task.done()):
        to_wait = pending | ({routing_task} if routing_task and not routing_task.done() else set())
        done, _ = await asyncio.wait(to_wait, return_when=asyncio.FIRST_COMPLETED)

        for task in done:
            if task is routing_task:
                results["routing"] = task.result()
                yield _sse("agent_done", "Route mapped between attractions", {"agent": "routing"})
            elif task in task_meta:
                name, msg = task_meta[task]
                results[name] = task.result()
                pending.discard(task)
                yield _sse("agent_done", msg, {"agent": name})

                if name == "attractions" and routing_task is None:
                    routing_task = asyncio.create_task(fetch_route(results["attractions"]))
                    yield _sse("fetching", "Mapping route between attractions...")

    yield _sse("building", "Building your itinerary with AI...")
    result = await _call_claude(results, request)
    route = results.get("routing", {})
    yield f"data: {json.dumps({'status': 'complete', 'result': result, 'route': route})}\n\n"
