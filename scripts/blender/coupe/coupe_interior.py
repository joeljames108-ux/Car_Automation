"""
Bentley Continental GT II Coupe (2011) Interior Cockpit System (Blender 5.2 LTS)
Handcrafted Luxury 2+2 Grand Tourer Cabin with Dual-Cowl Dash, Breitling Clock, Burr Walnut Veneers, and Fluted GT Seats
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
from coupe_common import link_to_collection, create_box_primitive, create_cylinder_primitive

def build_interior(mats):
    """
    Construct high-fidelity British grand touring interior visible through transparent dielectric glass.
    """
    # -------------------------------------------------------------------------
    # 1. DUAL-COWL WINGED DASHBOARD
    # -------------------------------------------------------------------------
    # Main dashboard base structure (Beluga Black Leather)
    dash_base = create_box_primitive(
        "Dash_Main_Base_Structure",
        size=(1.440, 0.450, 0.280),
        location=(0.0, 0.520, 0.780),
        mat=mats.leather_beluga,
        collection_name="11_Coupe_Interior_Cockpit"
    )
    
    # Handcrafted Burr Walnut Veneer Fascia Band
    fascia_veneer = create_box_primitive(
        "Dash_Fascia_BurrWalnut",
        size=(1.420, 0.040, 0.160),
        location=(0.0, 0.480, 0.810),
        mat=mats.burr_walnut,
        collection_name="11_Coupe_Interior_Cockpit"
    )
    fascia_veneer.rotation_euler = (math.radians(-12), 0.0, 0.0)
    
    # Driver-side Instrument Binnacle Cowl (+X = 0.380m)
    driver_cowl = create_box_primitive(
        "Dash_Driver_Instrument_Cowl",
        size=(0.420, 0.240, 0.120),
        location=(0.380, 0.440, 0.880),
        mat=mats.leather_beluga,
        collection_name="11_Coupe_Interior_Cockpit"
    )
    
    # Analog Instrument Dial Cluster Glass
    dial_cluster = create_box_primitive(
        "Dash_Driver_Gauges_Screen",
        size=(0.360, 0.020, 0.090),
        location=(0.380, 0.420, 0.860),
        mat=mats.display_screen,
        collection_name="11_Coupe_Interior_Cockpit"
    )
    dial_cluster.rotation_euler = (math.radians(-15), 0.0, 0.0)
    
    # Passenger-side Matching Cowl (-X = -0.380m)
    pass_cowl = create_box_primitive(
        "Dash_Passenger_Cowl",
        size=(0.420, 0.240, 0.120),
        location=(-0.380, 0.440, 0.880),
        mat=mats.leather_beluga,
        collection_name="11_Coupe_Interior_Cockpit"
    )

    # -------------------------------------------------------------------------
    # 2. CENTER STACK, INFOTAINMENT & BREITLING CLOCK
    # -------------------------------------------------------------------------
    # Iconic Breitling Analog Clock in Chrome Bezel
    clock_bezel = create_cylinder_primitive(
        "Interior_Breitling_Clock_Bezel",
        radius=0.032,
        depth=0.015,
        segments=24,
        location=(0.0, 0.460, 0.860),
        rotation=(math.radians(72), 0.0, 0.0),
        mat=mats.knurled_chrome,
        collection_name="11_Coupe_Interior_Cockpit"
    )
    
    clock_face = create_cylinder_primitive(
        "Interior_Breitling_Clock_Face",
        radius=0.026,
        depth=0.010,
        segments=24,
        location=(0.0, 0.455, 0.860),
        rotation=(math.radians(72), 0.0, 0.0),
        mat=mats.breitling_clock,
        collection_name="11_Coupe_Interior_Cockpit"
    )
    
    # Infotainment Screen Display
    center_screen = create_box_primitive(
        "Interior_Infotainment_Display",
        size=(0.240, 0.020, 0.140),
        location=(0.0, 0.440, 0.730),
        mat=mats.display_screen,
        collection_name="11_Coupe_Interior_Cockpit"
    )
    center_screen.rotation_euler = (math.radians(-18), 0.0, 0.0)
    
    # Knurled Bullseye Air Vents (Chrome)
    for vent_x in [-0.120, 0.120]:
        create_cylinder_primitive(
            f"Interior_Bullseye_Vent_{vent_x}",
            radius=0.028,
            depth=0.020,
            segments=20,
            location=(vent_x, 0.450, 0.840),
            rotation=(math.radians(75), 0.0, 0.0),
            mat=mats.knurled_chrome,
            collection_name="11_Coupe_Interior_Cockpit"
        )

    # -------------------------------------------------------------------------
    # 3. FULL-LENGTH LEATHER CENTER CONSOLE & GEAR SELECTOR
    # -------------------------------------------------------------------------
    tunnel = create_box_primitive(
        "Center_Console_Tunnel",
        size=(0.320, 1.700, 0.220),
        location=(0.0, -0.250, 0.480),
        mat=mats.leather_saddle,
        collection_name="11_Coupe_Interior_Cockpit"
    )
    
    tunnel_top = create_box_primitive(
        "Center_Console_Veneer_Top",
        size=(0.260, 0.900, 0.020),
        location=(0.0, 0.100, 0.595),
        mat=mats.burr_walnut,
        collection_name="11_Coupe_Interior_Cockpit"
    )
    
    # Knurled Chrome GT Gear Selector
    gear_lever = create_cylinder_primitive(
        "Gear_Selector_Lever",
        radius=0.022,
        depth=0.080,
        segments=20,
        location=(0.0, 0.220, 0.630),
        rotation=(0.0, 0.0, 0.0),
        mat=mats.knurled_chrome,
        collection_name="11_Coupe_Interior_Cockpit"
    )

    # -------------------------------------------------------------------------
    # 4. 3-SPOKE GT STEERING WHEEL & PADDLES
    # -------------------------------------------------------------------------
    wheel_center = Vector((0.380, 0.310, 0.790))
    
    # Outer Thick Leather Rim
    # Create torus-like rim using bmesh cylinder with bevel or simple ring
    rim = create_cylinder_primitive(
        "Steering_Wheel_Rim",
        radius=0.185,
        depth=0.030,
        segments=32,
        location=wheel_center,
        rotation=(math.radians(68), 0.0, 0.0),
        mat=mats.leather_beluga,
        collection_name="11_Coupe_Interior_Cockpit"
    )
    rim.scale = (1.0, 1.0, 0.35)
    
    # Center Boss with Bentley Winged Emblem
    boss = create_cylinder_primitive(
        "Steering_Wheel_Boss",
        radius=0.055,
        depth=0.025,
        segments=24,
        location=wheel_center + Vector((0, -0.015, -0.005)),
        rotation=(math.radians(68), 0.0, 0.0),
        mat=mats.matrix_chrome,
        collection_name="11_Coupe_Interior_Cockpit"
    )
    
    # 3 Knurled Chrome Spokes
    spokes = create_box_primitive(
        "Steering_Wheel_Spokes",
        size=(0.320, 0.015, 0.040),
        location=wheel_center + Vector((0, -0.010, -0.005)),
        mat=mats.knurled_chrome,
        collection_name="11_Coupe_Interior_Cockpit"
    )
    spokes.rotation_euler = (math.radians(22), 0.0, 0.0)

    # -------------------------------------------------------------------------
    # 5. FRONT FLUTED GT BUCKET SEATS (DRIVER & PASSENGER)
    # -------------------------------------------------------------------------
    for side, sign in [("Driver", 1.0), ("Pass", -1.0)]:
        seat_x = sign * 0.380
        seat_y = -0.080
        
        # Lower Cushion Base
        cushion = create_box_primitive(
            f"Seat_Front_Cushion_{side}",
            size=(0.540, 0.580, 0.160),
            location=(seat_x, seat_y, 0.380),
            mat=mats.leather_saddle,
            collection_name="11_Coupe_Interior_Cockpit"
        )
        
        # Sculpted Fluted Backrest (Raked backward)
        backrest = create_box_primitive(
            f"Seat_Front_Backrest_{side}",
            size=(0.520, 0.180, 0.620),
            location=(seat_x, seat_y - 0.220, 0.720),
            mat=mats.leather_saddle,
            collection_name="11_Coupe_Interior_Cockpit"
        )
        backrest.rotation_euler = (math.radians(-16), 0.0, 0.0)
        
        # Integrated Headrest
        headrest = create_box_primitive(
            f"Seat_Front_Headrest_{side}",
            size=(0.240, 0.140, 0.200),
            location=(seat_x, seat_y - 0.320, 1.080),
            mat=mats.leather_saddle,
            collection_name="11_Coupe_Interior_Cockpit"
        )
        headrest.rotation_euler = (math.radians(-16), 0.0, 0.0)
        
        # Seat Shell Backing (Beluga Black)
        seat_shell = create_box_primitive(
            f"Seat_Front_Shell_{side}",
            size=(0.540, 0.040, 0.640),
            location=(seat_x, seat_y - 0.280, 0.710),
            mat=mats.leather_beluga,
            collection_name="11_Coupe_Interior_Cockpit"
        )
        seat_shell.rotation_euler = (math.radians(-16), 0.0, 0.0)

    # -------------------------------------------------------------------------
    # 6. REAR 2+2 SCULPTED INDIVIDUAL SEATS
    # -------------------------------------------------------------------------
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        rear_x = sign * 0.350
        rear_y = -0.960
        
        # Rear Seat Cushion
        r_cushion = create_box_primitive(
            f"Seat_Rear_Cushion_{side}",
            size=(0.480, 0.520, 0.140),
            location=(rear_x, rear_y, 0.420),
            mat=mats.leather_saddle,
            collection_name="11_Coupe_Interior_Cockpit"
        )
        
        # Rear Seat Backrest
        r_backrest = create_box_primitive(
            f"Seat_Rear_Backrest_{side}",
            size=(0.480, 0.160, 0.540),
            location=(rear_x, rear_y - 0.180, 0.720),
            mat=mats.leather_saddle,
            collection_name="11_Coupe_Interior_Cockpit"
        )
        r_backrest.rotation_euler = (math.radians(-20), 0.0, 0.0)

    # -------------------------------------------------------------------------
    # 7. DOOR CARDS & INTERIOR FLANKS
    # -------------------------------------------------------------------------
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        door_panel = create_box_primitive(
            f"Door_Card_Inner_{side}",
            size=(0.060, 1.400, 0.480),
            location=(sign * 0.770, -0.050, 0.640),
            mat=mats.leather_saddle,
            collection_name="11_Coupe_Interior_Cockpit"
        )
        
        # Chrome release lever
        lever = create_box_primitive(
            f"Door_Inner_Release_Lever_{side}",
            size=(0.015, 0.080, 0.025),
            location=(sign * 0.735, 0.200, 0.740),
            mat=mats.knurled_chrome,
            collection_name="11_Coupe_Interior_Cockpit"
        )

    print("[COUPE_INTERIOR] Handcrafted luxury 2+2 GT cockpit fully assembled.")
