import { NextResponse } from 'next/server';

const MOCK_CITIZEN_REPORTS = [
  {
    id: 101,
    reporter_name: "Aarav Mehta",
    category: "WATERLOGGING",
    landmark: "Milan Subway West Approach",
    ward: "K/W",
    severity: "CRITICAL",
    water_depth_cm: 55.0,
    description: "Subway completely inundated, vehicle traffic suspended. Water depth > 50cm.",
    latitude: 19.0915,
    longitude: 72.8425,
    status: "IN_PROGRESS",
    timestamp: "2026-09-26 14:30:00 IST"
  },
  {
    id: 102,
    reporter_name: "Pooja Sharma",
    category: "BLOCKED_DRAIN",
    landmark: "Hindmata Flyover Junction",
    ward: "F/S",
    severity: "HIGH",
    water_depth_cm: 38.0,
    description: "Storm drain clogged with road debris; heavy backflow near Parel TT circle.",
    latitude: 19.0125,
    longitude: 72.8432,
    status: "DISPATCHED",
    timestamp: "2026-09-26 14:45:00 IST"
  },
  {
    id: 103,
    reporter_name: "Rohan Deshmukh",
    category: "POTHOLE",
    landmark: "Kurla LBS Marg Near Phoenix Mall",
    ward: "L",
    severity: "HIGH",
    water_depth_cm: 25.0,
    description: "Multiple submerged potholes causing severe congestion on southbound corridor.",
    latitude: 19.0685,
    longitude: 72.8845,
    status: "INSPECTED",
    timestamp: "2026-09-26 15:05:00 IST"
  },
  {
    id: 104,
    reporter_name: "Fatima Shaikh",
    category: "WATERLOGGING",
    landmark: "Mumbra Railway Station Underpass",
    ward: "TMC-MBR",
    severity: "CRITICAL",
    water_depth_cm: 48.0,
    description: "Station underpass waterlogged, pedestrian movement halted.",
    latitude: 19.1915,
    longitude: 73.0235,
    status: "PUMP_DEPLOYED",
    timestamp: "2026-09-26 15:15:00 IST"
  },
  {
    id: 105,
    reporter_name: "Vikram Kulkarni",
    category: "PUMP_FAILURE",
    landmark: "Britannia Stormwater Outfall Gate",
    ward: "E",
    severity: "HIGH",
    water_depth_cm: 30.0,
    description: "Dewatering pump auxiliary diesel backup active during tidal surge.",
    latitude: 18.9830,
    longitude: 72.8460,
    status: "CREW_ON_SITE",
    timestamp: "2026-09-26 15:20:00 IST"
  }
];

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://mumbai-urban-digital-twin.onrender.com');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${backendUrl}/api/citizen/recent`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.reports && data.reports.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // Backend offline, 404, or timed out - fall back gracefully
  }

  return NextResponse.json({
    count: MOCK_CITIZEN_REPORTS.length,
    reports: MOCK_CITIZEN_REPORTS,
  });
}
