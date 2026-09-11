import bpy
import bmesh
import math
from mathutils import Vector, Euler

def test_seat_gen():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Create test seat cushion
    bm = bmesh.new()
    nx, ny = 16, 14
    w, l = 0.46, 0.46
    cx, cy, cz = 0.0, -1.35, 0.22
    verts = []
    for j in range(ny + 1):
        v = j / ny
        y = cy + (v - 0.5) * l
        front_lift = 0.025 * math.sin(v * math.pi * 0.5)
        for i in range(nx + 1):
            u = i / nx
            x = cx + (u - 0.5) * w
            lat = abs(u - 0.5) * 2.0
            bolster = 0.07 * (lat ** 2.0)
            center_dip = -0.012 * (1.0 - lat ** 2)
            z = cz + front_lift + bolster + center_dip
            verts.append(bm.verts.new((x, y, z)))
    bm.verts.ensure_lookup_table()
    for j in range(ny):
        for i in range(nx):
            v1 = verts[j * (nx + 1) + i]
            v2 = verts[j * (nx + 1) + i + 1]
            v3 = verts[(j + 1) * (nx + 1) + i + 1]
            v4 = verts[(j + 1) * (nx + 1) + i]
            bm.faces.new((v1, v2, v3, v4))
    for f in bm.faces:
        f.smooth = True
    me = bpy.data.meshes.new("TEST_SEAT_CUSHION_Mesh")
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new("TEST_SEAT_CUSHION", me)
    bpy.context.scene.collection.objects.link(obj)
    
    sol = obj.modifiers.new("Solidify", 'SOLIDIFY')
    sol.thickness = 0.07
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier="Solidify")
    
    print("[SUCCESS] Test seat cushion generated with vertices:", len(me.vertices))

if __name__ == "__main__":
    test_seat_gen()
