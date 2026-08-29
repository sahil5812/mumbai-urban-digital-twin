# Mumbai Urban Infrastructure Digital Twin (PS010)
### Integrated Road Failure, Drainage & Flood Risk Prediction Engine

> **Smart India Hackathon (SIH) — Smart Cities (Software Category PS010)**  
> Built for **Brihanmumbai Municipal Corporation (BMC / MCGM)** Disaster Management Unit & Public Works Department.

---

## 🏙️ 1. Problem Context: The Interconnected Failure Chain

During the Mumbai monsoon, road deterioration, drainage chokes, heavy rainfall, high tides, waterlogging, and traffic paralysis do not happen in isolation. They form a **cascading chain reaction**:

$$\text{Road Degradation} \longrightarrow \text{Potholes} \longrightarrow \text{Drain Blockage} \longrightarrow \text{Water Accumulation} \longrightarrow \text{Flooding} \longrightarrow \text{Traffic Gridlock}$$

Instead of isolated dashboards, **PS010 implements a complete, city-scale Digital Twin** that simulates this entire domino effect in real-time.

---

## 🧠 2. Scientific & Research Foundation

Our Digital Twin is directly engineered upon **8 peer-reviewed research papers and municipal studies**:

1. **IIT Bombay Mithi River Study** (*Karmakar et al., 2021*): 3-way linked hydrodynamic physics coupling 22 stormwater drains with Arabian Sea tidal lockouts ($>4.2\text{ m}$).
2. **Mumbai Flood Susceptibility Framework** (*Joglekar, Jan 2026*): Formulates $\text{FSI} = \frac{1}{3}(R + T + L)$ combining IMD rainfall ($R$), DEM elevation ($T$), and impervious land cover ($L$).
3. **Sentinel-1 SAR Satellite Ground Truth** (*MDPI Earth, May 2026*): Empirical multi-year flood inundations across all 24 BMC wards (2018–2025) validated against BMC disaster portal.
4. **Digital Twin Systematic Review** (*MDPI Remote Sensing, 2025*): 4-Tier standard architecture (Ingestion $\rightarrow$ Fusion $\rightarrow$ AI/Physics Core $\rightarrow$ Municipal Command Center).
5. **Physics-Informed GNNs & Geospatial Twins** (*DUALFloodGNN & FlowsDT, arXiv 2025/2026*): Graph-based failure propagation.

---

## 🎯 3. The Official SIH Prioritization Formula

The system automatically ranks municipal interventions using the official multi-criteria equation:

$$\text{Priority Score} = P(\text{Failure}) \times \text{Impact} \times \text{Population Exposure} \times \text{Traffic Exposure} \times \text{Repair Cost Factor} \times \text{Urgency}$$

---

## 🚀 4. Quick Start & Execution

### Option A: One-Click Launch (Windows)
Double-click `start.bat` in the project root.

### Option B: Manual Terminal Launch

#### Step 1: Start FastAPI Backend
```bash
cd backend
python run.py
# Backend live at http://localhost:8000
# Interactive API Docs at http://localhost:8000/docs
```

#### Step 2: Start Next.js Command Center
```bash
cd frontend
npm run dev
# Dashboard live at http://localhost:3000
```

---

## 🎮 5. 2-Minute Judge Walkthrough Script

1. **Open http://localhost:3000**: Point out the **Tactical Dark Command Center** and real Mumbai GIS map.
2. **Move the "What-If" Sliders**: Increase rainfall to **180 mm/hr** and tide to **4.6 m** $\rightarrow$ Show the map dynamically turn red at Hindmata, Milan Subway, and Kurla.
3. **Click on Hindmata Junction**: Open the **Component Telemetry Drawer** to inspect the Health Score ($42\%$), Water Depth ($38\text{ cm}$), and auto-generated BMC Work Order.
4. **Switch to Cascading Graph Tab**: Trace the ripple effect from Dadar pothole $\rightarrow$ Drain choke $\rightarrow$ Submergence $\rightarrow$ Western Express Highway traffic delay.
5. **Inspect Priority Dispatch Matrix**: Demonstrate how the SIH formula prioritizes arterial links over minor lanes.
6. **Click "Report Pothole / Flood"**: Submit a simulated citizen report and show instant ticket ingestion into the Digital Twin.

---

## 📁 6. Repository Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint with CORS
│   │   ├── models/
│   │   │   ├── schemas.py              # Pydantic data models
│   │   │   ├── road_model.py           # Road degradation & pothole predictor
│   │   │   ├── drainage_model.py       # Manning's equation & tidal lockout model
│   │   │   ├── flood_model.py          # Topographic flood depth accumulator
│   │   │   ├── graph_engine.py         # NetworkX cascading failure engine
│   │   │   └── priority_engine.py      # Official SIH prioritization optimizer
│   │   ├── routers/
│   │   │   ├── simulation.py           # Real-time What-If scenario API
│   │   │   ├── graph_routes.py         # Cascading topology API
│   │   │   └── citizen_reports.py      # Citizen grievance ingestion API
│   │   └── data/
│   │       └── mumbai_data_loader.py   # Mumbai infrastructure network
│   ├── requirements.txt
│   └── run.py
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                # Unified Command Center Dashboard
│   │   │   └── globals.css             # Dark tactical stylesheet
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Top telemetry header & 2D/3D switcher
│   │   │   ├── MapView.tsx             # Interactive Leaflet / 3D GIS Map
│   │   │   ├── ScenarioControls.tsx    # What-If simulation slider deck
│   │   │   ├── ComponentInspector.tsx  # Slide-out telemetry & work-order drawer
│   │   │   ├── CascadingGraphView.tsx  # Domino failure graph explorer
│   │   │   ├── PriorityMatrix.tsx      # Ranked SIH intervention table
│   │   │   └── CitizenReportModal.tsx  # Crowdsourced grievance ingestion
│   │   └── lib/
│   │       ├── api.ts                  # API client with fallback simulation
│   │       └── types.ts                # TypeScript entity interfaces
│   └── package.json
│
├── dataset/                            # 10 modules (75,000+ records)
├── research paper/                     # 8 peer-reviewed research papers
└── start.bat                           # 1-Click launcher
```
