import sqlite3
import pandas as pd
import os

db_file = os.path.join(os.path.dirname(__file__), "mumbai_digital_twin.db")
conn = sqlite3.connect(db_file)

query = """
SELECT 
    r.road_id,
    r.road_name,
    r.ward,
    r.surface AS road_surface,
    r.pci AS pavement_condition_index,
    w.spot_id AS waterlog_spot_id,
    w.avg_water_depth_cm,
    w.primary_cause AS waterlog_cause,
    d.name AS connected_drain,
    d.siltation_pct AS drain_siltation,
    COUNT(DISTINCT p.pothole_id) AS total_potholes_reported,
    ROUND(AVG(t.current_speed_kmh), 1) AS avg_monsoon_speed_kmh,
    ROUND(AVG(t.congestion_index), 2) AS avg_congestion_index
FROM road_network r
JOIN waterlogging_spots w ON r.road_id = w.linked_road_id
LEFT JOIN drainage_network d ON w.linked_drain_id = d.drain_id
LEFT JOIN pothole_incidents p ON r.road_id = p.road_id
LEFT JOIN traffic_disruption_timeseries t ON r.road_id = t.road_id
GROUP BY r.road_id, w.spot_id
ORDER BY w.avg_water_depth_cm DESC
LIMIT 10;
"""

df_result = pd.read_sql_query(query, conn)
print("=== TOP 10 CASCADING FAILURE HOTSPOTS IN MUMBAI INFRASTRUCTURE ===")
print(df_result.to_string(index=False))
conn.close()
