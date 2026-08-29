"use client";

import React from "react";
import { CloudRain, Waves, Trash2, Zap } from "lucide-react";
import { SimulationRequest } from "../lib/types";

interface ScenarioControlsProps {
  params: SimulationRequest;
  onChange: (newParams: SimulationRequest) => void;
  isLoading: boolean;
  onApplyPreset: (presetName: string, rain: number, tide: number, silt: number) => void;
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  params,
  onChange,
  isLoading,
  onApplyPreset,
}) => {
  return (
    <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-2xl flex flex-col gap-4 text-slate-200">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
            What-If Scenario Sandbox
          </h2>
        </div>
        {isLoading && (
          <span className="text-[10px] text-cyan-400 animate-pulse font-mono font-medium">
            SIMULATING...
          </span>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Monsoon Scenario Presets:
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyPreset("Normal Monsoon", 35, 2.5, 20); }}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-center ${
              params.rainfall_mm_hr <= 45 && params.tide_level_m <= 3.0
                ? "bg-blue-600/30 border-blue-500 text-blue-300"
                : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
            }`}
          >
            🌤️ Normal
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyPreset("Heavy Downpour (150mm)", 150, 4.2, 50); }}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-center ${
              params.rainfall_mm_hr >= 120 && params.rainfall_mm_hr < 220
                ? "bg-amber-600/30 border-amber-500 text-amber-300"
                : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
            }`}
          >
            🌧️ Heavy 150mm
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyPreset("July 26 Cloudburst + High Tide", 260, 4.8, 75); }}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-center ${
              params.rainfall_mm_hr >= 220
                ? "bg-red-600/30 border-red-500 text-red-300 animate-pulse"
                : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
            }`}
          >
            ⚡ 26/7 Surge
          </button>
        </div>
      </div>

      {/* Slider 1: Rainfall Intensity */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>Rainfall Intensity:</span>
          </span>
          <span className="font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
            {params.rainfall_mm_hr} mm/hr
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="300"
          step="5"
          value={params.rainfall_mm_hr}
          onChange={(e) => onChange({ ...params, rainfall_mm_hr: parseFloat(e.target.value) })}
          className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0 mm (Dry)</span>
          <span>100 mm (Heavy)</span>
          <span>300 mm (Extreme)</span>
        </div>
      </div>

      {/* Slider 2: Arabian Sea Tide Height */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Arabian Sea Tide:</span>
          </span>
          <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
            params.tide_level_m >= 4.2
              ? "text-red-400 bg-red-950/60 border-red-800/40"
              : "text-cyan-400 bg-cyan-950/60 border-cyan-800/40"
          }`}>
            {params.tide_level_m.toFixed(1)} m {params.tide_level_m >= 4.2 ? "(LOCKOUT)" : "(Normal)"}
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="5.2"
          step="0.1"
          value={params.tide_level_m}
          onChange={(e) => onChange({ ...params, tide_level_m: parseFloat(e.target.value) })}
          className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0.5 m (Low)</span>
          <span>3.8 m (Gate Crest)</span>
          <span>5.2 m (Spring Tide)</span>
        </div>
      </div>

      {/* Slider 3: Drainage Siltation % */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Trash2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Drain Siltation / Debris:</span>
          </span>
          <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
            {params.siltation_pct}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={params.siltation_pct}
          onChange={(e) => onChange({ ...params, siltation_pct: parseFloat(e.target.value) })}
          className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0% (Clean)</span>
          <span>50% (Choked)</span>
          <span>100% (Blocked)</span>
        </div>
      </div>
    </div>
  );
};
