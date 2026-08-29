"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Activity, Clock, Waves, Compass, AlertTriangle, Radio, CloudRain, Droplets, Wind } from "lucide-react";
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
    <header className="h-16 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-30 sticky top-0 text-white">
      {/* Left: Brand / Crest */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-700 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-wider text-slate-100 flex items-center gap-1.5 whitespace-nowrap">
              <span>MUMBAI URBAN TWIN</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">PS010</span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap">MCGM / BMC Disaster Management Command Center</p>
        </div>
      </div>

      {/* Middle: Live Weather Feed + Telemetry Bar */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onToggleLiveMode && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleLiveMode(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-md ${
              isLiveMode
                ? "bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "bg-slate-900/80 border-slate-700 text-slate-400 hover:border-slate-500"
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
        <div className="flex items-center gap-3 bg-slate-900/90 border border-cyan-800/50 px-3.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 shadow-inner">
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

          <div className="flex items-center gap-1 text-teal-300 font-semibold bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60 whitespace-nowrap" title="Relative Humidity">
            <Droplets className="w-3.5 h-3.5 text-teal-400" />
            <span>Humidity: {humidityVal}%</span>
          </div>

          <div className="hidden 2xl:flex items-center gap-1 text-indigo-300 whitespace-nowrap" title="Wind Velocity">
            <Wind className="w-3.5 h-3.5 text-indigo-400" />
            <span>{windVal} km/h</span>
          </div>
        </div>

        {/* Overall Health Meter */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-all shadow-sm hover:border-blue-500"
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>VIEW: <strong className="text-cyan-400">{viewMode}</strong></span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenCitizenModal(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-medium shadow-md shadow-red-500/20 transition-all border border-red-400/30"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Citizen Report</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time}</span>
        </div>
      </div>
    </header>
  );
};
