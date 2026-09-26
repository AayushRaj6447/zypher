# ZEPHYR-01 Ground Control Station (GCS)
### Search & Rescue Autonomous Drone Tactical Station

**Zephyr GCS** is a modern, high-precision Ground Control Station interface designed for Search and Rescue (SAR) drone operations. Built with React and Vite, it delivers live avionics telemetry, interactive satellite & tactical GIS mapping, autonomous search grid definition, survivor detection intelligence with optical & thermal sensor imagery, and terrain-aware rescue path generation for ground and air rescue teams.

---

## 🚀 Key Features

### 1. 🗺️ Interactive Tactical GIS Map
- **Multi-layer Basemaps**: Seamlessly switch between **Tactical Dark**, **Satellite World Imagery**, and **Topographic** elevation layers.
- **Live Drone Tracking**: Real-time position, altitude AGL tag, heading directional arrow, and flight breadcrumb trails.
- **Survivor Sighting Beacons**: Real-time triage markers with pulsing priority rings (Critical 🔴, Serious 🟡, Stable 🔵, Rescued 🟢).
- **Rescue Team Units**: Live GPS locations for Command Base Camp, Ground Rescue Team Alpha, and ATV Mountain Team Bravo.
- **Visual Rescue Path Overlay**: Glowing animated tactical line with numbered terrain checkpoints navigating around theoretical environmental hazards.

### 2. 📐 Autonomous Search Area Planner
- **Interactive Boundary Definition**: Click vertices directly on the tactical map or configure bounding boundaries.
- **Search Patterns**:
  - Parallel Lawnmower Sweep
  - Creeping Line Ahead
  - Expanding Square Pattern
  - Radial Sector Scan
- **Configurable Flight Parameters**: Altitude (AGL), Sweep Spacing (swath width), and Flight Speed.
- **Live Projections**: Auto-calculates total square kilometers, sweep waypoints count, estimated flight duration, and battery drain.
- **Direct Upload**: One-click upload to deploy autonomous search grids to Zephyr-01.

### 3. 📡 Live Avionics & Flight Instruments HUD
- **Artificial Horizon (ADI)**: Canvas-rendered Attitude Director Indicator showing real-time pitch ladder, bank angle arc, and aircraft reticle.
- **Airspeed & Altitude Tapes**: Ground speed (m/s & km/h) and altitude (AGL & MSL).
- **Compass Ribbon**: 360° heading rose with cardinal directions and vertical speed indicator.
- **Gimbal Sensor Stream**: Dual-mode camera preview with **4K Optical Zoom** and **LWIR Thermal FLIR**, crosshair reticle, target tracking box, and zoom controls.
- **Subsystem Telemetry**: 6S LiPo power pack state of charge, voltage, current draw, cell temperature, 3D RTK GNSS fix (22 satellites), and 5.8 GHz datalink signal strength (-58 dBm).

### 4. 📸 Survivor Detection Intelligence & Frontend Sighting Ingestion
- **Sighting Photo & Video Capture**: View optical photos or thermal infrared views with AI confidence scoring.
- **Frontend Sighting Ingestion ("Feed Sighting")**:
  - Drag-and-drop or select any local image file from your computer (with instant preview).
  - Pinpoint GPS coordinates directly by clicking on the tactical map or typing lat/lon.
  - Configure triage level (Critical, Serious, Stable).
  - Input detailed **Nature & Environmental Conditions**:
    - Terrain classification (e.g. Scree Ravine, River Plain, Fir Canopy).
    - Slope gradient & ground stability.
    - Water and flood hazards.
    - Micro-weather (wind, ambient temp).
    - Accessibility rating & recommended rescue gear.
  - Saves directly to the live tactical feed and persists in browser local storage.

### 5. 🧭 Terrain-Aware Path Generation for Rescuers
- Computes intelligent ground and vehicle rescue routes from selected rescue units (Team Alpha, Team Bravo, Base Camp) to detected survivors.
- Accounts for environmental conditions:
  - Navigates around steep cliffs, deep torrents, and dense deadfall.
  - Computes direct distance vs terrain winding route distance.
  - Estimates transit time for **Foot Patrol** vs **All-Terrain Vehicle (ATV)** vs **Aerial Winch Hoist**.
  - Provides step-by-step tactical terrain checkpoints with elevation profiles.
  - One-click dispatch action to transmit route telemetry to field radios and ATAK devices.

---

## 🛠️ Running the Application

The development server is running locally:
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

To create a production build:
```bash
npm run build
```
