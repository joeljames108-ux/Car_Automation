// ===================================================================
// EXTERIOR 2D / 3D ASSEMBLY SYNCHRONIZATION BRIDGE
// ===================================================================
// Bi-directional reactive bridge keeping the 2D Zustand assembly store
// and the 3D React Three Fiber scene graph in 100% real-time lockstep.
// ===================================================================

import { useEffect } from "react";
import { useExteriorAssemblyStore } from "../../state/useExteriorAssemblyStore";
import { useExterior3DStore } from "./useExterior3DStore";

export function useExteriorAssembly3DBridge(): void {
  const installedComponents = useExteriorAssemblyStore((s) => s.installedComponents);
  const selectedVariants = useExteriorAssemblyStore((s) => s.selectedVariants);
  const exteriorConfig = useExteriorAssemblyStore((s) => s.exteriorConfig);
  const paintConfig = useExteriorAssemblyStore((s) => s.paintConfig);
  const aeroConfig = useExteriorAssemblyStore((s) => s.aeroConfig);
  const explodedAmount = useExteriorAssemblyStore((s) => s.explodedAmount);

  const syncWith2DStore = useExterior3DStore((s) => s.syncWith2DStore);
  const setExplodedAmount3D = useExterior3DStore((s) => s.setExplodedAmount);

  // Sync 2D store changes to 3D scene graph
  useEffect(() => {
    syncWith2DStore(
      installedComponents,
      selectedVariants,
      exteriorConfig,
      paintConfig,
      aeroConfig
    );
  }, [
    installedComponents,
    selectedVariants,
    exteriorConfig,
    paintConfig,
    aeroConfig,
    syncWith2DStore,
  ]);

  // Sync continuous exploded slider
  useEffect(() => {
    setExplodedAmount3D(explodedAmount);
  }, [explodedAmount, setExplodedAmount3D]);
}
