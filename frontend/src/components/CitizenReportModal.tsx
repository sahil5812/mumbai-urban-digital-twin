"use client";

import React, { useState } from "react";
import { X, Send, AlertTriangle, CheckCircle2, MapPin, Camera } from "lucide-react";
import { submitCitizenReport } from "../lib/api";
import { CitizenReportResponse } from "../lib/types";

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("POTHOLE");
  const [landmark, setLandmark] = useState("Hindmata Cinema Junction, Dadar");
  const [severity, setSeverity] = useState("CRITICAL");
  const [description, setDescription] = useState("Severe pothole cluster emerging under heavy waterlogging.");
  const [waterDepth, setWaterDepth] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<CitizenReportResponse | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await submitCitizenReport({
      reporter_name: name || "Mumbai Citizen",
      category,
      landmark,
      severity,
      description,
      latitude: 19.0125,
      longitude: 72.8432,
      ward: "F/S",
      estimated_water_depth_cm: waterDepth,
    });
    setResponse(res);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-modal rounded-3xl p-6 w-full max-w-md shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] text-slate-100 flex flex-col gap-4 border border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <AlertTriangle className="w-5 h-5 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
            <h3 className="text-sm uppercase tracking-wider text-white glass-text-glow">
              Citizen Grievance & Pothole Portal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="glass-button p-1.5 rounded-xl text-slate-300 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {response ? (
          <div className="glass-panel-subtle border-emerald-500/40 rounded-2xl p-5 flex flex-col gap-3.5 text-center items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                Ticket Ingested into BMC Digital Twin!
              </h4>
              <p className="text-xs font-mono text-slate-300 mt-1 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-lg">
                Ticket ID: {response.ticket_id}
              </p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{response.message}</p>
            <button
              onClick={() => { setResponse(null); onClose(); }}
              className="glass-button w-full py-2.5 rounded-xl text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Your Name / Mobile</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma (9820012345)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input w-full rounded-xl p-2.5 text-slate-100 placeholder-slate-500 outline-none text-xs transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="glass-input w-full rounded-xl p-2.5 text-slate-100 outline-none text-xs transition-all bg-slate-900/90"
                >
                  <option value="POTHOLE">Pothole / Road Damage</option>
                  <option value="WATERLOGGING">Severe Waterlogging</option>
                  <option value="DRAIN_BLOCKED">Blocked Storm Drain</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="glass-input w-full rounded-xl p-2.5 text-slate-100 outline-none text-xs transition-all bg-slate-900/90"
                >
                  <option value="CRITICAL">Critical (Submerged)</option>
                  <option value="HIGH">High (Traffic Halted)</option>
                  <option value="MODERATE">Moderate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Landmark / Location</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="glass-input w-full rounded-xl p-2.5 text-slate-100 outline-none text-xs transition-all"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Description / Details</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="glass-input w-full rounded-xl p-2.5 text-slate-100 outline-none text-xs transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="glass-button-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(225,29,72,0.35)] text-xs text-white transition-all hover:scale-[1.01]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Transmitting to Digital Twin..." : "Submit to BMC Command Center"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
