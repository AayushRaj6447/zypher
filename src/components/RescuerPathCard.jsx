import React, { useState } from "react";
import {
  Navigation,
  Clock,
  Compass,
  Mountain,
  AlertTriangle,
  Radio,
  X,
  Share2,
  Footprints,
  Truck,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export default function RescuerPathCard({ generatedPath, onClosePath, onTransmitToTeam }) {
  const [transmitted, setTransmitted] = useState(false);

  if (!generatedPath) return null;

  const handleTransmit = () => {
    setTransmitted(true);
    if (onTransmitToTeam) onTransmitToTeam(generatedPath);
    setTimeout(() => setTransmitted(false), 3500);
  };

  return (
    <div className="bg-[#0b1120]/95 border border-emerald-500/40 rounded-lg p-3.5 backdrop-blur-md shadow-2xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-chakra font-bold text-white tracking-wider">
              TACTICAL RESCUE PATH ACTIVE
            </h3>
            <span className="text-[10px] font-mono text-emerald-300">
              {generatedPath.assignedTeamName} ➔ {generatedPath.targetSurvivorLabel}
            </span>
          </div>
        </div>

        <button
          onClick={onClosePath}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Transit Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
          <span className="text-[9px] text-slate-400 block">ROUTE DISTANCE</span>
          <span className="text-emerald-400 font-bold text-sm block mt-0.5">
            {generatedPath.routeDistanceKm} km
          </span>
          <span className="text-[8px] text-slate-500">
            Direct: {generatedPath.directDistanceKm} km
          </span>
        </div>

        <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
          <span className="text-[9px] text-slate-400 block flex items-center gap-1">
            <Footprints className="w-3 h-3 text-cyan-400" /> FOOT MARCH
          </span>
          <span className="text-white font-bold text-sm block mt-0.5">
            ~{generatedPath.footTransitTimeMin} min
          </span>
          <span className="text-[8px] text-cyan-400">Pace: 3.2 km/h</span>
        </div>

        <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
          <span className="text-[9px] text-slate-400 block flex items-center gap-1">
            <Truck className="w-3 h-3 text-amber-400" /> ATV TRANSIT
          </span>
          <span className="text-white font-bold text-sm block mt-0.5">
            ~{generatedPath.atvTransitTimeMin} min
          </span>
          <span className="text-[8px] text-amber-400">Ridge trail</span>
        </div>
      </div>

      {/* Elevation and Bearing Readout */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-slate-950/70 border border-slate-800 rounded text-[10px] font-mono text-slate-300">
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>BEARING: <strong className="text-white">{generatedPath.bearing}°</strong></span>
        </span>
        <span className="flex items-center gap-1">
          <Mountain className="w-3 h-3 text-emerald-400" />
          <span>ELEVATION GAIN: <strong className="text-white">+{generatedPath.elevationGainMeters}m</strong></span>
        </span>
        <span className="text-slate-400">
          HOIST:{" "}
          <strong className={generatedPath.aerialWinchFeasible ? "text-emerald-400" : "text-rose-400"}>
            {generatedPath.aerialWinchFeasible ? "AVAILABLE" : "BLOCKED"}
          </strong>
        </span>
      </div>

      {/* Terrain Safety Advisory */}
      <div className="p-2 rounded bg-amber-950/30 border border-amber-500/40 text-amber-200 text-[10px] font-mono flex items-start gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 block mb-0.5">TERRAIN SAFETY ADVISORY:</span>
          <span>{generatedPath.safetyAdvisory}</span>
        </div>
      </div>

      {/* Intermediate Terrain Waypoints */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-chakra font-semibold text-slate-300 block">
          TACTICAL ROUTE WAYPOINTS ({generatedPath.waypoints.length} CHECKPOINTS)
        </span>
        <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
          {generatedPath.waypoints.map((wp) => (
            <div
              key={wp.index}
              className="p-1.5 bg-slate-900/60 rounded border border-slate-800 text-[9px] font-mono flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center font-bold text-[8px]">
                  {wp.index}
                </span>
                <div>
                  <span className="text-slate-200 font-semibold block">{wp.name}</span>
                  <span className="text-slate-400">{wp.hazardNote}</span>
                </div>
              </div>
              <span className="text-cyan-400 font-mono text-[9px]">{wp.elevation}m</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch Action */}
      <button
        onClick={handleTransmit}
        className={`w-full py-2 px-3 rounded-lg font-chakra font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition ${
          transmitted
            ? "bg-emerald-500 text-black shadow-emerald-500/20"
            : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20 cursor-pointer"
        }`}
      >
        {transmitted ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>ROUTE TELEMETRY TRANSMITTED TO RESCUER TABLETS</span>
          </>
        ) : (
          <>
            <Radio className="w-4 h-4" />
            <span>TRANSMIT ROUTE TO {generatedPath.assignedTeamName.toUpperCase()}</span>
          </>
        )}
      </button>
    </div>
  );
}
