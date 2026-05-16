import asyncio
import json
import os
from typing import AsyncGenerator
import anthropic

from agents.weather_agent import fetch_weather
from agents.attractions_agent import fetch_attractions
from agents.flight_agent import fetch_flights
from agents.hotel_agent import fetch_hotels
from agents.routing_agent import fetch_route
from models.schemas import TripRequest


SYSTEM_PROMPT = """
You are TripMind, an expert travel planning AI. You receive structured data
from multiple travel APIs and synthesize it into a clear, practical,
day-by-day travel itinerary.

Given:
- Destination and travel dates
- Available flights (from Aviationstack)
- Available hotels (from Booking.com)
- Weather forecast (from OpenWeatherMap)
- Nearby attractions (from OpenTripMap)
- Optimal route between attractions (from Mapbox)
- User budget and interests

Return a JSON object with this exact structure:
{
  "summary": "2-sentence trip overview",
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

    user_message = f"""
Plan a {num_days}-day trip to {request.destination}.
Travel dates: {request.start_date} to {request.end_date}
Origin: {request.origin}
Budget: ${request.budget} EUR total
Interests: {', '.join(request.interests) if request.interests else 'general sightseeing'}

Weather forecast:
{json.dumps(results.get("weather", {}), indent=2)}

Nearby attractions with coordinates:
{json.dumps(results.get("attractions", {}), indent=2)}

Mapbox route between attractions:
{json.dumps(results.get("routing", {}), indent=2)}

Flight options:
{json.dumps(results.get("flights", {}), indent=2)}

Hotel options:
{json.dumps(results.get("hotels", {}), indent=2)}

Use the real attraction coordinates (lat/lng) in your day plan activities.
If flight or hotel data is empty, estimate realistic options based on your knowledge.
Return ONLY the JSON object. No markdown fences, no explanation, no preamble.
"""

    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
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

    return json.loads(raw)


async def run_orchestrator(request: TripRequest) -> dict:
    weather_data, attractions_data, flight_data, hotel_data = await asyncio.gather(
        fetch_weather(request.destination, request.start_date, request.end_date),
        fetch_attractions(request.destination, request.interests),
        fetch_flights(request.origin, request.destination, request.start_date, request.end_date),
        fetch_hotels(request.destination, request.start_date, request.end_date, request.budget),
    )
    routing_data = await fetch_route(attractions_data)
    results = {
        "weather": weather_data,
        "attractions": attractions_data,
        "flights": flight_data,
        "hotels": hotel_data,
        "routing": routing_data,
    }
    return await _call_claude(results, request)


async def run_orchestrator_stream(request: TripRequest) -> AsyncGenerator[str, None]:
    yield _sse("starting", "Spawning agents in parallel...")

    weather_task = asyncio.create_task(
        fetch_weather(request.destination, request.start_date, request.end_date)
    )
    attractions_task = asyncio.create_task(
        fetch_attractions(request.destination, request.interests)
    )
    flight_task = asyncio.create_task(
        fetch_flights(request.origin, request.destination, request.start_date, request.end_date)
    )
    hotel_task = asyncio.create_task(
        fetch_hotels(request.destination, request.start_date, request.end_date, request.budget)
    )

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
