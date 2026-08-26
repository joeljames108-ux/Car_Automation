/**
 * ============================================================================
 * APEX ENGINEER — 16x16 3D ECU MAP TUNING & CALIBRATION ENGINE
 * ============================================================================
 * Enterprise-grade 3D engine management calibration system.
 * Generates and interpolates 16x16 3D lookup tables for:
 * 1. Volumetric Efficiency / Fuel Injection Duration (ms)
 * 2. Ignition Timing Advance (°BTDC)
 * 3. Target AFR / Lambda Calibration
 * 4. Variable Valve Timing (VVT) Intake Phaser Angle (°)
 * 5. Electronic Wastegate Duty Cycle (%)
 *
 * Supports cell selection, multi-cell offset bumps, Gaussian matrix smoothing,
 * bi-linear interpolation, and real-time live tracing synchronized with Dyno load.
 * ============================================================================
 */

import { MasterEngineState } from "./masterEngineTypes";

export interface ECUMapAxis {
  rpmBreakpoints: number[]; // 16 values (e.g., 800 to 9500 RPM)
  loadKPaBreakpoints: number[]; // 16 values (e.g., 20 to 300 kPa MAP)
}

export interface ECUMap16x16 {
  id: string;
  name: string;
  unit: string;
  minValue: number;
  maxValue: number;
  axis: ECUMapAxis;
  grid: number[][]; // 16 rows (Load) x 16 cols (RPM)
}

export interface ECUFullCalibrationSuite {
  engineId: string;
  revLimiterRpm: number;
  idleRpm: number;
  fuelMap: ECUMap16x16; // VE % or Injection duration ms
  ignitionMap: ECUMap16x16; // °BTDC
  targetAfrMap: ECUMap16x16; // AFR ratio
  vvtIntakeMap: ECUMap16x16; // °Advance
  wastegateMap: ECUMap16x16; // Duty %
  knockRetardMatrix: number[][]; // Adaptive Knock Retard °
}

export interface LiveECUTracePoint {
  rpm: number;
  loadKPa: number;
  rowIndex: number;
  colIndex: number;
  interpolatedValue: number;
  activeMapId: string;
}

export class ECU3DMapTuningEngine {
  // Standard 16x16 Breakpoints
  public static readonly DEFAULT_RPM_AXIS = [
    800, 1200, 1600, 2000, 2400, 2800, 3200, 3800, 4400, 5000, 5600, 6200, 6800, 7500, 8400, 9500
  ];

  public static readonly DEFAULT_MAP_KPA_AXIS = [
    20, 35, 50, 65, 80, 95, 115, 135, 155, 175, 195, 215, 245, 275, 310, 350
  ];

  /**
   * Generates a fully populated 16x16 ECU Calibration Suite based on MasterEngineState
   */
  public static generateCalibrationSuite(state: MasterEngineState): ECUFullCalibrationSuite {
    const rpmAxis = [...this.DEFAULT_RPM_AXIS];
    const loadAxis = [...this.DEFAULT_MAP_KPA_AXIS];
    const numRows = loadAxis.length; // 16
    const numCols = rpmAxis.length; // 16

    const cr = state.performance?.staticCompressionRatio || 10.5;
    const boost = state.turboSystem?.type !== "naturally_aspirated" ? (state.turboSystem?.targetBoostPressureBar || 1.2) : 0;
    const baseTiming = state.tuning?.ignitionTimingAdvanceDeg || 24;

    // 1. Fuel VE Map (60% to 125%)
    const fuelGrid: number[][] = [];
    for (let r = 0; r < numRows; r++) {
      const load = loadAxis[r];
      const rowVals: number[] = [];
      for (let c = 0; c < numCols; c++) {
        const rpm = rpmAxis[c];
        const veBase = 75 + 30 * Math.exp(-Math.pow((rpm - 5800) / 3200, 2));
        const loadBoostFactor = Math.min(1.4, 0.7 + (load / 100) * 0.35);
        const val = Number(Math.min(135, Math.max(55, veBase * loadBoostFactor)).toFixed(1));
        rowVals.push(val);
      }
      fuelGrid.push(rowVals);
    }

    // 2. Ignition Timing Map (°BTDC)
    const ignitionGrid: number[][] = [];
    for (let r = 0; r < numRows; r++) {
      const load = loadAxis[r];
      const rowVals: number[] = [];
      for (let c = 0; c < numCols; c++) {
        const rpm = rpmAxis[c];
        let timing = baseTiming + (rpm / 1000) * 2.2 - (load / 100) * 7.5 - (cr - 10) * 1.5 - (boost * 4.0);
        timing = Math.min(48, Math.max(8, timing));
        rowVals.push(Number(timing.toFixed(1)));
      }
      ignitionGrid.push(rowVals);
    }

    // 3. Target AFR Map (AFR 14.7 down to 11.2)
    const afrGrid: number[][] = [];
    for (let r = 0; r < numRows; r++) {
      const load = loadAxis[r];
      const rowVals: number[] = [];
      for (let c = 0; c < numCols; c++) {
        let afr = 14.7;
        if (load > 100) {
          const boostPart = (load - 100) / 200;
          afr = 14.7 - boostPart * 3.2;
        } else if (load < 40) {
          afr = 15.2; // Lean cruise
        }
        rowVals.push(Number(Math.max(10.8, Math.min(15.5, afr)).toFixed(2)));
      }
      afrGrid.push(rowVals);
    }

    // 4. VVT Intake Advance Map (0° to 45°)
    const vvtGrid: number[][] = [];
    for (let r = 0; r < numRows; r++) {
      const load = loadAxis[r];
      const rowVals: number[] = [];
      for (let c = 0; c < numCols; c++) {
        const rpm = rpmAxis[c];
        let adv = 0;
        if (state.camshafts?.variableValveTimingIntake) {
          adv = 38 * Math.exp(-Math.pow((rpm - 3800) / 2200, 2)) * Math.min(1.0, load / 70);
        }
        rowVals.push(Number(Math.min(45, Math.max(0, adv)).toFixed(1)));
      }
      vvtGrid.push(rowVals);
    }

    // 5. Electronic Wastegate Duty Cycle Map (0% to 100%)
    const wgGrid: number[][] = [];
    for (let r = 0; r < numRows; r++) {
      const load = loadAxis[r];
      const rowVals: number[] = [];
      for (let c = 0; c < numCols; c++) {
        const rpm = rpmAxis[c];
        let duty = 0;
        if (boost > 0 && load > 90) {
          duty = Math.min(95, 30 + (boost / 2.0) * 50 + (rpm / 8000) * 15);
        }
        rowVals.push(Number(Math.max(0, duty).toFixed(1)));
      }
      wgGrid.push(rowVals);
    }

    // 6. Knock Retard Initial Matrix
    const knockGrid = Array.from({ length: 16 }, () => Array(16).fill(0));

    return {
      engineId: state.id,
      revLimiterRpm: state.tuning?.revLimiterRpm || 7800,
      idleRpm: 850,
      fuelMap: {
        id: "fuel_ve",
        name: "Volumetric Efficiency (VE %)",
        unit: "%",
        minValue: 40,
        maxValue: 140,
        axis: { rpmBreakpoints: rpmAxis, loadKPaBreakpoints: loadAxis },
        grid: fuelGrid,
      },
      ignitionMap: {
        id: "ignition_timing",
        name: "Ignition Timing Advance",
        unit: "°BTDC",
        minValue: 0,
        maxValue: 55,
        axis: { rpmBreakpoints: rpmAxis, loadKPaBreakpoints: loadAxis },
        grid: ignitionGrid,
      },
      targetAfrMap: {
        id: "target_afr",
        name: "Target Air-Fuel Ratio (AFR)",
        unit: "AFR",
        minValue: 10.0,
        maxValue: 16.0,
        axis: { rpmBreakpoints: rpmAxis, loadKPaBreakpoints: loadAxis },
        grid: afrGrid,
      },
      vvtIntakeMap: {
        id: "vvt_intake",
        name: "VVT Intake Cam Advance",
        unit: "°Adv",
        minValue: 0,
        maxValue: 50,
        axis: { rpmBreakpoints: rpmAxis, loadKPaBreakpoints: loadAxis },
        grid: vvtGrid,
      },
      wastegateMap: {
        id: "wastegate_duty",
        name: "Wastegate Control Duty Cycle",
        unit: "%",
        minValue: 0,
        maxValue: 100,
        axis: { rpmBreakpoints: rpmAxis, loadKPaBreakpoints: loadAxis },
        grid: wgGrid,
      },
      knockRetardMatrix: knockGrid,
    };
  }

  /**
   * Bi-linear interpolation of a 16x16 ECU Map for continuous live tracing
   */
  public static interpolateMapValue(
    map: ECUMap16x16,
    rpm: number,
    loadKPa: number
  ): LiveECUTracePoint {
    const rpmAxis = map.axis.rpmBreakpoints;
    const loadAxis = map.axis.loadKPaBreakpoints;

    // Find bounding column (RPM)
    let c0 = 0;
    while (c0 < rpmAxis.length - 2 && rpmAxis[c0 + 1] <= rpm) c0++;
    const c1 = Math.min(rpmAxis.length - 1, c0 + 1);

    // Find bounding row (Load)
    let r0 = 0;
    while (r0 < loadAxis.length - 2 && loadAxis[r0 + 1] <= loadKPa) r0++;
    const r1 = Math.min(loadAxis.length - 1, r0 + 1);

    // Fractional offsets (0.0 to 1.0)
    const tCol = (rpmAxis[c1] === rpmAxis[c0]) ? 0 : (rpm - rpmAxis[c0]) / (rpmAxis[c1] - rpmAxis[c0]);
    const tRow = (loadAxis[r1] === loadAxis[r0]) ? 0 : (loadKPa - loadAxis[r0]) / (loadAxis[r1] - loadAxis[r0]);

    const v00 = map.grid[r0][c0];
    const v01 = map.grid[r0][c1];
    const v10 = map.grid[r1][c0];
    const v11 = map.grid[r1][c1];

    const vTop = v00 + tCol * (v01 - v00);
    const vBot = v10 + tCol * (v11 - v10);
    const interpolatedVal = vTop + tRow * (vBot - vTop);

    return {
      rpm,
      loadKPa,
      rowIndex: r0,
      colIndex: c0,
      interpolatedValue: Number(interpolatedVal.toFixed(2)),
      activeMapId: map.id,
    };
  }

  /**
   * Applies cell bump (+/- offset) to selected cells
   */
  public static bumpMapCells(
    map: ECUMap16x16,
    cellCoords: { row: number; col: number }[],
    delta: number
  ): ECUMap16x16 {
    const newGrid = map.grid.map(row => [...row]);
    cellCoords.forEach(({ row, col }) => {
      if (row >= 0 && row < 16 && col >= 0 && col < 16) {
        const newVal = newGrid[row][col] + delta;
        newGrid[row][col] = Number(Math.max(map.minValue, Math.min(map.maxValue, newVal)).toFixed(2));
      }
    });

    return { ...map, grid: newGrid };
  }

  /**
   * Applies Gaussian neighborhood smoothing to a 16x16 grid
   */
  public static smoothMap(map: ECUMap16x16): ECUMap16x16 {
    const numRows = map.grid.length;
    const numCols = map.grid[0].length;
    const smoothedGrid: number[][] = [];

    for (let r = 0; r < numRows; r++) {
      const newRow: number[] = [];
      for (let c = 0; c < numCols; c++) {
        let sum = 0;
        let count = 0;

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols) {
              const weight = (dr === 0 && dc === 0) ? 2.0 : 1.0;
              sum += map.grid[nr][nc] * weight;
              count += weight;
            }
          }
        }
        newRow.push(Number((sum / count).toFixed(2)));
      }
      smoothedGrid.push(newRow);
    }

    return { ...map, grid: smoothedGrid };
  }
}
