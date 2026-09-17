import os
import sys
import json
import logging
import bpy
import bmesh
from mathutils import Vector, Matrix

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ApexBatchGenFull")

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PUBLIC_MODELS_DIR = os.path.join(ROOT_DIR, "public", "models", "vehicles")
MANIFEST_PATH = os.path.join(ROOT_DIR, "public", "models", "vehicles", "matrix_manifest.json")

def create_pbr_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    out = nodes.new(type="ShaderNodeOutputMaterial")
    mat.node_tree.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    
    if 'Base Color' in bsdf.inputs:
        bsdf.inputs['Base Color'].default_value = base_color
    if 'Metallic' in bsdf.inputs:
        bsdf.inputs['Metallic'].default_value = metallic
    if 'Roughness' in bsdf.inputs:
        bsdf.inputs['Roughness'].default_value = roughness
    if 'Coat Weight' in bsdf.inputs: # Blender 4.0+
        bsdf.inputs['Coat Weight'].default_value = clearcoat
        bsdf.inputs['Coat Roughness'].default_value = 0.05
    elif 'Clearcoat' in bsdf.inputs: # Older Blender
        bsdf.inputs['Clearcoat'].default_value = clearcoat
    return mat

def get_era_color(era_id):
    colors = {
        "1970s": (0.75, 0.45, 0.12, 1.0),
        "1980s": (0.85, 0.12, 0.12, 1.0),
        "1990s": (0.08, 0.28, 0.22, 1.0),
        "2000s": (0.78, 0.82, 0.86, 1.0),
        "2010s": (0.04, 0.18, 0.48, 1.0),
        "2020s": (0.12, 0.14, 0.16, 1.0),
        "future": (0.88, 0.94, 0.98, 1.0),
    }
    return colors.get(era_id, (0.5, 0.5, 0.5, 1.0))

def parse_dimensions(proportions_str):
    """Fallback extraction from description string if exact dims aren't passed"""
    L, W, H, WB = 4.8, 1.9, 1.45, 2.8
    # Simple regex or heuristic parsing can be added, returning defaults for now
    return L, W, H, WB

def generate_full_matrix():
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)
        
    cells = manifest.get("cells", [])
    logger.info(f"Loaded {len(cells)} cells from manifest.")
    
    count = 0
    for cell in cells:
        arch_id = cell["architecture"]
        era_id = cell["era"]
        out_path = os.path.join(PUBLIC_MODELS_DIR, arch_id, era_id, "vehicle.glb")
        
        # Dimensions based on architecture heuristics
        L, W, H, WB = 4.8, 1.9, 1.4, 2.8
        ground_clr = 0.14
        if arch_id in ["suv", "crossover", "offroad_4x4"]:
            L, W, H, WB, ground_clr = 4.9, 1.95, 1.8, 2.9, 0.22
        elif arch_id in ["pickup", "pickup_truck"]:
            L, W, H, WB, ground_clr = 5.4, 2.0, 1.85, 3.2, 0.24
        elif arch_id in ["heavy_truck", "truck_lorry"]:
            L, W, H, WB, ground_clr = 6.2, 2.4, 3.2, 4.0, 0.3
        elif arch_id in ["bus", "bus_shuttle"]:
            L, W, H, WB, ground_clr = 12.0, 2.5, 3.2, 6.0, 0.2
        elif arch_id in ["limousine"]:
            L, W, H, WB, ground_clr = 6.0, 1.95, 1.48, 3.8, 0.15
        elif arch_id in ["supercar", "hypercar", "gt3_racing", "race_formula"]:
            L, W, H, WB, ground_clr = 4.6, 2.0, 1.15, 2.7, 0.08
            
        color = get_era_color(era_id)
        
        # Clean
        for obj in list(bpy.data.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
            
        root = bpy.data.objects.new("VEHICLE_ROOT", None)
        bpy.context.scene.collection.objects.link(root)
        
        body = bpy.data.objects.new("BODY_Master", None)
        body.parent = root
        bpy.context.scene.collection.objects.link(body)
        
        # Create Shell
        mesh_body = bpy.data.meshes.new("BODY_Main")
        obj_body = bpy.data.objects.new("BODY_Main", mesh_body)
        obj_body.parent = body
        bpy.context.scene.collection.objects.link(obj_body)
        
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        body_h = H - ground_clr
        bmesh.ops.scale(bm, vec=Vector((W, L, body_h)), verts=bm.verts)
        bmesh.ops.translate(bm, vec=Vector((0, 0, ground_clr + body_h/2)), verts=bm.verts)
        bm.to_mesh(mesh_body)
        bm.free()
        
        mat = create_pbr_material(f"Paint_{era_id}", color, metallic=0.8, roughness=0.15, clearcoat=1.0)
        obj_body.data.materials.append(mat)
        
        # Subsurf
        mod = obj_body.modifiers.new("Subsurf", 'SUBSURF')
        mod.levels = 1
        
        # Export
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        for o in bpy.context.selected_objects:
            o.select_set(False)
        root.select_set(True)
        for c in root.children:
            c.select_set(True)
            for cc in c.children:
                cc.select_set(True)
                
        bpy.ops.export_scene.gltf(
            filepath=out_path,
            use_selection=True,
            export_yup=True,
            export_apply=True,
            export_format='GLB'
        )
        count += 1
    
    logger.info(f"Done! Generated {count} GLB files across all architectures and eras.")

if __name__ == "__main__":
    generate_full_matrix()
