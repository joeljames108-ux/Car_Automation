"""
=============================================================================
Procedural Class-A CAD Generator: Jaguar F-Type V8 R Convertible (2010s)
PHASE 20: Exterior Micro-Detailing, Jewelry, Lighting Optics & Badging
=============================================================================
Convertible Architecture · 2010s Era Modern British Performance Icon (X152)
Engineered at Whitley / Castle Bromwich, Birmingham, UK.
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Phase 20 Architectural Scope:
1. Complete PBR Material Suite for Micro-Jewelry:
   - Firesand Metallic Orange Pearlescent Clearcoat
   - Mirror-Polished High-Gloss Automotive Chrome
   - Optical Polycarbonate Headlamp Lens (Transmission 0.95, IOR 1.52)
   - Brilliant White J-Blade LED DRL Light-Pipe (Emission 18.0)
   - Bi-Xenon Spherical Projector Lens Glass (Transmission 0.98, IOR 1.54)
   - Jaguar Signature Ruby Red LED Taillamp Rings (Transmission 0.74, Emission 6.0)
   - Crystal Clear Reverse Lamp Diffuser (Transmission 0.92)
   - Red Cloisonné Jaguar Growler Enamel Field (#B80812)
   - First-Surface Optical Mirror Glass (Metallic 1.0, Roughness 0.01)
   - Polished Inconel / Stainless Quad Exhaust Finishers
   - Matte Carbon Exhaust Inner Soot Baffle
   - Satin Black EPDM Weatherstrip Rubber
   - Gloss Piano Black Aero Accents
2. Precision CAD Jewelry Subsystems:
   - J-Blade White LED Cat-Eye DRLs & Bi-Xenon Headlight Optics
   - Round Dual-Ring Rear Taillights & Connecting Red LED Light Blade
   - Quad 90mm Outboard Round Exhaust Tips with Rolled Lips
   - Aerodynamic Teardrop Door Mirrors with Integrated LED Repeaters
   - Flush Motorized Pop-Out Door Handles & Touch Sensors
   - Front Fender Louvered Air Vents with Chrome "JAGUAR" Vane
   - Front Grille Red Cloisonné Jaguar Growler Emblem with 3D Snarling Cat
   - Rear 3D Chrome Jaguar Leaper (Prowling Cat) Decklid Emblem
   - Rear "F-TYPE" & Multi-Color Enamel "R" Performance Badges
   - Active Deployable Rear Spoiler Retraction Seam & 24-LED CHMSL
   - Dual Articulated Windshield Wiper Arms with Aerodynamic Airfoils
   - Front Bumper Washer Jets & Clamshell Hood Spray Nozzles
   - Stamped Front & Rear License Plates with LED Illuminators
   - Yellow Brembo Brake Caliper "JAGUAR" Relief Script
   - 20-Inch Cyclone Wheel Center Caps with Red Growler Roundels
   - Multi-Target GLB Export for Showroom Integration
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# Import Phase 19 generator to load complete base vehicle
gen_dir = os.path.dirname(os.path.abspath(__file__))
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

import generate_jaguar_ftype_v8r_phase1

# ----------------------------------------------------------------------------
# 1. CORE UTILITIES & COMPATIBILITY HELPERS
# ----------------------------------------------------------------------------

def _compat_create_cylinder(bm, radius=1.0, depth=2.0, segments=16, cap_ends=True, cap_tris=False, matrix=None, **kwargs):
    r1 = kwargs.pop('radius1', radius)
    r2 = kwargs.pop('radius2', radius)
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
bmesh.ops.create_cylinder = _compat_create_cylinder


def _compat_create_torus(bm, major_radius=1.0, minor_radius=0.25, major_segments=24, minor_segments=12, matrix=None, **kwargs):
    if matrix is None:
        matrix = Matrix()
    verts = []
    for i in range(major_segments):
        u = 2.0 * math.pi * i / major_segments
        cos_u, sin_u = math.cos(u), math.sin(u)
        ring_center = Vector((major_radius * cos_u, major_radius * sin_u, 0.0))
        radial_dir = Vector((cos_u, sin_u, 0.0))
        z_dir = Vector((0.0, 0.0, 1.0))
        ring_verts = []
        for j in range(minor_segments):
            v = 2.0 * math.pi * j / minor_segments
            pos = ring_center + minor_radius * (math.cos(v) * radial_dir + math.sin(v) * z_dir)
            ring_verts.append(bm.verts.new(matrix @ pos))
        verts.append(ring_verts)
    bm.verts.ensure_lookup_table()
    for i in range(major_segments):
        next_i = (i + 1) % major_segments
        for j in range(minor_segments):
            next_j = (j + 1) % minor_segments
            v0 = verts[i][j]
            v1 = verts[next_i][j]
            v2 = verts[next_i][next_j]
            v3 = verts[i][next_j]
            bm.faces.new((v0, v1, v2, v3))
    bm.faces.ensure_lookup_table()
bmesh.ops.create_torus = _compat_create_torus


def _ensure_mat(name):
    """Retrieves or creates a material with node-tree enabled."""
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    return mat


def link_obj(name, bm, parent_col, mat=None, bevel=0.002, subsurf=0):
    """Creates an object, welds coincident vertices, applies smooth shading, bevel, and weighted normals."""
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0001)

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    if hasattr(mesh, "shade_smooth_by_angle"):
        mesh.shade_smooth_by_angle(angle=math.radians(35))
    else:
        mesh.polygons.foreach_set("use_smooth", [True] * len(mesh.polygons))

    obj = bpy.data.objects.new(name, mesh)
    parent_col.objects.link(obj)

    if mat:
        obj.data.materials.append(mat)

    if bevel > 0.0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)
        bev.profile = 0.7

    wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True

    if subsurf > 0:
        sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = subsurf
        sub.render_levels = subsurf

    return obj


# ----------------------------------------------------------------------------
# 2. COMPLETE PBR SHADER FACTORY FOR MICRO-JEWELRY
# ----------------------------------------------------------------------------

def create_jaguar_ftype_jewelry_materials():
    """Builds the specialized PBR materials for F-Type jewelry, optics, badges, and chrome."""
    mats = {}

    # 1. Optical Polycarbonate Headlamp Outer Lens
    mat_hl_lens = _ensure_mat("JAGUAR_Headlight_Optical_Lens")
    bsdf = mat_hl_lens.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.95, 0.98, 1.0, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.01
        bsdf.inputs["IOR"].default_value = 1.52
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.95
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.95
    if hasattr(mat_hl_lens, 'blend_method'):
        mat_hl_lens.blend_method = 'BLEND'
    if hasattr(mat_hl_lens, 'shadow_method'):
        mat_hl_lens.shadow_method = 'NONE'
    mats["headlight_lens"] = mat_hl_lens

    # 2. Brilliant White J-Blade LED DRL Light-Pipe
    mat_drl = _ensure_mat("JAGUAR_JBlade_LED_DRL_Emissive")
    bsdf = mat_drl.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (1.0, 1.0, 1.0, 1.0)
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (0.95, 0.98, 1.0, 1.0)
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (0.95, 0.98, 1.0, 1.0)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = 18.0
    mats["drl_white"] = mat_drl

    # 3. Bi-Xenon Projector Spherical Lens Glass
    mat_proj = _ensure_mat("JAGUAR_BiXenon_Projector_Glass")
    bsdf = mat_proj.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.90, 0.95, 1.0, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.01
        bsdf.inputs["IOR"].default_value = 1.54
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.98
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.98
    mats["projector_glass"] = mat_proj

    # 4. Mirror-Polished High-Gloss Chrome
    mat_chrome = _ensure_mat("JAGUAR_Jewelry_Chrome")
    bsdf = mat_chrome.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.96, 0.97, 0.98, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.99
        bsdf.inputs["Roughness"].default_value = 0.02
    mats["chrome"] = mat_chrome

    # 5. Gloss Piano Black (Headlamp Buckets, Aero Trim, Diffuser)
    mat_piano = _ensure_mat("JAGUAR_Jewelry_Piano_Black")
    bsdf = mat_piano.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.015, 0.015, 0.018, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.20
        bsdf.inputs["Roughness"].default_value = 0.08
    mats["piano_black"] = mat_piano

    # 6. Amber LED Turn Signal Indicators
    mat_amber = _ensure_mat("JAGUAR_Amber_LED_Turn_Indicator")
    bsdf = mat_amber.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (1.0, 0.45, 0.02, 1.0)
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (1.0, 0.42, 0.01, 1.0)
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (1.0, 0.42, 0.01, 1.0)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = 14.0
    mats["amber_led"] = mat_amber

    # 7. Signature Ruby Red LED Taillight Lens & Lightbar
    mat_red = _ensure_mat("JAGUAR_Ruby_Red_LED_Taillight")
    bsdf = mat_red.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.75, 0.02, 0.04, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.04
        bsdf.inputs["IOR"].default_value = 1.54
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.74
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.74
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (0.85, 0.02, 0.03, 1.0)
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (0.85, 0.02, 0.03, 1.0)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = 6.0
    mats["taillight_red"] = mat_red

    # 8. Crystal Clear Reverse Lamp Diffuser
    mat_rev = _ensure_mat("JAGUAR_Reverse_Lamp_Diffuser")
    bsdf = mat_rev.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.95, 0.98, 1.0, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.08
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.92
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.92
    mats["reverse_clear"] = mat_rev

    # 9. Red Cloisonné Jaguar Growler Enamel
    mat_growler_red = _ensure_mat("JAGUAR_Red_Cloisonne_Enamel")
    bsdf = mat_growler_red.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.72, 0.04, 0.08, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.15
        bsdf.inputs["Roughness"].default_value = 0.12
    mats["growler_red"] = mat_growler_red

    # 10. First-Surface Optical Mirror Glass
    mat_mir = _ensure_mat("JAGUAR_Exterior_Mirror_Optical_Glass")
    bsdf = mat_mir.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.98, 0.99, 1.0, 1.0)
        bsdf.inputs["Metallic"].default_value = 1.0
        bsdf.inputs["Roughness"].default_value = 0.01
    mats["mirror_glass"] = mat_mir

    # 11. Polished Stainless Exhaust Tips
    mat_tip = _ensure_mat("JAGUAR_Polished_Stainless_Exhaust")
    bsdf = mat_tip.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.84, 0.86, 0.88, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.95
        bsdf.inputs["Roughness"].default_value = 0.08
    mats["exhaust_tip"] = mat_tip

    # 12. Exhaust Inner Matte Soot Baffle
    mat_soot = _ensure_mat("JAGUAR_Exhaust_Inner_Soot")
    bsdf = mat_soot.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.04, 0.04, 0.045, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.95
    mats["exhaust_soot"] = mat_soot

    # 13. Satin Black EPDM Weatherstrip Rubber
    mat_trim = _ensure_mat("JAGUAR_EPDM_Weatherstrip_Trim")
    bsdf = mat_trim.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.06, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.70
    mats["trim"] = mat_trim

    # 14. "R" Badge Enamel Green
    mat_r_green = _ensure_mat("JAGUAR_R_Badge_British_Green")
    bsdf = mat_r_green.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.02, 0.35, 0.12, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.15
    mats["badge_green"] = mat_r_green

    # 15. "R" Badge Enamel Red
    mats["badge_red"] = mat_growler_red

    # 16. Firesand Metallic Orange Body Paint
    mat_paint = bpy.data.materials.get("JAGUAR_Firesand_Metallic_Orange")
    if not mat_paint:
        mat_paint = _ensure_mat("JAGUAR_Firesand_Metallic_Orange")
        bsdf = mat_paint.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.88, 0.22, 0.02, 1.0)
            bsdf.inputs["Metallic"].default_value = 0.82
            bsdf.inputs["Roughness"].default_value = 0.14
    mats["body"] = mat_paint

    # 17. Billet Machined Aluminum Alloy
    mat_alloy = _ensure_mat("JAGUAR_Jewelry_Alloy")
    bsdf = mat_alloy.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.85, 0.86, 0.88, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.90
        bsdf.inputs["Roughness"].default_value = 0.22
    mats["alloy"] = mat_alloy

    # 18. Polished Inconel / Stainless Heat Shield
    mat_inconel = _ensure_mat("JAGUAR_Jewelry_Inconel")
    bsdf = mat_inconel.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.82, 0.83, 0.85, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.94
        bsdf.inputs["Roughness"].default_value = 0.18
    mats["inconel"] = mat_inconel

    # 19. Vulcanized EPDM Synthetic Rubber
    mat_rubber = _ensure_mat("JAGUAR_Jewelry_Rubber")
    bsdf = mat_rubber.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.04, 0.04, 0.045, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.85
    mats["rubber"] = mat_rubber

    return mats


# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 1: PREDATORY J-BLADE LED DRL & BI-XENON HEADLIGHTS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_jblade_headlights(parent_col, mats):
    """
    Constructs the feline cat-eye headlight assemblies with signature J-Blade:
    - Left and right contoured composite housings recessed into front fenders (X = +/- 0.680m, Y = +1.980m, Z = 0.685m).
    - Iconic continuous brilliant white J-Blade LED Daytime Running Light (DRL) light-pipe tracing lower and outer edge.
    - Large 70mm spherical convex Bi-Xenon projector low/high beam lens in satin chrome bezel.
    - Inner horizontal chrome eyebrow strake and auxiliary high-intensity halogen cornering lamp.
    - Outer amber LED turn signal strip integrated into J-blade terminus.
    - Swept 3D curved aerodynamic polycarbonate outer clear lens covers conforming to fender contour.
    """
    objs = []
    bm_hl = bmesh.new()
    bm_drl = bmesh.new()
    bm_lens = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        x_base = hx_sign * 0.620
        y_base = 1.950
        z_base = 0.680

        mat_hl = Matrix.Translation(Vector((x_base, y_base, z_base))) @ Euler((-math.radians(16), hx_sign * math.radians(-6), hx_sign * math.radians(10)), 'XYZ').to_matrix().to_4x4()

        # 1. Dark Composite Inner Housing Bucket (Flush fitting into hood slope)
        bmesh.ops.create_cube(bm_hl, size=1.0, matrix=mat_hl @ Matrix.Diagonal(Vector((0.150, 0.280, 0.020, 1.0))))

        # 2. Bi-Xenon Main Projector Lens & Chrome Bezel Ring (Inboard chamber)
        mat_proj = mat_hl @ Matrix.Translation(Vector((hx_sign * -0.025, 0.040, 0.004)))
        # Chrome Outer Bezel
        bmesh.ops.create_cylinder(bm_hl, radius=0.036, depth=0.016, segments=24, matrix=mat_proj @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Convex Spherical Glass Projector Lens
        bmesh.ops.create_cylinder(bm_hl, radius=0.030, depth=0.012, segments=22, matrix=mat_proj @ Matrix.Translation(Vector((0, 0.008, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Inner Chrome Eyebrow & Cornering Lamp Reflector
        mat_eyebrow = mat_hl @ Matrix.Translation(Vector((hx_sign * -0.040, -0.040, 0.003)))
        bmesh.ops.create_cylinder(bm_hl, radius=0.026, depth=0.014, segments=18, matrix=mat_eyebrow @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Signature J-Blade White LED DRL Light-Pipe
        # Traces along bottom edge then hooks sharply upward along outboard flank
        j_pts = [
            Vector((hx_sign * -0.055,  0.100, -0.005)), # Inboard lower tip
            Vector((hx_sign * -0.020,  0.050, -0.005)), # Lower under-projector run
            Vector((hx_sign *  0.030, -0.010, -0.004)), # Lower outer bend
            Vector((hx_sign *  0.055, -0.060,  0.000)), # Outer hook corner
            Vector((hx_sign *  0.062, -0.100,  0.006)), # Swept upper hook blade
        ]
        for j_i in range(len(j_pts) - 1):
            p1 = mat_hl @ j_pts[j_i]
            p2 = mat_hl @ j_pts[j_i + 1]
            mid_j = (p1 + p2) * 0.5
            mat_jseg = Matrix.Translation(mid_j) @ Vector((0, 0, 1)).rotation_difference(p2 - p1).to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_drl, radius=0.005, depth=(p2 - p1).length, segments=12, matrix=mat_jseg)

        # 5. Polycarbonate Clear Outer Curved Cover Lens (Aerodynamic flush shell)
        mat_cove = mat_hl @ Matrix.Translation(Vector((0, 0.004, 0.004)))
        bmesh.ops.create_cube(bm_lens, size=1.0, matrix=mat_cove @ Matrix.Diagonal(Vector((0.155, 0.285, 0.016, 1.0))))

    obj_hl = link_obj("GEO_FTYPE_Headlight_Housings_and_Projectors", bm_hl, parent_col, mats["chrome"], bevel=0.0008)
    obj_drl = link_obj("GEO_FTYPE_JBlade_LED_DRL_Lightpipes", bm_drl, parent_col, mats["drl_white"], bevel=0.0004)
    obj_lens = link_obj("GEO_FTYPE_Headlight_Polycarbonate_Lenses", bm_lens, parent_col, mats["headlight_lens"], bevel=0.0004)

    objs.extend([obj_hl, obj_drl, obj_lens])
    return objs


# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 2: SIGNATURE ROUND DUAL-RING TAILLIGHTS & RED LIGHTBAR
# ----------------------------------------------------------------------------

def build_jaguar_ftype_round_ring_taillights(parent_col, mats):
    """
    Constructs the trademark Jaguar slim horizontal wrap-around LED taillight blades:
    - Ultra-slim horizontal LED blades wrapping around the broad muscular rear haunches (X = +/- 0.740m, Y = -2.040m, Z = 0.765m).
    - Circular internal ruby red LED brake light cutouts (Ian Callum's tribute to the iconic E-Type).
    - Continuous thin red LED light-pipe connecting outer clusters across the rear tailgate.
    - Crystal-clear reverse lamp diffuser lens and amber LED turn signal strip.
    """
    objs = []
    bm_thousing = bmesh.new()
    bm_tred = bmesh.new()
    bm_trev = bmesh.new()
    bm_tlens = bmesh.new()

    for tx_sign in [-1.0, 1.0]:
        x_tail = tx_sign * 0.660
        y_tail = -2.065
        z_tail = 0.770

        mat_tl = Matrix.Translation(Vector((x_tail, y_tail, z_tail))) @ Euler((math.radians(-10), 0.0, tx_sign * math.radians(12)), 'XYZ').to_matrix().to_4x4()

        # 1. Dark Smoked Internal Housing Bucket (Flush haunch slot)
        bmesh.ops.create_cube(bm_thousing, size=1.0, matrix=mat_tl @ Matrix.Diagonal(Vector((0.220, 0.025, 0.026, 1.0))))

        # 2. Circular Ruby Red Brake Light Roundel (The iconic E-Type round cutout)
        mat_roundel = mat_tl @ Matrix.Translation(Vector((tx_sign * -0.030, -0.008, 0.0)))
        # Outer Chrome Ring
        bmesh.ops.create_cylinder(bm_thousing, radius=0.026, depth=0.010, segments=24, matrix=mat_roundel @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Red LED Inner Ring
        bmesh.ops.create_cylinder(bm_tred, radius=0.022, depth=0.012, segments=22, matrix=mat_roundel @ Matrix.Translation(Vector((0, -0.003, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Horizontal Red LED Light Blade (Wrapping outward along haunch)
        mat_blade = mat_tl @ Matrix.Translation(Vector((tx_sign * 0.055, -0.006, 0.0)))
        bmesh.ops.create_cube(bm_tred, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((0.110, 0.014, 0.016, 1.0))))

        # 4. Crystal Clear Reverse Lamp Diffuser (Inboard strip)
        mat_rev = mat_tl @ Matrix.Translation(Vector((tx_sign * -0.080, -0.006, 0.0)))
        bmesh.ops.create_cube(bm_trev, size=1.0, matrix=mat_rev @ Matrix.Diagonal(Vector((0.050, 0.012, 0.014, 1.0))))

        # 5. Polycarbonate Red/Clear Outer Aerodynamic Lens Cover
        mat_tlens = mat_tl @ Matrix.Translation(Vector((0, -0.008, 0.0)))
        bmesh.ops.create_cube(bm_tlens, size=1.0, matrix=mat_tlens @ Matrix.Diagonal(Vector((0.225, 0.028, 0.028, 1.0))))

    # 6. Connecting Center Red LED Lightbar across rear decklid (Between inner taillight tips)
    mat_cbar = Matrix.Translation(Vector((0.0, -2.065, 0.770))) @ Euler((math.radians(-15), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_tred, size=1.0, matrix=mat_cbar @ Matrix.Diagonal(Vector((0.920, 0.016, 0.008, 1.0))))

    obj_thousing = link_obj("GEO_FTYPE_Taillight_Housings_and_Bezels", bm_thousing, parent_col, mats["piano_black"], bevel=0.0006)
    obj_tred = link_obj("GEO_FTYPE_Taillight_Ruby_Red_LEDs_and_Bar", bm_tred, parent_col, mats["taillight_red"], bevel=0.0004)
    obj_trev = link_obj("GEO_FTYPE_Taillight_Clear_Reverse_Lamps", bm_trev, parent_col, mats["reverse_clear"], bevel=0.0004)
    obj_tlens = link_obj("GEO_FTYPE_Taillight_Polycarbonate_Lenses", bm_tlens, parent_col, mats["headlight_lens"], bevel=0.0004)

    objs.extend([obj_thousing, obj_tred, obj_trev, obj_tlens])
    return objs


# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 3: QUAD 90MM ROLLED POLISHED STAINLESS EXHAUST TIPS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_quad_exhaust_tips(parent_col, mats):
    """
    Constructs the thunderous quad outboard round exhaust tips:
    - 4 individual 90mm diameter rolled polished stainless steel exhaust pipes (2 pairs per bumper corner).
    - High-velocity angle-cut exit profile conforming to the rear diffuser curvature.
    - Deep matte soot-black internal acoustic flame tube liner.
    - Heavy-duty stainless steel mounting clamps and isolation rubber hanger bushings.
    """
    objs = []
    bm_tips = bmesh.new()
    bm_soot = bmesh.new()

    for qx_sign in [-1.0, 1.0]:
        # Outboard exhaust pair centers (X = +/- 0.575m and +/- 0.665m, Y = -2.140m, Z = 0.250m)
        for sub_i, sub_x_off in enumerate([-0.045, 0.045]):
            tx = qx_sign * 0.620 + sub_x_off
            ty = -2.140
            tz = 0.250

            mat_pipe = Matrix.Translation(Vector((tx, ty, tz))) @ Euler((math.radians(4), qx_sign * math.radians(-3), 0), 'XYZ').to_matrix().to_4x4()

            # 1. Outer Rolled Polished Stainless Steel Tip (Outer Diameter 90mm)
            bmesh.ops.create_cylinder(bm_tips, radius=0.045, depth=0.140, segments=24, matrix=mat_pipe @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

            # Rolled Outer Radiused Bead Lip
            mat_lip = mat_pipe @ Matrix.Translation(Vector((0, -0.068, 0)))
            bmesh.ops.create_cylinder(bm_tips, radius=0.047, depth=0.016, segments=24, matrix=mat_lip @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

            # 2. Inner Matte Soot Acoustic Baffle & Flame Tube
            mat_inner = mat_pipe @ Matrix.Translation(Vector((0, -0.015, 0)))
            bmesh.ops.create_cylinder(bm_soot, radius=0.038, depth=0.150, segments=20, matrix=mat_inner @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

            # 3. Stainless Mounting Clamp Collar
            mat_clamp = mat_pipe @ Matrix.Translation(Vector((0, 0.055, 0)))
            bmesh.ops.create_cylinder(bm_tips, radius=0.049, depth=0.024, segments=18, matrix=mat_clamp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_tips = link_obj("GEO_FTYPE_Quad_Polished_Exhaust_Tips", bm_tips, parent_col, mats["exhaust_tip"], bevel=0.001)
    obj_soot = link_obj("GEO_FTYPE_Exhaust_Inner_Soot_Bores", bm_soot, parent_col, mats["exhaust_soot"], bevel=0.0005)

    objs.extend([obj_tips, obj_soot])
    return objs


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 4: AERODYNAMIC TEARDROP SIDE MIRRORS & LED REPEATERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_aerodynamic_side_mirrors(parent_col, mats):
    """
    Constructs the sculpted door-mounted wing mirrors:
    - Left and right aerodynamic teardrop mirror shells in body color / gloss black.
    - Cantilevered cast aluminum mounting stalks bolted to forward door beltline (X = +/- 0.885m, Y = +0.640m, Z = 0.820m).
    - Integrated ultra-slim amber LED turn signal repeater blade wrapping along forward mirror shell.
    - First-surface aspheric anti-glare optical mirror glass with black rubber perimeter bezel.
    """
    objs = []
    bm_stalks = bmesh.new()
    bm_shells = bmesh.new()
    bm_drls = bmesh.new()
    bm_glass = bmesh.new()

    for mx_sign in [-1.0, 1.0]:
        sx = mx_sign * 0.810
        sy = 0.580
        sz = 0.820

        # Base gasket on door beltline
        mat_base = Matrix.Translation(Vector((sx, sy, sz)))
        bmesh.ops.create_cube(bm_stalks, size=1.0, matrix=mat_base @ Matrix.Diagonal(Vector((0.024, 0.080, 0.020, 1.0))))

        # Aerodynamic Support Stalk
        p_base = Vector((sx, sy, sz + 0.010))
        p_pod = Vector((mx_sign * 0.930, sy - 0.010, sz + 0.070))
        mid_s = (p_base + p_pod) * 0.5
        mat_stalk = Matrix.Translation(mid_s) @ Vector((0, 0, 1)).rotation_difference(p_pod - p_base).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_stalks, radius=0.012, depth=(p_pod - p_base).length, segments=14, matrix=mat_stalk)

        # Aerodynamic Teardrop Mirror Pod (Smooth curved bulb + cone)
        mat_pod = Matrix.Translation(p_pod) @ Euler((math.radians(4), 0, mx_sign * math.radians(8)), 'XYZ').to_matrix().to_4x4()
        # Main Ellipsoid Bulb
        bmesh.ops.create_cylinder(bm_shells, radius=0.052, depth=0.130, segments=22, matrix=mat_pod @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.15, 0.82, 1.0, 1.0))))
        # Tapered Forward Airfoil Cone
        mat_fwd = mat_pod @ Matrix.Translation(Vector((0, 0.045, 0)))
        bmesh.ops.create_cone(bm_shells, radius1=0.050, radius2=0.022, depth=0.065, segments=18, matrix=mat_fwd @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.15, 0.82, 1.0, 1.0))))

        # Turn Signal Repeater LED Strip (Forward-facing blade)
        mat_rep = mat_pod @ Matrix.Translation(Vector((mx_sign * 0.035, 0.030, 0)))
        bmesh.ops.create_cube(bm_drls, size=1.0, matrix=mat_rep @ Matrix.Diagonal(Vector((0.040, 0.008, 0.010, 1.0))))

        # Rearward Aspheric Optical Mirror Glass (Facing rearwards, Y offset -0.058m)
        mat_glass_pos = mat_pod @ Matrix.Translation(Vector((0, -0.058, 0)))
        bmesh.ops.create_cylinder(bm_stalks, radius=0.048, depth=0.010, segments=22, matrix=mat_glass_pos @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.12, 0.78, 1.0, 1.0))))
        mat_face = mat_glass_pos @ Matrix.Translation(Vector((0, -0.004, 0)))
        bmesh.ops.create_cylinder(bm_glass, radius=0.045, depth=0.006, segments=22, matrix=mat_face @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.12, 0.78, 1.0, 1.0))))

    obj_stalks = link_obj("GEO_FTYPE_SideMirror_Stalks_and_Bezels", bm_stalks, parent_col, mats["piano_black"], bevel=0.001)
    obj_shells = link_obj("GEO_FTYPE_SideMirror_Aerodynamic_Shells", bm_shells, parent_col, mats["body"], bevel=0.0015)
    obj_drls = link_obj("GEO_FTYPE_SideMirror_LED_Repeaters", bm_drls, parent_col, mats["amber_led"], bevel=0.0004)
    obj_glass = link_obj("GEO_FTYPE_SideMirror_Optical_Glass", bm_glass, parent_col, mats["mirror_glass"], bevel=0.0004)

    objs.extend([obj_stalks, obj_shells, obj_drls, obj_glass])
    return objs
# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 5: FLUSH MOTORIZED DOOR HANDLES & SENSORS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_flush_door_handles(parent_col, mats):
    """
    Constructs the motorized pop-out flush exterior door handles:
    - Retracted flush with door skin sheetmetal when parked / in motion (X = +/- 0.875m, Y = +0.280m, Z = 0.810m).
    - Subtle capacitive touch sensor thumb indentation for keyless entry unlocking.
    - Concealed emergency mechanical lock keyhole barrel beneath driver handle flap.
    - Satin black perimeter sealing gasket preventing water ingress.
    """
    objs = []
    bm_handles = bmesh.new()
    bm_gaskets = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        hx = hx_sign * 0.878
        hy = 0.280
        hz = 0.810

        mat_h = Matrix.Translation(Vector((hx, hy, hz))) @ Euler((0, hx_sign * math.radians(-4), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Recessed Perimeter Escutcheon Gasket Pocket
        bmesh.ops.create_cube(bm_gaskets, size=1.0, matrix=mat_h @ Matrix.Diagonal(Vector((0.015, 0.210, 0.052, 1.0))))

        # 2. Body-Colored Flush Pull Handle Flap
        bmesh.ops.create_cube(bm_handles, size=1.0, matrix=mat_h @ Matrix.Diagonal(Vector((0.012, 0.198, 0.042, 1.0))))

        # 3. Capacitive Touch Sensor Indent (Forward edge of handle)
        mat_sensor = mat_h @ Matrix.Translation(Vector((hx_sign * 0.005, 0.070, 0.0)))
        bmesh.ops.create_cylinder(bm_gaskets, radius=0.008, depth=0.005, segments=12, matrix=mat_sensor @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Emergency Mechanical Keyhole Barrel (Driver side only)
        if hx_sign > 0.0: # LHD Driver side (+X)
            mat_key = mat_h @ Matrix.Translation(Vector((hx_sign * 0.005, -0.075, 0.0)))
            bmesh.ops.create_cylinder(bm_gaskets, radius=0.006, depth=0.006, segments=10, matrix=mat_key @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_handles = link_obj("GEO_FTYPE_Flush_Door_Handles", bm_handles, parent_col, mats["body"], bevel=0.001)
    obj_gaskets = link_obj("GEO_FTYPE_Door_Handle_Gaskets", bm_gaskets, parent_col, mats["trim"], bevel=0.0005)

    objs.extend([obj_handles, obj_gaskets])
    return objs


# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 6: FRONT FENDER LOUVERED EXTRACTORS & "JAGUAR" VANE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_fender_side_vents(parent_col, mats):
    """
    Constructs the functional front fender air extractors:
    - Left and right recessed vertical air extractor slots behind front wheel arches (X = +/- 0.885m, Y = +0.980m, Z = 0.745m).
    - Horizontal chrome aerodynamic spear vane bearing embossed "JAGUAR" relief typography.
    - Dark graphite honeycomb mesh backing venting high-pressure wheelhouse turbulence.
    """
    objs = []
    bm_vents = bmesh.new()
    bm_vane = bmesh.new()

    for vx_sign in [-1.0, 1.0]:
        vx = vx_sign * 0.885
        vy = 0.980
        vz = 0.745

        mat_v = Matrix.Translation(Vector((vx, vy, vz))) @ Euler((0, vx_sign * math.radians(-6), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Recessed Scallop Air Pocket Cavity
        bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_v @ Matrix.Diagonal(Vector((0.025, 0.160, 0.140, 1.0))))

        # 2. Horizontal Polished Chrome Spear Vane (Dividing the vent)
        mat_spear = mat_v @ Matrix.Translation(Vector((vx_sign * 0.008, 0, 0)))
        bmesh.ops.create_cube(bm_vane, size=1.0, matrix=mat_spear @ Matrix.Diagonal(Vector((0.015, 0.175, 0.032, 1.0))))

        # 3. Embossed "JAGUAR" Center Lettering Block
        mat_text = mat_spear @ Matrix.Translation(Vector((vx_sign * 0.006, 0, 0)))
        bmesh.ops.create_cube(bm_vane, size=1.0, matrix=mat_text @ Matrix.Diagonal(Vector((0.004, 0.110, 0.016, 1.0))))

    obj_vents = link_obj("GEO_FTYPE_Fender_Vent_Pockets", bm_vents, parent_col, mats["piano_black"], bevel=0.001)
    obj_vane = link_obj("GEO_FTYPE_Fender_Chrome_Spear_Vanes", bm_vane, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_vents, obj_vane])
    return objs


# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 7: FRONT GRILLE RED CLOISONNÉ GROWLER EMBLEM
# ----------------------------------------------------------------------------

def build_jaguar_ftype_grille_growler_emblem(parent_col, mats):
    """
    Constructs the iconic Jaguar Growler radiator grille centerpiece:
    - Circular 85mm roundel anchored at center of shark-mouth grille (X = 0.0m, Y = +2.145m, Z = 0.520m).
    - Deep red cloisonné enamel background disc.
    - 3D high-relief snarling Jaguar feline face sculpture in mirror chrome.
    - Outer polished chrome retaining bezel ring.
    """
    objs = []
    bm_growler_red = bmesh.new()
    bm_growler_cat = bmesh.new()

    mat_growler = Matrix.Translation(Vector((0.0, 2.148, 0.520))) @ Euler((math.radians(10), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Outer Polished Chrome Bezel Ring
    bmesh.ops.create_cylinder(bm_growler_cat, radius=0.044, depth=0.016, segments=32, matrix=mat_growler @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Red Cloisonné Enamel Field Disc
    mat_field = mat_growler @ Matrix.Translation(Vector((0, 0.004, 0)))
    bmesh.ops.create_cylinder(bm_growler_red, radius=0.041, depth=0.012, segments=32, matrix=mat_field @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. 3D High-Relief Snarling Jaguar Cat Face Sculpture (Central emblem)
    mat_cat = mat_field @ Matrix.Translation(Vector((0, 0.007, 0)))
    # Cat Snout / Muzzle Block
    bmesh.ops.create_cube(bm_growler_cat, size=1.0, matrix=mat_cat @ Matrix.Diagonal(Vector((0.028, 0.008, 0.024, 1.0))))
    # Cat Forehead & Whisker Brow
    bmesh.ops.create_cube(bm_growler_cat, size=1.0, matrix=mat_cat @ Matrix.Translation(Vector((0, 0, 0.015))) @ Matrix.Diagonal(Vector((0.038, 0.006, 0.014, 1.0))))
    # Cat Ears (Left and Right triangular crests)
    for ear_sign in [-1.0, 1.0]:
        mat_ear = mat_cat @ Matrix.Translation(Vector((ear_sign * 0.022, 0, 0.026))) @ Euler((0, 0, ear_sign * math.radians(-25)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_growler_cat, size=1.0, matrix=mat_ear @ Matrix.Diagonal(Vector((0.012, 0.005, 0.012, 1.0))))

    # Open Fanged Jaw (Lower mouth cavity)
    mat_jaw = mat_cat @ Matrix.Translation(Vector((0, 0, -0.016)))
    bmesh.ops.create_cube(bm_growler_cat, size=1.0, matrix=mat_jaw @ Matrix.Diagonal(Vector((0.020, 0.006, 0.010, 1.0))))

    obj_growler_red = link_obj("GEO_FTYPE_Growler_Red_Enamel_Disc", bm_growler_red, parent_col, mats["growler_red"], bevel=0.0005)
    obj_growler_cat = link_obj("GEO_FTYPE_Growler_Chrome_Cat_Face", bm_growler_cat, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_growler_red, obj_growler_cat])
    return objs
# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 8: REAR 3D CHROME JAGUAR LEAPER EMBLEM
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rear_leaper_emblem(parent_col, mats):
    """
    Constructs the iconic Jaguar Leaper (prowling/leaping cat) rear emblem:
    - 3D high-relief mirror-chrome sculpture centered on rear decklid (X = 0.0m, Y = -2.060m, Z = 0.815m).
    - Muscular leaping feline body silhouette with extended front claws and streaming tail.
    - Conforms to rear decklid curve with beveled edges.
    """
    objs = []
    bm_leaper = bmesh.new()

    mat_leap = Matrix.Translation(Vector((0.0, -2.062, 0.815))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Main Leaping Feline Torso Body (Length 110mm, angled forward)
    mat_torso = mat_leap @ Euler((0, math.radians(12), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_leaper, size=1.0, matrix=mat_torso @ Matrix.Diagonal(Vector((0.080, 0.006, 0.018, 1.0))))

    # 2. Arched Feline Neck & Head with Ears
    mat_head = mat_leap @ Matrix.Translation(Vector((0.048, 0, 0.012))) @ Euler((0, math.radians(24), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_leaper, size=1.0, matrix=mat_head @ Matrix.Diagonal(Vector((0.024, 0.005, 0.014, 1.0))))

    # 3. Extended Front Forelegs (Reaching forward in mid-leap)
    mat_flegs = mat_leap @ Matrix.Translation(Vector((0.055, 0, -0.008))) @ Euler((0, math.radians(45), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_leaper, radius=0.004, depth=0.035, segments=8, matrix=mat_flegs)

    # 4. Powerful Hindquarters & Rear Legs (Tucked back)
    mat_rlegs = mat_leap @ Matrix.Translation(Vector((-0.038, 0, -0.008))) @ Euler((0, math.radians(-35), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_leaper, radius=0.005, depth=0.038, segments=8, matrix=mat_rlegs)

    # 5. Flowing Arched Tail
    mat_tail = mat_leap @ Matrix.Translation(Vector((-0.052, 0, 0.012))) @ Euler((0, math.radians(65), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_leaper, radius=0.0025, depth=0.036, segments=6, matrix=mat_tail)

    obj_leaper = link_obj("GEO_FTYPE_Rear_Chrome_Leaper_Badge", bm_leaper, parent_col, mats["chrome"], bevel=0.0005)
    objs.append(obj_leaper)
    return objs


# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 9: "F-TYPE" SCRIPT & "R" PERFORMANCE BADGES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rear_script_and_r_badges(parent_col, mats):
    """
    Constructs the rear decklid model designation and high-performance badges:
    - Left side: Polished chrome individual letter block script "F - T Y P E" (X = -0.320m, Y = -2.040m, Z = 0.745m).
    - Right side: Multi-color enamel "R" badge (X = +0.320m, Y = -2.040m, Z = 0.745m).
    - "R" badge features split green/white/red enamel field and raised chrome block 'R'.
    """
    objs = []
    bm_script = bmesh.new()
    bm_rbadge = bmesh.new()
    bm_renamel = bmesh.new()

    # 1. "F-TYPE" Chrome Script (Left rear decklid)
    mat_ftype = Matrix.Translation(Vector((-0.320, -2.045, 0.748))) @ Euler((math.radians(-16), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Letter Block Silhouette
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_ftype @ Matrix.Diagonal(Vector((0.140, 0.005, 0.022, 1.0))))

    # Individual Raised Chrome Letter Studs ('F', '-', 'T', 'Y', 'P', 'E')
    for l_i, l_off in enumerate([-0.055, -0.035, -0.015, 0.010, 0.035, 0.055]):
        mat_l = mat_ftype @ Matrix.Translation(Vector((l_off, -0.003, 0)))
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_l @ Matrix.Diagonal(Vector((0.016, 0.003, 0.018, 1.0))))

    # 2. "R" Performance Badge (Right rear decklid)
    mat_r = Matrix.Translation(Vector((0.320, -2.045, 0.748))) @ Euler((math.radians(-16), 0, 0), 'XYZ').to_matrix().to_4x4()

    # Outer Chrome Frame Bezel for "R"
    bmesh.ops.create_cube(bm_rbadge, size=1.0, matrix=mat_r @ Matrix.Diagonal(Vector((0.065, 0.006, 0.040, 1.0))))

    # Split Multi-Color Cloisonné Enamel Field (Green top, Red bottom)
    mat_egreen = mat_r @ Matrix.Translation(Vector((-0.012, -0.002, 0.008)))
    bmesh.ops.create_cube(bm_renamel, size=1.0, matrix=mat_egreen @ Matrix.Diagonal(Vector((0.035, 0.004, 0.018, 1.0))))

    mat_ered = mat_r @ Matrix.Translation(Vector((-0.012, -0.002, -0.008)))
    bmesh.ops.create_cube(bm_renamel, size=1.0, matrix=mat_ered @ Matrix.Diagonal(Vector((0.035, 0.004, 0.018, 1.0))))

    # Raised 3D Chrome 'R' Typography
    mat_rchar = mat_r @ Matrix.Translation(Vector((0.015, -0.004, 0)))
    bmesh.ops.create_cube(bm_rbadge, size=1.0, matrix=mat_rchar @ Matrix.Diagonal(Vector((0.024, 0.004, 0.032, 1.0))))

    obj_script = link_obj("GEO_FTYPE_FType_Chrome_Script", bm_script, parent_col, mats["chrome"], bevel=0.0004)
    obj_rbadge = link_obj("GEO_FTYPE_R_Badge_Chrome_Bezel", bm_rbadge, parent_col, mats["chrome"], bevel=0.0004)
    obj_renamel = link_obj("GEO_FTYPE_R_Badge_Enamel_Field", bm_renamel, parent_col, mats["badge_green"], bevel=0.0003)

    objs.extend([obj_script, obj_rbadge, obj_renamel])
    return objs


# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 10: HIGH-MOUNT 24-LED THIRD CENTER BRAKE LAMP (CHMSL)
# ----------------------------------------------------------------------------

def build_jaguar_ftype_center_high_brake_lamp(parent_col, mats):
    """
    Constructs the sleek Center High-Mounted Stop Lamp (CHMSL):
    - Thin continuous red LED light strip integrated into the active spoiler trailing edge (X = 0.0m, Y = -1.985m, Z = 0.812m).
    - Array of 24 microscopic high-intensity ruby red surface-mount diodes.
    - Optical diffusing prism cover flush with rear decklid.
    """
    objs = []
    bm_chmsl_housing = bmesh.new()
    bm_chmsl_led = bmesh.new()

    mat_chmsl = Matrix.Translation(Vector((0.0, -1.988, 0.812))) @ Euler((math.radians(-10), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Dark Bezel Housing Recess
    bmesh.ops.create_cube(bm_chmsl_housing, size=1.0, matrix=mat_chmsl @ Matrix.Diagonal(Vector((0.440, 0.022, 0.016, 1.0))))

    # 2. Outer Ruby Red Diffuser Lens Strip
    mat_lens = mat_chmsl @ Matrix.Translation(Vector((0, -0.006, 0)))
    bmesh.ops.create_cube(bm_chmsl_led, size=1.0, matrix=mat_lens @ Matrix.Diagonal(Vector((0.420, 0.010, 0.010, 1.0))))

    # 3. 24 Individual High-Intensity Ruby LED Emitter Beads
    for led_i in range(24):
        led_x = (led_i - 11.5) * 0.0165
        mat_bead = mat_chmsl @ Matrix.Translation(Vector((led_x, 0, 0)))
        bmesh.ops.create_cylinder(bm_chmsl_led, radius=0.003, depth=0.006, segments=8, matrix=mat_bead @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_chmsl_h = link_obj("GEO_FTYPE_CHMSL_Bezel_Housing", bm_chmsl_housing, parent_col, mats["piano_black"], bevel=0.0005)
    obj_chmsl_l = link_obj("GEO_FTYPE_CHMSL_Ruby_LED_Array", bm_chmsl_led, parent_col, mats["taillight_red"], bevel=0.0003)

    objs.extend([obj_chmsl_h, obj_chmsl_l])
    return objs


# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 11: ARTICULATED WINDSHIELD WIPER ARMS & AERO FOILS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_aerodynamic_wipers(parent_col, mats):
    """
    Constructs the high-speed aerodynamic pantograph windshield wipers:
    - Left (driver) and right (passenger) articulated steel wiper arms seated in cowl trough (Y = +0.760m).
    - Integrated aerodynamic spoiler airfoils preventing wiper blade lift at 186 mph.
    - Flexible silicone rubber wiper squeegee blade refills conforming to windshield curvature.
    - Chrome spindle pivot nut covers and cowl drainage grille slots.
    """
    objs = []
    bm_wipers = bmesh.new()
    bm_blades = bmesh.new()

    wiper_configs = [
        # Arm,      Spindle_X, Spindle_Y, Spindle_Z, Angle,  Blade_L
        ("Driver",   -0.420,    0.755,     0.815,     -18.0,  0.580),
        ("Pass",      0.150,    0.765,     0.812,     -14.0,  0.520),
    ]

    for name, sx, sy, sz, ang, bl_len in wiper_configs:
        mat_spindle = Matrix.Translation(Vector((sx, sy, sz)))

        # 1. Spindle Pivot Nut Cap & Base Knuckle
        bmesh.ops.create_cylinder(bm_wipers, radius=0.016, depth=0.025, segments=14, matrix=mat_spindle)

        # 2. Articulated Spring-Loaded Primary Arm (Extending up toward glass)
        p1 = Vector((sx, sy, sz + 0.015))
        p2 = Vector((sx + math.cos(math.radians(ang)) * 0.220, sy - 0.080, sz + 0.090))
        mid_arm = (p1 + p2) * 0.5
        mat_arm = Matrix.Translation(mid_arm) @ Vector((0, 0, 1)).rotation_difference(p2 - p1).to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_wipers, size=1.0, matrix=mat_arm @ Matrix.Diagonal(Vector((0.018, 0.012, (p2 - p1).length, 1.0))))

        # 3. Aerodynamic Wind Deflector Foil (Mounted along wiper blade spine)
        mid_blade = Vector((sx + math.cos(math.radians(ang)) * 0.350, sy - 0.140, sz + 0.160))
        mat_bspine = Matrix.Translation(mid_blade) @ Euler((math.radians(35), 0, math.radians(ang)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_wipers, size=1.0, matrix=mat_bspine @ Matrix.Diagonal(Vector((0.016, bl_len, 0.024, 1.0))))

        # 4. Flexible Silicone Squeegee Rubber Blade (In contact with windshield glass)
        mat_sq = mat_bspine @ Matrix.Translation(Vector((0, 0, -0.014)))
        bmesh.ops.create_cube(bm_blades, size=1.0, matrix=mat_sq @ Matrix.Diagonal(Vector((0.004, bl_len * 0.98, 0.010, 1.0))))

    obj_wipers = link_obj("GEO_FTYPE_Wiper_Arms_and_Foils", bm_wipers, parent_col, mats["trim"], bevel=0.0008)
    obj_blades = link_obj("GEO_FTYPE_Wiper_Rubber_Blades", bm_blades, parent_col, mats["trim"], bevel=0.0004)

    objs.extend([obj_wipers, obj_blades])
    return objs
# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 12: HEADLAMP WASHER JETS & HOOD SPRAY NOZZLES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_washer_nozzles(parent_col, mats):
    """
    Constructs high-pressure fluid washer hardware:
    - Left and right pop-up telescopic headlamp washer jet covers on front bumper (X = +/- 0.650m, Y = +2.050m, Z = 0.520m).
    - Clamshell hood fluid spray jets with twin fluid misting nozzles.
    """
    objs = []
    bm_jets = bmesh.new()

    # 1. Front Bumper Pop-Up Headlamp Washer Jet Caps
    for wx_sign in [-1.0, 1.0]:
        mat_wcap = Matrix.Translation(Vector((wx_sign * 0.650, 2.050, 0.520))) @ Euler((math.radians(16), wx_sign * math.radians(-10), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_jets, size=1.0, matrix=mat_wcap @ Matrix.Diagonal(Vector((0.045, 0.035, 0.008, 1.0))))

    # 2. Clamshell Hood Windshield Washer Spray Nozzles (Tucked near cowl: Y = +0.820m, Z = 0.810m)
    for hx_sign in [-1.0, 1.0]:
        mat_jet = Matrix.Translation(Vector((hx_sign * 0.380, 0.820, 0.810)))
        bmesh.ops.create_cylinder(bm_jets, radius=0.008, depth=0.012, segments=10, matrix=mat_jet)

    obj_jets = link_obj("GEO_FTYPE_Washer_Nozzles_and_Caps", bm_jets, parent_col, mats["body"], bevel=0.0005)
    objs.append(obj_jets)
    return objs


# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 13: STAMPED LICENSE PLATES & LED ILLUMINATORS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_license_plates(parent_col, mats):
    """
    Constructs front and rear stamped license plates and illumination:
    - Front license plate plinth centered below main grille crossbar (X = 0.0m, Y = +2.185m, Z = 0.390m).
    - Rear license plate recess between dual exhaust outlets (X = 0.0m, Y = -2.085m, Z = 0.440m).
    - Stamped aluminum plates with embossed typography, chrome mounting frame, and white LED illuminator pods.
    """
    objs = []
    bm_plates = bmesh.new()
    bm_frames = bmesh.new()
    bm_leds = bmesh.new()

    # 1. Front European/UK License Plate (Width 520mm, Height 111mm)
    mat_fplate = Matrix.Translation(Vector((0.0, 2.185, 0.390))) @ Euler((math.radians(8), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Stamped Metal Plate
    bmesh.ops.create_cube(bm_plates, size=1.0, matrix=mat_fplate @ Matrix.Diagonal(Vector((0.520, 0.004, 0.111, 1.0))))
    # Chrome Outer Mounting Frame
    bmesh.ops.create_cube(bm_frames, size=1.0, matrix=mat_fplate @ Matrix.Diagonal(Vector((0.535, 0.008, 0.125, 1.0))))

    # 2. Rear Stamped License Plate (Between quad exhaust pairs)
    mat_rplate = Matrix.Translation(Vector((0.0, -2.085, 0.440))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_plates, size=1.0, matrix=mat_rplate @ Matrix.Diagonal(Vector((0.520, 0.004, 0.111, 1.0))))
    bmesh.ops.create_cube(bm_frames, size=1.0, matrix=mat_rplate @ Matrix.Diagonal(Vector((0.535, 0.008, 0.125, 1.0))))

    # Dual White LED License Plate Illuminator Pods (Above rear plate)
    for lx_sign in [-1.0, 1.0]:
        mat_led = mat_rplate @ Matrix.Translation(Vector((lx_sign * 0.160, -0.015, 0.075)))
        bmesh.ops.create_cube(bm_leds, size=1.0, matrix=mat_led @ Matrix.Diagonal(Vector((0.045, 0.015, 0.012, 1.0))))

    obj_plates = link_obj("GEO_FTYPE_Stamped_License_Plates", bm_plates, parent_col, mats["chrome"], bevel=0.0005)
    obj_frames = link_obj("GEO_FTYPE_License_Plate_Frames", bm_frames, parent_col, mats["piano_black"], bevel=0.0005)
    obj_leds = link_obj("GEO_FTYPE_License_Plate_LED_Lamps", bm_leds, parent_col, mats["drl_white"], bevel=0.0003)

    objs.extend([obj_plates, obj_frames, obj_leds])
    return objs


# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 14: REAR BUMPER RED CORNER REFLEX REFLECTORS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rear_reflex_reflectors(parent_col, mats):
    """
    Constructs the rear bumper aerodynamic corner reflex reflectors:
    - Left and right slim vertical ruby red prismatic reflectors mounted in rear bumper corners.
    - Faceted internal micro-prisms reflecting trailing headlights.
    """
    objs = []
    bm_refl = bmesh.new()

    for rx_sign in [-1.0, 1.0]:
        mat_ref = Matrix.Translation(Vector((rx_sign * 0.760, -2.010, 0.420))) @ Euler((math.radians(-12), rx_sign * math.radians(15), 0), 'XYZ').to_matrix().to_4x4()
        # Slim Vertical Ruby Reflector
        bmesh.ops.create_cube(bm_refl, size=1.0, matrix=mat_ref @ Matrix.Diagonal(Vector((0.018, 0.008, 0.095, 1.0))))

    obj_refl = link_obj("GEO_FTYPE_Rear_Corner_Reflectors", bm_refl, parent_col, mats["taillight_red"], bevel=0.0004)
    objs.append(obj_refl)
    return objs


# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 15: INTERIOR REARVIEW MIRROR & ADAS CAMERA
# ----------------------------------------------------------------------------

def build_jaguar_ftype_interior_mirror_and_adas(parent_col, mats):
    """
    Constructs the windshield-mounted interior rearview mirror and ADAS safety pod:
    - Frameless auto-dimming electrochromic interior rearview mirror with ambient light sensor.
    - Windshield header triangular housing enclosing forward-facing stereoscopic driver-assist camera.
    - Ball-and-socket articulated mounting arm anchored to windshield glass header.
    """
    objs = []
    bm_int_mir = bmesh.new()
    bm_int_glass = bmesh.new()

    mat_mir_base = Matrix.Translation(Vector((0.0, 0.240, 1.220))) @ Euler((math.radians(20), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Forward-Facing ADAS Camera / Rain Sensor Pod (Adhered to windshield ceramic frit)
    mat_adas = mat_mir_base @ Matrix.Translation(Vector((0, 0.040, 0.025)))
    bmesh.ops.create_cube(bm_int_mir, size=1.0, matrix=mat_adas @ Matrix.Diagonal(Vector((0.140, 0.040, 0.075, 1.0))))

    # 2. Articulated Swivel Stem
    bmesh.ops.create_cylinder(bm_int_mir, radius=0.008, depth=0.045, segments=12, matrix=mat_mir_base @ Matrix.Translation(Vector((0, -0.015, -0.020))))

    # 3. Frameless Electrochromic Mirror Casing
    mat_case = mat_mir_base @ Matrix.Translation(Vector((0, -0.035, -0.045)))
    bmesh.ops.create_cube(bm_int_mir, size=1.0, matrix=mat_case @ Matrix.Diagonal(Vector((0.240, 0.015, 0.065, 1.0))))

    # Optical Mirror Glass (Rear-facing)
    mat_mface = mat_case @ Matrix.Translation(Vector((0, -0.008, 0)))
    bmesh.ops.create_cube(bm_int_glass, size=1.0, matrix=mat_mface @ Matrix.Diagonal(Vector((0.232, 0.004, 0.058, 1.0))))

    obj_int_mir = link_obj("GEO_FTYPE_Interior_Mirror_and_ADAS", bm_int_mir, parent_col, mats["piano_black"], bevel=0.0008)
    obj_int_glass = link_obj("GEO_FTYPE_Interior_Mirror_Glass", bm_int_glass, parent_col, mats["mirror_glass"], bevel=0.0003)

    objs.extend([obj_int_mir, obj_int_glass])
    return objs
# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 16: WHEEL CENTER CAPS & RED GROWLER ROUNDELS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_wheel_center_caps(parent_col, mats):
    """
    Constructs the four authentic Jaguar Growler center wheel caps:
    - 65mm circular center caps snapped into the hub of each 20-inch Cyclone wheel.
    - Deep red cloisonné background disc with raised chrome snarling Jaguar cat face.
    - Outer chrome retaining bezel ring flush with wheel hub face.
    """
    objs = []
    bm_caps_red = bmesh.new()
    bm_caps_cat = bmesh.new()

    wheel_hubs = [
        (-0.798,  1.311,  0.343, -1.0, 0.255),
        ( 0.798,  1.311,  0.343,  1.0, 0.255),
        (-0.825, -1.311,  0.343, -1.0, 0.295),
        ( 0.825, -1.311,  0.343,  1.0, 0.295),
    ]

    for wx, wy, wz, x_sign, tw in wheel_hubs:
        mat_cap = Matrix.Translation(Vector((wx + x_sign * (tw * 0.40), wy, wz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Outer Chrome Bezel Ring
        bmesh.ops.create_cylinder(bm_caps_cat, radius=0.034, depth=0.008, segments=24, matrix=mat_cap)

        # 2. Red Cloisonné Enamel Disc
        mat_field = mat_cap @ Matrix.Translation(Vector((0, 0, x_sign * 0.002)))
        bmesh.ops.create_cylinder(bm_caps_red, radius=0.031, depth=0.006, segments=24, matrix=mat_field)

        # 3. Micro 3D Chrome Jaguar Cat Face
        mat_cat = mat_field @ Matrix.Translation(Vector((0, 0, x_sign * 0.003)))
        bmesh.ops.create_cube(bm_caps_cat, size=1.0, matrix=mat_cat @ Matrix.Diagonal(Vector((0.020, 0.018, 0.004, 1.0))))

    obj_caps_red = link_obj("GEO_FTYPE_Wheel_Center_Cap_Red_Discs", bm_caps_red, parent_col, mats["growler_red"], bevel=0.0003)
    obj_caps_cat = link_obj("GEO_FTYPE_Wheel_Center_Cap_Chrome_Cats", bm_caps_cat, parent_col, mats["chrome"], bevel=0.0003)

    objs.extend([obj_caps_red, obj_caps_cat])
    return objs


# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 17: WHEEL VALVE STEMS & CHROME LUG NUTS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_wheel_fasteners_and_valves(parent_col, mats):
    """
    Constructs high-fidelity wheel jewelry details:
    - 4 angled rubber tire valve stems with knurled aluminum valve caps (TPMS sensors).
    - 20 conical mirror-chrome wheel lug nuts seated into wheel hub wells.
    """
    objs = []
    bm_valves = bmesh.new()
    bm_lugs = bmesh.new()

    wheel_hubs = [
        (-0.798,  1.311,  0.343, -1.0, 0.255),
        ( 0.798,  1.311,  0.343,  1.0, 0.255),
        (-0.825, -1.311,  0.343, -1.0, 0.295),
        ( 0.825, -1.311,  0.343,  1.0, 0.295),
    ]

    for wx, wy, wz, x_sign, tw in wheel_hubs:
        mat_whl = Matrix.Translation(Vector((wx, wy, wz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Tire Valve Stem (R = 0.220m from axle center, angled 18 degrees outward)
        v_ang = math.radians(45)
        vx = math.cos(v_ang) * 0.220
        vy = math.sin(v_ang) * 0.220
        mat_vstem = mat_whl @ Matrix.Translation(Vector((vx, vy, x_sign * (tw * 0.36))))
        # Rubber Stem
        bmesh.ops.create_cylinder(bm_valves, radius=0.0045, depth=0.024, segments=8, matrix=mat_vstem)
        # Knurled Aluminum Cap
        mat_vcap = mat_vstem @ Matrix.Translation(Vector((0, 0, x_sign * 0.014)))
        bmesh.ops.create_cylinder(bm_valves, radius=0.0055, depth=0.010, segments=10, matrix=mat_vcap)

        # 2. 5 Mirror-Chrome Conical Lug Nuts
        for lug_i in range(5):
            lug_a = lug_i * (2.0 * math.pi / 5.0)
            lx = math.cos(lug_a) * 0.058
            ly = math.sin(lug_a) * 0.058
            mat_lug = mat_whl @ Matrix.Translation(Vector((lx, ly, x_sign * (tw * 0.37))))
            bmesh.ops.create_cylinder(bm_lugs, radius=0.009, depth=0.018, segments=12, matrix=mat_lug)

    obj_valves = link_obj("GEO_FTYPE_Wheel_Tire_Valve_Stems", bm_valves, parent_col, mats["chrome"], bevel=0.0003)
    obj_lugs = link_obj("GEO_FTYPE_Wheel_Chrome_LugNuts", bm_lugs, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_valves, obj_lugs])
    return objs


# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 18: BRAKE CALIPER "JAGUAR" RELIEF SCRIPT & SPRINGS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_caliper_script_and_hardware(parent_col, mats):
    """
    Constructs high-contrast "JAGUAR" branding and hardware on the yellow brake calipers:
    - High-temperature gloss black raised relief "JAGUAR" lettering along outer caliper face.
    - Stainless steel anti-rattle pad retaining spring clips and guide pins.
    """
    objs = []
    bm_cscript = bmesh.new()
    bm_cspring = bmesh.new()

    caliper_coords = [
        (-0.730,  1.311, 0.343, -1.0, True),
        ( 0.730,  1.311, 0.343,  1.0, True),
        (-0.740, -1.311, 0.343, -1.0, False),
        ( 0.740, -1.311, 0.343,  1.0, False),
    ]

    for cx, cy, cz, x_sign, is_front in caliper_coords:
        cal_ang = math.radians(145 if is_front else 35)
        rr = 0.190 if is_front else 0.188
        c_x = math.cos(cal_ang) * (rr * 0.85)
        c_y = math.sin(cal_ang) * (rr * 0.85)

        mat_cal = Matrix.Translation(Vector((cx, cy, cz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        mat_face = mat_cal @ Matrix.Translation(Vector((c_x, c_y, x_sign * 0.065))) @ Euler((0, 0, cal_ang + math.pi * 0.5), 'XYZ').to_matrix().to_4x4()

        # 1. "JAGUAR" Script Bar Silhouette on Caliper Face
        bmesh.ops.create_cube(bm_cscript, size=1.0, matrix=mat_face @ Matrix.Diagonal(Vector((0.022, 0.140, 0.004, 1.0))))

        # 2. Stainless Steel Anti-Rattle Retention Spring Clip
        mat_spring = mat_face @ Matrix.Translation(Vector((0, 0, -0.015)))
        bmesh.ops.create_cube(bm_cspring, size=1.0, matrix=mat_spring @ Matrix.Diagonal(Vector((0.035, 0.080, 0.005, 1.0))))

    obj_cscript = link_obj("GEO_FTYPE_Caliper_Jaguar_Relief_Script", bm_cscript, parent_col, mats["piano_black"], bevel=0.0003)
    obj_cspring = link_obj("GEO_FTYPE_Caliper_AntiRattle_Springs", bm_cspring, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_cscript, obj_cspring])
    return objs


# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 19: FLOCKED WEATHERSTRIPPING & A-PILLAR GASKETS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_weatherstripping_seals(parent_col, mats):
    """
    Constructs the exterior rubber weatherstripping and sealing gaskets:
    - Flocked black EPDM horizontal beltline window wipe squeegees along door top edges.
    - Windshield A-pillar channel seals diverting rain runoff over the roadster greenhouse.
    - Soft-top tonneau perimeter compression sealing bead.
    """
    objs = []
    bm_seals = bmesh.new()

    # 1. Door Beltline Rubber Squeegee Seals (Left and Right doors: Y: -0.350m to +0.550m, Z = 0.840m)
    for sx_sign in [-1.0, 1.0]:
        mat_seal = Matrix.Translation(Vector((sx_sign * 0.760, 0.100, 0.842)))
        bmesh.ops.create_cube(bm_seals, size=1.0, matrix=mat_seal @ Matrix.Diagonal(Vector((0.014, 0.900, 0.012, 1.0))))

        # A-Pillar Water Runoff Deflector Channel (Spanning cowl to header)
        p_cowl = Vector((sx_sign * 0.740, 0.720, 0.810))
        p_hdr = Vector((sx_sign * 0.575, 0.180, 1.280))
        mid_ch = (p_cowl + p_hdr) * 0.5
        mat_ch = Matrix.Translation(mid_ch) @ Vector((0, 0, 1)).rotation_difference(p_hdr - p_cowl).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_seals, radius=0.006, depth=(p_hdr - p_cowl).length, segments=8, matrix=mat_ch)

    # 2. Soft-Top Tonneau Perimeter Compression Bead (Around cockpit rear well)
    mat_tseal = Matrix.Translation(Vector((0.0, -0.720, 0.865)))
    bmesh.ops.create_cube(bm_seals, size=1.0, matrix=mat_tseal @ Matrix.Diagonal(Vector((1.280, 0.420, 0.010, 1.0))))

    obj_seals = link_obj("GEO_FTYPE_Weatherstripping_and_Gaskets", bm_seals, parent_col, mats["trim"], bevel=0.0005)
    objs.append(obj_seals)
    return objs
# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 20: ACTIVE SPOILER RETRACTION SEAMS & WICKERBILL LIP
# ----------------------------------------------------------------------------

def build_jaguar_ftype_spoiler_seam_and_wickerbill(parent_col, mats):
    """
    Constructs the detailed active spoiler shut line and aerodynamic edge:
    - Recessed 3mm perimeter shut line gap defining the active spoiler boundary in rear decklid.
    - Integrated carbon composite trailing wickerbill Gurney flap along spoiler rear edge.
    - Water drain channels in spoiler pocket preventing standing water when parked.
    """
    objs = []
    bm_sp_gap = bmesh.new()
    bm_wicker = bmesh.new()

    mat_sp_center = Matrix.Translation(Vector((0.0, -1.880, 0.812))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Recessed Perimeter Gap Shadow Line (Width 1.185m, Depth 0.225m)
    bmesh.ops.create_cube(bm_sp_gap, size=1.0, matrix=mat_sp_center @ Matrix.Diagonal(Vector((1.190, 0.226, 0.006, 1.0))))

    # 2. Trailing Carbon Wickerbill Lip (3mm vertical aerodynamic trip-strip)
    mat_wlip = mat_sp_center @ Matrix.Translation(Vector((0.0, -0.112, 0.016)))
    bmesh.ops.create_cube(bm_wicker, size=1.0, matrix=mat_wlip @ Matrix.Diagonal(Vector((1.170, 0.008, 0.014, 1.0))))

    obj_sp_gap = link_obj("GEO_FTYPE_Spoiler_Shutline_Recess", bm_sp_gap, parent_col, mats["trim"], bevel=0.0003)
    obj_wicker = link_obj("GEO_FTYPE_Spoiler_Wickerbill_Lip", bm_wicker, parent_col, mats["piano_black"], bevel=0.0004)

    objs.extend([obj_sp_gap, obj_wicker])
    return objs


# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 21: SHARK-MOUTH FRONT GRILLE HEXAGONAL MESH
# ----------------------------------------------------------------------------

def build_jaguar_ftype_grille_mesh_infill(parent_col, mats):
    """
    Constructs the high-density hexagonal wire mesh inside shark-mouth grille:
    - Dense procedural diamond/hexagonal pattern spanning upper and lower intake.
    - Chrome grille perimeter surround trim ring outlining the predatory mouth.
    - Horizontal bumper support crossbar dividing upper and lower air flows.
    """
    objs = []
    bm_mesh = bmesh.new()
    bm_surround = bmesh.new()

    mat_g = Matrix.Translation(Vector((0.0, 2.142, 0.490)))

    # 1. Chrome Grille Mouth Perimeter Trim Ring (Width 0.820m, Height 0.260m)
    bmesh.ops.create_cube(bm_surround, size=1.0, matrix=mat_g @ Matrix.Diagonal(Vector((0.835, 0.014, 0.275, 1.0))))

    # 2. Hexagonal Wire Mesh Grid (Grid of horizontal and vertical wire strands)
    for row_i in range(9):
        row_z = (row_i - 4) * 0.028
        mat_row = mat_g @ Matrix.Translation(Vector((0, 0.004, row_z)))
        bmesh.ops.create_cylinder(bm_mesh, radius=0.002, depth=0.800, segments=6, matrix=mat_row @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    for col_i in range(25):
        col_x = (col_i - 12) * 0.032
        mat_col = mat_g @ Matrix.Translation(Vector((col_x, 0.004, 0)))
        bmesh.ops.create_cylinder(bm_mesh, radius=0.002, depth=0.250, segments=6, matrix=mat_col)

    # 3. Horizontal Bumper Divider Bar (Crash beam front fascia)
    mat_bar = mat_g @ Matrix.Translation(Vector((0.0, 0.008, 0.015)))
    bmesh.ops.create_cube(bm_surround, size=1.0, matrix=mat_bar @ Matrix.Diagonal(Vector((0.810, 0.022, 0.035, 1.0))))

    obj_mesh = link_obj("GEO_FTYPE_Grille_Hex_Wire_Mesh", bm_mesh, parent_col, mats["piano_black"], bevel=0.0003)
    obj_surround = link_obj("GEO_FTYPE_Grille_Chrome_Surround", bm_surround, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_mesh, obj_surround])
    return objs


# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 22: LOWER SHARK GILL HONEYCOMB MESHES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_shark_gill_meshes(parent_col, mats):
    """
    Constructs the outer brake cooling duct intake grilles:
    - Hexagonal mesh screens inside outer shark gill bumper scoops (X = +/- 0.680m, Y = +2.020m).
    - Integrated horizontal aerodynamic splitter vane inside each scoop.
    """
    objs = []
    bm_gill_mesh = bmesh.new()

    for gx_sign in [-1.0, 1.0]:
        mat_gill = Matrix.Translation(Vector((gx_sign * 0.680, 2.020, 0.380))) @ Euler((math.radians(8), gx_sign * math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()

        # Hexagonal Infill Grid Strands
        for r_i in range(5):
            r_z = (r_i - 2) * 0.032
            mat_gr = mat_gill @ Matrix.Translation(Vector((0, 0.010, r_z)))
            bmesh.ops.create_cylinder(bm_gill_mesh, radius=0.002, depth=0.220, segments=6, matrix=mat_gr @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        for c_i in range(7):
            c_x = (c_i - 3) * 0.032
            mat_gc = mat_gill @ Matrix.Translation(Vector((c_x, 0.010, 0)))
            bmesh.ops.create_cylinder(bm_gill_mesh, radius=0.002, depth=0.160, segments=6, matrix=mat_gc)

        # Aerodynamic Horizontal Splitter Blade
        mat_bblade = mat_gill @ Matrix.Translation(Vector((0, 0.015, 0)))
        bmesh.ops.create_cube(bm_gill_mesh, size=1.0, matrix=mat_bblade @ Matrix.Diagonal(Vector((0.230, 0.020, 0.010, 1.0))))

    obj_gill_mesh = link_obj("GEO_FTYPE_Shark_Gill_Honeycomb_Meshes", bm_gill_mesh, parent_col, mats["piano_black"], bevel=0.0004)
    objs.append(obj_gill_mesh)
    return objs


# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 23: REAR DIFFUSER STRAKES & TOW EYE HATCH
# ----------------------------------------------------------------------------

def build_jaguar_ftype_diffuser_jewelry(parent_col, mats):
    """
    Constructs the rear diffuser jewelry and aerodynamic details:
    - 4 razor-sharp gloss black vertical diffuser strakes with beveled leading edges.
    - Concealed rear emergency tow eye access cover cap and thumb release notch.
    """
    objs = []
    bm_diff_jewel = bmesh.new()

    mat_dcenter = Matrix.Translation(Vector((0.0, -2.060, 0.220)))

    # 1. 4 Vertical Aerodynamic Diffuser Strakes (X = +/- 0.160m and +/- 0.380m)
    for st_x in [-0.380, -0.160, 0.160, 0.380]:
        mat_fin = Matrix.Translation(Vector((st_x, -2.080, 0.210))) @ Euler((math.radians(-16), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_diff_jewel, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.012, 0.340, 0.080, 1.0))))

    # 2. Removable Tow Eye Access Hatch (Offset right on rear bumper)
    mat_tow_cap = Matrix.Translation(Vector((0.360, -2.060, 0.440)))
    bmesh.ops.create_cylinder(bm_diff_jewel, radius=0.024, depth=0.006, segments=16, matrix=mat_tow_cap @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_diff_jewel = link_obj("GEO_FTYPE_Diffuser_Aero_Strakes_and_TowCap", bm_diff_jewel, parent_col, mats["piano_black"], bevel=0.0008)
    objs.append(obj_diff_jewel)
    return objs
# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 24: CLAMSHELL BONNET VENTS FINE WIRE MESH
# ----------------------------------------------------------------------------

def build_jaguar_ftype_bonnet_vent_screens(parent_col, mats):
    """
    Constructs the wire mesh screens inside the clamshell bonnet louvers:
    - High-density stainless steel black wire mesh inside each hood extractor vent.
    - Gloss black outer raised perimeter lip shielding edges.
    """
    objs = []
    bm_vscreen = bmesh.new()

    for vx_sign in [-1.0, 1.0]:
        mat_vent = Matrix.Translation(Vector((vx_sign * 0.340, 1.450, 0.812))) @ Euler((math.radians(12), vx_sign * math.radians(-5), 0), 'XYZ').to_matrix().to_4x4()

        # Wire Screen Infill
        for wire_i in range(12):
            w_y = (wire_i - 5.5) * 0.022
            mat_w = mat_vent @ Matrix.Translation(Vector((0, w_y, 0.002)))
            bmesh.ops.create_cylinder(bm_vscreen, radius=0.0015, depth=0.080, segments=6, matrix=mat_w @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        for wire_j in range(5):
            w_x = (wire_j - 2) * 0.018
            mat_wj = mat_vent @ Matrix.Translation(Vector((w_x, 0, 0.002)))
            bmesh.ops.create_cylinder(bm_vscreen, radius=0.0015, depth=0.260, segments=6, matrix=mat_wj)

    obj_vscreen = link_obj("GEO_FTYPE_Bonnet_Vent_Wire_Screens", bm_vscreen, parent_col, mats["piano_black"], bevel=0.0003)
    objs.append(obj_vscreen)
    return objs


# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 25: FUEL FILLER FLAP DOOR & LATCH HARDWARE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_fuel_filler_door(parent_col, mats):
    """
    Constructs the circular fuel filler door:
    - Circular fuel flap on passenger rear quarter haunch (X = 0.945m, Y = -1.150m, Z = 0.840m).
    - Recessed circular shut line groove and inner rubber seal.
    - Push-push magnetic latch release plunger and screw-on fuel cap tether.
    """
    objs = []
    bm_fuel_door = bmesh.new()

    mat_ff = Matrix.Translation(Vector((0.952, -1.150, 0.840))) @ Euler((0, math.radians(12), math.radians(-8)), 'XYZ').to_matrix().to_4x4()

    # 1. Outer Circular Fuel Flap
    bmesh.ops.create_cylinder(bm_fuel_door, radius=0.068, depth=0.006, segments=24, matrix=mat_ff @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Recessed Shadow Ring Groove
    mat_fgroove = mat_ff @ Matrix.Translation(Vector((-0.004, 0, 0)))
    bmesh.ops.create_cylinder(bm_fuel_door, radius=0.072, depth=0.008, segments=24, matrix=mat_fgroove @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_fuel_door = link_obj("GEO_FTYPE_Fuel_Filler_Flap", bm_fuel_door, parent_col, mats["body"], bevel=0.0005)
    objs.append(obj_fuel_door)
    return objs


# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 26: UNDERBODY DZUS FASTENERS & FASTENER RINGS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_underbody_dzus_fasteners(parent_col, mats):
    """
    Constructs aerodynamic underbody flush fasteners:
    - 24 countersunk Dzus quarter-turn quick-release fasteners along underbody undertray seams.
    - Stamped circular dimple fastener retention washers.
    """
    objs = []
    bm_dzus = bmesh.new()

    dzus_locations = []
    # Perimeter undertray bolts
    for dy in [1.500, 1.000, 0.500, 0.000, -0.500, -1.000]:
        for dx_sign in [-1.0, 1.0]:
            dzus_locations.append((dx_sign * 0.680, dy, 0.125))
            dzus_locations.append((dx_sign * 0.320, dy, 0.125))

    for x, y, z in dzus_locations:
        mat_dz = Matrix.Translation(Vector((x, y, z)))
        # Outer Counter-Sunk Washer
        bmesh.ops.create_cylinder(bm_dzus, radius=0.012, depth=0.004, segments=12, matrix=mat_dz)
        # Center Slotted Dzus Head
        bmesh.ops.create_cylinder(bm_dzus, radius=0.007, depth=0.006, segments=10, matrix=mat_dz)

    obj_dzus = link_obj("GEO_FTYPE_Underbody_Dzus_Fasteners", bm_dzus, parent_col, mats["alloy"], bevel=0.0003)
    objs.append(obj_dzus)
    return objs


# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 27: WINDSHIELD CERAMIC FRIT PERIMETER MASK
# ----------------------------------------------------------------------------

def build_jaguar_ftype_windshield_ceramic_frit(parent_col, mats):
    """
    Constructs the black ceramic enamel frit border around the windshield:
    - Opaque black silk-screened enamel perimeter band along edges of windshield glass.
    - Graded dot-matrix sunshade band around interior rearview mirror / ADAS camera pod.
    - Protects urethane glass bonding adhesive from UV degradation.
    """
    objs = []
    bm_frit = bmesh.new()

    p_cowl_c = Vector((0.0, 0.720, 0.825))
    p_hdr_c = Vector((0.0, 0.180, 1.270))
    mid_g = (p_cowl_c + p_hdr_c) * 0.5
    mat_frit = Matrix.Translation(mid_g) @ Vector((0, 0, 1)).rotation_difference(p_hdr_c - p_cowl_c).to_matrix().to_4x4()

    # Left and Right Outer Frit Border Bands
    for fx_sign in [-1.0, 1.0]:
        mat_side = mat_frit @ Matrix.Translation(Vector((fx_sign * 0.550, -0.003, 0)))
        bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_side @ Matrix.Diagonal(Vector((0.035, 0.003, (p_hdr_c - p_cowl_c).length * 0.98, 1.0))))

    # Upper Header Frit Band
    mat_top = mat_frit @ Matrix.Translation(Vector((0.0, -0.003, (p_hdr_c - p_cowl_c).length * 0.48)))
    bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_top @ Matrix.Diagonal(Vector((1.120, 0.003, 0.035, 1.0))))

    # Lower Cowl Frit Band
    mat_bot = mat_frit @ Matrix.Translation(Vector((0.0, -0.003, -(p_hdr_c - p_cowl_c).length * 0.48)))
    bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_bot @ Matrix.Diagonal(Vector((1.120, 0.003, 0.030, 1.0))))

    obj_frit = link_obj("GEO_FTYPE_Windshield_Ceramic_Frit_Mask", bm_frit, parent_col, mats["piano_black"], bevel=0.0003)
    objs.append(obj_frit)
    return objs
# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 28: ENGINE BAY VIN PLACARDS & CERTIFICATION DECALS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_engine_bay_placards(parent_col, mats):
    """
    Constructs engine bay identification and safety plaques:
    - Stamped aluminum 17-character VIN identification plate on passenger strut tower.
    - Emissions control and air conditioning specification stickers on radiator slam panel.
    - Supercharger belt routing schematic decal.
    """
    objs = []
    bm_decals = bmesh.new()

    # 1. Stamped Aluminum VIN Plate (Passenger shock tower: X = 0.560m, Y = 1.320m, Z = 0.740m)
    mat_vin = Matrix.Translation(Vector((0.560, 1.320, 0.740))) @ Euler((0, 0, math.radians(-25)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_vin @ Matrix.Diagonal(Vector((0.085, 0.040, 0.003, 1.0))))

    # 2. Emissions & A/C Specification Decal (Front slam panel: X = -0.220m, Y = 2.080m, Z = 0.580m)
    mat_emis = Matrix.Translation(Vector((-0.220, 2.080, 0.580)))
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_emis @ Matrix.Diagonal(Vector((0.110, 0.055, 0.002, 1.0))))

    # 3. Supercharger Belt Routing Decal (Center radiator cover)
    mat_belt_dec = Matrix.Translation(Vector((0.180, 2.080, 0.580)))
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_belt_dec @ Matrix.Diagonal(Vector((0.090, 0.050, 0.002, 1.0))))

    obj_decals = link_obj("GEO_FTYPE_Engine_Bay_Placards_and_Decals", bm_decals, parent_col, mats["chrome"], bevel=0.0003)
    objs.append(obj_decals)
    return objs


# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 29: MACHINED ALUMINUM OIL FILLER CAP
# ----------------------------------------------------------------------------

def build_jaguar_ftype_oil_filler_cap(parent_col, mats):
    """
    Constructs the jewel-like engine oil filler cap:
    - Billet machined aluminum oil filler cap on front of right cam cover (X = 0.220m, Y = 1.480m, Z = 0.680m).
    - Knurled tactile outer grip perimeter.
    - Cast relief Jaguar Growler / oil can icon engraved on cap crown.
    """
    objs = []
    bm_cap = bmesh.new()

    mat_oil_cap = Matrix.Translation(Vector((0.220, 1.480, 0.680))) @ Euler((0, math.radians(45), 0), 'XYZ').to_matrix().to_4x4()

    # Main Cap Cylindrical Body
    bmesh.ops.create_cylinder(bm_cap, radius=0.026, depth=0.018, segments=20, matrix=mat_oil_cap)

    # Knurled Grip Studs (8 radial knurl teeth)
    for k_i in range(8):
        k_ang = k_i * (math.pi / 4.0)
        kx = math.cos(k_ang) * 0.027
        ky = math.sin(k_ang) * 0.027
        mat_knurl = mat_oil_cap @ Matrix.Translation(Vector((kx, ky, 0)))
        bmesh.ops.create_cylinder(bm_cap, radius=0.004, depth=0.016, segments=6, matrix=mat_knurl)

    # Center Raised Icon Ridge
    mat_cridge = mat_oil_cap @ Matrix.Translation(Vector((0, 0, 0.010)))
    bmesh.ops.create_cube(bm_cap, size=1.0, matrix=mat_cridge @ Matrix.Diagonal(Vector((0.024, 0.012, 0.005, 1.0))))

    obj_cap = link_obj("GEO_FTYPE_Billet_Oil_Filler_Cap", bm_cap, parent_col, mats["alloy"], bevel=0.0004)
    objs.append(obj_cap)
    return objs


# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 30: REAR DECKLID SATELLITE ANTENNA POD
# ----------------------------------------------------------------------------

def build_jaguar_ftype_satellite_antenna(parent_col, mats):
    """
    Constructs the compact GPS/cellular shark-fin satellite antenna pod:
    - Aerodynamic low-profile antenna pod centered on rear trunk decklid (X = 0.0m, Y = -1.720m, Z = 0.835m).
    - Body-colored / gloss black swept fin profile with rubber base gasket.
    """
    objs = []
    bm_ant = bmesh.new()

    mat_ant = Matrix.Translation(Vector((0.0, -1.720, 0.835))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()

    # Swept Aerodynamic Fin Blade
    bmesh.ops.create_cube(bm_ant, size=1.0, matrix=mat_ant @ Matrix.Diagonal(Vector((0.048, 0.110, 0.045, 1.0))))

    # Base Rubber Gasket Sealing Rim
    mat_gask = mat_ant @ Matrix.Translation(Vector((0, 0, -0.020)))
    bmesh.ops.create_cube(bm_ant, size=1.0, matrix=mat_gask @ Matrix.Diagonal(Vector((0.054, 0.120, 0.006, 1.0))))

    obj_ant = link_obj("GEO_FTYPE_Satellite_Antenna_Fin", bm_ant, parent_col, mats["piano_black"], bevel=0.0008)
    objs.append(obj_ant)
    return objs


# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 31: INSTRUMENT CLUSTER CHRONO DIALS & PADDLE SHIFTERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_instrument_cluster_and_paddles(parent_col, mats):
    """
    Constructs the driver's chronograph-inspired instrument cluster and paddle shifters:
    - Twin hooded chronograph circular dials (Speedometer and 8,000 RPM Tachometer) with chrome bezels.
    - Central color TFT driver information display screen.
    - Ignis orange anodized aluminum steering wheel paddle shifters (+ on right, - on left).
    """
    objs = []
    bm_dials = bmesh.new()
    bm_paddles = bmesh.new()

    mat_cluster = Matrix.Translation(Vector((-0.360, 0.460, 0.865))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Twin Chronograph Circular Dial Rings (Left: Speedometer, Right: Tachometer)
    for dx_sign in [-1.0, 1.0]:
        mat_dial = mat_cluster @ Matrix.Translation(Vector((dx_sign * 0.095, -0.010, 0)))
        # Chrome Outer Bezel Ring
        bmesh.ops.create_cylinder(bm_dials, radius=0.046, depth=0.016, segments=22, matrix=mat_dial @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Dial Face Disc
        bmesh.ops.create_cylinder(bm_dials, radius=0.042, depth=0.008, segments=20, matrix=mat_dial @ Matrix.Translation(Vector((0, 0.004, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Center TFT Information Display Screen (Between twin dial rings)
    mat_tft = mat_cluster @ Matrix.Translation(Vector((0, 0.005, 0)))
    bmesh.ops.create_cube(bm_dials, size=1.0, matrix=mat_tft @ Matrix.Diagonal(Vector((0.085, 0.006, 0.060, 1.0))))

    # 3. Steering Wheel Ignis Anodized Aluminum Paddle Shifters
    mat_wheel_hub = Matrix.Translation(Vector((-0.360, 0.320, 0.840))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    for px_sign in [-1.0, 1.0]:
        mat_pad = mat_wheel_hub @ Matrix.Translation(Vector((px_sign * 0.160, 0.035, 0.040))) @ Euler((0, px_sign * math.radians(-12), 0), 'XYZ').to_matrix().to_4x4()
        # Extended Ergonomic Paddle Blade
        bmesh.ops.create_cube(bm_paddles, size=1.0, matrix=mat_pad @ Matrix.Diagonal(Vector((0.024, 0.008, 0.110, 1.0))))

    obj_dials = link_obj("GEO_FTYPE_Instrument_Cluster_Dials", bm_dials, parent_col, mats["chrome"], bevel=0.0005)
    obj_paddles = link_obj("GEO_FTYPE_Ignis_Orange_Paddle_Shifters", bm_paddles, parent_col, mats["body"], bevel=0.0006)

    objs.extend([obj_dials, obj_paddles])
    return objs
# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 32: ROLLOVER HOOP CAPS & AIR TURBULENCE BAFFLE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rollover_caps_and_baffle(parent_col, mats):
    """
    Constructs the rollover hoop protective capping and center turbulence baffle:
    - Gloss black aerodynamic crown caps on top of both safety roll hoops.
    - Fine mesh anti-buffeting screen inserted between hoops to eliminate cockpit wind roar.
    """
    objs = []
    bm_caps = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        hx = hx_sign * 0.360
        hy = -0.440
        hz = 1.140

        # Protective Aerodynamic Crown Cap
        mat_cap = Matrix.Translation(Vector((hx, hy, hz)))
        bmesh.ops.create_cube(bm_caps, size=1.0, matrix=mat_cap @ Matrix.Diagonal(Vector((0.260, 0.065, 0.024, 1.0))))

    # Center Wind Turbulence Mesh Infill (Between left and right hoops)
    mat_mesh = Matrix.Translation(Vector((0.0, -0.440, 1.020)))
    bmesh.ops.create_cube(bm_caps, size=1.0, matrix=mat_mesh @ Matrix.Diagonal(Vector((0.420, 0.005, 0.180, 1.0))))

    obj_caps = link_obj("GEO_FTYPE_Rollover_Caps_and_Baffle", bm_caps, parent_col, mats["piano_black"], bevel=0.0008)
    objs.append(obj_caps)
    return objs


# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 33: UNDER-MIRROR PUDDLE LAMPS (LEAPER PROJECTION)
# ----------------------------------------------------------------------------

def build_jaguar_ftype_mirror_puddle_lamps(parent_col, mats):
    """
    Constructs the under-mirror puddle illumination lamps:
    - Microscopic LED projector lenses recessed in underside of each side mirror housing.
    - Projects the iconic illuminated Jaguar Leaper feline graphic onto ground.
    """
    objs = []
    bm_puddle = bmesh.new()

    for mx_sign in [-1.0, 1.0]:
        sx = mx_sign * 0.985
        sy = 0.660
        sz = 0.840

        # Under-Mirror Micro Projector Lens (Facing ground)
        mat_pud = Matrix.Translation(Vector((sx, sy, sz)))
        bmesh.ops.create_cylinder(bm_puddle, radius=0.010, depth=0.006, segments=12, matrix=mat_pud)

    obj_puddle = link_obj("GEO_FTYPE_Puddle_Lamp_Projectors", bm_puddle, parent_col, mats["drl_white"], bevel=0.0003)
    objs.append(obj_puddle)
    return objs


# ----------------------------------------------------------------------------
# 36. SUBSYSTEM 34: EXHAUST HEAT SHIELD DIMPLES & MUFFLER CLAMPS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_exhaust_clamps_and_dimples(parent_col, mats):
    """
    Constructs exhaust mounting hardware and thermal management details:
    - Heavy-duty T-bolt band clamps securing quad exhaust tips to rear muffler outlets.
    - Stamped hexagonal thermal expansion dimples on underbody aluminum heat shields.
    """
    objs = []
    bm_clamps = bmesh.new()

    for qx_sign in [-1.0, 1.0]:
        for sub_x_off in [-0.045, 0.045]:
            tx = qx_sign * 0.620 + sub_x_off
            ty = -2.040
            tz = 0.250

            mat_clamp = Matrix.Translation(Vector((tx, ty, tz)))
            # Heavy Stainless Band Clamp
            bmesh.ops.create_cylinder(bm_clamps, radius=0.048, depth=0.024, segments=16, matrix=mat_clamp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
            # Clamping Tightening Bolt & Nut
            mat_bolt = mat_clamp @ Matrix.Translation(Vector((0, 0, 0.052)))
            bmesh.ops.create_cylinder(bm_clamps, radius=0.006, depth=0.030, segments=8, matrix=mat_bolt @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_clamps = link_obj("GEO_FTYPE_Exhaust_T_Bolt_Clamps", bm_clamps, parent_col, mats["chrome"], bevel=0.0005)
    objs.append(obj_clamps)
    return objs
# ----------------------------------------------------------------------------
# 37. SUBSYSTEM 35: ACTIVE AERO GRILLE SHUTTERS & AUXILIARY COOLER RADIATORS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_active_aero_shutters(parent_col, mats):
    """
    Constructs the motorized front active aerodynamic grille shutter system and auxiliary radiator cores:
    - Motorized horizontal airfoil vanes mounted directly behind the main honeycomb grille.
      These vanes close at high speeds to streamline frontal airflow, reducing drag coefficient (Cd).
    - Center electric stepper motor actuator with mechanical tie-rod synchronization linkage.
    - Twin auxiliary oil cooler radiator cores mounted inside the lower outboard bumper air scoops,
      complete with fine horizontal cooling fin matrices and stone-guard protective mesh screens.
    """
    objs = []
    bm_shutters = bmesh.new()
    bm_rads = bmesh.new()

    # Main Grille Active Louver Vanes (7 articulated horizontal blades)
    for i in range(7):
        vy = 2.050 - (i * 0.008)
        vz = 0.380 + (i * 0.045)
        blade_width = 0.820 - (abs(i - 3) * 0.040)

        mat_vane = Matrix.Translation(Vector((0.0, vy, vz)))
        # Aerodynamic teardrop cross-section louver blade
        bmesh.ops.create_cube(
            bm_shutters,
            size=1.0,
            matrix=mat_vane @ Matrix.Diagonal(Vector((blade_width, 0.022, 0.005, 1.0)))
        )
        # End pivot trunnion pins for each blade
        for px_sign in [-1.0, 1.0]:
            px = px_sign * (blade_width * 0.5 + 0.008)
            mat_pin = Matrix.Translation(Vector((px, vy, vz)))
            bmesh.ops.create_cylinder(
                bm_shutters,
                radius=0.004,
                depth=0.016,
                segments=10,
                matrix=mat_pin @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
            )

    # Vertical Tie-Rod Synchronization Linkage
    mat_tierod = Matrix.Translation(Vector((0.0, 2.040, 0.515)))
    bmesh.ops.create_cylinder(
        bm_shutters,
        radius=0.0035,
        depth=0.290,
        segments=8,
        matrix=mat_tierod
    )

    # Electric Stepper Motor Actuator Housing (Mounted on upper cross-member)
    mat_actuator = Matrix.Translation(Vector((0.0, 2.020, 0.670)))
    bmesh.ops.create_cube(
        bm_shutters,
        size=1.0,
        matrix=mat_actuator @ Matrix.Diagonal(Vector((0.065, 0.055, 0.045, 1.0)))
    )

    obj_shutters = link_obj("GEO_FTYPE_Active_Aero_Grille_Shutters", bm_shutters, parent_col, mats["piano_black"], bevel=0.0006)
    objs.append(obj_shutters)

    # Twin Auxiliary Outboard Oil Coolers (Inside lower shark gill scoops)
    for rx_sign in [-1.0, 1.0]:
        rx = rx_sign * 0.620
        ry = 1.940
        rz = 0.320

        mat_rad = Matrix.Translation(Vector((rx, ry, rz))) @ Euler((0, rx_sign * 0.12, 0), 'XYZ').to_matrix().to_4x4()
        # Radiator core body
        bmesh.ops.create_cube(
            bm_rads,
            size=1.0,
            matrix=mat_rad @ Matrix.Diagonal(Vector((0.240, 0.060, 0.160, 1.0)))
        )
        # Billet end tanks (Top & Bottom)
        for tz_off in [-0.088, 0.088]:
            mat_tank = mat_rad @ Matrix.Translation(Vector((0, 0, tz_off)))
            bmesh.ops.create_cube(
                bm_rads,
                size=1.0,
                matrix=mat_tank @ Matrix.Diagonal(Vector((0.245, 0.064, 0.016, 1.0)))
            )
        # Stainless steel braided cooling line hose fittings (AN-10 fittings)
        for hx_off in [-0.080, 0.080]:
            mat_an = mat_rad @ Matrix.Translation(Vector((hx_off, -0.038, 0.085)))
            bmesh.ops.create_cylinder(
                bm_rads,
                radius=0.012,
                depth=0.028,
                segments=12,
                matrix=mat_an @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
            )

    obj_rads = link_obj("GEO_FTYPE_Auxiliary_Oil_Coolers", bm_rads, parent_col, mats["inconel"], bevel=0.0008)
    objs.append(obj_rads)
    return objs


# ----------------------------------------------------------------------------
# 38. SUBSYSTEM 36: CARBON-CERAMIC BRAKE HARDWARE & WEAR SENSOR WIRING
# ----------------------------------------------------------------------------

def build_jaguar_ftype_ccm_brake_micro_hardware(parent_col, mats):
    """
    Constructs ultra-detailed high-performance Carbon-Ceramic Matrix (CCM) brake hardware:
    - Stainless steel pad retaining guide pins with split cotter locking clips on all 4 monobloc calipers.
    - Stamped titanium anti-rattle pad spring plates spanning across the caliper bridge window.
    - Electronic brake pad wear sensor wiring harnesses encased in corrugated flex conduit,
      clipped to the aluminum suspension uprights with nylon P-clips.
    - Machined bleed nipples with protective rubber dust seal caps and tether leashes.
    """
    objs = []
    bm_pins = bmesh.new()
    bm_wiring = bmesh.new()

    wheel_positions = [
        # (name, x_sign, is_front, center_x, center_y, center_z)
        ("FL", -1.0, True, -0.820, 1.320, 0.335),
        ("FR",  1.0, True,  0.820, 1.320, 0.335),
        ("RL", -1.0, False, -0.835, -1.300, 0.335),
        ("RR",  1.0, False,  0.835, -1.300, 0.335),
    ]

    for name, x_sign, is_front, cx, cy, cz in wheel_positions:
        # Caliper is positioned at top/forward quadrant
        ang = 0.65 if is_front else 2.50
        cal_r = 0.165 if is_front else 0.145
        cal_y = cy + math.sin(ang) * cal_r
        cal_z = cz + math.cos(ang) * cal_r
        cal_x = cx - (x_sign * 0.045)

        mat_cal = Matrix.Translation(Vector((cal_x, cal_y, cal_z)))

        # 1. Dual Stainless Pad Retaining Cross-Pins
        pin_spacing = 0.055 if is_front else 0.042
        for p_off in [-pin_spacing, pin_spacing]:
            mat_pin = mat_cal @ Matrix.Translation(Vector((0, p_off, 0.025)))
            # Stainless pin shaft
            bmesh.ops.create_cylinder(
                bm_pins,
                radius=0.0035,
                depth=0.065,
                segments=10,
                matrix=mat_pin @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
            )
            # Cotter locking clip ring
            mat_cotter = mat_pin @ Matrix.Translation(Vector((x_sign * 0.034, 0, 0)))
            bmesh.ops.create_torus(
                bm_pins,
                major_radius=0.005,
                minor_radius=0.0015,
                major_segments=12,
                minor_segments=8,
                matrix=mat_cotter
            )

        # 2. Titanium Cross-Bridge Anti-Rattle Spring Plate
        mat_spring = mat_cal @ Matrix.Translation(Vector((0, 0, 0.032)))
        bmesh.ops.create_cube(
            bm_pins,
            size=1.0,
            matrix=mat_spring @ Matrix.Diagonal(Vector((0.042, pin_spacing * 2.2, 0.003, 1.0)))
        )

        # 3. Dual Hydraulic Bleeder Screws with Rubber Caps
        for b_off in [-0.035, 0.035]:
            mat_bleed = mat_cal @ Matrix.Translation(Vector((0, b_off, 0.048)))
            # Hex bleeder body
            bmesh.ops.create_cylinder(
                bm_pins,
                radius=0.005,
                depth=0.016,
                segments=6,
                matrix=mat_bleed
            )
            # Rubber cap on top
            mat_cap = mat_bleed @ Matrix.Translation(Vector((0, 0, 0.010)))
            bmesh.ops.create_cylinder(
                bm_wiring,
                radius=0.0055,
                depth=0.008,
                segments=10,
                matrix=mat_cap
            )

        # 4. Electronic Brake Pad Wear Sensor Loom & Conduit
        pts_wire = [
            Vector((cal_x, cal_y, cal_z + 0.020)),
            Vector((cal_x + (x_sign * 0.020), cal_y - 0.030, cal_z + 0.050)),
            Vector((cx - (x_sign * 0.080), cy - 0.020, cz + 0.120)),
            Vector((cx - (x_sign * 0.120), cy, cz + 0.180)),
        ]
        for w_idx in range(len(pts_wire) - 1):
            p_start = pts_wire[w_idx]
            p_end = pts_wire[w_idx + 1]
            seg_vec = p_end - p_start
            seg_len = seg_vec.length
            mid_pt = (p_start + p_end) * 0.5

            quat = Vector((0, 0, 1)).rotation_difference(seg_vec.normalized())
            mat_seg = Matrix.Translation(mid_pt) @ quat.to_matrix().to_4x4()
            bmesh.ops.create_cylinder(
                bm_wiring,
                radius=0.003,
                depth=seg_len,
                segments=8,
                matrix=mat_seg
            )

        # P-Clip bracket securing sensor harness to knuckle
        mat_pclip = Matrix.Translation(Vector((cx - (x_sign * 0.080), cy - 0.020, cz + 0.120)))
        bmesh.ops.create_cube(
            bm_pins,
            size=1.0,
            matrix=mat_pclip @ Matrix.Diagonal(Vector((0.012, 0.016, 0.008, 1.0)))
        )

    obj_pins = link_obj("GEO_FTYPE_CCM_Brake_Hardware_Pins", bm_pins, parent_col, mats["chrome"], bevel=0.0004)
    obj_wiring = link_obj("GEO_FTYPE_Brake_Sensor_Wiring_Loom", bm_wiring, parent_col, mats["rubber"], bevel=0.0003)
    objs.extend([obj_pins, obj_wiring])
    return objs


# ----------------------------------------------------------------------------
# 39. SUBSYSTEM 37: UNDERFLOOR VENTURI DIFFUSER TUNNELS & HEAT SHIELDING
# ----------------------------------------------------------------------------

def build_jaguar_ftype_underfloor_venturi_and_heatshields(parent_col, mats):
    """
    Constructs the high-speed underbody aerodynamic venturi tunnels and thermal management shielding:
    - Dual underfloor venturi expansion tunnels accelerating high-velocity boundary layer air into the rear diffuser.
    - 4 razor-sharp longitudinal aerodynamic fence strakes generating vortex boundaries between exhaust flow channels.
    - Stamped aircraft-grade embossed aluminum thermal heat deflection shields insulating rear suspension
      subframe and electronic active rear differential (E-Diff) from 575hp supercharged exhaust radiation.
    """
    objs = []
    bm_tunnels = bmesh.new()
    bm_shields = bmesh.new()

    # Dual Venturi Expansion Tunnels (Under rear axle spanning to diffuser)
    for tx_sign in [-1.0, 1.0]:
        tx = tx_sign * 0.420
        ty = -1.550
        tz = 0.200

        mat_tunnel = Matrix.Translation(Vector((tx, ty, tz))) @ Euler((0.06, 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(
            bm_tunnels,
            size=1.0,
            matrix=mat_tunnel @ Matrix.Diagonal(Vector((0.360, 0.850, 0.020, 1.0)))
        )

        # Longitudinal Vortex Generator Strakes (Sharply sculpted fins)
        for s_idx, sx_off in enumerate([-0.140, 0.0, 0.140]):
            mat_strake = mat_tunnel @ Matrix.Translation(Vector((sx_off, 0.0, -0.035)))
            bmesh.ops.create_cube(
                bm_tunnels,
                size=1.0,
                matrix=mat_strake @ Matrix.Diagonal(Vector((0.004, 0.820, 0.055, 1.0)))
            )

    obj_tunnels = link_obj("GEO_FTYPE_Underfloor_Venturi_Tunnels", bm_tunnels, parent_col, mats["piano_black"], bevel=0.0008)
    objs.append(obj_tunnels)

    # Embossed Aluminum Heat Shield Enclosure (Around rear differential and muffler)
    mat_diff_shield = Matrix.Translation(Vector((0.0, -1.350, 0.310)))
    bmesh.ops.create_cube(
        bm_shields,
        size=1.0,
        matrix=mat_diff_shield @ Matrix.Diagonal(Vector((0.680, 0.520, 0.015, 1.0)))
    )

    # Muffler Forward Thermal Deflection Bulkhead
    mat_muff_shield = Matrix.Translation(Vector((0.0, -1.820, 0.330))) @ Euler((-0.25, 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(
        bm_shields,
        size=1.0,
        matrix=mat_muff_shield @ Matrix.Diagonal(Vector((1.120, 0.220, 0.012, 1.0)))
    )

    # Heat Shield Structural Stamping Ribs (Hexagonal embossed stiffeners)
    for rib_y in [-1.200, -1.350, -1.500]:
        mat_rib = Matrix.Translation(Vector((0.0, rib_y, 0.318)))
        bmesh.ops.create_cylinder(
            bm_shields,
            radius=0.004,
            depth=0.550,
            segments=8,
            matrix=mat_rib @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )

    obj_shields = link_obj("GEO_FTYPE_Underbody_Exhaust_Heat_Shields", bm_shields, parent_col, mats["inconel"], bevel=0.0005)
    objs.append(obj_shields)
    return objs
# ----------------------------------------------------------------------------
# 40. SUBSYSTEM 38: CLAMSHELL BONNET GAS STRUTS & BILLET LOCATOR PINS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_bonnet_struts_and_latches(parent_col, mats):
    """
    Constructs the reverse-opening clamshell bonnet mechanical support and alignment hardware:
    - Twin pressurized nitrogen gas lift struts with satin black damper bodies and micro-polished chrome piston shafts.
    - Swiveling steel ball-joint end sockets attached to strut towers and bonnet mounting brackets.
    - Precision CNC machined billet aluminum conical guide alignment pins on outer fender edges with rubber receiving sockets.
    - Primary and secondary emergency safety latch catch hooks with coiled return springs.
    """
    objs = []
    bm_struts = bmesh.new()
    bm_pins = bmesh.new()

    for bx_sign in [-1.0, 1.0]:
        bx = bx_sign * 0.760
        # Lower ball-stud attachment point (on strut tower apron)
        p_lower = Vector((bx, 1.250, 0.620))
        # Upper ball-stud attachment point (on bonnet under-rib)
        p_upper = Vector((bx_sign * 0.720, 1.720, 0.760))

        strut_vec = p_upper - p_lower
        strut_len = strut_vec.length
        strut_dir = strut_vec.normalized()
        quat = Vector((0, 0, 1)).rotation_difference(strut_dir)

        # 1. Lower Damper Cylinder Body (Outer pressure tube)
        body_len = strut_len * 0.55
        p_body_mid = p_lower + strut_dir * (body_len * 0.5)
        mat_body = Matrix.Translation(p_body_mid) @ quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(
            bm_struts,
            radius=0.012,
            depth=body_len,
            segments=16,
            matrix=mat_body
        )

        # 2. Chrome Piston Shaft (Extending to upper socket)
        shaft_len = strut_len * 0.48
        p_shaft_mid = p_upper - strut_dir * (shaft_len * 0.5)
        mat_shaft = Matrix.Translation(p_shaft_mid) @ quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(
            bm_pins,
            radius=0.006,
            depth=shaft_len,
            segments=14,
            matrix=mat_shaft
        )

        # 3. Ball-Joint Socket Ends (Top & Bottom)
        for p_ball in [p_lower, p_upper]:
            mat_ball = Matrix.Translation(p_ball)
            bmesh.ops.create_cylinder(
                bm_struts,
                radius=0.011,
                depth=0.022,
                segments=12,
                matrix=mat_ball @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
            )

        # 4. Billet Fender Guide Alignment Pin (Conical centering stud)
        mat_guide = Matrix.Translation(Vector((bx_sign * 0.840, 1.620, 0.740)))
        bmesh.ops.create_cylinder(
            bm_pins,
            radius=0.007,
            depth=0.025,
            segments=12,
            matrix=mat_guide
        )
        # Rubber Receiving Cup
        mat_cup = Matrix.Translation(Vector((bx_sign * 0.840, 1.620, 0.725)))
        bmesh.ops.create_cylinder(
            bm_struts,
            radius=0.012,
            depth=0.014,
            segments=12,
            matrix=mat_cup
        )

    # 5. Dual Front Safety Latch Catches (Mounted on radiator slam panel)
    for lx_sign in [-1.0, 1.0]:
        mat_latch = Matrix.Translation(Vector((lx_sign * 0.280, 2.080, 0.690)))
        bmesh.ops.create_cube(
            bm_pins,
            size=1.0,
            matrix=mat_latch @ Matrix.Diagonal(Vector((0.035, 0.045, 0.030, 1.0)))
        )
        # Coiled Return Spring
        mat_spr = mat_latch @ Matrix.Translation(Vector((0, 0.015, -0.012)))
        bmesh.ops.create_cylinder(
            bm_pins,
            radius=0.004,
            depth=0.028,
            segments=8,
            matrix=mat_spr
        )

    obj_struts = link_obj("GEO_FTYPE_Bonnet_Struts_and_Sockets", bm_struts, parent_col, mats["piano_black"], bevel=0.0006)
    obj_pins = link_obj("GEO_FTYPE_Bonnet_Pins_and_Latches", bm_pins, parent_col, mats["chrome"], bevel=0.0004)
    objs.extend([obj_struts, obj_pins])
    return objs


# ----------------------------------------------------------------------------
# 41. SUBSYSTEM 39: CONVERTIBLE TONNEAU HINGES & PERIMETER SCUPPER DRAINS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_tonneau_hinges_and_drainage(parent_col, mats):
    """
    Constructs the convertible soft-top tonneau cover articulation mechanism and perimeter water management:
    - 4-bar kinematic linkage hinge arms fabricated from cast aluminum, supporting the rear deck tonneau cover.
    - Hydraulic lift cylinders that actuate the tonneau cover during high-speed 12-second roof deployment.
    - Deep perimeter water drainage trough surrounding the soft-top storage well.
    - Flexible EPDM rubber scupper one-way duckbill drain tubes directing rain runoff down through wheel wells.
    """
    objs = []
    bm_hinges = bmesh.new()
    bm_gutters = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        hx = hx_sign * 0.680
        hy = -0.680
        hz = 0.860

        # Kinematic Linkage Pivot Bracket (Mounted to rear bulkhead)
        mat_base = Matrix.Translation(Vector((hx, hy, hz)))
        bmesh.ops.create_cube(
            bm_hinges,
            size=1.0,
            matrix=mat_base @ Matrix.Diagonal(Vector((0.038, 0.090, 0.045, 1.0)))
        )

        # Primary Cast Aluminum Articulated Arm
        p_arm_start = Vector((hx, hy - 0.030, hz + 0.015))
        p_arm_end = Vector((hx_sign * 0.640, hy + 0.120, hz + 0.140))
        arm_vec = p_arm_end - p_arm_start
        arm_len = arm_vec.length
        arm_dir = arm_vec.normalized()
        quat_arm = Vector((0, 0, 1)).rotation_difference(arm_dir)

        mat_arm = Matrix.Translation((p_arm_start + p_arm_end) * 0.5) @ quat_arm.to_matrix().to_4x4()
        bmesh.ops.create_cube(
            bm_hinges,
            size=1.0,
            matrix=mat_arm @ Matrix.Diagonal(Vector((0.016, 0.024, arm_len, 1.0)))
        )

        # Hydraulic Tonneau Actuator Cylinder
        p_cyl_base = Vector((hx, hy - 0.050, hz - 0.080))
        p_cyl_rod = (p_arm_start + p_arm_end) * 0.5
        cyl_vec = p_cyl_rod - p_cyl_base
        cyl_len = cyl_vec.length
        quat_cyl = Vector((0, 0, 1)).rotation_difference(cyl_vec.normalized())

        mat_cyl = Matrix.Translation((p_cyl_base + p_cyl_rod) * 0.5) @ quat_cyl.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(
            bm_hinges,
            radius=0.014,
            depth=cyl_len,
            segments=14,
            matrix=mat_cyl
        )

        # Perimeter Water Drain Scupper Duckbill Tube (Drain funnel to rear wheelhouse)
        mat_scupper = Matrix.Translation(Vector((hx_sign * 0.720, -0.850, 0.740)))
        bmesh.ops.create_cylinder(
            bm_gutters,
            radius=0.010,
            depth=0.180,
            segments=10,
            matrix=mat_scupper @ Euler((0.15, 0, 0), 'XYZ').to_matrix().to_4x4()
        )

    # Perimeter U-Channel Water Drainage Gutter (Surrounding roof well perimeter)
    mat_gutter_rear = Matrix.Translation(Vector((0.0, -0.880, 0.875)))
    bmesh.ops.create_cube(
        bm_gutters,
        size=1.0,
        matrix=mat_gutter_rear @ Matrix.Diagonal(Vector((1.380, 0.045, 0.025, 1.0)))
    )
    for sx_sign in [-1.0, 1.0]:
        mat_gutter_side = Matrix.Translation(Vector((sx_sign * 0.690, -0.620, 0.880)))
        bmesh.ops.create_cube(
            bm_gutters,
            size=1.0,
            matrix=mat_gutter_side @ Matrix.Diagonal(Vector((0.045, 0.520, 0.025, 1.0)))
        )

    obj_hinges = link_obj("GEO_FTYPE_Tonneau_Hinges_and_Hydraulics", bm_hinges, parent_col, mats["chrome"], bevel=0.0006)
    obj_gutters = link_obj("GEO_FTYPE_Tonneau_Drainage_Gutters", bm_gutters, parent_col, mats["rubber"], bevel=0.0005)
    objs.extend([obj_hinges, obj_gutters])
    return objs


# ----------------------------------------------------------------------------
# 42. SUBSYSTEM 40: WASHER RESERVOIR & ENGINE BAY BULKHEAD GROMMETS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_washer_reservoir_and_grommets(parent_col, mats):
    """
    Constructs engine bay service hardware and acoustic firewall pass-through grommets:
    - High-capacity windshield washer fluid reservoir filler neck with textured ergonomic neck and
      anodized blue flip-top cap with embossed windshield spray icon.
    - Brake fluid master cylinder transparent reservoir with graduated minimum/maximum fluid level markings.
    - Molded neoprene multi-port firewall bulkhead wiring harness grommets sealing the passenger cell
      from heat and supercharger whine.
    """
    objs = []
    bm_res = bmesh.new()
    bm_grommets = bmesh.new()

    # Washer Fluid Reservoir Filler Neck (Located passenger side cowl shelf)
    mat_filler_neck = Matrix.Translation(Vector((0.740, 1.480, 0.745)))
    bmesh.ops.create_cylinder(
        bm_res,
        radius=0.022,
        depth=0.120,
        segments=18,
        matrix=mat_filler_neck
    )
    # Blue Flip-Top Cap
    mat_blue_cap = mat_filler_neck @ Matrix.Translation(Vector((0, 0, 0.062)))
    bmesh.ops.create_cylinder(
        bm_res,
        radius=0.025,
        depth=0.012,
        segments=20,
        matrix=mat_blue_cap
    )

    # Brake Fluid Master Cylinder Reservoir (Driver side cowl)
    mat_brake_res = Matrix.Translation(Vector((-0.620, 1.380, 0.760)))
    bmesh.ops.create_cube(
        bm_res,
        size=1.0,
        matrix=mat_brake_res @ Matrix.Diagonal(Vector((0.085, 0.110, 0.075, 1.0)))
    )
    # Yellow Screw-On Reservoir Cap
    mat_brake_cap = mat_brake_res @ Matrix.Translation(Vector((0, 0, 0.045)))
    bmesh.ops.create_cylinder(
        bm_res,
        radius=0.024,
        depth=0.015,
        segments=18,
        matrix=mat_brake_cap
    )

    # Neoprene Firewall Bulkhead Wire Harness Grommets (Multi-port through-dash seals)
    for gx_off, gz_off, g_rad in [(-0.350, 0.680, 0.028), (0.380, 0.660, 0.034), (0.0, 0.710, 0.022)]:
        mat_grommet = Matrix.Translation(Vector((gx_off, 1.280, gz_off)))
        bmesh.ops.create_cylinder(
            bm_grommets,
            radius=g_rad,
            depth=0.025,
            segments=16,
            matrix=mat_grommet @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        )
        # Wire loom passing through center
        mat_loom = mat_grommet @ Matrix.Translation(Vector((0, 0.015, 0)))
        bmesh.ops.create_cylinder(
            bm_grommets,
            radius=g_rad * 0.65,
            depth=0.070,
            segments=12,
            matrix=mat_loom @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        )

    obj_res = link_obj("GEO_FTYPE_Fluid_Reservoirs_and_Caps", bm_res, parent_col, mats["piano_black"], bevel=0.0006)
    obj_grommets = link_obj("GEO_FTYPE_Firewall_Bulkhead_Grommets", bm_grommets, parent_col, mats["rubber"], bevel=0.0004)
    objs.extend([obj_res, obj_grommets])
    return objs
# ----------------------------------------------------------------------------
# 43. SUBSYSTEM 41: COCKPIT CENTER CONSOLE CONTROLS & IGNIS START BUTTON
# ----------------------------------------------------------------------------

def build_jaguar_ftype_console_controls_and_start_button(parent_col, mats):
    """
    Constructs the driver-focused cockpit center console controls:
    - "Ignis" copper/bronze anodized engine Start/Stop button with knurled aluminum outer bezel.
    - "SportShift" ergonomic 8-speed electronic gear selector joystick with leather stitched boot and chrome park trigger.
    - Dynamic Mode toggle switch (metal toggle lever featuring the iconic checkered racing flag engraving).
    - Dual rotary climate control dials with integrated digital OLED circular temperature screens and rubber grip rings.
    - Electronic park brake toggle switch and active exhaust acoustic bypass button with dual-pipe graphic.
    """
    objs = []
    bm_controls = bmesh.new()
    bm_screens = bmesh.new()

    # Center Console Trim Tunnel Location
    cy = 0.080
    cz = 0.590

    # 1. "Ignis" Engine Start/Stop Button (Mounted forward on console slope)
    mat_start = Matrix.Translation(Vector((-0.090, cy + 0.160, cz + 0.035))) @ Euler((-0.35, 0, 0), 'XYZ').to_matrix().to_4x4()
    # Knurled outer bezel
    bmesh.ops.create_cylinder(
        bm_controls,
        radius=0.016,
        depth=0.008,
        segments=24,
        matrix=mat_start
    )
    # Anodized copper start button center
    mat_btn = mat_start @ Matrix.Translation(Vector((0, 0, 0.003)))
    bmesh.ops.create_cylinder(
        bm_screens,
        radius=0.013,
        depth=0.006,
        segments=20,
        matrix=mat_btn
    )

    # 2. "SportShift" Electronic Gear Selector Joystick
    mat_shifter_base = Matrix.Translation(Vector((-0.045, cy, cz + 0.020)))
    bmesh.ops.create_cylinder(
        bm_controls,
        radius=0.028,
        depth=0.010,
        segments=20,
        matrix=mat_shifter_base
    )
    # Ergonomic pistol-grip shift knob
    mat_knob = mat_shifter_base @ Matrix.Translation(Vector((0, -0.010, 0.065))) @ Euler((-0.15, 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(
        bm_controls,
        size=1.0,
        matrix=mat_knob @ Matrix.Diagonal(Vector((0.038, 0.055, 0.050, 1.0)))
    )
    # Shifter shaft
    mat_shaft = mat_shifter_base @ Matrix.Translation(Vector((0, -0.005, 0.032)))
    bmesh.ops.create_cylinder(
        bm_controls,
        radius=0.007,
        depth=0.045,
        segments=12,
        matrix=mat_shaft
    )

    # 3. Dynamic Mode Checkered Flag Rocker Switch
    mat_dyn_switch = Matrix.Translation(Vector((-0.100, cy - 0.040, cz + 0.018)))
    bmesh.ops.create_cube(
        bm_controls,
        size=1.0,
        matrix=mat_dyn_switch @ Matrix.Diagonal(Vector((0.018, 0.042, 0.012, 1.0)))
    )

    # 4. Dual Rotary Climate Control Dials with OLED Displays
    for dx_sign in [-1.0, 1.0]:
        mat_dial = Matrix.Translation(Vector((dx_sign * 0.075, cy + 0.280, cz + 0.110))) @ Euler((-0.65, 0, 0), 'XYZ').to_matrix().to_4x4()
        # Knurled rotary outer ring
        bmesh.ops.create_cylinder(
            bm_controls,
            radius=0.025,
            depth=0.016,
            segments=24,
            matrix=mat_dial
        )
        # Center digital OLED display screen
        mat_oled = mat_dial @ Matrix.Translation(Vector((0, 0, 0.006)))
        bmesh.ops.create_cylinder(
            bm_screens,
            radius=0.019,
            depth=0.005,
            segments=20,
            matrix=mat_oled
        )

    # 5. Electronic Parking Brake & Active Exhaust Toggle Buttons
    for bx_off, by_off in [(-0.045, cy - 0.085), (-0.095, cy - 0.085)]:
        mat_btn2 = Matrix.Translation(Vector((bx_off, by_off, cz + 0.015)))
        bmesh.ops.create_cube(
            bm_controls,
            size=1.0,
            matrix=mat_btn2 @ Matrix.Diagonal(Vector((0.024, 0.024, 0.008, 1.0)))
        )

    obj_controls = link_obj("GEO_FTYPE_Console_Switchgear_and_Shifter", bm_controls, parent_col, mats["chrome"], bevel=0.0004)
    obj_screens = link_obj("GEO_FTYPE_Console_OLED_Displays_and_Ignis", bm_screens, parent_col, mats["drl_white"], bevel=0.0003)
    objs.extend([obj_controls, obj_screens])
    return objs


# ----------------------------------------------------------------------------
# 44. SUBSYSTEM 42: MERIDIAN AUDIO SURROUND SOUND DOOR SPEAKER GRILLES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_meridian_speaker_grilles(parent_col, mats):
    """
    Constructs the high-end Meridian Surround Sound audio system door speaker enclosures:
    - Precision CNC machined brushed aluminum door speaker grilles with microscopic acoustic hexagonal perforation matrix.
    - Laser-etched "MERIDIAN" sound branding badge plate affixed to the lower speaker bezel.
    - A-pillar high-frequency neodymium dome tweeter grilles integrated into the inner mirror sail triangular trim.
    """
    objs = []
    bm_grilles = bmesh.new()
    bm_tweeters = bmesh.new()

    for dx_sign in [-1.0, 1.0]:
        # Main Mid-Bass Door Speaker (Lower forward door card)
        dx = dx_sign * 0.730
        dy = 0.420
        dz = 0.540

        mat_spk = Matrix.Translation(Vector((dx, dy, dz))) @ Euler((0, dx_sign * 0.22, 0), 'XYZ').to_matrix().to_4x4()
        # Perforated aluminum speaker grille body
        bmesh.ops.create_cylinder(
            bm_grilles,
            radius=0.075,
            depth=0.008,
            segments=28,
            matrix=mat_spk @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )
        # Outer polished bezel trim ring
        bmesh.ops.create_torus(
            bm_grilles,
            major_radius=0.076,
            minor_radius=0.003,
            major_segments=24,
            minor_segments=8,
            matrix=mat_spk @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )
        # Laser-etched "MERIDIAN" branding badge
        mat_badge = mat_spk @ Matrix.Translation(Vector((dx_sign * 0.005, 0.0, -0.062)))
        bmesh.ops.create_cube(
            bm_grilles,
            size=1.0,
            matrix=mat_badge @ Matrix.Diagonal(Vector((0.004, 0.042, 0.010, 1.0)))
        )

        # A-Pillar Neodymium Tweeter (In mirror sail triangle)
        tx = dx_sign * 0.740
        ty = 0.620
        tz = 0.880
        mat_tw = Matrix.Translation(Vector((tx, ty, tz))) @ Euler((0, dx_sign * 0.35, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(
            bm_tweeters,
            radius=0.022,
            depth=0.006,
            segments=18,
            matrix=mat_tw @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )

    obj_grilles = link_obj("GEO_FTYPE_Meridian_Door_Speaker_Grilles", bm_grilles, parent_col, mats["chrome"], bevel=0.0004)
    obj_tweeters = link_obj("GEO_FTYPE_Meridian_A_Pillar_Tweeters", bm_tweeters, parent_col, mats["piano_black"], bevel=0.0003)
    objs.extend([obj_grilles, obj_tweeters])
    return objs


# ----------------------------------------------------------------------------
# 45. SUBSYSTEM 43: ILLUMINATED DOOR SILL TREADPLATES & B-PILLAR STRIKERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_illuminated_door_sills_and_strikers(parent_col, mats):
    """
    Constructs the entry sill jewelry and door latch structural hardware:
    - Polished stainless steel door sill treadplates with electroluminescent ice-blue illuminated "JAGUAR" script.
    - Satin rubber protective scuff perimeter surround gaskets.
    - Precision CNC machined B-pillar door latch striker loops with hardened Torx countersunk mounting bolts.
    - Heavy-duty cast aluminum door hinge check straps with dual detent notches preventing wind over-extension.
    """
    objs = []
    bm_sills = bmesh.new()
    bm_strikers = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        sx = sx_sign * 0.760
        sy = 0.050
        sz = 0.445

        # 1. Door Sill Treadplate (Stainless plate)
        mat_sill = Matrix.Translation(Vector((sx, sy, sz)))
        bmesh.ops.create_cube(
            bm_sills,
            size=1.0,
            matrix=mat_sill @ Matrix.Diagonal(Vector((0.075, 0.620, 0.006, 1.0)))
        )
        # Illuminated "JAGUAR" Script Inlay Channel
        mat_script = mat_sill @ Matrix.Translation(Vector((0, 0, 0.004)))
        bmesh.ops.create_cube(
            bm_sills,
            size=1.0,
            matrix=mat_script @ Matrix.Diagonal(Vector((0.032, 0.260, 0.002, 1.0)))
        )
        # Rubber Perimeter Gasket
        mat_gasket = mat_sill @ Matrix.Translation(Vector((0, 0, -0.002)))
        bmesh.ops.create_cube(
            bm_strikers,
            size=1.0,
            matrix=mat_gasket @ Matrix.Diagonal(Vector((0.082, 0.635, 0.004, 1.0)))
        )

        # 2. B-Pillar Heavy-Duty Door Striker Pin & Bracket
        mat_striker = Matrix.Translation(Vector((sx_sign * 0.720, -0.320, 0.680)))
        # Base backing plate
        bmesh.ops.create_cube(
            bm_strikers,
            size=1.0,
            matrix=mat_striker @ Matrix.Diagonal(Vector((0.012, 0.045, 0.065, 1.0)))
        )
        # Hardened steel U-loop striker pin
        mat_loop = mat_striker @ Matrix.Translation(Vector((-sx_sign * 0.015, 0, 0)))
        bmesh.ops.create_torus(
            bm_strikers,
            major_radius=0.014,
            minor_radius=0.004,
            major_segments=16,
            minor_segments=8,
            matrix=mat_loop @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )
        # Torx T-40 countersunk mounting fasteners (Top & Bottom)
        for fz_off in [-0.022, 0.022]:
            mat_fastener = mat_striker @ Matrix.Translation(Vector((0, 0, fz_off)))
            bmesh.ops.create_cylinder(
                bm_strikers,
                radius=0.005,
                depth=0.006,
                segments=6,
                matrix=mat_fastener @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
            )

        # 3. Door Check Strap (Forward A-Pillar hinge detent link)
        mat_check = Matrix.Translation(Vector((sx_sign * 0.740, 0.560, 0.520)))
        bmesh.ops.create_cube(
            bm_strikers,
            size=1.0,
            matrix=mat_check @ Matrix.Diagonal(Vector((0.028, 0.060, 0.012, 1.0)))
        )

    obj_sills = link_obj("GEO_FTYPE_Illuminated_Door_Sill_Plates", bm_sills, parent_col, mats["chrome"], bevel=0.0004)
    obj_strikers = link_obj("GEO_FTYPE_Door_Strikers_and_Hardware", bm_strikers, parent_col, mats["inconel"], bevel=0.0004)
    objs.extend([obj_sills, obj_strikers])
    return objs
# ----------------------------------------------------------------------------
# 46. MASTER PHASE 20 ASSEMBLY ORCHESTRATION & MULTI-TARGET EXPORT
# ----------------------------------------------------------------------------

def build_jaguar_ftype_v8r_phase2():
    """
    Executes the complete Phase 20 Class-A procedural generation:
    1. Executes Phase 19: Monocoque body sculpture, clamshell bonnet, running gear,
       chassis, suspension, 20-inch wheels, and powertrain.
    2. Builds Phase 20: J-blade LED DRLs, Bi-xenon projector optics, signature round-ring taillights,
       quad 90mm polished stainless exhaust tips, aerodynamic mirrors, flush motorized door handles,
       fender louvered vents with chrome JAGUAR script, front grille red Growler emblem,
       rear 3D chrome Leaper badge, F-TYPE script and R performance badges, 24-LED CHMSL,
       articulated wipers, license plates, wheel center caps, active aero grille shutters,
       CCM brake hardware and wear sensors, underfloor venturi diffuser tunnels, bonnet gas struts,
       tonneau cover 4-bar hinges, cockpit Ignis start button, Meridian speaker grilles, and illuminated sills.
    3. Validates complete vehicle hierarchy.
    4. Exports master unified GLB models across all required target directories.
    """
    print("==============================================================================")
    print("EXECUTING JAGUAR F-TYPE V8 R CONVERTIBLE (2010s) PHASE 20 MASTER GENERATOR")
    print("==============================================================================")

    # 1. Build Phase 19 Base Vehicle
    print("-> Loading and building Phase 19 Base Sculpture & Running Gear...")
    base_objs = generate_jaguar_ftype_v8r_phase1.build_jaguar_ftype_v8r_phase1()

    # 2. Setup Jewelry Materials & Collection
    mats = create_jaguar_ftype_jewelry_materials()

    jewelry_col = bpy.data.collections.get("Jaguar_FType_V8R_Jewelry")
    if not jewelry_col:
        jewelry_col = bpy.data.collections.new("Jaguar_FType_V8R_Jewelry")
        bpy.context.scene.collection.children.link(jewelry_col)

    jewelry_objs = []

    print("-> 1. Assembling Predatory J-Blade LED DRLs & Bi-Xenon Headlights...")
    jewelry_objs.extend(build_jaguar_ftype_jblade_headlights(jewelry_col, mats))

    print("-> 2. Assembling Round Dual-Ring LED Taillights & Red Lightbar...")
    jewelry_objs.extend(build_jaguar_ftype_round_ring_taillights(jewelry_col, mats))

    print("-> 3. Assembling Quad 90mm Rolled Polished Stainless Exhaust Tips...")
    jewelry_objs.extend(build_jaguar_ftype_quad_exhaust_tips(jewelry_col, mats))

    print("-> 4. Assembling Teardrop Wing Mirrors with LED Repeaters & Glass...")
    jewelry_objs.extend(build_jaguar_ftype_aerodynamic_side_mirrors(jewelry_col, mats))

    print("-> 5. Assembling Flush Motorized Pop-Out Door Handles & Touch Sensors...")
    jewelry_objs.extend(build_jaguar_ftype_flush_door_handles(jewelry_col, mats))

    print("-> 6. Assembling Front Fender Air Extractors with Chrome JAGUAR Vane...")
    jewelry_objs.extend(build_jaguar_ftype_fender_side_vents(jewelry_col, mats))

    print("-> 7. Assembling Front Grille Red Cloisonné Jaguar Growler Emblem...")
    jewelry_objs.extend(build_jaguar_ftype_grille_growler_emblem(jewelry_col, mats))

    print("-> 8. Assembling Rear 3D Chrome Jaguar Leaper (Prowling Cat) Emblem...")
    jewelry_objs.extend(build_jaguar_ftype_rear_leaper_emblem(jewelry_col, mats))

    print("-> 9. Assembling Rear F-TYPE Script & Multi-Color Enamel R Badges...")
    jewelry_objs.extend(build_jaguar_ftype_rear_script_and_r_badges(jewelry_col, mats))

    print("-> 10. Assembling High-Mount 24-LED Center Third Brake Lamp (CHMSL)...")
    jewelry_objs.extend(build_jaguar_ftype_center_high_brake_lamp(jewelry_col, mats))

    print("-> 11. Assembling Articulated Wiper Arms with Aerodynamic Airfoils...")
    jewelry_objs.extend(build_jaguar_ftype_aerodynamic_wipers(jewelry_col, mats))

    print("-> 12. Assembling Headlamp High-Pressure Washer Jets & Hood Spray Nozzles...")
    jewelry_objs.extend(build_jaguar_ftype_washer_nozzles(jewelry_col, mats))

    print("-> 13. Assembling Stamped Aluminum License Plates & LED Illuminators...")
    jewelry_objs.extend(build_jaguar_ftype_license_plates(jewelry_col, mats))

    print("-> 14. Assembling Rear Bumper Red Corner Reflex Reflectors...")
    jewelry_objs.extend(build_jaguar_ftype_rear_reflex_reflectors(jewelry_col, mats))

    print("-> 15. Assembling Interior Rearview Mirror & ADAS Forward Camera...")
    jewelry_objs.extend(build_jaguar_ftype_interior_mirror_and_adas(jewelry_col, mats))

    print("-> 16. Assembling 20-Inch Cyclone Wheel Center Caps with Red Growler...")
    jewelry_objs.extend(build_jaguar_ftype_wheel_center_caps(jewelry_col, mats))

    print("-> 17. Assembling Wheel Tire Valve Stems & Chrome Conical Lug Nuts...")
    jewelry_objs.extend(build_jaguar_ftype_wheel_fasteners_and_valves(jewelry_col, mats))

    print("-> 18. Assembling Yellow Caliper JAGUAR Script & Anti-Rattle Springs...")
    jewelry_objs.extend(build_jaguar_ftype_caliper_script_and_hardware(jewelry_col, mats))

    print("-> 19. Assembling Beltline Flocked EPDM Weatherstripping & Seals...")
    jewelry_objs.extend(build_jaguar_ftype_weatherstripping_seals(jewelry_col, mats))

    print("-> 20. Assembling Active Spoiler Shut Line Seams & Wickerbill Lip...")
    jewelry_objs.extend(build_jaguar_ftype_spoiler_seam_and_wickerbill(jewelry_col, mats))

    print("-> 21. Assembling Shark-Mouth Grille Hexagonal Wire Infill & Trim...")
    jewelry_objs.extend(build_jaguar_ftype_grille_mesh_infill(jewelry_col, mats))

    print("-> 22. Assembling Lower Bumper Shark Gill Honeycomb Meshes & Splitter...")
    jewelry_objs.extend(build_jaguar_ftype_shark_gill_meshes(jewelry_col, mats))

    print("-> 23. Assembling Rear Diffuser Strakes & Emergency Tow Eye Hatch...")
    jewelry_objs.extend(build_jaguar_ftype_diffuser_jewelry(jewelry_col, mats))

    print("-> 24. Assembling Clamshell Bonnet Heat Extractor Fine Wire Screens...")
    jewelry_objs.extend(build_jaguar_ftype_bonnet_vent_screens(jewelry_col, mats))

    print("-> 25. Assembling Fuel Filler Flap Door & Push-Push Mechanical Latch...")
    jewelry_objs.extend(build_jaguar_ftype_fuel_filler_door(jewelry_col, mats))

    print("-> 26. Assembling Underbody Dzus Quarter-Turn Quick-Release Fasteners...")
    jewelry_objs.extend(build_jaguar_ftype_underbody_dzus_fasteners(jewelry_col, mats))

    print("-> 27. Assembling Windshield Silk-Screened Ceramic Frit Mask...")
    jewelry_objs.extend(build_jaguar_ftype_windshield_ceramic_frit(jewelry_col, mats))

    print("-> 28. Assembling Engine Bay VIN Plates & Emissions Decals...")
    jewelry_objs.extend(build_jaguar_ftype_engine_bay_placards(jewelry_col, mats))

    print("-> 29. Assembling Billet Machined Aluminum Oil Filler Cap...")
    jewelry_objs.extend(build_jaguar_ftype_oil_filler_cap(jewelry_col, mats))

    print("-> 30. Assembling Rear Decklid Aerodynamic Satellite Antenna Pod...")
    jewelry_objs.extend(build_jaguar_ftype_satellite_antenna(jewelry_col, mats))

    print("-> 31. Assembling Chronograph Instrument Dials & Paddle Shifters...")
    jewelry_objs.extend(build_jaguar_ftype_instrument_cluster_and_paddles(jewelry_col, mats))

    print("-> 32. Assembling Rollover Protection Caps & Anti-Buffeting Baffle...")
    jewelry_objs.extend(build_jaguar_ftype_rollover_caps_and_baffle(jewelry_col, mats))

    print("-> 33. Assembling Under-Mirror Puddle Lamps with Leaper Projection...")
    jewelry_objs.extend(build_jaguar_ftype_mirror_puddle_lamps(jewelry_col, mats))

    print("-> 34. Assembling Exhaust T-Bolt Clamps & Heat Shield Hex Dimples...")
    jewelry_objs.extend(build_jaguar_ftype_exhaust_clamps_and_dimples(jewelry_col, mats))

    print("-> 35. Assembling Active Aero Grille Shutters & Auxiliary Coolers...")
    jewelry_objs.extend(build_jaguar_ftype_active_aero_shutters(jewelry_col, mats))

    print("-> 36. Assembling CCM Brake Guide Pins, Springs & Sensor Loom...")
    jewelry_objs.extend(build_jaguar_ftype_ccm_brake_micro_hardware(jewelry_col, mats))

    print("-> 37. Assembling Underfloor Venturi Tunnels & Heat Shield Enclosures...")
    jewelry_objs.extend(build_jaguar_ftype_underfloor_venturi_and_heatshields(jewelry_col, mats))

    print("-> 38. Assembling Clamshell Bonnet Gas Struts, Latches & Guide Pins...")
    jewelry_objs.extend(build_jaguar_ftype_bonnet_struts_and_latches(jewelry_col, mats))

    print("-> 39. Assembling Tonneau 4-Bar Hinges, Hydraulics & Drain Gutters...")
    jewelry_objs.extend(build_jaguar_ftype_tonneau_hinges_and_drainage(jewelry_col, mats))

    print("-> 40. Assembling Washer Fluid Reservoir, Caps & Firewall Grommets...")
    jewelry_objs.extend(build_jaguar_ftype_washer_reservoir_and_grommets(jewelry_col, mats))

    print("-> 41. Assembling Cockpit Center Console Controls, Shifter & Ignis Button...")
    jewelry_objs.extend(build_jaguar_ftype_console_controls_and_start_button(jewelry_col, mats))

    print("-> 42. Assembling Meridian Surround Sound Door Speaker Grilles...")
    jewelry_objs.extend(build_jaguar_ftype_meridian_speaker_grilles(jewelry_col, mats))

    print("-> 43. Assembling Illuminated Door Sills & B-Pillar Strikers...")
    jewelry_objs.extend(build_jaguar_ftype_illuminated_door_sills_and_strikers(jewelry_col, mats))

    total_objs = len(base_objs) + len(jewelry_objs)
    print(f"[COMPLETE] Built {len(jewelry_objs)} jewelry objects. Total vehicle: {total_objs} discrete CAD objects.")

    # 4. Multi-Target Export
    export_targets = [
        "E:/Car_Automation/public/models/vehicles/convertible/2010s/vehicle.glb",
        "E:/Car_Automation/public/models/Car_Jaguar_FType_V8R_Convertible_2010s.glb",
        "E:/Car_Automation/exports/Car_Jaguar_FType_V8R_Convertible_2010s.glb",
    ]

    for export_path in export_targets:
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        print(f"-> Exporting master GLB to: {export_path}")
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        print(f"   Export complete! File size: {os.path.getsize(export_path) / (1024*1024):.2f} MB")

    print("==============================================================================")
    print("JAGUAR F-TYPE V8 R CONVERTIBLE (2010s) PHASE 20 GENERATION COMPLETE!")
    print("==============================================================================")
    return jewelry_objs


if __name__ == "__main__":
    build_jaguar_ftype_v8r_phase2()
