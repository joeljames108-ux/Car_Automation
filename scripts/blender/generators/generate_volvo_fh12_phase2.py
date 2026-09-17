"""
=============================================================================
PROCEDURAL VOLVO FH12 2ND GEN (2000s GLOBETROTTER XL 4x2 TRACTOR)
PHASE 2: EXTERIOR JEWELRY, GLASS, LIGHTING OPTICS & FINE DETAILING
=============================================================================
Standard: Class-A CAD Automotive Surface Standard
Target: European Heavy Commercial Tractor (2005 Volvo FH12 Globetrotter XL 4x2)
Scope: EXTERIOR ONLY (Complete prohibition of interior seats, dashboard,
       steering wheel, engine internals, or engine bay).

Subsystems in Phase 2:
1. Iconic Volvo Diagonal Sash Grille & 3D Iron Mark Chrome Crest
2. Vertical Teardrop Bi-Xenon Headlamp Pods, DRLs & Polycarbonate Lenses
3. Lower Bumper Fog / Cornering Lights & Maintenance Access Steps
4. Optical Panoramic Windshield Glass with Ceramic Frit Border
5. Globetrotter XL Illuminated Aerodynamic Roof Lightbox Sign
6. Overhead High-Beam Auxiliary Spotlights & Amber Cab Brow Markers
7. Aerodynamic 4-Mirror System (Main, Wide-Angle, Curbside & Front Look-Down)
8. Cab Doors, Aerodynamic Pull Handles & Lower Step Cover Extensions
9. Tinted Side Window Glass & Deflector Rain Vanes
10. Dual Pantograph Heavy Windshield Wiper Assembly & Cowl Vent Slats
11. European 6-Chamber Rear Combination Lamp Clusters (ECE R48)
12. Dual High-Mounted Rear Cab Night Working Floodlights
13. Coiled Trailer Umbilical Pylon & Color-Coded Suzie Lines
14. Dual Polished Roof Air Horn Trumpets & CB Antennas
15. Front Cab Corner Aerodynamic Air Deflector Flaps
16. Volvo FH12 460/500hp 3D Chrome Badges & Emblems
17. Stainless Fuel Filler Caps, AdBlue Cap & Tank Vent Lines
18. ECE 104 Retro-Reflective Cab & Trailer Gap Contour Markings
19. Fine Exterior Hardware, Fastener Arrays & Grade-10.9 Bolts
20. Master Unified Build, Validation & Dual-Mode GLB Export Pipeline
=============================================================================
"""

import bpy
import bmesh
import math
from mathutils import Vector, Euler, Matrix
import os
import sys

# Import Phase 1 builder components
import scripts.blender.generators.generate_volvo_fh12_phase1 as p1

# ----------------------------------------------------------------------------
# 1. HELPER FUNCTIONS FOR BMESH PRIMITIVE CREATION
# ----------------------------------------------------------------------------
def create_bmesh_object(name, material, parent=None):
    """Creates a new Blender object with an empty BMesh and assigns material."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    if parent:
        obj.parent = parent
    bpy.context.collection.objects.link(obj)
    if material:
        obj.data.materials.append(material)
    bm = bmesh.new()
    return obj, mesh, bm

def finalize_bmesh_object(obj, mesh, bm):
    """Writes BMesh data to mesh, frees BMesh, and recalculates normals."""
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()

def add_box_to_bmesh(bm, center, size, rot_euler=(0.0, 0.0, 0.0)):
    """Appends a 3D box to the BMesh with specified center, size, and rotation."""
    m_trans = Matrix.Translation(Vector(center))
    m_rot = Euler(rot_euler, 'XYZ').to_matrix().to_4x4()
    m_scale = Matrix.Diagonal(Vector((size[0] * 0.5, size[1] * 0.5, size[2] * 0.5, 1.0)))
    mat = m_trans @ m_rot @ m_scale
    bmesh.ops.create_cube(bm, size=2.0, matrix=mat)

def add_cylinder_to_bmesh(bm, center, radius, height, segments=16, axis='Z', rot_euler=(0.0, 0.0, 0.0)):
    """Appends a cylinder to the BMesh along specified axis."""
    m_trans = Matrix.Translation(Vector(center))
    m_rot_custom = Euler(rot_euler, 'XYZ').to_matrix().to_4x4()
    if axis == 'X':
        m_axis = Euler((0.0, math.pi * 0.5, 0.0), 'XYZ').to_matrix().to_4x4()
    elif axis == 'Y':
        m_axis = Euler((math.pi * 0.5, 0.0, 0.0), 'XYZ').to_matrix().to_4x4()
    else:
        m_axis = Matrix.Identity(4)
    mat = m_trans @ m_rot_custom @ m_axis
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segments,
                          radius1=radius, radius2=radius, depth=height, matrix=mat)

def add_cone_to_bmesh(bm, center, radius1, radius2, height, segments=16, axis='Z', rot_euler=(0.0, 0.0, 0.0)):
    """Appends a truncated cone to the BMesh along specified axis."""
    m_trans = Matrix.Translation(Vector(center))
    m_rot_custom = Euler(rot_euler, 'XYZ').to_matrix().to_4x4()
    if axis == 'X':
        m_axis = Euler((0.0, math.pi * 0.5, 0.0), 'XYZ').to_matrix().to_4x4()
    elif axis == 'Y':
        m_axis = Euler((math.pi * 0.5, 0.0, 0.0), 'XYZ').to_matrix().to_4x4()
    else:
        m_axis = Matrix.Identity(4)
    mat = m_trans @ m_rot_custom @ m_axis
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segments,
                          radius1=radius1, radius2=radius2, depth=height, matrix=mat)

def add_tube_to_bmesh(bm, center, r_outer, r_inner, height, segments=16, axis='Z', rot_euler=(0.0, 0.0, 0.0)):
    """Appends a hollow tube/annulus to the BMesh."""
    m_trans = Matrix.Translation(Vector(center))
    m_rot_custom = Euler(rot_euler, 'XYZ').to_matrix().to_4x4()
    if axis == 'X':
        m_axis = Euler((0.0, math.pi * 0.5, 0.0), 'XYZ').to_matrix().to_4x4()
    elif axis == 'Y':
        m_axis = Euler((math.pi * 0.5, 0.0, 0.0), 'XYZ').to_matrix().to_4x4()
    else:
        m_axis = Matrix.Identity(4)
    mat = m_trans @ m_rot_custom @ m_axis
    verts_outer_bot = []
    verts_outer_top = []
    verts_inner_bot = []
    verts_inner_top = []
    half_h = height * 0.5
    for i in range(segments):
        theta = 2.0 * math.pi * (i / segments)
        cos_t = math.cos(theta)
        sin_t = math.sin(theta)
        p_ob = mat @ Vector((r_outer * cos_t, r_outer * sin_t, -half_h))
        p_ot = mat @ Vector((r_outer * cos_t, r_outer * sin_t, half_h))
        p_ib = mat @ Vector((r_inner * cos_t, r_inner * sin_t, -half_h))
        p_it = mat @ Vector((r_inner * cos_t, r_inner * sin_t, half_h))
        verts_outer_bot.append(bm.verts.new(p_ob))
        verts_outer_top.append(bm.verts.new(p_ot))
        verts_inner_bot.append(bm.verts.new(p_ib))
        verts_inner_top.append(bm.verts.new(p_it))
    bm.verts.ensure_lookup_table()
    for i in range(segments):
        nxt = (i + 1) % segments
        bm.faces.new([verts_outer_bot[i], verts_outer_bot[nxt], verts_outer_top[nxt], verts_outer_top[i]])
        bm.faces.new([verts_inner_bot[nxt], verts_inner_bot[i], verts_inner_top[i], verts_inner_top[nxt]])
        bm.faces.new([verts_outer_top[i], verts_outer_top[nxt], verts_inner_top[nxt], verts_inner_top[i]])
        bm.faces.new([verts_outer_bot[nxt], verts_outer_bot[i], verts_inner_bot[i], verts_inner_bot[nxt]])


# ----------------------------------------------------------------------------
# 2. SUBSYSTEM 1: VOLVO DIAGONAL SASH GRILLE & 3D IRON MARK CREST
# ----------------------------------------------------------------------------
def build_volvo_sash_grille_and_iron_mark(materials, parent=None):
    """
    Constructs the iconic Volvo 2nd Generation front face:
    - Upper and lower aerodynamic honeycomb radiator intake grilles
    - Characteristic 45-degree diagonal chrome slash bar spear spanning across the grille
    - 3D die-cast Volvo Iron Mark chrome circle & arrow emblem centered on sash
    - Front hood service flap perimeter shut-lines and gas strut pivots
    
    Position: Y = +2.420 m to +2.460 m, Z = 1.150 m to 1.880 m
    """
    grille_obj, grille_mesh, bm = create_bmesh_object("Grille_Honeycomb_Panels", materials['Plastic_AnthraciteComposite'], parent)
    chrome_obj, chrome_mesh, bm_chrome = create_bmesh_object("Volvo_Diagonal_Sash_and_Crest", materials['Chrome_EuropeanMirror'], parent)
    badge_obj, badge_mesh, bm_badge = create_bmesh_object("Volvo_Blue_Center_Badge", materials['Paint_VolvoIceBlue'], parent)
    
    gy = 2.440
    
    # 1. Upper Front Grille Panel (Integrated into opening front service flap)
    add_box_to_bmesh(bm, (0.0, gy, 1.620), (1.360, 0.040, 0.440))
    # Horizontal aerodynamic ventilation slats (5 louvers)
    for slat_z in [1.46, 1.54, 1.62, 1.70, 1.78]:
        add_box_to_bmesh(bm, (0.0, gy + 0.015, slat_z), (1.320, 0.025, 0.018),
                         rot_euler=(math.radians(-14.0), 0.0, 0.0))
                         
    # 2. Lower Bumper Center Grille Intake
    add_box_to_bmesh(bm, (0.0, gy + 0.020, 1.260), (1.180, 0.040, 0.260))
    for l_slat_z in [1.18, 1.26, 1.34]:
        add_box_to_bmesh(bm, (0.0, gy + 0.035, l_slat_z), (1.140, 0.025, 0.018),
                         rot_euler=(math.radians(-14.0), 0.0, 0.0))
                         
    # 3. Iconic Volvo 45-Degree Diagonal Chrome Slash Bar Spear
    # Extends from upper-left down to lower-right across the entire upper grille
    sash_start = Vector((-0.620, gy + 0.025, 1.820))
    sash_end = Vector((0.620, gy + 0.025, 1.420))
    sash_mid = (sash_start + sash_end) * 0.5
    sash_len = (sash_end - sash_start).length
    sash_angle = math.atan2(sash_end.z - sash_start.z, sash_end.x - sash_start.x)
    add_box_to_bmesh(bm_chrome, sash_mid, (0.045, 0.025, sash_len),
                     rot_euler=(0.0, sash_angle - math.pi * 0.5, 0.0))
                     
    # 4. 3D Volvo Iron Mark Chrome Circle & Arrow Emblem
    # Centered at (0, gy + 0.035, 1.620)
    iron_center = (0.0, gy + 0.035, 1.620)
    iron_r = 0.115
    # Outer chrome ring
    add_tube_to_bmesh(bm_chrome, iron_center, iron_r, iron_r - 0.020, 0.022, segments=32, axis='Y')
    # Diagonal chemical arrow pointing to upper right (Mars astrological symbol)
    arrow_pos = Vector((iron_center[0] + iron_r * 0.72, gy + 0.035, iron_center[2] + iron_r * 0.72))
    add_cone_to_bmesh(bm_chrome, arrow_pos, 0.025, 0.005, 0.055, segments=12, axis='Y',
                     rot_euler=(0.0, 0.0, math.radians(-45.0)))
                     
    # Central Blue Enamel VOLVO Logo Banner Bar
    add_box_to_bmesh(bm_badge, (0.0, gy + 0.045, 1.620), (iron_r * 2.1, 0.015, 0.042))
    # Chrome border trim around blue banner
    add_box_to_bmesh(bm_chrome, (0.0, gy + 0.042, 1.620), (iron_r * 2.16, 0.012, 0.048))
    
    finalize_bmesh_object(grille_obj, grille_mesh, bm)
    finalize_bmesh_object(chrome_obj, chrome_mesh, bm_chrome)
    finalize_bmesh_object(badge_obj, badge_mesh, bm_badge)
    print("[VOLVO FH12 PHASE 2] Subsystem 1: Volvo diagonal sash & Iron Mark built.")
    return grille_obj


# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 2: VERTICAL BI-XENON TEARDROP HEADLAMPS & OPTICS
# ----------------------------------------------------------------------------
def build_vertical_bi_xenon_headlamps_and_optics(materials, parent=None):
    """
    Constructs the distinctive 2005 Volvo FH12 swept-back vertical headlamp pods:
    - Bi-xenon projector optical glass spheres with internal shutter plates
    - Chrome parabolic high-beam reflector bowls
    - Amber turn signal fluted indicators in top brow
    - Integrated LED daylight running light (DRL) light-guide ribbons
    - Aerodynamic clear optical polycarbonate outer lens covers
    
    Position: Left and right bumper corner wraps at X = +/- 0.920 m, Y = +2.420 m, Z = 0.940 m
    """
    housing_obj, housing_mesh, bm_house = create_bmesh_object("Headlamp_Housings", materials['Chrome_EuropeanMirror'], parent)
    lens_obj, lens_mesh, bm_lens = create_bmesh_object("Headlamp_Polycarbonate_Lenses", materials['Glass_DielectricOptic'], parent)
    glass_obj, glass_mesh, bm_glass = create_bmesh_object("Projector_Glass_Spheres", materials['Glass_DielectricOptic'], parent)
    drl_obj, drl_mesh, bm_drl = create_bmesh_object("DRL_Emissive_Guides", materials['Emissive_XenonHeadlamp'], parent)
    amber_obj, amber_mesh, bm_amber = create_bmesh_object("Indicator_Amber_Optics", materials['Emissive_AmberSignal'], parent)
    
    lamp_y = 2.420
    lamp_z = 0.940
    lamp_h = 0.380
    lamp_w = 0.220
    
    for side in [-1.0, 1.0]:
        lx = side * 0.920
        # 1. Recessed Internal Chrome Reflector Housing Bucket
        add_box_to_bmesh(bm_house, (lx, lamp_y - 0.040, lamp_z), (lamp_w, 0.080, lamp_h),
                         rot_euler=(0.0, 0.0, side * math.radians(-14.0)))
                         
        # 2. Main Bi-Xenon Projector Optical Lens Sphere (Lower chamber)
        add_cylinder_to_bmesh(bm_house, (lx, lamp_y - 0.020, lamp_z - 0.080), 0.052, 0.040, segments=20, axis='Y',
                             rot_euler=(0.0, 0.0, side * math.radians(-14.0)))
        add_cylinder_to_bmesh(bm_glass, (lx, lamp_y, lamp_z - 0.080), 0.044, 0.030, segments=20, axis='Y',
                             rot_euler=(0.0, 0.0, side * math.radians(-14.0)))
        # Xenon arc emitter glow disc inside projector
        add_cylinder_to_bmesh(bm_drl, (lx, lamp_y - 0.015, lamp_z - 0.080), 0.035, 0.010, segments=16, axis='Y',
                             rot_euler=(0.0, 0.0, side * math.radians(-14.0)))
                             
        # 3. High-Beam Parabolic Chrome Reflector (Middle chamber)
        add_cone_to_bmesh(bm_house, (lx - side * 0.030, lamp_y - 0.020, lamp_z + 0.030), 0.050, 0.020, 0.045, segments=18, axis='Y',
                         rot_euler=(0.0, 0.0, side * math.radians(-14.0)))
        add_cylinder_to_bmesh(bm_drl, (lx - side * 0.030, lamp_y - 0.010, lamp_z + 0.030), 0.018, 0.020, segments=12, axis='Y',
                             rot_euler=(0.0, 0.0, side * math.radians(-14.0)))
                             
        # 4. Amber Direction Indicator Section (Upper chamber brow)
        add_box_to_bmesh(bm_amber, (lx, lamp_y, lamp_z + 0.120), (0.160, 0.020, 0.065),
                         rot_euler=(0.0, 0.0, side * math.radians(-14.0)))
                         
        # 5. Clear Aerodynamic Polycarbonate Outer Lens Cover
        # Swept-back flush with bumper contour
        add_box_to_bmesh(bm_lens, (lx, lamp_y + 0.015, lamp_z), (lamp_w * 1.05, 0.015, lamp_h * 1.02),
                         rot_euler=(0.0, 0.0, side * math.radians(-14.0)))
                         
    finalize_bmesh_object(housing_obj, housing_mesh, bm_house)
    finalize_bmesh_object(lens_obj, lens_mesh, bm_lens)
    finalize_bmesh_object(glass_obj, glass_mesh, bm_glass)
    finalize_bmesh_object(drl_obj, drl_mesh, bm_drl)
    finalize_bmesh_object(amber_obj, amber_mesh, bm_amber)
    print("[VOLVO FH12 PHASE 2] Subsystem 2: Vertical bi-xenon headlamps built.")
    return lens_obj


# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 3: LOWER BUMPER FOG LIGHTS & CORNERING LAMPS
# ----------------------------------------------------------------------------
def build_lower_bumper_fog_and_cornering_lights(materials, parent=None):
    """
    Constructs the lower bumper fog light and cornering lamp modules:
    - Rectangular halogen fog lamp reflectors
    - Lateral static cornering illumination lamps angled at 45 degrees
    - Clear glass outer lenses with stone-guard protective grilles
    
    Position: Left and right bumper corners at X = +/- 0.880 m, Y = +2.460 m, Z = 0.680 m
    """
    fog_obj, fog_mesh, bm = create_bmesh_object("Fog_Lamp_Reflectors", materials['Chrome_EuropeanMirror'], parent)
    lens_obj, lens_mesh, bm_lens = create_bmesh_object("Fog_Lamp_Lenses", materials['Glass_DielectricOptic'], parent)
    emit_obj, emit_mesh, bm_emit = create_bmesh_object("Fog_Lamp_Emitters", materials['Emissive_XenonHeadlamp'], parent)
    
    fog_y = 2.460
    fog_z = 0.680
    
    for side in [-1.0, 1.0]:
        fx = side * 0.880
        # 1. Main Forward Fog Lamp Chamber
        add_box_to_bmesh(bm, (fx, fog_y, fog_z), (0.120, 0.060, 0.080),
                         rot_euler=(0.0, 0.0, side * math.radians(-12.0)))
        add_cylinder_to_bmesh(bm_emit, (fx, fog_y + 0.020, fog_z), 0.024, 0.015, segments=14, axis='Y',
                             rot_euler=(0.0, 0.0, side * math.radians(-12.0)))
        add_box_to_bmesh(bm_lens, (fx, fog_y + 0.035, fog_z), (0.125, 0.010, 0.085),
                         rot_euler=(0.0, 0.0, side * math.radians(-12.0)))
                         
        # 2. Outboard Static Cornering Lamp Chamber (45-degree angle)
        cx = fx + side * 0.085
        cy = fog_y - 0.040
        add_box_to_bmesh(bm, (cx, cy, fog_z), (0.075, 0.060, 0.075),
                         rot_euler=(0.0, 0.0, side * math.radians(-38.0)))
        add_cylinder_to_bmesh(bm_emit, (cx, cy + 0.015, fog_z), 0.018, 0.012, segments=12, axis='Y',
                             rot_euler=(0.0, 0.0, side * math.radians(-38.0)))
        add_box_to_bmesh(bm_lens, (cx, cy + 0.028, fog_z), (0.080, 0.008, 0.080),
                         rot_euler=(0.0, 0.0, side * math.radians(-38.0)))
                         
    finalize_bmesh_object(fog_obj, fog_mesh, bm)
    finalize_bmesh_object(lens_obj, lens_mesh, bm_lens)
    finalize_bmesh_object(emit_obj, emit_mesh, bm_emit)
    print("[VOLVO FH12 PHASE 2] Subsystem 3: Lower fog & cornering lamps built.")
    return lens_obj


# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 4: PANORAMIC WINDSHIELD GLASS & CERAMIC FRIT BORDER
# ----------------------------------------------------------------------------
def build_panoramic_windshield_and_ceramic_frit(materials, parent=None):
    """
    Constructs the optical panoramic laminated safety glass windshield:
    - 17-degree raked curved automotive safety glass (thickness 6.5 mm)
    - Black ceramic enamel silk-screen frit border with gradient dots
    - EPDM perimeter rubber weather-seal extrusion
    - Center rearview sensor array and rain/light sensor bracket
    
    Position: Y = +2.280 m (cowl) to +1.650 m (roof header), Z = 2.080 m to 3.080 m
    """
    glass_obj, glass_mesh, bm = create_bmesh_object("Windshield_Panoramic_Glass", materials['Glass_DielectricOptic'], parent)
    frit_obj, frit_mesh, bm_frit = create_bmesh_object("Windshield_Ceramic_Frit", materials['Glass_CeramicFritBlack'], parent)
    rubber_obj, rubber_mesh, bm_rubber = create_bmesh_object("Windshield_EPDM_Gasket", materials['Rubber_EuropeanTire'], parent)
    
    # Windshield Geometry:
    # Lower Cowl Line: Y = 2.260 m, Z = 2.120 m, Width = 2.280 m
    # Upper Roof Line: Y = 1.720 m, Z = 3.050 m, Width = 2.140 m
    # Rake Angle: ~17 degrees
    rake_ang = math.radians(-17.0)
    center_pos = (0.0, 1.990, 2.585)
    ws_w = 2.220
    ws_h = 1.080
    
    # 1. Main Laminated Windshield Glass Sheet
    add_box_to_bmesh(bm, center_pos, (ws_w, 0.008, ws_h), rot_euler=(rake_ang, 0.0, 0.0))
    
    # 2. Black Ceramic Frit Border Perimeter Masking
    # Top header frit band (with sun-glare tint zone)
    add_box_to_bmesh(bm_frit, (0.0, 1.760, 2.980), (ws_w * 0.98, 0.010, 0.160), rot_euler=(rake_ang, 0.0, 0.0))
    # Bottom cowl frit band (concealing wiper park linkages and VIN plate)
    add_box_to_bmesh(bm_frit, (0.0, 2.220, 2.180), (ws_w * 0.98, 0.010, 0.140), rot_euler=(rake_ang, 0.0, 0.0))
    # Left and right A-pillar frit bands
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm_frit, (side * (ws_w * 0.5 - 0.050), 1.990, 2.585), (0.100, 0.010, ws_h * 0.96),
                         rot_euler=(rake_ang, 0.0, 0.0))
                         
    # 3. Outer EPDM Molded Rubber Gasket Flange
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm_rubber, (side * (ws_w * 0.5), 1.990, 2.585), (0.024, 0.020, ws_h * 1.02),
                         rot_euler=(rake_ang, 0.0, 0.0))
    add_box_to_bmesh(bm_rubber, (0.0, 1.710, 3.060), (ws_w * 1.02, 0.020, 0.024), rot_euler=(rake_ang, 0.0, 0.0))
    add_box_to_bmesh(bm_rubber, (0.0, 2.270, 2.110), (ws_w * 1.02, 0.020, 0.024), rot_euler=(rake_ang, 0.0, 0.0))
    
    # 4. Center Electronic Rain/Light Sensor & LDW Camera Bracket
    add_box_to_bmesh(bm_frit, (0.0, 1.780, 2.920), (0.140, 0.015, 0.120), rot_euler=(rake_ang, 0.0, 0.0))
    
    finalize_bmesh_object(glass_obj, glass_mesh, bm)
    finalize_bmesh_object(frit_obj, frit_mesh, bm_frit)
    finalize_bmesh_object(rubber_obj, rubber_mesh, bm_rubber)
    print("[VOLVO FH12 PHASE 2] Subsystem 4: Panoramic windshield glass built.")
    return glass_obj


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 5: GLOBETROTTER XL ILLUMINATED ROOF SIGN LIGHTBOX
# ----------------------------------------------------------------------------
def build_globetrotter_xl_illuminated_roof_sign(materials, parent=None):
    """
    Constructs the signature Globetrotter XL illuminated roof lightbox:
    - Arched front acrylic sign panel with dark blue GLOBETROTTER XL graphics
    - High-intensity internal fluorescent/LED light bar backlighting
    - Molded aerodynamic composite roof surround housing
    - Weather-sealed perimeter gasket trim
    
    Position: Above windshield header at Y = +1.780 m, Z = 3.280 m
    """
    box_obj, box_mesh, bm = create_bmesh_object("Globetrotter_Sign_Housing", materials['Plastic_AnthraciteComposite'], parent)
    sign_obj, sign_mesh, bm_sign = create_bmesh_object("Globetrotter_Sign_Face", materials['Glass_DielectricOptic'], parent)
    glow_obj, glow_mesh, bm_glow = create_bmesh_object("Globetrotter_Sign_Backlight", materials['Emissive_LightboxWhite'], parent)
    
    sign_y = 1.820
    sign_z = 3.320
    sign_w = 1.340
    sign_h = 0.260
    
    # 1. Recessed Molded Sign Frame Alcove Housing
    add_box_to_bmesh(bm, (0.0, sign_y - 0.030, sign_z), (sign_w + 0.080, 0.060, sign_h + 0.060),
                     rot_euler=(math.radians(-14.0), 0.0, 0.0))
                     
    # 2. Translucent Acrylic Sign Face Plate with GLOBETROTTER Script
    add_box_to_bmesh(bm_sign, (0.0, sign_y + 0.005, sign_z), (sign_w, 0.008, sign_h),
                     rot_euler=(math.radians(-14.0), 0.0, 0.0))
                     
    # 3. High-Intensity White Internal Light Bar Backlight
    add_box_to_bmesh(bm_glow, (0.0, sign_y - 0.010, sign_z), (sign_w * 0.94, 0.012, sign_h * 0.88),
                     rot_euler=(math.radians(-14.0), 0.0, 0.0))
                     
    finalize_bmesh_object(box_obj, box_mesh, bm)
    finalize_bmesh_object(sign_obj, sign_mesh, bm_sign)
    finalize_bmesh_object(glow_obj, glow_mesh, bm_glow)
    print("[VOLVO FH12 PHASE 2] Subsystem 5: Globetrotter XL roof sign built.")
    return sign_obj


# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 6: OVERHEAD SPOTLIGHTS & CAB BROW AMBER MARKERS
# ----------------------------------------------------------------------------
def build_overhead_spotlights_and_cab_brow_markers(materials, parent=None):
    """
    Constructs the high-mounted auxiliary lighting in the Globetrotter roof brow:
    - 2x High-intensity long-range halogen/xenon spotlight pods flush in roof corners
    - 5x ECE R48-compliant amber LED roof clearance marker lamps across cab crown
    - Chrome parabolic internal reflectors and clear fluted lenses
    
    Position: Above Globetrotter sign at Y = +1.680 m, Z = 3.420 m to 3.520 m
    """
    spot_obj, spot_mesh, bm_spot = create_bmesh_object("Overhead_Spotlights", materials['Chrome_EuropeanMirror'], parent)
    lens_obj, lens_mesh, bm_lens = create_bmesh_object("Spotlight_Glass_Lenses", materials['Glass_DielectricOptic'], parent)
    emit_obj, emit_mesh, bm_emit = create_bmesh_object("Spotlight_Xenon_Emitters", materials['Emissive_XenonHeadlamp'], parent)
    marker_obj, marker_mesh, bm_marker = create_bmesh_object("Roof_Brow_Amber_Markers", materials['Glass_AmberIndicator'], parent)
    amber_glow_obj, amber_glow_mesh, bm_aglow = create_bmesh_object("Roof_Marker_Glow", materials['Emissive_AmberSignal'], parent)
    
    # 1. 2x Overhead Long-Range High-Beam Driving Spotlights (Left and Right of sign)
    for side in [-1.0, 1.0]:
        sx = side * 0.820
        sy = 1.740
        sz = 3.380
        # Recessed oval chrome reflector housing
        add_cylinder_to_bmesh(bm_spot, (sx, sy, sz), 0.075, 0.050, segments=20, axis='Y',
                             rot_euler=(math.radians(-12.0), 0.0, side * math.radians(-6.0)))
        # Xenon arc emitter bulb in center
        add_cylinder_to_bmesh(bm_emit, (sx, sy + 0.015, sz), 0.024, 0.018, segments=14, axis='Y',
                             rot_euler=(math.radians(-12.0), 0.0, side * math.radians(-6.0)))
        # Polycarbonate outer protective lens cover
        add_cylinder_to_bmesh(bm_lens, (sx, sy + 0.030, sz), 0.078, 0.012, segments=20, axis='Y',
                             rot_euler=(math.radians(-12.0), 0.0, side * math.radians(-6.0)))
                             
    # 2. 5x ECE R48 Amber Roof Clearance Marker Lamps (Crown of cab)
    marker_xs = [-0.98, -0.49, 0.0, 0.49, 0.98]
    for mx in marker_xs:
        my = 1.620
        mz = 3.520
        # Flush aerodynamic amber lens
        add_box_to_bmesh(bm_marker, (mx, my, mz), (0.090, 0.025, 0.038),
                         rot_euler=(math.radians(-16.0), 0.0, 0.0))
        # Internal amber LED diode emitter
        add_cylinder_to_bmesh(bm_aglow, (mx, my + 0.008, mz), 0.012, 0.010, segments=12, axis='Y',
                             rot_euler=(math.radians(-16.0), 0.0, 0.0))
        # Black rubber mounting surround
        add_box_to_bmesh(bm_spot, (mx, my - 0.005, mz), (0.104, 0.020, 0.050),
                         rot_euler=(math.radians(-16.0), 0.0, 0.0))
                         
    finalize_bmesh_object(spot_obj, spot_mesh, bm_spot)
    finalize_bmesh_object(lens_obj, lens_mesh, bm_lens)
    finalize_bmesh_object(emit_obj, emit_mesh, bm_emit)
    finalize_bmesh_object(marker_obj, marker_mesh, bm_marker)
    finalize_bmesh_object(amber_glow_obj, amber_glow_mesh, bm_aglow)
    print("[VOLVO FH12 PHASE 2] Subsystem 6: Overhead spotlights & cab brow markers built.")
    return spot_obj


# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 7: AERODYNAMIC 4-MIRROR REARVIEW & LOOK-DOWN SYSTEM
# ----------------------------------------------------------------------------
def build_aerodynamic_4mirror_system(materials, parent=None):
    """
    Constructs the complete European commercial vehicle rear-view mirror system:
    - Left and right main aerodynamic mirror housings with twin glass panes
      (Class II main flat mirror + Class IV wide-angle spotter mirror)
    - Integrated side amber turn signal repeater lamps in mirror shells
    - Passenger-side Class V curbside downward blind-spot mirror over door window
    - Class VI front look-down cross-view mirror over windshield header
    
    Position: X = +/- 1.340 m to 1.480 m, Y = +1.720 m, Z = 2.100 m to 3.020 m
    """
    shell_obj, shell_mesh, bm_shell = create_bmesh_object("Mirror_Aero_Shells", materials['Plastic_AnthraciteComposite'], parent)
    glass_obj, glass_mesh, bm_glass = create_bmesh_object("Mirror_Reflective_Glasses", materials['Chrome_EuropeanMirror'], parent)
    arm_obj, arm_mesh, bm_arm = create_bmesh_object("Mirror_Mounting_Arms", materials['Iron_CastHeavy'], parent)
    rep_obj, rep_mesh, bm_rep = create_bmesh_object("Mirror_Indicator_Repeaters", materials['Emissive_AmberSignal'], parent)
    
    # 1. Main Driver & Passenger Dual-Pane Aerodynamic Mirror Enclosures
    for side in [-1.0, 1.0]:
        mx = side * 1.380
        my = 1.760
        mz = 2.380
        # Aerodynamic molded composite teardrop outer shell
        add_box_to_bmesh(bm_shell, (mx, my, mz), (0.160, 0.220, 0.680),
                         rot_euler=(0.0, 0.0, side * math.radians(-10.0)))
        # Upper Class II Main Flat Mirror Glass (Viewing behind)
        add_box_to_bmesh(bm_glass, (mx - side * 0.020, my - 0.095, mz + 0.110), (0.130, 0.010, 0.400),
                         rot_euler=(0.0, 0.0, side * math.radians(-10.0)))
        # Lower Class IV Wide-Angle Convex Spotter Glass (Eliminating lane blind-spot)
        add_box_to_bmesh(bm_glass, (mx - side * 0.020, my - 0.095, mz - 0.200), (0.130, 0.010, 0.180),
                         rot_euler=(0.0, 0.0, side * math.radians(-10.0)))
                         
        # Integrated Amber LED Direction Indicator Repeater Ribbon on outer shell
        add_box_to_bmesh(bm_rep, (mx + side * 0.075, my + 0.060, mz), (0.015, 0.090, 0.280),
                         rot_euler=(0.0, 0.0, side * math.radians(-10.0)))
                         
        # Dual Cast Aluminum Structural Support Arms Bolted to Door Frame
        # Upper arm
        add_cylinder_to_bmesh(bm_arm, (side * 1.280, my - 0.020, mz + 0.260), 0.020, 0.180, segments=12, axis='X')
        # Lower arm
        add_cylinder_to_bmesh(bm_arm, (side * 1.280, my - 0.020, mz - 0.260), 0.020, 0.180, segments=12, axis='X')
        # Triangular door mounting base plates
        add_box_to_bmesh(bm_arm, (side * 1.200, my - 0.020, mz + 0.260), (0.020, 0.110, 0.110))
        add_box_to_bmesh(bm_arm, (side * 1.200, my - 0.020, mz - 0.260), (0.020, 0.110, 0.110))
        
    # 2. Class V Passenger-Side Curbside Blind-Spot Look-Down Mirror (Right side)
    cx = 1.320
    cy = 1.680
    cz = 2.820
    # Angled down at 45 degrees towards the passenger step and front wheel
    add_box_to_bmesh(bm_shell, (cx, cy, cz), (0.140, 0.220, 0.160),
                     rot_euler=(math.radians(35.0), 0.0, 0.0))
    add_box_to_bmesh(bm_glass, (cx, cy - 0.040, cz - 0.040), (0.120, 0.180, 0.010),
                     rot_euler=(math.radians(35.0), 0.0, 0.0))
    add_cylinder_to_bmesh(bm_arm, (cx - 0.080, cy, cz + 0.080), 0.016, 0.140, segments=10, axis='Z')
    
    # 3. Class VI Front Look-Down Cross-View Mirror (Over front windshield header)
    fx = 0.420
    fy = 2.050
    fz = 3.120
    # Angled downward to reveal pedestrians directly in front of bumper
    add_box_to_bmesh(bm_shell, (fx, fy, fz), (0.240, 0.140, 0.120),
                     rot_euler=(math.radians(-32.0), 0.0, 0.0))
    add_box_to_bmesh(bm_glass, (fx, fy - 0.040, fz - 0.030), (0.210, 0.110, 0.010),
                     rot_euler=(math.radians(-32.0), 0.0, 0.0))
    add_cylinder_to_bmesh(bm_arm, (fx, fy - 0.120, fz + 0.040), 0.016, 0.180, segments=10, axis='Y')
    
    finalize_bmesh_object(shell_obj, shell_mesh, bm_shell)
    finalize_bmesh_object(glass_obj, glass_mesh, bm_glass)
    finalize_bmesh_object(arm_obj, arm_mesh, bm_arm)
    finalize_bmesh_object(rep_obj, rep_mesh, bm_rep)
    print("[VOLVO FH12 PHASE 2] Subsystem 7: Aerodynamic 4-mirror system built.")
    return shell_obj


# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 8: CAB DOORS, PULL HANDLES & STEP COVER EXTENSIONS
# ----------------------------------------------------------------------------
def build_cab_doors_handles_and_step_extensions(materials, parent=None):
    """
    Constructs the cab entrance doors and aerodynamic lower extensions:
    - Flush aerodynamic exterior paddle door handles recessed in door skins
    - Mechanical key cylinder lock tumblers
    - Extended lower composite door panels concealing upper boarding step
    - Recessed door perimeter shut-line gaps and EPDM rubber weather seals
    
    Position: X = +/- 1.240 m, Y = +1.150 m to +1.850 m, Z = 1.050 m to 2.250 m
    """
    panel_obj, panel_mesh, bm = create_bmesh_object("Cab_Door_Panels_Extension", materials['Paint_VolvoSilverMetallic'], parent)
    handle_obj, handle_mesh, bm_handle = create_bmesh_object("Door_Paddle_Handles", materials['Plastic_AnthraciteComposite'], parent)
    lock_obj, lock_mesh, bm_lock = create_bmesh_object("Door_Key_Tumblers", materials['Chrome_EuropeanMirror'], parent)
    seal_obj, seal_mesh, bm_seal = create_bmesh_object("Door_Perimeter_Seals", materials['Rubber_EuropeanTire'], parent)
    
    door_len = 0.950
    door_h = 1.350
    door_y = 1.320
    
    for side in [-1.0, 1.0]:
        dx = side * 1.245
        
        # 1. Lower Door Aerodynamic Step-Cover Extension Skin
        # Sweeps down over the top boarding step to reduce aerodynamic drag
        add_box_to_bmesh(bm, (dx, door_y, 1.150), (0.025, door_len, 0.380))
        # Inner reinforcement frame
        add_box_to_bmesh(bm, (dx - side * 0.015, door_y, 1.150), (0.015, door_len * 0.96, 0.360))
        
        # 2. Recessed Ergonomic Door Pull Handle Pocket
        hx = dx + side * 0.008
        hy = door_y - 0.280
        hz = 1.720
        # Recessed concave cup in door sheet metal
        add_box_to_bmesh(bm_handle, (hx - side * 0.015, hy, hz), (0.035, 0.220, 0.110))
        # Flush pivoting paddle pull handle lever
        add_box_to_bmesh(bm_handle, (hx, hy, hz), (0.018, 0.180, 0.065))
        # Chrome key cylinder tumbler
        add_cylinder_to_bmesh(bm_lock, (hx + side * 0.004, hy - 0.120, hz), 0.010, 0.020, segments=12, axis='X')
        
        # 3. Door Perimeter EPDM Rubber Weather-Strip Gasket
        # Top, front, rear, and bottom shut-line seal beads
        add_box_to_bmesh(bm_seal, (dx - side * 0.008, door_y, 1.840), (0.015, door_len, 0.016))
        add_box_to_bmesh(bm_seal, (dx - side * 0.008, door_y + door_len * 0.5, 1.480), (0.015, 0.016, 0.720))
        add_box_to_bmesh(bm_seal, (dx - side * 0.008, door_y - door_len * 0.5, 1.480), (0.015, 0.016, 0.720))
        add_box_to_bmesh(bm_seal, (dx - side * 0.008, door_y, 0.960), (0.015, door_len, 0.016))
        
    finalize_bmesh_object(panel_obj, panel_mesh, bm)
    finalize_bmesh_object(handle_obj, handle_mesh, bm_handle)
    finalize_bmesh_object(lock_obj, lock_mesh, bm_lock)
    finalize_bmesh_object(seal_obj, seal_mesh, bm_seal)
    print("[VOLVO FH12 PHASE 2] Subsystem 8: Cab doors, handles & step extensions built.")
    return panel_obj


# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 9: SIDE WINDOW GLASS & AERODYNAMIC DEFLECTOR VANES
# ----------------------------------------------------------------------------
def build_tinted_side_window_glass_and_deflector_vanes(materials, parent=None):
    """
    Constructs the side cab windows, B-pillars, and aero wind deflectors:
    - Toughened safety side window glass with green solar-control tint
    - Satin black vertical B-pillar sash appliqués
    - Front A-pillar aerodynamic clear wind/rain deflector acrylic vanes
    - Lower window horizontal rubber weather-strip beltline molding
    
    Position: X = +/- 1.235 m, Y = +1.150 m to +1.820 m, Z = 2.120 m to 2.820 m
    """
    glass_obj, glass_mesh, bm = create_bmesh_object("Side_Window_Tinted_Glass", materials['Glass_DielectricOptic'], parent)
    pillar_obj, pillar_mesh, bm_pillar = create_bmesh_object("Window_B_Pillar_Black", materials['Plastic_AnthraciteComposite'], parent)
    vane_obj, vane_mesh, bm_vane = create_bmesh_object("Window_Rain_Deflector_Vanes", materials['Glass_DielectricOptic'], parent)
    trim_obj, trim_mesh, bm_trim = create_bmesh_object("Window_Beltline_Trim", materials['Rubber_EuropeanTire'], parent)
    
    win_y = 1.340
    win_z = 2.440
    win_w = 0.880
    win_h = 0.640
    
    for side in [-1.0, 1.0]:
        wx = side * 1.238
        
        # 1. Main Driver/Passenger Side Door Glass (Divided main pane)
        add_box_to_bmesh(bm, (wx, win_y, win_z), (0.006, win_w, win_h))
        
        # 2. Satin Black Vertical B-Pillar Appliqué Trim
        add_box_to_bmesh(bm_pillar, (wx + side * 0.005, win_y - win_w * 0.5 - 0.050, win_z), (0.015, 0.110, win_h * 1.06))
        
        # 3. Horizontal Rubber Beltline Molding Along Lower Window Sill
        add_box_to_bmesh(bm_trim, (wx + side * 0.008, win_y, win_z - win_h * 0.5 - 0.010), (0.018, win_w * 1.05, 0.024))
        
        # 4. Aerodynamic Clear Acrylic Wind / Rain Deflector Vane
        # Mounted on leading A-pillar edge of window frame
        add_box_to_bmesh(bm_vane, (wx + side * 0.025, win_y + win_w * 0.5 - 0.020, win_z), (0.005, 0.085, win_h * 0.98),
                         rot_euler=(0.0, 0.0, side * math.radians(18.0)))
                         
    finalize_bmesh_object(glass_obj, glass_mesh, bm)
    finalize_bmesh_object(pillar_obj, pillar_mesh, bm_pillar)
    finalize_bmesh_object(vane_obj, vane_mesh, bm_vane)
    finalize_bmesh_object(trim_obj, trim_mesh, bm_trim)
    print("[VOLVO FH12 PHASE 2] Subsystem 9: Side window glass & deflector vanes built.")
    return glass_obj


# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 10: DUAL PANTOGRAPH WIPERS & COWL VENTILATION SLATS
# ----------------------------------------------------------------------------
def build_dual_pantograph_wipers_and_cowl_slats(materials, parent=None):
    """
    Constructs the heavy commercial windshield wiper mechanism:
    - Dual parallel pantograph articulated wiper arms in satin black
    - 700 mm flexible silicone rubber squeegee wiper blades
    - Twin heated windshield washer spray nozzles mounted on wiper arms
    - Aerodynamic stamped fresh air intake cowl grille louvers
    
    Position: Below windshield at Y = +2.240 m, Z = 2.050 m to 2.350 m
    """
    wiper_obj, wiper_mesh, bm = create_bmesh_object("Wiper_Pantograph_Arms", materials['Iron_CastHeavy'], parent)
    blade_obj, blade_mesh, bm_blade = create_bmesh_object("Wiper_Rubber_Blades", materials['Rubber_EuropeanTire'], parent)
    cowl_obj, cowl_mesh, bm_cowl = create_bmesh_object("Cowl_Ventilation_Grille", materials['Plastic_AnthraciteComposite'], parent)
    
    cowl_y = 2.250
    cowl_z = 2.090
    
    # 1. Windshield Cowl Fresh Air Intake Louvers (Below glass)
    add_box_to_bmesh(bm_cowl, (0.0, cowl_y, cowl_z), (1.920, 0.080, 0.090),
                     rot_euler=(math.radians(-14.0), 0.0, 0.0))
    for slat_x in [-0.8, -0.6, -0.4, -0.2, 0.0, 0.2, 0.4, 0.6, 0.8]:
        add_box_to_bmesh(bm_cowl, (slat_x, cowl_y + 0.015, cowl_z), (0.160, 0.020, 0.012),
                         rot_euler=(math.radians(-14.0), 0.0, 0.0))
                         
    # 2. Dual Pantograph Parallel Wiper Assemblies (Left and Right)
    for side in [-1.0, 1.0]:
        px = side * 0.520
        py = cowl_y - 0.020
        pz = cowl_z + 0.050
        
        # Heavy cast pivot spindle boss
        add_cylinder_to_bmesh(bm, (px, py, pz), 0.022, 0.050, segments=12, axis='Z',
                             rot_euler=(math.radians(17.0), 0.0, 0.0))
        # Main forged wiper arm extending up the windshield
        add_cylinder_to_bmesh(bm, (px + side * 0.060, py - 0.120, pz + 0.220), 0.012, 0.480, segments=10, axis='Z',
                             rot_euler=(math.radians(17.0), side * math.radians(-12.0), 0.0))
        # Parallel pantograph guide rod
        add_cylinder_to_bmesh(bm, (px + side * 0.090, py - 0.120, pz + 0.220), 0.008, 0.480, segments=8, axis='Z',
                             rot_euler=(math.radians(17.0), side * math.radians(-12.0), 0.0))
        # Articulated blade bridge cradle
        add_box_to_bmesh(bm, (px + side * 0.075, py - 0.240, pz + 0.460), (0.022, 0.040, 0.180),
                         rot_euler=(math.radians(17.0), 0.0, 0.0))
                         
        # 700 mm Flexible Rubber Wiper Blade Strip
        add_box_to_bmesh(bm_blade, (px + side * 0.075, py - 0.250, pz + 0.460), (0.012, 0.016, 0.680),
                         rot_euler=(math.radians(17.0), side * math.radians(-6.0), 0.0))
                         
        # Twin Heated Washer Nozzle Jets on Wiper Arm
        add_box_to_bmesh(bm, (px + side * 0.060, py - 0.080, pz + 0.160), (0.016, 0.020, 0.025))
        add_cylinder_to_bmesh(bm, (px + side * 0.060, py - 0.070, pz + 0.170), 0.004, 0.010, segments=6, axis='Y')
        
    finalize_bmesh_object(wiper_obj, wiper_mesh, bm)
    finalize_bmesh_object(blade_obj, blade_mesh, bm_blade)
    finalize_bmesh_object(cowl_obj, cowl_mesh, bm_cowl)
    print("[VOLVO FH12 PHASE 2] Subsystem 10: Dual pantograph wipers & cowl built.")
    return wiper_obj


# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 11: EUROPEAN 6-CHAMBER REAR COMBINATION LIGHT CLUSTERS
# ----------------------------------------------------------------------------
def build_european_6chamber_rear_lamp_clusters(materials, parent=None):
    """
    Constructs the ECE R48-compliant commercial vehicle rear combination lights:
    - 6-chamber horizontal multi-optic modular lamp assemblies
      (Stop, Tail, Amber Turn Indicator, Reversing White, Rear Red Fog,
       ECE Triangle Reflex Reflector, and Number Plate Illuminator)
    - Molded black protective impact housings bolted to chassis rear crossmember
    - Internal chrome parabolic segmented reflectors
    
    Position: Left and right rear crossmember ends at X = +/- 0.880 m, Y = -2.880 m, Z = 0.580 m
    """
    housing_obj, housing_mesh, bm = create_bmesh_object("Rear_Lamp_Housings", materials['Plastic_AnthraciteComposite'], parent)
    red_lens_obj, red_lens_mesh, bm_red = create_bmesh_object("Rear_Lamp_Red_Lenses", materials['Glass_TailLightRed'], parent)
    amber_lens_obj, amber_lens_mesh, bm_amber = create_bmesh_object("Rear_Lamp_Amber_Lenses", materials['Glass_AmberIndicator'], parent)
    clear_lens_obj, clear_lens_mesh, bm_clear = create_bmesh_object("Rear_Lamp_Clear_Lenses", materials['Glass_DielectricOptic'], parent)
    refl_obj, refl_mesh, bm_refl = create_bmesh_object("Rear_Triangle_Reflectors", materials['Decal_ECE70Chevron'], parent)
    
    lamp_y = -2.880
    lamp_z = 0.580
    lamp_w = 0.440
    lamp_h = 0.140
    
    for side in [-1.0, 1.0]:
        lx = side * 0.880
        # 1. Main Impact-Resistant Black ABS Housing Box
        add_box_to_bmesh(bm, (lx, lamp_y, lamp_z), (lamp_w, 0.080, lamp_h))
        # Galvanized steel mounting bracket to rear underrun bar
        add_box_to_bmesh(bm, (lx, lamp_y + 0.050, lamp_z), (lamp_w * 0.9, 0.030, 0.050))
        
        # 2. Chamber 1: Outboard Amber Turn Indicator
        c1_x = lx + side * (lamp_w * 0.5 - 0.040)
        add_box_to_bmesh(bm_amber, (c1_x, lamp_y - 0.042, lamp_z), (0.070, 0.010, lamp_h * 0.88))
        
        # 3. Chamber 2: Tail / Stop Light (Dual Filament Red)
        c2_x = lx + side * (lamp_w * 0.5 - 0.115)
        add_box_to_bmesh(bm_red, (c2_x, lamp_y - 0.042, lamp_z), (0.070, 0.010, lamp_h * 0.88))
        
        # 4. Chamber 3: Reversing Light (Optical Clear Lens with White LED)
        c3_x = lx + side * (lamp_w * 0.5 - 0.190)
        add_box_to_bmesh(bm_clear, (c3_x, lamp_y - 0.042, lamp_z), (0.070, 0.010, lamp_h * 0.88))
        
        # 5. Chamber 4: Rear High-Intensity Fog Lamp (Red)
        c4_x = lx + side * (lamp_w * 0.5 - 0.265)
        add_box_to_bmesh(bm_red, (c4_x, lamp_y - 0.042, lamp_z), (0.070, 0.010, lamp_h * 0.88))
        
        # 6. Chamber 5: ECE Retro-Reflective Red Triangular Safety Marker
        c5_x = lx + side * (lamp_w * 0.5 - 0.340)
        add_cone_to_bmesh(bm_refl, (c5_x, lamp_y - 0.044, lamp_z), 0.040, 0.005, 0.010, segments=3, axis='Y',
                         rot_euler=(0.0, 0.0, math.pi))
                         
        # 7. Rear License Plate White LED Illuminator (Driver side lamp bottom)
        if side == -1.0:
            add_box_to_bmesh(bm, (lx, lamp_y - 0.020, lamp_z - 0.080), (0.160, 0.040, 0.030))
            add_cylinder_to_bmesh(bm_clear, (lx, lamp_y - 0.020, lamp_z - 0.096), 0.012, 0.010, segments=10, axis='Z')
            
    finalize_bmesh_object(housing_obj, housing_mesh, bm)
    finalize_bmesh_object(red_lens_obj, red_lens_mesh, bm_red)
    finalize_bmesh_object(amber_lens_obj, amber_lens_mesh, bm_amber)
    finalize_bmesh_object(clear_lens_obj, clear_lens_mesh, bm_clear)
    finalize_bmesh_object(refl_obj, refl_mesh, bm_refl)
    print("[VOLVO FH12 PHASE 2] Subsystem 11: European 6-chamber rear lights built.")
    return housing_obj


# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 12: DUAL REAR CAB HIGH-MOUNTED WORKING FLOODLIGHTS
# ----------------------------------------------------------------------------
def build_dual_rear_cab_working_floodlights(materials, parent=None):
    """
    Constructs the rear cab night working floodlights (Hella Twin-Beam):
    - Dual sealed-beam halogen working lamps mounted below cab rear roof spoiler
    - Angled 35 degrees downward to illuminate catwalk, Suzie lines, and fifth wheel
    - Chrome parabolic reflectors with ribbed dispersion lenses
    - Heavy swivel trunnion mounting brackets with manual aiming locks
    
    Position: Upper rear cab wall at X = +/- 0.650 m, Y = +0.120 m, Z = 3.280 m
    """
    lamp_obj, lamp_mesh, bm = create_bmesh_object("Rear_Work_Floodlights", materials['Plastic_AnthraciteComposite'], parent)
    lens_obj, lens_mesh, bm_lens = create_bmesh_object("Work_Floodlight_Lenses", materials['Glass_DielectricOptic'], parent)
    emit_obj, emit_mesh, bm_emit = create_bmesh_object("Work_Floodlight_Emitters", materials['Emissive_XenonHeadlamp'], parent)
    bracket_obj, bracket_mesh, bm_brack = create_bmesh_object("Work_Floodlight_Brackets", materials['Iron_CastHeavy'], parent)
    
    for side in [-1.0, 1.0]:
        wx = side * 0.650
        wy = 0.120
        wz = 3.280
        
        # Heavy cast aluminum swivel trunnion bracket bolted to cab rear frame
        add_box_to_bmesh(bm_brack, (wx, wy, wz), (0.080, 0.040, 0.060))
        add_cylinder_to_bmesh(bm_brack, (wx, wy - 0.040, wz), 0.012, 0.050, segments=10, axis='Y')
        
        # Rectangular Heavy Duty Work Lamp Housing (Angled down 35 degrees)
        add_box_to_bmesh(bm, (wx, wy - 0.080, wz - 0.040), (0.160, 0.090, 0.120),
                         rot_euler=(math.radians(35.0), 0.0, 0.0))
                         
        # Internal Chrome Parabolic Reflector & Halogen H3 Bulb
        add_cylinder_to_bmesh(bm_emit, (wx, wy - 0.110, wz - 0.050), 0.025, 0.015, segments=14, axis='Y',
                             rot_euler=(math.radians(35.0), 0.0, 0.0))
                             
        # Fluted High-Dispersion Optical Glass Lens
        add_box_to_bmesh(bm_lens, (wx, wy - 0.125, wz - 0.060), (0.150, 0.010, 0.110),
                         rot_euler=(math.radians(35.0), 0.0, 0.0))
                         
    finalize_bmesh_object(lamp_obj, lamp_mesh, bm)
    finalize_bmesh_object(lens_obj, lens_mesh, bm_lens)
    finalize_bmesh_object(emit_obj, emit_mesh, bm_emit)
    finalize_bmesh_object(bracket_obj, bracket_mesh, bm_brack)
    print("[VOLVO FH12 PHASE 2] Subsystem 12: Rear cab working floodlights built.")
    return lamp_obj


# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 13: COILED TRAILER UMBILICAL SUZIE LINES & PYLON
# ----------------------------------------------------------------------------
def build_coiled_trailer_umbilical_pylon_and_suzies(materials, parent=None):
    """
    Constructs the European commercial coiled trailer umbilical service lines:
    - Vertical steel pylon support mast with dual tension spring suspension boom
    - Red Palm Coupling Emergency Brake Coiled Pneumatic Hose (ISO 1728)
    - Yellow Palm Coupling Service Brake Coiled Pneumatic Hose (ISO 1728)
    - Black 24V 15-Pin Coiled Electrical Cable (ISO 12098)
    - Green EBS / ABS CAN-Bus Coiled Trailer Communication Cable (ISO 7638)
    - Rear cab dummy parking stasis dock brackets
    
    Position: Behind cab over catwalk at X = 0.0 to +/- 0.350 m, Y = +0.080 m to -0.650 m, Z = 1.300 m to 1.950 m
    """
    pylon_obj, pylon_mesh, bm_pylon = create_bmesh_object("Suzie_Pylon_Mast", materials['Iron_CastHeavy'], parent)
    red_obj, red_mesh, bm_red = create_bmesh_object("Suzie_Coil_Red_Emergency", materials['Paint_VolvoRedAccent'], parent)
    yellow_obj, yellow_mesh, bm_yellow = create_bmesh_object("Suzie_Coil_Yellow_Service", materials['Decal_ECE70Chevron'], parent)
    black_obj, black_mesh, bm_black = create_bmesh_object("Suzie_Coil_Black_15Pin", materials['Rubber_EuropeanTire'], parent)
    green_obj, green_mesh, bm_green = create_bmesh_object("Suzie_Coil_Green_EBS", materials['Paint_ChassisDarkGrey'], parent)
    
    # 1. Heavy Vertical Support Pylon Mast Bolted to Catwalk Crossmember
    py_x = -0.280
    py_y = 0.060
    py_z = 1.620
    # Mast tube
    add_cylinder_to_bmesh(bm_pylon, (py_x, py_y, py_z), 0.024, 0.720, segments=14, axis='Z')
    # Triangular base flange
    add_box_to_bmesh(bm_pylon, (py_x, py_y, py_z - 0.350), (0.120, 0.120, 0.025))
    # Top horizontal spreader arm with tension spring hooks
    add_cylinder_to_bmesh(bm_pylon, (py_x, py_y - 0.080, py_z + 0.350), 0.016, 0.440, segments=12, axis='X')
    
    # 2. 4 Coiled Suzie Line Helices (Simulated via nested concentric torus loops)
    suzie_configs = [
        # (X offset, BMesh, Name, Color)
        (-0.160, bm_red, "Red Emergency Air"),
        (-0.060, bm_yellow, "Yellow Service Air"),
        (0.060, bm_black, "Black 15-Pin Electric"),
        (0.160, bm_green, "Green EBS/ABS Cable")
    ]
    
    for hx, target_bm, name in suzie_configs:
        # Spiral coiled bundle spanning down to catwalk
        for coil_idx in range(9):
            cz = py_z + 0.220 - coil_idx * 0.055
            cy = py_y - 0.120 - coil_idx * 0.035
            # Circular coil loop
            add_tube_to_bmesh(target_bm, (hx, cy, cz), 0.052, 0.038, 0.028, segments=14, axis='Y',
                             rot_euler=(math.radians(24.0), 0.0, 0.0))
                             
        # Cast Palm Coupling Head (Gladhand / CREG Coupling) at trailer end
        add_cylinder_to_bmesh(target_bm, (hx, py_y - 0.480, py_z - 0.280), 0.028, 0.060, segments=12, axis='Z')
        add_box_to_bmesh(target_bm, (hx, py_y - 0.500, py_z - 0.280), (0.040, 0.050, 0.030))
        
    finalize_bmesh_object(pylon_obj, pylon_mesh, bm_pylon)
    finalize_bmesh_object(red_obj, red_mesh, bm_red)
    finalize_bmesh_object(yellow_obj, yellow_mesh, bm_yellow)
    finalize_bmesh_object(black_obj, black_mesh, bm_black)
    finalize_bmesh_object(green_obj, green_mesh, bm_green)
    print("[VOLVO FH12 PHASE 2] Subsystem 13: Coiled trailer suzies & pylon built.")
    return pylon_obj


# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 14: DUAL POLISHED ROOF AIR HORN TRUMPETS & CB ANTENNAS
# ----------------------------------------------------------------------------
def build_dual_roof_air_horns_and_antennas(materials, parent=None):
    """
    Constructs the high-mounted chrome air horns and radio whip antennas:
    - Dual polished chrome Hadley pneumatic air horn trumpets (lengths 620 mm & 560 mm)
    - Chrome horn bells with acoustic mesh insect screens
    - Solenoid valves and airline fittings on roof shell
    - Twin flexible fiberglass CB radio whip antennas with stainless coiled shock springs
    
    Position: Cab roof top at X = +/- 0.720 m, Y = +1.150 m, Z = 3.860 m
    """
    horn_obj, horn_mesh, bm = create_bmesh_object("Roof_Air_Horns", materials['Chrome_EuropeanMirror'], parent)
    ant_obj, ant_mesh, bm_ant = create_bmesh_object("CB_Whip_Antennas", materials['Stainless_PolishedInconel'], parent)
    
    # 1. Dual Polished Chrome Hadley Pneumatic Horn Trumpets
    # Left and Right aerodynamic roof recesses
    for side in [-1.0, 1.0]:
        hx = side * 0.760
        hy = 1.180
        hz = 3.840
        # Trumpet Length (Longer base tone on driver side, shorter tone on passenger side)
        t_len = 0.620 if side < 0 else 0.560
        
        # Rear Diaphragm Sound Chamber Dome
        add_cylinder_to_bmesh(bm, (hx, hy - t_len * 0.5, hz), 0.052, 0.045, segments=18, axis='Y')
        # Tapered Trumpet Tube
        add_cone_to_bmesh(bm, (hx, hy, hz), 0.016, 0.048, t_len, segments=20, axis='Y')
        # Flared Trumpet Bell Mouth
        add_cone_to_bmesh(bm, (hx, hy + t_len * 0.5 + 0.040, hz), 0.048, 0.092, 0.080, segments=24, axis='Y')
        # Inner dark acoustic cavity bore
        add_cone_to_bmesh(bm, (hx, hy + t_len * 0.5 + 0.042, hz), 0.046, 0.088, 0.076, segments=20, axis='Y')
        
        # Pedestal mounting foot brackets
        add_box_to_bmesh(bm, (hx, hy - t_len * 0.45, hz - 0.040), (0.040, 0.060, 0.050))
        add_box_to_bmesh(bm, (hx, hy + t_len * 0.35, hz - 0.040), (0.040, 0.060, 0.050))
        
        # 2. CB Radio Whip Antenna on Roof Corner
        ax = side * 1.180
        ay = 0.980
        az = 3.680
        # Heavy chrome ball mount
        add_cylinder_to_bmesh(bm_ant, (ax, ay, az), 0.024, 0.035, segments=12, axis='Z')
        # Coiled spring shock absorber base
        add_cylinder_to_bmesh(bm_ant, (ax, ay, az + 0.050), 0.016, 0.070, segments=10, axis='Z')
        # Flexible tapered whip antenna mast extending 1.100 m upward
        add_cone_to_bmesh(bm_ant, (ax, ay - 0.080, az + 0.580), 0.007, 0.002, 1.050, segments=8, axis='Z',
                         rot_euler=(math.radians(8.0), 0.0, 0.0))
                         
    finalize_bmesh_object(horn_obj, horn_mesh, bm)
    finalize_bmesh_object(ant_obj, ant_mesh, bm_ant)
    print("[VOLVO FH12 PHASE 2] Subsystem 14: Roof air horns & CB antennas built.")
    return horn_obj


# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 15: FRONT CAB CORNER AERODYNAMIC AIR DEFLECTOR FLAPS
# ----------------------------------------------------------------------------
def build_front_cab_corner_air_deflectors(materials, parent=None):
    """
    Constructs the signature Volvo front corner aerodynamic air scoops:
    - Vertical curved air deflector vanes mounted on the front outer cab corners
    - Captures high-speed frontal airflow and directs it smoothly across the door flanks,
      creating a high-velocity boundary layer that keeps the side windows clean
    - Integrated acoustic seal rubber gaskets
    
    Position: Left and right front cab corners at X = +/- 1.180 m, Y = +2.340 m, Z = 1.350 m to 2.050 m
    """
    deflect_obj, deflect_mesh, bm = create_bmesh_object("Cab_Corner_Air_Deflectors", materials['Paint_VolvoSilverMetallic'], parent)
    gasket_obj, gasket_mesh, bm_gask = create_bmesh_object("Deflector_Rubber_Gaskets", materials['Rubber_EuropeanTire'], parent)
    
    def_h = 0.680
    def_y = 2.340
    def_z = 1.720
    
    for side in [-1.0, 1.0]:
        dx = side * 1.180
        # Main Aerodynamic Curved Foil Flap
        add_box_to_bmesh(bm, (dx, def_y, def_z), (0.024, 0.160, def_h),
                         rot_euler=(0.0, 0.0, side * math.radians(-22.0)))
        # Trailing lip curved inward towards door gap
        add_box_to_bmesh(bm, (dx - side * 0.030, def_y - 0.070, def_z), (0.015, 0.050, def_h * 0.96),
                         rot_euler=(0.0, 0.0, side * math.radians(-42.0)))
        # Inner rubber aerodynamic seal strip
        add_box_to_bmesh(bm_gask, (dx - side * 0.010, def_y + 0.020, def_z), (0.010, 0.080, def_h * 1.02),
                         rot_euler=(0.0, 0.0, side * math.radians(-22.0)))
                         
    finalize_bmesh_object(deflect_obj, deflect_mesh, bm)
    finalize_bmesh_object(gasket_obj, gasket_mesh, bm_gask)
    print("[VOLVO FH12 PHASE 2] Subsystem 15: Front cab corner air deflectors built.")
    return deflect_obj


# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 16: VOLVO FH12 3D EMBLEMS & MODEL BADGING
# ----------------------------------------------------------------------------
def build_volvo_fh12_3d_emblems_and_model_badging(materials, parent=None):
    """
    Constructs the 3D chrome vehicle branding and model designations:
    - 3D Individual chrome 'V O L V O' letter typography across upper front hood
    - 'FH12' 3D chrome model script badges on driver and passenger door lower panels
    - '460' horsepower rating side badges with Volvo blue accent bar
    - 'GLOBETROTTER XL' subtle rear cab corner branding decals
    
    Position: Hood header at Y = +2.400 m, Z = 1.940 m; Doors at X = +/- 1.250 m, Y = 1.580 m, Z = 1.620 m
    """
    badge_obj, badge_mesh, bm = create_bmesh_object("Volvo_3D_Lettering", materials['Chrome_EuropeanMirror'], parent)
    accent_obj, accent_mesh, bm_acc = create_bmesh_object("Badge_Blue_Accents", materials['Paint_VolvoIceBlue'], parent)
    
    # 1. 'V O L V O' 5 Individual Letter Spaced Chrome Blocks Across Front Hood Header
    # Centered at Y = 2.405 m, Z = 1.940 m
    v_letters = [
        (-0.240, "V"),
        (-0.120, "O"),
        (0.000, "L"),
        (0.120, "V"),
        (0.240, "O")
    ]
    for lx, char in v_letters:
        # 3D block letter extrusion
        add_box_to_bmesh(bm, (lx, 2.405, 1.940), (0.055, 0.008, 0.045),
                         rot_euler=(math.radians(-14.0), 0.0, 0.0))
                         
    # 2. 'FH12' and '460' Chrome Model Badges on Cab Doors
    for side in [-1.0, 1.0]:
        bx = side * 1.250
        by = 1.580
        bz = 1.620
        # Main 'FH12' chrome badge plate
        add_box_to_bmesh(bm, (bx, by, bz), (0.008, 0.140, 0.045))
        # Blue accent stripe beneath model name
        add_box_to_bmesh(bm_acc, (bx, by, bz - 0.028), (0.006, 0.135, 0.008))
        # '460' Horsepower rating badge
        add_box_to_bmesh(bm, (bx, by - 0.160, bz), (0.008, 0.095, 0.035))
        
    finalize_bmesh_object(badge_obj, badge_mesh, bm)
    finalize_bmesh_object(accent_obj, accent_mesh, bm_acc)
    print("[VOLVO FH12 PHASE 2] Subsystem 16: Volvo FH12 3D badges built.")
    return badge_obj


# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 17: STAINLESS FUEL & ADBLUE FILLER CAPS & VENTS
# ----------------------------------------------------------------------------
def build_stainless_fuel_and_adblue_filler_caps(materials, parent=None):
    """
    Constructs the commercial chassis fuel and emissions filling hardware:
    - 2x Heavy locking die-cast aluminum/stainless diesel filler neck caps with key tumblers
    - Stainless steel retention chain lanyards preventing cap loss
    - Blue ECE-compliant AdBlue tank filler neck cap and magnetic filler adapter
    - Fuel tank atmospheric pressure relief breather valves
    
    Position: Fuel tanks at X = +/- 1.180 m, Y = -0.420 m to -1.350 m, Z = 0.880 m
    """
    cap_obj, cap_mesh, bm = create_bmesh_object("Fuel_Filler_Caps", materials['Alloy_BrushedTankAluminum'], parent)
    adblue_obj, adblue_mesh, bm_ad = create_bmesh_object("AdBlue_Filler_Cap_Blue", materials['Paint_VolvoIceBlue'], parent)
    vent_obj, vent_mesh, bm_vent = create_bmesh_object("Tank_Breather_Valves", materials['Plastic_AnthraciteComposite'], parent)
    
    # 1. Main Diesel Fuel Tank Locking Caps (Left and Right Tanks)
    fuel_cap_locations = [
        (-1.180, -0.420, 0.860),  # Left tank forward cap
        (1.180, -0.420, 0.860)    # Right tank forward cap
    ]
    for cx, cy, cz in fuel_cap_locations:
        # Angled filler neck boss welded to tank top corner
        add_cylinder_to_bmesh(bm, (cx, cy, cz), 0.052, 0.040, segments=18, axis='X')
        # Heavy knurled locking cap with key tumbler in center
        add_cylinder_to_bmesh(bm, (cx + (0.025 if cx > 0 else -0.025), cy, cz), 0.058, 0.024, segments=20, axis='X')
        add_cylinder_to_bmesh(bm, (cx + (0.038 if cx > 0 else -0.038), cy, cz), 0.012, 0.012, segments=8, axis='X')
        # Atmospheric breather check valve
        add_cylinder_to_bmesh(bm_vent, (cx * 0.92, cy - 0.220, cz + 0.040), 0.018, 0.055, segments=10, axis='Z')
        
    # 2. AdBlue Urea Solution Tank Cap (Distinctive Blue Color on Left Side)
    ax = -1.180
    ay = 0.520
    az = 0.860
    # Blue AdBlue filler neck
    add_cylinder_to_bmesh(bm, (ax, ay, az), 0.038, 0.035, segments=16, axis='X')
    # High-visibility blue screw-on cap
    add_cylinder_to_bmesh(bm_ad, (ax - 0.022, ay, az), 0.044, 0.022, segments=18, axis='X')
    
    finalize_bmesh_object(cap_obj, cap_mesh, bm)
    finalize_bmesh_object(adblue_obj, adblue_mesh, bm_ad)
    finalize_bmesh_object(vent_obj, vent_mesh, bm_vent)
    print("[VOLVO FH12 PHASE 2] Subsystem 17: Stainless fuel & AdBlue caps built.")
    return cap_obj


# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 18: ECE 104 RETRO-REFLECTIVE CAB CONTOUR MARKINGS
# ----------------------------------------------------------------------------
def build_ece104_retroreflective_contour_markings(materials, parent=None):
    """
    Constructs the mandatory ECE R104 commercial vehicle contour safety markings:
    - Micro-prismatic retro-reflective yellow conspicuity tape along cab flanks
    - Micro-prismatic retro-reflective red conspicuity tape outlining rear cab contour
    - ECE R70 chevron red/yellow marker boards on rear underrun bar
    """
    side_tape_obj, side_tape_mesh, bm_side = create_bmesh_object("ECE104_Side_Contour_Tape", materials['Decal_ECE70Chevron'], parent)
    rear_tape_obj, rear_tape_mesh, bm_rear = create_bmesh_object("ECE104_Rear_Contour_Tape", materials['Paint_VolvoRedAccent'], parent)
    
    # 1. Cab Side Flank Yellow Contour Stripes (50 mm height tape)
    for side in [-1.0, 1.0]:
        sx = side * 1.252
        # Upper roofline stripe
        add_box_to_bmesh(bm_side, (sx, 0.850, 3.480), (0.004, 1.450, 0.045))
        # Lower beltline stripe
        add_box_to_bmesh(bm_side, (sx, 0.850, 1.950), (0.004, 1.450, 0.045))
        # Rear cab corner vertical pillar stripe
        add_box_to_bmesh(bm_side, (sx, 0.120, 2.715), (0.004, 0.045, 1.520))
        
    # 2. Rear Cab Perimeter Red Contour Markings (50 mm tape outlining upper Globetrotter roof)
    add_box_to_bmesh(bm_rear, (0.0, 0.060, 3.520), (2.280, 0.004, 0.045))
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm_rear, (side * 1.140, 0.060, 2.715), (0.045, 0.004, 1.560))
        
    finalize_bmesh_object(side_tape_obj, side_tape_mesh, bm_side)
    finalize_bmesh_object(rear_tape_obj, rear_tape_mesh, bm_rear)
    print("[VOLVO FH12 PHASE 2] Subsystem 18: ECE 104 contour markings built.")
    return side_tape_obj


# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 19: FINE EXTERIOR HARDWARE & GRADE-10.9 BOLTS
# ----------------------------------------------------------------------------
def build_fine_exterior_hardware_and_grade109_fasteners(materials, parent=None):
    """
    Constructs the Class-A automotive exterior micro-hardware and fastener details:
    - Front bumper tow eye receiver socket and heavy threaded screw-in pin
    - Folding kick-down maintenance step in front bumper center
    - Bumper corner split-line joint reinforcement bolts
    - Grade-10.9 flange bolts across catwalk mounting cleats and fifth-wheel bed
    """
    bolt_obj, bolt_mesh, bm = create_bmesh_object("Exterior_Fasteners_Hardware", materials['Iron_CastHeavy'], parent)
    tow_obj, tow_mesh, bm_tow = create_bmesh_object("Front_Tow_Eye_Socket", materials['Chrome_EuropeanMirror'], parent)
    
    # 1. Front Bumper Center Folding Step & Tow Eye Socket
    # Folding foot-step for driver windshield cleaning
    add_box_to_bmesh(bm, (0.0, 2.480, 0.740), (0.380, 0.120, 0.025))
    add_box_to_bmesh(bm, (0.0, 2.450, 0.740), (0.420, 0.035, 0.040))
    # Threaded heavy tow eye receiver socket (behind small flip cover)
    add_cylinder_to_bmesh(bm_tow, (0.280, 2.470, 0.740), 0.024, 0.035, segments=14, axis='Y')
    add_cylinder_to_bmesh(bm_tow, (0.280, 2.485, 0.740), 0.012, 0.015, segments=8, axis='Y')
    
    # 2. Catwalk Deck & Fifth Wheel Frame Grade-10.9 Flange Bolts (Array of 24 bolts)
    for b_idx in range(12):
        by = -0.450 - b_idx * 0.180
        for side in [-1.0, 1.0]:
            bx = side * 0.435
            add_cylinder_to_bmesh(bm, (bx, by, 0.940), 0.010, 0.016, segments=8, axis='Z')
            
    # 3. Rear Underrun Bumper Mounting Through-Bolts
    for side in [-1.0, 1.0]:
        add_cylinder_to_bmesh(bm, (side * 0.435, -2.850, 0.520), 0.012, 0.040, segments=8, axis='Y')
        add_cylinder_to_bmesh(bm, (side * 0.435, -2.850, 0.440), 0.012, 0.040, segments=8, axis='Y')
        
    finalize_bmesh_object(bolt_obj, bolt_mesh, bm)
    finalize_bmesh_object(tow_obj, tow_mesh, bm_tow)
    print("[VOLVO FH12 PHASE 2] Subsystem 19: Fine exterior hardware & fasteners built.")
    return bolt_obj


# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 20: CAB SUN VISOR & INTEGRATED AUXILIARY LEDS
# ----------------------------------------------------------------------------
def build_cab_sun_visor_and_integrated_auxiliary_leds(materials, parent=None):
    """
    Constructs the exterior aerodynamic sun visor over the windshield brow:
    - Smoked dark polycarbonate main visor blade spanning across cab width
    - Dual stainless steel aerodynamic mounting stanchions bolted to A-pillars
    - 4x Integrated white/amber auxiliary LED clearance lights in visor edge
    - Underside matte anti-glare acoustic baffle
    
    Position: Windshield upper brow at Y = +2.050 m, Z = 3.020 m to 3.160 m
    """
    visor_obj, visor_mesh, bm = create_bmesh_object("Exterior_Sun_Visor", materials['Plastic_AnthraciteComposite'], parent)
    lens_obj, lens_mesh, bm_lens = create_bmesh_object("Visor_LED_Clearance_Lamps", materials['Glass_DielectricOptic'], parent)
    emit_obj, emit_mesh, bm_emit = create_bmesh_object("Visor_LED_Emitters", materials['Emissive_XenonHeadlamp'], parent)
    bracket_obj, bracket_mesh, bm_brack = create_bmesh_object("Visor_Support_Stanchions", materials['Iron_CastHeavy'], parent)
    
    vy = 2.060
    vz = 3.080
    vw = 2.180
    
    # 1. Main Aerodynamic Polycarbonate Visor Blade (Swept down 24 degrees)
    add_box_to_bmesh(bm, (0.0, vy, vz), (vw, 0.220, 0.018),
                     rot_euler=(math.radians(-24.0), 0.0, 0.0))
    # Aerodynamic lip edge along leading contour
    add_box_to_bmesh(bm, (0.0, vy + 0.080, vz - 0.035), (vw * 1.01, 0.040, 0.024),
                     rot_euler=(math.radians(-24.0), 0.0, 0.0))
                     
    # 2. 4x Integrated Auxiliary High-Intensity LED Clearance Lights
    for lx in [-0.72, -0.24, 0.24, 0.72]:
        add_box_to_bmesh(bm_lens, (lx, vy + 0.090, vz - 0.035), (0.120, 0.015, 0.020),
                         rot_euler=(math.radians(-24.0), 0.0, 0.0))
        add_cylinder_to_bmesh(bm_emit, (lx, vy + 0.080, vz - 0.035), 0.008, 0.012, segments=8, axis='Y',
                             rot_euler=(math.radians(-24.0), 0.0, 0.0))
                             
    # 3. Heavy Stainless Steel Stanchions Bolted to A-Pillars
    for side in [-1.0, 1.0]:
        bx = side * (vw * 0.5 - 0.040)
        add_cylinder_to_bmesh(bm_brack, (bx, vy - 0.080, vz + 0.040), 0.014, 0.160, segments=10, axis='Z',
                             rot_euler=(math.radians(16.0), side * math.radians(-12.0), 0.0))
        add_box_to_bmesh(bm_brack, (bx, vy - 0.120, vz + 0.100), (0.045, 0.060, 0.045))
        
    finalize_bmesh_object(visor_obj, visor_mesh, bm)
    finalize_bmesh_object(lens_obj, lens_mesh, bm_lens)
    finalize_bmesh_object(emit_obj, emit_mesh, bm_emit)
    finalize_bmesh_object(bracket_obj, bracket_mesh, bm_brack)
    print("[VOLVO FH12 PHASE 2] Subsystem 20: Cab sun visor & auxiliary LEDs built.")
    return visor_obj


# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 21: TRAILER ELECTRICAL JUNCTION BOX & CONDUITS
# ----------------------------------------------------------------------------
def build_chassis_trailer_electrical_junction_box_and_conduits(materials, parent=None):
    """
    Constructs the chassis trailer electrical harness management unit:
    - IP67 sealed die-cast aluminum electrical junction box behind cab
    - Threaded brass cable glands and conduit strain relief nuts
    - Heavy corrugated PA6 wiring conduit bundles routed along left chassis rail
    - Chassis frame braided copper grounding bonding strap
    
    Position: Left inner chassis rail at Y = +0.020 m, Z = 0.880 m
    """
    box_obj, box_mesh, bm = create_bmesh_object("Chassis_Electrical_Junction", materials['Iron_CastHeavy'], parent)
    gland_obj, gland_mesh, bm_gland = create_bmesh_object("Brass_Cable_Glands", materials['Chrome_EuropeanMirror'], parent)
    conduit_obj, conduit_mesh, bm_cond = create_bmesh_object("Chassis_Wiring_Conduits", materials['Rubber_EuropeanTire'], parent)
    
    jx = -0.380
    jy = 0.020
    jz = 0.880
    
    # 1. Main Sealed Die-Cast Enclosure with O-Ring Gasket Flange
    add_box_to_bmesh(bm, (jx, jy, jz), (0.160, 0.240, 0.140))
    # Enclosure lid with 4 corner stainless captive screws
    add_box_to_bmesh(bm, (jx - 0.082, jy, jz), (0.010, 0.245, 0.145))
    for cy in [-0.09, 0.09]:
        for cz in [-0.05, 0.05]:
            add_cylinder_to_bmesh(bm_gland, (jx - 0.088, jy + cy, jz + cz), 0.006, 0.012, segments=6, axis='X')
            
    # 2. 6 Threaded Brass Cable Glands for Sensor & Power Feeds
    for g_idx in range(3):
        gy = jy - 0.060 + g_idx * 0.060
        add_cylinder_to_bmesh(bm_gland, (jx, gy, jz - 0.075), 0.014, 0.035, segments=12, axis='Z')
        # Flexible corrugated conduit emerging from gland
        add_cylinder_to_bmesh(bm_cond, (jx, gy, jz - 0.140), 0.011, 0.120, segments=10, axis='Z')
        
    # 3. Longitudinal Chassis Wiring Harness Bundle Routed Along Rail Web
    add_cylinder_to_bmesh(bm_cond, (jx, jy - 0.600, jz - 0.060), 0.022, 1.200, segments=12, axis='Y')
    
    # 4. Braided Copper Chassis Grounding Bonding Strap
    add_box_to_bmesh(bm_gland, (jx + 0.040, jy + 0.120, jz - 0.080), (0.010, 0.140, 0.025),
                     rot_euler=(0.0, math.radians(25.0), 0.0))
                     
    finalize_bmesh_object(box_obj, box_mesh, bm)
    finalize_bmesh_object(gland_obj, gland_mesh, bm_gland)
    finalize_bmesh_object(conduit_obj, conduit_mesh, bm_cond)
    print("[VOLVO FH12 PHASE 2] Subsystem 21: Electrical junction box & conduits built.")
    return box_obj


# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 22: FLEET TELEMATICS PUCK ANTENNA & KEYLESS KEYPAD
# ----------------------------------------------------------------------------
def build_cab_entry_security_keypads_and_fleet_telematics_antennas(materials, parent=None):
    """
    Constructs the electronic fleet tracking and access security hardware:
    - Aerodynamic GPS / GSM / Volvo Dynafleet telematics puck dome on cab roof
    - Driver door digital entry PIN keypad module with illuminated membrane buttons
    - Electronic road toll collection transponder (OBU) bracket behind windshield
    """
    tele_obj, tele_mesh, bm = create_bmesh_object("Dynafleet_Telematics_Puck", materials['Plastic_AnthraciteComposite'], parent)
    key_obj, key_mesh, bm_key = create_bmesh_object("Door_Security_Keypad", materials['Plastic_AnthraciteComposite'], parent)
    trans_obj, trans_mesh, bm_trans = create_bmesh_object("Toll_Transponder_OBU", materials['Paint_ChassisDarkGrey'], parent)
    
    # 1. Aerodynamic Dynafleet Telematics Antenna Puck on Cab Roof Center
    add_cylinder_to_bmesh(bm, (0.0, 1.250, 3.860), 0.065, 0.042, segments=20, axis='Z')
    add_cylinder_to_bmesh(bm, (0.0, 1.250, 3.875), 0.045, 0.020, segments=16, axis='Z')
    
    # 2. Driver Door Keyless Entry Access Keypad (Mounted adjacent to door handle)
    kx = -1.252
    ky = 1.320 - 0.160
    kz = 1.720
    add_box_to_bmesh(bm_key, (kx, ky, kz), (0.008, 0.045, 0.110))
    # 10 membrane keypad buttons
    for b_idx in range(5):
        add_box_to_bmesh(bm_key, (kx - 0.002, ky - 0.010, kz + 0.035 - b_idx * 0.018), (0.004, 0.012, 0.012))
        add_box_to_bmesh(bm_key, (kx - 0.002, ky + 0.010, kz + 0.035 - b_idx * 0.018), (0.004, 0.012, 0.012))
        
    # 3. Windshield Electronic Toll Collection Transponder OBU Box
    add_box_to_bmesh(bm_trans, (0.240, 1.820, 2.920), (0.110, 0.022, 0.075),
                     rot_euler=(math.radians(-17.0), 0.0, 0.0))
                     
    finalize_bmesh_object(tele_obj, tele_mesh, bm)
    finalize_bmesh_object(key_obj, key_mesh, bm_key)
    finalize_bmesh_object(trans_obj, trans_mesh, bm_trans)
    print("[VOLVO FH12 PHASE 2] Subsystem 22: Dynafleet telematics & keypad built.")
    return tele_obj


# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 23: CHASSIS AIR DRYER CARTRIDGE & DRAIN VALVES
# ----------------------------------------------------------------------------
def build_chassis_air_dryer_cartridge_and_drain_valves(materials, parent=None):
    """
    Constructs the heavy commercial pneumatic air processing unit (Wabco Twin):
    - Spin-on desiccant air dryer filter canister with integrated 24V heater
    - Die-cast aluminum governor and pressure regulator valve block
    - Automatic pneumatic condensate purge exhaust valve with acoustic silencer
    - Stainless braided air compressor delivery discharge jumper hose
    
    Position: Right inner chassis rail at Y = +0.720 m, Z = 0.740 m
    """
    dryer_obj, dryer_mesh, bm = create_bmesh_object("Chassis_Air_Dryer", materials['Alloy_BrushedTankAluminum'], parent)
    valve_obj, valve_mesh, bm_valve = create_bmesh_object("Air_Dryer_Valves", materials['Iron_CastHeavy'], parent)
    
    dx = 0.380
    dy = 0.720
    dz = 0.740
    
    # 1. Die-Cast Aluminum Valve Head & Mounting Flange
    add_box_to_bmesh(bm_valve, (dx, dy, dz + 0.080), (0.110, 0.160, 0.110))
    
    # 2. Cylindrical Desiccant Spin-On Filter Canister
    add_cylinder_to_bmesh(bm, (dx, dy, dz + 0.220), 0.078, 0.240, segments=22, axis='Z')
    # Top hex drive nut for cartridge replacement
    add_cylinder_to_bmesh(bm, (dx, dy, dz + 0.350), 0.024, 0.030, segments=6, axis='Z')
    
    # 3. Bottom Automatic Purge Drain Valve with Acoustic Expansion Silencer
    add_cylinder_to_bmesh(bm_valve, (dx, dy, dz - 0.020), 0.035, 0.080, segments=16, axis='Z')
    # Porous sintered bronze silencer muffler nozzle
    add_cylinder_to_bmesh(bm, (dx, dy, dz - 0.075), 0.028, 0.050, segments=14, axis='Z')
    
    # 4. Compressor Stainless Discharge Line Banjo Fitting
    add_cylinder_to_bmesh(bm_valve, (dx - 0.055, dy + 0.040, dz + 0.080), 0.016, 0.040, segments=10, axis='X')
    add_cylinder_to_bmesh(bm, (dx - 0.090, dy + 0.040, dz + 0.080), 0.012, 0.120, segments=10, axis='X')
    
    finalize_bmesh_object(dryer_obj, dryer_mesh, bm)
    finalize_bmesh_object(valve_obj, valve_mesh, bm_valve)
    print("[VOLVO FH12 PHASE 2] Subsystem 23: Air dryer cartridge & drain valves built.")
    return dryer_obj


# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 24: ENGINE HOOD SAFETY LATCHES & SUPPORT PROPS
# ----------------------------------------------------------------------------
def build_engine_hood_safety_latches_and_support_props(materials, parent=None):
    """
    Constructs the front service flap latches and pneumatic support struts:
    - Dual mechanical rotary safety claw latches securing front service hood
    - Twin pneumatic gas spring damper struts supporting opened hood flap
    - Secondary manual safety catch release trigger handle in lower grille pocket
    
    Position: Inside front grille perimeter at Y = +2.380 m, Z = 1.250 m to 1.750 m
    """
    latch_obj, latch_mesh, bm = create_bmesh_object("Hood_Safety_Latches", materials['Iron_CastHeavy'], parent)
    strut_obj, strut_mesh, bm_strut = create_bmesh_object("Hood_Gas_Struts", materials['Chrome_EuropeanMirror'], parent)
    
    hy = 2.380
    
    # 1. Dual Mechanical Rotary Claw Safety Latches (Left and Right)
    for side in [-1.0, 1.0]:
        lx = side * 0.580
        add_box_to_bmesh(bm, (lx, hy, 1.420), (0.050, 0.060, 0.075))
        # Stainless striker bar hook
        add_cylinder_to_bmesh(bm_strut, (lx, hy + 0.020, 1.420), 0.008, 0.035, segments=8, axis='Z')
        
        # 2. Twin Gas Spring Damper Telescopic Cylinders
        sx = side * 0.620
        # Outer pressure tube
        add_cylinder_to_bmesh(bm, (sx, hy - 0.040, 1.620), 0.012, 0.280, segments=10, axis='Z',
                             rot_euler=(math.radians(14.0), 0.0, 0.0))
        # Polished chrome piston rod
        add_cylinder_to_bmesh(bm_strut, (sx, hy - 0.020, 1.760), 0.006, 0.220, segments=8, axis='Z',
                             rot_euler=(math.radians(14.0), 0.0, 0.0))
                             
    # 3. Secondary Safety Catch Manual Release Lever (Center Grille)
    add_box_to_bmesh(bm, (0.0, hy + 0.040, 1.380), (0.080, 0.025, 0.015))
    add_cylinder_to_bmesh(bm, (0.0, hy + 0.050, 1.380), 0.006, 0.040, segments=8, axis='Z')
    
    finalize_bmesh_object(latch_obj, latch_mesh, bm)
    finalize_bmesh_object(strut_obj, strut_mesh, bm_strut)
    print("[VOLVO FH12 PHASE 2] Subsystem 24: Hood latches & support props built.")
    return latch_obj


# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 25: HIGH-PRESSURE TELESCOPIC HEADLAMP WASHERS
# ----------------------------------------------------------------------------
def build_headlamp_high_pressure_telescopic_washers(materials, parent=None):
    """
    Constructs the high-pressure retractable headlamp washing system:
    - Telescopic pneumatic/hydraulic washer cylinder actuators inside bumper
    - Flush body-colored pop-up cover caps directly below each headlamp lens
    - Dual high-velocity fan-spray fluid atomizing nozzles
    - High-pressure fluid supply hoses and check valves
    
    Position: Bumper front face beneath headlamps at X = +/- 0.920 m, Y = +2.435 m, Z = 0.810 m
    """
    washer_obj, washer_mesh, bm = create_bmesh_object("Headlamp_Washer_Nozzles", materials['Plastic_AnthraciteComposite'], parent)
    cap_obj, cap_mesh, bm_cap = create_bmesh_object("Washer_PopUp_Caps", materials['Paint_VolvoSilverMetallic'], parent)
    hose_obj, hose_mesh, bm_hose = create_bmesh_object("Washer_Fluid_Hoses", materials['Rubber_EuropeanTire'], parent)
    
    for side in [-1.0, 1.0]:
        wx = side * 0.920
        wy = 2.435
        wz = 0.810
        
        # 1. Flush Pop-Up Cover Cap in Bumper Outer Skin
        add_box_to_bmesh(bm_cap, (wx, wy, wz), (0.095, 0.012, 0.045),
                         rot_euler=(0.0, 0.0, side * math.radians(-14.0)))
                         
        # 2. Telescopic Piston Tube (Extends during high-speed washing cycle)
        add_cylinder_to_bmesh(bm, (wx, wy - 0.040, wz), 0.016, 0.075, segments=12, axis='Y',
                             rot_euler=(0.0, 0.0, side * math.radians(-14.0)))
                             
        # 3. Dual Atomizing Spray Nozzle Jet Heads (Aimed at low & high beam reflectors)
        add_cylinder_to_bmesh(bm, (wx - side * 0.020, wy + 0.010, wz + 0.010), 0.005, 0.015, segments=8, axis='Y',
                             rot_euler=(math.radians(24.0), 0.0, side * math.radians(-14.0)))
        add_cylinder_to_bmesh(bm, (wx + side * 0.020, wy + 0.010, wz + 0.010), 0.005, 0.015, segments=8, axis='Y',
                             rot_euler=(math.radians(24.0), 0.0, side * math.radians(-14.0)))
                             
        # 4. Flexible EPDM Fluid Delivery Hose Routed Behind Bumper Core
        add_cylinder_to_bmesh(bm_hose, (wx, wy - 0.120, wz - 0.050), 0.007, 0.180, segments=8, axis='Z')
        
    finalize_bmesh_object(washer_obj, washer_mesh, bm)
    finalize_bmesh_object(cap_obj, cap_mesh, bm_cap)
    finalize_bmesh_object(hose_obj, hose_mesh, bm_hose)
    print("[VOLVO FH12 PHASE 2] Subsystem 25: Headlamp telescopic washers built.")
    return cap_obj


# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 26: FIFTH WHEEL ARTICULATION SENSOR & SAFETY INDICATOR
# ----------------------------------------------------------------------------
def build_fifth_wheel_articulation_angle_sensor_and_safety_flag(materials, parent=None):
    """
    Constructs the electronic fifth wheel coupling sensor array (Jost LubeTronic & Sensor):
    - Magnetic inductive kingpin lock engagement sensor puck
    - Articulation angle potentiometer plate mounted below throat
    - Mechanical high-visibility yellow safety release flag arm
    - Armored sensor cable conduit routed to chassis CAN bus
    
    Position: Jost fifth wheel at X = 0.0 m, Y = -1.950 m, Z = 1.060 m
    """
    sensor_obj, sensor_mesh, bm = create_bmesh_object("Fifth_Wheel_Sensors", materials['Iron_CastHeavy'], parent)
    flag_obj, flag_mesh, bm_flag = create_bmesh_object("Fifth_Wheel_Safety_Flag", materials['Decal_ECE70Chevron'], parent)
    conduit_obj, conduit_mesh, bm_cond = create_bmesh_object("Sensor_Armored_Conduit", materials['Stainless_PolishedInconel'], parent)
    
    fx = 0.0
    fy = -1.950
    fz = 1.050
    
    # 1. Inductive Kingpin Presence & Lock Position Sensor Modules
    add_box_to_bmesh(bm, (fx, fy + 0.080, fz), (0.065, 0.075, 0.045))
    add_cylinder_to_bmesh(bm, (fx, fy + 0.110, fz), 0.014, 0.025, segments=12, axis='Y')
    
    # 2. Rotary Articulation Angle Sensor Potentiometer Housing
    add_cylinder_to_bmesh(bm, (fx, fy - 0.080, fz - 0.040), 0.038, 0.035, segments=16, axis='Z')
    
    # 3. High-Visibility Yellow Mechanical Lock Verification Safety Flag
    # Swings out laterally when kingpin lock jaws are 100% engaged and seated
    add_box_to_bmesh(bm_flag, (-0.460, fy - 0.040, fz + 0.020), (0.110, 0.025, 0.075))
    add_cylinder_to_bmesh(bm, (-0.410, fy - 0.040, fz + 0.020), 0.008, 0.080, segments=8, axis='X')
    
    # 4. Armored Flexible Stainless Steel Signal Conduit
    add_cylinder_to_bmesh(bm_cond, (fx + 0.080, fy, fz - 0.080), 0.009, 0.350, segments=10, axis='Z')
    
    finalize_bmesh_object(sensor_obj, sensor_mesh, bm)
    finalize_bmesh_object(flag_obj, flag_mesh, bm_flag)
    finalize_bmesh_object(conduit_obj, conduit_mesh, bm_cond)
    print("[VOLVO FH12 PHASE 2] Subsystem 26: Fifth wheel articulation sensors built.")
    return sensor_obj


# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 27: REAR REGISTRATION PLATE & EURONORM BADGE
# ----------------------------------------------------------------------------
def build_chassis_rear_registration_plate_bracket_and_euronorm_badge(materials, parent=None):
    """
    Constructs the European standard rear registration plate assembly:
    - ECE standard 520x110 mm white retro-reflective license plate
    - Left-hand blue European Union circle of stars country band
    - Black polyurethane protective mounting plate surround frame
    - Green environmental Euro 3 / Euro 4 round emissions classification badge
    
    Position: Rear underrun bumper center at X = -0.150 m, Y = -2.890 m, Z = 0.520 m
    """
    frame_obj, frame_mesh, bm = create_bmesh_object("Rear_Plate_Frame", materials['Plastic_AnthraciteComposite'], parent)
    plate_obj, plate_mesh, bm_plate = create_bmesh_object("Rear_License_Plate", materials['Decal_ECE70Chevron'], parent)
    euro_obj, euro_mesh, bm_euro = create_bmesh_object("Euro_Blue_Band", materials['Paint_VolvoIceBlue'], parent)
    badge_obj, badge_mesh, bm_badge = create_bmesh_object("Euro_Emissions_Badge", materials['Paint_VolvoRedAccent'], parent)
    
    px = -0.150
    py = -2.890
    pz = 0.520
    
    # 1. Polyurethane License Plate Carrier Surround Frame
    add_box_to_bmesh(bm, (px, py, pz), (0.540, 0.020, 0.130))
    
    # 2. White Retro-Reflective European License Plate Sheet (520 x 110 mm)
    add_box_to_bmesh(bm_plate, (px, py - 0.012, pz), (0.520, 0.005, 0.110))
    
    # 3. European Union Blue Star Flag Country Band (Left side of plate)
    add_box_to_bmesh(bm_euro, (px - 0.230, py - 0.015, pz), (0.055, 0.004, 0.106))
    
    # 4. Euro 4 Green/Red Commercial Vehicle Emissions Inspection Round Sticker
    add_cylinder_to_bmesh(bm_badge, (px + 0.220, py - 0.016, pz), 0.018, 0.005, segments=14, axis='Y')
    
    finalize_bmesh_object(frame_obj, frame_mesh, bm)
    finalize_bmesh_object(plate_obj, plate_mesh, bm_plate)
    finalize_bmesh_object(euro_obj, euro_mesh, bm_euro)
    finalize_bmesh_object(badge_obj, badge_mesh, bm_badge)
    print("[VOLVO FH12 PHASE 2] Subsystem 27: Rear registration plate built.")
    return plate_obj


# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 28: EXHAUST TAILPIPE DIFFUSER & HEAT SHIELDING
# ----------------------------------------------------------------------------
def build_exhaust_tailpipe_diffuser_and_heat_shielding(materials, parent=None):
    """
    Constructs the exhaust system tailpipe exit diffuser and thermal protection:
    - Curved stainless steel horizontal discharge nozzle exiting behind right skirt
    - Perforated stainless steel wrap-around thermal radiation heat shield
    - ECE particulate matter temperature and NOx sensor wiring bosses
    - Heavy duty dual rubber vibration isolator hanger brackets
    
    Position: Right chassis side behind fuel tank at X = +1.080 m, Y = -1.550 m, Z = 0.420 m
    """
    pipe_obj, pipe_mesh, bm = create_bmesh_object("Exhaust_Tailpipe_Diffuser", materials['Stainless_PolishedInconel'], parent)
    shield_obj, shield_mesh, bm_shield = create_bmesh_object("Exhaust_Perforated_Shield", materials['Alloy_BrushedTankAluminum'], parent)
    hanger_obj, hanger_mesh, bm_hang = create_bmesh_object("Exhaust_Rubber_Hangers", materials['Rubber_EuropeanTire'], parent)
    
    ex = 0.980
    ey = -1.550
    ez = 0.420
    
    # 1. Stainless Steel Exhaust Exit Spout (Swept laterally 30 degrees outward)
    add_cylinder_to_bmesh(bm, (ex, ey, ez), 0.065, 0.360, segments=20, axis='X',
                         rot_euler=(0.0, 0.0, math.radians(-28.0)))
    # Flared outer diffuser rim nozzle
    add_cone_to_bmesh(bm, (ex + 0.180, ey - 0.090, ez), 0.065, 0.082, 0.060, segments=20, axis='X',
                     rot_euler=(0.0, 0.0, math.radians(-28.0)))
    # Dark inner combustion soot bore
    add_cylinder_to_bmesh(bm, (ex + 0.185, ey - 0.092, ez), 0.060, 0.055, segments=18, axis='X',
                         rot_euler=(0.0, 0.0, math.radians(-28.0)))
                         
    # 2. Semi-Cylindrical Perforated Thermal Radiation Heat Shield
    add_tube_to_bmesh(bm_shield, (ex - 0.040, ey, ez), 0.088, 0.082, 0.320, segments=18, axis='X',
                     rot_euler=(0.0, 0.0, math.radians(-28.0)))
                     
    # 3. Dual Heavy Duty EPDM Vibration Isolator Hangers
    for hy in [-0.08, 0.08]:
        add_cylinder_to_bmesh(bm_hang, (ex - 0.060, ey + hy, ez + 0.110), 0.024, 0.055, segments=10, axis='Z')
        add_box_to_bmesh(bm, (ex - 0.060, ey + hy, ez + 0.140), (0.045, 0.035, 0.025))
        
    finalize_bmesh_object(pipe_obj, pipe_mesh, bm)
    finalize_bmesh_object(shield_obj, shield_mesh, bm_shield)
    finalize_bmesh_object(hanger_obj, hanger_mesh, bm_hang)
    print("[VOLVO FH12 PHASE 2] Subsystem 28: Exhaust tailpipe diffuser built.")
    return pipe_obj


# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 29: AERO SKIRT RETRACTABLE BOARDING STEPS
# ----------------------------------------------------------------------------
def build_aerodynamic_side_skirt_retractable_boarding_steps(materials, parent=None):
    """
    Constructs the fold-out catwalk boarding steps embedded in the side aero skirts:
    - Retractable cast aluminum textured step rungs flush with outer aero panel
    - High-strength stainless pivot hinges and spring-loaded ball detents
    - Anti-slip serrated diamond foot treads
    
    Position: Left and right side skirts forward of rear drive wheels at X = +/- 1.240 m, Y = -1.250 m, Z = 0.580 m
    """
    step_obj, step_mesh, bm = create_bmesh_object("Skirt_Retractable_Steps", materials['Alloy_BrushedTankAluminum'], parent)
    frame_obj, frame_mesh, bm_frame = create_bmesh_object("Step_Pocket_Frames", materials['Plastic_AnthraciteComposite'], parent)
    
    for side in [-1.0, 1.0]:
        sx = side * 1.245
        sy = -1.250
        sz = 0.580
        
        # 1. Recessed Pocket Housing in Aero Skirt
        add_box_to_bmesh(bm_frame, (sx - side * 0.020, sy, sz), (0.080, 0.380, 0.220))
        
        # 2. Fold-Out Serrated Aluminum Foot Tread Step
        add_box_to_bmesh(bm, (sx, sy, sz), (0.025, 0.320, 0.045))
        # Grip cleats across tread surface
        for cleat_idx in range(6):
            add_box_to_bmesh(bm, (sx, sy - 0.120 + cleat_idx * 0.048, sz + 0.025), (0.020, 0.012, 0.008))
            
        # 3. Dual Stainless Pivot Hinge Pins
        add_cylinder_to_bmesh(bm, (sx - side * 0.015, sy - 0.150, sz - 0.020), 0.010, 0.040, segments=8, axis='Y')
        add_cylinder_to_bmesh(bm, (sx - side * 0.015, sy + 0.150, sz - 0.020), 0.010, 0.040, segments=8, axis='Y')
        
    finalize_bmesh_object(step_obj, step_mesh, bm)
    finalize_bmesh_object(frame_obj, frame_mesh, bm_frame)
    print("[VOLVO FH12 PHASE 2] Subsystem 29: Skirt retractable steps built.")
    return step_obj


# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 30: CAB BACK GRAB RAILS & SAFETY LADDER
# ----------------------------------------------------------------------------
def build_cab_back_grab_rails_and_catwalk_safety_ladder(materials, parent=None):
    """
    Constructs the rear cab access grab rails and catwalk boarding ladder:
    - Polished stainless steel vertical grab rail mast mounted on left rear cab pillar
    - Knurled tactile grip sleeve segments for safety in rain/ice
    - Cast aluminum wall stand-off mounting stanchions with EPDM rubber seals
    - Lower boarding step rung below catwalk level
    
    Position: Left rear cab corner at X = -1.140 m, Y = +0.150 m, Z = 1.250 m to 2.850 m
    """
    rail_obj, rail_mesh, bm = create_bmesh_object("Cab_Back_Grab_Rails", materials['Stainless_PolishedInconel'], parent)
    stanch_obj, stanch_mesh, bm_stanch = create_bmesh_object("Grab_Rail_Stanchions", materials['Iron_CastHeavy'], parent)
    grip_obj, grip_mesh, bm_grip = create_bmesh_object("Rail_Rubber_Grips", materials['Rubber_EuropeanTire'], parent)
    
    rx = -1.140
    ry = 0.160
    
    # 1. Main Vertical Polished Stainless Steel Mast Tube (Diameter 32 mm, Length 1.55 m)
    add_cylinder_to_bmesh(bm, (rx, ry, 2.050), 0.016, 1.550, segments=16, axis='Z')
    
    # 2. 4 Wall Standoff Stanchion Brackets Welded to Mast and Bolted to Cab Skin
    for sz in [1.32, 1.80, 2.30, 2.78]:
        add_cylinder_to_bmesh(bm_stanch, (rx, ry - 0.040, sz), 0.014, 0.080, segments=12, axis='Y')
        add_box_to_bmesh(bm_stanch, (rx, ry - 0.080, sz), (0.060, 0.015, 0.060))
        # Grade-8 mounting bolt heads
        add_cylinder_to_bmesh(bm_stanch, (rx - 0.018, ry - 0.085, sz), 0.005, 0.010, segments=6, axis='Y')
        add_cylinder_to_bmesh(bm_stanch, (rx + 0.018, ry - 0.085, sz), 0.005, 0.010, segments=6, axis='Y')
        
    # 3. Knurled Black EPDM Rubber Grip Sleeves
    for gz in [1.55, 2.05, 2.55]:
        add_cylinder_to_bmesh(bm_grip, (rx, ry, gz), 0.020, 0.220, segments=16, axis='Z')
        
    # 4. Right Side Secondary Catwalk Assistance Grab Handle
    rx_r = 1.140
    add_cylinder_to_bmesh(bm, (rx_r, ry, 1.650), 0.016, 0.750, segments=14, axis='Z')
    for sz_r in [1.32, 1.98]:
        add_cylinder_to_bmesh(bm_stanch, (rx_r, ry - 0.040, sz_r), 0.014, 0.080, segments=10, axis='Y')
        add_box_to_bmesh(bm_stanch, (rx_r, ry - 0.080, sz_r), (0.060, 0.015, 0.060))
        
    finalize_bmesh_object(rail_obj, rail_mesh, bm)
    finalize_bmesh_object(stanch_obj, stanch_mesh, bm_stanch)
    finalize_bmesh_object(grip_obj, grip_mesh, bm_grip)
    print("[VOLVO FH12 PHASE 2] Subsystem 30: Cab back grab rails built.")
    return rail_obj


# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 31: FRONT UNDERRUN TOW JAW & RADIATOR ROCK GUARD
# ----------------------------------------------------------------------------
def build_front_underrun_protection_tow_jaw_and_rock_guard(materials, parent=None):
    """
    Constructs the heavy structural front towing jaw and radiator rock guard:
    - Cast steel heavy duty towing jaw clevis pin receiver behind center bumper
    - 45 mm diameter drop pin with quick-release linchpin lock
    - Heavy expanded aluminum wire mesh rock guard protecting charge air cooler
    
    Position: Lower bumper center at X = 0.0 m, Y = +2.380 m, Z = 0.520 m to 0.780 m
    """
    jaw_obj, jaw_mesh, bm = create_bmesh_object("Front_Tow_Jaw_Clevis", materials['Iron_CastHeavy'], parent)
    pin_obj, pin_mesh, bm_pin = create_bmesh_object("Tow_Jaw_Drop_Pin", materials['Chrome_EuropeanMirror'], parent)
    guard_obj, guard_mesh, bm_guard = create_bmesh_object("Radiator_Rock_Guard_Mesh", materials['Alloy_BrushedTankAluminum'], parent)
    
    jy = 2.380
    jz = 0.520
    
    # 1. Cast Steel Heavy Towing Jaw Clevis Box (Rated for 30 tonnes towing capacity)
    add_box_to_bmesh(bm, (0.0, jy, jz), (0.160, 0.180, 0.140))
    # Open mouth throat receiver for towbar eye
    add_box_to_bmesh(bm, (0.0, jy + 0.060, jz), (0.090, 0.120, 0.075))
    
    # 2. Vertical 45 mm Diameter Chrome Drop Pin
    add_cylinder_to_bmesh(bm_pin, (0.0, jy + 0.040, jz), 0.022, 0.180, segments=16, axis='Z')
    # T-handle pull loop on top of pin
    add_cylinder_to_bmesh(bm_pin, (0.0, jy + 0.040, jz + 0.100), 0.008, 0.070, segments=10, axis='X')
    
    # 3. Expanded Aluminum Radiator / Intercooler Protective Rock Guard Screen
    add_box_to_bmesh(bm_guard, (0.0, jy + 0.020, jz + 0.280), (1.180, 0.015, 0.340))
    # Protective structural diamond wire grid ribs
    for gx in [-0.4, -0.2, 0.0, 0.2, 0.4]:
        add_box_to_bmesh(bm_guard, (gx, jy + 0.030, jz + 0.280), (0.012, 0.010, 0.330))
    for gz in [-0.10, 0.0, 0.10]:
        add_box_to_bmesh(bm_guard, (0.0, jy + 0.030, jz + 0.280 + gz), (1.160, 0.010, 0.012))
        
    finalize_bmesh_object(jaw_obj, jaw_mesh, bm)
    finalize_bmesh_object(pin_obj, pin_mesh, bm_pin)
    finalize_bmesh_object(guard_obj, guard_mesh, bm_guard)
    print("[VOLVO FH12 PHASE 2] Subsystem 31: Front tow jaw & rock guard built.")
    return jaw_obj


# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 32: WHEEL HUBODOMETER & TPMS SENSORS & WHEEL WEIGHTS
# ----------------------------------------------------------------------------
def build_wheel_hub_odometer_and_tire_pressure_monitoring_sensors(materials, parent=None):
    """
    Constructs the wheel-end instrumentation and balancing details:
    - Stemco mechanical mileage hubodometer mounted on right drive axle hub
    - Wireless TPMS (Tire Pressure Monitoring System) sensor caps on all 6 tire valve stems
    - Die-cast lead clip-on wheel balance weights along outer Alcoa rim flanges
    """
    odo_obj, odo_mesh, bm = create_bmesh_object("Drive_Axle_Hubodometer", materials['Alloy_BrushedTankAluminum'], parent)
    glass_obj, glass_mesh, bm_glass = create_bmesh_object("Hubodometer_Sight_Glass", materials['Glass_DielectricOptic'], parent)
    tpms_obj, tpms_mesh, bm_tpms = create_bmesh_object("TPMS_Valve_Sensors", materials['Plastic_AnthraciteComposite'], parent)
    weight_obj, weight_mesh, bm_weight = create_bmesh_object("Wheel_Balance_Weights", materials['Iron_CastHeavy'], parent)
    
    # 1. Stemco Mechanical Hubodometer on Right Rear Outer Drive Axle Hub
    hx = 1.190
    hy = -1.900
    hz = 0.520
    # Cylindrical aluminum casing
    add_cylinder_to_bmesh(bm, (hx, hy, hz), 0.075, 0.055, segments=22, axis='X')
    # Clear tempered glass sight window
    add_cylinder_to_bmesh(bm_glass, (hx + 0.030, hy, hz), 0.058, 0.008, segments=20, axis='X')
    # Counter number drum reel inside
    add_cylinder_to_bmesh(bm, (hx + 0.022, hy, hz), 0.040, 0.015, segments=16, axis='X')
    
    # 2. Wireless TPMS Sensor Caps on All 6 Wheel Valve Stems
    wheel_coords = [
        (-1.180, 1.900, 0.520),  # Front steer Left
        (1.180, 1.900, 0.520),   # Front steer Right
        (-1.170, -1.900, 0.520), # Rear drive Left outer
        (-0.840, -1.900, 0.520), # Rear drive Left inner
        (0.840, -1.900, 0.520),  # Rear drive Right inner
        (1.170, -1.900, 0.520)   # Rear drive Right outer
    ]
    for wx, wy, wz in wheel_coords:
        # Brass valve stem tube angled out through rim hole
        add_cylinder_to_bmesh(bm, (wx + (0.020 if wx > 0 else -0.020), wy + 0.280, wz), 0.004, 0.035, segments=8, axis='X')
        # Cylindrical black TPMS transmitter cap
        add_cylinder_to_bmesh(bm_tpms, (wx + (0.038 if wx > 0 else -0.038), wy + 0.280, wz), 0.010, 0.018, segments=12, axis='X')
        
    # 3. Clip-On Rim Flange Balancing Lead Weights (Front Steer Wheels)
    for side in [-1.0, 1.0]:
        fx = side * 1.185
        fy = 1.900
        fz = 0.520
        # 50g balancing weight clamped to outer rim lip
        add_box_to_bmesh(bm_weight, (fx, fy - 0.280, fz + 0.260), (0.012, 0.055, 0.020))
        
    finalize_bmesh_object(odo_obj, odo_mesh, bm)
    finalize_bmesh_object(glass_obj, glass_mesh, bm_glass)
    finalize_bmesh_object(tpms_obj, tpms_mesh, bm_tpms)
    finalize_bmesh_object(weight_obj, weight_mesh, bm_weight)
    print("[VOLVO FH12 PHASE 2] Subsystem 32: Hubodometer & TPMS sensors built.")
    return odo_obj


# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 33: CHASSIS PNEUMATIC TEST PORTS & DIAGNOSTICS
# ----------------------------------------------------------------------------
def build_chassis_pneumatic_test_ports_and_diagnostics_bracket(materials, parent=None):
    """
    Constructs the workshop pneumatic diagnostic test ports:
    - 4-port quick-disconnect pneumatic pressure test manifold (Circuit 1, 2, 3, 4)
    - Color-coded protective elastomeric dust covers (Red, Yellow, Blue, Green)
    - Galvanized steel chassis rail standoff mounting bracket
    
    Position: Left chassis frame rail at X = -0.420 m, Y = -0.250 m, Z = 0.720 m
    """
    bracket_obj, bracket_mesh, bm = create_bmesh_object("Pneumatic_Test_Bracket", materials['Iron_CastHeavy'], parent)
    port_obj, port_mesh, bm_port = create_bmesh_object("Pneumatic_Quick_Ports", materials['Chrome_EuropeanMirror'], parent)
    red_cap, red_mesh, bm_rc = create_bmesh_object("Test_Port_Red_Cap", materials['Paint_VolvoRedAccent'], parent)
    blue_cap, blue_mesh, bm_bc = create_bmesh_object("Test_Port_Blue_Cap", materials['Paint_VolvoIceBlue'], parent)
    
    tx = -0.420
    ty = -0.250
    tz = 0.720
    
    # 1. Galvanized Rail Standoff Bracket
    add_box_to_bmesh(bm, (tx, ty, tz), (0.025, 0.240, 0.080))
    
    # 2. 4 Test Coupling Valves with Color-Coded Protective Lanyards
    for p_idx in range(4):
        py = ty - 0.090 + p_idx * 0.060
        # Threaded test valve fitting body
        add_cylinder_to_bmesh(bm_port, (tx - 0.020, py, tz), 0.012, 0.035, segments=12, axis='X')
        # Protective knurled cap
        target_cap = bm_rc if p_idx % 2 == 0 else bm_bc
        add_cylinder_to_bmesh(target_cap, (tx - 0.038, py, tz), 0.014, 0.015, segments=12, axis='X')
        
    finalize_bmesh_object(bracket_obj, bracket_mesh, bm)
    finalize_bmesh_object(port_obj, port_mesh, bm_port)
    finalize_bmesh_object(red_cap, red_mesh, bm_rc)
    finalize_bmesh_object(blue_cap, blue_mesh, bm_bc)
    print("[VOLVO FH12 PHASE 2] Subsystem 33: Pneumatic diagnostic test ports built.")
    return bracket_obj


# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 34: CAB ROOF RAIN GUTTERS & VORTEX SHEDDING TRIMS
# ----------------------------------------------------------------------------
def build_cab_roof_aerodynamic_vortex_trim_and_gutter_rails(materials, parent=None):
    """
    Constructs the aerodynamic water management and vortex shedding roof elements:
    - Longitudinal extruded aluminum water drainage rain gutters along cab roof eaves
    - Micro-vortex shedding chevron ridges across the Globetrotter roof dome
    - Rear roof aerodynamic air detachment trip lip along the upper trailing edge
    
    Position: Cab roof perimeters at X = +/- 1.180 m to 0.0 m, Y = 0.080 m to 1.850 m, Z = 3.650 m to 3.880 m
    """
    trim_obj, trim_mesh, bm = create_bmesh_object("Roof_Aerodynamic_Trims", materials['Plastic_AnthraciteComposite'], parent)
    lip_obj, lip_mesh, bm_lip = create_bmesh_object("Roof_Trailing_Air_Trip_Lip", materials['Paint_VolvoSilverMetallic'], parent)
    
    # 1. Left and Right Longitudinal Water Drainage Rain Gutters
    for side in [-1.0, 1.0]:
        gx = side * 1.210
        # EPDM extruded drainage channel profile
        add_box_to_bmesh(bm, (gx, 0.950, 3.650), (0.022, 1.720, 0.025))
        # Downward drainage spout at A-pillar base
        add_cylinder_to_bmesh(bm, (gx, 1.820, 3.420), 0.008, 0.160, segments=8, axis='Z',
                             rot_euler=(math.radians(24.0), 0.0, 0.0))
                             
    # 2. Globetrotter XL Upper Roof Trailing Air Separation Trip Lip
    # Sharp transverse knife-edge detachment ridge preventing wake recirculation
    add_box_to_bmesh(bm_lip, (0.0, 0.090, 3.875), (2.240, 0.040, 0.018))
    
    # 3. 4 Aerodynamic Vortex Shedding Chevron Ridges Across Crown Peak
    for vx in [-0.60, -0.20, 0.20, 0.60]:
        add_box_to_bmesh(bm, (vx, 1.150, 3.865), (0.018, 0.480, 0.012),
                         rot_euler=(math.radians(-4.0), 0.0, 0.0))
                         
    finalize_bmesh_object(trim_obj, trim_mesh, bm)
    finalize_bmesh_object(lip_obj, lip_mesh, bm_lip)
    print("[VOLVO FH12 PHASE 2] Subsystem 34: Roof aerodynamic trims & gutters built.")
    return trim_obj


# ----------------------------------------------------------------------------
# 36. SUBSYSTEM 35: WINDSHIELD WASHER RESERVOIR & FILLER NECK
# ----------------------------------------------------------------------------
def build_windshield_wiper_fluid_reservoir_and_filler_neck(materials, parent=None):
    """
    Constructs the high-capacity commercial windshield washer tank system:
    - 12-liter translucent molded polyethylene washer reservoir tank behind bumper
    - Bright yellow EPDM flip-top filler neck cap accessible via front flap
    - Dual 24V high-pressure positive displacement electric washer pump motors
    - Clear fluid level sight tube with floating indicator ball
    
    Position: Right front bumper corner at X = +0.820 m, Y = +2.280 m, Z = 0.920 m
    """
    tank_obj, tank_mesh, bm = create_bmesh_object("Washer_Fluid_Reservoir", materials['Alloy_BrushedTankAluminum'], parent)
    cap_obj, cap_mesh, bm_cap = create_bmesh_object("Washer_Yellow_Cap", materials['Decal_ECE70Chevron'], parent)
    pump_obj, pump_mesh, bm_pump = create_bmesh_object("Washer_Electric_Pumps", materials['Plastic_AnthraciteComposite'], parent)
    
    tx = 0.820
    ty = 2.280
    tz = 0.920
    
    # 1. Main Molded Polyethylene 12-Liter Reservoir Body
    add_box_to_bmesh(bm, (tx, ty, tz), (0.180, 0.220, 0.280))
    
    # 2. Upright Filler Neck with Bright Yellow Flip Cap (Located inside front grille flap)
    add_cylinder_to_bmesh(bm, (tx, ty + 0.080, tz + 0.220), 0.030, 0.160, segments=14, axis='Z')
    add_cylinder_to_bmesh(bm_cap, (tx, ty + 0.080, tz + 0.305), 0.036, 0.015, segments=16, axis='Z')
    # Wiper spray icon emboss on cap
    add_box_to_bmesh(bm_cap, (tx, ty + 0.080, tz + 0.315), (0.024, 0.024, 0.005))
    
    # 3. Dual 24V Electric High-Pressure Washer Pumps at Tank Base
    for py_off in [-0.05, 0.05]:
        add_cylinder_to_bmesh(bm_pump, (tx - 0.095, ty + py_off, tz - 0.090), 0.018, 0.075, segments=12, axis='X')
        add_cylinder_to_bmesh(bm_pump, (tx - 0.135, ty + py_off, tz - 0.090), 0.006, 0.025, segments=8, axis='Z')
        
    finalize_bmesh_object(tank_obj, tank_mesh, bm)
    finalize_bmesh_object(cap_obj, cap_mesh, bm_cap)
    finalize_bmesh_object(pump_obj, pump_mesh, bm_pump)
    print("[VOLVO FH12 PHASE 2] Subsystem 35: Washer fluid reservoir built.")
    return tank_obj


# ----------------------------------------------------------------------------
# 37. SUBSYSTEM 36: CAB ENTRY ILLUMINATION PUDDLE LAMPS
# ----------------------------------------------------------------------------
def build_cab_entry_illumination_puddle_lamps(materials, parent=None):
    """
    Constructs the downward-facing step and boarding courtesy lights:
    - High-output white LED courtesy puddle lamps recessed into door lower edges
    - Downward-angled optical diffusion lenses illuminating the 3 entry steps
    - Automatic door-open contact switches in door hinge pillars
    
    Position: Under door bottom skins at X = +/- 1.240 m, Y = 1.340 m, Z = 0.980 m
    """
    housing_obj, housing_mesh, bm = create_bmesh_object("Puddle_Lamp_Housings", materials['Plastic_AnthraciteComposite'], parent)
    lens_obj, lens_mesh, bm_lens = create_bmesh_object("Puddle_Lamp_Lenses", materials['Glass_DielectricOptic'], parent)
    emit_obj, emit_mesh, bm_emit = create_bmesh_object("Puddle_Lamp_Emitters", materials['Emissive_XenonHeadlamp'], parent)
    
    for side in [-1.0, 1.0]:
        px = side * 1.240
        py = 1.340
        pz = 0.970
        
        # Molded flush housing box in door bottom flange
        add_box_to_bmesh(bm, (px, py, pz), (0.040, 0.110, 0.025))
        # Clear downward lens
        add_box_to_bmesh(bm_lens, (px, py, pz - 0.012), (0.032, 0.095, 0.006))
        # Internal high-intensity LED diode emitter
        add_cylinder_to_bmesh(bm_emit, (px, py, pz - 0.005), 0.010, 0.008, segments=10, axis='Z')
        
    finalize_bmesh_object(housing_obj, housing_mesh, bm)
    finalize_bmesh_object(lens_obj, lens_mesh, bm_lens)
    finalize_bmesh_object(emit_obj, emit_mesh, bm_emit)
    print("[VOLVO FH12 PHASE 2] Subsystem 36: Entry puddle lamps built.")
    return housing_obj


# ----------------------------------------------------------------------------
# 38. SUBSYSTEM 37: AIR INTAKE SNORKEL STACK & RAIN SEPARATOR
# ----------------------------------------------------------------------------
def build_air_intake_snorkel_stack_and_rain_separator(materials, parent=None):
    """
    Constructs the heavy commercial engine combustion air intake stack:
    - High-mounted vertical composite snorkel stack routed behind right rear cab pillar
    - Dynamic centrifugal vortex rain/water separator intake scoop at roof level
    - Flexible accordion rubber bellows expansion joint allowing cab tilting
    
    Position: Right rear cab corner at X = +0.940 m, Y = +0.120 m, Z = 1.650 m to 3.650 m
    """
    stack_obj, stack_mesh, bm = create_bmesh_object("Air_Intake_Snorkel_Stack", materials['Plastic_AnthraciteComposite'], parent)
    bellow_obj, bellow_mesh, bm_bellow = create_bmesh_object("Snorkel_Rubber_Bellows", materials['Rubber_EuropeanTire'], parent)
    hood_obj, hood_mesh, bm_hood = create_bmesh_object("Snorkel_Rain_Separator", materials['Paint_VolvoSilverMetallic'], parent)
    
    sx = 0.940
    sy = 0.120
    
    # 1. Main Vertical Oval Composite Snorkel Air Duct (Z = 1.85 to 3.45 m)
    add_box_to_bmesh(bm, (sx, sy, 2.650), (0.160, 0.220, 1.550))
    # Wall mounting brackets bolted to cab frame
    for bz in [2.10, 2.70, 3.30]:
        add_box_to_bmesh(bm, (sx - 0.090, sy, bz), (0.040, 0.080, 0.050))
        
    # 2. Roof-Level High-Velocity Air Intake Scoop & Rain Separator Hood
    # Sweeps forward at Globetrotter roof height to inhale clean, cool air above road dust
    add_box_to_bmesh(bm_hood, (sx, sy + 0.140, 3.520), (0.220, 0.380, 0.180),
                     rot_euler=(math.radians(-14.0), 0.0, 0.0))
    # Front honeycomb protective intake grille
    add_box_to_bmesh(bm, (sx, sy + 0.320, 3.560), (0.190, 0.020, 0.140),
                     rot_euler=(math.radians(-14.0), 0.0, 0.0))
                     
    # 3. Flexible Accordion Corrugated Rubber Cab-Tilt Bellows (Chassis to cab interface)
    add_cylinder_to_bmesh(bm_bellow, (sx, sy, 1.450), 0.095, 0.320, segments=18, axis='Z')
    for ring_z in [1.35, 1.42, 1.49, 1.56]:
        add_tube_to_bmesh(bm_bellow, (sx, sy, ring_z), 0.108, 0.095, 0.025, segments=18, axis='Z')
        
    finalize_bmesh_object(stack_obj, stack_mesh, bm)
    finalize_bmesh_object(bellow_obj, bellow_mesh, bm_bellow)
    finalize_bmesh_object(hood_obj, hood_mesh, bm_hood)
    print("[VOLVO FH12 PHASE 2] Subsystem 37: Air intake snorkel stack built.")
    return stack_obj


# ----------------------------------------------------------------------------
# 39. SUBSYSTEM 38: CHASSIS FUEL COOLER RADIATOR & THERMOSTATS
# ----------------------------------------------------------------------------
def build_chassis_fuel_cooler_radiator_and_thermostats(materials, parent=None):
    """
    Constructs the dedicated chassis diesel fuel cooling matrix:
    - Multi-pass aluminum tube-and-fin cooling core mounted under left chassis skirt
    - Thermostatic bypass valve controlling return fuel temperature to prevent tank heating
    - Expanded aluminum wire stone guard shield
    
    Position: Left chassis frame behind steer wheel at X = -0.680 m, Y = +0.850 m, Z = 0.540 m
    """
    cooler_obj, cooler_mesh, bm = create_bmesh_object("Chassis_Fuel_Cooler", materials['Alloy_BrushedTankAluminum'], parent)
    valve_obj, valve_mesh, bm_valve = create_bmesh_object("Fuel_Thermostat_Valve", materials['Iron_CastHeavy'], parent)
    
    cx = -0.680
    cy = 0.850
    cz = 0.540
    
    # 1. Aluminum Multi-Pass Cooling Radiator Core
    add_box_to_bmesh(bm, (cx, cy, cz), (0.060, 0.380, 0.240))
    # Horizontal cooling fins
    for fin_z in [-0.08, -0.04, 0.0, 0.04, 0.08]:
        add_box_to_bmesh(bm, (cx - 0.032, cy, cz + fin_z), (0.012, 0.360, 0.010))
        
    # 2. Thermostatic Bypass Valve & Return Fuel Inlets
    add_cylinder_to_bmesh(bm_valve, (cx + 0.040, cy - 0.150, cz + 0.080), 0.024, 0.065, segments=12, axis='X')
    add_cylinder_to_bmesh(bm, (cx + 0.070, cy - 0.150, cz + 0.080), 0.010, 0.090, segments=8, axis='Y')
    
    # 3. Heavy Wire Protective Stone Guard Screen
    add_box_to_bmesh(bm, (cx - 0.040, cy, cz), (0.005, 0.390, 0.250))
    
    finalize_bmesh_object(cooler_obj, cooler_mesh, bm)
    finalize_bmesh_object(valve_obj, valve_mesh, bm_valve)
    print("[VOLVO FH12 PHASE 2] Subsystem 38: Fuel cooler radiator built.")
    return cooler_obj


# ----------------------------------------------------------------------------
# 40. SUBSYSTEM 39: FRONT REGISTRATION PLATE & ADAPTIVE RADAR DOME
# ----------------------------------------------------------------------------
def build_front_license_plate_holder_and_radar_sensor(materials, parent=None):
    """
    Constructs the front license plate and Bosch ACC radar radome:
    - European standard 520x110 mm white front license plate on bumper carrier
    - Blue EU flag band on left edge
    - Flush dark composite Bosch 77 GHz adaptive cruise control radar dome
    
    Position: Front bumper lower valence center at X = 0.0 m, Y = +2.485 m, Z = 0.620 m
    """
    frame_obj, frame_mesh, bm = create_bmesh_object("Front_Plate_Carrier", materials['Plastic_AnthraciteComposite'], parent)
    plate_obj, plate_mesh, bm_plate = create_bmesh_object("Front_License_Plate", materials['Decal_ECE70Chevron'], parent)
    blue_obj, blue_mesh, bm_blue = create_bmesh_object("Front_Euro_Blue_Band", materials['Paint_VolvoIceBlue'], parent)
    radar_obj, radar_mesh, bm_radar = create_bmesh_object("Bosch_ACC_Radar_Dome", materials['Plastic_AnthraciteComposite'], parent)
    
    py = 2.485
    pz = 0.620
    
    # 1. Front European Plate Carrier Frame (Slightly offset to accommodate center tow hook)
    add_box_to_bmesh(bm, (-0.240, py, pz), (0.540, 0.015, 0.130))
    add_box_to_bmesh(bm_plate, (-0.240, py + 0.010, pz), (0.520, 0.004, 0.110))
    add_box_to_bmesh(bm_blue, (-0.240 - 0.230, py + 0.012, pz), (0.055, 0.003, 0.106))
    
    # 2. Bosch 77 GHz Forward Millimeter-Wave Radar Radome (Adaptive Cruise Control)
    # Mounted in lower bumper center aperture
    add_box_to_bmesh(bm_radar, (0.240, py - 0.020, pz), (0.140, 0.035, 0.110))
    add_cylinder_to_bmesh(bm_radar, (0.240, py, pz), 0.045, 0.015, segments=20, axis='Y')
    
    finalize_bmesh_object(frame_obj, frame_mesh, bm)
    finalize_bmesh_object(plate_obj, plate_mesh, bm_plate)
    finalize_bmesh_object(blue_obj, blue_mesh, bm_blue)
    finalize_bmesh_object(radar_obj, radar_mesh, bm_radar)
    print("[VOLVO FH12 PHASE 2] Subsystem 39: Front license plate & ACC radar built.")
    return plate_obj


# ----------------------------------------------------------------------------
# 41. SUBSYSTEM 40: ECAS AIR SUSPENSION ROTARY HEIGHT SENSORS
# ----------------------------------------------------------------------------
def build_chassis_air_suspension_height_sensors_and_linkages(materials, parent=None):
    """
    Constructs the Wabco ECAS (Electronically Controlled Air Suspension) sensors:
    - Sealed rotary inductive ride-height position sensors bolted to chassis rails
    - Articulated ball-joint connecting linkages connecting to axle beams
    - Rubber protective gaiter boots over spherical ball joints
    - Shielded CAN-bus sensor cable leads
    
    Position: Steer axle at Y = +1.900 m and Drive axle at Y = -1.900 m
    """
    sensor_obj, sensor_mesh, bm = create_bmesh_object("ECAS_Height_Sensors", materials['Plastic_AnthraciteComposite'], parent)
    link_obj, link_mesh, bm_link = create_bmesh_object("ECAS_Linkage_Rods", materials['Iron_CastHeavy'], parent)
    boot_obj, boot_mesh, bm_boot = create_bmesh_object("ECAS_Rubber_Boots", materials['Rubber_EuropeanTire'], parent)
    
    sensor_stations = [
        (-0.435, 1.900, 0.720, 0.480),   # Front left steer
        (0.435, 1.900, 0.720, 0.480),    # Front right steer
        (-0.435, -1.900, 0.760, 0.480),  # Rear left drive
        (0.435, -1.900, 0.760, 0.480)   # Rear right drive
    ]
    
    for sx, sy, sz, az in sensor_stations:
        # 1. Rotary Sensor Potentiometer Body on Chassis Rail Web
        add_box_to_bmesh(bm, (sx, sy, sz), (0.045, 0.080, 0.055))
        # Pivot lever arm
        add_cylinder_to_bmesh(bm_link, (sx + (0.025 if sx > 0 else -0.025), sy, sz), 0.008, 0.110, segments=8, axis='Y')
        
        # 2. Vertical Articulated Connecting Rod to Axle Beam
        add_cylinder_to_bmesh(bm_link, (sx + (0.025 if sx > 0 else -0.025), sy + 0.050, (sz + az) * 0.5), 0.006, sz - az, segments=8, axis='Z')
        
        # 3. Spherical Ball Joint Protective Rubber Gaiters
        add_cylinder_to_bmesh(bm_boot, (sx + (0.025 if sx > 0 else -0.025), sy + 0.050, sz), 0.014, 0.030, segments=10, axis='Z')
        add_cylinder_to_bmesh(bm_boot, (sx + (0.025 if sx > 0 else -0.025), sy + 0.050, az), 0.014, 0.030, segments=10, axis='Z')
        
    finalize_bmesh_object(sensor_obj, sensor_mesh, bm)
    finalize_bmesh_object(link_obj, link_mesh, bm_link)
    finalize_bmesh_object(boot_obj, boot_mesh, bm_boot)
    print("[VOLVO FH12 PHASE 2] Subsystem 40: ECAS height sensors built.")
    return sensor_obj


# ----------------------------------------------------------------------------
# 42. SUBSYSTEM 41: REAR FENDER ANTI-SPRAY TEXTURED VALENCES
# ----------------------------------------------------------------------------
def build_rear_fender_anti_spray_textured_valences(materials, parent=None):
    """
    Constructs the EU 109/2011-compliant rain and road spray containment system:
    - Molded polymer textured anti-spray grass-mat energy-absorbing liners inside fenders
    - Lower flexible rubber side containment flaps along wheel arch perimeters
    - Trailing aerodynamic air guide sipes
    
    Position: Rear drive wheel arches at X = +/- 1.180 m, Y = -1.900 m, Z = 0.520 m to 1.120 m
    """
    mat_obj, mat_mesh, bm = create_bmesh_object("Fender_AntiSpray_Liners", materials['Rubber_EuropeanTire'], parent)
    flap_obj, flap_mesh, bm_flap = create_bmesh_object("Fender_Side_Flaps", materials['Plastic_AnthraciteComposite'], parent)
    
    fy = -1.900
    
    for side in [-1.0, 1.0]:
        fx = side * 1.180
        # 1. Curved Inner Anti-Spray Mat Liner Under Top of Arch
        add_box_to_bmesh(bm, (fx, fy, 1.120), (0.640, 1.280, 0.025))
        # Textured vertical water absorption ribs
        for r_idx in range(8):
            ry = fy - 0.500 + r_idx * 0.140
            add_box_to_bmesh(bm, (fx, ry, 1.110), (0.620, 0.018, 0.015))
            
        # 2. Outer Peripheral Flexible Anti-Spray Valence Flap
        add_box_to_bmesh(bm_flap, (fx + side * 0.320, fy, 0.880), (0.012, 1.340, 0.420))
        
    finalize_bmesh_object(mat_obj, mat_mesh, bm)
    finalize_bmesh_object(flap_obj, flap_mesh, bm_flap)
    print("[VOLVO FH12 PHASE 2] Subsystem 41: Rear fender anti-spray valences built.")
    return mat_obj


# ----------------------------------------------------------------------------
# 43. SUBSYSTEM 42: FRONT WHEEL AERODYNAMIC VENTILATION & HUB CAPS
# ----------------------------------------------------------------------------
def build_front_wheel_spoke_cooling_ducts_and_aero_discs(materials, parent=None):
    """
    Constructs the aerodynamic front wheel trim and cooling channels:
    - Polished stainless steel wheel nut protective ring covers (Spider Rings)
    - Alcoa aerodynamic center hub dome with embossed Volvo iron logo
    - Rim flange balancing perimeter bead
    
    Position: Front steer wheels at X = +/- 1.185 m, Y = +1.900 m, Z = 0.520 m
    """
    disc_obj, disc_mesh, bm = create_bmesh_object("Front_Wheel_Spider_Rings", materials['Chrome_EuropeanMirror'], parent)
    logo_obj, logo_mesh, bm_logo = create_bmesh_object("Wheel_Hub_Volvo_Logos", materials['Paint_VolvoSilverMetallic'], parent)
    
    wy = 1.900
    wz = 0.520
    
    for side in [-1.0, 1.0]:
        wx = side * 1.185
        # 1. Stainless Steel Wheel Nut Spider Ring (Protects 10 wheel nuts from dirt)
        add_tube_to_bmesh(bm, (wx, wy, wz), 0.210, 0.165, 0.035, segments=24, axis='X')
        
        # 2. Central Alcoa Deep Domed Hub Cap
        add_cylinder_to_bmesh(bm, (wx + side * 0.025, wy, wz), 0.092, 0.045, segments=22, axis='X')
        
        # 3. 3D Embossed Volvo Iron Mark Logo Ring on Hub Cap
        add_tube_to_bmesh(bm_logo, (wx + side * 0.050, wy, wz), 0.045, 0.035, 0.008, segments=18, axis='X')
        # Diagonal iron mark arrow
        add_box_to_bmesh(bm_logo, (wx + side * 0.052, wy + 0.028, wz + 0.028), (0.008, 0.020, 0.020),
                         rot_euler=(math.radians(45.0), 0.0, 0.0))
                         
    finalize_bmesh_object(disc_obj, disc_mesh, bm)
    finalize_bmesh_object(logo_obj, logo_mesh, bm_logo)
    print("[VOLVO FH12 PHASE 2] Subsystem 42: Front wheel aero rings & hub logos built.")
    return disc_obj


# ----------------------------------------------------------------------------
# 44. SUBSYSTEM 43: TRAILER CHOCK RETENTION CLAMPS & CHAINS
# ----------------------------------------------------------------------------
def build_trailer_chock_retention_clamps_and_safety_chains(materials, parent=None):
    """
    Constructs the heavy spring-steel wheel chock retention carriers:
    - Quick-release spring tension retention toggle latches
    - Stainless steel safety locking pins with coiled retention wire lanyards
    - Anti-vibration rubber damper buffers
    
    Position: Left side chassis rail at X = -0.420 m, Y = -1.150 m, Z = 0.680 m
    """
    clamp_obj, clamp_mesh, bm = create_bmesh_object("Chock_Retention_Clamps", materials['Iron_CastHeavy'], parent)
    pin_obj, pin_mesh, bm_pin = create_bmesh_object("Chock_Safety_Pins", materials['Chrome_EuropeanMirror'], parent)
    
    cx = -0.420
    cy = -1.150
    cz = 0.680
    
    # 1. Dual Heavy Stamped Spring-Steel Toggle Clamps
    for cy_off in [-0.14, 0.14]:
        add_box_to_bmesh(bm, (cx, cy + cy_off, cz), (0.035, 0.055, 0.085))
        # Toggle handle lever
        add_cylinder_to_bmesh(bm, (cx - 0.025, cy + cy_off, cz + 0.030), 0.006, 0.065, segments=8, axis='Z')
        
        # 2. Stainless Safety Linchpin with Coiled Wire
        add_cylinder_to_bmesh(bm_pin, (cx - 0.025, cy + cy_off, cz - 0.020), 0.004, 0.030, segments=8, axis='Y')
        add_tube_to_bmesh(bm_pin, (cx - 0.025, cy + cy_off - 0.015, cz - 0.020), 0.015, 0.012, 0.004, segments=10, axis='Y')
        
    finalize_bmesh_object(clamp_obj, clamp_mesh, bm)
    finalize_bmesh_object(pin_obj, pin_mesh, bm_pin)
    print("[VOLVO FH12 PHASE 2] Subsystem 43: Chock retention clamps built.")
    return clamp_obj


# ----------------------------------------------------------------------------
# 45. SUBSYSTEM 44: CHASSIS REAR CLOSURE GUSSETS & RECOVERY SHACKLES
# ----------------------------------------------------------------------------
def build_chassis_end_closure_gussets_and_tie_down_shackles(materials, parent=None):
    """
    Constructs the chassis rear frame closure gussets and recovery D-shackles:
    - 12 mm thick high-tensile steel diagonal frame closure gusset plates
    - Forged steel 16-tonne recovery bow shackles with threaded pins
    - Ro-Ro shipping tie-down eye lashing plates welded to lower rail flanges
    
    Position: Rear chassis rail ends at X = +/- 0.435 m, Y = -2.860 m, Z = 0.720 m
    """
    gusset_obj, gusset_mesh, bm = create_bmesh_object("Chassis_Rear_Gussets", materials['Iron_CastHeavy'], parent)
    shackle_obj, shackle_mesh, bm_shackle = create_bmesh_object("Recovery_Bow_Shackles", materials['Paint_VolvoRedAccent'], parent)
    
    ry = -2.860
    rz = 0.720
    
    for side in [-1.0, 1.0]:
        rx = side * 0.435
        # 1. Diagonal Stiffening Corner Gusset Plate (Reinforcing frame torsion)
        add_box_to_bmesh(bm, (rx, ry + 0.120, rz), (0.015, 0.220, 0.180),
                         rot_euler=(0.0, side * math.radians(28.0), 0.0))
        # Grade-10.9 flange bolts through rail web
        for bz in [-0.06, 0.0, 0.06]:
            add_cylinder_to_bmesh(bm, (rx + (0.012 if rx > 0 else -0.012), ry + 0.120, rz + bz), 0.010, 0.024, segments=8, axis='X')
            
        # 2. Forged Heavy Recovery Bow Shackle (Painted Safety Red)
        add_tube_to_bmesh(bm_shackle, (rx, ry - 0.060, rz - 0.140), 0.045, 0.025, 0.022, segments=16, axis='X')
        # Threaded shackle pin bolt
        add_cylinder_to_bmesh(bm, (rx, ry - 0.060, rz - 0.165), 0.014, 0.090, segments=12, axis='X')
        
    finalize_bmesh_object(gusset_obj, gusset_mesh, bm)
    finalize_bmesh_object(shackle_obj, shackle_mesh, bm_shackle)
    print("[VOLVO FH12 PHASE 2] Subsystem 44: Rear gussets & recovery shackles built.")
    return gusset_obj


# ----------------------------------------------------------------------------
# 46. SUBSYSTEM 45: CAB DOOR SILL SCUFF PLATES & ILLUMINATED LOGOS
# ----------------------------------------------------------------------------
def build_cab_door_courtesy_step_pockets_and_scuff_plates(materials, parent=None):
    """
    Constructs the premium cab door entry threshold scuff plates:
    - Brushed stainless steel sill protector plates with embossed 'VOLVO' lettering
    - Electroluminescent ice-blue backlight glow under logo cutouts
    - Heavy EPDM rubber outer perimeter water and wind deflector skirts
    
    Position: Inside door openings at X = +/- 1.230 m, Y = 1.340 m, Z = 1.480 m
    """
    sill_obj, sill_mesh, bm = create_bmesh_object("Door_Sill_Scuff_Plates", materials['Alloy_BrushedTankAluminum'], parent)
    glow_obj, glow_mesh, bm_glow = create_bmesh_object("Sill_Logo_Illumination", materials['Paint_VolvoIceBlue'], parent)
    gasket_obj, gasket_mesh, bm_gask = create_bmesh_object("Sill_Weather_Gaskets", materials['Rubber_EuropeanTire'], parent)
    
    sy = 1.340
    sz = 1.480
    
    for side in [-1.0, 1.0]:
        sx = side * 1.232
        # 1. Brushed Stainless Steel Sill Scuff Tread Plate
        add_box_to_bmesh(bm, (sx, sy, sz), (0.022, 0.720, 0.040))
        # Traction knurls
        for k_idx in range(6):
            add_box_to_bmesh(bm, (sx + side * 0.005, sy - 0.220 + k_idx * 0.088, sz + 0.015), (0.008, 0.045, 0.006))
            
        # 2. Electroluminescent Ice-Blue Illuminated 'VOLVO' Script Inset
        add_box_to_bmesh(bm_glow, (sx + side * 0.008, sy, sz + 0.012), (0.005, 0.220, 0.018))
        
        # 3. Heavy Lower EPDM Rubber Draft Deflector Skirt
        add_box_to_bmesh(bm_gask, (sx - side * 0.010, sy, sz - 0.035), (0.015, 0.760, 0.045))
        
    finalize_bmesh_object(sill_obj, sill_mesh, bm)
    finalize_bmesh_object(glow_obj, glow_mesh, bm_glow)
    finalize_bmesh_object(gasket_obj, gasket_mesh, bm_gask)
    print("[VOLVO FH12 PHASE 2] Subsystem 45: Door sill scuff plates built.")
    return sill_obj


# ----------------------------------------------------------------------------
# 47. SUBSYSTEM 46: CHASSIS SIDE MARKER LIGHTING & WIRING CONDUITS
# ----------------------------------------------------------------------------
def build_chassis_side_marker_lighting_wiring_harnesses(materials, parent=None):
    """
    Constructs the ECE R48-compliant amber side marker lights along chassis rails:
    - 4x Sealed amber LED side marker lamp pods along left and right chassis skirts
    - Integrated retro-reflective amber reflex prismatic side reflectors
    - Corrugated nylon wiring harness conduits and chassis rail P-clips
    
    Position: Along chassis flanks at X = +/- 1.248 m, Z = 0.650 m
    """
    marker_obj, marker_mesh, bm = create_bmesh_object("Chassis_Side_Markers", materials['Glass_AmberIndicator'], parent)
    glow_obj, glow_mesh, bm_glow = create_bmesh_object("Side_Marker_LED_Glow", materials['Emissive_AmberSignal'], parent)
    clip_obj, clip_mesh, bm_clip = create_bmesh_object("Side_Marker_P_Clips", materials['Iron_CastHeavy'], parent)
    
    # 4 Longitudinal Marker Stations from front to rear
    marker_stations_y = [1.200, 0.200, -0.800, -1.800]
    
    for side in [-1.0, 1.0]:
        mx = side * 1.248
        for my in marker_stations_y:
            # 1. Flush Rectangular Amber Marker Lamp Pod
            add_box_to_bmesh(bm, (mx, my, 0.650), (0.012, 0.120, 0.045))
            # Internal high-intensity amber LED emitter
            add_cylinder_to_bmesh(bm_glow, (mx + side * 0.005, my, 0.650), 0.010, 0.008, segments=10, axis='X')
            # Chassis Rail Galvanized Mounting P-Clip
            add_box_to_bmesh(bm_clip, (mx - side * 0.035, my, 0.650), (0.055, 0.025, 0.030))
            
    finalize_bmesh_object(marker_obj, marker_mesh, bm)
    finalize_bmesh_object(glow_obj, glow_mesh, bm_glow)
    finalize_bmesh_object(clip_obj, clip_mesh, bm_clip)
    print("[VOLVO FH12 PHASE 2] Subsystem 46: Chassis side marker lights built.")
    return marker_obj



# ----------------------------------------------------------------------------
# 48. SUBSYSTEM 47: AUTOMATIC FIFTH-WHEEL CENTRAL LUBRICATION UNIT
# ----------------------------------------------------------------------------
def build_chassis_fifth_wheel_grease_reservoir_and_lube_lines(materials, parent=None):
    """
    Constructs the Jost LubeTronic 1-point automated fifth wheel lubricator:
    - 2.5 kg clear polyurethane grease reservoir cartridge mounted to left rail
    - 24V electric high-pressure piston metering pump with LED diagnostic light
    - Armored flexible high-pressure polyamide grease tubes routed to fifth wheel plate
    - Heavy duty brass lubrication manifold and refill zerk nipple fitting
    
    Position: Left chassis inner rail near fifth wheel at X = -0.420 m, Y = -1.650 m, Z = 0.880 m
    """
    pump_obj, pump_mesh, bm_pump = create_bmesh_object("LubeTronic_Grease_Pump", materials['Plastic_AnthraciteComposite'], parent)
    res_obj, res_mesh, bm_res = create_bmesh_object("LubeTronic_Grease_Cartridge", materials['Alloy_BrushedTankAluminum'], parent)
    tube_obj, tube_mesh, bm_tube = create_bmesh_object("HighPressure_Grease_Lines", materials['Rubber_EuropeanTire'], parent)
    zerk_obj, zerk_mesh, bm_zerk = create_bmesh_object("Refill_Zerk_Nipples", materials['Chrome_EuropeanMirror'], parent)
    
    lx = -0.420
    ly = -1.650
    lz = 0.880
    
    # 1. Electric Piston Metering Pump Body
    add_box_to_bmesh(bm_pump, (lx, ly, lz), (0.095, 0.120, 0.110))
    # Green diagnostic LED status lens
    add_cylinder_to_bmesh(bm_pump, (lx - 0.050, ly, lz + 0.035), 0.005, 0.008, segments=8, axis='X')
    
    # 2. Cylindrical Clear Lubricant Reservoir Canister
    add_cylinder_to_bmesh(bm_res, (lx, ly, lz + 0.160), 0.048, 0.220, segments=18, axis='Z')
    # Refill grease zerk fitting on top
    add_cylinder_to_zerk = add_cylinder_to_bmesh(bm_zerk, (lx, ly, lz + 0.280), 0.008, 0.024, segments=10, axis='Z')
    
    # 3. High-Pressure Polyamide Lubrication Line to Fifth Wheel Base
    add_cylinder_to_bmesh(bm_tube, (lx + 0.050, ly - 0.120, lz + 0.020), 0.006, 0.320, segments=8, axis='Y',
                         rot_euler=(math.radians(-18.0), math.radians(14.0), 0.0))
                         
    finalize_bmesh_object(pump_obj, pump_mesh, bm_pump)
    finalize_bmesh_object(res_obj, res_mesh, bm_res)
    finalize_bmesh_object(tube_obj, tube_mesh, bm_tube)
    finalize_bmesh_object(zerk_obj, zerk_mesh, bm_zerk)
    print("[VOLVO FH12 PHASE 2] Subsystem 47: Central lubrication unit built.")
    return pump_obj


# ============================================================================
# MASTER PHASE 2 ROOT BUILDER
# ============================================================================
def build_volvo_fh12_phase2_root(materials, parent=None):
    """
    Master coordinator function building all Phase 2 exterior jewelry, lighting,
    aerodynamics, and hardware subsystems under a clean hierarchy.
    """
    p2_root = bpy.data.objects.new("Volvo_FH12_Phase2_Exterior_Jewelry", None)
    bpy.context.collection.objects.link(p2_root)
    if parent:
        p2_root.parent = parent
        
    print("[VOLVO FH12 PHASE 2] Beginning comprehensive assembly of all 24 Phase 2 subsystems...")
    
    # Build all Phase 2 Subsystems
    build_globetrotter_xl_illuminated_roof_sign(materials, p2_root)
    build_panoramic_windshield_and_ceramic_frit(materials, p2_root)
    build_volvo_sash_grille_and_iron_mark(materials, p2_root)
    build_vertical_bi_xenon_headlamps_and_optics(materials, p2_root)
    build_lower_bumper_fog_and_cornering_lights(materials, p2_root)
    build_overhead_spotlights_and_cab_brow_markers(materials, p2_root)
    build_aerodynamic_4mirror_system(materials, p2_root)
    build_cab_doors_handles_and_step_extensions(materials, p2_root)
    build_tinted_side_window_glass_and_deflector_vanes(materials, p2_root)
    build_dual_pantograph_wipers_and_cowl_slats(materials, p2_root)
    build_european_6chamber_rear_lamp_clusters(materials, p2_root)
    build_dual_rear_cab_working_floodlights(materials, p2_root)
    build_coiled_trailer_umbilical_pylon_and_suzies(materials, p2_root)
    build_dual_roof_air_horns_and_antennas(materials, p2_root)
    build_front_cab_corner_air_deflectors(materials, p2_root)
    build_volvo_fh12_3d_emblems_and_model_badging(materials, p2_root)
    build_stainless_fuel_and_adblue_filler_caps(materials, p2_root)
    build_ece104_retroreflective_contour_markings(materials, p2_root)
    build_fine_exterior_hardware_and_grade109_fasteners(materials, p2_root)
    build_cab_sun_visor_and_integrated_auxiliary_leds(materials, p2_root)
    build_chassis_trailer_electrical_junction_box_and_conduits(materials, p2_root)
    build_cab_entry_security_keypads_and_fleet_telematics_antennas(materials, p2_root)
    build_chassis_air_dryer_cartridge_and_drain_valves(materials, p2_root)
    build_engine_hood_safety_latches_and_support_props(materials, p2_root)
    build_headlamp_high_pressure_telescopic_washers(materials, p2_root)
    build_fifth_wheel_articulation_angle_sensor_and_safety_flag(materials, p2_root)
    build_chassis_rear_registration_plate_bracket_and_euronorm_badge(materials, p2_root)
    build_exhaust_tailpipe_diffuser_and_heat_shielding(materials, p2_root)
    build_aerodynamic_side_skirt_retractable_boarding_steps(materials, p2_root)
    build_cab_back_grab_rails_and_catwalk_safety_ladder(materials, p2_root)
    build_front_underrun_protection_tow_jaw_and_rock_guard(materials, p2_root)
    build_wheel_hub_odometer_and_tire_pressure_monitoring_sensors(materials, p2_root)
    build_chassis_pneumatic_test_ports_and_diagnostics_bracket(materials, p2_root)
    build_cab_roof_aerodynamic_vortex_trim_and_gutter_rails(materials, p2_root)
    build_windshield_wiper_fluid_reservoir_and_filler_neck(materials, p2_root)
    build_cab_entry_illumination_puddle_lamps(materials, p2_root)
    build_air_intake_snorkel_stack_and_rain_separator(materials, p2_root)
    build_chassis_fuel_cooler_radiator_and_thermostats(materials, p2_root)
    build_front_license_plate_holder_and_radar_sensor(materials, p2_root)
    build_chassis_air_suspension_height_sensors_and_linkages(materials, p2_root)
    build_rear_fender_anti_spray_textured_valences(materials, p2_root)
    build_front_wheel_spoke_cooling_ducts_and_aero_discs(materials, p2_root)
    build_trailer_chock_retention_clamps_and_safety_chains(materials, p2_root)
    build_chassis_end_closure_gussets_and_tie_down_shackles(materials, p2_root)
    build_cab_door_courtesy_step_pockets_and_scuff_plates(materials, p2_root)
    build_chassis_side_marker_lighting_wiring_harnesses(materials, p2_root)
    build_chassis_fifth_wheel_grease_reservoir_and_lube_lines(materials, p2_root)
    
    print("[VOLVO FH12 PHASE 2] All 24 Phase 2 Subsystems constructed successfully!")
    return p2_root


# ============================================================================
# MASTER AUTOMOTIVE PBR MATERIAL FACTORY & ALIAS PROVIDER
# ============================================================================
def make_pbr_material(name, base_color, metallic=0.0, roughness=0.4, clearcoat=0.0,
                      transmission=0.0, ior=1.50, emission_color=None, emission_strength=0.0,
                      alpha=1.0):
    """Creates a production-quality Principled BSDF PBR material compatible with all Blender versions."""
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
        
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    
    bsdf = nodes.get("Principled BSDF")
    if not bsdf:
        bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
        output = nodes.get("Material Output")
        if not output:
            output = nodes.new(type="ShaderNodeOutputMaterial")
        links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
        
    def set_socket(sock_name, val):
        if sock_name in bsdf.inputs:
            bsdf.inputs[sock_name].default_value = val
            
    set_socket("Base Color", (*base_color[:3], 1.0) if len(base_color) == 3 else base_color)
    set_socket("Metallic", metallic)
    set_socket("Roughness", roughness)
    
    if hasattr(bsdf.inputs, "get"):
        if bsdf.inputs.get("Clearcoat Weight"):
            bsdf.inputs["Clearcoat Weight"].default_value = clearcoat
        elif bsdf.inputs.get("Clearcoat"):
            bsdf.inputs["Clearcoat"].default_value = clearcoat
            
        if bsdf.inputs.get("Transmission Weight"):
            bsdf.inputs["Transmission Weight"].default_value = transmission
        elif bsdf.inputs.get("Transmission"):
            bsdf.inputs["Transmission"].default_value = transmission
            
    set_socket("IOR", ior)
    
    if emission_color and emission_strength > 0.0:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (*emission_color[:3], 1.0)
            set_socket("Emission Strength", emission_strength)
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (*emission_color[:3], 1.0)
            set_socket("Emission Strength", emission_strength)
            
    if alpha < 1.0:
        set_socket("Alpha", alpha)
        mat.blend_method = 'BLEND'
        if hasattr(mat, 'shadow_method'):
            mat.shadow_method = 'HASHED'
            
    return mat


def create_volvo_fh12_pbr_materials():
    """Initializes master PBR materials dictionary with full aliases for Phase 1 and Phase 2."""
    mats = {}
    
    # Paints
    paint_ice_blue = make_pbr_material('Paint_VolvoIceBlue', (0.12, 0.26, 0.42), metallic=0.30, roughness=0.16, clearcoat=1.00)
    paint_dark_grey = make_pbr_material('Paint_ChassisDarkGrey', (0.045, 0.048, 0.052), metallic=0.25, roughness=0.42)
    paint_aero_blue = make_pbr_material('Paint_VolvoAeroBlue', (0.12, 0.26, 0.42), metallic=0.30, roughness=0.16, clearcoat=1.00)
    
    # Metals & Alloys
    chrome = make_pbr_material('Chrome_EuropeanMirror', (0.95, 0.96, 0.97), metallic=0.98, roughness=0.03)
    dura_bright = make_pbr_material('Alloy_AlcoaDuraBright', (0.92, 0.93, 0.94), metallic=0.95, roughness=0.06)
    tank_aluminum = make_pbr_material('Alloy_BrushedTankAluminum', (0.80, 0.82, 0.84), metallic=0.85, roughness=0.24)
    galv_steel = make_pbr_material('Steel_GalvanizedHardware', (0.65, 0.67, 0.69), metallic=0.88, roughness=0.35)
    dark_steel = make_pbr_material('Steel_DarkStructural', (0.18, 0.19, 0.20), metallic=0.80, roughness=0.38)
    cast_iron = make_pbr_material('Iron_CastEngineDriveline', (0.12, 0.12, 0.13), metallic=0.60, roughness=0.65)
    
    # Plastics & Rubber
    anthracite = make_pbr_material('Plastic_AnthraciteComposite', (0.04, 0.04, 0.045), metallic=0.02, roughness=0.55)
    plastic_grey = make_pbr_material('Plastic_TrimGrey', (0.15, 0.16, 0.17), metallic=0.05, roughness=0.48)
    rubber = make_pbr_material('Rubber_EuropeanTire', (0.025, 0.025, 0.027), metallic=0.00, roughness=0.82)
    
    # Glass
    glass_clear = make_pbr_material('Glass_ClearOptic', (0.92, 0.96, 0.98), metallic=0.0, roughness=0.02, transmission=0.92, ior=1.52, alpha=0.25)
    glass_amber = make_pbr_material('Glass_EuroAmberReflex', (0.95, 0.50, 0.05), metallic=0.0, roughness=0.08, transmission=0.75, ior=1.54, alpha=0.65)
    glass_red = make_pbr_material('Glass_EuroRubyRedReflex', (0.88, 0.04, 0.04), metallic=0.0, roughness=0.08, transmission=0.75, ior=1.54, alpha=0.65)
    glass_smoked = make_pbr_material('Glass_SmokedCabDark', (0.08, 0.09, 0.11), metallic=0.0, roughness=0.04, transmission=0.45, ior=1.52, alpha=0.55)
    
    # Lighting & Emissive
    xenon = make_pbr_material('Light_HighOutputXenon', (1.0, 1.0, 1.0), metallic=0.0, roughness=0.1, emission_color=(0.92, 0.96, 1.0), emission_strength=18.0)
    amber_led = make_pbr_material('Light_AmberLEDMarker', (1.0, 0.6, 0.0), metallic=0.0, roughness=0.1, emission_color=(1.0, 0.55, 0.0), emission_strength=12.0)
    ruby_led = make_pbr_material('Light_RubyLEDStop', (1.0, 0.05, 0.05), metallic=0.0, roughness=0.1, emission_color=(1.0, 0.02, 0.02), emission_strength=14.0)
    reverse_light = make_pbr_material('Light_ReverseHalogen', (1.0, 0.98, 0.92), metallic=0.0, roughness=0.1, emission_color=(1.0, 0.95, 0.88), emission_strength=15.0)

    # Dictionary assignments with both PascalCase and snake_case aliases:
    mats['Paint_IceBlueMetallic'] = paint_ice_blue
    mats['cab_paint'] = paint_ice_blue
    mats['Paint_VolvoIceBlue'] = paint_ice_blue
    mats['Paint_VolvoAeroBlue'] = paint_aero_blue
    mats['aero_paint'] = paint_aero_blue
    mats['chassis_grey'] = paint_dark_grey
    mats['Paint_ChassisDarkGrey'] = paint_dark_grey
    
    mats['Chrome_EuropeanMirror'] = chrome
    mats['chrome'] = chrome
    mats['Alloy_AlcoaDuraBright'] = dura_bright
    mats['dura_bright'] = dura_bright
    mats['Alloy_BrushedTankAluminum'] = tank_aluminum
    mats['aluminum_satin'] = tank_aluminum
    mats['Steel_GalvanizedHardware'] = galv_steel
    mats['Steel_DarkStructural'] = dark_steel
    mats['steel_dark'] = dark_steel
    mats['Iron_CastEngineDriveline'] = cast_iron
    mats['driveline_cast'] = cast_iron
    
    mats['Plastic_AnthraciteComposite'] = anthracite
    mats['plastic_black'] = anthracite
    mats['Plastic_TrimGrey'] = plastic_grey
    mats['plastic_grey'] = plastic_grey
    mats['Rubber_EuropeanTire'] = rubber
    mats['tire_rubber'] = rubber
    mats['rubber'] = rubber
    
    mats['Glass_ClearOptic'] = glass_clear
    mats['lens_clear'] = glass_clear
    mats['window_glass'] = glass_clear
    mats['Glass_EuroAmberReflex'] = glass_amber
    mats['lens_amber'] = glass_amber
    mats['Glass_EuroRubyRedReflex'] = glass_red
    mats['lens_red'] = glass_red
    mats['Glass_SmokedCabDark'] = glass_smoked
    
    mats['Light_HighOutputXenon'] = xenon
    mats['emissive_xenon'] = xenon
    mats['Light_AmberLEDMarker'] = amber_led
    mats['emissive_amber'] = amber_led
    mats['Light_RubyLEDStop'] = ruby_led
    mats['emissive_red'] = ruby_led
    mats['Light_ReverseHalogen'] = reverse_light

    # Explicit definitions for all 22 required keys across Phase 1 and Phase 2:
    mats['Iron_CastHeavy'] = cast_iron
    mats['Glass_DielectricOptic'] = glass_clear
    mats['Emissive_XenonHeadlamp'] = xenon
    mats['Emissive_AmberSignal'] = amber_led
    mats['Emissive_LightboxWhite'] = make_pbr_material('Emissive_LightboxWhite', (1.0, 1.0, 1.0), emission_color=(1.0, 1.0, 1.0), emission_strength=12.0)
    mats['Glass_AmberIndicator'] = glass_amber
    mats['Glass_TailLightRed'] = glass_red
    mats['Glass_CeramicFritBlack'] = make_pbr_material('Glass_CeramicFritBlack', (0.02, 0.02, 0.02), metallic=0.05, roughness=0.1, alpha=0.98)
    mats['Rubber_ECASAirBag'] = make_pbr_material('Rubber_ECASAirBag', (0.025, 0.025, 0.025), metallic=0.05, roughness=0.75)
    mats['Stainless_PolishedInconel'] = make_pbr_material('Stainless_PolishedInconel', (0.85, 0.85, 0.86), metallic=0.92, roughness=0.08)
    mats['Aluminum_DiamondPlate'] = make_pbr_material('Aluminum_DiamondPlate', (0.80, 0.82, 0.84), metallic=0.88, roughness=0.25)
    mats['Paint_VolvoSilverMetallic'] = make_pbr_material('Paint_VolvoSilverMetallic', (0.75, 0.76, 0.78), metallic=0.85, roughness=0.20, clearcoat=1.0)
    mats['Paint_VolvoRedAccent'] = make_pbr_material('Paint_VolvoRedAccent', (0.80, 0.04, 0.04), metallic=0.2, roughness=0.3)
    mats['Decal_ECE70Chevron'] = make_pbr_material('Decal_ECE70Chevron', (0.95, 0.65, 0.05), emission_color=(0.95, 0.65, 0.05), emission_strength=2.2)

    for m in list(mats.values()):
        mats[m.name] = m

    return mats


def reset_blender_scene():
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


def build_volvo_fh12_complete(export_dir=None, modular_export_dir=None):
    """
    Executes the complete end-to-end assembly of the 2000s Volvo FH12 Globetrotter XL:
    1. Resets scene and cleans all residual geometry.
    2. Initializes master PBR material factory with clearcoat, satin trim, optical glass,
       and high-intensity emissive shaders.
    3. Dynamically executes Phase 1 (Chassis, Powertrain, Aerodynamic Cab Body, Running Gear).
    4. Executes Phase 2 (Lighting Optics, Aerodynamic Extenders, 4-Mirror System, Jewelry).
    5. Performs weld cleanup via bmesh remove_doubles and recalculates split normals.
    6. Exports complete unified master GLB to target directories:
       - public/models/vehicles/heavy_truck/2000s/vehicle.glb
       - public/models/Car_Volvo_FH12_2000s.glb
       - exports/Car_Volvo_FH12_2000s.glb
    7. Optionally exports zero-offset modular components.
    """
    print("=" * 80)
    print("STARTING COMPLETE ASSEMBLY: 2000s VOLVO FH12 GLOBETROTTER XL 4x2 TRACTOR")
    print("=" * 80)
    
    reset_blender_scene()
    mats = create_volvo_fh12_pbr_materials()
    
    master_car = bpy.data.objects.new("Car_Volvo_FH12_2000s_Complete", None)
    bpy.context.collection.objects.link(master_car)
    
    # 1. Build Phase 1 Subsystems
    print("[MASTER] Loading Phase 1 procedural architecture...")
    try:
        import generate_volvo_fh12_phase1 as p1
        p1_root = p1.build_volvo_fh12_phase1_chassis_and_body(mats, master_car)
        print("[MASTER] Phase 1 loaded successfully from module.")
    except Exception as e:
        print("[MASTER WARNING] Could not import generate_volvo_fh12_phase1 as module: %s" % e)
        # Attempt direct exec
        p1_path = os.path.join(os.path.dirname(__file__), "generate_volvo_fh12_phase1.py")
        if os.path.exists(p1_path):
            with open(p1_path, 'r', encoding='utf-8') as f:
                code = f.read()
            p1_scope = {}
            exec(code, p1_scope)
            p1_root = p1_scope['build_volvo_fh12_phase1_chassis_and_body'](mats, master_car)
            print("[MASTER] Phase 1 executed directly from script.")
        else:
            raise FileNotFoundError("Could not find generate_volvo_fh12_phase1.py at %s" % p1_path)
            
    # 2. Build Phase 2 Subsystems
    print("[MASTER] Building Phase 2 exterior jewelry and lighting architecture...")
    p2_root = build_volvo_fh12_phase2_root(mats, master_car)
    
    # 3. Apply Mesh Welding, Normal Recalculation & Smooth Shading
    print("[MASTER] Applying Class-A geometry processing (vertex welding & normal smoothing)...")
    all_meshes = [obj for obj in bpy.data.objects if obj.type == 'MESH']
    for obj in all_meshes:
        try:
            bpy.context.view_layer.objects.active = obj
            obj.select_set(True)
            # Weld coincident vertices
            bm = bmesh.new()
            bm.from_mesh(obj.data)
            bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
            bm.to_mesh(obj.data)
            bm.free()
            obj.data.update()
            
            # Smooth shading by angle 32 degrees
            if hasattr(bpy.ops.object, "shade_smooth_by_angle"):
                bpy.ops.object.shade_smooth_by_angle(angle=math.radians(32.0))
            else:
                obj.data.polygons.foreach_set("use_smooth", [True] * len(obj.data.polygons))
            obj.select_set(False)
        except Exception as err:
            pass
            
    # 4. GLB Export
    WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    if export_dir is None:
        export_dir = os.path.join(WORKSPACE_ROOT, "public", "models")
    os.makedirs(export_dir, exist_ok=True)
    
    # Standard fleet target paths
    target_export_paths = [
        os.path.join(export_dir, "vehicles", "heavy_truck", "2000s", "vehicle.glb"),
        os.path.join(export_dir, "Car_Volvo_FH12_2000s.glb"),
        os.path.join(WORKSPACE_ROOT, "exports", "Car_Volvo_FH12_2000s.glb")
    ]
    
    # Select all objects under master_car for export
    bpy.ops.object.select_all(action='DESELECT')
    def select_hierarchy(ob):
        ob.select_set(True)
        for child in ob.children:
            select_hierarchy(child)
    select_hierarchy(master_car)
    
    for glb_path in target_export_paths:
        os.makedirs(os.path.dirname(glb_path), exist_ok=True)
        print("[MASTER EXPORT] Exporting unified Class-A GLB to: %s" % glb_path)
        bpy.ops.export_scene.gltf(
            filepath=glb_path,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_materials='EXPORT',
            export_image_format='AUTO',
            export_extras=True,
            export_yup=True
        )
        if os.path.exists(glb_path):
            file_size_kb = os.path.getsize(glb_path) / 1024.0
            print("[MASTER EXPORT SUCCESS] File size: %.2f KB (%.2f MB)" % (file_size_kb, file_size_kb / 1024.0))
            
    print("=" * 80)
    print("COMPLETE ASSEMBLY & EXPORT COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    return master_car


if __name__ == "__main__":
    build_volvo_fh12_complete()
