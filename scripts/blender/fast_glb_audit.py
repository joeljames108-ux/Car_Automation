import os
import json
import struct

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")

def parse_glb(filepath):
    try:
        with open(filepath, "rb") as f:
            magic = f.read(4)
            if magic != b'glTF':
                return None
            version, length = struct.unpack("<II", f.read(8))
            chunk_len, chunk_type = struct.unpack("<II", f.read(8))
            if chunk_type != 0x4E4F534A: # JSON
                return None
            json_bytes = f.read(chunk_len)
            data = json.loads(json_bytes.decode('utf-8'))
            
            total_vertices = 0
            total_indices = 0
            accessors = data.get("accessors", [])
            meshes = data.get("meshes", [])
            materials = [m.get("name", "unnamed") for m in data.get("materials", [])]
            
            for m in meshes:
                for prim in m.get("primitives", []):
                    pos_acc_idx = prim.get("attributes", {}).get("POSITION")
                    if pos_acc_idx is not None and pos_acc_idx < len(accessors):
                        total_vertices += accessors[pos_acc_idx].get("count", 0)
                    idx_acc_idx = prim.get("indices")
                    if idx_acc_idx is not None and idx_acc_idx < len(accessors):
                        total_indices += accessors[idx_acc_idx].get("count", 0)
                        
            approx_polys = total_indices // 3 if total_indices > 0 else total_vertices // 3
            return {
                "file": filepath,
                "size_kb": os.path.getsize(filepath) / 1024,
                "meshes": len(meshes),
                "materials": materials,
                "vertices": total_vertices,
                "polys": approx_polys
            }
    except Exception as e:
        return {"file": filepath, "error": str(e)}

def main():
    print("RECURSIVE GLB AUDIT ACROSS ALL DIRECTORIES:")
    print("=" * 70)
    
    all_glbs = []
    for root, dirs, files in os.walk(PUBLIC_DIR):
        if "backup" in root.lower() or "original" in root.lower():
            continue
        for f in files:
            if f.lower().endswith(".glb"):
                all_glbs.append(os.path.join(root, f))
                
    by_folder = {}
    low_poly_catalog = []
    
    total_vertices_all = 0
    
    for g in all_glbs:
        folder = os.path.relpath(os.path.dirname(g), PROJECT_ROOT)
        res = parse_glb(g)
        if res and "vertices" in res:
            if folder not in by_folder:
                by_folder[folder] = []
            by_folder[folder].append(res)
            total_vertices_all += res["vertices"]
            if res["vertices"] < 1000:
                low_poly_catalog.append((folder, os.path.basename(g), res["vertices"], res["size_kb"]))
                
    for folder, res_list in sorted(by_folder.items()):
        avg_v = sum(r["vertices"] for r in res_list) // len(res_list)
        min_v = min(r["vertices"] for r in res_list)
        max_v = max(r["vertices"] for r in res_list)
        print(f"{folder:<46} | {len(res_list):>3} files | Avg: {avg_v:>7,} | Min: {min_v:>6,} | Max: {max_v:>8,}")
        
    print("=" * 70)
    print(f"TOTAL SCANNED GLB FILES: {len(all_glbs)} | TOTAL VERTICES: {total_vertices_all:,}")
    print(f"\nALL MODELS WITH < 1,000 VERTICES ({len(low_poly_catalog)} found):")
    for folder, fn, v, s in sorted(low_poly_catalog, key=lambda x: x[2]):
        print(f"  [{v:>5} verts, {s:>6.1f} KB] {folder}/{fn}")

if __name__ == "__main__":
    main()
