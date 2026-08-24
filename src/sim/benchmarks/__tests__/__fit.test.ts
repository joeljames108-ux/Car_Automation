import { describe, it } from 'vitest';
import { ALL_REAL_SPORTS_CARS_100 } from '../realWorldSportsCar100Dataset';

// Log-space least squares for: ln(vAvg) = b0 + b1*ln(pw) + b2*ln(muLat) + b3*ln(dfTerm) + b4*ln(refMass/m)
describe('FIT', () => {
  it('regresses NRing average speed', () => {
    const muLat = (c: string) => c === 'racing_slick' ? 1.38 : c === 'track_r_compound' ? 1.20 : c === 'ultra_high_performance' ? 1.06 : 0.95;
    const rows = ALL_REAL_SPORTS_CARS_100.filter(r => r.realNurburgringSec > 240);
    const X: number[][] = [];
    const Y: number[] = [];
    for (const r of rows) {
      const m = r.curbWeightKg;
      const pw = r.peakHp / m;
      const ml = muLat(r.tireCompound);
      const dfTerm = 1 + (r.downforceAt200KmhN * 1.5625) / (m * 9.81);
      X.push([1, Math.log(pw), Math.log(ml), Math.log(dfTerm), Math.log(1500 / m)]);
      Y.push(Math.log((20832 / 1000 / r.realNurburgringSec) * 3600));
    }
    const p = 5;
    // Normal equations: (XᵀX) b = XᵀY
    const xtx: number[][] = Array.from({ length: p }, () => Array(p).fill(0));
    const xty = Array(p).fill(0);
    for (let i = 0; i < X.length; i++) {
      for (let a = 0; a < p; a++) {
        xty[a] += X[i][a] * Y[i];
        for (let b = 0; b < p; b++) xtx[a][b] += X[i][a] * X[i][b];
      }
    }
    // Gaussian elimination
    const A = xtx.map((row, i) => [...row, xty[i]]);
    for (let col = 0; col < p; col++) {
      let piv = col;
      for (let r2 = col + 1; r2 < p; r2++) if (Math.abs(A[r2][col]) > Math.abs(A[piv][col])) piv = r2;
      [A[col], A[piv]] = [A[piv], A[col]];
      for (let r2 = col + 1; r2 < p; r2++) {
        const f = A[r2][col] / A[col][col];
        for (let cc = col; cc <= p; cc++) A[r2][cc] -= f * A[col][cc];
      }
    }
    const beta = Array(p).fill(0);
    for (let r2 = p - 1; r2 >= 0; r2--) {
      beta[r2] = (A[r2][p] - A[r2].slice(r2 + 1, p).reduce((s, v, j) => s + v * beta[r2 + 1 + j], 0)) / A[r2][r2];
    }
    console.log('coefficients [b0..b4] =', beta.map(v => +v.toFixed(4)).join(', '), ' n=' + rows.length);
    // Residual quality
    let sse = 0, mapeSum = 0;
    rows.forEach((r, i) => {
      const pred = Math.exp(X[i].reduce((s, xj, j) => s + xj * beta[j], 0));
      const real = (20832 / 1000 / r.realNurburgringSec) * 3600;
      sse += (pred - real) ** 2;
      mapeSum += Math.abs(pred - real) / real * 100;
      if (Math.abs(pred - real) / real > 0.05) console.log(`  ${r.id.padEnd(14)} real=${r.realNurburgringSec}s pred=${(20832 / 1000 / pred * 3600).toFixed(0)}s`);
    });
    const ssTot = rows.reduce((s, r) => {
      const real = (20832 / 1000 / r.realNurburgringSec) * 3600;
      return s + (real - rows.reduce((s2, r2) => s2 + (20832 / 1000 / r2.realNurburgringSec) * 3600, 0) / rows.length) ** 2;
    }, 0);
    console.log(`R2=${(1 - sse / ssTot).toFixed(4)} MAPE=${(mapeSum / rows.length).toFixed(2)}%`);
  });
});
