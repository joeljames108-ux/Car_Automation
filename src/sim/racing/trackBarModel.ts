// ============================================================================
// RACE ENGINEERING SUITE — TRACK BEHAVIOR MODEL
// ============================================================================
// Models track-specific characteristics: surface grip, curb behavior,
// kerb riding limits, track evolution, rubbering-in, and surface conditions.
// ============================================================================

export interface TrackSurface {
  gripLevel: number;
  abrasiveness: number;
  bumpiness: number;
  camber: number[];
  curbAggression: number;
  runoffType: 'gravel' | 'tarmac' | 'astroturf' | 'wall';
}

export interface TrackEvolution {
  rubberLevel: number;
  gripGain: number;
  dirtyAir: number;
  trackTempEffect: number;
}

export type TrackType = 'permanent' | 'street' | 'semi_street';

export interface TrackBehaviorProfile {
  id: string;
  name: string;
  surface: TrackSurface;
  type: TrackType;
  overtakingDifficulty: number;
  tireStress: number;
  brakeStress: number;
  fuelBurnRate: number;
  safetyCarProbability: number;
  rainDrainage: number;
  overtakingZones: number;
  draftingEffectiveness: number;
  kerbRidePenalty: number;
}

export const TRACK_BEHAVIORS: Record<string, TrackBehaviorProfile> = {
  monaco: {
    id: 'monaco', name: 'Monaco', type: 'street',
    surface: { gripLevel: 0.85, abrasiveness: 0.3, bumpiness: 0.7, camber: [1, 2, 3, 1, 2, 0, 1, 3, 2, 1],
      curbAggression: 0.9, runoffType: 'wall' },
    overtakingDifficulty: 9.5, tireStress: 0.7, brakeStress: 0.6,
    fuelBurnRate: 0.9, safetyCarProbability: 0.7, rainDrainage: 0.5,
    overtakingZones: 1, draftingEffectiveness: 0.1, kerbRidePenalty: 0.95,
  },
  silverstone: {
    id: 'silverstone', name: 'Silverstone', type: 'permanent',
    surface: { gripLevel: 0.95, abrasiveness: 0.6, bumpiness: 0.2, camber: [2, 1, 3, 1, 2, 0, 2, 3, 2, 1],
      curbAggression: 0.3, runoffType: 'tarmac' },
    overtakingDifficulty: 4.0, tireStress: 0.85, brakeStress: 0.5,
    fuelBurnRate: 1.05, safetyCarProbability: 0.25, rainDrainage: 0.9,
    overtakingZones: 3, draftingEffectiveness: 0.7, kerbRidePenalty: 0.15,
  },
  monza: {
    id: 'monza', name: 'Monza', type: 'permanent',
    surface: { gripLevel: 0.92, abrasiveness: 0.4, bumpiness: 0.15, camber: [1, 2, 1, 3, 2, 1, 2],
      curbAggression: 0.5, runoffType: 'tarmac' },
    overtakingDifficulty: 3.0, tireStress: 0.5, brakeStress: 0.9,
    fuelBurnRate: 1.1, safetyCarProbability: 0.3, rainDrainage: 0.8,
    overtakingZones: 4, draftingEffectiveness: 0.9, kerbRidePenalty: 0.4,
  },
  spa: {
    id: 'spa', name: 'Spa-Francorchamps', type: 'permanent',
    surface: { gripLevel: 0.93, abrasiveness: 0.55, bumpiness: 0.4, camber: [2, 5, 4, 3, 1, 4, 2, 1, 3],
      curbAggression: 0.4, runoffType: 'gravel' },
    overtakingDifficulty: 5.0, tireStress: 0.8, brakeStress: 0.7,
    fuelBurnRate: 1.08, safetyCarProbability: 0.35, rainDrainage: 0.7,
    overtakingZones: 3, draftingEffectiveness: 0.75, kerbRidePenalty: 0.3,
  },
  suzuka: {
    id: 'suzuka', name: 'Suzuka', type: 'permanent',
    surface: { gripLevel: 0.94, abrasiveness: 0.5, bumpiness: 0.25, camber: [3, 4, 2, 1, 3, 2, 1],
      curbAggression: 0.35, runoffType: 'tarmac' },
    overtakingDifficulty: 6.5, tireStress: 0.9, brakeStress: 0.65,
    fuelBurnRate: 1.02, safetyCarProbability: 0.28, rainDrainage: 0.85,
    overtakingZones: 2, draftingEffectiveness: 0.6, kerbRidePenalty: 0.25,
  },
  interlagos: {
    id: 'interlagos', name: 'Interlagos', type: 'permanent',
    surface: { gripLevel: 0.88, abrasiveness: 0.65, bumpiness: 0.5, camber: [5, 3, 2, 1, 4, 3, 2],
      curbAggression: 0.45, runoffType: 'tarmac' },
    overtakingDifficulty: 3.5, tireStress: 0.75, brakeStress: 0.6,
    fuelBurnRate: 0.95, safetyCarProbability: 0.4, rainDrainage: 0.75,
    overtakingZones: 3, draftingEffectiveness: 0.65, kerbRidePenalty: 0.35,
  },
};

export class TrackBehaviorModel {
  private profile: TrackBehaviorProfile;
  private rubberLevel = 0.3;
  private evolution: TrackEvolution;

  constructor(trackId: string) {
    this.profile = TRACK_BEHAVIORS[trackId] || TRACK_BEHAVIORS.silverstone;
    this.evolution = {
      rubberLevel: 0.3, gripGain: 0, dirtyAir: 1.0, trackTempEffect: 0,
    };
  }

  public evolve(lapNumber: number, totalLaps: number): TrackEvolution {
    const progress = lapNumber / totalLaps;
    this.rubberLevel = Math.min(1.0, 0.3 + progress * 0.6 + Math.random() * 0.05);
    this.evolution.rubberLevel = this.rubberLevel;
    this.evolution.gripGain = this.rubberLevel * this.profile.surface.gripLevel * 0.08;
    this.evolution.dirtyAir = 1.0 - progress * 0.15;
    return { ...this.evolution };
  }

  public getEffectiveGrip(): number {
    return this.profile.surface.gripLevel * (1 + this.evolution.gripGain);
  }

  public getCurbPenalty(): number { return this.profile.kerbRidePenalty; }
  public getOvertakingDifficulty(): number { return this.profile.overtakingDifficulty; }
  public getTireStress(): number { return this.profile.tireStress; }
  public getBrakeStress(): number { return this.profile.brakeStress; }
  public getProfile(): TrackBehaviorProfile { return { ...this.profile }; }
  public getSafetyCarProbability(): number { return this.profile.safetyCarProbability; }
}
