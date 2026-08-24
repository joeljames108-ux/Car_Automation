// ============================================================================
// RACE ENGINEERING SUITE — SECTOR TIMING SYSTEM
// ============================================================================
// Real-time sector timing with delta analysis, personal best tracking,
// session best detection, purple/green/yellow sectors, and predictive
// lap time estimation based on current pace.
// ============================================================================

export interface SectorSplit {
  sector: number;
  time: number;
  delta: number;
  color: 'purple' | 'green' | 'yellow' | 'white';
  isBest: boolean;
}

export interface LapTiming {
  lapNumber: number;
  totalTime: number;
  sectors: SectorSplit[];
  predictedTime: number;
  isValid: boolean;
  improvement: number;
}

export interface TimingTowerEntry {
  position: number;
  driverNumber: number;
  driverName: string;
  team: string;
  gap: string;
  interval: string;
  lastLap: string;
  bestLap: string;
  sector1: SectorSplit;
  sector2: SectorSplit;
  sector3: SectorSplit;
  tireCompound: string;
  pits: number;
  status: 'running' | 'pit' | 'stopped' | 'dns' | 'dq';
}

export class SectorTimingSystem {
  private sectorSplits: number[];
  private bestSectors: number[];
  private sessionBestSectors: number[];
  private lapHistory: LapTiming[] = [];
  private totalSectors: number;

  constructor(totalSectors: number = 3) {
    this.totalSectors = totalSectors;
    this.sectorSplits = Array(totalSectors).fill(0);
    this.bestSectors = Array(totalSectors).fill(Infinity);
    this.sessionBestSectors = Array(totalSectors).fill(Infinity);
  }

  public startSector(sectorIndex: number): void {
    this.sectorSplits[sectorIndex] = performance.now();
  }

  public completeSector(sectorIndex: number): SectorSplit {
    const now = performance.now();
    const time = (now - this.sectorSplits[sectorIndex]) / 1000;
    const bestTime = this.bestSectors[sectorIndex];
    const sessionBest = this.sessionBestSectors[sectorIndex];

    let color: SectorSplit['color'] = 'yellow';
    if (sessionBest === Infinity || time < sessionBest) color = 'purple';
    else if (time <= bestTime * 1.01) color = 'green';
    else color = 'yellow';

    const delta = bestTime === Infinity ? 0 : time - bestTime;
    const isBest = time < bestTime;

    if (isBest) this.bestSectors[sectorIndex] = time;
    if (time < this.sessionBestSectors[sectorIndex]) this.sessionBestSectors[sectorIndex] = time;

    return { sector: sectorIndex, time, delta, color, isBest };
  }

  public completeLap(tireCompound: string): LapTiming {
    const total = this.sectorSplits.reduce((sum, _, i) => {
      return sum + (this.bestSectors[i] === Infinity ? 30 : this.bestSectors[i]);
    }, 0);

    const sectors: SectorSplit[] = [];
    for (let i = 0; i < this.totalSectors; i++) {
      sectors.push({
        sector: i,
        time: this.bestSectors[i] === Infinity ? 0 : this.bestSectors[i],
        delta: 0,
        color: 'white',
        isBest: false,
      });
    }

    const totalTime = sectors.reduce((sum, s) => sum + s.time, 0);
    const previousLap = this.lapHistory[this.lapHistory.length - 1];
    const improvement = previousLap ? previousLap.totalTime - totalTime : 0;

    const predictedTime = this.predictLapTime();

    const lapTiming: LapTiming = {
      lapNumber: this.lapHistory.length + 1,
      totalTime,
      sectors,
      predictedTime,
      isValid: totalTime > 0 && totalTime < 300,
      improvement,
    };

    this.lapHistory.push(lapTiming);
    return lapTiming;
  }

  public predictLapTime(): number {
    if (this.lapHistory.length < 2) return 0;
    const recent = this.lapHistory.slice(-5);
    const avgTime = recent.reduce((sum, l) => sum + l.totalTime, 0) / recent.length;
    const trend = recent.length > 1
      ? (recent[recent.length - 1].totalTime - recent[0].totalTime) / (recent.length - 1)
      : 0;
    return avgTime + trend;
  }

  public getDeltaToBest(): number {
    if (this.lapHistory.length === 0) return 0;
    const currentTotal = this.sectorSplits.reduce((sum, time, i) => {
      return sum + (this.bestSectors[i] === Infinity ? 0 : this.bestSectors[i]);
    }, 0);
    const bestLap = this.lapHistory.reduce((best, l) => l.totalTime < best.totalTime ? l : best, this.lapHistory[0]);
    return currentTotal - bestLap.totalTime;
  }

  public getLapHistory(): LapTiming[] { return [...this.lapHistory]; }
  public getBestLap(): LapTiming | null {
    return this.lapHistory.length > 0
      ? this.lapHistory.reduce((best, l) => l.totalTime < best.totalTime ? l : best, this.lapHistory[0])
      : null;
  }
  public getSessionBestSectors(): number[] { return [...this.sessionBestSectors]; }
  public reset(): void {
    this.bestSectors = Array(this.totalSectors).fill(Infinity);
    this.lapHistory = [];
  }
}
