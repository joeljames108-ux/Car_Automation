"""
Honda S2000 AP1 (2000s) Phase 18: Part A
Header, PBR Material Suite for Jewelry, Utilities, and Subsystems 1 to 4:
1. AP1 Multi-Chamber Projector Headlights & Amber Corner Turn Indicators
2. AP1 Triple-Cluster Circular Taillights & Reflector Housings
3. Polished Stainless Exhaust Tips with Rolled Outer Bead & Matte Soot Bore
4. Aerodynamic Teardrop Side View Mirrors with Optical Glass
"""

PART_S2K2_A = '''"""
=============================================================================
Procedural Class-A CAD Generator: Honda S2000 AP1 (2000s)
PHASE 18: Micro-Detailing, Exterior Jewelry, Lighting Optics & Badging
=============================================================================
Convertible Architecture · 2000s Era Pure Roadster Icon (1999–2003 AP1)
Manufactured at Tochigi / Suzuka, Japan.
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Phase 18 Architectural Scope:
1. Complete PBR Material Suite for Micro-Jewelry:
   - Silverstone Metallic / Berlina Black Two-Stage Clearcoat (#121315, Metallic 0.85, Roughness 0.12, Clearcoat 1.0)
   - Mirror-Polished High-Gloss Automotive Chrome (#F0F4F8, Metallic 0.98, Roughness 0.02)
   - Optical Polycarbonate Headlamp Lens (Transmission 0.95, IOR 1.52, Roughness 0.02)
   - High-Intensity Discharge (HID) Projector Lens Glass (Transmission 0.98, IOR 1.54, Roughness 0.01)
   - Parabolic Vapor-Deposited Reflector Chrome (Metallic 0.99, Roughness 0.02)
   - AP1 Iconic Triple-Cluster Ruby Red Taillamp Lens (#A00408, Transmission 0.76)
   - High-Intensity Amber Turn Indicator Prisms (#E87200, Transmission 0.78)
   - Crystal Clear Reverse Lamp Diffuser (#F2F6FA, Transmission 0.90)
   - Red Cloisonné Honda Racing "H" Emblem Field (#C80815, Roughness 0.15)
   - First-Surface Optical Mirror Glass (#FAFCFF, Metallic 1.0, Roughness 0.01)
   - Polished Inconel / Stainless Exhaust Finishers (#CCD2D8, Metallic 0.94, Roughness 0.10)
   - Matte Carbon Exhaust Inner Soot Baffle (#111112, Roughness 0.96)
   - Satin Black EPDM Weatherstrip Rubber (#151618, Roughness 0.72)
2. Precision CAD Jewelry Subsystems:
   - Multi-Chamber Xenon HID Projector Headlamps & Wrap-Around Amber Indicators
   - Triple-Cluster Circular Rear Taillight Pods & Chromed Reflective Rings
   - Dual 65mm Angle-Cut Polished Round Exhaust Tips with Inner Soot Bore
   - Aerodynamic Teardrop Side View Mirrors with Aspheric Optical Glass
   - Recessed Exterior Door Handles, Finger Pull Cups & Chrome Keylock Barrels
   - Red Enamel Honda "H" Front & Rear Badges with Raised Bevelled Chrome Framing
   - Raised Script "S2000" Front Fender Side Badges
   - High-Mount Third LED Center Brake Light with 16 Ruby Diodes
   - Articulated Dual Windshield Wiper Arms with Aerodynamic Foils & Rubber Blades
   - Front Bumper Corner Amber Side Marker Turn Signal Lamps
   - Soft-Top Rear Glass Window with 12 Horizontal Electric Defroster Lines
   - Front & Rear Stamped License Plates, Embossed Numerals & Chrome Frames
   - Windshield Header Interior Rearview Mirror with Day/Night Flip Tab
   - Beltline & Window Flocked Weatherstripping Rubber Seals
   - Subtle AP1 Front Chin Lip Spoiler Extensions
   - Rear Decklid Subtle Integrated Ducktail Aero Lip
   - Inner Wheel Arch Splash Liners & Retaining Push-Pins
   - Drilled Aluminum Sport Pedals & Dead Pedal Footrest
   - AP1 Cast Wheel Center Caps with Chrome "H" & Valve Stems
   - Engine Bay Identification Placards, Decals & VIN Stampings
   - Master Showroom Integration & Multi-Target GLB Export
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys

_gen_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in locals() or '__file__' in globals() else r"E:\\Car_Automation\\scripts\\blender\\generators"
if _gen_dir not in sys.path:
    sys.path.append(_gen_dir)
hardcoded_dir = r"E:\\Car_Automation\\scripts\\blender\\generators"
if hardcoded_dir not in sys.path:
    sys.path.append(hardcoded_dir)

from mathutils import Vector, Matrix, Euler, Quaternion

# ----------------------------------------------------------------------------
# 1. COMPATIBILITY POLYFILLS & CORE UTILITIES
# ----------------------------------------------------------------------------

def _compat_create_cylinder(bm, radius=1.0, depth=2.0, segments=16, cap_ends=True, cap_tris=False, matrix=None, **kwargs):
    r1 = kwargs.pop('radius1', radius)
    r2 = kwargs.pop('radius2', radius)
    if matrix is None:
        matrix = Matrix.Identity(4)
    try:
        return bmesh.ops.create_cone(bm, cap_ends=cap_ends, cap_tris=cap_tris, segments=segments, radius1=r1, radius2=r2, depth=depth, matrix=matrix, **kwargs)
    except TypeError:
        return bmesh.ops.create_cone(bm, cap_ends=cap_ends, cap_tris=cap_tris, segments=segments, radius1=r1, radius2=r2, depth=depth, matrix=matrix)

bmesh.ops.create_cylinder = _compat_create_cylinder

def _ensure_mat(name):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    return mat

def link_obj(name, bm, col, mat=None, bevel=0.0):
    me = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    col.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    try:
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
    except Exception:
        for p in me.polygons:
            p.use_smooth = True
    if bevel > 0.0:
        mod = obj.modifiers.new("AutoBevel", 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        mod.limit_method = 'ANGLE'
        mod.angle_limit = math.radians(40)
    return obj

# ----------------------------------------------------------------------------
# 2. PBR MATERIAL SUITE FOR JEWELRY & LIGHTING OPTICS
# ----------------------------------------------------------------------------

def get_jewelry_materials_suite():
    mats = {}

    # 1. Berlina Black / Silverstone Metallic Clearcoat Body Paint
    mat_body = _ensure_mat("HONDA_S2K_Berlina_Black_Clearcoat")
    bsdf = mat_body.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.06, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.85
        bsdf.inputs["Roughness"].default_value = 0.12
        if "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = 1.0
            bsdf.inputs["Coat Roughness"].default_value = 0.02
        elif "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = 1.0
            bsdf.inputs["Clearcoat Roughness"].default_value = 0.02
    mats["body"] = mat_body

    # 2. Mirror-Polished High-Gloss Automotive Chrome
    mat_chrome = _ensure_mat("HONDA_High_Gloss_Mirror_Chrome")
    bsdf = mat_chrome.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.94, 0.96, 0.98, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.98
        bsdf.inputs["Roughness"].default_value = 0.02
    mats["chrome"] = mat_chrome

    # 3. Headlamp Polycarbonate Optical Outer Lens
    mat_hlens = _ensure_mat("HONDA_Headlamp_Polycarbonate_Lens")
    bsdf = mat_hlens.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.98, 0.99, 1.0, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.0
        bsdf.inputs["Roughness"].default_value = 0.02
        bsdf.inputs["IOR"].default_value = 1.52
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.96
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.96
    mats["headlight_lens"] = mat_hlens

    # 4. Xenon HID Spherical Glass Projector Lens
    mat_proj = _ensure_mat("HONDA_HID_Spherical_Projector_Glass")
    bsdf = mat_proj.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.92, 0.96, 1.0, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.01
        bsdf.inputs["IOR"].default_value = 1.54
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.98
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.98
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (0.85, 0.92, 1.0, 1.0)
            bsdf.inputs["Emission Strength"].default_value = 2.5
    mats["projector_glass"] = mat_proj

    # 5. Vapor-Deposited Parabolic Chrome Reflector
    mat_refl = _ensure_mat("HONDA_Headlight_Parabolic_Reflector")
    bsdf = mat_refl.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.98, 0.98, 0.99, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.99
        bsdf.inputs["Roughness"].default_value = 0.02
    mats["headlight_reflector"] = mat_refl

    # 6. High-Intensity Prismatic Amber Indicator Lens
    mat_amber = _ensure_mat("HONDA_Amber_Turn_Indicator_Lens")
    bsdf = mat_amber.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.92, 0.45, 0.0, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.04
        bsdf.inputs["IOR"].default_value = 1.54
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.78
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.78
    mats["amber_lens"] = mat_amber

    # 7. AP1 Triple-Cluster Ruby Red Taillamp Lens
    mat_redlens = _ensure_mat("HONDA_AP1_Ruby_Red_Taillamp_Lens")
    bsdf = mat_redlens.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.64, 0.02, 0.03, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.03
        bsdf.inputs["IOR"].default_value = 1.54
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.76
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.76
    mats["taillight_red"] = mat_redlens

    # 8. Crystal Clear Reverse Lamp Diffuser
    mat_rev = _ensure_mat("HONDA_Reverse_Lamp_Clear_Diffuser")
    bsdf = mat_rev.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.96, 0.98, 1.0, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.08
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.90
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.90
    mats["reverse_clear"] = mat_rev

    # 9. First-Surface Optical Mirror Glass
    mat_mir = _ensure_mat("HONDA_Exterior_Mirror_Optical_Glass")
    bsdf = mat_mir.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.98, 0.99, 1.0, 1.0)
        bsdf.inputs["Metallic"].default_value = 1.0
        bsdf.inputs["Roughness"].default_value = 0.01
    mats["mirror_glass"] = mat_mir

    # 10. Polished Stainless Exhaust Tips
    mat_tip = _ensure_mat("HONDA_Polished_Stainless_Exhaust_Tip")
    bsdf = mat_tip.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.80, 0.82, 0.85, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.94
        bsdf.inputs["Roughness"].default_value = 0.10
    mats["exhaust_tip"] = mat_tip

    # 11. Exhaust Inner Matte Soot Baffle
    mat_soot = _ensure_mat("HONDA_Exhaust_Inner_Soot_Baffle")
    bsdf = mat_soot.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.05, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.0
        bsdf.inputs["Roughness"].default_value = 0.96
    mats["exhaust_soot"] = mat_soot

    # 12. Satin Black EPDM Weatherstrip Rubber & Trim
    mat_trim = _ensure_mat("HONDA_Satin_Black_EPDM_Trim")
    bsdf = mat_trim.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.08, 0.08, 0.09, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.0
        bsdf.inputs["Roughness"].default_value = 0.72
    mats["trim"] = mat_trim

    # 13. Red Cloisonné Honda Racing "H" Badge Field
    mat_badge_red = _ensure_mat("HONDA_Red_Cloisonne_Badge_Enamel")
    bsdf = mat_badge_red.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.78, 0.04, 0.08, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.1
        bsdf.inputs["Roughness"].default_value = 0.15
        if "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = 1.0
    mats["badge_red"] = mat_badge_red

    # 14. Cast Aluminum Alloy
    mat_alloy = _ensure_mat("HONDA_Cast_Aluminum_Alloy")
    bsdf = mat_alloy.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.82, 0.84, 0.86, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.92
        bsdf.inputs["Roughness"].default_value = 0.22
    mats["alloy"] = mat_alloy

    # 15. Rear Window Defroster Electric Grid Lines (Orange copper)
    mat_defrost = _ensure_mat("HONDA_Rear_Window_Defroster_Filament")
    bsdf = mat_defrost.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.85, 0.42, 0.12, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.70
        bsdf.inputs["Roughness"].default_value = 0.35
    mats["defroster"] = mat_defrost

    # 16. Optical Transmission Window Glass
    mat_glass = _ensure_mat("HONDA_Clear_Optical_Window_Glass")
    bsdf = mat_glass.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.95, 0.98, 1.0, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.02
        bsdf.inputs["IOR"].default_value = 1.52
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.94
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.94
    mats["glass"] = mat_glass

    return mats

# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 1: AP1 MULTI-CHAMBER PROJECTOR HEADLIGHTS & AMBER CORNERS
# ----------------------------------------------------------------------------

def build_s2000_ap1_projector_headlights(parent_col, mats):
    """
    Constructs the iconic early AP1 long triangular headlight assemblies:
    - Left and right recessed composite housing buckets (X = +/- 0.580m, Y = +1.860m, Z = 0.590m).
    - Large 65mm convex spherical Xenon HID low-beam projector lens encased in satin chrome bezel.
    - Deep parabolic chrome high-beam reflector bowl with miniature halogen H1 bulb tip.
    - Inner horizontal chrome eyebrow trim strake.
    - Distinctive outer wrap-around amber corner turn signal reflector prism with fluted micro-facets.
    - Aerodynamic 3D swept polycarbonate outer clear lens covers conforming to fender contour.
    """
    objs = []
    bm_hl = bmesh.new()
    bm_lens = bmesh.new()
    bm_amber = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        # Headlight Anchor Position
        x_base = hx_sign * 0.560
        y_base = 1.840
        z_base = 0.585

        mat_hl = Matrix.Translation(Vector((x_base, y_base, z_base))) @ Euler((math.radians(16), hx_sign * math.radians(-12), hx_sign * math.radians(-8)), 'XYZ').to_matrix().to_4x4()

        # 1. Main Headlight Dark Composite Bucket / Housing
        bmesh.ops.create_cube(bm_hl, size=1.0, matrix=mat_hl @ Matrix.Diagonal(Vector((0.220, 0.320, 0.040, 1.0))))

        # 2. Xenon HID Low-Beam Projector Lens & Satin Chrome Bezel (Inboard / Forward chamber)
        mat_proj = mat_hl @ Matrix.Translation(Vector((hx_sign * -0.045, 0.080, 0.008)))
        # Projector Outer Chrome Bezel Ring
        bmesh.ops.create_cylinder(bm_hl, radius=0.044, depth=0.024, segments=22, matrix=mat_proj @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Convex Glass Spherical Projector Lens
        bmesh.ops.create_cylinder(bm_hl, radius=0.036, depth=0.016, segments=20, matrix=mat_proj @ Matrix.Translation(Vector((0, 0.015, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Parabolic High-Beam Reflector Bowl (Adjacent to projector)
        mat_refl = mat_hl @ Matrix.Translation(Vector((hx_sign * -0.055, -0.060, 0.005)))
        bmesh.ops.create_cylinder(bm_hl, radius=0.040, depth=0.025, segments=18, matrix=mat_refl @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Halogen H1 Bulb Tip & Filament Shield
        mat_bulb = mat_refl @ Matrix.Translation(Vector((0, 0.012, 0)))
        bmesh.ops.create_cylinder(bm_hl, radius=0.007, depth=0.014, segments=10, matrix=mat_bulb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Wrap-Around Amber Corner Turn Indicator Reflector (Outboard corner, AP1 trademark orange slice)
        mat_amb = mat_hl @ Matrix.Translation(Vector((hx_sign * 0.075, -0.020, -0.002)))
        # Prismatic Fluted Amber Reflector Block
        bmesh.ops.create_cube(bm_amber, size=1.0, matrix=mat_amb @ Matrix.Diagonal(Vector((0.070, 0.150, 0.030, 1.0))))
        # Internal Turn Signal Amber Bulb
        mat_abulb = mat_amb @ Matrix.Translation(Vector((0, 0.015, 0)))
        bmesh.ops.create_cylinder(bm_amber, radius=0.012, depth=0.018, segments=12, matrix=mat_abulb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 5. Polycarbonate Clear Outer Curved Cover Lens (Sweeping aerodynamic teardrop)
        mat_cove = mat_hl @ Matrix.Translation(Vector((0, 0.010, 0.006)))
        bmesh.ops.create_cube(bm_lens, size=1.0, matrix=mat_cove @ Matrix.Diagonal(Vector((0.230, 0.330, 0.032, 1.0))))

    obj_hl = link_obj("GEO_S2K_Headlight_Housings_and_Projectors", bm_hl, parent_col, mats["chrome"], bevel=0.001)
    obj_amb = link_obj("GEO_S2K_Headlight_Amber_Turn_Indicators", bm_amber, parent_col, mats["amber_lens"], bevel=0.0008)
    obj_lens = link_obj("GEO_S2K_Headlight_Polycarbonate_Lenses", bm_lens, parent_col, mats["headlight_lens"], bevel=0.0005)

    objs.extend([obj_hl, obj_amb, obj_lens])
    return objs

# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 2: AP1 TRIPLE-CLUSTER CIRCULAR TAILLIGHTS
# ----------------------------------------------------------------------------

def build_s2000_ap1_triple_cluster_taillights(parent_col, mats):
    """
    Constructs the authentic AP1 (1999-2003) rear taillight assemblies:
    - Left and right recessed taillamp cavities in rear bumper/quarter (X = +/- 0.610m, Y = -2.010m, Z = 0.650m).
    - Triple circular interior optical light elements aligned horizontally:
      * Outer Circle: Large Ruby Red Tail & Brake Lamp Ring with internal radial faceted prism.
      * Center Circle: High-Intensity Amber Turn Signal Indicator roundel.
      * Inner Circle: Crystal Clear / White Reverse Lamp circular diffuser.
    - Dark graphite background bezel with individual chrome accent bezels around each circle.
    - Outer aerodynamic red and clear curved polycarbonate lens casing.
    """
    objs = []
    bm_thousing = bmesh.new()
    bm_tred = bmesh.new()
    bm_tamber = bmesh.new()
    bm_trev = bmesh.new()
    bm_tlens = bmesh.new()

    for tx_sign in [-1.0, 1.0]:
        x_tail = tx_sign * 0.605
        y_tail = -2.005
        z_tail = 0.648

        mat_tl = Matrix.Translation(Vector((x_tail, y_tail, z_tail))) @ Euler((math.radians(-14), tx_sign * math.radians(10), tx_sign * math.radians(4)), 'XYZ').to_matrix().to_4x4()

        # 1. Dark Graphite Background Bucket Housing
        bmesh.ops.create_cube(bm_thousing, size=1.0, matrix=mat_tl @ Matrix.Diagonal(Vector((0.260, 0.085, 0.120, 1.0))))

        # 2. Outer Circle: Ruby Red Brake/Tail Lamp (Outboard, X = +/- 0.075m relative to cluster)
        mat_circle_brake = mat_tl @ Matrix.Translation(Vector((tx_sign * 0.075, -0.018, 0.0)))
        # Chrome Trim Ring
        bmesh.ops.create_cylinder(bm_thousing, radius=0.048, depth=0.016, segments=22, matrix=mat_circle_brake @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Red Internal Lens & Ring
        bmesh.ops.create_cylinder(bm_tred, radius=0.042, depth=0.018, segments=20, matrix=mat_circle_brake @ Matrix.Translation(Vector((0, -0.005, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Center Circle: Amber Turn Signal Roundel (Middle, X = 0.0m relative)
        mat_circle_turn = mat_tl @ Matrix.Translation(Vector((0.0, -0.018, 0.0)))
        # Chrome Trim Ring
        bmesh.ops.create_cylinder(bm_thousing, radius=0.038, depth=0.016, segments=20, matrix=mat_circle_turn @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Amber Prismatic Core
        bmesh.ops.create_cylinder(bm_tamber, radius=0.032, depth=0.018, segments=18, matrix=mat_circle_turn @ Matrix.Translation(Vector((0, -0.005, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Inner Circle: Crystal Clear Reverse Lamp (Inboard, X = -/+ 0.075m relative)
        mat_circle_rev = mat_tl @ Matrix.Translation(Vector((tx_sign * -0.075, -0.018, 0.0)))
        # Chrome Trim Ring
        bmesh.ops.create_cylinder(bm_thousing, radius=0.036, depth=0.016, segments=18, matrix=mat_circle_rev @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # White Diffuser Lens
        bmesh.ops.create_cylinder(bm_trev, radius=0.030, depth=0.018, segments=16, matrix=mat_circle_rev @ Matrix.Translation(Vector((0, -0.005, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 5. Outer Smooth Polycarbonate Protective Lens Cover
        mat_tcover = mat_tl @ Matrix.Translation(Vector((0, -0.026, 0)))
        bmesh.ops.create_cube(bm_tlens, size=1.0, matrix=mat_tcover @ Matrix.Diagonal(Vector((0.270, 0.022, 0.125, 1.0))))

    obj_thousing = link_obj("GEO_S2K_Taillight_Housings_and_Rings", bm_thousing, parent_col, mats["chrome"], bevel=0.0008)
    obj_tred = link_obj("GEO_S2K_Taillight_Red_Brake_Clusters", bm_tred, parent_col, mats["taillight_red"], bevel=0.0006)
    obj_tamber = link_obj("GEO_S2K_Taillight_Amber_Turn_Roundels", bm_tamber, parent_col, mats["amber_lens"], bevel=0.0006)
    obj_trev = link_obj("GEO_S2K_Taillight_Clear_Reverse_Lamps", bm_trev, parent_col, mats["reverse_clear"], bevel=0.0006)
    obj_tlens = link_obj("GEO_S2K_Taillight_Polycarbonate_Lenses", bm_tlens, parent_col, mats["headlight_lens"], bevel=0.0004)

    objs.extend([obj_thousing, obj_tred, obj_tamber, obj_trev, obj_tlens])
    return objs

# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 3: POLISHED STAINLESS EXHAUST TIPS & INNER SOOT BORE
# ----------------------------------------------------------------------------

def build_s2000_ap1_polished_exhaust_tips(parent_col, mats):
    """
    Constructs the signature AP1 dual polished stainless exhaust tips:
    - Left and right 65mm diameter circular exhaust tips centered in lower bumper half-moon cutouts (X = +/- 0.520m, Y = -2.030m, Z = 0.220m).
    - Classic AP1 straight-cut circular profile with polished rolled outer edge bead.
    - Deep matte soot-textured inner exhaust pipe bore preventing see-through geometry.
    - Stainless steel mounting band clamps and retention hardware.
    """
    objs = []
    bm_tips = bmesh.new()
    bm_soot = bmesh.new()

    for ex_sign in [-1.0, 1.0]:
        x_tip = ex_sign * 0.520
        y_tip = -2.020
        z_tip = 0.222

        mat_tip = Matrix.Translation(Vector((x_tip, y_tip, z_tip))) @ Euler((math.radians(-2), 0, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Outer Polished Stainless Steel Tip Shell (Radius = 0.038m, Length = 0.140m)
        bmesh.ops.create_cylinder(bm_tips, radius=0.038, depth=0.140, segments=24, matrix=mat_tip @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Rolled Outer Bead Lip (Rear rim of the exhaust tip, Y = -2.080m)
        mat_bead = mat_tip @ Matrix.Translation(Vector((0, -0.068, 0)))
        bmesh.ops.create_cylinder(bm_tips, radius=0.040, depth=0.012, segments=24, matrix=mat_bead @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Inner Dark Matte Soot-Coated Tailpipe Bore (Inner Diameter = 0.033m)
        mat_sbore = mat_tip @ Matrix.Translation(Vector((0, -0.010, 0)))
        bmesh.ops.create_cylinder(bm_soot, radius=0.033, depth=0.130, segments=20, matrix=mat_sbore @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Stainless Steel Mounting Band Clamp & Bolt (Forward collar of the tip)
        mat_clamp = mat_tip @ Matrix.Translation(Vector((0, 0.055, 0)))
        bmesh.ops.create_cylinder(bm_tips, radius=0.041, depth=0.022, segments=18, matrix=mat_clamp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Clamp Tightening Hex Bolt
        mat_cbolt = mat_clamp @ Matrix.Translation(Vector((0, 0, 0.042)))
        bmesh.ops.create_cylinder(bm_tips, radius=0.005, depth=0.018, segments=8, matrix=mat_cbolt @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_tips = link_obj("GEO_S2K_Polished_Exhaust_Tips", bm_tips, parent_col, mats["exhaust_tip"], bevel=0.0008)
    obj_soot = link_obj("GEO_S2K_Exhaust_Inner_Soot_Baffle", bm_soot, parent_col, mats["exhaust_soot"], bevel=0.0)

    objs.extend([obj_tips, obj_soot])
    return objs

# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 4: AERODYNAMIC TEARDROP SIDE VIEW MIRRORS
# ----------------------------------------------------------------------------

def build_s2000_ap1_side_view_mirrors(parent_col, mats):
    """
    Constructs the aerodynamic door-mounted side view mirror assemblies:
    - Left and right sculpted aerodynamic mirror housings positioned at A-pillar base (X = +/- 0.815m, Y = +0.520m, Z = 0.820m).
    - Triangular cast satin-black mounting base foot affixed to front door corner.
    - Aerodynamic teardrop body-color outer shell reducing wind resistance.
    - True optical first-surface silver mirror glass with micro-beveled rim.
    - EPDM rubber mounting base gasket sealing against door sheetmetal.
    """
    objs = []
    bm_mbase = bmesh.new()
    bm_mbody = bmesh.new()
    bm_mglass = bmesh.new()

    for mx_sign in [-1.0, 1.0]:
        x_m = mx_sign * 0.815
        y_m = 0.520
        z_m = 0.820

        mat_m = Matrix.Translation(Vector((x_m, y_m, z_m))) @ Euler((0, mx_sign * math.radians(-6), mx_sign * math.radians(14)), 'XYZ').to_matrix().to_4x4()

        # 1. Triangular Satin Black Mounting Base Stalk (On door skin)
        mat_bstalk = mat_m @ Matrix.Translation(Vector((mx_sign * -0.040, -0.025, -0.040)))
        bmesh.ops.create_cube(bm_mbase, size=1.0, matrix=mat_bstalk @ Matrix.Diagonal(Vector((0.045, 0.095, 0.075, 1.0))))

        # 2. Aerodynamic Teardrop Mirror Shell (Body Color)
        mat_mshell = mat_m @ Matrix.Translation(Vector((0, 0, 0)))
        bmesh.ops.create_cylinder(bm_mbody, radius=0.078, depth=0.170, segments=22, matrix=mat_mshell @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Aerodynamic Tapered Outer End Cap
        mat_mcap = mat_mshell @ Matrix.Translation(Vector((mx_sign * 0.075, 0.015, 0)))
        bmesh.ops.create_cylinder(bm_mbody, radius=0.065, depth=0.045, segments=18, matrix=mat_mcap @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Optical Reflective Mirror Glass (Rearward facing, Y = -0.065m)
        mat_mface = mat_mshell @ Matrix.Translation(Vector((0, -0.065, 0))) @ Euler((math.radians(8), mx_sign * math.radians(-10), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_mglass, size=1.0, matrix=mat_mface @ Matrix.Diagonal(Vector((0.145, 0.008, 0.088, 1.0))))

    obj_mbase = link_obj("GEO_S2K_SideMirror_Mounting_Stalks", bm_mbase, parent_col, mats["trim"], bevel=0.001)
    obj_mbody = link_obj("GEO_S2K_SideMirror_Aerodynamic_Shells", bm_mbody, parent_col, mats["body"], bevel=0.0015)
    obj_mglass = link_obj("GEO_S2K_SideMirror_Optical_Glass", bm_mglass, parent_col, mats["mirror_glass"], bevel=0.0004)

    objs.extend([obj_mbase, obj_mbody, obj_mglass])
    return objs
'''
