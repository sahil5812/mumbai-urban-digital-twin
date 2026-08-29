from app.models.dem_flow_engine import DEM2DSurfaceFlowEngine
from fastapi import APIRouter
from app.models.schemas import SimulationRequest, SimulationResponse, ComponentTelemetry, CitySummary, TopPriorityHotspot, TimelineForecastStep
from app.models.flood_model import MumbaiFloodModel
from app.models.road_model import MumbaiRoadModel
from app.models.drainage_model import DrainageHydraulicEngine
from app.models.priority_engine import PriorityDispatchEngine
from app.data.mumbai_data_loader import load_master_infrastructure
import math
import numpy as np

router = APIRouter(prefix="/api/simulation", tags=["Simulation Engine"])

flood_model = MumbaiFloodModel()
road_model = MumbaiRoadModel()
drainage_engine = DrainageHydraulicEngine()
priority_engine = PriorityDispatchEngine()
infra_data = load_master_infrastructure()
dem_engine = DEM2DSurfaceFlowEngine()


def compute_component_state(node: dict, rain_mm: float, tide_m: float, silt_pct: float) -> ComponentTelemetry:
    c_type = node.get("type", "HOTSPOT")
    elev = node.get("elevation_m", 2.0)
    is_subway = "subway" in node.get("name", "").lower() or c_type == "HOTSPOT"

    flood_res = flood_model.calculate_inundation_depth(
        rainfall_mm_hr=rain_mm,
        tide_level_m=tide_m,
        elevation_m=elev,
        siltation_pct=silt_pct,
        is_subway=is_subway
    )

    depth = flood_res["water_depth_cm"]
    risk = flood_res["failure_risk_score"]
    status = flood_res["status"]
    health = max(0.0, 100.0 - risk)

    # Road degradation
    road_eval = road_model.calculate_pothole_risk(rain_mm, depth, 70.0, 24.0)
    pothole_prob = road_eval["pothole_probability"]
    speed = max(4.0, 45.0 * (1.0 - (depth / 85.0)))
    congestion = min(100.0, (depth / 60.0) * 100.0)

    rec_action = f"Deploy dewatering pumps & open relief gates at {node['name']}." if depth > 20 else "Standard storm surveillance."
    cascading_summary = f"Inundation: {depth:.1f} cm | Risk: {risk:.0f}% | Traffic: {speed:.1f} km/h"

    return ComponentTelemetry(
        component_id=node["id"],
        component_type=c_type,
        name=node["name"],
        ward=node.get("ward", "F/S"),
        health_score=round(health, 1),
        failure_risk_score=round(risk, 1),
        status=status,
        latitude=node.get("latitude", 19.07),
        longitude=node.get("longitude", 72.85),
        elevation_m=elev,
        water_depth_cm=depth,
        pothole_probability=round(pothole_prob, 2),
        traffic_speed_kmh=round(speed, 1),
        traffic_congestion_pct=round(congestion, 1),
        drain_discharge_capacity_cumecs=flood_res["q_capacity_cumecs"],
        drain_siltation_pct=silt_pct,
        tidal_backflow_blocked=flood_res["tidal_backflow_blocked"],
        recommended_action=rec_action,
        cascading_impact_summary=cascading_summary,
        metrics={"inflow_cumecs": flood_res["q_inflow_cumecs"], "dem_slope": flood_res["dem_slope_gradient"]}
    )

@router.post("/simulate", response_model=SimulationResponse)
def run_simulation(req: SimulationRequest):
    all_nodes = infra_data["hotspots"] + infra_data["roads"] + infra_data["drains"] + infra_data["pumping_stations"]

    # 1. Base Active Step (T+0)
    active_components = [compute_component_state(n, req.rainfall_mm_hr, req.tide_level_m, req.siltation_pct) for n in all_nodes]

    # 2. 0-3 Hour Multi-Timestep Discrete Forecast Timeline
    # Slots: T+0 (Now), T+15m, T+30m, T+60m, T+120m, T+180m
    timeline_slots = [
        ("+0m (Now)", 0, 1.0),
        ("+15m", 15, 1.15 if req.rainfall_mm_hr > 0 else 1.0),
        ("+30m", 30, 1.35 if req.rainfall_mm_hr > 0 else 1.0),
        ("+60m", 60, 1.55 if req.rainfall_mm_hr > 0 else 1.0),
        ("+120m", 120, 1.25 if req.rainfall_mm_hr > 0 else 1.0),
        ("+180m", 180, 0.85 if req.rainfall_mm_hr > 0 else 1.0)
    ]

    timeline_forecast = []
    for label, mins, rain_mult in timeline_slots:
        step_rain = req.rainfall_mm_hr * rain_mult
        step_tide = req.tide_level_m + (0.15 * math.sin(mins / 30.0))
        step_comps = [compute_component_state(n, step_rain, step_tide, req.siltation_pct) for n in all_nodes]
        max_d = max([c.water_depth_cm for c in step_comps]) if step_comps else 0.0
        crit_count = len([c for c in step_comps if c.status == "CRITICAL"])

        timeline_forecast.append(TimelineForecastStep(
            time_offset=label,
            time_minutes=mins,
            predicted_rainfall_mm_hr=round(step_rain, 1),
            city_max_depth_cm=round(max_d, 1),
            critical_hotspots_count=crit_count,
            components=step_comps
        ))

    # City Summary
    avg_risk = sum([c.failure_risk_score for c in active_components]) / max(1, len(active_components))
    crit_hotspots = len([c for c in active_components if c.status == "CRITICAL" and c.component_type == "HOTSPOT"])
    crit_roads = len([c for c in active_components if c.status == "CRITICAL" and c.component_type == "ROAD"])
    crit_drains = len([c for c in active_components if c.status == "CRITICAL" and c.component_type == "DRAIN"])
    avg_depth = sum([c.water_depth_cm for c in active_components]) / max(1, len(active_components))

    severity = "CRITICAL" if crit_hotspots >= 3 else ("WARNING" if crit_hotspots >= 1 else "NORMAL")

    summary = CitySummary(
        overall_infrastructure_health=round(100.0 - avg_risk, 1),
        average_failure_risk=round(avg_risk, 1),
        active_submerged_hotspots=crit_hotspots,
        roads_critical_count=crit_roads,
        drains_overloaded_count=crit_drains,
        pumping_stations_active=6,
        citywide_avg_water_depth_cm=round(avg_depth, 1),
        high_tide_warning=req.tide_level_m >= 3.5,
        disruption_severity=severity
    )

    priorities = priority_engine.rank_hotspots(active_components)

    return SimulationResponse(
        city_summary=summary,
        components=active_components,
        top_priorities=priorities,
        timeline_forecast=timeline_forecast,
        simulation_metadata={
            "engine": "Physics-Informed Manning Runoff & Scikit-Learn ML Ensemble",
            "active_scenario": req.active_scenario_name,
            "timesteps_generated": len(timeline_forecast)
        }
    )

@router.get("/dem-surface-grid")
def get_dem_surface_grid(rainfall_mm_hr: float = 45.0, tide_level_m: float = 2.8):
    return dem_engine.route_2d_surface_rainfall(rainfall_mm_hr, tide_level_m)
