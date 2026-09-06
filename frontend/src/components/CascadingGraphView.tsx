"use client";

import React, { useState, useMemo } from "react";
import { CascadingGraphResponse, ComponentTelemetry } from "../lib/types";
import { GitBranch, ArrowRight, AlertTriangle, Zap, Compass } from "lucide-react";

interface CascadingGraphViewProps {
  graphData: CascadingGraphResponse;
  components?: ComponentTelemetry[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onCloseAndFocus?: (nodeId: string) => void;
}

export const CascadingGraphView: React.FC<CascadingGraphViewProps> = ({
  graphData,
  components = [],
  selectedNodeId,
  onSelectNode,
  onCloseAndFocus,
}) => {
  // Merge static graph topology with LIVE simulation telemetry
  const liveNodes = useMemo(() => {
    return graphData.nodes.map((node) => {
      const live = components.find((c) => c.component_id === node.id);
      if (!live) return node;
      return {
        ...node,
        water_depth_cm: live.water_depth_cm,
        failure_risk_score: live.failure_risk_score,
        health_score: live.health_score,
        status: live.status,
      };
    });
  }, [graphData.nodes, components]);

  const [activeNodeId, setActiveNodeId] = useState<string>(selectedNodeId || liveNodes[0]?.id || "");

  const currentNode = liveNodes.find((n) => n.id === (activeNodeId || selectedNodeId)) || liveNodes[0];
  const outgoingEdges = graphData.edges.filter((e) => e.source === currentNode?.id);

  const handleNodeClick = (nodeId: string) => {
    setActiveNodeId(nodeId);
    onSelectNode(nodeId);
  };

  const criticalNodesCount = liveNodes.filter((n) => n.status === "CRITICAL" || n.failure_risk_score > 65).length;

  return (
    <div className="text-slate-100 flex flex-col gap-4">
      {/* Title & Multi-Hop Propagation Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.25)]">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white glass-text-glow">
              Infrastructure Multi-Hop Cascading Risk Propagation
            </h2>
            <p className="text-[11px] text-slate-400">
              Direct Acyclic Graph (NetworkX Topology) • Dynamic ML Inference Inundation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-purple-200 bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/35 backdrop-blur-md shadow-[0_0_12px_rgba(168,85,247,0.2)]">
            {criticalNodesCount} Critical | {liveNodes.length} Total Nodes
          </span>
        </div>
      </div>

      {/* Visual Domino Chain Wave */}
      <div className="glass-panel-subtle p-3.5 rounded-2xl flex flex-col gap-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-300">
          <span>Active Domino Propagation Wave:</span>
          <span className="text-amber-400 font-mono drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">Transmission Delay: ~15 mins/hop</span>
        </div>

        <div className="flex items-center justify-between bg-black/25 p-3 rounded-xl border border-white/10 text-xs overflow-x-auto gap-2 scrollbar-thin">
          <div className="flex items-center gap-2 text-rose-300 font-bold shrink-0 bg-rose-950/40 px-3 py-2 rounded-xl border border-rose-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(244,63,94,0.2)]">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>1. Heavy Downpour (150mm/h)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />
          <div className="flex items-center gap-2 text-amber-300 font-bold shrink-0 bg-amber-950/40 px-3 py-2 rounded-xl border border-amber-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <span>2. Nallah Silt Choke (50%)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />
          <div className="flex items-center gap-2 text-cyan-300 font-bold shrink-0 bg-cyan-950/40 px-3 py-2 rounded-xl border border-cyan-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <span>3. Subway Inundation (75cm)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />
          <div className="flex items-center gap-2 text-rose-300 font-bold shrink-0 bg-rose-950/40 px-3 py-2 rounded-xl border border-rose-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(244,63,94,0.2)]">
            <span>4. Highway Gridlock (19 km/h)</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Node Grid (Dynamic ML Values) */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-300">
          Click any node below to inspect its cascading transmission chain:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 max-h-[38vh] overflow-y-auto pr-1 scrollbar-thin">
          {liveNodes.map((node) => {
            const isSelected = (activeNodeId || selectedNodeId) === node.id;
            const isCrit = node.status === "CRITICAL" || node.failure_risk_score > 65;
            const isWarn = node.status === "WARNING" || (node.failure_risk_score >= 35 && node.failure_risk_score <= 65);
            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 select-none backdrop-blur-xl shadow-md ${
                  isSelected
                    ? "bg-purple-900/40 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] scale-[1.03]"
                    : isCrit
                    ? "bg-rose-950/30 border-rose-500/35 hover:border-rose-400 hover:bg-rose-950/45 hover:scale-[1.01]"
                    : isWarn
                    ? "bg-amber-950/25 border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/40 hover:scale-[1.01]"
                    : "glass-panel-subtle hover:border-white/20 hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/[0.08] text-slate-200 border border-white/10 font-bold">
                    {node.type}
                  </span>
                  <span className={`text-[11px] font-bold font-mono drop-shadow-sm ${
                    isCrit ? "text-rose-400" : isWarn ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {Math.round(node.failure_risk_score)}%
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white truncate">{node.label}</p>
                  <p className="text-[10px] text-slate-400">Ward {node.ward}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono border-t border-white/10 pt-1.5">
                  <span className={node.water_depth_cm > 10 ? "text-cyan-300 font-bold" : "text-slate-400"}>
                    Water: {Math.round(node.water_depth_cm)}cm
                  </span>
                  <span className={node.health_score < 50 ? "text-rose-400" : "text-emerald-400"}>
                    Health: {Math.round(node.health_score)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Node Detail & Directed Coupling Vectors */}
      {currentNode && (
        <div className="glass-panel p-4.5 rounded-3xl border border-purple-400/40 flex flex-col md:flex-row items-start justify-between gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] animate-fadeIn">
          {/* Left: Node Info */}
          <div className="flex-1 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/40 text-xs font-mono font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                {currentNode.type}
              </span>
              <h4 className="text-sm font-bold text-white glass-text-glow">{currentNode.label}</h4>
              <span className="text-xs text-slate-400 font-mono">(Ward {currentNode.ward})</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="glass-panel-subtle p-2.5 rounded-xl border border-white/10 text-center">
                <span className="text-slate-400 text-[10px] block">Failure Risk</span>
                <span className={`font-extrabold text-sm drop-shadow-sm ${currentNode.failure_risk_score > 60 ? "text-rose-400" : "text-amber-400"}`}>
                  {Math.round(currentNode.failure_risk_score)}%
                </span>
              </div>
              <div className="glass-panel-subtle p-2.5 rounded-xl border border-white/10 text-center">
                <span className="text-slate-400 text-[10px] block">Water Depth</span>
                <span className="text-cyan-400 font-extrabold text-sm drop-shadow-sm">
                  {Math.round(currentNode.water_depth_cm)} cm
                </span>
              </div>
              <div className="glass-panel-subtle p-2.5 rounded-xl border border-white/10 text-center">
                <span className="text-slate-400 text-[10px] block">Health Score</span>
                <span className={`font-extrabold text-sm drop-shadow-sm ${currentNode.health_score > 60 ? "text-emerald-400" : "text-rose-400"}`}>
                  {Math.round(currentNode.health_score)}%
                </span>
              </div>
            </div>
          </div>

          {/* Right: Directed Failure Transmission Links */}
          <div className="flex-1 w-full glass-panel-subtle p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2">
            <h5 className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Cascades Failure Direct Vectors:
            </h5>
            {outgoingEdges.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {outgoingEdges.map((edge, i) => (
                  <div key={i} className="text-xs text-slate-200 bg-white/[0.04] p-2 rounded-xl border border-white/10 flex items-center justify-between backdrop-blur-md">
                    <span className="text-slate-200">{edge.description}</span>
                    <span className="text-purple-300 font-mono font-bold text-[10px] bg-purple-500/20 px-2 py-0.5 rounded-md border border-purple-500/30">
                      Weight: {edge.weight}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Terminal Node: Failure absorbed or safely discharged at outfall.
              </p>
            )}

            {onCloseAndFocus && (
              <button
                type="button"
                onClick={() => onCloseAndFocus(currentNode.id)}
                className="glass-button-primary mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:scale-[1.02]"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Focus Node on 3D Map</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
