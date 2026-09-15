"""
Bentley Continental GT II Coupe (2011) Exterior Hardware System (Blender 5.2 LTS)
Aero Mirrors with LED Turn Strips, Flush Chrome Door Handles, Rocker Chrome Strips, Dual Inconel Oval Tailpipes, and Winged Boot Emblem
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
from coupe_common import link_to_collection, create_box_primitive, create_cylinder_primitive

def build_hardware(mats):
    """
    Construct all exterior jewelry, side mirrors, door handles, and signature oval exhaust outlets.
    """
    # -------------------------------------------------------------------------
    # 1. AERODYNAMIC SIDE WING MIRRORS
    # -------------------------------------------------------------------------
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        mirror_base = Vector((sign * 0.835, 0.720, 0.915))
        
        # Chrome aerodynamic mounting stalk
        stalk = create_cylinder_primitive(
            f"Mirror_Stalk_{side}",
            radius=0.015,
            depth=0.080,
            segments=16,
            location=mirror_base + Vector((sign * 0.030, 0.0, 0.015)),
            rotation=(0.0, math.radians(sign * -45), 0.0),
            mat=mats.matrix_chrome,
            collection_name="10_Coupe_Exterior_Hardware"
        )
        
        # Sculpted body-color mirror housing shell
        shell = create_box_primitive(
            f"Mirror_Housing_{side}",
            size=(0.130, 0.210, 0.100),
            location=mirror_base + Vector((sign * 0.095, 0.010, 0.050)),
            mat=mats.body_red,
            collection_name="10_Coupe_Exterior_Hardware"
        )
        shell.rotation_euler = (math.radians(-5), math.radians(sign * -8), math.radians(sign * 12))
        
        # Mirror Glass Face (Reflective chrome/glass facing rearward)
        glass_face = create_box_primitive(
            f"Mirror_Glass_{side}",
            size=(0.115, 0.010, 0.085),
            location=mirror_base + Vector((sign * 0.090, -0.070, 0.050)),
            mat=mats.matrix_chrome,
            collection_name="10_Coupe_Exterior_Hardware"
        )
        glass_face.rotation_euler = (math.radians(-5), math.radians(sign * -8), math.radians(sign * 12))
        
        # Integrated Amber LED Turn Indicator Strip
        turn_strip = create_box_primitive(
            f"Mirror_Turn_LED_{side}",
            size=(0.120, 0.010, 0.012),
            location=mirror_base + Vector((sign * 0.100, 0.105, 0.045)),
            mat=mats.led_amber_turn,
            collection_name="10_Coupe_Exterior_Hardware"
        )
        turn_strip.rotation_euler = (math.radians(-5), math.radians(sign * -8), math.radians(sign * 12))

    # -------------------------------------------------------------------------
    # 2. FLUSH CHROME DOOR HANDLES
    # -------------------------------------------------------------------------
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        handle_pos = Vector((sign * 0.880, -0.120, 0.880))
        
        # Recessed handle housing pocket (satin black)
        pocket = create_box_primitive(
            f"Door_Handle_Pocket_{side}",
            size=(0.018, 0.190, 0.050),
            location=handle_pos,
            mat=mats.trim_satin_black,
            collection_name="10_Coupe_Exterior_Hardware"
        )
        
        # Bright Chrome Pull Bar
        bar = create_cylinder_primitive(
            f"Door_Handle_Bar_{side}",
            radius=0.011,
            depth=0.160,
            segments=20,
            location=handle_pos + Vector((sign * 0.010, 0.0, 0.0)),
            rotation=(math.radians(90), 0.0, 0.0),
            mat=mats.matrix_chrome,
            collection_name="10_Coupe_Exterior_Hardware"
        )

    # -------------------------------------------------------------------------
    # 3. LOWER ROCKER SILL CHROME SPEAR STRIPS
    # -------------------------------------------------------------------------
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        sill_strip = create_box_primitive(
            f"Rocker_Chrome_Spear_{side}",
            size=(0.020, 1.960, 0.016),
            location=(sign * 0.890, 0.0, 0.220),
            mat=mats.matrix_chrome,
            collection_name="10_Coupe_Exterior_Hardware"
        )

    # -------------------------------------------------------------------------
    # 4. SIGNATURE INCONEL DUAL OVAL EXHAUST TAILPIPES
    # -------------------------------------------------------------------------
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        exhaust_pos = Vector((sign * 0.580, -2.430, 0.260))
        
        # Polished Inconel Chrome Bevel Outer Rim
        outer_pipe = create_cylinder_primitive(
            f"Exhaust_Oval_Outer_{side}",
            radius=0.078,
            depth=0.055,
            segments=36,
            location=exhaust_pos,
            rotation=(math.radians(-88), 0.0, 0.0),
            mat=mats.inconel_exhaust,
            collection_name="10_Coupe_Exterior_Hardware"
        )
        outer_pipe.scale = (1.55, 0.78, 1.0)
        
        # Dark Matte Inner Bore Tube
        inner_bore = create_cylinder_primitive(
            f"Exhaust_Oval_Bore_{side}",
            radius=0.065,
            depth=0.065,
            segments=32,
            location=exhaust_pos - Vector((0, 0.008, 0)),
            rotation=(math.radians(-88), 0.0, 0.0),
            mat=mats.trim_satin_black,
            collection_name="10_Coupe_Exterior_Hardware"
        )
        inner_bore.scale = (1.50, 0.74, 1.0)

    # -------------------------------------------------------------------------
    # 5. REAR TRUNK WINGED "B" EMBLEM
    # -------------------------------------------------------------------------
    boot_emblem = create_cylinder_primitive(
        "Boot_Winged_B_Emblem",
        radius=0.036,
        depth=0.010,
        segments=32,
        location=(0.0, -2.445, 0.915),
        rotation=(math.radians(-75), 0.0, 0.0),
        mat=mats.matrix_chrome,
        collection_name="10_Coupe_Exterior_Hardware"
    )
    
    # Wings spreading out laterally from center badge
    boot_wings = create_box_primitive(
        "Boot_Winged_B_Wings",
        size=(0.190, 0.008, 0.024),
        location=(0.0, -2.443, 0.915),
        mat=mats.matrix_chrome,
        collection_name="10_Coupe_Exterior_Hardware"
    )
    boot_wings.rotation_euler = (math.radians(-75), 0.0, 0.0)


    print("[COUPE_HARDWARE] Aero mirrors, flush handles, rocker spears, dual oval exhaust, and boot emblem created.")
