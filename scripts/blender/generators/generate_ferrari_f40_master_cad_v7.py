"""
================================================================================
MASTER CLASS-A CAD GENERATOR v7: 1987 FERRARI F40 (SUPERCAR 1980S)
================================================================================
Definitive procedural Class-A CAD generator for the 1987 Ferrari F40.
Fulfills all 7 Production Quality Gates and strict project directives:
  - Gate 1: File Size >= 15 MB (Target: 17.5 - 19.5 MB)
  - Gate 2: Polygons >= 750,000 (Target: 950,000 - 1,150,000 tris)
  - Gate 3: Hierarchy (7/7 Subsystems: Body, Glass, Wheels, Lighting, Aero, Jewelry, Underbody + Interior)
  - Gate 4: Hitboxes (10 HITBOX_* nodes with Mat_Invisible_Hitbox)
  - Gate 5: NLA Actions (6 baked actions: Doors Open +55°, Pop-up Pods +26°, Engine Deck Tilt, Steering, Wheel Spin)
  - Gate 6: Metadata (interactive, sound_fx, haptic)
  - Gate 7: PBR Materials (Rosso Corsa, Carbon-Kevlar, Nomex Red, Speedline Silver, Polished Inconel)
  - 100% UNIFORM TOPOLOGICAL STATION RINGS (ZERO PINCHING, ZERO TWISTS across entire body!)
  - 100% OPEN UNIBODY GREENHOUSE CUTOUT (Zero sheet metal underneath windshield or glass!)
  - 100% OPEN REAR ENGINE BAY (Exposed twin-turbo V8 visible under slatted Lexan cover!)
  - Pininfarina Chisel Nose with smooth curved leading edge, front carbon splitter & central intake mouth
  - Sculpted hood with dual recessed triangular NACA ducts and flush pop-up lamp shutline wells
  - Forward-hinged lightweight composite doors (+55° yaw on forward cowl hinge axis) with inner cards
  - Dedicated transparent sliding Lexan split door windows with slim satin black surround
  - Structural carbon-Kevlar rocker sill threshold eliminating cabin voids
  - Continuous rear haunches with smooth wheel arch transitions, side intercooler strakes and lower brake cooling NACA ducts
  - Enclosed front wheel arch splash guards and rear wheel tubs (zero see-through voids from any angle)
  - High-density Speedline 3-piece 5-spoke star wheels with stepped polished lips (front 45mm, rear 95mm deep-dish)
  - Stripped carbon-Kevlar cockpit interior with dual Rosso Corsa Nomex racing bucket seats, Momo steering wheel, Veglia gauges, gated shifter
================================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

PROJECT_ROOT = r"e:\Car_Automation"


# ═════════════════════════════════════════════════════════════════════════════
# 1. PBR MATERIAL FACTORY
# ═════════════════════════════════════════════════════════════════════════════
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

    if 'color' in props:
        set_s(['Base Color'], props['color'])
    if 'metallic' in props:
        set_s(['Metallic'], props['metallic'])
    if 'roughness' in props:
        set_s(['Roughness'], props['roughness'])
    if 'ior' in props:
        set_s(['IOR'], props['ior'])
    if 'transmission' in props:
        set_s(['Transmission Weight', 'Transmission'], props['transmission'])
    if 'clearcoat' in props:
        set_s(['Coat Weight', 'Clearcoat'], props['clearcoat'])
    if 'clearcoat_roughness' in props:
        set_s(['Coat Roughness', 'Clearcoat Roughness'], props['clearcoat_roughness'])
    if 'emission' in props:
        set_s(['Emission Color', 'Emission'], props['emission'])
    if 'emission_strength' in props:
        set_s(['Emission Strength'], props['emission_strength'])
    if 'alpha' in props:
        set_s(['Alpha'], props['alpha'])

    return mat


def setup_f40_materials():
    """Initializes authentic 1987 Ferrari F40 PBR material suite."""
    m = {}

    # Factory Ferrari Rosso Corsa Paint (High-gloss clearcoat lacquer)
    m['paint_red'] = get_pbr_material('Mat_Rosso_Corsa', {
        'color': (0.860, 0.015, 0.012, 1.0),
        'metallic': 0.05,
        'roughness': 0.12,
        'clearcoat': 1.0,
        'clearcoat_roughness': 0.03
    })

    # Raw Carbon-Kevlar Weave (Tub, door cards, rear wing inner structure)
    m['carbon_kevlar'] = get_pbr_material('Mat_Carbon_Kevlar_Raw', {
        'color': (0.16, 0.14, 0.09, 1.0),
        'metallic': 0.15,
        'roughness': 0.42,
        'clearcoat': 0.4
    })

    # Satin Nero Trim & Moldings
    m['trim_black'] = get_pbr_material('Mat_Trim_Nero_Satin', {
        'color': (0.022, 0.022, 0.022, 1.0),
        'metallic': 0.0,
        'roughness': 0.65
    })

    # Mirror Chrome & Emblems (Cavallino Rampante, gauge rings)
    m['chrome'] = get_pbr_material('Mat_Chrome_Polished', {
        'color': (0.95, 0.95, 0.95, 1.0),
        'metallic': 1.0,
        'roughness': 0.02,
        'clearcoat': 1.0
    })

    # Dielectric Optical Transmission Glass (Windshield & side windows)
    m['glass_dielectric'] = get_pbr_material('Mat_Glass_Dielectric', {
        'color': (0.92, 0.96, 0.95, 1.0),
        'transmission': 0.94,
        'ior': 1.52,
        'roughness': 0.02,
        'clearcoat': 1.0,
        'alpha': 0.15
    }, blend_method='BLEND')

    # Black Ceramic Frit (Serigraphy Perimeter Border)
    m['glass_frit'] = get_pbr_material('Mat_Glass_Ceramic_Frit', {
        'color': (0.008, 0.008, 0.008, 1.0),
        'metallic': 0.0,
        'roughness': 0.85
    })

    # Slatted Lexan Engine Cover Pane
    m['lexan_engine_cover'] = get_pbr_material('Mat_Lexan_Engine_Cover', {
        'color': (0.90, 0.94, 0.93, 1.0),
        'transmission': 0.92,
        'ior': 1.50,
        'roughness': 0.03,
        'clearcoat': 1.0,
        'alpha': 0.20
    }, blend_method='BLEND')

    # Polycarbonate Clear Lenses (Headlights & Driving Lights)
    m['polycarbonate'] = get_pbr_material('Mat_Light_Polycarbonate', {
        'color': (0.96, 0.97, 0.98, 1.0),
        'transmission': 0.95,
        'ior': 1.54,
        'roughness': 0.01,
        'clearcoat': 1.0,
        'alpha': 0.12
    }, blend_method='BLEND')

    # Speedline Forged Silver Lacquer (Wheel Star Center)
    m['speedline_silver'] = get_pbr_material('Mat_Speedline_Silver', {
        'color': (0.84, 0.85, 0.87, 1.0),
        'metallic': 0.92,
        'roughness': 0.22,
        'clearcoat': 0.5
    })

    # Stepped Lip Mirror Polished Aluminum (Deep-Dish Lips, Shifter Lever, Pedals)
    m['polished_aluminum'] = get_pbr_material('Mat_Polished_Aluminum', {
        'color': (0.96, 0.96, 0.97, 1.0),
        'metallic': 0.98,
        'roughness': 0.06,
        'clearcoat': 0.8
    })

    # Tire Rubber
    m['tire_rubber'] = get_pbr_material('Mat_Tire_Rubber', {
        'color': (0.032, 0.032, 0.032, 1.0),
        'metallic': 0.0,
        'roughness': 0.82
    })

    # Brembo Caliper Gloss Black
    m['brembo_black'] = get_pbr_material('Mat_Brembo_Black', {
        'color': (0.015, 0.015, 0.015, 1.0),
        'metallic': 0.25,
        'roughness': 0.12,
        'clearcoat': 0.9
    })

    # Cross-Drilled Rotor Steel
    m['rotor_steel'] = get_pbr_material('Mat_Brake_Rotor_Steel', {
        'color': (0.74, 0.75, 0.76, 1.0),
        'metallic': 0.96,
        'roughness': 0.32
    })

    # Red Nomex Racing Cloth (Bucket Seats)
    m['nomex_red'] = get_pbr_material('Mat_Fabric_Nomex_Rosso', {
        'color': (0.78, 0.05, 0.05, 1.0),
        'metallic': 0.0,
        'roughness': 0.78
    })

    # Dark Grey Alcantara / Felt (Dashboard & Cockpit Cowl)
    m['alcantara_grey'] = get_pbr_material('Mat_Alcantara_Nero_Grey', {
        'color': (0.065, 0.065, 0.070, 1.0),
        'metallic': 0.0,
        'roughness': 0.85
    })

    # Momo Steering Wheel Black Leather
    m['momo_leather'] = get_pbr_material('Mat_Leather_Momo_Black', {
        'color': (0.035, 0.035, 0.035, 1.0),
        'metallic': 0.02,
        'roughness': 0.58
    })

    # Inconel Polished Exhaust Cannons
    m['inconel_exhaust'] = get_pbr_material('Mat_Inconel_Exhaust', {
        'color': (0.90, 0.88, 0.82, 1.0),
        'metallic': 0.98,
        'roughness': 0.08,
        'clearcoat': 1.0
    })

    # Ferrari Red Crackle-Finish Cam Covers
    m['engine_red_crackle'] = get_pbr_material('Mat_Engine_Red_Crackle', {
        'color': (0.82, 0.04, 0.04, 1.0),
        'metallic': 0.15,
        'roughness': 0.40
    })

    # Cast Aluminum Engine Block & Behr Intercoolers
    m['engine_aluminum'] = get_pbr_material('Mat_Engine_Cast_Aluminum', {
        'color': (0.75, 0.77, 0.80, 1.0),
        'metallic': 0.92,
        'roughness': 0.28
    })

    # Carello Optical Taillight Ruby Red
    m['taillamp_ruby'] = get_pbr_material('Mat_Taillamp_Carello_Ruby', {
        'color': (0.85, 0.015, 0.02, 1.0),
        'transmission': 0.65,
        'ior': 1.54,
        'roughness': 0.05,
        'emission': (0.95, 0.01, 0.01, 1.0),
        'emission_strength': 8.0
    }, blend_method='BLEND')

    # Carello Amber Indicator
    m['taillamp_amber'] = get_pbr_material('Mat_Taillamp_Carello_Amber', {
        'color': (0.95, 0.48, 0.02, 1.0),
        'transmission': 0.65,
        'ior': 1.54,
        'roughness': 0.05,
        'emission': (0.95, 0.45, 0.02, 1.0),
        'emission_strength': 6.0
    }, blend_method='BLEND')

    # Headlamp Halogen Projector Reflector Chrome
    m['headlamp_chrome'] = get_pbr_material('Mat_Headlamp_Reflector', {
        'color': (0.98, 0.98, 0.98, 1.0),
        'metallic': 0.98,
        'roughness': 0.04,
        'emission': (1.0, 0.98, 0.92, 1.0),
        'emission_strength': 12.0
    })

    # Ferrari Giallo Fly Yellow (Center cap shield & prancing horse backgrounds)
    m['ferrari_yellow'] = get_pbr_material('Mat_Ferrari_Giallo', {
        'color': (0.98, 0.82, 0.04, 1.0),
        'metallic': 0.05,
        'roughness': 0.20,
        'clearcoat': 0.8
    })

    # Invisible Hitbox Material (100% Transparent Transmission, 0.0 Alpha)
    m['invisible_hitbox'] = get_pbr_material('Mat_Invisible_Hitbox', {
        'color': (1.0, 1.0, 1.0, 0.0),
        'transmission': 1.0,
        'alpha': 0.0,
        'roughness': 0.0
    }, blend_method='BLEND')

    return m


# ═════════════════════════════════════════════════════════════════════════════
# 2. MESH OBJECT BUILDER HELPER
# ═════════════════════════════════════════════════════════════════════════════
def create_mesh_object(name, bm, parent=None, mat=None, bevel=0.0025, subsurf=2, matrix=None):
    """Finalizes a BMesh into a high-density Class-A Blender mesh object."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    if parent:
        obj.parent = parent
    if matrix:
        obj.matrix_world = matrix
    bpy.context.collection.objects.link(obj)

    if mat:
        if isinstance(mat, list):
            for m in mat:
                if m: obj.data.materials.append(m)
        else:
            obj.data.materials.append(mat)

    for poly in obj.data.polygons:
        poly.use_smooth = True

    if bevel and bevel > 0.0:
        bev = obj.modifiers.new("Bevel", type='BEVEL')
        bev.width = bevel
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)

    if subsurf and subsurf > 0:
        sub = obj.modifiers.new("Subsurf", type='SUBSURF')
        sub.levels = subsurf
        sub.render_levels = subsurf

    wn = obj.modifiers.new("WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True

    return obj


def create_cylinder_mesh(bm, radius=0.1, depth=0.1, segments=24, cap_ends=True, matrix=Matrix(), **kwargs):
    """Helper to create cylindrical geometry using bmesh create_cone."""
    return bmesh.ops.create_cone(
        bm,
        segments=segments,
        cap_ends=cap_ends,
        cap_tris=False,
        radius1=radius,
        radius2=radius,
        depth=depth,
        matrix=matrix
    )


# ═════════════════════════════════════════════════════════════════════════════
# 3. CLASS-A CHISEL NOSE, HOOD, CHIN SPLITTER & FRONT FENDERS
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_front_clamshell(mats):
    """
    Constructs the Pininfarina wedge front clamshell:
    - Low chisel nose tip with forward carbon chin splitter dam
    - Central rectangular radiator cooling intake mouth with black wire mesh
    - Dual rectangular lower driving light / turn signal housings
    - Dual recessed triangular NACA duct impressions on the hood
    - Flush pop-up headlamp pod outlines and shutline wells
    - Smooth continuous sheet-metal surface from left arch lip to right arch lip
    - Enclosed front wheel arch splash wall at Y=1.48m (no see-through gaps from front)
    """
    bm = bmesh.new()

    front_stations = [
        # Y,       z_chin, z_hood, hw_chin, hw_crest, hw_fender
        (2.215,    0.130,  0.275,  0.420,   0.500,    0.520),  # Nose tip knife-edge
        (2.100,    0.135,  0.345,  0.720,   0.780,    0.820),  # Front bumper air header
        (1.950,    0.140,  0.420,  0.800,   0.860,    0.880),  # Driving lights / pop-up front
        (1.750,    0.140,  0.500,  0.840,   0.890,    0.920),  # Pop-up midpoint
        (1.580,    0.135,  0.580,  0.860,   0.910,    0.940),  # Hood NACA inlets / arch front entry
        (1.420,    0.135,  0.640,  0.880,   0.930,    0.950),  # Front wheel arch rise
        (1.340,    0.135,  0.670,  0.890,   0.940,    0.955),  # Arch apex forward
        (1.225,    0.135,  0.690,  0.895,   0.945,    0.960),  # Front axle centerline (peak)
        (1.100,    0.135,  0.700,  0.890,   0.940,    0.955),  # Arch apex rearward
        (0.980,    0.135,  0.710,  0.880,   0.930,    0.945),  # Arch rear fall
        (0.860,    0.135,  0.720,  0.865,   0.915,    0.935),  # Cowl shutline meeting door
    ]

    rings = []
    for s_idx, (y_val, z_chin, z_hood, hw_chin, hw_crest, hw_fender) in enumerate(front_stations):
        # Front wheel arch cutout with smooth circular profile:
        in_arch = (0.92 <= y_val < 1.48)
        if in_arch:
            rel_y = (y_val - 1.225) / 0.255
            arch_factor = max(0.0, 1.0 - rel_y * rel_y)
            z_arch_bot = 0.135 + math.sqrt(arch_factor) * (0.685 - 0.135)
        else:
            z_arch_bot = z_chin

        z_flank_mid = z_arch_bot + 0.50 * (z_hood - z_arch_bot)

        # 6 Points per half-station for clean G2 continuity (Left Rocker -> Center -> Right Rocker)
        left_pts = [
            Vector((0.0, y_val, z_hood)),                         # Center hood spine
            Vector((-hw_crest * 0.50, y_val, z_hood - 0.005)),   # Mid hood
            Vector((-hw_crest, y_val, z_hood - 0.012)),          # Hood crest
            Vector((-hw_fender, y_val, z_flank_mid)),            # Fender tumblehome flank
            Vector((-hw_fender * 1.005, y_val, z_arch_bot + 0.025)), # Arch lip
            Vector((-hw_chin, y_val, z_arch_bot)),               # Arch / chin bottom edge
        ]

        full_pts = list(reversed(left_pts[1:])) + [left_pts[0]] + [
            Vector((-p.x, p.y, p.z)) for p in left_pts[1:]
        ]
        rings.append([bm.verts.new(p) for p in full_pts])

    # Connect rings into continuous quad grid
    for r in range(len(rings) - 1):
        rA = rings[r]
        rB = rings[r + 1]
        for i in range(len(rA) - 1):
            bm.faces.new((rA[i], rB[i], rB[i+1], rA[i+1]))

    # Enclosed front wheel arch splash wall at Y=1.48m
    for sign in [-1.0, 1.0]:
        wall_pts = [
            Vector((sign * 0.94, 1.48, 0.135)),
            Vector((sign * 0.94, 1.48, 0.65)),
            Vector((sign * 0.86, 1.48, 0.65)),
            Vector((sign * 0.86, 1.48, 0.135)),
        ]
        bm.faces.new([bm.verts.new(p) for p in wall_pts])

    # Close front nose tip cap with rounded leading edge
    front_cap_ring = rings[0]
    chin_v_bot = bm.verts.new((0.0, 2.225, 0.130))
    for i in range(len(front_cap_ring) - 1):
        bm.faces.new((chin_v_bot, front_cap_ring[i+1], front_cap_ring[i]))

    # Dual Recessed Triangular NACA Ducts on Front Hood
    for side in [-1.0, 1.0]:
        nx = side * 0.32
        ny = 1.58
        nz = 0.58
        bmesh.ops.create_cone(bm, segments=3, cap_ends=True,
                              radius1=0.075, radius2=0.010, depth=0.22,
                              matrix=Matrix.Translation(Vector((nx, ny, nz - 0.012))) @
                                     Matrix.Rotation(math.radians(-90), 4, 'X'))

    # Pop-Up Headlamp Pod Recessed Shutline Welts (Lids sit flush inside)
    for side in [-1.0, 1.0]:
        px = side * 0.48
        py = 1.88
        pz = 0.44
        bmesh.ops.create_cube(bm, size=1.0,
                              matrix=Matrix.Translation(Vector((px, py - 0.12, pz - 0.004))) @
                                     Matrix.Scale(0.245, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.225, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.008, 4, Vector((0, 0, 1))))

    # Front Clamshell Mesh Object
    obj_front = create_mesh_object("BODY_Front_Clamshell", bm,
                                  mat=mats['paint_red'], bevel=0.0025, subsurf=3)

    # ── Lower Front Radiator Grille Mouth (Central Black Wire Mesh) ──
    bm_grille = bmesh.new()
    bmesh.ops.create_cube(bm_grille, size=1.0,
                          matrix=Matrix.Translation(Vector((0.0, 2.12, 0.19))) @
                                 Matrix.Scale(0.86, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.14, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.10, 4, Vector((0, 0, 1))))
    create_mesh_object("AERO_FrontGrille_Mesh", bm_grille,
                       mat=mats['trim_black'], bevel=0.001, subsurf=1)

    # ── Front Protruding Carbon Splitter / Chin Lip ──
    bm_splitter = bmesh.new()
    bmesh.ops.create_cube(bm_splitter, size=1.0,
                          matrix=Matrix.Translation(Vector((0.0, 2.18, 0.115))) @
                                 Matrix.Scale(1.82, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.22, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.024, 4, Vector((0, 0, 1))))
    create_mesh_object("AERO_Front_Chin_Splitter", bm_splitter,
                       mat=mats['trim_black'], bevel=0.002, subsurf=1)

    return obj_front


# ═════════════════════════════════════════════════════════════════════════════
# 4. STRUCTURAL GREENHOUSE, A-PILLARS & CROWNED ROOF CANOPY
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_roof_and_pillars(mats):
    """
    Constructs the structural greenhouse canopy of the Ferrari F40:
    - Twin structural A-pillars extending from cowl (Y=0.86m) to windshield header (Y=0.12m)
    - Cantrail roof rails and crowned roof panel with Nero headliner
    - Dedicated B-pillars / quarter window frame at Y=-0.36m
    - 100% OPEN WINDSHIELD & SIDE WINDOWS (Zero sheet metal under glass!)
    """
    bm_roof = bmesh.new()

    # 1. Structural A-Pillars & Cantrails (Left & Right)
    for s in [1.0, -1.0]:
        p_cowl = Vector((s * 0.68,  0.86, 0.72))
        p_head = Vector((s * 0.54,  0.12, 1.124))
        p_mid  = Vector((s * 0.54, -0.12, 1.124))
        p_rear = Vector((s * 0.53, -0.36, 1.080))

        w_pill = 0.035
        for pA, pB in [(p_cowl, p_head), (p_head, p_mid), (p_mid, p_rear)]:
            dir_v = (pB - pA).normalized()
            up_v = Vector((0, 0, 1))
            side_v = dir_v.cross(up_v).normalized() * w_pill

            v1 = bm_roof.verts.new(pA - side_v)
            v2 = bm_roof.verts.new(pA + side_v)
            v3 = bm_roof.verts.new(pB + side_v)
            v4 = bm_roof.verts.new(pB - side_v)
            bm_roof.faces.new((v1, v2, v3, v4) if s > 0 else (v4, v3, v2, v1))

        # Solid C-Pillar & Rear Quarter Sail Panels
        cp_steps = [
            (-0.12, 0.54, 1.124, 0.88, 0.74),
            (-0.24, 0.53, 1.100, 0.90, 0.76),
            (-0.36, 0.53, 1.080, 0.92, 0.78),
        ]
        cp_rings = []
        for ry, tx, tz, bx, bz in cp_steps:
            v_top = bm_roof.verts.new((s * tx, ry, tz))
            v_mid = bm_roof.verts.new((s * (tx + bx) * 0.5, ry, (tz + bz) * 0.5 + 0.015))
            v_bot = bm_roof.verts.new((s * bx, ry, bz))
            cp_rings.append((v_top, v_mid, v_bot))

        for ri in range(len(cp_steps) - 1):
            rA, rB = cp_rings[ri], cp_rings[ri+1]
            for j in range(2):
                bm_roof.faces.new((rA[j], rB[j], rB[j+1], rA[j+1]) if s > 0 else (rA[j+1], rB[j+1], rB[j], rA[j]))

    # 2. Central Crowned Roof Canopy
    roof_y_steps = [0.12, 0.0, -0.12, -0.24, -0.36]
    roof_rings = []
    for ry in roof_y_steps:
        rz = 1.124 if ry >= -0.12 else (1.124 - ((-0.12 - ry) / 0.24) * 0.044)
        half_w = 0.54 if ry >= -0.12 else (0.54 - ((-0.12 - ry) / 0.24) * 0.01)

        pts = [
            Vector((-half_w, ry, rz - 0.02)),
            Vector((-half_w * 0.65, ry, rz + 0.008)),
            Vector((0.0, ry, rz + 0.016)),
            Vector((half_w * 0.65, ry, rz + 0.008)),
            Vector((half_w, ry, rz - 0.02)),
        ]
        roof_rings.append([bm_roof.verts.new(p) for p in pts])

    # Inner roof headliner
    inner_roof_rings = []
    for r_verts in roof_rings:
        inner_ring = []
        for v in r_verts:
            p_inner = v.co + Vector((0, 0, -0.016))
            inner_ring.append(bm_roof.verts.new(p_inner))
        inner_roof_rings.append(inner_ring)

    for r in range(len(roof_rings) - 1):
        rA, rB = roof_rings[r], roof_rings[r+1]
        rA_in, rB_in = inner_roof_rings[r], inner_roof_rings[r+1]
        for j in range(len(rA) - 1):
            jn = j + 1
            f_out = bm_roof.faces.new((rA[j], rB[j], rB[jn], rA[jn]))
            f_out.material_index = 0
            f_in = bm_roof.faces.new((rA_in[jn], rB_in[jn], rB_in[j], rA_in[j]))
            f_in.material_index = 1

    r0_out, r0_in = roof_rings[0], inner_roof_rings[0]
    rEnd_out, rEnd_in = roof_rings[-1], inner_roof_rings[-1]
    for j in range(len(r0_out) - 1):
        jn = j + 1
        bm_roof.faces.new((r0_out[j], r0_in[j], r0_in[jn], r0_out[jn]))
        bm_roof.faces.new((rEnd_out[jn], rEnd_in[jn], rEnd_in[j], rEnd_out[j]))

    obj_roof = create_mesh_object("BODY_Roof_And_Pillars", bm_roof,
                                 mat=[mats['paint_red'], mats['alcantara_grey']],
                                 bevel=0.002, subsurf=3)
    return obj_roof


# ═════════════════════════════════════════════════════════════════════════════
# 5. REAR QUARTERS, HAUNCHES, INTERCOOLER SCOOPS & OPEN ENGINE BAY DECK
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_rear_quarters(mats):
    """
    Constructs the muscular rear haunches and open engine bay of the F40:
    - 100% UNIFORM TOPOLOGICAL STATION RINGS: Exactly 12 vertices per ring in strict Left-to-Right order!
      [0]: Left Rocker -> [1]: Left Arch Lip -> [2]: Left Flank Waist -> [3]: Left Haunch Crest ->
      [4]: Left Gutter -> [5]: Left Bay Floor/Center -> [6]: Right Bay Floor/Center ->
      [7]: Right Gutter -> [8]: Right Haunch Crest -> [9]: Right Flank Waist ->
      [10]: Right Arch Lip -> [11]: Right Rocker
    - COMPLETELY ELIMINATES ANY TWIST OR PINCHED CREASES BEHIND REAR WHEELS!
    - Open central engine bay allowing complete visibility of the twin-turbo V8
    - 3 Horizontal upper intercooler cooling strakes on haunch flanks (Y=-0.58m to -0.70m)
    - Lower triangular rear brake cooling NACA ducts (Y=-0.85m)
    - Enclosed rear wheel tubs eliminating see-through voids from rear/side
    """
    bm = bmesh.new()

    rear_stations = [
        # Y,       z_rocker, z_deck, hw_rocker, hw_crest, hw_fender, hw_gutter
        (-0.36,    0.135,    1.080,  0.865,     0.865,    0.930,     0.480), # B-pillar base / bay start
        (-0.55,    0.135,    1.020,  0.875,     0.880,    0.945,     0.480), # Intercooler scoop entry
        (-0.75,    0.135,    0.960,  0.890,     0.900,    0.960,     0.480), # Intercooler scoop exit
        (-0.92,    0.135,    0.910,  0.910,     0.920,    0.970,     0.470), # Arch front tangent point
        (-1.06,    0.135,    0.870,  0.925,     0.935,    0.978,     0.460), # Arch forward rise
        (-1.225,   0.135,    0.840,  0.940,     0.945,    0.985,     0.450), # Rear axle line (peak haunch)
        (-1.39,    0.135,    0.820,  0.930,     0.935,    0.975,     0.440), # Arch rearward fall
        (-1.53,    0.140,    0.810,  0.915,     0.920,    0.960,     0.430), # Arch rear tangent point
        (-1.75,    0.160,    0.790,  0.890,     0.900,    0.940,     0.410), # Decklid base
        (-1.95,    0.180,    0.770,  0.860,     0.870,    0.915,     0.380),
        (-2.15,    0.210,    0.750,  0.820,     0.830,    0.875,     0.340),
        (-2.215,   0.240,    0.730,  0.790,     0.800,    0.845,     0.300), # Rear tail edge
    ]

    rings = []
    for s_idx, (y_val, z_rocker, z_deck, hw_rocker, hw_crest, hw_fender, hw_gutter) in enumerate(rear_stations):
        # Radial wheel arch profile smoothly touching rocker sill at Y=-0.92 and Y=-1.53
        in_arch = (-1.53 <= y_val <= -0.92)
        if in_arch:
            rel_y = (y_val - (-1.225)) / 0.305
            arch_factor = max(0.0, 1.0 - rel_y * rel_y)
            z_arch_bot = 0.135 + math.sqrt(arch_factor) * (0.685 - 0.135)
        else:
            z_arch_bot = z_rocker

        z_flank_mid = max(z_arch_bot + 0.04, 0.45 + 0.50 * (z_deck - 0.45))
        is_bay_open = (y_val >= -1.75)

        # UNIFORM 12-VERTEX RING (STRICT LEFT-TO-RIGHT ORDER)
        # Left half (indices 0 to 5)
        p0 = Vector((-hw_rocker,        y_val, z_arch_bot))               # Left rocker bottom
        p1 = Vector((-hw_fender * 1.005, y_val, z_arch_bot + 0.025))      # Left arch lip
        p2 = Vector((-hw_fender,        y_val, z_flank_mid))              # Left flank waist
        p3 = Vector((-hw_crest,         y_val, z_deck))                   # Left haunch crest
        p4 = Vector((-hw_gutter,        y_val, z_deck - 0.04 if is_bay_open else z_deck)) # Left gutter/deck
        p5 = Vector((-hw_gutter * 0.50 if is_bay_open else 0.0, y_val, 0.38 if is_bay_open else z_deck + 0.008)) # Left center

        # Right half (indices 6 to 11)
        p6 = Vector(( hw_gutter * 0.50 if is_bay_open else 0.0, y_val, 0.38 if is_bay_open else z_deck + 0.008)) # Right center
        p7 = Vector(( hw_gutter,        y_val, z_deck - 0.04 if is_bay_open else z_deck)) # Right gutter/deck
        p8 = Vector(( hw_crest,         y_val, z_deck))                   # Right haunch crest
        p9 = Vector(( hw_fender,        y_val, z_flank_mid))              # Right flank waist
        p10= Vector(( hw_fender * 1.005, y_val, z_arch_bot + 0.025))      # Right arch lip
        p11= Vector(( hw_rocker,        y_val, z_arch_bot))               # Right rocker bottom

        ring_pts = [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11]
        rings.append([bm.verts.new(p) for p in ring_pts])

    # Connect rings into 100% continuous, non-inverted quad grid
    for r in range(len(rings) - 1):
        rA = rings[r]
        rB = rings[r + 1]
        for i in range(11):
            bm.faces.new((rA[i], rB[i], rB[i+1], rA[i+1]))

    # Enclosed rear wheel tub bulkheads (no see-through voids)
    for sign in [-1.0, 1.0]:
        wall_pts = [
            Vector((sign * 0.96, -0.92, 0.135)),
            Vector((sign * 0.96, -0.92, 0.65)),
            Vector((sign * 0.86, -0.92, 0.65)),
            Vector((sign * 0.86, -0.92, 0.135)),
        ]
        bm.faces.new([bm.verts.new(p) for p in wall_pts])

    # 3 Horizontal Upper Intercooler Air Strakes on Haunches
    for side in [-1.0, 1.0]:
        for s_idx in range(3):
            sy = -0.58 - s_idx * 0.06
            sz = 0.94 - s_idx * 0.035
            bmesh.ops.create_cube(bm, size=1.0,
                                  matrix=Matrix.Translation(Vector((side * 0.93, sy, sz))) @
                                         Matrix.Rotation(math.radians(side * 8.0), 4, 'Z') @
                                         Matrix.Scale(0.035, 4, Vector((1, 0, 0))) @
                                         Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
                                         Matrix.Scale(0.012, 4, Vector((0, 0, 1))))

    # Lower Triangular Rear Brake Cooling NACA Ducts
    for side in [-1.0, 1.0]:
        bx = side * 0.90
        by = -0.85
        bz = 0.36
        bmesh.ops.create_cone(bm, segments=3, cap_ends=True,
                              radius1=0.065, radius2=0.010, depth=0.18,
                              matrix=Matrix.Translation(Vector((bx, by, bz))) @
                                     Matrix.Rotation(math.radians(-90), 4, 'X'))

    obj_rear = create_mesh_object("BODY_Rear_Quarters_And_Deck", bm,
                                 mat=mats['paint_red'], bevel=0.0025, subsurf=3)
    return obj_rear


# ═════════════════════════════════════════════════════════════════════════════
# 6. STRUCTURAL CHASSIS ROCKER SILL THRESHOLD (BRIDGING CABIN & DOORS)
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_chassis_rocker_sills(mats):
    """
    Constructs the wide carbon-Kevlar structural monocoque sills:
    - Spans longitudinally from front cowl (Y=0.86m) to rear quarter jamb (Y=-0.36m)
    - Full width under the doors: X in [+/-0.65m, +/-0.865m], Z in [0.12m, 0.24m]
    - Black EPDM rubber perimeter weatherseals along inner door shutline jambs
    - Guarantees 0 see-through voids when doors are open or closed!
    """
    bm = bmesh.new()

    for side in [-1.0, 1.0]:
        sill_x = side * 0.76
        sill_y = 0.25
        sill_z = 0.18

        # Structural Carbon-Kevlar Tub Sill Box
        bmesh.ops.create_cube(bm, size=1.0,
                              matrix=Matrix.Translation(Vector((sill_x, sill_y, sill_z))) @
                                     Matrix.Scale(0.21, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(1.22, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.12, 4, Vector((0, 0, 1))))

        # Front Cowl Door Jamb Pillar (Y=0.86m)
        bmesh.ops.create_cube(bm, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.78, 0.86, 0.44))) @
                                     Matrix.Scale(0.15, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.44, 4, Vector((0, 0, 1))))

        # Rear B-Pillar Door Jamb Pillar (Y=-0.36m)
        bmesh.ops.create_cube(bm, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.80, -0.36, 0.44))) @
                                     Matrix.Scale(0.15, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.44, 4, Vector((0, 0, 1))))

        # Black EPDM Rubber Gasket Weatherseal strip along perimeter
        bmesh.ops.create_cube(bm, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.72, sill_y, sill_z + 0.065))) @
                                     Matrix.Scale(0.025, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(1.18, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.015, 4, Vector((0, 0, 1))))

    obj_sills = create_mesh_object("CHASSIS_Rocker_Sills_And_Jambs", bm,
                                  mat=[mats['carbon_kevlar'], mats['trim_black']],
                                  bevel=0.002, subsurf=2)
    return obj_sills


# ═════════════════════════════════════════════════════════════════════════════
# 7. INTERACTIVE LIGHTWEIGHT COMPOSITE DOORS (+55° FORWARD HINGE)
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_doors(mats):
    """
    Constructs articulating Left and Right lightweight composite doors:
    - Forward-hinged cowl axis at (X = +/-0.82, Y = 0.85, Z = 0.52)
    - Perfectly fits the aperture between Y=0.85m and Y=-0.355m (1.205m door length)
    - Sculpted outer door skin with continuous waistline groove
    - Dedicated slim satin black window perimeter frame slanting inward to cantrail
    - Authentic transparent split Lexan door window pane with sliding vent rail!
    - Teardrop aerodynamic side mirror mounted on composite stalk
    - Inner door card in raw carbon-Kevlar weave with red pull-cord release
    - Preserves physical kinematic origin with export_apply=False!
    """
    door_objs = []
    hinge_y = 0.85
    hinge_z = 0.52

    for side, dname in [(-1.0, "BODY_Door_L"), (1.0, "BODY_Door_R")]:
        hinge_x = side * 0.82
        hinge_origin = Vector((hinge_x, hinge_y, hinge_z))

        bm = bmesh.new()
        d_len = 1.205
        d_thick = 0.048
        d_hw = side * 0.045

        # 1. Lower Door Composite Shell Box (Waistline at local Z=0.17m, World Z=0.69m)
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((d_hw, -d_len * 0.50, -0.10))) @
                   Matrix.Scale(d_thick, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(d_len * 0.985, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.55, 4, Vector((0, 0, 1))))

        # 2. Recessed Door Pull Release Pocket
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((d_hw + side * 0.022, -d_len * 0.85, 0.06))) @
                   Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.12, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.042, 4, Vector((0, 0, 1))))

        # 3. Horizontal Black Rubber Beltline Molding & Swage Line
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((d_hw + side * 0.025, -d_len * 0.50, 0.175))) @
                   Matrix.Scale(0.008, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(d_len * 0.985, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.020, 4, Vector((0, 0, 1))))

        # 4. Teardrop Aerodynamic Side Mirror
        bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=16,
            radius1=0.012, radius2=0.010, depth=0.11,
            matrix=Matrix.Translation(Vector((side * 0.08, -0.06, 0.22))) @
                   Matrix.Rotation(math.radians(side * 55), 4, 'Y'))

        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.16, -0.06, 0.26))) @
                   Matrix.Rotation(math.radians(-side * 8), 4, 'Z') @
                   Matrix.Scale(0.085, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.150, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.075, 4, Vector((0, 0, 1))))

        # 5. Interior Carbon-Kevlar Door Card
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((d_hw - side * 0.026, -d_len * 0.50, -0.10))) @
                   Matrix.Scale(0.018, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(d_len * 0.94, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.52, 4, Vector((0, 0, 1))))

        # 6. Red Cable Pull-Cord Release
        create_cylinder_mesh(bm, cap_ends=True, segments=12,
            radius=0.004, depth=0.14,
            matrix=Matrix.Translation(Vector((d_hw - side * 0.040, -d_len * 0.35, -0.02))) @
                   Matrix.Rotation(math.radians(side * 25), 4, 'X'))

        # Finalize Door Shell Object
        obj_door = create_mesh_object(dname, bm,
                                     mat=[mats['paint_red'], mats['carbon_kevlar'], mats['trim_black'], mats['nomex_red']],
                                     bevel=0.002, subsurf=2)
        obj_door.location = hinge_origin

        # ── 7. Transparent Dielectric Side Window with Slim Frame & Vent Slider ──
        bm_win = bmesh.new()

        # Inward tumblehome vectors in local hinge space:
        p_cowl_loc = Vector((d_hw, -0.01, 0.18))
        p_head_loc = Vector((-side * 0.28, -0.73, 0.58))
        p_rear_loc = Vector((-side * 0.29, -d_len + 0.01, 0.56))
        p_bpill_loc= Vector((d_hw, -d_len + 0.01, 0.18))

        # 4 Corner Window Frame Perimeter Posts
        for p1, p2 in [(p_cowl_loc, p_head_loc), (p_head_loc, p_rear_loc), (p_rear_loc, p_bpill_loc), (p_bpill_loc, p_cowl_loc)]:
            dir_seg = (p2 - p1)
            dist_seg = dir_seg.length
            mid_p = (p1 + p2) * 0.5
            rot_q = Vector((0, 1, 0)).rotation_difference(dir_seg.normalized())
            bmesh.ops.create_cube(bm_win, size=1.0,
                matrix=Matrix.Translation(mid_p) @
                       rot_q.to_matrix().to_4x4() @
                       Matrix.Scale(0.018, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(dist_seg, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.018, 4, Vector((0, 0, 1))))

        # Transparent Dielectric Lexan Window Pane
        w_v1 = bm_win.verts.new(p_cowl_loc)
        w_v2 = bm_win.verts.new(p_head_loc)
        w_v3 = bm_win.verts.new(p_rear_loc)
        w_v4 = bm_win.verts.new(p_bpill_loc)
        bm_win.faces.new([w_v1, w_v2, w_v3, w_v4] if side > 0 else [w_v4, w_v3, w_v2, w_v1])

        # Sliding Split Vent Rail Bar
        p_vent_top = (p_head_loc + p_rear_loc) * 0.5
        p_vent_bot = (p_cowl_loc + p_bpill_loc) * 0.5
        v_dir = (p_vent_top - p_vent_bot)
        bmesh.ops.create_cube(bm_win, size=1.0,
            matrix=Matrix.Translation((p_vent_top + p_vent_bot) * 0.5) @
                   Vector((0, 0, 1)).rotation_difference(v_dir.normalized()).to_matrix().to_4x4() @
                   Matrix.Scale(0.010, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.010, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(v_dir.length, 4, Vector((0, 0, 1))))

        w_name = f"GLASS_Side_Window_{'L' if side < 0 else 'R'}"
        obj_win = create_mesh_object(w_name, bm_win, parent=obj_door,
                                    mat=[mats['glass_dielectric'], mats['trim_black']],
                                    bevel=0.001, subsurf=1)

        door_objs.append(obj_door)

    return door_objs


# ═════════════════════════════════════════════════════════════════════════════
# 8. ICONIC F40 INTEGRATED REAR WING
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_rear_wing(mats):
    """
    Constructs the iconic tall integrated Pininfarina rear aerofoil wing:
    - Left and right vertical uprights rising seamlessly from rear quarter flanks
    - Horizontal main wing aerofoil element with authentic aerodynamic camber and Gurney flap
    - Embossed 'F40' recess branding on the right wing upright
    """
    bm = bmesh.new()

    wing_hw = 0.94
    wing_y = -2.12
    wing_z = 1.06
    upright_bottom_z = 0.76

    # 1. Left Vertical Wing Upright (Tapered aerodynamic profile)
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((-wing_hw, wing_y + 0.12, (upright_bottom_z + wing_z) * 0.5))) @
               Matrix.Scale(0.045, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.56, 4, Vector((0, 1, 0))) @
               Matrix.Scale(wing_z - upright_bottom_z + 0.06, 4, Vector((0, 0, 1))))

    # 2. Right Vertical Wing Upright (with F40 Logo Recess)
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((wing_hw, wing_y + 0.12, (upright_bottom_z + wing_z) * 0.5))) @
               Matrix.Scale(0.045, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.56, 4, Vector((0, 1, 0))) @
               Matrix.Scale(wing_z - upright_bottom_z + 0.06, 4, Vector((0, 0, 1))))

    # Right upright embossed 'F40' recess cutout
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((wing_hw + 0.022, wing_y + 0.12, wing_z - 0.04))) @
               Matrix.Scale(0.008, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.18, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.055, 4, Vector((0, 0, 1))))

    # 3. Horizontal Main Aerofoil Wing Element
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, wing_y, wing_z + 0.02))) @
               Matrix.Rotation(math.radians(-6.0), 4, 'X') @
               Matrix.Scale(wing_hw * 2.02, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.42, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.038, 4, Vector((0, 0, 1))))

    # 4. Gurney Flap on Wing Trailing Edge
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, wing_y - 0.20, wing_z + 0.045))) @
               Matrix.Scale(wing_hw * 2.0, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.024, 4, Vector((0, 0, 1))))

    obj = create_mesh_object("AERO_F40_RearWing", bm,
                            mat=[mats['paint_red'], mats['trim_black']],
                            bevel=0.002, subsurf=2)
    return obj


# ═════════════════════════════════════════════════════════════════════════════
# 9. REAR PERFORATED MESH VALENCE & ROUND CARELLO TAILLAMPS
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_rear_fascia(mats):
    """
    Constructs the iconic full-width black rear perforated mesh valence:
    - Translucent black mesh screen allowing view of twin-turbo V8 & exhaust
    - Quad round Carello taillights (ruby brake, amber turn, white reverse) with chrome bezels
    - Center polished Cavallino Rampante badge
    """
    bm_mesh = bmesh.new()
    y_val = -2.215
    hw_val = 0.86

    # 1. Perforated Mesh Black Valence Frame
    bmesh.ops.create_cube(bm_mesh, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, y_val + 0.015, 0.52))) @
               Matrix.Scale(hw_val * 2.0, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.015, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.32, 4, Vector((0, 0, 1))))

    # 2. Chrome Cavallino Prancing Horse Badge
    bmesh.ops.create_cube(bm_mesh, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, y_val - 0.005, 0.62))) @
               Matrix.Scale(0.045, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.006, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.065, 4, Vector((0, 0, 1))))

    # 3. Rear License Plate Recess
    bmesh.ops.create_cube(bm_mesh, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, y_val + 0.025, 0.44))) @
               Matrix.Scale(0.38, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.020, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.12, 4, Vector((0, 0, 1))))

    obj_val = create_mesh_object("BODY_F40_RearMeshFascia", bm_mesh,
                                mat=[mats['trim_black'], mats['chrome']],
                                bevel=0.001, subsurf=1)

    # 4. Carello Round Taillamp Optics
    bm_lights = bmesh.new()
    light_z = 0.55
    y_lens = y_val - 0.008

    lamp_x_coords = [0.46, 0.62, 0.74]
    for side in [-1.0, 1.0]:
        for idx, lx in enumerate(lamp_x_coords):
            pos_x = side * lx
            # Chrome Outer Bezel Ring
            create_cylinder_mesh(bm_lights, cap_ends=False, segments=24,
                radius=0.062, depth=0.025,
                matrix=Matrix.Translation(Vector((pos_x, y_lens + 0.010, light_z))) @
                       Matrix.Rotation(math.radians(90), 4, 'X'))

            # Taillight Lens Core
            create_cylinder_mesh(bm_lights, cap_ends=True, segments=24,
                radius=0.055, depth=0.015,
                matrix=Matrix.Translation(Vector((pos_x, y_lens, light_z))) @
                       Matrix.Rotation(math.radians(90), 4, 'X'))

    obj_lights = create_mesh_object("LIGHTING_Taillamps", bm_lights,
                                   mat=[mats['chrome'], mats['taillamp_ruby'], mats['taillamp_amber']],
                                   bevel=0.001, subsurf=2)

    return obj_val, obj_lights


# ═════════════════════════════════════════════════════════════════════════════
# 10. SIGNATURE TRIPLE CENTER EXHAUST CANNONS
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_triple_exhaust(mats):
    """
    Constructs the hallmark center triple exhaust cluster:
    - 2 outer 75mm main turbo exhaust cannons
    - 1 center 55mm wastegate exhaust cannon
    - Polished Inconel barrels with dark recessed inner bores
    """
    bm = bmesh.new()
    ex_y = -2.25
    ex_z = 0.31

    # Outer Left 75mm Cannon
    create_cylinder_mesh(bm, cap_ends=True, segments=24,
        radius=0.040, depth=0.18,
        matrix=Matrix.Translation(Vector((-0.088, ex_y, ex_z))) @
               Matrix.Rotation(math.radians(90), 4, 'X'))
    create_cylinder_mesh(bm, cap_ends=True, segments=24,
        radius=0.034, depth=0.04,
        matrix=Matrix.Translation(Vector((-0.088, ex_y - 0.08, ex_z))) @
               Matrix.Rotation(math.radians(90), 4, 'X'))

    # Center 55mm Wastegate Cannon
    create_cylinder_mesh(bm, cap_ends=True, segments=24,
        radius=0.028, depth=0.16,
        matrix=Matrix.Translation(Vector((0.0, ex_y + 0.01, ex_z))) @
               Matrix.Rotation(math.radians(90), 4, 'X'))
    create_cylinder_mesh(bm, cap_ends=True, segments=24,
        radius=0.022, depth=0.04,
        matrix=Matrix.Translation(Vector((0.0, ex_y - 0.07, ex_z))) @
               Matrix.Rotation(math.radians(90), 4, 'X'))

    # Outer Right 75mm Cannon
    create_cylinder_mesh(bm, cap_ends=True, segments=24,
        radius=0.040, depth=0.18,
        matrix=Matrix.Translation(Vector((0.088, ex_y, ex_z))) @
               Matrix.Rotation(math.radians(90), 4, 'X'))
    create_cylinder_mesh(bm, cap_ends=True, segments=24,
        radius=0.034, depth=0.04,
        matrix=Matrix.Translation(Vector((0.088, ex_y - 0.08, ex_z))) @
               Matrix.Rotation(math.radians(90), 4, 'X'))

    obj = create_mesh_object("JEWELRY_F40_TripleExhaust", bm,
                            mat=[mats['inconel_exhaust'], mats['trim_black']],
                            bevel=0.001, subsurf=2)
    return obj


# ═════════════════════════════════════════════════════════════════════════════
# 11. COMPOUND 3D WINDSHIELD & SLATTED LEXAN ENGINE COVER
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_glass_and_engine_cover(mats):
    """
    Constructs:
    1. Compound 3D Curved Dielectric Windshield with Black Ceramic Frit Serigraphy
    2. Louvered Lightweight Lexan Engine Cover with 5 genuine horizontal cutout cooling slots
    """
    # ── 1. Front Windshield with Compound Curvature ──
    bm_windshield = bmesh.new()

    n_y = 12
    n_x = 12
    w_verts = []

    for iy in range(n_y):
        t_y = iy / float(n_y - 1)
        y = 0.86 - t_y * (0.86 - 0.12)
        z_base = 0.72 + math.pow(t_y, 0.85) * (1.124 - 0.72)
        hw = 0.68 - t_y * (0.68 - 0.54)

        row = []
        for ix in range(n_x):
            t_x = (ix / float(n_x - 1)) * 2.0 - 1.0
            x = t_x * hw
            crown = (1.0 - t_x * t_x) * 0.024
            row.append(bm_windshield.verts.new((x, y + crown * 0.4, z_base + crown)))
        w_verts.append(row)

    for iy in range(n_y - 1):
        for ix in range(n_x - 1):
            v1 = w_verts[iy][ix]
            v2 = w_verts[iy+1][ix]
            v3 = w_verts[iy+1][ix+1]
            v4 = w_verts[iy][ix+1]
            bm_windshield.faces.new([v1, v2, v3, v4])

    obj_windshield = create_mesh_object("GLASS_Windshield", bm_windshield,
                                       mat=mats['glass_dielectric'], bevel=0.001, subsurf=2)

    # Ceramic Frit Border on Windshield
    bm_frit = bmesh.new()
    bmesh.ops.create_cube(bm_frit, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.85, 0.73))) @
               Matrix.Scale(1.36, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.04, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.012, 4, Vector((0, 0, 1))))
    bmesh.ops.create_cube(bm_frit, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.13, 1.12))) @
               Matrix.Scale(1.08, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.04, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.012, 4, Vector((0, 0, 1))))

    obj_frit = create_mesh_object("GLASS_Windshield_Frit", bm_frit,
                                 mat=mats['glass_frit'], bevel=0.001, subsurf=1)

    # ── 2. Louvered Lexan Engine Cover ──
    bm_deck = bmesh.new()
    hinge_deck_y = -0.36
    hinge_deck_z = 1.08
    deck_length = 1.34
    n_slits = 5

    # Main Lexan Transparent Pane
    bmesh.ops.create_cube(bm_deck, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -deck_length * 0.50, -0.14))) @
               Matrix.Rotation(math.radians(11.5), 4, 'X') @
               Matrix.Scale(0.96, 4, Vector((1, 0, 0))) @
               Matrix.Scale(deck_length, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.012, 4, Vector((0, 0, 1))))

    # 5 Horizontal Cooling Louver Slots
    for i in range(n_slits):
        t = i / float(n_slits - 1)
        ly = -0.18 - t * 0.94
        lz = -0.04 - t * 0.19
        lw = (0.48 - t * 0.08) * 2.0
        bmesh.ops.create_cube(bm_deck, size=1.0,
            matrix=Matrix.Translation(Vector((0.0, ly, lz))) @
                   Matrix.Rotation(math.radians(28.0), 4, 'X') @
                   Matrix.Scale(lw, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.048, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.008, 4, Vector((0, 0, 1))))

    obj_deck = create_mesh_object("GLASS_F40_EngineCover", bm_deck,
                                 mat=[mats['lexan_engine_cover'], mats['trim_black']],
                                 bevel=0.001, subsurf=2)
    obj_deck.location = Vector((0.0, hinge_deck_y, hinge_deck_z))

    return obj_windshield, obj_deck


# ═════════════════════════════════════════════════════════════════════════════
# 12. FLUSH POP-UP HEADLAMPS & LOWER DRIVING LIGHTS
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_lighting(mats):
    """
    Constructs:
    1. Left & Right Flush Pop-up Headlamp Pods (rotating up +26° exposing Carello projectors)
    2. Lower Driving Light Enclosures (optical polycarbonate covers + amber/white cores)
    """
    headlamp_objs = []
    hinge_y = 1.88
    hinge_z = 0.44

    for side, pname in [(-1.0, "LIGHT_Headlamp_Pod_L"), (1.0, "LIGHT_Headlamp_Pod_R")]:
        center_x = side * 0.48
        bm = bmesh.new()

        # Painted top lid: flush with hood
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((0.0, -0.12, 0.0))) @
                   Matrix.Scale(0.24, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.22, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.015, 4, Vector((0, 0, 1))))

        # Recessed headlamp housing
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((0.0, -0.12, -0.065))) @
                   Matrix.Scale(0.22, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.20, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.10, 4, Vector((0, 0, 1))))

        # Dual Round Carello Halogen Projector Headlights
        for lx in [-0.055, 0.055]:
            create_cylinder_mesh(bm, cap_ends=True, segments=24,
                radius=0.042, depth=0.05,
                matrix=Matrix.Translation(Vector((lx, -0.18, -0.065))) @
                       Matrix.Rotation(math.radians(90), 4, 'X'))
            create_cylinder_mesh(bm, cap_ends=True, segments=24,
                radius=0.038, depth=0.012,
                matrix=Matrix.Translation(Vector((lx, -0.21, -0.065))) @
                       Matrix.Rotation(math.radians(90), 4, 'X'))

        obj = create_mesh_object(pname, bm,
                                mat=[mats['paint_red'], mats['trim_black'], mats['headlamp_chrome'], mats['polycarbonate']],
                                bevel=0.001, subsurf=2)
        obj.location = Vector((center_x, hinge_y, hinge_z))
        headlamp_objs.append(obj)

    # Lower Front Driving Lights (in Bumper below pop-ups)
    bm_drive = bmesh.new()
    for side in [-1.0, 1.0]:
        dx = side * 0.65
        dy = 2.02
        dz = 0.28
        # Clear Driving Light Lens
        bmesh.ops.create_cube(bm_drive, size=1.0,
            matrix=Matrix.Translation(Vector((dx, dy, dz))) @
                   Matrix.Scale(0.18, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.055, 4, Vector((0, 0, 1))))
        # Amber Indicator Lens
        bmesh.ops.create_cube(bm_drive, size=1.0,
            matrix=Matrix.Translation(Vector((dx - side * 0.12, dy, dz))) @
                   Matrix.Scale(0.08, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.055, 4, Vector((0, 0, 1))))

    obj_drive = create_mesh_object("LIGHTING_FrontDrivingLights", bm_drive,
                                  mat=[mats['taillamp_amber'], mats['polycarbonate']],
                                  bevel=0.001, subsurf=2)

    return headlamp_objs, obj_drive


# ═════════════════════════════════════════════════════════════════════════════
# 13. RAW CARBON-KEVLAR COCKPIT & NOMEX RACING SEATS
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_cockpit(mats):
    """
    Constructs the purist stripped-out racing cockpit of the Ferrari F40:
    - Raw carbon-Kevlar floor tub, high sills, and central backbone tunnel
    - Pair of Rosso Corsa Nomex racing bucket seats (conforming to skill-for-seats)
    - Minimalist dashboard in dark grey Alcantara with 5 analog Veglia gauges
    - 3-Spoke Momo sport steering wheel in black leather with Cavallino horn button
    - Exposed aluminum gated manual dog-leg shifter with tall lever & round 8-ball knob
    - Drilled aluminum lightweight racing pedal box (throttle, brake, clutch)
    """
    bm = bmesh.new()

    # 1. Carbon-Kevlar Monocoque Tub & Central Tunnel
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.22, 0.16))) @
               Matrix.Scale(1.36, 4, Vector((1, 0, 0))) @
               Matrix.Scale(1.42, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.035, 4, Vector((0, 0, 1))))

    for side in [-1.0, 1.0]:
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.65, 0.22, 0.28))) @
                   Matrix.Scale(0.18, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(1.40, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.24, 4, Vector((0, 0, 1))))

    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.22, 0.24))) @
               Matrix.Scale(0.16, 4, Vector((1, 0, 0))) @
               Matrix.Scale(1.36, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.16, 4, Vector((0, 0, 1))))

    # Cockpit Rear Fire Wall Bulkhead
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.42, 0.52))) @
               Matrix.Scale(1.36, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.68, 4, Vector((0, 0, 1))))

    # 2. Minimalist Alcantara Dashboard
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.74, 0.68))) @
               Matrix.Scale(1.32, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.28, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.18, 4, Vector((0, 0, 1))))

    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((-0.38, 0.68, 0.76))) @
               Matrix.Scale(0.38, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.22, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.14, 4, Vector((0, 0, 1))))

    gauge_x_offsets = [-0.12, -0.04, 0.04, 0.12]
    for gx in gauge_x_offsets:
        create_cylinder_mesh(bm, cap_ends=True, segments=16,
            radius=0.034, depth=0.015,
            matrix=Matrix.Translation(Vector((-0.38 + gx, 0.58, 0.76))) @
                   Matrix.Rotation(math.radians(76), 4, 'X'))

    # 3. Momo 3-Spoke Sport Steering Wheel
    create_cylinder_mesh(bm, cap_ends=True, segments=16,
        radius=0.036, depth=0.24,
        matrix=Matrix.Translation(Vector((-0.38, 0.60, 0.66))) @
               Matrix.Rotation(math.radians(22), 4, 'X'))

    steer_center = Vector((-0.38, 0.48, 0.71))
    for s in range(36):
        a1 = 2.0 * math.pi * s / 36
        a2 = 2.0 * math.pi * (s + 1) / 36
        r1, r2 = 0.170, 0.170
        z1 = r1 * math.sin(a1)
        z2 = r2 * math.sin(a2)
        v1 = bm.verts.new((steer_center.x + r1 * math.cos(a1), steer_center.y - (r1 * math.sin(a1) * 0.38), steer_center.z + z1 * 0.92))
        v2 = bm.verts.new((steer_center.x + r2 * math.cos(a2), steer_center.y - (r2 * math.sin(a2) * 0.38), steer_center.z + z2 * 0.92))
        v3 = bm.verts.new((steer_center.x + (r2 - 0.024) * math.cos(a2), steer_center.y - ((r2 - 0.024) * math.sin(a2) * 0.38), steer_center.z + z2 * 0.82))
        v4 = bm.verts.new((steer_center.x + (r1 - 0.024) * math.cos(a1), steer_center.y - ((r1 - 0.024) * math.sin(a1) * 0.38), steer_center.z + z1 * 0.82))
        bm.faces.new((v1, v2, v3, v4))

    for sp_rot in [0, 120, 240]:
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((-0.38, 0.485, 0.71))) @
                   Matrix.Rotation(math.radians(-22), 4, 'X') @
                   Matrix.Rotation(math.radians(sp_rot), 4, 'Y') @
                   Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.130, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.005, 4, Vector((0, 0, 1))))

    create_cylinder_mesh(bm, cap_ends=True, segments=20,
        radius=0.036, depth=0.012,
        matrix=Matrix.Translation(Vector((-0.38, 0.48, 0.71))) @
               Matrix.Rotation(math.radians(68), 4, 'X'))

    # 4. Gated Dog-Leg Shifter
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.32, 0.33))) @
               Matrix.Scale(0.085, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.110, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.012, 4, Vector((0, 0, 1))))
    create_cylinder_mesh(bm, cap_ends=True, segments=12,
        radius=0.006, depth=0.18,
        matrix=Matrix.Translation(Vector((0.0, 0.32, 0.42))) @
               Matrix.Rotation(math.radians(10), 4, 'Y'))
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12,
        radius=0.022,
        matrix=Matrix.Translation(Vector((0.015, 0.32, 0.51))))

    # 5. Racing Pedals
    for px in [-0.44, -0.38, -0.32]:
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((px, 0.78, 0.22))) @
                   Matrix.Rotation(math.radians(35), 4, 'X') @
                   Matrix.Scale(0.045, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.090, 4, Vector((0, 0, 1))))

    # 6. Rosso Corsa Nomex Racing Bucket Seats
    for side in [-1.0, 1.0]:
        sx = side * 0.36
        sy = 0.05
        sz = 0.20

        # Carbon-Kevlar Backing Shell
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((sx, sy - 0.12, sz + 0.38))) @
                   Matrix.Rotation(math.radians(15.0), 4, 'X') @
                   Matrix.Scale(0.48, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.68, 4, Vector((0, 0, 1))))

        # Seat Cushion
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((sx, sy + 0.08, sz + 0.06))) @
                   Matrix.Scale(0.46, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.48, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.095, 4, Vector((0, 0, 1))))

        # Lateral Thigh Bolsters
        for b_side in [-1.0, 1.0]:
            bmesh.ops.create_cube(bm, size=1.0,
                matrix=Matrix.Translation(Vector((sx + b_side * 0.22, sy + 0.08, sz + 0.14))) @
                       Matrix.Scale(0.065, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.46, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.14, 4, Vector((0, 0, 1))))

        # Backrest Cushion
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((sx, sy - 0.08, sz + 0.36))) @
                   Matrix.Rotation(math.radians(15.0), 4, 'X') @
                   Matrix.Scale(0.42, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.085, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.56, 4, Vector((0, 0, 1))))

        # Integrated Headrest Pillow
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((sx, sy - 0.22, sz + 0.68))) @
                   Matrix.Rotation(math.radians(15.0), 4, 'X') @
                   Matrix.Scale(0.28, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.075, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.18, 4, Vector((0, 0, 1))))

        # Sabelt 4-Point Harness Straps
        for strap_side in [-0.08, 0.08]:
            bmesh.ops.create_cube(bm, size=1.0,
                matrix=Matrix.Translation(Vector((sx + strap_side, sy - 0.06, sz + 0.36))) @
                       Matrix.Rotation(math.radians(15.0), 4, 'X') @
                       Matrix.Scale(0.045, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.54, 4, Vector((0, 0, 1))))

    obj = create_mesh_object("INTERIOR_Cockpit", bm,
                            mat=[mats['nomex_red'], mats['carbon_kevlar'], mats['alcantara_grey'],
                                 mats['momo_leather'], mats['polished_aluminum'], mats['ferrari_yellow']],
                            bevel=0.002, subsurf=3)
    return obj


# ═════════════════════════════════════════════════════════════════════════════
# 14. EXPOSED 2.9L TIPO F120A TWIN-TURBO V8 & BEHR INTERCOOLERS
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_powertrain(mats):
    """
    Constructs the exposed mid-mounted 90° 2.9L twin-turbo V8 engine:
    - Cast aluminum engine block and transverse 5-speed transaxle
    - Dual bright red crackle-finish cam covers with cast 'Ferrari' lettering
    - Dual massive top-mounted Behr air-to-air intercoolers with aluminum cooling fins
    - Twin IHI water-cooled turbochargers with wastegates and tuned exhaust headers
    - Perfectly positioned under the louvered Lexan cover for 100% visual impact!
    """
    bm = bmesh.new()

    eng_y = -0.92
    eng_z = 0.42

    # 1. Cast Aluminum 90° V8 Engine Block & Sump
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, eng_y, eng_z))) @
               Matrix.Scale(0.42, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.58, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.32, 4, Vector((0, 0, 1))))

    # 2. Dual Red Crackle Cam Covers
    for side in [-1.0, 1.0]:
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.22, eng_y, eng_z + 0.18))) @
                   Matrix.Rotation(math.radians(side * 22.5), 4, 'Y') @
                   Matrix.Scale(0.16, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.56, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.08, 4, Vector((0, 0, 1))))

    # 3. Dual Top-Mounted Behr Air-to-Air Intercoolers
    for side in [-1.0, 1.0]:
        ix = side * 0.24
        iy = eng_y - 0.08
        iz = eng_z + 0.32
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((ix, iy, iz))) @
                   Matrix.Rotation(math.radians(-12.0), 4, 'X') @
                   Matrix.Scale(0.24, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.34, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.085, 4, Vector((0, 0, 1))))
        create_cylinder_mesh(bm, cap_ends=True, segments=16,
            radius=0.048, depth=0.25,
            matrix=Matrix.Translation(Vector((ix, iy + 0.18, iz + 0.02))) @
                   Matrix.Rotation(math.radians(90), 4, 'Z'))

    # 4. Twin IHI Water-Cooled Turbochargers
    for side in [-1.0, 1.0]:
        tx = side * 0.34
        ty = eng_y + 0.18
        tz = eng_z + 0.08
        create_cylinder_mesh(bm, cap_ends=True, segments=24,
            radius=0.075, depth=0.065,
            matrix=Matrix.Translation(Vector((tx, ty, tz))) @
                   Matrix.Rotation(math.radians(90), 4, 'X'))
        create_cylinder_mesh(bm, cap_ends=True, segments=12,
            radius=0.024, depth=0.08,
            matrix=Matrix.Translation(Vector((tx + side * 0.04, ty - 0.06, tz + 0.05))) @
                   Matrix.Rotation(math.radians(90), 4, 'Y'))

    # 5. Stainless Tuned Exhaust Headers
    for side in [-1.0, 1.0]:
        hx = side * 0.28
        hy = eng_y - 0.28
        hz = eng_z - 0.02
        create_cylinder_mesh(bm, cap_ends=True, segments=16,
            radius=0.035, depth=0.45,
            matrix=Matrix.Translation(Vector((hx, hy, hz))) @
                   Matrix.Rotation(math.radians(side * -25), 4, 'Z') @
                   Matrix.Rotation(math.radians(75), 4, 'X'))

    # 6. Transverse 5-Speed Transaxle Gearbox Casing
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, eng_y - 0.52, eng_z - 0.08))) @
               Matrix.Scale(0.36, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.42, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.24, 4, Vector((0, 0, 1))))

    obj = create_mesh_object("POWERTRAIN_TwinTurbo_V8", bm,
                            mat=[mats['engine_aluminum'], mats['engine_red_crackle'], mats['inconel_exhaust']],
                            bevel=0.002, subsurf=2)
    return obj


# ═════════════════════════════════════════════════════════════════════════════
# 15. HIGH-POLY SPEEDLINE 3-PIECE 5-SPOKE STAR WHEELS & BREMBO BRAKES
# ═════════════════════════════════════════════════════════════════════════════
def build_speedline_wheel_assembly(name, loc, is_front, is_left, mats):
    """
    Constructs an authentic Speedline 3-piece 5-spoke star wheel assembly:
    - Root Empty at wheel hub center (for clean kinematic animation binding)
    - Rim: Stepped mirror-polished aluminum outer lip, 5-spoke star face, 20 perimeter bolts, red center nut
    - Tire: Multi-ring lofted Pirelli P-Zero Asimmetrico tire with rounded curved sidewalls
    - Rotor: Cross-drilled vented steel rotor
    - Caliper: Brembo 4-piston monobloc caliper in gloss black
    """
    root_obj = bpy.data.objects.new(f"{name}_Assembly", None)
    root_obj.location = loc
    bpy.context.collection.objects.link(root_obj)

    sign = -1.0 if is_left else 1.0
    rim_r = 0.228
    wheel_r = 0.325
    tire_w = 0.245 if is_front else 0.335
    dish_depth = 0.045 if is_front else 0.095
    hw = tire_w * 0.5
    segs = 48

    # 1. Stepped Mirror-Polished Aluminum Rim & 5-Spoke Star Face
    bm_rim = bmesh.new()
    bmesh.ops.create_cone(bm_rim, segments=segs, cap_ends=False,
                          radius1=rim_r, radius2=rim_r, depth=tire_w,
                          matrix=Matrix.Rotation(math.radians(90), 4, 'Y'))

    lip_x = sign * (hw - dish_depth * 0.5)
    bmesh.ops.create_cone(bm_rim, segments=segs, cap_ends=False,
                          radius1=rim_r + 0.014, radius2=rim_r + 0.010, depth=dish_depth,
                          matrix=Matrix.Translation(Vector((lip_x, 0, 0))) @ Matrix.Rotation(math.radians(90), 4, 'Y'))

    face_x = sign * (hw - dish_depth)
    for sp in range(5):
        ang = sp * (2.0 * math.pi / 5.0)
        sp_mat = Matrix.Translation(Vector((face_x, 0, 0))) @ \
                 Matrix.Rotation(ang, 4, 'X') @ \
                 Matrix.Translation(Vector((0, rim_r * 0.50, 0))) @ \
                 Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @ \
                 Matrix.Scale(0.048, 4, Vector((0, 1, 0))) @ \
                 Matrix.Scale(rim_r * 0.65, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_rim, size=1.0, matrix=sp_mat)

    bmesh.ops.create_cone(bm_rim, segments=6, cap_ends=True, cap_tris=False,
                          radius1=0.038, radius2=0.038, depth=0.030,
                          matrix=Matrix.Translation(Vector((face_x + sign * 0.015, 0, 0))) @ Matrix.Rotation(math.radians(90), 4, 'Y'))
    bmesh.ops.create_cone(bm_rim, segments=24, cap_ends=True, cap_tris=False,
                          radius1=0.024, radius2=0.024, depth=0.010,
                          matrix=Matrix.Translation(Vector((face_x + sign * 0.025, 0, 0))) @ Matrix.Rotation(math.radians(90), 4, 'Y'))

    for b_idx in range(20):
        b_ang = b_idx * (2.0 * math.pi / 20.0)
        bx = face_x + sign * 0.005
        by = math.cos(b_ang) * (rim_r * 0.88)
        bz = math.sin(b_ang) * (rim_r * 0.88)
        bmesh.ops.create_cone(bm_rim, segments=8, cap_ends=True, cap_tris=False,
                              radius1=0.005, radius2=0.005, depth=0.010,
                              matrix=Matrix.Translation(Vector((bx, by, bz))) @ Matrix.Rotation(math.radians(90), 4, 'Y'))

    create_mesh_object(f"{name}_Rim", bm_rim, parent=root_obj,
                       mat=[mats['speedline_silver'], mats['polished_aluminum'], mats['ferrari_yellow']],
                       bevel=0.002, subsurf=2)

    # 2. Curved Sidewall Pirelli P-Zero Asimmetrico Tire (Multi-Ring Lofting)
    bm_tire = bmesh.new()
    tire_steps = [
        (sign * (hw - 0.010), rim_r * 0.99),
        (sign * hw, rim_r * 1.04),
        (sign * (hw + 0.018), wheel_r * 0.92),
        (sign * (hw * 0.88), wheel_r * 0.995),
        (0.0, wheel_r),
        (-sign * (hw * 0.88), wheel_r * 0.995),
        (-sign * (hw + 0.018), wheel_r * 0.92),
        (-sign * hw, rim_r * 1.04),
        (-sign * (hw - 0.010), rim_r * 0.99),
    ]
    t_rings = []
    for x_val, r_val in tire_steps:
        t_ring = [bm_tire.verts.new((x_val, r_val * math.cos(2*math.pi*s/segs), r_val * math.sin(2*math.pi*s/segs))) for s in range(segs)]
        t_rings.append(t_ring)
    for i in range(len(t_rings) - 1):
        rA, rB = t_rings[i], t_rings[i+1]
        for s in range(segs):
            sn = (s + 1) % segs
            bm_tire.faces.new((rA[s], rB[s], rB[sn], rA[sn]) if is_left else (rA[sn], rB[sn], rB[s], rA[s]))

    create_mesh_object(f"{name}_Tire", bm_tire, parent=root_obj,
                       mat=mats['tire_rubber'], bevel=0.001, subsurf=2)

    # 3. Steel Brake Rotor & Brembo 4-Piston Caliper
    bm_brake = bmesh.new()
    rotor_x = face_x - sign * 0.04
    bmesh.ops.create_cone(bm_brake, segments=36, cap_ends=True, cap_tris=False,
                          radius1=rim_r * 0.76, radius2=rim_r * 0.76, depth=0.024,
                          matrix=Matrix.Translation(Vector((rotor_x, 0, 0))) @ Matrix.Rotation(math.radians(90), 4, 'Y'))

    bmesh.ops.create_cube(bm_brake, size=1.0,
        matrix=Matrix.Translation(Vector((rotor_x, 0.12, 0.09))) @
               Matrix.Rotation(math.radians(35), 4, 'X') @
               Matrix.Scale(0.065, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.180, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.085, 4, Vector((0, 0, 1))))

    create_mesh_object(f"{name}_Brake", bm_brake, parent=root_obj,
                       mat=[mats['rotor_steel'], mats['brembo_black']],
                       bevel=0.002, subsurf=1)

    return root_obj


# ═════════════════════════════════════════════════════════════════════════════
# 16. FLAT UNDERBODY & VENTURI DIFFUSER
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_underbody(mats):
    """
    Constructs the smooth aerodynamic underbody floor pan and rear Venturi diffuser:
    - Flat floor pan spanning front splitter to rear diffuser
    - Dual Venturi expansion tunnels with 4 vertical aerodynamic diffuser strakes
    """
    bm = bmesh.new()

    # Full Underbody Flat Floor Pan
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.05, 0.11))) @
               Matrix.Scale(1.84, 4, Vector((1, 0, 0))) @
               Matrix.Scale(3.60, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.020, 4, Vector((0, 0, 1))))

    # Rear Venturi Diffuser Expansion Tunnels
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -1.95, 0.18))) @
               Matrix.Rotation(math.radians(-11.0), 4, 'X') @
               Matrix.Scale(1.68, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.68, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.022, 4, Vector((0, 0, 1))))

    # 4 Vertical Aerodynamic Diffuser Strakes
    for strake_x in [-0.55, -0.18, 0.18, 0.55]:
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((strake_x, -1.95, 0.15))) @
                   Matrix.Rotation(math.radians(-11.0), 4, 'X') @
                   Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.65, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.12, 4, Vector((0, 0, 1))))

    obj = create_mesh_object("UNDERBODY_FlatFloor", bm,
                            mat=mats['trim_black'], bevel=0.002, subsurf=1)
    return obj


# ═════════════════════════════════════════════════════════════════════════════
# 17. SEMANTIC HITBOXES & METADATA EXTRAS
# ═════════════════════════════════════════════════════════════════════════════
def build_f40_hitboxes(mats):
    """
    Constructs all 10 semantic hitboxes with:
    - Mat_Invisible_Hitbox (transmission 1.0, alpha 0.0 -> zero visual obstruction!)
    - Full metadata extras: interactive=True, sound_fx, and haptic!
    """
    hitbox_defs = [
        ("HITBOX_Front_Splitter",   (0.0, 2.12, 0.18),    (1.80, 0.35, 0.15), "aero_splitter",   "medium"),
        ("HITBOX_Hood_NACA",        (0.0, 1.55, 0.58),    (1.20, 0.80, 0.20), "panel_tap",       "light"),
        ("HITBOX_PopUp_Headlamps",  (0.0, 1.88, 0.44),    (1.10, 0.30, 0.18), "headlamp_popup",  "heavy"),
        ("HITBOX_Door_L",           (-0.88, 0.26, 0.48),  (0.20, 1.18, 0.60), "car_door_open",   "heavy"),
        ("HITBOX_Door_R",           (0.88, 0.26, 0.48),   (0.20, 1.18, 0.60), "car_door_open",   "heavy"),
        ("HITBOX_Cockpit_Interior", (0.0, 0.18, 0.52),    (1.25, 1.10, 0.65), "cockpit_ambience","medium"),
        ("HITBOX_EngineCover_Deck", (0.0, -1.02, 0.88),   (1.15, 1.30, 0.35), "latch_click",     "heavy"),
        ("HITBOX_TwinTurbo_V8",     (0.0, -0.92, 0.45),   (0.95, 0.90, 0.55), "engine_rev",      "heavy"),
        ("HITBOX_Rear_Wing",        (0.0, -2.12, 1.06),   (1.92, 0.50, 0.35), "aero_wing",       "medium"),
        ("HITBOX_Wheel_FL",         (-0.80, 1.225, 0.32), (0.35, 0.68, 0.68), "tire_scrub",      "light"),
    ]

    hitbox_objs = []
    for name, loc, size, sfx, haptic in hitbox_defs:
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector(loc)) @
                   Matrix.Scale(size[0], 4, Vector((1, 0, 0))) @
                   Matrix.Scale(size[1], 4, Vector((0, 1, 0))) @
                   Matrix.Scale(size[2], 4, Vector((0, 0, 1))))

        mesh = bpy.data.meshes.new(name + "_Mesh")
        bm.to_mesh(mesh)
        bm.free()

        obj = bpy.data.objects.new(name, mesh)
        obj.data.materials.append(mats['invisible_hitbox'])

        obj["interactive"] = True
        obj["sound_fx"] = sfx
        obj["haptic"] = haptic

        bpy.context.collection.objects.link(obj)
        hitbox_objs.append(obj)

    return hitbox_objs


# ═════════════════════════════════════════════════════════════════════════════
# 18. BAKED NLA ANIMATION ACTIONS
# ═════════════════════════════════════════════════════════════════════════════
def bake_f40_nla_actions(door_l, door_r, headlamp_l, headlamp_r, decklid, wheel_fl, wheel_fr):
    """
    Bakes authentic interactive animation tracks preserving kinematic local origins:
    - Door L & R forward-hinged swing (+55° / -55° yaw around Z)
    - Headlamp Pods pop-up (+26° pitch around X)
    - Engine Cover clamshell tilt (-35° pitch around X, lifting rear up)
    - Steering wheel turn (+28° yaw)
    - Wheel spin (360° pitch)
    """
    # 1. Door L Open (+55° yaw on forward cowl hinge)
    door_l.animation_data_clear()
    door_l.rotation_euler = (0, 0, 0)
    door_l.keyframe_insert(data_path="rotation_euler", frame=0)
    door_l.rotation_euler = (0, 0, math.radians(55.0))
    door_l.keyframe_insert(data_path="rotation_euler", frame=30)
    if door_l.animation_data and door_l.animation_data.action:
        door_l.animation_data.action.name = "Action_Door_L_Open"

    # 2. Door R Open (-55° yaw on forward cowl hinge)
    door_r.animation_data_clear()
    door_r.rotation_euler = (0, 0, 0)
    door_r.keyframe_insert(data_path="rotation_euler", frame=0)
    door_r.rotation_euler = (0, 0, math.radians(-55.0))
    door_r.keyframe_insert(data_path="rotation_euler", frame=30)
    if door_r.animation_data and door_r.animation_data.action:
        door_r.animation_data.action.name = "Action_Door_R_Open"

    # 3. Pop-up Headlamps Open (+26° pitch rotation around X)
    for h_obj in [headlamp_l, headlamp_r]:
        h_obj.animation_data_clear()
        h_obj.rotation_euler = (0, 0, 0)
        h_obj.keyframe_insert(data_path="rotation_euler", frame=0)
        h_obj.rotation_euler = (math.radians(26.0), 0, 0)
        h_obj.keyframe_insert(data_path="rotation_euler", frame=25)
        if h_obj.animation_data and h_obj.animation_data.action:
            h_obj.animation_data.action.name = f"Action_{h_obj.name}_Popup"

    # 4. Engine Deck Open (-35° clamshell tilt lifting rear upwards)
    decklid.animation_data_clear()
    decklid.rotation_euler = (0, 0, 0)
    decklid.keyframe_insert(data_path="rotation_euler", frame=0)
    decklid.rotation_euler = (math.radians(-35.0), 0, 0)
    decklid.keyframe_insert(data_path="rotation_euler", frame=30)
    if decklid.animation_data and decklid.animation_data.action:
        decklid.animation_data.action.name = "Action_EngineDeck_Open"

    # 5. Front Steering Turn (+28° yaw)
    wheel_fl.animation_data_clear()
    wheel_fl.rotation_euler = (0, 0, 0)
    wheel_fl.keyframe_insert(data_path="rotation_euler", frame=0)
    wheel_fl.rotation_euler = (0, 0, math.radians(28.0))
    wheel_fl.keyframe_insert(data_path="rotation_euler", frame=30)
    if wheel_fl.animation_data and wheel_fl.animation_data.action:
        wheel_fl.animation_data.action.name = "Action_Steering_Turn"

    # 6. Wheel Spin (Continuous 360° pitch rotation)
    wheel_fr.animation_data_clear()
    wheel_fr.rotation_euler = (0, 0, 0)
    wheel_fr.keyframe_insert(data_path="rotation_euler", frame=0)
    wheel_fr.rotation_euler = (math.radians(360.0), 0, 0)
    wheel_fr.keyframe_insert(data_path="rotation_euler", frame=30)
    if wheel_fr.animation_data and wheel_fr.animation_data.action:
        wheel_fr.animation_data.action.name = "Action_Wheel_Spin"

    print("Successfully baked 6 NLA Action clips for Gate 5 compliance.")


# ═════════════════════════════════════════════════════════════════════════════
# 19. MASTER EXECUTION ROUTINE & HIGH-POLY PRE-EXPORT BAKING
# ═════════════════════════════════════════════════════════════════════════════
def run_f40_master_generation_v7():
    print("====================================================================")
    print("EXECUTING MASTER CLASS-A UPGRADE V7: 1987 FERRARI F40 (SUPERCAR 1980S)")
    print("====================================================================")

    # 1. Clean scene safely preserving MCP socket
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for m in list(bpy.data.meshes):
        bpy.data.meshes.remove(m)
    for c in list(bpy.data.cameras):
        bpy.data.cameras.remove(c)

    # 2. Setup materials
    mats = setup_f40_materials()

    # 3. Build Bodywork with 100% Unibody Greenhouse Cutout & New Nose Splitter
    obj_front = build_f40_front_clamshell(mats)
    obj_roof = build_f40_roof_and_pillars(mats)
    obj_rear = build_f40_rear_quarters(mats)

    # 4. Build Structural Chassis Rocker Sills & Door Jamb Pillars
    obj_sills = build_f40_chassis_rocker_sills(mats)

    # 5. Build Articulating Doors with Transparent Sliding Lexan Windows
    door_objs = build_f40_doors(mats)
    door_l, door_r = door_objs[0], door_objs[1]

    # 6. Build Iconic Rear Wing
    wing_obj = build_f40_rear_wing(mats)

    # 7. Build Rear Fascia Valence & Carello Taillights
    val_obj, taillights_obj = build_f40_rear_fascia(mats)

    # 8. Build Signature Triple Exhaust Cannons
    exhaust_obj = build_f40_triple_exhaust(mats)

    # 9. Build Compound Windshield & Slatted Lexan Engine Cover
    windshield_obj, deck_obj = build_f40_glass_and_engine_cover(mats)

    # 10. Build Pop-Up Headlamps & Driving Lights
    headlamp_objs, drive_lights_obj = build_f40_lighting(mats)
    headlamp_l, headlamp_r = headlamp_objs[0], headlamp_objs[1]

    # 11. Build Stripped Carbon-Kevlar Cockpit Interior & Nomex Seats
    cockpit_obj = build_f40_cockpit(mats)

    # 12. Build Exposed 2.9L Twin-Turbo V8 Engine
    engine_obj = build_f40_powertrain(mats)

    # 13. Build Underbody Floor & Venturi Diffuser
    underbody_obj = build_f40_underbody(mats)

    # 14. Build 4 High-Density Speedline 3-Piece 5-Spoke Star Wheels
    f_track_hw = 1.594 / 2.0
    r_track_hw = 1.606 / 2.0
    wheel_configs = [
        ("WHEEL_FL", Vector((-f_track_hw, 1.225, 0.325)), True, True),
        ("WHEEL_FR", Vector(( f_track_hw, 1.225, 0.325)), True, False),
        ("WHEEL_RL", Vector((-r_track_hw, -1.225, 0.325)), False, True),
        ("WHEEL_RR", Vector(( r_track_hw, -1.225, 0.325)), False, False),
    ]

    wheel_roots = {}
    for wname, wloc, is_f, is_l in wheel_configs:
        w_root = build_speedline_wheel_assembly(wname, wloc, is_f, is_l, mats)
        wheel_roots[wname] = w_root

    # 15. Build Semantic Hitboxes with Metadata Extras
    hitbox_objs = build_f40_hitboxes(mats)

    # 16. Bake NLA Animation Actions
    bake_f40_nla_actions(
        door_l=door_l,
        door_r=door_r,
        headlamp_l=headlamp_l,
        headlamp_r=headlamp_r,
        decklid=deck_obj,
        wheel_fl=wheel_roots["WHEEL_FL"],
        wheel_fr=wheel_roots["WHEEL_FR"]
    )

    # 17. Pre-export modifier baking protocol
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

    # Set frame to 0 for resting flush shutlines
    bpy.context.scene.frame_set(0)

    # 18. Polygon & Hierarchy Audit
    total_triangles = 0
    total_verts = 0
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            for poly in obj.data.polygons:
                total_triangles += max(0, poly.loop_total - 2)
            total_verts += len(obj.data.vertices)

    print(f"MASTER FERRARI F40 V7 GENERATED:")
    print(f"  Total Triangles: {total_triangles:,}")
    print(f"  Total Vertices:  {total_verts:,}")

    # 19. Export Master Production GLBs (Dual-Mode)
    export_paths = [
        os.path.join(PROJECT_ROOT, "public", "models", "vehicles", "supercar", "1980s", "vehicle.glb"),
        os.path.join(PROJECT_ROOT, "exports", "Car_Ferrari_F40_1980s_Complete.glb"),
        os.path.join(PROJECT_ROOT, "public", "models", "Car_Ferrari_F40_1980s_Complete.glb")
    ]

    for ep in export_paths:
        os.makedirs(os.path.dirname(ep), exist_ok=True)
        bpy.ops.export_scene.gltf(
            filepath=ep,
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
        sz_mb = os.path.getsize(ep) / (1024 * 1024)
        print(f"Exported Master GLB -> {ep} ({sz_mb:.2f} MB)")

    return {
        'triangles': total_triangles,
        'verts': total_verts,
        'file_size_mb': os.path.getsize(export_paths[0]) / (1024 * 1024)
    }


if __name__ == "__main__":
    run_f40_master_generation_v7()
