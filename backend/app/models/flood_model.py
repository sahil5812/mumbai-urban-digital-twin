"""
Coupled Hydrological Surface & DEM Micro-Topography Engine
Implements Rational Method runoff, DEM slope gradient accumulation, and inundation depth.
"""

from typing import Dict, Any
from app.models.drainage_model import DrainageHydraulicEngine

class MumbaiFloodModel:
    def __init__(self):
        self.hydraulic_engine = DrainageHydraulicEngine()
        self.RUNOFF_COEFFICIENT = 0.88  # Dense concrete urban imperviousness (C)
        self.RIDGE_ELEVATION_M = 6.5   # Bandra/Worli high ground ridge datum

    def calculate_runoff_peak(self, rainfall_mm_hr: float, catchment_ha: float = 12.0) -> float:
        """
        Rational Hydrological Method: Q = 0.00278 * C * I * A
        Q in m3/s (cumecs), I in mm/hr, A in hectares
        """
        return 0.00278 * self.RUNOFF_COEFFICIENT * rainfall_mm_hr * catchment_ha

    def calculate_inundation_depth(
        self,
        rainfall_mm_hr: float,
        tide_level_m: float,
        elevation_m: float,
        siltation_pct: float,
        is_subway: bool = False,
        base_drain_width_m: float = 12.0
    ) -> Dict[str, Any]:
        # 1. Inflow Runoff
        q_inflow = self.calculate_runoff_peak(rainfall_mm_hr, catchment_ha=15.0 if is_subway else 10.0)

        # 2. Drainage Capacity via Manning's Equation
        manning_res = self.hydraulic_engine.calculate_manning_capacity(
            width_m=base_drain_width_m,
            depth_m=3.0,
            shape="RECTANGULAR",
            siltation_pct=siltation_pct
        )
        q_cap = manning_res["effective_capacity_cumecs"]

        # 3. Hydraulic Balance & Tidal Surcharge
        drain_eval = self.hydraulic_engine.evaluate_drain_status(
            inflow_runoff_cumecs=q_inflow,
            capacity_cumecs=q_cap,
            tide_level_m=tide_level_m,
            outfall_elevation_m=elevation_m
        )

        # 4. Micro-DEM Slope Gradient Factor (Topographic Surcharge Accumulation)
        slope_gradient = max(0.001, (self.RIDGE_ELEVATION_M - elevation_m) / 1000.0)
        slope_accumulation_multiplier = 1.0 + (slope_gradient * 180.0)

        # 5. Exact Water Depth in Centimeters
        if rainfall_mm_hr <= 5.0 and not drain_eval["is_tidally_locked"]:
            water_depth_cm = 0.0
            failure_risk = 5.0
        else:
            base_surge = (q_inflow / max(1.0, q_cap)) * 32.0
            elev_penalty = max(0.0, (3.5 - elevation_m) * 14.0)
            subway_bonus = 35.0 if is_subway else 0.0
            tide_penalty = max(0.0, (tide_level_m - 3.2) * 18.0) if drain_eval["is_tidally_locked"] else 0.0

            raw_depth = (base_surge + elev_penalty + subway_bonus + tide_penalty) * (rainfall_mm_hr / 65.0) ** 0.85
            water_depth_cm = min(140.0, raw_depth * (1.0 + (siltation_pct / 120.0)))
            
            # Failure Risk Score (0 - 100%)
            failure_risk = min(100.0, (water_depth_cm / 70.0) * 80.0 + (siltation_pct * 0.2))

        # Status categorization
        if water_depth_cm >= 60.0 or failure_risk >= 70.0:
            status = "CRITICAL"
        elif water_depth_cm >= 15.0 or failure_risk >= 35.0:
            status = "WARNING"
        else:
            status = "SAFE"

        return {
            "water_depth_cm": round(water_depth_cm, 1),
            "failure_risk_score": round(failure_risk, 1),
            "status": status,
            "q_inflow_cumecs": round(q_inflow, 2),
            "q_capacity_cumecs": round(q_cap, 2),
            "manning_effective_area_m2": manning_res["effective_area_m2"],
            "dem_slope_gradient": round(slope_gradient, 4),
            "tidal_backflow_blocked": drain_eval["is_tidally_locked"]
        }
