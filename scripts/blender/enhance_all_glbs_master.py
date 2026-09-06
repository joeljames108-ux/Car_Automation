import bpy
import os
import sys
import glob
import math
import json
import time
import shutil
from mathutils import Vector

def log(msg):
    print(f"[ENHANCE_MASTER] {msg}", flush=True)

# Files already refined as ultra-high-density master models that do not need re-processing
ALREADY_REFINED = {
    "volvo_p1800_restomod.glb",
    "sports_car_bmw_i8.glb",
    "nissan_silvia_s15_rocket_bunny.glb",
    "mercedes_gls_580.glb",
    "dodge_challenger_srt.glb",
    "wheel_high_mesh_forged.glb",
    "wheel_apex_forged.glb",
    "gt3_race_chassis_01.glb",
    "v12_racing_engine.glb",
    "brakes.glb",
    "suspension_front.glb",
    "suspension_rear.glb",
    "wheels.glb",
    "wheel_hub_details.glb",
    "sports_car_bmw_i8_raw.glb"
}

def is_already_refined(filename):
    return os.path.basename(filename) in ALREADY_REFINED

def consolidate_scene_meshes():
    mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
    if len(mesh_objs) <= 25:
        return mesh_objs
    
    log(f"Consolidating {len(mesh_objs)} fragmented meshes by material...")
    by_mat = {}
    for obj in mesh_objs:
        mat_name = obj.data.materials[0].name if (obj.data.materials and obj.data.materials[0]) else "Default"
        by_mat.setdefault(mat_name, []).append(obj)
        
    consolidated = []
    for mat_name, objs in by_mat.items():
        if len(objs) == 1:
            consolidated.append(objs[0])
            continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        try:
            bpy.ops.object.join()
            consolidated.append(objs[0])
        except Exception:
            consolidated.extend(objs)
            
    log(f"Consolidated into {len(consolidated)} optimized semantic meshes.")
    return consolidated

def enhance_single_glb(file_path):
    fn = os.path.basename(file_path)
    fn_lower = fn.lower()
    
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    temp_read = file_path + ".read.glb"
    try:
        shutil.copy2(file_path, temp_read)
        bpy.ops.import_scene.gltf(filepath=temp_read)
    except Exception as e:
        if os.path.exists(temp_read):
            try:
                os.remove(temp_read)
            except Exception:
                pass
        return {"file": file_path, "status": "error", "error": f"import_failed: {e}"}
        
    mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
    if not mesh_objs:
        if os.path.exists(temp_read):
            try:
                os.remove(temp_read)
            except Exception:
                pass
        return {"file": file_path, "status": "skipped", "reason": "no_meshes"}
        
    initial_polys = sum(len(o.data.polygons) for o in mesh_objs)
    initial_verts = sum(len(o.data.vertices) for o in mesh_objs)
    initial_size_kb = os.path.getsize(file_path) / 1024
    
    # Ensure single user for meshes
    bpy.ops.object.select_all(action='SELECT')
    try:
        bpy.ops.object.make_single_user(type='ALL', object=True, obdata=True, material=False, animation=False)
    except Exception:
        pass

    # Consolidate if model is fragmented
    mesh_objs = consolidate_scene_meshes()

    is_panel = any(k in fn_lower for k in [
        "hood", "door", "fender", "bumper", "roof", "quarter", "splitter", 
        "diffuser", "wing", "skirt", "canard", "floor", "tub", "shell", "body",
        "spoiler", "mirror", "louver", "duct", "pillar", "hatch", "trunk"
    ])
    
    is_interior = any(k in fn_lower for k in [
        "interior", "seat", "steering", "dash", "cockpit", "pedal", "console", "cards"
    ])

    for obj in mesh_objs:
        if not obj.data or len(obj.data.polygons) == 0 or len(obj.data.vertices) < 3:
            continue
            
        poly_count = len(obj.data.polygons)
        for p in obj.data.polygons:
            p.use_smooth = True
            
        # 1. Solidify thin panels to give realistic physical sheet-metal depth (2mm)
        if is_panel and poly_count < 10000:
            dims = obj.dimensions
            min_dim = min(dims.x, dims.y, dims.z)
            if min_dim < 0.008:
                sol = obj.modifiers.new(name="Solidify", type='SOLIDIFY')
                sol.thickness = 0.002
                sol.offset = -1.0
                
        # 2. Bevel modifier for character creases and light-catching highlights
        if poly_count < 20000:
            bev = obj.modifiers.new(name="Bevel", type='BEVEL')
            bev.width = 0.0025 if not is_interior else 0.004
            bev.segments = 2
            bev.limit_method = 'ANGLE'
            bev.angle_limit = math.radians(35)
            
        # 3. Subdivision surface for smooth curvature only on low-poly meshes (< 3,000 polys)
        if poly_count < 3000:
            sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
            sub.levels = 1
            sub.render_levels = 1

        # 4. Weighted Normal modifier across all meshes for showroom reflections
        wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        wn.keep_sharp = True
        wn.weight = 100

    # Export directly to file_path since file_path was never memory-mapped by Blender
    try:
        bpy.ops.export_scene.gltf(
            filepath=file_path,
            export_format='GLB',
            use_selection=False,
            export_apply=True
        )
    except Exception as e:
        return {"file": file_path, "status": "export_error", "error": f"export_failed: {e}"}
    finally:
        if os.path.exists(temp_read):
            try:
                os.remove(temp_read)
            except Exception:
                pass

    final_size_kb = os.path.getsize(file_path) / 1024
    mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
    final_polys = sum(len(o.data.polygons) for o in mesh_objs)
    final_verts = sum(len(o.data.vertices) for o in mesh_objs)
    
    return {
        "file": file_path,
        "status": "success",
        "initial_polys": initial_polys,
        "final_polys": final_polys,
        "initial_verts": initial_verts,
        "final_verts": final_verts,
        "initial_size_kb": round(initial_size_kb, 1),
        "final_size_kb": round(final_size_kb, 1),
        "poly_delta": final_polys - initial_polys
    }

def run_master_enhancement(batch_filter=None):
    ROOT = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models"
    out_report = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\assets\glb\all_glbs_enhancement_audit.json"
    
    log("==========================================================")
    log("STARTING PROJECT-WIDE BLENDER GLB MESH ENHANCEMENT ENGINE")
    log("==========================================================")
    
    # Load existing audit records to avoid duplicate work
    audit_map = {}
    if os.path.exists(out_report):
        try:
            with open(out_report, "r") as fp:
                existing_list = json.load(fp)
                for item in existing_list:
                    if "rel_path" in item:
                        audit_map[item["rel_path"]] = item
            log(f"Loaded {len(audit_map)} existing enhancement audit records.")
        except Exception as e:
            log(f"Warning: could not load existing audit ({e})")
    
    all_targets = []
    for root, dirs, files in os.walk(ROOT):
        # Strictly ignore backup and original directories
        r_lower = root.lower()
        if "backup" in r_lower or "original" in r_lower or "extracted" in r_lower:
            continue
        for f in files:
            if f.lower().endswith(".glb") and not is_already_refined(f):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, ROOT)
                all_targets.append((full_path, rel_path))
                
    log(f"Discovered {len(all_targets)} active GLBs to evaluate.")
    
    if batch_filter:
        all_targets = [t for t in all_targets if batch_filter.lower() in t[1].lower()]
        log(f"Filtered for '{batch_filter}': {len(all_targets)} targets.")

    t_start = time.time()
    
    for idx, (full_p, rel_p) in enumerate(all_targets):
        # Check if already successfully enhanced today
        mtime = os.path.getmtime(full_p)
        # If mtime is after 22:00 on 2026-09-04 and already in audit with success, skip
        if rel_p in audit_map and audit_map[rel_p].get("status") == "success":
            log(f"[{idx+1}/{len(all_targets)}] Already enhanced in audit: {rel_p}")
            continue
            
        log(f"[{idx+1}/{len(all_targets)}] Processing: {rel_p}...")
        res = enhance_single_glb(full_p)
        res["rel_path"] = rel_p
        audit_map[rel_p] = res
        
        if res.get("status") == "success":
            log(f"  -> Polys: {res['initial_polys']:,} -> {res['final_polys']:,} (+{res['poly_delta']:,}) | Size: {res['initial_size_kb']}KB -> {res['final_size_kb']}KB")
        else:
            log(f"  -> Status: {res.get('status')} ({res.get('error', res.get('reason'))})")
            
        # Progressive save every 5 files
        if (idx + 1) % 5 == 0:
            os.makedirs(os.path.dirname(out_report), exist_ok=True)
            with open(out_report, "w") as fp:
                json.dump(list(audit_map.values()), fp, indent=2)

    elapsed = time.time() - t_start
    log(f"\nCompleted enhancement pass in {elapsed:.1f} seconds.")
    
    # Final save of consolidated audit
    os.makedirs(os.path.dirname(out_report), exist_ok=True)
    with open(out_report, "w") as fp:
        json.dump(list(audit_map.values()), fp, indent=2)
    log(f"Saved consolidated enhancement audit report ({len(audit_map)} models) to {out_report}")

if __name__ == "__main__":
    filter_env = os.environ.get("BLENDER_ENHANCE_BATCH")
    filter_arg = filter_env if filter_env else (sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith(".py") and not sys.argv[-1].startswith("-") else None)
    run_master_enhancement(filter_arg)
