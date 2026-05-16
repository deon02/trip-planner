import httpx
import os


async def fetch_route(attractions_data: dict) -> dict:
    token = os.getenv("MAPBOX_TOKEN")
    attractions = attractions_data.get("attractions", [])

    waypoints = [a for a in attractions[:10] if a.get("lat") and a.get("lng")]

    if len(waypoints) < 2:
        return {"error": "Not enough waypoints for routing", "geometry": None}

    try:
        coords = ";".join(f"{w['lng']},{w['lat']}" for w in waypoints)

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"https://api.mapbox.com/directions/v5/mapbox/walking/{coords}",
                params={
                    "geometries": "geojson",
                    "overview": "full",
                    "access_token": token,
                },
            )
            data = resp.json()

            if not data.get("routes"):
                return {"error": "No route found", "geometry": None}

            route = data["routes"][0]
            return {
                "geometry": route["geometry"],
                "distance_km": round(route["distance"] / 1000, 2),
                "duration_min": round(route["duration"] / 60),
                "waypoints": waypoints,
            }

    except Exception as e:
        return {"error": str(e), "geometry": None}
