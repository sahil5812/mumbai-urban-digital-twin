"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  ChevronDown,
  ChevronUp,
  Activity,
  MapPin,
  Sliders,
  ShieldAlert,
  CloudSun,
  Layers,
  Sparkles,
  Gauge,
  Clock,
  Eye,
  Thermometer,
  Compass,
  BarChart3
} from "lucide-react";
import { LiveTelemetry } from "../lib/api";
import { MinuteCastView } from "./MinuteCastView";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { STATIC_HOURLY_DETAILS, STATIC_TEN_DAY_FORECAST } from "./weatherPortalData";

interface WeatherPortalViewProps {
  currentRainfallMmHr: number;
  currentTideLevelM: number;
  liveTelemetry: LiveTelemetry | null;
  activeTab?: string;
  onSimulateScenario: (scenarioName: string, rain: number, tide: number, silt: number) => void;
  onOpenMap: () => void;
  onOpenPriorityModal: () => void;
}

const WeatherPortalViewComponent: React.FC<WeatherPortalViewProps> = ({
  currentRainfallMmHr,
  currentTideLevelM,
  liveTelemetry,
  activeTab = "TODAY",
  onSimulateScenario,
  onOpenMap,
  onOpenPriorityModal,
}) => {
  const { t, language } = useLanguage();
  // If activeTab is MINUTECAST, render the full AccuWeather-style MinuteCast interface
  if (activeTab === "MINUTECAST") {
    return (
      <MinuteCastView
        currentRainfallMmHr={currentRainfallMmHr}
        currentTideLevelM={currentTideLevelM}
        liveTelemetry={liveTelemetry}
        onSimulateScenario={onSimulateScenario}
        onOpenMap={onOpenMap}
      />
    );
  }

  const [radarLayer, setRadarLayer] = useState<"radar" | "clouds" | "inundation">("radar");
  
  // Track expanded hour item (default: 8 AM is expanded, matching reference screenshot)
  const [expandedHourId, setExpandedHourId] = useState<string | null>("8 AM");

  const hourlySectionRef = useRef<HTMLDivElement | null>(null);
  const tenDaySectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab === "HOURLY" && hourlySectionRef.current) {
      hourlySectionRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (activeTab === "10-DAY" && tenDaySectionRef.current) {
      tenDaySectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab]);

  // Real-time telemetry values or dynamic fallback
  const tempC = liveTelemetry?.temperature_c || 28;
  const humidityPct = liveTelemetry?.humidity_pct || 77;
  const windKmh = liveTelemetry?.wind_speed_kmh || 18;
  const tideM = liveTelemetry?.tide_level_m || currentTideLevelM || 3.59;
  const rainMmHr = liveTelemetry?.rainfall_mm_hr || currentRainfallMmHr || 0;



  // Dynamic 24-Hour Forecast derived from Live Open-Meteo telemetry (Task 5)
  const HOURLY_DETAILS = useMemo(() => {
    if (liveTelemetry?.hourly_forecast && liveTelemetry.hourly_forecast.length > 0) {
      return liveTelemetry.hourly_forecast.map((hf) => {
        let hourLabel = hf.time;
        try {
          const d = new Date(hf.time);
          hourLabel = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
        } catch {
          // fallback
        }

        const condition = hf.precip_mm >= 25 
          ? "Heavy Downpour" 
          : (hf.precip_mm >= 5 
            ? "Moderate Rain" 
            : (hf.precip_mm > 0 
              ? "Light Drizzle" 
              : (hf.weather_code <= 2 ? "Intermittent clouds" : "Overcast")));

        const icon = hf.precip_mm >= 25 ? "⛈️" : (hf.precip_mm >= 5 ? "🌧️" : (hf.precip_mm > 0 ? "🌦️" : (hf.weather_code <= 1 ? "☀️" : "🌤️")));
        const floodRisk = (hf.precip_mm >= 25 ? "DANGER" : (hf.precip_mm >= 10 ? "WARNING" : "SAFE")) as "SAFE" | "WARNING" | "DANGER";
        const realFeel = Math.round(hf.temp_c + (hf.humidity_pct > 70 ? 4 : 2));

        return {
          id: hourLabel,
          hour: hourLabel,
          temp: Math.round(hf.temp_c),
          realFeel,
          realFeelShade: realFeel - 2,
          condition,
          icon,
          rainProb: `${Math.min(100, Math.round(hf.precip_mm * 12 + 15))}%`,
          rainMm: hf.precip_mm,
          wind: `SW ${Math.round(hf.wind_kmh)} km/h`,
          windGusts: `${Math.round(hf.wind_kmh * 1.5)} km/h`,
          humidity: Math.round(hf.humidity_pct),
          indoorHumidity: `${Math.round(hf.humidity_pct)}% (${hf.humidity_pct > 80 ? "Extremely Humid" : "Humid"})`,
          dewPoint: Math.round(hf.temp_c - (100 - hf.humidity_pct) / 5),
          uvIndex: "3.5 (Moderate)",
          brightnessIndex: "7 (Bright)",
          cloudCover: hf.precip_mm > 0 ? "85%" : "55%",
          visibility: hf.precip_mm > 10 ? "5 km" : "11 km",
          cloudCeiling: hf.precip_mm > 10 ? "350 m" : "520 m",
          tideLevel: tideM,
          floodRisk,
          pumpsArmed: hf.precip_mm >= 15 ? "6 SPS Armed (High Alert)" : "2 SPS Operational",
          vulnerability: hf.precip_mm >= 20 ? "Severe lowline inundation risk" : "Normal baseline flow",
        };
      });
    }
    return STATIC_HOURLY_DETAILS;
  }, [liveTelemetry?.hourly_forecast, tideM]);

  // Dynamic 10-Day Synoptic Monsoon Outlook derived from Live Open-Meteo telemetry (Task 6)
  const TEN_DAY_FORECAST = useMemo(() => {
    if (liveTelemetry?.daily_forecast && liveTelemetry.daily_forecast.length > 0) {
      const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      return liveTelemetry.daily_forecast.map((df) => {
        let dayName = "MON";
        let dateLabel = df.date;
        try {
          const d = new Date(df.date);
          dayName = DAYS[d.getDay()];
          dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
        } catch {
          // fallback
        }

        const rainMm = Math.round(df.precipitation_sum_mm);
        const icon = rainMm >= 40 ? "⛈️" : (rainMm >= 10 ? "🌧️" : (rainMm > 0 ? "🌦️" : "🌤️"));
        const severity = rainMm >= 60 ? "RED ALERT" : (rainMm >= 25 ? "AMBER ALERT" : (rainMm >= 10 ? "MODERATE" : "SAFE"));
        const badgeColor = rainMm >= 60 
          ? "text-red-300 bg-red-500/25 border-red-400/50 shadow-[0_0_12px_rgba(239,68,68,0.35)]"
          : (rainMm >= 25
            ? "text-amber-300 bg-amber-500/20 border-amber-400/40"
            : (rainMm >= 10 
              ? "text-cyan-300 bg-cyan-500/20 border-cyan-400/30"
              : "text-emerald-300 bg-emerald-500/20 border-emerald-400/30"));

        const summary = rainMm >= 50
          ? "Torrential monsoon precipitation with active municipal pumping and low-lying alert"
          : (rainMm >= 20
            ? "Cloudy with passing rain bands, thunder and gusty afternoon showers"
            : (rainMm > 0
              ? "{language === 'hi' ? 'बादलों के बीच कभी-कभी धूप खिलेगी, दोपहर में 14:15 IST उच्च ज्वार (4.2m) के समय छिटपुट गरज-चमक के साथ बारिश। अधिकतम: 32°C' : language === 'mr' ? 'ढगांमधून अधूनमधून सूर्यप्रकाश, दुपारी 14:15 IST च्या उधाणाच्या भरतीच्या (4.2m) वेळी तुरळक मेघगर्जनेसह पावसाची शक्यता. कमाल: 32°C' : 'Sun breaking through clouds at times with stray thunderstorms in the afternoon coinciding with 14:15 IST High Tide (4.2m). Hi: 32°C'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: CURRENT WEATHER & HYDROLOGICAL METRICS (Frosted Acrylic) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 scroll-reveal">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 font-bold glass-text-title">
              {t("currentTelemetryTitle", "CURRENT WEATHER & TELEMETRY")}
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <span className="text-[11px] font-mono text-slate-300">
                {liveTelemetry?.last_updated || "8:35 PM IST"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Col: Temperature & Sky Status */}
            <div className="md:col-span-5 flex items-center gap-4 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-4">
              <div className="p-4 rounded-3xl bg-white/[0.06] backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]">
                {tempC > 28 ? (
                  <CloudRain className="w-12 h-12 text-cyan-300 animate-pulse drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]" />
                ) : (
                  <Moon className="w-12 h-12 text-indigo-300 drop-shadow-[0_0_12px_rgba(165,180,252,0.6)]" />
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white glass-text-title">
                    {Math.round(tempC)}°
                  </span>
                  <span className="text-xl font-mono text-slate-300 font-semibold">C</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  RealFeel® <span className="text-white font-bold font-mono">{Math.round(tempC + 4)}°</span>
                </div>
                <div className="text-xs text-cyan-300 font-semibold mt-1 glass-text-glow">
                  {rainMmHr > 0 ? `Rain Active (${rainMmHr} mm/h)` : "{language === 'hi' ? 'मानसून के घने बादल • अत्यधिक उमस' : language === 'mr' ? 'मान्सूनचे दाट ढग • दमट हवामान' : 'Monsoon Overcast • Humid'}"}
                </div>
              </div>
            </div>

            {/* Right Col: Hydrology & Meteorological Metrics Grid (Frosted Acrylic Sub-Cards) */}
            <div className="md:col-span-7 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="glass-panel-subtle p-3.5 rounded-2xl">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Wind className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="text-[11px] font-semibold text-slate-300">{t("windLabel", "WIND")}</span>
                </div>
                <div className="text-white font-bold text-sm">
                  WSW {Math.round(windKmh)} km/h
                </div>
                <div className="text-[10px] text-slate-400">Gusts: {Math.round(windKmh * 1.5)} km/h</div>
              </div>

              <div className="glass-panel-subtle p-3.5 rounded-2xl">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Waves className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="text-[11px] font-semibold text-slate-300">{t("tideSeaLabel", "ARABIAN SEA TIDE")}</span>
                </div>
                <div className={`font-bold text-sm ${tideM >= 3.8 ? "text-amber-300" : "text-cyan-300"}`}>
                  {tideM.toFixed(2)} m
                </div>
                <div className="text-[10px] text-slate-400">
                  {tideM >= 4.0 ? "Spring Tide Peak" : "{language === 'hi' ? 'मध्यम उछाल' : language === 'mr' ? 'मध्यम लाटांचा जोर' : 'Moderate Surge'}"}
                </div>
              </div>

              <div className="glass-panel-subtle p-3.5 rounded-2xl">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-300" />
                  <span className="text-[11px] font-semibold text-slate-300">{t("catchmentRunoffLabel", "CATCHMENT RUNOFF")}</span>
                </div>
                <div className="text-white font-bold text-sm">
                  {Math.max(5.2, (rainMmHr * 0.45 + 5.2)).toFixed(1)} m³/s
                </div>
                <div className="text-[10px] text-slate-400">{language === 'hi' ? 'मीठी व पारसिक बेसिन' : language === 'mr' ? 'मिठी व पारसिक खोरे' : 'Mithi & Parsik basins'}</div>
              </div>

              <div className="glass-panel-subtle p-3.5 rounded-2xl">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-[11px] font-semibold text-slate-300">{t("dewateringPumpsLabel", "DEWATERING PUMPS")}</span>
                </div>
                <div className="text-emerald-300 font-bold text-sm">
                  9 SPS Active
                </div>
                <div className="text-[10px] text-slate-400">{language === 'hi' ? '264 क्युमेक्स क्षमता' : language === 'mr' ? '264 क्युमेक्स क्षमता' : '264 cumecs capacity'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: LOOKING AHEAD ADVISORY BANNER (Frosted Amber Glass) */}
        <div className="glass-panel rounded-3xl p-4 sm:p-5 border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-950/40 to-slate-950/50 flex items-center justify-between gap-4 scroll-reveal">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 shrink-0 backdrop-blur-xl shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold glass-text-title">
                {t("lookingAheadTitle", "LOOKING AHEAD • HYDROLOGICAL ADVISORY")}
              </span>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                {language === 'hi' ? 'रविवार देर रात उच्च ज्वार (+4.1m) के साथ गरज-चमक वाली बारिश की संभावना। निचले सबवे (मिलन, अंधेरी, हिंदमाता, रेती बंदर) स्वचालित सेंसर निगरानी में हैं।' : language === 'mr' ? 'रविवार रात्री उशिरा उधाणाची भरती (+4.1m) आणि वादळी पावसाची शक्यता. सखल सबवे (मिलन, अंधेरी, हिंदमाता, रेती बंदर) स्वयंचलित सेन्सर देखरेखीखाली आहेत.' : 'Thunderstorm cells expected late Sunday night with high tide surge coincidence (+4.1m). Lowline subways (Milan, Andheri, Hindmata, Reti Bunder) under automated sensor surveillance.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenPriorityModal}
            className="glass-button shrink-0 px-3.5 py-2 text-amber-200 rounded-2xl text-xs font-semibold font-mono flex items-center gap-1.5"
          >
            <span>{t("priorityQueueTitle", "Priority Queue")}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 4: MUMBAI & THANE WEATHER RADAR PREVIEW (Frosted Acrylic) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 overflow-hidden scroll-reveal">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 font-bold glass-text-title">
                {t("minuteCastTitle", "MUMBAI & THANE METRO DOPPLER RADAR")}
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-400/40">
                100 KM RANGE
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t("radarOnline", "RADAR ONLINE")}</span>
            </div>
          </div>

          <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-950/60 border border-white/10 flex items-center justify-center backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
            <div className="w-44 h-44 rounded-full border border-cyan-500/20 animate-ping absolute" />
            <div className="w-32 h-32 rounded-full border border-cyan-400/30 absolute" />
            <div className="w-16 h-16 rounded-full border border-cyan-300/40 absolute" />
            <div className="w-full h-px bg-cyan-500/20 absolute" />
            <div className="h-full w-px bg-cyan-500/20 absolute" />

            <div className="absolute inset-0 p-4 pointer-events-none">
              <div className="absolute top-1/4 left-1/3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-white/20 text-[10px] font-mono text-cyan-200 shadow-lg backdrop-blur-xl">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Heavy Cloud Cell (Kurla-Sion)</span>
              </div>
              <div className="absolute bottom-1/3 right-1/4 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-white/20 text-[10px] font-mono text-emerald-200 shadow-lg backdrop-blur-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Reti Bunder SPS Active (28 cumecs)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenMap}
              className="relative z-10 glass-button-primary px-5 py-2.5 rounded-2xl text-white font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 shadow-xl cursor-pointer"
            >
              <span>{t("openInTwinMap", "Open in Full 3D Twin Map")}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-slate-400 font-mono">
              {t("activeLayer", "Active Layer:")} <strong className="text-cyan-300">{radarLayer.toUpperCase()}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRadarLayer("radar")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  radarLayer === "radar"
                    ? "glass-button-primary text-slate-950 font-bold"
                    : "glass-button text-slate-300"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{t("layerPrecipitation", "Precipitation")}</span>
              </button>

              <button
                type="button"
                onClick={() => setRadarLayer("clouds")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  radarLayer === "clouds"
                    ? "glass-button-primary text-slate-950 font-bold"
                    : "glass-button text-slate-300"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t("layerClouds", "Clouds")}</span>
              </button>

              <button
                type="button"
                onClick={() => setRadarLayer("inundation")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  radarLayer === "inundation"
                    ? "glass-button-primary text-slate-950 font-bold"
                    : "glass-button text-slate-300"
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>{t("layerFloodDepths", "Flood Depths")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 5: HOURLY WEATHER & HYDROLOGY EXPANDABLE LIST (AccuWeather Inspired) */}
        <div
          ref={hourlySectionRef}
          className={`glass-panel rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.7)] transition-all duration-500 scroll-reveal ${
            activeTab === "HOURLY" ? "ring-2 ring-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.3)]" : ""
          }`}
        >
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white glass-text-title">
                {t("hours24Forecast", "HOURLY FORECAST & HYDROLOGY SIMULATION")}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-300 bg-white/[0.06] px-2.5 py-1 rounded-xl border border-white/10">
                {t("clickHourExpand", "16-Hour Detailed Outlook • Click any hour to expand")}
              </span>
            </div>
          </div>

          {/* 16-Hour Bar Hyetograph & Intensity Visualizer */}
          <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  {t("hyetographTitle", "16-Hour Hyetograph (Precipitation & Risk Distribution)")}
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                {t("peakRainMmHr", "Peak Rain")}: {Math.max(...HOURLY_DETAILS.map((h) => h.rainMm))} mm/hr
              </span>
            </div>

            {/* Bars Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-end justify-between gap-2 min-w-[620px] h-32 pt-6 px-1 border-b border-white/10">
                {HOURLY_DETAILS.map((hourItem) => {
                  const maxRainVal = Math.max(...HOURLY_DETAILS.map((h) => h.rainMm), 25);
                  const heightPct = Math.max(6, Math.round((hourItem.rainMm / maxRainVal) * 100));
                  const isSelected = expandedHourId === hourItem.id;

                  const barColor =
                    hourItem.rainMm >= 20
                      ? "bg-gradient-to-t from-red-600 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                      : hourItem.rainMm >= 10
                      ? "bg-gradient-to-t from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                      : hourItem.rainMm > 0
                      ? "bg-gradient-to-t from-cyan-600 to-cyan-400"
                      : "bg-gradient-to-t from-blue-800/40 to-cyan-600/30";

                  return (
                    <button
                      key={hourItem.id}
                      type="button"
                      onClick={() => setExpandedHourId(isSelected ? null : hourItem.id)}
                      className={`flex-1 flex flex-col items-center justify-end h-full group focus:outline-none transition-transform hover:scale-105 cursor-pointer ${
                        isSelected ? "scale-105" : ""
                      }`}
                      title={`${hourItem.hour}: ${hourItem.rainMm} mm/hr, Tide ${hourItem.tideLevel}m (${hourItem.floodRisk})`}
                    >
                      <span className="text-[10px] font-mono text-slate-300 opacity-80 mb-1 group-hover:text-cyan-300 transition-colors">
                        {hourItem.rainMm > 0 ? `${hourItem.rainMm}m` : "-"}
                      </span>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${barColor} ${
                          isSelected ? "ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.6)]" : "group-hover:brightness-125"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Time labels below axis */}
              <div className="flex items-center justify-between gap-2 min-w-[620px] px-1 mt-2">
                {HOURLY_DETAILS.map((hourItem) => {
                  const isSelected = expandedHourId === hourItem.id;
                  return (
                    <button
                      key={`lbl-${hourItem.id}`}
                      type="button"
                      className={`flex-1 text-center cursor-pointer transition-colors focus:outline-none ${
                        isSelected ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
                      }`}
                      onClick={() => setExpandedHourId(isSelected ? null : hourItem.id)}
                    >
                      <div className="text-[9px] font-mono whitespace-nowrap">{hourItem.hour}</div>
                      <div className="text-xs">{hourItem.icon}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Risk Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400/80" /> Baseline (&lt;10mm)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Watch (10–20mm)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Severe (&gt;20mm)
                </span>
              </div>
              <span className="text-slate-400">Click any bar to inspect hourly hydrology</span>
            </div>
          </div>

          {/* Expandable Hourly List */}
          <div className="flex flex-col gap-2.5">
            {HOURLY_DETAILS.map((item) => {
              const isExpanded = expandedHourId === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl transition-all border ${
                    isExpanded
                      ? "glass-panel-subtle border-white/30 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.6),0_8px_24px_rgba(0,0,0,0.3)]"
                      : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Collapsed Header Row */}
                  <div
                    onClick={() => setExpandedHourId(isExpanded ? null : item.id)}
                    className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    {/* Left: Hour, Weather Icon & Temperature */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="w-14 sm:w-16 text-xs sm:text-sm font-bold text-white font-mono tracking-tight">
                        {item.hour}
                      </span>
                      <span className="text-2xl shrink-0">{item.icon}</span>
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                            {item.temp}°
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-xs text-slate-300 font-medium">
                          {item.condition}
                        </span>
                      </div>
                    </div>

                    {/* Right: RealFeel, Rain Probability & Expand Chevron */}
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-slate-200 font-medium font-mono">
                          RealFeel® <strong className="text-white">{item.realFeel}°</strong>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Shade: {item.realFeelShade}°
                        </div>
                      </div>

                      {/* Rain Probability Pill */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/15 text-cyan-300 text-xs font-mono font-bold">
                        <Droplets className="w-3 h-3 text-cyan-400" />
                        <span>{item.rainProb}</span>
                      </div>

                      {/* Flood Risk Badge */}
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border hidden md:inline-block ${
                        item.floodRisk === "CRITICAL"
                          ? "bg-rose-500/25 text-rose-300 border-rose-400/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                          : item.floodRisk === "MODERATE"
                          ? "bg-amber-500/25 text-amber-300 border-amber-400/40"
                          : item.floodRisk === "LOW"
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                      }`}>
                        {item.floodRisk}
                      </span>

                      {/* Chevron Indicator */}
                      <div className={`p-1 rounded-lg text-slate-400 hover:text-white transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded 2-Column Meteorological & Digital Twin Telemetry Grid */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-white/10 animate-fadeIn flex flex-col gap-3.5">
                      {/* 2-Column Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono text-slate-200">
                        {/* Row 1 */}
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">RealFeel Shade™</span>
                          <span className="font-bold text-white">{item.realFeelShade}°C</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Wind & Direction</span>
                          <span className="font-bold text-cyan-200">{item.wind}</span>
                        </div>

                        {/* Row 2 */}
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Heat Index</span>
                          <span className="font-bold text-amber-300">{item.realFeel}°C</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Drainage Runoff Load</span>
                          <span className="font-bold text-emerald-400">Nominal (34%)</span>
                        </div>

                        {/* Row 3 */}
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Max UV Index</span>
                          <span className="font-bold text-white">{item.uvIndex}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Brightness Index</span>
                          <span className="font-bold text-amber-200">{item.brightnessIndex}</span>
                        </div>

                        {/* Row 4 */}
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Wind Gusts</span>
                          <span className="font-bold text-indigo-300">{item.windGusts}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Cloud Cover</span>
                          <span className="font-bold text-white">{item.cloudCover}</span>
                        </div>

                        {/* Row 5 */}
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Relative Humidity</span>
                          <span className="font-bold text-teal-300">{item.humidity}%</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Visibility Range</span>
                          <span className="font-bold text-white">{item.visibility}</span>
                        </div>

                        {/* Row 6 */}
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Indoor Humidity</span>
                          <span className="font-bold text-slate-200">{item.indoorHumidity}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Cloud Ceiling</span>
                          <span className="font-bold text-white">{item.cloudCeiling}</span>
                        </div>

                        {/* Row 7: Digital Twin Metrics */}
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Dew Point</span>
                          <span className="font-bold text-white">{item.dewPoint}°C</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Arabian Sea Tide Peak</span>
                          <span className="font-bold text-blue-300">{item.tideLevel} m</span>
                        </div>

                        {/* Row 8 */}
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Predicted Rain Rate</span>
                          <span className="font-bold text-cyan-300">{item.rainMm} mm/h</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                          <span className="text-slate-400">Pumping SPS Status</span>
                          <span className="font-bold text-emerald-300">{item.pumpsArmed}</span>
                        </div>
                      </div>

                      {/* Action Bar: Disaster Assessment & Twin Simulator Trigger */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">Twin Risk Assessment:</span>
                          <span className="text-slate-200 font-semibold">{item.vulnerability}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSimulateScenario(`Hourly Simulation: ${item.hour}`, item.rainMm, item.tideLevel, 30);
                          }}
                          className="glass-button-primary px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-[0_4px_16px_rgba(6,182,212,0.3)] transition-all hover:scale-105 cursor-pointer"
                        >
                          <span>Simulate {item.hour} in 3D Twin</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 6: 10-DAY SYNOPTIC WEATHER & ARABIAN SEA TIDAL FORECAST (Inspired by AccuWeather Screenshots) */}
        <div
          ref={tenDaySectionRef}
          className={`glass-panel rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.7)] transition-all duration-500 scroll-reveal ${
            activeTab === "10-DAY" ? "ring-2 ring-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.3)]" : ""
          }`}
        >
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white glass-text-title">
                {t("days10Forecast", "10-DAY EXTENDED FORECAST")}
              </h2>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 bg-white/[0.06] px-2.5 py-1 rounded-xl border border-white/10">
              Arabian Sea Hydro-Meteorological Model
            </span>
          </div>

          {/* Cards Stack for 10-Day Synoptic Monsoon Outlook */}
          <div className="flex flex-col gap-3.5">
            {TEN_DAY_FORECAST.map((day) => (
              <div
                key={day.day + day.date}
                className="glass-panel-subtle rounded-2xl p-4 sm:p-5 border border-white/15 hover:border-white/25 transition-all shadow-[inset_0_1.2px_1.5px_rgba(255,255,255,0.4),0_8px_24px_rgba(0,0,0,0.25)] flex flex-col gap-3 scroll-reveal"
              >
                {/* Header Row: Day/Date + Icon + Big Hi/Lo Temp + Rain Prob */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-bold text-white font-mono tracking-tight">{day.day}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{day.date}</span>
                    </div>
                    <span className="text-2xl sm:text-3xl shrink-0">{day.icon}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">{day.hiTemp}°</span>
                      <span className="text-sm sm:text-base font-mono text-slate-400 font-medium">/{day.loTemp}°</span>
                    </div>
                  </div>

                  {/* Right side: Rain Probability & Severity Badge */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/15 text-cyan-300 text-xs font-mono font-bold">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      <span>{day.rainProb}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border hidden sm:inline-block ${day.badgeColor}`}>
                      {day.severity}
                    </span>
                  </div>
                </div>

                {/* Summary Description Sentence */}
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {day.summary}
                </p>

                {/* 2-Column Key-Value Grid with Hairline Dividers (Matching AccuWeather Screenshot) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs font-mono pt-1">
                  {/* Row 1 */}
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-slate-400">RealFeel®</span>
                    <span className="font-bold text-white">{day.realFeel}°C</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-slate-400">Wind</span>
                    <span className="font-bold text-cyan-200">{day.wind}</span>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-slate-400">RealFeel Shade™</span>
                    <span className="font-bold text-slate-200">{day.realFeelShade}°C</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-slate-400">Total Hours of Precipitation</span>
                    <span className="font-bold text-white">{day.precipHours} hrs</span>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-slate-400">Max UV Index</span>
                    <span className="font-bold text-white">{day.maxUv}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-slate-400">Total Hours of Rain</span>
                    <span className="font-bold text-white">{day.rainHours} hrs</span>
                  </div>

                  {/* Row 4: Hydrological & Coastal Digital Twin Metrics */}
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-slate-400">Arabian Sea Tide Peak</span>
                    <span className={`font-bold ${day.tidePeak >= 4.0 ? "text-amber-300" : "text-blue-300"}`}>
                      {day.tidePeak.toFixed(1)} m {day.tidePeak >= 4.0 ? "(Spring Peak)" : "(Surge)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.06]">
                    <span className="text-slate-400">Dewatering SPS Readiness</span>
                    <span className="font-bold text-emerald-300">{day.spsStatus}</span>
                  </div>
                </div>

                {/* Bottom Action & Disaster Intelligence Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Vulnerability Watch:</span>
                    <span className="text-slate-200 font-semibold">{day.vulnerability}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSimulateScenario(`10-Day: ${day.day} ${day.date}`, day.rainMm, day.tidePeak, 30);
                    }}
                    className="glass-button-primary px-3.5 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-[0_4px_16px_rgba(6,182,212,0.3)] transition-all hover:scale-105 cursor-pointer ml-auto"
                  >
                    <span>Simulate {day.day} in 3D Twin</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 7: SUN, MOON & ASTRONOMICAL SPRING TIDE (Frosted Acrylic) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.7)] scroll-reveal">
          <div className="border-b border-white/10 pb-3 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 font-bold glass-text-title">
              SUN, MOON & COASTAL ASTRONOMICAL TIDES
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Sun Row */}
            <div className="glass-panel-subtle p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-400/30 backdrop-blur-xl shadow-sm">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white font-bold text-sm">12 hrs 36 mins</span>
                  <p className="text-[10px] text-slate-400">Total Mumbai Daylight</p>
                </div>
              </div>
              <div className="text-right space-y-0.5">
                <div>Rise: <strong className="text-slate-100">6:24 AM</strong></div>
                <div>Set: <strong className="text-slate-100">6:50 PM</strong></div>
              </div>
            </div>

            {/* Moon Row */}
            <div className="glass-panel-subtle p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 backdrop-blur-xl shadow-sm">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white font-bold text-sm">Waxing Crescent (18%)</span>
                  <p className="text-[10px] text-slate-400">Spring Coastal Tide Phase</p>
                </div>
              </div>
              <div className="text-right space-y-0.5">
                <div>Next High Tide: <strong className="text-cyan-300">14:15 IST (+4.1m)</strong></div>
                <div>Next Low Tide: <strong className="text-slate-300">20:30 IST (+1.2m)</strong></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export const WeatherPortalView = React.memo(WeatherPortalViewComponent);
