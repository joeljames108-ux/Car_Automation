import { defaultDesign } from "./constants";
import type { VehicleDesign } from "./types";

/**
 * Apex GT3 Spec-R Motorsport Circuit Package
 *
 * Target Circuit Benchmark Lap Times:
 * - Monza: 1:46.8
 * - Zandvoort: 1:34.2
 * - Red Bull Ring: 1:28.3
 *
 * FIA GT3 Homologation Specs:
 * - 1,280 kg Carbon-Composite Unibody
 * - 4.0L Biturbo Flat-6 / V8 (620 HP @ 8,500 RPM, 700 Nm @ 6,200 RPM)
 * - GT3 Aero Downforce Package (Cl = -1.45, Cd = 0.36)
 * - 6-Speed Sequential Pneumatic Paddle-Shift Gearbox
 * - 380mm Carbon Ceramic Discs + 6-Piston Calipers
 * - Racing Semi-Slick Compounds (305/30 R19 Front, 335/30 R20 Rear)
 */
export function createGT3SpecRDesign(): VehicleDesign {
  const v = defaultDesign();
  v.name = "Apex GT3 Spec-R";
  v.vehicle.platform = "motorsport";
  v.vehicle.exterior.bodyType = "gt_race_car";

  // Engine Configuration (4.0L Biturbo 620 HP GT3 Spec)
  v.engine.layout = "i6";
  v.engine.bore = 95;
  v.engine.stroke = 94.4; // 4,015 cc
  v.engine.redline = 9000;
  v.engine.rpmLimiter = 9000;
  v.engine.valvetrain = "dohc_vvl";
  v.engine.crank = "forged_steel";
  v.engine.pistons = "forged";
  v.engine.intake = "turbo_single";
  v.engine.turboSize = 0.65;
  v.engine.fuelSystem = "direct";
  v.engine.compressionRatio = 10.8;

  // Vehicle Dynamics & Drivetrain
  v.vehicle.driveType = "rwd";
  v.vehicle.enginePosition = "mid";
  v.vehicle.transmission = "seq_6";
  v.vehicle.brakeType = "carbon_ceramic";
  v.vehicle.tireCompound = "slick";

  // GT3 High-Downforce Aerodynamics Package
  v.vehicle.aero.wingAngle = 16;
  v.vehicle.aero.underbody = "ground_effect";

  return v;
}
