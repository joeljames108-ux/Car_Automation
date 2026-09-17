"""
=============================================================================
CLASS-A CAD PROCEDURAL GENERATOR: SCANIA 142H V8 6x4 (1980s HEAVY TRUCK)
=============================================================================
Procedural Class-A CAD construction of the legendary 1980s European Heavy Tractor:
the 1982-1985 Scania 142H 6x4 V8 Super Heavy Haulage Tractor (CR19 Sleeper Cab).
Adheres strictly to the Procedural Automotive Blender Pipeline, Autonomous
Blender Visual Feedback Loop, and Maximum Visual Quality CAD Standard.

Scope: EXTERIOR ONLY (Museum-Grade Class-A CAD Geometry, Materials & Hardware).
Target Line Count: 3,000+ lines of substantive, fully procedural BMesh code.

Factory Engineering & Dimensional Specifications:
- Architecture: Heavy Truck (European Cab-Over-Engine 6x4 Heavy Tractor)
- Era: 1980s (1980-1989)
- Reference: 1982-1985 Scania 142H V8 (CR19 Sleeper Cab, 3,800 mm Wheelbase)
- Front Steer Axle: Y = +2.200 m
- Tandem Rear Drive Axles:
    * Forward Drive Axle:  Y = -0.925 m
    * Rearward Drive Axle: Y = -2.275 m
    * Tandem Spread: 1.350 m (Tandem Center at Y = -1.600 m)
- Overall Length: 5.900 m (Front Bumper at Y = +2.700 m, Rear Underrun Bar at Y = -3.200 m)
- Cab Width: 2.420 m (Over wheel flares: 2.500 m, Mirror span: 2.920 m)
- Overall Height: 3.850 m (Top of adjustable roof aerofoil & twin Hadley horns)
- Frame Height: Top of rail at Z = 1.020 m, Ground clearance = 0.280 m
- Wheel Assembly: 10 Wheels Total
    * Steer Axle: 2x 22.5" x 9.00" 10-Hole Steel Disc Wheels with Conical Hubs
    * Tandem Drive Axles: 4x Dual Assemblies (8x 22.5" Wheels) with Planetary Hub Reduction
    * Tires: 315/80R22.5 Heavy Commercial Highway & Traction Radials
- Complete Exterior Subsystems:
    1. High-tensile steel ladder chassis frame (270x90 U-channels, 6 crossmembers, tow pin, tilt pivots)
    2. Front drop-forged I-beam steer axle (AM740) with 9-leaf parabolic springs, shocks, sway bar
    3. Scania R770/R780 tandem rear hub reduction drive axles with walking-beam bogie suspension
    4. 10-wheel fleet with European 22.5" steel disc rims and planetary hub reduction covers
    5. Jost JSK 37 C heavy cast steel sliding fifth-wheel coupling with toothed rack slider
    6. CR19 forward-control sleeper cab shell with sloped front, roof ribs, pop-up hatch, tilt hinges
    7. Dual-tier front grille: upper hinged 5-slat white service grille + chrome SCANIA, lower grille + 142H + V8 red badge
    8. Aerodynamic composite front corner air deflectors (wind vanes) flanking the front face
    9. 3-piece pressed steel bumper, rectangular H4 halogen headlamps, integrated headlight wipers/washers, fog lamps
    10. Panoramic laminated windshield with authentic three-wiper pantograph assembly
    11. Exterior molded smoked-acrylic sunvisor brow with 5 integrated amber clearance lamps
    12. Adjustable roof aerofoil wind deflector with rear tilt struts and vertical cab collar side wings
    13. Twin Hadley chrome trumpet air horns and twin roof CB whip antennas
    14. Cab doors with recessed flush handles, double-lens European heated mirrors, passenger curb mirror
    15. Stepped entry stirrup footsteps (perforated aluminum open grates, flexible rubber lower step, grab rails)
    16. 400-liter D-shaped brushed aluminum diesel fuel tank with rubber-isolated J-brackets and steel straps
    17. Stamped steel battery enclosure (dual 12V 220Ah) and 4 compressed air reservoir cylinders with Wabco dryer
    18. Horizontal under-cab exhaust silencer muffler with perforated heat shield and downturn swept tailpipe
    19. Aluminum anti-skid punched-tread catwalk deck plate, support pylon, and 4 coiled Suzie umbilical lines
    20. European 3-piece thermoplastic rear curved mudguards with anti-spray flaps and Scania Griffin crests
    21. ECE R58 rear underrun protection beam, 6-chamber Euro taillight clusters, ECE 70 chevron marker plates
    22. Scania GR871 10-speed transmission casing, auxiliary range-box, and cardan driveshaft driveline
    23. Pneumatic brake actuators (Type 24 front chambers, Type 24/30 tandem spring brake chambers, slack adjusters)
    24. Sleeper bunk exterior luggage lockers, rear cab observation window, and hydraulic cab tilt cylinders
    25. Sound-encapsulation acoustic under-cab skirts and flexible rubber wheel-arch road spray aprons

Coordinate System:
- Metric Units (Meters).
- +Y: Forward (Front Bumper)
- -Y: Rearward (Rear Frame / Mudflaps)
- +Z: Upward (Roof / Aerofoil)
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
PUBLIC_MODELS_DIR = os.path.join(ROOT_DIR, "public", "models", "vehicles", "heavy_truck", "1980s")
EXPORTS_DIR = os.path.join(ROOT_DIR, "exports")
CANONICAL_GLB_PATH = os.path.normpath(os.path.join(PUBLIC_MODELS_DIR, "vehicle.glb"))
ARCHIVAL_GLB_PATH = os.path.normpath(os.path.join(EXPORTS_DIR, "Car_Scania_142H_1980s.glb"))
ROOT_MODELS_GLB_PATH = os.path.normpath(os.path.join(ROOT_DIR, "public", "models", "Car_Scania_142H_1980s.glb"))

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
    print("[SCANIA 142H] Scene reset and configured for metric Class-A CAD.")

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

def create_all_scania_materials():
    """Initializes the complete palette of authentic 1980s Scania factory materials."""
    mats = {}
    
    # 1. Cab Bodywork: Iconic Swedish Rally Red with clearcoat
    mats['cab_paint'] = make_pbr_material(
        'Paint_ScaniaRed',
        base_color=(0.82, 0.03, 0.04),
        metallic=0.05,
        roughness=0.15,
        clearcoat=1.00
    )
    
    # 2. Grille Slats & Aerofoil White
    mats['white_paint'] = make_pbr_material(
        'Paint_ScaniaWhite',
        base_color=(0.94, 0.94, 0.93),
        metallic=0.02,
        roughness=0.32,
        clearcoat=0.60
    )
    
    # 3. Chassis Subframe & Axles: Scania Dark Industrial Grey
    mats['chassis_grey'] = make_pbr_material(
        'Paint_ChassisGrey',
        base_color=(0.065, 0.070, 0.075),
        metallic=0.60,
        roughness=0.38
    )
    
    # 4. Textured Black Thermoplastic Trim (Bumper, wheel flares, steps, mirrors)
    mats['trim_black'] = make_pbr_material(
        'Plastic_TrimBlack',
        base_color=(0.022, 0.022, 0.022),
        metallic=0.02,
        roughness=0.58
    )
    
    # 5. Composite Aerodynamic Deflectors (Smooth satin white finish)
    mats['aero_deflector'] = make_pbr_material(
        'Plastic_AeroDeflector',
        base_color=(0.90, 0.90, 0.89),
        metallic=0.03,
        roughness=0.28,
        clearcoat=0.85
    )
    
    # 6. High-Luster Mirror Chrome (Emblems, horns, mirrors, wheel caps)
    mats['chrome'] = make_pbr_material(
        'Chrome_Mirror',
        base_color=(0.95, 0.95, 0.95),
        metallic=1.00,
        roughness=0.03
    )
    
    # 7. Brushed / Polished Aluminum (Fuel tank, catwalk, footsteps)
    mats['aluminum'] = make_pbr_material(
        'Alloy_BrushedAluminum',
        base_color=(0.86, 0.87, 0.88),
        metallic=0.92,
        roughness=0.22
    )
    
    # 8. Cast Iron (Brake drums, suspension walking beams, fifth wheel plate)
    mats['cast_iron'] = make_pbr_material(
        'Iron_CastHeavy',
        base_color=(0.09, 0.09, 0.09),
        metallic=0.70,
        roughness=0.62
    )
    
    # 9. Steel Wheel Disc Silver
    mats['steel_wheel'] = make_pbr_material(
        'Steel_WheelSilver',
        base_color=(0.76, 0.77, 0.78),
        metallic=0.86,
        roughness=0.30
    )
    
    # 10. Commercial Heavy Duty Tire Rubber
    mats['tire_rubber'] = make_pbr_material(
        'Rubber_TreadTire',
        base_color=(0.028, 0.028, 0.028),
        metallic=0.00,
        roughness=0.86
    )
    
    # 11. Panoramic Windshield & Side Windows: High-Gloss Tinted Safety Glass
    mats['glass_window'] = make_pbr_material(
        'Glass_Windshield',
        base_color=(0.03, 0.04, 0.05),
        metallic=0.15,
        roughness=0.02,
        clearcoat=1.00,
        transmission=0.0,
        alpha=0.96
    )
    
    # 12. Smoked Acrylic Sunvisor Brow (Translucent amber/smoked)
    mats['glass_sunvisor'] = make_pbr_material(
        'Glass_SunvisorAmber',
        base_color=(0.80, 0.42, 0.04),
        metallic=0.00,
        roughness=0.08,
        transmission=0.72,
        ior=1.49,
        alpha=0.45
    )
    
    # 13. Fluted Polycarbonate Headlamp Glass
    mats['glass_headlamp'] = make_pbr_material(
        'Glass_HeadlampFluted',
        base_color=(0.96, 0.96, 0.96),
        metallic=0.00,
        roughness=0.06,
        transmission=0.86,
        ior=1.51,
        alpha=0.35
    )
    
    # 14. Amber Turn Indicator & Marker Lens Glass
    mats['glass_amber'] = make_pbr_material(
        'Glass_AmberIndicator',
        base_color=(0.95, 0.46, 0.02),
        metallic=0.00,
        roughness=0.10,
        transmission=0.80,
        ior=1.51,
        alpha=0.45
    )
    
    # 15. Ruby Red Taillamp Prism Glass
    mats['glass_red'] = make_pbr_material(
        'Glass_TaillampRed',
        base_color=(0.85, 0.03, 0.03),
        metallic=0.00,
        roughness=0.08,
        transmission=0.82,
        ior=1.51,
        alpha=0.45
    )
    
    # 16. Clear Reverse Light Glass
    mats['glass_reverse'] = make_pbr_material(
        'Glass_ReverseClear',
        base_color=(0.95, 0.95, 0.95),
        metallic=0.00,
        roughness=0.08,
        transmission=0.85,
        ior=1.51,
        alpha=0.40
    )
    
    # 17. Iconic V8 Emblem: Bold Red & Gold
    mats['badge_v8'] = make_pbr_material(
        'Badge_ScaniaV8',
        base_color=(0.90, 0.05, 0.06),
        metallic=0.85,
        roughness=0.18,
        clearcoat=1.0
    )
    
    # 18. Rubber Mudflaps with White Crest Stamping
    mats['mudflap'] = make_pbr_material(
        'Rubber_ScaniaMudflap',
        base_color=(0.035, 0.035, 0.035),
        metallic=0.02,
        roughness=0.82
    )
    
    # 19. H4 Halogen Headlight Beam Core (Emissive)
    mats['emissive_headlight'] = make_pbr_material(
        'Emissive_H4Halogen',
        base_color=(1.00, 0.96, 0.88),
        emission_color=(1.00, 0.96, 0.88),
        emission_strength=18.0
    )
    
    # 20. Amber Clearance / Marker Lamp Core (Emissive)
    mats['emissive_amber'] = make_pbr_material(
        'Emissive_MarkerAmber',
        base_color=(1.00, 0.52, 0.04),
        emission_color=(1.00, 0.52, 0.04),
        emission_strength=9.0
    )
    
    # 21. Red Tail / Brake Lamp Core (Emissive)
    mats['emissive_red'] = make_pbr_material(
        'Emissive_TailBrakeRed',
        base_color=(1.00, 0.04, 0.02),
        emission_color=(1.00, 0.04, 0.02),
        emission_strength=12.0
    )
    
    # 22. Coiled Trailer Suzie Airlines (Red, Yellow, Black, Green)
    mats['suzie_red'] = make_pbr_material('Suzie_EmergencyRed', base_color=(0.85, 0.08, 0.08), roughness=0.35)
    mats['suzie_yellow'] = make_pbr_material('Suzie_ServiceYellow', base_color=(0.90, 0.75, 0.05), roughness=0.35)
    mats['suzie_black'] = make_pbr_material('Suzie_ISO1185Black', base_color=(0.04, 0.04, 0.04), roughness=0.45)
    mats['suzie_green'] = make_pbr_material('Suzie_AuxiliaryGreen', base_color=(0.08, 0.65, 0.15), roughness=0.35)
    
    # 23. ECE 70 Rear Warning Chevron (Reflective diagonal yellow/red)
    mats['ece70_plate'] = make_pbr_material(
        'Decal_ECE70Chevron',
        base_color=(0.92, 0.72, 0.05),
        metallic=0.10,
        roughness=0.30
    )
    
    print(f"[SCANIA 142H] Initialized {len(mats)} master PBR automotive materials.")
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
        
    # Side quads
    for i in range(segments):
        next_i = (i + 1) % segments
        bm.faces.new([bot_verts[i], bot_verts[next_i], top_verts[next_i], top_verts[i]])
        
    # End caps
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
        # Outer surface
        bm.faces.new([outer_bot[i], outer_bot[next_i], outer_top[next_i], outer_top[i]])
        # Inner surface
        bm.faces.new([inner_top[i], inner_top[next_i], inner_bot[next_i], inner_bot[i]])
        # Bottom annular rim
        bm.faces.new([outer_bot[next_i], outer_bot[i], inner_bot[i], inner_bot[next_i]])
        # Top annular rim
        bm.faces.new([outer_top[i], outer_top[next_i], inner_top[next_i], inner_top[i]])

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

def add_arch_to_bmesh(bm, center, radius_outer, radius_inner, width, ang_start=0.0, ang_end=math.pi, segments=18, axis='X'):
    """Adds a smooth partial annular arch (semi-cylinder ribbon) to BMesh."""
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
        
        # Outer curved surface
        bm.faces.new([o0_c, o0_n, o1_n, o1_c])
        # Inner curved surface
        bm.faces.new([i1_c, i1_n, i0_n, i0_c])
        # Side faces
        bm.faces.new([i0_c, i0_n, o0_n, o0_c])
        bm.faces.new([o1_c, o1_n, i1_n, i1_c])
        
    # End caps
    o0_s, o1_s = outer_v[0]
    i0_s, i1_s = inner_v[0]
    bm.faces.new([o0_s, o1_s, i1_s, i0_s])
    
    o0_e, o1_e = outer_v[-1]
    i0_e, i1_e = inner_v[-1]
    bm.faces.new([i0_e, i1_e, o1_e, o0_e])

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
    
    # Auto-smooth normals
    if hasattr(mesh, 'use_auto_smooth'):
        mesh.use_auto_smooth = True
        mesh.auto_smooth_angle = math.radians(smooth_angle)
    else:
        # Blender 4.1+ LTS uses modifier or shade_smooth_by_angle
        for f in mesh.polygons:
            f.use_smooth = True



# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 1: LADDER CHASSIS FRAME & CROSSMEMBERS
# ----------------------------------------------------------------------------
def build_ladder_chassis_frame(parent, mats):
    """
    Constructs the high-tensile steel European ladder chassis frame.
    270x90x9.5 mm U-channel longitudinal rails, 6 structural crossmembers,
    cab tilt pivot hinge brackets, front towing jaw, and rear towing pintle.
    """
    frame_obj, frame_mesh, bm_frame = create_bmesh_object("Chassis_LadderFrame", mats['chassis_grey'], parent)
    hw_obj, hw_mesh, bm_hw = create_bmesh_object("Chassis_FrameHardware", mats['cast_iron'], parent)
    
    # Chassis Rail Dimensions (Scania Heavy-Duty F950 Frame)
    # Length: Y = +2.600 m to Y = -3.100 m (5.700 m span)
    rail_y_front = 2.600
    rail_y_rear = -3.100
    rail_len = rail_y_front - rail_y_rear # 5.700 m
    rail_y_mid = (rail_y_front + rail_y_rear) * 0.5
    
    rail_z_top = 1.020
    rail_z_bot = 0.750
    rail_height = rail_z_top - rail_z_bot # 0.270 m (270 mm)
    rail_z_mid = (rail_z_top + rail_z_bot) * 0.5
    
    rail_flange_w = 0.090 # 90 mm flange width
    web_thick = 0.0095   # 9.5 mm high-tensile steel
    flange_thick = 0.0095
    
    frame_width_outer = 0.770 # Standard European 770 mm chassis width
    half_fw = frame_width_outer * 0.5 # 0.385 m
    
    for side in [1, -1]:
        rail_x_outer = half_fw * side
        rail_x_inner = (half_fw - rail_flange_w) * side if side > 0 else (half_fw - rail_flange_w) * side
        web_x_center = (half_fw - web_thick * 0.5) * side
        
        # 1. Vertical Web Plate
        add_box_to_bmesh(
            bm_frame,
            center=(web_x_center, rail_y_mid, rail_z_mid),
            dimensions=(web_thick, rail_len, rail_height)
        )
        
        # 2. Top Horizontal Flange (inward pointing)
        flange_x = (half_fw - rail_flange_w * 0.5) * side
        add_box_to_bmesh(
            bm_frame,
            center=(flange_x, rail_y_mid, rail_z_top - flange_thick * 0.5),
            dimensions=(rail_flange_w, rail_len, flange_thick)
        )
        
        # 3. Bottom Horizontal Flange (inward pointing)
        add_box_to_bmesh(
            bm_frame,
            center=(flange_x, rail_y_mid, rail_z_bot + flange_thick * 0.5),
            dimensions=(rail_flange_w, rail_len, flange_thick)
        )
        
        # 4. Front Frame Horn Extensions & Cab Tilt Pivot Brackets
        horn_x = (half_fw + 0.020) * side
        add_box_to_bmesh(
            bm_frame,
            center=(horn_x, 2.500, rail_z_mid + 0.020),
            dimensions=(0.040, 0.220, 0.180)
        )
        # Tilt Hinge Bearing Boss
        add_cylinder_to_bmesh(
            bm_hw,
            center=((half_fw + 0.045) * side, 2.520, rail_z_mid + 0.080),
            radius=0.040,
            height=0.050,
            segments=16,
            axis='X'
        )
        # Tilt Hinge Pin Bolt
        add_cylinder_to_bmesh(
            bm_hw,
            center=((half_fw + 0.045) * side, 2.520, rail_z_mid + 0.080),
            radius=0.020,
            height=0.070,
            segments=12,
            axis='X'
        )
        
        # 5. Web Stiffener Reinforcement Gussets at Bogie Pivot (Y = -1.600 m)
        add_box_to_bmesh(
            bm_frame,
            center=((half_fw - rail_flange_w * 0.5) * side, -1.600, rail_z_mid),
            dimensions=(rail_flange_w - 0.010, 0.320, rail_height - 0.020)
        )
        
        # 6. Web Flange Bolts (Array of M16 Chassis Assembly Bolts)
        for y_bolt in [2.30, 2.05, 1.80, 1.40, 1.00, 0.60, 0.20, -0.20, -0.60, -1.00, -1.35, -1.85, -2.20, -2.60, -2.90]:
            # Double bolt rows on web
            for z_off in [-0.070, 0.070]:
                add_cylinder_to_bmesh(
                    bm_hw,
                    center=((half_fw + 0.005) * side, y_bolt, rail_z_mid + z_off),
                    radius=0.014,
                    height=0.012,
                    segments=8,
                    axis='X'
                )
                
    # 7. Structural Crossmembers (6 High-Rigidity Transverse Members)
    # Crossmember 1: Front Bumper / Tow Jaw Transverse Member (Y = 2.450 m)
    add_box_to_bmesh(
        bm_frame,
        center=(0.0, 2.450, rail_z_mid),
        dimensions=(frame_width_outer - web_thick * 2, 0.160, 0.200)
    )
    # Central Heavy Towing Jaw Casting with Pin Socket
    add_box_to_bmesh(
        bm_hw,
        center=(0.0, 2.560, rail_z_mid),
        dimensions=(0.180, 0.140, 0.160)
    )
    add_cylinder_to_bmesh(
        bm_hw,
        center=(0.0, 2.560, rail_z_mid),
        radius=0.035,
        height=0.180,
        segments=16,
        axis='Z'
    )
    # Removable Heavy Tow Pin
    add_cylinder_to_bmesh(
        bm_hw,
        center=(0.0, 2.560, rail_z_mid + 0.020),
        radius=0.025,
        height=0.220,
        segments=12,
        axis='Z'
    )
    
    # Crossmember 2: Engine Rear & Front Cab Mount Support (Y = 1.600 m) - Arched Drop Member
    add_box_to_bmesh(
        bm_frame,
        center=(0.0, 1.600, rail_z_mid - 0.040),
        dimensions=(frame_width_outer - web_thick * 2, 0.120, 0.140)
    )
    
    # Crossmember 3: Transmission Support & Exhaust Hanger Member (Y = 0.500 m)
    add_box_to_bmesh(
        bm_frame,
        center=(0.0, 0.500, rail_z_mid),
        dimensions=(frame_width_outer - web_thick * 2, 0.100, 0.120)
    )
    
    # Crossmember 4: Forward Tandem Bogie Reaction Member (Y = -0.550 m)
    add_box_to_bmesh(
        bm_frame,
        center=(0.0, -0.550, rail_z_mid + 0.020),
        dimensions=(frame_width_outer - web_thick * 2, 0.140, 0.160)
    )
    
    # Crossmember 5: Central Bogie Trunnion Heavy Tubular Crossmember (Y = -1.600 m)
    # Heavy 140mm seamless steel tube bridging frame rails to absorb massive roll/torsion
    add_cylinder_to_bmesh(
        bm_frame,
        center=(0.0, -1.600, rail_z_mid - 0.030),
        radius=0.070,
        height=frame_width_outer + 0.060,
        segments=20,
        axis='X'
    )
    # Flanged End Castings bolted to frame rails
    for side in [1, -1]:
        add_cylinder_to_bmesh(
            bm_hw,
            center=(half_fw * side, -1.600, rail_z_mid - 0.030),
            radius=0.100,
            height=0.035,
            segments=16,
            axis='X'
        )
        
    # Crossmember 6: Rear Towing & Underrun Support Member (Y = -2.950 m)
    add_box_to_bmesh(
        bm_frame,
        center=(0.0, -2.950, rail_z_mid),
        dimensions=(frame_width_outer - web_thick * 2, 0.140, 0.220)
    )
    # Heavy Rear Pintle Hook Hitch Base Plate
    add_box_to_bmesh(
        bm_hw,
        center=(0.0, -3.030, rail_z_mid),
        dimensions=(0.240, 0.035, 0.200)
    )
    # Heavy Forged Rear Towing Pintle Jaw
    add_tube_to_bmesh(
        bm_hw,
        center=(0.0, -3.070, rail_z_mid),
        radius_outer=0.065,
        radius_inner=0.035,
        height=0.060,
        segments=16,
        axis='Y'
    )
    
    finalize_bmesh_object(frame_obj, frame_mesh, bm_frame, 32.0)
    finalize_bmesh_object(hw_obj, hw_mesh, bm_hw, 32.0)
    print("[SCANIA 142H] Subsystem 1: Heavy ladder chassis frame built.")

# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 2: FRONT STEER AXLE & AM740 SUSPENSION
# ----------------------------------------------------------------------------
def build_front_steer_axle_and_am740(parent, mats):
    """
    Constructs the Scania AM740 drop-forged I-beam front steer axle assembly.
    Y = +2.200 m, Z = 0.520 m.
    Includes 9-leaf parabolic leaf springs, U-bolt saddles, hydraulic shock absorbers,
    40mm anti-roll sway bar, kingpins, steering tie rod, and longitudinal drag link.
    """
    axle_obj, axle_mesh, bm_axle = create_bmesh_object("FrontAxle_AM740", mats['chassis_grey'], parent)
    susp_obj, susp_mesh, bm_susp = create_bmesh_object("FrontAxle_Suspension", mats['cast_iron'], parent)
    
    axle_y = 2.200
    axle_z = 0.520
    kingpin_span = 2.050 # 1.025 m each side
    spring_seat_x = 0.460 # Spring center 460 mm from vehicle centerline
    frame_width_outer = 0.770
    
    # 1. AM740 Drop-Forged I-Beam Center Section
    # Center section drops 80mm between spring seats for low engine mounting
    center_span = spring_seat_x * 2.0 # 0.920 m
    # Upper Flange
    add_box_to_bmesh(
        bm_axle,
        center=(0.0, axle_y, axle_z - 0.040),
        dimensions=(center_span, 0.075, 0.016)
    )
    # Vertical Web
    add_box_to_bmesh(
        bm_axle,
        center=(0.0, axle_y, axle_z - 0.080),
        dimensions=(center_span, 0.020, 0.080)
    )
    # Lower Flange
    add_box_to_bmesh(
        bm_axle,
        center=(0.0, axle_y, axle_z - 0.120),
        dimensions=(center_span, 0.085, 0.018)
    )
    
    # 2. Outer Axle Arms (Swept upward to Kingpin Bosses)
    for side in [1, -1]:
        arm_len = kingpin_span * 0.5 - spring_seat_x # ~0.565 m
        arm_x_mid = (spring_seat_x + kingpin_span * 0.5) * 0.5 * side
        arm_z_mid = axle_z - 0.020
        
        # Forged arm with upward taper
        add_box_to_bmesh(
            bm_axle,
            center=(arm_x_mid, axle_y, arm_z_mid),
            dimensions=(arm_len, 0.080, 0.090)
        )
        
        # Kingpin Forged Yoke Boss (Inclined 5 degrees kingpin angle)
        kp_x = (kingpin_span * 0.5) * side
        add_cylinder_to_bmesh(
            bm_axle,
            center=(kp_x, axle_y, axle_z),
            radius=0.055,
            height=0.180,
            segments=18,
            axis='Z'
        )
        # Steering Knuckle Spindle
        add_cylinder_to_bmesh(
            bm_axle,
            center=(kp_x + 0.060 * side, axle_y, axle_z),
            radius=0.045,
            height=0.120,
            segments=16,
            axis='X'
        )
        
        # 3. 9-Leaf Parabolic Steel Leaf Spring Pack (Length 1.600 m)
        # Spans from Y = 2.200 + 0.800 = 3.000 m (Front Bumper area) to Y = 2.200 - 0.800 = 1.400 m
        spring_w = 0.090 # 90 mm wide spring leaves
        spring_leaf_t = 0.012 # 12 mm per leaf
        total_leaves = 9
        
        # Model parabolic curvature via layered leaf segments
        for leaf_idx in range(total_leaves):
            leaf_len = 1.600 - leaf_idx * 0.120 # Shorter lower leaves
            leaf_z = (axle_z + 0.050) + leaf_idx * spring_leaf_t
            add_box_to_bmesh(
                bm_susp,
                center=(spring_seat_x * side, axle_y, leaf_z),
                dimensions=(spring_w, leaf_len, spring_leaf_t * 0.95)
            )
            
        # Front Spring Eye & Chassis Hanger Bracket (Y = 3.000 m, Z = 0.820 m)
        add_cylinder_to_bmesh(
            bm_susp,
            center=(spring_seat_x * side, 3.000, 0.820),
            radius=0.038,
            height=0.110,
            segments=16,
            axis='X'
        )
        add_box_to_bmesh(
            bm_susp,
            center=(spring_seat_x * side, 2.980, 0.880),
            dimensions=(0.100, 0.120, 0.140)
        )
        
        # Rear Swinging Shackle Link (Y = 1.400 m, Z = 0.820 m)
        add_cylinder_to_bmesh(
            bm_susp,
            center=(spring_seat_x * side, 1.400, 0.820),
            radius=0.036,
            height=0.110,
            segments=16,
            axis='X'
        )
        # Dual Shackle Plates
        for shackle_x in [-0.055, 0.055]:
            add_box_to_bmesh(
                bm_susp,
                center=(spring_seat_x * side + shackle_x, 1.400, 0.860),
                dimensions=(0.016, 0.065, 0.120)
            )
            
        # Heavy U-Bolts (Twin M24 U-bolts clamping spring to axle)
        for ubolt_y in [-0.060, 0.060]:
            add_tube_to_bmesh(
                bm_susp,
                center=(spring_seat_x * side, axle_y + ubolt_y, axle_z + 0.080),
                radius_outer=0.062,
                radius_inner=0.046,
                height=0.024,
                segments=16,
                axis='Y'
            )
            # U-Bolt Nuts beneath axle pad
            add_cylinder_to_bmesh(
                bm_susp,
                center=((spring_seat_x + 0.055) * side, axle_y + ubolt_y, axle_z - 0.070),
                radius=0.016,
                height=0.025,
                segments=8,
                axis='Z'
            )
            add_cylinder_to_bmesh(
                bm_susp,
                center=((spring_seat_x - 0.055) * side, axle_y + ubolt_y, axle_z - 0.070),
                radius=0.016,
                height=0.025,
                segments=8,
                axis='Z'
            )
            
        # Telescopic Hydraulic Shock Absorber (Angled forward 15 deg)
        shock_bot = Vector((spring_seat_x * side, axle_y - 0.080, axle_z + 0.060))
        shock_top = Vector((spring_seat_x * side, axle_y - 0.180, 0.960))
        shock_mid = (shock_bot + shock_top) * 0.5
        shock_len = (shock_top - shock_bot).length
        # Lower Outer Cylinder
        add_cylinder_to_bmesh(
            bm_susp,
            center=(shock_mid.x, shock_mid.y, shock_mid.z - 0.080),
            radius=0.032,
            height=shock_len * 0.55,
            segments=16,
            axis='Z'
        )
        # Upper Dust Tube
        add_cylinder_to_bmesh(
            bm_susp,
            center=(shock_mid.x, shock_mid.y, shock_mid.z + 0.080),
            radius=0.038,
            height=shock_len * 0.55,
            segments=16,
            axis='Z'
        )
        
    # 4. Transverse Steering Tie Rod (Behind Axle at Y = 2.080 m)
    add_cylinder_to_bmesh(
        bm_susp,
        center=(0.0, 2.080, axle_z - 0.020),
        radius=0.024,
        height=kingpin_span - 0.200,
        segments=16,
        axis='X'
    )
    # Tie Rod Ball Joint Ends
    for side in [1, -1]:
        add_cylinder_to_bmesh(
            bm_susp,
            center=((kingpin_span * 0.5 - 0.100) * side, 2.080, axle_z - 0.020),
            radius=0.038,
            height=0.060,
            segments=12,
            axis='Z'
        )
        
    # 5. 40mm Front Anti-Roll Sway Bar
    add_cylinder_to_bmesh(
        bm_susp,
        center=(0.0, 2.380, axle_z + 0.140),
        radius=0.020,
        height=frame_width_outer + 0.220,
        segments=16,
        axis='X'
    )
    # Left and Right Sway Bar Drop Links
    for side in [1, -1]:
        add_cylinder_to_bmesh(
            bm_susp,
            center=((frame_width_outer * 0.5 + 0.090) * side, 2.340, axle_z + 0.080),
            radius=0.016,
            height=0.160,
            segments=12,
            axis='Z'
        )
        
    # 6. Longitudinal Drag Link (From Steering Box at Y = 1.750 m to Left Knuckle)
    drag_start = Vector((0.420, 1.750, 0.880))
    drag_end = Vector((0.920, 2.120, axle_z + 0.060))
    drag_mid = (drag_start + drag_end) * 0.5
    drag_len = (drag_end - drag_start).length
    add_cylinder_to_bmesh(
        bm_susp,
        center=(drag_mid.x, drag_mid.y, drag_mid.z),
        radius=0.022,
        height=drag_len,
        segments=14,
        axis='Y'
    )
    
    finalize_bmesh_object(axle_obj, axle_mesh, bm_axle, 32.0)
    finalize_bmesh_object(susp_obj, susp_mesh, bm_susp, 32.0)
    print("[SCANIA 142H] Subsystem 2: AM740 front steer axle and suspension built.")

# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 3: TANDEM REAR DRIVE AXLES & BOGIE SUSPENSION
# ----------------------------------------------------------------------------
def build_tandem_rear_drive_axles_and_bogie(parent, mats):
    """
    Constructs the Scania R770/R780 heavy 6x4 tandem rear hub reduction drive axles.
    Forward Drive Axle:  Y = -0.925 m, Z = 0.525 m.
    Rearward Drive Axle: Y = -2.275 m, Z = 0.525 m.
    Bogie Center: Y = -1.600 m (1.350 m tandem spread).
    Includes cast banjo differential housings, inter-axle power divider lock,
    central bogie trunnion, walking beams, multi-leaf inverted springs, and torque V-stays.
    """
    axle_obj, axle_mesh, bm_axle = create_bmesh_object("TandemAxles_R770", mats['chassis_grey'], parent)
    diff_obj, diff_mesh, bm_diff = create_bmesh_object("TandemAxles_Differentials", mats['cast_iron'], parent)
    
    axle_z = 0.525
    y_axle1 = -0.925 # Forward drive axle
    y_axle2 = -2.275 # Rearward drive axle
    bogie_y_mid = -1.600
    axle_tube_span = 1.950 # Hub flange to hub flange
    
    for ax_idx, ax_y in enumerate([y_axle1, y_axle2]):
        is_forward = (ax_idx == 0)
        
        # 1. Cast Steel Axle Banjo Housing (Central Pumpkin)
        # Differential Bowl
        add_cylinder_to_bmesh(
            bm_diff,
            center=(0.0, ax_y, axle_z),
            radius=0.195,
            height=0.220,
            segments=24,
            axis='Y'
        )
        # Spherical Bowl Rear Bulge
        add_cone_to_bmesh(
            bm_diff,
            center=(0.0, ax_y - 0.110, axle_z),
            radius_base=0.190,
            radius_top=0.080,
            height=0.100,
            segments=20,
            axis='Y'
        )
        # Differential Ribbed Reinforcement Webs
        for rib_angle in [0, 45, 90, 135, 180, 225, 270, 315]:
            rad = math.radians(rib_angle)
            rx = math.cos(rad) * 0.160
            rz = math.sin(rad) * 0.160
            add_box_to_bmesh(
                bm_diff,
                center=(rx, ax_y, axle_z + rz),
                dimensions=(0.014, 0.200, 0.035)
            )
            
        # 2. Inter-Axle Power Divider Casing (Forward Axle Only)
        if is_forward:
            # Front extension housing for differential lock & through-drive shaft
            add_box_to_bmesh(
                bm_diff,
                center=(0.0, ax_y + 0.160, axle_z + 0.040),
                dimensions=(0.180, 0.180, 0.190)
            )
            # Power Divider Pneumatic Shift Cylinder
            add_cylinder_to_bmesh(
                bm_diff,
                center=(0.080, ax_y + 0.180, axle_z + 0.120),
                radius=0.035,
                height=0.100,
                segments=14,
                axis='Y'
            )
            # Front Input Yoke
            add_cylinder_to_bmesh(
                bm_diff,
                center=(0.0, ax_y + 0.260, axle_z + 0.040),
                radius=0.055,
                height=0.060,
                segments=16,
                axis='Y'
            )
            # Rear Through-Drive Output Yoke (Connects to inter-axle jackshaft)
            add_cylinder_to_bmesh(
                bm_diff,
                center=(0.0, ax_y - 0.180, axle_z + 0.040),
                radius=0.050,
                height=0.055,
                segments=16,
                axis='Y'
            )
        else:
            # Rearward Axle Input Yoke (Facing forward)
            add_cylinder_to_bmesh(
                bm_diff,
                center=(0.0, ax_y + 0.140, axle_z),
                radius=0.055,
                height=0.060,
                segments=16,
                axis='Y'
            )
            
        # 3. Heavy Tubular Axle Beam Tubes (Left and Right)
        for side in [1, -1]:
            tube_len = (axle_tube_span * 0.5) - 0.180
            tube_x_mid = (0.180 + axle_tube_span * 0.5) * 0.5 * side
            add_tube_to_bmesh(
                bm_axle,
                center=(tube_x_mid, ax_y, axle_z),
                radius_outer=0.075,
                radius_inner=0.055,
                height=tube_len,
                segments=20,
                axis='X'
            )
            # Suspension Spring Saddle Seat Casting
            saddle_x = 0.520 * side
            add_box_to_bmesh(
                bm_diff,
                center=(saddle_x, ax_y, axle_z + 0.060),
                dimensions=(0.140, 0.160, 0.080)
            )
            # Brake Spider Mounting Flange
            add_cylinder_to_bmesh(
                bm_axle,
                center=((axle_tube_span * 0.5 - 0.060) * side, ax_y, axle_z),
                radius=0.140,
                height=0.025,
                segments=18,
                axis='X'
            )
            
        # 4. Upper V-Stay Reaction Rod (Torsion / Brake Torque Absorber)
        # Connects differential top boss to frame crossmember
        v_apex = Vector((0.0, ax_y + (0.120 if is_forward else -0.120), axle_z + 0.220))
        for side in [1, -1]:
            v_base = Vector((0.360 * side, ax_y + (0.500 if is_forward else -0.500), 1.000))
            v_mid = (v_apex + v_base) * 0.5
            v_len = (v_base - v_apex).length
            add_cylinder_to_bmesh(
                bm_diff,
                center=(v_mid.x, v_mid.y, v_mid.z),
                radius=0.024,
                height=v_len,
                segments=12,
                axis='Y'
            )
            
    # 5. Inter-Axle Cardan Jackshaft (Linking Forward and Rearward Differential)
    jack_len = (y_axle1 - 0.180) - (y_axle2 + 0.140) # ~1.000 m
    jack_y_mid = ((y_axle1 - 0.180) + (y_axle2 + 0.140)) * 0.5
    add_cylinder_to_bmesh(
        bm_axle,
        center=(0.0, jack_y_mid, axle_z + 0.020),
        radius=0.040,
        height=jack_len,
        segments=16,
        axis='Y'
    )
    # Universal Joints on Jackshaft
    for uj_y in [y_axle1 - 0.200, y_axle2 + 0.160]:
        add_box_to_bmesh(
            bm_diff,
            center=(0.0, uj_y, axle_z + 0.020),
            dimensions=(0.100, 0.080, 0.100)
        )
        
    # 6. Scania Heavy Bogie Walking-Beam Suspension (Central Trunnion Y = -1.600 m)
    # Central Trunnion Cross-Shaft
    add_cylinder_to_bmesh(
        bm_diff,
        center=(0.0, bogie_y_mid, axle_z + 0.160),
        radius=0.065,
        height=1.240,
        segments=20,
        axis='X'
    )
    
    for side in [1, -1]:
        bogie_x = 0.520 * side
        # Massive Central Trunnion Bearing Housing
        add_cylinder_to_bmesh(
            bm_diff,
            center=(bogie_x, bogie_y_mid, axle_z + 0.160),
            radius=0.120,
            height=0.110,
            segments=20,
            axis='X'
        )
        
        # Heavy Inverted Semi-Elliptic Multi-Leaf Spring Pack (Length 1.350 m)
        # Resting inverted with center on trunnion and ends on axle pads
        spring_w = 0.090
        total_bogie_leaves = 10
        leaf_thick = 0.014
        
        for leaf_idx in range(total_bogie_leaves):
            l_len = 1.350 - leaf_idx * 0.090
            l_z = (axle_z + 0.280) - leaf_idx * leaf_thick
            add_box_to_bmesh(
                bm_diff,
                center=(bogie_x, bogie_y_mid, l_z),
                dimensions=(spring_w, l_len, leaf_thick * 0.95)
            )
            
        # Heavy Cast Inverted Spring Saddle Clamp (Twin M27 U-Bolts)
        add_box_to_bmesh(
            bm_diff,
            center=(bogie_x, bogie_y_mid, axle_z + 0.300),
            dimensions=(0.140, 0.240, 0.050)
        )
        for ub_y in [-0.070, 0.070]:
            add_tube_to_bmesh(
                bm_diff,
                center=(bogie_x, bogie_y_mid + ub_y, axle_z + 0.220),
                radius_outer=0.080,
                radius_inner=0.060,
                height=0.028,
                segments=16,
                axis='Y'
            )
            
        # Lower Longitudinal Radius Rods (Connecting axle tubes to central chassis pivot)
        for ax_y in [y_axle1, y_axle2]:
            rod_mid_y = (bogie_y_mid + ax_y) * 0.5
            rod_len = abs(ax_y - bogie_y_mid)
            add_cylinder_to_bmesh(
                bm_diff,
                center=(bogie_x - 0.080 * side, rod_mid_y, axle_z - 0.060),
                radius=0.026,
                height=rod_len,
                segments=14,
                axis='Y'
            )
            # Rubber Bushing Pivot Eyes
            add_cylinder_to_bmesh(
                bm_diff,
                center=(bogie_x - 0.080 * side, ax_y, axle_z - 0.060),
                radius=0.045,
                height=0.070,
                segments=14,
                axis='X'
            )
            
    finalize_bmesh_object(axle_obj, axle_mesh, bm_axle, 32.0)
    finalize_bmesh_object(diff_obj, diff_mesh, bm_diff, 32.0)
    print("[SCANIA 142H] Subsystem 3: Tandem rear hub reduction drive axles and bogie built.")

# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 4: 10-WHEEL FLEET & PLANETARY HUB REDUCTION
# ----------------------------------------------------------------------------
def build_ten_wheel_fleet_and_hub_reduction(parent, mats):
    """
    Constructs the complete 10-wheel commercial fleet:
    - 2 Front Steer Wheels (Single 22.5" x 9.00" steel disc wheels with conical hub caps)
    - 8 Rear Drive Wheels (4 Dual assemblies on tandem axles with planetary hub reduction)
    - 315/80R22.5 heavy commercial radial tires with authentic tread siping
    - Heavy ribbed cast iron brake drums (410 mm diameter).
    """
    tires_obj, tires_mesh, bm_tires = create_bmesh_object("Fleet_Tires", mats['tire_rubber'], parent)
    rims_obj, rims_mesh, bm_rims = create_bmesh_object("Fleet_SteelRims", mats['steel_wheel'], parent)
    hubs_obj, hubs_mesh, bm_hubs = create_bmesh_object("Fleet_HubReduction", mats['chassis_grey'], parent)
    chrome_obj, chrome_mesh, bm_chrome = create_bmesh_object("Fleet_ChromeCaps", mats['chrome'], parent)
    drums_obj, drums_mesh, bm_drums = create_bmesh_object("Fleet_BrakeDrums", mats['cast_iron'], parent)
    
    # Standard Tire & Rim Dimensions
    tire_r_outer = 0.5375 # 1,075 mm outer tire diameter (315/80R22.5)
    tire_r_rim = 0.2857   # 22.5" rim bead diameter (571.5 mm / 2)
    tire_w = 0.315        # 315 mm section width
    rim_w = 0.250         # 9.00" rim width
    
    def build_commercial_tire(bm, center_pt, width, is_dual_drive=False):
        """Generates a high-fidelity commercial truck tire with curved sidewall and tread ribs."""
        cx, cy, cz = center_pt
        segments = 32
        
        # Radial cross-section profile rings
        r_inner = tire_r_rim
        r_shoulder = tire_r_outer - 0.040
        r_crown = tire_r_outer
        
        half_w = width * 0.5
        w_bead = width * 0.38
        w_shoulder = width * 0.46
        
        profile_rings = [
            (r_inner, -w_bead),
            (r_inner + 0.035, -w_shoulder),
            (r_shoulder, -half_w),
            (r_crown, -half_w * 0.85),
            (r_crown,  half_w * 0.85),
            (r_shoulder,  half_w),
            (r_inner + 0.035,  w_shoulder),
            (r_inner,  w_bead)
        ]
        
        ring_verts = []
        for r_val, w_off in profile_rings:
            v_ring = []
            for i in range(segments):
                ang = 2.0 * math.pi * (i / segments)
                cos_a = math.cos(ang) * r_val
                sin_a = math.sin(ang) * r_val
                v_ring.append(bm.verts.new(Vector((cx + w_off, cy + cos_a, cz + sin_a))))
            ring_verts.append(v_ring)
            
        for ring_idx in range(len(profile_rings) - 1):
            curr_r = ring_verts[ring_idx]
            next_r = ring_verts[ring_idx + 1]
            for i in range(segments):
                ni = (i + 1) % segments
                bm.faces.new([curr_r[i], curr_r[ni], next_r[ni], next_r[i]])
                
        # Authentic Tread Grooves / Sipes
        if not is_dual_drive:
            # 4 Longitudinal Highway Rib Grooves
            for g_off in [-0.080, -0.025, 0.025, 0.080]:
                add_tube_to_bmesh(
                    bm,
                    center=(cx + g_off, cy, cz),
                    radius_outer=tire_r_outer + 0.002,
                    radius_inner=tire_r_outer - 0.012,
                    height=0.014,
                    segments=segments,
                    axis='X'
                )
        else:
            # Cross-Lug Traction Siping on Drive Axles
            for i in range(24):
                lug_ang = 2.0 * math.pi * (i / 24)
                lx = math.cos(lug_ang) * (tire_r_outer - 0.006)
                lz = math.sin(lug_ang) * (tire_r_outer - 0.006)
                add_box_to_bmesh(
                    bm,
                    center=(cx, cy + lx, cz + lz),
                    dimensions=(width * 0.82, 0.022, 0.014),
                    rot_euler=(lug_ang, 0.0, 0.0)
                )
                
    def build_steel_disc_rim(bm_rim, bm_hub, bm_chr, bm_drm, center_pt, side_sign, is_drive=False, is_outer_dual=False):
        """Constructs the European 22.5" 10-hole steel disc rim, bolts, drum, and hub."""
        cx, cy, cz = center_pt
        
        # 1. Outer Rim Barrel & Flanges
        add_tube_to_bmesh(
            bm_rim,
            center=(cx, cy, cz),
            radius_outer=tire_r_rim + 0.015,
            radius_inner=tire_r_rim - 0.010,
            height=rim_w,
            segments=28,
            axis='X'
        )
        # Outer Rim Safety Bead Lip
        lip_x = cx + (rim_w * 0.5) * side_sign
        add_cylinder_to_bmesh(
            bm_rim,
            center=(lip_x, cy, cz),
            radius=tire_r_rim + 0.022,
            height=0.016,
            segments=28,
            axis='X'
        )
        
        # 2. Pressed Steel Wheel Center Disc with Offset
        disc_offset = 0.055 if not is_drive else (-0.065 if is_outer_dual else 0.065)
        disc_x = cx + disc_offset * side_sign
        
        add_tube_to_bmesh(
            bm_rim,
            center=(disc_x, cy, cz),
            radius_outer=tire_r_rim - 0.005,
            radius_inner=0.145, # European 281 mm center bore
            height=0.014,
            segments=28,
            axis='X'
        )
        
        # 3. 10 Oval Ventilation Hand Holes in Disc Face
        for i in range(10):
            hole_ang = 2.0 * math.pi * (i / 10)
            hx = math.cos(hole_ang) * 0.215
            hz = math.sin(hole_ang) * 0.215
            add_cylinder_to_bmesh(
                bm_rim,
                center=(disc_x, cy + hx, cz + hz),
                radius=0.028,
                height=0.018,
                segments=12,
                axis='X'
            )
            
        # 4. 10 M22 Wheel Studs & Conical Wheel Nuts (PCD 335 mm)
        bolt_pcd_r = 0.1675 # 335 mm pitch circle diameter
        for i in range(10):
            b_ang = 2.0 * math.pi * (i / 10) + math.pi * 0.1
            bx = math.cos(b_ang) * bolt_pcd_r
            bz = math.sin(b_ang) * bolt_pcd_r
            # Nut Boss
            add_cylinder_to_bmesh(
                bm_rim,
                center=(disc_x + 0.010 * side_sign, cy + bx, cz + bz),
                radius=0.016,
                height=0.022,
                segments=8,
                axis='X'
            )
            # Threaded Stud Tip
            add_cylinder_to_bmesh(
                bm_chr,
                center=(disc_x + 0.022 * side_sign, cy + bx, cz + bz),
                radius=0.011,
                height=0.015,
                segments=8,
                axis='X'
            )
            
        # 5. Heavy Cast Iron Brake Drum (Behind wheel disc)
        drum_x = cx - 0.080 * side_sign
        add_cylinder_to_bmesh(
            bm_drm,
            center=(drum_x, cy, cz),
            radius=0.205, # 410 mm diameter brake drum
            height=0.160,
            segments=24,
            axis='X'
        )
        # Drum Cooling Ribs
        for r_off in [-0.050, 0.0, 0.050]:
            add_tube_to_bmesh(
                bm_drm,
                center=(drum_x + r_off, cy, cz),
                radius_outer=0.215,
                radius_inner=0.205,
                height=0.018,
                segments=24,
                axis='X'
            )
            
        # 6. Hub Caps & Planetary Hub Reduction
        if not is_drive:
            # Front Steer Axle: Conical Center Hub Cap with Scania Crest
            hub_cap_x = disc_x + 0.040 * side_sign
            add_cone_to_bmesh(
                bm_chr,
                center=(hub_cap_x, cy, cz),
                radius_base=0.090,
                radius_top=0.065,
                height=0.060,
                segments=18,
                axis='X'
            )
            add_cylinder_to_bmesh(
                bm_chr,
                center=(hub_cap_x + 0.035 * side_sign, cy, cz),
                radius=0.065,
                height=0.015,
                segments=18,
                axis='X'
            )
        elif is_outer_dual:
            # Rear Tandem Axles: Legendary SCANIA Planetary Hub Reduction Casing!
            # Heavy cylindrical outer planetary reduction gearbox
            hub_red_x = disc_x + 0.055 * side_sign
            add_cylinder_to_bmesh(
                bm_hub,
                center=(hub_red_x, cy, cz),
                radius=0.130,
                height=0.085,
                segments=24,
                axis='X'
            )
            # 8 Heavy Planetary Cover Retaining Perimeter Bolts
            for i in range(8):
                h_ang = 2.0 * math.pi * (i / 8)
                h_y = math.cos(h_ang) * 0.105
                h_z = math.sin(h_ang) * 0.105
                add_cylinder_to_bmesh(
                    bm_rim,
                    center=(hub_red_x + 0.045 * side_sign, cy + h_y, cz + h_z),
                    radius=0.012,
                    height=0.016,
                    segments=8,
                    axis='X'
                )
            # Center Oil Level / Drain Plug
            add_cylinder_to_bmesh(
                bm_chr,
                center=(hub_red_x + 0.046 * side_sign, cy, cz),
                radius=0.024,
                height=0.015,
                segments=12,
                axis='X'
            )
            # Central Embossed Scania Crown Ring
            add_tube_to_bmesh(
                bm_hub,
                center=(hub_red_x + 0.045 * side_sign, cy, cz),
                radius_outer=0.055,
                radius_inner=0.040,
                height=0.010,
                segments=18,
                axis='X'
            )
            
    # Assembly 1: Front Steer Axle (2 Wheels Total)
    y_steer = 2.200
    z_steer = 0.525
    x_steer_track = 1.040 # 2.080 m track width
    for side in [1, -1]:
        pt = (x_steer_track * side, y_steer, z_steer)
        build_commercial_tire(bm_tires, pt, tire_w, is_dual_drive=False)
        build_steel_disc_rim(bm_rims, bm_hubs, bm_chrome, bm_drums, pt, side, is_drive=False)
        
    # Assembly 2: Forward Tandem Drive Axle (4 Wheels Dual Assembly)
    y_drive1 = -0.925
    z_drive = 0.525
    x_inner_drive = 0.900
    x_outer_drive = 1.230
    for side in [1, -1]:
        # Inner Wheel
        pt_in = (x_inner_drive * side, y_drive1, z_drive)
        build_commercial_tire(bm_tires, pt_in, tire_w, is_dual_drive=True)
        build_steel_disc_rim(bm_rims, bm_hubs, bm_chrome, bm_drums, pt_in, side, is_drive=True, is_outer_dual=False)
        # Outer Wheel
        pt_out = (x_outer_drive * side, y_drive1, z_drive)
        build_commercial_tire(bm_tires, pt_out, tire_w, is_dual_drive=True)
        build_steel_disc_rim(bm_rims, bm_hubs, bm_chrome, bm_drums, pt_out, side, is_drive=True, is_outer_dual=True)
        
    # Assembly 3: Rearward Tandem Drive Axle (4 Wheels Dual Assembly)
    y_drive2 = -2.275
    for side in [1, -1]:
        # Inner Wheel
        pt_in = (x_inner_drive * side, y_drive2, z_drive)
        build_commercial_tire(bm_tires, pt_in, tire_w, is_dual_drive=True)
        build_steel_disc_rim(bm_rims, bm_hubs, bm_chrome, bm_drums, pt_in, side, is_drive=True, is_outer_dual=False)
        # Outer Wheel
        pt_out = (x_outer_drive * side, y_drive2, z_drive)
        build_commercial_tire(bm_tires, pt_out, tire_w, is_dual_drive=True)
        build_steel_disc_rim(bm_rims, bm_hubs, bm_chrome, bm_drums, pt_out, side, is_drive=True, is_outer_dual=True)
        
    finalize_bmesh_object(tires_obj, tires_mesh, bm_tires, 40.0)
    finalize_bmesh_object(rims_obj, rims_mesh, bm_rims, 32.0)
    finalize_bmesh_object(hubs_obj, hubs_mesh, bm_hubs, 32.0)
    finalize_bmesh_object(chrome_obj, chrome_mesh, bm_chrome, 32.0)
    finalize_bmesh_object(drums_obj, drums_mesh, bm_drums, 32.0)
    print("[SCANIA 142H] Subsystem 4: 10-wheel fleet with planetary hub reduction built.")

# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 5: JOST FIFTH-WHEEL COUPLING & SLIDER
# ----------------------------------------------------------------------------
def build_jost_fifth_wheel_coupling(parent, mats):
    """
    Constructs the Jost JSK 37 C heavy-duty cast steel fifth-wheel coupling.
    Mounted at Y = -1.450 m, Z = 1.250 m (centered slightly forward of tandem bogie center).
    Includes machined top plate, kingpin throat, release arm, trunnion pivots,
    and longitudinal toothed slider angle rails.
    """
    fw_obj, fw_mesh, bm_fw = create_bmesh_object("FifthWheel_JostJSK37", mats['cast_iron'], parent)
    sl_obj, sl_mesh, bm_sl = create_bmesh_object("FifthWheel_Slider", mats['chassis_grey'], parent)
    
    fw_y = -1.450
    fw_z = 1.250
    fw_plate_w = 0.980 # 980 mm wide cast steel plate
    fw_plate_len = 0.920 # 920 mm length
    
    # 1. Jost Main Fifth Wheel Cast Steel Top Plate
    # Forward Horseshoe Section
    add_box_to_bmesh(
        bm_fw,
        center=(0.0, fw_y + 0.160, fw_z),
        dimensions=(fw_plate_w, 0.550, 0.055)
    )
    # Rearward Guide Ramps (Left and Right Flukes flanking entry throat)
    for side in [1, -1]:
        fluke_x = 0.280 * side
        add_box_to_bmesh(
            bm_fw,
            center=(fluke_x, fw_y - 0.220, fw_z - 0.015),
            dimensions=(0.380, 0.420, 0.050)
        )
        # Chamfered Rear Guide Slope (Guides trailer kingpin upward during coupling)
        add_box_to_bmesh(
            bm_fw,
            center=(fluke_x, fw_y - 0.420, fw_z - 0.060),
            dimensions=(0.360, 0.160, 0.045),
            rot_euler=(math.radians(20.0), 0.0, 0.0)
        )
        
    # 2. Kingpin Throat & Locking Jaw Mechanism
    add_cylinder_to_bmesh(
        bm_fw,
        center=(0.0, fw_y + 0.020, fw_z),
        radius=0.038, # 50 mm (2") kingpin socket
        height=0.065,
        segments=16,
        axis='Z'
    )
    # Throat Entry Slot
    add_box_to_bmesh(
        bm_fw,
        center=(0.0, fw_y - 0.140, fw_z),
        dimensions=(0.076, 0.280, 0.060)
    )
    # Heavy Cast Locking Wedge / Jaw
    add_box_to_bmesh(
        bm_fw,
        center=(-0.045, fw_y + 0.020, fw_z - 0.015),
        dimensions=(0.060, 0.080, 0.045)
    )
    
    # 3. Machined Grease Distribution Grooves on Top Plate Face
    for r_groove in [0.220, 0.340]:
        add_tube_to_bmesh(
            bm_fw,
            center=(0.0, fw_y + 0.080, fw_z + 0.028),
            radius_outer=r_groove + 0.008,
            radius_inner=r_groove - 0.008,
            height=0.004,
            segments=24,
            axis='Z'
        )
        
    # 4. Long Steel Release Arm with T-Handle (Extends to Left Driver Side)
    arm_x_end = 0.650
    arm_mid_x = (0.0 + arm_x_end) * 0.5
    add_cylinder_to_bmesh(
        bm_fw,
        center=(arm_mid_x, fw_y - 0.040, fw_z - 0.040),
        radius=0.012,
        height=arm_x_end,
        segments=12,
        axis='X'
    )
    # Release T-Handle
    add_cylinder_to_bmesh(
        bm_fw,
        center=(arm_x_end, fw_y - 0.040, fw_z - 0.040),
        radius=0.014,
        height=0.140,
        segments=12,
        axis='Y'
    )
    # Safety Latch Cam
    add_box_to_bmesh(
        bm_fw,
        center=(arm_x_end - 0.060, fw_y - 0.040, fw_z - 0.035),
        dimensions=(0.035, 0.045, 0.035)
    )
    
    # 5. Heavy Trunnion Pivot Brackets & Rubber Cushioning Bushings
    for side in [1, -1]:
        trun_x = 0.380 * side
        add_box_to_bmesh(
            bm_fw,
            center=(trun_x, fw_y, fw_z - 0.090),
            dimensions=(0.140, 0.220, 0.120)
        )
        # Heavy Transverse Trunnion Pin
        add_cylinder_to_bmesh(
            bm_fw,
            center=(trun_x, fw_y, fw_z - 0.080),
            radius=0.035,
            height=0.160,
            segments=16,
            axis='X'
        )
        
    # 6. Longitudinal Sliding Base Assembly & Toothed Angle Rails
    slider_len = 1.200 # 1,200 mm sliding adjustment range
    slider_y_mid = fw_y
    for side in [1, -1]:
        rail_x = 0.420 * side
        # Toothed Slider Angle Iron Base
        add_box_to_bmesh(
            bm_sl,
            center=(rail_x, slider_y_mid, 1.080),
            dimensions=(0.080, slider_len, 0.060)
        )
        # Machined Locking Teeth along rail edge
        for t_idx in range(16):
            t_y = (slider_y_mid - slider_len * 0.45) + t_idx * 0.060
            add_box_to_bmesh(
                bm_sl,
                center=(rail_x + 0.030 * side, t_y, 1.115),
                dimensions=(0.025, 0.035, 0.025)
            )
            
    # Pneumatic Slider Lock Air Cylinder
    add_cylinder_to_bmesh(
        bm_sl,
        center=(0.0, fw_y + 0.280, 1.090),
        radius=0.035,
        height=0.160,
        segments=14,
        axis='Y'
    )
    
    finalize_bmesh_object(fw_obj, fw_mesh, bm_fw, 32.0)
    finalize_bmesh_object(sl_obj, sl_mesh, bm_sl, 32.0)
    print("[SCANIA 142H] Subsystem 5: Jost JSK 37 C fifth-wheel coupling built.")



# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 6: CR19 SLEEPER CAB SHELL & ROOF STIFFENERS
# ----------------------------------------------------------------------------
def build_cr19_sleeper_cab_shell(parent, mats):
    """
    Constructs the iconic Scania CR19 forward-control sleeper cab shell.
    Mounted over the front steer axle (Y = +2.200 m).
    Front face: Y = +2.480 to +2.550 m, Rear cab wall: Y = +0.550 m (1.950 m length).
    Width: 2.420 m (over fenders: 2.500 m).
    Includes curved front corners, sloped front cowl, roof stiffener swages,
    pop-up ventilation roof hatch, wheel arch flares, and rear cab air suspension.
    """
    cab_obj, cab_mesh, bm_cab = create_bmesh_object("Cab_CR19BodyShell", mats['cab_paint'], parent)
    trim_obj, trim_mesh, bm_trim = create_bmesh_object("Cab_BodyTrim", mats['trim_black'], parent)
    susp_obj, susp_mesh, bm_susp = create_bmesh_object("Cab_AirSuspension", mats['chassis_grey'], parent)
    
    cab_len = 1.950
    cab_w = 2.420
    half_cw = cab_w * 0.5 # 1.210 m
    
    y_front_base = 2.520
    y_front_top = 2.420  # 4-degree backward aerodynamic rake
    y_rear = 0.550
    
    z_floor = 1.480
    z_belt = 1.980
    z_cowl = 2.440
    z_roof = 3.420
    
    # 1. Main Cab Lower Enclosure (From Floor Sill to Cowl)
    # Floor Sill Base Structure
    add_box_to_bmesh(
        bm_cab,
        center=(0.0, (y_front_base + y_rear) * 0.5, z_floor + 0.050),
        dimensions=(cab_w, y_front_base - y_rear, 0.100)
    )
    
    # Lower Cab Side Walls (Between front wheel arch and rear wall)
    for side in [1, -1]:
        wall_x = (half_cw - 0.025) * side
        add_box_to_bmesh(
            bm_cab,
            center=(wall_x, (y_front_base + y_rear) * 0.5, (z_floor + z_cowl) * 0.5),
            dimensions=(0.050, y_front_base - y_rear, z_cowl - z_floor)
        )
        
        # Wheel Arch Cutouts & Class-A CAD Continuous Semi-Circular Fender Flare
        # Front wheel centered at Y = 2.200 m, Z = 0.525 m (Tire radius = 0.538 m)
        flare_x = (half_cw + 0.020) * side
        add_arch_to_bmesh(
            bm_trim,
            center=(flare_x, 2.200, 0.525),
            radius_outer=0.640,
            radius_inner=0.585,
            width=0.075,
            ang_start=0.0,
            ang_end=math.pi,
            segments=24,
            axis='X'
        )
        # Inner Fender Splash Apron (Seals inside of wheel arch)
        add_box_to_bmesh(
            bm_trim,
            center=((half_cw - 0.120) * side, 2.200, 1.150),
            dimensions=(0.200, 1.280, 0.450)
        )
        
    # Front Lower Face & Radiator Apron (Extends all the way down to bumper top Z = 0.980 m)
    z_bumper_top = 0.980
    add_box_to_bmesh(
        bm_cab,
        center=(0.0, y_front_base - 0.040, (z_bumper_top + z_cowl) * 0.5),
        dimensions=(cab_w - 0.120, 0.080, z_cowl - z_bumper_top)
    )
    
    # Internal Dark Acoustic Cockpit Floor & Firewall (Eliminates interior see-through artifacts)
    add_box_to_bmesh(
        bm_trim,
        center=(0.0, (y_front_base + y_rear) * 0.5, z_floor + 0.020),
        dimensions=(cab_w - 0.100, y_front_base - y_rear - 0.050, 0.040)
    )
    # Dark Cockpit Dashboard Cowl Shelf
    add_box_to_bmesh(
        bm_trim,
        center=(0.0, y_front_base - 0.220, z_cowl - 0.060),
        dimensions=(cab_w - 0.200, 0.380, 0.120)
    )
    
    # Rounded Front Corner Pillars (Extends from bumper Z = 0.980 m to roof Z = 3.420 m)
    for side in [1, -1]:
        crn_x = (half_cw - 0.090) * side
        add_cylinder_to_bmesh(
            bm_cab,
            center=(crn_x, y_front_base - 0.090, (z_bumper_top + z_roof) * 0.5),
            radius=0.095,
            height=z_roof - z_bumper_top,
            segments=20,
            axis='Z'
        )
        
    # 2. Upper Cab Greenhouse & Sleeper Section (Z = 2.440 m to 3.420 m)
    # Rear Sleeper Cab Solid Back Wall
    add_box_to_bmesh(
        bm_cab,
        center=(0.0, y_rear + 0.025, (z_floor + z_roof) * 0.5),
        dimensions=(cab_w - 0.060, 0.050, z_roof - z_floor)
    )
    # Rear Wall Exterior Stiffening Stampings (Scania Triple Vertical Swages)
    for sw_x in [-0.600, 0.0, 0.600]:
        add_box_to_bmesh(
            bm_cab,
            center=(sw_x, y_rear - 0.010, (z_floor + z_roof) * 0.5),
            dimensions=(0.140, 0.025, (z_roof - z_floor) * 0.85)
        )
        
    # Sleeper Upper Side Quarters (Solid metal panels behind door window)
    for side in [1, -1]:
        sq_x = (half_cw - 0.025) * side
        add_box_to_bmesh(
            bm_cab,
            center=(sq_x, (1.500 + y_rear) * 0.5, (z_cowl + z_roof) * 0.5),
            dimensions=(0.050, 1.500 - y_rear, z_roof - z_cowl)
        )
        
    # A-Pillars flanking Windshield
    for side in [1, -1]:
        ap_x = (half_cw - 0.060) * side
        ap_y = (y_front_base + y_front_top) * 0.5 - 0.040
        add_box_to_bmesh(
            bm_cab,
            center=(ap_x, ap_y, (z_cowl + z_roof) * 0.5),
            dimensions=(0.110, 0.120, z_roof - z_cowl)
        )
        
    # Windshield Cowl Shelf & Fresh Air Intake Recesses
    add_box_to_bmesh(
        bm_cab,
        center=(0.0, y_front_base - 0.020, z_cowl),
        dimensions=(cab_w - 0.160, 0.180, 0.080)
    )
    # Cabin Ventilation Air Grille Slats on Cowl
    for vg_x in [-0.550, -0.200, 0.200, 0.550]:
        add_box_to_bmesh(
            bm_trim,
            center=(vg_x, y_front_base - 0.010, z_cowl + 0.025),
            dimensions=(0.260, 0.040, 0.025)
        )
        
    # 3. Curved Cab Roof & Longitudinal Structural Stiffener Swages
    # Main Roof Crown Sheet
    roof_len = (y_front_top - y_rear)
    roof_y_mid = (y_front_top + y_rear) * 0.5
    add_box_to_bmesh(
        bm_cab,
        center=(0.0, roof_y_mid, z_roof + 0.020),
        dimensions=(cab_w - 0.080, roof_len, 0.050)
    )
    # Roof Crown Curvature (Gentle Swedish aerodynamic dome)
    add_cone_to_bmesh(
        bm_cab,
        center=(0.0, roof_y_mid, z_roof + 0.035),
        radius_base=1.120,
        radius_top=1.040,
        height=0.040,
        segments=24,
        axis='Z'
    )
    
    # 5 Iconic 1980s Scania Roof Ribs (Longitudinal Stiffeners)
    for rib_x in [-0.850, -0.425, 0.0, 0.425, 0.850]:
        add_cylinder_to_bmesh(
            bm_cab,
            center=(rib_x, roof_y_mid, z_roof + 0.050),
            radius=0.022,
            height=roof_len * 0.88,
            segments=12,
            axis='Y'
        )
        
    # Pop-Up Emergency Roof Hatch / Sunroof
    hatch_x = 0.0
    hatch_y = roof_y_mid + 0.250
    hatch_z = z_roof + 0.055
    # Hatch Surround Flange
    add_box_to_bmesh(
        bm_trim,
        center=(hatch_x, hatch_y, hatch_z),
        dimensions=(0.680, 0.580, 0.035)
    )
    # Tinted Hatch Glass / Composite Lid (Angled pop-up 4 degrees)
    add_box_to_bmesh(
        bm_cab,
        center=(hatch_x, hatch_y, hatch_z + 0.015),
        dimensions=(0.620, 0.520, 0.025),
        rot_euler=(math.radians(-4.0), 0.0, 0.0)
    )
    
    # 4. Rear Cab Air Suspension System (Connecting Cab Back to Chassis)
    # Upper Cab Rear Transverse Suspension Cross-Beam
    add_box_to_bmesh(
        bm_susp,
        center=(0.0, y_rear - 0.040, z_floor + 0.080),
        dimensions=(cab_w - 0.400, 0.080, 0.080)
    )
    # Dual Firestone Air Spring Bellows on Chassis Crossmember
    for side in [1, -1]:
        air_x = 0.650 * side
        # Air Spring Rubber Bellows
        add_cylinder_to_bmesh(
            bm_trim,
            center=(air_x, y_rear - 0.080, 1.220),
            radius=0.075,
            height=0.180,
            segments=18,
            axis='Z'
        )
        # Steel Top & Bottom Mounting Plates
        add_cylinder_to_bmesh(
            bm_susp,
            center=(air_x, y_rear - 0.080, 1.320),
            radius=0.085,
            height=0.020,
            segments=16,
            axis='Z'
        )
        add_cylinder_to_bmesh(
            bm_susp,
            center=(air_x, y_rear - 0.080, 1.120),
            radius=0.085,
            height=0.020,
            segments=16,
            axis='Z'
        )
        # Telescopic Hydraulic Cab Damper (Shock Absorber)
        add_cylinder_to_bmesh(
            bm_susp,
            center=((0.650 - 0.120) * side, y_rear - 0.080, 1.220),
            radius=0.028,
            height=0.220,
            segments=14,
            axis='Z'
        )
        
    # Transverse Panhard Rod (Controls cab lateral sway)
    add_cylinder_to_bmesh(
        bm_susp,
        center=(0.0, y_rear - 0.120, 1.160),
        radius=0.022,
        height=0.900,
        segments=14,
        axis='X'
    )
    
    finalize_bmesh_object(cab_obj, cab_mesh, bm_cab, 32.0)
    finalize_bmesh_object(trim_obj, trim_mesh, bm_trim, 32.0)
    finalize_bmesh_object(susp_obj, susp_mesh, bm_susp, 32.0)
    print("[SCANIA 142H] Subsystem 6: CR19 sleeper cab shell and air suspension built.")

# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 7: DUAL-TIER FRONT GRILLE & AUTHENTIC BADGES
# ----------------------------------------------------------------------------
def build_dual_tier_front_grille_and_badges(parent, mats):
    """
    Constructs the signature Scania 2-Series dual-tier front grille:
    - Upper Service Grille: Hinged white 5-slat panel with chrome SCANIA block letters.
    - Lower Radiator Grille: Charcoal slat cooling section with 142H and red/chrome V8 badge.
    - Windscreen cleaning fold-out footstep bars and cab grab handles.
    """
    slat_obj, slat_mesh, bm_slat = create_bmesh_object("Grille_WhiteSlats", mats['white_paint'], parent)
    mesh_obj, mesh_mesh, bm_mesh = create_bmesh_object("Grille_DarkMesh", mats['trim_black'], parent)
    chrome_obj, chrome_mesh, bm_chrome = create_bmesh_object("Grille_ChromeBadges", mats['chrome'], parent)
    v8_obj, v8_mesh, bm_v8 = create_bmesh_object("Grille_V8Badge", mats['badge_v8'], parent)
    
    grille_y = 2.535
    
    # =========================================================================
    # 1. UPPER SERVICE GRILLE (Hinged 5-Slat White Inspection Panel)
    # Z = 1.720 m to 2.420 m, Width = 1.840 m (H = 0.700 m)
    # =========================================================================
    upper_w = 1.840
    upper_z_bot = 1.720
    upper_z_top = 2.420
    upper_h = upper_z_top - upper_z_bot # 0.700 m
    upper_z_mid = (upper_z_bot + upper_z_top) * 0.5 # 2.070 m
    
    # Dark Honeycomb Recessed Backing Mesh
    add_box_to_bmesh(
        bm_mesh,
        center=(0.0, grille_y - 0.020, upper_z_mid),
        dimensions=(upper_w - 0.020, 0.020, upper_h)
    )
    # Outer Grille White Frame Surround
    add_box_to_bmesh(
        bm_slat,
        center=(0.0, grille_y, upper_z_top),
        dimensions=(upper_w, 0.035, 0.025)
    )
    add_box_to_bmesh(
        bm_slat,
        center=(0.0, grille_y, upper_z_bot),
        dimensions=(upper_w, 0.035, 0.025)
    )
    for side in [1, -1]:
        add_box_to_bmesh(
            bm_slat,
            center=((upper_w * 0.5 - 0.015) * side, grille_y, upper_z_mid),
            dimensions=(0.030, 0.035, upper_h)
        )
        # Hinged Service Panel Quick-Release Rotary Locks
        add_cylinder_to_bmesh(
            bm_mesh,
            center=((upper_w * 0.5 - 0.060) * side, grille_y + 0.010, upper_z_mid),
            radius=0.018,
            height=0.015,
            segments=12,
            axis='Y'
        )
        
    # 5 Crisp Horizontal White Louvers/Slats (Signature Scania 2-Series Feature)
    num_upper_slats = 5
    slat_spacing = upper_h / (num_upper_slats + 1)
    for s_idx in range(num_upper_slats):
        sz = upper_z_bot + (s_idx + 1) * slat_spacing
        add_box_to_bmesh(
            bm_slat,
            center=(0.0, grille_y + 0.005, sz),
            dimensions=(upper_w - 0.060, 0.040, 0.032),
            rot_euler=(math.radians(12.0), 0.0, 0.0)
        )
        
    # Embossed 3D Mirror Chrome 'SCANIA' Block Letters
    # Centered horizontally across the middle slat (Z = upper_z_mid = 2.070 m)
    scania_letter_w = 0.130
    scania_letter_h = 0.095
    scania_letter_t = 0.018
    scania_spacing = 0.175
    
    letters_x = [-2.5 * scania_spacing, -1.5 * scania_spacing, -0.5 * scania_spacing,
                  0.5 * scania_spacing,  1.5 * scania_spacing,  2.5 * scania_spacing]
                  
    for lx in letters_x:
        add_box_to_bmesh(
            bm_chrome,
            center=(lx, grille_y + 0.024, upper_z_mid),
            dimensions=(scania_letter_w, scania_letter_t, scania_letter_h)
        )
        add_chamfered_box_to_bmesh(
            bm_chrome,
            center=(lx, grille_y + 0.030, upper_z_mid),
            dimensions=(scania_letter_w * 0.90, scania_letter_t * 0.5, scania_letter_h * 0.90),
            chamfer=0.008
        )
        
    # =========================================================================
    # 2. LOWER RADIATOR GRILLE (Cooling Section meeting bumper at Z = 1.000 m)
    # Z = 1.000 m to 1.680 m, Width = 1.780 m (H = 0.680 m)
    # =========================================================================
    lower_w = 1.780
    lower_z_bot = 1.000
    lower_z_top = 1.680
    lower_h = lower_z_top - lower_z_bot # 0.680 m
    lower_z_mid = (lower_z_bot + lower_z_top) * 0.5 # 1.340 m
    
    # Recessed Dark Radiator Core
    add_box_to_bmesh(
        bm_mesh,
        center=(0.0, grille_y - 0.025, lower_z_mid),
        dimensions=(lower_w - 0.020, 0.020, lower_h)
    )
    
    # Lower Dark Horizontal Cooling Slats
    num_lower_slats = 7
    lower_spacing = lower_h / (num_lower_slats + 1)
    for ls_idx in range(num_lower_slats):
        lsz = lower_z_bot + (ls_idx + 1) * lower_spacing
        add_box_to_bmesh(
            bm_mesh,
            center=(0.0, grille_y, lsz),
            dimensions=(lower_w - 0.040, 0.035, 0.024)
        )
        
    # 3. Model Badge on Driver Side: '142H'
    # Position: Left of lower grille (X = +0.550 m, Z = 1.480 m)
    add_box_to_bmesh(
        bm_mesh,
        center=(0.550, grille_y + 0.015, 1.480),
        dimensions=(0.260, 0.012, 0.080)
    )
    add_box_to_bmesh(
        bm_chrome,
        center=(0.550, grille_y + 0.024, 1.480),
        dimensions=(0.240, 0.014, 0.065)
    )
    
    # 4. ICONIC SCANIA V8 BADGE on Passenger Side (X = -0.550 m, Z = 1.480 m)
    # Bold Red Background Shield with Mirror Chrome V8 Monogram
    add_box_to_bmesh(
        bm_v8,
        center=(-0.550, grille_y + 0.016, 1.480),
        dimensions=(0.220, 0.014, 0.095)
    )
    add_tube_to_bmesh(
        bm_chrome,
        center=(-0.550, grille_y + 0.020, 1.480),
        radius_outer=0.075,
        radius_inner=0.060,
        height=0.016,
        segments=20,
        axis='Y'
    )
    # 3D Chrome 'V'
    add_box_to_bmesh(
        bm_chrome,
        center=(-0.575, grille_y + 0.024, 1.480),
        dimensions=(0.045, 0.014, 0.065),
        rot_euler=(0.0, math.radians(18.0), 0.0)
    )
    add_box_to_bmesh(
        bm_chrome,
        center=(-0.545, grille_y + 0.024, 1.480),
        dimensions=(0.045, 0.014, 0.065),
        rot_euler=(0.0, math.radians(-18.0), 0.0)
    )
    # 3D Chrome '8'
    add_tube_to_bmesh(
        bm_chrome,
        center=(-0.505, grille_y + 0.024, 1.495),
        radius_outer=0.028,
        radius_inner=0.014,
        height=0.014,
        segments=16,
        axis='Y'
    )
    add_tube_to_bmesh(
        bm_chrome,
        center=(-0.505, grille_y + 0.024, 1.465),
        radius_outer=0.032,
        radius_inner=0.016,
        height=0.014,
        segments=16,
        axis='Y'
    )
    
    # 5. Windscreen Cleaning Fold-Out Footstep & Cab Grab Handles
    # Horizontal Footstep Bar beneath lower grille (Above bumper top)
    add_cylinder_to_bmesh(
        bm_mesh,
        center=(0.0, grille_y + 0.035, 1.010),
        radius=0.020,
        height=0.920,
        segments=14,
        axis='X'
    )
    # Cab Handrails under windshield cowl for driver during cleaning
    for side in [1, -1]:
        add_cylinder_to_bmesh(
            bm_mesh,
            center=(0.580 * side, grille_y + 0.040, 2.450),
            radius=0.014,
            height=0.280,
            segments=12,
            axis='X'
        )
        
    finalize_bmesh_object(slat_obj, slat_mesh, bm_slat, 32.0)
    finalize_bmesh_object(mesh_obj, mesh_mesh, bm_mesh, 32.0)
    finalize_bmesh_object(chrome_obj, chrome_mesh, bm_chrome, 32.0)
    finalize_bmesh_object(v8_obj, v8_mesh, bm_v8, 32.0)
    print("[SCANIA 142H] Subsystem 7: Dual-tier front grille and authentic V8 badges built.")

# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 8: AERODYNAMIC CORNER AIR DEFLECTORS
# ----------------------------------------------------------------------------
def build_aerodynamic_corner_deflectors(parent, mats):
    """
    Constructs the high-impact composite aerodynamic corner air deflectors (wind vanes).
    Mounted on left and right front cab corners flanking the grille.
    X = +/- 1.220 m, Y = +2.460 to +2.520 m, Z = 1.550 to 2.150 m.
    Channels airflow around cab flanks to keep side windows and door handles clean.
    """
    vane_obj, vane_mesh, bm_vane = create_bmesh_object("Aero_CornerDeflectors", mats['aero_deflector'], parent)
    brk_obj, brk_mesh, bm_brk = create_bmesh_object("Aero_CornerMounts", mats['trim_black'], parent)
    
    vane_h = 1.250 # Extended to cover from bumper top (Z = 1.000 m) to cowl (Z = 2.250 m)
    vane_z_mid = 1.625
    vane_w = 0.180
    vane_t = 0.014
    
    for side in [1, -1]:
        cx = 1.200 * side
        cy = 2.480
        
        # Aerofoil Curved Air Vane (Angled outward 18 degrees)
        rot_ang = math.radians(-18.0 * side)
        add_box_to_bmesh(
            bm_vane,
            center=(cx, cy, vane_z_mid),
            dimensions=(vane_w, 0.035, vane_h),
            rot_euler=(0.0, 0.0, rot_ang)
        )
        # Leading Edge Aerodynamic Bullet Bevel
        add_cylinder_to_bmesh(
            bm_vane,
            center=(cx - 0.060 * side, cy + 0.020, vane_z_mid),
            radius=0.016,
            height=vane_h * 0.96,
            segments=14,
            axis='Z'
        )
        # Trailing Edge Flexible Rubber Spray Lip
        add_box_to_bmesh(
            bm_brk,
            center=(cx + 0.075 * side, cy - 0.025, vane_z_mid),
            dimensions=(0.014, 0.030, vane_h * 0.98)
        )
        
        # 3 Structural Outrigger Mounting Brackets connecting to cab body
        for bz_off in [-0.220, 0.0, 0.220]:
            bz = vane_z_mid + bz_off
            add_cylinder_to_bmesh(
                bm_brk,
                center=((1.200 - 0.045) * side, cy - 0.040, bz),
                radius=0.014,
                height=0.090,
                segments=12,
                axis='X'
            )
            # Torx Mounting Flange Bolt
            add_cylinder_to_bmesh(
                bm_brk,
                center=((1.200 - 0.085) * side, cy - 0.040, bz),
                radius=0.018,
                height=0.012,
                segments=8,
                axis='X'
            )
            
    finalize_bmesh_object(vane_obj, vane_mesh, bm_vane, 32.0)
    finalize_bmesh_object(brk_obj, brk_mesh, bm_brk, 32.0)
    print("[SCANIA 142H] Subsystem 8: Aerodynamic corner air deflectors built.")

# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 9: 3-PIECE STEEL FRONT BUMPER & LIGHTING
# ----------------------------------------------------------------------------
def build_three_piece_steel_bumper_and_lighting(parent, mats):
    """
    Constructs the heavy European 3-piece pressed steel front bumper.
    Y = +2.660 m to +2.720 m, Z = 0.520 m to 0.980 m, Width = 2.480 m.
    Includes center folding step, towing jaw socket, rectangular H4 halogen headlamps,
    signature Swedish headlight wiper/washers, lower spoiler valance, and fog lamps.
    """
    bmpr_obj, bmpr_mesh, bm_bmpr = create_bmesh_object("Bumper_SteelStructure", mats['trim_black'], parent)
    hl_glass_obj, hl_glass_mesh, bm_hl_glass = create_bmesh_object("Lighting_HeadlampGlass", mats['glass_headlamp'], parent)
    hl_core_obj, hl_core_mesh, bm_hl_core = create_bmesh_object("Lighting_HeadlampCore", mats['emissive_headlight'], parent)
    amb_glass_obj, amb_glass_mesh, bm_amb_glass = create_bmesh_object("Lighting_IndicatorGlass", mats['glass_amber'], parent)
    fog_core_obj, fog_core_mesh, bm_fog_core = create_bmesh_object("Lighting_FogLamps", mats['emissive_headlight'], parent)
    wipe_obj, wipe_mesh, bm_wipe = create_bmesh_object("Bumper_HeadlightWipers", mats['trim_black'], parent)
    
    bmpr_y = 2.680
    bmpr_z_mid = 0.740
    bmpr_h = 0.380
    bmpr_w = 2.480
    half_bw = bmpr_w * 0.5 # 1.240 m
    
    # 1. Main Center Bumper Section (Width 1.600 m)
    add_box_to_bmesh(
        bm_bmpr,
        center=(0.0, bmpr_y, bmpr_z_mid),
        dimensions=(1.600, 0.140, bmpr_h)
    )
    # Upper Bumper Anti-Slip Diamond Tread Plate (For driver servicing windscreen)
    add_box_to_bmesh(
        bm_bmpr,
        center=(0.0, bmpr_y - 0.020, bmpr_z_mid + bmpr_h * 0.5 + 0.010),
        dimensions=(1.560, 0.160, 0.020)
    )
    # Center Folding Driver Access Footstep
    add_box_to_bmesh(
        bm_bmpr,
        center=(0.0, bmpr_y + 0.065, bmpr_z_mid - 0.040),
        dimensions=(0.420, 0.040, 0.160)
    )
    # Center Heavy Towing Jaw Receiver Aperture
    add_tube_to_bmesh(
        bm_bmpr,
        center=(0.0, bmpr_y + 0.070, bmpr_z_mid - 0.040),
        radius_outer=0.065,
        radius_inner=0.045,
        height=0.030,
        segments=16,
        axis='Y'
    )
    
    # European Front License Plate & Carrier
    add_box_to_bmesh(
        bm_bmpr,
        center=(0.0, bmpr_y + 0.075, bmpr_z_mid - 0.120),
        dimensions=(0.520, 0.012, 0.120)
    )
    
    # 2. Outer Bumper End-Caps (Swept rearward 22 degrees to wrap cab corners)
    for side in [1, -1]:
        end_x = (0.800 + half_bw) * 0.5 * side
        end_w = half_bw - 0.800 # 0.440 m
        add_box_to_bmesh(
            bm_bmpr,
            center=(end_x, bmpr_y - 0.060, bmpr_z_mid),
            dimensions=(end_w, 0.160, bmpr_h),
            rot_euler=(0.0, 0.0, math.radians(-18.0 * side))
        )
        
    # 3. European Rectangular H4 Halogen Headlights
    # Position: X = +/- 0.680 m, Z = 0.740 m
    for side in [1, -1]:
        hl_x = 0.680 * side
        hl_y = bmpr_y + 0.065
        hl_z = bmpr_z_mid
        
        # Headlight Recessed Housing Bucket
        add_box_to_bmesh(
            bm_bmpr,
            center=(hl_x, hl_y - 0.030, hl_z),
            dimensions=(0.320, 0.060, 0.190)
        )
        # Parabolic Chrome Reflector Dish inside
        add_cone_to_bmesh(
            bm_hl_core,
            center=(hl_x, hl_y - 0.020, hl_z),
            radius_base=0.120,
            radius_top=0.040,
            height=0.045,
            segments=20,
            axis='Y'
        )
        # H4 Halogen Glowing Core
        add_cylinder_to_bmesh(
            bm_hl_core,
            center=(hl_x, hl_y - 0.010, hl_z),
            radius=0.022,
            height=0.035,
            segments=12,
            axis='Y'
        )
        # Fluted Polycarbonate Lens Glass Cover
        add_box_to_bmesh(
            bm_hl_glass,
            center=(hl_x, hl_y + 0.008, hl_z),
            dimensions=(0.290, 0.014, 0.160)
        )
        
        # 4. SIGNATURE SWEDISH HEADLIGHT WIPER / WASHER ASSEMBLY!
        # Wiper Motor Shaft at bottom corner
        add_cylinder_to_bmesh(
            bm_wipe,
            center=(hl_x - 0.120 * side, hl_y + 0.018, hl_z - 0.080),
            radius=0.010,
            height=0.025,
            segments=10,
            axis='Y'
        )
        # Articulated Wiper Arm
        add_cylinder_to_bmesh(
            bm_wipe,
            center=(hl_x - 0.040 * side, hl_y + 0.024, hl_z),
            radius=0.005,
            height=0.160,
            segments=8,
            axis='Z'
        )
        # Tiny Rubber Wiper Blade pressed to lens
        add_box_to_bmesh(
            bm_wipe,
            center=(hl_x, hl_y + 0.022, hl_z),
            dimensions=(0.008, 0.010, 0.140)
        )
        # High-Pressure Washer Fluid Spray Nozzle
        add_cylinder_to_bmesh(
            bm_wipe,
            center=(hl_x + 0.130 * side, hl_y + 0.020, hl_z - 0.075),
            radius=0.008,
            height=0.018,
            segments=8,
            axis='Y'
        )
        
        # 5. Amber Corner Turn Indicator Lamps (Outer end of bumper)
        amb_x = 0.940 * side
        add_box_to_bmesh(
            bm_amb_glass,
            center=(amb_x, hl_y + 0.005, hl_z),
            dimensions=(0.180, 0.014, 0.160)
        )
        
    # 6. Lower Aerodynamic Spoiler Valance & Auxiliary Fog Lamps
    valance_z = 0.440
    add_box_to_bmesh(
        bm_bmpr,
        center=(0.0, bmpr_y - 0.040, valance_z),
        dimensions=(bmpr_w - 0.100, 0.120, 0.140)
    )
    # Recessed Halogen Fog Lamps in Lower Valance
    for side in [1, -1]:
        fog_x = 0.450 * side
        add_box_to_bmesh(
            bm_bmpr,
            center=(fog_x, bmpr_y - 0.010, valance_z),
            dimensions=(0.180, 0.050, 0.090)
        )
        add_box_to_bmesh(
            bm_fog_core,
            center=(fog_x, bmpr_y + 0.015, valance_z),
            dimensions=(0.150, 0.012, 0.070)
        )
        add_box_to_bmesh(
            bm_hl_glass,
            center=(fog_x, bmpr_y + 0.022, valance_z),
            dimensions=(0.160, 0.010, 0.080)
        )
        
    finalize_bmesh_object(bmpr_obj, bmpr_mesh, bm_bmpr, 32.0)
    finalize_bmesh_object(hl_glass_obj, hl_glass_mesh, bm_hl_glass, 32.0)
    finalize_bmesh_object(hl_core_obj, hl_core_mesh, bm_hl_core, 32.0)
    finalize_bmesh_object(amb_glass_obj, amb_glass_mesh, bm_amb_glass, 32.0)
    finalize_bmesh_object(fog_core_obj, fog_core_mesh, bm_fog_core, 32.0)
    finalize_bmesh_object(wipe_obj, wipe_mesh, bm_wipe, 32.0)
    print("[SCANIA 142H] Subsystem 9: 3-piece steel bumper and lighting array built.")

# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 10: PANORAMIC WINDSHIELD & THREE-WIPER PANTOGRAPH
# ----------------------------------------------------------------------------
def build_panoramic_windshield_and_three_wipers(parent, mats):
    """
    Constructs the large laminated safety glass panoramic windshield and the
    legendary Scania THREE-WIPER pantograph wiper assembly.
    Windshield: Y = +2.440 to +2.380 m, Z = 2.460 to 3.080 m, Width = 2.220 m.
    3 articulated pantograph wiper arms, 600mm rubber blades, and cowl washer nozzles.
    """
    glass_obj, glass_mesh, bm_glass = create_bmesh_object("Windshield_LaminatedGlass", mats['glass_window'], parent)
    gasket_obj, gasket_mesh, bm_gasket = create_bmesh_object("Windshield_RubberGasket", mats['trim_black'], parent)
    wiper_obj, wiper_mesh, bm_wiper = create_bmesh_object("Windshield_ThreeWipers", mats['trim_black'], parent)
    
    ws_w = 2.220
    ws_z_bot = 2.480
    ws_z_top = 3.060
    ws_h = ws_z_top - ws_z_bot # 0.580 m
    ws_z_mid = (ws_z_bot + ws_z_top) * 0.5
    
    ws_y_bot = 2.470
    ws_y_top = 2.410 # 4-degree rake
    ws_y_mid = (ws_y_bot + ws_y_top) * 0.5
    
    # 1. Panoramic Curved Safety Glass Windshield
    # Center Windshield Pane
    add_box_to_bmesh(
        bm_glass,
        center=(0.0, ws_y_mid, ws_z_mid),
        dimensions=(ws_w - 0.200, 0.016, ws_h),
        rot_euler=(math.radians(6.0), 0.0, 0.0)
    )
    # Curved A-Pillar Outer Corner Wraps
    for side in [1, -1]:
        wrap_x = (ws_w * 0.5 - 0.060) * side
        add_cylinder_to_bmesh(
            bm_glass,
            center=(wrap_x, ws_y_mid - 0.030, ws_z_mid),
            radius=0.080,
            height=ws_h * 0.96,
            segments=16,
            axis='Z'
        )
        
    # 2. Black Polyurethane Weatherseal Gasket Perimeter Frame (Rectangular wrap)
    # Perimeter Seal Strips
    add_box_to_bmesh(
        bm_gasket,
        center=(0.0, ws_y_top + 0.010, ws_z_top + 0.015),
        dimensions=(ws_w + 0.040, 0.035, 0.030)
    )
    add_box_to_bmesh(
        bm_gasket,
        center=(0.0, ws_y_bot + 0.010, ws_z_bot - 0.015),
        dimensions=(ws_w + 0.040, 0.035, 0.030)
    )
    for side in [1, -1]:
        add_box_to_bmesh(
            bm_gasket,
            center=((ws_w * 0.5 + 0.010) * side, ws_y_mid, ws_z_mid),
            dimensions=(0.030, 0.040, ws_h + 0.040)
        )
        
    # =========================================================================
    # 3. THE LEGENDARY SCANIA THREE-WIPER PANTOGRAPH ASSEMBLY
    # 3 Spaced Wiper Pivot Hubs across lower cowl (X = -0.650 m, 0.000 m, +0.650 m)
    # =========================================================================
    wiper_pivots_x = [-0.650, 0.000, 0.650]
    blade_len = 0.580 # 600 mm wiper blade length
    
    for px in wiper_pivots_x:
        py = ws_y_bot + 0.025
        pz = ws_z_bot - 0.010
        
        # Heavy Cowl Wiper Pivot Nut & Bezel
        add_cylinder_to_bmesh(
            bm_wiper,
            center=(px, py, pz),
            radius=0.022,
            height=0.035,
            segments=12,
            axis='Y'
        )
        
        # Dual-Arm Articulated Pantograph Linkage
        # Main Driven Wiper Arm (Slightly tilted 8 degrees in rest position)
        arm_h = blade_len * 0.85
        add_cylinder_to_bmesh(
            bm_wiper,
            center=(px + 0.030, py + 0.020, pz + arm_h * 0.5),
            radius=0.007,
            height=arm_h,
            segments=8,
            axis='Z'
        )
        # Parallel Guide Linkage Rod (Pantograph secondary arm)
        add_cylinder_to_bmesh(
            bm_wiper,
            center=(px - 0.030, py + 0.018, pz + arm_h * 0.5),
            radius=0.005,
            height=arm_h,
            segments=8,
            axis='Z'
        )
        
        # Center Wiper Blade Carrier Bridge
        add_box_to_bmesh(
            bm_wiper,
            center=(px, py + 0.022, pz + arm_h),
            dimensions=(0.080, 0.016, 0.035)
        )
        
        # 600mm Flexible Rubber Wiper Blade (Pressed against windshield face)
        add_box_to_bmesh(
            bm_wiper,
            center=(px, py + 0.020, pz + arm_h * 0.55),
            dimensions=(0.012, 0.014, blade_len),
            rot_euler=(math.radians(6.0), 0.0, 0.0)
        )
        
    # Windshield Washer Twin Spray Jets on Cowl
    for jx in [-0.350, 0.350]:
        add_cone_to_bmesh(
            bm_wiper,
            center=(jx, ws_y_bot + 0.035, ws_z_bot - 0.030),
            radius_base=0.014,
            radius_top=0.008,
            height=0.020,
            segments=10,
            axis='Z'
        )
        
    finalize_bmesh_object(glass_obj, glass_mesh, bm_glass, 32.0)
    finalize_bmesh_object(gasket_obj, gasket_mesh, bm_gasket, 32.0)
    finalize_bmesh_object(wiper_obj, wiper_mesh, bm_wiper, 32.0)
    print("[SCANIA 142H] Subsystem 10: Panoramic windshield and 3-wiper pantograph built.")



# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 11: EXTERIOR MOLDED SUNVISOR & CLEARANCE LIGHTS
# ----------------------------------------------------------------------------
def build_exterior_molded_sunvisor_and_clearance_lights(parent, mats):
    """
    Constructs the exterior molded smoked-acrylic sunvisor brow and cab clearance lights.
    Mounted above the panoramic windshield (Z = 2.950 m to 3.180 m, Width = 2.300 m).
    Includes translucent smoked amber visor shield, stainless steel A-pillar struts,
    and 5 flush-mounted aerodynamic amber clearance lamps.
    """
    vis_obj, vis_mesh, bm_vis = create_bmesh_object("Sunvisor_AcrylicShield", mats['glass_sunvisor'], parent)
    strut_obj, strut_mesh, bm_strut = create_bmesh_object("Sunvisor_MountingStruts", mats['chrome'], parent)
    amb_obj, amb_mesh, bm_amb = create_bmesh_object("Lighting_CabClearance", mats['emissive_amber'], parent)
    amb_gls_obj, amb_gls_mesh, bm_amb_gls = create_bmesh_object("Lighting_ClearanceLenses", mats['glass_amber'], parent)
    
    vis_w = 2.300
    vis_y = 2.440
    vis_z = 3.080
    
    # 1. Smoked Acrylic Sunvisor Brow (Angled downward 35 degrees)
    add_box_to_bmesh(
        bm_vis,
        center=(0.0, vis_y + 0.120, vis_z),
        dimensions=(vis_w, 0.240, 0.014),
        rot_euler=(math.radians(35.0), 0.0, 0.0)
    )
    # Curved Visor Outer Brow Lip
    add_cylinder_to_bmesh(
        bm_vis,
        center=(0.0, vis_y + 0.220, vis_z - 0.070),
        radius=0.012,
        height=vis_w * 0.98,
        segments=16,
        axis='X'
    )
    
    # 2. Stainless Steel A-Pillar Mounting Struts (Left, Center, Right)
    for sx in [-1.080, -0.450, 0.0, 0.450, 1.080]:
        # Support Bracket on Cab A-Pillars / Roof Header
        add_cylinder_to_bmesh(
            bm_strut,
            center=(sx, vis_y + 0.060, vis_z + 0.030),
            radius=0.010,
            height=0.140,
            segments=10,
            axis='Y'
        )
        add_box_to_bmesh(
            bm_strut,
            center=(sx, vis_y, vis_z + 0.040),
            dimensions=(0.035, 0.045, 0.035)
        )
        
    # 3. 5 Integrated Aerodynamic Amber Clearance / Marker Lamps
    marker_x_coords = [-0.900, -0.450, 0.0, 0.450, 0.900]
    for mx in marker_x_coords:
        mz = vis_z - 0.025
        my = vis_y + 0.140
        # Teardrop Chrome Housing
        add_box_to_bmesh(
            bm_strut,
            center=(mx, my, mz),
            dimensions=(0.080, 0.040, 0.030),
            rot_euler=(math.radians(35.0), 0.0, 0.0)
        )
        # Glowing Amber Core
        add_cylinder_to_bmesh(
            bm_amb,
            center=(mx, my + 0.012, mz),
            radius=0.014,
            height=0.025,
            segments=12,
            axis='Y'
        )
        # Amber Lens Cap
        add_box_to_bmesh(
            bm_amb_gls,
            center=(mx, my + 0.018, mz),
            dimensions=(0.065, 0.015, 0.025),
            rot_euler=(math.radians(35.0), 0.0, 0.0)
        )
        
    finalize_bmesh_object(vis_obj, vis_mesh, bm_vis, 32.0)
    finalize_bmesh_object(strut_obj, strut_mesh, bm_strut, 32.0)
    finalize_bmesh_object(amb_obj, amb_mesh, bm_amb, 32.0)
    finalize_bmesh_object(amb_gls_obj, amb_gls_mesh, bm_amb_gls, 32.0)
    print("[SCANIA 142H] Subsystem 11: Exterior molded sunvisor and clearance lights built.")

# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 12: ADJUSTABLE ROOF AEROFOIL & SIDE COLLAR WINGS
# ----------------------------------------------------------------------------
def build_adjustable_roof_aerofoil_and_collar_wings(parent, mats):
    """
    Constructs the 1980s factory aerodynamic package:
    - High-roof molded fiberglass roof aerofoil deflector (Z = 3.420 m to 3.850 m).
    - Adjustable tilt struts (allowing angle changes for different trailer heights).
    - Vertical cab-collar side aerodynamic wings bridging the cab-to-trailer gap.
    """
    aero_obj, aero_mesh, bm_aero = create_bmesh_object("Aero_RoofDeflector", mats['aero_deflector'], parent)
    strut_obj, strut_mesh, bm_strut = create_bmesh_object("Aero_TiltStruts", mats['trim_black'], parent)
    collar_obj, collar_mesh, bm_collar = create_bmesh_object("Aero_SideCollarWings", mats['aero_deflector'], parent)
    
    aero_w = 2.240
    aero_len = 1.450
    aero_y_mid = 1.450
    aero_z_base = 3.460
    
    # 1. Molded Fiberglass Roof Aerofoil Deflector Shield
    # Main Curved Scoop Face (Angled upward from front roof edge)
    add_box_to_bmesh(
        bm_aero,
        center=(0.0, aero_y_mid, aero_z_base + 0.220),
        dimensions=(aero_w, aero_len, 0.024),
        rot_euler=(math.radians(-16.0), 0.0, 0.0)
    )
    # Forward Aerodynamic Leading Edge Blend
    add_cylinder_to_bmesh(
        bm_aero,
        center=(0.0, aero_y_mid + aero_len * 0.48, aero_z_base + 0.040),
        radius=0.035,
        height=aero_w * 0.95,
        segments=20,
        axis='X'
    )
    # Rearward Upper Trailing Edge Lip (Z = 3.850 m peak height)
    add_box_to_bmesh(
        bm_aero,
        center=(0.0, aero_y_mid - aero_len * 0.48, aero_z_base + 0.410),
        dimensions=(aero_w, 0.060, 0.035)
    )
    # Aerofoil Side Flanges (Curved downward to channel airflow)
    for side in [1, -1]:
        flange_x = (aero_w * 0.5 - 0.015) * side
        add_box_to_bmesh(
            bm_aero,
            center=(flange_x, aero_y_mid, aero_z_base + 0.160),
            dimensions=(0.030, aero_len, 0.240),
            rot_euler=(math.radians(-16.0), 0.0, 0.0)
        )
        
    # 2. Adjustable Steel Rear Tilt Struts (Left and Right)
    for side in [1, -1]:
        strut_x = 0.820 * side
        strut_bot = Vector((strut_x, 0.700, 3.440))
        strut_top = Vector((strut_x, 0.850, 3.800))
        strut_mid = (strut_bot + strut_top) * 0.5
        strut_len = (strut_top - strut_bot).length
        # Telescopic Strut Tube
        add_cylinder_to_bmesh(
            bm_strut,
            center=(strut_mid.x, strut_mid.y, strut_mid.z),
            radius=0.018,
            height=strut_len,
            segments=12,
            axis='Z'
        )
        # Clamping Collar & Pin
        add_cylinder_to_bmesh(
            bm_strut,
            center=(strut_mid.x, strut_mid.y, strut_mid.z),
            radius=0.026,
            height=0.040,
            segments=12,
            axis='Z'
        )
        # Mounting Foot Brackets
        add_box_to_bmesh(
            bm_strut,
            center=(strut_bot.x, strut_bot.y, strut_bot.z),
            dimensions=(0.060, 0.080, 0.040)
        )
        add_box_to_bmesh(
            bm_strut,
            center=(strut_top.x, strut_top.y, strut_top.z),
            dimensions=(0.060, 0.080, 0.040)
        )
        
    # 3. Vertical Cab-Collar Side Aerodynamic Wings
    # Extends 350 mm rearward past cab rear wall (Y = +0.550 m to +0.200 m)
    # Height: Z = 1.620 m to 3.420 m (1.800 m tall vertical wings)
    collar_h = 1.800
    collar_z_mid = 2.520
    collar_len = 0.350
    collar_y_mid = 0.375
    
    for side in [1, -1]:
        wing_x = 1.220 * side
        # Vertical Wing Blade
        add_box_to_bmesh(
            bm_collar,
            center=(wing_x, collar_y_mid, collar_z_mid),
            dimensions=(0.025, collar_len, collar_h)
        )
        # Trailing Edge Flexible Rubber Air Seal Lip
        add_box_to_bmesh(
            bm_strut,
            center=(wing_x, collar_y_mid - collar_len * 0.5, collar_z_mid),
            dimensions=(0.016, 0.040, collar_h)
        )
        # 4 Structural Steel Hinge Brackets connecting wing to cab rear pillar
        for hz in [1.750, 2.250, 2.750, 3.250]:
            add_cylinder_to_bmesh(
                bm_strut,
                center=((1.220 - 0.035) * side, 0.550, hz),
                radius=0.016,
                height=0.080,
                segments=10,
                axis='Y'
            )
            
    finalize_bmesh_object(aero_obj, aero_mesh, bm_aero, 32.0)
    finalize_bmesh_object(strut_obj, strut_mesh, bm_strut, 32.0)
    finalize_bmesh_object(collar_obj, collar_mesh, bm_collar, 32.0)
    print("[SCANIA 142H] Subsystem 12: Adjustable roof aerofoil and side collar wings built.")

# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 13: TWIN HADLEY CHROME HORNS & CB ANTENNAS
# ----------------------------------------------------------------------------
def build_twin_hadley_horns_and_cb_antennas(parent, mats):
    """
    Constructs the dual Hadley mirror-chrome trumpet air horns and twin roof CB whip antennas.
    Left Horn: 0.750 m length, Right Horn: 0.660 m length (dual tone acoustic harmonics).
    Mounted on driver and passenger roof crowns (X = +/- 0.750 m, Z = 3.480 m).
    """
    horn_obj, horn_mesh, bm_horn = create_bmesh_object("Roof_HadleyAirHorns", mats['chrome'], parent)
    ant_obj, ant_mesh, bm_ant = create_bmesh_object("Roof_CBAntennas", mats['chrome'], parent)
    trim_obj, trim_mesh, bm_trim = create_bmesh_object("Roof_AntennaBases", mats['trim_black'], parent)
    
    horn_specs = [
        ( 0.750, 0.750, 0.140, 2.150), # Driver side (+X): 750mm low-tone horn
        (-0.750, 0.660, 0.130, 2.180)  # Passenger side (-X): 660mm high-tone horn
    ]
    
    for hx, h_len, bell_r, base_y in horn_specs:
        hz = 3.490
        # 1. Trumpet Rear Sound Chamber / Diaphragm Housing
        add_cylinder_to_bmesh(
            bm_horn,
            center=(hx, base_y - h_len * 0.5, hz),
            radius=0.055,
            height=0.065,
            segments=18,
            axis='Y'
        )
        # Rear Chrome Dome Cap
        add_cone_to_bmesh(
            bm_horn,
            center=(hx, base_y - h_len * 0.5 - 0.035, hz),
            radius_base=0.055,
            radius_top=0.020,
            height=0.035,
            segments=18,
            axis='Y'
        )
        
        # 2. Conical Tapered Trumpet Tube
        mid_y = base_y
        tube_len = h_len * 0.82
        add_cone_to_bmesh(
            bm_horn,
            center=(hx, mid_y, hz),
            radius_base=0.024,
            radius_top=0.050,
            height=tube_len,
            segments=20,
            axis='Y'
        )
        
        # 3. Flared Front Acoustic Bell Flare
        bell_y = base_y + h_len * 0.45
        add_cone_to_bmesh(
            bm_horn,
            center=(hx, bell_y, hz),
            radius_base=0.050,
            radius_top=bell_r * 0.5,
            height=0.100,
            segments=24,
            axis='Y'
        )
        # Bell Mouth Outer Rim Ring
        add_tube_to_bmesh(
            bm_horn,
            center=(hx, bell_y + 0.050, hz),
            radius_outer=bell_r * 0.52,
            radius_inner=bell_r * 0.46,
            height=0.016,
            segments=24,
            axis='Y'
        )
        
        # 4. Front & Rear Pedestal Mounting Brackets
        add_cylinder_to_bmesh(
            bm_horn,
            center=(hx, base_y - h_len * 0.45, hz - 0.035),
            radius=0.012,
            height=0.070,
            segments=10,
            axis='Z'
        )
        add_cylinder_to_bmesh(
            bm_horn,
            center=(hx, base_y + h_len * 0.25, hz - 0.035),
            radius=0.010,
            height=0.070,
            segments=10,
            axis='Z'
        )
        # Compressed Air Supply Line Fitting
        add_cylinder_to_bmesh(
            bm_horn,
            center=(hx, base_y - h_len * 0.48, hz - 0.040),
            radius=0.008,
            height=0.060,
            segments=8,
            axis='Z'
        )
        
    # 5. Twin Roof CB Whip Antennas (Left and Right Roof Corners)
    for side in [1, -1]:
        ant_x = 1.180 * side
        ant_y = 2.050
        ant_z = 3.430
        
        # Black Gutter Mounting Clamp
        add_box_to_bmesh(
            bm_trim,
            center=(ant_x, ant_y, ant_z),
            dimensions=(0.040, 0.050, 0.040)
        )
        # Chrome Loading Coil Spring (Absorbs tree branch impacts)
        add_cylinder_to_bmesh(
            bm_ant,
            center=(ant_x, ant_y, ant_z + 0.060),
            radius=0.016,
            height=0.100,
            segments=12,
            axis='Z'
        )
        # 1.2-Meter Stainless Steel Tapered Whip Antenna
        ant_h = 1.200
        add_cone_to_bmesh(
            bm_ant,
            center=(ant_x, ant_y - 0.040, ant_z + 0.110 + ant_h * 0.5),
            radius_base=0.006,
            radius_top=0.002,
            height=ant_h,
            segments=8,
            axis='Z'
        )
        # Top Safety Corona Ball
        add_cylinder_to_bmesh(
            bm_ant,
            center=(ant_x, ant_y - 0.080, ant_z + 0.110 + ant_h),
            radius=0.008,
            height=0.016,
            segments=8,
            axis='Z'
        )
        
    finalize_bmesh_object(horn_obj, horn_mesh, bm_horn, 32.0)
    finalize_bmesh_object(ant_obj, ant_mesh, bm_ant, 32.0)
    finalize_bmesh_object(trim_obj, trim_mesh, bm_trim, 32.0)
    print("[SCANIA 142H] Subsystem 13: Twin Hadley air horns and CB antennas built.")

# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 14: CAB DOORS, FLUSH HANDLES & EUROPEAN HEATED MIRRORS
# ----------------------------------------------------------------------------
def build_cab_doors_flush_handles_and_mirrors(parent, mats):
    """
    Constructs the driver and passenger doors, flush recessed black handles,
    side window glass, and authentic European double-lens heated mirrors.
    Main flat mirror (0.38x0.20m), lower convex spotter (0.16x0.20m),
    and passenger-side downward-pointing curb mirror.
    """
    door_obj, door_mesh, bm_door = create_bmesh_object("Doors_Shutlines", mats['cab_paint'], parent)
    hndl_obj, hndl_mesh, bm_hndl = create_bmesh_object("Doors_FlushHandles", mats['trim_black'], parent)
    gls_obj, gls_mesh, bm_gls = create_bmesh_object("Doors_WindowGlass", mats['glass_window'], parent)
    mr_frm_obj, mr_frm_mesh, bm_mr_frm = create_bmesh_object("Mirrors_TubularFrame", mats['trim_black'], parent)
    mr_gls_obj, mr_gls_mesh, bm_mr_gls = create_bmesh_object("Mirrors_ReflectiveGlass", mats['chrome'], parent)
    
    door_len = 0.950 # Door fore-aft span (Y = +1.500 m to +2.450 m)
    door_y_mid = 1.975
    door_w = 0.050
    half_cw = 1.210
    
    for side in [1, -1]:
        dx = (half_cw + 0.005) * side
        
        # 1. Door Exterior Skin Shutline Outlines
        # Bottom Door Drip Moulding
        add_box_to_bmesh(
            bm_hndl,
            center=(dx, door_y_mid, 1.490),
            dimensions=(0.020, door_len, 0.025)
        )
        # Forward & Rear Vertical Door Cut Lines
        add_box_to_bmesh(
            bm_door,
            center=(dx - 0.005 * side, 2.440, 2.100),
            dimensions=(0.015, 0.015, 1.220)
        )
        add_box_to_bmesh(
            bm_door,
            center=(dx - 0.005 * side, 1.500, 2.100),
            dimensions=(0.015, 0.015, 1.220)
        )
        
        # 2. Side Window Glass & Rubber Sash Frame
        win_y_mid = door_y_mid - 0.040
        win_len = 0.780
        win_z_mid = 2.760
        win_h = 0.520
        # Window Glass Pane
        add_box_to_bmesh(
            bm_gls,
            center=(dx - 0.015 * side, win_y_mid, win_z_mid),
            dimensions=(0.010, win_len, win_h)
        )
        # Front Quarter Vent Window Divider Bar
        add_box_to_bmesh(
            bm_hndl,
            center=(dx - 0.010 * side, win_y_mid + win_len * 0.32, win_z_mid),
            dimensions=(0.018, 0.022, win_h)
        )
        
        # 3. Recessed Flush Black Paddle Door Handle with Key Cylinder
        hndl_y = 1.680
        hndl_z = 2.060
        # Recessed Handle Pocket
        add_box_to_bmesh(
            bm_hndl,
            center=(dx, hndl_y, hndl_z),
            dimensions=(0.025, 0.180, 0.090)
        )
        # Lift Paddle
        add_box_to_bmesh(
            bm_hndl,
            center=(dx + 0.008 * side, hndl_y + 0.020, hndl_z),
            dimensions=(0.018, 0.120, 0.055)
        )
        # Chrome Key Lock Cylinder
        add_cylinder_to_bmesh(
            bm_mr_gls,
            center=(dx + 0.010 * side, hndl_y - 0.055, hndl_z),
            radius=0.009,
            height=0.015,
            segments=10,
            axis='X'
        )
        
        # =====================================================================
        # 4. AUTHENTIC EUROPEAN DOUBLE-LENS HEATED MIRROR ASSEMBLY
        # Position: X = +/- 1.450 m, Y = 2.360 m, Z = 2.500 m
        # =====================================================================
        mr_x = 1.440 * side
        mr_y = 2.380
        mr_z = 2.520
        
        # Heavy Steel Tubular Mirror Support Loop
        # Upper Arm from A-Pillar
        add_cylinder_to_bmesh(
            bm_mr_frm,
            center=((half_cw + 0.115) * side, mr_y, 2.780),
            radius=0.014,
            height=0.230,
            segments=12,
            axis='X'
        )
        # Lower Arm from Door Skin
        add_cylinder_to_bmesh(
            bm_mr_frm,
            center=((half_cw + 0.115) * side, mr_y, 2.220),
            radius=0.014,
            height=0.230,
            segments=12,
            axis='X'
        )
        # Vertical Support Tube
        add_cylinder_to_bmesh(
            bm_mr_frm,
            center=(mr_x - 0.030 * side, mr_y, mr_z),
            radius=0.016,
            height=0.620,
            segments=12,
            axis='Z'
        )
        
        # Main Upper Mirror Housing (0.380 m tall x 0.210 m wide)
        add_box_to_bmesh(
            bm_mr_frm,
            center=(mr_x, mr_y, mr_z + 0.090),
            dimensions=(0.045, 0.210, 0.380)
        )
        # Heated Flat Reflective Glass Face
        add_box_to_bmesh(
            bm_mr_gls,
            center=(mr_x - 0.018 * side, mr_y - 0.010, mr_z + 0.090),
            dimensions=(0.012, 0.185, 0.355),
            rot_euler=(0.0, 0.0, math.radians(-12.0 * side))
        )
        
        # Lower Wide-Angle Convex Blind-Spot Mirror (0.160 m tall x 0.210 m wide)
        add_box_to_bmesh(
            bm_mr_frm,
            center=(mr_x, mr_y, mr_z - 0.210),
            dimensions=(0.045, 0.210, 0.160)
        )
        # Convex Mirror Glass Face (Angled down 8 degrees)
        add_box_to_bmesh(
            bm_mr_gls,
            center=(mr_x - 0.018 * side, mr_y - 0.010, mr_z - 0.210),
            dimensions=(0.012, 0.185, 0.140),
            rot_euler=(math.radians(8.0), 0.0, math.radians(-15.0 * side))
        )
        
    # 5. Passenger Side Curb-View Mirror (Points directly down at right front wheel)
    curb_x = -1.340 # Passenger side (-X)
    curb_y = 2.420
    curb_z = 2.920
    # Overhanging Support Arm
    add_cylinder_to_bmesh(
        bm_mr_frm,
        center=(-1.280, curb_y, curb_z),
        radius=0.012,
        height=0.120,
        segments=10,
        axis='X'
    )
    # Downward Facing Circular/Oval Mirror Housing
    add_cylinder_to_bmesh(
        bm_mr_frm,
        center=(curb_x, curb_y, curb_z - 0.040),
        radius=0.090,
        height=0.035,
        segments=16,
        axis='Z'
    )
    # Reflective Glass Face
    add_cylinder_to_bmesh(
        bm_mr_gls,
        center=(curb_x, curb_y, curb_z - 0.055),
        radius=0.082,
        height=0.010,
        segments=16,
        axis='Z'
    )
    
    finalize_bmesh_object(door_obj, door_mesh, bm_door, 32.0)
    finalize_bmesh_object(hndl_obj, hndl_mesh, bm_hndl, 32.0)
    finalize_bmesh_object(gls_obj, gls_mesh, bm_gls, 32.0)
    finalize_bmesh_object(mr_frm_obj, mr_frm_mesh, bm_mr_frm, 32.0)
    finalize_bmesh_object(mr_gls_obj, mr_gls_mesh, bm_mr_gls, 32.0)
    print("[SCANIA 142H] Subsystem 14: Cab doors, flush handles, and European mirrors built.")

# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 15: STEPPED ENTRY STIRRUP FOOTSTEPS & GRAB RAILS
# ----------------------------------------------------------------------------
def build_stepped_entry_footsteps_and_grab_rails(parent, mats):
    """
    Constructs the recessed stepped entry system for the forward-control cab:
    - Upper Step (Z = 1.140 m): Perforated open-grate aluminum tread.
    - Middle Step (Z = 0.840 m): Perforated open-grate aluminum tread.
    - Lower Hanging Step (Z = 0.520 m): Flexible heavy rubber-hung stirrup step.
    - Full-length vertical entry grab rails on cab B-pillars.
    """
    step_alu_obj, step_alu_mesh, bm_step_alu = create_bmesh_object("Steps_AluminumTreads", mats['aluminum'], parent)
    step_box_obj, step_box_mesh, bm_step_box = create_bmesh_object("Steps_RecessedWell", mats['trim_black'], parent)
    rail_obj, rail_mesh, bm_rail = create_bmesh_object("Steps_CabGrabRails", mats['chrome'], parent)
    
    step_y = 2.480 # Front lower cab corner boarding stirrups (forward of steer tire)
    step_w = 0.440 # 440 mm wide step
    step_depth = 0.220
    half_cw = 1.210
    
    for side in [1, -1]:
        well_x = (half_cw - 0.080) * side
        
        # 1. Recessed Step Well Housing in Lower Cab Shell
        add_box_to_bmesh(
            bm_step_box,
            center=(well_x, step_y, 0.980),
            dimensions=(0.180, step_w + 0.080, 0.740)
        )
        
        # 2. Upper Perforated Aluminum Tread (Z = 1.140 m)
        add_box_to_bmesh(
            bm_step_alu,
            center=(well_x + 0.040 * side, step_y, 1.140),
            dimensions=(step_depth, step_w, 0.035)
        )
        # Anti-Skid Drainage Serrations
        for s_idx in range(6):
            sy_off = (s_idx - 2.5) * 0.065
            add_cylinder_to_bmesh(
                bm_step_box,
                center=(well_x + 0.040 * side, step_y + sy_off, 1.155),
                radius=0.014,
                height=0.015,
                segments=8,
                axis='Z'
            )
            
        # 3. Middle Perforated Aluminum Tread (Z = 0.840 m)
        add_box_to_bmesh(
            bm_step_alu,
            center=(well_x + 0.060 * side, step_y, 0.840),
            dimensions=(step_depth, step_w, 0.035)
        )
        for s_idx in range(6):
            sy_off = (s_idx - 2.5) * 0.065
            add_cylinder_to_bmesh(
                bm_step_box,
                center=(well_x + 0.060 * side, step_y + sy_off, 0.855),
                radius=0.014,
                height=0.015,
                segments=8,
                axis='Z'
            )
            
        # 4. Lower Flexible Rubber-Hung Stirrup Step (Z = 0.520 m)
        # Heavy Rubber Suspension Straps (Deflects when hitting ground obstacles)
        for st_y in [-0.180, 0.180]:
            add_box_to_bmesh(
                bm_step_box,
                center=(well_x + 0.080 * side, step_y + st_y, 0.680),
                dimensions=(0.025, 0.060, 0.280)
            )
        # Cast Aluminum Bottom Footstep
        add_box_to_bmesh(
            bm_step_alu,
            center=(well_x + 0.080 * side, step_y, 0.520),
            dimensions=(step_depth, step_w, 0.040)
        )
        
        # 5. Full-Length Vertical Entry Assist Grab Rail on Cab B-Pillar
        rail_x = (half_cw + 0.025) * side
        rail_y = 1.540 # Cab B-Pillar edge
        rail_z_mid = 1.950
        rail_len = 0.960
        # Main Chrome Grab Tube
        add_cylinder_to_bmesh(
            bm_rail,
            center=(rail_x, rail_y, rail_z_mid),
            radius=0.016,
            height=rail_len,
            segments=14,
            axis='Z'
        )
        # Top and Bottom Standoff Stems
        add_cylinder_to_bmesh(
            bm_rail,
            center=(rail_x - 0.035 * side, rail_y, rail_z_mid + rail_len * 0.45),
            radius=0.012,
            height=0.070,
            segments=10,
            axis='X'
        )
        add_cylinder_to_bmesh(
            bm_rail,
            center=(rail_x - 0.035 * side, rail_y, rail_z_mid - rail_len * 0.45),
            radius=0.012,
            height=0.070,
            segments=10,
            axis='X'
        )
        
    finalize_bmesh_object(step_alu_obj, step_alu_mesh, bm_step_alu, 32.0)
    finalize_bmesh_object(step_box_obj, step_box_mesh, bm_step_box, 32.0)
    finalize_bmesh_object(rail_obj, rail_mesh, bm_rail, 32.0)
    print("[SCANIA 142H] Subsystem 15: Stepped entry stirrup footsteps and grab rails built.")



# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 16: 400L D-SHAPED ALUMINUM FUEL TANK & BRACKETS
# ----------------------------------------------------------------------------
def build_400l_d_shaped_aluminum_fuel_tank(parent, mats):
    """
    Constructs the driver-side 400-liter D-shaped brushed aluminum diesel fuel tank.
    Position: Driver side (+X), Y = -0.150 m to +1.350 m (1.500 m length).
    X = +0.820 m, Z = 0.720 m.
    Includes D-profile extruded aluminum tank shell, rubber-cushioned steel J-brackets,
    stainless steel retention straps with M16 tensioners, locking filler neck, and lines.
    """
    tank_obj, tank_mesh, bm_tank = create_bmesh_object("FuelTank_AluminumShell", mats['aluminum'], parent)
    strap_obj, strap_mesh, bm_strap = create_bmesh_object("FuelTank_Straps", mats['chrome'], parent)
    brk_obj, brk_mesh, bm_brk = create_bmesh_object("FuelTank_JBrackets", mats['chassis_grey'], parent)
    
    tank_len = 1.480
    tank_y_mid = 0.600
    tank_x = 0.820
    tank_z = 0.720
    tank_w = 0.640 # Width from frame to outer step
    tank_h = 0.620 # Tank height
    
    # 1. D-Shaped Aluminum Fuel Tank Body
    # Flat inner vertical box (facing chassis rail)
    add_box_to_bmesh(
        bm_tank,
        center=(tank_x - 0.120, tank_y_mid, tank_z),
        dimensions=(tank_w * 0.55, tank_len, tank_h)
    )
    # Curved outer cylindrical half-shell
    add_cylinder_to_bmesh(
        bm_tank,
        center=(tank_x + 0.050, tank_y_mid, tank_z),
        radius=tank_h * 0.48,
        height=tank_len,
        segments=24,
        axis='Y'
    )
    # Tank Stamped D-Shaped End Caps (Front and Rear with reinforcing ribs)
    for cap_y in [tank_y_mid - tank_len * 0.5, tank_y_mid + tank_len * 0.5]:
        add_cylinder_to_bmesh(
            bm_tank,
            center=(tank_x + 0.050, cap_y, tank_z),
            radius=tank_h * 0.49,
            height=0.025,
            segments=24,
            axis='Y'
        )
        add_box_to_bmesh(
            bm_tank,
            center=(tank_x - 0.120, cap_y, tank_z),
            dimensions=(tank_w * 0.56, 0.025, tank_h * 1.02)
        )
        
    # 2. Heavy Forged Steel J-Brackets (Bolted to Chassis Rail Web)
    for b_idx in [-0.480, 0.480]:
        by = tank_y_mid + b_idx
        # Horizontal Cradle Arm beneath tank
        add_box_to_bmesh(
            bm_brk,
            center=(tank_x - 0.050, by, tank_z - tank_h * 0.5 - 0.035),
            dimensions=(tank_w + 0.080, 0.075, 0.050)
        )
        # Vertical Mount Flange bolted to frame web
        add_box_to_bmesh(
            bm_brk,
            center=(0.400, by, tank_z + 0.080),
            dimensions=(0.040, 0.120, 0.380)
        )
        # Rubber Cushioning Isolation Strips
        add_box_to_bmesh(
            bm_brk,
            center=(tank_x - 0.050, by, tank_z - tank_h * 0.5 - 0.005),
            dimensions=(tank_w + 0.060, 0.065, 0.012)
        )
        
    # 3. Mirror-Polished Stainless Steel Tension Retention Straps
    for s_idx in [-0.480, 0.480]:
        sy = tank_y_mid + s_idx
        # Outer Strap Band
        add_tube_to_bmesh(
            bm_strap,
            center=(tank_x + 0.050, sy, tank_z),
            radius_outer=tank_h * 0.505,
            radius_inner=tank_h * 0.485,
            height=0.045,
            segments=24,
            axis='Y'
        )
        # Top M16 Tensioner T-Bolt & Castle Nut
        add_cylinder_to_bmesh(
            bm_strap,
            center=(tank_x - 0.180, sy, tank_z + tank_h * 0.5 + 0.035),
            radius=0.016,
            height=0.070,
            segments=8,
            axis='Z'
        )
        
    # 4. Quarter-Turn Locking Diesel Filler Neck & Polished Cap
    fill_y = tank_y_mid + 0.350
    fill_x = tank_x + 0.160
    fill_z = tank_z + tank_h * 0.42
    # Angled Filler Neck
    add_cylinder_to_bmesh(
        bm_tank,
        center=(fill_x, fill_y, fill_z),
        radius=0.045,
        height=0.090,
        segments=16,
        axis='Z'
    )
    # Mirror Chrome Locking Fuel Cap with Key Slot
    add_cylinder_to_bmesh(
        bm_strap,
        center=(fill_x, fill_y, fill_z + 0.050),
        radius=0.055,
        height=0.030,
        segments=18,
        axis='Z'
    )
    
    # 5. Fuel Level Sender Unit & Stainless Braided Fuel Lines
    send_y = tank_y_mid - 0.250
    send_x = tank_x - 0.060
    send_z = tank_z + tank_h * 0.505
    # Sender Flange with 5 perimeter screws
    add_cylinder_to_bmesh(
        bm_tank,
        center=(send_x, send_y, send_z),
        radius=0.045,
        height=0.016,
        segments=14,
        axis='Z'
    )
    # Fuel Feed & Return Fitting Elbows
    add_cylinder_to_bmesh(
        bm_strap,
        center=(send_x + 0.018, send_y, send_z + 0.025),
        radius=0.009,
        height=0.035,
        segments=8,
        axis='Z'
    )
    add_cylinder_to_bmesh(
        bm_strap,
        center=(send_x - 0.018, send_y, send_z + 0.025),
        radius=0.009,
        height=0.035,
        segments=8,
        axis='Z'
    )
    
    finalize_bmesh_object(tank_obj, tank_mesh, bm_tank, 32.0)
    finalize_bmesh_object(strap_obj, strap_mesh, bm_strap, 32.0)
    finalize_bmesh_object(brk_obj, brk_mesh, bm_brk, 32.0)
    print("[SCANIA 142H] Subsystem 16: 400L D-shaped aluminum fuel tank built.")

# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 17: BATTERY ENCLOSURE, AIR TANKS & WABCO DRYER
# ----------------------------------------------------------------------------
def build_battery_box_air_tanks_and_wabco_dryer(parent, mats):
    """
    Constructs the passenger-side chassis equipment:
    - Stamped steel battery enclosure (dual 12V 220Ah batteries).
    - 4 cylindrical compressed air reservoir tanks with moisture drains.
    - Wabco desiccant-cartridge air dryer tower with pressure relief valve.
    Position: Passenger side (-X), Y = +0.700 m to +1.300 m, X = -0.820 m.
    """
    box_obj, box_mesh, bm_box = create_bmesh_object("Battery_SteelBox", mats['trim_black'], parent)
    air_obj, air_mesh, bm_air = create_bmesh_object("Pneumatics_AirTanks", mats['chassis_grey'], parent)
    dryer_obj, dryer_mesh, bm_dryer = create_bmesh_object("Pneumatics_WabcoDryer", mats['aluminum'], parent)
    hw_obj, hw_mesh, bm_hw = create_bmesh_object("Battery_Hardware", mats['chrome'], parent)
    
    box_x = -0.820 # Passenger side
    box_y = 0.980
    box_z = 0.740
    box_w = 0.620
    box_len = 0.720
    box_h = 0.480
    
    # 1. Stamped Steel Dual-Battery Carrier Box
    add_box_to_bmesh(
        bm_box,
        center=(box_x, box_y, box_z),
        dimensions=(box_w, box_len, box_h)
    )
    # Stamped Top Lid with Perimeter Lip
    add_box_to_bmesh(
        bm_box,
        center=(box_x, box_y, box_z + box_h * 0.5 + 0.015),
        dimensions=(box_w + 0.030, box_len + 0.030, 0.030)
    )
    # Dual Rubber T-Handle Quick Release Lid Latches
    for ly in [-0.220, 0.220]:
        add_cylinder_to_bmesh(
            bm_hw,
            center=(box_x - box_w * 0.5 - 0.012, box_y + ly, box_z + 0.120),
            radius=0.010,
            height=0.075,
            segments=8,
            axis='Z'
        )
        add_box_to_bmesh(
            bm_box,
            center=(box_x - box_w * 0.5 - 0.012, box_y + ly, box_z + 0.155),
            dimensions=(0.020, 0.045, 0.016)
        )
        
    # Main Heavy Commercial Battery Disconnect Master Switch (Red Rotary Key)
    add_cylinder_to_bmesh(
        bm_box,
        center=(box_x - box_w * 0.5 - 0.015, box_y, box_z + 0.050),
        radius=0.028,
        height=0.025,
        segments=12,
        axis='X'
    )
    add_box_to_bmesh(
        bm_hw,
        center=(box_x - box_w * 0.5 - 0.030, box_y, box_z + 0.050),
        dimensions=(0.014, 0.055, 0.022)
    )
    
    # 2. 4 Compressed Air Reservoir Tanks (30-Liter Seamless Steel Cylinders)
    # Tank Dimensions: Length 0.650 m, Radius 0.125 m
    # Tanks 1 & 2: Mounted beneath battery box
    tank_specs = [
        (-0.780, 0.720, 0.440, 'Y', 0.620),  # Under battery box front
        (-0.780, 1.140, 0.440, 'Y', 0.620),  # Under battery box rear
        (-0.250, 0.150, 0.880, 'X', 0.520),  # Inside frame rail middle
        ( 0.250, 0.150, 0.880, 'X', 0.520)   # Inside frame rail driver side
    ]
    
    for tx, ty, tz, taxis, tlen in tank_specs:
        add_cylinder_to_bmesh(
            bm_air,
            center=(tx, ty, tz),
            radius=0.120,
            height=tlen,
            segments=20,
            axis=taxis
        )
        # Domed Ends on Pressure Vessels
        if taxis == 'Y':
            for end_sign in [1, -1]:
                add_cone_to_bmesh(
                    bm_air,
                    center=(tx, ty + (tlen * 0.5) * end_sign, tz),
                    radius_base=0.120,
                    radius_top=0.040,
                    height=0.040,
                    segments=18,
                    axis='Y'
                )
            # Moisture Drain Valve Pull Ring (Bottom center of tank)
            add_tube_to_bmesh(
                bm_hw,
                center=(tx, ty, tz - 0.125),
                radius_outer=0.022,
                radius_inner=0.014,
                height=0.008,
                segments=12,
                axis='Y'
            )
        elif taxis == 'X':
            for end_sign in [1, -1]:
                add_cone_to_bmesh(
                    bm_air,
                    center=(tx + (tlen * 0.5) * end_sign, ty, tz),
                    radius_base=0.120,
                    radius_top=0.040,
                    height=0.040,
                    segments=18,
                    axis='X'
                )
                
    # 3. Wabco Desiccant Cartridge Air Dryer Tower
    # Mounted on passenger chassis rail behind cab (Y = 0.420 m, X = -0.480 m, Z = 0.820 m)
    dryer_x = -0.480
    dryer_y = 0.420
    dryer_z = 0.820
    # Cast Aluminum Base with Pressure Governor & Relief Valve
    add_box_to_bmesh(
        bm_dryer,
        center=(dryer_x, dryer_y, dryer_z - 0.120),
        dimensions=(0.160, 0.160, 0.120)
    )
    # Cylindrical Desiccant Spin-On Filter Cartridge
    add_cylinder_to_bmesh(
        bm_dryer,
        center=(dryer_x, dryer_y, dryer_z + 0.080),
        radius=0.075,
        height=0.260,
        segments=20,
        axis='Z'
    )
    # Top Domed Cap
    add_cone_to_bmesh(
        bm_dryer,
        center=(dryer_x, dryer_y, dryer_z + 0.220),
        radius_base=0.075,
        radius_top=0.030,
        height=0.030,
        segments=18,
        axis='Z'
    )
    # Purge Valve Exhaust Nozzle (Points downward)
    add_cylinder_to_bmesh(
        bm_hw,
        center=(dryer_x, dryer_y, dryer_z - 0.190),
        radius=0.018,
        height=0.050,
        segments=10,
        axis='Z'
    )
    
    finalize_bmesh_object(box_obj, box_mesh, bm_box, 32.0)
    finalize_bmesh_object(air_obj, air_mesh, bm_air, 32.0)
    finalize_bmesh_object(dryer_obj, dryer_mesh, bm_dryer, 32.0)
    finalize_bmesh_object(hw_obj, hw_mesh, bm_hw, 32.0)
    print("[SCANIA 142H] Subsystem 17: Battery enclosure, air tanks, and Wabco dryer built.")

# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 18: HORIZONTAL EXHAUST SILENCER & TAILPIPE
# ----------------------------------------------------------------------------
def build_horizontal_exhaust_silencer_and_tailpipe(parent, mats):
    """
    Constructs the 1980s European COE horizontal under-cab exhaust system:
    - Cylindrical exhaust silencer muffler mounted transversally behind front axle.
    - Perforated heat shield wrap around the silencer body.
    - Dual V8 manifold downpipes merging into silencer.
    - Swept downturn tailpipe exiting beneath the passenger battery box.
    """
    muff_obj, muff_mesh, bm_muff = create_bmesh_object("Exhaust_Silencer", mats['chassis_grey'], parent)
    pipe_obj, pipe_mesh, bm_pipe = create_bmesh_object("Exhaust_Tailpipe", mats['aluminum'], parent)
    shield_obj, shield_mesh, bm_shield = create_bmesh_object("Exhaust_HeatShield", mats['aluminum'], parent)
    
    muff_x = 0.0
    muff_y = 1.650 # Under cab floor behind front steer axle
    muff_z = 0.660
    muff_len = 0.880
    muff_r = 0.150 # 300 mm diameter muffler
    
    # 1. Transverse Cylindrical Exhaust Silencer Muffler Body
    add_cylinder_to_bmesh(
        bm_muff,
        center=(muff_x, muff_y, muff_z),
        radius=muff_r,
        height=muff_len,
        segments=24,
        axis='X'
    )
    # Stamped End Bells
    for end_sign in [1, -1]:
        add_cone_to_bmesh(
            bm_muff,
            center=(muff_x + (muff_len * 0.5) * end_sign, muff_y, muff_z),
            radius_base=muff_r,
            radius_top=0.060,
            height=0.035,
            segments=20,
            axis='X'
        )
        
    # 2. Perforated Outer Heat Shield Wrap
    add_tube_to_bmesh(
        bm_shield,
        center=(muff_x, muff_y, muff_z),
        radius_outer=muff_r + 0.020,
        radius_inner=muff_r + 0.012,
        height=muff_len * 0.85,
        segments=24,
        axis='X'
    )
    # Heat Shield Clamping Bands
    for b_off in [-0.300, 0.300]:
        add_tube_to_bmesh(
            bm_pipe,
            center=(muff_x + b_off, muff_y, muff_z),
            radius_outer=muff_r + 0.025,
            radius_inner=muff_r + 0.018,
            height=0.022,
            segments=24,
            axis='X'
        )
        
    # 3. Dual Exhaust Inlets from V8 Turbocharger Manifolds
    for side in [1, -1]:
        inlet_x = 0.220 * side
        add_cylinder_to_bmesh(
            bm_muff,
            center=(inlet_x, muff_y + 0.160, muff_z + 0.050),
            radius=0.050,
            height=0.180,
            segments=16,
            axis='Y'
        )
        
    # 4. Swept Downturn Exhaust Tailpipe (Exits beneath Passenger Battery Box)
    # Pipe runs from silencer passenger outlet (X = -0.450 m) to outer side (X = -0.920 m)
    pipe_out_x = -0.880
    pipe_out_y = 1.120
    pipe_out_z = 0.420
    # Horizontal run
    add_cylinder_to_bmesh(
        bm_pipe,
        center=(-0.660, 1.380, 0.550),
        radius=0.055,
        height=0.450,
        segments=16,
        axis='X'
    )
    # 45-Degree Downturn Swept Tailpipe Tip (Angled down and out)
    add_cylinder_to_bmesh(
        bm_pipe,
        center=(pipe_out_x, pipe_out_y, pipe_out_z),
        radius=0.058,
        height=0.220,
        segments=18,
        axis='Z'
    )
    # Hollow Bore Opening
    add_tube_to_bmesh(
        bm_pipe,
        center=(pipe_out_x, pipe_out_y, pipe_out_z - 0.100),
        radius_outer=0.058,
        radius_inner=0.050,
        height=0.025,
        segments=18,
        axis='Z'
    )
    
    finalize_bmesh_object(muff_obj, muff_mesh, bm_muff, 32.0)
    finalize_bmesh_object(pipe_obj, pipe_mesh, bm_pipe, 32.0)
    finalize_bmesh_object(shield_obj, shield_mesh, bm_shield, 32.0)
    print("[SCANIA 142H] Subsystem 18: Horizontal under-cab exhaust and tailpipe built.")

# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 19: PERFORATED ALUMINUM CATWALK & SUZIE AIRLINES
# ----------------------------------------------------------------------------
def build_perforated_catwalk_deck_and_suzie_lines(parent, mats):
    """
    Constructs the perforated aluminum catwalk deck plate and trailer umbilical lines:
    - Punched-tread aluminum catwalk deck plate between frame rails behind cab.
    - Suzie airline support pylon mast with 4 coiled elastic lines:
      * Red (Emergency trailer brake air line)
      * Yellow (Service trailer brake air line)
      * Black (24V 7-pin ISO 1185 lighting cable)
      * Green (24V 7-pin ISO 3731 auxiliary power cable)
    - Rear-facing halogen work spotlight on cab back wall.
    """
    deck_obj, deck_mesh, bm_deck = create_bmesh_object("Catwalk_AluminumDeck", mats['aluminum'], parent)
    pylon_obj, pylon_mesh, bm_pylon = create_bmesh_object("Catwalk_SuziePylon", mats['trim_black'], parent)
    spot_obj, spot_mesh, bm_spot = create_bmesh_object("Catwalk_WorkSpotlight", mats['emissive_headlight'], parent)
    gls_obj, gls_mesh, bm_gls = create_bmesh_object("Catwalk_SpotlightGlass", mats['glass_headlamp'], parent)
    
    deck_len = 1.050 # From Y = +0.400 m to Y = -0.650 m
    deck_y_mid = -0.125
    deck_w = 0.760  # Spans frame rails
    deck_z = 1.035  # Flush with top of chassis rails
    
    # 1. Punched-Tread Aluminum Catwalk Deck Plate
    add_box_to_bmesh(
        bm_deck,
        center=(0.0, deck_y_mid, deck_z),
        dimensions=(deck_w, deck_len, 0.025)
    )
    # Perforated Anti-Skid Drainage Dimples
    for row_y in range(12):
        y_pos = (deck_y_mid - deck_len * 0.45) + row_y * 0.080
        for col_x in range(8):
            x_pos = (-deck_w * 0.42) + col_x * 0.110
            add_cylinder_to_bmesh(
                bm_pylon,
                center=(x_pos, y_pos, deck_z + 0.014),
                radius=0.012,
                height=0.008,
                segments=8,
                axis='Z'
            )
            
    # Catwalk Side Safety Toe-Kick Flanges (Prevents driver's boot slipping off)
    for side in [1, -1]:
        add_box_to_bmesh(
            bm_deck,
            center=((deck_w * 0.5 - 0.010) * side, deck_y_mid, deck_z + 0.025),
            dimensions=(0.020, deck_len, 0.035)
        )
        
    # 2. Suzie Airline Support Pylon (Chrome/Black Mast at Y = +0.380 m)
    pylon_x = 0.320 # Driver side of chassis
    pylon_y = 0.380
    pylon_z_base = 1.040
    pylon_h = 0.920
    # Heavy Tubular Mast
    add_cylinder_to_bmesh(
        bm_pylon,
        center=(pylon_x, pylon_y, pylon_z_base + pylon_h * 0.5),
        radius=0.022,
        height=pylon_h,
        segments=14,
        axis='Z'
    )
    # Cable Hanger Cross-Bar & Spring Retention Hooks
    add_cylinder_to_bmesh(
        bm_pylon,
        center=(pylon_x, pylon_y, pylon_z_base + pylon_h),
        radius=0.012,
        height=0.320,
        segments=10,
        axis='X'
    )
    
    # 3. 4 Coiled Elastic Trailer Umbilical Cables ("Suzie Lines")
    # Red, Yellow, Black, Green
    suzie_data = [
        (pylon_x - 0.120, mats['suzie_red'],    "Red_EmergencyAir"),
        (pylon_x - 0.040, mats['suzie_yellow'], "Yellow_ServiceAir"),
        (pylon_x + 0.040, mats['suzie_black'],  "Black_ISO1185Lighting"),
        (pylon_x + 0.120, mats['suzie_green'],  "Green_AuxPower")
    ]
    
    for sx, smat, sname in suzie_data:
        s_obj, s_mesh, bm_s = create_bmesh_object(f"Suzie_{sname}", smat, parent)
        # Model coiled helix using alternating offset segments
        coil_len = 0.720
        num_turns = 16
        turn_pitch = coil_len / num_turns
        for t_idx in range(num_turns):
            tz = (pylon_z_base + pylon_h - 0.050) - t_idx * turn_pitch
            # Alternate offset creates coiled spring appearance
            ang = t_idx * 1.8
            ox = math.cos(ang) * 0.035
            oy = math.sin(ang) * 0.035
            add_cylinder_to_bmesh(
                bm_s,
                center=(sx + ox, pylon_y + oy - 0.100, tz),
                radius=0.010,
                height=turn_pitch * 1.15,
                segments=8,
                axis='Z'
            )
        # Cast Gladhand Air Coupling / Electrical Plug
        add_box_to_bmesh(
            bm_s,
            center=(sx, pylon_y - 0.220, pylon_z_base + 0.240),
            dimensions=(0.045, 0.080, 0.045)
        )
        finalize_bmesh_object(s_obj, s_mesh, bm_s, 32.0)
        
    # 4. Rear-Facing Halogen Work Spotlight (Aiming at Fifth Wheel)
    # Mounted on cab rear wall at X = -0.350 m, Y = 0.580 m, Z = 2.450 m
    spot_x = -0.350
    spot_y = 0.580
    spot_z = 2.450
    # Black Swivel Housing
    add_box_to_bmesh(
        bm_pylon,
        center=(spot_x, spot_y, spot_z),
        dimensions=(0.140, 0.100, 0.140),
        rot_euler=(math.radians(25.0), 0.0, 0.0) # Aimed down at 5th wheel
    )
    # Halogen Emissive Bulb Core
    add_cylinder_to_bmesh(
        bm_spot,
        center=(spot_x, spot_y - 0.035, spot_z - 0.015),
        radius=0.035,
        height=0.020,
        segments=14,
        axis='Y'
    )
    # Clear Polycarbonate Lens Face
    add_box_to_bmesh(
        bm_gls,
        center=(spot_x, spot_y - 0.052, spot_z - 0.022),
        dimensions=(0.120, 0.010, 0.120),
        rot_euler=(math.radians(25.0), 0.0, 0.0)
    )
    
    finalize_bmesh_object(deck_obj, deck_mesh, bm_deck, 32.0)
    finalize_bmesh_object(pylon_obj, pylon_mesh, bm_pylon, 32.0)
    finalize_bmesh_object(spot_obj, spot_mesh, bm_spot, 32.0)
    finalize_bmesh_object(gls_obj, gls_mesh, bm_gls, 32.0)
    print("[SCANIA 142H] Subsystem 19: Perforated catwalk deck and Suzie lines built.")

# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 20: EUROPEAN 3-PIECE REAR MUDGUARDS & ANTI-SPRAY FLAPS
# ----------------------------------------------------------------------------
def build_european_three_piece_rear_mudguards(parent, mats):
    """
    Constructs the European 3-piece thermoplastic rear mudguards and anti-spray flaps:
    - Modular 3-piece curved fenders over both tandem axles (Y = -0.925 m and -2.275 m).
    - Center horizontal bridge connector between axles.
    - Heavy tubular steel outrigger support brackets bolted to chassis rails.
    - Rear rubber anti-spray mudflaps with embossed white SCANIA GRIFFIN CREST.
    """
    guard_obj, guard_mesh, bm_guard = create_bmesh_object("Mudguards_ThermoPlastic", mats['trim_black'], parent)
    flap_obj, flap_mesh, bm_flap = create_bmesh_object("Mudguards_RubberFlaps", mats['mudflap'], parent)
    crest_obj, crest_mesh, bm_crest = create_bmesh_object("Mudguards_WhiteCrests", mats['white_paint'], parent)
    brk_obj, brk_mesh, bm_brk = create_bmesh_object("Mudguards_SupportBrackets", mats['chassis_grey'], parent)
    
    # Tandem Axle Centers
    y_axle1 = -0.925
    y_axle2 = -2.275
    tire_r = 0.5375
    guard_r = 0.620 # 620 mm radius arch
    guard_w = 0.660 # Spans dual wheels (Width 660 mm)
    
    for side in [1, -1]:
        gx = (0.900 + 1.230) * 0.5 * side # Centered over dual wheels (X = +/- 1.065 m)
        
        # =====================================================================
        # 1. FORWARD TANDEM AXLE MUDGUARD (Y = -0.925 m)
        # =====================================================================
        # Front Curved Quarter Shell
        add_tube_to_bmesh(
            bm_guard,
            center=(gx, y_axle1, 0.525),
            radius_outer=guard_r + 0.018,
            radius_inner=guard_r,
            height=guard_w,
            segments=28,
            axis='X'
        )
        # Top Horizontal Crown Bridge Plate
        add_box_to_bmesh(
            bm_guard,
            center=(gx, y_axle1, 0.525 + guard_r + 0.010),
            dimensions=(guard_w, 0.850, 0.020)
        )
        
        # =====================================================================
        # 2. REARWARD TANDEM AXLE MUDGUARD (Y = -2.275 m)
        # =====================================================================
        add_tube_to_bmesh(
            bm_guard,
            center=(gx, y_axle2, 0.525),
            radius_outer=guard_r + 0.018,
            radius_inner=guard_r,
            height=guard_w,
            segments=28,
            axis='X'
        )
        add_box_to_bmesh(
            bm_guard,
            center=(gx, y_axle2, 0.525 + guard_r + 0.010),
            dimensions=(guard_w, 0.850, 0.020)
        )
        
        # Center Bridge Joining the Two Axles
        bridge_y = (y_axle1 + y_axle2) * 0.5 # -1.600 m
        add_box_to_bmesh(
            bm_guard,
            center=(gx, bridge_y, 0.525 + guard_r + 0.010),
            dimensions=(guard_w, abs(y_axle1 - y_axle2) - 0.700, 0.020)
        )
        
        # 3. Heavy Tubular Steel Outrigger Support Arms (Bolted to Frame)
        for arm_y in [y_axle1 + 0.550, y_axle1 - 0.550, y_axle2 + 0.550, y_axle2 - 0.550]:
            add_cylinder_to_bmesh(
                bm_brk,
                center=((0.385 + 1.065) * 0.5 * side, arm_y, 0.880),
                radius=0.020,
                height=abs(1.065 - 0.385),
                segments=12,
                axis='X'
            )
            # Clamping Collar & Pinch Bolt
            add_cylinder_to_bmesh(
                bm_brk,
                center=(gx, arm_y, 0.880),
                radius=0.030,
                height=0.050,
                segments=12,
                axis='X'
            )
            
        # =====================================================================
        # 4. HEAVY RUBBER ANTI-SPRAY MUDFLAPS WITH SCANIA CREST
        # Mounted behind rearward tandem axle at Y = -2.850 m
        # =====================================================================
        flap_y = -2.860
        flap_z = 0.520
        flap_h = 0.580
        
        # Rubber Mudflap Sheet
        add_box_to_bmesh(
            bm_flap,
            center=(gx, flap_y, flap_z),
            dimensions=(guard_w - 0.040, 0.018, flap_h)
        )
        # Bottom Steel Anti-Sail Weight Bar
        add_box_to_bmesh(
            bm_brk,
            center=(gx, flap_y - 0.012, flap_z - flap_h * 0.48),
            dimensions=(guard_w - 0.020, 0.022, 0.045)
        )
        
        # Embossed White 'SCANIA' Block Lettering across mudflap
        add_box_to_bmesh(
            bm_crest,
            center=(gx, flap_y - 0.011, flap_z + 0.120),
            dimensions=(0.420, 0.008, 0.070)
        )
        # Embossed White Scania Griffin Crown Crest
        add_cylinder_to_bmesh(
            bm_crest,
            center=(gx, flap_y - 0.011, flap_z - 0.040),
            radius=0.075,
            height=0.008,
            segments=18,
            axis='Y'
        )
        # Griffin Crown Points
        add_box_to_bmesh(
            bm_crest,
            center=(gx, flap_y - 0.011, flap_z + 0.030),
            dimensions=(0.090, 0.008, 0.040)
        )
        
    finalize_bmesh_object(guard_obj, guard_mesh, bm_guard, 32.0)
    finalize_bmesh_object(flap_obj, flap_mesh, bm_flap, 32.0)
    finalize_bmesh_object(crest_obj, crest_mesh, bm_crest, 32.0)
    finalize_bmesh_object(brk_obj, brk_mesh, bm_brk, 32.0)
    print("[SCANIA 142H] Subsystem 20: European 3-piece rear mudguards and Scania mudflaps built.")



# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 21: REAR UNDERRUN PROTECTION & ECE 70 LIGHTING BAR
# ----------------------------------------------------------------------------
def build_rear_underrun_protection_and_lighting(parent, mats):
    """
    Constructs the ECE R58 rear underrun protection beam and European lighting bar:
    - Heavy tubular steel rear underrun crash beam (Z = 0.520 m, Y = -3.100 m, Width 2.300 m).
    - Vertical drop hanger brackets bolted to chassis rail tips.
    - 6-chamber Euro taillight clusters (tail/stop red, indicator amber, reverse clear, fog red).
    - ECE 70 reflective diagonal chevron warning marker plates.
    - Rear trailer hitch receiver and pneumatic gladhand connections.
    """
    beam_obj, beam_mesh, bm_beam = create_bmesh_object("RearUnderrun_SteelBeam", mats['trim_black'], parent)
    light_box_obj, light_box_mesh, bm_light_box = create_bmesh_object("Lighting_RearClusters", mats['trim_black'], parent)
    red_lens_obj, red_lens_mesh, bm_red_lens = create_bmesh_object("Lighting_TaillampRedGlass", mats['glass_red'], parent)
    amb_lens_obj, amb_lens_mesh, bm_amb_lens = create_bmesh_object("Lighting_TaillampAmberGlass", mats['glass_amber'], parent)
    rev_lens_obj, rev_lens_mesh, bm_rev_lens = create_bmesh_object("Lighting_TaillampReverseGlass", mats['glass_reverse'], parent)
    red_core_obj, red_core_mesh, bm_red_core = create_bmesh_object("Lighting_TailBrakeCore", mats['emissive_red'], parent)
    ece_obj, ece_mesh, bm_ece = create_bmesh_object("Lighting_ECE70Chevrons", mats['ece70_plate'], parent)
    
    beam_y = -3.100
    beam_z = 0.520
    beam_w = 2.300
    beam_h = 0.140
    
    # 1. ECE R58 Rear Underrun Protection Impact Beam
    add_box_to_bmesh(
        bm_beam,
        center=(0.0, beam_y, beam_z),
        dimensions=(beam_w, 0.080, beam_h)
    )
    # Heavy Tubular Steel Drop Hanger Brackets (Bolted to chassis rails)
    for side in [1, -1]:
        hang_x = 0.385 * side
        add_cylinder_to_bmesh(
            bm_beam,
            center=(hang_x, beam_y + 0.040, 0.760),
            radius=0.035,
            height=0.480,
            segments=16,
            axis='Z'
        )
        # Gusseted Mounting Flange
        add_box_to_bmesh(
            bm_beam,
            center=(hang_x, beam_y + 0.040, 0.980),
            dimensions=(0.120, 0.140, 0.040)
        )
        
    # 2. European 6-Chamber Rectangular Taillight Clusters
    # Position: X = +/- 0.850 m, Y = -3.060 m, Z = 0.640 m
    cluster_w = 0.440 # 440 mm wide cluster
    cluster_h = 0.140 # 140 mm tall
    cluster_d = 0.080
    
    for side in [1, -1]:
        cx = 0.860 * side
        cy = -3.060
        cz = 0.650
        
        # Black Cluster Housing Box
        add_box_to_bmesh(
            bm_light_box,
            center=(cx, cy, cz),
            dimensions=(cluster_w, cluster_d, cluster_h)
        )
        # Lens Chambers (From outer to inner):
        # Chamber 1: Amber Turn Indicator (Outer)
        add_box_to_bmesh(
            bm_amb_lens,
            center=(cx + 0.150 * side, cy - cluster_d * 0.5 - 0.005, cz),
            dimensions=(0.110, 0.012, cluster_h * 0.88)
        )
        # Chamber 2: Ruby Red Tail / Brake Lamp Core (Middle)
        add_box_to_bmesh(
            bm_red_core,
            center=(cx + 0.040 * side, cy - cluster_d * 0.5, cz),
            dimensions=(0.100, 0.010, cluster_h * 0.80)
        )
        add_box_to_bmesh(
            bm_red_lens,
            center=(cx + 0.040 * side, cy - cluster_d * 0.5 - 0.005, cz),
            dimensions=(0.110, 0.012, cluster_h * 0.88)
        )
        # Chamber 3: Clear Reverse Light
        add_box_to_bmesh(
            bm_rev_lens,
            center=(cx - 0.060 * side, cy - cluster_d * 0.5 - 0.005, cz + 0.025),
            dimensions=(0.090, 0.012, cluster_h * 0.42)
        )
        # Chamber 4: Intense Red Rear Fog Light
        add_box_to_bmesh(
            bm_red_lens,
            center=(cx - 0.060 * side, cy - cluster_d * 0.5 - 0.005, cz - 0.025),
            dimensions=(0.090, 0.012, cluster_h * 0.42)
        )
        # Chamber 5: License Plate Light (Inner edge)
        add_box_to_bmesh(
            bm_light_box,
            center=(cx - 0.150 * side, cy - cluster_d * 0.5 - 0.005, cz),
            dimensions=(0.070, 0.012, cluster_h * 0.88)
        )
        
        # Steel Wire Stone Guard Protective Grille
        for gy in [-0.040, 0.0, 0.040]:
            add_cylinder_to_bmesh(
                bm_light_box,
                center=(cx, cy - cluster_d * 0.5 - 0.016, cz + gy),
                radius=0.004,
                height=cluster_w * 0.95,
                segments=8,
                axis='X'
            )
            
    # 3. ECE 70 Rear Chevron Reflective Warning Marker Plates
    # Mandatory European diagonal red/yellow hatched reflective aluminum plates (0.565 x 0.140 m)
    for side in [1, -1]:
        ece_x = 0.520 * side
        add_box_to_bmesh(
            bm_ece,
            center=(ece_x, beam_y - 0.045, beam_z),
            dimensions=(0.540, 0.008, 0.125)
        )
        
    finalize_bmesh_object(beam_obj, beam_mesh, bm_beam, 32.0)
    finalize_bmesh_object(light_box_obj, light_box_mesh, bm_light_box, 32.0)
    finalize_bmesh_object(red_lens_obj, red_lens_mesh, bm_red_lens, 32.0)
    finalize_bmesh_object(amb_lens_obj, amb_lens_mesh, bm_amb_lens, 32.0)
    finalize_bmesh_object(rev_lens_obj, rev_lens_mesh, bm_rev_lens, 32.0)
    finalize_bmesh_object(red_core_obj, red_core_mesh, bm_red_core, 32.0)
    finalize_bmesh_object(ece_obj, ece_mesh, bm_ece, 32.0)
    print("[SCANIA 142H] Subsystem 21: Rear underrun protection and ECE 70 lighting built.")

# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 22: SCANIA TRANSMISSION & CARDAN DRIVELINE
# ----------------------------------------------------------------------------
def build_scania_transmission_and_cardan_driveline(parent, mats):
    """
    Constructs the Scania GR871 10-speed range-change transmission and driveshafts:
    - Cast iron clutch housing and 10-speed gearbox casing behind engine.
    - Rear planetary range-change auxiliary section.
    - Tubular Cardan driveshaft with center carrier bearing and universal joints.
    - Driveshaft safety containment loop.
    """
    gear_obj, gear_mesh, bm_gear = create_bmesh_object("Transmission_GR871Casing", mats['cast_iron'], parent)
    shaft_obj, shaft_mesh, bm_shaft = create_bmesh_object("Driveline_CardanShafts", mats['chassis_grey'], parent)
    
    trans_y_mid = 0.720
    trans_z = 0.720
    
    # 1. Scania GR871 Transmission Main Casing
    # Clutch Bellhousing (Flanged to V8 engine backplate)
    add_cone_to_bmesh(
        bm_gear,
        center=(0.0, 1.250, trans_z),
        radius_base=0.280,
        radius_top=0.230,
        height=0.220,
        segments=24,
        axis='Y'
    )
    # Main Gearbox Body
    add_box_to_bmesh(
        bm_gear,
        center=(0.0, 0.900, trans_z),
        dimensions=(0.420, 0.500, 0.440)
    )
    # Rear Planetary Range-Change Auxiliary Gearbox Casing
    add_cylinder_to_bmesh(
        bm_gear,
        center=(0.0, 0.520, trans_z),
        radius=0.190,
        height=0.280,
        segments=20,
        axis='Y'
    )
    # Pneumatic Range-Shift Solenoid Valve Block
    add_box_to_bmesh(
        bm_gear,
        center=(0.180, 0.580, trans_z + 0.160),
        dimensions=(0.100, 0.140, 0.120)
    )
    # Transmission Output Companion Flange Yoke
    add_cylinder_to_bmesh(
        bm_gear,
        center=(0.0, 0.350, trans_z),
        radius=0.075,
        height=0.060,
        segments=18,
        axis='Y'
    )
    
    # 2. Main Tubular Cardan Driveshaft (From Transmission to Forward Axle)
    # Y = +0.350 m to Y = -0.740 m (Length = 1.090 m)
    shaft_y_mid = (0.350 - 0.740) * 0.5 # -0.195 m
    shaft_len = 0.350 - (-0.740) # 1.090 m
    # Heavy 120mm Seamless Steel Driveshaft Tube
    add_cylinder_to_bmesh(
        bm_shaft,
        center=(0.0, shaft_y_mid, 0.620),
        radius=0.060,
        height=shaft_len * 0.78,
        segments=18,
        axis='Y'
    )
    
    # Universal Joints at Ends
    for uj_y in [0.320, -0.710]:
        add_box_to_bmesh(
            bm_gear,
            center=(0.0, uj_y, 0.620),
            dimensions=(0.120, 0.090, 0.120)
        )
        # Grease Zerk Nipple
        add_cylinder_to_bmesh(
            bm_gear,
            center=(0.0, uj_y, 0.685),
            radius=0.006,
            height=0.015,
            segments=8,
            axis='Z'
        )
        
    # Center Carrier Bearing Support Cross-Bridge & Rubber Pillow Block
    add_cylinder_to_bmesh(
        bm_gear,
        center=(0.0, -0.180, 0.620),
        radius=0.095,
        height=0.070,
        segments=20,
        axis='Y'
    )
    add_box_to_bmesh(
        bm_shaft,
        center=(0.0, -0.180, 0.720),
        dimensions=(0.770 - 0.040, 0.080, 0.040)
    )
    
    # Driveshaft Safety Containment Loop (Prevents road impact if U-joint breaks)
    add_tube_to_bmesh(
        bm_shaft,
        center=(0.0, -0.420, 0.620),
        radius_outer=0.115,
        radius_inner=0.095,
        height=0.035,
        segments=20,
        axis='Y'
    )
    
    finalize_bmesh_object(gear_obj, gear_mesh, bm_gear, 32.0)
    finalize_bmesh_object(shaft_obj, shaft_mesh, bm_shaft, 32.0)
    print("[SCANIA 142H] Subsystem 22: Transmission casing and Cardan driveline built.")

# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 23: PNEUMATIC BRAKE ACTUATORS & SLACK ADJUSTERS
# ----------------------------------------------------------------------------
def build_pneumatic_brake_actuators_and_slack_adjusters(parent, mats):
    """
    Constructs the commercial pneumatic brake actuation hardware:
    - Type 24 single diaphragm brake chambers on front steer axle.
    - 4x Type 24/30 dual diaphragm spring brake chambers on tandem drive axles.
    - S-cam shafts, Haldex automatic slack adjusters, and nylon airlines.
    """
    act_obj, act_mesh, bm_act = create_bmesh_object("Brakes_PneumaticActuators", mats['cast_iron'], parent)
    pipe_obj, pipe_mesh, bm_pipe = create_bmesh_object("Brakes_NylonAirlines", mats['trim_black'], parent)
    
    # 1. Front Steer Axle (Type 24 Single Diaphragm Chambers at Y = +2.200 m)
    y_front = 2.200
    for side in [1, -1]:
        bx = 0.820 * side
        bz = 0.580
        # Diaphragm Chamber Body
        add_cylinder_to_bmesh(
            bm_act,
            center=(bx, y_front - 0.120, bz),
            radius=0.085,
            height=0.110,
            segments=18,
            axis='Y'
        )
        # Pushrod & Clevis Pin
        add_cylinder_to_bmesh(
            bm_act,
            center=(bx, y_front - 0.050, bz),
            radius=0.012,
            height=0.120,
            segments=10,
            axis='Y'
        )
        # Manual Slack Adjuster Arm
        add_box_to_bmesh(
            bm_act,
            center=(bx, y_front, bz),
            dimensions=(0.035, 0.040, 0.140)
        )
        
    # 2. Tandem Drive Axles (4x Type 24/30 Dual Spring Brake Chambers)
    # Axle 1: Y = -0.925 m, Axle 2: Y = -2.275 m
    for ax_y in [-0.925, -2.275]:
        for side in [1, -1]:
            bx = 0.720 * side
            bz = 0.580
            # Service Brake Chamber (Front section)
            add_cylinder_to_bmesh(
                bm_act,
                center=(bx, ax_y + 0.120, bz),
                radius=0.090,
                height=0.120,
                segments=18,
                axis='Y'
            )
            # Emergency Spring Brake Piggyback Pot (Rear section with coil spring inside)
            add_cylinder_to_bmesh(
                bm_act,
                center=(bx, ax_y + 0.250, bz),
                radius=0.098,
                height=0.150,
                segments=18,
                axis='Y'
            )
            # Mechanical Caging Release Bolt on Rear
            add_cylinder_to_bmesh(
                bm_act,
                center=(bx, ax_y + 0.335, bz),
                radius=0.014,
                height=0.050,
                segments=8,
                axis='Y'
            )
            # Haldex Automatic Slack Adjuster Arm
            add_box_to_bmesh(
                bm_act,
                center=(bx, ax_y, bz),
                dimensions=(0.040, 0.045, 0.160)
            )
            # S-Cam Rotational Shaft
            add_cylinder_to_bmesh(
                bm_act,
                center=(bx, ax_y - 0.040, bz - 0.060),
                radius=0.020,
                height=0.140,
                segments=12,
                axis='X'
            )
            
    # 3. High-Pressure Nylon Brake Airlines along chassis rails
    for side in [1, -1]:
        pipe_x = 0.360 * side
        add_cylinder_to_bmesh(
            bm_pipe,
            center=(pipe_x, -0.200, 0.820),
            radius=0.010,
            height=2.800,
            segments=10,
            axis='Y'
        )
        
    finalize_bmesh_object(act_obj, act_mesh, bm_act, 32.0)
    finalize_bmesh_object(pipe_obj, pipe_mesh, bm_pipe, 32.0)
    print("[SCANIA 142H] Subsystem 23: Pneumatic brake actuators and slack adjusters built.")

# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 24: SLEEPER CAB LUGGAGE LOCKERS & TILT RAMS
# ----------------------------------------------------------------------------
def build_sleeper_cab_luggage_lockers_and_tilt_rams(parent, mats):
    """
    Constructs the sleeper cab exterior equipment:
    - Left and right under-bunk luggage locker compartment doors with flush rotary latches.
    - Rear cab observation window with rubber weatherseal gasket.
    - Dual hydraulic cab tilt rams and manual tilt hydraulic hand-pump.
    """
    cab_ext_obj, cab_ext_mesh, bm_cab_ext = create_bmesh_object("Cab_ExteriorHardware", mats['trim_black'], parent)
    chr_obj, chr_mesh, bm_chr = create_bmesh_object("Cab_LockerChrome", mats['chrome'], parent)
    gls_obj, gls_mesh, bm_gls = create_bmesh_object("Cab_RearWindowGlass", mats['glass_window'], parent)
    
    half_cw = 1.210
    
    # 1. Under-Bunk Exterior Luggage Locker Compartment Doors
    # Position: Behind cab doors on sleeper lower flanks (X = +/- 1.215 m, Y = 1.020 m, Z = 1.720 m)
    for side in [1, -1]:
        lx = (half_cw + 0.005) * side
        ly = 1.020
        lz = 1.720
        lw = 0.480
        lh = 0.360
        
        # Locker Door Rubber Perimeter Weatherseal Frame
        add_box_to_bmesh(
            bm_cab_ext,
            center=(lx, ly, lz),
            dimensions=(0.020, lw, lh)
        )
        # Recessed Center Door Panel
        add_box_to_bmesh(
            bm_cab_ext,
            center=(lx - 0.006 * side, ly, lz),
            dimensions=(0.015, lw - 0.040, lh - 0.040)
        )
        # Flush Rotary T-Handle Latch
        add_box_to_bmesh(
            bm_cab_ext,
            center=(lx + 0.005 * side, ly, lz),
            dimensions=(0.018, 0.110, 0.055)
        )
        # Chrome Key Lock Cylinder
        add_cylinder_to_bmesh(
            bm_chr,
            center=(lx + 0.010 * side, ly, lz),
            radius=0.012,
            height=0.015,
            segments=10,
            axis='X'
        )
        
    # 2. Rear Cab Observation Window (Centered on rear wall at Z = 2.450 m)
    r_win_y = 0.540
    r_win_z = 2.480
    r_win_w = 0.620
    r_win_h = 0.380
    # Rubber Gasket Surround
    add_box_to_bmesh(
        bm_cab_ext,
        center=(0.0, r_win_y, r_win_z),
        dimensions=(r_win_w + 0.040, 0.025, r_win_h + 0.040)
    )
    # Tinted Safety Glass Pane
    add_box_to_bmesh(
        bm_gls,
        center=(0.0, r_win_y - 0.005, r_win_z),
        dimensions=(r_win_w, 0.012, r_win_h)
    )
    
    # 3. Dual Hydraulic Cab Tilt Rams (Connected between Chassis and Cab Floor)
    # Position: Left and right front tilt points (X = +/- 0.440 m, Y = 2.360 m, Z = 0.950 m)
    for side in [1, -1]:
        rx = 0.440 * side
        ry = 2.360
        rz = 0.950
        # Hydraulic Cylinder Barrel
        add_cylinder_to_bmesh(
            bm_cab_ext,
            center=(rx, ry, rz),
            radius=0.035,
            height=0.320,
            segments=16,
            axis='Z'
        )
        # Hard Chrome Piston Rod
        add_cylinder_to_bmesh(
            bm_chr,
            center=(rx, ry, rz + 0.160),
            radius=0.020,
            height=0.220,
            segments=12,
            axis='Z'
        )
        # Swivel Clevis Eye Brackets
        add_cylinder_to_bmesh(
            bm_cab_ext,
            center=(rx, ry, rz - 0.160),
            radius=0.028,
            height=0.050,
            segments=12,
            axis='X'
        )
        
    # Manual Hydraulic Cab Tilt Hand-Pump with Operating Lever (Beside passenger steps)
    pump_x = -0.740 # Passenger side
    pump_y = 1.950
    pump_z = 0.880
    add_box_to_bmesh(
        bm_cab_ext,
        center=(pump_x, pump_y, pump_z),
        dimensions=(0.100, 0.120, 0.140)
    )
    # Removable Pump Lever Handle
    add_cylinder_to_bmesh(
        bm_chr,
        center=(pump_x - 0.040, pump_y, pump_z + 0.120),
        radius=0.012,
        height=0.320,
        segments=10,
        axis='Z'
    )
    
    finalize_bmesh_object(cab_ext_obj, cab_ext_mesh, bm_cab_ext, 32.0)
    finalize_bmesh_object(chr_obj, chr_mesh, bm_chr, 32.0)
    finalize_bmesh_object(gls_obj, gls_mesh, bm_gls, 32.0)
    print("[SCANIA 142H] Subsystem 24: Sleeper luggage lockers and tilt rams built.")

# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 25: ACOUSTIC NOISE ENCLOSURES & ROAD-SPRAY APRONS
# ----------------------------------------------------------------------------
def build_acoustic_engine_enclosure_and_spray_valances(parent, mats):
    """
    Constructs the European noise encapsulation package:
    - Acoustic composite engine enclosure skirts beneath cab floor.
    - Flexible rubber wheel-arch road spray aprons bridging cab and frame.
    - Lower engine belly pan acoustic splash shield.
    Complies with strict 1980s European 80 dB(A) drive-by noise regulations.
    """
    skirt_obj, skirt_mesh, bm_skirt = create_bmesh_object("Acoustic_NoiseEnclosures", mats['trim_black'], parent)
    
    # 1. Under-Cab Acoustic Encapsulation Skirts (Left and Right)
    # Seals engine noise compartment between cab floor sill and chassis rails
    for side in [1, -1]:
        skirt_x = 0.650 * side
        add_box_to_bmesh(
            bm_skirt,
            center=(skirt_x, 1.850, 1.250),
            dimensions=(0.040, 1.150, 0.350)
        )
        # Sound Dampening Embossed Ribs
        for r_y in [-0.350, 0.0, 0.350]:
            add_box_to_bmesh(
                bm_skirt,
                center=(skirt_x + 0.015 * side, 1.850 + r_y, 1.250),
                dimensions=(0.018, 0.060, 0.320)
            )
            
    # 2. Flexible Rubber Wheel-Arch Road-Spray Aprons
    # Curtains behind front steer wheels to stop dirty water spray from coating the engine
    for side in [1, -1]:
        apron_x = 0.720 * side
        add_box_to_bmesh(
            bm_skirt,
            center=(apron_x, 1.550, 0.850),
            dimensions=(0.018, 0.420, 0.540)
        )
        
    # 3. Lower Engine Belly Pan Sound Shield
    # Under engine sump between chassis rails (Y = +1.600 m to +2.400 m, Z = 0.480 m)
    add_box_to_bmesh(
        bm_skirt,
        center=(0.0, 2.000, 0.480),
        dimensions=(0.740, 0.780, 0.035)
    )
    # Drain Holes in Belly Pan
    for dx in [-0.180, 0.180]:
        add_cylinder_to_bmesh(
            bm_skirt,
            center=(dx, 2.000, 0.480),
            radius=0.035,
            height=0.040,
            segments=12,
            axis='Z'
        )
        
    finalize_bmesh_object(skirt_obj, skirt_mesh, bm_skirt, 32.0)
    print("[SCANIA 142H] Subsystem 25: Acoustic noise enclosures and spray aprons built.")

# ----------------------------------------------------------------------------
# 29. MASTER ASSEMBLY & DUAL-MODE GLB EXPORT PIPELINE
# ----------------------------------------------------------------------------
def build_complete_scania_142h():
    """
    Executes the comprehensive Class-A procedural generation of the
    1982-1985 Scania 142H V8 6x4 Super Heavy Haulage Tractor.
    Assembles all 25 procedural subsystems, calculates smooth normals,
    and exports canonical GLB files to target locations.
    """
    print("\n" + "="*80)
    print("EXECUTING PROCEDURAL GENERATION: SCANIA 142H V8 6x4 (1980s HEAVY TRUCK)")
    print("="*80)
    
    # 1. Reset Scene
    safe_reset_scene()
    
    # 2. Initialize Master Automotive PBR Materials
    mats = create_all_scania_materials()
    
    # 3. Create Root Hierarchy Object
    root_obj = bpy.data.objects.new("Scania_142H_V8_1980s", None)
    root_obj.empty_display_type = 'ARROWS'
    root_obj.empty_display_size = 1.0
    bpy.context.scene.collection.objects.link(root_obj)
    
    # 4. Sequentially Construct All 25 Exterior Subsystems
    print("[ASSEMBLY] Subsystem 1: Ladder Chassis Frame...")
    build_ladder_chassis_frame(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 2: AM740 Front Steer Axle & Suspension...")
    build_front_steer_axle_and_am740(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 3: Tandem Rear Hub Reduction Axles & Bogie...")
    build_tandem_rear_drive_axles_and_bogie(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 4: 10-Wheel Fleet & Planetary Hubs...")
    build_ten_wheel_fleet_and_hub_reduction(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 5: Jost JSK 37 C Fifth-Wheel Coupling...")
    build_jost_fifth_wheel_coupling(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 6: CR19 Sleeper Cab Shell & Air Suspension...")
    build_cr19_sleeper_cab_shell(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 7: Dual-Tier Front Grille & Authentic V8 Badges...")
    build_dual_tier_front_grille_and_badges(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 8: Aerodynamic Corner Deflectors...")
    build_aerodynamic_corner_deflectors(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 9: 3-Piece Steel Bumper & Lighting Array...")
    build_three_piece_steel_bumper_and_lighting(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 10: Panoramic Windshield & Three-Wiper Pantograph...")
    build_panoramic_windshield_and_three_wipers(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 11: Exterior Molded Sunvisor & Clearance Lights...")
    build_exterior_molded_sunvisor_and_clearance_lights(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 12: Adjustable Roof Aerofoil & Collar Wings...")
    build_adjustable_roof_aerofoil_and_collar_wings(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 13: Twin Hadley Chrome Air Horns & Antennas...")
    build_twin_hadley_horns_and_cb_antennas(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 14: Cab Doors, Flush Handles & European Mirrors...")
    build_cab_doors_flush_handles_and_mirrors(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 15: Stepped Entry Stirrup Footsteps & Grab Rails...")
    build_stepped_entry_footsteps_and_grab_rails(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 16: 400L D-Shaped Aluminum Fuel Tank...")
    build_400l_d_shaped_aluminum_fuel_tank(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 17: Battery Enclosure, Air Tanks & Wabco Dryer...")
    build_battery_box_air_tanks_and_wabco_dryer(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 18: Horizontal Under-Cab Exhaust & Tailpipe...")
    build_horizontal_exhaust_silencer_and_tailpipe(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 19: Catwalk Deck & Coiled Suzie Airlines...")
    build_perforated_catwalk_deck_and_suzie_lines(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 20: 3-Piece Rear Mudguards & Scania Mudflaps...")
    build_european_three_piece_rear_mudguards(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 21: Rear Underrun Protection & ECE 70 Lighting...")
    build_rear_underrun_protection_and_lighting(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 22: Transmission Casing & Cardan Driveline...")
    build_scania_transmission_and_cardan_driveline(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 23: Pneumatic Brake Actuators & Slack Adjusters...")
    build_pneumatic_brake_actuators_and_slack_adjusters(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 24: Sleeper Luggage Lockers & Tilt Rams...")
    build_sleeper_cab_luggage_lockers_and_tilt_rams(root_obj, mats)
    
    print("[ASSEMBLY] Subsystem 25: Acoustic Noise Skirts & Spray Valances...")
    build_acoustic_engine_enclosure_and_spray_valances(root_obj, mats)
    
    # 5. Scene Statistics & Validation
    total_objects = len([o for o in bpy.data.objects if o.type == 'MESH'])
    total_polys = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
    total_verts = sum(len(o.data.vertices) for o in bpy.data.objects if o.type == 'MESH')
    print("\n" + "-"*80)
    print(f"[ASSEMBLY COMPLETE] Total Meshes: {total_objects}")
    print(f"[ASSEMBLY COMPLETE] Total Polygons: {total_polys:,}")
    print(f"[ASSEMBLY COMPLETE] Total Vertices: {total_verts:,}")
    print("-"*80)
    
    # 6. Ensure Export Directories Exist
    for exp_dir in [PUBLIC_MODELS_DIR, EXPORTS_DIR, os.path.join(ROOT_DIR, "public", "models")]:
        os.makedirs(exp_dir, exist_ok=True)
        
    # 7. Select All Objects for Export
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.data.objects:
        obj.select_set(True)
        
    # 8. Export Canonical GLB Files
    export_targets = [
        CANONICAL_GLB_PATH,
        ARCHIVAL_GLB_PATH,
        ROOT_MODELS_GLB_PATH
    ]
    
    for glb_path in export_targets:
        print(f"[EXPORT] Exporting Class-A GLB to: {glb_path}")
        bpy.ops.export_scene.gltf(
            filepath=glb_path,
            export_format='GLB',
            use_selection=True,
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT',
            export_image_format='AUTO'
        )
        file_sz = os.path.getsize(glb_path)
        print(f"[EXPORT SUCCESS] File: {os.path.basename(glb_path)} ({file_sz / (1024*1024):.2f} MB)")
        
    print("="*80)
    print("SCANIA 142H V8 PROCEDURAL CAD GENERATION SUCCESSFUL!")
    print("="*80 + "\n")

if __name__ == "__main__":
    build_complete_scania_142h()

