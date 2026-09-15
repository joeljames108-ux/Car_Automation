// ============================================================================
// VEHICLE ARCHITECTURE STATE STORE (ZUSTAND)
// ============================================================================
// Manages the active vehicle category, engineering package loading,
// pre-flight validation status, layer visibility, and transition to Design Studio.
// ============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  VehicleCategory,
  VehicleEraId as LegacyVehicleEraId,
  VehicleArchitectureConfig,
  ArchitectureValidationResult,
  CentralVehicleConfiguration,
  VehicleArchitectureEraEntry,
  createCentralVehicleConfiguration,
} from "../sim/vehicleArchitecture/vehicleArchitectureTypes";
import {
  BodyArchitectureId,
  VehicleEraId,
  BodyArchitectureCell,
  getCell,
  getBodyGlbUrl,
} from "../sim/bodyArchitectureMatrix";
import {
  getVehicleArchitecture,
  getDefaultVehicleArchitecture,
} from "../sim/vehicleArchitecture/vehicleArchitectureRegistry";
import { getMatrixEntry } from "../sim/vehicleArchitecture/vehicleArchitectureMatrix";
import { VehicleAssetValidator } from "../sim/vehicleArchitecture/vehicleAssetValidator";

export interface ArchitectureLayerVisibility {
  chassis: boolean;
  bodyFramework: boolean;
  floor: boolean;
  wheelArches: boolean;
  hardpoints: boolean;
  envelopes: boolean;
}

export interface VehicleArchitectureState {
  selectedCategory: VehicleCategory;
  selectedEra: VehicleEraId | null;
  selectedArchitecture: BodyArchitectureId | null;
  selectedBodyCell: BodyArchitectureCell | null;
  activeBodyGlbUrl: string | null;
  architecture: VehicleArchitectureConfig;
  validationResult: ArchitectureValidationResult | null;
  isValidating: boolean;
  isPackageLoaded: boolean;
  isDesignStudioUnlocked: boolean;
  layers: ArchitectureLayerVisibility;

  // Actions
  selectCategory: (category: VehicleCategory) => void;
  selectEra: (era: VehicleEraId) => void;
  selectArchitectureAndEra: (category: VehicleCategory, era: VehicleEraId) => void;
  selectArchitectureEra: (arch: BodyArchitectureId | null, era: VehicleEraId | null) => void;
  clearArchitectureSelection: () => void;
  getActiveMatrixEntry: () => VehicleArchitectureEraEntry;
  getActiveGlbPath: () => string;
  isGlbPending: () => boolean;
  loadEngineeringPackage: () => Promise<boolean>;
  toggleLayer: (layer: keyof ArchitectureLayerVisibility) => void;
  setAllLayers: (visible: boolean) => void;
  resetToDefault: () => void;
  getCentralConfiguration: () => CentralVehicleConfiguration;
  getArchitectureMetadataForSave: () => {
    vehicleType: string;
    platformType: string;
    chassisVersion: string;
    bodyFrameworkVersion: string;
    designVersion: string;
    dimensions: {
      wheelbaseMm: number;
      trackFrontMm: number;
      trackRearMm: number;
      overallLengthMm: number;
      overallWidthMm: number;
      overallHeightMm: number;
    };
  };
}

export const useVehicleArchitectureStore = create<VehicleArchitectureState>()(
  persist(
    (set, get) => ({
      selectedCategory: "sedan",
      selectedEra: null,
      selectedArchitecture: null,
      selectedBodyCell: null,
      activeBodyGlbUrl: null,
      architecture: getDefaultVehicleArchitecture(),
      validationResult: VehicleAssetValidator.validateConfigContracts(getDefaultVehicleArchitecture()),
      isValidating: false,
      isPackageLoaded: true,
      isDesignStudioUnlocked: false,
      layers: {
        chassis: true,
        bodyFramework: true,
        floor: true,
        wheelArches: true,
        hardpoints: true,
        envelopes: true,
      },

      selectCategory: (category: VehicleCategory) => {
        const arch = getVehicleArchitecture(category);
        const fastValidation = VehicleAssetValidator.validateConfigContracts(arch);
        set({
          selectedCategory: category,
          architecture: arch,
          validationResult: fastValidation,
          isPackageLoaded: fastValidation.isValid,
          isDesignStudioUnlocked: fastValidation.isValid,
        });
      },

      selectEra: (era: VehicleEraId) => {
        set({ selectedEra: era });
      },

      selectArchitectureAndEra: (category: VehicleCategory, era: VehicleEraId) => {
        const arch = getVehicleArchitecture(category);
        const fastValidation = VehicleAssetValidator.validateConfigContracts(arch);
        set({
          selectedCategory: category,
          selectedEra: era,
          architecture: arch,
          validationResult: fastValidation,
          isPackageLoaded: fastValidation.isValid,
          isDesignStudioUnlocked: fastValidation.isValid,
        });
      },

      selectArchitectureEra: (arch: BodyArchitectureId | null, era: VehicleEraId | null) => {
        if (!arch || !era) {
          set({
            selectedArchitecture: arch,
            selectedEra: era,
            selectedBodyCell: null,
            activeBodyGlbUrl: null,
            isDesignStudioUnlocked: false,
          });
          return;
        }

        const cell = getCell(arch, era);
        const bodyUrl = getBodyGlbUrl(arch, era);
        const cat = (arch as unknown) as VehicleCategory;
        const archConfig = getVehicleArchitecture(cat);
        const fastValidation = VehicleAssetValidator.validateConfigContracts(archConfig);

        set({
          selectedArchitecture: arch,
          selectedEra: era,
          selectedCategory: cat,
          selectedBodyCell: cell,
          activeBodyGlbUrl: bodyUrl,
          architecture: archConfig,
          validationResult: fastValidation,
          isPackageLoaded: fastValidation.isValid,
          isDesignStudioUnlocked: true,
        });
      },

      clearArchitectureSelection: () => {
        set({
          selectedArchitecture: null,
          selectedEra: null,
          selectedBodyCell: null,
          activeBodyGlbUrl: null,
          isDesignStudioUnlocked: false,
        });
      },

      getActiveMatrixEntry: () => {
        const { selectedCategory, selectedEra } = get();
        return getMatrixEntry(selectedCategory, selectedEra || "2020s");
      },

      getActiveGlbPath: () => {
        const entry = get().getActiveMatrixEntry();
        return entry.isGlbAvailable ? entry.glbPath : entry.fallbackGlbPath;
      },

      isGlbPending: () => {
        return !get().getActiveMatrixEntry().isGlbAvailable;
      },

      loadEngineeringPackage: async () => {
        const { architecture } = get();
        set({ isValidating: true });

        // Run fast contract validation + runtime check simulation
        const result = VehicleAssetValidator.validateConfigContracts(architecture);

        // Small simulated loading delay for crisp UI feedback
        await new Promise((res) => setTimeout(res, 400));

        set({
          isValidating: false,
          validationResult: result,
          isPackageLoaded: result.isValid,
          isDesignStudioUnlocked: result.isValid,
        });

        return result.isValid;
      },

      toggleLayer: (layer: keyof ArchitectureLayerVisibility) => {
        set((state) => ({
          layers: {
            ...state.layers,
            [layer]: !state.layers[layer],
          },
        }));
      },

      setAllLayers: (visible: boolean) => {
        set({
          layers: {
            chassis: visible,
            bodyFramework: visible,
            floor: visible,
            wheelArches: visible,
            hardpoints: visible,
            envelopes: visible,
          },
        });
      },

      resetToDefault: () => {
        const def = getDefaultVehicleArchitecture();
        set({
          selectedCategory: "sedan",
          selectedEra: null,
          selectedArchitecture: null,
          selectedBodyCell: null,
          activeBodyGlbUrl: null,
          architecture: def,
          validationResult: VehicleAssetValidator.validateConfigContracts(def),
          isPackageLoaded: true,
          isDesignStudioUnlocked: false,
          layers: {
            chassis: true,
            bodyFramework: true,
            floor: true,
            wheelArches: true,
            hardpoints: true,
            envelopes: true,
          },
        });
      },

      getCentralConfiguration: () => {
        return createCentralVehicleConfiguration(get().architecture);
      },

      getArchitectureMetadataForSave: () => {
        const { architecture } = get();
        return {
          vehicleType: architecture.category.toUpperCase(),
          platformType: architecture.metadata.platformType,
          chassisVersion: architecture.metadata.chassisVersion,
          bodyFrameworkVersion: architecture.metadata.bodyFrameworkVersion,
          designVersion: architecture.metadata.designVersion,
          dimensions: {
            wheelbaseMm: architecture.wheelbaseMm,
            trackFrontMm: architecture.trackFrontMm,
            trackRearMm: architecture.trackRearMm,
            overallLengthMm: architecture.overallLengthMm,
            overallWidthMm: architecture.overallWidthMm,
            overallHeightMm: architecture.overallHeightMm,
          },
        };
      },
    }),
    {
      name: "apex_vehicle_architecture_v1",
      partialize: (state) => ({
        selectedCategory: state.selectedCategory,
        selectedArchitecture: state.selectedArchitecture,
        selectedEra: state.selectedEra,
        isPackageLoaded: state.isPackageLoaded,
        isDesignStudioUnlocked: state.isDesignStudioUnlocked,
        layers: state.layers,
      }),
    }
  )
);
