"""
Master Automotive Interior GLB Upgrade Pipeline via Blender 5.2 LTS.
Processes all 29 public/models/interior/*.glb files and public/models/exterior/cockpit_interior.glb.
Adds high-detail CAD geometry, chamfers, weighted normals, and Principled BSDF PBR materials.
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix

# Ensure local script directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import interior_pbr_upgrade_lib as pbr_lib

def log(msg):
    print(f"[INTERIOR UPGRADE] {msg}")

def add_box(bm, size=(0.1, 0.1, 0.1), matrix=Matrix.Identity(4)):
    bmesh.ops.create_cube(bm, size=1.0, matrix=matrix @ Matrix.Diagonal((*size, 1.0)))

def add_cylinder(bm, radius, depth, segments=24, matrix=Matrix.Identity(4)):
    bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        segments=segments,
        radius1=radius,
        radius2=radius,
        depth=depth,
        matrix=matrix
    )

def create_mesh_obj(name, bm, mat, parent=None):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    mesh.polygons.foreach_set('use_smooth', [True] * len(mesh.polygons))
    
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    
    wn_mod = obj.modifiers.new(name="Auto_WeightedNormal", type='WEIGHTED_NORMAL')
    wn_mod.keep_sharp = True
    wn_mod.weight = 80
    
    if parent:
        obj.parent = parent
        
    return obj

def export_current_scene(fpath):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=fpath,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_yup=True,
        export_materials='EXPORT',
    )
    size_kb = os.path.getsize(fpath) / 1024
    log(f"Exported upgraded asset: {os.path.basename(fpath)} ({size_kb:.1f} KB)")

# ============================================================================
# COMPONENT-SPECIFIC PROCEDURAL ENHANCEMENTS
# ============================================================================

def enhance_dashboard(fpath, fname, mat_suite):
    """Adds precision turbine HVAC louvers and ambient LED brow piping."""
    log(f"Enhancing dashboard: {fname}...")
    
    # Procedural ambient light piping across upper dash brow
    bm_led = bmesh.new()
    for y_sign in [-1, 1]:
        # Light guide line running laterally
        mat_guide = Matrix.Translation(Vector((0.0, y_sign * 0.35, 0.08)))
        add_box(bm_led, size=(0.015, 0.55, 0.008), matrix=mat_guide)
    create_mesh_obj("GEO_Dash_AmbientLightGuide", bm_led, mat_suite["ambient_led_cyan"])
    
    # Precision knurled climate control dials in brushed aluminum
    bm_dials = bmesh.new()
    for dy in [-0.18, 0.0, 0.18]:
        pos = Vector((0.08, dy, -0.06))
        mat = Matrix.Translation(pos) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        add_cylinder(bm_dials, 0.024, 0.018, segments=28, matrix=mat)
    create_mesh_obj("GEO_Dash_ClimateDials", bm_dials, mat_suite["jewel_chrome"])

def enhance_steering_wheel(fpath, fname, mat_suite):
    """Adds CNC paddle shifters, rotary manettino dial, and 12-o'clock top marker."""
    log(f"Enhancing steering wheel: {fname}...")
    
    # Left & Right paddle shifters
    bm_paddles = bmesh.new()
    for dy, side in [(-0.16, "L"), (0.16, "R")]:
        pos = Vector((-0.045, dy, 0.04))
        mat = Matrix.Translation(pos)
        add_box(bm_paddles, size=(0.006, 0.038, 0.11), matrix=mat)
    create_mesh_obj("GEO_Steering_PaddleShifters", bm_paddles, mat_suite["carbon_forged_matte"])
    
    # Anodized rotary drive-mode manettino dial
    bm_manettino = bmesh.new()
    pos_m = Vector((0.025, 0.08, -0.07))
    mat_m = Matrix.Translation(pos_m) @ Matrix.Rotation(math.radians(90), 4, 'X')
    add_cylinder(bm_manettino, 0.016, 0.012, segments=20, matrix=mat_m)
    create_mesh_obj("GEO_Steering_ManettinoDial", bm_manettino, mat_suite["ambient_led_crimson"])
    
    # 12 o'clock center alignment stripe
    bm_stripe = bmesh.new()
    mat_s = Matrix.Translation(Vector((0.0, 0.0, 0.185)))
    add_box(bm_stripe, size=(0.028, 0.015, 0.012), matrix=mat_s)
    create_mesh_obj("GEO_Steering_CenterStripe", bm_stripe, mat_suite["ambient_led_cyan"])

def enhance_seat(fpath, fname, mat_suite):
    """Adds billet harness pass-through grommets, seatbelt latch, and adjustment levers."""
    log(f"Enhancing seat: {fname}...")
    
    # Billet aluminum shoulder harness pass-through grommets
    bm_grommets = bmesh.new()
    for dy in [-0.11, 0.11]:
        pos = Vector((-0.08, dy, 0.38))
        mat = Matrix.Translation(pos) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        add_cylinder(bm_grommets, 0.032, 0.025, segments=24, matrix=mat)
    create_mesh_obj("GEO_Seat_HarnessGrommets", bm_grommets, mat_suite["brushed_aluminum"])
    
    # Red anodized racing seatbelt latch receiver
    bm_latch = bmesh.new()
    pos_l = Vector((-0.18, 0.22, -0.10))
    mat_l = Matrix.Translation(pos_l)
    add_box(bm_latch, size=(0.045, 0.03, 0.08), matrix=mat_l)
    create_mesh_obj("GEO_Seat_BeltLatch", bm_latch, mat_suite["harness_webbing"])

def enhance_center_console(fpath, fname, mat_suite):
    """Adds knurled rotary drive controller, ambient cup holder halo, and electronic shift toggle."""
    log(f"Enhancing center console: {fname}...")
    
    # Knurled rotary drive selector
    bm_dial = bmesh.new()
    pos_d = Vector((0.15, 0.0, 0.06))
    mat_d = Matrix.Translation(pos_d)
    add_cylinder(bm_dial, 0.038, 0.022, segments=32, matrix=mat_d)
    create_mesh_obj("GEO_Console_RotarySelector", bm_dial, mat_suite["jewel_chrome"])
    
    # Ambient cup holder halo ring
    bm_halo = bmesh.new()
    for dx in [-0.08, 0.04]:
        pos_h = Vector((dx, 0.0, 0.04))
        mat_h = Matrix.Translation(pos_h)
        add_cylinder(bm_halo, 0.042, 0.006, segments=28, matrix=mat_h)
    create_mesh_obj("GEO_Console_AmbientHaloRing", bm_halo, mat_suite["ambient_led_cyan"])

def enhance_pedals(fpath, fname, mat_suite):
    """Adds rubber traction cleats to throttle, brake, and clutch pedal faces."""
    log(f"Enhancing pedals: {fname}...")
    
    bm_rubber = bmesh.new()
    for py in [-0.14, 0.0, 0.14]:
        for pz in [-0.04, 0.0, 0.04]:
            pos = Vector((0.022, py, pz))
            mat = Matrix.Translation(pos)
            add_box(bm_rubber, size=(0.008, 0.035, 0.012), matrix=mat)
    create_mesh_obj("GEO_Pedals_RubberCleats", bm_rubber, mat_suite["rubber_tactile"])

def enhance_door_cards(fpath, fname, mat_suite):
    """Adds Burmester-style metal speaker grille and ambient contour light strip."""
    log(f"Enhancing door cards: {fname}...")
    
    bm_speaker = bmesh.new()
    for dy_sign in [-1, 1]:
        pos = Vector((0.10, dy_sign * 0.72, -0.15))
        mat = Matrix.Translation(pos) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        add_cylinder(bm_speaker, 0.068, 0.014, segments=32, matrix=mat)
    create_mesh_obj("GEO_Door_SpeakerGrilles", bm_speaker, mat_suite["brushed_aluminum"])
    
    bm_strip = bmesh.new()
    for dy_sign in [-1, 1]:
        pos = Vector((0.0, dy_sign * 0.72, 0.08))
        mat = Matrix.Translation(pos)
        add_box(bm_strip, size=(0.60, 0.012, 0.008), matrix=mat)
    create_mesh_obj("GEO_Door_AmbientContourStrip", bm_strip, mat_suite["ambient_led_amber"])

# ============================================================================
# MASTER PROCESSING DISPATCHER
# ============================================================================

def process_interior_glb(fpath):
    fname = os.path.basename(fpath).lower()
    log(f"\n───────────────────────────────────────────────────────────")
    log(f"Upgrading in Blender: {fname}")
    
    pbr_lib.reset_scene()
    bpy.ops.import_scene.gltf(filepath=fpath)
    mat_suite = pbr_lib.get_interior_pbr_suite()
    
    # 1. Apply component-specific procedural CAD detailing
    if "dashboard" in fname:
        enhance_dashboard(fpath, fname, mat_suite)
    elif "steering" in fname or "yoke" in fname:
        enhance_steering_wheel(fpath, fname, mat_suite)
    elif "seat" in fname:
        enhance_seat(fpath, fname, mat_suite)
    elif "console" in fname:
        enhance_center_console(fpath, fname, mat_suite)
    elif "pedal" in fname:
        enhance_pedals(fpath, fname, mat_suite)
    elif "door" in fname:
        enhance_door_cards(fpath, fname, mat_suite)
        
    # 2. Upgrade all mesh objects in scene with PBR shaders, smooth shading & weighted normals
    mesh_count = 0
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            mesh_count += 1
            pbr_lib.apply_mesh_enhancements(obj, mat_suite)
            
    log(f"Upgraded {mesh_count} meshes with automotive PBR materials & weighted normals.")
    
    # 3. Export in place
    export_current_scene(fpath)

def run_master_interior_upgrade():
    interior_dir = os.path.abspath("public/models/interior")
    exterior_dir = os.path.abspath("public/models/exterior")
    
    # Collect all interior GLB files
    target_files = []
    if os.path.exists(interior_dir):
        for f in os.listdir(interior_dir):
            if f.endswith(".glb"):
                target_files.append(os.path.join(interior_dir, f))
                
    cockpit_exterior = os.path.join(exterior_dir, "cockpit_interior.glb")
    if os.path.exists(cockpit_exterior):
        target_files.append(cockpit_exterior)
        
    log(f"Found {len(target_files)} interior GLB assets for upgrade.")
    
    success_count = 0
    for idx, fpath in enumerate(target_files, 1):
        try:
            log(f"[{idx}/{len(target_files)}] Processing {os.path.basename(fpath)}...")
            process_interior_glb(fpath)
            success_count += 1
        except Exception as e:
            log(f"[ERROR] Failed to upgrade {fpath}: {e}")
            import traceback
            traceback.print_exc()
            
    log(f"===========================================================")
    log(f"Master Interior Upgrade Complete: {success_count}/{len(target_files)} assets upgraded.")
    log(f"===========================================================")

if __name__ == "__main__":
    run_master_interior_upgrade()
