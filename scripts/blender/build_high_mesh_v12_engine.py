import bpy
import os
import math
from mathutils import Vector

def log(msg):
    print(f"[HIGH_MESH_V12] {msg}")

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

def create_pipe_segment(name, start, end, radius=0.025, segments=24, material=None):
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
    rot = Vector((0, 0, 1)).rotation_difference(vec.normalized()).to_euler()
    tube.rotation_euler = rot
    bpy.ops.object.transform_apply(rotation=True)
    if material:
        tube.data.materials.append(material)
    return tube

def create_high_mesh_v12_engine():
    log("==================================================")
    log("GENERATING HIGH-MESH 60-DEGREE V12 RACING ENGINE")
    log("==================================================")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Premium Engine Materials
    mat_block = build_pbr_material("Engine_Block_Cast_Aluminum", (0.65, 0.65, 0.68, 1.0), metallic=0.85, roughness=0.35)
    mat_valve_cover = build_pbr_material("Valve_Cover_Wrinkle_Red", (0.75, 0.05, 0.08, 1.0), metallic=0.20, roughness=0.25, clearcoat=0.6) # Ferrari/Alfa Red
    mat_headers = build_pbr_material("Exhaust_Headers_Inconel_Bluing", (0.70, 0.65, 0.75, 1.0), metallic=0.95, roughness=0.18, clearcoat=0.9) # Heat blued
    mat_stacks = build_pbr_material("Velocity_Stacks_Polished_Alloy", (0.92, 0.92, 0.95, 1.0), metallic=0.98, roughness=0.08, clearcoat=1.0)
    mat_turbo = build_pbr_material("Turbo_Compressor_Scroll", (0.80, 0.82, 0.85, 1.0), metallic=0.90, roughness=0.20, clearcoat=0.5)
    mat_hardware = build_pbr_material("Hardware_Titanium", (0.75, 0.75, 0.78, 1.0), metallic=0.98, roughness=0.12, clearcoat=0.8)
    mat_carbon = build_pbr_material("Carbon_Fiber_Intake", (0.05, 0.05, 0.06, 1.0), metallic=0.55, roughness=0.18, clearcoat=1.0)

    created_objects = []

    # 1. 60° V12 CRANKCASE & ENGINE BLOCK
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.35))
    block = bpy.context.active_object
    block.name = "Engine_V12_Crankcase_Block"
    block.scale = (0.72, 0.38, 0.34)
    bpy.ops.object.transform_apply(scale=True)
    b = block.modifiers.new(name="Bevel", type='BEVEL')
    b.width = 0.02
    b.segments = 3
    block.data.materials.append(mat_block)
    created_objects.append(block)

    # Finned Oil Sump Pan
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.14))
    sump = bpy.context.active_object
    sump.name = "Engine_Dry_Sump_Pan"
    sump.scale = (0.68, 0.32, 0.08)
    bpy.ops.object.transform_apply(scale=True)
    sump.data.materials.append(mat_block)
    created_objects.append(sump)

    # 2. DUAL DOHC CYLINDER HEADS & WRINKLE RED CAM COVERS (Angled at 60°)
    for bank, by, angle in [("Left", 0.16, math.radians(30)), ("Right", -0.16, math.radians(-30))]:
        # Head Casting
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, by, 0.52))
        head = bpy.context.active_object
        head.name = f"Cylinder_Head_Bank_{bank}"
        head.scale = (0.70, 0.18, 0.14)
        head.rotation_euler.x = angle
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        head.data.materials.append(mat_block)
        created_objects.append(head)

        # Wrinkle Red Valve Cam Cover
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, by * 1.25, 0.62))
        cover = bpy.context.active_object
        cover.name = f"Valve_Cover_Bank_{bank}"
        cover.scale = (0.72, 0.16, 0.08)
        cover.rotation_euler.x = angle
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        b_cov = cover.modifiers.new(name="Bevel", type='BEVEL')
        b_cov.width = 0.015
        b_cov.segments = 3
        cover.data.materials.append(mat_valve_cover)
        created_objects.append(cover)

        # 6 Ignition Coil Packs per Bank
        for c_idx in range(6):
            cx = -0.30 + (0.60 / 5) * c_idx
            bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=0.035, vertices=16, location=(cx, by * 1.25, 0.68))
            coil = bpy.context.active_object
            coil.name = f"Ignition_Coil_Pack_{bank}_{c_idx+1}"
            coil.rotation_euler.x = angle
            bpy.ops.object.transform_apply(rotation=True)
            coil.data.materials.append(mat_hardware)
            created_objects.append(coil)

    # 3. 12 VELOCITY STACKS / INTAKE TRUMPETS (Individual Throttle Bodies)
    for bank, by, angle in [("Left", 0.06, math.radians(15)), ("Right", -0.06, math.radians(-15))]:
        for c_idx in range(6):
            cx = -0.28 + (0.56 / 5) * c_idx
            # Flared trumpet velocity stack
            bpy.ops.mesh.primitive_cylinder_add(radius=0.024, depth=0.09, vertices=32, location=(cx, by, 0.72))
            stack = bpy.context.active_object
            stack.name = f"Velocity_Stack_{bank}_{c_idx+1}"
            stack.rotation_euler.x = angle
            bpy.ops.object.transform_apply(rotation=True)
            b_st = stack.modifiers.new(name="Bevel", type='BEVEL')
            b_st.width = 0.005
            b_st.segments = 2
            stack.data.materials.append(mat_stacks)
            created_objects.append(stack)

    # 4. 12-TO-2 EQUAL LENGTH INCONEL EXHAUST HEADERS (Curling into collectors)
    for bank, by, dir_sign in [("Left", 0.26, 1), ("Right", -0.26, -1)]:
        collector_point = Vector((-0.20, dir_sign * 0.38, 0.32))
        for c_idx in range(6):
            cx = -0.28 + (0.56 / 5) * c_idx
            port_point = Vector((cx, by, 0.48))
            mid_point = Vector((cx * 0.5 + collector_point.x * 0.5, dir_sign * 0.36, 0.42))
            
            # 2 segments per runner for smooth bend
            r1 = create_pipe_segment(f"Exhaust_Runner_{bank}_{c_idx+1}_A", port_point, mid_point, radius=0.018, segments=20, material=mat_headers)
            r2 = create_pipe_segment(f"Exhaust_Runner_{bank}_{c_idx+1}_B", mid_point, collector_point, radius=0.018, segments=20, material=mat_headers)
            if r1: created_objects.append(r1)
            if r2: created_objects.append(r2)

        # 6-into-1 Merge Collector Cone
        bpy.ops.mesh.primitive_cone_add(radius1=0.055, radius2=0.038, depth=0.12, vertices=24, location=collector_point - Vector((0.06, 0, 0)))
        coll = bpy.context.active_object
        coll.name = f"Exhaust_Collector_Merge_{bank}"
        coll.rotation_euler.y = math.pi / 2
        bpy.ops.object.transform_apply(rotation=True)
        coll.data.materials.append(mat_headers)
        created_objects.append(coll)

    # 5. TWIN HIGH-FLOW TURBOCHARGERS (Left & Right Volute Scrolls)
    for bank, by, dir_sign in [("Left", 0.38, 1), ("Right", -0.38, -1)]:
        t_loc = Vector((-0.34, dir_sign * 0.40, 0.32))
        
        # Compressor Scroll (Snail Volute)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.068, minor_radius=0.035, major_segments=48, minor_segments=24, location=t_loc)
        scroll = bpy.context.active_object
        scroll.name = f"Turbo_Compressor_Scroll_{bank}"
        scroll.rotation_euler.x = math.pi / 2
        bpy.ops.object.transform_apply(rotation=True)
        scroll.data.materials.append(mat_turbo)
        created_objects.append(scroll)

        # Compressor Inducer Mouth
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.06, vertices=32, location=t_loc + Vector((0, dir_sign * 0.04, 0)))
        mouth = bpy.context.active_object
        mouth.name = f"Turbo_Inducer_Inlet_{bank}"
        mouth.rotation_euler.x = math.pi / 2
        bpy.ops.object.transform_apply(rotation=True)
        mouth.data.materials.append(mat_turbo)
        created_objects.append(mouth)

        # Wastegate Actuator Canister
        bpy.ops.mesh.primitive_cylinder_add(radius=0.022, depth=0.065, vertices=20, location=t_loc + Vector((0.08, 0, 0.06)))
        wg = bpy.context.active_object
        wg.name = f"Turbo_Wastegate_Actuator_{bank}"
        wg.data.materials.append(mat_hardware)
        created_objects.append(wg)

    # 6. FRONT SERPENTINE PULLEYS & HARMONIC BALANCER
    pulley_data = [
        ("Crankshaft_Harmonic_Balancer", (0.38, 0, 0.28), 0.075, 0.035),
        ("Water_Pump_Pulley", (0.38, 0, 0.44), 0.055, 0.025),
        ("Alternator_Pulley_L", (0.38, 0.18, 0.38), 0.042, 0.025),
        ("AirConditioner_Pulley_R", (0.38, -0.18, 0.38), 0.048, 0.025),
        ("Tensioner_Idler_Pulley", (0.38, 0.08, 0.52), 0.035, 0.020),
    ]
    for name, loc, r, d in pulley_data:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=d, vertices=32, location=loc)
        p = bpy.context.active_object
        p.name = name
        p.rotation_euler.y = math.pi / 2
        bpy.ops.object.transform_apply(rotation=True)
        p.data.materials.append(mat_hardware)
        created_objects.append(p)

    # 7. APPLY WEIGHTED NORMALS & GROUND CALIBRATION
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

    # Ground calibration
    all_corners = [obj.matrix_world @ Vector(c) for obj in created_objects for c in obj.bound_box]
    min_z = min(c.z for c in all_corners)
    log(f"Calibrating engine ground plane: dz = {-min_z:.4f}m")
    for obj in created_objects:
        obj.location.z -= min_z
        
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

    total_polys = sum(len(o.data.polygons) for o in created_objects)
    total_verts = sum(len(o.data.vertices) for o in created_objects)
    log(f"[SUCCESS] High-Mesh 60° V12 Engine created: {len(created_objects)} components, {total_polys:,} polygons, {total_verts:,} vertices.")

    out_paths = [
        r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\v12_racing_engine.glb",
        r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\engines\v12_racing_engine.glb",
        r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\powertrain\v12_racing_engine.glb"
    ]
    for p in out_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        log(f"Exporting GLB: {p}")
        bpy.ops.export_scene.gltf(
            filepath=p,
            export_format='GLB',
            use_selection=False,
            export_apply=True
        )
        sz_mb = os.path.getsize(p) / (1024 * 1024)
        log(f"[EXPORTED] {p} ({sz_mb:.2f} MB)")

if __name__ == "__main__":
    create_high_mesh_v12_engine()
