"use client";

import React from "react";
import { ComponentTelemetry } from "../lib/types";
import { X, Activity, AlertOctagon, Car, Droplets, Wrench, ShieldCheck, MapPin, Gauge, GitBranch, AlertTriangle, Hospital, Navigation } from "lucide-react";

interface ComponentInspectorProps {
  component: ComponentTelemetry | null;
  onClose: () => void;
}

// Function to generate rich surrounding impact data based on component ID & water depth
function getSurroundingImpacts(component: ComponentTelemetry) {
  const depth = component.water_depth_cm;
  const isHighRisk = component.failure_risk_score > 60 || depth > 15;

  if (component.component_id.includes("HND") || component.name.includes("Hindmata")) {
    return {
      surroundingRoads: [
        { name: "Dr. Babasaheb Ambedkar Road", impact: "Directly Severed / Impassable", delay: "+45 mins", status: "CRITICAL" },
        { name: "Eastern Express Highway (Sion Approach)", impact: "Spillover Traffic Diversion", delay: "+35 mins", status: "WARNING" },
        { name: "Lal Baug Flyover (Northbound)", impact: "Backlog Queue Reaches 2.8 km", delay: "+25 mins", status: "WARNING" },
      ],
      publicDisruption: "KEM & Tata Memorial Hospital emergency ambulance corridors delayed by ~30 mins. Dadar TT market access waterlogged.",
      drainageImpact: "Hindmata underground holding tank reaching 95% capacity; secondary street gullies experiencing backwater surcharge.",
      commutersAffected: "~185,000 daily commuters",
    };
  } else if (component.component_id.includes("MLN") || component.name.includes("Milan")) {
    return {
      surroundingRoads: [
        { name: "Swami Vivekanand (SV) Road", impact: "Traffic Halted at Subway Entry", delay: "+50 mins", status: "CRITICAL" },
        { name: "Western Express Highway (Santacruz)", impact: "Heavy Spillover onto WEH Flyover", delay: "+40 mins", status: "WARNING" },
        { name: "Linking Road (Khar-Santacruz)", impact: "Severe Arterial Congestion", delay: "+30 mins", status: "WARNING" },
      ],
      publicDisruption: "Santacruz East-West connectivity completely cut off. Nanavati Hospital route diverted via WEH.",
      drainageImpact: "Gazdarband Nallah discharge constrained; Arabian Sea tidal backflow prevents gravity draining.",
      commutersAffected: "~140,000 daily commuters",
    };
  } else if (component.component_id.includes("AND") || component.name.includes("Andheri")) {
    return {
      surroundingRoads: [
        { name: "SV Road (Andheri West)", impact: "Traffic Gridlock at Station Jn", delay: "+55 mins", status: "CRITICAL" },
        { name: "Gokhale Bridge East-West Corridor", impact: "Heavy Congestion Spillover", delay: "+35 mins", status: "WARNING" },
        { name: "Andheri-Kurla Road", impact: "Sluggish Commercial Freight Flow", delay: "+25 mins", status: "WARNING" },
      ],
      publicDisruption: "Andheri Railway Station West entry flooded; Cooper Hospital emergency vehicle transit diverted.",
      drainageImpact: "Irla Nallah capacity overwhelmed; pumps operating at 100% duty cycle.",
      commutersAffected: "~210,000 daily commuters",
    };
  } else if (component.component_id.includes("KRL") || component.name.includes("Kurla")) {
    return {
      surroundingRoads: [
        { name: "LBS Marg (Kurla Kamani Section)", impact: "Submerged & Impassable", delay: "+60 mins", status: "CRITICAL" },
        { name: "Santacruz-Chembur Link Road (SCLR)", impact: "Massive East-West Bottleneck", delay: "+45 mins", status: "CRITICAL" },
        { name: "Eastern Express Highway (Amar Mahal)", impact: "Vehicle Queue Stretches to Ghatkopar", delay: "+30 mins", status: "WARNING" },
      ],
      publicDisruption: "Kurla West market & bus depot submerged. Central Railway slow line access hindered.",
      drainageImpact: "Mithi River water levels touching bridge soffits; Mahim Bay tidal flap gates locked.",
      commutersAffected: "~230,000 daily commuters",
    };
  } else if (component.component_id.includes("SION") || component.name.includes("Sion")) {
    return {
      surroundingRoads: [
        { name: "Eastern Express Highway (Sion Circle)", impact: "Arterial Bottleneck", delay: "+45 mins", status: "CRITICAL" },
        { name: "Gandhi Market Lowline Road", impact: "Water Depth > 30cm (Buses Diverted)", delay: "+40 mins", status: "CRITICAL" },
        { name: "Sion-Bandra Link Road", impact: "Severe Sluggish Flow towards BKC", delay: "+25 mins", status: "WARNING" },
      ],
      publicDisruption: "Sion Hospital trauma center approach waterlogged; BEST bus routes 22, 25, 40 diverted.",
      drainageImpact: "Sion storm nallah overloaded; water spilling onto highway carriageways.",
      commutersAffected: "~175,000 daily commuters",
    };
  } else {
    return {
      surroundingRoads: [
        { name: "Adjacent Arterial Corridor", impact: isHighRisk ? "Traffic Speed Dropped by 65%" : "Normal Flow", delay: isHighRisk ? "+20 mins" : "+5 mins", status: isHighRisk ? "WARNING" : "SAFE" },
        { name: "Parallel Feeder Roads", impact: isHighRisk ? "Diversion Spillover Observed" : "Smooth", delay: isHighRisk ? "+15 mins" : "0 min", status: "SAFE" },
      ],
      publicDisruption: isHighRisk ? "Localized pedestrian waterlogging and slowdown of public transit." : "Normal municipal conditions.",
      drainageImpact: isHighRisk ? "Drainage conduits operating at elevated surcharge." : "Normal gravity flow.",
      commutersAffected: isHighRisk ? "~75,000 daily commuters" : "Minimal impact",
    };
  }
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({ component, onClose }) => {
  if (!component) return null;

  const surrounding = getSurroundingImpacts(component);

  return (
    <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-2xl flex flex-col gap-3.5 text-slate-200 w-84 max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
              component.component_type === "HOTSPOT" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
              component.component_type === "ROAD" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
              "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            }`}>
              {component.component_type}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Ward {component.ward}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-100 mt-1 leading-tight">{component.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Dual Gauges: Health Score & Failure Risk */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex flex-col items-center text-center">
          <span className="text-[10px] text-slate-400 font-medium">Health Score</span>
          <span className={`text-xl font-mono font-extrabold my-1 ${
            component.health_score >= 70 ? "text-emerald-400" :
            component.health_score >= 40 ? "text-amber-400" : "text-red-400"
          }`}>
            {component.health_score}%
          </span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                component.health_score >= 70 ? "bg-emerald-500" :
                component.health_score >= 40 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${component.health_score}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex flex-col items-center text-center">
          <span className="text-[10px] text-slate-400 font-medium">Failure Risk</span>
          <span className={`text-xl font-mono font-extrabold my-1 ${
            component.failure_risk_score >= 60 ? "text-red-400" :
            component.failure_risk_score >= 30 ? "text-amber-400" : "text-emerald-400"
          }`}>
            {component.failure_risk_score}%
          </span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                component.failure_risk_score >= 60 ? "bg-red-500" :
                component.failure_risk_score >= 30 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${component.failure_risk_score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Telemetry Key Attributes */}
      <div className="flex flex-col gap-1.5 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>Water Depth:</span>
          </span>
          <span className={`font-mono font-bold ${component.water_depth_cm > 15 ? "text-red-400" : "text-slate-200"}`}>
            {component.water_depth_cm} cm
          </span>
        </div>

        {component.component_type === "ROAD" && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span>Speed / Congestion:</span>
            </span>
            <span className="font-mono font-bold text-slate-200">
              {component.traffic_speed_kmh} km/h ({component.traffic_congestion_pct}%)
            </span>
          </div>
        )}

        {component.component_type === "ROAD" && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
              <span>Pothole Probability:</span>
            </span>
            <span className="font-mono font-bold text-amber-400">
              {(component.pothole_probability * 100).toFixed(0)}%
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Ground Elevation:</span>
          </span>
          <span className="font-mono text-slate-300">
            +{component.elevation_m} m THD
          </span>
        </div>
      </div>

      {/* 🔴 SURROUNDING INFRASTRUCTURE IMPACT (CASCADING SPILLOVER) */}
      <div className="bg-gradient-to-br from-red-950/30 via-slate-900 to-amber-950/20 border border-red-800/40 p-3 rounded-xl flex flex-col gap-2 shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5 text-red-400 text-[11px] font-bold uppercase tracking-wider">
            <GitBranch className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>Surrounding Impact & Spillover</span>
          </div>
          <span className="text-[10px] text-amber-300 font-mono">{surrounding.commutersAffected}</span>
        </div>

        {/* Impacted Nearby Roads List */}
        <div className="flex flex-col gap-1.5 mt-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Nearby Roads & Arteries Impacted:</span>
          {surrounding.surroundingRoads.map((r, idx) => (
            <div key={idx} className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/70 flex items-center justify-between text-[11px]">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-200">{r.name}</span>
                <span className="text-[10px] text-slate-400">{r.impact}</span>
              </div>
              <span className="font-mono font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/40 text-[10px]">
                {r.delay}
              </span>
            </div>
          ))}
        </div>

        {/* Public Disruption & Hospitals */}
        <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60 flex items-start gap-1.5 text-[10px] text-slate-300">
          <Hospital className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <span><strong>Emergency & Public Disruption:</strong> {surrounding.publicDisruption}</span>
        </div>

        {/* Drainage Network Surcharge */}
        <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60 flex items-start gap-1.5 text-[10px] text-cyan-300">
          <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span><strong>Drainage Network Status:</strong> {surrounding.drainageImpact}</span>
        </div>
      </div>

      {/* AI Work-Order Recommendation */}
      <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-800/40 p-2.5 rounded-lg flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-blue-400 text-[11px] font-bold uppercase tracking-wider">
          <Wrench className="w-3.5 h-3.5" />
          <span>Automated BMC Work Order:</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {component.recommended_action}
        </p>
      </div>
    </div>
  );
};
