// ===================================================================
// TUTORIAL ASSISTANT — Context-Aware Engineering Onboarding
// ===================================================================

export interface TutorialTip {
  id: string;
  topic: string;
  title: string;
  explanation: string;
  impactSummary: string;
  difficulty: "beginner" | "intermediate" | "expert";
}

export class TutorialAssistant {
  private static seenTipIds: Set<string> = new Set();

  public static getContextualTip(activeTab: string, designState: any): TutorialTip | null {
    if (activeTab === "engine" || activeTab === "powertrain") {
      return {
        id: "tip_bore_stroke_ratio",
        topic: "Engine Architecture",
        title: "Understanding Bore vs Stroke Ratio",
        explanation: "Over-square engines (bore > stroke) breathe better at high RPMs for peak horsepower. Under-square engines (stroke > bore) provide strong low-end torque for daily driving.",
        impactSummary: "Affects RPM limit, peak power RPM, and low-end torque curve.",
        difficulty: "beginner",
      };
    }

    if (activeTab === "aero") {
      return {
        id: "tip_aero_balance",
        topic: "Aerodynamics",
        title: "Centre of Pressure vs Centre of Mass",
        explanation: "Aerodynamic balance measures the ratio of front vs rear downforce. If aerodynamic balance is too far back (>65%), the front tyres float at speed, causing high-speed understeer.",
        impactSummary: "Crucial for high-speed cornering stability above 150 km/h.",
        difficulty: "intermediate",
      };
    }

    return {
      id: "tip_modular_chassis",
      topic: "Modular Assembly",
      title: "Master Chassis Hardpoints",
      explanation: "Every component in this simulator attaches directly to 3D chassis hardpoints defined in millimeters relative to the rear axle origin.",
      impactSummary: "Determines physical snap alignment and mass distribution.",
      difficulty: "beginner",
    };
  }

  public static markTipAsSeen(tipId: string): void {
    TutorialAssistant.seenTipIds.add(tipId);
  }
}
