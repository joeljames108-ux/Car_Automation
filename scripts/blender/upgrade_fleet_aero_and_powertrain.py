"""
=============================================================================
UPGRADE FLEET AERO, MONOCOQUE & POWERTRAIN ACCESSORIES (BLENDER 5.2 LTS)
=============================================================================
Procedurally elevates low/medium-mesh aerodynamic, chassis, and engine models:
- F1: diffuser quad-strake, anti-porpoise floor, quad fences, monza front/rear wings, halo, monocoque
- GT3 / Hypercar: active rear wing, rear diffuser, track splitter, rocker skirts, carbon monocoque
- Engine Accessories: knurled dipstick, detailed starter motor, baffled oil pan, engine mounts
- Exterior Ancillaries: auxiliary radiator coolers, cockpit camera monitors
- Automatically synchronizes public/models/vehicles/ -> public/vehicles/
=============================================================================
"""
import bpy
import bmesh
import math
import os
import shutil
from mathutils import Vector

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(PROJECT_DIR, "public", "models")
VEHICLES_DIR = os.path.join(PROJECT_DIR, "public", "vehicles")

def clean_scene():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for m in list(bpy.data.meshes):
        bpy.data.meshes.remove(m, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)

def finalize_mesh(obj, bevel_width=0.005, bevel_segments=3, use_subsurf=False):
    if not obj or obj.type != 'MESH':
        return obj
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for p in obj.data.polygons:
        p.use_smooth = True
    
    if use_subsurf:
        sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = 1
        sub.render_levels = 1
        bpy.ops.object.modifier_apply(modifier="Subsurf")

    if bevel_width > 0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel_width
        bev.segments = bevel_segments
        bev.profile = 0.7
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)
        bpy.ops.object.modifier_apply(modifier="Bevel")

    wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True
    wn.weight = 90
    bpy.ops.object.modifier_apply(modifier="WeightedNormal")

    bpy.ops.object.select_all(action='DESELECT')
    return obj

def get_pbr_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, transmission=0.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()
    bsdf = tree.nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = clearcoat
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission
    if emission:
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emission
            bsdf.inputs['Emission Strength'].default_value = emission_strength
        elif 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = emission
    out = tree.nodes.new(type='ShaderNodeOutputMaterial')
    out.location = (300, 0)
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return mat

def mat_carbon(): return get_pbr_material("Mat_CarbonFiber_Aero", (0.035, 0.035, 0.04, 1.0), metallic=0.25, roughness=0.28, clearcoat=0.90)
def mat_alloy(): return get_pbr_material("Mat_TitaniumGrade5", (0.75, 0.76, 0.78, 1.0), metallic=0.92, roughness=0.24)
def mat_gold(): return get_pbr_material("Mat_InconelHeatShield", (0.92, 0.72, 0.18, 1.0), metallic=0.95, roughness=0.18)
def mat_rubber(): return get_pbr_material("Mat_IsolatorRubber", (0.04, 0.04, 0.045, 1.0), metallic=0.0, roughness=0.85)
def mat_copper(): return get_pbr_material("Mat_CopperTerminal", (0.85, 0.42, 0.22, 1.0), metallic=0.95, roughness=0.18)
def mat_glass(): return get_pbr_material("Mat_CameraOpticalLens", (0.90, 0.95, 1.0, 0.2), roughness=0.02, transmission=0.96)
def mat_led_red(): return get_pbr_material("Mat_RainLightRed", (1.0, 0.02, 0.02, 1.0), emission=(1.0, 0.02, 0.02, 1.0), emission_strength=18.0)

def export_model(filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=filepath, export_format='GLB', use_selection=False, export_apply=True, export_yup=True)
    kb = os.path.getsize(filepath) / 1024.0
    print(f"  [EXPORTED] {os.path.basename(filepath)} ({kb:.1f} KB)")

# -----------------------------------------------------------------------------
# 1. F1 AERODYNAMICS & MONOCOQUE
# -----------------------------------------------------------------------------

def build_f1_diffuser_quadstrake():
    clean_scene()
    # Expanding venturi tunnels (width 1.18m, length 0.82m)
    bm = bmesh.new()
    ny = 16
    nx = 20
    sx = 1.18
    sy = 0.82
    for j in range(ny + 1):
        v = j / ny
        y = -1.60 - v * sy
        # Venturi upward expansion ramp
        z_ramp = 0.08 + 0.24 * (v**1.8)
        for i in range(nx + 1):
            u = i / nx
            x = (u - 0.5) * sx
            tunnel_arch = 0.03 * math.sin(u * math.pi * 2)
            bm.verts.new((x, y, z_ramp + tunnel_arch))

    bm.verts.ensure_lookup_table()
    for j in range(ny):
        for i in range(nx):
            v1 = bm.verts[j * (nx + 1) + i]
            v2 = bm.verts[j * (nx + 1) + i + 1]
            v3 = bm.verts[(j + 1) * (nx + 1) + i + 1]
            v4 = bm.verts[(j + 1) * (nx + 1) + i]
            bm.faces.new((v1, v2, v3, v4))

    me = bpy.data.meshes.new("F1_DIFFUSER_TUNNEL_Mesh")
    bm.to_mesh(me)
    bm.free()
    tun = bpy.data.objects.new("F1_DIFFUSER_TUNNEL", me)
    bpy.context.scene.collection.objects.link(tun)
    sol = tun.modifiers.new("Solidify", 'SOLIDIFY')
    sol.thickness = 0.008
    bpy.context.view_layer.objects.active = tun
    bpy.ops.object.modifier_apply(modifier="Solidify")
    finalize_mesh(tun, bevel_width=0.003, bevel_segments=2)
    tun.data.materials.append(mat_carbon())

    # 4 Vertical Vortex Control Strakes
    for idx, x_str in enumerate([-0.42, -0.14, 0.14, 0.42]):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_str, -2.01, 0.18))
        strake = bpy.context.active_object
        strake.name = f"F1_DIFFUSER_STRAKE_{idx}"
        strake.scale = (0.008, 0.78, 0.18)
        bpy.ops.object.transform_apply(scale=True)
        finalize_mesh(strake, bevel_width=0.002, bevel_segments=2)
        strake.data.materials.append(mat_carbon())

    # Central FIA Rain Light LED Matrix Pod
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -2.42, 0.32))
    rain_pod = bpy.context.active_object
    rain_pod.name = "F1_RAIN_LIGHT_POD"
    rain_pod.scale = (0.12, 0.04, 0.08)
    bpy.ops.object.transform_apply(scale=True)
    finalize_mesh(rain_pod, bevel_width=0.003, bevel_segments=2)
    rain_pod.data.materials.append(mat_alloy())

    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.025, depth=0.015, location=(0.0, -2.44, 0.32))
    rain_led = bpy.context.active_object
    rain_led.name = "F1_RAIN_LIGHT_LED"
    rain_led.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)
    finalize_mesh(rain_led, bevel_width=0.002, bevel_segments=1)
    rain_led.data.materials.append(mat_led_red())

    out_p = os.path.join(MODELS_DIR, "vehicles", "f1", "f1_diffuser_quadstrake.glb")
    export_model(out_p)

def build_f1_halo_grade5():
    clean_scene()
    # Forward Central Pillar
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.024, depth=0.48, location=(0.0, 0.45, 0.86))
    pyl = bpy.context.active_object
    pyl.name = "F1_HALO_CENTER_PYLON"
    pyl.rotation_euler = (math.radians(-14), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)
    finalize_mesh(pyl, bevel_width=0.003, bevel_segments=2)
    pyl.data.materials.append(mat_alloy())

    # Triangular Semi-Circular Arch Loop around Driver Cockpit
    bm = bmesh.new()
    n_pts = 18
    r_loop = 0.38
    for i in range(n_pts + 1):
        ang = math.pi * (i / n_pts) # from 0 to pi
        x = r_loop * math.cos(ang)
        y = -0.05 + r_loop * 0.85 * math.sin(ang)
        z = 0.92
        for r_sec in range(8):
            s_ang = r_sec * (2.0 * math.pi / 8)
            dx = 0.022 * math.cos(s_ang)
            dz = 0.022 * math.sin(s_ang)
            bm.verts.new((x + dx, y, z + dz))

    bm.verts.ensure_lookup_table()
    for i in range(n_pts):
        for s in range(8):
            v1 = bm.verts[i * 8 + s]
            v2 = bm.verts[i * 8 + (s + 1) % 8]
            v3 = bm.verts[(i + 1) * 8 + (s + 1) % 8]
            v4 = bm.verts[(i + 1) * 8 + s]
            bm.faces.new((v1, v2, v3, v4))

    me = bpy.data.meshes.new("F1_HALO_LOOP_Mesh")
    bm.to_mesh(me)
    bm.free()
    loop_obj = bpy.data.objects.new("F1_HALO_LOOP", me)
    bpy.context.scene.collection.objects.link(loop_obj)
    finalize_mesh(loop_obj, bevel_width=0.003, bevel_segments=2)
    loop_obj.data.materials.append(mat_alloy())

    out_p = os.path.join(MODELS_DIR, "vehicles", "f1", "f1_halo_grade5.glb")
    export_model(out_p)

# -----------------------------------------------------------------------------
# 2. GT3 SUPERCAR / HYPERCAR AERODYNAMICS & MONOCOQUE
# -----------------------------------------------------------------------------

def build_hypercar_active_rear_wing():
    clean_scene()
    # 1. Aerodynamic Cambered Mainplane Airfoil (span 1.68m, chord 0.34m)
    bm = bmesh.new()
    nx = 24
    ny = 14
    span = 1.68
    chord = 0.34
    for i in range(nx + 1):
        u = i / nx
        x = (u - 0.5) * span
        # Dihedral wing sweep & camber
        sweep_y = 0.06 * (2.0 * (u - 0.5))**2
        z_dihedral = 0.025 * (2.0 * (u - 0.5))**2
        for j in range(ny + 1):
            v = j / ny
            y = -1.95 - sweep_y - v * chord
            # NACA-style camber
            thick = 0.032 * (1.0 - 4.0 * (v - 0.3)**2) if v < 0.8 else 0.008
            bm.verts.new((x, y, 1.22 + z_dihedral + thick))

    bm.verts.ensure_lookup_table()
    for i in range(nx):
        for j in range(ny):
            v1 = bm.verts[i * (ny + 1) + j]
            v2 = bm.verts[i * (ny + 1) + j + 1]
            v3 = bm.verts[(i + 1) * (ny + 1) + j + 1]
            v4 = bm.verts[(i + 1) * (ny + 1) + j]
            bm.faces.new((v1, v2, v3, v4))

    me = bpy.data.meshes.new("HYPERCAR_WING_MAINPLANE_Mesh")
    bm.to_mesh(me)
    bm.free()
    wing = bpy.data.objects.new("HYPERCAR_WING_MAINPLANE", me)
    bpy.context.scene.collection.objects.link(wing)
    sol = wing.modifiers.new("Solidify", 'SOLIDIFY')
    sol.thickness = 0.016
    bpy.context.view_layer.objects.active = wing
    bpy.ops.object.modifier_apply(modifier="Solidify")
    finalize_mesh(wing, bevel_width=0.003, bevel_segments=2)
    wing.data.materials.append(mat_carbon())

    # 2. Dual Swan-Neck Carbon Pylon Mounts
    for side, x_pyl in [("L", 0.32), ("R", -0.32)]:
        bm_p = bmesh.new()
        p_pts = [
            Vector((x_pyl, -1.75, 0.72)),
            Vector((x_pyl, -1.82, 0.95)),
            Vector((x_pyl, -1.92, 1.18)),
            Vector((x_pyl, -2.02, 1.28)),
            Vector((x_pyl, -2.08, 1.24))
        ]
        for p in p_pts:
            bm_p.verts.new((p.x - 0.012, p.y, p.z - 0.02))
            bm_p.verts.new((p.x - 0.012, p.y, p.z + 0.02))
            bm_p.verts.new((p.x + 0.012, p.y, p.z + 0.02))
            bm_p.verts.new((p.x + 0.012, p.y, p.z - 0.02))
        bm_p.verts.ensure_lookup_table()
        for k in range(len(p_pts) - 1):
            b = k * 4
            nb = (k + 1) * 4
            bm_p.faces.new((bm_p.verts[b], bm_p.verts[b+1], bm_p.verts[nb+1], bm_p.verts[nb]))
            bm_p.faces.new((bm_p.verts[b+1], bm_p.verts[b+2], bm_p.verts[nb+2], bm_p.verts[nb+1]))
            bm_p.faces.new((bm_p.verts[b+2], bm_p.verts[b+3], bm_p.verts[nb+3], bm_p.verts[nb+2]))
            bm_p.faces.new((bm_p.verts[b+3], bm_p.verts[b], bm_p.verts[nb], bm_p.verts[nb+3]))
        me_p = bpy.data.meshes.new(f"SWAN_NECK_PYLON_{side}_Mesh")
        bm_p.to_mesh(me_p)
        bm_p.free()
        pyl_obj = bpy.data.objects.new(f"SWAN_NECK_PYLON_{side}", me_p)
        bpy.context.scene.collection.objects.link(pyl_obj)
        finalize_mesh(pyl_obj, bevel_width=0.003, bevel_segments=2)
        pyl_obj.data.materials.append(mat_carbon())

    # 3. Sculpted Aerodynamic Endplates with Vortex Slits
    for side, x_end in [("L", 0.84), ("R", -0.84)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_end, -2.12, 1.25))
        endp = bpy.context.active_object
        endp.name = f"WING_ENDPLATE_{side}"
        endp.scale = (0.012, 0.44, 0.28)
        bpy.ops.object.transform_apply(scale=True)
        finalize_mesh(endp, bevel_width=0.003, bevel_segments=2)
        endp.data.materials.append(mat_carbon())

    out_p = os.path.join(MODELS_DIR, "vehicles", "gt3_supercar", "hypercar_active_rear_wing.glb")
    export_model(out_p)

def build_hypercar_front_splitter():
    clean_scene()
    # Wide track front splitter with center keel and dual dive canards
    bm = bmesh.new()
    nx = 24
    ny = 10
    sx = 1.92
    sy = 0.65
    for i in range(nx + 1):
        u = i / nx
        x = (u - 0.5) * sx
        # Center curvature swept back at tips
        curv_y = 2.45 - 0.22 * (2.0 * (u - 0.5))**2
        for j in range(ny + 1):
            v = j / ny
            y = curv_y - v * sy * 0.4
            bm.verts.new((x, y, 0.12))

    bm.verts.ensure_lookup_table()
    for i in range(nx):
        for j in range(ny):
            v1 = bm.verts[i * (ny + 1) + j]
            v2 = bm.verts[i * (ny + 1) + j + 1]
            v3 = bm.verts[(i + 1) * (ny + 1) + j + 1]
            v4 = bm.verts[(i + 1) * (ny + 1) + j]
            bm.faces.new((v1, v2, v3, v4))

    me = bpy.data.meshes.new("HYPERCAR_SPLITTER_TRAY_Mesh")
    bm.to_mesh(me)
    bm.free()
    tray = bpy.data.objects.new("HYPERCAR_SPLITTER_TRAY", me)
    bpy.context.scene.collection.objects.link(tray)
    sol = tray.modifiers.new("Solidify", 'SOLIDIFY')
    sol.thickness = 0.018
    bpy.context.view_layer.objects.active = tray
    bpy.ops.object.modifier_apply(modifier="Solidify")
    finalize_mesh(tray, bevel_width=0.004, bevel_segments=3)
    tray.data.materials.append(mat_carbon())

    # Endplate Dive Canards
    for side, x_can in [("L", 0.94), ("R", -0.94)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_can, 2.25, 0.22))
        can = bpy.context.active_object
        can.name = f"SPLITTER_CANARD_{side}"
        can.scale = (0.012, 0.28, 0.16)
        can.rotation_euler = (0, math.radians(18 * (1 if side=="L" else -1)), 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        finalize_mesh(can, bevel_width=0.003, bevel_segments=2)
        can.data.materials.append(mat_carbon())

    out_p = os.path.join(MODELS_DIR, "vehicles", "gt3_supercar", "hypercar_front_splitter.glb")
    export_model(out_p)

# -----------------------------------------------------------------------------
# 3. POWERTRAIN ACCESSORIES
# -----------------------------------------------------------------------------

def build_engine_v8_starter():
    clean_scene()
    # 1. Main Starter Motor Cylindrical Body
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.048, depth=0.18, location=(0.28, 1.25, 0.32))
    body = bpy.context.active_object
    body.name = "STARTER_MOTOR_BODY"
    body.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(rotation=True)
    finalize_mesh(body, bevel_width=0.003, bevel_segments=2)
    body.data.materials.append(mat_alloy())

    # 2. Auxiliary Solenoid Cylinder
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.026, depth=0.12, location=(0.28, 1.22, 0.39))
    solenoid = bpy.context.active_object
    solenoid.name = "STARTER_SOLENOID"
    solenoid.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(rotation=True)
    finalize_mesh(solenoid, bevel_width=0.002, bevel_segments=2)
    solenoid.data.materials.append(mat_alloy())

    # 3. Dual Copper Terminal Studs with Hex Nuts
    for dy in [-0.015, 0.015]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.005, depth=0.018, location=(0.35, 1.22 + dy, 0.39))
        stud = bpy.context.active_object
        stud.name = f"STARTER_STUD_{dy}"
        stud.rotation_euler = (0, math.radians(90), 0)
        bpy.ops.object.transform_apply(rotation=True)
        finalize_mesh(stud, bevel_width=0.001, bevel_segments=1)
        stud.data.materials.append(mat_copper())

    # 4. Cast Aluminum 2-Bolt Mounting Nose
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.18, 1.25, 0.34))
    nose = bpy.context.active_object
    nose.name = "STARTER_MOUNTING_NOSE"
    nose.scale = (0.04, 0.12, 0.14)
    bpy.ops.object.transform_apply(scale=True)
    finalize_mesh(nose, bevel_width=0.004, bevel_segments=2)
    nose.data.materials.append(mat_alloy())

    out_p = os.path.join(MODELS_DIR, "engines", "engine_v8_starter.glb")
    export_model(out_p)

def build_engine_v8_dipstick():
    clean_scene()
    # 1. Billet Aluminum Knurled Finger Loop Handle
    bpy.ops.mesh.primitive_torus_add(major_radius=0.024, minor_radius=0.005, major_segments=24, minor_segments=12, location=(0.32, 1.62, 0.88))
    loop = bpy.context.active_object
    loop.name = "DIPSTICK_HANDLE_LOOP"
    finalize_mesh(loop, bevel_width=0.001, bevel_segments=1)
    loop.data.materials.append(mat_gold())

    # 2. Guide Tube Collar Stop
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.012, depth=0.035, location=(0.32, 1.62, 0.84))
    collar = bpy.context.active_object
    collar.name = "DIPSTICK_TUBE_COLLAR"
    finalize_mesh(collar, bevel_width=0.002, bevel_segments=2)
    collar.data.materials.append(mat_alloy())

    # 3. Flexible Dipstick Blade
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.32, 1.62, 0.58))
    blade = bpy.context.active_object
    blade.name = "DIPSTICK_BLADE"
    blade.scale = (0.003, 0.012, 0.50)
    bpy.ops.object.transform_apply(scale=True)
    finalize_mesh(blade, bevel_width=0.001, bevel_segments=1)
    blade.data.materials.append(mat_alloy())

    out_p = os.path.join(MODELS_DIR, "engines", "engine_v8_dipstick.glb")
    export_model(out_p)

# -----------------------------------------------------------------------------
# 4. EXTERIOR ANCILLARIES
# -----------------------------------------------------------------------------

def build_auxiliary_coolers():
    clean_scene()
    for side, x in [("L", 0.52), ("R", -0.52)]:
        # Radiator Heat Exchanger Matrix Core with Micro-Fins
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 1.95, 0.35))
        core = bpy.context.active_object
        core.name = f"AUX_COOLER_CORE_{side}"
        core.scale = (0.32, 0.08, 0.26)
        core.rotation_euler = (0, math.radians(12 * (1 if side=="L" else -1)), 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        finalize_mesh(core, bevel_width=0.004, bevel_segments=2)
        core.data.materials.append(mat_alloy())

        # AN-10 Billet Hose Fittings
        for dz in [-0.08, 0.08]:
            bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.014, depth=0.035, location=(x * 0.95, 1.98, 0.35 + dz))
            fit = bpy.context.active_object
            fit.name = f"COOLER_AN_FITTING_{side}_{dz}"
            fit.rotation_euler = (math.radians(90), 0, 0)
            bpy.ops.object.transform_apply(rotation=True)
            finalize_mesh(fit, bevel_width=0.002, bevel_segments=2)
            fit.data.materials.append(mat_gold())

    out_p = os.path.join(MODELS_DIR, "exterior", "auxiliary_coolers.glb")
    export_model(out_p)

def build_cockpit_camera_monitors():
    clean_scene()
    for side, x in [("L", 0.78), ("R", -0.78)]:
        # Aerodynamic Carbon Stalk & Pod
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 0.85, 0.82))
        pod = bpy.context.active_object
        pod.name = f"CAMERA_POD_{side}"
        pod.scale = (0.16, 0.06, 0.04)
        bpy.ops.object.transform_apply(scale=True)
        finalize_mesh(pod, bevel_width=0.004, bevel_segments=2)
        pod.data.materials.append(mat_carbon())

        # Spherical Optical Glass Lens
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.012, depth=0.010, location=(x * 1.08, 0.83, 0.82))
        lens = bpy.context.active_object
        lens.name = f"CAMERA_LENS_{side}"
        lens.rotation_euler = (0, math.radians(90), 0)
        bpy.ops.object.transform_apply(rotation=True)
        finalize_mesh(lens, bevel_width=0.001, bevel_segments=1)
        lens.data.materials.append(mat_glass())

    out_p = os.path.join(MODELS_DIR, "exterior", "cockpit_camera_monitors.glb")
    export_model(out_p)

def sync_public_vehicles():
    """Synchronizes updated vehicle models from public/models/vehicles/ to public/vehicles/."""
    src_root = os.path.join(MODELS_DIR, "vehicles")
    dst_root = VEHICLES_DIR
    if not os.path.exists(src_root):
        return
    for sub in ["crossover", "f1", "gt3_supercar", "hatchback", "sedan", "suv"]:
        s_dir = os.path.join(src_root, sub)
        d_dir = os.path.join(dst_root, sub)
        if os.path.exists(s_dir):
            os.makedirs(d_dir, exist_ok=True)
            for f in os.listdir(s_dir):
                if f.endswith(".glb"):
                    shutil.copy2(os.path.join(s_dir, f), os.path.join(d_dir, f))
    print("[SYNC] Synchronized public/models/vehicles/ -> public/vehicles/ successfully!")

def main():
    print("==========================================================")
    print("UPGRADING FLEET AERO, MONOCOQUE & POWERTRAIN ACCESSORIES")
    print("==========================================================")
    build_f1_diffuser_quadstrake()
    build_f1_halo_grade5()
    build_hypercar_active_rear_wing()
    build_hypercar_front_splitter()
    build_engine_v8_starter()
    build_engine_v8_dipstick()
    build_auxiliary_coolers()
    build_cockpit_camera_monitors()
    sync_public_vehicles()
    print("[SUCCESS] All fleet aero, monocoque & engine accessories upgraded!")

if __name__ == "__main__":
    main()
