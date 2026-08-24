/**
 * ============================================================================
 * TRACK LAYOUT CATALOG TEST SUITE
 * ============================================================================
 */

import { TRACK_LAYOUT_CATALOG } from "../trackLayoutSvgCatalog";
import { TRACKS } from "../../../sim/constants";
import { TrackId } from "../../../sim/types";

export function runTrackLayoutCatalogTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      console.log(`[PASS] Track Layout Test: ${testName}`);
    } else {
      failed++;
      console.error(`[FAIL] Track Layout Test: ${testName}`);
    }
  }

  // Test 1: All 23 tracks in TRACKS have layout entries in TRACK_LAYOUT_CATALOG
  const allTrackIds = Object.keys(TRACKS) as TrackId[];
  for (const tId of allTrackIds) {
    const layout = TRACK_LAYOUT_CATALOG[tId];
    assert(!!layout, `Track layout exists for ${tId}`);
    if (layout) {
      assert(layout.svgPathD.length > 10, `Track ${tId} has valid SVG path string`);
      assert(layout.keyCorners.length > 0, `Track ${tId} defines key corners`);
      assert(layout.drsZoneAnchors.length > 0, `Track ${tId} defines DRS zones`);
    }
  }

  return { passed, failed };
}
