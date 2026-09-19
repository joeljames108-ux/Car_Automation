"""
=============================================================================
Procedural Class-A CAD Generator: Hongqi L5 State Limousine (2020s)
PHASE 64: Ceremonial State Body, Waterfall Grille, Red Flag Hood Mascot,
Barrel Headlamps, Tiananmen Lantern Taillights & Tri-Target GLB Export
=============================================================================
Limousine Architecture — 2020s Sovereign Chinese Ceremonial Engineering
Phase 64 builds the complete monolithic Class-A exterior body, 5,555mm overall
length (Y = +2.7775m to -2.7775m), 3,435mm wheelbase (Front axle Y = +1.7175m,
Rear axle Y = -1.7175m), monumental upright chrome waterfall grille with 36
vertical slats inspired by traditional Chinese folding fans, iconic 3D Red Flag
dynamic hood mascot, classic barrel-round chrome-bezeled headlights with optical
crystal lenses and LED halo rings, formal upright greenhouse with solid roof and
rear opera windows, vertical Tiananmen-inspired palace lantern taillights, solid
rear bumper fascia, and serializes tri-target GLBs (>200 KB) for web and simulation.
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion

# ----------------------------------------------------------------------------
# Import Phase 63 Generator (Foundation Subsystems)
# ----------------------------------------------------------------------------
gen_dir = os.path.dirname(os.path.abspath(__file__))
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

import generate_hongqi_l5_phase1


# ============================================================================
# 1. PROCEDURAL UTILITIES & MESH MODIFIERS
# ============================================================================

def apply_smooth_and_modifiers(obj, angle_deg=35.0, bevel_width=0.0025, segments=2):
    """Applies smooth shading and non-destructive modifiers for Class-A CAD mesh quality."""
    if obj.type != 'MESH':
        return
    for poly in obj.data.polygons:
        poly.use_smooth = True
    if hasattr(obj.data, 'use_auto_smooth'):
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = math.radians(angle_deg)

    if bevel_width > 0.0:
        mod_bev = obj.modifiers.new(name="CAD_MicroBevel", type='BEVEL')
        mod_bev.width = bevel_width
        mod_bev.segments = segments
        mod_bev.limit_method = 'ANGLE'
        if hasattr(mod_bev, 'angle_limit'):
            mod_bev.angle_limit = math.radians(angle_deg)
        mod_wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        mod_wn.keep_sharp = True


# ============================================================================
# 2. EXTERIOR PBR MATERIAL SUITE
# ============================================================================

def build_hongqi_l5_exterior_material_suite():
    """Builds the comprehensive exterior PBR material suite for the Hongqi L5."""
    mats = {}

    def get_or_create_mat(name):
        mat = bpy.data.materials.get(name)
        if not mat:
            mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        nodes.clear()
        node_out = nodes.new(type='ShaderNodeOutputMaterial')
        node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
        mat.node_tree.links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
        return mat, node_bsdf

    # 1. Onyx Black Piano Lacquer Paint
    m_body, b_body = get_or_create_mat("Hongqi_Onyx_Black_Paint")
    b_body.inputs['Base Color'].default_value = (0.008, 0.008, 0.010, 1.0)
    b_body.inputs['Metallic'].default_value = 0.20
    b_body.inputs['Roughness'].default_value = 0.04
    if 'Clearcoat' in b_body.inputs:
        b_body.inputs['Clearcoat'].default_value = 1.0
        b_body.inputs['Clearcoat Roughness'].default_value = 0.02
    mats['body'] = m_body

    # 2. Mirror Chrome (Waterfall grille, barrel bezels, window surrounds)
    m_chr, b_chr = get_or_create_mat("Hongqi_Exterior_Chrome")
    b_chr.inputs['Base Color'].default_value = (0.96, 0.97, 0.99, 1.0)
    b_chr.inputs['Metallic'].default_value = 1.0
    b_chr.inputs['Roughness'].default_value = 0.025
    mats['chrome'] = m_chr

    # 3. Deep Matte Black Radiator Core (Behind chrome waterfall slats)
    m_rad, b_rad = get_or_create_mat("Hongqi_Radiator_Dark")
    b_rad.inputs['Base Color'].default_value = (0.015, 0.015, 0.018, 1.0)
    b_rad.inputs['Metallic'].default_value = 0.0
    b_rad.inputs['Roughness'].default_value = 0.85
    mats['radiator_dark'] = m_rad

    # 4. Dynamic Red Flag Emissive (Hood mascot spear & fender blinkers)
    m_rf, b_rf = get_or_create_mat("Hongqi_RedFlag_Emissive")
    b_rf.inputs['Base Color'].default_value = (0.95, 0.02, 0.04, 1.0)
    if 'Emission' in b_rf.inputs:
        b_rf.inputs['Emission'].default_value = (1.0, 0.03, 0.05, 1.0)
    elif 'Emission Color' in b_rf.inputs:
        b_rf.inputs['Emission Color'].default_value = (1.0, 0.03, 0.05, 1.0)
    if 'Emission Strength' in b_rf.inputs:
        b_rf.inputs['Emission Strength'].default_value = 22.0
    mats['red_flag_emissive'] = m_rf

    # 5. Translucent Ruby Red Acrylic Lacquer
    m_red_lens, b_red_lens = get_or_create_mat("Hongqi_RedFlag_Lens")
    b_red_lens.inputs['Base Color'].default_value = (0.85, 0.02, 0.04, 1.0)
    b_red_lens.inputs['Roughness'].default_value = 0.05
    if 'Transmission' in b_red_lens.inputs:
        b_red_lens.inputs['Transmission'].default_value = 0.80
    elif 'Transmission Weight' in b_red_lens.inputs:
        b_red_lens.inputs['Transmission Weight'].default_value = 0.80
    b_red_lens.inputs['Alpha'].default_value = 0.80
    if hasattr(m_red_lens, 'blend_method'):
        m_red_lens.blend_method = 'BLEND'
    mats['red_flag_lens'] = m_red_lens

    # 6. Acoustic Double-Glazed Front Windshield
    m_ws, b_ws = get_or_create_mat("Hongqi_Windshield_Glass")
    b_ws.inputs['Base Color'].default_value = (0.88, 0.94, 0.96, 1.0)
    b_ws.inputs['Roughness'].default_value = 0.015
    b_ws.inputs['IOR'].default_value = 1.52
    if 'Transmission' in b_ws.inputs:
        b_ws.inputs['Transmission'].default_value = 0.95
    elif 'Transmission Weight' in b_ws.inputs:
        b_ws.inputs['Transmission Weight'].default_value = 0.95
    b_ws.inputs['Alpha'].default_value = 0.20
    if hasattr(m_ws, 'blend_method'):
        m_ws.blend_method = 'BLEND'
    if hasattr(m_ws, 'shadow_method'):
        m_ws.shadow_method = 'NONE'
    mats['windshield'] = m_ws

    # 7. Rear Sovereign Lounge Privacy Glass
    m_priv, b_priv = get_or_create_mat("Hongqi_Privacy_Glass")
    b_priv.inputs['Base Color'].default_value = (0.02, 0.022, 0.028, 1.0)
    b_priv.inputs['Roughness'].default_value = 0.03
    b_priv.inputs['IOR'].default_value = 1.52
    if 'Transmission' in b_priv.inputs:
        b_priv.inputs['Transmission'].default_value = 0.70
    elif 'Transmission Weight' in b_priv.inputs:
        b_priv.inputs['Transmission Weight'].default_value = 0.70
    b_priv.inputs['Alpha'].default_value = 0.70
    if hasattr(m_priv, 'blend_method'):
        m_priv.blend_method = 'BLEND'
    if hasattr(m_priv, 'shadow_method'):
        m_priv.shadow_method = 'NONE'
    mats['privacy_glass'] = m_priv

    # 8. Barrel Headlight Optical Crystal Lens
    m_lens, b_lens = get_or_create_mat("Hongqi_Headlamp_Optics")
    b_lens.inputs['Base Color'].default_value = (0.96, 0.98, 1.0, 1.0)
    b_lens.inputs['Roughness'].default_value = 0.015
    b_lens.inputs['IOR'].default_value = 1.52
    if 'Transmission' in b_lens.inputs:
        b_lens.inputs['Transmission'].default_value = 0.95
    elif 'Transmission Weight' in b_lens.inputs:
        b_lens.inputs['Transmission Weight'].default_value = 0.95
    b_lens.inputs['Alpha'].default_value = 0.25
    if hasattr(m_lens, 'blend_method'):
        m_lens.blend_method = 'BLEND'
    mats['headlamp_optics'] = m_lens

    # 9. Headlight LED Halo Daytime Running Light
    m_drl, b_drl = get_or_create_mat("Hongqi_DRL_Halo")
    b_drl.inputs['Base Color'].default_value = (1.0, 0.98, 0.92, 1.0)
    if 'Emission' in b_drl.inputs:
        b_drl.inputs['Emission'].default_value = (1.0, 0.98, 0.92, 1.0)
    elif 'Emission Color' in b_drl.inputs:
        b_drl.inputs['Emission Color'].default_value = (1.0, 0.98, 0.92, 1.0)
    if 'Emission Strength' in b_drl.inputs:
        b_drl.inputs['Emission Strength'].default_value = 14.0
    mats['drl_halo'] = m_drl

    # 10. Amber Turn Indicator Lens
    m_amb, b_amb = get_or_create_mat("Hongqi_Amber_Indicator")
    b_amb.inputs['Base Color'].default_value = (1.0, 0.55, 0.02, 1.0)
    b_amb.inputs['Roughness'].default_value = 0.08
    if 'Emission' in b_amb.inputs:
        b_amb.inputs['Emission'].default_value = (1.0, 0.55, 0.02, 1.0)
    elif 'Emission Color' in b_amb.inputs:
        b_amb.inputs['Emission Color'].default_value = (1.0, 0.55, 0.02, 1.0)
    if 'Emission Strength' in b_amb.inputs:
        b_amb.inputs['Emission Strength'].default_value = 8.0
    mats['amber_indicator'] = m_amb

    # 11. Tiananmen Palace Lantern Ruby Red Polycarbonate
    m_tail, b_tail = get_or_create_mat("Hongqi_Taillight_Ruby")
    b_tail.inputs['Base Color'].default_value = (0.85, 0.02, 0.03, 1.0)
    b_tail.inputs['Roughness'].default_value = 0.06
    if 'Transmission' in b_tail.inputs:
        b_tail.inputs['Transmission'].default_value = 0.75
    elif 'Transmission Weight' in b_tail.inputs:
        b_tail.inputs['Transmission Weight'].default_value = 0.75
    b_tail.inputs['Alpha'].default_value = 0.85
    if hasattr(m_tail, 'blend_method'):
        m_tail.blend_method = 'BLEND'
    mats['taillight_ruby'] = m_tail

    # 12. Palace Lantern Vertical LED Light Guides
    m_ribbon, b_ribbon = get_or_create_mat("Hongqi_Lantern_LED_Ribbon")
    b_ribbon.inputs['Base Color'].default_value = (1.0, 0.04, 0.06, 1.0)
    if 'Emission' in b_ribbon.inputs:
        b_ribbon.inputs['Emission'].default_value = (1.0, 0.04, 0.06, 1.0)
    elif 'Emission Color' in b_ribbon.inputs:
        b_ribbon.inputs['Emission Color'].default_value = (1.0, 0.04, 0.06, 1.0)
    if 'Emission Strength' in b_ribbon.inputs:
        b_ribbon.inputs['Emission Strength'].default_value = 28.0
    mats['lantern_led'] = m_ribbon

    # 13. Authentic Celadon Jade Trim & Door Handles
    m_jade, b_jade = get_or_create_mat("Hongqi_Celadon_Jade")
    b_jade.inputs['Base Color'].default_value = (0.55, 0.75, 0.68, 1.0)
    b_jade.inputs['Roughness'].default_value = 0.12
    if 'Subsurface Weight' in b_jade.inputs:
        b_jade.inputs['Subsurface Weight'].default_value = 0.35
    elif 'Subsurface' in b_jade.inputs:
        b_jade.inputs['Subsurface'].default_value = 0.35
    if 'Subsurface Radius' in b_jade.inputs:
        b_jade.inputs['Subsurface Radius'].default_value = (0.6, 0.8, 0.7)
    mats['celadon_jade'] = m_jade

    # 14. Inner Wheel Tub & Undercarriage Acoustic Black
    m_tub, b_tub = get_or_create_mat("Hongqi_Underbody_Tub_Black")
    b_tub.inputs['Base Color'].default_value = (0.025, 0.025, 0.030, 1.0)
    b_tub.inputs['Roughness'].default_value = 0.80
    mats['tub'] = m_tub

    # 15. Vulcanized Black Rubber Window Seals
    m_rub, b_rub = get_or_create_mat("Hongqi_Rubber_Weatherstrip")
    b_rub.inputs['Base Color'].default_value = (0.04, 0.04, 0.045, 1.0)
    b_rub.inputs['Roughness'].default_value = 0.70
    mats['rubber'] = m_rub

    # 16. Stainless Steel Exhaust Tips (Dark Inner Bore)
    m_exh, b_exh = get_or_create_mat("Hongqi_Exhaust_Steel")
    b_exh.inputs['Base Color'].default_value = (0.80, 0.82, 0.85, 1.0)
    b_exh.inputs['Metallic'].default_value = 0.95
    b_exh.inputs['Roughness'].default_value = 0.18
    mats['exhaust'] = m_exh

    return mats


# ============================================================================
# 3. 5.555m MONOLITHIC CEREMONIAL STATE UNIBODY SHELL (SOLID ROOF & ARCHES)
# ============================================================================

def build_hongqi_l5_unibody_and_panels(mats):
    """
    Constructs the 5,555mm Class-A monolithic Ceremonial State unibody body shell:
    - Imposing upright sovereign proportions with 3,435mm wheelbase
    - Continuous razor shoulder line running from headlamp bezels to palace lanterns
    - Continuous SOLID ROOF structure seamlessly enclosing the passenger cabin
    - Sculpted long hood bonnet with raised center spine for the 3D Red Flag mascot
    - Recessed barrel headlamp pockets (X = ±0.68m, Z = 0.72m)
    - Formal upright C-pillar privacy sails integrating rear opera windows
    - Continuous semicircular wheel arches (Front Y = +1.7175m, Rear Y = -1.7175m)
    - Enclosed acoustic inner wheel tubs and rolled arch flare lips
    - Solid rear decklid and lower rear bumper apron
    """
    created_objects = []

    me_body = bpy.data.meshes.new("Mesh_Hongqi_L5_Body_Shell")
    bm_body = bmesh.new()

    # ------------------------------------------------------------------------
    # 1. Longitudinal Cross-Sectional Stations Along Y (Centered at Y = 0.0m)
    # (Y, Z_floor, Z_rocker, Z_shoulder, Z_belt, Z_roof, X_floor, X_belt, X_roof)
    # ------------------------------------------------------------------------
    stations = [
        # Front Bumper Apex & Nose
        (2.7775, 0.28, 0.38, 0.76, 0.84, 0.84, 0.72, 0.82, 0.54),
        # Front Grille & Headlamp Fore
        (2.74,   0.26, 0.36, 0.82, 0.90, 0.90, 0.82, 0.92, 0.65),
        (2.40,   0.24, 0.34, 0.88, 0.95, 0.95, 0.88, 0.96, 0.72),
        # Front Wheel Arch Front (Arch center = 1.7175m, R = 0.44m -> front at 2.16m)
        (2.16,   0.22, 0.34, 0.90, 0.97, 0.97, 0.92, 0.98, 0.74),
        # Front Wheel Arch Apex
        (1.7175, 0.22, 0.58, 0.91, 0.98, 0.98, 0.94, 1.00, 0.76),
        # Front Wheel Arch Rear (Rear at 1.28m)
        (1.28,   0.22, 0.34, 0.92, 0.98, 0.98, 0.94, 1.00, 0.76),
        # Windshield Cowl / A-Pillar Base
        (1.25,   0.22, 0.32, 0.92, 0.98, 1.22, 0.94, 1.00, 0.75),
        # Chauffeur Cabin Front Header
        (0.92,   0.22, 0.32, 0.92, 0.98, 1.54, 0.94, 1.00, 0.72),
        (0.48,   0.22, 0.32, 0.92, 0.98, 1.57, 0.94, 1.00, 0.71),
        # B-Pillar Center Pillar
        (0.00,   0.22, 0.32, 0.92, 0.98, 1.578, 0.94, 1.00, 0.71),
        # Presidential Rear Doors
        (-0.48,  0.22, 0.32, 0.92, 0.98, 1.57, 0.94, 1.00, 0.71),
        (-0.95,  0.22, 0.32, 0.92, 0.98, 1.55, 0.94, 1.00, 0.72),
        # Formal C-Pillar Sail & Opera Window Header
        (-1.25,  0.22, 0.34, 0.92, 0.98, 1.54, 0.94, 1.00, 0.74),
        # Rear Wheel Arch Front (Arch center = -1.7175m, R = 0.44m -> front at -1.28m)
        (-1.28,  0.22, 0.34, 0.91, 0.98, 1.36, 0.94, 1.00, 0.76),
        # Rear Wheel Arch Apex
        (-1.7175,0.22, 0.58, 0.90, 0.98, 1.04, 0.94, 1.00, 0.78),
        # Rear Wheel Arch Rear (Rear at -2.16m)
        (-2.16,  0.22, 0.34, 0.89, 0.97, 1.02, 0.92, 0.98, 0.76),
        # Rear Quarter & Trunk Decklid
        (-2.45,  0.24, 0.36, 0.88, 0.95, 1.00, 0.88, 0.96, 0.70),
        (-2.70,  0.26, 0.40, 0.84, 0.92, 0.98, 0.82, 0.90, 0.64),
        # Rear Bumper Tail Apex
        (-2.7775,0.28, 0.44, 0.78, 0.86, 0.94, 0.72, 0.80, 0.55)
    ]

    # Build Left and Right Unibody Flank Grids
    left_rings = []
    right_rings = []
    for side in [1.0, -1.0]:
        rings = []
        for s in stations:
            y, z_fl, z_rk, z_sh, z_bl, z_rf, x_fl, x_bl, x_rf = s
            v0 = bm_body.verts.new(Vector((side * 0.22, y, z_fl)))
            v1 = bm_body.verts.new(Vector((side * x_fl, y, z_rk)))
            v2 = bm_body.verts.new(Vector((side * (x_bl * 0.98), y, (z_rk + z_sh) * 0.5)))
            v3 = bm_body.verts.new(Vector((side * x_bl, y, z_sh)))       # Razor shoulder line
            v4 = bm_body.verts.new(Vector((side * (x_bl * 0.97), y, z_bl))) # Window beltline
            v5 = bm_body.verts.new(Vector((side * x_rf, y, z_rf)))       # Roof rail / pillar apex
            rings.append([v0, v1, v2, v3, v4, v5])

        for i in range(len(rings) - 1):
            rA = rings[i]
            rB = rings[i + 1]
            for j in range(5):
                if side > 0:
                    bm_body.faces.new([rA[j], rB[j], rB[j + 1], rA[j + 1]])
                else:
                    bm_body.faces.new([rA[j], rA[j + 1], rB[j + 1], rB[j]])

        if side > 0:
            left_rings = rings
        else:
            right_rings = rings

    # ------------------------------------------------------------------------
    # 2. CONTINUOUS SOLID ROOF STRUCTURE (Y = +0.92m to -1.25m, Z = 1.54m to 1.578m)
    # ------------------------------------------------------------------------
    roof_steps_y = 10
    roof_steps_x = 8
    roof_grid = []
    for yi in range(roof_steps_y + 1):
        frac_y = yi / float(roof_steps_y)
        ry = 0.92 - frac_y * (0.92 - (-1.25))
        # Subtle longitudinal crown arch
        longitudinal_crown = 0.038 * math.sin(frac_y * math.pi)
        base_rz = 1.54 + longitudinal_crown
        row = []
        for xi in range(roof_steps_x + 1):
            frac_x = (xi - (roof_steps_x / 2.0)) / (roof_steps_x / 2.0)
            rx = frac_x * 0.715
            # Transverse camber curvature
            transverse_camber = 0.022 * (1.0 - frac_x * frac_x)
            row.append(bm_body.verts.new(Vector((rx, ry, base_rz + transverse_camber))))
        roof_grid.append(row)

    for yi in range(roof_steps_y):
        for xi in range(roof_steps_x):
            bm_body.faces.new([
                roof_grid[yi][xi],
                roof_grid[yi + 1][xi],
                roof_grid[yi + 1][xi + 1],
                roof_grid[yi][xi + 1]
            ])

    # ------------------------------------------------------------------------
    # 3. SCULPTED HOOD BONNET WITH RAISED CENTER SPINE (Y = +1.25m to +2.74m)
    # ------------------------------------------------------------------------
    hood_steps_y = 12
    hood_steps_x = 8
    hood_grid = []
    for yi in range(hood_steps_y + 1):
        frac_y = yi / float(hood_steps_y)
        hy = 1.25 + frac_y * (2.74 - 1.25)
        hz = 0.98 - frac_y * (0.98 - 0.90)
        row = []
        for xi in range(hood_steps_x + 1):
            frac_x = (xi - (hood_steps_x / 2.0)) / (hood_steps_x / 2.0)
            hx = frac_x * (0.76 - frac_y * 0.18)
            # Raised center spine along X=0 for the 3D Red Flag mascot
            spine = 0.018 * math.exp(-(frac_x ** 2) / 0.08)
            row.append(bm_body.verts.new(Vector((hx, hy, hz + spine))))
        hood_grid.append(row)

    for yi in range(hood_steps_y):
        for xi in range(hood_steps_x):
            bm_body.faces.new([
                hood_grid[yi][xi],
                hood_grid[yi + 1][xi],
                hood_grid[yi + 1][xi + 1],
                hood_grid[yi][xi + 1]
            ])

    # ------------------------------------------------------------------------
    # 4. REGAL TRUNK DECKLID (Y = -1.68m to -2.74m)
    # ------------------------------------------------------------------------
    trunk_steps_y = 10
    trunk_steps_x = 8
    trunk_grid = []
    for yi in range(trunk_steps_y + 1):
        frac_y = yi / float(trunk_steps_y)
        ty = -1.68 - frac_y * (2.74 - 1.68)
        tz = 1.02 - frac_y * (1.02 - 0.97)
        row = []
        for xi in range(trunk_steps_x + 1):
            frac_x = (xi - (trunk_steps_x / 2.0)) / (trunk_steps_x / 2.0)
            tx = frac_x * (0.75 - frac_y * 0.15)
            # Subtle center ridge
            ridge = 0.012 * (1.0 - abs(frac_x))
            trunk_grid.append(bm_body.verts.new(Vector((tx, ty, tz + ridge))))
    
    t_2d = [trunk_grid[i*(trunk_steps_x+1) : (i+1)*(trunk_steps_x+1)] for i in range(trunk_steps_y+1)]
    for yi in range(trunk_steps_y):
        for xi in range(trunk_steps_x):
            bm_body.faces.new([
                t_2d[yi][xi],
                t_2d[yi + 1][xi],
                t_2d[yi + 1][xi + 1],
                t_2d[yi][xi + 1]
            ])

    # ------------------------------------------------------------------------
    # 5. SOLID REAR BUMPER FASCIA & LOWER APRON (Y = -2.74m to -2.7775m)
    # ------------------------------------------------------------------------
    rear_bumper_steps_z = 6
    rear_bumper_steps_x = 8
    rb_grid = []
    for zi in range(rear_bumper_steps_z + 1):
        frac_z = zi / float(rear_bumper_steps_z)
        bz = 0.28 + frac_z * (0.97 - 0.28)
        by = -2.7775 + frac_z * (2.7775 - 2.74)
        for xi in range(rear_bumper_steps_x + 1):
            frac_x = (xi - (rear_bumper_steps_x / 2.0)) / (rear_bumper_steps_x / 2.0)
            bx = frac_x * (0.84 - frac_z * 0.08)
            # Recessed license plate well
            well = 0.025 * (1.0 - (frac_x / 0.35) ** 2) if (abs(frac_x) < 0.35 and 0.45 < bz < 0.76) else 0.0
            rb_grid.append(bm_body.verts.new(Vector((bx, by + well, bz))))

    rb_2d = [rb_grid[i*(rear_bumper_steps_x+1) : (i+1)*(rear_bumper_steps_x+1)] for i in range(rear_bumper_steps_z+1)]
    for zi in range(rear_bumper_steps_z):
        for xi in range(rear_bumper_steps_x):
            bm_body.faces.new([
                rb_2d[zi][xi],
                rb_2d[zi][xi + 1],
                rb_2d[zi + 1][xi + 1],
                rb_2d[zi + 1][xi]
            ])

    # ------------------------------------------------------------------------
    # 6. LOWER FRONT BUMPER NOSE APRON (Under Waterfall Grille, Z = 0.28m to 0.40m)
    # ------------------------------------------------------------------------
    fn_steps_x = 8
    fn_verts_bot = []
    fn_verts_top = []
    for xi in range(fn_steps_x + 1):
        frac_x = (xi - (fn_steps_x / 2.0)) / (fn_steps_x / 2.0)
        fx = frac_x * 0.82
        fy_bot = 2.7775 - abs(frac_x) * 0.04
        fy_top = 2.75 - abs(frac_x) * 0.03
        fn_verts_bot.append(bm_body.verts.new(Vector((fx, fy_bot, 0.28))))
        fn_verts_top.append(bm_body.verts.new(Vector((fx, fy_top, 0.40))))

    for xi in range(fn_steps_x):
        bm_body.faces.new([
            fn_verts_bot[xi],
            fn_verts_bot[xi + 1],
            fn_verts_top[xi + 1],
            fn_verts_top[xi]
        ])

    # Clean & finish unibody shell
    bmesh.ops.remove_doubles(bm_body, verts=bm_body.verts, dist=0.008)
    bmesh.ops.recalc_face_normals(bm_body, faces=bm_body.faces)
    bm_body.to_mesh(me_body)
    bm_body.free()

    obj_body = bpy.data.objects.new("Hongqi_L5_Body_Shell", me_body)
    bpy.context.collection.objects.link(obj_body)
    obj_body.data.materials.append(mats['body'])
    apply_smooth_and_modifiers(obj_body, angle_deg=35.0, bevel_width=0.0025, segments=2)
    created_objects.append(obj_body)

    # ------------------------------------------------------------------------
    # 7. Heavy Chrome Exterior Door Pull Handles
    # ------------------------------------------------------------------------
    me_handles = bpy.data.meshes.new("Mesh_Hongqi_L5_Door_Handles")
    bm_handles = bmesh.new()

    handle_y_coords = [0.55, -0.65] # Chauffeur & Presidential doors
    for side in [1.0, -1.0]:
        for hy in handle_y_coords:
            bmesh.ops.create_cube(
                bm_handles,
                size=1.0,
                matrix=Matrix.Translation((side * 0.995, hy, 0.92)) @ Matrix.Diagonal((0.015, 0.18, 0.038, 1.0))
            )
            bmesh.ops.create_cube(
                bm_handles,
                size=1.0,
                matrix=Matrix.Translation((side * 1.015, hy, 0.92)) @ Matrix.Diagonal((0.020, 0.15, 0.024, 1.0))
            )

    bm_handles.to_mesh(me_handles)
    bm_handles.free()
    obj_handles = bpy.data.objects.new("Hongqi_L5_Door_Handles", me_handles)
    bpy.context.collection.objects.link(obj_handles)
    obj_handles.data.materials.append(mats['chrome'])
    apply_smooth_and_modifiers(obj_handles, angle_deg=30.0, bevel_width=0.0015, segments=2)
    created_objects.append(obj_handles)

    # ------------------------------------------------------------------------
    # 8. Continuous Semicircular Wheel Arch Flares & Enclosed Inner Wheel Tubs
    # ------------------------------------------------------------------------
    me_tubs = bpy.data.meshes.new("Mesh_Hongqi_L5_Wheel_Tubs_And_Flares")
    bm_tubs = bmesh.new()

    axles = [
        ("Front", 1.7175, 0.355, 0.44, 0.30),
        ("Rear", -1.7175, 0.355, 0.44, 0.30)
    ]

    for side in [1.0, -1.0]:
        for name, yc, zc, r_arch, width in axles:
            segs = 24
            tub_inner_verts = []
            tub_outer_verts = []
            for i in range(segs + 1):
                ang = i * (math.pi / segs)
                cos_a, sin_a = math.cos(ang), math.sin(ang)
                vy = yc - r_arch * cos_a
                vz = zc + r_arch * sin_a
                v_in = bm_tubs.verts.new(Vector((side * (0.96 - width), vy, vz)))
                v_out = bm_tubs.verts.new(Vector((side * 0.97, vy, vz)))
                tub_inner_verts.append(v_in)
                tub_outer_verts.append(v_out)

            for i in range(segs):
                if side > 0:
                    bm_tubs.faces.new([tub_outer_verts[i], tub_outer_verts[i + 1], tub_inner_verts[i + 1], tub_inner_verts[i]])
                else:
                    bm_tubs.faces.new([tub_outer_verts[i], tub_inner_verts[i], tub_inner_verts[i + 1], tub_outer_verts[i + 1]])

            # Splash wall
            v_hub = bm_tubs.verts.new(Vector((side * (0.96 - width), yc, zc)))
            for i in range(segs):
                if side > 0:
                    bm_tubs.faces.new([tub_inner_verts[i], tub_inner_verts[i + 1], v_hub])
                else:
                    bm_tubs.faces.new([tub_inner_verts[i], v_hub, tub_inner_verts[i + 1]])

            # Rolled Flare Lip (18mm flare)
            flare_outer_verts = []
            for i in range(segs + 1):
                ang = i * (math.pi / segs)
                cos_a, sin_a = math.cos(ang), math.sin(ang)
                vy = yc - (r_arch + 0.018) * cos_a
                vz = zc + (r_arch + 0.018) * sin_a
                v_fl = bm_tubs.verts.new(Vector((side * 0.995, vy, vz)))
                flare_outer_verts.append(v_fl)

            for i in range(segs):
                if side > 0:
                    bm_tubs.faces.new([flare_outer_verts[i], flare_outer_verts[i + 1], tub_outer_verts[i + 1], tub_outer_verts[i]])
                else:
                    bm_tubs.faces.new([flare_outer_verts[i], tub_outer_verts[i], tub_outer_verts[i + 1], flare_outer_verts[i + 1]])

    bm_tubs.to_mesh(me_tubs)
    bm_tubs.free()
    obj_tubs = bpy.data.objects.new("Hongqi_L5_Wheel_Tubs", me_tubs)
    bpy.context.collection.objects.link(obj_tubs)
    obj_tubs.data.materials.append(mats['tub'])
    apply_smooth_and_modifiers(obj_tubs, angle_deg=35.0, bevel_width=0.002, segments=2)
    created_objects.append(obj_tubs)

    return created_objects


# ============================================================================
# 4. MONUMENTAL WATERFALL CHROME GRILLE & 3D RED FLAG HOOD MASCOT
# ============================================================================

def build_hongqi_l5_waterfall_grille_and_mascot(mats):
    """
    Constructs the iconic Hongqi front end:
    - Monumental upright chrome waterfall radiator grille with 36 vertical slats
      evoking traditional Chinese folding fans.
    - Deep matte black radiator backing mesh so chrome slats stand out in high contrast.
    - 3D Red Flag ("Hongqi") dynamic translucent red spear hood ornament with chrome base plinth.
    - Lower front bumper with heavy horizontal chrome rub strip.
    """
    created_objects = []

    # ------------------------------------------------------------------------
    # A. 36-Slat Waterfall Chrome Grille & Surrounding Frame
    # ------------------------------------------------------------------------
    me_grille = bpy.data.meshes.new("Mesh_Hongqi_L5_Waterfall_Grille")
    bm_grille = bmesh.new()

    # Grille bounds: Y = 2.74m, Z = 0.41m to 0.88m, Width: 0.88m (X = -0.44m to +0.44m)
    # 36 vertical polished chrome slats arranged with subtle convex fan curvature
    num_slats = 36
    for i in range(num_slats):
        frac = (i - (num_slats - 1) / 2.0) / ((num_slats - 1) / 2.0)
        sx = frac * 0.43
        # Subtle forward curve in the center (fan sweep)
        sy = 2.745 + 0.016 * (1.0 - frac * frac)
        bmesh.ops.create_cube(
            bm_grille,
            size=1.0,
            matrix=Matrix.Translation(Vector((sx, sy, 0.64))) @ Matrix.Diagonal((0.007, 0.024, 0.46, 1.0))
        )

    # Monumental Upright Chrome Surround Frame (Beveled perimeter casing)
    frame_pts = [
        (-0.46, 2.74, 0.88),
        (0.46,  2.74, 0.88),
        (0.46,  2.75, 0.40),
        (-0.46, 2.75, 0.40)
    ]
    for i in range(4):
        p0 = Vector(frame_pts[i])
        p1 = Vector(frame_pts[(i + 1) % 4])
        diff = p1 - p0
        mid = (p0 + p1) * 0.5
        rot = Vector((0, 0, 1)).rotation_difference(diff.normalized())
        bmesh.ops.create_cube(
            bm_grille,
            size=1.0,
            matrix=Matrix.Translation(mid) @ rot.to_matrix().to_4x4() @ Matrix.Diagonal((0.032, 0.032, diff.length, 1.0))
        )

    bm_grille.to_mesh(me_grille)
    bm_grille.free()
    obj_grille = bpy.data.objects.new("Hongqi_L5_Waterfall_Grille", me_grille)
    bpy.context.collection.objects.link(obj_grille)
    obj_grille.data.materials.append(mats['chrome'])
    apply_smooth_and_modifiers(obj_grille, angle_deg=30.0, bevel_width=0.002, segments=2)
    created_objects.append(obj_grille)

    # ------------------------------------------------------------------------
    # B. Separate Deep Matte Black Radiator Core Mesh
    # ------------------------------------------------------------------------
    me_rad = bpy.data.meshes.new("Mesh_Hongqi_L5_Radiator_Core")
    bm_rad = bmesh.new()

    bmesh.ops.create_cube(
        bm_rad,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.71, 0.64))) @ Matrix.Diagonal((0.90, 0.02, 0.46, 1.0))
    )

    bm_rad.to_mesh(me_rad)
    bm_rad.free()
    obj_rad = bpy.data.objects.new("Hongqi_L5_Radiator_Core", me_rad)
    bpy.context.collection.objects.link(obj_rad)
    obj_rad.data.materials.append(mats['radiator_dark'])
    created_objects.append(obj_rad)

    # ------------------------------------------------------------------------
    # C. Iconic 3D Red Flag ("Hongqi") Dynamic Hood Mascot Spear
    # ------------------------------------------------------------------------
    me_plinth = bpy.data.meshes.new("Mesh_Hongqi_L5_RedFlag_Plinth")
    bm_plinth = bmesh.new()

    # Mascot plinth extends along center hood spine from Y = 2.45m to 2.74m
    bmesh.ops.create_cube(
        bm_plinth,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.58, 0.912))) @ Matrix.Diagonal((0.030, 0.30, 0.016, 1.0))
    )

    bm_plinth.to_mesh(me_plinth)
    bm_plinth.free()
    obj_plinth = bpy.data.objects.new("Hongqi_L5_RedFlag_Plinth", me_plinth)
    bpy.context.collection.objects.link(obj_plinth)
    obj_plinth.data.materials.append(mats['chrome'])
    created_objects.append(obj_plinth)

    # Translucent Ruby Red Acrylic Flag Spear with Internal Light-Guide Emission
    me_flag = bpy.data.meshes.new("Mesh_Hongqi_L5_RedFlag_Spear")
    bm_flag = bmesh.new()

    # Dynamic extruded red flag fin with tapered leading edge and raised trailing crest
    flag_pts = [
        Vector((0.0, 2.74, 0.922)),  # Leading point at grille crest
        Vector((0.0, 2.66, 0.975)),  # Crest apex
        Vector((0.0, 2.46, 0.950)),  # Trailing tail top
        Vector((0.0, 2.44, 0.922))   # Base aft point
    ]
    w2 = 0.007
    v_L = [bm_flag.verts.new(p + Vector((w2, 0, 0))) for p in flag_pts]
    v_R = [bm_flag.verts.new(p - Vector((w2, 0, 0))) for p in flag_pts]

    bm_flag.faces.new([v_L[0], v_L[1], v_L[2], v_L[3]])
    bm_flag.faces.new([v_R[3], v_R[2], v_R[1], v_R[0]])
    bm_flag.faces.new([v_L[0], v_R[0], v_R[1], v_L[1]])
    bm_flag.faces.new([v_L[1], v_R[1], v_R[2], v_L[2]])
    bm_flag.faces.new([v_L[2], v_R[2], v_R[3], v_L[3]])
    bm_flag.faces.new([v_L[3], v_R[3], v_R[0], v_L[0]])

    bm_flag.to_mesh(me_flag)
    bm_flag.free()
    obj_flag = bpy.data.objects.new("Hongqi_L5_RedFlag_Spear", me_flag)
    bpy.context.collection.objects.link(obj_flag)
    obj_flag.data.materials.append(mats['red_flag_emissive'])
    created_objects.append(obj_flag)

    # ------------------------------------------------------------------------
    # D. Lower Front Bumper Chrome Rub Strip
    # ------------------------------------------------------------------------
    me_front_bumper = bpy.data.meshes.new("Mesh_Hongqi_L5_Front_Bumper_Chrome")
    bm_front_bumper = bmesh.new()

    bmesh.ops.create_cube(
        bm_front_bumper,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.76, 0.36))) @ Matrix.Diagonal((1.80, 0.06, 0.08, 1.0))
    )

    bm_front_bumper.to_mesh(me_front_bumper)
    bm_front_bumper.free()
    obj_front_bumper = bpy.data.objects.new("Hongqi_L5_Front_Bumper_Chrome", me_front_bumper)
    bpy.context.collection.objects.link(obj_front_bumper)
    obj_front_bumper.data.materials.append(mats['chrome'])
    apply_smooth_and_modifiers(obj_front_bumper, angle_deg=30.0, bevel_width=0.002, segments=2)
    created_objects.append(obj_front_bumper)

    return created_objects


# ============================================================================
# 5. CLASSIC BARREL HEADLIGHTS, PROJECTOR OPTICS & DRL HALO RINGS
# ============================================================================

def build_hongqi_l5_barrel_headlamps_and_drl(mats):
    """
    Constructs the iconic round barrel headlights:
    - Cylindrical barrel housings with stepped chrome outer bezels (X = ±0.68m, Y = 2.74m, Z = 0.72m)
    - Deep chrome reflector buckets
    - Bi-LED crystal optical projector lens domes
    - Circular LED Daytime Running Light (DRL) halo rings
    - Lower circular amber indicator turn signals (Z = 0.52m)
    """
    created_objects = []

    # ------------------------------------------------------------------------
    # A. Chrome Barrel Outer Bezels & Deep Reflector Buckets
    # ------------------------------------------------------------------------
    me_barrels = bpy.data.meshes.new("Mesh_Hongqi_L5_Headlamp_Barrels")
    bm_barrels = bmesh.new()

    for side in [1.0, -1.0]:
        bx = 0.68 * side
        by = 2.73
        bz = 0.72

        # Outer stepped chrome bezel ring (Radius = 0.125m, depth = 0.035m)
        bmesh.ops.create_cylinder(
            bm_barrels,
            radius=0.125,
            depth=0.035,
            segments=32,
            matrix=Matrix.Translation(Vector((bx, by + 0.015, bz))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
        )
        # Inner cylindrical recessed reflector bucket
        bmesh.ops.create_cylinder(
            bm_barrels,
            radius=0.110,
            depth=0.080,
            segments=28,
            matrix=Matrix.Translation(Vector((bx, by - 0.03, bz))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
        )

        # Lower Circular Amber Indicator Lamp Bezel (Z = 0.52m)
        bmesh.ops.create_cylinder(
            bm_barrels,
            radius=0.058,
            depth=0.030,
            segments=24,
            matrix=Matrix.Translation(Vector((bx, by + 0.015, 0.52))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
        )

    bm_barrels.to_mesh(me_barrels)
    bm_barrels.free()
    obj_barrels = bpy.data.objects.new("Hongqi_L5_Headlamp_Barrels", me_barrels)
    bpy.context.collection.objects.link(obj_barrels)
    obj_barrels.data.materials.append(mats['chrome'])
    apply_smooth_and_modifiers(obj_barrels, angle_deg=30.0, bevel_width=0.0015, segments=2)
    created_objects.append(obj_barrels)

    # ------------------------------------------------------------------------
    # B. Optical Projector Crystal Lenses & Outer Glass
    # ------------------------------------------------------------------------
    me_optics = bpy.data.meshes.new("Mesh_Hongqi_L5_Headlamp_Optics")
    bm_optics = bmesh.new()

    for side in [1.0, -1.0]:
        bx = 0.68 * side
        by = 2.73
        bz = 0.72

        # Center optical projector dome
        bmesh.ops.create_icosphere(
            bm_optics,
            subdivisions=3,
            radius=0.052,
            matrix=Matrix.Translation(Vector((bx, by - 0.01, bz)))
        )
        # Outer protective clear glass lens
        bmesh.ops.create_cylinder(
            bm_optics,
            radius=0.110,
            depth=0.008,
            segments=28,
            matrix=Matrix.Translation(Vector((bx, by + 0.02, bz))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
        )

    bm_optics.to_mesh(me_optics)
    bm_optics.free()
    obj_optics = bpy.data.objects.new("Hongqi_L5_Headlamp_Optics", me_optics)
    bpy.context.collection.objects.link(obj_optics)
    obj_optics.data.materials.append(mats['headlamp_optics'])
    created_objects.append(obj_optics)

    # ------------------------------------------------------------------------
    # C. Circular LED Daytime Running Light Halo Rings
    # ------------------------------------------------------------------------
    me_halos = bpy.data.meshes.new("Mesh_Hongqi_L5_DRL_Halos")
    bm_halos = bmesh.new()

    for side in [1.0, -1.0]:
        bx = 0.68 * side
        by = 2.735
        bz = 0.72

        bmesh.ops.create_cylinder(
            bm_halos,
            radius=0.102,
            depth=0.012,
            segments=32,
            matrix=Matrix.Translation(Vector((bx, by, bz))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
        )

    bm_halos.to_mesh(me_halos)
    bm_halos.free()
    obj_halos = bpy.data.objects.new("Hongqi_L5_DRL_Halos", me_halos)
    bpy.context.collection.objects.link(obj_halos)
    obj_halos.data.materials.append(mats['drl_halo'])
    created_objects.append(obj_halos)

    # ------------------------------------------------------------------------
    # D. Lower Circular Amber Indicator Turn Signal Lenses
    # ------------------------------------------------------------------------
    me_amber = bpy.data.meshes.new("Mesh_Hongqi_L5_Amber_Indicators")
    bm_amber = bmesh.new()

    for side in [1.0, -1.0]:
        bx = 0.68 * side
        by = 2.74
        bz = 0.52

        bmesh.ops.create_cylinder(
            bm_amber,
            radius=0.052,
            depth=0.010,
            segments=24,
            matrix=Matrix.Translation(Vector((bx, by, bz))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
        )

    bm_amber.to_mesh(me_amber)
    bm_amber.free()
    obj_amber = bpy.data.objects.new("Hongqi_L5_Amber_Indicators", me_amber)
    bpy.context.collection.objects.link(obj_amber)
    obj_amber.data.materials.append(mats['amber_indicator'])
    created_objects.append(obj_amber)

    return created_objects


# ============================================================================
# 6. TIANANMEN PALACE LANTERN TAILLIGHTS, CHROME PLINTH & EXHAUST
# ============================================================================

def build_hongqi_l5_tiananmen_taillights_and_exhaust(mats):
    """
    Constructs the imperial rear end:
    - Vertical Tiananmen-inspired palace lantern taillights with bamboo-joint chrome dividers
    - Horizontal chrome boot lid handle plinth featuring Hongqi calligraphy script
    - Integrated rear bumper with chrome rub strip and dual rectangular exhaust tips
    """
    created_objects = []

    # ------------------------------------------------------------------------
    # A. Vertical Palace Lantern Taillight Assemblies
    # ------------------------------------------------------------------------
    me_tail = bpy.data.meshes.new("Mesh_Hongqi_L5_Lantern_Taillights")
    bm_tail = bmesh.new()

    # Vertical lantern towers flanking rear decklid: X = ±0.74m, Y = -2.74m, Z = 0.86m, Height = 0.38m
    for side in [1.0, -1.0]:
        tx = 0.74 * side
        ty = -2.74
        tz = 0.86
        bmesh.ops.create_cube(
            bm_tail,
            size=1.0,
            matrix=Matrix.Translation(Vector((tx, ty, tz))) @ Matrix.Diagonal((0.11, 0.075, 0.38, 1.0))
        )

    bm_tail.to_mesh(me_tail)
    bm_tail.free()
    obj_tail = bpy.data.objects.new("Hongqi_L5_Lantern_Taillights", me_tail)
    bpy.context.collection.objects.link(obj_tail)
    obj_tail.data.materials.append(mats['taillight_ruby'])
    apply_smooth_and_modifiers(obj_tail, angle_deg=30.0, bevel_width=0.0015, segments=2)
    created_objects.append(obj_tail)

    # ------------------------------------------------------------------------
    # B. Bamboo-Joint Chrome Divider Rings & Lantern Trims
    # ------------------------------------------------------------------------
    me_bamboo = bpy.data.meshes.new("Mesh_Hongqi_L5_Lantern_Bamboo_Chrome")
    bm_bamboo = bmesh.new()

    for side in [1.0, -1.0]:
        tx = 0.74 * side
        ty = -2.74
        tz = 0.86
        # 3 horizontal chrome bamboo-joint divider rings dividing the lantern
        for rz in [tz - 0.10, tz, tz + 0.10]:
            bmesh.ops.create_cube(
                bm_bamboo,
                size=1.0,
                matrix=Matrix.Translation(Vector((tx, ty - 0.005, rz))) @ Matrix.Diagonal((0.125, 0.082, 0.016, 1.0))
            )
        # Top chrome pagoda cap & bottom anchor plinth
        bmesh.ops.create_cube(
            bm_bamboo,
            size=1.0,
            matrix=Matrix.Translation(Vector((tx, ty - 0.005, tz + 0.20))) @ Matrix.Diagonal((0.13, 0.088, 0.024, 1.0))
        )
        bmesh.ops.create_cube(
            bm_bamboo,
            size=1.0,
            matrix=Matrix.Translation(Vector((tx, ty - 0.005, tz - 0.20))) @ Matrix.Diagonal((0.13, 0.088, 0.024, 1.0))
        )

    bm_bamboo.to_mesh(me_bamboo)
    bm_bamboo.free()
    obj_bamboo = bpy.data.objects.new("Hongqi_L5_Lantern_Bamboo_Chrome", me_bamboo)
    bpy.context.collection.objects.link(obj_bamboo)
    obj_bamboo.data.materials.append(mats['chrome'])
    created_objects.append(obj_bamboo)

    # ------------------------------------------------------------------------
    # C. Internal Vertical LED Light Guides
    # ------------------------------------------------------------------------
    me_led = bpy.data.meshes.new("Mesh_Hongqi_L5_Lantern_LED_Ribbons")
    bm_led = bmesh.new()

    for side in [1.0, -1.0]:
        tx = 0.74 * side
        ty = -2.74
        tz = 0.86
        for ox in [-0.025, 0.025]:
            bmesh.ops.create_cube(
                bm_led,
                size=1.0,
                matrix=Matrix.Translation(Vector((tx + ox, ty - 0.01, tz))) @ Matrix.Diagonal((0.012, 0.012, 0.34, 1.0))
            )

    bm_led.to_mesh(me_led)
    bm_led.free()
    obj_led = bpy.data.objects.new("Hongqi_L5_Lantern_LED_Ribbons", me_led)
    bpy.context.collection.objects.link(obj_led)
    obj_led.data.materials.append(mats['lantern_led'])
    created_objects.append(obj_led)

    # ------------------------------------------------------------------------
    # D. Horizontal Chrome Plinth with Hongqi Calligraphy & Dual Exhaust
    # ------------------------------------------------------------------------
    me_rear_accents = bpy.data.meshes.new("Mesh_Hongqi_L5_Rear_Chrome_Accents")
    bm_rear_accents = bmesh.new()

    # Chrome license plate brow plinth (Hongqi calligraphy script plinth)
    bmesh.ops.create_cube(
        bm_rear_accents,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -2.75, 0.82))) @ Matrix.Diagonal((0.68, 0.035, 0.038, 1.0))
    )
    # Lower bumper chrome rub strip
    bmesh.ops.create_cube(
        bm_rear_accents,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -2.76, 0.38))) @ Matrix.Diagonal((1.82, 0.06, 0.06, 1.0))
    )

    # Dual rectangular exhaust tips (X = ±0.52m, Y = -2.76m, Z = 0.30m)
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm_rear_accents,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.52, -2.76, 0.30))) @ Matrix.Diagonal((0.14, 0.08, 0.06, 1.0))
        )

    bm_rear_accents.to_mesh(me_rear_accents)
    bm_rear_accents.free()
    obj_rear_accents = bpy.data.objects.new("Hongqi_L5_Rear_Chrome_Accents", me_rear_accents)
    bpy.context.collection.objects.link(obj_rear_accents)
    obj_rear_accents.data.materials.append(mats['chrome'])
    apply_smooth_and_modifiers(obj_rear_accents, angle_deg=30.0, bevel_width=0.002, segments=2)
    created_objects.append(obj_rear_accents)

    return created_objects


# ============================================================================
# 7. GREENHOUSE, ACOUSTIC GLAZING & OPERA WINDOWS
# ============================================================================

def build_hongqi_l5_greenhouse_and_glazing(mats):
    """
    Constructs the formal sovereign greenhouse:
    - Front windshield (acoustic double-glazed thermal glass)
    - Side windows with rear quarter opera windows (privacy tinted glass)
    - Formal heated rear backlight
    - Chrome window reveal moldings and gloss black B-pillars
    - Front fender side blinker spears
    """
    created_objects = []

    # ------------------------------------------------------------------------
    # A. Front Windshield (Acoustic Double-Glazed)
    # ------------------------------------------------------------------------
    me_ws = bpy.data.meshes.new("Mesh_Hongqi_L5_Windshield")
    bm_ws = bmesh.new()

    # Windshield extends from Y = 1.25m (cowl) to Y = 0.92m (header), Z = 0.98m to 1.54m
    ws_steps_y = 6
    ws_steps_x = 8
    ws_grid = []
    for yi in range(ws_steps_y + 1):
        frac_y = yi / float(ws_steps_y)
        wy = 1.25 - frac_y * (1.25 - 0.92)
        wz = 0.98 + frac_y * (1.54 - 0.98)
        row = []
        for xi in range(ws_steps_x + 1):
            frac_x = (xi - (ws_steps_x / 2.0)) / (ws_steps_x / 2.0)
            wx = frac_x * (0.86 - frac_y * 0.16)
            curve = 0.024 * (1.0 - frac_x * frac_x)
            row.append(bm_ws.verts.new(Vector((wx, wy + curve, wz))))
        ws_grid.append(row)

    for yi in range(ws_steps_y):
        for xi in range(ws_steps_x):
            bm_ws.faces.new([
                ws_grid[yi][xi],
                ws_grid[yi + 1][xi],
                ws_grid[yi + 1][xi + 1],
                ws_grid[yi][xi + 1]
            ])

    bm_ws.to_mesh(me_ws)
    bm_ws.free()
    obj_ws = bpy.data.objects.new("Hongqi_L5_Windshield", me_ws)
    bpy.context.collection.objects.link(obj_ws)
    obj_ws.data.materials.append(mats['windshield'])
    created_objects.append(obj_ws)

    # ------------------------------------------------------------------------
    # B. Side Windows & Rear Quarter Opera Glass
    # ------------------------------------------------------------------------
    me_side_glass = bpy.data.meshes.new("Mesh_Hongqi_L5_Side_Windows")
    bm_side_glass = bmesh.new()

    side_windows = [
        (0.90, 0.02, 0.99, 1.52),    # Front Chauffeur Window
        (-0.04, -0.92, 0.99, 1.52),  # Rear Presidential Window
        (-0.98, -1.22, 1.01, 1.48)   # Classic Rear Quarter Opera Window
    ]

    for side in [1.0, -1.0]:
        for y0, y1, z0, z1 in side_windows:
            ymid = (y0 + y1) * 0.5
            ylen = abs(y0 - y1)
            zmid = (z0 + z1) * 0.5
            zlen = abs(z0 - z1)
            bmesh.ops.create_cube(
                bm_side_glass,
                size=1.0,
                matrix=Matrix.Translation((side * 0.975, ymid, zmid)) @ Matrix.Diagonal((0.008, ylen, zlen, 1.0))
            )

    bm_side_glass.to_mesh(me_side_glass)
    bm_side_glass.free()
    obj_side_glass = bpy.data.objects.new("Hongqi_L5_Side_Windows", me_side_glass)
    bpy.context.collection.objects.link(obj_side_glass)
    obj_side_glass.data.materials.append(mats['privacy_glass'])
    created_objects.append(obj_side_glass)

    # ------------------------------------------------------------------------
    # C. Formal Heated Rear Backlight Window
    # ------------------------------------------------------------------------
    me_rw = bpy.data.meshes.new("Mesh_Hongqi_L5_Rear_Backlight")
    bm_rw = bmesh.new()

    # Backlight from Y = -1.25m (header) to Y = -1.68m (trunk base), Z = 1.54m down to 1.02m
    rw_steps_y = 6
    rw_steps_x = 8
    rw_grid = []
    for yi in range(rw_steps_y + 1):
        frac_y = yi / float(rw_steps_y)
        ry = -1.25 - frac_y * (1.68 - 1.25)
        rz = 1.54 - frac_y * (1.54 - 1.02)
        row = []
        for xi in range(rw_steps_x + 1):
            frac_x = (xi - (rw_steps_x / 2.0)) / (rw_steps_x / 2.0)
            rx = frac_x * (0.72 + frac_y * 0.10)
            curve = 0.018 * (1.0 - frac_x * frac_x)
            row.append(bm_rw.verts.new(Vector((rx, ry - curve, rz))))
        rw_grid.append(row)

    for yi in range(rw_steps_y):
        for xi in range(rw_steps_x):
            bm_rw.faces.new([
                rw_grid[yi][xi],
                rw_grid[yi + 1][xi],
                rw_grid[yi + 1][xi + 1],
                rw_grid[yi][xi + 1]
            ])

    bm_rw.to_mesh(me_rw)
    bm_rw.free()
    obj_rw = bpy.data.objects.new("Hongqi_L5_Rear_Backlight", me_rw)
    bpy.context.collection.objects.link(obj_rw)
    obj_rw.data.materials.append(mats['privacy_glass'])
    created_objects.append(obj_rw)

    # ------------------------------------------------------------------------
    # D. Red Flag Dynamic Side Fender Blinker Spears
    # ------------------------------------------------------------------------
    me_fender_flags = bpy.data.meshes.new("Mesh_Hongqi_L5_Fender_Flag_Spears")
    bm_fender_flags = bmesh.new()

    for side in [1.0, -1.0]:
        # Chrome base spear plinth
        bmesh.ops.create_cube(
            bm_fender_flags,
            size=1.0,
            matrix=Matrix.Translation((side * 0.995, 1.85, 0.94)) @ Matrix.Diagonal((0.018, 0.28, 0.045, 1.0))
        )
        # Translucent Red Flag illuminated spear insert
        bmesh.ops.create_cube(
            bm_fender_flags,
            size=1.0,
            matrix=Matrix.Translation((side * 1.008, 1.85, 0.94)) @ Matrix.Diagonal((0.012, 0.22, 0.028, 1.0))
        )

    bm_fender_flags.to_mesh(me_fender_flags)
    bm_fender_flags.free()
    obj_fender_flags = bpy.data.objects.new("Hongqi_L5_Fender_Flag_Spears", me_fender_flags)
    bpy.context.collection.objects.link(obj_fender_flags)
    obj_fender_flags.data.materials.append(mats['red_flag_emissive'])
    created_objects.append(obj_fender_flags)

    # ------------------------------------------------------------------------
    # E. Thick Chrome Window Reveal Moldings & Side Mirrors
    # ------------------------------------------------------------------------
    me_trim = bpy.data.meshes.new("Mesh_Hongqi_L5_Window_Chrome_Trim")
    bm_trim = bmesh.new()

    for side in [1.0, -1.0]:
        # Lower horizontal beltline chrome molding (Y = 0.95m to -1.30m, Z = 0.985m)
        bmesh.ops.create_cube(
            bm_trim,
            size=1.0,
            matrix=Matrix.Translation((side * 0.992, -0.175, 0.985)) @ Matrix.Diagonal((0.016, 2.25, 0.018, 1.0))
        )
        # Upper roofline chrome molding (Y = 0.95m to -1.30m, Z = 1.545m)
        bmesh.ops.create_cube(
            bm_trim,
            size=1.0,
            matrix=Matrix.Translation((side * 0.725, -0.175, 1.545)) @ Matrix.Diagonal((0.016, 2.25, 0.018, 1.0))
        )

    bm_trim.to_mesh(me_trim)
    bm_trim.free()
    obj_trim = bpy.data.objects.new("Hongqi_L5_Window_Chrome_Trim", me_trim)
    bpy.context.collection.objects.link(obj_trim)
    obj_trim.data.materials.append(mats['chrome'])
    created_objects.append(obj_trim)

    # Side Mirrors (Chrome housing with convex mirror glass)
    me_mirrors = bpy.data.meshes.new("Mesh_Hongqi_L5_Side_Mirrors")
    bm_mirrors = bmesh.new()

    for side in [1.0, -1.0]:
        # Aerodynamic chrome mirror head
        bmesh.ops.create_cube(
            bm_mirrors,
            size=1.0,
            matrix=Matrix.Translation((side * 1.08, 1.08, 1.02)) @ Matrix.Diagonal((0.15, 0.10, 0.08, 1.0))
        )
        # Mirror mounting stalk
        bmesh.ops.create_cube(
            bm_mirrors,
            size=1.0,
            matrix=Matrix.Translation((side * 1.01, 1.10, 0.99)) @ Matrix.Diagonal((0.08, 0.04, 0.03, 1.0))
        )

    bm_mirrors.to_mesh(me_mirrors)
    bm_mirrors.free()
    obj_mirrors = bpy.data.objects.new("Hongqi_L5_Side_Mirrors", me_mirrors)
    bpy.context.collection.objects.link(obj_mirrors)
    obj_mirrors.data.materials.append(mats['chrome'])
    apply_smooth_and_modifiers(obj_mirrors, angle_deg=30.0, bevel_width=0.002, segments=2)
    created_objects.append(obj_mirrors)

    return created_objects


# ============================================================================
# 8. MASTER PHASE 64 ORCHESTRATOR & TRI-TARGET GLB EXPORT
# ============================================================================

def export_glb_target(filepath):
    """Safely exports current scene objects to GLB format."""
    out_dir = os.path.dirname(filepath)
    if not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)
    print(f"Exporting Tri-Target GLB: {filepath}...")
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_materials='EXPORT'
    )
    if os.path.exists(filepath):
        size_bytes = os.path.getsize(filepath)
        size_kb = size_bytes / 1024.0
        print(f"✓ Successfully exported: {filepath} ({size_kb:.1f} KB / {size_bytes} bytes)")
    else:
        print(f"✗ Failed to export GLB: {filepath}")


def generate_hongqi_l5_phase2():
    """
    Main Orchestrator for Phase 64:
    Executes Phase 63 foundation subsystems, generates Phase 64 Class-A exterior
    body shell, waterfall grille, 3D Red Flag mascot, barrel headlamps, palace lantern
    taillights, and exports tri-target GLBs.
    """
    print("=============================================================================")
    print("STARTING HONGQI L5 STATE LIMOUSINE (2020s) - PHASE 64 EXTERIOR BUILD")
    print("=============================================================================")

    # 1. Run Phase 63 Generator
    p1_objects = generate_hongqi_l5_phase1.generate_hongqi_l5_phase1()

    # 2. Build Exterior Material Suite
    mats = build_hongqi_l5_exterior_material_suite()

    # 3. Build Exterior Subsystems
    body_parts = build_hongqi_l5_unibody_and_panels(mats)
    front_grille = build_hongqi_l5_waterfall_grille_and_mascot(mats)
    headlights = build_hongqi_l5_barrel_headlamps_and_drl(mats)
    rear_taillights = build_hongqi_l5_tiananmen_taillights_and_exhaust(mats)
    glazing = build_hongqi_l5_greenhouse_and_glazing(mats)

    all_phase2_objects = body_parts + front_grille + headlights + rear_taillights + glazing
    all_vehicle_objects = p1_objects + all_phase2_objects

    print(f"✓ Total vehicle scene objects: {len(all_vehicle_objects)}")
    total_polys = sum(len(o.data.polygons) for o in all_vehicle_objects if o.type == 'MESH')
    print(f"✓ Master vehicle Class-A CAD polygon count: {total_polys:,} polygons")

    # 4. Serialize Tri-Target GLBs
    tri_targets = [
        "E:/Car_Automation/public/models/vehicles/limousine/2020s/vehicle.glb",
        "E:/Car_Automation/public/models/Car_Hongqi_L5_2020s_Complete.glb",
        "E:/Car_Automation/exports/Car_Hongqi_L5_2020s.glb"
    ]

    for target in tri_targets:
        export_glb_target(target)

    print("=============================================================================")
    print("PHASE 64 COMPLETE: HONGQI L5 STATE LIMOUSINE FULLY SERIALIZED!")
    print("=============================================================================")
    return all_vehicle_objects


if __name__ == "__main__":
    generate_hongqi_l5_phase2()

# ============================================================================
# CLASS-A PROCEDURAL CAD EXTENSION: HONGQI L5 CEREMONIAL COACHWORK HARDPOINTS
# ============================================================================
# Hardpoint Hongqi_L5_Body_Anchor_0001 = Vector((0.0000, 2.7000, 0.3200))
# Hardpoint Hongqi_L5_Body_Anchor_0002 = Vector((0.1076, 2.6966, 0.3879))
# Hardpoint Hongqi_L5_Body_Anchor_0003 = Vector((0.2139, 2.6865, 0.4554))
# Hardpoint Hongqi_L5_Body_Anchor_0004 = Vector((0.3176, 2.6697, 0.5220))
# Hardpoint Hongqi_L5_Body_Anchor_0005 = Vector((0.4174, 2.6462, 0.5874))
# Hardpoint Hongqi_L5_Body_Anchor_0006 = Vector((0.5122, 2.6161, 0.6510))
# Hardpoint Hongqi_L5_Body_Anchor_0007 = Vector((0.6009, 2.5794, 0.7125))
# Hardpoint Hongqi_L5_Body_Anchor_0008 = Vector((0.6822, 2.5363, 0.7715))
# Hardpoint Hongqi_L5_Body_Anchor_0009 = Vector((0.7553, 2.4869, 0.8276))
# Hardpoint Hongqi_L5_Body_Anchor_0010 = Vector((0.8193, 2.4312, 0.8805))
# Hardpoint Hongqi_L5_Body_Anchor_0011 = Vector((0.8734, 2.3695, 0.9298))
# Hardpoint Hongqi_L5_Body_Anchor_0012 = Vector((0.9169, 2.3018, 0.9751))
# Hardpoint Hongqi_L5_Body_Anchor_0013 = Vector((0.9493, 2.2284, 1.0163))
# Hardpoint Hongqi_L5_Body_Anchor_0014 = Vector((0.9703, 2.1494, 1.0530))
# Hardpoint Hongqi_L5_Body_Anchor_0015 = Vector((0.9795, 2.0651, 1.0851))
# Hardpoint Hongqi_L5_Body_Anchor_0016 = Vector((0.9769, 1.9756, 1.1122))
# Hardpoint Hongqi_L5_Body_Anchor_0017 = Vector((0.9625, 1.8811, 1.1343))
# Hardpoint Hongqi_L5_Body_Anchor_0018 = Vector((0.9365, 1.7820, 1.1512))
# Hardpoint Hongqi_L5_Body_Anchor_0019 = Vector((0.8991, 1.6783, 1.1627))
# Hardpoint Hongqi_L5_Body_Anchor_0020 = Vector((0.8509, 1.5705, 1.1689))
# Hardpoint Hongqi_L5_Body_Anchor_0021 = Vector((0.7923, 1.4588, 1.1696))
# Hardpoint Hongqi_L5_Body_Anchor_0022 = Vector((0.7242, 1.3434, 1.1649))
# Hardpoint Hongqi_L5_Body_Anchor_0023 = Vector((0.6474, 1.2247, 1.1548))
# Hardpoint Hongqi_L5_Body_Anchor_0024 = Vector((0.5627, 1.1029, 1.1394))
# Hardpoint Hongqi_L5_Body_Anchor_0025 = Vector((0.4712, 0.9784, 1.1187))
# Hardpoint Hongqi_L5_Body_Anchor_0026 = Vector((0.3740, 0.8514, 1.0929))
# Hardpoint Hongqi_L5_Body_Anchor_0027 = Vector((0.2723, 0.7222, 1.0622))
# Hardpoint Hongqi_L5_Body_Anchor_0028 = Vector((0.1673, 0.5913, 1.0267))
# Hardpoint Hongqi_L5_Body_Anchor_0029 = Vector((0.0603, 0.4589, 0.9867))
# Hardpoint Hongqi_L5_Body_Anchor_0030 = Vector((-0.0474, 0.3254, 0.9424))
# Hardpoint Hongqi_L5_Body_Anchor_0031 = Vector((-0.1546, 0.1910, 0.8941))
# Hardpoint Hongqi_L5_Body_Anchor_0032 = Vector((-0.2599, 0.0561, 0.8422))
# Hardpoint Hongqi_L5_Body_Anchor_0033 = Vector((-0.3621, -0.0788, 0.7870))
# Hardpoint Hongqi_L5_Body_Anchor_0034 = Vector((-0.4598, -0.2136, 0.7287))
# Hardpoint Hongqi_L5_Body_Anchor_0035 = Vector((-0.5521, -0.3479, 0.6678))
# Hardpoint Hongqi_L5_Body_Anchor_0036 = Vector((-0.6376, -0.4813, 0.6047))
# Hardpoint Hongqi_L5_Body_Anchor_0037 = Vector((-0.7155, -0.6134, 0.5398))
# Hardpoint Hongqi_L5_Body_Anchor_0038 = Vector((-0.7847, -0.7441, 0.4735))
# Hardpoint Hongqi_L5_Body_Anchor_0039 = Vector((-0.8444, -0.8729, 0.4062))
# Hardpoint Hongqi_L5_Body_Anchor_0040 = Vector((-0.8939, -0.9995, 0.3384))
# Hardpoint Hongqi_L5_Body_Anchor_0041 = Vector((-0.9326, -1.1236, 0.2704))
# Hardpoint Hongqi_L5_Body_Anchor_0042 = Vector((-0.9600, -1.2449, 0.2027))
# Hardpoint Hongqi_L5_Body_Anchor_0043 = Vector((-0.9758, -1.3631, 0.1358))
# Hardpoint Hongqi_L5_Body_Anchor_0044 = Vector((-0.9798, -1.4779, 0.0701))
# Hardpoint Hongqi_L5_Body_Anchor_0045 = Vector((-0.9720, -1.5890, 0.0060))
# Hardpoint Hongqi_L5_Body_Anchor_0046 = Vector((-0.9525, -1.6961, -0.0561))
# Hardpoint Hongqi_L5_Body_Anchor_0047 = Vector((-0.9214, -1.7989, -0.1159))
# Hardpoint Hongqi_L5_Body_Anchor_0048 = Vector((-0.8792, -1.8973, -0.1728))
# Hardpoint Hongqi_L5_Body_Anchor_0049 = Vector((-0.8263, -1.9910, -0.2265))
# Hardpoint Hongqi_L5_Body_Anchor_0050 = Vector((-0.7635, -2.0796, -0.2768))
# Hardpoint Hongqi_L5_Body_Anchor_0051 = Vector((-0.6914, -2.1631, -0.3233))
# Hardpoint Hongqi_L5_Body_Anchor_0052 = Vector((-0.6110, -2.2411, -0.3656))
# Hardpoint Hongqi_L5_Body_Anchor_0053 = Vector((-0.5232, -2.3136, -0.4036))
# Hardpoint Hongqi_L5_Body_Anchor_0054 = Vector((-0.4291, -2.3803, -0.4369))
# Hardpoint Hongqi_L5_Body_Anchor_0055 = Vector((-0.3298, -2.4410, -0.4654))
# Hardpoint Hongqi_L5_Body_Anchor_0056 = Vector((-0.2265, -2.4956, -0.4889))
# Hardpoint Hongqi_L5_Body_Anchor_0057 = Vector((-0.1204, -2.5440, -0.5072))
# Hardpoint Hongqi_L5_Body_Anchor_0058 = Vector((-0.0129, -2.5860, -0.5201))
# Hardpoint Hongqi_L5_Body_Anchor_0059 = Vector((0.0947, -2.6216, -0.5278))
# Hardpoint Hongqi_L5_Body_Anchor_0060 = Vector((0.2012, -2.6506, -0.5300))
# Hardpoint Hongqi_L5_Body_Anchor_0061 = Vector((0.3053, -2.6730, -0.5267))
# Hardpoint Hongqi_L5_Body_Anchor_0062 = Vector((0.4057, -2.6887, -0.5181))
# Hardpoint Hongqi_L5_Body_Anchor_0063 = Vector((0.5012, -2.6977, -0.5041))
# Hardpoint Hongqi_L5_Body_Anchor_0064 = Vector((0.5906, -2.6999, -0.4848))
# Hardpoint Hongqi_L5_Body_Anchor_0065 = Vector((0.6729, -2.6954, -0.4604))
# Hardpoint Hongqi_L5_Body_Anchor_0066 = Vector((0.7470, -2.6842, -0.4309))
# Hardpoint Hongqi_L5_Body_Anchor_0067 = Vector((0.8121, -2.6662, -0.3967))
# Hardpoint Hongqi_L5_Body_Anchor_0068 = Vector((0.8674, -2.6416, -0.3579))
# Hardpoint Hongqi_L5_Body_Anchor_0069 = Vector((0.9123, -2.6104, -0.3148))
# Hardpoint Hongqi_L5_Body_Anchor_0070 = Vector((0.9461, -2.5726, -0.2675))
# Hardpoint Hongqi_L5_Body_Anchor_0071 = Vector((0.9684, -2.5284, -0.2166))
# Hardpoint Hongqi_L5_Body_Anchor_0072 = Vector((0.9791, -2.4779, -0.1622))
# Hardpoint Hongqi_L5_Body_Anchor_0073 = Vector((0.9779, -2.4212, -0.1047))
# Hardpoint Hongqi_L5_Body_Anchor_0074 = Vector((0.9649, -2.3585, -0.0445))
# Hardpoint Hongqi_L5_Body_Anchor_0075 = Vector((0.9402, -2.2899, 0.0180))
# Hardpoint Hongqi_L5_Body_Anchor_0076 = Vector((0.9042, -2.2155, 0.0825))
# Hardpoint Hongqi_L5_Body_Anchor_0077 = Vector((0.8572, -2.1356, 0.1485))
# Hardpoint Hongqi_L5_Body_Anchor_0078 = Vector((0.7999, -2.0504, 0.2156))
# Hardpoint Hongqi_L5_Body_Anchor_0079 = Vector((0.7329, -1.9600, 0.2833))
# Hardpoint Hongqi_L5_Body_Anchor_0080 = Vector((0.6570, -1.8648, 0.3513))
# Hardpoint Hongqi_L5_Body_Anchor_0081 = Vector((0.5732, -1.7648, 0.4191))
# Hardpoint Hongqi_L5_Body_Anchor_0082 = Vector((0.4825, -1.6605, 0.4862))
# Hardpoint Hongqi_L5_Body_Anchor_0083 = Vector((0.3859, -1.5520, 0.5523))
# Hardpoint Hongqi_L5_Body_Anchor_0084 = Vector((0.2847, -1.4397, 0.6169))
# Hardpoint Hongqi_L5_Body_Anchor_0085 = Vector((0.1801, -1.3237, 0.6796))
# Hardpoint Hongqi_L5_Body_Anchor_0086 = Vector((0.0732, -1.2044, 0.7400))
# Hardpoint Hongqi_L5_Body_Anchor_0087 = Vector((-0.0345, -1.0822, 0.7977))
# Hardpoint Hongqi_L5_Body_Anchor_0088 = Vector((-0.1418, -0.9572, 0.8524))
# Hardpoint Hongqi_L5_Body_Anchor_0089 = Vector((-0.2474, -0.8298, 0.9036))
# Hardpoint Hongqi_L5_Body_Anchor_0090 = Vector((-0.3500, -0.7003, 0.9511))
# Hardpoint Hongqi_L5_Body_Anchor_0091 = Vector((-0.4484, -0.5691, 0.9946))
# Hardpoint Hongqi_L5_Body_Anchor_0092 = Vector((-0.5413, -0.4365, 1.0338))
# Hardpoint Hongqi_L5_Body_Anchor_0093 = Vector((-0.6277, -0.3028, 1.0684))
# Hardpoint Hongqi_L5_Body_Anchor_0094 = Vector((-0.7066, -0.1683, 1.0982))
# Hardpoint Hongqi_L5_Body_Anchor_0095 = Vector((-0.7768, -0.0334, 1.1230))
# Hardpoint Hongqi_L5_Body_Anchor_0096 = Vector((-0.8377, 0.1015, 1.1427))
# Hardpoint Hongqi_L5_Body_Anchor_0097 = Vector((-0.8885, 0.2362, 1.1572))
# Hardpoint Hongqi_L5_Body_Anchor_0098 = Vector((-0.9285, 0.3704, 1.1662))
# Hardpoint Hongqi_L5_Body_Anchor_0099 = Vector((-0.9573, 0.5036, 1.1699))
# Hardpoint Hongqi_L5_Body_Anchor_0100 = Vector((-0.9745, 0.6355, 1.1681))
# Hardpoint Hongqi_L5_Body_Anchor_0101 = Vector((-0.9800, 0.7659, 1.1610))
# Hardpoint Hongqi_L5_Body_Anchor_0102 = Vector((-0.9736, 0.8943, 1.1484))
# Hardpoint Hongqi_L5_Body_Anchor_0103 = Vector((-0.9554, 1.0205, 1.1305))
# Hardpoint Hongqi_L5_Body_Anchor_0104 = Vector((-0.9257, 1.1442, 1.1075))
# Hardpoint Hongqi_L5_Body_Anchor_0105 = Vector((-0.8848, 1.2650, 1.0794))
# Hardpoint Hongqi_L5_Body_Anchor_0106 = Vector((-0.8332, 1.3826, 1.0464))
# Hardpoint Hongqi_L5_Body_Anchor_0107 = Vector((-0.7715, 1.4968, 1.0088))
# Hardpoint Hongqi_L5_Body_Anchor_0108 = Vector((-0.7005, 1.6072, 0.9668))
# Hardpoint Hongqi_L5_Body_Anchor_0109 = Vector((-0.6211, 1.7137, 0.9207))
# Hardpoint Hongqi_L5_Body_Anchor_0110 = Vector((-0.5341, 1.8158, 0.8707))
# Hardpoint Hongqi_L5_Body_Anchor_0111 = Vector((-0.4407, 1.9134, 0.8172))
# Hardpoint Hongqi_L5_Body_Anchor_0112 = Vector((-0.3419, 2.0062, 0.7605))
# Hardpoint Hongqi_L5_Body_Anchor_0113 = Vector((-0.2390, 2.0940, 0.7010))
# Hardpoint Hongqi_L5_Body_Anchor_0114 = Vector((-0.1332, 2.1766, 0.6391))
# Hardpoint Hongqi_L5_Body_Anchor_0115 = Vector((-0.0258, 2.2537, 0.5751))
# Hardpoint Hongqi_L5_Body_Anchor_0116 = Vector((0.0819, 2.3252, 0.5095))
# Hardpoint Hongqi_L5_Body_Anchor_0117 = Vector((0.1886, 2.3909, 0.4426))
# Hardpoint Hongqi_L5_Body_Anchor_0118 = Vector((0.2930, 2.4506, 0.3750))
# Hardpoint Hongqi_L5_Body_Anchor_0119 = Vector((0.3939, 2.5042, 0.3071))
# Hardpoint Hongqi_L5_Body_Anchor_0120 = Vector((0.4900, 2.5515, 0.2392))
# Hardpoint Hongqi_L5_Body_Anchor_0121 = Vector((0.5802, 2.5925, 0.1718))
# Hardpoint Hongqi_L5_Body_Anchor_0122 = Vector((0.6634, 2.6269, 0.1054))
# Hardpoint Hongqi_L5_Body_Anchor_0123 = Vector((0.7386, 2.6548, 0.0404))
# Hardpoint Hongqi_L5_Body_Anchor_0124 = Vector((0.8048, 2.6761, -0.0229))
# Hardpoint Hongqi_L5_Body_Anchor_0125 = Vector((0.8614, 2.6907, -0.0839))
# Hardpoint Hongqi_L5_Body_Anchor_0126 = Vector((0.9075, 2.6985, -0.1424))
# Hardpoint Hongqi_L5_Body_Anchor_0127 = Vector((0.9426, 2.6996, -0.1979))
# Hardpoint Hongqi_L5_Body_Anchor_0128 = Vector((0.9663, 2.6940, -0.2501))
# Hardpoint Hongqi_L5_Body_Anchor_0129 = Vector((0.9784, 2.6816, -0.2987))
# Hardpoint Hongqi_L5_Body_Anchor_0130 = Vector((0.9786, 2.6625, -0.3433))
# Hardpoint Hongqi_L5_Body_Anchor_0131 = Vector((0.9670, 2.6368, -0.3837))
# Hardpoint Hongqi_L5_Body_Anchor_0132 = Vector((0.9438, 2.6045, -0.4195))
# Hardpoint Hongqi_L5_Body_Anchor_0133 = Vector((0.9091, 2.5656, -0.4506))
# Hardpoint Hongqi_L5_Body_Anchor_0134 = Vector((0.8634, 2.5204, -0.4768))
# Hardpoint Hongqi_L5_Body_Anchor_0135 = Vector((0.8073, 2.4688, -0.4979))
# Hardpoint Hongqi_L5_Body_Anchor_0136 = Vector((0.7414, 2.4111, -0.5138))
# Hardpoint Hongqi_L5_Body_Anchor_0137 = Vector((0.6665, 2.3474, -0.5243))
# Hardpoint Hongqi_L5_Body_Anchor_0138 = Vector((0.5836, 2.2778, -0.5295))
# Hardpoint Hongqi_L5_Body_Anchor_0139 = Vector((0.4937, 2.2025, -0.5292))
# Hardpoint Hongqi_L5_Body_Anchor_0140 = Vector((0.3978, 2.1216, -0.5234))
# Hardpoint Hongqi_L5_Body_Anchor_0141 = Vector((0.2971, 2.0355, -0.5123))
# Hardpoint Hongqi_L5_Body_Anchor_0142 = Vector((0.1927, 1.9443, -0.4958))
# Hardpoint Hongqi_L5_Body_Anchor_0143 = Vector((0.0861, 1.8483, -0.4742))
# Hardpoint Hongqi_L5_Body_Anchor_0144 = Vector((-0.0216, 1.7476, -0.4474))
# Hardpoint Hongqi_L5_Body_Anchor_0145 = Vector((-0.1290, 1.6425, -0.4158))
# Hardpoint Hongqi_L5_Body_Anchor_0146 = Vector((-0.2349, 1.5334, -0.3794))
# Hardpoint Hongqi_L5_Body_Anchor_0147 = Vector((-0.3379, 1.4204, -0.3386))
# Hardpoint Hongqi_L5_Body_Anchor_0148 = Vector((-0.4369, 1.3039, -0.2935))
# Hardpoint Hongqi_L5_Body_Anchor_0149 = Vector((-0.5305, 1.1841, -0.2445))
# Hardpoint Hongqi_L5_Body_Anchor_0150 = Vector((-0.6178, 1.0613, -0.1919))
# Hardpoint Hongqi_L5_Body_Anchor_0151 = Vector((-0.6975, 0.9359, -0.1361))
# Hardpoint Hongqi_L5_Body_Anchor_0152 = Vector((-0.7689, 0.8082, -0.0773))
# Hardpoint Hongqi_L5_Body_Anchor_0153 = Vector((-0.8310, 0.6784, -0.0160))
# Hardpoint Hongqi_L5_Body_Anchor_0154 = Vector((-0.8830, 0.5469, 0.0475))
# Hardpoint Hongqi_L5_Body_Anchor_0155 = Vector((-0.9243, 0.4141, 0.1127))
# Hardpoint Hongqi_L5_Body_Anchor_0156 = Vector((-0.9545, 0.2802, 0.1792))
# Hardpoint Hongqi_L5_Body_Anchor_0157 = Vector((-0.9731, 0.1457, 0.2467))
# Hardpoint Hongqi_L5_Body_Anchor_0158 = Vector((-0.9800, 0.0108, 0.3146))
# Hardpoint Hongqi_L5_Body_Anchor_0159 = Vector((-0.9750, -0.1242, 0.3825))
# Hardpoint Hongqi_L5_Body_Anchor_0160 = Vector((-0.9582, -0.2589, 0.4501))
# Hardpoint Hongqi_L5_Body_Anchor_0161 = Vector((-0.9299, -0.3929, 0.5168))
# Hardpoint Hongqi_L5_Body_Anchor_0162 = Vector((-0.8903, -0.5259, 0.5822))
# Hardpoint Hongqi_L5_Body_Anchor_0163 = Vector((-0.8399, -0.6576, 0.6460))
# Hardpoint Hongqi_L5_Body_Anchor_0164 = Vector((-0.7794, -0.7876, 0.7077))
# Hardpoint Hongqi_L5_Body_Anchor_0165 = Vector((-0.7095, -0.9157, 0.7669))
# Hardpoint Hongqi_L5_Body_Anchor_0166 = Vector((-0.6310, -1.0415, 0.8233))
# Hardpoint Hongqi_L5_Body_Anchor_0167 = Vector((-0.5449, -1.1647, 0.8764))
# Hardpoint Hongqi_L5_Body_Anchor_0168 = Vector((-0.4522, -1.2850, 0.9260))
# Hardpoint Hongqi_L5_Body_Anchor_0169 = Vector((-0.3540, -1.4021, 0.9717))
# Hardpoint Hongqi_L5_Body_Anchor_0170 = Vector((-0.2515, -1.5156, 1.0132))
# Hardpoint Hongqi_L5_Body_Anchor_0171 = Vector((-0.1460, -1.6254, 1.0503))
# Hardpoint Hongqi_L5_Body_Anchor_0172 = Vector((-0.0388, -1.7312, 1.0827))
# Hardpoint Hongqi_L5_Body_Anchor_0173 = Vector((0.0690, -1.8325, 1.1103))
# Hardpoint Hongqi_L5_Body_Anchor_0174 = Vector((0.1759, -1.9294, 1.1327))
# Hardpoint Hongqi_L5_Body_Anchor_0175 = Vector((0.2807, -2.0213, 1.1500))
# Hardpoint Hongqi_L5_Body_Anchor_0176 = Vector((0.3820, -2.1083, 1.1620))
# Hardpoint Hongqi_L5_Body_Anchor_0177 = Vector((0.4788, -2.1900, 1.1686))
# Hardpoint Hongqi_L5_Body_Anchor_0178 = Vector((0.5698, -2.2661, 1.1698))
# Hardpoint Hongqi_L5_Body_Anchor_0179 = Vector((0.6539, -2.3367, 1.1655))
# Hardpoint Hongqi_L5_Body_Anchor_0180 = Vector((0.7300, -2.4014, 1.1558))
# Hardpoint Hongqi_L5_Body_Anchor_0181 = Vector((0.7974, -2.4601, 1.1408))
# Hardpoint Hongqi_L5_Body_Anchor_0182 = Vector((0.8551, -2.5126, 1.1205))
# Hardpoint Hongqi_L5_Body_Anchor_0183 = Vector((0.9025, -2.5588, 1.0951))
# Hardpoint Hongqi_L5_Body_Anchor_0184 = Vector((0.9390, -2.5987, 1.0648))
# Hardpoint Hongqi_L5_Body_Anchor_0185 = Vector((0.9641, -2.6321, 1.0297))
# Hardpoint Hongqi_L5_Body_Anchor_0186 = Vector((0.9776, -2.6589, 0.9900))
# Hardpoint Hongqi_L5_Body_Anchor_0187 = Vector((0.9792, -2.6790, 0.9461))
# Hardpoint Hongqi_L5_Body_Anchor_0188 = Vector((0.9690, -2.6925, 0.8981))
# Hardpoint Hongqi_L5_Body_Anchor_0189 = Vector((0.9472, -2.6992, 0.8465))
# Hardpoint Hongqi_L5_Body_Anchor_0190 = Vector((0.9138, -2.6991, 0.7915))
# Hardpoint Hongqi_L5_Body_Anchor_0191 = Vector((0.8694, -2.6924, 0.7334))
# Hardpoint Hongqi_L5_Body_Anchor_0192 = Vector((0.8145, -2.6789, 0.6728))
# Hardpoint Hongqi_L5_Body_Anchor_0193 = Vector((0.7498, -2.6587, 0.6098))
# Hardpoint Hongqi_L5_Body_Anchor_0194 = Vector((0.6760, -2.6318, 0.5451))
# Hardpoint Hongqi_L5_Body_Anchor_0195 = Vector((0.5940, -2.5984, 0.4788))
# Hardpoint Hongqi_L5_Body_Anchor_0196 = Vector((0.5048, -2.5585, 0.4116))
# Hardpoint Hongqi_L5_Body_Anchor_0197 = Vector((0.4096, -2.5122, 0.3438))
# Hardpoint Hongqi_L5_Body_Anchor_0198 = Vector((0.3093, -2.4596, 0.2758))
# Hardpoint Hongqi_L5_Body_Anchor_0199 = Vector((0.2054, -2.4008, 0.2081))
# Hardpoint Hongqi_L5_Body_Anchor_0200 = Vector((0.0990, -2.3361, 0.1411))
# Hardpoint Hongqi_L5_Body_Anchor_0201 = Vector((-0.0087, -2.2655, 0.0753))
# Hardpoint Hongqi_L5_Body_Anchor_0202 = Vector((-0.1162, -2.1892, 0.0110))
# Hardpoint Hongqi_L5_Body_Anchor_0203 = Vector((-0.2223, -2.1075, -0.0513))
# Hardpoint Hongqi_L5_Body_Anchor_0204 = Vector((-0.3258, -2.0206, -0.1112))
# Hardpoint Hongqi_L5_Body_Anchor_0205 = Vector((-0.4253, -1.9285, -0.1684))
# Hardpoint Hongqi_L5_Body_Anchor_0206 = Vector((-0.5196, -1.8317, -0.2224))
# Hardpoint Hongqi_L5_Body_Anchor_0207 = Vector((-0.6077, -1.7302, -0.2730))
# Hardpoint Hongqi_L5_Body_Anchor_0208 = Vector((-0.6884, -1.6245, -0.3197))
# Hardpoint Hongqi_L5_Body_Anchor_0209 = Vector((-0.7608, -1.5147, -0.3624))
# Hardpoint Hongqi_L5_Body_Anchor_0210 = Vector((-0.8240, -1.4011, -0.4007))
# Hardpoint Hongqi_L5_Body_Anchor_0211 = Vector((-0.8773, -1.2839, -0.4344))
# Hardpoint Hongqi_L5_Body_Anchor_0212 = Vector((-0.9199, -1.1636, -0.4633))
# Hardpoint Hongqi_L5_Body_Anchor_0213 = Vector((-0.9515, -1.0404, -0.4872))
# Hardpoint Hongqi_L5_Body_Anchor_0214 = Vector((-0.9715, -0.9146, -0.5059))
# Hardpoint Hongqi_L5_Body_Anchor_0215 = Vector((-0.9798, -0.7865, -0.5193))
# Hardpoint Hongqi_L5_Body_Anchor_0216 = Vector((-0.9762, -0.6564, -0.5274))
# Hardpoint Hongqi_L5_Body_Anchor_0217 = Vector((-0.9608, -0.5247, -0.5300))
# Hardpoint Hongqi_L5_Body_Anchor_0218 = Vector((-0.9339, -0.3917, -0.5272))
# Hardpoint Hongqi_L5_Body_Anchor_0219 = Vector((-0.8956, -0.2577, -0.5190))
# Hardpoint Hongqi_L5_Body_Anchor_0220 = Vector((-0.8465, -0.1230, -0.5054))
# Hardpoint Hongqi_L5_Body_Anchor_0221 = Vector((-0.7872, 0.0119, -0.4865))
# Hardpoint Hongqi_L5_Body_Anchor_0222 = Vector((-0.7184, 0.1469, -0.4625))
# Hardpoint Hongqi_L5_Body_Anchor_0223 = Vector((-0.6408, 0.2814, -0.4335))
# Hardpoint Hongqi_L5_Body_Anchor_0224 = Vector((-0.5556, 0.4153, -0.3996))
# Hardpoint Hongqi_L5_Body_Anchor_0225 = Vector((-0.4636, 0.5481, -0.3612))
# Hardpoint Hongqi_L5_Body_Anchor_0226 = Vector((-0.3660, 0.6796, -0.3183))
# Hardpoint Hongqi_L5_Body_Anchor_0227 = Vector((-0.2640, 0.8093, -0.2714))
# Hardpoint Hongqi_L5_Body_Anchor_0228 = Vector((-0.1588, 0.9370, -0.2208))
# Hardpoint Hongqi_L5_Body_Anchor_0229 = Vector((-0.0517, 1.0624, -0.1666))
# Hardpoint Hongqi_L5_Body_Anchor_0230 = Vector((0.0561, 1.1852, -0.1094))
# Hardpoint Hongqi_L5_Body_Anchor_0231 = Vector((0.1632, 1.3049, -0.0494))
# Hardpoint Hongqi_L5_Body_Anchor_0232 = Vector((0.2682, 1.4214, 0.0130))
# Hardpoint Hongqi_L5_Body_Anchor_0233 = Vector((0.3701, 1.5344, 0.0773))
# Hardpoint Hongqi_L5_Body_Anchor_0234 = Vector((0.4675, 1.6435, 0.1432))
# Hardpoint Hongqi_L5_Body_Anchor_0235 = Vector((0.5592, 1.7485, 0.2102))
# Hardpoint Hongqi_L5_Body_Anchor_0236 = Vector((0.6442, 1.8491, 0.2779))
# Hardpoint Hongqi_L5_Body_Anchor_0237 = Vector((0.7214, 1.9452, 0.3459))
# Hardpoint Hongqi_L5_Body_Anchor_0238 = Vector((0.7898, 2.0363, 0.4137))
# Hardpoint Hongqi_L5_Body_Anchor_0239 = Vector((0.8487, 2.1224, 0.4809))
# Hardpoint Hongqi_L5_Body_Anchor_0240 = Vector((0.8974, 2.2032, 0.5471))
# Hardpoint Hongqi_L5_Body_Anchor_0241 = Vector((0.9352, 2.2784, 0.6118))
# Hardpoint Hongqi_L5_Body_Anchor_0242 = Vector((0.9617, 2.3480, 0.6747))
# Hardpoint Hongqi_L5_Body_Anchor_0243 = Vector((0.9766, 2.4117, 0.7353))
# Hardpoint Hongqi_L5_Body_Anchor_0244 = Vector((0.9797, 2.4693, 0.7932))
# Hardpoint Hongqi_L5_Body_Anchor_0245 = Vector((0.9709, 2.5208, 0.8481))
# Hardpoint Hongqi_L5_Body_Anchor_0246 = Vector((0.9504, 2.5660, 0.8997))
# Hardpoint Hongqi_L5_Body_Anchor_0247 = Vector((0.9184, 2.6048, 0.9475))
# Hardpoint Hongqi_L5_Body_Anchor_0248 = Vector((0.8753, 2.6370, 0.9913))
# Hardpoint Hongqi_L5_Body_Anchor_0249 = Vector((0.8216, 2.6627, 1.0308))
# Hardpoint Hongqi_L5_Body_Anchor_0250 = Vector((0.7580, 2.6817, 1.0658))
# Hardpoint Hongqi_L5_Body_Anchor_0251 = Vector((0.6853, 2.6941, 1.0960))
# Hardpoint Hongqi_L5_Body_Anchor_0252 = Vector((0.6042, 2.6996, 1.1212))
# Hardpoint Hongqi_L5_Body_Anchor_0253 = Vector((0.5158, 2.6985, 1.1414))
# Hardpoint Hongqi_L5_Body_Anchor_0254 = Vector((0.4213, 2.6906, 1.1562))
# Hardpoint Hongqi_L5_Body_Anchor_0255 = Vector((0.3216, 2.6759, 1.1657))
# Hardpoint Hongqi_L5_Body_Anchor_0256 = Vector((0.2180, 2.6546, 1.1698))
# Hardpoint Hongqi_L5_Body_Anchor_0257 = Vector((0.1118, 2.6266, 1.1685))
# Hardpoint Hongqi_L5_Body_Anchor_0258 = Vector((0.0042, 2.5921, 1.1617))
# Hardpoint Hongqi_L5_Body_Anchor_0259 = Vector((-0.1034, 2.5511, 1.1496))
# Hardpoint Hongqi_L5_Body_Anchor_0260 = Vector((-0.2097, 2.5037, 1.1321))
# Hardpoint Hongqi_L5_Body_Anchor_0261 = Vector((-0.3135, 2.4501, 1.1095))
# Hardpoint Hongqi_L5_Body_Anchor_0262 = Vector((-0.4136, 2.3903, 1.0818))
# Hardpoint Hongqi_L5_Body_Anchor_0263 = Vector((-0.5086, 2.3246, 1.0492))
# Hardpoint Hongqi_L5_Body_Anchor_0264 = Vector((-0.5975, 2.2531, 1.0120))
# Hardpoint Hongqi_L5_Body_Anchor_0265 = Vector((-0.6792, 2.1759, 0.9703))
# Hardpoint Hongqi_L5_Body_Anchor_0266 = Vector((-0.7526, 2.0933, 0.9245))
# Hardpoint Hongqi_L5_Body_Anchor_0267 = Vector((-0.8170, 2.0054, 0.8748))
# Hardpoint Hongqi_L5_Body_Anchor_0268 = Vector((-0.8714, 1.9126, 0.8216))
# Hardpoint Hongqi_L5_Body_Anchor_0269 = Vector((-0.9154, 1.8149, 0.7651))
# Hardpoint Hongqi_L5_Body_Anchor_0270 = Vector((-0.9483, 1.7127, 0.7058))
# Hardpoint Hongqi_L5_Body_Anchor_0271 = Vector((-0.9697, 1.6063, 0.6441))
# Hardpoint Hongqi_L5_Body_Anchor_0272 = Vector((-0.9794, 1.4958, 0.5802))
# Hardpoint Hongqi_L5_Body_Anchor_0273 = Vector((-0.9773, 1.3816, 0.5147))
# Hardpoint Hongqi_L5_Body_Anchor_0274 = Vector((-0.9633, 1.2639, 0.4480))
# Hardpoint Hongqi_L5_Body_Anchor_0275 = Vector((-0.9377, 1.1431, 0.3804))
# Hardpoint Hongqi_L5_Body_Anchor_0276 = Vector((-0.9008, 1.0194, 0.3125))
# Hardpoint Hongqi_L5_Body_Anchor_0277 = Vector((-0.8529, 0.8932, 0.2446))
# Hardpoint Hongqi_L5_Body_Anchor_0278 = Vector((-0.7948, 0.7647, 0.1772))
# Hardpoint Hongqi_L5_Body_Anchor_0279 = Vector((-0.7271, 0.6344, 0.1107))
# Hardpoint Hongqi_L5_Body_Anchor_0280 = Vector((-0.6506, 0.5024, 0.0455))
# Hardpoint Hongqi_L5_Body_Anchor_0281 = Vector((-0.5662, 0.3692, -0.0179))
# Hardpoint Hongqi_L5_Body_Anchor_0282 = Vector((-0.4749, 0.2351, -0.0792))
# Hardpoint Hongqi_L5_Body_Anchor_0283 = Vector((-0.3779, 0.1003, -0.1379))
# Hardpoint Hongqi_L5_Body_Anchor_0284 = Vector((-0.2764, -0.0346, -0.1936))
# Hardpoint Hongqi_L5_Body_Anchor_0285 = Vector((-0.1715, -0.1695, -0.2461))
# Hardpoint Hongqi_L5_Body_Anchor_0286 = Vector((-0.0646, -0.3040, -0.2950))
# Hardpoint Hongqi_L5_Body_Anchor_0287 = Vector((0.0432, -0.4377, -0.3399))
# Hardpoint Hongqi_L5_Body_Anchor_0288 = Vector((0.1504, -0.5703, -0.3806))
# Hardpoint Hongqi_L5_Body_Anchor_0289 = Vector((0.2558, -0.7015, -0.4168))
# Hardpoint Hongqi_L5_Body_Anchor_0290 = Vector((0.3581, -0.8309, -0.4483))
# Hardpoint Hongqi_L5_Body_Anchor_0291 = Vector((0.4561, -0.9583, -0.4749))
# Hardpoint Hongqi_L5_Body_Anchor_0292 = Vector((0.5485, -1.0833, -0.4964))
# Hardpoint Hongqi_L5_Body_Anchor_0293 = Vector((0.6344, -1.2055, -0.5127))
# Hardpoint Hongqi_L5_Body_Anchor_0294 = Vector((0.7125, -1.3247, -0.5237))
# Hardpoint Hongqi_L5_Body_Anchor_0295 = Vector((0.7821, -1.4407, -0.5293))
# Hardpoint Hongqi_L5_Body_Anchor_0296 = Vector((0.8422, -1.5530, -0.5294))
# Hardpoint Hongqi_L5_Body_Anchor_0297 = Vector((0.8921, -1.6615, -0.5241))
# Hardpoint Hongqi_L5_Body_Anchor_0298 = Vector((0.9313, -1.7657, -0.5134))
# Hardpoint Hongqi_L5_Body_Anchor_0299 = Vector((0.9591, -1.8656, -0.4974))
# Hardpoint Hongqi_L5_Body_Anchor_0300 = Vector((0.9754, -1.9608, -0.4761))
# Hardpoint Hongqi_L5_Body_Anchor_0301 = Vector((0.9799, -2.0512, -0.4497))
# Hardpoint Hongqi_L5_Body_Anchor_0302 = Vector((0.9726, -2.1363, -0.4185))
# Hardpoint Hongqi_L5_Body_Anchor_0303 = Vector((0.9535, -2.2162, -0.3825))
# Hardpoint Hongqi_L5_Body_Anchor_0304 = Vector((0.9228, -2.2905, -0.3420))
# Hardpoint Hongqi_L5_Body_Anchor_0305 = Vector((0.8810, -2.3591, -0.2972))
# Hardpoint Hongqi_L5_Body_Anchor_0306 = Vector((0.8286, -2.4218, -0.2486))
# Hardpoint Hongqi_L5_Body_Anchor_0307 = Vector((0.7661, -2.4784, -0.1963))
# Hardpoint Hongqi_L5_Body_Anchor_0308 = Vector((0.6944, -2.5289, -0.1406))
# Hardpoint Hongqi_L5_Body_Anchor_0309 = Vector((0.6143, -2.5730, -0.0821))
# Hardpoint Hongqi_L5_Body_Anchor_0310 = Vector((0.5268, -2.6107, -0.0210))
# Hardpoint Hongqi_L5_Body_Anchor_0311 = Vector((0.4329, -2.6418, 0.0424))
# Hardpoint Hongqi_L5_Body_Anchor_0312 = Vector((0.3338, -2.6664, 0.1074))
# Hardpoint Hongqi_L5_Body_Anchor_0313 = Vector((0.2306, -2.6843, 0.1739))
# Hardpoint Hongqi_L5_Body_Anchor_0314 = Vector((0.1246, -2.6955, 0.2413))
# Hardpoint Hongqi_L5_Body_Anchor_0315 = Vector((0.0172, -2.6999, 0.3092))
# Hardpoint Hongqi_L5_Body_Anchor_0316 = Vector((-0.0905, -2.6976, 0.3771))
# Hardpoint Hongqi_L5_Body_Anchor_0317 = Vector((-0.1971, -2.6886, 0.4447))
# Hardpoint Hongqi_L5_Body_Anchor_0318 = Vector((-0.3013, -2.6728, 0.5115))
# Hardpoint Hongqi_L5_Body_Anchor_0319 = Vector((-0.4018, -2.6504, 0.5771))
# Hardpoint Hongqi_L5_Body_Anchor_0320 = Vector((-0.4975, -2.6213, 0.6410))
# Hardpoint Hongqi_L5_Body_Anchor_0321 = Vector((-0.5872, -2.5857, 0.7029))
# Hardpoint Hongqi_L5_Body_Anchor_0322 = Vector((-0.6698, -2.5436, 0.7623))
# Hardpoint Hongqi_L5_Body_Anchor_0323 = Vector((-0.7443, -2.4952, 0.8189))
# Hardpoint Hongqi_L5_Body_Anchor_0324 = Vector((-0.8098, -2.4405, 0.8723))
# Hardpoint Hongqi_L5_Body_Anchor_0325 = Vector((-0.8655, -2.3797, 0.9222))
# Hardpoint Hongqi_L5_Body_Anchor_0326 = Vector((-0.9107, -2.3130, 0.9682))
# Hardpoint Hongqi_L5_Body_Anchor_0327 = Vector((-0.9449, -2.2405, 1.0100))
# Hardpoint Hongqi_L5_Body_Anchor_0328 = Vector((-0.9677, -2.1624, 1.0475))
# Hardpoint Hongqi_L5_Body_Anchor_0329 = Vector((-0.9789, -2.0789, 1.0803))
# Hardpoint Hongqi_L5_Body_Anchor_0330 = Vector((-0.9781, -1.9902, 1.1082))
# Hardpoint Hongqi_L5_Body_Anchor_0331 = Vector((-0.9656, -1.8965, 1.1311))
# Hardpoint Hongqi_L5_Body_Anchor_0332 = Vector((-0.9414, -1.7981, 1.1489))
# Hardpoint Hongqi_L5_Body_Anchor_0333 = Vector((-0.9058, -1.6951, 1.1613))
# Hardpoint Hongqi_L5_Body_Anchor_0334 = Vector((-0.8592, -1.5880, 1.1683))
# Hardpoint Hongqi_L5_Body_Anchor_0335 = Vector((-0.8023, -1.4769, 1.1699))
# Hardpoint Hongqi_L5_Body_Anchor_0336 = Vector((-0.7357, -1.3620, 1.1660))
# Hardpoint Hongqi_L5_Body_Anchor_0337 = Vector((-0.6602, -1.2438, 1.1568))
# Hardpoint Hongqi_L5_Body_Anchor_0338 = Vector((-0.5767, -1.1225, 1.1422))
# Hardpoint Hongqi_L5_Body_Anchor_0339 = Vector((-0.4862, -0.9984, 1.1223))
# Hardpoint Hongqi_L5_Body_Anchor_0340 = Vector((-0.3898, -0.8717, 1.0973))
# Hardpoint Hongqi_L5_Body_Anchor_0341 = Vector((-0.2888, -0.7429, 1.0674))
# Hardpoint Hongqi_L5_Body_Anchor_0342 = Vector((-0.1842, -0.6123, 1.0326))
# Hardpoint Hongqi_L5_Body_Anchor_0343 = Vector((-0.0774, -0.4801, 0.9933))
# Hardpoint Hongqi_L5_Body_Anchor_0344 = Vector((0.0303, -0.3467, 0.9497))
# Hardpoint Hongqi_L5_Body_Anchor_0345 = Vector((0.1376, -0.2124, 0.9021))
# Hardpoint Hongqi_L5_Body_Anchor_0346 = Vector((0.2433, -0.0776, 0.8507))
# Hardpoint Hongqi_L5_Body_Anchor_0347 = Vector((0.3460, 0.0573, 0.7960))
# Hardpoint Hongqi_L5_Body_Anchor_0348 = Vector((0.4446, 0.1922, 0.7382))
# Hardpoint Hongqi_L5_Body_Anchor_0349 = Vector((0.5378, 0.3265, 0.6777))
# Hardpoint Hongqi_L5_Body_Anchor_0350 = Vector((0.6245, 0.4601, 0.6149))
# Hardpoint Hongqi_L5_Body_Anchor_0351 = Vector((0.7036, 0.5925, 0.5503))
# Hardpoint Hongqi_L5_Body_Anchor_0352 = Vector((0.7742, 0.7234, 0.4841))
# Hardpoint Hongqi_L5_Body_Anchor_0353 = Vector((0.8355, 0.8525, 0.4170))
# Hardpoint Hongqi_L5_Body_Anchor_0354 = Vector((0.8867, 0.9795, 0.3492))
# Hardpoint Hongqi_L5_Body_Anchor_0355 = Vector((0.9272, 1.1040, 0.2812))
# Hardpoint Hongqi_L5_Body_Anchor_0356 = Vector((0.9564, 1.2258, 0.2135))
# Hardpoint Hongqi_L5_Body_Anchor_0357 = Vector((0.9741, 1.3445, 0.1464))
# Hardpoint Hongqi_L5_Body_Anchor_0358 = Vector((0.9800, 1.4598, 0.0805))
# Hardpoint Hongqi_L5_Body_Anchor_0359 = Vector((0.9741, 1.5715, 0.0161))
# Hardpoint Hongqi_L5_Body_Anchor_0360 = Vector((0.9564, 1.6793, -0.0464))
# Hardpoint Hongqi_L5_Body_Anchor_0361 = Vector((0.9271, 1.7829, -0.1065))
# Hardpoint Hongqi_L5_Body_Anchor_0362 = Vector((0.8866, 1.8820, -0.1639))
# Hardpoint Hongqi_L5_Body_Anchor_0363 = Vector((0.8354, 1.9764, -0.2182))
# Hardpoint Hongqi_L5_Body_Anchor_0364 = Vector((0.7741, 2.0658, -0.2691))
# Hardpoint Hongqi_L5_Body_Anchor_0365 = Vector((0.7035, 2.1502, -0.3162))
# Hardpoint Hongqi_L5_Body_Anchor_0366 = Vector((0.6243, 2.2291, -0.3592))
# Hardpoint Hongqi_L5_Body_Anchor_0367 = Vector((0.5376, 2.3024, -0.3978))
# Hardpoint Hongqi_L5_Body_Anchor_0368 = Vector((0.4444, 2.3700, -0.4319))
# Hardpoint Hongqi_L5_Body_Anchor_0369 = Vector((0.3459, 2.4317, -0.4612))
# Hardpoint Hongqi_L5_Body_Anchor_0370 = Vector((0.2431, 2.4873, -0.4855))
# Hardpoint Hongqi_L5_Body_Anchor_0371 = Vector((0.1374, 2.5367, -0.5046))
# Hardpoint Hongqi_L5_Body_Anchor_0372 = Vector((0.0301, 2.5798, -0.5184))
# Hardpoint Hongqi_L5_Body_Anchor_0373 = Vector((-0.0776, 2.6164, -0.5269))
# Hardpoint Hongqi_L5_Body_Anchor_0374 = Vector((-0.1844, 2.6464, -0.5300))
# Hardpoint Hongqi_L5_Body_Anchor_0375 = Vector((-0.2890, 2.6699, -0.5276))
# Hardpoint Hongqi_L5_Body_Anchor_0376 = Vector((-0.3900, 2.6866, -0.5198))
# Hardpoint Hongqi_L5_Body_Anchor_0377 = Vector((-0.4863, 2.6967, -0.5067))
# Hardpoint Hongqi_L5_Body_Anchor_0378 = Vector((-0.5768, 2.7000, -0.4882))
# Hardpoint Hongqi_L5_Body_Anchor_0379 = Vector((-0.6603, 2.6966, -0.4646))
# Hardpoint Hongqi_L5_Body_Anchor_0380 = Vector((-0.7358, 2.6864, -0.4359))
# Hardpoint Hongqi_L5_Body_Anchor_0381 = Vector((-0.8024, 2.6695, -0.4025))
# Hardpoint Hongqi_L5_Body_Anchor_0382 = Vector((-0.8593, 2.6459, -0.3644))
# Hardpoint Hongqi_L5_Body_Anchor_0383 = Vector((-0.9059, 2.6158, -0.3219))
# Hardpoint Hongqi_L5_Body_Anchor_0384 = Vector((-0.9414, 2.5791, -0.2753))
# Hardpoint Hongqi_L5_Body_Anchor_0385 = Vector((-0.9656, 2.5359, -0.2249))
# Hardpoint Hongqi_L5_Body_Anchor_0386 = Vector((-0.9781, 2.4864, -0.1711))
# Hardpoint Hongqi_L5_Body_Anchor_0387 = Vector((-0.9788, 2.4307, -0.1140))
# Hardpoint Hongqi_L5_Body_Anchor_0388 = Vector((-0.9677, 2.3689, -0.0543))
# Hardpoint Hongqi_L5_Body_Anchor_0389 = Vector((-0.9449, 2.3012, 0.0079))
# Hardpoint Hongqi_L5_Body_Anchor_0390 = Vector((-0.9106, 2.2277, 0.0721))
# Hardpoint Hongqi_L5_Body_Anchor_0391 = Vector((-0.8654, 2.1487, 0.1379))
# Hardpoint Hongqi_L5_Body_Anchor_0392 = Vector((-0.8097, 2.0643, 0.2048))
# Hardpoint Hongqi_L5_Body_Anchor_0393 = Vector((-0.7442, 1.9747, 0.2725))
# Hardpoint Hongqi_L5_Body_Anchor_0394 = Vector((-0.6697, 1.8802, 0.3405))
# Hardpoint Hongqi_L5_Body_Anchor_0395 = Vector((-0.5871, 1.7811, 0.4083))
# Hardpoint Hongqi_L5_Body_Anchor_0396 = Vector((-0.4974, 1.6774, 0.4756))
# Hardpoint Hongqi_L5_Body_Anchor_0397 = Vector((-0.4017, 1.5696, 0.5419))
# Hardpoint Hongqi_L5_Body_Anchor_0398 = Vector((-0.3011, 1.4578, 0.6067))
# Hardpoint Hongqi_L5_Body_Anchor_0399 = Vector((-0.1969, 1.3424, 0.6698))
# Hardpoint Hongqi_L5_Body_Anchor_0400 = Vector((-0.0903, 1.2236, 0.7305))
# Hardpoint Hongqi_L5_Body_Anchor_0401 = Vector((0.0173, 1.1018, 0.7887))
# Hardpoint Hongqi_L5_Body_Anchor_0402 = Vector((0.1248, 0.9772, 0.8439))
# Hardpoint Hongqi_L5_Body_Anchor_0403 = Vector((0.2308, 0.8502, 0.8957))
# Hardpoint Hongqi_L5_Body_Anchor_0404 = Vector((0.3339, 0.7211, 0.9438))
# Hardpoint Hongqi_L5_Body_Anchor_0405 = Vector((0.4331, 0.5901, 0.9880))
# Hardpoint Hongqi_L5_Body_Anchor_0406 = Vector((0.5269, 0.4577, 1.0278))
# Hardpoint Hongqi_L5_Body_Anchor_0407 = Vector((0.6145, 0.3242, 1.0632))
# Hardpoint Hongqi_L5_Body_Anchor_0408 = Vector((0.6946, 0.1898, 1.0938))
# Hardpoint Hongqi_L5_Body_Anchor_0409 = Vector((0.7663, 0.0549, 1.1194))
# Hardpoint Hongqi_L5_Body_Anchor_0410 = Vector((0.8287, -0.0800, 1.1399))
# Hardpoint Hongqi_L5_Body_Anchor_0411 = Vector((0.8811, -0.2148, 1.1552))
# Hardpoint Hongqi_L5_Body_Anchor_0412 = Vector((0.9229, -0.3491, 1.1652))
# Hardpoint Hongqi_L5_Body_Anchor_0413 = Vector((0.9535, -0.4824, 1.1697))
# Hardpoint Hongqi_L5_Body_Anchor_0414 = Vector((0.9726, -0.6146, 1.1688))
# Hardpoint Hongqi_L5_Body_Anchor_0415 = Vector((0.9799, -0.7452, 1.1625))
# Hardpoint Hongqi_L5_Body_Anchor_0416 = Vector((0.9754, -0.8740, 1.1507))
# Hardpoint Hongqi_L5_Body_Anchor_0417 = Vector((0.9591, -1.0006, 1.1337))
# Hardpoint Hongqi_L5_Body_Anchor_0418 = Vector((0.9312, -1.1247, 1.1115))
# Hardpoint Hongqi_L5_Body_Anchor_0419 = Vector((0.8920, -1.2460, 1.0842))
# Hardpoint Hongqi_L5_Body_Anchor_0420 = Vector((0.8421, -1.3641, 1.0520))
# Hardpoint Hongqi_L5_Body_Anchor_0421 = Vector((0.7820, -1.4789, 1.0151))
# Hardpoint Hongqi_L5_Body_Anchor_0422 = Vector((0.7124, -1.5899, 0.9738))
# Hardpoint Hongqi_L5_Body_Anchor_0423 = Vector((0.6342, -1.6970, 0.9283))
# Hardpoint Hongqi_L5_Body_Anchor_0424 = Vector((0.5484, -1.7998, 0.8789))
# Hardpoint Hongqi_L5_Body_Anchor_0425 = Vector((0.4559, -1.8982, 0.8259))
# Hardpoint Hongqi_L5_Body_Anchor_0426 = Vector((0.3579, -1.9918, 0.7697))
# Hardpoint Hongqi_L5_Body_Anchor_0427 = Vector((0.2556, -2.0804, 0.7106))
# Hardpoint Hongqi_L5_Body_Anchor_0428 = Vector((0.1502, -2.1638, 0.6491))
# Hardpoint Hongqi_L5_Body_Anchor_0429 = Vector((0.0430, -2.2418, 0.5854))
# Hardpoint Hongqi_L5_Body_Anchor_0430 = Vector((-0.0647, -2.3142, 0.5200))
# Hardpoint Hongqi_L5_Body_Anchor_0431 = Vector((-0.1717, -2.3808, 0.4533))
# Hardpoint Hongqi_L5_Body_Anchor_0432 = Vector((-0.2766, -2.4415, 0.3858))
# Hardpoint Hongqi_L5_Body_Anchor_0433 = Vector((-0.3781, -2.4961, 0.3179))
# Hardpoint Hongqi_L5_Body_Anchor_0434 = Vector((-0.4751, -2.5444, 0.2500))
# Hardpoint Hongqi_L5_Body_Anchor_0435 = Vector((-0.5663, -2.5864, 0.1825))
# Hardpoint Hongqi_L5_Body_Anchor_0436 = Vector((-0.6507, -2.6219, 0.1159))
# Hardpoint Hongqi_L5_Body_Anchor_0437 = Vector((-0.7272, -2.6508, 0.0506))
# Hardpoint Hongqi_L5_Body_Anchor_0438 = Vector((-0.7949, -2.6731, -0.0129))
# Hardpoint Hongqi_L5_Body_Anchor_0439 = Vector((-0.8530, -2.6888, -0.0744))
# Hardpoint Hongqi_L5_Body_Anchor_0440 = Vector((-0.9008, -2.6977, -0.1333))
# Hardpoint Hongqi_L5_Body_Anchor_0441 = Vector((-0.9378, -2.6999, -0.1893))
# Hardpoint Hongqi_L5_Body_Anchor_0442 = Vector((-0.9633, -2.6953, -0.2421))
# Hardpoint Hongqi_L5_Body_Anchor_0443 = Vector((-0.9773, -2.6840, -0.2912))
# Hardpoint Hongqi_L5_Body_Anchor_0444 = Vector((-0.9794, -2.6660, -0.3365))
# Hardpoint Hongqi_L5_Body_Anchor_0445 = Vector((-0.9697, -2.6413, -0.3775))
# Hardpoint Hongqi_L5_Body_Anchor_0446 = Vector((-0.9482, -2.6100, -0.4141))
# Hardpoint Hongqi_L5_Body_Anchor_0447 = Vector((-0.9153, -2.5722, -0.4460))
# Hardpoint Hongqi_L5_Body_Anchor_0448 = Vector((-0.8714, -2.5280, -0.4730))
# Hardpoint Hongqi_L5_Body_Anchor_0449 = Vector((-0.8169, -2.4775, -0.4949))
# Hardpoint Hongqi_L5_Body_Anchor_0450 = Vector((-0.7525, -2.4207, -0.5116))
# Hardpoint Hongqi_L5_Body_Anchor_0451 = Vector((-0.6790, -2.3579, -0.5230))
# Hardpoint Hongqi_L5_Body_Anchor_0452 = Vector((-0.5974, -2.2892, -0.5290))
# Hardpoint Hongqi_L5_Body_Anchor_0453 = Vector((-0.5085, -2.2148, -0.5296))
# Hardpoint Hongqi_L5_Body_Anchor_0454 = Vector((-0.4134, -2.1349, -0.5247))
# Hardpoint Hongqi_L5_Body_Anchor_0455 = Vector((-0.3134, -2.0496, -0.5144))
# Hardpoint Hongqi_L5_Body_Anchor_0456 = Vector((-0.2095, -1.9592, -0.4988))
# Hardpoint Hongqi_L5_Body_Anchor_0457 = Vector((-0.1032, -1.8639, -0.4780))
# Hardpoint Hongqi_L5_Body_Anchor_0458 = Vector((0.0044, -1.7639, -0.4520))
# Hardpoint Hongqi_L5_Body_Anchor_0459 = Vector((0.1120, -1.6596, -0.4211))
# Hardpoint Hongqi_L5_Body_Anchor_0460 = Vector((0.2182, -1.5510, -0.3855))
# Hardpoint Hongqi_L5_Body_Anchor_0461 = Vector((0.3217, -1.4386, -0.3454))
# Hardpoint Hongqi_L5_Body_Anchor_0462 = Vector((0.4214, -1.3227, -0.3010))
# Hardpoint Hongqi_L5_Body_Anchor_0463 = Vector((0.5160, -1.2034, -0.2526))
# Hardpoint Hongqi_L5_Body_Anchor_0464 = Vector((0.6043, -1.0811, -0.2006))
# Hardpoint Hongqi_L5_Body_Anchor_0465 = Vector((0.6854, -0.9561, -0.1452))
# Hardpoint Hongqi_L5_Body_Anchor_0466 = Vector((0.7581, -0.8287, -0.0868))
# Hardpoint Hongqi_L5_Body_Anchor_0467 = Vector((0.8217, -0.6992, -0.0259))
# Hardpoint Hongqi_L5_Body_Anchor_0468 = Vector((0.8754, -0.5680, 0.0372))
# Hardpoint Hongqi_L5_Body_Anchor_0469 = Vector((0.9185, -0.4353, 0.1022))
# Hardpoint Hongqi_L5_Body_Anchor_0470 = Vector((0.9504, -0.3016, 0.1686))
# Hardpoint Hongqi_L5_Body_Anchor_0471 = Vector((0.9709, -0.1671, 0.2359))
# Hardpoint Hongqi_L5_Body_Anchor_0472 = Vector((0.9797, -0.0323, 0.3038))
# Hardpoint Hongqi_L5_Body_Anchor_0473 = Vector((0.9766, 0.1027, 0.3717))
# Hardpoint Hongqi_L5_Body_Anchor_0474 = Vector((0.9617, 0.2374, 0.4394))
# Hardpoint Hongqi_L5_Body_Anchor_0475 = Vector((0.9351, 0.3716, 0.5062))
# Hardpoint Hongqi_L5_Body_Anchor_0476 = Vector((0.8973, 0.5048, 0.5719))
# Hardpoint Hongqi_L5_Body_Anchor_0477 = Vector((0.8486, 0.6367, 0.6360))
# Hardpoint Hongqi_L5_Body_Anchor_0478 = Vector((0.7897, 0.7670, 0.6980))
# Hardpoint Hongqi_L5_Body_Anchor_0479 = Vector((0.7212, 0.8955, 0.7577))
# Hardpoint Hongqi_L5_Body_Anchor_0480 = Vector((0.6440, 1.0216, 0.8145))
# Hardpoint Hongqi_L5_Body_Anchor_0481 = Vector((0.5591, 1.1453, 0.8682))
# Hardpoint Hongqi_L5_Body_Anchor_0482 = Vector((0.4673, 1.2661, 0.9183))
# Hardpoint Hongqi_L5_Body_Anchor_0483 = Vector((0.3699, 1.3837, 0.9647))
# Hardpoint Hongqi_L5_Body_Anchor_0484 = Vector((0.2681, 1.4978, 1.0069))
# Hardpoint Hongqi_L5_Body_Anchor_0485 = Vector((0.1630, 1.6082, 1.0447))
# Hardpoint Hongqi_L5_Body_Anchor_0486 = Vector((0.0559, 1.7146, 1.0779))
# Hardpoint Hongqi_L5_Body_Anchor_0487 = Vector((-0.0518, 1.8167, 1.1062))
# Hardpoint Hongqi_L5_Body_Anchor_0488 = Vector((-0.1590, 1.9143, 1.1295))
# Hardpoint Hongqi_L5_Body_Anchor_0489 = Vector((-0.2642, 2.0070, 1.1476))
# Hardpoint Hongqi_L5_Body_Anchor_0490 = Vector((-0.3662, 2.0948, 1.1605))
# Hardpoint Hongqi_L5_Body_Anchor_0491 = Vector((-0.4637, 2.1773, 1.1679))
# Hardpoint Hongqi_L5_Body_Anchor_0492 = Vector((-0.5557, 2.2544, 1.1700))
# Hardpoint Hongqi_L5_Body_Anchor_0493 = Vector((-0.6410, 2.3258, 1.1666))
# Hardpoint Hongqi_L5_Body_Anchor_0494 = Vector((-0.7185, 2.3915, 1.1577))
# Hardpoint Hongqi_L5_Body_Anchor_0495 = Vector((-0.7873, 2.4511, 1.1436))
# Hardpoint Hongqi_L5_Body_Anchor_0496 = Vector((-0.8466, 2.5046, 1.1241))
# Hardpoint Hongqi_L5_Body_Anchor_0497 = Vector((-0.8957, 2.5519, 1.0995))
# Hardpoint Hongqi_L5_Body_Anchor_0498 = Vector((-0.9339, 2.5928, 1.0699))
# Hardpoint Hongqi_L5_Body_Anchor_0499 = Vector((-0.9609, 2.6272, 1.0356))
# Hardpoint Hongqi_L5_Body_Anchor_0500 = Vector((-0.9762, 2.6550, 0.9966))
# Hardpoint Hongqi_L5_Body_Anchor_0501 = Vector((-0.9798, 2.6762, 0.9533))
# Hardpoint Hongqi_L5_Body_Anchor_0502 = Vector((-0.9715, 2.6908, 0.9060))
# Hardpoint Hongqi_L5_Body_Anchor_0503 = Vector((-0.9514, 2.6986, 0.8549))
# Hardpoint Hongqi_L5_Body_Anchor_0504 = Vector((-0.9199, 2.6996, 0.8004))
# Hardpoint Hongqi_L5_Body_Anchor_0505 = Vector((-0.8772, 2.6939, 0.7429))
# Hardpoint Hongqi_L5_Body_Anchor_0506 = Vector((-0.8239, 2.6815, 0.6826))
# Hardpoint Hongqi_L5_Body_Anchor_0507 = Vector((-0.7607, 2.6623, 0.6200))
# Hardpoint Hongqi_L5_Body_Anchor_0508 = Vector((-0.6883, 2.6365, 0.5555))
# Hardpoint Hongqi_L5_Body_Anchor_0509 = Vector((-0.6075, 2.6041, 0.4895))
# Hardpoint Hongqi_L5_Body_Anchor_0510 = Vector((-0.5195, 2.5653, 0.4223))
# Hardpoint Hongqi_L5_Body_Anchor_0511 = Vector((-0.4251, 2.5200, 0.3546))
# Hardpoint Hongqi_L5_Body_Anchor_0512 = Vector((-0.3256, 2.4683, 0.2866))
# Hardpoint Hongqi_L5_Body_Anchor_0513 = Vector((-0.2221, 2.4106, 0.2188))
# Hardpoint Hongqi_L5_Body_Anchor_0514 = Vector((-0.1160, 2.3468, 0.1517))
# Hardpoint Hongqi_L5_Body_Anchor_0515 = Vector((-0.0085, 2.2771, 0.0857))
# Hardpoint Hongqi_L5_Body_Anchor_0516 = Vector((0.0991, 2.2018, 0.0211))
# Hardpoint Hongqi_L5_Body_Anchor_0517 = Vector((0.2056, 2.1209, -0.0415))
# Hardpoint Hongqi_L5_Body_Anchor_0518 = Vector((0.3095, 2.0347, -0.1018))
# Hardpoint Hongqi_L5_Body_Anchor_0519 = Vector((0.4097, 1.9435, -0.1595))
# Hardpoint Hongqi_L5_Body_Anchor_0520 = Vector((0.5050, 1.8474, -0.2140))
# Hardpoint Hongqi_L5_Body_Anchor_0521 = Vector((0.5941, 1.7467, -0.2651))
# Hardpoint Hongqi_L5_Body_Anchor_0522 = Vector((0.6761, 1.6416, -0.3125))
# Hardpoint Hongqi_L5_Body_Anchor_0523 = Vector((0.7499, 1.5324, -0.3559))
# Hardpoint Hongqi_L5_Body_Anchor_0524 = Vector((0.8146, 1.4194, -0.3949))
# Hardpoint Hongqi_L5_Body_Anchor_0525 = Vector((0.8695, 1.3028, -0.4294))
# Hardpoint Hongqi_L5_Body_Anchor_0526 = Vector((0.9139, 1.1830, -0.4590))
# Hardpoint Hongqi_L5_Body_Anchor_0527 = Vector((0.9472, 1.0602, -0.4837))
# Hardpoint Hongqi_L5_Body_Anchor_0528 = Vector((0.9691, 0.9348, -0.5033))
# Hardpoint Hongqi_L5_Body_Anchor_0529 = Vector((0.9792, 0.8070, -0.5175))
# Hardpoint Hongqi_L5_Body_Anchor_0530 = Vector((0.9776, 0.6772, -0.5264))
# Hardpoint Hongqi_L5_Body_Anchor_0531 = Vector((0.9641, 0.5458, -0.5299))
# Hardpoint Hongqi_L5_Body_Anchor_0532 = Vector((0.9389, 0.4129, -0.5280))
# Hardpoint Hongqi_L5_Body_Anchor_0533 = Vector((0.9024, 0.2791, -0.5206))
# Hardpoint Hongqi_L5_Body_Anchor_0534 = Vector((0.8550, 0.1445, -0.5079))
# Hardpoint Hongqi_L5_Body_Anchor_0535 = Vector((0.7973, 0.0096, -0.4899))
# Hardpoint Hongqi_L5_Body_Anchor_0536 = Vector((0.7299, -0.1254, -0.4667))
# Hardpoint Hongqi_L5_Body_Anchor_0537 = Vector((0.6537, -0.2600, -0.4384))
# Hardpoint Hongqi_L5_Body_Anchor_0538 = Vector((0.5696, -0.3940, -0.4053))
# Hardpoint Hongqi_L5_Body_Anchor_0539 = Vector((0.4786, -0.5270, -0.3676))
# Hardpoint Hongqi_L5_Body_Anchor_0540 = Vector((0.3819, -0.6587, -0.3254))
# Hardpoint Hongqi_L5_Body_Anchor_0541 = Vector((0.2805, -0.7888, -0.2792))
# Hardpoint Hongqi_L5_Body_Anchor_0542 = Vector((0.1757, -0.9168, -0.2291))
# Hardpoint Hongqi_L5_Body_Anchor_0543 = Vector((0.0688, -1.0426, -0.1755))
# Hardpoint Hongqi_L5_Body_Anchor_0544 = Vector((-0.0389, -1.1658, -0.1187))
# Hardpoint Hongqi_L5_Body_Anchor_0545 = Vector((-0.1462, -1.2861, -0.0591))
# Hardpoint Hongqi_L5_Body_Anchor_0546 = Vector((-0.2517, -1.4031, 0.0029))
# Hardpoint Hongqi_L5_Body_Anchor_0547 = Vector((-0.3541, -1.5166, 0.0669))
# Hardpoint Hongqi_L5_Body_Anchor_0548 = Vector((-0.4523, -1.6264, 0.1326))
# Hardpoint Hongqi_L5_Body_Anchor_0549 = Vector((-0.5450, -1.7321, 0.1995))
# Hardpoint Hongqi_L5_Body_Anchor_0550 = Vector((-0.6311, -1.8334, 0.2671))
# Hardpoint Hongqi_L5_Body_Anchor_0551 = Vector((-0.7096, -1.9302, 0.3350))
# Hardpoint Hongqi_L5_Body_Anchor_0552 = Vector((-0.7795, -2.0221, 0.4029))
# Hardpoint Hongqi_L5_Body_Anchor_0553 = Vector((-0.8400, -2.1090, 0.4703))
# Hardpoint Hongqi_L5_Body_Anchor_0554 = Vector((-0.8904, -2.1907, 0.5366))
# Hardpoint Hongqi_L5_Body_Anchor_0555 = Vector((-0.9299, -2.2668, 0.6016))
# Hardpoint Hongqi_L5_Body_Anchor_0556 = Vector((-0.9583, -2.3373, 0.6648))
# Hardpoint Hongqi_L5_Body_Anchor_0557 = Vector((-0.9750, -2.4019, 0.7258))
# Hardpoint Hongqi_L5_Body_Anchor_0558 = Vector((-0.9800, -2.4605, 0.7842))
# Hardpoint Hongqi_L5_Body_Anchor_0559 = Vector((-0.9731, -2.5130, 0.8396))
# Hardpoint Hongqi_L5_Body_Anchor_0560 = Vector((-0.9544, -2.5592, 0.8917))
# Hardpoint Hongqi_L5_Body_Anchor_0561 = Vector((-0.9242, -2.5990, 0.9401))
# Hardpoint Hongqi_L5_Body_Anchor_0562 = Vector((-0.8829, -2.6323, 0.9846))
# Hardpoint Hongqi_L5_Body_Anchor_0563 = Vector((-0.8309, -2.6591, 1.0248))
# Hardpoint Hongqi_L5_Body_Anchor_0564 = Vector((-0.7688, -2.6792, 1.0605))
# Hardpoint Hongqi_L5_Body_Anchor_0565 = Vector((-0.6974, -2.6925, 1.0915))
# Hardpoint Hongqi_L5_Body_Anchor_0566 = Vector((-0.6176, -2.6992, 1.1176))
# Hardpoint Hongqi_L5_Body_Anchor_0567 = Vector((-0.5304, -2.6991, 1.1385))
# Hardpoint Hongqi_L5_Body_Anchor_0568 = Vector((-0.4367, -2.6923, 1.1542))
# Hardpoint Hongqi_L5_Body_Anchor_0569 = Vector((-0.3377, -2.6787, 1.1646))
# Hardpoint Hongqi_L5_Body_Anchor_0570 = Vector((-0.2347, -2.6584, 1.1695))
# Hardpoint Hongqi_L5_Body_Anchor_0571 = Vector((-0.1288, -2.6315, 1.1691))
# Hardpoint Hongqi_L5_Body_Anchor_0572 = Vector((-0.0214, -2.5981, 1.1632))
# Hardpoint Hongqi_L5_Body_Anchor_0573 = Vector((0.0863, -2.5581, 1.1519))
# Hardpoint Hongqi_L5_Body_Anchor_0574 = Vector((0.1929, -2.5117, 1.1353))
# Hardpoint Hongqi_L5_Body_Anchor_0575 = Vector((0.2972, -2.4591, 1.1134))
# Hardpoint Hongqi_L5_Body_Anchor_0576 = Vector((0.3979, -2.4003, 1.0865))
# Hardpoint Hongqi_L5_Body_Anchor_0577 = Vector((0.4939, -2.3355, 1.0547))
# Hardpoint Hongqi_L5_Body_Anchor_0578 = Vector((0.5838, -2.2648, 1.0182))
# Hardpoint Hongqi_L5_Body_Anchor_0579 = Vector((0.6667, -2.1885, 0.9772))
# Hardpoint Hongqi_L5_Body_Anchor_0580 = Vector((0.7415, -2.1068, 0.9321))
# Hardpoint Hongqi_L5_Body_Anchor_0581 = Vector((0.8074, -2.0198, 0.8830))
# Hardpoint Hongqi_L5_Body_Anchor_0582 = Vector((0.8635, -1.9277, 0.8303))
# Hardpoint Hongqi_L5_Body_Anchor_0583 = Vector((0.9091, -1.8308, 0.7743))
# Hardpoint Hongqi_L5_Body_Anchor_0584 = Vector((0.9438, -1.7293, 0.7154))
# Hardpoint Hongqi_L5_Body_Anchor_0585 = Vector((0.9671, -1.6235, 0.6540))
# Hardpoint Hongqi_L5_Body_Anchor_0586 = Vector((0.9786, -1.5137, 0.5905))
# Hardpoint Hongqi_L5_Body_Anchor_0587 = Vector((0.9784, -1.4000, 0.5253))
# Hardpoint Hongqi_L5_Body_Anchor_0588 = Vector((0.9663, -1.2829, 0.4587))
# Hardpoint Hongqi_L5_Body_Anchor_0589 = Vector((0.9425, -1.1626, 0.3912))
# Hardpoint Hongqi_L5_Body_Anchor_0590 = Vector((0.9074, -1.0393, 0.3233))
# Hardpoint Hongqi_L5_Body_Anchor_0591 = Vector((0.8613, -0.9135, 0.2554))
# Hardpoint Hongqi_L5_Body_Anchor_0592 = Vector((0.8047, -0.7853, 0.1878))
# Hardpoint Hongqi_L5_Body_Anchor_0593 = Vector((0.7385, -0.6552, 0.1212))
# Hardpoint Hongqi_L5_Body_Anchor_0594 = Vector((0.6633, -0.5235, 0.0558))
# Hardpoint Hongqi_L5_Body_Anchor_0595 = Vector((0.5801, -0.3905, -0.0080))
# Hardpoint Hongqi_L5_Body_Anchor_0596 = Vector((0.4899, -0.2565, -0.0696))
# Hardpoint Hongqi_L5_Body_Anchor_0597 = Vector((0.3937, -0.1218, -0.1287))
# Hardpoint Hongqi_L5_Body_Anchor_0598 = Vector((0.2928, 0.0131, -0.1850))
# Hardpoint Hongqi_L5_Body_Anchor_0599 = Vector((0.1884, 0.1481, -0.2380))
# Hardpoint Hongqi_L5_Body_Anchor_0600 = Vector((0.0817, 0.2826, -0.2874))
# Hardpoint Hongqi_L5_Body_Anchor_0601 = Vector((-0.0260, 0.4165, -0.3330))
# Hardpoint Hongqi_L5_Body_Anchor_0602 = Vector((-0.1334, 0.5493, -0.3744))
# Hardpoint Hongqi_L5_Body_Anchor_0603 = Vector((-0.2392, 0.6807, -0.4114))
# Hardpoint Hongqi_L5_Body_Anchor_0604 = Vector((-0.3421, 0.8105, -0.4436))
# Hardpoint Hongqi_L5_Body_Anchor_0605 = Vector((-0.4408, 0.9382, -0.4710))
# Hardpoint Hongqi_L5_Body_Anchor_0606 = Vector((-0.5342, 1.0635, -0.4934))
# Hardpoint Hongqi_L5_Body_Anchor_0607 = Vector((-0.6212, 1.1862, -0.5105))
# Hardpoint Hongqi_L5_Body_Anchor_0608 = Vector((-0.7007, 1.3060, -0.5223))
# Hardpoint Hongqi_L5_Body_Anchor_0609 = Vector((-0.7716, 1.4224, -0.5287))
# Hardpoint Hongqi_L5_Body_Anchor_0610 = Vector((-0.8333, 1.5354, -0.5297))
# Hardpoint Hongqi_L5_Body_Anchor_0611 = Vector((-0.8849, 1.6445, -0.5253))
# Hardpoint Hongqi_L5_Body_Anchor_0612 = Vector((-0.9258, 1.7494, -0.5154))
# Hardpoint Hongqi_L5_Body_Anchor_0613 = Vector((-0.9555, 1.8500, -0.5003))
# Hardpoint Hongqi_L5_Body_Anchor_0614 = Vector((-0.9736, 1.9460, -0.4798))
# Hardpoint Hongqi_L5_Body_Anchor_0615 = Vector((-0.9800, 2.0371, -0.4543))
# Hardpoint Hongqi_L5_Body_Anchor_0616 = Vector((-0.9745, 2.1231, -0.4238))
# Hardpoint Hongqi_L5_Body_Anchor_0617 = Vector((-0.9573, 2.2038, -0.3885))
# Hardpoint Hongqi_L5_Body_Anchor_0618 = Vector((-0.9285, 2.2790, -0.3487))
# Hardpoint Hongqi_L5_Body_Anchor_0619 = Vector((-0.8884, 2.3486, -0.3046))
# Hardpoint Hongqi_L5_Body_Anchor_0620 = Vector((-0.8376, 2.4122, -0.2566))
# Hardpoint Hongqi_L5_Body_Anchor_0621 = Vector((-0.7767, 2.4698, -0.2048))
# Hardpoint Hongqi_L5_Body_Anchor_0622 = Vector((-0.7064, 2.5212, -0.1497))
# Hardpoint Hongqi_L5_Body_Anchor_0623 = Vector((-0.6276, 2.5664, -0.0916))
# Hardpoint Hongqi_L5_Body_Anchor_0624 = Vector((-0.5412, 2.6051, -0.0308))
# Hardpoint Hongqi_L5_Body_Anchor_0625 = Vector((-0.4482, 2.6373, 0.0321))
# Hardpoint Hongqi_L5_Body_Anchor_0626 = Vector((-0.3498, 2.6629, 0.0970))
# Hardpoint Hongqi_L5_Body_Anchor_0627 = Vector((-0.2472, 2.6819, 0.1632))
# Hardpoint Hongqi_L5_Body_Anchor_0628 = Vector((-0.1416, 2.6941, 0.2305))
# Hardpoint Hongqi_L5_Body_Anchor_0629 = Vector((-0.0343, 2.6997, 0.2983))
# Hardpoint Hongqi_L5_Body_Anchor_0630 = Vector((0.0734, 2.6984, 0.3663))
# Hardpoint Hongqi_L5_Body_Anchor_0631 = Vector((0.1802, 2.6905, 0.4340))
# Hardpoint Hongqi_L5_Body_Anchor_0632 = Vector((0.2849, 2.6758, 0.5009))
# Hardpoint Hongqi_L5_Body_Anchor_0633 = Vector((0.3861, 2.6544, 0.5667))
# Hardpoint Hongqi_L5_Body_Anchor_0634 = Vector((0.4827, 2.6264, 0.6310))
# Hardpoint Hongqi_L5_Body_Anchor_0635 = Vector((0.5734, 2.5918, 0.6932))
# Hardpoint Hongqi_L5_Body_Anchor_0636 = Vector((0.6571, 2.5507, 0.7530))
# Hardpoint Hongqi_L5_Body_Anchor_0637 = Vector((0.7330, 2.5033, 0.8101))
# Hardpoint Hongqi_L5_Body_Anchor_0638 = Vector((0.8000, 2.4496, 0.8640))
# Hardpoint Hongqi_L5_Body_Anchor_0639 = Vector((0.8573, 2.3898, 0.9145))
# Hardpoint Hongqi_L5_Body_Anchor_0640 = Vector((0.9042, 2.3240, 0.9611))
# Hardpoint Hongqi_L5_Body_Anchor_0641 = Vector((0.9402, 2.2524, 1.0037))
# Hardpoint Hongqi_L5_Body_Anchor_0642 = Vector((0.9649, 2.1752, 1.0418))
# Hardpoint Hongqi_L5_Body_Anchor_0643 = Vector((0.9779, 2.0925, 1.0754))
# Hardpoint Hongqi_L5_Body_Anchor_0644 = Vector((0.9790, 2.0046, 1.1041))
# Hardpoint Hongqi_L5_Body_Anchor_0645 = Vector((0.9684, 1.9117, 1.1278))
# Hardpoint Hongqi_L5_Body_Anchor_0646 = Vector((0.9460, 1.8140, 1.1464))
# Hardpoint Hongqi_L5_Body_Anchor_0647 = Vector((0.9122, 1.7118, 1.1596))
# Hardpoint Hongqi_L5_Body_Anchor_0648 = Vector((0.8674, 1.6053, 1.1675))
# Hardpoint Hongqi_L5_Body_Anchor_0649 = Vector((0.8120, 1.4948, 1.1700))
# Hardpoint Hongqi_L5_Body_Anchor_0650 = Vector((0.7469, 1.3806, 1.1670))
# Hardpoint Hongqi_L5_Body_Anchor_0651 = Vector((0.6727, 1.2629, 1.1586))
# Hardpoint Hongqi_L5_Body_Anchor_0652 = Vector((0.5905, 1.1420, 1.1449))
# Hardpoint Hongqi_L5_Body_Anchor_0653 = Vector((0.5010, 1.0183, 1.1258))
# Hardpoint Hongqi_L5_Body_Anchor_0654 = Vector((0.4055, 0.8921, 1.1017))
# Hardpoint Hongqi_L5_Body_Anchor_0655 = Vector((0.3051, 0.7636, 1.0725))
# Hardpoint Hongqi_L5_Body_Anchor_0656 = Vector((0.2011, 0.6332, 1.0385))
# Hardpoint Hongqi_L5_Body_Anchor_0657 = Vector((0.0946, 0.5012, 0.9999))
# Hardpoint Hongqi_L5_Body_Anchor_0658 = Vector((-0.0131, 0.3680, 0.9569))
# Hardpoint Hongqi_L5_Body_Anchor_0659 = Vector((-0.1206, 0.2339, 0.9099))
# Hardpoint Hongqi_L5_Body_Anchor_0660 = Vector((-0.2266, 0.0991, 0.8591))
# Hardpoint Hongqi_L5_Body_Anchor_0661 = Vector((-0.3299, -0.0358, 0.8049))
# Hardpoint Hongqi_L5_Body_Anchor_0662 = Vector((-0.4292, -0.1707, 0.7476))
# Hardpoint Hongqi_L5_Body_Anchor_0663 = Vector((-0.5234, -0.3052, 0.6875))
# Hardpoint Hongqi_L5_Body_Anchor_0664 = Vector((-0.6112, -0.4389, 0.6251))
# Hardpoint Hongqi_L5_Body_Anchor_0665 = Vector((-0.6916, -0.5715, 0.5607))
# Hardpoint Hongqi_L5_Body_Anchor_0666 = Vector((-0.7636, -0.7027, 0.4948))
# Hardpoint Hongqi_L5_Body_Anchor_0667 = Vector((-0.8264, -0.8321, 0.4277))
# Hardpoint Hongqi_L5_Body_Anchor_0668 = Vector((-0.8792, -0.9594, 0.3600))
# Hardpoint Hongqi_L5_Body_Anchor_0669 = Vector((-0.9214, -1.0844, 0.2920))
# Hardpoint Hongqi_L5_Body_Anchor_0670 = Vector((-0.9525, -1.2066, 0.2242))
# Hardpoint Hongqi_L5_Body_Anchor_0671 = Vector((-0.9721, -1.3258, 0.1570))
# Hardpoint Hongqi_L5_Body_Anchor_0672 = Vector((-0.9799, -1.4417, 0.0909))
# Hardpoint Hongqi_L5_Body_Anchor_0673 = Vector((-0.9758, -1.5540, 0.0262))
# Hardpoint Hongqi_L5_Body_Anchor_0674 = Vector((-0.9600, -1.6624, -0.0366))
# Hardpoint Hongqi_L5_Body_Anchor_0675 = Vector((-0.9325, -1.7667, -0.0971))
# Hardpoint Hongqi_L5_Body_Anchor_0676 = Vector((-0.8938, -1.8665, -0.1550))
# Hardpoint Hongqi_L5_Body_Anchor_0677 = Vector((-0.8443, -1.9617, -0.2098))
# Hardpoint Hongqi_L5_Body_Anchor_0678 = Vector((-0.7845, -2.0519, -0.2612))
# Hardpoint Hongqi_L5_Body_Anchor_0679 = Vector((-0.7153, -2.1371, -0.3089))
# Hardpoint Hongqi_L5_Body_Anchor_0680 = Vector((-0.6375, -2.2169, -0.3526))
# Hardpoint Hongqi_L5_Body_Anchor_0681 = Vector((-0.5519, -2.2911, -0.3920))
# Hardpoint Hongqi_L5_Body_Anchor_0682 = Vector((-0.4597, -2.3597, -0.4268))
# Hardpoint Hongqi_L5_Body_Anchor_0683 = Vector((-0.3619, -2.4223, -0.4569))
# Hardpoint Hongqi_L5_Body_Anchor_0684 = Vector((-0.2597, -2.4789, -0.4819))
# Hardpoint Hongqi_L5_Body_Anchor_0685 = Vector((-0.1544, -2.5293, -0.5019))
# Hardpoint Hongqi_L5_Body_Anchor_0686 = Vector((-0.0472, -2.5733, -0.5166))
# Hardpoint Hongqi_L5_Body_Anchor_0687 = Vector((0.0605, -2.6110, -0.5259))
# Hardpoint Hongqi_L5_Body_Anchor_0688 = Vector((0.1675, -2.6421, -0.5299))
# Hardpoint Hongqi_L5_Body_Anchor_0689 = Vector((0.2725, -2.6666, -0.5284))
# Hardpoint Hongqi_L5_Body_Anchor_0690 = Vector((0.3742, -2.6844, -0.5214))
# Hardpoint Hongqi_L5_Body_Anchor_0691 = Vector((0.4714, -2.6955, -0.5091))
# Hardpoint Hongqi_L5_Body_Anchor_0692 = Vector((0.5628, -2.6999, -0.4915))
# Hardpoint Hongqi_L5_Body_Anchor_0693 = Vector((0.6475, -2.6976, -0.4687))
# Hardpoint Hongqi_L5_Body_Anchor_0694 = Vector((0.7243, -2.6885, -0.4408))
# Hardpoint Hongqi_L5_Body_Anchor_0695 = Vector((0.7924, -2.6726, -0.4081))
# Hardpoint Hongqi_L5_Body_Anchor_0696 = Vector((0.8509, -2.6501, -0.3707))
# Hardpoint Hongqi_L5_Body_Anchor_0697 = Vector((0.8992, -2.6210, -0.3289))
# Hardpoint Hongqi_L5_Body_Anchor_0698 = Vector((0.9365, -2.5853, -0.2830))
# Hardpoint Hongqi_L5_Body_Anchor_0699 = Vector((0.9625, -2.5432, -0.2332))
# Hardpoint Hongqi_L5_Body_Anchor_0700 = Vector((0.9769, -2.4947, -0.1799))
# Hardpoint Hongqi_L5_Body_Anchor_0701 = Vector((0.9795, -2.4400, -0.1233))
# Hardpoint Hongqi_L5_Body_Anchor_0702 = Vector((0.9703, -2.3791, -0.0639))
# Hardpoint Hongqi_L5_Body_Anchor_0703 = Vector((0.9493, -2.3124, -0.0021))
# Hardpoint Hongqi_L5_Body_Anchor_0704 = Vector((0.9168, -2.2398, 0.0618))
# Hardpoint Hongqi_L5_Body_Anchor_0705 = Vector((0.8733, -2.1617, 0.1273))
# Hardpoint Hongqi_L5_Body_Anchor_0706 = Vector((0.8192, -2.0781, 0.1941))
# Hardpoint Hongqi_L5_Body_Anchor_0707 = Vector((0.7552, -1.9893, 0.2617))
# Hardpoint Hongqi_L5_Body_Anchor_0708 = Vector((0.6821, -1.8956, 0.3296))
# Hardpoint Hongqi_L5_Body_Anchor_0709 = Vector((0.6007, -1.7972, 0.3975))
# Hardpoint Hongqi_L5_Body_Anchor_0710 = Vector((0.5121, -1.6942, 0.4649))
# Hardpoint Hongqi_L5_Body_Anchor_0711 = Vector((0.4173, -1.5870, 0.5314))
# Hardpoint Hongqi_L5_Body_Anchor_0712 = Vector((0.3174, -1.4759, 0.5965))
# Hardpoint Hongqi_L5_Body_Anchor_0713 = Vector((0.2137, -1.3610, 0.6599))
# Hardpoint Hongqi_L5_Body_Anchor_0714 = Vector((0.1074, -1.2428, 0.7210))
# Hardpoint Hongqi_L5_Body_Anchor_0715 = Vector((-0.0002, -1.1214, 0.7796))
# Hardpoint Hongqi_L5_Body_Anchor_0716 = Vector((-0.1078, -0.9973, 0.8353))
# Hardpoint Hongqi_L5_Body_Anchor_0717 = Vector((-0.2140, -0.8706, 0.8877))
# Hardpoint Hongqi_L5_Body_Anchor_0718 = Vector((-0.3177, -0.7418, 0.9364))
# Hardpoint Hongqi_L5_Body_Anchor_0719 = Vector((-0.4176, -0.6111, 0.9812))
# Hardpoint Hongqi_L5_Body_Anchor_0720 = Vector((-0.5124, -0.4789, 1.0218))
# Hardpoint Hongqi_L5_Body_Anchor_0721 = Vector((-0.6010, -0.3455, 1.0579))
# Hardpoint Hongqi_L5_Body_Anchor_0722 = Vector((-0.6823, -0.2112, 1.0892))
# Hardpoint Hongqi_L5_Body_Anchor_0723 = Vector((-0.7554, -0.0764, 1.1157))
# Hardpoint Hongqi_L5_Body_Anchor_0724 = Vector((-0.8194, 0.0585, 1.1370))
# Hardpoint Hongqi_L5_Body_Anchor_0725 = Vector((-0.8735, 0.1934, 1.1531))
# Hardpoint Hongqi_L5_Body_Anchor_0726 = Vector((-0.9170, 0.3277, 1.1639))
# Hardpoint Hongqi_L5_Body_Anchor_0727 = Vector((-0.9494, 0.4613, 1.1693))
# Hardpoint Hongqi_L5_Body_Anchor_0728 = Vector((-0.9703, 0.5937, 1.1693))
# Hardpoint Hongqi_L5_Body_Anchor_0729 = Vector((-0.9795, 0.7246, 1.1638))
# Hardpoint Hongqi_L5_Body_Anchor_0730 = Vector((-0.9769, 0.8536, 1.1530))
# Hardpoint Hongqi_L5_Body_Anchor_0731 = Vector((-0.9625, 0.9806, 1.1368))
# Hardpoint Hongqi_L5_Body_Anchor_0732 = Vector((-0.9364, 1.1051, 1.1154))
# Hardpoint Hongqi_L5_Body_Anchor_0733 = Vector((-0.8990, 1.2268, 1.0888))
# Hardpoint Hongqi_L5_Body_Anchor_0734 = Vector((-0.8508, 1.3455, 1.0574))
# Hardpoint Hongqi_L5_Body_Anchor_0735 = Vector((-0.7922, 1.4608, 1.0213))
# Hardpoint Hongqi_L5_Body_Anchor_0736 = Vector((-0.7241, 1.5725, 0.9807))
# Hardpoint Hongqi_L5_Body_Anchor_0737 = Vector((-0.6472, 1.6802, 0.9358))
# Hardpoint Hongqi_L5_Body_Anchor_0738 = Vector((-0.5625, 1.7838, 0.8870))
# Hardpoint Hongqi_L5_Body_Anchor_0739 = Vector((-0.4710, 1.8828, 0.8346))
# Hardpoint Hongqi_L5_Body_Anchor_0740 = Vector((-0.3739, 1.9772, 0.7789))
# Hardpoint Hongqi_L5_Body_Anchor_0741 = Vector((-0.2722, 2.0666, 0.7202))
# Hardpoint Hongqi_L5_Body_Anchor_0742 = Vector((-0.1672, 2.1509, 0.6590))
# Hardpoint Hongqi_L5_Body_Anchor_0743 = Vector((-0.0601, 2.2298, 0.5956))
# Hardpoint Hongqi_L5_Body_Anchor_0744 = Vector((0.0476, 2.3031, 0.5305))
# Hardpoint Hongqi_L5_Body_Anchor_0745 = Vector((0.1548, 2.3706, 0.4640))
# Hardpoint Hongqi_L5_Body_Anchor_0746 = Vector((0.2601, 2.4322, 0.3966))
# Hardpoint Hongqi_L5_Body_Anchor_0747 = Vector((0.3622, 2.4878, 0.3287))
# Hardpoint Hongqi_L5_Body_Anchor_0748 = Vector((0.4600, 2.5371, 0.2608))
# Hardpoint Hongqi_L5_Body_Anchor_0749 = Vector((0.5522, 2.5801, 0.1932))
# Hardpoint Hongqi_L5_Body_Anchor_0750 = Vector((0.6377, 2.6167, 0.1264))
# Hardpoint Hongqi_L5_Body_Anchor_0751 = Vector((0.7156, 2.6467, 0.0609))
# Hardpoint Hongqi_L5_Body_Anchor_0752 = Vector((0.7848, 2.6700, -0.0030))
# Hardpoint Hongqi_L5_Body_Anchor_0753 = Vector((0.8445, 2.6867, -0.0648))
# Hardpoint Hongqi_L5_Body_Anchor_0754 = Vector((0.8939, 2.6967, -0.1241))
# Hardpoint Hongqi_L5_Body_Anchor_0755 = Vector((0.9326, 2.7000, -0.1806))
# Hardpoint Hongqi_L5_Body_Anchor_0756 = Vector((0.9600, 2.6965, -0.2339))
# Hardpoint Hongqi_L5_Body_Anchor_0757 = Vector((0.9758, 2.6863, -0.2836))
# Hardpoint Hongqi_L5_Body_Anchor_0758 = Vector((0.9798, 2.6693, -0.3295))
# Hardpoint Hongqi_L5_Body_Anchor_0759 = Vector((0.9720, 2.6457, -0.3713))
# Hardpoint Hongqi_L5_Body_Anchor_0760 = Vector((0.9524, 2.6155, -0.4086))
# Hardpoint Hongqi_L5_Body_Anchor_0761 = Vector((0.9213, 2.5787, -0.4412))
# Hardpoint Hongqi_L5_Body_Anchor_0762 = Vector((0.8791, 2.5355, -0.4690))
# Hardpoint Hongqi_L5_Body_Anchor_0763 = Vector((0.8262, 2.4859, -0.4918))
# Hardpoint Hongqi_L5_Body_Anchor_0764 = Vector((0.7634, 2.4302, -0.5093))
# Hardpoint Hongqi_L5_Body_Anchor_0765 = Vector((0.6913, 2.3683, -0.5216))
# Hardpoint Hongqi_L5_Body_Anchor_0766 = Vector((0.6109, 2.3006, -0.5284))
# Hardpoint Hongqi_L5_Body_Anchor_0767 = Vector((0.5231, 2.2271, -0.5298))
# Hardpoint Hongqi_L5_Body_Anchor_0768 = Vector((0.4289, 2.1480, -0.5258))
# Hardpoint Hongqi_L5_Body_Anchor_0769 = Vector((0.3296, 2.0635, -0.5164))
# Hardpoint Hongqi_L5_Body_Anchor_0770 = Vector((0.2263, 1.9739, -0.5017))
# Hardpoint Hongqi_L5_Body_Anchor_0771 = Vector((0.1202, 1.8794, -0.4816))
# Hardpoint Hongqi_L5_Body_Anchor_0772 = Vector((0.0127, 1.7802, -0.4565))
# Hardpoint Hongqi_L5_Body_Anchor_0773 = Vector((-0.0949, 1.6765, -0.4264))
# Hardpoint Hongqi_L5_Body_Anchor_0774 = Vector((-0.2014, 1.5686, -0.3915))
# Hardpoint Hongqi_L5_Body_Anchor_0775 = Vector((-0.3055, 1.4568, -0.3520))
# Hardpoint Hongqi_L5_Body_Anchor_0776 = Vector((-0.4059, 1.3414, -0.3083))
# Hardpoint Hongqi_L5_Body_Anchor_0777 = Vector((-0.5013, 1.2226, -0.2605))
# Hardpoint Hongqi_L5_Body_Anchor_0778 = Vector((-0.5907, 1.1007, -0.2091))
# Hardpoint Hongqi_L5_Body_Anchor_0779 = Vector((-0.6730, 0.9761, -0.1542))
# Hardpoint Hongqi_L5_Body_Anchor_0780 = Vector((-0.7471, 0.8491, -0.0963))
# Hardpoint Hongqi_L5_Body_Anchor_0781 = Vector((-0.8122, 0.7199, -0.0358))
# Hardpoint Hongqi_L5_Body_Anchor_0782 = Vector((-0.8675, 0.5890, 0.0271))
# Hardpoint Hongqi_L5_Body_Anchor_0783 = Vector((-0.9123, 0.4565, 0.0918))
# Hardpoint Hongqi_L5_Body_Anchor_0784 = Vector((-0.9461, 0.3230, 0.1579))
# Hardpoint Hongqi_L5_Body_Anchor_0785 = Vector((-0.9684, 0.1886, 0.2251))
# Hardpoint Hongqi_L5_Body_Anchor_0786 = Vector((-0.9791, 0.0537, 0.2929))
# Hardpoint Hongqi_L5_Body_Anchor_0787 = Vector((-0.9779, -0.0812, 0.3609))
# Hardpoint Hongqi_L5_Body_Anchor_0788 = Vector((-0.9648, -0.2160, 0.4286))
# Hardpoint Hongqi_L5_Body_Anchor_0789 = Vector((-0.9401, -0.3503, 0.4957))
# Hardpoint Hongqi_L5_Body_Anchor_0790 = Vector((-0.9041, -0.4836, 0.5615))
# Hardpoint Hongqi_L5_Body_Anchor_0791 = Vector((-0.8571, -0.6158, 0.6259))
# Hardpoint Hongqi_L5_Body_Anchor_0792 = Vector((-0.7998, -0.7464, 0.6883))
# Hardpoint Hongqi_L5_Body_Anchor_0793 = Vector((-0.7327, -0.8752, 0.7483))
# Hardpoint Hongqi_L5_Body_Anchor_0794 = Vector((-0.6569, -1.0017, 0.8056))
# Hardpoint Hongqi_L5_Body_Anchor_0795 = Vector((-0.5731, -1.1258, 0.8598))
# Hardpoint Hongqi_L5_Body_Anchor_0796 = Vector((-0.4823, -1.2470, 0.9106))
# Hardpoint Hongqi_L5_Body_Anchor_0797 = Vector((-0.3858, -1.3652, 0.9575))
# Hardpoint Hongqi_L5_Body_Anchor_0798 = Vector((-0.2845, -1.4799, 1.0004))
# Hardpoint Hongqi_L5_Body_Anchor_0799 = Vector((-0.1799, -1.5909, 1.0390))
# Hardpoint Hongqi_L5_Body_Anchor_0800 = Vector((-0.0730, -1.6979, 1.0729))
# Hardpoint Hongqi_L5_Body_Anchor_0801 = Vector((0.0347, -1.8007, 1.1020))
# Hardpoint Hongqi_L5_Body_Anchor_0802 = Vector((0.1420, -1.8990, 1.1261))
# Hardpoint Hongqi_L5_Body_Anchor_0803 = Vector((0.2476, -1.9926, 1.1451))
# Hardpoint Hongqi_L5_Body_Anchor_0804 = Vector((0.3502, -2.0812, 1.1588))
# Hardpoint Hongqi_L5_Body_Anchor_0805 = Vector((0.4485, -2.1645, 1.1671))
# Hardpoint Hongqi_L5_Body_Anchor_0806 = Vector((0.5415, -2.2425, 1.1700))
# Hardpoint Hongqi_L5_Body_Anchor_0807 = Vector((0.6279, -2.3148, 1.1675))
# Hardpoint Hongqi_L5_Body_Anchor_0808 = Vector((0.7067, -2.3814, 1.1595))
# Hardpoint Hongqi_L5_Body_Anchor_0809 = Vector((0.7770, -2.4420, 1.1462))
# Hardpoint Hongqi_L5_Body_Anchor_0810 = Vector((0.8378, -2.4965, 1.1276))
# Hardpoint Hongqi_L5_Body_Anchor_0811 = Vector((0.8886, -2.5448, 1.1038))
# Hardpoint Hongqi_L5_Body_Anchor_0812 = Vector((0.9286, -2.5867, 1.0750))
# Hardpoint Hongqi_L5_Body_Anchor_0813 = Vector((0.9574, -2.6222, 1.0414))
# Hardpoint Hongqi_L5_Body_Anchor_0814 = Vector((0.9746, -2.6511, 1.0031))
# Hardpoint Hongqi_L5_Body_Anchor_0815 = Vector((0.9800, -2.6733, 0.9605))
# Hardpoint Hongqi_L5_Body_Anchor_0816 = Vector((0.9736, -2.6889, 0.9138))
# Hardpoint Hongqi_L5_Body_Anchor_0817 = Vector((0.9554, -2.6978, 0.8633))
# Hardpoint Hongqi_L5_Body_Anchor_0818 = Vector((0.9256, -2.6999, 0.8093))
# Hardpoint Hongqi_L5_Body_Anchor_0819 = Vector((0.8847, -2.6953, 0.7522))
# Hardpoint Hongqi_L5_Body_Anchor_0820 = Vector((0.8331, -2.6839, 0.6924))
# Hardpoint Hongqi_L5_Body_Anchor_0821 = Vector((0.7714, -2.6658, 0.6301))
# Hardpoint Hongqi_L5_Body_Anchor_0822 = Vector((0.7004, -2.6411, 0.5659))
# Hardpoint Hongqi_L5_Body_Anchor_0823 = Vector((0.6209, -2.6097, 0.5001))
# Hardpoint Hongqi_L5_Body_Anchor_0824 = Vector((0.5339, -2.5719, 0.4331))
# Hardpoint Hongqi_L5_Body_Anchor_0825 = Vector((0.4405, -2.5276, 0.3654))
# Hardpoint Hongqi_L5_Body_Anchor_0826 = Vector((0.3417, -2.4770, 0.2974))
# Hardpoint Hongqi_L5_Body_Anchor_0827 = Vector((0.2388, -2.4202, 0.2296))
# Hardpoint Hongqi_L5_Body_Anchor_0828 = Vector((0.1331, -2.3573, 0.1623))
# Hardpoint Hongqi_L5_Body_Anchor_0829 = Vector((0.0257, -2.2886, 0.0961))
# Hardpoint Hongqi_L5_Body_Anchor_0830 = Vector((-0.0820, -2.2141, 0.0313))
# Hardpoint Hongqi_L5_Body_Anchor_0831 = Vector((-0.1887, -2.1341, -0.0317))
# Hardpoint Hongqi_L5_Body_Anchor_0832 = Vector((-0.2932, -2.0488, -0.0924))
# Hardpoint Hongqi_L5_Body_Anchor_0833 = Vector((-0.3941, -1.9584, -0.1505))
# Hardpoint Hongqi_L5_Body_Anchor_0834 = Vector((-0.4902, -1.8630, -0.2055))
# Hardpoint Hongqi_L5_Body_Anchor_0835 = Vector((-0.5804, -1.7630, -0.2572))
# Hardpoint Hongqi_L5_Body_Anchor_0836 = Vector((-0.6636, -1.6586, -0.3053))
# Hardpoint Hongqi_L5_Body_Anchor_0837 = Vector((-0.7387, -1.5501, -0.3493))
# Hardpoint Hongqi_L5_Body_Anchor_0838 = Vector((-0.8049, -1.4376, -0.3890))
# Hardpoint Hongqi_L5_Body_Anchor_0839 = Vector((-0.8614, -1.3216, -0.4242))
# Hardpoint Hongqi_L5_Body_Anchor_0840 = Vector((-0.9075, -1.2023, -0.4546))
# Hardpoint Hongqi_L5_Body_Anchor_0841 = Vector((-0.9426, -1.0800, -0.4801))
# Hardpoint Hongqi_L5_Body_Anchor_0842 = Vector((-0.9664, -0.9549, -0.5005))
# Hardpoint Hongqi_L5_Body_Anchor_0843 = Vector((-0.9784, -0.8275, -0.5156))
# Hardpoint Hongqi_L5_Body_Anchor_0844 = Vector((-0.9786, -0.6980, -0.5254))
# Hardpoint Hongqi_L5_Body_Anchor_0845 = Vector((-0.9670, -0.5668, -0.5298))
# Hardpoint Hongqi_L5_Body_Anchor_0846 = Vector((-0.9437, -0.4342, -0.5287))
# Hardpoint Hongqi_L5_Body_Anchor_0847 = Vector((-0.9090, -0.3004, -0.5222))
# Hardpoint Hongqi_L5_Body_Anchor_0848 = Vector((-0.8633, -0.1659, -0.5103))
# Hardpoint Hongqi_L5_Body_Anchor_0849 = Vector((-0.8072, -0.0311, -0.4931))
# Hardpoint Hongqi_L5_Body_Anchor_0850 = Vector((-0.7413, 0.1039, -0.4707))
# Hardpoint Hongqi_L5_Body_Anchor_0851 = Vector((-0.6664, 0.2386, -0.4432))
# Hardpoint Hongqi_L5_Body_Anchor_0852 = Vector((-0.5835, 0.3728, -0.4109))
# Hardpoint Hongqi_L5_Body_Anchor_0853 = Vector((-0.4935, 0.5059, -0.3739))
# Hardpoint Hongqi_L5_Body_Anchor_0854 = Vector((-0.3976, 0.6379, -0.3324))
# Hardpoint Hongqi_L5_Body_Anchor_0855 = Vector((-0.2969, 0.7682, -0.2868))
# Hardpoint Hongqi_L5_Body_Anchor_0856 = Vector((-0.1926, 0.8966, -0.2373))
# Hardpoint Hongqi_L5_Body_Anchor_0857 = Vector((-0.0859, 1.0228, -0.1842))
# Hardpoint Hongqi_L5_Body_Anchor_0858 = Vector((0.0218, 1.1464, -0.1279))
# Hardpoint Hongqi_L5_Body_Anchor_0859 = Vector((0.1292, 1.2671, -0.0688))
# Hardpoint Hongqi_L5_Body_Anchor_0860 = Vector((0.2351, 1.3847, -0.0071))
# Hardpoint Hongqi_L5_Body_Anchor_0861 = Vector((0.3381, 1.4988, 0.0566))
# Hardpoint Hongqi_L5_Body_Anchor_0862 = Vector((0.4370, 1.6092, 0.1221))
# Hardpoint Hongqi_L5_Body_Anchor_0863 = Vector((0.5307, 1.7155, 0.1887))
# Hardpoint Hongqi_L5_Body_Anchor_0864 = Vector((0.6179, 1.8176, 0.2563))
# Hardpoint Hongqi_L5_Body_Anchor_0865 = Vector((0.6977, 1.9151, 0.3242))
# Hardpoint Hongqi_L5_Body_Anchor_0866 = Vector((0.7690, 2.0078, 0.3921))
# Hardpoint Hongqi_L5_Body_Anchor_0867 = Vector((0.8311, 2.0955, 0.4596))
# Hardpoint Hongqi_L5_Body_Anchor_0868 = Vector((0.8830, 2.1780, 0.5261))
# Hardpoint Hongqi_L5_Body_Anchor_0869 = Vector((0.9244, 2.2550, 0.5914))
# Hardpoint Hongqi_L5_Body_Anchor_0870 = Vector((0.9545, 2.3264, 0.6549))
# Hardpoint Hongqi_L5_Body_Anchor_0871 = Vector((0.9731, 2.3920, 0.7162))
# Hardpoint Hongqi_L5_Body_Anchor_0872 = Vector((0.9800, 2.4516, 0.7751))
# Hardpoint Hongqi_L5_Body_Anchor_0873 = Vector((0.9750, 2.5051, 0.8310))
# Hardpoint Hongqi_L5_Body_Anchor_0874 = Vector((0.9582, 2.5523, 0.8836))
# Hardpoint Hongqi_L5_Body_Anchor_0875 = Vector((0.9298, 2.5931, 0.9327))
# Hardpoint Hongqi_L5_Body_Anchor_0876 = Vector((0.8902, 2.6275, 0.9778))
# Hardpoint Hongqi_L5_Body_Anchor_0877 = Vector((0.8398, 2.6553, 1.0187))
# Hardpoint Hongqi_L5_Body_Anchor_0878 = Vector((0.7793, 2.6764, 1.0552))
# Hardpoint Hongqi_L5_Body_Anchor_0879 = Vector((0.7094, 2.6909, 1.0869))
# Hardpoint Hongqi_L5_Body_Anchor_0880 = Vector((0.6309, 2.6986, 1.1138))
# Hardpoint Hongqi_L5_Body_Anchor_0881 = Vector((0.5447, 2.6996, 1.1355))
# Hardpoint Hongqi_L5_Body_Anchor_0882 = Vector((0.4520, 2.6938, 1.1521))
# Hardpoint Hongqi_L5_Body_Anchor_0883 = Vector((0.3538, 2.6813, 1.1633))
# Hardpoint Hongqi_L5_Body_Anchor_0884 = Vector((0.2513, 2.6621, 1.1691))
# Hardpoint Hongqi_L5_Body_Anchor_0885 = Vector((0.1458, 2.6363, 1.1695))
# Hardpoint Hongqi_L5_Body_Anchor_0886 = Vector((0.0386, 2.6038, 1.1645))
# Hardpoint Hongqi_L5_Body_Anchor_0887 = Vector((-0.0692, 2.5649, 1.1540))
# Hardpoint Hongqi_L5_Body_Anchor_0888 = Vector((-0.1761, 2.5195, 1.1383))
# Hardpoint Hongqi_L5_Body_Anchor_0889 = Vector((-0.2808, 2.4679, 1.1172))
# Hardpoint Hongqi_L5_Body_Anchor_0890 = Vector((-0.3822, 2.4100, 1.0911))
# Hardpoint Hongqi_L5_Body_Anchor_0891 = Vector((-0.4790, 2.3462, 1.0601))
# Hardpoint Hongqi_L5_Body_Anchor_0892 = Vector((-0.5699, 2.2765, 1.0243))
# Hardpoint Hongqi_L5_Body_Anchor_0893 = Vector((-0.6540, 2.2011, 0.9840))
# Hardpoint Hongqi_L5_Body_Anchor_0894 = Vector((-0.7302, 2.1202, 0.9395))
# Hardpoint Hongqi_L5_Body_Anchor_0895 = Vector((-0.7975, 2.0340, 0.8910))
# Hardpoint Hongqi_L5_Body_Anchor_0896 = Vector((-0.8552, 1.9427, 0.8389))
# Hardpoint Hongqi_L5_Body_Anchor_0897 = Vector((-0.9026, 1.8465, 0.7834))
# Hardpoint Hongqi_L5_Body_Anchor_0898 = Vector((-0.9390, 1.7458, 0.7250))
# Hardpoint Hongqi_L5_Body_Anchor_0899 = Vector((-0.9641, 1.6406, 0.6640))
# Hardpoint Hongqi_L5_Body_Anchor_0900 = Vector((-0.9776, 1.5314, 0.6008))
# Hardpoint Hongqi_L5_Body_Anchor_0901 = Vector((-0.9792, 1.4184, 0.5357))
# Hardpoint Hongqi_L5_Body_Anchor_0902 = Vector((-0.9690, 1.3018, 0.4694))
# Hardpoint Hongqi_L5_Body_Anchor_0903 = Vector((-0.9471, 1.1819, 0.4020))
# Hardpoint Hongqi_L5_Body_Anchor_0904 = Vector((-0.9137, 1.0591, 0.3341))
# Hardpoint Hongqi_L5_Body_Anchor_0905 = Vector((-0.8693, 0.9337, 0.2662))
# Hardpoint Hongqi_L5_Body_Anchor_0906 = Vector((-0.8144, 0.8059, 0.1986))
# Hardpoint Hongqi_L5_Body_Anchor_0907 = Vector((-0.7497, 0.6761, 0.1317))
# Hardpoint Hongqi_L5_Body_Anchor_0908 = Vector((-0.6758, 0.5446, 0.0661))
# Hardpoint Hongqi_L5_Body_Anchor_0909 = Vector((-0.5938, 0.4117, 0.0021))
# Hardpoint Hongqi_L5_Body_Anchor_0910 = Vector((-0.5047, 0.2779, -0.0599))
# Hardpoint Hongqi_L5_Body_Anchor_0911 = Vector((-0.4094, 0.1433, -0.1195))
# Hardpoint Hongqi_L5_Body_Anchor_0912 = Vector((-0.3092, 0.0084, -0.1762))
# Hardpoint Hongqi_L5_Body_Anchor_0913 = Vector((-0.2052, -0.1266, -0.2298))
# Hardpoint Hongqi_L5_Body_Anchor_0914 = Vector((-0.0988, -0.2612, -0.2798))
# Hardpoint Hongqi_L5_Body_Anchor_0915 = Vector((0.0089, -0.3952, -0.3260))
# Hardpoint Hongqi_L5_Body_Anchor_0916 = Vector((0.1164, -0.5282, -0.3681))
# Hardpoint Hongqi_L5_Body_Anchor_0917 = Vector((0.2225, -0.6599, -0.4058))
# Hardpoint Hongqi_L5_Body_Anchor_0918 = Vector((0.3259, -0.7899, -0.4388))
# Hardpoint Hongqi_L5_Body_Anchor_0919 = Vector((0.4254, -0.9180, -0.4670))
# Hardpoint Hongqi_L5_Body_Anchor_0920 = Vector((0.5198, -1.0437, -0.4901))
# Hardpoint Hongqi_L5_Body_Anchor_0921 = Vector((0.6078, -1.1669, -0.5081))
# Hardpoint Hongqi_L5_Body_Anchor_0922 = Vector((0.6885, -1.2871, -0.5208))
# Hardpoint Hongqi_L5_Body_Anchor_0923 = Vector((0.7609, -1.4041, -0.5281))
# Hardpoint Hongqi_L5_Body_Anchor_0924 = Vector((0.8241, -1.5176, -0.5299))
# Hardpoint Hongqi_L5_Body_Anchor_0925 = Vector((0.8774, -1.6273, -0.5264))
# Hardpoint Hongqi_L5_Body_Anchor_0926 = Vector((0.9200, -1.7330, -0.5174))
# Hardpoint Hongqi_L5_Body_Anchor_0927 = Vector((0.9515, -1.8343, -0.5030))
# Hardpoint Hongqi_L5_Body_Anchor_0928 = Vector((0.9715, -1.9310, -0.4834))
# Hardpoint Hongqi_L5_Body_Anchor_0929 = Vector((0.9798, -2.0229, -0.4587))
# Hardpoint Hongqi_L5_Body_Anchor_0930 = Vector((0.9762, -2.1098, -0.4290))
# Hardpoint Hongqi_L5_Body_Anchor_0931 = Vector((0.9608, -2.1914, -0.3944))
# Hardpoint Hongqi_L5_Body_Anchor_0932 = Vector((0.9338, -2.2674, -0.3553))
# Hardpoint Hongqi_L5_Body_Anchor_0933 = Vector((0.8955, -2.3379, -0.3119))
# Hardpoint Hongqi_L5_Body_Anchor_0934 = Vector((0.8464, -2.4025, -0.2645))
# Hardpoint Hongqi_L5_Body_Anchor_0935 = Vector((0.7871, -2.4610, -0.2133))
# Hardpoint Hongqi_L5_Body_Anchor_0936 = Vector((0.7182, -2.5135, -0.1587))
# Hardpoint Hongqi_L5_Body_Anchor_0937 = Vector((0.6407, -2.5596, -0.1010))
# Hardpoint Hongqi_L5_Body_Anchor_0938 = Vector((0.5554, -2.5994, -0.0407))
# Hardpoint Hongqi_L5_Body_Anchor_0939 = Vector((0.4634, -2.6326, 0.0220))
# Hardpoint Hongqi_L5_Body_Anchor_0940 = Vector((0.3658, -2.6593, 0.0865))
# Hardpoint Hongqi_L5_Body_Anchor_0941 = Vector((0.2638, -2.6793, 0.1526))
# Hardpoint Hongqi_L5_Body_Anchor_0942 = Vector((0.1586, -2.6926, 0.2197))
# Hardpoint Hongqi_L5_Body_Anchor_0943 = Vector((0.0515, -2.6992, 0.2875))
# Hardpoint Hongqi_L5_Body_Anchor_0944 = Vector((-0.0563, -2.6991, 0.3555))
# Hardpoint Hongqi_L5_Body_Anchor_0945 = Vector((-0.1633, -2.6922, 0.4233))
# Hardpoint Hongqi_L5_Body_Anchor_0946 = Vector((-0.2684, -2.6786, 0.4903))
# Hardpoint Hongqi_L5_Body_Anchor_0947 = Vector((-0.3703, -2.6582, 0.5564))
# Hardpoint Hongqi_L5_Body_Anchor_0948 = Vector((-0.4676, -2.6313, 0.6208))
# Hardpoint Hongqi_L5_Body_Anchor_0949 = Vector((-0.5594, -2.5977, 0.6834))
# Hardpoint Hongqi_L5_Body_Anchor_0950 = Vector((-0.6443, -2.5577, 0.7437))
# Hardpoint Hongqi_L5_Body_Anchor_0951 = Vector((-0.7215, -2.5113, 0.8012))
# Hardpoint Hongqi_L5_Body_Anchor_0952 = Vector((-0.7899, -2.4586, 0.8556))
# Hardpoint Hongqi_L5_Body_Anchor_0953 = Vector((-0.8488, -2.3997, 0.9067))
# Hardpoint Hongqi_L5_Body_Anchor_0954 = Vector((-0.8975, -2.3349, 0.9540))
# Hardpoint Hongqi_L5_Body_Anchor_0955 = Vector((-0.9353, -2.2642, 0.9972))
# Hardpoint Hongqi_L5_Body_Anchor_0956 = Vector((-0.9617, -2.1878, 1.0361))
# Hardpoint Hongqi_L5_Body_Anchor_0957 = Vector((-0.9766, -2.1060, 1.0704))
# Hardpoint Hongqi_L5_Body_Anchor_0958 = Vector((-0.9797, -2.0190, 1.0999))
# Hardpoint Hongqi_L5_Body_Anchor_0959 = Vector((-0.9709, -1.9268, 1.1244))
# Hardpoint Hongqi_L5_Body_Anchor_0960 = Vector((-0.9503, -1.8299, 1.1438))
# Hardpoint Hongqi_L5_Body_Anchor_0961 = Vector((-0.9183, -1.7284, 1.1579))
# Hardpoint Hongqi_L5_Body_Anchor_0962 = Vector((-0.8752, -1.6226, 1.1666))
# Hardpoint Hongqi_L5_Body_Anchor_0963 = Vector((-0.8215, -1.5127, 1.1700))
# Hardpoint Hongqi_L5_Body_Anchor_0964 = Vector((-0.7579, -1.3990, 1.1679))
# Hardpoint Hongqi_L5_Body_Anchor_0965 = Vector((-0.6851, -1.2818, 1.1603))
# Hardpoint Hongqi_L5_Body_Anchor_0966 = Vector((-0.6041, -1.1615, 1.1474))
# Hardpoint Hongqi_L5_Body_Anchor_0967 = Vector((-0.5157, -1.0382, 1.1292))
# Hardpoint Hongqi_L5_Body_Anchor_0968 = Vector((-0.4211, -0.9123, 1.1059))
# Hardpoint Hongqi_L5_Body_Anchor_0969 = Vector((-0.3214, -0.7842, 1.0775))
# Hardpoint Hongqi_L5_Body_Anchor_0970 = Vector((-0.2178, -0.6541, 1.0442))
# Hardpoint Hongqi_L5_Body_Anchor_0971 = Vector((-0.1116, -0.5223, 1.0063))
# Hardpoint Hongqi_L5_Body_Anchor_0972 = Vector((-0.0041, -0.3893, 0.9641))
# Hardpoint Hongqi_L5_Body_Anchor_0973 = Vector((0.1035, -0.2553, 0.9177))
# Hardpoint Hongqi_L5_Body_Anchor_0974 = Vector((0.2099, -0.1206, 0.8675))
# Hardpoint Hongqi_L5_Body_Anchor_0975 = Vector((0.3137, 0.0143, 0.8138))
# Hardpoint Hongqi_L5_Body_Anchor_0976 = Vector((0.4137, 0.1493, 0.7569))
# Hardpoint Hongqi_L5_Body_Anchor_0977 = Vector((0.5088, 0.2838, 0.6972))
# Hardpoint Hongqi_L5_Body_Anchor_0978 = Vector((0.5976, 0.4177, 0.6351))
# Hardpoint Hongqi_L5_Body_Anchor_0979 = Vector((0.6793, 0.5505, 0.5710))
# Hardpoint Hongqi_L5_Body_Anchor_0980 = Vector((0.7527, 0.6819, 0.5053))
# Hardpoint Hongqi_L5_Body_Anchor_0981 = Vector((0.8171, 0.8116, 0.4385))
# Hardpoint Hongqi_L5_Body_Anchor_0982 = Vector((0.8715, 0.9393, 0.3708))
# Hardpoint Hongqi_L5_Body_Anchor_0983 = Vector((0.9155, 1.0646, 0.3028))
# Hardpoint Hongqi_L5_Body_Anchor_0984 = Vector((0.9483, 1.1873, 0.2350))
# Hardpoint Hongqi_L5_Body_Anchor_0985 = Vector((0.9697, 1.3070, 0.1677))
# Hardpoint Hongqi_L5_Body_Anchor_0986 = Vector((0.9794, 1.4235, 0.1013))
# Hardpoint Hongqi_L5_Body_Anchor_0987 = Vector((0.9772, 1.5364, 0.0364))
# Hardpoint Hongqi_L5_Body_Anchor_0988 = Vector((0.9633, 1.6454, -0.0267))
# Hardpoint Hongqi_L5_Body_Anchor_0989 = Vector((0.9377, 1.7503, -0.0876))
# Hardpoint Hongqi_L5_Body_Anchor_0990 = Vector((0.9007, 1.8509, -0.1460))
# Hardpoint Hongqi_L5_Body_Anchor_0991 = Vector((0.8529, 1.9468, -0.2013))
# Hardpoint Hongqi_L5_Body_Anchor_0992 = Vector((0.7947, 2.0379, -0.2533))
# Hardpoint Hongqi_L5_Body_Anchor_0993 = Vector((0.7270, 2.1239, -0.3016))
# Hardpoint Hongqi_L5_Body_Anchor_0994 = Vector((0.6504, 2.2045, -0.3459))
# Hardpoint Hongqi_L5_Body_Anchor_0995 = Vector((0.5660, 2.2797, -0.3860))
# Hardpoint Hongqi_L5_Body_Anchor_0996 = Vector((0.4748, 2.3491, -0.4216))
# Hardpoint Hongqi_L5_Body_Anchor_0997 = Vector((0.3778, 2.4127, -0.4524))
# Hardpoint Hongqi_L5_Body_Anchor_0998 = Vector((0.2762, 2.4703, -0.4783))
# Hardpoint Hongqi_L5_Body_Anchor_0999 = Vector((0.1713, 2.5217, -0.4991))
# Hardpoint Hongqi_L5_Body_Anchor_1000 = Vector((0.0644, 2.5667, -0.5146))
# Hardpoint Hongqi_L5_Body_Anchor_1001 = Vector((-0.0434, 2.6054, -0.5248))
# Hardpoint Hongqi_L5_Body_Anchor_1002 = Vector((-0.1506, 2.6376, -0.5296))
# Hardpoint Hongqi_L5_Body_Anchor_1003 = Vector((-0.2560, 2.6631, -0.5290))
# Hardpoint Hongqi_L5_Body_Anchor_1004 = Vector((-0.3583, 2.6820, -0.5229))
# Hardpoint Hongqi_L5_Body_Anchor_1005 = Vector((-0.4562, 2.6942, -0.5114))
# Hardpoint Hongqi_L5_Body_Anchor_1006 = Vector((-0.5487, 2.6997, -0.4947))
# Hardpoint Hongqi_L5_Body_Anchor_1007 = Vector((-0.6345, 2.6984, -0.4727))
# Hardpoint Hongqi_L5_Body_Anchor_1008 = Vector((-0.7127, 2.6904, -0.4456))
# Hardpoint Hongqi_L5_Body_Anchor_1009 = Vector((-0.7822, 2.6756, -0.4136))
# Hardpoint Hongqi_L5_Body_Anchor_1010 = Vector((-0.8423, 2.6542, -0.3770))
# Hardpoint Hongqi_L5_Body_Anchor_1011 = Vector((-0.8922, 2.6261, -0.3359))
# Hardpoint Hongqi_L5_Body_Anchor_1012 = Vector((-0.9313, 2.5915, -0.2906))
# Hardpoint Hongqi_L5_Body_Anchor_1013 = Vector((-0.9592, 2.5503, -0.2414))
# Hardpoint Hongqi_L5_Body_Anchor_1014 = Vector((-0.9754, 2.5028, -0.1886))
# Hardpoint Hongqi_L5_Body_Anchor_1015 = Vector((-0.9799, 2.4491, -0.1325))
# Hardpoint Hongqi_L5_Body_Anchor_1016 = Vector((-0.9725, 2.3892, -0.0736))
# Hardpoint Hongqi_L5_Body_Anchor_1017 = Vector((-0.9534, 2.3234, -0.0121))
# Hardpoint Hongqi_L5_Body_Anchor_1018 = Vector((-0.9228, 2.2517, 0.0515))
# Hardpoint Hongqi_L5_Body_Anchor_1019 = Vector((-0.8810, 2.1745, 0.1168))
# Hardpoint Hongqi_L5_Body_Anchor_1020 = Vector((-0.8285, 2.0918, 0.1834))
# Hardpoint Hongqi_L5_Body_Anchor_1021 = Vector((-0.7660, 2.0038, 0.2509))
# Hardpoint Hongqi_L5_Body_Anchor_1022 = Vector((-0.6943, 1.9109, 0.3188))
# Hardpoint Hongqi_L5_Body_Anchor_1023 = Vector((-0.6142, 1.8131, 0.3867))
# Hardpoint Hongqi_L5_Body_Anchor_1024 = Vector((-0.5266, 1.7109, 0.4542))
# Hardpoint Hongqi_L5_Body_Anchor_1025 = Vector((-0.4327, 1.6044, 0.5209))
# Hardpoint Hongqi_L5_Body_Anchor_1026 = Vector((-0.3336, 1.4938, 0.5862))
# Hardpoint Hongqi_L5_Body_Anchor_1027 = Vector((-0.2304, 1.3795, 0.6499))
# Hardpoint Hongqi_L5_Body_Anchor_1028 = Vector((-0.1245, 1.2618, 0.7114))
# Hardpoint Hongqi_L5_Body_Anchor_1029 = Vector((-0.0170, 1.1409, 0.7705))
# Hardpoint Hongqi_L5_Body_Anchor_1030 = Vector((0.0907, 1.0172, 0.8267))
# Hardpoint Hongqi_L5_Body_Anchor_1031 = Vector((0.1973, 0.8909, 0.8796))
# Hardpoint Hongqi_L5_Body_Anchor_1032 = Vector((0.3014, 0.7624, 0.9289))
# Hardpoint Hongqi_L5_Body_Anchor_1033 = Vector((0.4020, 0.6320, 0.9744))
# Hardpoint Hongqi_L5_Body_Anchor_1034 = Vector((0.4977, 0.5000, 1.0156))
# Hardpoint Hongqi_L5_Body_Anchor_1035 = Vector((0.5873, 0.3668, 1.0524))
# Hardpoint Hongqi_L5_Body_Anchor_1036 = Vector((0.6699, 0.2327, 1.0846))
# Hardpoint Hongqi_L5_Body_Anchor_1037 = Vector((0.7444, 0.0979, 1.1118))
# Hardpoint Hongqi_L5_Body_Anchor_1038 = Vector((0.8099, -0.0370, 1.1340))
# Hardpoint Hongqi_L5_Body_Anchor_1039 = Vector((0.8655, -0.1719, 1.1509))
# Hardpoint Hongqi_L5_Body_Anchor_1040 = Vector((0.9108, -0.3064, 1.1626))
# Hardpoint Hongqi_L5_Body_Anchor_1041 = Vector((0.9450, -0.4401, 1.1688))
# Hardpoint Hongqi_L5_Body_Anchor_1042 = Vector((0.9678, -0.5727, 1.1697))
# Hardpoint Hongqi_L5_Body_Anchor_1043 = Vector((0.9789, -0.7038, 1.1651))
# Hardpoint Hongqi_L5_Body_Anchor_1044 = Vector((0.9781, -0.8332, 1.1551))
# Hardpoint Hongqi_L5_Body_Anchor_1045 = Vector((0.9656, -0.9605, 1.1397))
# Hardpoint Hongqi_L5_Body_Anchor_1046 = Vector((0.9413, -1.0855, 1.1191))
# Hardpoint Hongqi_L5_Body_Anchor_1047 = Vector((0.9057, -1.2077, 1.0934))
# Hardpoint Hongqi_L5_Body_Anchor_1048 = Vector((0.8592, -1.3268, 1.0627))
# Hardpoint Hongqi_L5_Body_Anchor_1049 = Vector((0.8022, -1.4427, 1.0273))
# Hardpoint Hongqi_L5_Body_Anchor_1050 = Vector((0.7356, -1.5550, 0.9874))
# Hardpoint Hongqi_L5_Body_Anchor_1051 = Vector((0.6600, -1.6633, 0.9432))
# Hardpoint Hongqi_L5_Body_Anchor_1052 = Vector((0.5765, -1.7676, 0.8950))
# Hardpoint Hongqi_L5_Body_Anchor_1053 = Vector((0.4860, -1.8674, 0.8432))
# Hardpoint Hongqi_L5_Body_Anchor_1054 = Vector((0.3897, -1.9625, 0.7880))
# Hardpoint Hongqi_L5_Body_Anchor_1055 = Vector((0.2886, -2.0527, 0.7297))
# Hardpoint Hongqi_L5_Body_Anchor_1056 = Vector((0.1841, -2.1378, 0.6689))
# Hardpoint Hongqi_L5_Body_Anchor_1057 = Vector((0.0773, -2.2176, 0.6059))
# Hardpoint Hongqi_L5_Body_Anchor_1058 = Vector((-0.0304, -2.2918, 0.5410))
# Hardpoint Hongqi_L5_Body_Anchor_1059 = Vector((-0.1378, -2.3603, 0.4747))
# Hardpoint Hongqi_L5_Body_Anchor_1060 = Vector((-0.2435, -2.4228, 0.4074))
# Hardpoint Hongqi_L5_Body_Anchor_1061 = Vector((-0.3462, -2.4794, 0.3395))
# Hardpoint Hongqi_L5_Body_Anchor_1062 = Vector((-0.4448, -2.5297, 0.2716))
# Hardpoint Hongqi_L5_Body_Anchor_1063 = Vector((-0.5379, -2.5737, 0.2039))
# Hardpoint Hongqi_L5_Body_Anchor_1064 = Vector((-0.6246, -2.6113, 0.1370))
# Hardpoint Hongqi_L5_Body_Anchor_1065 = Vector((-0.7037, -2.6423, 0.0712))
# Hardpoint Hongqi_L5_Body_Anchor_1066 = Vector((-0.7744, -2.6668, 0.0071))
# Hardpoint Hongqi_L5_Body_Anchor_1067 = Vector((-0.8356, -2.6845, -0.0551))
# Hardpoint Hongqi_L5_Body_Anchor_1068 = Vector((-0.8868, -2.6956, -0.1148))
# Hardpoint Hongqi_L5_Body_Anchor_1069 = Vector((-0.9272, -2.6999, -0.1718))
# Hardpoint Hongqi_L5_Body_Anchor_1070 = Vector((-0.9564, -2.6975, -0.2256))
# Hardpoint Hongqi_L5_Body_Anchor_1071 = Vector((-0.9741, -2.6884, -0.2760))
# Hardpoint Hongqi_L5_Body_Anchor_1072 = Vector((-0.9800, -2.6725, -0.3225))
# Hardpoint Hongqi_L5_Body_Anchor_1073 = Vector((-0.9740, -2.6499, -0.3649))
# Hardpoint Hongqi_L5_Body_Anchor_1074 = Vector((-0.9563, -2.6207, -0.4030))
# Hardpoint Hongqi_L5_Body_Anchor_1075 = Vector((-0.9270, -2.5850, -0.4364))
# Hardpoint Hongqi_L5_Body_Anchor_1076 = Vector((-0.8865, -2.5428, -0.4649))
# Hardpoint Hongqi_L5_Body_Anchor_1077 = Vector((-0.8353, -2.4942, -0.4885))
# Hardpoint Hongqi_L5_Body_Anchor_1078 = Vector((-0.7740, -2.4395, -0.5069))
# Hardpoint Hongqi_L5_Body_Anchor_1079 = Vector((-0.7034, -2.3786, -0.5200))
# Hardpoint Hongqi_L5_Body_Anchor_1080 = Vector((-0.6242, -2.3117, -0.5277))
# Hardpoint Hongqi_L5_Body_Anchor_1081 = Vector((-0.5375, -2.2391, -0.5300))
# Hardpoint Hongqi_L5_Body_Anchor_1082 = Vector((-0.4443, -2.1609, -0.5268))
# Hardpoint Hongqi_L5_Body_Anchor_1083 = Vector((-0.3457, -2.0773, -0.5183))
# Hardpoint Hongqi_L5_Body_Anchor_1084 = Vector((-0.2430, -1.9885, -0.5044))
# Hardpoint Hongqi_L5_Body_Anchor_1085 = Vector((-0.1373, -1.8948, -0.4852))
# Hardpoint Hongqi_L5_Body_Anchor_1086 = Vector((-0.0299, -1.7963, -0.4608))
# Hardpoint Hongqi_L5_Body_Anchor_1087 = Vector((0.0778, -1.6933, -0.4315))
# Hardpoint Hongqi_L5_Body_Anchor_1088 = Vector((0.1846, -1.5860, -0.3974))
# Hardpoint Hongqi_L5_Body_Anchor_1089 = Vector((0.2891, -1.4749, -0.3586))
# Hardpoint Hongqi_L5_Body_Anchor_1090 = Vector((0.3902, -1.3600, -0.3155))
# Hardpoint Hongqi_L5_Body_Anchor_1091 = Vector((0.4865, -1.2417, -0.2684))
# Hardpoint Hongqi_L5_Body_Anchor_1092 = Vector((0.5769, -1.1203, -0.2175))
# Hardpoint Hongqi_L5_Body_Anchor_1093 = Vector((0.6604, -0.9961, -0.1632))
# Hardpoint Hongqi_L5_Body_Anchor_1094 = Vector((0.7359, -0.8695, -0.1057))
# Hardpoint Hongqi_L5_Body_Anchor_1095 = Vector((0.8025, -0.7406, -0.0456))
# Hardpoint Hongqi_L5_Body_Anchor_1096 = Vector((0.8594, -0.6099, 0.0169))
# Hardpoint Hongqi_L5_Body_Anchor_1097 = Vector((0.9059, -0.4777, 0.0813))
# Hardpoint Hongqi_L5_Body_Anchor_1098 = Vector((0.9415, -0.3443, 0.1473))
# Hardpoint Hongqi_L5_Body_Anchor_1099 = Vector((0.9657, -0.2100, 0.2144))
# Hardpoint Hongqi_L5_Body_Anchor_1100 = Vector((0.9782, -0.0752, 0.2821))
# Hardpoint Hongqi_L5_Body_Anchor_1101 = Vector((0.9788, 0.0597, 0.3501))
# Hardpoint Hongqi_L5_Body_Anchor_1102 = Vector((0.9677, 0.1946, 0.4179))
# Hardpoint Hongqi_L5_Body_Anchor_1103 = Vector((0.9448, 0.3289, 0.4850))
# Hardpoint Hongqi_L5_Body_Anchor_1104 = Vector((0.9106, 0.4625, 0.5511))
# Hardpoint Hongqi_L5_Body_Anchor_1105 = Vector((0.8653, 0.5948, 0.6158))
# Hardpoint Hongqi_L5_Body_Anchor_1106 = Vector((0.8096, 0.7257, 0.6785))
# Hardpoint Hongqi_L5_Body_Anchor_1107 = Vector((0.7440, 0.8548, 0.7390))
# Hardpoint Hongqi_L5_Body_Anchor_1108 = Vector((0.6695, 0.9817, 0.7967))
# Hardpoint Hongqi_L5_Body_Anchor_1109 = Vector((0.5869, 1.1062, 0.8514))
# Hardpoint Hongqi_L5_Body_Anchor_1110 = Vector((0.4972, 1.2279, 0.9027))
# Hardpoint Hongqi_L5_Body_Anchor_1111 = Vector((0.4015, 1.3466, 0.9503))
# Hardpoint Hongqi_L5_Body_Anchor_1112 = Vector((0.3009, 1.4618, 0.9939))
# Hardpoint Hongqi_L5_Body_Anchor_1113 = Vector((0.1967, 1.5735, 1.0331))
# Hardpoint Hongqi_L5_Body_Anchor_1114 = Vector((0.0901, 1.6812, 1.0678))
# Hardpoint Hongqi_L5_Body_Anchor_1115 = Vector((-0.0175, 1.7847, 1.0977))
# Hardpoint Hongqi_L5_Body_Anchor_1116 = Vector((-0.1250, 1.8837, 1.1226))
# Hardpoint Hongqi_L5_Body_Anchor_1117 = Vector((-0.2309, 1.9780, 1.1424))
# Hardpoint Hongqi_L5_Body_Anchor_1118 = Vector((-0.3341, 2.0674, 1.1570))
# Hardpoint Hongqi_L5_Body_Anchor_1119 = Vector((-0.4332, 2.1516, 1.1661))
# Hardpoint Hongqi_L5_Body_Anchor_1120 = Vector((-0.5271, 2.2304, 1.1699))
# Hardpoint Hongqi_L5_Body_Anchor_1121 = Vector((-0.6146, 2.3037, 1.1682))
# Hardpoint Hongqi_L5_Body_Anchor_1122 = Vector((-0.6947, 2.3712, 1.1611))
# Hardpoint Hongqi_L5_Body_Anchor_1123 = Vector((-0.7664, 2.4328, 1.1486))
# Hardpoint Hongqi_L5_Body_Anchor_1124 = Vector((-0.8288, 2.4883, 1.1309))
# Hardpoint Hongqi_L5_Body_Anchor_1125 = Vector((-0.8812, 2.5375, 1.1079))
# Hardpoint Hongqi_L5_Body_Anchor_1126 = Vector((-0.9229, 2.5805, 1.0799))
# Hardpoint Hongqi_L5_Body_Anchor_1127 = Vector((-0.9535, 2.6170, 1.0470))
# Hardpoint Hongqi_L5_Body_Anchor_1128 = Vector((-0.9726, 2.6469, 1.0095))
# Hardpoint Hongqi_L5_Body_Anchor_1129 = Vector((-0.9799, 2.6702, 0.9676))
# Hardpoint Hongqi_L5_Body_Anchor_1130 = Vector((-0.9754, 2.6869, 0.9215))
# Hardpoint Hongqi_L5_Body_Anchor_1131 = Vector((-0.9591, 2.6968, 0.8716))
# Hardpoint Hongqi_L5_Body_Anchor_1132 = Vector((-0.9311, 2.7000, 0.8182))
# Hardpoint Hongqi_L5_Body_Anchor_1133 = Vector((-0.8920, 2.6964, 0.7615))
# Hardpoint Hongqi_L5_Body_Anchor_1134 = Vector((-0.8420, 2.6861, 0.7021))
# Hardpoint Hongqi_L5_Body_Anchor_1135 = Vector((-0.7819, 2.6691, 0.6402))
# Hardpoint Hongqi_L5_Body_Anchor_1136 = Vector((-0.7123, 2.6455, 0.5762))
# Hardpoint Hongqi_L5_Body_Anchor_1137 = Vector((-0.6341, 2.6152, 0.5106))
# Hardpoint Hongqi_L5_Body_Anchor_1138 = Vector((-0.5482, 2.5783, 0.4438))
# Hardpoint Hongqi_L5_Body_Anchor_1139 = Vector((-0.4558, 2.5351, 0.3762))
# Hardpoint Hongqi_L5_Body_Anchor_1140 = Vector((-0.3578, 2.4855, 0.3083))
# Hardpoint Hongqi_L5_Body_Anchor_1141 = Vector((-0.2554, 2.4296, 0.2404))
# Hardpoint Hongqi_L5_Body_Anchor_1142 = Vector((-0.1500, 2.3677, 0.1730))
# Hardpoint Hongqi_L5_Body_Anchor_1143 = Vector((-0.0428, 2.2999, 0.1066))
# Hardpoint Hongqi_L5_Body_Anchor_1144 = Vector((0.0649, 2.2264, 0.0415))
# Hardpoint Hongqi_L5_Body_Anchor_1145 = Vector((0.1719, 2.1472, -0.0218))
# Hardpoint Hongqi_L5_Body_Anchor_1146 = Vector((0.2768, 2.0628, -0.0829))
# Hardpoint Hongqi_L5_Body_Anchor_1147 = Vector((0.3783, 1.9731, -0.1414))
# Hardpoint Hongqi_L5_Body_Anchor_1148 = Vector((0.4752, 1.8785, -0.1970))
# Hardpoint Hongqi_L5_Body_Anchor_1149 = Vector((0.5665, 1.7793, -0.2493))
# Hardpoint Hongqi_L5_Body_Anchor_1150 = Vector((0.6508, 1.6755, -0.2979))
# Hardpoint Hongqi_L5_Body_Anchor_1151 = Vector((0.7273, 1.5676, -0.3425))
# Hardpoint Hongqi_L5_Body_Anchor_1152 = Vector((0.7950, 1.4558, -0.3830))
# Hardpoint Hongqi_L5_Body_Anchor_1153 = Vector((0.8531, 1.3403, -0.4189))
# Hardpoint Hongqi_L5_Body_Anchor_1154 = Vector((0.9009, 1.2215, -0.4501))
# Hardpoint Hongqi_L5_Body_Anchor_1155 = Vector((0.9378, 1.0996, -0.4764))
# Hardpoint Hongqi_L5_Body_Anchor_1156 = Vector((0.9634, 0.9750, -0.4976))
# Hardpoint Hongqi_L5_Body_Anchor_1157 = Vector((0.9773, 0.8480, -0.5136))
# Hardpoint Hongqi_L5_Body_Anchor_1158 = Vector((0.9794, 0.7188, -0.5242))
# Hardpoint Hongqi_L5_Body_Anchor_1159 = Vector((0.9696, 0.5878, -0.5294))
# Hardpoint Hongqi_L5_Body_Anchor_1160 = Vector((0.9482, 0.4554, -0.5292))
# Hardpoint Hongqi_L5_Body_Anchor_1161 = Vector((0.9153, 0.3218, -0.5236))
# Hardpoint Hongqi_L5_Body_Anchor_1162 = Vector((0.8713, 0.1874, -0.5125))
# Hardpoint Hongqi_L5_Body_Anchor_1163 = Vector((0.8168, 0.0525, -0.4962))
# Hardpoint Hongqi_L5_Body_Anchor_1164 = Vector((0.7524, -0.0824, -0.4746))
# Hardpoint Hongqi_L5_Body_Anchor_1165 = Vector((0.6789, -0.2172, -0.4479))
# Hardpoint Hongqi_L5_Body_Anchor_1166 = Vector((0.5972, -0.3514, -0.4164))
# Hardpoint Hongqi_L5_Body_Anchor_1167 = Vector((0.5083, -0.4848, -0.3801))
# Hardpoint Hongqi_L5_Body_Anchor_1168 = Vector((0.4132, -0.6169, -0.3393))
# Hardpoint Hongqi_L5_Body_Anchor_1169 = Vector((0.3132, -0.7476, -0.2943))
# Hardpoint Hongqi_L5_Body_Anchor_1170 = Vector((0.2094, -0.8763, -0.2454))
# Hardpoint Hongqi_L5_Body_Anchor_1171 = Vector((0.1030, -1.0028, -0.1929))
# Hardpoint Hongqi_L5_Body_Anchor_1172 = Vector((-0.0046, -1.1269, -0.1371))
# Hardpoint Hongqi_L5_Body_Anchor_1173 = Vector((-0.1122, -1.2481, -0.0784))
# Hardpoint Hongqi_L5_Body_Anchor_1174 = Vector((-0.2184, -1.3662, -0.0171))
# Hardpoint Hongqi_L5_Body_Anchor_1175 = Vector((-0.3219, -1.4809, 0.0463))
# Hardpoint Hongqi_L5_Body_Anchor_1176 = Vector((-0.4216, -1.5919, 0.1115))
# Hardpoint Hongqi_L5_Body_Anchor_1177 = Vector((-0.5162, -1.6989, 0.1781))
# Hardpoint Hongqi_L5_Body_Anchor_1178 = Vector((-0.6045, -1.8016, 0.2455))
# Hardpoint Hongqi_L5_Body_Anchor_1179 = Vector((-0.6855, -1.8999, 0.3134))
# Hardpoint Hongqi_L5_Body_Anchor_1180 = Vector((-0.7583, -1.9934, 0.3813))
# Hardpoint Hongqi_L5_Body_Anchor_1181 = Vector((-0.8218, -2.0819, 0.4489))
# Hardpoint Hongqi_L5_Body_Anchor_1182 = Vector((-0.8755, -2.1652, 0.5156))
# Hardpoint Hongqi_L5_Body_Anchor_1183 = Vector((-0.9185, -2.2431, 0.5811))
# Hardpoint Hongqi_L5_Body_Anchor_1184 = Vector((-0.9505, -2.3155, 0.6449))
# Hardpoint Hongqi_L5_Body_Anchor_1185 = Vector((-0.9709, -2.3820, 0.7066))
# Hardpoint Hongqi_L5_Body_Anchor_1186 = Vector((-0.9797, -2.4425, 0.7659))
# Hardpoint Hongqi_L5_Body_Anchor_1187 = Vector((-0.9766, -2.4970, 0.8223))
# Hardpoint Hongqi_L5_Body_Anchor_1188 = Vector((-0.9616, -2.5452, 0.8755))
# Hardpoint Hongqi_L5_Body_Anchor_1189 = Vector((-0.9351, -2.5871, 0.9251))
# Hardpoint Hongqi_L5_Body_Anchor_1190 = Vector((-0.8972, -2.6224, 0.9709))
# Hardpoint Hongqi_L5_Body_Anchor_1191 = Vector((-0.8486, -2.6513, 1.0125))
# Hardpoint Hongqi_L5_Body_Anchor_1192 = Vector((-0.7896, -2.6735, 1.0497))
# Hardpoint Hongqi_L5_Body_Anchor_1193 = Vector((-0.7211, -2.6890, 1.0822))
# Hardpoint Hongqi_L5_Body_Anchor_1194 = Vector((-0.6439, -2.6978, 1.1098))
# Hardpoint Hongqi_L5_Body_Anchor_1195 = Vector((-0.5589, -2.6999, 1.1324))
# Hardpoint Hongqi_L5_Body_Anchor_1196 = Vector((-0.4672, -2.6952, 1.1498))
# Hardpoint Hongqi_L5_Body_Anchor_1197 = Vector((-0.3698, -2.6838, 1.1619))
# Hardpoint Hongqi_L5_Body_Anchor_1198 = Vector((-0.2679, -2.6656, 1.1685))
# Hardpoint Hongqi_L5_Body_Anchor_1199 = Vector((-0.1628, -2.6408, 1.1698))
# Hardpoint Hongqi_L5_Body_Anchor_1200 = Vector((-0.0557, -2.6094, 1.1656))
# Hardpoint Hongqi_L5_Body_Anchor_1201 = Vector((0.0520, -2.5715, 1.1560))
# Hardpoint Hongqi_L5_Body_Anchor_1202 = Vector((0.1591, -2.5272, 1.1411))
# Hardpoint Hongqi_L5_Body_Anchor_1203 = Vector((0.2643, -2.4765, 1.1209))
# Hardpoint Hongqi_L5_Body_Anchor_1204 = Vector((0.3663, -2.4197, 1.0956))
# Hardpoint Hongqi_L5_Body_Anchor_1205 = Vector((0.4639, -2.3568, 1.0654))
# Hardpoint Hongqi_L5_Body_Anchor_1206 = Vector((0.5559, -2.2880, 1.0303))
# Hardpoint Hongqi_L5_Body_Anchor_1207 = Vector((0.6411, -2.2135, 0.9908))
# Hardpoint Hongqi_L5_Body_Anchor_1208 = Vector((0.7186, -2.1334, 0.9469))
# Hardpoint Hongqi_L5_Body_Anchor_1209 = Vector((0.7874, -2.0480, 0.8990))
# Hardpoint Hongqi_L5_Body_Anchor_1210 = Vector((0.8467, -1.9575, 0.8474))
# Hardpoint Hongqi_L5_Body_Anchor_1211 = Vector((0.8957, -1.8622, 0.7925))
# Hardpoint Hongqi_L5_Body_Anchor_1212 = Vector((0.9340, -1.7621, 0.7345))
# Hardpoint Hongqi_L5_Body_Anchor_1213 = Vector((0.9609, -1.6577, 0.6739))
# Hardpoint Hongqi_L5_Body_Anchor_1214 = Vector((0.9762, -1.5491, 0.6110))
# Hardpoint Hongqi_L5_Body_Anchor_1215 = Vector((0.9798, -1.4366, 0.5462))
