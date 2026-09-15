"""
Bus Lighting & Optics Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
Volvo 9700 H 13m (2006) Tri-Axle High-Floor Luxury Touring Coach Specification
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def build_bus_lighting(mat_registry):
    """Constructs multi-element projector headlights, vertical LED taillight towers, and LED destination matrix boards."""
    created_objects = []
    
    bw = c.OVERALL_WIDTH
    
    # -------------------------------------------------------------------------
    # 1. FRONT HEADLAMP OPTICS (Multi-Element Bi-LED Projectors + DRL Brow)
    # -------------------------------------------------------------------------
    hl_z = 0.940
    hl_y = c.FRONT_BUMPER_Y - 0.040
    
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        hl_x = sign * 0.950
        
        # 1. Headlamp Dark Piano-Black Housing Bucket
        hl_housing = c.create_box(
            f"LIGHT_Headlight_Housing_{side}",
            location=(hl_x, hl_y, hl_z),
            size=(0.420, 0.160, 0.220),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.trim_piano_black if hasattr(mat_registry, "trim_piano_black") else mat_registry.trim_satin_black
        )
        created_objects.append(hl_housing)
        
        # 2. Dual Bi-LED Projector Lenses (Low & High Beam) with Chrome Bezels
        for p_idx, p_x_offset in [(1, -0.085), (2, 0.085)]:
            # Projector Chrome Retainer Ring Bezel
            bezel = c.create_cylinder(
                f"LIGHT_Headlight_Bezel_{side}_{p_idx}",
                location=(hl_x + sign * p_x_offset, hl_y + 0.055, hl_z),
                radius=0.072,
                depth=0.035,
                rotation=(math.radians(90), 0, 0),
                vertices=24,
                col_name="04_Bus_Lighting_Optics",
                mat=mat_registry.mirror_chrome
            )
            created_objects.append(bezel)
            
            # Projector Glass Lens with Pure White Emission Core
            lens = c.create_cylinder(
                f"LIGHT_Headlight_Projector_Lens_{side}_{p_idx}",
                location=(hl_x + sign * p_x_offset, hl_y + 0.065, hl_z),
                radius=0.060,
                depth=0.030,
                rotation=(math.radians(90), 0, 0),
                vertices=24,
                col_name="04_Bus_Lighting_Optics",
                mat=mat_registry.led_headlight
            )
            created_objects.append(lens)
            
        # 3. L-Shaped LED Daytime Running Light (DRL) Brow (Ice-Blue Crisp Glow)
        drl_brow = c.create_box(
            f"LIGHT_Headlight_DRL_Brow_{side}",
            location=(hl_x, hl_y + 0.060, hl_z + 0.090),
            size=(0.380, 0.025, 0.030),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.drl_ice_blue if hasattr(mat_registry, "drl_ice_blue") else mat_registry.led_headlight
        )
        created_objects.append(drl_brow)
        
        # 4. Dynamic Amber Turn Signal Indicator Strip
        turn_strip = c.create_box(
            f"LIGHT_Front_Turn_Indicator_{side}",
            location=(hl_x + sign * 0.160, hl_y + 0.060, hl_z - 0.050),
            size=(0.070, 0.025, 0.100),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.led_amber_marker
        )
        created_objects.append(turn_strip)
        
        # 5. Clear Polycarbonate Outer Protective Cover Lens
        outer_lens = c.create_box(
            f"LIGHT_Headlight_OuterLens_{side}",
            location=(hl_x, hl_y + 0.075, hl_z),
            size=(0.440, 0.015, 0.240),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.polycarb_lens if hasattr(mat_registry, "polycarb_lens") else mat_registry.glass_clear
        )
        created_objects.append(outer_lens)

        # 6. Lower Bumper Projector Fog Lamps
        fog_x = sign * 0.760
        fog_y = c.FRONT_BUMPER_Y + 0.025
        fog_z = c.GROUND_CLEARANCE + 0.180
        fog_bezel = c.create_cylinder(
            f"LIGHT_FogLamp_Bezel_{side}",
            location=(fog_x, fog_y, fog_z),
            radius=0.055,
            depth=0.030,
            rotation=(math.radians(90), 0, 0),
            vertices=20,
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.trim_piano_black if hasattr(mat_registry, "trim_piano_black") else mat_registry.trim_satin_black
        )
        created_objects.append(fog_bezel)
        
        fog_lens = c.create_cylinder(
            f"LIGHT_FogLamp_Lens_{side}",
            location=(fog_x, fog_y + 0.015, fog_z),
            radius=0.042,
            depth=0.025,
            rotation=(math.radians(90), 0, 0),
            vertices=20,
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.led_headlight
        )
        created_objects.append(fog_lens)

    # -------------------------------------------------------------------------
    # 2. REAR VERTICAL MULTI-CHAMBER LED TAILLIGHT TOWERS
    # -------------------------------------------------------------------------
    tl_y = c.REAR_BUMPER_Y + 0.020
    tl_base_z = c.GROUND_CLEARANCE + 0.750
    
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        tl_x = sign * 1.100
        
        # Dark Taillight Bucket Housing
        tl_housing = c.create_box(
            f"LIGHT_Rear_Taillight_Housing_{side}",
            location=(tl_x, tl_y, tl_base_z + 0.650),
            size=(0.160, 0.060, 1.350),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.trim_piano_black if hasattr(mat_registry, "trim_piano_black") else mat_registry.trim_satin_black
        )
        created_objects.append(tl_housing)
        
        # Chamber 1: Ruby Red OLED Brake & Tail Lightbar (Top & Middle)
        brake_led = c.create_box(
            f"LIGHT_Rear_Brake_OLED_{side}",
            location=(tl_x, tl_y - 0.025, tl_base_z + 0.950),
            size=(0.110, 0.020, 0.550),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.led_taillight
        )
        created_objects.append(brake_led)
        
        # Chamber 2: Dynamic Amber Turn Indicator
        turn_led = c.create_box(
            f"LIGHT_Rear_Turn_LED_{side}",
            location=(tl_x, tl_y - 0.025, tl_base_z + 0.550),
            size=(0.110, 0.020, 0.200),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.led_amber_marker
        )
        created_objects.append(turn_led)
        
        # Chamber 3: High-Output White LED Reverse Lamp
        rev_led = c.create_box(
            f"LIGHT_Rear_Reverse_LED_{side}",
            location=(tl_x, tl_y - 0.025, tl_base_z + 0.320),
            size=(0.110, 0.020, 0.160),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.led_headlight
        )
        created_objects.append(rev_led)
        
        # Chamber 4: Red Retro-Reflector
        refl_led = c.create_box(
            f"LIGHT_Rear_Reflector_{side}",
            location=(tl_x, tl_y - 0.025, tl_base_z + 0.100),
            size=(0.110, 0.020, 0.160),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.led_taillight
        )
        created_objects.append(refl_led)
        
        # Smoked Ruby Acrylic Outer Cover Lens
        tl_cover = c.create_box(
            f"LIGHT_Rear_Taillight_CoverLens_{side}",
            location=(tl_x, tl_y - 0.038, tl_base_z + 0.650),
            size=(0.140, 0.012, 1.300),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.smoked_ruby_lens if hasattr(mat_registry, "smoked_ruby_lens") else mat_registry.led_taillight
        )
        created_objects.append(tl_cover)

    # -------------------------------------------------------------------------
    # 3. LED MATRIX DESTINATION DISPLAYS (Amber Dot-Matrix Boards)
    # -------------------------------------------------------------------------
    # Front Panoramic Route Destination Display
    front_dest = c.create_box(
        "LIGHT_Destination_Matrix_Sign_Front",
        location=(0.0, c.FRONT_BUMPER_Y - 0.220, c.DESTINATION_SIGN_Z),
        size=(1.950, 0.040, 0.320),
        col_name="04_Bus_Lighting_Optics",
        mat=mat_registry.led_destination
    )
    created_objects.append(front_dest)
    
    # Curbside Passenger Door Route Display
    side_dest = c.create_box(
        "LIGHT_Destination_Matrix_Sign_Side",
        location=(-1.0 * (bw/2.0 + 0.025), 3.400, c.DESTINATION_SIGN_Z - 0.180),
        size=(0.025, 0.920, 0.160),
        col_name="04_Bus_Lighting_Optics",
        mat=mat_registry.led_destination
    )
    created_objects.append(side_dest)
    
    # Rear Route Number Display
    rear_dest = c.create_box(
        "LIGHT_Destination_Matrix_Sign_Rear",
        location=(0.0, c.REAR_BUMPER_Y + 0.020, c.DESTINATION_SIGN_Z - 0.080),
        size=(0.680, 0.030, 0.220),
        col_name="04_Bus_Lighting_Optics",
        mat=mat_registry.led_destination
    )
    created_objects.append(rear_dest)

    # 4. Roof Clearance & Side Marker LEDs
    for sign in [1.0, -1.0]:
        # Front Upper White/Amber Clearance LED
        f_clear = c.create_cylinder(
            f"LIGHT_Clearance_Marker_Front_{'L' if sign > 0 else 'R'}",
            location=(sign * (bw/2.0 - 0.180), c.FRONT_BUMPER_Y - 0.650, c.ROOF_BODY_Z - 0.040),
            radius=0.032,
            depth=0.020,
            rotation=(0, math.radians(90 if sign > 0 else -90), 0),
            vertices=16,
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.led_amber_marker
        )
        created_objects.append(f_clear)
        
        # Rear Upper Red Clearance LED
        r_clear = c.create_cylinder(
            f"LIGHT_Clearance_Marker_Rear_{'L' if sign > 0 else 'R'}",
            location=(sign * (bw/2.0 - 0.180), c.REAR_BUMPER_Y + 0.080, c.ROOF_BODY_Z - 0.040),
            radius=0.032,
            depth=0.020,
            rotation=(0, math.radians(90 if sign > 0 else -90), 0),
            vertices=16,
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.led_taillight
        )
        created_objects.append(r_clear)

    print(f"[BUS_LIGHTING] Assembled multi-chamber lighting optics with {len(created_objects)} optical modules.")
    return created_objects
