"use client";

import React, { useState, useMemo, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import maplibregl from "maplibre-gl";
import { Map } from "react-map-gl/maplibre";
import { ColumnLayer, PathLayer, ArcLayer, TextLayer, ScatterplotLayer } from "@deck.gl/layers";
import { ComponentTelemetry } from "../lib/types";
import { 
  Rotate3d, 
  Route, 
  Waves, 
  GitBranch, 
  ZoomIn, 
  ZoomOut,
  Compass,
  Play,
  Pause,
  Sun,
  Moon,
  Satellite
} from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

// 1. 100% Free Official Esri Dark Gray Canvas (ZERO WATERMARK, ZERO API KEY)
const DARK_CYBER_STYLE: any = {
  version: 8,
  sources: {
    "esri-dark": {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "© Esri, HERE, Garmin, USGS, OpenStreetMap",
    },
  },
  layers: [
    { id: "bg-dark", type: "background", paint: { "background-color": "#111827" } },
    { id: "esri-dark-layer", type: "raster", source: "esri-dark", minzoom: 0, maxzoom: 19 },
  ],
};

// 2. High-Res Satellite Photoreal Style (ZERO WATERMARK)
const SATELLITE_STYLE: any = {
  version: 8,
  sources: {
    "esri-sat": {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "© Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [
    { id: "bg-sat", type: "background", paint: { "background-color": "#040b14" } },
    { id: "esri-sat-layer", type: "raster", source: "esri-sat", minzoom: 0, maxzoom: 19 },
  ],
};

// 3. Urban Day Street Map Style (ZERO WATERMARK)
const DAY_STREET_STYLE: any = {
  version: 8,
  sources: {
    "esri-street": {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "© Esri, OpenStreetMap",
    },
  },
  layers: [
    { id: "bg-street", type: "background", paint: { "background-color": "#0d1b2a" } },
    { id: "esri-street-layer", type: "raster", source: "esri-street", minzoom: 0, maxzoom: 19 },
  ],
};

const MUMBAI_ROADS = [
  { id: "WEH", name: "Western Express Highway", path: [[72.8277, 18.9750], [72.8350, 19.0150], [72.8450, 19.0550], [72.8520, 19.0800], [72.8550, 19.1100], [72.8580, 19.1400], [72.8600, 19.1750], [72.8630, 19.2300]], width: 34, color: [0, 242, 254, 250] },
  { id: "EEH", name: "Eastern Express Highway", path: [[72.8750, 19.0150], [72.8850, 19.0450], [72.9050, 19.0750], [72.9250, 19.1150], [72.9450, 19.1550], [72.9650, 19.1950]], width: 32, color: [79, 172, 254, 250] },
  { id: "SVR", name: "Swami Vivekananda (SV) Road", path: [[72.8360, 19.0550], [72.8395, 19.0832], [72.8441, 19.1194], [72.8465, 19.1500], [72.8500, 19.1850]], width: 22, color: [56, 189, 248, 250] },
  { id: "LBS", name: "LBS Marg", path: [[72.8750, 19.0550], [72.8880, 19.0700], [72.9100, 19.1100], [72.9350, 19.1500], [72.9500, 19.1800]], width: 22, color: [14, 165, 233, 250] },
  { id: "BAR", name: "Dr. B.A. Road (Hindmata Corridor)", path: [[72.8330, 18.9600], [72.8380, 18.9900], [72.8432, 19.0125], [72.8550, 19.0400], [72.8620, 19.0600]], width: 26, color: [6, 182, 212, 250] },
  { id: "MDR", name: "Marine Drive", path: [[72.8220, 18.9250], [72.8235, 18.9420], [72.8180, 18.9550]], width: 26, color: [0, 245, 212, 250] },
  { id: "BKC", name: "BKC Connector", path: [[72.8550, 19.0600], [72.8680, 19.0660], [72.8780, 19.0640]], width: 24, color: [103, 232, 249, 250] },
];

const MUMBAI_DRAINS = [
  { id: "MITHI", name: "Mithi River Main Channel", path: [[72.8950, 19.1200], [72.8800, 19.0900], [72.8680, 19.0700], [72.8550, 19.0550], [72.8350, 19.0450], [72.8250, 19.0400]], width: 55, color: [30, 144, 255, 250] },
  { id: "VAKOLA", name: "Vakola Nallah", path: [[72.8650, 19.0900], [72.8600, 19.0780], [72.8550, 19.0650]], width: 28, color: [0, 191, 255, 250] },
  { id: "IRLA", name: "Irla Nallah", path: [[72.8420, 19.1250], [72.8350, 19.1100], [72.8280, 19.1000]], width: 24, color: [72, 209, 204, 250] },
  { id: "GAZDAR", name: "Gazdarband Nallah", path: [[72.8400, 19.0880], [72.8320, 19.0820], [72.8240, 19.0800]], width: 24, color: [127, 255, 212, 250] },
];

const DISCHARGE_ARCS = [
  { name: "Hindmata -> Britannia SPS Discharge", source: [72.8432, 19.0125], target: [72.8450, 18.9850] },
  { name: "Milan Subway -> Gazdarband Outfall", source: [72.8395, 19.0832], target: [72.8240, 19.0800] },
  { name: "Andheri Subway -> Irla Outfall", source: [72.8441, 19.1194], target: [72.8280, 19.1000] },
  { name: "Kurla LBS -> Mithi River Surge", source: [72.8800, 19.0700], target: [72.8350, 19.0450] },
];

interface DeckGLMapViewProps {
  components: ComponentTelemetry[];
  selectedComponentId: string | null;
  onSelectComponent: (component: ComponentTelemetry) => void;
  viewMode: "2D" | "3D";
  rainfall_mm_hr?: number;
  tide_level_m?: number;
}

export const DeckGLMapView: React.FC<DeckGLMapViewProps> = ({
  components = [],
  selectedComponentId,
  onSelectComponent,
  viewMode,
  rainfall_mm_hr = 45,
  tide_level_m = 2.8,
}) => {
  const [show3DColumns, setShow3DColumns] = useState<boolean>(true);
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [showDrains, setShowDrains] = useState<boolean>(true);
  const [showArcs, setShowArcs] = useState<boolean>(true);

  // Basemap Theme: 'DARK' | 'SATELLITE' | 'STREET' (ALL ZERO WATERMARK)
  const [mapTheme, setMapTheme] = useState<"DARK" | "SATELLITE" | "STREET">("DARK");

  // 360° Cinematic Orbit State
  const [isOrbiting, setIsOrbiting] = useState<boolean>(false);

  const [viewState, setViewState] = useState({
    longitude: 72.8480,
    latitude: 19.0400,
    zoom: 11.5,
    pitch: viewMode === "3D" ? 55 : 0,
    bearing: viewMode === "3D" ? -15 : 0,
    maxPitch: 75,
    minZoom: 8,
    maxZoom: 18,
  });

  // Sync 2D/3D Pitch
  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      pitch: viewMode === "3D" ? 55 : 0,
      bearing: viewMode === "3D" ? prev.bearing || -15 : 0,
    }));
  }, [viewMode]);

  // 360° Continuous Smooth Cinematic Drone Orbit Loop
  useEffect(() => {
    if (!isOrbiting) return;

    let animId: number;
    const rotate = () => {
      setViewState((prev) => ({
        ...prev,
        bearing: (prev.bearing + 0.16) % 360,
        pitch: Math.max(45, prev.pitch),
      }));
      animId = requestAnimationFrame(rotate);
    };

    animId = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animId);
  }, [isOrbiting]);

  const handleZoom = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    setViewState((prev) => ({
      ...prev,
      zoom: Math.min(prev.maxZoom, Math.max(prev.minZoom, prev.zoom + delta)),
    }));
  };

  const handleResetView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOrbiting(false);
    setViewState({
      longitude: 72.8480,
      latitude: 19.0400,
      zoom: 11.5,
      pitch: viewMode === "3D" ? 55 : 0,
      bearing: -15,
      maxPitch: 75,
      minZoom: 8,
      maxZoom: 18,
    });
  };

  // 1. Base Ground Pulse Disks (Glowing Radar Rings)
  const baseDisksLayer = useMemo(() => {
    if (!show3DColumns || !components.length) return null;

    return new ScatterplotLayer({
      id: "base-disks-layer",
      data: components,
      getPosition: (d: ComponentTelemetry) => [d.longitude || 72.85, d.latitude || 19.06],
      getRadius: (d: ComponentTelemetry) => (d.component_id === selectedComponentId ? 360 : 200),
      getFillColor: (d: ComponentTelemetry) => {
        if (d.status === "CRITICAL" || (d.failure_risk_score || 0) > 65) return [239, 68, 68, 190];
        if (d.status === "WARNING" || (d.failure_risk_score || 0) > 35) return [245, 158, 11, 190];
        return [16, 185, 129, 190];
      },
      getLineColor: [255, 255, 255, 240],
      getLineWidth: 2,
      stroked: true,
      filled: true,
      radiusMinPixels: 6,
      radiusMaxPixels: 28,
      pickable: true,
      onClick: (info: any) => info.object && onSelectComponent(info.object),
    });
  }, [components, selectedComponentId, show3DColumns]);

  // 2. 3D Extruded Building Towers (All 23 Hotspots, Roads & Drains)
  const columnsLayer = useMemo(() => {
    if (!show3DColumns || !components.length) return null;

    return new ColumnLayer({
      id: "3d-building-columns",
      data: components,
      getPosition: (d: ComponentTelemetry) => [d.longitude || 72.85, d.latitude || 19.06],
      getElevation: (d: ComponentTelemetry) => {
        const waterHeight = (d.water_depth_cm || 0) * 45;
        const riskHeight = (d.failure_risk_score || 0) * 18;
        const baseHeight = 350; // Majestic visible height even in dry weather
        return viewMode === "3D" ? baseHeight + waterHeight + riskHeight : 0;
      },
      elevationScale: 1,
      radius: 175,
      diskResolution: 32,
      extruded: viewMode === "3D",
      getFillColor: (d: ComponentTelemetry) => {
        if (d.component_id === selectedComponentId) return [0, 242, 254, 255]; // Selected Neon Cyan
        if (d.status === "CRITICAL" || (d.failure_risk_score || 0) > 65) return [239, 68, 68, 245]; // Critical Red
        if (d.status === "WARNING" || (d.failure_risk_score || 0) > 35) return [245, 158, 11, 245]; // Warning Amber
        if (d.component_type === "DRAIN" || d.component_type === "PUMP") return [6, 182, 212, 245]; // Drainage Cyan
        return [16, 185, 129, 245]; // Safe Emerald
      },
      getLineColor: [255, 255, 255, 240],
      lineWidthMinPixels: 2,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 200],
      onClick: (info: any) => info.object && onSelectComponent(info.object),
    });
  }, [components, selectedComponentId, viewMode, show3DColumns]);

  // 3. Floating 3D Billboard Text Tags (On Top of All 23 Towers)
  const textTagsLayer = useMemo(() => {
    if (!components.length) return null;

    return new TextLayer({
      id: "floating-text-tags",
      data: components,
      getPosition: (d: ComponentTelemetry) => {
        const waterHeight = (d.water_depth_cm || 0) * 45;
        const riskHeight = (d.failure_risk_score || 0) * 18;
        const height = viewMode === "3D" ? 350 + waterHeight + riskHeight + 80 : 0;
        return [d.longitude || 72.85, d.latitude || 19.06, height];
      },
      getText: (d: ComponentTelemetry) => {
        const nameClean = (d.name || "Hotspot").split("/")[0].trim();
        const depth = d.water_depth_cm ? `${Math.round(d.water_depth_cm)}cm` : "0cm";
        return `${nameClean} (${depth})`;
      },
      getSize: 11,
      getColor: (d: ComponentTelemetry) => {
        if (d.status === "CRITICAL" || (d.failure_risk_score || 0) > 65) return [254, 202, 202, 255];
        if (d.status === "WARNING" || (d.failure_risk_score || 0) > 35) return [254, 240, 138, 255];
        return [209, 250, 229, 255];
      },
      getTextAnchor: "middle",
      getAlignmentBaseline: "bottom",
      background: true,
      getBackgroundColor: (d: ComponentTelemetry) => {
        if (d.status === "CRITICAL" || (d.failure_risk_score || 0) > 65) return [127, 29, 29, 230];
        if (d.status === "WARNING" || (d.failure_risk_score || 0) > 35) return [120, 53, 15, 230];
        return [6, 78, 59, 230];
      },
      backgroundPadding: [4, 2],
      fontFamily: "monospace",
      fontWeight: "bold",
      billboard: true,
      pickable: true,
      onClick: (info: any) => info.object && onSelectComponent(info.object),
    });
  }, [components, selectedComponentId, viewMode]);

  // 4. Glowing 3D Parabolic Flow Arcs
  const arcsLayer = useMemo(() => {
    if (!showArcs) return null;

    return new ArcLayer({
      id: "3d-discharge-arcs",
      data: DISCHARGE_ARCS,
      getSourcePosition: (d: any) => d.source,
      getTargetPosition: (d: any) => d.target,
      getSourceColor: [239, 68, 68, 250],
      getTargetColor: [0, 245, 212, 250],
      getWidth: 5,
      getHeight: viewMode === "3D" ? 0.38 : 0,
      pickable: true,
    });
  }, [showArcs, viewMode]);

  // 5. Road Arterials
  const roadsLayer = useMemo(() => {
    if (!showRoads) return null;

    return new PathLayer({
      id: "mumbai-roads-layer",
      data: MUMBAI_ROADS,
      getPath: (d: any) => d.path,
      getColor: (d: any) => d.color,
      getWidth: (d: any) => d.width,
      widthUnits: "meters",
      widthMinPixels: 3,
      pickable: true,
    });
  }, [showRoads]);

  // 6. Drainage Channels
  const drainsLayer = useMemo(() => {
    if (!showDrains) return null;

    return new PathLayer({
      id: "mumbai-drains-layer",
      data: MUMBAI_DRAINS,
      getPath: (d: any) => d.path,
      getColor: (d: any) => d.color,
      getWidth: (d: any) => d.width,
      widthUnits: "meters",
      widthMinPixels: 4,
      pickable: true,
    });
  }, [showDrains]);

  const layers = [
    drainsLayer,
    roadsLayer,
    arcsLayer,
    baseDisksLayer,
    columnsLayer,
    textTagsLayer,
  ].filter(Boolean);

  const activeMapStyle = mapTheme === "DARK" ? DARK_CYBER_STYLE : (mapTheme === "SATELLITE" ? SATELLITE_STYLE : DAY_STREET_STYLE);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 overflow-hidden select-none">
      <DeckGL
        viewState={viewState}
        onViewStateChange={(e: any) => {
          if (!isOrbiting) setViewState(e.viewState);
        }}
        controller={{
          doubleClickZoom: false,
          dragRotate: true,
          touchRotate: true,
          inertia: 300,
        }}
        onError={(err: any) => {
          console.warn("DeckGL WebGL Notice (Recovered):", err?.message || err);
        }}
        layers={layers}
        getTooltip={({ object }: any) => {
          if (!object) return null;
          if (object.component_id) {
            return {
              html: `
                <div style="font-family: monospace; padding: 6px; font-size: 11px; background: rgba(15,23,42,0.95); color: #fff; border: 1px solid #334155; border-radius: 6px;">
                  <strong style="color: #38bdf8;">${object.name}</strong><br/>
                  Ward: <strong>${object.ward}</strong> | Elev: <strong>+${object.elevation_m}m</strong><br/>
                  Risk: <span style="color: ${object.status === 'CRITICAL' ? '#ef4444' : '#10b981'}; font-weight: bold;">${Math.round(object.failure_risk_score)}%</span> | Water: <strong>${Math.round(object.water_depth_cm)}cm</strong><br/>
                  Speed: <strong>${object.traffic_speed_kmh} km/h</strong>
                </div>
              `,
            };
          }
          if (object.name) {
            return {
              html: `<div style="font-family: monospace; padding: 4px; font-size: 11px; background: rgba(15,23,42,0.95); color: #38bdf8;">${object.name}</div>`,
            };
          }
          return null;
        }}
      >
        <Map
          mapLib={maplibregl}
          mapStyle={activeMapStyle}
          reuseMaps
          preventStyleDiffing
        />
      </DeckGL>

      {/* Top Right: Layer Toggles & Map Theme Switcher */}
      <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-2xl text-xs">
        {/* Map Theme Toggle (Cyber / Satellite / Street) - ZERO WATERMARKS */}
        <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapTheme("DARK"); }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
              mapTheme === "DARK" ? "bg-purple-600 text-white shadow-md shadow-purple-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Dark Cyber Digital Twin (Esri Dark Canvas)"
          >
            <Moon className="w-3 h-3" />
            <span>Cyber</span>
          </button>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapTheme("SATELLITE"); }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
              mapTheme === "SATELLITE" ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Photorealistic Satellite Imagery (Esri World Satellite)"
          >
            <Satellite className="w-3 h-3" />
            <span>Satellite</span>
          </button>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapTheme("STREET"); }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
              mapTheme === "STREET" ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Daylight Urban Street Map (Esri Street Map)"
          >
            <Sun className="w-3 h-3" />
            <span>Street</span>
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        {/* Layer Visibility Toggles */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShow3DColumns(!show3DColumns); }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium transition-all ${
            show3DColumns
              ? "bg-purple-600/30 border-purple-500 text-purple-300"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Rotate3d className="w-3.5 h-3.5 text-purple-400" />
          <span>Towers</span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowRoads(!showRoads); }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium transition-all ${
            showRoads
              ? "bg-blue-600/30 border-blue-500 text-blue-300"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Route className="w-3.5 h-3.5 text-blue-400" />
          <span>Roads</span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDrains(!showDrains); }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium transition-all ${
            showDrains
              ? "bg-cyan-600/30 border-cyan-500 text-cyan-300"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Waves className="w-3.5 h-3.5 text-cyan-400" />
          <span>Drains</span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowArcs(!showArcs); }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium transition-all ${
            showArcs
              ? "bg-amber-600/30 border-amber-500 text-amber-300"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-amber-400" />
          <span>Arcs</span>
        </button>
      </div>

      {/* Floating Tactical Zoom & 360° Cinematic Orbit Drone Controls */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-1.5 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-2xl">
        {/* 360° Cinematic Orbit Button */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOrbiting(!isOrbiting); }}
          className={`flex items-center justify-center p-2 rounded-lg border transition-all ${
            isOrbiting
              ? "bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-500/40 animate-pulse"
              : "bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800"
          }`}
          title={isOrbiting ? "Pause 360° Drone Orbit" : "Start 360° Cinematic Drone Flyover Orbit"}
        >
          {isOrbiting ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={(e) => handleZoom(e, 0.6)}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={(e) => handleZoom(e, -0.6)}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={(e) => handleResetView(e)}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-800 transition-all"
          title="Reset Camera Orientation & Stop Orbit"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* 360° Orbit Active Floating Status Indicator */}
      {isOrbiting && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-950/90 border border-rose-500/60 px-4 py-1.5 rounded-full text-xs font-mono text-rose-300 shadow-2xl shadow-rose-500/20 animate-fadeIn">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span>🚁 360° DRONE FLYOVER ORBIT ACTIVE ({Math.round(viewState.bearing)}°)</span>
        </div>
      )}

      {/* Legend Badge */}
      <div className="absolute bottom-6 left-4 z-20 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[11px] flex flex-col gap-1 shadow-2xl text-slate-300 font-mono">
        <span className="font-bold text-slate-100 uppercase text-[10px] tracking-wider mb-0.5">3D Twin Layer Legend:</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span>Critical Hotspot (&gt;60cm Inundation)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <span>Warning Zone (15-60cm Depth)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span>Safe Operational Corridor</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>Parabolic Pumping Outfall Arcs</span>
        </div>
      </div>
    </div>
  );
};
