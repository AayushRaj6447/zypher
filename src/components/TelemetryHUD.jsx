import React, { useState } from "react";
import {
  Compass,
  Gauge,
  BatteryCharging,
  Radio,
  Satellite,
  Eye,
  Camera,
  Layers,
  Crosshair,
  Wind,
  ShieldCheck,
  Zap,
} from "lucide-react";
import ArtificialHorizon from "./ArtificialHorizon";

export default function TelemetryHUD({ telemetry, isSimulating, setIsSimulating }) {
  const [cameraMode, setCameraMode] = useState("OPTICAL"); // OPTICAL or THERMAL
  const [zoomLevel, setZoomLevel] = useState(4.2);

  const getBatteryColor = (pct) => {
    if (pct > 50) return "text-emerald-400 bg-emerald-500";
    if (pct > 25) return "text-amber-400 bg-amber-500";
    return "text-rose-500 bg-rose-500";
  };

  const getHeadingCardinal = (deg) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return directions[index];
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Flight Attitude & Speed Instruments */}
      <div className="bg-[#0b1120]/90 border border-cyan-500/25 rounded-lg p-3 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-chakra font-semibold text-cyan-400 tracking-wider">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>PRIMARY FLIGHT DISPLAY</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
            {telemetry.flightMode}
          </span>
        </div>

        {/* ADI and Tape Instruments Grid */}
        <div className="grid grid-cols-12 gap-2 items-center">
          {/* Airspeed Column */}
          <div className="col-span-3 flex flex-col items-center justify-center p-1.5 bg-slate-900/80 rounded border border-slate-700/50">
            <span className="text-[9px] font-mono text-slate-400 tracking-wider">GND SPD</span>
            <div className="text-lg font-bold font-mono text-white leading-none my-1">
              {telemetry.groundSpeed.toFixed(1)}
              <span className="text-[10px] font-normal text-slate-400 ml-0.5">m/s</span>
            </div>
            <span className="text-[9px] font-mono text-cyan-400">
              {(telemetry.groundSpeed * 3.6).toFixed(0)} km/h
            </span>
          </div>

          {/* Central Artificial Horizon */}
          <div className="col-span-6 flex flex-col items-center justify-center">
            <ArtificialHorizon
              pitch={telemetry.pitch}
              roll={telemetry.roll}
              heading={telemetry.heading}
            />
          </div>

          {/* Altitude Column */}
          <div className="col-span-3 flex flex-col items-center justify-center p-1.5 bg-slate-900/80 rounded border border-slate-700/50">
            <span className="text-[9px] font-mono text-slate-400 tracking-wider">ALT (AGL)</span>
            <div className="text-lg font-bold font-mono text-white leading-none my-1">
              {telemetry.altitudeAgl.toFixed(1)}
              <span className="text-[10px] font-normal text-slate-400 ml-0.5">m</span>
            </div>
            <span className="text-[9px] font-mono text-cyan-400">
              MSL {telemetry.altitudeMsl.toFixed(0)}m
            </span>
          </div>
        </div>

        {/* Heading Ribbon */}
        <div className="mt-2.5 p-1.5 bg-slate-950/70 border border-cyan-500/20 rounded flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-slate-400">HEADING</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-cyan-300">
              {Math.round(telemetry.heading)}°
            </span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-900/50 text-[10px] text-cyan-200 font-bold border border-cyan-500/40">
              {getHeadingCardinal(telemetry.heading)}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Wind className="w-3 h-3 text-slate-400" />
            <span>V/S: {telemetry.verticalSpeed >= 0 ? `+${telemetry.verticalSpeed}` : telemetry.verticalSpeed} m/s</span>
          </div>
        </div>
      </div>

      {/* Optical / Thermal Gimbal Sensor Feed */}
      <div className="bg-[#0b1120]/90 border border-cyan-500/25 rounded-lg p-3 backdrop-blur-md shadow-xl flex-1 flex flex-col">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-chakra font-semibold text-cyan-400 tracking-wider">
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>GIMBAL SENSOR STREAM</span>
          </div>
          {/* Optical vs Thermal Toggle */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-700/60 text-[10px] font-mono">
            <button
              onClick={() => setCameraMode("OPTICAL")}
              className={`px-2 py-0.5 rounded transition ${
                cameraMode === "OPTICAL"
                  ? "bg-cyan-500 text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              4K OPTICAL
            </button>
            <button
              onClick={() => setCameraMode("THERMAL")}
              className={`px-2 py-0.5 rounded transition ${
                cameraMode === "THERMAL"
                  ? "bg-rose-500 text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              LWIR FLIR
            </button>
          </div>
        </div>

        {/* Camera Viewport Canvas/Container */}
        <div className="relative rounded overflow-hidden border border-cyan-500/40 bg-black aspect-video flex items-center justify-center group">
          {/* Simulated optical or thermal background image */}
          <img
            src={
              cameraMode === "OPTICAL"
                ? "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                : "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"
            }
            alt="Zephyr Camera Feed"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cameraMode === "THERMAL" ? "contrast-150 saturate-200 hue-rotate-180" : "contrast-105"
            }`}
          />

          {/* Tactical Crosshair Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Center crosshair */}
            <div className="relative w-12 h-12">
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-400/80 -translate-y-1/2"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-400/80 -translate-x-1/2"></div>
              <div className="absolute inset-0 border border-cyan-400/50 rounded-full"></div>
            </div>

            {/* Target Tracking Box */}
            <div className="absolute top-[28%] left-[45%] w-24 h-24 border-2 border-dashed border-rose-500 animate-pulse bg-rose-500/10 rounded flex flex-col justify-between p-1">
              <div className="flex items-center justify-between text-[8px] font-mono text-rose-300 font-bold bg-black/60 px-1 rounded">
                <span>TARGET DETECT</span>
                <span>98%</span>
              </div>
              <div className="text-[8px] font-mono text-cyan-200 bg-black/60 px-1 rounded">
                35.2°C | HUMAN
              </div>
            </div>

            {/* Live Camera Telemetry Watermark */}
            <div className="absolute top-2 left-2 flex flex-col gap-0.5 text-[9px] font-mono bg-black/70 px-2 py-1 rounded border border-cyan-500/30 text-cyan-300">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="font-bold text-white">LIVE SENSOR</span>
              </div>
              <span>ZOOM: {zoomLevel.toFixed(1)}X</span>
              <span>FOV: 42.8°</span>
            </div>

            <div className="absolute bottom-2 right-2 text-[9px] font-mono bg-black/70 px-2 py-1 rounded border border-cyan-500/30 text-slate-300">
              GPS: {telemetry.latitude.toFixed(4)}°, {telemetry.longitude.toFixed(4)}°
            </div>
          </div>
        </div>

        {/* Gimbal Controls */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800 text-[10px] font-mono">
          <span className="text-slate-400">PAYLOAD STABILIZER:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> 3-AXIS LOCK
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(1, z - 1))}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
            >
              -
            </button>
            <span className="text-cyan-400">{zoomLevel.toFixed(1)}x</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(30, z + 1))}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Subsystem Health: Power, GNSS, Comms */}
      <div className="bg-[#0b1120]/90 border border-cyan-500/25 rounded-lg p-3 backdrop-blur-md shadow-xl text-xs font-mono space-y-2.5">
        {/* Battery / Power */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-slate-300">
              <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
              <span>POWER PACK (6S LIPO)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">
                {telemetry.battery.voltage}V | {telemetry.battery.currentDraw}A
              </span>
              <span className={`font-bold ${getBatteryColor(telemetry.battery.percentage).split(" ")[0]}`}>
                {telemetry.battery.percentage}%
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                getBatteryColor(telemetry.battery.percentage).split(" ")[1]
              }`}
              style={{ width: `${telemetry.battery.percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 mt-1">
            <span>REMAINING: ~{telemetry.battery.estimatedRemainingMin} MIN</span>
            <span>CELL TEMP: {telemetry.battery.temperature}°C</span>
          </div>
        </div>

        {/* GPS & RTK */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span>GNSS POSITIONING</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1 rounded border border-emerald-500/40">
              {telemetry.gps.fixType}
            </span>
            <span className="text-slate-400">{telemetry.gps.satellitesCount} SATS</span>
            <span className="text-cyan-400">HDOP {telemetry.gps.hdop}</span>
          </div>
        </div>

        {/* Comms Link */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>DATALINK 5.8 GHz</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-cyan-300 font-bold">
              {telemetry.comms.signalStrengthDbm} dBm
            </span>
            <span className="text-emerald-400 font-semibold">
              {telemetry.comms.linkQuality}% LINK
            </span>
            <span className="text-slate-400">{telemetry.comms.latencyMs}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
