import React, { useEffect, useRef } from "react";

/**
 * Tactical Attitude Director Indicator (Artificial Horizon)
 * Visualizes pitch, roll, bank angle, and aircraft reticle
 */
export default function ArtificialHorizon({ pitch = 0, roll = 0, heading = 0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = width / 2 - 4;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Save initial state
    ctx.save();

    // Clip to circular gauge
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Rotate for roll
    ctx.translate(cx, cy);
    ctx.rotate((roll * Math.PI) / 180);

    // Translate for pitch (e.g. 2.5 pixels per degree of pitch)
    const pitchOffset = pitch * 2.5;
    ctx.translate(0, pitchOffset);

    // Sky gradient (Top half)
    const skyGrad = ctx.createLinearGradient(0, -cy * 2, 0, 0);
    skyGrad.addColorStop(0, "#0369a1");
    skyGrad.addColorStop(1, "#38bdf8");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(-width * 1.5, -height * 2, width * 3, height * 2);

    // Ground gradient (Bottom half)
    const groundGrad = ctx.createLinearGradient(0, 0, 0, cy * 2);
    groundGrad.addColorStop(0, "#78350f");
    groundGrad.addColorStop(1, "#451a03");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(-width * 1.5, 0, width * 3, height * 2);

    // Horizon line
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-width * 1.5, 0);
    ctx.lineTo(width * 1.5, 0);
    ctx.stroke();

    // Pitch ladder lines (+10°, +20°, -10°, -20°)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const pitchIntervals = [-30, -20, -10, 10, 20, 30];
    pitchIntervals.forEach((deg) => {
      const y = -deg * 2.5;
      const lineWidth = Math.abs(deg) % 20 === 0 ? 38 : 22;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-lineWidth, y);
      ctx.lineTo(lineWidth, y);
      ctx.stroke();

      // Number text
      ctx.fillText(`${Math.abs(deg)}°`, lineWidth + 12, y);
      ctx.fillText(`${Math.abs(deg)}°`, -lineWidth - 12, y);
    });

    ctx.restore();

    // Draw fixed aircraft reticle (stationary crosshair)
    ctx.save();
    ctx.translate(cx, cy);

    // Central pip
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Left and right wings
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Left wing
    ctx.moveTo(-36, 0);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-14, 7);
    // Right wing
    ctx.moveTo(36, 0);
    ctx.lineTo(14, 0);
    ctx.lineTo(14, 7);
    ctx.stroke();

    ctx.restore();

    // Bezel border ring with roll markings
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Bank angle indicator markings on top arc
    ctx.save();
    ctx.translate(cx, cy);
    const bankAngles = [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60];
    bankAngles.forEach((angle) => {
      const rad = ((angle - 90) * Math.PI) / 180;
      const isMajor = Math.abs(angle) === 30 || Math.abs(angle) === 60 || angle === 0;
      const r1 = radius - (isMajor ? 8 : 4);
      const r2 = radius;

      ctx.strokeStyle = angle === 0 ? "#e11d48" : "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(r1 * Math.cos(rad), r1 * Math.sin(rad));
      ctx.lineTo(r2 * Math.cos(rad), r2 * Math.sin(rad));
      ctx.stroke();
    });

    ctx.restore();
  }, [pitch, roll, heading]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={130}
        height={130}
        className="rounded-full shadow-lg shadow-black/80 border border-cyan-500/30 bg-slate-950"
      />
      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-300 mt-1.5">
        <span className="text-cyan-400">PITCH: {pitch > 0 ? `+${pitch.toFixed(1)}` : pitch.toFixed(1)}°</span>
        <span className="text-emerald-400">ROLL: {roll > 0 ? `+${roll.toFixed(1)}` : roll.toFixed(1)}°</span>
      </div>
    </div>
  );
}
