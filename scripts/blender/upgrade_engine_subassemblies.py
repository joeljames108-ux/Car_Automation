"""
==============================================================================
ENGINE SUBASSEMBLIES HIGH-MESH CAD UPGRADE PIPELINE (BLENDER 5.2 LTS)
==============================================================================
Upgrades low-poly V8 engine subassemblies to precision automotive CAD models:
- engine_v8_intercooler.glb (cast aluminum end tanks, tube-and-fin micro-core, silicone couplers, T-bolt clamps)
- engine_v8_dipstick.glb (knurled billet aluminum handle, coiled stainless sheath, cross-hatch measurement indicator)
- engine_v8_mounts.glb (cast alloy triangular bracket, dual durometer polyurethane dampeners, Grade 10.9 through-bolts)
- engine_v8_oilpan.glb (finned dry-sump pan, scavenge pump ports, magnetic drain plug, 14 perimeter bolts)
- engine_v8_starter.glb (high-torque geared reduction motor, starter solenoid, Bendix pinion gear, copper terminals)
- engine_v8_valvecover_l.glb & engine_v8_valvecover_r.glb (billet valve covers, COP ignition coil packs, oil cap, bolts)
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
ENGINES_DIR = os.path.join(PROJECT_ROOT, "public", "models", "engines")

def log(msg):
    print(f"[ENGINE_UPGRADE] {msg}")

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
# 1. Engine V8 Intercooler
# ---------------------------------------------------------------------------
def build_engine_intercooler():
    clear_blender_scene()
    col = ensure_collection("V8_Intercooler")
    mat_al = get_or_create_material("Cast_Aluminum_EndTank", "cast_aluminum")
    mat_silicone = get_or_create_material("Silicone_Coupler_Black", "rubber_black")
    mat_clamp = get_or_create_material("T_Bolt_Clamp_Stainless", "billet_aluminum")
    mat_fin = get_or_create_material("Intercooler_Micro_Fins", "cast_aluminum")
    
    # 1. Dual Bar-and-Plate Cooling Core
    core_w = 0.55
    core_d = 0.12
    core_h = 0.24
    core = create_cooling_fin_array("Intercooler_Core", width=core_w, depth=core_d, height=core_h, fin_count=36, mat=mat_fin)
    core.location = (0, 1.45, 0.35)
    col.objects.link(core)
    
    # 2. Left & Right Aerodynamic Cast End Tanks
    for side, sx in [("Left", 1.0), ("Right", -1.0)]:
        bm = bmesh.new()
        # Tapered cast tank volume
        tank_x = sx * (core_w * 0.5 + 0.04)
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((tank_x, 1.45, 0.35)) @ Matrix.Diagonal((0.08, core_d * 1.05, core_h * 1.02, 1.0))
        )
        # Inlet/Outlet 3.0" mandreled tube neck
        neck_x = sx * (core_w * 0.5 + 0.08)
        bmesh_create_cylinder(
            bm, radius=0.038, depth=0.08, segments=32, cap_ends=True,
            matrix=Matrix.Translation((neck_x, 1.45, 0.40)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        # Pressure sensor boss
        bmesh_create_cylinder(
            bm, radius=0.012, depth=0.016, segments=24, cap_ends=True,
            matrix=Matrix.Translation((tank_x, 1.45, 0.47))
        )
        mesh_t = bpy.data.meshes.new(f"EndTank_{side}")
        bm.to_mesh(mesh_t)
        bm.free()
        tank = bpy.data.objects.new(f"EndTank_{side}", mesh_t)
        tank.data.materials.append(mat_al)
        col.objects.link(tank)
        apply_mesh_polish(tank, bevel_width=0.004)
        
        # 4-ply reinforced silicone boot coupler
        bm_c = bmesh.new()
        bmesh_create_cylinder(
            bm_c, radius=0.040, depth=0.06, segments=32, cap_ends=True,
            matrix=Matrix.Translation((neck_x + (0.04 * sx), 1.45, 0.40)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        mesh_c = bpy.data.meshes.new(f"Silicone_Boot_{side}")
        bm_c.to_mesh(mesh_c)
        bm_c.free()
        boot = bpy.data.objects.new(f"Silicone_Boot_{side}", mesh_c)
        boot.data.materials.append(mat_silicone)
        col.objects.link(boot)
        apply_mesh_polish(boot, bevel_width=0.002)
        
        # Stainless steel T-bolt hose clamps
        for clamp_x in [neck_x + (0.02 * sx), neck_x + (0.06 * sx)]:
            bm_cl = bmesh.new()
            bmesh_create_cylinder(
                bm_cl, radius=0.042, depth=0.012, segments=32, cap_ends=True,
                matrix=Matrix.Translation((clamp_x, 1.45, 0.40)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
            )
            mesh_cl = bpy.data.meshes.new(f"T_Bolt_Clamp_{side}_{clamp_x:.2f}")
            bm_cl.to_mesh(mesh_cl)
            bm_cl.free()
            clamp = bpy.data.objects.new(f"T_Bolt_Clamp_{side}_{clamp_x:.2f}", mesh_cl)
            clamp.data.materials.append(mat_clamp)
            col.objects.link(clamp)
            apply_mesh_polish(clamp, bevel_width=0.0015)
            
    export_active_scene(os.path.join(ENGINES_DIR, "engine_v8_intercooler.glb"))

# ---------------------------------------------------------------------------
# 2. Engine V8 Dipstick
# ---------------------------------------------------------------------------
def build_engine_dipstick():
    clear_blender_scene()
    col = ensure_collection("V8_Dipstick")
    mat_handle = get_or_create_material("Anodized_Billet_Dipstick_Handle", "anodized_red")
    mat_tube = get_or_create_material("Stainless_Guide_Tube", "billet_aluminum")
    mat_tip = get_or_create_material("Measurement_Blade_Steel", "cast_aluminum")
    mat_rubber = get_or_create_material("O_Ring_Viton", "rubber_black")
    
    # 1. Billet knurled pull ring handle
    bm_h = bmesh.new()
    # Ergonomic finger ring loop
    bmesh_create_cylinder(
        bm_h, radius=0.024, depth=0.010, segments=32, cap_ends=True,
        matrix=Matrix.Translation((0.34, 0.45, 0.78)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    )
    # Ring center hole cutout
    bmesh_create_cylinder(
        bm_h, radius=0.016, depth=0.012, segments=28, cap_ends=True,
        matrix=Matrix.Translation((0.34, 0.45, 0.78)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    )
    # Handle base plug
    bmesh_create_cylinder(
        bm_h, radius=0.014, depth=0.025, segments=24, cap_ends=True,
        matrix=Matrix.Translation((0.34, 0.45, 0.75))
    )
    mesh_h = bpy.data.meshes.new("Dipstick_Handle")
    bm_h.to_mesh(mesh_h)
    bm_h.free()
    handle = bpy.data.objects.new("Dipstick_Handle", mesh_h)
    handle.data.materials.append(mat_handle)
    col.objects.link(handle)
    apply_mesh_polish(handle, bevel_width=0.002)
    
    # Viton O-ring seal
    bm_o = bmesh.new()
    bmesh_create_cylinder(
        bm_o, radius=0.013, depth=0.004, segments=24, cap_ends=True,
        matrix=Matrix.Translation((0.34, 0.45, 0.742))
    )
    mesh_o = bpy.data.meshes.new("Dipstick_ORing")
    bm_o.to_mesh(mesh_o)
    bm_o.free()
    oring = bpy.data.objects.new("Dipstick_ORing", mesh_o)
    oring.data.materials.append(mat_rubber)
    col.objects.link(oring)
    
    # 2. Curving stainless guide tube
    bm_t = bmesh.new()
    segments = 36
    tube_len = 0.50
    for i in range(segments):
        t = i / (segments - 1)
        z = 0.74 - t * tube_len
        # Graceful curved routing down into oil pan
        curve = math.sin(t * math.pi * 0.8) * 0.04
        x = 0.34 - (t * 0.06) + curve
        y = 0.45 - (t * 0.08)
        bmesh_create_cylinder(
            bm_t, radius=0.006, depth=tube_len / segments * 1.05, segments=20, cap_ends=True,
            matrix=Matrix.Translation((x, y, z))
        )
    mesh_t = bpy.data.meshes.new("Dipstick_Guide_Tube")
    bm_t.to_mesh(mesh_t)
    bm_t.free()
    tube = bpy.data.objects.new("Dipstick_Guide_Tube", mesh_t)
    tube.data.materials.append(mat_tube)
    col.objects.link(tube)
    apply_mesh_polish(tube, bevel_width=0.0015)
    
    # 3. Measurement indicator flat spring steel blade
    bm_b = bmesh.new()
    bmesh.ops.create_cube(
        bm_b, size=1.0,
        matrix=Matrix.Translation((0.28, 0.37, 0.20)) @ Matrix.Diagonal((0.0015, 0.012, 0.08, 1.0))
    )
    # Min/Max punch hole indicators
    for pz in [0.18, 0.22]:
        bmesh_create_cylinder(
            bm_b, radius=0.002, depth=0.004, segments=16, cap_ends=True,
            matrix=Matrix.Translation((0.28, 0.37, pz)) @ Matrix.Rotation(math.radians(90), 4, 'X')
        )
    mesh_b = bpy.data.meshes.new("Dipstick_Blade")
    bm_b.to_mesh(mesh_b)
    bm_b.free()
    blade = bpy.data.objects.new("Dipstick_Blade", mesh_b)
    blade.data.materials.append(mat_tip)
    col.objects.link(blade)
    
    export_active_scene(os.path.join(ENGINES_DIR, "engine_v8_dipstick.glb"))

# ---------------------------------------------------------------------------
# 3. Engine V8 Mounts
# ---------------------------------------------------------------------------
def build_engine_mounts():
    clear_blender_scene()
    col = ensure_collection("V8_Mounts")
    mat_bracket = get_or_create_material("Cast_Aluminum_Engine_Bracket", "cast_aluminum")
    mat_poly = get_or_create_material("Polyurethane_Bushing_80A", "rubber_black")
    mat_bolt = get_or_create_material("Grade_10.9_Chassis_Bolt", "titanium")
    
    for side, sx in [("Left", 0.32), ("Right", -0.32)]:
        bm = bmesh.new()
        # Cast aluminum triangular truss bracket bolted to cylinder block
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx, 0.42, 0.38)) @ Matrix.Diagonal((0.09, 0.14, 0.12, 1.0))
        )
        # Gusseted lightening web pockets
        bmesh.ops.create_cylinder = None # ensure using bmesh_create_cylinder
        bmesh_create_cylinder(
            bm, radius=0.022, depth=0.10, segments=24, cap_ends=True,
            matrix=Matrix.Translation((sx, 0.42, 0.38)) @ Matrix.Rotation(math.radians(90), 4, 'X')
        )
        # Isolator mounting cup collar
        bmesh_create_cylinder(
            bm, radius=0.042, depth=0.05, segments=32, cap_ends=True,
            matrix=Matrix.Translation((sx * 1.15, 0.42, 0.32))
        )
        mesh = bpy.data.meshes.new(f"Engine_Bracket_{side}")
        bm.to_mesh(mesh)
        bm.free()
        bracket = bpy.data.objects.new(f"Engine_Bracket_{side}", mesh)
        bracket.data.materials.append(mat_bracket)
        col.objects.link(bracket)
        apply_mesh_polish(bracket, bevel_width=0.003)
        
        # Dual-durometer polyurethane vibration dampener puck
        bm_p = bmesh.new()
        bmesh_create_cylinder(
            bm_p, radius=0.038, depth=0.065, segments=32, cap_ends=True,
            matrix=Matrix.Translation((sx * 1.15, 0.42, 0.32))
        )
        mesh_p = bpy.data.meshes.new(f"Poly_Isolator_{side}")
        bm_p.to_mesh(mesh_p)
        bm_p.free()
        poly = bpy.data.objects.new(f"Poly_Isolator_{side}", mesh_p)
        poly.data.materials.append(mat_poly)
        col.objects.link(poly)
        apply_mesh_polish(poly, bevel_width=0.002)
        
        # Grade 10.9 center through-bolt with nylon locknut
        bolt = create_hex_bolt(f"Center_Mount_Bolt_{side}", radius=0.010, height=0.012, flange_radius=0.016, mat=mat_bolt)
        bolt.location = (sx * 1.15, 0.42, 0.36)
        col.objects.link(bolt)
        
        # Block mounting flange bolts (3x triangulated)
        for dy, dz in [(-0.045, -0.04), (0.045, -0.04), (0.0, 0.045)]:
            b = create_hex_bolt(f"Block_Bolt_{side}_{dy}_{dz}", radius=0.006, height=0.006, mat=mat_bolt)
            b.location = (sx * 0.90, 0.42 + dy, 0.38 + dz)
            b.rotation_euler = (0, math.radians(90 * (1 if sx > 0 else -1)), 0)
            col.objects.link(b)
            
    export_active_scene(os.path.join(ENGINES_DIR, "engine_v8_mounts.glb"))

# ---------------------------------------------------------------------------
# 4. Engine V8 Oil Pan
# ---------------------------------------------------------------------------
def build_engine_oilpan():
    clear_blender_scene()
    col = ensure_collection("V8_OilPan")
    mat_pan = get_or_create_material("CNC_Billet_Aluminum_OilPan", "billet_aluminum")
    mat_plug = get_or_create_material("Magnetic_Drain_Plug_Brass", "copper_brass")
    mat_fitting = get_or_create_material("Scavenge_AN_Fitting_Blue", "anodized_blue")
    mat_bolt = get_or_create_material("Stainless_Flange_Bolts", "titanium")
    
    pan_w = 0.36
    pan_len = 0.58
    pan_depth = 0.14
    
    bm = bmesh.new()
    # Sculpted multi-stage dry sump oil pan reservoir
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, 0.40, 0.18)) @ Matrix.Diagonal((pan_w, pan_len, pan_depth, 1.0))
    )
    # Deep rear oil sump sump collection bowl
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, 0.22, 0.12)) @ Matrix.Diagonal((pan_w * 0.85, pan_len * 0.42, 0.08, 1.0))
    )
    # External cooling fins machined into bottom pan floor
    for fy in range(12):
        pos_y = 0.14 + fy * 0.042
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((0, pos_y, 0.075)) @ Matrix.Diagonal((pan_w * 0.92, 0.006, 0.018, 1.0))
        )
    # Perimeter gasket mounting flange with CNC step
    bmesh.ops.create_cube(
        bm, size=1.0,
        matrix=Matrix.Translation((0, 0.40, 0.245)) @ Matrix.Diagonal((pan_w + 0.04, pan_len + 0.04, 0.015, 1.0))
    )
    mesh = bpy.data.meshes.new("V8_Oil_Pan_Body")
    bm.to_mesh(mesh)
    bm.free()
    pan = bpy.data.objects.new("V8_Oil_Pan_Body", mesh)
    pan.data.materials.append(mat_pan)
    col.objects.link(pan)
    apply_mesh_polish(pan, bevel_width=0.003)
    
    # Brass magnetic drain plug
    plug = create_hex_bolt("Magnetic_Drain_Plug", radius=0.012, height=0.008, flange_radius=0.016, mat=mat_plug)
    plug.location = (pan_w * 0.42, 0.20, 0.09)
    plug.rotation_euler = (0, math.radians(90), 0)
    col.objects.link(plug)
    
    # 3x Scavenge pump AN-12 return line ports
    for s_idx, sy in enumerate([0.22, 0.35, 0.48]):
        scav = create_hex_bolt(f"Scavenge_Port_{s_idx}", radius=0.011, height=0.014, flange_radius=0.014, mat=mat_fitting)
        scav.location = (-pan_w * 0.49, sy, 0.14)
        scav.rotation_euler = (0, math.radians(-90), 0)
        col.objects.link(scav)
        
    # 14 Perimeter block mounting bolts
    for bx in [-pan_w * 0.48, pan_w * 0.48]:
        for by_idx in range(7):
            by = 0.15 + by_idx * 0.08
            b = create_hex_bolt(f"Pan_Bolt_{bx}_{by_idx}", radius=0.0045, height=0.004, mat=mat_bolt)
            b.location = (bx, by, 0.252)
            col.objects.link(b)
            
    export_active_scene(os.path.join(ENGINES_DIR, "engine_v8_oilpan.glb"))

# ---------------------------------------------------------------------------
# 5. Engine V8 Starter
# ---------------------------------------------------------------------------
def build_engine_starter():
    clear_blender_scene()
    col = ensure_collection("V8_Starter")
    mat_motor = get_or_create_material("Starter_Motor_Case_Black", "carbon_twill")
    mat_solenoid = get_or_create_material("Starter_Solenoid_Zinc", "billet_aluminum")
    mat_copper = get_or_create_material("Starter_Copper_Terminals", "copper_brass")
    mat_gear = get_or_create_material("Bendix_Pinion_Gear_Steel", "titanium")
    mat_cast = get_or_create_material("Starter_Mounting_Nose_Cast", "cast_aluminum")
    
    # 1. Main high-torque DC electric motor cylinder with cooling ribs
    bm_m = bmesh.new()
    bmesh_create_cylinder(
        bm_m, radius=0.045, depth=0.18, segments=36, cap_ends=True,
        matrix=Matrix.Translation((0.24, 0.20, 0.22)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    )
    # Circumferential cooling ribs
    for rib_idx in range(6):
        rx = 0.17 + rib_idx * 0.024
        bmesh_create_cylinder(
            bm_m, radius=0.047, depth=0.006, segments=36, cap_ends=True,
            matrix=Matrix.Translation((rx, 0.20, 0.22)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
    # Rear bearing end-cap
    bmesh_create_cylinder(
        bm_m, radius=0.042, depth=0.02, segments=32, cap_ends=True,
        matrix=Matrix.Translation((0.33, 0.20, 0.22)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    )
    mesh_m = bpy.data.meshes.new("Starter_Motor_Cylinder")
    bm_m.to_mesh(mesh_m)
    bm_m.free()
    motor = bpy.data.objects.new("Starter_Motor_Cylinder", mesh_m)
    motor.data.materials.append(mat_motor)
    col.objects.link(motor)
    apply_mesh_polish(motor, bevel_width=0.002)
    
    # 2. Solenoid cylinder mounted on top
    bm_s = bmesh.new()
    bmesh_create_cylinder(
        bm_s, radius=0.028, depth=0.12, segments=32, cap_ends=True,
        matrix=Matrix.Translation((0.25, 0.20, 0.29)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    )
    # Solenoid contact cap
    bmesh_create_cylinder(
        bm_s, radius=0.026, depth=0.015, segments=28, cap_ends=True,
        matrix=Matrix.Translation((0.31, 0.20, 0.29)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    )
    mesh_s = bpy.data.meshes.new("Starter_Solenoid")
    bm_s.to_mesh(mesh_s)
    bm_s.free()
    solenoid = bpy.data.objects.new("Starter_Solenoid", mesh_s)
    solenoid.data.materials.append(mat_solenoid)
    col.objects.link(solenoid)
    apply_mesh_polish(solenoid, bevel_width=0.002)
    
    # 3. High-amperage copper electrical terminals & heavy braided shunt
    for tz in [0.28, 0.30]:
        term = create_hex_bolt(f"Starter_Terminal_{tz}", radius=0.007, height=0.010, flange_radius=0.009, mat=mat_copper)
        term.location = (0.318, 0.20, tz)
        term.rotation_euler = (0, math.radians(90), 0)
        col.objects.link(term)
        
    # Braided copper shunt wire connecting solenoid to starter body
    bm_w = bmesh.new()
    bmesh_create_cylinder(
        bm_w, radius=0.005, depth=0.05, segments=20, cap_ends=True,
        matrix=Matrix.Translation((0.28, 0.20, 0.255))
    )
    mesh_w = bpy.data.meshes.new("Starter_Copper_Shunt")
    bm_w.to_mesh(mesh_w)
    bm_w.free()
    shunt = bpy.data.objects.new("Starter_Copper_Shunt", mesh_w)
    shunt.data.materials.append(mat_copper)
    col.objects.link(shunt)
    apply_mesh_polish(shunt, bevel_width=0.001)
    
    # 4. Cast aluminum nose cone & mounting flange
    bm_n = bmesh.new()
    bmesh_create_cylinder(
        bm_n, radius=0.048, depth=0.05, segments=36, cap_ends=True,
        matrix=Matrix.Translation((0.13, 0.20, 0.24)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    )
    bmesh.ops.create_cube(
        bm_n, size=1.0,
        matrix=Matrix.Translation((0.13, 0.20, 0.24)) @ Matrix.Diagonal((0.025, 0.16, 0.12, 1.0))
    )
    mesh_n = bpy.data.meshes.new("Starter_Mounting_Nose")
    bm_n.to_mesh(mesh_n)
    bm_n.free()
    nose = bpy.data.objects.new("Starter_Mounting_Nose", mesh_n)
    nose.data.materials.append(mat_cast)
    col.objects.link(nose)
    apply_mesh_polish(nose, bevel_width=0.003)
    
    # Starter bellhousing mounting bolts (2x Grade 10.9)
    for ny in [-0.06, 0.06]:
        b = create_hex_bolt(f"Starter_Mount_Bolt_{ny}", radius=0.006, height=0.008, flange_radius=0.009, mat=mat_gear)
        b.location = (0.145, 0.20 + ny, 0.24)
        b.rotation_euler = (0, math.radians(90), 0)
        col.objects.link(b)
        
    # 5. Bendix 9-tooth starter drive pinion gear
    bm_g = bmesh.new()
    bmesh_create_cylinder(
        bm_g, radius=0.018, depth=0.028, segments=24, cap_ends=True,
        matrix=Matrix.Translation((0.09, 0.20, 0.22)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    )
    # Gear teeth notches
    for tooth in range(11):
        ang = tooth * (math.pi * 2.0 / 11)
        bmesh.ops.create_cube(
            bm_g, size=1.0,
            matrix=Matrix.Translation((0.09, 0.20 + math.cos(ang)*0.019, 0.22 + math.sin(ang)*0.019)) @
                   Matrix.Rotation(ang, 4, 'X') @ Matrix.Diagonal((0.025, 0.005, 0.005, 1.0))
        )
    mesh_g = bpy.data.meshes.new("Bendix_Pinion_Gear")
    bm_g.to_mesh(mesh_g)
    bm_g.free()
    gear = bpy.data.objects.new("Bendix_Pinion_Gear", mesh_g)
    gear.data.materials.append(mat_gear)
    col.objects.link(gear)
    apply_mesh_polish(gear, bevel_width=0.001)
    
    export_active_scene(os.path.join(ENGINES_DIR, "engine_v8_starter.glb"))

# ---------------------------------------------------------------------------
# 6 & 7. Engine V8 Valve Covers (Left & Right)
# ---------------------------------------------------------------------------
def build_engine_valvecovers():
    for side, sx in [("Left", 0.26), ("Right", -0.26)]:
        clear_blender_scene()
        col = ensure_collection(f"V8_ValveCover_{side}")
        
        mat_billet = get_or_create_material(f"CNC_Billet_ValveCover_{side}", "anodized_red")
        mat_cf = get_or_create_material(f"Carbon_Coil_Pack_Cover_{side}", "carbon_twill")
        mat_cap = get_or_create_material(f"Billet_Oil_Filler_Cap_{side}", "billet_aluminum")
        mat_bolt = get_or_create_material(f"Stainless_ValveCover_Bolts_{side}", "titanium")
        mat_plug = get_or_create_material(f"Ignition_Coil_Head_{side}", "rubber_black")
        
        bank_angle = math.radians(45 if sx > 0 else -45)
        rot_mat = Matrix.Rotation(bank_angle, 4, 'Y')
        
        bm = bmesh.new()
        # Sculpted CNC billet valve cover with dual camshaft clearance gallerias
        cover_w = 0.16
        cover_len = 0.54
        bmesh.ops.create_cube(
            bm, size=1.0,
            matrix=Matrix.Translation((sx, 0.42, 0.68)) @ rot_mat @ Matrix.Diagonal((cover_w, cover_len, 0.065, 1.0))
        )
        # Camshaft lobe clearance humps (intake & exhaust)
        for hx in [-0.04, 0.04]:
            bmesh_create_cylinder(
                bm, radius=0.032, depth=cover_len * 0.94, segments=28, cap_ends=True,
                matrix=Matrix.Translation((sx + (hx * math.cos(bank_angle)), 0.42, 0.71 + (hx * math.sin(bank_angle)))) @ 
                       rot_mat @ Matrix.Rotation(math.radians(90), 4, 'X')
            )
        mesh = bpy.data.meshes.new(f"ValveCover_{side}_Body")
        bm.to_mesh(mesh)
        bm.free()
        cover = bpy.data.objects.new(f"ValveCover_{side}_Body", mesh)
        cover.data.materials.append(mat_billet)
        col.objects.link(cover)
        apply_mesh_polish(cover, bevel_width=0.003)
        
        # 4 Individual Coil-on-Plug (COP) ignition packs
        for cyl in range(4):
            cy = 0.22 + cyl * 0.13
            bm_cop = bmesh.new()
            bmesh.ops.create_cube(
                bm_cop, size=1.0,
                matrix=Matrix.Translation((sx, cy, 0.74)) @ rot_mat @ Matrix.Diagonal((0.042, 0.075, 0.035, 1.0))
            )
            # Electrical harness connector plug
            bmesh.ops.create_cube(
                bm_cop, size=1.0,
                matrix=Matrix.Translation((sx, cy + 0.035, 0.75)) @ rot_mat @ Matrix.Diagonal((0.024, 0.022, 0.020, 1.0))
            )
            mesh_c = bpy.data.meshes.new(f"COP_{side}_{cyl}")
            bm_cop.to_mesh(mesh_c)
            bm_cop.free()
            cop = bpy.data.objects.new(f"COP_{side}_{cyl}", mesh_c)
            cop.data.materials.append(mat_plug)
            col.objects.link(cop)
            apply_mesh_polish(cop, bevel_width=0.0015)
            
            # Coil retaining titanium bolt
            c_bolt = create_hex_bolt(f"COP_Bolt_{side}_{cyl}", radius=0.0035, height=0.004, mat=mat_bolt)
            c_bolt.location = (sx - (0.015 * math.cos(bank_angle)), cy - 0.028, 0.745)
            col.objects.link(c_bolt)
            
        # Knurled Billet Oil Filler Cap (Left side only)
        if sx > 0:
            bm_cap = bmesh.new()
            bmesh_create_cylinder(
                bm_cap, radius=0.032, depth=0.022, segments=32, cap_ends=True,
                matrix=Matrix.Translation((sx + 0.02, 0.60, 0.76)) @ rot_mat
            )
            # Grip ridges
            for r_idx in range(12):
                ang = r_idx * (math.pi * 2.0 / 12)
                bmesh.ops.create_cube(
                    bm_cap, size=1.0,
                    matrix=Matrix.Translation((sx + 0.02 + math.cos(ang)*0.032, 0.60 + math.sin(ang)*0.032, 0.76)) @
                           rot_mat @ Matrix.Diagonal((0.004, 0.004, 0.020, 1.0))
                )
            mesh_cap = bpy.data.meshes.new("Oil_Filler_Cap")
            bm_cap.to_mesh(mesh_cap)
            bm_cap.free()
            cap = bpy.data.objects.new("Oil_Filler_Cap", mesh_cap)
            cap.data.materials.append(mat_cap)
            col.objects.link(cap)
            apply_mesh_polish(cap, bevel_width=0.0015)
            
        # 10 Perimeter valve cover mounting bolts with rubber isolator washers
        for bx in [-cover_w * 0.46, cover_w * 0.46]:
            for by_idx in range(5):
                by = 0.18 + by_idx * 0.12
                b = create_hex_bolt(f"VC_Bolt_{side}_{bx:.2f}_{by_idx}", radius=0.004, height=0.005, flange_radius=0.007, mat=mat_bolt)
                b.location = (sx + (bx * math.cos(bank_angle)), by, 0.67 + (bx * math.sin(bank_angle)))
                b.rotation_euler = (0, bank_angle, 0)
                col.objects.link(b)
                
        out_name = f"engine_v8_valvecover_{'l' if sx > 0 else 'r'}.glb"
        export_active_scene(os.path.join(ENGINES_DIR, out_name))

def main():
    log("Upgrading 7 Engine Subassemblies with High-Mesh CAD Geometry...")
    build_engine_intercooler()
    build_engine_dipstick()
    build_engine_mounts()
    build_engine_oilpan()
    build_engine_starter()
    build_engine_valvecovers()
    log("[SUCCESS] All 7 Engine Subassemblies upgraded successfully!")

if __name__ == "__main__":
    main()
