import bpy
import os
from mathutils import Vector

def log(msg):
    print(f"[VOLVO_REFINEMENT] {msg}")

def set_principled_socket(principled, socket_names, value):
    for name in socket_names:
        if name in principled.inputs:
            principled.inputs[name].default_value = value
            return True
    return False

def build_pbr_material(name, base_color, metallic, roughness, clearcoat=0.0, clearcoat_rough=0.03, transmission=0.0, ior=1.52, emission=None, emission_strength=1.0, alpha=1.0):
    mat = bpy.data.materials.new(name=name)
    nodes = mat.node_tree.nodes
    nodes.clear()
    node_pbr = nodes.new(type="ShaderNodeBsdfPrincipled")
    node_out = nodes.new(type="ShaderNodeOutputMaterial")
    mat.node_tree.links.new(node_pbr.outputs["BSDF"], node_out.inputs["Surface"])
    
    set_principled_socket(node_pbr, ["Base Color"], base_color)
    set_principled_socket(node_pbr, ["Metallic"], metallic)
    set_principled_socket(node_pbr, ["Roughness"], roughness)
    set_principled_socket(node_pbr, ["Alpha"], alpha)
    
    if clearcoat > 0:
        set_principled_socket(node_pbr, ["Coat Weight", "Clearcoat"], clearcoat)
        set_principled_socket(node_pbr, ["Coat Roughness", "Clearcoat Roughness"], clearcoat_rough)
    if transmission > 0:
        set_principled_socket(node_pbr, ["Transmission Weight", "Transmission"], transmission)
        set_principled_socket(node_pbr, ["IOR"], ior)
    if emission:
        set_principled_socket(node_pbr, ["Emission Color", "Emission"], emission)
        set_principled_socket(node_pbr, ["Emission Strength"], emission_strength)
    return mat

def convert_volvo_to_master_glb(fbx_path, output_glb_path):
    log("==================================================")
    log("CONVERTING & REFINING VOLVO P1800 RESTOMOD ASSET")
    log("==================================================")
    
    bpy.ops.wm.read_factory_settings(use_empty=True)
    log(f"Importing FBX: {fbx_path}")
    bpy.ops.import_scene.fbx(filepath=fbx_path)
    
    mesh_objects = [o for o in bpy.data.objects if o.type == 'MESH']
    total_polys = sum(len(o.data.polygons) for o in mesh_objects)
    total_verts = sum(len(o.data.vertices) for o in mesh_objects)
    log(f"Imported {len(mesh_objects)} meshes with {total_polys:,} polygons and {total_verts:,} vertices.")
    
    # Standardize materials
    mat_paint = build_pbr_material("Car_Paint_Body", (0.05, 0.45, 0.35, 1.0), metallic=0.88, roughness=0.10, clearcoat=1.0, clearcoat_rough=0.02) # British Racing Green / Restomod Teal
    mat_chrome = build_pbr_material("Chrome_Trim", (0.95, 0.95, 0.95, 1.0), metallic=1.0, roughness=0.03, clearcoat=1.0)
    mat_rim = build_pbr_material("Wheel_Rim_Alloy", (0.85, 0.85, 0.88, 1.0), metallic=0.95, roughness=0.18, clearcoat=0.5)
    mat_tire = build_pbr_material("Tire_Rubber", (0.04, 0.04, 0.04, 1.0), metallic=0.0, roughness=0.88)
    mat_caliper = build_pbr_material("Brake_Caliper_Gloss", (0.85, 0.05, 0.05, 1.0), metallic=0.20, roughness=0.15, clearcoat=1.0)
    mat_glass = build_pbr_material("Glass_Dielectric", (0.88, 0.94, 1.0, 0.35), metallic=0.0, roughness=0.01, transmission=0.95, ior=1.52, alpha=0.35)
    mat_interior = build_pbr_material("Interior_Leather_Vinyl", (0.15, 0.12, 0.10, 1.0), metallic=0.05, roughness=0.75)
    
    for obj in mesh_objects:
        n = obj.name.lower()
        for poly in obj.data.polygons:
            poly.use_smooth = True
            
        # Re-assign materials according to name
        if "wheel" in n or "rim" in n:
            obj.name = f"Wheel_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_rim)
        elif "caliper" in n or "plane.00" in n:
            obj.name = f"Brake_Caliper_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_caliper)
        elif "chrome" in n:
            obj.name = f"Chrome_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_chrome)
        elif "glass" in n or "window" in n:
            obj.name = f"Glass_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_glass)
        elif "seat" in n or "top" in n or "interior" in n:
            obj.name = f"Interior_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_interior)
        elif "panel" in n or "basemesh" in n or "car" in n or "cube" in n:
            obj.name = f"Car_Paint_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_paint)
            
        # Add weighted normal modifier to ensure showroom reflections
        mod = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        mod.keep_sharp = True
        mod.weight = 100

    # Ground contact calibration
    min_z = min(corner.z for obj in mesh_objects for corner in [obj.matrix_world @ Vector(c) for c in obj.bound_box])
    log(f"Calibrating ground plane: dz = {-min_z:.4f}m")
    for obj in bpy.data.objects:
        if not obj.parent:
            obj.location.z -= min_z
            
    # Ensure single user for meshes before transform_apply
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    
    os.makedirs(os.path.dirname(output_glb_path), exist_ok=True)
    log(f"Exporting production GLB: {output_glb_path}")
    bpy.ops.export_scene.gltf(
        filepath=output_glb_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True
    )
    
    sz_mb = os.path.getsize(output_glb_path) / (1024 * 1024)
    log(f"[SUCCESS] Export completed! Size: {sz_mb:.2f} MB")

if __name__ == "__main__":
    src = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\extracted\volvo-p1800-restomod-widebody-edition\source\car5.fbx"
    out = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\volvo_p1800_restomod.glb"
    convert_volvo_to_master_glb(src, out)
