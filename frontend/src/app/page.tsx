"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Navbar } from "../components/Navbar";
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

  // 0-3h Timeline Selection State
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState<number>(0);

  // Live Mode State
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveTelemetry, setLiveTelemetry] = useState<LiveTelemetry | null>(null);

  // Simulation State
  const [simParams, setSimParams] = useState<SimulationRequest>({
    rainfall_mm_hr: 45.0,
    tide_level_m: 2.8,
    siltation_pct: 30.0,
    active_scenario_name: "Normal Monsoon",
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
    <main className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
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

      {/* 30-Minute Predictive Radar Early Warning Banner */}
      <EarlyWarningBanner
        telemetry={liveTelemetry}
        components={displayedComponents}
        currentRainfallMmHr={simParams.rainfall_mm_hr}
        onSimulateRainfall={(rain) => handleApplyPreset("Incoming Storm (+30m Nowcast)", rain, 4.1, 45)}
        onSelectComponent={(c) => setSelectedComponent(c)}
      />

      {/* Full-Screen Immersive Map Viewport */}
      <div className="flex-1 relative w-full h-[calc(100vh-4rem)] overflow-hidden">
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
                className="absolute top-3 right-3 p-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60"
                title="Minimize Sandbox"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsScenarioControlsOpen(true); }}
              className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-amber-300 shadow-2xl hover:border-amber-500/50 transition-all"
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-950/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-2xl">
          {/* Cascading Graph Modal Trigger */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsGraphModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 border border-purple-500/40 text-xs font-bold text-purple-200 shadow-lg transition-all hover:scale-105"
          >
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span>Cascading Failure Graph</span>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px]">
              {graphData?.total_impacted_nodes || 4}
            </span>
          </button>
        </div>
      </div>

      {/* Cascading Failure Graph Modal Overlay */}
      {isGraphModalOpen && graphData && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 w-full max-w-5xl shadow-2xl text-slate-200 flex flex-col gap-4 max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <GitBranch className="w-5 h-5" />
                <h3 className="text-sm uppercase tracking-wider text-slate-100">
                  Infrastructure Graph Cascading Failure Explorer
                </h3>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsGraphModalOpen(false); }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CascadingGraphView
                graphData={graphData}
                components={displayedComponents}
                selectedNodeId={selectedComponent?.component_id || null}
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 w-full max-w-5xl shadow-2xl text-slate-200 flex flex-col gap-4 max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Trophy className="w-5 h-5" />
                <h3 className="text-sm uppercase tracking-wider text-slate-100">
                  SIH Multi-Sector Priority Repair & Dispatch Matrix
                </h3>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsPriorityModalOpen(false); }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
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
