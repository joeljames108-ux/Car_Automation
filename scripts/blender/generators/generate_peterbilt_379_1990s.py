"""
=============================================================================
CLASS-A CAD PROCEDURAL GENERATOR: PETERBILT 379 EXTENDED HOOD (1990s HEAVY TRUCK)
=============================================================================
Procedural Class-A CAD construction of the definitive 1990s American Class 8 tractor:
the 1993-1998 Peterbilt 379 "127-inch BBC Extended Hood" with Unibilt 63-inch UltraCab.
Adheres strictly to the Procedural Automotive Blender Pipeline, Autonomous
Blender Visual Feedback Loop, and Maximum Visual Quality CAD Standard.

Scope: EXTERIOR ONLY (Museum-Grade Class-A CAD Geometry, Materials & Hardware).
Target Line Count: 3,000+ lines of substantive, fully procedural BMesh code.

Factory Engineering & Dimensional Specifications:
- Architecture: Heavy Truck (American Class 8 Conventional Tractor)
- Era: 1990s (1990-1999)
- Reference: 1995 Peterbilt 379 Extended Hood (127" BBC, Unibilt 63" UltraCab Sleeper)
- Wheelbase: 265 inches (6,730 mm)
- Front Steer Axle: Y = +2.900 m
- Tandem Rear Drive Axles:
    * Forward Drive Axle:  Y = -2.300 m
    * Rearward Drive Axle: Y = -3.650 m
    * Tandem Spread: 1.350 m (Tandem Center at Y = -2.975 m)
- Overall Length: 8.550 m (Front Bumper at Y = +4.150 m, Rear Frame Cutoff at Y = -4.400 m)
- Cab & Sleeper Width: 2.180 m (Overall track width over rear fenders: 2.480 m, Mirror span: 2.950 m)
- Overall Height: 4.050 m (Top of dual 7" chrome straight monster stacks and cab roof bullets)
- Frame Height: Top of rail at Z = 0.920 m, Ground clearance = 0.260 m
- Wheel Assembly: 10 Wheels Total
    * Steer Axle: 2x 24.5" x 8.25" Mirror-Polished Forged Aluminum Alcoa 10-Hole Wheels
    * Tandem Drive Axles: 4x Dual Assemblies (8x 24.5" Alcoa Wheels) with Chrome Top-Hat Axle Covers
    * Tires: 11R24.5 Heavy Commercial Highway Rib (Steer) and Deep-Lug Traction (Drive) Radials
- Complete Exterior Subsystems:
    1. Heavy-duty 10.75" C-channel ladder chassis frame with 6 tubular & stamped crossmembers
    2. Dana Spicer drop-forged I-beam front axle with taper-leaf springs, sway bar & dual shocks
    3. Meritor/Spicer tandem rear drive axles with Peterbilt Low Air Leaf suspension & rolling-lobe air bags
    4. Complete 10-wheel fleet with 24.5" mirror-polished Alcoa 10-hole forged wheels & spiked nut covers
    5. Holland/Jost heavy cast steel sliding fifth-wheel coupling with toothed slider rack & release lever
    6. 127-inch BBC extended square aluminum hood with piano-hinge spine, side dog-bone latches & louvers
    7. Towering polished aluminum grille surround, red Peterbilt oval emblem & stainless punched mesh
    8. Texas-style 18-inch blind-mount drop chrome front bumper with center tow pocket & license plate
    9. Dual rectangular sealed-beam headlight pods on fender pedestal brackets with amber turn markers
    10. Dual 15-inch cylindrical Donaldson external chrome air cleaner canisters with cyclone mushroom caps
    11. Unibilt 63-inch UltraCab sleeper shell with thousands of aircraft-style dome rivets & vista windows
    12. Two-piece split windshield with stainless center divider and 14-inch stainless gangster drop visor
    13. 5 amber bullet clearance lights across cab brow, dual Hadley chrome trumpet horns & CB antennas
    14. Dual 7-inch vertical mirror-polished chrome straight-cut exhaust stacks with perforated heat shields
    15. Dual 150-gallon cylindrical brushed aluminum fuel tanks with diamond-plate top step pads
    16. Aluminum battery carrier box and matching tool box with diamond-plate step lids & lower stirrup rungs
    17. Stainless steel West Coast tripod double-mirror assemblies with auxiliary round convex spotters
    18. Polished diamond-plate rear catwalk deck plate spanning between frame rails behind sleeper
    19. Stainless steel trailer umbilical connection pylon with coiled Red, Blue, and Black Suzie lines
    20. Peterbilt 2-piece polished stainless steel rear half-fenders and spring-loaded mudflap hangers
    21. Heavy black rubber anti-sail mudflaps featuring embossed red Peterbilt oval logo & chrome weights
    22. Eaton Fuller RTLO-18918B 18-speed transmission casing and heavy tubular Cardan driveshafts
    23. Pneumatic brake actuators (Type 20 front, Type 30/30 dual spring brake pots, automatic slack adjusters)
    24. Three chassis compressed air reservoir tanks with brass drain valves and Bendix AD-9 air dryer
    25. Heavy rear tubular crossmember with recessed 4-inch round red LED stop/turn/tail lamps & tow pintle

Coordinate System:
- Metric Units (Meters).
- +Y: Forward (Front Bumper)
- -Y: Rearward (Rear Frame / Mudflaps)
- +Z: Upward (Roof / Stacks)
- 0.0 Z: Ground Contact Plane
- +X: Driver Side (Left-Hand Drive, LHD)
- -X: Passenger Side (Right)
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# ----------------------------------------------------------------------------
# 0. CONFIGURATION & EXPORT PATHS
# ----------------------------------------------------------------------------
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PUBLIC_MODELS_DIR = os.path.join(ROOT_DIR, "public", "models", "vehicles", "heavy_truck", "1990s")
EXPORTS_DIR = os.path.join(ROOT_DIR, "exports")
CANONICAL_GLB_PATH = os.path.normpath(os.path.join(PUBLIC_MODELS_DIR, "vehicle.glb"))
ARCHIVAL_GLB_PATH = os.path.normpath(os.path.join(EXPORTS_DIR, "Car_Peterbilt_379_1990s.glb"))
ROOT_MODELS_GLB_PATH = os.path.normpath(os.path.join(ROOT_DIR, "public", "models", "Car_Peterbilt_379_1990s.glb"))

# ----------------------------------------------------------------------------
# 1. SCENE CLEANUP & SETUP
# ----------------------------------------------------------------------------
def safe_reset_scene():
    """Completely resets the Blender scene and configures metric units."""
    if bpy.context.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
        
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col, do_unlink=True)
        
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0
    scene.unit_settings.length_unit = 'METERS'
    print("[PETERBILT 379] Scene reset and configured for metric Class-A CAD.")

# ----------------------------------------------------------------------------
# 2. MASTER AUTOMOTIVE PBR MATERIAL FACTORY
# ----------------------------------------------------------------------------
def make_pbr_material(name, base_color, metallic=0.0, roughness=0.4, clearcoat=0.0,
                      transmission=0.0, ior=1.50, emission_color=None, emission_strength=0.0,
                      alpha=1.0):
    """Creates a production-quality Principled BSDF PBR material compatible with all Blender versions."""
    mat = bpy.data.materials.get(name)
    if mat:
        bpy.data.materials.remove(mat, do_unlink=True)
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()
    
    node_out = tree.nodes.new(type='ShaderNodeOutputMaterial')
    node_out.location = (400, 0)
    
    node_bsdf = tree.nodes.new(type='ShaderNodeBsdfPrincipled')
    node_bsdf.location = (0, 0)
    
    # Base Color
    if 'Base Color' in node_bsdf.inputs:
        node_bsdf.inputs['Base Color'].default_value = (base_color[0], base_color[1], base_color[2], alpha)
    # Metallic
    if 'Metallic' in node_bsdf.inputs:
        node_bsdf.inputs['Metallic'].default_value = metallic
    # Roughness
    if 'Roughness' in node_bsdf.inputs:
        node_bsdf.inputs['Roughness'].default_value = roughness
    # Clearcoat / Coat Weight
    if 'Clearcoat' in node_bsdf.inputs:
        node_bsdf.inputs['Clearcoat'].default_value = clearcoat
    elif 'Coat Weight' in node_bsdf.inputs:
        node_bsdf.inputs['Coat Weight'].default_value = clearcoat
    if 'Coat Roughness' in node_bsdf.inputs:
        node_bsdf.inputs['Coat Roughness'].default_value = 0.05
    # Transmission / Weight
    if 'Transmission' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission'].default_value = transmission
    elif 'Transmission Weight' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission Weight'].default_value = transmission
    # IOR
    if 'IOR' in node_bsdf.inputs:
        node_bsdf.inputs['IOR'].default_value = ior
    # Emission
    if emission_color and emission_strength > 0.0:
        if 'Emission Color' in node_bsdf.inputs:
            node_bsdf.inputs['Emission Color'].default_value = (emission_color[0], emission_color[1], emission_color[2], 1.0)
        elif 'Emission' in node_bsdf.inputs:
            node_bsdf.inputs['Emission'].default_value = (emission_color[0], emission_color[1], emission_color[2], 1.0)
        if 'Emission Strength' in node_bsdf.inputs:
            node_bsdf.inputs['Emission Strength'].default_value = emission_strength
            
    # Alpha / Transparency
    if 'Alpha' in node_bsdf.inputs:
        node_bsdf.inputs['Alpha'].default_value = alpha
        
    if alpha < 1.0 or transmission > 0.0:
        mat.blend_method = 'BLEND'
        if hasattr(mat, 'shadow_method'):
            mat.shadow_method = 'HASHED'
            
    tree.links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat

def create_all_peterbilt_materials():
    """Initializes the complete palette of authentic 1990s Peterbilt factory show-truck materials."""
    mats = {}
    
    # 1. Cab Bodywork: Classic Midnight Black Cherry / Deep Gloss Jet Black
    mats['cab_paint'] = make_pbr_material(
        'Paint_PeterbiltBlack',
        base_color=(0.020, 0.020, 0.022),
        metallic=0.00,
        roughness=0.22,
        clearcoat=0.85
    )
    
    # 2. Chassis Rails & Subframe: High-Gloss Gloss Chassis Black
    mats['chassis_black'] = make_pbr_material(
        'Paint_ChassisGlossBlack',
        base_color=(0.025, 0.025, 0.025),
        metallic=0.40,
        roughness=0.35
    )
    
    # 3. Triple-Plated Show-Truck Mirror Chrome (Grille crown, 18" bumper, 7" stacks, air cleaners, visor)
    mats['chrome'] = make_pbr_material(
        'Chrome_MirrorPeterbilt',
        base_color=(0.96, 0.96, 0.96),
        metallic=1.00,
        roughness=0.015
    )
    
    # 4. Mirror-Polished Alcoa Forged Aluminum (24.5" wheels, 150-gal fuel tanks, catwalk deck)
    mats['polished_alcoa'] = make_pbr_material(
        'Alloy_AlcoaPolished',
        base_color=(0.91, 0.92, 0.93),
        metallic=0.96,
        roughness=0.09
    )
    
    # 5. Heavy Cast Iron (Differential housings, brake drums, fifth wheel plate)
    mats['cast_iron'] = make_pbr_material(
        'Iron_CastHeavy',
        base_color=(0.08, 0.08, 0.08),
        metallic=0.70,
        roughness=0.62
    )
    
    # 6. Commercial Heavy-Duty Tire Rubber
    mats['tire_rubber'] = make_pbr_material(
        'Rubber_CommercialTire',
        base_color=(0.028, 0.028, 0.028),
        metallic=0.00,
        roughness=0.86
    )
    
    # 7. Split Windshield & Sleeper Vista Windows: High-Gloss Tinted Safety Glass
    mats['glass_window'] = make_pbr_material(
        'Glass_WindshieldTint',
        base_color=(0.03, 0.04, 0.05),
        metallic=0.15,
        roughness=0.02,
        clearcoat=1.00,
        alpha=0.96
    )
    
    # 8. Rectangular Sealed-Beam Headlamp Glass (Fluted Polycarbonate)
    mats['glass_headlamp'] = make_pbr_material(
        'Glass_HeadlampFluted',
        base_color=(0.96, 0.96, 0.96),
        metallic=0.00,
        roughness=0.05,
        transmission=0.88,
        ior=1.51,
        alpha=0.35
    )
    
    # 9. Faceted Amber Indicator / Clearance Lens Glass
    mats['glass_amber'] = make_pbr_material(
        'Glass_AmberIndicator',
        base_color=(0.95, 0.48, 0.02),
        metallic=0.00,
        roughness=0.08,
        transmission=0.82,
        ior=1.51,
        alpha=0.45
    )
    
    # 10. Ruby Red Rear LED Stop / Tail Prism Glass
    mats['glass_red'] = make_pbr_material(
        'Glass_TaillampRed',
        base_color=(0.88, 0.03, 0.03),
        metallic=0.00,
        roughness=0.08,
        transmission=0.85,
        ior=1.51,
        alpha=0.45
    )
    
    # 11. Crystal Clear Reverse Lens Glass
    mats['glass_reverse'] = make_pbr_material(
        'Glass_ReverseClear',
        base_color=(0.95, 0.95, 0.95),
        metallic=0.00,
        roughness=0.08,
        transmission=0.85,
        ior=1.51,
        alpha=0.40
    )
    
    # 12. Iconic Red Peterbilt Oval Emblem Badge (Candy Red & Script Chrome)
    mats['badge_peterbilt'] = make_pbr_material(
        'Badge_PeterbiltRedOval',
        base_color=(0.82, 0.04, 0.05),
        metallic=0.85,
        roughness=0.15,
        clearcoat=1.00
    )
    
    # 13. Heavy Rubber Mudflaps with Red/White Peterbilt Crest
    mats['mudflap'] = make_pbr_material(
        'Rubber_PeterbiltMudflap',
        base_color=(0.035, 0.035, 0.035),
        metallic=0.02,
        roughness=0.82
    )
    mats['mudflap_crest'] = make_pbr_material(
        'Decal_PeterbiltCrest',
        base_color=(0.88, 0.05, 0.06),
        metallic=0.10,
        roughness=0.35
    )
    mats['mudflap_white'] = make_pbr_material(
        'Decal_PeterbiltWhite',
        base_color=(0.95, 0.95, 0.95),
        metallic=0.02,
        roughness=0.35
    )
    
    # 14. Halogen Sealed-Beam Headlight Bulb Core (Emissive)
    mats['emissive_headlight'] = make_pbr_material(
        'Emissive_HalogenBeam',
        base_color=(1.00, 0.96, 0.88),
        emission_color=(1.00, 0.96, 0.88),
        emission_strength=20.0
    )
    
    # 15. Amber Torpedo Roof Bullet Clearance Lamp Core (Emissive)
    mats['emissive_amber'] = make_pbr_material(
        'Emissive_BulletAmber',
        base_color=(1.00, 0.52, 0.04),
        emission_color=(1.00, 0.52, 0.04),
        emission_strength=9.0
    )
    
    # 16. Ruby Red Rear 4" Round LED Stop/Tail Lamp Core (Emissive)
    mats['emissive_red'] = make_pbr_material(
        'Emissive_LEDStopRed',
        base_color=(1.00, 0.04, 0.02),
        emission_color=(1.00, 0.04, 0.02),
        emission_strength=14.0
    )
    
    # 17. American DOT Coiled Trailer Umbilical Lines (Red, Blue, Black)
    mats['suzie_red'] = make_pbr_material('Suzie_EmergencyAirRed', base_color=(0.86, 0.08, 0.08), roughness=0.35)
    mats['suzie_blue'] = make_pbr_material('Suzie_ServiceAirBlue', base_color=(0.08, 0.35, 0.85), roughness=0.35)
    mats['suzie_black'] = make_pbr_material('Suzie_Electrical7Pin', base_color=(0.04, 0.04, 0.04), roughness=0.45)
    
    # 18. Air Suspension Rolling-Lobe Rubber Bags
    mats['air_bag_rubber'] = make_pbr_material(
        'Rubber_LowAirLeafBag',
        base_color=(0.03, 0.03, 0.03),
        metallic=0.05,
        roughness=0.78
    )
    
    # 19. Satin Black Exterior Hardware & Window Gaskets
    mats['trim_black'] = make_pbr_material(
        'Plastic_SatinBlack',
        base_color=(0.025, 0.025, 0.025),
        metallic=0.02,
        roughness=0.60
    )
    
    # Populate dictionary by material name as well so both shorthand and exact names work
    for m in list(mats.values()):
        mats[m.name] = m
        
    print(f"[PETERBILT 379] Initialized {len(mats)} master PBR show-truck materials.")
    return mats

# ----------------------------------------------------------------------------
# 3. BMESH CAD UTILITY PRIMITIVES
# ----------------------------------------------------------------------------
def add_box_to_bmesh(bm, center, dimensions, rot_euler=None):
    """Adds an aligned or rotated box to an existing BMesh."""
    dx = dimensions[0] * 0.5
    dy = dimensions[1] * 0.5
    dz = dimensions[2] * 0.5
    
    verts = [
        Vector((-dx, -dy, -dz)),
        Vector(( dx, -dy, -dz)),
        Vector(( dx,  dy, -dz)),
        Vector((-dx,  dy, -dz)),
        Vector((-dx, -dy,  dz)),
        Vector(( dx, -dy,  dz)),
        Vector(( dx,  dy,  dz)),
        Vector((-dx,  dy,  dz)),
    ]
    
    if rot_euler:
        rot_mat = Euler(rot_euler, 'XYZ').to_matrix()
        verts = [rot_mat @ v for v in verts]
        
    c = Vector(center)
    bm_verts = [bm.verts.new(v + c) for v in verts]
    
    faces_idx = [
        (0, 1, 2, 3), # Bottom (-Z)
        (4, 7, 6, 5), # Top (+Z)
        (0, 4, 5, 1), # Front/Rear (-Y)
        (2, 6, 7, 3), # Rear/Front (+Y)
        (0, 3, 7, 4), # Left (-X)
        (1, 5, 6, 2), # Right (+X)
    ]
    
    new_faces = []
    for f in faces_idx:
        new_faces.append(bm.faces.new([bm_verts[i] for i in f]))
    return new_faces

def add_cylinder_to_bmesh(bm, center, radius, height, segments=24, axis='Z'):
    """Adds a smooth cylinder to an existing BMesh along any primary axis."""
    half_h = height * 0.5
    c = Vector(center)
    top_verts = []
    bot_verts = []
    
    for i in range(segments):
        angle = 2.0 * math.pi * (i / segments)
        cos_a = math.cos(angle) * radius
        sin_a = math.sin(angle) * radius
        
        if axis == 'Z':
            v_bot = Vector((cos_a, sin_a, -half_h))
            v_top = Vector((cos_a, sin_a,  half_h))
        elif axis == 'Y':
            v_bot = Vector((cos_a, -half_h, sin_a))
            v_top = Vector((cos_a,  half_h, sin_a))
        elif axis == 'X':
            v_bot = Vector((-half_h, cos_a, sin_a))
            v_top = Vector(( half_h, cos_a, sin_a))
        else:
            v_bot = Vector((cos_a, sin_a, -half_h))
            v_top = Vector((cos_a, sin_a,  half_h))
            
        bot_verts.append(bm.verts.new(v_bot + c))
        top_verts.append(bm.verts.new(v_top + c))
        
    for i in range(segments):
        next_i = (i + 1) % segments
        bm.faces.new([bot_verts[i], bot_verts[next_i], top_verts[next_i], top_verts[i]])
        
    bm.faces.new(list(reversed(bot_verts)))
    bm.faces.new(top_verts)

def add_tube_to_bmesh(bm, center, radius_outer, radius_inner, height, segments=24, axis='Z'):
    """Adds an open or capped hollow tubular cylinder to BMesh."""
    half_h = height * 0.5
    c = Vector(center)
    outer_bot = []
    outer_top = []
    inner_bot = []
    inner_top = []
    
    for i in range(segments):
        angle = 2.0 * math.pi * (i / segments)
        cos_o = math.cos(angle) * radius_outer
        sin_o = math.sin(angle) * radius_outer
        cos_i = math.cos(angle) * radius_inner
        sin_i = math.sin(angle) * radius_inner
        
        if axis == 'Z':
            outer_bot.append(bm.verts.new(Vector((cos_o, sin_o, -half_h)) + c))
            outer_top.append(bm.verts.new(Vector((cos_o, sin_o,  half_h)) + c))
            inner_bot.append(bm.verts.new(Vector((cos_i, sin_i, -half_h)) + c))
            inner_top.append(bm.verts.new(Vector((cos_i, sin_i,  half_h)) + c))
        elif axis == 'Y':
            outer_bot.append(bm.verts.new(Vector((cos_o, -half_h, sin_o)) + c))
            outer_top.append(bm.verts.new(Vector((cos_o,  half_h, sin_o)) + c))
            inner_bot.append(bm.verts.new(Vector((cos_i, -half_h, sin_i)) + c))
            inner_top.append(bm.verts.new(Vector((cos_i,  half_h, sin_i)) + c))
        elif axis == 'X':
            outer_bot.append(bm.verts.new(Vector((-half_h, cos_o, sin_o)) + c))
            outer_top.append(bm.verts.new(Vector(( half_h, cos_o, sin_o)) + c))
            inner_bot.append(bm.verts.new(Vector((-half_h, cos_i, sin_i)) + c))
            inner_top.append(bm.verts.new(Vector(( half_h, cos_i, sin_i)) + c))
            
    for i in range(segments):
        next_i = (i + 1) % segments
        bm.faces.new([outer_bot[i], outer_bot[next_i], outer_top[next_i], outer_top[i]])
        bm.faces.new([inner_top[i], inner_top[next_i], inner_bot[next_i], inner_bot[i]])
        bm.faces.new([outer_bot[next_i], outer_bot[i], inner_bot[i], inner_bot[next_i]])
        bm.faces.new([outer_top[i], outer_top[next_i], inner_top[next_i], inner_top[i]])

def add_arch_to_bmesh(bm, center, radius_outer, radius_inner, width, ang_start=0.0, ang_end=math.pi, segments=20, axis='X'):
    """Adds a smooth partial annular arch (semi-cylinder ribbon) to BMesh in Y-Z plane."""
    half_w = width * 0.5
    outer_v = []
    inner_v = []
    
    for i in range(segments + 1):
        t = i / segments
        ang = ang_start + (ang_end - ang_start) * t
        cos_a = math.cos(ang)
        sin_a = math.sin(ang)
        
        if axis == 'X':
            p_o0 = Vector((-half_w, cos_a * radius_outer, sin_a * radius_outer)) + Vector(center)
            p_o1 = Vector(( half_w, cos_a * radius_outer, sin_a * radius_outer)) + Vector(center)
            p_i0 = Vector((-half_w, cos_a * radius_inner, sin_a * radius_inner)) + Vector(center)
            p_i1 = Vector(( half_w, cos_a * radius_inner, sin_a * radius_inner)) + Vector(center)
            
            outer_v.append((bm.verts.new(p_o0), bm.verts.new(p_o1)))
            inner_v.append((bm.verts.new(p_i0), bm.verts.new(p_i1)))
            
    for i in range(segments):
        o0_c, o1_c = outer_v[i]
        o0_n, o1_n = outer_v[i + 1]
        i0_c, i1_c = inner_v[i]
        i0_n, i1_n = inner_v[i + 1]
        
        bm.faces.new([o0_c, o0_n, o1_n, o1_c])
        bm.faces.new([i1_c, i1_n, i0_n, i0_c])
        bm.faces.new([i0_c, i0_n, o0_n, o0_c])
        bm.faces.new([o1_c, o1_n, i1_n, i1_c])
        
    o0_s, o1_s = outer_v[0]
    i0_s, i1_s = inner_v[0]
    bm.faces.new([o0_s, o1_s, i1_s, i0_s])
    
    o0_e, o1_e = outer_v[-1]
    i0_e, i1_e = inner_v[-1]
    bm.faces.new([i0_e, i1_e, o1_e, o0_e])

def add_cone_to_bmesh(bm, center, radius_base, radius_top, height, segments=20, axis='Z'):
    """Adds a truncated conical frustum to BMesh."""
    half_h = height * 0.5
    c = Vector(center)
    bot_v = []
    top_v = []
    
    for i in range(segments):
        a = 2.0 * math.pi * (i / segments)
        cos_a = math.cos(a)
        sin_a = math.sin(a)
        
        if axis == 'Z':
            bot_v.append(bm.verts.new(Vector((cos_a * radius_base, sin_a * radius_base, -half_h)) + c))
            top_v.append(bm.verts.new(Vector((cos_a * radius_top, sin_a * radius_top,  half_h)) + c))
        elif axis == 'X':
            bot_v.append(bm.verts.new(Vector((-half_h, cos_a * radius_base, sin_a * radius_base)) + c))
            top_v.append(bm.verts.new(Vector(( half_h, cos_a * radius_top, sin_a * radius_top)) + c))
        elif axis == 'Y':
            bot_v.append(bm.verts.new(Vector((cos_a * radius_base, -half_h, sin_a * radius_base)) + c))
            top_v.append(bm.verts.new(Vector((cos_a * radius_top,  half_h, sin_a * radius_top)) + c))
            
    for i in range(segments):
        ni = (i + 1) % segments
        bm.faces.new([bot_v[i], bot_v[ni], top_v[ni], top_v[i]])
        
    if radius_base > 0.001:
        bm.faces.new(list(reversed(bot_v)))
    if radius_top > 0.001:
        bm.faces.new(top_v)

def add_chamfered_box_to_bmesh(bm, center, dimensions, chamfer=0.02):
    """Generates an octagonal prism / chamfered block along Z."""
    dx = dimensions[0] * 0.5
    dy = dimensions[1] * 0.5
    dz = dimensions[2] * 0.5
    c = Vector(center)
    
    ch = min(chamfer, dx * 0.4, dy * 0.4)
    profile = [
        (-dx + ch, -dy),
        ( dx - ch, -dy),
        ( dx,      -dy + ch),
        ( dx,       dy - ch),
        ( dx - ch,  dy),
        (-dx + ch,  dy),
        (-dx,       dy - ch),
        (-dx,      -dy + ch)
    ]
    
    bot_v = [bm.verts.new(Vector((p[0], p[1], -dz)) + c) for p in profile]
    top_v = [bm.verts.new(Vector((p[0], p[1],  dz)) + c) for p in profile]
    
    n = len(profile)
    for i in range(n):
        next_i = (i + 1) % n
        bm.faces.new([bot_v[i], bot_v[next_i], top_v[next_i], top_v[i]])
        
    bm.faces.new(list(reversed(bot_v)))
    bm.faces.new(top_v)

def create_bmesh_object(name, material, parent=None):
    """Helper that creates an empty Mesh, BMesh, and Object, assigning material and parent."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    
    if material:
        obj.data.materials.append(material)
    if parent:
        obj.parent = parent
        
    bm = bmesh.new()
    return obj, mesh, bm

def finalize_bmesh_object(obj, mesh, bm, smooth_angle=35.0):
    """Writes BMesh to Mesh, frees BMesh, and calculates smooth split normals."""
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    
    if hasattr(mesh, 'use_auto_smooth'):
        mesh.use_auto_smooth = True
        mesh.auto_smooth_angle = math.radians(smooth_angle)
    else:
        for f in mesh.polygons:
            f.use_smooth = True

# =============================================================================
# SUBSYSTEM 1: HEAVY C-CHANNEL LADDER CHASSIS FRAME & CROSSMEMBERS
# =============================================================================

def build_chassis_frame(materials, parent=None):
    """
    Constructs the Peterbilt 379 heavy-duty 10.75-inch heat-treated alloy steel
    C-channel ladder chassis frame, crossmembers, front bumper extensions,
    and rear frame closure crossmember.
    
    Dimensions:
    - Rail depth: 0.273 m (10.75 inches)
    - Flange width: 0.090 m (3.5 inches)
    - Rail thickness: 0.012 m (0.47 inches)
    - Overall frame width: 0.880 m (34.6 inches standard Class 8 frame)
    - Length: Y = +4.100 m to Y = -4.380 m (Total 8.480 m)
    - Frame top rail height: Z = 0.920 m
    """
    frame_obj, frame_mesh, bm = create_bmesh_object("Chassis_Frame_Assembly", materials['Paint_ChassisGlossBlack'], parent)
    
    rail_len = 8.480
    rail_y_center = (4.100 + (-4.380)) * 0.5  # -0.140 m
    web_h = 0.273
    flange_w = 0.090
    t = 0.012
    top_z = 0.920
    bot_z = top_z - web_h
    mid_z = (top_z + bot_z) * 0.5
    
    # Left (-X) and Right (+X) Main Frame Rails
    for side in [-1.0, 1.0]:
        web_x = side * (0.440 - t * 0.5)
        # Vertical web plate
        add_box_to_bmesh(bm, (web_x, rail_y_center, mid_z), (t, rail_len, web_h))
        
        # Upper horizontal flange (pointing inward toward centerline)
        flange_x = side * (0.440 - flange_w * 0.5)
        add_box_to_bmesh(bm, (flange_x, rail_y_center, top_z - t * 0.5), (flange_w, rail_len, t))
        
        # Lower horizontal flange (pointing inward toward centerline)
        add_box_to_bmesh(bm, (flange_x, rail_y_center, bot_z + t * 0.5), (flange_w, rail_len, t))
        
        # Front frame horns / bumper mounting brackets (reinforced extensions)
        horn_y = 4.120
        add_box_to_bmesh(bm, (web_x, horn_y, mid_z), (t * 2.0, 0.200, web_h + 0.040))
        add_box_to_bmesh(bm, (side * 0.380, horn_y, mid_z), (0.120, 0.020, web_h))
        
        # Front heavy drop-forged tow eye loops
        tow_x = side * 0.400
        add_tube_to_bmesh(bm, (tow_x, 4.130, bot_z + 0.060), 0.040, 0.020, 0.035, segments=16, axis='Y')
        add_cylinder_to_bmesh(bm, (tow_x, 4.100, bot_z + 0.060), 0.022, 0.060, segments=14, axis='Y')
        
        # Rear frame cut-off tapered end (45-degree dog-leg taper for trailer clearance)
        taper_y = -4.340
        add_box_to_bmesh(bm, (web_x, taper_y, bot_z + 0.040), (t * 1.5, 0.120, 0.080))
        
    # Transverse Structural Crossmembers
    # 1. Front radiator / steering crossmember (Y = +3.800)
    add_box_to_bmesh(bm, (0.0, 3.800, mid_z - 0.030), (0.860, 0.140, 0.100))
    add_cylinder_to_bmesh(bm, (0.0, 3.800, mid_z - 0.030), 0.050, 0.860, segments=16, axis='X')
    
    # 2. Front engine cradle / steer suspension crossmember (Y = +2.900, drop-center stamped channel)
    add_box_to_bmesh(bm, (0.0, 2.900, bot_z + 0.040), (0.860, 0.220, 0.060))
    add_box_to_bmesh(bm, (0.0, 2.900, bot_z - 0.040), (0.640, 0.180, 0.080))
    # Gusset triangular plates
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm, (side * 0.360, 2.900, bot_z + 0.080), (0.120, 0.180, 0.120))
        
    # 3. Transmission support / mid-chassis crossmember (Y = +1.500)
    add_box_to_bmesh(bm, (0.0, 1.500, mid_z - 0.020), (0.860, 0.160, 0.080))
    add_cylinder_to_bmesh(bm, (0.0, 1.500, mid_z - 0.020), 0.045, 0.860, segments=16, axis='X')
    
    # 4. Cab rear / sleeper mounting crossmember (Y = +0.100)
    add_box_to_bmesh(bm, (0.0, 0.100, top_z - 0.040), (0.860, 0.180, 0.060))
    add_box_to_bmesh(bm, (0.0, 0.100, mid_z), (0.860, 0.060, web_h * 0.7))
    
    # 5. Sleeper rear / forward tandem crossmember (Y = -1.650)
    add_box_to_bmesh(bm, (0.0, -1.650, mid_z), (0.860, 0.200, 0.100))
    add_cylinder_to_bmesh(bm, (0.0, -1.650, mid_z), 0.055, 0.860, segments=16, axis='X')
    
    # 6. Center tandem bogie heavy structural crossmember (Y = -2.975)
    add_box_to_bmesh(bm, (0.0, -2.975, mid_z + 0.020), (0.860, 0.240, 0.120))
    add_box_to_bmesh(bm, (0.0, -2.975, top_z - 0.030), (0.860, 0.320, 0.050))
    
    # 7. Rear tandem suspension torque rod crossmember (Y = -4.000)
    add_box_to_bmesh(bm, (0.0, -4.000, mid_z), (0.860, 0.180, 0.100))
    add_cylinder_to_bmesh(bm, (0.0, -4.000, mid_z), 0.050, 0.860, segments=16, axis='X')
    
    # 8. Rear extreme closure crossmember / light bar support (Y = -4.370)
    add_box_to_bmesh(bm, (0.0, -4.370, mid_z), (0.860, 0.080, web_h))
    add_cylinder_to_bmesh(bm, (0.0, -4.370, bot_z + 0.080), 0.045, 0.860, segments=16, axis='X')
    
    # Frame Rivet & Bolt Details (Substantive CAD clusters along frame web)
    for bolt_y in [3.80, 3.40, 2.90, 2.40, 1.80, 1.20, 0.60, 0.0, -0.60, -1.20, -1.65, -2.10, -2.70, -3.30, -3.80, -4.20]:
        for side in [-1.0, 1.0]:
            bx = side * 0.448
            for bz_off in [-0.08, 0.0, 0.08]:
                add_cylinder_to_bmesh(bm, (bx, bolt_y, mid_z + bz_off), 0.012, 0.016, segments=8, axis='X')
                
    finalize_bmesh_object(frame_obj, frame_mesh, bm)
    return frame_obj


# =============================================================================
# SUBSYSTEM 2: DANA SPICER FRONT STEER AXLE, LEAF SPRINGS & STEERING LINKAGE
# =============================================================================

def build_front_suspension_and_steer_axle(materials, parent=None):
    """
    Constructs the Dana Spicer E-1462I 14,600 lb drop-forged steel I-beam
    front steer axle, 4-inch wide taper-leaf springs, dual heavy hydraulic
    shock absorbers, steering knuckles, drag link, and tie rod.
    
    Steer Axle Center: Y = +2.900 m, Z = 0.535 m (11R24.5 spindle center)
    """
    susp_obj, susp_mesh, bm = create_bmesh_object("Front_Steer_Suspension", materials['Iron_CastHeavy'], parent)
    
    axle_y = 2.900
    axle_z = 0.535
    beam_drop_z = 0.445  # Dropped center for engine oil pan clearance
    
    # 1. Main Drop-Forged I-Beam Steer Axle
    # Center dropped beam segment
    add_box_to_bmesh(bm, (0.0, axle_y, beam_drop_z), (1.100, 0.085, 0.090))
    add_box_to_bmesh(bm, (0.0, axle_y, beam_drop_z + 0.040), (1.100, 0.110, 0.020))  # Top flange
    add_box_to_bmesh(bm, (0.0, axle_y, beam_drop_z - 0.040), (1.100, 0.110, 0.020))  # Bottom flange
    
    # Angled transition beams to outer kingpin king bosses
    for side in [-1.0, 1.0]:
        # Angled riser section
        kx = side * 0.720
        add_box_to_bmesh(bm, (side * 0.650, axle_y, (beam_drop_z + axle_z) * 0.5), (0.240, 0.090, 0.100))
        # Outer straight kingpin boss perch
        add_box_to_bmesh(bm, (side * 0.880, axle_y, axle_z), (0.240, 0.100, 0.110))
        
        # Vertical Kingpin Cylindrical Boss
        add_cylinder_to_bmesh(bm, (side * 0.980, axle_y, axle_z), 0.038, 0.220, segments=16, axis='Z')
        add_cylinder_to_bmesh(bm, (side * 0.980, axle_y, axle_z + 0.110), 0.045, 0.025, segments=16, axis='Z')
        add_cylinder_to_bmesh(bm, (side * 0.980, axle_y, axle_z - 0.110), 0.045, 0.025, segments=16, axis='Z')
        
        # Steering Knuckle Spindle
        spindle_x_start = side * 0.980
        spindle_x_end = side * 1.150
        spindle_x_mid = (spindle_x_start + spindle_x_end) * 0.5
        add_cylinder_to_bmesh(bm, (spindle_x_mid, axle_y, axle_z), 0.035, abs(spindle_x_end - spindle_x_start), segments=16, axis='X')
        # Wheel Spindle Brake Backing Plate Mounting Flange
        add_cylinder_to_bmesh(bm, (side * 1.020, axle_y, axle_z), 0.110, 0.025, segments=18, axis='X')
        
        # Steering Knuckle Arms
        # Lower tie-rod steering arm (pointing rearward)
        add_box_to_bmesh(bm, (side * 0.960, axle_y - 0.120, axle_z - 0.060), (0.045, 0.180, 0.040))
        add_cylinder_to_bmesh(bm, (side * 0.940, axle_y - 0.200, axle_z - 0.060), 0.022, 0.050, segments=12, axis='Z')
        
    # 2. Transverse Steering Tie Rod
    # Connects left and right steering knuckle arms behind axle
    tie_rod_y = axle_y - 0.200
    tie_rod_z = axle_z - 0.060
    add_cylinder_to_bmesh(bm, (0.0, tie_rod_y, tie_rod_z), 0.025, 1.880, segments=16, axis='X')
    # Tie rod ends with ball joint clamp sleeves
    for side in [-1.0, 1.0]:
        add_cylinder_to_bmesh(bm, (side * 0.900, tie_rod_y, tie_rod_z), 0.032, 0.080, segments=14, axis='X')
        add_box_to_bmesh(bm, (side * 0.900, tie_rod_y, tie_rod_z + 0.025), (0.060, 0.035, 0.030))
        
    # 3. Steering Gearbox, Pitman Arm & Drag Link (Driver side: -X)
    # Ross/TRW TAS65 integral power steering gear box mounted to driver rail
    gearbox_center = (-0.490, axle_y + 0.350, 0.820)
    add_box_to_bmesh(bm, gearbox_center, (0.120, 0.220, 0.160))
    add_cylinder_to_bmesh(bm, (-0.490, axle_y + 0.400, 0.820), 0.055, 0.180, segments=16, axis='Y')
    # Pitman Arm swinging downward
    pitman_top = (-0.510, axle_y + 0.350, 0.780)
    pitman_bot = (-0.510, axle_y + 0.300, 0.620)
    add_box_to_bmesh(bm, (-0.510, (pitman_top[1] + pitman_bot[1]) * 0.5, (pitman_top[2] + pitman_bot[2]) * 0.5), (0.030, 0.060, 0.170))
    add_cylinder_to_bmesh(bm, pitman_bot, 0.026, 0.045, segments=12, axis='X')
    # Drag Link connecting Pitman arm to left knuckle steering arm
    drag_start = Vector(pitman_bot)
    drag_end = Vector((-0.950, axle_y + 0.050, axle_z + 0.040))
    drag_mid = (drag_start + drag_end) * 0.5
    drag_len = (drag_end - drag_start).length
    add_cylinder_to_bmesh(bm, drag_mid, 0.022, drag_len, segments=14, axis='Y')
    
    # 4. Parabolic Taper-Leaf Spring Packs (4-inch wide steel leaf springs)
    # Length: 1.400 m, from Y = +2.200 m to Y = +3.600 m
    for side in [-1.0, 1.0]:
        spring_x = side * 0.440
        # Spring stack at axle center (clamped beneath axle beam)
        seat_z = beam_drop_z + 0.050
        
        # 3-Leaf Spring Arch
        # Main leaf
        add_box_to_bmesh(bm, (spring_x, axle_y, seat_z), (0.100, 0.300, 0.024))
        # Intermediate leaf
        add_box_to_bmesh(bm, (spring_x, axle_y, seat_z - 0.020), (0.100, 0.500, 0.018))
        # Rebound leaf
        add_box_to_bmesh(bm, (spring_x, axle_y, seat_z - 0.036), (0.100, 0.700, 0.016))
        
        # Forward spring eye and shackle bracket (Y = +3.550)
        eye_fwd = (spring_x, axle_y + 0.680, 0.720)
        add_cylinder_to_bmesh(bm, eye_fwd, 0.035, 0.120, segments=16, axis='X')
        add_box_to_bmesh(bm, (spring_x, eye_fwd[1], 0.790), (0.060, 0.100, 0.140))
        # Spring arch forward arm
        add_box_to_bmesh(bm, (spring_x, axle_y + 0.340, (seat_z + 0.720) * 0.5), (0.100, 0.680, 0.022))
        
        # Rearward spring shackle hanger (Y = +2.250)
        eye_rear = (spring_x, axle_y - 0.650, 0.740)
        add_cylinder_to_bmesh(bm, eye_rear, 0.035, 0.120, segments=16, axis='X')
        add_box_to_bmesh(bm, (spring_x, eye_rear[1], 0.800), (0.060, 0.100, 0.140))
        # Shackle plates (dual vertical links)
        for sx_off in [-0.055, 0.055]:
            add_box_to_bmesh(bm, (spring_x + sx_off, eye_rear[1], 0.710), (0.015, 0.050, 0.120))
        # Spring arch rearward arm
        add_box_to_bmesh(bm, (spring_x, axle_y - 0.320, (seat_z + 0.740) * 0.5), (0.100, 0.650, 0.022))
        
        # Spring U-Bolts (two Grade 8 square-bend U-bolts per spring)
        for ub_y in [axle_y - 0.080, axle_y + 0.080]:
            for ub_side in [-0.065, 0.065]:
                add_cylinder_to_bmesh(bm, (spring_x + ub_side, ub_y, seat_z), 0.012, 0.180, segments=10, axis='Z')
            # Top cast U-bolt clamp saddle
            add_box_to_bmesh(bm, (spring_x, ub_y, seat_z + 0.080), (0.150, 0.045, 0.035))
            
        # Heavy Hydraulic Telescopic Shock Absorber
        shock_bot = (side * 0.510, axle_y + 0.040, beam_drop_z + 0.080)
        shock_top = (side * 0.490, axle_y + 0.080, 0.880)
        shock_mid = ((shock_bot[0] + shock_top[0]) * 0.5, (shock_bot[1] + shock_top[1]) * 0.5, (shock_bot[2] + shock_top[2]) * 0.5)
        shock_len = (Vector(shock_top) - Vector(shock_bot)).length
        # Lower body tube
        add_cylinder_to_bmesh(bm, shock_mid, 0.042, shock_len * 0.55, segments=14, axis='Z')
        # Upper dust shield tube
        add_cylinder_to_bmesh(bm, (shock_mid[0], shock_mid[1], shock_mid[2] + 0.080), 0.048, shock_len * 0.50, segments=14, axis='Z')
        # Upper and lower mounting eyelets
        add_cylinder_to_bmesh(bm, shock_top, 0.024, 0.050, segments=12, axis='Y')
        add_cylinder_to_bmesh(bm, shock_bot, 0.024, 0.050, segments=12, axis='Y')
        
    finalize_bmesh_object(susp_obj, susp_mesh, bm)
    return susp_obj


# =============================================================================
# SUBSYSTEM 3: PETERBILT LOW AIR LEAF TANDEM REAR DRIVE BOGIE
# =============================================================================

def build_peterbilt_low_air_leaf_tandem_suspension(materials, parent=None):
    """
    Constructs the proprietary Peterbilt Low Air Leaf 40,000 lb tandem rear
    drive suspension with forward (Y = -2.300) and rearward (Y = -3.650)
    Meritor RT-40-145 drive axles, cast iron banjo housings, differential
    pumpkins, Z-beam trailing spring arms, rolling-lobe air bags, and torque rods.
    
    Tandem Spread: 1.350 m (53.1 inches)
    Spindle Center: Z = 0.535 m
    """
    bogie_obj, bogie_mesh, bm = create_bmesh_object("Tandem_Rear_Suspension", materials['Iron_CastHeavy'], parent)
    
    drive_axle_ys = [-2.300, -3.650]
    axle_z = 0.535
    
    for ax_idx, ax_y in enumerate(drive_axle_ys):
        # 1. Meritor Heavy Cast Steel Banjo Axle Housing
        # Central spherical differential pumpkin housing
        pumpkin_center = (0.0, ax_y, axle_z)
        add_cylinder_to_bmesh(bm, pumpkin_center, 0.220, 0.280, segments=24, axis='Y')
        add_cylinder_to_bmesh(bm, (0.0, ax_y - 0.120, axle_z), 0.180, 0.080, segments=20, axis='Y')
        # Pinion Input Flange & Yoke (facing forward)
        add_cylinder_to_bmesh(bm, (0.0, ax_y + 0.170, axle_z), 0.075, 0.120, segments=18, axis='Y')
        add_cylinder_to_bmesh(bm, (0.0, ax_y + 0.230, axle_z), 0.095, 0.025, segments=18, axis='Y')
        
        # Inter-Axle Differential Power Divider (on forward axle only)
        if ax_idx == 0:
            add_cylinder_to_bmesh(bm, (0.0, ax_y + 0.120, axle_z + 0.080), 0.065, 0.140, segments=16, axis='Y')
            # Through-shaft output yoke (facing rearward to back axle)
            add_cylinder_to_bmesh(bm, (0.0, ax_y - 0.160, axle_z + 0.080), 0.070, 0.100, segments=16, axis='Y')
            add_cylinder_to_bmesh(bm, (0.0, ax_y - 0.210, axle_z + 0.080), 0.090, 0.022, segments=16, axis='Y')
            
        # Left and Right Axle Tubes (heavy tapered tubular steel)
        for side in [-1.0, 1.0]:
            tube_start_x = side * 0.140
            tube_end_x = side * 1.050
            tube_mid_x = (tube_start_x + tube_end_x) * 0.5
            tube_w = abs(tube_end_x - tube_start_x)
            add_cylinder_to_bmesh(bm, (tube_mid_x, ax_y, axle_z), 0.085, tube_w, segments=20, axis='X')
            
            # Spindle outer end with brake flange
            add_cylinder_to_bmesh(bm, (side * 1.050, ax_y, axle_z), 0.130, 0.035, segments=20, axis='X')
            add_cylinder_to_bmesh(bm, (side * 1.150, ax_y, axle_z), 0.055, 0.200, segments=18, axis='X')
            
            # Heavy cast spring seats / axle mounting saddles
            add_box_to_bmesh(bm, (side * 0.440, ax_y, axle_z), (0.160, 0.180, 0.220))
            
    # 2. Peterbilt Low Air Leaf Suspension Components
    # 4 Trailing Spring Arms (Z-beams) & 4 Rolling-Lobe Air Bags
    for side in [-1.0, 1.0]:
        sx = side * 0.440
        
        # Center bogie frame hanger bracket (between the two axles at Y = -2.975)
        hanger_y = -2.975
        add_box_to_bmesh(bm, (sx, hanger_y, 0.720), (0.140, 0.320, 0.280))
        add_cylinder_to_bmesh(bm, (sx, hanger_y - 0.080, 0.620), 0.040, 0.160, segments=16, axis='X')
        add_cylinder_to_bmesh(bm, (sx, hanger_y + 0.080, 0.620), 0.040, 0.160, segments=16, axis='X')
        
        # Forward Axle Trailing Arm (runs forward from center hanger to Y = -2.300)
        # Front frame hanger at Y = -1.650
        fwd_hanger_y = -1.650
        add_box_to_bmesh(bm, (sx, fwd_hanger_y, 0.760), (0.140, 0.220, 0.240))
        add_cylinder_to_bmesh(bm, (sx, fwd_hanger_y, 0.680), 0.038, 0.160, segments=16, axis='X')
        
        # Forward trailing Z-beam (Y = -1.650 to Y = -2.550)
        add_box_to_bmesh(bm, (sx, -2.100, 0.580), (0.110, 0.900, 0.040))
        # Rearward cantilever extension carrying air bag perch (Y = -2.550)
        add_box_to_bmesh(bm, (sx, -2.480, 0.500), (0.120, 0.280, 0.040))
        
        # Rearward Axle Trailing Arm (runs from center hanger to Y = -3.650)
        add_box_to_bmesh(bm, (sx, -3.350, 0.580), (0.110, 0.900, 0.040))
        # Rear cantilever extension carrying air bag perch (Y = -3.900)
        add_box_to_bmesh(bm, (sx, -3.820, 0.500), (0.120, 0.280, 0.040))
        
        # 4 Massive Rolling-Lobe Air Bags (Goodyear/Firestone 1R12 series)
        for bag_y in [-2.550, -3.900]:
            # Lower pedestal mounting bracket
            add_cylinder_to_bmesh(bm, (sx, bag_y, 0.530), 0.120, 0.030, segments=20, axis='Z')
            # Convoluted elastomeric air spring bellow
            add_cylinder_to_bmesh(bm, (sx, bag_y, 0.650), 0.145, 0.210, segments=24, axis='Z')
            # Air bellow mid-girdle ring
            add_tube_to_bmesh(bm, (sx, bag_y, 0.650), 0.148, 0.140, 0.020, segments=24, axis='Z')
            # Top bead plate bolted to frame outrigger bracket
            add_cylinder_to_bmesh(bm, (sx, bag_y, 0.765), 0.130, 0.025, segments=20, axis='Z')
            add_box_to_bmesh(bm, (sx, bag_y, 0.820), (0.120, 0.220, 0.100))
            
        # 4 Heavy Telescopic Shock Absorbers (angled between axle seats and frame)
        for s_idx, ax_y in enumerate(drive_axle_ys):
            sh_bot = (side * 0.540, ax_y + 0.100, 0.520)
            sh_top = (side * 0.490, ax_y + 0.160, 0.850)
            sh_mid = ((sh_bot[0] + sh_top[0]) * 0.5, (sh_bot[1] + sh_top[1]) * 0.5, (sh_bot[2] + sh_top[2]) * 0.5)
            sh_len = (Vector(sh_top) - Vector(sh_bot)).length
            add_cylinder_to_bmesh(bm, sh_mid, 0.040, sh_len * 0.55, segments=14, axis='Z')
            add_cylinder_to_bmesh(bm, (sh_mid[0], sh_mid[1], sh_mid[2] + 0.060), 0.046, sh_len * 0.45, segments=14, axis='Z')
            
        # Transverse Panhard / V-Torque Rods (keeps axles centered)
        # Forward axle top torque rod (from frame crossmember to top of differential)
        add_cylinder_to_bmesh(bm, (0.0, -2.150, 0.760), 0.030, 0.350, segments=14, axis='Y')
        add_cylinder_to_bmesh(bm, (0.0, -3.500, 0.760), 0.030, 0.350, segments=14, axis='Y')
        
    finalize_bmesh_object(bogie_obj, bogie_mesh, bm)
    return bogie_obj


# =============================================================================
# SUBSYSTEM 4: 10-WHEEL FLEET (24.5" ALCOA FORGED WHEELS & 11R24.5 TIRES)
# =============================================================================

def build_10_wheel_fleet(materials, parent=None):
    """
    Constructs the complete 10-wheel Class 8 highway running fleet:
    - Steer Axle (2 wheels at Y = +2.900 m):
        Mirror-polished 24.5" x 8.25" Alcoa 10-hole forged aluminum wheels,
        10 spiked chrome 33mm lug nut covers, chrome center hub cap with
        Peterbilt red oval, 11R24.5 highway 5-rib steer tires.
    - Forward Tandem Drive Axle (4 dual wheels at Y = -2.300 m) &
    - Rearward Tandem Drive Axle (4 dual wheels at Y = -3.650 m):
        8 Alcoa 24.5" wheels (inner reversed dish, outer deep concave dish),
        chrome top-hat drive axle hub caps, spiked lug nuts, 11R24.5 deep-lug
        traction drive radial tires.
        
    Tire Outer Diameter: 1.070 m (Radius 0.535 m)
    Wheel Rim Diameter: 0.622 m (Radius 0.311 m)
    """
    fleet_parent = bpy.data.objects.new("Ten_Wheel_Fleet", None)
    bpy.context.scene.collection.objects.link(fleet_parent)
    if parent:
        fleet_parent.parent = parent
        
    tire_r = 0.535
    rim_r = 0.311
    hub_r = 0.142
    
    # -------------------------------------------------------------------------
    # A. Front Steer Wheels (2 Assemblies at Y = +2.900, X = +-1.020)
    # -------------------------------------------------------------------------
    steer_obj, steer_mesh, bm_steer = create_bmesh_object("Steer_Wheels_Alcoa", materials['Alloy_AlcoaPolished'], fleet_parent)
    stire_obj, stire_mesh, bm_stire = create_bmesh_object("Steer_Tires_11R24_5", materials['Rubber_CommercialTire'], fleet_parent)
    
    steer_y = 2.900
    steer_track_x = 1.020
    tire_w = 0.280  # 11R24.5 section width
    
    for side in [-1.0, 1.0]:
        wx = side * steer_track_x
        wheel_center = (wx, steer_y, tire_r)
        
        # 1. Steer Tire Torus with 5 Circumferential Tread Ribs
        # Main tire casing profile
        segments = 36
        outer_pts = []
        for i in range(segments):
            ang = 2.0 * math.pi * (i / segments)
            outer_pts.append((math.cos(ang) * tire_r, math.sin(ang) * tire_r))
            
        # Curved sidewall & tread block slices
        add_cylinder_to_bmesh(bm_stire, wheel_center, tire_r, tire_w * 0.75, segments=36, axis='X')
        add_tube_to_bmesh(bm_stire, wheel_center, tire_r, tire_r - 0.028, tire_w * 0.85, segments=36, axis='X')
        # Tire sidewall curvature rings
        for sx_off in [-tire_w * 0.40, tire_w * 0.40]:
            add_tube_to_bmesh(bm_stire, (wx + sx_off, steer_y, tire_r), tire_r - 0.015, rim_r + 0.020, 0.030, segments=32, axis='X')
            
        # 5 Highway Tread Rib Grooves (circumferential channels)
        for rib_off in [-0.08, -0.04, 0.0, 0.04, 0.08]:
            add_tube_to_bmesh(bm_stire, (wx + rib_off, steer_y, tire_r), tire_r + 0.003, tire_r - 0.012, 0.012, segments=36, axis='X')
            
        # 2. Alcoa 24.5" Steer Wheel Rim
        rim_w = 0.220
        # Outer stepped wheel rim lip
        add_tube_to_bmesh(bm_steer, wheel_center, rim_r + 0.015, rim_r - 0.010, rim_w, segments=32, axis='X')
        # Wheel flange outer curl
        outer_rim_x = wx + side * (rim_w * 0.5)
        add_tube_to_bmesh(bm_steer, (outer_rim_x, steer_y, tire_r), rim_r + 0.022, rim_r, 0.025, segments=32, axis='X')
        
        # Wheel Disc Face (stepped inset)
        disc_x = wx + side * (rim_w * 0.25)
        add_cylinder_to_bmesh(bm_steer, (disc_x, steer_y, tire_r), rim_r, 0.028, segments=32, axis='X')
        
        # 10 Classic Alcoa Oval / Round Hand Ventilation Holes
        hand_r = (rim_r + hub_r) * 0.58
        for h_idx in range(10):
            hang = 2.0 * math.pi * (h_idx / 10.0)
            hy = steer_y + math.sin(hang) * hand_r
            hz = tire_r + math.cos(hang) * hand_r
            add_cylinder_to_bmesh(bm_steer, (disc_x, hy, hz), 0.028, 0.032, segments=14, axis='X')
            # Chamfered hole surround ring
            add_tube_to_bmesh(bm_steer, (disc_x + side * 0.008, hy, hz), 0.034, 0.028, 0.010, segments=14, axis='X')
            
        # Center Hub Plate
        hub_x = wx + side * (rim_w * 0.35)
        add_cylinder_to_bmesh(bm_steer, (hub_x, steer_y, tire_r), hub_r, 0.030, segments=24, axis='X')
        
        # 10 Spiked 33mm Chrome Lug Nut Covers
        bolt_circle_r = 0.095
        for b_idx in range(10):
            bang = 2.0 * math.pi * (b_idx / 10.0) + (math.pi / 10.0)  # offset between hand holes
            by = steer_y + math.sin(bang) * bolt_circle_r
            bz = tire_r + math.cos(bang) * bolt_circle_r
            # Hex nut base
            nut_base_x = hub_x + side * 0.020
            add_cylinder_to_bmesh(bm_steer, (nut_base_x, by, bz), 0.018, 0.025, segments=6, axis='X')
            # Spiked bullet cone tip
            nut_tip_x = nut_base_x + side * 0.035
            add_cone_to_bmesh(bm_steer, (nut_tip_x, by, bz), 0.018, 0.002, 0.050, segments=12, axis='X')
            
        # Center Bullet / Dome Hub Cap
        cap_center_x = hub_x + side * 0.045
        add_cylinder_to_bmesh(bm_steer, (cap_center_x, steer_y, tire_r), 0.065, 0.040, segments=20, axis='X')
        add_cone_to_bmesh(bm_steer, (cap_center_x + side * 0.030, steer_y, tire_r), 0.065, 0.035, 0.035, segments=20, axis='X')
        
    finalize_bmesh_object(steer_obj, steer_mesh, bm_steer)
    finalize_bmesh_object(stire_obj, stire_mesh, bm_stire)
    
    # -------------------------------------------------------------------------
    # B. Tandem Rear Drive Wheels (8 Dual Assemblies across 2 Tandem Axles)
    # -------------------------------------------------------------------------
    drive_wheel_obj, drive_wheel_mesh, bm_dwheel = create_bmesh_object("Drive_Wheels_Alcoa", materials['Alloy_AlcoaPolished'], fleet_parent)
    dtire_obj, dtire_mesh, bm_dtire = create_bmesh_object("Drive_Tires_DeepLug_11R24_5", materials['Rubber_CommercialTire'], fleet_parent)
    
    dual_spacing = 0.325  # Lateral spacing between inner and outer dual tire centers
    inner_track_x = 0.880
    outer_track_x = inner_track_x + dual_spacing  # 1.205 m (Overall truck width over tires: 2.480 m)
    
    drive_ys = [-2.300, -3.650]
    
    for dy in drive_ys:
        for side in [-1.0, 1.0]:
            # Inner Wheel Assembly (X = +-0.880)
            inner_x = side * inner_track_x
            inner_center = (inner_x, dy, tire_r)
            
            # Outer Wheel Assembly (X = +-1.205)
            outer_x = side * outer_track_x
            outer_center = (outer_x, dy, tire_r)
            
            for tire_center, is_outer in [(inner_center, False), (outer_center, True)]:
                tx = tire_center[0]
                
                # 1. Deep-Lug Traction Drive Tire (11R24.5)
                # Outer tire tread casing
                add_cylinder_to_bmesh(bm_dtire, tire_center, tire_r, tire_w * 0.78, segments=36, axis='X')
                add_tube_to_bmesh(bm_dtire, tire_center, tire_r, tire_r - 0.032, tire_w * 0.88, segments=36, axis='X')
                # Sidewall torus bulges
                for sx_off in [-tire_w * 0.40, tire_w * 0.40]:
                    add_tube_to_bmesh(bm_dtire, (tx + sx_off, dy, tire_r), tire_r - 0.015, rim_r + 0.020, 0.030, segments=32, axis='X')
                    
                # Aggressive Mud & Snow Staggered Deep Lug Tread Blocks
                # 28 transverse/diagonal tread lug grooves around circumference
                num_lugs = 28
                for lug_idx in range(num_lugs):
                    lang = 2.0 * math.pi * (lug_idx / num_lugs)
                    ly = dy + math.sin(lang) * (tire_r - 0.006)
                    lz = tire_r + math.cos(lang) * (tire_r - 0.006)
                    # Lateral traction cross-groove
                    add_box_to_bmesh(bm_dtire, (tx, ly, lz), (tire_w * 0.75, 0.022, 0.025))
                    
                # 2. Alcoa 24.5" Forged Wheel Rim
                # Inner rim is mounted convex-out (dished inward toward chassis)
                # Outer rim is mounted concave-out (deep dish with massive outer lip)
                add_tube_to_bmesh(bm_dwheel, tire_center, rim_r + 0.015, rim_r - 0.010, rim_w, segments=32, axis='X')
                
                if is_outer:
                    # Outer Dual Wheel: Deep Inset Dish (Mirror-polished outside face)
                    outer_lip_x = tx + side * (rim_w * 0.50)
                    add_tube_to_bmesh(bm_dwheel, (outer_lip_x, dy, tire_r), rim_r + 0.022, rim_r, 0.035, segments=32, axis='X')
                    
                    # Inset disc face deep inside rim
                    deep_disc_x = tx - side * (rim_w * 0.15)
                    add_cylinder_to_bmesh(bm_dwheel, (deep_disc_x, dy, tire_r), rim_r, 0.028, segments=32, axis='X')
                    
                    # 10 Hand Ventilation Holes in deep dish
                    for h_idx in range(10):
                        hang = 2.0 * math.pi * (h_idx / 10.0)
                        hy = dy + math.sin(hang) * hand_r
                        hz = tire_r + math.cos(hang) * hand_r
                        add_cylinder_to_bmesh(bm_dwheel, (deep_disc_x, hy, hz), 0.028, 0.035, segments=14, axis='X')
                        
                    # 10 Spiked Chrome Lug Nut Covers on Outer Hub Circle
                    outer_hub_x = deep_disc_x + side * 0.025
                    add_cylinder_to_bmesh(bm_dwheel, (outer_hub_x, dy, tire_r), hub_r, 0.025, segments=24, axis='X')
                    for b_idx in range(10):
                        bang = 2.0 * math.pi * (b_idx / 10.0) + (math.pi / 10.0)
                        by = dy + math.sin(bang) * bolt_circle_r
                        bz = tire_r + math.cos(bang) * bolt_circle_r
                        # Hex base + Spiked cone
                        nut_x = outer_hub_x + side * 0.018
                        add_cylinder_to_bmesh(bm_dwheel, (nut_x, by, bz), 0.018, 0.025, segments=6, axis='X')
                        add_cone_to_bmesh(bm_dwheel, (nut_x + side * 0.032, by, bz), 0.018, 0.002, 0.045, segments=12, axis='X')
                        
                    # Chrome "Top-Hat" Axle Drive Hub Cover
                    # Covers the drive axle spindle bolts on rear tandems
                    top_hat_x = outer_hub_x + side * 0.055
                    add_cylinder_to_bmesh(bm_dwheel, (top_hat_x, dy, tire_r), 0.082, 0.075, segments=24, axis='X')
                    # Top-hat flange ring with 8 mini chrome perimeter bolts
                    add_cylinder_to_bmesh(bm_dwheel, (top_hat_x - side * 0.030, dy, tire_r), 0.098, 0.018, segments=24, axis='X')
                    for pb_idx in range(8):
                        p_ang = 2.0 * math.pi * (pb_idx / 8.0)
                        py = dy + math.sin(p_ang) * 0.090
                        pz = tire_r + math.cos(p_ang) * 0.090
                        add_cylinder_to_bmesh(bm_dwheel, (top_hat_x - side * 0.030, py, pz), 0.009, 0.025, segments=8, axis='X')
                        
                else:
                    # Inner Dual Wheel: Convex disc face (reversed mounting)
                    inner_disc_x = tx + side * (rim_w * 0.25)
                    add_cylinder_to_bmesh(bm_dwheel, (inner_disc_x, dy, tire_r), rim_r, 0.028, segments=32, axis='X')
                    for h_idx in range(10):
                        hang = 2.0 * math.pi * (h_idx / 10.0)
                        hy = dy + math.sin(hang) * hand_r
                        hz = tire_r + math.cos(hang) * hand_r
                        add_cylinder_to_bmesh(bm_dwheel, (inner_disc_x, hy, hz), 0.028, 0.032, segments=14, axis='X')
                        
    finalize_bmesh_object(drive_wheel_obj, drive_wheel_mesh, bm_dwheel)
    finalize_bmesh_object(dtire_obj, dtire_mesh, bm_dtire)
    return fleet_parent


# =============================================================================
# SUBSYSTEM 5: HOLLAND / JOST HEAVY SLIDING FIFTH-WHEEL ASSEMBLY
# =============================================================================

def build_sliding_fifth_wheel(materials, parent=None):
    """
    Constructs the Holland FW35 / Jost heavy cast steel 50,000 lb sliding
    fifth-wheel coupling assembly mounted above the tandem drive bogie:
    - 72-inch toothed slide base angle rails
    - Air-operated sliding carriage rack with spring-loaded locking plungers
    - Dual pivot trunnion bracket pedestals
    - Cast steel top plate (horseshoe shape) with flared guide ramps
    - Forged kingpin lock jaws and grease retention grooves
    - Manual emergency release pull handle lever extending past driver rail
    
    Mounted Position: Center at Y = -2.850 m, Z = 1.080 m
    """
    fw_obj, fw_mesh, bm = create_bmesh_object("Sliding_Fifth_Wheel_Assembly", materials['Iron_CastHeavy'], parent)
    
    fw_center_y = -2.850
    fw_top_z = 1.080
    rail_top_z = 0.920
    
    # 1. 72-Inch Toothed Slide Base Rails (Bolted directly to frame top flange)
    # Length: 1.800 m, from Y = -1.950 to Y = -3.750
    slide_y_start = -1.950
    slide_y_end = -3.750
    slide_len = abs(slide_y_end - slide_y_start)
    slide_mid_y = (slide_y_start + slide_y_end) * 0.5
    
    for side in [-1.0, 1.0]:
        sx = side * 0.440
        # Heavy mounting base angle
        add_box_to_bmesh(bm, (sx, slide_mid_y, rail_top_z + 0.010), (0.110, slide_len, 0.020))
        # Vertical toothed rack rail
        rack_x = side * 0.485
        add_box_to_bmesh(bm, (rack_x, slide_mid_y, rail_top_z + 0.045), (0.025, slide_len, 0.055))
        
        # 24 Locking Teeth along slide rack
        num_teeth = 24
        for t_idx in range(num_teeth):
            ty = slide_y_start - (t_idx * (slide_len / num_teeth))
            add_box_to_bmesh(bm, (rack_x + side * 0.012, ty, rail_top_z + 0.045), (0.018, 0.040, 0.045))
            
    # 2. Sliding Carriage Slider Plate
    slider_len = 0.700
    slider_w = 0.960
    slider_z = rail_top_z + 0.055
    add_box_to_bmesh(bm, (0.0, fw_center_y, slider_z), (slider_w, slider_len, 0.035))
    
    # Air-actuated locking plunger cylinders (locks carriage into rack teeth)
    for side in [-1.0, 1.0]:
        add_cylinder_to_bmesh(bm, (side * 0.470, fw_center_y - 0.120, slider_z), 0.030, 0.140, segments=14, axis='X')
        add_cylinder_to_bmesh(bm, (side * 0.470, fw_center_y + 0.120, slider_z), 0.030, 0.140, segments=14, axis='X')
        
    # 3. Dual Cast Steel Pivot Trunnion Pedestals
    for side in [-1.0, 1.0]:
        ped_x = side * 0.360
        add_box_to_bmesh(bm, (ped_x, fw_center_y, slider_z + 0.055), (0.120, 0.450, 0.090))
        # Pivot trunnion cross-pin boss
        add_cylinder_to_bmesh(bm, (ped_x, fw_center_y, fw_top_z - 0.045), 0.045, 0.140, segments=18, axis='X')
        
    # 4. Holland FW35 Horseshoe Cast Top Plate
    # Main forward deck section
    plate_w = 0.940
    plate_len = 0.920
    plate_thick = 0.045
    add_box_to_bmesh(bm, (0.0, fw_center_y + 0.180, fw_top_z), (plate_w, 0.540, plate_thick))
    
    # Central Throat & Kingpin Pocket (recessed funnel)
    add_cylinder_to_bmesh(bm, (0.0, fw_center_y + 0.050, fw_top_z), 0.075, plate_thick + 0.010, segments=20, axis='Z')
    
    # Left and Right Rear Flared Guide Ramps (tapered downward at rear)
    for side in [-1.0, 1.0]:
        ramp_x = side * 0.320
        # Forward flat horn section
        add_box_to_bmesh(bm, (ramp_x, fw_center_y - 0.160, fw_top_z), (0.280, 0.220, plate_thick))
        # Downward angled rear ramp tip
        add_box_to_bmesh(bm, (ramp_x, fw_center_y - 0.340, fw_top_z - 0.045), (0.260, 0.200, plate_thick * 0.8))
        
    # Perimeter Skirt Flange & Internal Stiffening Ribs
    add_box_to_bmesh(bm, (0.0, fw_center_y + 0.440, fw_top_z - 0.035), (plate_w, 0.040, 0.080))
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm, (side * (plate_w * 0.5 - 0.015), fw_center_y + 0.180, fw_top_z - 0.035), (0.030, 0.540, 0.080))
        
    # Horseshoe Grease Grooves Pattern (molded surface channels for fifth wheel grease)
    for gang in [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.14]:
        gy = fw_center_y + 0.180 + math.sin(gang) * 0.260
        gx = math.cos(gang) * 0.320
        add_cylinder_to_bmesh(bm, (gx, gy, fw_top_z + 0.022), 0.012, 0.010, segments=8, axis='Z')
        
    # Manual Release Pull Handle (extends out driver side: -X)
    handle_y = fw_center_y + 0.100
    handle_z = fw_top_z - 0.020
    # Long pull rod
    add_cylinder_to_bmesh(bm, (-0.460, handle_y, handle_z), 0.012, 0.420, segments=10, axis='X')
    # Loop pull grip handle
    add_tube_to_bmesh(bm, (-0.680, handle_y, handle_z), 0.045, 0.025, 0.018, segments=14, axis='Z')
    
    finalize_bmesh_object(fw_obj, fw_mesh, bm)
    return fw_obj

# =============================================================================
# SUBSYSTEM 6: 127-INCH BBC EXTENDED HOOD, PIANO HINGE & FENDER FLARES
# =============================================================================

def build_127_bbc_extended_hood(materials, parent=None):
    """
    Constructs the legendary Peterbilt 379 127-inch BBC (Bumper-to-Back-of-Cab)
    extended square aluminum hood:
    - Center piano-hinge spine running from radiator shell back to cab cowl (2.44 m long)
    - Flat crown aluminum top sheets with subtle lateral crown
    - Vertical side hood panels with 14 stamped cooling louvers per side
    - 4 dog-bone rubber hood hold-down latches with chrome catches
    - Full-length sweeping front fender flares with rolled outer wheel lips
    - Under-hood guide splash aprons
    
    Dimensions:
    - Hood Length: Y = +1.480 m (cab cowl) to Y = +3.920 m (grille surround) = 2.440 m
    - Hood Top Height: Z = 1.620 m (front) to Z = 1.660 m (rear)
    - Hood Box Width: 0.980 m (X = -0.490 to +0.490)
    - Fender Span Width: 2.360 m (X = -1.180 to +1.180 over steer tires)
    """
    hood_obj, hood_mesh, bm_hood = create_bmesh_object("Hood_Main_Assembly", materials['Paint_PeterbiltBlack'], parent)
    chrome_obj, chrome_mesh, bm_chrome = create_bmesh_object("Hood_Chrome_Jewelry", materials['Chrome_MirrorPeterbilt'], parent)
    
    hood_y_rear = 1.480
    hood_y_fwd = 3.920
    hood_len = hood_y_fwd - hood_y_rear  # 2.440 m
    hood_y_mid = (hood_y_fwd + hood_y_rear) * 0.5
    
    hood_z_fwd = 1.620
    hood_z_rear = 1.660
    hood_z_mid = (hood_z_fwd + hood_z_rear) * 0.5
    hood_half_w = 0.490
    
    # 1. Hood Top Crown Sheets (Left and Right halves divided by center hinge)
    top_thick = 0.015
    for side in [-1.0, 1.0]:
        top_cx = side * (hood_half_w * 0.5)
        # Main top slope panel
        add_box_to_bmesh(bm_hood, (top_cx, hood_y_mid, hood_z_mid), (hood_half_w, hood_len, top_thick))
        
        # Upper outer rounded hood shoulder bevel
        shoulder_x = side * (hood_half_w - 0.025)
        add_cylinder_to_bmesh(bm_hood, (shoulder_x, hood_y_mid, hood_z_mid - 0.020), 0.035, hood_len, segments=16, axis='Y')
        
    # 2. Center Polished Stainless Steel Piano-Hinge Spine
    # Continuous piano hinge strip with central hinge pin
    add_box_to_bmesh(bm_chrome, (0.0, hood_y_mid, hood_z_mid + 0.010), (0.036, hood_len + 0.040, 0.018))
    add_cylinder_to_bmesh(bm_chrome, (0.0, hood_y_mid, hood_z_mid + 0.018), 0.012, hood_len + 0.040, segments=16, axis='Y')
    
    # Classic Hood Crown Ornament (Stainless Swan / Eagle Fin at front tip of hinge)
    ornament_y = hood_y_fwd + 0.010
    ornament_z = hood_z_fwd + 0.035
    add_box_to_bmesh(bm_chrome, (0.0, ornament_y, ornament_z), (0.018, 0.120, 0.045))
    add_cone_to_bmesh(bm_chrome, (0.0, ornament_y + 0.040, ornament_z + 0.015), 0.016, 0.002, 0.060, segments=12, axis='Y')
    
    # 3. Vertical Side Hood Panels
    side_panel_h = 0.540
    side_panel_z = hood_z_mid - (side_panel_h * 0.5) - 0.020
    for side in [-1.0, 1.0]:
        sx = side * hood_half_w
        add_box_to_bmesh(bm_hood, (sx, hood_y_mid, side_panel_z), (top_thick, hood_len, side_panel_h))
        
        # Lower hood sill trim strip (polished aluminum beltline)
        add_box_to_bmesh(bm_chrome, (side * (hood_half_w + 0.008), hood_y_mid, side_panel_z - (side_panel_h * 0.5)), (0.015, hood_len, 0.022))
        
        # 14 Stamped Horizontal Cooling Louvers per side
        louver_start_y = 2.400
        louver_end_y = 3.200
        num_louvers = 14
        louver_step = (louver_end_y - louver_start_y) / num_louvers
        for l_idx in range(num_louvers):
            ly = louver_start_y + (l_idx * louver_step)
            for lz_row in [side_panel_z - 0.060, side_panel_z + 0.060]:
                add_box_to_bmesh(bm_hood, (side * (hood_half_w + 0.006), ly, lz_row), (0.014, 0.042, 0.014))
                
        # Dog-Bone Rubber Hood Hold-Down Latches (Front and Rear latches)
        for latch_y in [1.680, 3.650]:
            # Lower chrome latch base on frame/fender
            add_box_to_bmesh(bm_chrome, (side * (hood_half_w + 0.020), latch_y, side_panel_z - (side_panel_h * 0.5) - 0.020), (0.025, 0.040, 0.045))
            # Black rubber dog-bone tension strap
            add_cylinder_to_bmesh(bm_hood, (side * (hood_half_w + 0.022), latch_y, side_panel_z - (side_panel_h * 0.5) + 0.020), 0.012, 0.080, segments=12, axis='Z')
            # Upper chrome hood catch bracket
            add_box_to_bmesh(bm_chrome, (side * (hood_half_w + 0.018), latch_y, side_panel_z - (side_panel_h * 0.5) + 0.065), (0.022, 0.035, 0.030))
            
    # 4. Sweeping Front Full-Width Fender Flares (Over Steer Wheels)
    # Wheel Center: Y = +2.900, Z = 0.535, Tire Radius: 0.535 m
    fender_w = 0.690  # From X = 0.490 to X = 1.180
    fender_r = 0.640  # Wheel arch clearance radius
    
    for side in [-1.0, 1.0]:
        fx_center = side * (0.490 + fender_w * 0.5)  # 0.835 m
        
        # Crown arch over front tire (smooth continuous Class-A curved arch)
        add_arch_to_bmesh(bm_hood, (fx_center, 2.900, 0.535), fender_r, fender_r - 0.020, fender_w, ang_start=math.radians(15.0), ang_end=math.radians(165.0), segments=32, axis='X')
        # Outer rolled fender flare lip (continuous mirror chrome bead)
        add_arch_to_bmesh(bm_chrome, (side * 1.180, 2.900, 0.535), fender_r + 0.008, fender_r - 0.015, 0.024, ang_start=math.radians(15.0), ang_end=math.radians(165.0), segments=32, axis='X')
            
        # Front sweeping fender curve down to bumper (Y = +3.600 to Y = +3.950)
        fwd_sweep_y = 3.750
        fwd_sweep_z = 0.760
        add_box_to_bmesh(bm_hood, (fx_center, fwd_sweep_y, fwd_sweep_z), (fender_w, 0.380, 0.018))
        add_box_to_bmesh(bm_chrome, (side * 1.180, fwd_sweep_y, fwd_sweep_z), (0.022, 0.380, 0.022))
        
        # Rear sweeping fender drop down to cab boarding step (Y = +2.200 to Y = +1.750)
        rear_sweep_y = 1.980
        rear_sweep_z = 0.800
        add_box_to_bmesh(bm_hood, (fx_center, rear_sweep_y, rear_sweep_z), (fender_w, 0.460, 0.018))
        add_box_to_bmesh(bm_chrome, (side * 1.180, rear_sweep_y, rear_sweep_z), (0.022, 0.460, 0.022))
        
        # Inner fender wheel tub liner (prevents see-through into engine bay)
        add_box_to_bmesh(bm_hood, (side * 0.510, 2.900, 0.850), (0.020, 1.400, 0.600))
        
    finalize_bmesh_object(hood_obj, hood_mesh, bm_hood)
    finalize_bmesh_object(chrome_obj, chrome_mesh, bm_chrome)
    return hood_obj


# =============================================================================
# SUBSYSTEM 7: TOWERING POLISHED GRILLE SURROUND, EMBLEM & RADIATOR
# =============================================================================

def build_towering_grille_and_peterbilt_oval(materials, parent=None):
    """
    Constructs the towering Peterbilt mirror-polished cast aluminum radiator
    grille surround shell, red Peterbilt oval emblem, punched-oval stainless
    steel rock guard mesh, and heavy copper/brass cooling pack core.
    
    Position:
    - Front face: Y = +3.940 m
    - Height: Z = 0.820 m to Z = 1.650 m (Height 0.830 m)
    - Width: 0.980 m (X = -0.490 to +0.490 m)
    """
    grille_obj, grille_mesh, bm_grille = create_bmesh_object("Grille_Surround_Assembly", materials['Chrome_MirrorPeterbilt'], parent)
    mesh_obj, mesh_data, bm_mesh = create_bmesh_object("Grille_Perforated_Mesh", materials['Alloy_AlcoaPolished'], parent)
    badge_obj, badge_mesh, bm_badge = create_bmesh_object("Peterbilt_Red_Oval_Badge", materials['Badge_PeterbiltRedOval'], parent)
    
    gy = 3.940
    gz_bot = 0.820
    gz_top = 1.640
    gz_mid = (gz_bot + gz_top) * 0.5
    gh = gz_top - gz_bot
    gw = 0.980
    frame_thick = 0.065
    depth = 0.090
    
    # 1. Outer Polished Aluminum Crown Header Bar (Top Arch)
    # Curved crown peaking in the center
    add_box_to_bmesh(bm_grille, (0.0, gy, gz_top - 0.035), (gw, depth, frame_thick))
    add_cylinder_to_bmesh(bm_grille, (0.0, gy + 0.020, gz_top - 0.010), 0.028, gw, segments=20, axis='X')
    
    # 2. Bottom Chin Apron Bar
    add_box_to_bmesh(bm_grille, (0.0, gy, gz_bot + 0.030), (gw, depth, frame_thick * 0.9))
    
    # 3. Left and Right Vertical Grille Pillars
    for side in [-1.0, 1.0]:
        px = side * (gw * 0.5 - frame_thick * 0.5)
        add_box_to_bmesh(bm_grille, (px, gy, gz_mid), (frame_thick, depth, gh))
        # Rounded outer vertical corner bullnose
        add_cylinder_to_bmesh(bm_grille, (side * (gw * 0.5), gy, gz_mid), 0.030, gh, segments=16, axis='Z')
        
    # 4. Authentic Red Peterbilt Oval Emblem
    # Mounted centrally on the top header bar: Y = +3.985, Z = 1.600
    badge_y = gy + (depth * 0.5) + 0.008
    badge_z = gz_top - 0.040
    badge_w = 0.160
    badge_h = 0.075
    # Red enamel oval core
    add_cylinder_to_bmesh(bm_badge, (0.0, badge_y, badge_z), badge_h * 0.5, 0.016, segments=24, axis='Y')
    # Chrome oval outer bezel ring
    add_tube_to_bmesh(bm_grille, (0.0, badge_y + 0.002, badge_z), (badge_w * 0.5) + 0.008, (badge_w * 0.5), 0.018, segments=24, axis='Y')
    # Raised chrome center script bar
    add_box_to_bmesh(bm_grille, (0.0, badge_y + 0.006, badge_z), (0.110, 0.012, 0.016))
    
    # 5. Stainless Steel Punched-Oval Grille Guard Screen
    # Flat interior mesh sheet recessed 0.030 m inside frame
    mesh_w = gw - (frame_thick * 1.8)
    mesh_h = gh - (frame_thick * 1.8)
    mesh_y = gy - 0.015
    add_box_to_bmesh(bm_mesh, (0.0, mesh_y, gz_mid), (mesh_w, 0.008, mesh_h))
    
    # Vertical and Horizontal Structural Grille Mesh Stiffener Ribs
    # Center vertical chrome divider bar
    add_box_to_bmesh(bm_grille, (0.0, gy + 0.005, gz_mid), (0.024, depth * 0.8, mesh_h))
    # 3 Horizontal chrome divider bars
    for h_div_z in [gz_bot + gh * 0.25, gz_bot + gh * 0.50, gz_bot + gh * 0.75]:
        add_box_to_bmesh(bm_grille, (0.0, gy + 0.005, h_div_z), (mesh_w, depth * 0.8, 0.018))
        
    # Simulated Punched Oval Hole Matrix (Patterned Louver Strips)
    num_rows = 16
    for r_idx in range(num_rows):
        rz = gz_bot + frame_thick + (r_idx * (mesh_h / num_rows))
        for col_x in [-0.32, -0.22, -0.12, 0.12, 0.22, 0.32]:
            add_cylinder_to_bmesh(bm_mesh, (col_x, mesh_y + 0.004, rz), 0.014, 0.010, segments=10, axis='Y')
            
    # 6. Heavy Radiator Core & CAC Matrix (Behind Grille)
    rad_y = gy - 0.120
    add_box_to_bmesh(bm_mesh, (0.0, rad_y, gz_mid), (0.840, 0.080, gh * 0.90))
    # Radiator upper and lower tanks
    add_cylinder_to_bmesh(bm_mesh, (0.0, rad_y, gz_top - 0.030), 0.060, 0.840, segments=16, axis='X')
    add_cylinder_to_bmesh(bm_mesh, (0.0, rad_y, gz_bot + 0.040), 0.060, 0.840, segments=16, axis='X')
    
    finalize_bmesh_object(grille_obj, grille_mesh, bm_grille)
    finalize_bmesh_object(mesh_obj, mesh_data, bm_mesh)
    finalize_bmesh_object(badge_obj, badge_mesh, bm_badge)
    return grille_obj


# =============================================================================
# SUBSYSTEM 8: TEXAS-STYLE 18-INCH BLIND-MOUNT CHROME FRONT BUMPER
# =============================================================================

def build_texas_drop_chrome_front_bumper(materials, parent=None):
    """
    Constructs the iconic Texas-style 18-inch blind-mount drop box mirror-chrome
    front bumper:
    - 18 inches (0.457 m) tall, extending down to 0.280 m ground clearance
    - Full width 2.440 m spanning across front fender flares
    - Rolled top lip and tapered swept rearward corner wing wraps
    - Recessed center tow pin pocket with heavy horizontal steel tow pin
    - Recessed round halogen fog lamps with fluted glass lenses
    - Stainless commercial license plate bracket
    
    Mounted Position: Y = +4.120 m, Z = 0.510 m (Top Z = 0.740 m, Bot Z = 0.280 m)
    """
    bumper_obj, bumper_mesh, bm_bmp = create_bmesh_object("Front_Bumper_Chrome", materials['Chrome_MirrorPeterbilt'], parent)
    fog_glass_obj, fog_glass_mesh, bm_fglass = create_bmesh_object("Fog_Lamp_Glass", materials['Glass_HeadlampFluted'], parent)
    fog_beam_obj, fog_beam_mesh, bm_fbeam = create_bmesh_object("Fog_Lamp_Bulbs", materials['Emissive_HalogenBeam'], parent)
    
    by = 4.120
    bz_top = 0.740
    bz_bot = 0.280
    bh = bz_top - bz_bot  # 0.460 m (18.1 inches)
    bz_mid = (bz_top + bz_bot) * 0.5
    bw = 2.440
    b_thick = 0.045
    
    # 1. Main Center Bumper Box Face
    add_box_to_bmesh(bm_bmp, (0.0, by, bz_mid), (bw * 0.78, b_thick, bh))
    
    # Rolled top lip tube
    add_cylinder_to_bmesh(bm_bmp, (0.0, by - (b_thick * 0.4), bz_top), 0.024, bw * 0.78, segments=18, axis='X')
    # Bottom curled edge
    add_cylinder_to_bmesh(bm_bmp, (0.0, by - (b_thick * 0.4), bz_bot), 0.018, bw * 0.78, segments=16, axis='X')
    
    # 2. Left and Right Swept Wing Corners (Wrap around front tires)
    wing_w = (bw - (bw * 0.78)) * 0.5  # ~0.27 m per side
    for side in [-1.0, 1.0]:
        wing_cx = side * ((bw * 0.78 * 0.5) + (wing_w * 0.5))
        # Angled rearward wing
        add_box_to_bmesh(bm_bmp, (wing_cx, by - 0.060, bz_mid), (wing_w, b_thick * 1.5, bh))
        # Rounded outer corner transition
        add_cylinder_to_bmesh(bm_bmp, (side * (bw * 0.78 * 0.5), by, bz_mid), 0.035, bh, segments=16, axis='Z')
        
    # 3. Recessed Center Tow Pin Pocket & Horizontal Pin
    # Cutout pocket at center
    add_box_to_bmesh(bm_bmp, (0.0, by - 0.020, bz_mid), (0.160, 0.080, 0.120))
    # Heavy steel tow pin
    add_cylinder_to_bmesh(bm_bmp, (0.0, by - 0.010, bz_mid), 0.022, 0.140, segments=16, axis='Z')
    # Tow pin retainer hitch pin
    add_cylinder_to_bmesh(bm_bmp, (0.0, by - 0.010, bz_mid + 0.060), 0.008, 0.060, segments=10, axis='X')
    
    # 4. Recessed Round Halogen Fog / Driving Lamps
    for side in [-1.0, 1.0]:
        fog_x = side * 0.720
        fog_z = bz_mid - 0.020
        # Chrome recessed housing canister
        add_cylinder_to_bmesh(bm_bmp, (fog_x, by - 0.020, fog_z), 0.068, 0.080, segments=20, axis='Y')
        # Chrome outer retaining bezel ring
        add_tube_to_bmesh(bm_bmp, (fog_x, by + (b_thick * 0.5) + 0.002, fog_z), 0.072, 0.058, 0.016, segments=20, axis='Y')
        # Optical fluted glass lens
        add_cylinder_to_bmesh(bm_fglass, (fog_x, by + (b_thick * 0.5) + 0.006, fog_z), 0.060, 0.010, segments=20, axis='Y')
        # Glowing halogen bulb
        add_cylinder_to_bmesh(bm_fbeam, (fog_x, by, fog_z), 0.015, 0.025, segments=12, axis='Y')
        
    # 5. Stainless Commercial License Plate Bracket
    plate_x = -0.320
    plate_z = bz_mid + 0.010
    add_box_to_bmesh(bm_bmp, (plate_x, by + (b_thick * 0.5) + 0.005, plate_z), (0.310, 0.008, 0.160))
    # License plate fastener bolts
    for lx_off in [-0.13, 0.13]:
        for lz_off in [-0.06, 0.06]:
            add_cylinder_to_bmesh(bm_bmp, (plate_x + lx_off, by + (b_thick * 0.5) + 0.012, plate_z + lz_off), 0.006, 0.012, segments=8, axis='Y')
            
    finalize_bmesh_object(bumper_obj, bumper_mesh, bm_bmp)
    finalize_bmesh_object(fog_glass_obj, fog_glass_mesh, bm_fglass)
    finalize_bmesh_object(fog_beam_obj, fog_beam_mesh, bm_fbeam)
    return bumper_obj


# =============================================================================
# SUBSYSTEM 9: DUAL RECTANGULAR HEADLIGHT PODS ON FENDER PEDESTALS
# =============================================================================

def build_dual_rectangular_headlight_pods(materials, parent=None):
    """
    Constructs the classic Peterbilt dual rectangular sealed-beam headlight
    assemblies mounted on cast stainless steel fender pedestal brackets:
    - Dual sealed-beam halogen lamps (high and low beams)
    - Chrome rectangular housing pods
    - Optical fluted glass dispersion lenses
    - Lower integrated amber turn signal / parking markers
    - Cast aerodynamic fender mounting pedestals
    
    Mounted Position: X = +-0.980 m, Y = +3.680 m, Z = 1.140 m
    """
    pod_obj, pod_mesh, bm_pod = create_bmesh_object("Headlamp_Chrome_Pods", materials['Chrome_MirrorPeterbilt'], parent)
    glass_obj, glass_mesh, bm_glass = create_bmesh_object("Headlamp_Clear_Lenses", materials['Glass_HeadlampFluted'], parent)
    beam_obj, beam_mesh, bm_beam = create_bmesh_object("Headlamp_Halogen_Bulbs", materials['Emissive_HalogenBeam'], parent)
    turn_glass_obj, turn_glass_mesh, bm_tglass = create_bmesh_object("Turn_Signal_Amber_Lenses", materials['Glass_AmberIndicator'], parent)
    turn_glow_obj, turn_glow_mesh, bm_tglow = create_bmesh_object("Turn_Signal_Amber_Bulbs", materials['Emissive_BulletAmber'], parent)
    
    pod_y = 3.680
    pod_z = 1.140
    pod_w = 0.380
    pod_h = 0.170
    pod_d = 0.180
    
    for side in [-1.0, 1.0]:
        pod_x = side * 0.780
        
        # 1. Cast Polished Pedestal Bracket (Bolted to top of fender flare)
        ped_z_bot = 0.940  # Fender top surface
        ped_h = pod_z - ped_z_bot
        add_box_to_bmesh(bm_pod, (pod_x, pod_y, (ped_z_bot + pod_z) * 0.5), (0.090, 0.140, ped_h))
        # Pedestal mounting flange with 4 chrome mounting studs
        add_box_to_bmesh(bm_pod, (pod_x, pod_y, ped_z_bot + 0.010), (0.120, 0.180, 0.020))
        for sx in [-0.045, 0.045]:
            for sy in [-0.065, 0.065]:
                add_cylinder_to_bmesh(bm_pod, (pod_x + sx, pod_y + sy, ped_z_bot + 0.025), 0.009, 0.018, segments=8, axis='Z')
                
        # 2. Main Rectangular Chrome Headlamp Pod Housing
        add_box_to_bmesh(bm_pod, (pod_x, pod_y, pod_z), (pod_w, pod_d, pod_h))
        # Aerodynamic curved rear pod cap
        add_cylinder_to_bmesh(bm_pod, (pod_x, pod_y - (pod_d * 0.35), pod_z), pod_h * 0.48, pod_w * 0.95, segments=16, axis='X')
        
        # 3. Dual Rectangular Sealed-Beam Halogen Lamps (Inner and Outer)
        lamp_w = 0.155
        lamp_h = 0.105
        for l_idx, lx_off in enumerate([-0.095, 0.095]):
            lamp_x = pod_x + lx_off
            lamp_y = pod_y + (pod_d * 0.5)
            lamp_z = pod_z + 0.015
            
            # Chrome retaining bezel rim
            add_box_to_bmesh(bm_pod, (lamp_x, lamp_y, lamp_z), (lamp_w + 0.018, 0.022, lamp_h + 0.018))
            # Recessed reflector bucket
            add_box_to_bmesh(bm_pod, (lamp_x, lamp_y - 0.030, lamp_z), (lamp_w, 0.040, lamp_h))
            # Optical fluted clear glass lens
            add_box_to_bmesh(bm_glass, (lamp_x, lamp_y + 0.010, lamp_z), (lamp_w, 0.012, lamp_h))
            # Glowing halogen filament bulb
            add_cylinder_to_bmesh(bm_beam, (lamp_x, lamp_y - 0.015, lamp_z), 0.016, 0.025, segments=12, axis='Y')
            
        # 4. Lower Amber Turn Signal / Parking Light
        turn_y = pod_y + (pod_d * 0.5)
        turn_z = pod_z - (pod_h * 0.36)
        turn_w = pod_w * 0.88
        turn_h = 0.042
        # Chrome bezel
        add_box_to_bmesh(bm_pod, (pod_x, turn_y, turn_z), (turn_w + 0.014, 0.018, turn_h + 0.012))
        # Fluted amber optic lens
        add_box_to_bmesh(bm_tglass, (pod_x, turn_y + 0.008, turn_z), (turn_w, 0.010, turn_h))
        # Amber bulb glow
        add_cylinder_to_bmesh(bm_tglow, (pod_x, turn_y, turn_z), 0.012, 0.020, segments=10, axis='Y')
        
    finalize_bmesh_object(pod_obj, pod_mesh, bm_pod)
    finalize_bmesh_object(glass_obj, glass_mesh, bm_glass)
    finalize_bmesh_object(beam_obj, beam_mesh, bm_beam)
    finalize_bmesh_object(turn_glass_obj, turn_glass_mesh, bm_tglass)
    finalize_bmesh_object(turn_glow_obj, turn_glow_mesh, bm_tglow)
    return pod_obj


# =============================================================================
# SUBSYSTEM 10: DUAL 15-INCH DONALDSON EXTERNAL CHROME AIR CLEANERS
# =============================================================================

def build_dual_15inch_donaldson_chrome_air_cleaners(materials, parent=None):
    """
    Constructs the dual 15-inch cylindrical external Donaldson mirror-polished
    stainless steel air cleaner canisters mounted on the hood sides:
    - 15-inch (0.381 m) diameter cylinders with mirror chrome finish
    - Top mushroom cyclone intake cap with perimeter vortex slots
    - Bottom dust bowl with rubber duckbill ejector valve
    - Dual heavy stainless steel strap mounting brackets to cowl/frame
    - 7-inch (0.178 m) polished stainless steel intake tube elbow running into hood
    
    Mounted Position: X = +-0.680 m, Y = +1.680 m, Z = 1.480 m
    """
    cleaner_obj, cleaner_mesh, bm = create_bmesh_object("Air_Cleaners_Donaldson", materials['Chrome_MirrorPeterbilt'], parent)
    
    can_r = 0.190  # 15-inch diameter
    can_h = 0.780
    can_y = 1.680
    can_z = 1.480
    
    for side in [-1.0, 1.0]:
        can_x = side * 0.680
        center = (can_x, can_y, can_z)
        
        # 1. Main Cylindrical Canister Body
        add_cylinder_to_bmesh(bm, center, can_r, can_h, segments=32, axis='Z')
        # Seam weld ring ribs along canister
        for r_off in [-0.22, 0.0, 0.22]:
            add_tube_to_bmesh(bm, (can_x, can_y, can_z + r_off), can_r + 0.008, can_r, 0.015, segments=32, axis='Z')
            
        # 2. Bottom Domed Dust Collection Bowl
        bot_z = can_z - (can_h * 0.5)
        add_cylinder_to_bmesh(bm, (can_x, can_y, bot_z - 0.025), can_r * 0.88, 0.050, segments=28, axis='Z')
        add_cone_to_bmesh(bm, (can_x, can_y, bot_z - 0.065), can_r * 0.88, 0.040, 0.060, segments=24, axis='Z')
        # Rubber dust ejector duckbill valve
        add_box_to_bmesh(bm, (can_x, can_y, bot_z - 0.105), (0.035, 0.040, 0.035))
        
        # 3. Top Mushroom Cyclone Intake Cap
        top_z = can_z + (can_h * 0.5)
        # Neck collar ring
        add_cylinder_to_bmesh(bm, (can_x, can_y, top_z + 0.025), can_r * 0.72, 0.050, segments=28, axis='Z')
        # Flared mushroom vortex lid
        add_cylinder_to_bmesh(bm, (can_x, can_y, top_z + 0.075), can_r * 1.15, 0.045, segments=32, axis='Z')
        add_cone_to_bmesh(bm, (can_x, can_y, top_z + 0.115), can_r * 1.15, can_r * 0.50, 0.045, segments=32, axis='Z')
        
        # 16 Circumferential Intake Louver Slits around cap collar
        for slot_idx in range(16):
            sang = 2.0 * math.pi * (slot_idx / 16.0)
            sx = can_x + math.sin(sang) * (can_r * 0.73)
            sy = can_y + math.cos(sang) * (can_r * 0.73)
            add_box_to_bmesh(bm, (sx, sy, top_z + 0.025), (0.012, 0.012, 0.035))
            
        # 4. Heavy Stainless Steel Mounting Stanchion Brackets (2 per canister)
        for b_off in [-0.20, 0.20]:
            bz = can_z + b_off
            # Wrap-around clamp band
            add_tube_to_bmesh(bm, (can_x, can_y, bz), can_r + 0.014, can_r, 0.035, segments=32, axis='Z')
            # Clamp bolt tightener lugs
            add_box_to_bmesh(bm, (can_x + side * (can_r + 0.016), can_y, bz), (0.025, 0.040, 0.035))
            # Stanchion arm reaching to hood side / cab cowl
            stanchion_arm_w = abs(can_x - (side * 0.500))
            stanchion_mid_x = (can_x + side * 0.500) * 0.5
            add_box_to_bmesh(bm, (stanchion_mid_x, can_y, bz), (stanchion_arm_w, 0.050, 0.025))
            
        # 5. 7-Inch Mandrel-Bent Polished Stainless Intake Elbow Tube
        # Curving inward from canister into hood engine compartment
        tube_r = 0.089  # 7-inch diameter
        tube_start = (can_x - side * (can_r * 0.6), can_y, can_z - 0.080)
        tube_end = (side * 0.480, can_y - 0.050, can_z - 0.160)
        t_mid = ((tube_start[0] + tube_end[0]) * 0.5, (tube_start[1] + tube_end[1]) * 0.5, (tube_start[2] + tube_end[2]) * 0.5)
        add_cylinder_to_bmesh(bm, t_mid, tube_r, abs(tube_start[0] - tube_end[0]), segments=20, axis='X')
        # Rubber sealing hood grommet
        add_tube_to_bmesh(bm, (side * 0.490, tube_end[1], tube_end[2]), tube_r + 0.025, tube_r, 0.025, segments=20, axis='X')
        
    finalize_bmesh_object(cleaner_obj, cleaner_mesh, bm)
    return cleaner_obj

# =============================================================================
# SUBSYSTEM 11: UNIBILT 63-INCH ULTRACAB SLEEPER & CAB WITH DOME RIVETS
# =============================================================================

def build_unibilt_ultracab_sleeper_and_cab(materials, parent=None):
    """
    Constructs the iconic Peterbilt Unibilt integrated cab and 63-inch UltraCab
    raised-roof sleeper compartment:
    - Day Cab section (Y = +1.480 m to Y = 0.000 m)
    - 63-Inch UltraCab sleeper section (Y = 0.000 m to Y = -1.600 m)
    - Aerodynamic raised fiberglass UltraCab roof cap (rising to Z = 3.320 m)
    - Aircraft-style dome rivet seams along cowl, beltline, roof, and sleeper panels
    - Dual aerodynamic tinted glass Vista observation windows in raised roof
    - Lower sleeper baggage access doors on both sides with push-button locks
    - Structural rear sleeper wall with stiffening ribs and air ride suspension
    
    Overall Dimensions:
    - Width: 2.180 m (X = -1.090 m to +1.090 m)
    - Length: 3.080 m (Y = +1.480 m to -1.600 m)
    - Height: Z = 1.080 m (sill) to Z = 3.320 m (UltraCab roof crown)
    """
    cab_parent = bpy.data.objects.new("Unibilt_Cab_Sleeper_Assembly", None)
    bpy.context.scene.collection.objects.link(cab_parent)
    if parent:
        cab_parent.parent = parent
        
    cab_body_obj, cab_body_mesh, bm_body = create_bmesh_object("Cab_Body_Panels", materials['Paint_PeterbiltBlack'], cab_parent)
    roof_obj, roof_mesh, bm_roof = create_bmesh_object("UltraCab_Raised_Roof", materials['Paint_PeterbiltBlack'], cab_parent)
    rivet_obj, rivet_mesh, bm_rivet = create_bmesh_object("Aircraft_Dome_Rivets", materials['Alloy_AlcoaPolished'], cab_parent)
    vista_obj, vista_mesh, bm_vista = create_bmesh_object("Vista_Windows_Tint", materials['Glass_WindshieldTint'], cab_parent)
    door_hw_obj, door_hw_mesh, bm_hw = create_bmesh_object("Sleeper_Door_Hardware", materials['Chrome_MirrorPeterbilt'], cab_parent)
    
    # Coordinates
    cowl_y = 1.480
    split_y = 0.000   # Junction between cab and sleeper
    rear_y = -1.600
    total_len = cowl_y - rear_y  # 3.080 m
    mid_y = (cowl_y + rear_y) * 0.5  # -0.060 m
    
    sill_z = 1.080
    belt_z = 1.680
    cab_roof_z = 2.450
    ultracab_roof_z = 3.320
    half_w = 1.090
    
    # 1. Lower Cab & Sleeper Sill and Floor Pan (Enclosed underbody)
    add_box_to_bmesh(bm_body, (0.0, mid_y, sill_z + 0.020), (half_w * 2.0, total_len, 0.040))
    # Outer sill extrusion skirts
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm_body, (side * (half_w - 0.020), mid_y, sill_z + 0.010), (0.040, total_len, 0.060))
        
    # 2. Main Cab & Sleeper Vertical Side Walls (Left and Right)
    for side in [-1.0, 1.0]:
        wx = side * half_w
        wall_h = cab_roof_z - sill_z
        # Day cab side panel (Y = +1.480 to 0.000)
        cab_sec_len = cowl_y - split_y
        cab_sec_y = (cowl_y + split_y) * 0.5
        add_box_to_bmesh(bm_body, (wx, cab_sec_y, (sill_z + cab_roof_z) * 0.5), (0.025, cab_sec_len, wall_h))
        
        # Sleeper side panel (Y = 0.000 to -1.600)
        sleep_sec_len = split_y - rear_y
        sleep_sec_y = (split_y + rear_y) * 0.5
        add_box_to_bmesh(bm_body, (wx, sleep_sec_y, (sill_z + cab_roof_z) * 0.5), (0.025, sleep_sec_len, wall_h))
        
        # Vertical Unibilt joint transition molding (at Y = 0.000)
        add_box_to_bmesh(bm_hw, (side * (half_w + 0.008), split_y, (sill_z + cab_roof_z) * 0.5), (0.016, 0.040, wall_h))
        
        # Lower Sleeper Baggage Access Door (Both sides at Y = -0.850, Z = 1.420)
        bag_y = -0.850
        bag_z = 1.420
        bag_w = 0.540
        bag_h = 0.440
        # Recessed door outline bead
        add_box_to_bmesh(bm_body, (side * (half_w + 0.005), bag_y, bag_z), (0.012, bag_w, bag_h))
        # Perimeter rubber weatherseal gasket
        add_tube_to_bmesh(bm_body, (side * (half_w + 0.008), bag_y, bag_z), 0.260, 0.245, 0.010, segments=20, axis='X')
        # Chrome flush push-button latch handle
        add_box_to_bmesh(bm_hw, (side * (half_w + 0.014), bag_y + (bag_w * 0.35), bag_z), (0.016, 0.060, 0.040))
        add_cylinder_to_bmesh(bm_hw, (side * (half_w + 0.018), bag_y + (bag_w * 0.35), bag_z), 0.012, 0.012, segments=12, axis='X')
        
    # 3. Front Cab Cowl Structure & Firewall
    # Front cowl bulkhead sloping down to meet hood at Y = +1.480, Z = 1.660
    add_box_to_bmesh(bm_body, (0.0, cowl_y - 0.030, (sill_z + belt_z) * 0.5), (half_w * 2.0, 0.060, belt_z - sill_z))
    # Cowl top shelf panel (between windshield base and hood rear)
    add_box_to_bmesh(bm_body, (0.0, cowl_y - 0.060, belt_z), (half_w * 1.95, 0.120, 0.030))
    
    # 4. UltraCab Aerodynamic Raised Sleeper Roof Cap
    # Sweeps upward from cab roof (Z = 2.450 at Y = +0.800) to Z = 3.320 m over sleeper
    roof_len = cowl_y - rear_y
    # Day cab base roof sheet
    add_box_to_bmesh(bm_roof, (0.0, (cowl_y + split_y) * 0.5, cab_roof_z), (half_w * 1.98, cab_sec_len, 0.030))
    
    # UltraCab Raised Aerodynamic Shell
    # Front aerodynamic fiberglass slope rising from Y = +0.600 to Y = 0.000, Z = 2.450 to 3.280
    slope_y = 0.300
    slope_z = (cab_roof_z + ultracab_roof_z) * 0.5
    add_box_to_bmesh(bm_roof, (0.0, slope_y, slope_z), (half_w * 1.92, 0.600, 0.035))
    
    # Sleeper Upper Roof Cap (Y = 0.000 to -1.600, Z = 3.300)
    sleep_roof_y = (split_y + rear_y) * 0.5
    add_box_to_bmesh(bm_roof, (0.0, sleep_roof_y, ultracab_roof_z), (half_w * 1.92, sleep_sec_len, 0.040))
    
    # Upper UltraCab Vertical Side Extension Walls (Between Z = 2.450 and Z = 3.300)
    for side in [-1.0, 1.0]:
        cap_wx = side * (half_w - 0.040)
        cap_h = ultracab_roof_z - cab_roof_z
        add_box_to_bmesh(bm_roof, (cap_wx, sleep_roof_y, (cab_roof_z + ultracab_roof_z) * 0.5), (0.025, sleep_sec_len, cap_h))
        
        # Aerodynamic curved top roof crown radius
        add_cylinder_to_bmesh(bm_roof, (cap_wx, sleep_roof_y, ultracab_roof_z - 0.025), 0.055, sleep_sec_len, segments=16, axis='Y')
        
        # Dual Tinted Glass Vista Observation Windows (Upper UltraCab Side Windows)
        vista_y = -0.500
        vista_z = 2.850
        vista_w = 0.650
        vista_h = 0.320
        # Chrome window surround bezel
        add_box_to_bmesh(bm_hw, (side * (half_w - 0.025), vista_y, vista_z), (0.016, vista_w + 0.030, vista_h + 0.030))
        # Tinted glass pane
        add_box_to_bmesh(bm_vista, (side * (half_w - 0.022), vista_y, vista_z), (0.012, vista_w, vista_h))
        
    # 5. Rear Sleeper Bulkhead Wall (Y = -1.600)
    rear_wall_h = ultracab_roof_z - sill_z
    add_box_to_bmesh(bm_body, (0.0, rear_y, (sill_z + ultracab_roof_z) * 0.5), (half_w * 1.96, 0.035, rear_wall_h))
    # 3 Stamped Horizontal Stiffening Ribs on Rear Wall
    for rib_z in [1.500, 2.100, 2.700]:
        add_box_to_bmesh(bm_body, (0.0, rear_y - 0.015, rib_z), (half_w * 1.85, 0.025, 0.045))
        
    # Vertical Stainless Steel Grab Rails on Rear Sleeper Wall Corners
    for side in [-1.0, 1.0]:
        rx = side * (half_w - 0.120)
        # 1.2 m tall grab rail
        add_cylinder_to_bmesh(bm_hw, (rx, rear_y - 0.060, 1.950), 0.016, 1.200, segments=12, axis='Z')
        # Standoff brackets
        for bz in [1.400, 1.950, 2.500]:
            add_cylinder_to_bmesh(bm_hw, (rx, rear_y - 0.030, bz), 0.014, 0.060, segments=10, axis='Y')
            
    # 6. Aircraft-Style Dome Rivets (Hundreds of Substantive 3D Rivet Heads)
    # Peterbilt is celebrated for its authentic exposed aircraft dome rivets
    # Cowl beltline rivet row
    num_cowl_rivets = 22
    for i in range(num_cowl_rivets):
        cx = -half_w * 0.90 + (i * (half_w * 1.80 / num_cowl_rivets))
        add_cylinder_to_bmesh(bm_rivet, (cx, cowl_y - 0.020, belt_z + 0.020), 0.007, 0.010, segments=8, axis='Z')
        
    # Beltline side rivet rows along cab and sleeper
    num_side_rivets = 28
    for side in [-1.0, 1.0]:
        sx = side * (half_w + 0.008)
        for i in range(num_side_rivets):
            ry = cowl_y - 0.050 - (i * (total_len - 0.100) / num_side_rivets)
            add_cylinder_to_bmesh(bm_rivet, (sx, ry, belt_z + 0.010), 0.006, 0.010, segments=8, axis='X')
            add_cylinder_to_bmesh(bm_rivet, (sx, ry, cab_roof_z - 0.030), 0.006, 0.010, segments=8, axis='X')
            
    # Rear sleeper wall vertical rivet seams
    for side in [-1.0, 1.0]:
        rx = side * (half_w * 0.75)
        for r_idx in range(20):
            rz = sill_z + 0.100 + (r_idx * (rear_wall_h - 0.200) / 20.0)
            add_cylinder_to_bmesh(bm_rivet, (rx, rear_y - 0.018, rz), 0.006, 0.010, segments=8, axis='Y')
            
    finalize_bmesh_object(cab_body_obj, cab_body_mesh, bm_body)
    finalize_bmesh_object(roof_obj, roof_mesh, bm_roof)
    finalize_bmesh_object(rivet_obj, rivet_mesh, bm_rivet)
    finalize_bmesh_object(vista_obj, vista_mesh, bm_vista)
    finalize_bmesh_object(door_hw_obj, door_hw_mesh, bm_hw)
    return cab_parent


# =============================================================================
# SUBSYSTEM 12: TWO-PIECE SPLIT WINDSHIELD & 14-INCH GANGSTER DROP VISOR
# =============================================================================

def build_split_windshield_and_gangster_visor(materials, parent=None):
    """
    Constructs the classic Peterbilt 2-piece flat split windshield and the
    dramatic 14-inch mirror-polished stainless steel "gangster" drop sun visor:
    - Left and Right flat laminated safety glass panes with subtle tint
    - Center stainless steel vertical divider post / center pillar
    - Black perimeter rubber weatherstrip gasket
    - Dual pantograph windshield wiper arms with 20-inch wiper blades
    - 14-inch mirror chrome gangster drop visor angled over upper windshield
    
    Windshield Position: Y = +1.460 m (cowl) to Y = +1.200 m (brow), Z = 1.680 to 2.320 m
    """
    glass_obj, glass_mesh, bm_glass = create_bmesh_object("Windshield_Split_Panes", materials['Glass_WindshieldTint'], parent)
    visor_obj, visor_mesh, bm_visor = create_bmesh_object("Gangster_Drop_Sun_Visor", materials['Chrome_MirrorPeterbilt'], parent)
    wiper_obj, wiper_mesh, bm_wiper = create_bmesh_object("Windshield_Wipers_Chrome", materials['Chrome_MirrorPeterbilt'], parent)
    
    y_bot = 1.450
    y_top = 1.200
    z_bot = 1.700
    z_top = 2.340
    y_mid = (y_bot + y_top) * 0.5  # 1.325 m
    z_mid = (z_bot + z_top) * 0.5  # 2.020 m
    pane_h = math.sqrt((y_top - y_bot)**2 + (z_top - z_bot)**2)  # ~0.687 m
    pane_w = 0.940  # Each pane width
    
    # 1. Left and Right Flat Windshield Glass Panes
    for side in [-1.0, 1.0]:
        px = side * (pane_w * 0.5 + 0.020)
        # Angled glass pane
        add_box_to_bmesh(bm_glass, (px, y_mid, z_mid), (pane_w, 0.015, pane_h))
        
        # Black rubber perimeter weatherstrip gasket
        add_box_to_bmesh(bm_wiper, (px, y_mid - 0.010, z_mid), (pane_w + 0.035, 0.020, pane_h + 0.035))
        
    # 2. Center Stainless Steel Divider Post (Pillar)
    # The signature Peterbilt vertical split post
    add_box_to_bmesh(bm_visor, (0.0, y_mid, z_mid), (0.038, 0.035, pane_h + 0.040))
    add_cylinder_to_bmesh(bm_visor, (0.0, y_mid + 0.015, z_mid), 0.016, pane_h + 0.040, segments=12, axis='Z')
    
    # 3. Dual Windshield Wiper Assemblies
    # Parked horizontally at the bottom of the windshield
    for side in [-1.0, 1.0]:
        wp_x = side * 0.460
        wp_y = y_bot - 0.030
        wp_z = z_bot + 0.040
        # Chrome wiper motor pivot boss
        add_cylinder_to_bmesh(bm_wiper, (wp_x, wp_y, wp_z), 0.018, 0.030, segments=12, axis='Y')
        # Pantograph dual articulated wiper arm
        add_box_to_bmesh(bm_wiper, (wp_x + side * 0.160, wp_y - 0.015, wp_z + 0.020), (0.320, 0.012, 0.012))
        add_box_to_bmesh(bm_wiper, (wp_x + side * 0.160, wp_y - 0.015, wp_z + 0.040), (0.320, 0.012, 0.010))
        # 20-inch wiper blade bridge and rubber refill
        add_box_to_bmesh(bm_wiper, (wp_x + side * 0.220, wp_y - 0.018, wp_z + 0.030), (0.420, 0.014, 0.016))
        
    # 4. 14-Inch Stainless Steel "Gangster" Drop Sun Visor
    # Dramatic deep drop shielding upper windshield, full cab width 2.190 m
    visor_w = 2.190
    visor_drop_len = 0.360  # 14.2 inches
    visor_y = y_top + 0.080
    visor_z = z_top - 0.060
    
    # Main visor sheet (angled downward and forward at 35 degrees)
    add_box_to_bmesh(bm_visor, (0.0, visor_y, visor_z), (visor_w, visor_drop_len, 0.014))
    
    # Rolled bottom edge lip
    add_cylinder_to_bmesh(bm_visor, (0.0, visor_y + (visor_drop_len * 0.45), visor_z - 0.080), 0.016, visor_w, segments=16, axis='X')
    
    # Center dropped point (classic bowtie / V-drop contour)
    add_box_to_bmesh(bm_visor, (0.0, visor_y + (visor_drop_len * 0.40), visor_z - 0.110), (0.340, 0.100, 0.014))
    
    # Structural Visor Mounting Brackets (Bolted to cab roof and A-pillars)
    # Center mounting bracket
    add_box_to_bmesh(bm_visor, (0.0, y_top - 0.040, z_top + 0.050), (0.045, 0.120, 0.040))
    # Left and right outer corner strut brackets
    for side in [-1.0, 1.0]:
        bx = side * 1.040
        add_box_to_bmesh(bm_visor, (bx, y_top - 0.020, z_top + 0.030), (0.030, 0.140, 0.040))
        add_cylinder_to_bmesh(bm_visor, (bx, visor_y, visor_z + 0.020), 0.010, 0.120, segments=8, axis='Z')
        
    finalize_bmesh_object(glass_obj, glass_mesh, bm_glass)
    finalize_bmesh_object(visor_obj, visor_mesh, bm_visor)
    finalize_bmesh_object(wiper_obj, wiper_mesh, bm_wiper)
    return visor_obj


# =============================================================================
# SUBSYSTEM 13: 5 BULLET ROOF LIGHTS, DUAL HADLEY HORNS & CB ANTENNAS
# =============================================================================

def build_cab_roof_bullet_lights_and_horns(materials, parent=None):
    """
    Constructs the iconic cab roof jewelry:
    - 5 aerodynamic chrome torpedo bullet clearance lights across cab brow
    - Dual Hadley chrome trumpet air horns (29-inch and 26-inch staggered)
    - Dual stainless steel CB antenna whip masts with spring bases
    
    Positions:
    - Bullet lights: Brow at Y = +1.180 m, Z = 2.480 m
    - Hadley horns: Outer roof edges at X = +-0.850 m, Y = +0.800 m, Z = 2.520 m
    - CB antennas: Cab sides at X = +-1.120 m, Y = +1.100 m
    """
    chrome_obj, chrome_mesh, bm_chrome = create_bmesh_object("Roof_Chrome_Horns_Bullets", materials['Chrome_MirrorPeterbilt'], parent)
    amber_glass_obj, amber_glass_mesh, bm_aglass = create_bmesh_object("Bullet_Amber_Glass", materials['Glass_AmberIndicator'], parent)
    amber_glow_obj, amber_glow_mesh, bm_aglow = create_bmesh_object("Bullet_Amber_Glow", materials['Emissive_BulletAmber'], parent)
    
    # 1. 5 Torpedo Bullet Clearance Lights across Cab Brow
    # Spaced symmetrically: Center (0.0), Inner (+-0.32 m), Outer (+-0.64 m)
    bullet_xs = [0.0, -0.320, 0.320, -0.640, 0.640]
    bullet_y = 1.180
    bullet_z = 2.480
    bullet_len = 0.180
    bullet_r = 0.028
    
    for bx in bullet_xs:
        # Chrome torpedo base stanchion
        add_box_to_bmesh(bm_chrome, (bx, bullet_y - 0.020, bullet_z), (0.045, 0.140, 0.025))
        # Torpedo chrome rear body cylinder
        add_cylinder_to_bmesh(bm_chrome, (bx, bullet_y - 0.040, bullet_z + 0.025), bullet_r, 0.100, segments=16, axis='Y')
        add_cone_to_bmesh(bm_chrome, (bx, bullet_y - 0.100, bullet_z + 0.025), bullet_r, 0.005, 0.040, segments=16, axis='Y')
        # Chrome lens retaining bezel collar
        add_tube_to_bmesh(bm_chrome, (bx, bullet_y + 0.020, bullet_z + 0.025), bullet_r + 0.004, bullet_r, 0.015, segments=16, axis='Y')
        # Amber fluted optical glass nose cone
        add_cone_to_bmesh(bm_aglass, (bx, bullet_y + 0.045, bullet_z + 0.025), bullet_r, 0.005, 0.050, segments=16, axis='Y')
        # Emissive amber interior bulb
        add_cylinder_to_bmesh(bm_aglow, (bx, bullet_y + 0.015, bullet_z + 0.025), 0.010, 0.020, segments=10, axis='Y')
        
    # 2. Dual Hadley Chrome Trumpet Air Horns
    # Driver Horn (29-inch long trumpet): X = -0.850 m
    # Passenger Horn (26-inch long trumpet): X = +0.850 m
    horns_spec = [
        (-1.0, -0.850, 0.740, 0.155),  # Driver side: length 0.74 m (29 inches), bell diameter 0.155 m
        ( 1.0,  0.850, 0.660, 0.145)   # Passenger side: length 0.66 m (26 inches), bell diameter 0.145 m
    ]
    
    horn_base_y = 0.500
    horn_z = 2.530
    
    for side_flag, hx, h_len, bell_diam in horns_spec:
        bell_r = bell_diam * 0.5
        bell_y = horn_base_y + h_len
        mid_hy = horn_base_y + (h_len * 0.5)
        
        # Rectangular rear diaphragm sound box
        add_box_to_bmesh(bm_chrome, (hx, horn_base_y - 0.040, horn_z), (0.090, 0.090, 0.085))
        add_cylinder_to_bmesh(bm_chrome, (hx, horn_base_y - 0.040, horn_z), 0.042, 0.095, segments=16, axis='Y')
        # Air line brass solenoid fitting
        add_cylinder_to_bmesh(bm_chrome, (hx, horn_base_y - 0.080, horn_z), 0.012, 0.030, segments=8, axis='Y')
        
        # Tapered conical horn stem
        stem_len = h_len - 0.150
        stem_mid_y = horn_base_y + (stem_len * 0.5)
        add_cone_to_bmesh(bm_chrome, (hx, stem_mid_y, horn_z), 0.020, 0.040, stem_len, segments=18, axis='Y')
        
        # Flared trumpet bell mouth
        bell_len = 0.150
        bell_mid_y = horn_base_y + stem_len + (bell_len * 0.5)
        add_cone_to_bmesh(bm_chrome, (hx, bell_mid_y, horn_z), 0.040, bell_r, bell_len, segments=24, axis='Y')
        # Bell outer curled rim lip
        add_tube_to_bmesh(bm_chrome, (hx, bell_y, horn_z), bell_r + 0.008, bell_r, 0.016, segments=24, axis='Y')
        # Internal chrome tone projector dome
        add_cylinder_to_bmesh(bm_chrome, (hx, bell_y - 0.030, horn_z), bell_r * 0.38, 0.025, segments=16, axis='Y')
        
        # Front and rear pedestal mounting pedestals to cab roof
        add_box_to_bmesh(bm_chrome, (hx, horn_base_y, horn_z - 0.045), (0.045, 0.060, 0.055))
        add_box_to_bmesh(bm_chrome, (hx, horn_base_y + (h_len * 0.65), horn_z - 0.045), (0.035, 0.050, 0.055))
        
    # 3. Dual Stainless Steel CB Antenna Masts
    # Mounted on upper cab A-pillar / door frame
    for side in [-1.0, 1.0]:
        ax = side * 1.130
        ay = 1.120
        az_base = 2.100
        # Chrome swivel mounting base bracket
        add_box_to_bmesh(bm_chrome, (ax - side * 0.015, ay, az_base), (0.030, 0.060, 0.080))
        # Heavy chrome spring shock base
        add_cylinder_to_bmesh(bm_chrome, (ax, ay, az_base + 0.070), 0.018, 0.100, segments=12, axis='Z')
        # Center loading coil cylinder
        add_cylinder_to_bmesh(bm_chrome, (ax, ay, az_base + 0.280), 0.024, 0.120, segments=14, axis='Z')
        # 48-inch stainless whip antenna rod (Z rises to 3.400 m)
        add_cylinder_to_bmesh(bm_chrome, (ax, ay, az_base + 0.700), 0.005, 0.950, segments=8, axis='Z')
        
    finalize_bmesh_object(chrome_obj, chrome_mesh, bm_chrome)
    finalize_bmesh_object(amber_glass_obj, amber_glass_mesh, bm_aglass)
    finalize_bmesh_object(amber_glow_obj, amber_glow_mesh, bm_aglow)
    return chrome_obj


# =============================================================================
# SUBSYSTEM 14: DUAL 7-INCH CHROME MONSTER STRAIGHT STACKS & HEAT SHIELDS
# =============================================================================

def build_dual_7inch_chrome_monster_stacks(materials, parent=None):
    """
    Constructs the definitive Peterbilt 379 dual 7-inch mirror-polished chrome
    straight-cut exhaust monster stacks:
    - 7-inch (0.178 m) diameter mirror chrome pipes
    - Overall height: 4.050 m (Towering 3.33 m tall from lower elbow to outlet)
    - Straight-cut top outlets with hollowed dark Inconel interior bore
    - 48-inch full-wrap mirror-polished perforated heat shields with hole matrix
    - Lower mandrel-bent under-cab exhaust elbows and frame mounting stanchions
    
    Mounted Position: X = +-1.140 m, Y = -0.050 m (in cab/sleeper recess)
    """
    stack_obj, stack_mesh, bm_stack = create_bmesh_object("Exhaust_7in_Monster_Stacks", materials['Chrome_MirrorPeterbilt'], parent)
    shield_obj, shield_mesh, bm_shield = create_bmesh_object("Exhaust_Perforated_Shields", materials['Chrome_MirrorPeterbilt'], parent)
    bore_obj, bore_mesh, bm_bore = create_bmesh_object("Exhaust_Inner_Bore", materials['Iron_CastHeavy'], parent)
    
    stack_r = 0.089  # 7-inch diameter
    shield_r = 0.106 # Full-wrap shield diameter
    stack_y = -0.050
    bot_z = 0.720
    top_z = 4.050    # Extreme height matching Peterbilt owner-operator standard
    stack_len = top_z - bot_z
    mid_z = (top_z + bot_z) * 0.5
    
    for side in [-1.0, 1.0]:
        sx = side * 1.140
        center = (sx, stack_y, mid_z)
        
        # 1. Main 7-Inch Vertical Mirror Chrome Exhaust Pipe
        add_cylinder_to_bmesh(bm_stack, center, stack_r, stack_len, segments=32, axis='Z')
        
        # Top Straight-Cut Outlet Opening (Beveled outer edge)
        add_tube_to_bmesh(bm_stack, (sx, stack_y, top_z - 0.015), stack_r + 0.005, stack_r - 0.006, 0.030, segments=32, axis='Z')
        
        # Hollowed Dark Heat-Tempered Interior Bore
        add_cylinder_to_bmesh(bm_bore, (sx, stack_y, top_z - 0.150), stack_r - 0.008, 0.300, segments=24, axis='Z')
        
        # 2. 48-Inch Full-Wrap Perforated Chrome Heat Shield
        # Length: 1.220 m (48 inches), from Z = 1.350 m to Z = 2.570 m
        shield_h = 1.220
        shield_z_mid = (1.350 + 2.570) * 0.5
        # Main shield cylinder sleeve
        add_tube_to_bmesh(bm_shield, (sx, stack_y, shield_z_mid), shield_r, shield_r - 0.004, shield_h, segments=32, axis='Z')
        
        # Top and Bottom Polished Billet Clamp Collar Bands
        for cz in [1.350, 2.570]:
            add_tube_to_bmesh(bm_stack, (sx, stack_y, cz), shield_r + 0.012, stack_r, 0.035, segments=32, axis='Z')
            # Clamp tightener bolt boss
            add_box_to_bmesh(bm_stack, (sx + side * (shield_r + 0.015), stack_y, cz), (0.025, 0.035, 0.030))
            
        # Perforated Hole Matrix on Heat Shield (Circular Cooling Apertures)
        num_shield_rings = 14
        for r_idx in range(num_shield_rings):
            rz = 1.390 + (r_idx * (shield_h - 0.080) / num_shield_rings)
            for hang in [0.0, 0.7, 1.4, 2.1, 2.8, 3.5, 4.2, 4.9, 5.6]:
                px = sx + math.sin(hang) * shield_r
                py = stack_y + math.cos(hang) * shield_r
                add_cylinder_to_bmesh(bm_bore, (px, py, rz), 0.012, 0.008, segments=8, axis='Z')
                
        # 3. Lower Under-Cab Exhaust Elbow & Frame Stanchion Mount
        # 90-degree mandrel-bent chrome elbow curving under cab toward chassis rail
        elbow_y_in = stack_y + 0.150
        elbow_x_in = side * 0.600
        elbow_z = bot_z + 0.050
        # Horizontal under-cab connector pipe
        add_cylinder_to_bmesh(bm_stack, ((sx + elbow_x_in) * 0.5, stack_y, elbow_z), stack_r, abs(sx - elbow_x_in), segments=24, axis='X')
        # Heavy exhaust flex pipe section (corrugated stainless bellow)
        add_tube_to_bmesh(bm_stack, (elbow_x_in + side * 0.150, stack_y, elbow_z), stack_r + 0.015, stack_r, 0.180, segments=24, axis='X')
        
        # Heavy Chrome Frame Stanchion Support Post
        add_box_to_bmesh(bm_stack, (sx - side * 0.080, stack_y, 0.980), (0.120, 0.080, 0.280))
        add_cylinder_to_bmesh(bm_stack, (sx - side * 0.080, stack_y, 0.980), 0.035, 0.280, segments=16, axis='Z')
        # Cab / Sleeper upper stabilizer bracket (Z = 2.300)
        add_box_to_bmesh(bm_stack, (sx - side * 0.040, stack_y, 2.300), (0.080, 0.050, 0.030))
        
    finalize_bmesh_object(stack_obj, stack_mesh, bm_stack)
    finalize_bmesh_object(shield_obj, shield_mesh, bm_shield)
    finalize_bmesh_object(bore_obj, bore_mesh, bm_bore)
    return stack_obj


# =============================================================================
# SUBSYSTEM 15: DUAL 150-GALLON CYLINDRICAL BRUSHED ALUMINUM FUEL TANKS
# =============================================================================

def build_dual_150gal_cylindrical_fuel_tanks(materials, parent=None):
    """
    Constructs the dual 150-gallon cylindrical fuel tanks mounted under the cab:
    - 26-inch (0.660 m) diameter cylindrical tanks, 65 inches (1.650 m) long
    - Brushed aluminum finish with domed spun end caps
    - Heavy mirror-polished stainless steel mounting straps with T-bolt tensioners
    - Heavy cast aluminum frame outrigger support saddles
    - Full-length polished aluminum diamond-plate top step pads
    - Billet aluminum fuel filler necks with knurled chrome caps and vents
    
    Mounted Position: X = +-1.020 m, Y = +0.650 m, Z = 0.680 m
    """
    tank_obj, tank_mesh, bm_tank = create_bmesh_object("Fuel_Tanks_Brushed_Alloy", materials['Alloy_AlcoaPolished'], parent)
    strap_obj, strap_mesh, bm_strap = create_bmesh_object("Fuel_Tank_Chrome_Straps", materials['Chrome_MirrorPeterbilt'], parent)
    step_obj, step_mesh, bm_step = create_bmesh_object("Fuel_Tank_Diamond_Steps", materials['Alloy_AlcoaPolished'], parent)
    
    tank_r = 0.330   # 26-inch diameter
    tank_len = 1.650 # 65-inch length (150 US Gallons)
    tank_y = 0.650
    tank_z = 0.680
    
    for side in [-1.0, 1.0]:
        tx = side * 1.020
        center = (tx, tank_y, tank_z)
        
        # 1. Main Cylindrical Fuel Tank Shell
        add_cylinder_to_bmesh(bm_tank, center, tank_r, tank_len, segments=36, axis='Y')
        
        # Domed Spun End Caps (Front: Y = +1.475, Rear: Y = -0.175)
        for ey in [tank_y + (tank_len * 0.5), tank_y - (tank_len * 0.5)]:
            add_cylinder_to_bmesh(bm_tank, (tx, ey, tank_z), tank_r * 0.96, 0.040, segments=36, axis='Y')
            add_cone_to_bmesh(bm_tank, (tx, ey + (0.030 if ey > tank_y else -0.030), tank_z), tank_r * 0.96, tank_r * 0.85, 0.050, segments=36, axis='Y')
            # End cap rolled perimeter weld seam
            add_tube_to_bmesh(bm_strap, (tx, ey, tank_z), tank_r + 0.008, tank_r - 0.005, 0.020, segments=36, axis='Y')
            
        # 2. Heavy Mirror-Polished Stainless Steel Mounting Straps (2 straps per tank)
        for sy_off in [-0.480, 0.480]:
            sy = tank_y + sy_off
            # Wide wrap-around strap band
            add_tube_to_bmesh(bm_strap, (tx, sy, tank_z), tank_r + 0.012, tank_r, 0.065, segments=36, axis='Y')
            # Black rubber anti-chafing cushion insulator strip
            add_tube_to_bmesh(bm_tank, (tx, sy, tank_z), tank_r + 0.004, tank_r, 0.075, segments=36, axis='Y')
            # T-bolt tensioner buckle lug (at top of strap)
            add_box_to_bmesh(bm_strap, (tx, sy, tank_z + tank_r + 0.020), (0.040, 0.080, 0.035))
            add_cylinder_to_bmesh(bm_strap, (tx, sy, tank_z + tank_r + 0.020), 0.010, 0.070, segments=10, axis='Z')
            
            # Heavy Cast Aluminum Frame Saddle Bracket (Connecting tank to chassis rail)
            saddle_w = abs(tx - (side * 0.440))
            saddle_mid_x = (tx + side * 0.440) * 0.5
            add_box_to_bmesh(bm_tank, (saddle_mid_x, sy, tank_z), (saddle_w, 0.120, 0.140))
            add_box_to_bmesh(bm_tank, (side * 0.460, sy, tank_z + 0.120), (0.040, 0.160, 0.220))
            
        # 3. Full-Length Diamond-Plate Top Step Pad
        # Mounted along the top crown of the tank for cab boarding
        step_w = 0.220
        step_len = tank_len * 0.92
        step_z = tank_z + tank_r + 0.012
        add_box_to_bmesh(bm_step, (tx, tank_y, step_z), (step_w, step_len, 0.020))
        # Non-skid safety serrated edge trims
        for edge_side in [-1.0, 1.0]:
            add_box_to_bmesh(bm_step, (tx + edge_side * (step_w * 0.5 - 0.010), tank_y, step_z + 0.010), (0.020, step_len, 0.015))
            
        # 4. Billet Aluminum Fuel Filler Neck & Knurled Cap
        # Angled upward/outward at 45 degrees near front of tank
        fill_y = tank_y + (tank_len * 0.32)
        fill_x = tx + side * (tank_r * 0.72)
        fill_z = tank_z + (tank_r * 0.72)
        # Angled neck collar
        add_cylinder_to_bmesh(bm_strap, (fill_x, fill_y, fill_z), 0.048, 0.080, segments=20, axis='Z')
        # Knurled chrome fuel cap
        add_cylinder_to_bmesh(bm_strap, (fill_x, fill_y, fill_z + 0.045), 0.055, 0.030, segments=24, axis='Z')
        # Pressure relief vent tube
        add_cylinder_to_bmesh(bm_strap, (fill_x - side * 0.040, fill_y, fill_z + 0.020), 0.010, 0.050, segments=8, axis='Z')
        
    finalize_bmesh_object(tank_obj, tank_mesh, bm_tank)
    finalize_bmesh_object(strap_obj, strap_mesh, bm_strap)
    finalize_bmesh_object(step_obj, step_mesh, bm_step)
    return tank_obj

# =============================================================================
# SUBSYSTEM 16: BATTERY BOX, TOOL BOX & STIRRUP BOARDING STEPS
# =============================================================================

def build_battery_box_tool_box_and_stirrup_steps(materials, parent=None):
    """
    Constructs the Peterbilt polished aluminum battery carrier box (driver side)
    and matching tool/storage box (passenger side) mounted below the cab doors:
    - Heavy aluminum box casings with lower stiffener bead ribs
    - Diamond-plate step lids with rubber edge gaskets
    - Dual black rubber T-handle hold-down latches
    - Lower tubular chrome stirrup boarding step rungs
    - Internal 4x Group 31 commercial 12V battery simulation
    
    Positions: X = +-1.020 m, Y = +1.200 m, Z = 0.720 m
    """
    box_parent = bpy.data.objects.new("Battery_Tool_Boxes_Assembly", None)
    bpy.context.scene.collection.objects.link(box_parent)
    if parent:
        box_parent.parent = parent
        
    box_obj, box_mesh, bm_box = create_bmesh_object("Box_Aluminum_Housings", materials['Alloy_AlcoaPolished'], box_parent)
    lid_obj, lid_mesh, bm_lid = create_bmesh_object("Box_Diamond_Step_Lids", materials['Alloy_AlcoaPolished'], box_parent)
    step_obj, step_mesh, bm_step = create_bmesh_object("Stirrup_Boarding_Steps", materials['Chrome_MirrorPeterbilt'], box_parent)
    latch_obj, latch_mesh, bm_latch = create_bmesh_object("Box_Rubber_T_Latches", materials['Paint_PeterbiltBlack'], box_parent)
    
    box_len = 0.780
    box_w = 0.540
    box_h = 0.440
    box_y = 1.200
    box_z = 0.720
    
    for side in [-1.0, 1.0]:
        bx = side * 1.020
        center = (bx, box_y, box_z)
        
        # 1. Main Polished Aluminum Box Housing
        add_box_to_bmesh(bm_box, center, (box_w, box_len, box_h))
        
        # Lower Stiffener Bead Ribs (horizontal stamped ribs on outer box face)
        outer_face_x = bx + side * (box_w * 0.5 + 0.005)
        for rz_off in [-0.12, 0.0, 0.12]:
            add_box_to_bmesh(bm_box, (outer_face_x, box_y, box_z + rz_off), (0.012, box_len * 0.90, 0.018))
            
        # Heavy Frame Outrigger Mount Brackets (Bolted to chassis frame rail)
        mount_w = abs(bx - (side * 0.440))
        mount_mid_x = (bx + side * 0.440) * 0.5
        for my_off in [-0.260, 0.260]:
            add_box_to_bmesh(bm_box, (mount_mid_x, box_y + my_off, box_z), (mount_w, 0.080, 0.120))
            add_box_to_bmesh(bm_box, (side * 0.460, box_y + my_off, box_z + 0.100), (0.040, 0.120, 0.180))
            
        # 2. Diamond-Plate Top Step Lid
        lid_z = box_z + (box_h * 0.5) + 0.015
        add_box_to_bmesh(bm_lid, (bx, box_y, lid_z), (box_w + 0.040, box_len + 0.040, 0.030))
        # Beveled front/outer edge step lip
        add_box_to_bmesh(bm_lid, (bx + side * (box_w * 0.5 + 0.015), box_y, lid_z - 0.015), (0.030, box_len + 0.040, 0.030))
        
        # 3. Dual Rubber T-Handle Hold-Down Latches
        for ly_off in [-0.220, 0.220]:
            ly = box_y + ly_off
            lx = bx + side * (box_w * 0.5 + 0.018)
            # Chrome upper latch keeper
            add_box_to_bmesh(bm_step, (lx, ly, lid_z - 0.010), (0.018, 0.035, 0.025))
            # Black rubber tension strap
            add_cylinder_to_bmesh(bm_latch, (lx, ly, lid_z - 0.050), 0.009, 0.065, segments=10, axis='Z')
            # Lower T-handle pull grip
            add_box_to_bmesh(bm_latch, (lx + side * 0.006, ly, lid_z - 0.085), (0.015, 0.050, 0.018))
            
        # 4. Lower Tubular Chrome Stirrup Boarding Steps
        # Suspended beneath the battery/tool box for easy cab ingress
        step_drop_z = 0.440
        rung_w = box_len * 0.85
        # Outer horizontal serrated step rung
        add_cylinder_to_bmesh(bm_step, (bx + side * (box_w * 0.5 - 0.020), box_y, step_drop_z), 0.020, rung_w, segments=16, axis='Y')
        # Non-skid safety grip sleeve
        add_tube_to_bmesh(bm_step, (bx + side * (box_w * 0.5 - 0.020), box_y, step_drop_z), 0.024, 0.020, rung_w * 0.90, segments=16, axis='Y')
        
        # Left and right vertical tubular hanger arms
        for sy_off in [-rung_w * 0.45, rung_w * 0.45]:
            arm_y = box_y + sy_off
            arm_h = (box_z - (box_h * 0.5)) - step_drop_z
            arm_mid_z = step_drop_z + (arm_h * 0.5)
            add_cylinder_to_bmesh(bm_step, (bx + side * (box_w * 0.5 - 0.020), arm_y, arm_mid_z), 0.016, arm_h, segments=12, axis='Z')
            
        # 5. Internal Battery Pack Simulation (Driver Side Only: -X)
        if side < 0:
            for bat_idx in range(4):
                bat_y = box_y - 0.240 + (bat_idx * 0.160)
                # Group 31 battery casing
                add_box_to_bmesh(bm_latch, (bx, bat_y, box_z), (box_w * 0.70, 0.135, box_h * 0.65))
                # Lead terminal posts
                add_cylinder_to_bmesh(bm_box, (bx - 0.100, bat_y, box_z + 0.160), 0.010, 0.025, segments=8, axis='Z')
                add_cylinder_to_bmesh(bm_box, (bx + 0.100, bat_y, box_z + 0.160), 0.010, 0.025, segments=8, axis='Z')
                
    finalize_bmesh_object(box_obj, box_mesh, bm_box)
    finalize_bmesh_object(lid_obj, lid_mesh, bm_lid)
    finalize_bmesh_object(step_obj, step_mesh, bm_step)
    finalize_bmesh_object(latch_obj, latch_mesh, bm_latch)
    return box_parent


# =============================================================================
# SUBSYSTEM 17: STAINLESS STEEL WEST COAST TRIPOD DOUBLE-MIRRORS
# =============================================================================

def build_west_coast_tripod_mirrors(materials, parent=None):
    """
    Constructs the classic Peterbilt mirror-polished stainless steel West Coast
    tripod double-mirror assemblies:
    - Main rectangular 7x16-inch West Coast mirror heads
    - Auxiliary 8-inch round convex spotter mirrors on ball-joint stalks
    - Triangulated tubular stainless steel mounting tripod frame
    - Anti-vibration diagonal wind brace struts
    
    Span Width: 2.950 m (X = +-1.360 m, Y = +1.250 m, Z = 1.950 m)
    """
    mirror_obj, mirror_mesh, bm_mirror = create_bmesh_object("West_Coast_Mirrors_Chrome", materials['Chrome_MirrorPeterbilt'], parent)
    glass_obj, glass_mesh, bm_glass = create_bmesh_object("Mirror_Reflective_Faces", materials['Chrome_MirrorPeterbilt'], parent)
    
    mirror_y = 1.250
    main_h = 0.420
    main_w = 0.180
    main_d = 0.055
    main_z = 1.980
    
    for side in [-1.0, 1.0]:
        mx = side * 1.360
        
        # 1. Main 7x16-Inch Rectangular West Coast Mirror Head
        # Stainless steel shell housing
        add_box_to_bmesh(bm_mirror, (mx, mirror_y, main_z), (main_d, main_w, main_h))
        # Rolled outer perimeter bezel
        add_box_to_bmesh(bm_mirror, (mx - side * 0.005, mirror_y, main_z), (main_d + 0.010, main_w + 0.016, main_h + 0.016))
        # Flat reflective glass face (facing rearward: -Y)
        add_box_to_bmesh(bm_glass, (mx, mirror_y - (main_w * 0.5) - 0.005, main_z), (main_d * 0.85, 0.008, main_h * 0.92))
        
        # 2. Auxiliary 8-Inch Round Convex Spotter Mirror (Mounted below main head)
        spot_z = main_z - (main_h * 0.5) - 0.130
        spot_r = 0.100  # 8-inch diameter
        # Chrome convex dish backing
        add_cylinder_to_bmesh(bm_mirror, (mx, mirror_y, spot_z), spot_r, 0.035, segments=24, axis='Y')
        add_cone_to_bmesh(bm_mirror, (mx, mirror_y + 0.020, spot_z), spot_r, spot_r * 0.4, 0.030, segments=20, axis='Y')
        # Convex reflective mirror face
        add_cylinder_to_bmesh(bm_glass, (mx, mirror_y - 0.018, spot_z), spot_r * 0.92, 0.008, segments=24, axis='Y')
        # Adjustable ball-joint swivel mount stalk
        add_cylinder_to_bmesh(bm_mirror, (mx, mirror_y, spot_z + spot_r + 0.020), 0.012, 0.050, segments=10, axis='Z')
        
        # 3. Triangulated Stainless Steel Tripod Tubular Frame
        # Upper horizontal support arm (from cab door top at Z = 2.220 m)
        arm_top_z = 2.220
        arm_in_x = side * 1.090  # Cab door outer skin
        arm_len = abs(mx - arm_in_x)
        arm_mid_x = (mx + arm_in_x) * 0.5
        add_cylinder_to_bmesh(bm_mirror, (arm_mid_x, mirror_y, arm_top_z), 0.012, arm_len, segments=12, axis='X')
        # Upper door mounting bracket pad
        add_box_to_bmesh(bm_mirror, (arm_in_x, mirror_y, arm_top_z), (0.020, 0.060, 0.050))
        
        # Lower horizontal support arm (from cab door beltline at Z = 1.620 m)
        arm_bot_z = 1.620
        add_cylinder_to_bmesh(bm_mirror, (arm_mid_x, mirror_y, arm_bot_z), 0.012, arm_len, segments=12, axis='X')
        add_box_to_bmesh(bm_mirror, (arm_in_x, mirror_y, arm_bot_z), (0.020, 0.060, 0.050))
        
        # Vertical mirror clamp rod spanning between upper and lower arms
        add_cylinder_to_bmesh(bm_mirror, (mx, mirror_y, (arm_top_z + arm_bot_z) * 0.5), 0.014, arm_top_z - arm_bot_z, segments=12, axis='Z')
        
        # Diagonal Wind Vibration Anti-Sway Strut
        # Runs forward from mirror head to cab cowl at Y = +1.420 m
        brace_y_cowl = 1.420
        brace_z_cowl = 1.850
        brace_len = math.sqrt((brace_y_cowl - mirror_y)**2 + (arm_in_x - mx)**2 + (brace_z_cowl - main_z)**2)
        brace_mid = ((mx + arm_in_x) * 0.5, (mirror_y + brace_y_cowl) * 0.5, (main_z + brace_z_cowl) * 0.5)
        add_cylinder_to_bmesh(bm_mirror, brace_mid, 0.010, brace_len, segments=10, axis='Y')
        
    finalize_bmesh_object(mirror_obj, mirror_mesh, bm_mirror)
    finalize_bmesh_object(glass_obj, glass_mesh, bm_glass)
    return mirror_obj


# =============================================================================
# SUBSYSTEM 18: POLISHED DIAMOND-PLATE REAR CATWALK DECK & ACCESS LADDER
# =============================================================================

def build_diamond_plate_rear_catwalk(materials, parent=None):
    """
    Constructs the polished aluminum diamond-plate rear catwalk deck plate
    spanning between the frame rails behind the sleeper, complete with
    side wing step extensions and driver-side access ladder:
    - Main deck plate spanning Y = -1.620 m to Y = -2.150 m
    - Safety non-skid punched diamond tread traction pattern
    - Frame mounting riser angle irons
    - Driver-side 2-rung stainless steel boarding access ladder
    
    Mounted Position: Y = -1.885 m, Z = 0.940 m (above frame rails)
    """
    catwalk_obj, catwalk_mesh, bm_walk = create_bmesh_object("Catwalk_Diamond_Deck", materials['Alloy_AlcoaPolished'], parent)
    ladder_obj, ladder_mesh, bm_lad = create_bmesh_object("Catwalk_Access_Ladder", materials['Chrome_MirrorPeterbilt'], parent)
    
    cw_y_start = -1.620
    cw_y_end = -2.150
    cw_len = abs(cw_y_end - cw_y_start)  # 0.530 m
    cw_mid_y = (cw_y_start + cw_y_end) * 0.5
    cw_w = 0.960
    cw_z = 0.940
    
    # 1. Main Center Catwalk Deck Plate (Spanning frame rails)
    add_box_to_bmesh(bm_walk, (0.0, cw_mid_y, cw_z), (cw_w, cw_len, 0.024))
    
    # Perimeter Safety Kick-Plates (vertical lip edges preventing slip-offs)
    add_box_to_bmesh(bm_walk, (0.0, cw_y_start - 0.015, cw_z + 0.020), (cw_w, 0.020, 0.040))
    add_box_to_bmesh(bm_walk, (0.0, cw_y_end + 0.015, cw_z + 0.020), (cw_w, 0.020, 0.040))
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm_walk, (side * (cw_w * 0.5 - 0.010), cw_mid_y, cw_z + 0.020), (0.020, cw_len, 0.040))
        
    # Simulated Diamond Tread Punch Holes (Water Drainage & Traction Grid)
    num_cw_rows = 8
    for r_idx in range(num_cw_rows):
        ry = cw_y_start - 0.040 - (r_idx * (cw_len - 0.080) / num_cw_rows)
        for col_x in [-0.36, -0.24, -0.12, 0.0, 0.12, 0.24, 0.36]:
            add_cylinder_to_bmesh(bm_walk, (col_x, ry, cw_z + 0.012), 0.012, 0.010, segments=8, axis='Z')
            
    # Frame Mounting Riser Angles (Connecting catwalk to frame rail top flanges)
    for side in [-1.0, 1.0]:
        sx = side * 0.440
        add_box_to_bmesh(bm_walk, (sx, cw_mid_y, (cw_z + 0.920) * 0.5), (0.060, cw_len * 0.85, 0.025))
        
    # 2. Driver-Side Catwalk Boarding Access Ladder (Side: -X)
    lad_x = -0.520
    lad_y = cw_mid_y
    lad_top_z = cw_z
    lad_bot_z = 0.620
    lad_h = lad_top_z - lad_bot_z
    
    # Dual vertical ladder stringers
    for ly_off in [-0.140, 0.140]:
        add_cylinder_to_bmesh(bm_lad, (lad_x, lad_y + ly_off, (lad_top_z + lad_bot_z) * 0.5), 0.014, lad_h, segments=12, axis='Z')
        # Frame standoff mounting tabs
        add_box_to_bmesh(bm_lad, (lad_x + 0.040, lad_y + ly_off, lad_top_z), (0.080, 0.030, 0.020))
        add_box_to_bmesh(bm_lad, (lad_x + 0.040, lad_y + ly_off, lad_bot_z + 0.050), (0.080, 0.030, 0.020))
        
    # 2 Serrated Non-Skid Ladder Rungs
    for r_idx, rz in enumerate([0.720, 0.840]):
        add_cylinder_to_bmesh(bm_lad, (lad_x, lad_y, rz), 0.015, 0.280, segments=14, axis='Y')
        add_tube_to_bmesh(bm_lad, (lad_x, lad_y, rz), 0.019, 0.015, 0.260, segments=14, axis='Y')
        
    finalize_bmesh_object(catwalk_obj, catwalk_mesh, bm_walk)
    finalize_bmesh_object(ladder_obj, ladder_mesh, bm_lad)
    return catwalk_obj


# =============================================================================
# SUBSYSTEM 19: TRAILER UMBILICAL PYLON & COILED SUZIE UTILITY LINES
# =============================================================================

def build_trailer_umbilical_pylon_and_suzie_lines(materials, parent=None):
    """
    Constructs the trailer utility connection pylon tower mounted behind the
    sleeper with coiled pneumatic and electrical Suzie lines:
    - Stainless steel pylon bracket tower with spring suspension hanger
    - Emergency Air Line: Red coiled spiral hose with cast Gladhand coupling
    - Service Air Line: Blue coiled spiral hose with cast Gladhand coupling
    - Auxiliary 7-Pin SAE J560 electrical coiled cable with die-cast metal plug
    - Dummy gladhand storage holsters on pylon base
    
    Mounted Position: X = 0.000, Y = -1.680 m, Z = 1.450 m
    """
    pylon_obj, pylon_mesh, bm_pylon = create_bmesh_object("Umbilical_Pylon_Chrome", materials['Chrome_MirrorPeterbilt'], parent)
    red_suzie_obj, red_suzie_mesh, bm_red = create_bmesh_object("Suzie_Emergency_Red", materials['Suzie_EmergencyAirRed'], parent)
    blue_suzie_obj, blue_suzie_mesh, bm_blue = create_bmesh_object("Suzie_Service_Blue", materials['Suzie_ServiceAirBlue'], parent)
    elec_suzie_obj, elec_suzie_mesh, bm_elec = create_bmesh_object("Suzie_Electrical_7Pin", materials['Suzie_Electrical7Pin'], parent)
    
    py_y = -1.680
    py_z_base = 0.940
    py_z_top = 1.580
    py_h = py_z_top - py_z_base  # 0.640 m
    
    # 1. Stainless Steel Pylon Bracket Tower
    add_box_to_bmesh(bm_pylon, (0.0, py_y, (py_z_base + py_z_top) * 0.5), (0.080, 0.050, py_h))
    add_cylinder_to_bmesh(bm_pylon, (0.0, py_y, (py_z_base + py_z_top) * 0.5), 0.024, py_h, segments=14, axis='Z')
    # Heavy base mounting flange bolted to catwalk/frame crossmember
    add_box_to_bmesh(bm_pylon, (0.0, py_y, py_z_base + 0.015), (0.180, 0.120, 0.030))
    
    # Top Transverse Hanger Bar with 3 Line Suspension Springs
    hanger_w = 0.380
    add_cylinder_to_bmesh(bm_pylon, (0.0, py_y, py_z_top), 0.014, hanger_w, segments=12, axis='X')
    
    # 3 Line Suspension Springs (Tension springs holding Suzie lines off catwalk)
    line_xs = [-0.120, 0.000, 0.120]  # Red (Emergency), Black (Electrical), Blue (Service)
    for lx in line_xs:
        add_cylinder_to_bmesh(bm_pylon, (lx, py_y, py_z_top - 0.060), 0.010, 0.120, segments=10, axis='Z')
        
    # 2. Coiled Suzie Lines (Pneumatic and Electrical Helical Coils)
    # Helper to generate a realistic helical spring coil in BMesh
    def add_helical_coil(bm, center_x, start_y, start_z, end_z, coil_r, tube_r, turns=16, segments_per_turn=12):
        total_steps = turns * segments_per_turn
        dz = (end_z - start_z) / total_steps
        pts = []
        for s in range(total_steps):
            ang = 2.0 * math.pi * (s / segments_per_turn)
            cx = center_x + math.sin(ang) * coil_r
            cy = start_y + math.cos(ang) * coil_r
            cz = start_z + (s * dz)
            pts.append((cx, cy, cz))
            
        for i in range(total_steps - 1):
            p0 = pts[i]
            p1 = pts[i + 1]
            seg_mid = ((p0[0] + p1[0]) * 0.5, (p0[1] + p1[1]) * 0.5, (p0[2] + p1[2]) * 0.5)
            seg_len = math.sqrt((p1[0] - p0[0])**2 + (p1[1] - p0[1])**2 + (p1[2] - p0[2])**2)
            add_cylinder_to_bmesh(bm, seg_mid, tube_r, seg_len, segments=8, axis='Z')
            
    # Red Emergency Air Suzie Coil (X = -0.120 m)
    add_helical_coil(bm_red, -0.120, py_y - 0.060, 1.050, py_z_top - 0.120, 0.038, 0.009, turns=14)
    # Red Cast Aluminum Gladhand Coupling (Hanging at bottom or stowed)
    glad_red_pos = (-0.120, py_y - 0.080, 1.020)
    add_box_to_bmesh(bm_red, glad_red_pos, (0.055, 0.080, 0.040))
    add_cylinder_to_bmesh(bm_pylon, (glad_red_pos[0], glad_red_pos[1], glad_red_pos[2] + 0.025), 0.016, 0.030, segments=12, axis='Z')
    
    # Blue Service Air Suzie Coil (X = +0.120 m)
    add_helical_coil(bm_blue, 0.120, py_y - 0.060, 1.050, py_z_top - 0.120, 0.038, 0.009, turns=14)
    # Blue Cast Aluminum Gladhand Coupling
    glad_blue_pos = (0.120, py_y - 0.080, 1.020)
    add_box_to_bmesh(bm_blue, glad_blue_pos, (0.055, 0.080, 0.040))
    add_cylinder_to_bmesh(bm_pylon, (glad_blue_pos[0], glad_blue_pos[1], glad_blue_pos[2] + 0.025), 0.016, 0.030, segments=12, axis='Z')
    
    # Black/Green 7-Pin Electrical Cord Coil (Center: X = 0.000 m)
    add_helical_coil(bm_elec, 0.000, py_y - 0.080, 1.050, py_z_top - 0.120, 0.042, 0.011, turns=12)
    # Die-Cast Metal 7-Pin SAE J560 Plug
    plug_pos = (0.000, py_y - 0.100, 1.020)
    add_cylinder_to_bmesh(bm_pylon, plug_pos, 0.024, 0.090, segments=16, axis='Y')
    
    # 3 Dummy Gladhand Storage Holsters on Pylon Base Plate
    for hx in line_xs:
        add_cylinder_to_bmesh(bm_pylon, (hx, py_y - 0.040, py_z_base + 0.045), 0.022, 0.035, segments=12, axis='Z')
        
    finalize_bmesh_object(pylon_obj, pylon_mesh, bm_pylon)
    finalize_bmesh_object(red_suzie_obj, red_suzie_mesh, bm_red)
    finalize_bmesh_object(blue_suzie_obj, blue_suzie_mesh, bm_blue)
    finalize_bmesh_object(elec_suzie_obj, elec_suzie_mesh, bm_elec)
    return pylon_obj


# =============================================================================
# SUBSYSTEM 20: 2-PIECE STAINLESS REAR HALF-FENDERS & PETERBILT MUDFLAPS
# =============================================================================

def build_rear_half_fenders_and_peterbilt_mudflaps(materials, parent=None):
    """
    Constructs the Peterbilt 2-piece mirror-polished stainless steel rear
    half-fenders and heavy black rubber anti-sail mudflaps:
    - Polished stainless steel half-round fenders arching over the rear drive axle
    - Rolled outer and inner fender lips
    - Heavy tubular frame outrigger mounting bracket arms
    - Spring-loaded chrome mudflap hanger brackets at rear frame cutoff
    - Heavy black rubber anti-sail mudflaps with embossed red Peterbilt oval logo
    - Lower mirror-chrome anti-sail weight bars
    
    Tandem Rear Axle: Y = -3.650 m, Z = 0.535 m, Wheel Track: +-1.050 m
    Frame Cutoff: Y = -4.380 m
    """
    fender_obj, fender_mesh, bm_fend = create_bmesh_object("Rear_Half_Fenders_Stainless", materials['Chrome_MirrorPeterbilt'], parent)
    flap_obj, flap_mesh, bm_flap = create_bmesh_object("Mudflaps_Peterbilt_Rubber", materials['Rubber_PeterbiltMudflap'], parent)
    weight_obj, weight_mesh, bm_wt = create_bmesh_object("Mudflap_Chrome_Weights", materials['Chrome_MirrorPeterbilt'], parent)
    
    axle_y = -3.650
    axle_z = 0.535
    tire_r = 0.535
    fend_r = 0.630  # Clearance radius over 11R24.5 drive tires
    fend_w = 0.680  # Full width covering dual drive tires (X = 0.720 to 1.400 m)
    
    # -------------------------------------------------------------------------
    # 1. 2-Piece Stainless Steel Half-Round Fenders
    # -------------------------------------------------------------------------
    # Arches over the top and rear half of the rear drive axle (from 45 deg to 180 deg)
    for side in [-1.0, 1.0]:
        fx_center = side * 1.050
        
        # Sliced smooth cylindrical half-fender arch (stainless steel)
        add_arch_to_bmesh(bm_fend, (fx_center, axle_y, axle_z), fend_r, fend_r - 0.015, fend_w, ang_start=math.radians(40.0), ang_end=math.radians(180.0), segments=28, axis='X')
        # Outer rolled lip bead
        add_arch_to_bmesh(bm_fend, (fx_center + side * (fend_w * 0.5), axle_y, axle_z), fend_r + 0.008, fend_r - 0.012, 0.020, ang_start=math.radians(40.0), ang_end=math.radians(180.0), segments=28, axis='X')
        # Inner rolled lip bead
        add_arch_to_bmesh(bm_fend, (fx_center - side * (fend_w * 0.5), axle_y, axle_z), fend_r + 0.008, fend_r - 0.012, 0.020, ang_start=math.radians(40.0), ang_end=math.radians(180.0), segments=28, axis='X')
            
        # Heavy Tubular Stainless Steel Mounting Arms (2 support arms per fender)
        for arm_ang in [math.radians(65.0), math.radians(135.0)]:
            arm_y = axle_y + math.cos(arm_ang) * fend_r
            arm_z = axle_z + math.sin(arm_ang) * fend_r
            frame_x = side * 0.440
            arm_span = abs(fx_center - frame_x)
            arm_mid_x = (fx_center + frame_x) * 0.5
            # Tubular horizontal support arm
            add_cylinder_to_bmesh(bm_fend, (arm_mid_x, arm_y, arm_z - 0.025), 0.024, arm_span, segments=16, axis='X')
            # Frame mounting flange casting
            add_box_to_bmesh(bm_fend, (frame_x + side * 0.020, arm_y, arm_z - 0.025), (0.040, 0.120, 0.120))
            
    # -------------------------------------------------------------------------
    # 2. Spring-Loaded Mudflap Hangers & Peterbilt Anti-Sail Mudflaps
    # -------------------------------------------------------------------------
    flap_y = -4.380  # Rear frame cutoff
    flap_top_z = 0.920
    flap_bot_z = 0.160
    flap_h = flap_top_z - flap_bot_z  # 0.760 m
    flap_w = 0.640  # 24 inches wide
    flap_thick = 0.014
    
    for side in [-1.0, 1.0]:
        fx = side * 1.050
        
        # Chrome Spring-Loaded Triangular Mudflap Hanger Bracket
        hanger_y = flap_y + 0.020
        # Horizontal chrome hanger arm
        add_cylinder_to_bmesh(bm_fend, (fx, hanger_y, flap_top_z), 0.020, flap_w, segments=14, axis='X')
        # Heavy dual internal coil spring shock absorption base
        add_cylinder_to_bmesh(bm_fend, (side * 0.480, hanger_y, flap_top_z), 0.038, 0.140, segments=16, axis='X')
        
        # Heavy Black Anti-Sail Rubber Mudflap Sheet
        flap_mid_z = (flap_top_z + flap_bot_z) * 0.5
        add_box_to_bmesh(bm_flap, (fx, flap_y, flap_mid_z), (flap_w, flap_thick, flap_h))
        
        # Embossed Red Peterbilt Oval Logo Plaque (Centered on flap face: -Y)
        logo_z = flap_mid_z + 0.060
        add_cylinder_to_bmesh(bm_flap, (fx, flap_y - (flap_thick * 0.5) - 0.005, logo_z), 0.075, 0.012, segments=24, axis='Y')
        add_box_to_bmesh(bm_wt, (fx, flap_y - (flap_thick * 0.5) - 0.008, logo_z), (0.110, 0.008, 0.016))  # Script bar
        
        # Lower Mirror-Chrome Anti-Sail Weight Bar
        # Clamped across the bottom 3 inches of the mudflap
        weight_h = 0.085
        weight_z = flap_bot_z + (weight_h * 0.5)
        add_box_to_bmesh(bm_wt, (fx, flap_y - 0.005, weight_z), (flap_w + 0.015, flap_thick + 0.014, weight_h))
        # 4 Chrome carriage bolt fasteners along weight bar
        for bx_off in [-0.24, -0.08, 0.08, 0.24]:
            add_cylinder_to_bmesh(bm_wt, (fx + bx_off, flap_y - 0.018, weight_z), 0.008, 0.016, segments=8, axis='Y')
            
    finalize_bmesh_object(fender_obj, fender_mesh, bm_fend)
    finalize_bmesh_object(flap_obj, flap_mesh, bm_flap)
    finalize_bmesh_object(weight_obj, weight_mesh, bm_wt)
    return fender_obj

# =============================================================================
# SUBSYSTEM 21: EATON FULLER 18-SPEED TRANSMISSION & CARDAN DRIVESHAFTS
# =============================================================================

def build_eaton_fuller_transmission_and_driveshafts(materials, parent=None):
    """
    Constructs the Eaton Fuller RTLO-18918B 18-speed heavy-duty manual transmission
    and Spicer 1810-series tubular Cardan driveshaft driveline:
    - Cast iron flywheel bellhousing (bolted to engine rear)
    - 18-speed ribbed transmission main case and auxiliary rear section
    - PTO (Power Take-Off) side mounting covers and air shift slave cylinders
    - Center carrier bearing support crossmember
    - Intermediate driveshaft, main driveshaft, and inter-axle jackshaft
    - Spicer heavy universal joints with 4-bolt bearing strap caps
    
    Mounted Position: Transmission at Y = +2.100 m to +1.100 m, Z = 0.650 m
    """
    trans_obj, trans_mesh, bm_trans = create_bmesh_object("Transmission_Eaton_Fuller", materials['Iron_CastHeavy'], parent)
    shaft_obj, shaft_mesh, bm_shaft = create_bmesh_object("Driveshafts_Cardan_Spicer", materials['Paint_ChassisGlossBlack'], parent)
    
    # 1. Eaton Fuller RTLO-18918B Transmission Casing
    trans_y_front = 2.150
    trans_y_rear = 1.150
    trans_z = 0.650
    trans_len = trans_y_front - trans_y_rear
    
    # Cast Iron Clutch Bellhousing (SAE #1 bellhousing)
    add_cylinder_to_bmesh(bm_trans, (0.0, trans_y_front - 0.080, trans_z), 0.260, 0.160, segments=24, axis='Y')
    # Bellhousing starter pocket & clutch fork pivot boss
    add_box_to_bmesh(bm_trans, (-0.220, trans_y_front - 0.080, trans_z - 0.080), (0.120, 0.160, 0.140))
    
    # Main Transmission Case (Heavily ribbed cast aluminum casing)
    main_case_y = 1.680
    add_box_to_bmesh(bm_trans, (0.0, main_case_y, trans_z), (0.420, 0.580, 0.460))
    # 5 Stiffening cooling rib flanges around main case
    for rib_off in [-0.20, -0.10, 0.0, 0.10, 0.20]:
        add_box_to_bmesh(bm_trans, (0.0, main_case_y + rib_off, trans_z), (0.445, 0.018, 0.485))
        
    # Auxiliary Section (Rear range & splitter overdrive housing)
    aux_case_y = 1.300
    add_cylinder_to_bmesh(bm_trans, (0.0, aux_case_y, trans_z), 0.190, 0.300, segments=20, axis='Y')
    # Air shift slave cylinder valves on top of aux section
    add_cylinder_to_bmesh(bm_trans, (0.080, aux_case_y, trans_z + 0.190), 0.045, 0.140, segments=14, axis='Y')
    add_cylinder_to_bmesh(bm_trans, (-0.080, aux_case_y, trans_z + 0.190), 0.045, 0.140, segments=14, axis='Y')
    
    # Output Yoke & Flange
    add_cylinder_to_bmesh(bm_trans, (0.0, trans_y_rear, trans_z), 0.090, 0.080, segments=18, axis='Y')
    
    # 2. Spicer 1810-Series Driveshafts (Tubular steel Cardan shafts)
    # Shaft 1: From transmission output (Y = +1.150) to center carrier bearing (Y = +0.100)
    carrier_y = 0.100
    carrier_z = 0.650
    shaft1_len = trans_y_rear - carrier_y
    add_cylinder_to_bmesh(bm_shaft, (0.0, (trans_y_rear + carrier_y) * 0.5, trans_z), 0.060, shaft1_len, segments=20, axis='Y')
    
    # Center Carrier Bearing Assembly (Rubber-cushioned pillow block)
    add_box_to_bmesh(bm_trans, (0.0, carrier_y, carrier_z), (0.240, 0.100, 0.180))
    add_cylinder_to_bmesh(bm_trans, (0.0, carrier_y, carrier_z), 0.085, 0.120, segments=18, axis='Y')
    
    # Shaft 2: From carrier bearing (Y = +0.100) to forward drive axle pinion (Y = -2.100)
    axle1_in_y = -2.100
    axle1_z = 0.535
    shaft2_len = math.sqrt((carrier_y - axle1_in_y)**2 + (carrier_z - axle1_z)**2)
    s2_mid_y = (carrier_y + axle1_in_y) * 0.5
    s2_mid_z = (carrier_z + axle1_z) * 0.5
    add_cylinder_to_bmesh(bm_shaft, (0.0, s2_mid_y, s2_mid_z), 0.065, shaft2_len, segments=20, axis='Y')
    # Slip yoke sleeve on main driveshaft
    add_cylinder_to_bmesh(bm_shaft, (0.0, carrier_y - 0.250, carrier_z - 0.015), 0.080, 0.280, segments=20, axis='Y')
    
    # Shaft 3: Inter-Axle Jackshaft (Between forward and rearward tandem drive axles)
    # From Y = -2.450 to Y = -3.500 (length 1.050 m)
    jack_start_y = -2.450
    jack_end_y = -3.500
    jack_len = abs(jack_end_y - jack_start_y)
    jack_mid_y = (jack_start_y + jack_end_y) * 0.5
    add_cylinder_to_bmesh(bm_shaft, (0.0, jack_mid_y, axle1_z), 0.055, jack_len, segments=18, axis='Y')
    
    # Spicer U-Joint Crosses & Bearing Caps at all 4 shaft junctions
    for uj_y, uj_z in [(trans_y_rear, trans_z), (carrier_y, carrier_z), (axle1_in_y, axle1_z), (jack_start_y, axle1_z), (jack_end_y, axle1_z)]:
        # U-joint trunnion cross
        add_cylinder_to_bmesh(bm_shaft, (0.0, uj_y, uj_z), 0.022, 0.140, segments=12, axis='X')
        add_cylinder_to_bmesh(bm_shaft, (0.0, uj_y, uj_z), 0.022, 0.140, segments=12, axis='Z')
        # 4 Bearing strap caps
        for bx in [-0.065, 0.065]:
            add_box_to_bmesh(bm_shaft, (bx, uj_y, uj_z), (0.025, 0.050, 0.045))
            
    finalize_bmesh_object(trans_obj, trans_mesh, bm_trans)
    finalize_bmesh_object(shaft_obj, shaft_mesh, bm_shaft)
    return trans_obj


# =============================================================================
# SUBSYSTEM 22: PNEUMATIC BRAKE CHAMBERS & AUTOMATIC SLACK ADJUSTERS
# =============================================================================

def build_pneumatic_brake_actuators_and_slack_adjusters(materials, parent=None):
    """
    Constructs the commercial vehicle S-cam pneumatic drum brake actuators:
    - Steer Axle: Type 20 single-diaphragm clamp-band brake chambers
    - Tandem Drive Axles: 4x Type 30/30 dual spring brake pots (parking/emergency)
    - Gunite/Haldex automatic slack adjuster levers
    - Heavy S-cam tubular camshaft enclosures and pushrods
    - Pneumatic air delivery hoses with brass swivel elbows
    
    Axle Positions: Steer (+2.900), Tandem 1 (-2.300), Tandem 2 (-3.650)
    """
    brake_obj, brake_mesh, bm = create_bmesh_object("Air_Brake_Actuators", materials['Iron_CastHeavy'], parent)
    
    # 1. Front Steer Axle Type 20 Brake Chambers (2 Units at Y = +2.900)
    steer_y = 2.900
    steer_z = 0.540
    for side in [-1.0, 1.0]:
        bx = side * 0.820
        # Cylindrical clamp-ring brake chamber canister
        add_cylinder_to_bmesh(bm, (bx, steer_y - 0.120, steer_z), 0.095, 0.140, segments=20, axis='Y')
        # Center clamp band ring
        add_tube_to_bmesh(bm, (bx, steer_y - 0.120, steer_z), 0.102, 0.095, 0.025, segments=20, axis='Y')
        # Pushrod & Clevis pin
        add_cylinder_to_bmesh(bm, (bx, steer_y - 0.030, steer_z), 0.012, 0.100, segments=10, axis='Y')
        # Automatic Slack Adjuster Lever
        add_box_to_bmesh(bm, (bx, steer_y + 0.020, steer_z), (0.035, 0.050, 0.140))
        # S-Cam Camshaft housing tube running into brake backing plate
        add_cylinder_to_bmesh(bm, (side * 0.920, steer_y + 0.020, steer_z + 0.050), 0.024, 0.180, segments=12, axis='X')
        
    # 2. Tandem Rear Drive Axle Type 30/30 Dual Spring Brake Pots (4 Units)
    # Forward Axle: Y = -2.300, Rearward Axle: Y = -3.650
    for dy in [-2.300, -3.650]:
        for side in [-1.0, 1.0]:
            bx = side * 0.720
            # Double-diaphragm piggyback spring brake canister (Length 0.32 m)
            # Service brake section (front)
            add_cylinder_to_bmesh(bm, (bx, dy - 0.100, 0.560), 0.115, 0.160, segments=22, axis='Y')
            # Clamp band
            add_tube_to_bmesh(bm, (bx, dy - 0.100, 0.560), 0.122, 0.115, 0.028, segments=22, axis='Y')
            # Emergency spring brake piggyback section (rear)
            add_cylinder_to_bmesh(bm, (bx, dy - 0.240, 0.560), 0.110, 0.160, segments=22, axis='Y')
            # Manual caging bolt protruding from rear
            add_cylinder_to_bmesh(bm, (bx, dy - 0.330, 0.560), 0.012, 0.060, segments=10, axis='Y')
            
            # Pushrod, clevis and automatic slack adjuster
            add_cylinder_to_bmesh(bm, (bx, dy - 0.010, 0.560), 0.014, 0.100, segments=10, axis='Y')
            add_box_to_bmesh(bm, (bx, dy + 0.040, 0.560), (0.040, 0.060, 0.160))
            # S-Cam Camshaft enclosure tube
            add_cylinder_to_bmesh(bm, (side * 0.880, dy + 0.040, 0.620), 0.026, 0.280, segments=14, axis='X')
            
            # Heavy Brake Drums (Cast Iron) on drive wheel spindles
            add_cylinder_to_bmesh(bm, (side * 1.040, dy, 0.535), 0.220, 0.190, segments=28, axis='X')
            
    finalize_bmesh_object(brake_obj, brake_mesh, bm)
    return brake_obj


# =============================================================================
# SUBSYSTEM 23: CHASSIS COMPRESSED AIR TANKS & BENDIX AD-9 AIR DRYER
# =============================================================================

def build_chassis_compressed_air_tanks_and_dryer(materials, parent=None):
    """
    Constructs the commercial chassis pneumatic reservoir system:
    - 3 Cylindrical compressed air reservoir tanks (Primary, Secondary, Wet)
    - Brass cable-pull petcock drain valves on tank bellies
    - Bendix AD-9 heavy air dryer assembly with spin-on desiccant cartridge
    - Frame mounting saddle cradles
    
    Mounted Positions: Along and inside frame rails between Y = +2.100 and Y = -1.000
    """
    air_obj, air_mesh, bm = create_bmesh_object("Chassis_Air_System", materials['Iron_CastHeavy'], parent)
    brass_obj, brass_mesh, bm_brass = create_bmesh_object("Air_Fittings_Brass", materials['Alloy_AlcoaPolished'], parent)
    
    # 1. Primary Air Reservoir Tank (Inside frame rails at Y = +0.200)
    pri_r = 0.130  # 10-inch diameter
    pri_len = 0.850
    pri_center = (0.0, 0.200, 0.780)
    add_cylinder_to_bmesh(bm, pri_center, pri_r, pri_len, segments=24, axis='Y')
    # Domed ends
    add_cone_to_bmesh(bm, (0.0, 0.200 + (pri_len * 0.5) + 0.020, 0.780), pri_r, pri_r * 0.5, 0.040, segments=20, axis='Y')
    add_cone_to_bmesh(bm, (0.0, 0.200 - (pri_len * 0.5) - 0.020, 0.780), pri_r, pri_r * 0.5, 0.040, segments=20, axis='Y')
    # Brass drain valve
    add_cylinder_to_bmesh(bm_brass, (0.0, 0.200, 0.780 - pri_r - 0.020), 0.012, 0.040, segments=10, axis='Z')
    
    # 2. Secondary Air Reservoir Tank (Inside frame rails at Y = -0.750)
    sec_center = (0.0, -0.750, 0.780)
    add_cylinder_to_bmesh(bm, sec_center, pri_r, pri_len, segments=24, axis='Y')
    add_cone_to_bmesh(bm, (0.0, -0.750 + (pri_len * 0.5) + 0.020, 0.780), pri_r, pri_r * 0.5, 0.040, segments=20, axis='Y')
    add_cone_to_bmesh(bm, (0.0, -0.750 - (pri_len * 0.5) - 0.020, 0.780), pri_r, pri_r * 0.5, 0.040, segments=20, axis='Y')
    add_cylinder_to_bmesh(bm_brass, (0.0, -0.750, 0.780 - pri_r - 0.020), 0.012, 0.040, segments=10, axis='Z')
    
    # 3. Supply / Wet Air Reservoir Tank (Mounted on outer passenger rail at Y = +1.750)
    wet_r = 0.110
    wet_len = 0.650
    wet_x = 0.520
    wet_center = (wet_x, 1.750, 0.760)
    add_cylinder_to_bmesh(bm, wet_center, wet_r, wet_len, segments=20, axis='Y')
    add_cylinder_to_bmesh(bm_brass, (wet_x, 1.750, 0.760 - wet_r - 0.020), 0.012, 0.040, segments=10, axis='Z')
    # Mounting brackets to chassis rail
    for wy_off in [-0.220, 0.220]:
        add_box_to_bmesh(bm, (0.470, 1.750 + wy_off, 0.760), (0.080, 0.050, 0.100))
        
    # 4. Bendix AD-9 Air Dryer Assembly (Mounted on driver frame rail at Y = +2.050)
    dryer_x = -0.490
    dryer_y = 2.050
    dryer_z = 0.760
    # Cast aluminum lower body housing
    add_cylinder_to_bmesh(bm, (dryer_x, dryer_y, dryer_z), 0.085, 0.140, segments=20, axis='Z')
    # Lower purge valve exhaust port
    add_cylinder_to_bmesh(bm, (dryer_x, dryer_y, dryer_z - 0.090), 0.035, 0.060, segments=14, axis='Z')
    # Upper spin-on desiccant cartridge canister
    add_cylinder_to_bmesh(bm, (dryer_x, dryer_y, dryer_z + 0.150), 0.095, 0.220, segments=22, axis='Z')
    # Air line brass compression fittings
    add_cylinder_to_bmesh(bm_brass, (dryer_x + 0.070, dryer_y, dryer_z - 0.020), 0.014, 0.040, segments=10, axis='X')
    add_cylinder_to_bmesh(bm_brass, (dryer_x - 0.070, dryer_y, dryer_z - 0.020), 0.014, 0.040, segments=10, axis='X')
    
    finalize_bmesh_object(air_obj, air_mesh, bm)
    finalize_bmesh_object(brass_obj, brass_mesh, bm_brass)
    return air_obj


# =============================================================================
# SUBSYSTEM 24: REAR FRAME CLOSURE CROSSMEMBER & 4-INCH LED TAIL LIGHTS
# =============================================================================

def build_rear_frame_crossmember_and_led_tail_lights(materials, parent=None):
    """
    Constructs the rear frame cutoff closure crossmember, heavy pintle hook plate,
    and the authentic Peterbilt rear stainless steel tail light bar:
    - 4x Recessed 4-inch round red LED stop/turn/tail lamps with chrome bezels
    - 2x Recessed 4-inch round clear reverse back-up lamps
    - Center illuminated commercial license plate bracket with clearance LEDs
    - Heavy Holland cast steel pintle hitch mount plate and drawbar loop
    
    Mounted Position: Y = -4.380 m (Rear Frame Cutoff), Z = 0.780 m
    """
    lightbar_obj, lightbar_mesh, bm_bar = create_bmesh_object("Rear_Light_Bar_Stainless", materials['Chrome_MirrorPeterbilt'], parent)
    led_glass_obj, led_glass_mesh, bm_glass = create_bmesh_object("Rear_LED_Red_Lenses", materials['Glass_TaillampRed'], parent)
    led_glow_obj, led_glow_mesh, bm_glow = create_bmesh_object("Rear_LED_Red_Glow", materials['Emissive_LEDStopRed'], parent)
    rev_glass_obj, rev_glass_mesh, bm_rev = create_bmesh_object("Rear_Reverse_Lenses", materials['Glass_ReverseClear'], parent)
    
    bar_y = -4.380
    bar_z = 0.780
    bar_w = 0.860  # Frame width
    bar_h = 0.220
    
    # 1. Stainless Steel Rear Light Bar Faceplate
    add_box_to_bmesh(bm_bar, (0.0, bar_y, bar_z), (bar_w, 0.035, bar_h))
    
    # Heavy Tubular Rear Frame Bumper Bar (Round cross-tube below light bar)
    add_cylinder_to_bmesh(bm_bar, (0.0, bar_y, bar_z - (bar_h * 0.5) - 0.045), 0.045, bar_w + 0.120, segments=20, axis='X')
    
    # Heavy Cast Steel Pintle Hitch Mounting Plate & Loop (Center)
    add_box_to_bmesh(bm_bar, (0.0, bar_y - 0.020, bar_z), (0.220, 0.060, 0.200))
    add_tube_to_bmesh(bm_bar, (0.0, bar_y - 0.060, bar_z - 0.020), 0.055, 0.030, 0.040, segments=18, axis='Y')
    
    # 2. 4-Inch Round Red LED Stop/Turn/Tail Lamps (2 pairs: Outer and Inner)
    # Left Side (-X) and Right Side (+X)
    lamp_r = 0.055  # 4-inch standard diameter
    
    # 2 Red stop lamps per side
    for side in [-1.0, 1.0]:
        for l_idx, lx_off in enumerate([0.220, 0.340]):
            lx = side * lx_off
            lz = bar_z + 0.035
            
            # Chrome grommet bezel collar
            add_tube_to_bmesh(bm_bar, (lx, bar_y - 0.020, lz), lamp_r + 0.012, lamp_r, 0.018, segments=20, axis='Y')
            # Deep red optical polycarbonate dispersion lens
            add_cylinder_to_bmesh(bm_glass, (lx, bar_y - 0.022, lz), lamp_r, 0.012, segments=20, axis='Y')
            # High-intensity multi-diode red LED cluster
            add_cylinder_to_bmesh(bm_glow, (lx, bar_y - 0.015, lz), lamp_r * 0.85, 0.015, segments=18, axis='Y')
            
        # 1 Clear Round Reverse Lamp per side (placed below the red lamps)
        rx = side * 0.280
        rz = bar_z - 0.055
        add_tube_to_bmesh(bm_bar, (rx, bar_y - 0.020, rz), lamp_r + 0.012, lamp_r, 0.018, segments=20, axis='Y')
        add_cylinder_to_bmesh(bm_rev, (rx, bar_y - 0.022, rz), lamp_r, 0.012, segments=20, axis='Y')
        
    # 3. Center Rear License Plate Bracket & LED Light
    add_box_to_bmesh(bm_bar, (0.0, bar_y - 0.022, bar_z + 0.060), (0.280, 0.012, 0.120))
    # Top LED license lamp bar
    add_box_to_bmesh(bm_bar, (0.0, bar_y - 0.035, bar_z + 0.115), (0.140, 0.025, 0.025))
    
    finalize_bmesh_object(lightbar_obj, lightbar_mesh, bm_bar)
    finalize_bmesh_object(led_glass_obj, led_glass_mesh, bm_glass)
    finalize_bmesh_object(led_glow_obj, led_glow_mesh, bm_glow)
    finalize_bmesh_object(rev_glass_obj, rev_glass_mesh, bm_rev)
    return lightbar_obj


# =============================================================================
# SUBSYSTEM 25: CAB DOORS, PIANO HINGES, PADDLE HANDLES & GRAB RAILS
# =============================================================================

def build_cab_doors_handles_and_grab_rails(materials, parent=None):
    """
    Constructs the driver and passenger cab doors, chrome external piano hinges,
    recessed paddle door handles, side windows with vent wings, and vertical grab rails:
    - Left and Right doors (Y = +1.440 m to +0.320 m, Length 1.120 m)
    - 3 Heavy chrome piano-style external hinges per door
    - Recessed chrome paddle door handles with key lock cylinders
    - Triangular front vent wing glass panes & main roll-up window glass
    - 1.100 m tall vertical mirror-polished stainless steel cab entry grab rails
    
    Mounted Position: Cab Doors at X = +-1.090 m, Y = +0.880 m, Z = 1.100 to 2.350 m
    """
    door_obj, door_mesh, bm_door = create_bmesh_object("Cab_Doors_Panels", materials['Paint_PeterbiltBlack'], parent)
    chrome_obj, chrome_mesh, bm_chrome = create_bmesh_object("Door_Chrome_Jewelry", materials['Chrome_MirrorPeterbilt'], parent)
    glass_obj, glass_mesh, bm_glass = create_bmesh_object("Door_Side_Windows", materials['Glass_WindshieldTint'], parent)
    
    door_y_front = 1.440
    door_y_rear = 0.320
    door_len = door_y_front - door_y_rear  # 1.120 m
    door_mid_y = (door_y_front + door_y_rear) * 0.5  # 0.880 m
    
    sill_z = 1.100
    belt_z = 1.680
    top_z = 2.350
    door_h = top_z - sill_z  # 1.250 m
    
    for side in [-1.0, 1.0]:
        dx = side * 1.090
        
        # 1. Main Door Lower Body Panel (Between sill and window beltline)
        lower_h = belt_z - sill_z
        add_box_to_bmesh(bm_door, (dx, door_mid_y, (sill_z + belt_z) * 0.5), (0.035, door_len * 0.98, lower_h))
        
        # Recessed Door Outline Seam (Perimeter shut line groove)
        add_box_to_bmesh(bm_chrome, (side * (1.090 + 0.005), door_mid_y, belt_z), (0.015, door_len * 0.98, 0.022))
        
        # 2. Window Frame & Upper Door Header
        window_h = top_z - belt_z
        # Upper horizontal roof header bar
        add_box_to_bmesh(bm_door, (dx, door_mid_y, top_z - 0.025), (0.035, door_len * 0.98, 0.050))
        # Front A-pillar frame post
        add_box_to_bmesh(bm_door, (dx, door_y_front - 0.025, (belt_z + top_z) * 0.5), (0.035, 0.050, window_h))
        # Rear B-pillar frame post
        add_box_to_bmesh(bm_door, (dx, door_y_rear + 0.025, (belt_z + top_z) * 0.5), (0.035, 0.050, window_h))
        
        # 3. Side Windows (Vent Wing + Main Roll-Up Glass)
        # Triangular front vent wing divider post
        vent_y = door_y_front - 0.280
        add_box_to_bmesh(bm_chrome, (dx, vent_y, (belt_z + top_z) * 0.5), (0.025, 0.020, window_h))
        
        # Front vent wing glass pane
        vent_w = door_y_front - vent_y
        add_box_to_bmesh(bm_glass, (dx, (door_y_front + vent_y) * 0.5, (belt_z + top_z) * 0.5), (0.012, vent_w * 0.90, window_h * 0.88))
        
        # Main roll-up window glass pane
        main_win_w = vent_y - door_y_rear
        add_box_to_bmesh(bm_glass, (dx, (vent_y + door_y_rear) * 0.5, (belt_z + top_z) * 0.5), (0.012, main_win_w * 0.92, window_h * 0.88))
        
        # 4. External Chrome Piano-Style Door Hinges (3 per door on A-pillar)
        for hz in [sill_z + 0.150, (sill_z + belt_z) * 0.5, belt_z - 0.080]:
            add_cylinder_to_bmesh(bm_chrome, (side * 1.105, door_y_front, hz), 0.014, 0.090, segments=12, axis='Z')
            add_box_to_bmesh(bm_chrome, (side * 1.095, door_y_front, hz), (0.025, 0.045, 0.065))
            
        # 5. Recessed Rectangular Chrome Paddle Door Handle
        # Positioned near rear door edge at beltline: Y = +0.520 m, Z = 1.620 m
        handle_y = 0.520
        handle_z = 1.620
        # Chrome escutcheon dish plate
        add_box_to_bmesh(bm_chrome, (side * 1.105, handle_y, handle_z), (0.015, 0.160, 0.090))
        # Recessed paddle trigger lever
        add_box_to_bmesh(bm_chrome, (side * 1.110, handle_y + 0.020, handle_z), (0.012, 0.090, 0.045))
        # Key lock cylinder tumbler
        add_cylinder_to_bmesh(bm_chrome, (side * 1.112, handle_y - 0.045, handle_z), 0.009, 0.015, segments=10, axis='X')
        
        # 6. Vertical Mirror-Polished Stainless Steel Entry Grab Rails
        # Bolted to cab B-pillar behind door for three points of contact ingress
        grab_x = side * 1.120
        grab_y = door_y_rear - 0.060
        grab_bot_z = 1.220
        grab_top_z = 2.320
        grab_h = grab_top_z - grab_bot_z
        # Vertical tubular rail
        add_cylinder_to_bmesh(bm_chrome, (grab_x, grab_y, (grab_bot_z + grab_top_z) * 0.5), 0.018, grab_h, segments=14, axis='Z')
        # 3 Standoff bracket arms connecting to cab pillar
        for sz in [grab_bot_z + 0.050, (grab_bot_z + grab_top_z) * 0.5, grab_top_z - 0.050]:
            add_cylinder_to_bmesh(bm_chrome, (side * (1.120 - 0.015), grab_y, sz), 0.014, 0.035, segments=10, axis='X')
            add_box_to_bmesh(bm_chrome, (side * 1.095, grab_y, sz), (0.015, 0.055, 0.055))
            
    finalize_bmesh_object(door_obj, door_mesh, bm_door)
    finalize_bmesh_object(chrome_obj, chrome_mesh, bm_chrome)
    finalize_bmesh_object(glass_obj, glass_mesh, bm_glass)
    return door_obj


# =============================================================================
# MASTER ORCHESTRATION & EXPORT FUNCTION
# =============================================================================

def build_complete_peterbilt_379():
    """
    Master procedural build function assembling all 25 Class-A automotive CAD
    exterior subsystems of the 1995 Peterbilt 379 Extended Hood tractor.
    Sets up metric environment, instantiates the PBR material factory, links
    all components to root master object, and exports unified master GLBs.
    """
    print("=============================================================================")
    print("STARTING PROCEDURAL BUILD: 1995 PETERBILT 379 EXTENDED HOOD (1990s TRUCK)")
    print("=============================================================================")
    
    # 1. Metric Scene Setup
    safe_reset_scene()
    
    # 2. Materials Factory
    materials = create_all_peterbilt_materials()
    
    # 3. Master Vehicle Root Empty Object
    root_obj = bpy.data.objects.new("Peterbilt_379_Extended_Hood_1995", None)
    bpy.context.scene.collection.objects.link(root_obj)
    
    # 4. Build All 25 Subsystems Hierarchically
    print("--> Building Subsystem 1: Chassis Frame & Crossmembers...")
    build_chassis_frame(materials, root_obj)
    
    print("--> Building Subsystem 2: Dana Spicer Steer Axle & Suspension...")
    build_front_suspension_and_steer_axle(materials, root_obj)
    
    print("--> Building Subsystem 3: Peterbilt Low Air Leaf Tandem Rear Bogie...")
    build_peterbilt_low_air_leaf_tandem_suspension(materials, root_obj)
    
    print("--> Building Subsystem 4: 10-Wheel Fleet (24.5\" Alcoa Wheels & 11R24.5 Tires)...")
    build_10_wheel_fleet(materials, root_obj)
    
    print("--> Building Subsystem 5: Holland Sliding Fifth-Wheel Assembly...")
    build_sliding_fifth_wheel(materials, root_obj)
    
    print("--> Building Subsystem 6: 127\" BBC Extended Hood & Fender Flares...")
    build_127_bbc_extended_hood(materials, root_obj)
    
    print("--> Building Subsystem 7: Towering Grille Surround & Red Oval Badge...")
    build_towering_grille_and_peterbilt_oval(materials, root_obj)
    
    print("--> Building Subsystem 8: Texas-Style 18\" Drop Chrome Front Bumper...")
    build_texas_drop_chrome_front_bumper(materials, root_obj)
    
    print("--> Building Subsystem 9: Dual Rectangular Headlamp Pods...")
    build_dual_rectangular_headlight_pods(materials, root_obj)
    
    print("--> Building Subsystem 10: Dual 15\" Donaldson Chrome Air Cleaners...")
    build_dual_15inch_donaldson_chrome_air_cleaners(materials, root_obj)
    
    print("--> Building Subsystem 11: Unibilt 63\" UltraCab Sleeper Shell & Dome Rivets...")
    build_unibilt_ultracab_sleeper_and_cab(materials, root_obj)
    
    print("--> Building Subsystem 12: Split Windshield & 14\" Gangster Drop Visor...")
    build_split_windshield_and_gangster_visor(materials, root_obj)
    
    print("--> Building Subsystem 13: 5 Bullet Roof Lights, Dual Hadley Horns & CBs...")
    build_cab_roof_bullet_lights_and_horns(materials, root_obj)
    
    print("--> Building Subsystem 14: Dual 7\" Chrome Monster Stacks & Heat Shields...")
    build_dual_7inch_chrome_monster_stacks(materials, root_obj)
    
    print("--> Building Subsystem 15: Dual 150-Gallon Cylindrical Fuel Tanks & Steps...")
    build_dual_150gal_cylindrical_fuel_tanks(materials, root_obj)
    
    print("--> Building Subsystem 16: Battery & Tool Boxes with Stirrup Steps...")
    build_battery_box_tool_box_and_stirrup_steps(materials, root_obj)
    
    print("--> Building Subsystem 17: Stainless West Coast Tripod Double-Mirrors...")
    build_west_coast_tripod_mirrors(materials, root_obj)
    
    print("--> Building Subsystem 18: Diamond-Plate Rear Catwalk & Access Ladder...")
    build_diamond_plate_rear_catwalk(materials, root_obj)
    
    print("--> Building Subsystem 19: Trailer Umbilical Pylon & Coiled Suzie Lines...")
    build_trailer_umbilical_pylon_and_suzie_lines(materials, root_obj)
    
    print("--> Building Subsystem 20: 2-Piece Stainless Rear Half-Fenders & Mudflaps...")
    build_rear_half_fenders_and_peterbilt_mudflaps(materials, root_obj)
    
    print("--> Building Subsystem 21: Eaton Fuller 18-Speed Transmission & Driveshafts...")
    build_eaton_fuller_transmission_and_driveshafts(materials, root_obj)
    
    print("--> Building Subsystem 22: Pneumatic Brake Actuators & Slack Adjusters...")
    build_pneumatic_brake_actuators_and_slack_adjusters(materials, root_obj)
    
    print("--> Building Subsystem 23: Chassis Air Tanks & Bendix AD-9 Dryer...")
    build_chassis_compressed_air_tanks_and_dryer(materials, root_obj)
    
    print("--> Building Subsystem 24: Rear Closure Crossmember & 4\" LED Tail Lights...")
    build_rear_frame_crossmember_and_led_tail_lights(materials, root_obj)
    
    print("--> Building Subsystem 25: Cab Doors, Piano Hinges, Handles & Grab Rails...")
    build_cab_doors_handles_and_grab_rails(materials, root_obj)
    
    # 5. Dual-Mode GLB Export
    export_dirs = [
        os.path.join("public", "models", "vehicles", "heavy_truck", "1990s"),
        os.path.join("public", "models"),
        os.path.join("exports")
    ]
    for ed in export_dirs:
        os.makedirs(ed, exist_ok=True)
        
    export_targets = [
        os.path.join("public", "models", "vehicles", "heavy_truck", "1990s", "vehicle.glb"),
        os.path.join("public", "models", "Car_Peterbilt_379_1990s.glb"),
        os.path.join("exports", "Car_Peterbilt_379_1990s.glb")
    ]
    
    # Deselect all, select hierarchy
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.context.scene.objects:
        obj.select_set(True)
        
    for target in export_targets:
        print(f"--> Exporting GLB: {target}...")
        bpy.ops.export_scene.gltf(
            filepath=target,
            export_format='GLB',
            use_selection=True,
            export_apply=True,
            export_materials='EXPORT',
            export_image_format='AUTO',
            export_yup=True
        )
        file_size_mb = os.path.getsize(target) / (1024 * 1024)
        print(f"    [SUCCESS] Exported {target} ({file_size_mb:.2f} MB)")
        
    print("=============================================================================")
    print("PETERBILT 379 PROCEDURAL CLASS-A CAD BUILD COMPLETED SUCCESSFULLY!")
    print("=============================================================================")

if __name__ == "__main__":
    build_complete_peterbilt_379()
