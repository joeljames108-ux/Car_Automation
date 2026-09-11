"""
Bus Common Utilities & Geometric Specifications (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler

COLLECTIONS = [
    "01_Bus_Body_Shell",
    "02_Bus_Roof_Pods_HVAC",
    "03_Bus_Glazing_Windows",
    "04_Bus_Lighting_Optics",
    "05_Bus_Doors_Access",
    "06_Bus_Chassis_Frame",
    "07_Bus_Powertrain_eAxle",
    "08_Bus_Suspension_AirBags",
    "09_Bus_Wheels_Dually_Brakes",
    "10_Bus_Interior_Cockpit",
    "11_Bus_Hardware_Mirrors"
]

# Coordinate Standards & Blueprint Reference Measurements (m)
# Strict ISO 8855: Y-Forward (+Y), Z-Up (+Z), X-Lateral (+X Driver LHD)
WHEELBASE = 5.850         # 5850 mm
OVERALL_LENGTH = 10.800   # 10800 mm
OVERALL_WIDTH = 2.550     # 2550 mm (standard commercial transit width)
OVERALL_HEIGHT = 3.250    # 3250 mm (unladen roof crown with HVAC)
GROUND_CLEARANCE = 0.260  # 260 mm (Low-floor kneeling transit datum)
FRONT_TRACK = 2.100       # 2100 mm
REAR_TRACK = 1.880        # 1880 mm (between centers of dual tire sets)

FRONT_AXLE_Y = 3.150      # Front steer axle
REAR_AXLE_Y = -2.700      # Rear drive axle
FRONT_BUMPER_Y = 5.400    # Front clip
REAR_BUMPER_Y = -5.400    # Rear clip

TIRE_RADIUS = 0.510       # 1020 mm outer diameter (ground contact Z=0.000m)
WHEEL_RADIUS = 0.285      # 22.5-inch commercial rim
FRONT_TIRE_WIDTH = 0.295  # 295/80 R22.5
REAR_DUAL_TIRE_WIDTH = 0.295
DUAL_SPACING = 0.340      # Center-to-center dual wheel spacing
HUB_Z = TIRE_RADIUS       # 0.510 m

FLOOR_Z = 0.380           # 380 mm low-floor datum
BELTLINE_Z = 1.050        # Lower window line
ROOF_BODY_Z = 2.950       # Body roof line
ROOF_HVAC_Z = 3.250       # Top of AC / battery enclosures
WINDSHIELD_TOP_Z = 2.850  # Top of front panoramic glass
DESTINATION_SIGN_Z = 2.880# Route display center height

def safe_reset_scene():
    """Safely reset scene without breaking Blender MCP socket."""
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for col in list(bpy.data.collections):
        if col.name != "Scene Collection":
            bpy.data.collections.remove(col)
            
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1.0
    
    master_col = bpy.context.scene.collection
    for col_name in COLLECTIONS:
        if col_name not in bpy.data.collections:
            col = bpy.data.collections.new(col_name)
            master_col.children.link(col)
            
    print("[BUS_BUILDER] Scene initialized with 11 production collections.")

def get_collection(col_name):
    if col_name in bpy.data.collections:
        return bpy.data.collections[col_name]
    col = bpy.data.collections.new(col_name)
    bpy.context.scene.collection.children.link(col)
    return col

def link_to_collection(obj, col_name):
    target_col = get_collection(col_name)
    for col in list(obj.users_collection):
        col.unlink(obj)
    target_col.objects.link(obj)

def apply_finishing(obj, bevel=0.005, subsurf=0, weighted_normals=True):
    """Apply high-end smoothing, precision bevel, and weighted normals."""
    if not obj or obj.type != 'MESH':
        return
    for p in obj.data.polygons:
        p.use_smooth = True
    if bevel > 0:
        b = obj.modifiers.new(name="Bevel", type='BEVEL')
        b.width = bevel
        b.segments = 2
        b.limit_method = 'ANGLE'
        b.angle_limit = math.radians(35)
    if weighted_normals:
        wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        wn.keep_sharp = True
        if hasattr(obj.data, "use_auto_smooth"):
            try:
                obj.data.use_auto_smooth = True
            except Exception:
                pass

def create_box(name, location, size, col_name=None, mat=None):
    """Helper to create a box mesh with specified center location and size (dx, dy, dz)."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    
    # Scale from unit cube to (dx, dy, dz)
    for v in bm.verts:
        v.co.x *= size[0]
        v.co.y *= size[1]
        v.co.z *= size[2]
        
    bm.to_mesh(mesh)
    bm.free()
    
    obj.location = location
    if col_name:
        link_to_collection(obj, col_name)
    else:
        bpy.context.scene.collection.objects.link(obj)
        
    if mat:
        obj.data.materials.append(mat)
    apply_finishing(obj, bevel=0.004)
    return obj

def create_cylinder(name, location, radius, depth, rotation=(0,0,0), vertices=32, col_name=None, mat=None):
    """Helper to create a cylinder along Z, rotated into place."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=vertices, radius1=radius, radius2=radius, depth=depth)
    bm.to_mesh(mesh)
    bm.free()
    
    obj.location = location
    obj.rotation_euler = rotation
    if col_name:
        link_to_collection(obj, col_name)
    else:
        bpy.context.scene.collection.objects.link(obj)
        
    if mat:
        obj.data.materials.append(mat)
    apply_finishing(obj, bevel=0.003)
    return obj
