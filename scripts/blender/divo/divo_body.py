"""
Bugatti Divo Sculpted Hypercar Body Shell & Aerodynamics (Blender 4.x / 5.x)
High-Fidelity Track-Focused Hypercar Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import divo_common as c

def build_divo_body_and_aero(mat_registry):
    """Constructs the sculpted Bugatti Divo aerodynamic body, horseshoe grille, front splitter, side scoops, and rear diffuser."""
    created_objects = []

    bw = c.OVERALL_WIDTH
    bl = c.OVERALL_LENGTH
    bh = c.OVERALL_HEIGHT - c.GROUND_CLEARANCE
    bz_center = c.GROUND_CLEARANCE + bh / 2.0

    # 1. Master Bugatti Divo Aerodynamic Body Shell
    body_mesh = bpy.data.meshes.new("BODY_Divo_Hypercar_Shell_Mesh")
    body_obj = bpy.data.objects.new("BODY_Divo_Hypercar_Shell", body_mesh)
    
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    
    for v in bm.verts:
        x = v.co.x * bw
        y = v.co.y * bl
        z = v.co.z * bh
        
        # Front Hood Slope & Fender Haunches (+Y > 0.6m)
        if y > 0.6:
            t_fwd = (y - 0.6) / (c.FRONT_BUMPER_Y - 0.6)
            # Low nose rake
            z -= 0.35 * t_fwd
            # Nose narrowing towards horseshoe grille
            x *= (1.0 - 0.28 * t_fwd)
            
        # Rear Haunch & W16 Bay Taper (-Y < -0.4m)
        if y < -0.4:
            t_aft = (abs(y) - 0.4) / (abs(c.REAR_BUMPER_Y) - 0.4)
            # Muscular rear haunch flare
            if abs(x) > 0.4 and z < 0.2:
                x *= (1.0 + 0.12 * t_aft)
            # Rear Kammback decklid drop
            if z > 0:
                z -= 0.18 * t_aft
                
        # Roof Tumblehome & Canopy Profile
        if z > 0:
            norm_x = abs(x) / (bw / 2.0)
            z -= 0.22 * (norm_x ** 1.8)
            
        v.co.x = x
        v.co.y = y
        v.co.z = z
        
    bm.to_mesh(body_mesh)
    bm.free()
    
    body_obj.location = (0.0, 0.0, bz_center)
    c.link_to_collection(body_obj, "01_Divo_Body_Monocoque")
    body_obj.data.materials.append(mat_registry.divo_titanium_grey)
    c.apply_finishing(body_obj, bevel=0.008)
    created_objects.append(body_obj)

    # 2. Iconic Bugatti Horseshoe Center Grille Assembly
    horseshoe_bezel = c.create_cylinder(
        "BODY_Bugatti_Horseshoe_Grille_Bezel",
        location=(0.0, c.FRONT_BUMPER_Y - 0.040, c.GROUND_CLEARANCE + 0.320),
        radius=0.340,
        depth=0.180,
        rotation=(math.radians(90), 0, 0),
        vertices=36,
        col_name="01_Divo_Body_Monocoque",
        mat=mat_registry.horseshoe_chrome
    )
    created_objects.append(horseshoe_bezel)
    
    horseshoe_mesh = c.create_box(
        "BODY_Bugatti_Horseshoe_Carbon_Mesh_Core",
        location=(0.0, c.FRONT_BUMPER_Y - 0.030, c.GROUND_CLEARANCE + 0.320),
        size=(0.580, 0.040, 0.520),
        col_name="01_Divo_Body_Monocoque",
        mat=mat_registry.carbon_gloss
    )
    created_objects.append(horseshoe_mesh)

    # 3. High-Downforce Front Carbon Fiber Splitter Tray & Air Curtains
    # Massive front splitter generating 90kg additional downforce
    splitter_w = bw + 0.060
    splitter_l = 0.850
    front_splitter = c.create_box(
        "AERO_Front_Carbon_Splitter_Tray",
        location=(0.0, c.FRONT_BUMPER_Y + 0.080, c.GROUND_CLEARANCE + 0.035),
        size=(splitter_w, splitter_l, 0.045),
        col_name="02_Divo_Aero_Splitter_Diffuser",
        mat=mat_registry.carbon_gloss
    )
    created_objects.append(front_splitter)

    # Lateral Front Splitter Winglets & Divo Turquoise Pinstriping
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        winglet = c.create_box(
            f"AERO_Front_Splitter_Winglet_{side}",
            location=(sign * (splitter_w / 2.0 - 0.020), c.FRONT_BUMPER_Y + 0.020, c.GROUND_CLEARANCE + 0.120),
            size=(0.035, 0.420, 0.180),
            col_name="02_Divo_Aero_Splitter_Diffuser",
            mat=mat_registry.divo_racing_blue
        )
        created_objects.append(winglet)
        
        # Front Brake Air Curtain Ducts (Guides airflow around front 285mm tires)
        air_curtain = c.create_box(
            f"AERO_Front_Brake_Air_Curtain_{side}",
            location=(sign * 0.780, c.FRONT_BUMPER_Y - 0.150, c.GROUND_CLEARANCE + 0.280),
            size=(0.280, 0.220, 0.220),
            col_name="02_Divo_Aero_Splitter_Diffuser",
            mat=mat_registry.carbon_gloss
        )
        created_objects.append(air_curtain)

    # 4. Sculpted Front Hood with Dual Extraction NACA Vents
    hood_extractor = c.create_box(
        "BODY_Front_Hood_Air_Extractor_Vent",
        location=(0.0, 1.450, c.COWL_Z + 0.020),
        size=(0.720, 0.650, 0.060),
        col_name="01_Divo_Body_Monocoque",
        mat=mat_registry.carbon_gloss
    )
    created_objects.append(hood_extractor)

    # 5. Iconic Bugatti Atlantic Center Dorsal Fin (Roof to Rear Wing Spine)
    dorsal_fin = c.create_box(
        "AERO_Bugatti_Atlantic_Center_Dorsal_Fin",
        location=(0.0, -0.650, c.ROOF_CROWN_Z + 0.070),
        size=(0.028, 2.200, 0.160),
        col_name="01_Divo_Body_Monocoque",
        mat=mat_registry.carbon_gloss
    )
    created_objects.append(dorsal_fin)

    # 6. Roof NACA Duct Air Intake Scoops (Feeds Quad-Turbo W16 Airbox)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        naca = c.create_box(
            f"BODY_Roof_NACA_Air_Scoop_{side}",
            location=(sign * 0.380, 0.100, c.ROOF_CROWN_Z - 0.010),
            size=(0.220, 0.580, 0.050),
            col_name="11_Divo_Hardware_AirIntakes",
            mat=mat_registry.carbon_gloss
        )
        created_objects.append(naca)

    # 7. Muscular Rear Haunches & Side Intercooler Intakes (Bugatti C-Line Evolution)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # Side Intake Scoop
        side_scoop = c.create_box(
            f"BODY_Side_Intercooler_Air_Scoop_{side}",
            location=(sign * (bw / 2.0 - 0.050), -0.450, c.BELTLINE_Z - 0.050),
            size=(0.180, 0.950, 0.480),
            col_name="11_Divo_Hardware_AirIntakes",
            mat=mat_registry.carbon_gloss
        )
        created_objects.append(side_scoop)
        
        # Side Aerodynamic Rocker Skirts with Divo Turquoise Inlay
        skirt = c.create_box(
            f"AERO_Side_Rocker_Skirt_{side}",
            location=(sign * (bw / 2.0 + 0.015), 0.0, c.GROUND_CLEARANCE + 0.045),
            size=(0.080, 2.350, 0.065),
            col_name="02_Divo_Aero_Splitter_Diffuser",
            mat=mat_registry.carbon_gloss
        )
        created_objects.append(skirt)
        
        skirt_inlay = c.create_box(
            f"AERO_Side_Rocker_Turquoise_Blade_{side}",
            location=(sign * (bw / 2.0 + 0.035), 0.0, c.GROUND_CLEARANCE + 0.045),
            size=(0.020, 2.200, 0.025),
            col_name="02_Divo_Aero_Splitter_Diffuser",
            mat=mat_registry.divo_racing_blue
        )
        created_objects.append(skirt_inlay)

    # 8. Massive 4-Channel Rear Venturi Aerodynamic Diffuser
    diffuser_w = bw - 0.080
    diffuser_l = 1.150
    diffuser = c.create_box(
        "AERO_Rear_Venturi_Diffuser_Assembly",
        location=(0.0, c.REAR_BUMPER_Y - 0.050, c.GROUND_CLEARANCE + 0.160),
        size=(diffuser_w, diffuser_l, 0.280),
        col_name="02_Divo_Aero_Splitter_Diffuser",
        mat=mat_registry.carbon_satin
    )
    created_objects.append(diffuser)

    # 4 Vertical Diffuser Vortex Strakes (Channels high-speed underbody air)
    for s_idx, x_pos in enumerate([-0.720, -0.280, 0.280, 0.720]):
        strake = c.create_box(
            f"AERO_Diffuser_Vortex_Strake_{s_idx+1:02d}",
            location=(x_pos, c.REAR_BUMPER_Y - 0.080, c.GROUND_CLEARANCE + 0.140),
            size=(0.025, 0.980, 0.240),
            col_name="02_Divo_Aero_Splitter_Diffuser",
            mat=mat_registry.divo_racing_blue
        )
        created_objects.append(strake)

    # 9. Butterfly Dihedral Doors (Left & Right)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        door = c.create_box(
            f"BODY_Butterfly_Door_Panel_{side}",
            location=(sign * (bw / 2.0 - 0.080), 0.350, c.BELTLINE_Z - 0.040),
            size=(0.140, 1.350, 0.620),
            col_name="01_Divo_Body_Monocoque",
            mat=mat_registry.divo_titanium_grey
        )
        created_objects.append(door)

    print(f"[DIVO_BODY] Created {len(created_objects)} body and aerodynamic objects.")
    return created_objects
