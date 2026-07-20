// ===================================================================
// VEHICLE ELECTRONICS STUDIO — DATA TABLES
// All 20 sections with cost/weight/power/luxury/tech data
// ===================================================================

export interface ModuleStats {
  cost: number;
  weight: number;   // kg
  power: number;    // W
  luxury: number;   // 0-1 contribution
  tech: number;     // 0-1 contribution
  reliability: number; // delta (negative = less reliable)
  assembly: number; // hours
}

// ---------- 1. Instrument Cluster ----------

export type ClusterLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const CLUSTER_LEVELS: Record<ClusterLevel, { label: string; sub: string } & ModuleStats> = {
  1: { label: "Level 1 — Analog", sub: "Analog gauges, mechanical odometer", cost: 80, weight: 1.5, power: 5, luxury: 0.02, tech: 0.02, reliability: 0.02, assembly: 0.3 },
  2: { label: "Level 2 — Analog + LCD", sub: "Analog + small LCD display", cost: 180, weight: 1.8, power: 10, luxury: 0.05, tech: 0.08, reliability: 0.01, assembly: 0.4 },
  3: { label: 'Level 3 — 7" Digital', sub: "7-inch digital display", cost: 400, weight: 2.0, power: 15, luxury: 0.1, tech: 0.2, reliability: 0, assembly: 0.5 },
  4: { label: 'Level 4 — 10" Digital', sub: "10-inch digital cluster", cost: 800, weight: 2.5, power: 20, luxury: 0.18, tech: 0.35, reliability: -0.01, assembly: 0.6 },
  5: { label: 'Level 5 — 12.3" Curved', sub: "12.3-inch curved display", cost: 1500, weight: 3.0, power: 28, luxury: 0.28, tech: 0.5, reliability: -0.02, assembly: 0.7 },
  6: { label: "Level 6 — Full OLED Cockpit", sub: "OLED cockpit display", cost: 2800, weight: 3.5, power: 35, luxury: 0.4, tech: 0.65, reliability: -0.03, assembly: 0.8 },
  7: { label: "Level 7 — AR Cluster", sub: "Augmented reality cluster", cost: 5500, weight: 4.5, power: 50, luxury: 0.55, tech: 0.9, reliability: -0.05, assembly: 1.0 },
};

// ---------- 2. Infotainment Screen (displayConfig already in types) ----------

export const INFOTAINMENT_SCREENS: { value: string; label: string; cost: number; weight: number; power: number; luxury: number }[] = [
  { value: "none", label: "None", cost: 0, weight: 0, power: 0, luxury: 0 },
  { value: "lcd_5", label: '5"', cost: 120, weight: 1.2, power: 8, luxury: 0.05 },
  { value: "touch_7", label: '7" Touch', cost: 280, weight: 1.5, power: 12, luxury: 0.1 },
  { value: "hd_8", label: '8" HD', cost: 450, weight: 1.8, power: 15, luxury: 0.15 },
  { value: "fhd_10", label: '10" FHD', cost: 900, weight: 2.2, power: 20, luxury: 0.25 },
  { value: "cockpit_12_3", label: '12.3"', cost: 1600, weight: 2.8, power: 28, luxury: 0.35 },
  { value: "oled_15", label: '15" OLED', cost: 2800, weight: 3.2, power: 32, luxury: 0.5 },
  { value: "oled_17_curved", label: '17" Curved OLED', cost: 4200, weight: 3.8, power: 38, luxury: 0.6 },
  { value: "dual", label: "Dual Screen", cost: 5200, weight: 5.5, power: 55, luxury: 0.7 },
  { value: "triple", label: "Triple Screen", cost: 7800, weight: 8.0, power: 80, luxury: 0.8 },
  { value: "passenger", label: "Passenger Display", cost: 1400, weight: 2.5, power: 22, luxury: 0.55 },
];

export const SCREEN_TECH_OPTIONS: { value: string; label: string; costFactor: number; luxury: number }[] = [
  { value: "tft", label: "TFT", costFactor: 1.0, luxury: 0 },
  { value: "ips", label: "IPS", costFactor: 1.3, luxury: 0.05 },
  { value: "oled", label: "OLED", costFactor: 1.8, luxury: 0.1 },
  { value: "amoled", label: "AMOLED", costFactor: 2.2, luxury: 0.15 },
  { value: "mini_led", label: "Mini-LED", costFactor: 2.0, luxury: 0.1 },
  { value: "micro_led", label: "MicroLED", costFactor: 3.5, luxury: 0.2 },
  { value: "flexible_oled", label: "Flexible OLED", costFactor: 3.0, luxury: 0.18 },
];

// ---------- 3. Operating System (osTier already in types) ----------

// ---------- 4. Connectivity ----------

export type ConnectivityTier = "basic" | "advanced" | "premium";

export const CONNECTIVITY_TIERS: Record<ConnectivityTier, { label: string; sub: string } & ModuleStats> = {
  basic:    { label: "Basic", sub: "Bluetooth only", cost: 50, weight: 0.3, power: 3, luxury: 0.02, tech: 0.05, reliability: 0.01, assembly: 0.2 },
  advanced: { label: "Advanced", sub: "Wi-Fi, CarPlay, Android Auto, USB-C, NFC", cost: 650, weight: 1.0, power: 12, luxury: 0.12, tech: 0.3, reliability: -0.01, assembly: 0.5 },
  premium:  { label: "Premium", sub: "5G, Satellite, Hotspot, Cloud sync", cost: 2200, weight: 2.0, power: 25, luxury: 0.25, tech: 0.6, reliability: -0.03, assembly: 0.8 },
};

export const CONNECTIVITY_EXTRAS: { key: string; label: string; desc: string; cost: number; power: number; tech: number }[] = [
  { key: "bluetooth", label: "Bluetooth", desc: "Wireless audio + calls", cost: 30, power: 2, tech: 0.02 },
  { key: "wifi", label: "Wi-Fi", desc: "In-car hotspot", cost: 120, power: 5, tech: 0.05 },
  { key: "wirelessCharging", label: "Wireless Charging", desc: "Qi charging pad", cost: 80, power: 10, tech: 0.04 },
  { key: "nfc", label: "NFC", desc: "Tap-to-pair", cost: 40, power: 1, tech: 0.03 },
  { key: "usbC", label: "USB-C", desc: "Fast charge ports", cost: 25, power: 0, tech: 0.02 },
  { key: "hdmi", label: "HDMI", desc: "Video input", cost: 35, power: 0, tech: 0.02 },
];

// ---------- 5. Audio Systems ----------

export type AudioTier = "basic" | "economy" | "mid" | "premium" | "luxury" | "ultra_luxury";

export const AUDIO_TIERS: Record<AudioTier, { label: string; sub: string; speakers: number } & ModuleStats> = {
  basic:         { label: "Basic", sub: "2 speakers", speakers: 2, cost: 60, weight: 1.5, power: 40, luxury: 0.01, tech: 0.02, reliability: 0.01, assembly: 0.3 },
  economy:       { label: "Economy", sub: "4 speakers", speakers: 4, cost: 180, weight: 3.0, power: 80, luxury: 0.05, tech: 0.05, reliability: 0.01, assembly: 0.5 },
  mid:           { label: "Mid", sub: "6 speakers", speakers: 6, cost: 450, weight: 5.0, power: 120, luxury: 0.12, tech: 0.1, reliability: 0, assembly: 0.7 },
  premium:       { label: "Premium", sub: "8 speakers + amplifier", speakers: 8, cost: 1200, weight: 8.0, power: 200, luxury: 0.22, tech: 0.2, reliability: -0.01, assembly: 1.0 },
  luxury:        { label: "Luxury", sub: "12 speakers + amp + subwoofer", speakers: 12, cost: 3500, weight: 15.0, power: 400, luxury: 0.4, tech: 0.35, reliability: -0.02, assembly: 1.5 },
  ultra_luxury:  { label: "Ultra Luxury", sub: "18-30 speakers, ANC, 3D surround", speakers: 24, cost: 8500, weight: 28.0, power: 800, luxury: 0.65, tech: 0.55, reliability: -0.04, assembly: 2.5 },
};

// ---------- 6. Climate Control ----------

export type ClimateTier = "manual" | "single" | "dual" | "tri" | "four" | "five";

export const CLIMATE_TIERS: Record<ClimateTier, { label: string; sub: string } & ModuleStats> = {
  manual: { label: "Manual AC", sub: "Manual controls", cost: 300, weight: 4.0, power: 0, luxury: 0.02, tech: 0.02, reliability: 0.02, assembly: 0.5 },
  single: { label: "Single-Zone", sub: "Automatic single zone", cost: 600, weight: 5.0, power: 30, luxury: 0.05, tech: 0.08, reliability: 0.01, assembly: 0.7 },
  dual:   { label: "Dual-Zone", sub: "Driver + passenger", cost: 900, weight: 6.0, power: 40, luxury: 0.1, tech: 0.15, reliability: 0, assembly: 0.8 },
  tri:    { label: "Tri-Zone", sub: "Front + rear", cost: 1300, weight: 7.5, power: 55, luxury: 0.15, tech: 0.2, reliability: -0.01, assembly: 1.0 },
  four:   { label: "Four-Zone", sub: "4 independent zones", cost: 2000, weight: 9.0, power: 70, luxury: 0.25, tech: 0.3, reliability: -0.02, assembly: 1.2 },
  five:   { label: "Five-Zone", sub: "5 zones (executive)", cost: 3200, weight: 11.0, power: 85, luxury: 0.4, tech: 0.4, reliability: -0.03, assembly: 1.5 },
};

export const CLIMATE_EXTRAS: { key: string; label: string; desc: string; cost: number; power: number; luxury: number }[] = [
  { key: "rearAc", label: "Rear AC", desc: "Rear ventilation", cost: 400, power: 20, luxury: 0.05 },
  { key: "airPurifier", label: "Air Purifier", desc: "HEPA filtration", cost: 350, power: 15, luxury: 0.06 },
  { key: "fragrance", label: "Fragrance System", desc: "In-car scent", cost: 500, power: 5, luxury: 0.1 },
  { key: "humidityControl", label: "Humidity Control", desc: "Auto humidity", cost: 300, power: 10, luxury: 0.05 },
  { key: "ionizer", label: "Ionizer", desc: "Air ionization", cost: 250, power: 8, luxury: 0.05 },
];

// ---------- 7. Seats ----------

export type SeatTier = "basic" | "mid" | "premium" | "luxury" | "executive" | "ultra_luxury";

export const SEAT_TIERS: Record<SeatTier, { label: string; sub: string } & ModuleStats> = {
  basic:        { label: "Basic", sub: "Fabric, manual", cost: 400, weight: 25, power: 0, luxury: 0.02, tech: 0, reliability: 0.02, assembly: 1.0 },
  mid:          { label: "Mid", sub: "Fabric, electric", cost: 900, weight: 28, power: 30, luxury: 0.08, tech: 0.05, reliability: 0.01, assembly: 1.5 },
  premium:      { label: "Premium", sub: "Leather", cost: 2200, weight: 32, power: 30, luxury: 0.2, tech: 0.08, reliability: 0, assembly: 2.0 },
  luxury:       { label: "Luxury", sub: "Ventilated leather", cost: 4500, weight: 38, power: 80, luxury: 0.35, tech: 0.15, reliability: -0.01, assembly: 2.5 },
  executive:    { label: "Executive", sub: "Massage + memory", cost: 8000, weight: 45, power: 120, luxury: 0.5, tech: 0.25, reliability: -0.02, assembly: 3.0 },
  ultra_luxury: { label: "Ultra Luxury", sub: "Zero-gravity, heated, ventilated, massage, leg rest", cost: 16000, weight: 55, power: 200, luxury: 0.8, tech: 0.4, reliability: -0.04, assembly: 4.0 },
};

export const SEAT_FEATURES: { key: string; label: string; cost: number; power: number; luxury: number }[] = [
  { key: "heated", label: "Heated", cost: 300, power: 50, luxury: 0.05 },
  { key: "ventilated", label: "Ventilated", cost: 500, power: 40, luxury: 0.08 },
  { key: "massage", label: "Massage", cost: 1200, power: 60, luxury: 0.12 },
  { key: "memory", label: "Memory", cost: 400, power: 10, luxury: 0.05 },
  { key: "reclining", label: "Reclining", cost: 600, power: 30, luxury: 0.06 },
  { key: "legRest", label: "Leg Rest", cost: 800, power: 40, luxury: 0.08 },
  { key: "zeroGravity", label: "Zero-Gravity", cost: 3000, power: 80, luxury: 0.15 },
];

// ---------- 8. Interior Lighting ----------

export type LightingTier = "none" | "white" | "multi" | "color64" | "dynamic" | "music_sync" | "welcome";

export const LIGHTING_TIERS: Record<LightingTier, { label: string; sub: string } & ModuleStats> = {
  none:       { label: "None", sub: "No ambient lighting", cost: 0, weight: 0, power: 0, luxury: 0, tech: 0, reliability: 0, assembly: 0 },
  white:      { label: "White LEDs", sub: "Single-color white", cost: 80, weight: 0.5, power: 5, luxury: 0.03, tech: 0.02, reliability: 0.01, assembly: 0.3 },
  multi:      { label: "Multi-Color", sub: "Selectable colors", cost: 200, weight: 0.8, power: 8, luxury: 0.08, tech: 0.08, reliability: 0.01, assembly: 0.5 },
  color64:    { label: "64-Color Ambient", sub: "64 colors, multi-zone", cost: 500, weight: 1.2, power: 12, luxury: 0.15, tech: 0.15, reliability: 0, assembly: 0.7 },
  dynamic:    { label: "Dynamic Lighting", sub: "Animated effects", cost: 900, weight: 1.5, power: 18, luxury: 0.22, tech: 0.25, reliability: -0.01, assembly: 0.9 },
  music_sync: { label: "Music-Synced", sub: "Pulses to audio", cost: 1200, weight: 1.8, power: 22, luxury: 0.28, tech: 0.3, reliability: -0.01, assembly: 1.0 },
  welcome:    { label: "Welcome Animation", sub: "Greeting + farewell show", cost: 1500, weight: 2.0, power: 25, luxury: 0.35, tech: 0.35, reliability: -0.02, assembly: 1.2 },
};

// ---------- 9. Driver Assistance (ADAS) ----------

export type AdasLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const ADAS_LEVELS: Record<AdasLevel, { label: string; sub: string } & ModuleStats> = {
  0: { label: "Level 0 — No Assistance", sub: "No driver aids", cost: 0, weight: 0, power: 0, luxury: 0, tech: 0, reliability: 0, assembly: 0 },
  1: { label: "Level 1 — Cruise Control", sub: "Basic cruise control", cost: 150, weight: 0.5, power: 5, luxury: 0.03, tech: 0.1, reliability: 0.01, assembly: 0.3 },
  2: { label: "Level 2 — Adaptive + Lane", sub: "ACC + lane keep assist", cost: 1800, weight: 2.0, power: 20, luxury: 0.1, tech: 0.3, reliability: -0.01, assembly: 0.8 },
  3: { label: "Level 3 — Highway Pilot", sub: "Hands-off highway driving", cost: 6500, weight: 4.0, power: 45, luxury: 0.2, tech: 0.55, reliability: -0.03, assembly: 1.5 },
  4: { label: "Level 4 — Autonomous", sub: "Self-driving (geofenced)", cost: 18000, weight: 7.0, power: 80, luxury: 0.35, tech: 0.8, reliability: -0.05, assembly: 2.5 },
  5: { label: "Level 5 — Full Self-Driving", sub: "No steering wheel needed", cost: 45000, weight: 12.0, power: 150, luxury: 0.55, tech: 1.0, reliability: -0.08, assembly: 4.0 },
};

// ---------- 10. Parking Systems ----------

export const PARKING_FEATURES: { key: string; label: string; desc: string; cost: number; power: number; tech: number }[] = [
  { key: "rearSensors", label: "Rear Sensors", desc: "Ultrasonic rear", cost: 120, power: 3, tech: 0.03 },
  { key: "frontSensors", label: "Front Sensors", desc: "Ultrasonic front", cost: 120, power: 3, tech: 0.03 },
  { key: "reverseCamera", label: "Reverse Camera", desc: "Rearview camera", cost: 200, power: 5, tech: 0.05 },
  { key: "camera360", label: "360° Camera", desc: "Bird's-eye view", cost: 600, power: 10, tech: 0.1 },
  { key: "autoParking", label: "Auto Parking", desc: "Self-parking", cost: 1200, power: 15, tech: 0.15 },
  { key: "remoteParking", label: "Remote Parking", desc: "Park from outside", cost: 2000, power: 20, tech: 0.2 },
  { key: "smartphoneParking", label: "Smartphone Parking", desc: "Park via app", cost: 2500, power: 20, tech: 0.22 },
];

// ---------- 11. Keys ----------

export type KeyType = "mechanical" | "remote" | "smart" | "phone" | "face" | "fingerprint";

export const KEY_TYPES: Record<KeyType, { label: string; sub: string } & ModuleStats> = {
  mechanical:  { label: "Mechanical Key", sub: "Traditional metal key", cost: 15, weight: 0.1, power: 0, luxury: 0, tech: 0, reliability: 0.02, assembly: 0.1 },
  remote:      { label: "Remote Key", sub: "Key fob with buttons", cost: 80, weight: 0.2, power: 1, luxury: 0.02, tech: 0.05, reliability: 0.01, assembly: 0.2 },
  smart:       { label: "Smart Key", sub: "Keyless entry + start", cost: 250, weight: 0.3, power: 2, luxury: 0.08, tech: 0.15, reliability: 0, assembly: 0.4 },
  phone:       { label: "Phone Key", sub: "Use phone as key", cost: 400, weight: 0.2, power: 2, luxury: 0.12, tech: 0.3, reliability: -0.01, assembly: 0.5 },
  face:        { label: "Face Recognition", sub: "Biometric face unlock", cost: 800, weight: 0.5, power: 4, luxury: 0.2, tech: 0.45, reliability: -0.02, assembly: 0.7 },
  fingerprint: { label: "Fingerprint Unlock", sub: "Biometric fingerprint", cost: 500, weight: 0.3, power: 3, luxury: 0.15, tech: 0.35, reliability: -0.01, assembly: 0.5 },
};

// ---------- 12. Head-Up Display ----------

export type HudType = "none" | "basic" | "color" | "ar";

export const HUD_TYPES: Record<HudType, { label: string; sub: string } & ModuleStats> = {
  none:  { label: "None", sub: "No HUD", cost: 0, weight: 0, power: 0, luxury: 0, tech: 0, reliability: 0, assembly: 0 },
  basic: { label: "Basic HUD", sub: "Speed + RPM projection", cost: 600, weight: 1.0, power: 12, luxury: 0.08, tech: 0.2, reliability: -0.01, assembly: 0.5 },
  color: { label: "Color HUD", sub: "Full-color projection", cost: 1500, weight: 1.5, power: 18, luxury: 0.15, tech: 0.3, reliability: -0.01, assembly: 0.7 },
  ar:    { label: "AR HUD", sub: "Augmented reality navigation", cost: 4500, weight: 2.5, power: 35, luxury: 0.3, tech: 0.6, reliability: -0.03, assembly: 1.2 },
};

// ---------- 13. Interior Materials (Dashboard) ----------

export type DashMaterial = "plastic" | "soft_touch" | "leatherette" | "leather" | "alcantara" | "carbon_fiber" | "wood" | "aluminum" | "titanium" | "crystal";

export const DASH_MATERIALS: Record<DashMaterial, { label: string; sub: string } & ModuleStats> = {
  plastic:      { label: "Plastic", sub: "Hard plastic dash", cost: 50, weight: 3.0, power: 0, luxury: 0.01, tech: 0, reliability: 0.02, assembly: 0.3 },
  soft_touch:   { label: "Soft-Touch", sub: "Soft-touch polymer", cost: 150, weight: 3.5, power: 0, luxury: 0.05, tech: 0, reliability: 0.01, assembly: 0.5 },
  leatherette:  { label: "Leatherette", sub: "Synthetic leather", cost: 350, weight: 4.0, power: 0, luxury: 0.1, tech: 0, reliability: 0.01, assembly: 0.7 },
  leather:      { label: "Leather", sub: "Genuine leather", cost: 900, weight: 4.5, power: 0, luxury: 0.2, tech: 0, reliability: 0, assembly: 1.0 },
  alcantara:    { label: "Alcantara", sub: "Suede-like premium", cost: 1400, weight: 4.0, power: 0, luxury: 0.3, tech: 0.02, reliability: 0, assembly: 1.2 },
  carbon_fiber: { label: "Carbon Fiber", sub: "Exposed carbon weave", cost: 2200, weight: 3.0, power: 0, luxury: 0.35, tech: 0.1, reliability: 0.01, assembly: 1.5 },
  wood:         { label: "Wood", sub: "Real wood veneer", cost: 1200, weight: 5.0, power: 0, luxury: 0.28, tech: 0, reliability: 0, assembly: 1.2 },
  aluminum:     { label: "Aluminum", sub: "Brushed aluminum", cost: 800, weight: 3.5, power: 0, luxury: 0.18, tech: 0.05, reliability: 0.01, assembly: 1.0 },
  titanium:     { label: "Titanium", sub: "Milled titanium accents", cost: 3000, weight: 4.0, power: 0, luxury: 0.4, tech: 0.08, reliability: 0.01, assembly: 1.5 },
  crystal:      { label: "Crystal Accents", sub: "Crystal inlays", cost: 5000, weight: 4.5, power: 0, luxury: 0.5, tech: 0.05, reliability: 0, assembly: 2.0 },
};

// ---------- 14. Roof ----------

export type RoofType = "metal" | "sunroof" | "panoramic" | "electrochromic" | "solar" | "starry";

export const ROOF_TYPES: Record<RoofType, { label: string; sub: string } & ModuleStats> = {
  metal:         { label: "Metal Roof", sub: "Standard metal roof", cost: 0, weight: 0, power: 0, luxury: 0, tech: 0, reliability: 0, assembly: 0 },
  sunroof:       { label: "Sunroof", sub: "Sliding glass panel", cost: 800, weight: 8.0, power: 30, luxury: 0.08, tech: 0.05, reliability: -0.01, assembly: 1.0 },
  panoramic:     { label: "Panoramic", sub: "Full-length glass roof", cost: 2200, weight: 15.0, power: 40, luxury: 0.18, tech: 0.1, reliability: -0.02, assembly: 1.5 },
  electrochromic:{ label: "Electrochromic", sub: "Smart dimming glass", cost: 4500, weight: 16.0, power: 50, luxury: 0.3, tech: 0.3, reliability: -0.03, assembly: 2.0 },
  solar:         { label: "Solar Roof", sub: "Solar panels generate power", cost: 3500, weight: 14.0, power: -200, luxury: 0.2, tech: 0.35, reliability: -0.02, assembly: 2.0 },
  starry:        { label: "Starry Headliner", sub: "Fiber-optic star pattern", cost: 8000, weight: 5.0, power: 15, luxury: 0.5, tech: 0.15, reliability: -0.01, assembly: 2.5 },
};

// ---------- 15. Convenience Features ----------

export const CONVENIENCE_FEATURES: { key: string; label: string; desc: string; cost: number; power: number; luxury: number }[] = [
  { key: "rainSensing", label: "Rain-Sensing Wipers", desc: "Auto wipers", cost: 120, power: 5, luxury: 0.03 },
  { key: "autoHeadlights", label: "Auto Headlights", desc: "Auto on/off", cost: 80, power: 3, luxury: 0.02 },
  { key: "autoDimming", label: "Auto-Dimming Mirrors", desc: "Electrochromic mirrors", cost: 200, power: 5, luxury: 0.05 },
  { key: "powerTailgate", label: "Power Tailgate", desc: "Electric tailgate", cost: 350, power: 20, luxury: 0.06 },
  { key: "handsFreeTailgate", label: "Hands-Free Tailgate", desc: "Kick sensor", cost: 500, power: 20, luxury: 0.08 },
  { key: "softClose", label: "Soft-Close Doors", desc: "Powered door close", cost: 700, power: 15, luxury: 0.1 },
  { key: "vacuumDoors", label: "Vacuum Doors", desc: "Sealed vacuum doors", cost: 1200, power: 20, luxury: 0.15 },
  { key: "poweredFrunk", label: "Powered Frunk", desc: "Electric front trunk", cost: 400, power: 20, luxury: 0.05 },
  { key: "digitalRearView", label: "Digital Rear-View Mirror", desc: "Camera mirror", cost: 450, power: 8, luxury: 0.08 },
];

// ---------- 16. Luxury Package ----------

export const LUXURY_PACKAGE: { key: string; label: string; desc: string; cost: number; weight: number; power: number; luxury: number }[] = [
  { key: "refrigerator", label: "Refrigerator", desc: "Built-in fridge", cost: 3500, weight: 12.0, power: 80, luxury: 0.15 },
  { key: "champagneCooler", label: "Champagne Cooler", desc: "Cooled compartment", cost: 2800, weight: 8.0, power: 50, luxury: 0.12 },
  { key: "coffeeMaker", label: "Coffee Maker", desc: "Built-in espresso", cost: 2200, weight: 6.0, power: 120, luxury: 0.1 },
  { key: "foldOutTables", label: "Fold-Out Tables", desc: "Rear tray tables", cost: 1500, weight: 4.0, power: 0, luxury: 0.08 },
  { key: "rearEntertainment", label: "Rear Entertainment", desc: "Rear screens", cost: 3000, weight: 5.0, power: 40, luxury: 0.12 },
  { key: "individualTablets", label: "Individual Tablets", desc: "Rear tablet docks", cost: 2500, weight: 2.0, power: 20, luxury: 0.1 },
  { key: "wirelessHeadphones", label: "Wireless Headphones", desc: "Rear headphones", cost: 800, weight: 1.0, power: 5, luxury: 0.05 },
  { key: "businessConference", label: "Business Conference Mode", desc: "4G video conferencing", cost: 4000, weight: 3.0, power: 60, luxury: 0.15 },
];

// ---------- 17. AI Features (already mostly in types — extras here) ----------

export const AI_FEATURES: { key: string; label: string; desc: string; cost: number; power: number; tech: number; luxury: number }[] = [
  { key: "voiceAssistant", label: "Voice Assistant", desc: "Natural language control", cost: 300, power: 5, tech: 0.1, luxury: 0.05 },
  { key: "aiRoutePlanning", label: "AI Route Planning", desc: "Predictive navigation", cost: 500, power: 8, tech: 0.12, luxury: 0.05 },
  { key: "moodDetection", label: "Driver Mood Detection", desc: "Adapts to emotions", cost: 800, power: 10, tech: 0.15, luxury: 0.08 },
  { key: "faceRecognition", label: "Face Recognition", desc: "Biometric driver ID", cost: 600, power: 8, tech: 0.12, luxury: 0.06 },
  { key: "healthMonitoring", label: "Health Monitoring", desc: "Vital signs tracking", cost: 1200, power: 12, tech: 0.18, luxury: 0.1 },
  { key: "fatigueDetection", label: "Driver Fatigue Detection", desc: "Drowsiness alerts", cost: 500, power: 8, tech: 0.12, luxury: 0.04 },
  { key: "gestureControl", label: "Gesture Control", desc: "Hand-gesture input", cost: 700, power: 10, tech: 0.15, luxury: 0.08 },
  { key: "cabinPersonalization", label: "Cabin Personalization", desc: "Auto-adjusts to driver", cost: 900, power: 12, tech: 0.18, luxury: 0.1 },
];

// ---------- 18. Safety Electronics ----------

export const SAFETY_ELECTRONICS: { key: string; label: string; desc: string; cost: number; power: number; tech: number; safety: number }[] = [
  { key: "abs", label: "ABS", desc: "Anti-lock brakes", cost: 200, power: 5, tech: 0.05, safety: 0.05 },
  { key: "ebd", label: "EBD", desc: "Electronic brake distribution", cost: 150, power: 3, tech: 0.05, safety: 0.03 },
  { key: "esc", label: "ESC", desc: "Electronic stability control", cost: 300, power: 5, tech: 0.08, safety: 0.08 },
  { key: "tractionControl", label: "Traction Control", desc: "Wheel slip control", cost: 250, power: 5, tech: 0.08, safety: 0.05 },
  { key: "blindSpot", label: "Blind Spot Monitor", desc: "BSM radar", cost: 400, power: 8, tech: 0.1, safety: 0.06 },
  { key: "collisionWarning", label: "Collision Warning", desc: "Forward collision alert", cost: 600, power: 10, tech: 0.12, safety: 0.1 },
  { key: "aeb", label: "Auto Emergency Braking", desc: "AEB", cost: 900, power: 12, tech: 0.15, safety: 0.15 },
  { key: "crossTraffic", label: "Cross Traffic Alert", desc: "Rear cross-traffic", cost: 400, power: 8, tech: 0.1, safety: 0.05 },
  { key: "nightVision", label: "Night Vision Camera", desc: "Thermal night vision", cost: 2500, power: 20, tech: 0.2, safety: 0.08 },
  { key: "thermalCamera", label: "Thermal Camera", desc: "Pedestrian detection", cost: 3000, power: 22, tech: 0.22, safety: 0.1 },
  { key: "driverMonitoring", label: "Driver Monitoring Camera", desc: "Attention tracking", cost: 500, power: 8, tech: 0.12, safety: 0.06 },
];

// ---------- 19. Vehicle Control App (remoteApp already in types) ----------

// ---------- Trim name generation ----------

export interface TrimResult {
  name: string;
  description: string;
  tier: "Essential" | "Comfort" | "Premium" | "Executive" | "Ultra Luxury";
}

export function generateTrimName(score: number): TrimResult {
  if (score < 15) return { name: "Essential", description: "Basic commuter with minimal electronics. Practical and affordable.", tier: "Essential" };
  if (score < 35) return { name: "Comfort", description: "Mid-range family-oriented package with everyday convenience.", tier: "Comfort" };
  if (score < 60) return { name: "Premium", description: "High-end comfort with advanced infotainment and driver assists.", tier: "Premium" };
  if (score < 85) return { name: "Executive", description: "Luxury sedan with rear-seat amenities and premium technology.", tier: "Executive" };
  return { name: "Ultra Luxury", description: "Every available feature enabled. Maximum comfort and technology at the highest cost.", tier: "Ultra Luxury" };
}
