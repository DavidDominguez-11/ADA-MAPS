from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.request_models import OptimizeRequest

app = FastAPI(
    title="Route Optimizer API",
    description="Backend para optimización de rutas con algoritmo genético",
    version="0.1.0",
)

# CORS — permite que el frontend React se comunique con este backend
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
    return {
        "success": True,
        "received_locations": len(payload.locations),
        "mode": payload.mode,
    }