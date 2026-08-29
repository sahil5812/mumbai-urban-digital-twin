"use client";

import React, { useState, useEffect } from "react";
import { Zap, Clock, ChevronDown, ChevronUp, Radio, MapPin, Timer } from "lucide-react";
import { LiveTelemetry } from "../lib/api";
import { ComponentTelemetry } from "../lib/types";

interface EarlyWarningBannerProps {
  telemetry: LiveTelemetry | null;
  components?: ComponentTelemetry[];
  currentRainfallMmHr?: number;
  onSimulateRainfall?: (rainMmHr: number) => void;
  onSelectComponent?: (comp: ComponentTelemetry) => void;
}

export const EarlyWarningBanner: React.FC<EarlyWarningBannerProps> = ({
  telemetry,
  components = [],
  currentRainfallMmHr = 0,
  onSimulateRainfall,
  onSelectComponent,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [nowMs, setNowMs] = useState<number>(Date.now());

  // Real-Time 1-Second Clock Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!telemetry) return null;

  // Check if rain is incoming from nowcasting OR if user is actively simulating rain
  const hasIncomingForecast = Boolean(
    telemetry.minutely_forecast?.some((slot) => (slot.rain_mm_hr || 0) > 0) ||
    (telemetry.predicted_rain_in_30m || 0) > 0 ||
    (telemetry.rainfall_mm_hr || 0) > 0 ||
    currentRainfallMmHr > 0
  );

  // Calculate remaining seconds against the target arrival timestamp
  const targetTs = telemetry.target_rain_timestamp_ms || (nowMs + 600000);
  const secondsRemaining = Math.max(0, Math.floor((targetTs - nowMs) / 1000));

  // ONLY DISPLAY IF RAIN IS ACTUALLY INCOMING / ACTIVE
  if (!hasIncomingForecast) {
    return null;
  }

  // Format MM:SS
  const formatCountdown = () => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  const predictedRain = Math.max(telemetry.predicted_rain_in_30m || 0, currentRainfallMmHr || 0);
  const isSevere = predictedRain >= 25.0;

  // DYNAMICALLY derived from Backend ML predictions (Safe immutability)
  const dynamicTargetHotspots = [...components]
    .filter((c) => c.component_type === "HOTSPOT" || (c.water_depth_cm || 0) > 5.0 || (c.failure_risk_score || 0) > 30.0)
    .sort((a, b) => (b.failure_risk_score || 0) - (a.failure_risk_score || 0))
    .slice(0, 4);

  return (
    <div className={`w-full border-b text-slate-100 px-4 py-2 select-none z-20 backdrop-blur-md shadow-lg transition-all animate-fadeIn ${
      isSevere
        ? "bg-gradient-to-r from-red-950/90 via-slate-950/95 to-red-950/90 border-red-500/50"
        : "bg-gradient-to-r from-amber-950/85 via-slate-950/95 to-amber-950/85 border-amber-500/40"
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Vertical Stack of Alert Headline + Dynamic Locations */}
        <div className="flex flex-col gap-1.5 w-full md:w-auto">
          {/* Row 1: Radar Alert Badge + Real-Time Countdown */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider text-[11px] ${
              isSevere
                ? "bg-red-500/20 border-red-500 text-red-300 animate-pulse"
                : "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
            }`}>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>RADAR NOWCAST INCOMING</span>
            </div>

            {/* LIVE COUNTDOWN TICKER */}
            {secondsRemaining > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-amber-400 text-amber-300 font-mono font-bold text-xs shadow-inner">
                <Timer className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>T-MINUS: <strong className="text-white">{formatCountdown()}</strong></span>
              </div>
            )}

            <span className="text-slate-400 text-[11px] hidden lg:inline">
              | Pre-Emptive Action: Dewatering pumps pre-charged on standby
            </span>
          </div>

          {/* Row 2: Dynamic Live ML Target Locations */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[11px] overflow-hidden">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
            <span className="font-bold text-amber-300 shrink-0">Live ML Targets:</span>
            <span className="text-slate-200 font-medium truncate">
              {dynamicTargetHotspots.length > 0
                ? dynamicTargetHotspots.map((h) => `${h.name} (${h.ward})`).join(" • ")
                : "Scanning 24 Mumbai MCGM Wards..."}
            </span>
          </div>
        </div>

        {/* Right: 15-min Timeline Chips & Pre-emptive Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mini 15-Minute Radar Spark Chips */}
          <div className="flex items-center gap-1">
            {telemetry.minutely_forecast?.slice(0, 4).map((slot, idx) => (
              <button
                key={idx}
                type="button"
                className={`px-2 py-1 rounded border font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-all hover:scale-105 ${
                  (slot.rain_mm_hr || 0) >= 20
                    ? "bg-red-950 border-red-500 text-red-300 shadow-sm shadow-red-500"
                    : (slot.rain_mm_hr || 0) > 0
                    ? "bg-amber-950/80 border-amber-600 text-amber-300"
                    : "bg-slate-900 border-slate-700 text-slate-400"
                }`}
                title={`Click to simulate ${slot.time_offset} forecast (${slot.rain_mm_hr} mm/h)`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSimulateRainfall && onSimulateRainfall(Math.max(45, (slot.rain_mm_hr || 0) * 15));
                }}
              >
                <Clock className="w-2.5 h-2.5 opacity-70" />
                <span>{slot.time_offset}: <strong>{slot.rain_mm_hr}mm</strong></span>
              </button>
            ))}
          </div>

          {/* Action Trigger Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>PUMPS: ARMED</span>
          </div>

          {/* Toggle Expand Details */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="View Live ML Target Cards"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Location & Protocol Drawer */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2.5 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[11px] text-slate-300 animate-fadeIn">
          {dynamicTargetHotspots.map((zone) => (
            <div
              key={zone.component_id}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelectComponent && onSelectComponent(zone); }}
              className="bg-slate-900/90 p-2.5 rounded-lg border border-amber-500/30 hover:border-amber-400 shadow-inner flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div>
                <div className="flex items-center justify-between font-bold text-slate-100 mb-1">
                  <span className="flex items-center gap-1 text-amber-400 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {zone.name}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                    zone.status === "CRITICAL"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }`}>
                    {zone.failure_risk_score}% RISK
                  </span>
                </div>
                <p className="text-slate-400 text-[10px]">MCGM Ward {zone.ward} • Elev: +{zone.elevation_m}m</p>
                <div className="flex items-center justify-between text-[10px] mt-1.5 text-cyan-300">
                  <span>Depth: <strong>{zone.water_depth_cm} cm</strong></span>
                  <span>Speed: <strong>{zone.traffic_speed_kmh} km/h</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
