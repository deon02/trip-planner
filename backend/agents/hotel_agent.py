import logging
import httpx
from datetime import date
from config import settings

logger = logging.getLogger(__name__)

RAPIDAPI_HOST = "booking-com15.p.rapidapi.com"


def _headers() -> dict:
    return {
        "X-RapidAPI-Key": settings.rapidapi_key,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
    }


async def fetch_hotels(destination: str, start_date: date, end_date: date, budget: int) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            loc_resp = await client.get(
                f"https://{RAPIDAPI_HOST}/api/v1/hotels/searchDestination",
                headers=_headers(),
                params={"query": destination},
            )
            results = loc_resp.json().get("data", [])

            if not results:
                return {"error": "Destination not found", "hotels": []}

            dest_id = results[0].get("dest_id")
            dest_type = results[0].get("dest_type", "city")
            nights = max((end_date - start_date).days, 1)

            search_resp = await client.get(
                f"https://{RAPIDAPI_HOST}/api/v1/hotels/searchHotels",
                headers=_headers(),
                params={
                    "dest_id": dest_id,
                    "search_type": dest_type,
                    "arrival_date": str(start_date),
                    "departure_date": str(end_date),
                    "adults": 1,
                    "room_qty": 1,
                    "currency_code": "EUR",
                    "languagecode": "en-us",
                    "sort_by": "popularity",
                },
            )

            hotels = [
                {
                    "name": h.get("property", {}).get("name", "Unknown"),
                    "rating": round(float(h.get("property", {}).get("reviewScore", 0)), 1),
                    "price_per_night_usd": round(
                        float(h.get("priceBreakdown", {}).get("grossPrice", {}).get("value", 0)) / nights, 2
                    ),
                    "address": h.get("property", {}).get("wishlistName", ""),
                }
                for h in search_resp.json().get("data", {}).get("hotels", [])[:3]
            ]

            logger.info("Hotels fetched: %d options", len(hotels))
            return {"hotels": hotels}

    except Exception as e:
        logger.error("Hotel agent failed: %s", e)
        return {"error": str(e), "hotels": []}
