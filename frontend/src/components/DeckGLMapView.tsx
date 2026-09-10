"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer, ArcLayer, PathLayer, TextLayer, GeoJsonLayer } from "@deck.gl/layers";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ComponentTelemetry, SafeRouteResponse, DEMGridResponse } from "../lib/types";
import { fetchSafeRoute, fetchDEMGrid, fetchRecentCitizenReports, fetchRoadNetworkGeoJSON, fetchWardZonesGeoJSON, CitizenReportRecord } from "../lib/api";
import { Layers, Rotate3d, Route, Waves, Radio, Play, Pause, Compass, Sun, Moon, Satellite, Zap, AlertTriangle, Navigation, ShieldCheck, ShieldAlert, Clock, ArrowRight, X } from "lucide-react";


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
  { id: "VAKOLA", name: "Vakola Nallah (Santacruz to BKC)", path: [[72.8650, 19.0900], [72.8600, 19.0780], [72.8550, 19.0650]], width: 28, color: [0, 191, 255, 250] },
  { id: "POISAR", name: "Poisar River (Kandivali to Marve)", path: [[72.8650, 19.2050], [72.8520, 19.2080], [72.8380, 19.2150], [72.8220, 19.2220]], width: 35, color: [14, 165, 233, 250] },
  { id: "OSHIWARA", name: "Oshiwara River (Goregaon to Malad)", path: [[72.8680, 19.1550], [72.8550, 19.1520], [72.8410, 19.1480], [72.8250, 19.1500]], width: 32, color: [6, 182, 212, 250] },
  { id: "DAHISAR", name: "Dahisar River (National Park to Gorai)", path: [[72.8750, 19.2450], [72.8600, 19.2520], [72.8450, 19.2580], [72.8350, 19.2520]], width: 28, color: [56, 189, 248, 250] },
  { id: "IRLA", name: "Irla Nallah (Andheri to Juhu Outfall)", path: [[72.8420, 19.1250], [72.8350, 19.1100], [72.8280, 19.1000]], width: 24, color: [72, 209, 204, 250] },
  { id: "GAZDAR", name: "Gazdarband Nallah (Khar Danda)", path: [[72.8400, 19.0880], [72.8320, 19.0820], [72.8240, 19.0800]], width: 24, color: [127, 255, 212, 250] },
  { id: "HND_CONDUIT", name: "Hindmata Storm Conduit to Britannia", path: [[72.8432, 19.0125], [72.8400, 19.0050], [72.8350, 18.9980], [72.8445, 18.9920]], width: 26, color: [168, 85, 247, 250] },
  { id: "CHUNABHATTI", name: "Chunabhatti-Kurla Lowline SWD", path: [[72.8750, 19.0550], [72.8680, 19.0600], [72.8580, 19.0620]], width: 24, color: [99, 102, 241, 250] },
  { id: "MAHUL_SWD", name: "Mahul Creek SWD Outfall", path: [[72.8950, 19.0300], [72.9050, 19.0150], [72.9150, 18.9950]], width: 42, color: [30, 64, 175, 250] },
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

const NODE_COORDINATES: Record<string, [number, number]> = {
  RD_MDR_01: [72.8235, 18.9420],
  RD_BAR_01: [72.8432, 19.0125],
  RD_BKC_01: [72.8680, 19.0660],
  RD_WEH_01: [72.8520, 19.0900],
  RD_EEH_01: [72.8800, 19.0600],
  RD_SVR_01: [72.8395, 19.0832],
  RD_LBS_01: [72.8880, 19.0700],
  WL_HND_01: [72.8432, 19.0125],
  WL_MLN_01: [72.8395, 19.0832],
  WL_AND_01: [72.8441, 19.1194],
  WL_KRL_01: [72.8800, 19.0700],
  HOT_TMC_MBR_01: [73.0229, 19.1906],
  RD_TMC_MBR_01: [73.0180, 19.1950],
};

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

  // Flood-Safe Route Navigation State
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(false);
  const [originId, setOriginId] = useState<string>("RD_MDR_01");
  const [destinationId, setDestinationId] = useState<string>("WL_AND_01");
  const [safeRouteResult, setSafeRouteResult] = useState<SafeRouteResponse | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);
  const [showSafeRoute, setShowSafeRoute] = useState<boolean>(true);

  // Citizen Ground Reports State
  const [citizenReports, setCitizenReports] = useState<CitizenReportRecord[]>([]);
  const [showCitizenReports, setShowCitizenReports] = useState<boolean>(true);

  // 120-Segment High-Resolution Road Network & Ward Zones GeoJSON
  const [roadGeoJson, setRoadGeoJson] = useState<any>(null);
  const [wardGeoJson, setWardGeoJson] = useState<any>(null);
  const [showWardZones, setShowWardZones] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    fetchRoadNetworkGeoJSON()
      .then((data) => {
        if (isMounted && data && data.features?.length > 0) {
          setRoadGeoJson(data);
        }
      })
      .catch((err) => console.warn("Failed to load road network GeoJSON:", err));

    fetchWardZonesGeoJSON()
      .then((data) => {
        if (isMounted && data && data.features?.length > 0) {
          setWardGeoJson(data);
        }
      })
      .catch((err) => console.warn("Failed to load ward zones GeoJSON:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadReports = () => {
      fetchRecentCitizenReports()
        .then((reports) => {
          if (isMounted && reports) setCitizenReports(reports);
        })
        .catch((err) => console.warn("Failed to fetch citizen reports:", err));
    };
    loadReports();
    const interval = setInterval(loadReports, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCalculateRoute = async () => {
    setIsCalculatingRoute(true);
    try {
      const res = await fetchSafeRoute(originId, destinationId, rainfall_mm_hr);
      setSafeRouteResult(res);
      setShowSafeRoute(true);
    } catch (e) {
      console.error("Safe route calculation error:", e);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // 2D DEM Surface Runoff Grid State
  const [showDEMGrid, setShowDEMGrid] = useState<boolean>(false);
  const [demGridData, setDemGridData] = useState<DEMGridResponse | null>(null);

  useEffect(() => {
    if (!showDEMGrid) return;
    let isMounted = true;
    fetchDEMGrid(rainfall_mm_hr, tide_level_m)
      .then((data) => {
        if (isMounted) setDemGridData(data);
      })
      .catch(console.error);
    return () => {
      isMounted = false;
    };
  }, [showDEMGrid, rainfall_mm_hr, tide_level_m]);

  const demCellsData = useMemo(() => {
    if (!showDEMGrid || !demGridData) return [];
    const cells: Array<{ position: [number, number]; elevation: number; flowAccum: number; waterDepth: number }> = [];
    const latMin = 18.90;
    const latMax = 19.28;
    const lonMin = 72.80;
    const lonMax = 73.06;
    const { rows, cols, elevation_matrix_m, flow_accumulation_matrix, inundation_depth_matrix_cm } = demGridData;

    const latStep = (latMax - latMin) / rows;
    const lonStep = (lonMax - lonMin) / cols;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lat = latMax - (r + 0.5) * latStep;
        const lon = lonMin + (c + 0.5) * lonStep;
        const elev = elevation_matrix_m[r]?.[c] ?? 3.0;
        const flow = flow_accumulation_matrix[r]?.[c] ?? 1.0;
        const depth = inundation_depth_matrix_cm[r]?.[c] ?? 0.0;

        cells.push({
          position: [lon, lat],
          elevation: elev,
          flowAccum: flow,
          waterDepth: depth,
        });
      }
    }
    return cells;
  }, [showDEMGrid, demGridData]);

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

  // Scientific Severity calculation based on actual node water depth & state
  const getSeverity = (d: ComponentTelemetry) => {
    const depth = d.water_depth_cm || 0;
    // CRITICAL DANGER: severe flooding (depth >= 48cm or status CRITICAL)
    if (d.status === "CRITICAL" || depth >= 48) return "HEAVY_CRITICAL";
    // WARNING: moderate waterlogging (depth >= 28cm or status WARNING)
    if (d.status === "WARNING" || depth >= 28) return "MODERATE_WARNING";
    // NORMAL ACTIVE RAIN: light-to-moderate rain accumulation
    if (depth > 0 && rainfall_mm_hr > 0) return "NORMAL_ACTIVE";
    return "NORMAL_SAFE";
  };

  // Determine if a component is actively accumulating rain and should have a live moving radar mark
  // Strictly excludes static infrastructure (Pumps, Roads, Drains) and dry/unaffected spots!
  const isActiveRainHotspot = (d: ComponentTelemetry) => {
    if (rainfall_mm_hr <= 0) return false;
    
    // Only chronic lowline waterlogging subways/depressions experience live moving radar marks
    // Pumps, roads, and drains are static infrastructure assets!
    if (d.component_type !== "HOTSPOT") return false;

    const depth = d.water_depth_cm || 0;

    // Normal Monsoon (< 50 mm/h):
    // Only the chronic saucer subways that actually submerge (Milan, Andheri, Khar, Malad, Dahisar) with depth >= 28cm
    if (rainfall_mm_hr < 50) {
      return depth >= 28.0;
    }

    // Heavy Downpour / 26-7 Cloudburst (>= 50 mm/h):
    // Severe spots taking critical inundation (depth >= 40cm or CRITICAL/WARNING)
    return depth >= 40.0 || d.status === "CRITICAL" || d.status === "WARNING";
  };

  // Filter components that should display animated moving radar markers
  const activeRainHotspots = useMemo(() => {
    if (!components.length || rainfall_mm_hr <= 0) return [];
    return components.filter(isActiveRainHotspot);
  }, [components, rainfall_mm_hr]);

  // 1. Primary Live Moving Animated Radar Ripple Layer (Expanding Concentric Wave Ring)
  const radarPulseWaveLayer = useMemo(() => {
    if (!showRadarScan || !activeRainHotspots.length) return null;

    return new ScatterplotLayer({
      id: "live-radar-moving-wave-1",
      data: activeRainHotspots,
      getPosition: (d: ComponentTelemetry) => [d.longitude || 72.85, d.latitude || 19.06],
      getRadius: (d: ComponentTelemetry) => {
        const sev = getSeverity(d);
        const isDangerous = sev === "HEAVY_CRITICAL";
        // Dangerous spots have larger, high-velocity shockwaves
        const base = isDangerous ? 260 + (d.water_depth_cm || 0) * 4 : 160 + (d.water_depth_cm || 0) * 2;
        const multiplier = isDangerous ? 2.4 : 1.6;
        return base * (1 + pulsePhase * multiplier);
      },
      getLineColor: (d: ComponentTelemetry) => {
        const sev = getSeverity(d);
        const alpha = Math.floor((1 - pulsePhase) * 230);
        if (d.component_id === selectedComponentId) return [0, 242, 254, alpha];
        if (sev === "HEAVY_CRITICAL") return [239, 68, 68, alpha]; // Dangerous Crimson Red
        if (sev === "MODERATE_WARNING") return [245, 158, 11, alpha]; // Warning Amber
        return [6, 182, 212, alpha]; // Normal Rain Gentle Cyan
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
        const sev = getSeverity(d);
        const isDangerous = sev === "HEAVY_CRITICAL";
        const base = isDangerous ? 260 + (d.water_depth_cm || 0) * 4 : 160 + (d.water_depth_cm || 0) * 2;
        const multiplier = isDangerous ? 2.4 : 1.6;
        return base * (1 + p2 * multiplier);
      },
      getLineColor: (d: ComponentTelemetry) => {
        const sev = getSeverity(d);
        const alpha = Math.floor((1 - p2) * 190);
        if (d.component_id === selectedComponentId) return [0, 242, 254, alpha];
        if (sev === "HEAVY_CRITICAL") return [249, 115, 22, alpha]; // Fiery Orange trailing shockwave for Dangerous
        if (sev === "MODERATE_WARNING") return [245, 158, 11, alpha];
        return [56, 189, 248, alpha]; // Sky Blue trailing wave for Normal
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

  // 3. Central Solid Core Pin Markers (With subtle rhythmic size breathing ONLY on active flood spots)
  const stationMarkersLayer = useMemo(() => {
    if (!components.length || !showMarkers) return null;

    return new ScatterplotLayer({
      id: "station-point-markers",
      data: components,
      getPosition: (d: ComponentTelemetry) => [d.longitude || 72.85, d.latitude || 19.06],
      getRadius: (d: ComponentTelemetry) => {
        const base = d.component_id === selectedComponentId ? 250 : 170;
        
        // Heartbeat / breathing ONLY on active rain hotspots!
        const isMovingHotspot = isActiveRainHotspot(d);
        if (!isMovingHotspot) return base; // completely static for all other 35+ components!

        const sev = getSeverity(d);
        // Urgent heartbeat for heavy dangerous rain, gentle breath for normal rain
        const amplitude = sev === "HEAVY_CRITICAL" ? 24 : 12;
        const breath = Math.sin(pulsePhase * Math.PI * 2) * amplitude;
        return base + breath;
      },
      getFillColor: (d: ComponentTelemetry) => {
        if (d.component_id === selectedComponentId) return [0, 242, 254, 255]; // Selected Neon Cyan
        
        const isMovingHotspot = isActiveRainHotspot(d);
        if (isMovingHotspot) {
          const sev = getSeverity(d);
          if (sev === "HEAVY_CRITICAL") return [239, 68, 68, 255]; // Dangerous Crimson Red
          if (sev === "MODERATE_WARNING") return [245, 158, 11, 255]; // Warning Amber
          return [6, 182, 212, 245]; // Normal Rain Active Cyan
        }

        // Dry / Safe spots and static infrastructure retain clean static colors
        if (d.component_type === "PUMP") return [6, 182, 212, 245]; // SPS Cyan
        if (d.component_type === "DRAIN") return [14, 165, 233, 245]; // Drain Blue
        if (d.component_type === "ROAD") return [99, 102, 241, 245]; // Road Indigo
        return [16, 185, 129, 250]; // Safe Emerald Green
      },
      getLineColor: (d: ComponentTelemetry) => {
        if (d.component_id === selectedComponentId) return [255, 255, 255, 255];
        const isMovingHotspot = isActiveRainHotspot(d);
        if (isMovingHotspot && getSeverity(d) === "HEAVY_CRITICAL") {
          return [254, 202, 202, 255]; // High-contrast border for danger
        }
        return [255, 255, 255, 220];
      },
      lineWidthMinPixels: 2.5,
      stroked: true,
      filled: true,
      radiusMinPixels: 8,
      radiusMaxPixels: 22,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 180],
      onClick: (info: any) => info.object && onSelectComponent(info.object),
      updateTriggers: {
        getRadius: [pulsePhase, rainfall_mm_hr, selectedComponentId],
        getFillColor: [rainfall_mm_hr, selectedComponentId],
        getLineColor: [rainfall_mm_hr, selectedComponentId],
      }
    });
  }, [components, selectedComponentId, showMarkers, pulsePhase, rainfall_mm_hr]);

  // 4. Dynamic Status Text Badges Anchored Right Above Markers
  const textTagsLayer = useMemo(() => {
    if (!components.length || !showMarkers) return null;

    const ANCHOR_HUBS = new Set(["HOT_HND_01", "HOT_MLN_01", "HOT_AND_01", "HOT_KRL_01", "HOT_TMC_MBR_01"]);

    const filtered = components.filter((d) => {
      if (d.component_id === selectedComponentId) return true;
      // Show text label ONLY on active moving hotspots where rain is logging water!
      if (isActiveRainHotspot(d)) return true;
      // In dry/calm mode, only show key anchor landmarks
      if (rainfall_mm_hr === 0 && ANCHOR_HUBS.has(d.component_id)) return true;
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
        
        if (isActiveRainHotspot(d)) {
          const sev = getSeverity(d);
          if (sev === "HEAVY_CRITICAL") {
            return `[ALERT] ${nameClean} (${depth}cm)`;
          }
          return `[RAIN] ${nameClean} (${depth}cm)`;
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
        if (isActiveRainHotspot(d)) {
          const sev = getSeverity(d);
          if (sev === "HEAVY_CRITICAL") return [185, 28, 28, 245]; // Dangerous Red
          return [8, 145, 178, 235]; // Normal Rain Active Cyan
        }
        return [15, 23, 42, 220]; // Sleek Dark Slate
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

  // 5. 120-Segment High-Resolution Arterial Road Network (GeoJsonLayer with Dynamic Inundation Heatmap)
  const roadsLayer = useMemo(() => {
    if (!showRoads) return null;

    if (roadGeoJson && roadGeoJson.features && roadGeoJson.features.length > 0) {
      return new GeoJsonLayer({
        id: "mumbai-120-roads-geojson",
        data: roadGeoJson,
        pickable: true,
        stroked: true,
        filled: false,
        lineWidthUnits: "pixels",
        lineWidthMinPixels: 2.5,
        lineWidthMaxPixels: 9,
        getLineWidth: (f: any) => {
          const rId = f.properties?.road_id;
          if (rId === selectedComponentId) return 7.5;
          const comp = components.find((c) => c.component_id === rId);
          const depth = comp ? comp.water_depth_cm : (f.properties?.current_water_depth_cm ?? 0);
          return depth >= 35 ? 6 : (depth >= 15 ? 4.5 : 3);
        },
        getLineColor: (f: any) => {
          const rId = f.properties?.road_id;
          if (rId === selectedComponentId) return [255, 255, 255, 255];
          const comp = components.find((c) => c.component_id === rId);
          const depth = comp ? comp.water_depth_cm : (f.properties?.current_water_depth_cm ?? 0);

          if (depth >= 40) return [239, 68, 68, 250]; // Crimson Red (Submerged)
          if (depth >= 15) return [249, 115, 22, 235]; // Amber Orange (Waterlogged)
          if (depth >= 5) return [234, 179, 8, 210];  // Caution Yellow (Slow)
          return [56, 189, 248, 160]; // Flood-Free Sky Blue
        },
        onClick: (info: any) => {
          if (info.object && info.object.properties?.road_id) {
            const rId = info.object.properties.road_id;
            const comp = components.find((c) => c.component_id === rId);
            if (comp) {
              onSelectComponent(comp);
            } else {
              const depth = info.object.properties.current_water_depth_cm ?? 0;
              const speed = info.object.properties.current_speed_kmh ?? 45;
              onSelectComponent({
                component_id: rId,
                component_type: "ROAD",
                name: info.object.properties.road_name || rId,
                ward: info.object.properties.ward || "H/E",
                health_score: 85.0,
                failure_risk_score: Math.min(100, Math.round((depth / 50.0) * 100)),
                status: depth >= 40 ? "CRITICAL" : (depth >= 15 ? "WARNING" : "SAFE"),
                latitude: info.coordinate ? info.coordinate[1] : 19.07,
                longitude: info.coordinate ? info.coordinate[0] : 72.85,
                elevation_m: info.object.properties.elevation_m || 4.5,
                water_depth_cm: depth,
                pothole_probability: 0.15,
                traffic_speed_kmh: speed,
                traffic_congestion_pct: Math.min(100, (depth / 60) * 100),
                drain_discharge_capacity_cumecs: 0,
                drain_siltation_pct: 35,
                tidal_backflow_blocked: false,
                recommended_action: depth > 20 ? `Deploy dewatering pumps & traffic diversion at ${info.object.properties.road_name}.` : "Standard monitoring.",
                cascading_impact_summary: `Inundation: ${depth} cm | Traffic Speed: ${speed} km/h`,
                metrics: {}
              });
            }
          }
        },
        updateTriggers: {
          getLineColor: [rainfall_mm_hr, components, selectedComponentId],
          getLineWidth: [rainfall_mm_hr, components, selectedComponentId],
        }
      });
    }

    // High-contrast fallback
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
  }, [showRoads, roadGeoJson, components, selectedComponentId, rainfall_mm_hr, onSelectComponent]);

  // Ward Inundation Zones (24 Municipal Ward Polygons)
  const wardZonesLayer = useMemo(() => {
    if (!showWardZones || !wardGeoJson || !wardGeoJson.features?.length) return null;
    return new GeoJsonLayer({
      id: "mumbai-ward-zones",
      data: wardGeoJson,
      pickable: true,
      stroked: true,
      filled: true,
      lineWidthUnits: "pixels",
      lineWidthMinPixels: 1.5,
      getLineColor: [168, 85, 247, 180],
      getFillColor: (f: any) => {
        const cat = f.properties?.risk_category;
        if (cat === "Critical") return [239, 68, 68, 50]; // Translucent red
        if (cat === "High") return [249, 115, 22, 42]; // Translucent amber
        if (cat === "Moderate") return [56, 189, 248, 30]; // Translucent cyan
        return [16, 185, 129, 25]; // Translucent emerald
      },
    });
  }, [showWardZones, wardGeoJson]);


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

  // 8. Flood-Safe Emergency Navigation Route
  const safeRouteLayer = useMemo(() => {
    if (!showSafeRoute || !safeRouteResult || !safeRouteResult.recommended_path?.length) return null;

    const coordinates = safeRouteResult.recommended_path
      .map((nodeId) => NODE_COORDINATES[nodeId])
      .filter((coord): coord is [number, number] => Boolean(coord));

    if (coordinates.length < 2) return null;

    return new PathLayer({
      id: "flood-safe-evacuation-route",
      data: [{ path: coordinates, name: "Flood-Safe Evacuation Corridor" }],
      getPath: (d: any) => d.path,
      getColor: [16, 185, 129, 255], // Glowing Emerald Green
      getWidth: 45,
      widthMinPixels: 6,
      widthMaxPixels: 14,
      capRounded: true,
      jointRounded: true,
      pickable: true,
      autoHighlight: true,
      highlightColor: [52, 211, 153, 200],
    });
  }, [showSafeRoute, safeRouteResult]);

  // 9. Safe Route Waypoints Layer
  const safeRouteWaypointsLayer = useMemo(() => {
    if (!showSafeRoute || !safeRouteResult || !safeRouteResult.recommended_path?.length) return null;

    const points = safeRouteResult.recommended_path
      .map((nodeId, idx) => {
        const coord = NODE_COORDINATES[nodeId];
        if (!coord) return null;
        const name = safeRouteResult.path_waypoints?.[idx] || nodeId;
        return { coord, name, isOrigin: idx === 0, isDest: idx === safeRouteResult.recommended_path.length - 1 };
      })
      .filter((p): p is { coord: [number, number]; name: string; isOrigin: boolean; isDest: boolean } => Boolean(p));

    return new ScatterplotLayer({
      id: "safe-route-waypoints",
      data: points,
      getPosition: (d: any) => d.coord,
      getRadius: (d: any) => (d.isOrigin || d.isDest ? 320 : 200),
      radiusMinPixels: 8,
      radiusMaxPixels: 18,
      getFillColor: (d: any) => (d.isOrigin ? [59, 130, 246, 255] : d.isDest ? [16, 185, 129, 255] : [52, 211, 153, 240]),
      getLineColor: [255, 255, 255, 255],
      lineWidthMinPixels: 2.5,
      stroked: true,
      filled: true,
      pickable: true,
    });
  }, [showSafeRoute, safeRouteResult]);

  // 10. Avoided Flood Hazards Pins (Red Warning Rings on Bypassed Subways)
  const avoidedHazardsLayer = useMemo(() => {
    if (!showSafeRoute || !safeRouteResult?.submerged_hazards_avoided?.length) return null;

    return new ScatterplotLayer({
      id: "avoided-submerged-hazards",
      data: safeRouteResult.submerged_hazards_avoided,
      getPosition: (d: any) => NODE_COORDINATES[d.node_id] || [72.84, 19.05],
      getRadius: 380,
      radiusMinPixels: 12,
      radiusMaxPixels: 28,
      getFillColor: [239, 68, 68, 60],
      getLineColor: [239, 68, 68, 255],
      lineWidthMinPixels: 2.5,
      stroked: true,
      filled: true,
      pickable: true,
    });
  }, [showSafeRoute, safeRouteResult]);

  // 11. 2D DEM Surface Runoff Flow Grid Layer
  const demGridLayer = useMemo(() => {
    if (!showDEMGrid || !demCellsData.length) return null;

    return new ScatterplotLayer({
      id: "dem-surface-flow-grid",
      data: demCellsData,
      getPosition: (d: any) => d.position,
      getRadius: 680,
      radiusMinPixels: 8,
      radiusMaxPixels: 35,
      getFillColor: (d: any) => {
        if (d.waterDepth > 30) {
          const alpha = Math.min(220, Math.floor(110 + (d.waterDepth / 120) * 110));
          return [30, 64, 175, alpha]; // Deep Inundated Blue
        }
        if (d.waterDepth > 5) {
          return [6, 182, 212, 160]; // Flowing Cyan
        }
        if (d.elevation > 25) return [74, 222, 128, 70]; // Ridge Emerald Green
        if (d.elevation < 2.2) return [245, 158, 11, 80]; // Saucer Depression Amber
        return [148, 163, 184, 40]; // Neutral Ground Gray
      },
      getLineColor: (d: any) => (d.waterDepth > 15 ? [6, 182, 212, 200] : [255, 255, 255, 50]),
      lineWidthMinPixels: 1,
      stroked: true,
      filled: true,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 120],
    });
  }, [showDEMGrid, demCellsData]);

  // 12. Citizen Ground Grievance Markers Layer (Potholes, Blocked Drains, Waterlogging Reports)
  const citizenReportsHaloLayer = useMemo(() => {
    if (!showCitizenReports || !citizenReports.length) return null;

    return new ScatterplotLayer({
      id: "citizen-reports-halos",
      data: citizenReports,
      getPosition: (d: CitizenReportRecord) => [d.longitude || 72.84, d.latitude || 19.05],
      getRadius: 380 + Math.sin(pulsePhase * Math.PI * 2) * 80,
      radiusMinPixels: 14,
      radiusMaxPixels: 30,
      getFillColor: [239, 68, 68, 45],
      getLineColor: (d: CitizenReportRecord) =>
        d.severity === "CRITICAL" ? [239, 68, 68, 200] : [245, 158, 11, 180],
      lineWidthMinPixels: 1.5,
      stroked: true,
      filled: true,
      pickable: false,
      updateTriggers: {
        getRadius: [pulsePhase],
      },
    });
  }, [showCitizenReports, citizenReports, pulsePhase]);

  const citizenReportsLayer = useMemo(() => {
    if (!showCitizenReports || !citizenReports.length) return null;

    return new ScatterplotLayer({
      id: "citizen-reports-markers",
      data: citizenReports,
      getPosition: (d: CitizenReportRecord) => [d.longitude || 72.84, d.latitude || 19.05],
      getRadius: 220,
      radiusMinPixels: 7,
      radiusMaxPixels: 18,
      getFillColor: (d: CitizenReportRecord) => {
        if (d.category === "POTHOLE") return [239, 68, 68, 240]; // Crimson Red
        if (d.category === "WATERLOGGING") return [245, 158, 11, 240]; // Amber
        return [168, 85, 247, 240]; // Purple (Drain Blockage)
      },
      getLineColor: [255, 255, 255, 255],
      lineWidthMinPixels: 2,
      stroked: true,
      filled: true,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 220],
    });
  }, [showCitizenReports, citizenReports]);

  const layers = [
    wardZonesLayer,
    demGridLayer,
    roadsLayer, 
    drainsLayer, 
    arcsLayer, 
    safeRouteLayer,
    safeRouteWaypointsLayer,
    avoidedHazardsLayer,
    citizenReportsHaloLayer,
    citizenReportsLayer,
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
        getTooltip={({ object }: any) => {
          if (!object) return null;

          // 1. Citizen Grievance Marker
          if (object.reporter_name) {
            return {
              html: `<div style="padding: 8px 12px; background: rgba(15,23,42,0.95); backdrop-filter: blur(8px); border: 1px solid rgba(244,63,94,0.5); border-radius: 12px; color: #fff; font-family: monospace; font-size: 11px; max-width: 260px; box-shadow: 0 10px 25px rgba(0,0,0,0.6);">
                <div style="color: #fb7185; font-weight: bold; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                  📢 CITIZEN REPORT #${object.id || "NEW"}
                </div>
                <div style="font-weight: 600; color: #f8fafc; font-size: 12px;">${object.landmark}</div>
                <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">Ward: ${object.ward || "General"} | Severity: <span style="color: ${object.severity === 'CRITICAL' ? '#f87171' : '#fbbf24'}">${object.severity}</span></div>
                <div style="margin-top: 4px; color: #38bdf8; font-size: 10px;">Depth: ${object.estimated_water_depth_cm ?? 0} cm (${object.category})</div>
                <div style="margin-top: 4px; color: #cbd5e1; font-style: italic; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">"${object.description}"</div>
              </div>`,
            };
          }

          // 2. High-Resolution 120 Arterial Road LineString
          if (object.properties?.road_id) {
            const rId = object.properties.road_id;
            const comp = components.find((c) => c.component_id === rId);
            const depth = comp ? comp.water_depth_cm : (object.properties.current_water_depth_cm ?? 0);
            const status = comp ? comp.status : (depth >= 40 ? 'CRITICAL' : depth >= 15 ? 'WARNING' : 'SAFE');
            const speed = comp ? comp.traffic_speed_kmh : Math.max(8, Math.round(45 * (1 - depth / 85)));
            const statusColor = status === 'CRITICAL' ? '#f87171' : status === 'WARNING' ? '#fbbf24' : '#38bdf8';
            return {
              html: `<div style="padding: 9px 13px; background: rgba(15,23,42,0.96); backdrop-filter: blur(10px); border: 1px solid ${statusColor}; border-radius: 12px; color: #fff; font-family: monospace; font-size: 11px; max-width: 280px; box-shadow: 0 12px 28px rgba(0,0,0,0.7);">
                <div style="color: #38bdf8; font-weight: bold; margin-bottom: 2px;">🛣️ ${object.properties.road_name || rId}</div>
                <div style="color: #94a3b8; font-size: 10px;">ID: ${rId} | Ward: ${object.properties.ward || "General"} | ${object.properties.road_type || "Arterial"}</div>
                <div style="margin-top: 5px; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 4px;">
                  <span>Water Depth: <b style="color: ${statusColor}">${depth} cm</b></span>
                  <span style="color: ${statusColor}">[${status}]</span>
                </div>
                <div style="margin-top: 3px; color: #cbd5e1; font-size: 10px;">Traffic Speed: <b>${speed} km/h</b> | Lanes: ${object.properties.lanes || 6}</div>
                <div style="margin-top: 3px; color: #94a3b8; font-size: 9px; font-style: italic;">Click to inspect road details</div>
              </div>`,
            };
          }

          // 3. Administrative Ward Inundation Polygon
          if (object.properties?.ward_id) {
            return {
              html: `<div style="padding: 8px 12px; background: rgba(15,23,42,0.95); backdrop-filter: blur(8px); border: 1px solid rgba(168,85,247,0.5); border-radius: 12px; color: #fff; font-family: monospace; font-size: 11px; max-width: 260px; box-shadow: 0 10px 25px rgba(0,0,0,0.6);">
                <div style="color: #c084fc; font-weight: bold;">🏛️ Ward ${object.properties.ward_id}: ${object.properties.ward_name}</div>
                <div style="color: #cbd5e1; font-size: 10px; margin-top: 3px;">Vulnerability Score: <b>${object.properties.vulnerability_score}/100</b> (${object.properties.risk_category})</div>
                <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">Chronic Flood Spots: ${object.properties.chronic_flood_spots} | Avg Depth: ${object.properties.avg_flood_depth_m}m</div>
              </div>`,
            };
          }

          // 4. Drainage Channel
          if (object.name && object.path) {
            return {
              html: `<div style="padding: 8px 12px; background: rgba(15,23,42,0.95); backdrop-filter: blur(8px); border: 1px solid rgba(6,182,212,0.5); border-radius: 12px; color: #fff; font-family: monospace; font-size: 11px; max-width: 260px; box-shadow: 0 10px 25px rgba(0,0,0,0.6);">
                <div style="color: #22d3ee; font-weight: bold;">🌊 ${object.name}</div>
                <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">Hydraulic Channel Width: ${object.width}m</div>
              </div>`,
            };
          }

          // 5. Hotspot / Pumping Station Component
          if (object.name && object.type) {
            const depth = object.water_depth_cm ?? 0;
            const status = object.status ?? "SAFE";
            const statusColor = status === 'CRITICAL' ? '#f87171' : status === 'WARNING' ? '#fbbf24' : '#38bdf8';
            return {
              html: `<div style="padding: 8px 12px; background: rgba(15,23,42,0.95); backdrop-filter: blur(8px); border: 1px solid ${statusColor}; border-radius: 12px; color: #fff; font-family: monospace; font-size: 11px; max-width: 280px; box-shadow: 0 10px 25px rgba(0,0,0,0.6);">
                <div style="color: ${statusColor}; font-weight: bold;">📍 ${object.name}</div>
                <div style="color: #94a3b8; font-size: 10px;">ID: ${object.id} | Ward: ${object.ward || "F/S"} | Type: ${object.type}</div>
                <div style="margin-top: 4px; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
                  <span>Water Depth: <b style="color: ${statusColor}">${depth} cm</b></span>
                  <span style="color: ${statusColor}">[${status}]</span>
                </div>
                <div style="margin-top: 2px; color: #cbd5e1; font-size: 10px;">Failure Risk: <b>${object.failure_risk_score ?? 0}%</b> | Elev: ${object.elevation_m ?? 2.0}m</div>
              </div>`,
            };
          }

          if (object.component_name) {
            return {
              html: `<div style="padding: 8px 12px; background: rgba(15,23,42,0.92); backdrop-filter: blur(8px); border: 1px solid rgba(6,182,212,0.4); border-radius: 12px; color: #fff; font-family: monospace; font-size: 11px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <div style="color: #38bdf8; font-weight: bold;">${object.component_name}</div>
                <div style="color: #94a3b8; font-size: 10px;">Type: ${object.component_type} | ID: ${object.component_id}</div>
                <div style="color: #cbd5e1; margin-top: 2px;">Water Depth: <b>${object.water_depth_cm ?? 0} cm</b></div>
              </div>`,
            };
          }
          return null;
        }}

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
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 glass-panel p-1 rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] text-xs text-slate-100 border border-white/15">
        {/* Basemap Switcher */}
        <div className="flex items-center gap-1 bg-white/[0.05] p-0.5 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapTheme("DARK"); }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
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
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
              mapTheme === "SATELLITE" ? "bg-blue-700/80 text-white shadow-[0_0_10px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] border border-blue-400/40" : "text-slate-400 hover:text-slate-100"
            }`}
            title="Photorealistic Satellite Imagery (Esri World Satellite)"
          >
            <Satellite className="w-3 h-3" />
            <span>Sat</span>
          </button>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapTheme("STREET"); }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
              mapTheme === "STREET" ? "bg-cyan-600/80 text-white shadow-[0_0_12px_rgba(6,182,212,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] border border-cyan-400/50" : "text-slate-400 hover:text-slate-100"
            }`}
            title="Daylight Urban Street Map (Esri Street Map)"
          >
            <Sun className="w-3 h-3" />
            <span>Street</span>
          </button>
        </div>

        <div className="h-4 w-px bg-white/15 mx-0.5" />

        {/* Live Animated Radar Marker Toggle Button */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowRadarScan(!showRadarScan); }}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[10.5px] transition-all ${
            showRadarScan
              ? "bg-cyan-600/35 border-cyan-400/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold"
              : "glass-button text-slate-300 hover:text-white font-medium"
          }`}
          title="Toggle Live Animated Doppler Radar Wave Markers"
        >
          <Radio className="w-3 h-3 text-cyan-400 drop-shadow-sm" />
          <span>Radar</span>
        </button>

        {/* Layer Visibility Toggles */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMarkers(!showMarkers); }}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[10.5px] transition-all ${
            showMarkers
              ? "bg-emerald-600/35 border-emerald-400/60 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold"
              : "glass-button text-slate-300 hover:text-white font-medium"
          }`}
          title="Toggle Hotspot Markers"
        >
          <Compass className="w-3 h-3 text-emerald-400 drop-shadow-sm" />
          <span>Markers</span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowRoads(!showRoads); }}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[10.5px] transition-all ${
            showRoads
              ? "bg-blue-600/35 border-blue-400/60 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold"
              : "glass-button text-slate-300 hover:text-white font-medium"
          }`}
          title="Toggle Authentic Major Arterial Highway Corridors"
        >
          <Route className="w-3 h-3 text-blue-400 drop-shadow-sm" />
          <span>Roads</span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDrains(!showDrains); }}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[10.5px] transition-all ${
            showDrains
              ? "bg-cyan-600/35 border-cyan-400/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold"
              : "glass-button text-slate-300 hover:text-white font-medium"
          }`}
          title="Toggle 12 Major Drainage & River Channels"
        >
          <Waves className="w-3 h-3 text-cyan-400 drop-shadow-sm" />
          <span>Drains</span>
        </button>

        {/* Flood-Safe Emergency Navigation Route Toggle */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsRoutePlannerOpen(!isRoutePlannerOpen); }}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[10.5px] transition-all ${
            isRoutePlannerOpen
              ? "bg-emerald-600/35 border-emerald-400/60 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold"
              : "glass-button text-slate-300 hover:text-white font-medium"
          }`}
          title="Toggle Flood-Safe Evacuation Route Navigator"
        >
          <Navigation className="w-3 h-3 text-emerald-400 drop-shadow-sm" />
          <span>Route</span>
        </button>

        {/* 2D DEM Surface Runoff Flow Grid Toggle */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDEMGrid(!showDEMGrid); }}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[10.5px] transition-all ${
            showDEMGrid
              ? "bg-indigo-600/35 border-indigo-400/60 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold"
              : "glass-button text-slate-300 hover:text-white font-medium"
          }`}
          title="Toggle 2D DEM Topographic Surface Runoff Grid"
        >
          <Layers className="w-3 h-3 text-indigo-400 drop-shadow-sm" />
          <span>DEM</span>
        </button>

        {/* 24 Administrative Ward Inundation Zones Toggle */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowWardZones(!showWardZones); }}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[10.5px] transition-all ${
            showWardZones
              ? "bg-purple-600/35 border-purple-400/60 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold"
              : "glass-button text-slate-300 hover:text-white font-medium"
          }`}
          title="Toggle 24 Administrative Ward Inundation Zones"
        >
          <ShieldAlert className="w-3 h-3 text-purple-400 drop-shadow-sm" />
          <span>Wards</span>
        </button>

        {/* Citizen Reports Overlay Toggle */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCitizenReports(!showCitizenReports); }}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[10.5px] transition-all ${
            showCitizenReports
              ? "bg-rose-600/35 border-rose-400/60 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold"
              : "glass-button text-slate-300 hover:text-white font-medium"
          }`}
          title="Toggle Citizen Ground Grievance Pins"
        >
          <AlertTriangle className="w-3 h-3 text-rose-400 drop-shadow-sm" />
          <span>Citizen</span>
        </button>

        <div className="h-4 w-px bg-white/15 mx-0.5" />

        {/* 360° Drone Flyover Orbit Toggle */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOrbiting(!isOrbiting); }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-[10.5px] transition-all border ${
            isOrbiting
              ? "bg-cyan-500/35 border-cyan-400/70 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] animate-pulse"
              : "glass-button text-slate-200 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
          }`}
          title="Toggle 360° Drone Flyover Orbit"
        >
          {isOrbiting ? <Pause className="w-3 h-3 text-cyan-400" /> : <Play className="w-3 h-3 text-cyan-400" />}
          <span>360° Orbit</span>
        </button>
      </div>

      {/* Flood-Safe Route Navigator Drawer (Top-Left) */}
      {isRoutePlannerOpen && (
        <div className="absolute top-4 left-4 z-30 w-80 max-w-[calc(100vw-2rem)] glass-panel p-4 rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.25)] text-xs text-slate-100 backdrop-blur-xl animate-fadeIn flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="tracking-wide uppercase text-[11px]">Flood-Safe Navigator</span>
            </div>
            <button
              onClick={() => setIsRoutePlannerOpen(false)}
              className="glass-button p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Origin Point</label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
              >
                <option value="RD_MDR_01">Marine Drive (RD_MDR_01)</option>
                <option value="RD_BAR_01">Dadar / Dr. B.A. Road (RD_BAR_01)</option>
                <option value="RD_BKC_01">BKC Connector (RD_BKC_01)</option>
                <option value="RD_WEH_01">Western Express Hwy Bandra (RD_WEH_01)</option>
                <option value="RD_EEH_01">Eastern Express Hwy Sion (RD_EEH_01)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Destination Target</label>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
              >
                <option value="WL_AND_01">Andheri Subway Corridor (WL_AND_01)</option>
                <option value="WL_MLN_01">Milan Subway Basin (WL_MLN_01)</option>
                <option value="WL_HND_01">Hindmata Junction (WL_HND_01)</option>
                <option value="WL_KRL_01">Kurla Kamani (WL_KRL_01)</option>
                <option value="HOT_TMC_MBR_01">Mumbra Station Underpass (HOT_TMC_MBR_01)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleCalculateRoute}
              disabled={isCalculatingRoute}
              className="mt-1 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50"
            >
              {isCalculatingRoute ? (
                <span>Computing Dijkstra Path...</span>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Compute Flood-Free Route</span>
                </>
              )}
            </button>
          </div>

          {safeRouteResult && (
            <div className="mt-1 flex flex-col gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-400/30">
                  {safeRouteResult.is_flood_safe ? "FLOOD-SAFE CORRIDOR" : "DIVERTED"}
                </span>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-200">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{safeRouteResult.estimated_transit_time_mins} mins</span>
                </div>
              </div>

              {safeRouteResult.submerged_hazards_avoided?.length > 0 && (
                <div className="bg-red-500/15 border border-red-500/30 p-2 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span>Avoided Submerged Hazards ({safeRouteResult.submerged_hazards_avoided.length})</span>
                  </div>
                  {safeRouteResult.submerged_hazards_avoided.map((h, i) => (
                    <div key={i} className="text-[10px] text-red-200">
                      • {h.name}: <span className="font-mono text-amber-300">{Math.round(h.water_depth_cm)}cm water</span> (Bypassed)
                    </div>
                  ))}
                </div>
              )}

              {safeRouteResult.fallback_advisory && (
                <p className="text-[10px] text-slate-300 italic">
                  Advisory: {safeRouteResult.fallback_advisory}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
