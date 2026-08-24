// ============================================================================
// RACE ENGINEERING SUITE — CIRCUIT DATABASE
// ============================================================================
// Complete world circuit layouts with corner analysis, sector splits,
// DRS zones, elevation profiles, and overtaking difficulty ratings.
// ============================================================================

export interface CornerData {
  name: string;
  number: number;
  type: 'slow' | 'medium' | 'fast' | 'very_fast' | 'hairpin' | 'chicane';
  entrySpeed: number;
  apexSpeed: number;
  exitSpeed: number;
  radius: number;
  camber: number;
  drsActivation: boolean;
  overtakingDifficulty: number;
}

export interface SectorData {
  index: number;
  length: number;
  numCorners: number;
  topSpeed: number;
  avgSpeed: number;
  elevationGain: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DRSZone {
  id: string;
  name: string;
  detectionLineDistance: number;
  activationLineDistance: number;
  deactivationLineDistance: number;
  length: number;
}

export interface TrackLayout {
  id: string;
  name: string;
  country: string;
  city: string;
  length: number;
  lapRecord: string;
  lapRecordHolder: string;
  lapRecordYear: number;
  totalLaps: number;
  direction: 'clockwise' | 'counterclockwise';
  turns: number;
  sectors: SectorData[];
  corners: CornerData[];
  drsZones: DRSZone[];
  elevationProfile: number[];
  pitLaneLength: number;
  pitLaneSpeedLimit: number;
  drsEnabled: boolean;
  streetCircuit: boolean;
  altitude: number;
  timezone: string;
  lat: number;
  lng: number;
}

export const CIRCUIT_DATABASE: Record<string, TrackLayout> = {
  monaco: {
    id: 'monaco', name: 'Circuit de Monaco', country: 'Monaco', city: 'Monte Carlo',
    length: 3.337, lapRecord: '1:12.909', lapRecordHolder: 'Lewis Hamilton', lapRecordYear: 2021,
    totalLaps: 78, direction: 'clockwise', turns: 19,
    sectors: [
      { index: 0, length: 1.1, numCorners: 7, topSpeed: 260, avgSpeed: 155, elevationGain: 15, difficulty: 'hard' },
      { index: 1, length: 1.05, numCorners: 6, topSpeed: 270, avgSpeed: 162, elevationGain: 10, difficulty: 'hard' },
      { index: 2, length: 1.187, numCorners: 6, topSpeed: 290, avgSpeed: 170, elevationGain: 12, difficulty: 'medium' },
    ],
    corners: [
      { name: 'Sainte Devote', number: 1, type: 'medium', entrySpeed: 230, apexSpeed: 115, exitSpeed: 140, radius: 45, camber: 3, drsActivation: false, overtakingDifficulty: 9 },
      { name: 'Massenet', number: 3, type: 'fast', entrySpeed: 220, apexSpeed: 165, exitSpeed: 175, radius: 120, camber: 2, drsActivation: false, overtakingDifficulty: 10 },
      { name: 'Casino Square', number: 4, type: 'medium', entrySpeed: 200, apexSpeed: 145, exitSpeed: 155, radius: 75, camber: 1, drsActivation: false, overtakingDifficulty: 10 },
      { name: 'Mirabeau', number: 6, type: 'slow', entrySpeed: 180, apexSpeed: 85, exitSpeed: 100, radius: 30, camber: 4, drsActivation: false, overtakingDifficulty: 8 },
      { name: 'Grand Hotel Hairpin', number: 7, type: 'hairpin', entrySpeed: 120, apexSpeed: 48, exitSpeed: 65, radius: 12, camber: 0, drsActivation: false, overtakingDifficulty: 5 },
      { name: 'Portier', number: 8, type: 'slow', entrySpeed: 150, apexSpeed: 75, exitSpeed: 110, radius: 35, camber: 2, drsActivation: false, overtakingDifficulty: 7 },
      { name: 'Nouvelle Chicane', number: 10, type: 'chicane', entrySpeed: 280, apexSpeed: 90, exitSpeed: 130, radius: 25, camber: 1, drsActivation: true, overtakingDifficulty: 6 },
      { name: 'Tabac', number: 12, type: 'fast', entrySpeed: 240, apexSpeed: 180, exitSpeed: 200, radius: 95, camber: 3, drsActivation: false, overtakingDifficulty: 9 },
      { name: 'Swimming Pool', number: 13, type: 'chicane', entrySpeed: 250, apexSpeed: 135, exitSpeed: 170, radius: 55, camber: 2, drsActivation: false, overtakingDifficulty: 10 },
      { name: 'Rascasse', number: 18, type: 'slow', entrySpeed: 180, apexSpeed: 70, exitSpeed: 110, radius: 28, camber: 1, drsActivation: false, overtakingDifficulty: 8 },
      { name: 'Anthony Noghes', number: 19, type: 'medium', entrySpeed: 160, apexSpeed: 100, exitSpeed: 145, radius: 50, camber: 2, drsActivation: false, overtakingDifficulty: 7 },
    ],
    drsZones: [
      { id: 'drs_1', name: 'Start/Finish Straight', detectionLineDistance: 0, activationLineDistance: 0.3, deactivationLineDistance: 1.1, length: 800 },
    ],
    elevationProfile: [0, 2, 5, 15, 18, 22, 20, 15, 10, 5, 2, 8, 12, 8, 5, 3, 0],
    pitLaneLength: 350, pitLaneSpeedLimit: 60, drsEnabled: true, streetCircuit: true,
    altitude: 10, timezone: 'Europe/Monaco', lat: 43.7347, lng: 7.4206,
  },
  silverstone: {
    id: 'silverstone', name: 'Silverstone Circuit', country: 'UK', city: 'Northamptonshire',
    length: 5.891, lapRecord: '1:27.097', lapRecordHolder: 'Max Verstappen', lapRecordYear: 2020,
    totalLaps: 52, direction: 'clockwise', turns: 18,
    sectors: [
      { index: 0, length: 1.95, numCorners: 6, topSpeed: 320, avgSpeed: 235, elevationGain: 5, difficulty: 'medium' },
      { index: 1, length: 1.98, numCorners: 7, topSpeed: 310, avgSpeed: 220, elevationGain: 8, difficulty: 'hard' },
      { index: 2, length: 1.961, numCorners: 5, topSpeed: 330, avgSpeed: 240, elevationGain: 3, difficulty: 'medium' },
    ],
    corners: [
      { name: 'Abbey', number: 1, type: 'very_fast', entrySpeed: 310, apexSpeed: 260, exitSpeed: 280, radius: 200, camber: 2, drsActivation: true, overtakingDifficulty: 8 },
      { name: 'Farm', number: 2, type: 'fast', entrySpeed: 290, apexSpeed: 240, exitSpeed: 255, radius: 180, camber: 1, drsActivation: false, overtakingDifficulty: 9 },
      { name: 'Village', number: 3, type: 'medium', entrySpeed: 260, apexSpeed: 140, exitSpeed: 160, radius: 80, camber: 3, drsActivation: false, overtakingDifficulty: 7 },
      { name: 'The Loop', number: 4, type: 'slow', entrySpeed: 160, apexSpeed: 70, exitSpeed: 95, radius: 25, camber: 1, drsActivation: false, overtakingDifficulty: 5 },
      { name: 'Aintree', number: 5, type: 'medium', entrySpeed: 180, apexSpeed: 155, exitSpeed: 200, radius: 90, camber: 2, drsActivation: false, overtakingDifficulty: 8 },
      { name: 'Wellington Straight', number: 6, type: 'fast', entrySpeed: 250, apexSpeed: 310, exitSpeed: 320, radius: 500, camber: 0, drsActivation: true, overtakingDifficulty: 6 },
      { name: 'Brooklands', number: 7, type: 'slow', entrySpeed: 300, apexSpeed: 100, exitSpeed: 130, radius: 40, camber: 2, drsActivation: false, overtakingDifficulty: 5 },
      { name: 'Luffield', number: 8, type: 'slow', entrySpeed: 150, apexSpeed: 80, exitSpeed: 120, radius: 35, camber: 3, drsActivation: false, overtakingDifficulty: 6 },
      { name: 'Copse', number: 9, type: 'very_fast', entrySpeed: 310, apexSpeed: 265, exitSpeed: 285, radius: 220, camber: 2, drsActivation: true, overtakingDifficulty: 8 },
      { name: 'Maggots', number: 10, type: 'very_fast', entrySpeed: 300, apexSpeed: 250, exitSpeed: 270, radius: 160, camber: 1, drsActivation: false, overtakingDifficulty: 10 },
      { name: 'Becketts', number: 11, type: 'fast', entrySpeed: 270, apexSpeed: 200, exitSpeed: 220, radius: 100, camber: 2, drsActivation: false, overtakingDifficulty: 9 },
      { name: 'Chapel', number: 12, type: 'fast', entrySpeed: 230, apexSpeed: 195, exitSpeed: 250, radius: 130, camber: 1, drsActivation: false, overtakingDifficulty: 9 },
      { name: 'Hangar Straight', number: 13, type: 'fast', entrySpeed: 280, apexSpeed: 325, exitSpeed: 330, radius: 600, camber: 0, drsActivation: true, overtakingDifficulty: 5 },
      { name: 'Stowe', number: 15, type: 'fast', entrySpeed: 310, apexSpeed: 185, exitSpeed: 210, radius: 120, camber: 3, drsActivation: false, overtakingDifficulty: 7 },
      { name: 'Vale', number: 16, type: 'slow', entrySpeed: 220, apexSpeed: 90, exitSpeed: 120, radius: 30, camber: 2, drsActivation: false, overtakingDifficulty: 5 },
      { name: 'Club', number: 17, type: 'medium', entrySpeed: 150, apexSpeed: 130, exitSpeed: 200, radius: 65, camber: 1, drsActivation: true, overtakingDifficulty: 7 },
    ],
    drsZones: [
      { id: 'drs_1', name: 'Wellington Straight', detectionLineDistance: 0.3, activationLineDistance: 0.5, deactivationLineDistance: 2.3, length: 1200 },
      { id: 'drs_2', name: 'Hangar Straight', detectionLineDistance: 2.6, activationLineDistance: 2.8, deactivationLineDistance: 4.5, length: 1400 },
      { id: 'drs_3', name: 'Start/Finish Straight', detectionLineDistance: 5.0, activationLineDistance: 5.2, deactivationLineDistance: 5.9, length: 600 },
    ],
    elevationProfile: [0, 3, 5, 8, 6, 4, 3, 5, 8, 12, 10, 8, 6, 4, 3, 5, 2, 0],
    pitLaneLength: 420, pitLaneSpeedLimit: 80, drsEnabled: true, streetCircuit: false,
    altitude: 150, timezone: 'Europe/London', lat: 52.0786, lng: -1.0169,
  },
  monza: {
    id: 'monza', name: 'Autodromo Nazionale Monza', country: 'Italy', city: 'Monza',
    length: 5.793, lapRecord: '1:21.046', lapRecordHolder: 'Rubens Barrichello', lapRecordYear: 2004,
    totalLaps: 53, direction: 'clockwise', turns: 11,
    sectors: [
      { index: 0, length: 1.92, numCorners: 3, topSpeed: 345, avgSpeed: 275, elevationGain: 2, difficulty: 'easy' },
      { index: 1, length: 1.94, numCorners: 4, topSpeed: 340, avgSpeed: 265, elevationGain: 4, difficulty: 'medium' },
      { index: 2, length: 1.933, numCorners: 4, topSpeed: 345, avgSpeed: 270, elevationGain: 1, difficulty: 'easy' },
    ],
    corners: [
      { name: 'Variante del Rettifilo', number: 1, type: 'chicane', entrySpeed: 340, apexSpeed: 75, exitSpeed: 140, radius: 18, camber: 2, drsActivation: true, overtakingDifficulty: 3 },
      { name: 'Curva Grande', number: 3, type: 'very_fast', entrySpeed: 260, apexSpeed: 250, exitSpeed: 280, radius: 300, camber: 2, drsActivation: false, overtakingDifficulty: 9 },
      { name: 'Variante della Roggia', number: 4, type: 'chicane', entrySpeed: 310, apexSpeed: 85, exitSpeed: 150, radius: 22, camber: 1, drsActivation: false, overtakingDifficulty: 4 },
      { name: 'Lesmo 1', number: 6, type: 'fast', entrySpeed: 280, apexSpeed: 195, exitSpeed: 220, radius: 110, camber: 3, drsActivation: false, overtakingDifficulty: 8 },
      { name: 'Lesmo 2', number: 7, type: 'fast', entrySpeed: 250, apexSpeed: 190, exitSpeed: 230, radius: 100, camber: 2, drsActivation: false, overtakingDifficulty: 7 },
      { name: 'Variante Ascari', number: 8, type: 'chicane', entrySpeed: 300, apexSpeed: 145, exitSpeed: 220, radius: 50, camber: 2, drsActivation: false, overtakingDifficulty: 5 },
      { name: 'Parabolica', number: 11, type: 'fast', entrySpeed: 280, apexSpeed: 210, exitSpeed: 290, radius: 180, camber: 3, drsActivation: true, overtakingDifficulty: 7 },
    ],
    drsZones: [
      { id: 'drs_1', name: 'Main Straight', detectionLineDistance: 0, activationLineDistance: 0.1, deactivationLineDistance: 0.7, length: 1200 },
      { id: 'drs_2', name: 'Back Straight', detectionLineDistance: 3.4, activationLineDistance: 3.6, deactivationLineDistance: 5.0, length: 1100 },
    ],
    elevationProfile: [0, 1, 2, 4, 5, 3, 2, 4, 6, 4, 2, 0],
    pitLaneLength: 400, pitLaneSpeedLimit: 80, drsEnabled: true, streetCircuit: false,
    altitude: 170, timezone: 'Europe/Rome', lat: 45.6156, lng: 9.2811,
  },
  spa: {
    id: 'spa', name: 'Circuit de Spa-Francorchamps', country: 'Belgium', city: 'Stavelot',
    length: 7.004, lapRecord: '1:46.286', lapRecordHolder: 'Valtteri Bottas', lapRecordYear: 2018,
    totalLaps: 44, direction: 'clockwise', turns: 20,
    sectors: [
      { index: 0, length: 2.5, numCorners: 7, topSpeed: 325, avgSpeed: 215, elevationGain: 40, difficulty: 'hard' },
      { index: 1, length: 2.3, numCorners: 7, topSpeed: 310, avgSpeed: 205, elevationGain: 35, difficulty: 'hard' },
      { index: 2, length: 2.204, numCorners: 6, topSpeed: 330, avgSpeed: 230, elevationGain: 20, difficulty: 'medium' },
    ],
    corners: [
      { name: 'La Source', number: 1, type: 'hairpin', entrySpeed: 300, apexSpeed: 65, exitSpeed: 100, radius: 15, camber: 3, drsActivation: true, overtakingDifficulty: 3 },
      { name: 'Eau Rouge', number: 2, type: 'very_fast', entrySpeed: 260, apexSpeed: 245, exitSpeed: 270, radius: 180, camber: 4, drsActivation: false, overtakingDifficulty: 10 },
      { name: 'Raidillon', number: 3, type: 'very_fast', entrySpeed: 270, apexSpeed: 230, exitSpeed: 265, radius: 150, camber: 5, drsActivation: false, overtakingDifficulty: 10 },
      { name: 'Les Combes', number: 5, type: 'chicane', entrySpeed: 310, apexSpeed: 130, exitSpeed: 165, radius: 45, camber: 2, drsActivation: true, overtakingDifficulty: 5 },
      { name: 'Bruxelles', number: 8, type: 'slow', entrySpeed: 200, apexSpeed: 85, exitSpeed: 110, radius: 32, camber: 1, drsActivation: false, overtakingDifficulty: 6 },
      { name: 'Pouhon', number: 10, type: 'very_fast', entrySpeed: 290, apexSpeed: 215, exitSpeed: 245, radius: 160, camber: 4, drsActivation: false, overtakingDifficulty: 9 },
      { name: 'Fagnes', number: 12, type: 'chicane', entrySpeed: 270, apexSpeed: 135, exitSpeed: 175, radius: 50, camber: 2, drsActivation: false, overtakingDifficulty: 7 },
      { name: 'Blanchimont', number: 17, type: 'very_fast', entrySpeed: 310, apexSpeed: 270, exitSpeed: 290, radius: 250, camber: 3, drsActivation: true, overtakingDifficulty: 9 },
      { name: 'Bus Stop Chicane', number: 19, type: 'chicane', entrySpeed: 300, apexSpeed: 75, exitSpeed: 120, radius: 20, camber: 1, drsActivation: false, overtakingDifficulty: 4 },
    ],
    drsZones: [
      { id: 'drs_1', name: 'Kemmel Straight', detectionLineDistance: 0.3, activationLineDistance: 0.8, deactivationLineDistance: 2.5, length: 1500 },
      { id: 'drs_2', name: 'Blanchimont Straight', detectionLineDistance: 5.5, activationLineDistance: 5.8, deactivationLineDistance: 6.8, length: 800 },
    ],
    elevationProfile: [0, -2, -5, 10, 40, 42, 38, 30, 25, 20, 15, 18, 22, 18, 12, 8, 5, 3, 1, 0],
    pitLaneLength: 420, pitLaneSpeedLimit: 80, drsEnabled: true, streetCircuit: false,
    altitude: 450, timezone: 'Europe/Brussels', lat: 50.4372, lng: 5.9714,
  },
  suzuka: {
    id: 'suzuka', name: 'Suzuka Circuit', country: 'Japan', city: 'Suzuka',
    length: 5.807, lapRecord: '1:30.983', lapRecordHolder: 'Lewis Hamilton', lapRecordYear: 2019,
    totalLaps: 53, direction: 'clockwise', turns: 18,
    sectors: [
      { index: 0, length: 1.93, numCorners: 7, topSpeed: 305, avgSpeed: 210, elevationGain: 25, difficulty: 'hard' },
      { index: 1, length: 1.94, numCorners: 6, topSpeed: 290, avgSpeed: 195, elevationGain: 30, difficulty: 'hard' },
      { index: 2, length: 1.937, numCorners: 5, topSpeed: 315, avgSpeed: 225, elevationGain: 15, difficulty: 'medium' },
    ],
    corners: [
      { name: 'Turn 1', number: 1, type: 'fast', entrySpeed: 310, apexSpeed: 230, exitSpeed: 200, radius: 150, camber: 3, drsActivation: true, overtakingDifficulty: 7 },
      { name: 'Spoon', number: 13, type: 'slow', entrySpeed: 280, apexSpeed: 120, exitSpeed: 180, radius: 60, camber: 4, drsActivation: false, overtakingDifficulty: 6 },
      { name: '130R', number: 15, type: 'very_fast', entrySpeed: 310, apexSpeed: 265, exitSpeed: 290, radius: 200, camber: 3, drsActivation: false, overtakingDifficulty: 9 },
      { name: 'Casio Triangle', number: 16, type: 'chicane', entrySpeed: 300, apexSpeed: 80, exitSpeed: 130, radius: 22, camber: 1, drsActivation: false, overtakingDifficulty: 4 },
    ],
    drsZones: [
      { id: 'drs_1', name: 'Back Straight', detectionLineDistance: 3.2, activationLineDistance: 3.5, deactivationLineDistance: 5.0, length: 1200 },
    ],
    elevationProfile: [0, 5, 12, 20, 28, 35, 30, 22, 15, 10, 8, 15, 25, 20, 12, 5, 2, 0],
    pitLaneLength: 380, pitLaneSpeedLimit: 60, drsEnabled: true, streetCircuit: false,
    altitude: 50, timezone: 'Asia/Tokyo', lat: 34.8431, lng: 136.5410,
  },
  interlagos: {
    id: 'interlagos', name: 'Autódromo José Carlos Pace', country: 'Brazil', city: 'São Paulo',
    length: 4.309, lapRecord: '1:10.540', lapRecordHolder: 'Valtteri Bottas', lapRecordYear: 2018,
    totalLaps: 71, direction: 'counterclockwise', turns: 15,
    sectors: [
      { index: 0, length: 1.42, numCorners: 5, topSpeed: 320, avgSpeed: 230, elevationGain: 20, difficulty: 'medium' },
      { index: 1, length: 1.45, numCorners: 5, topSpeed: 310, avgSpeed: 215, elevationGain: 25, difficulty: 'hard' },
      { index: 2, length: 1.439, numCorners: 5, topSpeed: 330, avgSpeed: 240, elevationGain: 15, difficulty: 'medium' },
    ],
    corners: [
      { name: 'Senna S', number: 1, type: 'chicane', entrySpeed: 320, apexSpeed: 95, exitSpeed: 140, radius: 28, camber: 5, drsActivation: true, overtakingDifficulty: 3 },
      { name: 'Curva do Sol', number: 3, type: 'fast', entrySpeed: 200, apexSpeed: 180, exitSpeed: 240, radius: 120, camber: 2, drsActivation: false, overtakingDifficulty: 8 },
      { name: 'Descida do Lago', number: 4, type: 'medium', entrySpeed: 280, apexSpeed: 130, exitSpeed: 170, radius: 55, camber: 3, drsActivation: false, overtakingDifficulty: 5 },
      { name: 'Junção', number: 12, type: 'slow', entrySpeed: 250, apexSpeed: 95, exitSpeed: 150, radius: 35, camber: 4, drsActivation: false, overtakingDifficulty: 5 },
      { name: 'Arquibancadas', number: 13, type: 'fast', entrySpeed: 200, apexSpeed: 175, exitSpeed: 270, radius: 140, camber: 3, drsActivation: false, overtakingDifficulty: 8 },
    ],
    drsZones: [
      { id: 'drs_1', name: 'Main Straight', detectionLineDistance: 0, activationLineDistance: 0.1, deactivationLineDistance: 1.0, length: 900 },
    ],
    elevationProfile: [0, -5, -10, -15, -10, -5, 0, 5, 10, 15, 20, 18, 12, 5, 2, 0],
    pitLaneLength: 350, pitLaneSpeedLimit: 60, drsEnabled: true, streetCircuit: false,
    altitude: 800, timezone: 'America/Sao_Paulo', lat: -23.7036, lng: -46.6997,
  },
};

export function getTrackById(id: string): TrackLayout | undefined {
  return CIRCUIT_DATABASE[id];
}

export function getAllTracks(): TrackLayout[] {
  return Object.values(CIRCUIT_DATABASE);
}

export function estimateLapTime(track: TrackLayout, avgSpeed: number): number {
  return (track.length / (avgSpeed / 3.6));
}
