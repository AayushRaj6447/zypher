import React, { useState } from "react";
import {
  Camera,
  MapPin,
  Navigation,
  Radio,
  X,
  Plus,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
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
  onAddManualDetection,
  onStartMapPick,
  pickedCoords,
}) {
  const [activeTab, setActiveTab] = useState("CAPTURES"); // 'CAPTURES' | 'RESCUER_PATH' | 'FEED'
  const [isTransmitted, setIsTransmitted] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);

  // Form for feeding photo & location
  const [feedTitle, setFeedTitle] = useState("Target Sighting Alpha");
  const [feedTag, setFeedTag] = useState("PERSONS DETECTED");
  const [feedLat, setFeedLat] = useState("23.420528");
  const [feedLon, setFeedLon] = useState("85.434533");
  const [feedPhoto, setFeedPhoto] = useState(null);
  const [feedNotes, setFeedNotes] = useState("Campus demonstration area. Clear approach via pedestrian walkway.");

  React.useEffect(() => {
    if (pickedCoords) {
      setFeedLat(pickedCoords.lat.toFixed(6));
      setFeedLon(pickedCoords.lon.toFixed(6));
      setActiveTab("FEED");
    }
  }, [pickedCoords]);

  React.useEffect(() => {
    if (generatedPath) {
      setActiveTab("RESCUER_PATH");
    }
  }, [generatedPath]);

  const handleTransmit = () => {
    setIsTransmitted(true);
    if (onTransmitToTeam) onTransmitToTeam(generatedPath);
    setTimeout(() => setIsTransmitted(false), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFeedPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeedSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `INGEST-${Date.now().toString().slice(-4)}`,
      title: feedTitle,
      type: feedTag.includes("PERSONS") ? "PERSONS" : "DAMAGE",
      tag: feedTag,
      photoUrl: feedPhoto || null,
      latitude: parseFloat(feedLat),
      longitude: parseFloat(feedLon),
      altitude: 0.0,
      capturedAt: new Date().toLocaleTimeString("en-GB"),
      natureCondition: "Campus Demonstration Sector",
      hazardNotes: feedNotes,
    };

    onAddManualDetection(newEntry);
    setActiveTab("CAPTURES");
  };

  const item = selectedDetection || (capturedDetections.length > 0 ? capturedDetections[0] : null);

  return (
    <div className="glass-panel rounded-2xl w-84 md:w-96 max-h-[calc(100vh-2rem)] flex flex-col text-slate-200 overflow-hidden shadow-2xl transition-all">
      {/* Top Header & Transparent Tab Controls */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="grid grid-cols-3 bg-black/30 p-0.5 rounded-xl border border-white/5 text-[11px] w-full">
          <button
            onClick={() => setActiveTab("CAPTURES")}
            className={`py-1.5 rounded-lg transition font-medium text-center flex items-center justify-center gap-1 ${
              activeTab === "CAPTURES"
                ? "bg-white/15 text-white shadow-xs backdrop-blur-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>Detections ({capturedDetections.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("RESCUER_PATH")}
            className={`py-1.5 rounded-lg transition font-medium text-center flex items-center justify-center gap-1 ${
              activeTab === "RESCUER_PATH"
                ? "bg-white/15 text-white shadow-xs backdrop-blur-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Navigation className="w-3 h-3" />
            <span>Rescuer Path</span>
          </button>
          <button
            onClick={() => setActiveTab("FEED")}
            className={`py-1.5 rounded-lg transition font-medium text-center flex items-center justify-center gap-1 ${
              activeTab === "FEED"
                ? "bg-white/15 text-white shadow-xs backdrop-blur-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Feed Photo</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CAPTURED DETECTIONS FEED */}
      {activeTab === "CAPTURES" && (
        <div className="p-3.5 space-y-3 overflow-y-auto text-xs">
          {capturedDetections.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-400 space-y-3">
              <Camera className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
              <div className="text-white font-medium text-xs">No Detections Registered Yet</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                Feed an image using the "Feed Photo" tab or click below to upload a photo for the demonstration.
              </div>
              <button
                onClick={() => setActiveTab("FEED")}
                className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition"
              >
                Upload / Feed Photo Now
              </button>
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

                  {/* Photo Display with Click-to-Enlarge */}
                  {item.photoUrl ? (
                    <div
                      onClick={() => setEnlargedPhoto(item.photoUrl)}
                      className="relative rounded-xl overflow-hidden border border-white/10 bg-black/90 shadow-lg cursor-pointer group"
                      title="Click to inspect full resolution detection"
                    >
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        className="w-full max-h-56 object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-medium backdrop-blur-[2px]">
                        <ZoomIn className="w-4 h-4 text-cyan-400" />
                        <span>Inspect High-Res Aerial View</span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 border border-white/10 text-[9px] font-mono text-cyan-300 pointer-events-none">
                        1024×640 · ONBOARD CAM
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl border border-white/10 bg-black/40 flex flex-col items-center justify-center text-slate-500 text-xs">
                      <Camera className="w-6 h-6 mb-1 opacity-50" />
                      <span>Telemetry Coordinates Logged</span>
                    </div>
                  )}

                  {/* Condition */}
                  <div className="p-2.5 rounded-xl bg-black/25 border border-white/5 space-y-1 text-[11px]">
                    <div className="text-white font-medium">{item.natureCondition}</div>
                    <div className="text-slate-400 text-[10px]">{item.hazardNotes}</div>
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
                  Logged Sighting Feed ({capturedDetections.length})
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
                          <img
                            src={d.photoUrl}
                            alt={d.title}
                            className="w-10 h-10 rounded-lg object-cover bg-black shrink-0 border border-white/10"
                          />
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
                  className="p-1 text-slate-400 hover:text-white rounded"
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

      {/* TAB 3: FEED PHOTO (Upload any photo from device or take photo) */}
      {activeTab === "FEED" && (
        <form onSubmit={handleFeedSubmit} className="p-3.5 space-y-3 overflow-y-auto text-xs">
          <div className="text-xs font-semibold text-white tracking-tight">
            Feed Sighting Photo & Coordinates
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
              Select Photo from Device
            </label>
            <div className="flex items-center gap-2">
              {feedPhoto ? (
                <img
                  src={feedPhoto}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-white/10 bg-black shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
                  <Camera className="w-5 h-5 opacity-40" />
                </div>
              )}
              <label className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 text-center cursor-pointer text-xs transition">
                <Upload className="w-3.5 h-3.5 inline mr-1" />
                Choose Photo File
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
                Target Label
              </label>
              <input
                type="text"
                value={feedTitle}
                onChange={(e) => setFeedTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
                Detection Type
              </label>
              <select
                value={feedTag}
                onChange={(e) => setFeedTag(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="PERSONS DETECTED">Persons Detected</option>
                <option value="STRUCTURAL DAMAGE">Structural Damage</option>
                <option value="HAZARD CLEARANCE">Hazard Obstacle</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-400">
                GPS Position (WGS84)
              </label>
              <button
                type="button"
                onClick={onStartMapPick}
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                <MapPin className="w-2.5 h-2.5" /> Pick from Map
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.000001"
                placeholder="Latitude"
                value={feedLat}
                onChange={(e) => setFeedLat(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                required
              />
              <input
                type="number"
                step="0.000001"
                placeholder="Longitude"
                value={feedLon}
                onChange={(e) => setFeedLon(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
              Passability & Ground Notes
            </label>
            <textarea
              rows={2}
              value={feedNotes}
              onChange={(e) => setFeedNotes(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Log Sighting into Feed</span>
          </button>
        </form>
      )}

      {/* Fullscreen High-Res Photo Modal */}
      {enlargedPhoto && (
        <div
          onClick={() => setEnlargedPhoto(null)}
          className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-md flex items-center justify-center p-6 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[88vh] bg-slate-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default"
          >
            <div className="p-3 border-b border-white/10 flex items-center justify-between text-xs bg-slate-900/90">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{item?.title || "Aerial Vision Capture"}</span>
                <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  ONBOARD DETECTIONS · 1024×640
                </span>
              </div>
              <button
                onClick={() => setEnlargedPhoto(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-black/95 flex items-center justify-center overflow-auto">
              <img
                src={enlargedPhoto}
                alt="Enlarged Aerial Detection"
                className="max-h-[72vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="p-3 border-t border-white/10 bg-slate-900/90 flex items-center justify-between text-[11px] text-slate-300">
              <div className="font-mono text-cyan-300">
                {item?.latitude?.toFixed(6)}°N, {item?.longitude?.toFixed(6)}°E · {item?.capturedAt}
              </div>
              <div className="text-slate-400 text-[10px]">
                {item?.hazardNotes}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
