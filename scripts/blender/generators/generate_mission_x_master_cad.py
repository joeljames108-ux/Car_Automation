"""
================================================================================
MASTER CLASS-A CAD GENERATOR: PORSCHE MISSION X CONCEPT (SUPERCAR FUTURE)
================================================================================
Procedural CAD generator for the Porsche Mission X electric hypercar concept.
Fulfills all 7 Production Quality Gates:
  - Gate 1: File Size >= 15 MB
  - Gate 2: Polygons >= 600,000 (Target 750k - 900k)
  - Gate 3: Hierarchy (7/7 Subsystems: Body, Glass, Wheels, Lighting, Aero, Jewelry, Underbody)
  - Gate 4: Hitboxes (10 HITBOX_* nodes with Mat_Invisible_Hitbox)
  - Gate 5: NLA Actions (Pre-baked keyframed interactive animations)
  - Gate 6: Metadata (interactive, sound_fx, haptic)
  - Gate 7: PBR Materials (Rocket Metallic, Carbon Fiber, Bronze Gold Wheels)
================================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler


def get_pbr_material(name, props, blend_method='OPAQUE'):
    """Creates or updates a high-fidelity Principled BSDF PBR material."""
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    if blend_method != 'OPAQUE':
        mat.blend_method = blend_method
    if hasattr(mat, 'shadow_method'):
        mat.shadow_method = 'NONE' if blend_method == 'BLEND' else 'OPAQUE'

    def set_s(target_names, val):
        for tn in target_names:
            if tn in bsdf.inputs:
                bsdf.inputs[tn].default_value = val
                return

    if 'color' in props: set_s(['Base Color'], props['color'])
    if 'metallic' in props: set_s(['Metallic'], props['metallic'])
    if 'roughness' in props: set_s(['Roughness'], props['roughness'])
    if 'clearcoat' in props: set_s(['Coat Weight', 'Clearcoat'], props['clearcoat'])
    if 'clearcoat_roughness' in props: set_s(['Coat Roughness', 'Clearcoat Roughness'], props['clearcoat_roughness'])
    if 'transmission' in props: set_s(['Transmission Weight', 'Transmission'], props['transmission'])
    if 'ior' in props: set_s(['IOR'], props['ior'])
    if 'alpha' in props: set_s(['Alpha'], props['alpha'])
    if 'emission' in props: set_s(['Emission Color', 'Emission'], props['emission'])
    if 'emission_strength' in props: set_s(['Emission Strength'], props['emission_strength'])

    return mat


def setup_materials():
    m = {}
    # Porsche Rocket Metallic Paint (Warm Bronze-Brown with Deep Clearcoat)
    m['rocket_metallic'] = get_pbr_material('Mat_Porsche_RocketMetallic', {
        'color': (0.42, 0.30, 0.18, 1.0),
        'metallic': 0.72,
        'roughness': 0.12,
        'clearcoat': 1.0,
        'clearcoat_roughness': 0.015
    })
    # Glass Dome Canopy (Ultra-Clear Dielectric)
    m['glass_dome'] = get_pbr_material('Mat_Glass_Dome', {
        'color': (0.012, 0.018, 0.025, 1.0),
        'transmission': 0.94,
        'ior': 1.52,
        'roughness': 0.015,
        'clearcoat': 1.0,
        'alpha': 0.55
    }, blend_method='BLEND')
    # Carbon Fiber Reinforced Plastic (CFRP) Exoskeleton + Aero
    m['carbon_fiber'] = get_pbr_material('Mat_CFRP_Carbon', {
        'color': (0.032, 0.032, 0.038, 1.0),
        'metallic': 0.40,
        'roughness': 0.20,
        'clearcoat': 1.0,
        'clearcoat_roughness': 0.035
    })
    # Bronze-Gold Alloy Wheel Face (Relief-Milled)
    m['bronze_gold_wheel'] = get_pbr_material('Mat_BronzeGold_Alloy', {
        'color': (0.68, 0.52, 0.28, 1.0),
        'metallic': 0.92,
        'roughness': 0.14,
        'clearcoat': 0.7
    })
    # Translucent Turbine Aeroblade (Rear Wheels)
    m['aeroblade_clear'] = get_pbr_material('Mat_Aeroblade_Clear', {
        'color': (0.65, 0.50, 0.26, 0.4),
        'transmission': 0.72,
        'ior': 1.48,
        'roughness': 0.08,
        'alpha': 0.40
    }, blend_method='BLEND')
    # Michelin Pilot Sport Cup 2R Tire Rubber
    m['tire_rubber'] = get_pbr_material('Mat_Tire_Rubber', {
        'color': (0.028, 0.028, 0.030, 1.0),
        'metallic': 0.0,
        'roughness': 0.86
    })
    # Carbon-Ceramic Rotor (PCCB)
    m['ccm_rotor'] = get_pbr_material('Mat_PCCB_Rotor', {
        'color': (0.30, 0.31, 0.33, 1.0),
        'metallic': 0.80,
        'roughness': 0.30
    })
    # Porsche Acid Green Caliper (Hybrid Signature)
    m['acid_green_caliper'] = get_pbr_material('Mat_Porsche_AcidGreen', {
        'color': (0.55, 0.88, 0.05, 1.0),
        'metallic': 0.18,
        'roughness': 0.16,
        'clearcoat': 1.0,
        'clearcoat_roughness': 0.02
    })
    # Vertical 4-Point LED Headlights (Pure White)
    m['led_4point'] = get_pbr_material('Mat_LED_4Point', {
        'color': (0.96, 0.98, 1.0, 1.0),
        'emission': (0.96, 0.98, 1.0, 1.0),
        'emission_strength': 9.0,
        'roughness': 0.04
    })
    # Full-Width Rear Lightbar (Red Brake)
    m['rear_lightbar'] = get_pbr_material('Mat_Rear_Lightbar', {
        'color': (0.92, 0.02, 0.04, 1.0),
        'emission': (0.92, 0.02, 0.04, 1.0),
        'emission_strength': 6.5,
        'roughness': 0.08
    })
    # Illuminated PORSCHE Lettering
    m['porsche_text'] = get_pbr_material('Mat_PORSCHE_Text', {
        'color': (0.96, 0.96, 0.98, 1.0),
        'emission': (0.96, 0.96, 0.98, 1.0),
        'emission_strength': 4.0,
        'roughness': 0.12
    })
    # Satin Black Camera Stalks, Grilles & Trim
    m['trim_black'] = get_pbr_material('Mat_Trim_SatinBlack', {
        'color': (0.035, 0.035, 0.040, 1.0),
        'metallic': 0.22,
        'roughness': 0.60
    })
    # Dark Interior Gloss (Visible through dome)
    m['dark_gloss'] = get_pbr_material('Mat_Dark_Gloss', {
        'color': (0.06, 0.06, 0.07, 1.0),
        'metallic': 0.35,
        'roughness': 0.25,
        'clearcoat': 0.8
    })
    # Headlamp Housing Dark Surround
    m['headlamp_housing'] = get_pbr_material('Mat_Headlamp_Housing', {
        'color': (0.025, 0.025, 0.03, 1.0),
        'metallic': 0.50,
        'roughness': 0.35
    })
    # Clear Polycarbonate Headlamp Lens
    m['polycarbonate'] = get_pbr_material('Mat_Light_Polycarbonate', {
        'color': (0.95, 0.97, 0.99, 1.0),
        'transmission': 0.95,
        'ior': 1.54,
        'roughness': 0.01,
        'clearcoat': 1.0,
        'alpha': 0.30
    }, blend_method='BLEND')
    # Porsche Center Cap
    m['center_cap'] = get_pbr_material('Mat_Porsche_CenterCap', {
        'color': (0.55, 0.42, 0.22, 1.0),
        'metallic': 0.88,
        'roughness': 0.12,
        'clearcoat': 0.8
    })
    # Invisible Hitbox
    m['hitbox'] = get_pbr_material('Mat_Invisible_Hitbox', {
        'color': (1.0, 1.0, 1.0, 0.0),
        'alpha': 0.0,
        'roughness': 1.0
    }, blend_method='BLEND')
    # CFRP Exoskeleton Bars (Slightly lighter carbon)
    m['exo_bars'] = get_pbr_material('Mat_CFRP_Exoskeleton', {
        'color': (0.055, 0.055, 0.060, 1.0),
        'metallic': 0.45,
        'roughness': 0.18,
        'clearcoat': 1.0,
        'clearcoat_roughness': 0.03
    })

    return m


# ─── 1. Mission X Sculpted Body Shell ─────────────────────────────────────
def build_mission_x_body(mats):
    """
    Constructs the Porsche Mission X Class-A body shell:
    Dimensions: Length 4.500m (half 2.250m), Width 2.000m (half 1.000m), Height <1.200m.
    Wheelbase 2.730m: Front axle at Y=+1.365m, Rear axle at Y=-1.365m.
    28 continuous station rings capturing:
    - Aggressive wedge nose with wide central cooling intake
    - Pronounced front fender haunches with integrated headlamp volumes
    - Ultra-low glass dome canopy transition
    - Muscular rear haunches over staggered 21" rear wheels
    - Clean flowing surfaces without decorative styling
    """
    bm = bmesh.new()

    # (Y, hw_bot, hw_wai, hw_sho, hw_roo, z_bot, z_wai, z_sho, z_roo, is_cowl)
    stations = [
        # Front Tip Nose (+Y)
        ( 2.250,  0.28, 0.36, 0.30, 0.14, 0.12, 0.18, 0.22, 0.24, False),
        # Front Apron / Wide Central Intake Mouth
        ( 2.16,   0.58, 0.70, 0.62, 0.30, 0.12, 0.22, 0.30, 0.32, False),
        # Front Splitter Leading Edge
        ( 2.04,   0.74, 0.85, 0.76, 0.42, 0.12, 0.28, 0.38, 0.41, False),
        # Headlamp Volume Station (Vertical 4-Point)
        ( 1.86,   0.82, 0.92, 0.84, 0.52, 0.13, 0.36, 0.48, 0.52, False),
        # Hood Peak / Fender Crest
        ( 1.66,   0.86, 0.96, 0.88, 0.58, 0.14, 0.44, 0.56, 0.60, False),
        # Front Wheel Arch Front Rise
        ( 1.50,   0.88, 0.98, 0.90, 0.60, 0.46, 0.56, 0.62, 0.64, False),
        # Front Axle Centerline (Y=+1.365m)
        ( 1.365,  0.89, 0.99, 0.91, 0.61, 0.60, 0.63, 0.66, 0.66, False),
        # Front Arch Rear Fall
        ( 1.22,   0.88, 0.98, 0.90, 0.62, 0.46, 0.56, 0.64, 0.68, False),
        # Cowl / Windshield Base
        ( 0.98,   0.86, 0.96, 0.86, 0.62, 0.14, 0.52, 0.64, 0.72, True),
        # Glass Dome Leading Edge / A-Pillar Base
        ( 0.72,   0.84, 0.94, 0.82, 0.56, 0.14, 0.54, 0.68, 0.88, False),
        # Dome Peak Forward
        ( 0.42,   0.82, 0.92, 0.78, 0.52, 0.14, 0.56, 0.72, 1.08, False),
        # Dome Roof Zenith (Maximum Height ~1.196m)
        ( 0.10,   0.80, 0.90, 0.76, 0.50, 0.14, 0.58, 0.74, 1.196, False),
        # Dome Rear Transition
        (-0.20,   0.81, 0.91, 0.78, 0.48, 0.14, 0.60, 0.76, 1.18, False),
        # B-Pillar / Dome Trailing Edge
        (-0.50,   0.84, 0.94, 0.82, 0.46, 0.14, 0.62, 0.78, 1.06, False),
        # Rear Engine Cover Leading Edge
        (-0.78,   0.86, 0.96, 0.86, 0.44, 0.14, 0.66, 0.82, 0.96, False),
        # Side Intake Channel Deepest Point
        (-1.00,   0.88, 0.98, 0.90, 0.42, 0.14, 0.72, 0.86, 0.90, False),
        # Rear Wheel Arch Entry
        (-1.20,   0.92, 1.000, 0.94, 0.40, 0.15, 0.80, 0.90, 0.88, False),
        # Rear Arch Front Rise
        (-1.28,   0.93, 1.000, 0.95, 0.39, 0.48, 0.83, 0.92, 0.87, False),
        # Rear Axle Centerline (Y=-1.365m)
        (-1.365,  0.94, 1.000, 0.96, 0.38, 0.62, 0.86, 0.94, 0.86, False),
        # Rear Arch Peak (Muscular Haunch)
        (-1.46,   0.93, 1.000, 0.95, 0.37, 0.48, 0.82, 0.92, 0.84, False),
        # Rear Decklid / Active Wing Position
        (-1.68,   0.90, 0.97, 0.90, 0.34, 0.16, 0.74, 0.86, 0.80, False),
        # Rear Diffuser Transition
        (-1.90,   0.85, 0.92, 0.84, 0.30, 0.20, 0.64, 0.78, 0.76, False),
        # Full-Width Lightbar Station
        (-2.08,   0.80, 0.87, 0.78, 0.26, 0.24, 0.55, 0.72, 0.74, False),
        # Rear Fascia / Diffuser Exit
        (-2.18,   0.76, 0.82, 0.74, 0.22, 0.28, 0.48, 0.66, 0.72, False),
        # Rear Tail Edge (-Y)
        (-2.250,  0.70, 0.76, 0.68, 0.18, 0.32, 0.44, 0.62, 0.70, False),
    ]

    rings = []
    for (y, h_bot, h_wai, h_sho, h_roo, z_bot, z_wai, z_sho, z_roo, is_cowl) in stations:
        co_list = [
            (-h_bot, y, z_bot),
            (-h_bot * 1.04, y, (z_bot + z_wai) * 0.47),
            (-h_wai, y, z_wai),
            (-h_sho, y, z_sho),
            (-h_roo, y, z_roo * 0.97),
            (-h_roo * 0.42, y, z_roo),
            (0.0, y, z_roo * 1.005),
            (h_roo * 0.42, y, z_roo),
            (h_roo, y, z_roo * 0.97),
            (h_sho, y, z_sho),
            (h_wai, y, z_wai),
            (h_bot * 1.04, y, (z_bot + z_wai) * 0.47),
            (h_bot, y, z_bot),
            (h_bot * 0.48, y, z_bot - 0.012),
            (-h_bot * 0.48, y, z_bot - 0.012),
        ]
        ring_v = [bm.verts.new(p) for p in co_list]
        rings.append(ring_v)

    # Bridge station rings
    for i in range(len(rings) - 1):
        r1, r2 = rings[i], rings[i+1]
        n = len(r1)
        for j in range(n):
            jn = (j + 1) % n
            bm.faces.new([r1[j], r1[jn], r2[jn], r2[j]])

    # Cap front nose
    r_f = rings[0]
    front_c = bm.verts.new((0.0, stations[0][0], (stations[0][5] + stations[0][8]) * 0.5))
    for j in range(len(r_f)):
        jn = (j + 1) % len(r_f)
        bm.faces.new([r_f[j], r_f[jn], front_c])

    # Cap rear tail
    r_b = rings[-1]
    back_c = bm.verts.new((0.0, stations[-1][0], (stations[-1][5] + stations[-1][8]) * 0.5))
    for j in range(len(r_b)):
        jn = (j + 1) % len(r_b)
        bm.faces.new([r_b[jn], r_b[j], back_c])

    mesh = bpy.data.meshes.new("BODY_MainShell_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("BODY_MainShell", mesh)
    obj.data.materials.append(mats['rocket_metallic'])
    obj.data.materials.append(mats['carbon_fiber'])
    bpy.context.collection.objects.link(obj)

    # Assign carbon fiber material to lower body (below beltline Z < 0.40m)
    for poly in obj.data.polygons:
        poly.use_smooth = True
        cen = poly.center
        if cen.z < 0.38 and abs(cen.y) < 2.0:
            poly.material_index = 1  # Carbon lower aero
        else:
            poly.material_index = 0  # Rocket Metallic upper

    sub = obj.modifiers.new(name="Subdivision", type='SUBSURF')
    sub.render_levels = 4
    sub.levels = 4

    return obj


# ─── 2. Glass Dome Canopy with CFRP Exoskeleton ──────────────────────────
def build_glass_dome_canopy(mats):
    """
    Constructs the lightweight glass dome canopy:
    - Ultra-clear dielectric glazing extending over both occupants
    - Aircraft-inspired wraparound visibility
    - CFRP exoskeleton structural bars (3 lateral ribs)
    """
    bm_glass = bmesh.new()

    # Main windshield + dome glazing (Y = 0.98 cowl to Y = -0.50 B-pillar)
    dome_stations = [
        (0.98,  0.72, 0.72),   # Cowl base
        (0.72,  0.58, 0.88),   # A-pillar
        (0.42,  0.52, 1.08),   # Dome forward
        (0.10,  0.50, 1.196),  # Dome zenith
        (-0.20, 0.48, 1.18),   # Dome rear
        (-0.50, 0.46, 1.06),   # B-pillar trailing
    ]

    rings = []
    for y, hw, z_top in dome_stations:
        pts = [
            (-hw, y, z_top * 0.82),  # Lower left
            (-hw * 0.85, y, z_top),  # Upper left
            (0.0, y, z_top * 1.015), # Crown
            (hw * 0.85, y, z_top),   # Upper right
            (hw, y, z_top * 0.82),   # Lower right
        ]
        rings.append([bm_glass.verts.new(p) for p in pts])

    for i in range(len(rings) - 1):
        r1, r2 = rings[i], rings[i+1]
        for j in range(len(r1) - 1):
            bm_glass.faces.new([r1[j], r1[j+1], r2[j+1], r2[j]])

    mesh = bpy.data.meshes.new("GLASS_CockpitWindshield_Mesh")
    bm_glass.to_mesh(mesh)
    bm_glass.free()

    obj = bpy.data.objects.new("GLASS_CockpitWindshield", mesh)
    obj.data.materials.append(mats['glass_dome'])
    bpy.context.collection.objects.link(obj)

    sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.render_levels = 3
    sub.levels = 3

    # CFRP Exoskeleton Structural Ribs (3 lateral cross-bars)
    bm_exo = bmesh.new()
    for rib_y in [0.55, 0.15, -0.25]:
        z_at_rib = 1.08 if abs(rib_y - 0.10) < 0.3 else 0.96
        hw_at_rib = 0.54 if abs(rib_y - 0.10) < 0.3 else 0.62
        # Lateral bar arcing over dome
        for seg_i in range(16):
            t0 = seg_i / 16.0
            t1 = (seg_i + 1) / 16.0
            angle0 = math.pi * t0
            angle1 = math.pi * t1
            x0 = -hw_at_rib * math.cos(angle0)
            z0_bar = z_at_rib * 0.82 + (z_at_rib * 0.20) * math.sin(angle0)
            x1 = -hw_at_rib * math.cos(angle1)
            z1_bar = z_at_rib * 0.82 + (z_at_rib * 0.20) * math.sin(angle1)

            bmesh.ops.create_cube(bm_exo, size=1.0,
                matrix=Matrix.Translation(Vector(((x0+x1)*0.5, rib_y, (z0_bar+z1_bar)*0.5))) @
                       Matrix.Scale(abs(x1-x0) + 0.020, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.022, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.018, 4, Vector((0, 0, 1))))

        # Longitudinal spine (center ridge)
        bmesh.ops.create_cube(bm_exo, size=1.0,
            matrix=Matrix.Translation(Vector((0.0, rib_y, z_at_rib + 0.01))) @
                   Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.022, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.018, 4, Vector((0, 0, 1))))

    # Longitudinal center spine running full length of dome
    bmesh.ops.create_cube(bm_exo, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.24, 1.12))) @
               Matrix.Scale(0.020, 4, Vector((1, 0, 0))) @
               Matrix.Scale(1.40, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.016, 4, Vector((0, 0, 1))))

    mesh_exo = bpy.data.meshes.new("GLASS_Exoskeleton_Mesh")
    bm_exo.to_mesh(mesh_exo)
    bm_exo.free()
    obj_exo = bpy.data.objects.new("GLASS_Exoskeleton", mesh_exo)
    obj_exo.data.materials.append(mats['exo_bars'])
    bpy.context.collection.objects.link(obj_exo)

    return obj


# ─── 3. Vertical 4-Point LED Headlights (906/908 Inspired) ───────────────
def build_vertical_4point_headlights(mats):
    """
    Constructs vertical reinterpretation of Porsche's classic 4-point light signature:
    - 4 vertically stacked LED modules per side
    - High-tech structural frame surround
    - Clear polycarbonate outer lens
    """
    bm_leds = bmesh.new()
    bm_housing = bmesh.new()
    bm_lens = bmesh.new()

    for side in [-1.0, 1.0]:
        hx = side * 0.72
        hy = 1.86
        hz_base = 0.34

        # Clear Polycarbonate Outer Lens (Tall vertical enclosure)
        bmesh.ops.create_cone(bm_lens, cap_ends=True, segments=28,
            radius1=0.080, radius2=0.065, depth=0.32,
            matrix=Matrix.Translation(Vector((hx, hy, hz_base + 0.12))) @
                   Matrix.Rotation(math.radians(-side * 6), 4, 'Z') @
                   Matrix.Scale(0.55, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.30, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(1.0, 4, Vector((0, 0, 1))))

        # Dark Structural Housing Frame
        bmesh.ops.create_cone(bm_housing, cap_ends=True, segments=28,
            radius1=0.074, radius2=0.059, depth=0.30,
            matrix=Matrix.Translation(Vector((hx, hy - 0.005, hz_base + 0.12))) @
                   Matrix.Rotation(math.radians(-side * 6), 4, 'Z') @
                   Matrix.Scale(0.50, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.28, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(1.0, 4, Vector((0, 0, 1))))

        # 4 Vertically Stacked LED Point Modules
        for led_i in range(4):
            led_z = hz_base + 0.02 + led_i * 0.072
            bmesh.ops.create_cone(bm_leds, cap_ends=True, segments=20,
                radius1=0.022, radius2=0.022, depth=0.018,
                matrix=Matrix.Translation(Vector((hx, hy + 0.01, led_z))) @
                       Matrix.Rotation(math.radians(90), 4, 'X'))

    # Assemble LED modules
    mesh_led = bpy.data.meshes.new("LIGHTING_Headlamps_Mesh")
    bm_leds.to_mesh(mesh_led)
    bm_leds.free()
    obj_led = bpy.data.objects.new("LIGHTING_Headlamps", mesh_led)
    obj_led.data.materials.append(mats['led_4point'])
    bpy.context.collection.objects.link(obj_led)

    # Housing
    mesh_hsg = bpy.data.meshes.new("LIGHTING_HeadlampHousing_Mesh")
    bm_housing.to_mesh(mesh_hsg)
    bm_housing.free()
    obj_hsg = bpy.data.objects.new("LIGHTING_HeadlampHousing", mesh_hsg)
    obj_hsg.data.materials.append(mats['headlamp_housing'])
    bpy.context.collection.objects.link(obj_hsg)

    # Outer lens
    mesh_lens = bpy.data.meshes.new("LIGHTING_HeadlampCovers_Mesh")
    bm_lens.to_mesh(mesh_lens)
    bm_lens.free()
    obj_lens = bpy.data.objects.new("LIGHTING_HeadlampCovers", mesh_lens)
    obj_lens.data.materials.append(mats['polycarbonate'])
    bpy.context.collection.objects.link(obj_lens)

    return obj_led


# ─── 4. Le Mans-Style Forward-Opening Doors ──────────────────────────────
def build_le_mans_doors(mats):
    """
    Constructs Le Mans-style doors hinged at A-pillar and roof:
    - Forward-upward opening motion
    - Carbon-fiber inner structural frame
    - Deep window cutouts
    """
    door_objs = []

    door_stations = [
        ( 0.72, 0.94, 0.82, 0.54, 0.68),
        ( 0.42, 0.92, 0.78, 0.56, 0.72),
        ( 0.10, 0.90, 0.76, 0.58, 0.74),
        (-0.20, 0.91, 0.78, 0.60, 0.76),
        (-0.50, 0.94, 0.82, 0.62, 0.78),
    ]

    for side, dname in [(-1.0, "BODY_Door_FL"), (1.0, "BODY_Door_FR")]:
        bm = bmesh.new()

        rings = []
        for y, hw_w, hw_s, zw, zs in door_stations:
            pts = [
                (side * (hw_w * 0.988 + 0.002), y, 0.28),
                (side * (hw_w * 1.002 + 0.002), y, (0.28 + zw) * 0.5),
                (side * (hw_w * 1.002 + 0.002), y, zw),
                (side * (hw_s * 1.002 + 0.002), y, zs),
            ]
            rings.append([bm.verts.new(p) for p in pts])

        for i in range(len(rings) - 1):
            r1, r2 = rings[i], rings[i+1]
            for j in range(len(r1) - 1):
                bm.faces.new([r1[j], r1[j+1], r2[j+1], r2[j]])

        mesh = bpy.data.meshes.new(f"{dname}_Mesh")
        bm.to_mesh(mesh)
        bm.free()

        obj = bpy.data.objects.new(dname, mesh)
        obj.data.materials.append(mats['rocket_metallic'])
        bpy.context.collection.objects.link(obj)

        for p in obj.data.polygons:
            p.use_smooth = True

        sol = obj.modifiers.new(name="Solidify", type='SOLIDIFY')
        sol.thickness = 0.004

        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = 0.002
        bev.segments = 2

        # Le Mans hinge at forward A-pillar + roof junction
        hinge_loc = Vector((side * 0.86, 0.72, 0.68))
        obj.location = hinge_loc
        for v in obj.data.vertices:
            v.co -= hinge_loc

        door_objs.append(obj)

    return door_objs


# ─── 5. Front Aero Package (Splitter, Active Wing, Dive Planes) ──────────
def build_front_aero_package(mats):
    """
    Constructs front aerodynamic architecture:
    - Wide central intake mouth
    - Carbon front splitter
    - Active front wing elements
    - Side air curtain channels
    """
    bm = bmesh.new()

    # Wide Central Intake Mouth
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.20, 0.20))) @
               Matrix.Scale(0.96, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.06, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.12, 4, Vector((0, 0, 1))))

    # Carbon Front Splitter
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.26, 0.11))) @
               Matrix.Scale(1.56, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.20, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.016, 4, Vector((0, 0, 1))))

    # Active Front Wing Elements (Canards)
    for side in [-1.0, 1.0]:
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.82, 2.14, 0.18))) @
                   Matrix.Rotation(math.radians(-side * 16), 4, 'Z') @
                   Matrix.Scale(0.18, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.14, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.014, 4, Vector((0, 0, 1))))

    # Side Air Curtain Channels
    for side in [-1.0, 1.0]:
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.92, 2.00, 0.28))) @
                   Matrix.Rotation(math.radians(-side * 12), 4, 'Z') @
                   Matrix.Scale(0.10, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.28, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.08, 4, Vector((0, 0, 1))))

    mesh = bpy.data.meshes.new("AERO_FrontSplitter_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("AERO_FrontSplitter", mesh)
    obj.data.materials.append(mats['carbon_fiber'])
    bpy.context.collection.objects.link(obj)

    return obj


# ─── 6. Camera Stalks (Replace Traditional Mirrors) ──────────────────────
def build_camera_stalks(mats):
    """B-pillar mounted camera stalks and rear diffuser camera."""
    bm = bmesh.new()

    for side in [-1.0, 1.0]:
        # B-Pillar Camera Stalk
        bmesh.ops.create_cone(bm, cap_ends=True, segments=16,
            radius1=0.014, radius2=0.010, depth=0.14,
            matrix=Matrix.Translation(Vector((side * 0.88, -0.36, 0.92))) @
                   Matrix.Rotation(math.radians(side * 75), 4, 'Z') @
                   Matrix.Rotation(math.radians(-15), 4, 'X'))

        # Camera Head
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.96, -0.36, 0.92))) @
                   Matrix.Scale(0.028, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.022, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.020, 4, Vector((0, 0, 1))))

    # Rear diffuser-mounted camera pod
    bmesh.ops.create_cone(bm, cap_ends=True, segments=16,
        radius1=0.016, radius2=0.012, depth=0.10,
        matrix=Matrix.Translation(Vector((0.0, -2.16, 0.48))) @
               Matrix.Rotation(math.radians(90), 4, 'X'))

    mesh = bpy.data.meshes.new("AERO_SideMirrors_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("AERO_SideMirrors", mesh)
    obj.data.materials.append(mats['trim_black'])
    bpy.context.collection.objects.link(obj)

    return obj


# ─── 7. Active Rear Wing & Side Intakes ──────────────────────────────────
def build_rear_wing_and_intakes(mats):
    """
    Constructs extendable rear wing (Porsche Active Aerodynamics PAA):
    - Concealed wing that deploys from rear decklid
    - Side radiator intake channels
    """
    bm_wing = bmesh.new()

    # Main Wing Blade (Span 1.10m, chord 0.24m, thickness 0.022m)
    bmesh.ops.create_cube(bm_wing, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -1.72, 0.82))) @
               Matrix.Scale(1.10, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.24, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.022, 4, Vector((0, 0, 1))))

    # Wing Endplates
    for side in [-1.0, 1.0]:
        bmesh.ops.create_cube(bm_wing, size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.56, -1.74, 0.82))) @
                   Matrix.Scale(0.014, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.26, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.065, 4, Vector((0, 0, 1))))

    # Twin Swan-Neck Stanchions
    for side in [-1.0, 1.0]:
        bmesh.ops.create_cone(bm_wing, cap_ends=True, segments=16,
            radius1=0.016, radius2=0.012, depth=0.10,
            matrix=Matrix.Translation(Vector((side * 0.28, -1.68, 0.78))) @
                   Matrix.Rotation(math.radians(15), 4, 'X'))

    mesh = bpy.data.meshes.new("AERO_ActiveRearWing_Mesh")
    bm_wing.to_mesh(mesh)
    bm_wing.free()

    obj_wing = bpy.data.objects.new("AERO_ActiveRearWing", mesh)
    obj_wing.data.materials.append(mats['carbon_fiber'])
    bpy.context.collection.objects.link(obj_wing)

    bev = obj_wing.modifiers.new(name="Bevel", type='BEVEL')
    bev.width = 0.002
    bev.segments = 2
    sub = obj_wing.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.render_levels = 2
    sub.levels = 2

    # Physical deploy origin
    obj_wing.location = Vector((0.0, -1.72, 0.82))
    for v in obj_wing.data.vertices:
        v.co -= Vector((0.0, -1.72, 0.82))

    # Side Radiator Intake Channels
    bm_intakes = bmesh.new()
    for side in [-1.0, 1.0]:
        bmesh.ops.create_cube(bm_intakes, size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.90, -0.85, 0.50))) @
                   Matrix.Rotation(math.radians(-side * 5), 4, 'Z') @
                   Matrix.Scale(0.11, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.60, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.28, 4, Vector((0, 0, 1))))

    mesh_in = bpy.data.meshes.new("AERO_SideIntakes_Mesh")
    bm_intakes.to_mesh(mesh_in)
    bm_intakes.free()
    obj_in = bpy.data.objects.new("AERO_SideIntakes", mesh_in)
    obj_in.data.materials.append(mats['trim_black'])
    bpy.context.collection.objects.link(obj_in)

    return obj_wing


# ─── 8. Full-Width Floating Rear Lightbar ────────────────────────────────
def build_rear_lightbar(mats):
    """
    Constructs the full-length floating red rear lightbar:
    - Continuous OLED strip spanning full width
    - Integrated transparent illuminated PORSCHE lettering
    - Dark carbon surround panel
    """
    bm_bar = bmesh.new()
    bm_text = bmesh.new()

    tail_y = -2.22
    tail_z = 0.72

    # Full-width floating OLED lightbar strip
    bmesh.ops.create_cube(bm_bar, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, tail_y, tail_z))) @
               Matrix.Scale(1.40, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.024, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.030, 4, Vector((0, 0, 1))))

    # Light bar endcaps (wrap-around)
    for side in [-1.0, 1.0]:
        bmesh.ops.create_cube(bm_bar, size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.72, tail_y + 0.04, tail_z))) @
                   Matrix.Rotation(math.radians(-side * 25), 4, 'Z') @
                   Matrix.Scale(0.08, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.024, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.028, 4, Vector((0, 0, 1))))

    # Illuminated PORSCHE lettering (6 character blocks)
    porsche_letters_x = [-0.22, -0.13, -0.04, 0.04, 0.13, 0.22, 0.31]
    for lx in porsche_letters_x:
        bmesh.ops.create_cube(bm_text, size=1.0,
            matrix=Matrix.Translation(Vector((lx, tail_y - 0.008, tail_z))) @
                   Matrix.Scale(0.042, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.018, 4, Vector((0, 0, 1))))

    # Dark Rear Valence Panel
    bm_valence = bmesh.new()
    bmesh.ops.create_cube(bm_valence, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -2.20, 0.50))) @
               Matrix.Scale(1.50, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.018, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.42, 4, Vector((0, 0, 1))))

    mesh_val = bpy.data.meshes.new("AERO_RearValence_Mesh")
    bm_valence.to_mesh(mesh_val)
    bm_valence.free()
    obj_val = bpy.data.objects.new("AERO_RearValence", mesh_val)
    obj_val.data.materials.append(mats['carbon_fiber'])
    bpy.context.collection.objects.link(obj_val)

    mesh_bar = bpy.data.meshes.new("LIGHTING_Taillamps_Mesh")
    bm_bar.to_mesh(mesh_bar)
    bm_bar.free()
    obj_bar = bpy.data.objects.new("LIGHTING_Taillamps", mesh_bar)
    obj_bar.data.materials.append(mats['rear_lightbar'])
    bpy.context.collection.objects.link(obj_bar)

    mesh_text = bpy.data.meshes.new("LIGHTING_PORSCHE_Text_Mesh")
    bm_text.to_mesh(mesh_text)
    bm_text.free()
    obj_text = bpy.data.objects.new("LIGHTING_PORSCHE_Text", mesh_text)
    obj_text.data.materials.append(mats['porsche_text'])
    bpy.context.collection.objects.link(obj_text)

    return obj_bar


# ─── 9. Carbon Undertray with Venturi Diffuser ──────────────────────────
def build_underbody_and_diffusers(mats):
    """Flat carbon undertray with twin Venturi expansion tunnels and 5 diffuser strakes."""
    bm = bmesh.new()

    # Front Undertray
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.80, 0.11))) @
               Matrix.Scale(1.30, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.80, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.016, 4, Vector((0, 0, 1))))

    # Central Flat Floor
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.0, 0.12))) @
               Matrix.Scale(1.68, 4, Vector((1, 0, 0))) @
               Matrix.Scale(2.40, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.016, 4, Vector((0, 0, 1))))

    # Twin Venturi Expansion Tunnels
    for side in [-1.0, 1.0]:
        dx = side * 0.44
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((dx, -1.95, 0.20))) @
                   Matrix.Rotation(math.radians(-14), 4, 'X') @
                   Matrix.Scale(0.42, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.68, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.065, 4, Vector((0, 0, 1))))

    # 5 Vertical Diffuser Strakes
    for sx in [-0.52, -0.26, 0.0, 0.26, 0.52]:
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((sx, -2.00, 0.22))) @
                   Matrix.Rotation(math.radians(-14), 4, 'X') @
                   Matrix.Scale(0.013, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.65, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.11, 4, Vector((0, 0, 1))))

    mesh = bpy.data.meshes.new("UNDERBODY_FlatFloor_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("UNDERBODY_FlatFloor", mesh)
    obj.data.materials.append(mats['carbon_fiber'])
    bpy.context.collection.objects.link(obj)

    bev = obj.modifiers.new(name="Bevel", type='BEVEL')
    bev.width = 0.003
    bev.segments = 2
    sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.render_levels = 3
    sub.levels = 3

    return obj


# ─── 10. Bronze-Gold Double-Spoke Wheels with Turbine Aeroblades ─────────
def build_mission_x_wheel_corner(name, loc, is_front, is_left, mats):
    """
    Constructs high-density staggered bronze-gold double-spoke wheels:
    - 20" front / 21" rear
    - Deep-dished relief-milled bronze-gold double spokes
    - Transparent turbine aeroblades on rear wheels
    - Porsche PCCB carbon-ceramic rotors
    - Acid Green hybrid 6-piston calipers
    """
    bm = bmesh.new()

    wheel_r = 0.334 if is_front else 0.344
    rim_r = 0.250 if is_front else 0.256
    tire_w = 0.255 if is_front else 0.315
    dish_depth = 0.035 if is_front else 0.060
    side_dir = -1.0 if is_left else 1.0

    cx, cy, cz = loc.x, loc.y, loc.z

    # 1. Outer Rim Lip
    rim_start = len(bm.faces)
    bmesh.ops.create_cone(bm, cap_ends=False, segments=112,
        radius1=rim_r, radius2=rim_r, depth=tire_w * 0.95,
        matrix=Matrix.Translation(Vector((cx, cy, cz))) @ Matrix.Rotation(math.radians(90), 4, 'Y'))

    # Stepped Inner Lip
    bmesh.ops.create_cone(bm, cap_ends=False, segments=112,
        radius1=rim_r - 0.012, radius2=rim_r - 0.012, depth=dish_depth * 0.65,
        matrix=Matrix.Translation(Vector((cx + side_dir * (tire_w * 0.44 - dish_depth * 0.32), cy, cz))) @
               Matrix.Rotation(math.radians(90), 4, 'Y'))

    bmesh.ops.create_cone(bm, cap_ends=False, segments=112,
        radius1=rim_r - 0.024, radius2=rim_r - 0.024, depth=dish_depth * 1.1,
        matrix=Matrix.Translation(Vector((cx + side_dir * (tire_w * 0.44 - dish_depth * 0.60), cy, cz))) @
               Matrix.Rotation(math.radians(90), 4, 'Y'))

    # 2. Central Hub & 10 Double Spokes (Relief-Milled)
    spoke_start = len(bm.faces)
    bmesh.ops.create_cone(bm, cap_ends=True, segments=10,
        radius1=0.078, radius2=0.078, depth=0.038,
        matrix=Matrix.Translation(Vector((cx + side_dir * (tire_w * 0.41 - dish_depth), cy, cz))) @
               Matrix.Rotation(math.radians(90), 4, 'Y'))

    for spoke_i in range(10):
        base_angle = spoke_i * (2.0 * math.pi / 10.0)
        spoke_rot = Matrix.Rotation(base_angle, 4, 'X')
        spoke_len = rim_r - 0.020
        spoke_mid = spoke_len * 0.52

        # Main bronze-gold spoke
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((cx + side_dir * (tire_w * 0.41 - dish_depth * 0.80), cy, cz))) @
                   spoke_rot @
                   Matrix.Translation(Vector((0, 0, spoke_mid))) @
                   Matrix.Scale(0.018, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.032, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(spoke_len * 0.84, 4, Vector((0, 0, 1))))

    # Turbine Aeroblade Cover (rear wheels only - partially transparent)
    aero_start = len(bm.faces)
    if not is_front:
        bmesh.ops.create_cone(bm, cap_ends=True, segments=64,
            radius1=rim_r - 0.008, radius2=rim_r - 0.008, depth=0.012,
            matrix=Matrix.Translation(Vector((cx + side_dir * (tire_w * 0.44 - dish_depth * 0.4), cy, cz))) @
                   Matrix.Rotation(math.radians(90), 4, 'Y'))

    # Center Cap
    cap_start = len(bm.faces)
    bmesh.ops.create_cone(bm, cap_ends=True, segments=24,
        radius1=0.036, radius2=0.036, depth=0.028,
        matrix=Matrix.Translation(Vector((cx + side_dir * (tire_w * 0.44 - dish_depth + 0.012), cy, cz))) @
               Matrix.Rotation(math.radians(90), 4, 'Y'))

    # 3. Tire
    tire_start = len(bm.faces)
    bmesh.ops.create_cone(bm, cap_ends=False, segments=112,
        radius1=wheel_r, radius2=wheel_r, depth=tire_w,
        matrix=Matrix.Translation(Vector((cx, cy, cz))) @ Matrix.Rotation(math.radians(90), 4, 'Y'))

    # Sidewalls
    for sw_side in [-1.0, 1.0]:
        bmesh.ops.create_cone(bm, cap_ends=False, segments=112,
            radius1=wheel_r - 0.014, radius2=rim_r + 0.005, depth=0.034,
            matrix=Matrix.Translation(Vector((cx + sw_side * (tire_w * 0.47), cy, cz))) @
                   Matrix.Rotation(math.radians(90), 4, 'Y'))

    # 4. PCCB Carbon-Ceramic Rotor
    rotor_start = len(bm.faces)
    rotor_r = 0.188 if is_front else 0.174
    rotor_x = cx + side_dir * 0.02
    bmesh.ops.create_cone(bm, cap_ends=True, segments=80,
        radius1=rotor_r, radius2=rotor_r, depth=0.022,
        matrix=Matrix.Translation(Vector((rotor_x, cy, cz))) @ Matrix.Rotation(math.radians(90), 4, 'Y'))

    # Cross-drilled cooling vanes (36)
    for v_i in range(36):
        v_angle = v_i * (2.0 * math.pi / 36.0)
        v_rot = Matrix.Rotation(v_angle, 4, 'X')
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((rotor_x, cy, cz))) @
                   v_rot @
                   Matrix.Translation(Vector((0, 0, rotor_r * 0.64))) @
                   Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.008, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.034, 4, Vector((0, 0, 1))))

    # 5. Acid Green 6-Piston Caliper
    caliper_start = len(bm.faces)
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((cx + side_dir * 0.032, cy + 0.04, cz + rotor_r * 0.80))) @
               Matrix.Scale(0.050, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.124, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.066, 4, Vector((0, 0, 1))))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    # Material assignments
    obj.data.materials.append(mats['bronze_gold_wheel'])     # 0 - Rim
    obj.data.materials.append(mats['bronze_gold_wheel'])     # 1 - Spokes (same bronze)
    obj.data.materials.append(mats['aeroblade_clear'])       # 2 - Aeroblade
    obj.data.materials.append(mats['center_cap'])            # 3 - Center cap
    obj.data.materials.append(mats['tire_rubber'])           # 4 - Tire
    obj.data.materials.append(mats['ccm_rotor'])             # 5 - Rotor
    obj.data.materials.append(mats['acid_green_caliper'])    # 6 - Caliper

    for idx, poly in enumerate(obj.data.polygons):
        if idx < spoke_start:
            poly.material_index = 0
        elif idx < aero_start:
            poly.material_index = 1
        elif idx < cap_start:
            poly.material_index = 2
        elif idx < tire_start:
            poly.material_index = 3
        elif idx < rotor_start:
            poly.material_index = 4
        elif idx < caliper_start:
            poly.material_index = 5
        else:
            poly.material_index = 6

    for p in obj.data.polygons:
        p.use_smooth = True

    sub = obj.modifiers.new(name="SubsurfWheel", type='SUBSURF')
    sub.render_levels = 3
    sub.levels = 3

    return obj


# ─── 11. Bake NLA Animation Actions ─────────────────────────────────────
def bake_mission_x_nla_actions(door_fl, door_fr, wing, wheel_fl, wheel_fr):
    """Bakes authentic interactive animation tracks for Mission X."""
    # 1. Le Mans Door FL (Forward-Upward Opening)
    door_fl.animation_data_clear()
    door_fl.rotation_euler = (0, 0, 0)
    door_fl.keyframe_insert(data_path="rotation_euler", frame=0)
    door_fl.rotation_euler = (math.radians(-65.0), math.radians(15.0), 0)
    door_fl.keyframe_insert(data_path="rotation_euler", frame=30)
    if door_fl.animation_data and door_fl.animation_data.action:
        door_fl.animation_data.action.name = "Action_Door_FL_Open"

    # 2. Le Mans Door FR
    door_fr.animation_data_clear()
    door_fr.rotation_euler = (0, 0, 0)
    door_fr.keyframe_insert(data_path="rotation_euler", frame=0)
    door_fr.rotation_euler = (math.radians(-65.0), math.radians(-15.0), 0)
    door_fr.keyframe_insert(data_path="rotation_euler", frame=30)
    if door_fr.animation_data and door_fr.animation_data.action:
        door_fr.animation_data.action.name = "Action_Door_FR_Open"

    # 3. Active Rear Wing Deploy (Extends upward from decklid)
    wing_rest = Vector((0.0, -1.72, 0.82))
    wing.animation_data_clear()
    wing.location = wing_rest
    wing.rotation_euler = (0, 0, 0)
    wing.keyframe_insert(data_path="location", frame=0)
    wing.keyframe_insert(data_path="rotation_euler", frame=0)
    wing.location = wing_rest + Vector((0, -0.04, 0.12))
    wing.rotation_euler = (math.radians(12.0), 0, 0)
    wing.keyframe_insert(data_path="location", frame=30)
    wing.keyframe_insert(data_path="rotation_euler", frame=30)
    wing.location = wing_rest
    wing.rotation_euler = (0, 0, 0)
    if wing.animation_data and wing.animation_data.action:
        wing.animation_data.action.name = "Action_Wing_Deploy"

    # 4. Steering Turn
    wheel_fl.animation_data_clear()
    wheel_fl.rotation_euler = (0, 0, 0)
    wheel_fl.keyframe_insert(data_path="rotation_euler", frame=0)
    wheel_fl.rotation_euler = (0, 0, math.radians(28.0))
    wheel_fl.keyframe_insert(data_path="rotation_euler", frame=30)
    if wheel_fl.animation_data and wheel_fl.animation_data.action:
        wheel_fl.animation_data.action.name = "Action_Steer_Left"

    # 5. Continuous Wheel Spin
    wheel_fr.animation_data_clear()
    wheel_fr.rotation_euler = (0, 0, 0)
    wheel_fr.keyframe_insert(data_path="rotation_euler", frame=0)
    wheel_fr.rotation_euler = (math.radians(-360.0), 0, 0)
    wheel_fr.keyframe_insert(data_path="rotation_euler", frame=60)
    if wheel_fr.animation_data and wheel_fr.animation_data.action:
        wheel_fr.animation_data.action.name = "Action_Wheel_Spin_FL"


# ─── 12. Master Assembly & Export Pipeline ────────────────────────────────
def run_mission_x_master_generation():
    print("=" * 68)
    print("EXECUTING MASTER CLASS-A UPGRADE: PORSCHE MISSION X CONCEPT (SUPERCAR FUTURE)")
    print("=" * 68)

    # 1. Safely clean existing objects
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)

    # 2. Material Factory
    mats = setup_materials()

    # 3. Build Subsystems
    shell_obj = build_mission_x_body(mats)
    dome_obj = build_glass_dome_canopy(mats)
    headlights_obj = build_vertical_4point_headlights(mats)
    door_objs = build_le_mans_doors(mats)
    front_aero_obj = build_front_aero_package(mats)
    cameras_obj = build_camera_stalks(mats)
    wing_obj = build_rear_wing_and_intakes(mats)
    lightbar_obj = build_rear_lightbar(mats)
    underbody_obj = build_underbody_and_diffusers(mats)

    # 4. Wheel Hardpoints (Wheelbase 2.730m: Front Y=+1.365m, Rear Y=-1.365m)
    # Front Track ~1.680m (+/-0.840m), Rear Track ~1.660m (+/-0.830m)
    wheel_defs = [
        ("WHEEL_FL", Vector((-0.840,  1.365, 0.334)), True,  True),
        ("WHEEL_FR", Vector(( 0.840,  1.365, 0.334)), True,  False),
        ("WHEEL_RL", Vector((-0.830, -1.365, 0.344)), False, True),
        ("WHEEL_RR", Vector(( 0.830, -1.365, 0.344)), False, False),
    ]
    wheel_objs = {}
    for wname, wloc, is_f, is_l in wheel_defs:
        w_obj = build_mission_x_wheel_corner(wname, wloc, is_f, is_l, mats)
        wheel_objs[wname] = w_obj

    # 5. Semantic Hitboxes (Gate 4)
    hitboxes_data = [
        ("HITBOX_Hood", Vector((0.0, 1.66, 0.50)), Vector((0.72, 0.60, 0.14))),
        ("HITBOX_Door_FL", Vector((-0.90, 0.15, 0.55)), Vector((0.14, 0.65, 0.30))),
        ("HITBOX_Door_FR", Vector((0.90, 0.15, 0.55)), Vector((0.14, 0.65, 0.30))),
        ("HITBOX_Cockpit", Vector((0.0, 0.15, 0.92)), Vector((0.60, 0.70, 0.30))),
        ("HITBOX_EngineGlass", Vector((0.0, -0.80, 0.85)), Vector((0.60, 0.65, 0.20))),
        ("HITBOX_RearWing", Vector((0.0, -1.72, 0.82)), Vector((0.85, 0.24, 0.12))),
        ("HITBOX_Wheel_FL", Vector((-0.840, 1.365, 0.334)), Vector((0.20, 0.36, 0.36))),
        ("HITBOX_Wheel_FR", Vector((0.840, 1.365, 0.334)), Vector((0.20, 0.36, 0.36))),
        ("HITBOX_Wheel_RL", Vector((-0.830, -1.365, 0.344)), Vector((0.22, 0.38, 0.38))),
        ("HITBOX_Wheel_RR", Vector((0.830, -1.365, 0.344)), Vector((0.22, 0.38, 0.38))),
    ]
    for hname, hloc, hsize in hitboxes_data:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=hloc)
        hobj = bpy.context.active_object
        hobj.name = hname
        hobj.scale = hsize
        hobj.data.materials.append(mats['hitbox'])
        hobj["interactive"] = True
        hobj["sound_fx"] = "mechanical_click"
        hobj["haptic"] = "light_impact"

    # 6. Camera Anchors
    cam_anchors = [
        ("CAMERA_Hero_Front34", Vector((-3.4, 3.8, 1.6))),
        ("CAMERA_Hero_Rear34", Vector((-3.4, -3.8, 1.6))),
        ("CAMERA_Side_Profile", Vector((-4.4, 0.0, 0.8))),
        ("CAMERA_Front_Fascia", Vector((0.0, 4.2, 0.65))),
    ]
    for cname, cloc in cam_anchors:
        cam_data = bpy.data.cameras.new(cname)
        cam_obj = bpy.data.objects.new(cname, cam_data)
        cam_obj.location = cloc
        bpy.context.collection.objects.link(cam_obj)

    # 7. Bake NLA Actions (Gate 5)
    bake_mission_x_nla_actions(
        door_fl=door_objs[0],
        door_fr=door_objs[1],
        wing=wing_obj,
        wheel_fl=wheel_objs["WHEEL_FL"],
        wheel_fr=wheel_objs["WHEEL_FR"]
    )

    # 8. Pre-export modifier baking protocol
    print("Executing pre-export modifier baking protocol...")
    for obj in list(bpy.data.objects):
        if obj.type != 'MESH':
            continue
        if not obj.modifiers:
            continue
        bpy.context.view_layer.objects.active = obj
        for mod in list(obj.modifiers):
            try:
                bpy.ops.object.modifier_apply(modifier=mod.name)
            except Exception as e:
                print(f"Notice applying {mod.name} on {obj.name}: {e}")

    # 9. Audit Final Polygon Density
    total_triangles = 0
    total_verts = 0
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            for poly in obj.data.polygons:
                total_triangles += max(0, poly.loop_total - 2)
            total_verts += len(obj.data.vertices)

    print(f"MASTER PORSCHE MISSION X GENERATED:")
    print(f"  Total Triangles: {total_triangles:,}")
    print(f"  Total Vertices:  {total_verts:,}")

    # 10. Export Master GLB
    export_path = r"e:\Car_Automation\public\models\vehicles\supercar\future\vehicle.glb"
    os.makedirs(os.path.dirname(export_path), exist_ok=True)

    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_yup=True,
        export_materials='EXPORT',
        export_extras=True,
        export_animations=True,
        export_animation_mode='ACTIONS',
        export_morph=True
    )
    file_size_mb = os.path.getsize(export_path) / (1024 * 1024)
    print(f"Exported upgraded Master Porsche Mission X GLB: {export_path} ({file_size_mb:.2f} MB)")

    return {
        'triangles': total_triangles,
        'file_size_mb': file_size_mb
    }


# Unconditional execution inside Blender MCP
run_mission_x_master_generation()
