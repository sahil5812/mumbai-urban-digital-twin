"""
Integrated Flood & Water Accumulation Model
Predicts water depth (cm) in Mumbai's topographical bowls (Hindmata, Milan Subway, Kurla, etc.)
"""

def calculate_water_accumulation(
    spot_elevation_m: float,
    rainfall_mm_hr: float,
    tide_level_m: float,
    drain_overflow_ratio: float,
    is_subway_or_depression: bool = False
) -> dict:
    """
    Computes water accumulation depth in cm based on excess runoff and terrain.
    """
    # 1. Base excess runoff (Mumbai stormwater capacity typically handles ~25-30 mm/hr)
    if rainfall_mm_hr <= 25.0:
        base_depth = rainfall_mm_hr * 0.08
    else:
        base_depth = 2.0 + ((rainfall_mm_hr - 25.0) * 0.22)

    # 2. Topographical elevation factor (relative to 3.5m baseline)
    elev_diff = max(-2.0, 3.5 - spot_elevation_m)
    elev_factor = max(0.4, 1.0 + (elev_diff * 0.35))
    
    # 3. Subway depression multiplier
    if is_subway_or_depression:
        elev_factor *= 1.35

    # 4. Drainage bottleneck overflow multiplier
    drain_factor = max(0.6, 0.4 + (drain_overflow_ratio * 0.6))

    # 5. High Tide surge backwater effect (Arabian Sea tidal lock above 4.0m)
    tide_boost = 0.0
    if tide_level_m > 4.0:
        tide_boost = (tide_level_m - 4.0) * 16.0

    raw_depth = (base_depth * elev_factor * drain_factor) + tide_boost
    water_depth_cm = round(max(0.0, min(140.0, raw_depth)), 1)

    if water_depth_cm < 10.0:
        severity = "SAFE"
    elif water_depth_cm < 25.0:
        severity = "WARNING"
    else:
        severity = "CRITICAL"

    return {
        "water_depth_cm": water_depth_cm,
        "flood_severity": severity
    }
