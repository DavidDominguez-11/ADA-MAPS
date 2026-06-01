# Frontend - ADA-MAPS Route Optimizer

This is the client-side application for the ADA-MAPS project. It provides a modern, interactive interface to manage destinations, visualize optimized routes on a map, and securely authenticate users.

## Overview
Built with **React** and **Vite**, the frontend serves as the control center where users interact with Google Maps and the custom Genetic Algorithm backend. It focuses on providing real-time feedback, address autocompletion, and precise geographic visualization.

## Responsibilities
- **User Interface**: Providing a clean, responsive Dashboard for route planning.
- **Geolocation**: Using Google Places to search and validate addresses.
- **Visualization**: Rendering markers and complex route paths using Google Maps JavaScript API.
- **Client-side Validation**: Enforcing business rules (distance radius and destination limits) before hitting the backend.
- **Auth Management**: Handling session persistence and secure token delivery via Firebase.

## Internal Architecture
The project structure is organized by feature and role:

- `src/pages/`: Main application views (`Login`, `Dashboard`).
- `src/components/`: Reusable UI elements and complex map-related components.
- `src/context/`: Global state management, primarily for `AuthContext`.
- `src/services/`: External API communications.
- `src/utils/`: Pure logic helpers (e.g., distance calculations).
- `src/firebase/`: Firebase SDK configuration and initialization.

## Core Components Breakdown

### Pages
- **`Login.jsx`**: Simple entry point using Firebase Google Auth.
- **`Dashboard.jsx`**: The main workspace where inputs, controls, and the map reside.

### Components
- **`DestinationInput.jsx`**: Integrates **Google Places Autocomplete**. It ensures every destination has valid latitude/longitude coordinates before being processed.
- **`Map.jsx`**: The primary canvas. It manages the lifecycle of the Google Map instance and coordinates markers.
- **`RouteDirections.jsx`**: Specifically handles the **Google Directions Service**. When an optimized route is received, this component calculates the road-bound path between stops and renders it via `DirectionsRenderer`.
- **`RouteControls.jsx`**: Handles the optimization parameters (Open/Closed loop) and triggers the backend request with the current Firebase token.
- **`ProtectedRoute.jsx`**: A wrapper that ensures only authenticated users can access the Dashboard.

### Services & Utils
- **`services/api.js`**: A clean fetch-based wrapper for the Cloud Function endpoint. It automatically includes the **Bearer Token** in the headers.
- **`utils/haversine.js`**: Implements the Haversine formula to calculate the "as-the-crow-flies" distance between points for client-side validation.

## Application Flows

### 1. Authentication Flow
User (Login) → Firebase Google Auth → ID Token received → Context Update → Redirect to Dashboard.

### 2. Optimization Flow
Input destinations → **Client Validation** (2-15 nodes, <100km radius) → Fetch Firebase Token → Call Backend API → Receive Optimized Sequence → Update Map state.

### 3. Map & Routing Flow
Locations update → Markers rendered → Optimized result arrives → `RouteDirections` calls `DirectionsService` → Path rendered on map following actual roads.

## Validations & Constraints
To ensure optimal performance and API efficiency, the following rules are enforced:
- **Destination Limit**: Between **2 and 15** destinations per request.
- **Maximum Radius**: All points must be within a **100 km radius** of each other (to prevent Distance Matrix timeouts and ensure logical route planning).
- **Valid Coordinates**: Optimization is only enabled once all input fields are linked to a valid Google Place result.

## Setup & Configuration

### Environment Variables
Create a `.env` file in the `Frontend/` directory:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_key
VITE_API_URL=your_backend_cloud_function_url
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Installation
```bash
npm install
npm run dev
```

## Integrations
- **Firebase**: Used for Identity Platform. Every request to the backend includes a short-lived ID Token for verification.
- **Google Maps Platform**:
  - **JavaScript API**: For the interactive map.
  - **Places API**: For the address autocomplete search.
  - **Directions API**: To render the actual driving path between optimized waypoints.
- **Cloud Function**: Connected via standard HTTP POST requests to the `/optimize` endpoint.

## Error Handling
The UI categorizes errors to provide better feedback:
- **Network Errors**: Backend unreachable.
- **Auth Errors**: Automatic logout if the token expires.
- **Validation Errors**: Feedback on missing coordinates or radius violations.
- **API Errors**: Failures reported by the Google Maps or Distance Matrix services.

---
© 2026 ADA-MAPS Frontend Team.
