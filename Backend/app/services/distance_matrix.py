import math
import os
import requests
from typing import List


def get_api_key():
    return os.getenv("GOOGLE_MAPS_API_KEY").strip()


DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json"

# El límite real de la API es 100 elementos por request (elementos = orígenes × destinos).
# Para N locations enviando todo en un solo request: N² elementos.
# Con N > 10, N² > 100 → MAX_ELEMENTS_EXCEEDED.
# La solución es partir los orígenes en lotes de tamaño (100 // N),
# usando siempre los N destinos completos, y hacer ceil(N / batch_size) requests.
MAX_ELEMENTS_PER_REQUEST = 100
MAX_LOCATIONS = 25


class DistanceMatrixError(Exception):
    """Error al construir la matriz de distancias."""
    pass


def _fetch_rows(origins: List[str], destinations: List[str], api_key: str) -> List:
    """Hace un request a la API y retorna data["rows"]. Lanza DistanceMatrixError si falla."""
    try:
        response = requests.get(
            DISTANCE_MATRIX_URL,
            params={
                "origins":      "|".join(origins),
                "destinations": "|".join(destinations),
                "key":          api_key,
                "units":        "metric",
            },
            timeout=10,
        )
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise DistanceMatrixError("Timeout al conectar con Google Distance Matrix API.")
    except requests.exceptions.RequestException as e:
        raise DistanceMatrixError(f"Error de red al llamar Google API: {e}")

    data = response.json()

    api_status = data.get("status")
    if api_status != "OK":
        raise DistanceMatrixError(
            f"Google Distance Matrix API devolvió status: {api_status}. "
            f"Verifica que la key tenga habilitada la Distance Matrix API."
        )

    return data["rows"]


def build_distance_matrix(locations) -> List[List[int]]:
    """
    Construye una matriz NxN de distancias reales (en metros) entre todas las locations.

    Parte los orígenes en lotes para respetar el límite de 100 elementos por request.
    Hace ceil(N / batch_size) llamadas a la API y ensambla la matriz completa.

    Args:
        locations: Lista de objetos Location con atributos lat y lng.

    Returns:
        Matriz NxN donde matrix[i][j] = distancia en metros de i → j.

    Raises:
        DistanceMatrixError: Si la API falla o devuelve datos inválidos.
    """
    api_key = get_api_key()

    if not api_key:
        raise DistanceMatrixError(
            "GOOGLE_MAPS_API_KEY no está definida en las variables de entorno."
        )

    n = len(locations)

    if n < 2:
        raise DistanceMatrixError(
            f"Se necesitan al menos 2 locations para construir una matriz. Se recibieron: {n}"
        )

    if n > MAX_LOCATIONS:
        raise DistanceMatrixError(
            f"Máximo {MAX_LOCATIONS} locations permitidas. Se recibieron: {n}"
        )

    coordinates = [f"{loc.lat},{loc.lng}" for loc in locations]

    # Cuántos orígenes podemos enviar por request sin superar 100 elementos
    batch_size = max(1, MAX_ELEMENTS_PER_REQUEST // n)
    num_batches = math.ceil(n / batch_size)

    matrix = [None] * n

    for batch_idx in range(num_batches):
        start = batch_idx * batch_size
        end   = min(start + batch_size, n)

        rows = _fetch_rows(
            origins=coordinates[start:end],
            destinations=coordinates,
            api_key=api_key,
        )

        for local_i, row in enumerate(rows):
            matrix_row = []
            for element in row["elements"]:
                if element.get("status") != "OK":
                    matrix_row.append(-1)
                else:
                    matrix_row.append(element["distance"]["value"])
            matrix[start + local_i] = matrix_row

    return matrix