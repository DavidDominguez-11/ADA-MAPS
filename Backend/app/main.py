from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.models.request_models import OptimizeRequest
from app.models.response_models import OptimizeResponse, ErrorResponse
from app.services.distance_matrix import build_distance_matrix, DistanceMatrixError
from app.services.genetic_algorithm import run_genetic_algorithm
from app.utils.matrix_validation import validate_matrix, MatrixValidationError
from app.utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title="Route Optimizer API",
    description="Backend para optimización de rutas con algoritmo genético",
    version="0.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {"status": "ok", "message": "Route Optimizer API running"}


# ---------------------------------------------------------------------------
# OPTIMIZE ENDPOINT
# ---------------------------------------------------------------------------

@app.post(
    "/optimize",
    response_model=OptimizeResponse,
    responses={400: {"model": ErrorResponse}},
)
def optimize(payload: OptimizeRequest, request: Request):
    # Auth header preparado — no validado todavía
    auth_header = request.headers.get("Authorization")
    if auth_header:
        logger.info("Authorization header presente (validación pendiente de implementar).")

    # 1. LOG — request recibida
    logger.info(
        "Request recibida | locations=%d | mode=%s",
        len(payload.locations),
        payload.mode,
    )

    # 2. Construir matriz de distancias reales
    try:
        matrix = build_distance_matrix(payload.locations)
    except DistanceMatrixError as e:
        logger.error("Error al construir matriz: %s", e)
        raise HTTPException(status_code=400, detail=str(e))

    # 3. LOG + validar matriz
    n = len(matrix)
    logger.info("Matriz %dx%d construida.", n, n)

    try:
        validate_matrix(matrix)
    except MatrixValidationError as e:
        logger.error("Matriz inválida: %s", e)
        raise HTTPException(status_code=400, detail=str(e))

    # 4. Correr algoritmo genético
    try:
        result = run_genetic_algorithm(matrix, mode=payload.mode)
    except Exception as e:
        logger.error("Error en algoritmo genético: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Optimization failed. Intenta de nuevo.",
        )

    # 5. LOG — resultado
    logger.info(
        "Optimización completada | route=%s | distance=%d m",
        result["route"],
        result["distance"],
    )

    return OptimizeResponse(
        success=True,
        received_locations=len(payload.locations),
        mode=payload.mode,
        matrix=matrix,
        route=result["route"],
        distance=result["distance"],
    )