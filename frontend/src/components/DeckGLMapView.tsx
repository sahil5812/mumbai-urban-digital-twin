"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { ColumnLayer, ScatterplotLayer, ArcLayer, PathLayer, TextLayer } from "@deck.gl/layers";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ComponentTelemetry } from "../lib/types";
import { Layers, Rotate3d, Route, Waves, Radio, Play, Pause, Compass, Sun, Moon, Satellite } from "lucide-react";

const MUMBAI_ROADS = [
  { id: "WEH", name: "Western Express Highway", path: [[72.8450, 19.0550], [72.8520, 19.0900], [72.8580, 19.1300], [72.8650, 19.1800], [72.8600, 19.2400]], width: 35, color: [59, 130, 246, 250] },
  { id: "EEH", name: "Eastern Express Highway", path: [[72.8650, 19.0300], [72.8800, 19.0600], [72.9150, 19.1200], [72.9550, 19.1700], [72.9700, 19.2200]], width: 35, color: [99, 102, 241, 250] },
  { id: "SVR", name: "Swami Vivekanand (SV) Road", path: [[72.8380, 19.0500], [72.8395, 19.0832], [72.8441, 19.1194], [72.8460, 19.1865], [72.8550, 19.2350]], width: 25, color: [249, 115, 22, 250] },
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
  { name: "Hindmata -> Britannia SPS Discharge", source: [72.8432, 19.0125], target: [72.8445, 18.9920] },
  { name: "Milan Subway -> Gazdarband Outfall", source: [72.8395, 19.0832], target: [72.8260, 19.0780] },
  { name: "Andheri Subway -> Irla Outfall", source: [72.8441, 19.1194], target: [72.8270, 19.1080] },
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

  // Basemap Theme: 'DARK' | 'SATELLITE' | 'STREET'
  const [mapTheme, setMapTheme] = useState<"DARK" | "SATELLITE" | "STREET">("STREET");

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

  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      pitch: viewMode === "3D" ? 55 : 0,
      bearing: viewMode === "3D" ? -15 : 0,
    }));
  }, [viewMode]);

  useEffect(() => {
    if (!isOrbiting) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const orbitLoop = () => {
      setViewState((prev) => ({
        ...prev,
        bearing: (prev.bearing + 0.16) % 360,
      }));
      animationFrameRef.current = requestAnimationFrame(orbitLoop);
    };

    animationFrameRef.current = requestAnimationFrame(orbitLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOrbiting]);

  const mapStyle = useMemo(() => {
    let tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
    let oceanColor = "#e6f2ff";

    if (mapTheme === "DARK") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
      oceanColor = "#0f172a";
    } else if (mapTheme === "SATELLITE") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      oceanColor = "#081b2e";
    }

    return {
      version: 8 as const,
      sources: {
        "world-tiles": {
          type: "raster" as const,
          tiles: [tileUrl],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "background-ocean-infinite",
          type: "background" as const,
          paint: { "background-color": oceanColor },
        },
        {
          id: "world-tiles-layer",
          type: "raster" as const,
          source: "world-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };
  }, [mapTheme]);

  // 1. Radar Inundation Disks
  const groundRadarLayer = useMemo(() => {
    if (!components.length) return null;

    return new ScatterplotLayer({
      id: "ground-radar-disks",
      data: components,
      getPosition: (d: ComponentTelemetry) => [d.longitude || 72.85, d.latitude || 19.06],
      getRadius: (d: ComponentTelemetry) => Math.max(120, (d.water_depth_cm || 0) * 16),
      getFillColor: (d: ComponentTelemetry) => {
        if (d.status === "CRITICAL" || (d.failure_risk_score || 0) > 65) return [239, 68, 68, 190];
        if (d.status === "WARNING" || (d.failure_risk_score || 0) > 35) return [245, 158, 11, 190];
        if (d.component_type === "PUMP") return [6, 182, 212, 190];
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
  }, [components, selectedComponentId]);

  // 2. 3D Extruded Building Towers (Differentiated Physical Heights)
  const columnsLayer = useMemo(() => {
    if (!show3DColumns || !components.length) return null;

    return new ColumnLayer({
      id: "3d-building-columns",
      data: components,
      getPosition: (d: ComponentTelemetry) => [d.longitude || 72.85, d.latitude || 19.06],
      getElevation: (d: ComponentTelemetry) => {
        const depth = d.water_depth_cm || 0;
        const risk = d.failure_risk_score || 0;
        // Physical visual scaling: Subways shoot up, safe roads stay grounded
        const waterHeight = depth * 35;
        const riskHeight = risk * 12;
        const baseHeight = d.component_type === "HOTSPOT" ? 180 : (d.component_type === "ROAD" ? 120 : 90);
        return viewMode === "3D" ? baseHeight + waterHeight + riskHeight : 0;
      },
      elevationScale: 1,
      radius: (d: ComponentTelemetry) => d.component_type === "HOTSPOT" ? 160 : (d.component_type === "PUMP" ? 210 : 130),
      diskResolution: 32,
      extruded: viewMode === "3D",
      getFillColor: (d: ComponentTelemetry) => {
        if (d.component_id === selectedComponentId) return [0, 242, 254, 255]; // Selected Neon Cyan
        if (d.component_type === "PUMP") return [6, 182, 212, 245]; // SPS Cyan
        if (d.status === "CRITICAL" || (d.failure_risk_score || 0) > 65) return [239, 68, 68, 245]; // Critical Red
        if (d.status === "WARNING" || (d.failure_risk_score || 0) > 35) return [245, 158, 11, 245]; // Warning Amber
        if (d.component_type === "DRAIN") return [14, 165, 233, 245]; // Drain Blue
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

  // 3. Clean Billboard Text Tags (Prioritizes Key Hotspots & Selected Node)
  const textTagsLayer = useMemo(() => {
    if (!components.length) return null;

    // Filter to avoid clutter: show Critical hotspots, Subways, SPS stations, or currently selected node
    const filtered = components.filter((d) => {
      if (d.component_id === selectedComponentId) return true;
      if (d.status === "CRITICAL" || (d.water_depth_cm || 0) > 30) return true;
      if (d.component_type === "PUMP") return true;
      return false;
    });

    return new TextLayer({
      id: "floating-text-tags",
      data: filtered,
      getPosition: (d: ComponentTelemetry) => {
        const depth = d.water_depth_cm || 0;
        const risk = d.failure_risk_score || 0;
        const baseHeight = d.component_type === "HOTSPOT" ? 180 : 100;
        const height = viewMode === "3D" ? baseHeight + depth * 35 + risk * 12 + 60 : 0;
        return [d.longitude || 72.85, d.latitude || 19.06, height];
      },
      getText: (d: ComponentTelemetry) => {
        const nameClean = (d.name || "Hotspot").split("/")[0].split("(")[0].trim();
        const depth = Math.round(d.water_depth_cm || 0);
        return `${nameClean} (${depth}cm)`;
      },
      getSize: 11,
      getColor: [255, 255, 255, 255],
      getTextAnchor: "middle",
      getAlignmentBaseline: "bottom",
      background: true,
      getBackgroundColor: (d: ComponentTelemetry) => {
        if (d.component_id === selectedComponentId) return [2, 132, 199, 240];
        if (d.status === "CRITICAL") return [185, 28, 28, 230];
        if (d.status === "WARNING") return [217, 119, 6, 230];
        if (d.component_type === "PUMP") return [8, 145, 178, 230];
        return [4, 120, 87, 230];
      },
      backgroundPadding: [5, 3, 5, 3],
      pickable: true,
      onClick: (info: any) => info.object && onSelectComponent(info.object),
    });
  }, [components, selectedComponentId, viewMode]);

  // 4. Arterial Roads
  const roadsLayer = useMemo(() => {
    if (!showRoads) return null;
    return new PathLayer({
      id: "mumbai-roads",
      data: MUMBAI_ROADS,
      getPath: (d) => d.path,
      getColor: (d) => d.color,
      getWidth: (d) => d.width,
      widthUnits: "meters",
      capRounded: true,
      jointRounded: true,
      pickable: false,
    });
  }, [showRoads]);

  // 5. Storm Drains & Nallahs
  const drainsLayer = useMemo(() => {
    if (!showDrains) return null;
    return new PathLayer({
      id: "mumbai-drains",
      data: MUMBAI_DRAINS,
      getPath: (d) => d.path,
      getColor: (d) => d.color,
      getWidth: (d) => d.width,
      widthUnits: "meters",
      capRounded: true,
      jointRounded: true,
      pickable: false,
    });
  }, [showDrains]);

  // 6. 3D Discharge Arcs
  const arcsLayer = useMemo(() => {
    if (!showArcs || viewMode !== "3D") return null;
    return new ArcLayer({
      id: "discharge-arcs",
      data: DISCHARGE_ARCS,
      getSourcePosition: (d) => d.source,
      getTargetPosition: (d) => d.target,
      getSourceColor: [239, 68, 68, 240],
      getTargetColor: [6, 182, 212, 240],
      getWidth: 4,
      getHeight: 0.45,
      pickable: false,
    });
  }, [showArcs, viewMode]);

  const layers = [roadsLayer, drainsLayer, arcsLayer, groundRadarLayer, columnsLayer, textTagsLayer].filter(Boolean);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      <DeckGL
        viewState={viewState}
        onViewStateChange={(e: any) => setViewState(e.viewState)}
        controller={{ dragRotate: true, touchRotate: true, inertia: true }}
        layers={layers}
        onError={() => {}}
      >
        <Map
          mapLib={maplibregl as any}
          mapStyle={mapStyle as any}
          attributionControl={false}
        >
          <NavigationControl position="bottom-right" showCompass={true} showZoom={true} />
        </Map>
      </DeckGL>

      {/* Floating Tactical Layer & Camera Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-950/95 backdrop-blur-xl p-1.5 rounded-xl border border-slate-800 shadow-2xl text-xs text-slate-200">
        {/* Basemap Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapTheme("DARK"); }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
              mapTheme === "DARK" ? "bg-slate-700 text-white shadow-md shadow-slate-900/50" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Cyber Dark Gray Canvas (Esri Dark Canvas)"
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

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        {/* 360° Drone Flyover Orbit Toggle */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOrbiting(!isOrbiting); }}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all border ${
            isOrbiting
              ? "bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20 animate-pulse"
              : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
          }`}
        >
          {isOrbiting ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
          <span>360° Drone Orbit</span>
        </button>
      </div>
    </div>
  );
};
