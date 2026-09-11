"""
Bugatti Divo Common Geometric Standards & Utilities (Blender 4.x / 5.x)
High-Fidelity Track-Focused Hypercar Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler

COLLECTIONS = [
    "01_Divo_Body_Monocoque",
    "02_Divo_Aero_Splitter_Diffuser",
    "03_Divo_Active_Rear_Wing",
    "04_Divo_Lighting_OLED_Fins",
    "05_Divo_Greenhouse_Glazing",
    "06_Divo_Chassis_Tub_Subframe",
    "07_Divo_Powertrain_W16_QuadTurbo",
    "08_Divo_Pushrod_Suspension",
    "09_Divo_Aero_Wheels_Brakes",
    "10_Divo_Cockpit_Interior",
    "11_Divo_Hardware_AirIntakes"
]

# Strict ISO 8855 Coordinate Standards (m):
# +Y = Forward (Front Splitter, Headlights, Horseshoe Grille)
# -Y = Rearward (Diffuser, 3D Taillights, Active Wing, W16 Engine)
# +Z = Vertical Up (Ground plane Z=0.000m, Roof Z=1.212m)
# +X / -X = Lateral Width (Centreline X=0.000m)

WHEELBASE = 2.711         # 2711 mm
OVERALL_LENGTH = 4.641    # 4641 mm
OVERALL_WIDTH = 2.018     # 2018 mm (body shell), 2.120m with aero mirrors
OVERALL_HEIGHT = 1.212    # 1212 mm (unladen roof crown)
GROUND_CLEARANCE = 0.095  # 95 mm (Track mode ride height)
FRONT_TRACK = 1.740       # 1740 mm
REAR_TRACK = 1.670        # 1670 mm

FRONT_AXLE_Y = 1.355      # Wheelbase / 2
REAR_AXLE_Y = -1.355      # -Wheelbase / 2
FRONT_BUMPER_Y = 2.320    # Front splitter tip
REAR_BUMPER_Y = -2.321    # Rear diffuser trailing edge

# Staggered Wheel Setup (20" Front / 21" Rear)
FRONT_TIRE_RADIUS = 0.340 # 285/30 R20 (680 mm diameter)
REAR_TIRE_RADIUS = 0.355  # 355/25 R21 (710 mm diameter)
FRONT_RIM_RADIUS = 0.254  # 20-inch rim (508 mm / 2)
REAR_RIM_RADIUS = 0.267   # 21-inch rim (533.4 mm / 2)
FRONT_TIRE_WIDTH = 0.285  # 285 mm
REAR_TIRE_WIDTH = 0.355   # 355 mm wide rear footprint
FRONT_HUB_Z = FRONT_TIRE_RADIUS # 0.340 m
REAR_HUB_Z = REAR_TIRE_RADIUS   # 0.355 m

ROOF_CROWN_Z = 1.212      # Roof apex
BELTLINE_Z = 0.880        # Lower greenhouse line
COWL_Z = 0.820            # Windshield base
WING_HEIGHT_Z = 1.320     # Active wing deployed height
WING_SPAN_Y = 1.830       # 1.83m wide active rear wing

def safe_reset_scene():
    """Safely resets Blender scene and initializes 11 semantic collections."""
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
            
    print("[DIVO_BUILDER] Scene initialized with 11 production collections.")

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

def apply_finishing(obj, bevel=0.003, subsurf=0, weighted_normals=True):
    """Applies precision bevel, smooth shading, and weighted normals."""
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

def create_box(name, location, size, col_name=None, mat=None):
    """Helper to create a box mesh with specified center and dimensions (dx, dy, dz)."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
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
    apply_finishing(obj, bevel=0.003)
    return obj

def create_cylinder(name, location, radius, depth, rotation=(0,0,0), vertices=32, col_name=None, mat=None):
    """Helper to create a precision cylinder rotated into place."""
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
    apply_finishing(obj, bevel=0.002)
    return obj
