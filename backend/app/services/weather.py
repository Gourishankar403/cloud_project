import httpx
from app.core.config import settings

async def fetch_weather(lat: float, lon: float):
    # Using Open-Meteo which doesn't require an API key by default
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                return {
                    "source_type": "EXTERNAL_SOURCE",
                    "provider": "Open-Meteo",
                    "temperature": data.get("current_weather", {}).get("temperature"),
                    "wind_speed": data.get("current_weather", {}).get("windspeed"),
                    "weathercode": data.get("current_weather", {}).get("weathercode")
                }
            else:
                return {"error": "Failed to fetch weather", "status_code": response.status_code}
        except Exception as e:
            return {"error": str(e)}
