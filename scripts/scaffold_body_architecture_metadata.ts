// ============================================================================
// SCAFFOLD BODY ARCHITECTURE METADATA JSON COMPANIONS
// ============================================================================
// Emits public/models/vehicles/{architecture}/{era}/metadata.json
// for all 168 cells (24 Architectures × 7 Eras).
// ============================================================================

import * as fs from "fs";
import * as path from "path";
import {
  ARCHITECTURES,
  ERAS,
  BODY_ARCHITECTURE_MATRIX,
  BodyArchitectureCell,
} from "../src/sim/bodyArchitectureMatrix";

const PUBLIC_VEHICLES_DIR = path.resolve(process.cwd(), "public", "models", "vehicles");

export function scaffoldAllMetadata(): { totalEmitted: number; dirPath: string } {
  console.log(`[Scaffold] Creating directory structure at: ${PUBLIC_VEHICLES_DIR}`);
  if (!fs.existsSync(PUBLIC_VEHICLES_DIR)) {
    fs.mkdirSync(PUBLIC_VEHICLES_DIR, { recursive: true });
  }

  let totalEmitted = 0;

  for (const arch of ARCHITECTURES) {
    const archRow = BODY_ARCHITECTURE_MATRIX[arch.id];
    if (!archRow) continue;

    for (const era of ERAS) {
      const cell: BodyArchitectureCell = archRow[era.id];
      if (!cell) continue;

      const eraDir = path.join(PUBLIC_VEHICLES_DIR, arch.id, era.id);
      if (!fs.existsSync(eraDir)) {
        fs.mkdirSync(eraDir, { recursive: true });
      }

      const metadataPath = path.join(eraDir, "metadata.json");
      const metadataContent = {
        architecture: cell.architecture,
        era: cell.era,
        referenceVehicle: cell.referenceVehicle,
        inspirationOnly: cell.inspirationOnly,
        glb: cell.glb,
        designDNA: cell.designDNA,
      };

      fs.writeFileSync(metadataPath, JSON.stringify(metadataContent, null, 2), "utf8");
      totalEmitted++;
    }
  }

  // Also emit the master 168-cell matrix JSON manifest at public/models/vehicles/matrix_manifest.json
  const manifestPath = path.join(PUBLIC_VEHICLES_DIR, "matrix_manifest.json");
  const allCells: any[] = [];
  for (const arch of ARCHITECTURES) {
    for (const era of ERAS) {
      const c = BODY_ARCHITECTURE_MATRIX[arch.id]?.[era.id];
      if (c) {
        allCells.push({
          architecture: c.architecture,
          era: c.era,
          referenceVehicle: c.referenceVehicle,
          inspirationOnly: c.inspirationOnly,
          glb: c.glb,
          designDNA: c.designDNA,
        });
      }
    }
  }
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        architecturesCount: ARCHITECTURES.length,
        erasCount: ERAS.length,
        totalCells: allCells.length,
        cells: allCells,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`[Scaffold] Successfully emitted ${totalEmitted} metadata.json files + master matrix_manifest.json!`);
  return { totalEmitted, dirPath: PUBLIC_VEHICLES_DIR };
}

const res = scaffoldAllMetadata();
console.log(`✅ Emitted ${res.totalEmitted} / 168 metadata files in ${res.dirPath}`);
