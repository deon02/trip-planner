import logging
import httpx
from datetime import date
from config import settings

logger = logging.getLogger(__name__)


async def fetch_weather(destination: str, start_date: date, end_date: date) -> dict:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            geo_resp = await client.get(
                "http://api.openweathermap.org/geo/1.0/direct",
                params={"q": destination, "limit": 1, "appid": settings.openweathermap_api_key},
            )
            geo_data = geo_resp.json()
            if not geo_data:
                return {"error": "Location not found", "forecast": []}

            lat, lon = geo_data[0]["lat"], geo_data[0]["lon"]

            forecast_resp = await client.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={"lat": lat, "lon": lon, "appid": settings.openweathermap_api_key, "units": "metric", "cnt": 40},
            )
            forecast_data = forecast_resp.json()

            days: dict[str, list] = {}
            for item in forecast_data.get("list", []):
                item_date = item["dt_txt"][:10]
                days.setdefault(item_date, []).append(item)

            result = [
                {
                    "date": d,
                    "temp_high": round(max(r["main"]["temp"] for r in readings), 1),
                    "temp_low": round(min(r["main"]["temp"] for r in readings), 1),
                    "condition": [r["weather"][0]["description"] for r in readings][len(readings) // 2],
                }
                for d, readings in days.items()
            ]

            logger.info("Weather fetched for %s — %d days", destination, len(result))
            return {"lat": lat, "lon": lon, "forecast": result}

    except Exception as e:
        logger.error("Weather agent failed: %s", e)
        return {"error": str(e), "forecast": []}
