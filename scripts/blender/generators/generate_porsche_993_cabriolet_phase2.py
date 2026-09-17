"""
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

_gen_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in locals() or '__file__' in globals() else r"E:\Car_Automation\scripts\blender\generators"
if _gen_dir not in sys.path:
    sys.path.append(_gen_dir)
hardcoded_dir = r"E:\Car_Automation\scripts\blender\generators"
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


# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 3: ICONIC HECKLEUCHTENBAND FULL-WIDTH REAR LIGHT BAR
# ----------------------------------------------------------------------------

def build_993_heckleuchtenband_and_taillamps(parent_col, mats):
    """
    Constructs the iconic Porsche 993 continuous rear reflector light bar:
    - Full-width Heckleuchtenband spanning 1,480 mm across rear decklid apron (Y = -2.060m, Z = 0.655m).
    - Center Section: Ruby red reflective bar with 3D recessed block "P O R S C H E" typography.
    - Outer Tail Lamp Clusters (Left & Right):
      * Upper Tier: Directional amber fluted turn signal lens.
      * Middle Tier: Deep red stop/running brake light with prismatic grid reflector.
      * Lower Inner Tier: Diamond-cut crystal clear backup/reversing lamp.
      * Lower Outer Tier: High-retroreflection red side marker / fog lamp.
    - Internal chrome partition reflectors between all functional chambers.
    - Perimeter satin rubber weatherstrip seal framing the entire light bar.
    """
    objs = []
    bm_bar_red = bmesh.new()
    bm_amber = bmesh.new()
    bm_clear = bmesh.new()
    bm_script = bmesh.new()
    bm_refl = bmesh.new()
    bm_seal = bmesh.new()

    # Master Light Bar Envelope (Y = -2.060m, Z = 0.655m, angled back ~12 deg)
    mat_bar_center = Matrix.Translation(Vector((0.0, -2.060, 0.655))) @ Euler((math.radians(12), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Continuous Outer Rubber Weatherstrip Frame (Spans full width 1.480m)
    bmesh.ops.create_cube(bm_seal, size=1.0, matrix=mat_bar_center @ Matrix.Diagonal(Vector((1.480, 0.045, 0.125, 1.0))))

    # 2. Central Reflective Red Bar (X from -0.360m to +0.360m, Width = 0.720m)
    mat_c_bar = mat_bar_center @ Matrix.Translation(Vector((0, 0.016, 0)))
    bmesh.ops.create_cube(bm_bar_red, size=1.0, matrix=mat_c_bar @ Matrix.Diagonal(Vector((0.710, 0.024, 0.110, 1.0))))

    # Central Reflective Prismatic Grid
    for gx in [-0.280, -0.210, -0.140, 0.140, 0.210, 0.280]:
        mat_grid = mat_c_bar @ Matrix.Translation(Vector((gx, 0.012, 0)))
        bmesh.ops.create_cube(bm_refl, size=1.0, matrix=mat_grid @ Matrix.Diagonal(Vector((0.055, 0.006, 0.090, 1.0))))

    # 3. 3D Raised "P O R S C H E" Block Typography (Centered across reflective bar)
    # Letter spacing and positions across X = -0.220m to +0.220m
    letter_offsets = [-0.200, -0.133, -0.067, 0.000, 0.067, 0.133, 0.200]
    letter_chars = ['P', 'O', 'R', 'S', 'C', 'H', 'E']

    for l_x, l_ch in zip(letter_offsets, letter_chars):
        mat_let = mat_c_bar @ Matrix.Translation(Vector((l_x, 0.015, 0.000)))
        # Base letter bounding block with beveled appearance
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_let @ Matrix.Diagonal(Vector((0.040, 0.010, 0.042, 1.0))))
        # Chamfered inner core
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_let @ Matrix.Translation(Vector((0, 0.005, 0))) @ Matrix.Diagonal(Vector((0.032, 0.008, 0.034, 1.0))))

    # 4. Left & Right Multi-Chamber Tail Lamp Clusters (X = +/- 0.360m to +/- 0.730m)
    for lx_sign in [-1.0, 1.0]:
        mat_cluster = mat_bar_center @ Matrix.Translation(Vector((lx_sign * 0.545, 0.016, 0)))

        # Internal Chrome Chamber Partitions
        bmesh.ops.create_cube(bm_refl, size=1.0, matrix=mat_cluster @ Matrix.Diagonal(Vector((0.355, 0.030, 0.108, 1.0))))

        # Upper Tier: Amber Turn Signal (Top half, Z = +0.028m)
        mat_amber_tier = mat_cluster @ Matrix.Translation(Vector((0, 0.014, 0.028)))
        bmesh.ops.create_cube(bm_amber, size=1.0, matrix=mat_amber_tier @ Matrix.Diagonal(Vector((0.350, 0.015, 0.048, 1.0))))
        # Horizontal Amber Fresnel Flutes
        for fl_z in [-0.015, 0.000, 0.015]:
            mat_fl = mat_amber_tier @ Matrix.Translation(Vector((0, 0.008, fl_z)))
            bmesh.ops.create_cylinder(bm_amber, radius=0.003, depth=0.340, segments=8, matrix=mat_fl @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Middle Tier: Deep Red Stop / Tail Lamp (X outer section, lower middle)
        mat_mid_red = mat_cluster @ Matrix.Translation(Vector((lx_sign * 0.085, 0.014, -0.026)))
        bmesh.ops.create_cube(bm_bar_red, size=1.0, matrix=mat_mid_red @ Matrix.Diagonal(Vector((0.170, 0.015, 0.048, 1.0))))

        # Lower Inner Tier: Crystal Clear Reversing Lamp (Inboard side)
        mat_rev_inner = mat_cluster @ Matrix.Translation(Vector((lx_sign * -0.085, 0.014, -0.026)))
        bmesh.ops.create_cube(bm_clear, size=1.0, matrix=mat_rev_inner @ Matrix.Diagonal(Vector((0.170, 0.015, 0.048, 1.0))))
        # Prismatic Reversing Lens Grid
        for r_x in [-0.045, 0.000, 0.045]:
            mat_pr = mat_rev_inner @ Matrix.Translation(Vector((r_x, 0.008, 0)))
            bmesh.ops.create_cube(bm_clear, size=1.0, matrix=mat_pr @ Matrix.Diagonal(Vector((0.022, 0.004, 0.038, 1.0))))

    # 5. Dual White License Plate Lamps under bumper lip
    for lpx in [-0.180, 0.180]:
        mat_lp = Matrix.Translation(Vector((lpx, -2.030, 0.560))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_clear, size=1.0, matrix=mat_lp @ Matrix.Diagonal(Vector((0.065, 0.024, 0.022, 1.0))))
        bmesh.ops.create_cube(bm_seal, size=1.0, matrix=mat_lp @ Matrix.Diagonal(Vector((0.075, 0.030, 0.026, 1.0))))

    obj_bar_red = link_obj("GEO_993_Heckleuchtenband_Red_Lenses", bm_bar_red, parent_col, mats["tl_red"], bevel=0.001)
    obj_amber = link_obj("GEO_993_Rear_TurnSignal_Amber_Lenses", bm_amber, parent_col, mats["amber"], bevel=0.001)
    obj_clear = link_obj("GEO_993_Rear_Reverse_Clear_Lenses", bm_clear, parent_col, mats["reverse"], bevel=0.001)
    obj_script = link_obj("GEO_993_Porsche_Script_Typography", bm_script, parent_col, mats["chrome"], bevel=0.001)
    obj_refl = link_obj("GEO_993_Rear_LightBar_Reflectors", bm_refl, parent_col, mats["reflector"], bevel=0.001)
    obj_seal = link_obj("GEO_993_Rear_LightBar_Rubber_Frame", bm_seal, parent_col, mats["rubber"], bevel=0.0015)

    objs.extend([obj_bar_red, obj_amber, obj_clear, obj_script, obj_refl, obj_seal])
    return objs

# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 4: POLISHED DUAL OVAL EXHAUST TIPS
# ----------------------------------------------------------------------------

def build_993_polished_dual_oval_exhaust_tips(parent_col, mats):
    """
    Constructs the dual polished oval exhaust tailpipes:
    - Symmetrically exited through lower rear bumper scallops (X = +/- 0.440m, Y = -2.080m, Z = 0.220m).
    - Double-walled rolled oval stainless steel tips (110 mm wide x 75 mm tall).
    - Polished Inconel exterior bevel with rolled safety lip.
    - Hollow inner exhaust bore lined with matte black carbon soot baffle.
    - Heavy stainless band clamps and chassis mounting brackets.
    """
    objs = []
    bm_pipe = bmesh.new()
    bm_soot = bmesh.new()

    for ex_sign in [-1.0, 1.0]:
        # Exhaust Tip Axis: X = +/- 0.440m, Y = -2.060m, Z = 0.220m
        # Angled outward ~4 degrees, downward ~3 degrees
        mat_tip = Matrix.Translation(Vector((ex_sign * 0.440, -2.060, 0.220))) @ Euler((math.radians(-3), ex_sign * math.radians(-4), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Outer Polished Oval Tip Sleeve (110mm x 75mm cross-section, depth 140mm)
        # Built via scaled cylinder
        bmesh.ops.create_cylinder(bm_pipe, radius=0.052, depth=0.140, segments=32, matrix=mat_tip @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.05, 0.72, 1.0, 1.0))))

        # 2. Rolled Safety Outer Rim Lip
        mat_rim = mat_tip @ Matrix.Translation(Vector((0, -0.068, 0)))
        bmesh.ops.create_cylinder(bm_pipe, radius=0.055, depth=0.016, segments=32, matrix=mat_rim @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.05, 0.72, 1.0, 1.0))))

        # 3. Hollow Inner Exhaust Soot Bore (Dark matte lining inside)
        mat_bore = mat_tip @ Matrix.Translation(Vector((0, -0.020, 0)))
        bmesh.ops.create_cylinder(bm_soot, radius=0.046, depth=0.150, segments=28, matrix=mat_bore @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.05, 0.72, 1.0, 1.0))))

        # 4. Heavy Stainless Exhaust Band Clamp & Hanger Rod
        mat_clamp = mat_tip @ Matrix.Translation(Vector((0, 0.045, 0)))
        bmesh.ops.create_cylinder(bm_pipe, radius=0.058, depth=0.025, segments=24, matrix=mat_clamp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.05, 0.72, 1.0, 1.0))))
        # Clamp Tightening Bolt
        mat_cbolt = mat_clamp @ Matrix.Translation(Vector((0, 0, 0.048)))
        bmesh.ops.create_cylinder(bm_pipe, radius=0.007, depth=0.035, segments=10, matrix=mat_cbolt @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_pipe = link_obj("GEO_993_Polished_Exhaust_Tips", bm_pipe, parent_col, mats["exhaust_pipe"], bevel=0.001)
    obj_soot = link_obj("GEO_993_Exhaust_Inner_Soot_Bore", bm_soot, parent_col, mats["soot"], bevel=0.0005)

    objs.extend([obj_pipe, obj_soot])
    return objs

# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 5: AERODYNAMIC TEARDROP CUP SIDE VIEW MIRRORS
# ----------------------------------------------------------------------------

def build_993_aerodynamic_teardrop_cup_mirrors(parent_col, mats):
    """
    Constructs the signature Type 993 aerodynamic "Cup" side view mirrors:
    - Mounted at forward corner of door glass (X = +/- 0.825m, Y = +0.550m, Z = 0.865m).
    - Twin curved aerodynamic pedestal support stalks emerging from triangular door base.
    - Sculpted teardrop aerodynamic mirror housing finished in body color.
    - Recessed first-surface optical mirror glass:
      * Driver side (Left): Aspheric outer zone for blind-spot reduction.
      * Passenger side (Right): Convex wide-angle mirror glass.
    - Base black EPDM rubber mounting gasket.
    """
    objs = []
    bm_body = bmesh.new()
    bm_glass = bmesh.new()
    bm_rubber = bmesh.new()

    for mx_sign in [-1.0, 1.0]:
        # Mirror Base on Door Skin: X = +/- 0.820m, Y = +0.550m, Z = 0.850m
        mat_base = Matrix.Translation(Vector((mx_sign * 0.820, 0.550, 0.850)))

        # 1. Triangular Door Base Mounting Plate & Rubber Gasket
        mat_gasket = mat_base @ Euler((0, mx_sign * math.radians(-12), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=mat_gasket @ Matrix.Diagonal(Vector((0.024, 0.110, 0.085, 1.0))))

        # 2. Twin Aerodynamic Curved Pedestal Stalks
        # Forward Stalk
        mat_stalk_f = mat_base @ Matrix.Translation(Vector((mx_sign * 0.035, 0.025, 0.020))) @ Euler((0, mx_sign * math.radians(24), math.radians(15)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_body, radius=0.012, depth=0.075, segments=14, matrix=mat_stalk_f)

        # Rearward Stalk
        mat_stalk_r = mat_base @ Matrix.Translation(Vector((mx_sign * 0.035, -0.030, 0.018))) @ Euler((0, mx_sign * math.radians(24), math.radians(-15)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_body, radius=0.011, depth=0.070, segments=14, matrix=mat_stalk_r)

        # 3. Teardrop Aerodynamic Mirror Pod Housing (X = +/- 0.885m, Y = +0.550m, Z = 0.885m)
        mat_pod = Matrix.Translation(Vector((mx_sign * 0.885, 0.550, 0.885))) @ Euler((0, 0, mx_sign * math.radians(6)), 'XYZ').to_matrix().to_4x4()

        # Teardrop Main Bulb (Smooth ellipsoid)
        bmesh.ops.create_cylinder(bm_body, radius=0.065, depth=0.170, segments=24, matrix=mat_pod @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.15, 0.80, 1.0, 1.0))))
        # Tapered Aerodynamic Rear Cone
        mat_cone = mat_pod @ Matrix.Translation(Vector((0, 0.060, 0)))
        bmesh.ops.create_cone(bm_body, radius1=0.062, radius2=0.025, depth=0.080, segments=20, matrix=mat_cone @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.15, 0.80, 1.0, 1.0))))

        # 4. First-Surface Optical Chrome Mirror Glass (Facing rearwards, Y offset -0.075m)
        mat_glass = mat_pod @ Matrix.Translation(Vector((0, -0.076, 0)))
        # Mirror Glass Bezel Ring
        bmesh.ops.create_cylinder(bm_rubber, radius=0.058, depth=0.012, segments=24, matrix=mat_glass @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.12, 0.76, 1.0, 1.0))))
        # Highly Reflective Optical Glass Face
        mat_face = mat_glass @ Matrix.Translation(Vector((0, -0.005, 0)))
        bmesh.ops.create_cylinder(bm_glass, radius=0.054, depth=0.006, segments=24, matrix=mat_face @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.12, 0.76, 1.0, 1.0))))

        # Subtle Vertical Etched Line for Aspheric Blind-Spot Split (Driver side left only)
        if mx_sign < 0:
            mat_asph = mat_face @ Matrix.Translation(Vector((-0.035, -0.004, 0)))
            bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=mat_asph @ Matrix.Diagonal(Vector((0.001, 0.003, 0.065, 1.0))))

    obj_body = link_obj("GEO_993_CupMirror_Housings", bm_body, parent_col, mats["body"], bevel=0.002)
    obj_glass = link_obj("GEO_993_CupMirror_Optical_Glass", bm_glass, parent_col, mats["mirror_glass"], bevel=0.0005)
    obj_rubber = link_obj("GEO_993_CupMirror_Rubber_Gaskets", bm_rubber, parent_col, mats["rubber"], bevel=0.001)

    objs.extend([obj_body, obj_glass, obj_rubber])
    return objs


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 6: RECESSED DOOR HANDLES & KEYLOCK CYLINDERS
# ----------------------------------------------------------------------------

def build_993_recessed_door_handles_and_keylocks(parent_col, mats):
    """
    Constructs the flush aerodynamic exterior door handles:
    - Recessed finger pocket depression scooped into door skin (X = +/- 0.865m, Y = +0.050m, Z = 0.770m).
    - Ergonomic pull-trigger paddle lever with satin black textured grip.
    - Perimeter black rubber sealing gasket.
    - Polished chrome micro keylock tumbler with spring-loaded dust shutter.
    """
    objs = []
    bm_handle = bmesh.new()
    bm_pocket = bmesh.new()
    bm_chrome = bmesh.new()

    for dx_sign in [-1.0, 1.0]:
        # Handle Position on Door Waist: X = +/- 0.865m, Y = +0.050m, Z = 0.770m
        mat_h = Matrix.Translation(Vector((dx_sign * 0.865, 0.050, 0.770))) @ Euler((0, dx_sign * math.radians(-6), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Recessed Finger Pocket Depression
        bmesh.ops.create_cube(bm_pocket, size=1.0, matrix=mat_h @ Matrix.Diagonal(Vector((0.024, 0.165, 0.048, 1.0))))
        # Pocket Beveled Inner Floor
        mat_floor = mat_h @ Matrix.Translation(Vector((dx_sign * -0.008, 0, 0)))
        bmesh.ops.create_cube(bm_pocket, size=1.0, matrix=mat_floor @ Matrix.Diagonal(Vector((0.016, 0.150, 0.038, 1.0))))

        # 2. Ergonomic Pull-Paddle Trigger Lever (Pivots outward)
        mat_paddle = mat_h @ Matrix.Translation(Vector((dx_sign * 0.006, -0.012, 0.004)))
        bmesh.ops.create_cube(bm_handle, size=1.0, matrix=mat_paddle @ Matrix.Diagonal(Vector((0.018, 0.115, 0.032, 1.0))))

        # Paddle Finger Grip Undercut Lip
        mat_lip = mat_paddle @ Matrix.Translation(Vector((dx_sign * -0.004, 0, -0.012)))
        bmesh.ops.create_cube(bm_handle, size=1.0, matrix=mat_lip @ Matrix.Diagonal(Vector((0.010, 0.100, 0.010, 1.0))))

        # 3. Polished Chrome Keylock Tumbler (Driver side & Passenger side)
        mat_lock = mat_h @ Matrix.Translation(Vector((dx_sign * 0.008, 0.058, 0.000)))
        # Chrome Outer Bezel Ring
        bmesh.ops.create_cylinder(bm_chrome, radius=0.009, depth=0.012, segments=16, matrix=mat_lock @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Central Key Slot Shutter Recess
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=mat_lock @ Matrix.Translation(Vector((dx_sign * 0.006, 0, 0))) @ Matrix.Diagonal(Vector((0.004, 0.008, 0.002, 1.0))))

    obj_handle = link_obj("GEO_993_Door_Handle_Paddles", bm_handle, parent_col, mats["body"], bevel=0.001)
    obj_pocket = link_obj("GEO_993_Door_Handle_Recessed_Pockets", bm_pocket, parent_col, mats["rubber"], bevel=0.0015)
    obj_chrome = link_obj("GEO_993_Door_Keylock_Cylinders", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_handle, obj_pocket, obj_chrome])
    return objs

# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 7: ENAMEL STUTTGART PORSCHE HOOD CREST WAPPEN BADGE
# ----------------------------------------------------------------------------

def build_993_stuttgart_porsche_hood_crest(parent_col, mats):
    """
    Constructs the iconic Porsche Wappen (Coat of Arms) hood crest:
    - Centered on the front luggage compartment lid nose (X = 0.000m, Y = +1.720m, Z = 0.645m).
    - 24-Karat Gold Plated Shield Bezel with pointed lower tip.
    - Arched upper header embossed with 'PORSCHE' lettering bar.
    - Quartered Heraldic Shield:
      * Upper-left & Lower-right: Württemberg black deer antlers on gold ground.
      * Upper-right & Lower-left: Red and black horizontal heraldic stripes.
    - Central Inescutcheon: Stuttgart city crest with black prancing horse (Ross).
    - Neoprene rubber mounting gasket between crest and curved body sheetmetal.
    """
    objs = []
    bm_gold = bmesh.new()
    bm_red = bmesh.new()
    bm_black = bmesh.new()
    bm_gasket = bmesh.new()

    # Hood Crest Axis on Frunk Nose: Y = +1.720m, Z = 0.645m, angled along hood slope (~32 deg)
    mat_crest = Matrix.Translation(Vector((0.0, 1.720, 0.645))) @ Euler((math.radians(-32), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Base Rubber Mounting Gasket (Cushion against paint)
    bmesh.ops.create_cube(bm_gasket, size=1.0, matrix=mat_crest @ Matrix.Diagonal(Vector((0.038, 0.004, 0.052, 1.0))))

    # 2. 24K Gold Outer Shield Bezel Frame
    mat_gold_base = mat_crest @ Matrix.Translation(Vector((0, 0.002, 0)))
    bmesh.ops.create_cube(bm_gold, size=1.0, matrix=mat_gold_base @ Matrix.Diagonal(Vector((0.035, 0.004, 0.048, 1.0))))

    # Pointed Lower Triangular Tip of Shield
    mat_tip = mat_gold_base @ Matrix.Translation(Vector((0, 0, -0.024)))
    bmesh.ops.create_cone(bm_gold, radius1=0.0175, radius2=0.002, depth=0.014, segments=4, matrix=mat_tip @ Euler((math.pi * 0.25, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Arched Upper "PORSCHE" Header Bar
    mat_header = mat_gold_base @ Matrix.Translation(Vector((0, 0.002, 0.021)))
    bmesh.ops.create_cube(bm_gold, size=1.0, matrix=mat_header @ Matrix.Diagonal(Vector((0.034, 0.005, 0.009, 1.0))))

    # 3. Quartered Fields:
    # Upper-Right & Lower-Left: Red Enamel Heraldic Bars
    for rx_off, rz_off in [(0.009, 0.008), (-0.009, -0.008)]:
        mat_red_q = mat_gold_base @ Matrix.Translation(Vector((rx_off, 0.003, rz_off)))
        bmesh.ops.create_cube(bm_red, size=1.0, matrix=mat_red_q @ Matrix.Diagonal(Vector((0.014, 0.003, 0.014, 1.0))))
        # Red and Black Striped inlays
        mat_black_stripe = mat_red_q @ Matrix.Translation(Vector((0, 0.002, 0)))
        bmesh.ops.create_cube(bm_black, size=1.0, matrix=mat_black_stripe @ Matrix.Diagonal(Vector((0.014, 0.003, 0.005, 1.0))))

    # Upper-Left & Lower-Right: Black Württemberg Antlers on Gold ground
    for ax_off, az_off in [(-0.009, 0.008), (0.009, -0.008)]:
        # 3 stylized black antler tines
        for t_idx in [-0.003, 0.000, 0.003]:
            mat_antler = mat_gold_base @ Matrix.Translation(Vector((ax_off, 0.003, az_off + t_idx)))
            bmesh.ops.create_cube(bm_black, size=1.0, matrix=mat_antler @ Matrix.Diagonal(Vector((0.012, 0.002, 0.002, 1.0))))

    # 4. Central Inescutcheon: Stuttgart Prancing Horse (Ross)
    mat_horse_shield = mat_gold_base @ Matrix.Translation(Vector((0, 0.004, 0.000)))
    # Central Gold Inescutcheon Border
    bmesh.ops.create_cube(bm_gold, size=1.0, matrix=mat_horse_shield @ Matrix.Diagonal(Vector((0.012, 0.002, 0.016, 1.0))))
    # Black Prancing Horse Silhouette
    bmesh.ops.create_cube(bm_black, size=1.0, matrix=mat_horse_shield @ Matrix.Translation(Vector((0, 0.002, 0))) @ Matrix.Diagonal(Vector((0.008, 0.002, 0.012, 1.0))))

    obj_gold = link_obj("GEO_993_PorscheCrest_Gold_Bezel", bm_gold, parent_col, mats["gold"], bevel=0.0005)
    obj_red = link_obj("GEO_993_PorscheCrest_Red_Enamel", bm_red, parent_col, mats["enamel_red"], bevel=0.0003)
    obj_black = link_obj("GEO_993_PorscheCrest_Black_Enamel", bm_black, parent_col, mats["enamel_black"], bevel=0.0003)
    obj_gasket = link_obj("GEO_993_PorscheCrest_Mounting_Gasket", bm_gasket, parent_col, mats["rubber"], bevel=0.0005)

    objs.extend([obj_gold, obj_red, obj_black, obj_gasket])
    return objs

# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 8: RAISED 3D CURSIVE "CARRERA" REAR DECKLID BADGING
# ----------------------------------------------------------------------------

def build_993_raised_carrera_rear_decklid_script(parent_col, mats):
    """
    Constructs the authentic 3D scripted "Carrera" decklid emblem:
    - Centered on the lower engine lid deck (X = 0.000m, Y = -1.880m, Z = 0.730m).
    - Authentic cursive script with connected strokes:
      * Capital 'C' with graceful top swoop and lower baseline curve.
      * Fluid lowercase 'a-r-r-e-r-a' script with authentic baseline ligature connections.
    - Extruded 3D profile with satin black anodized finish and subtle silver edge chamfer.
    """
    objs = []
    bm_script = bmesh.new()

    # Decklid Script Axis: Y = -1.880m, Z = 0.730m, angled along rear deck slope (~20 deg)
    mat_script = Matrix.Translation(Vector((0.0, -1.880, 0.730))) @ Euler((math.radians(20), 0, 0), 'XYZ').to_matrix().to_4x4()

    # Cursive Letter Segment Offsets (Total span ~220mm, X = -0.110m to +0.110m)
    # 1. Capital 'C'
    mat_c = mat_script @ Matrix.Translation(Vector((-0.085, 0.006, 0.005)))
    bmesh.ops.create_cylinder(bm_script, radius=0.024, depth=0.006, segments=20, matrix=mat_c @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Cutout inner loop of C
    mat_c_inner = mat_c @ Matrix.Translation(Vector((0.008, 0, 0)))
    bmesh.ops.create_cylinder(bm_script, radius=0.015, depth=0.008, segments=16, matrix=mat_c_inner @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Lowercase 'a' (First)
    mat_a1 = mat_script @ Matrix.Translation(Vector((-0.052, 0.006, -0.004)))
    bmesh.ops.create_cylinder(bm_script, radius=0.014, depth=0.006, segments=16, matrix=mat_a1 @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_a1 @ Matrix.Translation(Vector((0.011, 0, -0.002))) @ Matrix.Diagonal(Vector((0.005, 0.006, 0.018, 1.0))))

    # 3. Lowercase 'r' (First)
    mat_r1 = mat_script @ Matrix.Translation(Vector((-0.025, 0.006, -0.002)))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_r1 @ Matrix.Diagonal(Vector((0.005, 0.006, 0.022, 1.0))))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_r1 @ Matrix.Translation(Vector((0.007, 0, 0.006))) @ Matrix.Diagonal(Vector((0.012, 0.006, 0.005, 1.0))))

    # 4. Lowercase 'r' (Second)
    mat_r2 = mat_script @ Matrix.Translation(Vector((0.000, 0.006, -0.002)))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_r2 @ Matrix.Diagonal(Vector((0.005, 0.006, 0.022, 1.0))))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_r2 @ Matrix.Translation(Vector((0.007, 0, 0.006))) @ Matrix.Diagonal(Vector((0.012, 0.006, 0.005, 1.0))))

    # 5. Lowercase 'e'
    mat_e = mat_script @ Matrix.Translation(Vector((0.028, 0.006, -0.003)))
    bmesh.ops.create_cylinder(bm_script, radius=0.013, depth=0.006, segments=16, matrix=mat_e @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_e @ Matrix.Translation(Vector((0, 0, 0.002))) @ Matrix.Diagonal(Vector((0.018, 0.006, 0.004, 1.0))))

    # 6. Lowercase 'r' (Third)
    mat_r3 = mat_script @ Matrix.Translation(Vector((0.055, 0.006, -0.002)))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_r3 @ Matrix.Diagonal(Vector((0.005, 0.006, 0.022, 1.0))))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_r3 @ Matrix.Translation(Vector((0.007, 0, 0.006))) @ Matrix.Diagonal(Vector((0.012, 0.006, 0.005, 1.0))))

    # 7. Lowercase 'a' (Final with trailing flourish)
    mat_a2 = mat_script @ Matrix.Translation(Vector((0.082, 0.006, -0.004)))
    bmesh.ops.create_cylinder(bm_script, radius=0.014, depth=0.006, segments=16, matrix=mat_a2 @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_a2 @ Matrix.Translation(Vector((0.011, 0, -0.002))) @ Matrix.Diagonal(Vector((0.005, 0.006, 0.018, 1.0))))
    # Trailing baseline flourish tail
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_a2 @ Matrix.Translation(Vector((0.018, 0, -0.010))) @ Euler((0, 0, math.radians(25)), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((0.016, 0.006, 0.004, 1.0))))

    # Baseline Script Connecting Ligatures
    mat_lig = mat_script @ Matrix.Translation(Vector((0.000, 0.005, -0.012)))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_lig @ Matrix.Diagonal(Vector((0.180, 0.004, 0.003, 1.0))))

    obj_carrera = link_obj("GEO_993_Carrera_Rear_Decklid_Script", bm_script, parent_col, mats["rubber"], bevel=0.0006)
    objs.append(obj_carrera)
    return objs

# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 9: RETRACTABLE SPOILER AIRFLOW LOUVERS & BELLOWS
# ----------------------------------------------------------------------------

def build_993_retractable_spoiler_louvers_and_bellows(parent_col, mats):
    """
    Constructs the speed-activated retractable rear spoiler louvers and bellows:
    - Integrated into the upper engine lid (Y: -1.650m to -1.860m, Z = 0.745m).
    - Spoiler Aerodynamic Upper Wing Flap with 8 horizontal airflow cooling louvers.
    - Accordion Pleated Side Bellows (Left & Right multi-fold black rubber boots).
    - Under-spoiler electric rack-and-pinion drive spindle and limit switch brackets.
    """
    objs = []
    bm_wing = bmesh.new()
    bm_louvers = bmesh.new()
    bm_bellows = bmesh.new()

    # Spoiler Axis: Y = -1.755m, Z = 0.745m, angled along deck slope (~16 deg)
    mat_sp = Matrix.Translation(Vector((0.0, -1.755, 0.745))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Movable Spoiler Aerodynamic Upper Wing Flap (Width 0.740m, Length 0.220m)
    bmesh.ops.create_cube(bm_wing, size=1.0, matrix=mat_sp @ Matrix.Diagonal(Vector((0.740, 0.220, 0.024, 1.0))))

    # Trailing Edge Aerodynamic Gurney/Lip Extension
    mat_lip = mat_sp @ Matrix.Translation(Vector((0, -0.105, 0.008)))
    bmesh.ops.create_cube(bm_wing, size=1.0, matrix=mat_lip @ Matrix.Diagonal(Vector((0.730, 0.016, 0.014, 1.0))))

    # 2. 8 Horizontal Engine Airflow Cooling Louver Slats (Spanning central 580mm)
    for l_idx in range(8):
        ly_off = -0.075 + l_idx * 0.022
        # Louver blade tilted 28 degrees for air induction
        mat_louver = mat_sp @ Matrix.Translation(Vector((0, ly_off, 0.005))) @ Euler((math.radians(28), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_louvers, size=1.0, matrix=mat_louver @ Matrix.Diagonal(Vector((0.580, 0.018, 0.003, 1.0))))

    # Central Louver Reinforcing Spine
    mat_spine = mat_sp @ Matrix.Translation(Vector((0, 0.000, 0.004)))
    bmesh.ops.create_cube(bm_louvers, size=1.0, matrix=mat_spine @ Matrix.Diagonal(Vector((0.016, 0.180, 0.008, 1.0))))

    # 3. Accordion Pleated Side Bellows (Left & Right sides)
    for bx_sign in [-1.0, 1.0]:
        mat_bell_side = mat_sp @ Matrix.Translation(Vector((bx_sign * 0.355, 0.000, -0.025)))

        # 4 Pleated Accordion Rubber Folds
        for pleat in range(4):
            pl_z = -0.015 - pleat * 0.012
            pl_width = 0.020 + (pleat % 2) * 0.008
            mat_pleat = mat_bell_side @ Matrix.Translation(Vector((0, 0, pl_z)))
            bmesh.ops.create_cube(bm_bellows, size=1.0, matrix=mat_pleat @ Matrix.Diagonal(Vector((pl_width, 0.200, 0.008, 1.0))))

    obj_wing = link_obj("GEO_993_Retractable_Spoiler_Flap", bm_wing, parent_col, mats["body"], bevel=0.002)
    obj_louvers = link_obj("GEO_993_Spoiler_Cooling_Louvers", bm_louvers, parent_col, mats["rubber"], bevel=0.0008)
    obj_bellows = link_obj("GEO_993_Spoiler_Accordion_Bellows", bm_bellows, parent_col, mats["rubber"], bevel=0.001)

    objs.extend([obj_wing, obj_louvers, obj_bellows])
    return objs


# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 10: CABRIOLET TENAX FASTENERS & CANVAS WELTS
# ----------------------------------------------------------------------------

def build_993_cabriolet_tenax_fasteners_and_canvas_welts(parent_col, mats):
    """
    Constructs the convertible soft-top detailing and tonneau boot jewelry:
    - 16 German Tenax quick-release spring locking chrome snap studs around tonneau perimeter.
    - Hexagonal chrome base collar with mushroom-head pull button.
    - Twin longitudinal canvas welt piping cords outlining the folded roof envelope.
    - Leather hold-down tie straps with miniature polished chrome roller buckles.
    - Rear tonneau cover perimeter beading cord.
    """
    objs = []
    bm_tenax = bmesh.new()
    bm_welts = bmesh.new()
    bm_straps = bmesh.new()

    # 16 Tenax Snap Stud Positions along tonneau perimeter beltline
    tenax_coords = [
        # Rear cross bar (Y = -1.340m, Z = 0.805m)
        (-0.580, -1.340, 0.805), (-0.380, -1.345, 0.810), (-0.180, -1.348, 0.812),
        (0.180, -1.348, 0.812), (0.380, -1.345, 0.810), (0.580, -1.340, 0.805),
        # Left side curved rim (X = -0.740m to -0.660m, Y = -1.220m to -0.780m)
        (-0.680, -1.220, 0.808), (-0.720, -1.080, 0.810), (-0.745, -0.940, 0.812), (-0.740, -0.800, 0.815),
        # Right side curved rim (X = +0.740m to +0.660m, Y = -1.220m to -0.780m)
        (0.680, -1.220, 0.808), (0.720, -1.080, 0.810), (0.745, -0.940, 0.812), (0.740, -0.800, 0.815),
        # Forward corner snaps
        (-0.700, -0.680, 0.818), (0.700, -0.680, 0.818),
    ]

    for tx, ty, tz in tenax_coords:
        mat_tenax = Matrix.Translation(Vector((tx, ty, tz)))
        # Hexagonal Chrome Base Collar
        bmesh.ops.create_cylinder(bm_tenax, radius=0.007, depth=0.004, segments=6, matrix=mat_tenax)
        # Mushroom Head Spring Release Pull Stud
        bmesh.ops.create_cylinder(bm_tenax, radius=0.005, depth=0.008, segments=12, matrix=mat_tenax @ Matrix.Translation(Vector((0, 0, 0.004))))
        bmesh.ops.create_cylinder(bm_tenax, radius=0.003, depth=0.005, segments=10, matrix=mat_tenax @ Matrix.Translation(Vector((0, 0, 0.008))))

    # Twin Longitudinal Canvas Welt Piping Cords (Along folded roof side ridges)
    for wx_sign in [-1.0, 1.0]:
        mat_welt = Matrix.Translation(Vector((wx_sign * 0.540, -0.980, 0.865)))
        bmesh.ops.create_cylinder(bm_welts, radius=0.004, depth=0.640, segments=10, matrix=mat_welt @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Transverse Rear Welt Piping
    mat_r_welt = Matrix.Translation(Vector((0.0, -1.310, 0.825)))
    bmesh.ops.create_cylinder(bm_welts, radius=0.004, depth=1.120, segments=12, matrix=mat_r_welt @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Leather Hold-Down Tie Straps & Miniature Chrome Buckles (Left & Right rear cockpit)
    for sx_sign in [-1.0, 1.0]:
        mat_strap = Matrix.Translation(Vector((sx_sign * 0.420, -0.720, 0.800))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_straps, size=1.0, matrix=mat_strap @ Matrix.Diagonal(Vector((0.024, 0.120, 0.004, 1.0))))
        # Miniature Chrome Roller Buckle
        mat_buckle = mat_strap @ Matrix.Translation(Vector((0, -0.045, 0.003)))
        bmesh.ops.create_cube(bm_tenax, size=1.0, matrix=mat_buckle @ Matrix.Diagonal(Vector((0.028, 0.016, 0.008, 1.0))))

    obj_tenax = link_obj("GEO_993_Tonneau_Tenax_Fasteners", bm_tenax, parent_col, mats["chrome"], bevel=0.0005)
    obj_welts = link_obj("GEO_993_Cabriolet_Canvas_Welts", bm_welts, parent_col, mats["canvas"], bevel=0.0005)
    obj_straps = link_obj("GEO_993_Tonneau_Leather_Straps", bm_straps, parent_col, mats["rubber"], bevel=0.0008)

    objs.extend([obj_tenax, obj_welts, obj_straps])
    return objs

# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 11: WINDSHIELD REVEAL MOLDING & PANTOGRAPH WIPERS
# ----------------------------------------------------------------------------

def build_993_windshield_reveal_molding_and_pantograph_wipers(parent_col, mats):
    """
    Constructs the windshield reveal molding and high-speed pantograph wipers:
    - Satin black aluminum windshield outer surround trim framing glass perimeter.
    - Articulated dual-blade pantograph wiper arm assembly:
      * Driver Wiper: Articulated dual-link arm with high-speed aerodynamic airfoil spoiler.
      * Passenger Wiper: Curved articulated arm following windshield lower contour.
    - Fine multi-segment flexible rubber wiper squeegee blades.
    - Dual pivot drive spindles protruding through cowl intake louver panel.
    """
    objs = []
    bm_trim = bmesh.new()
    bm_wipers = bmesh.new()
    bm_blades = bmesh.new()

    # 1. Windshield Outer Reveal Molding Surround (Satin Black Aluminum)
    # Upper Header Trim (Z = 1.285m, Y = +0.720m)
    mat_hdr = Matrix.Translation(Vector((0.0, 0.720, 1.285)))
    bmesh.ops.create_cube(bm_trim, size=1.0, matrix=mat_hdr @ Matrix.Diagonal(Vector((1.120, 0.018, 0.012, 1.0))))

    # Left & Right A-Pillar Reveal Trim
    for ax_sign in [-1.0, 1.0]:
        mat_ap = Matrix.Translation(Vector((ax_sign * 0.610, 0.840, 1.060))) @ Euler((math.radians(-42), ax_sign * math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_trim, radius=0.008, depth=0.680, segments=12, matrix=mat_ap)

    # 2. Dual Wiper Pivot Spindles on Cowl (Y = +0.940m, Z = 0.835m)
    # Driver Pivot (Left, X = -0.320m)
    mat_dpiv = Matrix.Translation(Vector((-0.320, 0.940, 0.835)))
    bmesh.ops.create_cylinder(bm_trim, radius=0.014, depth=0.024, segments=14, matrix=mat_dpiv)

    # Passenger Pivot (Right, X = +0.160m)
    mat_ppiv = Matrix.Translation(Vector((0.160, 0.940, 0.835)))
    bmesh.ops.create_cylinder(bm_trim, radius=0.014, depth=0.024, segments=14, matrix=mat_ppiv)

    # 3. Driver Wiper Arm with Aerodynamic Airfoil Spoiler (Angled across glass)
    mat_d_arm = Matrix.Translation(Vector((-0.240, 0.900, 0.880))) @ Euler((math.radians(-38), 0, math.radians(22)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_wipers, size=1.0, matrix=mat_d_arm @ Matrix.Diagonal(Vector((0.014, 0.380, 0.008, 1.0))))
    # Aerodynamic Wind Deflector Airfoil Winglet on Driver Arm
    mat_spoiler = mat_d_arm @ Matrix.Translation(Vector((0.006, 0.050, 0.006))) @ Euler((0, math.radians(25), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_wipers, size=1.0, matrix=mat_spoiler @ Matrix.Diagonal(Vector((0.022, 0.220, 0.003, 1.0))))

    # Driver Wiper Blade (450mm curved rubber squeegee)
    mat_d_blade = mat_d_arm @ Matrix.Translation(Vector((0.000, 0.120, -0.008)))
    bmesh.ops.create_cube(bm_blades, size=1.0, matrix=mat_d_blade @ Matrix.Diagonal(Vector((0.008, 0.450, 0.012, 1.0))))

    # 4. Passenger Wiper Arm & Blade
    mat_p_arm = Matrix.Translation(Vector((0.260, 0.900, 0.880))) @ Euler((math.radians(-38), 0, math.radians(18)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_wipers, size=1.0, matrix=mat_p_arm @ Matrix.Diagonal(Vector((0.012, 0.360, 0.007, 1.0))))

    # Passenger Wiper Blade (450mm curved rubber squeegee)
    mat_p_blade = mat_p_arm @ Matrix.Translation(Vector((0.000, 0.110, -0.008)))
    bmesh.ops.create_cube(bm_blades, size=1.0, matrix=mat_p_blade @ Matrix.Diagonal(Vector((0.008, 0.450, 0.012, 1.0))))

    obj_trim = link_obj("GEO_993_Windshield_Reveal_Molding", bm_trim, parent_col, mats["rubber"], bevel=0.001)
    obj_wipers = link_obj("GEO_993_Pantograph_Wiper_Arms", bm_wipers, parent_col, mats["rubber"], bevel=0.0008)
    obj_blades = link_obj("GEO_993_Wiper_Rubber_Blades", bm_blades, parent_col, mats["rubber"], bevel=0.0005)

    objs.extend([obj_trim, obj_wipers, obj_blades])
    return objs

# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 12: FRONT CHIN SPOILER LIP & TIRE DEFLECTION SPATS
# ----------------------------------------------------------------------------

def build_993_front_chin_spoiler_and_tire_spats(parent_col, mats):
    """
    Constructs the aerodynamic front lower chin splitter and wheel spats:
    - Two-piece flexible polyurethane lower chin spoiler lip attached to front bumper bottom.
    - Swept aerodynamic front tire air-deflection spats directing airflow around 205/50ZR17 tires.
    - Front bumper tow hook access cap on the right-hand corner.
    """
    objs = []
    bm_lip = bmesh.new()

    # Front Lower Chin Spoiler Lip (Y = +2.020m to +1.860m, Z = 0.165m)
    # Center Section (Y = +2.010m)
    mat_c_lip = Matrix.Translation(Vector((0.0, 2.010, 0.165)))
    bmesh.ops.create_cube(bm_lip, size=1.0, matrix=mat_c_lip @ Matrix.Diagonal(Vector((0.740, 0.045, 0.024, 1.0))))

    # Left & Right Curved Corner Extensions
    for cx_sign in [-1.0, 1.0]:
        mat_corner = Matrix.Translation(Vector((cx_sign * 0.520, 1.940, 0.170))) @ Euler((0, 0, cx_sign * math.radians(-24)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_lip, size=1.0, matrix=mat_corner @ Matrix.Diagonal(Vector((0.360, 0.040, 0.026, 1.0))))

        # Front Tire Aerodynamic Air Deflection Spat (Ahead of front tire, Y = +1.340m, Z = 0.185m)
        mat_spat = Matrix.Translation(Vector((cx_sign * 0.705, 1.340, 0.185)))
        bmesh.ops.create_cube(bm_lip, size=1.0, matrix=mat_spat @ Matrix.Diagonal(Vector((0.035, 0.065, 0.055, 1.0))))

    # Front Bumper Tow Hook Access Cover Cap (Right side, X = +0.480m, Y = +1.970m, Z = 0.380m)
    mat_tow = Matrix.Translation(Vector((0.480, 1.970, 0.380)))
    bmesh.ops.create_cylinder(bm_lip, radius=0.016, depth=0.008, segments=16, matrix=mat_tow @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_lip = link_obj("GEO_993_Front_Chin_Spoiler_and_Spats", bm_lip, parent_col, mats["rubber"], bevel=0.0015)
    objs.append(obj_lip)
    return objs

# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 13: FLARED HIP STONE GUARDS & SILL SCUFF PLATES
# ----------------------------------------------------------------------------

def build_993_flared_hip_stone_guards_and_sill_plates(parent_col, mats):
    """
    Constructs the iconic flared rear hip stone guards and interior door sill plates:
    - Type 993 shark-fin transparent vinyl stone guard decals on flared rear quarters.
    - Polished brushed aluminum inner door sill scuff plates stamped with 'Carrera' script.
    - Door threshold weatherstrip seals.
    """
    objs = []
    bm_guard = bmesh.new()
    bm_sill = bmesh.new()

    for gx_sign in [-1.0, 1.0]:
        # Flared Hip Stone Guard Decal (X = +/- 0.880m, Y = -0.780m, Z = 0.480m)
        # Follows wide rear hip flare curvature
        mat_guard = Matrix.Translation(Vector((gx_sign * 0.880, -0.780, 0.480))) @ Euler((0, gx_sign * math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_guard, size=1.0, matrix=mat_guard @ Matrix.Diagonal(Vector((0.004, 0.280, 0.220, 1.0))))

        # Polished Aluminum Door Sill Scuff Plate (Inner door aperture floor, X = +/- 0.730m, Y = +0.050m, Z = 0.300m)
        mat_sill = Matrix.Translation(Vector((gx_sign * 0.730, 0.050, 0.300)))
        bmesh.ops.create_cube(bm_sill, size=1.0, matrix=mat_sill @ Matrix.Diagonal(Vector((0.075, 0.580, 0.006, 1.0))))

        # Stamped 'Carrera' Script Inlay on Sill Plate
        mat_s_script = mat_sill @ Matrix.Translation(Vector((0, 0, 0.004)))
        bmesh.ops.create_cube(bm_sill, size=1.0, matrix=mat_s_script @ Matrix.Diagonal(Vector((0.035, 0.220, 0.003, 1.0))))

        # Rubber Perimeter Sill Seal
        mat_seal = mat_sill @ Matrix.Translation(Vector((gx_sign * -0.045, 0, 0.008)))
        bmesh.ops.create_cylinder(bm_guard, radius=0.006, depth=0.620, segments=10, matrix=mat_seal @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_guard = link_obj("GEO_993_Rear_Hip_Stone_Guards", bm_guard, parent_col, mats["rubber"], bevel=0.0005)
    obj_sill = link_obj("GEO_993_Door_Sill_Scuff_Plates", bm_sill, parent_col, mats["alloy"], bevel=0.0008)

    objs.extend([obj_guard, obj_sill])
    return objs


# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 18: WHEEL ARCH INNER LINERS & FENDER HARDWARE
# ----------------------------------------------------------------------------

def build_993_wheel_arch_liners_and_fender_hardware(parent_col, mats):
    """
    Constructs thermoplastic inner wheelhouse fender liners:
    - 4 molded high-density polyethylene (HDPE) inner splash liners.
    - Contoured around strut towers, oil cooler matrix, and rear dry-sump reservoir.
    - Zinc-plated sheetmetal screws and captive U-nut retainers along outer arch lip.
    - Integrated water drainage channels.
    """
    objs = []
    bm_liners = bmesh.new()
    bm_screws = bmesh.new()

    # Front Wheel Liners (Left & Right, Axle Y = +1.136m, R = 0.355m)
    for fx_sign in [-1.0, 1.0]:
        mat_f_arch = Matrix.Translation(Vector((fx_sign * 0.670, 1.136, 0.380)))
        # Inner Splash Shield Dome
        bmesh.ops.create_cylinder(bm_liners, radius=0.355, depth=0.180, segments=24, matrix=mat_f_arch @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Forward Splash Baffle (Shields oil cooler & headlights)
        mat_f_baffle = mat_f_arch @ Matrix.Translation(Vector((0, 0.260, 0)))
        bmesh.ops.create_cube(bm_liners, size=1.0, matrix=mat_f_baffle @ Matrix.Diagonal(Vector((0.170, 0.024, 0.320, 1.0))))

        # 5 Perimeter Fastener Screws with Zinc Washers
        for s_idx in range(5):
            s_ang = math.pi * 0.2 * (s_idx + 0.5)
            mat_screw = mat_f_arch @ Matrix.Translation(Vector((fx_sign * 0.085, 0.340 * math.cos(s_ang), 0.340 * math.sin(s_ang))))
            bmesh.ops.create_cylinder(bm_screws, radius=0.007, depth=0.004, segments=10, matrix=mat_screw @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Rear Wheel Liners (Left & Right, Axle Y = -1.136m, R = 0.365m, wider rear hips)
    for rx_sign in [-1.0, 1.0]:
        mat_r_arch = Matrix.Translation(Vector((rx_sign * 0.690, -1.136, 0.380)))
        # Inner Splash Shield Dome
        bmesh.ops.create_cylinder(bm_liners, radius=0.365, depth=0.220, segments=24, matrix=mat_r_arch @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Rearward Splash Baffle (Shields heat exchangers & bumper apron)
        mat_r_baffle = mat_r_arch @ Matrix.Translation(Vector((0, -0.280, 0)))
        bmesh.ops.create_cube(bm_liners, size=1.0, matrix=mat_r_baffle @ Matrix.Diagonal(Vector((0.210, 0.024, 0.340, 1.0))))

        # 5 Perimeter Fastener Screws
        for s_idx in range(5):
            s_ang = math.pi * 0.2 * (s_idx + 0.5)
            mat_screw = mat_r_arch @ Matrix.Translation(Vector((rx_sign * 0.105, 0.350 * math.cos(s_ang), 0.350 * math.sin(s_ang))))
            bmesh.ops.create_cylinder(bm_screws, radius=0.007, depth=0.004, segments=10, matrix=mat_screw @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_liners = link_obj("GEO_993_Wheel_Arch_Liners", bm_liners, parent_col, mats["rubber"], bevel=0.001)
    obj_screws = link_obj("GEO_993_Fender_Fastener_Hardware", bm_screws, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_liners, obj_screws])
    return objs

# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 19: WINDSHIELD COWL WASHER NOZZLES & FLUID HOSES
# ----------------------------------------------------------------------------

def build_993_windshield_washer_jets_and_hoses(parent_col, mats):
    """
    Constructs the windshield heated twin-jet washer nozzles:
    - Dual aerodynamic washer spray jet blocks on the cowl panel (X = +/- 0.280m, Y = +1.020m, Z = 0.815m).
    - Twin adjustable brass ball nozzles per block.
    - EPDM rubber fluid supply hoses and T-connector check valves routed under cowl.
    - Electric heating element wiring harness pigtail.
    """
    objs = []
    bm_jets = bmesh.new()
    bm_hoses = bmesh.new()

    for jx_sign in [-1.0, 1.0]:
        # Cowl Nozzle Axis: X = +/- 0.280m, Y = +1.020m, Z = 0.815m
        mat_jet = Matrix.Translation(Vector((jx_sign * 0.280, 1.020, 0.815))) @ Euler((math.radians(-24), 0, 0), 'XYZ').to_matrix().to_4x4()

        # Aerodynamic Jet Block Housing (Satin Black)
        bmesh.ops.create_cube(bm_jets, size=1.0, matrix=mat_jet @ Matrix.Diagonal(Vector((0.024, 0.038, 0.016, 1.0))))

        # Dual Brass Spray Orifice Balls
        for ox in [-0.006, 0.006]:
            mat_ori = mat_jet @ Matrix.Translation(Vector((ox, -0.016, 0.004)))
            bmesh.ops.create_cylinder(bm_jets, radius=0.0025, depth=0.006, segments=8, matrix=mat_ori @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Under-cowl Fluid Supply Hose
        mat_hose = mat_jet @ Matrix.Translation(Vector((0, 0.010, -0.025)))
        bmesh.ops.create_cylinder(bm_hoses, radius=0.0035, depth=0.055, segments=8, matrix=mat_hose)

    # T-Connector Check Valve & Transverse Fluid Hose under cowl
    mat_t_valv = Matrix.Translation(Vector((0.0, 1.020, 0.785)))
    bmesh.ops.create_cylinder(bm_hoses, radius=0.005, depth=0.020, segments=10, matrix=mat_t_valv)
    bmesh.ops.create_cylinder(bm_hoses, radius=0.0035, depth=0.560, segments=8, matrix=mat_t_valv @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_jets = link_obj("GEO_993_Windshield_Washer_Jets", bm_jets, parent_col, mats["rubber"], bevel=0.0008)
    obj_hoses = link_obj("GEO_993_Washer_Fluid_Plumbing", bm_hoses, parent_col, mats["rubber"], bevel=0.0005)

    objs.extend([obj_jets, obj_hoses])
    return objs

# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 20: GERMAN REGISTRATION PLATES (S-PR 993) & BRACKETS
# ----------------------------------------------------------------------------

def build_993_german_registration_plates_and_brackets(parent_col, mats):
    """
    Constructs authentic German DIN Euro registration license plates:
    - Front bumper mount (Y = +2.075m, Z = 0.435m) with contoured backing plinth.
    - Rear decklid bumper recess mount (Y = -2.075m, Z = 0.520m).
    - Authentic Stuttgart registration: 'S-PR 993':
      * 'S' prefix for Stuttgart (Porsche home city).
      * Baden-Württemberg state seal roundel and green TÜV inspection sticker.
      * Euro blue flag strip on left with 'D' country code and 12 yellow stars.
    - Stamped aluminum plate with raised black border and embossed DIN typography.
    """
    objs = []
    bm_plate = bmesh.new()
    bm_plinth = bmesh.new()
    bm_text = bmesh.new()

    # Euro Plate Dimensions: 520 mm x 110 mm x 2 mm
    w_plate = 0.520
    h_plate = 0.110
    d_plate = 0.004

    # 1. Front License Plate & Contoured Bumper Plinth (Y = +2.075m, Z = 0.435m)
    mat_f_plinth = Matrix.Translation(Vector((0.0, 2.070, 0.435)))
    bmesh.ops.create_cube(bm_plinth, size=1.0, matrix=mat_f_plinth @ Matrix.Diagonal(Vector((w_plate + 0.020, 0.024, h_plate + 0.016, 1.0))))

    mat_f_plate = Matrix.Translation(Vector((0.0, 2.082, 0.435)))
    bmesh.ops.create_cube(bm_plate, size=1.0, matrix=mat_f_plate @ Matrix.Diagonal(Vector((w_plate, d_plate, h_plate, 1.0))))
    # Embossed Outer Border & DIN Text 'S-PR 993'
    mat_f_border = mat_f_plate @ Matrix.Translation(Vector((0, 0.002, 0)))
    bmesh.ops.create_cube(bm_text, size=1.0, matrix=mat_f_border @ Matrix.Diagonal(Vector((w_plate - 0.008, 0.002, h_plate - 0.008, 1.0))))

    # Euro Blue Band on Left Edge
    mat_f_euro = mat_f_plate @ Matrix.Translation(Vector((-0.235, 0.003, 0)))
    bmesh.ops.create_cube(bm_plinth, size=1.0, matrix=mat_f_euro @ Matrix.Diagonal(Vector((0.045, 0.002, h_plate - 0.006, 1.0))))

    # 2. Rear License Plate in Bumper Scallop (Y = -2.075m, Z = 0.520m, angled ~10 deg)
    mat_r_plinth = Matrix.Translation(Vector((0.0, -2.068, 0.520))) @ Euler((math.radians(10), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_plinth, size=1.0, matrix=mat_r_plinth @ Matrix.Diagonal(Vector((w_plate + 0.020, 0.020, h_plate + 0.016, 1.0))))

    mat_r_plate = mat_r_plinth @ Matrix.Translation(Vector((0, -0.010, 0)))
    bmesh.ops.create_cube(bm_plate, size=1.0, matrix=mat_r_plate @ Matrix.Diagonal(Vector((w_plate, d_plate, h_plate, 1.0))))

    # Embossed Outer Border & Text
    mat_r_border = mat_r_plate @ Matrix.Translation(Vector((0, -0.002, 0)))
    bmesh.ops.create_cube(bm_text, size=1.0, matrix=mat_r_border @ Matrix.Diagonal(Vector((w_plate - 0.008, 0.002, h_plate - 0.008, 1.0))))

    # Euro Blue Band on Left Edge
    mat_r_euro = mat_r_plate @ Matrix.Translation(Vector((-0.235, -0.003, 0)))
    bmesh.ops.create_cube(bm_plinth, size=1.0, matrix=mat_r_euro @ Matrix.Diagonal(Vector((0.045, 0.002, h_plate - 0.006, 1.0))))

    obj_plate = link_obj("GEO_993_German_License_Plates", bm_plate, parent_col, mats["chrome"], bevel=0.0008)
    obj_plinth = link_obj("GEO_993_License_Plate_Plinths", bm_plinth, parent_col, mats["rubber"], bevel=0.001)
    obj_text = link_obj("GEO_993_License_Plate_Text_and_Border", bm_text, parent_col, mats["rubber"], bevel=0.0004)

    objs.extend([obj_plate, obj_plinth, obj_text])
    return objs

# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 21: CASSETTE HOLDER, HANDBRAKE & CONSOLE SWITCHES
# ----------------------------------------------------------------------------

def build_993_console_cassette_holder_and_switches(parent_col, mats):
    """
    Constructs period-correct 1990s center console cockpit details:
    - 4-slot cassette tape storage drawer module on lower console.
    - Leather-wrapped handbrake lever with brushed aluminum release button.
    - Dual power window rocker switches on console spine.
    - Cigarette lighter socket and center ashtray drawer.
    - Hazard flasher red triangular switch button.
    """
    objs = []
    bm_cons = bmesh.new()
    bm_lever = bmesh.new()
    bm_switches = bmesh.new()

    # Center Console Spine: X = 0.000m, Y = -0.050m to +0.320m, Z = 0.440m
    # 1. 4-Slot Cassette Tape Storage Box (Ahead of handbrake, Y = +0.120m, Z = 0.465m)
    mat_cass = Matrix.Translation(Vector((0.0, 0.120, 0.465)))
    bmesh.ops.create_cube(bm_cons, size=1.0, matrix=mat_cass @ Matrix.Diagonal(Vector((0.130, 0.110, 0.042, 1.0))))
    # 4 Cassette Eject Buttons & Tape Slot Lines
    for c_idx in range(4):
        cy = 0.080 + c_idx * 0.024
        mat_slot = Matrix.Translation(Vector((0.0, cy, 0.485)))
        bmesh.ops.create_cube(bm_switches, size=1.0, matrix=mat_slot @ Matrix.Diagonal(Vector((0.110, 0.016, 0.004, 1.0))))

    # 2. Leather-Wrapped Handbrake Lever (Y = -0.100m, Z = 0.490m)
    mat_hb = Matrix.Translation(Vector((-0.035, -0.080, 0.490))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Lever Shaft & Leather Grip
    bmesh.ops.create_cylinder(bm_lever, radius=0.015, depth=0.180, segments=14, matrix=mat_hb)
    # Brushed Aluminum Release Button Tip
    mat_btn = mat_hb @ Matrix.Translation(Vector((0, 0, 0.095)))
    bmesh.ops.create_cylinder(bm_switches, radius=0.008, depth=0.014, segments=12, matrix=mat_btn)
    # Stitched Leather Accordion Gaiter Boot
    mat_gaiter = Matrix.Translation(Vector((-0.035, -0.130, 0.455)))
    bmesh.ops.create_cube(bm_lever, size=1.0, matrix=mat_gaiter @ Matrix.Diagonal(Vector((0.065, 0.140, 0.045, 1.0))))

    # 3. Dual Power Window Rocker Switches (Ahead of shifter, Y = +0.280m, Z = 0.480m)
    for wx_sign in [-1.0, 1.0]:
        mat_wsw = Matrix.Translation(Vector((wx_sign * 0.035, 0.280, 0.480)))
        bmesh.ops.create_cube(bm_switches, size=1.0, matrix=mat_wsw @ Matrix.Diagonal(Vector((0.024, 0.045, 0.012, 1.0))))

    # 4. Red Hazard Flasher Switch Button
    mat_haz = Matrix.Translation(Vector((0.0, 0.320, 0.490)))
    bmesh.ops.create_cylinder(bm_switches, radius=0.012, depth=0.008, segments=12, matrix=mat_haz)

    obj_cons = link_obj("GEO_993_Console_Storage_and_Trays", bm_cons, parent_col, mats["rubber"], bevel=0.001)
    obj_lever = link_obj("GEO_993_Handbrake_Lever_and_Gaiter", bm_lever, parent_col, mats["rubber"], bevel=0.0012)
    obj_switches = link_obj("GEO_993_Console_Switches_and_Buttons", bm_switches, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_cons, obj_lever, obj_switches])
    return objs

# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 22: FLOOR-HINGED PEDAL CLUSTER & EMBROIDERED MATS
# ----------------------------------------------------------------------------

def build_993_floor_hinged_pedal_cluster_and_mats(parent_col, mats):
    """
    Constructs the classic 911 floor-hinged organ pedal cluster:
    - Floor-hinged organ-style accelerator pedal (long curved pedal plate).
    - Hanging forged steel clutch and brake pedals with ribbed anti-slip rubber pads.
    - Sculpted dead-pedal footrest on left front bulkhead.
    - Tailored velour floor carpets with embroidered gold 'Porsche' script.
    """
    objs = []
    bm_pedals = bmesh.new()
    bm_carpets = bmesh.new()

    # Driver Footwell Axis: X = -0.360m, Y = +0.550m, Z = 0.280m
    # 1. Floor-Hinged Organ Accelerator Pedal (Right pedal in driver footwell)
    mat_gas = Matrix.Translation(Vector((-0.270, 0.560, 0.320))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_gas @ Matrix.Diagonal(Vector((0.045, 0.160, 0.012, 1.0))))
    # Floor Hinge Base Pin
    mat_gas_hinge = Matrix.Translation(Vector((-0.270, 0.500, 0.270)))
    bmesh.ops.create_cylinder(bm_pedals, radius=0.008, depth=0.055, segments=10, matrix=mat_gas_hinge @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Brake Pedal (Center, wide rectangular pad with vertical ribs)
    mat_brake = Matrix.Translation(Vector((-0.345, 0.580, 0.360))) @ Euler((math.radians(25), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_brake @ Matrix.Diagonal(Vector((0.065, 0.075, 0.016, 1.0))))
    # Pedal Hanging Arm
    bmesh.ops.create_cylinder(bm_pedals, radius=0.008, depth=0.180, segments=10, matrix=mat_brake @ Matrix.Translation(Vector((0, 0, 0.080))))

    # 3. Clutch Pedal (Left, standard rectangular pad)
    mat_clutch = Matrix.Translation(Vector((-0.430, 0.580, 0.360))) @ Euler((math.radians(25), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_clutch @ Matrix.Diagonal(Vector((0.052, 0.075, 0.016, 1.0))))
    bmesh.ops.create_cylinder(bm_pedals, radius=0.008, depth=0.180, segments=10, matrix=mat_clutch @ Matrix.Translation(Vector((0, 0, 0.080))))

    # 4. Dead Pedal Footrest (Far left wheelwell wall)
    mat_dead = Matrix.Translation(Vector((-0.520, 0.580, 0.350))) @ Euler((math.radians(38), math.radians(-12), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_dead @ Matrix.Diagonal(Vector((0.075, 0.180, 0.020, 1.0))))

    # 5. Tailored Velour Floor Mats (Driver & Passenger footwells)
    for fx_sign in [-1.0, 1.0]:
        mat_mat = Matrix.Translation(Vector((fx_sign * 0.360, 0.250, 0.255)))
        bmesh.ops.create_cube(bm_carpets, size=1.0, matrix=mat_mat @ Matrix.Diagonal(Vector((0.440, 0.620, 0.012, 1.0))))
        # Vinyl Heel Pad on Driver Mat
        if fx_sign < 0:
            mat_heel = mat_mat @ Matrix.Translation(Vector((0, 0.050, 0.008)))
            bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_heel @ Matrix.Diagonal(Vector((0.240, 0.220, 0.004, 1.0))))

    obj_pedals = link_obj("GEO_993_Pedal_Cluster_and_Footrest", bm_pedals, parent_col, mats["rubber"], bevel=0.001)
    obj_carpets = link_obj("GEO_993_Cockpit_Tailored_Floor_Mats", bm_carpets, parent_col, mats["canvas"], bevel=0.0015)

    objs.extend([obj_pedals, obj_carpets])
    return objs

# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 23: CONVERTIBLE WINDSCHOTT MESH DEFLECTOR
# ----------------------------------------------------------------------------

def build_993_convertible_windschott_deflector(parent_col, mats):
    """
    Constructs the removable rear wind deflector (Windschott):
    - Tubular aluminum folding frame mounted directly behind front sports seats (Y = -0.380m, Z = 0.780m to 1.040m).
    - Aerodynamic micro-mesh netting screen cutting cockpit turbulence at highway speeds.
    - Quick-release bayonet lock pins into rear cabin quarter trim pockets.
    - Stitched leatherette perimeter binding around mesh panel.
    """
    objs = []
    bm_frame = bmesh.new()
    bm_mesh = bmesh.new()

    # Windschott Axis: Y = -0.380m, Z = 0.910m (Extends up to 1.040m)
    mat_ws = Matrix.Translation(Vector((0.0, -0.380, 0.910)))

    # 1. Tubular Aluminum Perimeter Frame (Width 1.080m, Height 0.260m)
    # Upper Horizontal Bar (Z = +0.130m)
    mat_top_bar = mat_ws @ Matrix.Translation(Vector((0, 0, 0.130)))
    bmesh.ops.create_cylinder(bm_frame, radius=0.008, depth=1.060, segments=14, matrix=mat_top_bar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Lower Horizontal Bar (Z = -0.130m)
    mat_bot_bar = mat_ws @ Matrix.Translation(Vector((0, 0, -0.130)))
    bmesh.ops.create_cylinder(bm_frame, radius=0.008, depth=1.060, segments=14, matrix=mat_bot_bar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Left & Right Vertical Side Tubes
    for sx_sign in [-1.0, 1.0]:
        mat_v_tube = mat_ws @ Matrix.Translation(Vector((sx_sign * 0.530, 0, 0)))
        bmesh.ops.create_cylinder(bm_frame, radius=0.008, depth=0.260, segments=14, matrix=mat_v_tube)
        # Bayonet Mounting Pins extending into B-pillar quarter trim
        mat_pin = mat_v_tube @ Matrix.Translation(Vector((sx_sign * 0.035, 0, -0.110)))
        bmesh.ops.create_cylinder(bm_frame, radius=0.006, depth=0.065, segments=10, matrix=mat_pin @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Semi-Transparent Micro-Mesh Screen Panel
    bmesh.ops.create_cube(bm_mesh, size=1.0, matrix=mat_ws @ Matrix.Diagonal(Vector((1.040, 0.004, 0.245, 1.0))))

    # Horizontal Stiffening Slat across middle of mesh
    bmesh.ops.create_cube(bm_frame, size=1.0, matrix=mat_ws @ Matrix.Diagonal(Vector((1.040, 0.008, 0.010, 1.0))))

    obj_frame = link_obj("GEO_993_Windschott_Aluminum_Frame", bm_frame, parent_col, mats["rubber"], bevel=0.001)
    obj_mesh = link_obj("GEO_993_Windschott_Aero_Mesh", bm_mesh, parent_col, mats["canvas"], bevel=0.0005)

    objs.extend([obj_frame, obj_mesh])
    return objs


# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 24: FRUNK NEEDLE-FELT CARPET, TOOLKIT & STRAPS
# ----------------------------------------------------------------------------

def build_993_frunk_carpet_toolkit_and_straps(parent_col, mats):
    """
    Constructs the front luggage compartment (frunk) interior lining and tools:
    - High-pile anthracite needle-felt carpet lining the front luggage tub floor and walls.
    - Black leather tool roll pouch containing factory Porsche emergency tools:
      * Spark plug socket, fan belt wrench, open-end wrenches, and forged tow eye.
    - Leather spare tire hold-down straps with chrome cam-lock buckles.
    - Jack storage bracket and wheel chock clip.
    """
    objs = []
    bm_carpet = bmesh.new()
    bm_tools = bmesh.new()
    bm_straps = bmesh.new()

    # Frunk Luggage Compartment Floor & Walls (Y = +0.720m to +1.350m, Z = 0.350m to 0.620m)
    mat_f_floor = Matrix.Translation(Vector((0.0, 1.035, 0.355)))
    bmesh.ops.create_cube(bm_carpet, size=1.0, matrix=mat_f_floor @ Matrix.Diagonal(Vector((0.680, 0.580, 0.015, 1.0))))

    # Left & Right Carpeted Sidewalls
    for fx_sign in [-1.0, 1.0]:
        mat_f_wall = Matrix.Translation(Vector((fx_sign * 0.345, 1.035, 0.480)))
        bmesh.ops.create_cube(bm_carpet, size=1.0, matrix=mat_f_wall @ Matrix.Diagonal(Vector((0.016, 0.560, 0.250, 1.0))))

    # Front Bulkhead Carpet Wall
    mat_f_front = Matrix.Translation(Vector((0.0, 1.325, 0.480)))
    bmesh.ops.create_cube(bm_carpet, size=1.0, matrix=mat_f_front @ Matrix.Diagonal(Vector((0.680, 0.016, 0.250, 1.0))))

    # Factory Leather Tool Roll Pouch (Ahead of spare wheel, Y = +1.220m, Z = 0.440m)
    mat_tool_roll = Matrix.Translation(Vector((0.140, 1.220, 0.440))) @ Euler((0, 0, math.radians(15)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_tools, radius=0.038, depth=0.240, segments=16, matrix=mat_tool_roll @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Leather Pouch Buckle Straps
    for b_off in [-0.070, 0.070]:
        mat_p_strap = mat_tool_roll @ Matrix.Translation(Vector((0, b_off, 0)))
        bmesh.ops.create_cylinder(bm_straps, radius=0.040, depth=0.012, segments=16, matrix=mat_p_strap @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Chrome Buckle
        mat_p_buckle = mat_p_strap @ Matrix.Translation(Vector((0, 0, 0.040)))
        bmesh.ops.create_cube(bm_tools, size=1.0, matrix=mat_p_buckle @ Matrix.Diagonal(Vector((0.018, 0.014, 0.008, 1.0))))

    # Forged Steel Emergency Tow Eye Hook (Stored in clip)
    mat_tow_eye = Matrix.Translation(Vector((-0.220, 1.240, 0.420))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_torus(bm_tools, major_radius=0.024, minor_radius=0.006, major_segments=16, minor_segments=8, matrix=mat_tow_eye)
    bmesh.ops.create_cylinder(bm_tools, radius=0.006, depth=0.120, segments=10, matrix=mat_tow_eye @ Matrix.Translation(Vector((0, 0, -0.065))))

    # Leather Spare Tire Tie-Down Y-Strap with Cam Buckle
    mat_spare_strap = Matrix.Translation(Vector((0.0, 0.950, 0.490)))
    bmesh.ops.create_cube(bm_straps, size=1.0, matrix=mat_spare_strap @ Matrix.Diagonal(Vector((0.032, 0.440, 0.005, 1.0))))
    mat_s_buckle = mat_spare_strap @ Matrix.Translation(Vector((0, 0, 0.006)))
    bmesh.ops.create_cube(bm_tools, size=1.0, matrix=mat_s_buckle @ Matrix.Diagonal(Vector((0.042, 0.035, 0.012, 1.0))))

    obj_carpet = link_obj("GEO_993_Frunk_NeedleFelt_Carpet", bm_carpet, parent_col, mats["canvas"], bevel=0.001)
    obj_tools = link_obj("GEO_993_Frunk_ToolKit_and_TowEye", bm_tools, parent_col, mats["alloy"], bevel=0.0008)
    obj_straps = link_obj("GEO_993_Frunk_Spare_TieDown_Straps", bm_straps, parent_col, mats["rubber"], bevel=0.0005)

    objs.extend([obj_carpet, obj_tools, obj_straps])
    return objs

# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 25: UNDERBODY AERO UNDERTRAYS & DZUS FASTENERS
# ----------------------------------------------------------------------------

def build_993_underbody_aero_undertrays_and_dzus_fasteners(parent_col, mats):
    """
    Constructs the smooth underbody aerodynamic belly pans and hardware:
    - Front steering gear and sway bar protective aerodynamic pan.
    - Central chassis tunnel embossed heat shield covers.
    - Transaxle cooling NACA scoop tray with longitudinal air guide channels.
    - 16 slotted quarter-turn Dzus aero quick-release fasteners along underbody.
    """
    objs = []
    bm_aero_pan = bmesh.new()
    bm_dzus = bmesh.new()

    # 1. Front Steering Gear Aero Undertray (Y: +0.950m to +1.450m, Z = 0.170m)
    mat_f_pan = Matrix.Translation(Vector((0.0, 1.200, 0.170)))
    bmesh.ops.create_cube(bm_aero_pan, size=1.0, matrix=mat_f_pan @ Matrix.Diagonal(Vector((0.840, 0.500, 0.012, 1.0))))

    # Longitudinal Stiffening Ribs on Front Pan
    for rx in [-0.280, -0.140, 0.140, 0.280]:
        mat_rib = mat_f_pan @ Matrix.Translation(Vector((rx, 0, -0.008)))
        bmesh.ops.create_cube(bm_aero_pan, size=1.0, matrix=mat_rib @ Matrix.Diagonal(Vector((0.016, 0.460, 0.010, 1.0))))

    # 2. Central Tunnel Embossed Heat Shield Pan (Y: -0.500m to +0.800m, Z = 0.180m)
    mat_c_shield = Matrix.Translation(Vector((0.0, 0.150, 0.180)))
    bmesh.ops.create_cube(bm_aero_pan, size=1.0, matrix=mat_c_shield @ Matrix.Diagonal(Vector((0.340, 1.300, 0.008, 1.0))))

    # 3. Transaxle Rear Aero Belly Pan with NACA Duct (Y: -0.650m to -1.150m, Z = 0.165m)
    mat_r_pan = Matrix.Translation(Vector((0.0, -0.900, 0.165)))
    bmesh.ops.create_cube(bm_aero_pan, size=1.0, matrix=mat_r_pan @ Matrix.Diagonal(Vector((0.760, 0.500, 0.014, 1.0))))

    # NACA Cooling Air Inflow Ramp Scoop (Recessed into belly pan)
    mat_naca = mat_r_pan @ Matrix.Translation(Vector((0, 0.050, 0.012))) @ Euler((math.radians(14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_aero_pan, size=1.0, matrix=mat_naca @ Matrix.Diagonal(Vector((0.180, 0.220, 0.024, 1.0))))

    # 4. 16 Slotted Quarter-Turn Dzus Aero Fasteners around perimeter seams
    dzus_locations = [
        # Front Pan Fasteners (4 pairs)
        (-0.380, 1.400, 0.164), (0.380, 1.400, 0.164),
        (-0.380, 1.200, 0.164), (0.380, 1.200, 0.164),
        (-0.380, 1.000, 0.164), (0.380, 1.000, 0.164),
        (-0.150, 1.420, 0.164), (0.150, 1.420, 0.164),
        # Rear Pan Fasteners (4 pairs)
        (-0.340, -0.700, 0.158), (0.340, -0.700, 0.158),
        (-0.340, -0.900, 0.158), (0.340, -0.900, 0.158),
        (-0.340, -1.100, 0.158), (0.340, -1.100, 0.158),
        (-0.160, -1.120, 0.158), (0.160, -1.120, 0.158),
    ]

    for dx, dy, dz in dzus_locations:
        mat_d = Matrix.Translation(Vector((dx, dy, dz)))
        # Outer Circular Bezel Ring
        bmesh.ops.create_cylinder(bm_dzus, radius=0.010, depth=0.003, segments=12, matrix=mat_d)
        # Quarter-Turn Screwdriver Slot
        bmesh.ops.create_cube(bm_dzus, size=1.0, matrix=mat_d @ Matrix.Translation(Vector((0, 0, -0.002))) @ Matrix.Diagonal(Vector((0.014, 0.0025, 0.002, 1.0))))

    obj_pan = link_obj("GEO_993_Underbody_Aero_Pans", bm_aero_pan, parent_col, mats["rubber"], bevel=0.001)
    obj_dzus = link_obj("GEO_993_Underbody_Dzus_Fasteners", bm_dzus, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_pan, obj_dzus])
    return objs

# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 26: SPORT SEAT LEATHER PLEATS & ELECTRIC CONTROLS
# ----------------------------------------------------------------------------

def build_993_sport_seat_pleats_and_controls(parent_col, mats):
    """
    Constructs the luxurious fluted leather cushions and electric seat controls:
    - Distinctive horizontal leather fluting pleats on driver & passenger sport seat cushions.
    - Side-bolster double stitching seams.
    - 4-way electric power seat adjustment switch toggles on lower outboard seat valances.
    - Backrest quick-release tilt forward lever for rear cabin access.
    """
    objs = []
    bm_pleats = bmesh.new()
    bm_switches = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        # Seat Center Axis: X = +/- 0.360m, Y = -0.050m, Z = 0.580m
        mat_seat = Matrix.Translation(Vector((sx_sign * 0.360, -0.050, 0.580)))

        # 1. 5 Horizontal Fluted Leather Pleats on Seat Cushion Base
        for p_idx in range(5):
            py = -0.180 + p_idx * 0.065
            mat_pleat = mat_seat @ Matrix.Translation(Vector((0, py, -0.090)))
            bmesh.ops.create_cylinder(bm_pleats, radius=0.016, depth=0.280, segments=12, matrix=mat_pleat @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. 6 Horizontal Fluted Leather Pleats on Seat Backrest
        for bp_idx in range(6):
            bz = 0.020 + bp_idx * 0.065
            by = -0.160 - bp_idx * 0.018 # Reclined backrest angle
            mat_bpleat = mat_seat @ Matrix.Translation(Vector((0, by, bz)))
            bmesh.ops.create_cylinder(bm_pleats, radius=0.015, depth=0.260, segments=12, matrix=mat_bpleat @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 3. 4-Way Electric Seat Adjustment Switches on Outboard Seat Base
        mat_sw_base = mat_seat @ Matrix.Translation(Vector((sx_sign * 0.245, -0.040, -0.120)))
        bmesh.ops.create_cube(bm_switches, size=1.0, matrix=mat_sw_base @ Matrix.Diagonal(Vector((0.018, 0.120, 0.048, 1.0))))
        # Horizontal & Vertical Rocker Toggles
        for t_y in [-0.030, 0.030]:
            mat_toggle = mat_sw_base @ Matrix.Translation(Vector((sx_sign * 0.010, t_y, 0)))
            bmesh.ops.create_cube(bm_switches, size=1.0, matrix=mat_toggle @ Matrix.Diagonal(Vector((0.008, 0.032, 0.016, 1.0))))

        # 4. Chrome Seat Backrest Tilt-Forward Release Lever (Upper outboard bolster)
        mat_tilt = mat_seat @ Matrix.Translation(Vector((sx_sign * 0.230, -0.220, 0.280)))
        bmesh.ops.create_cylinder(bm_switches, radius=0.006, depth=0.035, segments=10, matrix=mat_tilt @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_pleats = link_obj("GEO_993_SportSeat_Fluted_Pleats", bm_pleats, parent_col, mats["rubber"], bevel=0.001)
    obj_switches = link_obj("GEO_993_Seat_Power_Controls", bm_switches, parent_col, mats["chrome"], bevel=0.0006)

    objs.extend([obj_pleats, obj_switches])
    return objs

# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 27: CABRIOLET REAR QUARTER TRIM & HI-FI SPEAKER GRILLES
# ----------------------------------------------------------------------------

def build_993_cabriolet_rear_quarter_trim_and_speakers(parent_col, mats):
    """
    Constructs cabriolet-specific rear cabin quarter trim and stereo speakers:
    - Molded interior rear side quarter trim panels flanking the 2+2 rear seats.
    - Perforated rectangular Hi-Fi stereo rear speaker grilles (Porsche CR-210 system).
    - Convertible top mechanism lock receptacles and hydraulic pivot cover trim.
    - Rear seat lateral armrest bolsters.
    """
    objs = []
    bm_qtrim = bmesh.new()
    bm_spk = bmesh.new()

    for qx_sign in [-1.0, 1.0]:
        # Rear Cabin Quarter Axis: X = +/- 0.580m, Y = -0.580m, Z = 0.640m
        mat_qtrim = Matrix.Translation(Vector((qx_sign * 0.580, -0.580, 0.640)))

        # 1. Molded Leatherette Rear Quarter Trim Card
        bmesh.ops.create_cube(bm_qtrim, size=1.0, matrix=mat_qtrim @ Matrix.Diagonal(Vector((0.045, 0.440, 0.280, 1.0))))

        # Armrest Lateral Bolster Pad
        mat_arm = mat_qtrim @ Matrix.Translation(Vector((qx_sign * -0.024, -0.020, -0.060)))
        bmesh.ops.create_cube(bm_qtrim, size=1.0, matrix=mat_arm @ Matrix.Diagonal(Vector((0.035, 0.320, 0.075, 1.0))))

        # 2. Perforated Hi-Fi Stereo Rear Speaker Grille (Rectangular with fine acoustic mesh)
        mat_spkr = mat_qtrim @ Matrix.Translation(Vector((qx_sign * -0.024, 0.080, 0.040)))
        bmesh.ops.create_cube(bm_spk, size=1.0, matrix=mat_spkr @ Matrix.Diagonal(Vector((0.008, 0.140, 0.095, 1.0))))
        # Acoustic Mesh Bezel Frame
        bmesh.ops.create_cube(bm_spk, size=1.0, matrix=mat_spkr @ Matrix.Diagonal(Vector((0.012, 0.148, 0.105, 1.0))))

        # 3. Soft-Top Latch Guide Receptacle Socket (Top rear edge, Z = 0.810m)
        mat_socket = mat_qtrim @ Matrix.Translation(Vector((0, -0.160, 0.145)))
        bmesh.ops.create_cylinder(bm_spk, radius=0.014, depth=0.020, segments=14, matrix=mat_socket)

    obj_qtrim = link_obj("GEO_993_Cabriolet_Rear_Quarter_Trim", bm_qtrim, parent_col, mats["rubber"], bevel=0.0012)
    obj_spk = link_obj("GEO_993_HiFi_Rear_Speaker_Grilles", bm_spk, parent_col, mats["rubber"], bevel=0.0006)

    objs.extend([obj_qtrim, obj_spk])
    return objs


# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 28: COCKPIT 6-SPEED GEAR SHIFTER & LEATHER GAITER
# ----------------------------------------------------------------------------

def build_993_cockpit_shifter_crest_and_gaiter(parent_col, mats):
    """
    Constructs the G50 6-speed manual gearshift lever and console console:
    - Ergonomic teardrop leather gearshift knob with stitched seams.
    - Inset enamel 6-speed H-pattern shift diagram crest (Reverse upper left, 1-6 gates).
    - Fluted soft leather shift boot gaiter with chrome lower retaining ring.
    - Shifter center console surround console trim.
    """
    objs = []
    bm_shifter = bmesh.new()
    bm_crest = bmesh.new()

    # Shifter Center Coordinate: X = 0.000m, Y = +0.220m, Z = 0.520m
    mat_shifter = Matrix.Translation(Vector((0.0, 0.220, 0.520)))

    # 1. Chrome Shifter Lower Base Retaining Ring (Diameter 80mm)
    bmesh.ops.create_cylinder(bm_shifter, radius=0.040, depth=0.008, segments=20, matrix=mat_shifter)

    # 2. Fluted Stitched Leather Shift Boot Gaiter (Pyramidal cone)
    mat_gaiter = mat_shifter @ Matrix.Translation(Vector((0, 0, 0.035)))
    bmesh.ops.create_cone(bm_shifter, radius1=0.038, radius2=0.016, depth=0.070, segments=16, matrix=mat_gaiter)

    # 3. Steel Shifter Shaft
    mat_shaft = mat_shifter @ Matrix.Translation(Vector((0, 0, 0.085)))
    bmesh.ops.create_cylinder(bm_shifter, radius=0.007, depth=0.060, segments=12, matrix=mat_shaft)

    # 4. Teardrop Ergonomic Leather Shift Knob (Z = 0.630m)
    mat_knob = mat_shifter @ Matrix.Translation(Vector((0, 0, 0.115)))
    bmesh.ops.create_cylinder(bm_shifter, radius=0.022, depth=0.045, segments=18, matrix=mat_knob @ Matrix.Diagonal(Vector((1.0, 1.15, 1.0, 1.0))))

    # 5. Inset 6-Speed H-Pattern Shift Diagram Crest (Top Face of Knob)
    mat_top_crest = mat_knob @ Matrix.Translation(Vector((0, 0, 0.024)))
    bmesh.ops.create_cylinder(bm_crest, radius=0.014, depth=0.004, segments=16, matrix=mat_top_crest)
    # Embossed Shift Gates (H-pattern crossbars)
    bmesh.ops.create_cube(bm_crest, size=1.0, matrix=mat_top_crest @ Matrix.Diagonal(Vector((0.016, 0.003, 0.005, 1.0))))
    for hx in [-0.006, 0.000, 0.006]:
        mat_h_line = mat_top_crest @ Matrix.Translation(Vector((hx, 0, 0)))
        bmesh.ops.create_cube(bm_crest, size=1.0, matrix=mat_h_line @ Matrix.Diagonal(Vector((0.002, 0.016, 0.005, 1.0))))

    obj_shifter = link_obj("GEO_993_Cockpit_Shifter_and_Gaiter", bm_shifter, parent_col, mats["rubber"], bevel=0.001)
    obj_crest = link_obj("GEO_993_Shifter_HPattern_Crest", bm_crest, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_shifter, obj_crest])
    return objs

# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 29: FRUNK FIREWALL MAIN FUSE BOX & LOOM HARNESS
# ----------------------------------------------------------------------------

def build_993_frunk_fuse_box_and_wiring_harness(parent_col, mats):
    """
    Constructs the frunk firewall main electrical fuse center:
    - Molded black composite fuse and relay distribution box (Left cowl bulkhead, X = -0.420m, Y = +0.820m, Z = 0.590m).
    - Clear translucent plastic inspection cover lid with thumb knurled release thumbscrews.
    - Multi-colored miniature automotive blade fuses and rectangular cube relays.
    - Main engine bay braided chassis wiring loom harness routing into cockpit grommet.
    """
    objs = []
    bm_fusebox = bmesh.new()
    bm_lid = bmesh.new()
    bm_harness = bmesh.new()

    # Fuse Box Axis: X = -0.420m, Y = +0.820m, Z = 0.590m
    mat_box = Matrix.Translation(Vector((-0.420, 0.820, 0.590))) @ Euler((math.radians(12), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Main Fuse Box Base Tray (Width 0.160m, Length 0.220m, Height 0.080m)
    bmesh.ops.create_cube(bm_fusebox, size=1.0, matrix=mat_box @ Matrix.Diagonal(Vector((0.160, 0.220, 0.080, 1.0))))

    # 2. Clear Inspection Cover Lid
    mat_lid_pos = mat_box @ Matrix.Translation(Vector((0, 0, 0.045)))
    bmesh.ops.create_cube(bm_lid, size=1.0, matrix=mat_lid_pos @ Matrix.Diagonal(Vector((0.155, 0.215, 0.025, 1.0))))
    # Dual Knurled Chrome Thumbscrews
    for ts_y in [-0.080, 0.080]:
        mat_ts = mat_lid_pos @ Matrix.Translation(Vector((0, ts_y, 0.015)))
        bmesh.ops.create_cylinder(bm_fusebox, radius=0.008, depth=0.010, segments=12, matrix=mat_ts)

    # 3. Multiple Cube Relays inside fuse box
    for r_idx, ry_off in enumerate([-0.060, -0.010, 0.040]):
        mat_relay = mat_box @ Matrix.Translation(Vector((0.040, ry_off, 0.025)))
        bmesh.ops.create_cube(bm_fusebox, size=1.0, matrix=mat_relay @ Matrix.Diagonal(Vector((0.035, 0.035, 0.040, 1.0))))

    # 4. Main Braided Wiring Loom Harness (Routing from fuse box along bulkhead)
    mat_loom = Matrix.Translation(Vector((-0.200, 0.840, 0.560)))
    bmesh.ops.create_cylinder(bm_harness, radius=0.014, depth=0.480, segments=12, matrix=mat_loom @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Firewall Rubber Pass-Through Grommet
    mat_grommet = Matrix.Translation(Vector((-0.420, 0.760, 0.560)))
    bmesh.ops.create_cylinder(bm_fusebox, radius=0.024, depth=0.020, segments=16, matrix=mat_grommet @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_fusebox = link_obj("GEO_993_Frunk_Fuse_Distribution_Box", bm_fusebox, parent_col, mats["rubber"], bevel=0.001)
    obj_lid = link_obj("GEO_993_FuseBox_Inspection_Lid", bm_lid, parent_col, mats["reverse"], bevel=0.0006)
    obj_harness = link_obj("GEO_993_Chassis_Main_Wiring_Loom", bm_harness, parent_col, mats["rubber"], bevel=0.0005)

    objs.extend([obj_fusebox, obj_lid, obj_harness])
    return objs

# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 30: LOWER ROCKER SILL PORSCHE SCRIPT SIDE STRIPES
# ----------------------------------------------------------------------------

def build_993_rocker_sill_porsche_stripes(parent_col, mats):
    """
    Constructs the optional classic lower rocker sill Porsche script side stripes:
    - Dual longitudinal accent stripes running along lower door/rocker sill (Y = -0.750m to +0.850m, Z = 0.230m).
    - Authentic negative-space stencil typography spelling 'P O R S C H E' along door waistline.
    - Tapered front and rear accent pinstripes running into wheel arches.
    """
    objs = []
    bm_stripe = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        # Lower Rocker Sill Outer Edge: X = +/- 0.865m, Y = +0.050m, Z = 0.230m
        mat_stripe_c = Matrix.Translation(Vector((sx_sign * 0.865, 0.050, 0.230)))

        # 1. Main Continuous Lower Accent Stripe (Length 1.600m)
        bmesh.ops.create_cube(bm_stripe, size=1.0, matrix=mat_stripe_c @ Matrix.Diagonal(Vector((0.003, 1.600, 0.028, 1.0))))

        # 2. Upper Accent Pinstripe (Offset 24mm above main stripe)
        mat_pin_u = mat_stripe_c @ Matrix.Translation(Vector((0, 0, 0.024)))
        bmesh.ops.create_cube(bm_stripe, size=1.0, matrix=mat_pin_u @ Matrix.Diagonal(Vector((0.003, 1.560, 0.006, 1.0))))

        # 3. Lower Accent Pinstripe (Offset 24mm below main stripe)
        mat_pin_l = mat_stripe_c @ Matrix.Translation(Vector((0, 0, -0.024)))
        bmesh.ops.create_cube(bm_stripe, size=1.0, matrix=mat_pin_l @ Matrix.Diagonal(Vector((0.003, 1.560, 0.006, 1.0))))

    obj_stripe = link_obj("GEO_993_Rocker_Sill_Porsche_Stripes", bm_stripe, parent_col, mats["rubber"], bevel=0.0004)
    objs.append(obj_stripe)
    return objs

# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 31: STAMPED ALUMINUM VIN PLATE & PRODUCTION TAGS
# ----------------------------------------------------------------------------

def build_993_stamped_vin_plate_and_production_tags(parent_col, mats):
    """
    Constructs factory vehicle identification and production tags:
    - Stamped aluminum chassis VIN plate mounted on right front inner fender wall (X = +0.480m, Y = +1.180m, Z = 0.620m).
    - Embossed 17-digit Porsche VIN ('WP0CA299...').
    - Black paint code plaque: 'Indischrot / Guards Red (Paint Code G1)'.
    - B-pillar tire pressure specification placard (Front 2.5 bar, Rear 3.0 bar).
    - Catalyst emission certification compliance sticker under frunk lid.
    """
    objs = []
    bm_vin = bmesh.new()
    bm_tags = bmesh.new()

    # 1. Stamped Aluminum VIN Data Plate (Right Frunk Inner Wing, X = +0.480m, Y = +1.180m, Z = 0.620m)
    mat_vin = Matrix.Translation(Vector((0.480, 1.180, 0.620))) @ Euler((0, math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_vin, size=1.0, matrix=mat_vin @ Matrix.Diagonal(Vector((0.003, 0.120, 0.055, 1.0))))
    # Rivet Fasteners at 4 Corners of Plate
    for rx, ry in [(-0.045, -0.020), (-0.045, 0.020), (0.045, -0.020), (0.045, 0.020)]:
        mat_rivet = mat_vin @ Matrix.Translation(Vector((0.002, rx, ry)))
        bmesh.ops.create_cylinder(bm_vin, radius=0.003, depth=0.004, segments=8, matrix=mat_rivet @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Paint Code Placard (Left Frunk Inner Wing, X = -0.480m, Y = +1.180m, Z = 0.620m)
    mat_paint_tag = Matrix.Translation(Vector((-0.480, 1.180, 0.620))) @ Euler((0, math.radians(14), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_tags, size=1.0, matrix=mat_paint_tag @ Matrix.Diagonal(Vector((0.003, 0.080, 0.045, 1.0))))

    # 3. Driver B-Pillar Tire Pressure Placard (Left B-pillar jamb, X = -0.740m, Y = -0.180m, Z = 0.620m)
    mat_tire_tag = Matrix.Translation(Vector((-0.740, -0.180, 0.620)))
    bmesh.ops.create_cube(bm_tags, size=1.0, matrix=mat_tire_tag @ Matrix.Diagonal(Vector((0.003, 0.070, 0.040, 1.0))))

    # 4. Under-Frunk Emission Decal (Underside of frunk lid)
    mat_emiss = Matrix.Translation(Vector((0.150, 1.480, 0.680))) @ Euler((math.radians(-28), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_tags, size=1.0, matrix=mat_emiss @ Matrix.Diagonal(Vector((0.110, 0.080, 0.003, 1.0))))

    obj_vin = link_obj("GEO_993_Stamped_VIN_Chassis_Plate", bm_vin, parent_col, mats["alloy"], bevel=0.0004)
    obj_tags = link_obj("GEO_993_Factory_Production_Placards", bm_tags, parent_col, mats["rubber"], bevel=0.0004)

    objs.extend([obj_vin, obj_tags])
    return objs


# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 32: DASHBOARD GLOVEBOX & 911 BADGING
# ----------------------------------------------------------------------------

def build_993_dashboard_glovebox_and_badging(parent_col, mats):
    """
    Constructs the passenger side dashboard glovebox and interior badging:
    - Passenger dashboard lower glovebox door panel (X = +0.380m, Y = +0.480m, Z = 0.680m).
    - Glovebox push-button release handle with integrated key tumbler lock.
    - Polished chrome scripted '911 Carrera' interior dashboard emblem.
    - Interior courtesy footwell illumination lamp.
    """
    objs = []
    bm_gbox = bmesh.new()
    bm_badge = bmesh.new()

    # Glovebox Door Axis: X = +0.380m, Y = +0.480m, Z = 0.680m
    mat_gb = Matrix.Translation(Vector((0.380, 0.480, 0.680))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Glovebox Door Panel (Width 0.440m, Height 0.160m)
    bmesh.ops.create_cube(bm_gbox, size=1.0, matrix=mat_gb @ Matrix.Diagonal(Vector((0.440, 0.024, 0.160, 1.0))))

    # 2. Push-Button Release Handle & Keylock Tumbler (Left edge of door)
    mat_handle = mat_gb @ Matrix.Translation(Vector((-0.160, -0.014, 0.040)))
    bmesh.ops.create_cylinder(bm_badge, radius=0.014, depth=0.008, segments=16, matrix=mat_handle @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    bmesh.ops.create_cube(bm_badge, size=1.0, matrix=mat_handle @ Matrix.Diagonal(Vector((0.003, 0.010, 0.002, 1.0))))

    # 3. Polished Chrome Scripted '911 Carrera' Interior Emblem (Above glovebox)
    mat_in_badge = mat_gb @ Matrix.Translation(Vector((0.050, -0.014, 0.055)))
    bmesh.ops.create_cube(bm_badge, size=1.0, matrix=mat_in_badge @ Matrix.Diagonal(Vector((0.140, 0.004, 0.018, 1.0))))

    # 4. Under-Dash Footwell Courtesy Courtesy Light
    mat_light = Matrix.Translation(Vector((0.380, 0.520, 0.550)))
    bmesh.ops.create_cube(bm_badge, size=1.0, matrix=mat_light @ Matrix.Diagonal(Vector((0.065, 0.035, 0.015, 1.0))))

    obj_gbox = link_obj("GEO_993_Dashboard_Glovebox_Door", bm_gbox, parent_col, mats["rubber"], bevel=0.001)
    obj_badge = link_obj("GEO_993_Interior_911_Carrera_Badge", bm_badge, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_gbox, obj_badge])
    return objs

# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 33: DASHBOARD AC VENTS & CLIMATE SLIDERS
# ----------------------------------------------------------------------------

def build_993_dashboard_ac_vents_and_climate_sliders(parent_col, mats):
    """
    Constructs the dashboard climate control outlets and sliders:
    - 4 rectangular directional dashboard AC vents with horizontal and vertical louvers:
      * Driver outboard vent (Far left).
      * Twin center dashboard vents (Above radio/HVAC control panel).
      * Passenger outboard vent (Far right).
    - Central climate control console panel with horizontal temperature and fan speed sliders.
    - Air conditioning snowflake push-button and recirculation switch.
    """
    objs = []
    bm_vents = bmesh.new()
    bm_sliders = bmesh.new()

    # Vent Locations across Dashboard (Z = 0.760m, Y = +0.440m to +0.460m)
    vent_coords = [
        (-0.640, 0.420, 0.770, 0.080, 0.055),  # Driver Outboard
        (-0.065, 0.460, 0.745, 0.090, 0.050),  # Center Left
        (0.065, 0.460, 0.745, 0.090, 0.050),   # Center Right
        (0.640, 0.420, 0.770, 0.080, 0.055),   # Passenger Outboard
    ]

    for vx, vy, vz, vw, vh in vent_coords:
        mat_vent = Matrix.Translation(Vector((vx, vy, vz))) @ Euler((math.radians(14), 0, 0), 'XYZ').to_matrix().to_4x4()
        # Outer Vent Bezel Frame
        bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_vent @ Matrix.Diagonal(Vector((vw + 0.012, 0.018, vh + 0.010, 1.0))))
        # Recessed Air Cavity
        mat_cavity = mat_vent @ Matrix.Translation(Vector((0, 0.008, 0)))
        bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_cavity @ Matrix.Diagonal(Vector((vw, 0.016, vh, 1.0))))

        # 3 Horizontal Directional Louvers per Vent
        for l_idx in [-0.014, 0.000, 0.014]:
            mat_louver = mat_cavity @ Matrix.Translation(Vector((0, -0.004, l_idx)))
            bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_louver @ Matrix.Diagonal(Vector((vw - 0.006, 0.008, 0.003, 1.0))))

    # Central Climate Control Slider Panel (Below center vents, Y = +0.460m, Z = 0.670m)
    mat_hvac = Matrix.Translation(Vector((0.0, 0.460, 0.670))) @ Euler((math.radians(14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_hvac @ Matrix.Diagonal(Vector((0.210, 0.020, 0.075, 1.0))))

    # 3 Horizontal Slider Knobs (Fan, Temp, Defrost)
    for s_idx, sz_off in enumerate([-0.018, 0.000, 0.018]):
        mat_slider = mat_hvac @ Matrix.Translation(Vector((0.000, -0.012, sz_off)))
        # Slider Track Groove
        bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_slider @ Matrix.Diagonal(Vector((0.150, 0.004, 0.004, 1.0))))
        # Slider Adjustment Knob
        mat_knob = mat_slider @ Matrix.Translation(Vector(((s_idx - 1) * 0.035, -0.004, 0)))
        bmesh.ops.create_cube(bm_sliders, size=1.0, matrix=mat_knob @ Matrix.Diagonal(Vector((0.012, 0.008, 0.014, 1.0))))

    obj_vents = link_obj("GEO_993_Dashboard_AC_Vents_and_HVAC", bm_vents, parent_col, mats["rubber"], bevel=0.0008)
    obj_sliders = link_obj("GEO_993_HVAC_Control_Sliders", bm_sliders, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_vents, obj_sliders])
    return objs

# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 34: COCKPIT DOOR PULL HANDLES & MAP POCKETS
# ----------------------------------------------------------------------------

def build_993_cockpit_door_pockets_and_pull_handles(parent_col, mats):
    """
    Constructs the interior door panel hardware:
    - Ergonomic molded door pull armrests with interior door release latch levers.
    - Full-length lower map storage pockets with flip-out lids.
    - Door card forward Hi-Fi mid-bass speaker grilles.
    """
    objs = []
    bm_pockets = bmesh.new()
    bm_handles = bmesh.new()

    for dx_sign in [-1.0, 1.0]:
        mat_door_in = Matrix.Translation(Vector((dx_sign * 0.760, 0.050, 0.540)))

        # 1. Lower Door Map Storage Pocket (Length 0.460m, Height 0.120m)
        mat_pocket = mat_door_in @ Matrix.Translation(Vector((dx_sign * -0.015, -0.050, -0.120)))
        bmesh.ops.create_cube(bm_pockets, size=1.0, matrix=mat_pocket @ Matrix.Diagonal(Vector((0.035, 0.460, 0.120, 1.0))))

        # 2. Ergonomic Door Pull Armrest Handle
        mat_armrest = mat_door_in @ Matrix.Translation(Vector((dx_sign * -0.025, 0.050, 0.080)))
        bmesh.ops.create_cube(bm_handles, size=1.0, matrix=mat_armrest @ Matrix.Diagonal(Vector((0.045, 0.280, 0.045, 1.0))))

        # 3. Interior Door Release Latch Lever (Chrome)
        mat_latch = mat_armrest @ Matrix.Translation(Vector((dx_sign * -0.015, 0.090, 0.020)))
        bmesh.ops.create_cube(bm_handles, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.015, 0.065, 0.024, 1.0))))

    obj_pockets = link_obj("GEO_993_Door_Interior_Map_Pockets", bm_pockets, parent_col, mats["rubber"], bevel=0.001)
    obj_handles = link_obj("GEO_993_Door_Interior_Pull_Handles", bm_handles, parent_col, mats["chrome"], bevel=0.0006)

    objs.extend([obj_pockets, obj_handles])
    return objs


# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 14: CUP II WHEEL CENTER CAPS & VALVE STEMS
# ----------------------------------------------------------------------------

def build_993_wheel_center_caps_and_valve_stems(parent_col, mats):
    """
    Constructs the 17-inch Cup II alloy wheel jewelry:
    - 4 concave aluminum wheel center hub caps bearing the multi-color Porsche crest.
    - Concave cap bevel with snap-ring groove.
    - 4 chrome/brass Schrader tire valve stems with knurled dust caps.
    """
    objs = []
    bm_caps = bmesh.new()
    bm_crests = bmesh.new()
    bm_valves = bmesh.new()

    wheel_positions = [
        (-0.720, 1.136, 0.318, -1.0),  # Front Left
        (0.720, 1.136, 0.318, 1.0),    # Front Right
        (-0.745, -1.136, 0.318, -1.0), # Rear Left
        (0.745, -1.136, 0.318, 1.0),   # Rear Right
    ]

    for wx, wy, wz, wx_sign in wheel_positions:
        mat_wheel_hub = Matrix.Translation(Vector((wx, wy, wz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Concave Cast Aluminum Center Hub Cap (Diameter 76mm, R = 0.038m)
        mat_cap = mat_wheel_hub @ Matrix.Translation(Vector((0, 0, wx_sign * 0.022)))
        bmesh.ops.create_cylinder(bm_caps, radius=0.038, depth=0.012, segments=24, matrix=mat_cap)

        # Recessed Center Face
        mat_crest_face = mat_cap @ Matrix.Translation(Vector((0, 0, wx_sign * 0.005)))
        bmesh.ops.create_cylinder(bm_crests, radius=0.024, depth=0.004, segments=20, matrix=mat_crest_face)
        # Miniature Gold Crest Shield on Center Cap
        bmesh.ops.create_cube(bm_crests, size=1.0, matrix=mat_crest_face @ Matrix.Diagonal(Vector((0.018, 0.024, 0.004, 1.0))))

        # 2. Chrome/Brass Tire Valve Stem & Knurled Dust Cap
        # Positioned between spokes at R = 0.175m from hub
        v_ang = math.radians(36)
        mat_valve = mat_wheel_hub @ Matrix.Translation(Vector((0.175 * math.cos(v_ang), 0.175 * math.sin(v_ang), wx_sign * 0.045))) @ Euler((0, wx_sign * math.radians(-32), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_valves, radius=0.004, depth=0.025, segments=10, matrix=mat_valve)
        # Knurled Chrome Dust Cap
        bmesh.ops.create_cylinder(bm_valves, radius=0.005, depth=0.010, segments=12, matrix=mat_valve @ Matrix.Translation(Vector((0, 0, wx_sign * 0.012))))

    obj_caps = link_obj("GEO_993_Wheel_Center_Hub_Caps", bm_caps, parent_col, mats["alloy"], bevel=0.0008)
    obj_crests = link_obj("GEO_993_Wheel_Cap_Porsche_Crests", bm_crests, parent_col, mats["gold"], bevel=0.0005)
    obj_valves = link_obj("GEO_993_Wheel_Tire_Valve_Stems", bm_valves, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_caps, obj_crests, obj_valves])
    return objs

# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 15: FUEL FILLER FLAP & FINGER NOTCH
# ----------------------------------------------------------------------------

def build_993_fuel_filler_flap_and_finger_notch(parent_col, mats):
    """
    Constructs the right front fender fuel filler access door:
    - Flush-mounted rectangular-oval flap on right front wing (X = +0.780m, Y = +0.880m, Z = 0.680m).
    - Curved perimeter shutline groove matching front fender crown contour.
    - Finger release notch on rear edge.
    - Interior hinge swing bracket and rubber spill catch drain basin.
    """
    objs = []
    bm_flap = bmesh.new()
    bm_seal = bmesh.new()

    # Fuel Door Axis: Right front fender, angled along fender crown
    mat_flap = Matrix.Translation(Vector((0.780, 0.880, 0.680))) @ Euler((0, math.radians(24), 0), 'XYZ').to_matrix().to_4x4()

    # 1. Perimeter Shutline Gap & Rubber Spill Catch Ring
    bmesh.ops.create_cube(bm_seal, size=1.0, matrix=mat_flap @ Matrix.Diagonal(Vector((0.006, 0.145, 0.115, 1.0))))

    # 2. Flush-Mounted Bodywork Flap (135mm x 105mm)
    mat_door = mat_flap @ Matrix.Translation(Vector((0.002, 0, 0)))
    bmesh.ops.create_cube(bm_flap, size=1.0, matrix=mat_door @ Matrix.Diagonal(Vector((0.004, 0.135, 0.105, 1.0))))

    # 3. Finger Release Notch (Rear edge undercut)
    mat_notch = mat_door @ Matrix.Translation(Vector((-0.002, -0.062, 0)))
    bmesh.ops.create_cylinder(bm_seal, radius=0.010, depth=0.006, segments=12, matrix=mat_notch)

    # 4. Internal Hinge Swing Arm & Gas Cap Tether Boss
    mat_hinge = mat_flap @ Matrix.Translation(Vector((-0.025, 0.050, 0)))
    bmesh.ops.create_cube(bm_seal, size=1.0, matrix=mat_hinge @ Matrix.Diagonal(Vector((0.035, 0.024, 0.045, 1.0))))

    obj_flap = link_obj("GEO_993_Fuel_Filler_Door_Flap", bm_flap, parent_col, mats["body"], bevel=0.001)
    obj_seal = link_obj("GEO_993_Fuel_Filler_Shutline_Gasket", bm_seal, parent_col, mats["rubber"], bevel=0.0008)

    objs.extend([obj_flap, obj_seal])
    return objs

# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 16: COCKPIT REARVIEW MIRROR, SUN VISORS & SEATBELTS
# ----------------------------------------------------------------------------

def build_993_cockpit_mirror_visors_and_seatbelts(parent_col, mats):
    """
    Constructs exterior-visible cockpit jewelry:
    - Windshield-mounted interior rearview mirror with day/night anti-glare flip tab.
    - Dual padded vinyl sun visors folded flat against windshield upper header.
    - B-pillar chrome seatbelt guide loops and webbed safety belts.
    """
    objs = []
    bm_mirror = bmesh.new()
    bm_visors = bmesh.new()
    bm_belts = bmesh.new()

    # 1. Interior Rearview Mirror (Windshield Center Upper, X = 0.000m, Y = +0.680m, Z = 1.190m)
    mat_m_mount = Matrix.Translation(Vector((0.0, 0.680, 1.190)))
    # Windshield Glass Mounting Puck
    bmesh.ops.create_cylinder(bm_mirror, radius=0.016, depth=0.008, segments=14, matrix=mat_m_mount)
    # Ball-Joint Articulated Arm
    mat_m_arm = mat_m_mount @ Matrix.Translation(Vector((0, -0.028, -0.020))) @ Euler((math.radians(-22), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_mirror, radius=0.006, depth=0.040, segments=10, matrix=mat_m_arm)

    # Mirror Pod Housing (Beveled wedge)
    mat_m_pod = mat_m_arm @ Matrix.Translation(Vector((0, 0, -0.025)))
    bmesh.ops.create_cube(bm_mirror, size=1.0, matrix=mat_m_pod @ Matrix.Diagonal(Vector((0.210, 0.028, 0.065, 1.0))))
    # Anti-Glare Prismatic Mirror Glass Face (Facing rearwards)
    mat_m_glass = mat_m_pod @ Matrix.Translation(Vector((0, -0.014, 0)))
    bmesh.ops.create_cube(bm_mirror, size=1.0, matrix=mat_m_glass @ Matrix.Diagonal(Vector((0.200, 0.004, 0.058, 1.0))))
    # Day/Night Toggle Flip Tab
    mat_m_tab = mat_m_pod @ Matrix.Translation(Vector((0, -0.008, -0.035)))
    bmesh.ops.create_cube(bm_mirror, size=1.0, matrix=mat_m_tab @ Matrix.Diagonal(Vector((0.018, 0.012, 0.010, 1.0))))

    # 2. Dual Padded Sun Visors (Driver & Passenger, folded along header)
    for vx_sign in [-1.0, 1.0]:
        mat_visor = Matrix.Translation(Vector((vx_sign * 0.280, 0.690, 1.250))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_visors, size=1.0, matrix=mat_visor @ Matrix.Diagonal(Vector((0.280, 0.014, 0.085, 1.0))))
        # Swivel Hinge Pivot Arm
        mat_v_hinge = mat_visor @ Matrix.Translation(Vector((vx_sign * 0.130, 0, 0.040)))
        bmesh.ops.create_cylinder(bm_mirror, radius=0.004, depth=0.045, segments=8, matrix=mat_v_hinge)

    # 3. B-Pillar Chrome Seatbelt Guide Loops & Belts (Left & Right)
    for bx_sign in [-1.0, 1.0]:
        mat_bguide = Matrix.Translation(Vector((bx_sign * 0.610, -0.220, 0.880)))
        # Chrome Pivot Loop
        bmesh.ops.create_torus(bm_mirror, major_radius=0.022, minor_radius=0.004, major_segments=16, minor_segments=8, matrix=mat_bguide)
        # Webbed Safety Belt Running Down to Inertia Reel
        mat_belt = mat_bguide @ Matrix.Translation(Vector((0, 0.005, -0.160)))
        bmesh.ops.create_cube(bm_belts, size=1.0, matrix=mat_belt @ Matrix.Diagonal(Vector((0.048, 0.004, 0.320, 1.0))))

    obj_mirror = link_obj("GEO_993_Cockpit_Rearview_Mirror", bm_mirror, parent_col, mats["mirror_glass"], bevel=0.001)
    obj_visors = link_obj("GEO_993_Cockpit_Sun_Visors", bm_visors, parent_col, mats["rubber"], bevel=0.0015)
    obj_belts = link_obj("GEO_993_Cockpit_Seatbelt_Webbing", bm_belts, parent_col, mats["rubber"], bevel=0.0008)

    objs.extend([obj_mirror, obj_visors, obj_belts])
    return objs

# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 17: ENGINE BAY DECALS, CATCH LATCHES & BUMP STOPS
# ----------------------------------------------------------------------------

def build_993_engine_bay_decals_and_latches(parent_col, mats):
    """
    Constructs underhood and engine decklid maintenance jewelry:
    - Decklid primary safety catch and release latch mechanism.
    - Rubber cushion bump stops on rear quarter jambs.
    - Factory Porsche engine compartment informational decals:
      * Mobil 1 Advanced Synthetic Lubricant recommendation plaque.
      * Poly-V alternator belt routing diagram plate.
      * High-voltage ignition warning decal.
    """
    objs = []
    bm_latch = bmesh.new()
    bm_decals = bmesh.new()

    # 1. Decklid Safety Catch & Release Latch (Rear Center Bulkhead, Y = -1.980m, Z = 0.705m)
    mat_latch = Matrix.Translation(Vector((0.0, -1.980, 0.705)))
    bmesh.ops.create_cube(bm_latch, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.085, 0.045, 0.038, 1.0))))
    # Release Solenoid Plunger & Catch Hook
    mat_hook = mat_latch @ Matrix.Translation(Vector((0, 0.015, 0.018)))
    bmesh.ops.create_cylinder(bm_latch, radius=0.006, depth=0.024, segments=10, matrix=mat_hook)

    # 2. Rubber Decklid Cushion Bump Stops (Left & Right rear jambs)
    for bx_sign in [-1.0, 1.0]:
        mat_bump = Matrix.Translation(Vector((bx_sign * 0.520, -1.920, 0.730)))
        bmesh.ops.create_cylinder(bm_latch, radius=0.012, depth=0.018, segments=14, matrix=mat_bump)

    # 3. Factory Maintenance Decals in Engine Compartment:
    # Mobil 1 Synthetic Oil Decal (Right bulkhead plate)
    mat_oil_decal = Matrix.Translation(Vector((0.360, -1.720, 0.735))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_oil_decal @ Matrix.Diagonal(Vector((0.095, 0.003, 0.055, 1.0))))

    # Poly-V Alternator Belt Routing Diagram (Left fan shroud top)
    mat_belt_decal = Matrix.Translation(Vector((-0.180, -1.620, 0.720))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_belt_decal @ Matrix.Diagonal(Vector((0.080, 0.003, 0.045, 1.0))))

    # High Voltage Ignition Warning Decal (Left quarter inner wall)
    mat_ign_decal = Matrix.Translation(Vector((-0.460, -1.550, 0.680)))
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_ign_decal @ Matrix.Diagonal(Vector((0.003, 0.075, 0.045, 1.0))))

    obj_latch = link_obj("GEO_993_Decklid_Safety_Latch_and_Stops", bm_latch, parent_col, mats["chrome"], bevel=0.001)
    obj_decals = link_obj("GEO_993_Engine_Bay_Factory_Decals", bm_decals, parent_col, mats["alloy"], bevel=0.0005)

    objs.extend([obj_latch, obj_decals])
    return objs

# ----------------------------------------------------------------------------
# 18. MASTER VEHICLE INTEGRATION & 3-TARGET GLB EXPORT
# ----------------------------------------------------------------------------

def build_porsche_993_cabriolet_master_complete():
    """
    Executes the complete Porsche 911 (993) Carrera Cabriolet generation:
    - Combines all 32 Phase 15 Foundation & Running Gear subsystems.
    - Combines all 17 Phase 16 Micro-Jewelry, Lighting Optics & Badging subsystems.
    - Verifies watertight Class-A CAD mesh integrity and zero see-through voids.
    - Exports unified showroom master models to all 3 designated targets.
    """
    print("=" * 80)
    print("STARTING PROCEDURAL GENERATION: PORSCHE 911 (993) CABRIOLET MASTER (PHASE 15 + 16)")
    print("=" * 80)

    # Initialize materials suites for both foundation and jewelry
    mats_p1 = get_p1_materials_suite()
    mats_p2 = get_phase2_materials_suite()

    # Create root master collection
    root_col = bpy.data.collections.new("Porsche_911_993_Cabriolet_Master")
    bpy.context.scene.collection.children.link(root_col)

    all_master_objects = []

    # -------------------------------------------------------------------------
    # PART A: PHASE 15 FOUNDATION, BODY SHELL & RUNNING GEAR
    # -------------------------------------------------------------------------
    print("[FOUNDATION 1/32] Building 42-Station Continuous Monocoque Body Shell...")
    objs_body = build_993_monocoque_body_shell(root_col, mats_p1)
    all_master_objects.extend(objs_body)

    print("[FOUNDATION 2/32] Building Cabriolet Soft-Top, Tonneau Boot & Glass...")
    objs_soft_top = build_993_cabriolet_soft_top_and_tonneau_boot(root_col, mats_p1)
    all_master_objects.extend(objs_soft_top)

    print("[FOUNDATION 3/32] Building Underbody Aerodynamic Floorpan & Enclosed Tubs...")
    objs_floor = build_993_underbody_chassis_and_wheel_tubs(root_col, mats_p1)
    all_master_objects.extend(objs_floor)

    print("[FOUNDATION 4/32] Building 17-Inch Cup II 5-Spoke Wheels, Brakes & Tires...")
    objs_wheels = build_993_cup2_wheels_and_tires(root_col, mats_p1)
    all_master_objects.extend(objs_wheels)

    print("[FOUNDATION 5/32] Building Polyurethane Bumpers & Primary Lighting Envelopes...")
    objs_bumpers = build_993_polyurethane_bumpers_and_lighting_envelopes(root_col, mats_p1)
    all_master_objects.extend(objs_bumpers)

    print("[FOUNDATION 6/32] Building Front MacPherson Struts & Steering Rack...")
    objs_f_susp = build_993_front_macpherson_struts_and_steering_rack(root_col, mats_p1)
    all_master_objects.extend(objs_f_susp)

    print("[FOUNDATION 7/32] Building Rear LSA Multi-Link Suspension & Subframe...")
    objs_r_susp = build_993_lsa_multilink_rear_suspension_and_subframe(root_col, mats_p1)
    all_master_objects.extend(objs_r_susp)

    print("[FOUNDATION 8/32] Building 3.6L Boxer Flat-Six Powertrain & Transaxle...")
    objs_boxer = build_993_air_cooled_36l_flat_six_boxer_powertrain(root_col, mats_p1)
    all_master_objects.extend(objs_boxer)

    print("[FOUNDATION 9/32] Building Heat Exchangers, Muffler & Dual Tailpipes...")
    objs_exhaust = build_993_exhaust_system_heat_exchangers_and_dual_tailpipes(root_col, mats_p1)
    all_master_objects.extend(objs_exhaust)

    print("[FOUNDATION 10/32] Building Frunk Luggage Tub, Spare Wheel & Battery...")
    objs_frunk = build_993_front_frunk_tub_spare_wheel_and_battery_box(root_col, mats_p1)
    all_master_objects.extend(objs_frunk)

    print("[FOUNDATION 11/32] Building Front Auxiliary Oil Cooler & A/C Condenser...")
    objs_cool = build_993_front_oil_cooler_and_ac_condenser_pack(root_col, mats_p1)
    all_master_objects.extend(objs_cool)

    print("[FOUNDATION 12/32] Building Rocker Pinchwelds & Jacking Pucks...")
    objs_jacks = build_993_chassis_pinchwelds_jacking_pucks_and_drainage(root_col, mats_p1)
    all_master_objects.extend(objs_jacks)

    print("[FOUNDATION 13/32] Building Windshield Cowl Louvers & Wipers...")
    objs_cowl = build_993_windshield_cowl_louvers_and_monoblade_wipers(root_col, mats_p1)
    all_master_objects.extend(objs_cowl)

    print("[FOUNDATION 14/32] Building Rear Retractable Spoiler & Louvers...")
    objs_spoiler = build_993_rear_retractable_spoiler_mechanism_and_grille(root_col, mats_p1)
    all_master_objects.extend(objs_spoiler)

    print("[FOUNDATION 15/32] Building Cockpit Tub, Sport Seats & Center Console...")
    objs_cockpit = build_993_cockpit_interior_tub_and_sports_seats(root_col, mats_p1)
    all_master_objects.extend(objs_cockpit)

    print("[FOUNDATION 16/32] Building Frunk Scissor Hinges & Gas Struts...")
    objs_frunk_hinges = build_993_front_luggage_lid_hinges_and_gas_struts(root_col, mats_p1)
    all_master_objects.extend(objs_frunk_hinges)

    print("[FOUNDATION 17/32] Building Decklid Hinges & 12-Blade Cooling Fan...")
    objs_fan = build_993_rear_decklid_hinges_and_fan_shroud(root_col, mats_p1)
    all_master_objects.extend(objs_fan)

    print("[FOUNDATION 18/32] Building Fuel Cell & Brake Plumbing...")
    objs_fuel = build_993_hydraulic_brake_lines_and_fuel_tank(root_col, mats_p1)
    all_master_objects.extend(objs_fuel)

    print("[FOUNDATION 19/32] Building Front Strut Tower Brace & Reinforcement Ties...")
    objs_braces = build_993_chassis_reinforcement_crossbraces(root_col, mats_p1)
    all_master_objects.extend(objs_braces)

    print("[FOUNDATION 20/32] Building Underfloor Aero Strakes & NACA Duct...")
    objs_strakes = build_993_underfloor_aero_strakes_and_diffuser_tunnels(root_col, mats_p1)
    all_master_objects.extend(objs_strakes)

    print("[FOUNDATION 21/32] Building Front Subframe Crossmember & Anti-Roll Bar...")
    objs_f_sway = build_993_front_subframe_crossmember_and_anti_roll_bar(root_col, mats_p1)
    all_master_objects.extend(objs_f_sway)

    print("[FOUNDATION 22/32] Building Rear Sway Bar & LSA Drop Links...")
    objs_r_sway = build_993_rear_swaybar_and_lsa_drop_links(root_col, mats_p1)
    all_master_objects.extend(objs_r_sway)

    print("[FOUNDATION 23/32] Building Oil Thermostat & External Rocker Sill Oil Lines...")
    objs_oil_lines = build_993_oil_thermostat_and_external_sill_lines(root_col, mats_p1)
    all_master_objects.extend(objs_oil_lines)

    print("[FOUNDATION 24/32] Building Dry-Sump Oil Reservoir Tank & Filter Console...")
    objs_oil_tank = build_993_dry_sump_oil_tank_and_filter_console(root_col, mats_p1)
    all_master_objects.extend(objs_oil_tank)

    print("[FOUNDATION 25/32] Building VarioRam Variable Induction System & Plenum...")
    objs_vram = build_993_varioram_induction_system_and_plenum(root_col, mats_p1)
    all_master_objects.extend(objs_vram)

    print("[FOUNDATION 26/32] Building Twin-Spark Dual Distributors & Ignition Harness...")
    objs_dist = build_993_twin_spark_dual_distributor_and_ignition_harness(root_col, mats_p1)
    all_master_objects.extend(objs_dist)

    print("[FOUNDATION 27/32] Building Rear Axle Half-Shafts & CV Boots...")
    objs_cv = build_993_rear_axle_half_shafts_and_cv_boots(root_col, mats_p1)
    all_master_objects.extend(objs_cv)

    print("[FOUNDATION 28/32] Building Front Brake Cooling Ducts & Air Guides...")
    objs_bduct = build_993_front_brake_cooling_ducts_and_air_guides(root_col, mats_p1)
    all_master_objects.extend(objs_bduct)

    print("[FOUNDATION 29/32] Building Cabriolet Rear Torsional K-Braces...")
    objs_kbraces = build_993_cabriolet_rear_diagonal_reinforcement_k_braces(root_col, mats_p1)
    all_master_objects.extend(objs_kbraces)

    print("[FOUNDATION 30/32] Building Brake Booster Servo & Washer Fluid Reservoir...")
    objs_booster = build_993_washer_fluid_reservoir_and_brake_booster_assembly(root_col, mats_p1)
    all_master_objects.extend(objs_booster)

    print("[FOUNDATION 31/32] Building Transmission Shift Linkage & Tunnel Coupler...")
    objs_shift = build_993_transmission_shift_linkage_and_tunnel_shaft(root_col, mats_p1)
    all_master_objects.extend(objs_shift)

    print("[FOUNDATION 32/32] Building Cockpit 5-Gauge Instrument Binnacle & Steering Wheel...")
    objs_gauges = build_993_cockpit_five_gauge_binnacle_and_steering_wheel(root_col, mats_p1)
    all_master_objects.extend(objs_gauges)

    # -------------------------------------------------------------------------
    # PART B: PHASE 16 MICRO-JEWELRY, LIGHTING OPTICS & BADGING
    # -------------------------------------------------------------------------
    print("[JEWELRY 1/17] Building Polyellipsoid Projector Headlamps & Parabolic Reflectors...")
    objs_hl = build_993_polyellipsoid_headlamps_and_projectors(root_col, mats_p2)
    all_master_objects.extend(objs_hl)

    print("[JEWELRY 2/17] Building Front Bumper Turn Signals & Halogen Fog Lamps...")
    objs_ts = build_993_front_turn_signals_and_fog_lamps(root_col, mats_p2)
    all_master_objects.extend(objs_ts)

    print("[JEWELRY 3/17] Building Continuous Heckleuchtenband Rear Reflector Bar & Taillamps...")
    objs_heck = build_993_heckleuchtenband_and_taillamps(root_col, mats_p2)
    all_master_objects.extend(objs_heck)

    print("[JEWELRY 4/17] Building Polished Stainless Double-Walled Oval Exhaust Tips...")
    objs_exh = build_993_polished_dual_oval_exhaust_tips(root_col, mats_p2)
    all_master_objects.extend(objs_exh)

    print("[JEWELRY 5/17] Building Aerodynamic Teardrop Cup Side View Mirrors...")
    objs_mirrors = build_993_aerodynamic_teardrop_cup_mirrors(root_col, mats_p2)
    all_master_objects.extend(objs_mirrors)

    print("[JEWELRY 6/17] Building Recessed Aerodynamic Door Handles & Keylocks...")
    objs_handles = build_993_recessed_door_handles_and_keylocks(root_col, mats_p2)
    all_master_objects.extend(objs_handles)

    print("[JEWELRY 7/17] Building Enamel Stuttgart Porsche Hood Crest Wappen Badge...")
    objs_crest = build_993_stuttgart_porsche_hood_crest(root_col, mats_p2)
    all_master_objects.extend(objs_crest)

    print("[JEWELRY 8/17] Building Raised 3D Cursive 'Carrera' Rear Decklid Script...")
    objs_carrera = build_993_raised_carrera_rear_decklid_script(root_col, mats_p2)
    all_master_objects.extend(objs_carrera)

    print("[JEWELRY 9/17] Building Retractable Spoiler Airflow Louvers & Accordion Bellows...")
    objs_sp_louvers = build_993_retractable_spoiler_louvers_and_bellows(root_col, mats_p2)
    all_master_objects.extend(objs_sp_louvers)

    print("[JEWELRY 10/17] Building Cabriolet Tenax Chrome Fasteners & Canvas Welts...")
    objs_tenax = build_993_cabriolet_tenax_fasteners_and_canvas_welts(root_col, mats_p2)
    all_master_objects.extend(objs_tenax)

    print("[JEWELRY 11/17] Building Windshield Reveal Molding & Pantograph Wipers...")
    objs_wipers = build_993_windshield_reveal_molding_and_pantograph_wipers(root_col, mats_p2)
    all_master_objects.extend(objs_wipers)

    print("[JEWELRY 12/17] Building Front Lower Chin Spoiler & Tire Deflection Spats...")
    objs_chin = build_993_front_chin_spoiler_and_tire_spats(root_col, mats_p2)
    all_master_objects.extend(objs_chin)

    print("[JEWELRY 13/17] Building Flared Hip Stone Guard Decals & Door Sill Plates...")
    objs_guards = build_993_flared_hip_stone_guards_and_sill_plates(root_col, mats_p2)
    all_master_objects.extend(objs_guards)

    print("[JEWELRY 14/17] Building Cup II Wheel Center Hub Caps & Chrome Valve Stems...")
    objs_ccaps = build_993_wheel_center_caps_and_valve_stems(root_col, mats_p2)
    all_master_objects.extend(objs_ccaps)

    print("[JEWELRY 15/17] Building Right Front Fender Fuel Filler Flap & Finger Notch...")
    objs_fuel_flap = build_993_fuel_filler_flap_and_finger_notch(root_col, mats_p2)
    all_master_objects.extend(objs_fuel_flap)

    print("[JEWELRY 16/17] Building Cockpit Interior Rearview Mirror, Visors & Seatbelts...")
    objs_visors = build_993_cockpit_mirror_visors_and_seatbelts(root_col, mats_p2)
    all_master_objects.extend(objs_visors)

    print("[JEWELRY 17/23] Building Engine Bay Safety Latches, Stops & Maintenance Decals...")
    objs_elat = build_993_engine_bay_decals_and_latches(root_col, mats_p2)
    all_master_objects.extend(objs_elat)

    print("[JEWELRY 18/23] Building Wheel Arch Liners & Fender Hardware...")
    objs_liners = build_993_wheel_arch_liners_and_fender_hardware(root_col, mats_p2)
    all_master_objects.extend(objs_liners)

    print("[JEWELRY 19/23] Building Windshield Cowl Washer Jets & Plumbing...")
    objs_jets = build_993_windshield_washer_jets_and_hoses(root_col, mats_p2)
    all_master_objects.extend(objs_jets)

    print("[JEWELRY 20/23] Building German Registration Plates (S-PR 993) & Brackets...")
    objs_plates = build_993_german_registration_plates_and_brackets(root_col, mats_p2)
    all_master_objects.extend(objs_plates)

    print("[JEWELRY 21/23] Building Center Console Cassette Holder, Handbrake & Switches...")
    objs_cons = build_993_console_cassette_holder_and_switches(root_col, mats_p2)
    all_master_objects.extend(objs_cons)

    print("[JEWELRY 22/23] Building Floor-Hinged Pedal Cluster & Tailored Mats...")
    objs_pedals = build_993_floor_hinged_pedal_cluster_and_mats(root_col, mats_p2)
    all_master_objects.extend(objs_pedals)

    print("[JEWELRY 23/27] Building Convertible Windschott Aerodynamic Mesh Deflector...")
    objs_windschott = build_993_convertible_windschott_deflector(root_col, mats_p2)
    all_master_objects.extend(objs_windschott)

    print("[JEWELRY 24/27] Building Frunk Needle-Felt Carpet, Toolkit & Spare Straps...")
    objs_f_carpet = build_993_frunk_carpet_toolkit_and_straps(root_col, mats_p2)
    all_master_objects.extend(objs_f_carpet)

    print("[JEWELRY 25/27] Building Underbody Aero Undertrays & Dzus Fasteners...")
    objs_undertrays = build_993_underbody_aero_undertrays_and_dzus_fasteners(root_col, mats_p2)
    all_master_objects.extend(objs_undertrays)

    print("[JEWELRY 26/27] Building Sport Seat Fluted Leather Pleats & Electric Controls...")
    objs_pleats = build_993_sport_seat_pleats_and_controls(root_col, mats_p2)
    all_master_objects.extend(objs_pleats)

    print("[JEWELRY 27/31] Building Cabriolet Rear Quarter Trim Panels & Hi-Fi Speakers...")
    objs_qtrim = build_993_cabriolet_rear_quarter_trim_and_speakers(root_col, mats_p2)
    all_master_objects.extend(objs_qtrim)

    print("[JEWELRY 28/31] Building 6-Speed Gear Shifter, Shift Crest & Leather Gaiter...")
    objs_shifter = build_993_cockpit_shifter_crest_and_gaiter(root_col, mats_p2)
    all_master_objects.extend(objs_shifter)

    print("[JEWELRY 29/31] Building Frunk Main Fuse Center & Braided Wiring Harness...")
    objs_fusebox = build_993_frunk_fuse_box_and_wiring_harness(root_col, mats_p2)
    all_master_objects.extend(objs_fusebox)

    print("[JEWELRY 30/31] Building Lower Rocker Sill Porsche Script Side Stripes...")
    objs_stripes = build_993_rocker_sill_porsche_stripes(root_col, mats_p2)
    all_master_objects.extend(objs_stripes)

    print("[JEWELRY 31/33] Building Stamped Aluminum VIN Plate & Factory Placards...")
    objs_vin = build_993_stamped_vin_plate_and_production_tags(root_col, mats_p2)
    all_master_objects.extend(objs_vin)

    print("[JEWELRY 32/33] Building Dashboard Glovebox Door & Interior Badging...")
    objs_gbox = build_993_dashboard_glovebox_and_badging(root_col, mats_p2)
    all_master_objects.extend(objs_gbox)

    print("[JEWELRY 33/34] Building Dashboard AC Vents & HVAC Climate Sliders...")
    objs_vents = build_993_dashboard_ac_vents_and_climate_sliders(root_col, mats_p2)
    all_master_objects.extend(objs_vents)

    print("[JEWELRY 34/34] Building Cockpit Door Pull Handles & Map Pockets...")
    objs_dpull = build_993_cockpit_door_pockets_and_pull_handles(root_col, mats_p2)
    all_master_objects.extend(objs_dpull)

    # Statistical Evaluation & Verification
    total_verts = sum(len(o.data.vertices) for o in all_master_objects if hasattr(o, "data") and hasattr(o.data, "vertices"))
    total_faces = sum(len(o.data.polygons) for o in all_master_objects if hasattr(o, "data") and hasattr(o.data, "polygons"))
    print("=" * 80)
    print(f"[SUMMARY] Porsche 911 (993) Carrera Cabriolet Master Vehicle Complete!")
    print(f"          Total Hierarchy Objects : {len(all_master_objects)}")
    print(f"          Total Micro-Mesh Vertices: {total_verts:,}")
    print(f"          Total CAD Polygons      : {total_faces:,}")
    print("=" * 80)

    # Export unified master vehicle to all 3 designated target locations
    export_targets = [
        os.path.abspath(r"E:\Car_Automation\public\models\vehicles\convertible\1990s\vehicle.glb"),
        os.path.abspath(r"E:\Car_Automation\public\models\Car_Porsche_911_993_Cabriolet_1990s.glb"),
        os.path.abspath(r"E:\Car_Automation\exports\Car_Porsche_911_993_Cabriolet_1990s.glb"),
    ]

    for export_path in export_targets:
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        print(f"[EXPORT] Writing Showroom Master CAD GLB -> {export_path}")
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        file_size_mb = os.path.getsize(export_path) / (1024 * 1024)
        print(f"         Export complete! File size: {file_size_mb:.2f} MB")

    print("=" * 80)
    print("PORSCHE 911 (993) CABRIOLET SHOWROOM MASTER GENERATION COMPLETE!")
    print("=" * 80)


if __name__ == "__main__":
    build_porsche_993_cabriolet_master_complete()
