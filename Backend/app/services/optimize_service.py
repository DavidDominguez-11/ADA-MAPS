"""
optimize_service.py

Encapsula el pipeline completo de optimización:
  locations → distance matrix → genetic algorithm → result

Al mantener la lógica aquí (fuera del endpoint), el mismo código
puede ser invocado desde:
  - FastAPI (local / Cloud Run)
  - Google Cloud Function (HTTP trigger)
  - Scripts de prueba

El endpoint solo se encarga de HTTP: recibir, llamar este service, responder.
"""

import time
from typing import List

from app.models.request_models import OptimizeRequest
from app.services.distance_matrix import build_distance_matrix, DistanceMatrixError
from app.services.genetic_algorithm import run_genetic_algorithm
from app.utils.matrix_validation import validate_matrix, MatrixValidationError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class OptimizationError(Exception):
    """Error controlado durante el pipeline de optimización."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.status_code = status_code


def run_optimization(payload: OptimizeRequest) -> dict:
    """
    Ejecuta el pipeline completo de optimización.

    Args:
        payload: OptimizeRequest validado por FastAPI/Pydantic.

    Returns:
        dict con matrix, route, distance y métricas de tiempo.

    Raises:
        OptimizationError: con mensaje y status_code apropiados.
    """
    t_total_start = time.perf_counter()

    logger.info(
        "Iniciando optimización | locations=%d | mode=%s",
        len(payload.locations),
        payload.mode,
    )

    # ------------------------------------------------------------------
    # STEP 1: Distance Matrix
    # ------------------------------------------------------------------
    t0 = time.perf_counter()

    try:
        matrix = build_distance_matrix(payload.locations)
    except DistanceMatrixError as e:
        raise OptimizationError(str(e), status_code=400)

    t_matrix = time.perf_counter() - t0
    n = len(matrix)
    logger.info("Matrix %dx%d construida | %.2fs", n, n, t_matrix)

    # ------------------------------------------------------------------
    # STEP 2: Validar matriz
    # ------------------------------------------------------------------
    try:
        validate_matrix(matrix)
    except MatrixValidationError as e:
        raise OptimizationError(str(e), status_code=400)

    # ------------------------------------------------------------------
    # STEP 3: Algoritmo genético
    # ------------------------------------------------------------------
    t0 = time.perf_counter()

    try:
        result = run_genetic_algorithm(matrix, mode=payload.mode)
    except ValueError as e:
        raise OptimizationError(str(e), status_code=400)
    except Exception as e:
        logger.error("Error inesperado en algoritmo genético: %s", e)
        raise OptimizationError("Optimization failed. Intenta de nuevo.", status_code=500)

    t_ga = time.perf_counter() - t0
    t_total = time.perf_counter() - t_total_start

    # ------------------------------------------------------------------
    # STEP 4: Log métricas
    # ------------------------------------------------------------------
    logger.info(
        "Optimización completada | route=%s | distance=%d m | "
        "matrix=%.2fs | GA=%.2fs | total=%.2fs",
        result["route"],
        result["distance"],
        t_matrix,
        t_ga,
        t_total,
    )

    return {
        "matrix":   matrix,
        "route":    result["route"],
        "distance": result["distance"],
        "metrics": {
            "matrix_seconds": round(t_matrix, 3),
            "ga_seconds":     round(t_ga, 3),
            "total_seconds":  round(t_total, 3),
        },
    }