# Doppler Weather Radar & Precipitation Nowcasting Research Papers Archive

This directory houses core academic research papers, mathematical formulations, and deep learning architectures for **Doppler Weather Radar (DWR) data ingestion, Quantitative Precipitation Estimation (QPE), and 10–90 minute hyperlocal urban flood nowcasting**, with a specific focus on **Greater Mumbai and Thane**.

---

## 1. Archived Research Papers (PDFs)

### A. Mumbai Flagship Research (IIT Bombay & IMD Colaba)
* **File:** [`IIT_Bombay_IMD_Colaba_Mumbai_Radar_Nowcasting_2026.pdf`](./IIT_Bombay_IMD_Colaba_Mumbai_Radar_Nowcasting_2026.pdf)
* **Title:** *Physics-Based Deep Spatiotemporal Hyperlocal Radar Nowcasting with a Multi-Variable U-Net for High-Resolution Precipitation Forecasting*
* **Authors:** Akshay Sunil, Muhammed Rashid, Raja Sekhar Sivaraju, Sushma Nair (Regional Meteorological Centre, IMD Colaba Mumbai), Prof. Subimal Ghosh (Centre for Climate Studies, IIT Bombay)
* **Identifier:** arXiv:2607.16080 (Published July 2026)
* **Core Application:**
  - Uses live 3D volumetric radar data from **IMD Colaba (S-Band DWR)** and **Veravali, Andheri (X-Band DWR)**.
  - Multi-elevation angles and multi-variable radar inputs ($Z$ Reflectivity, $V$ Radial Velocity, $W$ Spectrum Width).
  - 10 to 90 minutes lead-time nowcasting deployed on `mumbaiflood.in` for Mumbai disaster management.

### B. Deep Generative Radar Nowcasting (Google DeepMind & UK Met Office)
* **File:** [`DeepMind_DGMR_Precipitation_Nowcasting_Nature.pdf`](./DeepMind_DGMR_Precipitation_Nowcasting_Nature.pdf)
* **Title:** *Skilful precipitation nowcasting using deep generative models of radar*
* **Authors:** Suman Ravuri, Shakir Mohamed, Matthew Willson et al. (*Nature*, 2021)
* **Identifier:** arXiv:2104.00954 / Nature Vol 597, 672–677
* **Core Application:**
  - Establishes the Deep Generative Model of Rain (DGMR).
  - Solves the problem of spatial blurriness in deep learning nowcasts; accurately models convective cell initiation and localized cloudbursts.

### C. Large-Scale Neural Weather Radar (Google Research)
* **File:** [`Google_MetNet3_Radar_Satellite_Nowcasting.pdf`](./Google_MetNet3_Radar_Satellite_Nowcasting.pdf)
* **Title:** *MetNet-3: A High-Resolution Neural Weather Model for Radar and Satellite Nowcasting*
* **Authors:** Andry Biemont, Casper Sonderby et al. (Google Research, 2023)
* **Identifier:** arXiv:2306.06079
* **Core Application:**
  - Operates on 2-minute cadence radar mosaics at 1km spatial resolution.
  - Generates seamless precipitation forecasts from 0 to 24 hours.

### D. Foundational Spatiotemporal Convolutional LSTM
* **File:** [`ConvLSTM_Precipitation_Nowcasting_NIPS.pdf`](./ConvLSTM_Precipitation_Nowcasting_NIPS.pdf)
* **Title:** *Convolutional LSTM Network: A Machine Learning Approach for Precipitation Nowcasting*
* **Authors:** Xingjian Shi, Zhourong Chen, Hao Wang et al. (NeurIPS, 2015)
* **Identifier:** arXiv:1506.04214
* **Core Application:**
  - Landmark formulation extending FC-LSTM to have convolutional structures in both input-to-state and state-to-state transitions.
  - Foundational baseline for converting sequential radar reflectivity frames into rain motion vectors.

---

## 2. Core Mathematical Formulation: Radar Reflectivity to Rain Rate

Doppler Weather Radars measure radar reflectivity factor $Z$ (in $\text{mm}^6/\text{m}^3$), recorded logarithmically as $\text{dBZ}$:

$$\text{dBZ} = 10 \log_{10}(Z)$$

The standard **Marshall-Palmer Z-R Empirical Power Law** converts reflectivity $Z$ into instantaneous surface rainfall rate $R$ (in $\text{mm/hr}$):

$$Z = a \cdot R^b \quad \implies \quad Z = 200 \cdot R^{1.6}$$

Inverting for Rain Rate $R$:

$$R = \left(\frac{10^{\frac{\text{dBZ}}{10}}}{200}\right)^{\frac{1}{1.6}} = \left(\frac{10^{\frac{\text{dBZ}}{10}}}{200}\right)^{0.625}$$

### Operational Severity Thresholds for Mumbai:
* **$\text{dBZ} < 20$**: Trace / Light Drizzle ($< 1\text{ mm/h}$) $\to$ **SAFE / Baseline**
* **$20 \le \text{dBZ} < 35$**: Light to Moderate Monsoon Rain ($1 - 15\text{ mm/h}$) $\to$ **NORMAL (Cyan Ripple)**
* **$35 \le \text{dBZ} < 45$**: Heavy Downpour ($15 - 40\text{ mm/h}$) $\to$ **AMBER ALERT (Warning Wave)**
* **$\text{dBZ} \ge 45$**: Severe Cloudburst / Convective Cell ($> 40\text{ mm/h}$) $\to$ **CRITICAL HAZARD (Dangerous Red Beacon)**

---

## 3. Real-Time Radar Ingestion Endpoints

1. **RainViewer Global Open Doppler Radar API**:
   - Manifest: `https://api.rainviewer.com/public/weather-maps.json`
   - Tile URL: `https://tilecache.rainviewer.com/v2/radar/{timestamp}/256/{z}/{x}/{y}/2/1_1.png`
2. **IMD Official API Gateway**:
   - Management Portal: `https://api.imd.gov.in/`
   - Data Supply Portal: `https://dsp.imdpune.gov.in/` (Level-II volumetric NEXRAD/HDF5 radar sweeps)
