"""
Mumbai Infrastructure Real-Data Loader (Exact CSV Schema Match)
Dynamically ingests CSV and GeoJSON datasets from dataset/ directory
and builds the coupled GIS infrastructure node-edge topology.
"""

import os
import sqlite3
import pandas as pd
from typing import Dict, List, Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "..", "dataset"))
DB_PATH = os.path.abspath(os.path.join(DATASET_DIR, "09_digital_twin_unified_db", "mumbai_digital_twin.db"))

def load_master_infrastructure() -> Dict[str, Any]:
    hotspots = []
    roads = []
    drains = []
    pumps = []
    edges = []

    use_db = os.path.exists(DB_PATH)

    # 1. Load Chronic Waterlogging Hotspots (70 in DB / 72 in CSV)
    if use_db:
        try:
            conn = sqlite3.connect(DB_PATH)
            df_h = pd.read_sql_query("SELECT * FROM waterlogging_spots", conn)
            conn.close()
        except Exception:
            df_h = pd.DataFrame()
    else:
        hotspots_csv = os.path.join(DATASET_DIR, "05_waterlogging_spots", "bmc_chronic_waterlogging_hotspots.csv")
        df_h = pd.read_csv(hotspots_csv) if os.path.exists(hotspots_csv) else pd.DataFrame()

    if not df_h.empty:
        for _, row in df_h.iterrows():
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

    # 2. Load Road Network Master (119 in DB / full in CSV)
    if use_db:
        try:
            conn = sqlite3.connect(DB_PATH)
            df_r = pd.read_sql_query("SELECT * FROM road_network", conn)
            conn.close()
        except Exception:
            df_r = pd.DataFrame()
    else:
        roads_csv = os.path.join(DATASET_DIR, "03_road_network", "mumbai_road_network_master.csv")
        df_r = pd.read_csv(roads_csv) if os.path.exists(roads_csv) else pd.DataFrame()

    if not df_r.empty:
        for _, row in df_r.iterrows():
            roads.append({
                "id": str(row["road_id"]),
                "name": str(row.get("road_name", row["road_id"])),
                "type": "ROAD",
                "ward": str(row.get("ward", "H/E")),
                "latitude": float(row.get("start_lat", 19.07)),
                "longitude": float(row.get("start_lon", 72.85)),
                "elevation_m": float(row.get("elev_m", row.get("elevation_m", 4.5))),
                "pci": float(row.get("pci", 75.0)),
                "lanes": int(row.get("lanes", 6)),
                "daily_traffic": int(row.get("avg_daily_traffic", 150000)),
                "health_score": 85.0,
                "failure_risk_score": 15.0,
                "water_depth_cm": 0.0,
                "status": "SAFE"
            })

    # 2b. Load Road Network Topology Edges (357 arterial road-to-road connections)
    if use_db:
        try:
            conn = sqlite3.connect(DB_PATH)
            df_rt = pd.read_sql_query("SELECT * FROM road_topology_graph", conn)
            conn.close()
        except Exception:
            df_rt = pd.DataFrame()
    else:
        rt_csv = os.path.join(DATASET_DIR, "03_road_network", "mumbai_road_segments_topology.csv")
        df_rt = pd.read_csv(rt_csv) if os.path.exists(rt_csv) else pd.DataFrame()

    if not df_rt.empty:
        for _, row in df_rt.iterrows():
            dist_km = float(row.get("distance_km", 2.0))
            conn_type = str(row.get("connection_type", "Interchange"))
            edges.append({
                "source_node_id": str(row["source_road_id"]),
                "target_node_id": str(row["target_road_id"]),
                "relationship_type": "ROAD_CORRIDOR",
                "weight_impact_factor": round(max(0.1, dist_km), 2),
                "distance_km": dist_km,
                "base_time_mins": round(dist_km * 1.5, 1),
                "description": f"{conn_type} connection ({dist_km} km)"
            })

    # 3. Load Major Drains & Rivers (58 in DB / full in CSV)
    if use_db:
        try:
            conn = sqlite3.connect(DB_PATH)
            df_d = pd.read_sql_query("SELECT * FROM drainage_network", conn)
            conn.close()
        except Exception:
            df_d = pd.DataFrame()
    else:
        drains_csv = os.path.join(DATASET_DIR, "04_drainage_stormwater", "mumbai_major_nallahs_and_rivers.csv")
        df_d = pd.read_csv(drains_csv) if os.path.exists(drains_csv) else pd.DataFrame()

    if not df_d.empty:
        for _, row in df_d.iterrows():
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

    # 4. Load Stormwater Pumping Stations (SPS) (8 in DB / full in CSV)
    if use_db:
        try:
            conn = sqlite3.connect(DB_PATH)
            df_p = pd.read_sql_query("SELECT * FROM stormwater_pumping_stations", conn)
            conn.close()
        except Exception:
            df_p = pd.DataFrame()
    else:
        pumps_csv = os.path.join(DATASET_DIR, "04_drainage_stormwater", "bmc_stormwater_pumping_stations.csv")
        df_p = pd.read_csv(pumps_csv) if os.path.exists(pumps_csv) else pd.DataFrame()

    if not df_p.empty:
        for _, row in df_p.iterrows():
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

    # 5. Ingest Thane Mumbra Chronic Hotspots CSV
    tmc_hotspots_csv = os.path.join(DATASET_DIR, "05_waterlogging_spots", "thane_mumbra_chronic_waterlogging_hotspots.csv")
    if os.path.exists(tmc_hotspots_csv):
        df_tmc_h = pd.read_csv(tmc_hotspots_csv)
        for _, row in df_tmc_h.iterrows():
            clean_name = str(row["location_name"]).split(",")[0].strip()
            hotspots.append({
                "id": str(row["spot_id"]),
                "name": clean_name,
                "type": "HOTSPOT",
                "ward": str(row.get("ward", "TMC-Ward-1")),
                "latitude": float(row["lat"]),
                "longitude": float(row["lon"]),
                "elevation_m": float(row.get("elevation_m", 2.3)),
                "historical_avg_depth_cm": float(row.get("avg_water_depth_cm", 75.0)),
                "primary_cause": str(row.get("primary_cause", "Saucer Underpass & Parsik Runoff")),
                "linked_road_id": str(row.get("linked_road_id", "RD_TMC_MBR_01")),
                "linked_drain_id": str(row.get("linked_drain_id", "DRN_TMC_MBR_01")),
                "risk_severity": str(row.get("risk_severity", "Critical")),
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
                    "description": f"{clean_name} inundates {row['linked_road_id']}"
                })
            if pd.notna(row.get("linked_drain_id")):
                edges.append({
                    "source_node_id": str(row["spot_id"]),
                    "target_node_id": str(row["linked_drain_id"]),
                    "relationship_type": "HYDRAULIC_RUNOFF_DISCHARGE",
                    "weight_impact_factor": 0.90,
                    "description": f"Runoff discharges into {row['linked_drain_id']}"
                })

    # 6. Ingest Thane Mumbra Road Network CSV
    tmc_roads_csv = os.path.join(DATASET_DIR, "03_road_network", "thane_mumbra_road_network.csv")
    if os.path.exists(tmc_roads_csv):
        df_tmc_r = pd.read_csv(tmc_roads_csv)
        for _, row in df_tmc_r.iterrows():
            roads.append({
                "id": str(row["road_id"]),
                "name": str(row.get("road_name", row["road_id"])),
                "type": "ROAD",
                "ward": str(row.get("ward", "TMC-Ward-1")),
                "latitude": float(row.get("start_lat", 19.185)),
                "longitude": float(row.get("start_lon", 73.022)),
                "elevation_m": float(row.get("elevation_m", 4.8)),
                "pci": float(row.get("pci", 75.0)),
                "lanes": int(row.get("lanes", 6)),
                "daily_traffic": int(row.get("avg_daily_traffic", 120000)),
                "health_score": 85.0,
                "failure_risk_score": 15.0,
                "water_depth_cm": 0.0,
                "status": "SAFE"
            })
        # Connect Eastern Express Highway (EEH) to Old Mumbai-Pune Highway (Mumbra)
        edges.append({
            "source_node_id": "RD_EEH_01",
            "target_node_id": "RD_TMC_MBR_01",
            "relationship_type": "INTER_CITY_CORRIDOR",
            "weight_impact_factor": 0.70,
            "description": "Eastern Express Highway connects to Old Mumbai-Pune Highway via Thane Kalwa Bridge"
        })

    # 7. Ingest Thane Mumbra Drains & Rivers CSV
    tmc_drains_csv = os.path.join(DATASET_DIR, "04_drainage_stormwater", "thane_mumbra_major_nallahs.csv")
    if os.path.exists(tmc_drains_csv):
        df_tmc_d = pd.read_csv(tmc_drains_csv)
        for _, row in df_tmc_d.iterrows():
            drains.append({
                "id": str(row["drain_id"]),
                "name": str(row["name"]),
                "type": "DRAIN",
                "ward": str(row.get("ward", "TMC-Ward-1")),
                "latitude": 19.195,
                "longitude": 73.018,
                "elevation_m": 1.8,
                "width_m": float(row.get("width_m", 25.0)),
                "capacity_cumecs": float(row.get("capacity_cumecs", 100.0)),
                "siltation_pct": float(row.get("siltation_pct", 45.0)),
                "outfall_location": str(row.get("outfall_location", "Thane Creek")),
                "health_score": 80.0,
                "failure_risk_score": 20.0,
                "water_depth_cm": 0.0,
                "status": "SAFE"
            })

    # 8. Ingest Thane Mumbra Stormwater Pumping Stations CSV
    tmc_pumps_csv = os.path.join(DATASET_DIR, "04_drainage_stormwater", "thane_mumbra_pumping_stations.csv")
    if os.path.exists(tmc_pumps_csv):
        df_tmc_p = pd.read_csv(tmc_pumps_csv)
        for _, row in df_tmc_p.iterrows():
            pumps.append({
                "id": str(row["station_id"]),
                "name": str(row["name"]),
                "type": "PUMP",
                "ward": str(row.get("ward", "TMC-Ward-1")),
                "latitude": float(row.get("lat", 19.198)),
                "longitude": float(row.get("lon", 73.016)),
                "elevation_m": float(row.get("elevation_m", 1.5)),
                "capacity_cumecs": float(row.get("total_capacity_cumecs", 24.0)),
                "number_of_pumps": int(row.get("pumps_count", 4)),
                "tide_gate_installed": True,
                "health_score": 90.0,
                "failure_risk_score": 10.0,
                "water_depth_cm": 0.0,
                "status": "SAFE"
            })
            # Connect Mumbra Station Underpass to Reti Bunder SPS
            edges.append({
                "source_node_id": "HOT_TMC_MBR_01",
                "target_node_id": str(row["station_id"]),
                "relationship_type": "PUMP_RELIEF_DISPATCH",
                "weight_impact_factor": 0.85,
                "description": "Reti Bunder Dewatering SPS evacuates stormwater from Mumbra Station underpass"
            })

    return {
        "hotspots": hotspots,
        "roads": roads,
        "drains": drains,
        "pumping_stations": pumps,
        "edges": edges
    }
