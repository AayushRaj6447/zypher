import React, { useState } from "react";
import {
  Target,
  Maximize2,
  Compass,
  Sliders,
  Layers,
  MapPin,
  Clock,
  Battery,
  X,
  Play,
  Check,
  RotateCcw,
  Pencil,
} from "lucide-react";
import {
  generateSearchGrid,
  calculatePolygonAreaSqKm,
} from "../utils/geoUtils";

export default function SearchAreaModal({
  isOpen,
  onClose,
  currentSearchArea,
  onApplySearchArea,
  onStartDrawOnMap,
  temporaryPolygonVertices,
  onClearDrawnVertices,
}) {
  const [areaName, setAreaName] = useState(currentSearchArea?.name || "Sector 5 - High Valley Basin");
  const [pattern, setPattern] = useState(currentSearchArea?.pattern || "PARALLEL_SWEEP");
  const [altitudeAgl, setAltitudeAgl] = useState(currentSearchArea?.altitudeAgl || 90);
  const [sweepSpacing, setSweepSpacing] = useState(currentSearchArea?.sweepSpacing || 110);
  const [droneSpeed, setDroneSpeed] = useState(currentSearchArea?.droneSpeed || 14);

  // Active polygon coordinates
  const [polygonCoords, setPolygonCoords] = useState(
    currentSearchArea?.polygonCoordinates || [
      [34.0450, -118.2650],
      [34.0620, -118.2650],
      [34.0640, -118.2400],
      [34.0460, -118.2380],
    ]
  );

  // If user completed drawing on map, sync vertices
  React.useEffect(() => {
    if (temporaryPolygonVertices && temporaryPolygonVertices.length >= 3) {
      setPolygonCoords(temporaryPolygonVertices);
    }
  }, [temporaryPolygonVertices]);

  if (!isOpen) return null;

  // Real-time calculations
  const calculatedAreaSqKm = calculatePolygonAreaSqKm(polygonCoords);
  const calculatedWaypoints = generateSearchGrid(polygonCoords, sweepSpacing, altitudeAgl);
  const totalFlightPathKm = +(calculatedWaypoints.length * 0.45).toFixed(1);
  const estimatedFlightMinutes = Math.round((totalFlightPathKm * 1000) / droneSpeed / 60);
  const batteryUsageEstimatePct = Math.min(100, Math.round((estimatedFlightMinutes / 40) * 100));

  const handleApply = () => {
    const updatedArea = {
      ...currentSearchArea,
      name: areaName,
      active: true,
      pattern,
      altitudeAgl,
      sweepSpacing,
      droneSpeed,
      polygonCoordinates: polygonCoords,
      areaSqKm: calculatedAreaSqKm,
      perimeterKm: +(Math.sqrt(calculatedAreaSqKm) * 4).toFixed(1),
      estimatedFlightTimeMin: estimatedFlightMinutes,
      waypoints: calculatedWaypoints,
    };

    onApplySearchArea(updatedArea);
    onClose();
  };

  const handleResetDefault = () => {
    setPolygonCoords([
      [34.0450, -118.2650],
      [34.0620, -118.2650],
      [34.0640, -118.2400],
      [34.0460, -118.2380],
    ]);
    if (onClearDrawnVertices) onClearDrawnVertices();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090e1a] border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 to-cyan-950/40 border-b border-cyan-500/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-chakra font-bold text-white tracking-wider flex items-center gap-2">
                <span>AUTONOMOUS SEARCH AREA PLANNER</span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
                  ZEPHYR MISSION CONTROL
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                Define search perimeter polygon, algorithm pattern, altitude & sweep swath
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Sector Name & Pattern */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400">SEARCH SECTOR NAME</label>
              <input
                type="text"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none mt-0.5"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400">SEARCH PATTERN ALGORITHM</label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none mt-0.5"
              >
                <option value="PARALLEL_SWEEP">Parallel Lawnmower Sweep (Standard Grid)</option>
                <option value="CREEPING_LINE">Creeping Line Ahead (Elongated Sector)</option>
                <option value="EXPANDING_SQUARE">Expanding Square (Point Datum)</option>
                <option value="SECTOR_SCAN">Sector Search (Radial Arc)</option>
              </select>
            </div>
          </div>

          {/* Interactive Map Draw Action */}
          <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Define Boundary on Tactical Map
                </span>
                <span className="text-[10px] text-slate-400">
                  {temporaryPolygonVertices?.length >= 3
                    ? `${temporaryPolygonVertices.length} custom vertices captured on map`
                    : "Click points directly on map canvas to outline custom search perimeter"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefault}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  onStartDrawOnMap();
                  onClose();
                }}
                className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] flex items-center gap-1 transition"
              >
                <Pencil className="w-3 h-3" /> Draw on Map
              </button>
            </div>
          </div>

          {/* Sliders: Altitude, Spacing, Speed */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
            {/* Altitude */}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-400">ALTITUDE (AGL)</span>
                <span className="text-cyan-400 font-bold">{altitudeAgl}m</span>
              </div>
              <input
                type="range"
                min="40"
                max="150"
                step="5"
                value={altitudeAgl}
                onChange={(e) => setAltitudeAgl(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[9px] text-slate-500">Camera GSD: 1.8 cm/px</span>
            </div>

            {/* Sweep Spacing */}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-400">SWEEP SPACING</span>
                <span className="text-cyan-400 font-bold">{sweepSpacing}m</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="10"
                value={sweepSpacing}
                onChange={(e) => setSweepSpacing(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[9px] text-slate-500">Sensor overlap: 35%</span>
            </div>

            {/* Drone Speed */}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-400">SEARCH SPEED</span>
                <span className="text-cyan-400 font-bold">{droneSpeed} m/s</span>
              </div>
              <input
                type="range"
                min="8"
                max="22"
                step="1"
                value={droneSpeed}
                onChange={(e) => setDroneSpeed(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[9px] text-slate-500">~{(droneSpeed * 3.6).toFixed(0)} km/h</span>
            </div>
          </div>

          {/* Mission Projection Metrics */}
          <div className="border border-cyan-500/20 rounded-lg p-3 bg-slate-950/60 space-y-2">
            <span className="text-[10px] font-chakra font-semibold text-cyan-300 block">
              MISSION COVERAGE PROJECTION
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-[8px] text-slate-400 block">SECTOR AREA</span>
                <span className="text-xs font-bold text-white">{calculatedAreaSqKm} km²</span>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-[8px] text-slate-400 block">WAYPOINTS</span>
                <span className="text-xs font-bold text-cyan-400">{calculatedWaypoints.length}</span>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-[8px] text-slate-400 block">EST. FLIGHT TIME</span>
                <span className="text-xs font-bold text-white">~{estimatedFlightMinutes} min</span>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-[8px] text-slate-400 block">BATTERY COST</span>
                <span className="text-xs font-bold text-emerald-400">~{batteryUsageEstimatePct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-800 bg-slate-950">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>UPLOAD FLIGHT PLAN TO ZEPHYR-01</span>
          </button>
        </div>
      </div>
    </div>
  );
}
