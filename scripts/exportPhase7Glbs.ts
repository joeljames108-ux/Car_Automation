import { GeneratePhase7ExteriorGlbSuite } from "../src/exterior3d/export/generatePhase7ExteriorGlbSuite";

async function main() {
  console.log("Exporting Phase 7 Master Exterior 3D Binary GLB Models...");
  const exported = await GeneratePhase7ExteriorGlbSuite.exportAllPhase7Glbs("public/models/exterior");
  console.log("Successfully exported Phase 7 Master GLB files:");
  exported.forEach((p) => console.log(` - ${p}`));
}

main().catch((err) => {
  console.error("Export error:", err);
  process.exit(1);
});
