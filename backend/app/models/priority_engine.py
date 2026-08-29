"""
SIH Official Prioritization & Resource Dispatch Engine
Computes: Priority Score = P(Failure) * Impact * PopExposure * TrafficExposure * CostFactor * Urgency
"""

def compute_priority_score(
    failure_prob: float,
    impact_score: float,
    pop_exposure: float,
    traffic_exposure: float,
    cost_factor: float,
    urgency_factor: float
) -> float:
    raw_score = failure_prob * impact_score * pop_exposure * traffic_exposure * cost_factor * urgency_factor
    normalized_score = round(min(100.0, (raw_score / 60.0)), 1)
    return normalized_score

def generate_action_recommendation(component_type: str, name: str, water_depth_cm: float, risk_score: float) -> tuple:
    if component_type == "HOTSPOT" or water_depth_cm > 25.0:
        action_type = "EMERGENCY_DEWATERING_PUMP"
        action_desc = f"Deploy 1000 m³/hr High-Capacity Mobile Dewatering Pump & open flood relief gate at {name}."
        cost = 4.5
        eta = 0.5
    elif component_type == "DRAIN" or risk_score > 70.0:
        action_type = "JET_SUCTION_DESILTING"
        action_desc = f"Dispatch High-Pressure Jet-Suction Desilting Crew to clear choking in {name}."
        cost = 2.8
        eta = 1.0
    elif component_type == "ROAD" and risk_score > 60.0:
        action_type = "COLD_MIX_PATCH_REPAIR"
        action_desc = f"Mobilize BMC Quick-Set Cold-Mix Asphalt Patch Crew to seal pothole formation on {name}."
        cost = 6.2
        eta = 2.0
    else:
        action_type = "SURVEILLANCE_AND_MONITORING"
        action_desc = f"Maintain active IoT sensor surveillance & traffic patrol on {name}."
        cost = 0.5
        eta = 4.0

    return action_type, action_desc, cost, eta

class PriorityDispatchEngine:
    def rank_hotspots(self, components: list) -> list:
        from app.models.schemas import TopPriorityHotspot
        ranked = []
        hotspots = [c for c in components if getattr(c, "component_type", "") == "HOTSPOT" or getattr(c, "water_depth_cm", 0.0) > 15.0]
        hotspots.sort(key=lambda x: (getattr(x, "water_depth_cm", 0.0) * 1.5 + getattr(x, "failure_risk_score", 0.0)), reverse=True)
        
        for idx, h in enumerate(hotspots[:6], 1):
            depth = getattr(h, "water_depth_cm", 0.0)
            risk = getattr(h, "failure_risk_score", 0.0)
            urgency = "CRITICAL" if depth > 50.0 else ("HIGH" if depth > 20.0 else "MEDIUM")
            pop = int(45000 + risk * 850)
            pump_cap = round(max(5.0, (depth / 15.0) * 12.0), 1)
            action = f"Deploy {pump_cap} cumecs Mobile Dewatering Pump & open flood relief gate at {h.name}."
            ranked.append(TopPriorityHotspot(
                rank=idx,
                component_id=h.component_id,
                name=h.name,
                ward=h.ward,
                composite_priority_score=round(min(100.0, risk * 0.95 + 5.0), 1),
                urgency_level=urgency,
                estimated_impacted_citizens=pop,
                recommended_intervention=action,
                required_pump_capacity_cumecs=pump_cap,
                traffic_diverted_route=f"Divert via Western Express Highway Elevated Corridor (Bypass {h.name})"
            ))
        return ranked
