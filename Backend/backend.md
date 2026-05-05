# Backend - Route Optimizer

## Overview
Python-based backend deployed as a Google Cloud Function. It computes optimized routes using a Genetic Algorithm and Google Distance Matrix API.

## Features
- Distance matrix calculation
- Route optimization (TSP)
- REST API endpoint

## Tech Stack
- Python 3.11+
- UV package manager
- Google Cloud Functions

## Endpoint
POST /optimize-route

## Setup
1. Install dependencies: uv sync
2. Configure .env
3. Run locally: uv run main.py

## Deployment
gcloud functions deploy routeOptimizer --runtime python311 --trigger-http

## License
MIT
