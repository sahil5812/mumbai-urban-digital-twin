// Typed Internationalization (i18n) Dictionary for RaiNova
// Supported Languages: English (en), Hindi (hi), Marathi (mr)

export type Language = 'en' | 'hi' | 'mr';

export interface Translations {
  // Navigation & Header
  weatherPortal: string;
  twinMap: string;
  liveTelemetryOn: string;
  simulationMode: string;
  realtimeBadge: string;
  rainMetric: string;
  tideMetric: string;
  humidityMetric: string;
  windMetric: string;
  healthMetric: string;
  viewToggle: string;
  citizenReportBtn: string;

  // SubNavbar Tabs
  tabToday: string;
  tabHourly: string;
  tab10Day: string;
  tabRadar: string;
  tabMinuteCast: string;
  badgeLive: string;
  badgeHourly: string;
  badge120m: string;

  // Language Selector
  langEnglish: string;
  langHindi: string;
  langMarathi: string;
  switchLanguage: string;

  // Weather Portal Overview & Cards
  weatherTitle: string;
  currentConditions: string;
  realFeel: string;
  windGusts: string;
  humidityLabel: string;
  dewPoint: string;
  pressure: string;
  uvIndex: string;
  visibility: string;
  airQuality: string;
  cloudCeiling: string;
  rainfallRate: string;
  marineTides: string;
  currentTideLevel: string;
  highTidePeak: string;
  lowTide: string;
  sluiceGatesTitle: string;
  sluiceGatesOpen: string;
  sluiceGatesLocked: string;
  highTideWarning: string;
  earlyWarningBanner: string;
  activeRainBelts: string;
  hours24Forecast: string;
  days10Forecast: string;
  nowcastHeading: string;
  sunrise: string;
  sunset: string;
  peakRainMmHr: string;

  // Weather Condition Names
  condClear: string;
  condMainlyClear: string;
  condPartlyCloudy: string;
  condOvercast: string;
  condFog: string;
  condLightDrizzle: string;
  condModerateRain: string;
  condHeavyRain: string;
  condThunderstorm: string;
  condSevereStorm: string;

  // Days of Week
  dayMon: string;
  dayTue: string;
  dayWed: string;
  dayThu: string;
  dayFri: string;
  daySat: string;
  daySun: string;
  dayToday: string;
  dayTomorrow: string;

  // MinuteCast View
  minuteCastTitle: string;
  minuteCastSubtitle: string;
  heavyRainExpectedIn: string;
  noRainExpected: string;
  corridorQuickSelect: string;
  corridorAllMmr: string;
  corridorWestern: string;
  corridorCentral: string;
  corridorThane: string;
  spatialRadarMesh: string;
  radarStandingBy: string;
  radarInitiated: string;
  precipitationTimeline: string;
  statusClear: string;
  statusDrizzle: string;
  statusModerate: string;
  statusHeavy: string;

  // 3D Twin Map & Command Deck
  commandDeckTitle: string;
  tabSandbox: string;
  tabHotspots: string;
  rainfallSlider: string;
  tideSlider: string;
  siltationSlider: string;
  presetsTitle: string;
  presetNormal: string;
  presetHighTide: string;
  presetCloudburst: string;
  presetCyclone: string;
  runSimulationBtn: string;
  resetBaselineBtn: string;
  timelineForecastTitle: string;
  timelineNow: string;
  timeline1h: string;
  timeline2h: string;
  timeline3h: string;
  topHotspotsTitle: string;
  criticalSpotsCount: string;

  // Component Inspector Drawer
  inspectorTitle: string;
  assetDetails: string;
  wardLabel: string;
  failureRiskLabel: string;
  waterDepthLabel: string;
  capacityUtilization: string;
  healthScoreLabel: string;
  workOrderTitle: string;
  workOrderSub: string;
  recommendedAction: string;
  mobilizePumps: string;
  dispatchTankers: string;
  trafficDiversion: string;
  estEtaHours: string;
  severityHigh: string;
  severityMedium: string;
  severityLow: string;
  closeDrawer: string;

  // Citizen Report Modal
  reportModalTitle: string;
  reportModalSubtitle: string;
  reporterName: string;
  reporterNamePlaceholder: string;
  categoryLabel: string;
  catPothole: string;
  catWaterlogging: string;
  catManhole: string;
  catTraffic: string;
  landmarkLabel: string;
  landmarkPlaceholder: string;
  wardSelectLabel: string;
  depthEstimateLabel: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  submitReportBtn: string;
  submittingText: string;
  ticketCreatedTitle: string;
  ticketNotice: string;
  ticketIdLabel: string;
  closeBtn: string;

  // Priority Matrix & Dispatch
  priorityQueueTitle: string;
  priorityFormula: string;
  tableRank: string;
  tableLocation: string;
  tableWard: string;
  tablePriorityScore: string;
  tableAction: string;
  tableCost: string;
  inspectBtn: string;

  // Weather Portal Extra
  tonightAlertTitle: string;
  tonightLabel: string;
  tomorrowLabel: string;
  currentTelemetryTitle: string;
  windLabel: string;
  tideSeaLabel: string;
  catchmentRunoffLabel: string;
  dewateringPumpsLabel: string;
  lookingAheadTitle: string;
  openInTwinMap: string;
  radarOnline: string;
  activeLayer: string;
  layerPrecipitation: string;
  layerClouds: string;
  layerFloodDepths: string;
  hyetographTitle: string;
  clickHourExpand: string;

  // Scenario Sandbox Extra
  whatIfSandboxTitle: string;
  computingMl: string;
  nowcastTimeline03h: string;
  playBtn: string;
  pauseBtn: string;
  stressTestPresets: string;

  // Cascading Risk Graph
  cascadingRiskTitle: string;
  criticalNodesText: string;
  totalNodesText: string;
  rainInflux: string;
  drainChoke: string;
  surfaceFlooding: string;
  trafficGridlock: string;

  // MinuteCast Extra
  showAllIntervals: string;
  hideAllIntervals: string;
  filterRainyMinutes: string;
  filterAllMinutes: string;
  noPrecipitation: string;
  lightRain: string;
  moderateRain: string;
  heavyDownpour: string;
  rainStartsIn: string;
  continuousRain: string;
  radarLoopPlayback: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    weatherPortal: "Weather Portal",
    twinMap: "3D Twin Map",
    liveTelemetryOn: "LIVE TELEMETRY ON",
    simulationMode: "SIMULATION MODE",
    realtimeBadge: "REAL-TIME",
    rainMetric: "mm/h",
    tideMetric: "m Tide",
    humidityMetric: "Humidity",
    windMetric: "km/h",
    healthMetric: "Health",
    viewToggle: "VIEW",
    citizenReportBtn: "Citizen Report",

    tabToday: "TODAY",
    tabHourly: "HOURLY",
    tab10Day: "10-DAY",
    tabRadar: "RADAR",
    tabMinuteCast: "MINUTECAST®",
    badgeLive: "LIVE",
    badgeHourly: "0-3h",
    badge120m: "120m",

    langEnglish: "English",
    langHindi: "हिंदी",
    langMarathi: "मराठी",
    switchLanguage: "Language",

    weatherTitle: "Mumbai & Thane Hydrology & Weather Portal",
    currentConditions: "Current Weather Conditions",
    realFeel: "RealFeel®",
    windGusts: "Wind Gusts",
    humidityLabel: "Relative Humidity",
    dewPoint: "Dew Point",
    pressure: "Atmospheric Pressure",
    uvIndex: "UV Index",
    visibility: "Visibility",
    airQuality: "Air Quality (AQI)",
    cloudCeiling: "Cloud Ceiling",
    rainfallRate: "Rainfall Intensity",
    marineTides: "Arabian Sea Tidal Telemetry",
    currentTideLevel: "Current Tide Level",
    highTidePeak: "High Tide Peak",
    lowTide: "Low Tide",
    sluiceGatesTitle: "Sluice Gate Status",
    sluiceGatesOpen: "Flap Gates Open (Free Gravity Outfall)",
    sluiceGatesLocked: "Flap Gates Locked (Tidal Backflow Blocked)",
    highTideWarning: "HIGH TIDE WARNING: Backflow lockout risk at coastal drains",
    earlyWarningBanner: "MCGM DISASTER MANAGEMENT RADAR EARLY WARNING",
    activeRainBelts: "Active Spatial Rain Belts",
    hours24Forecast: "24-Hour Hourly Forecast",
    days10Forecast: "10-Day Extended Weather Forecast",
    nowcastHeading: "Doppler Nowcasting",
    sunrise: "Sunrise",
    sunset: "Sunset",
    peakRainMmHr: "Peak Rain",

    condClear: "Clear Sky",
    condMainlyClear: "Mainly Clear",
    condPartlyCloudy: "Partly Cloudy",
    condOvercast: "Overcast",
    condFog: "Fog / Mist",
    condLightDrizzle: "Light Drizzle",
    condModerateRain: "Moderate Rain",
    condHeavyRain: "Heavy Downpour",
    condThunderstorm: "Thunderstorm with High Wind",
    condSevereStorm: "Severe Monsoon Storm",

    dayMon: "Mon",
    dayTue: "Tue",
    dayWed: "Wed",
    dayThu: "Thu",
    dayFri: "Fri",
    daySat: "Sat",
    daySun: "Sun",
    dayToday: "Today",
    dayTomorrow: "Tomorrow",

    minuteCastTitle: "MINUTECAST® PRECIPITATION NOWCASTING",
    minuteCastSubtitle: "Next 120 Minutes Convective Storm Prediction (15m Interval)",
    heavyRainExpectedIn: "Heavy downpour expected in",
    noRainExpected: "No significant precipitation expected in next 120 minutes.",
    corridorQuickSelect: "Corridor Quick Select",
    corridorAllMmr: "All Mumbai & Thane MMR",
    corridorWestern: "Western Suburbs",
    corridorCentral: "Central & Island City",
    corridorThane: "Thane, Mumbra & Shilphata",
    spatialRadarMesh: "5-Zone Spatial Radar Mesh",
    radarStandingBy: "Radar Monitoring Active",
    radarInitiated: "RAIN INITIATED",
    precipitationTimeline: "Minute-by-Minute Rainfall Intensity",
    statusClear: "CLEAR",
    statusDrizzle: "LIGHT DRIZZLE",
    statusModerate: "MODERATE RAIN",
    statusHeavy: "HEAVY DOWNPOUR",

    commandDeckTitle: "Command Deck & Hotspots",
    tabSandbox: "Sandbox Controls",
    tabHotspots: "High-Risk Hotspots",
    rainfallSlider: "Rainfall Intensity",
    tideSlider: "Arabian Sea Tide Level",
    siltationSlider: "Drain Siltation Level",
    presetsTitle: "Municipal Simulation Presets",
    presetNormal: "Normal Monsoon Baseline",
    presetHighTide: "High Tide Lockout (4.6m)",
    presetCloudburst: "Cloudburst Emergency (140mm/h)",
    presetCyclone: "Severe Cyclone & Surge (180mm/h)",
    runSimulationBtn: "Run Simulation",
    resetBaselineBtn: "Reset Baseline",
    timelineForecastTitle: "0-3h Timeline Forecast Scrubber",
    timelineNow: "Current (+0h)",
    timeline1h: "+1 Hour",
    timeline2h: "+2 Hours",
    timeline3h: "+3 Hours",
    topHotspotsTitle: "Top High-Risk Inundation Hotspots",
    criticalSpotsCount: "Critical Spots",

    inspectorTitle: "Component Telemetry & Diagnostics",
    assetDetails: "Asset Details",
    wardLabel: "BMC Ward",
    failureRiskLabel: "Failure Risk Score",
    waterDepthLabel: "Water Depth",
    capacityUtilization: "Capacity Utilization",
    healthScoreLabel: "Infrastructure Health Score",
    workOrderTitle: "Automated BMC Municipal Work Order",
    workOrderSub: "Pre-emptive action generated by digital twin physics engine",
    recommendedAction: "Recommended Action",
    mobilizePumps: "Deploy 2x 6,000 m³/h Dewatering Pumps immediately",
    dispatchTankers: "Dispatch Suction Sludge Tanker for Desilting",
    trafficDiversion: "Signal Traffic Police for Emergency Diversion",
    estEtaHours: "Estimated Restoration ETA",
    severityHigh: "CRITICAL HIGH RISK",
    severityMedium: "ELEVATED RISK",
    severityLow: "NORMAL STABLE",
    closeDrawer: "Close Drawer",

    reportModalTitle: "Report Waterlogging / Pothole",
    reportModalSubtitle: "Crowdsourced Ground Truth Ingestion for BMC Digital Twin",
    reporterName: "Your Name",
    reporterNamePlaceholder: "e.g. Rajesh Patil",
    categoryLabel: "Issue Category",
    catPothole: "Pothole / Road Degradation",
    catWaterlogging: "Severe Waterlogging / Inundation",
    catManhole: "Open / Damaged Manhole",
    catTraffic: "Monsoon Traffic Gridlock",
    landmarkLabel: "Location / Landmark",
    landmarkPlaceholder: "e.g. Hindmata Flyover Underpass, Dadar",
    wardSelectLabel: "BMC Ward",
    depthEstimateLabel: "Estimated Water Depth (cm)",
    descriptionLabel: "Incident Details & Description",
    descriptionPlaceholder: "Describe the road or waterlogging condition...",
    submitReportBtn: "Submit Grievance to BMC",
    submittingText: "Ingesting into Digital Twin...",
    ticketCreatedTitle: "Grievance Ingested Successfully!",
    ticketNotice: "Your report has been verified against digital twin telemetry and dispatched to the local ward office.",
    ticketIdLabel: "Official Ticket ID",
    closeBtn: "Close Window",

    // Priority Matrix & Dispatch
    priorityQueueTitle: "SIH Multi-Criteria Priority Dispatch Queue",
    priorityFormula: "Formula: P(Fail) × Impact × PopExp × TrafficExp × Cost × Urgency",
    tableRank: "RANK",
    tableLocation: "LOCATION / ASSET",
    tableWard: "WARD",
    tablePriorityScore: "PRIORITY SCORE",
    tableAction: "RECOMMENDED ACTION",
    tableCost: "EST. COST",
    inspectBtn: "Inspect",

    // Weather Portal Extra
    tonightAlertTitle: "TONIGHT'S WEATHER & HYDROLOGY ALERT",
    tonightLabel: "Tonight:",
    tomorrowLabel: "Tomorrow:",
    currentTelemetryTitle: "CURRENT WEATHER & TELEMETRY",
    windLabel: "WIND",
    tideSeaLabel: "ARABIAN SEA TIDE",
    catchmentRunoffLabel: "CATCHMENT RUNOFF",
    dewateringPumpsLabel: "DEWATERING PUMPS",
    lookingAheadTitle: "LOOKING AHEAD • HYDROLOGICAL ADVISORY",
    openInTwinMap: "Open in Full 3D Twin Map",
    radarOnline: "RADAR ONLINE",
    activeLayer: "Active Layer:",
    layerPrecipitation: "Precipitation",
    layerClouds: "Clouds",
    layerFloodDepths: "Flood Depths",
    hyetographTitle: "16-Hour Hyetograph (Precipitation & Risk Distribution)",
    clickHourExpand: "16-Hour Detailed Outlook • Click any hour to expand",

    // Scenario Sandbox Extra
    whatIfSandboxTitle: "Scenario Sandbox & What-If",
    computingMl: "Computing ML...",
    nowcastTimeline03h: "0-3 HOUR NOWCAST TIMELINE:",
    playBtn: "Play",
    pauseBtn: "Pause",
    stressTestPresets: "Monsoon Stress-Test Presets:",

    // Cascading Risk Graph
    cascadingRiskTitle: "Infrastructure Multi-Hop Cascading Risk Propagation",
    criticalNodesText: "Critical Nodes",
    totalNodesText: "Total Nodes",
    rainInflux: "Rain Influx",
    drainChoke: "Drain Choke",
    surfaceFlooding: "Surface Inundation",
    trafficGridlock: "Traffic Gridlock",

    // MinuteCast Extra
    showAllIntervals: "Expand All",
    hideAllIntervals: "Collapse All",
    filterRainyMinutes: "Show Rain Only",
    filterAllMinutes: "Show All Minutes",
    noPrecipitation: "No Precipitation",
    lightRain: "Light Rain",
    moderateRain: "Moderate Rain",
    heavyDownpour: "Heavy Downpour",
    rainStartsIn: "Rain expected in",
    continuousRain: "Continuous rain across corridor",
    radarLoopPlayback: "Live Radar Loop Playback",
  },

  hi: {
    weatherPortal: "मौसम पोर्टल",
    twinMap: "3D ट्विन मानचित्र",
    liveTelemetryOn: "लाइव टेलीमेट्री चालू",
    simulationMode: "सिमुलेशन मोड",
    realtimeBadge: "वास्तविक समय",
    rainMetric: "मिमी/घंटा",
    tideMetric: "मी. ज्वार",
    humidityMetric: "आर्द्रता",
    windMetric: "किमी/घंटा",
    healthMetric: "स्वास्थ्य",
    viewToggle: "दृश्य",
    citizenReportBtn: "नागरिक रिपोर्ट",

    tabToday: "आज",
    tabHourly: "प्रति घंटा",
    tab10Day: "10-दिन",
    tabRadar: "रडार",
    tabMinuteCast: "मिनिटकास्ट®",
    badgeLive: "लाइव",
    badgeHourly: "0-3 घंटे",
    badge120m: "120 मिनट",

    langEnglish: "English",
    langHindi: "हिंदी",
    langMarathi: "मराठी",
    switchLanguage: "भाषा",

    weatherTitle: "मुंबई और ठाणे जल विज्ञान एवं मौसम पोर्टल",
    currentConditions: "वर्तमान मौसम की स्थिति",
    realFeel: "वास्तविक अहसास (RealFeel®)",
    windGusts: "हवा के झोंके",
    humidityLabel: "सापेक्ष आर्द्रता",
    dewPoint: "ओस बिंदु",
    pressure: "वायुमंडलीय दबाव",
    uvIndex: "यूवी सूचकांक",
    visibility: "दृश्यता",
    airQuality: "वायु गुणवत्ता (AQI)",
    cloudCeiling: "बादल की ऊंचाई",
    rainfallRate: "वर्षा की तीव्रता",
    marineTides: "अरब सागर ज्वार-भाटा टेलीमेट्री",
    currentTideLevel: "वर्तमान ज्वार स्तर",
    highTidePeak: "उच्च ज्वार शिखर",
    lowTide: "कम ज्वार (भाटा)",
    sluiceGatesTitle: "फ्लड गेट्स की स्थिति",
    sluiceGatesOpen: "गेट खुले हैं (मुक्त गुरुत्वाकर्षण निकास)",
    sluiceGatesLocked: "गेट बंद हैं (समुद्री बैकफ्लो लॉक)",
    highTideWarning: "उच्च ज्वार चेतावनी: तटीय नालों में समुद्री बैकफ्लो का खतरा",
    earlyWarningBanner: "बीएमसी आपदा प्रबंधन रडार पूर्व चेतावनी",
    activeRainBelts: "सक्रिय वर्षा क्षेत्र",
    hours24Forecast: "अगले 24 घंटे का पूर्वानुमान",
    days10Forecast: "10 दिवसीय विस्तृत मौसम पूर्वानुमान",
    nowcastHeading: "डॉपलर नाउकास्टिंग",
    sunrise: "सूर्योदय",
    sunset: "सूर्यास्त",
    peakRainMmHr: "उच्चतम वर्षा",

    condClear: "साफ आसमान",
    condMainlyClear: "मुख्य रूप से साफ",
    condPartlyCloudy: "आंशिक रूप से बादल",
    condOvercast: "घने बादल",
    condFog: "कोहरा / धुंध",
    condLightDrizzle: "हल्की बूंदाबांदी",
    condModerateRain: "मध्यम वर्षा",
    condHeavyRain: "भारी मूसलाधार बारिश",
    condThunderstorm: "आंधी-तूफान और तेज हवाएं",
    condSevereStorm: "भीषण मानसूनी चक्रवाती तूफान",

    dayMon: "सोम",
    dayTue: "मंगल",
    dayWed: "बुध",
    dayThu: "गुरु",
    dayFri: "शुक्र",
    daySat: "शनि",
    daySun: "रवि",
    dayToday: "आज",
    dayTomorrow: "कल",

    minuteCastTitle: "मिनिटकास्ट® वर्षा नाउकास्टिंग",
    minuteCastSubtitle: "अगले 120 मिनट में तूफान और बारिश का सटीक पूर्वानुमान (15 मिनट अंतराल)",
    heavyRainExpectedIn: "भारी बारिश की संभावना",
    noRainExpected: "अगले 120 मिनट में कोई बड़ी बारिश की संभावना नहीं है।",
    corridorQuickSelect: "कॉरिडोर त्वरित चयन",
    corridorAllMmr: "संपूर्ण मुंबई और ठाणे एमएमआर",
    corridorWestern: "पश्चिमी उपनगर",
    corridorCentral: "मध्य और द्वीप शहर",
    corridorThane: "ठाणे, मुंब्रा और शिलफाटा",
    spatialRadarMesh: "5-ज़ोन स्थानिक रडार ग्रिड",
    radarStandingBy: "रडार निगरानी सक्रिय",
    radarInitiated: "बारिश शुरू हुई",
    precipitationTimeline: "मिनट-दर-मिनट वर्षा तीव्रता",
    statusClear: "साफ",
    statusDrizzle: "हल्की बूंदाबांदी",
    statusModerate: "मध्यम वर्षा",
    statusHeavy: "मूसलाधार बारिश",

    commandDeckTitle: "कमांड डेक एवं हॉटस्पॉट्स",
    tabSandbox: "सैंडबॉक्स नियंत्रण",
    tabHotspots: "उच्च-जोखिम हॉटस्पॉट्स",
    rainfallSlider: "वर्षा की तीव्रता (मिमी/घंटा)",
    tideSlider: "अरब सागर ज्वार स्तर (मीटर)",
    siltationSlider: "नालों में गाद/सिल्ट का स्तर (%)",
    presetsTitle: "नगरपालिका सिमुलेशन परिदृश्य",
    presetNormal: "सामान्य मानसून आधार रेखा",
    presetHighTide: "उच्च ज्वार संकट (4.6 मी)",
    presetCloudburst: "बादल फटना / क्लाउडबर्स्ट (140 मिमी/घंटा)",
    presetCyclone: "भीषण चक्रवात और समुद्री लहरें (180 मिमी/घंटा)",
    runSimulationBtn: "सिमुलेशन चलाएं",
    resetBaselineBtn: "डिफ़ॉल्ट रीसेट करें",
    timelineForecastTitle: "0-3 घंटे की समयरेखा पूर्वानुमान",
    timelineNow: "वर्तमान (+0 घंटा)",
    timeline1h: "+1 घंटा",
    timeline2h: "+2 घंटे",
    timeline3h: "+3 घंटे",
    topHotspotsTitle: "शीर्ष उच्च जोखिम वाले जलभराव क्षेत्र",
    criticalSpotsCount: "गंभीर हॉटस्पॉट",

    inspectorTitle: "घटक टेलीमेट्री एवं निदान",
    assetDetails: "संपत्ति विवरण",
    wardLabel: "बीएमसी वार्ड",
    failureRiskLabel: "विफलता जोखिम स्कोर",
    waterDepthLabel: "पानी की गहराई",
    capacityUtilization: "क्षमता उपयोग",
    healthScoreLabel: "बुनियादी ढांचा स्वास्थ्य स्कोर",
    workOrderTitle: "स्वचालित बीएमसी नगर पालिका कार्य आदेश",
    workOrderSub: "डिजिटल ट्विन भौतिकी इंजन द्वारा पूर्व-निवारक आदेश जारी",
    recommendedAction: "अनुशंसित कार्रवाई",
    mobilizePumps: "तुरंत 2x 6,000 m³/h डीवाटरिंग पंप तैनात करें",
    dispatchTankers: "सिल्ट सफाई के लिए सक्शन टैंकर रवाना करें",
    trafficDiversion: "आपातकालीन डायवर्जन के लिए ट्रैफिक पुलिस को सूचित करें",
    estEtaHours: "अनुमानित समाधान समय",
    severityHigh: "अत्यधिक गंभीर जोखिम",
    severityMedium: "मध्यम जोखिम",
    severityLow: "सामान्य / स्थिर",
    closeDrawer: "ड्रॉवर बंद करें",

    reportModalTitle: "जलभराव / गड्ढे की रिपोर्ट करें",
    reportModalSubtitle: "बीएमसी डिजिटल ट्विन के लिए नागरिक शिकायत प्रणाली",
    reporterName: "आपका नाम",
    reporterNamePlaceholder: "उदा. राजेश पाटिल",
    categoryLabel: "समस्या की श्रेणी",
    catPothole: "सड़क के गड्ढे / क्षति",
    catWaterlogging: "गंभीर जलभराव / बाढ़",
    catManhole: "खुला या क्षतिग्रस्त मैनहोल",
    catTraffic: "मानसून ट्रैफिक जाम",
    landmarkLabel: "स्थान / लैंडमार्क",
    landmarkPlaceholder: "उदा. हिंदमाता फ्लाईओवर के नीचे, दादर",
    wardSelectLabel: "बीएमसी वार्ड",
    depthEstimateLabel: "अनुमानित पानी की गहराई (सेमी)",
    descriptionLabel: "घटना का विवरण",
    descriptionPlaceholder: "सड़क या जलभराव की स्थिति का वर्णन करें...",
    submitReportBtn: "बीएमसी को शिकायत भेजें",
    submittingText: "डिजिटल ट्विन में दर्ज हो रहा है...",
    ticketCreatedTitle: "शिकायत सफलतापूर्वक दर्ज हुई!",
    ticketNotice: "आपकी रिपोर्ट को डिजिटल ट्विन टेलीमेट्री से सत्यापित कर स्थानीय वार्ड कार्यालय को भेज दिया गया है।",
    ticketIdLabel: "आधिकारिक टिकट संख्या",
    closeBtn: "विंडो बंद करें",

    // Priority Matrix & Dispatch
    priorityQueueTitle: "बीएमसी बहु-मानदंड प्राथमिकता प्रेषण कतार",
    priorityFormula: "सूत्र: विफलता जोखिम × प्रभाव × आबादी × यातायात × लागत × तात्कालिकता",
    tableRank: "रैंक",
    tableLocation: "स्थान / बुनियादी ढांचा",
    tableWard: "वार्ड",
    tablePriorityScore: "प्राथमिकता स्कोर",
    tableAction: "अनुशंसित कार्रवाई",
    tableCost: "अनुमानित लागत",
    inspectBtn: "जांचें",

    // Weather Portal Extra
    tonightAlertTitle: "आज रात का मौसम और जल विज्ञान अलर्ट",
    tonightLabel: "आज रात:",
    tomorrowLabel: "कल:",
    currentTelemetryTitle: "वर्तमान मौसम और टेलीमेट्री",
    windLabel: "हवा",
    tideSeaLabel: "अरब सागर ज्वार",
    catchmentRunoffLabel: "जलग्रहण अपवाह",
    dewateringPumpsLabel: "डीवाटरिंग पंप",
    lookingAheadTitle: "आगे का दृष्टिकोण • जल विज्ञान परामर्श",
    openInTwinMap: "पूर्ण 3D ट्विन मानचित्र में खोलें",
    radarOnline: "रडार ऑनलाइन",
    activeLayer: "सक्रिय परत:",
    layerPrecipitation: "वर्षा",
    layerClouds: "बादल",
    layerFloodDepths: "बाढ़ की गहराई",
    hyetographTitle: "16-घंटे का हाइटोमीटर (वर्षा और जोखिम वितरण)",
    clickHourExpand: "16 घंटे का विस्तृत दृश्य • विस्तार के लिए किसी घंटे पर क्लिक करें",

    // Scenario Sandbox Extra
    whatIfSandboxTitle: "परिदृश्य सैंडबॉक्स और 'व्हाट-इफ' विश्लेषण",
    computingMl: "एमएल गणना जारी...",
    nowcastTimeline03h: "0-3 घंटे का नाउकास्ट समयरेखा:",
    playBtn: "चलाएं",
    pauseBtn: "रोकें",
    stressTestPresets: "मानसून तनाव-परीक्षण परिदृश्य:",

    // Cascading Risk Graph
    cascadingRiskTitle: "बुनियादी ढांचा बहु-चरणीय कैस्केडिंग जोखिम प्रसार",
    criticalNodesText: "गंभीर नोड्स",
    totalNodesText: "कुल नोड्स",
    rainInflux: "अत्यधिक वर्षा",
    drainChoke: "नालों में रुकावट",
    surfaceFlooding: "सड़क पर जलभराव",
    trafficGridlock: "यातायात ठप्प",

    // MinuteCast Extra
    showAllIntervals: "सभी खोलें",
    hideAllIntervals: "सभी बंद करें",
    filterRainyMinutes: "केवल बारिश दिखाएं",
    filterAllMinutes: "सभी मिनट दिखाएं",
    noPrecipitation: "बारिश नहीं",
    lightRain: "हल्की बारिश",
    moderateRain: "मध्यम वर्षा",
    heavyDownpour: "मूसलाधार बारिश",
    rainStartsIn: "बारिश शुरू होने का समय",
    continuousRain: "कॉरिडोर में लगातार बारिश",
    radarLoopPlayback: "लाइव रडार लूप प्लेबैक",
  },

  mr: {
    weatherPortal: "हवामान पोर्टल",
    twinMap: "3D ट्विन नकाशा",
    liveTelemetryOn: "थेट टेलीमेट्री सुरू",
    simulationMode: "सिम्युलेशन मोड",
    realtimeBadge: "रिअल-टाइम",
    rainMetric: "मिमी/तास",
    tideMetric: "मी. भरती",
    humidityMetric: "आर्द्रता",
    windMetric: "किमी/तास",
    healthMetric: "आरोग्य",
    viewToggle: "दृश्य",
    citizenReportBtn: "नागरिक तक्रार",

    tabToday: "आज",
    tabHourly: "ताशी अंदाज",
    tab10Day: "10-दिवस",
    tabRadar: "रडार",
    tabMinuteCast: "मिनिटकास्ट®",
    badgeLive: "थेट",
    badgeHourly: "0-3 तास",
    badge120m: "120 मिनिटे",

    langEnglish: "English",
    langHindi: "हिंदी",
    langMarathi: "मराठी",
    switchLanguage: "भाषा",

    weatherTitle: "मुंबई आणि ठाणे जलविज्ञान आणि हवामान पोर्टल",
    currentConditions: "सध्याची हवामान स्थिती",
    realFeel: "प्रत्यक्ष जाणीव (RealFeel®)",
    windGusts: "वाऱ्याचे झोके",
    humidityLabel: "सापेक्ष आर्द्रता",
    dewPoint: "दव बिंदू",
    pressure: "वातावरणीय दाब",
    uvIndex: "अतिनील निर्देशांक (UV)",
    visibility: "दृश्यमानता",
    airQuality: "हवेची गुणवत्ता (AQI)",
    cloudCeiling: "ढगांची उंची",
    rainfallRate: "पावसाची तीव्रता",
    marineTides: "अरबी समुद्र भरती-ओहोटी टेलीमेट्री",
    currentTideLevel: "सध्याची भरती पातळी",
    highTidePeak: "कमाल भरती शिखर",
    lowTide: "ओहोटी",
    sluiceGatesTitle: "फ्लड गेट्सची स्थिती",
    sluiceGatesOpen: "दारे उघडी आहेत (मुक्त निचरा)",
    sluiceGatesLocked: "दारे बंद आहेत (समुद्री बॅकफ्लो लॉक)",
    highTideWarning: "मोठ्या भरतीचा इशारा: किनारी नाल्यांमध्ये पाणी उलटण्याचा धोका",
    earlyWarningBanner: "मनपा आपत्ती व्यवस्थापन रडार पूर्वसूचना",
    activeRainBelts: "सक्रिय पर्जन्य पट्टे",
    hours24Forecast: "पुढील 24 तासांचा अंदाज",
    days10Forecast: "10 दिवसांचा हवामान अंदाज",
    nowcastHeading: "डॉपलर नाऊकास्टिंग",
    sunrise: "सूर्योदय",
    sunset: "सूर्यास्त",
    peakRainMmHr: "कमाल पाऊस",

    condClear: "निरभ्र आकाश",
    condMainlyClear: "मुख्यतः स्वच्छ",
    condPartlyCloudy: "अंशतः ढगाळ",
    condOvercast: "पूर्णतः ढगाळ",
    condFog: "धुके",
    condLightDrizzle: "हलकी रिमझिम",
    condModerateRain: "मध्यम पाऊस",
    condHeavyRain: "मुसळधार पाऊस",
    condThunderstorm: "वादळी वाऱ्यासह पाऊस",
    condSevereStorm: "अतिमुसळधार चक्रीवादळी पाऊस",

    dayMon: "सोम",
    dayTue: "मंगळ",
    dayWed: "बुध",
    dayThu: "गुरू",
    dayFri: "शुक्र",
    daySat: "शनि",
    daySun: "रवि",
    dayToday: "आज",
    dayTomorrow: "उद्या",

    minuteCastTitle: "मिनिटकास्ट® पर्जन्य नाऊकास्टिंग",
    minuteCastSubtitle: "पुढील 120 मिनिटांचा वादळ व पावसाचा सूक्ष्म अंदाज (15 मिनिटांचे अंतर)",
    heavyRainExpectedIn: "मुसळधार पावसाची शक्यता",
    noRainExpected: "पुढील 120 मिनिटांत मोठ्या पावसाची शक्यता नाही.",
    corridorQuickSelect: "मार्गिका त्वरित निवड",
    corridorAllMmr: "संपूर्ण मुंबई आणि ठाणे एमएमआर",
    corridorWestern: "पश्चिम उपनगरे",
    corridorCentral: "मध्य आणि शहर विभाग",
    corridorThane: "ठाणे, मुंब्रा आणि शीळफाटा",
    spatialRadarMesh: "5-क्षेत्रीय रडार जाळे",
    radarStandingBy: "रडार सज्ज",
    radarInitiated: "पाऊस सुरू झाला",
    precipitationTimeline: "मिनिटानिहाय पावसाची तीव्रता",
    statusClear: "स्वच्छ",
    statusDrizzle: "हलकी रिमझिम",
    statusModerate: "मध्यम पाऊस",
    statusHeavy: "मुसळधार पाऊस",

    commandDeckTitle: "कमांड डेक आणि हॉटस्पॉट्स",
    tabSandbox: "सँडबॉक्स नियंत्रणे",
    tabHotspots: "धोकादायक ठिकाणे",
    rainfallSlider: "पावसाची तीव्रता (मिमी/तास)",
    tideSlider: "अरबी समुद्र भरती पातळी (मीटर)",
    siltationSlider: "नाल्यांमधील गाळाचे प्रमाण (%)",
    presetsTitle: "महापालिका सिम्युलेशन परिस्थिती",
    presetNormal: "सामान्य मान्सून मूळ स्थिती",
    presetHighTide: "मोठी भरती संकट (4.6 मी)",
    presetCloudburst: "ढगफुटी आपत्कालीन स्थिती (140 मिमी/तास)",
    presetCyclone: "चक्रीवादळ व लाटांचे संकट (180 मिमी/तास)",
    runSimulationBtn: "सिम्युलेशन सुरू करा",
    resetBaselineBtn: "मूळ स्थिती रीसेट करा",
    timelineForecastTitle: "0-3 तास वेळरेखा अंदाज",
    timelineNow: "सध्या (+0 तास)",
    timeline1h: "+1 तास",
    timeline2h: "+2 तास",
    timeline3h: "+3 तास",
    topHotspotsTitle: "सर्वाधिक पाणी साचण्याची ठिकाणे",
    criticalSpotsCount: "अतिधोकादायक ठिकाणे",

    inspectorTitle: "घटक टेलीमेट्री आणि तपासणी",
    assetDetails: "पायाभूत सुविधा तपशील",
    wardLabel: "मनपा प्रभाग (वॉर्ड)",
    failureRiskLabel: "धोका निर्देशांक",
    waterDepthLabel: "पाण्याची खोली",
    capacityUtilization: "क्षमता वापर",
    healthScoreLabel: "रस्ते / नाले आरोग्य निर्देशांक",
    workOrderTitle: "स्वयंचलित मनपा कार्य आदेश (Work Order)",
    workOrderSub: "डिजिटल ट्विन इंजिनद्वारे तयार केलेला प्रतिबंधात्मक आदेश",
    recommendedAction: "शिफारस केलेली कृती",
    mobilizePumps: "त्वरित 2x 6,000 m³/h पाण्याचा उपसा करणारे पंप पाठवा",
    dispatchTankers: "गाळ उपसण्यासाठी सक्शन टँकर रवाना करा",
    trafficDiversion: "वाहतूक वळवण्यासाठी वाहतूक पोलिसांना सूचना द्या",
    estEtaHours: "अंदाजे उपाय वेळ",
    severityHigh: "अत्यंत गंभीर धोका",
    severityMedium: "मध्यम धोका",
    severityLow: "सामान्य / स्थिर",
    closeDrawer: "बंद करा",

    reportModalTitle: "पाणी साचणे / खड्ड्यांची तक्रार करा",
    reportModalSubtitle: "मुंबई डिजिटल ट्विनसाठी नागरिकांची तक्रार प्रणाली",
    reporterName: "आपले नाव",
    reporterNamePlaceholder: "उदा. अमित सावंत",
    categoryLabel: "समस्येचा प्रकार",
    catPothole: "रस्त्यावरील खड्डे / नादुरुस्ती",
    catWaterlogging: "गंभीर पाणी साचणे / पूरस्थिती",
    catManhole: "उघडे किंवा तुटलेले मॅनहोल",
    catTraffic: "पावसामुळे झालेली वाहतूक कोंडी",
    landmarkLabel: "ठिकाण / लँडमार्क",
    landmarkPlaceholder: "उदा. हिंदमाता उड्डाणपुलाखाली, दादर",
    wardSelectLabel: "मनपा प्रभाग (वॉर्ड)",
    depthEstimateLabel: "पाण्याची अंदाजे खोली (सेमी)",
    descriptionLabel: "तक्रारीचा तपशील",
    descriptionPlaceholder: "रस्त्याची किंवा साचलेल्या पाण्याची स्थिती सांगा...",
    submitReportBtn: "मनपाकडे तक्रार नोंदवा",
    submittingText: "नोंदणी होत आहे...",
    ticketCreatedTitle: "तक्रार यशस्वीरीत्या नोंदवली गेली!",
    ticketNotice: "आपली तक्रार डिजिटल ट्विन टेलीमेट्रीद्वारे पडताळून स्थानिक वॉर्ड कार्यालयाकडे रवाना करण्यात आली आहे.",
    ticketIdLabel: "अधिकृत तक्रार क्रमांक",
    closeBtn: "खिडकी बंद करा",

    // Priority Matrix & Dispatch
    priorityQueueTitle: "मनपा अनेक-निकष प्राधान्य पाठवणी रांग",
    priorityFormula: "सूत्र: धोका × प्रभाव × लोकसंख्या × वाहतूक × खर्च × निकड",
    tableRank: "क्रमांक",
    tableLocation: "ठिकाण / मालमत्ता",
    tableWard: "प्रभाग (वॉर्ड)",
    tablePriorityScore: "प्राधान्य गुण",
    tableAction: "शिफारस केलेली कृती",
    tableCost: "अंदाजे खर्च",
    inspectBtn: "तपासा",

    // Weather Portal Extra
    tonightAlertTitle: "आज रात्रीचा हवामान आणि जलविज्ञान इशारा",
    tonightLabel: "आज रात्री:",
    tomorrowLabel: "उद्या:",
    currentTelemetryTitle: "सध्याचे हवामान आणि टेलीमेट्री",
    windLabel: "वारा",
    tideSeaLabel: "अरबी समुद्र भरती",
    catchmentRunoffLabel: "पाणलोट प्रवाह",
    dewateringPumpsLabel: "पाणी उपसा पंप",
    lookingAheadTitle: "पुढील अंदाज • जलविज्ञान सल्लागार",
    openInTwinMap: "संपूर्ण 3D ट्विन नकाशा उघडा",
    radarOnline: "रडार ऑनलाइन",
    activeLayer: "सक्रिय स्तर:",
    layerPrecipitation: "पाऊस",
    layerClouds: "ढग",
    layerFloodDepths: "पाण्याची खोली",
    hyetographTitle: "16-तासांचा हायटोग्राफ (पाऊस आणि धोका वितरण)",
    clickHourExpand: "16 तासांचा तपशीलवार अंदाज • तपशील पाहण्यासाठी कोणत्याही तासावर क्लिक करा",

    // Scenario Sandbox Extra
    whatIfSandboxTitle: "परिस्थिती सँडबॉक्स आणि 'व्हॉट-इफ' विश्लेषण",
    computingMl: "एमएल गणना सुरू...",
    nowcastTimeline03h: "0-3 तास नाऊकास्ट वेळरेखा:",
    playBtn: "सुरू करा",
    pauseBtn: "थांबवा",
    stressTestPresets: "मान्सून ताण-चाचणी परिस्थिती:",

    // Cascading Risk Graph
    cascadingRiskTitle: "पायाभूत सुविधा बहु-टप्प्यांचे कॅस्केडिंग धोका वहन",
    criticalNodesText: "गंभीर नोड्स",
    totalNodesText: "एकूण नोड्स",
    rainInflux: "पावसाचा जोर",
    drainChoke: "नाले तुंबणे",
    surfaceFlooding: "रस्त्यावर पाणी साचणे",
    trafficGridlock: "वाहतूक कोंडी",

    // MinuteCast Extra
    showAllIntervals: "सर्व उघडा",
    hideAllIntervals: "सर्व बंद करा",
    filterRainyMinutes: "फक्त पाऊस दाखवा",
    filterAllMinutes: "सर्व मिनिटे दाखवा",
    noPrecipitation: "पाऊस नाही",
    lightRain: "हलका पाऊस",
    moderateRain: "मध्यम पाऊस",
    heavyDownpour: "मुसळधार पाऊस",
    rainStartsIn: "पाऊस सुरू होण्याची वेळ",
    continuousRain: "मार्गिकेत सतत पाऊस",
    radarLoopPlayback: "थेट रडार लूप प्लेबॅक",
  }
};
