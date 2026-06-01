# ADA-MAPS: Genetic Route Optimizer

A full-stack web application designed to solve the Traveling Salesperson Problem (TSP) using a Genetic Algorithm and Google Maps APIs. This project provides an interactive interface to find the most efficient route between multiple destinations.

## Project Overview
ADA-MAPS is a specialized tool that computes optimized routes based on real-world distance data. By combining the power of a custom Genetic Algorithm with Google's Distance Matrix API, the system can determine the optimal sequence of stops for complex itineraries, minimizing total travel distance.

## System Objective
The primary goal of this project is to provide a functional and visually intuitive platform where users can:
- Authenticate securely via Firebase.
- Input multiple geographic destinations.
- Calculate the mathematically optimized route (Open or Closed loop).
- Visualize the resulting path on an interactive map.

## High-Level Architecture
The project follows a decoupled client-server architecture:
- **Frontend**: A React Single Page Application (SPA) that handles user interaction and map visualization.
- **Backend**: A Python-based serverless environment (Google Cloud Functions) that executes the optimization logic.
- **Third-Party Services**: Firebase for authentication and Google Maps Platform for geographic data and maps.

## Technologies Used
### Frontend
- **React + Vite**: UI Framework and build tool.
- **Firebase Authentication**: Secure user management.
- **Google Maps JavaScript API**: Map rendering and marker management.
- **Google Places API**: Location search and autocomplete.
- **Google Directions API**: Drawing the final routes on the map.

### Backend
- **Python**: Core programming language.
- **Google Cloud Functions (Gen 2)**: Serverless execution environment.
- **Google Distance Matrix API**: Obtaining real-world distances between nodes.
- **Genetic Algorithm**: Custom implementation for TSP optimization (Selection, Crossover, Mutation).

## Repository Structure
```text
ADA-MAPS/
├── Backend/    # Python optimization service & Cloud Function logic
├── Frontend/   # React application & Map interface
└── README.md   # Project entry point (this file)
```

## System Flow
1. **User Interaction**: The user logs in and enters multiple destinations in the **Frontend**.
2. **Request**: The Frontend sends a POST request with the locations to the **Cloud Function**.
3. **Distance Matrix**: The Backend calls the **Google Distance Matrix API** to build a cost matrix of all possible paths.
4. **Optimization**: The **Genetic Algorithm** processes the matrix through multiple generations to find the best route.
5. **Response**: The Backend returns the optimized sequence and metrics.
6. **Visualization**: The Frontend receives the result and uses the **Directions API** to render the path on the map.

## Documentation
For detailed setup, configuration, and deployment instructions, please refer to the specific documentation for each component:
- [**Frontend Documentation**](./Frontend/frontend.md)
- [**Backend Documentation**](./Backend/backend.md)

## Getting Started (High Level)
1. **API Keys**: Obtain a Google Maps Platform API Key and a Firebase Project configuration.
2. **Environment**: Setup `.env` files in both `Frontend/` and `Backend/` folders based on their respective documentation.
3. **Local Development**:
   - For Backend: Install dependencies via `uv` or `pip` and run the FastAPI server.
   - For Frontend: Run `npm install` and `npm run dev`.

## Deployment (High Level)
- **Backend**: Deploy to Google Cloud Functions using the `gcloud` CLI.
- **Frontend**: Build the production version and host it on services like Vercel, Firebase Hosting, or Netlify.

## Security Considerations
- **Firebase Authentication**: All optimization endpoints are protected and require a valid Firebase ID Token.
- **API Security**:
  - Implement IP/Referrer restrictions on the Google Cloud Console for the API Keys.
  - Never commit `.env` files or hardcoded credentials to the repository.
- **Environment Variables**: All sensitive data (API Keys, Project IDs) must be managed through environment variables on both local and production environments.

---
Developed as part of the *Analysis of Algorithms* (ADA) course.
