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
    <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 text-slate-200 shadow-2xl flex flex-col gap-3">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
            SIH Multi-Criteria Priority Dispatch Queue
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Formula: P(Fail) × Impact × PopExp × TrafficExp × Cost × Urgency
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-56">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
              <th className="py-2 px-2.5">RANK</th>
              <th className="py-2 px-2.5">LOCATION / ASSET</th>
              <th className="py-2 px-2.5">WARD</th>
              <th className="py-2 px-2.5">PRIORITY SCORE</th>
              <th className="py-2 px-2.5">RECOMMENDED ACTION</th>
              <th className="py-2 px-2.5">EST. COST</th>
              <th className="py-2 px-2.5">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {priorities.map((p) => (
              <tr
                key={p.component_id}
                className="border-b border-slate-900 hover:bg-slate-900/60 transition-colors"
              >
                <td className="py-2.5 px-2.5 font-mono font-bold">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                    p.rank === 1 ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                    p.rank === 2 ? "bg-slate-300/20 text-slate-200 border border-slate-300/40" :
                    p.rank === 3 ? "bg-amber-700/20 text-amber-500 border border-amber-700/40" :
                    "text-slate-400"
                  }`}>
                    {p.rank}
                  </span>
                </td>
                <td className="py-2.5 px-2.5 font-semibold text-slate-100">
                  {p.name || p.component_name}
                </td>
                <td className="py-2.5 px-2.5 text-slate-300 font-mono">
                  {p.ward}
                </td>
                <td className="py-2.5 px-2.5 font-mono text-amber-400 font-bold">
                  {(p.composite_priority_score || p.priority_score || 85).toFixed(1)}
                </td>
                <td className="py-2.5 px-2.5 text-slate-300">
                  {p.recommended_intervention || p.recommended_action || "Deploy dewatering pumps"}
                </td>
                <td className="py-2.5 px-2.5 font-mono text-emerald-400">
                  ₹{p.estimated_cost_inr_lakhs || (p.estimated_cost_inr ? (p.estimated_cost_inr / 100000).toFixed(1) : 4.5)}L
                </td>
                <td className="py-2.5 px-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelect(p.component_id)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 rounded text-[11px] font-medium transition-colors"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
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
