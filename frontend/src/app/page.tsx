"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Navbar } from "../components/Navbar";
import { SubNavbar, SubNavTab } from "../components/SubNavbar";
import { WeatherPortalView } from "../components/WeatherPortalView";
import { EarlyWarningBanner } from "../components/EarlyWarningBanner";
import { ScenarioControls } from "../components/ScenarioControls";
import { DeckGLMapView } from "../components/DeckGLMapView";
import { ComponentInspector } from "../components/ComponentInspector";
import { CascadingGraphView } from "../components/CascadingGraphView";
import { PriorityMatrix } from "../components/PriorityMatrix";
import { CitizenReportModal } from "../components/CitizenReportModal";
import { runSimulation, fetchCascadingGraph, fetchLiveTelemetry, LiveTelemetry } from "../lib/api";
import { SimulationRequest, SimulationResponse, ComponentTelemetry, CascadingGraphResponse } from "../lib/types";
import { GitBranch, Trophy, Sliders, X, Minimize2 } from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"2D" | "3D">("3D");
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [isCitizenModalOpen, setIsCitizenModalOpen] = useState(false);
  const [isScenarioControlsOpen, setIsScenarioControlsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Sub-Navbar Active Tab State
  const [activeSubNavTab, setActiveSubNavTab] = useState<SubNavTab>("TODAY");

  // Portal View Mode ("PORTAL" for weather dashboard, "MAP" for 3D digital twin map)
  const [portalViewMode, setPortalViewMode] = useState<"PORTAL" | "MAP">("PORTAL");

  // 0-3h Timeline Selection State
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState<number>(0);

  // Live Mode State
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveTelemetry, setLiveTelemetry] = useState<LiveTelemetry | null>(null);

  // Simulation State - Starts with Clear Sky (No Rain) Baseline
  const [simParams, setSimParams] = useState<SimulationRequest>({
    rainfall_mm_hr: 0.0,
    tide_level_m: 2.4,
    siltation_pct: 25.0,
    active_scenario_name: "Clear Weather Baseline",
  });

  const [simResult, setSimResult] = useState<SimulationResponse | null>(null);
  const [graphData, setGraphData] = useState<CascadingGraphResponse | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentTelemetry | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initial Load & Param Change Simulation
  const triggerSimulation = useCallback(async (params: SimulationRequest) => {
    setIsLoading(true);
    try {
      const res = await runSimulation(params);
      setSimResult(res);
      setSelectedTimelineIndex(0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    triggerSimulation(simParams);
    fetchCascadingGraph().then(setGraphData).catch(console.error);
    fetchLiveTelemetry().then(setLiveTelemetry).catch(console.error);
  }, [mounted]);

  // Live Telemetry Polling (Every 60s when LIVE ON)
  useEffect(() => {
    if (!mounted || !isLiveMode) return;

    let isSubscribed = true;

    const syncLive = async () => {
      try {
        const live = await fetchLiveTelemetry();
        if (live && isSubscribed) {
          setLiveTelemetry(live);
          const newP: SimulationRequest = {
            rainfall_mm_hr: live.rainfall_mm_hr || 0,
            tide_level_m: live.tide_level_m || 2.8,
            siltation_pct: simParams.siltation_pct,
            active_scenario_name: "Real-Time Live Weather",
          };
          setSimParams(newP);
          triggerSimulation(newP);
        }
      } catch (e) {
        console.error("Live sync notice:", e);
      }
    };

    syncLive();
    const interval = setInterval(syncLive, 60000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [mounted, isLiveMode]);

  const handleToggleLiveMode = () => {
    setIsLiveMode((prev) => !prev);
  };

  const handleParamChange = (newParams: SimulationRequest) => {
    setSimParams(newParams);
    triggerSimulation(newParams);
  };

  const handleApplyPreset = (presetName: string, rain: number, tide: number, silt: number) => {
    const newP: SimulationRequest = {
      rainfall_mm_hr: rain,
      tide_level_m: tide,
      siltation_pct: silt,
      active_scenario_name: presetName,
    };
    setSimParams(newP);
    triggerSimulation(newP);
  };

  const handleSelectComponentById = (id: string) => {
    if (!simResult) return;
    const found = simResult.components.find((c) => c.component_id === id);
    if (found) {
      setSelectedComponent(found);
    }
  };

  // Active Components to render on 3D Map (respects 0-3h timeline scrubber)
  const displayedComponents = useMemo(() => {
    if (simResult?.timeline_forecast && simResult.timeline_forecast[selectedTimelineIndex]) {
      return simResult.timeline_forecast[selectedTimelineIndex].components;
    }
    return simResult?.components || [];
  }, [simResult, selectedTimelineIndex]);

  if (!mounted) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs select-none">
        INITIALIZING DIGITAL TWIN...
      </div>
    );
  }

  return (
    <main className="h-screen w-screen bg-transparent text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Tactical Command Header */}
      <Navbar
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === "2D" ? "3D" : "2D")}
        disruptionSeverity={simResult?.city_summary.disruption_severity || "NORMAL"}
        overallHealth={simResult?.city_summary.overall_infrastructure_health || 85}
        highTideWarning={simResult?.city_summary.high_tide_warning || false}
        onOpenCitizenModal={() => setIsCitizenModalOpen(true)}
        onResetSimulation={() => handleApplyPreset("Normal Monsoon", 35, 2.5, 20)}
        isLiveMode={isLiveMode}
        onToggleLiveMode={handleToggleLiveMode}
        liveTelemetry={liveTelemetry}
      />

      {/* Weather / Nowcasting Sub-Navbar matching Reference Design */}
      <SubNavbar
        activeTab={activeSubNavTab}
        onTabChange={(tab) => {
          setActiveSubNavTab(tab);
          if (tab === "RADAR") {
            setPortalViewMode("MAP");
            setIsScenarioControlsOpen(true);
          } else if (tab === "HOURLY" || tab === "10-DAY" || tab === "TODAY" || tab === "MINUTECAST") {
            setPortalViewMode("PORTAL");
          }
        }}
        onOpenPriorityModal={() => setIsPriorityModalOpen(true)}
        onOpenGraphModal={() => setIsGraphModalOpen(true)}
        onToggleScenarioControls={() => setIsScenarioControlsOpen((prev) => !prev)}
        isLiveMode={isLiveMode}
        viewModeType={portalViewMode}
        onToggleViewModeType={() => {
          setPortalViewMode((prev) => {
            const nextMode = prev === "PORTAL" ? "MAP" : "PORTAL";
            setActiveSubNavTab(nextMode === "MAP" ? "RADAR" : "TODAY");
            return nextMode;
          });
        }}
      />

      {/* 30-Minute Predictive Radar Early Warning Banner - ONLY on RADAR Panel */}
      {activeSubNavTab === "RADAR" && (
        <EarlyWarningBanner
          telemetry={liveTelemetry}
          components={displayedComponents}
          currentRainfallMmHr={simParams.rainfall_mm_hr}
          onSimulateRainfall={(rain) => handleApplyPreset("Incoming Storm (+30m Nowcast)", rain, 4.1, 45)}
          onSelectComponent={(c) => {
            setPortalViewMode("MAP");
            setSelectedComponent(c);
          }}
        />
      )}

      {/* Main Viewport: Either Full Weather Portal Dashboard OR 3D Digital Twin Map */}
      {portalViewMode === "PORTAL" ? (
        <div className="flex-1 relative w-full overflow-hidden bg-transparent">
          <WeatherPortalView
            currentRainfallMmHr={simParams.rainfall_mm_hr}
            currentTideLevelM={simParams.tide_level_m}
            liveTelemetry={liveTelemetry}
            activeTab={activeSubNavTab}
            onSimulateScenario={(scenarioName, rain, tide, silt) => {
              handleApplyPreset(scenarioName, rain, tide, silt);
            }}
            onOpenMap={() => {
              setPortalViewMode("MAP");
              setActiveSubNavTab("RADAR");
            }}
            onOpenPriorityModal={() => setIsPriorityModalOpen(true)}
          />
        </div>
      ) : (
        <div className="flex-1 relative w-full overflow-hidden">
          {/* Full-Screen Background Deck.gl 3D Digital Twin Map */}
          <DeckGLMapView
            components={displayedComponents}
            selectedComponentId={selectedComponent?.component_id || null}
            onSelectComponent={(c) => setSelectedComponent(c)}
            viewMode={viewMode}
            rainfall_mm_hr={simParams.rainfall_mm_hr}
            tide_level_m={simParams.tide_level_m}
          />

          {/* Floating Left: Scenario Sandbox Deck with 0-3h Timeline Scrubber */}
          <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-2">
            {isScenarioControlsOpen ? (
              <div className="w-80 relative">
                <ScenarioControls
                  params={simParams}
                  onChange={handleParamChange}
                  isLoading={isLoading}
                  onApplyPreset={handleApplyPreset}
                  timelineForecast={simResult?.timeline_forecast || []}
                  selectedTimelineIndex={selectedTimelineIndex}
                  onSelectTimelineStep={(idx) => setSelectedTimelineIndex(idx)}
                />
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsScenarioControlsOpen(false); }}
                  className="absolute top-3 right-3 p-1.5 rounded-xl glass-button text-slate-300 hover:text-white"
                  title="Minimize Sandbox"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsScenarioControlsOpen(true); }}
                className="glass-button flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-amber-300 shadow-[0_16px_36px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-amber-400/50 hover:text-amber-200 transition-all hover:scale-105"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Scenario Sandbox</span>
              </button>
            )}
          </div>

          {/* Floating Right: Component Inspector Panel */}
          {selectedComponent && (
            <div className="absolute top-4 right-4 z-20 animate-fadeIn">
              <ComponentInspector
                component={selectedComponent}
                onClose={() => setSelectedComponent(null)}
              />
            </div>
          )}

          {/* Floating Bottom Command Bar: Action Buttons */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 glass-panel p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/15">
            {/* Cascading Graph Modal Trigger */}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsGraphModalOpen(true); }}
              className="glass-button flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.25),inset_0_1px_0_rgba(255,255,255,0.18)] border border-purple-500/40 hover:scale-105 transition-all"
            >
              <GitBranch className="w-4 h-4 text-purple-400" />
              <span>Cascading Failure Graph</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/25 text-purple-200 font-mono text-[10px] font-bold border border-purple-400/30">
                {graphData?.total_impacted_nodes || 4}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Cascading Failure Graph Modal Overlay */}
      {isGraphModalOpen && graphData && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="glass-modal rounded-3xl p-6 w-full max-w-5xl shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] text-slate-100 flex flex-col gap-4 max-h-[90vh] border border-white/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <GitBranch className="w-5 h-5 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                <h3 className="text-sm uppercase tracking-wider text-white glass-text-glow">
                  Infrastructure Graph Cascading Failure Explorer
                </h3>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsGraphModalOpen(false); }}
                className="glass-button p-1.5 rounded-xl text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CascadingGraphView
                graphData={graphData}
                components={displayedComponents}
                selectedNodeId={selectedComponent?.component_id || null}
                rainfallMmHr={simParams.rainfall_mm_hr}
                siltationPct={simParams.siltation_pct}
                onSelectNode={(id) => {
                  const found = displayedComponents.find((c) => c.component_id === id);
                  if (found) setSelectedComponent(found);
                }}
                onCloseAndFocus={(id) => {
                  const found = displayedComponents.find((c) => c.component_id === id);
                  if (found) setSelectedComponent(found);
                  setIsGraphModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* SIH Priority Queue Modal Overlay */}
      {isPriorityModalOpen && simResult && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="glass-modal rounded-3xl p-6 w-full max-w-5xl shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] text-slate-100 flex flex-col gap-4 max-h-[90vh] border border-white/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Trophy className="w-5 h-5 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <h3 className="text-sm uppercase tracking-wider text-white glass-text-glow">
                  SIH Multi-Sector Priority Repair & Dispatch Matrix
                </h3>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsPriorityModalOpen(false); }}
                className="glass-button p-1.5 rounded-xl text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PriorityMatrix
                priorities={simResult.top_priorities}
                onSelectHotspot={(id) => {
                  handleSelectComponentById(id);
                  setIsPriorityModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Citizen Grievance Reporting Modal */}
      <CitizenReportModal
        isOpen={isCitizenModalOpen}
        onClose={() => setIsCitizenModalOpen(false)}
      />
    </main>
  );
}
