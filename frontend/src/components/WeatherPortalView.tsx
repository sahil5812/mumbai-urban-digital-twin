"use client";

import React, { useState } from "react";
import {
  CloudRain,
  Sun,
  Moon,
  Wind,
  Waves,
  Calendar,
  CloudLightning,
  Droplets,
  ArrowUpRight,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Activity,
  MapPin,
  Sliders,
  ShieldAlert,
  CloudSun,
  Layers,
  Sparkles,
  Gauge
} from "lucide-react";
import { LiveTelemetry } from "../lib/api";

interface WeatherPortalViewProps {
  currentRainfallMmHr: number;
  currentTideLevelM: number;
  liveTelemetry: LiveTelemetry | null;
  onSimulateScenario: (scenarioName: string, rain: number, tide: number, silt: number) => void;
  onOpenMap: () => void;
  onOpenPriorityModal: () => void;
}

export const WeatherPortalView: React.FC<WeatherPortalViewProps> = ({
  currentRainfallMmHr,
  currentTideLevelM,
  liveTelemetry,
  onSimulateScenario,
  onOpenMap,
  onOpenPriorityModal,
}) => {
  const [radarLayer, setRadarLayer] = useState<"radar" | "clouds" | "inundation">("radar");
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);

  // Real-time telemetry values or dynamic fallback
  const tempC = liveTelemetry?.temperature_c || 28;
  const humidityPct = liveTelemetry?.humidity_pct || 78;
  const windKmh = liveTelemetry?.wind_speed_kmh || 18;
  const tideM = liveTelemetry?.tide_level_m || currentTideLevelM || 3.59;
  const rainMmHr = liveTelemetry?.rainfall_mm_hr || currentRainfallMmHr || 0;

  // 12-Hour Forecast Array
  const HOURLY_DATA = [
    { hour: "9 PM", temp: 28, rainMm: 0.0, prob: "20%", tide: 3.2, risk: "SAFE", icon: "🌤️" },
    { hour: "10 PM", temp: 28, rainMm: 12.5, prob: "65%", tide: 3.5, risk: "LOW", icon: "🌧️" },
    { hour: "11 PM", temp: 27, rainMm: 28.0, prob: "75%", tide: 3.7, risk: "MODERATE", icon: "🌧️" },
    { hour: "12 AM", temp: 27, rainMm: 45.0, prob: "85%", tide: 3.9, risk: "MODERATE", icon: "⛈️" },
    { hour: "1 AM", temp: 26, rainMm: 70.0, prob: "92%", tide: 4.1, risk: "CRITICAL", icon: "⛈️" },
    { hour: "2 AM", temp: 26, rainMm: 95.0, prob: "98%", tide: 4.3, risk: "CRITICAL", icon: "⛈️" },
    { hour: "3 AM", temp: 26, rainMm: 60.0, prob: "88%", tide: 4.0, risk: "CRITICAL", icon: "🌧️" },
    { hour: "4 AM", temp: 27, rainMm: 35.0, prob: "70%", tide: 3.6, risk: "MODERATE", icon: "🌧️" },
    { hour: "5 AM", temp: 27, rainMm: 15.0, prob: "50%", tide: 3.1, risk: "LOW", icon: "🌦️" },
    { hour: "6 AM", temp: 28, rainMm: 5.0, prob: "30%", tide: 2.8, risk: "SAFE", icon: "🌤️" },
    { hour: "7 AM", temp: 29, rainMm: 0.0, prob: "15%", tide: 2.4, risk: "SAFE", icon: "☀️" },
    { hour: "8 AM", temp: 30, rainMm: 0.0, prob: "10%", tide: 2.2, risk: "SAFE", icon: "☀️" },
  ];

  // 10-Day Synoptic Monsoon Forecast
  const TEN_DAY_FORECAST = [
    {
      day: "TONIGHT",
      date: "9/6",
      summary: "Thunderstorm in spots late over Kurla & Mumbra",
      hiLo: "27° Lo",
      rainProb: "65%",
      rainMm: 35,
      tidePeak: 3.8,
      severity: "MODERATE",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      icon: "⛈️"
    },
    {
      day: "MON",
      date: "9/7",
      summary: "Stray afternoon storm; night shower in spots",
      hiLo: "32° / 27°",
      rainProb: "66%",
      rainMm: 45,
      tidePeak: 4.1,
      severity: "AMBER ALERT",
      badgeColor: "text-amber-300 bg-amber-500/20 border-amber-500/40",
      icon: "🌤️"
    },
    {
      day: "TUE",
      date: "9/8",
      summary: "Heavy shower and severe convective thunderstorm cell",
      hiLo: "32° / 27°",
      rainProb: "85%",
      rainMm: 85,
      tidePeak: 4.4,
      severity: "RED ALERT",
      badgeColor: "text-red-400 bg-red-500/20 border-red-500/40",
      icon: "⛈️"
    },
    {
      day: "WED",
      date: "9/9",
      summary: "Heavy morning downpour; high coastal spring tide",
      hiLo: "31° / 26°",
      rainProb: "88%",
      rainMm: 95,
      tidePeak: 4.3,
      severity: "RED ALERT",
      badgeColor: "text-red-400 bg-red-500/20 border-red-500/40",
      icon: "🌧️"
    },
    {
      day: "THU",
      date: "9/10",
      summary: "A.M. showers, then broken clouds in the evening",
      hiLo: "32° / 27°",
      rainProb: "70%",
      rainMm: 40,
      tidePeak: 3.9,
      severity: "MODERATE",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      icon: "🌦️"
    },
    {
      day: "FRI",
      date: "9/11",
      summary: "Rather cloudy, passing light coastal rain spells",
      hiLo: "32° / 26°",
      rainProb: "55%",
      rainMm: 20,
      tidePeak: 3.4,
      severity: "SAFE",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      icon: "🌧️"
    },
    {
      day: "SAT",
      date: "9/12",
      summary: "Mostly cloudy, little rain, pleasant sea breeze",
      hiLo: "31° / 26°",
      rainProb: "45%",
      rainMm: 10,
      tidePeak: 3.0,
      severity: "SAFE",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      icon: "⛅"
    },
    {
      day: "SUN",
      date: "9/13",
      summary: "A touch of morning drizzle; humid afternoon",
      hiLo: "32° / 26°",
      rainProb: "40%",
      rainMm: 8,
      tidePeak: 2.8,
      severity: "SAFE",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      icon: "🌤️"
    },
    {
      day: "MON",
      date: "9/14",
      summary: "Mostly cloudy, light rain bands from Arabian Sea",
      hiLo: "32° / 27°",
      rainProb: "35%",
      rainMm: 5,
      tidePeak: 2.6,
      severity: "SAFE",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      icon: "⛅"
    },
    {
      day: "TUE",
      date: "9/15",
      summary: "A bit of morning rain, mostly sunny intervals",
      hiLo: "32° / 27°",
      rainProb: "30%",
      rainMm: 2,
      tidePeak: 2.5,
      severity: "SAFE",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      icon: "🌤️"
    }
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-4 pb-16">
        
        {/* CARD 1: TONIGHT'S WEATHER & ALERTS */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              TONIGHT'S WEATHER & HYDROLOGY ALERT
            </span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/50">
              SUN, SEP 6 • IST
            </span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-slate-300">
            <div className="flex items-start gap-2.5">
              <span className="text-base sm:text-lg shrink-0">⛈️</span>
              <p>
                <strong className="text-slate-100">Tonight:</strong> Partly cloudy with localized thunderstorm cells developing over Kurla, Hindmata & Thane Mumbra late.&nbsp;
                <span className="text-cyan-300 font-mono font-bold">Lo: 26°C</span>
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-base sm:text-lg shrink-0">🌤️</span>
              <p>
                <strong className="text-slate-100">Tomorrow:</strong> Sun breaking through clouds at times with stray thunderstorms in the afternoon coinciding with&nbsp;
                <span className="text-amber-300 font-mono font-bold">14:15 IST High Tide (4.2m)</span>.&nbsp;
                <span className="text-cyan-300 font-mono font-bold">Hi: 32°C</span>
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: CURRENT WEATHER & HYDROLOGICAL METRICS (Air Quality Removed) */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              CURRENT WEATHER & TELEMETRY
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-slate-300">
                {liveTelemetry?.last_updated || "8:35 PM IST"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Col: Temperature & Sky Status */}
            <div className="md:col-span-5 flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-800/80 pb-4 md:pb-0 md:pr-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-700/40 shadow-inner">
                {tempC > 28 ? (
                  <CloudRain className="w-12 h-12 text-cyan-400 animate-pulse" />
                ) : (
                  <Moon className="w-12 h-12 text-indigo-400" />
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-100">
                    {Math.round(tempC)}°
                  </span>
                  <span className="text-xl font-mono text-slate-400">C</span>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  RealFeel® <span className="text-slate-200 font-semibold font-mono">{Math.round(tempC + 4)}°</span>
                </div>
                <div className="text-xs text-cyan-400 font-semibold mt-1">
                  {rainMmHr > 0 ? `Rain Active (${rainMmHr} mm/h)` : "Monsoon Overcast • Humid"}
                </div>
              </div>
            </div>

            {/* Right Col: Hydrology & Meteorological Metrics Grid (AIR QUALITY REMOVED) */}
            <div className="md:col-span-7 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Wind className="w-3.5 h-3.5 text-indigo-400" />
                  <span>WIND</span>
                </div>
                <div className="text-slate-200 font-bold text-sm">
                  WSW {Math.round(windKmh)} km/h
                </div>
                <div className="text-[10px] text-slate-400">Gusts: {Math.round(windKmh * 1.5)} km/h</div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ARABIAN SEA TIDE</span>
                </div>
                <div className={`font-bold text-sm ${tideM >= 3.8 ? "text-amber-400" : "text-cyan-300"}`}>
                  {tideM.toFixed(2)} m
                </div>
                <div className="text-[10px] text-slate-400">
                  {tideM >= 4.0 ? "Spring Tide Peak" : "Moderate Surge"}
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>CATCHMENT RUNOFF</span>
                </div>
                <div className="text-slate-200 font-bold text-sm">
                  {Math.max(5.2, (rainMmHr * 0.45 + 5.2)).toFixed(1)} m³/s
                </div>
                <div className="text-[10px] text-slate-400">Mithi & Parsik basins</div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  <span>DEWATERING PUMPS</span>
                </div>
                <div className="text-emerald-400 font-bold text-sm">
                  9 SPS Active
                </div>
                <div className="text-[10px] text-slate-400">264 cumecs capacity</div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: LOOKING AHEAD ADVISORY BANNER */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                LOOKING AHEAD • HYDROLOGICAL ADVISORY
              </span>
              <p className="text-xs text-slate-200 mt-0.5">
                Thunderstorm cells expected late Sunday night with high tide surge coincidence (+4.1m). Lowline subways (Milan, Andheri, Hindmata, Reti Bunder) under automated sensor surveillance.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenPriorityModal}
            className="shrink-0 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold font-mono flex items-center gap-1 transition-all"
          >
            <span>Priority Queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 4: MUMBAI & THANE WEATHER RADAR PREVIEW */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                MUMBAI & THANE METRO DOPPLER RADAR
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                LIVE SWEEP
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenMap}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/50 text-xs font-semibold transition-all hover:scale-105"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open in Full 3D Twin Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Radar Graphic Canvas Container */}
          <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            {/* Base Geographic Background Simulation */}
            <div 
              className="absolute inset-0 opacity-40 bg-cover bg-center"
              style={{
                backgroundImage: `radial-gradient(circle at 45% 55%, rgba(6,182,212,0.15) 0%, rgba(15,23,42,0.9) 70%), linear-gradient(135deg, #020617 0%, #0f172a 100%)`
              }}
            />

            {/* Concentric Radar Grid Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 rounded-full border border-cyan-500/20" />
              <div className="w-48 h-48 rounded-full border border-cyan-500/15" />
              <div className="w-72 h-72 rounded-full border border-cyan-500/10" />
              {/* Radar Crosshairs */}
              <div className="absolute w-full h-[1px] bg-cyan-500/15" />
              <div className="absolute h-full w-[1px] bg-cyan-500/15" />
            </div>

            {/* Radar Sweeping Beam */}
            <div 
              className="absolute w-40 h-40 rounded-full border-r border-cyan-400/40 pointer-events-none"
              style={{
                background: "conic-gradient(from 0deg at 50% 50%, rgba(6,182,212,0.3) 0deg, transparent 60deg)",
                animation: "spin 5s linear infinite"
              }}
            />

            {/* Radar Simulated Echo Cells */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="relative">
                <span className="w-16 h-16 rounded-full bg-emerald-500/20 filter blur-md absolute -top-4 -left-4" />
                <span className="w-8 h-8 rounded-full bg-amber-500/30 filter blur-sm absolute -top-1 -left-1" />
                <div className="relative px-2 py-1 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-cyan-300 flex items-center gap-1 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  MUMBAI CELL (35 dBZ)
                </div>
              </div>
            </div>

            {/* Thane Mumbra Echo Cell */}
            <div className="absolute top-1/4 right-1/4 flex flex-col items-center">
              <div className="relative">
                <span className="w-12 h-12 rounded-full bg-cyan-500/20 filter blur-md absolute -top-3 -left-3" />
                <div className="relative px-2 py-1 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-emerald-300 flex items-center gap-1 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  THANE MUMBRA (22 dBZ)
                </div>
              </div>
            </div>

            {/* Bottom Layer Switchers */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRadarLayer("radar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  radarLayer === "radar"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700"
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span>Precipitation Radar</span>
              </button>

              <button
                type="button"
                onClick={() => setRadarLayer("clouds")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  radarLayer === "clouds"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Clouds</span>
              </button>

              <button
                type="button"
                onClick={() => setRadarLayer("inundation")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  radarLayer === "inundation"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700"
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>Flood Depths</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 5: HOURLY WEATHER & NOWCAST SCRUBBER */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              HOURLY WEATHER & FLOOD RISK
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Click any hour to simulate conditions
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center gap-3 min-w-max">
              {HOURLY_DATA.map((item, idx) => {
                const isSelected = selectedHourIndex === idx;
                return (
                  <button
                    key={item.hour}
                    type="button"
                    onClick={() => {
                      setSelectedHourIndex(idx);
                      onSimulateScenario(`Hourly Forecast: ${item.hour}`, item.rainMm, item.tide, 30);
                    }}
                    className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all min-w-[85px] cursor-pointer ${
                      isSelected
                        ? "bg-cyan-950/80 border-cyan-500 shadow-lg shadow-cyan-950/50 scale-105"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    <span className="text-[11px] font-mono text-slate-400 font-bold mb-1">{item.hour}</span>
                    <span className="text-xl mb-1">{item.icon}</span>
                    <span className="text-sm font-mono font-bold text-slate-100">{item.temp}°</span>
                    
                    <div className="mt-2 flex flex-col items-center gap-0.5">
                      <span className="text-[10px] font-mono text-cyan-300 font-semibold">
                        {item.rainMm} mm
                      </span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        item.risk === "CRITICAL"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : item.risk === "MODERATE"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {item.risk}
                      </span>
                    </div>

                    <div className="mt-2 text-[9px] font-mono text-slate-400 hover:text-cyan-300 underline">
                      Simulate
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CARD 6: 10-DAY SYNOPTIC WEATHER & ARABIAN SEA TIDAL FORECAST */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              10-DAY WEATHER & SPRING TIDE OUTLOOK
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              Arabian Sea Hydro-Meteorological Model
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {TEN_DAY_FORECAST.map((day) => (
              <div 
                key={day.day + day.date}
                className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-xl transition-all"
              >
                {/* Left: Day and Icon */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  <span className="text-2xl shrink-0">{day.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-100 font-mono">{day.day}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{day.date}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-300">{day.hiLo}</span>
                  </div>
                </div>

                {/* Middle: Summary description */}
                <div className="flex-1 text-xs text-slate-300">
                  <p>{day.summary}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-slate-400">
                    <span>🌧️ Rain: <strong className="text-cyan-300">{day.rainMm} mm</strong> ({day.rainProb})</span>
                    <span>🌊 Tide Peak: <strong className="text-blue-300">{day.tidePeak}m</strong></span>
                  </div>
                </div>

                {/* Right: Severity Badge and Simulate Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${day.badgeColor}`}>
                    {day.severity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSimulateScenario(`10-Day Outlook: ${day.day}`, day.rainMm, day.tidePeak, 35);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-mono transition-all hover:scale-105"
                  >
                    Test Day
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 7: SUN, MOON & ASTRONOMICAL SPRING TIDE */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
          <div className="border-b border-slate-800 pb-3 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              SUN, MOON & COASTAL ASTRONOMICAL TIDES
            </span>
          </div>

          <div className="divide-y divide-slate-800/80 font-mono text-xs">
            {/* Sun Row */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-100 font-bold">12 hrs 36 mins</span>
                  <p className="text-[10px] text-slate-400">Total Mumbai Daylight</p>
                </div>
              </div>
              <div className="text-right space-y-0.5">
                <div>Rise: <strong className="text-slate-200">6:24 AM</strong></div>
                <div>Set: <strong className="text-slate-200">6:50 PM</strong></div>
              </div>
            </div>

            {/* Moon Row */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-100 font-bold">Waxing Crescent</span>
                  <p className="text-[10px] text-slate-400">Spring Tide Phase Multiplier: 1.18x</p>
                </div>
              </div>
              <div className="text-right space-y-0.5">
                <div>Rise: <strong className="text-slate-200">1:11 AM</strong></div>
                <div>Set: <strong className="text-slate-200">6:07 PM</strong></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
