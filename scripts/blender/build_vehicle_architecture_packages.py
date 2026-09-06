import bpy
import os
import sys
import math
import shutil
from mathutils import Vector, Matrix

print("[ARCH_GEN] Initializing Vehicle Architecture Package Generator...")

BASE_DIR = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\vehicles"
os.makedirs(BASE_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# SPECIFICATIONS FOR THE 4 INITIAL CATEGORIES (in meters)
# -----------------------------------------------------------------------------
VEHICLE_SPECS = {
    "sedan": {
        "name": "Executive Sport Sedan",
        "arch_type": "3-Box Executive",
        "wheelbase": 2.850,
        "track_front": 1.620,
        "track_rear": 1.620,
        "ride_height": 0.135,
        "overall_length": 4.880,
        "overall_width": 1.860,
        "overall_height": 1.440,
        "front_overhang": 0.920,
        "rear_overhang": 1.110,
        "hood_height": 0.920,
        "beltline_height": 0.980,
        "roof_length": 1.850,
        "trunk_length": 0.750,
        "wheel_diameter": 0.680,
        "arch_radius": 0.380,
        "pillar_count": 3,  # A, B, C
        "has_trunk": True,
        "chassis_color": (0.15, 0.18, 0.22, 1.0),
        "frame_color": (0.85, 0.55, 0.15, 1.0), # Safety Orange / Roll cage accent
        "floor_color": (0.08, 0.08, 0.09, 1.0),
    },
    "hatchback": {
        "name": "Hot Hatch Performance",
        "arch_type": "2-Box Compact",
        "wheelbase": 2.600,
        "track_front": 1.560,
        "track_rear": 1.560,
        "ride_height": 0.130,
        "overall_length": 4.220,
        "overall_width": 1.800,
        "overall_height": 1.460,
        "front_overhang": 0.840,
        "rear_overhang": 0.780,
        "hood_height": 0.940,
        "beltline_height": 0.960,
        "roof_length": 2.100,
        "trunk_length": 0.0,
        "wheel_diameter": 0.650,
        "arch_radius": 0.360,
        "pillar_count": 3,  # A, B, C (Upright)
        "has_trunk": False,
        "chassis_color": (0.22, 0.22, 0.25, 1.0),
        "frame_color": (0.20, 0.65, 0.90, 1.0), # Electric Cyan
        "floor_color": (0.08, 0.08, 0.09, 1.0),
    },
    "crossover": {
        "name": "Urban Crossover AWD",
        "arch_type": "Elevated 2-Box",
        "wheelbase": 2.700,
        "track_front": 1.630,
        "track_rear": 1.630,
        "ride_height": 0.190,
        "overall_length": 4.540,
        "overall_width": 1.880,
        "overall_height": 1.620,
        "front_overhang": 0.880,
        "rear_overhang": 0.960,
        "hood_height": 1.080,
        "beltline_height": 1.120,
        "roof_length": 2.150,
        "trunk_length": 0.0,
        "wheel_diameter": 0.720,
        "arch_radius": 0.410,
        "pillar_count": 3,
        "has_trunk": False,
        "chassis_color": (0.18, 0.24, 0.20, 1.0),
        "frame_color": (0.30, 0.80, 0.40, 1.0), # Forest Green / Rugged
        "floor_color": (0.12, 0.12, 0.12, 1.0),
    },
    "suv": {
        "name": "Full-Size Heavy Duty SUV",
        "arch_type": "Large Heavy-Duty 2-Box",
        "wheelbase": 2.980,
        "track_front": 1.680,
        "track_rear": 1.680,
        "ride_height": 0.230,
        "overall_length": 5.080,
        "overall_width": 2.000,
        "overall_height": 1.820,
        "front_overhang": 0.980,
        "rear_overhang": 1.120,
        "hood_height": 1.220,
        "beltline_height": 1.280,
        "roof_length": 2.450,
        "trunk_length": 0.0,
        "wheel_diameter": 0.810,
        "arch_radius": 0.460,
        "pillar_count": 4,  # A, B, C, D (Large 3-row)
        "has_trunk": False,
        "chassis_color": (0.15, 0.15, 0.16, 1.0),
        "frame_color": (0.90, 0.20, 0.25, 1.0), # Deep Crimson / Heavy-Duty
        "floor_color": (0.14, 0.14, 0.15, 1.0),
    }
}

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)

def create_mat(name, color, roughness=0.4, metallic=0.7, alpha=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if "Alpha" in bsdf.inputs and alpha < 1.0:
            bsdf.inputs["Alpha"].default_value = alpha
            mat.blend_method = 'BLEND'
    return mat

def create_box(name, center, size, mat=None, parent=None):
    bpy.ops.mesh.primitive_cube_add(location=center)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0] / 2.0, size[1] / 2.0, size[2] / 2.0)
    bpy.ops.object.transform_apply(scale=True)
    if mat:
        obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    return obj

def create_cylinder(name, center, radius, depth, rot=(0,0,0), mat=None, parent=None):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=center, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    return obj

def create_empty(name, location, parent=None):
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = 'ARROWS'
    empty.empty_display_size = 0.15
    empty.location = location
    bpy.context.scene.collection.objects.link(empty)
    if parent:
        empty.parent = parent
    return empty

def export_glb(out_path):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    # Use isolated temp path to guarantee Windows file lock safety
    temp_path = out_path + ".tmp.glb"
    if os.path.exists(temp_path):
        try: os.remove(temp_path)
        except Exception: pass
        
    bpy.ops.export_scene.gltf(
        filepath=temp_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True
    )
    if os.path.exists(temp_path):
        shutil.move(temp_path, out_path)
    print(f"  [OK] Exported: {os.path.relpath(out_path, BASE_DIR)} ({os.path.getsize(out_path)/1024:.1f} KB)")

# =============================================================================
# 1. BUILD CHASSIS GLB
# =============================================================================
def build_chassis(spec, out_dir):
    clear_scene()
    wb = spec["wheelbase"]
    tf = spec["track_front"]
    tr = spec["track_rear"]
    rh = spec["ride_height"]
    ol = spec["overall_length"]
    ow = spec["overall_width"]
    
    mat_chassis = create_mat("Chassis_Structural_Steel", spec["chassis_color"], roughness=0.35, metallic=0.85)
    mat_subframe = create_mat("Subframe_Alloy", (0.35, 0.38, 0.42, 1.0), roughness=0.3, metallic=0.9)
    
    # Root
    root = create_empty("CHASSIS_ROOT", (0, 0, 0))
    
    # Wheel centers in coordinate frame:
    # Front axle at x = +wb/2, Rear axle at x = -wb/2
    fx = wb / 2.0
    rx = -wb / 2.0
    z_axle = rh + (spec["wheel_diameter"] / 2.0)
    
    # Axle References
    create_empty("FRONT_AXLE", (fx, 0, z_axle), root)
    create_empty("REAR_AXLE", (rx, 0, z_axle), root)
    
    # Main longitudinal frame rails (Left & Right)
    rail_w = 0.08
    rail_h = 0.12
    rail_len = ol * 0.88
    rail_y = (ow * 0.5) - 0.28
    
    rail_l = create_box("Chassis_Frame_Rail_L", (0, rail_y, rh + rail_h/2.0), (rail_len, rail_w, rail_h), mat_chassis, root)
    rail_r = create_box("Chassis_Frame_Rail_R", (0, -rail_y, rh + rail_h/2.0), (rail_len, rail_w, rail_h), mat_chassis, root)
    
    # Crossmembers (Front bulkhead, Transmission crossmember, Mid floor, Rear bulkhead)
    cross_w = 0.08
    cross_h = 0.08
    cross_span = (rail_y * 2.0) + rail_w
    
    # Front Crossmember (Radiator Support)
    create_box("Chassis_Crossmember_Front", (fx + spec["front_overhang"]*0.7, 0, rh + cross_h/2.0), (cross_w, cross_span, cross_h), mat_chassis, root)
    # Firewall Crossmember
    create_box("Chassis_Crossmember_Firewall", (fx * 0.45, 0, rh + cross_h/2.0 + 0.05), (cross_w, cross_span, cross_h), mat_chassis, root)
    # Center Tunnel Crossmember
    create_box("Chassis_Crossmember_Center", (0, 0, rh + cross_h/2.0), (cross_w, cross_span, cross_h), mat_chassis, root)
    # Rear Suspension Crossmember
    create_box("Chassis_Crossmember_Rear", (rx, 0, rh + cross_h/2.0 + 0.04), (cross_w, cross_span, cross_h), mat_chassis, root)
    # Rear Impact Beam
    create_box("Chassis_Crossmember_Bumper_Rear", (rx - spec["rear_overhang"]*0.75, 0, rh + cross_h/2.0 + 0.08), (cross_w, cross_span, cross_h), mat_chassis, root)
    
    # Front Suspension Subframe Cradle
    subframe_f = create_box("Front_Subframe_Cradle", (fx, 0, rh + 0.06), (0.85, tf * 0.72, 0.12), mat_subframe, root)
    # Rear Suspension Subframe Cradle
    subframe_r = create_box("Rear_Subframe_Cradle", (rx, 0, rh + 0.08), (0.90, tr * 0.75, 0.14), mat_subframe, root)
    
    # Front Strut / Damper Towers (L & R)
    tower_r = 0.12
    tower_h = z_axle + 0.28 - (rh + 0.06)
    create_cylinder("Front_Tower_L", (fx, tf * 0.38, rh + 0.06 + tower_h/2.0), tower_r, tower_h, mat=mat_subframe, parent=root)
    create_cylinder("Front_Tower_R", (fx, -tf * 0.38, rh + 0.06 + tower_h/2.0), tower_r, tower_h, mat=mat_subframe, parent=root)
    
    # Rear Strut Towers (L & R)
    create_cylinder("Rear_Tower_L", (rx, tr * 0.38, rh + 0.08 + tower_h/2.0), tower_r, tower_h, mat=mat_subframe, parent=root)
    create_cylinder("Rear_Tower_R", (rx, -tr * 0.38, rh + 0.08 + tower_h/2.0), tower_r, tower_h, mat=mat_subframe, parent=root)
    
    # Apply modifiers to all meshes for high visual quality
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            bev = obj.modifiers.new(name="Bevel", type='BEVEL')
            bev.width = 0.003
            bev.segments = 2
            wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
            wn.keep_sharp = True
            wn.weight = 100
            
    export_glb(os.path.join(out_dir, "chassis.glb"))

# =============================================================================
# 2. BUILD BODY FRAMEWORK GLB (Structural cage & Pillars)
# =============================================================================
def build_body_framework(spec, out_dir):
    clear_scene()
    wb = spec["wheelbase"]
    ol = spec["overall_length"]
    ow = spec["overall_width"]
    oh = spec["overall_height"]
    rh = spec["ride_height"]
    fx = wb / 2.0
    rx = -wb / 2.0
    half_w = (ow / 2.0) - 0.06
    belt_z = spec["beltline_height"]
    roof_z = oh
    hood_z = spec["hood_height"]
    
    mat_frame = create_mat("Body_Framework_Alloy", spec["frame_color"], roughness=0.25, metallic=0.6)
    mat_dark = create_mat("Frame_Reinforcement", (0.1, 0.1, 0.12, 1.0), roughness=0.4, metallic=0.8)
    
    root = create_empty("BODY_FRAME_ROOT", (0, 0, 0))
    
    tube_r = 0.035
    
    # 1. Lower Door Sills (Left & Right)
    sill_len = wb * 0.98
    create_cylinder("Body_Sill_L", (0, half_w, rh + 0.14), tube_r, sill_len, rot=(0, math.radians(90), 0), mat=mat_frame, parent=root)
    create_cylinder("Body_Sill_R", (0, -half_w, rh + 0.14), tube_r, sill_len, rot=(0, math.radians(90), 0), mat=mat_frame, parent=root)
    
    # 2. A-Pillar (Left & Right) - From cowl to roof front
    a_base_x = fx * 0.40
    a_top_x = fx * 0.05
    a_len = math.sqrt((a_base_x - a_top_x)**2 + (roof_z - belt_z)**2)
    a_angle = math.atan2(a_base_x - a_top_x, roof_z - belt_z)
    
    create_cylinder("A_Pillar_L", ((a_base_x + a_top_x)/2.0, half_w - 0.06, (belt_z + roof_z)/2.0), tube_r, a_len, rot=(0, a_angle, 0), mat=mat_frame, parent=root)
    create_cylinder("A_Pillar_R", ((a_base_x + a_top_x)/2.0, -(half_w - 0.06), (belt_z + roof_z)/2.0), tube_r, a_len, rot=(0, a_angle, 0), mat=mat_frame, parent=root)
    
    # 3. B-Pillar (Left & Right) - Vertical roll protection
    b_x = -wb * 0.05
    b_h = roof_z - (rh + 0.14)
    create_cylinder("B_Pillar_L", (b_x, half_w, (rh + 0.14 + roof_z)/2.0), tube_r, b_h, mat=mat_frame, parent=root)
    create_cylinder("B_Pillar_R", (b_x, -half_w, (rh + 0.14 + roof_z)/2.0), tube_r, b_h, mat=mat_frame, parent=root)
    
    # 4. Roof Rails (Left & Right)
    roof_len = spec["roof_length"]
    roof_mid_x = a_top_x - (roof_len / 2.0)
    create_cylinder("Roof_Rail_L", (roof_mid_x, half_w - 0.08, roof_z), tube_r, roof_len, rot=(0, math.radians(90), 0), mat=mat_frame, parent=root)
    create_cylinder("Roof_Rail_R", (roof_mid_x, -(half_w - 0.08), roof_z), tube_r, roof_len, rot=(0, math.radians(90), 0), mat=mat_frame, parent=root)
    
    # 5. C-Pillar (and D-Pillar for SUV)
    c_top_x = a_top_x - roof_len
    if spec["has_trunk"]:
        # Sedan 3-box: C-pillar slopes to rear trunk deck
        c_base_x = rx * 0.95
        c_len = math.sqrt((c_base_x - c_top_x)**2 + (roof_z - belt_z)**2)
        c_angle = -math.atan2(c_top_x - c_base_x, roof_z - belt_z)
        create_cylinder("C_Pillar_L", ((c_base_x + c_top_x)/2.0, half_w - 0.06, (belt_z + roof_z)/2.0), tube_r, c_len, rot=(0, c_angle, 0), mat=mat_frame, parent=root)
        create_cylinder("C_Pillar_R", ((c_base_x + c_top_x)/2.0, -(half_w - 0.06), (belt_z + roof_z)/2.0), tube_r, c_len, rot=(0, c_angle, 0), mat=mat_frame, parent=root)
        # Trunk Frame
        create_box("Trunk_Aperture_Frame", (rx - 0.35, 0, belt_z), (0.70, half_w * 1.6, 0.05), mat_dark, root)
    else:
        # Hatchback, Crossover, SUV: 2-box vertical/sloped tailgate aperture
        c_base_x = rx - (spec["rear_overhang"] * 0.45)
        c_len = math.sqrt((c_base_x - c_top_x)**2 + (roof_z - belt_z)**2)
        c_angle = -math.atan2(c_top_x - c_base_x, roof_z - belt_z)
        create_cylinder("C_Pillar_L", ((c_base_x + c_top_x)/2.0, half_w - 0.05, (belt_z + roof_z)/2.0), tube_r, c_len, rot=(0, c_angle, 0), mat=mat_frame, parent=root)
        create_cylinder("C_Pillar_R", ((c_base_x + c_top_x)/2.0, -(half_w - 0.05), (belt_z + roof_z)/2.0), tube_r, c_len, rot=(0, c_angle, 0), mat=mat_frame, parent=root)
        # Tailgate Aperture Frame
        create_box("Tailgate_Aperture_Frame", (c_base_x, 0, (roof_z + rh)/2.0), (0.06, half_w * 1.7, (roof_z - rh) * 0.8), mat_dark, root)
        
    # If SUV, add D-Pillar for 3-row greenhouse
    if spec["pillar_count"] == 4:
        d_x = rx - (spec["rear_overhang"] * 0.65)
        d_h = roof_z - belt_z
        create_cylinder("D_Pillar_L", (d_x, half_w, (belt_z + roof_z)/2.0), tube_r, d_h, mat=mat_frame, parent=root)
        create_cylinder("D_Pillar_R", (d_x, -half_w, (belt_z + roof_z)/2.0), tube_r, d_h, mat=mat_frame, parent=root)

    # Windshield Cowl Crossmember (connecting bottom of A-pillars)
    create_cylinder("Cowl_Bar_Front", (a_base_x, 0, belt_z), tube_r, (half_w - 0.06)*2, rot=(math.radians(90), 0, 0), mat=mat_frame, parent=root)
    # Front Roof Header
    create_cylinder("Roof_Header_Front", (a_top_x, 0, roof_z), tube_r, (half_w - 0.08)*2, rot=(math.radians(90), 0, 0), mat=mat_frame, parent=root)
    # Rear Roof Header
    create_cylinder("Roof_Header_Rear", (c_top_x, 0, roof_z), tube_r, (half_w - 0.08)*2, rot=(math.radians(90), 0, 0), mat=mat_frame, parent=root)

    # Door, Hood, Roof, Trunk semantic reference attachment markers
    create_empty("HOOD", (fx * 0.65, 0, hood_z), root)
    create_empty("ROOF", (roof_mid_x, 0, roof_z + 0.02), root)
    if spec["has_trunk"]:
        create_empty("TRUNK", (rx - 0.35, 0, belt_z + 0.02), root)
    else:
        create_empty("TAILGATE", (rx - 0.50, 0, (roof_z + belt_z)/2.0), root)
        
    create_empty("DOOR_FL", (fx * 0.15, half_w + 0.02, (rh + belt_z)/2.0), root)
    create_empty("DOOR_FR", (fx * 0.15, -(half_w + 0.02), (rh + belt_z)/2.0), root)
    create_empty("DOOR_RL", (-wb * 0.25, half_w + 0.02, (rh + belt_z)/2.0), root)
    create_empty("DOOR_RR", (-wb * 0.25, -(half_w + 0.02), (rh + belt_z)/2.0), root)
    
    create_empty("FRONT_FENDER_L", (fx, half_w, hood_z * 0.9), root)
    create_empty("FRONT_FENDER_R", (fx, -half_w, hood_z * 0.9), root)
    create_empty("REAR_FENDER_L", (rx, half_w, belt_z * 0.9), root)
    create_empty("REAR_FENDER_R", (rx, -half_w, belt_z * 0.9), root)

    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            bev = obj.modifiers.new(name="Bevel", type='BEVEL')
            bev.width = 0.0025
            bev.segments = 2
            wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
            wn.keep_sharp = True
            wn.weight = 100

    export_glb(os.path.join(out_dir, "body-framework.glb"))

# =============================================================================
# 3. BUILD FLOOR / UNDERBODY GLB
# =============================================================================
def build_floor(spec, out_dir):
    clear_scene()
    wb = spec["wheelbase"]
    ol = spec["overall_length"]
    ow = spec["overall_width"]
    rh = spec["ride_height"]
    
    mat_floor = create_mat("Underbody_Composite", spec["floor_color"], roughness=0.55, metallic=0.4)
    mat_skid = create_mat("Skid_Plate_Alloy", (0.55, 0.58, 0.62, 1.0), roughness=0.3, metallic=0.9)
    
    root = create_empty("FLOOR_ROOT", (0, 0, 0))
    
    # Flat central underbody floor pan
    floor_len = ol * 0.82
    floor_w = ow * 0.86
    create_box("Floor_Pan_Central", (0, 0, rh + 0.02), (floor_len, floor_w, 0.025), mat_floor, root)
    
    # Front Undertray / Skid Plate
    front_pan_len = ol * 0.22
    create_box("Front_Skid_Shield", (wb * 0.5 + front_pan_len * 0.4, 0, rh + 0.03), (front_pan_len, floor_w * 0.9, 0.03), mat_skid, root)
    
    # Rear Diffuser / Underside Channel
    rear_pan_len = ol * 0.25
    create_box("Rear_Underbody_Tray", (-wb * 0.5 - rear_pan_len * 0.35, 0, rh + 0.04), (rear_pan_len, floor_w * 0.88, 0.03), mat_floor, root)
    
    # Lateral Rocker Underbody Protection Guards
    guard_w = 0.06
    create_box("Rocker_Guard_L", (0, (floor_w/2.0) - guard_w/2.0, rh + 0.035), (floor_len * 0.75, guard_w, 0.04), mat_skid, root)
    create_box("Rocker_Guard_R", (0, -(floor_w/2.0) + guard_w/2.0, rh + 0.035), (floor_len * 0.75, guard_w, 0.04), mat_skid, root)

    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            bev = obj.modifiers.new(name="Bevel", type='BEVEL')
            bev.width = 0.003
            bev.segments = 2
            wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
            wn.keep_sharp = True
            wn.weight = 100

    export_glb(os.path.join(out_dir, "floor.glb"))

# =============================================================================
# 4. BUILD WHEEL-ARCHES GLB
# =============================================================================
def build_wheel_arches(spec, out_dir):
    clear_scene()
    wb = spec["wheelbase"]
    tf = spec["track_front"]
    tr = spec["track_rear"]
    rh = spec["ride_height"]
    arch_r = spec["arch_radius"]
    fx = wb / 2.0
    rx = -wb / 2.0
    z_axle = rh + (spec["wheel_diameter"] / 2.0)
    
    mat_arch = create_mat("Wheel_Arch_Liner", (0.12, 0.12, 0.14, 1.0), roughness=0.6, metallic=0.2)
    
    root = create_empty("WHEEL_ARCHES_ROOT", (0, 0, 0))
    
    # Create 4 wheel tub housings
    arch_w = 0.28
    
    for (name, pos) in [
        ("Wheel_Arch_FL", (fx, tf/2.0, z_axle)),
        ("Wheel_Arch_FR", (fx, -tf/2.0, z_axle)),
        ("Wheel_Arch_RL", (rx, tr/2.0, z_axle)),
        ("Wheel_Arch_RR", (rx, -tr/2.0, z_axle)),
    ]:
        # Semicircular barrel arch
        bpy.ops.mesh.primitive_cylinder_add(
            radius=arch_r, 
            depth=arch_w, 
            location=pos, 
            rotation=(math.radians(90), 0, 0)
        )
        cyl = bpy.context.active_object
        cyl.name = name
        cyl.data.materials.append(mat_arch)
        cyl.parent = root
        
        # Solidify liner
        sol = cyl.modifiers.new(name="Solidify", type='SOLIDIFY')
        sol.thickness = 0.004
        sol.offset = 1.0
        
        wn = cyl.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        wn.keep_sharp = True
        wn.weight = 100

    export_glb(os.path.join(out_dir, "wheel-arches.glb"))

# =============================================================================
# 5. BUILD HARDPOINTS GLB (Mechanical pickup sockets)
# =============================================================================
def build_hardpoints(spec, out_dir):
    clear_scene()
    wb = spec["wheelbase"]
    tf = spec["track_front"]
    tr = spec["track_rear"]
    rh = spec["ride_height"]
    fx = wb / 2.0
    rx = -wb / 2.0
    z_axle = rh + (spec["wheel_diameter"] / 2.0)
    
    mat_hardpoint = create_mat("Hardpoint_Marker", (0.95, 0.85, 0.10, 1.0), roughness=0.2, metallic=0.9)
    mat_susp = create_mat("Suspension_Mount", (0.2, 0.7, 0.95, 1.0), roughness=0.25, metallic=0.8)
    
    root = create_empty("HARDPOINTS_ROOT", (0, 0, 0))
    front_hp = create_empty("FRONT_HARDPOINTS", (fx, 0, z_axle), root)
    rear_hp = create_empty("REAR_HARDPOINTS", (rx, 0, z_axle), root)
    
    # Wheel Center Anchors
    create_empty("FRONT_LEFT_WHEEL_CENTER", (fx, tf/2.0, z_axle), front_hp)
    create_empty("FRONT_RIGHT_WHEEL_CENTER", (fx, -tf/2.0, z_axle), front_hp)
    create_empty("REAR_LEFT_WHEEL_CENTER", (rx, tr/2.0, z_axle), rear_hp)
    create_empty("REAR_RIGHT_WHEEL_CENTER", (rx, -tr/2.0, z_axle), rear_hp)
    
    # Visual mechanical pickup markers (Gold & Cyan Spheres)
    marker_r = 0.035
    
    # 4 Wheel Hub Knuckle Markers
    for (name, pos) in [
        ("Marker_Hub_FL", (fx, tf/2.0, z_axle)),
        ("Marker_Hub_FR", (fx, -tf/2.0, z_axle)),
        ("Marker_Hub_RL", (rx, tr/2.0, z_axle)),
        ("Marker_Hub_RR", (rx, -tr/2.0, z_axle)),
    ]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=marker_r, location=pos)
        sph = bpy.context.active_object
        sph.name = name
        sph.data.materials.append(mat_hardpoint)
        sph.parent = root
        
    # Suspension Control Arm Pickup Clevises
    for (name, pos) in [
        ("Marker_Pickup_FL_Lower", (fx - 0.15, tf * 0.28, rh + 0.08)),
        ("Marker_Pickup_FL_Upper", (fx - 0.10, tf * 0.32, z_axle + 0.16)),
        ("Marker_Pickup_FR_Lower", (fx - 0.15, -tf * 0.28, rh + 0.08)),
        ("Marker_Pickup_FR_Upper", (fx - 0.10, -tf * 0.32, z_axle + 0.16)),
        ("Marker_Pickup_RL_Lower", (rx + 0.15, tr * 0.28, rh + 0.09)),
        ("Marker_Pickup_RL_Upper", (rx + 0.10, tr * 0.32, z_axle + 0.18)),
        ("Marker_Pickup_RR_Lower", (rx + 0.15, -tr * 0.28, rh + 0.09)),
        ("Marker_Pickup_RR_Upper", (rx + 0.10, -tr * 0.32, z_axle + 0.18)),
    ]:
        bpy.ops.mesh.primitive_cube_add(location=pos)
        cube = bpy.context.active_object
        cube.name = name
        cube.scale = (0.03, 0.03, 0.03)
        bpy.ops.object.transform_apply(scale=True)
        cube.data.materials.append(mat_susp)
        cube.parent = root

    export_glb(os.path.join(out_dir, "hardpoints.glb"))

# =============================================================================
# 6. BUILD ENVELOPES GLB (Engine bay, Cabin, Cargo bounding volumes)
# =============================================================================
def build_envelopes(spec, out_dir):
    clear_scene()
    wb = spec["wheelbase"]
    ol = spec["overall_length"]
    ow = spec["overall_width"]
    oh = spec["overall_height"]
    rh = spec["ride_height"]
    fx = wb / 2.0
    rx = -wb / 2.0
    hood_z = spec["hood_height"]
    roof_z = oh
    
    mat_eng = create_mat("Env_Engine_Bay", (0.9, 0.3, 0.2, 0.35), roughness=0.8, metallic=0.0, alpha=0.35)
    mat_cab = create_mat("Env_Cabin", (0.2, 0.5, 0.9, 0.25), roughness=0.8, metallic=0.0, alpha=0.25)
    mat_crg = create_mat("Env_Cargo", (0.2, 0.8, 0.4, 0.30), roughness=0.8, metallic=0.0, alpha=0.30)
    
    root = create_empty("ENVELOPES_ROOT", (0, 0, 0))
    
    # 1. ENGINE BAY ENVELOPE
    eng_len = fx * 0.85 + spec["front_overhang"] * 0.6
    eng_w = ow * 0.72
    eng_h = hood_z - (rh + 0.08)
    eng_center = (fx * 0.55 + spec["front_overhang"] * 0.25, 0, rh + 0.08 + eng_h/2.0)
    create_box("ENGINE_BAY", eng_center, (eng_len, eng_w, eng_h), mat_eng, root)
    
    # 2. CABIN GREENHOUSE ENVELOPE
    cab_len = spec["roof_length"] * 1.15
    cab_w = ow * 0.84
    cab_h = roof_z - (rh + 0.15)
    cab_center = (fx * 0.15 - cab_len * 0.45, 0, rh + 0.15 + cab_h/2.0)
    create_box("CABIN_ENVELOPE", cab_center, (cab_len, cab_w, cab_h), mat_cab, root)
    
    # 3. CARGO ENVELOPE (Trunk for Sedan, Hatch cargo for others)
    if spec["has_trunk"]:
        crg_len = spec["trunk_length"] * 1.10
        crg_w = ow * 0.68
        crg_h = spec["beltline_height"] - (rh + 0.10)
        crg_center = (rx - crg_len * 0.45, 0, rh + 0.10 + crg_h/2.0)
        create_box("CARGO_ENVELOPE", crg_center, (crg_len, crg_w, crg_h), mat_crg, root)
    else:
        crg_len = spec["rear_overhang"] * 0.85
        crg_w = ow * 0.72
        crg_h = (roof_z * 0.85) - (rh + 0.10)
        crg_center = (rx - crg_len * 0.45, 0, rh + 0.10 + crg_h/2.0)
        create_box("CARGO_ENVELOPE", crg_center, (crg_len, crg_w, crg_h), mat_crg, root)

    export_glb(os.path.join(out_dir, "envelopes.glb"))

# =============================================================================
# MAIN ORCHESTRATION PIPELINE
# =============================================================================
def main():
    print("=================================================================")
    print("   AUTOMOTIVE VEHICLE ARCHITECTURE 3D ASSET COMPILER")
    print("=================================================================")
    
    total_packages = len(VEHICLE_SPECS)
    for idx, (cat_id, spec) in enumerate(VEHICLE_SPECS.items()):
        print(f"\n[{idx+1}/{total_packages}] Generating Architecture: {spec['name']} ({cat_id.upper()})...")
        out_dir = os.path.join(BASE_DIR, cat_id)
        os.makedirs(out_dir, exist_ok=True)
        
        build_chassis(spec, out_dir)
        build_body_framework(spec, out_dir)
        build_floor(spec, out_dir)
        build_wheel_arches(spec, out_dir)
        build_hardpoints(spec, out_dir)
        build_envelopes(spec, out_dir)
        
    print("\n[COMPLETE] Successfully generated all 24 vehicle architecture GLBs.")

if __name__ == "__main__":
    main()
