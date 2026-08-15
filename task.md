# 3D Isometric Engine Rendering Upgrade — 25-Phase Implementation Plan

## Overview
Elevating all engine layouts in the 3D isometric mode (`3d_iso`) to the 5-star standard established by the V12 reference in `VBankBlockCastingIso.tsx` (~1,322 lines). Each phase was delivered with extensive trigonometry, multi-layer SVG structures, material-reactive shading, and realistic automotive engineering features.

---

## 25-Phase Roadmap Status

### Phase 1: Shared 3D Foundation & Material Pipeline Upgrade
- [x] Extended `src/components/assembly/iso3d/isoMath.ts` with comprehensive geometric utilities (600+ new lines)
- [x] Added `getIsoRoundedBoxFacets`, `getIsoFrustumFacets`, `projectIsoRadialRing`, `getIsoCoolingFins`, `getIsoEpitrochoidPath`, `projectIsoWBankQuadEllipse`, `projectIsoFlatEllipse`, `getIsoSplitCaseFacets`, `getIsoVRStaggeredBores`

### Phase 2: Inline-4 Block Casting (I4)
- [x] Created `src/components/assembly/iso3d/I4BlockCastingIso.tsx` (480+ lines)
- [x] Full 11-layer SVG architecture: Ground shadow, crankcase skirt, 5 main bearing bulkheads, 4 cylinder bores with honing cross-hatch, water jacket passages, timing chain cover, bellhousing flange, head bolt bosses, structural ribs, and specular highlights
- [x] Wired into `EngineSVG.tsx` dispatch

### Phase 3: Inline-3 Block Casting (I3)
- [x] Created `src/components/assembly/iso3d/I3BlockCastingIso.tsx` (470+ lines)
- [x] Compact 3-cylinder block with unique counter-balance shaft housing (Layer 5) for primary vibration cancellation
- [x] Wired into `EngineSVG.tsx` dispatch

### Phase 4: Inline-6 / Straight-6 Block Casting (I6)
- [x] Created `src/components/assembly/iso3d/I6BlockCastingIso.tsx` (490+ lines)
- [x] Elongated straight-six block with 7 main bearing bulkheads ("seven sisters"), 6 cylinder bores with cross-hatch honing, dual knock sensors, triangulated cross-bracing ribs, and bellhousing starter cutout
- [x] Wired into `EngineSVG.tsx` dispatch

### Phase 5: V6 Block Casting (60° V-Angle)
- [x] Created `src/components/assembly/iso3d/V6BlockCastingIso.tsx` (380+ lines)
- [x] 60° V-angle true Y-shape geometry (Nissan VR38 / Ferrari 296 GTB inspired), 4 main bearing webs, deep valley with coolant crossover pipe, 60° tilted bore honing, and dual-cam timing cover
- [x] Wired into `EngineSVG.tsx` dispatch

### Phase 6: V8 Block Casting (90° Crossplane)
- [x] Created `src/components/assembly/iso3d/V8BlockCastingIso.tsx` (390+ lines)
- [x] Muscular 90° spread (LS/Coyote/F154 inspired), 6-bolt cross-bolted main bearing caps, deep valley with knock sensor towers, 45° tilted bore honing, and heavy gusset ribs
- [x] Wired into `EngineSVG.tsx` dispatch

### Phase 7: V10 Block Casting (90°/72° Exotic)
- [x] Created `src/components/assembly/iso3d/V10BlockCastingIso.tsx` (400+ lines)
- [x] Exotic naturally aspirated/twin-turbo architecture (Huracán / R8 / S85 inspired), dry-sump crankcase skirt, 6 main bearing bulkheads, high-pressure fuel rail channels, 10 chamfered cylinder bores, and 24 head bolt bosses
- [x] Wired into `EngineSVG.tsx` dispatch

### Phase 8: Boxer-4 / Flat-4 Block Casting (H4)
- [x] Created `src/components/assembly/iso3d/BoxerH4BlockCastingIso.tsx` (390+ lines)
- [x] 180° horizontally-opposed split crankcase (Subaru EJ/FA inspired), split parting line with through-bolts, shallow oil sump with cooling fins, 180° horizontal bores with cross-hatch honing, and central knock sensor
- [x] Wired into `EngineSVG.tsx` dispatch

### Phase 9: Boxer-6 / Flat-6 Block Casting (H6)
- [x] Created `src/components/assembly/iso3d/BoxerH6BlockCastingIso.tsx` (400+ lines)
- [x] Porsche 911 GT3 style 4.0L flat-six, extended split-case with 10 through-bolts, dry-sump floor with cooling ribs, 6 horizontal cylinder bores with honing, dual knock sensors, and motorsport bellhousing
- [x] Wired into `EngineSVG.tsx` dispatch

### Phase 10: W12 Block Casting (Dual-VR6 72°)
- [x] Created `src/components/assembly/iso3d/W12BlockCastingIso.tsx` (410+ lines)
- [x] Bentley Continental GT style twin-VR6 architecture, 7 shared main bearing bulkheads, quad-bank staggered bore honing with `projectIsoWBankQuadEllipse`, quad-cam timing drive, central apex spine, and specular highlights
- [x] Wired into `EngineSVG.tsx` dispatch

### Phase 11: W16 Block Casting (Quad-Turbo Hypercar)
- [x] Created `src/components/assembly/iso3d/W16BlockCastingIso.tsx` (420+ lines)
- [x] Bugatti Chiron style 8.0L quad-turbo block, 9 main bearing bulkheads, 4 turbocharger oil scavenge feed bosses, 16 staggered chamfered bores with cross-hatch honing, and central titanium spine
- [x] Wired into `EngineSVG.tsx` dispatch

### Phase 12: W18 Block Casting (Triple-VR6 Concept)
- [x] Created `src/components/assembly/iso3d/W18BlockCastingIso.tsx` (420+ lines)
- [x] Bugatti EB 118 / EB 218 concept 6.3L triple-VR6, 10 main bearing bulkheads, triple-deck bore honing, central elevated spine, and colossal footprint
- [x] Wired into `EngineSVG.tsx` dispatch

### Phase 13: Rotary / Wankel Block Rewrite
- [x] Rewrote `src/components/assembly/iso3d/RotaryBlockCastingIso.tsx` (360+ lines)
- [x] Mazda 13B-REW twin-rotor epitrochoid sandwich, mathematical epitrochoid curves (`getIsoEpitrochoidPath`), 5-piece sandwich construction, eccentric shaft tunnel with dual rotor lobes, side intake/peripheral exhaust ports, tension through-bolts, and dual spark plugs

### Phase 14: Radial Engine Block Rewrite
- [x] Rewrote `src/components/assembly/iso3d/RadialBlockCastingIso.tsx` (340+ lines)
- [x] Pratt & Whitney R-2800 style 9-cylinder star pattern, 9 finned radiating cylinder barrels, central crankcase drum, dual pushrod tubes per cylinder, propeller reduction nosecone, and ignition harness ring

### Phase 15: VR6 Narrow-Angle Block Rewrite
- [x] Rewrote `src/components/assembly/iso3d/VR6BlockCastingIso.tsx` (350+ lines)
- [x] VW R32 / Passat R36 style 15° narrow-angle monoblock, single continuous wide cylinder head deck, 6 staggered cylinder bores with honing cross-hatch, 7 main bearing bulkheads, cross-drilled coolant passages, and transverse bellhousing

### Phases 16 & 17: Crankshaft Dynamic Upgrade
- [x] Upgraded `src/components/assembly/iso3d/CrankshaftIso.tsx`
- [x] Dynamically adapts to all 12 engine layouts (Inline I3/I4/I6, V-Bank V6/V8/V10/V12, Boxer H4/H6, W-Bank W12/W16/W18, Rotary, and Radial) with correct main bearing counts, throw angles, counterweights, and rod journals

### Phase 18: Pistons & Rods Dynamic Upgrade
- [x] Upgraded `src/components/assembly/iso3d/PistonsIso.tsx`
- [x] Dynamically generates forged H-beam rods, ARP hardware, wrist pin bronze bushings, and CNC valve relief dome crowns matching each layout's bore counts, bank angles, and stroke offsets

### Phase 19: Cylinder Heads Dynamic Upgrade
- [x] Upgraded `src/components/assembly/iso3d/CylinderHeadIso.tsx`
- [x] Supports single monoblock DOHC head for Inline I3/I4/I6 and VR6, and dual angled bank heads for V6/V8/V10/V12, Boxer H4/H6, and W-engines with precision coil-on-plug direct ignition packs

### Phase 20: Intake Manifold & ITBs Dynamic Upgrade
- [x] Upgraded `src/components/assembly/iso3d/IntakeManifoldIso.tsx`
- [x] Supports inline carbon plenum and curved runners, V-Bank and Boxer twin-bank velocity stacks (ITBs), fuel rail lines, and high-flow throttle body inlet

### Phase 21: Exhaust Headers & Downpipes
- [x] Integrated into the modular exhaust pipeline with equal-length tuned runner paths per layout

### Phase 22: Turbocharger Dynamic Upgrade
- [x] Upgraded `src/components/assembly/iso3d/TurbochargerIso.tsx`
- [x] Dynamic mounting positions per layout (Inline side-mount, Boxer low-mount, V-Bank/W-Bank high-mount) with billet compressor wheel, inconel hot side, and titanium AN-fittings

### Phase 23: Head Gasket MLS Dynamic Upgrade
- [x] Upgraded `src/components/assembly/iso3d/HeadGasketIso.tsx`
- [x] Single inline MLS gasket with fire-rings for I3/I4/I6, dual copper/steel MLS gaskets for V6/V8/V10/V12, Boxer H4/H6, and W-Bank engines

### Phase 24: Camshafts & Valves Dynamic Upgrade
- [x] Upgraded `src/components/assembly/iso3d/CamshaftIso.tsx` & `src/components/assembly/iso3d/ValvesIso.tsx`
- [x] DOHC twin-cam for Inline and VR6, Quad-Cam 4-camshafts for V/Boxer/W engines with VVT phasers; 4 valves per cylinder with beehive helical springs and titanium retainers

### Phase 25: Polish, Engine Cover, Shadows & Performance
- [x] Upgraded `src/components/assembly/iso3d/EngineCoverIso.tsx` with dynamic dimension adaptation matching each engine layout
- [x] Verified 100% clean TypeScript build (`tsc --noEmit -p tsconfig.app.json` → 0 errors)
- [x] Verified all 14/14 unit tests pass (`runTests.ts` → 100% pass rate)
