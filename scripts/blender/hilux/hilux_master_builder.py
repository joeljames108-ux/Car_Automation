"""
Hilux Master Builder Orchestration Script (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Orchestrates all 20 phases: Scene setup, 46 PBR materials, chassis frame, cab body,
cargo bed, front fascia & optics, rear fascia & optics, exterior jewelry, glazing,
suspension, wheels/tires/brakes, powertrain/exhaust, underbody, full interior,
topology finalization, viewport presentation, and dual-mode GLB export.
"""

import sys
import os

scripts_path = os.path.dirname(os.path.abspath(__file__))
if scripts_path not in sys.path:
    sys.path.insert(0, scripts_path)

import bpy
import hilux_common
import hilux_materials
import hilux_chassis
import hilux_body_cab
import hilux_bed
import hilux_fascia
import hilux_rear
import hilux_hardware
import hilux_glass
import hilux_suspension
import hilux_wheels
import hilux_powertrain
import hilux_underbody
import hilux_interior
import hilux_finalize
import hilux_export

import importlib
importlib.reload(hilux_common)
importlib.reload(hilux_materials)
importlib.reload(hilux_chassis)
importlib.reload(hilux_body_cab)
importlib.reload(hilux_bed)
importlib.reload(hilux_fascia)
importlib.reload(hilux_rear)
importlib.reload(hilux_hardware)
importlib.reload(hilux_glass)
importlib.reload(hilux_suspension)
importlib.reload(hilux_wheels)
importlib.reload(hilux_powertrain)
importlib.reload(hilux_underbody)
importlib.reload(hilux_interior)
importlib.reload(hilux_finalize)
importlib.reload(hilux_export)

def build_complete_hilux():
    print("=" * 70)
    print("BUILDING 2025 TOYOTA HILUX SR5 DOUBLE-CAB (MUSEUM QUALITY)")
    print("=" * 70)
    
    # 1. Safe scene initialization
    hilux_common.safe_reset_scene()
    
    # 2. Master PBR Material Factory
    mat_registry = hilux_materials.HiluxMaterials()
    
    # 3. Chassis Frame Assembly
    chassis_objs = hilux_chassis.build_chassis_frame(mat_registry)
    
    # 4. Cab Body Shell Assembly
    cab_objs = hilux_body_cab.build_cab_body(mat_registry)
    
    # 5. Cargo Bed Assembly
    bed_objs = hilux_bed.build_cargo_bed(mat_registry)
    
    # 6. Front Fascia & Lighting Assembly
    fascia_objs = hilux_fascia.build_front_fascia(mat_registry)
    
    # 7. Rear Fascia & Lighting Assembly
    rear_objs = hilux_rear.build_rear_fascia(mat_registry)
    
    # 8. Exterior Hardware & Jewelry Assembly
    hw_objs = hilux_hardware.build_exterior_hardware(mat_registry)
    
    # 9. Greenhouse Glazing Assembly
    glass_objs = hilux_glass.build_greenhouse_glazing(mat_registry)
    
    # 10. Suspension Assembly
    susp_objs = hilux_suspension.build_suspension(mat_registry)
    
    # 11. Wheel, Tire & Brake Assemblies
    wheel_objs = hilux_wheels.build_wheels_and_brakes(mat_registry)
    
    # 12-14. Powertrain & Exhaust Assembly
    powertrain_objs = hilux_powertrain.build_powertrain(mat_registry)
    
    # 15. Underbody & Fuel System Assembly
    underbody_objs = hilux_underbody.build_underbody(mat_registry)
    
    # 16. Interior Cockpit Assembly (Omitted per user specification - Pure Exterior Build)
    # interior_objs = hilux_interior.build_interior(mat_registry)
    
    # 17. Topology Finalization & Normal Hardening
    hilux_finalize.finalize_topology_and_normals()
    
    total_objects = len(bpy.data.objects)
    total_polys = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
    print(f"[HILUX] Build complete: {total_objects} objects, {total_polys} polygons.")
    
    # 18. Programmatic Viewport Framing (Front 3/4 Hero Presentation)
    hilux_common.set_viewport_view(pitch_deg=70, roll_deg=0, yaw_deg=225, distance=6.5, location=(0.0, 0.0, 0.85))
    
    # 19. Dual-Mode GLB Export
    hilux_export.export_all_glbs()
    
    print("=" * 70)
    print("2025 TOYOTA HILUX SR5 DOUBLE-CAB GENERATION & EXPORT COMPLETE!")
    print("=" * 70)
    return total_objects, total_polys

if __name__ == "__main__":
    build_complete_hilux()
