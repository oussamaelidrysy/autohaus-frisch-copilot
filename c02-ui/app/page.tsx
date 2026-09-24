"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Clock, RefreshCw, UserCheck, ShieldCheck, Wrench, PackageCheck, Settings, Award, Truck } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

interface Recommendation {
  id?: string;
  source_record: string;
  owner: string;
  root_cause: string;
  proposed_stage: string;
  reasoning: string;
  confidence_score: number;
}

export default function WorkshopDashboard() {
  const [selectedJob, setSelectedJob] = useState<string>("W-1");
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [recDbId, setRecDbId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");

  const rooms = [
    { num: "01", name: "Parts Depot", sub: "Teilelager", icon: PackageCheck, job: "W-1", status: "Awaiting Parts", active: selectedJob === "W-1" },
    { num: "02", name: "Repair Bay", sub: "Werkstatt-Bucht", icon: Settings, job: "W-2", status: "Repair Paused", active: selectedJob === "W-2" },
    { num: "03", name: "Quality Control", sub: "Endkontrolle", icon: Award, job: "W-3", status: "Quality Check", active: selectedJob === "W-3" },
    { num: "04", name: "Delivery Desk", sub: "Abgabe", icon: Truck, job: "W-4", status: "Ready for Pickup", active: selectedJob === "W-4" },
  ];

  const jobs = [
    { id: "W-1", stage: "Awaiting Parts (Teile)", owner: "Parts Coordinator" },
    { id: "W-2", stage: "Repair Paused", owner: "Service Advisor" },
    { id: "W-3", stage: "Quality Check (Endkontrolle)", owner: "Workshop Controller" },
    { id: "W-4", stage: "Ready for Pickup", owner: "Service Desk" },
  ];

  const handleAnalyze = async (jobId: string) => {
    setSelectedJob(jobId);
    setLoading(true);
    setRecommendation(null);
    setStatusMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/analyze/${jobId}`, {
        method: "POST",
        headers: { "bypass-tunnel-reminder": "true" }
      });
      const data = await res.json();
      setRecommendation(data.recommendation);
      if (data.db_record && data.db_record.length > 0) {
        setRecDbId(data.db_record[0].id);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Failed to fetch AI analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!recDbId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/approve/${recDbId}`, {
        method: "POST",
        headers: { "bypass-tunnel-reminder": "true" }
      });
      const data = await res.json();
      setStatusMsg(`Approved! Job ${data.updated_job} moved to '${data.new_stage}'`);
      setRecommendation(null);
    } catch (err) {
      console.error(err);
      setStatusMsg("Failed to approve update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-8 font-sans">
      {/* Header */}
      <header className="mb-6 flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-md flex items-center justify-center font-bold">
            <Wrench className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="bg-slate-100 text-slate-700 text-[11px] font-mono uppercase px-2.5 py-0.5 rounded border border-slate-300 font-semibold tracking-wider">
                Autohaus Frisch Gruppe
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-wide uppercase">
                Werkstatt Operations Copilot
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Exercise Clock Context: <span className="font-mono text-slate-800 font-semibold">09:30</span> | Human-in-the-Loop Decision Engine
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2 shadow-inner">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-800">Audit Rules:</span> Source Cited & Human Approval
        </div>
      </header>

      {/* 4-ROOM WORKSHOP PIPELINE VISUALIZER BAR */}
      <section className="mb-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-700" />
            Physical Manufacture Zones (4 Rooms Workflow)
          </h2>
          <span className="text-[11px] font-semibold text-slate-400">Click any room to inspect active job</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {rooms.map((room) => {
            const IconComponent = room.icon;
            return (
              <div
                key={room.num}
                onClick={() => handleAnalyze(room.job)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  room.active
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg ring-2 ring-slate-900 ring-offset-2"
                    : "bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-lg ${room.active ? "bg-slate-800 text-white" : "bg-white text-slate-700 border border-slate-200"}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${room.active ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"}`}>
                    ROOM {room.num}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight">{room.name}</h3>
                  <p className={`text-[11px] font-medium ${room.active ? "text-slate-400" : "text-slate-500"}`}>{room.sub}</p>
                </div>
                <div className={`mt-3 pt-2.5 border-t text-[11px] flex justify-between items-center ${room.active ? "border-slate-800" : "border-slate-200"}`}>
                  <span className="font-mono font-bold">{room.job}</span>
                  <span className={`font-semibold ${room.active ? "text-slate-300" : "text-slate-600"}`}>{room.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Grid: Queue & AI Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Workshop Queue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            Active Workshop Queue (Werkstatt)
          </h2>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleAnalyze(job.id)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${
                  selectedJob === job.id
                    ? "border-slate-900 bg-slate-900 shadow-md text-white"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-extrabold text-lg ${selectedJob === job.id ? "text-white" : "text-slate-900"}`}>
                    {job.id}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded uppercase tracking-wider ${
                    selectedJob === job.id 
                      ? "bg-slate-800 border border-slate-700 text-slate-200" 
                      : "bg-white border border-slate-200 text-slate-700"
                  }`}>
                    {job.stage}
                  </span>
                </div>
                <div className={`text-xs mt-2.5 flex items-center gap-1.5 font-medium ${
                  selectedJob === job.id ? "text-slate-300" : "text-slate-500"
                }`}>
                  <UserCheck className={`w-3.5 h-3.5 ${selectedJob === job.id ? "text-slate-300" : "text-slate-500"}`} /> Owner: <span className={selectedJob === job.id ? "text-white" : "text-slate-900"}>{job.owner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Analysis & Action */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4 border-b border-slate-100 pb-3">
            AI Bottleneck Handoff Diagnosis & Proposal
          </h2>

          {loading && (
            <div className="flex items-center gap-3 text-slate-600 py-16 justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-800" />
              <span className="font-medium text-slate-700">Cross-referencing Autohaus Frisch DMS & ERP records via Gemini...</span>
            </div>
          )}

          {statusMsg && (
            <div className="p-4 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 shadow-sm font-semibold">
              <CheckCircle className="w-5 h-5 text-emerald-600" /> {statusMsg}
            </div>
          )}

          {!loading && recommendation && (
            <div className="space-y-6">
              {/* Classification Banner */}
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Root Cause Classification</span>
                  <span className="text-base font-extrabold tracking-wide text-slate-900">
                    {recommendation.root_cause}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">AI Confidence Score</span>
                  <span className="text-2xl font-black text-slate-900">
                    {(recommendation.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Reasoning Box */}
              <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dependency Analysis & Evidence</h3>
                <p className="text-sm text-slate-800 leading-relaxed font-normal">{recommendation.reasoning}</p>
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">Source Record ID (DMS/ERP)</span>
                    <span className="font-mono text-slate-900 font-bold text-sm">{recommendation.source_record}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">Designated Task Owner</span>
                    <span className="font-mono text-slate-900 font-bold text-sm">{recommendation.owner}</span>
                  </div>
                </div>
              </div>

              {/* Action Stage */}
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex justify-between items-center shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Proposed Stage Update</span>
                  <span className="text-lg font-extrabold text-slate-900 tracking-wide">{recommendation.proposed_stage}</span>
                </div>
                <button
                  onClick={handleApprove}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] uppercase tracking-wider text-xs"
                >
                  <CheckCircle className="w-4 h-4 stroke-[2.5]" /> Approve Stage Transition
                </button>
              </div>
            </div>
          )}

          {!loading && !recommendation && !statusMsg && (
            <div className="text-slate-400 text-center py-20">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-400" />
              Select a room or job from the queue to trigger AI handoff analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
