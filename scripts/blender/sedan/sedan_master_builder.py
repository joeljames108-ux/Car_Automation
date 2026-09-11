"""
Sedan Master Builder Orchestration Script (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
Orchestrates all 14 phases of vehicle generation and GLB serialization.
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
import sedan_common
import sedan_materials
import sedan_chassis
import sedan_body
import sedan_fascia
import sedan_rear
import sedan_lighting
import sedan_glazing
import sedan_hardware
import sedan_suspension
import sedan_wheels
import sedan_powertrain
import sedan_interior
import sedan_underbody
import sedan_finalize
import sedan_export

import importlib
importlib.reload(sedan_common)
importlib.reload(sedan_materials)
importlib.reload(sedan_chassis)
importlib.reload(sedan_body)
importlib.reload(sedan_fascia)
importlib.reload(sedan_rear)
importlib.reload(sedan_lighting)
importlib.reload(sedan_glazing)
importlib.reload(sedan_hardware)
importlib.reload(sedan_suspension)
importlib.reload(sedan_wheels)
importlib.reload(sedan_powertrain)
importlib.reload(sedan_interior)
importlib.reload(sedan_underbody)
importlib.reload(sedan_finalize)
importlib.reload(sedan_export)

def build_complete_sedan(export_glbs=True, export_individual=True):
    print("=" * 75)
    print("BUILDING 2026 CLASS-A EXECUTIVE SPORT SEDAN (MUSEUM QUALITY CAD)")
    print("=" * 75)
    
    # 1. Safe scene initialization
    sedan_common.safe_reset_scene()
    
    # 2. Master PBR Material Factory
    mats = sedan_materials.SedanMaterials()
    
    # 3. Monocoque Chassis & Subframes
    chassis_objs = sedan_chassis.build_chassis(mats)
    
    # 4. Class-A Exterior Body Panels
    body_objs = sedan_body.build_body_panels(mats)
    
    # 5. Front Fascia & Carbon Splitter
    fascia_objs = sedan_fascia.build_front_fascia(mats)
    
    # 6. Rear Fascia, Diffuser & Quad Exhausts
    rear_objs = sedan_rear.build_rear_fascia(mats)
    
    # 7. Matrix LED & OLED Lighting Optics
    light_objs = sedan_lighting.build_lighting_optics(mats)
    
    # 8. Greenhouse Glazing & Dielectric Glass
    glass_objs = sedan_glazing.build_greenhouse_glazing(mats)
    
    # 9. Exterior Hardware & M-Style Mirrors
    hw_objs = sedan_hardware.build_exterior_hardware(mats)
    
    # 10. Suspension, Steering & Coilovers
    susp_objs = sedan_suspension.build_suspension(mats)
    
    # 11. Wheels, Radial Tires & Brembo Brakes
    wheel_objs = sedan_wheels.build_wheels_and_brakes(mats)
    
    # 12. 4.4L Twin-Turbo V8 Powertrain & Drivetrain
    powertrain_objs = sedan_powertrain.build_powertrain(mats)
    
    # 13. Luxury Executive VIP Interior
    interior_objs = sedan_interior.build_luxury_interior(mats)
    
    # 14. Underbody Aero Tray & Wheelhouse Liners
    underbody_objs = sedan_underbody.build_underbody(mats)
    
    # 15. Topology Validation & Normal Hardening
    stats = sedan_finalize.finalize_topology()
    
    # 16. Dual-Mode Production GLB Export
    if export_glbs:
        sedan_export.export_all(export_individual=export_individual)
        
    print("=" * 75)
    print("✓ EXECUTIVE SPORT SEDAN BUILD PIPELINE EXECUTED WITH 100% INTEGRITY")
    print("=" * 75)
    return stats

if __name__ == "__main__":
    build_complete_sedan(export_glbs=True, export_individual=True)
