// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — POST-PROCESSING EFFECTS PIPELINE (UPGRADED)
// ============================================================================
// Photographic post-processing with bloom glow, selection outline rings,
// studio reflection accents, atmospheric haze, and volumetric light shafts.
// ============================================================================

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEngine3DStore } from '../store/useEngine3DStore';

// ============================================================================
// 1. SELECTION OUTLINE GLOW RING
// ============================================================================
const SelectionOutlineGlow: React.FC<{
  position: [number, number, number];
  radius?: number;
}> = ({ position, radius = 0.18 }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.5;
      ringRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
    }
    if (glowRef.current) {
      const scale = 1.0 + Math.sin(t * 2) * 0.08;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position} name="Selection_Outline_Glow">
      {/* Inner ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.004, 8, 48]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.7} />
      </mesh>
      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 1.15, 16, 16]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Wireframe halo */}
      <mesh>
        <sphereGeometry args={[radius * 1.3, 12, 12]} />
        <meshBasicMaterial
          color="#fbbf24"
          wireframe
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
};

// ============================================================================
// 2. STUDIO REFLECTION ACCENT LIGHTS (Simulated Area Lights)
// ============================================================================
const StudioReflectionAccents: React.FC = () => {
  return (
    <group name="Studio_Reflection_Accents">
      {/* Top-right soft key reflection */}
      <mesh position={[0.8, 1.6, 1.0]} rotation={[-Math.PI / 3, 0.2, 0]}>
        <planeGeometry args={[1.8, 0.5]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.025}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Left fill reflection */}
      <mesh position={[-1.0, 1.2, 0.6]} rotation={[-Math.PI / 4, -0.3, 0]}>
        <planeGeometry args={[1.2, 0.4]} />
        <meshBasicMaterial
          color="#e0f2fe"
          transparent
          opacity={0.018}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Rear rim accent */}
      <mesh position={[0, 1.4, -1.5]} rotation={[Math.PI / 5, 0, 0]}>
        <planeGeometry args={[2.0, 0.6]} />
        <meshBasicMaterial
          color="#fef08a"
          transparent
          opacity={0.015}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// ============================================================================
// 3. VOLUMETRIC LIGHT SHAFTS (Faked God-Rays)
// ============================================================================
const VolumetricLightShafts: React.FC = () => {
  const shaftsRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (shaftsRef.current) {
      shaftsRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  const shafts = useMemo(() => {
    const result: { pos: [number, number, number]; rot: [number, number, number]; w: number; h: number; op: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 0.4 - Math.PI * 0.2;
      result.push({
        pos: [Math.sin(angle) * 1.5, 2.5, Math.cos(angle) * 1.0 - 0.5],
        rot: [-Math.PI / 3 + angle * 0.2, angle * 0.3, 0],
        w: 0.15 + Math.random() * 0.1,
        h: 1.5 + Math.random() * 0.5,
        op: 0.008 + Math.random() * 0.005,
      });
    }
    return result;
  }, []);

  return (
    <group ref={shaftsRef} name="Volumetric_Light_Shafts">
      {shafts.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot}>
          <planeGeometry args={[s.w, s.h]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={s.op}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};

// ============================================================================
// 4. AMBIENT DUST PARTICLES (Floating Workshop Dust)
// ============================================================================
const AmbientDustParticles: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const { positions, velocities } = useMemo(() => {
    const count = 60;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3.0;
      pos[i * 3 + 1] = Math.random() * 2.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3.0;
      vel[i * 3] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 1] = Math.random() * 0.001 + 0.0005;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3] += velocities[i * 3];
      arr[i * 3 + 1] += velocities[i * 3 + 1];
      arr[i * 3 + 2] += velocities[i * 3 + 2];
      // Reset if out of bounds
      if (arr[i * 3 + 1] > 2.2) {
        arr[i * 3] = (Math.random() - 0.5) * 3.0;
        arr[i * 3 + 1] = -0.2;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 3.0;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} name="Ambient_Dust_Particles">
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#fef08a"
        size={0.006}
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};

// ============================================================================
// 5. MAIN POST-PROCESSING STACK
// ============================================================================
export const PostProcessingStack: React.FC = () => {
  const postConfig = useEngine3DStore((s) => s.postProcessing);
  const selectedInstanceId = useEngine3DStore((s) => s.selectedInstanceId);
  const instances = useEngine3DStore((s) => s.instances);

  const selectedInst = selectedInstanceId ? instances[selectedInstanceId] : null;

  return (
    <group name="PostProcessing_Overlay">
      {/* Studio Reflection Accent Highlights */}
      <StudioReflectionAccents />

      {/* Volumetric Light Shafts */}
      <VolumetricLightShafts />

      {/* Ambient Floating Dust Particles */}
      <AmbientDustParticles />

      {/* Selection Outline Glow when a component is selected */}
      {selectedInst && postConfig.outline.enabled && (
        <SelectionOutlineGlow
          position={[
            selectedInst.transform.position.x,
            selectedInst.transform.position.y,
            selectedInst.transform.position.z,
          ]}
        />
      )}
    </group>
  );
};

export default PostProcessingStack;
