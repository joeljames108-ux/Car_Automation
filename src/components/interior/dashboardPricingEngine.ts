/**
 * ============================================================================
 * DASHBOARD PRICING & ENGINEERING ENGINE
 * ============================================================================
 * Computes live cost breakdown, weight impact, power draw, and scores
 * for the interior studio workbench.
 * ============================================================================
 */

import {
  SteeringWheelStyle,
  DashboardTrimType,
  ShifterStyle,
  SeatStyle,
  HUDMode,
} from "../../state/interiorDashboardConfigStore";

export interface ItemCostBreakdown {
  category: string;
  item: string;
  priceDelta: number;
  weightDeltaKg: number;
  powerDeltaW: number;
}

export class DashboardPricingEngine {
  public static getItemBreakdown(state: {
    steeringWheelStyle: SteeringWheelStyle;
    dashboardTrimMaterial: DashboardTrimType;
    shifterStyle: ShifterStyle;
    seatStyle: SeatStyle;
    hudMode: HUDMode;
  }): ItemCostBreakdown[] {
    const items: ItemCostBreakdown[] = [];

    // Steering
    const wheelPrices: Record<SteeringWheelStyle, { price: number; weight: number }> = {
      sport: { price: 0, weight: 0 },
      gt_3spoke: { price: 1400, weight: -0.6 },
      yoke: { price: 2200, weight: -1.2 },
      formula: { price: 3500, weight: -1.8 },
      luxury_2spoke: { price: 1200, weight: 0.5 },
      classic_4spoke: { price: 1800, weight: 0.8 },
      performance_4spoke: { price: 2800, weight: -1.4 },
    };
    const w = wheelPrices[state.steeringWheelStyle] || { price: 0, weight: 0 };
    items.push({
      category: "Steering Wheel",
      item: state.steeringWheelStyle.toUpperCase().replace(/_/g, " "),
      priceDelta: w.price,
      weightDeltaKg: w.weight,
      powerDeltaW: 0,
    });

    // Trim
    const trimPrices: Record<DashboardTrimType, { price: number; weight: number }> = {
      walnut: { price: 2000, weight: 2.5 },
      dark_walnut: { price: 2400, weight: 2.5 },
      carbon: { price: 2500, weight: -2.2 },
      forged_carbon: { price: 4500, weight: -3.0 },
      titanium: { price: 1800, weight: -1.0 },
      aluminum: { price: 0, weight: 0 },
      piano_black: { price: 800, weight: 0.5 },
      smoked_chrome: { price: 1200, weight: 0.3 },
      bronze: { price: 1500, weight: 0.8 },
      copper: { price: 1600, weight: 0.8 },
      ceramic: { price: 2200, weight: 0.4 },
    };
    const t = trimPrices[state.dashboardTrimMaterial] || { price: 0, weight: 0 };
    items.push({
      category: "Dashboard Trim",
      item: state.dashboardTrimMaterial.toUpperCase().replace(/_/g, " "),
      priceDelta: t.price,
      weightDeltaKg: t.weight,
      powerDeltaW: 0,
    });

    // Shifter
    const shifterPrices: Record<ShifterStyle, { price: number; weight: number }> = {
      auto: { price: 0, weight: 0 },
      manual_gated: { price: 1800, weight: -1.0 },
      manual_h: { price: 600, weight: -0.5 },
      toggle: { price: 400, weight: -0.8 },
      rotary: { price: 800, weight: 0.2 },
      crystal: { price: 2200, weight: 0.8 },
      performance: { price: 1500, weight: -1.5 },
    };
    const s = shifterPrices[state.shifterStyle] || { price: 0, weight: 0 };
    items.push({
      category: "Shifter Mechanism",
      item: state.shifterStyle.toUpperCase().replace(/_/g, " "),
      priceDelta: s.price,
      weightDeltaKg: s.weight,
      powerDeltaW: 0,
    });

    // Seats
    const seatPrices: Record<SeatStyle, { price: number; weight: number; power: number }> = {
      standard: { price: 0, weight: 0, power: 0 },
      sport: { price: 1200, weight: -2.0, power: 30 },
      bucket: { price: 3200, weight: -8.0, power: 0 },
      luxury: { price: 2500, weight: 16.0, power: 90 },
      racing: { price: 4800, weight: -14.0, power: 0 },
    };
    const st = seatPrices[state.seatStyle] || { price: 0, weight: 0, power: 0 };
    items.push({
      category: "Seating Architecture",
      item: state.seatStyle.toUpperCase(),
      priceDelta: st.price,
      weightDeltaKg: st.weight,
      powerDeltaW: st.power,
    });

    // HUD
    if (state.hudMode !== "off") {
      items.push({
        category: "HUD Avionics",
        item: "Head-Up Display",
        priceDelta: 1200,
        weightDeltaKg: 1.5,
        powerDeltaW: 25,
      });
    }

    return items;
  }
}
