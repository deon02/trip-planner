import httpx
import os
from datetime import date


async def fetch_weather(destination: str, start_date: date, end_date: date) -> dict:
    api_key = os.getenv("OPENWEATHERMAP_API_KEY")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            geo_resp = await client.get(
                "http://api.openweathermap.org/geo/1.0/direct",
                params={"q": destination, "limit": 1, "appid": api_key},
            )
            geo_data = geo_resp.json()
            if not geo_data:
                return {"error": "location not found", "forecast": []}

            lat, lon = geo_data[0]["lat"], geo_data[0]["lon"]

            forecast_resp = await client.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={"lat": lat, "lon": lon, "appid": api_key, "units": "metric", "cnt": 40},
            )
            forecast_data = forecast_resp.json()

            days: dict[str, list] = {}
            for item in forecast_data.get("list", []):
                item_date = item["dt_txt"][:10]
                days.setdefault(item_date, []).append(item)

            result = []
            for d, readings in days.items():
                temps = [r["main"]["temp"] for r in readings]
                conditions = [r["weather"][0]["description"] for r in readings]
                result.append({
                    "date": d,
                    "temp_high": round(max(temps), 1),
                    "temp_low": round(min(temps), 1),
                    "condition": conditions[len(conditions) // 2],
                })

            return {"lat": lat, "lon": lon, "forecast": result}

    except Exception as e:
        return {"error": str(e), "forecast": []}
