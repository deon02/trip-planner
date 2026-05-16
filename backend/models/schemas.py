from pydantic import BaseModel
from typing import List
from datetime import date


class TripRequest(BaseModel):
    destination: str
    origin: str = "New York"
    start_date: date
    end_date: date
    budget: int
    interests: List[str]


class WeatherDay(BaseModel):
    condition: str
    temp_high: float
    temp_low: float


class ActivitySlot(BaseModel):
    activity: str
    place: str
    duration_hours: float
    lat: float
    lng: float


class DayPlan(BaseModel):
    day: int
    date: str
    weather: WeatherDay
    morning: ActivitySlot
    afternoon: ActivitySlot
    evening: ActivitySlot
    tips: str


class Flight(BaseModel):
    airline: str
    departure: str
    arrival: str
    price_usd: float
    duration: str


class Hotel(BaseModel):
    name: str
    rating: float
    price_per_night_usd: float
    address: str


class TripResponse(BaseModel):
    summary: str
    days: List[DayPlan]
    flights: List[Flight]
    hotels: List[Hotel]
    total_estimated_cost_usd: float
    budget_warning: bool
