import bpy
import os
import math
from mathutils import Vector

def log(msg):
    print(f"[REFERENCE_FLEET] {msg}")

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

def get_scene_bounds(mesh_objects):
    if not mesh_objects:
        return Vector((0,0,0)), Vector((0,0,0)), Vector((0,0,0))
    all_corners = [obj.matrix_world @ Vector(c) for obj in mesh_objects for c in obj.bound_box]
    min_c = Vector((min(c.x for c in all_corners), min(c.y for c in all_corners), min(c.z for c in all_corners)))
    max_c = Vector((max(c.x for c in all_corners), max(c.y for c in all_corners), max(c.z for c in all_corners)))
    dims = max_c - min_c
    return min_c, max_c, dims

def export_active_scene(out_path):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    log(f"Exporting GLB: {out_path}")
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True
    )
    sz_mb = os.path.getsize(out_path) / (1024 * 1024)
    log(f"[SUCCESS] Exported {out_path} ({sz_mb:.2f} MB)")

def process_nissan_silvia(fbx_path, out_glb_path):
    log("==================================================")
    log("PROCESSING NISSAN SILVIA S15 ROCKET BUNNY")
    log("==================================================")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=fbx_path)
    
    mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
    log(f"Imported {len(mesh_objs)} meshes, {sum(len(o.data.polygons) for o in mesh_objs):,} polygons.")
    
    # Scale correction: model was 0.0454m -> scale by 100 to make length 4.54m
    for obj in bpy.data.objects:
        if not obj.parent:
            obj.scale *= 100.0
            
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    
    # Standardize materials
    mat_paint = build_pbr_material("Car_Paint_Body", (0.85, 0.05, 0.20, 1.0), metallic=0.90, roughness=0.10, clearcoat=1.0) # Candy Apple Red
    mat_carbon = build_pbr_material("Carbon_Fiber", (0.04, 0.04, 0.05, 1.0), metallic=0.60, roughness=0.18, clearcoat=1.0)
    mat_rim = build_pbr_material("Wheel_Rim_Bronze", (0.35, 0.22, 0.12, 1.0), metallic=0.92, roughness=0.20, clearcoat=0.6) # Volk TE37 Bronze
    mat_tire = build_pbr_material("Tire_Rubber", (0.04, 0.04, 0.04, 1.0), metallic=0.0, roughness=0.88)
    mat_caliper = build_pbr_material("Brake_Caliper_Gloss", (0.95, 0.80, 0.05, 1.0), metallic=0.20, roughness=0.12, clearcoat=1.0) # Brembo Gold
    mat_glass = build_pbr_material("Glass_Dielectric", (0.9, 0.95, 1.0, 0.4), metallic=0.0, roughness=0.01, transmission=0.92, ior=1.52, alpha=0.4)
    mat_interior = build_pbr_material("Interior_Alcantara", (0.08, 0.08, 0.10, 1.0), metallic=0.05, roughness=0.85)
    mat_engine = build_pbr_material("Engine_SR20DET_Metal", (0.50, 0.50, 0.52, 1.0), metallic=0.85, roughness=0.30)
    
    for obj in mesh_objs:
        n = obj.name.lower()
        for poly in obj.data.polygons:
            poly.use_smooth = True
            
        if "wheel" in n or "rim" in n or "off1" in n or "off2" in n:
            obj.name = f"Wheel_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_rim)
        elif "tire" in n or "tyre" in n:
            obj.name = f"Tire_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_tire)
        elif "caliper" in n:
            obj.name = f"Brake_Caliper_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_caliper)
        elif "disc" in n or "rotor" in n or "brakedisc" in n:
            obj.name = f"Brake_Rotor_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(build_pbr_material("Brake_Rotor_Steel", (0.6, 0.6, 0.6, 1.0), metallic=0.9, roughness=0.35))
        elif "wing" in n or "spoiler" in n or "splitter" in n or "diffuser" in n or "canard" in n or "kit1_coloured" in n:
            obj.name = f"Carbon_Aero_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_carbon)
        elif "glass" in n or "window" in n:
            obj.name = f"Glass_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_glass)
        elif "interior" in n or "cage" in n or "seat" in n:
            obj.name = f"Interior_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_interior)
        elif "engine" in n:
            obj.name = f"Engine_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_engine)
        elif "kit1_paint" in n or "body" in n or "door" in n or "hood" in n or "fender" in n or "car" in n:
            obj.name = f"Car_Paint_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_paint)
            
        mod = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        mod.keep_sharp = True
        mod.weight = 100

    min_c, max_c, dims = get_scene_bounds(mesh_objs)
    log(f"Nissan Silvia scaled dimensions: {dims.x:.2f} x {dims.y:.2f} x {dims.z:.2f} m. Min Z: {min_c.z:.4f}m")
    
    # Ground contact
    for obj in bpy.data.objects:
        if not obj.parent:
            obj.location.z -= min_c.z
            
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    
    export_active_scene(out_glb_path)

def process_mercedes_gls(blend_path, out_glb_path):
    log("==================================================")
    log("PROCESSING MERCEDES-BENZ GLS 580")
    log("==================================================")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.wm.open_mainfile(filepath=blend_path)
    
    # Delete studio backdrop cylinders
    to_delete = [o for o in bpy.data.objects if "cylinder" in o.name.lower()]
    for o in to_delete:
        bpy.data.objects.remove(o, do_unlink=True)
    log(f"Removed {len(to_delete)} studio background objects.")
    
    mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
    log(f"Remaining car meshes: {len(mesh_objs)}, Polygons: {sum(len(o.data.polygons) for o in mesh_objs):,}")
    
    min_c, max_c, dims = get_scene_bounds(mesh_objs)
    log(f"Raw GLS 580 bounds: {dims.x:.2f} x {dims.y:.2f} x {dims.z:.2f}m")
    
    # Target real-world GLS dimensions: length ~5.21m, width ~2.03m, height ~1.82m
    # Find dominant length axis
    max_dim = max(dims.x, dims.y, dims.z)
    scale_factor = 5.21 / max_dim
    log(f"Rescaling GLS 580 with factor {scale_factor:.5f}")
    
    for obj in bpy.data.objects:
        if not obj.parent:
            obj.scale *= scale_factor
            
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    
    min_c, max_c, dims = get_scene_bounds(mesh_objs)
    # Ground contact
    for obj in bpy.data.objects:
        if not obj.parent:
            obj.location.z -= min_c.z
            
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    
    # Add weighted normals to all meshes
    for obj in mesh_objs:
        for p in obj.data.polygons:
            p.use_smooth = True
        mod = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        mod.keep_sharp = True
        mod.weight = 100
        
    export_active_scene(out_glb_path)

def process_dodge_challenger(blend_path, out_glb_path):
    log("==================================================")
    log("PROCESSING DODGE CHALLENGER SRT")
    log("==================================================")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.wm.open_mainfile(filepath=blend_path)
    
    mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
    log(f"Challenger meshes: {len(mesh_objs)}, Polygons: {sum(len(o.data.polygons) for o in mesh_objs):,}")
    
    # Apply modifiers to bake subdivisions and solidify
    bpy.ops.object.select_all(action='DESELECT')
    for obj in mesh_objs:
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        # Apply modifiers
        for mod in list(obj.modifiers):
            try:
                bpy.ops.object.modifier_apply(modifier=mod.name)
            except Exception as e:
                pass
        obj.select_set(False)
        
    min_c, max_c, dims = get_scene_bounds(mesh_objs)
    log(f"Raw Challenger bounds: {dims.x:.2f} x {dims.y:.2f} x {dims.z:.2f}m")
    
    # Target real-world Challenger dimensions: length ~5.03m, width ~1.92m, height ~1.46m
    max_dim = max(dims.x, dims.y, dims.z)
    scale_factor = 5.03 / max_dim
    log(f"Rescaling Challenger with factor {scale_factor:.5f}")
    
    for obj in bpy.data.objects:
        if not obj.parent:
            obj.scale *= scale_factor
            
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    
    min_c, max_c, dims = get_scene_bounds(mesh_objs)
    # Ground contact
    for obj in bpy.data.objects:
        if not obj.parent:
            obj.location.z -= min_c.z
            
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    
    # Naming and weighted normals
    mat_paint = build_pbr_material("Car_Paint_Body", (0.35, 0.05, 0.45, 1.0), metallic=0.88, roughness=0.12, clearcoat=1.0) # Plum Crazy Purple
    mat_rim = build_pbr_material("Wheel_Rim_Alloy", (0.10, 0.10, 0.12, 1.0), metallic=0.90, roughness=0.25) # Satin Carbon Black Rims
    
    for obj in mesh_objs:
        n = obj.name.lower()
        for p in obj.data.polygons:
            p.use_smooth = True
        if "circle" in n or "wheel" in n or "rim" in n:
            obj.name = f"Wheel_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_rim)
        elif "plane" in n or "body" in n:
            obj.name = f"Car_Paint_{obj.name}"
            obj.data.materials.clear()
            obj.data.materials.append(mat_paint)
            
        mod = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        mod.keep_sharp = True
        mod.weight = 100
        
    export_active_scene(out_glb_path)

if __name__ == "__main__":
    silvia_fbx = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\extracted\2015-rocket-bunny-s15-nissan-silvia\source\FINAL_MODEL_RB\FINAL_MODEL_02.fbx"
    silvia_out = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\nissan_silvia_s15_rocket_bunny.glb"
    if os.path.exists(silvia_fbx):
        process_nissan_silvia(silvia_fbx, silvia_out)
        
    gls_blend = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\extracted\32-mercedes-benz-gls-580-2020\uploads_files_2787791_Mercedes+Benz+GLS+580.blend"
    gls_out = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\mercedes_gls_580.glb"
    if os.path.exists(gls_blend):
        process_mercedes_gls(gls_blend, gls_out)
        
    challenger_blend = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\extracted\89-challenger\Challenger.blend"
    challenger_out = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\dodge_challenger_srt.glb"
    if os.path.exists(challenger_blend):
        process_dodge_challenger(challenger_blend, challenger_out)
