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
    <div className={`w-full border-b text-slate-100 px-4 py-2.5 select-none z-20 backdrop-blur-2xl transition-all animate-fadeIn shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${
      isSevere
        ? "bg-red-950/40 border-red-500/30 shadow-[inset_0_1px_0_rgba(239,68,68,0.2)]"
        : "bg-amber-950/35 border-amber-500/25 shadow-[inset_0_1px_0_rgba(245,158,11,0.2)]"
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Vertical Stack of Alert Headline + Dynamic Locations */}
        <div className="flex flex-col gap-1.5 w-full md:w-auto">
          {/* Row 1: Radar Alert Badge + Real-Time Countdown / Active Status */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-bold uppercase tracking-wider text-[11px] backdrop-blur-xl ${
              currentRainfallMmHr > 0
                ? isSevere
                  ? "bg-red-500/30 border-red-400/60 text-red-200 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  : "bg-cyan-500/25 border-cyan-400/50 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : isSevere
                ? "bg-red-500/20 border-red-400/50 text-red-200 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                : "bg-amber-500/20 border-amber-400/40 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
            }`}>
              <Zap className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <span className="glass-text-title">
                {currentRainfallMmHr > 0 
                  ? `LIVE RADAR PRECIPITATION: ${currentRainfallMmHr} mm/h` 
                  : "RADAR NOWCAST INCOMING"}
              </span>
            </div>

            {/* LIVE COUNTDOWN TICKER OR ACTIVE PULSE INDICATOR */}
            {currentRainfallMmHr > 0 ? (
              <div className="glass-button flex items-center gap-1.5 px-3 py-1 rounded-xl border-cyan-400/50 text-cyan-300 font-mono font-bold text-xs shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>ACTIVE SHOCKWAVES: <strong className="text-white font-extrabold">{dynamicTargetHotspots.length} SUBWAYS</strong></span>
              </div>
            ) : secondsRemaining > 0 ? (
              <div className="glass-button flex items-center gap-1.5 px-3 py-1 rounded-xl border-amber-400/50 text-amber-300 font-mono font-bold text-xs shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                <Timer className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>T-MINUS: <strong className="text-white font-extrabold">{formatCountdown()}</strong></span>
              </div>
            ) : null}

            <span className="text-slate-300 text-[11px] hidden lg:inline font-medium">
              {currentRainfallMmHr > 0 
                ? "| Moving radar shockwaves active on map (Cyan: Normal, Amber: Warning, Red: Danger)"
                : "| Pre-Emptive Action: Dewatering pumps pre-charged on standby"}
            </span>
          </div>

          {/* Row 2: Dynamic Live ML Target Locations */}
          <div className="glass-panel-subtle flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] overflow-hidden border-amber-400/25">
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
          <div className="flex items-center gap-1.5">
            {telemetry.minutely_forecast?.slice(0, 4).map((slot, idx) => (
              <button
                key={idx}
                type="button"
                className={`glass-button px-2.5 py-1 rounded-xl font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-all hover:scale-105 ${
                  (slot.rain_mm_hr || 0) >= 20
                    ? "bg-red-950/60 border-red-400/60 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                    : (slot.rain_mm_hr || 0) > 0
                    ? "bg-amber-950/50 border-amber-400/50 text-amber-200"
                    : "text-slate-300 hover:text-white"
                }`}
                title={`Click to simulate ${slot.time_offset} forecast (${slot.rain_mm_hr} mm/h)`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSimulateRainfall && onSimulateRainfall(Math.max(45, (slot.rain_mm_hr || 0) * 15));
                }}
              >
                <Clock className="w-2.5 h-2.5 opacity-80" />
                <span>{slot.time_offset}: <strong>{slot.rain_mm_hr}mm</strong></span>
              </button>
            ))}
          </div>

          {/* Action Trigger Pill */}
          <div className="glass-button flex items-center gap-1.5 px-3 py-1 rounded-xl border-emerald-400/50 bg-emerald-950/40 text-emerald-300 text-[10px] font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>PUMPS: ARMED</span>
          </div>

          {/* Toggle Expand Details */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="glass-button p-1.5 rounded-xl text-slate-300 hover:text-white"
            title="View Live ML Target Cards"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Location & Protocol Drawer */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] text-slate-300 animate-fadeIn">
          {dynamicTargetHotspots.map((zone) => (
            <div
              key={zone.component_id}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelectComponent && onSelectComponent(zone); }}
              className="glass-panel-subtle p-3 rounded-2xl hover:border-amber-400/60 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
            >
              <div>
                <div className="flex items-center justify-between font-bold text-white mb-1.5">
                  <span className="flex items-center gap-1 text-amber-300 truncate font-semibold">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {zone.name}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border backdrop-blur-md ${
                    zone.status === "CRITICAL"
                      ? "bg-red-500/20 text-red-300 border-red-400/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-400/40"
                  }`}>
                    {zone.failure_risk_score}% RISK
                  </span>
                </div>
                <p className="text-slate-400 text-[10px]">MCGM Ward {zone.ward} • Elev: +{zone.elevation_m}m</p>
                <div className="flex items-center justify-between text-[10px] mt-2 text-cyan-300 font-mono">
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
