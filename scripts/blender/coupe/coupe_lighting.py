"""
Bentley Continental GT II Coupe (2011) Lighting System (Blender 5.2 LTS)
High-Fidelity Quad Circular Jewel Headlamps & Horizontal Elliptical Ruby OLED Taillights
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
from coupe_common import link_to_collection, create_cylinder_primitive, create_box_primitive

def build_lighting(mats):
    """
    Construct complete Bentley Continental GT II front jewel optics and rear OLED clusters.
    All optics positioned flush and proud on the body contours for maximum visual fidelity.
    """
    created_objects = []
    
    # -------------------------------------------------------------------------
    # 1. FRONT QUAD CIRCULAR JEWEL HEADLAMPS (2 PER SIDE: INNER & OUTER)
    # -------------------------------------------------------------------------
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # ---------------------------------------------------------------------
        # A. Inner Large Primary Projector & Crystal Halo DRL Ring
        # ---------------------------------------------------------------------
        inner_center = Vector((sign * 0.435, 2.365, 0.685))
        inner_rot = (math.radians(88), 0.0, sign * math.radians(-3))
        
        # Inner Chrome Housing Bezel
        bezel_in = create_cylinder_primitive(
            f"Headlamp_Inner_Bezel_{side}",
            radius=0.072,
            depth=0.028,
            segments=36,
            location=inner_center,
            rotation=inner_rot,
            mat=mats.matrix_chrome,
            collection_name="09_Coupe_Lighting_Optics"
        )
        created_objects.append(bezel_in)
        
        # Inner Crystal Faceted DRL Halo Ring
        halo_in = create_cylinder_primitive(
            f"Headlamp_Inner_Halo_{side}",
            radius=0.067,
            depth=0.012,
            segments=36,
            location=inner_center + Vector((0, 0.008, 0)),
            rotation=inner_rot,
            mat=mats.led_halo_drl,
            collection_name="09_Coupe_Lighting_Optics"
        )
        created_objects.append(halo_in)
        
        # Inner Projector Core Lens (Intense 6000K daylight beam)
        core_in = create_cylinder_primitive(
            f"Headlamp_Inner_Projector_{side}",
            radius=0.038,
            depth=0.020,
            segments=28,
            location=inner_center + Vector((0, 0.010, 0)),
            rotation=inner_rot,
            mat=mats.led_headlight_core,
            collection_name="09_Coupe_Lighting_Optics"
        )
        created_objects.append(core_in)
        
        # Inner Polycarbonate Protective Front Cover Disc
        lens_in = create_cylinder_primitive(
            f"Headlamp_Inner_CrystalLens_{side}",
            radius=0.070,
            depth=0.006,
            segments=36,
            location=inner_center + Vector((0, 0.016, 0)),
            rotation=inner_rot,
            mat=mats.polycarb_lens,
            collection_name="09_Coupe_Lighting_Optics"
        )
        created_objects.append(lens_in)

        # ---------------------------------------------------------------------
        # B. Outer Companion Projector Lamp (Swept Along Fender Contour)
        # ---------------------------------------------------------------------
        outer_center = Vector((sign * 0.585, 2.365, 0.695))
        outer_rot = (math.radians(88), 0.0, sign * math.radians(-6))
        
        # Outer Chrome Housing Bezel
        bezel_out = create_cylinder_primitive(
            f"Headlamp_Outer_Bezel_{side}",
            radius=0.054,
            depth=0.028,
            segments=32,
            location=outer_center,
            rotation=outer_rot,
            mat=mats.matrix_chrome,
            collection_name="09_Coupe_Lighting_Optics"
        )
        created_objects.append(bezel_out)
        
        # Outer Crystal Faceted DRL Halo Ring
        halo_out = create_cylinder_primitive(
            f"Headlamp_Outer_Halo_{side}",
            radius=0.049,
            depth=0.010,
            segments=32,
            location=outer_center + Vector((0, 0.008, 0)),
            rotation=outer_rot,
            mat=mats.led_halo_drl,
            collection_name="09_Coupe_Lighting_Optics"
        )
        created_objects.append(halo_out)
        
        # Outer Projector Core Lens
        core_out = create_cylinder_primitive(
            f"Headlamp_Outer_Projector_{side}",
            radius=0.028,
            depth=0.018,
            segments=24,
            location=outer_center + Vector((0, 0.010, 0)),
            rotation=outer_rot,
            mat=mats.led_headlight_core,
            collection_name="09_Coupe_Lighting_Optics"
        )
        created_objects.append(core_out)
        
        # Outer Polycarbonate Protective Front Cover Disc
        lens_out = create_cylinder_primitive(
            f"Headlamp_Outer_CrystalLens_{side}",
            radius=0.052,
            depth=0.006,
            segments=32,
            location=outer_center + Vector((0, 0.015, 0)),
            rotation=outer_rot,
            mat=mats.polycarb_lens,
            collection_name="09_Coupe_Lighting_Optics"
        )
        created_objects.append(lens_out)

    # -------------------------------------------------------------------------
    # 2. REAR HORIZONTAL ELLIPTICAL RUBY OLED TAILLIGHT CLUSTERS
    # -------------------------------------------------------------------------
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        rear_pos = Vector((sign * 0.535, -2.485, 0.725))
        rear_rot = (math.radians(-88), 0.0, sign * math.radians(4))
        
        # Elliptical Chrome Bezel Trim Frame
        bezel_rear = create_cylinder_primitive(
            f"Taillight_Elliptical_Bezel_{side}",
            radius=0.088,
            depth=0.024,
            segments=36,
            location=rear_pos,
            rotation=rear_rot,
            mat=mats.matrix_chrome,
            collection_name="09_Coupe_Lighting_Optics"
        )
        bezel_rear.scale = (1.45, 0.78, 1.0)
        created_objects.append(bezel_rear)
        
        # Ruby OLED Primary Halo Loop
        ruby_loop = create_cylinder_primitive(
            f"Taillight_Ruby_OLED_Ring_{side}",
            radius=0.080,
            depth=0.014,
            segments=36,
            location=rear_pos - Vector((0, 0.006, 0)),
            rotation=rear_rot,
            mat=mats.led_taillight_ruby,
            collection_name="09_Coupe_Lighting_Optics"
        )
        ruby_loop.scale = (1.42, 0.75, 1.0)
        created_objects.append(ruby_loop)
        
        # Inner Reverse & Turn Signal White LED Array
        inner_sig = create_box_primitive(
            f"Taillight_Inner_Signals_{side}",
            size=(0.110, 0.008, 0.024),
            location=rear_pos - Vector((0, 0.008, 0)),
            mat=mats.led_reverse_white,
            collection_name="09_Coupe_Lighting_Optics"
        )
        created_objects.append(inner_sig)
        
        # Smoked Ruby Outer Cover Lens
        ruby_lens = create_cylinder_primitive(
            f"Taillight_Cover_SmokedRuby_{side}",
            radius=0.085,
            depth=0.006,
            segments=36,
            location=rear_pos - Vector((0, 0.012, 0)),
            rotation=rear_rot,
            mat=mats.smoked_ruby_lens,
            collection_name="09_Coupe_Lighting_Optics"
        )
        ruby_lens.scale = (1.46, 0.79, 1.0)
        created_objects.append(ruby_lens)

    # -------------------------------------------------------------------------
    # 3. REAR DUCKTAIL LIP CHMSL (CENTER HIGH MOUNTED STOP LAMP)
    # -------------------------------------------------------------------------
    chmsl = create_box_primitive(
        "Taillight_CHMSL_DucktailLip",
        size=(0.460, 0.018, 0.014),
        location=(0.0, -2.420, 0.965),
        mat=mats.led_taillight_ruby,
        collection_name="09_Coupe_Lighting_Optics"
    )
    chmsl.rotation_euler = (math.radians(-10), 0.0, 0.0)
    created_objects.append(chmsl)
    
    print(f"[COUPE_LIGHTING] High-fidelity quad jewel headlamps and elliptical OLED taillights created ({len(created_objects)} items).")
    return created_objects
