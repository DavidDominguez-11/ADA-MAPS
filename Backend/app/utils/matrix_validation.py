from typing import List
from app.utils.logger import get_logger

logger = get_logger(__name__)


class MatrixValidationError(Exception):
    """La matriz de distancias no cumple los requisitos mínimos."""
    pass


def validate_matrix(matrix: List[List[int]]) -> None:
    """
    Valida que la matriz de distancias sea correcta antes de pasarla al algoritmo.

    Verifica:
      - No está vacía
      - Es cuadrada (NxN)
      - Ninguna fila tiene longitud incorrecta
      - Los valores son >= 0 o exactamente -1 (ZERO_RESULTS de Google)
      - La diagonal principal es 0 (distancia de un nodo a sí mismo)

    Raises:
        MatrixValidationError: con mensaje descriptivo si algo falla.
    """
    if not matrix:
        raise MatrixValidationError("La matriz está vacía.")

    n = len(matrix)

    for i, row in enumerate(matrix):
        if len(row) != n:
            raise MatrixValidationError(
                f"Fila {i} tiene {len(row)} elementos, se esperaban {n}. "
                f"La matriz debe ser cuadrada ({n}x{n})."
            )

        for j, value in enumerate(row):
            if value < -1:
                raise MatrixValidationError(
                    f"Valor inválido en [{i}][{j}]: {value}. "
                    f"Los únicos valores permitidos son >= 0 o -1 (sin ruta disponible)."
                )

        if row[i] != 0:
            raise MatrixValidationError(
                f"La diagonal principal debe ser 0. "
                f"Se encontró matrix[{i}][{i}] = {row[i]}."
            )

    logger.info("Matriz %dx%d validada correctamente.", n, n)