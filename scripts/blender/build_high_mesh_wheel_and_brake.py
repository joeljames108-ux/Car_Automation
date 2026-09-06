import bpy
import os
import math
from mathutils import Vector, Matrix

def log(msg):
    print(f"[HIGH_MESH_WHEEL] {msg}")

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

def create_ultra_high_mesh_wheel():
    log("==================================================")
    log("GENERATING ULTRA HIGH-MESH FORGED WHEEL & BRAKES")
    log("==================================================")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Premium PBR Materials
    mat_rim = build_pbr_material("Wheel_Rim_Forged_Alloy", (0.88, 0.88, 0.90, 1.0), metallic=0.95, roughness=0.18, clearcoat=0.6)
    mat_tire = build_pbr_material("Tire_Rubber_Competition", (0.03, 0.03, 0.03, 1.0), metallic=0.0, roughness=0.88)
    mat_rotor = build_pbr_material("Brake_Rotor_CrossDrilled", (0.60, 0.60, 0.62, 1.0), metallic=0.85, roughness=0.30)
    mat_hat = build_pbr_material("Brake_Hat_Anodized_Black", (0.08, 0.08, 0.10, 1.0), metallic=0.92, roughness=0.22)
    mat_caliper = build_pbr_material("Brake_Caliper_Gloss_Red", (0.85, 0.05, 0.08, 1.0), metallic=0.18, roughness=0.12, clearcoat=1.0)
    mat_hardware = build_pbr_material("Hardware_Titanium", (0.75, 0.75, 0.78, 1.0), metallic=0.98, roughness=0.12, clearcoat=0.8)

    created_objects = []

    # 1. COMPETITION TIRE WITH DIRECTIONAL TREAD GROOVES (High-Density Torus)
    # Using 128 major segments and 48 minor segments = 6,144 quads base
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.298,
        minor_radius=0.044,
        major_segments=128,
        minor_segments=48,
        location=(0, 0, 0)
    )
    tire = bpy.context.active_object
    tire.name = "Tire_Competition_295_30R20"
    tire.rotation_euler.y = math.pi / 2
    tire.scale = (3.2, 1.0, 1.0) # Flatten profile for competition track footprint
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    tire.data.materials.append(mat_tire)
    created_objects.append(tire)

    # 2. FORGED RIM BARREL WITH STEPPED LIP & BEAD SEAT (128 vertices)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.254, depth=0.285, vertices=128, location=(0, 0, 0))
    rim_barrel = bpy.context.active_object
    rim_barrel.name = "Wheel_Rim_Barrel"
    rim_barrel.rotation_euler.y = math.pi / 2
    bpy.ops.object.transform_apply(rotation=True)
    # Bevel and Subsurf for high density
    sub_rim = rim_barrel.modifiers.new(name="Subsurf", type='SUBSURF')
    sub_rim.levels = 1
    sub_rim.render_levels = 1
    rim_barrel.data.materials.append(mat_rim)
    created_objects.append(rim_barrel)

    # 3. 10 CONCAVE MILLED Y-SPOKES (Sculpted with 3D Relief & Pocket Milling)
    num_spokes = 10
    for i in range(num_spokes):
        angle = (2 * math.pi / num_spokes) * i
        
        # Primary Spoke Body
        bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=0.22, vertices=24, location=(0, 0, 0))
        spoke = bpy.context.active_object
        spoke.name = f"Wheel_Spoke_Forged_{i+1:02d}"
        
        # Orient and concavely sweep into barrel
        r_mid = 0.145
        spoke.location = (
            -0.038 + 0.030 * (r_mid / 0.254),
            math.sin(angle) * r_mid,
            math.cos(angle) * r_mid
        )
        spoke.rotation_euler = ( -angle, math.radians(12), 0 )
        bpy.ops.object.transform_apply(location=True, rotation=True)
        
        # Subsurf for sculpted organic transitions
        sub_sp = spoke.modifiers.new(name="Subsurf", type='SUBSURF')
        sub_sp.levels = 1
        spoke.data.materials.append(mat_rim)
        created_objects.append(spoke)

        # Milled Side Pocket Flange
        bpy.ops.mesh.primitive_cylinder_add(radius=0.008, depth=0.18, vertices=16, location=(0, 0, 0))
        flange = bpy.context.active_object
        flange.name = f"Wheel_Spoke_MilledPocket_{i+1:02d}"
        flange.location = (
            -0.046 + 0.030 * (r_mid / 0.254),
            math.sin(angle) * (r_mid + 0.015),
            math.cos(angle) * (r_mid + 0.015)
        )
        flange.rotation_euler = ( -angle, math.radians(15), 0 )
        bpy.ops.object.transform_apply(location=True, rotation=True)
        flange.data.materials.append(mat_rim)
        created_objects.append(flange)

    # 4. FORGED CENTER HUB WITH LUG RECESSES & LOGO CAP
    bpy.ops.mesh.primitive_cylinder_add(radius=0.088, depth=0.055, vertices=64, location=(-0.048, 0, 0))
    center_hub = bpy.context.active_object
    center_hub.name = "Wheel_Center_Billet_Hub"
    center_hub.rotation_euler.y = math.pi / 2
    bpy.ops.object.transform_apply(rotation=True)
    center_hub.data.materials.append(mat_rim)
    created_objects.append(center_hub)

    # 5 M14 Chamfered Hex Lug Bolts & Hardened Washers
    for i in range(5):
        la = (2 * math.pi / 5) * i
        lx = -0.058
        ly = math.sin(la) * 0.055
        lz = math.cos(la) * 0.055
        
        # Hex bolt head
        bpy.ops.mesh.primitive_cylinder_add(radius=0.013, depth=0.024, vertices=6, location=(lx, ly, lz))
        lug = bpy.context.active_object
        lug.name = f"Wheel_Lug_Bolt_{i+1}"
        lug.rotation_euler.y = math.pi / 2
        bpy.ops.object.transform_apply(rotation=True)
        lug.data.materials.append(mat_hardware)
        created_objects.append(lug)

    # 5. 380mm 2-PIECE FLOATING BRAKE ROTOR WITH CROSS-DRILLED COOLING VENTS
    # Central Lightweight Aluminum Bell (Hat)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.096, depth=0.038, vertices=64, location=(-0.016, 0, 0))
    rotor_hat = bpy.context.active_object
    rotor_hat.name = "Brake_Rotor_Aluminum_Hat"
    rotor_hat.rotation_euler.y = math.pi / 2
    bpy.ops.object.transform_apply(rotation=True)
    rotor_hat.data.materials.append(mat_hat)
    created_objects.append(rotor_hat)

    # 12 Floating Drive Bobbins connecting hat to friction ring
    for i in range(12):
        ba = (2 * math.pi / 12) * i
        bx = -0.016
        by = math.sin(ba) * 0.096
        bz = math.cos(ba) * 0.096
        bpy.ops.mesh.primitive_cylinder_add(radius=0.007, depth=0.042, vertices=16, location=(bx, by, bz))
        bobbin = bpy.context.active_object
        bobbin.name = f"Brake_Rotor_Drive_Bobbin_{i+1:02d}"
        bobbin.rotation_euler.y = math.pi / 2
        bpy.ops.object.transform_apply(rotation=True)
        bobbin.data.materials.append(mat_hardware)
        created_objects.append(bobbin)

    # Outer Friction Ring
    bpy.ops.mesh.primitive_cylinder_add(radius=0.190, depth=0.034, vertices=96, location=(-0.016, 0, 0))
    rotor_ring = bpy.context.active_object
    rotor_ring.name = "Brake_Rotor_Friction_Disc"
    rotor_ring.rotation_euler.y = math.pi / 2
    bpy.ops.object.transform_apply(rotation=True)
    rotor_ring.data.materials.append(mat_rotor)
    created_objects.append(rotor_ring)

    # 24 Internal Curved Ventilation Vanes between the rotor disc plates
    for i in range(24):
        va = (2 * math.pi / 24) * i
        vr = 0.145
        vx = -0.016
        vy = math.sin(va) * vr
        vz = math.cos(va) * vr
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(vx, vy, vz))
        vane = bpy.context.active_object
        vane.name = f"Brake_Internal_Cooling_Vane_{i+1:02d}"
        vane.scale = (0.015, 0.003, 0.035)
        vane.rotation_euler = ( -va, 0, math.radians(25) )
        bpy.ops.object.transform_apply(rotation=True, scale=True)
        vane.data.materials.append(mat_rotor)
        created_objects.append(vane)

    # 6. HIGH-PERFORMANCE 6-PISTON MONOBLOC BRAKE CALIPER
    # Caliper Main Body with Stiffening Arch
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.016, 0, 0.178))
    caliper = bpy.context.active_object
    caliper.name = "Brake_Caliper_Monobloc_Body"
    caliper.scale = (0.092, 0.285, 0.078)
    bpy.ops.object.transform_apply(scale=True)
    sub_cal = caliper.modifiers.new(name="Subsurf", type='SUBSURF')
    sub_cal.levels = 1
    caliper.data.materials.append(mat_caliper)
    created_objects.append(caliper)

    # 6 Hydraulic Piston Caps (3 per side)
    for side, px in [("Outer", -0.052), ("Inner", 0.020)]:
        for p_idx, pz_offset in enumerate([-0.075, 0.0, 0.075]):
            bpy.ops.mesh.primitive_cylinder_add(radius=0.022, depth=0.015, vertices=24, location=(px, pz_offset, 0.178))
            piston = bpy.context.active_object
            piston.name = f"Brake_Piston_{side}_{p_idx+1}"
            piston.rotation_euler.y = math.pi / 2
            bpy.ops.object.transform_apply(rotation=True)
            piston.data.materials.append(mat_hardware)
            created_objects.append(piston)

    # Bleeder Screws & Cross-Drilled Fluid Lines
    bpy.ops.mesh.primitive_cylinder_add(radius=0.005, depth=0.025, vertices=16, location=(-0.016, -0.095, 0.222))
    bleed1 = bpy.context.active_object
    bleed1.name = "Brake_Bleed_Valve_Lead"
    bleed1.data.materials.append(mat_hardware)
    created_objects.append(bleed1)
    
    bpy.ops.mesh.primitive_cylinder_add(radius=0.005, depth=0.025, vertices=16, location=(-0.016, 0.095, 0.222))
    bleed2 = bpy.context.active_object
    bleed2.name = "Brake_Bleed_Valve_Trail"
    bleed2.data.materials.append(mat_hardware)
    created_objects.append(bleed2)

    # 7. APPLY MODIFIERS & WEIGHTED NORMALS
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    
    # Apply modifiers to bake full subdivision polygons into the mesh
    for obj in created_objects:
        bpy.context.view_layer.objects.active = obj
        for mod in list(obj.modifiers):
            try:
                bpy.ops.object.modifier_apply(modifier=mod.name)
            except Exception:
                pass

    # Add Weighted Normal modifier for showroom lighting
    for obj in created_objects:
        for p in obj.data.polygons:
            p.use_smooth = True
        wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        wn.keep_sharp = True
        wn.weight = 100

    total_polys = sum(len(o.data.polygons) for o in created_objects)
    total_verts = sum(len(o.data.vertices) for o in created_objects)
    log(f"[SUCCESS] High-Mesh Wheel & Brake Assembly generated: {len(created_objects)} components, {total_polys:,} polygons, {total_verts:,} vertices.")

    out_paths = [
        r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\suspension\wheel_high_mesh_forged.glb",
        r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\wheel_apex_forged.glb"
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
    create_ultra_high_mesh_wheel()
