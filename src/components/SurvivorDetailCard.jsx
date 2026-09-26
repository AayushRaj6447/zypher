import React, { useState } from "react";
import {
  Navigation,
  Eye,
  Camera,
  MapPin,
  AlertTriangle,
  Thermometer,
  ShieldAlert,
  Mountain,
  Droplets,
  Trees,
  Wind,
  CheckCircle2,
  Package,
  Compass,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function SurvivorDetailCard({
  survivor,
  onGeneratePath,
  rescueTeams,
  selectedTeamId,
  setSelectedTeamId,
  onAirdropSupply,
  onToggleEvacuated,
}) {
  const [photoViewMode, setPhotoViewMode] = useState("OPTICAL"); // OPTICAL | THERMAL
  const [supplyDropped, setSupplyDropped] = useState(false);

  if (!survivor) {
    return (
      <div className="bg-[#0b1120]/90 border border-slate-800 rounded-lg p-6 backdrop-blur-md flex flex-col items-center justify-center text-center text-slate-500 h-full">
        <MapPin className="w-10 h-10 mb-2 text-slate-600" />
        <span className="text-xs font-mono">NO SIGHTING SELECTED</span>
        <span className="text-[10px] text-slate-600 mt-1 max-w-xs">
          Select a survivor beacon from the map or roster to inspect imagery, environmental conditions, and compute a rescue route.
        </span>
      </div>
    );
  }

  const isCritical = survivor.triageLevel === "CRITICAL";
  const isSerious = survivor.triageLevel === "SERIOUS";
  const isEvacuated = survivor.evacStatus === "EVACUATED";
  const nature = survivor.natureCondition || {};

  const handleDrop = () => {
    setSupplyDropped(true);
    if (onAirdropSupply) onAirdropSupply(survivor);
    setTimeout(() => setSupplyDropped(false), 3000);
  };

  return (
    <div className="bg-[#0b1120]/90 border border-cyan-500/25 rounded-lg p-3 backdrop-blur-md shadow-xl flex flex-col gap-3 overflow-y-auto">
      {/* Sighting Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isEvacuated
                  ? "bg-emerald-400"
                  : isCritical
                  ? "bg-rose-500 animate-ping"
                  : isSerious
                  ? "bg-amber-400"
                  : "bg-cyan-400"
              }`}
            />
            <h3 className="text-xs font-chakra font-bold text-white tracking-wider">
              {survivor.label.toUpperCase()}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            ID: {survivor.id} • AI CONFIDENCE:{" "}
            <span className="text-emerald-400 font-bold">{survivor.detectionConfidence}%</span>
          </span>
        </div>

        {/* Triage Badge */}
        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${
            isEvacuated
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
              : isCritical
              ? "bg-rose-950/80 text-rose-300 border-rose-500/40 animate-pulse"
              : isSerious
              ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
              : "bg-cyan-950/80 text-cyan-300 border-cyan-500/40"
          }`}
        >
          {isEvacuated ? "EVACUATED / RESCUED" : survivor.triageLevel}
        </span>
      </div>

      {/* Sighting Photo Display with Thermal Toggle */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <Camera className="w-3 h-3 text-cyan-400" /> SENSOR CAPTURE
          </span>
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => setPhotoViewMode("OPTICAL")}
              className={`px-1.5 py-0.2 rounded ${
                photoViewMode === "OPTICAL"
                  ? "bg-cyan-500 text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              RGB Optical
            </button>
            <button
              onClick={() => setPhotoViewMode("THERMAL")}
              className={`px-1.5 py-0.2 rounded ${
                photoViewMode === "THERMAL"
                  ? "bg-rose-500 text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Thermal FLIR
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative aspect-video rounded overflow-hidden border border-cyan-500/30 bg-black group">
          <img
            src={
              photoViewMode === "THERMAL" && survivor.thermalPhotoUrl
                ? survivor.thermalPhotoUrl
                : survivor.photoUrl
            }
            alt={survivor.label}
            className={`w-full h-full object-cover transition duration-300 ${
              photoViewMode === "THERMAL" ? "contrast-150 saturate-200 hue-rotate-180" : ""
            }`}
          />

          {/* AI Bounding Box Reticle */}
          <div className="absolute top-[20%] left-[30%] w-28 h-28 border-2 border-emerald-400/90 rounded flex flex-col justify-between p-1 pointer-events-none">
            <div className="flex items-center justify-between text-[8px] font-mono bg-black/70 px-1 rounded text-emerald-300 font-bold">
              <span>TARGET LOCK</span>
              <span>{survivor.detectionConfidence}%</span>
            </div>
            <div className="text-[8px] font-mono bg-black/70 px-1 rounded text-cyan-200">
              {survivor.thermalSignature}
            </div>
          </div>

          <div className="absolute bottom-1.5 left-1.5 text-[8px] font-mono bg-black/80 px-1.5 py-0.5 rounded border border-cyan-500/30 text-slate-300">
            LAT: {survivor.latitude.toFixed(5)} | LON: {survivor.longitude.toFixed(5)}
          </div>
        </div>
      </div>

      {/* GPS & Physiological Vitals Box */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
          <span className="text-[9px] text-slate-400 block">CORE THERMAL</span>
          <span className="text-rose-400 font-bold text-[11px] flex items-center gap-1 mt-0.5">
            <Thermometer className="w-3 h-3 text-rose-400" />
            {survivor.thermalSignature}
          </span>
        </div>
        <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
          <span className="text-[9px] text-slate-400 block">ELEVATION</span>
          <span className="text-cyan-300 font-bold text-[11px] mt-0.5 block">
            {survivor.elevation}m MSL
          </span>
        </div>
      </div>

      <div className="p-2 bg-slate-900/60 rounded border border-slate-800 text-[10px] font-mono text-slate-300">
        <span className="text-slate-400">VITALS ASSESSMENT:</span> {survivor.vitalsEstimate}
      </div>

      {/* Nature & Environmental Conditions Section */}
      <div className="border-t border-cyan-500/20 pt-2 space-y-2">
        <div className="flex items-center justify-between text-xs font-chakra font-semibold text-emerald-400">
          <span className="flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5" /> ENVIRONMENTAL INTELLIGENCE
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
            {nature.accessibilityRating || "EVALUATED"}
          </span>
        </div>

        <div className="space-y-1.5 text-[10px] font-mono">
          <div className="flex items-start gap-1.5 text-slate-300">
            <span className="text-slate-500 min-w-16">TERRAIN:</span>
            <span className="text-slate-200 font-semibold">{nature.terrainType}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-slate-500 block">SLOPE:</span>
              <span className="text-amber-300">{nature.slopeGradient}</span>
            </div>
            <div>
              <span className="text-slate-500 block">CANOPY:</span>
              <span className="text-slate-200">{nature.canopyCover}</span>
            </div>
          </div>

          {nature.waterHazard && (
            <div className="p-1.5 rounded bg-blue-950/40 border border-blue-500/30 text-blue-200 flex items-start gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span>{nature.waterHazard}</span>
            </div>
          )}

          <div className="p-1.5 rounded bg-slate-900/90 border border-slate-700/60 text-slate-300">
            <span className="text-cyan-400 font-bold block mb-0.5">PASSABILITY GUIDANCE:</span>
            <span>{nature.passabilityNotes}</span>
          </div>

          {nature.recommendedGear && (
            <div className="text-[9px] text-slate-400">
              <span className="text-slate-500">MANDATORY GEAR:</span>{" "}
              {nature.recommendedGear.join(" • ")}
            </div>
          )}
        </div>
      </div>

      {/* Path Generation Control Box */}
      <div className="border-t border-cyan-500/20 pt-2.5 space-y-2">
        <label className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>ORIGIN RESCUE UNIT</span>
          <span className="text-cyan-400">SELECT DEPLOYED UNIT</span>
        </label>

        <select
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="w-full bg-slate-900 border border-cyan-500/30 rounded px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
        >
          {rescueTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} ({team.type.replace(/_/g, " ")})
            </option>
          ))}
        </select>

        <button
          onClick={() => onGeneratePath(survivor, selectedTeamId)}
          className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-chakra font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
          <span>GENERATE TERRAIN-AWARE RESCUE PATH</span>
        </button>

        {/* Tactical Actions (Airdrop & Status Toggle) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleDrop}
            className={`py-1.5 px-2 rounded text-[10px] font-mono font-semibold flex items-center justify-center gap-1 border transition ${
              supplyDropped
                ? "bg-amber-500 text-black border-amber-400"
                : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700"
            }`}
          >
            <Package className="w-3 h-3 text-amber-400" />
            <span>{supplyDropped ? "PAYLOAD RELEASED" : "AIRDROP AID KIT"}</span>
          </button>

          <button
            onClick={() => onToggleEvacuated(survivor.id)}
            className={`py-1.5 px-2 rounded text-[10px] font-mono font-semibold flex items-center justify-center gap-1 border transition ${
              isEvacuated
                ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700"
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{isEvacuated ? "MARK ACTIVE" : "MARK EVACUATED"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
