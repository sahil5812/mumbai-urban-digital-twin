"use client";

import React from "react";
import { SimulationRequest, TimelineForecastStep } from "../lib/types";
import { Sliders, CloudRain, Waves, Trash2, Zap, Clock, ShieldAlert, Sparkles } from "lucide-react";

interface ScenarioControlsProps {
  params: SimulationRequest;
  onChange: (newParams: SimulationRequest) => void;
  isLoading: boolean;
  onApplyPreset: (name: string, rain: number, tide: number, silt: number) => void;
  timelineForecast?: TimelineForecastStep[];
  selectedTimelineIndex?: number;
  onSelectTimelineStep?: (index: number) => void;
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  params,
  onChange,
  isLoading,
  onApplyPreset,
  timelineForecast = [],
  selectedTimelineIndex = 0,
  onSelectTimelineStep,
}) => {
  const presets = [
    { name: "Clear Sky Baseline", rain: 0, tide: 2.4, silt: 20, label: "Clear 0mm", icon: "☀️", desc: "0mm/h • 2.4m" },
    { name: "Normal Monsoon", rain: 35, tide: 2.5, silt: 25, label: "Normal 35mm", icon: "🌤️", desc: "35mm/h • 2.5m" },
    { name: "Heavy Downpour (150mm)", rain: 150, tide: 4.2, silt: 50, label: "Heavy 150mm", icon: "🌧️", desc: "150mm/h • 4.2m" },
    { name: "26/7 Cloudburst Surge", rain: 260, tide: 4.8, silt: 80, label: "26/7 Surge", icon: "⚡", desc: "260mm/h • 4.8m" },
  ];

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.18)] flex flex-col gap-3.5 text-slate-200 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white glass-text-title">
            Scenario Sandbox & What-If
          </h2>
        </div>
        {isLoading && (
          <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 bg-white/[0.05] px-2 py-0.5 rounded-lg border border-white/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Computing ML...
          </span>
        )}
      </div>

      {/* 0-3 Hour Predictive Timeline Scrubber */}
      {timelineForecast.length > 0 && (
        <div className="glass-panel-subtle p-3 rounded-2xl border-cyan-400/30 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-cyan-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              0-3 HOUR NOWCAST TIMELINE:
            </span>
            <span className="font-mono text-white font-extrabold glass-text-glow">
              {timelineForecast[selectedTimelineIndex]?.time_offset}
            </span>
          </div>

          {/* Time Tabs */}
          <div className="grid grid-cols-6 gap-1.5">
            {timelineForecast.map((step, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectTimelineStep && onSelectTimelineStep(idx);
                }}
                className={`py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all border ${
                  selectedTimelineIndex === idx
                    ? "glass-button-primary text-white scale-105 shadow-[0_0_12px_rgba(6,182,212,0.5)] border-cyan-400/60"
                    : "glass-button text-slate-400 hover:text-white"
                }`}
              >
                {step.time_offset.split(" ")[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 pt-0.5">
            <span>Peak Depth: <strong className="text-cyan-300 font-bold">{timelineForecast[selectedTimelineIndex]?.city_max_depth_cm}cm</strong></span>
            <span>Critical Spots: <strong className="text-red-300 font-bold">{timelineForecast[selectedTimelineIndex]?.critical_hotspots_count}</strong></span>
          </div>
        </div>
      )}

      {/* Scenario Presets */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 glass-text-title">
          Monsoon Stress-Test Presets:
        </span>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((preset) => {
            const isActive = params.rainfall_mm_hr === preset.rain;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onApplyPreset(preset.name, preset.rain, preset.tide, preset.silt);
                }}
                className={`p-2 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isActive
                    ? "glass-button-primary border-amber-400/60 shadow-[0_0_16px_rgba(245,158,11,0.25)] text-white"
                    : "glass-button hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-white truncate">
                  <span>{preset.icon}</span>
                  <span className={isActive ? "text-amber-200" : ""}>{preset.label}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-300">{preset.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-3 pt-1">
        {/* Rainfall */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              Rainfall Rate:
            </span>
            <span className="font-mono font-bold text-blue-300 glass-text-glow">{params.rainfall_mm_hr} mm/h</span>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            step="5"
            value={params.rainfall_mm_hr}
            onChange={(e) => onChange({ ...params, rainfall_mm_hr: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400 backdrop-blur-md"
          />
        </div>

        {/* Tide Level */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              Arabian Sea Tide:
            </span>
            <span className="font-mono font-bold text-cyan-300 glass-text-glow">{params.tide_level_m} m</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.5"
            step="0.1"
            value={params.tide_level_m}
            onChange={(e) => onChange({ ...params, tide_level_m: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 backdrop-blur-md"
          />
        </div>

        {/* Siltation */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <Trash2 className="w-3.5 h-3.5 text-amber-400" />
              Drain Siltation:
            </span>
            <span className="font-mono font-bold text-amber-300 glass-text-glow">{params.siltation_pct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={params.siltation_pct}
            onChange={(e) => onChange({ ...params, siltation_pct: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400 backdrop-blur-md"
          />
        </div>
      </div>
    </div>
  );
};
