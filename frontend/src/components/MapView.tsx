"use client";

import React, { useEffect, useRef, useState } from "react";
import { ComponentTelemetry } from "../lib/types";
import { Layers, Droplets, Waves, ShieldAlert } from "lucide-react";

interface MapViewProps {
  components: ComponentTelemetry[];
  selectedComponentId: string | null;
  onSelectComponent: (component: ComponentTelemetry) => void;
  viewMode: "2D" | "3D";
  rainfall_mm_hr: number;
  tide_level_m: number;
}

// Major Mumbai Arterial Road Geometries
const ROAD_POLYLINES = [
  {
    id: "RD_WEH_01",
    name: "Western Express Highway (South)",
    coords: [
      [19.055, 72.842],
      [19.068, 72.847],
      [19.088, 72.852],
    ],
  },
  {
    id: "RD_WEH_02",
    name: "Western Express Highway (North)",
    coords: [
      [19.088, 72.852],
      [19.120, 72.858],
      [19.162, 72.860],
      [19.225, 72.865],
    ],
  },
  {
    id: "RD_SVR_02",
    name: "SV Road (Milan Subway Approach)",
    coords: [
      [19.065, 72.836],
      [19.083, 72.838],
      [19.098, 72.839],
    ],
  },
  {
    id: "RD_SVR_04",
    name: "SV Road (Andheri Subway Section)",
    coords: [
      [19.110, 72.840],
      [19.125, 72.841],
      [19.145, 72.842],
    ],
  },
  {
    id: "RD_EEH_01",
    name: "Eastern Express Highway (Sion-Priyadarshini)",
    coords: [
      [19.038, 72.862],
      [19.045, 72.871],
      [19.062, 72.880],
    ],
  },
  {
    id: "RD_EEH_02",
    name: "Eastern Express Highway (Kurla-Ghatkopar)",
    coords: [
      [19.062, 72.880],
      [19.078, 72.892],
      [19.095, 72.905],
      [19.130, 72.925],
    ],
  },
  {
    id: "RD_BAR_01",
    name: "Dr. Babasaheb Ambedkar Road (Hindmata)",
    coords: [
      [18.995, 72.838],
      [19.012, 72.843],
      [19.035, 72.855],
    ],
  },
  {
    id: "RD_LBS_01",
    name: "LBS Marg (Kurla Kamani)",
    coords: [
      [19.055, 72.875],
      [19.068, 72.881],
      [19.090, 72.895],
    ],
  },
  {
    id: "RD_MDR_01",
    name: "Marine Drive (Netaji Subhash Rd)",
    coords: [
      [18.925, 72.822],
      [18.941, 72.822],
      [18.955, 72.821],
    ],
  },
  {
    id: "RD_BKC_01",
    name: "BKC Central Avenue",
    coords: [
      [19.060, 72.860],
      [19.065, 72.868],
      [19.072, 72.875],
    ],
  },
];

// Major Mumbai Stormwater Drainage & Natural Conduits
const DRAINAGE_CHANNELS = [
  {
    id: "DRN_MIT_01",
    name: "Mithi River Main Channel (Powai to Mahim Bay)",
    coords: [
      [19.120, 72.895],
      [19.090, 72.885],
      [19.072, 72.875],
      [19.062, 72.860],
      [19.052, 72.845],
    ],
  },
  {
    id: "DRN_VAK_01",
    name: "Vakola Nallah (Santacruz to BKC Mithi Confluence)",
    coords: [
      [19.085, 72.855],
      [19.075, 72.860],
      [19.065, 72.865],
    ],
  },
  {
    id: "DRN_IRL_01",
    name: "Irla Nallah (Andheri West to Juhu Arabian Sea)",
    coords: [
      [19.125, 72.845],
      [19.112, 72.835],
      [19.102, 72.825],
    ],
  },
  {
    id: "DRN_GAZ_01",
    name: "Gazdarband Nallah (Khar to Arabian Sea)",
    coords: [
      [19.083, 72.842],
      [19.076, 72.832],
      [19.070, 72.825],
    ],
  },
];

export const MapView: React.FC<MapViewProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  viewMode,
  rainfall_mm_hr,
  tide_level_m,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const polylinesRef = useRef<{ [id: string]: any }>({});
  const drainLinesRef = useRef<{ [id: string]: any }>({});
  const floodPoolsRef = useRef<{ [id: string]: any }>({});

  const [showFloodPools, setShowFloodPools] = useState(true);
  const [showDrains, setShowDrains] = useState(true);
  const [showRoads, setShowRoads] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    const L = require("leaflet");

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, {
      center: [19.0760, 72.8650], // Mumbai Center
      zoom: 12,
      zoomControl: false,
    });

    // Official OpenStreetMap Tiles (100% Free, Zero API Key)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    const timer1 = setTimeout(() => map.invalidateSize(), 200);
    const timer2 = setTimeout(() => map.invalidateSize(), 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Road Polylines, Drainage Conduits, Flood Water Pools, and Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || typeof window === "undefined") return;
    const L = require("leaflet");

    // 1. Draw Visual Blue Flood Inundation Pools
    Object.values(floodPoolsRef.current).forEach((p: any) => p.remove());
    floodPoolsRef.current = {};

    if (showFloodPools) {
      const hotspots = components.filter((c) => c.component_type === "HOTSPOT" || c.water_depth_cm > 5.0);
      hotspots.forEach((h) => {
        const depth = h.water_depth_cm;
        // Calculate pool radius based on water depth & rain intensity
        const radiusMeters = Math.max(120, Math.min(800, depth * 15.0 + rainfall_mm_hr * 1.5));
        const opacity = Math.min(0.75, 0.25 + (depth / 60.0) * 0.45);
        const poolColor = depth > 30 ? "#0284c7" : depth > 15 ? "#38bdf8" : "#7dd3fc";

        const pool = L.circle([h.latitude, h.longitude], {
          radius: radiusMeters,
          color: "#0369a1",
          weight: 1.5,
          fillColor: poolColor,
          fillOpacity: opacity,
          className: depth > 20 ? "flood-pool-pulsing" : undefined,
        }).addTo(map);

        pool.bindPopup(`
          <div style="font-family: sans-serif; min-width: 170px;">
            <div style="display: flex; align-items: center; gap: 4px; color: #0284c7; font-weight: bold; font-size: 11px;">
              <span>🌊 FLOOD INUNDATION POOL</span>
            </div>
            <h4 style="margin: 2px 0; font-size: 12px; font-weight: bold; color: #0f172a;">${h.name}</h4>
            <p style="margin: 3px 0; font-size: 11px; color: #475569;">Predicted Depth: <strong style="color: #0284c7;">${depth} cm</strong></p>
            <p style="margin: 0; font-size: 10px; color: #64748b;">Submergence Radius: ~${Math.round(radiusMeters)} meters</p>
          </div>
        `);

        pool.on("click", () => onSelectComponent(h));
        floodPoolsRef.current[h.component_id] = pool;
      });
    }

    // 2. Draw Stormwater Drainage Channels
    Object.values(drainLinesRef.current).forEach((d: any) => d.remove());
    drainLinesRef.current = {};

    if (showDrains) {
      DRAINAGE_CHANNELS.forEach((channel) => {
        const drainLine = L.polyline(channel.coords, {
          color: "#06b6d4",
          weight: 4.5,
          opacity: 0.85,
          dashArray: "8, 6",
        }).addTo(map);

        drainLine.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px;">
            <h4 style="margin: 0; font-size: 12px; font-weight: bold; color: #0891b2;">${channel.name}</h4>
            <p style="margin: 3px 0; font-size: 11px; color: #475569;">Type: Major Stormwater Drainage Conduit</p>
            <p style="margin: 0; font-size: 11px; color: #0f172a;">Tidal Status: ${tide_level_m > 4.0 ? "⚠️ Tidal Lockout Active" : "🟢 Free Gravity Discharge"}</p>
          </div>
        `);

        drainLinesRef.current[channel.id] = drainLine;
      });
    }

    // 3. Draw Road Polylines
    Object.values(polylinesRef.current).forEach((p: any) => p.remove());
    polylinesRef.current = {};

    if (showRoads) {
      ROAD_POLYLINES.forEach((road) => {
        const tele = components.find((c) => c.component_id === road.id);
        const isSelected = selectedComponentId === road.id;
        const isCrit = tele?.status === "CRITICAL";
        const isWarn = tele?.status === "WARNING";
        const color = isCrit ? "#EF4444" : isWarn ? "#F59E0B" : "#10B981";

        const poly = L.polyline(road.coords, {
          color: color,
          weight: isSelected ? 6.5 : 4.5,
          opacity: 0.95,
          dashArray: isCrit ? "6, 6" : undefined,
        }).addTo(map);

        poly.bindPopup(`
          <div style="font-family: sans-serif; min-width: 170px;">
            <h4 style="margin: 0; font-size: 12px; font-weight: bold; color: #0f172a;">${road.name}</h4>
            <p style="margin: 3px 0; font-size: 11px; color: #475569;">Health: <strong>${tele?.health_score || 80}%</strong> | Speed: ${tele?.traffic_speed_kmh || 50} km/h</p>
            <p style="margin: 0; font-size: 11px; color: ${color}; font-weight: bold;">Status: ${tele?.status || "SAFE"}</p>
          </div>
        `);

        poly.on("click", () => {
          if (tele) onSelectComponent(tele);
        });

        polylinesRef.current[road.id] = poly;
      });
    }

    // 4. Draw Markers
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    components.forEach((c) => {
      const isSelected = selectedComponentId === c.component_id;
      const isCritical = c.status === "CRITICAL";
      const isWarning = c.status === "WARNING";
      const color = isCritical ? "#EF4444" : isWarning ? "#F59E0B" : "#10B981";

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? "32px" : "24px"};
            height: ${isSelected ? "32px" : "24px"};
            border-radius: 50%;
            background: ${color};
            box-shadow: 0 0 ${isSelected ? "20px" : "12px"} ${color};
            border: 2px solid white;
            cursor: pointer;
            transition: all 0.3s ease;
          ">
            ${isCritical ? `<div style="position:absolute; inset:-8px; border-radius:50%; border:2px solid ${color}; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ""}
            <span style="font-size: 11px; font-weight: bold; color: black;">
              ${c.component_type === "HOTSPOT" ? "🌊" : c.component_type === "ROAD" ? "🛣️" : "🚰"}
            </span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([c.latitude, c.longitude], { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 180px; color: #0f172a;">
          <h4 style="margin: 0; font-size: 12px; font-weight: bold;">${c.name}</h4>
          <p style="margin: 3px 0; font-size: 11px; color: #475569;">Ward: ${c.ward} | Elev: +${c.elevation_m}m</p>
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-top: 4px;">
            <span style="color: ${color};">Risk: ${c.failure_risk_score}%</span>
            <span style="color: #0284c7;">Water: ${c.water_depth_cm} cm</span>
          </div>
        </div>
      `);

      marker.on("click", () => {
        onSelectComponent(c);
      });

      markersRef.current[c.component_id] = marker;
    });

    // 5. Draw Predictive Radar Target Pulse Rings on Vulnerable Hotspots
    const radarHotspotIds = ["WL_HND_01", "WL_MLN_01", "WL_AND_01", "WL_KRL_01"];
    components.filter((c) => radarHotspotIds.includes(c.component_id)).forEach((h) => {
      const radarRing = L.circle([h.latitude, h.longitude], {
        radius: 450,
        color: "#F59E0B",
        weight: 2,
        dashArray: "4, 6",
        fillColor: "#F59E0B",
        fillOpacity: 0.12,
      }).addTo(map);

      radarRing.bindPopup(`
        <div style="font-family: sans-serif; min-width: 170px; color: #0f172a;">
          <div style="color: #d97706; font-weight: bold; font-size: 11px;">⚡ PREDICTIVE RADAR TARGET</div>
          <h4 style="margin: 2px 0; font-size: 12px; font-weight: bold;">${h.name} (${h.ward})</h4>
          <p style="margin: 3px 0; font-size: 11px; color: #475569;">Elevation: +${h.elevation_m}m (Saucer Bowl)</p>
          <p style="margin: 0; font-size: 10px; color: #d97706; font-weight: bold;">Pre-emptive Dewatering Pumps Armed</p>
        </div>
      `);
      floodPoolsRef.current[`RADAR_${h.component_id}`] = radarRing;
    });
  }, [components, selectedComponentId, showFloodPools, showDrains, showRoads, rainfall_mm_hr, tide_level_m]);

  return (
    <div className={`relative w-full h-full min-h-[480px] transition-all duration-700 ${
      viewMode === "3D" ? "perspective-3d" : ""
    }`}>
      {/* Leaflet Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px] rounded-xl overflow-hidden shadow-2xl" />

      {/* Floating 3D Horizon Vignette Overlay */}
      {viewMode === "3D" && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent via-transparent to-slate-950/30 rounded-xl" />
      )}

      {/* Top Floating Layer Switcher Pills */}
      <div className="absolute top-4 right-16 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl z-20 flex items-center gap-2 shadow-2xl text-xs">
        <button
          onClick={() => setShowFloodPools(!showFloodPools)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border transition-all ${
            showFloodPools
              ? "bg-blue-600/30 border-blue-500 text-blue-300 shadow-sm"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span>🌊 Water Pools</span>
        </button>

        <button
          onClick={() => setShowDrains(!showDrains)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border transition-all ${
            showDrains
              ? "bg-cyan-600/30 border-cyan-500 text-cyan-300 shadow-sm"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Waves className="w-3.5 h-3.5 text-cyan-400" />
          <span>🚰 Drains</span>
        </button>

        <button
          onClick={() => setShowRoads(!showRoads)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border transition-all ${
            showRoads
              ? "bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-sm"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>🛣️ Roads</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg z-20 text-[11px] flex flex-col gap-1.5 shadow-xl text-slate-300">
        <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Infrastructure Telemetry:</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
          <span>Operational (&gt;70% Health)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
          <span>Warning (Slow Traffic)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500" />
          <span>Critical (Submerged)</span>
        </div>
        <div className="flex items-center gap-2 border-t border-slate-800 pt-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
          <span>🌊 Visual Inundation Pools</span>
        </div>
      </div>
    </div>
  );
};
