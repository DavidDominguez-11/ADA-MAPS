import os
import requests
from typing import List

API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json"

# Google Distance Matrix API acepta máximo 25 orígenes x 25 destinos por request.
# Para N locations, necesitamos N*N elementos → límite real: 25 locations por llamada.
MAX_LOCATIONS = 25


class DistanceMatrixError(Exception):
    """Error al construir la matriz de distancias."""
    pass


def build_distance_matrix(locations) -> List[List[int]]:
    """
    Construye una matriz NxN de distancias reales (en metros) entre todas las locations.

    Args:
        locations: Lista de objetos Location con atributos lat y lng.

    Returns:
        Matriz NxN donde matrix[i][j] = distancia en metros de i → j.

    Raises:
        DistanceMatrixError: Si la API falla o devuelve datos inválidos.
    """
    if not API_KEY:
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
            f"La API acepta máximo {MAX_LOCATIONS} locations por request. Se recibieron: {n}"
        )

    coordinates = [f"{loc.lat},{loc.lng}" for loc in locations]
    locations_string = "|".join(coordinates)

    try:
        response = requests.get(
            DISTANCE_MATRIX_URL,
            params={
                "origins": locations_string,
                "destinations": locations_string,
                "key": API_KEY,
                "units": "metric",
            },
            timeout=10,
        )
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise DistanceMatrixError("Timeout al conectar con Google Distance Matrix API.")
    except requests.exceptions.RequestException as e:
        raise DistanceMatrixError(f"Error de red al llamar Google API: {e}")

    data = response.json()

    # Google puede responder 200 OK pero con error interno
    api_status = data.get("status")
    if api_status != "OK":
        raise DistanceMatrixError(
            f"Google Distance Matrix API devolvió status: {api_status}. "
            f"Verifica que la key tenga habilitada la Distance Matrix API."
        )

    matrix = []

    for i, row in enumerate(data["rows"]):
        matrix_row = []

        for j, element in enumerate(row["elements"]):
            element_status = element.get("status")

            if element_status != "OK":
                # Par de puntos sin ruta disponible (isla, etc.)
                # Se usa -1 como indicador; el algoritmo genético lo manejará.
                matrix_row.append(-1)
            else:
                distance = element["distance"]["value"]  # metros
                matrix_row.append(distance)

        matrix.append(matrix_row)

    return matrix