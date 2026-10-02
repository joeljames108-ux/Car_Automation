"""
AUTO TYCOON CAMPUS HQ - CORPORATE HQ PROCEDURAL GENERATOR (PHASES 64–71)

Generates all 8 visual levels of UNIT_01 Central Corporate HQ in Blender:
- Level 0: Empty Plot (Surveyed boundary stakes, caution tape, gravel road connection)
- Level 1: 1970s Starter Office (2-story exposed lavender brick, coral I-beams, 2-bay prototype garage)
- Level 2: Expanded Department Wing (Preserved heritage wing + legal/HR wing)
- Level 3: Specialized Center (3rd floor penthouse, mainframe data annex, microwave dish)
- Level 4: Advanced HQ (Glass curtain wall atrium, Skunkworks advanced division)
- Level 5: World-Class HQ (Photovoltaic solar canopy, global ops bridge, landscaped court)
- Level 6: Innovation Campus (Parametric facade fins, rooftop garden, drone pad)
- Level 7: Hypermodern Campus (Aerodynamic aerogel envelope, cantilevered sky bridge)

Follows mandatory operational guidelines:
- World coordinate alignment: Z-Up (+Z), Y-Forward (+Y), X-Lateral (+X).
- 45° resin diorama aesthetic matching reference image palette
- Correct glTF 2.0 export flags (export_apply=False, export_extras=True)
- PBR materials from campus_pbr_library
"""

import os
import sys
import math
import bpy

# Ensure campus modules can be imported
current_dir = os.path.dirname(os.path.abspath(__file__))
blender_scripts_dir = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
if blender_scripts_dir not in sys.path:
    sys.path.insert(0, blender_scripts_dir)

from campus.materials.campus_pbr_library import (
    mat_lavender_brick_1970,
    mat_coral_structural_beam,
    mat_tinted_acrylic_window,
    mat_modern_curtain_glass,
    mat_travertine_concrete,
    mat_dark_slate_roof,
    mat_brushed_aluminum,
    mat_interior_emissive_warm,
    mat_safety_yellow,
    mat_construction_orange,
)
from campus.utils.campus_export_utils import export_campus_glb

def reset_blender_scene():
    """Cleans all meshes, curves, materials, and collections from current scene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        bpy.data.materials.remove(block)

# ── LEVEL 0: EMPTY SURVEYED PLOT ──
def build_corporate_hq_l0(export_path: str):
    reset_blender_scene()
    root = bpy.data.objects.new("UNIT_01_Corporate_HQ_L0", None)
    bpy.context.collection.objects.link(root)

    w, l = 24.0, 24.0
    half_w, half_l = w / 2, l / 2

    # 1. Surveyed grass/dirt lot slab (Z is up)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, -0.15))
    slab = bpy.context.active_object
    slab.name = "Plot_Ground_Slab"
    slab.scale = (w, l, 0.3)
    slab.data.materials.append(mat_travertine_concrete())
    slab.parent = root

    # 2. Four wooden corner boundary stakes with yellow hazard paint
    corners = [(-half_w, -half_l), (half_w, -half_l), (half_w, half_l), (-half_w, half_l)]
    for i, (cx, cy) in enumerate(corners):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=1.8, location=(cx, cy, 0.9))
        stake = bpy.context.active_object
        stake.name = f"Survey_Stake_{i+1}"
        stake.data.materials.append(mat_safety_yellow())
        stake.parent = root

    # 3. Surveyor Billboard Sign (Front edge, +Y)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, half_l - 1.5, 2.2))
    sign = bpy.context.active_object
    sign.name = "Survey_Signboard"
    sign.scale = (4.5, 0.2, 1.8)
    sign.data.materials.append(mat_dark_slate_roof())
    sign.parent = root

    # Twin legs
    for lx in [-1.8, 1.8]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=2.4, location=(lx, half_l - 1.5, 1.2))
        leg = bpy.context.active_object
        leg.name = f"Sign_Leg_{lx}"
        leg.data.materials.append(mat_coral_structural_beam())
        leg.parent = root

    extras = {
        "unit_id": "CENTRAL_CORPORATE_HQ",
        "unit_key": "UNIT_01",
        "level": 0,
        "tier": "empty_plot",
        "building_name": "Central Corporate HQ (Surveyed Plot)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── HELPER: BUILD BASE 1970S STARTER ELEMENTS ──
def add_base_l1_elements(root):
    # 1. Main 2-story brick building (18m wide, 14m deep, 8.5m high)
    # Z-Up: center Z = 4.25, ground at Z=0
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -2.0, 4.25))
    main_body = bpy.context.active_object
    main_body.name = "Main_Brick_Building"
    main_body.scale = (18.0, 14.0, 8.5)
    main_body.data.materials.append(mat_lavender_brick_1970())
    main_body.parent = root

    # 2. Coral-pink structural perimeter I-beam band (at Z=4.3)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -2.0, 4.3))
    beam_band = bpy.context.active_object
    beam_band.name = "Coral_Structural_Beam_Band"
    beam_band.scale = (18.6, 14.6, 0.6)
    beam_band.data.materials.append(mat_coral_structural_beam())
    beam_band.parent = root

    # 3. Upper-story drafting studio ribbon windows (Front facade, +Y = +5.05, Z = 6.2)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 5.05, 6.2))
    front_window = bpy.context.active_object
    front_window.name = "Upper_Clerestory_Ribbon"
    front_window.scale = (16.0, 0.2, 2.2)
    front_window.data.materials.append(mat_tinted_acrylic_window())
    front_window.parent = root

    # 4. Executive ground-floor reception entry & glass doors (+Y = +5.05, Z = 1.5)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 5.05, 1.5))
    reception_entry = bpy.context.active_object
    reception_entry.name = "Reception_Glass_Entry"
    reception_entry.scale = (6.0, 0.2, 3.0)
    reception_entry.data.materials.append(mat_tinted_acrylic_window())
    reception_entry.parent = root

    # Entry canopy (extends to +Y = +6.2, Z = 3.1)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 6.2, 3.1))
    canopy = bpy.context.active_object
    canopy.name = "Entry_Canopy"
    canopy.scale = (7.5, 2.5, 0.3)
    canopy.data.materials.append(mat_coral_structural_beam())
    canopy.parent = root

    # 5. Rear 2-Bay Prototype Engineering Garage (14m wide, 8m deep, 5.5m high, at Y = -11.0, Z = 2.75)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -11.0, 2.75))
    garage = bpy.context.active_object
    garage.name = "Prototype_Engineering_Garage"
    garage.scale = (14.0, 8.0, 5.5)
    garage.data.materials.append(mat_lavender_brick_1970())
    garage.parent = root

    # Twin roll-up garage doors (at rear Y = -15.05, Z = 2.2)
    for gx in [-3.5, 3.5]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(gx, -15.05, 2.2))
        roll_door = bpy.context.active_object
        roll_door.name = f"Garage_Bay_Door_{gx}"
        roll_door.scale = (4.5, 0.2, 4.4)
        roll_door.data.materials.append(mat_dark_slate_roof())
        roll_door.parent = root

    # Exhaust vent stacks on garage roof (Z = 6.5)
    for vx in [-3.5, 3.5]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.4, depth=2.0, location=(vx, -11.0, 6.5))
        vent = bpy.context.active_object
        vent.name = f"Exhaust_Vent_{vx}"
        vent.data.materials.append(mat_brushed_aluminum())
        vent.parent = root

    # 6. Concrete roof parapet and HVAC chiller (atop main block, Z = 8.8)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -2.0, 8.8))
    roof = bpy.context.active_object
    roof.name = "Roof_Parapet_Slab"
    roof.scale = (18.4, 14.4, 0.6)
    roof.data.materials.append(mat_dark_slate_roof())
    roof.parent = root

    # Rooftop HVAC chiller unit (Z = 9.7)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(4.0, -4.0, 9.7))
    hvac = bpy.context.active_object
    hvac.name = "Rooftop_HVAC_Chiller"
    hvac.scale = (3.5, 3.0, 1.6)
    hvac.data.materials.append(mat_brushed_aluminum())
    hvac.parent = root

# ── LEVEL 1: 1970 STARTER OFFICE ──
def build_corporate_hq_l1(export_path: str):
    reset_blender_scene()
    root = bpy.data.objects.new("UNIT_01_Corporate_HQ_L1", None)
    bpy.context.collection.objects.link(root)
    add_base_l1_elements(root)

    extras = {
        "unit_id": "CENTRAL_CORPORATE_HQ",
        "unit_key": "UNIT_01",
        "level": 1,
        "tier": "office",
        "building_name": "Central Corporate HQ (1970 Starter Office)",
        "sub_departments": ["corp_ceo_office", "corp_finance_desk", "corp_admin_pool", "corp_prototype_garage"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 2: EXPANDED DEPARTMENT WING (1975–1980) ──
def add_l2_elements(root):
    # East Wing extension (10m wide, 12m deep, 8.5m high, at X = 14.0, Y = -2.0, Z = 4.25)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(14.0, -2.0, 4.25))
    east_wing = bpy.context.active_object
    east_wing.name = "East_Legal_HR_Wing"
    east_wing.scale = (10.0, 12.0, 8.5)
    east_wing.data.materials.append(mat_lavender_brick_1970())
    east_wing.parent = root

    # Boardroom panoramic glass bay (+Y = +4.1, Z = 6.2)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(14.0, 4.1, 6.2))
    board_window = bpy.context.active_object
    board_window.name = "Boardroom_Panoramic_Glass"
    board_window.scale = (8.0, 0.4, 2.5)
    board_window.data.materials.append(mat_tinted_acrylic_window())
    board_window.parent = root

    # East Wing roof parapet (Z = 8.8)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(14.0, -2.0, 8.8))
    east_roof = bpy.context.active_object
    east_roof.name = "East_Roof_Parapet"
    east_roof.scale = (10.4, 12.4, 0.6)
    east_roof.data.materials.append(mat_dark_slate_roof())
    east_roof.parent = root

def build_corporate_hq_l2(export_path: str):
    reset_blender_scene()
    root = bpy.data.objects.new("UNIT_01_Corporate_HQ_L2", None)
    bpy.context.collection.objects.link(root)
    add_base_l1_elements(root)
    add_l2_elements(root)

    extras = {
        "unit_id": "CENTRAL_CORPORATE_HQ",
        "unit_key": "UNIT_01",
        "level": 2,
        "tier": "department",
        "building_name": "Central Corporate HQ (Expanded Department Wing)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 3: SPECIALIZED CENTER (1980–1990) ──
def add_l3_elements(root):
    # 3rd Story Executive Penthouse atop central block (14m wide, 10m deep, 3.8m high, Z = 10.4)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -2.0, 10.4))
    penthouse = bpy.context.active_object
    penthouse.name = "Executive_Penthouse_Floor"
    penthouse.scale = (14.0, 10.0, 3.8)
    penthouse.data.materials.append(mat_modern_curtain_glass())
    penthouse.parent = root

    # Mainframe data annex on west flank (6m wide, 8m deep, 4m high, X = -12.0, Y = -2.0, Z = 2.0)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-12.0, -2.0, 2.0))
    data_annex = bpy.context.active_object
    data_annex.name = "Mainframe_Data_Annex"
    data_annex.scale = (6.0, 8.0, 4.0)
    data_annex.data.materials.append(mat_lavender_brick_1970())
    data_annex.parent = root

    # Rooftop microwave communications dish (Z = 13.0)
    bpy.ops.mesh.primitive_cylinder_add(radius=1.8, depth=0.4, location=(0, -2.0, 13.0))
    dish = bpy.context.active_object
    dish.name = "Microwave_Comm_Dish"
    dish.rotation_euler[0] = math.radians(35)
    dish.data.materials.append(mat_brushed_aluminum())
    dish.parent = root

def build_corporate_hq_l3(export_path: str):
    reset_blender_scene()
    root = bpy.data.objects.new("UNIT_01_Corporate_HQ_L3", None)
    bpy.context.collection.objects.link(root)
    add_base_l1_elements(root)
    add_l2_elements(root)
    add_l3_elements(root)

    extras = {
        "unit_id": "CENTRAL_CORPORATE_HQ",
        "unit_key": "UNIT_01",
        "level": 3,
        "tier": "center",
        "building_name": "Central Corporate HQ (Specialized Tech Center)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 4: ADVANCED HQ (1990–2000) ──
def add_l4_elements(root):
    # Multi-story glass curtain wall atrium connecting center & wings (Front Y = +6.0, Z = 5.75)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 6.0, 5.75))
    atrium = bpy.context.active_object
    atrium.name = "Curtain_Glass_Atrium"
    atrium.scale = (12.0, 4.0, 11.5)
    atrium.data.materials.append(mat_modern_curtain_glass())
    atrium.parent = root

    # Brise-soleil architectural sunshade louvers on south facade
    for lz in [2.5, 5.0, 7.5, 10.0]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 8.1, lz))
        louver = bpy.context.active_object
        louver.name = f"Sunshade_Louver_{lz}"
        louver.scale = (13.0, 0.8, 0.15)
        louver.data.materials.append(mat_brushed_aluminum())
        louver.parent = root

def build_corporate_hq_l4(export_path: str):
    reset_blender_scene()
    root = bpy.data.objects.new("UNIT_01_Corporate_HQ_L4", None)
    bpy.context.collection.objects.link(root)
    add_base_l1_elements(root)
    add_l2_elements(root)
    add_l3_elements(root)
    add_l4_elements(root)

    extras = {
        "unit_id": "CENTRAL_CORPORATE_HQ",
        "unit_key": "UNIT_01",
        "level": 4,
        "tier": "advanced_hq",
        "building_name": "Central Corporate HQ (Advanced Tech Campus)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 5: WORLD-CLASS HQ (2000–2010) ──
def add_l5_elements(root):
    # Photovoltaic solar roof canopy hovering over central complex (Z = 14.5)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -2.0, 14.5))
    solar_canopy = bpy.context.active_object
    solar_canopy.name = "Photovoltaic_Solar_Canopy"
    solar_canopy.scale = (26.0, 20.0, 0.4)
    solar_canopy.data.materials.append(mat_modern_curtain_glass())
    solar_canopy.parent = root

    # Global Operations Command bridge (X = 7.0, Y = 4.0, Z = 12.0)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(7.0, 4.0, 12.0))
    ops_bridge = bpy.context.active_object
    ops_bridge.name = "Global_Operations_Command_Bridge"
    ops_bridge.scale = (10.0, 6.0, 3.5)
    ops_bridge.data.materials.append(mat_modern_curtain_glass())
    ops_bridge.parent = root

def build_corporate_hq_l5(export_path: str):
    reset_blender_scene()
    root = bpy.data.objects.new("UNIT_01_Corporate_HQ_L5", None)
    bpy.context.collection.objects.link(root)
    add_base_l1_elements(root)
    add_l2_elements(root)
    add_l3_elements(root)
    add_l4_elements(root)
    add_l5_elements(root)

    extras = {
        "unit_id": "CENTRAL_CORPORATE_HQ",
        "unit_key": "UNIT_01",
        "level": 5,
        "tier": "world_class_hq",
        "building_name": "Central Corporate HQ (World-Class Global Landmark)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 6: INNOVATION CAMPUS (2010–2020) ──
def add_l6_elements(root):
    # Cantilevered skybridge connecting to west annex (X = -9.0, Y = 0.0, Z = 10.5)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-9.0, 0.0, 10.5))
    skybridge = bpy.context.active_object
    skybridge.name = "Executive_Skybridge"
    skybridge.scale = (8.0, 3.5, 3.2)
    skybridge.data.materials.append(mat_modern_curtain_glass())
    skybridge.parent = root

    # Drone logistics landing pad on roof (X = 8.0, Y = -5.0, Z = 15.0)
    bpy.ops.mesh.primitive_cylinder_add(radius=3.5, depth=0.2, location=(8.0, -5.0, 15.0))
    drone_pad = bpy.context.active_object
    drone_pad.name = "Rooftop_Drone_Landing_Pad"
    drone_pad.data.materials.append(mat_safety_yellow())
    drone_pad.parent = root

def build_corporate_hq_l6(export_path: str):
    reset_blender_scene()
    root = bpy.data.objects.new("UNIT_01_Corporate_HQ_L6", None)
    bpy.context.collection.objects.link(root)
    add_base_l1_elements(root)
    add_l2_elements(root)
    add_l3_elements(root)
    add_l4_elements(root)
    add_l5_elements(root)
    add_l6_elements(root)

    extras = {
        "unit_id": "CENTRAL_CORPORATE_HQ",
        "unit_key": "UNIT_01",
        "level": 6,
        "tier": "innovation_campus",
        "building_name": "Central Corporate HQ (Smart Innovation Hub)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 7: HYPERMODERN CAMPUS (2020s+) ──
def add_l7_elements(root):
    # Aerodynamic soaring glass canopy & parametric roof envelope (Z = 16.5)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.0, 16.8))
    aerogel_canopy = bpy.context.active_object
    aerogel_canopy.name = "Aerogel_Soaring_Canopy"
    aerogel_canopy.scale = (30.0, 24.0, 1.2)
    aerogel_canopy.data.materials.append(mat_modern_curtain_glass())
    aerogel_canopy.parent = root

    # Slender structural carbon support pylons for the canopy
    for px, py in [(-13.0, -10.0), (13.0, -10.0), (-13.0, 8.0), (13.0, 8.0)]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=16.8, location=(px, py, 8.4))
        pylon = bpy.context.active_object
        pylon.name = f"Canopy_Pylon_{px}_{py}"
        pylon.data.materials.append(mat_brushed_aluminum())
        pylon.parent = root

    # High-altitude cantilevered executive sky bridge (X = 14.0, Y = 6.0, Z = 13.0)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(14.0, 6.0, 13.0))
    sky_bridge = bpy.context.active_object
    sky_bridge.name = "Cantilevered_Sky_Observatory"
    sky_bridge.scale = (8.0, 6.0, 3.2)
    sky_bridge.data.materials.append(mat_modern_curtain_glass())
    sky_bridge.parent = root

    # Quantum computing cryogenic tower (X = -15.0, Y = -8.0, Z = 9.0)
    bpy.ops.mesh.primitive_cylinder_add(radius=2.5, depth=18.0, location=(-15.0, -8.0, 9.0))
    quantum_tower = bpy.context.active_object
    quantum_tower.name = "Quantum_Computing_Cryo_Tower"
    quantum_tower.data.materials.append(mat_brushed_aluminum())
    quantum_tower.parent = root

def build_corporate_hq_l7(export_path: str):
    reset_blender_scene()
    root = bpy.data.objects.new("UNIT_01_Corporate_HQ_L7", None)
    bpy.context.collection.objects.link(root)
    add_base_l1_elements(root)
    add_l2_elements(root)
    add_l3_elements(root)
    add_l4_elements(root)
    add_l5_elements(root)
    add_l6_elements(root)
    add_l7_elements(root)

    extras = {
        "unit_id": "CENTRAL_CORPORATE_HQ",
        "unit_key": "UNIT_01",
        "level": 7,
        "tier": "hypermodern_campus",
        "building_name": "Central Corporate HQ (Zero-Carbon AI Master Complex)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── BATCH GENERATION ENTRYPOINT ──
def generate_all_corporate_hq_levels(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    results = {}

    levels = [
        (0, "hq_01_corporate_l0.glb", build_corporate_hq_l0),
        (1, "hq_01_corporate_l1.glb", build_corporate_hq_l1),
        (2, "hq_01_corporate_l2.glb", build_corporate_hq_l2),
        (3, "hq_01_corporate_l3.glb", build_corporate_hq_l3),
        (4, "hq_01_corporate_l4.glb", build_corporate_hq_l4),
        (5, "hq_01_corporate_l5.glb", build_corporate_hq_l5),
        (6, "hq_01_corporate_l6.glb", build_corporate_hq_l6),
        (7, "hq_01_corporate_l7.glb", build_corporate_hq_l7),
    ]

    for lvl_num, filename, build_fn in levels:
        out_path = os.path.join(output_dir, filename)
        print(f"Generating Corporate HQ Level {lvl_num} -> {out_path}...")
        success = build_fn(out_path)
        results[lvl_num] = success
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        print(f"  Level {lvl_num} exported: {success}, size: {file_size:,} bytes")

    return results

if __name__ == "__main__":
    target_dir = os.path.join(blender_scripts_dir, "public", "models", "campus")
    if len(sys.argv) > 1 and not sys.argv[-1].endswith(".py"):
        target_dir = sys.argv[-1]

    generate_all_corporate_hq_levels(target_dir)
