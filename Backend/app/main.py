from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.models.request_models import OptimizeRequest
from app.models.response_models import OptimizeResponse, ErrorResponse
from app.services.auth import verify_token
from app.services.optimize_service import run_optimization, OptimizationError
from app.utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title="Route Optimizer API",
    description="Backend para optimización de rutas con algoritmo genético",
    version="0.5.0",
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
# OPTIMIZE — lógica desacoplada en optimize_service.py
# ---------------------------------------------------------------------------

@app.post(
    "/optimize",
    response_model=OptimizeResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
def optimize(
    payload: OptimizeRequest,
    user: dict = Depends(verify_token),   # ← Firebase auth
):
    logger.info("Usuario autenticado | uid=%s", user.get("uid"))

    try:
        result = run_optimization(payload)
    except OptimizationError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))

    return OptimizeResponse(
        success=True,
        received_locations=len(payload.locations),
        mode=payload.mode,
        matrix=result["matrix"],
        route=result["route"],
        distance=result["distance"],
        metrics=result["metrics"],
    )