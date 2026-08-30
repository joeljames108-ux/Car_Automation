// ===================================================================
// MASTER EXTERIOR 3D GLTF SCENE GRAPH (REACT THREE FIBER)
// ===================================================================
// Root R3F canvas housing studio lighting, ground shadow catcher,
// orbit camera controller, and dynamic 3D exterior component meshes.
// ===================================================================

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, MeshReflectorMaterial } from "@react-three/drei";
import { useExterior3DStore } from "../store/useExterior3DStore";
import { ExteriorLighting3D } from "./ExteriorLighting3D";
import { ExteriorComponentMesh3D } from "./ExteriorComponentMesh3D";
import { Car3DGeometryGenerator } from "../geometry/car3dGeometryGenerator";
import { ExteriorPostProcessing, POST_PROCESSING_PRESETS } from "../postprocessing/ExteriorPostProcessingPipeline";


export const ExteriorScene3D: React.FC = () => {
  const instances = useExterior3DStore((s) => s.instances);
  const selectInstance3D = useExterior3DStore((s) => s.selectInstance3D);
  const hoverInstance3D = useExterior3DStore((s) => s.hoverInstance3D);
  const instanceList = Object.values(instances);

  const fallbackCarMesh = useMemo(() => {
    return Car3DGeometryGenerator.buildCar3DGroup("SUPERCAR_MID_ENGINE");
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [3.8, 2.2, 3.8], fov: 42 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        shadows
        className="w-full h-full"
      >
        {/* Studio Lighting */}
        <ExteriorLighting3D />

        {/* HDRI Environment Map for realistic metallic paint reflections */}
        <Environment preset="studio" background={false} environmentIntensity={0.8} />

        {/* Dynamic Exterior Subsystems or Fallback 3D Vehicle */}
        <group position={[0, -0.08, 0]}>
          {instanceList.length > 0 ? (
            instanceList.map((inst) => (
              <ExteriorComponentMesh3D
                key={inst.instanceId}
                instance={inst}
                onClick={() => selectInstance3D(inst.type)}
                onPointerOver={() => hoverInstance3D(inst.type)}
                onPointerOut={() => hoverInstance3D(null)}
              />
            ))
          ) : (
            <primitive object={fallbackCarMesh} />
          )}
        </group>

        {/* Reflective Dark Studio Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={40}
            roughness={0.15}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0a0a0f"
            metalness={0.5}
            mirror={0.5}
          />
        </mesh>

        {/* Subtle ground contact shadow */}
        <ContactShadows
          position={[0, -0.09, 0]}
          opacity={0.6}
          scale={12}
          blur={2.5}
          far={4}
          color="#000000"
        />

        {/* Orbit Camera Controller */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={1.8}
          maxDistance={8.5}
          maxPolarAngle={Math.PI / 2 - 0.02}
        />

        {/* Photorealistic Post-Processing Pipeline */}
        <ExteriorPostProcessing config={POST_PROCESSING_PRESETS.showroom} />
      </Canvas>
    </div>
  );
};
