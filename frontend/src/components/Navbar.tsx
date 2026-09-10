"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Activity, Clock, Waves, Compass, AlertTriangle, Radio, CloudRain, Droplets, Wind, CloudSun, MapPin } from "lucide-react";
import { LiveTelemetry } from "../lib/api";

interface NavbarProps {
  viewMode: "2D" | "3D";
  onToggleViewMode: () => void;
  disruptionSeverity: string;
  overallHealth: number;
  highTideWarning: boolean;
  onOpenCitizenModal: () => void;
  onResetSimulation: () => void;
  isLiveMode?: boolean;
  onToggleLiveMode?: () => void;
  liveTelemetry?: LiveTelemetry | null;
  portalViewMode?: "PORTAL" | "MAP";
  onTogglePortalViewMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onToggleViewMode,
  disruptionSeverity,
  overallHealth,
  highTideWarning,
  onOpenCitizenModal,
  onResetSimulation,
  isLiveMode = false,
  onToggleLiveMode,
  liveTelemetry,
  portalViewMode = "MAP",
  onTogglePortalViewMode,
}) => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { hour12: false }) + " IST");
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const isCritical = disruptionSeverity.includes("RED") || disruptionSeverity.includes("HIGH");
  const rainVal = liveTelemetry?.rainfall_mm_hr ?? 0;
  const tideVal = liveTelemetry?.tide_level_m ?? 3.59;
  const tempVal = liveTelemetry?.temperature_c ?? 28.8;
  const humidityVal = liveTelemetry?.humidity_pct ?? 74;
  const windVal = liveTelemetry?.wind_speed_kmh ?? 18;

  return (
    <header className="h-16 bg-slate-950/40 backdrop-blur-2xl border-b border-white/10 px-4 flex items-center justify-between select-none z-30 sticky top-0 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Left: Brand / Crest & Mode Switcher */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/40 via-indigo-600/30 to-cyan-400/40 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/20 shadow-cyan-950/50">
            <ShieldAlert className="w-6 h-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wider text-slate-100 flex items-center gap-1.5 whitespace-nowrap glass-text-title">
                <span>MUMBAI URBAN TWIN</span>
                <span className="text-xs px-1.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-mono backdrop-blur-md shadow-sm">PS010</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap">MCGM / BMC Disaster Management Command Center</p>
          </div>
        </div>

        {/* Unified 2-Way Portal / Map Mode Switcher */}
        {onTogglePortalViewMode && (
          <div className="hidden md:flex items-center p-1 bg-white/[0.06] rounded-xl border border-white/10 backdrop-blur-md shadow-inner">
            <button
              type="button"
              onClick={() => portalViewMode !== "PORTAL" && onTogglePortalViewMode()}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                portalViewMode === "PORTAL"
                  ? "bg-amber-600/80 text-white shadow-[0_0_12px_rgba(245,158,11,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] border border-amber-400/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Switch to Weather & Hydrology Intelligence Portal"
            >
              <CloudSun className="w-3.5 h-3.5 text-amber-300" />
              <span>Weather Portal</span>
            </button>
            <button
              type="button"
              onClick={() => portalViewMode !== "MAP" && onTogglePortalViewMode()}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                portalViewMode === "MAP"
                  ? "bg-cyan-600/80 text-white shadow-[0_0_12px_rgba(6,182,212,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] border border-cyan-400/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Switch to 3D Digital Twin Map View"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-300" />
              <span>3D Twin Map</span>
            </button>
          </div>
        )}
      </div>

      {/* Middle: Live Weather Feed + Telemetry Bar */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onToggleLiveMode && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleLiveMode(); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-md backdrop-blur-xl ${
              isLiveMode
                ? "bg-emerald-950/40 border-emerald-400/50 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]"
                : "glass-button text-slate-300 hover:text-white"
            }`}
            title="Toggle Real-Time Open-Meteo Weather Feed"
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveMode ? "text-emerald-400 animate-pulse" : "text-slate-400"}`} />
            <span className="whitespace-nowrap">{isLiveMode ? "LIVE TELEMETRY ON" : "SIMULATION MODE"}</span>
            {isLiveMode && (
              <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500 text-black font-black rounded-full uppercase">
                REAL-TIME
              </span>
            )}
          </button>
        )}

        {/* Live Weather Metrics Pill */}
        <div className="flex items-center gap-3 bg-white/[0.04] backdrop-blur-xl border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-mono text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          <div className="flex items-center gap-1 text-cyan-300 whitespace-nowrap" title="Precipitation Intensity">
            <CloudRain className="w-3.5 h-3.5" />
            <span>{rainVal} mm/h</span>
          </div>

          <div className="flex items-center gap-1 text-blue-300 whitespace-nowrap" title="Arabian Sea Coastal Tide Level">
            <Waves className="w-3.5 h-3.5" />
            <span>{tideVal}m Tide</span>
          </div>

          <div className="text-amber-300 font-bold whitespace-nowrap" title="Ambient Air Temperature">
            {tempVal}°C
          </div>

          <div className="flex items-center gap-1 text-teal-300 font-semibold bg-teal-950/40 px-2 py-0.5 rounded-lg border border-teal-700/40 whitespace-nowrap backdrop-blur-md" title="Relative Humidity">
            <Droplets className="w-3.5 h-3.5 text-teal-400" />
            <span>Humidity: {humidityVal}%</span>
          </div>

          <div className="hidden 2xl:flex items-center gap-1 text-indigo-300 whitespace-nowrap" title="Wind Velocity">
            <Wind className="w-3.5 h-3.5 text-indigo-400" />
            <span>{windVal} km/h</span>
          </div>
        </div>

        {/* Overall Health Meter */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Health:</span>
          <span className={`font-mono font-bold ${
            overallHealth >= 70 ? "text-emerald-400" : overallHealth >= 45 ? "text-amber-400" : "text-red-400"
          }`}>
            {overallHealth}%
          </span>
        </div>
      </div>

      {/* Right: View Toggle & Citizen Grievance */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleViewMode(); }}
          className="glass-button flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200"
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>VIEW: <strong className="text-cyan-400">{viewMode}</strong></span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenCitizenModal(); }}
          className="glass-button flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600/80 to-rose-600/80 hover:from-red-500/90 hover:to-rose-500/90 text-white text-xs font-medium shadow-[0_4px_20px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border border-red-400/40"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Citizen Report</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-[11px] font-mono text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time}</span>
        </div>
      </div>
    </header>
  );
};
