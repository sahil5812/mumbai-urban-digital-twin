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
  X,
  MapPin,
  CloudSun
} from "lucide-react";

export type SubNavTab = 
  | "TODAY" 
  | "HOURLY" 
  | "10-DAY" 
  | "RADAR" 
  | "MINUTECAST" 
  | "MONTHLY" 
  | "HEALTH & ACTIVITIES";

interface SubNavbarProps {
  activeTab: SubNavTab;
  onTabChange: (tab: SubNavTab) => void;
  onOpenPriorityModal?: () => void;
  onOpenGraphModal?: () => void;
  onToggleScenarioControls?: () => void;
  isLiveMode?: boolean;
  viewModeType?: "PORTAL" | "MAP";
  onToggleViewModeType?: () => void;
}

export const SubNavbar: React.FC<SubNavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenPriorityModal,
  onOpenGraphModal,
  onToggleScenarioControls,
  isLiveMode = false,
  viewModeType = "PORTAL",
  onToggleViewModeType,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Tabs without Air Quality (per user request)
  const TABS: { id: SubNavTab; label: string; badge?: string }[] = [
    { id: "TODAY", label: "TODAY" },
    { id: "HOURLY", label: "HOURLY", badge: "0-3h" },
    { id: "10-DAY", label: "10-DAY" },
    { id: "RADAR", label: "RADAR", badge: "LIVE" },
    { id: "MINUTECAST", label: "MINUTECAST™" },
    { id: "MONTHLY", label: "MONTHLY" },
    { id: "HEALTH & ACTIVITIES", label: "HEALTH & ACTIVITIES" },
  ];

  const handleTabClick = (tabId: SubNavTab) => {
    onTabChange(tabId);

    if (tabId === "HEALTH & ACTIVITIES" && onOpenPriorityModal) {
      onOpenPriorityModal();
    } else if (tabId === "RADAR" && onToggleScenarioControls) {
      onToggleScenarioControls();
    } else if (tabId === "MONTHLY" || tabId === "MINUTECAST") {
      // If in MAP view mode, we can show modal or navigate
      setActiveModal(tabId);
    } else {
      setActiveModal(null);
    }
  };

  return (
    <>
      <nav className="w-full bg-slate-900/35 backdrop-blur-2xl border-b border-white/10 px-4 select-none z-20 sticky top-16 text-slate-300 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-1">
          {/* Main Tabs Strip - Frosted Acrylic Glass */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0 font-sans text-[11px] sm:text-xs font-semibold tracking-wider uppercase">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative py-2 px-2.5 sm:px-3.5 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer rounded-xl ${
                    isActive
                      ? "text-cyan-300 font-bold bg-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] border border-white/15"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="glass-text-title">{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-mono font-bold backdrop-blur-md ${
                      tab.badge === "LIVE" 
                        ? "bg-red-500/20 text-red-300 border border-red-400/40 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]" 
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                  {/* Active Underline Indicator with Glow */}
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 shadow-[0_0_10px_rgba(6,182,212,0.9)] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action: Mode Switcher & Status Indicator */}
          <div className="flex items-center gap-3 border-l border-white/10 pl-3 shrink-0">
            {onToggleViewModeType && (
              <button
                type="button"
                onClick={onToggleViewModeType}
                className="glass-button flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-cyan-300 hover:text-cyan-100 text-[11px] font-semibold"
              >
                {viewModeType === "PORTAL" ? (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Switch to</span>
                    <span>3D Twin Map</span>
                  </>
                ) : (
                  <>
                    <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Switch to</span>
                    <span>Weather Portal</span>
                  </>
                )}
              </button>
            )}

            <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-300 bg-white/[0.04] backdrop-blur-xl px-2.5 py-1 rounded-xl border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>MUMBAI-THANE METRO RADAR</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Interactive Frosted Acrylic Modal for Extended Tabs */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-modal rounded-3xl p-6 w-full max-w-lg text-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <CloudRain className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <h3 className="text-sm uppercase tracking-wider text-slate-100 font-mono glass-text-title">
                  {activeModal} • WEATHER & HYDROLOGY INTELLIGENCE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="glass-button p-1.5 rounded-xl text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Based on Tab */}
            {activeModal === "10-DAY" && (
              <div className="flex flex-col gap-3 text-xs">
                <p className="text-slate-300">10-Day Synoptic Weather & Arabian Sea Spring Tide Outlook:</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
                  {["Day 1 (Today)", "Day 2", "Day 3", "Day 4", "Day 5"].map((d, i) => (
                    <div key={d} className="glass-panel-subtle p-2.5 rounded-2xl text-center flex flex-col gap-1">
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
                <p className="text-slate-300">MinuteCast™ Hyperlocal 120-Minute Street Inundation Lead Forecast:</p>
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between items-center glass-panel-subtle p-3 rounded-2xl">
                    <span className="text-slate-300">Next 0 - 15 mins:</span>
                    <span className="text-emerald-300 font-bold drop-shadow-sm">Trace rain (0.2 mm) • Subways Free</span>
                  </div>
                  <div className="flex justify-between items-center glass-panel-subtle p-3 rounded-2xl">
                    <span className="text-slate-300">Next 15 - 45 mins:</span>
                    <span className="text-amber-300 font-bold drop-shadow-sm">Cell surge (+12 mm/h) • Milan Advisory</span>
                  </div>
                  <div className="flex justify-between items-center glass-panel-subtle p-3 rounded-2xl">
                    <span className="text-slate-300">Next 45 - 90 mins:</span>
                    <span className="text-red-300 font-bold drop-shadow-sm">Cloudburst Peak (+45 mm/h) • Subways Diverted</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === "MONTHLY" && (
              <div className="flex flex-col gap-3 text-xs">
                <p className="text-slate-300">Verified Historical Monsoon Archive (2021–2024 AWS Data):</p>
                <div className="glass-panel-subtle p-4 rounded-2xl space-y-2.5 font-mono text-xs">
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
                    <span className="text-amber-300 font-bold">0.9855 (MAE 1.43 cm)</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="glass-button w-full py-2.5 text-slate-200 rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
