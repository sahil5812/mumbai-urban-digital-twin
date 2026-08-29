"""
SIH Official Prioritization & Resource Dispatch Engine
Computes: Priority Score = P(Failure) * Impact * PopExposure * TrafficExposure * CostFactor * Urgency
"""

def compute_priority_score(
    failure_prob: float,      # 0.0 to 1.0
    impact_score: float,      # 1.0 to 10.0 (arterial significance)
    pop_exposure: float,      # 1.0 to 10.0 (ward population density)
    traffic_exposure: float,  # 1.0 to 10.0 (PCU load)
    cost_factor: float,       # 0.5 to 2.0 (cost-benefit ratio)
    urgency_factor: float     # 1.0 to 3.0 (water submergence urgency)
) -> float:
    """
    Computes normalized SIH priority score on a 0-100 scale.
    """
    raw_score = failure_prob * impact_score * pop_exposure * traffic_exposure * cost_factor * urgency_factor
    normalized_score = round(min(100.0, (raw_score / 60.0)), 1)
    return normalized_score

def generate_action_recommendation(component_type: str, name: str, water_depth_cm: float, risk_score: float) -> tuple:
    """
    Returns (action_type, action_description, cost_lakhs, eta_hrs)
    """
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
