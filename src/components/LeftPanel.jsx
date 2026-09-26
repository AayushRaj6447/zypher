import React, { useState } from "react";
import {
  Navigation,
  Compass,
  Radio,
  Satellite,
  Battery,
  ShieldAlert,
  Power,
  Check,
  Pencil,
  AlertTriangle,
  AlertCircle,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { calculatePolygonAreaSqKm, generateSearchGrid } from "../utils/geoUtils";

export default function LeftPanel({
  telemetry,
  searchArea,
  onApplySearchArea,
  onStartDrawOnMap,
  onClearSearchArea,
  onClearAndDrawFresh,
  onResetDefaultSearchArea,
  onClearTemporaryPoints,
  onFinishDrawing,
  onCancelDrawing,
  mapMode,
  temporaryPolygonVertices = [],
  capturedPhotosCount = 0,
}) {
  const [activeTab, setActiveTab] = useState("FLIGHT"); // 'FLIGHT' | 'SEARCH_AREA'
  const [showArmingWarning, setShowArmingWarning] = useState(false);

  // Search Area controls
  const [areaName, setAreaName] = useState(searchArea?.name || "Campus Search Sector");
  const [pattern, setPattern] = useState(searchArea?.pattern || "PARALLEL_SWEEP");
  const [altitudeAgl, setAltitudeAgl] = useState(searchArea?.altitudeAgl || 40);
  const [sweepSpacing, setSweepSpacing] = useState(searchArea?.sweepSpacing || 60);

  const getHeadingCardinal = (deg) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return directions[index];
  };

  const hasPerimeter = searchArea?.polygonCoordinates && searchArea.polygonCoordinates.length >= 3;

  const calculatedAreaSqKm = hasPerimeter ? calculatePolygonAreaSqKm(searchArea.polygonCoordinates) : 0;
  const calculatedWaypoints = hasPerimeter
    ? generateSearchGrid(searchArea.polygonCoordinates, sweepSpacing, altitudeAgl)
    : [];
  const estimatedFlightMinutes = calculatedWaypoints.length > 0
    ? Math.round((calculatedWaypoints.length * 0.45 * 1000) / 10 / 60)
    : 0;

  const handleApplySearch = (customCoords = null) => {
    const coords = customCoords || searchArea?.polygonCoordinates || [];
    if (!coords || coords.length < 3) return;
    const waypoints = generateSearchGrid(coords, sweepSpacing, altitudeAgl);
    const areaSq = calculatePolygonAreaSqKm(coords);
    const estMin = Math.round((waypoints.length * 0.45 * 1000) / 10 / 60);

    onApplySearchArea({
      ...searchArea,
      name: areaName,
      pattern,
      altitudeAgl,
      sweepSpacing,
      polygonCoordinates: coords,
      waypoints,
      estimatedFlightTimeMin: estMin,
      areaSqKm: areaSq,
    });
  };

  const handleArmAttempt = () => {
    setShowArmingWarning(true);
    setTimeout(() => setShowArmingWarning(false), 5000);
  };

  return (
    <div className="glass-panel rounded-2xl w-80 max-h-[calc(100vh-2rem)] flex flex-col text-slate-200 overflow-hidden shadow-2xl transition-all">
      {/* Top Header */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-sm font-semibold tracking-tight text-white">Zypher GCS</span>
          <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
            SAR DRONE
          </span>
        </div>

        {/* Pre-Arm Status Badge */}
        <span className="text-[9px] text-amber-300 font-mono bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
          <AlertCircle className="w-2.5 h-2.5" />
          <span>PRE-ARM PENDING</span>
        </span>
      </div>

      {/* Segmented Tab Controls (Transparent Glass Look) */}
      <div className="px-3 pt-2.5 pb-1">
        <div className="grid grid-cols-2 bg-black/30 p-0.5 rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => setActiveTab("FLIGHT")}
            className={`py-1.5 rounded-lg transition font-medium ${
              activeTab === "FLIGHT"
                ? "bg-white/15 text-white shadow-xs backdrop-blur-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Flight & Telemetry
          </button>
          <button
            onClick={() => setActiveTab("SEARCH_AREA")}
            className={`py-1.5 rounded-lg transition font-medium ${
              activeTab === "SEARCH_AREA"
                ? "bg-white/15 text-white shadow-xs backdrop-blur-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Search Area
          </button>
        </div>
      </div>

      {/* TAB 1: FLIGHT, PRE-ARM CHECKS & TELEMETRY */}
      {activeTab === "FLIGHT" && (
        <div className="p-3.5 space-y-3 overflow-y-auto text-xs">
          {/* Status Banner */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/25 border border-white/5">
            <span className="text-slate-400 text-[11px]">Propulsion State</span>
            <div className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
              <span className="text-slate-300 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-full">
                DISARMED
              </span>
            </div>
          </div>

          {/* Pre-Arm Checks List */}
          <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-300 font-medium text-[10px] uppercase tracking-wider mb-1">
              <span>Pre-Arm Diagnostic Checks</span>
              <span className="text-amber-400 font-mono text-[9px]">INCOMPLETE</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Avionics & Gyro</span>
              <span className="text-emerald-300 font-mono">Calibrated (0.01°)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>GNSS RTK Fix</span>
              <span className="text-emerald-300 font-mono">3D Lock (24 Sats)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Battery 6S Pack</span>
              <span className="text-emerald-300 font-mono">{telemetry.battery.percentage}% (25.1V)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Compass / Magnetometer</span>
              <span className="text-amber-400 font-mono">Calibration Required</span>
            </div>
          </div>

          {/* Arming Action (Refused due to pre-arm check not complete) */}
          <div className="space-y-1.5 pt-0.5">
            <button
              onClick={handleArmAttempt}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Arm Drone (Pre-Arm Check Incomplete)</span>
            </button>

            {showArmingWarning && (
              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-[10px] text-amber-200 leading-snug animate-pulse space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Arming Denied: Pre-Arm Check Incomplete</span>
                </div>
                <div>Compass calibration and safety check not finalized. Arming and takeoff inhibited by flight controller.</div>
              </div>
            )}
          </div>

          {/* Telemetry Clean Small Text Readouts */}
          <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-400">Altitude (Height)</span>
              <span className="font-mono text-white font-medium">
                {telemetry.altitudeAgl.toFixed(1)} m AGL
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-400">Ground Speed</span>
              <span className="font-mono text-white font-medium">
                {telemetry.groundSpeed.toFixed(1)} m/s
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-400">Direction / Heading</span>
              <span className="font-mono text-white font-medium">
                {Math.round(telemetry.heading)}° {getHeadingCardinal(telemetry.heading)}
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-400">Latitude</span>
              <span className="font-mono text-cyan-300 font-medium">
                {telemetry.latitude.toFixed(6)}° N
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-400">Longitude</span>
              <span className="font-mono text-cyan-300 font-medium">
                {telemetry.longitude.toFixed(6)}° E
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-400">GNSS Satellites</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {telemetry.gps.satellitesCount} Locked (RTK Fixed)
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-400">Datalink 5.8GHz</span>
              <span className="font-mono text-slate-300">
                {telemetry.comms.signalStrengthDbm} dBm ({telemetry.comms.linkQuality}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEFINE SEARCH AREA */}
      {activeTab === "SEARCH_AREA" && (
        <div className="p-3.5 space-y-3 overflow-y-auto text-xs">
          {/* Coordinates Header */}
          <div className="p-2 rounded-xl bg-black/25 border border-white/5 text-[11px] text-slate-300">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Target Center</span>
            <span className="font-mono text-cyan-300 font-semibold">23.420528° N, 85.434533° E</span>
          </div>

          {/* Search Perimeter Status */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/25 border border-white/5 text-[11px]">
            <span className="text-slate-400">Search Perimeter</span>
            {hasPerimeter ? (
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE ({searchArea.polygonCoordinates.length} Vertices)
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                CLEARED / NONE
              </span>
            )}
          </div>

          {/* Active Drawing Mode State in Left Panel */}
          {mapMode === "DRAW_SEARCH_AREA" ? (
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-cyan-200 font-semibold flex items-center gap-1.5 text-[11px]">
                  <Pencil className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  Drawing on Map
                </span>
                <span className="font-mono text-cyan-300 text-[10px] bg-cyan-900/80 border border-cyan-500/40 px-2 py-0.5 rounded">
                  {temporaryPolygonVertices?.length || 0}/4 Points
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                Click 4 points on the map to define the corners of the new search area.
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                {temporaryPolygonVertices?.length >= 3 && (
                  <button
                    onClick={onFinishDrawing}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    Finish
                  </button>
                )}
                {temporaryPolygonVertices?.length > 0 && (
                  <button
                    onClick={onClearTemporaryPoints}
                    className="flex-1 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
                <button
                  onClick={onCancelDrawing}
                  className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Action Buttons: Clear Perimeter & Draw Fresh */
            <div className="space-y-1.5">
              <button
                onClick={onClearAndDrawFresh}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                <Pencil className="w-3.5 h-3.5 text-cyan-400" />
                <span>{hasPerimeter ? "Clear & Draw Fresh Perimeter" : "Draw Perimeter on Map"}</span>
              </button>

              {hasPerimeter ? (
                <button
                  onClick={onClearSearchArea}
                  className="w-full py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1.5 text-[11px] font-medium transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Clear Perimeter</span>
                </button>
              ) : (
                <button
                  onClick={onResetDefaultSearchArea}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center justify-center gap-1.5 text-[11px] font-medium transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Restore Default Campus Sector</span>
                </button>
              )}
            </div>
          )}

          {/* Sliders */}
          <div className="space-y-2.5 pt-1">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                <span>Flight Height (Planned Altitude)</span>
                <span className="text-white font-mono font-medium">{altitudeAgl}m</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                value={altitudeAgl}
                onChange={(e) => {
                  setAltitudeAgl(Number(e.target.value));
                  if (hasPerimeter) handleApplySearch();
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                <span>Sweep Lane Spacing</span>
                <span className="text-white font-mono font-medium">{sweepSpacing}m</span>
              </div>
              <input
                type="range"
                min="15"
                max="100"
                step="5"
                value={sweepSpacing}
                onChange={(e) => {
                  setSweepSpacing(Number(e.target.value));
                  if (hasPerimeter) handleApplySearch();
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Perimeter Area:</span>
              <span className="text-white font-mono font-medium">{calculatedAreaSqKm} km²</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Waypoints Count:</span>
              <span className="text-cyan-300 font-mono font-medium">{calculatedWaypoints.length} waypoints</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Planned Duration:</span>
              <span className="text-white font-mono font-medium">~{estimatedFlightMinutes} min</span>
            </div>
          </div>

          {/* Apply Button */}
          {hasPerimeter && (
            <button
              onClick={() => handleApplySearch()}
              className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Search Grid</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
