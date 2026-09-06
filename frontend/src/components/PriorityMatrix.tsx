"use client";

import React from "react";
import { TopPriorityHotspot } from "../lib/types";
import { Trophy, Wrench, Clock, DollarSign, ArrowUpRight } from "lucide-react";

interface PriorityMatrixProps {
  priorities: TopPriorityHotspot[];
  onSelectComponent?: (id: string) => void;
  onSelectHotspot?: (id: string) => void;
}

export const PriorityMatrix: React.FC<PriorityMatrixProps> = ({ priorities, onSelectComponent, onSelectHotspot }) => {
  const handleSelect = (id: string) => {
    if (onSelectComponent) onSelectComponent(id);
    if (onSelectHotspot) onSelectHotspot(id);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 text-slate-100 shadow-[0_24px_50px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col gap-3.5">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white glass-text-glow">
            SIH Multi-Criteria Priority Dispatch Queue
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 font-mono bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md">
          Formula: P(Fail) × Impact × PopExp × TrafficExp × Cost × Urgency
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-64 scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">RANK</th>
              <th className="py-2.5 px-3">LOCATION / ASSET</th>
              <th className="py-2.5 px-3">WARD</th>
              <th className="py-2.5 px-3">PRIORITY SCORE</th>
              <th className="py-2.5 px-3">RECOMMENDED ACTION</th>
              <th className="py-2.5 px-3">EST. COST</th>
              <th className="py-2.5 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {priorities.map((p) => (
              <tr
                key={p.component_id}
                className="border-b border-white/[0.06] hover:bg-white/[0.07] transition-colors"
              >
                <td className="py-2.5 px-3 font-mono font-bold">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold backdrop-blur-md ${
                    p.rank === 1 ? "bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]" :
                    p.rank === 2 ? "bg-slate-300/20 text-slate-200 border border-slate-300/40 shadow-[0_0_8px_rgba(203,213,225,0.2)]" :
                    p.rank === 3 ? "bg-amber-700/25 text-amber-400 border border-amber-600/40 shadow-[0_0_8px_rgba(217,119,6,0.2)]" :
                    "bg-white/[0.05] text-slate-400 border border-white/10"
                  }`}>
                    {p.rank}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-semibold text-white">
                  {p.name || p.component_name}
                </td>
                <td className="py-2.5 px-3 text-slate-300 font-mono">
                  {p.ward}
                </td>
                <td className="py-2.5 px-3 font-mono text-amber-400 font-extrabold drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]">
                  {(p.composite_priority_score || p.priority_score || 85).toFixed(1)}
                </td>
                <td className="py-2.5 px-3 text-slate-200">
                  {p.recommended_intervention || p.recommended_action || "Deploy dewatering pumps"}
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]">
                  ₹{p.estimated_cost_inr_lakhs || (p.estimated_cost_inr ? (p.estimated_cost_inr / 100000).toFixed(1) : 4.5)}L
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSelect(p.component_id)}
                    className="glass-button inline-flex items-center gap-1.5 px-3 py-1.5 text-cyan-300 hover:text-white rounded-xl text-[11px] font-semibold transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
