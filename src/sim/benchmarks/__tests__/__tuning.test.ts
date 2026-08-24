import { describe, it } from 'vitest';
import { BenchmarkCorrelationEngine } from '../benchmarkCorrelationEngine';
import { ALL_REAL_SPORTS_CARS_100 } from '../realWorldSportsCar100Dataset';

describe('TUNING', () => {
  it('prints fleet statistics', () => {
    const report = BenchmarkCorrelationEngine.runFullBenchmark();
    console.log('\n===== CORRELATIONS =====');
    for (const c of report.correlations.concat([report.analyticalVsDiscreteCorrelation])) {
      console.log(
        `${c.metricName.padEnd(28)} [${c.solver}] n=${String(c.samples).padStart(3)} ` +
        `R2=${c.rSquared.toFixed(4)} r=${c.pearsonR.toFixed(4)} MAPE=${c.mape.toFixed(2)}% ` +
        `slope=${c.slope} bias=${c.intercept > 0 ? '+' : ''}${c.intercept}`
      );
    }
    // worst offenders per gated metric
    const showWorst = (name: string, realSel: (r: any) => number, simSel: (r: any) => number) => {
      const rows = report.results
        .filter(r => realSel(r) > 0)
        .map(r => ({ id: r.car.id, real: realSel(r), sim: simSel(r), err: ((simSel(r) - realSel(r)) / realSel(r)) * 100 }))
        .sort((a, b) => Math.abs(b.err) - Math.abs(a.err))
        .slice(0, 8);
      console.log(`\n-- ${name} worst:`);
      for (const w of rows) console.log(`   ${w.id.padEnd(16)} real=${w.real} sim=${w.sim} (${w.err > 0 ? '+' : ''}${w.err.toFixed(1)}%)`);
    };
    showWorst('TopSpeed', r => r.car.realTopSpeedKmh, r => r.simTopSpeedKmh);
    showWorst('0-100', r => r.car.realZeroTo100Sec, r => r.simZeroTo100Sec);
    showWorst('QM', r => r.car.realQuarterMileSec, r => r.simQuarterMileSec);
    showWorst('NRing-Analytical', r => r.car.realNurburgringSec, r => r.simNurburgringSec);
    showWorst('NRing-Discrete', r => r.car.realNurburgringSec, r => r.lapSimNurburgringSec);
    void ALL_REAL_SPORTS_CARS_100.length;
  });
});
