"""
Jaguar F-Type V8 R Convertible (2010s) Phase 20: Part A
Header, PBR Material Suite for Jewelry, Utilities, and Subsystems 1 to 4:
1. Predatory J-Blade LED DRL & Bi-Xenon Projector Headlights
2. Signature Round Dual-Ring LED Taillights & Full-Width Connecting Red Lightbar
3. Quad 90mm Rolled Polished Stainless Exhaust Tips with Matte Soot Bore
4. Aerodynamic Teardrop Side View Mirrors with LED Turn Repeaters & Optical Glass
"""

PART_FTYPE2_A = '''"""
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
'''
