import { GeneratePhase8ExteriorGlbSuite } from "../src/exterior3d/export/generatePhase8ExteriorGlbSuite";

async function main() {
  console.log("Exporting Phase 8 Master Exterior 3D Binary GLB Models...");
  const exported = await GeneratePhase8ExteriorGlbSuite.exportAllPhase8Glbs("public/models/exterior");
  console.log("Successfully exported Phase 8 Master GLB files:");
  exported.forEach((p) => console.log(` - ${p}`));
}

main().catch((err) => {
  console.error("Export error:", err);
  process.exit(1);
});
