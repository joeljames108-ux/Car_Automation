"""
==============================================================================
UPGRADE REMAINING FORMULA 1 & HYPERCAR GLB ASSETS (BLENDER 5.2 LTS)
==============================================================================
Replaces all low-poly (<1,000 verts) F1 & GT3 Hypercar assets with
ultra-detailed Class-A CAD procedural geometry:
- F1_Nose_Wide (2,500+ verts)
- F1_Monocoque_M55J (3,500+ verts)
- F1_Floor_AntiPorpoise (3,000+ verts)
- F1_Suspension_FL_Pullrod & F1_Suspension_FR_Pullrod (2,500+ verts each)
- F1_Suspension_RL_Pushrod & F1_Suspension_RR_Pushrod (2,500+ verts each)
- F1_Gearbox_Carbon8 (3,000+ verts)
- F1_Halo_Grade5 (2,200+ verts)
- Hypercar_Rocker_Skirt_Left & Right (2,200+ verts each)
- Hypercar_Rear_Haunch_Left & Right (2,500+ verts each)
==============================================================================
"""

import bpy
import bmesh
import math
import os
import shutil
import sys
from mathutils import Vector, Matrix, Euler

# Import shared CAD geometry library
LIB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "generators"))
if LIB_DIR not in sys.path:
    sys.path.insert(0, LIB_DIR)

from cad_geometry_library import (
    clear_blender_scene,
    ensure_collection,
    get_or_create_material,
    apply_mesh_polish,
    bmesh_create_cylinder,
    create_hex_bolt,
    create_socket_head_cap_screw,
    create_heim_joint
)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PUB_F1_MODELS = os.path.join(PROJECT_ROOT, "public", "models", "vehicles", "f1")
PUB_F1_VEHICLES = os.path.join(PROJECT_ROOT, "public", "vehicles", "f1")
PUB_GT3_MODELS = os.path.join(PROJECT_ROOT, "public", "models", "vehicles", "gt3_supercar")
PUB_GT3_VEHICLES = os.path.join(PROJECT_ROOT, "public", "vehicles", "gt3_supercar")
EXPORTS_F1 = os.path.join(PROJECT_ROOT, "exports", "parts", "f1")
EXPORTS_GT3 = os.path.join(PROJECT_ROOT, "exports", "parts", "gt3_supercar")

for d in [PUB_F1_MODELS, PUB_F1_VEHICLES, PUB_GT3_MODELS, PUB_GT3_VEHICLES, EXPORTS_F1, EXPORTS_GT3]:
    os.makedirs(d, exist_ok=True)

def log(msg):
    print(f"[F1_HYPERCAR_UPGRADE] {msg}")

def export_active_to_paths(target_paths):
    primary = target_paths[0]
    bpy.ops.export_scene.gltf(
        filepath=primary,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_yup=True
    )
    for alt in target_paths[1:]:
        shutil.copyfile(primary, alt)
    v_count = sum(len(o.data.vertices) for o in bpy.data.objects if o.type == 'MESH')
    sz_kb = os.path.getsize(primary) / 1024.0
    log(f"Exported -> {os.path.basename(primary)} ({v_count:,} raw base verts | {sz_kb:.1f} KB) to {len(target_paths)} locations")

# ---------------------------------------------------------------------------
# 1. F1 Wide Impact Nose Cone
# ---------------------------------------------------------------------------
def build_f1_nose_wide():
    clear_blender_scene()
    col = ensure_collection("F1_Nose_Wide")
    mat_cf = get_or_create_material("F1_Carbon_Twill", "carbon_twill")
    mat_ti = get_or_create_material("F1_Titanium_Hardware", "titanium")
    mat_bezel = get_or_create_material("F1_Matte_Carbon", "carbon_matte")
    
    # 1. Main Sculpted Drooping Nose Body
    bm = bmesh.new()
    # Forward nose tip section
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0.0, 2.48, 0.22)) @ Matrix.Diagonal((0.18, 0.26, 0.12, 1.0))
    )
    # Mid transitioning body
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0.0, 2.05, 0.28)) @ Matrix.Diagonal((0.34, 0.65, 0.24, 1.0))
    )
    # Aft wide impact bulkhead adapter
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0.0, 1.55, 0.34)) @ Matrix.Diagonal((0.54, 0.45, 0.36, 1.0))
    )
    # Underside aerodynamic keel splitter
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0.0, 1.95, 0.17)) @ Matrix.Diagonal((0.16, 0.95, 0.05, 1.0))
    )
    mesh = bpy.data.meshes.new("F1_Nose_Shell")
    bm.to_mesh(mesh)
    bm.free()
    nose_shell = bpy.data.objects.new("F1_Nose_Shell", mesh)
    nose_shell.data.materials.append(mat_cf)
    col.objects.link(nose_shell)
    apply_mesh_polish(nose_shell, bevel_width=0.008, subsurf_levels=1)
    
    # 2. NACA Cockpit Driver Cooling Duct
    bm_n = bmesh.new()
    bmesh.ops.create_cube(
        bm_n, size=1.0,
        matrix=Matrix.Translation((0.0, 1.78, 0.49)) @ Matrix.Diagonal((0.08, 0.14, 0.03, 1.0))
    )
    mesh_n = bpy.data.meshes.new("NACA_Duct_Recess")
    bm_n.to_mesh(mesh_n)
    bm_n.free()
    naca = bpy.data.objects.new("NACA_Duct_Recess", mesh_n)
    naca.data.materials.append(mat_bezel)
    col.objects.link(naca)
    apply_mesh_polish(naca, bevel_width=0.002, subsurf_levels=1)
    
    # 3. Pitot Static Tube Mast
    bm_p = bmesh.new()
    bmesh_create_cylinder(
        bm_p, radius=0.005, depth=0.14, segments=24, cap_ends=True,
        matrix=Matrix.Translation((0.0, 1.62, 0.54))
    )
    bmesh_create_cylinder(
        bm_p, radius=0.003, depth=0.05, segments=20, cap_ends=True,
        matrix=Matrix.Translation((0.0, 1.64, 0.60)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    mesh_p = bpy.data.meshes.new("Pitot_Probe")
    bm_p.to_mesh(mesh_p)
    bm_p.free()
    pitot = bpy.data.objects.new("Pitot_Probe", mesh_p)
    pitot.data.materials.append(mat_ti)
    col.objects.link(pitot)
    apply_mesh_polish(pitot, bevel_width=0.001)
    
    # 4. Dual FIA Forward Telemetry Camera Pods
    for cx in [-0.22, 0.22]:
        bm_c = bmesh.new()
        # Cantilevered airfoil stalk
        bmesh.ops.create_cube(
            bm_c, size=1.0,
            matrix=Matrix.Translation((cx * 0.72, 2.12, 0.32)) @ Matrix.Diagonal((abs(cx)*0.6, 0.035, 0.012, 1.0))
        )
        # Teardrop camera pod housing
        bmesh_create_cylinder(
            bm_c, radius=0.018, depth=0.12, segments=24, cap_ends=True,
            matrix=Matrix.Translation((cx, 2.12, 0.33)) @ Matrix.Rotation(math.radians(90), 4, 'X')
        )
        mesh_c = bpy.data.meshes.new(f"Camera_Pod_{cx}")
        bm_c.to_mesh(mesh_c)
        bm_c.free()
        cam = bpy.data.objects.new(f"Camera_Pod_{cx}", mesh_c)
        cam.data.materials.append(mat_bezel)
        col.objects.link(cam)
        apply_mesh_polish(cam, bevel_width=0.002, subsurf_levels=1)
        
    # 5. Front Wing Mounting Pylon Attachment Cleats
    for px in [-0.09, 0.09]:
        for py in [2.32, 2.42]:
            b = create_hex_bolt(f"FW_Pylon_Bolt_{px}_{py}", radius=0.005, height=0.008, mat=mat_ti)
            b.location = (px, py, 0.17)
            col.objects.link(b)
            
    export_active_to_paths([
        os.path.join(PUB_F1_MODELS, "f1_nose_wide.glb"),
        os.path.join(PUB_F1_VEHICLES, "f1_nose_wide.glb"),
        os.path.join(EXPORTS_F1, "f1_nose_wide.glb")
    ])

# ---------------------------------------------------------------------------
# 2. F1 Monocoque Survival Cell (M55J)
# ---------------------------------------------------------------------------
def build_f1_monocoque_m55j():
    clear_blender_scene()
    col = ensure_collection("F1_Monocoque_M55J")
    mat_carbon = get_or_create_material("M55J_Carbon_Weave", "carbon_twill")
    mat_matte = get_or_create_material("Cockpit_Lining_Matte", "carbon_matte")
    mat_foam = get_or_create_material("Confor_Safety_Foam", "rubber_black")
    mat_ti = get_or_create_material("Monocoque_Titanium_Lugs", "titanium")
    mat_glass = get_or_create_material("Mirror_Reflective_Face", "chrome")
    
    # 1. Survival Cell Main Fuselage
    bm = bmesh.new()
    # Forward nose-interface bulkhead section
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0.0, 1.05, 0.36)) @ Matrix.Diagonal((0.54, 0.55, 0.38, 1.0))
    )
    # Cockpit mid-tub section with driver opening
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0.0, 0.05, 0.38)) @ Matrix.Diagonal((0.68, 1.45, 0.44, 1.0))
    )
    # Engine bay rear bulkhead (fuel cell cavity)
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0.0, -0.75, 0.36)) @ Matrix.Diagonal((0.64, 0.65, 0.42, 1.0))
    )
    mesh = bpy.data.meshes.new("M55J_Main_Tub")
    bm.to_mesh(mesh)
    bm.free()
    tub = bpy.data.objects.new("M55J_Main_Tub", mesh)
    tub.data.materials.append(mat_carbon)
    col.objects.link(tub)
    apply_mesh_polish(tub, bevel_width=0.015, subsurf_levels=1)
    
    # 2. Cockpit Inner Cavity & Driver Bead Seat
    bm_seat = bmesh.new()
    bmesh.ops.create_cube(
        bm_seat, size=1.0,
        matrix=Matrix.Translation((0.0, 0.12, 0.40)) @ Matrix.Diagonal((0.52, 0.95, 0.32, 1.0))
    )
    # Molded bead seat insert
    bmesh.ops.create_cube(
        bm_seat, size=1.0,
        matrix=Matrix.Translation((0.0, 0.08, 0.32)) @ Matrix.Diagonal((0.46, 0.72, 0.22, 1.0))
    )
    mesh_seat = bpy.data.meshes.new("Cockpit_Interior")
    bm_seat.to_mesh(mesh_seat)
    bm_seat.free()
    seat = bpy.data.objects.new("Cockpit_Interior", mesh_seat)
    seat.data.materials.append(mat_matte)
    col.objects.link(seat)
    apply_mesh_polish(seat, bevel_width=0.008, subsurf_levels=1)
    
    # 3. Cockpit Coaming Lip & Removable Headrest Surround
    bm_lip = bmesh.new()
    bmesh.ops.create_cube(
        bm_lip, size=1.0,
        matrix=Matrix.Translation((0.0, 0.44, 0.58)) @ Matrix.Diagonal((0.50, 0.14, 0.045, 1.0))
    )
    # Confor pink/blue safety foam surround
    bmesh.ops.create_cube(
        bm_lip, size=1.0,
        matrix=Matrix.Translation((0.0, -0.22, 0.62)) @ Matrix.Diagonal((0.44, 0.36, 0.16, 1.0))
    )
    mesh_lip = bpy.data.meshes.new("Coaming_And_Headrest")
    bm_lip.to_mesh(mesh_lip)
    bm_lip.free()
    lip = bpy.data.objects.new("Coaming_And_Headrest", mesh_lip)
    lip.data.materials.append(mat_foam)
    col.objects.link(lip)
    apply_mesh_polish(lip, bevel_width=0.006, subsurf_levels=1)
    
    # 4. Engine Airbox Intake Scoop & Roll Hoop
    bm_air = bmesh.new()
    # Tapered triangular roll hoop airbox intake
    bmesh.ops.create_cube(
        bm_air, size=1.0,
        matrix=Matrix.Translation((0.0, -0.32, 0.76)) @ Matrix.Diagonal((0.30, 0.55, 0.34, 1.0))
    )
    # Inward intake aperture lip
    bmesh_create_cylinder(
        bm_air, radius=0.10, depth=0.18, segments=32, cap_ends=True,
        matrix=Matrix.Translation((0.0, -0.06, 0.82)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    mesh_air = bpy.data.meshes.new("Airbox_Roll_Hoop")
    bm_air.to_mesh(mesh_air)
    bm_air.free()
    air = bpy.data.objects.new("Airbox_Roll_Hoop", mesh_air)
    air.data.materials.append(mat_carbon)
    col.objects.link(air)
    apply_mesh_polish(air, bevel_width=0.008, subsurf_levels=1)
    
    # 5. Dorsal Shark Fin Engine Cover Spine
    bm_fin = bmesh.new()
    bmesh.ops.create_cube(
        bm_fin, size=1.0,
        matrix=Matrix.Translation((0.0, -0.92, 0.74)) @ Matrix.Diagonal((0.016, 1.25, 0.44, 1.0))
    )
    mesh_fin = bpy.data.meshes.new("Dorsal_Shark_Fin")
    bm_fin.to_mesh(mesh_fin)
    bm_fin.free()
    fin = bpy.data.objects.new("Dorsal_Shark_Fin", mesh_fin)
    fin.data.materials.append(mat_carbon)
    col.objects.link(fin)
    apply_mesh_polish(fin, bevel_width=0.003, subsurf_levels=1)
    
    # 6. T-Cam Broadcast Telemetry Pod & Mast
    bm_tcam = bmesh.new()
    bmesh_create_cylinder(
        bm_tcam, radius=0.012, depth=0.12, segments=20, cap_ends=True,
        matrix=Matrix.Translation((0.0, -0.12, 0.98))
    )
    bmesh.ops.create_cube(
        bm_tcam, size=1.0,
        matrix=Matrix.Translation((0.0, -0.12, 1.04)) @ Matrix.Diagonal((0.038, 0.10, 0.036, 1.0))
    )
    mesh_tcam = bpy.data.meshes.new("T_Cam_Pod")
    bm_tcam.to_mesh(mesh_tcam)
    bm_tcam.free()
    tcam = bpy.data.objects.new("T_Cam_Pod", mesh_tcam)
    tcam.data.materials.append(mat_ti)
    col.objects.link(tcam)
    apply_mesh_polish(tcam, bevel_width=0.002)
    
    # 7. Dual Aerodynamic Rearview Mirrors
    for ms, mx in [("Left", -0.42), ("Right", 0.42)]:
        bm_m = bmesh.new()
        # Streamlined carbon flow-conditioner stalk
        bmesh.ops.create_cube(
            bm_m, size=1.0,
            matrix=Matrix.Translation((mx * 0.75, 0.35, 0.55)) @ Matrix.Diagonal((abs(mx)*0.5, 0.045, 0.014, 1.0))
        )
        # Mirror housing
        bmesh.ops.create_cube(
            bm_m, size=1.0,
            matrix=Matrix.Translation((mx, 0.32, 0.58)) @ Matrix.Diagonal((0.14, 0.065, 0.055, 1.0))
        )
        mesh_m = bpy.data.meshes.new(f"Mirror_{ms}")
        bm_m.to_mesh(mesh_m)
        bm_m.free()
        mir = bpy.data.objects.new(f"Mirror_{ms}", mesh_m)
        mir.data.materials.append(mat_carbon)
        col.objects.link(mir)
        apply_mesh_polish(mir, bevel_width=0.003, subsurf_levels=1)
        
    export_active_to_paths([
        os.path.join(PUB_F1_MODELS, "f1_monocoque_m55j.glb"),
        os.path.join(PUB_F1_VEHICLES, "f1_monocoque_m55j.glb"),
        os.path.join(EXPORTS_F1, "f1_monocoque_m55j.glb")
    ])

# ---------------------------------------------------------------------------
# 3. F1 Anti-Porpoising Ground Effect Floor
# ---------------------------------------------------------------------------
def build_f1_floor_antiporpoise():
    clear_blender_scene()
    col = ensure_collection("F1_Floor_AntiPorpoise")
    mat_cf = get_or_create_material("Floor_Prepreg_Carbon", "carbon_twill")
    mat_ti = get_or_create_material("Floor_Titanium_Stays", "titanium")
    mat_skid = get_or_create_material("Skid_Block_Jabroc", "cast_aluminum")
    
    # 1. Main Stepped Floor Tray (2.75m length x 1.68m width)
    bm = bmesh.new()
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0.0, -0.25, 0.065)) @ Matrix.Diagonal((1.68, 2.75, 0.024, 1.0))
    )
    # Longitudinal edge stiffening rails
    for ex in [-0.82, 0.82]:
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((ex, -0.25, 0.085)) @ Matrix.Diagonal((0.035, 2.65, 0.035, 1.0))
        )
    mesh = bpy.data.meshes.new("Floor_Main_Tray")
    bm.to_mesh(mesh)
    bm.free()
    tray = bpy.data.objects.new("Floor_Main_Tray", mesh)
    tray.data.materials.append(mat_cf)
    col.objects.link(tray)
    apply_mesh_polish(tray, bevel_width=0.004, subsurf_levels=1)
    
    # 2. 4x Curved Leading-Edge Underfloor Venturi Tunnel Fences
    for fx in [-0.68, -0.42, 0.42, 0.68]:
        bm_f = bmesh.new()
        bmesh.ops.create_cube(
            bm_f, size=1.0,
            matrix=Matrix.Translation((fx, 0.85, 0.16)) @ Matrix.Diagonal((0.015, 0.68, 0.18, 1.0))
        )
        # Curved vortex-shedding upper flange lip
        bmesh_create_cylinder(
            bm_f, radius=0.008, depth=0.68, segments=16, cap_ends=True,
            matrix=Matrix.Translation((fx, 0.85, 0.25)) @ Matrix.Rotation(math.radians(90), 4, 'X')
        )
        mesh_f = bpy.data.meshes.new(f"Floor_Fence_{fx}")
        bm_f.to_mesh(mesh_f)
        bm_f.free()
        fence = bpy.data.objects.new(f"Floor_Fence_{fx}", mesh_f)
        fence.data.materials.append(mat_cf)
        col.objects.link(fence)
        apply_mesh_polish(fence, bevel_width=0.002, subsurf_levels=1)
        
    # 3. Slotted Floor Edge Winglets with Titanium Anti-Flex Stays
    for sx in [-0.85, 0.85]:
        bm_w = bmesh.new()
        # Edge winglet blade
        bmesh.ops.create_cube(
            bm_w, size=1.0,
            matrix=Matrix.Translation((sx, -0.30, 0.095)) @ Matrix.Diagonal((0.045, 1.65, 0.040, 1.0))
        )
        mesh_w = bpy.data.meshes.new(f"Edge_Winglet_{sx}")
        bm_w.to_mesh(mesh_w)
        bm_w.free()
        winglet = bpy.data.objects.new(f"Edge_Winglet_{sx}", mesh_w)
        winglet.data.materials.append(mat_cf)
        col.objects.link(winglet)
        apply_mesh_polish(winglet, bevel_width=0.002, subsurf_levels=1)
        
        # Diagonal anti-porpoise floor tie-rod / stay (runs up to gearbox/chassis)
        bm_stay = bmesh.new()
        bmesh_create_cylinder(
            bm_stay, radius=0.006, depth=0.55, segments=20, cap_ends=True,
            matrix=Matrix.Translation((sx * 0.75, -1.15, 0.22)) @ Matrix.Rotation(math.radians(35 * (-1 if sx > 0 else 1)), 4, 'Y')
        )
        mesh_stay = bpy.data.meshes.new(f"Floor_Stay_{sx}")
        bm_stay.to_mesh(mesh_stay)
        bm_stay.free()
        stay = bpy.data.objects.new(f"Floor_Stay_{sx}", mesh_stay)
        stay.data.materials.append(mat_ti)
        col.objects.link(stay)
        apply_mesh_polish(stay, bevel_width=0.001)
        
    # 4. Center Jabroc / Titanium Skid Block Plank (FIA Art 3.5.6)
    bm_skid = bmesh.new()
    bmesh.ops.create_cube(
        bm_skid, size=1.0,
        matrix=Matrix.Translation((0.0, -0.25, 0.045)) @ Matrix.Diagonal((0.30, 2.40, 0.010, 1.0))
    )
    # Titanium wear measuring pucks (4 pucks)
    for py in [0.80, 0.10, -0.60, -1.30]:
        bmesh_create_cylinder(
            bm_skid, radius=0.025, depth=0.012, segments=24, cap_ends=True,
            matrix=Matrix.Translation((0.0, py, 0.043))
        )
    mesh_skid = bpy.data.meshes.new("Skid_Plank_Assembly")
    bm_skid.to_mesh(mesh_skid)
    bm_skid.free()
    skid = bpy.data.objects.new("Skid_Plank_Assembly", mesh_skid)
    skid.data.materials.append(mat_skid)
    col.objects.link(skid)
    apply_mesh_polish(skid, bevel_width=0.0015, subsurf_levels=1)
    
    export_active_to_paths([
        os.path.join(PUB_F1_MODELS, "f1_floor_antiporpoise.glb"),
        os.path.join(PUB_F1_VEHICLES, "f1_floor_antiporpoise.glb"),
        os.path.join(EXPORTS_F1, "f1_floor_antiporpoise.glb")
    ])

# ---------------------------------------------------------------------------
# 4. F1 Pullrod Front Suspension (Left & Right)
# ---------------------------------------------------------------------------
def build_f1_front_pullrod_suspension():
    for side, sx, sign in [("FL", -0.45, -1), ("FR", 0.45, 1)]:
        clear_blender_scene()
        col = ensure_collection(f"F1_Suspension_{side}_Pullrod")
        mat_cf = get_or_create_material("Suspension_Carbon_Aero", "carbon_twill")
        mat_ti = get_or_create_material("Suspension_Titanium_Parts", "titanium")
        mat_brake = get_or_create_material("Brake_Duct_Matte", "carbon_matte")
        
        upr_x = sign * 0.74
        
        # 1. Upper Forward & Aft Wishbone Aerofoil Struts
        bm_uw = bmesh.new()
        # Upper Forward Wishbone (Aerodynamic NACA airfoil cross-section)
        bmesh.ops.create_cube(
            bm_uw, size=1.0,
            matrix=Matrix.Translation((sign * 0.48, 1.84, 0.41)) @
                   Matrix.Rotation(math.radians(-6 * sign), 4, 'Z') @
                   Matrix.Diagonal((0.46, 0.045, 0.015, 1.0))
        )
        # Upper Aft Wishbone
        bmesh.ops.create_cube(
            bm_uw, size=1.0,
            matrix=Matrix.Translation((sign * 0.50, 1.72, 0.41)) @
                   Matrix.Rotation(math.radians(12 * sign), 4, 'Z') @
                   Matrix.Diagonal((0.46, 0.045, 0.015, 1.0))
        )
        mesh_uw = bpy.data.meshes.new(f"{side}_Upper_Wishbones")
        bm_uw.to_mesh(mesh_uw)
        bm_uw.free()
        uw = bpy.data.objects.new(f"{side}_Upper_Wishbones", mesh_uw)
        uw.data.materials.append(mat_cf)
        col.objects.link(uw)
        apply_mesh_polish(uw, bevel_width=0.003, subsurf_levels=1)
        
        # 2. Lower Forward & Aft Wishbone Aerofoil Struts
        bm_lw = bmesh.new()
        bmesh.ops.create_cube(
            bm_lw, size=1.0,
            matrix=Matrix.Translation((sign * 0.48, 1.84, 0.23)) @
                   Matrix.Rotation(math.radians(-4 * sign), 4, 'Z') @
                   Matrix.Diagonal((0.48, 0.048, 0.016, 1.0))
        )
        bmesh.ops.create_cube(
            bm_lw, size=1.0,
            matrix=Matrix.Translation((sign * 0.50, 1.72, 0.23)) @
                   Matrix.Rotation(math.radians(14 * sign), 4, 'Z') @
                   Matrix.Diagonal((0.48, 0.048, 0.016, 1.0))
        )
        mesh_lw = bpy.data.meshes.new(f"{side}_Lower_Wishbones")
        bm_lw.to_mesh(mesh_lw)
        bm_lw.free()
        lw = bpy.data.objects.new(f"{side}_Lower_Wishbones", mesh_lw)
        lw.data.materials.append(mat_cf)
        col.objects.link(lw)
        apply_mesh_polish(lw, bevel_width=0.003, subsurf_levels=1)
        
        # 3. Diagonal Pullrod Linkage (top of upright down to chassis inboard rocker)
        bm_pr = bmesh.new()
        bmesh_create_cylinder(
            bm_pr, radius=0.011, depth=0.52, segments=24, cap_ends=True,
            matrix=Matrix.Translation((sign * 0.48, 1.77, 0.28)) @
                   Matrix.Rotation(math.radians(24 * sign), 4, 'Y')
        )
        # Hex turnbuckle adjuster on pullrod
        bmesh_create_cylinder(
            bm_pr, radius=0.016, depth=0.035, segments=6, cap_ends=True,
            matrix=Matrix.Translation((sign * 0.48, 1.77, 0.28)) @
                   Matrix.Rotation(math.radians(24 * sign), 4, 'Y')
        )
        mesh_pr = bpy.data.meshes.new(f"{side}_Pullrod_Strut")
        bm_pr.to_mesh(mesh_pr)
        bm_pr.free()
        pr = bpy.data.objects.new(f"{side}_Pullrod_Strut", mesh_pr)
        pr.data.materials.append(mat_ti)
        col.objects.link(pr)
        apply_mesh_polish(pr, bevel_width=0.0015)
        
        # 4. Carbon Fiber / Titanium Upright Knuckle & Wheel Spindle
        bm_up = bmesh.new()
        bmesh.ops.create_cube(
            bm_up, size=1.0,
            matrix=Matrix.Translation((upr_x, 1.80, 0.34)) @ Matrix.Diagonal((0.08, 0.16, 0.28, 1.0))
        )
        # Center-lock wheel hub spindle snout
        bmesh_create_cylinder(
            bm_up, radius=0.038, depth=0.12, segments=32, cap_ends=True,
            matrix=Matrix.Translation((upr_x + sign * 0.05, 1.80, 0.34)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        mesh_up = bpy.data.meshes.new(f"{side}_Upright_Spindle")
        bm_up.to_mesh(mesh_up)
        bm_up.free()
        up = bpy.data.objects.new(f"{side}_Upright_Spindle", mesh_up)
        up.data.materials.append(mat_ti)
        col.objects.link(up)
        apply_mesh_polish(up, bevel_width=0.003, subsurf_levels=1)
        
        # 5. Brake Cooling Bellmouth Scoop & Deflector Vanes
        bm_bk = bmesh.new()
        bmesh.ops.create_cube(
            bm_bk, size=1.0,
            matrix=Matrix.Translation((upr_x - sign * 0.04, 1.88, 0.36)) @ Matrix.Diagonal((0.065, 0.12, 0.18, 1.0))
        )
        mesh_bk = bpy.data.meshes.new(f"{side}_Brake_Scoop")
        bm_bk.to_mesh(mesh_bk)
        bm_bk.free()
        bk = bpy.data.objects.new(f"{side}_Brake_Scoop", mesh_bk)
        bk.data.materials.append(mat_brake)
        col.objects.link(bk)
        apply_mesh_polish(bk, bevel_width=0.002, subsurf_levels=1)
        
        # 6. Titanium Spherical Heim Joints on Wishbone Ends (4 joints)
        for h_y, h_z in [(1.88, 0.41), (1.68, 0.41), (1.86, 0.23), (1.70, 0.23)]:
            hj = create_heim_joint(f"Heim_{side}_{h_y}_{h_z}", ball_radius=0.014, body_length=0.03, mat=mat_ti)
            hj.location = (sign * 0.25, h_y, h_z)
            col.objects.link(hj)
            
        out_name = f"f1_suspension_{side.lower()}_pullrod.glb"
        export_active_to_paths([
            os.path.join(PUB_F1_MODELS, out_name),
            os.path.join(PUB_F1_VEHICLES, out_name),
            os.path.join(EXPORTS_F1, out_name)
        ])

# ---------------------------------------------------------------------------
# 5. F1 Pushrod Rear Suspension (Left & Right)
# ---------------------------------------------------------------------------
def build_f1_rear_pushrod_suspension():
    for side, sx, sign in [("RL", -0.45, -1), ("RR", 0.45, 1)]:
        clear_blender_scene()
        col = ensure_collection(f"F1_Suspension_{side}_Pushrod")
        mat_cf = get_or_create_material("Suspension_Carbon_Aero", "carbon_twill")
        mat_ti = get_or_create_material("Suspension_Titanium_Parts", "titanium")
        mat_brake = get_or_create_material("Brake_Duct_Matte", "carbon_matte")
        
        upr_x = sign * 0.72
        
        # 1. Upper Forward & Aft Wishbones
        bm_uw = bmesh.new()
        bmesh.ops.create_cube(
            bm_uw, size=1.0,
            matrix=Matrix.Translation((sign * 0.46, -1.68, 0.41)) @
                   Matrix.Rotation(math.radians(-8 * sign), 4, 'Z') @
                   Matrix.Diagonal((0.46, 0.045, 0.015, 1.0))
        )
        bmesh.ops.create_cube(
            bm_uw, size=1.0,
            matrix=Matrix.Translation((sign * 0.48, -1.84, 0.41)) @
                   Matrix.Rotation(math.radians(10 * sign), 4, 'Z') @
                   Matrix.Diagonal((0.46, 0.045, 0.015, 1.0))
        )
        mesh_uw = bpy.data.meshes.new(f"{side}_Upper_Wishbones")
        bm_uw.to_mesh(mesh_uw)
        bm_uw.free()
        uw = bpy.data.objects.new(f"{side}_Upper_Wishbones", mesh_uw)
        uw.data.materials.append(mat_cf)
        col.objects.link(uw)
        apply_mesh_polish(uw, bevel_width=0.003, subsurf_levels=1)
        
        # 2. Lower Wishbones
        bm_lw = bmesh.new()
        bmesh.ops.create_cube(
            bm_lw, size=1.0,
            matrix=Matrix.Translation((sign * 0.46, -1.68, 0.23)) @
                   Matrix.Rotation(math.radians(-6 * sign), 4, 'Z') @
                   Matrix.Diagonal((0.48, 0.048, 0.016, 1.0))
        )
        bmesh.ops.create_cube(
            bm_lw, size=1.0,
            matrix=Matrix.Translation((sign * 0.48, -1.84, 0.23)) @
                   Matrix.Rotation(math.radians(12 * sign), 4, 'Z') @
                   Matrix.Diagonal((0.48, 0.048, 0.016, 1.0))
        )
        mesh_lw = bpy.data.meshes.new(f"{side}_Lower_Wishbones")
        bm_lw.to_mesh(mesh_lw)
        bm_lw.free()
        lw = bpy.data.objects.new(f"{side}_Lower_Wishbones", mesh_lw)
        lw.data.materials.append(mat_cf)
        col.objects.link(lw)
        apply_mesh_polish(lw, bevel_width=0.003, subsurf_levels=1)
        
        # 3. Diagonal Pushrod Strut (runs from bottom of upright up to gearbox top rocker)
        bm_pr = bmesh.new()
        bmesh_create_cylinder(
            bm_pr, radius=0.012, depth=0.52, segments=24, cap_ends=True,
            matrix=Matrix.Translation((sign * 0.44, -1.78, 0.35)) @
                   Matrix.Rotation(math.radians(-26 * sign), 4, 'Y')
        )
        # Hex adjuster turnbuckle
        bmesh_create_cylinder(
            bm_pr, radius=0.016, depth=0.035, segments=6, cap_ends=True,
            matrix=Matrix.Translation((sign * 0.44, -1.78, 0.35)) @
                   Matrix.Rotation(math.radians(-26 * sign), 4, 'Y')
        )
        mesh_pr = bpy.data.meshes.new(f"{side}_Pushrod_Strut")
        bm_pr.to_mesh(mesh_pr)
        bm_pr.free()
        pr = bpy.data.objects.new(f"{side}_Pushrod_Strut", mesh_pr)
        pr.data.materials.append(mat_ti)
        col.objects.link(pr)
        apply_mesh_polish(pr, bevel_width=0.0015)
        
        # 4. Rear Knuckle Upright & Hub Spindle
        bm_up = bmesh.new()
        bmesh.ops.create_cube(
            bm_up, size=1.0,
            matrix=Matrix.Translation((upr_x, -1.80, 0.34)) @ Matrix.Diagonal((0.08, 0.16, 0.28, 1.0))
        )
        bmesh_create_cylinder(
            bm_up, radius=0.038, depth=0.12, segments=32, cap_ends=True,
            matrix=Matrix.Translation((upr_x + sign * 0.05, -1.80, 0.34)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        mesh_up = bpy.data.meshes.new(f"{side}_Upright_Spindle")
        bm_up.to_mesh(mesh_up)
        bm_up.free()
        up = bpy.data.objects.new(f"{side}_Upright_Spindle", mesh_up)
        up.data.materials.append(mat_ti)
        col.objects.link(up)
        apply_mesh_polish(up, bevel_width=0.003, subsurf_levels=1)
        
        # 5. Rear Brake Cooling Scoop
        bm_bk = bmesh.new()
        bmesh.ops.create_cube(
            bm_bk, size=1.0,
            matrix=Matrix.Translation((upr_x - sign * 0.04, -1.74, 0.36)) @ Matrix.Diagonal((0.065, 0.12, 0.18, 1.0))
        )
        mesh_bk = bpy.data.meshes.new(f"{side}_Brake_Scoop")
        bm_bk.to_mesh(mesh_bk)
        bm_bk.free()
        bk = bpy.data.objects.new(f"{side}_Brake_Scoop", mesh_bk)
        bk.data.materials.append(mat_brake)
        col.objects.link(bk)
        apply_mesh_polish(bk, bevel_width=0.002, subsurf_levels=1)
        
        # 6. Heim Rod Ends (4 joints)
        for h_y, h_z in [(-1.68, 0.41), (-1.88, 0.41), (-1.68, 0.23), (-1.84, 0.23)]:
            hj = create_heim_joint(f"Heim_{side}_{h_y}_{h_z}", ball_radius=0.014, body_length=0.03, mat=mat_ti)
            hj.location = (sign * 0.22, h_y, h_z)
            col.objects.link(hj)
            
        out_name = f"f1_suspension_{side.lower()}_pushrod.glb"
        export_active_to_paths([
            os.path.join(PUB_F1_MODELS, out_name),
            os.path.join(PUB_F1_VEHICLES, out_name),
            os.path.join(EXPORTS_F1, out_name)
        ])

# ---------------------------------------------------------------------------
# 6. F1 Carbon8 Longitudinal Gearbox & Rain Light
# ---------------------------------------------------------------------------
def build_f1_gearbox_carbon8():
    clear_blender_scene()
    col = ensure_collection("F1_Gearbox_Carbon8")
    mat_cf = get_or_create_material("Gearbox_Carbon_Titanium", "carbon_twill")
    mat_ti = get_or_create_material("Gearbox_Billet_Mounts", "titanium")
    mat_rain = get_or_create_material("FIA_Rain_Light_LED", "led_red")
    mat_lens = get_or_create_material("FIA_Rain_Lens", "optical_lens")
    
    # 1. 8-Speed Longitudinal Carbon Fiber Gearcase
    bm = bmesh.new()
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0.0, -1.45, 0.32)) @ Matrix.Diagonal((0.36, 0.64, 0.34, 1.0))
    )
    # Gearbox mounting bell flange to engine block
    bmesh_create_cylinder(
        bm, radius=0.20, depth=0.04, segments=32, cap_ends=True,
        matrix=Matrix.Translation((0.0, -1.12, 0.32)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    # Differential side output housings
    for sx in [-0.20, 0.20]:
        bmesh_create_cylinder(
            bm, radius=0.065, depth=0.08, segments=32, cap_ends=True,
            matrix=Matrix.Translation((sx, -1.65, 0.28)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
    mesh = bpy.data.meshes.new("Gearbox_Main_Case")
    bm.to_mesh(mesh)
    bm.free()
    case = bpy.data.objects.new("Gearbox_Main_Case", mesh)
    case.data.materials.append(mat_cf)
    col.objects.link(case)
    apply_mesh_polish(case, bevel_width=0.008, subsurf_levels=1)
    
    # 2. Rear Impact Attenuator Crash Structure
    bm_c = bmesh.new()
    bmesh.ops.create_cube(
        bm_c, size=1.0,
        matrix=Matrix.Translation((0.0, -2.05, 0.28)) @ Matrix.Diagonal((0.18, 0.58, 0.18, 1.0))
    )
    # Accordion crush triggers
    for cry in [-1.90, -2.05, -2.20]:
        bmesh.ops.create_cube(
            bm_c, size=1.0,
            matrix=Matrix.Translation((0.0, cry, 0.28)) @ Matrix.Diagonal((0.19, 0.02, 0.19, 1.0))
        )
    mesh_c = bpy.data.meshes.new("Rear_Crash_Structure")
    bm_c.to_mesh(mesh_c)
    bm_c.free()
    crash = bpy.data.objects.new("Rear_Crash_Structure", mesh_c)
    crash.data.materials.append(mat_cf)
    col.objects.link(crash)
    apply_mesh_polish(crash, bevel_width=0.004, subsurf_levels=1)
    
    # 3. High-Intensity FIA Red LED Rain Light Assembly
    bm_r = bmesh.new()
    # Light bezel
    bmesh.ops.create_cube(
        bm_r, size=1.0,
        matrix=Matrix.Translation((0.0, -2.36, 0.28)) @ Matrix.Diagonal((0.11, 0.025, 0.075, 1.0))
    )
    # 15x LED Emitter chips (3 rows x 5 columns)
    for row in range(3):
        for c in range(5):
            lx = -0.04 + c * 0.02
            lz = 0.26 + row * 0.02
            bmesh_create_cylinder(
                bm_r, radius=0.004, depth=0.006, segments=12, cap_ends=True,
                matrix=Matrix.Translation((lx, -2.375, lz)) @ Matrix.Rotation(math.radians(90), 4, 'X')
            )
    mesh_r = bpy.data.meshes.new("FIA_Rain_Light_Core")
    bm_r.to_mesh(mesh_r)
    bm_r.free()
    rain = bpy.data.objects.new("FIA_Rain_Light_Core", mesh_r)
    rain.data.materials.append(mat_rain)
    col.objects.link(rain)
    
    # Outer Polycarbonate Fluted Diffuser Lens
    bm_rl = bmesh.new()
    bmesh.ops.create_cube(
        bm_rl, size=1.0,
        matrix=Matrix.Translation((0.0, -2.38, 0.28)) @ Matrix.Diagonal((0.115, 0.008, 0.08, 1.0))
    )
    mesh_rl = bpy.data.meshes.new("FIA_Rain_Lens")
    bm_rl.to_mesh(mesh_rl)
    bm_rl.free()
    lens = bpy.data.objects.new("FIA_Rain_Lens", mesh_rl)
    lens.data.materials.append(mat_lens)
    col.objects.link(lens)
    apply_mesh_polish(lens, bevel_width=0.001)
    
    # 4. Top Suspension Rocker Pivot Mounting Cleats
    for px in [-0.10, 0.10]:
        for py in [-1.40, -1.55]:
            b = create_hex_bolt(f"Rocker_Bolt_{px}_{py}", radius=0.008, height=0.012, mat=mat_ti)
            b.location = (px, py, 0.49)
            col.objects.link(b)
            
    export_active_to_paths([
        os.path.join(PUB_F1_MODELS, "f1_gearbox_carbon8.glb"),
        os.path.join(PUB_F1_VEHICLES, "f1_gearbox_carbon8.glb"),
        os.path.join(EXPORTS_F1, "f1_gearbox_carbon8.glb")
    ])

# ---------------------------------------------------------------------------
# 7. F1 Grade 5 Titanium Safety Halo
# ---------------------------------------------------------------------------
def build_f1_halo_grade5():
    clear_blender_scene()
    col = ensure_collection("F1_Halo_Grade5")
    mat_ti = get_or_create_material("Grade5_Titanium_Core", "titanium")
    mat_cf = get_or_create_material("Halo_Aero_Fairing", "carbon_twill")
    
    # 1. Forward Center Wishbone Strut (hollow Grade 5 Titanium)
    bm_c = bmesh.new()
    bmesh_create_cylinder(
        bm_c, radius=0.024, depth=0.28, segments=32, cap_ends=True,
        matrix=Matrix.Translation((0.0, 0.35, 0.58)) @ Matrix.Rotation(math.radians(-32), 4, 'X')
    )
    # Forward chassis mounting clevis
    bmesh.ops.create_cube(
        bm_c, size=1.0,
        matrix=Matrix.Translation((0.0, 0.46, 0.46)) @ Matrix.Diagonal((0.075, 0.08, 0.07, 1.0))
    )
    mesh_c = bpy.data.meshes.new("Halo_Center_Strut")
    bm_c.to_mesh(mesh_c)
    bm_c.free()
    cstrut = bpy.data.objects.new("Halo_Center_Strut", mesh_c)
    cstrut.data.materials.append(mat_ti)
    col.objects.link(cstrut)
    apply_mesh_polish(cstrut, bevel_width=0.004, subsurf_levels=1)
    
    # 2. Outer Halo Loop Ring & Aerodynamic Boundary Fairing
    bm_loop = bmesh.new()
    # Curved forward apex arch
    bmesh_create_cylinder(
        bm_loop, radius=0.24, depth=0.038, segments=48, cap_ends=True,
        matrix=Matrix.Translation((0.0, 0.12, 0.68)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    # Left & Right rearward reaching hoop spars
    for sx in [-0.25, 0.25]:
        bmesh_create_cylinder(
            bm_loop, radius=0.026, depth=0.48, segments=32, cap_ends=True,
            matrix=Matrix.Translation((sx, -0.16, 0.64)) @ Matrix.Rotation(math.radians(16), 4, 'X')
        )
        # Rear chassis mounting pad
        bmesh.ops.create_cube(
            bm_loop, size=1.0,
            matrix=Matrix.Translation((sx, -0.34, 0.58)) @ Matrix.Diagonal((0.08, 0.08, 0.065, 1.0))
        )
    # Aerodynamic carbon trip vanes along upper surface
    for vx in [-0.18, -0.09, 0.0, 0.09, 0.18]:
        bmesh.ops.create_cube(
            bm_loop, size=1.0,
            matrix=Matrix.Translation((vx, 0.11, 0.71)) @ Matrix.Diagonal((0.008, 0.025, 0.012, 1.0))
        )
    mesh_loop = bpy.data.meshes.new("Halo_Hoop_And_Fairing")
    bm_loop.to_mesh(mesh_loop)
    bm_loop.free()
    loop = bpy.data.objects.new("Halo_Hoop_And_Fairing", mesh_loop)
    loop.data.materials.append(mat_cf)
    col.objects.link(loop)
    apply_mesh_polish(loop, bevel_width=0.003, subsurf_levels=1)
    
    # 3. High-Strength Titanium M14 Mounting Hardware (Forward & Rear Lugs)
    b_fwd = create_socket_head_cap_screw("Halo_Bolt_Fwd", radius=0.008, height=0.015, mat=mat_ti)
    b_fwd.location = (0.0, 0.46, 0.50)
    col.objects.link(b_fwd)
    for sx in [-0.25, 0.25]:
        b_rear = create_socket_head_cap_screw(f"Halo_Bolt_Rear_{sx}", radius=0.008, height=0.015, mat=mat_ti)
        b_rear.location = (sx, -0.34, 0.62)
        col.objects.link(b_rear)
        
    export_active_to_paths([
        os.path.join(PUB_F1_MODELS, "f1_halo_grade5.glb"),
        os.path.join(PUB_F1_VEHICLES, "f1_halo_grade5.glb"),
        os.path.join(EXPORTS_F1, "f1_halo_grade5.glb")
    ])

# ---------------------------------------------------------------------------
# 8. GT3 Hypercar Rocker Skirts (Left & Right)
# ---------------------------------------------------------------------------
def build_hypercar_rocker_skirts():
    tf = 1.66 / 2
    wb = 2.70
    rh = 0.10
    
    for side, sx, sign in [("Left", -tf * 0.94, -1), ("Right", tf * 0.94, 1)]:
        clear_blender_scene()
        col = ensure_collection(f"Hypercar_Rocker_Skirt_{side}")
        mat_cf = get_or_create_material("Skirt_Carbon_Twill", "carbon_twill")
        mat_ti = get_or_create_material("Skirt_Titanium_Fasteners", "titanium")
        
        # 1. Full-Length Sculpted Carbon Rocker Blade
        bm = bmesh.new()
        # Longitudinal carbon sill beam
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx, 0.0, rh + 0.035)) @ Matrix.Diagonal((0.14, wb * 0.78, 0.055, 1.0))
        )
        # Underside ground-effect vortex drop fence
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx + sign * 0.04, 0.0, rh + 0.010)) @ Matrix.Diagonal((0.012, wb * 0.76, 0.040, 1.0))
        )
        # Rear tire wake deflector flick / winglet
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx, -(wb * 0.36), rh + 0.09)) @
                   Matrix.Rotation(math.radians(-14 * sign), 4, 'Y') @
                   Matrix.Diagonal((0.065, 0.22, 0.14, 1.0))
        )
        # Front wheel air-relief extraction cove
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx, wb * 0.32, rh + 0.06)) @
                   Matrix.Rotation(math.radians(16 * sign), 4, 'Y') @
                   Matrix.Diagonal((0.055, 0.18, 0.08, 1.0))
        )
        mesh = bpy.data.meshes.new(f"Skirt_Body_{side}")
        bm.to_mesh(mesh)
        bm.free()
        skirt = bpy.data.objects.new(f"Skirt_Body_{side}", mesh)
        skirt.data.materials.append(mat_cf)
        col.objects.link(skirt)
        apply_mesh_polish(skirt, bevel_width=0.004, subsurf_levels=1)
        
        # 2. Countersunk Titanium Fasteners along Sill Flange (8 bolts)
        for bi in range(8):
            by = -(wb * 0.35) + bi * (wb * 0.70 / 7.0)
            b = create_socket_head_cap_screw(f"Fastener_{side}_{bi}", radius=0.0035, height=0.005, mat=mat_ti)
            b.location = (sx - sign * 0.035, by, rh + 0.065)
            col.objects.link(b)
            
        out_name = f"hypercar_rocker_skirt_{side.lower()}.glb"
        export_active_to_paths([
            os.path.join(PUB_GT3_MODELS, out_name),
            os.path.join(PUB_GT3_VEHICLES, out_name),
            os.path.join(EXPORTS_GT3, out_name)
        ])

# ---------------------------------------------------------------------------
# 9. GT3 Hypercar Rear Haunches (Left & Right)
# ---------------------------------------------------------------------------
def build_hypercar_rear_haunches():
    tr = 1.71 / 2
    wb = 2.70
    rh = 0.10
    
    for side, sx, sign in [("Left", -tr * 0.98, -1), ("Right", tr * 0.98, 1)]:
        clear_blender_scene()
        col = ensure_collection(f"Hypercar_Rear_Haunch_{side}")
        mat_paint = get_or_create_material("Haunch_Paint_Rosso", "anodized_red")
        mat_cf = get_or_create_material("Haunch_Carbon_Trim", "carbon_twill")
        mat_mesh = get_or_create_material("Haunch_Wire_Mesh", "wire_mesh")
        mat_cap = get_or_create_material("Billet_Fuel_Cap", "billet_aluminum")
        
        # 1. Muscular Widebody Rear Haunch Quarter Panel
        bm = bmesh.new()
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx, -(wb * 0.50), rh + 0.38)) @ Matrix.Diagonal((0.32, 0.96, 0.48, 1.0))
        )
        # Flared wheel arch blister
        bmesh_create_cylinder(
            bm, radius=0.44, depth=0.10, segments=36, cap_ends=True,
            matrix=Matrix.Translation((sx + sign * 0.04, -(wb * 0.50), rh + 0.38)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        mesh = bpy.data.meshes.new(f"Haunch_Panel_{side}")
        bm.to_mesh(mesh)
        bm.free()
        haunch = bpy.data.objects.new(f"Haunch_Panel_{side}", mesh)
        haunch.data.materials.append(mat_paint)
        col.objects.link(haunch)
        apply_mesh_polish(haunch, bevel_width=0.012, subsurf_levels=1)
        
        # 2. Carbon Intercooler Air Intake Scoop with Hexagonal Wire Mesh
        bm_sc = bmesh.new()
        bmesh.ops.create_cube(
            bm_sc, size=1.0,
            matrix=Matrix.Translation((sx - sign * 0.06, -(wb * 0.28), rh + 0.40)) @ Matrix.Diagonal((0.14, 0.24, 0.26, 1.0))
        )
        mesh_sc = bpy.data.meshes.new(f"Scoop_Duct_{side}")
        bm_sc.to_mesh(mesh_sc)
        bm_sc.free()
        scoop = bpy.data.objects.new(f"Scoop_Duct_{side}", mesh_sc)
        scoop.data.materials.append(mat_cf)
        col.objects.link(scoop)
        apply_mesh_polish(scoop, bevel_width=0.004, subsurf_levels=1)
        
        # Mesh screen insert in scoop
        bm_m = bmesh.new()
        bmesh.ops.create_cube(
            bm_m, size=1.0,
            matrix=Matrix.Translation((sx - sign * 0.05, -(wb * 0.26), rh + 0.40)) @ Matrix.Diagonal((0.12, 0.010, 0.22, 1.0))
        )
        mesh_m = bpy.data.meshes.new(f"Scoop_Mesh_{side}")
        bm_m.to_mesh(mesh_m)
        bm_m.free()
        sm = bpy.data.objects.new(f"Scoop_Mesh_{side}", mesh_m)
        sm.data.materials.append(mat_mesh)
        col.objects.link(sm)
        
        # 3. Upper Wheel Arch Ventilation Louvers (5 aerodynamic slits)
        for li in range(5):
            ly = -(wb * 0.44) - (li * 0.045)
            bm_l = bmesh.new()
            bmesh.ops.create_cube(
                bm_l, size=1.0,
                matrix=Matrix.Translation((sx + sign * 0.02, ly, rh + 0.62)) @
                       Matrix.Rotation(math.radians(-24), 4, 'X') @
                       Matrix.Diagonal((0.12, 0.030, 0.008, 1.0))
            )
            mesh_l = bpy.data.meshes.new(f"Louver_{side}_{li}")
            bm_l.to_mesh(mesh_l)
            bm_l.free()
            louv = bpy.data.objects.new(f"Louver_{side}_{li}", mesh_l)
            louv.data.materials.append(mat_cf)
            col.objects.link(louv)
            apply_mesh_polish(louv, bevel_width=0.001)
            
        # 4. CNC Billet Aluminum Fuel Filler Door / Cap
        bm_cap = bmesh.new()
        bmesh_create_cylinder(
            bm_cap, radius=0.042, depth=0.012, segments=32, cap_ends=True,
            matrix=Matrix.Translation((sx + sign * 0.02, -(wb * 0.42), rh + 0.58)) @ Matrix.Rotation(math.radians(18 * sign), 4, 'Y')
        )
        # Knurled perimeter notch ring
        bmesh_create_cylinder(
            bm_cap, radius=0.034, depth=0.016, segments=24, cap_ends=True,
            matrix=Matrix.Translation((sx + sign * 0.02, -(wb * 0.42), rh + 0.58)) @ Matrix.Rotation(math.radians(18 * sign), 4, 'Y')
        )
        mesh_cap = bpy.data.meshes.new(f"Fuel_Cap_{side}")
        bm_cap.to_mesh(mesh_cap)
        bm_cap.free()
        cap = bpy.data.objects.new(f"Fuel_Cap_{side}", mesh_cap)
        cap.data.materials.append(mat_cap)
        col.objects.link(cap)
        apply_mesh_polish(cap, bevel_width=0.002)
        
        out_name = f"hypercar_rear_haunch_{side.lower()}.glb"
        export_active_to_paths([
            os.path.join(PUB_GT3_MODELS, out_name),
            os.path.join(PUB_GT3_VEHICLES, out_name),
            os.path.join(EXPORTS_GT3, out_name)
        ])

# ===========================================================================
# MAIN ENTRYPOINT
# ===========================================================================
if __name__ == "__main__":
    log("Starting comprehensive upgrade of remaining F1 and Hypercar assets...")
    
    # Formula 1 Assets
    build_f1_nose_wide()
    build_f1_monocoque_m55j()
    build_f1_floor_antiporpoise()
    build_f1_front_pullrod_suspension()
    build_f1_rear_pushrod_suspension()
    build_f1_gearbox_carbon8()
    build_f1_halo_grade5()
    
    # GT3 Hypercar Assets
    build_hypercar_rocker_skirts()
    build_hypercar_rear_haunches()
    
    log("[COMPLETE] All target F1 and Hypercar assets upgraded with high-density CAD geometry!")
