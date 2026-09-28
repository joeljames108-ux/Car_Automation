import bpy
import bmesh
import os
import math
from mathutils import Vector

filepath = os.path.abspath("development/Upload_Astin_Martin.blend")
print("================================================================================")
print("ASTON MARTIN VALHALLA FORENSIC REVERSE-ENGINEERING DEEP DIVE")
print(f"Path: {filepath}")
print("================================================================================")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.open_mainfile(filepath=filepath)

mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
print(f"Total Objects: {len(bpy.data.objects)}, Total Mesh Objects: {len(mesh_objs)}")

# Filter out potential studio background or lights
valid_objs = [o for o in mesh_objs if o.dimensions.x < 25.0 and o.dimensions.y < 25.0 and "floor" not in o.name.lower()]

total_verts = sum(len(o.data.vertices) for o in valid_objs)
total_polys = sum(len(o.data.polygons) for o in valid_objs)
print(f"Total Active Vertices: {total_verts:,} | Total Active Polygons: {total_polys:,}")

# Find global bounding box
all_sample_pts = []
for o in valid_objs:
    mw = o.matrix_world
    verts = o.data.vertices
    step = max(1, len(verts) // 200)
    for idx in range(0, len(verts), step):
        all_sample_pts.append(mw @ verts[idx].co)

min_x, max_x = min(p.x for p in all_sample_pts), max(p.x for p in all_sample_pts)
min_y, max_y = min(p.y for p in all_sample_pts), max(p.y for p in all_sample_pts)
min_z, max_z = min(p.z for p in all_sample_pts), max(p.z for p in all_sample_pts)

length = max_y - min_y
width = max_x - min_x
height = max_z - min_z

print(f"\n1. Overall Dimensions:")
print(f"   Length: {length:.3f}m | Width: {width:.3f}m | Height: {height:.3f}m")
print(f"   X: [{min_x:.3f}, {max_x:.3f}]")
print(f"   Y: [{min_y:.3f}, {max_y:.3f}]")
print(f"   Z: [{min_z:.3f}, {max_z:.3f}]")

# Sort objects by polygon complexity
valid_objs.sort(key=lambda o: len(o.data.polygons), reverse=True)
print("\n2. Top 25 Major Components & Hierarchy:")
for idx, o in enumerate(valid_objs[:25], 1):
    mats = [m.name for m in o.data.materials if m]
    mods = [f"{m.name}({m.type})" for m in o.modifiers]
    print(f"   {idx:2d}. {o.name:<25} | {len(o.data.polygons):>6,d} polys | dim: {o.dimensions.x:.2f}x{o.dimensions.y:.2f}x{o.dimensions.z:.2f}m | mats: {mats[:2]}")
    if mods:
        print(f"       Mods: {mods}")

# Material Analysis
print(f"\n3. PBR Material Stack ({len(bpy.data.materials)} Materials Found):")
unique_mats = list(bpy.data.materials)
unique_mats.sort(key=lambda m: sum(len(o.data.polygons) for o in valid_objs if m.name in [mat.name for mat in o.data.materials if mat]), reverse=True)

for m in unique_mats[:12]:
    bsdf = m.node_tree.nodes.get("Principled BSDF") if m.node_tree else None
    if bsdf:
        col = bsdf.inputs.get("Base Color")
        met = bsdf.inputs.get("Metallic")
        rough = bsdf.inputs.get("Roughness")
        c_val = [round(x, 3) for x in col.default_value[:3]] if col and hasattr(col, 'default_value') and len(col.default_value) >= 3 else "N/A"
        m_val = round(met.default_value, 2) if met and hasattr(met, 'default_value') else "N/A"
        r_val = round(rough.default_value, 2) if rough and hasattr(rough, 'default_value') else "N/A"
        
        # Check Clearcoat / Coat
        coat_val = 0.0
        if "Coat Weight" in bsdf.inputs and hasattr(bsdf.inputs["Coat Weight"], 'default_value'):
            coat_val = round(bsdf.inputs["Coat Weight"].default_value, 2)
        elif "Clearcoat" in bsdf.inputs and hasattr(bsdf.inputs["Clearcoat"], 'default_value'):
            coat_val = round(bsdf.inputs["Clearcoat"].default_value, 2)

        # Check Transmission
        trans_val = 0.0
        if "Transmission Weight" in bsdf.inputs and hasattr(bsdf.inputs["Transmission Weight"], 'default_value'):
            trans_val = round(bsdf.inputs["Transmission Weight"].default_value, 2)
        elif "Transmission" in bsdf.inputs and hasattr(bsdf.inputs["Transmission"], 'default_value'):
            trans_val = round(bsdf.inputs["Transmission"].default_value, 2)

        print(f"   * {m.name:<25}: RGB={c_val} | Met={m_val} | Rough={r_val} | Coat={coat_val} | Trans={trans_val}")
    else:
        print(f"   * {m.name:<25}: (Non-principled or node tree empty)")

# Longitudinal Centerline & Fender Peak Profiling
print("\n4. Longitudinal Silhouette Profile Z(y) & Fender Crest Heights:")
y_bins = 24
y_step = length / y_bins
print(f"   {'Station Y (m)':<15} | {'Centerline Z':<15} | {'Fender Peak Z':<15} | {'Valley Depth (Fender - Center)'}")
print("   " + "-" * 70)

for i in range(y_bins):
    y_low = min_y + i * y_step
    y_high = y_low + y_step
    y_mid = (y_low + y_high) * 0.5
    bin_pts = [p for p in all_sample_pts if y_low <= p.y < y_high]
    if not bin_pts:
        continue
    
    # Centerline pts: |X| < 0.15m
    center_pts = [p for p in bin_pts if abs(p.x) < 0.15]
    z_center = max(p.z for p in center_pts) if center_pts else None

    # Fender peak pts: |X| in [0.45, 0.95]
    fender_pts = [p for p in bin_pts if 0.45 <= abs(p.x) <= 0.95]
    z_fender = max(p.z for p in fender_pts) if fender_pts else None

    valley = f"{(z_fender - z_center)*1000.0:6.1f}mm" if (z_fender is not None and z_center is not None) else "  N/A"
    zc_str = f"{z_center:5.3f}m" if z_center is not None else "  N/A "
    zf_str = f"{z_fender:5.3f}m" if z_fender is not None else "  N/A "
    print(f"   Y = {y_mid:6.2f}m         | {zc_str:<15} | {zf_str:<15} | {valley}")

# Transverse Waist Pinch Analysis (Coke-Bottle)
print("\n5. Transverse Body Width & Coke-Bottle Scallop Analysis:")
print(f"   {'Station Y (m)':<15} | {'Body Half-Width':<18} | {'Total Width':<15} | {'Section Type'}")
print("   " + "-" * 70)

for i in range(y_bins):
    y_low = min_y + i * y_step
    y_high = y_low + y_step
    y_mid = (y_low + y_high) * 0.5
    bin_pts = [p for p in all_sample_pts if y_low <= p.y < y_high and p.z > (min_z + 0.15)]
    if not bin_pts:
        continue
    
    max_x_st = max(abs(p.x) for p in bin_pts)
    total_w = max_x_st * 2.0

    # Categorize section
    norm_y = (y_mid - min_y) / length
    if norm_y > 0.88:
        sec = "Front Splitter & Nose"
    elif norm_y > 0.70:
        sec = "Front Fender Flare (Peak)"
    elif norm_y > 0.42:
        sec = "Door Scallop / Radiator Inlet (Waist Pinch)"
    elif norm_y > 0.18:
        sec = "Rear Muscular Haunch (Peak)"
    else:
        sec = "Rear Decklid & Diffuser Taper"

    print(f"   Y = {y_mid:6.2f}m (u={norm_y:4.2f}) | X_max = {max_x_st:5.3f}m    | Width = {total_w:5.3f}m  | {sec}")

# Wheel and Brake Hardpoints
print("\n6. Wheel & Brake Assembly Hardpoints:")
wheel_objs = [o for o in valid_objs if any(k in o.name.lower() for k in ['wheel', 'rim', 'tire', 'brake', 'caliper'])]
print(f"   Found {len(wheel_objs)} wheel/brake related objects:")
for o in wheel_objs[:10]:
    print(f"   - {o.name:<25} | dim: {o.dimensions.x:.3f}x{o.dimensions.y:.3f}x{o.dimensions.z:.3f}m | pos: ({o.location.x:.2f}, {o.location.y:.2f}, {o.location.z:.2f})")

print("================================================================================")
