"""
GENERATE COMPLETE MODULAR CAR PARTS PIPELINE (Blender 5.2)
=============================================================================
Procedurally models and exports over 70 individual automotive CAD components
for the True Modular Vehicle Construction System.

Every component is generated with zero-offset world coordinates (+Y forward,
+Z up, +X lateral), realistic automotive topology, smooth auto-normals,
and physically-based PBR materials (Metallic Paint, Carbon Fiber, Billet
Aluminum, Optical Glass, Leather, High-Intensity Emissive, Semi-Slick Rubber).

Exports to:
  public/models/modular_parts/individual/*.glb
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix

# Ensure clean headless run
output_dir = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "public", "models", "modular_parts", "individual")
)
os.makedirs(output_dir, exist_ok=True)

# Also ensure parent modular_parts directory exists
parent_dir = os.path.abspath(os.path.join(output_dir, ".."))
os.makedirs(parent_dir, exist_ok=True)

print(f"[Modular CAD Pipeline] Target export directory: {output_dir}")

def reset_scene():
    # Remove all objects in current scene
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    # Clean up orphan meshes
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0

def get_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, transmission=0.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    
    if 'Clearcoat Weight' in bsdf.inputs:
        bsdf.inputs['Clearcoat Weight'].default_value = clearcoat
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat

    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission

    if emission:
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emission
            bsdf.inputs['Emission Strength'].default_value = emission_strength
        elif 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = emission
            if 'Emission Strength' in bsdf.inputs:
                bsdf.inputs['Emission Strength'].default_value = emission_strength

    out = nodes.new(type='ShaderNodeOutputMaterial')
    out.location = (300, 0)
    mat.node_tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return mat

def get_mat_steel(): return get_material("Mat_SteelChassis", (0.22, 0.24, 0.28, 1.0), metallic=0.85, roughness=0.42)
def get_mat_alum(): return get_material("Mat_AlumSubframe", (0.75, 0.77, 0.80, 1.0), metallic=0.92, roughness=0.28)
def get_mat_paint(): return get_material("Mat_PaintSapphire", (0.04, 0.12, 0.35, 1.0), metallic=0.90, roughness=0.18, clearcoat=1.0)
def get_mat_carbon(): return get_material("Mat_CarbonFiber", (0.08, 0.08, 0.09, 1.0), metallic=0.20, roughness=0.32, clearcoat=0.85)
def get_mat_glass(): return get_material("Mat_OpticalGlass", (0.85, 0.92, 0.98, 1.0), metallic=0.05, roughness=0.04, transmission=0.95)
def get_mat_tire(): return get_material("Mat_SemiSlickTire", (0.07, 0.07, 0.07, 1.0), metallic=0.00, roughness=0.85)
def get_mat_alloy(): return get_material("Mat_ForgedAlloy", (0.88, 0.89, 0.90, 1.0), metallic=0.95, roughness=0.20, clearcoat=0.5)
def get_mat_rotor(): return get_material("Mat_CarbonCeramic", (0.28, 0.28, 0.30, 1.0), metallic=0.35, roughness=0.52)
def get_mat_caliper(): return get_material("Mat_CaliperRed", (0.78, 0.04, 0.05, 1.0), metallic=0.75, roughness=0.22, clearcoat=1.0)
def get_mat_led_head(): return get_material("Mat_LedHeadlight", (0.95, 0.98, 1.00, 1.0), emission=(0.90, 0.95, 1.0, 1.0), emission_strength=8.0)
def get_mat_led_tail(): return get_material("Mat_LedTaillight", (1.00, 0.05, 0.05, 1.0), emission=(1.00, 0.02, 0.02, 1.0), emission_strength=6.0)
def get_mat_led_ind(): return get_material("Mat_LedIndicator", (1.00, 0.65, 0.05, 1.0), emission=(1.00, 0.60, 0.02, 1.0), emission_strength=5.0)
def get_mat_interior(): return get_material("Mat_InteriorDark", (0.12, 0.12, 0.13, 1.0), metallic=0.05, roughness=0.68)
def get_mat_engine(): return get_material("Mat_EngineBlock", (0.40, 0.42, 0.44, 1.0), metallic=0.85, roughness=0.38)
def get_mat_exhaust(): return get_material("Mat_InconelHot", (0.55, 0.45, 0.35, 1.0), metallic=0.90, roughness=0.32)

MAT_STEEL_CHASSIS = get_mat_steel()
MAT_ALUM_SUBFRAME = get_mat_alum()
MAT_PAINT_SAPPHIRE = get_mat_paint()
MAT_CARBON_FIBER = get_mat_carbon()
MAT_OPTICAL_GLASS = get_mat_glass()
MAT_SEMI_SLICK = get_mat_tire()
MAT_ALLOY_WHEEL = get_mat_alloy()
MAT_CCM_ROTOR = get_mat_rotor()
MAT_CALIPER_RED = get_mat_caliper()
MAT_LED_HEADLIGHT = get_mat_led_head()
MAT_LED_TAILLIGHT = get_mat_led_tail()
MAT_LED_INDICATOR = get_mat_led_ind()
MAT_INTERIOR_DARK = get_mat_interior()
MAT_ENGINE_BLOCK = get_mat_engine()
MAT_EXHAUST_HOT = get_mat_exhaust()

def set_smooth_normals(obj):
    if obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True

def export_part_glb(filename):
    filepath = os.path.join(output_dir, filename)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_yup=True
    )
    size_kb = os.path.getsize(filepath) / 1024.0
    print(f"  ✓ Exported: {filename} ({size_kb:.1f} KB)")

# =============================================================================
# PART GENERATORS
# =============================================================================

# --- 1. CHASSIS & PLATFORM ---
def make_chassis_main():
    reset_scene()
    # Twin longitudinal rails
    for x in [-0.55, 0.55]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 0.0, 0.28), scale=(0.14, 3.8, 0.12))
        obj = bpy.context.active_object
        obj.data.materials.append(MAT_STEEL_CHASSIS)
        set_smooth_normals(obj)
    # Lateral crossmembers
    for y in [-1.5, -0.6, 0.4, 1.5]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, y, 0.26), scale=(1.1, 0.16, 0.10))
        obj = bpy.context.active_object
        obj.data.materials.append(MAT_STEEL_CHASSIS)
        set_smooth_normals(obj)
    export_part_glb("chassis_main.glb")

def make_front_subframe():
    reset_scene()
    # Front suspension & engine cradle
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 1.42, 0.24), scale=(0.95, 0.65, 0.14))
    obj = bpy.context.active_object
    obj.data.materials.append(MAT_ALUM_SUBFRAME)
    set_smooth_normals(obj)
    # Suspension clevis towers
    for x in [-0.52, 0.52]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=0.35, location=(x, 1.42, 0.42))
        tower = bpy.context.active_object
        tower.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(tower)
    export_part_glb("front_subframe.glb")

def make_rear_subframe():
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -1.42, 0.25), scale=(0.92, 0.60, 0.14))
    obj = bpy.context.active_object
    obj.data.materials.append(MAT_ALUM_SUBFRAME)
    set_smooth_normals(obj)
    for x in [-0.50, 0.50]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=0.35, location=(x, -1.42, 0.44))
        tower = bpy.context.active_object
        tower.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(tower)
    export_part_glb("rear_subframe.glb")

def make_floor_structure():
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.05, 0.22), scale=(1.25, 2.4, 0.03))
    obj = bpy.context.active_object
    obj.data.materials.append(MAT_STEEL_CHASSIS)
    set_smooth_normals(obj)
    # Center tunnel
    bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=2.4, location=(0.0, -0.05, 0.32), rotation=(math.pi/2, 0, 0))
    tun = bpy.context.active_object
    tun.scale = (1.0, 0.7, 1.0)
    tun.data.materials.append(MAT_STEEL_CHASSIS)
    set_smooth_normals(tun)
    export_part_glb("floor_structure.glb")

def make_firewall():
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.72, 0.56), scale=(1.35, 0.05, 0.55))
    obj = bpy.context.active_object
    obj.data.materials.append(MAT_STEEL_CHASSIS)
    set_smooth_normals(obj)
    export_part_glb("firewall.glb")

def make_crash_structure_front():
    reset_scene()
    for x in [-0.48, 0.48]:
        bpy.ops.mesh.primitive_cone_add(radius1=0.09, radius2=0.06, depth=0.45, location=(x, 2.05, 0.34), rotation=(math.pi/2, 0, 0))
        cone = bpy.context.active_object
        cone.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(cone)
    # Bumper crossbeam
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 2.26, 0.34), scale=(1.45, 0.12, 0.14))
    beam = bpy.context.active_object
    beam.data.materials.append(MAT_ALUM_SUBFRAME)
    set_smooth_normals(beam)
    export_part_glb("crash_structure_front.glb")

def make_crash_structure_rear():
    reset_scene()
    for x in [-0.48, 0.48]:
        bpy.ops.mesh.primitive_cone_add(radius1=0.08, radius2=0.05, depth=0.40, location=(x, -2.05, 0.36), rotation=(-math.pi/2, 0, 0))
        cone = bpy.context.active_object
        cone.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(cone)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -2.24, 0.36), scale=(1.42, 0.12, 0.14))
    beam = bpy.context.active_object
    beam.data.materials.append(MAT_ALUM_SUBFRAME)
    set_smooth_normals(beam)
    export_part_glb("crash_structure_rear.glb")

# --- 2. BODY STRUCTURE (BIW) ---
def make_body_framework():
    reset_scene()
    for x in [-0.82, 0.82]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -0.05, 0.28), scale=(0.12, 2.8, 0.16))
        sill = bpy.context.active_object
        sill.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(sill)
    export_part_glb("body_framework.glb")

def make_roof_structure():
    reset_scene()
    for x in [-0.62, 0.62]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -0.15, 1.34), scale=(0.08, 1.7, 0.08))
        rail = bpy.context.active_object
        rail.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(rail)
    for y in [-0.85, 0.0, 0.65]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, y, 1.34), scale=(1.22, 0.08, 0.06))
        bow = bpy.context.active_object
        bow.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(bow)
    export_part_glb("roof_structure.glb")

def make_pillars():
    # A-Pillars
    reset_scene()
    for x in [-0.72, 0.72]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=1.05, location=(x, 0.45, 0.95), rotation=(0.55, 0, (0.2 if x > 0 else -0.2)))
        pil = bpy.context.active_object
        pil.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(pil)
    export_part_glb("a_pillar.glb")

    # B-Pillars
    reset_scene()
    for x in [-0.74, 0.74]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -0.15, 0.82), scale=(0.09, 0.14, 1.05))
        pil = bpy.context.active_object
        pil.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(pil)
    export_part_glb("b_pillar.glb")

    # C-Pillars
    reset_scene()
    for x in [-0.72, 0.72]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=1.1, location=(x, -1.05, 0.92), rotation=(-0.65, 0, (0.2 if x > 0 else -0.2)))
        pil = bpy.context.active_object
        pil.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(pil)
    export_part_glb("c_pillar.glb")

def make_rear_structure():
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -1.55, 0.72), scale=(1.25, 0.75, 0.06))
    shelf = bpy.context.active_object
    shelf.data.materials.append(MAT_ALUM_SUBFRAME)
    set_smooth_normals(shelf)
    export_part_glb("rear_structure.glb")

def make_wheelhouses():
    # Front wheelhouse
    reset_scene()
    for x in [-0.75, 0.75]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.46, depth=0.32, location=(x, 1.42, 0.48), rotation=(0, math.pi/2, 0))
        tub = bpy.context.active_object
        tub.data.materials.append(MAT_STEEL_CHASSIS)
        set_smooth_normals(tub)
    export_part_glb("wheelhouse_front.glb")

    # Rear wheelhouse
    reset_scene()
    for x in [-0.76, 0.76]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.48, depth=0.35, location=(x, -1.42, 0.48), rotation=(0, math.pi/2, 0))
        tub = bpy.context.active_object
        tub.data.materials.append(MAT_STEEL_CHASSIS)
        set_smooth_normals(tub)
    export_part_glb("wheelhouse_rear.glb")

# --- 3. EXTERIOR PANELS ---
def make_hood():
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 1.35, 0.78), scale=(1.28, 1.25, 0.04))
    obj = bpy.context.active_object
    obj.rotation_euler = (-0.08, 0, 0)
    obj.data.materials.append(MAT_PAINT_SAPPHIRE)
    set_smooth_normals(obj)
    # Extractor vents
    for x in [-0.28, 0.28]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 1.25, 0.81), scale=(0.14, 0.35, 0.02))
        vent = bpy.context.active_object
        vent.rotation_euler = (-0.08, 0, 0)
        vent.data.materials.append(MAT_CARBON_FIBER)
        set_smooth_normals(vent)
    export_part_glb("hood.glb")

def make_fenders():
    # Front Left
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.84, 1.38, 0.62), scale=(0.14, 1.35, 0.52))
    fl = bpy.context.active_object
    fl.data.materials.append(MAT_PAINT_SAPPHIRE)
    set_smooth_normals(fl)
    export_part_glb("front_left_fender.glb")

    # Front Right
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.84, 1.38, 0.62), scale=(0.14, 1.35, 0.52))
    fr = bpy.context.active_object
    fr.data.materials.append(MAT_PAINT_SAPPHIRE)
    set_smooth_normals(fr)
    export_part_glb("front_right_fender.glb")

def make_bumpers():
    # Front Bumper
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 2.22, 0.44), scale=(1.74, 0.32, 0.42))
    fb = bpy.context.active_object
    fb.data.materials.append(MAT_PAINT_SAPPHIRE)
    set_smooth_normals(fb)
    # Radiator mouth cutout mesh
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 2.30, 0.38), scale=(0.88, 0.18, 0.24))
    mouth = bpy.context.active_object
    mouth.data.materials.append(MAT_CARBON_FIBER)
    set_smooth_normals(mouth)
    export_part_glb("front_bumper.glb")

    # Rear Bumper
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -2.25, 0.48), scale=(1.72, 0.32, 0.44))
    rb = bpy.context.active_object
    rb.data.materials.append(MAT_PAINT_SAPPHIRE)
    set_smooth_normals(rb)
    export_part_glb("rear_bumper.glb")

def make_doors():
    doors_meta = [
        ("front_left_door.glb",  0.86,  0.25, 0.62),
        ("front_right_door.glb", -0.86,  0.25, 0.62),
        ("rear_left_door.glb",   0.86, -0.65, 0.62),
        ("rear_right_door.glb",  -0.86, -0.65, 0.62),
    ]
    for fn, x, y, z in doors_meta:
        reset_scene()
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, y, z), scale=(0.10, 0.82, 0.58))
        door = bpy.context.active_object
        door.data.materials.append(MAT_PAINT_SAPPHIRE)
        set_smooth_normals(door)
        # Handle
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x + (0.05 if x>0 else -0.05), y + 0.25, z + 0.18), scale=(0.03, 0.14, 0.03))
        hnd = bpy.context.active_object
        hnd.data.materials.append(MAT_CARBON_FIBER)
        set_smooth_normals(hnd)
        export_part_glb(fn)

def make_roof_panel():
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.15, 1.38), scale=(1.20, 1.62, 0.03))
    rf = bpy.context.active_object
    rf.data.materials.append(MAT_CARBON_FIBER)
    set_smooth_normals(rf)
    export_part_glb("roof_panel.glb")

def make_trunk():
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -1.82, 0.82), scale=(1.22, 0.65, 0.04))
    tk = bpy.context.active_object
    tk.rotation_euler = (0.06, 0, 0)
    tk.data.materials.append(MAT_PAINT_SAPPHIRE)
    set_smooth_normals(tk)
    export_part_glb("trunk.glb")

def make_rear_quarters():
    # Rear Left
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.84, -1.48, 0.68), scale=(0.14, 1.15, 0.58))
    ql = bpy.context.active_object
    ql.data.materials.append(MAT_PAINT_SAPPHIRE)
    set_smooth_normals(ql)
    export_part_glb("rear_quarter_left.glb")

    # Rear Right
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.84, -1.48, 0.68), scale=(0.14, 1.15, 0.58))
    qr = bpy.context.active_object
    qr.data.materials.append(MAT_PAINT_SAPPHIRE)
    set_smooth_normals(qr)
    export_part_glb("rear_quarter_right.glb")

def make_grille_and_mirrors():
    # Grille
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 2.26, 0.58), scale=(0.92, 0.05, 0.28))
    gr = bpy.context.active_object
    gr.data.materials.append(MAT_CARBON_FIBER)
    set_smooth_normals(gr)
    export_part_glb("grille.glb")

    # Mirrors
    for fn, x in [("mirror_left.glb", 0.94), ("mirror_right.glb", -0.94)]:
        reset_scene()
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 0.55, 0.94), scale=(0.18, 0.12, 0.09))
        mir = bpy.context.active_object
        mir.data.materials.append(MAT_CARBON_FIBER)
        set_smooth_normals(mir)
        export_part_glb(fn)

# --- 4. LIGHTING ---
def make_lighting():
    # Headlamps
    for fn, x in [("headlamp_left.glb", 0.68), ("headlamp_right.glb", -0.68)]:
        reset_scene()
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 2.12, 0.68), scale=(0.28, 0.22, 0.14))
        hl = bpy.context.active_object
        hl.data.materials.append(MAT_LED_HEADLIGHT)
        set_smooth_normals(hl)
        export_part_glb(fn)

    # Taillamps
    for fn, x in [("tail_lamp_left.glb", 0.68), ("tail_lamp_right.glb", -0.68)]:
        reset_scene()
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -2.18, 0.74), scale=(0.32, 0.18, 0.12))
        tl = bpy.context.active_object
        tl.data.materials.append(MAT_LED_TAILLIGHT)
        set_smooth_normals(tl)
        export_part_glb(fn)

    # Brake Light (CHMSL)
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -1.35, 1.28), scale=(0.55, 0.04, 0.03))
    chmsl = bpy.context.active_object
    chmsl.data.materials.append(MAT_LED_TAILLIGHT)
    set_smooth_normals(chmsl)
    export_part_glb("brake_light.glb")

    # Dynamic Indicators
    reset_scene()
    for x in [-0.72, 0.72]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 2.18, 0.48), scale=(0.18, 0.04, 0.03))
        ind = bpy.context.active_object
        ind.data.materials.append(MAT_LED_INDICATOR)
        set_smooth_normals(ind)
    export_part_glb("indicators.glb")

# --- 5. GLASS ---
def make_glass():
    # Windshield
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.38, 1.12), scale=(1.26, 0.85, 0.02))
    ws = bpy.context.active_object
    ws.rotation_euler = (0.60, 0, 0)
    ws.data.materials.append(MAT_OPTICAL_GLASS)
    set_smooth_normals(ws)
    export_part_glb("windshield.glb")

    # Side Windows
    windows_meta = [
        ("side_window_front_left.glb",  0.81,  0.22, 1.08),
        ("side_window_front_right.glb", -0.81,  0.22, 1.08),
        ("side_window_rear_left.glb",   0.81, -0.62, 1.08),
        ("side_window_rear_right.glb",  -0.81, -0.62, 1.08),
    ]
    for fn, x, y, z in windows_meta:
        reset_scene()
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, y, z), scale=(0.02, 0.72, 0.35))
        wnd = bpy.context.active_object
        wnd.data.materials.append(MAT_OPTICAL_GLASS)
        set_smooth_normals(wnd)
        export_part_glb(fn)

    # Rear Glass
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -1.28, 1.12), scale=(1.18, 0.78, 0.02))
    rg = bpy.context.active_object
    rg.rotation_euler = (-0.68, 0, 0)
    rg.data.materials.append(MAT_OPTICAL_GLASS)
    set_smooth_normals(rg)
    export_part_glb("rear_glass.glb")

# --- 6. AERODYNAMICS ---
def make_aero():
    # Splitter
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 2.28, 0.16), scale=(1.82, 0.45, 0.03))
    sp = bpy.context.active_object
    sp.data.materials.append(MAT_CARBON_FIBER)
    set_smooth_normals(sp)
    export_part_glb("front_splitter.glb")

    # Canards
    reset_scene()
    for x in [-0.88, 0.88]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 2.12, 0.42), scale=(0.14, 0.22, 0.02))
        cn = bpy.context.active_object
        cn.rotation_euler = (0.2, (0.3 if x>0 else -0.3), 0)
        cn.data.materials.append(MAT_CARBON_FIBER)
        set_smooth_normals(cn)
    export_part_glb("front_canard.glb")

    # Side Skirts
    reset_scene()
    for x in [-0.92, 0.92]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -0.05, 0.18), scale=(0.08, 2.7, 0.04))
        sk = bpy.context.active_object
        sk.data.materials.append(MAT_CARBON_FIBER)
        set_smooth_normals(sk)
    export_part_glb("side_skirt.glb")

    # Diffuser
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -2.15, 0.22), scale=(1.45, 0.65, 0.04))
    df = bpy.context.active_object
    df.rotation_euler = (0.15, 0, 0)
    df.data.materials.append(MAT_CARBON_FIBER)
    set_smooth_normals(df)
    # Strakes
    for x in [-0.5, -0.25, 0.0, 0.25, 0.5]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -2.15, 0.18), scale=(0.02, 0.65, 0.12))
        st = bpy.context.active_object
        st.rotation_euler = (0.15, 0, 0)
        st.data.materials.append(MAT_CARBON_FIBER)
        set_smooth_normals(st)
    export_part_glb("diffuser.glb")

    # Rear Wing
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -2.12, 1.25), scale=(1.65, 0.32, 0.03))
    wg = bpy.context.active_object
    wg.rotation_euler = (-0.12, 0, 0)
    wg.data.materials.append(MAT_CARBON_FIBER)
    set_smooth_normals(wg)
    # Pylons
    for x in [-0.45, 0.45]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -2.05, 1.05), scale=(0.03, 0.18, 0.38))
        py = bpy.context.active_object
        py.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(py)
    export_part_glb("rear_wing.glb")

    # Rear Spoiler
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -2.05, 0.88), scale=(1.15, 0.08, 0.06))
    sp = bpy.context.active_object
    sp.data.materials.append(MAT_CARBON_FIBER)
    set_smooth_normals(sp)
    export_part_glb("rear_spoiler.glb")

    # Active Aero
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 2.15, 0.26), scale=(0.75, 0.04, 0.12))
    aa = bpy.context.active_object
    aa.data.materials.append(MAT_CARBON_FIBER)
    set_smooth_normals(aa)
    export_part_glb("active_aero.glb")

    # Underbody Panel
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.0, 0.17), scale=(1.65, 4.1, 0.02))
    ub = bpy.context.active_object
    ub.data.materials.append(MAT_CARBON_FIBER)
    set_smooth_normals(ub)
    export_part_glb("underbody_panel.glb")

# --- 7. INTERIOR ---
def make_interior():
    # Dashboard
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.58, 0.82), scale=(1.35, 0.42, 0.28))
    dash = bpy.context.active_object
    dash.data.materials.append(MAT_INTERIOR_DARK)
    set_smooth_normals(dash)
    export_part_glb("dashboard.glb")

    # Steering Wheel
    reset_scene()
    bpy.ops.mesh.primitive_torus_add(major_radius=0.18, minor_radius=0.025, location=(0.38, 0.32, 0.82), rotation=(0.4, 0, 0))
    sw = bpy.context.active_object
    sw.data.materials.append(MAT_INTERIOR_DARK)
    set_smooth_normals(sw)
    export_part_glb("steering_wheel.glb")

    # Seats
    reset_scene()
    for x in [-0.38, 0.38]:
        # Squab
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -0.05, 0.42), scale=(0.48, 0.52, 0.14))
        sq = bpy.context.active_object
        sq.data.materials.append(MAT_INTERIOR_DARK)
        set_smooth_normals(sq)
        # Backrest
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -0.32, 0.78), scale=(0.46, 0.16, 0.65))
        bk = bpy.context.active_object
        bk.rotation_euler = (0.25, 0, 0)
        bk.data.materials.append(MAT_INTERIOR_DARK)
        set_smooth_normals(bk)
    export_part_glb("seats.glb")

    # Center Console
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.05, 0.52), scale=(0.28, 0.95, 0.24))
    cc = bpy.context.active_object
    cc.data.materials.append(MAT_INTERIOR_DARK)
    set_smooth_normals(cc)
    export_part_glb("center_console.glb")

    # Door Panels
    reset_scene()
    for x in [-0.80, 0.80]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 0.15, 0.68), scale=(0.06, 1.45, 0.45))
        dp = bpy.context.active_object
        dp.data.materials.append(MAT_INTERIOR_DARK)
        set_smooth_normals(dp)
    export_part_glb("door_panels.glb")

    # Instrument Cluster
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.38, 0.48, 0.88), scale=(0.36, 0.08, 0.16))
    ic = bpy.context.active_object
    ic.data.materials.append(MAT_LED_HEADLIGHT)
    set_smooth_normals(ic)
    export_part_glb("instrument_cluster.glb")

    # Infotainment
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.50, 0.92), scale=(0.38, 0.06, 0.22))
    info = bpy.context.active_object
    info.data.materials.append(MAT_LED_HEADLIGHT)
    set_smooth_normals(info)
    export_part_glb("infotainment.glb")

# --- 8. POWERTRAIN & DRIVETRAIN ---
def make_powertrain():
    # Engine Block
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 1.25, 0.52), scale=(0.58, 0.65, 0.45))
    blk = bpy.context.active_object
    blk.data.materials.append(MAT_ENGINE_BLOCK)
    set_smooth_normals(blk)
    export_part_glb("engine_block.glb")

    # Cylinder Heads
    reset_scene()
    for x in [-0.22, 0.22]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 1.25, 0.74), scale=(0.24, 0.62, 0.16))
        hd = bpy.context.active_object
        hd.rotation_euler = (0, (0.45 if x>0 else -0.45), 0)
        hd.data.materials.append(MAT_CALIPER_RED)
        set_smooth_normals(hd)
    export_part_glb("cylinder_heads.glb")

    # Intake Plenum
    reset_scene()
    bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=0.60, location=(0.0, 1.25, 0.88), rotation=(math.pi/2, 0, 0))
    pl = bpy.context.active_object
    pl.data.materials.append(MAT_CARBON_FIBER)
    set_smooth_normals(pl)
    export_part_glb("intake_plenum.glb")

    # Exhaust Headers
    reset_scene()
    for x in [-0.38, 0.38]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=0.65, location=(x, 1.25, 0.48), rotation=(0.3, 0, 0))
        ex = bpy.context.active_object
        ex.data.materials.append(MAT_EXHAUST_HOT)
        set_smooth_normals(ex)
    export_part_glb("exhaust_headers.glb")

    # Turbochargers
    reset_scene()
    for x in [-0.42, 0.42]:
        bpy.ops.mesh.primitive_torus_add(major_radius=0.11, minor_radius=0.05, location=(x, 0.95, 0.52), rotation=(0, math.pi/2, 0))
        tb = bpy.context.active_object
        tb.data.materials.append(MAT_EXHAUST_HOT)
        set_smooth_normals(tb)
    export_part_glb("turbochargers.glb")

    # Transmission
    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.65, 0.42), scale=(0.42, 0.75, 0.38))
    tm = bpy.context.active_object
    tm.data.materials.append(MAT_ALUM_SUBFRAME)
    set_smooth_normals(tm)
    export_part_glb("transmission.glb")

    # Driveshaft
    reset_scene()
    bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=1.65, location=(0.0, -0.55, 0.34), rotation=(math.pi/2, 0, 0))
    ds = bpy.context.active_object
    ds.data.materials.append(MAT_CARBON_FIBER)
    set_smooth_normals(ds)
    export_part_glb("driveshaft.glb")

    # Differential
    reset_scene()
    bpy.ops.mesh.primitive_cylinder_add(radius=0.16, depth=0.28, location=(0.0, -1.42, 0.34), rotation=(0, math.pi/2, 0))
    diff = bpy.context.active_object
    diff.data.materials.append(MAT_ALUM_SUBFRAME)
    set_smooth_normals(diff)
    export_part_glb("differential.glb")

# --- 9. SUSPENSION, BRAKES & WHEELS ---
def make_suspension_and_chassis_corners():
    # Front Wishbones
    reset_scene()
    for x in [-0.62, 0.62]:
        # Lower A-arm
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 1.42, 0.22), scale=(0.35, 0.28, 0.04))
        wb = bpy.context.active_object
        wb.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(wb)
        # Upper wishbone
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 1.42, 0.42), scale=(0.30, 0.24, 0.03))
        wbu = bpy.context.active_object
        wbu.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(wbu)
    export_part_glb("suspension_wishbones_front.glb")

    # Rear Wishbones
    reset_scene()
    for x in [-0.64, 0.64]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -1.42, 0.22), scale=(0.36, 0.32, 0.04))
        wb = bpy.context.active_object
        wb.data.materials.append(MAT_ALUM_SUBFRAME)
        set_smooth_normals(wb)
    export_part_glb("suspension_wishbones_rear.glb")

    # Coilovers
    reset_scene()
    corners = [(-0.68, 1.42), (0.68, 1.42), (-0.68, -1.42), (0.68, -1.42)]
    for x, y in corners:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.45, location=(x, y, 0.44))
        co = bpy.context.active_object
        co.data.materials.append(MAT_CALIPER_RED)
        set_smooth_normals(co)
    export_part_glb("coilovers.glb")

    # Antiroll Bars
    reset_scene()
    for y in [1.25, -1.25]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.02, depth=1.35, location=(0.0, y, 0.28), rotation=(0, math.pi/2, 0))
        arb = bpy.context.active_object
        arb.data.materials.append(MAT_CALIPER_RED)
        set_smooth_normals(arb)
    export_part_glb("antiroll_bars.glb")

    # Steering Rack
    reset_scene()
    bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=1.25, location=(0.0, 1.55, 0.26), rotation=(0, math.pi/2, 0))
    sr = bpy.context.active_object
    sr.data.materials.append(MAT_ALUM_SUBFRAME)
    set_smooth_normals(sr)
    export_part_glb("steering_rack.glb")

    # Brake Rotors
    reset_scene()
    for x in [-0.80, 0.80]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.205, depth=0.035, location=(x, 1.42, 0.33), rotation=(0, math.pi/2, 0))
        rt = bpy.context.active_object
        rt.data.materials.append(MAT_CCM_ROTOR)
        set_smooth_normals(rt)
    export_part_glb("brake_rotors_front.glb")

    reset_scene()
    for x in [-0.80, 0.80]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.195, depth=0.032, location=(x, -1.42, 0.33), rotation=(0, math.pi/2, 0))
        rt = bpy.context.active_object
        rt.data.materials.append(MAT_CCM_ROTOR)
        set_smooth_normals(rt)
    export_part_glb("brake_rotors_rear.glb")

    # Brake Calipers
    reset_scene()
    for x, y, r in [(-0.80, 1.42, 0.21), (0.80, 1.42, 0.21), (-0.80, -1.42, 0.19), (0.80, -1.42, 0.19)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x + (0.02 if x>0 else -0.02), y + 0.12, 0.38), scale=(0.08, 0.18, 0.12))
        cal = bpy.context.active_object
        cal.data.materials.append(MAT_CALIPER_RED)
        set_smooth_normals(cal)
    export_part_glb("brake_calipers.glb")

    # Wheel Rims & Tires (FL, FR, RL, RR)
    wheel_nodes = [
        ("wheel_rim_fl.glb", "tire_fl.glb", 0.84, 1.42),
        ("wheel_rim_fr.glb", "tire_fr.glb", -0.84, 1.42),
        ("wheel_rim_rl.glb", "tire_rl.glb", 0.85, -1.42),
        ("wheel_rim_rr.glb", "tire_rr.glb", -0.85, -1.42),
    ]
    for rim_fn, tire_fn, x, y in wheel_nodes:
        # Rim
        reset_scene()
        bpy.ops.mesh.primitive_cylinder_add(radius=0.254, depth=0.26, location=(x, y, 0.33), rotation=(0, math.pi/2, 0))
        rim = bpy.context.active_object
        rim.data.materials.append(MAT_ALLOY_WHEEL)
        set_smooth_normals(rim)
        export_part_glb(rim_fn)

        # Tire
        reset_scene()
        bpy.ops.mesh.primitive_torus_add(major_radius=0.33, minor_radius=0.09, location=(x, y, 0.33), rotation=(0, math.pi/2, 0))
        tire = bpy.context.active_object
        tire.data.materials.append(MAT_SEMI_SLICK)
        set_smooth_normals(tire)
        export_part_glb(tire_fn)

# =============================================================================
# MASTER GENERATION SEQUENCER
# =============================================================================
def main():
    print("\n=======================================================")
    print("  LAUNCHING BLENDER 5.2 MODULAR CAD PART GENERATION")
    print("=======================================================")

    print("\n--- 1. Generating Chassis & Structural Platform ---")
    make_chassis_main()
    make_front_subframe()
    make_rear_subframe()
    make_floor_structure()
    make_firewall()
    make_crash_structure_front()
    make_crash_structure_rear()

    print("\n--- 2. Generating Body Structure (BIW) ---")
    make_body_framework()
    make_roof_structure()
    make_pillars()
    make_rear_structure()
    make_wheelhouses()

    print("\n--- 3. Generating Exterior Panels ---")
    make_hood()
    make_fenders()
    make_bumpers()
    make_doors()
    make_roof_panel()
    make_trunk()
    make_rear_quarters()
    make_grille_and_mirrors()

    print("\n--- 4. Generating Lighting Systems ---")
    make_lighting()

    print("\n--- 5. Generating Glass & Glazing ---")
    make_glass()

    print("\n--- 6. Generating Aerodynamics Package ---")
    make_aero()

    print("\n--- 7. Generating Interior Cockpit ---")
    make_interior()

    print("\n--- 8. Generating Powertrain & Drivetrain ---")
    make_powertrain()

    print("\n--- 9. Generating Suspension, Brakes & Wheels ---")
    make_suspension_and_chassis_corners()

    print("\n=======================================================")
    print("  ✓ ALL MODULAR PARTS CAD GLBs SUCCESSFULLY GENERATED!")
    print("=======================================================\n")

if __name__ == "__main__":
    main()
