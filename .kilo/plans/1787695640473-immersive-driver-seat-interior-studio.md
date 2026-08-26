# Immersive Driver-Seat Interior Studio & Configurator Design

This implementation plan details the full redesign of the **Interior Studio** into a first-person, driver-seat immersive automotive interior design system and configurator.

---

## 1. Executive Summary & Goals

The updated Interior Studio shifts the paradigm from a conventional exterior orbit camera to an authentic **first-person seated experience**. The user sits in the driver's seat (or other seat anchors), looks around 360°, clicks interactive 3D cabin elements, and customizes every detail—from micro-stitching and PBR materials to ambient illumination, digital gauge widgets, and modular GLB subassemblies.

---

## 2. Core Architecture & System Decomposition

### A. Camera Rig System (`DriverSeatCameraRig.ts`)
* **Camera Placement**: Seated H-Point Eye position ($X = -0.68, Y = 0.88, Z = -0.34$).
* **Rotational Bounds**:
  * Yaw (Horizontal): $-170^\circ$ to $+170^\circ$ ($\approx 360^\circ$ full cabin vision).
  * Pitch (Vertical): $-65^\circ$ to $+65^\circ$ (Pedals/center tunnel to panoramic glass roof/sunvisors).
* **Collision Boundary**: Frustum collision sphere preventing camera clipping through steering wheel, dashboard binnacle, roof headliner, and door A-pillars.
* **Control Handlers**: Mouse look, touch drag, virtual joystick / Gamepad API support, smooth exponential damping ($\text{factor} = 0.08$), velocity limits.

### B. Multi-Seat View Anchor System
* **Positions Supported**:
  1. `DRIVER`: Driver seat H-Point eye anchor.
  2. `FRONT_PASSENGER`: Front passenger seat eye anchor ($X = +0.68, Y = 0.88, Z = -0.34$).
  3. `REAR_LEFT`: Rear left executive seat eye anchor ($X = -0.68, Y = 0.92, Z = +0.72$).
  4. `REAR_RIGHT`: Rear right executive seat eye anchor ($X = +0.68, Y = 0.92, Z = +0.72$).
* **Dynamic Seat Filtering**:
  * 2-Seat Sports Car / GT3 / Coupe $\rightarrow$ Hide `REAR_LEFT` and `REAR_RIGHT` options.
  * 4/5-Seat Luxury Sedan / SUV $\rightarrow$ Enable all 4 seat view anchors.
* **Cinematic Transition**: Smooth lerp interpolation of position and gaze direction ($0.8\text{s}$ easing curve with subtle depth-of-field blur).

### C. Modular 3D Scene Node Hierarchy (`MasterModularInterior3DAssembler.ts`)
* **Scene Graph**:
  ```
  INTERIOR_ROOT
  ├── Dashboard
  │   ├── DashboardBase
  │   ├── InstrumentCluster
  │   ├── HUD
  │   ├── AirVents
  │   ├── TrimPanels
  │   └── DashboardLighting
  ├── Steering
  │   ├── SteeringWheel
  │   ├── SteeringSpokes
  │   ├── SteeringButtons
  │   ├── PaddleShifters
  │   └── SteeringColumn
  ├── CenterConsole
  │   ├── InfotainmentScreen
  │   ├── GearSelector
  │   ├── DriveModeSelector
  │   ├── Cupholders
  │   ├── WirelessCharger
  │   └── Armrest
  ├── Seats
  │   ├── DriverSeat
  │   ├── PassengerSeat
  │   ├── RearSeats
  │   ├── Headrests
  │   ├── SeatBolsters
  │   └── SeatControls
  ├── Doors
  │   ├── DoorPanels
  │   ├── DoorHandles
  │   ├── WindowControls
  │   ├── Armrests
  │   └── SpeakerGrilles
  ├── Roof
  │   ├── Headliner
  │   ├── Sunroof
  │   ├── PanoramicGlass
  │   ├── RoofLighting
  │   └── GrabHandles
  ├── Floor
  │   ├── Carpet
  │   ├── FloorMats
  │   └── Pedals
  └── DecorativeTrim
      ├── CarbonFiber
      ├── Aluminum
      ├── Wood
      ├── PianoBlack
      └── CompositeMaterials
  ```

---

## 3. High-Quality GLB & Procedural Asset Library Expansion

Expand GLB asset paths in `Car3DGlbAssetRegistry.ts` and fallback procedural subassemblies for:
1. **Steering**:
   * GT3 Carbon Yoke (`/models/interior/steering_gt3_yoke.glb`)
   * Formula Motorsport Wheel (`/models/interior/steering_formula.glb`)
   * 3-Spoke Executive Leather (`/models/interior/steering_luxury_3spoke.glb`)
   * Flat-Bottom Sport Alcantara (`/models/interior/steering_flat_bottom.glb`)
   * Perforated Suede & Carbon (`/models/interior/steering_suede_carbon.glb`)
2. **Dashboard**:
   * Analog Binnacle & Chrono Dial (`/models/interior/dash_analog_chrono.glb`)
   * Dual 12.3" Curved Glass (`/models/interior/dash_curved_dual.glb`)
   * Pillar-to-Pillar Hyperscreen Blade (`/models/interior/dash_hyperscreen.glb`)
   * Passenger Telemetry Screen (`/models/interior/dash_passenger_display.glb`)
3. **Seats**:
   * Carbon Monocoque Bucket (`/models/interior/seat_carbon_bucket.glb`)
   * Recaro Sport Bolstered (`/models/interior/seat_recaro_sport.glb`)
   * Executive Recline & Legrest (`/models/interior/seat_executive_lounge.glb`)
   * Ventilated Massage Leather (`/models/interior/seat_luxury_massage.glb`)
4. **Center Console**:
   * Gated Manual Shifter (`/models/interior/console_manual_gated.glb`)
   * Crystal Rotary Drive Selector (`/models/interior/console_crystal_rotary.glb`)
   * Track Fire Suppression & Switches (`/models/interior/console_track_switches.glb`)
5. **Door Panels & Roof**:
   * Ambient Spear & Starlight Headliner (`/models/interior/roof_starlight.glb`)
   * Acoustic Speaker Panels & Panoramic Glass (`/models/interior/door_acoustic_boules.glb`)
6. **Pedal Boxes**:
   * Billet Drilled Aluminum, Carbon Race, Rubber Studded (`/models/interior/pedals_race.glb`)

---

## 4. Deep Customization & Studio Modules

### A. Material Studio & PBR Engine
* **Material Types**: Nappa Leather, Alcantara Suede, 3K Gloss Carbon Fiber, Forged Composite Carbon, Satin Brushed Aluminum, Polished Titanium, Open-Pore Walnut Wood, Piano Black Lacquer, Microfiber Mesh.
* **Property Controls**: Albedo Color, Roughness ($0.0 \to 1.0$), Metalness ($0.0 \to 1.0$), Clearcoat ($0.0 \to 1.0$), Bump/Normal scale, Contrast Stitching color & density.

### B. Ambient Lighting Studio
* **Zones**: Dashboard contour strip, Door spear accents, Footwell mood lights, Center console halo, Roof starlight LEDs, Speaker grille halo.
* **Modes**: Static Color, Breathing Pulse, Dual-Zone Gradient, Drive-Mode Linked (Sport Red, Eco Green, Comfort Cyan), Music-Reactive Spectrum.

### C. Digital Cockpit & Infotainment HMI
* **Cluster Gauge Styles**: Circular Analog, Horizontal Digital, Telemetry Race Bar, Minimalist EV.
* **Widgets**: RPM Tachometer, Speedometer, Gear Position, Lap Timer, G-Force Vector, Tire Temp/Pressure, Energy Flow / Battery Charge.
* **Infotainment Screens**: 8", 10", 12.3", 14.5", 17" OLED screens with interactive mode tab switching (Telemetry, Media, Climate, Vehicle Dynamics, Seat Adjustment).

### D. Interactive 3D Component Picking
* **Raycasting**: Hovering over interior 3D meshes highlights the object with a subtle glowing edge (`OutlinePass` or custom rim shader).
* **Click Action**: Clicking any 3D cabin subassembly automatically activates its corresponding tab in the customization panel.

---

## 5. Implementation Task List

1. **Camera Rig Upgrade**: Implement `DriverSeatCameraRig.ts` with multi-seat anchors, collision detection, pitch/yaw damping, and touch/mouse controls.
2. **Scene Hierarchy Structuring**: Refactor `MasterModularInterior3DAssembler.ts` to expose fine-grained named mesh groups for raycasting and node swapping.
3. **Multi-Seat HUD Component**: Create `SeatPositionSelector.tsx` for `[ DRIVER ] [ FRONT PASSENGER ] [ REAR LEFT ] [ REAR RIGHT ]`.
4. **Interactive Raycaster Component**: Implement `Interior3DRaycastPicker.ts` for object selection and UI tab sync.
5. **Customization Panels**: Build `InteriorMaterialStudioPanel.tsx`, `AmbientLightingStudioPanel.tsx`, `CockpitHmiConfiguratorPanel.tsx`, and `SeatCustomizationPanel.tsx`.
6. **Asset Registry Expansion**: Integrate procedural fallbacks and GLB asset URI resolvers in `car3dGlbAssetRegistry.ts`.
7. **Studio Shell Integration**: Update `ModularInteriorStudio.tsx` and `InteriorsDesigner.tsx` to mount the unified Immersive Driver-Seat Studio.
8. **State Engine Integration & Save/Compare**: Verify state export, import, duplicate, and side-by-side comparison in `masterInteriorStateEngine.ts`.

---

## 6. Verification & Testing Plan

* **360° Camera Look Verification**: Test mouse drag, touch swipe, and pitch/yaw limits in driver seat. Ensure no camera clipping.
* **Seat Switch Transition Verification**: Verify smooth camera lerp between Driver, Passenger, and Rear seats, and automatic hiding of rear seats for 2-seater vehicles.
* **3D Click Selection Verification**: Confirm clicking dashboard, steering wheel, seats, and console correctly opens their respective customization panels.
* **PBR & Ambient Lighting Render Audit**: Verify real-time material and ambient lighting updates on rendered meshes.
* **State Persistence Audit**: Test configuration save, load, export JSON, and reset capabilities.
