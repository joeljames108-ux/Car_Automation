// ===================================================================
// EXTERIOR 3D CAMERA PRESETS & CINEMATIC VIEWPOINT MATRICES
// ===================================================================

export interface CameraPresetVector {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export const EXTERIOR_CAMERA_PRESETS: Record<string, CameraPresetVector> = {
  front_three_quarter: {
    position: [3.8, 1.8, 3.8],
    target: [0, 0.4, 0],
    fov: 42,
  },
  rear_three_quarter: {
    position: [-3.8, 1.8, 3.8],
    target: [0, 0.4, 0],
    fov: 42,
  },
  profile_left: {
    position: [0, 1.2, 4.5],
    target: [0, 0.4, 0],
    fov: 38,
  },
  top_down: {
    position: [0, 5.5, 0.01],
    target: [0, 0, 0],
    fov: 45,
  },
  underbody: {
    position: [0, -2.8, 2.5],
    target: [0, 0.2, 0],
    fov: 45,
  },
};
