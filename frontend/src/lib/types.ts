export interface SimulationRequest {
  rainfall_mm_hr: number;
  tide_level_m: number;
  siltation_pct: number;
  active_scenario_name?: string;
}

export interface ComponentTelemetry {
  component_id: string;
  component_type: "ROAD" | "DRAIN" | "HOTSPOT" | "PUMPING_STATION";
  name: string;
  ward: string;
  health_score: number;
  failure_risk_score: number;
  status: "SAFE" | "WARNING" | "CRITICAL";
  latitude: number;
  longitude: number;
  elevation_m: number;
  water_depth_cm: number;
  pothole_probability: number;
  traffic_speed_kmh: number;
  traffic_congestion_pct: number;
  drain_discharge_capacity_cumecs: number;
  drain_siltation_pct: number;
  tidal_backflow_blocked: boolean;
  recommended_action: string;
  cascading_impact_summary: string;
  metrics?: Record<string, any>;
}

export interface PriorityIntervention {
  rank: number;
  component_id: string;
  component_name: string;
  component_type: string;
  ward: string;
  failure_probability: number;
  impact_score: number;
  population_exposure: number;
  traffic_exposure: number;
  cost_factor: number;
  urgency_factor: number;
  priority_score: number;
  action_type: string;
  action_description: string;
  estimated_cost_inr_lakhs: number;
  estimated_resolution_time_hrs: number;
}

export interface SimulationResponse {
  simulation_id: string;
  timestamp: string;
  parameters: SimulationRequest;
  city_summary: {
    overall_infrastructure_health: number;
    disruption_severity: string;
    high_tide_warning: boolean;
    average_traffic_speed_kmh: number;
    max_water_depth_cm: number;
  };
  critical_hotspots_count: number;
  roads_at_risk_count: number;
  drains_overflowing_count: number;
  traffic_disruption_index: number;
  components: ComponentTelemetry[];
  top_priorities: PriorityIntervention[];
  cascade_summary: {
    seed_failure_nodes: string[];
    cascade_chains: string[][];
    total_impacted_nodes: number;
  };
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  ward: string;
  status: string;
  health_score: number;
  failure_risk_score: number;
  water_depth_cm: number;
  lat: number;
  lon: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
  active: boolean;
  description: string;
}

export interface CascadingGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  active_cascade_chains: string[][];
  total_impacted_nodes: number;
}

export interface CitizenReportRequest {
  reporter_name: string;
  reporter_phone?: string;
  category: string;
  latitude: number;
  longitude: number;
  ward?: string;
  landmark: string;
  severity: string;
  description: string;
  estimated_water_depth_cm?: number;
}

export interface CitizenReportResponse {
  ticket_id: string;
  timestamp: string;
  status: string;
  verification_status: string;
  matched_component_id: string;
  priority_rank: number;
  estimated_eta_hours: number;
  message: string;
}
