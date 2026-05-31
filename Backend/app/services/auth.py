import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.logger import get_logger

logger = get_logger(__name__)

# HTTPBearer extrae automáticamente el token del header Authorization: Bearer ...
_bearer_scheme = HTTPBearer(auto_error=False)

# ---------------------------------------------------------------------------
# INICIALIZACIÓN — se ejecuta una sola vez al importar el módulo
# ---------------------------------------------------------------------------

def _init_firebase() -> bool:
    """
    Inicializa Firebase Admin SDK.
    Retorna True si se inicializó correctamente, False si no hay credenciales.
    """
    if firebase_admin._apps:
        return True  # Ya inicializado

    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")

    if not cred_path:
        logger.warning(
            "FIREBASE_CREDENTIALS_PATH no definida. "
            "Verificación de tokens desactivada."
        )
        return False

    if not os.path.exists(cred_path):
        logger.error("Archivo de credenciales Firebase no encontrado: %s", cred_path)
        return False

    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK inicializado correctamente.")
        return True
    except Exception as e:
        logger.error("Error al inicializar Firebase Admin: %s", e)
        return False


_firebase_enabled = _init_firebase()


# ---------------------------------------------------------------------------
# VERIFICACIÓN DE TOKEN
# ---------------------------------------------------------------------------

def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(_bearer_scheme),
) -> dict:
    """
    Dependencia FastAPI. Verifica el token Firebase del header Authorization.

    Uso en endpoint:
        @app.post("/optimize")
        def optimize(payload: OptimizeRequest, user=Depends(verify_token)):
            ...

    Returns:
        decoded_token dict con uid, email, etc.

    Raises:
        HTTPException 401 si el token es inválido o está ausente.
        HTTPException 503 si Firebase no está configurado.
    """
    if not _firebase_enabled:
        # Firebase no configurado — bloquear en producción, advertir en desarrollo
        env = os.getenv("ENV", "development")
        if env == "production":
            raise HTTPException(
                status_code=503,
                detail="Auth service not configured.",
            )
        else:
            # En desarrollo: pasar sin token para no bloquear pruebas locales
            logger.warning("Firebase no configurado — saltando verificación (solo desarrollo).")
            return {"uid": "dev-user", "email": "dev@local"}

    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Authorization header requerido. Formato: Bearer <token>",
        )

    token = credentials.credentials

    try:
        decoded = auth.verify_id_token(token)
        logger.info("Token verificado | uid=%s", decoded.get("uid"))
        return decoded
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expirado.")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Token inválido.")
    except Exception as e:
        logger.error("Error inesperado verificando token: %s", e)
        raise HTTPException(status_code=401, detail="Error de autenticación.")