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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 w-full max-w-md shadow-2xl text-slate-200 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-red-400 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm uppercase tracking-wider text-slate-100">
              Citizen Grievance & Pothole Portal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {response ? (
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 flex flex-col gap-3 text-center items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-300">Ticket Ingested into BMC Digital Twin!</h4>
              <p className="text-xs font-mono text-slate-300 mt-1">Ticket ID: {response.ticket_id}</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{response.message}</p>
            <button
              onClick={() => { setResponse(null); onClose(); }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Your Name / Mobile</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma (9820012345)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                >
                  <option value="POTHOLE">Pothole / Road Damage</option>
                  <option value="WATERLOGGING">Severe Waterlogging</option>
                  <option value="DRAIN_BLOCKED">Blocked Storm Drain</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                >
                  <option value="CRITICAL">Critical (Submerged)</option>
                  <option value="HIGH">High (Traffic Halted)</option>
                  <option value="MODERATE">Moderate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Landmark / Location</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
               <label className="text-slate-400 block mb-1">Description / Details</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
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
