// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — REACT THREE FIBER DYNAMIC LIGHTING RIG
// ============================================================================
// Real-time responsive 3-point lighting rig consuming active LightingPresetConfig
// with HDRI environment reflections, shadow casting, and tone mapping adjustments.
// ============================================================================

import React from 'react';
import { Environment } from '@react-three/drei';
import { useEngine3DStore } from '../store/useEngine3DStore';
import { LIGHTING_PRESET_CONFIGS } from './lightingPresets';

export const SceneLighting: React.FC = () => {
  const currentPresetId = useEngine3DStore((s) => s.lightingPreset);
  const config = LIGHTING_PRESET_CONFIGS[currentPresetId] || LIGHTING_PRESET_CONFIGS.studio;

  return (
    <group name="Dynamic_Lighting_Rig">
      {config.lights.map((light) => {
        switch (light.type) {
          case 'ambient':
            return (
              <ambientLight
                key={light.id}
                color={light.color}
                intensity={light.intensity}
              />
            );

          case 'hemisphere':
            return (
              <hemisphereLight
                key={light.id}
                args={[light.color, 0x0f172a, light.intensity]}
              />
            );

          case 'directional':
            return (
              <directionalLight
                key={light.id}
                color={light.color}
                intensity={light.intensity}
                position={
                  light.position
                    ? [light.position.x, light.position.y, light.position.z]
                    : [2, 3, 4]
                }
                castShadow={light.castShadow}
                shadow-mapSize-width={light.shadowMapSize || 2048}
                shadow-mapSize-height={light.shadowMapSize || 2048}
                shadow-bias={light.shadowBias || -0.0001}
              />
            );

          case 'spot':
            return (
              <spotLight
                key={light.id}
                color={light.color}
                intensity={light.intensity}
                position={
                  light.position
                    ? [light.position.x, light.position.y, light.position.z]
                    : [0, 2, 3]
                }
                angle={light.angle || Math.PI / 4}
                penumbra={0.5}
                castShadow={light.castShadow}
              />
            );

          default:
            return null;
        }
      })}

      {/* Preset HDRI Environment Map */}
      {config.environmentMap && (
        <Environment
          preset={config.environmentMap as any}
          environmentIntensity={config.environmentIntensity}
        />
      )}
    </group>
  );
};
