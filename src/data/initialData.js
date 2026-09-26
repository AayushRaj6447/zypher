// Tactical Operation Data for Zypher Search & Rescue Drone
// Concentrated Area: BIT Mesra Campus (Coordinates: 23.420528, 85.434533)

export const INITIAL_DRONE_TELEMETRY = {
  droneId: "ZYPHER-SR-01",
  callsign: "ZYPHER ONE",
  status: "STANDBY",
  flightMode: "MANUAL_HOLD",
  latitude: 23.420528,
  longitude: 85.434533,
  altitudeAgl: 0.0,
  altitudeMsl: 648.0,
  groundSpeed: 0.0,
  verticalSpeed: 0.0,
  heading: 28,
  pitch: 0.0,
  roll: 0.0,
  yaw: 28,
  battery: {
    percentage: 96,
    voltage: 25.1,
    currentDraw: 1.4,
    temperature: 24.5,
    estimatedRemainingMin: 48,
  },
  gps: {
    fixType: "3D_RTK_FIX",
    satellitesCount: 24,
    hdop: 0.62,
    vdop: 0.74,
    lat: 23.420528,
    lon: 85.434533,
  },
  comms: {
    signalStrengthDbm: -48,
    linkQuality: 100.0,
    frequencyGhz: 5.8,
    latencyMs: 12,
    uplinkRateKbps: 520,
    downlinkRateMbps: 48.0,
  },
  sensors: {
    thermalFlir: "ONLINE",
    opticalZoom4k: "ONLINE",
    lidarAltimeter: "LOCKED",
    collisionAvoidance: "ACTIVE",
    payloadWinch: "READY",
  },
};

export const RESCUE_TEAMS = [
  {
    id: "TEAM-ALPHA",
    name: "Ground Rescue Team Alpha",
    type: "RAPID_RESPONSE_FOOT",
    callsign: "Vanguard Alpha",
    latitude: 23.4185,
    longitude: 85.4332,
    members: 4,
    lead: "Team Lead",
    equipment: ["First Aid Trauma Kit", "Stretcher Rig", "Thermal Imager", "VHF Transceiver"],
    status: "STANDBY_DEPLOY",
    color: "#38bdf8",
  },
  {
    id: "COMMAND-POST",
    name: "Campus Incident Command Post",
    type: "BASE_CAMP",
    callsign: "Base HQ",
    latitude: 23.4170,
    longitude: 85.4320,
    members: 8,
    lead: "Incident Commander",
    equipment: ["Mobile Command Rig", "Medical Staging", "Satellite Terminal"],
    status: "BASE_ACTIVE",
    color: "#f59e0b",
  },
];

// Concentrated micro-search area directly over the satellite photo cluster
export const INITIAL_SEARCH_AREA = {
  id: "AREA-SECTOR-MESRA-CLUSTER",
  name: "Campus Cluster Sector (Photo Focus)",
  active: true,
  pattern: "PARALLEL_SWEEP",
  altitudeAgl: 35,
  sweepSpacing: 20, // 20-meter fine sweeps across building & courtyard
  droneSpeed: 8,
  polygonCoordinates: [
    [23.41960, 85.43370],
    [23.42140, 85.43370],
    [23.42140, 85.43530],
    [23.41960, 85.43530],
  ],
  areaSqKm: 0.035, // ~3.5 hectares
  perimeterKm: 0.76,
  estimatedFlightTimeMin: 6,
  coveragePercentage: 100.0,
  waypoints: [
    [23.41975, 85.43390, 35],
    [23.42125, 85.43390, 35],
    [23.42125, 85.43425, 35],
    [23.41975, 85.43425, 35],
    [23.41975, 85.43460, 35],
    [23.42125, 85.43460, 35],
    [23.42125, 85.43495, 35],
    [23.41975, 85.43495, 35],
  ],
};

// Initial aerial detection feed with the onboard camera photos
export const INITIAL_CAPTURED_DETECTIONS = [
  {
    id: "DET-SAR-01",
    title: "Campus Courtyard · Sighting 01",
    type: "PERSONS",
    tag: "2 PERSONS + FLOODING",
    photoUrl: "/aerial_sighting_courtyard.jpg",
    latitude: 23.42065,
    longitude: 85.43445,
    altitude: 32.0,
    capturedAt: "10:14:18",
    natureCondition: "Waterlogged Courtyard · Asphalt Road Clear",
    hazardNotes: "AI detected 2 persons (conf: 0.87, 0.84) and flooded turf (conf: 0.81). Main access road dry for foot rescue team approach.",
  },
  {
    id: "DET-SAR-02",
    title: "Roadway North · Sighting 02",
    type: "PERSONS",
    tag: "2 PERSONS + FLOODING",
    photoUrl: "/aerial_sighting_roadway.jpg",
    latitude: 23.42085,
    longitude: 85.43438,
    altitude: 28.0,
    capturedAt: "10:16:05",
    natureCondition: "Submerged Turf Adjacent to Paved Roadway",
    hazardNotes: "AI detected 2 persons on paved road (conf: 0.91, 0.87) and submerged ground (conf: 0.83). Direct paved route to Vanguard Alpha.",
  },
];
