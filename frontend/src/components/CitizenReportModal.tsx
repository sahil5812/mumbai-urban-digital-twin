"use client";

import React, { useState } from "react";
import { X, Send, AlertTriangle, CheckCircle2, MapPin, Camera } from "lucide-react";
import { submitCitizenReport } from "../lib/api";
import { CitizenReportResponse } from "../lib/types";

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANDMARK_COORDINATES: Record<string, { lat: number; lon: number; ward: string }> = {
  "Hindmata Cinema Junction, Dadar": { lat: 19.0125, lon: 72.8432, ward: "F/S" },
  "Milan Subway, Santacruz": { lat: 19.0832, lon: 72.8395, ward: "H/W" },
  "Andheri Subway, SV Road": { lat: 19.1194, lon: 72.8441, ward: "K/W" },
  "Khar Subway & Linking Road": { lat: 19.0712, lon: 72.8356, ward: "H/W" },
  "Gandhi Market, King's Circle": { lat: 19.0280, lon: 72.8566, ward: "F/N" },
  "Sion Circle & SIES Lowline": { lat: 19.0400, lon: 72.8620, ward: "F/N" },
  "Kurla Kamani & LBS Marg": { lat: 19.0700, lon: 72.8800, ward: "L" },
  "Malad Subway & SV Road": { lat: 19.1865, lon: 72.8460, ward: "P/N" },
  "Dahisar Subway & WEH": { lat: 19.2350, lon: 72.8550, ward: "R/N" },
  "Chunabhatti / Sion-Trombay Road": { lat: 19.0450, lon: 72.8750, ward: "L" },
  "Dadar TT Circle & Tilak Bridge": { lat: 19.0200, lon: 72.8450, ward: "F/N" },
  "Worli Naka & Dr. AB Road": { lat: 19.0060, lon: 72.8180, ward: "G/S" },
  "Mumbra Station Underpass": { lat: 19.1906, lon: 73.0229, ward: "TMC-1" },
  "Reti Bunder Lowline Basin": { lat: 19.1995, lon: 73.0165, ward: "TMC-1" },
  "Kausa Junction & Almas Colony": { lat: 19.1764, lon: 73.0298, ward: "TMC-1" },
  "Other (Custom Location)": { lat: 19.0760, lon: 72.8777, ward: "General" },
};

const LANDMARK_OPTIONS = Object.keys(LANDMARK_COORDINATES);

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("POTHOLE");
  const [landmark, setLandmark] = useState(LANDMARK_OPTIONS[0]);
  const [severity, setSeverity] = useState("CRITICAL");
  const [description, setDescription] = useState("Severe pothole cluster emerging under heavy waterlogging.");
  const [waterDepth, setWaterDepth] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<CitizenReportResponse | null>(null);

  if (!isOpen) return null;

  const selectedCoords = LANDMARK_COORDINATES[landmark] || LANDMARK_COORDINATES["Other (Custom Location)"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await submitCitizenReport({
      reporter_name: name || "Mumbai Citizen",
      category,
      landmark,
      severity,
      description,
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lon,
      ward: selectedCoords.ward,
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
              <select
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="glass-input w-full rounded-xl p-2.5 text-slate-100 outline-none text-xs transition-all bg-slate-900/90"
              >
                {LANDMARK_OPTIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                📍 {selectedCoords.lat.toFixed(4)}°N, {selectedCoords.lon.toFixed(4)}°E — Ward {selectedCoords.ward}
              </span>
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
