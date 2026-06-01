"""
main.py 

yes, but is in fact cloud_function.py

Entrypoint para Google Cloud Function (HTTP trigger).

Uso en GCP:
  - Runtime:        Python 3.11
  - Entry point:    optimize_route
  - Source:         este archivo en la raíz del deploy

Desarrollo local:
  Seguir usando app/main.py con uvicorn normalmente.
  Este archivo NO se usa localmente.
"""

import json
import os
from dotenv import load_dotenv

load_dotenv()

import functions_framework
from pydantic import ValidationError

from app.models.request_models import OptimizeRequest
from app.services.optimize_service import run_optimization, OptimizationError
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Orígenes permitidos — ajustar cuando el frontend tenga dominio fijo
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:5173,http://localhost:3000,https://ada-maps.vercel.app"
).split(",")

ALLOWED_IPS = {
    "190.149.42.226",
    "186.151.64.76",
    "192.168.1.14",
    "2800:98:1121:d4:c814:a9d0:1206:2b28",
}


def get_client_ip(request) -> str:
    """
    Obtiene la IP real del cliente usando
    la cabecera X-Forwarded-For de Google.
    """
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if not forwarded_for:
        return ""
    return forwarded_for.split(",")[0].strip()


def _cors_headers(origin: str) -> dict:
    """Retorna headers CORS apropiados según el origen del request."""
    allowed = origin if origin in ALLOWED_ORIGINS else ALLOWED_ORIGINS[0]
    return {
        "Access-Control-Allow-Origin":  allowed,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }


@functions_framework.http
def optimize_route(request):
    """
    Cloud Function HTTP handler.

    GCP llama esta función con cada request al endpoint desplegado.
    Equivalente al @app.post("/optimize") de FastAPI.
    """
    origin = request.headers.get("Origin", "")
    cors = _cors_headers(origin)

    # Preflight CORS — browsers lo envían antes del POST real
    if request.method == "OPTIONS":
        return ("", 204, cors)

    # ------------------------------------------------------------------
    # 0. Validar IP del cliente
    # ------------------------------------------------------------------
    client_ip = get_client_ip(request)

    if client_ip not in ALLOWED_IPS:
        logger.warning("IP bloqueada: %s", client_ip)
        return (
            json.dumps({"success": False, "message": "IP no autorizada."}),
            403,
            {**cors, "Content-Type": "application/json"},
        )

    logger.info("Request desde IP autorizada: %s", client_ip)

    if request.method != "POST":
        return (
            json.dumps({"success": False, "message": "Method not allowed."}),
            405,
            {**cors, "Content-Type": "application/json"},
        )

    # ------------------------------------------------------------------
    # 1. Leer y parsear body
    # ------------------------------------------------------------------
    try:
        request_json = request.get_json(silent=True)
    except Exception:
        request_json = None

    if not request_json:
        return (
            json.dumps({"success": False, "message": "Body JSON requerido."}),
            400,
            {**cors, "Content-Type": "application/json"},
        )

    # ------------------------------------------------------------------
    # 2. Validar con Pydantic — mismos modelos que FastAPI
    # ------------------------------------------------------------------
    try:
        payload = OptimizeRequest(**request_json)
    except ValidationError as e:
        errors = e.errors()
        logger.error("Payload inválido: %s", errors)
        return (
            json.dumps({
                "success": False,
                "message": "Payload inválido.",
                "errors": [
                    {"field": ".".join(str(x) for x in err["loc"]), "detail": err["msg"]}
                    for err in errors
                ],
            }),
            422,
            {**cors, "Content-Type": "application/json"},
        )

    # ------------------------------------------------------------------
    # 3. Correr optimización — mismo service que FastAPI
    # ------------------------------------------------------------------
    try:
        result = run_optimization(payload)
    except OptimizationError as e:
        logger.error("OptimizationError: %s", e)
        return (
            json.dumps({"success": False, "message": str(e)}),
            e.status_code,
            {**cors, "Content-Type": "application/json"},
        )
    except Exception as e:
        logger.error("Error inesperado: %s", e)
        return (
            json.dumps({"success": False, "message": "Internal server error."}),
            500,
            {**cors, "Content-Type": "application/json"},
        )

    # ------------------------------------------------------------------
    # 4. Responder
    # ------------------------------------------------------------------
    response_body = json.dumps({
        "success":            True,
        "received_locations": len(payload.locations),
        "mode":               payload.mode,
        "matrix":             result["matrix"],
        "route":              result["route"],
        "distance":           result["distance"],
        "metrics":            result["metrics"],
    })

    return (response_body, 200, {**cors, "Content-Type": "application/json"})