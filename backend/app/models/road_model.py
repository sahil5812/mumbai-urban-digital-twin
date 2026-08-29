"""
Road Degradation & Pothole Risk AI Model
Predicts road structural health score (0-100%) and failure probability.
"""

import math

def calculate_road_health(
    age_years: float,
    surface_type: str,
    traffic_pcu: float,
    rainfall_mm_hr: float,
    water_depth_cm: float,
    pci_score: float = 70.0,
    drain_distance_m: float = 30.0
) -> dict:
    """
    Computes Road Health Score (0-100%), Failure Risk (0-100%), and Pothole Probability.
    """
    # 1. Base material durability factor
    if "Cement Concrete" in surface_type:
        mat_factor = 0.25
        design_life = 25.0
    elif "Mastic" in surface_type:
        mat_factor = 0.55
        design_life = 12.0
    else:  # Bituminous / Asphalt
        mat_factor = 1.0
        design_life = 6.0

    # 2. Age degradation factor
    age_ratio = min(2.0, age_years / design_life)
    
    # 3. Traffic load stress
    traffic_ratio = min(2.0, traffic_pcu / 80000.0)
    
    # 4. Water submergence & moisture penetration penalty
    water_penalty = (water_depth_cm / 50.0) * 40.0
    if water_depth_cm > 15.0:
        water_penalty += 15.0  # Bitumen stripping acceleration
        
    # 5. Rain exposure intensity
    rain_penalty = min(25.0, (rainfall_mm_hr / 100.0) * 20.0)

    # Raw Health Score Calculation
    raw_health = pci_score - (age_ratio * 15.0 * mat_factor) - (traffic_ratio * 10.0 * mat_factor) - water_penalty - rain_penalty
    health_score = max(5.0, min(100.0, round(raw_health, 1)))

    # Failure Risk & Pothole Probability
    failure_risk_score = max(0.0, min(100.0, round(100.0 - health_score, 1)))
    
    # Sigmoidal Pothole Probability
    z = (failure_risk_score - 50.0) / 15.0
    pothole_prob = round(1.0 / (1.0 + math.exp(-z)), 3)

    if health_score >= 70.0:
        status = "SAFE"
    elif health_score >= 40.0:
        status = "WARNING"
    else:
        status = "CRITICAL"

    return {
        "health_score": health_score,
        "failure_risk_score": failure_risk_score,
        "pothole_probability": pothole_prob,
        "status": status
    }
