// ===================================================================
// NVH ORDER TRACKING & SPECTRAL HARMONIC ANALYZER
// ===================================================================
// Calculates engine order frequencies, gearmesh orders, tire cavity
// resonance, and chassis structural resonance modes.
// ===================================================================

export interface AcousticOrderComponent {
  orderNumber: number; // Harmonic order relative to engine crank rotation (e.g. 2nd, 3rd, 6th)
  frequencyHz: number;
  amplitudeDba: number;
  sourceType: "COMBUSTION_FIRING" | "CRANKSHAFT_UNBALANCE" | "GEARMESH" | "TIRE_CAVITY" | "AERO_TURBULENCE";
  description: string;
}

export interface NvhOrderSweepResult {
  engineRpm: number;
  vehicleSpeedKmH: number;
  primaryFiringOrder: number;
  dominantFrequencyHz: number;
  totalSoundPressureDba: number;
  orderSpectrum: AcousticOrderComponent[];
  cabinBoomRisk: boolean;
}

export class OrderTrackingAnalyzer {
  /**
   * Calculates primary combustion firing order for any cylinder count and cycle (2-stroke or 4-stroke).
   */
  public static calculatePrimaryFiringOrder(cylinders: number, strokesPerCycle: number = 4): number {
    return (cylinders / strokesPerCycle) * 2;
  }

  /**
   * Performs an order sweep across engine RPM and vehicle speed.
   */
  public static analyzeOrders(params: {
    engineRpm: number;
    cylinders: number;
    vehicleSpeedKmH: number;
    gearRatio: number;
    finalDriveRatio: number;
    tireRadiusM: number;
    cabinIsolationDba: number; // Sound dampening subtraction
  }): NvhOrderSweepResult {
    const {
      engineRpm,
      cylinders,
      vehicleSpeedKmH,
      gearRatio,
      finalDriveRatio,
      tireRadiusM,
      cabinIsolationDba,
    } = params;

    const crankFreqHz = engineRpm / 60; // 1st Order (1E)
    const primaryOrder = this.calculatePrimaryFiringOrder(cylinders);
    const primaryFiringFreqHz = crankFreqHz * primaryOrder;

    const spectrum: AcousticOrderComponent[] = [];

    // 1. Primary Firing Order (e.g., 3.0E for V6, 4.0E for V8, 6.0E for V12)
    const firingAmpDba = Math.max(30, 88 + 20 * Math.log10(engineRpm / 3000) - cabinIsolationDba);
    spectrum.push({
      orderNumber: primaryOrder,
      frequencyHz: Number(primaryFiringFreqHz.toFixed(1)),
      amplitudeDba: Number(firingAmpDba.toFixed(1)),
      sourceType: "COMBUSTION_FIRING",
      description: `Primary ${cylinders}-cylinder firing order harmonic (${primaryOrder}E)`,
    });

    // 2. Secondary Firing Order (Half Order 0.5 * Primary)
    const halfOrder = primaryOrder * 0.5;
    const halfFreqHz = crankFreqHz * halfOrder;
    const halfAmpDba = Math.max(25, firingAmpDba - 12);
    spectrum.push({
      orderNumber: halfOrder,
      frequencyHz: Number(halfFreqHz.toFixed(1)),
      amplitudeDba: Number(halfAmpDba.toFixed(1)),
      sourceType: "COMBUSTION_FIRING",
      description: `Secondary half-order pulse (${halfOrder}E)`,
    });

    // 3. Transmission Gearmesh Order (Teeth count ~ 32 teeth)
    const gearmeshOrder = 32 * (1 / gearRatio);
    const gearmeshFreqHz = crankFreqHz * gearmeshOrder;
    const gearmeshAmpDba = Math.max(20, 65 + 10 * Math.log10(engineRpm / 4000) - cabinIsolationDba * 1.2);
    spectrum.push({
      orderNumber: Number(gearmeshOrder.toFixed(1)),
      frequencyHz: Number(gearmeshFreqHz.toFixed(1)),
      amplitudeDba: Number(gearmeshAmpDba.toFixed(1)),
      sourceType: "GEARMESH",
      description: `Transmission gearmesh order harmonic (${gearmeshOrder.toFixed(1)}E)`,
    });

    // 4. Tire Cavity Acoustic Resonance (~220 Hz fixed acoustic mode)
    const wheelRotationalFreqHz = (vehicleSpeedKmH / 3.6) / (2 * Math.PI * tireRadiusM);
    const tireCavityOrder = wheelRotationalFreqHz > 0 ? 220 / wheelRotationalFreqHz : 0;
    const tireCavityAmpDba = Math.max(20, 62 + 15 * Math.log10(vehicleSpeedKmH / 100) - cabinIsolationDba);
    spectrum.push({
      orderNumber: Number(tireCavityOrder.toFixed(1)),
      frequencyHz: 220.0,
      amplitudeDba: Number(tireCavityAmpDba.toFixed(1)),
      sourceType: "TIRE_CAVITY",
      description: `Tire internal air cavity acoustic mode (220 Hz)`,
    });

    // Compute RSS total sound pressure level (SPL) in dBA
    const totalPower = spectrum.reduce((acc, curr) => acc + Math.pow(10, curr.amplitudeDba / 10), 0);
    const totalSoundPressureDba = Number((10 * Math.log10(totalPower)).toFixed(1));

    // Check for low-frequency cabin boom (120 Hz - 180 Hz structural resonance)
    const cabinBoomRisk = primaryFiringFreqHz >= 120 && primaryFiringFreqHz <= 180 && firingAmpDba > 72;

    return {
      engineRpm,
      vehicleSpeedKmH,
      primaryFiringOrder: primaryOrder,
      dominantFrequencyHz: Number(primaryFiringFreqHz.toFixed(1)),
      totalSoundPressureDba,
      orderSpectrum: spectrum,
      cabinBoomRisk,
    };
  }
}
