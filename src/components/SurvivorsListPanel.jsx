import React, { useState } from "react";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Camera,
  MapPin,
} from "lucide-react";

export default function SurvivorsListPanel({
  survivors,
  selectedSurvivor,
  onSelectSurvivor,
  onOpenFeedModal,
}) {
  const [filter, setFilter] = useState("ALL"); // ALL, CRITICAL, SERIOUS, STABLE, EVACUATED
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSurvivors = survivors.filter((s) => {
    if (filter === "CRITICAL" && s.triageLevel !== "CRITICAL") return false;
    if (filter === "SERIOUS" && s.triageLevel !== "SERIOUS") return false;
    if (filter === "STABLE" && s.triageLevel !== "STABLE") return false;
    if (filter === "EVACUATED" && s.evacStatus !== "EVACUATED") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLabel = s.label.toLowerCase().includes(q);
      const matchTerrain = s.natureCondition?.terrainType?.toLowerCase().includes(q);
      const matchId = s.id.toLowerCase().includes(q);
      return matchLabel || matchTerrain || matchId;
    }
    return true;
  });

  const criticalCount = survivors.filter((s) => s.triageLevel === "CRITICAL" && s.evacStatus !== "EVACUATED").length;
  const rescuedCount = survivors.filter((s) => s.evacStatus === "EVACUATED").length;

  return (
    <div className="bg-[#0b1120]/90 border border-cyan-500/25 rounded-lg p-3 backdrop-blur-md shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-chakra font-bold text-white tracking-wider">
            SURVIVOR DETECTIONS
          </h3>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            {survivors.length}
          </span>
        </div>

        <button
          onClick={onOpenFeedModal}
          className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono flex items-center gap-1 transition"
        >
          <Plus className="w-3 h-3" />
          <span>Feed Sighting</span>
        </button>
      </div>

      {/* Triage Summary Chips */}
      <div className="grid grid-cols-3 gap-1.5 text-center mb-2 text-[9px] font-mono">
        <div className="p-1 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
          <span className="block opacity-75">CRITICAL</span>
          <span className="font-bold text-xs">{criticalCount}</span>
        </div>
        <div className="p-1 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
          <span className="block opacity-75">TOTAL ACTIVE</span>
          <span className="font-bold text-xs">{survivors.length - rescuedCount}</span>
        </div>
        <div className="p-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
          <span className="block opacity-75">RESCUED</span>
          <span className="font-bold text-xs">{rescuedCount}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[9px] font-mono border-b border-slate-800">
        {["ALL", "CRITICAL", "SERIOUS", "STABLE", "EVACUATED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition ${
              filter === tab
                ? "bg-cyan-500 text-black font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Survivor Cards List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 mt-2 pr-0.5">
        {filteredSurvivors.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs font-mono">
            No survivor sightings match filter.
          </div>
        ) : (
          filteredSurvivors.map((surv) => {
            const isSelected = selectedSurvivor?.id === surv.id;
            const isCritical = surv.triageLevel === "CRITICAL";
            const isSerious = surv.triageLevel === "SERIOUS";
            const isEvacuated = surv.evacStatus === "EVACUATED";

            const badgeColor = isEvacuated
              ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
              : isCritical
              ? "bg-rose-950 text-rose-300 border-rose-500/40"
              : isSerious
              ? "bg-amber-950 text-amber-300 border-amber-500/40"
              : "bg-cyan-950 text-cyan-300 border-cyan-500/40";

            return (
              <div
                key={surv.id}
                onClick={() => onSelectSurvivor(surv)}
                className={`p-2 rounded-lg border transition cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/10"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                {/* Photo Thumbnail */}
                <div className="relative w-11 h-11 rounded overflow-hidden shrink-0 border border-slate-700 bg-black">
                  <img
                    src={surv.photoUrl}
                    alt={surv.label}
                    className="w-full h-full object-cover"
                  />
                  {isCritical && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </div>

                {/* Sighting Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate block">
                      {surv.label}
                    </span>
                    <span className={`text-[8px] font-mono px-1 rounded border font-semibold ${badgeColor}`}>
                      {isEvacuated ? "RESCUED" : surv.triageLevel}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 block truncate font-mono">
                    {surv.natureCondition?.terrainType || "Terrain Evaluated"}
                  </span>

                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-0.5">
                    <span>{surv.latitude.toFixed(4)}°, {surv.longitude.toFixed(4)}°</span>
                    <span className="text-cyan-400 font-semibold">{surv.detectionConfidence}% AI</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
