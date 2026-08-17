// ===================================================================
// MASTER EXTERIOR 3D GLTF SCENE GRAPH (REACT THREE FIBER)
// ===================================================================
// Root R3F canvas housing studio lighting, ground shadow catcher,
// orbit camera controller, and dynamic 3D exterior component meshes.
// ===================================================================

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { useExterior3DStore } from "../store/useExterior3DStore";
import { ExteriorLighting3D } from "./ExteriorLighting3D";
import { ExteriorComponentMesh3D } from "./ExteriorComponentMesh3D";

export const ExteriorScene3D: React.FC = () => {
  const instances = useExterior3DStore((s) => s.instances);
  const selectInstance3D = useExterior3DStore((s) => s.selectInstance3D);
  const hoverInstance3D = useExterior3DStore((s) => s.hoverInstance3D);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [3.8, 2.2, 3.8], fov: 42 }}
        shadows
        className="w-full h-full"
      >
        {/* Studio Lighting */}
        <ExteriorLighting3D />

        {/* Dynamic Exterior Subsystems */}
        <group position={[0, -0.2, 0]}>
          {Object.values(instances).map((inst) => (
            <ExteriorComponentMesh3D
              key={inst.instanceId}
              instance={inst}
              onClick={() => selectInstance3D(inst.type)}
              onPointerOver={() => hoverInstance3D(inst.type)}
              onPointerOut={() => hoverInstance3D(null)}
            />
          ))}
        </group>

        {/* Soft Ground Contact Shadow Catcher */}
        <ContactShadows
          position={[0, -0.2, 0]}
          opacity={0.75}
          scale={10}
          blur={2.0}
          far={4.5}
        />

        {/* Orbit Camera Controller */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={1.8}
          maxDistance={8.5}
          maxPolarAngle={Math.PI / 2 + 0.05} // Prevent camera clipping below floor
        />
      </Canvas>
    </div>
  );
};
