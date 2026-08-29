import os
import time
import numpy as np
from fastapi import APIRouter
from app.models.schemas import SimulationRequest, SimulationResponse, ComponentTelemetry, PriorityIntervention
from app.models.road_model import calculate_road_health
from app.models.drainage_model import calculate_drainage_telemetry
from app.models.graph_engine import MumbaiInfrastructureGraph
from app.models.priority_engine import compute_priority_score, generate_action_recommendation
from app.data.mumbai_data_loader import load_master_infrastructure

try:
    import joblib
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "mumbai_ml_ensemble.joblib")
    ml_bundle = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None
except Exception:
    ml_bundle = None

router = APIRouter(prefix="/api/simulation", tags=["Simulation Engine"])

infra = load_master_infrastructure()
graph_engine = MumbaiInfrastructureGraph()


@router.post("/simulate", response_model=SimulationResponse)
def run_simulation(req: SimulationRequest):
    timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S IST")
    
    # 1. Process Drains
    drain_telemetries = {}
    for d in infra["drains"]:
        res = calculate_drainage_telemetry(
            base_capacity_cumecs=d["capacity_cumecs"],
            siltation_pct=req.siltation_pct,
            rainfall_mm_hr=req.rainfall_mm_hr,
            catchment_sqkm=d["catchment_sqkm"],
            tide_level_m=req.tide_level_m
        )
        act_type, act_desc, cost, eta = generate_action_recommendation(
            "DRAIN", d["name"], 0.0, res["failure_risk_score"]
        )
        drain_telemetries[d["id"]] = ComponentTelemetry(
            component_id=d["id"],
            component_type="DRAIN",
            name=d["name"],
            ward=d["ward"],
            health_score=res["drain_health"],
            failure_risk_score=res["failure_risk_score"],
            status=res["status"],
            latitude=d["lat"],
            longitude=d["lon"],
            elevation_m=d["elev_m"],
            water_depth_cm=0.0,
            pothole_probability=0.05,
            traffic_speed_kmh=0.0,
            traffic_congestion_pct=0.0,
            drain_discharge_capacity_cumecs=res["effective_capacity_cumecs"],
            drain_siltation_pct=req.siltation_pct,
            tidal_backflow_blocked=res["tidal_backflow_blocked"],
            recommended_action=act_desc,
            cascading_impact_summary=f"Discharge: {res['effective_capacity_cumecs']} m³/s | Overflow Ratio: {res['overflow_ratio']}",
            metrics={"overflow_ratio": res["overflow_ratio"], "inflow_runoff": res["inflow_runoff_cumecs"]}
        )

    # 2. Process Hotspots (Powered by Trained ML Model)
    hotspot_telemetries = {}
    for h in infra["hotspots"]:
        is_subway_val = 1 if h.get("is_subway", False) else 0
        pcu_val = float(h.get("traffic_exposure", 8.0) * 350.0)
        
        # Real-time ML Inference
        if ml_bundle is not None:
            feature_vector = np.array([[
                float(req.rainfall_mm_hr),
                float(req.tide_level_m),
                float(h["elev_m"]),
                float(req.siltation_pct),
                float(h.get("dist_outfall_m", 1200.0)),
                float(is_subway_val),
                float(pcu_val)
            ]])
            predicted_depth = float(ml_bundle["flood_model"].predict(feature_vector)[0])
            predicted_pothole = float(ml_bundle["pothole_model"].predict(feature_vector)[0])
            predicted_speed = float(ml_bundle["traffic_model"].predict(feature_vector)[0])
        else:
            # Mathematical Fallback
            predicted_depth = max(0.0, (req.rainfall_mm_hr - 15.0) * 0.45 + (10.0 - h["elev_m"]) * 1.5)
            predicted_pothole = min(0.95, 0.15 + (predicted_depth / 80.0))
            predicted_speed = max(5.0, 52.0 - (predicted_depth * 0.45))

        predicted_depth = round(max(0.0, predicted_depth), 1)
        risk_score = round(min(100.0, (predicted_depth / 45.0) * 100.0), 1)
        health_score = round(max(0.0, 100.0 - risk_score), 1)
        status_val = "CRITICAL" if predicted_depth >= 25.0 else ("WARNING" if predicted_depth >= 10.0 else "SAFE")
        
        act_type, act_desc, cost, eta = generate_action_recommendation(
            "HOTSPOT", h["name"], predicted_depth, risk_score
        )

        hotspot_telemetries[h["id"]] = ComponentTelemetry(
            component_id=h["id"],
            component_type="HOTSPOT",
            name=h["name"],
            ward=h["ward"],
            health_score=health_score,
            failure_risk_score=risk_score,
            status=status_val,
            latitude=h["lat"],
            longitude=h["lon"],
            elevation_m=h["elev_m"],
            water_depth_cm=predicted_depth,
            pothole_probability=round(predicted_pothole, 2),
            traffic_speed_kmh=round(predicted_speed, 1),
            traffic_congestion_pct=round(min(98.0, 20.0 + (predicted_depth * 2.0)), 1),
            drain_discharge_capacity_cumecs=0.0,
            drain_siltation_pct=req.siltation_pct,
            tidal_backflow_blocked=req.tide_level_m > 3.8,
            recommended_action=act_desc,
            cascading_impact_summary=f"ML Inundation: {predicted_depth} cm | Pothole Risk: {int(predicted_pothole*100)}%",
            metrics={"pop_exposure": h.get("pop_exposure", 9.0), "traffic_exposure": h.get("traffic_exposure", 9.0)}
        )

    # 3. Process Roads (Powered by Trained ML Model)
    road_telemetries = {}
    for r in infra["roads"]:
        pcu_val = float(r.get("pcu", 2200))
        
        if ml_bundle is not None:
            feature_vector = np.array([[
                float(req.rainfall_mm_hr),
                float(req.tide_level_m),
                float(r["elev_m"]),
                float(req.siltation_pct),
                float(r.get("dist_outfall_m", 2500.0)),
                0.0,
                float(pcu_val)
            ]])
            water_depth = float(ml_bundle["flood_model"].predict(feature_vector)[0]) * 0.45
            pothole_prob = float(ml_bundle["pothole_model"].predict(feature_vector)[0])
            speed_kmh = float(ml_bundle["traffic_model"].predict(feature_vector)[0])
        else:
            water_depth = max(0.0, (req.rainfall_mm_hr * 0.12) - (r["elev_m"] * 0.8))
            pothole_prob = min(0.90, 0.15 + (water_depth / 60.0))
            speed_kmh = max(6.0, 55.0 - (water_depth * 1.1))

        water_depth = round(max(0.0, water_depth), 1)
        road_risk = round(min(100.0, pothole_prob * 100.0), 1)
        road_health = round(max(5.0, 100.0 - road_risk), 1)
        road_status = "CRITICAL" if road_risk >= 70.0 else ("WARNING" if road_risk >= 40.0 else "SAFE")
        congestion_pct = round(min(99.0, 15.0 + ((55.0 - speed_kmh) / 50.0) * 80.0), 1)

        act_type, act_desc, cost, eta = generate_action_recommendation(
            "ROAD", r["name"], water_depth, road_risk
        )

        road_telemetries[r["id"]] = ComponentTelemetry(
            component_id=r["id"],
            component_type="ROAD",
            name=r["name"],
            ward=r["ward"],
            health_score=road_health,
            failure_risk_score=road_risk,
            status=road_status,
            latitude=r["lat"],
            longitude=r["lon"],
            elevation_m=r["elev_m"],
            water_depth_cm=water_depth,
            pothole_probability=round(pothole_prob, 2),
            traffic_speed_kmh=round(speed_kmh, 1),
            traffic_congestion_pct=congestion_pct,
            drain_discharge_capacity_cumecs=0.0,
            drain_siltation_pct=req.siltation_pct,
            tidal_backflow_blocked=False,
            recommended_action=act_desc,
            cascading_impact_summary=f"ML Speed: {round(speed_kmh, 1)} km/h | Pothole Prob: {int(pothole_prob*100)}%",
            metrics={"pcu": r["pcu"], "surface": r["surface"]}
        )

    all_components = list(hotspot_telemetries.values()) + list(road_telemetries.values()) + list(drain_telemetries.values())

    # 4. Build & Propagate Graph
    nodes_for_graph = [
        {"id": c.component_id, "name": c.name, "type": c.component_type, "ward": c.ward,
         "elevation_m": c.elevation_m, "health_score": c.health_score, "failure_risk_score": c.failure_risk_score,
         "water_depth_cm": c.water_depth_cm, "status": c.status, "latitude": c.latitude, "longitude": c.longitude}
        for c in all_components
    ]
    graph_engine.build_graph(nodes_for_graph, infra["edges"])
    cascade_res = graph_engine.propagate_cascading_failures(failure_threshold_risk=60.0)

    # 5. Compute SIH Priorities
    priorities = []
    for c in all_components:
        if c.component_type in ["HOTSPOT", "ROAD", "DRAIN"]:
            fail_p = c.failure_risk_score / 100.0
            impact = 9.5 if c.component_type == "HOTSPOT" else (8.5 if "Highway" in c.name else 7.0)
            pop = 9.2 if c.ward in ["F/S", "F/N", "L", "K/W", "M/W"] else 6.5
            traffic = 9.5 if c.component_type == "ROAD" and "Expressway" in c.name else 7.5
            cost_factor = 1.2
            urgency = 2.5 if c.water_depth_cm > 20.0 else (1.8 if c.failure_risk_score > 60.0 else 1.0)
            
            p_score = compute_priority_score(fail_p, impact, pop, traffic, cost_factor, urgency)
            act_type, act_desc, cost, eta = generate_action_recommendation(c.component_type, c.name, c.water_depth_cm, c.failure_risk_score)
            
            priorities.append({
                "component_id": c.component_id,
                "component_name": c.name,
                "component_type": c.component_type,
                "ward": c.ward,
                "failure_probability": fail_p,
                "impact_score": impact,
                "population_exposure": pop,
                "traffic_exposure": traffic,
                "cost_factor": cost_factor,
                "urgency_factor": urgency,
                "priority_score": p_score,
                "action_type": act_type,
                "action_description": act_desc,
                "estimated_cost_inr_lakhs": cost,
                "estimated_resolution_time_hrs": eta
            })

    priorities.sort(key=lambda x: x["priority_score"], reverse=True)
    top_priorities = []
    for idx, p in enumerate(priorities[:10], 1):
        top_priorities.append(PriorityIntervention(rank=idx, **p))

    crit_hotspots = sum(1 for c in hotspot_telemetries.values() if c.status == "CRITICAL")
    risk_roads = sum(1 for c in road_telemetries.values() if c.status in ["WARNING", "CRITICAL"])
    overflow_drains = sum(1 for c in drain_telemetries.values() if c.status == "CRITICAL")
    avg_speed = sum(c.traffic_speed_kmh for c in road_telemetries.values()) / max(1, len(road_telemetries))
    disruption_idx = round(min(100.0, (1.0 - (avg_speed / 55.0)) * 100.0), 1)

    return SimulationResponse(
        simulation_id=f"SIM_MUM_{int(time.time())}",
        timestamp=timestamp_str,
        parameters=req,
        city_summary={
            "overall_infrastructure_health": round(sum(c.health_score for c in all_components) / len(all_components), 1),
            "disruption_severity": "HIGH / RED ALERT" if disruption_idx > 60.0 else ("MODERATE / AMBER" if disruption_idx > 30.0 else "NORMAL"),
            "high_tide_warning": req.tide_level_m >= 4.2,
            "average_traffic_speed_kmh": round(avg_speed, 1),
            "max_water_depth_cm": max(c.water_depth_cm for c in all_components)
        },
        critical_hotspots_count=crit_hotspots,
        roads_at_risk_count=risk_roads,
        drains_overflowing_count=overflow_drains,
        traffic_disruption_index=disruption_idx,
        components=all_components,
        top_priorities=top_priorities,
        cascade_summary=cascade_res
    )
