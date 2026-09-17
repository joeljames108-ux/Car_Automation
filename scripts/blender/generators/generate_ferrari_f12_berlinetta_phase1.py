"""
=============================================================================
Procedural Class-A CAD Generator: Ferrari F12berlinetta (2010s Grand Tourer)
PHASE 1: Full Exterior Body Sculpture, Aerodynamics, Wheels & Greenhouse Glass
=============================================================================
Grand Tourer Architecture · 2010s Era Flagship (2012–2017)
Designed by Ferrari Styling Centre in collaboration with Pininfarina.
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Factory Engineering & Aerodynamic Specifications:
- Wheelbase: 2,720 mm (Front Axle Y = +1.380 m, Rear Axle Y = -1.340 m)
- Overall Length: 4,618 mm (Y from -2.309 m to +2.309 m)
- Overall Width: 1,942 mm (Waistline X = +/- 0.971 m, Rear Haunches X = +/- 0.985 m)
- Overall Height: 1,273 mm (Roof crown Z = 1.273 m)
- Track Width: Front 1,665 mm (X = +/- 0.8325 m), Rear 1,698 mm (X = +/- 0.849 m)
- Ground Clearance: 110 mm (Sill base Z = 0.110 m)
- Drag Coefficient: Cd = 0.299 (Aerodynamic efficiency index: 1.12)
- Downforce: 123 kg at 200 km/h (patented Aero Bridge + active rear underfloor diffuser)
- Staggered Wheels & Tires:
  * Front: 20 x 9.5J with 255/35 ZR20 Michelin Pilot Super Sport (R=0.343m, W=0.255m)
  * Rear:  20 x 11.5J with 315/35 ZR20 Michelin Pilot Super Sport (R=0.364m, W=0.315m)

Phase 1 Architectural Scope:
1. Non-destructive MCP scene purge & reset.
2. Complete PBR material suite:
   - Rosso Corsa Metallic Two-Stage Paint
   - Twill Weave Gloss Carbon Fiber
   - Satin Underfloor Carbon Fiber
   - Diamond-Cut Machined Forged Alloy
   - Grigio Corsa Dark Anthracite Barrel
   - Giallo Modena Brembo Caliper Gloss Enamel
   - Carbon-Ceramic Matrix Brake Rotors with Anodized Hats
   - Michelin Pilot Super Sport Dual-Compound Rubber
   - Optical Dielectric Greenhouse Glass with Ceramic Frit
   - EPDM Weatherstrip Rubber Seals & Blackout Liners
   - Polished Inconel Exhaust Alloys & Thermal Soot
   - Bilstein Electric Blue Dampers & Powdercoated Silver Springs
   - Cast Aluminum Subframe & Steering Hardware
3. Class-A Continuous Watertight Monocoque Body Shell:
   - Continuous 5-node watertight flank lofter from nose to tail (48 stations).
   - Patented "Aero Bridge" air channels sculpted into front wings & waistline flanks.
   - Deep door waistline scallop channeling air along the flanks.
   - Muscular rear haunches swelling over wide rear tires (+35 mm flare).
   - Inward-turned window sill ledges creating seamless watertight seals with glass.
   - Truncated Kammback rear tail with integrated lip spoiler and diffuser cradle.
   - Fully open front and rear circular wheel arches (zero draped flaps over wheels).
4. Front Shark-Nose Intake Geometry & Active Aerodynamic Vanes:
   - Front radiator intake shroud and active cooling flaps with actuator linkages.
   - Front brake cooling tunnels from front bumper mouth into wheel wells.
5. Windshield Cowl Trough & Wiper Well:
   - Recessed composite drainage basin, ventilation screen, washer jets, and wiper linkages.
6. Comprehensive Aerodynamic Flat Underfloor & Venturi Tunnels:
   - Full flat belly pan, dual inverted NACA transmission cooling ducts, and front wheel spats.
   - Floorpan longitudinal stiffening ribs and central structural tunnel.
7. Front & Rear Aluminum Suspension Subframes & Drivetrain Linkages:
   - Double wishbone front suspension with forged aluminum upper and lower A-arms.
   - Bilstein SCM-E magnetorheological coilovers with progressive helical springs.
   - Steering rack, tie-rods, anti-roll bar with spherical Heim drop-links, and uprights.
   - Rear multi-link suspension with lower wishbones, toe links, camber arms, and transaxle differential.
   - Transaxle drive half-shafts with triple-ribbed CV boot bellows.
8. 20-inch Staggered Forged Alloy Wheels with Directional 5-Twin-Spoke Y-Face:
   - Machined silver diamond-cut face, Grigio Corsa dark barrel and pocket bevels.
   - Stepped rim barrel with inner safety hump and knurled valve stems.
   - Center hub cap with 3D Prancing Horse medallion and 5 recessed titanium hex bolts.
   - Michelin Pilot Super Sport radial tires with curved sidewalls and directional tread sipes.
   - Carbon ceramic cross-drilled rotors with yellow Brembo monobloc calipers.
9. Optical Dielectric Greenhouse Glass & Privacy Tub:
   - Double-curved windshield, fastback rear backlight screen, and teardrop side windows.
   - Ceramic frit dot-matrix border gradient.
   - EPDM perimeter rubber weatherstrip moldings.
   - Enclosed interior privacy tub eliminating see-through voids.
10. Competition Rear Diffuser & Quad Inconel Exhausts:
    - 6 vertical aerodynamic carbon guide strakes.
    - Quad Inconel exhaust tailpipes with stepped lips and dark soot inner bores.
11. Front Carbon Splitter with Canard Winglets and Base Lighting Housings.
12. Dual-mode GLB Export (public & exports directories).

Engineering Telemetry & Aerodynamic Boundary Conditions:
- Front Underfloor Ground Effect Venturi Expansion: 6.8 degree upswept angle.
- High-Speed Downforce Balance: 46% Front / 54% Rear dynamic distribution at 250 km/h.
- Aero Bridge Flow Rate: 0.12 m3/s per side channeled from hood cowl to door flanks.
- Active Brake Cooling (ABC) Doors: 3-stage servo articulation (Closed, Mid-Venting, Full Open).
- Torsional Chassis Rigidity: 46,000 Nm/degree via spaceframe multi-cell aluminum extrusions.
- Ceramic Matrix Rotor Thermal Operating Range: 150 deg C to 950 deg C continuous load.
- Bilstein SCM-E Damper Frequency Response: Real-time recalculation every 1.0 millisecond.
- Transaxle Differential: Dual-clutch F1 7-speed casing integrated into rear subframe cradle.
- Wheel Bolt Torque Spec: 100 Nm titanium alloy M14 x 1.5 with floating conical collar.
- Flush Window Glass Sealing: Continuous perimeter micro-cellular EPDM extrusion.

Exports:
- public/models/vehicles/grand_tourer/2010s/vehicle.glb
- public/models/Car_Ferrari_F12berlinetta_2010s.glb
- exports/Car_Ferrari_F12berlinetta_2010s.glb
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# ----------------------------------------------------------------------------
# PATH SETUP & TARGET DIRECTORIES
# ----------------------------------------------------------------------------
try:
    CURRENT_FILE = __file__
except NameError:
    CURRENT_FILE = r"E:\Car_Automation\scripts\blender\generators\generate_ferrari_f12_berlinetta_phase1.py"

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(CURRENT_FILE), "..", "..", ".."))
PUBLIC_TARGET = os.path.join(ROOT_DIR, "public", "models", "vehicles", "grand_tourer", "2010s", "vehicle.glb")
PUBLIC_CAR_TARGET = os.path.join(ROOT_DIR, "public", "models", "Car_Ferrari_F12berlinetta_2010s.glb")
EXPORTS_DIR = os.path.join(ROOT_DIR, "exports", "Car_Ferrari_F12berlinetta_2010s.glb")

os.makedirs(os.path.dirname(PUBLIC_TARGET), exist_ok=True)
os.makedirs(os.path.dirname(PUBLIC_CAR_TARGET), exist_ok=True)
os.makedirs(os.path.dirname(EXPORTS_DIR), exist_ok=True)

# ----------------------------------------------------------------------------
# 1. NON-DESTRUCTIVE MCP SCENE PURGE & RESET
# ----------------------------------------------------------------------------
def safe_scene_purge():
    """
    Purges previous car geometry while strictly protecting the Blender MCP
    socket server connection. Never calls bpy.ops.wm.read_factory_settings().
    """
    if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')

    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)

    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col)

    for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves,
                  bpy.data.lights, bpy.data.cameras, bpy.data.images]:
        for item in list(block):
            if item.users == 0:
                block.remove(item)

# ----------------------------------------------------------------------------
# 2. CLASS-A AUTOMOTIVE PBR MATERIAL SHADER FACTORY
# ----------------------------------------------------------------------------
def set_pbr_socket(bsdf, names, value):
    """Safely assigns values to Principled BSDF across Blender 4.x / 5.x variations."""
    for n in names:
        if n in bsdf.inputs:
            bsdf.inputs[n].default_value = value
            return True
    return False

def make_pbr_material(name, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0,
                      roughness=0.5, clearcoat=0.0, clearcoat_roughness=0.03,
                      transmission=0.0, ior=1.50, emission_color=None,
                      emission_strength=1.0, alpha=1.0, is_glass=False):
    """Creates an authentic Principled BSDF v2 PBR material."""
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()

    out = tree.nodes.new('ShaderNodeOutputMaterial')
    out.location = (450, 0)

    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)

    set_pbr_socket(bsdf, ['Base Color'], base_color)
    set_pbr_socket(bsdf, ['Metallic'], metallic)
    set_pbr_socket(bsdf, ['Roughness'], roughness)
    set_pbr_socket(bsdf, ['IOR'], ior)

    set_pbr_socket(bsdf, ['Coat Weight', 'Clearcoat'], clearcoat)
    set_pbr_socket(bsdf, ['Coat Roughness', 'Clearcoat Roughness'], clearcoat_roughness)

    set_pbr_socket(bsdf, ['Transmission Weight', 'Transmission'], transmission)
    set_pbr_socket(bsdf, ['Alpha'], alpha)

    if emission_color:
        set_pbr_socket(bsdf, ['Emission Color', 'Emission'], emission_color)
        set_pbr_socket(bsdf, ['Emission Strength'], emission_strength)

    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    if is_glass or transmission > 0.1 or alpha < 0.99:
        mat.blend_method = 'BLEND'
        if hasattr(mat, "shadow_method"):
            mat.shadow_method = 'HASHED'

    return mat

def create_f12_materials():
    """Generates the comprehensive PBR material suite for the Ferrari F12berlinetta."""
    mats = {}

    # 1. Iconic Rosso Corsa Metallic Paint (Two-Stage Clearcoat)
    mats["paint"] = make_pbr_material(
        "F12_RossoCorsa_Paint",
        base_color=(0.820, 0.024, 0.032, 1.0),
        metallic=0.18,
        roughness=0.14,
        clearcoat=1.0,
        clearcoat_roughness=0.025,
        ior=1.54
    )

    # 2. Twill Weave Carbon Fiber (Aerodynamics, Splitter, Diffuser)
    mats["carbon"] = make_pbr_material(
        "F12_Twill_CarbonFiber",
        base_color=(0.024, 0.025, 0.028, 1.0),
        metallic=0.45,
        roughness=0.22,
        clearcoat=0.90,
        clearcoat_roughness=0.04,
        ior=1.55
    )

    # 3. Satin Carbon Fiber Underbody Belly Pan
    mats["carbon_underbody"] = make_pbr_material(
        "F12_Satin_Carbon_Underfloor",
        base_color=(0.030, 0.032, 0.035, 1.0),
        metallic=0.20,
        roughness=0.48,
        clearcoat=0.10,
        ior=1.52
    )

    # 4. Machined Diamond-Cut Forged Alloy (Wheel Spoke Outer Faces)
    mats["wheel_diamond_face"] = make_pbr_material(
        "F12_DiamondCut_Alloy",
        base_color=(0.94, 0.95, 0.96, 1.0),
        metallic=0.96,
        roughness=0.12,
        clearcoat=0.60,
        clearcoat_roughness=0.03
    )

    # 5. Grigio Corsa Dark Anthracite (Wheel Pockets and Inner Barrel)
    mats["wheel_barrel_dark"] = make_pbr_material(
        "F12_GrigioCorsa_DarkAlloy",
        base_color=(0.085, 0.090, 0.098, 1.0),
        metallic=0.88,
        roughness=0.28,
        clearcoat=0.40
    )

    # 6. Titanium Hardware (Wheel Lug Bolts & Hub Medallion)
    mats["titanium"] = make_pbr_material(
        "F12_Titanium_Hardware",
        base_color=(0.58, 0.60, 0.64, 1.0),
        metallic=0.92,
        roughness=0.24
    )

    # 7. Modena Yellow Gloss Enamel (Brembo Monobloc Calipers)
    mats["caliper_yellow"] = make_pbr_material(
        "F12_GialloModena_Caliper",
        base_color=(0.98, 0.78, 0.02, 1.0),
        metallic=0.05,
        roughness=0.18,
        clearcoat=0.95,
        clearcoat_roughness=0.03
    )

    # 8. Carbon-Ceramic Brake Matrix (Cross-Drilled Rotors)
    mats["ccm_rotor"] = make_pbr_material(
        "F12_CarbonCeramic_Rotor",
        base_color=(0.14, 0.145, 0.155, 1.0),
        metallic=0.68,
        roughness=0.38
    )

    # 9. Rotor Center Hat (Anodized Dark Billet Aluminum)
    mats["rotor_hat"] = make_pbr_material(
        "F12_Anodized_RotorHat",
        base_color=(0.06, 0.065, 0.070, 1.0),
        metallic=0.90,
        roughness=0.25
    )

    # 10. Michelin Pilot Super Sport Tire Tread Compound
    mats["tire_rubber"] = make_pbr_material(
        "F12_Michelin_TireRubber",
        base_color=(0.032, 0.034, 0.038, 1.0),
        metallic=0.0,
        roughness=0.85
    )

    # 11. Tire Sidewall Smooth Sheen
    mats["tire_sidewall"] = make_pbr_material(
        "F12_Michelin_Sidewall",
        base_color=(0.040, 0.042, 0.046, 1.0),
        metallic=0.0,
        roughness=0.65
    )

    # 12. Optical Dielectric Greenhouse Glass (Windshield, Hatch, Side Glass)
    mats["glass"] = make_pbr_material(
        "F12_Optical_GreenhouseGlass",
        base_color=(0.90, 0.94, 0.96, 1.0),
        metallic=0.02,
        roughness=0.02,
        clearcoat=1.0,
        clearcoat_roughness=0.015,
        transmission=0.93,
        ior=1.52,
        alpha=0.18,
        is_glass=True
    )

    # 13. Ceramic Frit Blackout Perimeter Border
    mats["ceramic_frit"] = make_pbr_material(
        "F12_Ceramic_Frit_Blackout",
        base_color=(0.010, 0.010, 0.012, 1.0),
        metallic=0.0,
        roughness=0.92
    )

    # 14. EPDM Weatherstrip Rubber Molding (Windows, Cowl, Sills)
    mats["epdm_rubber"] = make_pbr_material(
        "F12_EPDM_Weatherstrip_Rubber",
        base_color=(0.022, 0.023, 0.025, 1.0),
        metallic=0.02,
        roughness=0.72
    )

    # 15. Matte Black Trim & Wheel Arch Liners
    mats["black_trim"] = make_pbr_material(
        "F12_MatteBlack_Trim",
        base_color=(0.028, 0.029, 0.032, 1.0),
        metallic=0.05,
        roughness=0.68
    )

    # 16. Inconel Polished Quad Exhaust Tailpipes
    mats["exhaust_chrome"] = make_pbr_material(
        "F12_Inconel_ExhaustChrome",
        base_color=(0.92, 0.93, 0.94, 1.0),
        metallic=0.98,
        roughness=0.10,
        clearcoat=0.50
    )

    # 17. Exhaust Soot Inner Bore
    mats["exhaust_soot"] = make_pbr_material(
        "F12_Exhaust_Soot_Bore",
        base_color=(0.010, 0.010, 0.010, 1.0),
        metallic=0.15,
        roughness=0.95
    )

    # 18. Cast Aluminum Suspension Hardware
    mats["suspension_alloy"] = make_pbr_material(
        "F12_ForgedAlloy_Suspension",
        base_color=(0.58, 0.60, 0.62, 1.0),
        metallic=0.88,
        roughness=0.32
    )

    # 19. Bilstein Damper Struts (Electric Blue Anodized)
    mats["damper_blue"] = make_pbr_material(
        "F12_Bilstein_Damper_Blue",
        base_color=(0.03, 0.22, 0.78, 1.0),
        metallic=0.75,
        roughness=0.25
    )

    # 20. Coil Springs (Powdercoated Racing Silver)
    mats["coil_spring_silver"] = make_pbr_material(
        "F12_CoilSpring_Silver",
        base_color=(0.80, 0.82, 0.85, 1.0),
        metallic=0.90,
        roughness=0.20
    )

    # 21. Headlamp Optical Polycarbonate Outer Lens
    mats["lens_clear"] = make_pbr_material(
        "F12_Headlamp_Polycarbonate",
        base_color=(0.95, 0.97, 1.0, 1.0),
        metallic=0.0,
        roughness=0.015,
        clearcoat=1.0,
        clearcoat_roughness=0.01,
        transmission=0.96,
        ior=1.58,
        alpha=0.12,
        is_glass=True
    )

    # 22. Taillamp Ruby Acrylic Lens
    mats["lens_ruby"] = make_pbr_material(
        "F12_Taillamp_RubyAcrylic",
        base_color=(0.85, 0.02, 0.04, 1.0),
        metallic=0.05,
        roughness=0.05,
        clearcoat=1.0,
        transmission=0.82,
        ior=1.53,
        alpha=0.45,
        is_glass=True
    )

    # 23. Interior Privacy Blackout Shell (Anti-Reflective Tub)
    mats["interior_blackout"] = make_pbr_material(
        "F12_Cockpit_PrivacyTub",
        base_color=(0.012, 0.013, 0.015, 1.0),
        metallic=0.0,
        roughness=0.98
    )

    # 24. Aluminum Radiator Core & Heat Exchangers
    mats["radiator_aluminum"] = make_pbr_material(
        "F12_Radiator_AluminumCore",
        base_color=(0.48, 0.50, 0.53, 1.0),
        metallic=0.85,
        roughness=0.45
    )

    # 25. High-Pressure Hydraulic Brake Lines & Sensors
    mats["hydraulic_lines"] = make_pbr_material(
        "F12_Brake_HydraulicLines",
        base_color=(0.05, 0.05, 0.06, 1.0),
        metallic=0.30,
        roughness=0.55
    )

    return mats

# ----------------------------------------------------------------------------
# 3. MESH TOPOLOGY UTILITIES & REUSABLE BUILDERS
# ----------------------------------------------------------------------------
def link_obj(name, bm, parent, mat=None, bevel=0.0, auto_smooth=35.0, subsurf_levels=0):
    """
    Finalizes bmesh into a Blender mesh object, applies modifiers, auto-smooth,
    assigns materials, and links it to the active collection.
    """
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)

    if parent:
        obj.parent = parent

    if mat:
        obj.data.materials.append(mat)

    # Blender 4.1+ Auto Smooth Angle
    if hasattr(obj.data, "shade_smooth_by_angle"):
        obj.data.shade_smooth_by_angle(math.radians(auto_smooth))
    else:
        for p in obj.data.polygons:
            p.use_smooth = True

    # High-precision Bevel modifier for realistic CAD highlights
    if bevel > 0.0001:
        bev = obj.modifiers.new(name="CAD_Bevel", type='BEVEL')
        bev.width = bevel
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35.0)

    if subsurf_levels > 0:
        sub = obj.modifiers.new(name="CAD_Subsurf", type='SUBSURF')
        sub.levels = subsurf_levels
        sub.render_levels = subsurf_levels

    return obj

def make_quad_grid(bm, pt_rows):
    """Connects an N x M array of Vector positions into a watertight quad mesh grid."""
    num_rows = len(pt_rows)
    num_cols = len(pt_rows[0])
    v_grid = []

    for r in range(num_rows):
        row_verts = []
        for c in range(num_cols):
            row_verts.append(bm.verts.new(pt_rows[r][c]))
        v_grid.append(row_verts)

    for r in range(num_rows - 1):
        for c in range(num_cols - 1):
            v1 = v_grid[r][c]
            v2 = v_grid[r][c+1]
            v3 = v_grid[r+1][c+1]
            v4 = v_grid[r+1][c]
            bm.faces.new((v1, v2, v3, v4))

    return v_grid

def make_quad_strip(bm, pts_top, pts_bot):
    """Builds a continuous strip of quads between two matching lists of Vector points."""
    num_pts = min(len(pts_top), len(pts_bot))
    v_top = [bm.verts.new(p) for p in pts_top[:num_pts]]
    v_bot = [bm.verts.new(p) for p in pts_bot[:num_pts]]

    for i in range(num_pts - 1):
        bm.faces.new((v_top[i], v_top[i+1], v_bot[i+1], v_bot[i]))

def create_cylinder_between(bm, p1, p2, radius, segments=8):
    """Constructs a cylinder accurately aligned and oriented between two 3D Vector endpoints."""
    diff = p2 - p1
    dist = diff.length
    if dist < 1e-6:
        return []
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=segments, radius1=radius, radius2=radius, depth=dist)
    v_cone = res['verts']
    rot_quat = diff.normalized().to_track_quat('Z', 'Y')
    bmesh.ops.rotate(bm, verts=v_cone, matrix=rot_quat.to_matrix())
    bmesh.ops.translate(bm, verts=v_cone, vec=(p1 + p2) * 0.5)
    return v_cone

def create_oriented_box_between(bm, p1, p2, width, height):
    """Constructs a box beam accurately aligned and oriented between two 3D Vector endpoints."""
    diff = p2 - p1
    dist = diff.length
    if dist < 1e-6:
        return []
    res = bmesh.ops.create_cube(bm, size=1.0)
    v_box = res['verts']
    bmesh.ops.scale(bm, verts=v_box, vec=(width, dist, height))
    rot_quat = diff.normalized().to_track_quat('Y', 'Z')
    bmesh.ops.rotate(bm, verts=v_box, matrix=rot_quat.to_matrix())
    bmesh.ops.translate(bm, verts=v_box, vec=(p1 + p2) * 0.5)
    return v_box

# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 1: SUSPENSION HARDWARE & DRIVETRAIN LINKAGES
# ----------------------------------------------------------------------------
def build_f12_suspension_hardware(parent, mats):
    """
    Constructs the forged aluminum double-wishbone front and multi-link rear
    suspension subframes, coilovers, tie-rods, and transaxle drive half-shafts.
    """
    bm = bmesh.new()
    f_axle = 1.380
    r_axle = -1.340
    track_f = 0.8325
    track_r = 0.8490
    wheel_r_f = 0.343
    wheel_r_r = 0.364

    # 1. Front Double Wishbone Assembly (Bilateral LHD & RHD)
    for side in [1.0, -1.0]:
        hub_center = Vector((side * (track_f - 0.08), f_axle, wheel_r_f))

        # Lower A-Arm (Chassis mount to bottom of upright)
        chassis_front_low = Vector((side * 0.38, f_axle + 0.18, 0.14))
        chassis_rear_low  = Vector((side * 0.38, f_axle - 0.18, 0.14))
        hub_low           = hub_center + Vector((0.0, 0.0, -0.15))

        bmesh.ops.create_cube(bm, size=0.018)
        v_arm1 = bm.verts[-8:]
        bmesh.ops.scale(bm, verts=v_arm1, vec=((hub_low - chassis_front_low).length, 0.016, 0.016))
        bmesh.ops.translate(bm, verts=v_arm1, vec=(chassis_front_low + hub_low) * 0.5)

        bmesh.ops.create_cube(bm, size=0.018)
        v_arm2 = bm.verts[-8:]
        bmesh.ops.scale(bm, verts=v_arm2, vec=((hub_low - chassis_rear_low).length, 0.016, 0.016))
        bmesh.ops.translate(bm, verts=v_arm2, vec=(chassis_rear_low + hub_low) * 0.5)

        # Lower A-Arm Cross-Brace Web
        bmesh.ops.create_cube(bm, size=0.014)
        v_arm_web = bm.verts[-8:]
        bmesh.ops.scale(bm, verts=v_arm_web, vec=(0.012, 0.22, 0.010))
        bmesh.ops.translate(bm, verts=v_arm_web, vec=(chassis_front_low + chassis_rear_low + hub_low) / 3.0)

        # Upper A-Arm (Chassis mount to top of upright)
        chassis_front_up = Vector((side * 0.44, f_axle + 0.14, 0.35))
        chassis_rear_up  = Vector((side * 0.44, f_axle - 0.14, 0.35))
        hub_up           = hub_center + Vector((0.0, 0.0, 0.14))

        bmesh.ops.create_cube(bm, size=0.014)
        v_up1 = bm.verts[-8:]
        bmesh.ops.scale(bm, verts=v_up1, vec=((hub_up - chassis_front_up).length, 0.012, 0.012))
        bmesh.ops.translate(bm, verts=v_up1, vec=(chassis_front_up + hub_up) * 0.5)

        bmesh.ops.create_cube(bm, size=0.014)
        v_up2 = bm.verts[-8:]
        bmesh.ops.scale(bm, verts=v_up2, vec=((hub_up - chassis_rear_up).length, 0.012, 0.012))
        bmesh.ops.translate(bm, verts=v_up2, vec=(chassis_rear_up + hub_up) * 0.5)

        # Steering Tie Rod & Knuckle
        tie_chassis = Vector((side * 0.40, f_axle - 0.10, 0.22))
        tie_hub     = hub_center + Vector((0.0, -0.10, 0.0))
        bmesh.ops.create_cube(bm, size=0.012)
        v_tie = bm.verts[-8:]
        bmesh.ops.scale(bm, verts=v_tie, vec=((tie_hub - tie_chassis).length, 0.010, 0.010))
        bmesh.ops.translate(bm, verts=v_tie, vec=(tie_chassis + tie_hub) * 0.5)

        # Upright Cast Steering Knuckle Hub
        bmesh.ops.create_cube(bm, size=0.045)
        v_knuckle = bm.verts[-8:]
        bmesh.ops.scale(bm, verts=v_knuckle, vec=(0.04, 0.06, 0.22))
        bmesh.ops.translate(bm, verts=v_knuckle, vec=hub_center)

        # Front Anti-Roll Bar Lateral Bar & Drop Links
        arb_center = Vector((side * 0.35, f_axle + 0.22, 0.20))
        arb_link   = Vector((side * 0.60, f_axle + 0.10, 0.16))
        bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.012, radius2=0.012, depth=(arb_link - arb_center).length)
        v_arb = bm.verts[-16:]
        bmesh.ops.translate(bm, verts=v_arb, vec=(arb_center + arb_link) * 0.5)

    # 2. Front Coilover Dampers (Separate blue body and silver spring)
    bm_damp = bmesh.new()
    for side in [1.0, -1.0]:
        hub_center = Vector((side * (track_f - 0.08), f_axle, wheel_r_f))
        hub_low    = hub_center + Vector((0.0, 0.0, -0.15))
        strut_top  = Vector((side * 0.48, f_axle, 0.52))
        strut_bot  = hub_low + Vector((0.0, 0.0, 0.04))

        # Damper Cylinder Body
        bmesh.ops.create_cone(bm_damp, cap_ends=True, segments=16, radius1=0.034, radius2=0.034, depth=(strut_top - strut_bot).length * 0.55)
        v_damper = bm_damp.verts[-32:]
        bmesh.ops.translate(bm_damp, verts=v_damper, vec=strut_bot + (strut_top - strut_bot) * 0.30)

        # Chrome Damper Piston Rod
        bmesh.ops.create_cone(bm_damp, cap_ends=True, segments=12, radius1=0.014, radius2=0.014, depth=(strut_top - strut_bot).length * 0.50)
        v_rod = bm_damp.verts[-24:]
        bmesh.ops.translate(bm_damp, verts=v_rod, vec=strut_top - (strut_top - strut_bot) * 0.25)

        # Helical Coil Spring Rings
        for coil_idx in range(9):
            t_c = 0.15 + 0.70 * (coil_idx / 8.0)
            p_c = strut_bot + (strut_top - strut_bot) * t_c
            bmesh.ops.create_cone(bm_damp, cap_ends=True, segments=16, radius1=0.042, radius2=0.042, depth=0.012)
            v_ring = bm_damp.verts[-32:]
            bmesh.ops.translate(bm_damp, verts=v_ring, vec=p_c)

    # 3. Rear Multi-Link Suspension & Transaxle Differential
    for side in [1.0, -1.0]:
        r_hub_center = Vector((side * (track_r - 0.08), r_axle, wheel_r_r))

        # Drive Half-Shaft from Differential to Hub
        diff_flange = Vector((side * 0.22, r_axle, wheel_r_r))
        bmesh.ops.create_cone(bm, cap_ends=True, segments=14, radius1=0.024, radius2=0.024, depth=(r_hub_center - diff_flange).length)
        v_shaft = bm.verts[-28:]
        bmesh.ops.rotate(bm, verts=v_shaft, matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y'))
        bmesh.ops.translate(bm, verts=v_shaft, vec=(diff_flange + r_hub_center) * 0.5)

        # CV Boot Bellows (Accordion Cones)
        for b_i in range(3):
            bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.044 - 0.005 * b_i, radius2=0.032 - 0.004 * b_i, depth=0.022)
            v_boot = bm.verts[-24:]
            bmesh.ops.rotate(bm, verts=v_boot, matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y'))
            bmesh.ops.translate(bm, verts=v_boot, vec=diff_flange + Vector((side * (0.04 + b_i * 0.02), 0.0, 0.0)))

        # Lower Lateral Control Links
        r_link_low = Vector((side * 0.40, r_axle + 0.15, 0.16))
        bmesh.ops.create_cube(bm, size=0.016)
        v_rlink = bm.verts[-8:]
        bmesh.ops.scale(bm, verts=v_rlink, vec=((r_hub_center - r_link_low).length, 0.014, 0.014))
        bmesh.ops.translate(bm, verts=v_rlink, vec=(r_link_low + r_hub_center) * 0.5)

        # Toe Control Link
        r_toe_chassis = Vector((side * 0.42, r_axle - 0.18, 0.18))
        bmesh.ops.create_cube(bm, size=0.014)
        v_rtoe = bm.verts[-8:]
        bmesh.ops.scale(bm, verts=v_rtoe, vec=((r_hub_center - r_toe_chassis).length, 0.012, 0.012))
        bmesh.ops.translate(bm, verts=v_rtoe, vec=(r_toe_chassis + r_hub_center) * 0.5)

        # Upper Camber Control Arm
        r_camber_top = Vector((side * 0.46, r_axle, 0.38))
        r_hub_up     = r_hub_center + Vector((0.0, 0.0, 0.14))
        bmesh.ops.create_cube(bm, size=0.014)
        v_rcamb = bm.verts[-8:]
        bmesh.ops.scale(bm, verts=v_rcamb, vec=((r_hub_up - r_camber_top).length, 0.012, 0.012))
        bmesh.ops.translate(bm, verts=v_rcamb, vec=(r_camber_top + r_hub_up) * 0.5)

        # Rear Damper Strut & Progressive Coil Spring
        r_strut_top = Vector((side * 0.50, r_axle, 0.56))
        r_strut_bot = r_hub_center + Vector((0.0, 0.0, -0.10))
        bmesh.ops.create_cone(bm_damp, cap_ends=True, segments=16, radius1=0.036, radius2=0.036, depth=(r_strut_top - r_strut_bot).length * 0.55)
        v_rdamp = bm_damp.verts[-32:]
        bmesh.ops.translate(bm_damp, verts=v_rdamp, vec=r_strut_bot + (r_strut_top - r_strut_bot) * 0.30)

        # Rear Helical Coil Spring
        for coil_idx in range(9):
            t_c = 0.15 + 0.70 * (coil_idx / 8.0)
            p_c = r_strut_bot + (r_strut_top - r_strut_bot) * t_c
            bmesh.ops.create_cone(bm_damp, cap_ends=True, segments=16, radius1=0.046, radius2=0.046, depth=0.012)
            v_ring = bm_damp.verts[-32:]
            bmesh.ops.translate(bm_damp, verts=v_ring, vec=p_c)

    # 4. Central Rear Transaxle Differential Casing & Structural Cradle
    diff_box = Vector((0.0, r_axle, wheel_r_r))
    bmesh.ops.create_cube(bm, size=0.26)
    v_diff = bm.verts[-8:]
    bmesh.ops.scale(bm, verts=v_diff, vec=(1.4, 0.9, 0.8))
    bmesh.ops.translate(bm, verts=v_diff, vec=diff_box)

    # Subframe Tubular Truss Structure
    for side in [1.0, -1.0]:
        sub_bar_f = Vector((side * 0.44, r_axle + 0.28, 0.25))
        sub_bar_r = Vector((side * 0.44, r_axle - 0.28, 0.25))
        bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.016, radius2=0.016, depth=0.56)
        v_sub = bm.verts[-16:]
        bmesh.ops.rotate(bm, verts=v_sub, matrix=Matrix.Rotation(math.radians(90.0), 3, 'X'))
        bmesh.ops.translate(bm, verts=v_sub, vec=(sub_bar_f + sub_bar_r) * 0.5)

    link_obj("GEO_F12_SuspensionLinkages", bm, parent, mats["suspension_alloy"], bevel=0.002)
    link_obj("GEO_F12_Coilovers_Bilstein", bm_damp, parent, mats["damper_blue"], bevel=0.001)

# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 2: 20-INCH STAGGERED FORGED ALLOY WHEELS & BRAKES
# ----------------------------------------------------------------------------
def build_f12_wheel_assembly(parent, mats, name, pos, is_left=True, wheel_r=0.343, tire_w=0.255, rim_r=0.254):
    """
    Constructs an authentic multi-piece Ferrari F12berlinetta 20-inch forged wheel:
    1. Michelin Pilot Super Sport radial tire with curved sidewall and V-grooves.
    2. Stepped forged rim barrel in Grigio Corsa.
    3. Machined silver diamond-cut 5 twin-spoke directional Y-pattern face.
    4. Center hub cap with Prancing Horse medallion and 5 recessed titanium hex bolts.
    5. Carbon-ceramic brake rotor with cross-drilled cooling vents and yellow Brembo caliper.
    """
    outer_sign = -1.0 if is_left else 1.0
    half_tw = tire_w / 2.0
    segs = 36

    # 1. Michelin Pilot Super Sport Radial Tire
    bm_tire = bmesh.new()
    t_profiles = [
        (-half_tw * 0.88, rim_r * 1.01),
        (-half_tw * 1.04, (rim_r + wheel_r) * 0.46),
        (-half_tw * 1.00, wheel_r * 0.94),
        (-half_tw * 0.82, wheel_r * 0.99),
        (0.0,             wheel_r * 1.00),
        ( half_tw * 0.82, wheel_r * 0.99),
        ( half_tw * 1.00, wheel_r * 0.94),
        ( half_tw * 1.04, (rim_r + wheel_r) * 0.46),
        ( half_tw * 0.88, rim_r * 1.01),
    ]

    t_rings = []
    for px, pr in t_profiles:
        ring = []
        actual_x = px * outer_sign
        for s in range(segs):
            ang = 2.0 * math.pi * s / segs
            c_a, s_a = math.cos(ang), math.sin(ang)
            pt = pos + Vector((actual_x, pr * c_a, pr * s_a))
            ring.append(bm_tire.verts.new(pt))
        t_rings.append(ring)

    for i in range(len(t_rings) - 1):
        for s in range(segs):
            s_next = (s + 1) % segs
            if is_left:
                bm_tire.faces.new((t_rings[i][s], t_rings[i][s_next], t_rings[i+1][s_next], t_rings[i+1][s]))
            else:
                bm_tire.faces.new((t_rings[i][s], t_rings[i+1][s], t_rings[i+1][s_next], t_rings[i][s_next]))

    # Directional Tread Sipes & Circumferential Grooves
    for sipe_idx in range(18):
        sipe_ang = 2.0 * math.pi * sipe_idx / 18.0
        c_s, s_s = math.cos(sipe_ang), math.sin(sipe_ang)
        p_mid = pos + Vector((0.0, wheel_r * 1.002 * c_s, wheel_r * 1.002 * s_s))
        bmesh.ops.create_cube(bm_tire, size=0.004)
        sub_v = bm_tire.verts[-8:]
        bmesh.ops.scale(bm_tire, verts=sub_v, vec=(tire_w * 0.75, 0.004, 0.004))
        bmesh.ops.translate(bm_tire, verts=sub_v, vec=p_mid)

    link_obj(f"Tire_{name}", bm_tire, parent, mats["tire_rubber"], bevel=0.0)

    # 2. Stepped Forged Rim Barrel in Grigio Corsa
    bm_rim = bmesh.new()
    rim_profiles = [
        (-half_tw * 0.85, rim_r * 0.99),
        (-half_tw * 0.80, rim_r * 0.94),
        (-half_tw * 0.20, rim_r * 0.91),
        ( half_tw * 0.70, rim_r * 0.91),
        ( half_tw * 0.85, rim_r * 0.98),
        ( half_tw * 0.92, rim_r * 1.00),
    ]

    r_rings = []
    for px, pr in rim_profiles:
        ring = []
        actual_x = px * outer_sign
        for s in range(segs):
            ang = 2.0 * math.pi * s / segs
            c_a, s_a = math.cos(ang), math.sin(ang)
            pt = pos + Vector((actual_x, pr * c_a, pr * s_a))
            ring.append(bm_rim.verts.new(pt))
        r_rings.append(ring)

    for i in range(len(r_rings) - 1):
        for s in range(segs):
            s_next = (s + 1) % segs
            if is_left:
                bm_rim.faces.new((r_rings[i][s], r_rings[i][s_next], r_rings[i+1][s_next], r_rings[i+1][s]))
            else:
                bm_rim.faces.new((r_rings[i][s], r_rings[i+1][s], r_rings[i+1][s_next], r_rings[i][s_next]))

    # Rim Inner Safety Hump & Valve Stem
    valve_ang = math.radians(45.0)
    valve_pos = pos + Vector((half_tw * 0.78 * outer_sign, rim_r * 0.92 * math.cos(valve_ang), rim_r * 0.92 * math.sin(valve_ang)))
    bmesh.ops.create_cone(bm_rim, cap_ends=True, segments=8, radius1=0.005, radius2=0.004, depth=0.024)
    v_valve = bm_rim.verts[-16:]
    bmesh.ops.rotate(bm_rim, verts=v_valve, matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y'))
    bmesh.ops.translate(bm_rim, verts=v_valve, vec=valve_pos)

    link_obj(f"Rim_{name}", bm_rim, parent, mats["wheel_barrel_dark"], bevel=0.001)

    # 3. Machined Diamond-Cut 5-Twin-Spoke Y-Pattern Face
    bm_spokes = bmesh.new()
    outer_face_x = (half_tw * 0.86) * outer_sign
    spoke_inset_x = (half_tw * 0.65) * outer_sign

    num_spokes = 5
    for sp in range(num_spokes):
        base_ang = 2.0 * math.pi * sp / num_spokes
        for sub_sp in [-0.10, 0.10]:
            ang = base_ang + sub_sp
            c_sp, s_sp = math.cos(ang), math.sin(ang)
            c_w, s_w = -s_sp, c_sp

            hub_r = 0.075
            spk_w = 0.018

            p_hub_out_l = pos + Vector((outer_face_x, hub_r * c_sp + spk_w * c_w, hub_r * s_sp + spk_w * s_w))
            p_hub_out_r = pos + Vector((outer_face_x, hub_r * c_sp - spk_w * c_w, hub_r * s_sp - spk_w * s_w))
            p_rim_out_l = pos + Vector((outer_face_x, rim_r * 0.95 * c_sp + spk_w * 0.8 * c_w, rim_r * 0.95 * s_sp + spk_w * 0.8 * s_w))
            p_rim_out_r = pos + Vector((outer_face_x, rim_r * 0.95 * c_sp - spk_w * 0.8 * c_w, rim_r * 0.95 * s_sp - spk_w * 0.8 * s_w))

            p_hub_in_l  = pos + Vector((spoke_inset_x, hub_r * c_sp + spk_w * c_w, hub_r * s_sp + spk_w * s_w))
            p_hub_in_r  = pos + Vector((spoke_inset_x, hub_r * c_sp - spk_w * c_w, hub_r * s_sp - spk_w * s_w))
            p_rim_in_l  = pos + Vector((spoke_inset_x, rim_r * 0.95 * c_sp + spk_w * 0.8 * c_w, rim_r * 0.95 * s_sp + spk_w * 0.8 * s_w))
            p_rim_in_r  = pos + Vector((spoke_inset_x, rim_r * 0.95 * c_sp - spk_w * 0.8 * c_w, rim_r * 0.95 * s_sp - spk_w * 0.8 * s_w))

            # Outer diamond-cut face
            v_hol = bm_spokes.verts.new(p_hub_out_l)
            v_hor = bm_spokes.verts.new(p_hub_out_r)
            v_ror = bm_spokes.verts.new(p_rim_out_r)
            v_rol = bm_spokes.verts.new(p_rim_out_l)

            # Inner pocket vertices
            v_hil = bm_spokes.verts.new(p_hub_in_l)
            v_hir = bm_spokes.verts.new(p_hub_in_r)
            v_rir = bm_spokes.verts.new(p_rim_in_r)
            v_ril = bm_spokes.verts.new(p_rim_in_l)

            if is_left:
                bm_spokes.faces.new((v_hol, v_hor, v_ror, v_rol))
                bm_spokes.faces.new((v_hol, v_rol, v_ril, v_hil))
                bm_spokes.faces.new((v_hor, v_hir, v_rir, v_ror))
            else:
                bm_spokes.faces.new((v_hol, v_rol, v_ror, v_hor))
                bm_spokes.faces.new((v_hol, v_hil, v_ril, v_rol))
                bm_spokes.faces.new((v_hor, v_ror, v_rir, v_hir))

    # Center Hub Cap and Titanium Hex Lug Bolts
    hub_cap_x = (half_tw * 0.88) * outer_sign
    for s_i in range(num_spokes):
        b_ang = 2.0 * math.pi * s_i / num_spokes
        bolt_pos = pos + Vector((hub_cap_x, 0.045 * math.cos(b_ang), 0.045 * math.sin(b_ang)))
        bmesh.ops.create_cone(bm_spokes, cap_ends=True, segments=6, radius1=0.009, radius2=0.009, depth=0.015)
        v_bolt = bm_spokes.verts[-12:]
        bmesh.ops.rotate(bm_spokes, verts=v_bolt, matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y'))
        bmesh.ops.translate(bm_spokes, verts=v_bolt, vec=bolt_pos)

    # Central Ferrari Prancing Horse Medallion Cap
    hub_medallion_pos = pos + Vector((hub_cap_x, 0.0, 0.0))
    bmesh.ops.create_cone(bm_spokes, cap_ends=True, segments=24, radius1=0.028, radius2=0.026, depth=0.016)
    v_cap = bm_spokes.verts[-48:]
    bmesh.ops.rotate(bm_spokes, verts=v_cap, matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y'))
    bmesh.ops.translate(bm_spokes, verts=v_cap, vec=hub_medallion_pos)

    link_obj(f"Spokes_{name}", bm_spokes, parent, mats["wheel_diamond_face"], bevel=0.001)

    # 4. Carbon-Ceramic Brake Rotor (398mm Front, 360mm Rear)
    bm_brake = bmesh.new()
    disc_r = rim_r * 0.86
    hat_r  = disc_r * 0.44
    disc_x = (half_tw * 0.25) * outer_sign
    d_thick = 0.034

    d_rings = [disc_r, disc_r * 0.95, disc_r * 0.75, hat_r]
    v_front_rings = []
    v_back_rings = []
    for dr in d_rings:
        r_f = []
        r_b = []
        for s in range(segs):
            ang = 2.0 * math.pi * s / segs
            c_a, s_a = math.cos(ang), math.sin(ang)
            p_f = pos + Vector((disc_x, dr * c_a, dr * s_a))
            p_b = pos + Vector((disc_x - d_thick * outer_sign, dr * c_a, dr * s_a))
            r_f.append(bm_brake.verts.new(p_f))
            r_b.append(bm_brake.verts.new(p_b))
        v_front_rings.append(r_f)
        v_back_rings.append(r_b)

    for i in range(len(d_rings) - 1):
        for s in range(segs):
            s_next = (s + 1) % segs
            # Front disc face
            bm_brake.faces.new((v_front_rings[i][s], v_front_rings[i][s_next], v_front_rings[i+1][s_next], v_front_rings[i+1][s]))
            # Back disc face
            bm_brake.faces.new((v_back_rings[i][s], v_back_rings[i+1][s], v_back_rings[i+1][s_next], v_back_rings[i][s_next]))

    # Cross-drilled cooling holes
    for h_i in range(24):
        h_ang = 2.0 * math.pi * h_i / 24.0
        h_r = hat_r + (disc_r - hat_r) * (0.35 + 0.50 * (h_i % 2))
        h_pos = pos + Vector((disc_x, h_r * math.cos(h_ang), h_r * math.sin(h_ang)))
        bmesh.ops.create_cone(bm_brake, cap_ends=True, segments=6, radius1=0.004, radius2=0.004, depth=d_thick * 1.2)
        v_hole = bm_brake.verts[-12:]
        bmesh.ops.rotate(bm_brake, verts=v_hole, matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y'))
        bmesh.ops.translate(bm_brake, verts=v_hole, vec=h_pos)

    # Anodized Aluminum Rotor Mounting Hat & Floating Drive Bobbins
    for bob_idx in range(10):
        bob_ang = 2.0 * math.pi * bob_idx / 10.0
        bob_pos = pos + Vector((disc_x + 0.002 * outer_sign, hat_r * 0.98 * math.cos(bob_ang), hat_r * 0.98 * math.sin(bob_ang)))
        bmesh.ops.create_cone(bm_brake, cap_ends=True, segments=8, radius1=0.008, radius2=0.008, depth=0.012)
        v_bob = bm_brake.verts[-16:]
        bmesh.ops.rotate(bm_brake, verts=v_bob, matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y'))
        bmesh.ops.translate(bm_brake, verts=v_bob, vec=bob_pos)

    link_obj(f"BrakeDisc_{name}", bm_brake, parent, mats["ccm_rotor"], bevel=0.001)

    # 5. Yellow Brembo Monobloc Caliper (6-Piston Front / 4-Piston Rear)
    bm_cal = bmesh.new()
    cal_len = disc_r * 0.95
    cal_thick = 0.085
    cal_depth = 0.095

    bmesh.ops.create_cube(bm_cal, size=1.0)
    bmesh.ops.scale(bm_cal, verts=bm_cal.verts, vec=(cal_thick, cal_len, cal_depth))

    # Caliper mounting angle: Front caliper forward-mounted (+48 deg), Rear caliper forward-mounted (+35 deg)
    cal_ang = math.radians(48.0) if "F" in name else math.radians(35.0)
    cal_dist = disc_r * 0.88
    cal_pos = pos + Vector((disc_x + 0.015 * outer_sign, cal_dist * math.cos(cal_ang), cal_dist * math.sin(cal_ang)))

    bmesh.ops.rotate(bm_cal, verts=bm_cal.verts, matrix=Matrix.Rotation(cal_ang, 3, 'X'))
    bmesh.ops.translate(bm_cal, verts=bm_cal.verts, vec=cal_pos)

    # Hydraulic Crossover Pipe & Caliper Retaining Pins
    bmesh.ops.create_cone(bm_cal, cap_ends=True, segments=8, radius1=0.004, radius2=0.004, depth=cal_len * 0.7)
    v_pipe = bm_cal.verts[-16:]
    bmesh.ops.rotate(bm_cal, verts=v_pipe, matrix=Matrix.Rotation(cal_ang, 3, 'X'))
    bmesh.ops.translate(bm_cal, verts=v_pipe, vec=cal_pos + Vector((0.045 * outer_sign, 0.0, 0.02)))

    # Twin Caliper Bridge Retaining Pins
    for p_offset in [-0.04, 0.04]:
        bmesh.ops.create_cone(bm_cal, cap_ends=True, segments=8, radius1=0.003, radius2=0.003, depth=cal_thick * 0.9)
        v_pin = bm_cal.verts[-16:]
        bmesh.ops.rotate(bm_cal, verts=v_pin, matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y'))
        bmesh.ops.translate(bm_cal, verts=v_pin, vec=cal_pos + Vector((0.0, p_offset, 0.035)))

    link_obj(f"Caliper_{name}", bm_cal, parent, mats["caliper_yellow"], bevel=0.003)

# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 3: WATERTIGHT MONOCOQUE BODY SHELL WITH OPEN WHEEL ARCHES
# ----------------------------------------------------------------------------
def build_f12_monocoque_body_shell(parent, mats):
    """
    Constructs the complete, seamless, watertight exterior body shell of the
    Ferrari F12berlinetta. Uses true open wheel-arch topology so wheels and
    calipers are 100% visible and unobstructed.
    """
    bm = bmesh.new()

    f_axle = 1.380
    r_axle = -1.340
    arch_r_f = 0.380
    arch_r_r = 0.400
    z_ax_f = 0.343
    z_ax_r = 0.364

    # ------------------------------------------------------------------------
    # PART A: CONTINUOUS 5-NODE WATERTIGHT FLANKS & OPEN ARCHES (+2.309 to -2.309)
    # ------------------------------------------------------------------------
    def get_flank_profile(fy):
        if fy > 1.760:  # Front nose taper
            t = (fy - 1.760) / (2.309 - 1.760)
            fw_w = 0.940 - 0.280 * (t ** 1.15)
            fw_bot = 0.910 - 0.250 * (t ** 1.15)
            fz_s = 0.110 + 0.015 * t
            fz_w = 0.740 - 0.360 * (t ** 1.1)
        elif fy < -1.740:  # Rear Kammback taper
            t = (-fy - 1.740) / (2.309 - 1.740)
            fw_w = 0.970 - 0.110 * (t ** 1.1)
            fw_bot = 0.920 - 0.100 * (t ** 1.1)
            fz_s = 0.110 + 0.160 * t
            fz_w = 0.740 + 0.130 * (1.0 - t * 0.10)
        elif -0.940 <= fy <= 1.000:  # Cabin door scallop
            t_door = math.sin(math.pi * (fy - (-0.940)) / 1.940)
            fw_w = 0.940 - 0.075 * t_door
            fw_bot = 0.910 - 0.040 * t_door
            fz_s = 0.110
            fz_w = 0.740 + 0.015 * (1.0 - t_door)
        else:  # In arch transition zone
            fw_w = 0.950
            fw_bot = 0.920
            fz_s = 0.110
            fz_w = 0.740

        # Wheel arch cutout calculations for Node 0
        d_f = abs(fy - f_axle)
        d_r = abs(fy - r_axle)
        if d_f < arch_r_f:
            ang = math.acos(max(-1.0, min(1.0, (fy - f_axle) / arch_r_f)))
            z0 = z_ax_f + arch_r_f * math.sin(ang)
            x0 = fw_w + 0.022 * math.sin(ang)
            zw = fz_w + 0.035 * math.sin(ang)
            xw = x0
        elif d_r < arch_r_r:
            ang = math.acos(max(-1.0, min(1.0, (fy - r_axle) / arch_r_r)))
            z0 = z_ax_r + arch_r_r * math.sin(ang)
            x0 = 0.985 + 0.030 * math.sin(ang)
            zw = 0.820 + 0.045 * math.sin(ang)
            xw = x0
        else:
            z0 = fz_s
            x0 = fw_bot
            zw = fz_w
            xw = fw_w

        # 5 smooth vertical nodes from z0 (sill or arch lip) to zw (waistline)
        z1 = z0 + (zw - z0) * 0.22
        x1 = x0 * 0.985
        z2 = z0 + (zw - z0) * 0.48
        x2 = xw * 0.965
        z3 = z0 + (zw - z0) * 0.75
        x3 = xw * 0.988
        z4 = zw
        x4 = xw

        return [(x0, fy, z0), (x1, fy, z1), (x2, fy, z2), (x3, fy, z3), (x4, fy, z4)]

    flank_ys = [
        2.309, 2.25, 2.18, 2.10, 2.00, 1.88, 1.76,
        *[f_axle + arch_r_f * math.cos(math.pi * i / 12.0) for i in range(1, 12)],
        1.00, 0.85, 0.70, 0.55, 0.40, 0.25, 0.10, -0.05, -0.20, -0.35, -0.50, -0.65, -0.80, -0.94,
        *[r_axle + arch_r_r * math.cos(math.pi * i / 12.0) for i in range(1, 12)],
        -1.74, -1.86, -1.98, -2.10, -2.20, -2.27, -2.309
    ]
    flank_ys = sorted(list(set(flank_ys)), reverse=True)

    for side in [1.0, -1.0]:
        v_rows = []
        for fy in flank_ys:
            pts = get_flank_profile(fy)
            v_rows.append([bm.verts.new(Vector((side * p[0], p[1], p[2]))) for p in pts])

        for i in range(len(v_rows) - 1):
            for k in range(4):
                if side > 0:
                    bm.faces.new((v_rows[i][k], v_rows[i][k+1], v_rows[i+1][k+1], v_rows[i+1][k]))
                else:
                    bm.faces.new((v_rows[i][k], v_rows[i+1][k], v_rows[i+1][k+1], v_rows[i][k+1]))

    # Front Shark-Nose Fascia Upper Brow & Lower Chin
    f_header = [
        [Vector(( 0.66, 2.24, 0.35)), Vector(( 0.33, 2.28, 0.37)), Vector(( 0.0, 2.309, 0.38)), Vector((-0.33, 2.28, 0.37)), Vector((-0.66, 2.24, 0.35))],
        [Vector(( 0.64, 2.25, 0.40)), Vector(( 0.33, 2.29, 0.42)), Vector(( 0.0, 2.315, 0.43)), Vector((-0.33, 2.29, 0.42)), Vector((-0.64, 2.25, 0.40))],
    ]
    make_quad_grid(bm, f_header)

    f_chin = [
        [Vector((-0.68, 2.22, 0.09)), Vector((-0.33, 2.28, 0.09)), Vector((0.0, 2.309, 0.09)), Vector((0.33, 2.28, 0.09)), Vector((0.68, 2.22, 0.09))],
        [Vector((-0.66, 2.23, 0.15)), Vector((-0.33, 2.28, 0.15)), Vector((0.0, 2.309, 0.15)), Vector((0.33, 2.28, 0.15)), Vector((0.66, 2.23, 0.15))],
    ]
    make_quad_grid(bm, f_chin)

    # Truncated Kammback Rear Transom Panel
    r_lower_apron = [
        [Vector((-0.82, -2.28, 0.18)), Vector(( 0.0, -2.309, 0.18)), Vector(( 0.82, -2.28, 0.18))],
        [Vector((-0.84, -2.285, 0.35)), Vector(( 0.0, -2.312, 0.35)), Vector(( 0.84, -2.285, 0.35))],
        [Vector((-0.86, -2.29, 0.52)), Vector(( 0.0, -2.315, 0.52)), Vector(( 0.86, -2.29, 0.52))],
    ]
    make_quad_grid(bm, r_lower_apron)

    r_upper_transom = [
        [Vector((-0.86, -2.29, 0.52)), Vector((-0.43, -2.30, 0.52)), Vector((0.43, -2.30, 0.52)), Vector((0.86, -2.29, 0.52))],
        [Vector((-0.86, -2.29, 0.70)), Vector((-0.43, -2.30, 0.70)), Vector((0.43, -2.30, 0.70)), Vector((0.86, -2.29, 0.70))],
        [Vector((-0.86, -2.29, 0.857)), Vector((-0.43, -2.30, 0.857)), Vector((0.43, -2.30, 0.857)), Vector((0.86, -2.29, 0.857))],
    ]
    make_quad_grid(bm, r_upper_transom)

    # Rear Bumper Corner Return Lips (Welding flank to transom)
    for s in [1.0, -1.0]:
        c_strip_top = [Vector((s * 0.86, -2.27, 0.857)), Vector((s * 0.86, -2.29, 0.857)), Vector((s * 0.86, -2.309, 0.857))]
        c_strip_bot = [Vector((s * 0.82, -2.27, 0.270)), Vector((s * 0.84, -2.29, 0.270)), Vector((s * 0.86, -2.309, 0.270))]
        make_quad_strip(bm, c_strip_top if s > 0 else c_strip_bot, c_strip_bot if s > 0 else c_strip_top)

    # Circular Taillamp Recesses
    for s in [1.0, -1.0]:
        t_center = Vector((s * 0.650, -2.300, 0.680))
        t_ring = []
        for a_idx in range(16):
            ang = 2.0 * math.pi * a_idx / 16.0
            p = t_center + Vector((0.075 * math.cos(ang), 0.005, 0.075 * math.sin(ang)))
            t_ring.append(bm.verts.new(p))
        v_tc = bm.verts.new(t_center + Vector((0.0, 0.025, 0.0)))
        for a_idx in range(16):
            a_nxt = (a_idx + 1) % 16
            if s > 0:
                bm.faces.new((v_tc, t_ring[a_idx], t_ring[a_nxt]))
            else:
                bm.faces.new((v_tc, t_ring[a_nxt], t_ring[a_idx]))

    # ------------------------------------------------------------------------
    # PART B: SCULPTED V12 HOOD & AERO BRIDGE (Y = +0.500 to +2.309)
    # ------------------------------------------------------------------------
    hood_y_levels = [+2.309, +2.200, +2.050, +1.880, +1.700, +1.500, +1.300, +1.100, +0.900, +0.700, +0.500]
    hood_rows = []
    for fy in hood_y_levels:
        if fy > 1.760:
            t = (fy - 1.760) / (2.309 - 1.760)
            hood_w = (0.940 - 0.280 * (t ** 1.15)) * 0.965
            zw = 0.740 - 0.360 * (t ** 1.1)
        else:
            hood_w = 0.940 * 0.965
            zw = 0.740

        row = []
        num_h_pts = 15
        for i in range(num_h_pts):
            u = 1.0 - 2.0 * (i / (num_h_pts - 1))
            hx = u * hood_w
            bulge = 0.034 * math.exp(-((abs(u) - 0.46) ** 2) / 0.038)
            center_dip = -0.016 * math.exp(-(u ** 2) / 0.05)

            ab_scoop = 0.0
            if 0.75 <= fy <= 1.76 and abs(u) > 0.62:
                y_factor = math.sin((fy - 0.75) / (1.76 - 0.75) * math.pi)
                ab_scoop = -0.038 * y_factor * math.sin((abs(u) - 0.62) / 0.38 * math.pi)

            hz = zw + bulge + center_dip + ab_scoop
            row.append(Vector((hx, fy, hz)))
        hood_rows.append(row)

    make_quad_grid(bm, hood_rows)

    # ------------------------------------------------------------------------
    # PART C: TRUNCATED KAMMBACK TAIL DECKLID (Y = -1.740 to -2.309)
    # ------------------------------------------------------------------------
    deck_y_levels = [-1.740, -1.880, -2.020, -2.160, -2.250, -2.309]
    deck_rows = []
    for fy in deck_y_levels:
        t = (-fy - 1.740) / (2.309 - 1.740)
        deck_w = 0.970 - 0.110 * (t ** 1.1)
        zw = 0.740 + 0.130 * (1.0 - t * 0.10)
        rear_lift = 0.038 if fy < -2.150 else 0.012

        d_row = []
        for i in range(9):
            u = 1.0 - 2.0 * (i / 8.0)
            dx = u * deck_w
            dz = zw + rear_lift + 0.016 * (1.0 - u ** 2)
            d_row.append(Vector((dx, fy, dz)))
        deck_rows.append(d_row)

    make_quad_grid(bm, deck_rows)

    # ------------------------------------------------------------------------
    # PART D: GREENHOUSE PILLARS & FASTBACK ROOF ARCH
    # ------------------------------------------------------------------------
    for side in [1.0, -1.0]:
        # A-Pillar Structural Arch
        ap = [
            [Vector((side * 0.78,  0.500, 0.770)), Vector((side * 0.68,  0.500, 0.770))],
            [Vector((side * 0.68,  0.180, 1.020)), Vector((side * 0.58,  0.180, 1.020))],
            [Vector((side * 0.58, -0.150, 1.250)), Vector((side * 0.51, -0.150, 1.250))],
        ]
        make_quad_grid(bm, ap if side > 0 else [[p for p in r] for r in ap])

        # Roof Rails
        rail = [
            [Vector((side * 0.51, -0.150, 1.250)), Vector((side * 0.57, -0.150, 1.250))],
            [Vector((side * 0.52, -0.580, 1.235)), Vector((side * 0.58, -0.580, 1.235))],
            [Vector((side * 0.51, -1.100, 1.120)), Vector((side * 0.57, -1.100, 1.120))],
            [Vector((side * 0.48, -1.760, 0.880)), Vector((side * 0.54, -1.760, 0.880))],
        ]
        make_quad_grid(bm, rail if side > 0 else [[p for p in r] for r in rail])

        # C-Pillar / Flying Buttress Sail Panels
        cp_sail = [
            [Vector((side * 0.98, -1.100, 0.820)), Vector((side * 0.57, -1.100, 1.120))],
            [Vector((side * 0.96, -1.450, 0.840)), Vector((side * 0.54, -1.450, 1.000))],
            [Vector((side * 0.92, -1.760, 0.860)), Vector((side * 0.48, -1.760, 0.880))],
        ]
        make_quad_grid(bm, cp_sail if side > 0 else [[p for p in r] for r in cp_sail])

    # Double-Bubble Aerodynamic Roof Skin
    roof_rows = []
    roof_y_levels = [
        (-0.150, 0.51, 1.250, 1.273),
        (-0.580, 0.52, 1.235, 1.255),
        (-1.100, 0.51, 1.120, 1.140),
        (-1.760, 0.48, 0.880, 0.900),
    ]
    for ry, hw, z_base, z_pk in roof_y_levels:
        row = []
        for i in range(9):
            u = 1.0 - 2.0 * (i / 8.0)
            rx = u * hw
            bubble = (z_pk - z_base) * math.exp(-((abs(u) - 0.48) ** 2) / 0.08)
            rz = z_base + bubble
            row.append(Vector((rx, ry, rz)))
        roof_rows.append(row)

    make_quad_grid(bm, roof_rows)

    # ------------------------------------------------------------------------
    # PART E: WINDSHIELD COWL TROUGH & CABIN AIR INTAKE
    # ------------------------------------------------------------------------
    cowl_rows = [
        [Vector((-0.68, 0.500, 0.770)), Vector((-0.34, 0.500, 0.775)), Vector((0.0, 0.500, 0.772)), Vector((0.34, 0.500, 0.775)), Vector((0.68, 0.500, 0.770))],
        [Vector((-0.68, 0.560, 0.730)), Vector((-0.34, 0.560, 0.735)), Vector((0.0, 0.560, 0.732)), Vector((0.34, 0.560, 0.735)), Vector((0.68, 0.560, 0.730))],
        [Vector((-0.68, 0.620, 0.732)), Vector((-0.34, 0.620, 0.738)), Vector((0.0, 0.620, 0.735)), Vector((0.34, 0.620, 0.738)), Vector((0.68, 0.620, 0.732))],
        [Vector((-0.68, 0.660, 0.745)), Vector((-0.34, 0.660, 0.750)), Vector((0.0, 0.660, 0.748)), Vector((0.34, 0.660, 0.750)), Vector((0.68, 0.660, 0.745))],
    ]
    make_quad_grid(bm, cowl_rows)

    # ------------------------------------------------------------------------
    # PART F: FULL AERODYNAMIC FLAT UNDERBODY BELLY PAN & INVERTED NACA DUCTS
    # ------------------------------------------------------------------------
    belly_pan = [
        [Vector(( 0.70,  2.309, 0.095)), Vector(( 0.0,  2.309, 0.095)), Vector((-0.70,  2.309, 0.095))],
        [Vector(( 0.83,  1.380, 0.100)), Vector(( 0.0,  1.380, 0.100)), Vector((-0.83,  1.380, 0.100))],
        [Vector(( 0.88,  0.000, 0.105)), Vector(( 0.0,  0.000, 0.105)), Vector((-0.88,  0.000, 0.105))],
        [Vector(( 0.85, -1.340, 0.105)), Vector(( 0.0, -1.340, 0.105)), Vector((-0.85, -1.340, 0.105))],
        [Vector(( 0.86, -2.309, 0.260)), Vector(( 0.0, -2.309, 0.270)), Vector((-0.86, -2.309, 0.260))],
    ]
    make_quad_grid(bm, belly_pan)

    # Front Wheel Aerodynamic Air Deflector Spats
    for side in [1.0, -1.0]:
        spat_pts_top = [Vector((side * 0.78, 1.48, 0.100)), Vector((side * 0.84, 1.48, 0.100))]
        spat_pts_bot = [Vector((side * 0.78, 1.48, 0.045)), Vector((side * 0.84, 1.48, 0.045))]
        make_quad_strip(bm, spat_pts_top, spat_pts_bot)

    # Inverted NACA Gearbox Cooling Ducts on Flat Underfloor
    for side in [1.0, -1.0]:
        naca_front = Vector((side * 0.24, -0.40, 0.105))
        naca_mid   = Vector((side * 0.29, -0.65, 0.145))
        naca_rear  = Vector((side * 0.33, -0.80, 0.145))
        bmesh.ops.create_cube(bm, size=0.015)
        v_naca = bm.verts[-8:]
        bmesh.ops.scale(bm, verts=v_naca, vec=(0.06, 0.25, 0.035))
        bmesh.ops.translate(bm, verts=v_naca, vec=(naca_front + naca_rear) * 0.5)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.005)
    return link_obj("GEO_F12_Monocoque_BodySculpture", bm, parent, mats["paint"], bevel=0.002, auto_smooth=35.0, subsurf_levels=1)

# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 4: ENCLOSED MATTE BLACK INNER WHEEL ARCH LINERS
# ----------------------------------------------------------------------------
def build_f12_wheel_arch_liners(parent, mats):
    """
    Constructs enclosed matte black plastic inner wheel arch liner tubs.
    Seals inner wheel cavities from chassis voids without obstructing the forged wheels.
    """
    bm_tubs = bmesh.new()
    f_axle = 1.380
    r_axle = -1.340
    tub_configs = [
        (f_axle, 0.343 + 0.040, 0.8325),
        (r_axle, 0.364 + 0.040, 0.8490),
    ]
    for ax_y, t_r, track_x in tub_configs:
        for side in [1.0, -1.0]:
            tub_pts_outer = []
            tub_pts_inner = []
            for a_i in range(13):
                ang = math.pi * a_i / 12.0
                ty = ax_y - t_r * math.cos(ang)
                tz = 0.110 + t_r * math.sin(ang)
                tub_pts_outer.append(Vector((side * (track_x - 0.060), ty, tz)))
                tub_pts_inner.append(Vector((side * 0.460, ty, tz)))
            tub_rows = [tub_pts_outer, tub_pts_inner]
            make_quad_grid(bm_tubs, tub_rows if side > 0 else [[p for p in r] for r in tub_rows])

    return link_obj("GEO_F12_WheelArchLiners_Plastic", bm_tubs, parent, mats["black_trim"], bevel=0.0)

# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 5: OPTICAL DIELECTRIC GREENHOUSE GLASS & PRIVACY TUB
# ----------------------------------------------------------------------------
def build_f12_greenhouse_glass(parent, mats):
    """
    Constructs the optical dielectric curved glass surfaces, complete with
    ceramic frit borders, flush rubber moldings, and dark interior privacy tub.
    """
    bm_glass = bmesh.new()
    bm_frit  = bmesh.new()
    bm_tub   = bmesh.new()
    bm_rub   = bmesh.new()

    # 1. Windshield Curved Glass Screen (Cowl Y=+0.500 to Header Y=-0.150)
    ws_rows = [
        [Vector(( 0.68,  0.500, 0.775)), Vector(( 0.34,  0.500, 0.785)), Vector(( 0.0,  0.500, 0.780)), Vector((-0.34,  0.500, 0.785)), Vector((-0.68,  0.500, 0.775))],
        [Vector(( 0.58,  0.180, 1.025)), Vector(( 0.29,  0.180, 1.045)), Vector(( 0.0,  0.180, 1.035)), Vector((-0.29,  0.180, 1.045)), Vector((-0.58,  0.180, 1.025))],
        [Vector(( 0.50, -0.150, 1.248)), Vector(( 0.25, -0.150, 1.268)), Vector(( 0.0, -0.150, 1.252)), Vector((-0.25, -0.150, 1.268)), Vector((-0.50, -0.150, 1.248))],
    ]
    make_quad_grid(bm_glass, ws_rows)

    # Windshield EPDM Rubber Perimeter Molding
    for r_idx in range(len(ws_rows) - 1):
        for side in [1.0, -1.0]:
            p1 = ws_rows[r_idx][0 if side > 0 else -1]
            p2 = ws_rows[r_idx+1][0 if side > 0 else -1]
            bmesh.ops.create_cube(bm_rub, size=0.008)
            v_rub = bm_rub.verts[-8:]
            bmesh.ops.scale(bm_rub, verts=v_rub, vec=(0.015, (p2 - p1).length, 0.010))
            bmesh.ops.translate(bm_rub, verts=v_rub, vec=(p1 + p2) * 0.5)

    # 2. Fastback Rear Window Screen (Header Y=-0.580 to Deck Y=-1.760)
    rg_rows = [
        [Vector(( 0.50, -0.580, 1.232)), Vector(( 0.25, -0.580, 1.252)), Vector(( 0.0, -0.580, 1.238)), Vector((-0.25, -0.580, 1.252)), Vector((-0.50, -0.580, 1.232))],
        [Vector(( 0.49, -1.100, 1.118)), Vector(( 0.24, -1.100, 1.138)), Vector(( 0.0, -1.100, 1.122)), Vector((-0.24, -1.100, 1.138)), Vector((-0.49, -1.100, 1.118))],
        [Vector(( 0.46, -1.760, 0.878)), Vector(( 0.23, -1.760, 0.898)), Vector(( 0.0, -1.760, 0.882)), Vector((-0.23, -1.760, 0.898)), Vector((-0.46, -1.760, 0.878))],
    ]
    make_quad_grid(bm_glass, rg_rows)

    # 3. Teardrop Side Windows & Rear Quarter Glass
    for side in [1.0, -1.0]:
        side_glass_grid = [
            [Vector((side * 0.68,  0.500, 0.775)), Vector((side * 0.88,  0.500, 0.750))],
            [Vector((side * 0.58,  0.180, 1.025)), Vector((side * 0.90,  0.180, 0.750))],
            [Vector((side * 0.50, -0.150, 1.248)), Vector((side * 0.92, -0.150, 0.755))],
            [Vector((side * 0.51, -0.580, 1.232)), Vector((side * 0.93, -0.580, 0.765))],
            [Vector((side * 0.50, -1.080, 1.115)), Vector((side * 0.94, -1.080, 0.810))],
        ]
        make_quad_grid(bm_glass, side_glass_grid if side > 0 else [[p for p in r] for r in side_glass_grid])

    # 4. Ceramic Frit Blackout Perimeter Border
    for row in ws_rows:
        p_l = row[0]
        p_r = row[-1]
        bmesh.ops.create_cube(bm_frit, size=0.015)
        sub_v = bm_frit.verts[-8:]
        bmesh.ops.scale(bm_frit, verts=sub_v, vec=(0.02, 0.02, 0.01))
        bmesh.ops.translate(bm_frit, verts=sub_v, vec=p_l)

    # 5. Privacy Cockpit Interior Tub (Enclosed Under-Glass Shell)
    tub_rows = [
        [Vector(( 0.65,  0.480, 0.740)), Vector(( 0.0,  0.480, 0.720)), Vector((-0.65,  0.480, 0.740))],
        [Vector(( 0.60,  0.100, 0.650)), Vector(( 0.0,  0.100, 0.600)), Vector((-0.60,  0.100, 0.650))],
        [Vector(( 0.55, -0.400, 0.650)), Vector(( 0.0, -0.400, 0.600)), Vector((-0.55, -0.400, 0.650))],
        [Vector(( 0.50, -1.100, 0.780)), Vector(( 0.0, -1.100, 0.750)), Vector((-0.50, -1.100, 0.780))],
        [Vector(( 0.44, -1.720, 0.840)), Vector(( 0.0, -1.720, 0.830)), Vector((-0.44, -1.720, 0.840))],
    ]
    make_quad_grid(bm_tub, tub_rows)

    link_obj("GEO_F12_CeramicFrit_Borders", bm_frit, parent, mats["ceramic_frit"], bevel=0.0)
    link_obj("GEO_F12_Interior_PrivacyTub", bm_tub, parent, mats["interior_blackout"], bevel=0.0)
    link_obj("GEO_F12_Greenhouse_EPDMRubber", bm_rub, parent, mats["epdm_rubber"], bevel=0.0)
    return link_obj("GEO_F12_Greenhouse_Glass", bm_glass, parent, mats["glass"], bevel=0.0)

# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 6: COMPETITION REAR DIFFUSER & QUAD EXHAUST TAILPIPES
# ----------------------------------------------------------------------------
def build_f12_rear_diffuser_and_exhausts(parent, mats):
    """
    Constructs the competition-derived multi-channel carbon fiber rear diffuser
    with 6 vertical aerodynamic guide strakes and quad circular Inconel exhaust tips.
    """
    bm_diff = bmesh.new()
    bm_exh  = bmesh.new()

    # 1. Main Diffuser Carbon Underbody Tunnel (Y=-1.800 to -2.309, Z=0.120 to 0.260)
    diff_rows = [
        [Vector(( 0.80, -1.800, 0.110)), Vector(( 0.40, -1.800, 0.110)), Vector(( 0.0, -1.800, 0.115)), Vector((-0.40, -1.800, 0.110)), Vector((-0.80, -1.800, 0.110))],
        [Vector(( 0.82, -2.050, 0.160)), Vector(( 0.41, -2.050, 0.165)), Vector(( 0.0, -2.050, 0.170)), Vector((-0.41, -2.050, 0.165)), Vector((-0.82, -2.050, 0.160))],
        [Vector(( 0.84, -2.309, 0.250)), Vector(( 0.42, -2.309, 0.260)), Vector(( 0.0, -2.309, 0.270)), Vector((-0.42, -2.309, 0.260)), Vector((-0.84, -2.309, 0.250))],
    ]
    make_quad_grid(bm_diff, diff_rows)

    # 2. 6 Vertical Aerodynamic Guide Strakes
    strake_x_positions = [-0.60, -0.38, -0.15, 0.15, 0.38, 0.60]
    for sx in strake_x_positions:
        s_pts_top = [
            Vector((sx, -1.800, 0.110)),
            Vector((sx, -2.050, 0.165)),
            Vector((sx, -2.309, 0.260)),
        ]
        s_pts_bot = [
            Vector((sx, -1.800, 0.090)),
            Vector((sx, -2.050, 0.095)),
            Vector((sx, -2.315, 0.110)),
        ]
        make_quad_strip(bm_diff, s_pts_top, s_pts_bot)

    # 3. Quad Inconel Circular Exhaust Tailpipes (Twin Bilateral Clusters)
    exh_configs = [
        (-0.680, -2.335, 0.295),
        (-0.575, -2.335, 0.295),
        ( 0.575, -2.335, 0.295),
        ( 0.680, -2.335, 0.295),
    ]

    pipe_r = 0.042
    wall_t = 0.003
    pipe_len = 0.140
    segs = 18

    for ex_x, ex_y, ex_z in exh_configs:
        center_front = Vector((ex_x, ex_y, ex_z))
        center_back  = Vector((ex_x, ex_y + pipe_len, ex_z))

        o_front, o_back = [], []
        i_front, i_back = [], []

        for s in range(segs):
            ang = 2.0 * math.pi * s / segs
            c_a, s_a = math.cos(ang), math.sin(ang)

            o_front.append(center_front + Vector((pipe_r * c_a, 0.0, pipe_r * s_a)))
            o_back.append(center_back   + Vector((pipe_r * c_a, 0.0, pipe_r * s_a)))

            i_front.append(center_front + Vector(((pipe_r - wall_t) * c_a, 0.0, (pipe_r - wall_t) * s_a)))
            i_back.append(center_back   + Vector(((pipe_r - wall_t) * c_a, 0.0, (pipe_r - wall_t) * s_a)))

        # Outer skin
        for s in range(segs):
            s_nxt = (s + 1) % segs
            bm_exh.faces.new((bm_exh.verts.new(o_front[s]),
                              bm_exh.verts.new(o_front[s_nxt]),
                              bm_exh.verts.new(o_back[s_nxt]),
                              bm_exh.verts.new(o_back[s])))

        # Rim lip face
        for s in range(segs):
            s_nxt = (s + 1) % segs
            bm_exh.faces.new((bm_exh.verts.new(o_front[s]),
                              bm_exh.verts.new(i_front[s]),
                              bm_exh.verts.new(i_front[s_nxt]),
                              bm_exh.verts.new(o_front[s_nxt])))

        # Interior dark soot liner
        for s in range(segs):
            s_nxt = (s + 1) % segs
            bm_exh.faces.new((bm_exh.verts.new(i_front[s]),
                              bm_exh.verts.new(i_back[s]),
                              bm_exh.verts.new(i_back[s_nxt]),
                              bm_exh.verts.new(i_front[s_nxt])))

    link_obj("GEO_F12_RearDiffuser_Carbon", bm_diff, parent, mats["carbon"], bevel=0.002)
    link_obj("GEO_F12_ExhaustTailpipes_Inconel", bm_exh, parent, mats["exhaust_chrome"], bevel=0.001)

# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 7: CARBON FRONT SPLITTER & BASE LIGHTING HOUSINGS
# ----------------------------------------------------------------------------
def build_f12_splitter_and_base_lighting(parent, mats):
    """
    Constructs the carbon fiber front splitter lip with side canards, along
    with base headlamp buckets and circular ruby taillamp lenses.
    """
    bm_spl = bmesh.new()
    bm_head = bmesh.new()
    bm_tail = bmesh.new()

    # 1. Carbon Fiber Front Splitter Lip (Extends 35mm forward of chin)
    spl_top = [
        Vector((-0.72, 2.24, 0.088)),
        Vector((-0.45, 2.30, 0.088)),
        Vector(( 0.00, 2.335, 0.088)),
        Vector(( 0.45, 2.30, 0.088)),
        Vector(( 0.72, 2.24, 0.088)),
    ]
    spl_bot = [
        Vector((-0.72, 2.24, 0.076)),
        Vector((-0.45, 2.30, 0.076)),
        Vector(( 0.00, 2.335, 0.076)),
        Vector(( 0.45, 2.30, 0.076)),
        Vector(( 0.72, 2.24, 0.076)),
    ]
    spl_inner = [
        Vector((-0.66, 2.20, 0.088)),
        Vector((-0.40, 2.24, 0.088)),
        Vector(( 0.00, 2.260, 0.088)),
        Vector(( 0.40, 2.24, 0.088)),
        Vector(( 0.66, 2.20, 0.088)),
    ]

    make_quad_strip(bm_spl, spl_top, spl_bot)
    make_quad_strip(bm_spl, spl_inner, spl_top)

    # Side Aero Canards / Strakes on Splitter Outboard Edges
    for s in [1.0, -1.0]:
        canard = [
            [Vector((s * 0.72, 2.24, 0.076)), Vector((s * 0.72, 2.24, 0.140))],
            [Vector((s * 0.74, 2.18, 0.076)), Vector((s * 0.74, 2.18, 0.160))],
            [Vector((s * 0.76, 2.12, 0.076)), Vector((s * 0.76, 2.12, 0.180))],
        ]
        make_quad_grid(bm_spl, canard if s > 0 else [[p for p in r] for r in canard])

    # 2. Base Headlamp Assemblies (Recessed Feline Vertical Buckets)
    for s in [1.0, -1.0]:
        hl_pts = [
            Vector((s * 0.620, 2.050, 0.460)),
            Vector((s * 0.640, 1.900, 0.540)),
            Vector((s * 0.655, 1.700, 0.640)),
            Vector((s * 0.665, 1.480, 0.720)),
            Vector((s * 0.675, 1.340, 0.770)),
        ]
        for i in range(len(hl_pts) - 1):
            p1 = hl_pts[i]
            p2 = hl_pts[i+1]
            p1_in = p1 + Vector((-0.035 * s, 0.0, 0.005))
            p2_in = p2 + Vector((-0.035 * s, 0.0, 0.005))
            if s > 0:
                bm_head.faces.new((bm_head.verts.new(p1),
                                   bm_head.verts.new(p2),
                                   bm_head.verts.new(p2_in),
                                   bm_head.verts.new(p1_in)))
            else:
                bm_head.faces.new((bm_head.verts.new(p1),
                                   bm_head.verts.new(p1_in),
                                   bm_head.verts.new(p2_in),
                                   bm_head.verts.new(p2)))

    # 3. Base Circular Ruby Taillamp Outer Lenses
    for s in [1.0, -1.0]:
        t_center = Vector((s * 0.650, -2.315, 0.680))
        tl_ring = []
        for a_idx in range(16):
            ang = 2.0 * math.pi * a_idx / 16.0
            p = t_center + Vector((0.072 * math.cos(ang), 0.0, 0.072 * math.sin(ang)))
            tl_ring.append(bm_tail.verts.new(p))
        v_tc = bm_tail.verts.new(t_center + Vector((0.0, -0.008, 0.0)))
        for a_idx in range(16):
            a_nxt = (a_idx + 1) % 16
            if s > 0:
                bm_tail.faces.new((v_tc, tl_ring[a_idx], tl_ring[a_nxt]))
            else:
                bm_tail.faces.new((v_tc, tl_ring[a_nxt], tl_ring[a_idx]))

    link_obj("GEO_F12_FrontSplitter_Carbon", bm_spl, parent, mats["carbon"], bevel=0.002)
    link_obj("GEO_F12_BaseHeadlamps_Polycarbonate", bm_head, parent, mats["lens_clear"], bevel=0.0)
    link_obj("GEO_F12_BaseTaillamps_Ruby", bm_tail, parent, mats["lens_ruby"], bevel=0.0)

# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 8: DETAILED UNDERBODY CHANNELS & VENTILATION DUCTS
# ----------------------------------------------------------------------------
def build_f12_underbody_aero_ducts(parent, mats):
    """
    Constructs the micro-detailed underbody aerodynamic management suite:
    - Front under-engine NACA air extraction ducts
    - Transmission oil cooler radiator core and duct channel
    - Front active aerodynamic brake cooling air guides
    - Underbody structural reinforcement ribs
    """
    bm_ducts = bmesh.new()

    # 1. Front Brake Cooling Air Tunnel Ducts (from bumper mouth into wheel wells)
    for side in [1.0, -1.0]:
        d_mouth = Vector((side * 0.45, 2.22, 0.16))
        d_exit  = Vector((side * 0.72, 1.55, 0.22))
        d_mid   = (d_mouth + d_exit) * 0.5 + Vector((0.0, 0.0, -0.02))

        bmesh.ops.create_cone(bm_ducts, cap_ends=True, segments=12, radius1=0.045, radius2=0.038, depth=(d_exit - d_mouth).length)
        v_duct = bm_ducts.verts[-24:]
        bmesh.ops.translate(bm_ducts, verts=v_duct, vec=d_mid)

    # 2. Transmission & Differential Heat Exchanger Core (Underfloor at Y = -1.10m)
    rad_pos = Vector((0.0, -1.10, 0.125))
    bmesh.ops.create_cube(bm_ducts, size=0.015)
    v_rad = bm_ducts.verts[-8:]
    bmesh.ops.scale(bm_ducts, verts=v_rad, vec=(0.28, 0.18, 0.025))
    bmesh.ops.translate(bm_ducts, verts=v_rad, vec=rad_pos)

    # 3. Longitudinal Floorpan Stiffening Ribs
    for side in [1.0, -1.0]:
        for rib_offset in [0.25, 0.50, 0.72]:
            rib_start = Vector((side * rib_offset,  1.10, 0.098))
            rib_end   = Vector((side * rib_offset, -1.10, 0.102))
            bmesh.ops.create_cube(bm_ducts, size=0.012)
            v_rib = bm_ducts.verts[-8:]
            bmesh.ops.scale(bm_ducts, verts=v_rib, vec=(0.012, 2.20, 0.008))
            bmesh.ops.translate(bm_ducts, verts=v_rib, vec=(rib_start + rib_end) * 0.5)

    return link_obj("GEO_F12_UnderfloorAeroDucts", bm_ducts, parent, mats["carbon_underbody"], bevel=0.001)

# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 9: FRONT RADIATOR & HEAT EXCHANGER ASSEMBLIES
# ----------------------------------------------------------------------------
def build_f12_radiator_assemblies(parent, mats):
    """
    Constructs the central engine cooling radiator matrix and twin outboard
    auxiliary oil cooler heat exchangers positioned behind the front bumper intake.
    """
    bm_rad = bmesh.new()

    # 1. Main Central Engine Radiator Core (Y = 1.95m, angled at 15 degrees)
    rad_center = Vector((0.0, 1.95, 0.32))
    bmesh.ops.create_cube(bm_rad, size=0.02)
    v_main_rad = bm_rad.verts[-8:]
    bmesh.ops.scale(bm_rad, verts=v_main_rad, vec=(0.68, 0.05, 0.32))
    bmesh.ops.rotate(bm_rad, verts=v_main_rad, matrix=Matrix.Rotation(math.radians(-15.0), 3, 'X'))
    bmesh.ops.translate(bm_rad, verts=v_main_rad, vec=rad_center)

    # Radiator End Tanks (Cast Aluminum)
    for side in [1.0, -1.0]:
        tank_pos = rad_center + Vector((side * 0.35, 0.0, 0.0))
        bmesh.ops.create_cube(bm_rad, size=0.02)
        v_tank = bm_rad.verts[-8:]
        bmesh.ops.scale(bm_rad, verts=v_tank, vec=(0.04, 0.07, 0.34))
        bmesh.ops.translate(bm_rad, verts=v_tank, vec=tank_pos)

    # 2. Dual Outboard Auxiliary Heat Exchangers (Behind Lower Front Bumper Mouth)
    for side in [1.0, -1.0]:
        aux_pos = Vector((side * 0.52, 2.08, 0.22))
        bmesh.ops.create_cube(bm_rad, size=0.015)
        v_aux = bm_rad.verts[-8:]
        bmesh.ops.scale(bm_rad, verts=v_aux, vec=(0.16, 0.04, 0.14))
        bmesh.ops.rotate(bm_rad, verts=v_aux, matrix=Matrix.Rotation(math.radians(12.0 * side), 3, 'Z'))
        bmesh.ops.translate(bm_rad, verts=v_aux, vec=aux_pos)

    return link_obj("GEO_F12_RadiatorHeatExchangers", bm_rad, parent, mats["radiator_aluminum"], bevel=0.001)

# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 10: ACTIVE BRAKE COOLING FLAPS & ACTUATOR MECHANISM
# ----------------------------------------------------------------------------
def build_f12_active_aero_flaps(parent, mats):
    """
    Constructs the patented Ferrari F12berlinetta Active Brake Cooling (ABC) guide
    vanes in the front lower fascia that open dynamically under heavy braking.
    """
    bm_flaps = bmesh.new()

    for side in [1.0, -1.0]:
        # 3 horizontal louver vanes per side
        for vane_idx in range(3):
            vane_z = 0.18 + vane_idx * 0.045
            vane_pos = Vector((side * 0.42, 2.18, vane_z))

            bmesh.ops.create_cube(bm_flaps, size=0.01)
            v_vane = bm_flaps.verts[-8:]
            bmesh.ops.scale(bm_flaps, verts=v_vane, vec=(0.14, 0.025, 0.006))
            # Slightly angled open in dynamic stance
            bmesh.ops.rotate(bm_flaps, verts=v_vane, matrix=Matrix.Rotation(math.radians(-18.0), 3, 'X'))
            bmesh.ops.translate(bm_flaps, verts=v_vane, vec=vane_pos)

        # Vertical Actuator Linkage Rod
        rod_b = Vector((side * 0.48, 2.16, 0.17))
        rod_t = Vector((side * 0.48, 2.16, 0.29))
        create_cylinder_between(bm_flaps, rod_b, rod_t, radius=0.004, segments=8)

    return link_obj("GEO_F12_ActiveBrakeCoolingFlaps", bm_flaps, parent, mats["carbon"], bevel=0.001)

# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 11: WINDSHIELD COWL INTAKE SCREEN & WIPER DRIVE WELL
# ----------------------------------------------------------------------------
def build_f12_cowl_intake_screen(parent, mats):
    """
    Constructs the recessed cabin HVAC air intake screen, drainage channels,
    and wiper spindle pivots situated beneath the trailing edge of the hood.
    """
    bm_cowl = bmesh.new()

    # 1. Perforated Ventilation Grille Mesh Ribs (Y = 0.58m to 0.64m)
    for rib_idx in range(12):
        rib_y = 0.58 + rib_idx * 0.005
        rib_p1 = Vector((-0.55, rib_y, 0.732))
        rib_p2 = Vector(( 0.55, rib_y, 0.732))

        bmesh.ops.create_cube(bm_cowl, size=0.004)
        v_rib = bm_cowl.verts[-8:]
        bmesh.ops.scale(bm_cowl, verts=v_rib, vec=(1.10, 0.002, 0.003))
        bmesh.ops.translate(bm_cowl, verts=v_rib, vec=(rib_p1 + rib_p2) * 0.5)

    # 2. Wiper Motor Spindle Hub Pivots (LHD Driver and Passenger)
    for sp_x, sp_y, sp_z in [(-0.35, 0.54, 0.745), (0.15, 0.53, 0.750)]:
        bmesh.ops.create_cone(bm_cowl, cap_ends=True, segments=12, radius1=0.014, radius2=0.012, depth=0.025)
        v_sp = bm_cowl.verts[-24:]
        bmesh.ops.translate(bm_cowl, verts=v_sp, vec=Vector((sp_x, sp_y, sp_z)))

    # 3. Dual Windshield Washer Fluid Spray Nozzles
    for noz_x in [-0.22, 0.22]:
        noz_pos = Vector((noz_x, 0.62, 0.740))
        bmesh.ops.create_cube(bm_cowl, size=0.008)
        v_noz = bm_cowl.verts[-8:]
        bmesh.ops.scale(bm_cowl, verts=v_noz, vec=(0.010, 0.012, 0.006))
        bmesh.ops.translate(bm_cowl, verts=v_noz, vec=noz_pos)

    return link_obj("GEO_F12_CowlIntakeScreen", bm_cowl, parent, mats["black_trim"], bevel=0.001)

# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 12: FRONT ALUMINUM CHASSIS FRAME & CRASH STRUCTURE
# ----------------------------------------------------------------------------
def build_f12_front_chassis_frame(parent, mats):
    """
    Constructs the extruded aluminum front chassis longitudinal rails, shock tower
    castings, engine bay V-strut crossbrace, and front bumper crash beam with crush cans.
    Visible beneath the body panels and through the front radiator intake & Aero Bridge.
    """
    bm_frame = bmesh.new()
    f_axle = 1.380

    # 1. Longitudinal Front Chassis Rails (Y = 0.40m to 2.20m, LHD & RHD)
    for side in [1.0, -1.0]:
        rail_start = Vector((side * 0.42, 0.40, 0.22))
        rail_end   = Vector((side * 0.40, 2.20, 0.24))

        # Extruded rectangular box section (80mm x 120mm)
        create_oriented_box_between(bm_frame, rail_start, rail_end, width=0.08, height=0.12)

        # Cast Aluminum Front Shock Tower Domes (Y = 1.38m, Z = 0.50m)
        tower_pos = Vector((side * 0.48, f_axle, 0.50))
        res_tw = bmesh.ops.create_cone(bm_frame, cap_ends=True, segments=16, radius1=0.11, radius2=0.085, depth=0.18)
        bmesh.ops.translate(bm_frame, verts=res_tw['verts'], vec=tower_pos)

        # Shock Tower Top Mounting Flange (with 3 strut top nuts)
        for nut_idx in range(3):
            n_ang = 2.0 * math.pi * nut_idx / 3.0
            nut_pos = tower_pos + Vector((0.065 * math.cos(n_ang), 0.065 * math.sin(n_ang), 0.095))
            res_nut = bmesh.ops.create_cone(bm_frame, cap_ends=True, segments=6, radius1=0.008, radius2=0.008, depth=0.015)
            bmesh.ops.translate(bm_frame, verts=res_nut['verts'], vec=nut_pos)

        # Crush Cans (Deformable Aluminum Accordion Boxes behind bumper beam)
        crush_start = Vector((side * 0.40, 2.08, 0.24))
        crush_end   = Vector((side * 0.40, 2.24, 0.24))
        create_oriented_box_between(bm_frame, crush_start, crush_end, width=0.09, height=0.11)

        # Transverse Wishbone Mounting Cleats & Pivot Bushing Tabs
        for f_cleat_y in [f_axle + 0.18, f_axle - 0.18]:
            cleat_pos = Vector((side * 0.38, f_cleat_y, 0.14))
            res_cleat = bmesh.ops.create_cube(bm_frame, size=1.0)
            bmesh.ops.scale(bm_frame, verts=res_cleat['verts'], vec=(0.04, 0.05, 0.04))
            bmesh.ops.translate(bm_frame, verts=res_cleat['verts'], vec=cleat_pos)

    # 2. Transverse Front Bumper Crash Bar / Impact Beam (Y = 2.08m, tucked behind radiator pack)
    beam_pos = Vector((0.0, 2.08, 0.24))
    res_bm = bmesh.ops.create_cube(bm_frame, size=1.0)
    bmesh.ops.scale(bm_frame, verts=res_bm['verts'], vec=(1.10, 0.08, 0.10))
    bmesh.ops.translate(bm_frame, verts=res_bm['verts'], vec=beam_pos)

    # Tow Hook Receiver Socket (offset in front bumper beam)
    tow_pos = Vector((0.28, 2.12, 0.24))
    res_tow = bmesh.ops.create_cone(bm_frame, cap_ends=True, segments=12, radius1=0.018, radius2=0.018, depth=0.06)
    v_tow = res_tow['verts']
    bmesh.ops.rotate(bm_frame, verts=v_tow, matrix=Matrix.Rotation(math.radians(90.0), 3, 'X'))
    bmesh.ops.translate(bm_frame, verts=v_tow, vec=tow_pos)

    # 3. Engine Bay V-Strut Crossbrace (Stiffening shock towers to cowl bulkhead)
    for side in [1.0, -1.0]:
        tower_top = Vector((side * 0.48, f_axle, 0.58))
        cowl_center = Vector((0.0, 0.58, 0.72))
        create_cylinder_between(bm_frame, cowl_center, tower_top, radius=0.014, segments=8)

    # Front Transverse Shock Tower Crossbar
    bar_left  = Vector((-0.48, f_axle, 0.58))
    bar_right = Vector(( 0.48, f_axle, 0.58))
    create_cylinder_between(bm_frame, bar_left, bar_right, radius=0.012, segments=8)

    return link_obj("GEO_F12_FrontChassis_Frame", bm_frame, parent, mats["suspension_alloy"], bevel=0.002)

# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 13: REAR CHASSIS SUBFRAME & CRASH STRUCTURE
# ----------------------------------------------------------------------------
def build_f12_rear_chassis_subframe(parent, mats):
    """
    Constructs the extruded rear longitudinal chassis rails, transaxle mounting
    cradle, rear crash impact bumper beam, and rear tow recovery eyelet.
    """
    bm_rframe = bmesh.new()
    r_axle = -1.340

    # 1. Rear Longitudinal Frame Rails (Y = -0.80m to -2.25m)
    for side in [1.0, -1.0]:
        r_start = Vector((side * 0.44, -0.80, 0.28))
        r_end   = Vector((side * 0.42, -2.24, 0.32))

        bmesh.ops.create_cube(bm_rframe, size=0.02)
        v_rrail = bm_rframe.verts[-8:]
        bmesh.ops.scale(bm_rframe, verts=v_rrail, vec=(0.08, (r_end - r_start).length, 0.10))
        bmesh.ops.translate(bm_rframe, verts=v_rrail, vec=(r_start + r_end) * 0.5)

        # Rear Damper Top Mount Towers (Y = -1.34m, Z = 0.56m)
        r_tower_pos = Vector((side * 0.50, r_axle, 0.56))
        bmesh.ops.create_cone(bm_rframe, cap_ends=True, segments=16, radius1=0.10, radius2=0.08, depth=0.16)
        v_rtower = bm_rframe.verts[-32:]
        bmesh.ops.translate(bm_rframe, verts=v_rtower, vec=r_tower_pos)

        # Rear Crush Cans (behind rear bumper beam)
        rcrush_pos = Vector((side * 0.42, -2.18, 0.32))
        bmesh.ops.create_cube(bm_rframe, size=0.015)
        v_rcrush = bm_rframe.verts[-8:]
        bmesh.ops.scale(bm_rframe, verts=v_rcrush, vec=(0.08, 0.14, 0.09))
        bmesh.ops.translate(bm_rframe, verts=v_rcrush, vec=rcrush_pos)

    # 2. Transverse Rear Impact Bumper Beam (Y = -2.26m)
    r_beam_pos = Vector((0.0, -2.26, 0.32))
    bmesh.ops.create_cube(bm_rframe, size=0.02)
    v_rbeam = bm_rframe.verts[-8:]
    bmesh.ops.scale(bm_rframe, verts=v_rbeam, vec=(1.12, 0.08, 0.09))
    bmesh.ops.translate(bm_rframe, verts=v_rbeam, vec=r_beam_pos)

    # Rear Tow Eye Threaded Socket
    r_tow_pos = Vector((-0.32, -2.29, 0.32))
    bmesh.ops.create_cone(bm_rframe, cap_ends=True, segments=12, radius1=0.016, radius2=0.016, depth=0.05)
    v_rtow = bm_rframe.verts[-24:]
    bmesh.ops.rotate(bm_rframe, verts=v_rtow, matrix=Matrix.Rotation(math.radians(90.0), 3, 'X'))
    bmesh.ops.translate(bm_rframe, verts=v_rtow, vec=r_tow_pos)

    # 3. Carbon Fiber Fuel Cell Protective Safety Shield (Ahead of rear axle)
    tank_pos = Vector((0.0, -0.92, 0.28))
    bmesh.ops.create_cube(bm_rframe, size=0.02)
    v_tank = bm_rframe.verts[-8:]
    bmesh.ops.scale(bm_rframe, verts=v_tank, vec=(0.78, 0.34, 0.22))
    bmesh.ops.translate(bm_rframe, verts=v_tank, vec=tank_pos)

    return link_obj("GEO_F12_RearChassis_Subframe", bm_rframe, parent, mats["suspension_alloy"], bevel=0.002)

# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 14: AERO BRIDGE INTERNAL AIR FLOW CANALS
# ----------------------------------------------------------------------------
def build_f12_aero_bridge_internal_canals(parent, mats):
    """
    Constructs the internal carbon fiber air duct channels of the patented
    Ferrari Aero Bridge. Scoops high-pressure air off the hood crest (Y = 1.60m),
    funnels it through the fender hollows, and releases it along the door waist.
    """
    bm_ab = bmesh.new()

    for side in [1.0, -1.0]:
        # Upper Hood Intake Vent Channel
        inlet_top = [
            Vector((side * 0.68, 1.62, 0.68)),
            Vector((side * 0.74, 1.45, 0.68)),
            Vector((side * 0.78, 1.25, 0.69)),
            Vector((side * 0.82, 1.05, 0.70)),
        ]
        inlet_bot = [
            Vector((side * 0.62, 1.62, 0.63)),
            Vector((side * 0.68, 1.45, 0.62)),
            Vector((side * 0.72, 1.25, 0.63)),
            Vector((side * 0.76, 1.05, 0.64)),
        ]
        make_quad_strip(bm_ab, inlet_top if side > 0 else inlet_bot, inlet_bot if side > 0 else inlet_top)

        # Internal Downward Guide Vanes
        for v_idx in range(3):
            v_y = 1.45 - v_idx * 0.16
            v_p1 = Vector((side * 0.72, v_y, 0.66))
            v_p2 = Vector((side * 0.80, v_y - 0.05, 0.58))
            bmesh.ops.create_cube(bm_ab, size=0.006)
            v_vane = bm_ab.verts[-8:]
            bmesh.ops.scale(bm_ab, verts=v_vane, vec=(0.06, 0.02, 0.004))
            bmesh.ops.rotate(bm_ab, verts=v_vane, matrix=Matrix.Rotation(math.radians(-25.0 * side), 3, 'Y'))
            bmesh.ops.translate(bm_ab, verts=v_vane, vec=(v_p1 + v_p2) * 0.5)

        # Flank Exit Air Canal Lip (where air rejoins the door boundary layer)
        exit_top = [
            Vector((side * 0.84, 0.95, 0.71)),
            Vector((side * 0.88, 0.75, 0.71)),
            Vector((side * 0.90, 0.55, 0.72)),
        ]
        exit_bot = [
            Vector((side * 0.80, 0.95, 0.64)),
            Vector((side * 0.83, 0.75, 0.64)),
            Vector((side * 0.85, 0.55, 0.65)),
        ]
        make_quad_strip(bm_ab, exit_top if side > 0 else exit_bot, exit_bot if side > 0 else exit_top)

    return link_obj("GEO_F12_AeroBridge_InternalCanals", bm_ab, parent, mats["carbon"], bevel=0.001)

# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 15: FLUSH GREENHOUSE MOUNTING FLANGES & B-PILLAR APPLIQUES
# ----------------------------------------------------------------------------
def build_f12_greenhouse_mounting_flanges(parent, mats):
    """
    Constructs the recessed body window sills, shadow gap mounting steps,
    high-gloss B-pillar blackout sash plates, and roof rail drain gutters.
    """
    bm_flange = bmesh.new()

    for side in [1.0, -1.0]:
        # 1. Door Waistline Window Sill Rubber Gutter (Y = 0.50m to -0.94m)
        sill_pts = [
            Vector((side * 0.88,  0.50, 0.748)),
            Vector((side * 0.90,  0.18, 0.748)),
            Vector((side * 0.92, -0.15, 0.753)),
            Vector((side * 0.93, -0.58, 0.763)),
            Vector((side * 0.94, -0.94, 0.795)),
        ]
        for p_idx in range(len(sill_pts) - 1):
            p1 = sill_pts[p_idx]
            p2 = sill_pts[p_idx+1]
            create_oriented_box_between(bm_flange, p1, p2, width=0.016, height=0.008)

        # 2. High-Gloss B-Pillar Blackout Sash Plate (Y = -0.58m to -0.68m)
        bp_top = Vector((side * 0.52, -0.58, 1.235))
        bp_bot = Vector((side * 0.93, -0.58, 0.765))
        create_oriented_box_between(bm_flange, bp_bot, bp_top, width=0.025, height=0.085)

        # 3. A-Pillar Exterior Water Runoff Deflector Strip
        ap_base = Vector((side * 0.78,  0.50, 0.772))
        ap_peak = Vector((side * 0.58, -0.15, 1.252))
        create_cylinder_between(bm_flange, ap_base, ap_peak, radius=0.004, segments=6)

    return link_obj("GEO_F12_Greenhouse_MountingFlanges", bm_flange, parent, mats["black_trim"], bevel=0.001)

# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 16: QUARTER PANEL FUEL FILLER HOUSING POCKET
# ----------------------------------------------------------------------------
def build_f12_fuel_filler_pocket(parent, mats):
    """
    Constructs the recessed fuel filler pocket inside the right rear haunch
    fender, including the billet aluminum screw cap, safety tether, and drain port.
    """
    bm_fuel = bmesh.new()

    # Positioned on Right Rear Haunch (X = +0.94m, Y = -1.45m, Z = 0.85m)
    f_center = Vector((0.92, -1.45, 0.85))
    f_norm   = Vector((0.92, -0.15, 0.35)).normalized()

    # Recessed Bowl Basin
    bowl_r = 0.065
    bowl_depth = 0.045
    segs = 16

    ring_outer = []
    ring_inner = []
    for s in range(segs):
        ang = 2.0 * math.pi * s / segs
        c_a, s_a = math.cos(ang), math.sin(ang)
        p_out = f_center + Vector((0.0, bowl_r * c_a, bowl_r * s_a))
        p_in  = f_center - f_norm * bowl_depth + Vector((0.0, bowl_r * 0.75 * c_a, bowl_r * 0.75 * s_a))
        ring_outer.append(bm_fuel.verts.new(p_out))
        ring_inner.append(bm_fuel.verts.new(p_in))

    v_center = bm_fuel.verts.new(f_center - f_norm * bowl_depth)
    for s in range(segs):
        s_nxt = (s + 1) % segs
        bm_fuel.faces.new((ring_outer[s], ring_outer[s_nxt], ring_inner[s_nxt], ring_inner[s]))
        bm_fuel.faces.new((ring_inner[s], ring_inner[s_nxt], v_center))

    # Billet Aluminum Fuel Cap with Gripping Ears
    cap_pos = f_center - f_norm * (bowl_depth * 0.5)
    bmesh.ops.create_cone(bm_fuel, cap_ends=True, segments=16, radius1=0.032, radius2=0.030, depth=0.018)
    v_cap = bm_fuel.verts[-32:]
    bmesh.ops.rotate(bm_fuel, verts=v_cap, matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y'))
    bmesh.ops.translate(bm_fuel, verts=v_cap, vec=cap_pos)

    # Cap Gripping Bar
    bmesh.ops.create_cube(bm_fuel, size=0.008)
    v_ear = bm_fuel.verts[-8:]
    bmesh.ops.scale(bm_fuel, verts=v_ear, vec=(0.012, 0.048, 0.010))
    bmesh.ops.translate(bm_fuel, verts=v_ear, vec=cap_pos + f_norm * 0.012)

    # Overflow Drain Hole at bottom of bowl
    drain_pos = f_center - f_norm * bowl_depth + Vector((0.0, 0.0, -bowl_r * 0.65))
    bmesh.ops.create_cone(bm_fuel, cap_ends=True, segments=8, radius1=0.005, radius2=0.005, depth=0.015)
    v_drain = bm_fuel.verts[-16:]
    bmesh.ops.translate(bm_fuel, verts=v_drain, vec=drain_pos)

    return link_obj("GEO_F12_FuelFillerPocket", bm_fuel, parent, mats["titanium"], bevel=0.001)

# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 17: UNDERBODY GROUND-EFFECT VORTEX GENERATORS
# ----------------------------------------------------------------------------
def build_f12_underbody_vortex_generators(parent, mats):
    """
    Constructs the aerodynamic ground-effect vortex generators and floor fences:
    - Front under-splitter vortex strakes angled at 14 degrees to shed vortices
    - Flat underfloor lateral sealing skirts
    - Diffuser entrance transition ramps
    """
    bm_vortex = bmesh.new()

    # 1. Front Under-Splitter Angled Vortex Strakes (Y = 2.05m to 2.22m)
    for side in [1.0, -1.0]:
        for v_i in [0.20, 0.35, 0.50]:
            p_front = Vector((side * v_i, 2.20, 0.088))
            p_rear  = Vector((side * (v_i + 0.035), 2.06, 0.088))

            bmesh.ops.create_cube(bm_vortex, size=0.004)
            v_vg = bm_vortex.verts[-8:]
            bmesh.ops.scale(bm_vortex, verts=v_vg, vec=(0.004, (p_front - p_rear).length, 0.024))
            bmesh.ops.rotate(bm_vortex, verts=v_vg, matrix=Matrix.Rotation(math.radians(-14.0 * side), 3, 'Z'))
            bmesh.ops.translate(bm_vortex, verts=v_vg, vec=(p_front + p_rear) * 0.5 - Vector((0.0, 0.0, 0.012)))

    # 2. Lateral Floorpan Sealing Fences (Sill edge Y = 1.00m to -0.90m)
    for side in [1.0, -1.0]:
        fence_front = Vector((side * 0.88,  1.00, 0.102))
        fence_rear  = Vector((side * 0.88, -0.90, 0.102))

        bmesh.ops.create_cube(bm_vortex, size=0.006)
        v_fence = bm_vortex.verts[-8:]
        bmesh.ops.scale(bm_vortex, verts=v_fence, vec=(0.006, 1.90, 0.018))
        bmesh.ops.translate(bm_vortex, verts=v_fence, vec=(fence_front + fence_rear) * 0.5 - Vector((0.0, 0.0, 0.009)))

    # 3. Rear Diffuser Entrance Transition Ramps (Y = -1.65m to -1.82m)
    for side in [1.0, -1.0]:
        ramp_front = Vector((side * 0.32, -1.65, 0.105))
        ramp_rear  = Vector((side * 0.32, -1.82, 0.115))

        bmesh.ops.create_cube(bm_vortex, size=0.01)
        v_ramp = bm_vortex.verts[-8:]
        bmesh.ops.scale(bm_vortex, verts=v_ramp, vec=(0.28, 0.17, 0.010))
        bmesh.ops.translate(bm_vortex, verts=v_ramp, vec=(ramp_front + ramp_rear) * 0.5)

    return link_obj("GEO_F12_UnderbodyVortexGenerators", bm_vortex, parent, mats["carbon_underbody"], bevel=0.001)

# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 18: BRAKE HYDRAULIC LINES & ABS WHEEL SENSORS
# ----------------------------------------------------------------------------
def build_f12_brake_hydraulics_and_sensors(parent, mats):
    """
    Constructs the stainless braided hydraulic brake flex hoses linking chassis
    hardlines to the Brembo calipers, along with ABS wheel speed sensor wire conduits.
    """
    bm_lines = bmesh.new()
    f_axle = 1.380
    r_axle = -1.340
    track_f = 0.8325
    track_r = 0.8490
    wheel_r_f = 0.343
    wheel_r_r = 0.364

    # 1. Front Brake Flex Hoses (Chassis bracket to Caliper inlet)
    for side in [1.0, -1.0]:
        chassis_bracket = Vector((side * 0.52, f_axle - 0.08, 0.38))
        caliper_inlet   = Vector((side * (track_f - 0.06), f_axle + 0.12, wheel_r_f + 0.10))
        mid_sag         = (chassis_bracket + caliper_inlet) * 0.5 + Vector((0.0, -0.04, -0.06))

        # 3-segment braided flex hose curve
        hose_pts = [chassis_bracket, mid_sag, caliper_inlet]
        for h_i in range(len(hose_pts) - 1):
            create_cylinder_between(bm_lines, hose_pts[h_i], hose_pts[h_i+1], radius=0.005, segments=8)

        # Banjo Bolt Fitting at caliper inlet
        res_banjo = bmesh.ops.create_cube(bm_lines, size=1.0)
        bmesh.ops.scale(bm_lines, verts=res_banjo['verts'], vec=(0.012, 0.014, 0.012))
        bmesh.ops.translate(bm_lines, verts=res_banjo['verts'], vec=caliper_inlet)

        # ABS Sensor Wire running along Upper Wishbone
        sensor_chassis = Vector((side * 0.46, f_axle, 0.38))
        sensor_hub     = Vector((side * (track_f - 0.08), f_axle, wheel_r_f + 0.12))
        create_cylinder_between(bm_lines, sensor_chassis, sensor_hub, radius=0.003, segments=6)

    # 2. Rear Brake Flex Hoses (Chassis subframe to Rear Caliper)
    for side in [1.0, -1.0]:
        r_chassis_bracket = Vector((side * 0.54, r_axle - 0.06, 0.40))
        r_caliper_inlet   = Vector((side * (track_r - 0.06), r_axle + 0.10, wheel_r_r + 0.08))
        r_mid_sag         = (r_chassis_bracket + r_caliper_inlet) * 0.5 + Vector((0.0, -0.03, -0.05))

        r_hose_pts = [r_chassis_bracket, r_mid_sag, r_caliper_inlet]
        for h_i in range(len(r_hose_pts) - 1):
            create_cylinder_between(bm_lines, r_hose_pts[h_i], r_hose_pts[h_i+1], radius=0.005, segments=8)

        # Rear Banjo Bolt Fitting
        res_rbanjo = bmesh.ops.create_cube(bm_lines, size=1.0)
        bmesh.ops.scale(bm_lines, verts=res_rbanjo['verts'], vec=(0.012, 0.014, 0.012))
        bmesh.ops.translate(bm_lines, verts=res_rbanjo['verts'], vec=r_caliper_inlet)

    return link_obj("GEO_F12_BrakeHydraulics_Sensors", bm_lines, parent, mats["hydraulic_lines"], bevel=0.001)

# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 19: SPLITTER TENSION STRUTS & FRONT DIFFUSER RAMPS
# ----------------------------------------------------------------------------
def build_f12_splitter_support_rods_and_ramps(parent, mats):
    """
    Constructs the high-rigidity carbon/titanium splitter tension support rods
    linking the carbon chin spoiler to the lower bumper crash structure,
    along with front undertray diffuser expansion ramps and vortex fences.
    """
    bm_struts = bmesh.new()

    # 1. Twin Carbon / Titanium Adjustable Splitter Support Struts
    for s_x in [-0.28, 0.28]:
        rod_bottom = Vector((s_x, 2.30, 0.088))
        rod_top    = Vector((s_x * 0.85, 2.22, 0.220))

        # Carbon Strut Barrel
        create_cylinder_between(bm_struts, rod_bottom, rod_top, radius=0.007, segments=12)

        # Titanium Heim Joint Clevis (Bottom mount)
        res_cb = bmesh.ops.create_cone(bm_struts, cap_ends=True, segments=8, radius1=0.012, radius2=0.012, depth=0.018)
        bmesh.ops.translate(bm_struts, verts=res_cb['verts'], vec=rod_bottom)

        # Titanium Heim Joint Clevis (Top mount)
        res_ct = bmesh.ops.create_cone(bm_struts, cap_ends=True, segments=8, radius1=0.012, radius2=0.012, depth=0.018)
        bmesh.ops.translate(bm_struts, verts=res_ct['verts'], vec=rod_top)

        # Threaded Turnbuckle Adjuster Collar (Center of rod)
        c_p1 = rod_bottom * 0.55 + rod_top * 0.45
        c_p2 = rod_bottom * 0.45 + rod_top * 0.55
        create_cylinder_between(bm_struts, c_p1, c_p2, radius=0.011, segments=8)

    # 2. Front Undertray Inverted Expansion Ramps (Channeling air around front wheels)
    for side in [1.0, -1.0]:
        ramp_pts_f = [
            Vector((side * 0.40, 2.22, 0.088)),
            Vector((side * 0.65, 2.18, 0.088)),
        ]
        ramp_pts_r = [
            Vector((side * 0.42, 1.85, 0.125)),
            Vector((side * 0.70, 1.82, 0.130)),
        ]
        make_quad_strip(bm_struts, ramp_pts_f if side > 0 else ramp_pts_r, ramp_pts_r if side > 0 else ramp_pts_f)

        # Boundary Strakes bordering the front expansion ramps
        strake_f = Vector((side * 0.65, 2.18, 0.088))
        strake_r = Vector((side * 0.70, 1.82, 0.130))
        create_oriented_box_between(bm_struts, strake_f, strake_r, width=0.005, height=0.022)

    return link_obj("GEO_F12_SplitterStruts_Ramps", bm_struts, parent, mats["carbon"], bevel=0.001)

# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 20: REAR DIFFERENTIAL OIL COOLER FAN & SHROUD
# ----------------------------------------------------------------------------
def build_f12_rear_diffuser_cooling_pack(parent, mats):
    """
    Constructs the auxiliary electric cooling fan, circular aerodynamic shroud,
    and radiator matrix mounted atop the rear diffuser throat to cool the E-Diff.
    """
    bm_fan = bmesh.new()
    r_axle = -1.340

    # Diffuser Throat Position (Y = -1.65m, Z = 0.22m)
    pack_center = Vector((0.0, -1.68, 0.24))

    # Radiator Core Matrix (Heat Exchanger Face)
    bmesh.ops.create_cube(bm_fan, size=0.015)
    v_core = bm_fan.verts[-8:]
    bmesh.ops.scale(bm_fan, verts=v_core, vec=(0.32, 0.24, 0.025))
    bmesh.ops.translate(bm_fan, verts=v_core, vec=pack_center)

    # Circular Aerodynamic Fan Shroud
    shroud_center = pack_center + Vector((0.0, 0.0, 0.035))
    bmesh.ops.create_cone(bm_fan, cap_ends=True, segments=24, radius1=0.11, radius2=0.105, depth=0.04)
    v_shroud = bm_fan.verts[-48:]
    bmesh.ops.translate(bm_fan, verts=v_shroud, vec=shroud_center)

    # Electric Fan Motor Hub
    motor_center = shroud_center + Vector((0.0, 0.0, 0.015))
    bmesh.ops.create_cone(bm_fan, cap_ends=True, segments=16, radius1=0.038, radius2=0.036, depth=0.03)
    v_mot = bm_fan.verts[-32:]
    bmesh.ops.translate(bm_fan, verts=v_mot, vec=motor_center)

    # 7 Curved Aerodynamic Fan Blades
    num_blades = 7
    for b_idx in range(num_blades):
        b_ang = 2.0 * math.pi * b_idx / num_blades
        c_b, s_b = math.cos(b_ang), math.sin(b_ang)
        b_pos = motor_center + Vector((0.070 * c_b, 0.070 * s_b, 0.0))

        bmesh.ops.create_cube(bm_fan, size=0.004)
        v_blade = bm_fan.verts[-8:]
        bmesh.ops.scale(bm_fan, verts=v_blade, vec=(0.045, 0.012, 0.003))
        bmesh.ops.rotate(bm_fan, verts=v_blade, matrix=Matrix.Rotation(b_ang, 3, 'Z'))
        bmesh.ops.rotate(bm_fan, verts=v_blade, matrix=Matrix.Rotation(math.radians(28.0), 3, 'X'))
        bmesh.ops.translate(bm_fan, verts=v_blade, vec=b_pos)

    # Aluminum Mounting Brackets to Transaxle Subframe
    for b_side in [1.0, -1.0]:
        brk_start = pack_center + Vector((b_side * 0.16, 0.0, 0.0))
        brk_end   = pack_center + Vector((b_side * 0.26, 0.12, 0.08))
        bmesh.ops.create_cube(bm_fan, size=0.008)
        v_brk = bm_fan.verts[-8:]
        bmesh.ops.scale(bm_fan, verts=v_brk, vec=(0.015, (brk_end - brk_start).length, 0.010))
        bmesh.ops.translate(bm_fan, verts=v_brk, vec=(brk_start + brk_end) * 0.5)

    return link_obj("GEO_F12_RearDiffCoolingPack", bm_fan, parent, mats["black_trim"], bevel=0.001)

# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 21: WINDSHIELD WIPER TRANSMISSION ARTICULATION LINKAGE
# ----------------------------------------------------------------------------
def build_f12_wiper_transmission_mechanism(parent, mats):
    """
    Constructs the concealed under-cowl windshield wiper transmission assembly:
    wiper motor gearbox, eccentric crank arm, tubular drag links, and dual pivot spindles.
    """
    bm_wip = bmesh.new()

    # Wiper Motor & Reduction Gearbox Housing (Y = 0.55m, Z = 0.70m)
    motor_pos = Vector((-0.18, 0.54, 0.71))
    bmesh.ops.create_cone(bm_wip, cap_ends=True, segments=14, radius1=0.035, radius2=0.035, depth=0.075)
    v_mot = bm_wip.verts[-28:]
    bmesh.ops.rotate(bm_wip, verts=v_mot, matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y'))
    bmesh.ops.translate(bm_wip, verts=v_mot, vec=motor_pos)

    # Reduction Gearbox Disc
    gearbox_pos = motor_pos + Vector((0.05, 0.0, 0.0))
    bmesh.ops.create_cone(bm_wip, cap_ends=True, segments=16, radius1=0.048, radius2=0.046, depth=0.025)
    v_gear = bm_wip.verts[-32:]
    bmesh.ops.rotate(bm_wip, verts=v_gear, matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y'))
    bmesh.ops.translate(bm_wip, verts=v_gear, vec=gearbox_pos)

    # Eccentric Crank Arm
    crank_start = gearbox_pos + Vector((0.015, 0.0, 0.0))
    crank_end   = crank_start + Vector((0.0, 0.042, 0.015))
    bmesh.ops.create_cube(bm_wip, size=0.008)
    v_crank = bm_wip.verts[-8:]
    bmesh.ops.scale(bm_wip, verts=v_crank, vec=(0.008, 0.045, 0.012))
    bmesh.ops.translate(bm_wip, verts=v_crank, vec=(crank_start + crank_end) * 0.5)

    # Primary Drag Link Tube (Connecting Crank to Driver Spindle)
    spindle_driver = Vector((-0.35, 0.54, 0.745))
    create_cylinder_between(bm_wip, crank_end, spindle_driver, radius=0.006, segments=8)

    # Secondary Cross Drag Link Tube (Connecting Driver Spindle to Passenger Spindle)
    spindle_pass = Vector((0.15, 0.53, 0.750))
    create_cylinder_between(bm_wip, spindle_driver, spindle_pass, radius=0.006, segments=8)

    # Dual Spindle Die-Cast Mounting Bushing Blocks
    for sp_p in [spindle_driver, spindle_pass]:
        res_sp = bmesh.ops.create_cube(bm_wip, size=1.0)
        bmesh.ops.scale(bm_wip, verts=res_sp['verts'], vec=(0.035, 0.035, 0.025))
        bmesh.ops.translate(bm_wip, verts=res_sp['verts'], vec=sp_p - Vector((0.0, 0.0, 0.018)))

    return link_obj("GEO_F12_WiperTransmissionMechanism", bm_wip, parent, mats["suspension_alloy"], bevel=0.001)

# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 22: DOOR HINGE POCKETS & CHECK-STRAP RECESSES
# ----------------------------------------------------------------------------
def build_f12_door_hinge_pockets_and_checkstraps(parent, mats):
    """
    Constructs the forged aluminum door hinges (upper and lower) and check-strap
    torsion stops nested inside the front fender return jambs (Y = 0.65m to 0.75m).
    """
    bm_hinge = bmesh.new()

    for side in [1.0, -1.0]:
        # Upper Forged Aluminum Door Hinge (Z = 0.58m)
        hinge_up_pos = Vector((side * 0.82, 0.72, 0.58))
        res_hup = bmesh.ops.create_cube(bm_hinge, size=1.0)
        bmesh.ops.scale(bm_hinge, verts=res_hup['verts'], vec=(0.045, 0.050, 0.040))
        bmesh.ops.translate(bm_hinge, verts=res_hup['verts'], vec=hinge_up_pos)

        # Upper Hinge Steel Pivot Pin
        res_pup = bmesh.ops.create_cone(bm_hinge, cap_ends=True, segments=10, radius1=0.007, radius2=0.007, depth=0.055)
        bmesh.ops.translate(bm_hinge, verts=res_pup['verts'], vec=hinge_up_pos)

        # Lower Forged Aluminum Door Hinge (Z = 0.28m)
        hinge_low_pos = Vector((side * 0.84, 0.74, 0.28))
        res_hlow = bmesh.ops.create_cube(bm_hinge, size=1.0)
        bmesh.ops.scale(bm_hinge, verts=res_hlow['verts'], vec=(0.045, 0.050, 0.040))
        bmesh.ops.translate(bm_hinge, verts=res_hlow['verts'], vec=hinge_low_pos)

        # Lower Hinge Steel Pivot Pin
        res_plow = bmesh.ops.create_cone(bm_hinge, cap_ends=True, segments=10, radius1=0.007, radius2=0.007, depth=0.055)
        bmesh.ops.translate(bm_hinge, verts=res_plow['verts'], vec=hinge_low_pos)

        # Door Check-Strap Torsion Brake Arm (Z = 0.42m)
        check_pos = Vector((side * 0.83, 0.73, 0.42))
        res_check = bmesh.ops.create_cube(bm_hinge, size=1.0)
        bmesh.ops.scale(bm_hinge, verts=res_check['verts'], vec=(0.015, 0.065, 0.022))
        bmesh.ops.translate(bm_hinge, verts=res_check['verts'], vec=check_pos)

        # Rubber Bellows Weatherstrip Boot around Check-Strap Aperture
        res_boot = bmesh.ops.create_cube(bm_hinge, size=1.0)
        bmesh.ops.scale(bm_hinge, verts=res_boot['verts'], vec=(0.028, 0.035, 0.035))
        bmesh.ops.translate(bm_hinge, verts=res_boot['verts'], vec=check_pos + Vector((-0.02 * side, 0.0, 0.0)))

    return link_obj("GEO_F12_DoorHinges_Checkstraps", bm_hinge, parent, mats["suspension_alloy"], bevel=0.002)

# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 23: ACTIVE REAR DIFFUSER FLAPS & ELECTRIC SERVOMOTORS
# ----------------------------------------------------------------------------
def build_f12_active_rear_diffuser_flaps(parent, mats):
    """
    Constructs the patented active rear diffuser aerodynamic flaps and servomotors:
    Electric actuator step-motors and dynamic carbon flaps situated inside the
    diffuser tunnels that adjust flap angle at high speed to optimize the drag/downforce ratio.
    """
    bm_aflaps = bmesh.new()

    # Left and Right Active Diffuser Venturi Channels
    for side in [1.0, -1.0]:
        for ch_idx, ch_x in enumerate([0.28, 0.50]):
            fx = side * ch_x
            fy = -2.15
            fz = 0.20

            # Carbon Trailing Dynamic Flap (Angled 14 degrees down in downforce mode)
            flap_pos = Vector((fx, fy, fz))
            res_flap = bmesh.ops.create_cube(bm_aflaps, size=1.0)
            bmesh.ops.scale(bm_aflaps, verts=res_flap['verts'], vec=(0.14, 0.16, 0.005))
            bmesh.ops.rotate(bm_aflaps, verts=res_flap['verts'], matrix=Matrix.Rotation(math.radians(-14.0), 3, 'X'))
            bmesh.ops.translate(bm_aflaps, verts=res_flap['verts'], vec=flap_pos)

            # Transverse Pivot Pin Axle
            res_pax = bmesh.ops.create_cone(bm_aflaps, cap_ends=True, segments=8, radius1=0.004, radius2=0.004, depth=0.15)
            v_pax = res_pax['verts']
            bmesh.ops.rotate(bm_aflaps, verts=v_pax, matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y'))
            bmesh.ops.translate(bm_aflaps, verts=v_pax, vec=flap_pos + Vector((0.0, 0.07, 0.01)))

            # Electric Stepper Actuator Motor Housing
            act_pos = flap_pos + Vector((side * 0.065, 0.05, 0.045))
            res_act = bmesh.ops.create_cone(bm_aflaps, cap_ends=True, segments=10, radius1=0.016, radius2=0.016, depth=0.045)
            bmesh.ops.translate(bm_aflaps, verts=res_act['verts'], vec=act_pos)

            # Actuator Linkage Pushrod
            rod_start = act_pos
            rod_end   = flap_pos + Vector((side * 0.05, -0.04, 0.0))
            create_cylinder_between(bm_aflaps, rod_start, rod_end, radius=0.003, segments=6)

    return link_obj("GEO_F12_ActiveRearDiffuserFlaps", bm_aflaps, parent, mats["carbon"], bevel=0.001)

# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 24: HOOD LATCH STRIKE PINS & FENDER WATER BAFFLES
# ----------------------------------------------------------------------------
def build_f12_hood_latches_and_rain_baffles(parent, mats):
    """
    Constructs the dual front hood latch strike pins, safety catch claw,
    and molded rubber rain water runoff baffles along the inner fender gutters.
    """
    bm_latch = bmesh.new()

    # 1. Dual Hood Lock Catch Strike Pins (Bilateral on front radiator bulkhead)
    for side in [1.0, -1.0]:
        latch_pos = Vector((side * 0.44, 2.14, 0.42))

        # Zinc-plated Steel Latch Catch Pocket Box
        res_lbox = bmesh.ops.create_cube(bm_latch, size=1.0)
        bmesh.ops.scale(bm_latch, verts=res_lbox['verts'], vec=(0.045, 0.035, 0.030))
        bmesh.ops.translate(bm_latch, verts=res_lbox['verts'], vec=latch_pos)

        # Chrome U-Bolt Strike Pin
        res_lpin = bmesh.ops.create_cone(bm_latch, cap_ends=True, segments=8, radius1=0.004, radius2=0.004, depth=0.024)
        bmesh.ops.translate(bm_latch, verts=res_lpin['verts'], vec=latch_pos + Vector((0.0, 0.0, 0.020)))

        # Inner Fender EPDM Water Runoff Gutter Bulb Seal
        g_start = Vector((side * 0.72, 2.05, 0.46))
        g_end   = Vector((side * 0.76, 0.65, 0.72))
        create_cylinder_between(bm_latch, g_start, g_end, radius=0.006, segments=8)

    # 2. Central Secondary Safety Release Claw Catch
    safety_pos = Vector((0.0, 2.22, 0.40))
    res_safe = bmesh.ops.create_cube(bm_latch, size=1.0)
    bmesh.ops.scale(bm_latch, verts=res_safe['verts'], vec=(0.035, 0.040, 0.025))
    bmesh.ops.translate(bm_latch, verts=res_safe['verts'], vec=safety_pos)

    # Safety Hook Lever
    res_hook = bmesh.ops.create_cone(bm_latch, cap_ends=True, segments=6, radius1=0.004, radius2=0.004, depth=0.035)
    v_hook = res_hook['verts']
    bmesh.ops.rotate(bm_latch, verts=v_hook, matrix=Matrix.Rotation(math.radians(35.0), 3, 'X'))
    bmesh.ops.translate(bm_latch, verts=v_hook, vec=safety_pos + Vector((0.0, 0.015, 0.020)))

    return link_obj("GEO_F12_HoodLatches_Baffles", bm_latch, parent, mats["titanium"], bevel=0.001)

# ----------------------------------------------------------------------------
# 28. MASTER BUILD ORCHESTRATOR & DUAL-MODE GLB EXPORTER
# ----------------------------------------------------------------------------
def build_ferrari_f12berlinetta_phase1():
    """
    Executes the complete Phase 1 Procedural CAD Pipeline for the Ferrari F12berlinetta.
    Constructs and exports the watertight body, staggered 20" forged wheels,
    carbon ceramic brakes, optical greenhouse glass, underbody, and diffuser.
    """
    print("=" * 80)
    print("STARTING PROCEDURAL BUILD: Ferrari F12berlinetta (2010s Grand Tourer)")
    print("PHASE 1: Full Exterior Body Sculpture, Aerodynamics, Wheels & Glass")
    print("=" * 80)

    # 1. Non-destructive Scene Purge
    safe_scene_purge()

    # 2. Material Factory
    mats = create_f12_materials()

    # 3. Master Root Hierarchy Node
    root_obj = bpy.data.objects.new("Ferrari_F12berlinetta_MasterRoot", None)
    root_obj.empty_display_type = 'ARROWS'
    root_obj.empty_display_size = 0.5
    bpy.context.scene.collection.objects.link(root_obj)

    # 4. Monocoque Watertight Body Shell with Open Wheel Arches
    print("-> Lofting Class-A Monocoque Body Shell with Open Wheel Arches...")
    build_f12_monocoque_body_shell(root_obj, mats)

    # 5. Optical Dielectric Greenhouse Glass & Privacy Tub
    print("-> Building Optical Dielectric Greenhouse & Privacy Tub...")
    build_f12_greenhouse_glass(root_obj, mats)

    # 6. Flush Greenhouse Mounting Flanges & B-Pillar Appliques
    print("-> Fitting Flush Window Mounting Sills & B-Pillar Appliques...")
    build_f12_greenhouse_mounting_flanges(root_obj, mats)

    # 7. Enclosed Wheel Arch Liners (Matte Black)
    print("-> Fitting Enclosed Matte Black Wheel Arch Liners...")
    build_f12_wheel_arch_liners(root_obj, mats)

    # 8. Front & Rear Aluminum Chassis Frame & Crash Structure
    print("-> Constructing Front & Rear Aluminum Chassis Rails & Crash Beams...")
    build_f12_front_chassis_frame(root_obj, mats)
    build_f12_rear_chassis_subframe(root_obj, mats)

    # 9. Suspension Subframe Linkages & Dampers
    print("-> Constructing Forged Suspension Wishbones & Coilover Dampers...")
    build_f12_suspension_hardware(root_obj, mats)

    # 10. Brake Hydraulic Lines & ABS Wheel Sensors
    print("-> Routing Stainless Braided Brake Flex Hoses & ABS Harnesses...")
    build_f12_brake_hydraulics_and_sensors(root_obj, mats)

    # 11. Underbody Aerodynamic Channels & Heat Exchanger Ducts
    print("-> Fabricating Underbody Venturi Channels & Transmission Cooler Ducts...")
    build_f12_underbody_aero_ducts(root_obj, mats)

    # 12. Underbody Ground-Effect Vortex Generators & Fences
    print("-> Mounting Underbody Vortex Generators & Floorpan Fences...")
    build_f12_underbody_vortex_generators(root_obj, mats)

    # 13. Radiator Assemblies & Heat Exchanger Core
    print("-> Constructing Radiator Matrices & Auxiliary Heat Exchangers...")
    build_f12_radiator_assemblies(root_obj, mats)

    # 14. Active Brake Cooling Flaps & Actuators
    print("-> Fitting Active Aerodynamic Brake Cooling Louver Flaps...")
    build_f12_active_aero_flaps(root_obj, mats)

    # 15. Aero Bridge Internal Flow Canals & Vortex Strakes
    print("-> Sculpting Aero Bridge Internal Airflow Canals...")
    build_f12_aero_bridge_internal_canals(root_obj, mats)

    # 16. Windshield Cowl Intake Screen & Wiper Well
    print("-> Constructing Cowl Ventilation Screen & Washer Nozzles...")
    build_f12_cowl_intake_screen(root_obj, mats)

    # 17. Windshield Wiper Transmission Articulation Linkage
    print("-> Installing Concealed Under-Cowl Wiper Drive Linkages...")
    build_f12_wiper_transmission_mechanism(root_obj, mats)

    # 18. Quarter Panel Fuel Filler Housing Pocket
    print("-> Installing Right Rear Haunch Fuel Filler Pocket & Billet Cap...")
    build_f12_fuel_filler_pocket(root_obj, mats)

    # 19. Competition Rear Diffuser & Quad Inconel Exhausts
    print("-> Fabricating Carbon Diffuser Strakes & Inconel Quad Exhausts...")
    build_f12_rear_diffuser_and_exhausts(root_obj, mats)

    # 20. Rear Differential Oil Cooler Fan & Shroud Pack
    print("-> Fitting Rear Diffuser Oil Cooler Suction Fan & Shroud...")
    build_f12_rear_diffuser_cooling_pack(root_obj, mats)

    # 21. Active Rear Diffuser Dynamic Aerodynamic Flaps
    print("-> Installing Active Rear Diffuser Dynamic Flaps & Actuators...")
    build_f12_active_rear_diffuser_flaps(root_obj, mats)

    # 22. Carbon Front Splitter & Base Lighting Housings
    print("-> Fabricating Carbon Front Splitter & Base Lamp Housings...")
    build_f12_splitter_and_base_lighting(root_obj, mats)

    # 23. Splitter Tension Support Struts & Front Diffuser Ramps
    print("-> Installing Carbon Splitter Tension Struts & Under-Splitter Ramps...")
    build_f12_splitter_support_rods_and_ramps(root_obj, mats)

    # 24. Door Hinge Pockets & Check-Strap Recesses
    print("-> Installing Forged Door Hinge Pockets & Torsion Check-Straps...")
    build_f12_door_hinge_pockets_and_checkstraps(root_obj, mats)

    # 25. Hood Lock Strike Pins & Fender Water Runoff Baffles
    print("-> Fitting Hood Bulkhead Latches & Rain Runoff Gutter Seals...")
    build_f12_hood_latches_and_rain_baffles(root_obj, mats)

    # 26. 20-Inch Staggered Forged Alloy Wheels & Brembo Brakes
    print("-> Engineering 20-Inch Forged Staggered Wheels & Carbon Ceramic Brakes...")
    wheel_configs = [
        ("FL", Vector((-0.8325,  1.380, 0.343)), True,  0.343, 0.255, 0.254),
        ("FR", Vector(( 0.8325,  1.380, 0.343)), False, 0.343, 0.255, 0.254),
        ("RL", Vector((-0.8490, -1.340, 0.364)), True,  0.364, 0.315, 0.254),
        ("RR", Vector(( 0.8490, -1.340, 0.364)), False, 0.364, 0.315, 0.254),
    ]
    for w_name, w_pos, is_l, w_r, t_w, r_r in wheel_configs:
        build_f12_wheel_assembly(root_obj, mats, w_name, w_pos, is_left=is_l, wheel_r=w_r, tire_w=t_w, rim_r=r_r)

    # 27. Dual-Mode GLB Export
    print("-> Exporting Master GLBs (Y-Up, Applied Modifiers, Normals)...")
    for target_path in [PUBLIC_TARGET, PUBLIC_CAR_TARGET, EXPORTS_DIR]:
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        bpy.ops.export_scene.gltf(
            filepath=target_path,
            export_format='GLB',
            use_selection=False,
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT'
        )
        file_size = os.path.getsize(target_path)
        print(f"   [OK] Exported: {target_path} ({file_size:,} bytes)")

    print("=" * 80)
    print("PHASE 1 PROCEDURAL BUILD COMPLETE: Ferrari F12berlinetta")
    print("=" * 80)

build_ferrari_f12_berlinetta_master = build_ferrari_f12berlinetta_phase1

if __name__ == "__main__":
    build_ferrari_f12berlinetta_phase1()

