// ============================================================================
// RACE ENGINEERING SUITE — GAP ANALYZER
// ============================================================================
// Real-time gap calculation between cars, interval tracking, position
// change prediction, DRS detection, and overtaking opportunity analysis.
// ============================================================================

export interface CarGapData {
  driverId: string;
  driverName: string;
  team: string;
  number: number;
  position: number;
  gapToLeader: number;
  interval: number;
  lastLapTime: number;
  bestLapTime: number;
  tireCompound: string;
  tireAge: number;
  pitStops: number;
  trackDistance: number;
  speed: number;
  drsAvailable: boolean;
  drsActive: boolean;
  isLapped: boolean;
  status: 'running' | 'pit' | 'retired' | 'dns';
}

export interface OvertakingOpportunity {
  attacker: string;
  defender: string;
  zone: string;
  probability: number;
  gapRequired: number;
  currentGap: number;
  advantage: 'attacker' | 'defender' | 'even';
}

export class GapAnalyzer {
  private cars: CarGapData[] = [];
  private totalTrackLength: number;

  constructor(totalTrackLength: number) {
    this.totalTrackLength = totalTrackLength;
  }

  public updateCar(data: CarGapData): void {
    const idx = this.cars.findIndex(c => c.driverId === data.driverId);
    if (idx >= 0) this.cars[idx] = data;
    else this.cars.push(data);
  }

  public calculateGaps(): void {
    this.cars.sort((a, b) => a.position - b.position);
    const leader = this.cars[0];
    if (!leader) return;

    for (const car of this.cars) {
      car.gapToLeader = car.trackDistance - leader.trackDistance;
      if (car.gapToLeader < 0) car.gapToLeader += this.totalTrackLength;
      const prevCar = this.cars.find(c => c.position === car.position - 1);
      car.interval = prevCar ? car.trackDistance - prevCar.trackDistance : 0;
      if (car.interval < 0) car.interval += this.totalTrackLength;

      car.drsAvailable = car.interval < 1.0 && car.position > 1;
      car.drsActive = car.drsAvailable && car.speed > 250;
    }
  }

  public getOvertakingOpportunities(): OvertakingOpportunity[] {
    const opportunities: OvertakingOpportunity[] = [];
    for (let i = 1; i < this.cars.length; i++) {
      const attacker = this.cars[i];
      const defender = this.cars[i - 1];
      if (attacker.status !== 'running' || defender.status !== 'running') continue;

      const gap = defender.interval;
      if (gap < 2.0) {
        const tireAdvantage = attacker.tireAge < defender.tireAge - 5 ? 'attacker' :
          defender.tireAge < attacker.tireAge - 5 ? 'defender' : 'even';
        const speedAdvantage = attacker.speed > defender.speed + 5 ? 'attacker' :
          defender.speed > attacker.speed + 5 ? 'defender' : 'even';

        opportunities.push({
          attacker: attacker.driverName,
          defender: defender.driverName,
          zone: gap < 0.5 ? 'DRS Zone' : 'Closing',
          probability: Math.min(0.95, Math.max(0.05, 1.0 - gap * 0.3)),
          gapRequired: 0.5,
          currentGap: gap,
          advantage: tireAdvantage === 'attacker' || speedAdvantage === 'attacker' ? 'attacker' :
            tireAdvantage === 'defender' || speedAdvantage === 'defender' ? 'defender' : 'even',
        });
      }
    }
    return opportunities;
  }

  public predictPositionChanges(lapsRemaining: number): { driverId: string; predictedPosition: number; confidence: number }[] {
    return this.cars.map(car => {
      const paceDelta = car.bestLapTime > 0 ? (car.lastLapTime - car.bestLapTime) : 0;
      const tireDeg = car.tireAge * 0.02;
      const predicted = car.position + (paceDelta > 0.3 ? -1 : paceDelta < -0.3 ? 1 : 0);
      return {
        driverId: car.driverId,
        predictedPosition: Math.max(1, Math.min(this.cars.length, predicted)),
        confidence: 0.5 + Math.random() * 0.3,
      };
    });
  }

  public getTower(): CarGapData[] { return [...this.cars].sort((a, b) => a.position - b.position); }
  public getGapToLeader(driverId: string): number {
    return this.cars.find(c => c.driverId === driverId)?.gapToLeader ?? 0;
  }
  public getInterval(driverId: string): number {
    return this.cars.find(c => c.driverId === driverId)?.interval ?? 0;
  }
}
