"""
Bugatti Divo 1.83m Active Aerodynamic Rear Wing & Airbrake (Blender 4.x / 5.x)
High-Fidelity Track-Focused Hypercar Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import divo_common as c

def build_divo_active_wing(mat_registry):
    """Constructs the 1.83m wide active carbon rear wing, dual hydraulic actuator pylons, and endplates."""
    created_objects = []

    wing_span = c.WING_SPAN_Y # 1.830 m
    wing_chord = 0.420        # 420 mm chord depth
    wing_thick = 0.045        # 45 mm thickness
    wing_z = c.WING_HEIGHT_Z  # 1.320 m
    wing_y = c.REAR_AXLE_Y - 0.550 # -1.905 m

    # 1. Master Active Carbon Fiber Airfoil Main Plane
    wing_mesh = bpy.data.meshes.new("AERO_Active_Rear_Wing_MainPlane_Mesh")
    wing_obj = bpy.data.objects.new("AERO_Active_Rear_Wing_MainPlane", wing_mesh)
    
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        x = v.co.x * wing_span
        y = v.co.y * wing_chord
        z = v.co.z * wing_thick
        
        # Aerodynamic camber curve (teardrop profile)
        if y < 0:
            z *= 0.35 # Tapered trailing edge
        # Gullwing droop towards wingtips
        norm_x = abs(x) / (wing_span / 2.0)
        z -= 0.045 * (norm_x ** 2)
        
        v.co.x = x
        v.co.y = y
        v.co.z = z
        
    bm.to_mesh(wing_mesh)
    bm.free()
    
    wing_obj.location = (0.0, wing_y, wing_z)
    wing_obj.rotation_euler = (math.radians(-8), 0, 0) # 8-degree high-downforce AoA
    c.link_to_collection(wing_obj, "03_Divo_Active_Rear_Wing")
    wing_obj.data.materials.append(mat_registry.carbon_gloss)
    c.apply_finishing(wing_obj, bevel=0.003)
    created_objects.append(wing_obj)

    # 2. Dual Hydraulic Actuating Pylons / Stanchions
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        pylon_x = sign * 0.420
        # Main Hydraulic Ram
        ram = c.create_cylinder(
            f"AERO_Rear_Wing_Hydraulic_Ram_{side}",
            location=(pylon_x, wing_y + 0.020, (c.ROOF_CROWN_Z + wing_z)/2.0 - 0.040),
            radius=0.038,
            depth=0.340,
            rotation=(math.radians(15), 0, 0),
            vertices=24,
            col_name="03_Divo_Active_Rear_Wing",
            mat=mat_registry.w16_engine_block
        )
        created_objects.append(ram)
        
        # Carbon Pylon Mount Shroud
        shroud = c.create_box(
            f"AERO_Rear_Wing_Pylon_Shroud_{side}",
            location=(pylon_x, wing_y + 0.020, (c.ROOF_CROWN_Z + wing_z)/2.0 - 0.040),
            size=(0.045, 0.220, 0.320),
            col_name="03_Divo_Active_Rear_Wing",
            mat=mat_registry.carbon_gloss
        )
        created_objects.append(shroud)

    # 3. Aerodynamic Wing Endplates with Divo Turquoise Inlay
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        endplate_x = sign * (wing_span / 2.0 + 0.012)
        endplate = c.create_box(
            f"AERO_Rear_Wing_Endplate_{side}",
            location=(endplate_x, wing_y, wing_z - 0.020),
            size=(0.020, wing_chord + 0.080, 0.220),
            col_name="03_Divo_Active_Rear_Wing",
            mat=mat_registry.carbon_gloss
        )
        created_objects.append(endplate)
        
        # Outer Turquoise Accent Pinstripe
        endplate_stripe = c.create_box(
            f"AERO_Rear_Wing_Endplate_Turquoise_Accent_{side}",
            location=(endplate_x + sign * 0.008, wing_y, wing_z - 0.020),
            size=(0.008, wing_chord + 0.060, 0.040),
            col_name="03_Divo_Active_Rear_Wing",
            mat=mat_registry.divo_racing_blue
        )
        created_objects.append(endplate_stripe)

    # 4. Gurney Flap / Wickerbill Strip (Spans full 1.83m trailing edge)
    gurney = c.create_box(
        "AERO_Rear_Wing_Gurney_Flap_Wickerbill",
        location=(0.0, wing_y - wing_chord/2.0 - 0.010, wing_z + 0.015),
        size=(wing_span - 0.040, 0.015, 0.020),
        col_name="03_Divo_Active_Rear_Wing",
        mat=mat_registry.carbon_satin
    )
    created_objects.append(gurney)

    print(f"[DIVO_WING] Created {len(created_objects)} active rear wing & aerodynamic pylon objects.")
    return created_objects
