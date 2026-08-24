// ============================================================================
// RACE ENGINEERING SUITE — DRS ZONE MANAGER
// ============================================================================
// Manages DRS detection points, activation zones, one-second gap detection,
// overtaking probability estimation, and DRS ban conditions.
// ============================================================================

export interface DRSZoneConfig {
  id: string;
  name: string;
  detectionLineDistance: number;
  activationLineDistance: number;
  deactivationLineDistance: number;
  length: number;
  typicallyOvertake: boolean;
  approachSpeed: number;
}

export interface DRSStatus {
  zoneId: string;
  eligible: boolean;
  gapToCarAhead: number;
  active: boolean;
  activatedThisLap: boolean;
  drsCount: number;
  drsUsage: { lap: number; zone: string; activated: boolean }[];
}

export interface OvertakingProbability {
  overall: number;
  brakingZone: number;
  straightLine: number;
  exitSpeed: number;
  drsAssist: number;
  dirtyAirPenalty: number;
  tireAdvantage: number;
  confidence: number;
}

export class DRSZoneManager {
  private zones: DRSZoneConfig[];
  private enabled: boolean;
  private status: Map<string, DRSStatus>;
  private gapHistory: Map<string, number[]>;
  private lapCount = 0;

  constructor(zones: DRSZoneConfig[], enabled: boolean = true) {
    this.zones = zones;
    this.enabled = enabled;
    this.status = new Map();
    this.gapHistory = new Map();
    for (const zone of zones) {
      this.status.set(zone.id, {
        zoneId: zone.id, eligible: false, gapToCarAhead: Infinity,
        active: false, activatedThisLap: false, drsCount: 0, drsUsage: [],
      });
    }
  }

  public updateDriverPosition(
    driverId: string, trackDistance: number, speed: number,
    gapToCarAhead: number, carAheadId: string
  ): DRSStatus[] {
    const updatedStatuses: DRSStatus[] = [];

    for (const zone of this.zones) {
      const st = this.status.get(zone.id);
      if (!st) continue;

      // Check if car is past activation point but before deactivation
      const inZone = trackDistance >= zone.activationLineDistance && trackDistance <= zone.deactivationLineDistance;

      // Check eligibility (within 1 second at detection point)
      if (!this.gapHistory.has(driverId)) this.gapHistory.set(driverId, []);
      const history = this.gapHistory.get(driverId)!;

      const atDetection = Math.abs(trackDistance - zone.detectionLineDistance) < 50;
      if (atDetection) {
        history.push(gapToCarAhead);
        if (history.length > 5) history.shift();
      }

      const avgGap = history.length > 0 ? history.reduce((a, b) => a + b, 0) / history.length : Infinity;
      st.eligible = this.enabled && avgGap < 1.0 && speed > 200;
      st.gapToCarAhead = avgGap;
      st.active = st.eligible && inZone;

      if (st.active && !st.activatedThisLap) {
        st.activatedThisLap = true;
        st.drsCount++;
        st.drsUsage.push({ lap: this.lapCount, zone: zone.id, activated: true });
      }

      updatedStatuses.push({ ...st });
    }

    return updatedStatuses;
  }

  public newLap(): void {
    this.lapCount++;
    for (const [, st] of this.status) {
      st.activatedThisLap = false;
    }
  }

  public calculateOvertakingProbability(
    attackerSpeed: number, defenderSpeed: number,
    gapToDefender: number, tireAgeDiff: number,
    brakingForce: number, isDRSActive: boolean,
  ): OvertakingProbability {
    const speedAdvantage = (attackerSpeed - defenderSpeed) / defenderSpeed;
    const brakingZone = Math.min(0.9, 0.3 + brakingForce * 0.001 + speedAdvantage * 0.2);
    const straightLine = Math.min(0.95, 0.4 + speedAdvantage * 0.5 + (isDRSActive ? 0.3 : 0));
    const exitSpeed = Math.min(0.85, 0.35 + speedAdvantage * 0.3 + tireAgeDiff * 0.02);
    const drsAssist = isDRSActive ? 0.35 : 0;
    const dirtyAirPenalty = gapToDefender < 0.5 ? 0.15 : gapToDefender < 1.0 ? 0.08 : 0;
    const tireAdvantage = tireAgeDiff > 5 ? Math.min(0.2, tireAgeDiff * 0.02) : 0;
    const overall = Math.min(0.95, (brakingZone + straightLine + exitSpeed) / 3 + drsAssist + tireAdvantage - dirtyAirPenalty);

    return {
      overall: Math.round(overall * 100) / 100,
      brakingZone: Math.round(brakingZone * 100) / 100,
      straightLine: Math.round(straightLine * 100) / 100,
      exitSpeed: Math.round(exitSpeed * 100) / 100,
      drsAssist: Math.round(drsAssist * 100) / 100,
      dirtyAirPenalty: Math.round(dirtyAirPenalty * 100) / 100,
      tireAdvantage: Math.round(tireAdvantage * 100) / 100,
      confidence: 0.7 + Math.random() * 0.2,
    };
  }

  public setEnabled(enabled: boolean): void { this.enabled = enabled; }
  public isEnabled(): boolean { return this.enabled; }
  public getZones(): DRSZoneConfig[] { return [...this.zones]; }
  public getStatus(): DRSStatus[] { return Array.from(this.status.values()); }
  public getTotalActivations(): number {
    return Array.from(this.status.values()).reduce((sum, s) => sum + s.drsCount, 0);
  }
}
