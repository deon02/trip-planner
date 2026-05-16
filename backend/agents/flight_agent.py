import logging
import httpx
from datetime import date
from config import settings

logger = logging.getLogger(__name__)

RAPIDAPI_HOST = "sky-scrapper.p.rapidapi.com"


def _headers() -> dict:
    return {
        "X-RapidAPI-Key": settings.rapidapi_key,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
    }


async def _get_airport(client: httpx.AsyncClient, city: str) -> tuple[str, str] | tuple[None, None]:
    resp = await client.get(
        f"https://{RAPIDAPI_HOST}/api/v1/flights/searchAirport",
        headers=_headers(),
        params={"query": city, "locale": "en-US"},
    )
    results = resp.json().get("data", [])
    if not results:
        return None, None
    return results[0].get("skyId"), results[0].get("entityId")


async def fetch_flights(origin: str, destination: str, start_date: date, end_date: date) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            origin_sky, origin_entity = await _get_airport(client, origin)
            dest_sky, dest_entity = await _get_airport(client, destination)

            if not origin_sky or not dest_sky:
                return {"error": f"Could not resolve airports for {origin} or {destination}", "flights": []}

            resp = await client.get(
                f"https://{RAPIDAPI_HOST}/api/v2/flights/searchFlightsComplete",
                headers=_headers(),
                params={
                    "originSkyId": origin_sky,
                    "destinationSkyId": dest_sky,
                    "originEntityId": origin_entity,
                    "destinationEntityId": dest_entity,
                    "date": str(start_date),
                    "adults": 1,
                    "currency": "EUR",
                    "market": "en-US",
                    "locale": "en-US",
                },
            )
            itineraries = resp.json().get("data", {}).get("itineraries", [])

            flights = [
                {
                    "airline": item["legs"][0]["carriers"]["marketing"][0]["name"],
                    "departure": item["legs"][0]["departure"],
                    "arrival": item["legs"][0]["arrival"],
                    "price_usd": float(item["price"]["raw"]),
                    "duration": f"{item['legs'][0]['durationInMinutes'] // 60}h {item['legs'][0]['durationInMinutes'] % 60}m",
                }
                for item in itineraries[:3]
            ]

            logger.info("Flights fetched: %d options", len(flights))
            return {"flights": flights}

    except Exception as e:
        logger.error("Flight agent failed: %s", e)
        return {"error": str(e), "flights": []}
