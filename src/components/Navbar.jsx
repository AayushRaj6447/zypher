import React, { useState, useEffect } from "react";
import {
  Navigation,
  Compass,
  Radio,
  Satellite,
  Battery,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Target,
  PlusCircle,
  Shield,
  Activity,
  ChevronDown,
} from "lucide-react";

export default function Navbar({
  telemetry,
  onFlightModeChange,
  isSimulating,
  onToggleSimulation,
  onOpenSearchAreaModal,
  onOpenFeedModal,
  survivorCount,
  criticalCount,
}) {
  const [missionSeconds, setMissionSeconds] = useState(5040); // 1h 24m
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setMissionSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatMissionTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const flightModes = [
    { mode: "AUTO_SEARCH", label: "Auto Search (Grid Sweep)", desc: "Autonomous lawnmower search" },
    { mode: "LOITER", label: "Loiter / Station Keep", desc: "Hold position & altitude" },
    { mode: "RTL", label: "Return to Launch (RTL)", desc: "Autonomous return to base camp" },
    { mode: "MANUAL_GUIDED", label: "Manual Guided", desc: "Direct stick input control" },
    { mode: "EMERGENCY_LAND", label: "Emergency Land", desc: "Immediate descent at location" },
  ];

  return (
    <header className="h-14 bg-[#070b16] border-b border-cyan-500/25 px-4 flex items-center justify-between select-none z-50 relative shadow-xl backdrop-blur-md">
      {/* Brand & Drone ID */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Drone Pulse Icon */}
          <div className="relative w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Navigation className="w-5 h-5 -rotate-45" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-chakra font-black tracking-widest text-white">
                ZEPHYR<span className="text-cyan-400">-01</span>
              </span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-bold tracking-wider">
                SAR GCS
              </span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 leading-none">
              <span>OP: APEX HORIZON</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE SENSORS
              </span>
            </div>
          </div>
        </div>

        {/* Mission Elapsed Time */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs font-mono">
          <span className="text-slate-500 text-[10px]">MISSION TIME:</span>
          <span className="text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {formatMissionTime(missionSeconds)}
          </span>
        </div>
      </div>

      {/* Center Flight Mode & Telemetry Quick Stats */}
      <div className="flex items-center gap-2">
        {/* Flight Mode Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowModeDropdown(!showModeDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-xs font-mono text-white hover:bg-slate-800 transition"
          >
            <span className="text-[10px] text-slate-400">MODE:</span>
            <span className="font-bold text-cyan-400">{telemetry.flightMode}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showModeDropdown && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-cyan-500/40 rounded-lg shadow-2xl p-1 z-50 text-xs font-mono backdrop-blur-md">
              {flightModes.map((item) => (
                <button
                  key={item.mode}
                  onClick={() => {
                    onFlightModeChange(item.mode);
                    setShowModeDropdown(false);
                  }}
                  className={`w-full text-left p-2 rounded transition flex flex-col ${
                    telemetry.flightMode === item.mode
                      ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span className="text-[11px]">{item.label}</span>
                  <span className="text-[9px] text-slate-500 font-normal">{item.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Simulation Engine Toggle */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
            isSimulating
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10"
              : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
          }`}
          title="Toggle live telemetry and autonomous grid flight movement"
        >
          {isSimulating ? (
            <>
              <Pause className="w-3.5 h-3.5 text-emerald-400" />
              <span>LIVE TRACKING ON</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-slate-400" />
              <span>RESUME FLIGHT SIM</span>
            </>
          )}
        </button>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Define Search Area Action */}
        <button
          onClick={onOpenSearchAreaModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition cursor-pointer"
        >
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Define Search Area</span>
        </button>

        {/* Feed Sighting Action (Upload Photo & Coordinates) */}
        <button
          onClick={onOpenFeedModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-chakra font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>FEED SIGHTING</span>
        </button>
      </div>
    </header>
  );
}
