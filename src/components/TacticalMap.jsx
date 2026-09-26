import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Crosshair, Layers, Navigation, Check, X, RotateCcw } from "lucide-react";

export default function TacticalMap({
  telemetry,
  survivors,
  selectedSurvivor,
  onSelectSurvivor,
  rescueTeams,
  searchArea,
  generatedPath,
  mapMode, // 'NAV' | 'DRAW_SEARCH_AREA' | 'PICK_SIGHTING_LOCATION'
  onMapClickLocation,
  onPolygonVertexAdd,
  onFinishDrawing,
  onCancelDrawing,
  onClearTemporaryPoints,
  temporaryPolygonVertices = [],
  droneTrail = [],
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const mapModeRef = useRef(mapMode);
  mapModeRef.current = mapMode;

  const onPolygonVertexAddRef = useRef(onPolygonVertexAdd);
  onPolygonVertexAddRef.current = onPolygonVertexAdd;

  const onMapClickLocationRef = useRef(onMapClickLocation);
  onMapClickLocationRef.current = onMapClickLocation;

  const layersRef = useRef({
    tileLayer: null,
    droneMarker: null,
    droneTrailLine: null,
    survivorMarkers: [],
    teamMarkers: [],
    searchAreaPolygon: null,
    searchWaypointsLine: null,
    searchWaypointDots: [],
    rescuePathGlow: null,
    rescuePathLine: null,
    rescueCheckpoints: [],
    tempDrawLayers: [],
  });

  const [mapStyle, setMapStyle] = useState("SATELLITE");

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.420528, 85.434533],
        zoom: 18,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      map.on("click", (e) => {
        const mode = mapModeRef.current;
        if (mode === "PICK_SIGHTING_LOCATION" && onMapClickLocationRef.current) {
          onMapClickLocationRef.current(e.latlng.lat, e.latlng.lng);
        } else if (mode === "DRAW_SEARCH_AREA" && onPolygonVertexAddRef.current) {
          onPolygonVertexAddRef.current([e.latlng.lat, e.latlng.lng]);
        }
      });

      mapRef.current = map;
    }
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (layersRef.current.tileLayer) {
      map.removeLayer(layersRef.current.tileLayer);
    }

    let url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

    if (mapStyle === "SATELLITE") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    } else if (mapStyle === "DARK") {
      url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    } else {
      url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    }

    const tileLayer = L.tileLayer(url, {
      maxZoom: 19,
      maxNativeZoom: 19,
    }).addTo(map);

    layersRef.current.tileLayer = tileLayer;
  }, [mapStyle]);

  // Recalibrate map sizing whenever drawing mode toggles
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  }, [mapMode]);

  // Zypher Drone Marker
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const droneHtml = `
      <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
        <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(6, 182, 212, 0.25); border: 1.5px solid rgba(6, 182, 212, 0.9);"></div>
        <div style="transform: rotate(${telemetry.heading}deg); transition: transform 0.25s linear; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="#38bdf8" style="filter: drop-shadow(0 0 6px #06b6d4);">
            <path d="M12 2L5 19l1-1 6-3 6 3 1-1-7-17z" />
          </svg>
        </div>
      </div>
    `;

    const droneIcon = L.divIcon({
      className: "mini-drone-marker",
      html: droneHtml,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    if (!layersRef.current.droneMarker) {
      layersRef.current.droneMarker = L.marker([telemetry.latitude, telemetry.longitude], {
        icon: droneIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      layersRef.current.droneMarker.setLatLng([telemetry.latitude, telemetry.longitude]);
      layersRef.current.droneMarker.setIcon(droneIcon);
    }
  }, [telemetry]);

  // Search Area Polygon & Grid Lines (Clears completely if coordinates empty)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (layersRef.current.searchAreaPolygon) {
      map.removeLayer(layersRef.current.searchAreaPolygon);
      layersRef.current.searchAreaPolygon = null;
    }
    if (layersRef.current.searchWaypointsLine) {
      map.removeLayer(layersRef.current.searchWaypointsLine);
      layersRef.current.searchWaypointsLine = null;
    }
    layersRef.current.searchWaypointDots.forEach((dot) => map.removeLayer(dot));
    layersRef.current.searchWaypointDots = [];

    // While drawing a new perimeter, keep the map unobstructed
    if (mapMode === "DRAW_SEARCH_AREA") {
      return;
    }

    if (searchArea && searchArea.polygonCoordinates && searchArea.polygonCoordinates.length > 2) {
      layersRef.current.searchAreaPolygon = L.polygon(searchArea.polygonCoordinates, {
        color: "#0284c7",
        weight: 2.2,
        opacity: 0.9,
        fillColor: "#0284c7",
        fillOpacity: 0.12,
        dashArray: "4, 4",
      }).addTo(map);

      if (searchArea.waypoints && searchArea.waypoints.length > 1) {
        layersRef.current.searchWaypointsLine = L.polyline(searchArea.waypoints, {
          color: "#38bdf8",
          weight: 2.2,
          opacity: 0.9,
          dashArray: "6, 6",
        }).addTo(map);

        searchArea.waypoints.forEach((wp, idx) => {
          const wpDotHtml = `
            <div style="width: 14px; height: 14px; border-radius: 50%; background: #0369a1; border: 1.5px solid #7dd3fc; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: bold; color: white; transform: translate(-50%, -50%); box-shadow: 0 0 5px rgba(56,189,248,0.7);">
              ${idx + 1}
            </div>
          `;
          const icon = L.divIcon({
            className: "wp-dot-icon",
            html: wpDotHtml,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });
          const marker = L.marker([wp[0], wp[1]], { icon }).addTo(map);
          layersRef.current.searchWaypointDots.push(marker);
        });
      }
    }
  }, [searchArea, mapMode]);

  // Rescuer Path
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (layersRef.current.rescuePathGlow) {
      map.removeLayer(layersRef.current.rescuePathGlow);
      layersRef.current.rescuePathGlow = null;
    }
    if (layersRef.current.rescuePathLine) {
      map.removeLayer(layersRef.current.rescuePathLine);
      layersRef.current.rescuePathLine = null;
    }
    layersRef.current.rescueCheckpoints.forEach((cp) => map.removeLayer(cp));
    layersRef.current.rescueCheckpoints = [];

    if (generatedPath && generatedPath.polyline) {
      layersRef.current.rescuePathGlow = L.polyline(generatedPath.polyline, {
        color: "#10b981",
        weight: 7,
        opacity: 0.35,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      layersRef.current.rescuePathLine = L.polyline(generatedPath.polyline, {
        color: "#34d399",
        weight: 3.5,
        opacity: 1.0,
        dashArray: "8, 6",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      if (generatedPath.waypoints) {
        generatedPath.waypoints.forEach((wp) => {
          const cpHtml = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #059669; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; color: white; box-shadow: 0 0 8px rgba(16,185,129,0.8);">
                ${wp.index}
              </div>
              <div style="position: absolute; top: 16px; background: rgba(15,23,42,0.92); border: 1px solid rgba(52,211,153,0.5); border-radius: 4px; padding: 2px 5px; font-size: 9px; color: #a7f3d0; white-space: nowrap; font-weight: 500;">
                ${wp.name}
              </div>
            </div>
          `;
          const icon = L.divIcon({
            className: "mini-cp-marker",
            html: cpHtml,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          const marker = L.marker([wp.latitude, wp.longitude], { icon }).addTo(map);
          layersRef.current.rescueCheckpoints.push(marker);
        });
      }
    }
  }, [generatedPath]);

  // Survivor / Ingested Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    layersRef.current.survivorMarkers.forEach((m) => map.removeLayer(m));
    layersRef.current.survivorMarkers = [];

    survivors.forEach((surv) => {
      const isSelected = selectedSurvivor?.id === surv.id;
      const color = surv.triageLevel === "CRITICAL" ? "#f43f5e" : "#f59e0b";

      const markerHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer; transform: translate(-50%, -50%);">
          <div style="position: absolute; width: ${isSelected ? "26px" : "18px"}; height: ${isSelected ? "26px" : "18px"}; border-radius: 50%; background: ${color}30; border: 1.5px solid ${color};"></div>
          <div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; box-shadow: 0 0 8px ${color}; border: 2px solid #ffffff;"></div>
          <div style="position: absolute; top: 14px; background: rgba(15,23,42,0.92); border: 1px solid ${color}80; border-radius: 4px; padding: 1px 6px; font-size: 9px; color: ${color}; white-space: nowrap; font-weight: bold;">
            ${surv.label || "Target"}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: "mini-survivor-marker",
        html: markerHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([surv.latitude, surv.longitude], {
        icon,
        zIndexOffset: isSelected ? 900 : 500,
      }).addTo(map);

      marker.on("click", () => {
        onSelectSurvivor(surv);
      });

      layersRef.current.survivorMarkers.push(marker);
    });
  }, [survivors, selectedSurvivor]);

  // Rescue Team Units
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    layersRef.current.teamMarkers.forEach((m) => map.removeLayer(m));
    layersRef.current.teamMarkers = [];

    rescueTeams.forEach((team) => {
      const isBase = team.type === "BASE_CAMP";
      const teamHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
          <div style="width: 18px; height: 18px; border-radius: 4px; background: ${isBase ? "#f59e0b" : "#38bdf8"}; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; color: black; box-shadow: 0 0 8px rgba(0,0,0,0.6);">
            ${isBase ? "HQ" : "🚑"}
          </div>
          <div style="position: absolute; top: 16px; background: rgba(15,23,42,0.9); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 1px 5px; font-size: 8px; color: #e2e8f0; white-space: nowrap;">
            ${team.name}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: "mini-team-marker",
        html: teamHtml,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([team.latitude, team.longitude], { icon }).addTo(map);
      layersRef.current.teamMarkers.push(marker);
    });
  }, [rescueTeams]);

  // Live Drawing Overlay (Pins & Connecting Line)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    layersRef.current.tempDrawLayers.forEach((layer) => map.removeLayer(layer));
    layersRef.current.tempDrawLayers = [];

    if (temporaryPolygonVertices && temporaryPolygonVertices.length > 0) {
      if (temporaryPolygonVertices.length > 1) {
        const polyline = L.polyline(temporaryPolygonVertices, {
          color: "#06b6d4",
          weight: 2.5,
          dashArray: "5, 5",
          interactive: false,
        }).addTo(map);
        layersRef.current.tempDrawLayers.push(polyline);
      }

      if (temporaryPolygonVertices.length >= 3) {
        const tempPoly = L.polygon(temporaryPolygonVertices, {
          color: "#06b6d4",
          weight: 1.5,
          fillColor: "#06b6d4",
          fillOpacity: 0.12,
          dashArray: "4, 4",
          interactive: false,
        }).addTo(map);
        layersRef.current.tempDrawLayers.push(tempPoly);
      }

      temporaryPolygonVertices.forEach((coord, idx) => {
        const pinHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); pointer-events: none;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #06b6d4; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: black; box-shadow: 0 0 10px #06b6d4;">
              ${idx + 1}
            </div>
          </div>
        `;
        const icon = L.divIcon({
          className: "temp-vertex-pin",
          html: pinHtml,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        const marker = L.marker(coord, { icon, zIndexOffset: 2000, interactive: false }).addTo(map);
        layersRef.current.tempDrawLayers.push(marker);
      });
    }
  }, [temporaryPolygonVertices]);

  // Center on Drone Location
  const handleCenterDrone = () => {
    if (mapRef.current) {
      mapRef.current.setView([23.420528, 85.434533], 18, { animate: true });
    }
  };

  return (
    <div
      className={`relative w-full h-full ${
        mapStyle === "SATELLITE"
          ? "map-tiles-satellite"
          : mapStyle === "DARK"
          ? "map-tiles-dark"
          : "map-tiles-standard"
      } ${
        mapMode === "PICK_SIGHTING_LOCATION" || mapMode === "DRAW_SEARCH_AREA"
          ? "drawing-active cursor-crosshair"
          : ""
      }`}
    >
      {/* Fixed Leaflet container element: never overwritten by React className reconciliation */}
      <div
        ref={mapContainerRef}
        id="tactical-leaflet-map"
        style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
      />

      {/* Floating Basemap Style Switcher (Top Center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-1 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full p-1 text-[11px] shadow-lg">
        <button
          onClick={() => setMapStyle("SATELLITE")}
          className={`px-3 py-1 rounded-full transition font-medium ${
            mapStyle === "SATELLITE" ? "bg-white/20 text-white shadow-xs" : "text-slate-400 hover:text-white"
          }`}
        >
          Campus Satellite
        </button>
        <button
          onClick={() => setMapStyle("DARK")}
          className={`px-3 py-1 rounded-full transition font-medium ${
            mapStyle === "DARK" ? "bg-white/20 text-white shadow-xs" : "text-slate-400 hover:text-white"
          }`}
        >
          Tactical Dark
        </button>
        <button
          onClick={() => setMapStyle("LIGHT")}
          className={`px-3 py-1 rounded-full transition font-medium ${
            mapStyle === "LIGHT" ? "bg-white/20 text-white shadow-xs" : "text-slate-400 hover:text-white"
          }`}
        >
          Street View
        </button>
        <button
          onClick={handleCenterDrone}
          className="p-1 rounded-full text-slate-400 hover:text-cyan-300 ml-1 hover:bg-white/10"
          title="Center on Zypher"
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Drawing Mode Action Banner with Reset/Clear Points */}
      {mapMode === "DRAW_SEARCH_AREA" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 text-cyan-200 px-4 py-2 rounded-2xl text-xs shadow-2xl flex items-center gap-3">
          <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>
            Click on map to place perimeter points ({temporaryPolygonVertices.length}/4 corners)
          </span>

          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            {temporaryPolygonVertices.length >= 3 && (
              <button
                onClick={onFinishDrawing}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Finish</span>
              </button>
            )}
            {temporaryPolygonVertices.length > 0 && (
              <button
                onClick={onClearTemporaryPoints}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-amber-300 text-[11px] flex items-center gap-1 transition cursor-pointer"
                title="Clear clicked points and restart from Point 1"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Reset</span>
              </button>
            )}
            <button
              onClick={onCancelDrawing}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-[11px] flex items-center gap-1 transition cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Picking Sighting Location Mode Banner */}
      {mapMode === "PICK_SIGHTING_LOCATION" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 text-cyan-200 px-4 py-2 rounded-2xl text-xs shadow-2xl flex items-center gap-2 animate-pulse">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span>Click anywhere on map to pinpoint target coordinates</span>
        </div>
      )}
    </div>
  );
}
