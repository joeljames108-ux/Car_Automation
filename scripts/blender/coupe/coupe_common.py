"""
Bentley Continental GT II Coupe (2011) Common Geometry & Constants (Blender 5.2 LTS)
High-Fidelity British Luxury Grand Tourer Specification
World Coordinate Standard:
  +Y = Forward (Front Bumper, Hood, Headlights)
  -Y = Rearward (Rear Bumper, Trunk, Taillights, Exhaust)
  +Z = Vertical Up (Ground plane Z=0, Roof Z~1.404m)
  +X / -X = Lateral Width (In LHD: +X = Driver Left, -X = Passenger Right)
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix

# -----------------------------------------------------------------------------
# 1. BENTLEY CONTINENTAL GT II (2011) FACTORY SPECIFICATION HARDPOINTS
# -----------------------------------------------------------------------------
OVERALL_LENGTH   = 4.806   # 4,806 mm length
OVERALL_WIDTH    = 1.944   # 1,944 mm body width (excluding mirrors)
MIRROR_WIDTH     = 2.227   # 2,227 mm width with extended mirrors
OVERALL_HEIGHT   = 1.404   # 1,404 mm roof height
WHEELBASE        = 2.746   # 2,746 mm wheelbase

# Longitudinal Placement Datum (Origin at vehicle center of wheelbase/track)
FRONT_AXLE_Y     =  WHEELBASE / 2.0    # +1.373 m
REAR_AXLE_Y      = -WHEELBASE / 2.0    # -1.373 m
FRONT_BUMPER_Y   =  FRONT_AXLE_Y + 0.940 # +2.313 m (Front Overhang = 940 mm)
REAR_BUMPER_Y    =  REAR_AXLE_Y - 1.120  # -2.493 m (Rear Overhang = 1,120 mm)

# Track Widths & Stance
TRACK_FRONT      = 1.664   # 1,664 mm front track
TRACK_REAR       = 1.655   # 1,655 mm rear track
GROUND_CLEARANCE = 0.135   # 135 mm ride height

# Wheel & Tire Packaging (21-inch Mulliner Specification)
TIRE_RADIUS      = 0.352   # 704 mm outer diameter (275/35 ZR21 front, 315/30 ZR21 rear)
WHEEL_RADIUS     = 0.267   # 21-inch alloy rim (534 mm rim diameter)
TIRE_WIDTH_F     = 0.275   # 275 mm front tire width
TIRE_WIDTH_R     = 0.315   # 315 mm rear tire width
HUB_Z            = TIRE_RADIUS # 0.352 m center of wheel hubs

# Vertical Datums
FLOOR_PAN_Z      = GROUND_CLEARANCE + 0.050 # ~0.185 m
ROCKER_SILL_Z    = GROUND_CLEARANCE + 0.120 # ~0.255 m
BELTLINE_Z       = 0.880   # Window sill line (880 mm above ground)
COWL_Z           = 0.860   # Base of raked windshield
HOOD_CROWN_Z     = 0.890   # Center power-bulge hood crown
ROOF_BODY_Z      = OVERALL_HEIGHT # 1.404 m
TRUNK_DECK_Z     = 0.960   # Rear ducktail lip datum

# -----------------------------------------------------------------------------
# 2. BLENDER PRODUCTION COLLECTIONS
# -----------------------------------------------------------------------------
COLLECTIONS = [
    "00_Coupe_Root",
    "01_Coupe_Chassis_Platform",
    "02_Coupe_Powertrain_Drivetrain",
    "03_Coupe_Suspension_Brakes",
    "04_Coupe_Wheels_Tires",
    "05_Coupe_Body_Monocoque",
    "06_Coupe_Closures_Panels",
    "07_Coupe_Fascia_Aerodynamics",
    "08_Coupe_Glazing_Windows",
    "09_Coupe_Lighting_Optics",
    "10_Coupe_Exterior_Hardware",
]

def safe_reset_scene():
    """Safely clear scene objects while strictly preserving Blender MCP socket listener."""
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
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
            
    print(f"[COUPE_COMMON] Scene initialized with {len(COLLECTIONS)} production collections.")

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

def apply_finishing(obj, bevel=0.003, weighted_normals=True):
    """Applies auto-smoothing, non-destructive angle bevel, and weighted normal modifiers."""
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

def create_box(name, location, size, rotation=(0,0,0), col_name=None, mat=None, bevel=0.003):
    """Helper to create a box mesh with specified center location, size (dx, dy, dz), and optional rotation."""
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
    obj.rotation_euler = rotation
    if col_name:
        link_to_collection(obj, col_name)
    else:
        bpy.context.scene.collection.objects.link(obj)
        
    if mat:
        obj.data.materials.append(mat)
    apply_finishing(obj, bevel=bevel)
    return obj

def create_cylinder(name, location, radius, depth, rotation=(0,0,0), vertices=32, col_name=None, mat=None, bevel=0.002):
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
    apply_finishing(obj, bevel=bevel)
    return obj

def create_tube(name, location, inner_radius, outer_radius, depth, rotation=(0,0,0), vertices=36, col_name=None, mat=None, bevel=0.002):
    """Creates a hollow cylindrical tube along Z, rotated into place. Ideal for tire barrels and rim rings."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    
    bm = bmesh.new()
    half_d = depth / 2.0
    outer_top, outer_btm = [], []
    inner_top, inner_btm = [], []
    
    for i in range(vertices):
        angle = (2.0 * math.pi * i) / vertices
        cos_a = math.cos(angle)
        sin_a = math.sin(angle)
        outer_top.append(bm.verts.new(Vector((outer_radius * cos_a, outer_radius * sin_a,  half_d))))
        outer_btm.append(bm.verts.new(Vector((outer_radius * cos_a, outer_radius * sin_a, -half_d))))
        inner_top.append(bm.verts.new(Vector((inner_radius * cos_a, inner_radius * sin_a,  half_d))))
        inner_btm.append(bm.verts.new(Vector((inner_radius * cos_a, inner_radius * sin_a, -half_d))))
        
    bm.verts.ensure_lookup_table()
    for i in range(vertices):
        next_i = (i + 1) % vertices
        # Outer face
        bm.faces.new((outer_top[i], outer_top[next_i], outer_btm[next_i], outer_btm[i]))
        # Inner face
        bm.faces.new((inner_top[next_i], inner_top[i], inner_btm[i], inner_btm[next_i]))
        # Top annular cap
        bm.faces.new((outer_top[i], inner_top[i], inner_top[next_i], outer_top[next_i]))
        # Bottom annular cap
        bm.faces.new((outer_btm[next_i], inner_btm[next_i], inner_btm[i], outer_btm[i]))
        
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
    apply_finishing(obj, bevel=bevel)
    return obj

def create_box_primitive(name, size=(1,1,1), location=(0,0,0), rotation=(0,0,0), mat=None, collection_name=None, bevel=0.003):
    return create_box(name, location=location, size=size, rotation=rotation, col_name=collection_name, mat=mat, bevel=bevel)

def create_cylinder_primitive(name, radius=0.1, depth=0.1, segments=32, location=(0,0,0), rotation=(0,0,0), mat=None, collection_name=None, bevel=0.002):
    return create_cylinder(name, location=location, radius=radius, depth=depth, rotation=rotation, vertices=segments, col_name=collection_name, mat=mat, bevel=bevel)

