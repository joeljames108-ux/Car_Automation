"""
Bentley Continental GT II Coupe (2011) Master Builder & Orchestrator (Blender 5.2 LTS)
Full Procedural CAD Construction, Material Assignment, Finalization, and GLB Export
"""

import bpy
import sys
import os

# Ensure package directory is in sys.path
script_dir = os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.insert(0, script_dir)

import importlib

import coupe_common
import coupe_materials
import coupe_chassis
import coupe_suspension
import coupe_wheels
import coupe_body
import coupe_fascia
import coupe_lighting
import coupe_glazing
import coupe_hardware
# NOTE: Interior is strictly excluded per user constraint: "dont design interior until i mention- alwyas remember this"
import coupe_finalize
import coupe_export

def build_complete_coupe():
    """
    Execute full procedural construction pipeline for Bentley Continental GT II Coupe.
    Focus: 100% exterior Class-A coachwork, aerodynamics, jewel optics, and PBR shaders.
    """
    # Force reload all modules to ensure latest updates take effect in persistent Blender process
    for mod in [coupe_common, coupe_materials, coupe_chassis, coupe_suspension, coupe_wheels, coupe_body,
                coupe_fascia, coupe_lighting, coupe_glazing, coupe_hardware, coupe_finalize, coupe_export]:
        importlib.reload(mod)

    print("===================================================================")
    print("  BENTLEY CONTINENTAL GT II (2011) PROCEDURAL CAD PIPELINE")
    print("===================================================================")

    
    # 1. Reset Scene cleanly
    coupe_common.safe_reset_scene()
    
    # 2. Material Shader Registry
    print("\n[STEP 1/9] Compiling Principled BSDF v2 PBR Material Matrix...")
    mats = coupe_materials.CoupeMaterialRegistry()
    
    # 3. Chassis, Subframes & W12 Powertrain
    print("\n[STEP 2/10] Constructing Structural Monocoque Chassis & 6.0L W12 Powertrain...")
    coupe_chassis.build_coupe_chassis_and_powertrain(mats)
    
    # 4. Independent Suspension Subsystem
    print("\n[STEP 3/10] Fabricating Double-Wishbone & Multi-Link Adaptive Air Suspension...")
    coupe_suspension.build_coupe_suspension(mats)
    
    # 5. Mulliner 21-inch Wheels, Brakes & Tires
    print("\n[STEP 4/10] Fabricating 21-inch Mulliner Wheels, Carbon Ceramics & Calipers...")
    coupe_wheels.build_coupe_wheels_and_brakes(mats)
    
    # 5. Class-A Body Shell with Haunches & Creases
    print("\n[STEP 4/9] Sculpting 13-Station Parametric Class-A Continental GT Body Shell...")
    coupe_body.build_coupe_body_and_closures(mats)
    
    # 6. Front Upright Grille, Flying B Emblem & Fascia
    print("\n[STEP 5/9] Constructing Chrome Matrix Grille, Lower Splitter & Flying B Emblem...")
    coupe_fascia.build_coupe_front_fascia(mats)
    
    # 7. Quad Jewel Headlights & Ruby Taillights
    print("\n[STEP 6/9] Assembling Quad Jewel Crystal Headlamps & Ruby OLED Taillights...")
    coupe_lighting.build_lighting(mats)
    
    # 8. Panoramic Glass, Chrome Arch Moldings & Fastback Backlight
    print("\n[STEP 7/9] Installing Executive Obsidian Privacy Glass & Chrome Window Moldings...")
    coupe_glazing.build_glazing(mats)
    
    # 9. Aero Mirrors, Flush Chrome Handles & Dual Oval Exhaust
    print("\n[STEP 8/9] Installing Aero Mirrors, Rocker Chrome, & Inconel Dual Oval Exhaust...")
    coupe_hardware.build_hardware(mats)
    
    # 10. Finalization & Normals
    print("\n[STEP 9/9] Applying Normal Hardening, Smooth Shading & UV Layouts...")
    coupe_finalize.finalize_coupe_meshes()
    
    # Scene Statistics
    total_objects = len(bpy.data.objects)
    total_verts = sum(len(o.data.vertices) for o in bpy.data.objects if o.type == 'MESH')
    total_polys = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
    
    print("\n-------------------------------------------------------------------")
    print(f"  ASSEMBLY COMPLETE: {total_objects} Objects | {total_verts:,} Vertices | {total_polys:,} Polygons")
    print("-------------------------------------------------------------------")
    
    # 12. Export GLB
    print("\n[EXPORT] Exporting unified GLB to web application targets...")
    success = coupe_export.export_all_destinations()
    
    return {
        "success": success,
        "total_objects": total_objects,
        "total_verts": total_verts,
        "total_polys": total_polys
    }

if __name__ == "__main__":
    build_complete_coupe()
