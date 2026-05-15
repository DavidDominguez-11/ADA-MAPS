from pydantic import BaseModel
from typing import List, Literal


class Location(BaseModel):
    id: str
    address: str
    lat: float
    lng: float


class OptimizeRequest(BaseModel):
    locations: List[Location]
    mode: Literal["open", "closed"]