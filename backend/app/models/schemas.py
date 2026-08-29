from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class SimulationRequest(BaseModel):
    rainfall_mm_hr: float = Field(default=45.0, ge=0.0, le=350.0, description="Rainfall intensity in mm/hr")
    tide_level_m: float = Field(default=2.8, ge=0.0, le=5.5, description="Arabian Sea tide level in meters")
    siltation_pct: float = Field(default=30.0, ge=0.0, le=100.0, description="Average drainage siltation / debris %")
    active_scenario_name: Optional[str] = "Custom Simulation"

class ComponentTelemetry(BaseModel):
    component_id: str
    component_type: str  # ROAD, DRAIN, HOTSPOT, PUMPING_STATION
    name: str
    ward: str
    health_score: float  # 0 to 100
    failure_risk_score: float  # 0 to 100
    status: str  # SAFE, WARNING, CRITICAL
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
    metrics: Dict[str, Any] = {}

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # ROAD, DRAIN, HOTSPOT, PUMP, INTERSECTION
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
    type: str  # HYDRAULIC_RUNOFF, HYDRAULIC_CONVEYANCE, DISRUPTION_SPILLOVER, TRAFFIC_FLOW
    weight: float
    active: bool
    description: str

class CascadingGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    active_cascade_chains: List[List[str]]
    total_impacted_nodes: int

class PriorityIntervention(BaseModel):
    rank: int
    component_id: str
    component_name: str
    component_type: str
    ward: str
    failure_probability: float
    impact_score: float
    population_exposure: float
    traffic_exposure: float
    cost_factor: float
    urgency_factor: float
    priority_score: float
    action_type: str
    action_description: str
    estimated_cost_inr_lakhs: float
    estimated_resolution_time_hrs: float

class SimulationResponse(BaseModel):
    simulation_id: str
    timestamp: str
    parameters: SimulationRequest
    city_summary: Dict[str, Any]
    critical_hotspots_count: int
    roads_at_risk_count: int
    drains_overflowing_count: int
    traffic_disruption_index: float
    components: List[ComponentTelemetry]
    top_priorities: List[PriorityIntervention]
    cascade_summary: Dict[str, Any]

class CitizenReportRequest(BaseModel):
    reporter_name: str = "Anonymous Citizen"
    reporter_phone: Optional[str] = "9876543210"
    category: str = "POTHOLE"  # POTHOLE, WATERLOGGING, DRAIN_BLOCKED
    latitude: float
    longitude: float
    ward: Optional[str] = "F/S"
    landmark: str
    severity: str = "HIGH"
    description: str
    estimated_water_depth_cm: Optional[float] = 0.0

class CitizenReportResponse(BaseModel):
    ticket_id: str
    timestamp: str
    status: str
    verification_status: str
    matched_component_id: str
    priority_rank: int
    estimated_eta_hours: float
    message: str
