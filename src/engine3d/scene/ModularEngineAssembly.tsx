// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — MASTER SCENE COMPONENT GRAPH
// ============================================================================
// Parent scene-graph coordinator rendering all installed component instances,
// available attachment point sockets, parent-child dependency vectors, and
// preview ghost holograms oriented with upright Y-axis alignment.
// ============================================================================

import React from 'react';
import { Line } from '@react-three/drei';
import { useEngine3DStore } from '../store/useEngine3DStore';
import { ComponentMesh3D } from './ComponentMesh3D';
import { getAllV12AttachmentPoints } from '../attachmentMaps/v12AttachmentMap';

// ============================================================================
// 1. ATTACHMENT POINT SOCKET VISUALIZER OVERLAY
// ============================================================================

export const AttachmentPointVisualizer: React.FC = () => {
  const instances = useEngine3DStore((s) => s.instances);
  const allSockets = getAllV12AttachmentPoints();

  const occupiedIds = new Set<string>();
  Object.values(instances).forEach((inst) => {
    if (inst.parentAttachmentPointId) {
      occupiedIds.add(inst.parentAttachmentPointId);
    }
  });

  return (
    <group name="Attachment_Points_Overlay">
      {allSockets.map((socket) => {
        const isOccupied = occupiedIds.has(socket.id);
        const pos = socket.position;

        return (
          <mesh key={socket.id} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.008, 16, 16]} />
            <meshStandardMaterial
              color={isOccupied ? '#ef4444' : '#22c55e'}
              emissive={isOccupied ? '#b91c1c' : '#15803d'}
              emissiveIntensity={0.8}
              transparent
              opacity={isOccupied ? 0.4 : 0.85}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ============================================================================
// 2. DEPENDENCY LINE VISUALIZER
// ============================================================================

export const DependencyLines: React.FC = () => {
  const instances = useEngine3DStore((s) => s.instances);
  const instanceList = Object.values(instances);

  const lines: { start: [number, number, number]; end: [number, number, number] }[] = [];

  for (const inst of instanceList) {
    if (inst.parentInstanceId && instances[inst.parentInstanceId]) {
      const parent = instances[inst.parentInstanceId];
      const pPos = parent.transform.position;
      const cPos = inst.transform.position;

      lines.push({
        start: [pPos.x, pPos.y, pPos.z],
        end: [cPos.x, cPos.y, cPos.z],
      });
    }
  }

  return (
    <group name="Dependency_Lines_Overlay">
      {lines.map((line, idx) => (
        <Line
          key={idx}
          points={[line.start, line.end]}
          color="#06b6d4"
          lineWidth={1.5}
          dashed
          dashScale={15}
          dashSize={0.02}
          gapSize={0.015}
        />
      ))}
    </group>
  );
};

// ============================================================================
// 3. MASTER MODULAR ASSEMBLY COMPONENT
// ============================================================================

export const ModularEngineAssembly: React.FC = () => {
  const instances = useEngine3DStore((s) => s.instances);
  const showAttachmentPoints = useEngine3DStore((s) => s.showAttachmentPoints);
  const showDependencies = useEngine3DStore((s) => s.showDependencies);
  const instanceList = Object.values(instances);

  return (
    <group
      name="Modular_Engine_Assembly_Master"
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.08, 0]}
    >
      {/* Render all live independent component instances */}
      {instanceList.map((instance) => (
        <ComponentMesh3D key={instance.instanceId} instance={instance} />
      ))}

      {/* Optional Diagnostic Overlays */}
      {showAttachmentPoints && <AttachmentPointVisualizer />}
      {showDependencies && <DependencyLines />}
    </group>
  );
};

export default ModularEngineAssembly;
