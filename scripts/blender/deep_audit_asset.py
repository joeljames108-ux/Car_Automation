import bpy
import json
import os
from mathutils import Vector

def run_deep_audit(glb_path, output_json_path):
    print("==================================================")
    print(f"RUNNING DEEP AUDIT ON: {glb_path}")
    print("==================================================")
    
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    all_objects = list(bpy.data.objects)
    mesh_objects = [o for o in all_objects if o.type == 'MESH']
    empty_objects = [o for o in all_objects if o.type == 'EMPTY']
    materials = list(bpy.data.materials)
    images = list(bpy.data.images)
    
    total_vertices = sum(len(o.data.vertices) for o in mesh_objects)
    total_polygons = sum(len(o.data.polygons) for o in mesh_objects)
    total_triangles = sum(len(o.data.loop_triangles) if hasattr(o.data, 'loop_triangles') and len(o.data.loop_triangles) > 0 else len(o.data.polygons) * 2 for o in mesh_objects)
    
    # Calculate bounding box
    min_c = [float('inf')]*3
    max_c = [float('-inf')]*3
    
    for obj in mesh_objects:
        for corner in obj.bound_box:
            world_pt = obj.matrix_world @ Vector(corner)
            for i in range(3):
                min_c[i] = min(min_c[i], world_pt[i])
                max_c[i] = max(max_c[i], world_pt[i])
                
    width = max_c[0] - min_c[0]
    length = max_c[1] - min_c[1]
    height = max_c[2] - min_c[2]
    ground_clearance = min_c[2] # Lowest point relative to Z=0
    
    # Material breakdown
    mat_summary = []
    for mat in materials:
        user_objs = [o.name for o in mesh_objects if any(s.material == mat for s in o.material_slots)]
        mat_summary.append({
            "name": mat.name,
            "user_object_count": len(user_objs),
            "sample_objects": user_objs[:3]
        })
        
    # Texture breakdown
    tex_summary = []
    total_tex_bytes = 0
    for img in images:
        w, h = img.size[0], img.size[1]
        bpp = 4 # RGBA 8-bit
        img_bytes = w * h * bpp
        total_tex_bytes += img_bytes
        tex_summary.append({
            "name": img.name,
            "resolution": f"{w}x{h}",
            "estimated_bytes": img_bytes
        })
        
    # Shading & Normal audit
    faceted_count = 0
    smooth_count = 0
    has_custom_normals_count = 0
    for obj in mesh_objects:
        smooth_polys = sum(1 for p in obj.data.polygons if p.use_smooth)
        if smooth_polys == len(obj.data.polygons):
            smooth_count += 1
        else:
            faceted_count += 1
        if obj.data.has_custom_normals:
            has_custom_normals_count += 1
            
    audit_data = {
        "asset_path": glb_path,
        "file_size_bytes": os.path.getsize(glb_path),
        "file_size_mb": round(os.path.getsize(glb_path) / (1024 * 1024), 2),
        "total_objects": len(all_objects),
        "mesh_objects_count": len(mesh_objects),
        "empty_objects_count": len(empty_objects),
        "total_vertices": total_vertices,
        "total_polygons": total_polygons,
        "dimensions_meters": {
            "width_x": round(width, 4),
            "length_y": round(length, 4),
            "height_z": round(height, 4),
            "lowest_z_ground_contact": round(ground_clearance, 4)
        },
        "material_count": len(materials),
        "texture_count": len(images),
        "total_estimated_texture_memory_mb": round(total_tex_bytes / (1024 * 1024), 2),
        "shading_audit": {
            "smooth_mesh_count": smooth_count,
            "faceted_or_mixed_mesh_count": faceted_count,
            "meshes_with_custom_split_normals": has_custom_normals_count
        },
        "materials": mat_summary[:15],
        "textures": tex_summary
    }
    
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(audit_data, f, indent=2)
        
    print(f"[AUDIT COMPLETED] Report written to: {output_json_path}")
    print(f"  Total Vertices: {total_vertices:,}")
    print(f"  Total Polygons: {total_polygons:,}")
    print(f"  Total Objects: {len(all_objects)} (Draw calls bottleneck if un-instanced)")
    print(f"  Dimensions: Length={length:.3f}m, Width={width:.3f}m, Height={height:.3f}m")
    print(f"  Ground offset: {ground_clearance:.4f}m")

if __name__ == "__main__":
    src = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\original\car_exterior_primary.glb"
    out = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\blender\audit_exterior_primary.json"
    run_deep_audit(src, out)
