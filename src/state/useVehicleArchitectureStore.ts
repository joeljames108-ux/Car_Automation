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
  VehicleArchitectureConfig,
  ArchitectureValidationResult,
  CentralVehicleConfiguration,
  createCentralVehicleConfiguration,
} from "../sim/vehicleArchitecture/vehicleArchitectureTypes";
import {
  getVehicleArchitecture,
  getDefaultVehicleArchitecture,
} from "../sim/vehicleArchitecture/vehicleArchitectureRegistry";
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
  architecture: VehicleArchitectureConfig;
  validationResult: ArchitectureValidationResult | null;
  isValidating: boolean;
  isPackageLoaded: boolean;
  isDesignStudioUnlocked: boolean;
  layers: ArchitectureLayerVisibility;

  // Actions
  selectCategory: (category: VehicleCategory) => void;
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
      architecture: getDefaultVehicleArchitecture(),
      validationResult: VehicleAssetValidator.validateConfigContracts(getDefaultVehicleArchitecture()),
      isValidating: false,
      isPackageLoaded: true,
      isDesignStudioUnlocked: true,
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
          architecture: def,
          validationResult: VehicleAssetValidator.validateConfigContracts(def),
          isPackageLoaded: true,
          isDesignStudioUnlocked: true,
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
        isPackageLoaded: state.isPackageLoaded,
        isDesignStudioUnlocked: state.isDesignStudioUnlocked,
        layers: state.layers,
      }),
    }
  )
);
