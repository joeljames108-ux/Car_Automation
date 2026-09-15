"""
Bus Aerodynamic Monocoque Body Shell & Roof HVAC Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
Volvo 9700 H 13m (2006) Tri-Axle High-Floor Luxury Touring Coach Specification
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def create_sculpted_coach_body(mat_registry):
    """
    Constructs the master Volvo 9700 high-floor coach monocoque outer shell.
    Features raked aerodynamic nose, cut wheel arches for all 3 axles, high-floor beltline,
    and curved roof crown.
    """
    mesh = bpy.data.meshes.new("BODY_Coach_Monocoque_Shell_Mesh")
    obj = bpy.data.objects.new("BODY_Coach_Monocoque_Shell", mesh)
    
    bm = bmesh.new()
    
    # Define longitudinal stations (Y coordinates) along the 13m coach
    # Station definition: (Y, is_front_arch, is_rear_arch, front_rake_fac, rear_taper_fac)
    y_stations = [
        6.500,  # 0: Front Bumper clip
        6.250,  # 1: Front Cowl & Lower Radiator
        5.800,  # 2: Windshield Base & Front Fascia
        4.850,  # 3: Front Overhang / A-Pillar
        4.050,  # 4: Front Steer Axle Center (Arch Cutout)
        3.250,  # 5: Front Arch Rear Edge
        2.100,  # 6: Luggage Bay 1
        0.500,  # 7: Luggage Bay 2 (Mid-Cabin)
        -1.000, # 8: Luggage Bay 3
        -1.500, # 9: Drive Axle Arch Front Edge
        -2.150, # 10: Drive Axle Center (Arch Cutout)
        -2.825, # 11: Tandem Axle Inter-Arch Saddle
        -3.500, # 12: Tag Axle Center (Arch Cutout)
        -4.150, # 13: Tag Arch Rear Edge
        -5.400, # 14: Rear Machinery Bay
        -6.500  # 15: Rear Bumper clip
    ]
    
    half_w = c.OVERALL_WIDTH / 2.0 # 1.275m
    roof_z = c.ROOF_BODY_Z         # 3.520m
    belt_z = c.BELTLINE_Z         # 1.580m
    floor_z = c.FLOOR_Z           # 1.250m
    skirt_z = c.GROUND_CLEARANCE + 0.080 # 0.400m
    arch_lip_z = c.HUB_Z + 0.440  # 0.960m (wheel arch crown)
    
    # Cross-section heights (Z levels from bottom to top)
    # Z levels: [skirt_bottom, luggage_rubrail, beltline, window_top, roof_shoulder, roof_center]
    
    station_rings = []
    
    for y in y_stations:
        ring = []
        
        # Determine width taper
        taper_w = half_w
        if y > 5.0:
            t = (y - 5.0) / 1.500
            taper_w *= (1.0 - 0.075 * t)
        elif y < -4.5:
            t = (abs(y) - 4.5) / 2.000
            taper_w *= (1.0 - 0.040 * t)
            
        # Determine bottom Z level (wheel arch cutouts)
        curr_skirt_z = skirt_z
        # Front Wheel Arch
        if 3.400 < y < 4.700:
            dist = abs(y - c.FRONT_AXLE_Y)
            if dist < 0.620:
                arch_h = math.sqrt(max(0.0, 0.620**2 - dist**2)) * 0.70
                curr_skirt_z = max(skirt_z, c.HUB_Z + arch_h)
        # Rear Drive & Tag Tandem Wheel Arches
        elif -4.050 < y < -1.600:
            dist_drive = abs(y - c.REAR_AXLE_Y)
            dist_tag = abs(y - c.TAG_AXLE_Y)
            min_dist = min(dist_drive, dist_tag)
            if min_dist < 0.620:
                arch_h = math.sqrt(max(0.0, 0.620**2 - min_dist**2)) * 0.70
                curr_skirt_z = max(skirt_z, c.HUB_Z + arch_h)
            elif -2.825 - 0.350 < y < -2.825 + 0.350:
                # Inter-axle saddle
                curr_skirt_z = max(skirt_z, c.HUB_Z + 0.220)
                
        # Station-dependent beltline height (slopes down from cabin 1.58m to front cowl 1.22m)
        curr_belt_z = belt_z
        if y > 4.850:
            # Dynamic touring coach beltline drop along front overhang
            t_cowl = (y - 4.850) / (6.500 - 4.850)
            curr_belt_z = belt_z - t_cowl * 0.360 # 1.580m -> 1.220m

        # Front windshield rake offset
        curr_y = y
        if y > 5.0 and belt_z:
            rake_fac = (y - 5.0) / 1.500
            # Higher vertices pull slightly rearward for raked front
        else:
            rake_fac = 0.0
            
        # Define cross-section vertices: Right side (X negative) -> Roof -> Left side (X positive)
        # Points along cross-section:
        # 0: Right Skirt Bottom
        # 1: Right Rub-Rail
        # 2: Right Beltline (sloping down to cowl at front)
        # 3: Right Window Header
        # 4: Right Roof Shoulder
        # 5: Roof Crown Center (X=0)
        # 6: Left Roof Shoulder
        # 7: Left Window Header
        # 8: Left Beltline (sloping down to cowl at front)
        # 9: Left Rub-Rail
        # 10: Left Skirt Bottom
        
        pts = [
            (-taper_w, curr_y, curr_skirt_z),
            (-taper_w * 1.015, curr_y, (curr_skirt_z + curr_belt_z)/2.0),
            (-taper_w, curr_y - rake_fac * 0.08, curr_belt_z),
            (-taper_w * 0.985, curr_y - rake_fac * 0.35, roof_z - 0.220),
            (-taper_w * 0.920, curr_y - rake_fac * 0.45, roof_z - 0.050),
            (0.0, curr_y - rake_fac * 0.48, roof_z + 0.060), # Crown center
            (taper_w * 0.920, curr_y - rake_fac * 0.45, roof_z - 0.050),
            (taper_w * 0.985, curr_y - rake_fac * 0.35, roof_z - 0.220),
            (taper_w, curr_y - rake_fac * 0.08, curr_belt_z),
            (taper_w * 1.015, curr_y, (curr_skirt_z + curr_belt_z)/2.0),
            (taper_w, curr_y, curr_skirt_z)
        ]
        
        for p in pts:
            ring.append(bm.verts.new(Vector(p)))
            
        station_rings.append(ring)
        
    bm.verts.ensure_lookup_table()
    
    # Bridge adjacent rings with quads, leaving windshield and side window bays open
    num_pts_per_ring = len(station_rings[0])
    for s_idx in range(len(station_rings) - 1):
        r1 = station_rings[s_idx]
        r2 = station_rings[s_idx + 1]
        for p_idx in range(num_pts_per_ring - 1):
            # p_idx 2 (Right window opening) & p_idx 7 (Left window opening):
            # Only bridge at station 2->3 (solid A-pillar) and station 14->15 (solid D-pillar / machinery bay)
            # Skip at front wrap-around (s_idx < 2) and along passenger cabin (3 <= s_idx <= 13)
            if (p_idx == 2 or p_idx == 7) and (s_idx < 2 or (3 <= s_idx <= 13)):
                continue
            v1 = r1[p_idx]
            v2 = r1[p_idx + 1]
            v3 = r2[p_idx + 1]
            v4 = r2[p_idx]
            bm.faces.new((v1, v2, v3, v4))
            
    # Front Cap Faces (Station 0) - Open Panoramic Windshield Aperture!
    front_ring = station_rings[0]
    front_belt_z = front_ring[2].co.z # 1.220m
    c_skirt = bm.verts.new(Vector((0.0, y_stations[0], skirt_z)))
    c_center = bm.verts.new(Vector((0.0, y_stations[0], (skirt_z + front_belt_z) / 2.0)))
    c_belt = bm.verts.new(Vector((0.0, y_stations[0], front_belt_z)))
    # Right lower cowl
    bm.faces.new((front_ring[0], front_ring[1], c_center, c_skirt))
    bm.faces.new((front_ring[1], front_ring[2], c_belt, c_center))
    # Left lower cowl
    bm.faces.new((c_skirt, c_center, front_ring[9], front_ring[10]))
    bm.faces.new((c_center, c_belt, front_ring[8], front_ring[9]))
    
    # Upper Roof Forehead Brow (Above Windshield)
    c_header = bm.verts.new(Vector((0.0, front_ring[5].co.y, roof_z - 0.220)))
    bm.faces.new((front_ring[3], front_ring[4], front_ring[5], c_header))
    bm.faces.new((c_header, front_ring[5], front_ring[6], front_ring[7]))
    # Aperture between c_belt and c_header is left 100% OPEN for panoramic windshield!
        
    # Rear Cap Faces (Station -1) - Open Heated Backlight Aperture!
    rear_ring = station_rings[-1]
    r_skirt = bm.verts.new(Vector((0.0, y_stations[-1], skirt_z)))
    r_center = bm.verts.new(Vector((0.0, y_stations[-1], (skirt_z + belt_z) / 2.0)))
    r_belt = bm.verts.new(Vector((0.0, y_stations[-1], belt_z + 0.350)))
    # Right lower rear
    bm.faces.new((r_skirt, r_center, rear_ring[1], rear_ring[0]))
    bm.faces.new((r_center, r_belt, rear_ring[2], rear_ring[1]))
    # Left lower rear
    bm.faces.new((rear_ring[10], rear_ring[9], r_center, r_skirt))
    bm.faces.new((rear_ring[9], rear_ring[8], r_belt, r_center))
    
    # Upper Rear Roof Forehead
    r_header = bm.verts.new(Vector((0.0, rear_ring[5].co.y, roof_z - 0.220)))
    bm.faces.new((r_header, rear_ring[5], rear_ring[4], rear_ring[3]))
    bm.faces.new((rear_ring[7], rear_ring[6], rear_ring[5], r_header))
        
    # Bottom Floor Closure between Skirt bottoms
    for s_idx in range(len(station_rings) - 1):
        r1 = station_rings[s_idx]
        r2 = station_rings[s_idx + 1]
        bm.faces.new((r1[0], r2[0], r2[10], r1[10]))
        
    bm.to_mesh(mesh)
    bm.free()
    
    c.link_to_collection(obj, "01_Bus_Body_Shell")
    obj.data.materials.append(mat_registry.body_silver if hasattr(mat_registry, "body_silver") else mat_registry.body_cyan)
    c.apply_finishing(obj, bevel=0.008)
    return obj

def build_bus_body_and_roof(mat_registry):
    """Constructs the high-floor coach monocoque body shell, roof caps, bumpers, luggage doors, and HVAC units."""
    created_objects = []
    
    bw = c.OVERALL_WIDTH
    bl = c.OVERALL_LENGTH
    
    # 1. Master Sculpted Coach Body Outer Shell (With Wheel Arches & Raked Nose)
    coach_shell = create_sculpted_coach_body(mat_registry)
    created_objects.append(coach_shell)
    
    # 2. Wheel Arch Protective Flares & Inner Wheel Tubs
    # Front Steer Arches
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        f_arch = c.create_tube(
            f"BODY_WheelArch_Flare_Front_{side}",
            location=(sign * (bw/2.0 + 0.005), c.FRONT_AXLE_Y, c.HUB_Z),
            inner_radius=0.550,
            outer_radius=0.610,
            depth=0.060,
            rotation=(0, math.radians(90), 0),
            vertices=28,
            col_name="01_Bus_Body_Shell",
            mat=mat_registry.trim_satin_black,
            bevel=0.004
        )
        created_objects.append(f_arch)
        
        # Rear Tandem Double Arch Surround (Drive + Tag)
        tandem_mid_y = (c.REAR_AXLE_Y + c.TAG_AXLE_Y) / 2.0 # -2.825m
        r_arch = c.create_box(
            f"BODY_WheelArch_Flare_RearTandem_{side}",
            location=(sign * (bw/2.0 + 0.005), tandem_mid_y, c.HUB_Z + 0.280),
            size=(0.055, abs(c.REAR_AXLE_Y - c.TAG_AXLE_Y) + 1.250, 0.120),
            col_name="01_Bus_Body_Shell",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(r_arch)
        
    # 3. Lower Flank High-Floor Luggage / Baggage Compartment Doors
    # 3 large pantograph coach luggage doors per side between front and drive axles
    door_y_centers = [2.250, 0.850, -0.550]
    door_len = 1.240
    door_h = 0.960
    door_z = c.GROUND_CLEARANCE + 0.160 + door_h / 2.0 # ~1.000m
    
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        for d_idx, d_y in enumerate(door_y_centers):
            # Recessed door panel with crisp shutlines
            luggage_door = c.create_box(
                f"BODY_Luggage_Door_{side}_{d_idx+1:02d}",
                location=(sign * (bw/2.0 + 0.015), d_y, door_z),
                size=(0.035, door_len, door_h),
                col_name="01_Bus_Body_Shell",
                mat=mat_registry.body_silver if hasattr(mat_registry, "body_silver") else mat_registry.body_cyan
            )
            created_objects.append(luggage_door)
            
            # Recessed Flush Rotary Lock & Chrome Release Handle
            handle_bezel = c.create_box(
                f"BODY_Luggage_HandleBezel_{side}_{d_idx+1:02d}",
                location=(sign * (bw/2.0 + 0.035), d_y, door_z - 0.320),
                size=(0.020, 0.140, 0.065),
                col_name="01_Bus_Body_Shell",
                mat=mat_registry.trim_satin_black
            )
            created_objects.append(handle_bezel)
            
            handle_pull = c.create_cylinder(
                f"BODY_Luggage_HandlePull_{side}_{d_idx+1:02d}",
                location=(sign * (bw/2.0 + 0.045), d_y, door_z - 0.320),
                radius=0.012,
                depth=0.090,
                rotation=(math.radians(90), 0, 0),
                vertices=12,
                col_name="01_Bus_Body_Shell",
                mat=mat_registry.mirror_chrome
            )
            created_objects.append(handle_pull)

        # Rear Machinery / Radiator Service Doors (Behind Tag Axle)
        rear_service = c.create_box(
            f"BODY_Machinery_Access_Door_{side}",
            location=(sign * (bw/2.0 + 0.015), -5.100, door_z),
            size=(0.035, 1.450, door_h),
            col_name="01_Bus_Body_Shell",
            mat=mat_registry.body_silver if hasattr(mat_registry, "body_silver") else mat_registry.body_cyan
        )
        created_objects.append(rear_service)
        
        # Radiator Air Louvers on Machinery Door
        for l_i in range(5):
            l_y = -5.100 - 0.400 + l_i * 0.200
            louver = c.create_box(
                f"BODY_Machinery_Louver_{side}_{l_i+1:02d}",
                location=(sign * (bw/2.0 + 0.032), l_y, door_z),
                size=(0.015, 0.140, 0.650),
                col_name="01_Bus_Body_Shell",
                mat=mat_registry.trim_satin_black
            )
            created_objects.append(louver)

    # 4. Chrome Window Sill Beltline Trim Molding (Full Flank Length)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        beltline_trim = c.create_box(
            f"BODY_Beltline_ChromeTrim_{side}",
            location=(sign * (bw/2.0 + 0.025), -0.300, c.BELTLINE_Z - 0.020),
            size=(0.025, bl - 1.600, 0.040),
            col_name="01_Bus_Body_Shell",
            mat=mat_registry.mirror_chrome
        )
        created_objects.append(beltline_trim)
        
        # Lower Protective Rubber Rub-Rail
        rub_strip = c.create_box(
            f"BODY_Side_RubStrip_{side}",
            location=(sign * (bw/2.0 + 0.030), -0.200, c.GROUND_CLEARANCE + 0.380),
            size=(0.030, bl - 1.200, 0.080),
            col_name="01_Bus_Body_Shell",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(rub_strip)

    # 5. Sculpted Aerodynamic Front Bumper & Volvo Lower Fascia
    f_bumper_z = c.GROUND_CLEARANCE + 0.220
    front_bumper = c.create_box(
        "BODY_Front_Bumper_Fascia",
        location=(0.0, c.FRONT_BUMPER_Y - 0.040, f_bumper_z),
        size=(bw - 0.100, 0.280, 0.440),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.body_dark_accent
    )
    created_objects.append(front_bumper)
    
    # Front Lower Cooling Intake Radiator Grille
    front_grille = c.create_box(
        "BODY_Front_Lower_Radiator_Grille",
        location=(0.0, c.FRONT_BUMPER_Y + 0.035, f_bumper_z - 0.040),
        size=(1.680, 0.060, 0.220),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.trim_satin_black
    )
    created_objects.append(front_grille)
    
    # Front Aerodynamic Splitter Chin
    front_splitter = c.create_box(
        "BODY_Front_Splitter_Chin",
        location=(0.0, c.FRONT_BUMPER_Y + 0.055, c.GROUND_CLEARANCE + 0.035),
        size=(bw - 0.120, 0.200, 0.060),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.trim_satin_black
    )
    created_objects.append(front_splitter)
    
    # Front License Plate Plinth & European Plate
    plate_plinth = c.create_box(
        "BODY_Front_License_Plate_Plinth",
        location=(0.0, c.FRONT_BUMPER_Y + 0.075, f_bumper_z - 0.040),
        size=(0.540, 0.030, 0.130),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.trim_satin_black
    )
    created_objects.append(plate_plinth)

    # 6. Volvo Signature Upper Grille & Chrome Diagonal Slash Emblem
    upper_grille = c.create_box(
        "BODY_Volvo_Upper_Grille_Insert",
        location=(0.0, c.FRONT_BUMPER_Y + 0.015, 0.940),
        size=(1.420, 0.040, 0.220),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.trim_piano_black if hasattr(mat_registry, "trim_piano_black") else mat_registry.trim_satin_black
    )
    created_objects.append(upper_grille)
    
    # Volvo Signature Diagonal Chrome Slash / Iron-Mark Sash
    diagonal_sash = c.create_cylinder(
        "BODY_Volvo_Diagonal_Chrome_Sash",
        location=(0.0, c.FRONT_BUMPER_Y + 0.035, 0.940),
        radius=0.016,
        depth=0.860,
        rotation=(0, math.radians(65), 0),
        vertices=16,
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.mirror_chrome
    )
    created_objects.append(diagonal_sash)
    
    # Volvo Center Circle Iron-Mark Badge
    volvo_badge = c.create_cylinder(
        "BODY_Volvo_Center_IronMark_Badge",
        location=(0.0, c.FRONT_BUMPER_Y + 0.045, 0.940),
        radius=0.075,
        depth=0.025,
        rotation=(math.radians(90), 0, 0),
        vertices=24,
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.mirror_chrome
    )
    created_objects.append(volvo_badge)

    # 7. Aerodynamic Front Destination Header Fairing Pod (Gloss Piano-Black Brow)
    dest_fairing = c.create_box(
        "BODY_Front_Destination_Header_Fairing",
        location=(0.0, c.FRONT_BUMPER_Y - 0.380, c.DESTINATION_SIGN_Z + 0.020),
        size=(2.150, 0.460, 0.360),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.trim_piano_black if hasattr(mat_registry, "trim_piano_black") else mat_registry.trim_satin_black
    )
    created_objects.append(dest_fairing)

    # 8. Dual Low-Profile Aerodynamic Coach HVAC Units (Carrier / Thermo King Style)
    for hvac_idx, (y_center, label) in enumerate([(1.800, "Front_Cabin"), (-2.200, "Rear_Cabin")]):
        # Aerodynamic streamlined pod housing
        hvac_pod = c.create_box(
            f"BODY_Roof_HVAC_Unit_{label}",
            location=(0.0, y_center, c.ROOF_BODY_Z + 0.120),
            size=(1.780, 2.200, 0.220),
            col_name="02_Bus_Roof_Pods_HVAC",
            mat=mat_registry.body_white
        )
        created_objects.append(hvac_pod)
        
        # Dual Electric Condenser Cooling Fan Grilles on Pod Top
        for f_idx, f_offset_y in enumerate([-0.550, 0.550]):
            fan_ring = c.create_cylinder(
                f"BODY_Roof_HVAC_Fan_{label}_{f_idx+1:02d}",
                location=(0.0, y_center + f_offset_y, c.ROOF_BODY_Z + 0.235),
                radius=0.320,
                depth=0.025,
                vertices=24,
                col_name="02_Bus_Roof_Pods_HVAC",
                mat=mat_registry.trim_satin_black
            )
            created_objects.append(fan_ring)
            
        # Lateral Cooling Intake Louvers (Left & Right)
        for side, sign in [("L", 1.0), ("R", -1.0)]:
            louver_strip = c.create_box(
                f"BODY_Roof_HVAC_Louver_{label}_{side}",
                location=(sign * 0.890, y_center, c.ROOF_BODY_Z + 0.120),
                size=(0.035, 1.850, 0.120),
                col_name="02_Bus_Roof_Pods_HVAC",
                mat=mat_registry.trim_satin_black
            )
            created_objects.append(louver_strip)

    # 9. Rear Aerodynamic Roof Spoiler with Integrated Endplates & CHMSL
    rear_spoiler = c.create_box(
        "BODY_Rear_Roof_Aerodynamic_Spoiler",
        location=(0.0, c.REAR_BUMPER_Y + 0.180, c.ROOF_BODY_Z + 0.050),
        size=(bw - 0.180, 0.360, 0.080),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.body_silver if hasattr(mat_registry, "body_silver") else mat_registry.body_cyan
    )
    created_objects.append(rear_spoiler)
    
    # Spoiler Endplates
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        endplate = c.create_box(
            f"BODY_Rear_Roof_Spoiler_Endplate_{side}",
            location=(sign * (bw/2.0 - 0.090), c.REAR_BUMPER_Y + 0.180, c.ROOF_BODY_Z + 0.090),
            size=(0.035, 0.380, 0.160),
            col_name="01_Bus_Body_Shell",
            mat=mat_registry.trim_piano_black if hasattr(mat_registry, "trim_piano_black") else mat_registry.trim_satin_black
        )
        created_objects.append(endplate)
        
    # CHMSL Stop Lamp
    chmsl_lamp = c.create_box(
        "LIGHT_Rear_CHMSL_Stop_Bar",
        location=(0.0, c.REAR_BUMPER_Y + 0.010, c.ROOF_BODY_Z + 0.050),
        size=(0.780, 0.020, 0.035),
        col_name="04_Bus_Lighting_Optics",
        mat=mat_registry.led_taillight
    )
    created_objects.append(chmsl_lamp)

    # 10. Rear Service Bumper & Massive Louvered Engine Access Door
    r_bumper_z = c.GROUND_CLEARANCE + 0.360
    rear_bumper = c.create_box(
        "BODY_Rear_Bumper_Fascia",
        location=(0.0, c.REAR_BUMPER_Y + 0.080, r_bumper_z),
        size=(bw - 0.080, 0.380, 0.580),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.body_dark_accent
    )
    created_objects.append(rear_bumper)
    
    # Engine Compartment Main Access Door
    engine_door = c.create_box(
        "BODY_Rear_Engine_Compartment_Door",
        location=(0.0, c.REAR_BUMPER_Y + 0.015, r_bumper_z + 0.850),
        size=(1.850, 0.050, 1.150),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.body_silver if hasattr(mat_registry, "body_silver") else mat_registry.body_cyan
    )
    created_objects.append(engine_door)
    
    # 8 Horizontal Cooling Ventilation Louvers on Engine Door
    for l_idx in range(8):
        l_z = (r_bumper_z + 0.850) - 0.400 + l_idx * 0.115
        louver_bar = c.create_box(
            f"BODY_Rear_Engine_Cooling_Louver_{l_idx+1:02d}",
            location=(0.0, c.REAR_BUMPER_Y - 0.012, l_z),
            size=(1.550, 0.025, 0.045),
            col_name="01_Bus_Body_Shell",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(louver_bar)
        
    # Polished Stainless Inconel Exhaust Tailpipes (Twin Outlets on Left)
    for e_idx, e_offset_x in enumerate([0.720, 0.860]):
        exhaust = c.create_cylinder(
            f"BODY_Exhaust_Tip_Inconel_{e_idx+1:02d}",
            location=(e_offset_x, c.REAR_BUMPER_Y - 0.080, c.GROUND_CLEARANCE + 0.160),
            radius=0.055,
            depth=0.220,
            rotation=(math.radians(90), 0, 0),
            vertices=24,
            col_name="01_Bus_Body_Shell",
            mat=mat_registry.mirror_chrome
        )
        created_objects.append(exhaust)
        
        # Dark recessed inner bore
        inner_bore = c.create_cylinder(
            f"BODY_Exhaust_Bore_{e_idx+1:02d}",
            location=(e_offset_x, c.REAR_BUMPER_Y - 0.082, c.GROUND_CLEARANCE + 0.160),
            radius=0.045,
            depth=0.225,
            rotation=(math.radians(90), 0, 0),
            vertices=20,
            col_name="01_Bus_Body_Shell",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(inner_bore)

    print(f"[BUS_BODY] Assembled high-fidelity Volvo 9700 coach body with {len(created_objects)} components.")
    return created_objects
