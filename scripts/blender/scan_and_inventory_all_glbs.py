import os
import json
import struct

def parse_glb_header_and_json(filepath):
    try:
        with open(filepath, 'rb') as f:
            header = f.read(12)
            if len(header) < 12:
                return None
            magic, version, length = struct.unpack('<4sII', header)
            if magic != b'glTF':
                return None
            chunk_header = f.read(8)
            if len(chunk_header) < 8:
                return None
            chunk_len, chunk_type = struct.unpack('<I4s', chunk_header)
            if chunk_type != b'JSON':
                return None
            json_bytes = f.read(chunk_len)
            data = json.loads(json_bytes.decode('utf-8'))
            return data
    except Exception as e:
        return None

def analyze_all_project_glbs(root_dir, output_json, output_md):
    inventory = []
    
    # Target folders in public/models
    models_dir = os.path.join(root_dir, "public", "models")
    
    for dirpath, _, filenames in os.walk(models_dir):
        # Skip node_modules or temp
        if "node_modules" in dirpath or ".git" in dirpath or "dist" in dirpath:
            continue
            
        for fname in sorted(filenames):
            if fname.lower().endswith(".glb"):
                fpath = os.path.join(dirpath, fname)
                rel_path = os.path.relpath(fpath, root_dir)
                size_bytes = os.path.getsize(fpath)
                size_str = f"{size_bytes / 1024:.1f} KB" if size_bytes < 1024*1024 else f"{size_bytes / (1024*1024):.2f} MB"
                
                gltf_data = parse_glb_header_and_json(fpath)
                
                mesh_count = len(gltf_data.get("meshes", [])) if gltf_data else 0
                node_count = len(gltf_data.get("nodes", [])) if gltf_data else 0
                mat_count = len(gltf_data.get("materials", [])) if gltf_data else 0
                tex_count = len(gltf_data.get("textures", [])) if gltf_data else 0
                anim_count = len(gltf_data.get("animations", [])) if gltf_data else 0
                
                # Approximate polygon/triangle count from accessors
                poly_count = 0
                if gltf_data:
                    for mesh in gltf_data.get("meshes", []):
                        for prim in mesh.get("primitives", []):
                            if "indices" in prim:
                                idx_acc = gltf_data["accessors"][prim["indices"]]
                                poly_count += idx_acc.get("count", 0) // 3
                            elif "attributes" in prim and "POSITION" in prim["attributes"]:
                                pos_acc = gltf_data["accessors"][prim["attributes"]["POSITION"]]
                                poly_count += pos_acc.get("count", 0) // 3
                                
                # Classify type & purpose
                p_lower = rel_path.lower()
                category = "General"
                purpose = "Vehicle Component"
                quality = "Standard"
                priority = "B — moderate refinement"
                problems = "Needs weighted normals and material tuning"
                
                if "exterior" in p_lower:
                    category = "Exterior"
                    if "sports_car_bmw_i8" in p_lower:
                        purpose = "Flagship Hybrid Supercar Body"
                        quality = "Hero"
                        priority = "A — major rework required (Master Asset)"
                        problems = "Originally 1500+ fragmented pieces, now consolidated to 16 nodes"
                    elif "hypercar_apex_gt3" in p_lower or "vehicle_hypercar" in p_lower:
                        purpose = "Competition GT3 / Le Mans Hypercar Body"
                        quality = "Hero"
                        priority = "A — major rework required"
                        problems = "High mesh count, needs shutline definition and aero pivot setup"
                    elif "wheel" in p_lower:
                        purpose = "Wheel & Rim Assembly"
                        priority = "B — moderate refinement"
                        problems = "Check axle rotation pivot and brake caliper clearance"
                    elif "hood" in p_lower or "door" in p_lower:
                        purpose = "Vehicle Closure Panel"
                        priority = "B — moderate refinement"
                        problems = "Verify hinge kinematic pivot and shut lines"
                    elif "wing" in p_lower or "splitter" in p_lower or "diffuser" in p_lower:
                        purpose = "Aerodynamic Downforce Element"
                        priority = "B — moderate refinement"
                        problems = "Verify carbon fiber weave orientation and mounting brackets"
                elif "chassis" in p_lower:
                    category = "Chassis"
                    purpose = "Structural Frame & Monocoque"
                    priority = "B — moderate refinement"
                    problems = "Needs hardpoint alignment to master coordinates and FEA stress zones"
                elif "engine" in p_lower:
                    category = "Powertrain"
                    purpose = "Engine Block & Internal Assembly"
                    quality = "Hero"
                    priority = "A — major rework required"
                    problems = "Verify modular separation (block, heads, crankshaft, pistons, manifolds)"
                elif "forced_induction" in p_lower:
                    category = "Forced Induction"
                    purpose = "Turbo / Supercharger Assembly"
                    priority = "B — moderate refinement"
                    problems = "Add detailed compressor/turbine wheel geometry and oil lines"
                elif "interior" in p_lower:
                    category = "Interior"
                    purpose = "Cockpit, Seating & Dashboard"
                    priority = "B — moderate refinement"
                    problems = "Alcantara/leather texture mapping, steering yoke pivot calibration"
                elif "aero" in p_lower:
                    category = "Aero"
                    purpose = "Active Aerodynamics & Venturi Channels"
                    priority = "B — moderate refinement"
                    problems = "Check DRS actuator pivots and diffuser strakes"
                elif "extracted" in p_lower:
                    category = "Source Archive"
                    purpose = "Raw Extracted CAD/Mesh Model"
                    quality = "Raw Source"
                    priority = "C — reference only"
                    problems = "Unprocessed source asset"
                    
                entry = {
                    "file": fname,
                    "rel_path": rel_path.replace("\\", "/"),
                    "category": category,
                    "purpose": purpose,
                    "mesh_count": mesh_count,
                    "node_count": node_count,
                    "material_count": mat_count,
                    "texture_count": tex_count,
                    "polygon_count": poly_count,
                    "animation_count": anim_count,
                    "size_str": size_str,
                    "size_bytes": size_bytes,
                    "current_quality": quality,
                    "problems": problems,
                    "priority": priority
                }
                inventory.append(entry)
                
    # Save JSON
    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2)
        
    print(f"[INVENTORY SCAN COMPLETED] Found {len(inventory)} GLB assets.")
    return inventory

if __name__ == "__main__":
    proj_root = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
    out_json = os.path.join(proj_root, "assets", "glb", "master_asset_inventory.json")
    out_md = os.path.join(proj_root, "assets", "glb", "master_asset_inventory.md")
    analyze_all_project_glbs(proj_root, out_json, out_md)
