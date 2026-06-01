# Backend - ADA-MAPS Route Optimizer

This repository contains the Python-based backend for the ADA-MAPS project. Its primary purpose is to compute optimized routes for multiple destinations using a Genetic Algorithm (GA) and real-world distance data from the Google Maps Platform.

## Overview
The backend is designed to operate as a **Google Cloud Function (Gen 2)**, providing a serverless, scalable endpoint for the frontend. While it includes a FastAPI wrapper for local development, the core logic is optimized for the GCP environment.

## Responsibilities
- **Authentication**: Validates user identity via Firebase ID Tokens.
- **Data Retrieval**: Fetches real-world distances and travel times between all stop combinations using the Google Distance Matrix API.
- **Optimization**: Solves the Traveling Salesperson Problem (TSP) using a custom Genetic Algorithm.
- **API Orchestration**: Coordinates the pipeline from raw input to optimized result.

## Internal Architecture
The project follows a clean, modular architecture:

- `main.py`: The entry point for Google Cloud Functions.
- `app/main.py`: FastAPI wrapper for local development and testing.
- `app/models/`: Pydantic models for request and response validation.
- `app/services/`: Core business logic (Auth, Matrix, GA).
- `app/utils/`: Shared utilities (Logging, Validation).

## Folder & Service Breakdown

### `app/models/`
- `request_models.py`: Defines `OptimizeRequest` (locations and optimization mode).
- `response_models.py`: Defines the structured success and error responses.

### `app/services/`
- **`auth.py`**: Handles Firebase Admin SDK initialization and JWT token verification.
- **`distance_matrix.py`**: Interacts with the Google Maps Distance Matrix API. It builds an $N \times N$ matrix where each cell $[i, j]$ represents the distance from location $i$ to location $j$.
- **`genetic_algorithm.py`**: The core TSP solver. It uses a population-based approach with:
  - **Selection**: Elitism-based selection.
  - **Crossover**: Order Crossover (OX1) to preserve relative ordering.
  - **Mutation**: Swap Mutation to maintain genetic diversity.
- **`optimize_service.py`**: The orchestrator that chains all services together into a single pipeline.

## Execution Flow
1. **Request**: Receives a JSON payload with geographic coordinates.
2. **Validation**: Pydantic validates the schema; a utility checks the location count.
3. **Distance Matrix**: Calls Google API to get real-world distance data.
4. **Genetic Algorithm**: Evolves a population of routes to find the minimum distance path.
5. **Response**: Returns the optimized sequence of indices, total distance, and execution metrics.

## API Specification

### Input Payload (`POST /optimize`)
```json
{
  "locations": [
    { "id": "1", "address": "...", "lat": 4.60, "lng": -74.08 },
    { "id": "2", "address": "...", "lat": 4.65, "lng": -74.10 }
  ],
  "mode": "closed" 
}
```
*Note: `mode` can be `"open"` (start at A, end at last node) or `"closed"` (return to origin).*

### Output Response
```json
{
  "success": true,
  "received_locations": 2,
  "mode": "closed",
  "matrix": [[0, 1200], [1150, 0]],
  "route": [0, 1],
  "distance": 2350,
  "metrics": {
    "matrix_seconds": 0.45,
    "ga_seconds": 0.12,
    "total_seconds": 0.57
  }
}
```

## Environment Variables
Create a `.env` file in the `Backend/` directory:
- `GOOGLE_MAPS_API_KEY`: Your Google Cloud API Key.
- `FIREBASE_CREDENTIALS_PATH`: Path to your Firebase service account JSON.
- `ALLOWED_ORIGINS`: Comma-separated list of allowed domains for CORS.
- `ENV`: Set to `production` or `development`.

## Local Development
This project uses `uv` for lightning-fast dependency management.

1. **Install dependencies**:
   ```bash
   uv sync
   ```
2. **Run the API**:
   ```bash
   uv run fastapi dev app/main.py
   ```

## Deployment to Google Cloud Functions
The primary deployment target is **Cloud Functions Gen 2**.

**Entrypoint**: `optimize_route` (defined in `main.py`).

**Command Example**:
```bash
gcloud functions deploy routeOptimizer \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=. \
  --entry-point=optimize_route \
  --trigger-http \
  --allow-unauthenticated
```
*Note: Although `allow-unauthenticated` is set at the GCP level, the code performs internal token verification via Firebase.*

## Security Features
- **Firebase Auth**: Verifies tokens from the frontend to ensure only registered users can call the optimization logic.
- **IP Restriction**: A whitelist of allowed IPs is hardcoded in `main.py` for an additional layer of access control.
- **CORS Policy**: Restricts requests to specific frontend domains.
- **Environment Management**: API keys and credentials are never stored in the source code.

## Error Handling
- **`OptimizationError`**: Custom exception for logical failures (e.g., no route found).
- **`DistanceMatrixError`**: Specifically for Google API integration failures.
- **HTTP Status Codes**:
  - `400`: Bad Request (invalid input).
  - `401`: Unauthorized (missing/invalid token).
  - `403`: Forbidden (IP blocked).
  - `422`: Unprocessable Entity (validation error).
  - `500`: Internal Server Error.

---
© 2026 ADA-MAPS Backend Team.
