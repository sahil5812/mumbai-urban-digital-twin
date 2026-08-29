"""
Manning's Open-Channel & Pipe Flow Hydraulic Engine
Calculates true hydraulic capacity, siltation reduction, and backpressure surcharge.
"""

import math
from typing import Dict, Any

class DrainageHydraulicEngine:
    """
    Implements MoHUA / CPHEEO Storm Water Drainage Standard:
    Manning's Equation: Q = (1/n) * A * R_h^(2/3) * S^(1/2) * (1 - siltation_pct/100)
    """
    def __init__(self, default_manning_n: float = 0.015, default_slope: float = 0.002):
        self.default_n = default_manning_n  # Roughness: 0.015 for concrete barrel/box drains
        self.default_slope = default_slope  # Longitudinal gravity slope: 1 in 500 = 0.002

    def calculate_manning_capacity(
        self,
        width_m: float,
        depth_m: float,
        shape: str = "RECTANGULAR",
        manning_n: float = None,
        slope: float = None,
        siltation_pct: float = 0.0
    ) -> Dict[str, float]:
        n = manning_n or self.default_n
        s = slope or self.default_slope

        # Adjust effective depth for silt accumulation
        silt_depth = depth_m * (siltation_pct / 100.0)
        effective_depth = max(0.1, depth_m - silt_depth)

        if shape == "RECTANGULAR":
            area = width_m * effective_depth
            wetted_perimeter = width_m + 2.0 * effective_depth
        elif shape == "CIRCULAR":
            diameter = width_m
            area = (math.pi * (diameter ** 2)) / 4.0 * (1.0 - siltation_pct / 100.0)
            wetted_perimeter = math.pi * diameter
        else:
            area = width_m * effective_depth
            wetted_perimeter = width_m + 2.0 * effective_depth

        hydraulic_radius = area / max(0.1, wetted_perimeter)
        
        # Manning's Open-Channel Discharge Formulation
        q_theoretical_cumecs = (1.0 / n) * area * (hydraulic_radius ** (2.0 / 3.0)) * (s ** 0.5)
        
        # Effective discharge after silt drag penalty
        q_effective_cumecs = q_theoretical_cumecs * (1.0 - (siltation_pct / 100.0) * 0.4)

        return {
            "effective_area_m2": round(area, 2),
            "hydraulic_radius_m": round(hydraulic_radius, 2),
            "theoretical_capacity_cumecs": round(q_theoretical_cumecs, 2),
            "effective_capacity_cumecs": round(max(0.5, q_effective_cumecs), 2),
            "silt_loss_pct": round(siltation_pct, 1)
        }

    def evaluate_drain_status(
        self,
        inflow_runoff_cumecs: float,
        capacity_cumecs: float,
        tide_level_m: float,
        outfall_elevation_m: float = 1.5
    ) -> Dict[str, Any]:
        # Tidal Backflow Lock condition
        is_tidally_locked = tide_level_m >= 3.5 and (tide_level_m > outfall_elevation_m)
        
        usable_capacity = capacity_cumecs
        if is_tidally_locked:
            # Flap gate locks or backpressure limits discharge to 15%
            usable_capacity = capacity_cumecs * 0.15

        overflow_ratio = inflow_runoff_cumecs / max(0.1, usable_capacity)
        surcharge_cumecs = max(0.0, inflow_runoff_cumecs - usable_capacity)

        if overflow_ratio >= 1.2 or is_tidally_locked:
            status = "CRITICAL"
        elif overflow_ratio >= 0.75:
            status = "WARNING"
        else:
            status = "SAFE"

        return {
            "inflow_cumecs": round(inflow_runoff_cumecs, 2),
            "usable_capacity_cumecs": round(usable_capacity, 2),
            "overflow_ratio": round(overflow_ratio, 2),
            "surcharge_cumecs": round(surcharge_cumecs, 2),
            "is_tidally_locked": is_tidally_locked,
            "status": status
        }
