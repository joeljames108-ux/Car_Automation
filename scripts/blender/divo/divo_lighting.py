"""
Bugatti Divo Ultra-Slim C-Blade LED Headlights & 3D OLED Fin Taillights (Blender 4.x / 5.x)
High-Fidelity Track-Focused Hypercar Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import divo_common as c

def build_divo_lighting(mat_registry):
    """Constructs C-shaped horizontal LED headlights and the revolutionary 44-fin 3D OLED matrix taillight array."""
    created_objects = []

    # 1. Front Ultra-Slim Horizontal C-Shaped LED Headlight Projectors
    # Wraps around the front fenders with razor-sharp 35mm optical blades
    hl_y = c.FRONT_BUMPER_Y - 0.280
    hl_z = c.COWL_Z - 0.080
    
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        hl_x = sign * 0.760
        # C-Blade Upper Horizontal LED Strip
        upper_strip = c.create_box(
            f"LIGHT_Headlight_C_Blade_Upper_{side}",
            location=(hl_x, hl_y, hl_z + 0.040),
            size=(0.340, 0.180, 0.024),
            col_name="04_Divo_Lighting_OLED_Fins",
            mat=mat_registry.led_headlight_crystal
        )
        created_objects.append(upper_strip)
        
        # C-Blade Outer Vertical DRL Arch
        outer_arch = c.create_box(
            f"LIGHT_Headlight_C_Blade_Vertical_{side}",
            location=(hl_x + sign * 0.150, hl_y - 0.040, hl_z),
            size=(0.024, 0.220, 0.090),
            col_name="04_Divo_Lighting_OLED_Fins",
            mat=mat_registry.led_headlight_crystal
        )
        created_objects.append(outer_arch)
        
        # Dual High-Output Micro-Projector Lenses
        for p_idx, p_off in enumerate([-0.080, 0.040]):
            lens = c.create_cylinder(
                f"LIGHT_Headlight_Projector_{side}_{p_idx+1}",
                location=(hl_x + sign * p_off, hl_y + 0.050, hl_z),
                radius=0.032,
                depth=0.060,
                rotation=(math.radians(90), 0, 0),
                vertices=24,
                col_name="04_Divo_Lighting_OLED_Fins",
                mat=mat_registry.led_headlight_crystal
            )
            created_objects.append(lens)

    # 2. Revolutionary 3D-Printed 44-Fin OLED Matrix Taillight Array
    # Iconic Bugatti Divo rear light signature: 44 discrete illuminated 3D fins fading from center
    tl_y = c.REAR_BUMPER_Y + 0.080
    tl_z = c.GROUND_CLEARANCE + 0.640
    
    # 22 Fins per side (total 44 fins)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        num_fins = 22
        for fin_idx in range(num_fins):
            # Center fins are longer and narrower; outer fins become wider and shorter
            norm_idx = fin_idx / (num_fins - 1)
            fin_x = sign * (0.080 + norm_idx * 0.880)
            fin_len = 0.280 * (1.0 - 0.65 * norm_idx) # Fades towards outer edge
            fin_h = 0.080 + 0.040 * math.sin(norm_idx * math.pi)
            fin_w = 0.012 + 0.010 * norm_idx
            
            fin_obj = c.create_box(
                f"LIGHT_3D_OLED_Taillight_Fin_{side}_{fin_idx+1:02d}",
                location=(fin_x, tl_y - fin_len/2.0, tl_z),
                size=(fin_w, fin_len, fin_h),
                col_name="04_Divo_Lighting_OLED_Fins",
                mat=mat_registry.oled_taillight_fin
            )
            created_objects.append(fin_obj)

    # 3. Center High-Mount Brake Light (Integrated into Atlantic Dorsal Fin Trailing Edge)
    chmsl = c.create_box(
        "LIGHT_CHMSL_Dorsal_Fin_Brake_Light",
        location=(0.0, -1.850, c.ROOF_CROWN_Z - 0.040),
        size=(0.024, 0.450, 0.035),
        col_name="04_Divo_Lighting_OLED_Fins",
        mat=mat_registry.oled_taillight_fin
    )
    created_objects.append(chmsl)

    print(f"[DIVO_LIGHTING] Created {len(created_objects)} lighting, C-blade & 3D OLED fin objects.")
    return created_objects
