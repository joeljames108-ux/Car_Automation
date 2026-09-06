import bpy
import os
import math
from mathutils import Vector

def log(msg):
    print(f"[HIGH_MESH_CHASSIS] {msg}")

def set_principled_socket(principled, socket_names, value):
    for name in socket_names:
        if name in principled.inputs:
            principled.inputs[name].default_value = value
            return True
    return False

def build_pbr_material(name, base_color, metallic, roughness, clearcoat=0.0, clearcoat_rough=0.03):
    mat = bpy.data.materials.new(name=name)
    nodes = mat.node_tree.nodes
    nodes.clear()
    node_pbr = nodes.new(type="ShaderNodeBsdfPrincipled")
    node_out = nodes.new(type="ShaderNodeOutputMaterial")
    mat.node_tree.links.new(node_pbr.outputs["BSDF"], node_out.inputs["Surface"])
    
    set_principled_socket(node_pbr, ["Base Color"], base_color)
    set_principled_socket(node_pbr, ["Metallic"], metallic)
    set_principled_socket(node_pbr, ["Roughness"], roughness)
    if clearcoat > 0:
        set_principled_socket(node_pbr, ["Coat Weight", "Clearcoat"], clearcoat)
        set_principled_socket(node_pbr, ["Coat Roughness", "Clearcoat Roughness"], clearcoat_rough)
    return mat

def create_tube(name, start, end, radius=0.022, segments=24, material=None):
    start = Vector(start)
    end = Vector(end)
    vec = end - start
    length = vec.length
    if length < 1e-4:
        return None
    mid = (start + end) / 2.0
    
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=length, vertices=segments, location=mid)
    tube = bpy.context.active_object
    tube.name = name
    
    # Rotation to align Z axis with vec
    rot = Vector((0, 0, 1)).rotation_difference(vec.normalized()).to_euler()
    tube.rotation_euler = rot
    bpy.ops.object.transform_apply(rotation=True)
    
    if material:
        tube.data.materials.append(material)
    return tube

def create_high_mesh_gt3_chassis():
    log("==================================================")
    log("GENERATING HIGH-MESH GT3 SPACEFRAME & MONOCOQUE")
    log("==================================================")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Materials
    mat_carbon = build_pbr_material("Chassis_Carbon_Monocoque", (0.05, 0.05, 0.06, 1.0), metallic=0.55, roughness=0.18, clearcoat=1.0)
    mat_tube = build_pbr_material("RollCage_Chromoly_Steel", (0.02, 0.45, 0.85, 1.0), metallic=0.85, roughness=0.22, clearcoat=0.8) # Electric Race Blue
    mat_subframe = build_pbr_material("Subframe_Trellis_Steel", (0.25, 0.25, 0.28, 1.0), metallic=0.90, roughness=0.28) # Gunmetal Steel
    mat_billet = build_pbr_material("Suspension_Billet_Mounts", (0.85, 0.85, 0.88, 1.0), metallic=0.95, roughness=0.15, clearcoat=0.5)
    mat_gold_shield = build_pbr_material("Firewall_Gold_Heatshield", (0.95, 0.75, 0.15, 1.0), metallic=0.98, roughness=0.10, clearcoat=1.0)

    created_objects = []

    # 1. CENTRAL CARBON FIBER MONOCOQUE TUB (Passenger Safety Cell)
    # Cockpit Floor Pan
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.18))
    tub_floor = bpy.context.active_object
    tub_floor.name = "Monocoque_Floor_Pan"
    tub_floor.scale = (1.45, 1.70, 0.08)
    bpy.ops.object.transform_apply(scale=True)
    b = tub_floor.modifiers.new(name="Bevel", type='BEVEL')
    b.width = 0.015
    b.segments = 3
    tub_floor.data.materials.append(mat_carbon)
    created_objects.append(tub_floor)

    # Left & Right Structural Sill Beams (Side Impact Energy Absorbers)
    for side, sy in [("Left", 0.78), ("Right", -0.78)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, sy, 0.32))
        sill = bpy.context.active_object
        sill.name = f"Monocoque_Sill_Beam_{side}"
        sill.scale = (1.40, 0.18, 0.24)
        bpy.ops.object.transform_apply(scale=True)
        b = sill.modifiers.new(name="Bevel", type='BEVEL')
        b.width = 0.02
        b.segments = 3
        sill.data.materials.append(mat_carbon)
        created_objects.append(sill)

    # Front Bulkhead (Firewall / Footwell)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.72, 0, 0.42))
    fw = bpy.context.active_object
    fw.name = "Monocoque_Front_Bulkhead"
    fw.scale = (0.10, 1.35, 0.45)
    bpy.ops.object.transform_apply(scale=True)
    fw.data.materials.append(mat_carbon)
    created_objects.append(fw)

    # Rear Engine Bulkhead with Gold Foil
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.72, 0, 0.52))
    rw = bpy.context.active_object
    rw.name = "Monocoque_Rear_Bulkhead_Firewall"
    rw.scale = (0.10, 1.35, 0.65)
    bpy.ops.object.transform_apply(scale=True)
    rw.data.materials.append(mat_gold_shield)
    created_objects.append(rw)

    # 2. TUBULAR FRONT SUBFRAME & SUSPENSION CRADLE
    # Front Lower Rails (extending forward from bulkhead to radiator)
    f_nodes = [
        # Left Rail
        ((0.72, 0.50, 0.20), (1.65, 0.48, 0.20), "Subframe_Front_LowerRail_L"),
        ((0.72, -0.50, 0.20), (1.65, -0.48, 0.20), "Subframe_Front_LowerRail_R"),
        # Upper Rails
        ((0.72, 0.45, 0.55), (1.65, 0.42, 0.52), "Subframe_Front_UpperRail_L"),
        ((0.72, -0.45, 0.55), (1.65, -0.42, 0.52), "Subframe_Front_UpperRail_R"),
        # Front Crossmember & Radiator Support
        ((1.65, 0.48, 0.20), (1.65, -0.48, 0.20), "Subframe_Front_Crossmember_Lower"),
        ((1.65, 0.42, 0.52), (1.65, -0.42, 0.52), "Subframe_Front_Crossmember_Upper"),
        # Vertical Struts
        ((1.65, 0.45, 0.20), (1.65, 0.45, 0.52), "Subframe_Front_Upright_L"),
        ((1.65, -0.45, 0.20), (1.65, -0.45, 0.52), "Subframe_Front_Upright_R"),
        # Triangulation Diagonals
        ((0.72, 0.50, 0.20), (1.35, 0.45, 0.55), "Subframe_Front_Diagonal_L"),
        ((0.72, -0.50, 0.20), (1.35, -0.45, 0.55), "Subframe_Front_Diagonal_R"),
        ((0.72, 0.45, 0.55), (1.35, 0.48, 0.20), "Subframe_Front_LowerDiag_L"),
        ((0.72, -0.45, 0.55), (1.35, -0.48, 0.20), "Subframe_Front_LowerDiag_R"),
    ]
    for s, e, name in f_nodes:
        t = create_tube(name, s, e, radius=0.020, segments=24, material=mat_subframe)
        if t: created_objects.append(t)

    # 3. TUBULAR REAR POWERTRAIN CRADLE & DIFF CARRIER
    r_nodes = [
        # Rear Lower Longitudinal Rails
        ((-0.72, 0.55, 0.20), (-1.85, 0.50, 0.22), "Subframe_Rear_LowerRail_L"),
        ((-0.72, -0.55, 0.20), (-1.85, -0.50, 0.22), "Subframe_Rear_LowerRail_R"),
        # Rear Upper Rails (Shock Mount Trusses)
        ((-0.72, 0.48, 0.65), (-1.85, 0.44, 0.55), "Subframe_Rear_UpperRail_L"),
        ((-0.72, -0.48, 0.65), (-1.85, -0.44, 0.55), "Subframe_Rear_UpperRail_R"),
        # Rear Diff Crossmembers
        ((-1.45, 0.52, 0.21), (-1.45, -0.52, 0.21), "Subframe_Rear_Diff_Crossmember_1"),
        ((-1.85, 0.50, 0.22), (-1.85, -0.50, 0.22), "Subframe_Rear_Diff_Crossmember_2"),
        ((-1.45, 0.46, 0.60), (-1.45, -0.46, 0.60), "Subframe_Rear_ShockTower_Crossbar"),
        # Engine Cradle Lower Mount Beams
        ((-0.95, 0.35, 0.18), (-1.55, 0.35, 0.18), "Engine_Mount_Cradle_L"),
        ((-0.95, -0.35, 0.18), (-1.55, -0.35, 0.18), "Engine_Mount_Cradle_R"),
    ]
    for s, e, name in r_nodes:
        t = create_tube(name, s, e, radius=0.022, segments=24, material=mat_subframe)
        if t: created_objects.append(t)

    # 4. FIA INTEGRATED 6-POINT SAFETY ROLL CAGE (Race Blue)
    cage_nodes = [
        # Main B-Pillar Hoop (Overhead Arch behind seats)
        ((-0.45, 0.65, 0.32), (-0.45, 0.55, 1.25), "RollCage_MainHoop_Leg_L"),
        ((-0.45, -0.65, 0.32), (-0.45, -0.55, 1.25), "RollCage_MainHoop_Leg_R"),
        ((-0.45, 0.55, 1.25), (-0.45, -0.55, 1.25), "RollCage_MainHoop_TopBar"),
        # Main Hoop Diagonal Cross (X-Brace)
        ((-0.45, 0.55, 1.25), (-0.45, -0.65, 0.32), "RollCage_MainHoop_Diagonal_1"),
        ((-0.45, -0.55, 1.25), (-0.45, 0.65, 0.32), "RollCage_MainHoop_Diagonal_2"),
        # Harness Bar (for 6-point racing belts)
        ((-0.45, 0.60, 0.70), (-0.45, -0.60, 0.70), "RollCage_Harness_Bar"),
        # Front A-Pillar Pillars (Windshield Pillars)
        ((0.55, 0.62, 0.32), (0.15, 0.52, 1.22), "RollCage_APillar_L"),
        ((0.55, -0.62, 0.32), (0.15, -0.52, 1.22), "RollCage_APillar_R"),
        # Roof Side Halo Bars
        ((0.15, 0.52, 1.22), (-0.45, 0.55, 1.25), "RollCage_Roof_SideBar_L"),
        ((0.15, -0.52, 1.22), (-0.45, -0.55, 1.25), "RollCage_Roof_SideBar_R"),
        # Windshield Header Bar
        ((0.15, 0.52, 1.22), (0.15, -0.52, 1.22), "RollCage_Windshield_HeaderBar"),
        # Roof Diagonal
        ((0.15, 0.52, 1.22), (-0.45, -0.55, 1.25), "RollCage_Roof_Diagonal"),
        # Rear Backstays (Connecting Main Hoop to Rear Shock Towers)
        ((-0.45, 0.55, 1.25), (-1.45, 0.46, 0.60), "RollCage_Rear_Backstay_L"),
        ((-0.45, -0.55, 1.25), (-1.45, -0.46, 0.60), "RollCage_Rear_Backstay_R"),
        # Door Intrusion X-Bars (NASCAR-Style Side Protection)
        ((0.50, 0.68, 0.38), (-0.40, 0.68, 0.85), "RollCage_DoorBar_Upper_L"),
        ((0.50, 0.68, 0.85), (-0.40, 0.68, 0.38), "RollCage_DoorBar_Lower_L"),
        ((0.50, -0.68, 0.38), (-0.40, -0.68, 0.85), "RollCage_DoorBar_Upper_R"),
        ((0.50, -0.68, 0.85), (-0.40, -0.68, 0.38), "RollCage_DoorBar_Lower_R"),
    ]
    for s, e, name in cage_nodes:
        t = create_tube(name, s, e, radius=0.024, segments=24, material=mat_tube)
        if t: created_objects.append(t)

    # 5. CNC BILLET SUSPENSION PICKUP BRACKETS (Double Wishbone Hardpoints)
    # Front and Rear Upper & Lower Clevis Lugs
    hardpoints = [
        # Front Left & Right (Wheel center ~ 1.35m)
        (1.35, 0.48, 0.22, "Suspension_Pickup_Front_Lower_L"),
        (1.35, -0.48, 0.22, "Suspension_Pickup_Front_Lower_R"),
        (1.35, 0.44, 0.52, "Suspension_Pickup_Front_Upper_L"),
        (1.35, -0.44, 0.52, "Suspension_Pickup_Front_Upper_R"),
        # Rear Left & Right (Wheel center ~ -1.45m)
        (-1.45, 0.52, 0.22, "Suspension_Pickup_Rear_Lower_L"),
        (-1.45, -0.52, 0.22, "Suspension_Pickup_Rear_Lower_R"),
        (-1.45, 0.46, 0.58, "Suspension_Pickup_Rear_Upper_L"),
        (-1.45, -0.46, 0.58, "Suspension_Pickup_Rear_Upper_R"),
    ]
    for x, y, z, name in hardpoints:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, y, z))
        bracket = bpy.context.active_object
        bracket.name = name
        bracket.scale = (0.075, 0.055, 0.055)
        bpy.ops.object.transform_apply(scale=True)
        b = bracket.modifiers.new(name="Bevel", type='BEVEL')
        b.width = 0.006
        b.segments = 3
        bracket.data.materials.append(mat_billet)
        created_objects.append(bracket)

    # 6. APPLY WEIGHTED NORMALS & CALIBRATE GROUND
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    
    for obj in created_objects:
        bpy.context.view_layer.objects.active = obj
        for mod in list(obj.modifiers):
            try:
                bpy.ops.object.modifier_apply(modifier=mod.name)
            except Exception:
                pass
        for p in obj.data.polygons:
            p.use_smooth = True
        wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        wn.keep_sharp = True
        wn.weight = 100

    # Ground contact
    all_corners = [obj.matrix_world @ Vector(c) for obj in created_objects for c in obj.bound_box]
    min_z = min(c.z for c in all_corners)
    log(f"Calibrating chassis ground plane: dz = {-min_z:.4f}m")
    for obj in created_objects:
        obj.location.z -= min_z
        
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

    total_polys = sum(len(o.data.polygons) for o in created_objects)
    total_verts = sum(len(o.data.vertices) for o in created_objects)
    log(f"[SUCCESS] High-Mesh GT3 Spaceframe Chassis created: {len(created_objects)} components, {total_polys:,} polygons, {total_verts:,} vertices.")

    out_path = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\chassis\gt3_race_chassis_01.glb"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    log(f"Exporting GLB: {out_path}")
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True
    )
    sz_mb = os.path.getsize(out_path) / (1024 * 1024)
    log(f"[EXPORTED] {out_path} ({sz_mb:.2f} MB)")

if __name__ == "__main__":
    create_high_mesh_gt3_chassis()
