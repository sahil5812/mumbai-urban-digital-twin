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

interface WeatherPortalViewProps {
  currentRainfallMmHr: number;
  currentTideLevelM: number;
  liveTelemetry: LiveTelemetry | null;
  activeTab?: string;
  onSimulateScenario: (scenarioName: string, rain: number, tide: number, silt: number) => void;
  onOpenMap: () => void;
  onOpenPriorityModal: () => void;
}

export const WeatherPortalView: React.FC<WeatherPortalViewProps> = ({
  currentRainfallMmHr,
  currentTideLevelM,
  liveTelemetry,
  activeTab = "TODAY",
  onSimulateScenario,
  onOpenMap,
  onOpenPriorityModal,
}) => {
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

  // Static fallback for AccuWeather-inspired 24-Hour Detailed Forecast Data
  const STATIC_HOURLY_DETAILS = [
    {
      id: "8 AM",
      hour: "8 AM",
      temp: 28,
      realFeel: 34,
      realFeelShade: 32,
      condition: "Intermittent clouds",
      icon: "🌤️",
      rainProb: "20%",
      rainMm: 0,
      wind: "SW 9 km/h",
      windGusts: "19 km/h",
      humidity: 77,
      indoorHumidity: "77% (Extremely Humid)",
      dewPoint: 24,
      uvIndex: "1.2 (Low)",
      brightnessIndex: "7 (Bright)",
      cloudCover: "61%",
      visibility: "11 km",
      cloudCeiling: "500 m",
      tideLevel: 3.2,
      floodRisk: "SAFE" as const,
      pumpsArmed: "2 SPS Operational",
      vulnerability: "Normal flow in Dadar & Kurla"
    },
    {
      id: "9 AM",
      hour: "9 AM",
      temp: 29,
      realFeel: 37,
      realFeelShade: 33,
      condition: "Intermittent clouds",
      icon: "🌤️",
      rainProb: "20%",
      rainMm: 0,
      wind: "SW 9 km/h",
      windGusts: "20 km/h",
      humidity: 76,
      indoorHumidity: "76% (Extremely Humid)",
      dewPoint: 24,
      uvIndex: "3.5 (Moderate)",
      brightnessIndex: "8 (Bright)",
      cloudCover: "58%",
      visibility: "11 km",
      cloudCeiling: "520 m",
      tideLevel: 3.4,
      floodRisk: "SAFE" as const,
      pumpsArmed: "2 SPS Operational",
      vulnerability: "Normal baseline"
    },
    {
      id: "10 AM",
      hour: "10 AM",
      temp: 30,
      realFeel: 37,
      realFeelShade: 34,
      condition: "Intermittent clouds",
      icon: "🌤️",
      rainProb: "25%",
      rainMm: 2,
      wind: "SW 9 km/h",
      windGusts: "22 km/h",
      humidity: 74,
      indoorHumidity: "74% (Humid)",
      dewPoint: 25,
      uvIndex: "5.8 (High)",
      brightnessIndex: "9 (Intense)",
      cloudCover: "60%",
      visibility: "10 km",
      cloudCeiling: "500 m",
      tideLevel: 3.6,
      floodRisk: "LOW" as const,
      pumpsArmed: "3 SPS Standby",
      vulnerability: "Milan Subway dry"
    },
    {
      id: "11 AM",
      hour: "11 AM",
      temp: 31,
      realFeel: 39,
      realFeelShade: 34,
      condition: "Intermittent clouds",
      icon: "🌤️",
      rainProb: "25%",
      rainMm: 5,
      wind: "W 11 km/h",
      windGusts: "24 km/h",
      humidity: 73,
      indoorHumidity: "73% (Humid)",
      dewPoint: 25,
      uvIndex: "7.2 (Very High)",
      brightnessIndex: "10 (Extreme)",
      cloudCover: "65%",
      visibility: "10 km",
      cloudCeiling: "480 m",
      tideLevel: 3.8,
      floodRisk: "LOW" as const,
      pumpsArmed: "4 SPS Standby",
      vulnerability: "Minor spray at Marine Drive promenade"
    },
    {
      id: "12 PM",
      hour: "12 PM",
      temp: 31,
      realFeel: 39,
      realFeelShade: 35,
      condition: "Mostly cloudy",
      icon: "⛅",
      rainProb: "30%",
      rainMm: 8,
      wind: "W 13 km/h",
      windGusts: "26 km/h",
      humidity: 75,
      indoorHumidity: "75% (Extremely Humid)",
      dewPoint: 25,
      uvIndex: "6.5 (High)",
      brightnessIndex: "8 (Bright)",
      cloudCover: "72%",
      visibility: "10 km",
      cloudCeiling: "450 m",
      tideLevel: 4.0,
      floodRisk: "MODERATE" as const,
      pumpsArmed: "Britannia SPS Active",
      vulnerability: "Hindmata sluice gates closed"
    },
    {
      id: "1 PM",
      hour: "1 PM",
      temp: 32,
      realFeel: 40,
      realFeelShade: 35,
      condition: "Intermittent clouds",
      icon: "🌤️",
      rainProb: "35%",
      rainMm: 12,
      wind: "W 13 km/h",
      windGusts: "28 km/h",
      humidity: 76,
      indoorHumidity: "76% (Extremely Humid)",
      dewPoint: 26,
      uvIndex: "6.0 (High)",
      brightnessIndex: "8 (Bright)",
      cloudCover: "70%",
      visibility: "9 km",
      cloudCeiling: "450 m",
      tideLevel: 4.1,
      floodRisk: "MODERATE" as const,
      pumpsArmed: "6 SPS Active",
      vulnerability: "Spring tide high level surge"
    },
    {
      id: "2 PM",
      hour: "2 PM",
      temp: 31,
      realFeel: 39,
      realFeelShade: 34,
      condition: "Partly sunny",
      icon: "⛅",
      rainProb: "35%",
      rainMm: 15,
      wind: "W 15 km/h",
      windGusts: "30 km/h",
      humidity: 78,
      indoorHumidity: "78% (Extremely Humid)",
      dewPoint: 26,
      uvIndex: "4.5 (Moderate)",
      brightnessIndex: "7 (Bright)",
      cloudCover: "75%",
      visibility: "9 km",
      cloudCeiling: "420 m",
      tideLevel: 4.2,
      floodRisk: "MODERATE" as const,
      pumpsArmed: "6 SPS Active",
      vulnerability: "Sion Priyadarshini water accumulation"
    },
    {
      id: "3 PM",
      hour: "3 PM",
      temp: 31,
      realFeel: 37,
      realFeelShade: 34,
      condition: "Partly sunny",
      icon: "⛅",
      rainProb: "38%",
      rainMm: 22,
      wind: "W 17 km/h",
      windGusts: "32 km/h",
      humidity: 79,
      indoorHumidity: "79% (Extremely Humid)",
      dewPoint: 26,
      uvIndex: "3.2 (Moderate)",
      brightnessIndex: "6 (Fair)",
      cloudCover: "80%",
      visibility: "8 km",
      cloudCeiling: "400 m",
      tideLevel: 4.0,
      floodRisk: "MODERATE" as const,
      pumpsArmed: "7 SPS Active",
      vulnerability: "Kurla LBS Marg slow traffic"
    },
    {
      id: "4 PM",
      hour: "4 PM",
      temp: 31,
      realFeel: 35,
      realFeelShade: 33,
      condition: "Mostly cloudy w/ t-storms",
      icon: "⛈️",
      rainProb: "53%",
      rainMm: 55,
      wind: "W 17 km/h",
      windGusts: "36 km/h",
      humidity: 82,
      indoorHumidity: "82% (Extremely Humid)",
      dewPoint: 26,
      uvIndex: "2.0 (Low)",
      brightnessIndex: "5 (Cloudy)",
      cloudCover: "88%",
      visibility: "6 km",
      cloudCeiling: "350 m",
      tideLevel: 3.8,
      floodRisk: "CRITICAL" as const,
      pumpsArmed: "All 9 SPS Armed",
      vulnerability: "Milan Subway 35cm inundation alert"
    },
    {
      id: "5 PM",
      hour: "5 PM",
      temp: 30,
      realFeel: 35,
      realFeelShade: 32,
      condition: "Partly sunny w/ t-storms",
      icon: "⛈️",
      rainProb: "58%",
      rainMm: 75,
      wind: "W 15 km/h",
      windGusts: "35 km/h",
      humidity: 84,
      indoorHumidity: "84% (Extremely Humid)",
      dewPoint: 26,
      uvIndex: "1.0 (Low)",
      brightnessIndex: "4 (Overcast)",
      cloudCover: "92%",
      visibility: "5 km",
      cloudCeiling: "300 m",
      tideLevel: 3.5,
      floodRisk: "CRITICAL" as const,
      pumpsArmed: "All 9 SPS Armed",
      vulnerability: "Andheri & Milan Subway traffic diverted"
    },
    {
      id: "6 PM",
      hour: "6 PM",
      temp: 30,
      realFeel: 35,
      realFeelShade: 32,
      condition: "Mostly sunny",
      icon: "🌤️",
      rainProb: "49%",
      rainMm: 40,
      wind: "W 15 km/h",
      windGusts: "30 km/h",
      humidity: 83,
      indoorHumidity: "83% (Extremely Humid)",
      dewPoint: 25,
      uvIndex: "0.5 (Low)",
      brightnessIndex: "4 (Dusk)",
      cloudCover: "85%",
      visibility: "7 km",
      cloudCeiling: "380 m",
      tideLevel: 3.1,
      floodRisk: "MODERATE" as const,
      pumpsArmed: "8 SPS Active",
      vulnerability: "Mithi River receding below danger mark"
    },
    {
      id: "7 PM",
      hour: "7 PM",
      temp: 30,
      realFeel: 33,
      realFeelShade: 30,
      condition: "Mostly clear",
      icon: "🌙",
      rainProb: "43%",
      rainMm: 25,
      wind: "W 15 km/h",
      windGusts: "28 km/h",
      humidity: 82,
      indoorHumidity: "82% (Extremely Humid)",
      dewPoint: 25,
      uvIndex: "0.0 (None)",
      brightnessIndex: "0 (Night)",
      cloudCover: "70%",
      visibility: "8 km",
      cloudCeiling: "420 m",
      tideLevel: 2.8,
      floodRisk: "MODERATE" as const,
      pumpsArmed: "6 SPS Active",
      vulnerability: "Thane Reti Bunder discharge clear"
    },
    {
      id: "8 PM",
      hour: "8 PM",
      temp: 29,
      realFeel: 33,
      realFeelShade: 29,
      condition: "Intermittent clouds",
      icon: "🌙",
      rainProb: "47%",
      rainMm: 15,
      wind: "W 13 km/h",
      windGusts: "26 km/h",
      humidity: 83,
      indoorHumidity: "83% (Extremely Humid)",
      dewPoint: 25,
      uvIndex: "0.0 (None)",
      brightnessIndex: "0 (Night)",
      cloudCover: "65%",
      visibility: "8 km",
      cloudCeiling: "450 m",
      tideLevel: 2.5,
      floodRisk: "LOW" as const,
      pumpsArmed: "4 SPS Active",
      vulnerability: "Kurla road waters drained"
    },
    {
      id: "9 PM",
      hour: "9 PM",
      temp: 28,
      realFeel: 31,
      realFeelShade: 28,
      condition: "Mostly cloudy w/ t-storms",
      icon: "⛈️",
      rainProb: "59%",
      rainMm: 45,
      wind: "W 11 km/h",
      windGusts: "26 km/h",
      humidity: 85,
      indoorHumidity: "85% (Extremely Humid)",
      dewPoint: 25,
      uvIndex: "0.0 (None)",
      brightnessIndex: "0 (Night)",
      cloudCover: "80%",
      visibility: "7 km",
      cloudCeiling: "400 m",
      tideLevel: 2.7,
      floodRisk: "MODERATE" as const,
      pumpsArmed: "6 SPS Active",
      vulnerability: "Night surge preparedness alert"
    },
    {
      id: "10 PM",
      hour: "10 PM",
      temp: 28,
      realFeel: 31,
      realFeelShade: 28,
      condition: "Partly cloudy w/ t-storms",
      icon: "⛈️",
      rainProb: "56%",
      rainMm: 35,
      wind: "WSW 11 km/h",
      windGusts: "24 km/h",
      humidity: 86,
      indoorHumidity: "86% (Extremely Humid)",
      dewPoint: 25,
      uvIndex: "0.0 (None)",
      brightnessIndex: "0 (Night)",
      cloudCover: "78%",
      visibility: "8 km",
      cloudCeiling: "420 m",
      tideLevel: 3.0,
      floodRisk: "LOW" as const,
      pumpsArmed: "4 SPS Active",
      vulnerability: "All drainage outfalls monitored"
    },
    {
      id: "11 PM",
      hour: "11 PM",
      temp: 29,
      realFeel: 33,
      realFeelShade: 29,
      condition: "Partly cloudy",
      icon: "🌙",
      rainProb: "47%",
      rainMm: 10,
      wind: "WSW 11 km/h",
      windGusts: "22 km/h",
      humidity: 84,
      indoorHumidity: "84% (Extremely Humid)",
      dewPoint: 25,
      uvIndex: "0.0 (None)",
      brightnessIndex: "0 (Night)",
      cloudCover: "60%",
      visibility: "9 km",
      cloudCeiling: "480 m",
      tideLevel: 3.3,
      floodRisk: "SAFE" as const,
      pumpsArmed: "2 SPS Active",
      vulnerability: "Quiet midnight conditions"
    }
  ];

  // Static fallback for AccuWeather-inspired 10-Day / 15-Day Synoptic Monsoon Forecast
  const STATIC_TEN_DAY_FORECAST = [
    {
      day: "MON",
      date: "9/7",
      icon: "🌤️",
      hiTemp: 32,
      loTemp: 27,
      rainProb: "55%",
      rainMm: 45,
      summary: "Sun breaking through clouds at times with a stray thunderstorm this afternoon",
      realFeel: 40,
      realFeelShade: 35,
      maxUv: "10.0 (Very High)",
      wind: "W 13 km/h",
      precipHours: "1.5",
      rainHours: "1.5",
      tidePeak: 4.1,
      spsStatus: "6 SPS Armed",
      vulnerability: "Spring tide surge coincidence at Marine Drive & Dadar",
      severity: "AMBER ALERT",
      badgeColor: "text-amber-300 bg-amber-500/20 border-amber-400/40"
    },
    {
      day: "TUE",
      date: "9/8",
      icon: "⛈️",
      hiTemp: 32,
      loTemp: 27,
      rainProb: "68%",
      rainMm: 85,
      summary: "Times of clouds and sun with a couple of showers and a thunderstorm in the afternoon",
      realFeel: 39,
      realFeelShade: 34,
      maxUv: "10.0 (Very High)",
      wind: "WNW 15 km/h",
      precipHours: "1.5",
      rainHours: "1.5",
      tidePeak: 4.3,
      spsStatus: "All 9 SPS Armed",
      vulnerability: "Milan & Hindmata Subways under heavy inundation alert",
      severity: "RED ALERT",
      badgeColor: "text-red-300 bg-red-500/25 border-red-400/50 shadow-[0_0_12px_rgba(239,68,68,0.35)]"
    },
    {
      day: "WED",
      date: "9/9",
      icon: "🌤️",
      hiTemp: 32,
      loTemp: 27,
      rainProb: "55%",
      rainMm: 40,
      summary: "A stray thunderstorm in the morning; otherwise, times of clouds and sun",
      realFeel: 40,
      realFeelShade: 36,
      maxUv: "10.0 (Very High)",
      wind: "WNW 15 km/h",
      precipHours: "1.5",
      rainHours: "1.5",
      tidePeak: 4.2,
      spsStatus: "7 SPS Active",
      vulnerability: "Kurla LBS Marg morning drainage slowdown",
      severity: "AMBER ALERT",
      badgeColor: "text-amber-300 bg-amber-500/20 border-amber-400/40"
    },
    {
      day: "THU",
      date: "9/10",
      icon: "🌦️",
      hiTemp: 32,
      loTemp: 27,
      rainProb: "74%",
      rainMm: 65,
      summary: "Variable cloudiness; morning showers followed by a shower in spots in the afternoon",
      realFeel: 40,
      realFeelShade: 35,
      maxUv: "9.0 (Very High)",
      wind: "WNW 13 km/h",
      precipHours: "2",
      rainHours: "2",
      tidePeak: 4.0,
      spsStatus: "6 SPS Active",
      vulnerability: "Andheri subway intermittent water logging",
      severity: "AMBER ALERT",
      badgeColor: "text-amber-300 bg-amber-500/20 border-amber-400/40"
    },
    {
      day: "FRI",
      date: "9/11",
      icon: "🌧️",
      hiTemp: 32,
      loTemp: 27,
      rainProb: "56%",
      rainMm: 30,
      summary: "Mostly cloudy with a little rain",
      realFeel: 39,
      realFeelShade: 36,
      maxUv: "6.0 (High)",
      wind: "WNW 11 km/h",
      precipHours: "1.5",
      rainHours: "1.5",
      tidePeak: 3.6,
      spsStatus: "4 SPS Active",
      vulnerability: "Normal stormwater discharge at Love Grove & Cleveland",
      severity: "MODERATE",
      badgeColor: "text-cyan-300 bg-cyan-500/20 border-cyan-400/30"
    },
    {
      day: "SAT",
      date: "9/12",
      icon: "🌧️",
      hiTemp: 32,
      loTemp: 27,
      rainProb: "59%",
      rainMm: 35,
      summary: "Mostly cloudy with a little rain",
      realFeel: 39,
      realFeelShade: 36,
      maxUv: "7.0 (High)",
      wind: "WNW 13 km/h",
      precipHours: "2",
      rainHours: "2",
      tidePeak: 3.3,
      spsStatus: "3 SPS Active",
      vulnerability: "Mithi river level safe at 2.4m below flood mark",
      severity: "MODERATE",
      badgeColor: "text-cyan-300 bg-cyan-500/20 border-cyan-400/30"
    },
    {
      day: "SUN",
      date: "9/13",
      icon: "🌧️",
      hiTemp: 32,
      loTemp: 26,
      rainProb: "59%",
      rainMm: 32,
      summary: "Mostly cloudy; a little rain in the morning followed by a shower in spots in the afternoon",
      realFeel: 39,
      realFeelShade: 36,
      maxUv: "9.0 (Very High)",
      wind: "SW 9 km/h",
      precipHours: "1.5",
      rainHours: "1.5",
      tidePeak: 3.1,
      spsStatus: "2 SPS Standby",
      vulnerability: "Sion Priyadarshini parkway clear",
      severity: "SAFE",
      badgeColor: "text-emerald-300 bg-emerald-500/20 border-emerald-400/30"
    },
    {
      day: "MON",
      date: "9/14",
      icon: "🌧️",
      hiTemp: 32,
      loTemp: 27,
      rainProb: "55%",
      rainMm: 25,
      summary: "Mostly cloudy with a little rain",
      realFeel: 38,
      realFeelShade: 35,
      maxUv: "8.0 (Very High)",
      wind: "SW 9 km/h",
      precipHours: "2",
      rainHours: "2",
      tidePeak: 3.0,
      spsStatus: "2 SPS Standby",
      vulnerability: "Normal low-tide gravity discharge operational",
      severity: "SAFE",
      badgeColor: "text-emerald-300 bg-emerald-500/20 border-emerald-400/30"
    },
    {
      day: "TUE",
      date: "9/15",
      icon: "🌧️",
      hiTemp: 32,
      loTemp: 27,
      rainProb: "57%",
      rainMm: 30,
      summary: "Mostly cloudy; a little morning rain followed by a shower in spots in the afternoon",
      realFeel: 39,
      realFeelShade: 36,
      maxUv: "7.0 (High)",
      wind: "WSW 6 km/h",
      precipHours: "2.5",
      rainHours: "2.5",
      tidePeak: 3.2,
      spsStatus: "3 SPS Standby",
      vulnerability: "Eastern Express Highway clear",
      severity: "SAFE",
      badgeColor: "text-emerald-300 bg-emerald-500/20 border-emerald-400/30"
    },
    {
      day: "WED",
      date: "9/16",
      icon: "⛅",
      hiTemp: 32,
      loTemp: 27,
      rainProb: "58%",
      rainMm: 28,
      summary: "Cloudy intervals with afternoon passing showers",
      realFeel: 40,
      realFeelShade: 36,
      maxUv: "6.5 (High)",
      wind: "WSW 8 km/h",
      precipHours: "2.0",
      rainHours: "2.0",
      tidePeak: 3.4,
      spsStatus: "3 SPS Active",
      vulnerability: "Thane Reti Bunder outfall clear",
      severity: "SAFE",
      badgeColor: "text-emerald-300 bg-emerald-500/20 border-emerald-400/30"
    },
    {
      day: "THU",
      date: "9/17",
      icon: "🌦️",
      hiTemp: 32,
      loTemp: 26,
      rainProb: "62%",
      rainMm: 45,
      summary: "Humid with morning downpour and broken clouds in afternoon",
      realFeel: 39,
      realFeelShade: 35,
      maxUv: "5.0 (Moderate)",
      wind: "SW 10 km/h",
      precipHours: "2.5",
      rainHours: "2.5",
      tidePeak: 3.7,
      spsStatus: "4 SPS Active",
      vulnerability: "Dadar Hindmata holding tank armed",
      severity: "MODERATE",
      badgeColor: "text-cyan-300 bg-cyan-500/20 border-cyan-400/30"
    },
    {
      day: "FRI",
      date: "9/18",
      icon: "🌧️",
      hiTemp: 32,
      loTemp: 27,
      rainProb: "60%",
      rainMm: 50,
      summary: "Periods of rain",
      realFeel: 41,
      realFeelShade: 37,
      maxUv: "4.0 (Moderate)",
      wind: "WSW 6 km/h",
      precipHours: "3.5",
      rainHours: "3.5",
      tidePeak: 3.9,
      spsStatus: "6 SPS Active",
      vulnerability: "Western suburbs localized water logging advisory",
      severity: "AMBER ALERT",
      badgeColor: "text-amber-300 bg-amber-500/20 border-amber-400/40"
    },
    {
      day: "SAT",
      date: "9/19",
      icon: "⛈️",
      hiTemp: 31,
      loTemp: 26,
      rainProb: "64%",
      rainMm: 70,
      summary: "Cloudy with a couple of showers and a thunderstorm",
      realFeel: 35,
      realFeelShade: 35,
      maxUv: "2.0 (Low)",
      wind: "SW 15 km/h",
      precipHours: "2",
      rainHours: "2",
      tidePeak: 4.1,
      spsStatus: "8 SPS Armed",
      vulnerability: "Milan Subway high-water automated barricades alert",
      severity: "RED ALERT",
      badgeColor: "text-red-300 bg-red-500/25 border-red-400/50 shadow-[0_0_12px_rgba(239,68,68,0.35)]"
    },
    {
      day: "SUN",
      date: "9/20",
      icon: "🌤️",
      hiTemp: 32,
      loTemp: 25,
      rainProb: "58%",
      rainMm: 40,
      summary: "Sun and clouds with a thunderstorm in the afternoon",
      realFeel: 37,
      realFeelShade: 35,
      maxUv: "6.0 (High)",
      wind: "SW 15 km/h",
      precipHours: "2",
      rainHours: "2",
      tidePeak: 3.8,
      spsStatus: "5 SPS Active",
      vulnerability: "Thane Mumbra creek tidal elevation surveillance",
      severity: "AMBER ALERT",
      badgeColor: "text-amber-300 bg-amber-500/20 border-amber-400/40"
    },
    {
      day: "MON",
      date: "9/21",
      icon: "🌤️",
      hiTemp: 31,
      loTemp: 25,
      rainProb: "55%",
      rainMm: 35,
      summary: "A morning thundershower; otherwise, partly sunny",
      realFeel: 38,
      realFeelShade: 34,
      maxUv: "10.0 (Very High)",
      wind: "S 13 km/h",
      precipHours: "1.5",
      rainHours: "1.5",
      tidePeak: 3.5,
      spsStatus: "3 SPS Active",
      vulnerability: "Receding monsoon conditions; normal tidal range",
      severity: "MODERATE",
      badgeColor: "text-cyan-300 bg-cyan-500/20 border-cyan-400/30"
    }
  ];

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
              ? "Sun breaking through clouds at times with a passing localized shower"
              : "Partly cloudy with pleasant sea breezes and dry conditions"));

        return {
          day: dayName,
          date: dateLabel,
          icon,
          hiTemp: Math.round(df.temp_max_c),
          loTemp: Math.round(df.temp_min_c),
          rainProb: `${Math.min(95, Math.round(rainMm * 1.5 + 20))}%`,
          rainMm,
          summary,
          realFeel: Math.round(df.temp_max_c + 6),
          realFeelShade: Math.round(df.temp_max_c + 3),
          maxUv: "9.0 (Very High)",
          wind: `W ${Math.round(df.wind_speed_max_kmh)} km/h`,
          precipHours: rainMm > 20 ? "3.5" : "1.5",
          rainHours: rainMm > 20 ? "3.5" : "1.5",
          tidePeak: 3.8,
          spsStatus: rainMm >= 40 ? "All 9 SPS Armed" : "4 SPS Armed",
          vulnerability: rainMm >= 40 ? "Subways & lowlines on inundation watch" : "Normal drainage capacity",
          severity,
          badgeColor,
        };
      });
    }
    return STATIC_TEN_DAY_FORECAST;
  }, [liveTelemetry?.daily_forecast]);

  return (
    <div className="w-full h-full overflow-y-auto bg-transparent text-slate-100 p-4 sm:p-6 font-sans select-none">
      <div className="max-w-4xl mx-auto space-y-4 pb-16">
        
        {/* CARD 1: TONIGHT'S WEATHER & ALERTS (Frosted Acrylic) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 scroll-reveal">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 font-bold glass-text-title">
              TONIGHT'S WEATHER & HYDROLOGY ALERT
            </span>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-3 py-0.5 rounded-full border border-cyan-400/40 shadow-sm backdrop-blur-md">
              SUN, SEP 6 • IST
            </span>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm text-slate-200">
            <div className="flex items-start gap-2.5">
              <span className="text-base sm:text-lg shrink-0">⛈️</span>
              <p>
                <strong className="text-white font-semibold">Tonight:</strong> Partly cloudy with localized thunderstorm cells developing over Kurla, Hindmata & Thane Mumbra late.&nbsp;
                <span className="text-cyan-300 font-mono font-bold glass-text-glow">Lo: 26°C</span>
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-base sm:text-lg shrink-0">🌤️</span>
              <p>
                <strong className="text-white font-semibold">Tomorrow:</strong> Sun breaking through clouds at times with stray thunderstorms in the afternoon coinciding with&nbsp;
                <span className="text-amber-300 font-mono font-bold">14:15 IST High Tide (4.2m)</span>.&nbsp;
                <span className="text-cyan-300 font-mono font-bold glass-text-glow">Hi: 32°C</span>
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: CURRENT WEATHER & HYDROLOGICAL METRICS (Frosted Acrylic) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 scroll-reveal">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 font-bold glass-text-title">
              CURRENT WEATHER & TELEMETRY
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
                  {rainMmHr > 0 ? `Rain Active (${rainMmHr} mm/h)` : "Monsoon Overcast • Humid"}
                </div>
              </div>
            </div>

            {/* Right Col: Hydrology & Meteorological Metrics Grid (Frosted Acrylic Sub-Cards) */}
            <div className="md:col-span-7 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="glass-panel-subtle p-3.5 rounded-2xl">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Wind className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="text-[11px] font-semibold text-slate-300">WIND</span>
                </div>
                <div className="text-white font-bold text-sm">
                  WSW {Math.round(windKmh)} km/h
                </div>
                <div className="text-[10px] text-slate-400">Gusts: {Math.round(windKmh * 1.5)} km/h</div>
              </div>

              <div className="glass-panel-subtle p-3.5 rounded-2xl">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Waves className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="text-[11px] font-semibold text-slate-300">ARABIAN SEA TIDE</span>
                </div>
                <div className={`font-bold text-sm ${tideM >= 3.8 ? "text-amber-300" : "text-cyan-300"}`}>
                  {tideM.toFixed(2)} m
                </div>
                <div className="text-[10px] text-slate-400">
                  {tideM >= 4.0 ? "Spring Tide Peak" : "Moderate Surge"}
                </div>
              </div>

              <div className="glass-panel-subtle p-3.5 rounded-2xl">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-300" />
                  <span className="text-[11px] font-semibold text-slate-300">CATCHMENT RUNOFF</span>
                </div>
                <div className="text-white font-bold text-sm">
                  {Math.max(5.2, (rainMmHr * 0.45 + 5.2)).toFixed(1)} m³/s
                </div>
                <div className="text-[10px] text-slate-400">Mithi & Parsik basins</div>
              </div>

              <div className="glass-panel-subtle p-3.5 rounded-2xl">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-[11px] font-semibold text-slate-300">DEWATERING PUMPS</span>
                </div>
                <div className="text-emerald-300 font-bold text-sm">
                  9 SPS Active
                </div>
                <div className="text-[10px] text-slate-400">264 cumecs capacity</div>
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
                LOOKING AHEAD • HYDROLOGICAL ADVISORY
              </span>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                Thunderstorm cells expected late Sunday night with high tide surge coincidence (+4.1m). Lowline subways (Milan, Andheri, Hindmata, Reti Bunder) under automated sensor surveillance.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenPriorityModal}
            className="glass-button shrink-0 px-3.5 py-2 text-amber-200 rounded-2xl text-xs font-semibold font-mono flex items-center gap-1.5"
          >
            <span>Priority Queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 4: MUMBAI & THANE WEATHER RADAR PREVIEW (Frosted Acrylic) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 overflow-hidden scroll-reveal">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 font-bold glass-text-title">
                MUMBAI & THANE METRO DOPPLER RADAR
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-400/40">
                100 KM RANGE
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>RADAR ONLINE</span>
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
              <span>Open in Full 3D Twin Map</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-slate-400 font-mono">
              Active Layer: <strong className="text-cyan-300">{radarLayer.toUpperCase()}</strong>
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
                <span>Precipitation</span>
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
                <span>Clouds</span>
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
                <span>Flood Depths</span>
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
                HOURLY FORECAST & HYDROLOGY SIMULATION
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-300 bg-white/[0.06] px-2.5 py-1 rounded-xl border border-white/10">
                16-Hour Detailed Outlook • Click any hour to expand
              </span>
            </div>
          </div>

          {/* 16-Hour Bar Hyetograph & Intensity Visualizer */}
          <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  16-Hour Hyetograph (Precipitation & Risk Distribution)
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                Peak Rain: {Math.max(...HOURLY_DETAILS.map((h) => h.rainMm))} mm/hr
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
                10-DAY FORECAST • SEPTEMBER 7 – SEPTEMBER 21
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
