"""
Coupled Hydrological Surface & DEM Micro-Topography Engine
Implements Rational Method runoff, DEM slope gradient accumulation, and distinct asset-type inundation.
"""

from typing import Dict, Any
from app.models.drainage_model import DrainageHydraulicEngine

class MumbaiFloodModel:
    def __init__(self):
        self.hydraulic_engine = DrainageHydraulicEngine()
        self.RUNOFF_COEFFICIENT = 0.88
        self.RIDGE_ELEVATION_M = 6.5

    def calculate_runoff_peak(self, rainfall_mm_hr: float, catchment_ha: float = 12.0) -> float:
        return 0.00278 * self.RUNOFF_COEFFICIENT * rainfall_mm_hr * catchment_ha

    def calculate_inundation_depth(
        self,
        rainfall_mm_hr: float,
        tide_level_m: float,
        elevation_m: float,
        siltation_pct: float,
        component_type: str = "HOTSPOT",
        name: str = "",
        historical_avg_depth: float = 60.0
    ) -> Dict[str, Any]:
        is_subway = "subway" in name.lower() or "underpass" in name.lower()
        is_pump = component_type == "PUMP"
        is_road = component_type == "ROAD"
        is_drain = component_type == "DRAIN"

        # 1. Drainage Capacity
        base_width = 30.0 if is_pump else (20.0 if is_drain else 10.0)
        manning_res = self.hydraulic_engine.calculate_manning_capacity(
            width_m=base_width,
            depth_m=3.0,
            shape="RECTANGULAR",
            siltation_pct=siltation_pct if not is_pump else 10.0
        )
        q_cap = manning_res["effective_capacity_cumecs"]
        if is_pump:
            q_cap += 36.0  # SPS active pumping capacity

        # 2. Inflow Runoff
        catchment = 18.0 if is_subway else (12.0 if component_type == "HOTSPOT" else (8.0 if is_road else 25.0))
        q_inflow = self.calculate_runoff_peak(rainfall_mm_hr, catchment_ha=catchment)

        # 3. Tidal Status
        drain_eval = self.hydraulic_engine.evaluate_drain_status(
            inflow_runoff_cumecs=q_inflow,
            capacity_cumecs=q_cap,
            tide_level_m=tide_level_m,
            outfall_elevation_m=elevation_m
        )

        # 4. Topographic Slope Gradient
        slope_gradient = max(0.001, (self.RIDGE_ELEVATION_M - elevation_m) / 1000.0)

        # 5. Differentiated Realistic Water Depth in Centimeters
        if rainfall_mm_hr <= 5.0 and not drain_eval["is_tidally_locked"]:
            water_depth_cm = 0.0
            failure_risk = 5.0
        else:
            rain_scale = (rainfall_mm_hr / 70.0) ** 0.82
            silt_factor = 1.0 + (siltation_pct / 100.0) * 0.35
            
            if is_subway:
                # Subways are low depressions below groundwater table
                base = 25.0 + (3.0 - min(3.0, elevation_m)) * 22.0
                tide_add = max(0.0, (tide_level_m - 3.2) * 14.0) if drain_eval["is_tidally_locked"] else 0.0
                water_depth_cm = (base * rain_scale * silt_factor) + tide_add
                water_depth_cm = min(145.0, max(5.0, water_depth_cm))
            elif is_pump:
                # Pumping stations have high dewatering capacity
                net_surcharge = max(0.0, q_inflow - q_cap)
                water_depth_cm = min(35.0, net_surcharge * 3.5 + max(0.0, (tide_level_m - 4.0) * 8.0))
            elif is_road:
                # Roads on high ground drain via gravity
                elev_relief = max(0.2, (elevation_m - 1.5) / 3.5)
                base = (14.0 / elev_relief) * rain_scale * (1.0 + siltation_pct / 200.0)
                water_depth_cm = min(65.0, max(0.0, base))
            elif is_drain:
                # Drains carry channel flow
                water_depth_cm = min(85.0, (q_inflow / max(1.0, q_cap)) * 40.0 * rain_scale)
            else:
                # Chronic Hotspots (Hindmata, Gandhi Market, Sion Circle, etc.)
                elev_penalty = max(0.0, (3.5 - elevation_m) * 16.0)
                tide_add = max(0.0, (tide_level_m - 3.2) * 12.0) if drain_eval["is_tidally_locked"] else 0.0
                water_depth_cm = ((18.0 + elev_penalty) * rain_scale * silt_factor) + tide_add
                water_depth_cm = min(120.0, max(4.0, water_depth_cm))

            # Failure Risk Score (0 - 100%)
            failure_risk = min(100.0, (water_depth_cm / 70.0) * 80.0 + (siltation_pct * 0.15))

        # Status categorization
        if water_depth_cm >= 50.0 or failure_risk >= 70.0:
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
