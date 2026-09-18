# ☀ Window-Side Navigator

> **Catch the shade. Skip the glare.**

Sit on the shady side of your bus or car by matching your route to the sun's path using astronomical sun geometry and real-time geographic road routing.

---

## 📖 Overview

When traveling long distances by vehicle, sitting in direct sunlight can cause discomfort, heat, and glare. **Window-Side Navigator** calculates the astronomical position of the Sun (azimuth and altitude) relative to your vehicle's heading along a driving route. It determines whether the **LEFT** or **RIGHT** side of the vehicle will receive direct sunlight throughout your trip, or if **"Any seat will do"** during nighttime journeys.

---

## ✨ Features

- 📍 **Real Location Search**: Debounced autocomplete backed by OpenStreetMap Nominatim.
- 🚗 **OSRM Driving Geometry**: Real road polyline routing and distance/duration estimations.
- ☀️ **Astronomical Precision**: Sun position calculated dynamically along the route using `SunCalc`.
- 🧭 **Heading Bearing Calculations**: Geographic bearing angles computed between consecutive route segments.
- 🌙 **Night Detection**: Detects when Sun altitude is below the horizon and recommends *"Any seat will do"*.
- 📊 **Overall Recommendation**: Time-weighted shade aggregation across all sampled route points.
- 🗺️ **Interactive Leaflet Map**: Dynamic client-rendered map displaying start, destination, polyline, and sampled sun positions.
- ⏳ **Journey Timeline**: Vertical expandable timeline showing min-by-min sun direction and shade side.
- 🛣️ **Route Bends Classification**: Route curvature analysis (*Straight*, *Mostly straight*, or *Curvy*).

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 14 (React, TypeScript)
- **Styling**: Tailwind CSS (Modern minimalist design system)
- **Mapping**: Leaflet & React Leaflet (OpenStreetMap tiles)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express (TypeScript)
- **Calculations**: `SunCalc` (astronomical sun coordinates)
- **HTTP Client**: Axios
- **Testing**: Jest & TS-Jest

### External Open APIs
- **Geocoding**: OpenStreetMap Nominatim
- **Routing**: Open Source Routing Machine (OSRM)

---

## 📐 Shade Calculation Algorithm

1. **Route Sampling**: Route geometry coordinates from OSRM are sampled at regular intervals (~1–2 km or ~3–5 min).
2. **Vehicle Bearing**: Bearing $\theta_{vehicle}$ calculated from $(lat_1, lng_1)$ to $(lat_2, lng_2)$ normalized to $0^\circ \text{ (North)} - 360^\circ$.
3. **Sun Position**: `SunCalc` computes Sun azimuth $\theta_{sun}$ and altitude $\phi_{sun}$.
   $$\theta_{sun\_geo} = (\text{azimuth}_{suncalc} \times \frac{180}{\pi} + 180) \bmod 360$$
4. **Night Detection**: If $\phi_{sun} \le 0^\circ$, classified as **Night Journey** $\rightarrow$ `"Any seat will do"`.
5. **Sun Side Classification**: Relative angle $\Delta = \theta_{sun\_geo} - \theta_{vehicle}$ normalized to $[-180^\circ, +180^\circ]$:
   - $-45^\circ \le \Delta \le +45^\circ \rightarrow$ **FRONT**
   - $+45^\circ < \Delta < +135^\circ \rightarrow$ **RIGHT** (Shade $\rightarrow$ **LEFT**)
   - $\Delta \ge +135^\circ \text{ or } \Delta \le -135^\circ \rightarrow$ **BACK**
   - $-135^\circ < \Delta < -45^\circ \rightarrow$ **LEFT** (Shade $\rightarrow$ **RIGHT**)
6. **Time-Weighted Aggregation**: Aggregates samples along the journey duration to select the optimal overall side.

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ and npm

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend will start at `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will start at `http://localhost:3000`.

---

## 🧪 Testing

Run backend unit tests for sun math, night detection, and shade logic:

```bash
cd backend
npm test
```

---

## ⚠️ Limitations & Disclaimer

This application is based strictly on astronomical sun geometry and geographic route bearings. It does **NOT** calculate physical shadows created by buildings, trees, mountains, cloud cover, or vehicle structural pillars.

---

## 📜 Legal & Attribution

- Map Data & Nominatim Geocoding © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- Routing powered by [OSRM](http://project-osrm.org/).
- Sun calculations powered by [SunCalc](https://github.com/mourner/suncalc).
