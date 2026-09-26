import React, { useState } from "react";
import {
  Upload,
  Camera,
  MapPin,
  AlertTriangle,
  Compass,
  Thermometer,
  Trees,
  Mountain,
  Droplets,
  Wind,
  Check,
  X,
  Sparkles,
} from "lucide-react";

export default function SurvivorFeedModal({
  isOpen,
  onClose,
  onSubmitSighting,
  onStartMapPick,
  pickedCoords,
}) {
  const [label, setLabel] = useState(`Survivor Sighting ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`);
  const [latitude, setLatitude] = useState(pickedCoords ? pickedCoords.lat.toFixed(5) : "34.0535");
  const [longitude, setLongitude] = useState(pickedCoords ? pickedCoords.lon.toFixed(5) : "-118.2515");
  const [elevation, setElevation] = useState("380");
  const [triageLevel, setTriageLevel] = useState("CRITICAL"); // CRITICAL, SERIOUS, STABLE
  const [thermalSignature, setThermalSignature] = useState("35.4°C (Mild Hypothermia)");
  const [vitalsEstimate, setVitalsEstimate] = useState("Conscious, Low Movement, Needs Thermal Blanket");
  const [photoPreview, setPhotoPreview] = useState(
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
  );
  const [customPhotoSelected, setCustomPhotoSelected] = useState(false);

  // Nature condition fields
  const [terrainType, setTerrainType] = useState("Deep Rocky Gorge & Scree Incline");
  const [slopeGradient, setSlopeGradient] = useState("32° Scree Slope");
  const [groundStability, setGroundStability] = useState("Loose Gravel & Rockfall Hazard");
  const [waterHazard, setWaterHazard] = useState("Mountain Torrent Creek (1.5 m/s, 1.0m deep)");
  const [canopyCover, setCanopyCover] = useState("Sparse Timber - Visible from AGL 80m");
  const [accessibilityRating, setAccessibilityRating] = useState("EXTREME_DIFFICULT");
  const [microWeather, setMicroWeather] = useState("Wind 14 kts NNE, Ambient 8°C, Visibility 800m");
  const [passabilityNotes, setPassabilityNotes] = useState(
    "Southern ridge approach recommended. Direct northern face has 12m vertical drop."
  );

  // Sync picked coordinates from map
  React.useEffect(() => {
    if (pickedCoords) {
      setLatitude(pickedCoords.lat.toFixed(5));
      setLongitude(pickedCoords.lon.toFixed(5));
    }
  }, [pickedCoords]);

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
        setCustomPhotoSelected(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPreset = (presetKey) => {
    if (presetKey === "FLOOD") {
      setTerrainType("Submerged River Plain & Silt Basin");
      setSlopeGradient("3° Flat Plain");
      setGroundStability("Soft Silt & Rising Mud");
      setWaterHazard("Standing Water 1.2m Deep, Current 1.8 m/s");
      setCanopyCover("Open Sky - Winch Accessible");
      setAccessibilityRating("WATER_AMPHIBIOUS");
      setPassabilityNotes("Amphibious Skid or Helicopter Winch required. Foot march prohibited due to water depth.");
    } else if (presetKey === "FOREST") {
      setTerrainType("Dense Pine Canopy & Fallen Deadfall");
      setSlopeGradient("18° Rolling Ridge");
      setGroundStability("Pine Needle Humus, Good Foot Traction");
      setWaterHazard("Dry Gully");
      setCanopyCover("Heavy Canopy (80% Crown Cover - Winch Blocked)");
      setAccessibilityRating("MODERATE_VEHICLE");
      setPassabilityNotes("ATV trail available within 120m; final approach requires chainsaw trail clearance.");
    } else if (presetKey === "CLIFF") {
      setTerrainType("Vertical Granite Bluff & Scree Shelf");
      setSlopeGradient("45° High Angle Face");
      setGroundStability("Fractured Shale, Severe Rockfall Hazard");
      setWaterHazard("None");
      setCanopyCover("Exposed Rock Shelf");
      setAccessibilityRating("EXTREME_DIFFICULT");
      setPassabilityNotes("Technical rope rigging (Stokes basket hoist) necessary. Rappel anchors on upper rim.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newSurvivor = {
      id: `SURV-${Date.now().toString().slice(-4)}`,
      label,
      detectedAt: new Date().toISOString(),
      detectionConfidence: +(94 + Math.random() * 5).toFixed(1),
      triageLevel,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      elevation: parseInt(elevation, 10) || 350,
      thermalSignature,
      vitalsEstimate,
      aiTags: ["Field Sighting Feed", "Payload AI Confirmed", triageLevel],
      photoUrl: photoPreview,
      thermalPhotoUrl: photoPreview,
      natureCondition: {
        terrainType,
        slopeGradient,
        groundStability,
        waterHazard,
        canopyCover,
        accessibilityRating,
        recommendedGear:
          accessibilityRating === "EXTREME_DIFFICULT"
            ? ["Technical Rope System", "Stokes Basket", "Trauma Pack"]
            : accessibilityRating === "WATER_AMPHIBIOUS"
            ? ["Dry Suits", "Inflatable Skid", "Thermal Blankets"]
            : ["Standard Medical Kit", "ATV Trail Kit"],
        microWeather,
        passabilityNotes,
      },
      evacStatus: "PENDING_PATH",
      assignedTeam: null,
    };

    onSubmitSighting(newSurvivor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#090e1a] border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 to-cyan-950/40 border-b border-cyan-500/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-chakra font-bold text-white tracking-wider flex items-center gap-2">
                <span>INGEST SURVIVOR DETECTION & SENSOR FEED</span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
                  ZEPHYR TACTICAL INTEL
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                Register aerial sighting photo, GPS coordinates, and nature condition for path generation
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Top Section: Photo Ingestion & GPS Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left: Photo Upload & Preview */}
            <div className="md:col-span-5 flex flex-col gap-2">
              <label className="text-[11px] font-chakra font-semibold text-cyan-400 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> SIGHTING PHOTO FEED
              </label>

              {/* Photo Box */}
              <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-cyan-500/40 bg-slate-950 flex flex-col items-center justify-center group">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Sighting Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Camera className="w-8 h-8 text-cyan-500/50" />
                    <span className="text-[10px]">No image selected</span>
                  </div>
                )}

                {/* Overlay upload button */}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-cyan-300 gap-1 backdrop-blur-xs">
                  <Upload className="w-6 h-6 text-cyan-400" />
                  <span className="text-[11px] font-bold">Select Local Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image URL input fallback */}
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  placeholder="Or paste image URL..."
                  value={customPhotoSelected ? "Local File Selected" : photoPreview}
                  onChange={(e) => {
                    setPhotoPreview(e.target.value);
                    setCustomPhotoSelected(false);
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-200 focus:border-cyan-400 focus:outline-none"
                />
                <label className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded cursor-pointer text-[10px]">
                  Browse
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Right: Identification & Coordinates */}
            <div className="md:col-span-7 space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400">SURVIVOR IDENTIFIER</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none mt-0.5"
                  required
                />
              </div>

              {/* GPS Coordinates with Map Picker Button */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" /> GPS POSITION (LAT / LON)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      onStartMapPick();
                      onClose();
                    }}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
                  >
                    <span>Click on Tactical Map to pinpoint</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-0.5">
                  <input
                    type="number"
                    step="0.00001"
                    placeholder="Latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    step="0.00001"
                    placeholder="Longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Triage Urgency Level & Elevation */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">TRIAGE PRIORITY</label>
                  <select
                    value={triageLevel}
                    onChange={(e) => setTriageLevel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none mt-0.5"
                  >
                    <option value="CRITICAL">🔴 CRITICAL (Immediate)</option>
                    <option value="SERIOUS">🟡 SERIOUS (Urgent)</option>
                    <option value="STABLE">🔵 STABLE (Monitored)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">ELEVATION (MSL)</label>
                  <input
                    type="number"
                    value={elevation}
                    onChange={(e) => setElevation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none mt-0.5"
                  />
                </div>
              </div>

              {/* Thermal & Vitals */}
              <div>
                <label className="text-[10px] text-slate-400">THERMAL READING / VITALS</label>
                <div className="grid grid-cols-2 gap-2 mt-0.5">
                  <input
                    type="text"
                    value={thermalSignature}
                    onChange={(e) => setThermalSignature(e.target.value)}
                    placeholder="e.g. 35.4°C"
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={vitalsEstimate}
                    onChange={(e) => setVitalsEstimate(e.target.value)}
                    placeholder="Vitals notes"
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Nature & Environmental Conditions (Critical for Path Generation) */}
          <div className="border-t border-cyan-500/20 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-chakra font-semibold text-emerald-300">
                  NATURE & TERRAIN CONDITIONS (PATH GENERATION INPUT)
                </span>
              </div>

              {/* Quick nature presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-400">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("FLOOD")}
                  className="px-2 py-0.5 rounded bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-600/40 text-[9px]"
                >
                  River Flood
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("FOREST")}
                  className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 text-[9px]"
                >
                  Dense Canopy
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("CLIFF")}
                  className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-600/40 text-[9px]"
                >
                  Steep Cliff
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400">TERRAIN CLASSIFICATION</label>
                <input
                  type="text"
                  value={terrainType}
                  onChange={(e) => setTerrainType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white focus:border-cyan-400 focus:outline-none mt-0.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400">SLOPE GRADIENT</label>
                <input
                  type="text"
                  value={slopeGradient}
                  onChange={(e) => setSlopeGradient(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white focus:border-cyan-400 focus:outline-none mt-0.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400">ACCESSIBILITY RATING</label>
                <select
                  value={accessibilityRating}
                  onChange={(e) => setAccessibilityRating(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white focus:border-cyan-400 focus:outline-none mt-0.5"
                >
                  <option value="EXTREME_DIFFICULT">⚠️ Extreme - Rope Rigging Required</option>
                  <option value="WATER_AMPHIBIOUS">🌊 Water Hazard - Amphibious Skid / Winch</option>
                  <option value="MODERATE_VEHICLE">🚜 Moderate - ATV / 4x4 Trail Reachable</option>
                  <option value="LOW_HAZARD">🚶 Foot Patrol Accessible</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400">WATER & FLOOD HAZARDS</label>
                <input
                  type="text"
                  value={waterHazard}
                  onChange={(e) => setWaterHazard(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white focus:border-cyan-400 focus:outline-none mt-0.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400">MICRO-WEATHER & TEMPERATURE</label>
                <input
                  type="text"
                  value={microWeather}
                  onChange={(e) => setMicroWeather(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white focus:border-cyan-400 focus:outline-none mt-0.5"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400">RESCUER PASSABILITY GUIDANCE NOTES</label>
              <textarea
                rows={2}
                value={passabilityNotes}
                onChange={(e) => setPassabilityNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white focus:border-cyan-400 focus:outline-none mt-0.5 resize-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
            >
              <Check className="w-4 h-4" />
              <span>INGEST TO TACTICAL SIGHTING ROSTER</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
