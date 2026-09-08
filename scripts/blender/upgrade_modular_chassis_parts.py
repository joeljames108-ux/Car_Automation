"""
==============================================================================
MODULAR CHASSIS & SUBASSEMBLIES HIGH-MESH CAD UPGRADE PIPELINE (BLENDER 5.2 LTS)
==============================================================================
Upgrades remaining low-poly modular parts to precision automotive CAD models:
- antiroll_bars.glb (tubular chromoly torsion bars, spherical rod ends, billet end-links)
- driveshaft.glb (carbon composite tube, forged yokes, U-joints, center support bearing)
- grille.glb (aerodynamic honeycomb core, gloss carbon surround, precision badge crest)
- rear_structure.glb (hydroformed rear crash beam, accordion crush boxes, billet tow ring)
- front_subframe.glb (cast aluminum cradle, suspension clevises, steering rack mounts)
- rear_subframe.glb (multi-link suspension cradle, differential carrier cage)
- indicators.glb (faceted LED matrix reflectors, optical micro-prisms, polycarb lens)
- rear_spoiler.glb (NACA airfoil blade, swan-neck CNC pylons, vortex endplates)
- center_console.glb (stitched armrest, knurled rotary controller, cupholders, EPB switch)
- powertrain_gearbox.glb (ribbed transaxle casing, mechatronics cover, bellhousing flange)
==============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.append(SCRIPT_DIR)

from generators.cad_geometry_library import (
    clear_blender_scene, ensure_collection, get_or_create_material,
    create_hex_bolt, create_cooling_fin_array,
    bmesh_create_cylinder, apply_mesh_polish
)

PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
INDIVIDUAL_DIR = os.path.join(PROJECT_ROOT, "public", "models", "modular_parts", "individual")
MODULAR_DIR = os.path.join(PROJECT_ROOT, "public", "models", "modular_parts")

def log(msg):
    print(f"[MODULAR_UPGRADE] {msg}")

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
# 1. Anti-Roll Bars
# ---------------------------------------------------------------------------
def build_antiroll_bars():
    clear_blender_scene()
    col = ensure_collection("AntiRoll_Bars")
    mat_bar = get_or_create_material("Chromoly_Swaybar_Red", "anodized_red")
    mat_link = get_or_create_material("Billet_EndLink", "billet_aluminum")
    mat_bush = get_or_create_material("Poly_Bushing_95A", "rubber_black")
    mat_bolt = get_or_create_material("Swaybar_Hardware", "titanium")
    
    # Front and Rear Anti-roll bars
    for label, y_pos, z_pos, width in [("Front", 1.25, 0.28, 1.20), ("Rear", -1.35, 0.32, 1.15)]:
        # Central torsion bar tube
        bm = bmesh.new()
        bmesh_create_cylinder(
            bm, radius=0.016, depth=width * 0.70, segments=32, cap_ends=True,
            matrix=Matrix.Translation((0, y_pos, z_pos)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        # Angled lever arms
        for side, sx in [("Left", 1.0), ("Right", -1.0)]:
            arm_x = sx * (width * 0.35 + 0.08)
            arm_y = y_pos + (0.16 if label == "Front" else -0.16)
            bmesh_create_cylinder(
                bm, radius=0.015, depth=0.22, segments=28, cap_ends=True,
                matrix=Matrix.Translation((arm_x, arm_y, z_pos)) @ Matrix.Rotation(math.radians(45 if label=="Front" else -45), 4, 'X')
            )
        mesh_b = bpy.data.meshes.new(f"Swaybar_Tube_{label}")
        bm.to_mesh(mesh_b)
        bm.free()
        bar = bpy.data.objects.new(f"Swaybar_Tube_{label}", mesh_b)
        bar.data.materials.append(mat_bar)
        col.objects.link(bar)
        apply_mesh_polish(bar, bevel_width=0.003)
        
        # Chassis D-bushings and stamped steel brackets
        for bx in [-width * 0.28, width * 0.28]:
            bm_bush = bmesh.new()
            bmesh_create_cylinder(
                bm_bush, radius=0.026, depth=0.045, segments=28, cap_ends=True,
                matrix=Matrix.Translation((bx, y_pos, z_pos)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
            )
            mesh_bu = bpy.data.meshes.new(f"Bushing_{label}_{bx:.2f}")
            bm_bush.to_mesh(mesh_bu)
            bm_bush.free()
            bush = bpy.data.objects.new(f"Bushing_{label}_{bx:.2f}", mesh_bu)
            bush.data.materials.append(mat_bush)
            col.objects.link(bush)
            apply_mesh_polish(bush, bevel_width=0.002)
            
            # Bushing clamp bolts
            for dy in [-0.035, 0.035]:
                b = create_hex_bolt(f"Bush_Bolt_{label}_{bx:.2f}_{dy}", radius=0.005, height=0.008, mat=mat_bolt)
                b.location = (bx, y_pos + dy, z_pos + 0.026)
                col.objects.link(b)
                
        # Adjustable Billet Heim Joint End-links
        for sx in [1.0, -1.0]:
            lx = sx * (width * 0.44)
            ly = y_pos + (0.24 if label == "Front" else -0.24)
            bm_l = bmesh.new()
            # Turnbuckle center link body
            bmesh_create_cylinder(
                bm_l, radius=0.009, depth=0.12, segments=24, cap_ends=True,
                matrix=Matrix.Translation((lx, ly, z_pos - 0.06))
            )
            # Top and bottom spherical rod end eyelets
            for ez in [z_pos, z_pos - 0.12]:
                bmesh_create_cylinder(
                    bm_l, radius=0.018, depth=0.016, segments=28, cap_ends=True,
                    matrix=Matrix.Translation((lx, ly, ez)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
                )
            mesh_l = bpy.data.meshes.new(f"EndLink_{label}_{sx}")
            bm_l.to_mesh(mesh_l)
            bm_l.free()
            link = bpy.data.objects.new(f"EndLink_{label}_{sx}", mesh_l)
            link.data.materials.append(mat_link)
            col.objects.link(link)
            apply_mesh_polish(link, bevel_width=0.002)
            
    export_active_scene(os.path.join(INDIVIDUAL_DIR, "antiroll_bars.glb"))

# ---------------------------------------------------------------------------
# 2. Driveshaft
# ---------------------------------------------------------------------------
def build_driveshaft():
    clear_blender_scene()
    col = ensure_collection("Driveshaft")
    mat_cf = get_or_create_material("Carbon_Driveshaft_Tube", "carbon_twill")
    mat_steel = get_or_create_material("Forged_Steel_Yoke", "titanium")
    mat_rubber = get_or_create_material("Carrier_Bearing_Elastomer", "rubber_black")
    mat_bolt = get_or_create_material("Driveshaft_Flange_Bolts", "billet_aluminum")
    
    # 1. Front and Rear Carbon Fiber Tubular Shaft Sections
    for s_idx, (y_start, y_end) in enumerate([(0.20, -0.45), (-0.55, -1.25)]):
        bm = bmesh.new()
        mid_y = (y_start + y_end) * 0.5
        length = abs(y_start - y_end)
        bmesh_create_cylinder(
            bm, radius=0.042, depth=length, segments=36, cap_ends=True,
            matrix=Matrix.Translation((0, mid_y, 0.28)) @ Matrix.Rotation(math.radians(90), 4, 'X')
        )
        mesh = bpy.data.meshes.new(f"CF_Shaft_Section_{s_idx}")
        bm.to_mesh(mesh)
        bm.free()
        shaft = bpy.data.objects.new(f"CF_Shaft_Section_{s_idx}", mesh)
        shaft.data.materials.append(mat_cf)
        col.objects.link(shaft)
        apply_mesh_polish(shaft, bevel_width=0.002)
        
    # 2. Universal Joints & Forged Yokes (Front, Center, Rear)
    for y_pos in [0.22, -0.50, -1.27]:
        bm_y = bmesh.new()
        # Forged yoke collar
        bmesh_create_cylinder(
            bm_y, radius=0.046, depth=0.04, segments=32, cap_ends=True,
            matrix=Matrix.Translation((0, y_pos, 0.28)) @ Matrix.Rotation(math.radians(90), 4, 'X')
        )
        # U-joint spider cross trunnion
        bmesh_create_cylinder(
            bm_y, radius=0.012, depth=0.075, segments=24, cap_ends=True,
            matrix=Matrix.Translation((0, y_pos, 0.28)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        bmesh_create_cylinder(
            bm_y, radius=0.012, depth=0.075, segments=24, cap_ends=True,
            matrix=Matrix.Translation((0, y_pos, 0.28))
        )
        mesh_y = bpy.data.meshes.new(f"UJoint_{y_pos:.2f}")
        bm_y.to_mesh(mesh_y)
        bm_y.free()
        yoke = bpy.data.objects.new(f"UJoint_{y_pos:.2f}", mesh_y)
        yoke.data.materials.append(mat_steel)
        col.objects.link(yoke)
        apply_mesh_polish(yoke, bevel_width=0.002)
        
        # 4x Flange coupling bolts at input and output ends
        if y_pos in [0.22, -1.27]:
            for b_idx in range(4):
                ang = b_idx * (math.pi * 0.5)
                fb = create_hex_bolt(f"Flange_Bolt_{y_pos:.2f}_{b_idx}", radius=0.005, height=0.008, mat=mat_bolt)
                fb.location = (math.cos(ang) * 0.035, y_pos + (0.02 if y_pos > 0 else -0.02), 0.28 + math.sin(ang) * 0.035)
                fb.rotation_euler = (math.radians(90), 0, 0)
                col.objects.link(fb)
                
    # 3. Center Support Bearing Assembly
    bm_c = bmesh.new()
    bmesh_create_cylinder(
        bm_c, radius=0.058, depth=0.035, segments=36, cap_ends=True,
        matrix=Matrix.Translation((0, -0.50, 0.28)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    # Stamped chassis mounting bracket
    bmesh.ops.create_cube(
        bm_c, size=1.0,
        matrix=Matrix.Translation((0, -0.50, 0.32)) @ Matrix.Diagonal((0.18, 0.035, 0.015, 1.0))
    )
    mesh_c = bpy.data.meshes.new("Center_Bearing_Housing")
    bm_c.to_mesh(mesh_c)
    bm_c.free()
    carrier = bpy.data.objects.new("Center_Bearing_Housing", mesh_c)
    carrier.data.materials.append(mat_rubber)
    col.objects.link(carrier)
    apply_mesh_polish(carrier, bevel_width=0.002)
    
    export_active_scene(os.path.join(INDIVIDUAL_DIR, "driveshaft.glb"))

# ---------------------------------------------------------------------------
# 3. Grille (Modular Individual)
# ---------------------------------------------------------------------------
def build_modular_grille():
    clear_blender_scene()
    col = ensure_collection("Modular_Grille")
    mat_bezel = get_or_create_material("Grille_Gloss_Carbon", "carbon_twill")
    mat_mesh = get_or_create_material("Grille_Hex_Mesh", "rubber_black")
    mat_emblem = get_or_create_material("Grille_Chrome_Badge", "billet_aluminum")
    
    # 1. Outer Aerodynamic Air Scoop Bezel
    bm = bmesh.new()
    gw = 0.88
    gh = 0.32
    # Outer frame
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, 1.82, 0.44)) @ Matrix.Diagonal((gw, 0.06, gh, 1.0))
    )
    mesh = bpy.data.meshes.new("Grille_Bezel")
    bm.to_mesh(mesh)
    bm.free()
    bezel = bpy.data.objects.new("Grille_Bezel", mesh)
    bezel.data.materials.append(mat_bezel)
    col.objects.link(bezel)
    apply_mesh_polish(bezel, bevel_width=0.005)
    
    # 2. Hexagonal Micro-Matrix Honeycomb Cells
    bm_m = bmesh.new()
    rows = 7
    cols = 16
    for r in range(rows):
        y_c = 0.44 - (gh * 0.4) + (r * (gh * 0.8 / rows))
        for c in range(cols):
            x_c = -gw * 0.42 + (c * (gw * 0.84 / cols)) + ((r % 2) * 0.02)
            bmesh_create_cylinder(
                bm_m, radius=0.016, depth=0.025, segments=6, cap_ends=False,
                matrix=Matrix.Translation((x_c, 1.82, y_c)) @ Matrix.Rotation(math.radians(90), 4, 'X')
            )
    mesh_m = bpy.data.meshes.new("Grille_Honeycomb_Core")
    bm_m.to_mesh(mesh_m)
    bm_m.free()
    honey = bpy.data.objects.new("Grille_Honeycomb_Core", mesh_m)
    honey.data.materials.append(mat_mesh)
    col.objects.link(honey)
    apply_mesh_polish(honey, bevel_width=0.001)
    
    # 3. Center Precision Automotive Crest Emblem
    bm_e = bmesh.new()
    bmesh_create_cylinder(
        bm_e, radius=0.038, depth=0.012, segments=36, cap_ends=True,
        matrix=Matrix.Translation((0, 1.85, 0.44)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    mesh_e = bpy.data.meshes.new("Grille_Crest_Emblem")
    bm_e.to_mesh(mesh_e)
    bm_e.free()
    emblem = bpy.data.objects.new("Grille_Crest_Emblem", mesh_e)
    emblem.data.materials.append(mat_emblem)
    col.objects.link(emblem)
    apply_mesh_polish(emblem, bevel_width=0.002)
    
    export_active_scene(os.path.join(INDIVIDUAL_DIR, "grille.glb"))

# ---------------------------------------------------------------------------
# 4. Rear Structure
# ---------------------------------------------------------------------------
def build_rear_structure():
    clear_blender_scene()
    col = ensure_collection("Rear_Structure")
    mat_beam = get_or_create_material("Hydroformed_Aluminum_Beam", "cast_aluminum")
    mat_crash = get_or_create_material("Accordion_Crash_Box", "billet_aluminum")
    mat_tow = get_or_create_material("Billet_Tow_Ring_Red", "anodized_red")
    mat_bolt = get_or_create_material("Crash_Structure_Bolts", "titanium")
    
    # 1. Hydroformed Curved Bumper Cross-Beam
    bm = bmesh.new()
    beam_w = 1.42
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, -1.95, 0.42)) @ Matrix.Diagonal((beam_w, 0.12, 0.14, 1.0))
    )
    # Swept curved outer tips
    for sx in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx * (beam_w * 0.45), -1.90, 0.42)) @
                   Matrix.Rotation(math.radians(18 * sx), 4, 'Z') @ Matrix.Diagonal((0.18, 0.10, 0.12, 1.0))
        )
    mesh = bpy.data.meshes.new("Rear_Bumper_Beam")
    bm.to_mesh(mesh)
    bm.free()
    beam = bpy.data.objects.new("Rear_Bumper_Beam", mesh)
    beam.data.materials.append(mat_beam)
    col.objects.link(beam)
    apply_mesh_polish(beam, bevel_width=0.005, subsurf_levels=1)
    
    # 2. Accordion Crush Cans / Crash Boxes (Left & Right)
    for sx in [0.45, -0.45]:
        bm_c = bmesh.new()
        # Thin-walled octagonal impact attenuator box
        bmesh_create_cylinder(
            bm_c, radius=0.055, depth=0.22, segments=16, cap_ends=True,
            matrix=Matrix.Translation((sx, -1.82, 0.42)) @ Matrix.Rotation(math.radians(90), 4, 'X')
        )
        # Accordion collapse trigger beads
        for b_y in [-1.75, -1.82, -1.89]:
            bmesh_create_cylinder(
                bm_c, radius=0.059, depth=0.015, segments=16, cap_ends=True,
                matrix=Matrix.Translation((sx, b_y, 0.42)) @ Matrix.Rotation(math.radians(90), 4, 'X')
            )
        mesh_c = bpy.data.meshes.new(f"Crash_Box_{sx:.2f}")
        bm_c.to_mesh(mesh_c)
        bm_c.free()
        crash = bpy.data.objects.new(f"Crash_Box_{sx:.2f}", mesh_c)
        crash.data.materials.append(mat_crash)
        col.objects.link(crash)
        apply_mesh_polish(crash, bevel_width=0.002, subsurf_levels=1)
        
        # 4x Flange mounting bolts
        for dx, dz in [(-0.04, -0.04), (0.04, -0.04), (-0.04, 0.04), (0.04, 0.04)]:
            fb = create_hex_bolt(f"Crash_Bolt_{sx}_{dx}_{dz}", radius=0.005, height=0.008, mat=mat_bolt)
            fb.location = (sx + dx, -1.71, 0.42 + dz)
            fb.rotation_euler = (math.radians(90), 0, 0)
            col.objects.link(fb)
            
    # 3. Billet Aluminum FIA Tow Loop Ring
    bm_t = bmesh.new()
    bmesh_create_cylinder(
        bm_t, radius=0.035, depth=0.015, segments=32, cap_ends=True,
        matrix=Matrix.Translation((0.45, -2.03, 0.38)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    bmesh_create_cylinder(
        bm_t, radius=0.024, depth=0.020, segments=28, cap_ends=True,
        matrix=Matrix.Translation((0.45, -2.03, 0.38)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    mesh_t = bpy.data.meshes.new("Tow_Loop_Ring")
    bm_t.to_mesh(mesh_t)
    bm_t.free()
    tow = bpy.data.objects.new("Tow_Loop_Ring", mesh_t)
    tow.data.materials.append(mat_tow)
    col.objects.link(tow)
    apply_mesh_polish(tow, bevel_width=0.002)
    
    export_active_scene(os.path.join(INDIVIDUAL_DIR, "rear_structure.glb"))

# ---------------------------------------------------------------------------
# 5 & 6. Front & Rear Subframes
# ---------------------------------------------------------------------------
def build_subframes():
    for mode in ["Front", "Rear"]:
        clear_blender_scene()
        col = ensure_collection(f"{mode}_Subframe")
        mat_cradle = get_or_create_material(f"{mode}_Cast_Subframe", "cast_aluminum")
        mat_bush = get_or_create_material(f"{mode}_Subframe_Bushings", "rubber_black")
        mat_bolt = get_or_create_material(f"{mode}_Hardware", "titanium")
        
        y_cen = 1.15 if mode == "Front" else -1.25
        z_cen = 0.26
        
        bm = bmesh.new()
        # Main perimeter box cradle structure
        w = 1.05
        l = 0.72
        # Transverse crossmembers (front and rear spar)
        for dy in [-l * 0.42, l * 0.42]:
            bmesh.ops.create_cube(
                bm, size=1.0,
                matrix=Matrix.Translation((0, y_cen + dy, z_cen)) @ Matrix.Diagonal((w, 0.08, 0.07, 1.0))
            )
        # Longitudinal side rails
        for sx in [-w * 0.46, w * 0.46]:
            bmesh.ops.create_cube(
                bm, size=1.0,
                matrix=Matrix.Translation((sx, y_cen, z_cen)) @ Matrix.Diagonal((0.08, l, 0.07, 1.0))
            )
        # Suspension control arm mounting clevis ears (4 points)
        for sx in [-w * 0.48, w * 0.48]:
            for dy in [-l * 0.35, l * 0.35]:
                bmesh_create_cylinder(
                    bm, radius=0.024, depth=0.045, segments=24, cap_ends=True,
                    matrix=Matrix.Translation((sx, y_cen + dy, z_cen - 0.02)) @ Matrix.Rotation(math.radians(90), 4, 'X')
                )
        mesh = bpy.data.meshes.new(f"{mode}_Subframe_Cradle")
        bm.to_mesh(mesh)
        bm.free()
        cradle = bpy.data.objects.new(f"{mode}_Subframe_Cradle", mesh)
        cradle.data.materials.append(mat_cradle)
        col.objects.link(cradle)
        apply_mesh_polish(cradle, bevel_width=0.004, subsurf_levels=1)
        
        # 4 Hydraulic Chassis Isolation Bushings & M14 Through-Bolts
        for bx in [-w * 0.42, w * 0.42]:
            for by in [-l * 0.40, l * 0.40]:
                bm_b = bmesh.new()
                bmesh_create_cylinder(
                    bm_b, radius=0.042, depth=0.085, segments=32, cap_ends=True,
                    matrix=Matrix.Translation((bx, y_cen + by, z_cen + 0.02))
                )
                mesh_b = bpy.data.meshes.new(f"Bush_{mode}_{bx}_{by}")
                bm_b.to_mesh(mesh_b)
                bm_b.free()
                bush = bpy.data.objects.new(f"Bush_{mode}_{bx}_{by}", mesh_b)
                bush.data.materials.append(mat_bush)
                col.objects.link(bush)
                apply_mesh_polish(bush, bevel_width=0.002, subsurf_levels=1)
                
                # Heavy M14 Grade 10.9 flange bolt
                bolt = create_hex_bolt(f"Subframe_Bolt_{mode}_{bx}_{by}", radius=0.010, height=0.012, flange_radius=0.015, mat=mat_bolt)
                bolt.location = (bx, y_cen + by, z_cen + 0.065)
                col.objects.link(bolt)
                
        out_name = f"{mode.lower()}_subframe.glb"
        export_active_scene(os.path.join(INDIVIDUAL_DIR, out_name))

# ---------------------------------------------------------------------------
# 7. Indicators
# ---------------------------------------------------------------------------
def build_indicators():
    clear_blender_scene()
    col = ensure_collection("Indicators")
    mat_lens = get_or_create_material("Indicator_Polycarb_Lens", "glass_windshield")
    mat_led = get_or_create_material("Indicator_Amber_LED", "emissive_amber")
    mat_bezel = get_or_create_material("Indicator_Housing_Black", "rubber_black")
    mat_reflector = get_or_create_material("Indicator_Chrome_Reflector", "billet_aluminum")
    
    # Mirror and front indicator light assemblies
    for side, sx in [("Left", 0.88), ("Right", -0.88)]:
        # Housing bezel
        bm_h = bmesh.new()
        bmesh.ops.create_cube(
            bm_h, size=1.0,
            matrix=Matrix.Translation((sx, 0.45, 0.82)) @ Matrix.Diagonal((0.14, 0.035, 0.028, 1.0))
        )
        mesh_h = bpy.data.meshes.new(f"Indicator_Housing_{side}")
        bm_h.to_mesh(mesh_h)
        bm_h.free()
        housing = bpy.data.objects.new(f"Indicator_Housing_{side}", mesh_h)
        housing.data.materials.append(mat_bezel)
        col.objects.link(housing)
        apply_mesh_polish(housing, bevel_width=0.002, subsurf_levels=1)
        
        # Faceted chrome parabolic reflector trough
        bm_r = bmesh.new()
        bmesh.ops.create_cube(
            bm_r, size=1.0,
            matrix=Matrix.Translation((sx, 0.46, 0.82)) @ Matrix.Diagonal((0.12, 0.015, 0.020, 1.0))
        )
        mesh_r = bpy.data.meshes.new(f"Indicator_Reflector_{side}")
        bm_r.to_mesh(mesh_r)
        bm_r.free()
        reflector = bpy.data.objects.new(f"Indicator_Reflector_{side}", mesh_r)
        reflector.data.materials.append(mat_reflector)
        col.objects.link(reflector)
        apply_mesh_polish(reflector, bevel_width=0.001, subsurf_levels=1)
        
        # Dynamic sequential Amber LED chip array (10 chips per side)
        for led_idx in range(10):
            lx = sx - (0.055 * (1 if sx > 0 else -1)) + (led_idx * 0.012 * (1 if sx > 0 else -1))
            bm_l = bmesh.new()
            bmesh_create_cylinder(
                bm_l, radius=0.004, depth=0.003, segments=24, cap_ends=True,
                matrix=Matrix.Translation((lx, 0.465, 0.82)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
            )
            mesh_l = bpy.data.meshes.new(f"LED_Chip_{side}_{led_idx}")
            bm_l.to_mesh(mesh_l)
            bm_l.free()
            led = bpy.data.objects.new(f"LED_Chip_{side}_{led_idx}", mesh_l)
            led.data.materials.append(mat_led)
            col.objects.link(led)
            
        # Clear optical fluted outer cover lens with micro-prism ribs
        bm_lens = bmesh.new()
        bmesh.ops.create_cube(
            bm_lens, size=1.0,
            matrix=Matrix.Translation((sx, 0.47, 0.82)) @ Matrix.Diagonal((0.13, 0.008, 0.024, 1.0))
        )
        for pi in range(12):
            px = sx - (0.055 * (1 if sx > 0 else -1)) + (pi * 0.010 * (1 if sx > 0 else -1))
            bmesh_create_cylinder(
                bm_lens, radius=0.0015, depth=0.022, segments=12, cap_ends=True,
                matrix=Matrix.Translation((px, 0.473, 0.82))
            )
        mesh_lens = bpy.data.meshes.new(f"Indicator_Lens_{side}")
        bm_lens.to_mesh(mesh_lens)
        bm_lens.free()
        lens = bpy.data.objects.new(f"Indicator_Lens_{side}", mesh_lens)
        lens.data.materials.append(mat_lens)
        col.objects.link(lens)
        apply_mesh_polish(lens, bevel_width=0.0015)
        
    export_active_scene(os.path.join(INDIVIDUAL_DIR, "indicators.glb"))

# ---------------------------------------------------------------------------
# 8. Rear Spoiler
# ---------------------------------------------------------------------------
def build_rear_spoiler():
    clear_blender_scene()
    col = ensure_collection("Rear_Spoiler")
    mat_cf = get_or_create_material("Spoiler_Carbon_Wing", "carbon_twill")
    mat_pylon = get_or_create_material("Swan_Neck_Pylon_Billet", "billet_aluminum")
    mat_bolt = get_or_create_material("Pylon_Titanium_Hardware", "titanium")
    
    # 1. High-Downforce NACA Airfoil Blade
    bm = bmesh.new()
    wing_w = 1.36
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, -1.88, 1.08)) @ Matrix.Diagonal((wing_w, 0.26, 0.035, 1.0))
    )
    # Gurney flap trailing edge lip
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, -2.00, 1.095)) @ Matrix.Diagonal((wing_w, 0.012, 0.016, 1.0))
    )
    # Vortex generating vertical endplates
    for sx in [-wing_w * 0.5, wing_w * 0.5]:
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx, -1.88, 1.08)) @ Matrix.Diagonal((0.015, 0.32, 0.16, 1.0))
        )
    mesh = bpy.data.meshes.new("Rear_Spoiler_Blade")
    bm.to_mesh(mesh)
    bm.free()
    wing = bpy.data.objects.new("Rear_Spoiler_Blade", mesh)
    wing.data.materials.append(mat_cf)
    col.objects.link(wing)
    apply_mesh_polish(wing, bevel_width=0.003, subsurf_levels=1)
    
    # 2. Swan-Neck CNC Billet Upright Pylons
    for sx in [-0.34, 0.34]:
        bm_p = bmesh.new()
        bmesh.ops.create_cube(
            bm_p, size=1.0,
            matrix=Matrix.Translation((sx, -1.78, 0.98)) @ Matrix.Rotation(math.radians(-15), 4, 'X') @ Matrix.Diagonal((0.016, 0.06, 0.24, 1.0))
        )
        # Lightening pocket cutouts
        for pz in [0.94, 1.02]:
            bmesh_create_cylinder(
                bm_p, radius=0.018, depth=0.022, segments=28, cap_ends=True,
                matrix=Matrix.Translation((sx, -1.78, pz)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
            )
        mesh_p = bpy.data.meshes.new(f"Swan_Pylon_{sx:.2f}")
        bm_p.to_mesh(mesh_p)
        bm_p.free()
        pylon = bpy.data.objects.new(f"Swan_Pylon_{sx:.2f}", mesh_p)
        pylon.data.materials.append(mat_pylon)
        col.objects.link(pylon)
        apply_mesh_polish(pylon, bevel_width=0.002, subsurf_levels=1)
        
        # Base decklid mounting bolts
        for dy in [-0.03, 0.03]:
            b = create_hex_bolt(f"Pylon_Bolt_{sx}_{dy}", radius=0.004, height=0.006, mat=mat_bolt)
            b.location = (sx, -1.70 + dy, 0.86)
            col.objects.link(b)
            
    export_active_scene(os.path.join(INDIVIDUAL_DIR, "rear_spoiler.glb"))

# ---------------------------------------------------------------------------
# 9. Center Console
# ---------------------------------------------------------------------------
def build_center_console():
    clear_blender_scene()
    col = ensure_collection("Center_Console")
    mat_leather = get_or_create_material("Console_Leather_Trim", "leather_interior")
    mat_cf = get_or_create_material("Console_Carbon_Tunnel", "carbon_twill")
    mat_billet = get_or_create_material("Console_Billet_Dial", "billet_aluminum")
    mat_button = get_or_create_material("Console_Tactile_Buttons", "rubber_black")
    
    # 1. Main Transmission Tunnel Console
    bm = bmesh.new()
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, 0.12, 0.44)) @ Matrix.Diagonal((0.26, 0.88, 0.22, 1.0))
    )
    mesh = bpy.data.meshes.new("Center_Console_Base")
    bm.to_mesh(mesh)
    bm.free()
    base = bpy.data.objects.new("Center_Console_Base", mesh)
    base.data.materials.append(mat_cf)
    col.objects.link(base)
    apply_mesh_polish(base, bevel_width=0.006, subsurf_levels=1)
    
    # 2. Leather Padded Armrest Box Lid
    bm_arm = bmesh.new()
    bmesh.ops.create_cube(
        bm_arm, size=1.0,
        matrix=Matrix.Translation((0, -0.16, 0.57)) @ Matrix.Diagonal((0.22, 0.36, 0.045, 1.0))
    )
    mesh_arm = bpy.data.meshes.new("Leather_Armrest_Lid")
    bm_arm.to_mesh(mesh_arm)
    bm_arm.free()
    armrest = bpy.data.objects.new("Leather_Armrest_Lid", mesh_arm)
    armrest.data.materials.append(mat_leather)
    col.objects.link(armrest)
    apply_mesh_polish(armrest, bevel_width=0.008, subsurf_levels=1)
    
    # 3. Dual Cup Holders with Machined Chrome Bezels
    for cy in [0.08, 0.20]:
        bm_cup = bmesh.new()
        bmesh_create_cylinder(
            bm_cup, radius=0.038, depth=0.045, segments=32, cap_ends=True,
            matrix=Matrix.Translation((0.04, cy, 0.54))
        )
        mesh_cup = bpy.data.meshes.new(f"Cupholder_{cy}")
        bm_cup.to_mesh(mesh_cup)
        bm_cup.free()
        cup = bpy.data.objects.new(f"Cupholder_{cy}", mesh_cup)
        cup.data.materials.append(mat_billet)
        col.objects.link(cup)
        apply_mesh_polish(cup, bevel_width=0.002, subsurf_levels=1)
        
    # 4. Knurled Billet Rotary MMI / Drive Mode Controller
    bm_dial = bmesh.new()
    bmesh_create_cylinder(
        bm_dial, radius=0.032, depth=0.024, segments=36, cap_ends=True,
        matrix=Matrix.Translation((-0.05, 0.14, 0.56))
    )
    # Perimeter knurling ridges
    for rid in range(20):
        ang = rid * (math.pi * 2.0 / 20)
        bmesh.ops.create_cube(
            bm_dial, size=1.0,
            matrix=Matrix.Translation((-0.05 + math.cos(ang)*0.032, 0.14 + math.sin(ang)*0.032, 0.56)) @
                   Matrix.Diagonal((0.003, 0.003, 0.020, 1.0))
        )
    mesh_dial = bpy.data.meshes.new("Rotary_DriveMode_Dial")
    bm_dial.to_mesh(mesh_dial)
    bm_dial.free()
    dial = bpy.data.objects.new("Rotary_DriveMode_Dial", mesh_dial)
    dial.data.materials.append(mat_billet)
    col.objects.link(dial)
    apply_mesh_polish(dial, bevel_width=0.0015)
    
    # 5. Electronic Park Brake (EPB) Lever & Control Buttons
    bm_btn = bmesh.new()
    bmesh.ops.create_cube(
        bm_btn, size=1.0,
        matrix=Matrix.Translation((-0.05, 0.24, 0.555)) @ Matrix.Diagonal((0.04, 0.05, 0.015, 1.0))
    )
    mesh_btn = bpy.data.meshes.new("EPB_Switch_Unit")
    bm_btn.to_mesh(mesh_btn)
    bm_btn.free()
    btn = bpy.data.objects.new("EPB_Switch_Unit", mesh_btn)
    btn.data.materials.append(mat_button)
    col.objects.link(btn)
    apply_mesh_polish(btn, bevel_width=0.001)
    
    # 6. Machined Billet Gear Selector Stalk & Leather Boot
    bm_sh = bmesh.new()
    bmesh_create_cylinder(
        bm_sh, radius=0.035, depth=0.025, segments=28, cap_ends=True,
        matrix=Matrix.Translation((-0.05, 0.02, 0.55))
    )
    bmesh_create_cylinder(
        bm_sh, radius=0.014, depth=0.065, segments=24, cap_ends=True,
        matrix=Matrix.Translation((-0.05, 0.02, 0.59))
    )
    mesh_sh = bpy.data.meshes.new("Gear_Shifter_Assembly")
    bm_sh.to_mesh(mesh_sh)
    bm_sh.free()
    shifter = bpy.data.objects.new("Gear_Shifter_Assembly", mesh_sh)
    shifter.data.materials.append(mat_billet)
    col.objects.link(shifter)
    apply_mesh_polish(shifter, bevel_width=0.002, subsurf_levels=1)
    
    export_active_scene(os.path.join(INDIVIDUAL_DIR, "center_console.glb"))

# ---------------------------------------------------------------------------
# 10. Powertrain Gearbox
# ---------------------------------------------------------------------------
def build_powertrain_gearbox():
    clear_blender_scene()
    col = ensure_collection("Powertrain_Gearbox")
    mat_case = get_or_create_material("Transaxle_Cast_Alloy", "cast_aluminum")
    mat_mecha = get_or_create_material("Mechatronics_Cover_Black", "carbon_twill")
    mat_shaft = get_or_create_material("Splined_Shaft_Steel", "titanium")
    mat_bolt = get_or_create_material("Bellhousing_Bolts", "billet_aluminum")
    mat_filter = get_or_create_material("Transmission_Oil_Filter", "anodized_blue")
    
    # 1. Sculpted Dual-Clutch / Sequential Transaxle Transmission Casing
    bm = bmesh.new()
    # Bellhousing forward bell cone
    bmesh_create_cylinder(
        bm, radius=0.22, depth=0.18, segments=36, cap_ends=True,
        matrix=Matrix.Translation((0, 0.05, 0.32)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    # Gearbox central gear cluster case
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, -0.22, 0.32)) @ Matrix.Diagonal((0.34, 0.38, 0.32, 1.0))
    )
    # Rear differential housing bulb
    bmesh_create_cylinder(
        bm, radius=0.14, depth=0.24, segments=32, cap_ends=True,
        matrix=Matrix.Translation((0, -0.46, 0.28)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    )
    # Structural stiffening ribs across top of casing
    for ry in [-0.10, -0.18, -0.26, -0.34]:
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((0, ry, 0.49)) @ Matrix.Diagonal((0.32, 0.014, 0.024, 1.0))
        )
    mesh = bpy.data.meshes.new("Gearbox_Casing")
    bm.to_mesh(mesh)
    bm.free()
    case = bpy.data.objects.new("Gearbox_Casing", mesh)
    case.data.materials.append(mat_case)
    col.objects.link(case)
    apply_mesh_polish(case, bevel_width=0.005, subsurf_levels=1)
    
    # 2. Side-Mounted Mechatronic TCU Valve Body Pan
    bm_m = bmesh.new()
    bmesh.ops.create_cube(
        bm_m, size=1.0,
        matrix=Matrix.Translation((0.18, -0.22, 0.32)) @ Matrix.Diagonal((0.025, 0.28, 0.24, 1.0))
    )
    mesh_m = bpy.data.meshes.new("Mechatronics_Pan")
    bm_m.to_mesh(mesh_m)
    bm_m.free()
    pan = bpy.data.objects.new("Mechatronics_Pan", mesh_m)
    pan.data.materials.append(mat_mecha)
    col.objects.link(pan)
    apply_mesh_polish(pan, bevel_width=0.002, subsurf_levels=1)
    
    # 3. Output Half-Shaft Flanges (Left & Right)
    for sx in [0.20, -0.20]:
        bm_s = bmesh.new()
        bmesh_create_cylinder(
            bm_s, radius=0.052, depth=0.045, segments=32, cap_ends=True,
            matrix=Matrix.Translation((sx, -0.46, 0.28)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        mesh_s = bpy.data.meshes.new(f"Output_Flange_{sx}")
        bm_s.to_mesh(mesh_s)
        bm_s.free()
        flange = bpy.data.objects.new(f"Output_Flange_{sx}", mesh_s)
        flange.data.materials.append(mat_shaft)
        col.objects.link(flange)
        apply_mesh_polish(flange, bevel_width=0.002)
        
    # Spin-on canister oil filter
    bm_f = bmesh.new()
    bmesh_create_cylinder(
        bm_f, radius=0.038, depth=0.08, segments=32, cap_ends=True,
        matrix=Matrix.Translation((-0.18, -0.16, 0.24)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    )
    mesh_f = bpy.data.meshes.new("Transmission_Oil_Filter")
    bm_f.to_mesh(mesh_f)
    bm_f.free()
    fil = bpy.data.objects.new("Transmission_Oil_Filter", mesh_f)
    fil.data.materials.append(mat_filter)
    col.objects.link(fil)
    apply_mesh_polish(fil, bevel_width=0.002, subsurf_levels=1)
    
    # 4. Bellhousing Flange Bolt Circle (8 bolts)
    for bi in range(8):
        ang = bi * (math.pi * 2.0 / 8)
        bb = create_hex_bolt(f"Bell_Bolt_{bi}", radius=0.007, height=0.010, flange_radius=0.012, mat=mat_bolt)
        bb.location = (math.cos(ang) * 0.21, 0.14, 0.32 + math.sin(ang) * 0.21)
        bb.rotation_euler = (math.radians(90), 0, 0)
        col.objects.link(bb)
        
    export_active_scene(os.path.join(MODULAR_DIR, "powertrain_gearbox.glb"))

def main():
    log("Upgrading 10 Modular Chassis & Subassembly Parts with High-Mesh CAD Geometry...")
    build_antiroll_bars()
    build_driveshaft()
    build_modular_grille()
    build_rear_structure()
    build_subframes()
    build_indicators()
    build_rear_spoiler()
    build_center_console()
    build_powertrain_gearbox()
    log("[SUCCESS] All 10 Modular Chassis Parts upgraded successfully!")

if __name__ == "__main__":
    main()
