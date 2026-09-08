"""
==============================================================================
EXTERIOR ANCILLARIES HIGH-MESH CAD UPGRADE PIPELINE (BLENDER 5.2 LTS)
==============================================================================
Upgrades 18 low-poly exterior assets from low-poly primitives to high-mesh
automotive CAD geometry with complete PBR shaders:
- grille.glb (honeycomb cell array + carbon surround bezel + mounting studs)
- canards.glb (dual-tier airfoil diveplanes + titanium endplates + bracket bolts)
- crash_boxes.glb (progressive accordion crush-structure + bulkhead mount flanges)
- cockpit_camera_monitors.glb (aerodynamic mirror cams + OLED display pods + lenses)
- hood_naca_radiator_screens.glb (NACA intake ramps + fine wire mesh screen + rivets)
- side_glass.glb (aerodynamic curved glass + black ceramic frit borders + channel seal)
- roof_panel.glb (double-bubble carbon roof + shark-fin GPS antenna + roof rails)
- trunk_decklid.glb (sculpted trunk + ducktail spoiler + license plate recess)
- firewall_bulkhead.glb (stamped aluminum firewall + structural swage ribs + gold heatshield)
- floor_pan.glb (full flat-bottom underbody + Venturi tunnels + skid blocks + strakes)
- auxiliary_coolers.glb (twin oil/trans coolers + micro-fin core + AN-10 braided lines)
- rocker_panels.glb (sculpted aerodynamic side skirts + vortex ground effect shelf)
- roll_cage.glb (FIA tubular chromoly cage + gusset plates + baseplate bolts)
- door_handles.glb (flush electronic pop-out handles + LED ambient glow + latch)
- rear_quarters.glb (sculpted widebody haunches + fuel filler door + liner flanges)
- vents.glb (airflow extraction fender louvers + rear brake cooling duct slats)
- rear_window.glb (aerodynamic rear glass + defroster grid lines + CHMSL cutout)
- wipers.glb (dual articulated pantograph arms + aerodynamic spoilers + rubber blades)
==============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# Import our CAD geometry library
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.append(SCRIPT_DIR)

from generators.cad_geometry_library import (
    clear_blender_scene, ensure_collection, get_or_create_material,
    create_hex_bolt, create_cooling_fin_array, create_honeycomb_mesh,
    bmesh_create_cylinder, apply_mesh_polish
)

PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
EXTERIOR_DIR = os.path.join(PROJECT_ROOT, "public", "models", "exterior")

def log(msg):
    print(f"[EXTERIOR_UPGRADE] {msg}")

def export_active_scene(out_path):
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_yup=True
    )
    v_count = sum(len(o.data.vertices) for o in bpy.data.objects if o.type == 'MESH')
    log(f"Exported -> {os.path.basename(out_path)} ({v_count:,} vertices)")

# ---------------------------------------------------------------------------
# 1. Grille (was 78 verts -> target 8,000+ verts)
# ---------------------------------------------------------------------------
def build_grille():
    clear_blender_scene()
    col = ensure_collection("Grille")
    mat_cf = get_or_create_material("Exposed_Carbon_Fiber_Twill", "carbon_twill")
    mat_mesh = get_or_create_material("Grille_Wire_Mesh", "wire_mesh")
    mat_metal = get_or_create_material("Hardware_Titanium", "titanium")
    
    # Honeycomb center core
    honeycomb = create_honeycomb_mesh("Grille_Honeycomb_Core", width=0.85, height=0.28, cell_size=0.016, thickness=0.012, mat=mat_mesh)
    col.objects.link(honeycomb)
    
    # Outer aerodynamic carbon surround bezel with filleted contour
    bm = bmesh.new()
    # Outer frame
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((0, 0, 0)) @ Matrix.Diagonal((0.92, 0.035, 0.34, 1.0)))
    # Inner cutout bevel
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((0, 0.01, 0)) @ Matrix.Diagonal((0.87, 0.05, 0.29, 1.0)))
    
    # Central aerodynamic horizontal splitter blade
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((0, -0.01, 0)) @ Matrix.Diagonal((0.84, 0.04, 0.014, 1.0)))
    # Radar sensor / badge mounting pod
    bmesh_create_cylinder(bm, radius=0.045, depth=0.02, segments=32, cap_ends=True,
                           matrix=Matrix.Translation((0, -0.015, 0)) @ Matrix.Rotation(math.radians(90), 4, 'X'))
                              
    mesh = bpy.data.meshes.new("Grille_Carbon_Bezel")
    bm.to_mesh(mesh)
    bm.free()
    bezel = bpy.data.objects.new("Grille_Carbon_Bezel", mesh)
    bezel.data.materials.append(mat_cf)
    col.objects.link(bezel)
    apply_mesh_polish(bezel, bevel_width=0.005)
    
    # Mounting bracket fasteners along perimeter
    for x in [-0.40, -0.20, 0.20, 0.40]:
        for z in [-0.14, 0.14]:
            bolt = create_hex_bolt(f"Bolt_{x}_{z}", radius=0.004, height=0.004, flange_radius=0.007, mat=mat_metal)
            bolt.location = (x, 0.02, z)
            bolt.rotation_euler = (math.radians(90), 0, 0)
            col.objects.link(bolt)
            
    export_active_scene(os.path.join(EXTERIOR_DIR, "grille.glb"))

# ---------------------------------------------------------------------------
# 2. Canards (was 312 verts -> target 8,000+ verts)
# ---------------------------------------------------------------------------
def build_canards():
    clear_blender_scene()
    col = ensure_collection("Canards")
    mat_cf = get_or_create_material("Carbon_Canard_Aero", "carbon_twill")
    mat_ti = get_or_create_material("Hardware_Titanium", "titanium")
    
    for side, sx in [("Left", 1.0), ("Right", -1.0)]:
        # Upper & Lower diveplanes
        for tier, y_off, z_off, scale in [("Upper", 0.0, 0.08, 0.85), ("Lower", -0.05, -0.04, 1.0)]:
            bm = bmesh.new()
            segments = 24
            span = 0.22 * scale
            chord = 0.14 * scale
            for i in range(segments):
                t = i / (segments - 1)
                x = sx * (0.80 + t * span)
                camber = math.sin(t * math.pi) * 0.025
                z = z_off + camber + (t * 0.03)
                y = 1.95 + y_off - (t * 0.08)
                
                bmesh.ops.create_cube(
                    bm, size=1.0,
                    matrix=Matrix.Translation((x, y, z)) @ 
                           Matrix.Rotation(math.radians(-15 * sx), 4, 'Y') @
                           Matrix.Diagonal((0.012, chord, 0.005, 1.0))
                )
            # Endplate vertical vortex fence
            ep_x = sx * (0.80 + span)
            bmesh.ops.create_cube(
                bm, size=1.0,
                matrix=Matrix.Translation((ep_x, 1.95 + y_off - 0.04, z_off + 0.03)) @
                       Matrix.Diagonal((0.006, 0.16 * scale, 0.07 * scale, 1.0))
            )
            mesh = bpy.data.meshes.new(f"Canard_{side}_{tier}")
            bm.to_mesh(mesh)
            bm.free()
            obj = bpy.data.objects.new(f"Canard_{side}_{tier}", mesh)
            obj.data.materials.append(mat_cf)
            col.objects.link(obj)
            apply_mesh_polish(obj, bevel_width=0.003)
            
            # Titanium mounting stanchion brackets with dual bolts
            for bx in [0.82, 0.92]:
                stanchion = create_hex_bolt(f"Bolt_{side}_{tier}_{bx}", radius=0.004, height=0.004, mat=mat_ti)
                stanchion.location = (sx * bx, 1.95 + y_off, z_off - 0.01)
                stanchion.rotation_euler = (math.radians(-90), 0, 0)
                col.objects.link(stanchion)
                
    export_active_scene(os.path.join(EXTERIOR_DIR, "canards.glb"))

# ---------------------------------------------------------------------------
# 3. Crash Boxes (was 312 verts -> target 8,000+ verts)
# ---------------------------------------------------------------------------
def build_crash_boxes():
    clear_blender_scene()
    col = ensure_collection("CrashBoxes")
    mat_al = get_or_create_material("Extruded_Aluminum_Alloy", "cast_aluminum")
    mat_ti = get_or_create_material("Hardware_Titanium", "titanium")
    
    for side, sx in [("Left", 0.45), ("Right", -0.45)]:
        bm = bmesh.new()
        rib_count = 10
        box_len = 0.35
        for i in range(rib_count):
            t = i / (rib_count - 1)
            y = 2.05 + t * box_len
            w = 0.14 - t * 0.03
            h = 0.12 - t * 0.02
            ridge = 0.008 if (i % 2 == 0) else -0.004
            bmesh.ops.create_cube(
                bm, size=1.0,
                matrix=Matrix.Translation((sx, y, 0.28)) @ Matrix.Diagonal((w + ridge, box_len / rib_count * 0.9, h + ridge, 1.0))
            )
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx, 2.04, 0.28)) @ Matrix.Diagonal((0.20, 0.018, 0.18, 1.0))
        )
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx, 2.05 + box_len, 0.28)) @ Matrix.Diagonal((0.13, 0.015, 0.11, 1.0))
        )
        mesh = bpy.data.meshes.new(f"CrashBox_Extrusion_{side}")
        bm.to_mesh(mesh)
        bm.free()
        box_obj = bpy.data.objects.new(f"CrashBox_Extrusion_{side}", mesh)
        box_obj.data.materials.append(mat_al)
        col.objects.link(box_obj)
        apply_mesh_polish(box_obj, bevel_width=0.003)
        
        for dx, dz in [(-0.07, -0.06), (0.07, -0.06), (-0.07, 0.06), (0.07, 0.06)]:
            b = create_hex_bolt(f"Bolt_{side}_{dx}_{dz}", radius=0.006, height=0.005, flange_radius=0.010, mat=mat_ti)
            b.location = (sx + dx, 2.03, 0.28 + dz)
            b.rotation_euler = (math.radians(-90), 0, 0)
            col.objects.link(b)
            
    export_active_scene(os.path.join(EXTERIOR_DIR, "crash_boxes.glb"))

# ---------------------------------------------------------------------------
# 4. Cockpit Camera Monitors (was 344 verts -> target 10,000+ verts)
# ---------------------------------------------------------------------------
def build_cockpit_camera_monitors():
    clear_blender_scene()
    col = ensure_collection("CameraMonitors")
    mat_cf = get_or_create_material("Carbon_Camera_Pod", "carbon_twill")
    mat_glass = get_or_create_material("Camera_Optics_Lens", "optical_lens")
    mat_oled = get_or_create_material("Cockpit_OLED_Screen", "led_white")
    
    for side, sx in [("Left", 0.92), ("Right", -0.92)]:
        bm = bmesh.new()
        bmesh_create_cylinder(
            bm, radius=0.012, depth=0.14, segments=24, cap_ends=True,
            matrix=Matrix.Translation((sx * 0.94, 0.65, 0.82)) @ Matrix.Rotation(math.radians(35 * sx), 4, 'Y')
        )
        bmesh.ops.create_uvsphere(
            bm, u_segments=32, v_segments=20, radius=0.028,
            matrix=Matrix.Translation((sx, 0.62, 0.85)) @ Matrix.Diagonal((0.9, 1.8, 0.8, 1.0))
        )
        mesh = bpy.data.meshes.new(f"Camera_Pod_{side}")
        bm.to_mesh(mesh)
        bm.free()
        pod = bpy.data.objects.new(f"Camera_Pod_{side}", mesh)
        pod.data.materials.append(mat_cf)
        col.objects.link(pod)
        apply_mesh_polish(pod, bevel_width=0.003)
        
        bm_lens = bmesh.new()
        bmesh.ops.create_uvsphere(
            bm_lens, u_segments=24, v_segments=16, radius=0.014,
            matrix=Matrix.Translation((sx * 1.01, 0.58, 0.85))
        )
        bmesh_create_cylinder(
            bm_lens, radius=0.016, depth=0.006, segments=24, cap_ends=True,
            matrix=Matrix.Translation((sx * 1.01, 0.58, 0.85)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        mesh_l = bpy.data.meshes.new(f"Camera_Lens_{side}")
        bm_lens.to_mesh(mesh_l)
        bm_lens.free()
        lens = bpy.data.objects.new(f"Camera_Lens_{side}", mesh_l)
        lens.data.materials.append(mat_glass)
        col.objects.link(lens)
        
        bm_mon = bmesh.new()
        bmesh.ops.create_cube(
            bm_mon, size=1.0,
            matrix=Matrix.Translation((sx * 0.55, 0.58, 0.78)) @ 
                   Matrix.Rotation(math.radians(-25 * sx), 4, 'Z') @ 
                   Matrix.Diagonal((0.14, 0.015, 0.08, 1.0))
        )
        bmesh.ops.create_cube(
            bm_mon, size=1.0,
            matrix=Matrix.Translation((sx * 0.55, 0.575, 0.78)) @ 
                   Matrix.Rotation(math.radians(-25 * sx), 4, 'Z') @ 
                   Matrix.Diagonal((0.13, 0.002, 0.07, 1.0))
        )
        mesh_m = bpy.data.meshes.new(f"Cockpit_Monitor_{side}")
        bm_mon.to_mesh(mesh_m)
        bm_mon.free()
        mon = bpy.data.objects.new(f"Cockpit_Monitor_{side}", mesh_m)
        mon.data.materials.append(mat_oled)
        col.objects.link(mon)
        apply_mesh_polish(mon, bevel_width=0.002)
        
    export_active_scene(os.path.join(EXTERIOR_DIR, "cockpit_camera_monitors.glb"))

# ---------------------------------------------------------------------------
# 5. Hood NACA Radiator Screens (was 464 verts -> target 8,000+ verts)
# ---------------------------------------------------------------------------
def build_naca_screens():
    clear_blender_scene()
    col = ensure_collection("NACA_Screens")
    mat_cf = get_or_create_material("Carbon_Hood_Louver", "carbon_twill")
    mat_mesh = get_or_create_material("Radiator_Wire_Mesh", "wire_mesh")
    mat_ti = get_or_create_material("Hardware_Titanium", "titanium")
    
    for side, sx in [("Left", 0.28), ("Right", -0.28)]:
        bm = bmesh.new()
        ramp_len = 0.32
        ramp_w = 0.14
        segments = 16
        for i in range(segments):
            t = i / (segments - 1)
            y = 1.20 - t * ramp_len
            w = 0.04 + (t**1.8) * (ramp_w - 0.04)
            depth = (t**1.5) * 0.045
            bmesh.ops.create_cube(
                bm, size=1.0,
                matrix=Matrix.Translation((sx, y, 0.76 - depth * 0.5)) @ Matrix.Diagonal((w, ramp_len / segments * 1.1, depth + 0.005, 1.0))
            )
        mesh_d = bpy.data.meshes.new(f"NACA_Duct_{side}")
        bm.to_mesh(mesh_d)
        bm.free()
        duct = bpy.data.objects.new(f"NACA_Duct_{side}", mesh_d)
        duct.data.materials.append(mat_cf)
        col.objects.link(duct)
        apply_mesh_polish(duct, bevel_width=0.003)
        
        screen = create_honeycomb_mesh(f"NACA_Screen_{side}", width=ramp_w * 0.9, height=0.04, cell_size=0.008, thickness=0.004, mat=mat_mesh)
        screen.location = (sx, 1.20 - ramp_len, 0.72)
        screen.rotation_euler = (math.radians(-30), 0, 0)
        col.objects.link(screen)
        
        for ry in [1.18, 1.08, 0.98, 0.90]:
            rivet = create_hex_bolt(f"Rivet_{side}_{ry}", radius=0.0025, height=0.002, flange_radius=0.004, mat=mat_ti)
            rivet.location = (sx + (ramp_w * 0.55 if sx > 0 else -ramp_w * 0.55), ry, 0.765)
            rivet.rotation_euler = (0, 0, 0)
            col.objects.link(rivet)
            
    export_active_scene(os.path.join(EXTERIOR_DIR, "hood_naca_radiator_screens.glb"))

# ---------------------------------------------------------------------------
# 6. Side Glass (was 468 verts -> target 12,000+ verts)
# ---------------------------------------------------------------------------
def build_side_glass():
    clear_blender_scene()
    col = ensure_collection("SideGlass")
    mat_glass = get_or_create_material("Optic_Side_Glazing", "optical_glass")
    mat_trim = get_or_create_material("Shadowline_Gloss_Trim", "carbon_twill")
    
    for side, sx in [("Left", 0.78), ("Right", -0.78)]:
        bm = bmesh.new()
        segments = 32
        length = 0.95
        for i in range(segments):
            t = i / (segments - 1)
            y = 0.75 - t * length
            z_top = 1.18 - (t * 0.06)
            z_bot = 0.82 + (t * 0.04)
            h = z_top - z_bot
            z_mid = (z_top + z_bot) * 0.5
            tumblehome = math.sin(t * math.pi) * 0.02
            x = sx - (tumblehome * (1.0 if sx > 0 else -1.0))
            
            bmesh.ops.create_cube(
                bm, size=1.0,
                matrix=Matrix.Translation((x, y, z_mid)) @ 
                       Matrix.Rotation(math.radians(-12 * (1 if sx > 0 else -1)), 4, 'Y') @
                       Matrix.Diagonal((0.004, length / segments * 1.05, h, 1.0))
            )
        for j in range(16):
            t = j / 15.0
            y = -0.25 - t * 0.45
            z_top = 1.12 - (t * 0.15)
            z_bot = 0.86 + (t * 0.05)
            h = max(0.04, z_top - z_bot)
            z_mid = (z_top + z_bot) * 0.5
            x = sx * 0.96
            bmesh.ops.create_cube(
                bm, size=1.0,
                matrix=Matrix.Translation((x, y, z_mid)) @
                       Matrix.Rotation(math.radians(-14 * (1 if sx > 0 else -1)), 4, 'Y') @
                       Matrix.Diagonal((0.004, 0.45 / 16.0 * 1.05, h, 1.0))
            )
        mesh_g = bpy.data.meshes.new(f"Side_Glass_Pane_{side}")
        bm.to_mesh(mesh_g)
        bm.free()
        glass = bpy.data.objects.new(f"Side_Glass_Pane_{side}", mesh_g)
        glass.data.materials.append(mat_glass)
        col.objects.link(glass)
        apply_mesh_polish(glass, bevel_width=0.002)
        
        bm_frit = bmesh.new()
        bmesh_create_cylinder(
            bm_frit, radius=0.008, depth=1.45, segments=24, cap_ends=True,
            matrix=Matrix.Translation((sx, 0.05, 0.82)) @ Matrix.Rotation(math.radians(90), 4, 'X')
        )
        bmesh_create_cylinder(
            bm_frit, radius=0.007, depth=1.45, segments=24, cap_ends=True,
            matrix=Matrix.Translation((sx * 0.90, 0.05, 1.16)) @ Matrix.Rotation(math.radians(90), 4, 'X')
        )
        mesh_f = bpy.data.meshes.new(f"Window_Trim_Channel_{side}")
        bm_frit.to_mesh(mesh_f)
        bm_frit.free()
        trim = bpy.data.objects.new(f"Window_Trim_Channel_{side}", mesh_f)
        trim.data.materials.append(mat_trim)
        col.objects.link(trim)
        apply_mesh_polish(trim, bevel_width=0.002)
        
    export_active_scene(os.path.join(EXTERIOR_DIR, "side_glass.glb"))

# ---------------------------------------------------------------------------
# 7. Roof Panel (was 488 verts -> target 15,000+ verts)
# ---------------------------------------------------------------------------
def build_roof_panel():
    clear_blender_scene()
    col = ensure_collection("RoofPanel")
    mat_cf = get_or_create_material("Exposed_Carbon_Fiber_Twill", "carbon_twill")
    
    bm = bmesh.new()
    u_slices = 32
    v_slices = 24
    roof_len = 1.40
    roof_w = 1.15
    for i in range(u_slices):
        u = i / (u_slices - 1)
        y = 0.70 - u * roof_len
        z_base = 1.28 + math.sin(u * math.pi) * 0.07
        for j in range(v_slices):
            v = j / (v_slices - 1)
            x = -roof_w * 0.5 + v * roof_w
            bubble = 0.022 * math.cos(x * math.pi * 2.0 / roof_w)**2
            center_channel = -0.015 * math.exp(-((x / 0.15)**2))
            z = z_base + bubble + center_channel
            
            bmesh.ops.create_cube(
                bm, size=1.0,
                matrix=Matrix.Translation((x, y, z)) @ Matrix.Diagonal((roof_w / v_slices * 1.05, roof_len / u_slices * 1.05, 0.006, 1.0))
            )
            
    bmesh_create_cylinder(
        bm, radius=0.014, depth=0.18, segments=24, cap_ends=True,
        matrix=Matrix.Translation((0, -0.45, 1.37)) @ 
               Matrix.Rotation(math.radians(-25), 4, 'X') @
               Matrix.Diagonal((0.4, 1.0, 1.0, 1.0))
    )
    for sx in [-roof_w * 0.49, roof_w * 0.49]:
        bmesh_create_cylinder(
            bm, radius=0.008, depth=roof_len * 0.95, segments=24, cap_ends=True,
            matrix=Matrix.Translation((sx, 0.0, 1.27)) @ Matrix.Rotation(math.radians(90), 4, 'X')
        )
        
    mesh = bpy.data.meshes.new("Roof_Panel_Carbon_Skin")
    bm.to_mesh(mesh)
    bm.free()
    roof = bpy.data.objects.new("Roof_Panel_Carbon_Skin", mesh)
    roof.data.materials.append(mat_cf)
    col.objects.link(roof)
    apply_mesh_polish(roof, bevel_width=0.004)
    
    export_active_scene(os.path.join(EXTERIOR_DIR, "roof_panel.glb"))

# ---------------------------------------------------------------------------
# 8. Trunk Decklid (was 234 verts -> target 12,000+ verts)
# ---------------------------------------------------------------------------
def build_trunk_decklid():
    clear_blender_scene()
    col = ensure_collection("TrunkDecklid")
    mat_paint = get_or_create_material("Automotive_Paint_Clearcoat", "automotive_paint")
    
    bm = bmesh.new()
    slices = 36
    t_len = 0.85
    t_w = 1.10
    for i in range(slices):
        t = i / (slices - 1)
        y = -0.75 - t * t_len
        if t > 0.80:
            kickup = ((t - 0.80) / 0.20)**2 * 0.065
        else:
            kickup = 0.0
        z = 0.98 - (t * 0.12) + kickup
        w = t_w * (1.0 - t * 0.08)
        
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((0, y, z)) @ Matrix.Diagonal((w, t_len / slices * 1.05, 0.008, 1.0))
        )
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, -1.60, 0.68)) @ Matrix.Diagonal((0.42, 0.04, 0.18, 1.0))
    )
    bmesh_create_cylinder(
        bm, radius=0.038, depth=0.012, segments=32, cap_ends=True,
        matrix=Matrix.Translation((0, -1.58, 0.84)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, -1.58, 0.96)) @ Matrix.Diagonal((1.02, 0.03, 0.035, 1.0))
    )
    mesh = bpy.data.meshes.new("Trunk_Decklid_Body")
    bm.to_mesh(mesh)
    bm.free()
    trunk = bpy.data.objects.new("Trunk_Decklid_Body", mesh)
    trunk.data.materials.append(mat_paint)
    col.objects.link(trunk)
    apply_mesh_polish(trunk, bevel_width=0.004)
    
    export_active_scene(os.path.join(EXTERIOR_DIR, "trunk_decklid.glb"))

# ---------------------------------------------------------------------------
# 9. Firewall Bulkhead (was 156 verts -> target 10,000+ verts)
# ---------------------------------------------------------------------------
def build_firewall_bulkhead():
    clear_blender_scene()
    col = ensure_collection("FirewallBulkhead")
    mat_gold = get_or_create_material("Gold_Thermal_Shield_Foil", "gold_heatshield")
    mat_ti = get_or_create_material("Hardware_Titanium", "titanium")
    
    bm = bmesh.new()
    w = 1.25
    h = 0.65
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((0, 0.85, 0.55)) @ Matrix.Diagonal((w, 0.02, h, 1.0)))
    
    for ry in [-0.22, -0.11, 0.0, 0.11, 0.22]:
        bmesh_create_cylinder(
            bm, radius=0.012, depth=w * 0.92, segments=24, cap_ends=True,
            matrix=Matrix.Translation((0, 0.835, 0.55 + ry)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
    bmesh_create_cylinder(
        bm, radius=0.09, depth=0.035, segments=32, cap_ends=True,
        matrix=Matrix.Translation((-0.32, 0.86, 0.62)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    bmesh_create_cylinder(
        bm, radius=0.045, depth=0.035, segments=28, cap_ends=True,
        matrix=Matrix.Translation((-0.30, 0.86, 0.42)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    for bx in [0.22, 0.32]:
        bmesh_create_cylinder(
            bm, radius=0.025, depth=0.04, segments=24, cap_ends=True,
            matrix=Matrix.Translation((bx, 0.86, 0.58)) @ Matrix.Rotation(math.radians(90), 4, 'X')
        )
    mesh = bpy.data.meshes.new("Firewall_Stamped_Bulkhead")
    bm.to_mesh(mesh)
    bm.free()
    firewall = bpy.data.objects.new("Firewall_Stamped_Bulkhead", mesh)
    firewall.data.materials.append(mat_gold)
    col.objects.link(firewall)
    apply_mesh_polish(firewall, bevel_width=0.003)
    
    for px in [-0.58, -0.30, 0.0, 0.30, 0.58]:
        for pz in [0.28, 0.82]:
            b = create_hex_bolt(f"Firewall_Bolt_{px}_{pz}", radius=0.005, height=0.004, mat=mat_ti)
            b.location = (px, 0.835, pz)
            b.rotation_euler = (math.radians(-90), 0, 0)
            col.objects.link(b)
            
    export_active_scene(os.path.join(EXTERIOR_DIR, "firewall_bulkhead.glb"))

# ---------------------------------------------------------------------------
# 10. Floor Pan (was 156 verts -> target 15,000+ verts)
# ---------------------------------------------------------------------------
def build_floor_pan():
    clear_blender_scene()
    col = ensure_collection("FloorPan")
    mat_cf = get_or_create_material("Carbon_Composite_Underbody", "carbon_twill")
    mat_skid = get_or_create_material("Titanium_Skid_Blocks", "titanium")
    
    bm = bmesh.new()
    slices = 40
    f_len = 2.80
    f_w = 1.35
    for i in range(slices):
        t = i / (slices - 1)
        y = 1.40 - t * f_len
        if t > 0.75:
            diffuser_kick = ((t - 0.75) / 0.25)**1.6 * 0.16
        else:
            diffuser_kick = 0.0
        z = 0.12 + diffuser_kick
        
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((0, y, z)) @ Matrix.Diagonal((f_w, f_len / slices * 1.05, 0.012, 1.0))
        )
    for sx in [-0.55, -0.28, 0.28, 0.55]:
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx, -0.70, 0.16)) @ Matrix.Diagonal((0.008, 1.20, 0.07, 1.0))
        )
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, 0.10, 0.18)) @ Matrix.Diagonal((0.32, 2.10, 0.06, 1.0))
    )
    mesh = bpy.data.meshes.new("Floor_Pan_Aerodynamic_Tray")
    bm.to_mesh(mesh)
    bm.free()
    floor = bpy.data.objects.new("Floor_Pan_Aerodynamic_Tray", mesh)
    floor.data.materials.append(mat_cf)
    col.objects.link(floor)
    apply_mesh_polish(floor, bevel_width=0.004)
    
    for bx in [-0.45, -0.15, 0.15, 0.45]:
        skid = bpy.data.objects.new(f"SkidBlock_{bx}", bpy.data.meshes.new(f"SkidMesh_{bx}"))
        bm_s = bmesh.new()
        bmesh.ops.create_cube(bm_s, size=1.0, matrix=Matrix.Diagonal((0.08, 0.16, 0.015, 1.0)))
        bm_s.to_mesh(skid.data)
        bm_s.free()
        skid.location = (bx, 1.25, 0.11)
        skid.data.materials.append(mat_skid)
        col.objects.link(skid)
        apply_mesh_polish(skid, bevel_width=0.002)
        
    export_active_scene(os.path.join(EXTERIOR_DIR, "floor_pan.glb"))

# ---------------------------------------------------------------------------
# 11. Auxiliary Coolers (was 672 verts -> target 15,000+ verts)
# ---------------------------------------------------------------------------
def build_auxiliary_coolers():
    clear_blender_scene()
    col = ensure_collection("AuxiliaryCoolers")
    mat_fin = get_or_create_material("Radiator_Micro_Fins", "cast_aluminum")
    mat_an_blue = get_or_create_material("AN_Fitting_Blue", "anodized_blue")
    mat_an_red = get_or_create_material("AN_Fitting_Red", "anodized_red")
    mat_braided = get_or_create_material("Braided_Stainless_Line", "titanium")
    
    for side, sx in [("Left", 0.55), ("Right", -0.55)]:
        core = create_cooling_fin_array(f"AuxCooler_Core_{side}", width=0.26, depth=0.065, height=0.18, fin_count=28, mat=mat_fin)
        core.location = (sx, 1.85, 0.28)
        core.rotation_euler = (0, 0, math.radians(-15 * (1 if sx > 0 else -1)))
        col.objects.link(core)
        
        for f_idx, fy in enumerate([-0.02, 0.02]):
            fit = create_hex_bolt(f"AN_Fitting_{side}_{f_idx}", radius=0.012, height=0.016, flange_radius=0.015,
                                  mat=mat_an_blue if f_idx == 0 else mat_an_red)
            fit.location = (sx, 1.85 + fy, 0.39)
            fit.rotation_euler = (0, 0, 0)
            col.objects.link(fit)
            
            bm_h = bmesh.new()
            bmesh_create_cylinder(
                bm_h, radius=0.009, depth=0.35, segments=24, cap_ends=True,
                matrix=Matrix.Translation((sx * 0.90, 1.70 + fy, 0.42)) @ 
                       Matrix.Rotation(math.radians(35 * (1 if sx > 0 else -1)), 4, 'Y') @
                       Matrix.Rotation(math.radians(-45), 4, 'X')
            )
            mesh_h = bpy.data.meshes.new(f"Hose_{side}_{f_idx}")
            bm_h.to_mesh(mesh_h)
            bm_h.free()
            hose = bpy.data.objects.new(f"Hose_{side}_{f_idx}", mesh_h)
            hose.data.materials.append(mat_braided)
            col.objects.link(hose)
            apply_mesh_polish(hose, bevel_width=0.002)
            
    export_active_scene(os.path.join(EXTERIOR_DIR, "auxiliary_coolers.glb"))

# ---------------------------------------------------------------------------
# 12. Rocker Panels (was 784 verts -> target 12,000+ verts)
# ---------------------------------------------------------------------------
def build_rocker_panels():
    clear_blender_scene()
    col = ensure_collection("RockerPanels")
    mat_cf = get_or_create_material("Carbon_Rocker_Skirt", "carbon_twill")
    mat_ti = get_or_create_material("Hardware_Titanium", "titanium")
    
    for side, sx in [("Left", 0.88), ("Right", -0.88)]:
        bm = bmesh.new()
        slices = 36
        skirt_len = 2.40
        for i in range(slices):
            t = i / (slices - 1)
            y = 1.15 - t * skirt_len
            waist = math.sin(t * math.pi) * 0.035
            x = sx - waist * (1.0 if sx > 0 else -1.0)
            if t > 0.85:
                fin_h = ((t - 0.85) / 0.15)**1.5 * 0.08
            else:
                fin_h = 0.0
            z = 0.18 + fin_h * 0.5
            
            bmesh.ops.create_cube(
                bm, size=1.0,
                matrix=Matrix.Translation((x, y, z)) @ Matrix.Diagonal((0.14, skirt_len / slices * 1.05, 0.04 + fin_h, 1.0))
            )
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx * 1.03, -0.05, 0.14)) @ Matrix.Diagonal((0.12, skirt_len * 0.96, 0.010, 1.0))
        )
        mesh = bpy.data.meshes.new(f"Rocker_Panel_Aero_{side}")
        bm.to_mesh(mesh)
        bm.free()
        skirt = bpy.data.objects.new(f"Rocker_Panel_Aero_{side}", mesh)
        skirt.data.materials.append(mat_cf)
        col.objects.link(skirt)
        apply_mesh_polish(skirt, bevel_width=0.004)
        
        for by in [0.90, 0.45, 0.0, -0.45, -0.90]:
            b = create_hex_bolt(f"Rocker_Bolt_{side}_{by}", radius=0.005, height=0.004, mat=mat_ti)
            b.location = (sx * 1.02, by, 0.13)
            b.rotation_euler = (0, 0, 0)
            col.objects.link(b)
            
    export_active_scene(os.path.join(EXTERIOR_DIR, "rocker_panels.glb"))

# ---------------------------------------------------------------------------
# 13. Roll Cage (was 784 verts -> target 25,000+ verts)
# ---------------------------------------------------------------------------
def build_roll_cage():
    clear_blender_scene()
    col = ensure_collection("RollCage")
    mat_cage = get_or_create_material("Chromoly_RollCage_White", "billet_aluminum")
    mat_gusset = get_or_create_material("Perforated_Gusset_Plates", "cast_aluminum")
    mat_bolts = get_or_create_material("Grade_12.9_Bolts", "titanium")
    
    bm = bmesh.new()
    tube_r = 0.022
    
    def add_tube(p1, p2):
        v1 = Vector(p1)
        v2 = Vector(p2)
        delta = v2 - v1
        dist = delta.length
        mid = (v1 + v2) * 0.5
        rot = delta.to_track_quat('Z', 'Y').to_euler()
        bmesh_create_cylinder(
            bm, radius=tube_r, depth=dist, segments=28, cap_ends=True,
            matrix=Matrix.Translation(mid) @ rot.to_matrix().to_4x4()
        )

    # Main Roll Hoop
    add_tube((-0.55, -0.35, 0.25), (-0.55, -0.35, 1.22))
    add_tube((0.55, -0.35, 0.25), (0.55, -0.35, 1.22))
    add_tube((-0.55, -0.35, 1.22), (0.55, -0.35, 1.22))
    add_tube((-0.55, -0.35, 0.25), (0.55, -0.35, 1.22))
    add_tube((-0.55, -0.35, 0.72), (0.55, -0.35, 0.72))
    
    # Front A-Pillar Half Hoops
    add_tube((-0.58, 0.65, 0.30), (-0.50, 0.45, 1.20))
    add_tube((0.58, 0.65, 0.30), (0.50, 0.45, 1.20))
    add_tube((-0.50, 0.45, 1.20), (0.50, 0.45, 1.20))
    
    # Roof Lateral Connecting Bars
    add_tube((-0.50, 0.45, 1.20), (-0.55, -0.35, 1.22))
    add_tube((0.50, 0.45, 1.20), (0.55, -0.35, 1.22))
    add_tube((-0.50, 0.45, 1.20), (0.55, -0.35, 1.22))
    
    # Rear Backstays
    add_tube((-0.55, -0.35, 1.22), (-0.50, -1.25, 0.45))
    add_tube((0.55, -0.35, 1.22), (0.50, -1.25, 0.45))
    add_tube((-0.50, -1.25, 0.45), (0.50, -1.25, 0.45))
    
    # Side Door X-Bracing
    for sx in [-1.0, 1.0]:
        add_tube((sx * 0.58, 0.65, 0.32), (sx * 0.55, -0.35, 0.70))
        add_tube((sx * 0.58, 0.65, 0.70), (sx * 0.55, -0.35, 0.32))
        
    mesh = bpy.data.meshes.new("FIA_Roll_Cage_Tubes")
    bm.to_mesh(mesh)
    bm.free()
    cage = bpy.data.objects.new("FIA_Roll_Cage_Tubes", mesh)
    cage.data.materials.append(mat_cage)
    col.objects.link(cage)
    apply_mesh_polish(cage, bevel_width=0.003)
    
    for gx in [-0.52, 0.52]:
        bm_g = bmesh.new()
        bmesh.ops.create_cube(
            bm_g, size=1.0,
            matrix=Matrix.Translation((gx, -0.35, 1.15)) @ Matrix.Diagonal((0.006, 0.12, 0.12, 1.0))
        )
        mesh_g = bpy.data.meshes.new(f"Gusset_{gx}")
        bm_g.to_mesh(mesh_g)
        bm_g.free()
        gusset = bpy.data.objects.new(f"Gusset_{gx}", mesh_g)
        gusset.data.materials.append(mat_gusset)
        col.objects.link(gusset)
        apply_mesh_polish(gusset, bevel_width=0.002)
        
    for bx, by, bz in [(-0.55, -0.35, 0.24), (0.55, -0.35, 0.24), (-0.58, 0.65, 0.29), (0.58, 0.65, 0.29)]:
        bm_b = bmesh.new()
        bmesh.ops.create_cube(bm_b, size=1.0, matrix=Matrix.Diagonal((0.14, 0.14, 0.015, 1.0)))
        mesh_bp = bpy.data.meshes.new(f"Baseplate_{bx}_{by}")
        bm_b.to_mesh(mesh_bp)
        bm_b.free()
        bp = bpy.data.objects.new(f"Baseplate_{bx}_{by}", mesh_bp)
        bp.location = (bx, by, bz)
        bp.data.materials.append(mat_gusset)
        col.objects.link(bp)
        for dx, dy in [(-0.045, -0.045), (0.045, -0.045), (-0.045, 0.045), (0.045, 0.045)]:
            bolt = create_hex_bolt(f"Cage_Bolt_{bx}_{by}_{dx}_{dy}", radius=0.006, height=0.006, mat=mat_bolts)
            bolt.location = (bx + dx, by + dy, bz + 0.008)
            col.objects.link(bolt)
            
    export_active_scene(os.path.join(EXTERIOR_DIR, "roll_cage.glb"))

# ---------------------------------------------------------------------------
# 14. Door Handles (was 864 verts -> target 8,000+ verts)
# ---------------------------------------------------------------------------
def build_door_handles():
    clear_blender_scene()
    col = ensure_collection("DoorHandles")
    mat_al = get_or_create_material("Brushed_Aluminum_Lever", "billet_aluminum")
    mat_glow = get_or_create_material("LED_Welcome_Light", "led_white")
    
    for side, sx in [("Left", 0.90), ("Right", -0.90)]:
        for door, y_pos in [("Front", 0.35), ("Rear", -0.35)]:
            bm = bmesh.new()
            bmesh.ops.create_cube(
                bm, size=1.0,
                matrix=Matrix.Translation((sx * 0.98, y_pos, 0.75)) @ Matrix.Diagonal((0.025, 0.19, 0.065, 1.0))
            )
            bmesh.ops.create_cube(
                bm, size=1.0,
                matrix=Matrix.Translation((sx, y_pos, 0.75)) @ Matrix.Diagonal((0.016, 0.16, 0.042, 1.0))
            )
            bmesh_create_cylinder(
                bm, radius=0.006, depth=0.005, segments=24, cap_ends=True,
                matrix=Matrix.Translation((sx * 1.005, y_pos - 0.05, 0.75)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
            )
            mesh = bpy.data.meshes.new(f"Door_Handle_{side}_{door}")
            bm.to_mesh(mesh)
            bm.free()
            handle = bpy.data.objects.new(f"Door_Handle_{side}_{door}", mesh)
            handle.data.materials.append(mat_al)
            col.objects.link(handle)
            apply_mesh_polish(handle, bevel_width=0.002)
            
            bm_l = bmesh.new()
            bmesh_create_cylinder(
                bm_l, radius=0.003, depth=0.14, segments=20, cap_ends=True,
                matrix=Matrix.Translation((sx * 0.99, y_pos, 0.73)) @ Matrix.Rotation(math.radians(90), 4, 'X')
            )
            mesh_l = bpy.data.meshes.new(f"Handle_LED_{side}_{door}")
            bm_l.to_mesh(mesh_l)
            bm_l.free()
            led = bpy.data.objects.new(f"Handle_LED_{side}_{door}", mesh_l)
            led.data.materials.append(mat_glow)
            col.objects.link(led)
            
    export_active_scene(os.path.join(EXTERIOR_DIR, "door_handles.glb"))

# ---------------------------------------------------------------------------
# 15. Rear Quarters (was 864 verts -> target 18,000+ verts)
# ---------------------------------------------------------------------------
def build_rear_quarters():
    clear_blender_scene()
    col = ensure_collection("RearQuarters")
    mat_paint = get_or_create_material("Automotive_Paint_Clearcoat", "automotive_paint")
    mat_cap = get_or_create_material("Billet_Fuel_Door", "billet_aluminum")
    
    for side, sx in [("Left", 0.92), ("Right", -0.92)]:
        bm = bmesh.new()
        slices = 36
        q_len = 1.35
        for i in range(slices):
            t = i / (slices - 1)
            y = -0.55 - t * q_len
            arch_dist = abs(y - (-1.05))
            flare = max(0.0, 0.08 * (1.0 - (arch_dist / 0.45)**2)) if arch_dist < 0.45 else 0.0
            x = sx + flare * (1.0 if sx > 0 else -1.0)
            z = 0.75 - (t * 0.15)
            h = 0.55
            
            bmesh.ops.create_cube(
                bm, size=1.0,
                matrix=Matrix.Translation((x, y, z)) @ Matrix.Diagonal((0.08, q_len / slices * 1.05, h, 1.0))
            )
        bmesh_create_cylinder(
            bm, radius=0.38, depth=0.06, segments=36, cap_ends=False,
            matrix=Matrix.Translation((sx * 0.96, -1.05, 0.42)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        mesh = bpy.data.meshes.new(f"Rear_Quarter_{side}")
        bm.to_mesh(mesh)
        bm.free()
        quarter = bpy.data.objects.new(f"Rear_Quarter_{side}", mesh)
        quarter.data.materials.append(mat_paint)
        col.objects.link(quarter)
        apply_mesh_polish(quarter, bevel_width=0.005)
        
        if sx < 0:
            bm_fuel = bmesh.new()
            bmesh_create_cylinder(
                bm_fuel, radius=0.055, depth=0.010, segments=32, cap_ends=True,
                matrix=Matrix.Translation((sx * 1.04, -0.90, 0.82)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
            )
            mesh_fuel = bpy.data.meshes.new("Billet_Fuel_Door")
            bm_fuel.to_mesh(mesh_fuel)
            bm_fuel.free()
            fuel = bpy.data.objects.new("Billet_Fuel_Door", mesh_fuel)
            fuel.data.materials.append(mat_cap)
            col.objects.link(fuel)
            apply_mesh_polish(fuel, bevel_width=0.002)
            
    export_active_scene(os.path.join(EXTERIOR_DIR, "rear_quarters.glb"))

# ---------------------------------------------------------------------------
# 16. Vents (was 864 verts -> target 14,000+ verts)
# ---------------------------------------------------------------------------
def build_vents():
    clear_blender_scene()
    col = ensure_collection("Vents")
    mat_cf = get_or_create_material("Carbon_Air_Extractor", "carbon_twill")
    
    for side, sx in [("Left", 0.86), ("Right", -0.86)]:
        bm = bmesh.new()
        louver_count = 8
        for i in range(louver_count):
            t = i / (louver_count - 1)
            y = 1.05 - t * 0.28
            z = 0.68 - t * 0.04
            bmesh.ops.create_cube(
                bm, size=1.0,
                matrix=Matrix.Translation((sx, y, z)) @ 
                       Matrix.Rotation(math.radians(-35), 4, 'X') @ 
                       Matrix.Diagonal((0.025, 0.035, 0.005, 1.0))
            )
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx * 0.98, 0.91, 0.66)) @ Matrix.Diagonal((0.03, 0.32, 0.12, 1.0))
        )
        mesh_f = bpy.data.meshes.new(f"Fender_Vent_{side}")
        bm.to_mesh(mesh_f)
        bm.free()
        f_vent = bpy.data.objects.new(f"Fender_Vent_{side}", mesh_f)
        f_vent.data.materials.append(mat_cf)
        col.objects.link(f_vent)
        apply_mesh_polish(f_vent, bevel_width=0.002)
        
        bm_r = bmesh.new()
        bmesh.ops.create_cube(
            bm_r, size=1.0,
            matrix=Matrix.Translation((sx * 1.02, -0.65, 0.45)) @ Matrix.Diagonal((0.05, 0.18, 0.14, 1.0))
        )
        for k in range(4):
            bmesh.ops.create_cube(
                bm_r, size=1.0,
                matrix=Matrix.Translation((sx * 1.03, -0.65, 0.40 + k * 0.03)) @ Matrix.Diagonal((0.04, 0.16, 0.006, 1.0))
            )
        mesh_r = bpy.data.meshes.new(f"Brake_Scoop_{side}")
        bm_r.to_mesh(mesh_r)
        bm_r.free()
        r_vent = bpy.data.objects.new(f"Brake_Scoop_{side}", mesh_r)
        r_vent.data.materials.append(mat_cf)
        col.objects.link(r_vent)
        apply_mesh_polish(r_vent, bevel_width=0.002)
        
    export_active_scene(os.path.join(EXTERIOR_DIR, "vents.glb"))

# ---------------------------------------------------------------------------
# 17. Rear Window (was 892 verts -> target 10,000+ verts)
# ---------------------------------------------------------------------------
def build_rear_window():
    clear_blender_scene()
    col = ensure_collection("RearWindow")
    mat_glass = get_or_create_material("Optic_Rear_Window", "optical_glass")
    mat_wire = get_or_create_material("Defroster_Heating_Lines", "copper_brass")
    mat_chmsl = get_or_create_material("CHMSL_LED_Bar", "led_red")
    
    bm = bmesh.new()
    slices = 32
    w_len = 0.95
    w_width = 1.08
    for i in range(slices):
        t = i / (slices - 1)
        y = -0.40 - t * w_len
        z = 1.22 - (t * 0.28)
        w = w_width * (1.0 - t * 0.12)
        
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((0, y, z)) @ Matrix.Diagonal((w, w_len / slices * 1.05, 0.006, 1.0))
        )
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, -0.40, 1.22)) @ Matrix.Diagonal((w_width, 0.06, 0.008, 1.0))
    )
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, -1.35, 0.94)) @ Matrix.Diagonal((w_width * 0.88, 0.06, 0.008, 1.0))
    )
    mesh = bpy.data.meshes.new("Rear_Window_Glass")
    bm.to_mesh(mesh)
    bm.free()
    glass = bpy.data.objects.new("Rear_Window_Glass", mesh)
    glass.data.materials.append(mat_glass)
    col.objects.link(glass)
    apply_mesh_polish(glass, bevel_width=0.003)
    
    bm_wire = bmesh.new()
    for line in range(14):
        lt = line / 13.0
        ly = -0.48 - lt * (w_len * 0.78)
        lz = 1.19 - (lt * 0.22)
        lw = (w_width * 0.85) * (1.0 - lt * 0.10)
        bmesh_create_cylinder(
            bm_wire, radius=0.001, depth=lw, segments=12, cap_ends=True,
            matrix=Matrix.Translation((0, ly, lz)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
    mesh_w = bpy.data.meshes.new("Defroster_Wires")
    bm_wire.to_mesh(mesh_w)
    bm_wire.free()
    wires = bpy.data.objects.new("Defroster_Wires", mesh_w)
    wires.data.materials.append(mat_wire)
    col.objects.link(wires)
    
    bm_c = bmesh.new()
    bmesh.ops.create_cube(
        bm_c, size=1.0,
        matrix=Matrix.Translation((0, -0.42, 1.23)) @ Matrix.Diagonal((0.36, 0.025, 0.012, 1.0))
    )
    mesh_c = bpy.data.meshes.new("CHMSL_LED_Housing")
    bm_c.to_mesh(mesh_c)
    bm_c.free()
    chmsl = bpy.data.objects.new("CHMSL_LED_Housing", mesh_c)
    chmsl.data.materials.append(mat_chmsl)
    col.objects.link(chmsl)
    
    export_active_scene(os.path.join(EXTERIOR_DIR, "rear_window.glb"))

# ---------------------------------------------------------------------------
# 18. Wipers (was 976 verts -> target 14,000+ verts)
# ---------------------------------------------------------------------------
def build_wipers():
    clear_blender_scene()
    col = ensure_collection("Wipers")
    mat_arm = get_or_create_material("Satin_Black_Wiper_Arm", "carbon_twill")
    mat_rubber = get_or_create_material("Rubber_Squeegee_Blade", "rubber_black")
    
    for side, sx in [("Driver", -0.28), ("Passenger", 0.28)]:
        bm = bmesh.new()
        bmesh_create_cylinder(
            bm, radius=0.018, depth=0.035, segments=28, cap_ends=True,
            matrix=Matrix.Translation((sx, 0.72, 0.88)) @ Matrix.Rotation(math.radians(-25), 4, 'X')
        )
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx, 0.75, 0.90)) @ Matrix.Diagonal((0.024, 0.05, 0.022, 1.0))
        )
        arm_len = 0.55
        angle = math.radians(22 if sx < 0 else -18)
        rot = Matrix.Rotation(angle, 4, 'Z')
        bmesh_create_cylinder(
            bm, radius=0.007, depth=arm_len, segments=24, cap_ends=True,
            matrix=Matrix.Translation((sx + 0.15, 0.95, 0.96)) @ rot @ Matrix.Rotation(math.radians(65), 4, 'X')
        )
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx + 0.22, 1.05, 0.98)) @ rot @ Matrix.Diagonal((0.018, 0.50, 0.025, 1.0))
        )
        mesh = bpy.data.meshes.new(f"Wiper_Arm_{side}")
        bm.to_mesh(mesh)
        bm.free()
        arm = bpy.data.objects.new(f"Wiper_Arm_{side}", mesh)
        arm.data.materials.append(mat_arm)
        col.objects.link(arm)
        apply_mesh_polish(arm, bevel_width=0.002)
        
        bm_r = bmesh.new()
        bmesh.ops.create_cube(
            bm_r, size=1.0,
            matrix=Matrix.Translation((sx + 0.22, 1.05, 0.965)) @ rot @ Matrix.Diagonal((0.006, 0.52, 0.014, 1.0))
        )
        mesh_r = bpy.data.meshes.new(f"Wiper_Blade_{side}")
        bm_r.to_mesh(mesh_r)
        bm_r.free()
        blade = bpy.data.objects.new(f"Wiper_Blade_{side}", mesh_r)
        blade.data.materials.append(mat_rubber)
        col.objects.link(blade)
        
    export_active_scene(os.path.join(EXTERIOR_DIR, "wipers.glb"))

def main():
    log("Upgrading 18 Exterior Ancillary Assets with High-Mesh CAD Geometry...")
    build_grille()
    build_canards()
    build_crash_boxes()
    build_cockpit_camera_monitors()
    build_naca_screens()
    build_side_glass()
    build_roof_panel()
    build_trunk_decklid()
    build_firewall_bulkhead()
    build_floor_pan()
    build_auxiliary_coolers()
    build_rocker_panels()
    build_roll_cage()
    build_door_handles()
    build_rear_quarters()
    build_vents()
    build_rear_window()
    build_wipers()
    log("[SUCCESS] All 18 Exterior Ancillaries upgraded successfully!")

if __name__ == "__main__":
    main()
