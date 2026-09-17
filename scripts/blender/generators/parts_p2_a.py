"""
Porsche 911 (993) Carrera Cabriolet — Phase 16: Part A
Header, Showroom PBR Materials Suite, Compatibility Polyfills,
Subsystem 1: Polyellipsoid Headlamps & Projector Optics
Subsystem 2: Front Turn Signals & Halogen Fog Lamps
"""

PART_P2_A = '''"""
=============================================================================
Procedural Class-A CAD Generator: Porsche 911 Carrera Cabriolet (993)
PHASE 16: Micro-Detailing, Exterior Jewelry, Lighting Optics & Badging
=============================================================================
Convertible Architecture · 1990s Era Pure Sports Roadster Icon (1994–1998 Type 993)
Manufactured in Stuttgart-Zuffenhausen, Germany.
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Phase 16 Architectural Scope:
1. Complete PBR Material Suite for Micro-Jewelry:
   - Porsche Guards Red (Indischrot) Two-Stage Clearcoat (#C8102E, Clearcoat 1.0)
   - Mirror-Polished High-Gloss Automotive Chrome (#F4F6F9, Metallic 0.98, Roughness 0.03)
   - Fluted Bosch Polycarbonate Headlamp Lens (Transmission 0.94, IOR 1.52, Roughness 0.03)
   - Spherical Polyellipsoid Projector Lens (Transmission 0.98, IOR 1.54, Roughness 0.01)
   - Parabolic Vapor-Deposited Reflector Chrome (Metallic 0.99, Roughness 0.02)
   - Patented Heckleuchtenband Ruby Red Reflector Lens (#990008, Transmission 0.72)
   - Porsche Turn Indicator High-Intensity Amber (#E66A00, Transmission 0.75)
   - Crystal Clear Reverse Lamp Prismatic Lens (#EEF2F6, Transmission 0.88)
   - 24-Karat Gold Stuttgart Coat-of-Arms Plating (#D4AF37, Metallic 0.92, Roughness 0.20)
   - Cloisonné Enamel Red (#990505) and Gloss Black (#080808) for Wappen Heraldry
   - Mirror Glass First-Surface Chrome Backing (#F8FAFD, Metallic 1.0, Roughness 0.01)
   - Inconel Polished Stainless Exhaust Tips (#C8CCD0, Metallic 0.92, Roughness 0.12)
   - Exhaust Inner Matte Soot Baffle (#111112, Roughness 0.96)
   - Satin Black EPDM Weatherstrip Rubber (#121316, Roughness 0.68)
   - Sonnenland Triple-Layer German Canvas Fabric (#0C0C0E, Roughness 0.96)
2. Precision CAD Subsystems:
   - Polyellipsoid Low-Beam Projector Headlamps & Parabolic High-Beam Reflectors
   - Front Bumper Integrated Turn Indicators & Halogen Fog Lamp Units
   - Iconic Full-Width Heckleuchtenband Rear Reflector Light Bar with "PORSCHE" script
   - Polished Double-Walled Oval Exhaust Tips with Matte Soot Inner Bore
   - Aerodynamic Teardrop Cup Side View Mirrors with Aspheric Glass
   - Recessed Door Handles with Pull Trigger & Keylock Tumbler
   - Enamel Stuttgart Porsche Hood Crest Wappen Badge (Gold / Red / Black Shield)
   - Raised 3D Cursive "Carrera" Rear Decklid Badging
   - Retractable Spoiler Airflow Louvers & Rubber Accordion Bellows
   - Cabriolet Tenax Chrome Fasteners, Welt Cords & Canvas Stitching
   - Windshield Reveal Molding & Articulated Pantograph Wipers
   - Front Bumper Polyurethane Chin Spoiler Lip & Wheel Spats
   - Flared Rear Hip Transparent Stone-Guard Decals & Door Sill Plates
   - Cup II Wheel Center Caps with Porsche Crest & Chrome Valve Stems
   - Right Front Fender Fuel Filler Flap & Finger Release Notch
   - Cockpit Interior Rearview Mirror, Sun Visors & Seatbelt Guides
   - Rear Engine Lid Catch, Safety Latches & Engine Bay Decals
   - Master Vehicle Integration, Statistical Verification & 3-Target GLB Export
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

# Import Phase 15 Foundation Builder functions
from generate_porsche_993_cabriolet_phase1 import (
    build_993_monocoque_body_shell,
    build_993_cabriolet_soft_top_and_tonneau_boot,
    build_993_underbody_chassis_and_wheel_tubs,
    build_993_cup2_wheels_and_tires,
    build_993_polyurethane_bumpers_and_lighting_envelopes,
    build_993_front_macpherson_struts_and_steering_rack,
    build_993_lsa_multilink_rear_suspension_and_subframe,
    build_993_air_cooled_36l_flat_six_boxer_powertrain,
    build_993_exhaust_system_heat_exchangers_and_dual_tailpipes,
    build_993_front_frunk_tub_spare_wheel_and_battery_box,
    build_993_front_oil_cooler_and_ac_condenser_pack,
    build_993_chassis_pinchwelds_jacking_pucks_and_drainage,
    build_993_windshield_cowl_louvers_and_monoblade_wipers,
    build_993_rear_retractable_spoiler_mechanism_and_grille,
    build_993_cockpit_interior_tub_and_sports_seats,
    build_993_front_luggage_lid_hinges_and_gas_struts,
    build_993_rear_decklid_hinges_and_fan_shroud,
    build_993_hydraulic_brake_lines_and_fuel_tank,
    build_993_chassis_reinforcement_crossbraces,
    build_993_underfloor_aero_strakes_and_diffuser_tunnels,
    build_993_front_subframe_crossmember_and_anti_roll_bar,
    build_993_rear_swaybar_and_lsa_drop_links,
    build_993_oil_thermostat_and_external_sill_lines,
    build_993_dry_sump_oil_tank_and_filter_console,
    build_993_varioram_induction_system_and_plenum,
    build_993_twin_spark_dual_distributor_and_ignition_harness,
    build_993_rear_axle_half_shafts_and_cv_boots,
    build_993_front_brake_cooling_ducts_and_air_guides,
    build_993_cabriolet_rear_diagonal_reinforcement_k_braces,
    build_993_washer_fluid_reservoir_and_brake_booster_assembly,
    build_993_transmission_shift_linkage_and_tunnel_shaft,
    build_993_cockpit_five_gauge_binnacle_and_steering_wheel,
    get_materials_suite as get_p1_materials_suite,
)

# ----------------------------------------------------------------------------
# COMPATIBILITY POLYFILLS & CORE UTILITIES
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


def weld_and_smooth(bm, obj, auto_smooth_angle_deg=34.0, weld_dist=0.0008):
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=weld_dist)
    for f in bm.faces:
        f.smooth = True
    bm.to_mesh(obj.data)
    obj.data.update()
    if hasattr(obj.data, "use_auto_smooth"):
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = math.radians(auto_smooth_angle_deg)
    else:
        for p in obj.data.polygons:
            p.use_smooth = True


def link_obj(name, bm, col, mat=None, bevel=0.002):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    weld_and_smooth(bm, obj)
    bm.free()
    col.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    if bevel > 0.0001:
        mod = obj.modifiers.new("Bevel", 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        mod.limit_method = 'ANGLE'
        mod.angle_limit = math.radians(34)
    mod_wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    mod_wn.keep_sharp = True
    return obj


# ----------------------------------------------------------------------------
# SHOWROOM PBR MATERIAL SUITE (PHASE 16 JEWELRY SPECIFICATION)
# ----------------------------------------------------------------------------

def get_phase2_materials_suite():
    mats = {}

    def _ensure_mat(name):
        mat = bpy.data.materials.get(name)
        if not mat:
            mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        return mat

    # 1. Guards Red (Indischrot) Bodywork
    mat_red = _ensure_mat("PORSCHE_GuardsRed_Jewelry")
    bsdf = mat_red.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.784, 0.063, 0.180, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.08
        if "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = 1.0
            bsdf.inputs["Clearcoat Roughness"].default_value = 0.03
        elif "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = 1.0
            bsdf.inputs["Coat Roughness"].default_value = 0.03
    mats["body"] = mat_red

    # 2. Mirror-Polished Automotive Chrome
    mat_chrome = _ensure_mat("PORSCHE_Mirror_Chrome")
    bsdf = mat_chrome.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.95, 0.96, 0.98, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.98
        bsdf.inputs["Roughness"].default_value = 0.03
    mats["chrome"] = mat_chrome

    # 3. Fluted Polycarbonate Headlamp Glass
    mat_hl_glass = _ensure_mat("PORSCHE_Fluted_Headlamp_Glass")
    bsdf = mat_hl_glass.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.96, 0.98, 1.00, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.04
        bsdf.inputs["IOR"].default_value = 1.52
        if "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.94
        elif "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.94
    mats["hl_glass"] = mat_hl_glass

    # 4. Spherical Projector Glass Optic
    mat_proj = _ensure_mat("PORSCHE_Projector_Optic_Glass")
    bsdf = mat_proj.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.98, 0.99, 1.00, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.01
        bsdf.inputs["IOR"].default_value = 1.54
        if "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.98
        elif "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.98
    mats["projector"] = mat_proj

    # 5. Parabolic Chrome Reflector
    mat_refl = _ensure_mat("PORSCHE_Headlamp_Reflector_Chrome")
    bsdf = mat_refl.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.98, 0.98, 0.99, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.99
        bsdf.inputs["Roughness"].default_value = 0.02
    mats["reflector"] = mat_refl

    # 6. Ruby Red Heckleuchtenband Tail Lamp
    mat_tl_red = _ensure_mat("PORSCHE_Heckleuchtenband_RubyRed")
    bsdf = mat_tl_red.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.60, 0.00, 0.03, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.12
        bsdf.inputs["IOR"].default_value = 1.55
        if "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.72
        elif "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.72
    mats["tl_red"] = mat_tl_red

    # 7. High-Intensity Indicator Amber
    mat_amber = _ensure_mat("PORSCHE_TurnIndicator_Amber")
    bsdf = mat_amber.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.90, 0.42, 0.00, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.12
        bsdf.inputs["IOR"].default_value = 1.53
        if "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.75
        elif "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.75
    mats["amber"] = mat_amber

    # 8. Crystal Clear Prismatic Reverse Lamp
    mat_rev = _ensure_mat("PORSCHE_Reverse_Prismatic_Clear")
    bsdf = mat_rev.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.93, 0.95, 0.97, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.15
        bsdf.inputs["IOR"].default_value = 1.52
        if "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.88
        elif "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.88
    mats["reverse"] = mat_rev

    # 9. 24-Karat Gold Plating (Porsche Crest)
    mat_gold = _ensure_mat("PORSCHE_Crest_Gold_Leaf")
    bsdf = mat_gold.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.83, 0.69, 0.22, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.92
        bsdf.inputs["Roughness"].default_value = 0.20
    mats["gold"] = mat_gold

    # 10. Cloisonné Enamel Red (Crest Stripes)
    mat_enamel_red = _ensure_mat("PORSCHE_Crest_Enamel_Red")
    bsdf = mat_enamel_red.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.60, 0.02, 0.02, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.05
    mats["enamel_red"] = mat_enamel_red

    # 11. Cloisonné Enamel Black (Crest Antlers & Ross Horse)
    mat_enamel_black = _ensure_mat("PORSCHE_Crest_Enamel_Black")
    bsdf = mat_enamel_black.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.03, 0.03, 0.03, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.05
    mats["enamel_black"] = mat_enamel_black

    # 12. Polished Stainless Exhaust Steel
    mat_exh = _ensure_mat("PORSCHE_Polished_Exhaust_Stainless")
    bsdf = mat_exh.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.78, 0.80, 0.82, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.92
        bsdf.inputs["Roughness"].default_value = 0.12
    mats["exhaust_pipe"] = mat_exh

    # 13. Matte Carbon Soot Exhaust Bore
    mat_soot = _ensure_mat("PORSCHE_Exhaust_Inner_Soot")
    bsdf = mat_soot.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.065, 0.065, 0.070, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.96
    mats["soot"] = mat_soot

    # 14. First-Surface Optical Chrome Mirror Backing
    mat_mirror = _ensure_mat("PORSCHE_Mirror_Reflective_Glass")
    bsdf = mat_mirror.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.97, 0.98, 0.99, 1.0)
        bsdf.inputs["Metallic"].default_value = 1.00
        bsdf.inputs["Roughness"].default_value = 0.01
    mats["mirror_glass"] = mat_mirror

    # 15. Satin Rubber Weatherstrips & Gaskets
    mat_rubber = _ensure_mat("PORSCHE_Satin_Rubber_Gaskets")
    bsdf = mat_rubber.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.07, 0.075, 0.085, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.68
    mats["rubber"] = mat_rubber

    # 16. Satin Cup II Cast Alloy Silver
    mat_alloy = _ensure_mat("PORSCHE_Cup2_CastAlloy_Satin")
    bsdf = mat_alloy.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.82, 0.83, 0.85, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.88
        bsdf.inputs["Roughness"].default_value = 0.22
    mats["alloy"] = mat_alloy

    # 17. Sonnenland Canvas Fabric (Cabriolet Roof)
    mat_canvas = _ensure_mat("PORSCHE_Sonnenland_German_Canvas")
    bsdf = mat_canvas.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.055, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.96
    mats["canvas"] = mat_canvas

    return mats


# ----------------------------------------------------------------------------
# 1. SUBSYSTEM 1: POLYELLIPSOID HEADLAMPS & PROJECTOR OPTICS
# ----------------------------------------------------------------------------

def build_993_polyellipsoid_headlamps_and_projectors(parent_col, mats):
    """
    Constructs the signature Type 993 sloping front fender headlamps:
    - Left and right recessed sloping oval fender headlamp housings (Y = +1.680m, Z = 0.685m).
    - Heavy polished chrome retaining bezel ring with chamfered inner edge.
    - Spherical convex polyellipsoid projector glass optic for low beam.
    - Chrome parabolic reflector dish with halogen filament bulb for high beam.
    - Slanted fluted Bosch ECE/DOT prismatic polycarbonate outer lens.
    - Telescoping high-pressure twin headlamp washer chrome nozzles on bumper.
    """
    objs = []
    bm_hl = bmesh.new()
    bm_glass = bmesh.new()
    bm_refl = bmesh.new()
    bm_proj = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        # Sloping Fender Headlamp Axis: X = +/- 0.585m, Y = +1.680m, Z = 0.685m
        # Slanted back at ~28 degrees, angled inward ~6 degrees
        mat_hl_base = Matrix.Translation(Vector((hx_sign * 0.585, 1.680, 0.685))) @ Euler((math.radians(-28), hx_sign * math.radians(-6), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Polished Chrome Outer Retaining Ring Bezel
        bmesh.ops.create_cylinder(bm_hl, radius=0.125, depth=0.045, segments=32, matrix=mat_hl_base @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Chrome Inner Step Ring
        bmesh.ops.create_cylinder(bm_hl, radius=0.116, depth=0.050, segments=32, matrix=mat_hl_base @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Outer Fluted Polycarbonate Lens Cover
        mat_lens = mat_hl_base @ Matrix.Translation(Vector((0, 0.022, 0)))
        bmesh.ops.create_cylinder(bm_glass, radius=0.114, depth=0.015, segments=32, matrix=mat_lens @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Fine Prismatic Fluting Ribs across the glass surface
        for rib_idx in range(-7, 8):
            rx_off = rib_idx * 0.013
            mat_rib = mat_lens @ Matrix.Translation(Vector((rx_off, 0.008, 0)))
            bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_rib @ Matrix.Diagonal(Vector((0.003, 0.004, 0.160, 1.0))))

        # 3. Low-Beam Spherical Polyellipsoid Projector Lens (Lower/Outer chamber)
        mat_proj_pos = mat_hl_base @ Matrix.Translation(Vector((hx_sign * 0.025, -0.015, -0.020)))
        # Projector Shroud Ring
        bmesh.ops.create_cylinder(bm_refl, radius=0.048, depth=0.035, segments=24, matrix=mat_proj_pos @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Glass Convex Projector Optic
        bmesh.ops.create_cylinder(bm_proj, radius=0.040, depth=0.022, segments=24, matrix=mat_proj_pos @ Matrix.Translation(Vector((0, 0.012, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 4. High-Beam Parabolic Reflector Bowl & Halogen Bulb (Upper/Inner chamber)
        mat_high_pos = mat_hl_base @ Matrix.Translation(Vector((hx_sign * -0.030, -0.020, 0.030)))
        # Parabolic Chrome Cup
        bmesh.ops.create_cylinder(bm_refl, radius=0.045, depth=0.040, segments=20, matrix=mat_high_pos @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Halogen H1 Bulb Filament Tip
        mat_bulb = mat_high_pos @ Matrix.Translation(Vector((0, 0.010, 0)))
        bmesh.ops.create_cylinder(bm_hl, radius=0.008, depth=0.024, segments=12, matrix=mat_bulb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 5. Telescoping Twin Jet Headlamp Washer Nozzle on Front Bumper (Y = +1.860m, Z = 0.585m)
        mat_washer = Matrix.Translation(Vector((hx_sign * 0.550, 1.860, 0.585))) @ Euler((math.radians(22), hx_sign * math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_hl, radius=0.014, depth=0.020, segments=14, matrix=mat_washer)
        # Dual Spray Jet Orifices
        for j_off in [-0.005, 0.005]:
            mat_jet = mat_washer @ Matrix.Translation(Vector((j_off, 0, 0.012)))
            bmesh.ops.create_cylinder(bm_hl, radius=0.0025, depth=0.006, segments=8, matrix=mat_jet)

    obj_hl = link_obj("GEO_993_Headlamp_Bezels_and_Washers", bm_hl, parent_col, mats["chrome"], bevel=0.0015)
    obj_glass = link_obj("GEO_993_Headlamp_Fluted_Outer_Lenses", bm_glass, parent_col, mats["hl_glass"], bevel=0.001)
    obj_refl = link_obj("GEO_993_Headlamp_Internal_Reflectors", bm_refl, parent_col, mats["reflector"], bevel=0.001)
    obj_proj = link_obj("GEO_993_Headlamp_Projector_Spheres", bm_proj, parent_col, mats["projector"], bevel=0.001)

    objs.extend([obj_hl, obj_glass, obj_refl, obj_proj])
    return objs

# ----------------------------------------------------------------------------
# 2. SUBSYSTEM 2: FRONT TURN SIGNALS & HALOGEN FOG LAMPS
# ----------------------------------------------------------------------------

def build_993_front_turn_signals_and_fog_lamps(parent_col, mats):
    """
    Constructs the wrap-around dual-chamber front bumper light clusters:
    - Integrated into the polyurethane front bumper valance (Y = +1.960m, Z = 0.410m).
    - Outer Chamber: Curved amber turn indicator lens with horizontal Fresnel fluting.
    - Inner Chamber: Crystal-clear halogen fog lamp with parabolic chrome reflector bowl.
    - Satin black perimeter rubber bezel seal flush with bumper skin.
    """
    objs = []
    bm_amber = bmesh.new()
    bm_clear = bmesh.new()
    bm_refl = bmesh.new()
    bm_bezel = bmesh.new()

    for bx_sign in [-1.0, 1.0]:
        # Cluster Center: X = +/- 0.610m, Y = +1.950m, Z = 0.410m
        mat_cluster = Matrix.Translation(Vector((bx_sign * 0.610, 1.950, 0.410))) @ Euler((0, bx_sign * math.radians(-18), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Outer Perimeter Satin Rubber Bezel Trim
        bmesh.ops.create_cube(bm_bezel, size=1.0, matrix=mat_cluster @ Matrix.Diagonal(Vector((0.260, 0.045, 0.082, 1.0))))

        # 2. Outer Amber Turn Signal Lens (X offset towards fender corner)
        mat_turn = mat_cluster @ Matrix.Translation(Vector((bx_sign * 0.065, 0.015, 0.000)))
        bmesh.ops.create_cube(bm_amber, size=1.0, matrix=mat_turn @ Matrix.Diagonal(Vector((0.115, 0.024, 0.070, 1.0))))

        # Amber Lens Prismatic Flutes
        for f_idx in range(-2, 3):
            mat_flute = mat_turn @ Matrix.Translation(Vector((0, 0.013, f_idx * 0.014)))
            bmesh.ops.create_cylinder(bm_amber, radius=0.004, depth=0.105, segments=8, matrix=mat_flute @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Inner Halogen Fog Lamp Clear Lens (X offset towards center)
        mat_fog = mat_cluster @ Matrix.Translation(Vector((bx_sign * -0.055, 0.015, 0.000)))
        bmesh.ops.create_cube(bm_clear, size=1.0, matrix=mat_fog @ Matrix.Diagonal(Vector((0.115, 0.024, 0.070, 1.0))))

        # Fog Lamp Parabolic Reflector Housing
        mat_fog_refl = mat_fog @ Matrix.Translation(Vector((0, -0.016, 0.000)))
        bmesh.ops.create_cylinder(bm_refl, radius=0.032, depth=0.035, segments=16, matrix=mat_fog_refl @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_amber = link_obj("GEO_993_Front_TurnSignal_Amber_Lenses", bm_amber, parent_col, mats["amber"], bevel=0.001)
    obj_clear = link_obj("GEO_993_Front_FogLamp_Clear_Lenses", bm_clear, parent_col, mats["reverse"], bevel=0.001)
    obj_refl = link_obj("GEO_993_Front_FogLamp_Chrome_Reflectors", bm_refl, parent_col, mats["reflector"], bevel=0.001)
    obj_bezel = link_obj("GEO_993_Front_Bumper_Lamp_Gaskets", bm_bezel, parent_col, mats["rubber"], bevel=0.0015)

    objs.extend([obj_amber, obj_clear, obj_refl, obj_bezel])
    return objs
'''
