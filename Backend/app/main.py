from dotenv import load_dotenv
load_dotenv()  # Debe ir ANTES de cualquier import que use os.getenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models.request_models import OptimizeRequest
from app.services.distance_matrix import build_distance_matrix, DistanceMatrixError
from app.services.genetic_algorithm import run_genetic_algorithm

app = FastAPI(
    title="Route Optimizer API",
    description="Backend para optimización de rutas con algoritmo genético",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "message": "Route Optimizer API running"}


@app.post("/optimize")
def optimize(payload: OptimizeRequest):
    # 1. Construir matriz de distancias reales
    try:
        matrix = build_distance_matrix(payload.locations)
    except DistanceMatrixError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Correr algoritmo genético sobre la matriz
    try:
        result = run_genetic_algorithm(matrix, mode=payload.mode)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 3. Responder con matrix + ruta óptima
    return {
        "success":            True,
        "received_locations": len(payload.locations),
        "mode":               payload.mode,
        "matrix":             matrix,
        "route":              result["route"],
        "distance":           result["distance"],
    }