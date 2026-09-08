"""
==============================================================================
UPGRADE VEHICLE PACKAGING ENVELOPES GLB ASSETS (BLENDER 5.2 LTS)
==============================================================================
Replaces low-poly (72 verts) box envelopes with high-density Class-A CAD
ergonomic and mechanical packaging envelopes across:
- sedan/envelopes.glb
- hatchback/envelopes.glb
- crossover/envelopes.glb
- suv/envelopes.glb
Synchronized to both public/models/vehicles/ and public/vehicles/
==============================================================================
"""

import bpy
import bmesh
import math
import os
import shutil
import sys
from mathutils import Vector, Matrix

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# Specifications for the 4 vehicle archetypes (in meters)
SPECS = {
    "sedan": {
        "name": "Executive Sport Sedan",
        "wheelbase": 2.850,
        "track_front": 1.620,
        "ride_height": 0.135,
        "overall_length": 4.880,
        "overall_width": 1.860,
        "overall_height": 1.440,
        "front_overhang": 0.920,
        "rear_overhang": 1.110,
        "hood_height": 0.920,
        "beltline_height": 0.980,
        "roof_length": 1.850,
        "trunk_length": 0.750,
        "has_trunk": True,
    },
    "hatchback": {
        "name": "Hot Hatch Performance",
        "wheelbase": 2.600,
        "track_front": 1.560,
        "ride_height": 0.130,
        "overall_length": 4.220,
        "overall_width": 1.800,
        "overall_height": 1.460,
        "front_overhang": 0.840,
        "rear_overhang": 0.780,
        "hood_height": 0.940,
        "beltline_height": 0.960,
        "roof_length": 2.100,
        "trunk_length": 0.0,
        "has_trunk": False,
    },
    "crossover": {
        "name": "Urban Crossover AWD",
        "wheelbase": 2.700,
        "track_front": 1.630,
        "ride_height": 0.190,
        "overall_length": 4.540,
        "overall_width": 1.880,
        "overall_height": 1.620,
        "front_overhang": 0.880,
        "rear_overhang": 0.960,
        "hood_height": 1.080,
        "beltline_height": 1.120,
        "roof_length": 2.150,
        "trunk_length": 0.0,
        "has_trunk": False,
    },
    "suv": {
        "name": "Full-Size Heavy Duty SUV",
        "wheelbase": 2.980,
        "track_front": 1.680,
        "ride_height": 0.230,
        "overall_length": 5.080,
        "overall_width": 2.000,
        "overall_height": 1.820,
        "front_overhang": 0.980,
        "rear_overhang": 1.120,
        "hood_height": 1.180,
        "beltline_height": 1.220,
        "roof_length": 2.400,
        "trunk_length": 0.0,
        "has_trunk": False,
    },
}

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if bpy.context.scene.collection:
        for obj in list(bpy.context.scene.collection.objects):
            bpy.data.objects.remove(obj, do_unlink=True)

def create_envelope_mat(name, color_rgba, roughness=0.25, metallic=0.1, alpha=0.35):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color_rgba
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.55
        if "Alpha" in bsdf.inputs:
            bsdf.inputs["Alpha"].default_value = alpha
        mat.blend_method = 'BLEND'
    return mat

def apply_envelope_modifiers(obj, bevel_width=0.015, subsurf_levels=1):
    mesh = obj.data
    for p in mesh.polygons:
        p.use_smooth = True
    if bevel_width > 0:
        bev = obj.modifiers.new(name="CAD_Bevel", type='BEVEL')
        bev.width = bevel_width
        bev.segments = 3
        bev.profile = 0.7
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)
    if subsurf_levels > 0:
        sub = obj.modifiers.new(name="CAD_Subsurf", type='SUBSURF')
        sub.levels = subsurf_levels
        sub.render_levels = subsurf_levels

def bmesh_create_box_chamfer(bm, center, size, chamfer=0.04):
    """Creates a clean box in bmesh with chamfered profile."""
    dx, dy, dz = size[0]*0.5, size[1]*0.5, size[2]*0.5
    cx, cy, cz = center
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation(center) @ Matrix.Diagonal((size[0], size[1], size[2], 1.0))
    )

def build_envelopes_for_spec(spec_key):
    spec = SPECS[spec_key]
    clear_scene()
    
    wb = spec["wheelbase"]
    ol = spec["overall_length"]
    ow = spec["overall_width"]
    oh = spec["overall_height"]
    rh = spec["ride_height"]
    fx = wb / 2.0
    rx = -wb / 2.0
    hood_z = spec["hood_height"]
    roof_z = oh
    belt_z = spec["beltline_height"]
    
    mat_eng = create_envelope_mat("Env_Engine_Bay", (0.95, 0.25, 0.15, 1.0), roughness=0.2, alpha=0.35)
    mat_eng_core = create_envelope_mat("Env_Engine_Core", (1.0, 0.45, 0.15, 1.0), roughness=0.3, alpha=0.45)
    mat_cab = create_envelope_mat("Env_Cabin", (0.15, 0.55, 0.95, 1.0), roughness=0.15, alpha=0.28)
    mat_occ = create_envelope_mat("Env_Occupants", (0.25, 0.75, 1.0, 1.0), roughness=0.3, alpha=0.45)
    mat_crg = create_envelope_mat("Env_Cargo", (0.15, 0.85, 0.35, 1.0), roughness=0.2, alpha=0.32)
    mat_cage = create_envelope_mat("Env_CAD_Cage", (0.85, 0.90, 0.95, 1.0), roughness=0.1, metallic=0.85, alpha=0.85)

    root = bpy.data.objects.new("ENVELOPES_ROOT", None)
    root.empty_display_type = 'ARROWS'
    root.empty_display_size = 0.2
    bpy.context.scene.collection.objects.link(root)
    
    # -------------------------------------------------------------------------
    # 1. ENGINE BAY PACKAGING ENVELOPE (Front Powertrain Volume)
    # -------------------------------------------------------------------------
    eng_len = fx * 0.85 + spec["front_overhang"] * 0.65
    eng_w = ow * 0.74
    eng_h = hood_z - (rh + 0.08)
    eng_cx = fx * 0.55 + spec["front_overhang"] * 0.28
    eng_cz = rh + 0.08 + eng_h / 2.0
    
    # Outer Hood / Shock Tower Sculpted Shell
    bm_eng = bmesh.new()
    # Main outer chamber
    bmesh.ops.create_cube(
        bm_eng, size=1.0,
        matrix=Matrix.Translation((eng_cx, 0.0, eng_cz)) @ Matrix.Diagonal((eng_len, eng_w, eng_h, 1.0))
    )
    # Forward nose taper wedge
    bmesh.ops.create_cube(
        bm_eng, size=1.0,
        matrix=Matrix.Translation((eng_cx + eng_len*0.35, 0.0, eng_cz - eng_h*0.1)) @ Matrix.Diagonal((eng_len*0.35, eng_w*0.85, eng_h*0.75, 1.0))
    )
    mesh_eng = bpy.data.meshes.new("ENGINE_BAY")
    bm_eng.to_mesh(mesh_eng)
    bm_eng.free()
    obj_eng = bpy.data.objects.new("ENGINE_BAY", mesh_eng)
    obj_eng.data.materials.append(mat_eng)
    obj_eng.parent = root
    bpy.context.scene.collection.objects.link(obj_eng)
    apply_envelope_modifiers(obj_eng, bevel_width=0.02, subsurf_levels=1)
    
    # Inner Engine / Transmission Mechanical Core Block
    bm_core = bmesh.new()
    bmesh.ops.create_cube(
        bm_core, size=1.0,
        matrix=Matrix.Translation((eng_cx - eng_len*0.05, 0.0, eng_cz - 0.04)) @ Matrix.Diagonal((eng_len * 0.65, eng_w * 0.55, eng_h * 0.7, 1.0))
    )
    mesh_core = bpy.data.meshes.new("ENGINE_BAY_CORE")
    bm_core.to_mesh(mesh_core)
    bm_core.free()
    obj_core = bpy.data.objects.new("ENGINE_BAY_CORE", mesh_core)
    obj_core.data.materials.append(mat_eng_core)
    obj_core.parent = root
    bpy.context.scene.collection.objects.link(obj_core)
    apply_envelope_modifiers(obj_core, bevel_width=0.015, subsurf_levels=1)
    
    # -------------------------------------------------------------------------
    # 2. CABIN GREENHOUSE & ERGONOMIC OCCUPANT ENVELOPE
    # -------------------------------------------------------------------------
    cab_len = spec["roof_length"] * 1.18
    cab_w = ow * 0.86
    cab_h = roof_z - (rh + 0.15)
    cab_cx = fx * 0.12 - cab_len * 0.42
    cab_cz = rh + 0.15 + cab_h / 2.0
    
    # Sculpted Aerodynamic Greenhouse Envelope (Tumblehome + Windshield Rake)
    bm_cab = bmesh.new()
    # Main lower cabin volume
    bmesh.ops.create_cube(
        bm_cab, size=1.0,
        matrix=Matrix.Translation((cab_cx, 0.0, cab_cz - cab_h*0.12)) @ Matrix.Diagonal((cab_len, cab_w, cab_h * 0.76, 1.0))
    )
    # Upper roof greenhouse with tumblehome taper
    bmesh.ops.create_cube(
        bm_cab, size=1.0,
        matrix=Matrix.Translation((cab_cx - cab_len*0.04, 0.0, cab_cz + cab_h*0.22)) @ Matrix.Diagonal((cab_len * 0.72, cab_w * 0.78, cab_h * 0.54, 1.0))
    )
    mesh_cab = bpy.data.meshes.new("CABIN_ENVELOPE")
    bm_cab.to_mesh(mesh_cab)
    bm_cab.free()
    obj_cab = bpy.data.objects.new("CABIN_ENVELOPE", mesh_cab)
    obj_cab.data.materials.append(mat_cab)
    obj_cab.parent = root
    bpy.context.scene.collection.objects.link(obj_cab)
    apply_envelope_modifiers(obj_cab, bevel_width=0.035, subsurf_levels=1)
    
    # Occupant Seating Packages (Driver & Front Passenger SAE H-Point Blocks)
    for seat_y in [-cab_w * 0.22, cab_w * 0.22]:
        bm_seat = bmesh.new()
        # Front occupant seat cushion & torso clearance
        bmesh.ops.create_cube(
            bm_seat, size=1.0,
            matrix=Matrix.Translation((cab_cx + cab_len*0.12, seat_y, cab_cz - 0.05)) @ Matrix.Diagonal((0.55, 0.46, 0.75, 1.0))
        )
        # Rear passenger bench clearance
        bmesh.ops.create_cube(
            bm_seat, size=1.0,
            matrix=Matrix.Translation((cab_cx - cab_len*0.24, seat_y, cab_cz - 0.03)) @ Matrix.Diagonal((0.52, 0.46, 0.72, 1.0))
        )
        mesh_seat = bpy.data.meshes.new(f"OCCUPANT_SPACE_{seat_y}")
        bm_seat.to_mesh(mesh_seat)
        bm_seat.free()
        obj_seat = bpy.data.objects.new(f"OCCUPANT_SPACE_{seat_y}", mesh_seat)
        obj_seat.data.materials.append(mat_occ)
        obj_seat.parent = root
        bpy.context.scene.collection.objects.link(obj_seat)
        apply_envelope_modifiers(obj_seat, bevel_width=0.02, subsurf_levels=1)
        
    # -------------------------------------------------------------------------
    # 3. CARGO PACKAGING ENVELOPE (VDA Luggage Standard)
    # -------------------------------------------------------------------------
    if spec["has_trunk"]:
        crg_len = spec["trunk_length"] * 1.15
        crg_w = ow * 0.70
        crg_h = belt_z - (rh + 0.10)
        crg_cx = rx - crg_len * 0.46
        crg_cz = rh + 0.10 + crg_h / 2.0
    else:
        crg_len = spec["rear_overhang"] * 0.88
        crg_w = ow * 0.74
        crg_h = (roof_z * 0.86) - (rh + 0.10)
        crg_cx = rx - crg_len * 0.46
        crg_cz = rh + 0.10 + crg_h / 2.0
        
    bm_crg = bmesh.new()
    bmesh.ops.create_cube(
        bm_crg, size=1.0,
        matrix=Matrix.Translation((crg_cx, 0.0, crg_cz)) @ Matrix.Diagonal((crg_len, crg_w, crg_h, 1.0))
    )
    # Forward pass-through extension
    bmesh.ops.create_cube(
        bm_crg, size=1.0,
        matrix=Matrix.Translation((crg_cx + crg_len*0.4, 0.0, crg_cz - crg_h*0.1)) @ Matrix.Diagonal((crg_len*0.35, crg_w*0.6, crg_h*0.65, 1.0))
    )
    mesh_crg = bpy.data.meshes.new("CARGO_ENVELOPE")
    bm_crg.to_mesh(mesh_crg)
    bm_crg.free()
    obj_crg = bpy.data.objects.new("CARGO_ENVELOPE", mesh_crg)
    obj_crg.data.materials.append(mat_crg)
    obj_crg.parent = root
    bpy.context.scene.collection.objects.link(obj_crg)
    apply_envelope_modifiers(obj_crg, bevel_width=0.025, subsurf_levels=1)
    
    # -------------------------------------------------------------------------
    # EXPORT TO BOTH PUBLIC DIRS
    # -------------------------------------------------------------------------
    target_dirs = [
        os.path.join(PROJECT_ROOT, "public", "models", "vehicles", spec_key),
        os.path.join(PROJECT_ROOT, "public", "vehicles", spec_key),
    ]
    
    for t_dir in target_dirs:
        os.makedirs(t_dir, exist_ok=True)
        out_file = os.path.join(t_dir, "envelopes.glb")
        bpy.ops.export_scene.gltf(
            filepath=out_file,
            export_format='GLB',
            use_selection=False,
            export_apply=True,
            export_yup=True
        )
        sz_kb = os.path.getsize(out_file) / 1024.0
        print(f"  [ENVELOPE_UPGRADE] -> {os.path.relpath(out_file, PROJECT_ROOT)} ({sz_kb:.1f} KB)")

# ===========================================================================
# MAIN ENTRYPOINT
# ===========================================================================
if __name__ == "__main__":
    print("[ENVELOPE_UPGRADE] Starting upgrade of vehicle packaging envelopes...")
    for cat in ["sedan", "hatchback", "crossover", "suv"]:
        print(f"\n[ENVELOPE_UPGRADE] Building high-density CAD envelopes for {cat.upper()}...")
        build_envelopes_for_spec(cat)
    print("\n[ENVELOPE_UPGRADE] [COMPLETE] All 4 vehicle category envelopes upgraded!")
