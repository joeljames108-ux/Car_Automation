/**
 * ============================================================================
 * SCROLL-DRIVEN 3D STORYTELLING — VERIFICATION TEST SUITE
 * ============================================================================
 * Tests keyframe completeness, interpolation monotonicity, boundary clamping,
 * exploded view factor transitions, and panel group mapping for all 5 stages.
 * ============================================================================
 */

import {
  STAGE_STORY_KEYFRAMES,
  interpolateStoryState,
} from "../../state/storytelling3DStore";

type WorkflowStage = "engine" | "vehicle" | "aero" | "interior" | "final_build";
const ALL_STAGES: WorkflowStage[] = ["engine", "vehicle", "aero", "interior", "final_build"];

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`);
    failed++;
  }
}

console.log("═══════════════════════════════════════════════════════════════════");
console.log("SCROLL-DRIVEN 3D STORYTELLING VERIFICATION SUITE");
console.log("═══════════════════════════════════════════════════════════════════\n");

// 1. Keyframe Existence
console.log("── 1. Keyframe Existence ──");
for (const stage of ALL_STAGES) {
  const kfs = STAGE_STORY_KEYFRAMES[stage];
  assert(!!kfs && Array.isArray(kfs), `Stage '${stage}' has keyframes array`);
  assert(kfs.length >= 4, `Stage '${stage}' has ≥4 keyframes (got ${kfs.length})`);
}

// 2. Keyframe Structure
console.log("\n── 2. Keyframe Structure ──");
for (const stage of ALL_STAGES) {
  for (const kf of STAGE_STORY_KEYFRAMES[stage]) {
    assert(typeof kf.id === "string" && kf.id.length > 0, `KF '${kf.id}' has valid id`);
    assert(kf.progress >= 0.0 && kf.progress <= 1.0, `KF '${kf.id}' progress in [0,1]`);
    assert(Array.isArray(kf.cameraPosition) && kf.cameraPosition.length === 3, `KF '${kf.id}' has 3D camPos`);
    assert(Array.isArray(kf.cameraTarget) && kf.cameraTarget.length === 3, `KF '${kf.id}' has 3D camTarget`);
    assert(typeof kf.fov === "number" && kf.fov > 0, `KF '${kf.id}' has valid FOV`);
    assert(kf.explodedFactor >= 0.0 && kf.explodedFactor <= 1.0, `KF '${kf.id}' exploded in [0,1]`);
    assert(typeof kf.panelGroupId === "string", `KF '${kf.id}' has panelGroupId`);
    assert(typeof kf.title === "string" && kf.title.length > 0, `KF '${kf.id}' has title`);
  }
}

// 3. Progress Monotonicity
console.log("\n── 3. Progress Monotonicity ──");
for (const stage of ALL_STAGES) {
  const kfs = STAGE_STORY_KEYFRAMES[stage];
  let mono = true;
  for (let i = 1; i < kfs.length; i++) {
    if (kfs[i].progress <= kfs[i - 1].progress) { mono = false; break; }
  }
  assert(mono, `Stage '${stage}' keyframes are strictly increasing`);
}

// 4. Boundary Keyframes
console.log("\n── 4. Boundary Keyframes (0.0 start, 1.0 end) ──");
for (const stage of ALL_STAGES) {
  const kfs = STAGE_STORY_KEYFRAMES[stage];
  assert(kfs[0].progress === 0.0, `Stage '${stage}' starts at 0.0`);
  assert(kfs[kfs.length - 1].progress === 1.0, `Stage '${stage}' ends at 1.0`);
}

// 5. Interpolation Boundary Clamping
console.log("\n── 5. Interpolation Clamping ──");
for (const stage of ALL_STAGES) {
  assert(interpolateStoryState(stage, -0.5).progress === 0.0, `${stage}: negative → 0.0`);
  assert(interpolateStoryState(stage, 1.5).progress === 1.0, `${stage}: over → 1.0`);
  assert(interpolateStoryState(stage, 0.0).progress === 0.0, `${stage}: 0.0 valid`);
  assert(interpolateStoryState(stage, 1.0).progress === 1.0, `${stage}: 1.0 valid`);
}

// 6. No NaN / Infinity in Interpolation
console.log("\n── 6. Interpolation Continuity (No NaN/Inf) ──");
for (const stage of ALL_STAGES) {
  let allOk = true;
  for (const p of [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]) {
    const s = interpolateStoryState(stage, p);
    const vals = [...s.cameraPosition, ...s.cameraTarget, s.fov, s.explodedFactor];
    for (const v of vals) { if (!isFinite(v) || isNaN(v)) allOk = false; }
  }
  assert(allOk, `Stage '${stage}' no NaN/Inf across 11 steps`);
}

// 7. Exploded Factor Transitions
console.log("\n── 7. Exploded Factor Transitions ──");
for (const stage of ALL_STAGES) {
  const kfs = STAGE_STORY_KEYFRAMES[stage];
  assert(kfs[0].explodedFactor === 0.0, `${stage} starts assembled (0.0)`);
  assert(kfs[kfs.length - 1].explodedFactor === 0.0, `${stage} ends assembled (0.0)`);
  assert(kfs.some((kf) => kf.explodedFactor > 0), `${stage} has exploded intermediate`);
}

// 8. Panel Group Mapping
console.log("\n── 8. Panel Group Mapping ──");
for (const stage of ALL_STAGES) {
  const groups = new Set(STAGE_STORY_KEYFRAMES[stage].map((kf) => kf.panelGroupId));
  assert(groups.size >= 2, `Stage '${stage}' has ≥2 panel groups (got ${groups.size})`);
}

// 9. Active Keyframe Selection
console.log("\n── 9. Active Keyframe Selection ──");
for (const stage of ALL_STAGES) {
  const kfs = STAGE_STORY_KEYFRAMES[stage];
  const s0 = interpolateStoryState(stage, 0.0);
  assert(s0.activeKeyframe.id === kfs[0].id, `${stage}: at 0.0 selects first`);
  const s1 = interpolateStoryState(stage, 1.0);
  assert(s1.activeKeyframe.id === kfs[kfs.length - 1].id, `${stage}: at 1.0 selects last`);
}

// 10. Midpoint Interpolation
console.log("\n── 10. Midpoint Camera Interpolation ──");
for (const stage of ALL_STAGES) {
  const kfs = STAGE_STORY_KEYFRAMES[stage];
  if (kfs.length >= 2) {
    const mid = (kfs[0].progress + kfs[1].progress) / 2;
    const s = interpolateStoryState(stage, mid);
    for (let axis = 0; axis < 3; axis++) {
      const lo = Math.min(kfs[0].cameraPosition[axis], kfs[1].cameraPosition[axis]);
      const hi = Math.max(kfs[0].cameraPosition[axis], kfs[1].cameraPosition[axis]);
      assert(
        s.cameraPosition[axis] >= lo - 0.01 && s.cameraPosition[axis] <= hi + 0.01,
        `${stage}: midpoint cam[${axis}] is between keyframes`
      );
    }
  }
}

// Summary
console.log("\n═══════════════════════════════════════════════════════════════════");
console.log(`STORYTELLING 3D SUITE: ${passed}/${passed + failed} TESTS PASSED`);
console.log("═══════════════════════════════════════════════════════════════════");

if (failed === 0) {
  console.log("🎉 ALL SCROLL-DRIVEN 3D STORYTELLING TESTS PASSED!\n");
} else {
  console.error(`\n⛔ ${failed} TESTS FAILED\n`);
  process.exit(1);
}
