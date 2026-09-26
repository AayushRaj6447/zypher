import React, { useState, useEffect } from "react";
import {
  Camera,
  MapPin,
  Navigation,
  Radio,
  X,
  AlertTriangle,
  Maximize2,
} from "lucide-react";

export default function RightPanel({
  capturedDetections = [],
  selectedDetection,
  onSelectDetection,
  rescueTeams,
  selectedTeamId,
  setSelectedTeamId,
  generatedPath,
  onGeneratePath,
  onClosePath,
  onTransmitToTeam,
}) {
  const [activeTab, setActiveTab] = useState("CAPTURES"); // 'CAPTURES' | 'RESCUER_PATH'
  const [isTransmitted, setIsTransmitted] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);

  // Close full-screen photo modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setEnlargedPhoto(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (generatedPath) {
      setActiveTab("RESCUER_PATH");
    }
  }, [generatedPath]);

  const handleTransmit = () => {
    setIsTransmitted(true);
    if (onTransmitToTeam) onTransmitToTeam(generatedPath);
    setTimeout(() => setIsTransmitted(false), 3000);
  };

  const item = selectedDetection || (capturedDetections.length > 0 ? capturedDetections[0] : null);

  return (
    <div className="glass-panel rounded-2xl w-84 md:w-96 max-h-[calc(100vh-2rem)] flex flex-col text-slate-200 overflow-hidden shadow-2xl transition-all">
      {/* Top Header & Transparent Tab Controls (2 Clean Tabs) */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="grid grid-cols-2 bg-black/30 p-0.5 rounded-xl border border-white/5 text-[11px] w-full">
          <button
            onClick={() => setActiveTab("CAPTURES")}
            className={`py-1.5 rounded-lg transition font-medium text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "CAPTURES"
                ? "bg-white/15 text-white shadow-xs backdrop-blur-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Aerial Detections ({capturedDetections.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("RESCUER_PATH")}
            className={`py-1.5 rounded-lg transition font-medium text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "RESCUER_PATH"
                ? "bg-white/15 text-white shadow-xs backdrop-blur-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rescuer Path</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CAPTURED DETECTIONS FEED */}
      {activeTab === "CAPTURES" && (
        <div className="p-3.5 space-y-3 overflow-y-auto text-xs">
          {capturedDetections.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-400 space-y-3">
              <Camera className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
              <div className="text-white font-medium text-xs">Awaiting Drone Aerial Captures</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                Autonomous SAR sweep in progress over campus perimeter.
              </div>
            </div>
          ) : (
            <>
              {item && (
                <div className="space-y-2.5 pb-3 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white tracking-tight">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.latitude.toFixed(6)}°N, {item.longitude.toFixed(6)}°E · {item.capturedAt}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        item.type === "PERSONS"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Photo Display with Click-to-Enlarge in Full View */}
                  {item.photoUrl ? (
                    <div
                      onClick={() => setEnlargedPhoto(item.photoUrl)}
                      className="relative rounded-xl overflow-hidden border border-white/15 bg-black/95 shadow-lg cursor-pointer group"
                      title="Click to view full screen"
                    >
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        className="w-full max-h-56 object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-medium backdrop-blur-[2px]">
                        <Maximize2 className="w-4 h-4 text-cyan-400" />
                        <span>Click to View Full Screen</span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 border border-white/15 text-[9px] font-mono text-cyan-300 flex items-center gap-1 pointer-events-none">
                        <Maximize2 className="w-2.5 h-2.5" />
                        <span>VIEW FULL SCREEN</span>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl border border-white/10 bg-black/40 flex flex-col items-center justify-center text-slate-500 text-xs">
                      <Camera className="w-6 h-6 mb-1 opacity-50" />
                      <span>Telemetry Coordinates Logged</span>
                    </div>
                  )}

                  {/* Ground Condition & Hazard Notes */}
                  <div className="p-2.5 rounded-xl bg-black/25 border border-white/5 space-y-1 text-[11px]">
                    <div className="text-white font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span>{item.natureCondition}</span>
                    </div>
                    <div className="text-slate-400 text-[10px] leading-relaxed pl-3">
                      {item.hazardNotes}
                    </div>
                  </div>

                  {/* Button: Show Rescuer Path */}
                  <button
                    onClick={() => onGeneratePath(item, selectedTeamId)}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Show Rescuer Path to Target</span>
                  </button>
                </div>
              )}

              {/* Feed items list */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  Logged Aerial Sightings ({capturedDetections.length})
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {capturedDetections.map((d) => {
                    const isSelected = item?.id === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => onSelectDetection(d)}
                        className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? "bg-white/15 border-cyan-400/50 shadow-md"
                            : "bg-black/20 border-white/5 hover:bg-white/5"
                        }`}
                      >
                        {d.photoUrl ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDetection(d);
                              setEnlargedPhoto(d.photoUrl);
                            }}
                            className="relative group shrink-0"
                            title="Click to view full image"
                          >
                            <img
                              src={d.photoUrl}
                              alt={d.title}
                              className="w-14 h-10 rounded-lg object-cover bg-black border border-white/10 group-hover:border-cyan-400 transition"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                              <Maximize2 className="w-3 h-3 text-cyan-300" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-slate-400">
                            <MapPin className="w-4 h-4 text-cyan-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white truncate text-xs">{d.title}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{d.capturedAt}</span>
                          </div>
                          <div className="text-[10px] text-emerald-400 truncate font-medium">
                            {d.tag}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono">
                            {d.latitude.toFixed(6)}°N, {d.longitude.toFixed(6)}°E
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: RESCUER PATH */}
      {activeTab === "RESCUER_PATH" && (
        <div className="p-3.5 space-y-3 overflow-y-auto text-xs">
          {generatedPath ? (
            <>
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                <div>
                  <div className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Rescuer Navigation Route</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium">
                    {generatedPath.assignedTeamName} ➔ {generatedPath.targetSurvivorLabel}
                  </div>
                </div>
                <button
                  onClick={onClosePath}
                  className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                  title="Clear path"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Transit Estimates */}
              <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                <div className="p-2 rounded-xl bg-black/20 border border-white/5">
                  <div className="text-slate-400 text-[10px]">Route Distance</div>
                  <div className="font-mono text-white font-semibold text-sm mt-0.5">
                    {generatedPath.routeDistanceKm} km
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-black/20 border border-white/5">
                  <div className="text-slate-400 text-[10px]">Est. Transit Time</div>
                  <div className="font-mono text-cyan-300 font-semibold text-sm mt-0.5">
                    ~{generatedPath.footTransitTimeMin} min (Rapid Patrol)
                  </div>
                </div>
              </div>

              {/* Safety advisory */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px]">
                <div className="font-semibold text-[10px] text-amber-300 mb-0.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Route Advisory:
                </div>
                <div className="leading-relaxed">{generatedPath.safetyAdvisory}</div>
              </div>

              {/* Turn-by-Turn Checkpoints */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  Checkpoints
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {generatedPath.waypoints.map((wp) => (
                    <div
                      key={wp.index}
                      className="p-2 rounded-lg bg-black/20 border border-white/5 text-[10px] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-[8px]">
                          {wp.index}
                        </span>
                        <div>
                          <div className="font-medium text-white">{wp.name}</div>
                          <div className="text-slate-400 text-[9px]">{wp.hazardNote}</div>
                        </div>
                      </div>
                      <div className="text-slate-400 font-mono text-[9px]">{wp.elevation}m</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transmit button */}
              <button
                onClick={handleTransmit}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isTransmitted ? "Coordinates Beamed to Rescuer Radios" : "Transmit Route to Rescuers"}</span>
              </button>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No active rescue path. Select a sighting and click "Show Rescuer Path".
            </div>
          )}
        </div>
      )}

      {/* Fullscreen High-Res Photo Modal */}
      {enlargedPhoto && (
        <div
          onClick={() => setEnlargedPhoto(null)}
          className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[92vh] bg-slate-900/95 border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default"
          >
            {/* Modal Header */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between text-xs bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-white text-sm">{item?.title || "Aerial Vision Capture"}</span>
                <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {item?.tag || "ONBOARD SENSOR"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {item?.capturedAt}
                </span>
              </div>
              <button
                onClick={() => setEnlargedPhoto(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px]"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>

            {/* Modal Image Body (Full uncropped resolution) */}
            <div className="p-2 md:p-4 bg-black/95 flex items-center justify-center overflow-auto flex-1">
              <img
                src={enlargedPhoto}
                alt="Enlarged Aerial Detection"
                className="max-h-[74vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Modal Footer with Coordinates, Hazard Notes & Action Button */}
            <div className="p-3 border-t border-white/10 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-300">
              <div className="space-y-0.5">
                <div className="font-mono text-cyan-300 text-[11px] flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>GPS: {item?.latitude?.toFixed(6)}° N, {item?.longitude?.toFixed(6)}° E</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300">{item?.natureCondition}</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  {item?.hazardNotes}
                </div>
              </div>

              <button
                onClick={() => {
                  if (item) onGeneratePath(item, selectedTeamId);
                  setEnlargedPhoto(null);
                }}
                className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Plot Rescue Route</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
