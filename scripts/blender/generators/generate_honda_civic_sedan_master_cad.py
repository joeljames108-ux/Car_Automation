"""
=============================================================================
HONDA CIVIC SEDAN (11TH GEN FE/FL - 2020s SEDAN) MASTER CAD GENERATOR
=============================================================================
Procedural Class-A CAD Automotive Generation Pipeline:
- Target Standard: The 15MB / 700k-1.0M Triangle Quality Law (15-25 MB, Grade A)
- Subsystems: 7/7 Universal Automotive Domains + 10 Semantic Hitboxes + 4 Cameras
- Design Architecture:
  * Clean, low horizontal beltline with pulled-back A-pillars and low cowl
  * Sleek fastback roofline terminating in an integrated ducktail decklid spoiler
  * Gloss black upper grille bar with 3D chrome Honda "H" emblem
  * Jewel-Eye full-LED headlights with inverted-L daytime running light eyebrows
  * Wide trapezoidal lower honeycomb radiator intake with side air curtain ducts
  * Full-width metal honeycomb mesh dashboard ribbon with floating 9" OLED display
  * 1.5L VTEC Turbo powertrain with red engine appearance cover and strut tower braces
  * 18-inch two-tone 5-spoke split sport alloy wheels with machined face and black pockets
  * Articulating 4-door architecture (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`), hood, decklid
  * Preserved physical hinge origins (export_apply=False) with 6 baked NLA actions
=============================================================================
"""

import bpy
import bmesh
import math
import os
import shutil
import subprocess
from mathutils import Vector, Matrix, Euler


# ─── 0. Scene Cleaning & Setup ────────────────────────────────────────────────
def clean_scene():
    """Wipes active scene completely to ensure deterministic generation."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in [bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights, bpy.data.actions]:
        for item in list(block):
            block.remove(item)


# ─── 1. BMesh Primitives & Utilities ──────────────────────────────────────────
def safe_face_new(bm, verts, mat_idx=0):
    """Safely creates a polygonal face with verified distinct vertices."""
    seen = set()
    uniq = []
    for v in verts:
        if v not in seen:
            seen.add(v)
            uniq.append(v)
    if len(uniq) >= 3:
        try:
            f = bm.faces.new(uniq)
            f.material_index = mat_idx
            return f
        except Exception:
            pass
    return None


def add_box(bm, size=(1, 1, 1), matrix=None, mat_idx=0):
    """Procedural oriented box primitive."""
    m = matrix or Matrix.Identity(4)
    sx, sy, sz = size[0] * 0.5, size[1] * 0.5, size[2] * 0.5
    v = [
        bm.verts.new(m @ Vector((-sx, -sy, -sz))),
        bm.verts.new(m @ Vector(( sx, -sy, -sz))),
        bm.verts.new(m @ Vector(( sx,  sy, -sz))),
        bm.verts.new(m @ Vector((-sx,  sy, -sz))),
        bm.verts.new(m @ Vector((-sx, -sy,  sz))),
        bm.verts.new(m @ Vector(( sx, -sy,  sz))),
        bm.verts.new(m @ Vector(( sx,  sy,  sz))),
        bm.verts.new(m @ Vector((-sx,  sy,  sz)))
    ]
    faces = [
        (0, 1, 2, 3), (4, 7, 6, 5),
        (0, 4, 5, 1), (2, 6, 7, 3),
        (0, 3, 7, 4), (1, 5, 6, 2)
    ]
    for idxs in faces:
        safe_face_new(bm, [v[i] for i in idxs], mat_idx=mat_idx)


def add_cylinder(bm, radius1=0.1, radius2=0.1, depth=0.2, segments=24, matrix=None, cap_ends=True, mat_idx=0):
    """Procedural cylinder/cone primitive generator."""
    m = matrix or Matrix.Identity(4)
    r1, r2, d = radius1, radius2, depth * 0.5
    bot_ring = []
    top_ring = []
    for i in range(segments):
        theta = 2.0 * math.pi * i / segments
        x = math.cos(theta)
        y = math.sin(theta)
        bot_ring.append(bm.verts.new(m @ Vector((x * r1, y * r1, -d))))
        top_ring.append(bm.verts.new(m @ Vector((x * r2, y * r2,  d))))

    for i in range(segments):
        nxt = (i + 1) % segments
        safe_face_new(bm, (bot_ring[i], bot_ring[nxt], top_ring[nxt], top_ring[i]), mat_idx=mat_idx)

    if cap_ends:
        c_bot = bm.verts.new(m @ Vector((0, 0, -d)))
        c_top = bm.verts.new(m @ Vector((0, 0,  d)))
        for i in range(segments):
            nxt = (i + 1) % segments
            safe_face_new(bm, (bot_ring[nxt], bot_ring[i], c_bot), mat_idx=mat_idx)
            safe_face_new(bm, (top_ring[i], top_ring[nxt], c_top), mat_idx=mat_idx)


def add_annulus(bm, r_outer=0.2, r_inner=0.15, depth=0.05, segments=32, matrix=None, mat_idx=0):
    """Procedural tubular annulus / cylindrical shell."""
    m = matrix or Matrix.Identity(4)
    d = depth * 0.5
    outer_bot, outer_top = [], []
    inner_bot, inner_top = [], []

    for i in range(segments):
        theta = 2.0 * math.pi * i / segments
        ct, st = math.cos(theta), math.sin(theta)
        outer_bot.append(bm.verts.new(m @ Vector((ct * r_outer, st * r_outer, -d))))
        outer_top.append(bm.verts.new(m @ Vector((ct * r_outer, st * r_outer,  d))))
        inner_bot.append(bm.verts.new(m @ Vector((ct * r_inner, st * r_inner, -d))))
        inner_top.append(bm.verts.new(m @ Vector((ct * r_inner, st * r_inner,  d))))

    for i in range(segments):
        nxt = (i + 1) % segments
        safe_face_new(bm, (outer_bot[i], outer_bot[nxt], outer_top[nxt], outer_top[i]), mat_idx=mat_idx)
        safe_face_new(bm, (inner_bot[nxt], inner_bot[i], inner_top[i], inner_top[nxt]), mat_idx=mat_idx)
        safe_face_new(bm, (outer_top[i], outer_top[nxt], inner_top[nxt], inner_top[i]), mat_idx=mat_idx)
        safe_face_new(bm, (outer_bot[nxt], outer_bot[i], inner_bot[i], inner_bot[nxt]), mat_idx=mat_idx)


def add_torus(bm, r_major=0.15, r_minor=0.02, seg_maj=32, seg_min=12, matrix=None, mat_idx=0):
    """Procedural torus ring for steering wheel rims."""
    m = matrix or Matrix.Identity(4)
    rings = []
    for i in range(seg_maj):
        u = 2.0 * math.pi * i / seg_maj
        cu, su = math.cos(u), math.sin(u)
        ring = []
        for j in range(seg_min):
            v = 2.0 * math.pi * j / seg_min
            cv, sv = math.cos(v), math.sin(v)
            x = (r_major + r_minor * cv) * cu
            y = (r_major + r_minor * cv) * su
            z = r_minor * sv
            ring.append(bm.verts.new(m @ Vector((x, y, z))))
        rings.append(ring)

    for i in range(seg_maj):
        i_nxt = (i + 1) % seg_maj
        for j in range(seg_min):
            j_nxt = (j + 1) % seg_min
            safe_face_new(bm, (rings[i][j], rings[i_nxt][j], rings[i_nxt][j_nxt], rings[i][j_nxt]), mat_idx=mat_idx)


def create_mesh_object(name, col, mat_list, bm, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=0):
    """Bakes bmesh to a concrete scene object with PBR materials and Class-A modifiers."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)

    for mat in mat_list:
        obj.data.materials.append(mat)

    if hasattr(obj.data, "shade_smooth_by_angle"):
        obj.data.shade_smooth_by_angle(math.radians(auto_smooth))
    elif hasattr(obj.data, "auto_smooth_angle"):
        obj.data.auto_smooth_angle = math.radians(auto_smooth)
        obj.data.use_auto_smooth = True

    if bevel_w > 0:
        bev = obj.modifiers.new("Bevel", 'BEVEL')
        bev.width = bevel_w
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)

    if subsurf_lvl > 0:
        sub = obj.modifiers.new("Subsurf", 'SUBSURF')
        sub.levels = subsurf_lvl
        sub.render_levels = subsurf_lvl

    wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True

    return obj


# ─── 2. PBR Material Factory ──────────────────────────────────────────────────
def build_materials():
    """Generates authentic PBR materials for 11th Gen Honda Civic Sedan."""
    mats = {}

    def new_mat(name, color, metallic=0.0, roughness=0.5, coat=0.0, trans=0.0, transmission=0.0, ior=1.5, alpha=1.0, emissive=(0,0,0,1), emissive_str=0.0):
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        nodes.clear()

        out = nodes.new('ShaderNodeOutputMaterial')
        bsdf = nodes.new('ShaderNodeBsdfPrincipled')
        links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Roughness'].default_value = roughness

        if 'Coat Weight' in bsdf.inputs:
            bsdf.inputs['Coat Weight'].default_value = coat
        elif 'Clearcoat' in bsdf.inputs:
            bsdf.inputs['Clearcoat'].default_value = coat

        t_val = max(trans, transmission)
        if t_val > 0.0:
            if 'Transmission Weight' in bsdf.inputs:
                bsdf.inputs['Transmission Weight'].default_value = t_val
            elif 'Transmission' in bsdf.inputs:
                bsdf.inputs['Transmission'].default_value = t_val
            bsdf.inputs['IOR'].default_value = ior

        if alpha < 1.0:
            if 'Alpha' in bsdf.inputs:
                bsdf.inputs['Alpha'].default_value = alpha
            mat.blend_method = 'BLEND'

        if emissive_str > 0.0:
            if 'Emission Color' in bsdf.inputs:
                bsdf.inputs['Emission Color'].default_value = emissive
                bsdf.inputs['Emission Strength'].default_value = emissive_str
            elif 'Emission' in bsdf.inputs:
                bsdf.inputs['Emission'].default_value = (emissive[0]*emissive_str, emissive[1]*emissive_str, emissive[2]*emissive_str, 1.0)

        mats[name] = mat
        return mat

    # Exterior Finishes
    # Sonic Gray Pearl (Signature 11th Gen Civic hero hue: cool blue-grey with pearl mica)
    new_mat("CarPaint_SonicGrayPearl", (0.34, 0.38, 0.42, 1.0), metallic=0.72, roughness=0.22, coat=1.0)
    new_mat("Trim_GlossBlack", (0.02, 0.02, 0.02, 1.0), metallic=0.10, roughness=0.12, coat=0.8)
    new_mat("Trim_MatteBlack", (0.05, 0.05, 0.05, 1.0), metallic=0.00, roughness=0.65)
    new_mat("Trim_Chrome", (0.95, 0.95, 0.96, 1.0), metallic=0.98, roughness=0.03)
    new_mat("Material_Hitbox_Invisible", (0.0, 0.0, 0.0, 0.0), roughness=1.0, trans=1.0, alpha=0.0)

    # Lighting Optics
    new_mat("Light_LED_JewelEye", (0.90, 0.95, 1.0, 1.0), roughness=0.04, emissive=(0.90, 0.95, 1.0, 1.0), emissive_str=20.0)
    new_mat("Light_DRL_InvertedL", (1.0, 1.0, 1.0, 1.0), roughness=0.06, emissive=(1.0, 1.0, 1.0, 1.0), emissive_str=16.0)
    new_mat("Light_Amber_Indicator", (1.0, 0.50, 0.0, 1.0), roughness=0.10, emissive=(1.0, 0.50, 0.0, 1.0), emissive_str=10.0)
    new_mat("Light_Taillamp_CarmineRed", (0.88, 0.02, 0.03, 1.0), roughness=0.08, emissive=(0.92, 0.02, 0.03, 1.0), emissive_str=14.0)
    new_mat("Light_Reverse_White", (0.92, 0.92, 0.95, 1.0), roughness=0.10, emissive=(0.95, 0.95, 0.98, 1.0), emissive_str=10.0)

    # Glass
    new_mat("Glass_Greenhouse", (0.06, 0.08, 0.08, 1.0), roughness=0.03, coat=1.0, trans=0.92, transmission=0.92, alpha=0.30)
    new_mat("Glass_HeadlampLens", (0.95, 0.95, 0.95, 1.0), roughness=0.01, trans=0.95, alpha=0.25)

    # Wheels & Brakes
    new_mat("Wheel_MachinedAlloy", (0.86, 0.88, 0.90, 1.0), metallic=0.92, roughness=0.15, coat=0.6)
    new_mat("Wheel_GlossBlackPockets", (0.02, 0.02, 0.02, 1.0), metallic=0.30, roughness=0.18, coat=0.8)
    new_mat("Tire_Radial_Rubber", (0.04, 0.04, 0.04, 1.0), roughness=0.80)
    new_mat("Brake_Rotor_Steel", (0.72, 0.74, 0.76, 1.0), metallic=0.88, roughness=0.28)
    new_mat("Brake_Caliper_Cast", (0.28, 0.30, 0.32, 1.0), metallic=0.60, roughness=0.45)

    # Powertrain & Cockpit
    new_mat("Engine_VTEC_CoverRed", (0.78, 0.04, 0.05, 1.0), metallic=0.15, roughness=0.30, coat=0.8)
    new_mat("Engine_Alloy_Block", (0.65, 0.67, 0.70, 1.0), metallic=0.85, roughness=0.35)
    new_mat("Interior_Fabric_Anthracite", (0.06, 0.06, 0.07, 1.0), roughness=0.85)
    new_mat("Interior_Honeycomb_VentMesh", (0.18, 0.19, 0.20, 1.0), metallic=0.75, roughness=0.35)
    new_mat("Interior_Screen_OLED", (0.01, 0.02, 0.03, 1.0), roughness=0.08, emissive=(0.10, 0.30, 0.50, 1.0), emissive_str=3.0)
    new_mat("Exhaust_Chrome_Tips", (0.92, 0.92, 0.94, 1.0), metallic=0.98, roughness=0.06)
    new_mat("Exhaust_InnerSoot", (0.02, 0.02, 0.02, 1.0), roughness=0.95)
    new_mat("Chassis_Underbody", (0.06, 0.06, 0.06, 1.0), roughness=0.80)

    return mats


# ─── 3. Watertight Class-A Modern Unibody Shell ───────────────────────────────
def build_unibody_watertight(col, mats):
    """
    Constructs an authentic Class-A CAD unibody shell for 11th Gen Honda Civic Sedan:
    - Wheelbase: 2,735mm (Front Axle at Y = 0.000m, Rear Axle at Y = -2.735m)
    - Overall Length: 4,674mm (Y: +0.915m to -3.759m)
    - Clean horizontal beltline with low cowl and pulled-back A-pillars
    - Open window apertures revealing the minimalist honeycomb interior
    - Subtle fastback roofline flowing into ducktail rear decklid
    """
    bm = bmesh.new()

    # 18 Cross-sections along Y axis
    # (Y, hw_sill, hw_hip, hw_waist, hw_roof, zs, z_hip, z_waist, z_roof, is_cab)
    stations = [
        # Front Chin & Splitter Lip
        ( 0.915, 0.460, 0.660, 0.720, 0.360, 0.145, 0.380, 0.580, 0.620, False), # 0 Chin
        ( 0.800, 0.520, 0.720, 0.780, 0.420, 0.145, 0.440, 0.640, 0.680, False), # 1
        ( 0.550, 0.600, 0.820, 0.840, 0.500, 0.145, 0.520, 0.720, 0.750, False), # 2
        # Front Wheel Arch & Fender
        ( 0.250, 0.660, 0.890, 0.870, 0.520, 0.320, 0.620, 0.770, 0.790, False), # 3
        ( 0.000, 0.680, 0.900, 0.885, 0.530, 0.420, 0.640, 0.785, 0.800, False), # 4 Front Axle
        (-0.250, 0.660, 0.885, 0.875, 0.520, 0.320, 0.620, 0.780, 0.795, False), # 5
        # Windshield Cowl & Front Cabin
        (-0.500, 0.650, 0.865, 0.870, 0.580, 0.145, 0.560, 0.800, 0.820, True),  # 6 Cowl Base
        (-0.750, 0.645, 0.855, 0.865, 0.560, 0.145, 0.560, 0.800, 1.150, True),  # 7 Windshield Mid
        (-1.000, 0.640, 0.850, 0.860, 0.540, 0.145, 0.560, 0.800, 1.380, True),  # 8 Windshield Header
        # Cabin Center & B-Pillar Apex
        (-1.380, 0.635, 0.850, 0.860, 0.535, 0.145, 0.560, 0.800, 1.415, True),  # 9 Roof Peak Apex
        (-1.750, 0.640, 0.855, 0.865, 0.540, 0.145, 0.560, 0.800, 1.400, True),  # 10 Cabin Mid
        (-2.100, 0.650, 0.865, 0.875, 0.550, 0.145, 0.560, 0.800, 1.365, True),  # 11 Backlite Header
        # Rear C-Pillar & Fastback Rake
        (-2.450, 0.665, 0.885, 0.890, 0.570, 0.145, 0.580, 0.800, 1.140, True),  # 12 Backlite Mid
        (-2.735, 0.680, 0.900, 0.895, 0.580, 0.420, 0.640, 0.800, 0.890, False), # 13 Rear Axle
        (-3.020, 0.665, 0.885, 0.880, 0.540, 0.320, 0.620, 0.800, 0.885, False), # 14
        # Rear Decklid with Ducktail Lip Spoiler & Tail Fascia
        (-3.350, 0.610, 0.840, 0.850, 0.470, 0.155, 0.550, 0.795, 0.880, False), # 15 Decklid Mid
        (-3.620, 0.530, 0.770, 0.790, 0.390, 0.180, 0.480, 0.785, 0.870, False), # 16 Lip Spoiler
        (-3.759, 0.440, 0.690, 0.710, 0.310, 0.220, 0.420, 0.760, 0.820, False), # 17 Taillamp Fascia
    ]

    rings = []
    for y, hs, hb, ht, hr, zs, zb, zt, zr, is_cab in stations:
        ring = []
        ring.append(Vector((0.0, y, zs)))                           # 0: Keel centerline
        ring.append(Vector((hs * 0.58, y, zs + 0.025)))             # 1: Underbody bevel
        ring.append(Vector((hs, y, zs + 0.075)))                    # 2: Rocker sill bottom
        ring.append(Vector((hb, y, zb)))                            # 3: Subtle fender blister peak
        ring.append(Vector((ht, y, zt)))                            # 4: Crisp horizontal beltline crease
        if is_cab:
            ring.append(Vector((ht * 0.88, y, (zt + zr) * 0.5)))    # 5: Window beltline transition / A-pillar base
            ring.append(Vector((hr * 1.10, y, zr - 0.05)))          # 6: Cantrail shoulder / roof rail
            ring.append(Vector((hr, y, zr)))                        # 7: Roof outer crown
            ring.append(Vector((0.0, y, zr + 0.012)))               # 8: Roof centerline
        else:
            ring.append(Vector((ht * 0.80, y, zt + 0.01)))          # 5: Hood/trunk lateral valley
            ring.append(Vector((ht * 0.48, y, (zt + zr) * 0.5)))    # 6: Hood/trunk mid contour
            ring.append(Vector((ht * 0.18, y, zr - 0.005)))         # 7: Hood/trunk inner valley
            ring.append(Vector((0.0, y, zr)))                       # 8: Centerline crown

        # Left side points symmetrical reverse
        n_side = len(ring) - 1
        for idx in range(n_side - 1, 0, -1):
            p = ring[idx]
            ring.append(Vector((-p.x, y, p.z)))

        bm_ring = [bm.verts.new(p) for p in ring]
        rings.append(bm_ring)

    # Loft adjacent slices continuously with authentic Class-A CAD unibody continuity:
    for i in range(len(rings) - 1):
        r1, r2 = rings[i], rings[i + 1]
        n_pts = len(r1)
        for j in range(n_pts):
            nxt = (j + 1) % n_pts
            safe_face_new(bm, (r1[j], r2[j], r2[nxt], r1[nxt]), mat_idx=0)

    # Front nose cap (recessed behind front upper grille bar and bumper intake)
    c_front = bm.verts.new(Vector((0.0, stations[0][0] - 0.025, 0.440)))
    for j in range(len(rings[0])):
        nxt = (j + 1) % len(rings[0])
        safe_face_new(bm, (rings[0][nxt], rings[0][j], c_front), mat_idx=0)

    # Rear tail cap
    c_rear = bm.verts.new(Vector((0.0, stations[-1][0] - 0.01, 0.520)))
    for j in range(len(rings[-1])):
        nxt = (j + 1) % len(rings[-1])
        safe_face_new(bm, (rings[-1][j], rings[-1][nxt], c_rear), mat_idx=0)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)

    mat_list = [mats["CarPaint_SonicGrayPearl"], mats["Trim_GlossBlack"], mats["Trim_MatteBlack"]]
    obj = create_mesh_object("BODY_Watertight_Unibody", col, mat_list, bm, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=2)
    return obj


# ─── 4. Upper Grille Bar & Lower Honeycomb Fascia ─────────────────────────────
def build_front_fascia_and_grille(col, mats):
    """
    Constructs the 11th Gen Civic signature front fascia:
    - Gloss black upper horizontal grille bar spanning between headlamps
    - 3D mirror-chrome Honda "H" emblem
    - Wide trapezoidal lower honeycomb radiator air intake
    - Aerodynamic side air curtain vents with vertical strakes
    """
    bm = bmesh.new()

    # Gloss Black Upper Grille Bar (Spanning X: -0.42m to +0.42m, Y: 0.915m, Z: 0.635m)
    m_grille = Matrix.Translation(Vector((0.0, 0.915, 0.635)))
    add_box(bm, size=(0.84, 0.040, 0.065), matrix=m_grille, mat_idx=0)

    # 3D Chrome Honda "H" Badge
    m_badge = Matrix.Translation(Vector((0.0, 0.938, 0.635)))
    add_box(bm, size=(0.100, 0.012, 0.082), matrix=m_badge, mat_idx=1)
    # Inner "H" relief cutout
    add_box(bm, size=(0.065, 0.014, 0.055), matrix=m_badge, mat_idx=0)

    # Wide Trapezoidal Lower Radiator Intake (Honeycomb mesh)
    m_lower = Matrix.Translation(Vector((0.0, 0.905, 0.330)))
    add_box(bm, size=(0.88, 0.050, 0.220), matrix=m_lower, mat_idx=2)
    # Honeycomb texture frame
    add_box(bm, size=(0.92, 0.018, 0.235), matrix=Matrix.Translation(Vector((0.0, 0.918, 0.330))), mat_idx=0)

    # Aerodynamic Side Air Curtains (Left & Right)
    for sign in [1.0, -1.0]:
        cx = sign * 0.660
        cy = 0.860
        cz = 0.330
        m_curt = Matrix.Translation(Vector((cx, cy, cz)))
        add_box(bm, size=(0.12, 0.06, 0.20), matrix=m_curt, mat_idx=0)
        # Vertical aerodynamic strake
        add_box(bm, size=(0.015, 0.07, 0.18), matrix=Matrix.Translation(Vector((cx, cy + 0.025, cz))), mat_idx=2)

    mat_list = [mats["Trim_GlossBlack"], mats["Trim_Chrome"], mats["Trim_MatteBlack"]]
    obj = create_mesh_object("BODY_Front_Grille_Fascia", col, mat_list, bm, bevel_w=0.002, auto_smooth=32.0, subsurf_lvl=2)
    return obj


# ─── 5. Jewel-Eye Full-LED Headlamps & Inverted-L Taillights ──────────────────
def build_lighting_optics(col, mats):
    """
    Constructs the signature Jewel-Eye LED lighting systems:
    - Triple jewel-eye LED projector cubes with chrome reflector nacelles
    - Inverted-L brilliant white LED daytime running light eyebrow
    - Swept clear polycarbonate outer lens conforming to fender curvature
    - Distinctive inverted-L Carmine Red LED ribbon taillight assemblies
    """
    bm = bmesh.new()

    # Front Jewel-Eye Headlamps (Swept along fender from Y=0.860 to Y=0.620)
    for sign, side in [(1.0, "L"), (-1.0, "R")]:
        p_in_lo  = Vector((sign * 0.420, 0.860, 0.620))
        p_in_hi  = Vector((sign * 0.420, 0.860, 0.680))
        p_out_lo = Vector((sign * 0.740, 0.640, 0.650))
        p_out_hi = Vector((sign * 0.740, 0.640, 0.720))

        v_ifl = bm.verts.new(p_in_lo)
        v_ifh = bm.verts.new(p_in_hi)
        v_ofl = bm.verts.new(p_out_lo)
        v_ofh = bm.verts.new(p_out_hi)

        d_b = Vector((0.0, -0.060, 0.0))
        v_ibl = bm.verts.new(p_in_lo + d_b)
        v_ibh = bm.verts.new(p_in_hi + d_b)
        v_obl = bm.verts.new(p_out_lo + d_b)
        v_obh = bm.verts.new(p_out_hi + d_b)

        # Housing walls
        safe_face_new(bm, [v_ibl, v_ibh, v_obh, v_obl] if sign > 0 else [v_ibl, v_obl, v_obh, v_ibh], mat_idx=0)

        # Outer Polycarbonate Clear Lens
        safe_face_new(bm, [v_ifl, v_ifh, v_ofh, v_ofl] if sign > 0 else [v_ifl, v_ofl, v_ofh, v_ifh], mat_idx=5)

        # Triple Jewel-Eye LED Cubes
        for cube_idx in range(3):
            t_c = cube_idx / 2.0
            cx = sign * (0.460 + t_c * 0.220)
            cy = 0.830 - t_c * 0.180
            cz = 0.640 + t_c * 0.040
            m_cube = Matrix.Translation(Vector((cx, cy, cz)))
            add_box(bm, size=(0.045, 0.035, 0.035), matrix=m_cube, mat_idx=1)
            # Chrome reflector surround
            add_box(bm, size=(0.055, 0.010, 0.045), matrix=Matrix.Translation(Vector((cx, cy + 0.01, cz))), mat_idx=2)

        # Inverted-L Brilliant White DRL Eyebrow running along top edge
        drl_mid = Vector((sign * 0.580, 0.750, 0.685))
        m_drl = Matrix.Translation(drl_mid) @ Matrix.Rotation(math.radians(sign * -26), 3, 'Z').to_4x4()
        add_box(bm, size=(0.32, 0.012, 0.015), matrix=m_drl, mat_idx=3)
        # Vertical drop hook on outer corner
        m_hook = Matrix.Translation(Vector((sign * 0.725, 0.650, 0.675)))
        add_box(bm, size=(0.012, 0.012, 0.040), matrix=m_hook, mat_idx=3)

        # Amber Turn Indicator on outer edge
        m_ind = Matrix.Translation(Vector((sign * 0.730, 0.635, 0.690)))
        add_box(bm, size=(0.020, 0.020, 0.025), matrix=m_ind, mat_idx=4)

    # Rear Inverted-L LED Taillamps (Swept from quarter panel into decklid)
    for sign, side in [(1.0, "L"), (-1.0, "R")]:
        p_tin_lo  = Vector((sign * 0.320, -3.730, 0.760))
        p_tin_hi  = Vector((sign * 0.320, -3.730, 0.815))
        p_tout_lo = Vector((sign * 0.690, -3.610, 0.770))
        p_tout_hi = Vector((sign * 0.690, -3.610, 0.830))

        v_tfl = bm.verts.new(p_tin_lo)
        v_tfh = bm.verts.new(p_tin_hi)
        v_tol = bm.verts.new(p_tout_lo)
        v_toh = bm.verts.new(p_tout_hi)

        # Taillamp lens
        safe_face_new(bm, [v_tfl, v_tfh, v_toh, v_tol] if sign > 0 else [v_tfl, v_tol, v_toh, v_tfh], mat_idx=6)

        # Inverted-L Luminous Carmine Red LED Ribbon
        m_trib = Matrix.Translation(Vector((sign * 0.490, -3.670, 0.795))) @ Matrix.Rotation(math.radians(sign * 18), 3, 'Z').to_4x4()
        add_box(bm, size=(0.32, 0.012, 0.022), matrix=m_trib, mat_idx=6)

        # White Reverse Light Bar on inner decklid half
        m_rev = Matrix.Translation(Vector((sign * 0.380, -3.715, 0.785)))
        add_box(bm, size=(0.10, 0.010, 0.016), matrix=m_rev, mat_idx=7)

    mat_list = [
        mats["Trim_GlossBlack"], mats["Light_LED_JewelEye"], mats["Trim_Chrome"],
        mats["Light_DRL_InvertedL"], mats["Light_Amber_Indicator"], mats["Glass_HeadlampLens"],
        mats["Light_Taillamp_CarmineRed"], mats["Light_Reverse_White"]
    ]
    obj = create_mesh_object("LIGHTING_Optics_Assemblies", col, mat_list, bm, bevel_w=0.002, auto_smooth=35.0, subsurf_lvl=2)
    return obj


# ─── 6. Aerodynamic Package, Diffuser & Dual Exhausts ─────────────────────────
def build_aerodynamics(col, mats):
    """
    Constructs the 11th Gen Civic aerodynamic trim elements:
    - Front chin aero splitter lip
    - Sculpted side rocker ground effect skirts
    - Rear aerodynamic bumper diffuser with dual polished chrome exhaust tips
    - Aerodynamic door pedestal mirrors with LED repeater strips
    - Roof-mounted aerodynamic Shark-Fin antenna
    """
    bm = bmesh.new()

    # Front Chin Aero Splitter Lip (Curved along chin contour)
    m_split = Matrix.Translation(Vector((0.0, 0.895, 0.135)))
    add_box(bm, size=(1.48, 0.10, 0.022), matrix=m_split, mat_idx=0)
    for sign in [1.0, -1.0]:
        m_sw = Matrix.Translation(Vector((sign * 0.62, 0.81, 0.135))) @ Matrix.Rotation(math.radians(sign * 16), 3, 'Z').to_4x4()
        add_box(bm, size=(0.34, 0.08, 0.022), matrix=m_sw, mat_idx=0)

    # Sculpted Side Rocker Skirts (Left & Right)
    for sign in [1.0, -1.0]:
        m_skirt = Matrix.Translation(Vector((sign * 0.840, -1.365, 0.140)))
        add_box(bm, size=(0.032, 2.35, 0.024), matrix=m_skirt, mat_idx=0)

    # Rear Aerodynamic Diffuser Fascia
    diff_y = -3.740
    diff_z = 0.230
    m_diff = Matrix.Translation(Vector((0.0, diff_y, diff_z)))
    add_box(bm, size=(1.36, 0.12, 0.12), matrix=m_diff, mat_idx=0)
    for fin_x in [-0.30, -0.10, 0.10, 0.30]:
        m_fin = Matrix.Translation(Vector((fin_x, diff_y + 0.01, diff_z - 0.025)))
        add_box(bm, size=(0.014, 0.12, 0.060), matrix=m_fin, mat_idx=0)

    # Dual Polished Oval Chrome Exhaust Cannons (Outboard tips)
    for sign in [1.0, -1.0]:
        ex = sign * 0.480
        ey = diff_y - 0.015
        ez = 0.230
        m_ex = Matrix.Translation(Vector((ex, ey, ez))) @ Matrix.Rotation(math.radians(90), 3, 'X').to_4x4()
        add_cylinder(bm, radius1=0.046, radius2=0.044, depth=0.09, segments=24, matrix=m_ex, mat_idx=1)
        m_bore = Matrix.Translation(Vector((ex, ey - 0.010, ez))) @ Matrix.Rotation(math.radians(90), 3, 'X').to_4x4()
        add_cylinder(bm, radius1=0.040, radius2=0.038, depth=0.07, segments=20, matrix=m_bore, mat_idx=2)

    # Door Pedestal Aerodynamic Side Mirrors (Mounted firmly to door windowsill at Z=0.820m)
    for sign in [1.0, -1.0]:
        # Stalk attached directly to front door corner
        m_stalk = Matrix.Translation(Vector((sign * 0.830, -0.520, 0.820)))
        add_box(bm, size=(0.038, 0.045, 0.035), matrix=m_stalk, mat_idx=0)
        # Mirror shell
        m_shell = Matrix.Translation(Vector((sign * 0.875, -0.540, 0.850))) @ Matrix.Rotation(math.radians(sign * -12), 3, 'Z').to_4x4()
        add_box(bm, size=(0.17, 0.09, 0.085), matrix=m_shell, mat_idx=3)
        # Mirror glass face
        m_mglass = Matrix.Translation(Vector((sign * 0.865, -0.565, 0.850)))
        add_box(bm, size=(0.13, 0.006, 0.070), matrix=m_mglass, mat_idx=1)
        # Amber LED repeater strip
        m_rep = Matrix.Translation(Vector((sign * 0.880, -0.525, 0.850)))
        add_box(bm, size=(0.04, 0.010, 0.012), matrix=m_rep, mat_idx=4)

    # Roof-Mounted Aerodynamic Shark-Fin Antenna
    m_ant = Matrix.Translation(Vector((0.0, -2.180, 1.395)))
    add_box(bm, size=(0.045, 0.16, 0.065), matrix=m_ant, mat_idx=0)

    mat_list = [
        mats["Trim_GlossBlack"], mats["Exhaust_Chrome_Tips"], mats["Exhaust_InnerSoot"],
        mats["CarPaint_SonicGrayPearl"], mats["Light_Amber_Indicator"]
    ]
    obj = create_mesh_object("AERO_Civic_Package", col, mat_list, bm, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=2)
    return obj


# ─── 7. Chassis Undertray Belly Pan & Inboard Wheel Tubs ───────────────────────
def build_chassis_and_wheel_tubs(col, mats):
    """
    Constructs the structural chassis flat undertray belly pan and inboard wheel tubs:
    - Encloses all four wheel wells with zero see-through voids
    - Positioned strictly inboard with cap_ends=False so outer alloy wheels remain 100% visible
    """
    bm = bmesh.new()

    # Flat Underbody Belly Pan
    m_pan = Matrix.Translation(Vector((0.0, -1.365, 0.125)))
    add_box(bm, size=(1.68, 4.45, 0.024), matrix=m_pan, mat_idx=0)

    # 4 Inner Wheel Well Tubs (Inboard positioning)
    tub_coords = [
        ( 0.600,  0.000, 0.335),  # FL
        (-0.600,  0.000, 0.335),  # FR
        ( 0.620, -2.735, 0.335),  # RL
        (-0.620, -2.735, 0.335),  # RR
    ]
    for tx, ty, tz in tub_coords:
        m_tub = Matrix.Translation(Vector((tx, ty, tz))) @ Matrix.Rotation(math.radians(90), 3, 'Y').to_4x4()
        add_cylinder(bm, radius1=0.350, radius2=0.350, depth=0.20, segments=36, matrix=m_tub, cap_ends=False, mat_idx=0)

    obj = create_mesh_object("CHASSIS_WheelTubs_And_Floor", col, [mats["Chassis_Underbody"]], bm, bevel_w=0.0, auto_smooth=45.0, subsurf_lvl=1)
    return obj


# ─── 8. Optical Dielectric Tinted Safety Glasshouse ───────────────────────────
def build_greenhouse_glass(col, mats):
    """
    Constructs the optical dielectric tinted glasshouse fitting directly into unibody apertures:
    - Raked fastback windshield (cowl to header)
    - Fastback rear backlite
    - Framed side door glass and fixed C-pillar quarter glass
    - Clear transparency revealing the honeycomb dashboard and floating OLED display
    """
    bm = bmesh.new()

    # Front Windshield Glass (Compound curve grid 3x3)
    ws_rows = [
        [Vector((-0.58, -0.50, 0.82)), Vector((0.0, -0.50, 0.83)), Vector((0.58, -0.50, 0.82))],
        [Vector((-0.55, -0.75, 1.15)), Vector((0.0, -0.75, 1.16)), Vector((0.55, -0.75, 1.15))],
        [Vector((-0.53, -1.00, 1.38)), Vector((0.0, -1.00, 1.39)), Vector((0.53, -1.00, 1.38))],
    ]
    ws_verts = [[bm.verts.new(p) for p in row] for row in ws_rows]
    for i in range(len(ws_rows) - 1):
        for j in range(2):
            safe_face_new(bm, [ws_verts[i][j], ws_verts[i][j+1], ws_verts[i+1][j+1], ws_verts[i+1][j]], mat_idx=0)

    # Rear Backlite Glass (Compound curve grid 3x3)
    rw_rows = [
        [Vector((-0.54, -2.10, 1.36)), Vector((0.0, -2.10, 1.37)), Vector((0.54, -2.10, 1.36))],
        [Vector((-0.58, -2.45, 1.14)), Vector((0.0, -2.45, 1.15)), Vector((0.58, -2.45, 1.14))],
        [Vector((-0.64, -2.73, 0.89)), Vector((0.0, -2.73, 0.90)), Vector((0.64, -2.73, 0.89))],
    ]
    rw_verts = [[bm.verts.new(p) for p in row] for row in rw_rows]
    for i in range(len(rw_rows) - 1):
        for j in range(2):
            safe_face_new(bm, [rw_verts[i][j], rw_verts[i][j+1], rw_verts[i+1][j+1], rw_verts[i+1][j]], mat_idx=0)

    # Side Windows & C-Pillar Fixed Quarter Glass
    for sign in [-1.0, 1.0]:
        # Front door window
        v1 = bm.verts.new(Vector((sign * 0.77, -0.54, 0.82)))
        v2 = bm.verts.new(Vector((sign * 0.57, -1.00, 1.38)))
        v3 = bm.verts.new(Vector((sign * 0.57, -1.38, 1.41)))
        v4 = bm.verts.new(Vector((sign * 0.77, -1.38, 0.82)))
        safe_face_new(bm, [v1, v2, v3, v4] if sign > 0 else [v1, v4, v3, v2], mat_idx=0)

        # Rear door window
        v5 = bm.verts.new(Vector((sign * 0.77, -1.41, 0.82)))
        v6 = bm.verts.new(Vector((sign * 0.57, -1.41, 1.41)))
        v7 = bm.verts.new(Vector((sign * 0.57, -2.10, 1.36)))
        v8 = bm.verts.new(Vector((sign * 0.77, -2.10, 0.82)))
        safe_face_new(bm, [v5, v6, v7, v8] if sign > 0 else [v5, v8, v7, v6], mat_idx=0)

        # C-Pillar Fixed Quarter Glass
        v9 = bm.verts.new(Vector((sign * 0.77, -2.12, 0.82)))
        v10 = bm.verts.new(Vector((sign * 0.57, -2.12, 1.36)))
        v11 = bm.verts.new(Vector((sign * 0.71, -2.52, 0.89)))
        safe_face_new(bm, [v9, v10, v11] if sign > 0 else [v9, v11, v10], mat_idx=0)

        # Gloss Black Window Surround Molding Trim
        m_trim = Matrix.Translation(Vector((sign * 0.77, -1.48, 0.815)))
        add_box(bm, size=(0.016, 2.15, 0.014), matrix=m_trim, mat_idx=1)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    mat_list = [mats["Glass_Greenhouse"], mats["Trim_GlossBlack"]]
    obj = create_mesh_object("GLASS_Greenhouse", col, mat_list, bm, bevel_w=0.002, auto_smooth=30.0, subsurf_lvl=0)
    return obj


# ─── 9. Articulating 4-Door Architecture ───────────────────────────────────────
def build_doors(col, mats):
    """
    Constructs articulating 4-door assemblies (DOOR_FL, DOOR_FR, DOOR_RL, DOOR_RR):
    - Physical hinge vectors with preserved local origins (export_apply=False)
    - Crisp 3.5mm perimeter shutlines conforming to beltline curvature
    - Contoured pull handles with recessed shadow pockets and interior door cards
    """
    doors = {}
    door_specs = [
        ("DOOR_FL",  1.0, -0.500, -1.370, Vector(( 0.850, -0.500, 0.480)), True),
        ("DOOR_FR", -1.0, -0.500, -1.370, Vector((-0.850, -0.500, 0.480)), True),
        ("DOOR_RL",  1.0, -1.390, -2.250, Vector(( 0.850, -1.390, 0.500)), False),
        ("DOOR_RR", -1.0, -1.390, -2.250, Vector((-0.850, -1.390, 0.500)), False),
    ]

    for name, sign, y_start, y_end, hinge_pivot, is_front in door_specs:
        bm = bmesh.new()
        y_f = y_start - hinge_pivot.y
        y_r = y_end - hinge_pivot.y
        dy_mid = (y_f + y_r) * 0.5
        door_len = abs(y_r - y_f)

        # 1. Outer Door Skin with solid flanges (flush fitment below beltline)
        m_skin = Matrix.Translation(Vector((sign * (0.850 - abs(hinge_pivot.x)), dy_mid, 0.480 - hinge_pivot.z)))
        add_box(bm, size=(0.024, door_len * 0.985, 0.630), matrix=m_skin, mat_idx=0)

        # 2. Gloss Black B-Pillar Sash
        b_y = y_r + 0.015 if is_front else y_f - 0.015
        m_bpost = Matrix.Translation(Vector((sign * (0.830 - abs(hinge_pivot.x)), b_y, 0.860 - hinge_pivot.z)))
        add_box(bm, size=(0.014, 0.035, 0.140), matrix=m_bpost, mat_idx=2)

        # 3. Body-Color Contoured Pull Handle
        h_y = y_r + 0.140 if is_front else y_r + 0.160
        m_hnd = Matrix.Translation(Vector((sign * (0.875 - abs(hinge_pivot.x)), h_y, 0.760 - hinge_pivot.z)))
        add_box(bm, size=(0.016, 0.125, 0.024), matrix=m_hnd, mat_idx=0)

        # 4. Interior Door Card (Anthracite fabric)
        m_card = Matrix.Translation(Vector((sign * (0.800 - abs(hinge_pivot.x)), dy_mid, 0.480 - hinge_pivot.z)))
        add_box(bm, size=(0.035, door_len * 0.96, 0.600), matrix=m_card, mat_idx=1)

        # 5. Gloss Black Armrest Accent
        m_arm = Matrix.Translation(Vector((sign * (0.780 - abs(hinge_pivot.x)), dy_mid, 0.620 - hinge_pivot.z)))
        add_box(bm, size=(0.010, door_len * 0.88, 0.030), matrix=m_arm, mat_idx=2)

        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002)

        mat_list = [
            mats["CarPaint_SonicGrayPearl"], mats["Interior_Fabric_Anthracite"], mats["Trim_GlossBlack"]
        ]
        obj = create_mesh_object(name, col, mat_list, bm, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=0)
        obj.location = hinge_pivot
        doors[name] = obj

    return doors["DOOR_FL"], doors["DOOR_FR"], doors["DOOR_RL"], doors["DOOR_RR"]


# ─── 10. Articulating Aluminum Hood & Rear Decklid ────────────────────────────
def build_hood_and_decklid(col, mats):
    """
    Constructs articulating lightweight aluminum hood and rear decklid:
    - Low, flat hood correctly sloped forward (-8.5 deg) flush with fenders and grille
    - Rear decklid with integrated ducktail spoiler sloped down (+4.2 deg) flush with taillights
    """
    # 1. Hood (Bonnet)
    hinge_hood = Vector((0.000, -0.500, 0.815))
    bm_hood = bmesh.new()

    y_cowl = -0.500 - hinge_hood.y # 0.0
    y_nose =  0.880 - hinge_hood.y # 1.38
    hood_len = abs(y_nose - y_cowl)
    dy_mid = (y_cowl + y_nose) * 0.5

    # Hood surface correctly pitched forward (-8.5 degrees)
    pitch_hood = math.radians(-8.5)
    m_hskin = Matrix.Translation(Vector((0.0, dy_mid, -0.090))) @ Matrix.Rotation(pitch_hood, 3, 'X').to_4x4()
    add_box(bm_hood, size=(1.22, hood_len * 0.98, 0.022), matrix=m_hskin, mat_idx=0)

    # Hood Under-pad
    m_pad = m_hskin @ Matrix.Translation(Vector((0.0, 0.0, -0.016)))
    add_box(bm_hood, size=(1.16, hood_len * 0.90, 0.012), matrix=m_pad, mat_idx=1)

    mat_hood = [mats["CarPaint_SonicGrayPearl"], mats["Trim_MatteBlack"]]
    hood_obj = create_mesh_object("HOOD_Bonnet", col, mat_hood, bm_hood, bevel_w=0.003, auto_smooth=32.0, subsurf_lvl=0)
    hood_obj.location = hinge_hood

    # 2. Trunk Decklid
    hinge_trunk = Vector((0.000, -2.735, 0.885))
    bm_trunk = bmesh.new()

    y_fr = -2.735 - hinge_trunk.y # 0.0
    y_rr = -3.720 - hinge_trunk.y # -0.985
    trunk_len = abs(y_rr - y_fr)
    dy_tmid = (y_fr + y_rr) * 0.5

    # Decklid sloped down rearward (+4.2 degrees around X)
    pitch_trunk = math.radians(4.2)
    m_tskin = Matrix.Translation(Vector((0.0, dy_tmid, -0.035))) @ Matrix.Rotation(pitch_trunk, 3, 'X').to_4x4()
    add_box(bm_trunk, size=(1.16, trunk_len * 0.98, 0.022), matrix=m_tskin, mat_idx=0)

    # Integrated Ducktail Lip Spoiler along trailing edge
    m_lip = m_tskin @ Matrix.Translation(Vector((0.0, -trunk_len * 0.48, 0.015)))
    add_box(bm_trunk, size=(1.14, 0.045, 0.025), matrix=m_lip, mat_idx=0)

    # Chrome Honda "H" Badge & Civic Script
    m_badge = m_tskin @ Matrix.Translation(Vector((0.0, -trunk_len * 0.42, 0.012)))
    add_box(bm_trunk, size=(0.090, 0.008, 0.075), matrix=m_badge, mat_idx=2)

    mat_trunk = [mats["CarPaint_SonicGrayPearl"], mats["Trim_MatteBlack"], mats["Trim_Chrome"]]
    trunk_obj = create_mesh_object("TRUNK_Decklid", col, mat_trunk, bm_trunk, bevel_w=0.003, auto_smooth=32.0, subsurf_lvl=0)
    trunk_obj.location = hinge_trunk

    return hood_obj, trunk_obj


# ─── 11. 1.5L VTEC Turbo Powertrain & Engine Bay ──────────────────────────────
def build_powertrain_and_bay(col, mats):
    """
    Constructs the 1.5L VTEC Turbo powertrain:
    - Transverse 4-cylinder alloy engine block
    - Red VTEC Turbo engine appearance cover with embossed Honda insignia
    - Aluminum strut tower braces & cross-flow cooling radiator pack
    """
    bm = bmesh.new()
    bay_y = 0.280
    bay_z = 0.520

    # Transverse Engine Block Core
    m_blk = Matrix.Translation(Vector((0.05, bay_y, bay_z)))
    add_box(bm, size=(0.58, 0.48, 0.38), matrix=m_blk, mat_idx=0)

    # Red VTEC Turbo Appearance Cover
    m_cov = Matrix.Translation(Vector((0.05, bay_y - 0.02, bay_z + 0.22)))
    add_box(bm, size=(0.48, 0.42, 0.035), matrix=m_cov, mat_idx=1)

    # Aluminum Strut Tower Cross-Brace
    m_brace = Matrix.Translation(Vector((0.0, 0.020, 0.740)))
    add_box(bm, size=(1.30, 0.028, 0.020), matrix=m_brace, mat_idx=0)

    # Front Radiator Cooling Pack & Suction Fan
    m_rad = Matrix.Translation(Vector((0.0, 0.780, 0.440)))
    add_box(bm, size=(0.68, 0.045, 0.38), matrix=m_rad, mat_idx=2)
    m_fan = Matrix.Translation(Vector((0.0, 0.740, 0.440))) @ Matrix.Rotation(math.radians(90), 3, 'Y').to_4x4()
    add_cylinder(bm, radius1=0.16, radius2=0.16, depth=0.025, segments=24, matrix=m_fan, mat_idx=2)

    mat_list = [mats["Engine_Alloy_Block"], mats["Engine_VTEC_CoverRed"], mats["Trim_MatteBlack"]]
    obj = create_mesh_object("POWERTRAIN_Engine_Bay", col, mat_list, bm, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=2)
    return obj


# ─── 12. Minimalist Cockpit Interior with Honeycomb Vent Ribbon ───────────────
def build_minimalist_cockpit(col, mats):
    """
    Constructs the 11th Gen Civic minimalist cockpit interior:
    - Full-width metal honeycomb mesh AC vent ribbon spanning across dashboard
    - Cantilevered floating 9-inch OLED infotainment touchscreen
    - 10.2-inch digital driver instrument binnacle
    - Contoured front sport bucket seats in Anthracite fabric
    - Minimalist 3-spoke sport steering wheel
    """
    bm = bmesh.new()

    # Front Sport Bucket Seats (Driver & Passenger)
    for sign in [1.0, -1.0]:
        sx = sign * 0.350
        sy = -1.100
        sz = 0.400

        # Seat cushion
        m_cush = Matrix.Translation(Vector((sx, sy, sz)))
        add_box(bm, size=(0.46, 0.50, 0.14), matrix=m_cush, mat_idx=0)

        # Backrest raked 16 degrees
        m_back = Matrix.Translation(Vector((sx, sy - 0.20, sz + 0.32))) @ Matrix.Rotation(math.radians(16), 3, 'X').to_4x4()
        add_box(bm, size=(0.44, 0.10, 0.56), matrix=m_back, mat_idx=0)

        # Headrest
        m_head = Matrix.Translation(Vector((sx, sy - 0.28, sz + 0.68)))
        add_box(bm, size=(0.24, 0.08, 0.15), matrix=m_head, mat_idx=0)

    # Rear Bench Seat
    m_rc = Matrix.Translation(Vector((0.0, -2.050, 0.440)))
    add_box(bm, size=(1.30, 0.52, 0.14), matrix=m_rc, mat_idx=0)
    m_rb = Matrix.Translation(Vector((0.0, -2.300, 0.720))) @ Matrix.Rotation(math.radians(18), 3, 'X').to_4x4()
    add_box(bm, size=(1.28, 0.10, 0.54), matrix=m_rb, mat_idx=0)

    # Dashboard Structure
    m_dash = Matrix.Translation(Vector((0.0, -0.640, 0.720)))
    add_box(bm, size=(1.40, 0.38, 0.24), matrix=m_dash, mat_idx=0)

    # Signature Full-Width Metal Honeycomb AC Vent Ribbon Mesh
    m_mesh = Matrix.Translation(Vector((0.0, -0.620, 0.680)))
    add_box(bm, size=(1.36, 0.015, 0.055), matrix=m_mesh, mat_idx=1)

    # Floating 9-Inch OLED Touchscreen Display (Angled toward driver)
    m_scr = Matrix.Translation(Vector((0.05, -0.600, 0.810))) @ Matrix.Rotation(math.radians(8), 3, 'Z').to_4x4()
    add_box(bm, size=(0.24, 0.012, 0.13), matrix=m_scr, mat_idx=2)

    # Driver 10.2-Inch Digital Instrument Cluster
    m_clust = Matrix.Translation(Vector((0.350, -0.610, 0.760)))
    add_box(bm, size=(0.26, 0.012, 0.12), matrix=m_clust, mat_idx=2)

    # Center Console with Shifter & Cupholders
    m_con = Matrix.Translation(Vector((0.0, -1.180, 0.380)))
    add_box(bm, size=(0.22, 1.30, 0.18), matrix=m_con, mat_idx=0)
    # Shifter lever
    m_shft = Matrix.Translation(Vector((0.0, -0.880, 0.520)))
    add_cylinder(bm, radius1=0.018, radius2=0.016, depth=0.10, segments=16, matrix=m_shft, mat_idx=0)

    # 3-Spoke Sport Steering Wheel (Driver side LHD X = 0.350m)
    st_center = Vector((0.350, -0.780, 0.690))
    m_st = Matrix.Translation(st_center) @ Matrix.Rotation(math.radians(-22), 3, 'X').to_4x4()
    add_torus(bm, r_major=0.160, r_minor=0.014, seg_maj=32, seg_min=12, matrix=m_st, mat_idx=0)
    add_cylinder(bm, radius1=0.042, radius2=0.040, depth=0.030, segments=24, matrix=m_st, mat_idx=0)

    mat_list = [
        mats["Interior_Fabric_Anthracite"], mats["Interior_Honeycomb_VentMesh"], mats["Interior_Screen_OLED"]
    ]
    obj = create_mesh_object("INTERIOR_Civic_Cockpit", col, mat_list, bm, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=2)
    return obj


# ─── 13. 18-Inch Two-Tone 5-Spoke Split Sport Alloy Wheels ────────────────────
def build_wheels_and_brakes(col, mats):
    """
    Constructs 18-inch two-tone 5-spoke split sport alloy wheels:
    - 5 split-spokes with machined face highlights and gloss black inner pockets
    - 235/40 R18 directional siped radial tires
    - Ventilated steel brake rotors and cast calipers
    """
    wheel_objects = []
    f_axle = 0.000
    r_axle = -2.735
    f_track = 1.547
    r_track = 1.575
    wheel_r = 0.323
    rim_r = 0.228  # 18-inch rim radius
    tire_w = 0.235

    wheel_configs = [
        ("Wheel_FL", Vector(( f_track * 0.5, f_axle, wheel_r)), True),
        ("Wheel_FR", Vector((-f_track * 0.5, f_axle, wheel_r)), False),
        ("Wheel_RL", Vector(( r_track * 0.5, r_axle, wheel_r)), True),
        ("Wheel_RR", Vector((-r_track * 0.5, r_axle, wheel_r)), False),
    ]

    for name, pos, is_left in wheel_configs:
        m_base = Matrix.Translation(pos) @ Matrix.Rotation(math.radians(90.0 if is_left else -90.0), 3, 'Y').to_4x4()

        # 1. 235/40 R18 Radial Tire with Siped Tread
        bm_tire = bmesh.new()
        add_cylinder(bm_tire, radius1=wheel_r, radius2=wheel_r, depth=tire_w, segments=48, matrix=m_base, cap_ends=False, mat_idx=0)
        for side_z in [-tire_w * 0.5, tire_w * 0.5]:
            m_sw = m_base @ Matrix.Translation(Vector((0, 0, side_z)))
            add_annulus(bm_tire, r_outer=wheel_r, r_inner=rim_r, depth=0.012, segments=48, matrix=m_sw, mat_idx=0)
        # 36 carved directional tread sipes
        for s_idx in range(36):
            th = 2.0 * math.pi * s_idx / 36.0
            sx = math.cos(th) * wheel_r * 0.998
            sy = math.sin(th) * wheel_r * 0.998
            m_sipe = m_base @ Matrix.Translation(Vector((sx, sy, 0))) @ Matrix.Rotation(th, 3, 'Z').to_4x4()
            add_box(bm_tire, size=(0.005, 0.024, tire_w * 0.92), matrix=m_sipe, mat_idx=0)

        tire_obj = create_mesh_object(name + "_Tire", col, [mats["Tire_Radial_Rubber"]], bm_tire, bevel_w=0.003, auto_smooth=45.0, subsurf_lvl=1)

        # 2. 18-Inch Two-Tone 5-Spoke Split Sport Alloy Rim
        bm_rim = bmesh.new()
        add_annulus(bm_rim, r_outer=rim_r, r_inner=rim_r - 0.022, depth=tire_w * 0.85, segments=52, matrix=m_base, mat_idx=0)
        m_lip = m_base @ Matrix.Translation(Vector((0, 0, tire_w * 0.42)))
        add_annulus(bm_rim, r_outer=rim_r, r_inner=rim_r - 0.012, depth=0.015, segments=52, matrix=m_lip, mat_idx=0)

        # 5 Split-Spoke Armatures (Machined Face & Black Pockets)
        m_face = m_base @ Matrix.Translation(Vector((0, 0, tire_w * 0.38)))
        add_annulus(bm_rim, r_outer=rim_r - 0.012, r_inner=0.060, depth=0.015, segments=52, matrix=m_face, mat_idx=1)
        for sp_idx in range(5):
            th = 2.0 * math.pi * sp_idx / 5.0
            # Dual split spoke blades
            for d_th in [-0.12, 0.12]:
                sp_ang = th + d_th
                sp_x = math.cos(sp_ang) * 0.140
                sp_y = math.sin(sp_ang) * 0.140
                m_sp = m_face @ Matrix.Translation(Vector((sp_x, sp_y, 0.004))) @ Matrix.Rotation(sp_ang, 3, 'Z').to_4x4()
                add_box(bm_rim, size=(0.14, 0.026, 0.016), matrix=m_sp, mat_idx=0)

        # Center Lug Bowl & Chrome "H" Center Cap
        add_cylinder(bm_rim, radius1=0.060, radius2=0.054, depth=0.028, segments=28, matrix=m_face, mat_idx=0)
        m_cap = m_face @ Matrix.Translation(Vector((0, 0, 0.012)))
        add_cylinder(bm_rim, radius1=0.032, radius2=0.032, depth=0.008, segments=24, matrix=m_cap, mat_idx=2)

        rim_obj = create_mesh_object(name + "_Rim", col, [mats["Wheel_MachinedAlloy"], mats["Wheel_GlossBlackPockets"], mats["Trim_Chrome"]], bm_rim, bevel_w=0.002, auto_smooth=35.0, subsurf_lvl=2)

        # 3. Ventilated Steel Brake Rotor
        bm_brake = bmesh.new()
        rotor_r = 0.175
        add_annulus(bm_brake, r_outer=rotor_r, r_inner=0.085, depth=0.026, segments=44, matrix=m_base, mat_idx=0)
        rotor_obj = create_mesh_object(name + "_BrakeDisc", col, [mats["Brake_Rotor_Steel"]], bm_brake, bevel_w=0.0, auto_smooth=45.0, subsurf_lvl=2)

        # 4. Cast Brake Caliper
        bm_cal = bmesh.new()
        m_cal = m_base @ Matrix.Translation(Vector((0.130, 0.050, tire_w * 0.18)))
        add_box(bm_cal, size=(0.120, 0.180, 0.065), matrix=m_cal, mat_idx=0)
        cal_obj = create_mesh_object(name + "_Caliper", col, [mats["Brake_Caliper_Cast"]], bm_cal, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=2)

        wheel_objects.extend([tire_obj, rim_obj, rotor_obj, cal_obj])

    return wheel_objects


# ─── 14. 10 Semantic Audio-Haptic Hitboxes ─────────────────────────────────────
def build_hitboxes(col, mats):
    """Constructs 10 semantic audio-haptic collision hitboxes with extras metadata."""
    hitbox_defs = [
        ("HITBOX_DOOR_FL",  Vector(( 0.850, -0.850, 0.620)), (0.24, 0.90, 0.72), "door_civic_click", "medium"),
        ("HITBOX_DOOR_FR",  Vector((-0.850, -0.850, 0.620)), (0.24, 0.90, 0.72), "door_civic_click", "medium"),
        ("HITBOX_DOOR_RL",  Vector(( 0.850, -1.820, 0.620)), (0.24, 0.88, 0.72), "door_civic_click", "medium"),
        ("HITBOX_DOOR_RR",  Vector((-0.850, -1.820, 0.620)), (0.24, 0.88, 0.72), "door_civic_click", "medium"),
        ("HITBOX_HOOD",     Vector(( 0.000,  0.220, 0.760)), (1.28, 1.15, 0.18), "aluminum_hood_pop", "heavy"),
        ("HITBOX_TRUNK",    Vector(( 0.000, -3.280, 0.840)), (1.25, 0.60, 0.20), "trunk_pneumatic_pop", "medium"),
        ("HITBOX_WHEEL_FL", Vector(( 0.773,  0.000, 0.323)), (0.30, 0.66, 0.66), "tire_rubber_thud", "light"),
        ("HITBOX_WHEEL_FR", Vector((-0.773,  0.000, 0.323)), (0.30, 0.66, 0.66), "tire_rubber_thud", "light"),
        ("HITBOX_CABIN",    Vector(( 0.000, -1.365, 0.880)), (1.42, 1.85, 0.80), "fabric_creak", "light"),
        ("HITBOX_ENGINE",   Vector(( 0.000,  0.280, 0.520)), (0.78, 0.85, 0.50), "vtec_turbo_mechanical", "heavy"),
    ]

    mat_hb = mats["Material_Hitbox_Invisible"]
    for name, loc, size, sfx, haptic in hitbox_defs:
        bm = bmesh.new()
        add_box(bm, size=size, matrix=Matrix.Translation(loc), mat_idx=0)
        obj = create_mesh_object(name, col, [mat_hb], bm, bevel_w=0.0, auto_smooth=30.0, subsurf_lvl=0)
        obj["interactive"] = True
        obj["sound_fx"] = sfx
        obj["haptic"] = haptic
        obj.display_type = 'WIRE'
        obj.hide_viewport = True
        obj.hide_render = True


# ─── 15. Standardized glTF Cameras ─────────────────────────────────────────────
def build_cameras(col):
    """Installs standardized inspection cameras for automotive assessment."""
    cams = [
        ("CAMERA_HERO_34", Vector(( 4.8,  4.8, 1.55)), Vector((0.0, -1.36, 0.65)), 50.0),
        ("CAMERA_REAR_34", Vector(( 4.8, -6.5, 1.55)), Vector((0.0, -1.36, 0.65)), 50.0),
        ("CAMERA_SIDE",    Vector(( 7.2, -1.36, 0.75)), Vector((0.0, -1.36, 0.65)), 52.0),
        ("CAMERA_COCKPIT", Vector(( 0.35, -1.10, 1.10)), Vector((0.35, -0.60, 0.80)), 28.0),
    ]
    for name, loc, target, focal in cams:
        cam_data = bpy.data.cameras.new(name)
        cam_data.lens = focal
        cam_obj = bpy.data.objects.new(name, cam_data)
        cam_obj.location = loc
        dir_v = (target - loc).normalized()
        cam_obj.rotation_euler = dir_v.to_track_quat('-Z', 'Y').to_euler()
        col.objects.link(cam_obj)


# ─── 16. Baked Keyframed NLA Actions ───────────────────────────────────────────
def bake_nla_actions(door_fl, door_fr, door_rl, door_rr, hood_obj, trunk_obj, wheel_objs):
    """Bakes physical kinematic NLA actions for interactive door, hood & trunk articulation."""
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 40

    def bake_rotation(obj, action_name, axis, angle_deg):
        act = bpy.data.actions.new(name=action_name)
        obj.animation_data_create()
        obj.animation_data.action = act
        obj.rotation_euler = (0, 0, 0)
        obj.keyframe_insert(data_path="rotation_euler", frame=1)
        rot = [0.0, 0.0, 0.0]
        if axis == 'Z':
            rot[2] = math.radians(angle_deg)
        elif axis == 'X':
            rot[0] = math.radians(angle_deg)
        elif axis == 'Y':
            rot[1] = math.radians(angle_deg)
        obj.rotation_euler = tuple(rot)
        obj.keyframe_insert(data_path="rotation_euler", frame=40)
        obj.rotation_euler = (0, 0, 0)

    bake_rotation(door_fl, "Action_Door_FL_Open", 'Z',  52.0)
    bake_rotation(door_fr, "Action_Door_FR_Open", 'Z', -52.0)
    bake_rotation(door_rl, "Action_Door_RL_Open", 'Z',  50.0)
    bake_rotation(door_rr, "Action_Door_RR_Open", 'Z', -50.0)
    bake_rotation(hood_obj, "Action_Hood_Open",    'X', -46.0)
    bake_rotation(trunk_obj, "Action_Trunk_Open",  'X',  44.0)


# ─── 17. Master Assembly Pipeline ──────────────────────────────────────────────
def generate_honda_civic_sedan_master():
    """Master procedural assembly pipeline for 11th Gen Honda Civic Sedan (FE/FL)."""
    print("=" * 80)
    print("STARTING CLASS-A MASTER CAD GENERATION: 11TH GEN HONDA CIVIC SEDAN (2020s SEDAN)")
    print("=" * 80)

    clean_scene()

    col_master = bpy.data.collections.new("Civic_Sedan_Master")
    bpy.context.scene.collection.children.link(col_master)

    print("▸ Building 20 Authentic PBR Materials...")
    mats = build_materials()

    print("▸ Building Watertight Class-A Unibody Shell with Low Cowl & Aperture Cutouts...")
    body_obj = build_unibody_watertight(col_master, mats)

    print("▸ Building Front Upper Grille Bar & Lower Honeycomb Fascia...")
    grille_obj = build_front_fascia_and_grille(col_master, mats)

    print("▸ Building Jewel-Eye Full-LED Headlamps & Inverted-L Taillights...")
    light_obj = build_lighting_optics(col_master, mats)

    print("▸ Building Aerodynamic Package, Splitters, Mirrors & Shark Fin Antenna...")
    aero_obj = build_aerodynamics(col_master, mats)

    print("▸ Building Chassis Flat Undertray Belly Pan & Inboard Wheel Tubs...")
    chassis_obj = build_chassis_and_wheel_tubs(col_master, mats)

    print("▸ Building Optical Dielectric Tinted Safety Glasshouse...")
    glass_obj = build_greenhouse_glass(col_master, mats)

    print("▸ Building Articulating 4-Door Architecture & Anthracite Door Cards...")
    door_fl, door_fr, door_rl, door_rr = build_doors(col_master, mats)

    print("▸ Building Articulating Aluminum Hood & Rear Decklid with Ducktail Spoiler...")
    hood_obj, trunk_obj = build_hood_and_decklid(col_master, mats)

    print("▸ Building 1.5L VTEC Turbo Powertrain & Engine Bay...")
    pwt_obj = build_powertrain_and_bay(col_master, mats)

    print("▸ Building Minimalist Cockpit Interior with Honeycomb Vent Mesh & 9\" Screen...")
    cockpit_obj = build_minimalist_cockpit(col_master, mats)

    print("▸ Building 18-Inch Two-Tone 5-Spoke Split Sport Alloy Wheels & Radials...")
    wheel_objs = build_wheels_and_brakes(col_master, mats)

    print("▸ Building 10 Semantic Audio-Haptic Hitboxes...")
    build_hitboxes(col_master, mats)

    print("▸ Building Standardized glTF Cameras...")
    build_cameras(col_master)

    print("▸ Baking 6 Keyframed NLA Actions...")
    bake_nla_actions(door_fl, door_fr, door_rl, door_rr, hood_obj, trunk_obj, wheel_objs)

    # Pre-export modifier baking protocol
    print("Executing pre-export modifier baking protocol...")
    for obj in list(col_master.all_objects):
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            for mod in list(obj.modifiers):
                if mod.type in ['BEVEL', 'SUBSURF', 'WEIGHTED_NORMAL']:
                    try:
                        bpy.ops.object.modifier_apply(modifier=mod.name)
                    except Exception as e:
                        print(f"    [WARN] Modifier apply error on {obj.name}: {e}")

    total_tris = sum(len(o.data.polygons) * 2 for o in col_master.all_objects if o.type == 'MESH')
    print(f"[Honda Civic Sedan] Evaluated Class-A CAD Geometry: {total_tris:,} triangles across {len(col_master.all_objects)} objects.")

    # Export paths
    export_dir = "e:/Car_Automation/public/models/vehicles/sedan/2020s"
    os.makedirs(export_dir, exist_ok=True)
    os.makedirs("e:/Car_Automation/public/models", exist_ok=True)
    os.makedirs("e:/Car_Automation/exports", exist_ok=True)

    glb_main = os.path.join(export_dir, "vehicle.glb")
    glb_opt = os.path.join(export_dir, "vehicle.opt.glb")

    print(f"▸ Exporting Primary Production GLB to: {glb_main}")
    bpy.ops.export_scene.gltf(
        filepath=glb_main,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_extras=True,
        export_yup=True,
        export_animations=True,
        export_animation_mode='ACTIONS',
        export_cameras=True,
        export_lights=False
    )

    size_mb = os.path.getsize(glb_main) / (1024 * 1024)
    print(f"✅ Exported vehicle.glb successfully! File size: {size_mb:.2f} MB")

    mirrors = [
        "e:/Car_Automation/public/models/Car_Honda_Civic_Sedan_2020s.glb",
        "e:/Car_Automation/public/models/Car_Honda_Civic_Sedan_Complete.glb",
        "e:/Car_Automation/exports/Car_Honda_Civic_Sedan_2020s.glb",
        "e:/Car_Automation/exports/Car_Honda_Civic_Sedan_Complete.glb",
    ]
    for m in mirrors:
        shutil.copy2(glb_main, m)
        print(f"  ▸ Mirrored to: {m}")

    print("▸ Generating companion Meshopt compressed asset (vehicle.opt.glb)...")
    try:
        cmd = f'npx -y gltfpack -i "{glb_main}" -o "{glb_opt}" -cc -kn -km -ke'
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if os.path.exists(glb_opt):
            opt_mb = os.path.getsize(glb_opt) / (1024 * 1024)
            print(f"✅ Meshopt companion generated! File size: {opt_mb:.2f} MB")
            for m in mirrors:
                opt_m = m.replace(".glb", ".opt.glb")
                shutil.copy2(glb_opt, opt_m)
        else:
            print(f"⚠️ gltfpack did not create {glb_opt}: {res.stderr}")
    except Exception as e:
        print(f"⚠️ gltfpack execution error: {e}")

    print("=" * 80)
    print("HONDA CIVIC SEDAN MASTER CAD PIPELINE COMPLETED")
    print("=" * 80)
    return glb_main


if __name__ == "__main__":
    generate_honda_civic_sedan_master()
