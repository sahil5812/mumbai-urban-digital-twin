"""
Drainage Hydraulic & Tidal Backflow Model
Calculates stormwater discharge capacity, siltation overflow risk, and tidal lockout.
"""

def calculate_drainage_telemetry(
    base_capacity_cumecs: float,
    siltation_pct: float,
    rainfall_mm_hr: float,
    catchment_sqkm: float,
    tide_level_m: float,
    outfall_crest_m: float = 3.8
) -> dict:
    """
    Computes effective discharge capacity and tidal backpressure status.
    """
    # 1. Effective capacity reduction due to siltation & debris
    silt_reduction = min(0.85, (siltation_pct / 100.0) * 0.9)
    effective_capacity = base_capacity_cumecs * (1.0 - silt_reduction)

    # 2. Arabian Sea Tidal Lockout Check
    # When High Tide > Outfall Crest Height (typically ~3.8m above Town Hall Datum),
    # flap gates close to prevent seawater intrusion, reducing gravity discharge to near 0!
    tidal_backflow_blocked = False
    tidal_penalty = 1.0

    if tide_level_m >= outfall_crest_m:
        tidal_backflow_blocked = True
        lockout_depth = tide_level_m - outfall_crest_m
        tidal_penalty = max(0.15, 1.0 - (lockout_depth * 0.55))
        effective_capacity *= tidal_penalty

    effective_capacity = round(max(0.5, effective_capacity), 1)

    # 3. Peak runoff inflow estimation (Rational formula: Q = C * I * A / 3.6)
    runoff_coeff = 0.82  # Urban paved Mumbai surface
    inflow_runoff_cumecs = (runoff_coeff * rainfall_mm_hr * catchment_sqkm) / 3.6

    # 4. Overflow & Health Score
    overflow_ratio = inflow_runoff_cumecs / max(0.1, effective_capacity)
    
    if overflow_ratio <= 0.6:
        drain_health = max(75.0, 100.0 - (siltation_pct * 0.4))
        status = "SAFE"
    elif overflow_ratio <= 1.0:
        drain_health = max(45.0, 75.0 - (overflow_ratio * 25.0))
        status = "WARNING"
    else:
        drain_health = max(10.0, 45.0 - (min(3.0, overflow_ratio) * 12.0))
        status = "CRITICAL"

    failure_risk = round(100.0 - drain_health, 1)

    return {
        "effective_capacity_cumecs": effective_capacity,
        "inflow_runoff_cumecs": round(inflow_runoff_cumecs, 1),
        "overflow_ratio": round(overflow_ratio, 2),
        "tidal_backflow_blocked": tidal_backflow_blocked,
        "drain_health": round(drain_health, 1),
        "failure_risk_score": failure_risk,
        "status": status
    }
