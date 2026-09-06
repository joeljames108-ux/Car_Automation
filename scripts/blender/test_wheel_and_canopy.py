import bpy
import bmesh
import math
from mathutils import Vector, Matrix

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def test_wheel():
    reset()
    bm = bmesh.new()
    tire_r = 0.36
    rim_r = 0.25
    tire_w = 0.32
    
    # 1. Tire Ring
    # Outer circle
    verts_outer_1 = []
    verts_outer_2 = []
    verts_inner_1 = []
    verts_inner_2 = []
    segs = 32
    for i in range(segs):
        ang = 2 * math.pi * i / segs
        y = math.cos(ang)
        z = math.sin(ang)
        verts_outer_1.append(bm.verts.new(Vector((-tire_w/2, y * tire_r, z * tire_r))))
        verts_outer_2.append(bm.verts.new(Vector((tire_w/2, y * tire_r, z * tire_r))))
        verts_inner_1.append(bm.verts.new(Vector((-tire_w/2, y * rim_r, z * rim_r))))
        verts_inner_2.append(bm.verts.new(Vector((tire_w/2, y * rim_r, z * rim_r))))
    
    bm.verts.ensure_lookup_table()
    
    # Faces: outer tread, inner bore, and sidewalls
    for i in range(segs):
        i_next = (i + 1) % segs
        # Tread
        bm.faces.new([verts_outer_1[i], verts_outer_2[i], verts_outer_2[i_next], verts_outer_1[i_next]])
        # Inner bore
        bm.faces.new([verts_inner_1[i_next], verts_inner_2[i_next], verts_inner_2[i], verts_inner_1[i]])
        # Outer sidewall (-X face)
        bm.faces.new([verts_inner_1[i], verts_inner_1[i_next], verts_outer_1[i_next], verts_outer_1[i]])
        # Inner sidewall (+X face)
        bm.faces.new([verts_inner_2[i_next], verts_inner_2[i], verts_outer_2[i], verts_outer_2[i_next]])
        
    mesh = bpy.data.meshes.new("Test_Tire")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Test_Tire", mesh)
    bpy.context.scene.collection.objects.link(obj)
    print("Tire ring created successfully! Vertices:", len(obj.data.vertices), "Faces:", len(obj.data.polygons))

if __name__ == "__main__":
    test_wheel()
