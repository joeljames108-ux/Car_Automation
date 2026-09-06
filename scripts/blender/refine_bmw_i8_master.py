import bpy
import bmesh
import math
import os
from mathutils import Vector

def log(msg):
    print(f"[EXTERIOR_MASTER_REFINEMENT] {msg}")

# ----------------------------------------------------------------------------
# 1. PBR MATERIAL FACTORY (AUTOMOTIVE GRADE)
# ----------------------------------------------------------------------------
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

def create_master_material_suite():
    return {
        "paint_main": build_pbr_material("Car_Paint_Body_Master", (0.00, 0.25, 0.80, 1.0), metallic=0.90, roughness=0.10, clearcoat=1.0, clearcoat_rough=0.02),
        "paint_accent": build_pbr_material("Car_Paint_Accent_Gloss", (0.04, 0.05, 0.06, 1.0), metallic=0.80, roughness=0.12, clearcoat=1.0, clearcoat_rough=0.02),
        "carbon": build_pbr_material("Carbon_Fiber_Trim", (0.06, 0.07, 0.08, 1.0), metallic=0.15, roughness=0.16, clearcoat=1.0, clearcoat_rough=0.03),
        "glass_clear": build_pbr_material("Glass_Windshield_Clear", (0.88, 0.94, 1.0, 0.35), metallic=0.0, roughness=0.01, transmission=0.95, ior=1.52, alpha=0.35),
        "glass_taillight": build_pbr_material("Glass_Taillight_Ruby", (0.75, 0.02, 0.02, 0.80), metallic=0.0, roughness=0.03, transmission=0.85, ior=1.54, alpha=0.80),
        "light_headlight": build_pbr_material("Light_Headlight_LED", (1.0, 1.0, 1.0, 1.0), metallic=0.1, roughness=0.05, emission=(1.0, 1.0, 1.0, 1.0), emission_strength=18.0),
        "light_taillight": build_pbr_material("Light_Taillight_OLED", (1.0, 0.05, 0.08, 1.0), metallic=0.1, roughness=0.08, emission=(1.0, 0.02, 0.05, 1.0), emission_strength=15.0),
        "rim_alloy": build_pbr_material("Wheel_Rim_Alloy", (0.75, 0.77, 0.80, 1.0), metallic=0.95, roughness=0.20, clearcoat=0.4),
        "brake_caliper": build_pbr_material("Brake_Caliper_Gloss", (0.85, 0.05, 0.05, 1.0), metallic=0.25, roughness=0.15, clearcoat=1.0, clearcoat_rough=0.02),
        "grille_mesh": build_pbr_material("Grille_Intake_Mesh", (0.05, 0.05, 0.06, 1.0), metallic=0.80, roughness=0.35),
        "interior": build_pbr_material("Interior_Cockpit_Trim", (0.12, 0.12, 0.14, 1.0), metallic=0.05, roughness=0.92),
        "chrome": build_pbr_material("Chrome_Trim_Badges", (0.95, 0.95, 0.95, 1.0), metallic=1.0, roughness=0.03, clearcoat=1.0)
    }

# ----------------------------------------------------------------------------
# 2. MESH JOINING & OPTIMIZATION HELPERS
# ----------------------------------------------------------------------------
def join_objects_into(objects_to_join, new_name, target_material=None):
    if not objects_to_join:
        return None
        
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects_to_join:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects_to_join[0]
    
    # Bake transforms before join
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.join()
    
    joined = bpy.context.active_object
    joined.name = new_name
    joined.data.name = f"Mesh_{new_name}"
    
    # Ensure smooth shading
    for poly in joined.data.polygons:
        poly.use_smooth = True
        
    if target_material:
        joined.data.materials.clear()
        joined.data.materials.append(target_material)
        
    return joined

def apply_automotive_weighted_normals(obj):
    if not obj or obj.type != 'MESH':
        return
    mod = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    mod.keep_sharp = True
    mod.weight = 100

def split_mesh_by_y(obj, pos_name, neg_name, pos_mat=None, neg_mat=None):
    """Splits a single mesh object into two by world Y plane (Y >= 0 and Y < 0)"""
    if not obj or obj.type != 'MESH':
        return None, None
        
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    # Duplicate for negative side
    bpy.ops.object.duplicate()
    neg_obj = bpy.context.active_object
    pos_obj = obj
    
    # Cut pos_obj: delete faces with Y < 0
    bm_pos = bmesh.new()
    bm_pos.from_mesh(pos_obj.data)
    faces_to_remove = [f for f in bm_pos.faces if all(v.co.y < 0 for v in f.verts)]
    bmesh.ops.delete(bm_pos, geom=faces_to_remove, context='FACES')
    bm_pos.to_mesh(pos_obj.data)
    bm_pos.free()
    pos_obj.name = pos_name
    if pos_mat:
        pos_obj.data.materials.clear()
        pos_obj.data.materials.append(pos_mat)
        
    # Cut neg_obj: delete faces with Y >= 0
    bm_neg = bmesh.new()
    bm_neg.from_mesh(neg_obj.data)
    faces_to_remove = [f for f in bm_neg.faces if all(v.co.y >= 0 for v in f.verts)]
    bmesh.ops.delete(bm_neg, geom=faces_to_remove, context='FACES')
    bm_neg.to_mesh(neg_obj.data)
    bm_neg.free()
    neg_obj.name = neg_name
    if neg_mat:
        neg_obj.data.materials.clear()
        neg_obj.data.materials.append(neg_mat)
        
    return pos_obj, neg_obj

# ----------------------------------------------------------------------------
# 3. MASTER REFINEMENT PIPELINE
# ----------------------------------------------------------------------------
def run_refinement_pipeline(source_glb_path, output_glb_path):
    log("=================================================================")
    log(" STARTING MASTER CAR EXTERIOR REFINEMENT PIPELINE (BLENDER 5.2)")
    log("=================================================================")
    
    bpy.ops.wm.read_factory_settings(use_empty=True)
    log(f"Importing source asset: {source_glb_path}")
    bpy.ops.import_scene.gltf(filepath=source_glb_path)
    
    mats = create_master_material_suite()
    
    buckets = {
        "paint_main": [],
        "paint_accent": [],
        "carbon": [],
        "windows": [],
        "taillight_glass": [],
        "lights": [],
        "grilles": [],
        "interior": [],
        "engine": [],
        "badges": [],
        "calipers": [],
        "wheel_fl": [],
        "wheel_fr": [],
        "wheel_rl": [],
        "wheel_rr": [],
    }
    
    mesh_objects = [o for o in bpy.data.objects if o.type == 'MESH']
    log(f"Categorizing {len(mesh_objects)} mesh objects...")
    
    for obj in mesh_objects:
        name_lower = obj.name.lower()
        mat_names = [s.material.name.lower() for s in obj.material_slots if s.material]
        mat_str = " ".join(mat_names)
        
        # Determine wheel placement via parent hierarchy
        is_wheel = "wheel" in name_lower or "wheel" in mat_str
        if is_wheel:
            wheel_assigned = False
            p = obj.parent
            while p:
                p_name = p.name.lower()
                if "front l" in p_name:
                    buckets["wheel_fl"].append(obj)
                    wheel_assigned = True
                    break
                elif "front r" in p_name:
                    buckets["wheel_fr"].append(obj)
                    wheel_assigned = True
                    break
                elif "rear l" in p_name:
                    buckets["wheel_rl"].append(obj)
                    wheel_assigned = True
                    break
                elif "rear r" in p_name:
                    buckets["wheel_rr"].append(obj)
                    wheel_assigned = True
                    break
                p = p.parent
            if not wheel_assigned:
                buckets["wheel_fl"].append(obj)
            continue
            
        # Calipers
        if "calliper" in name_lower or "caliper" in name_lower or "calliper" in mat_str:
            buckets["calipers"].append(obj)
        # Carbon Fiber
        elif "carbon" in name_lower or "carbon" in mat_str:
            buckets["carbon"].append(obj)
        # Red Taillight Glass
        elif "red_glass" in mat_str:
            buckets["taillight_glass"].append(obj)
        # Clear Windows & Windshield
        elif "window" in name_lower or "glass" in name_lower or "window" in mat_str:
            buckets["windows"].append(obj)
        # Lighting Clusters
        elif "light" in name_lower or "light" in mat_str:
            buckets["lights"].append(obj)
        # Grilles & Intakes
        elif "grille" in name_lower or "grille" in mat_str:
            buckets["grilles"].append(obj)
        # Interior & Cockpit
        elif "interior" in name_lower or "seat" in name_lower or "interior" in mat_str:
            buckets["interior"].append(obj)
        # Engine Bay
        elif "engine" in name_lower or "engine" in mat_str:
            buckets["engine"].append(obj)
        # Badges & Plates
        elif "manufacturer" in name_lower or "plate" in name_lower or "badge" in name_lower or "badge" in mat_str:
            buckets["badges"].append(obj)
        # Accent Paint
        elif "blue" in mat_str or "coloured" in name_lower:
            buckets["paint_accent"].append(obj)
        # Main Body Paint
        else:
            buckets["paint_main"].append(obj)
            
    for k, v in buckets.items():
        log(f"  Bucket '{k}': {len(v)} meshes")
        
    root_empty = bpy.data.objects.new("Vehicle_Master_Root", None)
    bpy.context.scene.collection.objects.link(root_empty)
    
    refined_objects = []
    
    mappings = [
        ("paint_main", "Car_Paint_Main_Body", mats["paint_main"], True),
        ("paint_accent", "Car_Paint_Accents", mats["paint_accent"], True),
        ("carbon", "Carbon_Fiber_Trim", mats["carbon"], True),
        ("windows", "Glass_Windshield_Windows", mats["glass_clear"], False),
        ("taillight_glass", "Glass_Taillight_Red", mats["glass_taillight"], False),
        ("grilles", "Grille_Technical_Intakes", mats["grille_mesh"], True),
        ("interior", "Interior_Cockpit", mats["interior"], False),
        ("engine", "Powertrain_Engine_Bay", mats["paint_accent"], False),
        ("badges", "Chrome_Badges", mats["chrome"], False),
        ("calipers", "Brake_Calipers", mats["brake_caliper"], True),
    ]
    
    for bucket_key, node_name, material, apply_weighted in mappings:
        objs = buckets[bucket_key]
        if objs:
            joined = join_objects_into(objs, node_name, material)
            if joined:
                joined.parent = root_empty
                if apply_weighted:
                    apply_automotive_weighted_normals(joined)
                refined_objects.append(joined)
                log(f"  [CONSOLIDATED] {node_name} ({len(joined.data.vertices)} vertices)")

    # Separate lights into Front Projectors and Rear Taillights
    light_objs = buckets["lights"]
    if light_objs:
        joined_lights = join_objects_into(light_objs, "Temp_Lights_Combined")
        if joined_lights:
            front_light, rear_light = split_mesh_by_y(
                joined_lights,
                "Light_Headlight_Projectors",
                "Light_Taillight_OLED",
                mats["light_headlight"],
                mats["light_taillight"]
            )
            if front_light:
                front_light.parent = root_empty
                refined_objects.append(front_light)
                log(f"  [LIGHTING REFINED] Light_Headlight_Projectors ({len(front_light.data.vertices)} verts)")
            if rear_light:
                rear_light.parent = root_empty
                refined_objects.append(rear_light)
                log(f"  [LIGHTING REFINED] Light_Taillight_OLED ({len(rear_light.data.vertices)} verts)")

    # Process the 4 Wheels with calibrated origin pivots
    wheel_defs = [
        ("wheel_fl", "Wheel_Front_Left"),
        ("wheel_fr", "Wheel_Front_Right"),
        ("wheel_rl", "Wheel_Rear_Left"),
        ("wheel_rr", "Wheel_Rear_Right"),
    ]
    
    for wheel_bucket, wheel_name in wheel_defs:
        w_objs = buckets[wheel_bucket]
        if w_objs:
            w_joined = join_objects_into(w_objs, wheel_name, mats["rim_alloy"])
            if w_joined:
                bpy.ops.object.select_all(action='DESELECT')
                w_joined.select_set(True)
                bpy.context.view_layer.objects.active = w_joined
                bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
                
                w_joined.parent = root_empty
                apply_automotive_weighted_normals(w_joined)
                refined_objects.append(w_joined)
                log(f"  [CALIBRATED WHEEL] {wheel_name} ({len(w_joined.data.vertices)} verts) pivot at {w_joined.location}")

    # Remove all leftover non-refined objects
    for obj in list(bpy.data.objects):
        if obj != root_empty and obj not in refined_objects:
            bpy.data.objects.remove(obj, do_unlink=True)
            
    for mesh in list(bpy.data.meshes):
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
    for mat in list(bpy.data.materials):
        if mat.users == 0:
            bpy.data.materials.remove(mat)

    # ------------------------------------------------------------------------
    # GROUND PLANE HARDPOINT CALIBRATION & RE-CENTERING
    # ------------------------------------------------------------------------
    log("Calibrating ground-plane contact (Z = 0.000m)...")
    global_min_z = float('inf')
    global_min_x = float('inf')
    global_max_x = float('-inf')
    global_min_y = float('inf')
    global_max_y = float('-inf')
    
    for obj in refined_objects:
        for c in obj.bound_box:
            world_c = obj.matrix_world @ Vector(c)
            global_min_z = min(global_min_z, world_c.z)
            global_min_x = min(global_min_x, world_c.x)
            global_max_x = max(global_max_x, world_c.x)
            global_min_y = min(global_min_y, world_c.y)
            global_max_y = max(global_max_y, world_c.y)
            
    center_x = (global_min_x + global_max_x) / 2.0
    center_y = (global_min_y + global_max_y) / 2.0
    z_offset = -global_min_z
    
    log(f"Dimensions: Width={global_max_x - global_min_x:.3f}m, Length={global_max_y - global_min_y:.3f}m, Height={-global_min_z + max([obj.matrix_world @ Vector(c) for obj in refined_objects for c in obj.bound_box], key=lambda v: v.z).z:.3f}m")
    log(f"Applying ground offset dz={z_offset:.4f}m, dx={-center_x:.4f}m, dy={-center_y:.4f}m")
    
    root_empty.location = Vector((-center_x, -center_y, z_offset))
    bpy.ops.object.select_all(action='DESELECT')
    root_empty.select_set(True)
    for obj in refined_objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = root_empty
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    root_empty.location = Vector((0, 0, 0))

    # ------------------------------------------------------------------------
    # PRODUCTION GLB EXPORT
    # ------------------------------------------------------------------------
    log(f"Exporting master refined GLB to: {output_glb_path}")
    os.makedirs(os.path.dirname(output_glb_path), exist_ok=True)
    
    bpy.ops.export_scene.gltf(
        filepath=output_glb_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True
    )
    
    file_size_mb = os.path.getsize(output_glb_path) / (1024 * 1024)
    log(f"[SUCCESS] Export completed! File size: {file_size_mb:.2f} MB")
    log(f"Node count reduced from 241 down to {len(refined_objects)} clean, semantic automotive nodes.")
    log("=================================================================")

if __name__ == "__main__":
    source = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\sports_car_bmw_i8_raw.glb"
    output = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\sports_car_bmw_i8.glb"
    run_refinement_pipeline(source, output)
