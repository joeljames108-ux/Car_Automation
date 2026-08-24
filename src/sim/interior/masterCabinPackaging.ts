/**
 * ============================================================================
 * MODULAR INTERIOR STUDIO — MASTER CABIN PACKAGING & GEOMETRIC ZONING
 * ============================================================================
 * Computes exact 3D packaging boundaries, zone envelopes, and clearance checks:
 * - Zone 1: Driver Seat Zone (Front-Left)
 * - Zone 2: Passenger Seat Zone (Front-Right)
 * - Zone 3: Rear Seating / Roll Cage Zone
 * - Zone 4: Dashboard & Instrument Binnacle Zone
 * - Zone 5: Center Tunnel / EV Flat Floor Interface
 * - Zone 6: Door Ingress & Armrest Zones (Left & Right)
 * - Zone 7: Roof / Starlight Headliner Envelope
 * - Zone 8: Pedal Box & Driver Footwell Clearance
 * ============================================================================
 */

import { VehicleBodyType } from "../../exterior3d/types/vehicleConstructionTypes";

export interface CabinZoneBoundingBox {
  minMm: { x: number; y: number; z: number };
  maxMm: { x: number; y: number; z: number };
  centerMm: { x: number; y: number; z: number };
  volumeLiters: number;
}

export interface MasterCabinZoningEnvelope {
  driverSeatZone: CabinZoneBoundingBox;
  passengerSeatZone: CabinZoneBoundingBox;
  rearSeatZone: CabinZoneBoundingBox;
  dashboardZone: CabinZoneBoundingBox;
  centerTunnelZone: CabinZoneBoundingBox;
  leftDoorZone: CabinZoneBoundingBox;
  rightDoorZone: CabinZoneBoundingBox;
  roofZone: CabinZoneBoundingBox;
  footwellZone: CabinZoneBoundingBox;
  
  // Dimensional Clearances
  driverHeadroomMm: number;
  driverLegroomMm: number;
  shoulderRoomMm: number;
  tunnelHeightMm: number;
  hasRollCageInterference: boolean;
}

export class MasterCabinPackagingEngine {
  /**
   * Calculates dynamic cabin zone bounding boxes adapted to vehicle body geometry and powertrain architecture.
   */
  public static calculateCabinPackaging(
    bodyType: VehicleBodyType,
    wheelbaseMm: number,
    trackWidthMm: number,
    hasTransmissionTunnel: boolean,
    hasRollCage: boolean
  ): MasterCabinZoningEnvelope {
    const halfTrack = trackWidthMm / 2;
    const isSupercar = bodyType === "supercar" || bodyType === "hypercar";
    const isSUV = bodyType === "pickup" || (bodyType as string) === "suv" || (bodyType as string) === "truck";

    // Roof & Floor Height adjustments
    const cabinFloorY = isSupercar ? 180 : isSUV ? 350 : 250;
    const cabinRoofY = isSupercar ? 1120 : isSUV ? 1680 : 1380;
    const tunnelH = hasTransmissionTunnel ? (isSupercar ? 280 : 210) : 40; // EV flat floor is only 40mm

    // Driver Seat Zone
    const driverSeatZone: CabinZoneBoundingBox = {
      minMm: { x: -900, y: cabinFloorY, z: -halfTrack + 120 },
      maxMm: { x: -380, y: cabinFloorY + 820, z: -tunnelH - 40 },
      centerMm: { x: -640, y: cabinFloorY + 410, z: -(halfTrack / 2) },
      volumeLiters: 185,
    };

    // Passenger Seat Zone
    const passengerSeatZone: CabinZoneBoundingBox = {
      minMm: { x: -900, y: cabinFloorY, z: tunnelH + 40 },
      maxMm: { x: -380, y: cabinFloorY + 820, z: halfTrack - 120 },
      centerMm: { x: -640, y: cabinFloorY + 410, z: halfTrack / 2 },
      volumeLiters: 185,
    };

    // Rear Seat Zone
    const rearSeatZone: CabinZoneBoundingBox = {
      minMm: { x: -1600, y: cabinFloorY + 60, z: -halfTrack + 150 },
      maxMm: { x: -950, y: cabinFloorY + 800, z: halfTrack - 150 },
      centerMm: { x: -1275, y: cabinFloorY + 430, z: 0 },
      volumeLiters: isSupercar ? 60 : 340,
    };

    // Dashboard Zone
    const dashboardZone: CabinZoneBoundingBox = {
      minMm: { x: -380, y: cabinFloorY + 380, z: -halfTrack + 80 },
      maxMm: { x: -80, y: cabinRoofY - 200, z: halfTrack - 80 },
      centerMm: { x: -230, y: cabinFloorY + 580, z: 0 },
      volumeLiters: 145,
    };

    // Center Tunnel Zone
    const centerTunnelZone: CabinZoneBoundingBox = {
      minMm: { x: -1100, y: cabinFloorY, z: -180 },
      maxMm: { x: -280, y: cabinFloorY + tunnelH + 120, z: 180 },
      centerMm: { x: -690, y: cabinFloorY + (tunnelH + 120) / 2, z: 0 },
      volumeLiters: 65,
    };

    // Door Zones
    const leftDoorZone: CabinZoneBoundingBox = {
      minMm: { x: -1050, y: cabinFloorY + 100, z: -halfTrack - 40 },
      maxMm: { x: -250, y: cabinRoofY - 150, z: -halfTrack + 100 },
      centerMm: { x: -650, y: cabinFloorY + 450, z: -halfTrack + 30 },
      volumeLiters: 75,
    };

    const rightDoorZone: CabinZoneBoundingBox = {
      minMm: { x: -1050, y: cabinFloorY + 100, z: halfTrack - 100 },
      maxMm: { x: -250, y: cabinRoofY - 150, z: halfTrack + 40 },
      centerMm: { x: -650, y: cabinFloorY + 450, z: halfTrack - 30 },
      volumeLiters: 75,
    };

    // Roof Zone
    const roofZone: CabinZoneBoundingBox = {
      minMm: { x: -1500, y: cabinRoofY - 100, z: -halfTrack + 160 },
      maxMm: { x: -100, y: cabinRoofY, z: halfTrack - 160 },
      centerMm: { x: -800, y: cabinRoofY - 50, z: 0 },
      volumeLiters: 110,
    };

    // Footwell Zone
    const footwellZone: CabinZoneBoundingBox = {
      minMm: { x: -280, y: cabinFloorY, z: -halfTrack + 120 },
      maxMm: { x: 50, y: cabinFloorY + 380, z: -tunnelH - 40 },
      centerMm: { x: -115, y: cabinFloorY + 190, z: -(halfTrack / 2) },
      volumeLiters: 55,
    };

    // Clearances (SAE J1100 Effective Headroom from seat H-point to roof)
    const driverHeadroomMm = cabinRoofY - (cabinFloorY + 180);
    const driverLegroomMm = Math.abs(driverSeatZone.centerMm.x - footwellZone.centerMm.x) + 520;
    const shoulderRoomMm = trackWidthMm - 240;

    return {
      driverSeatZone,
      passengerSeatZone,
      rearSeatZone,
      dashboardZone,
      centerTunnelZone,
      leftDoorZone,
      rightDoorZone,
      roofZone,
      footwellZone,
      driverHeadroomMm,
      driverLegroomMm,
      shoulderRoomMm,
      tunnelHeightMm: tunnelH,
      hasRollCageInterference: hasRollCage && isSupercar && driverHeadroomMm < 820,
    };
  }
}
