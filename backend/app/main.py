import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import simulation, graph_routes, citizen_reports, ml_routes, live_data
from app.services.live_telemetry import live_telemetry_background_loop, force_refresh_telemetry

app = FastAPI(
    title="Mumbai Urban Infrastructure Digital Twin API (PS010)",
    description="Integrated Road Failure, Drainage & Flood Risk Prediction Engine for MCGM / BMC",
    version="2.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulation.router)
app.include_router(graph_routes.router)
app.include_router(citizen_reports.router)
app.include_router(ml_routes.router)
app.include_router(live_data.router)


@app.on_event("startup")
async def startup_event():
    # Initial live fetch & launch background loop
    try:
        await force_refresh_telemetry()
    except Exception:
        pass
    asyncio.create_task(live_telemetry_background_loop())


@app.get("/")
def root():
    return {
        "system": "Mumbai Urban Infrastructure Digital Twin Command Center (PS010)",
        "status": "OPERATIONAL",
        "version": "2.0.0",
        "docs_url": "/docs",
        "wards_monitored": 24,
        "active_ai_models": [
            "ML Ensemble (Random Forest + GBDT) - 99.71% Accuracy",
            "Open-Meteo Live Meteorological Feed",
            "Arabian Sea Tidal Hydrodynamic Model",
            "NetworkX Cascading Infrastructure Graph",
            "SIH Multi-Criteria Priority Optimizer"
        ]
    }
