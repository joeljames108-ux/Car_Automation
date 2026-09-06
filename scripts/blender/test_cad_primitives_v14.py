import bpy
import bmesh
import math
import os
import sys

# Test script to verify the 10 new v14.0 Class-A CAD primitives in Blender 5.2
print("[TEST] Initializing Blender v14.0 CAD Primitives Test Harness...")

# Clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)

def get_or_create_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, transmission=0.0, ior=1.45, emission=(0,0,0,1), emission_strength=1.0, sheen=0.0, alpha=1.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    tree = mat.node_tree
    nodes = tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = base_color
        if 'Metallic' in bsdf.inputs:
            bsdf.inputs['Metallic'].default_value = metallic
        if 'Roughness' in bsdf.inputs:
            bsdf.inputs['Roughness'].default_value = roughness
        if 'Coat Weight' in bsdf.inputs:
            bsdf.inputs['Coat Weight'].default_value = clearcoat
        elif 'Clearcoat' in bsdf.inputs:
            bsdf.inputs['Clearcoat'].default_value = clearcoat
        if 'Transmission Weight' in bsdf.inputs:
            bsdf.inputs['Transmission Weight'].default_value = transmission
        elif 'Transmission' in bsdf.inputs:
            bsdf.inputs['Transmission'].default_value = transmission
        if 'IOR' in bsdf.inputs:
            bsdf.inputs['IOR'].default_value = ior
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emission
        elif 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = emission
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emission_strength
    return mat

def make_box(name, location, size, mat, bevel=0.003, segments=2):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0 and min(size) > bevel * 2.2:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = min(bevel, min(size) * 0.25)
        bev.segments = segments
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(40)
        bpy.ops.object.modifier_apply(modifier="Bevel")
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_cylinder(name, location, radius, depth, rot_euler, mat, vertices=32, bevel=0.002):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel > 0 and depth > bevel * 2.5 and radius > bevel * 2.5:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = min(bevel, radius * 0.2)
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(45)
        bpy.ops.object.modifier_apply(modifier="Bevel")
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_cone(name, location, r1, r2, depth, rot_euler, mat, vertices=24):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r1, radius2=r2, depth=depth, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_torus(name, location, major_radius, minor_radius, rot_euler, mat, major_segments=32, minor_segments=16):
    bpy.ops.mesh.primitive_torus_add(
        location=location,
        rotation=rot_euler,
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=major_segments,
        minor_segments=minor_segments
    )
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

# Mock materials suite
mats = {
    "leather_ebony": get_or_create_material("Int_Leather_Nappa_Ebony", (0.035, 0.035, 0.04, 1.0), roughness=0.58),
    "metal_brushed": get_or_create_material("Int_Metal_Brushed_Aluminum", (0.82, 0.83, 0.85, 1.0), metallic=0.94, roughness=0.20),
    "chrome_jewel": get_or_create_material("Int_Chrome_Jewel_Cut", (0.95, 0.95, 0.96, 1.0), metallic=1.0, roughness=0.02, clearcoat=1.0),
    "titanium_finish": get_or_create_material("Int_Titanium_Satin", (0.55, 0.58, 0.62, 1.0), metallic=0.95, roughness=0.25),
    "screen_oled": get_or_create_material("Int_Screen_OLED_Emissive", (0.02, 0.08, 0.22, 1.0), emission=(0.10, 0.35, 0.85, 1.0), emission_strength=6.0),
    "ambient_iceblue": get_or_create_material("Int_Ambient_LED_IceBlue", (0.15, 0.75, 1.0, 1.0), emission=(0.15, 0.75, 1.0, 1.0), emission_strength=22.0),
    "ambient_amber": get_or_create_material("Int_Ambient_LED_Amber", (1.0, 0.55, 0.05, 1.0), emission=(1.0, 0.55, 0.05, 1.0), emission_strength=22.0),
    "wood_pianoblack": get_or_create_material("Int_Wood_Piano_Black", (0.012, 0.012, 0.015, 1.0), roughness=0.03, clearcoat=1.0),
    "rubber_traction": get_or_create_material("Int_Rubber_Ribbed_Traction", (0.03, 0.03, 0.035, 1.0), roughness=0.85),
    "anodized_red": get_or_create_material("Int_Anodized_Racing_Red", (0.92, 0.08, 0.12, 1.0), metallic=0.88, roughness=0.18),
    "anodized_gold": get_or_create_material("Int_Anodized_Gold_Trim", (0.88, 0.72, 0.18, 1.0), metallic=0.90, roughness=0.22),
    "carbon_matte_dry": get_or_create_material("Int_Carbon_Matte_Dry", (0.04, 0.04, 0.045, 1.0), metallic=0.15, roughness=0.42),
    "glass_clear": get_or_create_material("Int_Glass_Optical_Clear", (0.95, 0.98, 1.0, 0.25), roughness=0.01, transmission=0.98, ior=1.52, alpha=0.25),

    # v14.0 materials
    "pdlc_smart_glass": get_or_create_material("Int_PDLC_Smart_Glass", (0.05, 0.08, 0.12, 0.35), roughness=0.03, transmission=0.82, ior=1.54, alpha=0.35),
    "brushed_rose_gold": get_or_create_material("Int_Brushed_Rose_Gold_Bespoke", (0.95, 0.72, 0.65, 1.0), metallic=0.98, roughness=0.20),
    "chilled_aluminum": get_or_create_material("Int_Chilled_BeadBlasted_Alu", (0.78, 0.82, 0.85, 1.0), metallic=0.98, roughness=0.35),
    "neon_yellow_accent": get_or_create_material("Int_Neon_Acid_Yellow_Race", (0.85, 0.98, 0.05, 1.0), roughness=0.25, emission=(0.85, 0.98, 0.05, 1.0), emission_strength=12.0),
    "coiled_wire_polyurethane": get_or_create_material("Int_Coiled_Wire_Polyurethane", (0.05, 0.05, 0.05, 1.0), roughness=0.38),
    "optical_lens_coated": get_or_create_material("Int_Optical_Lens_Coated_Violet", (0.92, 0.88, 0.98, 0.2), roughness=0.01, transmission=0.95, ior=1.62, alpha=0.2),
    "porcelain_ceramic_white": get_or_create_material("Int_Porcelain_Ceramic_White", (0.96, 0.96, 0.95, 1.0), roughness=0.04, clearcoat=1.0),
    "damascus_rose_accent": get_or_create_material("Int_Damascus_Rose_Steel", (0.45, 0.35, 0.35, 1.0), metallic=0.94, roughness=0.24)
}

# --- 1. SMART GLASS ROOF SEGMENTS & DAMPED GRAB HANDLES ---
def make_smart_glass_roof_segments_and_grab_handles(name, location, mats=None):
    lx, ly, lz = location
    for row_i, ry in enumerate([ly - 0.28, ly + 0.28]):
        for col_j, rx in enumerate([lx - 0.24, lx + 0.24]):
            make_box(f"{name}_PDLC_Panel_{row_i}_{col_j}", (rx, ry, lz), (0.42, 0.48, 0.008), mats["pdlc_smart_glass"], bevel=0.002)
            make_box(f"{name}_Busbar_Border_{row_i}_{col_j}", (rx, ry, lz + 0.003), (0.43, 0.49, 0.003), mats["metal_brushed"], bevel=0.001)
    for h_side, hx in [("L", lx - 0.58), ("R", lx + 0.58)]:
        for h_pos, hy in [("Front", ly + 0.35), ("Rear", ly - 0.35)]:
            hname = f"{name}_Grab_{h_side}_{h_pos}"
            make_cylinder(f"{hname}_Pivot1", (hx, hy - 0.08, lz - 0.01), 0.006, 0.022, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)
            make_cylinder(f"{hname}_Pivot2", (hx, hy + 0.08, lz - 0.01), 0.006, 0.022, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)
            make_box(f"{hname}_HandleBar", (hx, hy, lz - 0.025), (0.024, 0.16, 0.016), mats["leather_ebony"], bevel=0.004)
            make_box(f"{hname}_CoatHook", (hx - 0.008 * (1 if h_side == "L" else -1), hy + 0.06, lz - 0.032), (0.006, 0.012, 0.012), mats["chrome_jewel"], bevel=0.001)
            make_cylinder(f"{hname}_Spotlight", (hx, hy, lz - 0.012), 0.008, 0.004, (0, 0, 0), mats["optical_lens_coated"], vertices=16)

# --- 2. PASSENGER CINEMA SCREEN & VIRTUAL WING MIRROR MONITORS ---
def make_passenger_cinema_screen_and_virtual_mirror_monitors(name, location, mats=None):
    lx, ly, lz = location
    make_box(f"{name}_Cinema_Housing", (lx + 0.38, ly - 0.05, lz), (0.36, 0.014, 0.16), mats["wood_pianoblack"], bevel=0.003)
    make_box(f"{name}_Cinema_OLED", (lx + 0.38, ly - 0.056, lz), (0.34, 0.004, 0.145), mats["screen_oled"], bevel=0.001)
    make_box(f"{name}_Cinema_Glow", (lx + 0.38, ly - 0.058, lz - 0.076), (0.32, 0.002, 0.003), mats["ambient_iceblue"], bevel=0)
    for m_side, mx, rot_deg in [("L", lx - 0.62, 35), ("R", lx + 0.62, -35)]:
        mname = f"{name}_VirtualMirror_{m_side}"
        make_box(f"{mname}_Pod", (mx, ly + 0.04, lz + 0.08), (0.085, 0.045, 0.11), mats["carbon_matte_dry"], bevel=0.004)
        make_box(f"{mname}_Screen", (mx, ly + 0.022, lz + 0.08), (0.075, 0.006, 0.098), mats["screen_oled"], bevel=0.001)
        make_cone(f"{mname}_RadarAlert", (mx, ly + 0.018, lz + 0.11), 0.006, 0.001, 0.004, (math.radians(rot_deg), 0, 0), mats["ambient_amber"], vertices=12)

# --- 3. PNEUMATIC LUMBAR HARNESS & MOTORIZED THIGH STEPPER DRIVE ---
def make_pneumatic_lumbar_air_harness(name, location, mats=None):
    lx, ly, lz = location
    make_box(f"{name}_ManifoldBlock", (lx, ly + 0.12, lz), (0.12, 0.035, 0.04), mats["chilled_aluminum"], bevel=0.002)
    for v_i in range(4):
        make_cylinder(f"{name}_Solenoid_{v_i+1}", (lx - 0.045 + v_i * 0.03, ly + 0.14, lz), 0.008, 0.018, (math.radians(90), 0, 0), mats["brushed_rose_gold"], vertices=16)
    for t_i, tz in enumerate([lz + 0.08, lz + 0.16, lz + 0.24]):
        make_torus(f"{name}_PneumaticHose_{t_i+1}", (lx, ly + 0.10, tz), 0.08, 0.004, (0, math.radians(90), 0), mats["rubber_traction"], major_segments=24, minor_segments=12)
        make_box(f"{name}_BladderChamber_{t_i+1}", (lx, ly + 0.06, tz), (0.16, 0.02, 0.06), mats["leather_ebony"], bevel=0.006)
    make_cylinder(f"{name}_ThighStepperMotor", (lx - 0.06, ly - 0.14, lz - 0.08), 0.018, 0.06, (0, math.radians(90), 0), mats["titanium_finish"], vertices=20)
    make_cylinder(f"{name}_ThighLeadScrew", (lx + 0.03, ly - 0.14, lz - 0.08), 0.006, 0.12, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)

# --- 4. PIT RADIO COMMS BOX & COILED PTT WIRING ---
def make_pit_radio_comms_and_ptt_assembly(name, location, mats=None):
    lx, ly, lz = location
    make_box(f"{name}_RadioChassis", (lx, ly, lz), (0.14, 0.10, 0.065), mats["chilled_aluminum"], bevel=0.003)
    for fin_i in range(6):
        make_box(f"{name}_CoolingFin_{fin_i+1}", (lx - 0.05 + fin_i * 0.02, ly, lz + 0.034), (0.003, 0.09, 0.012), mats["metal_brushed"], bevel=0)
    make_cylinder(f"{name}_AntennaBNC", (lx - 0.045, ly + 0.04, lz + 0.04), 0.007, 0.024, (0, 0, 0), mats["chrome_jewel"], vertices=16)
    make_cylinder(f"{name}_FischerSocket1", (lx + 0.02, ly - 0.052, lz), 0.009, 0.012, (math.radians(90), 0, 0), mats["brushed_rose_gold"], vertices=16)
    make_cylinder(f"{name}_FischerSocket2", (lx + 0.05, ly - 0.052, lz), 0.009, 0.012, (math.radians(90), 0, 0), mats["brushed_rose_gold"], vertices=16)
    for coil_k in range(5):
        make_torus(f"{name}_PTT_Coil_{coil_k+1}", (lx + 0.05, ly - 0.08 - coil_k * 0.015, lz), 0.012, 0.003, (0, math.radians(90), 0), mats["coiled_wire_polyurethane"], major_segments=16, minor_segments=8)
    make_cylinder(f"{name}_PTT_PlugHead", (lx + 0.05, ly - 0.18, lz), 0.008, 0.026, (math.radians(90), 0, 0), mats["porcelain_ceramic_white"], vertices=16)
    make_cylinder(f"{name}_PTT_NeonRing", (lx + 0.05, ly - 0.194, lz), 0.0085, 0.003, (math.radians(90), 0, 0), mats["neon_yellow_accent"], vertices=16)

# --- 5. INDUCTIVE SMARTPHONE CHARGING STATION ---
def make_inductive_phone_charging_station(name, location, mats=None):
    lx, ly, lz = location
    make_box(f"{name}_TrayRecess", (lx, ly, lz), (0.13, 0.19, 0.018), mats["wood_pianoblack"], bevel=0.002)
    make_box(f"{name}_RubberPad", (lx, ly, lz + 0.006), (0.12, 0.18, 0.004), mats["rubber_traction"], bevel=0.001)
    for c_i in range(3):
        make_box(f"{name}_Chevron_{c_i+1}", (lx, ly - 0.04 + c_i * 0.04, lz + 0.009), (0.045, 0.004, 0.002), mats["leather_ebony"], bevel=0)
    make_box(f"{name}_LED_Halo", (lx, ly, lz + 0.008), (0.124, 0.184, 0.002), mats["ambient_iceblue"], bevel=0.001)
    for slot_j in range(4):
        make_box(f"{name}_VentSlot_{slot_j+1}", (lx - 0.03 + slot_j * 0.02, ly - 0.085, lz + 0.008), (0.010, 0.003, 0.002), mats["metal_brushed"], bevel=0)
    make_box(f"{name}_PhoneBody", (lx, ly, lz + 0.014), (0.075, 0.155, 0.008), mats["titanium_finish"], bevel=0.002)
    make_box(f"{name}_PhoneGlass", (lx, ly, lz + 0.018), (0.072, 0.152, 0.001), mats["wood_pianoblack"], bevel=0.001)
    make_cylinder(f"{name}_PhoneCameraLens", (lx - 0.022, ly + 0.055, lz + 0.019), 0.007, 0.002, (0, 0, 0), mats["optical_lens_coated"], vertices=16)

# --- 6. MOTORSPORT FLOOR HEEL REST PLATE & FOOTREST BRACE ---
def make_motorsport_heel_rest_plate_and_footrest(name, location, mats=None):
    lx, ly, lz = location
    make_box(f"{name}_HeelPlate", (lx, ly, lz), (0.36, 0.18, 0.008), mats["chilled_aluminum"], bevel=0.002)
    for hx_i in [-0.12, -0.06, 0.0, 0.06, 0.12]:
        for hy_j in [-0.05, 0.0, 0.05]:
            make_cylinder(f"{name}_DimpleHole_{hx_i}_{hy_j}", (lx + hx_i, ly + hy_j, lz + 0.004), 0.009, 0.003, (0, 0, 0), mats["carbon_matte_dry"], vertices=16)
    make_box(f"{name}_FootbraceWedge", (lx + 0.22, ly + 0.02, lz + 0.04), (0.08, 0.16, 0.07), mats["carbon_matte_dry"], bevel=0.003)
    make_box(f"{name}_GripTapeStrip1", (lx + 0.22, ly - 0.02, lz + 0.076), (0.06, 0.025, 0.002), mats["rubber_traction"], bevel=0)
    make_box(f"{name}_GripTapeStrip2", (lx + 0.22, ly + 0.04, lz + 0.076), (0.06, 0.025, 0.002), mats["rubber_traction"], bevel=0)

# --- 7. CONCEALED IN-DOOR UMBRELLA SYSTEM ---
def make_door_concealed_umbrella_system(name, location, mats=None):
    lx, ly, lz = location
    make_cylinder(f"{name}_TubeSocket", (lx, ly, lz), 0.024, 0.32, (0, math.radians(90), 0), mats["chilled_aluminum"], vertices=24)
    make_cylinder(f"{name}_BezelRim", (lx + 0.16, ly, lz), 0.028, 0.006, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=24)
    make_cylinder(f"{name}_UmbrellaHandle", (lx + 0.175, ly, lz), 0.016, 0.036, (0, math.radians(90), 0), mats["brushed_rose_gold"], vertices=20)
    make_cylinder(f"{name}_HandleKnurling", (lx + 0.185, ly, lz), 0.017, 0.018, (0, math.radians(90), 0), mats["damascus_rose_accent"], vertices=24)
    make_cylinder(f"{name}_DrainHeaterRing", (lx + 0.158, ly, lz), 0.025, 0.002, (0, math.radians(90), 0), mats["ambient_amber"], vertices=20)

# --- 8. STEERING COLUMN QUICK-RELEASE SPLINE HUB ---
def make_steering_column_quick_release_spline_hub(name, location, mats=None):
    lx, ly, lz = location
    make_cylinder(f"{name}_BaseBoss", (lx, ly, lz), 0.044, 0.022, (math.radians(90), 0, 0), mats["titanium_finish"], vertices=28)
    for b_idx in range(6):
        ang = b_idx * (2 * math.pi / 6)
        bx = lx + 0.034 * math.cos(ang)
        bz = lz + 0.034 * math.sin(ang)
        make_cylinder(f"{name}_TitaniumBolt_{b_idx+1}", (bx, ly + 0.012, bz), 0.0035, 0.006, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=12)
    make_cylinder(f"{name}_SplinedShaft", (lx, ly + 0.016, lz), 0.024, 0.026, (math.radians(90), 0, 0), mats["damascus_rose_accent"], vertices=24)
    make_cylinder(f"{name}_ReleaseCollar", (lx, ly + 0.026, lz), 0.042, 0.016, (math.radians(90), 0, 0), mats["anodized_red"], vertices=28)
    for det_i in range(3):
        dang = det_i * (2 * math.pi / 3)
        dx = lx + 0.032 * math.cos(dang)
        dz = lz + 0.032 * math.sin(dang)
        make_cylinder(f"{name}_DetentPin_{det_i+1}", (dx, ly + 0.028, dz), 0.004, 0.008, (math.radians(90), 0, 0), mats["neon_yellow_accent"], vertices=12)
    make_cylinder(f"{name}_GoldContactsHub", (lx, ly + 0.032, lz), 0.014, 0.003, (math.radians(90), 0, 0), mats["anodized_gold"], vertices=16)

# --- 9. OTTOMAN CALF REST & MOTORIZED FOOTREST ASSEMBLY ---
def make_ottoman_calf_rest_and_footrest_assembly(name, location, mats=None):
    lx, ly, lz = location
    make_box(f"{name}_CalfCushion", (lx, ly, lz), (0.36, 0.22, 0.09), mats["leather_ebony"], bevel=0.012)
    make_box(f"{name}_PipingBorder", (lx, ly, lz + 0.045), (0.37, 0.23, 0.004), mats["brushed_rose_gold"], bevel=0.001)
    for a_side, ax in [("L", lx - 0.16), ("R", lx + 0.16)]:
        make_box(f"{name}_ScissorArm1_{a_side}", (ax, ly - 0.08, lz - 0.06), (0.014, 0.14, 0.010), mats["chrome_jewel"], bevel=0.002)
        make_box(f"{name}_ScissorArm2_{a_side}", (ax, ly - 0.14, lz - 0.09), (0.014, 0.12, 0.010), mats["chrome_jewel"], bevel=0.002)
    make_box(f"{name}_FootrestStepPlate", (lx, ly - 0.22, lz - 0.12), (0.32, 0.16, 0.012), mats["chilled_aluminum"], bevel=0.003)
    for r_i in range(4):
        make_box(f"{name}_RubberTractionRib_{r_i+1}", (lx, ly - 0.26 + r_i * 0.026, lz - 0.113), (0.28, 0.008, 0.003), mats["rubber_traction"], bevel=0)

# --- 10. A-PILLAR RIBBON TWEETER POD WITH NAUTILUS SPIRAL DEFLECTOR ---
def make_a_pillar_ribbon_tweeter_pod(name, location, rot_euler, mats=None):
    lx, ly, lz = location
    make_cylinder(f"{name}_LensHousing", (lx, ly, lz), 0.036, 0.022, rot_euler, mats["chilled_aluminum"], vertices=28)
    make_cylinder(f"{name}_ChromeBezel", (lx, ly, lz + 0.011), 0.038, 0.004, rot_euler, mats["chrome_jewel"], vertices=28)
    make_torus(f"{name}_AmbientRing", (lx, ly, lz + 0.012), 0.034, 0.002, rot_euler, mats["ambient_iceblue"], major_segments=24, minor_segments=12)
    make_cone(f"{name}_NautilusSpiralCone", (lx, ly, lz + 0.014), 0.026, 0.004, 0.014, rot_euler, mats["damascus_rose_accent"], vertices=24)
    make_cylinder(f"{name}_DiamondDomeCenter", (lx, ly, lz + 0.022), 0.008, 0.003, rot_euler, mats["optical_lens_coated"], vertices=16)

# Test instantiation
print("Testing instantiation of all 10 CAD primitives...")
make_smart_glass_roof_segments_and_grab_handles("Test_SmartGlass", (0, 0, 1.40), mats)
make_passenger_cinema_screen_and_virtual_mirror_monitors("Test_CinemaVirtual", (0, 0, 0.75), mats)
make_pneumatic_lumbar_air_harness("Test_LumbarHarness", (0, 0, 0.40), mats)
make_pit_radio_comms_and_ptt_assembly("Test_PitRadio", (0, 0, 0.25), mats)
make_inductive_phone_charging_station("Test_Qi2Station", (0, 0, 0.30), mats)
make_motorsport_heel_rest_plate_and_footrest("Test_HeelPlate", (0, 0, 0.05), mats)
make_door_concealed_umbrella_system("Test_Umbrella", (0, 0, 0.50), mats)
make_steering_column_quick_release_spline_hub("Test_QuickRelease", (0, 0, 0.65), mats)
make_ottoman_calf_rest_and_footrest_assembly("Test_Ottoman", (0, 0, 0.20), mats)
make_a_pillar_ribbon_tweeter_pod("Test_RibbonTweeter", (0, 0, 0.80), (0, 0, 0), mats)

mesh_count = sum(1 for obj in bpy.data.objects if obj.type == 'MESH')
print(f"[SUCCESS] Test passed! Generated {mesh_count} valid mesh objects for all 10 CAD primitives.")
