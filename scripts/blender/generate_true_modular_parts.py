"""
==============================================================================
AUTOMOTIVE TRUE MODULAR VEHICLE PARTS GENERATOR (BLENDER 5.2 LTS)
==============================================================================
Generates a complete library of zero-offset, modular CAD components:
- Chassis variants: Sedan, Coupe, SUV, Hatchback, Crossover
- Powertrain: V8 Twin-Turbo Engine Block & DCT 7-Speed Transmission
- Suspension: Front & Rear Double Wishbone with Coilovers and Sway Bars
- Brakes: Ventilated Cross-Drilled Rotors with 6-Piston Monobloc Calipers
- Wheels: Diamond-Cut Forged Rims with High-Performance Semi-Slick Tires
- Body Framework: Structural Body-in-White (A/B/C-Pillars, Roof Rails, Floor Pan)
- Exterior Panels: Hood, Front/Rear Bumpers, Fenders, Doors, Quarter Panels
- Lighting & Glass: Matrix LED Headlights, OLED Taillights, Acoustic Glass
- Aerodynamics: Carbon Fiber Splitter, Side Skirts, Rear Diffuser, Active Wing
- Interior: Sculpted Dashboard, Sports Steering Wheel, Carbon Bucket Seats
==============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Euler, Matrix

def log(msg):
    print(f"[MODULAR_PARTS_CAD] {msg}")

OUT_DIR = os.path.abspath("public/models/modular_parts")
os.makedirs(OUT_DIR, exist_ok=True)

def reset_clean():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o)
    for m in list(bpy.data.materials):
        bpy.data.materials.remove(m)
    for me in list(bpy.data.meshes):
        bpy.data.meshes.remove(me)

def set_socket(bsdf, socket_names, val):
    for name in socket_names:
        if name in bsdf.inputs:
            bsdf.inputs[name].default_value = val
            return True
    return False

def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, transmission=0.0, ior=1.52, alpha=1.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    bsdf = tree.nodes.get("Principled BSDF")
    if not bsdf:
        bsdf = tree.nodes.new(type="ShaderNodeBsdfPrincipled")

    set_socket(bsdf, ["Base Color"], base_color)
    set_socket(bsdf, ["Metallic"], metallic)
    set_socket(bsdf, ["Roughness"], roughness)

    if clearcoat > 0:
        set_socket(bsdf, ["Coat Weight", "Clearcoat"], clearcoat)
        set_socket(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.03)

    if transmission > 0:
        set_socket(bsdf, ["Transmission Weight", "Transmission"], transmission)
        set_socket(bsdf, ["IOR"], ior)
        mat.blend_method = 'BLEND'

    if alpha < 1.0:
        set_socket(bsdf, ["Alpha"], alpha)
        mat.blend_method = 'BLEND'

    if emission:
        set_socket(bsdf, ["Emission Color", "Emission"], emission)
        set_socket(bsdf, ["Emission Strength"], emission_strength)

    return mat

def create_mesh_obj(name, verts, faces, mat=None):
    me = bpy.data.meshes.new(name + "_Mesh")
    me.from_pydata(verts, [], faces)
    me.update()
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj

def make_box(name, center, size, mat=None):
    cx, cy, cz = center
    sx, sy, sz = size[0]/2, size[1]/2, size[2]/2
    verts = [
        (cx - sx, cy - sy, cz - sz),
        (cx + sx, cy - sy, cz - sz),
        (cx + sx, cy + sy, cz - sz),
        (cx - sx, cy + sy, cz - sz),
        (cx - sx, cy - sy, cz + sz),
        (cx + sx, cy - sy, cz + sz),
        (cx + sx, cy + sy, cz + sz),
        (cx - sx, cy + sy, cz + sz)
    ]
    faces = [
        (0, 1, 2, 3), (4, 5, 6, 7),
        (0, 1, 5, 4), (2, 3, 7, 6),
        (0, 3, 7, 4), (1, 2, 6, 5)
    ]
    return create_mesh_obj(name, verts, faces, mat)

def make_cylinder(name, center, radius, depth, segments=24, axis='Z', mat=None):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=segments,
        radius=radius,
        depth=depth,
        location=center
    )
    obj = bpy.context.active_object
    obj.name = name
    if axis == 'Y':
        obj.rotation_euler = Euler((math.radians(90), 0, 0), 'XYZ')
    elif axis == 'X':
        obj.rotation_euler = Euler((0, math.radians(90), 0), 'XYZ')
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    if mat:
        obj.data.materials.append(mat)
    return obj

def export_glb(filename):
    filepath = os.path.join(OUT_DIR, filename)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_yup=True
    )
    log(f"Exported: {filename} ({os.path.getsize(filepath)/1024:.1f} KB)")
    return filepath

# ==============================================================================
# 1. CHASSIS BUILDERS (Sedan, Coupe, SUV, Hatchback, Crossover)
# ==============================================================================
def build_chassis(category="sedan", length=4.75, width=1.86, wheelbase=2.85, height=0.35):
    reset_clean()
    log(f"Building {category.upper()} chassis...")

    mat_steel = make_pbr_mat("Mat_Chassis_Steel", (0.12, 0.13, 0.15, 1.0), metallic=0.85, roughness=0.35)
    mat_aluminum = make_pbr_mat("Mat_Chassis_Alu", (0.75, 0.76, 0.80, 1.0), metallic=0.95, roughness=0.25)
    mat_carbon = make_pbr_mat("Mat_Chassis_Carbon", (0.02, 0.02, 0.03, 1.0), metallic=0.3, roughness=0.4)

    # Main Longitudinal Frame Rails (Left & Right)
    rail_w, rail_h = 0.08, 0.10
    half_wb = wheelbase / 2
    rail_len = length * 0.82

    make_box("CHASSIS_RAIL_L", (-0.45, 0, 0.20), (rail_w, rail_len, rail_h), mat_steel)
    make_box("CHASSIS_RAIL_R", ( 0.45, 0, 0.20), (rail_w, rail_len, rail_h), mat_steel)

    # Crossmembers (Front, Center, Rear)
    make_box("CHASSIS_CROSSMEMBER_FRONT",  (0,  half_wb + 0.35, 0.20), (width * 0.75, 0.10, rail_h), mat_steel)
    make_box("CHASSIS_CROSSMEMBER_MID_1",  (0,  half_wb * 0.45, 0.18), (0.98, 0.08, 0.06), mat_steel)
    make_box("CHASSIS_CROSSMEMBER_MID_2",  (0, -half_wb * 0.45, 0.18), (0.98, 0.08, 0.06), mat_steel)
    make_box("CHASSIS_CROSSMEMBER_REAR",   (0, -half_wb - 0.35, 0.20), (width * 0.75, 0.10, rail_h), mat_steel)

    # Floor Structural Pan
    floor_mat = mat_carbon if category in ["coupe", "sedan"] else mat_aluminum
    make_box("CHASSIS_FLOOR_PAN", (0, 0, 0.15), (width * 0.78, wheelbase * 0.88, 0.025), floor_mat)

    # Front Subframe Engine Cradle
    make_box("SUBFRAME_FRONT_CRADLE", (0, half_wb, 0.16), (0.84, 0.65, 0.08), mat_aluminum)
    # Rear Subframe Differential Carrier
    make_box("SUBFRAME_REAR_CARRIER", (0, -half_wb, 0.16), (0.84, 0.65, 0.08), mat_aluminum)

    # Suspension Mounting Hardpoints (Front & Rear, Left & Right)
    for side, x in [("L", -0.58), ("R", 0.58)]:
        make_box(f"HARDPOINT_SUSP_FRONT_{side}", (x,  half_wb, 0.25), (0.12, 0.16, 0.14), mat_steel)
        make_box(f"HARDPOINT_SUSP_REAR_{side}",  (x, -half_wb, 0.25), (0.12, 0.16, 0.14), mat_steel)

    export_glb(f"chassis_{category}.glb")

# ==============================================================================
# 2. POWERTRAIN: ENGINE & GEARBOX
# ==============================================================================
def build_engine():
    reset_clean()
    log("Building V8 Twin-Turbo Engine...")

    mat_block = make_pbr_mat("Mat_Engine_Block", (0.15, 0.16, 0.18, 1.0), metallic=0.88, roughness=0.3)
    mat_intake = make_pbr_mat("Mat_Engine_Plenum", (0.02, 0.02, 0.02, 1.0), roughness=0.2, clearcoat=0.8) # Carbon
    mat_exhaust = make_pbr_mat("Mat_Engine_Exhaust", (0.85, 0.55, 0.35, 1.0), metallic=0.92, roughness=0.25) # Bronze Inconel
    mat_turbo = make_pbr_mat("Mat_Engine_Turbo", (0.65, 0.68, 0.72, 1.0), metallic=0.96, roughness=0.18)

    # Engine Block centered at Front Axle (Y = +1.425m in Sedan coordinates)
    cx, cy, cz = 0.0, 1.425, 0.45

    # V8 Engine Block (90-deg V)
    make_box("ENGINE_BLOCK", (cx, cy, cz), (0.46, 0.58, 0.38), mat_block)

    # Cylinder Heads (Left & Right)
    make_box("ENGINE_CYL_HEAD_L", (cx - 0.20, cy, cz + 0.18), (0.18, 0.55, 0.14), mat_block)
    make_box("ENGINE_CYL_HEAD_R", (cx + 0.20, cy, cz + 0.18), (0.18, 0.55, 0.14), mat_block)

    # Carbon Intake Plenum atop the V
    make_box("ENGINE_INTAKE_PLENUM", (cx, cy, cz + 0.29), (0.34, 0.48, 0.10), mat_intake)

    # Twin Turbochargers (Flanking the block)
    make_cylinder("TURBO_L", (cx - 0.32, cy - 0.08, cz + 0.08), radius=0.08, depth=0.10, axis='X', mat=mat_turbo)
    make_cylinder("TURBO_R", (cx + 0.32, cy - 0.08, cz + 0.08), radius=0.08, depth=0.10, axis='X', mat=mat_turbo)

    # Exhaust Manifold Runners
    make_box("EXHAUST_MANIFOLD_L", (cx - 0.26, cy, cz + 0.05), (0.08, 0.50, 0.12), mat_exhaust)
    make_box("EXHAUST_MANIFOLD_R", (cx + 0.26, cy, cz + 0.05), (0.08, 0.50, 0.12), mat_exhaust)

    export_glb("powertrain_engine.glb")

def build_gearbox():
    reset_clean()
    log("Building 7-Speed Dual-Clutch Gearbox...")

    mat_gearbox = make_pbr_mat("Mat_Gearbox_Alu", (0.55, 0.58, 0.62, 1.0), metallic=0.92, roughness=0.3)
    mat_shaft = make_pbr_mat("Mat_Driveshaft_Steel", (0.2, 0.22, 0.25, 1.0), metallic=0.95, roughness=0.2)

    # Positioned immediately behind engine (Y = +0.85m to +0.30m)
    cx, cy, cz = 0.0, 0.90, 0.38

    # Bellhousing
    make_cylinder("GEARBOX_BELLHOUSING", (cx, cy + 0.22, cz), radius=0.22, depth=0.16, axis='Y', mat=mat_gearbox)
    # Main Transmission Case
    make_box("GEARBOX_CASE", (cx, cy - 0.10, cz - 0.04), (0.28, 0.52, 0.26), mat_gearbox)
    # Output Differential Flanges
    make_cylinder("GEARBOX_FLANGE_L", (cx - 0.16, cy - 0.24, cz - 0.04), radius=0.06, depth=0.05, axis='X', mat=mat_shaft)
    make_cylinder("GEARBOX_FLANGE_R", (cx + 0.16, cy - 0.24, cz - 0.04), radius=0.06, depth=0.05, axis='X', mat=mat_shaft)
    # Longitudinal Driveshaft to rear axle
    make_cylinder("DRIVESHAFT_REAR", (cx, 0.0, cz - 0.05), radius=0.035, depth=1.35, axis='Y', mat=mat_shaft)

    export_glb("powertrain_gearbox.glb")

# ==============================================================================
# 3. SUSPENSION: FRONT & REAR DOUBLE WISHBONE
# ==============================================================================
def build_suspension_front():
    reset_clean()
    log("Building Front Suspension Assembly...")

    mat_arm = make_pbr_mat("Mat_Susp_Arm", (0.10, 0.12, 0.14, 1.0), metallic=0.88, roughness=0.35)
    mat_coilover = make_pbr_mat("Mat_Susp_Damper", (0.95, 0.85, 0.15, 1.0), metallic=0.95, roughness=0.15) # Gold Ohlins
    mat_spring = make_pbr_mat("Mat_Susp_Spring", (0.1, 0.55, 0.95, 1.0), roughness=0.25) # Blue Spring
    mat_swaybar = make_pbr_mat("Mat_Susp_Swaybar", (0.95, 0.2, 0.1, 1.0), roughness=0.3)

    fy = 1.425 # Front axle Y

    for side, x, sign in [("L", -0.65, -1), ("R", 0.65, 1)]:
        # Lower Control Arm (A-arm)
        make_box(f"SUSP_FRONT_LOWER_ARM_{side}", (x - sign * 0.12, fy, 0.22), (0.28, 0.32, 0.04), mat_arm)
        # Upper Control Arm
        make_box(f"SUSP_FRONT_UPPER_ARM_{side}", (x - sign * 0.10, fy, 0.42), (0.24, 0.28, 0.035), mat_arm)
        # Coilover Damper Body
        make_cylinder(f"SUSP_FRONT_COILOVER_{side}", (x - sign * 0.06, fy, 0.38), radius=0.032, depth=0.32, axis='Z', mat=mat_coilover)
        # Steering Tie Rod
        make_cylinder(f"SUSP_FRONT_TIEROD_{side}", (x - sign * 0.12, fy - 0.10, 0.28), radius=0.016, depth=0.26, axis='X', mat=mat_arm)

    # Anti-Roll Sway Bar
    make_cylinder("SUSP_FRONT_SWAYBAR", (0.0, fy + 0.16, 0.24), radius=0.020, depth=1.10, axis='X', mat=mat_swaybar)

    export_glb("suspension_front.glb")

def build_suspension_rear():
    reset_clean()
    log("Building Rear Suspension Assembly...")

    mat_arm = make_pbr_mat("Mat_Susp_Arm", (0.10, 0.12, 0.14, 1.0), metallic=0.88, roughness=0.35)
    mat_coilover = make_pbr_mat("Mat_Susp_Damper", (0.95, 0.85, 0.15, 1.0), metallic=0.95, roughness=0.15)
    mat_swaybar = make_pbr_mat("Mat_Susp_Swaybar", (0.95, 0.2, 0.1, 1.0), roughness=0.3)

    ry = -1.425 # Rear axle Y

    for side, x, sign in [("L", -0.65, -1), ("R", 0.65, 1)]:
        make_box(f"SUSP_REAR_LOWER_ARM_{side}", (x - sign * 0.12, ry, 0.22), (0.28, 0.32, 0.04), mat_arm)
        make_box(f"SUSP_REAR_UPPER_ARM_{side}", (x - sign * 0.10, ry, 0.42), (0.24, 0.28, 0.035), mat_arm)
        make_cylinder(f"SUSP_REAR_COILOVER_{side}", (x - sign * 0.06, ry, 0.38), radius=0.032, depth=0.32, axis='Z', mat=mat_coilover)

    make_cylinder("SUSP_REAR_SWAYBAR", (0.0, ry - 0.16, 0.24), radius=0.020, depth=1.10, axis='X', mat=mat_swaybar)

    export_glb("suspension_rear.glb")

# ==============================================================================
# 4. BRAKES & WHEELS
# ==============================================================================
def build_brakes():
    reset_clean()
    log("Building High-Performance Carbon Ceramic Brakes...")

    mat_rotor = make_pbr_mat("Mat_Brake_Rotor", (0.22, 0.23, 0.26, 1.0), metallic=0.75, roughness=0.25)
    mat_caliper = make_pbr_mat("Mat_Brake_Caliper", (0.95, 0.08, 0.08, 1.0), roughness=0.2, clearcoat=1.0) # Brembo Red

    positions = [
        ("FL", -0.78,  1.425),
        ("FR",  0.78,  1.425),
        ("RL", -0.78, -1.425),
        ("RR",  0.78, -1.425),
    ]

    for corner, x, y in positions:
        # Ventilated Carbon Rotor
        make_cylinder(f"BRAKE_ROTOR_{corner}", (x, y, 0.34), radius=0.185, depth=0.032, axis='X', mat=mat_rotor)
        # 6-Piston Monobloc Caliper
        cal_sign = -1 if x < 0 else 1
        make_box(f"BRAKE_CALIPER_{corner}", (x + cal_sign * 0.02, y + 0.08, 0.44), (0.08, 0.24, 0.12), mat_caliper)

    export_glb("brakes_assembly.glb")

def build_wheels():
    reset_clean()
    log("Building Forged Diamond-Cut Wheels & Tires...")

    mat_rim = make_pbr_mat("Mat_Wheel_Alloy", (0.85, 0.86, 0.88, 1.0), metallic=0.98, roughness=0.15, clearcoat=0.9)
    mat_tire = make_pbr_mat("Mat_Wheel_Tire", (0.025, 0.026, 0.028, 1.0), roughness=0.88)
    mat_cap = make_pbr_mat("Mat_Wheel_Centerlock", (0.05, 0.05, 0.06, 1.0), metallic=0.9, roughness=0.2)

    positions = [
        ("FL", -0.82,  1.425),
        ("FR",  0.82,  1.425),
        ("RL", -0.82, -1.425),
        ("RR",  0.82, -1.425),
    ]

    for corner, x, y in positions:
        # High-Performance Low-Profile Tire (20-inch, 265/35R20)
        make_cylinder(f"TIRE_{corner}", (x, y, 0.34), radius=0.34, depth=0.25, axis='X', mat=mat_tire)
        # Forged Alloy Rim Barrel & Spokes
        make_cylinder(f"RIM_{corner}", (x, y, 0.34), radius=0.27, depth=0.24, axis='X', mat=mat_rim)
        # Center Hub / Lug Nut
        cal_sign = -1 if x < 0 else 1
        make_cylinder(f"CAP_{corner}", (x + cal_sign * 0.12, y, 0.34), radius=0.045, depth=0.025, axis='X', mat=mat_cap)

    export_glb("wheels_assembly.glb")

# ==============================================================================
# 5. BODY FRAMEWORK (BODY-IN-WHITE)
# ==============================================================================
def build_body_framework():
    reset_clean()
    log("Building Structural Body-in-White (BIW)...")

    mat_biw = make_pbr_mat("Mat_Body_Framework", (0.65, 0.68, 0.72, 1.0), metallic=0.85, roughness=0.4)

    # A-Pillars (Left & Right)
    make_box("BIW_A_PILLAR_L", (-0.68, 0.65, 0.85), (0.06, 0.55, 0.45), mat_biw)
    make_box("BIW_A_PILLAR_R", ( 0.68, 0.65, 0.85), (0.06, 0.55, 0.45), mat_biw)

    # B-Pillars (Center Structural Safety Hoop)
    make_box("BIW_B_PILLAR_L", (-0.72, -0.15, 0.85), (0.08, 0.12, 0.75), mat_biw)
    make_box("BIW_B_PILLAR_R", ( 0.72, -0.15, 0.85), (0.08, 0.12, 0.75), mat_biw)

    # C-Pillars (Rear Quarter Framework)
    make_box("BIW_C_PILLAR_L", (-0.68, -0.95, 0.85), (0.06, 0.65, 0.45), mat_biw)
    make_box("BIW_C_PILLAR_R", ( 0.68, -0.95, 0.85), (0.06, 0.65, 0.45), mat_biw)

    # Roof Cantrails / Longitudinal Roof Beams
    make_box("BIW_ROOF_RAIL_L", (-0.58, -0.15, 1.25), (0.06, 1.85, 0.05), mat_biw)
    make_box("BIW_ROOF_RAIL_R", ( 0.58, -0.15, 1.25), (0.06, 1.85, 0.05), mat_biw)

    # Windshield Cowl & Header Crossbeams
    make_box("BIW_WINDSHIELD_COWL",   (0.0,  0.88, 0.68), (1.35, 0.12, 0.06), mat_biw)
    make_box("BIW_WINDSHIELD_HEADER", (0.0,  0.42, 1.25), (1.16, 0.08, 0.05), mat_biw)
    make_box("BIW_REAR_HEADER",       (0.0, -0.72, 1.25), (1.16, 0.08, 0.05), mat_biw)

    # Crash Impact Beams (Front & Rear)
    make_box("BIW_FRONT_CRASH_BEAM", (0.0,  2.25, 0.35), (1.42, 0.12, 0.10), mat_biw)
    make_box("BIW_REAR_CRASH_BEAM",  (0.0, -2.25, 0.35), (1.42, 0.12, 0.10), mat_biw)

    export_glb("body_framework_biw.glb")

# ==============================================================================
# 6. EXTERIOR BODY PANELS
# ==============================================================================
def build_exterior_panels():
    reset_clean()
    log("Building Sculpted Exterior Body Panels...")

    mat_paint = make_pbr_mat("Mat_Exterior_Paint", (0.02, 0.08, 0.28, 1.0), metallic=0.92, roughness=0.18, clearcoat=1.0) # Deep Sapphire Blue
    mat_trim  = make_pbr_mat("Mat_Exterior_Trim", (0.015, 0.016, 0.018, 1.0), roughness=0.6)

    # Front Hood
    make_box("BODY_HOOD", (0.0, 1.45, 0.72), (1.38, 1.20, 0.04), mat_paint)

    # Front Fenders (Left & Right)
    make_box("BODY_FENDER_FL", (-0.78, 1.45, 0.62), (0.08, 1.20, 0.42), mat_paint)
    make_box("BODY_FENDER_FR", ( 0.78, 1.45, 0.62), (0.08, 1.20, 0.42), mat_paint)

    # Doors (Front & Rear, Left & Right)
    make_box("BODY_DOOR_FL", (-0.80,  0.35, 0.62), (0.07, 0.95, 0.58), mat_paint)
    make_box("BODY_DOOR_FR", ( 0.80,  0.35, 0.62), (0.07, 0.95, 0.58), mat_paint)
    make_box("BODY_DOOR_RL", (-0.80, -0.55, 0.62), (0.07, 0.85, 0.58), mat_paint)
    make_box("BODY_DOOR_RR", ( 0.80, -0.55, 0.62), (0.07, 0.85, 0.58), mat_paint)

    # Rear Quarter Panels
    make_box("BODY_QUARTER_RL", (-0.78, -1.45, 0.68), (0.08, 1.15, 0.52), mat_paint)
    make_box("BODY_QUARTER_RR", ( 0.78, -1.45, 0.68), (0.08, 1.15, 0.52), mat_paint)

    # Trunk Decklid
    make_box("BODY_TRUNK_LID", (0.0, -1.82, 0.82), (1.25, 0.65, 0.04), mat_paint)

    # Roof Outer Skin
    make_box("BODY_ROOF_SKIN", (0.0, -0.15, 1.28), (1.18, 1.65, 0.03), mat_paint)

    # Front Bumper Cover & Grille
    make_box("BODY_BUMPER_FRONT", (0.0, 2.28, 0.48), (1.75, 0.35, 0.48), mat_paint)
    make_box("BODY_GRILLE_MESH",  (0.0, 2.32, 0.45), (0.85, 0.05, 0.28), mat_trim)

    # Rear Bumper Cover
    make_box("BODY_BUMPER_REAR", (0.0, -2.28, 0.48), (1.75, 0.35, 0.48), mat_paint)

    export_glb("exterior_panels.glb")

# ==============================================================================
# 7. LIGHTING & GLASS
# ==============================================================================
def build_lighting_glass():
    reset_clean()
    log("Building Lighting & Glass Assemblies...")

    mat_glass = make_pbr_mat("Mat_Acoustic_Glass", (0.05, 0.08, 0.12, 0.2), roughness=0.02, transmission=0.95, ior=1.52, alpha=0.25)
    mat_led_white = make_pbr_mat("Mat_LED_Headlight", (1.0, 1.0, 1.0, 1.0), emission=(1.0, 1.0, 1.0, 1.0), emission_strength=18.0)
    mat_led_red   = make_pbr_mat("Mat_LED_Taillight", (1.0, 0.05, 0.05, 1.0), emission=(1.0, 0.05, 0.05, 1.0), emission_strength=14.0)

    # Raked Front Windshield
    make_box("GLASS_WINDSHIELD", (0.0, 0.65, 0.98), (1.28, 0.65, 0.015), mat_glass)
    # Rear Backlight Glass
    make_box("GLASS_REAR_WINDOW", (0.0, -1.15, 1.05), (1.24, 0.65, 0.015), mat_glass)
    # Side Windows (Left & Right)
    make_box("GLASS_SIDE_FL", (-0.72,  0.35, 0.96), (0.012, 0.90, 0.35), mat_glass)
    make_box("GLASS_SIDE_FR", ( 0.72,  0.35, 0.96), (0.012, 0.90, 0.35), mat_glass)
    make_box("GLASS_SIDE_RL", (-0.72, -0.55, 0.96), (0.012, 0.82, 0.35), mat_glass)
    make_box("GLASS_SIDE_RR", ( 0.72, -0.55, 0.96), (0.012, 0.82, 0.35), mat_glass)

    # Matrix LED Headlights (Left & Right)
    make_box("LIGHT_HEADLIGHT_L", (-0.68, 2.22, 0.65), (0.28, 0.18, 0.12), mat_led_white)
    make_box("LIGHT_HEADLIGHT_R", ( 0.68, 2.22, 0.65), (0.28, 0.18, 0.12), mat_led_white)

    # Full-Width OLED Taillight Lightbar
    make_box("LIGHT_TAILLIGHT_BAR", (0.0, -2.25, 0.78), (1.52, 0.08, 0.08), mat_led_red)

    export_glb("lighting_glass.glb")

# ==============================================================================
# 8. AERODYNAMICS
# ==============================================================================
def build_aerodynamics():
    reset_clean()
    log("Building Aerodynamic Downforce Package...")

    mat_carbon = make_pbr_mat("Mat_Aero_Carbon", (0.02, 0.025, 0.03, 1.0), metallic=0.3, roughness=0.35, clearcoat=0.9)

    # Front Track Splitter with Endplate Canards
    make_box("AERO_FRONT_SPLITTER", (0.0, 2.38, 0.22), (1.82, 0.32, 0.025), mat_carbon)
    make_box("AERO_CANARD_L", (-0.88, 2.26, 0.35), (0.12, 0.22, 0.02), mat_carbon)
    make_box("AERO_CANARD_R", ( 0.88, 2.26, 0.35), (0.12, 0.22, 0.02), mat_carbon)

    # Extended Side Skirts (Ground Effect)
    make_box("AERO_SIDE_SKIRT_L", (-0.88, -0.10, 0.18), (0.14, 2.45, 0.03), mat_carbon)
    make_box("AERO_SIDE_SKIRT_R", ( 0.88, -0.10, 0.18), (0.14, 2.45, 0.03), mat_carbon)

    # Rear Venturi Diffuser with Strakes
    make_box("AERO_REAR_DIFFUSER", (0.0, -2.35, 0.24), (1.55, 0.45, 0.03), mat_carbon)
    for sx in [-0.45, -0.15, 0.15, 0.45]:
        make_box(f"AERO_DIFFUSER_STRAKE_{sx}", (sx, -2.35, 0.21), (0.02, 0.42, 0.08), mat_carbon)

    # Carbon Fiber Rear Wing on Swan-Neck Mounts
    make_box("AERO_REAR_WING_AIRFOIL", (0.0, -2.15, 1.18), (1.68, 0.28, 0.03), mat_carbon)
    make_box("AERO_WING_PYLON_L", (-0.42, -2.08, 0.98), (0.03, 0.16, 0.38), mat_carbon)
    make_box("AERO_WING_PYLON_R", ( 0.42, -2.08, 0.98), (0.03, 0.16, 0.38), mat_carbon)

    export_glb("aerodynamics.glb")

# ==============================================================================
# 9. INTERIOR & COCKPIT
# ==============================================================================
def build_interior():
    reset_clean()
    log("Building Luxury Sports Cockpit Interior...")

    mat_leather = make_pbr_mat("Mat_Interior_Leather", (0.08, 0.08, 0.09, 1.0), roughness=0.55)
    mat_cognac  = make_pbr_mat("Mat_Interior_Cognac",  (0.24, 0.13, 0.06, 1.0), roughness=0.50)
    mat_screen  = make_pbr_mat("Mat_Interior_Screen",  (0.01, 0.01, 0.02, 1.0), roughness=0.1, clearcoat=1.0)

    # Sculpted Dashboard Pad
    make_box("INT_DASHBOARD_MAIN", (0.0, 0.45, 0.72), (1.45, 0.45, 0.24), mat_leather)
    # Center Infotainment Touchscreen
    make_box("INT_INFOTAINMENT_SCREEN", (0.0, 0.38, 0.76), (0.34, 0.02, 0.18), mat_screen)
    # Driver Instrument Cluster
    make_box("INT_CLUSTER_HOOD", (-0.38, 0.42, 0.82), (0.32, 0.18, 0.14), mat_leather)

    # Center Transmission Tunnel & Console
    make_box("INT_CENTER_CONSOLE", (0.0, -0.25, 0.48), (0.32, 0.95, 0.28), mat_cognac)
    make_box("INT_ARMREST",        (0.0, -0.45, 0.58), (0.28, 0.45, 0.08), mat_leather)

    # Driver & Passenger Sports Bucket Seats
    for side, x in [("DRIVER", -0.38), ("PASSENGER", 0.38)]:
        make_box(f"INT_SEAT_BASE_{side}", (x, -0.15, 0.38), (0.52, 0.55, 0.18), mat_leather)
        make_box(f"INT_SEAT_BACK_{side}", (x, -0.42, 0.72), (0.48, 0.16, 0.65), mat_cognac)

    # Steering Wheel Hub & Rim
    make_cylinder("INT_STEERING_WHEEL", (-0.38, 0.22, 0.74), radius=0.18, depth=0.04, axis='Y', mat=mat_leather)

    export_glb("interior_cockpit.glb")

def main():
    log("Starting True Modular Parts Generation...")

    # 1. Five Categories of Chassis
    build_chassis("sedan",     length=4.85, width=1.88, wheelbase=2.88, height=0.35)
    build_chassis("coupe",     length=4.65, width=1.92, wheelbase=2.72, height=0.32)
    build_chassis("suv",       length=5.05, width=2.02, wheelbase=3.05, height=0.48)
    build_chassis("hatchback", length=4.28, width=1.82, wheelbase=2.58, height=0.36)
    build_chassis("crossover", length=4.62, width=1.89, wheelbase=2.78, height=0.42)

    # 2. Powertrain
    build_engine()
    build_gearbox()

    # 3. Suspension
    build_suspension_front()
    build_suspension_rear()

    # 4. Brakes & Wheels
    build_brakes()
    build_wheels()

    # 5. Body Framework (BIW)
    build_body_framework()

    # 6. Exterior Panels
    build_exterior_panels()

    # 7. Lighting & Glass
    build_lighting_glass()

    # 8. Aerodynamics
    build_aerodynamics()

    # 9. Interior
    build_interior()

    log("[SUCCESS] All true modular parts exported to public/models/modular_parts/!")

if __name__ == "__main__":
    main()
