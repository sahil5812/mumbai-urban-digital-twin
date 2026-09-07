"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CloudRain,
  Sun,
  CloudSun,
  Cloud,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ArrowUpRight,
  Radio,
  Sliders,
  Zap,
  MapPin,
  Filter,
  CheckCircle2
} from "lucide-react";
import { LiveTelemetry } from "../lib/api";

interface MinuteCastViewProps {
  currentRainfallMmHr?: number;
  currentTideLevelM?: number;
  liveTelemetry: LiveTelemetry | null;
  onSimulateScenario?: (scenarioName: string, rain: number, tide: number, silt: number) => void;
  onOpenMap?: () => void;
}

interface MinuteEntry {
  minuteId: number;
  time: string;
  hourNum: number;
  minuteNum: number;
  condition: "No Precipitation" | "Light Rain" | "Moderate Rain" | "Heavy Downpour";
  icon: string;
  rainMmHr: number;
  hasRain: boolean;
  isStartOfRain?: boolean;
  locationName: string;
  ward: string;
  corridor: "WESTERN" | "CENTRAL" | "THANE_MUMBRA" | "HARBOUR" | "CITYWIDE";
}

interface IntervalGroup {
  id: string;
  title: string;
  startMinute: number;
  endMinute: number;
  hasRain: boolean;
  minutes: MinuteEntry[];
}

const CHRONIC_HOTSPOTS = [
  { name: "Milan Subway (Santacruz)", ward: "H/W", corridor: "WESTERN" as const },
  { name: "Andheri Subway (SV Road)", ward: "K/W", corridor: "WESTERN" as const },
  { name: "Khar Subway & Linking Road", ward: "H/W", corridor: "WESTERN" as const },
  { name: "Hindmata Cinema Junction", ward: "F/S", corridor: "CENTRAL" as const },
  { name: "Gandhi Market (King's Circle)", ward: "F/N", corridor: "CENTRAL" as const },
  { name: "Sion Circle & SIES Lowline", ward: "F/N", corridor: "CENTRAL" as const },
  { name: "Kurla Kamani & LBS Marg", ward: "L", corridor: "CENTRAL" as const },
  { name: "Malad Subway & SV Road", ward: "P/N", corridor: "WESTERN" as const },
  { name: "Dahisar Subway & WEH", ward: "R/N", corridor: "WESTERN" as const },
  { name: "Chunabhatti Railway / Sion-Trombay", ward: "L", corridor: "CENTRAL" as const },
  { name: "Mumbra Station Underpass & Bazar", ward: "TMC-1", corridor: "THANE_MUMBRA" as const },
  { name: "Reti Bunder Lowline Basin", ward: "TMC-1", corridor: "THANE_MUMBRA" as const },
  { name: "Kausa Junction & Almas Colony", ward: "TMC-1", corridor: "THANE_MUMBRA" as const },
  { name: "Mankhurd Station Lowline Basin", ward: "M/E", corridor: "HARBOUR" as const },
  { name: "Dadar TT Circle & Tilak Bridge", ward: "F/N", corridor: "CENTRAL" as const },
  { name: "Worli Naka & Dr. AB Road", ward: "G/S", corridor: "CENTRAL" as const },
];

export const MinuteCastView: React.FC<MinuteCastViewProps> = ({
  currentRainfallMmHr = 0,
  currentTideLevelM = 2.4,
  liveTelemetry,
  onSimulateScenario,
  onOpenMap,
}) => {
  // Scenario selector state: 'DRY' | 'INCOMING_18M' | 'NORMAL' | 'HEAVY'
  const [activeScenario, setActiveScenario] = useState<"DRY" | "INCOMING_18M" | "NORMAL" | "HEAVY">(() => {
    if (currentRainfallMmHr >= 70) return "HEAVY";
    if (currentRainfallMmHr > 0) return "NORMAL";
    return "INCOMING_18M"; // Default matches the user's reference screenshot where rain starts at 10:55 AM!
  });

  // Selected Corridor Filter: 'ALL' | 'WESTERN' | 'CENTRAL' | 'THANE_MUMBRA'
  const [selectedCorridor, setSelectedCorridor] = useState<"ALL" | "WESTERN" | "CENTRAL" | "THANE_MUMBRA">("ALL");

  // Keep in sync if parent passes live rainfall
  useEffect(() => {
    if (currentRainfallMmHr >= 70) setActiveScenario("HEAVY");
    else if (currentRainfallMmHr > 0) setActiveScenario("NORMAL");
  }, [currentRainfallMmHr]);

  // Expanded Accordions State:
  // By default, expand "8:40 AM - 9:09 AM" and "10:40 AM - 11:09 AM" (matching user's screenshots 2 & 3)
  const [expandedIntervals, setExpandedIntervals] = useState<Set<string>>(
    new Set(["8:40 AM - 9:09 AM", "10:40 AM - 11:09 AM"])
  );

  const toggleInterval = (title: string) => {
    setExpandedIntervals((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const expandAll = () => {
    const allTitles = INTERVAL_GROUPS.map((g) => g.title);
    setExpandedIntervals(new Set(allTitles));
  };

  const collapseAll = () => {
    setExpandedIntervals(new Set());
  };

  // Filter: 'ALL' or 'RAIN_ONLY'
  const [filterRainOnly, setFilterRainOnly] = useState<boolean>(false);

  // Radar Animation Loop State
  const [isRadarPlaying, setIsRadarPlaying] = useState<boolean>(true);
  const [radarPlaybackFrame, setRadarPlaybackFrame] = useState<number>(45); // 0 to 100%

  useEffect(() => {
    if (!isRadarPlaying) return;
    const interval = setInterval(() => {
      setRadarPlaybackFrame((prev) => (prev + 1.2) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, [isRadarPlaying]);

  // Interactive Graph Scrubber (0 to 120 minutes)
  const [scrubberMinute, setScrubberMinute] = useState<number>(18);

  // Generate 240 Minutes of MinuteCast Data (from 8:10 AM to 12:09 PM)
  // Matching the user's uploaded AccuWeather screenshots:
  // - 8:10 AM - 10:54 AM: No Precipitation (Sun & Partly Cloudy icons)
  // - 10:55 AM: Rain starts ("Light Rain") with vibrant green accent indicator!
  // - 10:55 AM - 12:09 PM: Continuous Light Rain across specific Mumbai corridors
  const ALL_MINUTES: MinuteEntry[] = useMemo(() => {
    const list: MinuteEntry[] = [];
    let curHour = 8;
    let curMin = 10;

    for (let i = 0; i < 240; i++) {
      const formattedMin = curMin < 10 ? `0${curMin}` : `${curMin}`;
      const period = curHour >= 12 ? "PM" : "AM";
      const displayHour = curHour > 12 ? curHour - 12 : curHour;
      const timeStr = `${displayHour}:${formattedMin} ${period}`;

      let hasRain = false;
      let condition: MinuteEntry["condition"] = "No Precipitation";
      let icon = "☀️";
      let rainMmHr = 0;
      let isStartOfRain = false;
      let locationName = "Mumbai Metropolitan (All Areas Clear)";
      let ward = "Citywide";
      let corridor: MinuteEntry["corridor"] = "CITYWIDE";

      if (activeScenario === "DRY") {
        hasRain = false;
        condition = "No Precipitation";
        icon = i % 5 === 0 ? "🌤️" : "☀️";
        rainMmHr = 0;
        locationName = "Mumbai Metropolitan (Dry Baseline)";
        ward = "All Wards";
        corridor = "CITYWIDE";
      } else if (activeScenario === "INCOMING_18M") {
        // Matches user's screenshots: Rain starts at 10:55 AM (which is minute index 165)
        const rainStartIndex = 165; // 10:55 AM
        if (i < rainStartIndex) {
          hasRain = false;
          condition = "No Precipitation";
          if (i > 140) icon = "☁️"; // Clouding over before rain
          else if (i % 4 === 0) icon = "🌤️";
          else icon = "☀️";
          rainMmHr = 0;
          locationName = "Mumbai Metropolitan (Pre-Rain Standby)";
          ward = "Citywide";
          corridor = "CITYWIDE";
        } else {
          hasRain = true;
          condition = i > 205 ? "Moderate Rain" : "Light Rain";
          icon = "🌧️";
          rainMmHr = i > 205 ? 8.5 : 2.4;
          if (i === rainStartIndex) isStartOfRain = true;

          // Realistic convective storm cell trajectory along Mumbai:
          const rainOffset = i - rainStartIndex;
          if (rainOffset < 10) {
            // Minutes 0 to 9 of rain (10:55 to 11:04 AM): Western coastal subways
            const spot = CHRONIC_HOTSPOTS[rainOffset % 3]; // Milan, Andheri, Khar
            locationName = spot.name;
            ward = spot.ward;
            corridor = spot.corridor;
          } else if (rainOffset < 25) {
            // Minutes 10 to 24 of rain (11:05 to 11:19 AM): Central saucer basins
            const centralSpots = [
              CHRONIC_HOTSPOTS[3], // Hindmata
              CHRONIC_HOTSPOTS[4], // Gandhi Market
              CHRONIC_HOTSPOTS[5], // Sion Circle
              CHRONIC_HOTSPOTS[6], // Kurla
            ];
            const spot = centralSpots[rainOffset % centralSpots.length];
            locationName = spot.name;
            ward = spot.ward;
            corridor = spot.corridor;
          } else if (rainOffset < 45) {
            // Minutes 25 to 44 of rain (11:20 to 11:39 AM): Thane & Mumbra corridor
            const tmcSpots = [
              CHRONIC_HOTSPOTS[10], // Mumbra Underpass
              CHRONIC_HOTSPOTS[11], // Reti Bunder
              CHRONIC_HOTSPOTS[12], // Kausa
            ];
            const spot = tmcSpots[rainOffset % tmcSpots.length];
            locationName = spot.name;
            ward = spot.ward;
            corridor = spot.corridor;
          } else {
            // Widespread over all chronic corridors
            const spot = CHRONIC_HOTSPOTS[rainOffset % CHRONIC_HOTSPOTS.length];
            locationName = spot.name;
            ward = spot.ward;
            corridor = spot.corridor;
          }
        }
      } else if (activeScenario === "NORMAL") {
        // Active Monsoon from the start
        hasRain = true;
        condition = i % 20 < 10 ? "Light Rain" : "Moderate Rain";
        icon = "🌧️";
        rainMmHr = i % 20 < 10 ? 4.5 : 12.0;
        if (i === 0) isStartOfRain = true;
        const spot = CHRONIC_HOTSPOTS[i % CHRONIC_HOTSPOTS.length];
        locationName = spot.name;
        ward = spot.ward;
        corridor = spot.corridor;
      } else if (activeScenario === "HEAVY") {
        // Heavy Downpour
        hasRain = true;
        condition = "Heavy Downpour";
        icon = "⛈️";
        rainMmHr = 42.0;
        if (i === 0) isStartOfRain = true;
        const spot = CHRONIC_HOTSPOTS[i % CHRONIC_HOTSPOTS.length];
        locationName = spot.name;
        ward = spot.ward;
        corridor = spot.corridor;
      }

      list.push({
        minuteId: i,
        time: timeStr,
        hourNum: curHour,
        minuteNum: curMin,
        condition,
        icon,
        rainMmHr,
        hasRain,
        isStartOfRain,
        locationName,
        ward,
        corridor,
      });

      curMin++;
      if (curMin >= 60) {
        curMin = 0;
        curHour++;
      }
    }

    return list;
  }, [activeScenario]);

  // Group minutes into 30-minute intervals (matching user's screenshots)
  const INTERVAL_GROUPS: IntervalGroup[] = useMemo(() => {
    const groups: IntervalGroup[] = [];
    const intervalSize = 30;

    for (let i = 0; i < ALL_MINUTES.length; i += intervalSize) {
      const slice = ALL_MINUTES.slice(i, i + intervalSize);
      if (!slice.length) break;
      const startTime = slice[0].time;
      const endTime = slice[slice.length - 1].time;
      const title = `${startTime} - ${endTime}`;
      const hasRain = slice.some((m) => m.hasRain);

      groups.push({
        id: `interval-${i}`,
        title,
        startMinute: i,
        endMinute: i + slice.length - 1,
        hasRain,
        minutes: slice,
      });
    }

    return groups;
  }, [ALL_MINUTES]);

  // Dynamic Headline
  const headline = useMemo(() => {
    if (activeScenario === "DRY") {
      return "No precipitation for at least 120 min";
    }
    if (activeScenario === "INCOMING_18M") {
      return "Light rain starting at approx 10:55 AM (Milan & Andheri Subways in 18 min)";
    }
    if (activeScenario === "NORMAL") {
      return "Precipitation continuing for at least 120 min (Active Normal Monsoon across Subways)";
    }
    return "Heavy torrential downpour continuing across Western & Central corridors";
  }, [activeScenario]);

  // 120-Minute chart slice for the top graph
  const chartMinutes = useMemo(() => ALL_MINUTES.slice(0, 120), [ALL_MINUTES]);

  return (
    <div className="w-full h-full overflow-y-auto bg-transparent text-slate-100 p-3 sm:p-6 font-sans select-none">
      <div className="max-w-4xl mx-auto space-y-4 pb-20">

        {/* Tactical Scenario Quick-Tester Bar */}
        <div className="glass-panel p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs border border-white/15 shadow-[0_12px_28px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 pl-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-bold text-slate-200 uppercase tracking-wider font-mono text-[11px]">
              MINUTECAST® PREDICTION ENGINE
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveScenario("DRY");
                onSimulateScenario?.("Dry Baseline", 0, 2.4, 15);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeScenario === "DRY"
                  ? "bg-emerald-600/40 border border-emerald-400/70 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  : "glass-button text-slate-300 hover:text-white"
              }`}
            >
              ☀️ Clear (Dry)
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScenario("INCOMING_18M");
                onSimulateScenario?.("Storm Landfall (+18m)", 15, 3.8, 30);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeScenario === "INCOMING_18M"
                  ? "bg-amber-600/40 border border-amber-400/70 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse"
                  : "glass-button text-slate-300 hover:text-white"
              }`}
              title="Rain starts at 10:55 AM (Reference Screenshots)"
            >
              ⚡ Rain in 18m (10:55 AM)
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScenario("NORMAL");
                onSimulateScenario?.("Normal Monsoon", 35, 2.5, 20);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeScenario === "NORMAL"
                  ? "bg-cyan-600/40 border border-cyan-400/70 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "glass-button text-slate-300 hover:text-white"
              }`}
            >
              🌧️ Normal Rain (35 mm/h)
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScenario("HEAVY");
                onSimulateScenario?.("Heavy Downpour", 95, 4.2, 50);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeScenario === "HEAVY"
                  ? "bg-red-600/40 border border-red-400/70 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  : "glass-button text-slate-300 hover:text-white"
              }`}
            >
              🚨 Heavy (95 mm/h)
            </button>
          </div>
        </div>

        {/* CARD 1: ACCUWEATHER-STYLE 120-MINUTE PRECIPITATION TIMELINE (Frosted Acrylic) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.7)]">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight glass-text-title flex items-center gap-2">
                <span>{headline}</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <span className="text-lg">🌤️</span>
                <span className="font-semibold">7:00 AM • No Precipitation</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 self-start sm:self-auto">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white glass-text-title">
                29°
              </span>
              <div className="text-xs text-slate-300 font-medium leading-tight">
                <div>RealFeel®</div>
                <div className="text-white font-bold font-mono">37°</div>
              </div>
            </div>
          </div>

          {/* 120-Minute Precipitation Timeline Graph */}
          <div className="relative w-full h-36 bg-black/25 rounded-2xl p-3 border border-white/10 flex flex-col justify-between overflow-hidden">
            {/* Y-Axis Labels */}
            <div className="absolute left-3 top-2.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Heavy
            </div>
            <div className="absolute left-3 bottom-8 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Light
            </div>

            {/* Background Grid Lines */}
            <div className="absolute inset-x-12 top-6 h-px bg-white/10 border-dashed border-t border-white/15" />
            <div className="absolute inset-x-12 top-16 h-px bg-white/10 border-dashed border-t border-white/15" />
            <div className="absolute inset-x-12 bottom-7 h-px bg-white/20" />

            {/* Interactive Minute Bars */}
            <div className="relative flex-1 mx-12 flex items-end justify-between pt-6 pb-2 gap-0.5">
              {chartMinutes.map((m, idx) => {
                let barHeight = 4; // baseline height
                let barColor = "bg-white/15";

                if (m.hasRain) {
                  if (m.condition === "Heavy Downpour") {
                    barHeight = 78;
                    barColor = "bg-gradient-to-t from-red-500 to-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]";
                  } else if (m.condition === "Moderate Rain") {
                    barHeight = 52;
                    barColor = "bg-gradient-to-t from-amber-500 to-yellow-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]";
                  } else {
                    barHeight = 28;
                    barColor = "bg-gradient-to-t from-cyan-500 to-sky-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]";
                  }
                }

                const isSelected = idx === scrubberMinute;

                return (
                  <div
                    key={m.minuteId}
                    onClick={() => setScrubberMinute(idx)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                    title={`${m.time}: ${m.condition} at ${m.locationName} (${m.rainMmHr} mm/h)`}
                  >
                    <div
                      style={{ height: `${barHeight}%` }}
                      className={`w-full rounded-t-sm transition-all ${barColor} ${
                        isSelected ? "ring-2 ring-white scale-110" : "group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                );
              })}

              {/* Scrubber Needle Indicator */}
              <div
                style={{ left: `${(scrubberMinute / 120) * 100}%` }}
                className="absolute top-0 bottom-6 w-0.5 bg-cyan-300 pointer-events-none shadow-[0_0_8px_rgba(6,182,212,1)] z-10"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 -ml-1 -mt-1 shadow-[0_0_10px_rgba(6,182,212,1)]" />
              </div>
            </div>

            {/* X-Axis Time Labels */}
            <div className="flex justify-between mx-12 text-[10px] font-mono text-slate-400 pt-1 border-t border-white/10">
              <span>8:00 AM</span>
              <span>8:30 AM</span>
              <span>9:00 AM</span>
              <span>9:30 AM</span>
              <span>10:00 AM</span>
            </div>
          </div>

          {/* Graph Legend (Exact match to AccuWeather screenshot) */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-slate-300 pt-3.5 mt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 rounded-sm bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />
              <span>Rain</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 rounded-sm bg-blue-500" />
              <span>Snow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 rounded-sm bg-cyan-400" />
              <span>Ice</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 rounded-sm bg-purple-500" />
              <span>Mix</span>
            </div>
          </div>
        </div>

        {/* CARD 2: MUMBAI WEATHER RADAR (Exact Match to Screenshot Image 2) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.7)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-white font-bold glass-text-title">
                MUMBAI WEATHER RADAR
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenMap}
              className="glass-button px-3 py-1 rounded-xl text-xs font-bold text-cyan-300 flex items-center gap-1.5 hover:text-white transition-all"
              title="Open in full 3D Digital Twin Map"
            >
              <span>Full 3D Twin</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Radar Map Frame with Live Simulation Radar Echoes */}
          <div className="relative w-full h-64 sm:h-72 bg-slate-950 rounded-2xl overflow-hidden border border-white/15 shadow-inner">
            {/* Background Simulated World/Regional Coastline Base */}
            <div
              className="absolute inset-0 opacity-40 bg-cover bg-center"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 45% 45%, rgba(6,182,212,0.15) 0%, transparent 60%), linear-gradient(to right, #091e3a 0%, #1e3a5f 100%)",
              }}
            />

            {/* Doppler Radar Sweep Beam Line */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `conic-gradient(from ${radarPlaybackFrame * 3.6}deg at 50% 50%, rgba(6,182,212,0.3) 0deg, rgba(6,182,212,0) 50deg)`,
              }}
            />

            {/* Radar Sweep Echo Blobs over Mumbai Coordinates */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-48 h-48 rounded-full border border-cyan-500/20 animate-ping" />
              <div className="absolute w-32 h-32 rounded-full border border-cyan-400/30" />
              <div className="absolute w-16 h-16 rounded-full border border-cyan-400/40" />

              {/* Convective Rain Cell over Western Coast */}
              {activeScenario !== "DRY" && (
                <div className="absolute left-[38%] top-[40%] w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500/35 via-amber-500/45 to-red-500/50 blur-xl animate-pulse" />
              )}
            </div>

            {/* Zoom Controls Top-Left */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
              <button
                type="button"
                className="glass-button p-1.5 rounded-lg text-slate-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="glass-button p-1.5 rounded-lg text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Radar Playback Loop Bar at Bottom */}
            <div className="absolute bottom-3 inset-x-3 z-10 glass-panel p-2 rounded-xl flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => setIsRadarPlaying(!isRadarPlaying)}
                className="glass-button-primary p-1.5 rounded-lg text-white"
                title={isRadarPlaying ? "Pause Radar Loop" : "Play Radar Loop"}
              >
                {isRadarPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <div className="flex-1 flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-300 whitespace-nowrap">8:05 AM</span>
                <div className="flex-1 relative h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <div
                    style={{ width: `${radarPlaybackFrame}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 rounded-full transition-all"
                  />
                </div>
                <span className="text-[10px] font-mono text-cyan-300 font-bold whitespace-nowrap">11:45 AM IST</span>
              </div>

              <button
                type="button"
                onClick={onOpenMap}
                className="glass-button p-1.5 rounded-lg text-slate-300 hover:text-white"
                title="Expand Full View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Radar Legend (Exact match to screenshot) */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-slate-300 pt-3.5 mt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 rounded-sm bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />
              <span>Rain</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 rounded-sm bg-blue-500" />
              <span>Snow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 rounded-sm bg-cyan-400" />
              <span>Ice</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 rounded-sm bg-purple-500" />
              <span>Mix</span>
            </div>
          </div>
        </div>

        {/* CARD 3: 30-MINUTE INTERVAL ACCORDIONS WITH HYPERLOCAL LOCATIONS */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.7)] space-y-3">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold glass-text-title">
                MINUTE-BY-MINUTE PRECIPITATION FEED (WITH PRECISE LOCATIONS)
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFilterRainOnly(!filterRainOnly)}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  filterRainOnly
                    ? "bg-cyan-600/40 border border-cyan-400/60 text-cyan-200"
                    : "glass-button text-slate-300 hover:text-white"
                }`}
              >
                {filterRainOnly ? "Show All Minutes" : "Rain Only"}
              </button>
              <button
                type="button"
                onClick={expandAll}
                className="glass-button px-2.5 py-1 rounded-xl text-slate-300 hover:text-white"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="glass-button px-2.5 py-1 rounded-xl text-slate-300 hover:text-white"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Corridor Filter Quick Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" />
              Corridor:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCorridor("ALL")}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                selectedCorridor === "ALL"
                  ? "bg-cyan-600/40 text-cyan-200 border border-cyan-400/50 shadow-sm"
                  : "glass-button text-slate-400 hover:text-white"
              }`}
            >
              All Mumbai Locations
            </button>
            <button
              type="button"
              onClick={() => setSelectedCorridor("WESTERN")}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                selectedCorridor === "WESTERN"
                  ? "bg-cyan-600/40 text-cyan-200 border border-cyan-400/50 shadow-sm"
                  : "glass-button text-slate-400 hover:text-white"
              }`}
            >
              📍 Western (Milan / Andheri / Khar)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCorridor("CENTRAL")}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                selectedCorridor === "CENTRAL"
                  ? "bg-cyan-600/40 text-cyan-200 border border-cyan-400/50 shadow-sm"
                  : "glass-button text-slate-400 hover:text-white"
              }`}
            >
              📍 Central (Hindmata / Kurla / Sion)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCorridor("THANE_MUMBRA")}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                selectedCorridor === "THANE_MUMBRA"
                  ? "bg-cyan-600/40 text-cyan-200 border border-cyan-400/50 shadow-sm"
                  : "glass-button text-slate-400 hover:text-white"
              }`}
            >
              📍 Thane & Mumbra (Station / Reti Bunder)
            </button>
          </div>

          {/* List of 30-Minute Interval Accordions */}
          <div className="space-y-2">
            {INTERVAL_GROUPS.map((group) => {
              const isExpanded = expandedIntervals.has(group.title);
              
              // Filter minutes by Rain and selected Corridor
              const displayedMinutes = group.minutes.filter((m) => {
                if (filterRainOnly && !m.hasRain) return false;
                if (selectedCorridor !== "ALL" && m.hasRain && m.corridor !== selectedCorridor) return false;
                return true;
              });

              if (!displayedMinutes.length && (filterRainOnly || selectedCorridor !== "ALL")) return null;

              return (
                <div
                  key={group.id}
                  className="rounded-2xl border border-white/10 overflow-hidden glass-panel-subtle transition-all"
                >
                  {/* Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleInterval(group.title)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-white tracking-wide">
                        {group.title}
                      </span>
                      {group.hasRain && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 animate-pulse flex items-center gap-1">
                          <CloudRain className="w-3 h-3 text-cyan-300" />
                          Precipitation Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-[10px] font-mono">{displayedMinutes.length} mins</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Accordion Content: Every Single Minute Row with Location */}
                  {isExpanded && (
                    <div className="border-t border-white/10 divide-y divide-white/5 bg-black/15">
                      {displayedMinutes.map((m) => {
                        return (
                          <div
                            key={m.minuteId}
                            className={`px-4 py-2 flex items-center justify-between gap-2 text-xs transition-colors hover:bg-white/[0.04] ${
                              m.hasRain
                                ? "border-l-4 border-emerald-400 bg-emerald-500/[0.06] text-slate-100"
                                : "text-slate-300"
                            }`}
                          >
                            {/* Col 1: Time */}
                            <div className="w-20 sm:w-24 font-mono font-bold text-slate-200 text-xs shrink-0">
                              {m.time}
                            </div>

                            {/* Col 2: Condition & Icon */}
                            <div className="flex items-center gap-2 min-w-[130px] sm:min-w-[170px] shrink-0">
                              <span className="text-base shrink-0">{m.icon}</span>
                              <span
                                className={`font-semibold text-xs ${
                                  m.hasRain ? "text-emerald-300 font-bold" : "text-slate-300"
                                }`}
                              >
                                {m.condition}
                              </span>
                              {m.isStartOfRain && (
                                <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-500/30 text-emerald-200 border border-emerald-400/60 animate-bounce whitespace-nowrap">
                                  ⚡ INITIATED
                                </span>
                              )}
                            </div>

                            {/* Col 3: Hyperlocal Location Name - ONLY shown when rain is active! */}
                            <div className="flex-1 flex items-center justify-start sm:justify-center px-1 overflow-hidden">
                              {m.hasRain ? (
                                <button
                                  type="button"
                                  onClick={onOpenMap}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono transition-all cursor-pointer group bg-cyan-950/60 border border-cyan-400/40 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.2)] font-semibold hover:border-cyan-300 hover:text-white"
                                  title={`Simulate & View ${m.locationName} on 3D Digital Twin Map`}
                                >
                                  <MapPin className="w-3 h-3 shrink-0 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] group-hover:scale-110 transition-transform" />
                                  <span className="truncate max-w-[140px] sm:max-w-[240px]">
                                    {m.locationName}
                                  </span>
                                  <span className="hidden md:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-300 border border-cyan-400/30">
                                    {m.ward}
                                  </span>
                                </button>
                              ) : null}
                            </div>

                            {/* Col 4: Rain Rate */}
                            <div className="w-16 sm:w-20 text-right font-mono text-[11px] shrink-0">
                              {m.hasRain ? (
                                <span className="text-cyan-300 font-bold">
                                  {m.rainMmHr.toFixed(1)} mm/h
                                </span>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
