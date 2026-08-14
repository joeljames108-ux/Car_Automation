// ===================================================================
// ENGINE ASSEMBLY SYSTEM — SYNTHESIZED WEB AUDIO API SOUND ENGINE (V3)
// Sound playback disabled per user directive
// ===================================================================

import { EngineAudioType } from "./engineAudioEngine";

export function toggleAssemblyMute(): boolean {
  return true;
}

export function getAssemblyMuteState(): boolean {
  return true;
}

export function playAssemblySound(
  _type:
    | "heavy"
    | "click"
    | "slide"
    | "spool"
    | "metallic"
    | "pneumatic"
    | "starter"
    | "rev"
    | "completion"
    | "ratchet"
    | "gasket",
  _panX: number = 0.5
) {
  // Audio disabled per user request
  return;
}

export function playLayoutEngineSound(
  _type: EngineAudioType,
  _rpm: number = 7200,
  _isTurbo: boolean = true
) {
  // Audio disabled per user request
  return;
}
