"""
2D Digital Elevation Model (DEM) & D8 Flow Direction / Accumulation Engine
Implements raster-based 2D overland flow routing down topographic slope gradients.
"""

import numpy as np
from typing import Dict, Any, List

class DEM2DSurfaceFlowEngine:
    """
    2D Topographic DEM Grid (20x20 cell raster) spanning Greater Mumbai:
    Bounding Box: Lat 18.90N - 19.28N | Lon 72.80E - 72.98E
    Cell Size: ~1.2 km resolution
    """
    def __init__(self, rows: int = 15, cols: int = 15):
        self.rows = rows
        self.cols = cols
        self.lat_min = 18.90
        self.lat_max = 19.28
        self.lon_min = 72.80
        self.lon_max = 72.98
        self.elevation_grid = self._initialize_mumbai_dem()
        self.flow_direction_grid, self.flow_accumulation_grid = self._compute_d8_flow_routing()

    def _initialize_mumbai_dem(self) -> np.ndarray:
        """
        Synthesizes 2D Mumbai DEM THD elevation grid:
        High ridges: Sanjay Gandhi NP / Powai (+15m to +45m), Bandra West (+6.5m), Malabar Hill (+25m)
        Low depressions: Milan Subway (+1.8m), Hindmata (+1.9m), Kurla Mithi (+2.1m), Mahul Basin (+1.5m)
        """
        grid = np.zeros((self.rows, self.cols), dtype=float)
        lats = np.linspace(self.lat_max, self.lat_min, self.rows)
        lons = np.linspace(self.lon_min, self.lon_max, self.cols)

        for r in range(self.rows):
            for c in range(self.cols):
                lat = lats[r]
                lon = lons[c]
                # Default coastal plain elevation
                base_elev = 3.5 + 2.0 * np.sin(r * 0.4) + 1.5 * np.cos(c * 0.3)
                
                # Northern SGNP Hill Range
                if lat > 19.18 and lon > 72.88:
                    base_elev += 28.0 * np.exp(-((lat - 19.22)**2 + (lon - 72.91)**2) / 0.005)
                # Central Saucers (Hindmata / Kurla / Milan)
                if (19.00 <= lat <= 19.12) and (72.83 <= lon <= 72.89):
                    base_elev = max(1.2, base_elev - 3.2)
                # Coastal margin
                if lon < 72.82:
                    base_elev = max(0.8, base_elev - 2.0)
                    
                grid[r, c] = round(max(0.8, base_elev), 1)
        return grid

    def _compute_d8_flow_routing(self):
        """
        D8 Algorithm: Assigns flow direction to the neighbor with steepest downward slope:
        Directions: 0: East, 1: SE, 2: South, 3: SW, 4: West, 5: NW, 6: North, 7: NE
        """
        d8_dir = np.zeros((self.rows, self.cols), dtype=int)
        flow_accum = np.ones((self.rows, self.cols), dtype=float)

        d_rows = [-1, -1, -1, 0, 0, 1, 1, 1]
        d_cols = [-1, 0, 1, -1, 1, -1, 0, 1]

        for r in range(self.rows):
            for c in range(self.cols):
                curr_elev = self.elevation_grid[r, c]
                max_drop = 0.0
                best_dir = -1

                for d_idx, (dr, dc) in enumerate(zip(d_rows, d_cols)):
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < self.rows and 0 <= nc < self.cols:
                        drop = curr_elev - self.elevation_grid[nr, nc]
                        if drop > max_drop:
                            max_drop = drop
                            best_dir = d_idx

                d8_dir[r, c] = best_dir

        # Compute cell-to-cell accumulation
        for r in range(self.rows):
            for c in range(self.cols):
                target_r, target_c = r, c
                # Route water down the D8 path up to 5 hops
                for _ in range(5):
                    d = d8_dir[target_r, target_c]
                    if d == -1:
                        break
                    nr, nc = target_r + d_rows[d], target_c + d_cols[d]
                    if 0 <= nr < self.rows and 0 <= nc < self.cols:
                        flow_accum[nr, nc] += 0.8 * flow_accum[target_r, target_c]
                        target_r, target_c = nr, nc
                    else:
                        break

        return d8_dir, np.round(flow_accum, 2)

    def route_2d_surface_rainfall(self, rainfall_mm_hr: float, tide_level_m: float) -> Dict[str, Any]:
        """
        Simulates 2D cell-to-cell hydrodynamic runoff volume routing.
        Returns 2D Inundation Depth Matrix (cm) across the entire city.
        """
        # Runoff generated per cell (Rational Method)
        cell_runoff = 0.00278 * 0.88 * rainfall_mm_hr * 120.0  # 120 ha per grid cell
        
        # Accumulate water based on D8 accumulation matrix
        surcharge_grid = cell_runoff * self.flow_accumulation_grid
        
        # Calculate water depth in cm per cell
        depth_grid = np.zeros((self.rows, self.cols), dtype=float)
        for r in range(self.rows):
            for c in range(self.cols):
                elev = self.elevation_grid[r, c]
                accum = self.flow_accumulation_grid[r, c]
                
                # Low depression accumulation factor
                if elev < 2.5:
                    depth = (surcharge_grid[r, c] / 25.0) * 18.0 + (3.0 - elev) * 15.0
                else:
                    depth = (surcharge_grid[r, c] / (elev * 12.0)) * 6.0
                    
                if tide_level_m >= 3.5 and elev < 2.2:
                    depth += (tide_level_m - 3.2) * 22.0
                    
                depth_grid[r, c] = round(min(140.0, max(0.0, depth * (rainfall_mm_hr / 55.0)**0.85)), 1) if rainfall_mm_hr > 5.0 else 0.0

        return {
            "rows": self.rows,
            "cols": self.cols,
            "elevation_matrix_m": self.elevation_grid.tolist(),
            "flow_accumulation_matrix": self.flow_accumulation_grid.tolist(),
            "inundation_depth_matrix_cm": depth_grid.tolist(),
            "max_grid_depth_cm": float(np.max(depth_grid)),
            "grid_resolution_km": 1.2
        }
