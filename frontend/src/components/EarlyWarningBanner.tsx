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

  // If backend is offline, show a small amber indicator instead of fake weather data
  if (telemetry.status === "OFFLINE") {
    return (
      <div className="w-full border-b bg-amber-950/30 border-amber-500/20 text-slate-100 px-4 py-2 select-none z-20 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl border bg-amber-500/15 border-amber-400/30 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
            <Zap className="w-3.5 h-3.5" />
            <span>⚠ Backend Offline</span>
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Live weather data unavailable — displaying cached or default values. Reconnecting...
          </span>
        </div>
      </div>
    );
  }

  // Check if rain is incoming from nowcasting OR if user is actively simulating rain
  const hasIncomingForecast = Boolean(
    telemetry.minutely_forecast?.some((slot) => (slot.rain_mm_hr || 0) > 0) ||
    (telemetry.predicted_rain_in_30m || 0) > 0 ||
    (telemetry.rainfall_mm_hr || 0) > 0 ||
    (telemetry.citywide_max_rain_mm_hr || 0) > 0 ||
    (telemetry.active_rain_zones && telemetry.active_rain_zones.length > 0) ||
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

  const effectiveLiveRain = telemetry.citywide_max_rain_mm_hr ?? telemetry.rainfall_mm_hr ?? 0;
  const predictedRain = Math.max(telemetry.predicted_rain_in_30m || 0, currentRainfallMmHr || effectiveLiveRain);
  const isSevere = predictedRain >= 25.0;

  // DYNAMICALLY derived from Backend ML predictions (Safe immutability)
  const dynamicTargetHotspots = [...components]
    .filter((c) => c.component_type === "HOTSPOT" || (c.water_depth_cm || 0) > 5.0 || (c.failure_risk_score || 0) > 30.0)
    .sort((a, b) => (b.failure_risk_score || 0) - (a.failure_risk_score || 0))
    .slice(0, 4);

  return (
    <div
      className={`w-full text-slate-100 px-4 py-1.5 select-none z-20 backdrop-blur-2xl transition-all shadow-[0_-8px_32px_rgba(0,0,0,0.5)] border-t ${
        isSevere
          ? "bg-red-950/80 border-red-500/40"
          : "bg-slate-950/85 border-white/10"
      }`}
    >
      <div className="w-full flex items-center justify-between gap-4 text-xs font-mono">
        {/* Left: Alert Headline + Pulse Indicator */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border font-bold uppercase tracking-wider text-[10px] ${
              currentRainfallMmHr > 0 || effectiveLiveRain > 0
                ? isSevere
                  ? "bg-red-500/30 border-red-400/60 text-red-200 animate-pulse"
                  : "bg-cyan-500/25 border-cyan-400/50 text-cyan-200"
                : isSevere
                ? "bg-red-500/20 border-red-400/50 text-red-200 animate-pulse"
                : "bg-amber-500/20 border-amber-400/40 text-amber-200"
            }`}
          >
            <Zap className="w-3 h-3 text-amber-300" />
            <span>
              {currentRainfallMmHr > 0
                ? `LIVE RADAR: ${currentRainfallMmHr} mm/h`
                : telemetry.primary_active_zone
                ? `LIVE RADAR: ${telemetry.primary_active_zone.zone_name.toUpperCase()} (${effectiveLiveRain} MM/H)`
                : "RADAR ACTIVE"}
            </span>
          </div>

          {/* Real-time Ticker Status */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-300">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>
              {telemetry.primary_active_zone
                ? `${telemetry.primary_active_zone.zone_name} • ${telemetry.primary_active_zone.landmarks.split(",")[0]}`
                : "City-Wide Spatial Mesh Monitoring"}
            </span>
          </div>
        </div>

        {/* Middle: Active Belts Marquee / Text */}
        <div className="flex-1 flex items-center gap-2 text-[10px] truncate">
          <span className="text-amber-400 font-bold shrink-0">
            {telemetry.active_rain_zones && telemetry.active_rain_zones.length > 0
              ? "⚡ Active Rain Belts:"
              : "📍 Target Basin:"}
          </span>
          <span className="text-slate-200 truncate font-sans">
            {telemetry.active_rain_zones && telemetry.active_rain_zones.length > 0
              ? telemetry.active_rain_zones
                  .map((z) => `${z.zone_name} (${z.landmarks.split(",")[0]} - ${z.rainfall_mm_hr} mm/h)`)
                  .join(" • ")
              : dynamicTargetHotspots.length > 0
              ? dynamicTargetHotspots.map((h) => `${h.name} (${h.ward})`).join(" • ")
              : "Scanning 24 Mumbai MCGM & Thane Wards..."}
          </span>
        </div>

        {/* Right: 15-min Forecast Spark Chips + Pumps Armed */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1">
            {telemetry.minutely_forecast?.slice(0, 4).map((slot, idx) => (
              <button
                key={idx}
                type="button"
                className={`glass-button px-2 py-0.5 rounded-lg font-mono text-[9px] flex items-center gap-1 cursor-pointer transition-all hover:scale-105 ${
                  (slot.rain_mm_hr || 0) >= 20
                    ? "bg-red-950/60 border-red-400/60 text-red-200 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
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
                <span>
                  {slot.time_offset}: <b>{slot.rain_mm_hr}mm</b>
                </span>
              </button>
            ))}
          </div>

          <div className="glass-button flex items-center gap-1 px-2.5 py-0.5 rounded-lg border-emerald-400/40 bg-emerald-950/40 text-emerald-300 text-[10px] font-bold shadow-sm">
            <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
            <span>PUMPS: ARMED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
