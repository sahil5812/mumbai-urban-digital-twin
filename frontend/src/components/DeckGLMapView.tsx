"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer, ArcLayer, PathLayer, TextLayer } from "@deck.gl/layers";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ComponentTelemetry } from "../lib/types";
import { Layers, Rotate3d, Route, Waves, Radio, Play, Pause, Compass, Sun, Moon, Satellite, Zap, AlertTriangle } from "lucide-react";

const MUMBAI_ROADS = [
  { id: "WEH", name: "Western Express Highway", path: [[72.8450, 19.0550], [72.8520, 19.0900], [72.8580, 19.1300], [72.8650, 19.1800], [72.8600, 19.2400]], width: 35, color: [59, 130, 246, 250] },
  { id: "EEH", name: "Eastern Express Highway", path: [[72.8650, 19.0300], [72.8800, 19.0600], [72.9150, 19.1200], [72.9550, 19.1700], [72.9700, 19.2200]], width: 35, color: [99, 102, 241, 250] },
  { id: "SVR", name: "Swami Vivekanand (SV) Road", path: [[72.8380, 19.0500], [72.8395, 19.0832], [72.8441, 19.1194], [72.8460, 19.1865], [72.8550, 19.2350]], width: 25, color: [249, 115, 22, 250] },
  { id: "LBS", name: "LBS Marg", path: [[72.8750, 19.0550], [72.8880, 19.0700], [72.9100, 19.1100], [72.9350, 19.1500], [72.9500, 19.1800]], width: 22, color: [14, 165, 233, 250] },
  { id: "BAR", name: "Dr. B.A. Road (Hindmata Corridor)", path: [[72.8330, 18.9600], [72.8380, 18.9900], [72.8432, 19.0125], [72.8550, 19.0400], [72.8620, 19.0600]], width: 26, color: [6, 182, 212, 250] },
  { id: "MDR", name: "Marine Drive", path: [[72.8220, 18.9250], [72.8235, 18.9420], [72.8180, 18.9550]], width: 26, color: [0, 245, 212, 250] },
  { id: "BKC", name: "BKC Connector", path: [[72.8550, 19.0600], [72.8680, 19.0660], [72.8780, 19.0640]], width: 24, color: [103, 232, 249, 250] },
  { id: "MBR_HWY", name: "Old Mumbai-Pune Hwy (Mumbra Corridor)", path: [[72.9700, 19.2200], [72.9950, 19.2100], [73.0180, 19.1950], [73.0229, 19.1906], [73.0298, 19.1764], [73.0380, 19.1550]], width: 30, color: [234, 179, 8, 250] },
  { id: "MBR_BYP", name: "Mumbra Bypass Road (Elevated Parsik)", path: [[72.9900, 19.2050], [73.0080, 19.1980], [73.0120, 19.1950], [73.0195, 19.1700], [73.0350, 19.1550]], width: 28, color: [34, 197, 94, 250] },
];

const MUMBAI_DRAINS = [
  { id: "MITHI", name: "Mithi River Main Channel", path: [[72.8950, 19.1200], [72.8800, 19.0900], [72.8680, 19.0700], [72.8550, 19.0550], [72.8350, 19.0450], [72.8250, 19.0400]], width: 55, color: [30, 144, 255, 250] },
  { id: "VAKOLA", name: "Vakola Nallah", path: [[72.8650, 19.0900], [72.8600, 19.0780], [72.8550, 19.0650]], width: 28, color: [0, 191, 255, 250] },
  { id: "IRLA", name: "Irla Nallah", path: [[72.8420, 19.1250], [72.8350, 19.1100], [72.8280, 19.1000]], width: 24, color: [72, 209, 204, 250] },
  { id: "GAZDAR", name: "Gazdarband Nallah", path: [[72.8400, 19.0880], [72.8320, 19.0820], [72.8240, 19.0800]], width: 24, color: [127, 255, 212, 250] },
  { id: "MBR_CREEK", name: "Mumbra Creek & Reti Bunder Outfall", path: [[73.0300, 19.1850], [73.0229, 19.1906], [73.0180, 19.1960], [73.0165, 19.1995]], width: 38, color: [16, 185, 129, 250] },
  { id: "PARSIK_NAL", name: "Parsik Hill Cascade Storm Nallah", path: [[73.0350, 19.2050], [73.0280, 19.1980], [73.0229, 19.1906]], width: 26, color: [52, 211, 153, 250] },
];

const DISCHARGE_ARCS = [
  { name: "Hindmata -> Britannia SPS Discharge", source: [72.8432, 19.0125], target: [72.8445, 18.9920] },
  { name: "Milan Subway -> Gazdarband Outfall", source: [72.8395, 19.0832], target: [72.8260, 19.0780] },
  { name: "Andheri Subway -> Irla Outfall", source: [72.8441, 19.1194], target: [72.8270, 19.1080] },
  { name: "Kurla LBS -> Mithi River Surge", source: [72.8800, 19.0700], target: [72.8350, 19.0450] },
  { name: "Mumbra Station -> Reti Bunder SPS", source: [73.0229, 19.1906], target: [73.0160, 19.1980] },
  { name: "Kausa Junction -> Reti Bunder Outfall", source: [73.0298, 19.1764], target: [73.0165, 19.1995] },
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
  rainfall_mm_hr = 0,
  tide_level_m = 2.4,
}) => {
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [showDrains, setShowDrains] = useState<boolean>(true);
  const [showArcs, setShowArcs] = useState<boolean>(true);
  const [showRadarScan, setShowRadarScan] = useState<boolean>(true);

  // Continuous animation phase for Live Moving Radar Markers (0 to 1 loop, 60fps)
  const [pulsePhase, setPulsePhase] = useState<number>(0);

  useEffect(() => {
    let animId: number;
    const animate = () => {
      setPulsePhase((prev) => (prev + 0.016) % 1);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Basemap Theme: 'DARK' | 'SATELLITE' | 'STREET'
  const [mapTheme, setMapTheme] = useState<"DARK" | "SATELLITE" | "STREET">("STREET");

  // 360° Cinematic Orbit State
  const [isOrbiting, setIsOrbiting] = useState<boolean>(false);

  // Camera State - Centered to span Mumbai, Thane & Mumbra
  const [viewState, setViewState] = useState({
    longitude: 72.8950,
    latitude: 19.1050,
    zoom: 11.2,
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

  // Helper: Severity calculation (Normal <15mm/h, Moderate 15-40mm/h, Heavy >40mm/h or Critical flood)
  const getSeverity = (d: ComponentTelemetry) => {
    const depth = d.water_depth_cm || 0;
    const isCrit = d.status === "CRITICAL" || depth >= 45 || rainfall_mm_hr >= 50;
    const isWarn = d.status === "WARNING" || depth >= 15 || (rainfall_mm_hr >= 15 && rainfall_mm_hr < 50);

    if (isCrit) return "HEAVY_CRITICAL";
    if (isWarn) return "MODERATE_WARNING";
    return "NORMAL_SAFE";
  };

  // Filter components that should display animated moving radar markers
  // ONLY locations where rain is actively accumulating water live (>0 mm/h and depth > 0)
  const activeRainHotspots = useMemo(() => {
    if (!components.length || rainfall_mm_hr <= 0) return [];
    
    // Strictly filter ONLY for spots where rain is actively causing waterlogging!
    return components.filter((d) => {
      const depth = d.water_depth_cm || 0;
      return depth > 0;
    });
  }, [components, rainfall_mm_hr]);

  // 1. Primary Live Moving Animated Radar Ripple Layer (Expanding Concentric Wave Ring)
  const radarPulseWaveLayer = useMemo(() => {
    if (!showRadarScan || !activeRainHotspots.length) return null;

    return new ScatterplotLayer({
      id: "live-radar-moving-wave-1",
      data: activeRainHotspots,
      getPosition: (d: ComponentTelemetry) => [d.longitude || 72.85, d.latitude || 19.06],
      getRadius: (d: ComponentTelemetry) => {
        const base = Math.max(160, ((d.water_depth_cm || 0) * 12) + (rainfall_mm_hr * 4));
        return base * (1 + pulsePhase * 1.8);
      },
      getLineColor: (d: ComponentTelemetry) => {
        const sev = getSeverity(d);
        const alpha = Math.floor((1 - pulsePhase) * 230);
        if (d.component_id === selectedComponentId) return [0, 242, 254, alpha];
        if (sev === "HEAVY_CRITICAL") return [239, 68, 68, alpha]; // Dangerous Crimson Red
        if (sev === "MODERATE_WARNING") return [245, 158, 11, alpha]; // Warning Amber
        return [6, 182, 212, alpha]; // Normal Rain Cyan
      },
      getFillColor: (d: ComponentTelemetry) => {
        const sev = getSeverity(d);
        const alpha = Math.floor((1 - pulsePhase) * 45);
        if (d.component_id === selectedComponentId) return [0, 242, 254, alpha];
        if (sev === "HEAVY_CRITICAL") return [239, 68, 68, alpha];
        if (sev === "MODERATE_WARNING") return [245, 158, 11, alpha];
        return [6, 182, 212, alpha];
      },
      lineWidthMinPixels: 2.5,
      stroked: true,
      filled: true,
      pickable: false,
      updateTriggers: {
        getRadius: [pulsePhase, rainfall_mm_hr],
        getLineColor: [pulsePhase, rainfall_mm_hr, selectedComponentId],
        getFillColor: [pulsePhase, rainfall_mm_hr, selectedComponentId],
      }
    });
  }, [activeRainHotspots, showRadarScan, pulsePhase, rainfall_mm_hr, selectedComponentId]);

  // 2. Secondary Trailing Radar Wave (Offset phase by 0.5 for continuous double-ring sonar wave)
  const radarSecondaryPulseLayer = useMemo(() => {
    if (!showRadarScan || !activeRainHotspots.length) return null;
    const p2 = (pulsePhase + 0.5) % 1;

    return new ScatterplotLayer({
      id: "live-radar-moving-wave-2",
      data: activeRainHotspots,
      getPosition: (d: ComponentTelemetry) => [d.longitude || 72.85, d.latitude || 19.06],
      getRadius: (d: ComponentTelemetry) => {
        const base = Math.max(160, ((d.water_depth_cm || 0) * 12) + (rainfall_mm_hr * 4));
        return base * (1 + p2 * 1.8);
      },
      getLineColor: (d: ComponentTelemetry) => {
        const sev = getSeverity(d);
        const alpha = Math.floor((1 - p2) * 190);
        if (d.component_id === selectedComponentId) return [0, 242, 254, alpha];
        if (sev === "HEAVY_CRITICAL") return [239, 68, 68, alpha];
        if (sev === "MODERATE_WARNING") return [245, 158, 11, alpha];
        return [6, 182, 212, alpha];
      },
      getFillColor: (d: ComponentTelemetry) => {
        const sev = getSeverity(d);
        const alpha = Math.floor((1 - p2) * 30);
        if (d.component_id === selectedComponentId) return [0, 242, 254, alpha];
        if (sev === "HEAVY_CRITICAL") return [239, 68, 68, alpha];
        if (sev === "MODERATE_WARNING") return [245, 158, 11, alpha];
        return [6, 182, 212, alpha];
      },
      lineWidthMinPixels: 1.8,
      stroked: true,
      filled: true,
      pickable: false,
      updateTriggers: {
        getRadius: [p2, rainfall_mm_hr],
        getLineColor: [p2, rainfall_mm_hr, selectedComponentId],
        getFillColor: [p2, rainfall_mm_hr, selectedComponentId],
      }
    });
  }, [activeRainHotspots, showRadarScan, pulsePhase, rainfall_mm_hr, selectedComponentId]);

  // 3. Central Solid Core Pin Markers (With subtle rhythmic size breathing)
  const stationMarkersLayer = useMemo(() => {
    if (!components.length || !showMarkers) return null;

    return new ScatterplotLayer({
      id: "station-point-markers",
      data: components,
      getPosition: (d: ComponentTelemetry) => [d.longitude || 72.85, d.latitude || 19.06],
      getRadius: (d: ComponentTelemetry) => {
        const base = d.component_id === selectedComponentId ? 240 : 170;
        // Subtle heartbeat ONLY on spots where rain is actively accumulating!
        const isRainingHere = (d.water_depth_cm || 0) > 0 && rainfall_mm_hr > 0;
        const breath = isRainingHere ? Math.sin(pulsePhase * Math.PI * 2) * 20 : 0;
        return base + breath;
      },
      getFillColor: (d: ComponentTelemetry) => {
        if (d.component_id === selectedComponentId) return [0, 242, 254, 255]; // Selected Neon Cyan
        const depth = d.water_depth_cm || 0;
        const isRainingHere = depth > 0 && rainfall_mm_hr > 0;

        if (isRainingHere) {
          const sev = getSeverity(d);
          if (sev === "HEAVY_CRITICAL") return [239, 68, 68, 255]; // Dangerous Crimson Red
          if (sev === "MODERATE_WARNING") return [245, 158, 11, 255]; // Warning Amber
          return [6, 182, 212, 240]; // Normal Rain Active Cyan
        }

        // Dry / Safe spots stay standard static colors
        if (d.component_type === "PUMP") return [6, 182, 212, 245]; // SPS Cyan
        if (d.component_type === "DRAIN") return [14, 165, 233, 245]; // Drain Blue
        return [16, 185, 129, 250]; // Safe Emerald
      },
      getLineColor: [255, 255, 255, 255],
      lineWidthMinPixels: 2.5,
      stroked: true,
      filled: true,
      radiusMinPixels: 8,
      radiusMaxPixels: 20,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 180],
      onClick: (info: any) => info.object && onSelectComponent(info.object),
      updateTriggers: {
        getRadius: [pulsePhase, rainfall_mm_hr, selectedComponentId],
        getFillColor: [rainfall_mm_hr, selectedComponentId],
      }
    });
  }, [components, selectedComponentId, showMarkers, pulsePhase, rainfall_mm_hr]);

  // 4. Dynamic Status Text Badges Anchored Right Above Markers
  const textTagsLayer = useMemo(() => {
    if (!components.length || !showMarkers) return null;

    const ANCHOR_HUBS = new Set(["HOT_HND_01", "HOT_MLN_01", "HOT_AND_01", "HOT_KRL_01", "HOT_TMC_MBR_01", "HOT_DAH_01"]);

    const filtered = components.filter((d) => {
      if (d.component_id === selectedComponentId) return true;
      if (rainfall_mm_hr > 0 && (d.water_depth_cm || 0) > 0) return true; // Only show active rain tags on spots taking water!
      if (d.status === "CRITICAL" || d.status === "WARNING" || (d.water_depth_cm || 0) >= 15) return true;
      if (ANCHOR_HUBS.has(d.component_id)) return true;
      return false;
    });

    return new TextLayer({
      id: "floating-text-tags",
      data: filtered,
      getPosition: (d: ComponentTelemetry) => [d.longitude || 72.85, d.latitude || 19.06, 0],
      pixelOffset: [0, -18],
      getText: (d: ComponentTelemetry) => {
        const nameClean = (d.name || "Hotspot").split("/")[0].split("(")[0].trim();
        const depth = Math.round(d.water_depth_cm || 0);
        const sev = getSeverity(d);
        
        if (sev === "HEAVY_CRITICAL") {
          return `🚨 ${nameClean} (${depth}cm - DANGER)`;
        }
        if (sev === "MODERATE_WARNING") {
          return `⚠️ ${nameClean} (${depth}cm - WARNING)`;
        }
        if (rainfall_mm_hr > 0 && depth > 0) {
          return `🌧️ ${nameClean} (${depth}cm)`;
        }
        return nameClean;
      },
      getSize: 11,
      getColor: [255, 255, 255, 255],
      getTextAnchor: "middle",
      getAlignmentBaseline: "bottom",
      background: true,
      getBackgroundColor: (d: ComponentTelemetry) => {
        if (d.component_id === selectedComponentId) return [2, 132, 199, 245];
        const sev = getSeverity(d);
        if (sev === "HEAVY_CRITICAL") return [185, 28, 28, 240];
        if (sev === "MODERATE_WARNING") return [217, 119, 6, 240];
        if (rainfall_mm_hr > 0) return [8, 145, 178, 235];
        if (d.component_type === "PUMP") return [8, 145, 178, 230];
        return [15, 23, 42, 225];
      },
      backgroundPadding: [6, 3, 6, 3],
      pickable: true,
      onClick: (info: any) => info.object && onSelectComponent(info.object),
      updateTriggers: {
        getText: [rainfall_mm_hr],
        getBackgroundColor: [rainfall_mm_hr, selectedComponentId],
      }
    });
  }, [components, selectedComponentId, showMarkers, rainfall_mm_hr]);

  // 5. Arterial Roads
  const roadsLayer = useMemo(() => {
    if (!showRoads) return null;
    return new PathLayer({
      id: "mumbai-roads",
      data: MUMBAI_ROADS,
      getPath: (d) => d.path,
      getColor: (d) => d.color,
      getWidth: (d) => d.width,
      widthMinPixels: 3,
      widthMaxPixels: 8,
      capRounded: true,
      jointRounded: true,
      pickable: true,
    });
  }, [showRoads]);

  // 6. Drainage Network
  const drainsLayer = useMemo(() => {
    if (!showDrains) return null;
    return new PathLayer({
      id: "mumbai-drains",
      data: MUMBAI_DRAINS,
      getPath: (d) => d.path,
      getColor: (d) => d.color,
      getWidth: (d) => d.width,
      widthMinPixels: 4,
      widthMaxPixels: 10,
      capRounded: true,
      jointRounded: true,
      pickable: true,
    });
  }, [showDrains]);

  // 7. 3D Discharge Arcs
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

  const layers = [
    roadsLayer, 
    drainsLayer, 
    arcsLayer, 
    radarPulseWaveLayer, 
    radarSecondaryPulseLayer, 
    stationMarkersLayer, 
    textTagsLayer
  ].filter(Boolean);

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
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 glass-panel p-1.5 rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] text-xs text-slate-100 border border-white/15">
        {/* Basemap Switcher */}
        <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapTheme("DARK"); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              mapTheme === "DARK" ? "bg-slate-700/80 text-white shadow-[0_0_10px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] border border-white/20" : "text-slate-400 hover:text-slate-100"
            }`}
            title="Cyber Dark Gray Canvas (Esri Dark Canvas)"
          >
            <Moon className="w-3 h-3" />
            <span>Cyber</span>
          </button>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapTheme("SATELLITE"); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              mapTheme === "SATELLITE" ? "bg-blue-700/80 text-white shadow-[0_0_10px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] border border-blue-400/40" : "text-slate-400 hover:text-slate-100"
            }`}
            title="Photorealistic Satellite Imagery (Esri World Satellite)"
          >
            <Satellite className="w-3 h-3" />
            <span>Satellite</span>
          </button>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapTheme("STREET"); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              mapTheme === "STREET" ? "bg-cyan-600/80 text-white shadow-[0_0_12px_rgba(6,182,212,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] border border-cyan-400/50" : "text-slate-400 hover:text-slate-100"
            }`}
            title="Daylight Urban Street Map (Esri Street Map)"
          >
            <Sun className="w-3 h-3" />
            <span>Street</span>
          </button>
        </div>

        <div className="h-5 w-px bg-white/15 mx-0.5" />

        {/* Live Animated Radar Marker Toggle Button */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowRadarScan(!showRadarScan); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            showRadarScan
              ? "bg-cyan-600/35 border-cyan-400/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold animate-pulse"
              : "glass-button text-slate-300 hover:text-white font-medium"
          }`}
          title="Toggle Live Animated Doppler Radar Wave Markers"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400 drop-shadow-sm" />
          <span>Radar Waves</span>
        </button>

        {/* Layer Visibility Toggles */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMarkers(!showMarkers); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            showMarkers
              ? "bg-emerald-600/35 border-emerald-400/60 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold"
              : "glass-button text-slate-300 hover:text-white font-medium"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-400 drop-shadow-sm" />
          <span>Markers</span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowRoads(!showRoads); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            showRoads
              ? "bg-blue-600/35 border-blue-400/60 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold"
              : "glass-button text-slate-300 hover:text-white font-medium"
          }`}
        >
          <Route className="w-3.5 h-3.5 text-blue-400 drop-shadow-sm" />
          <span>Roads</span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDrains(!showDrains); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            showDrains
              ? "bg-cyan-600/35 border-cyan-400/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold"
              : "glass-button text-slate-300 hover:text-white font-medium"
          }`}
        >
          <Waves className="w-3.5 h-3.5 text-cyan-400 drop-shadow-sm" />
          <span>Drains</span>
        </button>

        <div className="h-5 w-px bg-white/15 mx-0.5" />

        {/* 360° Drone Flyover Orbit Toggle */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOrbiting(!isOrbiting); }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
            isOrbiting
              ? "bg-cyan-500/35 border-cyan-400/70 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] animate-pulse"
              : "glass-button text-slate-200 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
          }`}
        >
          {isOrbiting ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
          <span>360° Drone Orbit</span>
        </button>
      </div>
    </div>
  );
};
