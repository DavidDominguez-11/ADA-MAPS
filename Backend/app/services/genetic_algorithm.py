import random
from typing import List


# ---------------------------------------------------------------------------
# FITNESS
# ---------------------------------------------------------------------------

def calculate_fitness(route: List[int], matrix: List[List[int]], mode: str) -> int:
    """
    Calcula la distancia total de una ruta.

    Args:
        route:  Lista de índices, e.g. [0, 2, 1]
        matrix: Matriz NxN de distancias en metros.
        mode:   "closed" → regresa al origen | "open" → termina en último nodo.

    Returns:
        Distancia total en metros. Retorna float("inf") si algún tramo es -1
        (sin ruta disponible), para que nunca sea seleccionada.
    """
    total = 0

    for i in range(len(route) - 1):
        d = matrix[route[i]][route[i + 1]]
        if d == -1:
            return float("inf")
        total += d

    if mode == "closed":
        d = matrix[route[-1]][route[0]]
        if d == -1:
            return float("inf")
        total += d

    return total


# ---------------------------------------------------------------------------
# POBLACIÓN INICIAL
# ---------------------------------------------------------------------------

def create_population(population_size: int, num_locations: int) -> List[List[int]]:
    """
    Genera una población inicial de rutas aleatorias.
    Cada ruta es una permutación de [0, 1, ..., num_locations-1].
    """
    population = []

    for _ in range(population_size):
        route = list(range(num_locations))
        random.shuffle(route)
        population.append(route)

    return population


# ---------------------------------------------------------------------------
# SELECCIÓN
# ---------------------------------------------------------------------------

def selection(
    population: List[List[int]],
    matrix: List[List[int]],
    mode: str,
    elite_size: int = 10,
) -> List[List[int]]:
    """
    Ordena la población por fitness y retorna las mejores rutas (élite).
    """
    ranked = sorted(
        population,
        key=lambda route: calculate_fitness(route, matrix, mode),
    )
    return ranked[:elite_size]


# ---------------------------------------------------------------------------
# CROSSOVER — Order Crossover (OX1)
# ---------------------------------------------------------------------------

def crossover(parent1: List[int], parent2: List[int]) -> List[int]:
    """
    Order Crossover (OX1): preserva el orden relativo de los genes.

    Toma un segmento de parent1 y rellena el resto con el orden de parent2.
    Garantiza que el hijo:
      - No repite nodos
      - No pierde nodos
    """
    n = len(parent1)
    start = random.randint(0, n - 2)
    end = random.randint(start + 1, n)

    child = [-1] * n
    child[start:end] = parent1[start:end]

    segment_set = set(child[start:end])
    remaining = [gene for gene in parent2 if gene not in segment_set]

    pointer = 0
    for i in range(n):
        if child[i] == -1:
            child[i] = remaining[pointer]
            pointer += 1

    return child


# ---------------------------------------------------------------------------
# MUTACIÓN — Swap mutation
# ---------------------------------------------------------------------------

def mutate(route: List[int], mutation_rate: float = 0.15) -> List[int]:
    """
    Swap mutation: intercambia dos posiciones aleatorias con probabilidad mutation_rate.
    Opera sobre una copia para no modificar el original.
    """
    mutated = route[:]

    if random.random() < mutation_rate:
        i, j = random.sample(range(len(route)), 2)
        mutated[i], mutated[j] = mutated[j], mutated[i]

    return mutated


# ---------------------------------------------------------------------------
# LOOP PRINCIPAL
# ---------------------------------------------------------------------------

def run_genetic_algorithm(
    matrix: List[List[int]],
    mode: str,
    generations: int = 200,
    population_size: int = 100,
    elite_size: int = 10,
    mutation_rate: float = 0.15,
) -> dict:
    """
    Ejecuta el algoritmo genético y retorna la mejor ruta encontrada.

    Args:
        matrix:          Matriz NxN de distancias.
        mode:            "open" o "closed".
        generations:     Número de generaciones a evolucionar.
        population_size: Tamaño de cada generación.
        elite_size:      Cuántos individuos pasan directo a la siguiente gen.
        mutation_rate:   Probabilidad de mutación por individuo.

    Returns:
        {"route": [...], "distance": int}
    """
    n = len(matrix)

    if n < 2:
        raise ValueError(f"Se necesitan al menos 2 nodos. Se recibieron: {n}")

    # Caso trivial — no hay nada que optimizar
    if n == 2:
        route = [0, 1]
        return {"route": route, "distance": calculate_fitness(route, matrix, mode)}

    population = create_population(population_size, n)

    for _ in range(generations):
        elite = selection(population, matrix, mode, elite_size)

        next_generation = [route[:] for route in elite]  # élite pasa intacta

        while len(next_generation) < population_size:
            parent1, parent2 = random.sample(elite, 2)
            child = crossover(parent1, parent2)
            child = mutate(child, mutation_rate)
            next_generation.append(child)

        population = next_generation

    best_route = min(
        population,
        key=lambda route: calculate_fitness(route, matrix, mode),
    )
    best_distance = calculate_fitness(best_route, matrix, mode)

    return {
        "route": best_route,
        "distance": best_distance,
    }


# ---------------------------------------------------------------------------
# TEST AISLADO — corre con: python -m app.services.genetic_algorithm
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    # Matriz asimétrica de 4 nodos (simula distancias reales de carretera)
    fake_matrix = [
        [0,    1200, 5400, 8100],
        [1100, 0,    3200, 6700],
        [5200, 3100, 0,    2900],
        [8000, 6500, 2800, 0   ],
    ]

    print("=== TEST: mode=closed ===")
    result = run_genetic_algorithm(fake_matrix, mode="closed", generations=200)
    print(f"Ruta:      {result['route']}")
    print(f"Distancia: {result['distance']} m")

    # Verificaciones básicas
    route = result["route"]
    n = len(fake_matrix)
    assert len(route) == n,          f"FAIL: ruta tiene {len(route)} nodos, esperaba {n}"
    assert len(set(route)) == n,     f"FAIL: ruta tiene nodos duplicados: {route}"
    assert set(route) == set(range(n)), f"FAIL: ruta tiene nodos inválidos: {route}"

    print("\n=== TEST: mode=open ===")
    result_open = run_genetic_algorithm(fake_matrix, mode="open", generations=200)
    print(f"Ruta:      {result_open['route']}")
    print(f"Distancia: {result_open['distance']} m")

    print("\n✅ Todos los tests pasaron.")