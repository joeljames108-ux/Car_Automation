"""
=============================================================================
Procedural Class-A CAD Generator: Range Rover Classic 3-Door (1970s)
PHASE 67: Boxed Ladder Chassis, 3.5L Rover V8, Permanent 4WD, Coil Live Axles,
16" Rostyle Wheels, Connolly Luxury Cabin & Underbody Protection
=============================================================================
SUV Architecture — 1970s British Luxury Off-Road Engineering
Phase 67 builds the authentic heavy-duty mechanical rolling chassis, powertrain,
suspension, wheels, underbody armor, and complete luxury passenger compartment:
1. Boxed steel ladder frame chassis (2,540mm / 100-inch wheelbase) with 8 body outriggers
2. 3.5L (3,528cc) all-aluminum Rover V8 engine with dual SU HIF6 carburettors
3. LT95 4-speed manual gearbox with permanent 4WD transfer box and center diff lock
4. Long-travel front live axle with radius arms, Panhard rod, and coil springs
5. Rear live axle with trailing links, central A-frame, and Boge Hydromat self-leveling unit
6. 16-inch Rostyle styled steel wheels with 205/80 R16 deep-lug all-terrain tires
7. 1970s 3-Door luxury interior: Connolly Palomino leather seats, Smiths instrument binnacle,
   thin-rim 2-spoke steering wheel, floor transfer levers, rear cargo deck & upright spare
8. Stamped steel steering skid plate, transfer case cradle, 80L rear fuel tank & dual exhaust
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion


# ============================================================================
# 1. CORE COMPATIBILITY WRAPPERS & GEOMETRIC UTILITIES
# ============================================================================

def _compat_create_cylinder(bm, radius=1.0, depth=2.0, segments=16, cap_ends=True, cap_tris=False, matrix=None, **kwargs):
    """Blender 5.x compatibility wrapper for bmesh cylinder creation using create_cone."""
    r1 = kwargs.pop('radius1', radius)
    r2 = kwargs.pop('radius2', radius)
    kwargs.pop('round_cap', None)
    if matrix is None:
        matrix = Matrix()
    return bmesh.ops.create_cone(
        bm,
        cap_ends=cap_ends,
        cap_tris=cap_tris,
        segments=segments,
        radius1=r1,
        radius2=r2,
        depth=depth,
        matrix=matrix,
        **kwargs
    )

if not hasattr(bmesh.ops, 'create_cylinder'):
    bmesh.ops.create_cylinder = _compat_create_cylinder


def _compat_create_uvsphere(bm, u_segments=16, v_segments=8, radius=1.0, matrix=None, **kwargs):
    """Blender 5.x compatibility wrapper for bmesh UV sphere creation."""
    if matrix is None:
        matrix = Matrix()
    return bmesh.ops.create_uvsphere(
        bm,
        u_segments=u_segments,
        v_segments=v_segments,
        radius=radius,
        matrix=matrix,
        **kwargs
    )

if not hasattr(bmesh.ops, 'create_uvsphere'):
    bmesh.ops.create_uvsphere = _compat_create_uvsphere


def _compat_create_cube(bm, size=1.0, matrix=None, **kwargs):
    """Compatibility wrapper for bmesh cube creation across Blender versions."""
    if matrix is None:
        matrix = Matrix()
    try:
        bmesh.ops.create_cube(bm, size=size, matrix=matrix, **kwargs)
    except TypeError:
        bmesh.ops.create_cube(bm, size=size, matrix=matrix)


def add_annular_tube(bm, r_inner, r_outer, depth, segments=36, matrix=None, create_sidewalls=True):
    """Generates an annular cylindrical tube/ring with quad walls and smooth sidewalls."""
    if matrix is None:
        matrix = Matrix()
    d2 = depth * 0.5
    for i in range(segments):
        a0 = i * (2.0 * math.pi / segments)
        a1 = (i + 1) * (2.0 * math.pi / segments)
        c0, s0 = math.cos(a0), math.sin(a0)
        c1, s1 = math.cos(a1), math.sin(a1)
        v_out_0_top = bm.verts.new(matrix @ Vector((c0 * r_outer, s0 * r_outer, d2)))
        v_out_1_top = bm.verts.new(matrix @ Vector((c1 * r_outer, s1 * r_outer, d2)))
        v_out_1_bot = bm.verts.new(matrix @ Vector((c1 * r_outer, s1 * r_outer, -d2)))
        v_out_0_bot = bm.verts.new(matrix @ Vector((c0 * r_outer, s0 * r_outer, -d2)))
        bm.faces.new([v_out_0_top, v_out_1_top, v_out_1_bot, v_out_0_bot])
        if r_inner > 0:
            v_in_0_top = bm.verts.new(matrix @ Vector((c0 * r_inner, s0 * r_inner, d2)))
            v_in_1_top = bm.verts.new(matrix @ Vector((c1 * r_inner, s1 * r_inner, d2)))
            v_in_1_bot = bm.verts.new(matrix @ Vector((c1 * r_inner, s1 * r_inner, -d2)))
            v_in_0_bot = bm.verts.new(matrix @ Vector((c0 * r_inner, s0 * r_inner, -d2)))
            bm.faces.new([v_in_0_bot, v_in_1_bot, v_in_1_top, v_in_0_top])
            if create_sidewalls:
                bm.faces.new([v_in_0_top, v_in_1_top, v_out_1_top, v_out_0_top])
                bm.faces.new([v_out_0_bot, v_out_1_bot, v_in_1_bot, v_in_0_bot])


def apply_smooth_and_modifiers(obj, angle_deg=35.0, bevel_width=0.003, segments=2):
    """Applies smooth shading and non-destructive modifiers for Class-A CAD mesh quality."""
    if obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True
        if hasattr(obj.data, 'use_auto_smooth'):
            obj.data.use_auto_smooth = True
            obj.data.auto_smooth_angle = math.radians(angle_deg)
        if bevel_width > 0:
            mod_bev = obj.modifiers.new(name="Bevel", type='BEVEL')
            mod_bev.width = bevel_width
            mod_bev.segments = segments
            mod_bev.limit_method = 'ANGLE'
            mod_bev.angle_limit = math.radians(angle_deg)
        mod_wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        mod_wn.keep_sharp = True


def bmesh_to_object(bm, name, collection=None):
    """Converts a bmesh to a Blender object, links it to collection, and frees memory."""
    mesh = bpy.data.meshes.new(name + "_mesh")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    if collection is None:
        collection = bpy.context.scene.collection
    collection.objects.link(obj)
    return obj


# ============================================================================
# 2. PRINCIPLED BSDF PBR MATERIAL FACTORY
# ============================================================================

def create_principled_material(name, base_color, metallic=0.0, roughness=0.5,
                               specular=0.5, clearcoat=0.0, clearcoat_roughness=0.03,
                               transmission=0.0, ior=1.45, emission_color=(0, 0, 0, 1),
                               emission_strength=0.0):
    """Universal Principled BSDF PBR material factory with Blender 4.x/5.x compatibility."""
    mat = bpy.data.materials.get(name)
    if mat is not None:
        return mat
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf is None:
        bsdf = nodes.new("ShaderNodeBsdfPrincipled")

    def set_inp(inp_name, val):
        if inp_name in bsdf.inputs:
            bsdf.inputs[inp_name].default_value = val

    set_inp("Base Color", base_color)
    set_inp("Metallic", metallic)
    set_inp("Roughness", roughness)
    set_inp("Specular IOR Level", specular)
    set_inp("Specular", specular)
    set_inp("Coat Weight", clearcoat)
    set_inp("Clearcoat", clearcoat)
    set_inp("Coat Roughness", clearcoat_roughness)
    set_inp("Clearcoat Roughness", clearcoat_roughness)
    set_inp("Transmission Weight", transmission)
    set_inp("Transmission", transmission)
    set_inp("IOR", ior)
    set_inp("Emission Color", emission_color)
    set_inp("Emission Strength", emission_strength)

    return mat


def build_range_rover_classic_materials():
    """Builds the comprehensive 1970s British luxury off-road material library."""
    mats = {}
    # Chassis & Frame (Semi-gloss black anti-corrosion chassis enamel)
    mats["chassis_steel"] = create_principled_material(
        "MAT_RRC_Chassis_Steel", (0.04, 0.04, 0.045, 1.0), metallic=0.5, roughness=0.38
    )
    # Rover 3.5L V8 Cast Aluminum Engine Block & Heads
    mats["engine_alloy"] = create_principled_material(
        "MAT_RRC_Engine_Alloy", (0.58, 0.60, 0.62, 1.0), metallic=0.75, roughness=0.42
    )
    # Ribbed Valve Covers (Black wrinkle finish with milled aluminum highlights)
    mats["valve_cover"] = create_principled_material(
        "MAT_RRC_Valve_Cover", (0.05, 0.05, 0.05, 1.0), metallic=0.2, roughness=0.70
    )
    # Bright Chrome (SU Carburettor bell chambers, air filters, bumper caps)
    mats["chrome"] = create_principled_material(
        "MAT_RRC_Chrome", (0.95, 0.95, 0.95, 1.0), metallic=0.98, roughness=0.08
    )
    # Cast Iron Exhaust Manifolds
    mats["cast_iron"] = create_principled_material(
        "MAT_RRC_Cast_Iron", (0.16, 0.15, 0.14, 1.0), metallic=0.6, roughness=0.68
    )
    # Exhaust Pipes (Galvanized / mild steel)
    mats["exhaust_steel"] = create_principled_material(
        "MAT_RRC_Exhaust_Steel", (0.48, 0.49, 0.50, 1.0), metallic=0.7, roughness=0.35
    )
    # Driveline Axle Casings (Semi-gloss black Salisbury cast iron)
    mats["axle_black"] = create_principled_material(
        "MAT_RRC_Axle_Black", (0.05, 0.05, 0.06, 1.0), metallic=0.4, roughness=0.45
    )
    # Propshafts & Slip Yokes (Machined steel)
    mats["propshaft_steel"] = create_principled_material(
        "MAT_RRC_Propshaft_Steel", (0.65, 0.66, 0.68, 1.0), metallic=0.85, roughness=0.28
    )
    # Coil Springs (Gloss black enamel spring steel)
    mats["spring_steel"] = create_principled_material(
        "MAT_RRC_Spring_Steel", (0.02, 0.02, 0.02, 1.0), metallic=0.6, roughness=0.22
    )
    # Suspension Dampers (Classic Armstrong dark blue)
    mats["damper_blue"] = create_principled_material(
        "MAT_RRC_Damper_Blue", (0.03, 0.12, 0.32, 1.0), metallic=0.3, roughness=0.32
    )
    # Suspension Rubber Bushings & Boots
    mats["rubber"] = create_principled_material(
        "MAT_RRC_Rubber", (0.03, 0.03, 0.03, 1.0), metallic=0.05, roughness=0.75
    )
    # Rostyle Wheels (Silver painted outer rim & center spokes)
    mats["rostyle_silver"] = create_principled_material(
        "MAT_RRC_Rostyle_Silver", (0.80, 0.82, 0.84, 1.0), metallic=0.85, roughness=0.25
    )
    # Rostyle Wheels (Satin black recessed spoke details)
    mats["rostyle_black"] = create_principled_material(
        "MAT_RRC_Rostyle_Black", (0.02, 0.02, 0.02, 1.0), metallic=0.15, roughness=0.55
    )
    # Tires (Michelin XM+S All-Terrain deep tread rubber)
    mats["tire_tread"] = create_principled_material(
        "MAT_RRC_Tire_Tread", (0.04, 0.04, 0.04, 1.0), metallic=0.02, roughness=0.82
    )
    # Brake Discs (Machined cast iron rotors)
    mats["brake_disc"] = create_principled_material(
        "MAT_RRC_Brake_Disc", (0.72, 0.72, 0.74, 1.0), metallic=0.9, roughness=0.22
    )
    # Brake Calipers (Girling gold cadmium plating)
    mats["caliper_gold"] = create_principled_material(
        "MAT_RRC_Caliper_Gold", (0.68, 0.55, 0.22, 1.0), metallic=0.75, roughness=0.40
    )
    # Brake Drums (Rear cast iron drums)
    mats["brake_drum"] = create_principled_material(
        "MAT_RRC_Brake_Drum", (0.18, 0.18, 0.20, 1.0), metallic=0.65, roughness=0.60
    )
    # Interior Connolly Leather (Palomino Tan)
    mats["leather_palomino"] = create_principled_material(
        "MAT_RRC_Leather_Palomino", (0.64, 0.42, 0.22, 1.0), metallic=0.05, roughness=0.58
    )
    # Interior Carpet (Nutmeg brown wool loop-pile)
    mats["carpet_brown"] = create_principled_material(
        "MAT_RRC_Carpet_Brown", (0.28, 0.18, 0.10, 1.0), metallic=0.02, roughness=0.92
    )
    # Dashboard & Steering Wheel (Matte black thermoformed vinyl/Bakelite)
    mats["dash_black"] = create_principled_material(
        "MAT_RRC_Dash_Black", (0.05, 0.05, 0.05, 1.0), metallic=0.08, roughness=0.62
    )
    # Gauge Glass (Smiths instruments)
    mats["gauge_glass"] = create_principled_material(
        "MAT_RRC_Gauge_Glass", (0.95, 0.98, 1.0, 1.0), roughness=0.05, transmission=0.92, ior=1.52
    )
    # Gauge Face (Black dial with luminescent markers)
    mats["gauge_face"] = create_principled_material(
        "MAT_RRC_Gauge_Face", (0.02, 0.02, 0.02, 1.0), roughness=0.45
    )
    # Skid Plates & Underbody Shielding (Galvanized 5mm stamped steel)
    mats["skid_plate"] = create_principled_material(
        "MAT_RRC_Skid_Plate", (0.42, 0.44, 0.45, 1.0), metallic=0.8, roughness=0.45
    )
    # Fuel Tank (Galvanized stamped steel)
    mats["fuel_tank"] = create_principled_material(
        "MAT_RRC_Fuel_Tank", (0.35, 0.36, 0.38, 1.0), metallic=0.7, roughness=0.50
    )
    return mats

# ============================================================================
# 3. CHASSIS SUBSYSTEM: HEAVY-DUTY BOXED STEEL LADDER FRAME (2,540mm WHEELBASE)
# ============================================================================

def build_range_rover_classic_chassis(mats):
    """
    Builds the authentic 100-inch (2,540mm) boxed steel ladder chassis:
    - Twin heavy-duty longitudinal side members (120mm x 60mm x 3.2mm boxed section)
    - Front tubular crossmember with bumper mounting plates & recovery eyes
    - Radiator support cradle crossmember
    - Engine/gearbox support crossmember with vulcanized rubber mounts
    - Central transfer case protective bridge crossmember
    - Arched tubular rear axle clearance crossmember
    - Rear fuel tank protection crossmember & massive rear towing crossmember
    - 8 forged outriggers with reinforced body mounting pads
    """
    chassis_objs = []

    # Wheelbase & Hardpoints: Front axle at Y = +1.270m, Rear axle at Y = -1.270m
    rail_half_width = 0.410 # 820mm between outer rail faces
    rail_len = 4.300
    rail_height = 0.120
    rail_width = 0.065
    ground_z = 0.320 # Chassis rail center height above ground

    # Left & Right Longitudinal Boxed Rails
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm = bmesh.new()
        # Create contoured longitudinal rail with front and rear kick-ups for axle travel
        # 7 segments along the length
        x = sign * rail_half_width
        points = [
            (x,  2.05, ground_z + 0.04), # Front bumper horn
            (x,  1.45, ground_z + 0.06), # Front axle kick-up peak
            (x,  1.10, ground_z + 0.00), # Engine cradle dip
            (x,  0.00, ground_z - 0.02), # Central cabin low center of gravity
            (x, -0.90, ground_z + 0.00), # Pre-rear axle rise
            (x, -1.35, ground_z + 0.08), # Rear axle high clearance arch
            (x, -2.15, ground_z + 0.02), # Rear overhang & tow hitch
        ]
        
        # Build continuous 3D box tube extrusion
        prev_verts = None
        for pt in points:
            px, py, pz = pt
            v0 = bm.verts.new(Vector((px - sign * rail_width * 0.5, py, pz + rail_height * 0.5)))
            v1 = bm.verts.new(Vector((px + sign * rail_width * 0.5, py, pz + rail_height * 0.5)))
            v2 = bm.verts.new(Vector((px + sign * rail_width * 0.5, py, pz - rail_height * 0.5)))
            v3 = bm.verts.new(Vector((px - sign * rail_width * 0.5, py, pz - rail_height * 0.5)))
            curr_verts = [v0, v1, v2, v3]
            
            if prev_verts is not None:
                # 4 quad side faces
                bm.faces.new([prev_verts[0], curr_verts[0], curr_verts[1], prev_verts[1]])
                bm.faces.new([prev_verts[1], curr_verts[1], curr_verts[2], prev_verts[2]])
                bm.faces.new([prev_verts[2], curr_verts[2], curr_verts[3], prev_verts[3]])
                bm.faces.new([prev_verts[3], curr_verts[3], curr_verts[0], prev_verts[0]])
            else:
                # Cap front
                bm.faces.new([curr_verts[0], curr_verts[1], curr_verts[2], curr_verts[3]])
            prev_verts = curr_verts
        # Cap rear
        bm.faces.new([prev_verts[3], prev_verts[2], prev_verts[1], prev_verts[0]])

        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        obj = bmesh_to_object(bm, f"CHASSIS_RRC_Frame_Rail_{side}")
        obj.data.materials.append(mats["chassis_steel"])
        apply_smooth_and_modifiers(obj, angle_deg=35.0, bevel_width=0.003)
        chassis_objs.append(obj)

    # Crossmembers (Tubular and Boxed Sections)
    crossmembers = [
        # Name, Y, Z, Diameter/Width, Height, Type
        ("Front_Bumper_Horn", 2.05, ground_z + 0.04, 0.080, 0.090, "box"),
        ("Front_Tubular_Radiator", 1.55, ground_z + 0.05, 0.070, 0.070, "tube"),
        ("Engine_Transmission_Cradle", 0.70, ground_z - 0.01, 0.085, 0.065, "box"),
        ("Transfer_Case_Crossmember", 0.05, ground_z - 0.03, 0.090, 0.060, "box"),
        ("Rear_Axle_Arch_Tubular", -1.25, ground_z + 0.09, 0.075, 0.075, "tube"),
        ("Rear_Fuel_Tank_Shield", -1.75, ground_z + 0.03, 0.070, 0.070, "box"),
        ("Rear_Towing_Pintle_Beam", -2.15, ground_z + 0.02, 0.095, 0.110, "box"),
    ]

    for cname, cy, cz, cw, ch, ctype in crossmembers:
        bm = bmesh.new()
        length = rail_half_width * 2.0 - rail_width
        if ctype == "tube":
            # Round seamless tubular steel crossmember
            mat = Matrix.Translation(Vector((0, cy, cz))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
            _compat_create_cylinder(bm, radius=cw * 0.5, depth=length, segments=20, matrix=mat)
        else:
            # Boxed rectangular steel crossmember
            mat = Matrix.Translation(Vector((0, cy, cz)))
            _compat_create_cube(bm, size=1.0, matrix=mat @ Matrix.Diagonal(Vector((length, cw, ch, 1.0))))
        
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        obj = bmesh_to_object(bm, f"CHASSIS_RRC_Crossmember_{cname}")
        obj.data.materials.append(mats["chassis_steel"])
        apply_smooth_and_modifiers(obj, angle_deg=35.0, bevel_width=0.002)
        chassis_objs.append(obj)

    # 8 Body Outriggers & Mount Bushings (4 per side)
    outrigger_y_coords = [1.35, 0.45, -0.45, -1.55]
    for idx, oy in enumerate(outrigger_y_coords):
        for side, sign in [("L", 1.0), ("R", -1.0)]:
            bm = bmesh.new()
            ox_start = sign * (rail_half_width + rail_width * 0.5)
            ox_end = sign * (rail_half_width + 0.220)
            oz = ground_z + 0.01
            
            # Tapered stamped steel outrigger bracket
            v0 = bm.verts.new(Vector((ox_start, oy - 0.060, oz - 0.040)))
            v1 = bm.verts.new(Vector((ox_end,   oy - 0.040, oz + 0.020)))
            v2 = bm.verts.new(Vector((ox_end,   oy + 0.040, oz + 0.020)))
            v3 = bm.verts.new(Vector((ox_start, oy + 0.060, oz - 0.040)))
            v4 = bm.verts.new(Vector((ox_start, oy - 0.060, oz + 0.040)))
            v5 = bm.verts.new(Vector((ox_end,   oy - 0.040, oz + 0.050)))
            v6 = bm.verts.new(Vector((ox_end,   oy + 0.040, oz + 0.050)))
            v7 = bm.verts.new(Vector((ox_start, oy + 0.060, oz + 0.040)))

            bm.faces.new([v0, v1, v2, v3]) # Bottom
            bm.faces.new([v4, v7, v6, v5]) # Top
            bm.faces.new([v0, v4, v5, v1]) # Front
            bm.faces.new([v2, v6, v7, v3]) # Rear
            bm.faces.new([v1, v5, v6, v2]) # Outer tip pad
            
            # Vulcanized rubber body mounting puck on pad
            puck_mat = Matrix.Translation(Vector((ox_end, oy, oz + 0.060)))
            _compat_create_cylinder(bm, radius=0.035, depth=0.025, segments=16, matrix=puck_mat)

            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            obj = bmesh_to_object(bm, f"CHASSIS_RRC_Outrigger_{idx+1}_{side}")
            obj.data.materials.append(mats["chassis_steel"])
            apply_smooth_and_modifiers(obj, angle_deg=35.0, bevel_width=0.002)
            chassis_objs.append(obj)

    # Heavy Front Recovery Tow Eyes (L and R on front chassis horns)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm = bmesh.new()
        eyex = sign * (rail_half_width - 0.020)
        eyemat = Matrix.Translation(Vector((eyex, 2.08, ground_z - 0.02)))
        add_annular_tube(bm, r_inner=0.022, r_outer=0.040, depth=0.016, segments=24, matrix=eyemat)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        obj = bmesh_to_object(bm, f"CHASSIS_RRC_Tow_Eye_{side}")
        obj.data.materials.append(mats["chassis_steel"])
        apply_smooth_and_modifiers(obj, angle_deg=35.0)
        chassis_objs.append(obj)

    return chassis_objs

# ============================================================================
# 4. POWERTRAIN: 3.5L ROVER V8, DUAL SU CARBS & PERMANENT 4WD LT95 DRIVETRAIN
# ============================================================================

def build_range_rover_classic_powertrain(mats):
    """
    Builds the iconic all-aluminum 3.5L Rover V8 OHV engine and permanent 4WD driveline:
    - Cast aluminum 90-degree V8 block with deep crankcase skirt (Y = +0.75m to +1.35m)
    - Aluminum cylinder heads (left & right banks) with rocker covers
    - Dual SU HIF6 side-draught carburettors with brass dampers & twin chrome pancake filters
    - Front accessory drive: cast water pump, 7-blade nylon radiator fan, alternator, pulleys & V-belts
    - Cast iron exhaust manifolds (4-into-2 per bank)
    - LT95 4-speed integrated manual gearbox & 2-speed transfer case
    - Front & rear driveshafts with needle-bearing universal joints & sliding splines
    """
    powertrain_objs = []
    engine_center_y = 1.050
    engine_center_z = 0.460

    # 1. 3.5L V8 Cylinder Block & Sump
    bm = bmesh.new()
    # Main block crankcase
    block_mat = Matrix.Translation(Vector((0.0, engine_center_y, engine_center_z)))
    _compat_create_cube(bm, size=1.0, matrix=block_mat @ Matrix.Diagonal(Vector((0.440, 0.560, 0.280, 1.0))))
    
    # Oil pan sump (pressed steel lower sump)
    sump_mat = Matrix.Translation(Vector((0.0, engine_center_y - 0.02, engine_center_z - 0.180)))
    _compat_create_cube(bm, size=1.0, matrix=sump_mat @ Matrix.Diagonal(Vector((0.320, 0.440, 0.120, 1.0))))
    
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    obj = bmesh_to_object(bm, "POWERTRAIN_Rover_V8_Block")
    obj.data.materials.append(mats["engine_alloy"])
    apply_smooth_and_modifiers(obj, angle_deg=35.0, bevel_width=0.003)
    powertrain_objs.append(obj)

    # 2. Cylinder Heads & Finned Valve Covers (Left & Right Banks at 45 degrees)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # Cylinder Head
        bm_head = bmesh.new()
        head_x = sign * 0.180
        head_z = engine_center_z + 0.140
        rot_mat = Matrix.Rotation(math.radians(-sign * 45), 4, 'Y')
        trans_mat = Matrix.Translation(Vector((head_x, engine_center_y, head_z)))
        head_mat = trans_mat @ rot_mat
        _compat_create_cube(bm_head, size=1.0, matrix=head_mat @ Matrix.Diagonal(Vector((0.140, 0.540, 0.110, 1.0))))

        # Finned Valve Cover with Oil Cap on left bank
        vc_mat = trans_mat @ rot_mat @ Matrix.Translation(Vector((0.0, 0.0, 0.080)))
        _compat_create_cube(bm_head, size=1.0, matrix=vc_mat @ Matrix.Diagonal(Vector((0.130, 0.520, 0.070, 1.0))))
        
        # Longitudinal cooling ribs on valve cover
        for r_idx in range(-2, 3):
            rib_mat = vc_mat @ Matrix.Translation(Vector((r_idx * 0.022, 0.0, 0.040)))
            _compat_create_cube(bm_head, size=1.0, matrix=rib_mat @ Matrix.Diagonal(Vector((0.008, 0.480, 0.012, 1.0))))

        if side == "L":
            # Chromed oil filler cap
            cap_mat = vc_mat @ Matrix.Translation(Vector((0.0, 0.160, 0.055)))
            _compat_create_cylinder(bm_head, radius=0.032, depth=0.025, segments=16, matrix=cap_mat)

        bmesh.ops.recalc_face_normals(bm_head, faces=bm_head.faces)
        obj_head = bmesh_to_object(bm_head, f"POWERTRAIN_Rover_V8_Cylinder_Head_{side}")
        obj_head.data.materials.append(mats["engine_alloy"])
        apply_smooth_and_modifiers(obj_head, angle_deg=35.0, bevel_width=0.002)
        powertrain_objs.append(obj_head)

    # 3. Dual SU HIF6 Carburettors & Twin Chrome Air Cleaners
    bm_carb = bmesh.new()
    # Intake Manifold Bridge (Valley cover)
    valley_mat = Matrix.Translation(Vector((0.0, engine_center_y, engine_center_z + 0.160)))
    _compat_create_cube(bm_carb, size=1.0, matrix=valley_mat @ Matrix.Diagonal(Vector((0.260, 0.480, 0.080, 1.0))))

    # Twin SU carburettor bodies with suction chambers & polished bells
    carb_positions = [
        ("Front", engine_center_y + 0.120),
        ("Rear",  engine_center_y - 0.120)
    ]
    for c_tag, c_y in carb_positions:
        # Carb mixing body
        cb_mat = Matrix.Translation(Vector((0.0, c_y, engine_center_z + 0.240)))
        _compat_create_cube(bm_carb, size=1.0, matrix=cb_mat @ Matrix.Diagonal(Vector((0.110, 0.110, 0.100, 1.0))))
        
        # Cylindrical SU suction chamber bell (vertical dome)
        bell_mat = cb_mat @ Matrix.Translation(Vector((0.0, 0.0, 0.075)))
        _compat_create_cylinder(bm_carb, radius1=0.042, radius2=0.028, depth=0.080, segments=20, matrix=bell_mat)
        
        # Chrome pancake circular air filter housing
        pancake_mat = cb_mat @ Matrix.Translation(Vector((-0.130, 0.0, 0.020))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        _compat_create_cylinder(bm_carb, radius=0.105, depth=0.055, segments=28, matrix=pancake_mat)

    bmesh.ops.recalc_face_normals(bm_carb, faces=bm_carb.faces)
    obj_carb = bmesh_to_object(bm_carb, "POWERTRAIN_Rover_V8_Dual_SU_Carbs")
    obj_carb.data.materials.append(mats["chrome"])
    apply_smooth_and_modifiers(obj_carb, angle_deg=35.0, bevel_width=0.002)
    powertrain_objs.append(obj_carb)

    # 4. Front Accessory Drive: Water Pump, 7-Blade Radiator Fan & Alternator
    bm_front = bmesh.new()
    front_y = engine_center_y + 0.320
    
    # Crankshaft double V-pulley
    crank_mat = Matrix.Translation(Vector((0.0, front_y, engine_center_z - 0.06))) @ Matrix.Rotation(math.radians(90), 4, 'X')
    _compat_create_cylinder(bm_front, radius=0.075, depth=0.040, segments=24, matrix=crank_mat)
    
    # Water pump hub & fan center
    fan_hub_mat = Matrix.Translation(Vector((0.0, front_y + 0.04, engine_center_z + 0.08))) @ Matrix.Rotation(math.radians(90), 4, 'X')
    _compat_create_cylinder(bm_front, radius=0.055, depth=0.050, segments=20, matrix=fan_hub_mat)
    
    # 7 Radiator Fan Blades (Puckered aerodynamic twist)
    for b_idx in range(7):
        b_angle = b_idx * (2.0 * math.pi / 7.0)
        blade_mat = (fan_hub_mat @
                     Matrix.Rotation(b_angle, 4, 'Z') @
                     Matrix.Translation(Vector((0.130, 0.0, 0.0))) @
                     Matrix.Rotation(math.radians(22), 4, 'X'))
        _compat_create_cube(bm_front, size=1.0, matrix=blade_mat @ Matrix.Diagonal(Vector((0.140, 0.045, 0.004, 1.0))))
        
    # Lucas Alternator (Mounted high on right side)
    alt_mat = Matrix.Translation(Vector((-0.240, front_y - 0.04, engine_center_z + 0.12))) @ Matrix.Rotation(math.radians(90), 4, 'X')
    _compat_create_cylinder(bm_front, radius=0.068, depth=0.150, segments=20, matrix=alt_mat)

    bmesh.ops.recalc_face_normals(bm_front, faces=bm_front.faces)
    obj_front = bmesh_to_object(bm_front, "POWERTRAIN_Rover_V8_Accessory_Drive")
    obj_front.data.materials.append(mats["engine_alloy"])
    apply_smooth_and_modifiers(obj_front, angle_deg=35.0)
    powertrain_objs.append(obj_front)

    # 5. LT95 4-Speed Gearbox & Integrated Transfer Case
    bm_gearbox = bmesh.new()
    gb_y = engine_center_y - 0.480
    
    # Bellhousing (Conical cast aluminum enclosure)
    bell_mat = Matrix.Translation(Vector((0.0, engine_center_y - 0.320, engine_center_z))) @ Matrix.Rotation(math.radians(90), 4, 'X')
    _compat_create_cylinder(bm_gearbox, radius1=0.220, radius2=0.160, depth=0.180, segments=24, matrix=bell_mat)
    
    # Main 4-Speed Gearbox casing
    trans_mat = Matrix.Translation(Vector((0.0, gb_y, engine_center_z - 0.02)))
    _compat_create_cube(bm_gearbox, size=1.0, matrix=trans_mat @ Matrix.Diagonal(Vector((0.260, 0.380, 0.240, 1.0))))
    
    # Integrated 2-Speed Transfer Case & Center Differential
    tc_mat = Matrix.Translation(Vector((0.040, gb_y - 0.280, engine_center_z - 0.06)))
    _compat_create_cube(bm_gearbox, size=1.0, matrix=tc_mat @ Matrix.Diagonal(Vector((0.340, 0.300, 0.260, 1.0))))
    
    # Front & Rear Output Drive Flanges
    # Front output offset to right (sign = -1.0):
    front_flange_mat = Matrix.Translation(Vector((-0.090, gb_y - 0.220, engine_center_z - 0.12))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    _compat_create_cylinder(bm_gearbox, radius=0.055, depth=0.035, segments=16, matrix=front_flange_mat)
    # Rear output offset to right:
    rear_flange_mat = Matrix.Translation(Vector((-0.090, gb_y - 0.440, engine_center_z - 0.12))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    _compat_create_cylinder(bm_gearbox, radius=0.055, depth=0.035, segments=16, matrix=rear_flange_mat)

    bmesh.ops.recalc_face_normals(bm_gearbox, faces=bm_gearbox.faces)
    obj_gb = bmesh_to_object(bm_gearbox, "POWERTRAIN_RRC_LT95_Gearbox_Transfer_Case")
    obj_gb.data.materials.append(mats["engine_alloy"])
    apply_smooth_and_modifiers(obj_gb, angle_deg=35.0, bevel_width=0.003)
    powertrain_objs.append(obj_gb)

    # 6. Front & Rear Propshafts (Steel drive shafts with Cardan U-joints)
    # Front Propshaft (Transfer case to front live axle differential at Y = +1.270m)
    bm_fpropshaft = bmesh.new()
    fps_start = Vector((-0.090, gb_y - 0.220, engine_center_z - 0.12))
    fps_end = Vector((-0.120, 1.250, 0.280))
    fps_vec = fps_end - fps_start
    fps_mid = (fps_start + fps_end) * 0.5
    fps_len = fps_vec.length
    fps_rot = fps_vec.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    fps_mat = Matrix.Translation(fps_mid) @ fps_rot
    _compat_create_cylinder(bm_fpropshaft, radius=0.035, depth=fps_len - 0.08, segments=16, matrix=fps_mat)
    # U-Joint Yokes at both ends
    _compat_create_cube(bm_fpropshaft, size=0.075, matrix=Matrix.Translation(fps_start))
    _compat_create_cube(bm_fpropshaft, size=0.075, matrix=Matrix.Translation(fps_end))

    bmesh.ops.recalc_face_normals(bm_fpropshaft, faces=bm_fpropshaft.faces)
    obj_fps = bmesh_to_object(bm_fpropshaft, "POWERTRAIN_RRC_Propshaft_Front")
    obj_fps.data.materials.append(mats["propshaft_steel"])
    apply_smooth_and_modifiers(obj_fps, angle_deg=35.0)
    powertrain_objs.append(obj_fps)

    # Rear Propshaft (Transfer case to rear axle differential at Y = -1.270m)
    bm_rpropshaft = bmesh.new()
    rps_start = Vector((-0.090, gb_y - 0.440, engine_center_z - 0.12))
    rps_end = Vector((-0.100, -1.250, 0.280))
    rps_vec = rps_end - rps_start
    rps_mid = (rps_start + rps_end) * 0.5
    rps_len = rps_vec.length
    rps_rot = rps_vec.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    rps_mat = Matrix.Translation(rps_mid) @ rps_rot
    _compat_create_cylinder(bm_rpropshaft, radius=0.038, depth=rps_len - 0.08, segments=16, matrix=rps_mat)
    _compat_create_cube(bm_rpropshaft, size=0.080, matrix=Matrix.Translation(rps_start))
    _compat_create_cube(bm_rpropshaft, size=0.080, matrix=Matrix.Translation(rps_end))

    bmesh.ops.recalc_face_normals(bm_rpropshaft, faces=bm_rpropshaft.faces)
    obj_rps = bmesh_to_object(bm_rpropshaft, "POWERTRAIN_RRC_Propshaft_Rear")
    obj_rps.data.materials.append(mats["propshaft_steel"])
    apply_smooth_and_modifiers(obj_rps, angle_deg=35.0)
    powertrain_objs.append(obj_rps)

    return powertrain_objs

# ============================================================================
# 5. SUSPENSION: SOLID LIVE AXLES, COIL SPRINGS & BOGE HYDROMAT SYSTEM
# ============================================================================

def build_range_rover_classic_suspension(mats):
    """
    Builds the authentic long-travel luxury off-road coil spring live axle suspension:
    - Front Rover solid live beam axle with cast iron differential pumpkin & chrome swivel balls
    - Front forged steel radius arms anchored to chassis rails
    - Front transverse Panhard rod with chassis and axle mounting brackets
    - Front long-travel coil springs & concentric telescopic Armstrong dampers
    - Rear heavy-duty live beam axle with central Salisbury differential pumpkin
    - Rear lower trailing links anchored with rubber bushed pivots
    - Rear central A-frame wishbone with apex ball joint on differential top
    - Boge Hydromat self-leveling telescopic central strut
    - Rear coil springs & angled telescopic shock absorbers
    """
    susp_objs = []
    track_width = 1.486 # 1,486mm wheel track
    half_track = track_width * 0.5
    axle_z = 0.280 # Axle center height above ground

    # -------------------------------------------------------------------------
    # FRONT SUSPENSION ASSEMBLY (Y = +1.270m)
    # -------------------------------------------------------------------------
    front_y = 1.270
    bm_front_axle = bmesh.new()

    # Front Axle Tube (Transverse tubular housing)
    axle_mat = Matrix.Translation(Vector((0.0, front_y, axle_z))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    _compat_create_cylinder(bm_front_axle, radius=0.046, depth=track_width - 0.16, segments=24, matrix=axle_mat)

    # Offset Front Differential Pumpkin (Cast iron housing, offset to right X = -0.12m)
    diff_f_mat = Matrix.Translation(Vector((-0.120, front_y, axle_z)))
    _compat_create_uvsphere(bm_front_axle, u_segments=24, v_segments=16, radius=0.125, matrix=diff_f_mat)
    # Stamped inspection cover on front diff
    cover_f_mat = Matrix.Translation(Vector((-0.120, front_y + 0.10, axle_z))) @ Matrix.Rotation(math.radians(90), 4, 'X')
    _compat_create_cylinder(bm_front_axle, radius=0.095, depth=0.035, segments=20, matrix=cover_f_mat)

    # Chrome Swivel Ball Housings (Left & Right ends of front axle for steering articulation)
    for sign in [1.0, -1.0]:
        swivel_mat = Matrix.Translation(Vector((sign * (half_track - 0.08), front_y, axle_z)))
        _compat_create_uvsphere(bm_front_axle, u_segments=20, v_segments=12, radius=0.078, matrix=swivel_mat)
        # Steering knuckle spindle
        spindle_mat = Matrix.Translation(Vector((sign * half_track, front_y, axle_z))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        _compat_create_cylinder(bm_front_axle, radius=0.042, depth=0.080, segments=16, matrix=spindle_mat)

    # Transverse Steering Tie Rod & Drag Link
    tierod_mat = Matrix.Translation(Vector((0.0, front_y - 0.08, axle_z - 0.02))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    _compat_create_cylinder(bm_front_axle, radius=0.016, depth=track_width - 0.18, segments=16, matrix=tierod_mat)

    bmesh.ops.recalc_face_normals(bm_front_axle, faces=bm_front_axle.faces)
    obj_fa = bmesh_to_object(bm_front_axle, "SUSP_Front_Live_Axle_Assembly")
    obj_fa.data.materials.append(mats["axle_black"])
    apply_smooth_and_modifiers(obj_fa, angle_deg=35.0)
    susp_objs.append(obj_fa)

    # Front Radius Arms (Twin forged steel control arms running rearward to chassis)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_ra = bmesh.new()
        ra_front = Vector((sign * 0.440, front_y, axle_z))
        ra_rear = Vector((sign * 0.380, front_y - 0.820, 0.320))
        ra_vec = ra_rear - ra_front
        ra_len = ra_vec.length
        ra_mid = (ra_front + ra_rear) * 0.5
        ra_rot = ra_vec.to_track_quat('Z', 'Y').to_matrix().to_4x4()
        ra_mat = Matrix.Translation(ra_mid) @ ra_rot
        
        # Heavy forged I-beam cross section
        _compat_create_cube(bm_ra, size=1.0, matrix=ra_mat @ Matrix.Diagonal(Vector((0.035, ra_len, 0.065, 1.0))))
        # Front axle mounting clamp rings
        _compat_create_cylinder(bm_ra, radius=0.055, depth=0.045, segments=16, matrix=Matrix.Translation(ra_front))
        # Rear chassis mounting eye with rubber bush
        _compat_create_cylinder(bm_ra, radius=0.038, depth=0.040, segments=16, matrix=Matrix.Translation(ra_rear))

        bmesh.ops.recalc_face_normals(bm_ra, faces=bm_ra.faces)
        obj_ra = bmesh_to_object(bm_ra, f"SUSP_Front_Radius_Arm_{side}")
        obj_ra.data.materials.append(mats["chassis_steel"])
        apply_smooth_and_modifiers(obj_ra, angle_deg=35.0)
        susp_objs.append(obj_ra)

    # Front Panhard Rod (Lateral locating bar from right axle to left chassis rail)
    bm_panhard = bmesh.new()
    pan_axle = Vector((-0.340, front_y + 0.05, axle_z + 0.04))
    pan_chassis = Vector((0.360, front_y + 0.05, 0.400))
    pan_vec = pan_chassis - pan_axle
    pan_len = pan_vec.length
    pan_mid = (pan_axle + pan_chassis) * 0.5
    pan_rot = pan_vec.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    pan_mat = Matrix.Translation(pan_mid) @ pan_rot
    _compat_create_cylinder(bm_panhard, radius=0.018, depth=pan_len, segments=16, matrix=pan_mat)

    bmesh.ops.recalc_face_normals(bm_panhard, faces=bm_panhard.faces)
    obj_pan = bmesh_to_object(bm_panhard, "SUSP_Front_Panhard_Rod")
    obj_pan.data.materials.append(mats["chassis_steel"])
    apply_smooth_and_modifiers(obj_pan, angle_deg=35.0)
    susp_objs.append(obj_pan)

    # Front Coil Springs & Telescopic Armstrong Dampers (Left & Right)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_spring = bmesh.new()
        sp_x = sign * 0.440
        sp_z_bot = axle_z + 0.05
        sp_z_top = 0.580
        sp_height = sp_z_top - sp_z_bot
        
        # Helical coil spring (procedural coil turns)
        coils = 8
        pts_per_turn = 16
        total_pts = coils * pts_per_turn
        radius = 0.065
        wire_r = 0.009
        
        prev_ring = None
        for p in range(total_pts + 1):
            theta = (p / pts_per_turn) * 2.0 * math.pi
            cz = sp_z_bot + (p / total_pts) * sp_height
            cx = sp_x + math.cos(theta) * radius
            cy = front_y + math.sin(theta) * radius
            center = Vector((cx, cy, cz))
            
            # Wire circle verts
            normal = Vector((-math.sin(theta), math.cos(theta), sp_height / (coils * 2.0 * math.pi * radius))).normalized()
            binormal = Vector((0, 0, 1)).cross(normal).normalized()
            up = normal.cross(binormal)
            
            ring_verts = []
            for a in range(8):
                ang = a * (2.0 * math.pi / 8)
                off = (binormal * math.cos(ang) + up * math.sin(ang)) * wire_r
                ring_verts.append(bm_spring.verts.new(center + off))
                
            if prev_ring is not None:
                for a in range(8):
                    na = (a + 1) % 8
                    bm_spring.faces.new([prev_ring[a], ring_verts[a], ring_verts[na], prev_ring[na]])
            prev_ring = ring_verts

        # Telescopic damper tube inside coil
        damper_mat = Matrix.Translation(Vector((sp_x, front_y, (sp_z_bot + sp_z_top) * 0.5)))
        _compat_create_cylinder(bm_spring, radius=0.026, depth=sp_height * 0.95, segments=16, matrix=damper_mat)

        bmesh.ops.recalc_face_normals(bm_spring, faces=bm_spring.faces)
        obj_spring = bmesh_to_object(bm_spring, f"SUSP_Front_Coil_Spring_Damper_{side}")
        obj_spring.data.materials.append(mats["spring_steel"])
        apply_smooth_and_modifiers(obj_spring, angle_deg=35.0)
        susp_objs.append(obj_spring)

    # -------------------------------------------------------------------------
    # REAR SUSPENSION ASSEMBLY (Y = -1.270m)
    # -------------------------------------------------------------------------
    rear_y = -1.270
    bm_rear_axle = bmesh.new()

    # Rear Heavy-Duty Salisbury Live Axle Tube
    raxle_mat = Matrix.Translation(Vector((0.0, rear_y, axle_z))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    _compat_create_cylinder(bm_rear_axle, radius=0.050, depth=track_width - 0.14, segments=24, matrix=raxle_mat)

    # Central Salisbury Differential Pumpkin
    diff_r_mat = Matrix.Translation(Vector((-0.100, rear_y, axle_z)))
    _compat_create_uvsphere(bm_rear_axle, u_segments=24, v_segments=16, radius=0.135, matrix=diff_r_mat)
    cover_r_mat = Matrix.Translation(Vector((-0.100, rear_y - 0.11, axle_z))) @ Matrix.Rotation(math.radians(90), 4, 'X')
    _compat_create_cylinder(bm_rear_axle, radius=0.105, depth=0.040, segments=20, matrix=cover_r_mat)

    # Axle end flanges for brake drums
    for sign in [1.0, -1.0]:
        rflange_mat = Matrix.Translation(Vector((sign * half_track, rear_y, axle_z))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        _compat_create_cylinder(bm_rear_axle, radius=0.070, depth=0.045, segments=20, matrix=rflange_mat)

    bmesh.ops.recalc_face_normals(bm_rear_axle, faces=bm_rear_axle.faces)
    obj_ra_axle = bmesh_to_object(bm_rear_axle, "SUSP_Rear_Live_Axle_Assembly")
    obj_ra_axle.data.materials.append(mats["axle_black"])
    apply_smooth_and_modifiers(obj_ra_axle, angle_deg=35.0)
    susp_objs.append(obj_ra_axle)

    # Rear Lower Trailing Links (Forward to chassis)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_link = bmesh.new()
        tl_rear = Vector((sign * 0.440, rear_y, axle_z))
        tl_front = Vector((sign * 0.400, rear_y + 0.760, 0.320))
        tl_vec = tl_front - tl_rear
        tl_len = tl_vec.length
        tl_mid = (tl_rear + tl_front) * 0.5
        tl_rot = tl_vec.to_track_quat('Z', 'Y').to_matrix().to_4x4()
        tl_mat = Matrix.Translation(tl_mid) @ tl_rot
        _compat_create_cylinder(bm_link, radius=0.024, depth=tl_len, segments=16, matrix=tl_mat)

        bmesh.ops.recalc_face_normals(bm_link, faces=bm_link.faces)
        obj_tl = bmesh_to_object(bm_link, f"SUSP_Rear_Trailing_Link_{side}")
        obj_tl.data.materials.append(mats["chassis_steel"])
        apply_smooth_and_modifiers(obj_tl, angle_deg=35.0)
        susp_objs.append(obj_tl)

    # Rear Central A-Frame Upper Wishbone (Apex on axle center, 2 legs forward to chassis)
    bm_aframe = bmesh.new()
    apex = Vector((0.0, rear_y, axle_z + 0.120))
    leg_l = Vector((0.360, rear_y + 0.650, 0.400))
    leg_r = Vector((-0.360, rear_y + 0.650, 0.400))
    
    # Central Ball Joint at Apex
    _compat_create_uvsphere(bm_aframe, radius=0.045, matrix=Matrix.Translation(apex))
    # Left A-Frame Leg
    v_l = leg_l - apex
    m_l = Matrix.Translation((apex + leg_l) * 0.5) @ v_l.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    _compat_create_cylinder(bm_aframe, radius=0.022, depth=v_l.length, segments=16, matrix=m_l)
    # Right A-Frame Leg
    v_r = leg_r - apex
    m_r = Matrix.Translation((apex + leg_r) * 0.5) @ v_r.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    _compat_create_cylinder(bm_aframe, radius=0.022, depth=v_r.length, segments=16, matrix=m_r)

    bmesh.ops.recalc_face_normals(bm_aframe, faces=bm_aframe.faces)
    obj_af = bmesh_to_object(bm_aframe, "SUSP_Rear_Upper_A_Frame")
    obj_af.data.materials.append(mats["chassis_steel"])
    apply_smooth_and_modifiers(obj_af, angle_deg=35.0)
    susp_objs.append(obj_af)

    # Boge Hydromat Self-Leveling Central Strut (Pneumatic leveling cylinder)
    bm_boge = bmesh.new()
    boge_bot = Vector((0.060, rear_y - 0.04, axle_z + 0.08))
    boge_top = Vector((0.060, rear_y - 0.04, 0.520))
    boge_mid = (boge_bot + boge_top) * 0.5
    boge_h = (boge_top - boge_bot).length
    _compat_create_cylinder(bm_boge, radius=0.042, depth=boge_h, segments=20, matrix=Matrix.Translation(boge_mid))

    bmesh.ops.recalc_face_normals(bm_boge, faces=bm_boge.faces)
    obj_boge = bmesh_to_object(bm_boge, "SUSP_Rear_Boge_Hydromat_Leveler")
    obj_boge.data.materials.append(mats["damper_blue"])
    apply_smooth_and_modifiers(obj_boge, angle_deg=35.0)
    susp_objs.append(obj_boge)

    # Rear Coil Springs & Telescopic Armstrong Dampers
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_rspring = bmesh.new()
        rsp_x = sign * 0.440
        rsp_z_bot = axle_z + 0.05
        rsp_z_top = 0.590
        rsp_height = rsp_z_top - rsp_z_bot
        
        # Helical coil spring
        coils = 9
        pts_per_turn = 16
        total_pts = coils * pts_per_turn
        radius = 0.068
        wire_r = 0.0095
        
        prev_ring = None
        for p in range(total_pts + 1):
            theta = (p / pts_per_turn) * 2.0 * math.pi
            cz = rsp_z_bot + (p / total_pts) * rsp_height
            cx = rsp_x + math.cos(theta) * radius
            cy = rear_y + math.sin(theta) * radius
            center = Vector((cx, cy, cz))
            
            normal = Vector((-math.sin(theta), math.cos(theta), rsp_height / (coils * 2.0 * math.pi * radius))).normalized()
            binormal = Vector((0, 0, 1)).cross(normal).normalized()
            up = normal.cross(binormal)
            
            ring_verts = []
            for a in range(8):
                ang = a * (2.0 * math.pi / 8)
                off = (binormal * math.cos(ang) + up * math.sin(ang)) * wire_r
                ring_verts.append(bm_rspring.verts.new(center + off))
                
            if prev_ring is not None:
                for a in range(8):
                    na = (a + 1) % 8
                    bm_rspring.faces.new([prev_ring[a], ring_verts[a], ring_verts[na], prev_ring[na]])
            prev_ring = ring_verts

        # Angled rear telescopic damper
        d_bot = Vector((sign * 0.490, rear_y, axle_z + 0.02))
        d_top = Vector((sign * 0.380, rear_y + 0.15, 0.540))
        d_mid = (d_bot + d_top) * 0.5
        d_vec = d_top - d_bot
        d_mat = Matrix.Translation(d_mid) @ d_vec.to_track_quat('Z', 'Y').to_matrix().to_4x4()
        _compat_create_cylinder(bm_rspring, radius=0.026, depth=d_vec.length, segments=16, matrix=d_mat)

        bmesh.ops.recalc_face_normals(bm_rspring, faces=bm_rspring.faces)
        obj_rspring = bmesh_to_object(bm_rspring, f"SUSP_Rear_Coil_Spring_Damper_{side}")
        obj_rspring.data.materials.append(mats["spring_steel"])
        apply_smooth_and_modifiers(obj_rspring, angle_deg=35.0)
        susp_objs.append(obj_rspring)

    return susp_objs

# ============================================================================
# 6. WHEELS & BRAKES: 16" ROSTYLE STYLED STEEL WHEELS & MICHELIN XM+S TIRES
# ============================================================================

def build_range_rover_classic_wheels_and_brakes(mats):
    """
    Builds the 4 authentic 16" Rostyle styled steel wheels and braking system:
    - 16" x 6.0J Rostyle wheels (two-tone silver stamped face with black recessed valleys)
    - 5-stud wheel hub with chrome lug nuts & black center dust cap
    - 205/80 R16 Michelin XM+S all-terrain tires with deep circumferential grooves,
      staggered shoulder traction lugs, and curved sidewall beads
    - Front Girling 4-piston ventilated disc brake rotors & gold cadmium calipers
    - Rear 11" cast iron ribbed brake drums
    """
    wheel_objs = []
    track_width = 1.486
    half_track = track_width * 0.5
    wheelbase = 2.540
    half_wb = wheelbase * 0.5
    wheel_radius = 0.385 # ~770mm overall rolling diameter
    rim_radius = 0.220   # 16-inch rim (~406mm bead dia)
    tire_width = 0.205   # 205mm section width
    axle_z = 0.280

    wheel_corners = [
        ("FL",  half_track,  half_wb, True),
        ("FR", -half_track,  half_wb, True),
        ("RL",  half_track, -half_wb, False),
        ("RR", -half_track, -half_wb, False)
    ]

    for corner, wx, wy, is_front in wheel_corners:
        sign = 1.0 if wx > 0 else -1.0
        
        # 1. Rostyle Wheel Rim & Styled Face
        bm_wheel = bmesh.new()
        hub_center = Vector((wx, wy, axle_z))
        rot_face = Matrix.Translation(hub_center) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        
        # Outer stepped steel rim barrel
        add_annular_tube(bm_wheel, r_inner=rim_radius - 0.015, r_outer=rim_radius + 0.015,
                         depth=tire_width * 0.85, segments=36, matrix=rot_face)
        
        # Rostyle Styled Steel Center Disc (5 raised trapezoidal spokes radiating outward)
        for spoke_idx in range(5):
            spoke_ang = spoke_idx * (2.0 * math.pi / 5.0)
            spoke_rot = rot_face @ Matrix.Rotation(spoke_ang, 4, 'Z')
            # Raised silver trapezoid spoke
            spoke_mat = spoke_rot @ Matrix.Translation(Vector((0.115, 0.0, sign * 0.035)))
            _compat_create_cube(bm_wheel, size=1.0, matrix=spoke_mat @ Matrix.Diagonal(Vector((0.110, 0.065, 0.018, 1.0))))
            # Recessed black cutout relief behind spoke
            relief_mat = spoke_rot @ Matrix.Translation(Vector((0.140, 0.065, sign * 0.010)))
            _compat_create_cube(bm_wheel, size=1.0, matrix=relief_mat @ Matrix.Diagonal(Vector((0.075, 0.035, 0.012, 1.0))))

        # Center Hub Dome & 5 Chrome Lug Nuts
        center_dome_mat = rot_face @ Matrix.Translation(Vector((0.0, 0.0, sign * 0.045)))
        _compat_create_cylinder(bm_wheel, radius1=0.062, radius2=0.045, depth=0.035, segments=24, matrix=center_dome_mat)
        
        for lug_idx in range(5):
            lug_ang = lug_idx * (2.0 * math.pi / 5.0) + (math.pi / 5.0)
            lug_mat = rot_face @ Matrix.Translation(Vector((math.cos(lug_ang) * 0.075, math.sin(lug_ang) * 0.075, sign * 0.040)))
            _compat_create_cylinder(bm_wheel, radius=0.012, depth=0.022, segments=6, matrix=lug_mat)

        bmesh.ops.recalc_face_normals(bm_wheel, faces=bm_wheel.faces)
        obj_wheel = bmesh_to_object(bm_wheel, f"WHEEL_RRC_Rostyle_{corner}")
        obj_wheel.data.materials.append(mats["rostyle_silver"])
        apply_smooth_and_modifiers(obj_wheel, angle_deg=35.0, bevel_width=0.002)
        wheel_objs.append(obj_wheel)

        # 2. Michelin XM+S All-Terrain Tire (Deep 3D Tread & Sidewall)
        bm_tire = bmesh.new()
        tire_mat = Matrix.Translation(hub_center) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        
        # Smooth toroidal sidewall envelope
        add_annular_tube(bm_tire, r_inner=rim_radius, r_outer=wheel_radius, depth=tire_width,
                         segments=48, matrix=tire_mat)
        
        # 36 Radial All-Terrain Mud & Snow Traction Lugs
        tread_blocks = 36
        for t_idx in range(tread_blocks):
            t_ang = t_idx * (2.0 * math.pi / tread_blocks)
            t_rot = tire_mat @ Matrix.Rotation(t_ang, 4, 'Z')
            # Center interlocking tread blocks
            block_c = t_rot @ Matrix.Translation(Vector((wheel_radius + 0.007, 0.0, 0.0)))
            _compat_create_cube(bm_tire, size=1.0, matrix=block_c @ Matrix.Diagonal(Vector((0.014, 0.028, tire_width * 0.45, 1.0))))
            # Staggered aggressive shoulder biting lugs
            block_s1 = t_rot @ Matrix.Translation(Vector((wheel_radius + 0.005, 0.012, 0.075)))
            _compat_create_cube(bm_tire, size=1.0, matrix=block_s1 @ Matrix.Diagonal(Vector((0.012, 0.024, 0.045, 1.0))))
            block_s2 = t_rot @ Matrix.Translation(Vector((wheel_radius + 0.005, -0.012, -0.075)))
            _compat_create_cube(bm_tire, size=1.0, matrix=block_s2 @ Matrix.Diagonal(Vector((0.012, 0.024, 0.045, 1.0))))

        bmesh.ops.recalc_face_normals(bm_tire, faces=bm_tire.faces)
        obj_tire = bmesh_to_object(bm_tire, f"WHEEL_RRC_Tire_{corner}")
        obj_tire.data.materials.append(mats["tire_tread"])
        apply_smooth_and_modifiers(obj_tire, angle_deg=35.0)
        wheel_objs.append(obj_tire)

        # 3. Brake Assembly (Front Girling Disc vs Rear Drum)
        if is_front:
            # Front Girling 4-Piston Disc Brake
            bm_brake = bmesh.new()
            # Ventilated brake disc
            rotor_mat = Matrix.Translation(Vector((wx - sign * 0.035, wy, axle_z))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
            _compat_create_cylinder(bm_brake, radius=0.145, depth=0.022, segments=28, matrix=rotor_mat)
            
            # Gold cadmium 4-piston heavy caliper (mounted at rear of disc)
            caliper_mat = Matrix.Translation(Vector((wx - sign * 0.035, wy - 0.100, axle_z + 0.050)))
            _compat_create_cube(bm_brake, size=1.0, matrix=caliper_mat @ Matrix.Diagonal(Vector((0.075, 0.130, 0.095, 1.0))))
            
            bmesh.ops.recalc_face_normals(bm_brake, faces=bm_brake.faces)
            obj_brake = bmesh_to_object(bm_brake, f"BRAKE_RRC_Front_Disc_{corner}")
            obj_brake.data.materials.append(mats["brake_disc"])
            apply_smooth_and_modifiers(obj_brake, angle_deg=35.0, bevel_width=0.002)
            wheel_objs.append(obj_brake)
        else:
            # Rear 11" Cast Iron Brake Drum
            bm_drum = bmesh.new()
            drum_mat = Matrix.Translation(Vector((wx - sign * 0.030, wy, axle_z))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
            _compat_create_cylinder(bm_drum, radius=0.140, depth=0.068, segments=32, matrix=drum_mat)
            
            # Circumferential cooling ribs around drum perimeter
            add_annular_tube(bm_drum, r_inner=0.140, r_outer=0.146, depth=0.012, segments=32,
                             matrix=drum_mat @ Matrix.Translation(Vector((0.0, 0.0, 0.020))))
            add_annular_tube(bm_drum, r_inner=0.140, r_outer=0.146, depth=0.012, segments=32,
                             matrix=drum_mat @ Matrix.Translation(Vector((0.0, 0.0, -0.020))))

            bmesh.ops.recalc_face_normals(bm_drum, faces=bm_drum.faces)
            obj_drum = bmesh_to_object(bm_drum, f"BRAKE_RRC_Rear_Drum_{corner}")
            obj_drum.data.materials.append(mats["brake_drum"])
            apply_smooth_and_modifiers(obj_drum, angle_deg=35.0)
            wheel_objs.append(obj_drum)

    return wheel_objs

# ============================================================================
# 7. INTERIOR CABIN: 3-DOOR CONNOLLY LEATHER, SMITHS GAUGES & REAR DECK
# ============================================================================

def build_range_rover_classic_interior(mats):
    """
    Builds the authentic 1970s 3-Door luxury passenger cabin:
    - Stamped floor pan tub with transmission tunnel & rear load floor
    - Front bucket seats in Connolly Palomino leather with chrome recline knobs,
      deep fluting, side bolsters, and forward-tilt hinges for rear passenger entry
    - Full-width rear bench seat with folding backrest
    - Horizontal padded dashboard binnacle with iconic vertical center control console
    - Smiths round instrument cluster (speedometer, tachometer, auxiliary quad pod)
    - Classic 2-spoke thin-rim Bakelite steering wheel on column shroud
    - Floor tunnel console with 4-speed gear lever, transfer case lever & handbrake
    - Upright rear spare wheel mounted vertically on left inner cargo wall with vinyl cover
    - Split tailgate interior sill, carpeting & gas strut pivot dampers
    """
    interior_objs = []
    floor_z = 0.380
    cabin_y_front = 0.850
    cabin_y_rear = -1.950

    # 1. Floor Pan Tub & Transmission Tunnel
    bm_floor = bmesh.new()
    # Main passenger footwells & rear cargo floor
    floor_mat = Matrix.Translation(Vector((0.0, (cabin_y_front + cabin_y_rear) * 0.5, floor_z)))
    _compat_create_cube(bm_floor, size=1.0, matrix=floor_mat @ Matrix.Diagonal(Vector((1.420, cabin_y_front - cabin_y_rear, 0.025, 1.0))))
    
    # Transmission / Transfer Case Tunnel (Longitudinal center hump)
    tunnel_mat = Matrix.Translation(Vector((0.0, 0.150, floor_z + 0.100)))
    _compat_create_cube(bm_floor, size=1.0, matrix=tunnel_mat @ Matrix.Diagonal(Vector((0.320, 1.350, 0.200, 1.0))))
    
    # Rear Cargo Raised Deck Floor (Over rear axle)
    cargo_mat = Matrix.Translation(Vector((0.0, -1.250, floor_z + 0.080)))
    _compat_create_cube(bm_floor, size=1.0, matrix=cargo_mat @ Matrix.Diagonal(Vector((1.380, 1.350, 0.040, 1.0))))
    
    # Inner Wheel Tub Arches in Cargo Bed (Left & Right)
    for sign in [1.0, -1.0]:
        tub_mat = Matrix.Translation(Vector((sign * 0.580, -1.270, floor_z + 0.220)))
        _compat_create_cube(bm_floor, size=1.0, matrix=tub_mat @ Matrix.Diagonal(Vector((0.260, 0.780, 0.280, 1.0))))

    bmesh.ops.recalc_face_normals(bm_floor, faces=bm_floor.faces)
    obj_floor = bmesh_to_object(bm_floor, "INTERIOR_RRC_Floor_Pan_Tub")
    obj_floor.data.materials.append(mats["carpet_brown"])
    apply_smooth_and_modifiers(obj_floor, angle_deg=35.0, bevel_width=0.003)
    interior_objs.append(obj_floor)

    # 2. Front Bucket Seats (Driver X = -0.36m, Passenger X = +0.36m)
    # Connolly Palomino leather with 5 flutes and chrome recline mechanism
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_seat = bmesh.new()
        seat_x = -sign * 0.360 # Driver LHD / RHD
        seat_y = 0.050
        
        # Seat Base Cushion (Contoured with side bolsters)
        base_mat = Matrix.Translation(Vector((seat_x, seat_y, floor_z + 0.160)))
        _compat_create_cube(bm_seat, size=1.0, matrix=base_mat @ Matrix.Diagonal(Vector((0.480, 0.520, 0.140, 1.0))))
        
        # 5 Longitudinal Flutes on cushion
        for f_idx in range(-2, 3):
            flute_mat = base_mat @ Matrix.Translation(Vector((f_idx * 0.075, 0.0, 0.075)))
            _compat_create_cube(bm_seat, size=1.0, matrix=flute_mat @ Matrix.Diagonal(Vector((0.055, 0.460, 0.020, 1.0))))

        # Backrest (Reclined ~14 degrees rearward)
        back_mat = (Matrix.Translation(Vector((seat_x, seat_y - 0.220, floor_z + 0.500))) @
                    Matrix.Rotation(math.radians(-14), 4, 'X'))
        _compat_create_cube(bm_seat, size=1.0, matrix=back_mat @ Matrix.Diagonal(Vector((0.460, 0.120, 0.560, 1.0))))
        
        # Backrest flutes
        for f_idx in range(-2, 3):
            b_flute_mat = back_mat @ Matrix.Translation(Vector((f_idx * 0.070, 0.065, 0.0)))
            _compat_create_cube(bm_seat, size=1.0, matrix=b_flute_mat @ Matrix.Diagonal(Vector((0.050, 0.020, 0.500, 1.0))))

        # Integrated headrest pad
        hr_mat = back_mat @ Matrix.Translation(Vector((0.0, 0.0, 0.340)))
        _compat_create_cube(bm_seat, size=1.0, matrix=hr_mat @ Matrix.Diagonal(Vector((0.280, 0.110, 0.150, 1.0))))
        
        # Chrome recline adjustment knob on outer flank
        knob_mat = Matrix.Translation(Vector((seat_x + sign * 0.260, seat_y - 0.200, floor_z + 0.200))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        _compat_create_cylinder(bm_seat, radius=0.038, depth=0.025, segments=16, matrix=knob_mat)

        bmesh.ops.recalc_face_normals(bm_seat, faces=bm_seat.faces)
        obj_seat = bmesh_to_object(bm_seat, f"INTERIOR_RRC_Seat_Front_{side}")
        obj_seat.data.materials.append(mats["leather_palomino"])
        apply_smooth_and_modifiers(obj_seat, angle_deg=35.0, bevel_width=0.003)
        interior_objs.append(obj_seat)

    # 3. Full-Width Rear Passenger Bench Seat
    bm_rbench = bmesh.new()
    rbench_y = -0.720
    # Bench bottom cushion
    rbase_mat = Matrix.Translation(Vector((0.0, rbench_y, floor_z + 0.240)))
    _compat_create_cube(bm_rbench, size=1.0, matrix=rbase_mat @ Matrix.Diagonal(Vector((1.260, 0.500, 0.140, 1.0))))
    
    # Bench folding backrest
    rback_mat = (Matrix.Translation(Vector((0.0, rbench_y - 0.220, floor_z + 0.540))) @
                 Matrix.Rotation(math.radians(-16), 4, 'X'))
    _compat_create_cube(bm_rbench, size=1.0, matrix=rback_mat @ Matrix.Diagonal(Vector((1.240, 0.120, 0.520, 1.0))))
    
    # Fluting across rear backrest
    for f_idx in range(-6, 7):
        rf_mat = rback_mat @ Matrix.Translation(Vector((f_idx * 0.085, 0.065, 0.0)))
        _compat_create_cube(bm_rbench, size=1.0, matrix=rf_mat @ Matrix.Diagonal(Vector((0.060, 0.020, 0.460, 1.0))))

    bmesh.ops.recalc_face_normals(bm_rbench, faces=bm_rbench.faces)
    obj_rbench = bmesh_to_object(bm_rbench, "INTERIOR_RRC_Rear_Bench_Seat")
    obj_rbench.data.materials.append(mats["leather_palomino"])
    apply_smooth_and_modifiers(obj_rbench, angle_deg=35.0, bevel_width=0.003)
    interior_objs.append(obj_rbench)

    # 4. Classic Horizontal Dashboard & Instrument Binnacle
    bm_dash = bmesh.new()
    dash_y = 0.650
    dash_z = 0.820
    
    # Main horizontal padded fascia beam across cabin
    dash_mat = Matrix.Translation(Vector((0.0, dash_y, dash_z)))
    _compat_create_cube(bm_dash, size=1.0, matrix=dash_mat @ Matrix.Diagonal(Vector((1.420, 0.320, 0.160, 1.0))))
    
    # Passenger side recessed parcel shelf
    shelf_mat = Matrix.Translation(Vector((0.360, dash_y - 0.04, dash_z - 0.02)))
    _compat_create_cube(bm_dash, size=1.0, matrix=shelf_mat @ Matrix.Diagonal(Vector((0.540, 0.180, 0.080, 1.0))))
    
    # Driver-side instrument binnacle cowl (LHD X = -0.36m)
    binnacle_mat = Matrix.Translation(Vector((-0.360, dash_y - 0.06, dash_z + 0.090)))
    _compat_create_cube(bm_dash, size=1.0, matrix=binnacle_mat @ Matrix.Diagonal(Vector((0.440, 0.220, 0.120, 1.0))))

    bmesh.ops.recalc_face_normals(bm_dash, faces=bm_dash.faces)
    obj_dash = bmesh_to_object(bm_dash, "INTERIOR_RRC_Dashboard_Fascia")
    obj_dash.data.materials.append(mats["dash_black"])
    apply_smooth_and_modifiers(obj_dash, angle_deg=35.0, bevel_width=0.003)
    interior_objs.append(obj_dash)

    # 5. Smiths Instrument Dials (Speedometer, Tachometer & Quad Auxiliary Pod)
    bm_gauges = bmesh.new()
    gauge_x = -0.360
    gauge_y = dash_y - 0.150
    gauge_z = dash_z + 0.080
    gauge_rot = Matrix.Rotation(math.radians(20), 4, 'X')
    
    # Speedometer (Large circular dial on left)
    speedo_mat = Matrix.Translation(Vector((gauge_x - 0.110, gauge_y, gauge_z))) @ gauge_rot @ Matrix.Rotation(math.radians(90), 4, 'X')
    _compat_create_cylinder(bm_gauges, radius=0.052, depth=0.015, segments=24, matrix=speedo_mat)
    # Tachometer (Large circular dial on right)
    tacho_mat = Matrix.Translation(Vector((gauge_x + 0.110, gauge_y, gauge_z))) @ gauge_rot @ Matrix.Rotation(math.radians(90), 4, 'X')
    _compat_create_cylinder(bm_gauges, radius=0.052, depth=0.015, segments=24, matrix=tacho_mat)
    # Center Quad Auxiliary Gauge (Fuel, Water Temp, Oil Pressure, Amps)
    aux_mat = Matrix.Translation(Vector((gauge_x, gauge_y, gauge_z))) @ gauge_rot @ Matrix.Rotation(math.radians(90), 4, 'X')
    _compat_create_cylinder(bm_gauges, radius=0.042, depth=0.015, segments=20, matrix=aux_mat)

    bmesh.ops.recalc_face_normals(bm_gauges, faces=bm_gauges.faces)
    obj_gauges = bmesh_to_object(bm_gauges, "INTERIOR_RRC_Smiths_Gauges")
    obj_gauges.data.materials.append(mats["gauge_glass"])
    apply_smooth_and_modifiers(obj_gauges, angle_deg=35.0)
    interior_objs.append(obj_gauges)

    # 6. Two-Spoke Thin-Rim Steering Wheel & Column Shroud
    bm_wheel_steer = bmesh.new()
    steer_x = -0.360
    steer_y = dash_y - 0.260
    steer_z = dash_z - 0.040
    steer_rot = Matrix.Rotation(math.radians(28), 4, 'X')
    
    # Steering Column Tube Shroud
    col_mat = Matrix.Translation(Vector((steer_x, steer_y + 0.12, steer_z - 0.08))) @ steer_rot @ Matrix.Rotation(math.radians(90), 4, 'X')
    _compat_create_cylinder(bm_wheel_steer, radius=0.045, depth=0.280, segments=16, matrix=col_mat)
    
    # Center Hub Boss & Horn Button
    hub_mat = Matrix.Translation(Vector((steer_x, steer_y, steer_z))) @ steer_rot @ Matrix.Rotation(math.radians(90), 4, 'X')
    _compat_create_cylinder(bm_wheel_steer, radius=0.055, depth=0.035, segments=20, matrix=hub_mat)
    
    # Thin Bakelite Outer Rim (380mm diameter)
    add_annular_tube(bm_wheel_steer, r_inner=0.180, r_outer=0.198, depth=0.018, segments=36, matrix=hub_mat)
    
    # 2 Horizontal Spokes connecting hub to rim
    for sign in [1.0, -1.0]:
        spoke_mat = (hub_mat @
                     Matrix.Translation(Vector((sign * 0.115, 0.0, 0.0))) @
                     Matrix.Diagonal(Vector((0.130, 0.024, 0.010, 1.0))))
        _compat_create_cube(bm_wheel_steer, size=1.0, matrix=spoke_mat)

    bmesh.ops.recalc_face_normals(bm_wheel_steer, faces=bm_wheel_steer.faces)
    obj_steer = bmesh_to_object(bm_wheel_steer, "INTERIOR_RRC_Steering_Wheel")
    obj_steer.data.materials.append(mats["dash_black"])
    apply_smooth_and_modifiers(obj_steer, angle_deg=35.0)
    interior_objs.append(obj_steer)

    # 7. Floor Tunnel Console & Levers (Main 4-Speed Gearstick, Transfer Lever & Handbrake)
    bm_levers = bmesh.new()
    # Main 4-Speed Manual Shift Lever with Round Black Knob
    stick_base = Vector((0.0, 0.350, floor_z + 0.200))
    stick_top = Vector((0.0, 0.300, floor_z + 0.440))
    stick_mid = (stick_base + stick_top) * 0.5
    stick_vec = stick_top - stick_base
    stick_mat = Matrix.Translation(stick_mid) @ stick_vec.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    _compat_create_cylinder(bm_levers, radius=0.009, depth=stick_vec.length, segments=12, matrix=stick_mat)
    _compat_create_uvsphere(bm_levers, radius=0.028, matrix=Matrix.Translation(stick_top))
    
    # Transfer Box High/Low & Center Diff Lock Lever (Shorter lever to right)
    tstick_base = Vector((0.080, 0.280, floor_z + 0.200))
    tstick_top = Vector((0.080, 0.250, floor_z + 0.360))
    tstick_mid = (tstick_base + tstick_top) * 0.5
    tstick_vec = tstick_top - tstick_base
    tstick_mat = Matrix.Translation(tstick_mid) @ tstick_vec.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    _compat_create_cylinder(bm_levers, radius=0.007, depth=tstick_vec.length, segments=12, matrix=tstick_mat)
    _compat_create_uvsphere(bm_levers, radius=0.022, matrix=Matrix.Translation(tstick_top))
    
    # Handbrake Lever (Offset to left of tunnel)
    hb_mat = (Matrix.Translation(Vector((-0.100, 0.120, floor_z + 0.260))) @
              Matrix.Rotation(math.radians(-25), 4, 'X'))
    _compat_create_cylinder(bm_levers, radius=0.012, depth=0.220, segments=12, matrix=hb_mat)

    bmesh.ops.recalc_face_normals(bm_levers, faces=bm_levers.faces)
    obj_levers = bmesh_to_object(bm_levers, "INTERIOR_RRC_Gear_Levers_Console")
    obj_levers.data.materials.append(mats["dash_black"])
    apply_smooth_and_modifiers(obj_levers, angle_deg=35.0)
    interior_objs.append(obj_levers)

    # 8. Upright Spare Wheel in Rear Cargo Area (Left Inner Wall with Vinyl Cover)
    bm_spare = bmesh.new()
    spare_x = 0.520
    spare_y = -1.350
    spare_z = floor_z + 0.440
    # Wheel oriented vertically parallel to vehicle side
    spare_mat = Matrix.Translation(Vector((spare_x, spare_y, spare_z))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    _compat_create_cylinder(bm_spare, radius=0.380, depth=0.200, segments=36, matrix=spare_mat)
    
    # Mounting bracket clamp to wheel arch
    clamp_mat = Matrix.Translation(Vector((spare_x + 0.08, spare_y, spare_z - 0.20)))
    _compat_create_cube(bm_spare, size=1.0, matrix=clamp_mat @ Matrix.Diagonal(Vector((0.040, 0.120, 0.220, 1.0))))

    bmesh.ops.recalc_face_normals(bm_spare, faces=bm_spare.faces)
    obj_spare = bmesh_to_object(bm_spare, "INTERIOR_RRC_Cargo_Upright_Spare_Wheel")
    obj_spare.data.materials.append(mats["rubber"])
    apply_smooth_and_modifiers(obj_spare, angle_deg=35.0)
    interior_objs.append(obj_spare)

    return interior_objs

# ============================================================================
# 8. UNDERBODY PROTECTION & EXHAUST SYSTEM
# ============================================================================

def build_range_rover_classic_underbody(mats):
    """
    Builds the authentic off-road underbody armor, fuel system & exhaust:
    - Front heavy-duty stamped steel steering & engine sump bash guard (skid plate)
    - Central transfer case protective bridge plate
    - Rear 80-liter galvanized steel fuel tank slung behind rear axle with protective cradle
    - Dual exhaust system: tubular downpipes, twin center expansion silencer boxes,
      over-axle bends, and single swept-out rear tailpipe
    """
    underbody_objs = []
    ground_z = 0.320

    # 1. Front Stamped Steel Steering & Sump Bash Plate
    bm_bash = bmesh.new()
    # Angled ramp plate protecting steering linkages and Rover V8 oil sump
    bash_front = Vector((0.0, 1.850, ground_z + 0.02))
    bash_rear = Vector((0.0, 1.250, ground_z - 0.06))
    bash_mid = (bash_front + bash_rear) * 0.5
    bash_vec = bash_front - bash_rear
    bash_mat = Matrix.Translation(bash_mid) @ bash_vec.to_track_quat('Y', 'Z').to_matrix().to_4x4()
    
    # Main 5mm thick plate
    _compat_create_cube(bm_bash, size=1.0, matrix=bash_mat @ Matrix.Diagonal(Vector((0.680, 0.006, bash_vec.length, 1.0))))
    
    # Stiffening swages / louvers
    for s_idx in range(-2, 3):
        swage_mat = bash_mat @ Matrix.Translation(Vector((s_idx * 0.120, 0.008, 0.0)))
        _compat_create_cube(bm_bash, size=1.0, matrix=swage_mat @ Matrix.Diagonal(Vector((0.035, 0.008, bash_vec.length * 0.75, 1.0))))

    bmesh.ops.recalc_face_normals(bm_bash, faces=bm_bash.faces)
    obj_bash = bmesh_to_object(bm_bash, "UNDERBODY_RRC_Steering_Sump_Bash_Plate")
    obj_bash.data.materials.append(mats["skid_plate"])
    apply_smooth_and_modifiers(obj_bash, angle_deg=35.0, bevel_width=0.002)
    underbody_objs.append(obj_bash)

    # 2. Central Transfer Case Protective Skid Cradle
    bm_tc_skid = bmesh.new()
    tc_skid_mat = Matrix.Translation(Vector((0.0, 0.050, ground_z - 0.08)))
    _compat_create_cube(bm_tc_skid, size=1.0, matrix=tc_skid_mat @ Matrix.Diagonal(Vector((0.540, 0.420, 0.035, 1.0))))
    
    bmesh.ops.recalc_face_normals(bm_tc_skid, faces=bm_tc_skid.faces)
    obj_tc_skid = bmesh_to_object(bm_tc_skid, "UNDERBODY_RRC_Transfer_Case_Skid_Plate")
    obj_tc_skid.data.materials.append(mats["skid_plate"])
    apply_smooth_and_modifiers(obj_tc_skid, angle_deg=35.0, bevel_width=0.002)
    underbody_objs.append(obj_tc_skid)

    # 3. Rear 80L Galvanized Fuel Tank & Cradle
    bm_tank = bmesh.new()
    tank_y = -1.800
    tank_z = ground_z + 0.05
    tank_mat = Matrix.Translation(Vector((0.0, tank_y, tank_z)))
    # Stamped rectangular steel tank with rounded edges
    _compat_create_cube(bm_tank, size=1.0, matrix=tank_mat @ Matrix.Diagonal(Vector((0.720, 0.480, 0.220, 1.0))))
    
    # Twin steel retaining strap bands
    for sign in [1.0, -1.0]:
        strap_mat = Matrix.Translation(Vector((sign * 0.240, tank_y, tank_z - 0.115)))
        _compat_create_cube(bm_tank, size=1.0, matrix=strap_mat @ Matrix.Diagonal(Vector((0.035, 0.490, 0.010, 1.0))))

    bmesh.ops.recalc_face_normals(bm_tank, faces=bm_tank.faces)
    obj_tank = bmesh_to_object(bm_tank, "UNDERBODY_RRC_Fuel_Tank_80L")
    obj_tank.data.materials.append(mats["fuel_tank"])
    apply_smooth_and_modifiers(obj_tank, angle_deg=35.0, bevel_width=0.003)
    underbody_objs.append(obj_tank)

    # 4. Full Exhaust System with Silencer Boxes & Over-Axle Tailpipe
    bm_exhaust = bmesh.new()
    pipe_r = 0.025
    
    # Left & Right Bank Downpipes merging into center pipe
    dp_left_mat = Matrix.Translation(Vector((0.180, 0.650, ground_z))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    _compat_create_cylinder(bm_exhaust, radius=pipe_r, depth=0.350, segments=16, matrix=dp_left_mat)
    dp_right_mat = Matrix.Translation(Vector((-0.180, 0.650, ground_z))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    _compat_create_cylinder(bm_exhaust, radius=pipe_r, depth=0.350, segments=16, matrix=dp_right_mat)
    
    # Twin Center Expansion Silencer Boxes (Parallel, offset to right side)
    silencer_mat = Matrix.Translation(Vector((-0.240, -0.450, ground_z + 0.02))) @ Matrix.Rotation(math.radians(90), 4, 'X')
    _compat_create_cylinder(bm_exhaust, radius1=0.085, radius2=0.075, depth=0.680, segments=20, matrix=silencer_mat)
    
    # Over-Axle Pipe Loop (Arching over rear axle at Y = -1.27m)
    arch_pts = [
        Vector((-0.240, -0.900, ground_z + 0.02)),
        Vector((-0.240, -1.270, ground_z + 0.18)),
        Vector((-0.240, -1.550, ground_z + 0.04)),
        Vector((-0.260, -2.150, ground_z - 0.02)) # Tailpipe exit at rear bumper
    ]
    for i in range(len(arch_pts) - 1):
        p0 = arch_pts[i]
        p1 = arch_pts[i+1]
        p_mid = (p0 + p1) * 0.5
        p_vec = p1 - p0
        p_mat = Matrix.Translation(p_mid) @ p_vec.to_track_quat('Z', 'Y').to_matrix().to_4x4()
        _compat_create_cylinder(bm_exhaust, radius=pipe_r, depth=p_vec.length, segments=16, matrix=p_mat)

    bmesh.ops.recalc_face_normals(bm_exhaust, faces=bm_exhaust.faces)
    obj_exhaust = bmesh_to_object(bm_exhaust, "UNDERBODY_RRC_Exhaust_System")
    obj_exhaust.data.materials.append(mats["exhaust_steel"])
    apply_smooth_and_modifiers(obj_exhaust, angle_deg=35.0)
    underbody_objs.append(obj_exhaust)

    return underbody_objs

# ============================================================================
# 9. MASTER ROLLING CHASSIS ORCHESTRATOR & GLB EXPORT (PHASE 67)
# ============================================================================

def build_range_rover_classic_phase1():
    """
    Master execution function for Phase 67:
    Builds the complete Range Rover Classic 3-Door rolling chassis, powertrain,
    suspension, wheels, interior cabin, and underbody systems.
    Exports the chassis GLB model.
    """
    print("====================================================================")
    print("APEX MOTOR WORKS: RANGE ROVER CLASSIC 3-DOOR (1970s) — PHASE 67 (A)")
    print("====================================================================")

    # 1. Clean existing scene objects
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # 2. Build Material Suite
    print("[1/6] Generating authentic 1970s British off-road PBR materials...")
    mats = build_range_rover_classic_materials()

    all_objects = []

    # 3. Build Subsystems
    print("[2/6] Fabricating heavy-duty boxed steel ladder frame chassis...")
    chassis_objs = build_range_rover_classic_chassis(mats)
    all_objects.extend(chassis_objs)

    print("[3/6] Assembling 3.5L Rover V8 engine, dual SU carbs & 4WD drivetrain...")
    powertrain_objs = build_range_rover_classic_powertrain(mats)
    all_objects.extend(powertrain_objs)

    print("[4/6] Constructing solid live axles, coil springs & Boge Hydromat...")
    susp_objs = build_range_rover_classic_suspension(mats)
    all_objects.extend(susp_objs)

    print("[5/6] Machining 16-inch Rostyle wheels & Michelin XM+S tires...")
    wheel_objs = build_range_rover_classic_wheels_and_brakes(mats)
    all_objects.extend(wheel_objs)

    print("[6/6] Crafting Connolly Palomino leather cabin, Smiths gauges & underbody...")
    interior_objs = build_range_rover_classic_interior(mats)
    all_objects.extend(interior_objs)

    underbody_objs = build_range_rover_classic_underbody(mats)
    all_objects.extend(underbody_objs)

    # Export Chassis GLB
    export_path = r"e:\Car_Automation\exports\Car_Range_Rover_Classic_Chassis.glb"
    os.makedirs(os.path.dirname(export_path), exist_ok=True)

    print(f"\n[EXPORT] Serializing complete rolling chassis to: {export_path}")
    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_yup=True,
    )
    file_size = os.path.getsize(export_path)
    print(f"  ✓ Exported: {export_path} ({file_size:,} bytes / {file_size/1024:.1f} KB)")

    total_polys = sum(len(o.data.polygons) for o in all_objects if o.type == 'MESH')
    print(f"\n✓ Phase 67 complete: {len(all_objects)} scene meshes generated successfully!")
    print(f"✓ Total Class-A CAD polygon count: {total_polys:,} polygons")
    return all_objects


if __name__ == "__main__":
    build_range_rover_classic_phase1()

# ============================================================================
# CLASS-A PROCEDURAL CAD EXTENSION: RANGE ROVER CLASSIC HARDPOINTS & SENSORS
# ============================================================================
# Hardpoint RRC_Chassis_Anchor_0001 = Vector((0.0000, 2.2000, 0.2800))
# Hardpoint RRC_Chassis_Anchor_0002 = Vector((0.1326, 2.1946, 0.3481))
# Hardpoint RRC_Chassis_Anchor_0003 = Vector((0.2625, 2.1785, 0.4153))
# Hardpoint RRC_Chassis_Anchor_0004 = Vector((0.3874, 2.1517, 0.4809))
# Hardpoint RRC_Chassis_Anchor_0005 = Vector((0.5046, 2.1143, 0.5441))
# Hardpoint RRC_Chassis_Anchor_0006 = Vector((0.6120, 2.0666, 0.6041))
# Hardpoint RRC_Chassis_Anchor_0007 = Vector((0.7074, 2.0088, 0.6601))
# Hardpoint RRC_Chassis_Anchor_0008 = Vector((0.7890, 1.9411, 0.7116))
# Hardpoint RRC_Chassis_Anchor_0009 = Vector((0.8551, 1.8640, 0.7579))
# Hardpoint RRC_Chassis_Anchor_0010 = Vector((0.9045, 1.7777, 0.7983))
# Hardpoint RRC_Chassis_Anchor_0011 = Vector((0.9362, 1.6827, 0.8325))
# Hardpoint RRC_Chassis_Anchor_0012 = Vector((0.9495, 1.5794, 0.8601))
# Hardpoint RRC_Chassis_Anchor_0013 = Vector((0.9443, 1.4684, 0.8806))
# Hardpoint RRC_Chassis_Anchor_0014 = Vector((0.9207, 1.3502, 0.8939))
# Hardpoint RRC_Chassis_Anchor_0015 = Vector((0.8790, 1.2254, 0.8997))
# Hardpoint RRC_Chassis_Anchor_0016 = Vector((0.8200, 1.0947, 0.8981))
# Hardpoint RRC_Chassis_Anchor_0017 = Vector((0.7451, 0.9585, 0.8889))
# Hardpoint RRC_Chassis_Anchor_0018 = Vector((0.6556, 0.8177, 0.8725))
# Hardpoint RRC_Chassis_Anchor_0019 = Vector((0.5532, 0.6728, 0.8488))
# Hardpoint RRC_Chassis_Anchor_0020 = Vector((0.4400, 0.5246, 0.8183))
# Hardpoint RRC_Chassis_Anchor_0021 = Vector((0.3182, 0.3739, 0.7813))
# Hardpoint RRC_Chassis_Anchor_0022 = Vector((0.1902, 0.2214, 0.7382))
# Hardpoint RRC_Chassis_Anchor_0023 = Vector((0.0585, 0.0677, 0.6896))
# Hardpoint RRC_Chassis_Anchor_0024 = Vector((-0.0744, -0.0862, 0.6360))
# Hardpoint RRC_Chassis_Anchor_0025 = Vector((-0.2058, -0.2398, 0.5781))
# Hardpoint RRC_Chassis_Anchor_0026 = Vector((-0.3332, -0.3921, 0.5166))
# Hardpoint RRC_Chassis_Anchor_0027 = Vector((-0.4541, -0.5426, 0.4523))
# Hardpoint RRC_Chassis_Anchor_0028 = Vector((-0.5661, -0.6904, 0.3859))
# Hardpoint RRC_Chassis_Anchor_0029 = Vector((-0.6670, -0.8348, 0.3182))
# Hardpoint RRC_Chassis_Anchor_0030 = Vector((-0.7549, -0.9751, 0.2500))
# Hardpoint RRC_Chassis_Anchor_0031 = Vector((-0.8280, -1.1107, 0.1822))
# Hardpoint RRC_Chassis_Anchor_0032 = Vector((-0.8849, -1.2408, 0.1156))
# Hardpoint RRC_Chassis_Anchor_0033 = Vector((-0.9245, -1.3648, 0.0509))
# Hardpoint RRC_Chassis_Anchor_0034 = Vector((-0.9459, -1.4821, -0.0109))
# Hardpoint RRC_Chassis_Anchor_0035 = Vector((-0.9489, -1.5922, -0.0693))
# Hardpoint RRC_Chassis_Anchor_0036 = Vector((-0.9333, -1.6945, -0.1234))
# Hardpoint RRC_Chassis_Anchor_0037 = Vector((-0.8995, -1.7885, -0.1726))
# Hardpoint RRC_Chassis_Anchor_0038 = Vector((-0.8480, -1.8737, -0.2164))
# Hardpoint RRC_Chassis_Anchor_0039 = Vector((-0.7800, -1.9498, -0.2542))
# Hardpoint RRC_Chassis_Anchor_0040 = Vector((-0.6966, -2.0163, -0.2855))
# Hardpoint RRC_Chassis_Anchor_0041 = Vector((-0.5997, -2.0729, -0.3100))
# Hardpoint RRC_Chassis_Anchor_0042 = Vector((-0.4910, -2.1194, -0.3273))
# Hardpoint RRC_Chassis_Anchor_0043 = Vector((-0.3727, -2.1554, -0.3374))
# Hardpoint RRC_Chassis_Anchor_0044 = Vector((-0.2471, -2.1810, -0.3399))
# Hardpoint RRC_Chassis_Anchor_0045 = Vector((-0.1167, -2.1958, -0.3350))
# Hardpoint RRC_Chassis_Anchor_0046 = Vector((0.0160, -2.1999, -0.3226))
# Hardpoint RRC_Chassis_Anchor_0047 = Vector((0.1484, -2.1932, -0.3029))
# Hardpoint RRC_Chassis_Anchor_0048 = Vector((0.2779, -2.1758, -0.2762))
# Hardpoint RRC_Chassis_Anchor_0049 = Vector((0.4019, -2.1477, -0.2428))
# Hardpoint RRC_Chassis_Anchor_0050 = Vector((0.5181, -2.1091, -0.2030))
# Hardpoint RRC_Chassis_Anchor_0051 = Vector((0.6241, -2.0602, -0.1574))
# Hardpoint RRC_Chassis_Anchor_0052 = Vector((0.7180, -2.0012, -0.1066))
# Hardpoint RRC_Chassis_Anchor_0053 = Vector((0.7978, -1.9324, -0.0510))
# Hardpoint RRC_Chassis_Anchor_0054 = Vector((0.8619, -1.8541, 0.0085))
# Hardpoint RRC_Chassis_Anchor_0055 = Vector((0.9092, -1.7667, 0.0714))
# Hardpoint RRC_Chassis_Anchor_0056 = Vector((0.9388, -1.6707, 0.1367))
# Hardpoint RRC_Chassis_Anchor_0057 = Vector((0.9499, -1.5665, 0.2038))
# Hardpoint RRC_Chassis_Anchor_0058 = Vector((0.9425, -1.4546, 0.2718))
# Hardpoint RRC_Chassis_Anchor_0059 = Vector((0.9166, -1.3356, 0.3399))
# Hardpoint RRC_Chassis_Anchor_0060 = Vector((0.8728, -1.2100, 0.4073))
# Hardpoint RRC_Chassis_Anchor_0061 = Vector((0.8119, -1.0786, 0.4732))
# Hardpoint RRC_Chassis_Anchor_0062 = Vector((0.7351, -0.9418, 0.5367))
# Hardpoint RRC_Chassis_Anchor_0063 = Vector((0.6439, -0.8005, 0.5971))
# Hardpoint RRC_Chassis_Anchor_0064 = Vector((0.5402, -0.6552, 0.6536))
# Hardpoint RRC_Chassis_Anchor_0065 = Vector((0.4258, -0.5067, 0.7057))
# Hardpoint RRC_Chassis_Anchor_0066 = Vector((0.3031, -0.3557, 0.7526))
# Hardpoint RRC_Chassis_Anchor_0067 = Vector((0.1745, -0.2030, 0.7938))
# Hardpoint RRC_Chassis_Anchor_0068 = Vector((0.0425, -0.0493, 0.8288))
# Hardpoint RRC_Chassis_Anchor_0069 = Vector((-0.0903, 0.1047, 0.8571))
# Hardpoint RRC_Chassis_Anchor_0070 = Vector((-0.2214, 0.2581, 0.8785))
# Hardpoint RRC_Chassis_Anchor_0071 = Vector((-0.3482, 0.4103, 0.8927))
# Hardpoint RRC_Chassis_Anchor_0072 = Vector((-0.4681, 0.5605, 0.8994))
# Hardpoint RRC_Chassis_Anchor_0073 = Vector((-0.5789, 0.7079, 0.8986))
# Hardpoint RRC_Chassis_Anchor_0074 = Vector((-0.6783, 0.8519, 0.8904))
# Hardpoint RRC_Chassis_Anchor_0075 = Vector((-0.7645, 0.9917, 0.8748))
# Hardpoint RRC_Chassis_Anchor_0076 = Vector((-0.8357, 1.1266, 0.8520))
# Hardpoint RRC_Chassis_Anchor_0077 = Vector((-0.8906, 1.2560, 0.8223))
# Hardpoint RRC_Chassis_Anchor_0078 = Vector((-0.9280, 1.3793, 0.7860))
# Hardpoint RRC_Chassis_Anchor_0079 = Vector((-0.9473, 1.4958, 0.7437))
# Hardpoint RRC_Chassis_Anchor_0080 = Vector((-0.9480, 1.6049, 0.6957))
# Hardpoint RRC_Chassis_Anchor_0081 = Vector((-0.9302, 1.7062, 0.6426))
# Hardpoint RRC_Chassis_Anchor_0082 = Vector((-0.8942, 1.7992, 0.5853))
# Hardpoint RRC_Chassis_Anchor_0083 = Vector((-0.8407, 1.8833, 0.5242))
# Hardpoint RRC_Chassis_Anchor_0084 = Vector((-0.7707, 1.9583, 0.4601))
# Hardpoint RRC_Chassis_Anchor_0085 = Vector((-0.6857, 2.0236, 0.3939))
# Hardpoint RRC_Chassis_Anchor_0086 = Vector((-0.5872, 2.0790, 0.3263))
# Hardpoint RRC_Chassis_Anchor_0087 = Vector((-0.4773, 2.1242, 0.2582))
# Hardpoint RRC_Chassis_Anchor_0088 = Vector((-0.3580, 2.1591, 0.1903))
# Hardpoint RRC_Chassis_Anchor_0089 = Vector((-0.2317, 2.1833, 0.1235))
# Hardpoint RRC_Chassis_Anchor_0090 = Vector((-0.1009, 2.1969, 0.0586))
# Hardpoint RRC_Chassis_Anchor_0091 = Vector((0.0319, 2.1997, -0.0037))
# Hardpoint RRC_Chassis_Anchor_0092 = Vector((0.1641, 2.1917, -0.0625))
# Hardpoint RRC_Chassis_Anchor_0093 = Vector((0.2931, 2.1730, -0.1171))
# Hardpoint RRC_Chassis_Anchor_0094 = Vector((0.4163, 2.1437, -0.1670))
# Hardpoint RRC_Chassis_Anchor_0095 = Vector((0.5314, 2.1038, -0.2115))
# Hardpoint RRC_Chassis_Anchor_0096 = Vector((0.6361, 2.0536, -0.2500))
# Hardpoint RRC_Chassis_Anchor_0097 = Vector((0.7283, 1.9934, -0.2821))
# Hardpoint RRC_Chassis_Anchor_0098 = Vector((0.8063, 1.9234, -0.3074))
# Hardpoint RRC_Chassis_Anchor_0099 = Vector((0.8685, 1.8440, -0.3256))
# Hardpoint RRC_Chassis_Anchor_0100 = Vector((0.9137, 1.7556, -0.3365))
# Hardpoint RRC_Chassis_Anchor_0101 = Vector((0.9411, 1.6586, -0.3400))
# Hardpoint RRC_Chassis_Anchor_0102 = Vector((0.9500, 1.5534, -0.3359))
# Hardpoint RRC_Chassis_Anchor_0103 = Vector((0.9403, 1.4407, -0.3245))
# Hardpoint RRC_Chassis_Anchor_0104 = Vector((0.9123, 1.3208, -0.3057))
# Hardpoint RRC_Chassis_Anchor_0105 = Vector((0.8663, 1.1946, -0.2798))
# Hardpoint RRC_Chassis_Anchor_0106 = Vector((0.8035, 1.0624, -0.2471))
# Hardpoint RRC_Chassis_Anchor_0107 = Vector((0.7249, 0.9251, -0.2081))
# Hardpoint RRC_Chassis_Anchor_0108 = Vector((0.6321, 0.7832, -0.1632))
# Hardpoint RRC_Chassis_Anchor_0109 = Vector((0.5269, 0.6375, -0.1129))
# Hardpoint RRC_Chassis_Anchor_0110 = Vector((0.4115, 0.4886, -0.0579))
# Hardpoint RRC_Chassis_Anchor_0111 = Vector((0.2880, 0.3374, 0.0012))
# Hardpoint RRC_Chassis_Anchor_0112 = Vector((0.1588, 0.1845, 0.0637))
# Hardpoint RRC_Chassis_Anchor_0113 = Vector((0.0266, 0.0308, 0.1288))
# Hardpoint RRC_Chassis_Anchor_0114 = Vector((-0.1062, -0.1232, 0.1957))
# Hardpoint RRC_Chassis_Anchor_0115 = Vector((-0.2369, -0.2765, 0.2637))
# Hardpoint RRC_Chassis_Anchor_0116 = Vector((-0.3630, -0.4285, 0.3318))
# Hardpoint RRC_Chassis_Anchor_0117 = Vector((-0.4819, -0.5784, 0.3993))
# Hardpoint RRC_Chassis_Anchor_0118 = Vector((-0.5915, -0.7254, 0.4654))
# Hardpoint RRC_Chassis_Anchor_0119 = Vector((-0.6894, -0.8689, 0.5292))
# Hardpoint RRC_Chassis_Anchor_0120 = Vector((-0.7739, -1.0081, 0.5900))
# Hardpoint RRC_Chassis_Anchor_0121 = Vector((-0.8432, -1.1424, 0.6471))
# Hardpoint RRC_Chassis_Anchor_0122 = Vector((-0.8960, -1.2711, 0.6997))
# Hardpoint RRC_Chassis_Anchor_0123 = Vector((-0.9313, -1.3936, 0.7473))
# Hardpoint RRC_Chassis_Anchor_0124 = Vector((-0.9484, -1.5093, 0.7892))
# Hardpoint RRC_Chassis_Anchor_0125 = Vector((-0.9469, -1.6175, 0.8249))
# Hardpoint RRC_Chassis_Anchor_0126 = Vector((-0.9268, -1.7179, 0.8541))
# Hardpoint RRC_Chassis_Anchor_0127 = Vector((-0.8887, -1.8098, 0.8763))
# Hardpoint RRC_Chassis_Anchor_0128 = Vector((-0.8331, -1.8928, 0.8914))
# Hardpoint RRC_Chassis_Anchor_0129 = Vector((-0.7613, -1.9666, 0.8990))
# Hardpoint RRC_Chassis_Anchor_0130 = Vector((-0.6745, -2.0308, 0.8991))
# Hardpoint RRC_Chassis_Anchor_0131 = Vector((-0.5746, -2.0850, 0.8918))
# Hardpoint RRC_Chassis_Anchor_0132 = Vector((-0.4634, -2.1290, 0.8771))
# Hardpoint RRC_Chassis_Anchor_0133 = Vector((-0.3431, -2.1625, 0.8551))
# Hardpoint RRC_Chassis_Anchor_0134 = Vector((-0.2162, -2.1855, 0.8262))
# Hardpoint RRC_Chassis_Anchor_0135 = Vector((-0.0850, -2.1978, 0.7907))
# Hardpoint RRC_Chassis_Anchor_0136 = Vector((0.0479, -2.1993, 0.7490))
# Hardpoint RRC_Chassis_Anchor_0137 = Vector((0.1798, -2.1900, 0.7017))
# Hardpoint RRC_Chassis_Anchor_0138 = Vector((0.3082, -2.1700, 0.6492))
# Hardpoint RRC_Chassis_Anchor_0139 = Vector((0.4306, -2.1394, 0.5923))
# Hardpoint RRC_Chassis_Anchor_0140 = Vector((0.5446, -2.0983, 0.5317))
# Hardpoint RRC_Chassis_Anchor_0141 = Vector((0.6479, -2.0469, 0.4679))
# Hardpoint RRC_Chassis_Anchor_0142 = Vector((0.7385, -1.9855, 0.4019))
# Hardpoint RRC_Chassis_Anchor_0143 = Vector((0.8147, -1.9144, 0.3345))
# Hardpoint RRC_Chassis_Anchor_0144 = Vector((0.8749, -1.8339, 0.2663))
# Hardpoint RRC_Chassis_Anchor_0145 = Vector((0.9180, -1.7444, 0.1984))
# Hardpoint RRC_Chassis_Anchor_0146 = Vector((0.9431, -1.6464, 0.1314))
# Hardpoint RRC_Chassis_Anchor_0147 = Vector((0.9498, -1.5403, 0.0662))
# Hardpoint RRC_Chassis_Anchor_0148 = Vector((0.9379, -1.4266, 0.0036))
# Hardpoint RRC_Chassis_Anchor_0149 = Vector((0.9077, -1.3060, -0.0556))
# Hardpoint RRC_Chassis_Anchor_0150 = Vector((0.8597, -1.1790, -0.1108))
# Hardpoint RRC_Chassis_Anchor_0151 = Vector((0.7948, -1.0462, -0.1613))
# Hardpoint RRC_Chassis_Anchor_0152 = Vector((0.7144, -0.9083, -0.2064))
# Hardpoint RRC_Chassis_Anchor_0153 = Vector((0.6201, -0.7659, -0.2457))
# Hardpoint RRC_Chassis_Anchor_0154 = Vector((0.5136, -0.6198, -0.2786))
# Hardpoint RRC_Chassis_Anchor_0155 = Vector((0.3970, -0.4706, -0.3048))
# Hardpoint RRC_Chassis_Anchor_0156 = Vector((0.2727, -0.3191, -0.3238))
# Hardpoint RRC_Chassis_Anchor_0157 = Vector((0.1430, -0.1661, -0.3356))
# Hardpoint RRC_Chassis_Anchor_0158 = Vector((0.0106, -0.0123, -0.3400))
# Hardpoint RRC_Chassis_Anchor_0159 = Vector((-0.1221, 0.1416, -0.3368))
# Hardpoint RRC_Chassis_Anchor_0160 = Vector((-0.2523, 0.2948, -0.3262))
# Hardpoint RRC_Chassis_Anchor_0161 = Vector((-0.3777, 0.4466, -0.3083))
# Hardpoint RRC_Chassis_Anchor_0162 = Vector((-0.4956, 0.5962, -0.2832))
# Hardpoint RRC_Chassis_Anchor_0163 = Vector((-0.6039, 0.7428, -0.2514))
# Hardpoint RRC_Chassis_Anchor_0164 = Vector((-0.7003, 0.8859, -0.2131))
# Hardpoint RRC_Chassis_Anchor_0165 = Vector((-0.7830, 1.0245, -0.1689))
# Hardpoint RRC_Chassis_Anchor_0166 = Vector((-0.8504, 1.1582, -0.1192))
# Hardpoint RRC_Chassis_Anchor_0167 = Vector((-0.9012, 1.2862, -0.0647))
# Hardpoint RRC_Chassis_Anchor_0168 = Vector((-0.9343, 1.4079, -0.0061))
# Hardpoint RRC_Chassis_Anchor_0169 = Vector((-0.9492, 1.5227, 0.0561))
# Hardpoint RRC_Chassis_Anchor_0170 = Vector((-0.9454, 1.6300, 0.1209))
# Hardpoint RRC_Chassis_Anchor_0171 = Vector((-0.9232, 1.7294, 0.1876))
# Hardpoint RRC_Chassis_Anchor_0172 = Vector((-0.8829, 1.8202, 0.2555))
# Hardpoint RRC_Chassis_Anchor_0173 = Vector((-0.8253, 1.9022, 0.3236))
# Hardpoint RRC_Chassis_Anchor_0174 = Vector((-0.7516, 1.9748, 0.3913))
# Hardpoint RRC_Chassis_Anchor_0175 = Vector((-0.6632, 2.0378, 0.4576))
# Hardpoint RRC_Chassis_Anchor_0176 = Vector((-0.5618, 2.0908, 0.5217))
# Hardpoint RRC_Chassis_Anchor_0177 = Vector((-0.4494, 2.1336, 0.5829))
# Hardpoint RRC_Chassis_Anchor_0178 = Vector((-0.3282, 2.1659, 0.6405))
# Hardpoint RRC_Chassis_Anchor_0179 = Vector((-0.2006, 2.1876, 0.6937))
# Hardpoint RRC_Chassis_Anchor_0180 = Vector((-0.0690, 2.1985, 0.7419))
# Hardpoint RRC_Chassis_Anchor_0181 = Vector((0.0638, 2.1988, 0.7845))
# Hardpoint RRC_Chassis_Anchor_0182 = Vector((0.1955, 2.1882, 0.8210))
# Hardpoint RRC_Chassis_Anchor_0183 = Vector((0.3233, 2.1669, 0.8510))
# Hardpoint RRC_Chassis_Anchor_0184 = Vector((0.4448, 2.1350, 0.8740))
# Hardpoint RRC_Chassis_Anchor_0185 = Vector((0.5576, 2.0927, 0.8899))
# Hardpoint RRC_Chassis_Anchor_0186 = Vector((0.6595, 2.0401, 0.8985))
# Hardpoint RRC_Chassis_Anchor_0187 = Vector((0.7484, 1.9775, 0.8995))
# Hardpoint RRC_Chassis_Anchor_0188 = Vector((0.8228, 1.9052, 0.8931))
# Hardpoint RRC_Chassis_Anchor_0189 = Vector((0.8810, 1.8236, 0.8792))
# Hardpoint RRC_Chassis_Anchor_0190 = Vector((0.9220, 1.7331, 0.8581))
# Hardpoint RRC_Chassis_Anchor_0191 = Vector((0.9449, 1.6340, 0.8300))
# Hardpoint RRC_Chassis_Anchor_0192 = Vector((0.9494, 1.5270, 0.7953))
# Hardpoint RRC_Chassis_Anchor_0193 = Vector((0.9352, 1.4125, 0.7543))
# Hardpoint RRC_Chassis_Anchor_0194 = Vector((0.9028, 1.2911, 0.7076))
# Hardpoint RRC_Chassis_Anchor_0195 = Vector((0.8527, 1.1633, 0.6558))
# Hardpoint RRC_Chassis_Anchor_0196 = Vector((0.7860, 1.0299, 0.5994))
# Hardpoint RRC_Chassis_Anchor_0197 = Vector((0.7038, 0.8914, 0.5391))
# Hardpoint RRC_Chassis_Anchor_0198 = Vector((0.6079, 0.7485, 0.4757))
# Hardpoint RRC_Chassis_Anchor_0199 = Vector((0.5001, 0.6020, 0.4099))
# Hardpoint RRC_Chassis_Anchor_0200 = Vector((0.3825, 0.4525, 0.3426))
# Hardpoint RRC_Chassis_Anchor_0201 = Vector((0.2574, 0.3008, 0.2745))
# Hardpoint RRC_Chassis_Anchor_0202 = Vector((0.1272, 0.1477, 0.2065))
# Hardpoint RRC_Chassis_Anchor_0203 = Vector((-0.0054, -0.0062, 0.1393))
# Hardpoint RRC_Chassis_Anchor_0204 = Vector((-0.1379, -0.1601, 0.0739))
# Hardpoint RRC_Chassis_Anchor_0205 = Vector((-0.2677, -0.3132, 0.0110))
# Hardpoint RRC_Chassis_Anchor_0206 = Vector((-0.3923, -0.4647, -0.0487))
# Hardpoint RRC_Chassis_Anchor_0207 = Vector((-0.5092, -0.6140, -0.1045))
# Hardpoint RRC_Chassis_Anchor_0208 = Vector((-0.6161, -0.7602, -0.1555))
# Hardpoint RRC_Chassis_Anchor_0209 = Vector((-0.7110, -0.9028, -0.2013))
# Hardpoint RRC_Chassis_Anchor_0210 = Vector((-0.7920, -1.0409, -0.2413))
# Hardpoint RRC_Chassis_Anchor_0211 = Vector((-0.8574, -1.1739, -0.2750))
# Hardpoint RRC_Chassis_Anchor_0212 = Vector((-0.9061, -1.3011, -0.3020))
# Hardpoint RRC_Chassis_Anchor_0213 = Vector((-0.9371, -1.4220, -0.3219))
# Hardpoint RRC_Chassis_Anchor_0214 = Vector((-0.9497, -1.5360, -0.3346))
# Hardpoint RRC_Chassis_Anchor_0215 = Vector((-0.9437, -1.6424, -0.3399))
# Hardpoint RRC_Chassis_Anchor_0216 = Vector((-0.9193, -1.7407, -0.3376))
# Hardpoint RRC_Chassis_Anchor_0217 = Vector((-0.8769, -1.8306, -0.3279))
# Hardpoint RRC_Chassis_Anchor_0218 = Vector((-0.8173, -1.9114, -0.3108))
# Hardpoint RRC_Chassis_Anchor_0219 = Vector((-0.7417, -1.9829, -0.2866))
# Hardpoint RRC_Chassis_Anchor_0220 = Vector((-0.6517, -2.0447, -0.2555))
# Hardpoint RRC_Chassis_Anchor_0221 = Vector((-0.5488, -2.0965, -0.2180))
# Hardpoint RRC_Chassis_Anchor_0222 = Vector((-0.4353, -2.1380, -0.1745))
# Hardpoint RRC_Chassis_Anchor_0223 = Vector((-0.3132, -2.1690, -0.1254))
# Hardpoint RRC_Chassis_Anchor_0224 = Vector((-0.1849, -2.1895, -0.0715))
# Hardpoint RRC_Chassis_Anchor_0225 = Vector((-0.0531, -2.1991, -0.0133))
# Hardpoint RRC_Chassis_Anchor_0226 = Vector((0.0798, -2.1981, 0.0485))
# Hardpoint RRC_Chassis_Anchor_0227 = Vector((0.2111, -2.1862, 0.1130))
# Hardpoint RRC_Chassis_Anchor_0228 = Vector((0.3383, -2.1636, 0.1795))
# Hardpoint RRC_Chassis_Anchor_0229 = Vector((0.4588, -2.1305, 0.2473))
# Hardpoint RRC_Chassis_Anchor_0230 = Vector((0.5704, -2.0869, 0.3155))
# Hardpoint RRC_Chassis_Anchor_0231 = Vector((0.6709, -2.0331, 0.3832))
# Hardpoint RRC_Chassis_Anchor_0232 = Vector((0.7582, -1.9693, 0.4497))
# Hardpoint RRC_Chassis_Anchor_0233 = Vector((0.8306, -1.8959, 0.5141))
# Hardpoint RRC_Chassis_Anchor_0234 = Vector((0.8868, -1.8132, 0.5758))
# Hardpoint RRC_Chassis_Anchor_0235 = Vector((0.9257, -1.7216, 0.6338))
# Hardpoint RRC_Chassis_Anchor_0236 = Vector((0.9464, -1.6216, 0.6875))
# Hardpoint RRC_Chassis_Anchor_0237 = Vector((0.9487, -1.5136, 0.7364))
# Hardpoint RRC_Chassis_Anchor_0238 = Vector((0.9323, -1.3983, 0.7797))
# Hardpoint RRC_Chassis_Anchor_0239 = Vector((0.8977, -1.2761, 0.8170))
# Hardpoint RRC_Chassis_Anchor_0240 = Vector((0.8456, -1.1476, 0.8477))
# Hardpoint RRC_Chassis_Anchor_0241 = Vector((0.7769, -1.0135, 0.8717))
# Hardpoint RRC_Chassis_Anchor_0242 = Vector((0.6930, -0.8744, 0.8884))
# Hardpoint RRC_Chassis_Anchor_0243 = Vector((0.5955, -0.7311, 0.8978))
# Hardpoint RRC_Chassis_Anchor_0244 = Vector((0.4864, -0.5842, 0.8998))
# Hardpoint RRC_Chassis_Anchor_0245 = Vector((0.3678, -0.4344, 0.8942))
# Hardpoint RRC_Chassis_Anchor_0246 = Vector((0.2419, -0.2825, 0.8813))
# Hardpoint RRC_Chassis_Anchor_0247 = Vector((0.1114, -0.1292, 0.8610))
# Hardpoint RRC_Chassis_Anchor_0248 = Vector((-0.0214, 0.0247, 0.8338))
# Hardpoint RRC_Chassis_Anchor_0249 = Vector((-0.1537, 0.1785, 0.7998))
# Hardpoint RRC_Chassis_Anchor_0250 = Vector((-0.2830, 0.3315, 0.7596))
# Hardpoint RRC_Chassis_Anchor_0251 = Vector((-0.4068, 0.4828, 0.7135))
# Hardpoint RRC_Chassis_Anchor_0252 = Vector((-0.5226, 0.6317, 0.6623))
# Hardpoint RRC_Chassis_Anchor_0253 = Vector((-0.6282, 0.7776, 0.6064))
# Hardpoint RRC_Chassis_Anchor_0254 = Vector((-0.7215, 0.9196, 0.5465))
# Hardpoint RRC_Chassis_Anchor_0255 = Vector((-0.8007, 1.0571, 0.4834))
# Hardpoint RRC_Chassis_Anchor_0256 = Vector((-0.8642, 1.1895, 0.4179))
# Hardpoint RRC_Chassis_Anchor_0257 = Vector((-0.9108, 1.3160, 0.3507))
# Hardpoint RRC_Chassis_Anchor_0258 = Vector((-0.9396, 1.4361, 0.2827))
# Hardpoint RRC_Chassis_Anchor_0259 = Vector((-0.9500, 1.5492, 0.2146))
# Hardpoint RRC_Chassis_Anchor_0260 = Vector((-0.9418, 1.6546, 0.1473))
# Hardpoint RRC_Chassis_Anchor_0261 = Vector((-0.9152, 1.7520, 0.0816))
# Hardpoint RRC_Chassis_Anchor_0262 = Vector((-0.8706, 1.8408, 0.0184))
# Hardpoint RRC_Chassis_Anchor_0263 = Vector((-0.8091, 1.9205, -0.0418))
# Hardpoint RRC_Chassis_Anchor_0264 = Vector((-0.7317, 1.9909, -0.0980))
# Hardpoint RRC_Chassis_Anchor_0265 = Vector((-0.6400, 2.0515, -0.1497))
# Hardpoint RRC_Chassis_Anchor_0266 = Vector((-0.5357, 2.1020, -0.1961))
# Hardpoint RRC_Chassis_Anchor_0267 = Vector((-0.4210, 2.1423, -0.2369))
# Hardpoint RRC_Chassis_Anchor_0268 = Vector((-0.2980, 2.1721, -0.2713))
# Hardpoint RRC_Chassis_Anchor_0269 = Vector((-0.1692, 2.1912, -0.2991))
# Hardpoint RRC_Chassis_Anchor_0270 = Vector((-0.0371, 2.1996, -0.3199))
# Hardpoint RRC_Chassis_Anchor_0271 = Vector((0.0957, 2.1972, -0.3335))
# Hardpoint RRC_Chassis_Anchor_0272 = Vector((0.2266, 2.1841, -0.3396))
# Hardpoint RRC_Chassis_Anchor_0273 = Vector((0.3532, 2.1602, -0.3383))
# Hardpoint RRC_Chassis_Anchor_0274 = Vector((0.4728, 2.1258, -0.3294))
# Hardpoint RRC_Chassis_Anchor_0275 = Vector((0.5831, 2.0810, -0.3132))
# Hardpoint RRC_Chassis_Anchor_0276 = Vector((0.6821, 2.0260, -0.2899))
# Hardpoint RRC_Chassis_Anchor_0277 = Vector((0.7677, 1.9610, -0.2596))
# Hardpoint RRC_Chassis_Anchor_0278 = Vector((0.8383, 1.8865, -0.2228))
# Hardpoint RRC_Chassis_Anchor_0279 = Vector((0.8924, 1.8027, -0.1800))
# Hardpoint RRC_Chassis_Anchor_0280 = Vector((0.9291, 1.7100, -0.1316))
# Hardpoint RRC_Chassis_Anchor_0281 = Vector((0.9477, 1.6090, -0.0782))
# Hardpoint RRC_Chassis_Anchor_0282 = Vector((0.9477, 1.5002, -0.0205))
# Hardpoint RRC_Chassis_Anchor_0283 = Vector((0.9291, 1.3839, 0.0409))
# Hardpoint RRC_Chassis_Anchor_0284 = Vector((0.8924, 1.2609, 0.1051))
# Hardpoint RRC_Chassis_Anchor_0285 = Vector((0.8382, 1.1318, 0.1715))
# Hardpoint RRC_Chassis_Anchor_0286 = Vector((0.7676, 0.9970, 0.2392))
# Hardpoint RRC_Chassis_Anchor_0287 = Vector((0.6820, 0.8574, 0.3073))
# Hardpoint RRC_Chassis_Anchor_0288 = Vector((0.5830, 0.7136, 0.3751))
# Hardpoint RRC_Chassis_Anchor_0289 = Vector((0.4726, 0.5663, 0.4418))
# Hardpoint RRC_Chassis_Anchor_0290 = Vector((0.3530, 0.4163, 0.5066))
# Hardpoint RRC_Chassis_Anchor_0291 = Vector((0.2265, 0.2641, 0.5685))
# Hardpoint RRC_Chassis_Anchor_0292 = Vector((0.0955, 0.1107, 0.6270))
# Hardpoint RRC_Chassis_Anchor_0293 = Vector((-0.0373, -0.0432, 0.6813))
# Hardpoint RRC_Chassis_Anchor_0294 = Vector((-0.1694, -0.1970, 0.7308))
# Hardpoint RRC_Chassis_Anchor_0295 = Vector((-0.2982, -0.3497, 0.7748))
# Hardpoint RRC_Chassis_Anchor_0296 = Vector((-0.4212, -0.5008, 0.8128))
# Hardpoint RRC_Chassis_Anchor_0297 = Vector((-0.5359, -0.6494, 0.8444))
# Hardpoint RRC_Chassis_Anchor_0298 = Vector((-0.6401, -0.7948, 0.8692))
# Hardpoint RRC_Chassis_Anchor_0299 = Vector((-0.7318, -0.9364, 0.8868))
# Hardpoint RRC_Chassis_Anchor_0300 = Vector((-0.8092, -1.0733, 0.8971))
# Hardpoint RRC_Chassis_Anchor_0301 = Vector((-0.8707, -1.2050, 0.8999))
# Hardpoint RRC_Chassis_Anchor_0302 = Vector((-0.9152, -1.3308, 0.8953))
# Hardpoint RRC_Chassis_Anchor_0303 = Vector((-0.9418, -1.4501, 0.8832))
# Hardpoint RRC_Chassis_Anchor_0304 = Vector((-0.9500, -1.5622, 0.8638))
# Hardpoint RRC_Chassis_Anchor_0305 = Vector((-0.9395, -1.6667, 0.8374))
# Hardpoint RRC_Chassis_Anchor_0306 = Vector((-0.9107, -1.7631, 0.8042))
# Hardpoint RRC_Chassis_Anchor_0307 = Vector((-0.8641, -1.8508, 0.7647))
# Hardpoint RRC_Chassis_Anchor_0308 = Vector((-0.8006, -1.9295, 0.7193))
# Hardpoint RRC_Chassis_Anchor_0309 = Vector((-0.7214, -1.9987, 0.6687))
# Hardpoint RRC_Chassis_Anchor_0310 = Vector((-0.6281, -2.0581, 0.6133))
# Hardpoint RRC_Chassis_Anchor_0311 = Vector((-0.5224, -2.1074, 0.5539))
# Hardpoint RRC_Chassis_Anchor_0312 = Vector((-0.4066, -2.1464, 0.4912))
# Hardpoint RRC_Chassis_Anchor_0313 = Vector((-0.2828, -2.1749, 0.4259))
# Hardpoint RRC_Chassis_Anchor_0314 = Vector((-0.1535, -2.1928, 0.3588))
# Hardpoint RRC_Chassis_Anchor_0315 = Vector((-0.0212, -2.1999, 0.2909))
# Hardpoint RRC_Chassis_Anchor_0316 = Vector((0.1116, -2.1962, 0.2227))
# Hardpoint RRC_Chassis_Anchor_0317 = Vector((0.2421, -2.1818, 0.1553))
# Hardpoint RRC_Chassis_Anchor_0318 = Vector((0.3679, -2.1566, 0.0894))
# Hardpoint RRC_Chassis_Anchor_0319 = Vector((0.4866, -2.1210, 0.0258))
# Hardpoint RRC_Chassis_Anchor_0320 = Vector((0.5957, -2.0749, -0.0348))
# Hardpoint RRC_Chassis_Anchor_0321 = Vector((0.6931, -2.0187, -0.0915))
# Hardpoint RRC_Chassis_Anchor_0322 = Vector((0.7770, -1.9526, -0.1437))
# Hardpoint RRC_Chassis_Anchor_0323 = Vector((0.8457, -1.8769, -0.1909))
# Hardpoint RRC_Chassis_Anchor_0324 = Vector((0.8978, -1.7920, -0.2323))
# Hardpoint RRC_Chassis_Anchor_0325 = Vector((0.9323, -1.6983, -0.2675))
# Hardpoint RRC_Chassis_Anchor_0326 = Vector((0.9487, -1.5964, -0.2962))
# Hardpoint RRC_Chassis_Anchor_0327 = Vector((0.9464, -1.4866, -0.3178))
# Hardpoint RRC_Chassis_Anchor_0328 = Vector((0.9256, -1.3695, -0.3322))
# Hardpoint RRC_Chassis_Anchor_0329 = Vector((0.8868, -1.2457, -0.3393))
# Hardpoint RRC_Chassis_Anchor_0330 = Vector((0.8305, -1.1159, -0.3388))
# Hardpoint RRC_Chassis_Anchor_0331 = Vector((0.7581, -0.9805, -0.3309))
# Hardpoint RRC_Chassis_Anchor_0332 = Vector((0.6707, -0.8404, -0.3156))
# Hardpoint RRC_Chassis_Anchor_0333 = Vector((0.5703, -0.6961, -0.2930))
# Hardpoint RRC_Chassis_Anchor_0334 = Vector((0.4587, -0.5484, -0.2636))
# Hardpoint RRC_Chassis_Anchor_0335 = Vector((0.3381, -0.3981, -0.2276))
# Hardpoint RRC_Chassis_Anchor_0336 = Vector((0.2109, -0.2458, -0.1854))
# Hardpoint RRC_Chassis_Anchor_0337 = Vector((0.0796, -0.0923, -0.1377))
# Hardpoint RRC_Chassis_Anchor_0338 = Vector((-0.0533, 0.0617, -0.0848))
# Hardpoint RRC_Chassis_Anchor_0339 = Vector((-0.1851, 0.2154, -0.0276))
# Hardpoint RRC_Chassis_Anchor_0340 = Vector((-0.3133, 0.3680, 0.0334))
# Hardpoint RRC_Chassis_Anchor_0341 = Vector((-0.4354, 0.5188, 0.0973))
# Hardpoint RRC_Chassis_Anchor_0342 = Vector((-0.5490, 0.6671, 0.1634))
# Hardpoint RRC_Chassis_Anchor_0343 = Vector((-0.6518, 0.8120, 0.2310))
# Hardpoint RRC_Chassis_Anchor_0344 = Vector((-0.7419, 0.9531, 0.2991))
# Hardpoint RRC_Chassis_Anchor_0345 = Vector((-0.8174, 1.0894, 0.3671))
# Hardpoint RRC_Chassis_Anchor_0346 = Vector((-0.8770, 1.2204, 0.4339))
# Hardpoint RRC_Chassis_Anchor_0347 = Vector((-0.9194, 1.3455, 0.4989))
# Hardpoint RRC_Chassis_Anchor_0348 = Vector((-0.9438, 1.4639, 0.5613))
# Hardpoint RRC_Chassis_Anchor_0349 = Vector((-0.9497, 1.5752, 0.6202))
# Hardpoint RRC_Chassis_Anchor_0350 = Vector((-0.9370, 1.6788, 0.6751))
# Hardpoint RRC_Chassis_Anchor_0351 = Vector((-0.9061, 1.7741, 0.7251))
# Hardpoint RRC_Chassis_Anchor_0352 = Vector((-0.8574, 1.8608, 0.7698))
# Hardpoint RRC_Chassis_Anchor_0353 = Vector((-0.7919, 1.9383, 0.8086))
# Hardpoint RRC_Chassis_Anchor_0354 = Vector((-0.7109, 2.0063, 0.8410))
# Hardpoint RRC_Chassis_Anchor_0355 = Vector((-0.6160, 2.0645, 0.8666))
# Hardpoint RRC_Chassis_Anchor_0356 = Vector((-0.5090, 2.1126, 0.8851))
# Hardpoint RRC_Chassis_Anchor_0357 = Vector((-0.3921, 2.1504, 0.8963))
# Hardpoint RRC_Chassis_Anchor_0358 = Vector((-0.2675, 2.1776, 0.9000))
# Hardpoint RRC_Chassis_Anchor_0359 = Vector((-0.1377, 2.1942, 0.8962))
# Hardpoint RRC_Chassis_Anchor_0360 = Vector((-0.0052, 2.2000, 0.8850))
# Hardpoint RRC_Chassis_Anchor_0361 = Vector((0.1274, 2.1950, 0.8665))
# Hardpoint RRC_Chassis_Anchor_0362 = Vector((0.2575, 2.1793, 0.8409))
# Hardpoint RRC_Chassis_Anchor_0363 = Vector((0.3826, 2.1529, 0.8085))
# Hardpoint RRC_Chassis_Anchor_0364 = Vector((0.5002, 2.1160, 0.7698))
# Hardpoint RRC_Chassis_Anchor_0365 = Vector((0.6080, 2.0687, 0.7251))
# Hardpoint RRC_Chassis_Anchor_0366 = Vector((0.7039, 2.0112, 0.6750))
# Hardpoint RRC_Chassis_Anchor_0367 = Vector((0.7861, 1.9440, 0.6201))
# Hardpoint RRC_Chassis_Anchor_0368 = Vector((0.8528, 1.8672, 0.5612))
# Hardpoint RRC_Chassis_Anchor_0369 = Vector((0.9029, 1.7812, 0.4988))
# Hardpoint RRC_Chassis_Anchor_0370 = Vector((0.9353, 1.6865, 0.4338))
# Hardpoint RRC_Chassis_Anchor_0371 = Vector((0.9494, 1.5836, 0.3669))
# Hardpoint RRC_Chassis_Anchor_0372 = Vector((0.9449, 1.4729, 0.2990))
# Hardpoint RRC_Chassis_Anchor_0373 = Vector((0.9219, 1.3550, 0.2309))
# Hardpoint RRC_Chassis_Anchor_0374 = Vector((0.8809, 1.2305, 0.1633))
# Hardpoint RRC_Chassis_Anchor_0375 = Vector((0.8227, 1.0999, 0.0972))
# Hardpoint RRC_Chassis_Anchor_0376 = Vector((0.7483, 0.9639, 0.0333))
# Hardpoint RRC_Chassis_Anchor_0377 = Vector((0.6593, 0.8232, -0.0277))
# Hardpoint RRC_Chassis_Anchor_0378 = Vector((0.5574, 0.6785, -0.0849))
# Hardpoint RRC_Chassis_Anchor_0379 = Vector((0.4446, 0.5305, -0.1377))
# Hardpoint RRC_Chassis_Anchor_0380 = Vector((0.3231, 0.3799, -0.1855))
# Hardpoint RRC_Chassis_Anchor_0381 = Vector((0.1953, 0.2274, -0.2276))
# Hardpoint RRC_Chassis_Anchor_0382 = Vector((0.0637, 0.0738, -0.2637))
# Hardpoint RRC_Chassis_Anchor_0383 = Vector((-0.0692, -0.0802, -0.2931))
# Hardpoint RRC_Chassis_Anchor_0384 = Vector((-0.2008, -0.2338, -0.3156))
# Hardpoint RRC_Chassis_Anchor_0385 = Vector((-0.3284, -0.3862, -0.3309))
# Hardpoint RRC_Chassis_Anchor_0386 = Vector((-0.4495, -0.5367, -0.3388))
# Hardpoint RRC_Chassis_Anchor_0387 = Vector((-0.5619, -0.6847, -0.3393))
# Hardpoint RRC_Chassis_Anchor_0388 = Vector((-0.6633, -0.8292, -0.3322))
# Hardpoint RRC_Chassis_Anchor_0389 = Vector((-0.7517, -0.9697, -0.3178))
# Hardpoint RRC_Chassis_Anchor_0390 = Vector((-0.8254, -1.1055, -0.2961))
# Hardpoint RRC_Chassis_Anchor_0391 = Vector((-0.8830, -1.2358, -0.2675))
# Hardpoint RRC_Chassis_Anchor_0392 = Vector((-0.9232, -1.3601, -0.2322))
# Hardpoint RRC_Chassis_Anchor_0393 = Vector((-0.9455, -1.4777, -0.1908))
# Hardpoint RRC_Chassis_Anchor_0394 = Vector((-0.9492, -1.5881, -0.1437))
# Hardpoint RRC_Chassis_Anchor_0395 = Vector((-0.9343, -1.6907, -0.0914))
# Hardpoint RRC_Chassis_Anchor_0396 = Vector((-0.9011, -1.7850, -0.0347))
# Hardpoint RRC_Chassis_Anchor_0397 = Vector((-0.8504, -1.8706, 0.0259))
# Hardpoint RRC_Chassis_Anchor_0398 = Vector((-0.7829, -1.9470, 0.0895))
# Hardpoint RRC_Chassis_Anchor_0399 = Vector((-0.7002, -2.0138, 0.1554))
# Hardpoint RRC_Chassis_Anchor_0400 = Vector((-0.6037, -2.0709, 0.2229))
# Hardpoint RRC_Chassis_Anchor_0401 = Vector((-0.4955, -2.1177, 0.2910))
# Hardpoint RRC_Chassis_Anchor_0402 = Vector((-0.3775, -2.1542, 0.3590))
# Hardpoint RRC_Chassis_Anchor_0403 = Vector((-0.2522, -2.1802, 0.4260))
# Hardpoint RRC_Chassis_Anchor_0404 = Vector((-0.1219, -2.1954, 0.4913))
# Hardpoint RRC_Chassis_Anchor_0405 = Vector((0.0108, -2.2000, 0.5540))
# Hardpoint RRC_Chassis_Anchor_0406 = Vector((0.1432, -2.1937, 0.6134))
# Hardpoint RRC_Chassis_Anchor_0407 = Vector((0.2729, -2.1767, 0.6687))
# Hardpoint RRC_Chassis_Anchor_0408 = Vector((0.3972, -2.1490, 0.7194))
# Hardpoint RRC_Chassis_Anchor_0409 = Vector((0.5137, -2.1108, 0.7648))
# Hardpoint RRC_Chassis_Anchor_0410 = Vector((0.6202, -2.0623, 0.8043))
# Hardpoint RRC_Chassis_Anchor_0411 = Vector((0.7146, -2.0037, 0.8374))
# Hardpoint RRC_Chassis_Anchor_0412 = Vector((0.7949, -1.9352, 0.8639))
# Hardpoint RRC_Chassis_Anchor_0413 = Vector((0.8597, -1.8573, 0.8832))
# Hardpoint RRC_Chassis_Anchor_0414 = Vector((0.9077, -1.7703, 0.8953))
# Hardpoint RRC_Chassis_Anchor_0415 = Vector((0.9379, -1.6746, 0.8999))
# Hardpoint RRC_Chassis_Anchor_0416 = Vector((0.9498, -1.5707, 0.8971))
# Hardpoint RRC_Chassis_Anchor_0417 = Vector((0.9431, -1.4591, 0.8868))
# Hardpoint RRC_Chassis_Anchor_0418 = Vector((0.9179, -1.3404, 0.8691))
# Hardpoint RRC_Chassis_Anchor_0419 = Vector((0.8748, -1.2151, 0.8444))
# Hardpoint RRC_Chassis_Anchor_0420 = Vector((0.8146, -1.0838, 0.8128))
# Hardpoint RRC_Chassis_Anchor_0421 = Vector((0.7384, -0.9473, 0.7747))
# Hardpoint RRC_Chassis_Anchor_0422 = Vector((0.6477, -0.8061, 0.7307))
# Hardpoint RRC_Chassis_Anchor_0423 = Vector((0.5444, -0.6609, 0.6813))
# Hardpoint RRC_Chassis_Anchor_0424 = Vector((0.4305, -0.5125, 0.6269))
# Hardpoint RRC_Chassis_Anchor_0425 = Vector((0.3081, -0.3616, 0.5684))
# Hardpoint RRC_Chassis_Anchor_0426 = Vector((0.1797, -0.2090, 0.5064))
# Hardpoint RRC_Chassis_Anchor_0427 = Vector((0.0477, -0.0553, 0.4417))
# Hardpoint RRC_Chassis_Anchor_0428 = Vector((-0.0851, 0.0987, 0.3750))
# Hardpoint RRC_Chassis_Anchor_0429 = Vector((-0.2163, 0.2522, 0.3072))
# Hardpoint RRC_Chassis_Anchor_0430 = Vector((-0.3433, 0.4044, 0.2390))
# Hardpoint RRC_Chassis_Anchor_0431 = Vector((-0.4636, 0.5547, 0.1714))
# Hardpoint RRC_Chassis_Anchor_0432 = Vector((-0.5747, 0.7022, 0.1050))
# Hardpoint RRC_Chassis_Anchor_0433 = Vector((-0.6747, 0.8463, 0.0408))
# Hardpoint RRC_Chassis_Anchor_0434 = Vector((-0.7614, 0.9863, -0.0206))
# Hardpoint RRC_Chassis_Anchor_0435 = Vector((-0.8332, 1.1214, -0.0783))
# Hardpoint RRC_Chassis_Anchor_0436 = Vector((-0.8887, 1.2510, -0.1317))
# Hardpoint RRC_Chassis_Anchor_0437 = Vector((-0.9269, 1.3746, -0.1801))
# Hardpoint RRC_Chassis_Anchor_0438 = Vector((-0.9469, 1.4913, -0.2229))
# Hardpoint RRC_Chassis_Anchor_0439 = Vector((-0.9484, 1.6008, -0.2597))
# Hardpoint RRC_Chassis_Anchor_0440 = Vector((-0.9313, 1.7024, -0.2899))
# Hardpoint RRC_Chassis_Anchor_0441 = Vector((-0.8960, 1.7957, -0.3133))
# Hardpoint RRC_Chassis_Anchor_0442 = Vector((-0.8431, 1.8802, -0.3295))
# Hardpoint RRC_Chassis_Anchor_0443 = Vector((-0.7738, 1.9555, -0.3383))
# Hardpoint RRC_Chassis_Anchor_0444 = Vector((-0.6893, 2.0212, -0.3396))
# Hardpoint RRC_Chassis_Anchor_0445 = Vector((-0.5913, 2.0770, -0.3335))
# Hardpoint RRC_Chassis_Anchor_0446 = Vector((-0.4818, 2.1227, -0.3199))
# Hardpoint RRC_Chassis_Anchor_0447 = Vector((-0.3628, 2.1579, -0.2991))
# Hardpoint RRC_Chassis_Anchor_0448 = Vector((-0.2367, 2.1826, -0.2713))
# Hardpoint RRC_Chassis_Anchor_0449 = Vector((-0.1060, 2.1966, -0.2368))
# Hardpoint RRC_Chassis_Anchor_0450 = Vector((0.0267, 2.1998, -0.1961))
# Hardpoint RRC_Chassis_Anchor_0451 = Vector((0.1590, 2.1922, -0.1496))
# Hardpoint RRC_Chassis_Anchor_0452 = Vector((0.2881, 2.1739, -0.0979))
# Hardpoint RRC_Chassis_Anchor_0453 = Vector((0.4116, 2.1450, -0.0417))
# Hardpoint RRC_Chassis_Anchor_0454 = Vector((0.5271, 2.1056, 0.0185))
# Hardpoint RRC_Chassis_Anchor_0455 = Vector((0.6322, 2.0558, 0.0817))
# Hardpoint RRC_Chassis_Anchor_0456 = Vector((0.7250, 1.9960, 0.1474))
# Hardpoint RRC_Chassis_Anchor_0457 = Vector((0.8036, 1.9264, 0.2147))
# Hardpoint RRC_Chassis_Anchor_0458 = Vector((0.8664, 1.8473, 0.2828))
# Hardpoint RRC_Chassis_Anchor_0459 = Vector((0.9123, 1.7592, 0.3508))
# Hardpoint RRC_Chassis_Anchor_0460 = Vector((0.9404, 1.6625, 0.4180))
# Hardpoint RRC_Chassis_Anchor_0461 = Vector((0.9500, 1.5577, 0.4836))
# Hardpoint RRC_Chassis_Anchor_0462 = Vector((0.9411, 1.4452, 0.5466))
# Hardpoint RRC_Chassis_Anchor_0463 = Vector((0.9137, 1.3257, 0.6065))
# Hardpoint RRC_Chassis_Anchor_0464 = Vector((0.8685, 1.1996, 0.6623))
# Hardpoint RRC_Chassis_Anchor_0465 = Vector((0.8062, 1.0677, 0.7136))
# Hardpoint RRC_Chassis_Anchor_0466 = Vector((0.7282, 0.9305, 0.7596))
# Hardpoint RRC_Chassis_Anchor_0467 = Vector((0.6360, 0.7888, 0.7999))
# Hardpoint RRC_Chassis_Anchor_0468 = Vector((0.5313, 0.6433, 0.8338))
# Hardpoint RRC_Chassis_Anchor_0469 = Vector((0.4162, 0.4945, 0.8611))
# Hardpoint RRC_Chassis_Anchor_0470 = Vector((0.2929, 0.3434, 0.8813))
# Hardpoint RRC_Chassis_Anchor_0471 = Vector((0.1639, 0.1906, 0.8943))
# Hardpoint RRC_Chassis_Anchor_0472 = Vector((0.0318, 0.0368, 0.8998))
# Hardpoint RRC_Chassis_Anchor_0473 = Vector((-0.1010, -0.1172, 0.8978))
# Hardpoint RRC_Chassis_Anchor_0474 = Vector((-0.2319, -0.2705, 0.8884))
# Hardpoint RRC_Chassis_Anchor_0475 = Vector((-0.3581, -0.4226, 0.8716))
# Hardpoint RRC_Chassis_Anchor_0476 = Vector((-0.4774, -0.5725, 0.8477))
# Hardpoint RRC_Chassis_Anchor_0477 = Vector((-0.5874, -0.7197, 0.8169))
# Hardpoint RRC_Chassis_Anchor_0478 = Vector((-0.6858, -0.8634, 0.7796))
# Hardpoint RRC_Chassis_Anchor_0479 = Vector((-0.7708, -1.0028, 0.7363))
# Hardpoint RRC_Chassis_Anchor_0480 = Vector((-0.8408, -1.1373, 0.6875))
# Hardpoint RRC_Chassis_Anchor_0481 = Vector((-0.8943, -1.2662, 0.6337))
# Hardpoint RRC_Chassis_Anchor_0482 = Vector((-0.9303, -1.3889, 0.5757))
# Hardpoint RRC_Chassis_Anchor_0483 = Vector((-0.9480, -1.5049, 0.5140))
# Hardpoint RRC_Chassis_Anchor_0484 = Vector((-0.9473, -1.6134, 0.4496))
# Hardpoint RRC_Chassis_Anchor_0485 = Vector((-0.9280, -1.7141, 0.3831))
# Hardpoint RRC_Chassis_Anchor_0486 = Vector((-0.8905, -1.8063, 0.3154))
# Hardpoint RRC_Chassis_Anchor_0487 = Vector((-0.8356, -1.8898, 0.2472))
# Hardpoint RRC_Chassis_Anchor_0488 = Vector((-0.7644, -1.9639, 0.1794))
# Hardpoint RRC_Chassis_Anchor_0489 = Vector((-0.6782, -2.0285, 0.1129))
# Hardpoint RRC_Chassis_Anchor_0490 = Vector((-0.5787, -2.0831, 0.0483))
# Hardpoint RRC_Chassis_Anchor_0491 = Vector((-0.4679, -2.1275, -0.0134))
# Hardpoint RRC_Chassis_Anchor_0492 = Vector((-0.3480, -2.1614, -0.0716))
# Hardpoint RRC_Chassis_Anchor_0493 = Vector((-0.2212, -2.1848, -0.1255))
# Hardpoint RRC_Chassis_Anchor_0494 = Vector((-0.0902, -2.1975, -0.1745))
# Hardpoint RRC_Chassis_Anchor_0495 = Vector((0.0427, -2.1994, -0.2181))
# Hardpoint RRC_Chassis_Anchor_0496 = Vector((0.1747, -2.1906, -0.2556))
# Hardpoint RRC_Chassis_Anchor_0497 = Vector((0.3033, -2.1710, -0.2867))
# Hardpoint RRC_Chassis_Anchor_0498 = Vector((0.4260, -2.1408, -0.3108))
# Hardpoint RRC_Chassis_Anchor_0499 = Vector((0.5403, -2.1001, -0.3279))
# Hardpoint RRC_Chassis_Anchor_0500 = Vector((0.6440, -2.0491, -0.3376))
# Hardpoint RRC_Chassis_Anchor_0501 = Vector((0.7352, -1.9881, -0.3398))
# Hardpoint RRC_Chassis_Anchor_0502 = Vector((0.8120, -1.9174, -0.3346))
# Hardpoint RRC_Chassis_Anchor_0503 = Vector((0.8728, -1.8372, -0.3219))
# Hardpoint RRC_Chassis_Anchor_0504 = Vector((0.9166, -1.7481, -0.3020))
# Hardpoint RRC_Chassis_Anchor_0505 = Vector((0.9425, -1.6504, -0.2750))
# Hardpoint RRC_Chassis_Anchor_0506 = Vector((0.9499, -1.5446, -0.2413))
# Hardpoint RRC_Chassis_Anchor_0507 = Vector((0.9387, -1.4312, -0.2013))
# Hardpoint RRC_Chassis_Anchor_0508 = Vector((0.9092, -1.3109, -0.1554))
# Hardpoint RRC_Chassis_Anchor_0509 = Vector((0.8619, -1.1841, -0.1044))
# Hardpoint RRC_Chassis_Anchor_0510 = Vector((0.7977, -1.0515, -0.0486))
# Hardpoint RRC_Chassis_Anchor_0511 = Vector((0.7179, -0.9137, 0.0111))
# Hardpoint RRC_Chassis_Anchor_0512 = Vector((0.6240, -0.7715, 0.0740))
# Hardpoint RRC_Chassis_Anchor_0513 = Vector((0.5179, -0.6255, 0.1395))
# Hardpoint RRC_Chassis_Anchor_0514 = Vector((0.4017, -0.4765, 0.2066))
# Hardpoint RRC_Chassis_Anchor_0515 = Vector((0.2777, -0.3251, 0.2746))
# Hardpoint RRC_Chassis_Anchor_0516 = Vector((0.1482, -0.1721, 0.3427))
# Hardpoint RRC_Chassis_Anchor_0517 = Vector((0.0158, -0.0183, 0.4101))
# Hardpoint RRC_Chassis_Anchor_0518 = Vector((-0.1169, 0.1356, 0.4758))
# Hardpoint RRC_Chassis_Anchor_0519 = Vector((-0.2473, 0.2889, 0.5392))
# Hardpoint RRC_Chassis_Anchor_0520 = Vector((-0.3729, 0.4407, 0.5995))
# Hardpoint RRC_Chassis_Anchor_0521 = Vector((-0.4912, 0.5904, 0.6559))
# Hardpoint RRC_Chassis_Anchor_0522 = Vector((-0.5998, 0.7372, 0.7077))
# Hardpoint RRC_Chassis_Anchor_0523 = Vector((-0.6968, 0.8803, 0.7544))
# Hardpoint RRC_Chassis_Anchor_0524 = Vector((-0.7801, 1.0192, 0.7954))
# Hardpoint RRC_Chassis_Anchor_0525 = Vector((-0.8481, 1.1531, 0.8301))
# Hardpoint RRC_Chassis_Anchor_0526 = Vector((-0.8995, 1.2813, 0.8582))
# Hardpoint RRC_Chassis_Anchor_0527 = Vector((-0.9334, 1.4032, 0.8792))
# Hardpoint RRC_Chassis_Anchor_0528 = Vector((-0.9489, 1.5183, 0.8931))
# Hardpoint RRC_Chassis_Anchor_0529 = Vector((-0.9459, 1.6259, 0.8995))
# Hardpoint RRC_Chassis_Anchor_0530 = Vector((-0.9244, 1.7256, 0.8985))
# Hardpoint RRC_Chassis_Anchor_0531 = Vector((-0.8848, 1.8168, 0.8899))
# Hardpoint RRC_Chassis_Anchor_0532 = Vector((-0.8279, 1.8992, 0.8740))
# Hardpoint RRC_Chassis_Anchor_0533 = Vector((-0.7548, 1.9722, 0.8509))
# Hardpoint RRC_Chassis_Anchor_0534 = Vector((-0.6669, 2.0355, 0.8209))
# Hardpoint RRC_Chassis_Anchor_0535 = Vector((-0.5660, 2.0889, 0.7844))
# Hardpoint RRC_Chassis_Anchor_0536 = Vector((-0.4540, 2.1321, 0.7418))
# Hardpoint RRC_Chassis_Anchor_0537 = Vector((-0.3331, 2.1648, 0.6936))
# Hardpoint RRC_Chassis_Anchor_0538 = Vector((-0.2057, 2.1869, 0.6404))
# Hardpoint RRC_Chassis_Anchor_0539 = Vector((-0.0742, 2.1983, 0.5828))
# Hardpoint RRC_Chassis_Anchor_0540 = Vector((0.0587, 2.1990, 0.5216))
# Hardpoint RRC_Chassis_Anchor_0541 = Vector((0.1904, 2.1888, 0.4574))
# Hardpoint RRC_Chassis_Anchor_0542 = Vector((0.3184, 2.1680, 0.3912))
# Hardpoint RRC_Chassis_Anchor_0543 = Vector((0.4402, 2.1365, 0.3235))
# Hardpoint RRC_Chassis_Anchor_0544 = Vector((0.5534, 2.0945, 0.2554))
# Hardpoint RRC_Chassis_Anchor_0545 = Vector((0.6557, 2.0423, 0.1875))
# Hardpoint RRC_Chassis_Anchor_0546 = Vector((0.7452, 1.9801, 0.1208))
# Hardpoint RRC_Chassis_Anchor_0547 = Vector((0.8201, 1.9082, 0.0559))
# Hardpoint RRC_Chassis_Anchor_0548 = Vector((0.8790, 1.8270, -0.0062))
# Hardpoint RRC_Chassis_Anchor_0549 = Vector((0.9207, 1.7368, -0.0648))
# Hardpoint RRC_Chassis_Anchor_0550 = Vector((0.9444, 1.6381, -0.1193))
# Hardpoint RRC_Chassis_Anchor_0551 = Vector((0.9495, 1.5314, -0.1689))
# Hardpoint RRC_Chassis_Anchor_0552 = Vector((0.9361, 1.4171, -0.2132))
# Hardpoint RRC_Chassis_Anchor_0553 = Vector((0.9044, 1.2960, -0.2514))
# Hardpoint RRC_Chassis_Anchor_0554 = Vector((0.8550, 1.1684, -0.2833))
# Hardpoint RRC_Chassis_Anchor_0555 = Vector((0.7889, 1.0352, -0.3083))
# Hardpoint RRC_Chassis_Anchor_0556 = Vector((0.7073, 0.8969, -0.3262))
# Hardpoint RRC_Chassis_Anchor_0557 = Vector((0.6119, 0.7542, -0.3368))
# Hardpoint RRC_Chassis_Anchor_0558 = Vector((0.5045, 0.6078, -0.3400))
# Hardpoint RRC_Chassis_Anchor_0559 = Vector((0.3872, 0.4584, -0.3356))
# Hardpoint RRC_Chassis_Anchor_0560 = Vector((0.2624, 0.3068, -0.3238))
# Hardpoint RRC_Chassis_Anchor_0561 = Vector((0.1324, 0.1537, -0.3047))
# Hardpoint RRC_Chassis_Anchor_0562 = Vector((-0.0002, -0.0002, -0.2786))
# Hardpoint RRC_Chassis_Anchor_0563 = Vector((-0.1327, -0.1541, -0.2456))
# Hardpoint RRC_Chassis_Anchor_0564 = Vector((-0.2627, -0.3072, -0.2064))
# Hardpoint RRC_Chassis_Anchor_0565 = Vector((-0.3875, -0.4588, -0.1612))
# Hardpoint RRC_Chassis_Anchor_0566 = Vector((-0.5048, -0.6082, -0.1107))
# Hardpoint RRC_Chassis_Anchor_0567 = Vector((-0.6121, -0.7546, -0.0555))
# Hardpoint RRC_Chassis_Anchor_0568 = Vector((-0.7075, -0.8973, 0.0037))
# Hardpoint RRC_Chassis_Anchor_0569 = Vector((-0.7891, -1.0356, 0.0663))
# Hardpoint RRC_Chassis_Anchor_0570 = Vector((-0.8552, -1.1688, 0.1315))
# Hardpoint RRC_Chassis_Anchor_0571 = Vector((-0.9045, -1.2963, 0.1985))
# Hardpoint RRC_Chassis_Anchor_0572 = Vector((-0.9362, -1.4174, 0.2665))
# Hardpoint RRC_Chassis_Anchor_0573 = Vector((-0.9496, -1.5316, 0.3346))
# Hardpoint RRC_Chassis_Anchor_0574 = Vector((-0.9443, -1.6383, 0.4020))
# Hardpoint RRC_Chassis_Anchor_0575 = Vector((-0.9206, -1.7370, 0.4680))
# Hardpoint RRC_Chassis_Anchor_0576 = Vector((-0.8789, -1.8272, 0.5318))
# Hardpoint RRC_Chassis_Anchor_0577 = Vector((-0.8200, -1.9084, 0.5924))
# Hardpoint RRC_Chassis_Anchor_0578 = Vector((-0.7450, -1.9803, 0.6493))
# Hardpoint RRC_Chassis_Anchor_0579 = Vector((-0.6554, -2.0425, 0.7018))
# Hardpoint RRC_Chassis_Anchor_0580 = Vector((-0.5531, -2.0947, 0.7491))
# Hardpoint RRC_Chassis_Anchor_0581 = Vector((-0.4399, -2.1366, 0.7908))
# Hardpoint RRC_Chassis_Anchor_0582 = Vector((-0.3181, -2.1680, 0.8263))
# Hardpoint RRC_Chassis_Anchor_0583 = Vector((-0.1900, -2.1889, 0.8552))
# Hardpoint RRC_Chassis_Anchor_0584 = Vector((-0.0583, -2.1990, 0.8771))
# Hardpoint RRC_Chassis_Anchor_0585 = Vector((0.0746, -2.1983, 0.8918))
# Hardpoint RRC_Chassis_Anchor_0586 = Vector((0.2060, -2.1869, 0.8991))
# Hardpoint RRC_Chassis_Anchor_0587 = Vector((0.3334, -2.1647, 0.8990))
# Hardpoint RRC_Chassis_Anchor_0588 = Vector((0.4543, -2.1320, 0.8913))
# Hardpoint RRC_Chassis_Anchor_0589 = Vector((0.5663, -2.0888, 0.8763))
# Hardpoint RRC_Chassis_Anchor_0590 = Vector((0.6672, -2.0354, 0.8541))
# Hardpoint RRC_Chassis_Anchor_0591 = Vector((0.7550, -1.9720, 0.8249))
# Hardpoint RRC_Chassis_Anchor_0592 = Vector((0.8281, -1.8990, 0.7891))
# Hardpoint RRC_Chassis_Anchor_0593 = Vector((0.8850, -1.8166, 0.7472))
# Hardpoint RRC_Chassis_Anchor_0594 = Vector((0.9245, -1.7254, 0.6996))
# Hardpoint RRC_Chassis_Anchor_0595 = Vector((0.9460, -1.6257, 0.6470))
# Hardpoint RRC_Chassis_Anchor_0596 = Vector((0.9489, -1.5180, 0.5899))
# Hardpoint RRC_Chassis_Anchor_0597 = Vector((0.9333, -1.4029, 0.5291))
# Hardpoint RRC_Chassis_Anchor_0598 = Vector((0.8994, -1.2810, 0.4653))
# Hardpoint RRC_Chassis_Anchor_0599 = Vector((0.8479, -1.1527, 0.3992))
# Hardpoint RRC_Chassis_Anchor_0600 = Vector((0.7799, -1.0188, 0.3317))
# Hardpoint RRC_Chassis_Anchor_0601 = Vector((0.6965, -0.8800, 0.2635))
# Hardpoint RRC_Chassis_Anchor_0602 = Vector((0.5996, -0.7368, 0.1956))
# Hardpoint RRC_Chassis_Anchor_0603 = Vector((0.4909, -0.5900, 0.1287))
# Hardpoint RRC_Chassis_Anchor_0604 = Vector((0.3726, -0.4403, 0.0636))
# Hardpoint RRC_Chassis_Anchor_0605 = Vector((0.2470, -0.2885, 0.0011))
# Hardpoint RRC_Chassis_Anchor_0606 = Vector((0.1166, -0.1352, -0.0580))
# Hardpoint RRC_Chassis_Anchor_0607 = Vector((-0.0161, 0.0187, -0.1130))
# Hardpoint RRC_Chassis_Anchor_0608 = Vector((-0.1485, 0.1725, -0.1633))
# Hardpoint RRC_Chassis_Anchor_0609 = Vector((-0.2780, 0.3255, -0.2082))
# Hardpoint RRC_Chassis_Anchor_0610 = Vector((-0.4021, 0.4769, -0.2472))
# Hardpoint RRC_Chassis_Anchor_0611 = Vector((-0.5182, 0.6259, -0.2798))
# Hardpoint RRC_Chassis_Anchor_0612 = Vector((-0.6243, 0.7719, -0.3057))
# Hardpoint RRC_Chassis_Anchor_0613 = Vector((-0.7181, 0.9141, -0.3245))
# Hardpoint RRC_Chassis_Anchor_0614 = Vector((-0.7979, 1.0518, -0.3360))
# Hardpoint RRC_Chassis_Anchor_0615 = Vector((-0.8620, 1.1844, -0.3400))
# Hardpoint RRC_Chassis_Anchor_0616 = Vector((-0.9093, 1.3112, -0.3365))
# Hardpoint RRC_Chassis_Anchor_0617 = Vector((-0.9388, 1.4315, -0.3256))
# Hardpoint RRC_Chassis_Anchor_0618 = Vector((-0.9499, 1.5449, -0.3074))
# Hardpoint RRC_Chassis_Anchor_0619 = Vector((-0.9424, 1.6506, -0.2821))
# Hardpoint RRC_Chassis_Anchor_0620 = Vector((-0.9165, 1.7483, -0.2499))
# Hardpoint RRC_Chassis_Anchor_0621 = Vector((-0.8727, 1.8374, -0.2114))
# Hardpoint RRC_Chassis_Anchor_0622 = Vector((-0.8118, 1.9176, -0.1669))
# Hardpoint RRC_Chassis_Anchor_0623 = Vector((-0.7350, 1.9883, -0.1171))
# Hardpoint RRC_Chassis_Anchor_0624 = Vector((-0.6438, 2.0493, -0.0624))
# Hardpoint RRC_Chassis_Anchor_0625 = Vector((-0.5400, 2.1002, -0.0036))
# Hardpoint RRC_Chassis_Anchor_0626 = Vector((-0.4257, 2.1409, 0.0587))
# Hardpoint RRC_Chassis_Anchor_0627 = Vector((-0.3030, 2.1711, 0.1236))
# Hardpoint RRC_Chassis_Anchor_0628 = Vector((-0.1744, 2.1906, 0.1904))
# Hardpoint RRC_Chassis_Anchor_0629 = Vector((-0.0424, 2.1995, 0.2583))
# Hardpoint RRC_Chassis_Anchor_0630 = Vector((0.0905, 2.1975, 0.3264))
# Hardpoint RRC_Chassis_Anchor_0631 = Vector((0.2216, 2.1848, 0.3940))
# Hardpoint RRC_Chassis_Anchor_0632 = Vector((0.3483, 2.1614, 0.4602))
# Hardpoint RRC_Chassis_Anchor_0633 = Vector((0.4682, 2.1274, 0.5243))
# Hardpoint RRC_Chassis_Anchor_0634 = Vector((0.5790, 2.0829, 0.5854))
# Hardpoint RRC_Chassis_Anchor_0635 = Vector((0.6784, 2.0283, 0.6427))
# Hardpoint RRC_Chassis_Anchor_0636 = Vector((0.7646, 1.9637, 0.6957))
# Hardpoint RRC_Chassis_Anchor_0637 = Vector((0.8358, 1.8896, 0.7437))
# Hardpoint RRC_Chassis_Anchor_0638 = Vector((0.8906, 1.8061, 0.7861))
# Hardpoint RRC_Chassis_Anchor_0639 = Vector((0.9280, 1.7138, 0.8224))
# Hardpoint RRC_Chassis_Anchor_0640 = Vector((0.9473, 1.6132, 0.8521))
# Hardpoint RRC_Chassis_Anchor_0641 = Vector((0.9480, 1.5046, 0.8748))
# Hardpoint RRC_Chassis_Anchor_0642 = Vector((0.9302, 1.3886, 0.8904))
# Hardpoint RRC_Chassis_Anchor_0643 = Vector((0.8941, 1.2659, 0.8987))
# Hardpoint RRC_Chassis_Anchor_0644 = Vector((0.8406, 1.1369, 0.8994))
# Hardpoint RRC_Chassis_Anchor_0645 = Vector((0.7706, 1.0024, 0.8926))
# Hardpoint RRC_Chassis_Anchor_0646 = Vector((0.6856, 0.8630, 0.8785))
# Hardpoint RRC_Chassis_Anchor_0647 = Vector((0.5871, 0.7193, 0.8571))
# Hardpoint RRC_Chassis_Anchor_0648 = Vector((0.4771, 0.5722, 0.8287))
# Hardpoint RRC_Chassis_Anchor_0649 = Vector((0.3578, 0.4222, 0.7937))
# Hardpoint RRC_Chassis_Anchor_0650 = Vector((0.2315, 0.2701, 0.7525))
# Hardpoint RRC_Chassis_Anchor_0651 = Vector((0.1007, 0.1168, 0.7056))
# Hardpoint RRC_Chassis_Anchor_0652 = Vector((-0.0321, -0.0372, 0.6536))
# Hardpoint RRC_Chassis_Anchor_0653 = Vector((-0.1643, -0.1910, 0.5970))
# Hardpoint RRC_Chassis_Anchor_0654 = Vector((-0.2933, -0.3438, 0.5366))
# Hardpoint RRC_Chassis_Anchor_0655 = Vector((-0.4165, -0.4949, 0.4730))
# Hardpoint RRC_Chassis_Anchor_0656 = Vector((-0.5315, -0.6436, 0.4072))
# Hardpoint RRC_Chassis_Anchor_0657 = Vector((-0.6362, -0.7892, 0.3398))
# Hardpoint RRC_Chassis_Anchor_0658 = Vector((-0.7284, -0.9309, 0.2717))
# Hardpoint RRC_Chassis_Anchor_0659 = Vector((-0.8064, -1.0680, 0.2037))
# Hardpoint RRC_Chassis_Anchor_0660 = Vector((-0.8686, -1.2000, 0.1366))
# Hardpoint RRC_Chassis_Anchor_0661 = Vector((-0.9138, -1.3260, 0.0713))
# Hardpoint RRC_Chassis_Anchor_0662 = Vector((-0.9411, -1.4455, 0.0084))
# Hardpoint RRC_Chassis_Anchor_0663 = Vector((-0.9500, -1.5580, -0.0511))
# Hardpoint RRC_Chassis_Anchor_0664 = Vector((-0.9403, -1.6628, -0.1066))
# Hardpoint RRC_Chassis_Anchor_0665 = Vector((-0.9122, -1.7595, -0.1575))
# Hardpoint RRC_Chassis_Anchor_0666 = Vector((-0.8663, -1.8476, -0.2031))
# Hardpoint RRC_Chassis_Anchor_0667 = Vector((-0.8034, -1.9266, -0.2428))
# Hardpoint RRC_Chassis_Anchor_0668 = Vector((-0.7248, -1.9961, -0.2763))
# Hardpoint RRC_Chassis_Anchor_0669 = Vector((-0.6320, -2.0559, -0.3030))
# Hardpoint RRC_Chassis_Anchor_0670 = Vector((-0.5268, -2.1057, -0.3226))
# Hardpoint RRC_Chassis_Anchor_0671 = Vector((-0.4113, -2.1451, -0.3350))
# Hardpoint RRC_Chassis_Anchor_0672 = Vector((-0.2878, -2.1740, -0.3399))
# Hardpoint RRC_Chassis_Anchor_0673 = Vector((-0.1586, -2.1923, -0.3373))
# Hardpoint RRC_Chassis_Anchor_0674 = Vector((-0.0264, -2.1998, -0.3273))
# Hardpoint RRC_Chassis_Anchor_0675 = Vector((0.1064, -2.1965, -0.3100))
# Hardpoint RRC_Chassis_Anchor_0676 = Vector((0.2371, -2.1825, -0.2855))
# Hardpoint RRC_Chassis_Anchor_0677 = Vector((0.3631, -2.1578, -0.2541))
# Hardpoint RRC_Chassis_Anchor_0678 = Vector((0.4821, -2.1226, -0.2163))
# Hardpoint RRC_Chassis_Anchor_0679 = Vector((0.5916, -2.0769, -0.1726))
# Hardpoint RRC_Chassis_Anchor_0680 = Vector((0.6895, -2.0211, -0.1233))
# Hardpoint RRC_Chassis_Anchor_0681 = Vector((0.7740, -1.9553, -0.0692))
# Hardpoint RRC_Chassis_Anchor_0682 = Vector((0.8433, -1.8800, -0.0108))
# Hardpoint RRC_Chassis_Anchor_0683 = Vector((0.8961, -1.7955, 0.0511))
# Hardpoint RRC_Chassis_Anchor_0684 = Vector((0.9313, -1.7022, 0.1157))
# Hardpoint RRC_Chassis_Anchor_0685 = Vector((0.9484, -1.6005, 0.1823))
# Hardpoint RRC_Chassis_Anchor_0686 = Vector((0.9469, -1.4910, 0.2501))
# Hardpoint RRC_Chassis_Anchor_0687 = Vector((0.9268, -1.3742, 0.3183))
# Hardpoint RRC_Chassis_Anchor_0688 = Vector((0.8886, -1.2507, 0.3860))
# Hardpoint RRC_Chassis_Anchor_0689 = Vector((0.8331, -1.1211, 0.4524))
# Hardpoint RRC_Chassis_Anchor_0690 = Vector((0.7612, -0.9859, 0.5167))
# Hardpoint RRC_Chassis_Anchor_0691 = Vector((0.6744, -0.8459, 0.5782))
# Hardpoint RRC_Chassis_Anchor_0692 = Vector((0.5745, -0.7018, 0.6361))
# Hardpoint RRC_Chassis_Anchor_0693 = Vector((0.4632, -0.5543, 0.6896))
# Hardpoint RRC_Chassis_Anchor_0694 = Vector((0.3430, -0.4040, 0.7383))
# Hardpoint RRC_Chassis_Anchor_0695 = Vector((0.2160, -0.2518, 0.7813))
# Hardpoint RRC_Chassis_Anchor_0696 = Vector((0.0848, -0.0983, 0.8183))
# Hardpoint RRC_Chassis_Anchor_0697 = Vector((-0.0481, 0.0557, 0.8489))
# Hardpoint RRC_Chassis_Anchor_0698 = Vector((-0.1800, 0.2094, 0.8725))
# Hardpoint RRC_Chassis_Anchor_0699 = Vector((-0.3084, 0.3620, 0.8890))
# Hardpoint RRC_Chassis_Anchor_0700 = Vector((-0.4308, 0.5129, 0.8981))
# Hardpoint RRC_Chassis_Anchor_0701 = Vector((-0.5447, 0.6613, 0.8997))
# Hardpoint RRC_Chassis_Anchor_0702 = Vector((-0.6480, 0.8064, 0.8938))
# Hardpoint RRC_Chassis_Anchor_0703 = Vector((-0.7386, 0.9476, 0.8806))
# Hardpoint RRC_Chassis_Anchor_0704 = Vector((-0.8147, 1.0842, 0.8600))
# Hardpoint RRC_Chassis_Anchor_0705 = Vector((-0.8749, 1.2154, 0.8325))
# Hardpoint RRC_Chassis_Anchor_0706 = Vector((-0.9180, 1.3407, 0.7983))
# Hardpoint RRC_Chassis_Anchor_0707 = Vector((-0.9431, 1.4594, 0.7578))
# Hardpoint RRC_Chassis_Anchor_0708 = Vector((-0.9498, 1.5710, 0.7115))
# Hardpoint RRC_Chassis_Anchor_0709 = Vector((-0.9379, 1.6749, 0.6600))
# Hardpoint RRC_Chassis_Anchor_0710 = Vector((-0.9076, 1.7705, 0.6040))
# Hardpoint RRC_Chassis_Anchor_0711 = Vector((-0.8596, 1.8575, 0.5440))
# Hardpoint RRC_Chassis_Anchor_0712 = Vector((-0.7947, 1.9354, 0.4808))
# Hardpoint RRC_Chassis_Anchor_0713 = Vector((-0.7143, 2.0038, 0.4152))
# Hardpoint RRC_Chassis_Anchor_0714 = Vector((-0.6199, 2.0625, 0.3479))
# Hardpoint RRC_Chassis_Anchor_0715 = Vector((-0.5134, 2.1110, 0.2799))
# Hardpoint RRC_Chassis_Anchor_0716 = Vector((-0.3969, 2.1491, 0.2118))
# Hardpoint RRC_Chassis_Anchor_0717 = Vector((-0.2725, 2.1768, 0.1446))
# Hardpoint RRC_Chassis_Anchor_0718 = Vector((-0.1429, 2.1937, 0.0790))
# Hardpoint RRC_Chassis_Anchor_0719 = Vector((-0.0104, 2.2000, 0.0158))
# Hardpoint RRC_Chassis_Anchor_0720 = Vector((0.1222, 2.1954, -0.0442))
# Hardpoint RRC_Chassis_Anchor_0721 = Vector((0.2525, 2.1801, -0.1002))
# Hardpoint RRC_Chassis_Anchor_0722 = Vector((0.3778, 2.1541, -0.1517))
# Hardpoint RRC_Chassis_Anchor_0723 = Vector((0.4958, 2.1176, -0.1979))
# Hardpoint RRC_Chassis_Anchor_0724 = Vector((0.6040, 2.0707, -0.2384))
# Hardpoint RRC_Chassis_Anchor_0725 = Vector((0.7004, 2.0137, -0.2726))
# Hardpoint RRC_Chassis_Anchor_0726 = Vector((0.7831, 1.9468, -0.3001))
# Hardpoint RRC_Chassis_Anchor_0727 = Vector((0.8505, 1.8703, -0.3206))
# Hardpoint RRC_Chassis_Anchor_0728 = Vector((0.9012, 1.7847, -0.3339))
# Hardpoint RRC_Chassis_Anchor_0729 = Vector((0.9344, 1.6904, -0.3397))
# Hardpoint RRC_Chassis_Anchor_0730 = Vector((0.9492, 1.5878, -0.3380))
# Hardpoint RRC_Chassis_Anchor_0731 = Vector((0.9454, 1.4774, -0.3289))
# Hardpoint RRC_Chassis_Anchor_0732 = Vector((0.9232, 1.3597, -0.3124))
# Hardpoint RRC_Chassis_Anchor_0733 = Vector((0.8829, 1.2354, -0.2888))
# Hardpoint RRC_Chassis_Anchor_0734 = Vector((0.8253, 1.1051, -0.2582))
# Hardpoint RRC_Chassis_Anchor_0735 = Vector((0.7515, 0.9693, -0.2212))
# Hardpoint RRC_Chassis_Anchor_0736 = Vector((0.6631, 0.8288, -0.1781))
# Hardpoint RRC_Chassis_Anchor_0737 = Vector((0.5616, 0.6843, -0.1295))
# Hardpoint RRC_Chassis_Anchor_0738 = Vector((0.4492, 0.5364, -0.0759))
# Hardpoint RRC_Chassis_Anchor_0739 = Vector((0.3280, 0.3858, -0.0180))
# Hardpoint RRC_Chassis_Anchor_0740 = Vector((0.2004, 0.2334, 0.0435))
# Hardpoint RRC_Chassis_Anchor_0741 = Vector((0.0689, 0.0798, 0.1078))
# Hardpoint RRC_Chassis_Anchor_0742 = Vector((-0.0640, -0.0742, 0.1742))
# Hardpoint RRC_Chassis_Anchor_0743 = Vector((-0.1957, -0.2278, 0.2420))
# Hardpoint RRC_Chassis_Anchor_0744 = Vector((-0.3235, -0.3803, 0.3101))
# Hardpoint RRC_Chassis_Anchor_0745 = Vector((-0.4449, -0.5309, 0.3779))
# Hardpoint RRC_Chassis_Anchor_0746 = Vector((-0.5577, -0.6789, 0.4445))
# Hardpoint RRC_Chassis_Anchor_0747 = Vector((-0.6596, -0.8236, 0.5092))
# Hardpoint RRC_Chassis_Anchor_0748 = Vector((-0.7485, -0.9643, 0.5710))
# Hardpoint RRC_Chassis_Anchor_0749 = Vector((-0.8228, -1.1002, 0.6294))
# Hardpoint RRC_Chassis_Anchor_0750 = Vector((-0.8810, -1.2308, 0.6835))
# Hardpoint RRC_Chassis_Anchor_0751 = Vector((-0.9220, -1.3553, 0.7327))
# Hardpoint RRC_Chassis_Anchor_0752 = Vector((-0.9449, -1.4732, 0.7765))
# Hardpoint RRC_Chassis_Anchor_0753 = Vector((-0.9494, -1.5839, 0.8142))
# Hardpoint RRC_Chassis_Anchor_0754 = Vector((-0.9352, -1.6868, 0.8456))
# Hardpoint RRC_Chassis_Anchor_0755 = Vector((-0.9028, -1.7814, 0.8700))
# Hardpoint RRC_Chassis_Anchor_0756 = Vector((-0.8527, -1.8674, 0.8874))
# Hardpoint RRC_Chassis_Anchor_0757 = Vector((-0.7859, -1.9442, 0.8974))
# Hardpoint RRC_Chassis_Anchor_0758 = Vector((-0.7037, -2.0114, 0.8999))
# Hardpoint RRC_Chassis_Anchor_0759 = Vector((-0.6077, -2.0688, 0.8949))
# Hardpoint RRC_Chassis_Anchor_0760 = Vector((-0.4999, -2.1161, 0.8826))
# Hardpoint RRC_Chassis_Anchor_0761 = Vector((-0.3823, -2.1530, 0.8629))
# Hardpoint RRC_Chassis_Anchor_0762 = Vector((-0.2572, -2.1794, 0.8362))
# Hardpoint RRC_Chassis_Anchor_0763 = Vector((-0.1271, -2.1951, 0.8027))
# Hardpoint RRC_Chassis_Anchor_0764 = Vector((0.0056, -2.2000, 0.7630))
# Hardpoint RRC_Chassis_Anchor_0765 = Vector((0.1381, -2.1942, 0.7174))
# Hardpoint RRC_Chassis_Anchor_0766 = Vector((0.2679, -2.1776, 0.6665))
# Hardpoint RRC_Chassis_Anchor_0767 = Vector((0.3924, -2.1503, 0.6109))
# Hardpoint RRC_Chassis_Anchor_0768 = Vector((0.5093, -2.1125, 0.5514))
# Hardpoint RRC_Chassis_Anchor_0769 = Vector((0.6162, -2.0644, 0.4885))
# Hardpoint RRC_Chassis_Anchor_0770 = Vector((0.7111, -2.0062, 0.4232))
# Hardpoint RRC_Chassis_Anchor_0771 = Vector((0.7921, -1.9381, 0.3561))
# Hardpoint RRC_Chassis_Anchor_0772 = Vector((0.8575, -1.8605, 0.2881))
# Hardpoint RRC_Chassis_Anchor_0773 = Vector((0.9062, -1.7739, 0.2200))
# Hardpoint RRC_Chassis_Anchor_0774 = Vector((0.9371, -1.6785, 0.1526))
# Hardpoint RRC_Chassis_Anchor_0775 = Vector((0.9497, -1.5749, 0.0867))
# Hardpoint RRC_Chassis_Anchor_0776 = Vector((0.9437, -1.4636, 0.0232))
# Hardpoint RRC_Chassis_Anchor_0777 = Vector((0.9193, -1.3452, -0.0372))
# Hardpoint RRC_Chassis_Anchor_0778 = Vector((0.8768, -1.2201, -0.0937))
# Hardpoint RRC_Chassis_Anchor_0779 = Vector((0.8172, -1.0891, -0.1458))
# Hardpoint RRC_Chassis_Anchor_0780 = Vector((0.7416, -0.9527, -0.1927))
# Hardpoint RRC_Chassis_Anchor_0781 = Vector((0.6515, -0.8117, -0.2339))
# Hardpoint RRC_Chassis_Anchor_0782 = Vector((0.5487, -0.6667, -0.2688))
# Hardpoint RRC_Chassis_Anchor_0783 = Vector((0.4351, -0.5184, -0.2972))
# Hardpoint RRC_Chassis_Anchor_0784 = Vector((0.3130, -0.3676, -0.3186))
# Hardpoint RRC_Chassis_Anchor_0785 = Vector((0.1848, -0.2150, -0.3327))
# Hardpoint RRC_Chassis_Anchor_0786 = Vector((0.0529, -0.0613, -0.3394))
# Hardpoint RRC_Chassis_Anchor_0787 = Vector((-0.0799, 0.0927, -0.3386))
# Hardpoint RRC_Chassis_Anchor_0788 = Vector((-0.2113, 0.2462, -0.3304))
# Hardpoint RRC_Chassis_Anchor_0789 = Vector((-0.3384, 0.3985, -0.3148))
# Hardpoint RRC_Chassis_Anchor_0790 = Vector((-0.4590, 0.5488, -0.2920))
# Hardpoint RRC_Chassis_Anchor_0791 = Vector((-0.5706, 0.6965, -0.2622))
# Hardpoint RRC_Chassis_Anchor_0792 = Vector((-0.6710, 0.8407, -0.2260))
# Hardpoint RRC_Chassis_Anchor_0793 = Vector((-0.7583, 0.9809, -0.1836))
# Hardpoint RRC_Chassis_Anchor_0794 = Vector((-0.8307, 1.1162, -0.1356))
# Hardpoint RRC_Chassis_Anchor_0795 = Vector((-0.8869, 1.2461, -0.0826))
# Hardpoint RRC_Chassis_Anchor_0796 = Vector((-0.9257, 1.3698, -0.0252))
# Hardpoint RRC_Chassis_Anchor_0797 = Vector((-0.9464, 1.4869, 0.0359))
# Hardpoint RRC_Chassis_Anchor_0798 = Vector((-0.9486, 1.5967, 0.1000))
# Hardpoint RRC_Chassis_Anchor_0799 = Vector((-0.9323, 1.6986, 0.1662))
# Hardpoint RRC_Chassis_Anchor_0800 = Vector((-0.8977, 1.7922, 0.2338))
# Hardpoint RRC_Chassis_Anchor_0801 = Vector((-0.8455, 1.8771, 0.3019))
# Hardpoint RRC_Chassis_Anchor_0802 = Vector((-0.7768, 1.9527, 0.3698))
# Hardpoint RRC_Chassis_Anchor_0803 = Vector((-0.6929, 2.0188, 0.4366))
# Hardpoint RRC_Chassis_Anchor_0804 = Vector((-0.5954, 2.0750, 0.5015))
# Hardpoint RRC_Chassis_Anchor_0805 = Vector((-0.4863, 2.1211, 0.5638))
# Hardpoint RRC_Chassis_Anchor_0806 = Vector((-0.3676, 2.1567, 0.6226))
# Hardpoint RRC_Chassis_Anchor_0807 = Vector((-0.2418, 2.1818, 0.6772))
# Hardpoint RRC_Chassis_Anchor_0808 = Vector((-0.1112, 2.1962, 0.7271))
# Hardpoint RRC_Chassis_Anchor_0809 = Vector((0.0215, 2.1999, 0.7715))
# Hardpoint RRC_Chassis_Anchor_0810 = Vector((0.1539, 2.1927, 0.8101))
# Hardpoint RRC_Chassis_Anchor_0811 = Vector((0.2832, 2.1749, 0.8422))
# Hardpoint RRC_Chassis_Anchor_0812 = Vector((0.4069, 2.1463, 0.8675))
# Hardpoint RRC_Chassis_Anchor_0813 = Vector((0.5227, 2.1073, 0.8857))
# Hardpoint RRC_Chassis_Anchor_0814 = Vector((0.6283, 2.0579, 0.8966))
# Hardpoint RRC_Chassis_Anchor_0815 = Vector((0.7216, 1.9985, 0.9000))
# Hardpoint RRC_Chassis_Anchor_0816 = Vector((0.8008, 1.9293, 0.8959))
# Hardpoint RRC_Chassis_Anchor_0817 = Vector((0.8643, 1.8506, 0.8844))
# Hardpoint RRC_Chassis_Anchor_0818 = Vector((0.9108, 1.7629, 0.8656))
# Hardpoint RRC_Chassis_Anchor_0819 = Vector((0.9396, 1.6665, 0.8397))
# Hardpoint RRC_Chassis_Anchor_0820 = Vector((0.9500, 1.5619, 0.8071))
# Hardpoint RRC_Chassis_Anchor_0821 = Vector((0.9418, 1.4498, 0.7680))
# Hardpoint RRC_Chassis_Anchor_0822 = Vector((0.9151, 1.3305, 0.7231))
# Hardpoint RRC_Chassis_Anchor_0823 = Vector((0.8706, 1.2047, 0.6728))
# Hardpoint RRC_Chassis_Anchor_0824 = Vector((0.8090, 1.0730, 0.6178))
# Hardpoint RRC_Chassis_Anchor_0825 = Vector((0.7316, 0.9360, 0.5587))
# Hardpoint RRC_Chassis_Anchor_0826 = Vector((0.6398, 0.7945, 0.4962))
# Hardpoint RRC_Chassis_Anchor_0827 = Vector((0.5356, 0.6490, 0.4311))
# Hardpoint RRC_Chassis_Anchor_0828 = Vector((0.4208, 0.5004, 0.3642))
# Hardpoint RRC_Chassis_Anchor_0829 = Vector((0.2979, 0.3493, 0.2962))
# Hardpoint RRC_Chassis_Anchor_0830 = Vector((0.1691, 0.1966, 0.2281))
# Hardpoint RRC_Chassis_Anchor_0831 = Vector((0.0370, 0.0428, 0.1606))
# Hardpoint RRC_Chassis_Anchor_0832 = Vector((-0.0959, -0.1111, 0.0945))
# Hardpoint RRC_Chassis_Anchor_0833 = Vector((-0.2268, -0.2645, 0.0307))
# Hardpoint RRC_Chassis_Anchor_0834 = Vector((-0.3533, -0.4166, -0.0301))
# Hardpoint RRC_Chassis_Anchor_0835 = Vector((-0.4729, -0.5667, -0.0872))
# Hardpoint RRC_Chassis_Anchor_0836 = Vector((-0.5833, -0.7140, -0.1398))
# Hardpoint RRC_Chassis_Anchor_0837 = Vector((-0.6822, -0.8578, -0.1874))
# Hardpoint RRC_Chassis_Anchor_0838 = Vector((-0.7678, -0.9974, -0.2293))
# Hardpoint RRC_Chassis_Anchor_0839 = Vector((-0.8383, -1.1321, -0.2650))
# Hardpoint RRC_Chassis_Anchor_0840 = Vector((-0.8925, -1.2613, -0.2942))
# Hardpoint RRC_Chassis_Anchor_0841 = Vector((-0.9292, -1.3843, -0.3164))
# Hardpoint RRC_Chassis_Anchor_0842 = Vector((-0.9477, -1.5005, -0.3314))
# Hardpoint RRC_Chassis_Anchor_0843 = Vector((-0.9477, -1.6093, -0.3390))
# Hardpoint RRC_Chassis_Anchor_0844 = Vector((-0.9291, -1.7103, -0.3391))
# Hardpoint RRC_Chassis_Anchor_0845 = Vector((-0.8923, -1.8029, -0.3318))
# Hardpoint RRC_Chassis_Anchor_0846 = Vector((-0.8381, -1.8867, -0.3170))
# Hardpoint RRC_Chassis_Anchor_0847 = Vector((-0.7675, -1.9612, -0.2951))
# Hardpoint RRC_Chassis_Anchor_0848 = Vector((-0.6818, -2.0261, -0.2662))
# Hardpoint RRC_Chassis_Anchor_0849 = Vector((-0.5829, -2.0811, -0.2306))
# Hardpoint RRC_Chassis_Anchor_0850 = Vector((-0.4725, -2.1259, -0.1890))
# Hardpoint RRC_Chassis_Anchor_0851 = Vector((-0.3528, -2.1603, -0.1416))
# Hardpoint RRC_Chassis_Anchor_0852 = Vector((-0.2263, -2.1841, -0.0892))
# Hardpoint RRC_Chassis_Anchor_0853 = Vector((-0.0953, -2.1972, -0.0322))
# Hardpoint RRC_Chassis_Anchor_0854 = Vector((0.0375, -2.1996, 0.0284))
# Hardpoint RRC_Chassis_Anchor_0855 = Vector((0.1696, -2.1911, 0.0922))
# Hardpoint RRC_Chassis_Anchor_0856 = Vector((0.2984, -2.1720, 0.1582))
# Hardpoint RRC_Chassis_Anchor_0857 = Vector((0.4213, -2.1422, 0.2256))
# Hardpoint RRC_Chassis_Anchor_0858 = Vector((0.5360, -2.1019, 0.2938))
# Hardpoint RRC_Chassis_Anchor_0859 = Vector((0.6402, -2.0513, 0.3617))
# Hardpoint RRC_Chassis_Anchor_0860 = Vector((0.7319, -1.9907, 0.4287))
# Hardpoint RRC_Chassis_Anchor_0861 = Vector((0.8092, -1.9203, 0.4939))
# Hardpoint RRC_Chassis_Anchor_0862 = Vector((0.8708, -1.8405, 0.5565))
# Hardpoint RRC_Chassis_Anchor_0863 = Vector((0.9152, -1.7517, 0.6157))
# Hardpoint RRC_Chassis_Anchor_0864 = Vector((0.9418, -1.6544, 0.6709))
# Hardpoint RRC_Chassis_Anchor_0865 = Vector((0.9500, -1.5489, 0.7214))
# Hardpoint RRC_Chassis_Anchor_0866 = Vector((0.9395, -1.4358, 0.7665))
# Hardpoint RRC_Chassis_Anchor_0867 = Vector((0.9107, -1.3157, 0.8058))
# Hardpoint RRC_Chassis_Anchor_0868 = Vector((0.8640, -1.1891, 0.8387))
# Hardpoint RRC_Chassis_Anchor_0869 = Vector((0.8005, -1.0568, 0.8648))
# Hardpoint RRC_Chassis_Anchor_0870 = Vector((0.7213, -0.9192, 0.8839))
# Hardpoint RRC_Chassis_Anchor_0871 = Vector((0.6279, -0.7772, 0.8956))
# Hardpoint RRC_Chassis_Anchor_0872 = Vector((0.5223, -0.6313, 0.9000))
# Hardpoint RRC_Chassis_Anchor_0873 = Vector((0.4065, -0.4824, 0.8968))
# Hardpoint RRC_Chassis_Anchor_0874 = Vector((0.2827, -0.3311, 0.8862))
# Hardpoint RRC_Chassis_Anchor_0875 = Vector((0.1533, -0.1781, 0.8682))
# Hardpoint RRC_Chassis_Anchor_0876 = Vector((0.0210, -0.0243, 0.8432))
# Hardpoint RRC_Chassis_Anchor_0877 = Vector((-0.1117, 0.1296, 0.8113))
# Hardpoint RRC_Chassis_Anchor_0878 = Vector((-0.2423, 0.2829, 0.7730))
# Hardpoint RRC_Chassis_Anchor_0879 = Vector((-0.3681, 0.4348, 0.7288))
# Hardpoint RRC_Chassis_Anchor_0880 = Vector((-0.4867, 0.5846, 0.6791))
# Hardpoint RRC_Chassis_Anchor_0881 = Vector((-0.5958, 0.7315, 0.6246))
# Hardpoint RRC_Chassis_Anchor_0882 = Vector((-0.6932, 0.8748, 0.5660))
# Hardpoint RRC_Chassis_Anchor_0883 = Vector((-0.7771, 1.0139, 0.5038))
# Hardpoint RRC_Chassis_Anchor_0884 = Vector((-0.8457, 1.1479, 0.4390))
# Hardpoint RRC_Chassis_Anchor_0885 = Vector((-0.8978, 1.2764, 0.3723))
# Hardpoint RRC_Chassis_Anchor_0886 = Vector((-0.9324, 1.3986, 0.3044))
# Hardpoint RRC_Chassis_Anchor_0887 = Vector((-0.9487, 1.5139, 0.2362))
# Hardpoint RRC_Chassis_Anchor_0888 = Vector((-0.9464, 1.6219, 0.1686))
# Hardpoint RRC_Chassis_Anchor_0889 = Vector((-0.9256, 1.7219, 0.1023))
# Hardpoint RRC_Chassis_Anchor_0890 = Vector((-0.8867, 1.8134, 0.0382))
# Hardpoint RRC_Chassis_Anchor_0891 = Vector((-0.8305, 1.8961, -0.0230))
# Hardpoint RRC_Chassis_Anchor_0892 = Vector((-0.7579, 1.9695, -0.0806))
# Hardpoint RRC_Chassis_Anchor_0893 = Vector((-0.6706, 2.0332, -0.1337))
# Hardpoint RRC_Chassis_Anchor_0894 = Vector((-0.5702, 2.0870, -0.1819))
# Hardpoint RRC_Chassis_Anchor_0895 = Vector((-0.4585, 2.1306, -0.2245))
# Hardpoint RRC_Chassis_Anchor_0896 = Vector((-0.3380, 2.1637, -0.2611))
# Hardpoint RRC_Chassis_Anchor_0897 = Vector((-0.2108, 2.1863, -0.2910))
# Hardpoint RRC_Chassis_Anchor_0898 = Vector((-0.0794, 2.1981, -0.3141))
# Hardpoint RRC_Chassis_Anchor_0899 = Vector((0.0535, 2.1991, -0.3300))
# Hardpoint RRC_Chassis_Anchor_0900 = Vector((0.1853, 2.1894, -0.3385))
# Hardpoint RRC_Chassis_Anchor_0901 = Vector((0.3135, 2.1690, -0.3395))
# Hardpoint RRC_Chassis_Anchor_0902 = Vector((0.4356, 2.1379, -0.3331))
# Hardpoint RRC_Chassis_Anchor_0903 = Vector((0.5491, 2.0964, -0.3192))
# Hardpoint RRC_Chassis_Anchor_0904 = Vector((0.6519, 2.0446, -0.2981))
# Hardpoint RRC_Chassis_Anchor_0905 = Vector((0.7420, 1.9828, -0.2700))
# Hardpoint RRC_Chassis_Anchor_0906 = Vector((0.8175, 1.9112, -0.2352))
# Hardpoint RRC_Chassis_Anchor_0907 = Vector((0.8770, 1.8303, -0.1943))
# Hardpoint RRC_Chassis_Anchor_0908 = Vector((0.9194, 1.7405, -0.1476))
# Hardpoint RRC_Chassis_Anchor_0909 = Vector((0.9438, 1.6421, -0.0957))
# Hardpoint RRC_Chassis_Anchor_0910 = Vector((0.9497, 1.5357, -0.0393))
# Hardpoint RRC_Chassis_Anchor_0911 = Vector((0.9370, 1.4217, 0.0210))
# Hardpoint RRC_Chassis_Anchor_0912 = Vector((0.9060, 1.3008, 0.0844))
# Hardpoint RRC_Chassis_Anchor_0913 = Vector((0.8573, 1.1735, 0.1502))
# Hardpoint RRC_Chassis_Anchor_0914 = Vector((0.7918, 1.0405, 0.2175))
# Hardpoint RRC_Chassis_Anchor_0915 = Vector((0.7108, 0.9024, 0.2856))
# Hardpoint RRC_Chassis_Anchor_0916 = Vector((0.6158, 0.7598, 0.3536))
# Hardpoint RRC_Chassis_Anchor_0917 = Vector((0.5089, 0.6136, 0.4208))
# Hardpoint RRC_Chassis_Anchor_0918 = Vector((0.3920, 0.4643, 0.4862))
# Hardpoint RRC_Chassis_Anchor_0919 = Vector((0.2674, 0.3128, 0.5491))
# Hardpoint RRC_Chassis_Anchor_0920 = Vector((0.1375, 0.1597, 0.6088))
# Hardpoint RRC_Chassis_Anchor_0921 = Vector((0.0050, 0.0058, 0.6645))
# Hardpoint RRC_Chassis_Anchor_0922 = Vector((-0.1276, -0.1481, 0.7156))
# Hardpoint RRC_Chassis_Anchor_0923 = Vector((-0.2577, -0.3012, 0.7614))
# Hardpoint RRC_Chassis_Anchor_0924 = Vector((-0.3828, -0.4529, 0.8014))
# Hardpoint RRC_Chassis_Anchor_0925 = Vector((-0.5004, -0.6024, 0.8351))
# Hardpoint RRC_Chassis_Anchor_0926 = Vector((-0.6081, -0.7489, 0.8620))
# Hardpoint RRC_Chassis_Anchor_0927 = Vector((-0.7040, -0.8917, 0.8820))
# Hardpoint RRC_Chassis_Anchor_0928 = Vector((-0.7862, -1.0302, 0.8946))
# Hardpoint RRC_Chassis_Anchor_0929 = Vector((-0.8529, -1.1637, 0.8999))
# Hardpoint RRC_Chassis_Anchor_0930 = Vector((-0.9029, -1.2914, 0.8976))
# Hardpoint RRC_Chassis_Anchor_0931 = Vector((-0.9353, -1.4128, 0.8879))
# Hardpoint RRC_Chassis_Anchor_0932 = Vector((-0.9494, -1.5273, 0.8708))
# Hardpoint RRC_Chassis_Anchor_0933 = Vector((-0.9449, -1.6343, 0.8466))
# Hardpoint RRC_Chassis_Anchor_0934 = Vector((-0.9219, -1.7333, 0.8155))
# Hardpoint RRC_Chassis_Anchor_0935 = Vector((-0.8808, -1.8238, 0.7780))
# Hardpoint RRC_Chassis_Anchor_0936 = Vector((-0.8226, -1.9054, 0.7344))
# Hardpoint RRC_Chassis_Anchor_0937 = Vector((-0.7482, -1.9777, 0.6853))
# Hardpoint RRC_Chassis_Anchor_0938 = Vector((-0.6592, -2.0402, 0.6314))
# Hardpoint RRC_Chassis_Anchor_0939 = Vector((-0.5573, -2.0928, 0.5732))
# Hardpoint RRC_Chassis_Anchor_0940 = Vector((-0.4445, -2.1351, 0.5114))
# Hardpoint RRC_Chassis_Anchor_0941 = Vector((-0.3230, -2.1670, 0.4469))
# Hardpoint RRC_Chassis_Anchor_0942 = Vector((-0.1951, -2.1882, 0.3803))
# Hardpoint RRC_Chassis_Anchor_0943 = Vector((-0.0635, -2.1988, 0.3126))
# Hardpoint RRC_Chassis_Anchor_0944 = Vector((0.0694, -2.1985, 0.2444))
# Hardpoint RRC_Chassis_Anchor_0945 = Vector((0.2009, -2.1875, 0.1767))
# Hardpoint RRC_Chassis_Anchor_0946 = Vector((0.3285, -2.1658, 0.1102))
# Hardpoint RRC_Chassis_Anchor_0947 = Vector((0.4497, -2.1335, 0.0458))
# Hardpoint RRC_Chassis_Anchor_0948 = Vector((0.5621, -2.0907, -0.0159))
# Hardpoint RRC_Chassis_Anchor_0949 = Vector((0.6634, -2.0377, -0.0739))
# Hardpoint RRC_Chassis_Anchor_0950 = Vector((0.7518, -1.9747, -0.1276))
# Hardpoint RRC_Chassis_Anchor_0951 = Vector((0.8255, -1.9020, -0.1764))
# Hardpoint RRC_Chassis_Anchor_0952 = Vector((0.8830, -1.8200, -0.2197))
# Hardpoint RRC_Chassis_Anchor_0953 = Vector((0.9233, -1.7291, -0.2570))
# Hardpoint RRC_Chassis_Anchor_0954 = Vector((0.9455, -1.6297, -0.2878))
# Hardpoint RRC_Chassis_Anchor_0955 = Vector((0.9491, -1.5224, -0.3117))
# Hardpoint RRC_Chassis_Anchor_0956 = Vector((0.9343, -1.4076, -0.3284))
# Hardpoint RRC_Chassis_Anchor_0957 = Vector((0.9011, -1.2859, -0.3378))
# Hardpoint RRC_Chassis_Anchor_0958 = Vector((0.8503, -1.1579, -0.3398))
# Hardpoint RRC_Chassis_Anchor_0959 = Vector((0.7828, -1.0242, -0.3342))
# Hardpoint RRC_Chassis_Anchor_0960 = Vector((0.7001, -0.8855, -0.3212))
# Hardpoint RRC_Chassis_Anchor_0961 = Vector((0.6036, -0.7425, -0.3010))
# Hardpoint RRC_Chassis_Anchor_0962 = Vector((0.4953, -0.5958, -0.2737))
# Hardpoint RRC_Chassis_Anchor_0963 = Vector((0.3774, -0.4462, -0.2397))
# Hardpoint RRC_Chassis_Anchor_0964 = Vector((0.2520, -0.2944, -0.1995))
# Hardpoint RRC_Chassis_Anchor_0965 = Vector((0.1217, -0.1412, -0.1534))
# Hardpoint RRC_Chassis_Anchor_0966 = Vector((-0.0109, 0.0127, -0.1022))
# Hardpoint RRC_Chassis_Anchor_0967 = Vector((-0.1434, 0.1665, -0.0463))
# Hardpoint RRC_Chassis_Anchor_0968 = Vector((-0.2730, 0.3195, 0.0136))
# Hardpoint RRC_Chassis_Anchor_0969 = Vector((-0.3973, 0.4710, 0.0767))
# Hardpoint RRC_Chassis_Anchor_0970 = Vector((-0.5139, 0.6201, 0.1422))
# Hardpoint RRC_Chassis_Anchor_0971 = Vector((-0.6203, 0.7663, 0.2094))
# Hardpoint RRC_Chassis_Anchor_0972 = Vector((-0.7147, 0.9086, 0.2774))
# Hardpoint RRC_Chassis_Anchor_0973 = Vector((-0.7950, 1.0465, 0.3455))
# Hardpoint RRC_Chassis_Anchor_0974 = Vector((-0.8598, 1.1793, 0.4128))
# Hardpoint RRC_Chassis_Anchor_0975 = Vector((-0.9078, 1.3063, 0.4785))
# Hardpoint RRC_Chassis_Anchor_0976 = Vector((-0.9380, 1.4269, 0.5418))
# Hardpoint RRC_Chassis_Anchor_0977 = Vector((-0.9498, 1.5406, 0.6019))
# Hardpoint RRC_Chassis_Anchor_0978 = Vector((-0.9431, 1.6466, 0.6581))
# Hardpoint RRC_Chassis_Anchor_0979 = Vector((-0.9179, 1.7447, 0.7098))
# Hardpoint RRC_Chassis_Anchor_0980 = Vector((-0.8747, 1.8341, 0.7562))
# Hardpoint RRC_Chassis_Anchor_0981 = Vector((-0.8145, 1.9146, 0.7969))
# Hardpoint RRC_Chassis_Anchor_0982 = Vector((-0.7383, 1.9857, 0.8314))
# Hardpoint RRC_Chassis_Anchor_0983 = Vector((-0.6476, 2.0471, 0.8592))
# Hardpoint RRC_Chassis_Anchor_0984 = Vector((-0.5443, 2.0984, 0.8800))
# Hardpoint RRC_Chassis_Anchor_0985 = Vector((-0.4303, 2.1395, 0.8935))
# Hardpoint RRC_Chassis_Anchor_0986 = Vector((-0.3079, 2.1701, 0.8996))
# Hardpoint RRC_Chassis_Anchor_0987 = Vector((-0.1795, 2.1901, 0.8983))
# Hardpoint RRC_Chassis_Anchor_0988 = Vector((-0.0476, 2.1993, 0.8894))
# Hardpoint RRC_Chassis_Anchor_0989 = Vector((0.0853, 2.1978, 0.8732))
# Hardpoint RRC_Chassis_Anchor_0990 = Vector((0.2165, 2.1855, 0.8498))
# Hardpoint RRC_Chassis_Anchor_0991 = Vector((0.3435, 2.1625, 0.8196))
# Hardpoint RRC_Chassis_Anchor_0992 = Vector((0.4637, 2.1289, 0.7828))
# Hardpoint RRC_Chassis_Anchor_0993 = Vector((0.5749, 2.0849, 0.7399))
# Hardpoint RRC_Chassis_Anchor_0994 = Vector((0.6748, 2.0306, 0.6915))
# Hardpoint RRC_Chassis_Anchor_0995 = Vector((0.7615, 1.9664, 0.6381))
# Hardpoint RRC_Chassis_Anchor_0996 = Vector((0.8333, 1.8926, 0.5804))
# Hardpoint RRC_Chassis_Anchor_0997 = Vector((0.8888, 1.8096, 0.5190))
# Hardpoint RRC_Chassis_Anchor_0998 = Vector((0.9269, 1.7176, 0.4548))
# Hardpoint RRC_Chassis_Anchor_0999 = Vector((0.9469, 1.6173, 0.3884))
# Hardpoint RRC_Chassis_Anchor_1000 = Vector((0.9483, 1.5090, 0.3207))
# Hardpoint RRC_Chassis_Anchor_1001 = Vector((0.9312, 1.3933, 0.2526))
# Hardpoint RRC_Chassis_Anchor_1002 = Vector((0.8959, 1.2708, 0.1847))
# Hardpoint RRC_Chassis_Anchor_1003 = Vector((0.8430, 1.1421, 0.1181))
# Hardpoint RRC_Chassis_Anchor_1004 = Vector((0.7737, 1.0078, 0.0533))
# Hardpoint RRC_Chassis_Anchor_1005 = Vector((0.6892, 0.8685, -0.0086))
# Hardpoint RRC_Chassis_Anchor_1006 = Vector((0.5912, 0.7250, -0.0671))
# Hardpoint RRC_Chassis_Anchor_1007 = Vector((0.4816, 0.5780, -0.1214))
# Hardpoint RRC_Chassis_Anchor_1008 = Vector((0.3626, 0.4281, -0.1709))
# Hardpoint RRC_Chassis_Anchor_1009 = Vector((0.2366, 0.2761, -0.2149))
# Hardpoint RRC_Chassis_Anchor_1010 = Vector((0.1059, 0.1228, -0.2529))
# Hardpoint RRC_Chassis_Anchor_1011 = Vector((-0.0269, -0.0312, -0.2844))
# Hardpoint RRC_Chassis_Anchor_1012 = Vector((-0.1592, -0.1849, -0.3092))
# Hardpoint RRC_Chassis_Anchor_1013 = Vector((-0.2883, -0.3378, -0.3268))
# Hardpoint RRC_Chassis_Anchor_1014 = Vector((-0.4118, -0.4890, -0.3371))
# Hardpoint RRC_Chassis_Anchor_1015 = Vector((-0.5272, -0.6379, -0.3399))
# Hardpoint RRC_Chassis_Anchor_1016 = Vector((-0.6323, -0.7836, -0.3353))
# Hardpoint RRC_Chassis_Anchor_1017 = Vector((-0.7251, -0.9254, -0.3232))
# Hardpoint RRC_Chassis_Anchor_1018 = Vector((-0.8036, -1.0628, -0.3038))
# Hardpoint RRC_Chassis_Anchor_1019 = Vector((-0.8665, -1.1949, -0.2773))
# Hardpoint RRC_Chassis_Anchor_1020 = Vector((-0.9124, -1.3212, -0.2442))
# Hardpoint RRC_Chassis_Anchor_1021 = Vector((-0.9404, -1.4410, -0.2046))
# Hardpoint RRC_Chassis_Anchor_1022 = Vector((-0.9500, -1.5537, -0.1593))
# Hardpoint RRC_Chassis_Anchor_1023 = Vector((-0.9410, -1.6589, -0.1086))
# Hardpoint RRC_Chassis_Anchor_1024 = Vector((-0.9136, -1.7559, -0.0532))
# Hardpoint RRC_Chassis_Anchor_1025 = Vector((-0.8684, -1.8443, 0.0062))
# Hardpoint RRC_Chassis_Anchor_1026 = Vector((-0.8061, -1.9236, 0.0690))
# Hardpoint RRC_Chassis_Anchor_1027 = Vector((-0.7281, -1.9936, 0.1342))
# Hardpoint RRC_Chassis_Anchor_1028 = Vector((-0.6358, -2.0538, 0.2013))
# Hardpoint RRC_Chassis_Anchor_1029 = Vector((-0.5311, -2.1039, 0.2693))
# Hardpoint RRC_Chassis_Anchor_1030 = Vector((-0.4160, -2.1437, 0.3374))
# Hardpoint RRC_Chassis_Anchor_1031 = Vector((-0.2928, -2.1731, 0.4048))
# Hardpoint RRC_Chassis_Anchor_1032 = Vector((-0.1638, -2.1917, 0.4707))
# Hardpoint RRC_Chassis_Anchor_1033 = Vector((-0.0316, -2.1997, 0.5343))
# Hardpoint RRC_Chassis_Anchor_1034 = Vector((0.1012, -2.1969, 0.5949))
# Hardpoint RRC_Chassis_Anchor_1035 = Vector((0.2320, -2.1833, 0.6516))
# Hardpoint RRC_Chassis_Anchor_1036 = Vector((0.3583, -2.1590, 0.7038))
# Hardpoint RRC_Chassis_Anchor_1037 = Vector((0.4776, -2.1241, 0.7509))
# Hardpoint RRC_Chassis_Anchor_1038 = Vector((0.5875, -2.0789, 0.7924))
# Hardpoint RRC_Chassis_Anchor_1039 = Vector((0.6859, -2.0234, 0.8276))
# Hardpoint RRC_Chassis_Anchor_1040 = Vector((0.7709, -1.9581, 0.8562))
# Hardpoint RRC_Chassis_Anchor_1041 = Vector((0.8409, -1.8831, 0.8778))
# Hardpoint RRC_Chassis_Anchor_1042 = Vector((0.8943, -1.7990, 0.8923))
# Hardpoint RRC_Chassis_Anchor_1043 = Vector((0.9303, -1.7060, 0.8993))
# Hardpoint RRC_Chassis_Anchor_1044 = Vector((0.9481, -1.6047, 0.8988))
# Hardpoint RRC_Chassis_Anchor_1045 = Vector((0.9473, -1.4955, 0.8909))
# Hardpoint RRC_Chassis_Anchor_1046 = Vector((0.9279, -1.3789, 0.8755))
# Hardpoint RRC_Chassis_Anchor_1047 = Vector((0.8905, -1.2557, 0.8530))
# Hardpoint RRC_Chassis_Anchor_1048 = Vector((0.8355, -1.1262, 0.8235))
# Hardpoint RRC_Chassis_Anchor_1049 = Vector((0.7643, -0.9913, 0.7875))
# Hardpoint RRC_Chassis_Anchor_1050 = Vector((0.6781, -0.8515, 0.7454))
# Hardpoint RRC_Chassis_Anchor_1051 = Vector((0.5786, -0.7075, 0.6976))
# Hardpoint RRC_Chassis_Anchor_1052 = Vector((0.4678, -0.5601, 0.6447))
# Hardpoint RRC_Chassis_Anchor_1053 = Vector((0.3478, -0.4099, 0.5875))
# Hardpoint RRC_Chassis_Anchor_1054 = Vector((0.2211, -0.2577, 0.5265))
