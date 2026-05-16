import httpx
import os
from datetime import date

# Aviationstack free tier is HTTP only (HTTPS requires paid plan)
BASE = "http://api.aviationstack.com/v1"


async def _get_iata(client: httpx.AsyncClient, city: str) -> str | None:
    resp = await client.get(
        f"{BASE}/airports",
        params={"access_key": os.getenv("AVIATIONSTACK_API_KEY"), "search": city, "limit": 1},
    )
    data = resp.json()
    results = data.get("data", [])
    return results[0]["iata_code"] if results else None


async def fetch_flights(origin: str, destination: str, start_date: date, end_date: date) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            origin_iata = await _get_iata(client, origin)
            dest_iata = await _get_iata(client, destination)

            if not origin_iata or not dest_iata:
                return {"error": f"Could not resolve airports for {origin} or {destination}", "flights": []}

            resp = await client.get(
                f"{BASE}/flights",
                params={
                    "access_key": os.getenv("AVIATIONSTACK_API_KEY"),
                    "dep_iata": origin_iata,
                    "arr_iata": dest_iata,
                    "limit": 5,
                },
            )
            data = resp.json()

            seen_airlines = set()
            flights = []
            for f in data.get("data", []):
                airline = f.get("airline", {}).get("name", "Unknown")
                if airline in seen_airlines:
                    continue
                seen_airlines.add(airline)
                flights.append({
                    "airline": airline,
                    "departure": f.get("departure", {}).get("scheduled", str(start_date)),
                    "arrival": f.get("arrival", {}).get("scheduled", str(start_date)),
                    "duration": f.get("flight", {}).get("duration", "N/A"),
                    "origin_iata": origin_iata,
                    "dest_iata": dest_iata,
                })

            return {
                "flights": flights,
                "note": "Live route data from Aviationstack — prices estimated by AI",
            }

    except Exception as e:
        return {"error": str(e), "flights": []}
