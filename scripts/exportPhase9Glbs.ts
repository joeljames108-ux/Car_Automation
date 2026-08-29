import { GeneratePhase9ExteriorGlbSuite } from "../src/exterior3d/export/generatePhase9ExteriorGlbSuite";

async function main() {
  console.log("Exporting Phase 9 Master Exterior 3D Binary GLB Models...");
  const exported = await GeneratePhase9ExteriorGlbSuite.exportAllPhase9Glbs("public/models/exterior");
  console.log("Successfully exported Phase 9 Master GLB files:");
  exported.forEach((p) => console.log(` - ${p}`));
}

main().catch((err) => {
  console.error("Export error:", err);
  process.exit(1);
});
