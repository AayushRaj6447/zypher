import React, { useState, useEffect, useRef } from "react";
import TacticalMap from "./components/TacticalMap";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";

import {
  INITIAL_DRONE_TELEMETRY,
  RESCUE_TEAMS,
  INITIAL_SEARCH_AREA,
  INITIAL_CAPTURED_DETECTIONS,
} from "./data/initialData";

import {
  generateRescuePath,
  generateSearchGrid,
} from "./utils/geoUtils";

export default function App() {
  // Telemetry is live at BIT Mesra photo coordinates (23.420528, 85.434533), grounded
  const [telemetry, setTelemetry] = useState(() => {
    try {
      localStorage.removeItem("zephyr_survivors");
      localStorage.removeItem("zypher_survivors");
    } catch (e) {}

    return {
      ...INITIAL_DRONE_TELEMETRY,
      latitude: 23.420528,
      longitude: 85.434533,
      altitudeAgl: 0.0,
      groundSpeed: 0.0,
      heading: 28,
    };
  });

  const [searchArea, setSearchArea] = useState(INITIAL_SEARCH_AREA);
  const [rescueTeams, setRescueTeams] = useState(RESCUE_TEAMS);
  const [selectedTeamId, setSelectedTeamId] = useState("TEAM-ALPHA");

  // Ingested photos / detections list (initialized with onboard camera aerial detection)
  const [capturedDetections, setCapturedDetections] = useState(INITIAL_CAPTURED_DETECTIONS);
  const [selectedDetection, setSelectedDetection] = useState(INITIAL_CAPTURED_DETECTIONS[0] || null);

  // Active Rescuer Path
  const [generatedPath, setGeneratedPath] = useState(null);

  // Map modes
  const [mapMode, setMapMode] = useState("NAV");
  const [temporaryPolygonVertices, setTemporaryPolygonVertices] = useState([]);
  const [pickedCoords, setPickedCoords] = useState(null);

  // Add manual detection from user photo feed
  const handleAddManualDetection = (newEntry) => {
    setCapturedDetections((prev) => [newEntry, ...prev]);
    setSelectedDetection(newEntry);

    // Calculate rescuer path from Team Alpha to target
    const team = rescueTeams.find((t) => t.id === selectedTeamId) || rescueTeams[0];
    const path = generateRescuePath(team, newEntry);
    setGeneratedPath(path);
  };

  // Generate path to any selected detection
  const handleGeneratePath = (detection, teamId) => {
    const team = rescueTeams.find((t) => t.id === teamId) || rescueTeams[0];
    const path = generateRescuePath(team, detection);
    setGeneratedPath(path);
  };

  // Start Drawing Perimeter on Map
  const handleStartDrawOnMap = () => {
    setMapMode("DRAW_SEARCH_AREA");
    setTemporaryPolygonVertices([]);
  };

  // Clear search perimeter completely from map
  const handleClearSearchArea = () => {
    setSearchArea((prev) => ({
      ...prev,
      polygonCoordinates: [],
      waypoints: [],
      areaSqKm: 0,
      estimatedFlightTimeMin: 0,
    }));
    setTemporaryPolygonVertices([]);
    if (mapMode === "DRAW_SEARCH_AREA") {
      setMapMode("NAV");
    }
  };

  // Clear existing perimeter and enter drawing mode to draw fresh
  const handleClearAndDrawFresh = () => {
    setSearchArea((prev) => ({
      ...prev,
      polygonCoordinates: [],
      waypoints: [],
      areaSqKm: 0,
      estimatedFlightTimeMin: 0,
    }));
    setTemporaryPolygonVertices([]);
    setMapMode("DRAW_SEARCH_AREA");
  };

  // Reset to default campus sector
  const handleResetDefaultSearchArea = () => {
    setSearchArea(INITIAL_SEARCH_AREA);
    setTemporaryPolygonVertices([]);
    if (mapMode === "DRAW_SEARCH_AREA") {
      setMapMode("NAV");
    }
  };

  // Clear temporary points placed during drawing
  const handleClearTemporaryPoints = () => {
    setTemporaryPolygonVertices([]);
  };

  // Add vertex on click
  const handlePolygonVertexAdd = (vertex) => {
    setTemporaryPolygonVertices((prev) => {
      const next = [...prev, vertex];
      if (next.length >= 4) {
        // Complete drawing, update search area
        setMapMode("NAV");
        const waypoints = generateSearchGrid(next, searchArea.sweepSpacing, searchArea.altitudeAgl);
        const estMin = Math.round((waypoints.length * 0.45 * 1000) / 10 / 60);
        setSearchArea((old) => ({
          ...old,
          polygonCoordinates: next,
          waypoints,
          estimatedFlightTimeMin: estMin,
        }));
        return [];
      }
      return next;
    });
  };

  // Finish with 3 or more points
  const handleFinishDrawing = () => {
    if (temporaryPolygonVertices.length >= 3) {
      setMapMode("NAV");
      const waypoints = generateSearchGrid(temporaryPolygonVertices, searchArea.sweepSpacing, searchArea.altitudeAgl);
      const estMin = Math.round((waypoints.length * 0.45 * 1000) / 10 / 60);
      setSearchArea((old) => ({
        ...old,
        polygonCoordinates: temporaryPolygonVertices,
        waypoints,
        estimatedFlightTimeMin: estMin,
      }));
      setTemporaryPolygonVertices([]);
    }
  };

  // Cancel drawing
  const handleCancelDrawing = () => {
    setMapMode("NAV");
    setTemporaryPolygonVertices([]);
  };

  const handleStartMapPick = () => {
    setMapMode("PICK_SIGHTING_LOCATION");
  };

  const handleMapClickLocation = (lat, lon) => {
    setPickedCoords({ lat, lon });
    setMapMode("NAV");
  };

  const handleApplySearchArea = (newArea) => {
    setSearchArea(newArea);
  };

  // Map markers for any detections fed
  const mapSurvivors = capturedDetections.map((d) => ({
    id: d.id,
    label: d.title,
    triageLevel: d.type === "PERSONS" ? "CRITICAL" : "SERIOUS",
    latitude: d.latitude,
    longitude: d.longitude,
  }));

  return (
    <div className="relative h-screen w-screen bg-[#090d16] text-slate-100 font-sans overflow-hidden select-none">
      {/* Fullscreen Map Canvas centered at BIT Mesra coordinates 23.420528, 85.434533 */}
      <TacticalMap
        telemetry={telemetry}
        survivors={mapSurvivors}
        selectedSurvivor={selectedDetection}
        onSelectSurvivor={(surv) => {
          const match = capturedDetections.find((d) => d.id === surv.id);
          if (match) setSelectedDetection(match);
        }}
        rescueTeams={rescueTeams}
        searchArea={searchArea}
        generatedPath={generatedPath}
        mapMode={mapMode}
        onMapClickLocation={handleMapClickLocation}
        onPolygonVertexAdd={handlePolygonVertexAdd}
        onFinishDrawing={handleFinishDrawing}
        onCancelDrawing={handleCancelDrawing}
        onClearTemporaryPoints={handleClearTemporaryPoints}
        temporaryPolygonVertices={temporaryPolygonVertices}
      />

      {/* Left Panel: Transparent Flight Diagnostics (Pre-arm incomplete) */}
      <div className="absolute top-4 bottom-4 left-4 z-[500] pointer-events-auto">
        <LeftPanel
          telemetry={telemetry}
          searchArea={searchArea}
          onApplySearchArea={handleApplySearchArea}
          onStartDrawOnMap={handleStartDrawOnMap}
          onClearSearchArea={handleClearSearchArea}
          onClearAndDrawFresh={handleClearAndDrawFresh}
          onResetDefaultSearchArea={handleResetDefaultSearchArea}
          onClearTemporaryPoints={handleClearTemporaryPoints}
          onFinishDrawing={handleFinishDrawing}
          onCancelDrawing={handleCancelDrawing}
          mapMode={mapMode}
          temporaryPolygonVertices={temporaryPolygonVertices}
          capturedPhotosCount={capturedDetections.length}
        />
      </div>

      {/* Right Panel: Transparent Feed Photo & Rescuer Path */}
      <div className="absolute top-4 bottom-4 right-4 z-[500] pointer-events-auto">
        <RightPanel
          capturedDetections={capturedDetections}
          selectedDetection={selectedDetection}
          onSelectDetection={(d) => setSelectedDetection(d)}
          rescueTeams={rescueTeams}
          selectedTeamId={selectedTeamId}
          setSelectedTeamId={setSelectedTeamId}
          generatedPath={generatedPath}
          onGeneratePath={handleGeneratePath}
          onClosePath={() => setGeneratedPath(null)}
          onTransmitToTeam={() => {}}
          onAddManualDetection={handleAddManualDetection}
          onStartMapPick={handleStartMapPick}
          pickedCoords={pickedCoords}
        />
      </div>
    </div>
  );
}
