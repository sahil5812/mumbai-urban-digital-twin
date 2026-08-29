from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SimulationRequest(BaseModel):
    rainfall_mm_hr: float = Field(default=45.0, description="Rainfall Intensity in mm/hr")
    tide_level_m: float = Field(default=2.8, description="Arabian Sea Tide Level in meters")
    siltation_pct: float = Field(default=30.0, description="Average SWD Siltation percentage")
    active_scenario_name: Optional[str] = Field(default="Normal Monsoon")

class ComponentTelemetry(BaseModel):
    component_id: str
    component_type: str
    name: str
    ward: str
    health_score: float
    failure_risk_score: float
    status: str
    latitude: float
    longitude: float
    elevation_m: float
    water_depth_cm: float
    pothole_probability: float
    traffic_speed_kmh: float
    traffic_congestion_pct: float
    drain_discharge_capacity_cumecs: float
    drain_siltation_pct: float
    tidal_backflow_blocked: bool
    recommended_action: str
    cascading_impact_summary: str
    metrics: Dict[str, Any]

class CitySummary(BaseModel):
    overall_infrastructure_health: float
    average_failure_risk: float
    active_submerged_hotspots: int
    roads_critical_count: int
    drains_overloaded_count: int
    pumping_stations_active: int
    citywide_avg_water_depth_cm: float
    high_tide_warning: bool
    disruption_severity: str

class TopPriorityHotspot(BaseModel):
    rank: int
    component_id: str
    name: str
    ward: str
    composite_priority_score: float
    urgency_level: str
    estimated_impacted_citizens: int
    recommended_intervention: str
    required_pump_capacity_cumecs: float
    traffic_diverted_route: str

class TimelineForecastStep(BaseModel):
    time_offset: str
    time_minutes: int
    predicted_rainfall_mm_hr: float
    city_max_depth_cm: float
    critical_hotspots_count: int
    components: List[ComponentTelemetry]

class SimulationResponse(BaseModel):
    city_summary: CitySummary
    components: List[ComponentTelemetry]
    top_priorities: List[TopPriorityHotspot]
    timeline_forecast: List[TimelineForecastStep]
    simulation_metadata: Dict[str, Any]

class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    ward: str
    status: str
    health_score: float
    failure_risk_score: float
    water_depth_cm: float
    lat: float
    lon: float

class GraphEdge(BaseModel):
    source: str
    target: str
    type: str
    weight: float
    active: bool
    description: str

class CascadingGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    active_cascade_chains: List[List[str]]
    total_impacted_nodes: int

class CitizenReportRequest(BaseModel):
    location_name: str
    ward: str
    water_depth_reported: str
    pothole_severity: str
    description: Optional[str] = ""

class CitizenReportResponse(BaseModel):
    report_id: str
    status: str
    assigned_priority: str
    estimated_resolution_hrs: int
    ticket_message: str
