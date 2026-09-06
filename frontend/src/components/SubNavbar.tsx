"use client";

import React, { useState } from "react";
import { 
  CloudRain, 
  Clock, 
  Calendar, 
  Radar, 
  Zap, 
  Activity, 
  Wind, 
  ChevronRight,
  TrendingUp,
  BarChart3,
  Waves,
  X
} from "lucide-react";

export type SubNavTab = 
  | "TODAY" 
  | "HOURLY" 
  | "10-DAY" 
  | "RADAR" 
  | "MINUTECAST" 
  | "MONTHLY" 
  | "AIR QUALITY" 
  | "HEALTH & ACTIVITIES";

interface SubNavbarProps {
  activeTab: SubNavTab;
  onTabChange: (tab: SubNavTab) => void;
  onOpenPriorityModal?: () => void;
  onOpenGraphModal?: () => void;
  onToggleScenarioControls?: () => void;
  isLiveMode?: boolean;
}

export const SubNavbar: React.FC<SubNavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenPriorityModal,
  onOpenGraphModal,
  onToggleScenarioControls,
  isLiveMode = false,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const TABS: { id: SubNavTab; label: string; badge?: string }[] = [
    { id: "TODAY", label: "TODAY" },
    { id: "HOURLY", label: "HOURLY", badge: "0-3h" },
    { id: "10-DAY", label: "10-DAY" },
    { id: "RADAR", label: "RADAR", badge: "LIVE" },
    { id: "MINUTECAST", label: "MINUTECAST™" },
    { id: "MONTHLY", label: "MONTHLY" },
    { id: "AIR QUALITY", label: "AIR QUALITY" },
    { id: "HEALTH & ACTIVITIES", label: "HEALTH & ACTIVITIES" },
  ];

  const handleTabClick = (tabId: SubNavTab) => {
    onTabChange(tabId);

    if (tabId === "HEALTH & ACTIVITIES" && onOpenPriorityModal) {
      onOpenPriorityModal();
    } else if (tabId === "RADAR" && onToggleScenarioControls) {
      onToggleScenarioControls();
    } else if (tabId === "10-DAY" || tabId === "MONTHLY" || tabId === "AIR QUALITY" || tabId === "MINUTECAST") {
      setActiveModal(tabId);
    } else {
      setActiveModal(null);
    }
  };

  return (
    <>
      <nav className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 select-none z-20 sticky top-16 text-slate-300 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-0.5">
          {/* Main Tabs Strip - Closely Styled to Reference Image */}
          <div className="flex items-center space-x-1 sm:space-x-3 shrink-0 font-sans text-[11px] sm:text-xs font-semibold tracking-wider uppercase">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative py-2.5 px-2.5 sm:px-3.5 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "text-cyan-400 font-bold"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                      tab.badge === "LIVE" 
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" 
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                  {/* Active Underline Indicator matching reference aesthetic */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Indicator Divider & Status */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-slate-400 border-l border-slate-800 pl-3">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              MUMBAI-THANE METRO RADAR
            </span>
          </div>
        </div>
      </nav>

      {/* Interactive Modal for Extended Tabs */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 w-full max-w-lg shadow-2xl text-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <CloudRain className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm uppercase tracking-wider text-slate-100 font-mono">
                  {activeModal} • WEATHER & HYDROLOGY INTELLIGENCE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Based on Tab */}
            {activeModal === "10-DAY" && (
              <div className="flex flex-col gap-3 text-xs">
                <p className="text-slate-400">10-Day Synoptic Weather & Arabian Sea Spring Tide Outlook:</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
                  {["Day 1 (Today)", "Day 2", "Day 3", "Day 4", "Day 5"].map((d, i) => (
                    <div key={d} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-center flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400">{d}</span>
                      <span className="text-lg">{i === 0 ? "🌧️" : i % 2 === 0 ? "⛈️" : "🌤️"}</span>
                      <span className="text-cyan-300 font-bold">{i === 0 ? "45 mm" : `${20 + i * 15} mm`}</span>
                      <span className="text-[10px] text-slate-400">Tide: {3.2 + i * 0.2}m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === "MINUTECAST" && (
              <div className="flex flex-col gap-3 text-xs">
                <p className="text-slate-400">MinuteCast™ Hyperlocal 120-Minute Street Inundation Lead Forecast:</p>
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-300">Next 0 - 15 mins:</span>
                    <span className="text-emerald-400 font-bold">Trace rain (0.2 mm) • Subways Free</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-300">Next 15 - 45 mins:</span>
                    <span className="text-amber-400 font-bold">Cell surge (+12 mm/h) • Milan Advisory</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-300">Next 45 - 90 mins:</span>
                    <span className="text-red-400 font-bold">Cloudburst Peak (+45 mm/h) • Subways Diverted</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === "MONTHLY" && (
              <div className="flex flex-col gap-3 text-xs">
                <p className="text-slate-400">Verified Historical Monsoon Archive (2021–2024 AWS Data):</p>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Mumbai Records:</span>
                    <span className="text-cyan-300 font-bold">69,720 AWS Hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thane Mumbra Records:</span>
                    <span className="text-emerald-300 font-bold">11,712 Archive Hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Arabian Sea Tide Logs:</span>
                    <span className="text-blue-300 font-bold">1,940 Observations</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ML Model Verified R²:</span>
                    <span className="text-amber-400 font-bold">0.9855 (MAE 1.43 cm)</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === "AIR QUALITY" && (
              <div className="flex flex-col gap-3 text-xs">
                <p className="text-slate-400">Current Environmental & Meteorological Telemetry:</p>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400">AIR QUALITY (AQI)</span>
                    <p className="text-lg font-bold text-emerald-400">42 (GOOD)</p>
                    <span className="text-[10px] text-slate-400">Rain wash scrubbed PM2.5</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400">RELATIVE HUMIDITY</span>
                    <p className="text-lg font-bold text-teal-400">76%</p>
                    <span className="text-[10px] text-slate-400">Coastal maritime vapor</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400">WIND VELOCITY</span>
                    <p className="text-lg font-bold text-indigo-400">18 km/h WSW</p>
                    <span className="text-[10px] text-slate-400">Arabian Sea Monsoon Drift</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400">ATMOSPHERIC PRESSURE</span>
                    <p className="text-lg font-bold text-cyan-400">1008.4 hPa</p>
                    <span className="text-[10px] text-slate-400">Monsoon Depression Trough</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
