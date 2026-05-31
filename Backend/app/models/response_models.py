from pydantic import BaseModel
from typing import List


class PerformanceMetrics(BaseModel):
    matrix_seconds: float
    ga_seconds:     float
    total_seconds:  float


class OptimizeResponse(BaseModel):
    success:            bool
    received_locations: int
    mode:               str
    matrix:             List[List[int]]
    route:              List[int]
    distance:           int
    metrics:            PerformanceMetrics


class ErrorResponse(BaseModel):
    success: bool = False
    message: str