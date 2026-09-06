import os
import shutil
import json

with open(r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\assets\glb\master_asset_inventory.json", "r", encoding="utf-8") as f:
    inv = json.load(f)

proj_root = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
orig_base = os.path.join(proj_root, "assets", "glb", "original")
backup_base = os.path.join(proj_root, "assets", "glb", "backup")

copied_count = 0
for item in inv:
    src_file = os.path.join(proj_root, item["rel_path"])
    if not os.path.exists(src_file):
        continue
        
    cat = item["category"].lower().replace(" ", "_")
    fname = item["file"]
    
    # Destination in original
    dest_orig_dir = os.path.join(orig_base, cat)
    os.makedirs(dest_orig_dir, exist_ok=True)
    dest_orig = os.path.join(dest_orig_dir, fname)
    if not os.path.exists(dest_orig):
        shutil.copy2(src_file, dest_orig)
        
    # Destination in backup
    dest_backup_dir = os.path.join(backup_base, cat)
    os.makedirs(dest_backup_dir, exist_ok=True)
    dest_backup = os.path.join(dest_backup_dir, fname)
    if not os.path.exists(dest_backup):
        shutil.copy2(src_file, dest_backup)
        
    copied_count += 1

print(f"[BACKUP COMPLETED] Successfully backed up {copied_count} GLB assets into both assets/glb/original/ and assets/glb/backup/")
