/**
 * ============================================================================
 * WORLD RACETRACK SVG GEOMETRY & CORNER TELEMETRY CATALOG
 * ============================================================================
 * Precision 2D vector path coordinates, sector breakdowns, DRS zone anchors,
 * and corner apex telemetry (Radius, Elevation, Recommended Gear & Speed)
 * for all 23 world circuits.
 * ============================================================================
 */

import { TrackId } from "../../sim/types";

export interface CornerTelemetry {
  number: number;
  name: string;
  type: "chicane" | "hairpin" | "sweeper" | "carousel" | "kink";
  radiusMeters: number;
  gear: number;
  apexSpeedKmh: number;
  lateralG: number;
  elevationMeters: number;
  brakingDistanceMeters: number;
  x: number; // SVG canvas coordinate
  y: number; // SVG canvas coordinate
}

export interface TrackGeometryData {
  id: TrackId;
  name: string;
  country: string;
  svgPathD: string;
  sector1LengthPct: number;
  sector2LengthPct: number;
  sector3LengthPct: number;
  drsZoneAnchors: { startX: number; startY: number; endX: number; endY: number }[];
  speedTrapPoint: { x: number; y: number };
  keyCorners: CornerTelemetry[];
}

export const TRACK_LAYOUT_CATALOG: Record<TrackId, TrackGeometryData> = {
  monza: {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    country: "Italy",
    svgPathD: "M 80 230 L 520 230 C 560 230, 570 190, 530 150 L 410 70 C 380 50, 320 60, 280 110 L 200 170 C 160 200, 110 230, 80 230 Z",
    sector1LengthPct: 0.35,
    sector2LengthPct: 0.38,
    sector3LengthPct: 0.27,
    drsZoneAnchors: [
      { startX: 120, startY: 230, endX: 480, endY: 230 },
      { startX: 380, startY: 90, endX: 300, endY: 130 },
    ],
    speedTrapPoint: { x: 500, y: 230 },
    keyCorners: [
      { number: 1, name: "Variante del Rettifilo", type: "chicane", radiusMeters: 25, gear: 2, apexSpeedKmh: 75, lateralG: 1.4, elevationMeters: 180, brakingDistanceMeters: 140, x: 530, y: 210 },
      { number: 4, name: "Variante della Roggia", type: "chicane", radiusMeters: 35, gear: 3, apexSpeedKmh: 110, lateralG: 1.6, elevationMeters: 183, brakingDistanceMeters: 90, x: 410, y: 70 },
      { number: 8, name: "Variante Ascari", type: "sweeper", radiusMeters: 85, gear: 4, apexSpeedKmh: 210, lateralG: 2.8, elevationMeters: 181, brakingDistanceMeters: 75, x: 280, y: 110 },
      { number: 11, name: "Curva Parabolica (Alboreto)", type: "sweeper", radiusMeters: 140, gear: 5, apexSpeedKmh: 245, lateralG: 3.2, elevationMeters: 179, brakingDistanceMeters: 60, x: 120, y: 200 },
    ],
  },

  spa: {
    id: "spa",
    name: "Circuit de Spa-Francorchamps",
    country: "Belgium",
    svgPathD: "M 80 220 L 240 220 C 280 220, 310 170, 290 120 C 270 70, 350 40, 450 60 C 530 80, 550 140, 510 180 C 460 220, 380 210, 310 210 L 80 220 Z",
    sector1LengthPct: 0.30,
    sector2LengthPct: 0.44,
    sector3LengthPct: 0.26,
    drsZoneAnchors: [
      { startX: 300, startY: 100, endX: 420, endY: 55 },
      { startX: 100, startY: 220, endX: 220, endY: 220 },
    ],
    speedTrapPoint: { x: 440, y: 60 },
    keyCorners: [
      { number: 1, name: "La Source Hairpin", type: "hairpin", radiusMeters: 18, gear: 1, apexSpeedKmh: 65, lateralG: 1.3, elevationMeters: 395, brakingDistanceMeters: 130, x: 90, y: 220 },
      { number: 3, name: "Eau Rouge / Raidillon", type: "sweeper", radiusMeters: 180, gear: 7, apexSpeedKmh: 305, lateralG: 4.1, elevationMeters: 440, brakingDistanceMeters: 0, x: 290, y: 120 },
      { number: 10, name: "Pouhon (Double Apex)", type: "sweeper", radiusMeters: 110, gear: 6, apexSpeedKmh: 270, lateralG: 4.5, elevationMeters: 380, brakingDistanceMeters: 45, x: 450, y: 60 },
      { number: 18, name: "Blanchimont", type: "kink", radiusMeters: 220, gear: 8, apexSpeedKmh: 320, lateralG: 4.8, elevationMeters: 405, brakingDistanceMeters: 0, x: 510, y: 180 },
      { number: 19, name: "Bus Stop Chicane", type: "chicane", radiusMeters: 22, gear: 2, apexSpeedKmh: 75, lateralG: 1.5, elevationMeters: 398, brakingDistanceMeters: 145, x: 310, y: 210 },
    ],
  },

  silverstone: {
    id: "silverstone",
    name: "Silverstone GP Circuit",
    country: "UK",
    svgPathD: "M 100 240 L 220 240 C 260 240, 280 200, 260 160 C 240 120, 320 80, 420 80 C 490 80, 520 130, 480 180 C 440 220, 360 230, 280 230 L 100 240 Z",
    sector1LengthPct: 0.31,
    sector2LengthPct: 0.40,
    sector3LengthPct: 0.29,
    drsZoneAnchors: [
      { startX: 280, startY: 140, endX: 380, endY: 85 },
      { startX: 460, startY: 190, endX: 320, endY: 230 },
    ],
    speedTrapPoint: { x: 400, y: 80 },
    keyCorners: [
      { number: 1, name: "Copse Corner", type: "sweeper", radiusMeters: 160, gear: 7, apexSpeedKmh: 290, lateralG: 4.9, elevationMeters: 152, brakingDistanceMeters: 25, x: 260, y: 160 },
      { number: 3, name: "Maggotts & Becketts", type: "chicane", radiusMeters: 120, gear: 6, apexSpeedKmh: 260, lateralG: 4.7, elevationMeters: 150, brakingDistanceMeters: 35, x: 320, y: 80 },
      { number: 9, name: "Stowe Corner", type: "sweeper", radiusMeters: 95, gear: 5, apexSpeedKmh: 205, lateralG: 3.4, elevationMeters: 154, brakingDistanceMeters: 95, x: 480, y: 180 },
      { number: 15, name: "Vale & Club", type: "chicane", radiusMeters: 30, gear: 2, apexSpeedKmh: 85, lateralG: 1.6, elevationMeters: 151, brakingDistanceMeters: 110, x: 280, y: 230 },
    ],
  },

  suzuka: {
    id: "suzuka",
    name: "Suzuka International Racing Course",
    country: "Japan",
    svgPathD: "M 80 210 Q 180 200, 260 140 T 420 100 T 520 180 T 360 230 T 200 160 Z",
    sector1LengthPct: 0.33,
    sector2LengthPct: 0.39,
    sector3LengthPct: 0.28,
    drsZoneAnchors: [
      { startX: 100, startY: 210, endX: 220, endY: 180 },
    ],
    speedTrapPoint: { x: 480, y: 140 },
    keyCorners: [
      { number: 1, name: "First Corner (S Curves)", type: "sweeper", radiusMeters: 110, gear: 5, apexSpeedKmh: 230, lateralG: 3.8, elevationMeters: 45, brakingDistanceMeters: 50, x: 260, y: 140 },
      { number: 8, name: "Degner Curves", type: "chicane", radiusMeters: 45, gear: 3, apexSpeedKmh: 145, lateralG: 2.2, elevationMeters: 52, brakingDistanceMeters: 80, x: 420, y: 100 },
      { number: 11, name: "Hairpin (Turn 11)", type: "hairpin", radiusMeters: 19, gear: 1, apexSpeedKmh: 68, lateralG: 1.4, elevationMeters: 38, brakingDistanceMeters: 135, x: 520, y: 180 },
      { number: 15, name: "130R", type: "sweeper", radiusMeters: 175, gear: 7, apexSpeedKmh: 305, lateralG: 4.6, elevationMeters: 48, brakingDistanceMeters: 20, x: 360, y: 230 },
    ],
  },

  nurburgring: {
    id: "nurburgring",
    name: "Nürburgring GP-Strecke",
    country: "Germany",
    svgPathD: "M 90 220 L 260 220 C 300 220, 310 170, 280 130 C 250 80, 340 50, 460 70 C 530 90, 540 160, 480 200 L 260 220 Z",
    sector1LengthPct: 0.32,
    sector2LengthPct: 0.38,
    sector3LengthPct: 0.30,
    drsZoneAnchors: [
      { startX: 110, startY: 220, endX: 240, endY: 220 },
      { startX: 380, startY: 60, endX: 480, endY: 100 },
    ],
    speedTrapPoint: { x: 500, y: 180 },
    keyCorners: [
      { number: 1, name: "Yokohama ACI Hairpin", type: "hairpin", radiusMeters: 22, gear: 1, apexSpeedKmh: 72, lateralG: 1.4, elevationMeters: 620, brakingDistanceMeters: 125, x: 280, y: 130 },
      { number: 5, name: "Müllenbach Kurve", type: "sweeper", radiusMeters: 65, gear: 3, apexSpeedKmh: 135, lateralG: 2.1, elevationMeters: 605, brakingDistanceMeters: 85, x: 340, y: 50 },
      { number: 10, name: "NGK Chicane", type: "chicane", radiusMeters: 28, gear: 2, apexSpeedKmh: 85, lateralG: 1.6, elevationMeters: 615, brakingDistanceMeters: 115, x: 480, y: 200 },
    ],
  },

  nordschleife: {
    id: "nordschleife",
    name: "Nürburgring Nordschleife (Green Hell)",
    country: "Germany",
    svgPathD: "M 80 200 C 120 140, 180 80, 280 60 C 380 40, 480 60, 540 120 C 580 180, 500 240, 400 250 C 300 260, 180 240, 100 220 Z",
    sector1LengthPct: 0.33,
    sector2LengthPct: 0.33,
    sector3LengthPct: 0.34,
    drsZoneAnchors: [
      { startX: 120, startY: 220, endX: 360, endY: 250 },
    ],
    speedTrapPoint: { x: 300, y: 250 },
    keyCorners: [
      { number: 12, name: "Flugplatz (Jump Crest)", type: "kink", radiusMeters: 190, gear: 6, apexSpeedKmh: 265, lateralG: 3.4, elevationMeters: 580, brakingDistanceMeters: 0, x: 180, y: 80 },
      { number: 28, name: "Fuchsrohr (Foxhole Compression)", type: "sweeper", radiusMeters: 150, gear: 7, apexSpeedKmh: 295, lateralG: 4.8, elevationMeters: 420, brakingDistanceMeters: 30, x: 280, y: 60 },
      { number: 45, name: "Karussell (Banked Concrete Bowl)", type: "carousel", radiusMeters: 32, gear: 2, apexSpeedKmh: 105, lateralG: 2.9, elevationMeters: 540, brakingDistanceMeters: 90, x: 480, y: 60 },
      { number: 68, name: "Pflanzgarten & Bellof-S", type: "chicane", radiusMeters: 80, gear: 5, apexSpeedKmh: 220, lateralG: 3.5, elevationMeters: 510, brakingDistanceMeters: 40, x: 540, y: 120 },
      { number: 73, name: "Döttinger Höhe Straight", type: "kink", radiusMeters: 500, gear: 8, apexSpeedKmh: 345, lateralG: 0.8, elevationMeters: 620, brakingDistanceMeters: 0, x: 300, y: 250 },
    ],
  },

  lemans: {
    id: "lemans",
    name: "Circuit de la Sarthe (Le Mans)",
    country: "France",
    svgPathD: "M 80 230 L 520 230 L 550 150 L 480 80 L 300 80 L 160 140 Z",
    sector1LengthPct: 0.28,
    sector2LengthPct: 0.44,
    sector3LengthPct: 0.28,
    drsZoneAnchors: [
      { startX: 120, startY: 230, endX: 480, endY: 230 },
    ],
    speedTrapPoint: { x: 520, y: 230 },
    keyCorners: [
      { number: 1, name: "Dunlop Chicane & Bridge", type: "chicane", radiusMeters: 42, gear: 3, apexSpeedKmh: 135, lateralG: 2.1, elevationMeters: 65, brakingDistanceMeters: 100, x: 160, y: 140 },
      { number: 4, name: "Mulsanne Chicane 1", type: "chicane", radiusMeters: 30, gear: 2, apexSpeedKmh: 90, lateralG: 1.7, elevationMeters: 45, brakingDistanceMeters: 160, x: 300, y: 80 },
      { number: 8, name: "Mulsanne Corner", type: "hairpin", radiusMeters: 20, gear: 1, apexSpeedKmh: 68, lateralG: 1.4, elevationMeters: 42, brakingDistanceMeters: 180, x: 550, y: 150 },
      { number: 12, name: "Porsche Curves", type: "sweeper", radiusMeters: 130, gear: 6, apexSpeedKmh: 245, lateralG: 4.2, elevationMeters: 55, brakingDistanceMeters: 35, x: 480, y: 80 },
    ],
  },

  laguna: {
    id: "laguna",
    name: "WeatherTech Raceway Laguna Seca",
    country: "USA",
    svgPathD: "M 90 220 C 130 220, 180 180, 240 140 C 300 100, 360 60, 440 80 C 500 100, 480 160, 420 180 C 360 200, 260 220, 90 220 Z",
    sector1LengthPct: 0.32,
    sector2LengthPct: 0.38,
    sector3LengthPct: 0.30,
    drsZoneAnchors: [
      { startX: 100, startY: 220, endX: 220, endY: 150 },
    ],
    speedTrapPoint: { x: 240, y: 140 },
    keyCorners: [
      { number: 2, name: "Andretti Hairpin", type: "hairpin", radiusMeters: 22, gear: 2, apexSpeedKmh: 78, lateralG: 1.5, elevationMeters: 260, brakingDistanceMeters: 120, x: 240, y: 140 },
      { number: 8, name: "The Corkscrew (Turn 8/8A)", type: "chicane", radiusMeters: 16, gear: 2, apexSpeedKmh: 72, lateralG: 2.8, elevationMeters: 310, brakingDistanceMeters: 90, x: 440, y: 80 },
      { number: 9, name: "Rainey Curve", type: "sweeper", radiusMeters: 75, gear: 4, apexSpeedKmh: 175, lateralG: 3.1, elevationMeters: 275, brakingDistanceMeters: 45, x: 420, y: 180 },
    ],
  },

  monaco: {
    id: "monaco",
    name: "Circuit de Monaco",
    country: "Monaco",
    svgPathD: "M 90 220 L 220 220 C 260 220, 270 190, 250 160 C 230 130, 280 90, 360 80 C 440 70, 520 90, 500 130 C 480 170, 440 180, 410 190 C 370 200, 310 200, 260 210 L 90 220 Z",
    sector1LengthPct: 0.30,
    sector2LengthPct: 0.42,
    sector3LengthPct: 0.28,
    drsZoneAnchors: [
      { startX: 110, startY: 220, endX: 200, endY: 220 },
    ],
    speedTrapPoint: { x: 360, y: 80 },
    keyCorners: [
      { number: 1, name: "Sainte Dévote", type: "chicane", radiusMeters: 22, gear: 2, apexSpeedKmh: 85, lateralG: 1.6, elevationMeters: 12, brakingDistanceMeters: 90, x: 250, y: 160 },
      { number: 4, name: "Casino Square", type: "sweeper", radiusMeters: 45, gear: 3, apexSpeedKmh: 125, lateralG: 2.1, elevationMeters: 42, brakingDistanceMeters: 60, x: 360, y: 80 },
      { number: 6, name: "Grand Hotel Hairpin (Fairmont)", type: "hairpin", radiusMeters: 11, gear: 1, apexSpeedKmh: 48, lateralG: 1.1, elevationMeters: 25, brakingDistanceMeters: 80, x: 520, y: 90 },
      { number: 10, name: "Nouvelle Chicane (Harbour)", type: "chicane", radiusMeters: 20, gear: 2, apexSpeedKmh: 70, lateralG: 1.4, elevationMeters: 2, brakingDistanceMeters: 130, x: 480, y: 170 },
      { number: 15, name: "Piscine (Swimming Pool)", type: "chicane", radiusMeters: 55, gear: 4, apexSpeedKmh: 195, lateralG: 3.4, elevationMeters: 3, brakingDistanceMeters: 40, x: 410, y: 190 },
    ],
  },

  interlagos: {
    id: "interlagos",
    name: "Autódromo José Carlos Pace (Interlagos)",
    country: "Brazil",
    svgPathD: "M 100 230 C 150 230, 200 170, 260 120 C 320 70, 420 60, 480 110 C 520 160, 440 220, 360 220 L 100 230 Z",
    sector1LengthPct: 0.32,
    sector2LengthPct: 0.40,
    sector3LengthPct: 0.28,
    drsZoneAnchors: [
      { startX: 120, startY: 230, endX: 240, endY: 140 },
      { startX: 380, startY: 220, endX: 140, endY: 230 },
    ],
    speedTrapPoint: { x: 260, y: 120 },
    keyCorners: [
      { number: 1, name: "Senna S (Turns 1 & 2)", type: "chicane", radiusMeters: 32, gear: 2, apexSpeedKmh: 105, lateralG: 2.2, elevationMeters: 780, brakingDistanceMeters: 110, x: 260, y: 120 },
      { number: 6, name: "Ferradura (Horseshoe)", type: "sweeper", radiusMeters: 60, gear: 4, apexSpeedKmh: 170, lateralG: 2.8, elevationMeters: 770, brakingDistanceMeters: 70, x: 480, y: 110 },
      { number: 10, name: "Bico de Pato (Duck Bill)", type: "hairpin", radiusMeters: 16, gear: 1, apexSpeedKmh: 65, lateralG: 1.3, elevationMeters: 760, brakingDistanceMeters: 90, x: 440, y: 220 },
      { number: 15, name: "Junção & Reta Oposta", type: "sweeper", radiusMeters: 90, gear: 4, apexSpeedKmh: 195, lateralG: 3.1, elevationMeters: 775, brakingDistanceMeters: 40, x: 360, y: 220 },
    ],
  },

  bathurst: {
    id: "bathurst",
    name: "Mount Panorama Circuit (Bathurst)",
    country: "Australia",
    svgPathD: "M 80 230 L 380 230 L 460 170 L 420 80 L 260 80 L 160 160 Z",
    sector1LengthPct: 0.33,
    sector2LengthPct: 0.35,
    sector3LengthPct: 0.32,
    drsZoneAnchors: [
      { startX: 100, startY: 230, endX: 360, endY: 230 },
    ],
    speedTrapPoint: { x: 380, y: 230 },
    keyCorners: [
      { number: 1, name: "Hell Corner", type: "chicane", radiusMeters: 28, gear: 2, apexSpeedKmh: 95, lateralG: 1.8, elevationMeters: 670, brakingDistanceMeters: 120, x: 160, y: 160 },
      { number: 4, name: "The Cutting", type: "hairpin", radiusMeters: 18, gear: 2, apexSpeedKmh: 75, lateralG: 1.6, elevationMeters: 720, brakingDistanceMeters: 100, x: 260, y: 80 },
      { number: 10, name: "Skyline & The Dipper", type: "sweeper", radiusMeters: 25, gear: 3, apexSpeedKmh: 120, lateralG: 3.5, elevationMeters: 860, brakingDistanceMeters: 85, x: 420, y: 80 },
      { number: 18, name: "The Chase (Conrod Straight)", type: "chicane", radiusMeters: 120, gear: 6, apexSpeedKmh: 240, lateralG: 3.8, elevationMeters: 680, brakingDistanceMeters: 110, x: 460, y: 170 },
    ],
  },

  imola: {
    id: "imola",
    name: "Autodromo Enzo e Dino Ferrari (Imola)",
    country: "Italy",
    svgPathD: "M 90 220 L 320 220 C 370 220, 390 170, 360 120 C 330 70, 420 50, 500 80 C 550 110, 530 180, 460 210 Z",
    sector1LengthPct: 0.32,
    sector2LengthPct: 0.38,
    sector3LengthPct: 0.30,
    drsZoneAnchors: [
      { startX: 110, startY: 220, endX: 300, endY: 220 },
    ],
    speedTrapPoint: { x: 320, y: 220 },
    keyCorners: [
      { number: 2, name: "Tamburello Chicane", type: "chicane", radiusMeters: 38, gear: 3, apexSpeedKmh: 135, lateralG: 2.2, elevationMeters: 45, brakingDistanceMeters: 90, x: 360, y: 120 },
      { number: 7, name: "Tosa Corner", type: "hairpin", radiusMeters: 20, gear: 2, apexSpeedKmh: 80, lateralG: 1.5, elevationMeters: 62, brakingDistanceMeters: 110, x: 420, y: 50 },
      { number: 9, name: "Piratella", type: "sweeper", radiusMeters: 75, gear: 4, apexSpeedKmh: 195, lateralG: 3.2, elevationMeters: 71, brakingDistanceMeters: 40, x: 500, y: 80 },
      { number: 11, name: "Acque Minerali", type: "sweeper", radiusMeters: 45, gear: 3, apexSpeedKmh: 145, lateralG: 2.8, elevationMeters: 38, brakingDistanceMeters: 75, x: 530, y: 180 },
      { number: 14, name: "Variante Alta", type: "chicane", radiusMeters: 22, gear: 2, apexSpeedKmh: 85, lateralG: 1.6, elevationMeters: 65, brakingDistanceMeters: 95, x: 460, y: 210 },
    ],
  },

  redbullring: {
    id: "redbullring",
    name: "Red Bull Ring",
    country: "Austria",
    svgPathD: "M 100 230 L 480 230 C 520 230, 530 180, 480 130 L 320 80 C 280 60, 220 100, 200 150 L 100 230 Z",
    sector1LengthPct: 0.33,
    sector2LengthPct: 0.37,
    sector3LengthPct: 0.30,
    drsZoneAnchors: [
      { startX: 120, startY: 230, endX: 460, endY: 230 },
      { startX: 460, startY: 130, endX: 340, endY: 85 },
    ],
    speedTrapPoint: { x: 480, y: 230 },
    keyCorners: [
      { number: 1, name: "Niki Lauda Kurve (Turn 1)", type: "sweeper", radiusMeters: 45, gear: 3, apexSpeedKmh: 145, lateralG: 2.5, elevationMeters: 675, brakingDistanceMeters: 95, x: 480, y: 230 },
      { number: 3, name: "Remus Hairpin (Turn 3)", type: "hairpin", radiusMeters: 17, gear: 1, apexSpeedKmh: 68, lateralG: 1.4, elevationMeters: 735, brakingDistanceMeters: 145, x: 320, y: 80 },
      { number: 9, name: "Rindt Kurve (Turn 9)", type: "sweeper", radiusMeters: 80, gear: 5, apexSpeedKmh: 215, lateralG: 3.6, elevationMeters: 680, brakingDistanceMeters: 50, x: 200, y: 150 },
    ],
  },

  hungaroring: {
    id: "hungaroring",
    name: "Hungaroring",
    country: "Hungary",
    svgPathD: "M 90 220 L 320 220 C 360 220, 380 180, 350 140 C 310 90, 380 60, 460 80 C 520 110, 500 180, 440 210 Z",
    sector1LengthPct: 0.31,
    sector2LengthPct: 0.42,
    sector3LengthPct: 0.27,
    drsZoneAnchors: [
      { startX: 110, startY: 220, endX: 300, endY: 220 },
    ],
    speedTrapPoint: { x: 320, y: 220 },
    keyCorners: [
      { number: 1, name: "Turn 1 Heavy Braking", type: "hairpin", radiusMeters: 24, gear: 2, apexSpeedKmh: 88, lateralG: 1.7, elevationMeters: 220, brakingDistanceMeters: 135, x: 350, y: 140 },
      { number: 4, name: "Mansell Corner (Turn 4)", type: "sweeper", radiusMeters: 110, gear: 5, apexSpeedKmh: 230, lateralG: 3.8, elevationMeters: 245, brakingDistanceMeters: 30, x: 380, y: 60 },
      { number: 14, name: "Final Sweeper (Turn 14)", type: "sweeper", radiusMeters: 70, gear: 4, apexSpeedKmh: 175, lateralG: 2.9, elevationMeters: 225, brakingDistanceMeters: 60, x: 440, y: 210 },
    ],
  },

  zandvoort: {
    id: "zandvoort",
    name: "Circuit Zandvoort",
    country: "Netherlands",
    svgPathD: "M 90 220 L 300 220 C 350 220, 380 170, 350 110 C 310 60, 400 50, 480 80 C 530 120, 500 190, 420 220 Z",
    sector1LengthPct: 0.33,
    sector2LengthPct: 0.38,
    sector3LengthPct: 0.29,
    drsZoneAnchors: [
      { startX: 420, startY: 220, endX: 280, endY: 220 },
    ],
    speedTrapPoint: { x: 300, y: 220 },
    keyCorners: [
      { number: 1, name: "Tarzan Corner (Tarzanbocht)", type: "hairpin", radiusMeters: 26, gear: 2, apexSpeedKmh: 92, lateralG: 1.9, elevationMeters: 8, brakingDistanceMeters: 125, x: 350, y: 110 },
      { number: 3, name: "Hugenholtzbocht (18° Banked)", type: "carousel", radiusMeters: 28, gear: 3, apexSpeedKmh: 120, lateralG: 3.2, elevationMeters: 14, brakingDistanceMeters: 70, x: 310, y: 60 },
      { number: 14, name: "Arie Luyendykbocht (18° Banked)", type: "sweeper", radiusMeters: 160, gear: 7, apexSpeedKmh: 280, lateralG: 4.1, elevationMeters: 10, brakingDistanceMeters: 0, x: 420, y: 220 },
    ],
  },

  americas: {
    id: "americas",
    name: "Circuit of the Americas (COTA)",
    country: "USA",
    svgPathD: "M 90 230 L 260 140 L 360 80 L 460 100 L 520 170 L 420 230 Z",
    sector1LengthPct: 0.33,
    sector2LengthPct: 0.38,
    sector3LengthPct: 0.29,
    drsZoneAnchors: [
      { startX: 360, startY: 80, endX: 450, endY: 95 },
    ],
    speedTrapPoint: { x: 460, y: 100 },
    keyCorners: [
      { number: 1, name: "Turn 1 (30m Uphill Blind Apex)", type: "hairpin", radiusMeters: 22, gear: 2, apexSpeedKmh: 80, lateralG: 1.6, elevationMeters: 185, brakingDistanceMeters: 120, x: 260, y: 140 },
      { number: 3, name: "Esess Complex (Turns 3-6)", type: "chicane", radiusMeters: 95, gear: 5, apexSpeedKmh: 245, lateralG: 4.5, elevationMeters: 165, brakingDistanceMeters: 30, x: 360, y: 80 },
      { number: 11, name: "Hairpin (Turn 11)", type: "hairpin", radiusMeters: 18, gear: 1, apexSpeedKmh: 68, lateralG: 1.4, elevationMeters: 152, brakingDistanceMeters: 150, x: 520, y: 170 },
      { number: 16, name: "Multi-Apex Carousel (Turns 16-18)", type: "carousel", radiusMeters: 120, gear: 6, apexSpeedKmh: 255, lateralG: 4.6, elevationMeters: 158, brakingDistanceMeters: 20, x: 420, y: 230 },
    ],
  },

  miami: {
    id: "miami",
    name: "Miami International Autodrome",
    country: "USA",
    svgPathD: "M 90 220 L 320 220 L 480 180 L 520 100 L 360 80 L 220 140 Z",
    sector1LengthPct: 0.31,
    sector2LengthPct: 0.39,
    sector3LengthPct: 0.30,
    drsZoneAnchors: [
      { startX: 110, startY: 220, endX: 300, endY: 220 },
      { startX: 500, startY: 110, endX: 380, endY: 85 },
    ],
    speedTrapPoint: { x: 320, y: 220 },
    keyCorners: [
      { number: 1, name: "Turn 1 Right-Hander", type: "sweeper", radiusMeters: 35, gear: 3, apexSpeedKmh: 115, lateralG: 2.0, elevationMeters: 4, brakingDistanceMeters: 110, x: 320, y: 220 },
      { number: 14, name: "Mistress Chicane (Turns 14/15)", type: "chicane", radiusMeters: 15, gear: 1, apexSpeedKmh: 55, lateralG: 1.2, elevationMeters: 8, brakingDistanceMeters: 130, x: 520, y: 100 },
      { number: 17, name: "Hairpin to Main Straight", type: "hairpin", radiusMeters: 20, gear: 2, apexSpeedKmh: 75, lateralG: 1.5, elevationMeters: 4, brakingDistanceMeters: 140, x: 360, y: 80 },
    ],
  },

  vegas: {
    id: "vegas",
    name: "Las Vegas Strip Circuit",
    country: "USA",
    svgPathD: "M 90 230 L 480 230 L 540 140 L 420 80 L 260 80 L 160 160 Z",
    sector1LengthPct: 0.30,
    sector2LengthPct: 0.45,
    sector3LengthPct: 0.25,
    drsZoneAnchors: [
      { startX: 110, startY: 230, endX: 450, endY: 230 },
      { startX: 400, startY: 80, endX: 280, endY: 80 },
    ],
    speedTrapPoint: { x: 480, y: 230 },
    keyCorners: [
      { number: 1, name: "Harmon Corner (Turn 1)", type: "chicane", radiusMeters: 28, gear: 2, apexSpeedKmh: 88, lateralG: 1.6, elevationMeters: 610, brakingDistanceMeters: 130, x: 160, y: 160 },
      { number: 12, name: "Las Vegas Boulevard Strip Drag", type: "kink", radiusMeters: 450, gear: 8, apexSpeedKmh: 350, lateralG: 0.6, elevationMeters: 625, brakingDistanceMeters: 0, x: 480, y: 230 },
      { number: 14, name: "MSG Sphere Complex", type: "sweeper", radiusMeters: 55, gear: 3, apexSpeedKmh: 135, lateralG: 2.2, elevationMeters: 618, brakingDistanceMeters: 80, x: 540, y: 140 },
    ],
  },

  fuji: {
    id: "fuji",
    name: "Fuji Speedway",
    country: "Japan",
    svgPathD: "M 90 230 L 500 230 C 550 230, 540 170, 480 130 L 360 80 L 240 120 Z",
    sector1LengthPct: 0.38,
    sector2LengthPct: 0.32,
    sector3LengthPct: 0.30,
    drsZoneAnchors: [
      { startX: 110, startY: 230, endX: 480, endY: 230 },
    ],
    speedTrapPoint: { x: 500, y: 230 },
    keyCorners: [
      { number: 1, name: "TGR Corner (First Corner)", type: "hairpin", radiusMeters: 22, gear: 2, apexSpeedKmh: 80, lateralG: 1.5, elevationMeters: 580, brakingDistanceMeters: 160, x: 500, y: 230 },
      { number: 6, name: "100R Sweeper", type: "sweeper", radiusMeters: 100, gear: 5, apexSpeedKmh: 215, lateralG: 3.4, elevationMeters: 595, brakingDistanceMeters: 40, x: 480, y: 130 },
      { number: 15, name: "Panasonic Corner", type: "hairpin", radiusMeters: 25, gear: 2, apexSpeedKmh: 85, lateralG: 1.6, elevationMeters: 575, brakingDistanceMeters: 100, x: 240, y: 120 },
    ],
  },

  sebring: {
    id: "sebring",
    name: "Sebring International Raceway",
    country: "USA",
    svgPathD: "M 90 220 L 460 220 L 520 150 L 420 80 L 260 80 L 160 150 Z",
    sector1LengthPct: 0.32,
    sector2LengthPct: 0.38,
    sector3LengthPct: 0.30,
    drsZoneAnchors: [
      { startX: 110, startY: 220, endX: 440, endY: 220 },
    ],
    speedTrapPoint: { x: 460, y: 220 },
    keyCorners: [
      { number: 1, name: "Turn 1 Bumpy Fast Left", type: "sweeper", radiusMeters: 110, gear: 5, apexSpeedKmh: 220, lateralG: 3.5, elevationMeters: 18, brakingDistanceMeters: 50, x: 160, y: 150 },
      { number: 7, name: "Hairpin (Turn 7)", type: "hairpin", radiusMeters: 19, gear: 1, apexSpeedKmh: 68, lateralG: 1.4, elevationMeters: 19, brakingDistanceMeters: 135, x: 420, y: 80 },
      { number: 17, name: "Sunset Bend (Concrete Bumps)", type: "sweeper", radiusMeters: 85, gear: 4, apexSpeedKmh: 185, lateralG: 3.1, elevationMeters: 17, brakingDistanceMeters: 75, x: 520, y: 150 },
    ],
  },

  watkins: {
    id: "watkins",
    name: "Watkins Glen International",
    country: "USA",
    svgPathD: "M 90 220 L 360 220 C 420 220, 440 180, 410 130 L 320 70 L 220 110 Z",
    sector1LengthPct: 0.34,
    sector2LengthPct: 0.36,
    sector3LengthPct: 0.30,
    drsZoneAnchors: [
      { startX: 110, startY: 220, endX: 340, endY: 220 },
    ],
    speedTrapPoint: { x: 360, y: 220 },
    keyCorners: [
      { number: 1, name: "The Ninety (Turn 1)", type: "chicane", radiusMeters: 38, gear: 3, apexSpeedKmh: 125, lateralG: 2.1, elevationMeters: 140, brakingDistanceMeters: 110, x: 360, y: 220 },
      { number: 5, name: "The Bus Stop Inner Loop", type: "chicane", radiusMeters: 32, gear: 3, apexSpeedKmh: 140, lateralG: 2.5, elevationMeters: 165, brakingDistanceMeters: 85, x: 320, y: 70 },
      { number: 7, name: "The Toe (Turn 7)", type: "sweeper", radiusMeters: 60, gear: 3, apexSpeedKmh: 145, lateralG: 2.8, elevationMeters: 125, brakingDistanceMeters: 70, x: 410, y: 130 },
    ],
  },

  roadatlanta: {
    id: "roadatlanta",
    name: "Michelin Raceway Road Atlanta",
    country: "USA",
    svgPathD: "M 90 230 L 460 230 L 520 160 L 380 70 L 240 110 Z",
    sector1LengthPct: 0.33,
    sector2LengthPct: 0.37,
    sector3LengthPct: 0.30,
    drsZoneAnchors: [
      { startX: 110, startY: 230, endX: 440, endY: 230 },
    ],
    speedTrapPoint: { x: 460, y: 230 },
    keyCorners: [
      { number: 1, name: "Turn 1 Fast Uphill", type: "sweeper", radiusMeters: 120, gear: 6, apexSpeedKmh: 245, lateralG: 3.9, elevationMeters: 280, brakingDistanceMeters: 35, x: 240, y: 110 },
      { number: 5, name: "Esses Complex (Turn 3-5)", type: "chicane", radiusMeters: 90, gear: 5, apexSpeedKmh: 220, lateralG: 4.1, elevationMeters: 295, brakingDistanceMeters: 30, x: 380, y: 70 },
      { number: 10, name: "Turn 10A/10B Chicane", type: "chicane", radiusMeters: 24, gear: 2, apexSpeedKmh: 82, lateralG: 1.6, elevationMeters: 265, brakingDistanceMeters: 145, x: 520, y: 160 },
    ],
  },

  dragstrip: {
    id: "dragstrip",
    name: "NHRA 1/4-Mile Dragstrip",
    country: "USA",
    svgPathD: "M 80 150 L 520 150",
    sector1LengthPct: 0.25,
    sector2LengthPct: 0.35,
    sector3LengthPct: 0.40,
    drsZoneAnchors: [
      { startX: 80, startY: 150, endX: 520, endY: 150 },
    ],
    speedTrapPoint: { x: 520, y: 150 },
    keyCorners: [
      { number: 1, name: "Launch Burnout Box", type: "kink", radiusMeters: 999, gear: 1, apexSpeedKmh: 0, lateralG: 0.0, elevationMeters: 10, brakingDistanceMeters: 0, x: 80, y: 150 },
      { number: 2, name: "60-Foot Mark", type: "kink", radiusMeters: 999, gear: 1, apexSpeedKmh: 110, lateralG: 0.0, elevationMeters: 10, brakingDistanceMeters: 0, x: 190, y: 150 },
      { number: 3, name: "1/8-Mile Trap", type: "kink", radiusMeters: 999, gear: 4, apexSpeedKmh: 240, lateralG: 0.0, elevationMeters: 10, brakingDistanceMeters: 0, x: 340, y: 150 },
      { number: 4, name: "1/4-Mile Finish Trap", type: "kink", radiusMeters: 999, gear: 6, apexSpeedKmh: 330, lateralG: 0.0, elevationMeters: 10, brakingDistanceMeters: 400, x: 520, y: 150 },
    ],
  },
};
