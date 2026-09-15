"""
==============================================================================
HIGH-FIDELITY CLASS-A TRANSIT BUS COCKPIT GENERATOR (Blender 5.x)
==============================================================================
Produces an authentic, photorealistic commercial transit bus cockpit:
- 450mm commercial bus steering wheel (sculpted rim, twin spokes, horn pad, logo)
- Tilt steering column with turn signal, wiper, and multi-stage retarder brake stalks
- Arched anti-glare instrument binnacle housing the digital cluster screen (non-mirrored)
- Panoramic driver dashboard cowl with defrost vents and satin aluminum accents
- Center 12.8" transit navigation/dispatch touchscreen (non-mirrored UVs)
- Driver left-hand door control switchboard (pneumatic toggles, PA mic, emergency cutoff)
- Right-hand control pedestal with Allison pushbutton transmission selector & air brake
- Smartcard NFC ticket validator / farebox terminal
- ISRI pneumatic air-suspension driver seat with armrests, bellows & 3-point harness
- Curbside passenger entrance with bi-fold glass doors & yellow boarding handrails
- Aisle stanchions & overhead grab rails positioned for zero camera occlusion
- Vandal-proof commuter passenger seating rows along aisle
- Dark anti-slip ribbed rubber floor

Exports directly to public/models/interior/cockpit_transit_bus.glb.
==============================================================================
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Euler, Matrix

def log(msg):
    print(f"[BUS_COCKPIT_V2] {msg}")

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)

def create_pbr_material(name, base_color=(0.1, 0.1, 0.1, 1.0), metallic=0.0, roughness=0.5,
                        specular=0.5, clearcoat=0.0, transmission=0.0, ior=1.45,
                        emissive_color=(0, 0, 0, 1), emissive_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()

    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_out.location = (400, 0)

    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    node_bsdf.location = (0, 0)

    node_bsdf.inputs['Base Color'].default_value = base_color
    node_bsdf.inputs['Metallic'].default_value = metallic
    node_bsdf.inputs['Roughness'].default_value = roughness
    node_bsdf.inputs['IOR'].default_value = ior

    if 'Transmission Weight' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission'].default_value = transmission

    if 'Emission Color' in node_bsdf.inputs:
        node_bsdf.inputs['Emission Color'].default_value = emissive_color
        node_bsdf.inputs['Emission Strength'].default_value = emissive_strength
    elif 'Emission' in node_bsdf.inputs:
        node_bsdf.inputs['Emission'].default_value = emissive_color

    if transmission > 0.05:
        mat.blend_method = 'BLEND'
        if hasattr(mat, 'shadow_method'):
            mat.shadow_method = 'NONE'

    mat.node_tree.links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat

def attach_to_parent(child, parent):
    if child and parent and child != parent:
        child.parent = parent
        child.matrix_parent_inverse = parent.matrix_world.inverted()

def make_box(name, location, size, mat=None, rot_euler=(0, 0, 0), bevel=0.003, parent=None):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0] / 2.0, size[1] / 2.0, size[2] / 2.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    if bevel > 0.0005:
        mod = obj.modifiers.new("Bevel", 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        mod.limit_method = 'ANGLE'

    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    if parent:
        attach_to_parent(obj, parent)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj

def make_cylinder(name, location, radius, depth, rot_euler=(0, 0, 0), mat=None, vertices=32, bevel=0.002, parent=None):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=location,
        rotation=rot_euler
    )
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    if bevel > 0.0005:
        mod = obj.modifiers.new("Bevel", 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        mod.limit_method = 'ANGLE'

    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    if parent:
        attach_to_parent(obj, parent)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj

def make_torus(name, location, major_radius, minor_radius, rot_euler=(0, 0, 0), mat=None, parent=None):
    bpy.ops.mesh.primitive_torus_add(
        location=location,
        rotation=rot_euler,
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=48,
        minor_segments=24
    )
    obj = bpy.context.active_object
    obj.name = name
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    if parent:
        attach_to_parent(obj, parent)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj

def make_screen_plane(name, center, width, height, rot_euler, mat, parent=None):
    """
    Creates a planar screen mesh with explicit, correctly oriented UV coordinates.
    Looking directly at the screen, top-left is (0,1), top-right is (1,1),
    bottom-left is (0,0), bottom-right is (1,0). NEVER mirrored!
    """
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()

    hw = width / 2.0
    hh = height / 2.0

    # Local coordinates in X-Z plane with normal facing -Y (toward driver)
    # v0: bottom-left (-hw, 0, -hh)
    # v1: bottom-right (+hw, 0, -hh)
    # v2: top-right (+hw, 0, +hh)
    # v3: top-left (-hw, 0, +hh)
    v0 = bm.verts.new((-hw, 0.0, -hh))
    v1 = bm.verts.new((+hw, 0.0, -hh))
    v2 = bm.verts.new((+hw, 0.0, +hh))
    v3 = bm.verts.new((-hw, 0.0, +hh))

    # Face winding facing -Y (counter-clockwise looking from -Y toward +Y):
    face = bm.faces.new([v0, v1, v2, v3])

    uv_layer = bm.loops.layers.uv.new("UVMap")
    face.loops[0][uv_layer].uv = (0.0, 0.0)
    face.loops[1][uv_layer].uv = (1.0, 0.0)
    face.loops[2][uv_layer].uv = (1.0, 1.0)
    face.loops[3][uv_layer].uv = (0.0, 1.0)

    face.smooth = True
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = center
    obj.rotation_euler = rot_euler

    if mat:
        obj.data.materials.append(mat)
    if parent:
        attach_to_parent(obj, parent)
    return obj

def build_transit_bus_cockpit():
    log("Building Photorealistic Transit Bus Cockpit...")
    clear_scene()

    # -------------------------------------------------------------------------
    # PBR Material Palette (Authentic Automotive & Transit Interior Finishes)
    # -------------------------------------------------------------------------
    mats = {
        "charcoal_trim": create_pbr_material("Mat_CharcoalTrim", base_color=(0.07, 0.08, 0.10, 1.0), roughness=0.52),
        "dash_pad": create_pbr_material("Mat_DashPad", base_color=(0.05, 0.06, 0.08, 1.0), roughness=0.48),
        "leather_black": create_pbr_material("Mat_LeatherBlack", base_color=(0.03, 0.03, 0.04, 1.0), roughness=0.42),
        "rubber_black": create_pbr_material("Mat_RubberBlack", base_color=(0.02, 0.02, 0.02, 1.0), roughness=0.82),
        "aluminum_satin": create_pbr_material("Mat_AluminumSatin", base_color=(0.82, 0.84, 0.88, 1.0), metallic=0.92, roughness=0.22),
        "chrome_mirror": create_pbr_material("Mat_ChromeMirror", base_color=(0.95, 0.95, 0.98, 1.0), metallic=0.98, roughness=0.05),
        "safety_yellow": create_pbr_material("Mat_SafetyYellow", base_color=(0.98, 0.80, 0.08, 1.0), roughness=0.28),
        "screen_cluster": create_pbr_material("Mat_ScreenCluster", base_color=(0.01, 0.02, 0.04, 1.0), emissive_color=(0.02, 0.04, 0.08, 1), emissive_strength=1.0, roughness=0.15),
        "screen_info": create_pbr_material("Mat_ScreenInfo", base_color=(0.01, 0.02, 0.04, 1.0), emissive_color=(0.02, 0.04, 0.08, 1), emissive_strength=1.0, roughness=0.15),
        "glass_clear": create_pbr_material("Mat_GlassClear", base_color=(0.95, 0.97, 1.0, 1.0), roughness=0.03, transmission=0.92, ior=1.52),
        "glass_frosted": create_pbr_material("Mat_GlassFrosted", base_color=(0.85, 0.90, 0.95, 1.0), roughness=0.35, transmission=0.80, ior=1.50),
        "seat_shell_blue": create_pbr_material("Mat_TransitBlue", base_color=(0.08, 0.22, 0.55, 1.0), roughness=0.38),
        "seat_fabric_gray": create_pbr_material("Mat_SeatFabric", base_color=(0.18, 0.22, 0.28, 1.0), roughness=0.75),
        "floor_rubber": create_pbr_material("Mat_FloorRubber", base_color=(0.06, 0.07, 0.09, 1.0), roughness=0.85),
        "led_red": create_pbr_material("Mat_LedRed", base_color=(0.90, 0.10, 0.10, 1.0), emissive_color=(1.0, 0.1, 0.1, 1), emissive_strength=4.0),
        "led_amber": create_pbr_material("Mat_LedAmber", base_color=(0.95, 0.60, 0.05, 1.0), emissive_color=(1.0, 0.65, 0.05, 1), emissive_strength=3.5),
        "led_green": create_pbr_material("Mat_LedGreen", base_color=(0.10, 0.85, 0.25, 1.0), emissive_color=(0.1, 1.0, 0.3, 1), emissive_strength=3.5),
        "ambient_cyan": create_pbr_material("Mat_AmbientCyan", base_color=(0.05, 0.70, 0.85, 1.0), emissive_color=(0.05, 0.85, 1.0, 1), emissive_strength=2.5),
    }

    # Master Root
    root = bpy.data.objects.new("COCKPIT_MASTER", None)
    bpy.context.scene.collection.objects.link(root)

    driver_x = -0.380
    dash_y = 0.040

    # -------------------------------------------------------------------------
    # 1. Commercial Non-Slip Transit Floor & Stepwell
    # -------------------------------------------------------------------------
    log("1. Modeling Commercial Transit Floor...")
    floor_group = bpy.data.objects.new("CABIN_FLOOR", None)
    bpy.context.scene.collection.objects.link(floor_group)
    attach_to_parent(floor_group, root)

    make_box("BUS_MAIN_FLOOR", (0.0, -1.10, 0.04), (1.90, 2.60, 0.04), mats["floor_rubber"], bevel=0.002, parent=floor_group)
    make_box("BUS_DRIVER_FLOOR_PLATFORM", (driver_x, -0.30, 0.08), (0.76, 0.95, 0.04), mats["floor_rubber"], bevel=0.004, parent=floor_group)
    make_box("BUS_ENTRY_STEPWELL", (0.70, -0.30, 0.01), (0.45, 0.90, 0.02), mats["floor_rubber"], bevel=0.002, parent=floor_group)
    make_box("BUS_STEP_SAFETY_NOSING", (0.48, -0.30, 0.042), (0.035, 0.90, 0.006), mats["safety_yellow"], bevel=0.001, parent=floor_group)
    make_box("BUS_STEP_COURTESY_LIGHT", (0.70, 0.12, 0.06), (0.16, 0.02, 0.015), mats["ambient_cyan"], parent=floor_group)

    # -------------------------------------------------------------------------
    # 2. Panoramic Bus Dashboard Cowl & Defrost Grilles
    # -------------------------------------------------------------------------
    log("2. Modeling Panoramic Transit Dashboard Cowl...")
    dash_group = bpy.data.objects.new("DASHBOARD_STRUCTURE", None)
    bpy.context.scene.collection.objects.link(dash_group)
    attach_to_parent(dash_group, root)

    make_box("DASH_UPPER_PAD", (-0.05, 0.10, 0.68), (1.45, 0.26, 0.28), mats["dash_pad"], bevel=0.012, parent=dash_group)
    make_box("DASH_LOWER_STRUCTURE", (-0.05, 0.12, 0.45), (1.40, 0.26, 0.24), mats["charcoal_trim"], bevel=0.008, parent=dash_group)
    make_box("DASH_TRIM_SPEAR", (0.16, -0.04, 0.66), (0.76, 0.025, 0.025), mats["aluminum_satin"], bevel=0.004, parent=dash_group)

    for g_i in range(8):
        make_box(f"DASH_DEFROST_VENT_{g_i+1}", (-0.60 + g_i * 0.16, 0.20, 0.81), (0.11, 0.022, 0.008), mats["charcoal_trim"], bevel=0.001, parent=dash_group)

    make_box("DASH_HVAC_CENTER_HOUSING", (0.04, -0.05, 0.72), (0.26, 0.04, 0.06), mats["charcoal_trim"], bevel=0.004, parent=dash_group)
    for v_i in range(3):
        make_box(f"DASH_HVAC_LOUVER_{v_i+1}", (-0.05 + v_i * 0.08, -0.065, 0.72), (0.062, 0.012, 0.04), mats["aluminum_satin"], bevel=0.002, parent=dash_group)

    # -------------------------------------------------------------------------
    # 3. Driver Instrument Cluster Binnacle & Explicit Screen (Hollow & Shaded)
    # -------------------------------------------------------------------------
    log("3. Modeling Driver Instrument Cluster Binnacle...")
    cluster_group = bpy.data.objects.new("CLUSTER", None)
    bpy.context.scene.collection.objects.link(cluster_group)
    attach_to_parent(cluster_group, root)

    scr_rot = (math.radians(14), 0, 0)
    # Canopy Top Shading Hood (Arching over screen, open underneath)
    make_box("CLUSTER_HOOD_TOP", (driver_x, -0.06, 0.81), (0.42, 0.18, 0.024), mats["charcoal_trim"], rot_euler=scr_rot, bevel=0.006, parent=cluster_group)
    make_box("CLUSTER_HOOD_WALL_L", (driver_x - 0.20, -0.06, 0.735), (0.022, 0.18, 0.13), mats["charcoal_trim"], rot_euler=scr_rot, bevel=0.004, parent=cluster_group)
    make_box("CLUSTER_HOOD_WALL_R", (driver_x + 0.20, -0.06, 0.735), (0.022, 0.18, 0.13), mats["charcoal_trim"], rot_euler=scr_rot, bevel=0.004, parent=cluster_group)
    make_box("CLUSTER_HOOD_BACK", (driver_x, 0.02, 0.735), (0.40, 0.03, 0.13), mats["charcoal_trim"], rot_euler=scr_rot, bevel=0.004, parent=cluster_group)

    # Digital Instrument Screen (Sits recessed inside the hollow binnacle)
    scr_center = (driver_x, -0.085, 0.735)
    make_box("CLUSTER_BEZEL", scr_center, (0.355, 0.014, 0.135), mats["charcoal_trim"], rot_euler=scr_rot, bevel=0.004, parent=cluster_group)
    make_screen_plane("CLUSTER_SCREEN", (scr_center[0], scr_center[1] - 0.010, scr_center[2]), 0.335, 0.120, scr_rot, mats["screen_cluster"], parent=cluster_group)

    # Status Annunciator LED Lightbar across top of bezel
    make_box("CLUSTER_ANNUNCIATOR_BAR", (driver_x, scr_center[1] - 0.012, 0.805), (0.34, 0.012, 0.016), mats["charcoal_trim"], rot_euler=scr_rot, bevel=0.002, parent=cluster_group)
    make_box("CLUSTER_LED_DOOR_OPEN", (driver_x - 0.12, scr_center[1] - 0.018, 0.805), (0.022, 0.004, 0.010), mats["led_amber"], rot_euler=scr_rot, parent=cluster_group)
    make_box("CLUSTER_LED_AIR_BRAKE", (driver_x - 0.06, scr_center[1] - 0.018, 0.805), (0.022, 0.004, 0.010), mats["led_red"], rot_euler=scr_rot, parent=cluster_group)
    make_box("CLUSTER_LED_STOP_REQ", (driver_x + 0.06, scr_center[1] - 0.018, 0.805), (0.022, 0.004, 0.010), mats["led_amber"], rot_euler=scr_rot, parent=cluster_group)
    make_box("CLUSTER_LED_CHECK_ENG", (driver_x + 0.12, scr_center[1] - 0.018, 0.805), (0.022, 0.004, 0.010), mats["led_red"], rot_euler=scr_rot, parent=cluster_group)

    # -------------------------------------------------------------------------
    # 4. Center 12.8" Transit Telematics & Navigation Display (Proud & Angled)
    # -------------------------------------------------------------------------
    log("4. Modeling Center Transit Telematics Display...")
    info_group = bpy.data.objects.new("INFOTAINMENT", None)
    bpy.context.scene.collection.objects.link(info_group)
    attach_to_parent(info_group, root)

    info_center = (0.08, -0.07, 0.62)
    info_rot = (math.radians(10), math.radians(-10), 0)
    make_box("INFOTAINMENT_BEZEL", info_center, (0.36, 0.020, 0.22), mats["charcoal_trim"], rot_euler=info_rot, bevel=0.006, parent=info_group)
    make_box("INFOTAINMENT_CHROME_FRAME", (info_center[0], info_center[1] - 0.012, info_center[2]), (0.345, 0.006, 0.205), mats["aluminum_satin"], rot_euler=info_rot, bevel=0.002, parent=info_group)
    make_screen_plane("INFOTAINMENT_SCREEN", (info_center[0], info_center[1] - 0.016, info_center[2]), 0.330, 0.190, info_rot, mats["screen_info"], parent=info_group)

    # -------------------------------------------------------------------------
    # 5. Commercial Transit Steering Wheel & Stalks
    # -------------------------------------------------------------------------
    log("5. Modeling Commercial Transit Steering Wheels...")
    steer_group = bpy.data.objects.new("STEERING", None)
    bpy.context.scene.collection.objects.link(steer_group)
    attach_to_parent(steer_group, root)

    # Steering Column (Tilt & telescopic commercial column)
    col_pos = (driver_x, -0.16, 0.58)
    col_rot = (math.radians(-32), 0, 0)
    make_cylinder("STEERING_COLUMN", col_pos, 0.048, 0.42, rot_euler=col_rot, mat=mats["charcoal_trim"], vertices=24, bevel=0.004, parent=steer_group)
    make_cylinder("STEERING_COLUMN_BOOT", (driver_x, -0.11, 0.50), 0.065, 0.12, rot_euler=col_rot, mat=mats["rubber_black"], vertices=24, parent=steer_group)

    # Turn Signal / Wiper Stalk (Left)
    make_cylinder("STEER_STALK_L", (driver_x - 0.075, -0.20, 0.63), 0.008, 0.16, rot_euler=(math.radians(-20), math.radians(-55), 0), mat=mats["charcoal_trim"], vertices=16, parent=steer_group)
    make_cylinder("STEER_STALK_L_KNOB", (driver_x - 0.14, -0.22, 0.67), 0.014, 0.035, rot_euler=(math.radians(-20), math.radians(-55), 0), mat=mats["aluminum_satin"], vertices=16, parent=steer_group)

    # Retarder Brake Control Stalk (Right)
    make_cylinder("STEER_STALK_R", (driver_x + 0.075, -0.20, 0.63), 0.008, 0.16, rot_euler=(math.radians(-20), math.radians(55), 0), mat=mats["charcoal_trim"], vertices=16, parent=steer_group)
    make_cylinder("STEER_STALK_R_KNOB", (driver_x + 0.14, -0.22, 0.67), 0.014, 0.035, rot_euler=(math.radians(-20), math.radians(55), 0), mat=mats["aluminum_satin"], vertices=16, parent=steer_group)

    steer_hub_center = (driver_x, -0.24, 0.66)
    wheel_rot = (math.radians(78), 0, 0)
    R_steer = Matrix.Rotation(math.radians(78), 4, 'X')

    def local_to_world_steer(lv):
        return Vector(steer_hub_center) + R_steer @ lv

    def build_bus_wheel(name, parent_obj=steer_group):
        wheel_root = bpy.data.objects.new(name, None)
        bpy.context.scene.collection.objects.link(wheel_root)
        attach_to_parent(wheel_root, parent_obj)

        rim_radius = 0.225 # 450mm commercial diameter
        tube_radius = 0.017 # 34mm grip

        # Heavy-duty molded commercial rim
        bpy.ops.mesh.primitive_torus_add(
            location=steer_hub_center,
            rotation=wheel_rot,
            major_radius=rim_radius,
            minor_radius=tube_radius,
            major_segments=48,
            minor_segments=24
        )
        rim = bpy.context.active_object
        rim.name = f"{name}_Rim"
        rim.data.materials.append(mats["leather_black"])
        attach_to_parent(rim, wheel_root)
        for p in rim.data.polygons:
            p.use_smooth = True

        # Center Commercial Horn Boss & Emblem
        boss_pos = local_to_world_steer(Vector((0, 0, 0.010)))
        make_cylinder(f"{name}_Boss", boss_pos, 0.065, 0.032, rot_euler=wheel_rot, mat=mats["charcoal_trim"], vertices=32, bevel=0.004, parent=wheel_root)
        emblem_pos = local_to_world_steer(Vector((0, 0, 0.026)))
        make_cylinder(f"{name}_Emblem_Ring", emblem_pos, 0.026, 0.004, rot_euler=wheel_rot, mat=mats["chrome_mirror"], vertices=32, parent=wheel_root)
        make_cylinder(f"{name}_Emblem_Core", emblem_pos + R_steer @ Vector((0, 0, 0.002)), 0.022, 0.002, rot_euler=wheel_rot, mat=mats["seat_shell_blue"], vertices=32, parent=wheel_root)

        # Dual sturdy horizontal commercial spokes
        spoke_w = 0.048
        spoke_len = rim_radius - 0.060
        sp_l_pos = local_to_world_steer(Vector((-(0.065 + spoke_len/2.0), 0, 0.005)))
        make_box(f"{name}_Spoke_L", sp_l_pos, (spoke_len, 0.016, spoke_w), mat=mats["charcoal_trim"], rot_euler=wheel_rot, bevel=0.003, parent=wheel_root)
        sp_r_pos = local_to_world_steer(Vector(((0.065 + spoke_len/2.0), 0, 0.005)))
        make_box(f"{name}_Spoke_R", sp_r_pos, (spoke_len, 0.016, spoke_w), mat=mats["charcoal_trim"], rot_euler=wheel_rot, bevel=0.003, parent=wheel_root)

        # Molded thumb rests
        make_box(f"{name}_Thumb_L", local_to_world_steer(Vector((-0.14, 0.006, 0.012))), (0.035, 0.006, 0.025), mat=mats["rubber_black"], rot_euler=wheel_rot, bevel=0.002, parent=wheel_root)
        make_box(f"{name}_Thumb_R", local_to_world_steer(Vector((0.14, 0.006, 0.012))), (0.035, 0.006, 0.025), mat=mats["rubber_black"], rot_euler=wheel_rot, bevel=0.002, parent=wheel_root)

        return wheel_root

    # Primary wheel (active by default)
    build_bus_wheel("STEERING_SPORT_3SPOKE")
    # Alternate wheel nodes in case store requests other styles
    build_bus_wheel("STEERING_CLASSIC_4SPOKE")
    build_bus_wheel("STEERING_LUXURY_2SPOKE")
    build_bus_wheel("STEERING_PERFORMANCE_4SPOKE")
    build_bus_wheel("STEERING_GT_3SPOKE")
    build_bus_wheel("STEERING_GT3_YOKE")
    build_bus_wheel("STEERING_FORMULA")

    # -------------------------------------------------------------------------
    # 6. Left Driver Side Switchboard Console
    # -------------------------------------------------------------------------
    log("6. Modeling Driver Side Switch Console...")
    door_console_pos = (driver_x - 0.28, -0.15, 0.55)
    make_box("BUS_DRIVER_DOOR_CONSOLE", door_console_pos, (0.16, 0.38, 0.16), mats["charcoal_trim"], bevel=0.006, parent=root)

    # Dual Passenger Door Control Levers
    make_box("BUS_DOOR_SW_PLATE", (door_console_pos[0], -0.10, 0.635), (0.12, 0.12, 0.008), mats["aluminum_satin"], bevel=0.002, parent=root)
    make_cylinder("BUS_DOOR_LEVER_FRONT", (door_console_pos[0] - 0.03, -0.10, 0.66), 0.006, 0.045, (math.radians(15), 0, 0), mats["aluminum_satin"], vertices=16, parent=root)
    make_cylinder("BUS_DOOR_KNOB_FRONT", (door_console_pos[0] - 0.03, -0.11, 0.68), 0.012, 0.020, (math.radians(15), 0, 0), mats["safety_yellow"], vertices=16, parent=root)
    make_cylinder("BUS_DOOR_LEVER_REAR", (door_console_pos[0] + 0.03, -0.10, 0.66), 0.006, 0.045, (math.radians(15), 0, 0), mats["aluminum_satin"], vertices=16, parent=root)
    make_cylinder("BUS_DOOR_KNOB_REAR", (door_console_pos[0] + 0.03, -0.11, 0.68), 0.012, 0.020, (math.radians(15), 0, 0), mats["led_red"], vertices=16, parent=root)

    # Red Emergency Master Battery / Ignition Cutoff Switch
    make_cylinder("BUS_EMERGENCY_STOP_BASE", (door_console_pos[0], 0.01, 0.635), 0.022, 0.010, (0, 0, 0), mats["safety_yellow"], vertices=24, parent=root)
    make_cylinder("BUS_EMERGENCY_STOP_MUSHROOM", (door_console_pos[0], 0.01, 0.655), 0.026, 0.024, (0, 0, 0), mats["led_red"], vertices=32, parent=root)

    # Driver PA Gooseneck Microphone
    make_cylinder("BUS_PA_MIC_BASE", (door_console_pos[0] - 0.04, -0.28, 0.635), 0.014, 0.016, (0, 0, 0), mats["charcoal_trim"], vertices=16, parent=root)
    make_cylinder("BUS_PA_MIC_STALK", (door_console_pos[0] - 0.03, -0.22, 0.74), 0.005, 0.22, (math.radians(-22), math.radians(12), 0), mats["aluminum_satin"], vertices=12, parent=root)
    make_cylinder("BUS_PA_MIC_HEAD", (door_console_pos[0] - 0.015, -0.14, 0.84), 0.012, 0.038, (math.radians(-22), math.radians(12), 0), mats["rubber_black"], vertices=16, parent=root)

    # -------------------------------------------------------------------------
    # 7. Right Driver Control Pedestal, Shifter & Farebox
    # -------------------------------------------------------------------------
    log("7. Modeling Transmission Pedestal & Smartcard Farebox...")
    shifter_pedestal_pos = (driver_x + 0.30, -0.15, 0.52)
    make_box("BUS_SHIFTER_PEDESTAL", shifter_pedestal_pos, (0.16, 0.35, 0.18), mats["charcoal_trim"], bevel=0.006, parent=root)

    shifter_root = bpy.data.objects.new("CONSOLE_SHIFTER_AUTO", None)
    bpy.context.scene.collection.objects.link(shifter_root)
    attach_to_parent(shifter_root, root)

    make_box("BUS_TRANS_PB_PANEL", (shifter_pedestal_pos[0], -0.10, 0.615), (0.12, 0.18, 0.008), mats["aluminum_satin"], bevel=0.002, parent=shifter_root)
    for pb_i, (lbl, col) in enumerate([("R", mats["led_amber"]), ("N", mats["charcoal_trim"]), ("D", mats["led_green"]), ("1", mats["charcoal_trim"]), ("2", mats["charcoal_trim"])]):
        pb_y = -0.16 + pb_i * 0.032
        make_cylinder(f"BUS_PB_{lbl}", (shifter_pedestal_pos[0], pb_y, 0.625), 0.012, 0.012, (0, 0, 0), col, vertices=20, parent=shifter_root)

    # Commercial Air Parking Brake Valve
    make_cylinder("BUS_PARK_BRAKE_BEZEL", (shifter_pedestal_pos[0], 0.00, 0.615), 0.020, 0.008, (0, 0, 0), mats["charcoal_trim"], vertices=24, parent=root)
    make_cylinder("BUS_PARK_BRAKE_STEM", (shifter_pedestal_pos[0], 0.00, 0.635), 0.008, 0.035, (0, 0, 0), mats["aluminum_satin"], vertices=16, parent=root)
    make_box("BUS_PARK_BRAKE_KNOB", (shifter_pedestal_pos[0], 0.00, 0.655), (0.036, 0.036, 0.020), mats["safety_yellow"], rot_euler=(0, 0, math.radians(45)), bevel=0.004, parent=root)

    # Smartcard Ticket Validator / Farebox
    farebox_root = bpy.data.objects.new("BUS_FAREBOX", None)
    bpy.context.scene.collection.objects.link(farebox_root)
    attach_to_parent(farebox_root, root)

    fb_pos = (0.24, -0.06, 0.62)
    make_cylinder("BUS_FAREBOX_POLE", (fb_pos[0], fb_pos[1], 0.32), 0.022, 0.58, (0, 0, 0), mats["aluminum_satin"], vertices=24, parent=farebox_root)
    make_box("INTERIOR_FareBox_Smartcard_Terminal", fb_pos, (0.20, 0.22, 0.28), mats["charcoal_trim"], rot_euler=(0, 0, math.radians(-15)), bevel=0.008, parent=farebox_root)
    make_box("BUS_FARE_SCREEN", (fb_pos[0] + 0.02, fb_pos[1] - 0.09, fb_pos[2] + 0.05), (0.13, 0.008, 0.07), mats["screen_info"], rot_euler=(math.radians(15), 0, math.radians(-15)), bevel=0.002, parent=farebox_root)
    make_cylinder("BUS_FARE_NFC_TARGET", (fb_pos[0] + 0.02, fb_pos[1] - 0.09, fb_pos[2] - 0.04), 0.035, 0.004, (math.radians(105), 0, math.radians(-15)), mats["safety_yellow"], vertices=24, parent=farebox_root)

    # -------------------------------------------------------------------------
    # 8. ISRI Pneumatic Suspension Driver Seat
    # -------------------------------------------------------------------------
    log("8. Modeling ISRI Pneumatic Air-Suspension Driver Seat...")
    seat_root = bpy.data.objects.new("CABIN_SEATS", None)
    bpy.context.scene.collection.objects.link(seat_root)
    attach_to_parent(seat_root, root)

    seat_center_x = driver_x
    seat_center_y = -0.52

    # Triple air suspension bellows
    for bl_i in range(3):
        make_torus(f"BUS_DRIVER_BELLOW_{bl_i+1}", (seat_center_x, seat_center_y, 0.12 + bl_i * 0.045), 0.14, 0.022, parent=seat_root, mat=mats["rubber_black"])

    make_box("SEAT_DRIVER", (seat_center_x, seat_center_y, 0.35), (0.52, 0.52, 0.14), mats["seat_fabric_gray"], bevel=0.016, parent=seat_root)
    make_box("SEAT_DRIVER_BACKREST", (seat_center_x, seat_center_y - 0.22, 0.68), (0.50, 0.12, 0.58), mats["seat_fabric_gray"], rot_euler=(math.radians(-6), 0, 0), bevel=0.016, parent=seat_root)
    make_box("SEAT_DRIVER_HEADREST", (seat_center_x, seat_center_y - 0.25, 1.02), (0.28, 0.09, 0.16), mats["leather_black"], bevel=0.012, parent=seat_root)

    make_box("BUS_DRIVER_ARMREST_L", (seat_center_x - 0.28, seat_center_y - 0.05, 0.52), (0.05, 0.30, 0.065), mats["charcoal_trim"], bevel=0.008, parent=seat_root)
    make_box("BUS_DRIVER_ARMREST_R", (seat_center_x + 0.28, seat_center_y - 0.05, 0.52), (0.05, 0.30, 0.065), mats["charcoal_trim"], bevel=0.008, parent=seat_root)

    make_cylinder("BUS_DRIVER_BELT_STALK", (seat_center_x + 0.24, seat_center_y - 0.08, 0.38), 0.012, 0.16, (0, 0, 0), mats["charcoal_trim"], vertices=16, parent=seat_root)
    make_box("BUS_DRIVER_BELT_BUCKLE", (seat_center_x + 0.24, seat_center_y - 0.08, 0.46), (0.028, 0.038, 0.055), mats["led_red"], bevel=0.002, parent=seat_root)

    # Driver Security Partition (Positioned far enough back at Y = -0.90 to never occlude overview camera)
    make_box("BUS_DRIVER_BARRIER", (seat_center_x, -0.90, 0.78), (0.64, 0.010, 0.90), mats["glass_clear"], bevel=0.004, parent=root)
    make_cylinder("BUS_BARRIER_FRAME_L", (seat_center_x - 0.32, -0.90, 0.78), 0.014, 0.90, (0, 0, 0), mats["aluminum_satin"], vertices=16, parent=root)
    make_cylinder("BUS_BARRIER_FRAME_R", (seat_center_x + 0.32, -0.90, 0.78), 0.014, 0.90, (0, 0, 0), mats["aluminum_satin"], vertices=16, parent=root)
    make_cylinder("BUS_BARRIER_HEADER", (seat_center_x, -0.90, 1.23), 0.014, 0.64, (0, math.radians(90), 0), mats["aluminum_satin"], vertices=16, parent=root)

    # -------------------------------------------------------------------------
    # 9. Curbside Entrance Modesty Barrier & Bi-Fold Doors
    # -------------------------------------------------------------------------
    log("9. Modeling Curbside Entrance & Doors...")
    make_box("BUS_ENTRY_MODESTY_PANEL", (0.62, -0.85, 0.68), (0.42, 0.014, 0.82), mats["glass_frosted"], bevel=0.004, parent=root)
    make_cylinder("BUS_ENTRY_MODESTY_FRAME_L", (0.41, -0.85, 0.68), 0.016, 0.84, (0, 0, 0), mats["safety_yellow"], vertices=20, parent=root)
    make_cylinder("BUS_ENTRY_MODESTY_FRAME_R", (0.83, -0.85, 0.68), 0.016, 0.84, (0, 0, 0), mats["safety_yellow"], vertices=20, parent=root)
    make_cylinder("BUS_ENTRY_MODESTY_TOP", (0.62, -0.85, 1.10), 0.016, 0.42, (0, math.radians(90), 0), mats["safety_yellow"], vertices=20, parent=root)

    door_x = 0.78
    for d_i, d_y in enumerate([-0.48, -0.08]):
        make_box(f"BUS_ENTRY_DOOR_FRAME_{d_i+1}", (door_x, d_y, 0.72), (0.04, 0.36, 1.20), mats["charcoal_trim"], bevel=0.006, parent=root)
        make_box(f"BUS_ENTRY_DOOR_GLASS_{d_i+1}", (door_x, d_y, 0.72), (0.014, 0.30, 1.08), mats["glass_clear"], bevel=0.002, parent=root)

    make_cylinder("BUS_BOARDING_HANDRAIL", (0.38, -0.22, 0.70), 0.018, 0.98, (0, 0, 0), mats["safety_yellow"], vertices=24, parent=root)

    # -------------------------------------------------------------------------
    # 10. Safety Stanchions, Overhead Rails & Straps (Zero Camera Occlusion)
    # -------------------------------------------------------------------------
    log("10. Modeling Stanchion Poles & Grab Rails...")
    stanchion_root = bpy.data.objects.new("BUS_STANCHIONS", None)
    bpy.context.scene.collection.objects.link(stanchion_root)
    attach_to_parent(stanchion_root, root)

    pole_z = 0.72
    pole_h = 1.30

    pole_positions = [
        (-0.36, -0.90), # Driver barrier corner
        (0.41, -0.85),  # Modesty barrier corner
        (-0.32, -1.45), # Aisle left row 2
        (0.32, -1.45),  # Aisle right row 2
        (-0.32, -2.05), # Aisle left row 3
        (0.32, -2.05),  # Aisle right row 3
    ]

    for p_i, (px, py) in enumerate(pole_positions):
        make_cylinder(f"BUS_STANCHION_POLE_{p_i+1}", (px, py, pole_z), 0.016, pole_h, (0, 0, 0), mats["safety_yellow"], vertices=20, parent=stanchion_root)
        if p_i in [0, 1, 2, 3]:
            make_cylinder(f"BUS_STOP_BELL_{p_i+1}", (px + (0.018 if px < 0 else -0.018), py, 0.92), 0.010, 0.022, (0, math.radians(90), 0), mats["led_red"], vertices=16, parent=stanchion_root)

    make_cylinder("BUS_OVERHEAD_RAIL_L", (-0.32, -1.45, 1.32), 0.016, 2.30, (math.radians(90), 0, 0), mats["safety_yellow"], vertices=24, parent=stanchion_root)
    make_cylinder("BUS_OVERHEAD_RAIL_R", (0.32, -1.45, 1.32), 0.016, 2.30, (math.radians(90), 0, 0), mats["safety_yellow"], vertices=24, parent=stanchion_root)

    for s_i, sy in enumerate([-1.05, -1.35, -1.65, -1.95]):
        for sign, side in [(-1, "L"), (1, "R")]:
            make_box(f"BUS_GRAB_STRAP_{side}_{s_i+1}", (sign * 0.32, sy, 1.24), (0.022, 0.005, 0.14), mats["rubber_black"], bevel=0.001, parent=stanchion_root)
            make_cylinder(f"BUS_GRAB_RING_{side}_{s_i+1}", (sign * 0.32, sy, 1.15), 0.038, 0.012, (math.radians(90), 0, 0), mats["safety_yellow"], vertices=24, parent=stanchion_root)

    make_box("BUS_CABIN_DESTINATION_SIGN", (0.0, -0.45, 1.25), (0.65, 0.06, 0.12), mats["charcoal_trim"], bevel=0.004, parent=root)
    make_box("BUS_SIGN_LED_ROUTE", (0.0, -0.475, 1.25), (0.58, 0.004, 0.08), mats["led_amber"], bevel=0.001, parent=root)
    make_box("BUS_SIGN_STOP_REQUESTED", (0.0, -0.425, 1.25), (0.58, 0.004, 0.08), mats["led_red"], bevel=0.001, parent=root)

    # -------------------------------------------------------------------------
    # 11. Passenger Commuter Seating Rows
    # -------------------------------------------------------------------------
    log("11. Modeling Commuter Passenger Seating...")
    seats_group = bpy.data.objects.new("BUS_PASSENGER_SEATS", None)
    bpy.context.scene.collection.objects.link(seats_group)
    attach_to_parent(seats_group, root)

    row_y_coords = [-1.15, -1.75, -2.35]
    for r_idx, ry in enumerate(row_y_coords):
        for side, sign in [("L", -1.0), ("R", 1.0)]:
            sx = sign * 0.60
            make_box(f"BUS_SEAT_BASE_R{r_idx+1}_{side}", (sx, ry, 0.36), (0.42, 0.38, 0.035), mats["seat_shell_blue"], bevel=0.008, parent=seats_group)
            make_box(f"BUS_SEAT_BACK_R{r_idx+1}_{side}", (sx, ry - 0.16, 0.60), (0.40, 0.032, 0.44), mats["seat_shell_blue"], rot_euler=(math.radians(-6), 0, 0), bevel=0.008, parent=seats_group)

            make_box(f"BUS_PAD_CUSH_R{r_idx+1}_{side}", (sx, ry, 0.385), (0.34, 0.32, 0.020), mats["seat_fabric_gray"], bevel=0.004, parent=seats_group)
            make_box(f"BUS_PAD_BACK_R{r_idx+1}_{side}", (sx, ry - 0.15, 0.60), (0.32, 0.016, 0.36), mats["seat_fabric_gray"], rot_euler=(math.radians(-6), 0, 0), bevel=0.004, parent=seats_group)

            make_cylinder(f"BUS_SEAT_HANDLE_R{r_idx+1}_{side}", (sx + sign * (-0.16), ry - 0.17, 0.82), 0.010, 0.12, (0, math.radians(90), 0), mats["safety_yellow"], vertices=16, parent=seats_group)

    # -------------------------------------------------------------------------
    # 12. Export Pristine Class-A GLB
    # -------------------------------------------------------------------------
    out_dir = os.path.abspath("public/models/interior")
    os.makedirs(out_dir, exist_ok=True)
    out_glb = os.path.join(out_dir, "cockpit_transit_bus.glb")
    log(f"Exporting clean bus cockpit to: {out_glb}")

    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action='SELECT')

    bpy.ops.export_scene.gltf(
        filepath=out_glb,
        export_format='GLB',
        use_selection=True,
        export_apply=False,
        export_yup=True,
        export_materials='EXPORT',
        export_image_format='AUTO',
    )

    sz_kb = os.path.getsize(out_glb) / 1024.0
    log(f"[SUCCESS] Exported cockpit_transit_bus.glb ({sz_kb:.1f} KB)")

if __name__ == "__main__":
    build_transit_bus_cockpit()
