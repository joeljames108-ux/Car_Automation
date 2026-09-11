"""
Bugatti Divo Master Builder Orchestration Script (Blender 4.x / 5.x)
High-Fidelity Track-Focused Hypercar Procedural Architecture
Orchestrates all 10 production phases of vehicle generation and GLB serialization.

Usage (Blender Python Console):
    import sys; sys.path.insert(0, r"E:\\Car_Automation\\scripts\\blender\\divo")
    import divo_master_builder
    divo_master_builder.build_complete_divo(export_glbs=True, export_individual=True)

Usage (Command Line):
    blender --background --python "E:\\Car_Automation\\scripts\\blender\\divo\\divo_master_builder.py"
"""

import sys
import os

scripts_path = os.path.dirname(os.path.abspath(__file__))
parent_path = os.path.dirname(scripts_path)
if scripts_path not in sys.path:
    sys.path.insert(0, scripts_path)
if parent_path not in sys.path:
    sys.path.insert(0, parent_path)

import bpy

# Import all component modules
import divo_common
import divo_materials
import divo_body
import divo_chassis
import divo_aero_wing
import divo_lighting
import divo_glazing
import divo_wheels
import divo_interior
import divo_hardware
import divo_finalize
import divo_export

# Reload all modules for hot-reload during development
import importlib
importlib.reload(divo_common)
importlib.reload(divo_materials)
importlib.reload(divo_body)
importlib.reload(divo_chassis)
importlib.reload(divo_aero_wing)
importlib.reload(divo_lighting)
importlib.reload(divo_glazing)
importlib.reload(divo_wheels)
importlib.reload(divo_interior)
importlib.reload(divo_hardware)
importlib.reload(divo_finalize)
importlib.reload(divo_export)


def build_complete_divo(export_glbs=True, export_individual=True):
    """
    Master orchestration pipeline for the Bugatti Divo track-focused hypercar.
    Executes all 10 production phases in sequence and exports GLB artifacts.
    """
    print("=" * 75)
    print("  BUILDING BUGATTI DIVO — TRACK-FOCUSED HYPERCAR (MUSEUM QUALITY CAD)")
    print("  8.0L Quad-Turbo W16 | 1500 HP | 2711mm WB | 11 Production Collections")
    print("=" * 75)

    # Phase 1: Safe scene initialization with 11 semantic collections
    divo_common.safe_reset_scene()

    # Phase 2: Master PBR Material Factory (20+ materials)
    mats = divo_materials.DivoMaterials()

    # Phase 3: Sculpted Hypercar Body Shell, Horseshoe Grille, Splitter, Diffuser
    body_objs = divo_body.build_divo_body_and_aero(mats)

    # Phase 4: Carbon Monocoque Tub, Subframes, W16 Engine, Quad Turbos, Suspension
    chassis_objs = divo_chassis.build_divo_chassis_and_powertrain(mats)

    # Phase 5: 1.83m Active Carbon Rear Wing & Airbrake Assembly
    wing_objs = divo_aero_wing.build_divo_active_wing(mats)

    # Phase 6: C-Blade LED Headlights & 44-Fin 3D OLED Taillight Matrix
    light_objs = divo_lighting.build_divo_lighting(mats)

    # Phase 7: Panoramic Greenhouse Glazing & W16 Engine Showcase Bay
    glass_objs = divo_glazing.build_divo_glazing(mats)

    # Phase 8: Staggered 20"/21" Forged Wheels, Aero Blades & Carbon Ceramic Brakes
    wheel_objs = divo_wheels.build_divo_wheels_and_brakes(mats)

    # Phase 9: Asymmetric Driver-Focused Cockpit & Bespoke Interior
    interior_objs = divo_interior.build_divo_interior(mats)

    # Phase 10: Side Mirror Cameras, Air Intakes, Fuel Cap & Hardware
    hw_objs = divo_hardware.build_divo_hardware(mats)

    # Phase 11: Topology Validation & Normal Hardening
    stats = divo_finalize.finalize_topology()

    # Phase 12: Dual-Mode Production GLB Export
    if export_glbs:
        divo_export.export_all(export_individual=export_individual)

    total_objs = (
        len(body_objs) + len(chassis_objs) + len(wing_objs) +
        len(light_objs) + len(glass_objs) + len(wheel_objs) +
        len(interior_objs) + len(hw_objs)
    )

    print("=" * 75)
    print(f"  BUGATTI DIVO BUILD PIPELINE COMPLETE — {total_objs} objects across 11 collections")
    print(f"  Vertices: {stats['vertices']:,} | Faces: {stats['faces']:,} | Tris: {stats['triangles']:,}")
    dims = stats['dimensions']
    print(f"  Envelope: {dims[1]:.3f}m (L) x {dims[0]:.3f}m (W) x {dims[2]:.3f}m (H)")
    print("=" * 75)
    return stats


if __name__ == "__main__":
    build_complete_divo(export_glbs=True, export_individual=True)
