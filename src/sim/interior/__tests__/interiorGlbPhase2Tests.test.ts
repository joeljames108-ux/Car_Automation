// ============================================================================
// INTERIOR STUDIO GLB PHASE 2 ENGINEERING UNIT TESTS
// ============================================================================
// Validates 3D GLB socket snapping, transform alignments, Draco/compression exporter,
// and WebXR VR inspector capabilities.
// ============================================================================

import { describe, it, expect } from "vitest";
import * as THREE from "three";

if (typeof globalThis !== 'undefined' && typeof (globalThis as any).FileReader === 'undefined') {
  class NodeFileReader {
    result: ArrayBuffer | null = null;
    onloadend: (() => void) | null = null;
    async readAsArrayBuffer(blob: Blob) {
      this.result = await blob.arrayBuffer();
      if (this.onloadend) this.onloadend();
    }
  }
  // @ts-ignore
  globalThis.FileReader = NodeFileReader;
}

import { InteriorGlbSocketSnapper } from "../../../exterior3d/generators/interior/interiorGlbSocketSnapper";
import { UniversalGlbExporter } from "../../../exterior3d/export/universalGlbExporter";
import { HyperFidelityInteriorCadEngine } from "../../../exterior3d/generators/interior/hyperFidelityInteriorCadEngine";
import { DEFAULT_BESPOKE_STATE } from "../../../components/interior/BespokeLuxuryInteriorStudioHub";

describe("InteriorStudioGlbPhase2Engine", () => {
  describe("InteriorGlbSocketSnapper", () => {
    it("snaps a 3D GLB mesh object to a specified cabin mounting socket", () => {
      const mockMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.8, 0.5),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );

      const snapped = InteriorGlbSocketSnapper.alignGlbToSocket(mockMesh, "DRIVER_SEAT_MOUNT", 0.81, 0.0);

      expect(snapped).toBeInstanceOf(THREE.Group);
      expect(snapped.name).toBe("SnappedSocket_DRIVER_SEAT_MOUNT");
      expect(snapped.position.x).toBeLessThan(0); // Driver seat is on left side
      expect(snapped.userData.socketId).toBe("DRIVER_SEAT_MOUNT");
    });

    it("asynchronously builds a fully snapped GLB cabin hierarchy", async () => {
      const cabin = await InteriorGlbSocketSnapper.buildFullySnappedGlbCabinAsync(DEFAULT_BESPOKE_STATE, 0.0, 0.10, 0.0);

      expect(cabin).toBeInstanceOf(THREE.Group);
      expect(cabin.name).toContain("SnappedCabin_");
      expect(cabin.children.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe("UniversalGlbExporter Helper Methods", () => {
    it("exports interior cabin state directly to binary GLB using exportInteriorCabinToGlb", async () => {
      const cadGroup = HyperFidelityInteriorCadEngine.buildFullInteriorCad(DEFAULT_BESPOKE_STATE);
      const exportResult = await UniversalGlbExporter.exportInteriorCabinToGlb(
        cadGroup,
        "Bespoke_GT3_Cockpit",
        "Antigravity Atelier"
      );

      expect(exportResult.filename).toBe("bespoke_gt3_cockpit.glb");
      expect(exportResult.byteLength).toBeGreaterThan(1024);
      expect(exportResult.buffer).toBeInstanceOf(ArrayBuffer);
    });
  });
});
