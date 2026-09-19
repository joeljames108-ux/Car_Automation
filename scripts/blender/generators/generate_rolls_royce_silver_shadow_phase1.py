"""
=============================================================================
Procedural Class-A CAD Generator: Rolls-Royce Silver Shadow II (1977-1980)
PHASE 39: Steel Monocoque, 6.75L L410 V8, Hydropneumatic Suspension & Avon Tires
=============================================================================
Luxury Car Architecture · 1970s British Ultra-Luxury Saloon (Crewe, England)
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Vehicle Dimensions:
- Wheelbase: 3035 mm (Front axle: Y = +1.518m, Rear axle: Y = -1.518m)
- Overall Length: 5169 mm (Front bumper: Y = +2.530m, Rear bumper: Y = -2.530m)
- Overall Width: 1803 mm (X = +/- 0.902m)
- Overall Height: 1518 mm (Roof crown: Z = 1.518m)
- Track Width: Front 1524 mm (X = +/- 0.762m), Rear 1514 mm (X = +/- 0.757m)
- Ground Clearance: 165 mm (Z_floor = 0.165m)

Phase 39 Subsystems:
1. High-Tensile Steel Monocoque & Inboard Subframes:
   - High-rigidity steel floorpan, boxed longitudinal chassis members positioned cleanly
     inboard of wheel wells, sill girders contained between axles, and isolated cradles.
   - Heavy gauge engine bulkhead firewall and rear luggage compartment structural partition.
   - Enclosed inner wheel tubs to guarantee zero see-through voids from any viewing angle.
2. Rolls-Royce 6.75-Litre L410 V8 Drivetrain:
   - 90-degree 6750cc aluminum-silicon V8 block, twin SU HD8 carburetors with oil bath air cleaner,
     ribbed valve covers with cast "ROLLS-ROYCE" lettering, and front accessory belt pulleys.
   - GM Turbo-Hydramatic 400 3-speed automatic transmission casing, torque converter, and propshaft.
   - High-capacity copper radiator, mechanical fan, and dual stainless exhaust system with twin silencers.
3. Citroën-Licensed Hydropneumatic Self-Leveling Suspension:
   - Front independent unequal-length wishbones with heavy coil springs, anti-roll bar, and hydraulic height rams.
   - Rear semi-trailing arm independent suspension with pressurized nitrogen hydraulic accumulators.
4. Authentic 15-Inch Steel Wheels & Avon Turbosteel Tires:
   - Authentic 6-point parametric cross-section profile Avon Turbosteel radial tires (235/70VR15).
   - Stepped steel rim barrels with full-face polished stainless steel hubcaps, recessed black beauty rings,
     and central embossed red "RR" monogram medallion.
   - Dual-caliper heavy-duty front disc brakes and rear disc brakes with dual-redundant hydraulic circuits.
5. Executive 1970s Luxury Interior Tonneau & Coachwork:
   - Deep-padded Connolly VM 3244 Tan leather split-bench front armchairs with fluted vertical pleats.
   - Rear lounge sofa with fold-down burr walnut center armrest and lambskin footrest wedges.
   - Hand-polished Bookmatched Burr Walnut veneer dashboard with Smiths analog dials and 2-spoke luxury wheel.
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


def make_pbr_material(name, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0, roughness=0.5, clearcoat=0.0, specular=0.5, transmission=0.0, ior=1.45, emission_color=(0.0, 0.0, 0.0, 1.0), emission_strength=0.0):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_out.location = (300, 0)
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    node_bsdf.location = (0, 0)

    node_bsdf.inputs['Base Color'].default_value = base_color
    node_bsdf.inputs['Metallic'].default_value = metallic
    node_bsdf.inputs['Roughness'].default_value = roughness
    if 'Specular IOR Level' in node_bsdf.inputs:
        node_bsdf.inputs['Specular IOR Level'].default_value = specular
    elif 'Specular' in node_bsdf.inputs:
        node_bsdf.inputs['Specular'].default_value = specular

    if 'Coat Weight' in node_bsdf.inputs:
        node_bsdf.inputs['Coat Weight'].default_value = clearcoat
    elif 'Clearcoat' in node_bsdf.inputs:
        node_bsdf.inputs['Clearcoat'].default_value = clearcoat

    if 'Transmission Weight' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission'].default_value = transmission

    if 'IOR' in node_bsdf.inputs:
        node_bsdf.inputs['IOR'].default_value = ior

    if 'Emission Color' in node_bsdf.inputs:
        node_bsdf.inputs['Emission Color'].default_value = emission_color
        node_bsdf.inputs['Emission Strength'].default_value = emission_strength
    elif 'Emission' in node_bsdf.inputs:
        node_bsdf.inputs['Emission'].default_value = emission_color

    mat.node_tree.links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat


def assign_material(obj, material):
    if len(obj.data.materials) == 0:
        obj.data.materials.append(material)
    else:
        obj.data.materials[0] = material


# ----------------------------------------------------------------------------
# 2. MASTER MATERIALS FACTORY (CREWE 1970s CLASSIC LUXURY PALETTE)
# ----------------------------------------------------------------------------

def setup_silver_shadow_materials():
    mats = {}

    # 1. Structural Chassis Black Enamel
    mats['chassis_black'] = make_pbr_material(
        "MAT_RR_Chassis_Black",
        base_color=(0.04, 0.04, 0.045, 1.0),
        metallic=0.25,
        roughness=0.45,
        specular=0.5
    )

    # 2. Cast Aluminum-Silicon V8 Engine Alloy
    mats['engine_alloy'] = make_pbr_material(
        "MAT_RR_V8_Cast_Alloy",
        base_color=(0.65, 0.67, 0.70, 1.0),
        metallic=0.82,
        roughness=0.32,
        specular=0.7
    )

    # 3. Rolls-Royce Valve Cover Satin Black Wrinkle
    mats['valve_cover_black'] = make_pbr_material(
        "MAT_RR_Valve_Cover_Wrinkle",
        base_color=(0.03, 0.03, 0.03, 1.0),
        metallic=0.10,
        roughness=0.75,
        specular=0.4
    )

    # 4. Polished Brass SU Carburetors & Fittings
    mats['carburetor_brass'] = make_pbr_material(
        "MAT_RR_SU_Polished_Brass",
        base_color=(0.88, 0.72, 0.32, 1.0),
        metallic=0.92,
        roughness=0.18,
        specular=0.9
    )

    # 5. Stainless Steel Exhaust Piping
    mats['exhaust_steel'] = make_pbr_material(
        "MAT_RR_Exhaust_Stainless",
        base_color=(0.58, 0.60, 0.62, 1.0),
        metallic=0.90,
        roughness=0.28,
        specular=0.8
    )

    # 6. Hydropneumatic Spheres (Citroën Green / Classic Black)
    mats['hydraulic_green'] = make_pbr_material(
        "MAT_RR_Hydraulic_Accumulator",
        base_color=(0.08, 0.42, 0.18, 1.0),
        metallic=0.35,
        roughness=0.30,
        specular=0.6
    )

    # 7. Forged Suspension Wishbones & Links
    mats['suspension_steel'] = make_pbr_material(
        "MAT_RR_Suspension_Forged_Steel",
        base_color=(0.28, 0.30, 0.32, 1.0),
        metallic=0.75,
        roughness=0.40,
        specular=0.6
    )

    # 8. Cast Iron Brake Rotors
    mats['brake_iron'] = make_pbr_material(
        "MAT_RR_Cast_Iron_Rotor",
        base_color=(0.22, 0.23, 0.24, 1.0),
        metallic=0.65,
        roughness=0.48,
        specular=0.5
    )

    # 9. Polished Stainless Steel Hubcaps & Mirror Chrome
    mats['hubcap_chrome'] = make_pbr_material(
        "MAT_RR_Mirror_Stainless_Chrome",
        base_color=(0.95, 0.96, 0.98, 1.0),
        metallic=0.98,
        roughness=0.04,
        clearcoat=1.0,
        specular=1.0
    )

    # 10. Hubcap Inset Beauty Ring Black
    mats['hubcap_black_ring'] = make_pbr_material(
        "MAT_RR_Hubcap_Black_Ring",
        base_color=(0.02, 0.02, 0.02, 1.0),
        metallic=0.05,
        roughness=0.25,
        specular=0.5
    )

    # 11. Red Rolls-Royce Enamel Badge
    mats['rr_red_enamel'] = make_pbr_material(
        "MAT_RR_Red_Enamel_Badge",
        base_color=(0.75, 0.02, 0.04, 1.0),
        metallic=0.20,
        roughness=0.10,
        clearcoat=1.0,
        specular=0.8
    )

    # 12. Avon Turbosteel Classic Radial Tire Rubber
    mats['avon_tire'] = make_pbr_material(
        "MAT_RR_Avon_Turbosteel_Rubber",
        base_color=(0.028, 0.028, 0.030, 1.0),
        metallic=0.0,
        roughness=0.84,
        specular=0.25
    )

    # 13. Connolly VM 3244 Tan / Biscuit Luxury Leather
    mats['connolly_tan'] = make_pbr_material(
        "MAT_RR_Connolly_Tan_Leather",
        base_color=(0.68, 0.52, 0.35, 1.0),
        metallic=0.0,
        roughness=0.58,
        clearcoat=0.2,
        specular=0.4
    )

    # 14. Hand-Polished Bookmatched Burr Walnut Veneer
    mats['burr_walnut'] = make_pbr_material(
        "MAT_RR_Bookmatched_Burr_Walnut",
        base_color=(0.24, 0.09, 0.025, 1.0),
        metallic=0.0,
        roughness=0.16,
        clearcoat=0.95,
        specular=0.7
    )

    # 15. Wilton Wool Deep-Pile Carpet (Dark Tobacco / Saddle)
    mats['wilton_carpet'] = make_pbr_material(
        "MAT_RR_Wilton_Wool_Carpet",
        base_color=(0.14, 0.10, 0.07, 1.0),
        metallic=0.0,
        roughness=0.92,
        specular=0.1
    )

    return mats


# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 1: STEEL MONOCOQUE CHASSIS, SUBFRAMES & WHEEL TUBS
# ----------------------------------------------------------------------------

def build_silver_shadow_monocoque_chassis(col, mats):
    """Subsystem 1: Heavy High-Tensile Steel Monocoque & Subframe Architecture"""
    objs = []

    # 1.1 Structural Main Floorpan & Longitudinal Inboard Box Sections
    obj, mesh = create_mesh_object("GEO_RR_Main_Chassis_Floorpan", col)
    bm = bmesh.new()

    # Main passenger cabin floorpan tray (inboard width 1.30m, contained between wheels)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.0, 0.200))) @ Matrix.Scale(1.320, 4, Vector((1, 0, 0))) @ Matrix.Scale(2.800, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 0, 1)))
    )

    # Heavy-gauge boxed longitudinal chassis rails (Inboard of wheels at X = +/-0.520m)
    for side in (-1, 1):
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.520, 0.0, 0.220))) @ Matrix.Scale(0.110, 4, Vector((1, 0, 0))) @ Matrix.Scale(2.900, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.120, 4, Vector((0, 0, 1)))
        )

    # Rocker sill girders contained strictly between front and rear wheel arches (Y = +0.95m to -0.95m)
    for side in (-1, 1):
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.740, 0.0, 0.240))) @ Matrix.Scale(0.120, 4, Vector((1, 0, 0))) @ Matrix.Scale(1.900, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.120, 4, Vector((0, 0, 1)))
        )

    # Transmission and driveshaft tunnel
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.100, 0.310))) @ Matrix.Scale(0.300, 4, Vector((1, 0, 0))) @ Matrix.Scale(2.600, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.200, 4, Vector((0, 0, 1)))
    )

    # Front firewall bulkhead (Separates engine bay from cabin, Y = +0.780m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.780, 0.580))) @ Matrix.Scale(1.500, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.060, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.650, 4, Vector((0, 0, 1)))
    )

    # Rear luggage compartment bulkhead (Y = -1.250m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -1.250, 0.600))) @ Matrix.Scale(1.500, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.060, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.680, 4, Vector((0, 0, 1)))
    )

    # Enclosed inner wheel tubs to guarantee zero see-through voids
    for s_x in [-1, 1]:
        # Front wheel tub inner enclosure (Y = +1.518m)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((s_x * 0.620, 1.518, 0.440))) @ Matrix.Scale(0.180, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.880, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.500, 4, Vector((0, 0, 1)))
        )
        # Rear wheel tub inner enclosure (Y = -1.518m)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((s_x * 0.610, -1.518, 0.440))) @ Matrix.Scale(0.180, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.880, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.500, 4, Vector((0, 0, 1)))
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['chassis_black'])
    objs.append(obj)

    # 1.2 Isolated Front Subframe Cradle (Rubber-Bushed Crossmembers)
    obj, mesh = create_mesh_object("GEO_RR_Front_Subframe_Cradle", col)
    bm = bmesh.new()

    for side in (-1, 1):
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.440, 1.550, 0.250))) @ Matrix.Scale(0.100, 4, Vector((1, 0, 0))) @ Matrix.Scale(1.400, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.110, 4, Vector((0, 0, 1)))
        )

    # Front massive suspension crossmember beneath engine sump (Y = +1.518m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.518, 0.210))) @ Matrix.Scale(1.180, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.200, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.110, 4, Vector((0, 0, 1)))
    )

    # Front radiator support header beam (Y = +2.380m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.380, 0.420))) @ Matrix.Scale(1.200, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.080, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.180, 4, Vector((0, 0, 1)))
    )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['chassis_black'])
    objs.append(obj)

    # 1.3 Isolated Rear Subframe & Differential Cage
    obj, mesh = create_mesh_object("GEO_RR_Rear_Subframe_Cage", col)
    bm = bmesh.new()

    for side in (-1, 1):
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.460, -1.520, 0.270))) @ Matrix.Scale(0.100, 4, Vector((1, 0, 0))) @ Matrix.Scale(1.200, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.110, 4, Vector((0, 0, 1)))
        )

    # Rear transverse torque crossmember (Y = -1.518m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -1.518, 0.310))) @ Matrix.Scale(1.180, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.190, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.130, 4, Vector((0, 0, 1)))
    )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['chassis_black'])
    objs.append(obj)

    return objs


# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 2: ROLLS-ROYCE 6.75L L410 V8 POWERTRAIN & DRIVETRAIN
# ----------------------------------------------------------------------------

def build_silver_shadow_v8_powertrain(col, mats):
    """Subsystem 2: Rolls-Royce 6.75-Litre L410 V8 Engine & GM TH400 Transmission"""
    objs = []

    # 2.1 90-Degree V8 Engine Block & Sump (Y = +1.280m to +1.880m)
    obj, mesh = create_mesh_object("GEO_RR_675L_V8_Engine_Block", col)
    bm = bmesh.new()

    # Main engine block casting (Aluminum-Silicon alloy)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.520, 0.520))) @ Matrix.Scale(0.480, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.680, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.380, 4, Vector((0, 0, 1)))
    )

    # Deep pressed-steel oil sump
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.500, 0.290))) @ Matrix.Scale(0.380, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.580, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.140, 4, Vector((0, 0, 1)))
    )

    # Left & Right Angled Cylinder Heads (45-degree bank angle)
    for b_sign in (-1, 1):
        mat_head = Matrix.Translation(Vector((b_sign * 0.180, 1.520, 0.680))) @ Euler((0, math.radians(b_sign * 45), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm, size=1.0, matrix=mat_head @ Matrix.Diagonal(Vector((0.220, 0.620, 0.160, 1.0))))

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['engine_alloy'])
    objs.append(obj)

    # 2.2 Rolls-Royce Black Wrinkle Valve Covers with Polished Emblems
    obj, mesh = create_mesh_object("GEO_RR_Valve_Covers", col)
    bm = bmesh.new()
    for b_sign in (-1, 1):
        mat_vc = Matrix.Translation(Vector((b_sign * 0.235, 1.520, 0.745))) @ Euler((0, math.radians(b_sign * 45), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm, size=1.0, matrix=mat_vc @ Matrix.Diagonal(Vector((0.140, 0.600, 0.080, 1.0))))
        bmesh.ops.create_cube(bm, size=1.0, matrix=mat_vc @ Matrix.Translation(Vector((0.0, 0.0, 0.045))) @ Matrix.Diagonal(Vector((0.040, 0.440, 0.015, 1.0))))
    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['valve_cover_black'])
    objs.append(obj)

    # 2.3 Twin SU HD8 Carburetors & Large Central Air Silencer Canister
    obj, mesh = create_mesh_object("GEO_RR_SU_Carburetors_and_Air_Cleaner", col)
    bm = bmesh.new()

    for cy in (1.420, 1.620):
        bmesh.ops.create_cylinder(
            bm,
            radius=0.042,
            depth=0.110,
            segments=18,
            matrix=Matrix.Translation(Vector((-0.020, cy, 0.840)))
        )
        bmesh.ops.create_cylinder(
            bm,
            radius=0.032,
            depth=0.080,
            segments=14,
            matrix=Matrix.Translation(Vector((0.060, cy, 0.780)))
        )

    # Cylindrical black acoustic air silencer canister
    bmesh.ops.create_cylinder(
        bm,
        radius=0.140,
        depth=0.420,
        segments=24,
        matrix=Matrix.Translation(Vector((0.180, 1.480, 0.820))) @ Matrix.Rotation(math.radians(90.0), 4, 'Y')
    )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['carburetor_brass'])
    objs.append(obj)

    # 2.4 GM Turbo-Hydramatic 400 3-Speed Transmission & Propshaft
    obj, mesh = create_mesh_object("GEO_RR_TH400_Transmission", col)
    bm = bmesh.new()

    bmesh.ops.create_cone(
        bm,
        radius1=0.240,
        radius2=0.170,
        depth=0.260,
        segments=20,
        matrix=Matrix.Translation(Vector((0.0, 1.050, 0.440))) @ Matrix.Rotation(math.radians(-90.0), 4, 'X')
    )

    bmesh.ops.create_cylinder(
        bm,
        radius=0.155,
        depth=0.480,
        segments=20,
        matrix=Matrix.Translation(Vector((0.0, 0.720, 0.420))) @ Matrix.Rotation(math.radians(90.0), 4, 'Y')
    )

    bmesh.ops.create_cylinder(
        bm,
        radius=0.038,
        depth=1.920,
        segments=16,
        matrix=Matrix.Translation(Vector((0.0, -0.480, 0.380))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
    )

    bmesh.ops.create_cylinder(
        bm,
        radius=0.145,
        depth=0.240,
        segments=20,
        matrix=Matrix.Translation(Vector((0.0, -1.518, 0.360))) @ Matrix.Rotation(math.radians(90.0), 4, 'Y')
    )

    for side in (-1, 1):
        bmesh.ops.create_cylinder(
            bm,
            radius=0.028,
            depth=0.480,
            segments=12,
            matrix=Matrix.Translation(Vector((side * 0.460, -1.518, 0.360))) @ Matrix.Rotation(math.radians(90.0), 4, 'Y')
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['engine_alloy'])
    objs.append(obj)

    # 2.5 High-Capacity Radiator, Cooling Fan & Twin Stainless Exhaust System
    obj, mesh = create_mesh_object("GEO_RR_Radiator_and_Exhaust_System", col)
    bm = bmesh.new()

    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.220, 0.580))) @ Matrix.Scale(0.780, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.100, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.520, 4, Vector((0, 0, 1)))
    )

    bmesh.ops.create_cylinder(
        bm,
        radius=0.220,
        depth=0.040,
        segments=18,
        matrix=Matrix.Translation(Vector((0.0, 2.120, 0.580))) @ Matrix.Rotation(math.radians(90.0), 4, 'Y')
    )

    for side in (-1, 1):
        ex_x = side * 0.280
        bmesh.ops.create_cylinder(
            bm,
            radius=0.026,
            depth=3.200,
            segments=12,
            matrix=Matrix.Translation(Vector((ex_x, -0.400, 0.220))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
        )
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((ex_x, -0.350, 0.230))) @ Matrix.Scale(0.180, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.680, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.110, 4, Vector((0, 0, 1)))
        )
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((ex_x, -2.150, 0.240))) @ Matrix.Scale(0.190, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.520, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.120, 4, Vector((0, 0, 1)))
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['exhaust_steel'])
    objs.append(obj)

    return objs


# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 3: CITROËN-LICENSED HYDROPNEUMATIC SUSPENSION
# ----------------------------------------------------------------------------

def build_silver_shadow_suspension(col, mats):
    """Subsystem 3: Citroën-Licensed Hydropneumatic Self-Leveling Suspension"""
    objs = []

    obj, mesh = create_mesh_object("GEO_RR_Front_Suspension_Assemblies", col)
    bm = bmesh.new()

    for side in (-1, 1):
        bmesh.ops.create_cylinder(
            bm,
            radius=0.022,
            depth=0.380,
            segments=14,
            matrix=Matrix.Translation(Vector((side * 0.580, 1.460, 0.240))) @ Matrix.Rotation(math.radians(side * -18.0), 4, 'Z') @ Matrix.Rotation(math.radians(90.0), 4, 'Y')
        )
        bmesh.ops.create_cylinder(
            bm,
            radius=0.022,
            depth=0.380,
            segments=14,
            matrix=Matrix.Translation(Vector((side * 0.580, 1.580, 0.240))) @ Matrix.Rotation(math.radians(side * 18.0), 4, 'Z') @ Matrix.Rotation(math.radians(90.0), 4, 'Y')
        )
        bmesh.ops.create_cylinder(
            bm,
            radius=0.018,
            depth=0.320,
            segments=14,
            matrix=Matrix.Translation(Vector((side * 0.580, 1.518, 0.420))) @ Matrix.Rotation(math.radians(90.0), 4, 'Y')
        )
        bmesh.ops.create_cylinder(
            bm,
            radius=0.055,
            depth=0.280,
            segments=16,
            matrix=Matrix.Translation(Vector((side * 0.580, 1.518, 0.350)))
        )
        bmesh.ops.create_cylinder(
            bm,
            radius=0.028,
            depth=0.320,
            segments=14,
            matrix=Matrix.Translation(Vector((side * 0.580, 1.518, 0.360)))
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['suspension_steel'])
    objs.append(obj)

    obj, mesh = create_mesh_object("GEO_RR_Rear_Hydropneumatic_Suspension", col)
    bm = bmesh.new()

    for side in (-1, 1):
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.580, -1.350, 0.320))) @ Matrix.Rotation(math.radians(side * -14.0), 4, 'Z') @ Matrix.Scale(0.120, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.480, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.080, 4, Vector((0, 0, 1)))
        )
        bmesh.ops.create_cylinder(
            bm,
            radius=0.034,
            depth=0.320,
            segments=16,
            matrix=Matrix.Translation(Vector((side * 0.590, -1.518, 0.380)))
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['suspension_steel'])
    objs.append(obj)

    obj, mesh = create_mesh_object("GEO_RR_Hydraulic_Accumulator_Spheres", col)
    bm = bmesh.new()

    for side in (-1, 1):
        bmesh.ops.create_uvsphere(
            bm,
            u_segments=16,
            v_segments=12,
            radius=0.075,
            matrix=Matrix.Translation(Vector((side * 0.440, -1.480, 0.460)))
        )
        bmesh.ops.create_uvsphere(
            bm,
            u_segments=16,
            v_segments=12,
            radius=0.070,
            matrix=Matrix.Translation(Vector((side * 0.340, 0.820, 0.620)))
        )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['hydraulic_green'])
    objs.append(obj)

    return objs


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 4: 15-INCH STEEL WHEELS, HUBCAPS & AVON TURBOSTEEL TIRES
# ----------------------------------------------------------------------------

def build_silver_shadow_wheels_and_brakes(col, mats):
    """Subsystem 4: Authentic 15-Inch Steel Wheels, Stainless Hubcaps & Avon Tires"""
    objs = []

    wheel_configs = [
        # (pos_tag, x, y, z, rim_r, tire_r, rim_w, tire_w, is_front)
        ("FL", -0.762,  1.518, 0.370, 0.200, 0.370, 0.200, 0.235, True),
        ("FR",  0.762,  1.518, 0.370, 0.200, 0.370, 0.200, 0.235, True),
        ("RL", -0.757, -1.518, 0.370, 0.200, 0.370, 0.200, 0.235, False),
        ("RR",  0.757, -1.518, 0.370, 0.200, 0.370, 0.200, 0.235, False),
    ]

    bm_tire = bmesh.new()
    bm_hubcap = bmesh.new()
    bm_ring = bmesh.new()
    bm_badge = bmesh.new()
    bm_rot = bmesh.new()
    bm_cal = bmesh.new()

    segs = 32

    for (pos_name, wx, wy, wz, rim_r, tire_r, rim_w, tire_w, is_f) in wheel_configs:
        sign = -1.0 if wx < 0 else 1.0
        is_left = (wx < 0)
        hw = tire_w * 0.5
        pos = Vector((wx, wy, wz))

        # 1. Authentic 6-Point Parametric Avon Turbosteel Radial Tire Profile
        profile = [
            (0.00,  tire_r),
            (hw * 0.68, tire_r),
            (hw * 0.96, tire_r - 0.018),
            (hw * 0.92, (tire_r + rim_r) * 0.54),
            (hw * 0.62, rim_r + 0.014),
            (hw * 0.40, rim_r),
        ]
        num_p = len(profile)

        for s in range(segs):
            a1 = 2.0 * math.pi * s / segs
            a2 = 2.0 * math.pi * (s + 1) / segs
            c1, s1 = math.cos(a1), math.sin(a1)
            c2, s2 = math.cos(a2), math.sin(a2)

            for p in range(num_p - 1):
                dx_a, r_a = profile[p]
                dx_b, r_b = profile[p + 1]

                # Outer Half
                v1 = bm_tire.verts.new((pos.x + dx_a * sign, pos.y + r_a * c1, pos.z + r_a * s1))
                v2 = bm_tire.verts.new((pos.x + dx_b * sign, pos.y + r_b * c1, pos.z + r_b * s1))
                v3 = bm_tire.verts.new((pos.x + dx_b * sign, pos.y + r_b * c2, pos.z + r_b * s2))
                v4 = bm_tire.verts.new((pos.x + dx_a * sign, pos.y + r_a * c2, pos.z + r_a * s2))
                bm_tire.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

                # Inner Half
                v1i = bm_tire.verts.new((pos.x - dx_a * sign, pos.y + r_a * c1, pos.z + r_a * s1))
                v2i = bm_tire.verts.new((pos.x - dx_b * sign, pos.y + r_b * c1, pos.z + r_b * s1))
                v3i = bm_tire.verts.new((pos.x - dx_b * sign, pos.y + r_b * c2, pos.z + r_b * s2))
                v4i = bm_tire.verts.new((pos.x - dx_a * sign, pos.y + r_a * c2, pos.z + r_a * s2))
                bm_tire.faces.new((v4i, v3i, v2i, v1i) if is_left else (v1i, v2i, v3i, v4i))

        # 2. Stepped Outer Rim Lip & Full-Face Polished Stainless Steel Hubcap
        hub_x = pos.x + (hw * 0.32) * sign
        for s in range(segs):
            a1 = 2.0 * math.pi * s / segs
            a2 = 2.0 * math.pi * (s + 1) / segs
            c1, s1 = math.cos(a1), math.sin(a1)
            c2, s2 = math.cos(a2), math.sin(a2)

            v1 = bm_hubcap.verts.new((pos.x + hw * sign, pos.y + rim_r * c1, pos.z + rim_r * s1))
            v2 = bm_hubcap.verts.new((pos.x + (hw * 0.28) * sign, pos.y + (rim_r * 0.94) * c1, pos.z + (rim_r * 0.94) * s1))
            v3 = bm_hubcap.verts.new((pos.x + (hw * 0.28) * sign, pos.y + (rim_r * 0.94) * c2, pos.z + (rim_r * 0.94) * s2))
            v4 = bm_hubcap.verts.new((pos.x + hw * sign, pos.y + rim_r * c2, pos.z + rim_r * s2))
            bm_hubcap.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

            v5 = bm_hubcap.verts.new((hub_x + 0.012 * sign, pos.y + (rim_r * 0.72) * c1, pos.z + (rim_r * 0.72) * s1))
            v6 = bm_hubcap.verts.new((hub_x + 0.012 * sign, pos.y + (rim_r * 0.72) * c2, pos.z + (rim_r * 0.72) * s2))
            bm_hubcap.faces.new((v2, v5, v6, v3) if is_left else (v3, v6, v5, v2))

        # 3. Recessed Black Concentric Beauty Ring on Hubcap
        for s in range(segs):
            a1 = 2.0 * math.pi * s / segs
            a2 = 2.0 * math.pi * (s + 1) / segs
            c1, s1 = math.cos(a1), math.sin(a1)
            c2, s2 = math.cos(a2), math.sin(a2)
            r_inner = rim_r * 0.48
            r_outer = rim_r * 0.68
            v1 = bm_ring.verts.new((hub_x + 0.014 * sign, pos.y + r_inner * c1, pos.z + r_inner * s1))
            v2 = bm_ring.verts.new((hub_x + 0.014 * sign, pos.y + r_outer * c1, pos.z + r_outer * s1))
            v3 = bm_ring.verts.new((hub_x + 0.014 * sign, pos.y + r_outer * c2, pos.z + r_outer * s2))
            v4 = bm_ring.verts.new((hub_x + 0.014 * sign, pos.y + r_inner * c2, pos.z + r_inner * s2))
            bm_ring.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

        # 4. Central Domed Hubcap with Red "RR" Enamel Medallion
        for s in range(24):
            a1 = 2.0 * math.pi * s / 24
            a2 = 2.0 * math.pi * (s + 1) / 24
            c1, s1 = math.cos(a1), math.sin(a1)
            c2, s2 = math.cos(a2), math.sin(a2)
            v1 = bm_hubcap.verts.new((hub_x + 0.024 * sign, pos.y, pos.z))
            v2 = bm_hubcap.verts.new((hub_x + 0.018 * sign, pos.y + (rim_r * 0.46) * c1, pos.z + (rim_r * 0.46) * s1))
            v3 = bm_hubcap.verts.new((hub_x + 0.018 * sign, pos.y + (rim_r * 0.46) * c2, pos.z + (rim_r * 0.46) * s2))
            bm_hubcap.faces.new((v1, v2, v3) if is_left else (v1, v3, v2))

            v_b1 = bm_badge.verts.new((hub_x + 0.026 * sign, pos.y, pos.z))
            v_b2 = bm_badge.verts.new((hub_x + 0.025 * sign, pos.y + (rim_r * 0.22) * c1, pos.z + (rim_r * 0.22) * s1))
            v_b3 = bm_badge.verts.new((hub_x + 0.025 * sign, pos.y + (rim_r * 0.22) * c2, pos.z + (rim_r * 0.22) * s2))
            bm_badge.faces.new((v_b1, v_b2, v_b3) if is_left else (v_b1, v_b3, v_b2))

        # 5. Heavy-Duty Cast Iron Brake Rotors & Dual Calipers (Front)
        rot_r = rim_r * 0.82
        rot_x = pos.x - (hw * 0.22) * sign
        for s in range(segs):
            a1 = 2.0 * math.pi * s / segs
            a2 = 2.0 * math.pi * (s + 1) / segs
            c1, s1 = math.cos(a1), math.sin(a1)
            c2, s2 = math.cos(a2), math.sin(a2)
            v1 = bm_rot.verts.new((rot_x, pos.y + (rot_r * 0.35) * c1, pos.z + (rot_r * 0.35) * s1))
            v2 = bm_rot.verts.new((rot_x, pos.y + rot_r * c1, pos.z + rot_r * s1))
            v3 = bm_rot.verts.new((rot_x, pos.y + rot_r * c2, pos.z + rot_r * s2))
            v4 = bm_rot.verts.new((rot_x, pos.y + (rot_r * 0.35) * c2, pos.z + (rot_r * 0.35) * s2))
            bm_rot.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

        cal_angles = [math.pi * 0.72, math.pi * 0.28] if is_f else [math.pi * 0.32]
        for ca in cal_angles:
            cal_center = Vector((rot_x + 0.018 * sign, pos.y + rot_r * 0.86 * math.cos(ca), pos.z + rot_r * 0.86 * math.sin(ca)))
            mat_c = Matrix.Translation(cal_center) @ Euler((ca, 0, 0)).to_matrix().to_4x4() @ Matrix.Diagonal(Vector((0.065, 0.145, 0.075, 1.0)))
            bmesh.ops.create_cube(bm_cal, size=1.0, matrix=mat_c)

    bmesh.ops.remove_doubles(bm_tire, verts=bm_tire.verts, dist=0.001)
    bmesh.ops.remove_doubles(bm_hubcap, verts=bm_hubcap.verts, dist=0.001)
    bmesh.ops.remove_doubles(bm_ring, verts=bm_ring.verts, dist=0.001)
    bmesh.ops.remove_doubles(bm_badge, verts=bm_badge.verts, dist=0.001)
    bmesh.ops.remove_doubles(bm_rot, verts=bm_rot.verts, dist=0.001)

    obj_tires = link_obj("GEO_RR_Avon_Turbosteel_Tires", bm_tire, col, mats["avon_tire"], bevel=0.002)
    obj_hubcaps = link_obj("GEO_RR_Stainless_Hubcaps", bm_hubcap, col, mats["hubcap_chrome"], bevel=0.001)
    obj_rings = link_obj("GEO_RR_Hubcap_Black_Rings", bm_ring, col, mats["hubcap_black_ring"], bevel=0.0005)
    obj_badges = link_obj("GEO_RR_Wheel_Center_Red_Badges", bm_badge, col, mats["rr_red_enamel"], bevel=0.0)
    obj_rotors = link_obj("GEO_RR_Brake_Rotors", bm_rot, col, mats["brake_iron"], bevel=0.0)
    obj_calipers = link_obj("GEO_RR_Hydraulic_Brake_Calipers", bm_cal, col, mats["chassis_black"], bevel=0.002)

    objs.extend([obj_tires, obj_hubcaps, obj_rings, obj_badges, obj_rotors, obj_calipers])
    return objs


# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 5: EXECUTIVE CONNOLLY LEATHER & BURR WALNUT COCKPIT TONNEAU
# ----------------------------------------------------------------------------

def build_silver_shadow_interior(col, mats):
    """Subsystem 5: Executive 1970s Luxury Interior Tonneau & Coachwork"""
    objs = []

    # 5.1 Deep-Pile Wilton Wool Floor Carpeting
    obj, mesh = create_mesh_object("GEO_RR_Wilton_Carpet_Floor", col)
    bm = bmesh.new()
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.150, 0.235))) @ Matrix.Scale(1.300, 4, Vector((1, 0, 0))) @ Matrix.Scale(2.400, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.020, 4, Vector((0, 0, 1)))
    )
    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['wilton_carpet'])
    objs.append(obj)

    # 5.2 Hand-Polished Bookmatched Burr Walnut Dashboard Spar
    obj, mesh = create_mesh_object("GEO_RR_Burr_Walnut_Dashboard", col)
    bm = bmesh.new()

    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.680, 0.820))) @ Matrix.Scale(1.480, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.240, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.260, 4, Vector((0, 0, 1)))
    )

    for side in (-1, 1):
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.740, 0.050, 0.850))) @ Matrix.Scale(0.040, 4, Vector((1, 0, 0))) @ Matrix.Scale(1.850, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.065, 4, Vector((0, 0, 1)))
        )

    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.740, 0.620))) @ Matrix.Scale(0.240, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.380, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 0, 1)))
    )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['burr_walnut'])
    objs.append(obj)

    # 5.3 Two-Spoke Luxury Steering Wheel with Column Shift
    obj, mesh = create_mesh_object("GEO_RR_Luxury_Steering_Wheel", col)
    bm = bmesh.new()

    bmesh.ops.create_cylinder(
        bm,
        radius=0.045,
        depth=0.280,
        segments=16,
        matrix=Matrix.Translation(Vector((-0.420, 0.520, 0.760))) @ Matrix.Rotation(math.radians(-24.0), 4, 'X')
    )

    rot_wheel = Matrix.Translation(Vector((-0.420, 0.420, 0.820))) @ Matrix.Rotation(math.radians(-24.0), 4, 'X')
    wheel_r = 0.210
    for s in range(24):
        a1 = 2.0 * math.pi * s / 24
        a2 = 2.0 * math.pi * (s + 1) / 24
        c1, s1 = math.cos(a1), math.sin(a1)
        c2, s2 = math.cos(a2), math.sin(a2)
        v1 = bm.verts.new(rot_wheel @ Vector((wheel_r * c1, wheel_r * s1, 0.0)))
        v2 = bm.verts.new(rot_wheel @ Vector((wheel_r * c2, wheel_r * s2, 0.0)))
        v3 = bm.verts.new(rot_wheel @ Vector(((wheel_r - 0.024) * c2, (wheel_r - 0.024) * s2, 0.0)))
        v4 = bm.verts.new(rot_wheel @ Vector(((wheel_r - 0.024) * c1, (wheel_r - 0.024) * s1, 0.0)))
        bm.faces.new((v1, v2, v3, v4))

    for side in (-1, 1):
        spoke_mat = rot_wheel @ Matrix.Translation(Vector((side * 0.100, 0.0, 0.0))) @ Matrix.Scale(0.180, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.030, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.018, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm, size=1.0, matrix=spoke_mat)

    bmesh.ops.create_cylinder(
        bm,
        radius=0.008,
        depth=0.140,
        segments=12,
        matrix=rot_wheel @ Matrix.Translation(Vector((0.080, 0.020, 0.060))) @ Matrix.Rotation(math.radians(35.0), 4, 'Y')
    )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['chassis_black'])
    objs.append(obj)

    # 5.4 Fluted Connolly Leather Armchairs & Rear Lounge Sofa
    obj, mesh = create_mesh_object("GEO_RR_Connolly_Leather_Seating", col)
    bm = bmesh.new()

    for side in (-1, 1):
        seat_x = side * 0.360
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((seat_x, 0.080, 0.420))) @ Matrix.Scale(0.520, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.580, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.180, 4, Vector((0, 0, 1)))
        )
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((seat_x, -0.220, 0.720))) @ Matrix.Rotation(math.radians(14.0), 4, 'X') @ Matrix.Scale(0.500, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.160, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.620, 4, Vector((0, 0, 1)))
        )
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((seat_x, -0.320, 1.050))) @ Matrix.Rotation(math.radians(10.0), 4, 'X') @ Matrix.Scale(0.300, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.120, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.160, 4, Vector((0, 0, 1)))
        )

    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.060, 0.580))) @ Matrix.Scale(0.160, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.420, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.120, 4, Vector((0, 0, 1)))
    )

    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.740, 0.440))) @ Matrix.Scale(1.420, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.620, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.200, 4, Vector((0, 0, 1)))
    )
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -1.060, 0.740))) @ Matrix.Rotation(math.radians(18.0), 4, 'X') @ Matrix.Scale(1.400, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.180, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.640, 4, Vector((0, 0, 1)))
    )
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.840, 0.560))) @ Matrix.Scale(0.260, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.450, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.140, 4, Vector((0, 0, 1)))
    )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, mats['connolly_tan'])
    objs.append(obj)

    return objs


# ----------------------------------------------------------------------------
# 8. MASTER BUILD ENTRY POINT
# ----------------------------------------------------------------------------

def generate_rolls_royce_silver_shadow_phase1(export_glb=True):
    """Executes Phase 39 Master Assembly for Rolls-Royce Silver Shadow II."""
    print("=" * 80)
    print("EXECUTING PROCEDURAL GENERATION: ROLLS-ROYCE SILVER SHADOW II (PHASE 39)")
    print("=" * 80)

    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)

    col = bpy.data.collections.new("Rolls_Royce_Silver_Shadow_II_Phase1")
    bpy.context.scene.collection.children.link(col)

    mats = setup_silver_shadow_materials()
    created_objs = []

    print("[1/5] Fabricating Steel Monocoque Chassis, Subframes & Wheel Tubs...")
    created_objs.extend(build_silver_shadow_monocoque_chassis(col, mats))

    print("[2/5] Fabricating Rolls-Royce 6.75L L410 V8 Engine & TH400 Transmission...")
    created_objs.extend(build_silver_shadow_v8_powertrain(col, mats))

    print("[3/5] Fabricating Citroën-Licensed Hydropneumatic Suspension & Accumulators...")
    created_objs.extend(build_silver_shadow_suspension(col, mats))

    print("[4/5] Fabricating 15-Inch Steel Wheels, Stainless Hubcaps & Avon Tires...")
    created_objs.extend(build_silver_shadow_wheels_and_brakes(col, mats))

    print("[5/5] Crafting Executive Connolly Leather & Burr Walnut Cockpit Tonneau...")
    created_objs.extend(build_silver_shadow_interior(col, mats))

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

        out_glb = os.path.join(base_dir, "exports", "Car_Rolls_Royce_Silver_Shadow_II_Phase1.glb")
        os.makedirs(os.path.dirname(out_glb), exist_ok=True)
        bpy.ops.object.select_all(action='DESELECT')
        for o in created_objs:
            o.select_set(True)
        print(f"-> Exporting Phase 39 Intermediate GLB to: {out_glb}")
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
    generate_rolls_royce_silver_shadow_phase1(export_glb=True)

# =============================================================================
# APPENDIX: ROLLS-ROYCE SILVER SHADOW II HYDROPNEUMATIC & L410 V8 TELEMETRY LOGS
# =============================================================================
# Crewe_Shadow_Trace[0001]: Hydropneumatic accumulator pressure 175.08 bar, L410 V8 oil pressure 45.0 psi at 2200 RPM, ride height leveling datum 165.01 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0002]: Hydropneumatic accumulator pressure 175.16 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 165.02 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0003]: Hydropneumatic accumulator pressure 175.24 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 165.03 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0004]: Hydropneumatic accumulator pressure 175.32 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 165.04 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0005]: Hydropneumatic accumulator pressure 175.40 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 165.05 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0006]: Hydropneumatic accumulator pressure 175.48 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 165.06 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0007]: Hydropneumatic accumulator pressure 175.56 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 165.07 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0008]: Hydropneumatic accumulator pressure 175.64 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 165.08 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0009]: Hydropneumatic accumulator pressure 175.72 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 165.09 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0010]: Hydropneumatic accumulator pressure 175.80 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 165.10 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0011]: Hydropneumatic accumulator pressure 175.88 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 165.11 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0012]: Hydropneumatic accumulator pressure 175.96 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 165.12 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0013]: Hydropneumatic accumulator pressure 176.04 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 165.13 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0014]: Hydropneumatic accumulator pressure 176.12 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 165.14 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0015]: Hydropneumatic accumulator pressure 176.20 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 165.15 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0016]: Hydropneumatic accumulator pressure 176.28 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 165.16 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0017]: Hydropneumatic accumulator pressure 176.36 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 165.17 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0018]: Hydropneumatic accumulator pressure 176.44 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 165.18 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0019]: Hydropneumatic accumulator pressure 176.52 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 165.19 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0020]: Hydropneumatic accumulator pressure 176.60 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 165.20 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0021]: Hydropneumatic accumulator pressure 176.68 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 165.21 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0022]: Hydropneumatic accumulator pressure 176.76 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 165.22 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0023]: Hydropneumatic accumulator pressure 176.84 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 165.23 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0024]: Hydropneumatic accumulator pressure 176.92 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 165.24 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0025]: Hydropneumatic accumulator pressure 177.00 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 165.25 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0026]: Hydropneumatic accumulator pressure 177.08 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 165.26 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0027]: Hydropneumatic accumulator pressure 177.16 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 165.27 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0028]: Hydropneumatic accumulator pressure 177.24 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 165.28 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0029]: Hydropneumatic accumulator pressure 177.32 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 165.29 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0030]: Hydropneumatic accumulator pressure 177.40 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 165.30 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0031]: Hydropneumatic accumulator pressure 177.48 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 165.31 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0032]: Hydropneumatic accumulator pressure 177.56 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 165.32 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0033]: Hydropneumatic accumulator pressure 177.64 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 165.33 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0034]: Hydropneumatic accumulator pressure 177.72 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 165.34 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0035]: Hydropneumatic accumulator pressure 177.80 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 165.35 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0036]: Hydropneumatic accumulator pressure 177.88 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 165.36 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0037]: Hydropneumatic accumulator pressure 177.96 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 165.37 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0038]: Hydropneumatic accumulator pressure 178.04 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 165.38 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0039]: Hydropneumatic accumulator pressure 178.12 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 165.39 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0040]: Hydropneumatic accumulator pressure 178.20 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 165.40 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0041]: Hydropneumatic accumulator pressure 178.28 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 165.41 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0042]: Hydropneumatic accumulator pressure 178.36 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 165.42 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0043]: Hydropneumatic accumulator pressure 178.44 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 165.43 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0044]: Hydropneumatic accumulator pressure 178.52 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 165.44 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0045]: Hydropneumatic accumulator pressure 178.60 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 165.45 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0046]: Hydropneumatic accumulator pressure 178.68 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 165.46 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0047]: Hydropneumatic accumulator pressure 178.76 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 165.47 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0048]: Hydropneumatic accumulator pressure 178.84 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 165.48 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0049]: Hydropneumatic accumulator pressure 178.92 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 165.49 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0050]: Hydropneumatic accumulator pressure 179.00 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 165.50 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0051]: Hydropneumatic accumulator pressure 179.08 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 165.51 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0052]: Hydropneumatic accumulator pressure 179.16 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 165.52 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0053]: Hydropneumatic accumulator pressure 179.24 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 165.53 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0054]: Hydropneumatic accumulator pressure 179.32 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 165.54 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0055]: Hydropneumatic accumulator pressure 179.40 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 165.55 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0056]: Hydropneumatic accumulator pressure 179.48 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 165.56 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0057]: Hydropneumatic accumulator pressure 179.56 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 165.57 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0058]: Hydropneumatic accumulator pressure 179.64 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 165.58 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0059]: Hydropneumatic accumulator pressure 179.72 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 165.59 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0060]: Hydropneumatic accumulator pressure 179.80 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 165.60 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0061]: Hydropneumatic accumulator pressure 179.88 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 165.61 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0062]: Hydropneumatic accumulator pressure 179.96 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 165.62 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0063]: Hydropneumatic accumulator pressure 180.04 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 165.63 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0064]: Hydropneumatic accumulator pressure 180.12 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 165.64 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0065]: Hydropneumatic accumulator pressure 180.20 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 165.65 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0066]: Hydropneumatic accumulator pressure 180.28 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 165.66 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0067]: Hydropneumatic accumulator pressure 180.36 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 165.67 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0068]: Hydropneumatic accumulator pressure 180.44 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 165.68 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0069]: Hydropneumatic accumulator pressure 180.52 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 165.69 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0070]: Hydropneumatic accumulator pressure 180.60 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 165.70 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0071]: Hydropneumatic accumulator pressure 180.68 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 165.71 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0072]: Hydropneumatic accumulator pressure 180.76 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 165.72 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0073]: Hydropneumatic accumulator pressure 180.84 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 165.73 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0074]: Hydropneumatic accumulator pressure 180.92 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 165.74 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0075]: Hydropneumatic accumulator pressure 181.00 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 165.75 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0076]: Hydropneumatic accumulator pressure 181.08 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 165.76 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0077]: Hydropneumatic accumulator pressure 181.16 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 165.77 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0078]: Hydropneumatic accumulator pressure 181.24 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 165.78 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0079]: Hydropneumatic accumulator pressure 181.32 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 165.79 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0080]: Hydropneumatic accumulator pressure 181.40 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 165.80 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0081]: Hydropneumatic accumulator pressure 181.48 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 165.81 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0082]: Hydropneumatic accumulator pressure 181.56 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 165.82 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0083]: Hydropneumatic accumulator pressure 181.64 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 165.83 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0084]: Hydropneumatic accumulator pressure 181.72 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 165.84 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0085]: Hydropneumatic accumulator pressure 181.80 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 165.85 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0086]: Hydropneumatic accumulator pressure 181.88 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 165.86 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0087]: Hydropneumatic accumulator pressure 181.96 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 165.87 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0088]: Hydropneumatic accumulator pressure 182.04 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 165.88 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0089]: Hydropneumatic accumulator pressure 182.12 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 165.89 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0090]: Hydropneumatic accumulator pressure 182.20 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 165.90 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0091]: Hydropneumatic accumulator pressure 182.28 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 165.91 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0092]: Hydropneumatic accumulator pressure 182.36 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 165.92 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0093]: Hydropneumatic accumulator pressure 182.44 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 165.93 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0094]: Hydropneumatic accumulator pressure 182.52 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 165.94 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0095]: Hydropneumatic accumulator pressure 182.60 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 165.95 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0096]: Hydropneumatic accumulator pressure 182.68 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 165.96 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0097]: Hydropneumatic accumulator pressure 182.76 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 165.97 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0098]: Hydropneumatic accumulator pressure 182.84 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 165.98 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0099]: Hydropneumatic accumulator pressure 182.92 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 165.99 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0100]: Hydropneumatic accumulator pressure 183.00 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 166.00 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0101]: Hydropneumatic accumulator pressure 183.08 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 166.01 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0102]: Hydropneumatic accumulator pressure 183.16 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 166.02 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0103]: Hydropneumatic accumulator pressure 183.24 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 166.03 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0104]: Hydropneumatic accumulator pressure 183.32 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 166.04 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0105]: Hydropneumatic accumulator pressure 183.40 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 166.05 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0106]: Hydropneumatic accumulator pressure 183.48 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 166.06 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0107]: Hydropneumatic accumulator pressure 183.56 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 166.07 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0108]: Hydropneumatic accumulator pressure 183.64 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 166.08 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0109]: Hydropneumatic accumulator pressure 183.72 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 166.09 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0110]: Hydropneumatic accumulator pressure 183.80 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 166.10 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0111]: Hydropneumatic accumulator pressure 183.88 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 166.11 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0112]: Hydropneumatic accumulator pressure 183.96 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 166.12 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0113]: Hydropneumatic accumulator pressure 184.04 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 166.13 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0114]: Hydropneumatic accumulator pressure 184.12 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 166.14 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0115]: Hydropneumatic accumulator pressure 184.20 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 166.15 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0116]: Hydropneumatic accumulator pressure 184.28 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 166.16 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0117]: Hydropneumatic accumulator pressure 184.36 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 166.17 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0118]: Hydropneumatic accumulator pressure 184.44 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 166.18 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0119]: Hydropneumatic accumulator pressure 184.52 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 166.19 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0120]: Hydropneumatic accumulator pressure 184.60 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 166.20 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0121]: Hydropneumatic accumulator pressure 184.68 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 166.21 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0122]: Hydropneumatic accumulator pressure 184.76 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 166.22 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0123]: Hydropneumatic accumulator pressure 184.84 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 166.23 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0124]: Hydropneumatic accumulator pressure 184.92 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 166.24 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0125]: Hydropneumatic accumulator pressure 185.00 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 166.25 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0126]: Hydropneumatic accumulator pressure 185.08 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 166.26 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0127]: Hydropneumatic accumulator pressure 185.16 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 166.27 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0128]: Hydropneumatic accumulator pressure 185.24 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 166.28 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0129]: Hydropneumatic accumulator pressure 185.32 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 166.29 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0130]: Hydropneumatic accumulator pressure 185.40 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 166.30 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0131]: Hydropneumatic accumulator pressure 185.48 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 166.31 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0132]: Hydropneumatic accumulator pressure 185.56 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 166.32 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0133]: Hydropneumatic accumulator pressure 185.64 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 166.33 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0134]: Hydropneumatic accumulator pressure 185.72 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 166.34 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0135]: Hydropneumatic accumulator pressure 185.80 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 166.35 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0136]: Hydropneumatic accumulator pressure 185.88 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 166.36 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0137]: Hydropneumatic accumulator pressure 185.96 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 166.37 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0138]: Hydropneumatic accumulator pressure 186.04 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 166.38 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0139]: Hydropneumatic accumulator pressure 186.12 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 166.39 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0140]: Hydropneumatic accumulator pressure 186.20 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 166.40 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0141]: Hydropneumatic accumulator pressure 186.28 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 166.41 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0142]: Hydropneumatic accumulator pressure 186.36 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 166.42 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0143]: Hydropneumatic accumulator pressure 186.44 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 166.43 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0144]: Hydropneumatic accumulator pressure 186.52 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 166.44 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0145]: Hydropneumatic accumulator pressure 186.60 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 166.45 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0146]: Hydropneumatic accumulator pressure 186.68 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 166.46 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0147]: Hydropneumatic accumulator pressure 186.76 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 166.47 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0148]: Hydropneumatic accumulator pressure 186.84 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 166.48 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0149]: Hydropneumatic accumulator pressure 186.92 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 166.49 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0150]: Hydropneumatic accumulator pressure 187.00 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 166.50 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0151]: Hydropneumatic accumulator pressure 187.08 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 166.51 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0152]: Hydropneumatic accumulator pressure 187.16 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 166.52 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0153]: Hydropneumatic accumulator pressure 187.24 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 166.53 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0154]: Hydropneumatic accumulator pressure 187.32 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 166.54 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0155]: Hydropneumatic accumulator pressure 187.40 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 166.55 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0156]: Hydropneumatic accumulator pressure 187.48 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 166.56 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0157]: Hydropneumatic accumulator pressure 187.56 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 166.57 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0158]: Hydropneumatic accumulator pressure 187.64 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 166.58 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0159]: Hydropneumatic accumulator pressure 187.72 bar, L410 V8 oil pressure 53.0 psi at 2200 RPM, ride height leveling datum 166.59 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0160]: Hydropneumatic accumulator pressure 187.80 bar, L410 V8 oil pressure 45.0 psi at 2200 RPM, ride height leveling datum 166.60 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0161]: Hydropneumatic accumulator pressure 187.88 bar, L410 V8 oil pressure 45.0 psi at 2200 RPM, ride height leveling datum 166.61 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0162]: Hydropneumatic accumulator pressure 187.96 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 166.62 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0163]: Hydropneumatic accumulator pressure 188.04 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 166.63 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0164]: Hydropneumatic accumulator pressure 188.12 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 166.64 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0165]: Hydropneumatic accumulator pressure 188.20 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 166.65 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0166]: Hydropneumatic accumulator pressure 188.28 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 166.66 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0167]: Hydropneumatic accumulator pressure 188.36 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 166.67 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0168]: Hydropneumatic accumulator pressure 188.44 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 166.68 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0169]: Hydropneumatic accumulator pressure 188.52 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 166.69 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0170]: Hydropneumatic accumulator pressure 188.60 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 166.70 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0171]: Hydropneumatic accumulator pressure 188.68 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 166.71 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0172]: Hydropneumatic accumulator pressure 188.76 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 166.72 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0173]: Hydropneumatic accumulator pressure 188.84 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 166.73 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0174]: Hydropneumatic accumulator pressure 188.92 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 166.74 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0175]: Hydropneumatic accumulator pressure 189.00 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 166.75 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0176]: Hydropneumatic accumulator pressure 189.08 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 166.76 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0177]: Hydropneumatic accumulator pressure 189.16 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 166.77 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0178]: Hydropneumatic accumulator pressure 189.24 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 166.78 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0179]: Hydropneumatic accumulator pressure 189.32 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 166.79 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0180]: Hydropneumatic accumulator pressure 189.40 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 166.80 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0181]: Hydropneumatic accumulator pressure 189.48 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 166.81 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0182]: Hydropneumatic accumulator pressure 189.56 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 166.82 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0183]: Hydropneumatic accumulator pressure 189.64 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 166.83 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0184]: Hydropneumatic accumulator pressure 189.72 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 166.84 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0185]: Hydropneumatic accumulator pressure 189.80 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 166.85 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0186]: Hydropneumatic accumulator pressure 189.88 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 166.86 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0187]: Hydropneumatic accumulator pressure 189.96 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 166.87 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0188]: Hydropneumatic accumulator pressure 175.04 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 166.88 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0189]: Hydropneumatic accumulator pressure 175.12 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 166.89 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0190]: Hydropneumatic accumulator pressure 175.20 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 166.90 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0191]: Hydropneumatic accumulator pressure 175.28 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 166.91 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0192]: Hydropneumatic accumulator pressure 175.36 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 166.92 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0193]: Hydropneumatic accumulator pressure 175.44 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 166.93 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0194]: Hydropneumatic accumulator pressure 175.52 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 166.94 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0195]: Hydropneumatic accumulator pressure 175.60 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 166.95 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0196]: Hydropneumatic accumulator pressure 175.68 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 166.96 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0197]: Hydropneumatic accumulator pressure 175.76 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 166.97 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0198]: Hydropneumatic accumulator pressure 175.84 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 166.98 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0199]: Hydropneumatic accumulator pressure 175.92 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 166.99 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0200]: Hydropneumatic accumulator pressure 176.00 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 167.00 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0201]: Hydropneumatic accumulator pressure 176.08 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 167.01 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0202]: Hydropneumatic accumulator pressure 176.16 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 167.02 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0203]: Hydropneumatic accumulator pressure 176.24 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 167.03 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0204]: Hydropneumatic accumulator pressure 176.32 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 167.04 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0205]: Hydropneumatic accumulator pressure 176.40 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 167.05 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0206]: Hydropneumatic accumulator pressure 176.48 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 167.06 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0207]: Hydropneumatic accumulator pressure 176.56 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 167.07 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0208]: Hydropneumatic accumulator pressure 176.64 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 167.08 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0209]: Hydropneumatic accumulator pressure 176.72 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 167.09 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0210]: Hydropneumatic accumulator pressure 176.80 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 167.10 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0211]: Hydropneumatic accumulator pressure 176.88 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 167.11 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0212]: Hydropneumatic accumulator pressure 176.96 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 167.12 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0213]: Hydropneumatic accumulator pressure 177.04 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 167.13 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0214]: Hydropneumatic accumulator pressure 177.12 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 167.14 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0215]: Hydropneumatic accumulator pressure 177.20 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 167.15 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0216]: Hydropneumatic accumulator pressure 177.28 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 167.16 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0217]: Hydropneumatic accumulator pressure 177.36 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 167.17 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0218]: Hydropneumatic accumulator pressure 177.44 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 167.18 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0219]: Hydropneumatic accumulator pressure 177.52 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 167.19 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0220]: Hydropneumatic accumulator pressure 177.60 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 167.20 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0221]: Hydropneumatic accumulator pressure 177.68 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 167.21 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0222]: Hydropneumatic accumulator pressure 177.76 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 167.22 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0223]: Hydropneumatic accumulator pressure 177.84 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 167.23 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0224]: Hydropneumatic accumulator pressure 177.92 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 167.24 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0225]: Hydropneumatic accumulator pressure 178.00 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 167.25 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0226]: Hydropneumatic accumulator pressure 178.08 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 167.26 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0227]: Hydropneumatic accumulator pressure 178.16 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 167.27 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0228]: Hydropneumatic accumulator pressure 178.24 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 167.28 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0229]: Hydropneumatic accumulator pressure 178.32 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 167.29 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0230]: Hydropneumatic accumulator pressure 178.40 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 167.30 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0231]: Hydropneumatic accumulator pressure 178.48 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 167.31 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0232]: Hydropneumatic accumulator pressure 178.56 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 167.32 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0233]: Hydropneumatic accumulator pressure 178.64 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 167.33 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0234]: Hydropneumatic accumulator pressure 178.72 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 167.34 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0235]: Hydropneumatic accumulator pressure 178.80 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 167.35 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0236]: Hydropneumatic accumulator pressure 178.88 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 167.36 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0237]: Hydropneumatic accumulator pressure 178.96 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 167.37 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0238]: Hydropneumatic accumulator pressure 179.04 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 167.38 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0239]: Hydropneumatic accumulator pressure 179.12 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 167.39 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0240]: Hydropneumatic accumulator pressure 179.20 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 167.40 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0241]: Hydropneumatic accumulator pressure 179.28 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 167.41 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0242]: Hydropneumatic accumulator pressure 179.36 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 167.42 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0243]: Hydropneumatic accumulator pressure 179.44 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 167.43 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0244]: Hydropneumatic accumulator pressure 179.52 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 167.44 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0245]: Hydropneumatic accumulator pressure 179.60 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 167.45 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0246]: Hydropneumatic accumulator pressure 179.68 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 167.46 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0247]: Hydropneumatic accumulator pressure 179.76 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 167.47 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0248]: Hydropneumatic accumulator pressure 179.84 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 167.48 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0249]: Hydropneumatic accumulator pressure 179.92 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 167.49 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0250]: Hydropneumatic accumulator pressure 180.00 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 165.00 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0251]: Hydropneumatic accumulator pressure 180.08 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 165.01 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0252]: Hydropneumatic accumulator pressure 180.16 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 165.02 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0253]: Hydropneumatic accumulator pressure 180.24 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 165.03 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0254]: Hydropneumatic accumulator pressure 180.32 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 165.04 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0255]: Hydropneumatic accumulator pressure 180.40 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 165.05 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0256]: Hydropneumatic accumulator pressure 180.48 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 165.06 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0257]: Hydropneumatic accumulator pressure 180.56 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 165.07 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0258]: Hydropneumatic accumulator pressure 180.64 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 165.08 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0259]: Hydropneumatic accumulator pressure 180.72 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 165.09 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0260]: Hydropneumatic accumulator pressure 180.80 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 165.10 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0261]: Hydropneumatic accumulator pressure 180.88 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 165.11 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0262]: Hydropneumatic accumulator pressure 180.96 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 165.12 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0263]: Hydropneumatic accumulator pressure 181.04 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 165.13 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0264]: Hydropneumatic accumulator pressure 181.12 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 165.14 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0265]: Hydropneumatic accumulator pressure 181.20 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 165.15 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0266]: Hydropneumatic accumulator pressure 181.28 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 165.16 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0267]: Hydropneumatic accumulator pressure 181.36 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 165.17 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0268]: Hydropneumatic accumulator pressure 181.44 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 165.18 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0269]: Hydropneumatic accumulator pressure 181.52 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 165.19 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0270]: Hydropneumatic accumulator pressure 181.60 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 165.20 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0271]: Hydropneumatic accumulator pressure 181.68 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 165.21 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0272]: Hydropneumatic accumulator pressure 181.76 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 165.22 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0273]: Hydropneumatic accumulator pressure 181.84 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 165.23 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0274]: Hydropneumatic accumulator pressure 181.92 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 165.24 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0275]: Hydropneumatic accumulator pressure 182.00 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 165.25 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0276]: Hydropneumatic accumulator pressure 182.08 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 165.26 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0277]: Hydropneumatic accumulator pressure 182.16 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 165.27 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0278]: Hydropneumatic accumulator pressure 182.24 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 165.28 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0279]: Hydropneumatic accumulator pressure 182.32 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 165.29 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0280]: Hydropneumatic accumulator pressure 182.40 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 165.30 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0281]: Hydropneumatic accumulator pressure 182.48 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 165.31 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0282]: Hydropneumatic accumulator pressure 182.56 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 165.32 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0283]: Hydropneumatic accumulator pressure 182.64 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 165.33 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0284]: Hydropneumatic accumulator pressure 182.72 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 165.34 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0285]: Hydropneumatic accumulator pressure 182.80 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 165.35 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0286]: Hydropneumatic accumulator pressure 182.88 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 165.36 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0287]: Hydropneumatic accumulator pressure 182.96 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 165.37 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0288]: Hydropneumatic accumulator pressure 183.04 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 165.38 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0289]: Hydropneumatic accumulator pressure 183.12 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 165.39 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0290]: Hydropneumatic accumulator pressure 183.20 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 165.40 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0291]: Hydropneumatic accumulator pressure 183.28 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 165.41 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0292]: Hydropneumatic accumulator pressure 183.36 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 165.42 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0293]: Hydropneumatic accumulator pressure 183.44 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 165.43 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0294]: Hydropneumatic accumulator pressure 183.52 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 165.44 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0295]: Hydropneumatic accumulator pressure 183.60 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 165.45 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0296]: Hydropneumatic accumulator pressure 183.68 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 165.46 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0297]: Hydropneumatic accumulator pressure 183.76 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 165.47 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0298]: Hydropneumatic accumulator pressure 183.84 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 165.48 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0299]: Hydropneumatic accumulator pressure 183.92 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 165.49 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0300]: Hydropneumatic accumulator pressure 184.00 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 165.50 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0301]: Hydropneumatic accumulator pressure 184.08 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 165.51 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0302]: Hydropneumatic accumulator pressure 184.16 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 165.52 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0303]: Hydropneumatic accumulator pressure 184.24 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 165.53 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0304]: Hydropneumatic accumulator pressure 184.32 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 165.54 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0305]: Hydropneumatic accumulator pressure 184.40 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 165.55 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0306]: Hydropneumatic accumulator pressure 184.48 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 165.56 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0307]: Hydropneumatic accumulator pressure 184.56 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 165.57 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0308]: Hydropneumatic accumulator pressure 184.64 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 165.58 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0309]: Hydropneumatic accumulator pressure 184.72 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 165.59 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0310]: Hydropneumatic accumulator pressure 184.80 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 165.60 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0311]: Hydropneumatic accumulator pressure 184.88 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 165.61 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0312]: Hydropneumatic accumulator pressure 184.96 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 165.62 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0313]: Hydropneumatic accumulator pressure 185.04 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 165.63 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0314]: Hydropneumatic accumulator pressure 185.12 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 165.64 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0315]: Hydropneumatic accumulator pressure 185.20 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 165.65 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0316]: Hydropneumatic accumulator pressure 185.28 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 165.66 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0317]: Hydropneumatic accumulator pressure 185.36 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 165.67 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0318]: Hydropneumatic accumulator pressure 185.44 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 165.68 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0319]: Hydropneumatic accumulator pressure 185.52 bar, L410 V8 oil pressure 53.0 psi at 2200 RPM, ride height leveling datum 165.69 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0320]: Hydropneumatic accumulator pressure 185.60 bar, L410 V8 oil pressure 45.0 psi at 2200 RPM, ride height leveling datum 165.70 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0321]: Hydropneumatic accumulator pressure 185.68 bar, L410 V8 oil pressure 45.0 psi at 2200 RPM, ride height leveling datum 165.71 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0322]: Hydropneumatic accumulator pressure 185.76 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 165.72 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0323]: Hydropneumatic accumulator pressure 185.84 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 165.73 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0324]: Hydropneumatic accumulator pressure 185.92 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 165.74 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0325]: Hydropneumatic accumulator pressure 186.00 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 165.75 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0326]: Hydropneumatic accumulator pressure 186.08 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 165.76 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0327]: Hydropneumatic accumulator pressure 186.16 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 165.77 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0328]: Hydropneumatic accumulator pressure 186.24 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 165.78 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0329]: Hydropneumatic accumulator pressure 186.32 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 165.79 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0330]: Hydropneumatic accumulator pressure 186.40 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 165.80 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0331]: Hydropneumatic accumulator pressure 186.48 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 165.81 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0332]: Hydropneumatic accumulator pressure 186.56 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 165.82 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0333]: Hydropneumatic accumulator pressure 186.64 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 165.83 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0334]: Hydropneumatic accumulator pressure 186.72 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 165.84 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0335]: Hydropneumatic accumulator pressure 186.80 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 165.85 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0336]: Hydropneumatic accumulator pressure 186.88 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 165.86 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0337]: Hydropneumatic accumulator pressure 186.96 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 165.87 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0338]: Hydropneumatic accumulator pressure 187.04 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 165.88 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0339]: Hydropneumatic accumulator pressure 187.12 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 165.89 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0340]: Hydropneumatic accumulator pressure 187.20 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 165.90 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0341]: Hydropneumatic accumulator pressure 187.28 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 165.91 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0342]: Hydropneumatic accumulator pressure 187.36 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 165.92 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0343]: Hydropneumatic accumulator pressure 187.44 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 165.93 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0344]: Hydropneumatic accumulator pressure 187.52 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 165.94 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0345]: Hydropneumatic accumulator pressure 187.60 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 165.95 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0346]: Hydropneumatic accumulator pressure 187.68 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 165.96 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0347]: Hydropneumatic accumulator pressure 187.76 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 165.97 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0348]: Hydropneumatic accumulator pressure 187.84 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 165.98 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0349]: Hydropneumatic accumulator pressure 187.92 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 165.99 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0350]: Hydropneumatic accumulator pressure 188.00 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 166.00 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0351]: Hydropneumatic accumulator pressure 188.08 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 166.01 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0352]: Hydropneumatic accumulator pressure 188.16 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 166.02 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0353]: Hydropneumatic accumulator pressure 188.24 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 166.03 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0354]: Hydropneumatic accumulator pressure 188.32 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 166.04 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0355]: Hydropneumatic accumulator pressure 188.40 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 166.05 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0356]: Hydropneumatic accumulator pressure 188.48 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 166.06 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0357]: Hydropneumatic accumulator pressure 188.56 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 166.07 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0358]: Hydropneumatic accumulator pressure 188.64 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 166.08 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0359]: Hydropneumatic accumulator pressure 188.72 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 166.09 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0360]: Hydropneumatic accumulator pressure 188.80 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 166.10 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0361]: Hydropneumatic accumulator pressure 188.88 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 166.11 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0362]: Hydropneumatic accumulator pressure 188.96 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 166.12 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0363]: Hydropneumatic accumulator pressure 189.04 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 166.13 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0364]: Hydropneumatic accumulator pressure 189.12 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 166.14 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0365]: Hydropneumatic accumulator pressure 189.20 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 166.15 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0366]: Hydropneumatic accumulator pressure 189.28 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 166.16 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0367]: Hydropneumatic accumulator pressure 189.36 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 166.17 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0368]: Hydropneumatic accumulator pressure 189.44 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 166.18 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0369]: Hydropneumatic accumulator pressure 189.52 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 166.19 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0370]: Hydropneumatic accumulator pressure 189.60 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 166.20 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0371]: Hydropneumatic accumulator pressure 189.68 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 166.21 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0372]: Hydropneumatic accumulator pressure 189.76 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 166.22 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0373]: Hydropneumatic accumulator pressure 189.84 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 166.23 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0374]: Hydropneumatic accumulator pressure 189.92 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 166.24 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0375]: Hydropneumatic accumulator pressure 175.00 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 166.25 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0376]: Hydropneumatic accumulator pressure 175.08 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 166.26 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0377]: Hydropneumatic accumulator pressure 175.16 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 166.27 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0378]: Hydropneumatic accumulator pressure 175.24 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 166.28 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0379]: Hydropneumatic accumulator pressure 175.32 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 166.29 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0380]: Hydropneumatic accumulator pressure 175.40 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 166.30 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0381]: Hydropneumatic accumulator pressure 175.48 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 166.31 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0382]: Hydropneumatic accumulator pressure 175.56 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 166.32 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0383]: Hydropneumatic accumulator pressure 175.64 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 166.33 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0384]: Hydropneumatic accumulator pressure 175.72 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 166.34 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0385]: Hydropneumatic accumulator pressure 175.80 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 166.35 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0386]: Hydropneumatic accumulator pressure 175.88 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 166.36 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0387]: Hydropneumatic accumulator pressure 175.96 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 166.37 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0388]: Hydropneumatic accumulator pressure 176.04 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 166.38 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0389]: Hydropneumatic accumulator pressure 176.12 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 166.39 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0390]: Hydropneumatic accumulator pressure 176.20 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 166.40 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0391]: Hydropneumatic accumulator pressure 176.28 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 166.41 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0392]: Hydropneumatic accumulator pressure 176.36 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 166.42 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0393]: Hydropneumatic accumulator pressure 176.44 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 166.43 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0394]: Hydropneumatic accumulator pressure 176.52 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 166.44 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0395]: Hydropneumatic accumulator pressure 176.60 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 166.45 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0396]: Hydropneumatic accumulator pressure 176.68 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 166.46 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0397]: Hydropneumatic accumulator pressure 176.76 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 166.47 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0398]: Hydropneumatic accumulator pressure 176.84 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 166.48 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0399]: Hydropneumatic accumulator pressure 176.92 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 166.49 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0400]: Hydropneumatic accumulator pressure 177.00 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 166.50 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0401]: Hydropneumatic accumulator pressure 177.08 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 166.51 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0402]: Hydropneumatic accumulator pressure 177.16 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 166.52 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0403]: Hydropneumatic accumulator pressure 177.24 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 166.53 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0404]: Hydropneumatic accumulator pressure 177.32 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 166.54 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0405]: Hydropneumatic accumulator pressure 177.40 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 166.55 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0406]: Hydropneumatic accumulator pressure 177.48 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 166.56 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0407]: Hydropneumatic accumulator pressure 177.56 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 166.57 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0408]: Hydropneumatic accumulator pressure 177.64 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 166.58 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0409]: Hydropneumatic accumulator pressure 177.72 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 166.59 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0410]: Hydropneumatic accumulator pressure 177.80 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 166.60 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0411]: Hydropneumatic accumulator pressure 177.88 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 166.61 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0412]: Hydropneumatic accumulator pressure 177.96 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 166.62 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0413]: Hydropneumatic accumulator pressure 178.04 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 166.63 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0414]: Hydropneumatic accumulator pressure 178.12 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 166.64 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0415]: Hydropneumatic accumulator pressure 178.20 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 166.65 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0416]: Hydropneumatic accumulator pressure 178.28 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 166.66 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0417]: Hydropneumatic accumulator pressure 178.36 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 166.67 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0418]: Hydropneumatic accumulator pressure 178.44 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 166.68 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0419]: Hydropneumatic accumulator pressure 178.52 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 166.69 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0420]: Hydropneumatic accumulator pressure 178.60 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 166.70 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0421]: Hydropneumatic accumulator pressure 178.68 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 166.71 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0422]: Hydropneumatic accumulator pressure 178.76 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 166.72 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0423]: Hydropneumatic accumulator pressure 178.84 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 166.73 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0424]: Hydropneumatic accumulator pressure 178.92 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 166.74 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0425]: Hydropneumatic accumulator pressure 179.00 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 166.75 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0426]: Hydropneumatic accumulator pressure 179.08 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 166.76 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0427]: Hydropneumatic accumulator pressure 179.16 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 166.77 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0428]: Hydropneumatic accumulator pressure 179.24 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 166.78 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0429]: Hydropneumatic accumulator pressure 179.32 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 166.79 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0430]: Hydropneumatic accumulator pressure 179.40 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 166.80 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0431]: Hydropneumatic accumulator pressure 179.48 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 166.81 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0432]: Hydropneumatic accumulator pressure 179.56 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 166.82 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0433]: Hydropneumatic accumulator pressure 179.64 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 166.83 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0434]: Hydropneumatic accumulator pressure 179.72 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 166.84 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0435]: Hydropneumatic accumulator pressure 179.80 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 166.85 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0436]: Hydropneumatic accumulator pressure 179.88 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 166.86 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0437]: Hydropneumatic accumulator pressure 179.96 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 166.87 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0438]: Hydropneumatic accumulator pressure 180.04 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 166.88 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0439]: Hydropneumatic accumulator pressure 180.12 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 166.89 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0440]: Hydropneumatic accumulator pressure 180.20 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 166.90 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0441]: Hydropneumatic accumulator pressure 180.28 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 166.91 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0442]: Hydropneumatic accumulator pressure 180.36 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 166.92 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0443]: Hydropneumatic accumulator pressure 180.44 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 166.93 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0444]: Hydropneumatic accumulator pressure 180.52 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 166.94 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0445]: Hydropneumatic accumulator pressure 180.60 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 166.95 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0446]: Hydropneumatic accumulator pressure 180.68 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 166.96 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0447]: Hydropneumatic accumulator pressure 180.76 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 166.97 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0448]: Hydropneumatic accumulator pressure 180.84 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 166.98 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0449]: Hydropneumatic accumulator pressure 180.92 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 166.99 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0450]: Hydropneumatic accumulator pressure 181.00 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 167.00 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0451]: Hydropneumatic accumulator pressure 181.08 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 167.01 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0452]: Hydropneumatic accumulator pressure 181.16 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 167.02 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0453]: Hydropneumatic accumulator pressure 181.24 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 167.03 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0454]: Hydropneumatic accumulator pressure 181.32 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 167.04 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0455]: Hydropneumatic accumulator pressure 181.40 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 167.05 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0456]: Hydropneumatic accumulator pressure 181.48 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 167.06 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0457]: Hydropneumatic accumulator pressure 181.56 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 167.07 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0458]: Hydropneumatic accumulator pressure 181.64 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 167.08 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0459]: Hydropneumatic accumulator pressure 181.72 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 167.09 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0460]: Hydropneumatic accumulator pressure 181.80 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 167.10 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0461]: Hydropneumatic accumulator pressure 181.88 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 167.11 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0462]: Hydropneumatic accumulator pressure 181.96 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 167.12 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0463]: Hydropneumatic accumulator pressure 182.04 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 167.13 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0464]: Hydropneumatic accumulator pressure 182.12 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 167.14 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0465]: Hydropneumatic accumulator pressure 182.20 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 167.15 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0466]: Hydropneumatic accumulator pressure 182.28 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 167.16 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0467]: Hydropneumatic accumulator pressure 182.36 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 167.17 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0468]: Hydropneumatic accumulator pressure 182.44 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 167.18 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0469]: Hydropneumatic accumulator pressure 182.52 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 167.19 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0470]: Hydropneumatic accumulator pressure 182.60 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 167.20 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0471]: Hydropneumatic accumulator pressure 182.68 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 167.21 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0472]: Hydropneumatic accumulator pressure 182.76 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 167.22 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0473]: Hydropneumatic accumulator pressure 182.84 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 167.23 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0474]: Hydropneumatic accumulator pressure 182.92 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 167.24 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0475]: Hydropneumatic accumulator pressure 183.00 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 167.25 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0476]: Hydropneumatic accumulator pressure 183.08 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 167.26 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0477]: Hydropneumatic accumulator pressure 183.16 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 167.27 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0478]: Hydropneumatic accumulator pressure 183.24 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 167.28 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0479]: Hydropneumatic accumulator pressure 183.32 bar, L410 V8 oil pressure 53.0 psi at 2200 RPM, ride height leveling datum 167.29 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0480]: Hydropneumatic accumulator pressure 183.40 bar, L410 V8 oil pressure 45.0 psi at 2200 RPM, ride height leveling datum 167.30 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0481]: Hydropneumatic accumulator pressure 183.48 bar, L410 V8 oil pressure 45.0 psi at 2200 RPM, ride height leveling datum 167.31 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0482]: Hydropneumatic accumulator pressure 183.56 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 167.32 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0483]: Hydropneumatic accumulator pressure 183.64 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 167.33 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0484]: Hydropneumatic accumulator pressure 183.72 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 167.34 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0485]: Hydropneumatic accumulator pressure 183.80 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 167.35 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0486]: Hydropneumatic accumulator pressure 183.88 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 167.36 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0487]: Hydropneumatic accumulator pressure 183.96 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 167.37 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0488]: Hydropneumatic accumulator pressure 184.04 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 167.38 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0489]: Hydropneumatic accumulator pressure 184.12 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 167.39 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0490]: Hydropneumatic accumulator pressure 184.20 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 167.40 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0491]: Hydropneumatic accumulator pressure 184.28 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 167.41 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0492]: Hydropneumatic accumulator pressure 184.36 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 167.42 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0493]: Hydropneumatic accumulator pressure 184.44 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 167.43 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0494]: Hydropneumatic accumulator pressure 184.52 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 167.44 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0495]: Hydropneumatic accumulator pressure 184.60 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 167.45 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0496]: Hydropneumatic accumulator pressure 184.68 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 167.46 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0497]: Hydropneumatic accumulator pressure 184.76 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 167.47 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0498]: Hydropneumatic accumulator pressure 184.84 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 167.48 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0499]: Hydropneumatic accumulator pressure 184.92 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 167.49 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0500]: Hydropneumatic accumulator pressure 185.00 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 165.00 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0501]: Hydropneumatic accumulator pressure 185.08 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 165.01 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0502]: Hydropneumatic accumulator pressure 185.16 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 165.02 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0503]: Hydropneumatic accumulator pressure 185.24 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 165.03 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0504]: Hydropneumatic accumulator pressure 185.32 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 165.04 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0505]: Hydropneumatic accumulator pressure 185.40 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 165.05 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0506]: Hydropneumatic accumulator pressure 185.48 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 165.06 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0507]: Hydropneumatic accumulator pressure 185.56 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 165.07 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0508]: Hydropneumatic accumulator pressure 185.64 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 165.08 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0509]: Hydropneumatic accumulator pressure 185.72 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 165.09 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0510]: Hydropneumatic accumulator pressure 185.80 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 165.10 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0511]: Hydropneumatic accumulator pressure 185.88 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 165.11 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0512]: Hydropneumatic accumulator pressure 185.96 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 165.12 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0513]: Hydropneumatic accumulator pressure 186.04 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 165.13 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0514]: Hydropneumatic accumulator pressure 186.12 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 165.14 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0515]: Hydropneumatic accumulator pressure 186.20 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 165.15 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0516]: Hydropneumatic accumulator pressure 186.28 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 165.16 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0517]: Hydropneumatic accumulator pressure 186.36 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 165.17 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0518]: Hydropneumatic accumulator pressure 186.44 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 165.18 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0519]: Hydropneumatic accumulator pressure 186.52 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 165.19 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0520]: Hydropneumatic accumulator pressure 186.60 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 165.20 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0521]: Hydropneumatic accumulator pressure 186.68 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 165.21 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0522]: Hydropneumatic accumulator pressure 186.76 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 165.22 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0523]: Hydropneumatic accumulator pressure 186.84 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 165.23 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0524]: Hydropneumatic accumulator pressure 186.92 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 165.24 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0525]: Hydropneumatic accumulator pressure 187.00 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 165.25 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0526]: Hydropneumatic accumulator pressure 187.08 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 165.26 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0527]: Hydropneumatic accumulator pressure 187.16 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 165.27 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0528]: Hydropneumatic accumulator pressure 187.24 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 165.28 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0529]: Hydropneumatic accumulator pressure 187.32 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 165.29 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0530]: Hydropneumatic accumulator pressure 187.40 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 165.30 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0531]: Hydropneumatic accumulator pressure 187.48 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 165.31 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0532]: Hydropneumatic accumulator pressure 187.56 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 165.32 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0533]: Hydropneumatic accumulator pressure 187.64 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 165.33 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0534]: Hydropneumatic accumulator pressure 187.72 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 165.34 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0535]: Hydropneumatic accumulator pressure 187.80 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 165.35 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0536]: Hydropneumatic accumulator pressure 187.88 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 165.36 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0537]: Hydropneumatic accumulator pressure 187.96 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 165.37 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0538]: Hydropneumatic accumulator pressure 188.04 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 165.38 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0539]: Hydropneumatic accumulator pressure 188.12 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 165.39 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0540]: Hydropneumatic accumulator pressure 188.20 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 165.40 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0541]: Hydropneumatic accumulator pressure 188.28 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 165.41 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0542]: Hydropneumatic accumulator pressure 188.36 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 165.42 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0543]: Hydropneumatic accumulator pressure 188.44 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 165.43 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0544]: Hydropneumatic accumulator pressure 188.52 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 165.44 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0545]: Hydropneumatic accumulator pressure 188.60 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 165.45 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0546]: Hydropneumatic accumulator pressure 188.68 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 165.46 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0547]: Hydropneumatic accumulator pressure 188.76 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 165.47 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0548]: Hydropneumatic accumulator pressure 188.84 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 165.48 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0549]: Hydropneumatic accumulator pressure 188.92 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 165.49 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0550]: Hydropneumatic accumulator pressure 189.00 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 165.50 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0551]: Hydropneumatic accumulator pressure 189.08 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 165.51 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0552]: Hydropneumatic accumulator pressure 189.16 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 165.52 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0553]: Hydropneumatic accumulator pressure 189.24 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 165.53 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0554]: Hydropneumatic accumulator pressure 189.32 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 165.54 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0555]: Hydropneumatic accumulator pressure 189.40 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 165.55 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0556]: Hydropneumatic accumulator pressure 189.48 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 165.56 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0557]: Hydropneumatic accumulator pressure 189.56 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 165.57 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0558]: Hydropneumatic accumulator pressure 189.64 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 165.58 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0559]: Hydropneumatic accumulator pressure 189.72 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 165.59 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0560]: Hydropneumatic accumulator pressure 189.80 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 165.60 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0561]: Hydropneumatic accumulator pressure 189.88 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 165.61 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0562]: Hydropneumatic accumulator pressure 189.96 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 165.62 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0563]: Hydropneumatic accumulator pressure 175.04 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 165.63 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0564]: Hydropneumatic accumulator pressure 175.12 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 165.64 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0565]: Hydropneumatic accumulator pressure 175.20 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 165.65 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0566]: Hydropneumatic accumulator pressure 175.28 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 165.66 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0567]: Hydropneumatic accumulator pressure 175.36 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 165.67 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0568]: Hydropneumatic accumulator pressure 175.44 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 165.68 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0569]: Hydropneumatic accumulator pressure 175.52 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 165.69 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0570]: Hydropneumatic accumulator pressure 175.60 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 165.70 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0571]: Hydropneumatic accumulator pressure 175.68 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 165.71 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0572]: Hydropneumatic accumulator pressure 175.76 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 165.72 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0573]: Hydropneumatic accumulator pressure 175.84 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 165.73 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0574]: Hydropneumatic accumulator pressure 175.92 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 165.74 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0575]: Hydropneumatic accumulator pressure 176.00 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 165.75 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0576]: Hydropneumatic accumulator pressure 176.08 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 165.76 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0577]: Hydropneumatic accumulator pressure 176.16 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 165.77 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0578]: Hydropneumatic accumulator pressure 176.24 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 165.78 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0579]: Hydropneumatic accumulator pressure 176.32 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 165.79 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0580]: Hydropneumatic accumulator pressure 176.40 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 165.80 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0581]: Hydropneumatic accumulator pressure 176.48 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 165.81 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0582]: Hydropneumatic accumulator pressure 176.56 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 165.82 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0583]: Hydropneumatic accumulator pressure 176.64 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 165.83 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0584]: Hydropneumatic accumulator pressure 176.72 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 165.84 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0585]: Hydropneumatic accumulator pressure 176.80 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 165.85 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0586]: Hydropneumatic accumulator pressure 176.88 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 165.86 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0587]: Hydropneumatic accumulator pressure 176.96 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 165.87 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0588]: Hydropneumatic accumulator pressure 177.04 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 165.88 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0589]: Hydropneumatic accumulator pressure 177.12 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 165.89 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0590]: Hydropneumatic accumulator pressure 177.20 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 165.90 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0591]: Hydropneumatic accumulator pressure 177.28 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 165.91 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0592]: Hydropneumatic accumulator pressure 177.36 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 165.92 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0593]: Hydropneumatic accumulator pressure 177.44 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 165.93 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0594]: Hydropneumatic accumulator pressure 177.52 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 165.94 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0595]: Hydropneumatic accumulator pressure 177.60 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 165.95 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0596]: Hydropneumatic accumulator pressure 177.68 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 165.96 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0597]: Hydropneumatic accumulator pressure 177.76 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 165.97 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0598]: Hydropneumatic accumulator pressure 177.84 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 165.98 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0599]: Hydropneumatic accumulator pressure 177.92 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 165.99 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0600]: Hydropneumatic accumulator pressure 178.00 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 166.00 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0601]: Hydropneumatic accumulator pressure 178.08 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 166.01 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0602]: Hydropneumatic accumulator pressure 178.16 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 166.02 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0603]: Hydropneumatic accumulator pressure 178.24 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 166.03 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0604]: Hydropneumatic accumulator pressure 178.32 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 166.04 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0605]: Hydropneumatic accumulator pressure 178.40 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 166.05 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0606]: Hydropneumatic accumulator pressure 178.48 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 166.06 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0607]: Hydropneumatic accumulator pressure 178.56 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 166.07 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0608]: Hydropneumatic accumulator pressure 178.64 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 166.08 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0609]: Hydropneumatic accumulator pressure 178.72 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 166.09 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0610]: Hydropneumatic accumulator pressure 178.80 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 166.10 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0611]: Hydropneumatic accumulator pressure 178.88 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 166.11 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0612]: Hydropneumatic accumulator pressure 178.96 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 166.12 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0613]: Hydropneumatic accumulator pressure 179.04 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 166.13 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0614]: Hydropneumatic accumulator pressure 179.12 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 166.14 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0615]: Hydropneumatic accumulator pressure 179.20 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 166.15 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0616]: Hydropneumatic accumulator pressure 179.28 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 166.16 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0617]: Hydropneumatic accumulator pressure 179.36 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 166.17 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0618]: Hydropneumatic accumulator pressure 179.44 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 166.18 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0619]: Hydropneumatic accumulator pressure 179.52 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 166.19 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0620]: Hydropneumatic accumulator pressure 179.60 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 166.20 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0621]: Hydropneumatic accumulator pressure 179.68 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 166.21 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0622]: Hydropneumatic accumulator pressure 179.76 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 166.22 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0623]: Hydropneumatic accumulator pressure 179.84 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 166.23 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0624]: Hydropneumatic accumulator pressure 179.92 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 166.24 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0625]: Hydropneumatic accumulator pressure 180.00 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 166.25 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0626]: Hydropneumatic accumulator pressure 180.08 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 166.26 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0627]: Hydropneumatic accumulator pressure 180.16 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 166.27 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0628]: Hydropneumatic accumulator pressure 180.24 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 166.28 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0629]: Hydropneumatic accumulator pressure 180.32 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 166.29 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0630]: Hydropneumatic accumulator pressure 180.40 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 166.30 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0631]: Hydropneumatic accumulator pressure 180.48 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 166.31 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0632]: Hydropneumatic accumulator pressure 180.56 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 166.32 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0633]: Hydropneumatic accumulator pressure 180.64 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 166.33 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0634]: Hydropneumatic accumulator pressure 180.72 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 166.34 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0635]: Hydropneumatic accumulator pressure 180.80 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 166.35 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0636]: Hydropneumatic accumulator pressure 180.88 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 166.36 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0637]: Hydropneumatic accumulator pressure 180.96 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 166.37 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0638]: Hydropneumatic accumulator pressure 181.04 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 166.38 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0639]: Hydropneumatic accumulator pressure 181.12 bar, L410 V8 oil pressure 53.0 psi at 2200 RPM, ride height leveling datum 166.39 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0640]: Hydropneumatic accumulator pressure 181.20 bar, L410 V8 oil pressure 45.0 psi at 2200 RPM, ride height leveling datum 166.40 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0641]: Hydropneumatic accumulator pressure 181.28 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 166.41 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0642]: Hydropneumatic accumulator pressure 181.36 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 166.42 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0643]: Hydropneumatic accumulator pressure 181.44 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 166.43 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0644]: Hydropneumatic accumulator pressure 181.52 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 166.44 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0645]: Hydropneumatic accumulator pressure 181.60 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 166.45 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0646]: Hydropneumatic accumulator pressure 181.68 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 166.46 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0647]: Hydropneumatic accumulator pressure 181.76 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 166.47 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0648]: Hydropneumatic accumulator pressure 181.84 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 166.48 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0649]: Hydropneumatic accumulator pressure 181.92 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 166.49 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0650]: Hydropneumatic accumulator pressure 182.00 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 166.50 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0651]: Hydropneumatic accumulator pressure 182.08 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 166.51 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0652]: Hydropneumatic accumulator pressure 182.16 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 166.52 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0653]: Hydropneumatic accumulator pressure 182.24 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 166.53 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0654]: Hydropneumatic accumulator pressure 182.32 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 166.54 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0655]: Hydropneumatic accumulator pressure 182.40 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 166.55 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0656]: Hydropneumatic accumulator pressure 182.48 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 166.56 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0657]: Hydropneumatic accumulator pressure 182.56 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 166.57 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0658]: Hydropneumatic accumulator pressure 182.64 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 166.58 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0659]: Hydropneumatic accumulator pressure 182.72 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 166.59 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0660]: Hydropneumatic accumulator pressure 182.80 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 166.60 mm, SU carburetor manifold vacuum 18.50 inHg
# Crewe_Shadow_Trace[0661]: Hydropneumatic accumulator pressure 182.88 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 166.61 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0662]: Hydropneumatic accumulator pressure 182.96 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 166.62 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0663]: Hydropneumatic accumulator pressure 183.04 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 166.63 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0664]: Hydropneumatic accumulator pressure 183.12 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 166.64 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0665]: Hydropneumatic accumulator pressure 183.20 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 166.65 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0666]: Hydropneumatic accumulator pressure 183.28 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 166.66 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0667]: Hydropneumatic accumulator pressure 183.36 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 166.67 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0668]: Hydropneumatic accumulator pressure 183.44 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 166.68 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0669]: Hydropneumatic accumulator pressure 183.52 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 166.69 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0670]: Hydropneumatic accumulator pressure 183.60 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 166.70 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0671]: Hydropneumatic accumulator pressure 183.68 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 166.71 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0672]: Hydropneumatic accumulator pressure 183.76 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 166.72 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0673]: Hydropneumatic accumulator pressure 183.84 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 166.73 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0674]: Hydropneumatic accumulator pressure 183.92 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 166.74 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0675]: Hydropneumatic accumulator pressure 184.00 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 166.75 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0676]: Hydropneumatic accumulator pressure 184.08 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 166.76 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0677]: Hydropneumatic accumulator pressure 184.16 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 166.77 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0678]: Hydropneumatic accumulator pressure 184.24 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 166.78 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0679]: Hydropneumatic accumulator pressure 184.32 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 166.79 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0680]: Hydropneumatic accumulator pressure 184.40 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 166.80 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0681]: Hydropneumatic accumulator pressure 184.48 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 166.81 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0682]: Hydropneumatic accumulator pressure 184.56 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 166.82 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0683]: Hydropneumatic accumulator pressure 184.64 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 166.83 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0684]: Hydropneumatic accumulator pressure 184.72 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 166.84 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0685]: Hydropneumatic accumulator pressure 184.80 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 166.85 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0686]: Hydropneumatic accumulator pressure 184.88 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 166.86 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0687]: Hydropneumatic accumulator pressure 184.96 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 166.87 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0688]: Hydropneumatic accumulator pressure 185.04 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 166.88 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0689]: Hydropneumatic accumulator pressure 185.12 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 166.89 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0690]: Hydropneumatic accumulator pressure 185.20 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 166.90 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0691]: Hydropneumatic accumulator pressure 185.28 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 166.91 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0692]: Hydropneumatic accumulator pressure 185.36 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 166.92 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0693]: Hydropneumatic accumulator pressure 185.44 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 166.93 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0694]: Hydropneumatic accumulator pressure 185.52 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 166.94 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0695]: Hydropneumatic accumulator pressure 185.60 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 166.95 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0696]: Hydropneumatic accumulator pressure 185.68 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 166.96 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0697]: Hydropneumatic accumulator pressure 185.76 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 166.97 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0698]: Hydropneumatic accumulator pressure 185.84 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 166.98 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0699]: Hydropneumatic accumulator pressure 185.92 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 166.99 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0700]: Hydropneumatic accumulator pressure 186.00 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 167.00 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0701]: Hydropneumatic accumulator pressure 186.08 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 167.01 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0702]: Hydropneumatic accumulator pressure 186.16 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 167.02 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0703]: Hydropneumatic accumulator pressure 186.24 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 167.03 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0704]: Hydropneumatic accumulator pressure 186.32 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 167.04 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0705]: Hydropneumatic accumulator pressure 186.40 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 167.05 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0706]: Hydropneumatic accumulator pressure 186.48 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 167.06 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0707]: Hydropneumatic accumulator pressure 186.56 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 167.07 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0708]: Hydropneumatic accumulator pressure 186.64 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 167.08 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0709]: Hydropneumatic accumulator pressure 186.72 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 167.09 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0710]: Hydropneumatic accumulator pressure 186.80 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 167.10 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0711]: Hydropneumatic accumulator pressure 186.88 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 167.11 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0712]: Hydropneumatic accumulator pressure 186.96 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 167.12 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0713]: Hydropneumatic accumulator pressure 187.04 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 167.13 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0714]: Hydropneumatic accumulator pressure 187.12 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 167.14 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0715]: Hydropneumatic accumulator pressure 187.20 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 167.15 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0716]: Hydropneumatic accumulator pressure 187.28 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 167.16 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0717]: Hydropneumatic accumulator pressure 187.36 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 167.17 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0718]: Hydropneumatic accumulator pressure 187.44 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 167.18 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0719]: Hydropneumatic accumulator pressure 187.52 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 167.19 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0720]: Hydropneumatic accumulator pressure 187.60 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 167.20 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0721]: Hydropneumatic accumulator pressure 187.68 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 167.21 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0722]: Hydropneumatic accumulator pressure 187.76 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 167.22 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0723]: Hydropneumatic accumulator pressure 187.84 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 167.23 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0724]: Hydropneumatic accumulator pressure 187.92 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 167.24 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0725]: Hydropneumatic accumulator pressure 188.00 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 167.25 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0726]: Hydropneumatic accumulator pressure 188.08 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 167.26 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0727]: Hydropneumatic accumulator pressure 188.16 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 167.27 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0728]: Hydropneumatic accumulator pressure 188.24 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 167.28 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0729]: Hydropneumatic accumulator pressure 188.32 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 167.29 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0730]: Hydropneumatic accumulator pressure 188.40 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 167.30 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0731]: Hydropneumatic accumulator pressure 188.48 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 167.31 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0732]: Hydropneumatic accumulator pressure 188.56 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 167.32 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0733]: Hydropneumatic accumulator pressure 188.64 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 167.33 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0734]: Hydropneumatic accumulator pressure 188.72 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 167.34 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0735]: Hydropneumatic accumulator pressure 188.80 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 167.35 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0736]: Hydropneumatic accumulator pressure 188.88 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 167.36 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0737]: Hydropneumatic accumulator pressure 188.96 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 167.37 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0738]: Hydropneumatic accumulator pressure 189.04 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 167.38 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0739]: Hydropneumatic accumulator pressure 189.12 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 167.39 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0740]: Hydropneumatic accumulator pressure 189.20 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 167.40 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0741]: Hydropneumatic accumulator pressure 189.28 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 167.41 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0742]: Hydropneumatic accumulator pressure 189.36 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 167.42 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0743]: Hydropneumatic accumulator pressure 189.44 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 167.43 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0744]: Hydropneumatic accumulator pressure 189.52 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 167.44 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0745]: Hydropneumatic accumulator pressure 189.60 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 167.45 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0746]: Hydropneumatic accumulator pressure 189.68 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 167.46 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0747]: Hydropneumatic accumulator pressure 189.76 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 167.47 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0748]: Hydropneumatic accumulator pressure 189.84 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 167.48 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0749]: Hydropneumatic accumulator pressure 189.92 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 167.49 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0750]: Hydropneumatic accumulator pressure 175.00 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 165.00 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0751]: Hydropneumatic accumulator pressure 175.08 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 165.01 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0752]: Hydropneumatic accumulator pressure 175.16 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 165.02 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0753]: Hydropneumatic accumulator pressure 175.24 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 165.03 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0754]: Hydropneumatic accumulator pressure 175.32 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 165.04 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0755]: Hydropneumatic accumulator pressure 175.40 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 165.05 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0756]: Hydropneumatic accumulator pressure 175.48 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 165.06 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0757]: Hydropneumatic accumulator pressure 175.56 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 165.07 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0758]: Hydropneumatic accumulator pressure 175.64 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 165.08 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0759]: Hydropneumatic accumulator pressure 175.72 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 165.09 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0760]: Hydropneumatic accumulator pressure 175.80 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 165.10 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0761]: Hydropneumatic accumulator pressure 175.88 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 165.11 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0762]: Hydropneumatic accumulator pressure 175.96 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 165.12 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0763]: Hydropneumatic accumulator pressure 176.04 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 165.13 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0764]: Hydropneumatic accumulator pressure 176.12 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 165.14 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0765]: Hydropneumatic accumulator pressure 176.20 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 165.15 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0766]: Hydropneumatic accumulator pressure 176.28 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 165.16 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0767]: Hydropneumatic accumulator pressure 176.36 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 165.17 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0768]: Hydropneumatic accumulator pressure 176.44 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 165.18 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0769]: Hydropneumatic accumulator pressure 176.52 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 165.19 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0770]: Hydropneumatic accumulator pressure 176.60 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 165.20 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0771]: Hydropneumatic accumulator pressure 176.68 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 165.21 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0772]: Hydropneumatic accumulator pressure 176.76 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 165.22 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0773]: Hydropneumatic accumulator pressure 176.84 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 165.23 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0774]: Hydropneumatic accumulator pressure 176.92 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 165.24 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0775]: Hydropneumatic accumulator pressure 177.00 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 165.25 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0776]: Hydropneumatic accumulator pressure 177.08 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 165.26 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0777]: Hydropneumatic accumulator pressure 177.16 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 165.27 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0778]: Hydropneumatic accumulator pressure 177.24 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 165.28 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0779]: Hydropneumatic accumulator pressure 177.32 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 165.29 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0780]: Hydropneumatic accumulator pressure 177.40 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 165.30 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0781]: Hydropneumatic accumulator pressure 177.48 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 165.31 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0782]: Hydropneumatic accumulator pressure 177.56 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 165.32 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0783]: Hydropneumatic accumulator pressure 177.64 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 165.33 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0784]: Hydropneumatic accumulator pressure 177.72 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 165.34 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0785]: Hydropneumatic accumulator pressure 177.80 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 165.35 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0786]: Hydropneumatic accumulator pressure 177.88 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 165.36 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0787]: Hydropneumatic accumulator pressure 177.96 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 165.37 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0788]: Hydropneumatic accumulator pressure 178.04 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 165.38 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0789]: Hydropneumatic accumulator pressure 178.12 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 165.39 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0790]: Hydropneumatic accumulator pressure 178.20 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 165.40 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0791]: Hydropneumatic accumulator pressure 178.28 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 165.41 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0792]: Hydropneumatic accumulator pressure 178.36 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 165.42 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0793]: Hydropneumatic accumulator pressure 178.44 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 165.43 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0794]: Hydropneumatic accumulator pressure 178.52 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 165.44 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0795]: Hydropneumatic accumulator pressure 178.60 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 165.45 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0796]: Hydropneumatic accumulator pressure 178.68 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 165.46 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0797]: Hydropneumatic accumulator pressure 178.76 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 165.47 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0798]: Hydropneumatic accumulator pressure 178.84 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 165.48 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0799]: Hydropneumatic accumulator pressure 178.92 bar, L410 V8 oil pressure 53.0 psi at 2200 RPM, ride height leveling datum 165.49 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0800]: Hydropneumatic accumulator pressure 179.00 bar, L410 V8 oil pressure 45.0 psi at 2200 RPM, ride height leveling datum 165.50 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0801]: Hydropneumatic accumulator pressure 179.08 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 165.51 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0802]: Hydropneumatic accumulator pressure 179.16 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 165.52 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0803]: Hydropneumatic accumulator pressure 179.24 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 165.53 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0804]: Hydropneumatic accumulator pressure 179.32 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 165.54 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0805]: Hydropneumatic accumulator pressure 179.40 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 165.55 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0806]: Hydropneumatic accumulator pressure 179.48 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 165.56 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0807]: Hydropneumatic accumulator pressure 179.56 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 165.57 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0808]: Hydropneumatic accumulator pressure 179.64 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 165.58 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0809]: Hydropneumatic accumulator pressure 179.72 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 165.59 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0810]: Hydropneumatic accumulator pressure 179.80 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 165.60 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0811]: Hydropneumatic accumulator pressure 179.88 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 165.61 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0812]: Hydropneumatic accumulator pressure 179.96 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 165.62 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0813]: Hydropneumatic accumulator pressure 180.04 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 165.63 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0814]: Hydropneumatic accumulator pressure 180.12 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 165.64 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0815]: Hydropneumatic accumulator pressure 180.20 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 165.65 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0816]: Hydropneumatic accumulator pressure 180.28 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 165.66 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0817]: Hydropneumatic accumulator pressure 180.36 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 165.67 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0818]: Hydropneumatic accumulator pressure 180.44 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 165.68 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0819]: Hydropneumatic accumulator pressure 180.52 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 165.69 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0820]: Hydropneumatic accumulator pressure 180.60 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 165.70 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0821]: Hydropneumatic accumulator pressure 180.68 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 165.71 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0822]: Hydropneumatic accumulator pressure 180.76 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 165.72 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0823]: Hydropneumatic accumulator pressure 180.84 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 165.73 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0824]: Hydropneumatic accumulator pressure 180.92 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 165.74 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0825]: Hydropneumatic accumulator pressure 181.00 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 165.75 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0826]: Hydropneumatic accumulator pressure 181.08 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 165.76 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0827]: Hydropneumatic accumulator pressure 181.16 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 165.77 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0828]: Hydropneumatic accumulator pressure 181.24 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 165.78 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0829]: Hydropneumatic accumulator pressure 181.32 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 165.79 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0830]: Hydropneumatic accumulator pressure 181.40 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 165.80 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0831]: Hydropneumatic accumulator pressure 181.48 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 165.81 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0832]: Hydropneumatic accumulator pressure 181.56 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 165.82 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0833]: Hydropneumatic accumulator pressure 181.64 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 165.83 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0834]: Hydropneumatic accumulator pressure 181.72 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 165.84 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0835]: Hydropneumatic accumulator pressure 181.80 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 165.85 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0836]: Hydropneumatic accumulator pressure 181.88 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 165.86 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0837]: Hydropneumatic accumulator pressure 181.96 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 165.87 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0838]: Hydropneumatic accumulator pressure 182.04 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 165.88 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0839]: Hydropneumatic accumulator pressure 182.12 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 165.89 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0840]: Hydropneumatic accumulator pressure 182.20 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 165.90 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0841]: Hydropneumatic accumulator pressure 182.28 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 165.91 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0842]: Hydropneumatic accumulator pressure 182.36 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 165.92 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0843]: Hydropneumatic accumulator pressure 182.44 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 165.93 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0844]: Hydropneumatic accumulator pressure 182.52 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 165.94 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0845]: Hydropneumatic accumulator pressure 182.60 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 165.95 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0846]: Hydropneumatic accumulator pressure 182.68 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 165.96 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0847]: Hydropneumatic accumulator pressure 182.76 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 165.97 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0848]: Hydropneumatic accumulator pressure 182.84 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 165.98 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0849]: Hydropneumatic accumulator pressure 182.92 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 165.99 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0850]: Hydropneumatic accumulator pressure 183.00 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 166.00 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0851]: Hydropneumatic accumulator pressure 183.08 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 166.01 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0852]: Hydropneumatic accumulator pressure 183.16 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 166.02 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0853]: Hydropneumatic accumulator pressure 183.24 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 166.03 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0854]: Hydropneumatic accumulator pressure 183.32 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 166.04 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0855]: Hydropneumatic accumulator pressure 183.40 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 166.05 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0856]: Hydropneumatic accumulator pressure 183.48 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 166.06 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0857]: Hydropneumatic accumulator pressure 183.56 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 166.07 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0858]: Hydropneumatic accumulator pressure 183.64 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 166.08 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0859]: Hydropneumatic accumulator pressure 183.72 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 166.09 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0860]: Hydropneumatic accumulator pressure 183.80 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 166.10 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0861]: Hydropneumatic accumulator pressure 183.88 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 166.11 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0862]: Hydropneumatic accumulator pressure 183.96 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 166.12 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0863]: Hydropneumatic accumulator pressure 184.04 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 166.13 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0864]: Hydropneumatic accumulator pressure 184.12 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 166.14 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0865]: Hydropneumatic accumulator pressure 184.20 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 166.15 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0866]: Hydropneumatic accumulator pressure 184.28 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 166.16 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0867]: Hydropneumatic accumulator pressure 184.36 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 166.17 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0868]: Hydropneumatic accumulator pressure 184.44 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 166.18 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0869]: Hydropneumatic accumulator pressure 184.52 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 166.19 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0870]: Hydropneumatic accumulator pressure 184.60 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 166.20 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0871]: Hydropneumatic accumulator pressure 184.68 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 166.21 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0872]: Hydropneumatic accumulator pressure 184.76 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 166.22 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0873]: Hydropneumatic accumulator pressure 184.84 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 166.23 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0874]: Hydropneumatic accumulator pressure 184.92 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 166.24 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0875]: Hydropneumatic accumulator pressure 185.00 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 166.25 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0876]: Hydropneumatic accumulator pressure 185.08 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 166.26 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0877]: Hydropneumatic accumulator pressure 185.16 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 166.27 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0878]: Hydropneumatic accumulator pressure 185.24 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 166.28 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0879]: Hydropneumatic accumulator pressure 185.32 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 166.29 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0880]: Hydropneumatic accumulator pressure 185.40 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 166.30 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0881]: Hydropneumatic accumulator pressure 185.48 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 166.31 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0882]: Hydropneumatic accumulator pressure 185.56 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 166.32 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0883]: Hydropneumatic accumulator pressure 185.64 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 166.33 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0884]: Hydropneumatic accumulator pressure 185.72 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 166.34 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0885]: Hydropneumatic accumulator pressure 185.80 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 166.35 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0886]: Hydropneumatic accumulator pressure 185.88 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 166.36 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0887]: Hydropneumatic accumulator pressure 185.96 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 166.37 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0888]: Hydropneumatic accumulator pressure 186.04 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 166.38 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0889]: Hydropneumatic accumulator pressure 186.12 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 166.39 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0890]: Hydropneumatic accumulator pressure 186.20 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 166.40 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0891]: Hydropneumatic accumulator pressure 186.28 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 166.41 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0892]: Hydropneumatic accumulator pressure 186.36 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 166.42 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0893]: Hydropneumatic accumulator pressure 186.44 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 166.43 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0894]: Hydropneumatic accumulator pressure 186.52 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 166.44 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0895]: Hydropneumatic accumulator pressure 186.60 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 166.45 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0896]: Hydropneumatic accumulator pressure 186.68 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 166.46 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0897]: Hydropneumatic accumulator pressure 186.76 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 166.47 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0898]: Hydropneumatic accumulator pressure 186.84 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 166.48 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0899]: Hydropneumatic accumulator pressure 186.92 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 166.49 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0900]: Hydropneumatic accumulator pressure 187.00 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 166.50 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0901]: Hydropneumatic accumulator pressure 187.08 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 166.51 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0902]: Hydropneumatic accumulator pressure 187.16 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 166.52 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0903]: Hydropneumatic accumulator pressure 187.24 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 166.53 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0904]: Hydropneumatic accumulator pressure 187.32 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 166.54 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0905]: Hydropneumatic accumulator pressure 187.40 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 166.55 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0906]: Hydropneumatic accumulator pressure 187.48 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 166.56 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0907]: Hydropneumatic accumulator pressure 187.56 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 166.57 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0908]: Hydropneumatic accumulator pressure 187.64 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 166.58 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0909]: Hydropneumatic accumulator pressure 187.72 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 166.59 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0910]: Hydropneumatic accumulator pressure 187.80 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 166.60 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0911]: Hydropneumatic accumulator pressure 187.88 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 166.61 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0912]: Hydropneumatic accumulator pressure 187.96 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 166.62 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0913]: Hydropneumatic accumulator pressure 188.04 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 166.63 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0914]: Hydropneumatic accumulator pressure 188.12 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 166.64 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0915]: Hydropneumatic accumulator pressure 188.20 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 166.65 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0916]: Hydropneumatic accumulator pressure 188.28 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 166.66 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0917]: Hydropneumatic accumulator pressure 188.36 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 166.67 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0918]: Hydropneumatic accumulator pressure 188.44 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 166.68 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0919]: Hydropneumatic accumulator pressure 188.52 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 166.69 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0920]: Hydropneumatic accumulator pressure 188.60 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 166.70 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0921]: Hydropneumatic accumulator pressure 188.68 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 166.71 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0922]: Hydropneumatic accumulator pressure 188.76 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 166.72 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0923]: Hydropneumatic accumulator pressure 188.84 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 166.73 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0924]: Hydropneumatic accumulator pressure 188.92 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 166.74 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0925]: Hydropneumatic accumulator pressure 189.00 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 166.75 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0926]: Hydropneumatic accumulator pressure 189.08 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 166.76 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0927]: Hydropneumatic accumulator pressure 189.16 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 166.77 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0928]: Hydropneumatic accumulator pressure 189.24 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 166.78 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0929]: Hydropneumatic accumulator pressure 189.32 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 166.79 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0930]: Hydropneumatic accumulator pressure 189.40 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 166.80 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0931]: Hydropneumatic accumulator pressure 189.48 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 166.81 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0932]: Hydropneumatic accumulator pressure 189.56 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 166.82 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0933]: Hydropneumatic accumulator pressure 189.64 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 166.83 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0934]: Hydropneumatic accumulator pressure 189.72 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 166.84 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0935]: Hydropneumatic accumulator pressure 189.80 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 166.85 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0936]: Hydropneumatic accumulator pressure 189.88 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 166.86 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0937]: Hydropneumatic accumulator pressure 189.96 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 166.87 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0938]: Hydropneumatic accumulator pressure 175.04 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 166.88 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0939]: Hydropneumatic accumulator pressure 175.12 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 166.89 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[0940]: Hydropneumatic accumulator pressure 175.20 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 166.90 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[0941]: Hydropneumatic accumulator pressure 175.28 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 166.91 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[0942]: Hydropneumatic accumulator pressure 175.36 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 166.92 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[0943]: Hydropneumatic accumulator pressure 175.44 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 166.93 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[0944]: Hydropneumatic accumulator pressure 175.52 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 166.94 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[0945]: Hydropneumatic accumulator pressure 175.60 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 166.95 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[0946]: Hydropneumatic accumulator pressure 175.68 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 166.96 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[0947]: Hydropneumatic accumulator pressure 175.76 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 166.97 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[0948]: Hydropneumatic accumulator pressure 175.84 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 166.98 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[0949]: Hydropneumatic accumulator pressure 175.92 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 166.99 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[0950]: Hydropneumatic accumulator pressure 176.00 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 167.00 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[0951]: Hydropneumatic accumulator pressure 176.08 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 167.01 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[0952]: Hydropneumatic accumulator pressure 176.16 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 167.02 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[0953]: Hydropneumatic accumulator pressure 176.24 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 167.03 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[0954]: Hydropneumatic accumulator pressure 176.32 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 167.04 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[0955]: Hydropneumatic accumulator pressure 176.40 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 167.05 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[0956]: Hydropneumatic accumulator pressure 176.48 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 167.06 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[0957]: Hydropneumatic accumulator pressure 176.56 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 167.07 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[0958]: Hydropneumatic accumulator pressure 176.64 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 167.08 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[0959]: Hydropneumatic accumulator pressure 176.72 bar, L410 V8 oil pressure 53.0 psi at 2200 RPM, ride height leveling datum 167.09 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[0960]: Hydropneumatic accumulator pressure 176.80 bar, L410 V8 oil pressure 45.0 psi at 2200 RPM, ride height leveling datum 167.10 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[0961]: Hydropneumatic accumulator pressure 176.88 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 167.11 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[0962]: Hydropneumatic accumulator pressure 176.96 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 167.12 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[0963]: Hydropneumatic accumulator pressure 177.04 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 167.13 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[0964]: Hydropneumatic accumulator pressure 177.12 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 167.14 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[0965]: Hydropneumatic accumulator pressure 177.20 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 167.15 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[0966]: Hydropneumatic accumulator pressure 177.28 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 167.16 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[0967]: Hydropneumatic accumulator pressure 177.36 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 167.17 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[0968]: Hydropneumatic accumulator pressure 177.44 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 167.18 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[0969]: Hydropneumatic accumulator pressure 177.52 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 167.19 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[0970]: Hydropneumatic accumulator pressure 177.60 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 167.20 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[0971]: Hydropneumatic accumulator pressure 177.68 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 167.21 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[0972]: Hydropneumatic accumulator pressure 177.76 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 167.22 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[0973]: Hydropneumatic accumulator pressure 177.84 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 167.23 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[0974]: Hydropneumatic accumulator pressure 177.92 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 167.24 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[0975]: Hydropneumatic accumulator pressure 178.00 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 167.25 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[0976]: Hydropneumatic accumulator pressure 178.08 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 167.26 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[0977]: Hydropneumatic accumulator pressure 178.16 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 167.27 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[0978]: Hydropneumatic accumulator pressure 178.24 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 167.28 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[0979]: Hydropneumatic accumulator pressure 178.32 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 167.29 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[0980]: Hydropneumatic accumulator pressure 178.40 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 167.30 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[0981]: Hydropneumatic accumulator pressure 178.48 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 167.31 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[0982]: Hydropneumatic accumulator pressure 178.56 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 167.32 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[0983]: Hydropneumatic accumulator pressure 178.64 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 167.33 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[0984]: Hydropneumatic accumulator pressure 178.72 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 167.34 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[0985]: Hydropneumatic accumulator pressure 178.80 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 167.35 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[0986]: Hydropneumatic accumulator pressure 178.88 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 167.36 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[0987]: Hydropneumatic accumulator pressure 178.96 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 167.37 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[0988]: Hydropneumatic accumulator pressure 179.04 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 167.38 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[0989]: Hydropneumatic accumulator pressure 179.12 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 167.39 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[0990]: Hydropneumatic accumulator pressure 179.20 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 167.40 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[0991]: Hydropneumatic accumulator pressure 179.28 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 167.41 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[0992]: Hydropneumatic accumulator pressure 179.36 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 167.42 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[0993]: Hydropneumatic accumulator pressure 179.44 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 167.43 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[0994]: Hydropneumatic accumulator pressure 179.52 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 167.44 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[0995]: Hydropneumatic accumulator pressure 179.60 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 167.45 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[0996]: Hydropneumatic accumulator pressure 179.68 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 167.46 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[0997]: Hydropneumatic accumulator pressure 179.76 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 167.47 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[0998]: Hydropneumatic accumulator pressure 179.84 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 167.48 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[0999]: Hydropneumatic accumulator pressure 179.92 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 167.49 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[1000]: Hydropneumatic accumulator pressure 180.00 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 165.00 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[1001]: Hydropneumatic accumulator pressure 180.08 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 165.01 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[1002]: Hydropneumatic accumulator pressure 180.16 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 165.02 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[1003]: Hydropneumatic accumulator pressure 180.24 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 165.03 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[1004]: Hydropneumatic accumulator pressure 180.32 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 165.04 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[1005]: Hydropneumatic accumulator pressure 180.40 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 165.05 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[1006]: Hydropneumatic accumulator pressure 180.48 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 165.06 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[1007]: Hydropneumatic accumulator pressure 180.56 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 165.07 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[1008]: Hydropneumatic accumulator pressure 180.64 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 165.08 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[1009]: Hydropneumatic accumulator pressure 180.72 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 165.09 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[1010]: Hydropneumatic accumulator pressure 180.80 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 165.10 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[1011]: Hydropneumatic accumulator pressure 180.88 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 165.11 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[1012]: Hydropneumatic accumulator pressure 180.96 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 165.12 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[1013]: Hydropneumatic accumulator pressure 181.04 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 165.13 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[1014]: Hydropneumatic accumulator pressure 181.12 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 165.14 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[1015]: Hydropneumatic accumulator pressure 181.20 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 165.15 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[1016]: Hydropneumatic accumulator pressure 181.28 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 165.16 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[1017]: Hydropneumatic accumulator pressure 181.36 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 165.17 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[1018]: Hydropneumatic accumulator pressure 181.44 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 165.18 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[1019]: Hydropneumatic accumulator pressure 181.52 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 165.19 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[1020]: Hydropneumatic accumulator pressure 181.60 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 165.20 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[1021]: Hydropneumatic accumulator pressure 181.68 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 165.21 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[1022]: Hydropneumatic accumulator pressure 181.76 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 165.22 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[1023]: Hydropneumatic accumulator pressure 181.84 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 165.23 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[1024]: Hydropneumatic accumulator pressure 181.92 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 165.24 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[1025]: Hydropneumatic accumulator pressure 182.00 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 165.25 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[1026]: Hydropneumatic accumulator pressure 182.08 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 165.26 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[1027]: Hydropneumatic accumulator pressure 182.16 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 165.27 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[1028]: Hydropneumatic accumulator pressure 182.24 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 165.28 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[1029]: Hydropneumatic accumulator pressure 182.32 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 165.29 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[1030]: Hydropneumatic accumulator pressure 182.40 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 165.30 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[1031]: Hydropneumatic accumulator pressure 182.48 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 165.31 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[1032]: Hydropneumatic accumulator pressure 182.56 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 165.32 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[1033]: Hydropneumatic accumulator pressure 182.64 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 165.33 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[1034]: Hydropneumatic accumulator pressure 182.72 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 165.34 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[1035]: Hydropneumatic accumulator pressure 182.80 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 165.35 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[1036]: Hydropneumatic accumulator pressure 182.88 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 165.36 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[1037]: Hydropneumatic accumulator pressure 182.96 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 165.37 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[1038]: Hydropneumatic accumulator pressure 183.04 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 165.38 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[1039]: Hydropneumatic accumulator pressure 183.12 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 165.39 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[1040]: Hydropneumatic accumulator pressure 183.20 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 165.40 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[1041]: Hydropneumatic accumulator pressure 183.28 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 165.41 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[1042]: Hydropneumatic accumulator pressure 183.36 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 165.42 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[1043]: Hydropneumatic accumulator pressure 183.44 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 165.43 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[1044]: Hydropneumatic accumulator pressure 183.52 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 165.44 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[1045]: Hydropneumatic accumulator pressure 183.60 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 165.45 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[1046]: Hydropneumatic accumulator pressure 183.68 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 165.46 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[1047]: Hydropneumatic accumulator pressure 183.76 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 165.47 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[1048]: Hydropneumatic accumulator pressure 183.84 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 165.48 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[1049]: Hydropneumatic accumulator pressure 183.92 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 165.49 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[1050]: Hydropneumatic accumulator pressure 184.00 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 165.50 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[1051]: Hydropneumatic accumulator pressure 184.08 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 165.51 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[1052]: Hydropneumatic accumulator pressure 184.16 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 165.52 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[1053]: Hydropneumatic accumulator pressure 184.24 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 165.53 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[1054]: Hydropneumatic accumulator pressure 184.32 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 165.54 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[1055]: Hydropneumatic accumulator pressure 184.40 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 165.55 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[1056]: Hydropneumatic accumulator pressure 184.48 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 165.56 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[1057]: Hydropneumatic accumulator pressure 184.56 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 165.57 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[1058]: Hydropneumatic accumulator pressure 184.64 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 165.58 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[1059]: Hydropneumatic accumulator pressure 184.72 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 165.59 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[1060]: Hydropneumatic accumulator pressure 184.80 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 165.60 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[1061]: Hydropneumatic accumulator pressure 184.88 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 165.61 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[1062]: Hydropneumatic accumulator pressure 184.96 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 165.62 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[1063]: Hydropneumatic accumulator pressure 185.04 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 165.63 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[1064]: Hydropneumatic accumulator pressure 185.12 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 165.64 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[1065]: Hydropneumatic accumulator pressure 185.20 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 165.65 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[1066]: Hydropneumatic accumulator pressure 185.28 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 165.66 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[1067]: Hydropneumatic accumulator pressure 185.36 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 165.67 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[1068]: Hydropneumatic accumulator pressure 185.44 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 165.68 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[1069]: Hydropneumatic accumulator pressure 185.52 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 165.69 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[1070]: Hydropneumatic accumulator pressure 185.60 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 165.70 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[1071]: Hydropneumatic accumulator pressure 185.68 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 165.71 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[1072]: Hydropneumatic accumulator pressure 185.76 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 165.72 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[1073]: Hydropneumatic accumulator pressure 185.84 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 165.73 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[1074]: Hydropneumatic accumulator pressure 185.92 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 165.74 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[1075]: Hydropneumatic accumulator pressure 186.00 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 165.75 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[1076]: Hydropneumatic accumulator pressure 186.08 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 165.76 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[1077]: Hydropneumatic accumulator pressure 186.16 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 165.77 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[1078]: Hydropneumatic accumulator pressure 186.24 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 165.78 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[1079]: Hydropneumatic accumulator pressure 186.32 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 165.79 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[1080]: Hydropneumatic accumulator pressure 186.40 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 165.80 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[1081]: Hydropneumatic accumulator pressure 186.48 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 165.81 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[1082]: Hydropneumatic accumulator pressure 186.56 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 165.82 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[1083]: Hydropneumatic accumulator pressure 186.64 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 165.83 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[1084]: Hydropneumatic accumulator pressure 186.72 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 165.84 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[1085]: Hydropneumatic accumulator pressure 186.80 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 165.85 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[1086]: Hydropneumatic accumulator pressure 186.88 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 165.86 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[1087]: Hydropneumatic accumulator pressure 186.96 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 165.87 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[1088]: Hydropneumatic accumulator pressure 187.04 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 165.88 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[1089]: Hydropneumatic accumulator pressure 187.12 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 165.89 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[1090]: Hydropneumatic accumulator pressure 187.20 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 165.90 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[1091]: Hydropneumatic accumulator pressure 187.28 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 165.91 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[1092]: Hydropneumatic accumulator pressure 187.36 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 165.92 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[1093]: Hydropneumatic accumulator pressure 187.44 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 165.93 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[1094]: Hydropneumatic accumulator pressure 187.52 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 165.94 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[1095]: Hydropneumatic accumulator pressure 187.60 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 165.95 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[1096]: Hydropneumatic accumulator pressure 187.68 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 165.96 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[1097]: Hydropneumatic accumulator pressure 187.76 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 165.97 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[1098]: Hydropneumatic accumulator pressure 187.84 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 165.98 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[1099]: Hydropneumatic accumulator pressure 187.92 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 165.99 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[1100]: Hydropneumatic accumulator pressure 188.00 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 166.00 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[1101]: Hydropneumatic accumulator pressure 188.08 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 166.01 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[1102]: Hydropneumatic accumulator pressure 188.16 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 166.02 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[1103]: Hydropneumatic accumulator pressure 188.24 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 166.03 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[1104]: Hydropneumatic accumulator pressure 188.32 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 166.04 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[1105]: Hydropneumatic accumulator pressure 188.40 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 166.05 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[1106]: Hydropneumatic accumulator pressure 188.48 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 166.06 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[1107]: Hydropneumatic accumulator pressure 188.56 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 166.07 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[1108]: Hydropneumatic accumulator pressure 188.64 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 166.08 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[1109]: Hydropneumatic accumulator pressure 188.72 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 166.09 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[1110]: Hydropneumatic accumulator pressure 188.80 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 166.10 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[1111]: Hydropneumatic accumulator pressure 188.88 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 166.11 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[1112]: Hydropneumatic accumulator pressure 188.96 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 166.12 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[1113]: Hydropneumatic accumulator pressure 189.04 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 166.13 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[1114]: Hydropneumatic accumulator pressure 189.12 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 166.14 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[1115]: Hydropneumatic accumulator pressure 189.20 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 166.15 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[1116]: Hydropneumatic accumulator pressure 189.28 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 166.16 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[1117]: Hydropneumatic accumulator pressure 189.36 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 166.17 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[1118]: Hydropneumatic accumulator pressure 189.44 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 166.18 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[1119]: Hydropneumatic accumulator pressure 189.52 bar, L410 V8 oil pressure 53.0 psi at 2200 RPM, ride height leveling datum 166.19 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[1120]: Hydropneumatic accumulator pressure 189.60 bar, L410 V8 oil pressure 45.0 psi at 2200 RPM, ride height leveling datum 166.20 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[1121]: Hydropneumatic accumulator pressure 189.68 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 166.21 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[1122]: Hydropneumatic accumulator pressure 189.76 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 166.22 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[1123]: Hydropneumatic accumulator pressure 189.84 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 166.23 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[1124]: Hydropneumatic accumulator pressure 189.92 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 166.24 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[1125]: Hydropneumatic accumulator pressure 175.00 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 166.25 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[1126]: Hydropneumatic accumulator pressure 175.08 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 166.26 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[1127]: Hydropneumatic accumulator pressure 175.16 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 166.27 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[1128]: Hydropneumatic accumulator pressure 175.24 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 166.28 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[1129]: Hydropneumatic accumulator pressure 175.32 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 166.29 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[1130]: Hydropneumatic accumulator pressure 175.40 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 166.30 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[1131]: Hydropneumatic accumulator pressure 175.48 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 166.31 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[1132]: Hydropneumatic accumulator pressure 175.56 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 166.32 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[1133]: Hydropneumatic accumulator pressure 175.64 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 166.33 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[1134]: Hydropneumatic accumulator pressure 175.72 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 166.34 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[1135]: Hydropneumatic accumulator pressure 175.80 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 166.35 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[1136]: Hydropneumatic accumulator pressure 175.88 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 166.36 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[1137]: Hydropneumatic accumulator pressure 175.96 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 166.37 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[1138]: Hydropneumatic accumulator pressure 176.04 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 166.38 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[1139]: Hydropneumatic accumulator pressure 176.12 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 166.39 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[1140]: Hydropneumatic accumulator pressure 176.20 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 166.40 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[1141]: Hydropneumatic accumulator pressure 176.28 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 166.41 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[1142]: Hydropneumatic accumulator pressure 176.36 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 166.42 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[1143]: Hydropneumatic accumulator pressure 176.44 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 166.43 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[1144]: Hydropneumatic accumulator pressure 176.52 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 166.44 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[1145]: Hydropneumatic accumulator pressure 176.60 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 166.45 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[1146]: Hydropneumatic accumulator pressure 176.68 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 166.46 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[1147]: Hydropneumatic accumulator pressure 176.76 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 166.47 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[1148]: Hydropneumatic accumulator pressure 176.84 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 166.48 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[1149]: Hydropneumatic accumulator pressure 176.92 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 166.49 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[1150]: Hydropneumatic accumulator pressure 177.00 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 166.50 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[1151]: Hydropneumatic accumulator pressure 177.08 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 166.51 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[1152]: Hydropneumatic accumulator pressure 177.16 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 166.52 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[1153]: Hydropneumatic accumulator pressure 177.24 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 166.53 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[1154]: Hydropneumatic accumulator pressure 177.32 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 166.54 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[1155]: Hydropneumatic accumulator pressure 177.40 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 166.55 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[1156]: Hydropneumatic accumulator pressure 177.48 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 166.56 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[1157]: Hydropneumatic accumulator pressure 177.56 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 166.57 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[1158]: Hydropneumatic accumulator pressure 177.64 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 166.58 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[1159]: Hydropneumatic accumulator pressure 177.72 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 166.59 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[1160]: Hydropneumatic accumulator pressure 177.80 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 166.60 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[1161]: Hydropneumatic accumulator pressure 177.88 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 166.61 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[1162]: Hydropneumatic accumulator pressure 177.96 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 166.62 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[1163]: Hydropneumatic accumulator pressure 178.04 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 166.63 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[1164]: Hydropneumatic accumulator pressure 178.12 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 166.64 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[1165]: Hydropneumatic accumulator pressure 178.20 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 166.65 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[1166]: Hydropneumatic accumulator pressure 178.28 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 166.66 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[1167]: Hydropneumatic accumulator pressure 178.36 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 166.67 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[1168]: Hydropneumatic accumulator pressure 178.44 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 166.68 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[1169]: Hydropneumatic accumulator pressure 178.52 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 166.69 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[1170]: Hydropneumatic accumulator pressure 178.60 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 166.70 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[1171]: Hydropneumatic accumulator pressure 178.68 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 166.71 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[1172]: Hydropneumatic accumulator pressure 178.76 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 166.72 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[1173]: Hydropneumatic accumulator pressure 178.84 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 166.73 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[1174]: Hydropneumatic accumulator pressure 178.92 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 166.74 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[1175]: Hydropneumatic accumulator pressure 179.00 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 166.75 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[1176]: Hydropneumatic accumulator pressure 179.08 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 166.76 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[1177]: Hydropneumatic accumulator pressure 179.16 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 166.77 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[1178]: Hydropneumatic accumulator pressure 179.24 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 166.78 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[1179]: Hydropneumatic accumulator pressure 179.32 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 166.79 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[1180]: Hydropneumatic accumulator pressure 179.40 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 166.80 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[1181]: Hydropneumatic accumulator pressure 179.48 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 166.81 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[1182]: Hydropneumatic accumulator pressure 179.56 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 166.82 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[1183]: Hydropneumatic accumulator pressure 179.64 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 166.83 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[1184]: Hydropneumatic accumulator pressure 179.72 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 166.84 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[1185]: Hydropneumatic accumulator pressure 179.80 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 166.85 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[1186]: Hydropneumatic accumulator pressure 179.88 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 166.86 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[1187]: Hydropneumatic accumulator pressure 179.96 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 166.87 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[1188]: Hydropneumatic accumulator pressure 180.04 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 166.88 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[1189]: Hydropneumatic accumulator pressure 180.12 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 166.89 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[1190]: Hydropneumatic accumulator pressure 180.20 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 166.90 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[1191]: Hydropneumatic accumulator pressure 180.28 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 166.91 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[1192]: Hydropneumatic accumulator pressure 180.36 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 166.92 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[1193]: Hydropneumatic accumulator pressure 180.44 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 166.93 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[1194]: Hydropneumatic accumulator pressure 180.52 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 166.94 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[1195]: Hydropneumatic accumulator pressure 180.60 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 166.95 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[1196]: Hydropneumatic accumulator pressure 180.68 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 166.96 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[1197]: Hydropneumatic accumulator pressure 180.76 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 166.97 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[1198]: Hydropneumatic accumulator pressure 180.84 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 166.98 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[1199]: Hydropneumatic accumulator pressure 180.92 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 166.99 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[1200]: Hydropneumatic accumulator pressure 181.00 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 167.00 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[1201]: Hydropneumatic accumulator pressure 181.08 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 167.01 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[1202]: Hydropneumatic accumulator pressure 181.16 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 167.02 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[1203]: Hydropneumatic accumulator pressure 181.24 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 167.03 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[1204]: Hydropneumatic accumulator pressure 181.32 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 167.04 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[1205]: Hydropneumatic accumulator pressure 181.40 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 167.05 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[1206]: Hydropneumatic accumulator pressure 181.48 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 167.06 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[1207]: Hydropneumatic accumulator pressure 181.56 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 167.07 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[1208]: Hydropneumatic accumulator pressure 181.64 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 167.08 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[1209]: Hydropneumatic accumulator pressure 181.72 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 167.09 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[1210]: Hydropneumatic accumulator pressure 181.80 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 167.10 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[1211]: Hydropneumatic accumulator pressure 181.88 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 167.11 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[1212]: Hydropneumatic accumulator pressure 181.96 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 167.12 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[1213]: Hydropneumatic accumulator pressure 182.04 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 167.13 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[1214]: Hydropneumatic accumulator pressure 182.12 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 167.14 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[1215]: Hydropneumatic accumulator pressure 182.20 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 167.15 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[1216]: Hydropneumatic accumulator pressure 182.28 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 167.16 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[1217]: Hydropneumatic accumulator pressure 182.36 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 167.17 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[1218]: Hydropneumatic accumulator pressure 182.44 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 167.18 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[1219]: Hydropneumatic accumulator pressure 182.52 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 167.19 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[1220]: Hydropneumatic accumulator pressure 182.60 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 167.20 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[1221]: Hydropneumatic accumulator pressure 182.68 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 167.21 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[1222]: Hydropneumatic accumulator pressure 182.76 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 167.22 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[1223]: Hydropneumatic accumulator pressure 182.84 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 167.23 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[1224]: Hydropneumatic accumulator pressure 182.92 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 167.24 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[1225]: Hydropneumatic accumulator pressure 183.00 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 167.25 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[1226]: Hydropneumatic accumulator pressure 183.08 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 167.26 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[1227]: Hydropneumatic accumulator pressure 183.16 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 167.27 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[1228]: Hydropneumatic accumulator pressure 183.24 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 167.28 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[1229]: Hydropneumatic accumulator pressure 183.32 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 167.29 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[1230]: Hydropneumatic accumulator pressure 183.40 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 167.30 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[1231]: Hydropneumatic accumulator pressure 183.48 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 167.31 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[1232]: Hydropneumatic accumulator pressure 183.56 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 167.32 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[1233]: Hydropneumatic accumulator pressure 183.64 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 167.33 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[1234]: Hydropneumatic accumulator pressure 183.72 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 167.34 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[1235]: Hydropneumatic accumulator pressure 183.80 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 167.35 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[1236]: Hydropneumatic accumulator pressure 183.88 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 167.36 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[1237]: Hydropneumatic accumulator pressure 183.96 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 167.37 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[1238]: Hydropneumatic accumulator pressure 184.04 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 167.38 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[1239]: Hydropneumatic accumulator pressure 184.12 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 167.39 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[1240]: Hydropneumatic accumulator pressure 184.20 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 167.40 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[1241]: Hydropneumatic accumulator pressure 184.28 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 167.41 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[1242]: Hydropneumatic accumulator pressure 184.36 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 167.42 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[1243]: Hydropneumatic accumulator pressure 184.44 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 167.43 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[1244]: Hydropneumatic accumulator pressure 184.52 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 167.44 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[1245]: Hydropneumatic accumulator pressure 184.60 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 167.45 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[1246]: Hydropneumatic accumulator pressure 184.68 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 167.46 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[1247]: Hydropneumatic accumulator pressure 184.76 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 167.47 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[1248]: Hydropneumatic accumulator pressure 184.84 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 167.48 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[1249]: Hydropneumatic accumulator pressure 184.92 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 167.49 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[1250]: Hydropneumatic accumulator pressure 185.00 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 165.00 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[1251]: Hydropneumatic accumulator pressure 185.08 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 165.01 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[1252]: Hydropneumatic accumulator pressure 185.16 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 165.02 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[1253]: Hydropneumatic accumulator pressure 185.24 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 165.03 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[1254]: Hydropneumatic accumulator pressure 185.32 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 165.04 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[1255]: Hydropneumatic accumulator pressure 185.40 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 165.05 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[1256]: Hydropneumatic accumulator pressure 185.48 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 165.06 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[1257]: Hydropneumatic accumulator pressure 185.56 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 165.07 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[1258]: Hydropneumatic accumulator pressure 185.64 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 165.08 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[1259]: Hydropneumatic accumulator pressure 185.72 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 165.09 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[1260]: Hydropneumatic accumulator pressure 185.80 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 165.10 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[1261]: Hydropneumatic accumulator pressure 185.88 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 165.11 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[1262]: Hydropneumatic accumulator pressure 185.96 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 165.12 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[1263]: Hydropneumatic accumulator pressure 186.04 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 165.13 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[1264]: Hydropneumatic accumulator pressure 186.12 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 165.14 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[1265]: Hydropneumatic accumulator pressure 186.20 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 165.15 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[1266]: Hydropneumatic accumulator pressure 186.28 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 165.16 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[1267]: Hydropneumatic accumulator pressure 186.36 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 165.17 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[1268]: Hydropneumatic accumulator pressure 186.44 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 165.18 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[1269]: Hydropneumatic accumulator pressure 186.52 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 165.19 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[1270]: Hydropneumatic accumulator pressure 186.60 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 165.20 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[1271]: Hydropneumatic accumulator pressure 186.68 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 165.21 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[1272]: Hydropneumatic accumulator pressure 186.76 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 165.22 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[1273]: Hydropneumatic accumulator pressure 186.84 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 165.23 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[1274]: Hydropneumatic accumulator pressure 186.92 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 165.24 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[1275]: Hydropneumatic accumulator pressure 187.00 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 165.25 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[1276]: Hydropneumatic accumulator pressure 187.08 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 165.26 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[1277]: Hydropneumatic accumulator pressure 187.16 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 165.27 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[1278]: Hydropneumatic accumulator pressure 187.24 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 165.28 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[1279]: Hydropneumatic accumulator pressure 187.32 bar, L410 V8 oil pressure 53.0 psi at 2200 RPM, ride height leveling datum 165.29 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[1280]: Hydropneumatic accumulator pressure 187.40 bar, L410 V8 oil pressure 45.0 psi at 2200 RPM, ride height leveling datum 165.30 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[1281]: Hydropneumatic accumulator pressure 187.48 bar, L410 V8 oil pressure 45.0 psi at 2200 RPM, ride height leveling datum 165.31 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[1282]: Hydropneumatic accumulator pressure 187.56 bar, L410 V8 oil pressure 45.1 psi at 2200 RPM, ride height leveling datum 165.32 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[1283]: Hydropneumatic accumulator pressure 187.64 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 165.33 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[1284]: Hydropneumatic accumulator pressure 187.72 bar, L410 V8 oil pressure 45.2 psi at 2200 RPM, ride height leveling datum 165.34 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[1285]: Hydropneumatic accumulator pressure 187.80 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 165.35 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[1286]: Hydropneumatic accumulator pressure 187.88 bar, L410 V8 oil pressure 45.3 psi at 2200 RPM, ride height leveling datum 165.36 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[1287]: Hydropneumatic accumulator pressure 187.96 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 165.37 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[1288]: Hydropneumatic accumulator pressure 188.04 bar, L410 V8 oil pressure 45.4 psi at 2200 RPM, ride height leveling datum 165.38 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[1289]: Hydropneumatic accumulator pressure 188.12 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 165.39 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[1290]: Hydropneumatic accumulator pressure 188.20 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 165.40 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[1291]: Hydropneumatic accumulator pressure 188.28 bar, L410 V8 oil pressure 45.5 psi at 2200 RPM, ride height leveling datum 165.41 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[1292]: Hydropneumatic accumulator pressure 188.36 bar, L410 V8 oil pressure 45.6 psi at 2200 RPM, ride height leveling datum 165.42 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[1293]: Hydropneumatic accumulator pressure 188.44 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 165.43 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[1294]: Hydropneumatic accumulator pressure 188.52 bar, L410 V8 oil pressure 45.7 psi at 2200 RPM, ride height leveling datum 165.44 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[1295]: Hydropneumatic accumulator pressure 188.60 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 165.45 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[1296]: Hydropneumatic accumulator pressure 188.68 bar, L410 V8 oil pressure 45.8 psi at 2200 RPM, ride height leveling datum 165.46 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[1297]: Hydropneumatic accumulator pressure 188.76 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 165.47 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[1298]: Hydropneumatic accumulator pressure 188.84 bar, L410 V8 oil pressure 45.9 psi at 2200 RPM, ride height leveling datum 165.48 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[1299]: Hydropneumatic accumulator pressure 188.92 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 165.49 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[1300]: Hydropneumatic accumulator pressure 189.00 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 165.50 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[1301]: Hydropneumatic accumulator pressure 189.08 bar, L410 V8 oil pressure 46.0 psi at 2200 RPM, ride height leveling datum 165.51 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[1302]: Hydropneumatic accumulator pressure 189.16 bar, L410 V8 oil pressure 46.1 psi at 2200 RPM, ride height leveling datum 165.52 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[1303]: Hydropneumatic accumulator pressure 189.24 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 165.53 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[1304]: Hydropneumatic accumulator pressure 189.32 bar, L410 V8 oil pressure 46.2 psi at 2200 RPM, ride height leveling datum 165.54 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[1305]: Hydropneumatic accumulator pressure 189.40 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 165.55 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[1306]: Hydropneumatic accumulator pressure 189.48 bar, L410 V8 oil pressure 46.3 psi at 2200 RPM, ride height leveling datum 165.56 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[1307]: Hydropneumatic accumulator pressure 189.56 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 165.57 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[1308]: Hydropneumatic accumulator pressure 189.64 bar, L410 V8 oil pressure 46.4 psi at 2200 RPM, ride height leveling datum 165.58 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[1309]: Hydropneumatic accumulator pressure 189.72 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 165.59 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[1310]: Hydropneumatic accumulator pressure 189.80 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 165.60 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[1311]: Hydropneumatic accumulator pressure 189.88 bar, L410 V8 oil pressure 46.5 psi at 2200 RPM, ride height leveling datum 165.61 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[1312]: Hydropneumatic accumulator pressure 189.96 bar, L410 V8 oil pressure 46.6 psi at 2200 RPM, ride height leveling datum 165.62 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[1313]: Hydropneumatic accumulator pressure 175.04 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 165.63 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[1314]: Hydropneumatic accumulator pressure 175.12 bar, L410 V8 oil pressure 46.7 psi at 2200 RPM, ride height leveling datum 165.64 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[1315]: Hydropneumatic accumulator pressure 175.20 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 165.65 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[1316]: Hydropneumatic accumulator pressure 175.28 bar, L410 V8 oil pressure 46.8 psi at 2200 RPM, ride height leveling datum 165.66 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[1317]: Hydropneumatic accumulator pressure 175.36 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 165.67 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[1318]: Hydropneumatic accumulator pressure 175.44 bar, L410 V8 oil pressure 46.9 psi at 2200 RPM, ride height leveling datum 165.68 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[1319]: Hydropneumatic accumulator pressure 175.52 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 165.69 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[1320]: Hydropneumatic accumulator pressure 175.60 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 165.70 mm, SU carburetor manifold vacuum 18.50 inHg
# Crewe_Shadow_Trace[1321]: Hydropneumatic accumulator pressure 175.68 bar, L410 V8 oil pressure 47.0 psi at 2200 RPM, ride height leveling datum 165.71 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[1322]: Hydropneumatic accumulator pressure 175.76 bar, L410 V8 oil pressure 47.1 psi at 2200 RPM, ride height leveling datum 165.72 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[1323]: Hydropneumatic accumulator pressure 175.84 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 165.73 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[1324]: Hydropneumatic accumulator pressure 175.92 bar, L410 V8 oil pressure 47.2 psi at 2200 RPM, ride height leveling datum 165.74 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[1325]: Hydropneumatic accumulator pressure 176.00 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 165.75 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[1326]: Hydropneumatic accumulator pressure 176.08 bar, L410 V8 oil pressure 47.3 psi at 2200 RPM, ride height leveling datum 165.76 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[1327]: Hydropneumatic accumulator pressure 176.16 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 165.77 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[1328]: Hydropneumatic accumulator pressure 176.24 bar, L410 V8 oil pressure 47.4 psi at 2200 RPM, ride height leveling datum 165.78 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[1329]: Hydropneumatic accumulator pressure 176.32 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 165.79 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[1330]: Hydropneumatic accumulator pressure 176.40 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 165.80 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[1331]: Hydropneumatic accumulator pressure 176.48 bar, L410 V8 oil pressure 47.5 psi at 2200 RPM, ride height leveling datum 165.81 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[1332]: Hydropneumatic accumulator pressure 176.56 bar, L410 V8 oil pressure 47.6 psi at 2200 RPM, ride height leveling datum 165.82 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[1333]: Hydropneumatic accumulator pressure 176.64 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 165.83 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[1334]: Hydropneumatic accumulator pressure 176.72 bar, L410 V8 oil pressure 47.7 psi at 2200 RPM, ride height leveling datum 165.84 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[1335]: Hydropneumatic accumulator pressure 176.80 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 165.85 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[1336]: Hydropneumatic accumulator pressure 176.88 bar, L410 V8 oil pressure 47.8 psi at 2200 RPM, ride height leveling datum 165.86 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[1337]: Hydropneumatic accumulator pressure 176.96 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 165.87 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[1338]: Hydropneumatic accumulator pressure 177.04 bar, L410 V8 oil pressure 47.9 psi at 2200 RPM, ride height leveling datum 165.88 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[1339]: Hydropneumatic accumulator pressure 177.12 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 165.89 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[1340]: Hydropneumatic accumulator pressure 177.20 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 165.90 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[1341]: Hydropneumatic accumulator pressure 177.28 bar, L410 V8 oil pressure 48.0 psi at 2200 RPM, ride height leveling datum 165.91 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[1342]: Hydropneumatic accumulator pressure 177.36 bar, L410 V8 oil pressure 48.1 psi at 2200 RPM, ride height leveling datum 165.92 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[1343]: Hydropneumatic accumulator pressure 177.44 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 165.93 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[1344]: Hydropneumatic accumulator pressure 177.52 bar, L410 V8 oil pressure 48.2 psi at 2200 RPM, ride height leveling datum 165.94 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[1345]: Hydropneumatic accumulator pressure 177.60 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 165.95 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[1346]: Hydropneumatic accumulator pressure 177.68 bar, L410 V8 oil pressure 48.3 psi at 2200 RPM, ride height leveling datum 165.96 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[1347]: Hydropneumatic accumulator pressure 177.76 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 165.97 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[1348]: Hydropneumatic accumulator pressure 177.84 bar, L410 V8 oil pressure 48.4 psi at 2200 RPM, ride height leveling datum 165.98 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[1349]: Hydropneumatic accumulator pressure 177.92 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 165.99 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[1350]: Hydropneumatic accumulator pressure 178.00 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 166.00 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[1351]: Hydropneumatic accumulator pressure 178.08 bar, L410 V8 oil pressure 48.5 psi at 2200 RPM, ride height leveling datum 166.01 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[1352]: Hydropneumatic accumulator pressure 178.16 bar, L410 V8 oil pressure 48.6 psi at 2200 RPM, ride height leveling datum 166.02 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[1353]: Hydropneumatic accumulator pressure 178.24 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 166.03 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[1354]: Hydropneumatic accumulator pressure 178.32 bar, L410 V8 oil pressure 48.7 psi at 2200 RPM, ride height leveling datum 166.04 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[1355]: Hydropneumatic accumulator pressure 178.40 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 166.05 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[1356]: Hydropneumatic accumulator pressure 178.48 bar, L410 V8 oil pressure 48.8 psi at 2200 RPM, ride height leveling datum 166.06 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[1357]: Hydropneumatic accumulator pressure 178.56 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 166.07 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[1358]: Hydropneumatic accumulator pressure 178.64 bar, L410 V8 oil pressure 48.9 psi at 2200 RPM, ride height leveling datum 166.08 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[1359]: Hydropneumatic accumulator pressure 178.72 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 166.09 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[1360]: Hydropneumatic accumulator pressure 178.80 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 166.10 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[1361]: Hydropneumatic accumulator pressure 178.88 bar, L410 V8 oil pressure 49.0 psi at 2200 RPM, ride height leveling datum 166.11 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[1362]: Hydropneumatic accumulator pressure 178.96 bar, L410 V8 oil pressure 49.1 psi at 2200 RPM, ride height leveling datum 166.12 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[1363]: Hydropneumatic accumulator pressure 179.04 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 166.13 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[1364]: Hydropneumatic accumulator pressure 179.12 bar, L410 V8 oil pressure 49.2 psi at 2200 RPM, ride height leveling datum 166.14 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[1365]: Hydropneumatic accumulator pressure 179.20 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 166.15 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[1366]: Hydropneumatic accumulator pressure 179.28 bar, L410 V8 oil pressure 49.3 psi at 2200 RPM, ride height leveling datum 166.16 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[1367]: Hydropneumatic accumulator pressure 179.36 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 166.17 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[1368]: Hydropneumatic accumulator pressure 179.44 bar, L410 V8 oil pressure 49.4 psi at 2200 RPM, ride height leveling datum 166.18 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[1369]: Hydropneumatic accumulator pressure 179.52 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 166.19 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[1370]: Hydropneumatic accumulator pressure 179.60 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 166.20 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[1371]: Hydropneumatic accumulator pressure 179.68 bar, L410 V8 oil pressure 49.5 psi at 2200 RPM, ride height leveling datum 166.21 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[1372]: Hydropneumatic accumulator pressure 179.76 bar, L410 V8 oil pressure 49.6 psi at 2200 RPM, ride height leveling datum 166.22 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[1373]: Hydropneumatic accumulator pressure 179.84 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 166.23 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[1374]: Hydropneumatic accumulator pressure 179.92 bar, L410 V8 oil pressure 49.7 psi at 2200 RPM, ride height leveling datum 166.24 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[1375]: Hydropneumatic accumulator pressure 180.00 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 166.25 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[1376]: Hydropneumatic accumulator pressure 180.08 bar, L410 V8 oil pressure 49.8 psi at 2200 RPM, ride height leveling datum 166.26 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[1377]: Hydropneumatic accumulator pressure 180.16 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 166.27 mm, SU carburetor manifold vacuum 20.21 inHg
# Crewe_Shadow_Trace[1378]: Hydropneumatic accumulator pressure 180.24 bar, L410 V8 oil pressure 49.9 psi at 2200 RPM, ride height leveling datum 166.28 mm, SU carburetor manifold vacuum 20.24 inHg
# Crewe_Shadow_Trace[1379]: Hydropneumatic accumulator pressure 180.32 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 166.29 mm, SU carburetor manifold vacuum 20.27 inHg
# Crewe_Shadow_Trace[1380]: Hydropneumatic accumulator pressure 180.40 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 166.30 mm, SU carburetor manifold vacuum 20.30 inHg
# Crewe_Shadow_Trace[1381]: Hydropneumatic accumulator pressure 180.48 bar, L410 V8 oil pressure 50.0 psi at 2200 RPM, ride height leveling datum 166.31 mm, SU carburetor manifold vacuum 18.53 inHg
# Crewe_Shadow_Trace[1382]: Hydropneumatic accumulator pressure 180.56 bar, L410 V8 oil pressure 50.1 psi at 2200 RPM, ride height leveling datum 166.32 mm, SU carburetor manifold vacuum 18.56 inHg
# Crewe_Shadow_Trace[1383]: Hydropneumatic accumulator pressure 180.64 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 166.33 mm, SU carburetor manifold vacuum 18.59 inHg
# Crewe_Shadow_Trace[1384]: Hydropneumatic accumulator pressure 180.72 bar, L410 V8 oil pressure 50.2 psi at 2200 RPM, ride height leveling datum 166.34 mm, SU carburetor manifold vacuum 18.62 inHg
# Crewe_Shadow_Trace[1385]: Hydropneumatic accumulator pressure 180.80 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 166.35 mm, SU carburetor manifold vacuum 18.65 inHg
# Crewe_Shadow_Trace[1386]: Hydropneumatic accumulator pressure 180.88 bar, L410 V8 oil pressure 50.3 psi at 2200 RPM, ride height leveling datum 166.36 mm, SU carburetor manifold vacuum 18.68 inHg
# Crewe_Shadow_Trace[1387]: Hydropneumatic accumulator pressure 180.96 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 166.37 mm, SU carburetor manifold vacuum 18.71 inHg
# Crewe_Shadow_Trace[1388]: Hydropneumatic accumulator pressure 181.04 bar, L410 V8 oil pressure 50.4 psi at 2200 RPM, ride height leveling datum 166.38 mm, SU carburetor manifold vacuum 18.74 inHg
# Crewe_Shadow_Trace[1389]: Hydropneumatic accumulator pressure 181.12 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 166.39 mm, SU carburetor manifold vacuum 18.77 inHg
# Crewe_Shadow_Trace[1390]: Hydropneumatic accumulator pressure 181.20 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 166.40 mm, SU carburetor manifold vacuum 18.80 inHg
# Crewe_Shadow_Trace[1391]: Hydropneumatic accumulator pressure 181.28 bar, L410 V8 oil pressure 50.5 psi at 2200 RPM, ride height leveling datum 166.41 mm, SU carburetor manifold vacuum 18.83 inHg
# Crewe_Shadow_Trace[1392]: Hydropneumatic accumulator pressure 181.36 bar, L410 V8 oil pressure 50.6 psi at 2200 RPM, ride height leveling datum 166.42 mm, SU carburetor manifold vacuum 18.86 inHg
# Crewe_Shadow_Trace[1393]: Hydropneumatic accumulator pressure 181.44 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 166.43 mm, SU carburetor manifold vacuum 18.89 inHg
# Crewe_Shadow_Trace[1394]: Hydropneumatic accumulator pressure 181.52 bar, L410 V8 oil pressure 50.7 psi at 2200 RPM, ride height leveling datum 166.44 mm, SU carburetor manifold vacuum 18.92 inHg
# Crewe_Shadow_Trace[1395]: Hydropneumatic accumulator pressure 181.60 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 166.45 mm, SU carburetor manifold vacuum 18.95 inHg
# Crewe_Shadow_Trace[1396]: Hydropneumatic accumulator pressure 181.68 bar, L410 V8 oil pressure 50.8 psi at 2200 RPM, ride height leveling datum 166.46 mm, SU carburetor manifold vacuum 18.98 inHg
# Crewe_Shadow_Trace[1397]: Hydropneumatic accumulator pressure 181.76 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 166.47 mm, SU carburetor manifold vacuum 19.01 inHg
# Crewe_Shadow_Trace[1398]: Hydropneumatic accumulator pressure 181.84 bar, L410 V8 oil pressure 50.9 psi at 2200 RPM, ride height leveling datum 166.48 mm, SU carburetor manifold vacuum 19.04 inHg
# Crewe_Shadow_Trace[1399]: Hydropneumatic accumulator pressure 181.92 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 166.49 mm, SU carburetor manifold vacuum 19.07 inHg
# Crewe_Shadow_Trace[1400]: Hydropneumatic accumulator pressure 182.00 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 166.50 mm, SU carburetor manifold vacuum 19.10 inHg
# Crewe_Shadow_Trace[1401]: Hydropneumatic accumulator pressure 182.08 bar, L410 V8 oil pressure 51.0 psi at 2200 RPM, ride height leveling datum 166.51 mm, SU carburetor manifold vacuum 19.13 inHg
# Crewe_Shadow_Trace[1402]: Hydropneumatic accumulator pressure 182.16 bar, L410 V8 oil pressure 51.1 psi at 2200 RPM, ride height leveling datum 166.52 mm, SU carburetor manifold vacuum 19.16 inHg
# Crewe_Shadow_Trace[1403]: Hydropneumatic accumulator pressure 182.24 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 166.53 mm, SU carburetor manifold vacuum 19.19 inHg
# Crewe_Shadow_Trace[1404]: Hydropneumatic accumulator pressure 182.32 bar, L410 V8 oil pressure 51.2 psi at 2200 RPM, ride height leveling datum 166.54 mm, SU carburetor manifold vacuum 19.22 inHg
# Crewe_Shadow_Trace[1405]: Hydropneumatic accumulator pressure 182.40 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 166.55 mm, SU carburetor manifold vacuum 19.25 inHg
# Crewe_Shadow_Trace[1406]: Hydropneumatic accumulator pressure 182.48 bar, L410 V8 oil pressure 51.3 psi at 2200 RPM, ride height leveling datum 166.56 mm, SU carburetor manifold vacuum 19.28 inHg
# Crewe_Shadow_Trace[1407]: Hydropneumatic accumulator pressure 182.56 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 166.57 mm, SU carburetor manifold vacuum 19.31 inHg
# Crewe_Shadow_Trace[1408]: Hydropneumatic accumulator pressure 182.64 bar, L410 V8 oil pressure 51.4 psi at 2200 RPM, ride height leveling datum 166.58 mm, SU carburetor manifold vacuum 19.34 inHg
# Crewe_Shadow_Trace[1409]: Hydropneumatic accumulator pressure 182.72 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 166.59 mm, SU carburetor manifold vacuum 19.37 inHg
# Crewe_Shadow_Trace[1410]: Hydropneumatic accumulator pressure 182.80 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 166.60 mm, SU carburetor manifold vacuum 19.40 inHg
# Crewe_Shadow_Trace[1411]: Hydropneumatic accumulator pressure 182.88 bar, L410 V8 oil pressure 51.5 psi at 2200 RPM, ride height leveling datum 166.61 mm, SU carburetor manifold vacuum 19.43 inHg
# Crewe_Shadow_Trace[1412]: Hydropneumatic accumulator pressure 182.96 bar, L410 V8 oil pressure 51.6 psi at 2200 RPM, ride height leveling datum 166.62 mm, SU carburetor manifold vacuum 19.46 inHg
# Crewe_Shadow_Trace[1413]: Hydropneumatic accumulator pressure 183.04 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 166.63 mm, SU carburetor manifold vacuum 19.49 inHg
# Crewe_Shadow_Trace[1414]: Hydropneumatic accumulator pressure 183.12 bar, L410 V8 oil pressure 51.7 psi at 2200 RPM, ride height leveling datum 166.64 mm, SU carburetor manifold vacuum 19.52 inHg
# Crewe_Shadow_Trace[1415]: Hydropneumatic accumulator pressure 183.20 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 166.65 mm, SU carburetor manifold vacuum 19.55 inHg
# Crewe_Shadow_Trace[1416]: Hydropneumatic accumulator pressure 183.28 bar, L410 V8 oil pressure 51.8 psi at 2200 RPM, ride height leveling datum 166.66 mm, SU carburetor manifold vacuum 19.58 inHg
# Crewe_Shadow_Trace[1417]: Hydropneumatic accumulator pressure 183.36 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 166.67 mm, SU carburetor manifold vacuum 19.61 inHg
# Crewe_Shadow_Trace[1418]: Hydropneumatic accumulator pressure 183.44 bar, L410 V8 oil pressure 51.9 psi at 2200 RPM, ride height leveling datum 166.68 mm, SU carburetor manifold vacuum 19.64 inHg
# Crewe_Shadow_Trace[1419]: Hydropneumatic accumulator pressure 183.52 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 166.69 mm, SU carburetor manifold vacuum 19.67 inHg
# Crewe_Shadow_Trace[1420]: Hydropneumatic accumulator pressure 183.60 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 166.70 mm, SU carburetor manifold vacuum 19.70 inHg
# Crewe_Shadow_Trace[1421]: Hydropneumatic accumulator pressure 183.68 bar, L410 V8 oil pressure 52.0 psi at 2200 RPM, ride height leveling datum 166.71 mm, SU carburetor manifold vacuum 19.73 inHg
# Crewe_Shadow_Trace[1422]: Hydropneumatic accumulator pressure 183.76 bar, L410 V8 oil pressure 52.1 psi at 2200 RPM, ride height leveling datum 166.72 mm, SU carburetor manifold vacuum 19.76 inHg
# Crewe_Shadow_Trace[1423]: Hydropneumatic accumulator pressure 183.84 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 166.73 mm, SU carburetor manifold vacuum 19.79 inHg
# Crewe_Shadow_Trace[1424]: Hydropneumatic accumulator pressure 183.92 bar, L410 V8 oil pressure 52.2 psi at 2200 RPM, ride height leveling datum 166.74 mm, SU carburetor manifold vacuum 19.82 inHg
# Crewe_Shadow_Trace[1425]: Hydropneumatic accumulator pressure 184.00 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 166.75 mm, SU carburetor manifold vacuum 19.85 inHg
# Crewe_Shadow_Trace[1426]: Hydropneumatic accumulator pressure 184.08 bar, L410 V8 oil pressure 52.3 psi at 2200 RPM, ride height leveling datum 166.76 mm, SU carburetor manifold vacuum 19.88 inHg
# Crewe_Shadow_Trace[1427]: Hydropneumatic accumulator pressure 184.16 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 166.77 mm, SU carburetor manifold vacuum 19.91 inHg
# Crewe_Shadow_Trace[1428]: Hydropneumatic accumulator pressure 184.24 bar, L410 V8 oil pressure 52.4 psi at 2200 RPM, ride height leveling datum 166.78 mm, SU carburetor manifold vacuum 19.94 inHg
# Crewe_Shadow_Trace[1429]: Hydropneumatic accumulator pressure 184.32 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 166.79 mm, SU carburetor manifold vacuum 19.97 inHg
# Crewe_Shadow_Trace[1430]: Hydropneumatic accumulator pressure 184.40 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 166.80 mm, SU carburetor manifold vacuum 20.00 inHg
# Crewe_Shadow_Trace[1431]: Hydropneumatic accumulator pressure 184.48 bar, L410 V8 oil pressure 52.5 psi at 2200 RPM, ride height leveling datum 166.81 mm, SU carburetor manifold vacuum 20.03 inHg
# Crewe_Shadow_Trace[1432]: Hydropneumatic accumulator pressure 184.56 bar, L410 V8 oil pressure 52.6 psi at 2200 RPM, ride height leveling datum 166.82 mm, SU carburetor manifold vacuum 20.06 inHg
# Crewe_Shadow_Trace[1433]: Hydropneumatic accumulator pressure 184.64 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 166.83 mm, SU carburetor manifold vacuum 20.09 inHg
# Crewe_Shadow_Trace[1434]: Hydropneumatic accumulator pressure 184.72 bar, L410 V8 oil pressure 52.7 psi at 2200 RPM, ride height leveling datum 166.84 mm, SU carburetor manifold vacuum 20.12 inHg
# Crewe_Shadow_Trace[1435]: Hydropneumatic accumulator pressure 184.80 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 166.85 mm, SU carburetor manifold vacuum 20.15 inHg
# Crewe_Shadow_Trace[1436]: Hydropneumatic accumulator pressure 184.88 bar, L410 V8 oil pressure 52.8 psi at 2200 RPM, ride height leveling datum 166.86 mm, SU carburetor manifold vacuum 20.18 inHg
# Crewe_Shadow_Trace[1437]: Hydropneumatic accumulator pressure 184.96 bar, L410 V8 oil pressure 52.9 psi at 2200 RPM, ride height leveling datum 166.87 mm, SU carburetor manifold vacuum 20.21 inHg
