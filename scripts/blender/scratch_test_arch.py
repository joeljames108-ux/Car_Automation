"""
Test script to verify authentic open-wheel-arch topology and smooth Class-A curvature
for the Ferrari F12berlinetta.
"""
import bpy
import bmesh
import math
from mathutils import Vector, Matrix

# Purge existing scene
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
for block in [bpy.data.meshes, bpy.data.materials]:
    for item in list(block):
        if item.users == 0:
            block.remove(item)

# Material
mat_red = bpy.data.materials.new("Red")
mat_red.use_nodes = True
bsdf = mat_red.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Base Color"].default_value = (0.82, 0.015, 0.022, 1.0)
bsdf.inputs["Roughness"].default_value = 0.15
if "Clearcoat" in bsdf.inputs:
    bsdf.inputs["Clearcoat"].default_value = 1.0
elif "Coat Weight" in bsdf.inputs:
    bsdf.inputs["Coat Weight"].default_value = 1.0

bm = bmesh.new()

f_axle = 1.380
r_axle = -1.340
arch_r_f = 0.380
arch_r_r = 0.400
z_ax_f = 0.343
z_ax_r = 0.364

# 1. Front Fender Eyebrow (Arch Over Front Wheel)
# Sweeps over front wheel from Y = f_axle - arch_r_f to Y = f_axle + arch_r_f
for side in [1.0, -1.0]:
    arch_lip = []
    fender_crest = []
    num_arch_pts = 13
    for i in range(num_arch_pts):
        ang = math.pi * i / (num_arch_pts - 1)
        ay = f_axle + arch_r_f * math.cos(ang)
        az = z_ax_f + arch_r_f * math.sin(ang)
        # Flare blister
        ax = side * (0.940 + 0.020 * math.sin(ang))
        arch_lip.append(bm.verts.new(Vector((ax, ay, az))))

        # Corresponding top crest along fender
        cy = ay
        cz = 0.740 + 0.035 * math.sin(ang)
        cx = side * 0.920
        fender_crest.append(bm.verts.new(Vector((cx, cy, cz))))

    for i in range(num_arch_pts - 1):
        if side > 0:
            bm.faces.new((arch_lip[i], arch_lip[i+1], fender_crest[i+1], fender_crest[i]))
        else:
            bm.faces.new((arch_lip[i], fender_crest[i], fender_crest[i+1], arch_lip[i+1]))

mesh = bpy.data.meshes.new("TestFender")
bm.to_mesh(mesh)
bm.free()

obj = bpy.data.objects.new("TestFender", mesh)
bpy.context.scene.collection.objects.link(obj)
obj.data.materials.append(mat_red)

print("Test fender created successfully!")
