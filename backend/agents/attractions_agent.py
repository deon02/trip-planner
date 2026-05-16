import httpx
import os


CATEGORY_MAP = {
    "culture": "cultural",
    "food": "foods",
    "nature": "natural",
    "history": "historic",
    "art": "museums",
    "shopping": "shops",
    "nightlife": "amusements",
    "sport": "sport",
    "religion": "religion",
    "architecture": "architecture",
}


async def fetch_attractions(destination: str, interests: list[str]) -> dict:
    api_key = os.getenv("OPENTRIPMAP_API_KEY")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            geo_resp = await client.get(
                "https://api.opentripmap.com/0.1/en/places/geoname",
                params={"name": destination, "apikey": api_key},
            )
            geo_data = geo_resp.json()

            if geo_data.get("status") == "NOT FOUND":
                return {"error": "destination not found", "attractions": []}

            lat = geo_data["lat"]
            lon = geo_data["lon"]

            kinds = ",".join(
                CATEGORY_MAP.get(i.lower(), "interesting_places")
                for i in (interests or ["interesting_places"])
            )

            places_resp = await client.get(
                "https://api.opentripmap.com/0.1/en/places/radius",
                params={
                    "radius": 15000,
                    "lon": lon,
                    "lat": lat,
                    "kinds": kinds,
                    "limit": 20,
                    "rate": "3",
                    "apikey": api_key,
                    "format": "json",
                },
            )
            places = places_resp.json()

            attractions = [
                {
                    "name": p.get("name", "Unknown"),
                    "lat": p["point"]["lat"],
                    "lng": p["point"]["lon"],
                    "kinds": p.get("kinds", ""),
                    "rate": p.get("rate", 0),
                }
                for p in places
                if p.get("name")
            ]

            return {"destination_lat": lat, "destination_lon": lon, "attractions": attractions}

    except Exception as e:
        return {"error": str(e), "attractions": []}
