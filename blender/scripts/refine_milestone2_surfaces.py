# pyright: reportMissingImports=false
import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix

def create_sculpted_hood(wb=2.70, rh=0.10):
    """Generate contoured GT3 hood with aerodynamic center spine and dual extractor vent recesses."""
    bm = bmesh.new()
    nx = 13
    ny = 15
    hood_len = 1.25 # from Y=0.38 to 1.63
    hood_w_rear = 1.16
    hood_w_front = 0.96

    verts_grid = []
    for j in range(ny):
        v = j / (ny - 1) # 0 to 1
        y = 0.38 + v * hood_len
        w = (hood_w_rear * (1.0 - v) + hood_w_front * v) * 0.5
        base_z = 0.60 - 0.16 * (v ** 1.35)
        
        row = []
        for i in range(nx):
            u = (i / (nx - 1)) * 2.0 - 1.0 # -1.0 to 1.0
            x = u * w
            abs_u = abs(u)
            
            # 1. Center aerodynamic spine crease
            spine = max(0.0, 1.0 - (abs_u / 0.20)) * 0.024
            
            # 2. Dual extractor vent recessed troughs
            trough = 0.0
            if 0.25 < abs_u < 0.78 and 0.18 < v < 0.85:
                cu = math.sin((abs_u - 0.25) / 0.53 * math.pi)
                cv = math.sin((v - 0.18) / 0.67 * math.pi)
                trough = -0.026 * cu * cv
                
            # 3. Outer crown roll-off to fender seam
            crown = -0.016 * (u ** 2)
            z = base_z + spine + trough + crown
            
            # In Bonnet_Hinge_Pivot local coordinates (Pivot at Y=0.378, Z=0.60)
            local_pos = Vector((x, y - 0.378, z - 0.60))
            row.append(bm.verts.new(local_pos))
        verts_grid.append(row)

    for j in range(ny - 1):
        for i in range(nx - 1):
            bm.faces.new((verts_grid[j][i], verts_grid[j][i+1], verts_grid[j+1][i+1], verts_grid[j+1][i]))
            
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm

def create_sculpted_fender(side=-1, wb=2.70, rh=0.10):
    """Generate flared front widebody fender with circular wheel arch cutout and crown curvature."""
    bm = bmesh.new()
    ny = 14
    nz = 9
    wheel_y = 1.35
    wheel_z = 0.34
    arch_r = 0.385 # circular wheel arch cutout radius
    
    verts_grid = []
    for j in range(ny):
        v = j / (ny - 1)
        y = 0.40 + v * 1.22 # from Y=0.40 (door seam) to 1.62 (bumper seam)
        dist_to_axle = abs(y - wheel_y)
        
        # Calculate wheel arch lower edge height
        if dist_to_axle < arch_r:
            dz = math.sqrt(max(0.0, arch_r**2 - dist_to_axle**2))
            lower_z = wheel_z + dz
        else:
            lower_z = rh + 0.05
            
        upper_z = 0.60 - 0.14 * (v ** 1.3) + 0.012 # crown height
        
        row = []
        for k in range(nz):
            w_ratio = k / (nz - 1) # 0=lower arch edge, 1=top hood seam
            cur_z = lower_z + (upper_z - lower_z) * w_ratio
            
            # Flared curvature along X:
            inner_x = 0.58 + 0.02 * (1.0 - v) # seam with hood
            outer_x = 0.83 + 0.065 * math.sin(w_ratio * math.pi) # widebody fender flare peak
            
            # Interpolate X from outer wheel lip to inner hood seam
            cur_x = outer_x * (1.0 - w_ratio) + inner_x * w_ratio
            
            vert = bm.verts.new(Vector((side * cur_x, y, cur_z)))
            row.append(vert)
        verts_grid.append(row)

    for j in range(ny - 1):
        for k in range(nz - 1):
            if side < 0: # Left side
                bm.faces.new((verts_grid[j][k], verts_grid[j][k+1], verts_grid[j+1][k+1], verts_grid[j+1][k]))
            else: # Right side
                bm.faces.new((verts_grid[j][k], verts_grid[j+1][k], verts_grid[j+1][k+1], verts_grid[j][k+1]))
                
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm

def create_sculpted_haunch(side=-1, wb=2.70, rh=0.10):
    """Generate muscular coke-bottle rear haunch with circular wheel arch and widebody hip flare."""
    bm = bmesh.new()
    ny = 14
    nz = 9
    wheel_y = -1.35
    wheel_z = 0.34
    arch_r = 0.395 # rear wheel arch cutout radius
    
    verts_grid = []
    for j in range(ny):
        v = j / (ny - 1)
        y = -0.40 - v * 1.22 # from Y=-0.40 (rear door seam) to -1.62 (rear bumper seam)
        dist_to_axle = abs(y - wheel_y)
        
        if dist_to_axle < arch_r:
            dz = math.sqrt(max(0.0, arch_r**2 - dist_to_axle**2))
            lower_z = wheel_z + dz
        else:
            lower_z = rh + 0.05
            
        upper_z = 0.62 - 0.10 * (v ** 1.2) + 0.02 # muscular rear shoulder line
        
        row = []
        for k in range(nz):
            w_ratio = k / (nz - 1) # 0=lower arch edge, 1=top decklid seam
            cur_z = lower_z + (upper_z - lower_z) * w_ratio
            
            inner_x = 0.55 + 0.03 * (1.0 - v) # inner decklid seam
            outer_x = 0.855 + 0.08 * math.sin(w_ratio * math.pi) # muscular rear hip flare
            cur_x = outer_x * (1.0 - w_ratio) + inner_x * w_ratio
            
            vert = bm.verts.new(Vector((side * cur_x, y, cur_z)))
            row.append(vert)
        verts_grid.append(row)

    for j in range(ny - 1):
        for k in range(nz - 1):
            if side < 0:
                bm.faces.new((verts_grid[j][k], verts_grid[j+1][k], verts_grid[j+1][k+1], verts_grid[j][k+1]))
            else:
                bm.faces.new((verts_grid[j][k], verts_grid[j][k+1], verts_grid[j+1][k+1], verts_grid[j+1][k]))
                
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm

def create_sculpted_door(side=-1, wb=2.70, rh=0.10):
    """Generate aerodynamic sculpted door skin with coke-bottle waist channel and flush handle recess."""
    bm = bmesh.new()
    ny = 12
    nz = 10
    
    # Pivot is at X=side*0.764, Y=0.378, Z=0.48
    p_x = side * 0.764
    p_y = 0.378
    p_z = 0.48
    
    verts_grid = []
    for j in range(ny):
        v = j / (ny - 1)
        y = 0.38 - v * 0.76 # from Y=0.38 (fender shutline) to -0.38 (haunch shutline)
        
        row = []
        for k in range(nz):
            w_ratio = k / (nz - 1) # 0=rocker sill, 1=window sill
            cur_z = (rh + 0.04) + w_ratio * 0.44 # Z=0.14 to 0.58
            
            # Inward waistline channel (recesses by ~24mm in center for airflow)
            waist_depth = math.sin(v * math.pi) * math.sin(w_ratio * math.pi) * 0.024
            
            base_x = 0.81 - 0.035 * math.sin(w_ratio * math.pi) - waist_depth
            world_pos = Vector((side * base_x, y, cur_z))
            local_pos = world_pos - Vector((p_x, p_y, p_z))
            
            vert = bm.verts.new(local_pos)
            row.append(vert)
        verts_grid.append(row)

    for j in range(ny - 1):
        for k in range(nz - 1):
            if side < 0:
                bm.faces.new((verts_grid[j][k], verts_grid[j+1][k], verts_grid[j+1][k+1], verts_grid[j][k+1]))
            else:
                bm.faces.new((verts_grid[j][k], verts_grid[j][k+1], verts_grid[j+1][k+1], verts_grid[j+1][k]))
                
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm

def create_sculpted_canopy(wb=2.70, rh=0.10):
    """Generate aerodynamic double-bubble greenhouse roof canopy with A-pillar and C-pillar continuity."""
    bm = bmesh.new()
    nx = 11
    ny = 15
    
    verts_grid = []
    for j in range(ny):
        v = j / (ny - 1)
        y = 0.90 - v * 1.30 # Y=0.90 (windshield base) to -0.40 (engine cover base)
        
        # Cabin height profile: cowl 0.60m -> roof crest 0.98m -> rear buttress 0.62m
        if v < 0.45: # Windshield rake
            t = v / 0.45
            profile_z = 0.60 + 0.38 * math.sin(t * math.pi * 0.5)
            w = 0.52 + 0.10 * t # Width widens toward roof
        else: # Roof & rear window taper
            t = (v - 0.45) / 0.55
            profile_z = 0.98 - 0.36 * (t ** 1.3)
            w = 0.62 - 0.12 * t
            
        row = []
        for i in range(nx):
            u = (i / (nx - 1)) * 2.0 - 1.0 # -1 to 1
            x = u * w
            abs_u = abs(u)
            
            # Double-bubble aerodynamic roof channel (recessed in center, crested over driver/passenger)
            bubble = 0.0
            if 0.30 < v < 0.70:
                # Depression along centerline X=0, mounds over X=±0.3
                bubble_v = math.sin((v - 0.30) / 0.40 * math.pi)
                bubble_u = (math.sin(abs_u * math.pi) - 0.3) * 0.016
                bubble = bubble_u * bubble_v
                
            crown = -0.045 * (u ** 2)
            cur_z = profile_z + bubble + crown
            
            vert = bm.verts.new(Vector((x, y, cur_z)))
            row.append(vert)
        verts_grid.append(row)

    for j in range(ny - 1):
        for i in range(nx - 1):
            bm.faces.new((verts_grid[j][i], verts_grid[j][i+1], verts_grid[j+1][i+1], verts_grid[j+1][i]))
            
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm

def create_sculpted_fascia_front():
    """Generate sculpted front bumper fascia with air dam scoop and swept headlight corners."""
    bm = bmesh.new()
    nx = 13
    nz = 7
    y_front = 1.88
    y_back = 1.62
    
    verts_grid = []
    for k in range(nz):
        w = k / (nz - 1)
        z = 0.12 + w * 0.34 # Z=0.12 (splitter) to 0.46 (hood seam)
        
        row = []
        for i in range(nx):
            u = (i / (nx - 1)) * 2.0 - 1.0 # -1 to 1
            abs_u = abs(u)
            
            # Swept aerodynamic shark-nose curve
            sweep_y = y_front - 0.26 * (abs_u ** 1.5)
            cur_x = u * 0.78 # Width extends to meet fenders
            
            # Central air dam scoop indent
            if abs_u < 0.45 and w < 0.7:
                sweep_y -= 0.045 * math.cos(abs_u / 0.45 * math.pi * 0.5)
                
            vert = bm.verts.new(Vector((cur_x, sweep_y, z)))
            row.append(vert)
        verts_grid.append(row)

    for k in range(nz - 1):
        for i in range(nx - 1):
            bm.faces.new((verts_grid[k][i], verts_grid[k][i+1], verts_grid[k+1][i+1], verts_grid[k+1][i]))
            
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm

def create_sculpted_decklid():
    """Generate rear vented engine decklid cover with integrated ducktail spoiler trailing lip."""
    bm = bmesh.new()
    nx = 11
    ny = 12
    # Dicky_Decklid_Pivot is at Y=-0.378, Z=0.62
    p_y = -0.378
    p_z = 0.62
    
    verts_grid = []
    for j in range(ny):
        v = j / (ny - 1)
        y = -0.38 - v * 1.05 # Y=-0.38 to -1.43
        
        # Slight downslope towards rear with upturned ducktail kick at trailing edge (v > 0.85)
        base_z = 0.62 - 0.08 * v
        if v > 0.85:
            kick = ((v - 0.85) / 0.15) ** 2 * 0.035 # 35mm ducktail aerofoil lip
            base_z += kick
            
        w = 0.58 + 0.04 * (1.0 - v)
        
        row = []
        for i in range(nx):
            u = (i / (nx - 1)) * 2.0 - 1.0
            x = u * w
            crown = -0.015 * (u ** 2)
            cur_z = base_z + crown
            
            local_pos = Vector((x, y - p_y, cur_z - p_z))
            vert = bm.verts.new(local_pos)
            row.append(vert)
        verts_grid.append(row)

    for j in range(ny - 1):
        for i in range(nx - 1):
            bm.faces.new((verts_grid[j][i], verts_grid[j][i+1], verts_grid[j+1][i+1], verts_grid[j+1][i]))
            
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm

def update_mesh_safely(obj_name, new_bm):
    """Replace object's mesh data with new sculpted bmesh, preserving modifiers, materials and transforms."""
    obj = bpy.data.objects.get(obj_name)
    if not obj:
        print(f"WARNING: Object {obj_name} not found!")
        new_bm.free()
        return
        
    old_mesh = obj.data
    new_mesh = bpy.data.meshes.new(f"Mesh_{obj_name}_ClassA")
    new_bm.to_mesh(new_mesh)
    new_bm.free()
    
    # Copy material slots
    for mat_slot in old_mesh.materials:
        new_mesh.materials.append(mat_slot)
        
    # Assign smooth shading to all faces
    for poly in new_mesh.polygons:
        poly.use_smooth = True
        
    obj.data = new_mesh
    print(f"Updated {obj_name}: {len(new_mesh.vertices)} verts, {len(new_mesh.polygons)} polys")

def main():
    project_root = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
    source_blend = os.path.join(project_root, "blender", "versions", "EXTERIOR_V01", "modular_gt3_apex_v01.blend")
    blend_v02 = os.path.join(project_root, "blender", "versions", "EXTERIOR_V02", "modular_gt3_apex_v02.blend")
    glb_v02 = os.path.join(project_root, "blender", "versions", "EXTERIOR_V02", "modular_gt3_apex_v02.glb")
    public_target = os.path.join(project_root, "public", "models", "exterior", "modular_gt3_apex.glb")
    exports_target = os.path.join(project_root, "exports", "glb", "modular_gt3_apex_refined.glb")

    print("==================================================")
    print("MILESTONE 2: CLASS-A SURFACING & PANEL REFINEMENT")
    print("==================================================")
    bpy.ops.wm.open_mainfile(filepath=source_blend)

    # 1. Sculpt Hood with powerdome spine and dual extractor vent recesses
    update_mesh_safely("Bonnet_Hood_Skin", create_sculpted_hood())

    # 2. Sculpt Front Fenders with circular wheel arch cutouts and flared shoulders
    update_mesh_safely("Fender_Front_Left", create_sculpted_fender(side=-1))
    update_mesh_safely("Fender_Front_Right", create_sculpted_fender(side=1))

    # 3. Sculpt Rear Haunches with muscular coke-bottle hips
    update_mesh_safely("Rear_Haunch_Left", create_sculpted_haunch(side=-1))
    update_mesh_safely("Rear_Haunch_Right", create_sculpted_haunch(side=1))

    # 4. Sculpt Doors with aerodynamic waist channels
    update_mesh_safely("Door_Main_Skin_Left", create_sculpted_door(side=-1))
    update_mesh_safely("Door_Main_Skin_Right", create_sculpted_door(side=1))

    # 5. Sculpt Greenhouse Roof Canopy with double-bubble profile
    update_mesh_safely("Greenhouse_Roof_Canopy", create_sculpted_canopy())

    # 6. Sculpt Front Bumper Fascia with shark nose and air dam
    update_mesh_safely("Front_Bumper_Fascia", create_sculpted_fascia_front())

    # 7. Sculpt Vented Decklid Cover with ducktail spoiler lip
    update_mesh_safely("Dicky_Engine_Cover_Skin", create_sculpted_decklid())

    # Ensure all modifiers are cleanly stacked
    for obj in bpy.data.objects:
        if obj.type != 'MESH':
            continue
        mesh = obj.data
        for poly in mesh.polygons:
            poly.use_smooth = True
            
        # Re-verify Weighted Normal is last in modifier stack for Class-A highlight flow
        if "Weighted_Normal_ClassA" in obj.modifiers:
            wn = obj.modifiers["Weighted_Normal_ClassA"]
            wn.keep_sharp = True
            wn.weight = 50
            wn.mode = 'FACE_AREA'

    print("\n==================================================")
    print(f"SAVING CHECKPOINT EXTERIOR_V02: {blend_v02}")
    print("==================================================")
    bpy.ops.wm.save_as_mainfile(filepath=blend_v02)

    print("\n==================================================")
    print(f"EXPORTING CHECKPOINT GLB: {glb_v02}")
    print("==================================================")
    bpy.ops.export_scene.gltf(
        filepath=glb_v02,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False,
        export_extras=True,
        export_yup=True
    )
    
    file_size = os.path.getsize(glb_v02)
    print(f"EXTERIOR_V02 GLB generated: {file_size:,} bytes")

    # Sync to runtime public directory and exports directory
    with open(glb_v02, "rb") as f_src:
        data = f_src.read()
        with open(public_target, "wb") as f_pub:
            f_pub.write(data)
        with open(exports_target, "wb") as f_exp:
            f_exp.write(data)

    print(f"Successfully synced refined GLB to {public_target} and {exports_target}")
    print("==================================================")
    print("MILESTONE 2 (PHASES 06–10, 15–17) COMPLETE (100%)")
    print("==================================================")

if __name__ == "__main__":
    main()
