"""
Test script to generate and render a clean, watertight 190E Cosworth unibody.
"""
import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler

# Clean scene
if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for col in list(bpy.data.collections):
    bpy.data.collections.remove(col)
for mesh in list(bpy.data.meshes):
    bpy.data.meshes.remove(mesh)
for mat in list(bpy.data.materials):
    bpy.data.materials.remove(mat)

# Setup Scene
col = bpy.data.collections.new("TestCol")
bpy.context.scene.collection.children.link(col)

# Simple PBR
mat_paint = bpy.data.materials.new("Paint_190E")
mat_paint.use_nodes = True
bsdf = mat_paint.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.055, 1.0) # Blue-black metallic
bsdf.inputs["Metallic"].default_value = 0.85
bsdf.inputs["Roughness"].default_value = 0.20

mat_sacco = bpy.data.materials.new("Sacco_Cladding")
mat_sacco.use_nodes = True
bsdf_s = mat_sacco.node_tree.nodes.get("Principled BSDF")
bsdf_s.inputs["Base Color"].default_value = (0.18, 0.19, 0.20, 1.0) # Matte grey
bsdf_s.inputs["Metallic"].default_value = 0.10
bsdf_s.inputs["Roughness"].default_value = 0.50

mat_glass = bpy.data.materials.new("Glass_Tint")
mat_glass.use_nodes = True
bsdf_g = mat_glass.node_tree.nodes.get("Principled BSDF")
bsdf_g.inputs["Base Color"].default_value = (0.1, 0.15, 0.12, 1.0)
bsdf_g.inputs["Transmission Weight"].default_value = 0.85
bsdf_g.inputs["Roughness"].default_value = 0.02

# Build continuous unibody
bm = bmesh.new()

# Cross-sections along Y
# Stations: Y, hw_sill, hw_sacco, hw_flare, hw_waist, hw_upper, hw_mid, z_sill, z_sacco, z_flare, z_waist, z_upper, z_center, is_cabin, is_open_arch
stations = [
    # Nose & Front Bumper
    ( 0.865,  0.420, 0.580, 0.680, 0.720, 0.580, 0.300,  0.14, 0.26, 0.42, 0.62, 0.720, 0.730, False, False),
    ( 0.760,  0.550, 0.680, 0.760, 0.780, 0.660, 0.360,  0.15, 0.30, 0.48, 0.68, 0.750, 0.765, False, False),
    ( 0.550,  0.680, 0.760, 0.820, 0.820, 0.740, 0.440,  0.16, 0.36, 0.55, 0.76, 0.790, 0.805, False, False),
    # Front Wheel Arch
    ( 0.280,  0.720, 0.790, 0.860, 0.840, 0.745, 0.450,  0.34, 0.48, 0.64, 0.79, 0.805, 0.818, False, True),
    ( 0.000,  0.730, 0.800, 0.875, 0.853, 0.750, 0.450,  0.44, 0.56, 0.68, 0.80, 0.815, 0.828, False, True),
    (-0.280,  0.720, 0.790, 0.860, 0.840, 0.745, 0.450,  0.34, 0.48, 0.64, 0.79, 0.805, 0.818, False, True),
    # Windshield Cowl & Front Cabin
    (-0.520,  0.760, 0.820, 0.845, 0.840, 0.620, 0.350,  0.16, 0.36, 0.55, 0.81, 0.860, 0.875, False, False),
    (-0.750,  0.770, 0.825, 0.840, 0.835, 0.560, 0.320,  0.16, 0.36, 0.55, 0.82, 1.140, 1.155, True, False),
    (-0.950,  0.780, 0.830, 0.840, 0.830, 0.520, 0.300,  0.16, 0.36, 0.55, 0.82, 1.330, 1.345, True, False),
    # Cabin Center & B-Pillar
    (-1.332,  0.780, 0.830, 0.840, 0.830, 0.520, 0.300,  0.16, 0.36, 0.55, 0.82, 1.350, 1.361, True, False),
    (-1.680,  0.780, 0.830, 0.840, 0.830, 0.520, 0.300,  0.16, 0.36, 0.55, 0.82, 1.340, 1.355, True, False),
    (-1.950,  0.770, 0.825, 0.840, 0.830, 0.540, 0.310,  0.16, 0.36, 0.55, 0.82, 1.325, 1.338, True, False),
    # Rear C-Pillar & Backlight
    (-2.180,  0.760, 0.820, 0.840, 0.835, 0.580, 0.330,  0.16, 0.36, 0.55, 0.82, 1.120, 1.135, True, False),
    (-2.385,  0.750, 0.810, 0.855, 0.840, 0.720, 0.440,  0.34, 0.48, 0.64, 0.83, 0.875, 0.888, False, True),
    # Rear Wheel Arch & Axle Peak
    (-2.665,  0.750, 0.815, 0.875, 0.853, 0.740, 0.450,  0.44, 0.56, 0.68, 0.84, 0.880, 0.892, False, True),
    (-2.945,  0.740, 0.805, 0.855, 0.840, 0.720, 0.440,  0.34, 0.48, 0.64, 0.83, 0.885, 0.895, False, True),
    # Rear Deck & Tail Fascia
    (-3.250,  0.700, 0.760, 0.810, 0.820, 0.680, 0.400,  0.18, 0.38, 0.56, 0.82, 0.885, 0.895, False, False),
    (-3.565,  0.640, 0.700, 0.740, 0.760, 0.600, 0.350,  0.22, 0.40, 0.58, 0.80, 0.870, 0.880, False, False),
]

station_rings = []
for y, hs, hc, hf, hw, hu, hm, zs, zc, zf, zw, zu, zcen, is_cab, is_arch in stations:
    # Build half-cross section points from bottom sill to centerline:
    # 0: Sill
    # 1: Sacco cladding
    # 2: Blister flare
    # 3: Waistline / shoulder
    # 4: Upper shoulder / cantrail
    # 5: Roof gutter / hood swage
    # 6: Centerline crown
    left_pts = [
        Vector((-hs, y, zs)),
        Vector((-hc, y, zc)),
        Vector((-hf, y, zf)),
        Vector((-hw, y, zw)),
        Vector((-hu, y, zu)),
        Vector((-hm, y, (zu + zcen) * 0.5 + 0.005)),
        Vector((0.0, y, zcen)),
    ]
    # Right half is mirrored
    right_pts = [
        Vector((hm, y, (zu + zcen) * 0.5 + 0.005)),
        Vector((hu, y, zu)),
        Vector((hw, y, zw)),
        Vector((hf, y, zf)),
        Vector((hc, y, zc)),
        Vector((hs, y, zs)),
    ]
    all_pts = left_pts + right_pts
    ring_verts = [bm.verts.new(p) for p in all_pts]
    station_rings.append(ring_verts)

# Bridge adjacent station rings with quads
for i in range(len(station_rings) - 1):
    r1 = station_rings[i]
    r2 = station_rings[i+1]
    is_cladding = (i in [0, 1, 2, 6, 7, 8, 9, 10, 11, 12, 16])
    for j in range(len(r1) - 1):
        # Assign Sacco cladding material to lower zones (j=0 and j=len-2)
        m_idx = 1 if (is_cladding and (j in [0, len(r1) - 2])) else 0
        bm.faces.new([r1[j], r1[j+1], r2[j+1], r2[j]]).material_index = m_idx

# Front nose cap
r_front = station_rings[0]
v_front_c = bm.verts.new((0.0, 0.875, 0.450))
for j in range(len(r_front) - 1):
    bm.faces.new([r_front[j], v_front_c, r_front[j+1]]).material_index = 1

# Rear tail cap
r_rear = station_rings[-1]
v_rear_c = bm.verts.new((0.0, -3.575, 0.550))
for j in range(len(r_rear) - 1):
    bm.faces.new([r_rear[j], r_rear[j+1], v_rear_c]).material_index = 1

# Floorpan (connects left sill j=0 and right sill j=last across all stations)
for i in range(len(station_rings) - 1):
    r1 = station_rings[i]
    r2 = station_rings[i+1]
    # Sill vertices: r1[0] and r1[-1]
    bm.faces.new([r1[0], r2[0], r2[-1], r1[-1]]).material_index = 1

bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002)

mesh = bpy.data.meshes.new("BODY_Unibody_Mesh")
bm.to_mesh(mesh)
bm.free()

obj = bpy.data.objects.new("BODY_Unibody", mesh)
col.objects.link(obj)
obj.data.materials.append(mat_paint)
obj.data.materials.append(mat_sacco)

for p in obj.data.polygons:
    p.use_smooth = True

mod_sub = obj.modifiers.new("Subsurf", 'SUBSURF')
mod_sub.levels = 2
mod_sub.render_levels = 2

mod_wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
mod_wn.keep_sharp = True

# Add camera and render front three quarter view
cam_data = bpy.data.cameras.new("Cam")
cam_obj = bpy.data.objects.new("Cam", cam_data)
col.objects.link(cam_obj)
cam_obj.location = Vector((3.8, 2.5, 1.35))
direction = Vector((0.0, -1.25, 0.62)) - cam_obj.location
cam_obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
bpy.context.scene.camera = cam_obj

# Sun light
light_data = bpy.data.lights.new("Sun", 'SUN')
light_data.energy = 3.5
light_obj = bpy.data.objects.new("Sun", light_data)
col.objects.link(light_obj)
light_obj.rotation_euler = Euler((math.radians(50.0), math.radians(20.0), math.radians(-30.0)))

# Render test image
bpy.context.scene.render.engine = 'BLENDER_EEVEE'
bpy.context.scene.render.resolution_x = 960
bpy.context.scene.render.resolution_y = 540
bpy.context.scene.render.filepath = "e:/Car_Automation/test_190e_unibody.png"
bpy.ops.render.render(write_still=True)
print("TEST RENDER FINISHED: e:/Car_Automation/test_190e_unibody.png")
