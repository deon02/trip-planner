import httpx
import os
from datetime import date

RAPIDAPI_HOST = "booking-com15.p.rapidapi.com"


def _headers() -> dict:
    return {
        "X-RapidAPI-Key": os.getenv("RAPIDAPI_KEY"),
        "X-RapidAPI-Host": RAPIDAPI_HOST,
    }


async def fetch_hotels(destination: str, start_date: date, end_date: date, budget: int) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Search destination to get dest_id
            loc_resp = await client.get(
                f"https://{RAPIDAPI_HOST}/api/v1/hotels/searchDestination",
                headers=_headers(),
                params={"query": destination},
            )
            loc_data = loc_resp.json()
            results = loc_data.get("data", [])

            if not results:
                return {"error": "Destination not found", "hotels": []}

            dest = results[0]
            dest_id = dest.get("dest_id")
            dest_type = dest.get("dest_type", "city")

            # Search hotels
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
            search_data = search_resp.json()
            nights = max((end_date - start_date).days, 1)

            hotels = []
            for h in search_data.get("data", {}).get("hotels", [])[:3]:
                prop = h.get("property", {})
                price = h.get("priceBreakdown", {}).get("grossPrice", {}).get("value", 0)
                hotels.append({
                    "name": prop.get("name", "Unknown"),
                    "rating": round(float(prop.get("reviewScore", 0)), 1),
                    "price_per_night_usd": round(float(price) / nights, 2),
                    "address": prop.get("wishlistName", ""),
                })

            return {"hotels": hotels}

    except Exception as e:
        return {"error": str(e), "hotels": []}
