import React, { useState } from "react";
import { Terminal, Shield, AlertTriangle, Info, Bell, CheckCircle } from "lucide-react";

export default function MissionEventLog({ logs = [] }) {
  const [filter, setFilter] = useState("ALL");

  const filteredLogs = logs.filter((log) => {
    if (filter === "ALERTS" && log.level !== "ALERT" && log.level !== "CRITICAL") return false;
    if (filter === "SYSTEM" && log.level !== "SYSTEM") return false;
    return true;
  });

  const getLevelStyle = (level) => {
    switch (level) {
      case "CRITICAL":
        return "text-rose-400 bg-rose-950/80 border-rose-500/40";
      case "ALERT":
        return "text-amber-300 bg-amber-950/80 border-amber-500/40";
      case "SYSTEM":
        return "text-cyan-300 bg-cyan-950/80 border-cyan-500/40";
      default:
        return "text-slate-300 bg-slate-900 border-slate-700/60";
    }
  };

  return (
    <div className="bg-[#0b1120]/90 border border-cyan-500/25 rounded-lg p-2.5 backdrop-blur-md shadow-xl flex flex-col h-full font-mono text-xs">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5 mb-2">
        <div className="flex items-center gap-1.5 text-cyan-400 font-chakra font-semibold text-xs tracking-wider">
          <Terminal className="w-3.5 h-3.5" />
          <span>MISSION EVENT TELEMETRY STREAM</span>
        </div>
        <div className="flex items-center gap-1 text-[9px]">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-1.5 py-0.5 rounded transition ${
              filter === "ALL" ? "bg-cyan-500 text-black font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilter("ALERTS")}
            className={`px-1.5 py-0.5 rounded transition ${
              filter === "ALERTS" ? "bg-rose-500 text-black font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            ALERTS
          </button>
        </div>
      </div>

      {/* Logs Scroll Window */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2 p-1.5 rounded bg-slate-950/60 border border-slate-800/80 text-[10px]"
          >
            <span className="text-slate-500 text-[9px] shrink-0 font-mono mt-0.5">
              {log.timestamp}
            </span>
            <span
              className={`px-1 rounded text-[8px] font-bold border shrink-0 ${getLevelStyle(
                log.level
              )}`}
            >
              {log.level}
            </span>
            <span className="text-slate-400 shrink-0 font-semibold text-[9px]">
              [{log.source}]:
            </span>
            <span className="text-slate-200 leading-tight flex-1">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
