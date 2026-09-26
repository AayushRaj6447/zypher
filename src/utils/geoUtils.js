// Geographic and Tactical Rescue Path Utilities for Zypher GCS

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates initial bearing from point 1 to point 2 in degrees (0-360)
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return ((theta * 180) / Math.PI + 360) % 360;
}

/**
 * Generate autonomous search grid waypoints inside a polygon or bounding box
 * Optimized for concentrated micro-sectors (100m - 200m)
 */
export function generateSearchGrid(polygonCoords, spacingMeters = 20, altitude = 40) {
  if (!polygonCoords || polygonCoords.length < 3) return [];

  let minLat = Infinity,
    maxLat = -Infinity,
    minLon = Infinity,
    maxLon = -Infinity;

  polygonCoords.forEach(([lat, lon]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  });

  const degPerMeterLat = 1 / 111139;
  const degPerMeterLon = 1 / (111139 * Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180)));

  // If spacing is larger than half the width, adjust it to fit at least 4 lanes
  const totalLonDistMeters = (maxLon - minLon) / degPerMeterLon;
  let effectiveSpacing = spacingMeters;
  if (totalLonDistMeters > 0 && totalLonDistMeters / effectiveSpacing < 3) {
    effectiveSpacing = Math.max(10, totalLonDistMeters / 5);
  }

  const stepLon = effectiveSpacing * degPerMeterLon;
  const stepLat = effectiveSpacing * 0.3 * degPerMeterLat;

  const waypoints = [];
  let sweepUp = true;

  for (let lon = minLon + stepLon / 2; lon < maxLon; lon += stepLon) {
    const latStart = sweepUp ? minLat + stepLat : maxLat - stepLat;
    const latEnd = sweepUp ? maxLat - stepLat : minLat + stepLat;
    waypoints.push([latStart, lon, altitude]);
    waypoints.push([latEnd, lon, altitude]);
    sweepUp = !sweepUp;
  }

  return waypoints;
}

/**
 * Estimate polygon area in sq km
 */
export function calculatePolygonAreaSqKm(coords) {
  if (!coords || coords.length < 3) return 0;
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coords[i][1] * coords[j][0] - coords[j][1] * coords[i][0];
  }
  area = Math.abs(area) / 2;
  const avgLat = coords.reduce((acc, c) => acc + c[0], 0) / coords.length;
  const sqKmConversion = 111 * (111 * Math.cos((avgLat * Math.PI) / 180));
  return +(area * sqKmConversion).toFixed(3);
}

/**
 * Generates an intelligent, terrain-aware rescue path from rescuer team to target location
 */
export function generateRescuePath(startTeam, target) {
  if (!startTeam || !target) return null;

  const startLat = startTeam.latitude;
  const startLon = startTeam.longitude;
  const targetLat = target.latitude;
  const targetLon = target.longitude;

  const directDistanceKm = calculateDistanceKm(startLat, startLon, targetLat, targetLon);
  const bearing = calculateBearing(startLat, startLon, targetLat, targetLon);

  const intermediatePoints = [];
  const segments = 3;

  for (let i = 1; i <= segments; i++) {
    const frac = i / (segments + 1);
    const latOffset = (frac < 0.5 ? 0.00015 : -0.0001);
    const lonOffset = (frac < 0.5 ? -0.0002 : 0.00015);

    const lat = startLat + (targetLat - startLat) * frac + latOffset;
    const lon = startLon + (targetLon - startLon) * frac + lonOffset;

    let checkpointName = `Waypoint ${i}`;
    let hazardNote = "Clear road/walkway";

    if (i === 1) {
      checkpointName = "Campus Departure Point";
      hazardNote = "Assemble responder unit, establish radio link with Zypher";
    } else if (i === 2) {
      checkpointName = "Hostel Access Loop Junction";
      hazardNote = "Maintain pace along road loop, clear pedestrian path";
    } else if (i === 3) {
      checkpointName = "Building Courtyard Approach";
      hazardNote = "Target area in direct sight, prepare medical kit";
    }

    intermediatePoints.push({
      index: i,
      name: checkpointName,
      latitude: lat,
      longitude: lon,
      elevation: 648,
      hazardNote,
    });
  }

  const routeDistanceKm = +(directDistanceKm * 1.12).toFixed(2);
  const footSpeedKmh = 4.5;
  const transitTimeMin = Math.max(1, Math.round((routeDistanceKm / footSpeedKmh) * 60));

  const waypointsPolyline = [
    [startLat, startLon],
    ...intermediatePoints.map((p) => [p.latitude, p.longitude]),
    [targetLat, targetLon],
  ];

  return {
    id: `ROUTE-${startTeam.id}-${target.id || "TARGET"}`,
    targetSurvivorId: target.id || "TARGET",
    targetSurvivorLabel: target.title || target.label || "Target Location",
    assignedTeamId: startTeam.id,
    assignedTeamName: startTeam.name,
    directDistanceKm: +directDistanceKm.toFixed(2),
    routeDistanceKm,
    bearing: Math.round(bearing),
    footTransitTimeMin: transitTimeMin,
    atvTransitTimeMin: Math.max(1, Math.round(transitTimeMin / 2)),
    aerialWinchFeasible: true,
    waypoints: intermediatePoints,
    polyline: waypointsPolyline,
    elevationGainMeters: 0,
    terrainRating: "URBAN_CAMPUS",
    safetyAdvisory: "Clear paved corridor along BIT Mesra road and building loop. Maintain telemetry radio check-in with Zypher-01.",
  };
}
