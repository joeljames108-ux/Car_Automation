import { describe, it, expect } from "vitest";
import {
  GAME_TIPS,
  getRandomGameTip,
  getGameTipsByCategory,
  getGameTipsForStage,
  type GameTipCategory,
} from "../ui/loading/gameTipsData";
import { getStageLoadingConfig } from "../ui/loading/stageLoadingData";

describe("Stage Loading Game Tips Engine", () => {
  it("contains at least 20 comprehensive game tips across categories", () => {
    expect(GAME_TIPS.length).toBeGreaterThanOrEqual(20);
  });

  it("ensures every tip has complete required metadata and non-empty text", () => {
    for (const tip of GAME_TIPS) {
      expect(tip.id).toBeTruthy();
      expect(tip.category).toBeTruthy();
      expect(tip.categoryLabel).toBeTruthy();
      expect(tip.icon).toBeTruthy();
      expect(tip.badgeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(tip.title.trim().length).toBeGreaterThan(3);
      expect(tip.tip.trim().length).toBeGreaterThan(20);
      if (tip.impact) {
        expect(tip.impact.trim().length).toBeGreaterThan(5);
      }
    }
  });

  it("covers all primary gameplay and automotive engineering categories", () => {
    const requiredCategories: GameTipCategory[] = [
      "aerodynamics",
      "powertrain",
      "chassis",
      "manufacturing",
      "economy",
      "motorsport",
      "rd",
      "safety",
      "controls",
    ];

    const presentCategories = new Set(GAME_TIPS.map((t) => t.category));
    for (const cat of requiredCategories) {
      expect(presentCategories.has(cat)).toBe(true);
    }
  });

  it("returns a valid random tip from getRandomGameTip()", () => {
    const randomTip = getRandomGameTip();
    expect(randomTip).toBeDefined();
    expect(GAME_TIPS.some((t) => t.id === randomTip.id)).toBe(true);
  });

  it("accurately filters tips by category using getGameTipsByCategory()", () => {
    const aeroTips = getGameTipsByCategory("aerodynamics");
    expect(aeroTips.length).toBeGreaterThan(0);
    expect(aeroTips.every((t) => t.category === "aerodynamics")).toBe(true);

    const powertrainTips = getGameTipsByCategory("powertrain");
    expect(powertrainTips.length).toBeGreaterThan(0);
    expect(powertrainTips.every((t) => t.category === "powertrain")).toBe(true);
  });

  it("prioritizes domain-specific tips for stage context", () => {
    const aeroStageTips = getGameTipsForStage("aero_studio");
    expect(aeroStageTips[0].category).toBe("aerodynamics");

    const engineStageTips = getGameTipsForStage("engine");
    expect(engineStageTips[0].category).toBe("powertrain");

    const motorsportStageTips = getGameTipsForStage("motorsport");
    expect(motorsportStageTips[0].category).toBe("motorsport");

    const mainMenuTips = getGameTipsForStage("main_menu");
    expect(mainMenuTips.length).toBeGreaterThanOrEqual(20);
  });

  it("provides valid stage loading configuration for main_menu", () => {
    const config = getStageLoadingConfig("main_menu");
    expect(config.id).toBe("main_menu");
    expect(config.label).toBe("Apex Automotive Headquarters Hub");
    expect(config.schematicType).toBe("main_menu");
    expect(config.subtasks.length).toBeGreaterThanOrEqual(4);
    expect(config.telemetryLogs.length).toBeGreaterThanOrEqual(3);
    expect(config.metrics.length).toBeGreaterThanOrEqual(2);
  });
});
