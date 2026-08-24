import { describe, it, expect } from 'vitest';
import { ALL_REAL_SPORTS_CARS_100, TIER_NAMES, getCarsByTier } from '../realWorldSportsCar100Dataset';
import { BenchmarkCorrelationEngine } from '../benchmarkCorrelationEngine';

describe('Real Sports Car 100 Dataset', () => {
  it('should have 100 cars across 10 tiers', () => {
    expect(ALL_REAL_SPORTS_CARS_100.length).toBe(100);
    for (let t = 1; t <= 10; t++) {
      expect(getCarsByTier(t).length).toBe(10);
      expect(TIER_NAMES[t]).toBeDefined();
    }
  });

  it('should have valid specs for all cars', () => {
    for (const car of ALL_REAL_SPORTS_CARS_100) {
      expect(car.peakHp).toBeGreaterThan(0);
      expect(car.curbWeightKg).toBeGreaterThan(500);
      expect(car.realTopSpeedKmh).toBeGreaterThan(200);
      expect(car.realZeroTo100Sec).toBeGreaterThan(1.5);
    }
  });
});

describe('Benchmark Correlation Engine', () => {
  const report = BenchmarkCorrelationEngine.runFullBenchmark();

  it('should produce results for all 100 cars', () => {
    expect(report.results.length).toBe(100);
  });

  it('should show positive R-squared for top speed (simulator tracks power/weight)', () => {
    const ts = report.correlations.find(c => c.metricName === 'Top Speed');
    expect(ts).toBeDefined();
    // Simplified physics solver achieves moderate correlation
    expect(ts!.rSquared).toBeGreaterThanOrEqual(0.15);
  });

  it('should show positive correlation for 0-100 acceleration', () => {
    const acc = report.correlations.find(c => c.metricName === '0-100 km/h');
    expect(acc).toBeDefined();
    expect(acc!.pearsonR).toBeGreaterThan(0);
    // Simplified grip/launch model within 35% MAPE
    expect(acc!.mape).toBeLessThanOrEqual(35);
  });

  it('should produce analytical vs discrete lap time results', () => {
    expect(report.analyticalVsDiscreteCorrelation.samples).toBeGreaterThan(0);
  });

  it('should compute valid metrics for every car', () => {
    for (const r of report.results) {
      expect(r.simTopSpeedKmh).toBeGreaterThan(100);
      expect(r.simZeroTo100Sec).toBeGreaterThan(1.5);
      expect(r.simQuarterMileSec).toBeGreaterThan(5);
      expect(r.simMaxLateralG).toBeGreaterThan(0.5);
    }
  });
});
