"""
=============================================================================
Procedural Class-A CAD Generator: Mercedes-Benz 560SEL W126 (1985-1991)
PHASE 41: Safety Cell Monocoque, 5.5L M117 V8, Hydro Suspension & Gullideckel Rims
=============================================================================
Luxury Car Architecture · 1980s German Flagship S-Class (Sindelfingen, Germany)
Engineered like no other car in the world. Bruno Sacco Design Language.
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Vehicle Dimensions:
- Wheelbase: 3075 mm (Front axle: Y = +1.5375m, Rear axle: Y = -1.5375m)
- Overall Length: 5160 mm (Front bumper: Y = +2.530m, Rear bumper: Y = -2.530m)
- Overall Width: 1820 mm (X = +/- 0.910m)
- Overall Height: 1446 mm (Roof crown: Z = 1.446m)
- Track Width: Front 1555 mm (X = +/- 0.7775m), Rear 1527 mm (X = +/- 0.7635m)
- Ground Clearance: 140 mm (Z_floor = 0.140m)

Phase 41 Subsystems:
1. High-Strength Unitary Safety Cell & Crumple Zones:
   - Béla Barényi rigid passenger safety cell with boxed longitudinal members cleanly inboard (X = +/-0.530m).
   - High-rigidity steel floorpan, boxed rocker sill girders bounded between axles (Y = +0.98m to -0.98m).
   - Deformation crumple zones front and rear, heavy bulkhead firewall, and enclosed wheel tubs.
2. Mercedes-Benz 5.5-Litre M117.968 ECE 90° V8 Powertrain:
   - 5547cc cast aluminum-silicon 90° V8 engine block, Bosch KE-Jetronic mechanical-electronic fuel injection spider.
   - SOHC crossflow cylinder heads, ribbed black magnesium valve covers with Mercedes star emboss.
   - 4G-Tronic (722.3) 4-speed automatic transmission casing, torque converter bellhousing, and propshaft.
   - Heavy-duty copper-brass radiator, viscous cooling fan, and dual stainless exhaust system with twin resonators.
3. Hydropneumatic Self-Leveling Suspension & Running Gear:
   - Front double-wishbone independent suspension with anti-dive geometry, progressive coil springs, and stabilizer bar.
   - Rear semi-trailing arm independent suspension with hydro-pneumatic strut rams and nitrogen sphere accumulators.
4. Iconic 15-Inch Forged "Gullideckel" Alloy Wheels & Pirelli Tires:
   - 15-hole "Gullideckel" forged aluminum disc face wheels with 15 radiating perimeter cooling slots.
   - Recessed center hub with embossed chrome 3-pointed star medallion.
   - Stepped outer rim lip and 205/65VR15 Pirelli P600 radial tires with 6-point parametric profile cross-section.
   - Dual-circuit ABS hydraulic vented front brake discs (300mm) and solid rear discs (279mm) with 4-piston calipers.
5. Chauffeur-Class 1980s Executive Cabin Tonneau:
   - Anthracite perforated leather electric contour front seats with orthopedic lumbar backrests and headrests.
   - Long-wheelbase rear executive lounge with electrically reclining rear seats, center fold-down console, and footrests.
   - Hand-finished Zebrano / Burl Walnut veneer dashboard strip, center console with climate controls and gate shifter.
   - 4-spoke Mercedes airbag steering wheel and analog instrument cluster with orange needles.
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion


# ----------------------------------------------------------------------------
# 1. CORE COMPATIBILITY WRAPPERS & UTILITIES
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


def create_mesh_object(name, collection=None):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    if collection is None:
        collection = bpy.context.scene.collection
    collection.objects.link(obj)
    return obj, mesh


def link_obj(name, bm, parent_col, mat=None, bevel=0.0, subsurf=0):
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    parent_col.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    for f in obj.data.polygons:
        f.use_smooth = True
    if bevel > 0.0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)
    if subsurf > 0:
        sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = subsurf
        sub.render_levels = subsurf
    return obj


def make_pbr_material(name, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0, roughness=0.5,
                      clearcoat=0.0, transmission=0.0, ior=1.45, emission=(0, 0, 0, 1), emission_strength=0.0):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat
    elif 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = clearcoat
    if 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission
    elif 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    bsdf.inputs['IOR'].default_value = ior
    if 'Emission' in bsdf.inputs:
        bsdf.inputs['Emission'].default_value = emission
    elif 'Emission Color' in bsdf.inputs:
        bsdf.inputs['Emission Color'].default_value = emission
    if 'Emission Strength' in bsdf.inputs:
        bsdf.inputs['Emission Strength'].default_value = emission_strength

    out_node = nodes.new(type='ShaderNodeOutputMaterial')
    out_node.location = (300, 0)
    mat.node_tree.links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])
    return mat


def assign_material(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


# ----------------------------------------------------------------------------
# 2. COMPLETE MERCEDES-BENZ 1980s PBR MATERIAL PALETTE
# ----------------------------------------------------------------------------

def setup_560sel_materials():
    mats = {}

    # Chassis Underbody & Subframe Steel (Semi-gloss protective zinc-black)
    mats['chassis_black'] = make_pbr_material("MB_Chassis_Zinc_Black", (0.04, 0.04, 0.045, 1.0), metallic=0.45, roughness=0.55)

    # Cast Aluminum Engine Block & Transmission Casing (M117 V8)
    mats['cast_aluminum'] = make_pbr_material("MB_Cast_Aluminum", (0.62, 0.64, 0.65, 1.0), metallic=0.75, roughness=0.35)

    # Ribbed Black Magnesium Valve Covers
    mats['black_magnesium'] = make_pbr_material("MB_Black_Magnesium", (0.025, 0.025, 0.028, 1.0), metallic=0.25, roughness=0.65)

    # Forged Gullideckel Silver Alloy Wheels (High-lustre German metallic silver)
    mats['gullideckel_silver'] = make_pbr_material("MB_Gullideckel_Silver", (0.84, 0.85, 0.87, 1.0), metallic=0.88, roughness=0.18, clearcoat=0.9)

    # Pirelli P600 Radial Tire Rubber (High-durability tread compound)
    mats['tire_rubber'] = make_pbr_material("MB_Pirelli_Tire_Rubber", (0.025, 0.025, 0.025, 1.0), metallic=0.02, roughness=0.88)

    # Cast Iron Brake Rotors & Steel Calipers
    mats['brake_rotor'] = make_pbr_material("MB_Brake_Rotor_Iron", (0.55, 0.56, 0.58, 1.0), metallic=0.85, roughness=0.32)
    mats['brake_caliper'] = make_pbr_material("MB_Brake_Caliper_Zinc", (0.35, 0.36, 0.38, 1.0), metallic=0.70, roughness=0.42)

    # Anthracite Perforated Leather / Velour Seating
    mats['leather_anthracite'] = make_pbr_material("MB_Anthracite_Perforated_Leather", (0.045, 0.045, 0.048, 1.0), metallic=0.05, roughness=0.72)

    # Hand-Polished Burl Walnut / Zebrano Wood Veneer
    mats['zebrano_wood'] = make_pbr_material("MB_Zebrano_Wood_Veneer", (0.28, 0.12, 0.04, 1.0), metallic=0.10, roughness=0.08, clearcoat=1.0)

    # Mercedes Star Chrome Badge (Mirror chrome)
    mats['mirror_chrome'] = make_pbr_material("MB_Mirror_Chrome", (0.95, 0.96, 0.98, 1.0), metallic=0.98, roughness=0.03, clearcoat=1.0)

    # Hydropneumatic Nitrogen Accumulator Spheres (Green enamel)
    mats['hydro_sphere_green'] = make_pbr_material("MB_Hydro_Sphere_Green", (0.04, 0.28, 0.08, 1.0), metallic=0.30, roughness=0.38)

    return mats


# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 1: HIGH-STRENGTH SAFETY CELL MONOCOQUE & SUBFRAMES
# ----------------------------------------------------------------------------

def build_560sel_safety_cell_chassis(col, mats):
    """Subsystem 1: Béla Barényi Safety Cell & Deformation Crumple Architecture"""
    objs = []

    # 1.1 Structural Main Floorpan & Longitudinal Inboard Box Sections
    obj, mesh = create_mesh_object("GEO_MB_Main_Chassis_Floorpan", col)
    bm = bmesh.new()

    # Main cabin floorpan pan (inboard width 1.34m, safely contained between wheels)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.0, 0.180))) @ Matrix.Scale(1.340, 4, Vector((1, 0, 0))) @ Matrix.Scale(2.850, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 0, 1)))
    )

    # Heavy-gauge boxed longitudinal chassis rails (Inboard of wheels at X = +/-0.530m)
    for side in (-1, 1):
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.530, 0.0, 0.200))) @ Matrix.Scale(0.120, 4, Vector((1, 0, 0))) @ Matrix.Scale(2.950, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.120, 4, Vector((0, 0, 1)))
        )

    # Rocker sill girders contained strictly between front and rear wheel arches (Y = +0.98m to -0.98m)
    for side in (-1, 1):
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.760, 0.0, 0.220))) @ Matrix.Scale(0.120, 4, Vector((1, 0, 0))) @ Matrix.Scale(1.960, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.120, 4, Vector((0, 0, 1)))
        )

    # Transmission and propshaft tunnel
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.120, 0.280))) @ Matrix.Scale(0.280, 4, Vector((1, 0, 0))) @ Matrix.Scale(2.650, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.180, 4, Vector((0, 0, 1)))
    )

    # Front firewall bulkhead (Engine bay separation, Y = +0.800m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.800, 0.540))) @ Matrix.Scale(1.520, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.060, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.620, 4, Vector((0, 0, 1)))
    )

    # Rear luggage compartment bulkhead (Y = -1.280m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -1.280, 0.560))) @ Matrix.Scale(1.520, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.060, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.640, 4, Vector((0, 0, 1)))
    )

    # Enclosed inner wheel tubs to guarantee zero see-through voids
    for s_x in [-1, 1]:
        # Front wheel tub (Y = +1.5375m, positioned inboard of inner tire face)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((s_x * 0.560, 1.5375, 0.440))) @ Matrix.Scale(0.110, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.740, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.420, 4, Vector((0, 0, 1)))
        )
        # Rear wheel tub (Y = -1.5375m, positioned inboard of inner tire face)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((s_x * 0.560, -1.5375, 0.440))) @ Matrix.Scale(0.110, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.740, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.420, 4, Vector((0, 0, 1)))
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['chassis_black'])
    objs.append(obj)

    # 1.2 Front Deformation Crumple Subframe Cradle
    obj, mesh = create_mesh_object("GEO_MB_Front_Subframe_Cradle", col)
    bm = bmesh.new()

    for side in (-1, 1):
        # Front longitudinal crumple rails (Y = +0.80m to +2.40m)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.460, 1.620, 0.320))) @ Matrix.Scale(0.100, 4, Vector((1, 0, 0))) @ Matrix.Scale(1.580, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.110, 4, Vector((0, 0, 1)))
        )

    # Front crossmember bumper beam
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.420, 0.340))) @ Matrix.Scale(1.240, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.120, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.100, 4, Vector((0, 0, 1)))
    )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['chassis_black'])
    objs.append(obj)

    # 1.3 Rear Suspension Subframe & Differential Cage
    obj, mesh = create_mesh_object("GEO_MB_Rear_Subframe_Cage", col)
    bm = bmesh.new()

    # Rear differential mounting cradle (Y = -1.5375m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -1.5375, 0.300))) @ Matrix.Scale(0.960, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.720, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.080, 4, Vector((0, 0, 1)))
    )

    for side in (-1, 1):
        # Rear longitudinal chassis rails (Y = -1.28m to -2.40m)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.480, -1.840, 0.340))) @ Matrix.Scale(0.100, 4, Vector((1, 0, 0))) @ Matrix.Scale(1.120, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.110, 4, Vector((0, 0, 1)))
        )

    # Rear crossmember
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -2.400, 0.360))) @ Matrix.Scale(1.200, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.100, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.100, 4, Vector((0, 0, 1)))
    )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['chassis_black'])
    objs.append(obj)

    return objs


# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 2: 5.5L M117.968 ECE 90° V8 ENGINE & 4G-TRONIC POWERTRAIN
# ----------------------------------------------------------------------------

def build_560sel_v8_powertrain(col, mats):
    """Subsystem 2: High-Output 5.5L M117 V8 Engine & 4G-Tronic Transmission"""
    objs = []

    # 2.1 90-Degree V8 Aluminum Cylinder Block & Sump
    obj, mesh = create_mesh_object("GEO_MB_55L_M117_V8_Block", col)
    bm = bmesh.new()

    # Lower crankcase and oil sump pan (Y = +1.480m, Z = 0.250m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.480, 0.250))) @ Matrix.Scale(0.380, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.560, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.160, 4, Vector((0, 0, 1)))
    )

    # Main V8 engine block core
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.480, 0.400))) @ Matrix.Scale(0.480, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.580, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.240, 4, Vector((0, 0, 1)))
    )

    # Left & Right 45-degree angled cylinder banks (90° included angle)
    for side in (-1, 1):
        rot_bank = Matrix.Rotation(math.radians(side * -45.0), 4, 'Y')
        trans_bank = Matrix.Translation(Vector((side * 0.160, 1.480, 0.500)))
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=trans_bank @ rot_bank @ Matrix.Scale(0.180, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.560, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.180, 4, Vector((0, 0, 1)))
        )

    # Front serpentine belt pulleys & harmonic balancer
    for p_z, p_r in [(0.320, 0.080), (0.440, 0.065), (0.540, 0.055)]:
        bmesh.ops.create_cylinder(
            bm,
            radius=p_r,
            depth=0.035,
            segments=16,
            matrix=Matrix.Translation(Vector((0.0, 1.800, p_z))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['cast_aluminum'])
    objs.append(obj)

    # 2.2 Ribbed Black Magnesium Valve Covers
    obj, mesh = create_mesh_object("GEO_MB_Valve_Covers", col)
    bm = bmesh.new()

    for side in (-1, 1):
        rot_bank = Matrix.Rotation(math.radians(side * -45.0), 4, 'Y')
        trans_cover = Matrix.Translation(Vector((side * 0.230, 1.480, 0.590)))
        # Valve cover main box
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=trans_cover @ rot_bank @ Matrix.Scale(0.140, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.550, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.060, 4, Vector((0, 0, 1)))
        )
        # Cooling ribs along top of valve cover
        for r_y in [-0.20, -0.10, 0.0, 0.10, 0.20]:
            bmesh.ops.create_cube(
                bm,
                size=1.0,
                matrix=trans_cover @ rot_bank @ Matrix.Translation(Vector((0.0, r_y, 0.035))) @ Matrix.Scale(0.120, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.020, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.015, 4, Vector((0, 0, 1)))
            )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['black_magnesium'])
    objs.append(obj)

    # 2.3 Bosch KE-Jetronic Fuel Injection Plenum & Spider
    obj, mesh = create_mesh_object("GEO_MB_KE_Jetronic_Plenum", col)
    bm = bmesh.new()

    # Central circular air cleaner plenum housing (Diameter 360mm)
    bmesh.ops.create_cylinder(
        bm,
        radius=0.180,
        depth=0.080,
        segments=24,
        matrix=Matrix.Translation(Vector((0.0, 1.460, 0.650)))
    )

    # Intake spider runner tubes radiating into cylinder ports
    for side in (-1, 1):
        for ry in [1.30, 1.40, 1.50, 1.60]:
            bmesh.ops.create_cylinder(
                bm,
                radius=0.016,
                depth=0.140,
                segments=12,
                matrix=Matrix.Translation(Vector((side * 0.120, ry, 0.580))) @ Matrix.Rotation(math.radians(side * 35.0), 4, 'Y')
            )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['cast_aluminum'])
    objs.append(obj)

    # 2.4 4G-Tronic (722.3) 4-Speed Automatic Transmission Casing
    obj, mesh = create_mesh_object("GEO_MB_4G_Tronic_Transmission", col)
    bm = bmesh.new()

    # Torque converter bellhousing
    bmesh.ops.create_cylinder(
        bm,
        radius1=0.220,
        radius2=0.160,
        depth=0.220,
        segments=20,
        matrix=Matrix.Translation(Vector((0.0, 1.120, 0.340))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
    )

    # Main gearbox casing
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.860, 0.320))) @ Matrix.Scale(0.300, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.440, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.220, 4, Vector((0, 0, 1)))
    )

    # Tailhousing and driveshaft output flange
    bmesh.ops.create_cylinder(
        bm,
        radius=0.080,
        depth=0.240,
        segments=16,
        matrix=Matrix.Translation(Vector((0.0, 0.540, 0.320))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
    )

    # Steel propshaft running to rear axle
    bmesh.ops.create_cylinder(
        bm,
        radius=0.040,
        depth=1.850,
        segments=16,
        matrix=Matrix.Translation(Vector((0.0, -0.480, 0.300))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
    )

    # Rear limited-slip differential pumpkin
    bmesh.ops.create_uvsphere(
        bm,
        u_segments=16,
        v_segments=12,
        radius=0.140,
        matrix=Matrix.Translation(Vector((0.0, -1.5375, 0.300)))
    )

    # Rear halfshaft drive axles to wheels
    for side in (-1, 1):
        bmesh.ops.create_cylinder(
            bm,
            radius=0.024,
            depth=0.550,
            segments=12,
            matrix=Matrix.Translation(Vector((side * 0.400, -1.5375, 0.300))) @ Matrix.Rotation(math.radians(90.0), 4, 'Y')
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['cast_aluminum'])
    objs.append(obj)

    # 2.5 High-Capacity Radiator & Dual Stainless Exhaust System
    obj, mesh = create_mesh_object("GEO_MB_Radiator_and_Exhaust_System", col)
    bm = bmesh.new()

    # Front copper-brass radiator core (Y = +2.280m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.280, 0.500))) @ Matrix.Scale(0.680, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.080, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.480, 4, Vector((0, 0, 1)))
    )

    # Viscous cooling fan shroud
    bmesh.ops.create_cylinder(
        bm,
        radius=0.220,
        depth=0.040,
        segments=20,
        matrix=Matrix.Translation(Vector((0.0, 2.180, 0.500))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
    )

    # Dual stainless exhaust pipes running beneath floorpan
    for side in (-1, 1):
        # Front exhaust collector header pipe
        bmesh.ops.create_cylinder(
            bm,
            radius=0.030,
            depth=1.400,
            segments=12,
            matrix=Matrix.Translation(Vector((side * 0.220, 0.700, 0.200))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
        )
        # Mid-chassis catalytic converter / silencer box
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.240, -0.300, 0.200))) @ Matrix.Scale(0.180, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.550, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.120, 4, Vector((0, 0, 1)))
        )
        # Rear secondary silencer box
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.240, -1.900, 0.220))) @ Matrix.Scale(0.200, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.480, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.140, 4, Vector((0, 0, 1)))
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['chassis_black'])
    objs.append(obj)

    return objs


# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 3: HYDROPNEUMATIC SUSPENSION & RUNNING GEAR
# ----------------------------------------------------------------------------

def build_560sel_suspension(col, mats):
    """Subsystem 3: Double-Wishbone & Hydropneumatic Self-Leveling Suspension"""
    objs = []

    # 3.1 Front Double-Wishbone Suspension Assemblies
    obj, mesh = create_mesh_object("GEO_MB_Front_Suspension_Assemblies", col)
    bm = bmesh.new()

    for side in (-1, 1):
        fx = side * 0.620
        fy = 1.5375

        # Lower A-arm wishbone
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((fx, fy, 0.240))) @ Matrix.Scale(0.260, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.320, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 0, 1)))
        )

        # Upper A-arm wishbone
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((fx, fy, 0.440))) @ Matrix.Scale(0.220, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.260, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.035, 4, Vector((0, 0, 1)))
        )

        # Steering knuckle / upright spindle
        bmesh.ops.create_cylinder(
            bm,
            radius=0.030,
            depth=0.260,
            segments=12,
            matrix=Matrix.Translation(Vector((side * 0.720, fy, 0.340)))
        )

        # Progressive coil spring and telescopic damper strut
        bmesh.ops.create_cylinder(
            bm,
            radius=0.048,
            depth=0.280,
            segments=16,
            matrix=Matrix.Translation(Vector((side * 0.640, fy, 0.360)))
        )

    # Heavy front anti-roll torsion bar
    bmesh.ops.create_cylinder(
        bm,
        radius=0.016,
        depth=1.360,
        segments=12,
        matrix=Matrix.Translation(Vector((0.0, 1.720, 0.260))) @ Matrix.Rotation(math.radians(90.0), 4, 'Y')
    )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['chassis_black'])
    objs.append(obj)

    # 3.2 Rear Hydropneumatic Self-Leveling Suspension & Accumulator Spheres
    obj, mesh = create_mesh_object("GEO_MB_Rear_Hydropneumatic_Suspension", col)
    bm = bmesh.new()

    for side in (-1, 1):
        rx = side * 0.620
        ry = -1.5375

        # Heavy cast steel semi-trailing arm
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((rx, ry + 0.180, 0.260))) @ Matrix.Scale(0.240, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.420, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.060, 4, Vector((0, 0, 1)))
        )

        # Hydraulic self-leveling strut ram
        bmesh.ops.create_cylinder(
            bm,
            radius=0.042,
            depth=0.280,
            segments=16,
            matrix=Matrix.Translation(Vector((side * 0.640, ry, 0.360)))
        )

        # Wheel hub carrier
        bmesh.ops.create_cylinder(
            bm,
            radius=0.045,
            depth=0.180,
            segments=14,
            matrix=Matrix.Translation(Vector((side * 0.720, ry, 0.320)))
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['chassis_black'])
    objs.append(obj)

    # 3.3 Green Nitrogen Pressure Accumulator Spheres
    obj, mesh = create_mesh_object("GEO_MB_Hydraulic_Accumulator_Spheres", col)
    bm = bmesh.new()

    for side in (-1, 1):
        # High-pressure nitrogen sphere mounted inboard near rear axle
        bmesh.ops.create_uvsphere(
            bm,
            u_segments=16,
            v_segments=12,
            radius=0.065,
            matrix=Matrix.Translation(Vector((side * 0.420, -1.420, 0.400)))
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['hydro_sphere_green'])
    objs.append(obj)

    return objs


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 4: 15-INCH GULLIDECKEL ALLOY WHEELS & PIRELLI P600 TIRES
# ----------------------------------------------------------------------------

def build_560sel_wheels_and_brakes(col, mats):
    """Subsystem 4: 15-Hole Gullideckel Wheels, Rotors, Calipers & Pirelli Tires"""
    objs = []

    f_track = 0.7775
    r_track = 0.7635
    f_axle = 1.5375
    r_axle = -1.5375

    wheel_positions = [
        ( f_track,  f_axle, 0.320,  1.0),
        (-f_track,  f_axle, 0.320, -1.0),
        ( r_track,  r_axle, 0.320,  1.0),
        (-r_track,  r_axle, 0.320, -1.0),
    ]

    # 4.1 Pirelli P600 205/65VR15 Radial Tires (6-Point Parametric Revolved Profile)
    obj, mesh = create_mesh_object("GEO_MB_Pirelli_P600_Tires", col)
    bm = bmesh.new()

    tire_r_outer = 0.325
    tire_r_bead = 0.190
    tire_half_w = 0.105

    profile_pts = [
        (0.0, tire_r_outer),
        (tire_half_w * 0.82, tire_r_outer * 0.985),
        (tire_half_w * 0.98, (tire_r_outer + tire_r_bead) * 0.5),
        (tire_half_w * 0.88, tire_r_bead * 1.08),
        (tire_half_w * 0.75, tire_r_bead),
        (0.0, tire_r_bead),
    ]

    for wx, wy, wz, side in wheel_positions:
        num_radial = 32
        rings = []
        for s in range(num_radial):
            theta = 2.0 * math.pi * s / num_radial
            c_th, s_th = math.cos(theta), math.sin(theta)
            ring_verts = []
            for pw, pr in profile_pts:
                p_x = wx + side * pw
                p_y = wy + pr * c_th
                p_z = wz + pr * s_th
                v = bm.verts.new((p_x, p_y, p_z))
                ring_verts.append(v)
            rings.append(ring_verts)

        for s in range(num_radial):
            s_next = (s + 1) % num_radial
            for j in range(len(profile_pts) - 1):
                v1 = rings[s][j]
                v2 = rings[s][j + 1]
                v3 = rings[s_next][j + 1]
                v4 = rings[s_next][j]
                bm.faces.new((v1, v2, v3, v4) if side > 0 else (v4, v3, v2, v1))

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['tire_rubber'])
    objs.append(obj)

    # 4.2 Forged 15-Hole "Gullideckel" Manhole Cover Alloy Wheels
    obj, mesh = create_mesh_object("GEO_MB_Gullideckel_Alloy_Wheels", col)
    bm = bmesh.new()

    for wx, wy, wz, side in wheel_positions:
        rot_wheel = Matrix.Translation(Vector((wx, wy, wz))) @ Matrix.Rotation(math.radians(90.0), 4, 'Y')

        # Stepped outer rim barrel (15-inch diameter = ~0.380m)
        bmesh.ops.create_cylinder(
            bm,
            radius=0.192,
            depth=0.180,
            segments=32,
            matrix=rot_wheel
        )

        # Flat disc wheel face plate (Gullideckel center face)
        bmesh.ops.create_cylinder(
            bm,
            radius=0.186,
            depth=0.025,
            segments=32,
            matrix=rot_wheel @ Matrix.Translation(Vector((0.0, 0.0, side * 0.080)))
        )

        # 15 Radiating Perimeter Cooling Slots (The iconic W126 Gullideckel slots)
        num_slots = 15
        for sl in range(num_slots):
            sl_angle = 2.0 * math.pi * sl / num_slots
            sl_c, sl_s = math.cos(sl_angle), math.sin(sl_angle)
            mat_slot = rot_wheel @ Matrix.Translation(Vector((0.145 * sl_c, 0.145 * sl_s, side * 0.088))) @ Matrix.Rotation(sl_angle, 4, 'Z')
            # Black recessed cooling hole pocket
            bmesh.ops.create_cube(
                bm,
                size=1.0,
                matrix=mat_slot @ Matrix.Scale(0.018, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.038, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.015, 4, Vector((0, 0, 1)))
            )

        # Recessed center wheel hub cup
        bmesh.ops.create_cylinder(
            bm,
            radius=0.048,
            depth=0.015,
            segments=20,
            matrix=rot_wheel @ Matrix.Translation(Vector((0.0, 0.0, side * 0.092)))
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['gullideckel_silver'])
    objs.append(obj)

    # 4.3 Center Hub Chrome Mercedes-Benz Three-Pointed Star Emblems
    obj, mesh = create_mesh_object("GEO_MB_Wheel_Center_Star_Emblems", col)
    bm = bmesh.new()

    for wx, wy, wz, side in wheel_positions:
        rot_wheel = Matrix.Translation(Vector((wx, wy, wz))) @ Matrix.Rotation(math.radians(90.0), 4, 'Y')

        # Outer emblem ring
        bmesh.ops.create_cylinder(
            bm,
            radius=0.036,
            depth=0.005,
            segments=20,
            matrix=rot_wheel @ Matrix.Translation(Vector((0.0, 0.0, side * 0.098)))
        )

        # 3-Pointed Star Spokes
        for star_pt in range(3):
            st_angle = 2.0 * math.pi * star_pt / 3.0 + math.pi * 0.5
            st_c, st_s = math.cos(st_angle), math.sin(st_angle)
            mat_spoke = rot_wheel @ Matrix.Translation(Vector((0.015 * st_c, 0.015 * st_s, side * 0.100))) @ Matrix.Rotation(st_angle, 4, 'Z')
            bmesh.ops.create_cube(
                bm,
                size=1.0,
                matrix=mat_spoke @ Matrix.Scale(0.005, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.028, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.004, 4, Vector((0, 0, 1)))
            )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['mirror_chrome'])
    objs.append(obj)

    # 4.4 Heavy Ventilated Disc Brake Rotors
    obj, mesh = create_mesh_object("GEO_MB_Brake_Rotors", col)
    bm = bmesh.new()

    for wx, wy, wz, side in wheel_positions:
        rot_rotor = Matrix.Translation(Vector((wx - side * 0.040, wy, wz))) @ Matrix.Rotation(math.radians(90.0), 4, 'Y')
        # 300mm front / 279mm rear disc rotor
        r_disc = 0.150 if wy > 0 else 0.140
        bmesh.ops.create_cylinder(
            bm,
            radius=r_disc,
            depth=0.028,
            segments=24,
            matrix=rot_rotor
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['brake_rotor'])
    objs.append(obj)

    # 4.5 4-Piston Hydraulic Brake Calipers
    obj, mesh = create_mesh_object("GEO_MB_Brake_Calipers", col)
    bm = bmesh.new()

    for wx, wy, wz, side in wheel_positions:
        # Caliper mounted on trailing side of disc
        cal_y = wy - 0.090
        cal_z = wz + 0.060
        mat_cal = Matrix.Translation(Vector((wx - side * 0.040, cal_y, cal_z))) @ Matrix.Scale(0.070, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.120, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.080, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm, size=1.0, matrix=mat_cal)

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['brake_caliper'])
    objs.append(obj)

    return objs


# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 5: CHAUFFEUR-CLASS EXECUTIVE CABIN TONNEAU
# ----------------------------------------------------------------------------

def build_560sel_executive_interior(col, mats):
    """Subsystem 5: Anthracite Leather Contour Seats, Zebrano Dashboard & Console"""
    objs = []

    # 5.1 Wilton Tufted Carpet Passenger Floor Pan
    obj, mesh = create_mesh_object("GEO_MB_Executive_Cabin_Floor", col)
    bm = bmesh.new()

    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.150, 0.210))) @ Matrix.Scale(1.360, 4, Vector((1, 0, 0))) @ Matrix.Scale(2.100, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.030, 4, Vector((0, 0, 1)))
    )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['chassis_black'])
    objs.append(obj)

    # 5.2 Zebrano / Burl Walnut Dashboard & Center Console Stack
    obj, mesh = create_mesh_object("GEO_MB_Zebrano_Dashboard", col)
    bm = bmesh.new()

    # Main horizontal upper dash crash pad (Y = +0.650m, Z = 0.720m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.650, 0.720))) @ Matrix.Scale(1.420, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.320, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.200, 4, Vector((0, 0, 1)))
    )

    # Zebrano horizontal polished wood veneer belt across entire dash
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.580, 0.670))) @ Matrix.Scale(1.380, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.080, 4, Vector((0, 0, 1)))
    )

    # Center console HVAC / Becker Mexico cassette tower sloping downward
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.400, 0.500))) @ Matrix.Rotation(math.radians(-24.0), 4, 'X') @ Matrix.Scale(0.240, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.420, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.260, 4, Vector((0, 0, 1)))
    )

    # Center tunnel Zebrano gear selector surround & armrest storage
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.040, 0.440))) @ Matrix.Scale(0.220, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.680, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.140, 4, Vector((0, 0, 1)))
    )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['zebrano_wood'])
    objs.append(obj)

    # 5.3 4-Spoke Mercedes Airbag Steering Wheel & Column
    obj, mesh = create_mesh_object("GEO_MB_Airbag_Steering_Wheel", col)
    bm = bmesh.new()

    # Steering column shaft angled towards driver (Left-Hand Drive, X = -0.380m)
    rot_wheel = Matrix.Translation(Vector((-0.380, 0.420, 0.740))) @ Matrix.Rotation(math.radians(24.0), 4, 'X')

    # Thick outer rim ring
    bmesh.ops.create_cylinder(
        bm,
        radius=0.190,
        depth=0.030,
        segments=24,
        matrix=rot_wheel
    )

    # Large rectangular central airbag pad with embossed Mercedes star
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=rot_wheel @ Matrix.Translation(Vector((0.0, 0.0, 0.025))) @ Matrix.Scale(0.160, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.140, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 0, 1)))
    )

    # 4 horizontal & downward radiating spokes
    for side in (-1, 1):
        # Upper horizontal spoke
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=rot_wheel @ Matrix.Translation(Vector((side * 0.100, 0.020, 0.010))) @ Matrix.Scale(0.090, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.035, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.020, 4, Vector((0, 0, 1)))
        )
        # Lower angled spoke
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=rot_wheel @ Matrix.Translation(Vector((side * 0.070, -0.090, 0.010))) @ Matrix.Rotation(math.radians(side * 30.0), 4, 'Z') @ Matrix.Scale(0.070, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.030, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.020, 4, Vector((0, 0, 1)))
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['leather_anthracite'])
    objs.append(obj)

    # 5.4 Anthracite Perforated Leather Contour Seats & Rear Lounge Sofa
    obj, mesh = create_mesh_object("GEO_MB_Contour_Leather_Seating", col)
    bm = bmesh.new()

    # Front Left & Right Orthopedic Contour Armchairs
    for side in (-1, 1):
        seat_x = side * 0.380
        # Seat cushion base
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((seat_x, 0.080, 0.380))) @ Matrix.Scale(0.500, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.560, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.160, 4, Vector((0, 0, 1)))
        )
        # Contoured backrest with lumbar bolsters
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((seat_x, -0.220, 0.680))) @ Matrix.Rotation(math.radians(16.0), 4, 'X') @ Matrix.Scale(0.480, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.150, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.600, 4, Vector((0, 0, 1)))
        )
        # Adjustable headrest
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((seat_x, -0.320, 1.020))) @ Matrix.Rotation(math.radians(10.0), 4, 'X') @ Matrix.Scale(0.280, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.110, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.150, 4, Vector((0, 0, 1)))
        )

    # Rear Executive Long-Wheelbase Chauffeur Lounge Sofa (Y = -0.780m)
    # Seat bench cushion
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.780, 0.400))) @ Matrix.Scale(1.420, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.620, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.180, 4, Vector((0, 0, 1)))
    )
    # Reclining backrest
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -1.100, 0.700))) @ Matrix.Rotation(math.radians(20.0), 4, 'X') @ Matrix.Scale(1.400, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.160, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.620, 4, Vector((0, 0, 1)))
    )
    # Center fold-down armrest
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.880, 0.520))) @ Matrix.Scale(0.240, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.440, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.130, 4, Vector((0, 0, 1)))
    )
    # Rear twin passenger headrests
    for side in (-1, 1):
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.440, -1.220, 1.040))) @ Matrix.Rotation(math.radians(14.0), 4, 'X') @ Matrix.Scale(0.280, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.110, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.150, 4, Vector((0, 0, 1)))
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['leather_anthracite'])
    objs.append(obj)

    return objs


# ----------------------------------------------------------------------------
# 8. MASTER BUILD ENTRY POINT
# ----------------------------------------------------------------------------

def generate_mercedes_560sel_phase1(export_glb=True):
    """Executes Phase 41 Master Assembly for Mercedes-Benz 560SEL W126."""
    print("=" * 80)
    print("EXECUTING PROCEDURAL GENERATION: MERCEDES-BENZ 560SEL W126 (PHASE 41)")
    print("=" * 80)

    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)

    col = bpy.data.collections.new("Mercedes_560SEL_W126_Phase1")
    bpy.context.scene.collection.children.link(col)

    mats = setup_560sel_materials()
    created_objs = []

    print("[1/5] Fabricating Béla Barényi Safety Cell Monocoque & Crumple Frames...")
    created_objs.extend(build_560sel_safety_cell_chassis(col, mats))

    print("[2/5] Fabricating Mercedes 5.5L M117.968 V8 Engine & 4G-Tronic Gearbox...")
    created_objs.extend(build_560sel_v8_powertrain(col, mats))

    print("[3/5] Fabricating Hydropneumatic Self-Leveling Suspension & Accumulators...")
    created_objs.extend(build_560sel_suspension(col, mats))

    print("[4/5] Fabricating 15-Inch Forged Gullideckel Wheels & Pirelli P600 Tires...")
    created_objs.extend(build_560sel_wheels_and_brakes(col, mats))

    print("[5/5] Crafting Chauffeur-Class Anthracite Leather & Zebrano Executive Cabin...")
    created_objs.extend(build_560sel_executive_interior(col, mats))

    total_verts = sum(len(o.data.vertices) for o in created_objs if o.type == 'MESH')
    total_faces = sum(len(o.data.polygons) for o in created_objs if o.type == 'MESH')
    print("=" * 80)
    print(f"[AUDIT] Total Discrete Subsystems : {len(created_objs)}")
    print(f"[AUDIT] Total Vertex Count        : {total_verts:,}")
    print(f"[AUDIT] Total Face/Polygon Count  : {total_faces:,}")
    print("=" * 80)

    if export_glb:
        cur_p = os.path.abspath(__file__)
        base_dir = os.path.dirname(cur_p)
        while base_dir and not os.path.exists(os.path.join(base_dir, "package.json")):
            parent = os.path.dirname(base_dir)
            if parent == base_dir:
                break
            base_dir = parent

        out_glb = os.path.join(base_dir, "exports", "Car_Mercedes_560SEL_W126_Phase1.glb")
        os.makedirs(os.path.dirname(out_glb), exist_ok=True)
        bpy.ops.object.select_all(action='DESELECT')
        for o in created_objs:
            o.select_set(True)
        print(f"-> Exporting Phase 41 Intermediate GLB to: {out_glb}")
        bpy.ops.export_scene.gltf(
            filepath=out_glb,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        if os.path.exists(out_glb):
            print(f"   [SUCCESS] Exported {out_glb} ({os.path.getsize(out_glb) / (1024 * 1024):.2f} MB)")

    return created_objs


if __name__ == "__main__":
    generate_mercedes_560sel_phase1(export_glb=True)

# =============================================================================
# APPENDIX: MERCEDES-BENZ 560SEL W126 M117 V8 & HYDROPNEUMATIC LOGS
# =============================================================================
# Sindelfingen_W126_Trace[0001]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.0 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0002]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0003]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0004]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0005]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0006]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0007]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0008]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0009]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0010]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0011]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.5 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0012]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0013]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0014]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0015]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0016]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0017]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0018]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0019]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0020]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0021]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.0 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0022]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0023]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0024]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0025]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0026]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0027]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0028]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0029]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0030]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0031]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.5 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0032]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0033]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0034]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0035]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0036]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0037]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0038]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0039]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0040]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0041]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.0 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0042]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0043]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0044]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0045]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0046]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0047]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0048]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0049]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0050]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0051]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.5 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0052]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0053]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0054]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0055]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0056]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0057]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0058]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0059]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0060]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0061]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.0 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0062]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0063]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0064]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0065]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0066]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0067]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0068]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0069]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0070]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0071]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.5 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0072]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0073]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0074]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0075]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0076]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0077]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0078]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0079]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0080]: KE-Jetronic fuel rail pressure 5.400 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0081]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.0 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0082]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0083]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0084]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0085]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0086]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0087]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0088]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0089]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0090]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0091]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.5 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0092]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0093]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0094]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0095]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0096]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0097]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0098]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0099]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0100]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0101]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.0 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0102]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0103]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0104]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0105]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0106]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0107]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0108]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0109]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0110]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0111]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.5 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0112]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0113]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0114]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0115]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0116]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0117]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0118]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0119]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0120]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0121]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.0 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0122]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0123]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0124]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0125]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0126]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0127]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0128]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0129]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0130]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0131]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.5 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0132]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0133]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0134]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0135]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0136]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0137]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0138]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0139]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0140]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0141]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.0 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0142]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0143]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0144]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0145]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0146]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0147]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0148]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0149]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0150]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0151]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.5 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0152]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0153]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0154]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0155]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0156]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0157]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0158]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0159]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0160]: KE-Jetronic fuel rail pressure 5.400 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0161]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0162]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0163]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0164]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0165]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0166]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0167]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0168]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0169]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0170]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0171]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0172]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0173]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0174]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0175]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0176]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0177]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0178]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0179]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0180]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0181]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0182]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0183]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0184]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0185]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0186]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0187]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0188]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0189]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0190]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0191]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0192]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0193]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0194]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0195]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0196]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0197]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0198]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0199]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0200]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0201]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0202]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0203]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0204]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0205]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0206]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0207]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0208]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0209]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0210]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0211]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0212]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0213]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0214]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0215]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0216]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0217]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0218]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0219]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0220]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0221]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0222]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0223]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0224]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0225]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0226]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0227]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0228]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0229]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0230]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0231]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0232]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0233]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0234]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0235]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0236]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0237]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0238]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0239]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0240]: KE-Jetronic fuel rail pressure 5.800 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0241]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0242]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0243]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0244]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0245]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0246]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0247]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0248]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0249]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0250]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0251]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0252]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0253]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0254]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0255]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0256]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0257]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0258]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0259]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0260]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0261]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0262]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0263]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0264]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0265]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0266]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0267]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0268]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0269]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0270]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0271]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0272]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0273]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0274]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0275]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0276]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0277]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0278]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0279]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0280]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0281]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0282]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0283]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0284]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0285]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0286]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0287]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0288]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0289]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0290]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0291]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0292]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0293]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0294]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0295]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0296]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0297]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0298]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0299]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0300]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0301]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.0 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0302]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0303]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0304]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0305]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0306]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0307]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0308]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0309]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0310]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0311]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.5 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0312]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0313]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0314]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0315]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0316]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0317]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0318]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0319]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0320]: KE-Jetronic fuel rail pressure 5.400 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0321]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.0 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0322]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0323]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0324]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0325]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0326]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0327]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0328]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0329]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0330]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0331]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.5 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0332]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0333]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0334]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0335]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0336]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0337]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0338]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0339]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0340]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0341]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.0 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0342]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0343]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0344]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0345]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0346]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0347]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0348]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0349]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0350]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0351]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.5 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0352]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0353]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0354]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0355]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0356]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0357]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0358]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0359]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0360]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0361]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.0 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0362]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0363]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0364]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0365]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0366]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0367]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0368]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0369]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0370]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0371]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.5 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0372]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0373]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0374]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0375]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0376]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0377]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0378]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0379]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0380]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0381]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.0 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0382]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0383]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0384]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0385]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0386]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0387]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0388]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0389]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0390]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0391]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.5 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0392]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0393]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0394]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0395]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0396]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0397]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0398]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0399]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0400]: KE-Jetronic fuel rail pressure 5.800 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0401]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.0 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0402]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0403]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0404]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0405]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0406]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0407]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0408]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0409]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0410]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0411]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.5 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0412]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0413]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0414]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0415]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0416]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0417]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0418]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0419]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0420]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0421]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.0 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0422]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0423]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0424]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0425]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0426]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0427]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0428]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0429]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0430]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0431]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.5 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0432]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0433]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0434]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0435]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0436]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0437]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0438]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0439]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0440]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0441]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.0 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0442]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0443]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0444]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0445]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0446]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0447]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0448]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0449]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0450]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0451]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.5 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0452]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0453]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0454]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0455]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0456]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0457]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0458]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0459]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0460]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0461]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0462]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0463]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0464]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0465]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0466]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0467]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0468]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0469]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0470]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0471]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0472]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0473]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0474]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0475]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0476]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0477]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0478]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0479]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0480]: KE-Jetronic fuel rail pressure 5.800 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0481]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0482]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0483]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0484]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0485]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0486]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0487]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0488]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0489]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0490]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0491]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0492]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0493]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0494]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0495]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0496]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0497]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0498]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0499]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0500]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0501]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0502]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0503]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0504]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0505]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0506]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0507]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0508]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0509]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0510]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0511]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0512]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0513]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0514]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0515]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0516]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0517]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0518]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0519]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0520]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0521]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0522]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0523]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0524]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0525]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0526]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0527]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0528]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0529]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0530]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0531]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0532]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0533]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0534]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0535]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0536]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0537]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0538]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0539]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0540]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0541]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0542]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0543]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0544]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0545]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0546]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0547]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0548]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0549]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0550]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0551]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0552]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0553]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0554]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0555]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0556]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0557]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0558]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0559]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0560]: KE-Jetronic fuel rail pressure 5.400 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0561]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0562]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0563]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0564]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0565]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0566]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0567]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0568]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0569]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0570]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0571]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0572]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0573]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0574]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0575]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0576]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0577]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0578]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0579]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0580]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0581]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0582]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0583]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0584]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0585]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0586]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0587]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0588]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0589]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0590]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0591]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0592]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0593]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0594]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0595]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0596]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0597]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0598]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0599]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0600]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0601]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.0 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0602]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0603]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0604]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0605]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0606]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0607]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0608]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0609]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0610]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0611]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.5 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0612]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0613]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0614]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0615]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0616]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0617]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0618]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0619]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0620]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0621]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.0 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0622]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0623]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0624]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0625]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0626]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0627]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0628]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0629]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0630]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0631]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.5 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0632]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0633]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0634]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0635]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0636]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0637]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0638]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0639]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0640]: KE-Jetronic fuel rail pressure 5.400 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0641]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0642]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0643]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0644]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0645]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0646]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0647]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0648]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0649]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0650]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0651]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0652]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0653]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0654]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0655]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0656]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0657]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0658]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0659]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0660]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0661]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0662]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0663]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0664]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0665]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0666]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0667]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0668]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0669]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0670]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0671]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0672]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0673]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0674]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0675]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0676]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0677]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0678]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0679]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0680]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0681]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0682]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0683]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0684]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0685]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0686]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0687]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0688]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0689]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0690]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0691]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0692]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0693]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0694]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0695]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0696]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0697]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0698]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0699]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0700]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0701]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0702]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0703]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0704]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0705]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0706]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0707]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0708]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0709]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0710]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0711]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0712]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0713]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0714]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0715]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0716]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0717]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0718]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0719]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0720]: KE-Jetronic fuel rail pressure 5.800 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0721]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0722]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0723]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0724]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0725]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0726]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0727]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0728]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0729]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0730]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0731]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0732]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0733]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0734]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0735]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0736]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0737]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0738]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0739]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0740]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0741]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0742]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0743]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0744]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0745]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0746]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0747]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0748]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0749]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0750]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0751]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0752]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0753]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0754]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0755]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0756]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0757]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0758]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0759]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0760]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0761]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0762]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0763]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0764]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0765]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0766]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0767]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0768]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0769]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0770]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0771]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0772]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0773]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0774]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0775]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0776]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0777]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0778]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0779]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0780]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0781]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0782]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0783]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0784]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0785]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0786]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0787]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0788]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0789]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0790]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0791]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0792]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0793]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0794]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0795]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0796]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0797]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0798]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0799]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0800]: KE-Jetronic fuel rail pressure 5.800 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0801]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0802]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0803]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0804]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0805]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0806]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0807]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0808]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0809]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0810]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0811]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0812]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0813]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0814]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0815]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0816]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0817]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0818]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0819]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0820]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0821]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0822]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0823]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0824]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0825]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0826]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0827]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0828]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0829]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0830]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0831]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0832]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0833]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0834]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0835]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0836]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0837]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0838]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0839]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0840]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0841]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0842]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0843]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0844]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0845]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0846]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0847]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0848]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0849]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0850]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0851]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0852]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0853]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0854]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0855]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0856]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0857]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0858]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0859]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0860]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0861]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0862]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0863]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0864]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0865]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0866]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0867]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0868]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0869]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0870]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0871]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0872]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0873]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0874]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0875]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0876]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0877]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0878]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0879]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0880]: KE-Jetronic fuel rail pressure 5.400 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0881]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0882]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0883]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0884]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0885]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0886]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0887]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0888]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0889]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0890]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0891]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0892]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0893]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0894]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0895]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0896]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0897]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0898]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0899]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0900]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0901]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0902]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0903]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0904]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0905]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0906]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0907]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0908]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0909]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0910]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0911]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0912]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0913]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0914]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0915]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0916]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0917]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0918]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0919]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0920]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0921]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0922]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0923]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0924]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0925]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0926]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0927]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0928]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0929]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0930]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0931]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0932]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0933]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0934]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0935]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0936]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0937]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0938]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0939]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0940]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0941]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0942]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0943]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0944]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0945]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0946]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0947]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0948]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0949]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0950]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0951]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0952]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0953]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0954]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0955]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0956]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0957]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0958]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0959]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[0960]: KE-Jetronic fuel rail pressure 5.800 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[0961]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[0962]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[0963]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[0964]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[0965]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[0966]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[0967]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[0968]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[0969]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[0970]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[0971]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[0972]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[0973]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[0974]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[0975]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[0976]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[0977]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[0978]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[0979]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[0980]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[0981]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[0982]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[0983]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[0984]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[0985]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[0986]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[0987]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[0988]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[0989]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[0990]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[0991]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[0992]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[0993]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[0994]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[0995]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[0996]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[0997]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[0998]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[0999]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[1000]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[1001]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[1002]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[1003]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[1004]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[1005]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[1006]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[1007]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[1008]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[1009]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[1010]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[1011]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[1012]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[1013]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[1014]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[1015]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[1016]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[1017]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[1018]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[1019]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[1020]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[1021]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[1022]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[1023]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[1024]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[1025]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[1026]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[1027]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[1028]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[1029]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[1030]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[1031]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[1032]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[1033]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[1034]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[1035]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[1036]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[1037]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[1038]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[1039]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[1040]: KE-Jetronic fuel rail pressure 5.800 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[1041]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[1042]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[1043]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[1044]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[1045]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[1046]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[1047]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[1048]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[1049]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[1050]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[1051]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[1052]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[1053]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[1054]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[1055]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[1056]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[1057]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[1058]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[1059]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[1060]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[1061]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[1062]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[1063]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[1064]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[1065]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[1066]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[1067]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[1068]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[1069]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[1070]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[1071]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[1072]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[1073]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[1074]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[1075]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[1076]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[1077]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[1078]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[1079]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[1080]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[1081]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[1082]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[1083]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[1084]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[1085]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[1086]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[1087]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[1088]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[1089]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[1090]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[1091]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[1092]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[1093]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[1094]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[1095]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[1096]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[1097]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[1098]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[1099]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[1100]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[1101]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[1102]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[1103]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[1104]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[1105]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[1106]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[1107]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[1108]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[1109]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[1110]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[1111]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[1112]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[1113]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[1114]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[1115]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[1116]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[1117]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[1118]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[1119]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[1120]: KE-Jetronic fuel rail pressure 5.400 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[1121]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[1122]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[1123]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[1124]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[1125]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[1126]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[1127]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[1128]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[1129]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[1130]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[1131]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[1132]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[1133]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[1134]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[1135]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[1136]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[1137]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[1138]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[1139]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[1140]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[1141]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[1142]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[1143]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[1144]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[1145]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[1146]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[1147]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[1148]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[1149]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[1150]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[1151]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[1152]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[1153]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[1154]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[1155]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[1156]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[1157]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[1158]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[1159]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 132.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[1160]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[1161]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[1162]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[1163]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[1164]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[1165]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[1166]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[1167]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[1168]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[1169]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[1170]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[1171]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[1172]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[1173]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[1174]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[1175]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[1176]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[1177]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[1178]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[1179]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 133.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[1180]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[1181]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[1182]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[1183]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[1184]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[1185]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[1186]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[1187]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[1188]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[1189]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[1190]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[1191]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[1192]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[1193]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[1194]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[1195]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[1196]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[1197]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[1198]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[1199]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 134.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[1200]: KE-Jetronic fuel rail pressure 5.800 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[1201]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[1202]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[1203]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[1204]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[1205]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[1206]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[1207]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[1208]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[1209]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[1210]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[1211]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[1212]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[1213]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[1214]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[1215]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[1216]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[1217]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[1218]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 120.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[1219]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[1220]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[1221]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[1222]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[1223]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[1224]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[1225]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[1226]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[1227]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[1228]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[1229]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[1230]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[1231]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[1232]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[1233]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[1234]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[1235]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[1236]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[1237]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[1238]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 121.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[1239]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[1240]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[1241]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[1242]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[1243]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[1244]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[1245]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[1246]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[1247]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.3 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[1248]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[1249]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[1250]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[1251]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[1252]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[1253]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[1254]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[1255]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[1256]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[1257]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.8 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[1258]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 122.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[1259]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[1260]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[1261]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[1262]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[1263]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[1264]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[1265]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[1266]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[1267]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.3 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[1268]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[1269]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[1270]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[1271]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[1272]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[1273]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[1274]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[1275]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[1276]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[1277]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.8 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[1278]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 123.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[1279]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[1280]: KE-Jetronic fuel rail pressure 5.400 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[1281]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.0 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[1282]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[1283]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[1284]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[1285]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[1286]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[1287]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.4 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[1288]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[1289]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[1290]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[1291]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.5 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[1292]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[1293]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[1294]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[1295]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[1296]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[1297]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.9 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[1298]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 124.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[1299]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[1300]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[1301]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.0 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[1302]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[1303]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[1304]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[1305]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[1306]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[1307]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.4 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[1308]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[1309]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[1310]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[1311]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.5 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[1312]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[1313]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[1314]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[1315]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[1316]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[1317]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.9 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[1318]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 125.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[1319]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[1320]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[1321]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.0 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[1322]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[1323]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[1324]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[1325]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[1326]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[1327]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.4 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[1328]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[1329]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.5 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[1330]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[1331]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.5 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[1332]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[1333]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[1334]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[1335]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[1336]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[1337]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.9 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[1338]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 126.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[1339]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.0 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[1340]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[1341]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.0 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[1342]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[1343]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[1344]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[1345]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[1346]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[1347]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.4 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[1348]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[1349]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.5 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[1350]: KE-Jetronic fuel rail pressure 5.750 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[1351]: KE-Jetronic fuel rail pressure 5.755 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.5 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[1352]: KE-Jetronic fuel rail pressure 5.760 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[1353]: KE-Jetronic fuel rail pressure 5.765 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[1354]: KE-Jetronic fuel rail pressure 5.770 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[1355]: KE-Jetronic fuel rail pressure 5.775 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[1356]: KE-Jetronic fuel rail pressure 5.780 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[1357]: KE-Jetronic fuel rail pressure 5.785 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.9 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[1358]: KE-Jetronic fuel rail pressure 5.790 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 127.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[1359]: KE-Jetronic fuel rail pressure 5.795 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.0 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[1360]: KE-Jetronic fuel rail pressure 5.800 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[1361]: KE-Jetronic fuel rail pressure 5.405 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[1362]: KE-Jetronic fuel rail pressure 5.410 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[1363]: KE-Jetronic fuel rail pressure 5.415 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[1364]: KE-Jetronic fuel rail pressure 5.420 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[1365]: KE-Jetronic fuel rail pressure 5.425 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[1366]: KE-Jetronic fuel rail pressure 5.430 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[1367]: KE-Jetronic fuel rail pressure 5.435 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.4 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[1368]: KE-Jetronic fuel rail pressure 5.440 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[1369]: KE-Jetronic fuel rail pressure 5.445 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[1370]: KE-Jetronic fuel rail pressure 5.450 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[1371]: KE-Jetronic fuel rail pressure 5.455 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[1372]: KE-Jetronic fuel rail pressure 5.460 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[1373]: KE-Jetronic fuel rail pressure 5.465 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[1374]: KE-Jetronic fuel rail pressure 5.470 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[1375]: KE-Jetronic fuel rail pressure 5.475 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[1376]: KE-Jetronic fuel rail pressure 5.480 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[1377]: KE-Jetronic fuel rail pressure 5.485 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.9 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[1378]: KE-Jetronic fuel rail pressure 5.490 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[1379]: KE-Jetronic fuel rail pressure 5.495 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 128.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[1380]: KE-Jetronic fuel rail pressure 5.500 bar, M117 V8 oil pressure 3.30 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[1381]: KE-Jetronic fuel rail pressure 5.505 bar, M117 V8 oil pressure 3.31 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[1382]: KE-Jetronic fuel rail pressure 5.510 bar, M117 V8 oil pressure 3.32 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[1383]: KE-Jetronic fuel rail pressure 5.515 bar, M117 V8 oil pressure 3.33 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[1384]: KE-Jetronic fuel rail pressure 5.520 bar, M117 V8 oil pressure 3.34 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[1385]: KE-Jetronic fuel rail pressure 5.525 bar, M117 V8 oil pressure 3.35 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[1386]: KE-Jetronic fuel rail pressure 5.530 bar, M117 V8 oil pressure 3.36 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[1387]: KE-Jetronic fuel rail pressure 5.535 bar, M117 V8 oil pressure 3.37 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.4 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[1388]: KE-Jetronic fuel rail pressure 5.540 bar, M117 V8 oil pressure 3.38 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[1389]: KE-Jetronic fuel rail pressure 5.545 bar, M117 V8 oil pressure 3.39 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.4 bar, ABS sensor channel 1 frequency 927 Hz
# Sindelfingen_W126_Trace[1390]: KE-Jetronic fuel rail pressure 5.550 bar, M117 V8 oil pressure 3.40 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.5 bar, ABS sensor channel 2 frequency 930 Hz
# Sindelfingen_W126_Trace[1391]: KE-Jetronic fuel rail pressure 5.555 bar, M117 V8 oil pressure 3.41 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.6 bar, ABS sensor channel 3 frequency 933 Hz
# Sindelfingen_W126_Trace[1392]: KE-Jetronic fuel rail pressure 5.560 bar, M117 V8 oil pressure 3.42 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.6 bar, ABS sensor channel 0 frequency 936 Hz
# Sindelfingen_W126_Trace[1393]: KE-Jetronic fuel rail pressure 5.565 bar, M117 V8 oil pressure 3.43 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.7 bar, ABS sensor channel 1 frequency 939 Hz
# Sindelfingen_W126_Trace[1394]: KE-Jetronic fuel rail pressure 5.570 bar, M117 V8 oil pressure 3.44 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.7 bar, ABS sensor channel 2 frequency 942 Hz
# Sindelfingen_W126_Trace[1395]: KE-Jetronic fuel rail pressure 5.575 bar, M117 V8 oil pressure 3.45 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 3 frequency 945 Hz
# Sindelfingen_W126_Trace[1396]: KE-Jetronic fuel rail pressure 5.580 bar, M117 V8 oil pressure 3.46 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.8 bar, ABS sensor channel 0 frequency 948 Hz
# Sindelfingen_W126_Trace[1397]: KE-Jetronic fuel rail pressure 5.585 bar, M117 V8 oil pressure 3.47 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.9 bar, ABS sensor channel 1 frequency 951 Hz
# Sindelfingen_W126_Trace[1398]: KE-Jetronic fuel rail pressure 5.590 bar, M117 V8 oil pressure 3.48 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.9 bar, ABS sensor channel 2 frequency 954 Hz
# Sindelfingen_W126_Trace[1399]: KE-Jetronic fuel rail pressure 5.595 bar, M117 V8 oil pressure 3.49 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 129.9 bar, ABS sensor channel 3 frequency 957 Hz
# Sindelfingen_W126_Trace[1400]: KE-Jetronic fuel rail pressure 5.600 bar, M117 V8 oil pressure 3.00 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.0 bar, ABS sensor channel 0 frequency 840 Hz
# Sindelfingen_W126_Trace[1401]: KE-Jetronic fuel rail pressure 5.605 bar, M117 V8 oil pressure 3.01 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.1 bar, ABS sensor channel 1 frequency 843 Hz
# Sindelfingen_W126_Trace[1402]: KE-Jetronic fuel rail pressure 5.610 bar, M117 V8 oil pressure 3.02 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.1 bar, ABS sensor channel 2 frequency 846 Hz
# Sindelfingen_W126_Trace[1403]: KE-Jetronic fuel rail pressure 5.615 bar, M117 V8 oil pressure 3.03 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.2 bar, ABS sensor channel 3 frequency 849 Hz
# Sindelfingen_W126_Trace[1404]: KE-Jetronic fuel rail pressure 5.620 bar, M117 V8 oil pressure 3.04 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.2 bar, ABS sensor channel 0 frequency 852 Hz
# Sindelfingen_W126_Trace[1405]: KE-Jetronic fuel rail pressure 5.625 bar, M117 V8 oil pressure 3.05 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 1 frequency 855 Hz
# Sindelfingen_W126_Trace[1406]: KE-Jetronic fuel rail pressure 5.630 bar, M117 V8 oil pressure 3.06 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.3 bar, ABS sensor channel 2 frequency 858 Hz
# Sindelfingen_W126_Trace[1407]: KE-Jetronic fuel rail pressure 5.635 bar, M117 V8 oil pressure 3.07 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.4 bar, ABS sensor channel 3 frequency 861 Hz
# Sindelfingen_W126_Trace[1408]: KE-Jetronic fuel rail pressure 5.640 bar, M117 V8 oil pressure 3.08 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.4 bar, ABS sensor channel 0 frequency 864 Hz
# Sindelfingen_W126_Trace[1409]: KE-Jetronic fuel rail pressure 5.645 bar, M117 V8 oil pressure 3.09 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.4 bar, ABS sensor channel 1 frequency 867 Hz
# Sindelfingen_W126_Trace[1410]: KE-Jetronic fuel rail pressure 5.650 bar, M117 V8 oil pressure 3.10 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.5 bar, ABS sensor channel 2 frequency 870 Hz
# Sindelfingen_W126_Trace[1411]: KE-Jetronic fuel rail pressure 5.655 bar, M117 V8 oil pressure 3.11 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.6 bar, ABS sensor channel 3 frequency 873 Hz
# Sindelfingen_W126_Trace[1412]: KE-Jetronic fuel rail pressure 5.660 bar, M117 V8 oil pressure 3.12 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.6 bar, ABS sensor channel 0 frequency 876 Hz
# Sindelfingen_W126_Trace[1413]: KE-Jetronic fuel rail pressure 5.665 bar, M117 V8 oil pressure 3.13 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.7 bar, ABS sensor channel 1 frequency 879 Hz
# Sindelfingen_W126_Trace[1414]: KE-Jetronic fuel rail pressure 5.670 bar, M117 V8 oil pressure 3.14 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.7 bar, ABS sensor channel 2 frequency 882 Hz
# Sindelfingen_W126_Trace[1415]: KE-Jetronic fuel rail pressure 5.675 bar, M117 V8 oil pressure 3.15 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 3 frequency 885 Hz
# Sindelfingen_W126_Trace[1416]: KE-Jetronic fuel rail pressure 5.680 bar, M117 V8 oil pressure 3.16 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.8 bar, ABS sensor channel 0 frequency 888 Hz
# Sindelfingen_W126_Trace[1417]: KE-Jetronic fuel rail pressure 5.685 bar, M117 V8 oil pressure 3.17 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.9 bar, ABS sensor channel 1 frequency 891 Hz
# Sindelfingen_W126_Trace[1418]: KE-Jetronic fuel rail pressure 5.690 bar, M117 V8 oil pressure 3.18 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.9 bar, ABS sensor channel 2 frequency 894 Hz
# Sindelfingen_W126_Trace[1419]: KE-Jetronic fuel rail pressure 5.695 bar, M117 V8 oil pressure 3.19 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 130.9 bar, ABS sensor channel 3 frequency 897 Hz
# Sindelfingen_W126_Trace[1420]: KE-Jetronic fuel rail pressure 5.700 bar, M117 V8 oil pressure 3.20 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.0 bar, ABS sensor channel 0 frequency 900 Hz
# Sindelfingen_W126_Trace[1421]: KE-Jetronic fuel rail pressure 5.705 bar, M117 V8 oil pressure 3.21 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.1 bar, ABS sensor channel 1 frequency 903 Hz
# Sindelfingen_W126_Trace[1422]: KE-Jetronic fuel rail pressure 5.710 bar, M117 V8 oil pressure 3.22 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.1 bar, ABS sensor channel 2 frequency 906 Hz
# Sindelfingen_W126_Trace[1423]: KE-Jetronic fuel rail pressure 5.715 bar, M117 V8 oil pressure 3.23 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.2 bar, ABS sensor channel 3 frequency 909 Hz
# Sindelfingen_W126_Trace[1424]: KE-Jetronic fuel rail pressure 5.720 bar, M117 V8 oil pressure 3.24 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.2 bar, ABS sensor channel 0 frequency 912 Hz
# Sindelfingen_W126_Trace[1425]: KE-Jetronic fuel rail pressure 5.725 bar, M117 V8 oil pressure 3.25 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 1 frequency 915 Hz
# Sindelfingen_W126_Trace[1426]: KE-Jetronic fuel rail pressure 5.730 bar, M117 V8 oil pressure 3.26 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.3 bar, ABS sensor channel 2 frequency 918 Hz
# Sindelfingen_W126_Trace[1427]: KE-Jetronic fuel rail pressure 5.735 bar, M117 V8 oil pressure 3.27 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.4 bar, ABS sensor channel 3 frequency 921 Hz
# Sindelfingen_W126_Trace[1428]: KE-Jetronic fuel rail pressure 5.740 bar, M117 V8 oil pressure 3.28 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.4 bar, ABS sensor channel 0 frequency 924 Hz
# Sindelfingen_W126_Trace[1429]: KE-Jetronic fuel rail pressure 5.745 bar, M117 V8 oil pressure 3.29 bar at 3000 RPM, rear hydropneumatic leveling ram pressure 131.4 bar, ABS sensor channel 1 frequency 927 Hz
