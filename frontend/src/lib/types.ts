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
  tidal_backflow_blocked: boolean;
  recommended_action: string;
  cascading_impact_summary: string;
  metrics: Record<string, any>;
}

export interface CitySummary {
  overall_infrastructure_health: number;
  average_failure_risk?: number;
  active_submerged_hotspots?: number;
  roads_critical_count?: number;
  drains_overloaded_count?: number;
  pumping_stations_active?: number;
  citywide_avg_water_depth_cm?: number;
  high_tide_warning: boolean;
  disruption_severity: string;
  average_traffic_speed_kmh?: number;
  max_water_depth_cm?: number;
}

export interface TopPriorityHotspot {
  rank: number;
  component_id: string;
  name?: string;
  component_name?: string;
  ward: string;
  composite_priority_score?: number;
  priority_score?: number;
  urgency_level?: string;
  urgency?: string;
  estimated_impacted_citizens?: number;
  recommended_intervention?: string;
  recommended_action?: string;
  required_pump_capacity_cumecs?: number;
  estimated_cost_inr_lakhs?: number;
  estimated_cost_inr?: number;
  traffic_diverted_route?: string;
}

export type PriorityIntervention = TopPriorityHotspot;

export interface TimelineForecastStep {
  time_offset: string;
  time_minutes: number;
  predicted_rainfall_mm_hr: number;
  city_max_depth_cm: number;
  critical_hotspots_count: number;
  components: ComponentTelemetry[];
}

export interface SimulationResponse {
  simulation_id?: string;
  timestamp?: string;
  parameters?: any;
  city_summary: CitySummary;
  components: ComponentTelemetry[];
  top_priorities: TopPriorityHotspot[];
  critical_hotspots_count?: number;
  roads_at_risk_count?: number;
  drains_overflowing_count?: number;
  traffic_disruption_index?: number;
  timeline_forecast?: TimelineForecastStep[];
  cascade_summary?: {
    seed_failure_nodes: string[];
    cascade_chains: string[][];
    total_impacted_nodes: number;
  };
  simulation_metadata?: Record<string, any>;
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
  reporter_name?: string;
  location_name?: string;
  landmark?: string;
  ward?: string;
  category?: string;
  severity?: string;
  pothole_severity?: string;
  water_depth_reported?: string;
  estimated_water_depth_cm?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface CitizenReportResponse {
  report_id?: string;
  ticket_id?: string;
  timestamp?: string;
  status: string;
  verification_status?: string;
  matched_component_id?: string;
  assigned_priority?: string;
  priority_rank?: number;
  estimated_resolution_hrs?: number;
  estimated_eta_hours?: number;
  ticket_message?: string;
  message?: string;
}
