-- Mumbai Urban Infrastructure Digital Twin Unified Relational Schema (PS010)
-- Connecting: Weather -> Drainage -> Waterlogging -> Road Degradation & Potholes -> Traffic

CREATE TABLE administrative_wards (
    ward_id TEXT PRIMARY KEY,
    ward_name TEXT,
    area_sqkm REAL,
    pop_density_sqkm REAL,
    elevation_avg_m REAL,
    drain_density_km_sqkm REAL,
    chronic_flood_spots INTEGER,
    vulnerability_score REAL,
    risk_category TEXT
);

CREATE TABLE road_network (
    road_id TEXT PRIMARY KEY,
    road_name TEXT,
    ward TEXT REFERENCES administrative_wards(ward_id),
    type TEXT,
    surface TEXT,
    lanes INTEGER,
    length_km REAL,
    width_m REAL,
    elev_m REAL,
    slope_pct REAL,
    start_lat REAL,
    start_lon REAL,
    end_lat REAL,
    end_lon REAL,
    pci INTEGER
);

CREATE TABLE drainage_network (
    drain_id TEXT PRIMARY KEY,
    name TEXT,
    ward TEXT REFERENCES administrative_wards(ward_id),
    system_type TEXT,
    length_km REAL,
    width_m REAL,
    catchment_sqkm REAL,
    capacity_cumecs REAL,
    siltation_pct INTEGER,
    outfall_location TEXT
);

CREATE TABLE waterlogging_spots (
    spot_id TEXT PRIMARY KEY,
    location_name TEXT,
    ward TEXT REFERENCES administrative_wards(ward_id),
    lat REAL,
    lon REAL,
    elevation_m REAL,
    historical_frequency_per_monsoon INTEGER,
    avg_water_depth_cm REAL,
    primary_cause TEXT,
    linked_road_id TEXT REFERENCES road_network(road_id),
    linked_drain_id TEXT REFERENCES drainage_network(drain_id),
    risk_severity TEXT
);

CREATE TABLE pothole_incidents (
    pothole_id TEXT PRIMARY KEY,
    road_id TEXT REFERENCES road_network(road_id),
    road_name TEXT,
    ward TEXT REFERENCES administrative_wards(ward_id),
    latitude REAL,
    longitude REAL,
    depth_cm REAL,
    surface_area_sqm REAL,
    severity_level TEXT,
    pavement_surface_type TEXT,
    primary_failure_cause TEXT,
    reported_by TEXT,
    report_date TEXT,
    status TEXT,
    repair_material_used TEXT,
    repair_completion_date TEXT,
    repair_contractor_id TEXT
);

CREATE TABLE traffic_disruption_timeseries (
    timestamp TEXT,
    road_id TEXT REFERENCES road_network(road_id),
    road_name TEXT,
    ward TEXT,
    current_speed_kmh REAL,
    baseline_speed_kmh REAL,
    congestion_index REAL,
    estimated_delay_mins INTEGER,
    water_accumulation_depth_cm REAL,
    traffic_disruption_status TEXT
);
