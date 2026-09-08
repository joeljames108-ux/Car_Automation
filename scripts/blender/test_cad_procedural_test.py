"""
Test CAD procedural primitives in Blender headless mode.
Verify bmesh curvature, bevels, and smooth normal operations.
"""
import bpy
import bmesh
import math

print("Testing Blender Bmesh CAD procedures...")

# Clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Test creating curved sheet metal with bevel and smooth normals
bm = bmesh.new()
nx, ny = 12, 12
sx, sy = 1.4, 1.2
camber = 0.05

verts = []
for j in range(ny + 1):
    v = j / ny
    y = (v - 0.5) * sy
    for i in range(nx + 1):
        u = i / nx
        x = (u - 0.5) * sx
        # Parabolic camber (crown)
        z = camber * (1.0 - 4.0 * (u - 0.5)**2) * (1.0 - 2.0 * (v - 0.5)**2)
        verts.append(bm.verts.new((x, y, z)))

bm.verts.ensure_lookup_table()
for j in range(ny):
    for i in range(nx):
        v1 = verts[j * (nx + 1) + i]
        v2 = verts[j * (nx + 1) + i + 1]
        v3 = verts[(j + 1) * (nx + 1) + i + 1]
        v4 = verts[(j + 1) * (nx + 1) + i]
        bm.faces.new((v1, v2, v3, v4))

mesh = bpy.data.meshes.new("Test_Curved_Mesh")
bm.to_mesh(mesh)
bm.free()

obj = bpy.data.objects.new("Test_Curved_Panel", mesh)
bpy.context.scene.collection.objects.link(obj)

# Add Solidify for sheet metal thickness
sol = obj.modifiers.new("Solidify", 'SOLIDIFY')
sol.thickness = 0.015

# Add Bevel for rounded edges
bev = obj.modifiers.new("Bevel", 'BEVEL')
bev.width = 0.005
bev.segments = 3

# Add Weighted Normal for crisp specular reflections
wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
wn.keep_sharp = True

bpy.context.view_layer.objects.active = obj
bpy.ops.object.modifier_apply(modifier="Solidify")
bpy.ops.object.modifier_apply(modifier="Bevel")
bpy.ops.object.modifier_apply(modifier="WeightedNormal")

for poly in obj.data.polygons:
    poly.use_smooth = True

print(f"Success! Generated curved panel with {len(obj.data.vertices)} vertices and {len(obj.data.polygons)} faces.")
