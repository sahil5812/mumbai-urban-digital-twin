"""
Mumbai Infrastructure Real-Data Loader (Exact CSV Schema Match)
Dynamically ingests CSV and GeoJSON datasets from dataset/ directory
and builds the coupled GIS infrastructure node-edge topology.
"""

import os
import pandas as pd
from typing import Dict, List, Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "..", "dataset"))

def load_master_infrastructure() -> Dict[str, Any]:
    hotspots = []
    roads = []
    drains = []
    pumps = []
    edges = []

    # 1. Load Chronic Waterlogging Hotspots CSV (72 real spots)
    hotspots_csv = os.path.join(DATASET_DIR, "05_waterlogging_spots", "bmc_chronic_waterlogging_hotspots.csv")
    if os.path.exists(hotspots_csv):
        df_h = pd.read_csv(hotspots_csv)
        for _, row in df_h.head(15).iterrows():
            clean_name = str(row["location_name"]).split(",")[0].strip()
            hotspots.append({
                "id": str(row["spot_id"]),
                "name": clean_name,
                "type": "HOTSPOT",
                "ward": str(row.get("ward", "F/S")),
                "latitude": float(row["lat"]),
                "longitude": float(row["lon"]),
                "elevation_m": float(row.get("elevation_m", 2.0)),
                "historical_avg_depth_cm": float(row.get("avg_water_depth_cm", 60.0)),
                "primary_cause": str(row.get("primary_cause", "Saucer Depression")),
                "linked_road_id": str(row.get("linked_road_id", "RD_WEH_01")),
                "linked_drain_id": str(row.get("linked_drain_id", "DRN_MIT_01")),
                "risk_severity": str(row.get("risk_severity", "High")),
                "health_score": 80.0,
                "failure_risk_score": 20.0,
                "water_depth_cm": 0.0,
                "status": "SAFE"
            })
            if pd.notna(row.get("linked_road_id")):
                edges.append({
                    "source_node_id": str(row["spot_id"]),
                    "target_node_id": str(row["linked_road_id"]),
                    "relationship_type": "SURCHARGE_TO_ROAD",
                    "weight_impact_factor": 0.95,
                    "description": f"{clean_name} waterlogging inundates arterial road"
                })
            if pd.notna(row.get("linked_drain_id")):
                edges.append({
                    "source_node_id": str(row["spot_id"]),
                    "target_node_id": str(row["linked_drain_id"]),
                    "relationship_type": "HYDRAULIC_RUNOFF_DISCHARGE",
                    "weight_impact_factor": 0.85,
                    "description": f"Surface runoff converges into {row['linked_drain_id']}"
                })

    # 2. Load Road Network Master CSV
    roads_csv = os.path.join(DATASET_DIR, "03_road_network", "mumbai_road_network_master.csv")
    if os.path.exists(roads_csv):
        df_r = pd.read_csv(roads_csv)
        for _, row in df_r.head(10).iterrows():
            roads.append({
                "id": str(row["road_id"]),
                "name": str(row.get("road_name", row["road_id"])),
                "type": "ROAD",
                "ward": str(row.get("ward", "H/E")),
                "latitude": float(row.get("start_lat", 19.07)),
                "longitude": float(row.get("start_lon", 72.85)),
                "elevation_m": float(row.get("elevation_m", 4.5)),
                "pci": float(row.get("pci", 75.0)),
                "lanes": int(row.get("lanes", 6)),
                "daily_traffic": int(row.get("avg_daily_traffic", 150000)),
                "health_score": 85.0,
                "failure_risk_score": 15.0,
                "water_depth_cm": 0.0,
                "status": "SAFE"
            })

    # 3. Load Major Drains & Rivers CSV (60 real channels)
    drains_csv = os.path.join(DATASET_DIR, "04_drainage_stormwater", "mumbai_major_nallahs_and_rivers.csv")
    if os.path.exists(drains_csv):
        df_d = pd.read_csv(drains_csv)
        for _, row in df_d.head(8).iterrows():
            drains.append({
                "id": str(row["drain_id"]),
                "name": str(row["name"]),
                "type": "DRAIN",
                "ward": str(row.get("ward", "G/N")),
                "latitude": 19.065,
                "longitude": 72.860,
                "elevation_m": 1.5,
                "width_m": float(row.get("width_m", 25.0)),
                "capacity_cumecs": float(row.get("capacity_cumecs", 120.0)),
                "siltation_pct": float(row.get("siltation_pct", 35.0)),
                "outfall_location": str(row.get("outfall_location", "Arabian Sea")),
                "health_score": 80.0,
                "failure_risk_score": 20.0,
                "water_depth_cm": 0.0,
                "status": "SAFE"
            })

    # 4. Load Stormwater Pumping Stations (SPS) CSV (8 real stations)
    pumps_csv = os.path.join(DATASET_DIR, "04_drainage_stormwater", "bmc_stormwater_pumping_stations.csv")
    if os.path.exists(pumps_csv):
        df_p = pd.read_csv(pumps_csv)
        for _, row in df_p.head(8).iterrows():
            pumps.append({
                "id": str(row["station_id"]),
                "name": str(row["name"]),
                "type": "PUMP",
                "ward": str(row.get("ward", "F/S")),
                "latitude": float(row.get("lat", 18.992)),
                "longitude": float(row.get("lon", 72.8445)),
                "elevation_m": 1.2,
                "capacity_cumecs": float(row.get("total_capacity_cumecs", 36.0)),
                "number_of_pumps": int(row.get("pumps_count", 6)),
                "tide_gate_installed": True,
                "health_score": 90.0,
                "failure_risk_score": 10.0,
                "water_depth_cm": 0.0,
                "status": "SAFE"
            })

    return {
        "hotspots": hotspots,
        "roads": roads,
        "drains": drains,
        "pumping_stations": pumps,
        "edges": edges
    }
