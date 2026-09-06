import bpy
import bmesh
import os
from mathutils import Vector

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SOURCE_FBX = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "source", "FINAL_MODEL", "FINAL_MODEL.fbx")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=SOURCE_FBX)

obj = bpy.data.objects.get("Interior")
if obj:
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    
    print(f"Total faces: {len(bm.faces)}")
    # Find planar quad faces that form a large flat rectangle in center
    vertical_planar = []
    for f in bm.faces:
        if abs(f.normal.y) > 0.80:
            area = f.calc_area()
            c = f.calc_center_bounds()
            if area > 1e-6:
                vertical_planar.append((area, c, f.index))
                
    vertical_planar.sort(key=lambda x: x[0], reverse=True)
    print(f"Top 10 largest planar Y-facing faces in Interior:")
    for area, c, idx in vertical_planar[:10]:
        print(f"  Face {idx:5d}: area={area:.6f}, center=({c.x:.4f}, {c.y:.4f}, {c.z:.4f})")
    bm.free()
