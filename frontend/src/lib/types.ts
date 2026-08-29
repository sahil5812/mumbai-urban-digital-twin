export interface ComponentTelemetry {
  component_id: string;
  component_type: string;
  name: string;
  ward: string;
  health_score: number;
  failure_risk_score: number;
  status: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  water_depth_cm: number;
  pothole_probability: number;
  traffic_speed_kmh: number;
  traffic_congestion_pct: number;
  drain_discharge_capacity_cumecs: number;
  drain_siltation_pct: number;
  tidal_backflow_blocked: bool;
  recommended_action: string;
  cascading_impact_summary: string;
  metrics: Record<string, any>;
}

export interface CitySummary {
  overall_infrastructure_health: number;
  average_failure_risk: number;
  active_submerged_hotspots: number;
  roads_critical_count: number;
  drains_overloaded_count: number;
  pumping_stations_active: number;
  citywide_avg_water_depth_cm: number;
  high_tide_warning: bool;
  disruption_severity: string;
}

export interface TopPriorityHotspot {
  rank: number;
  component_id: string;
  name: string;
  ward: string;
  composite_priority_score: number;
  urgency_level: string;
  estimated_impacted_citizens: number;
  recommended_intervention: string;
  required_pump_capacity_cumecs: number;
  traffic_diverted_route: string;
}

export interface TimelineForecastStep {
  time_offset: string;
  time_minutes: number;
  predicted_rainfall_mm_hr: number;
  city_max_depth_cm: number;
  critical_hotspots_count: number;
  components: ComponentTelemetry[];
}

export interface SimulationResponse {
  city_summary: CitySummary;
  components: ComponentTelemetry[];
  top_priorities: TopPriorityHotspot[];
  timeline_forecast?: TimelineForecastStep[];
  simulation_metadata: Record<string, any>;
}

export interface SimulationRequest {
  rainfall_mm_hr: number;
  tide_level_m: number;
  siltation_pct: number;
  active_scenario_name?: string;
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
  location_name: string;
  ward: string;
  water_depth_reported: string;
  pothole_severity: string;
  description?: string;
}

export interface CitizenReportResponse {
  report_id: string;
  status: string;
  assigned_priority: string;
  estimated_resolution_hrs: number;
  ticket_message: string;
}
