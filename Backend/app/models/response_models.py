from pydantic import BaseModel
from typing import List


class OptimizeResponse(BaseModel):
    success: bool
    received_locations: int
    mode: str
    matrix: List[List[int]]
    route: List[int]
    distance: int


class ErrorResponse(BaseModel):
    success: bool = False
    message: str