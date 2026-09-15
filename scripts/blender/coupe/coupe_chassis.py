"""
Bentley Continental GT II Coupe (2011) Chassis & Powertrain Platform Builder (Blender 5.2 LTS)
High-Torsional Rigidity Hybrid Steel/Aluminum Monocoque Platform + 6.0L Twin-Turbo W12 AWD
"""

import bpy
import bmesh
import math
from mathutils import Vector
import coupe_common as c

def build_coupe_chassis_and_powertrain(mat_registry):
    """Constructs the Continental GT platform frame, crash structures, W12 engine, AWD gearbox, and exhaust."""
    created_objects = []
    
    # -------------------------------------------------------------------------
    # 1. LONGITUDINAL BOX RAILS & CENTRAL TUNNEL BACKBONE
    # -------------------------------------------------------------------------
    rail_spacing = 0.580 # Half spacing = 0.290m from center
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # Main longitudinal hydroformed rail
        rail = c.create_box(
            f"CHASSIS_Main_Rail_{side}",
            location=(sign * rail_spacing, -0.050, c.FLOOR_PAN_Z + 0.050),
            size=(0.090, c.WHEELBASE + 0.850, 0.090),
            col_name="01_Coupe_Chassis_Platform",
            mat=mat_registry.chassis_steel
        )
        created_objects.append(rail)
        
    # Central Torque Tube / Transmission Tunnel Structure
    tunnel = c.create_box(
        "CHASSIS_Central_Transmission_Tunnel",
        location=(0.0, -0.150, c.FLOOR_PAN_Z + 0.140),
        size=(0.340, 2.450, 0.180),
        col_name="01_Coupe_Chassis_Platform",
        mat=mat_registry.chassis_steel
    )
    created_objects.append(tunnel)
    
    # Floor Pan Stiffening Bulkheads & Floor Plate
    floor_pan = c.create_box(
        "CHASSIS_Underbody_Floor_Pan",
        location=(0.0, -0.050, c.FLOOR_PAN_Z),
        size=(1.560, 2.380, 0.025),
        col_name="01_Coupe_Chassis_Platform",
        mat=mat_registry.chassis_steel
    )
    created_objects.append(floor_pan)

    # -------------------------------------------------------------------------
    # 2. FRONT HIGH-STRENGTH ENGINE CRADLE & CRASH MITIGATION BOXES
    # -------------------------------------------------------------------------
    f_subframe = c.create_box(
        "CHASSIS_Front_Subframe_Cradle",
        location=(0.0, c.FRONT_AXLE_Y, c.GROUND_CLEARANCE + 0.070),
        size=(1.080, 0.720, 0.110),
        col_name="01_Coupe_Chassis_Platform",
        mat=mat_registry.chassis_steel
    )
    created_objects.append(f_subframe)
    
    # Front Bumper Impact Reinforcement Bar (Behind Front Fascia)
    f_bumper_beam = c.create_box(
        "CHASSIS_Front_Impact_Beam",
        location=(0.0, c.FRONT_BUMPER_Y - 0.120, c.GROUND_CLEARANCE + 0.240),
        size=(1.620, 0.140, 0.120),
        col_name="01_Coupe_Chassis_Platform",
        mat=mat_registry.matrix_chrome
    )
    created_objects.append(f_bumper_beam)
    
    # Front Crash Absorption Energy Tubes (Left & Right)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        crash_box = c.create_box(
            f"CHASSIS_Front_CrashBox_{side}",
            location=(sign * 0.520, c.FRONT_AXLE_Y + 0.520, c.GROUND_CLEARANCE + 0.240),
            size=(0.110, 0.440, 0.110),
            col_name="01_Coupe_Chassis_Platform",
            mat=mat_registry.chassis_steel
        )
        created_objects.append(crash_box)

    # -------------------------------------------------------------------------
    # 3. REAR MULTI-LINK SUBFRAME & REAR IMPACT ATTENUATOR
    # -------------------------------------------------------------------------
    r_subframe = c.create_box(
        "CHASSIS_Rear_Subframe_Cradle",
        location=(0.0, c.REAR_AXLE_Y, c.GROUND_CLEARANCE + 0.080),
        size=(1.040, 0.780, 0.120),
        col_name="01_Coupe_Chassis_Platform",
        mat=mat_registry.chassis_steel
    )
    created_objects.append(r_subframe)
    
    # Rear Bumper Impact Crossbeam
    r_bumper_beam = c.create_box(
        "CHASSIS_Rear_Impact_Beam",
        location=(0.0, c.REAR_BUMPER_Y + 0.120, c.GROUND_CLEARANCE + 0.260),
        size=(1.580, 0.120, 0.110),
        col_name="01_Coupe_Chassis_Platform",
        mat=mat_registry.chassis_steel
    )
    created_objects.append(r_bumper_beam)

    # -------------------------------------------------------------------------
    # 4. 6.0L TWIN-TURBO W12 POWERTRAIN & 8-SPEED AWD TRANSMISSION
    # -------------------------------------------------------------------------
    # W12 Engine Block (Longitudinally mounted ahead of firewall, over front axle)
    w12_block = c.create_box(
        "POWERTRAIN_W12_Engine_Block",
        location=(0.0, c.FRONT_AXLE_Y - 0.050, c.GROUND_CLEARANCE + 0.320),
        size=(0.580, 0.640, 0.460),
        col_name="02_Coupe_Powertrain_Drivetrain",
        mat=mat_registry.engine_block_w12
    )
    created_objects.append(w12_block)
    
    # Dual Symmetrical Chrome Intake Manifold Plenums (Bentley Winged Branding)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        manifold = c.create_box(
            f"POWERTRAIN_W12_Intake_Plenum_{side}",
            location=(sign * 0.180, c.FRONT_AXLE_Y - 0.040, c.GROUND_CLEARANCE + 0.540),
            size=(0.220, 0.520, 0.090),
            col_name="02_Coupe_Powertrain_Drivetrain",
            mat=mat_registry.intake_manifold
        )
        created_objects.append(manifold)
        
        # Parallel Twin Turbocharger Units (Flank Mounted)
        turbo = c.create_cylinder(
            f"POWERTRAIN_Turbocharger_{side}",
            location=(sign * 0.360, c.FRONT_AXLE_Y - 0.150, c.GROUND_CLEARANCE + 0.280),
            radius=0.085,
            depth=0.160,
            rotation=(0, math.radians(90), 0),
            vertices=20,
            col_name="02_Coupe_Powertrain_Drivetrain",
            mat=mat_registry.matrix_chrome
        )
        created_objects.append(turbo)
        
    # 8-Speed Dual-Clutch Transmission Casing
    gearbox = c.create_box(
        "POWERTRAIN_8Speed_DualClutch_Gearbox",
        location=(0.0, c.FRONT_AXLE_Y - 0.680, c.GROUND_CLEARANCE + 0.260),
        size=(0.320, 0.720, 0.280),
        col_name="02_Coupe_Powertrain_Drivetrain",
        mat=mat_registry.engine_block_w12
    )
    created_objects.append(gearbox)
    
    # Central AWD Torsen Differential & Longitudinal Propshaft
    propshaft = c.create_cylinder(
        "POWERTRAIN_AWD_Longitudinal_Propshaft",
        location=(0.0, (c.FRONT_AXLE_Y - 1.000 + c.REAR_AXLE_Y) / 2.0, c.GROUND_CLEARANCE + 0.200),
        radius=0.042,
        depth=abs(c.REAR_AXLE_Y - (c.FRONT_AXLE_Y - 1.000)),
        rotation=(math.radians(90), 0, 0),
        vertices=16,
        col_name="02_Coupe_Powertrain_Drivetrain",
        mat=mat_registry.matrix_chrome
    )
    created_objects.append(propshaft)
    
    # Rear Limited-Slip Differential
    rear_diff = c.create_box(
        "POWERTRAIN_Rear_LimitedSlip_Differential",
        location=(0.0, c.REAR_AXLE_Y, c.GROUND_CLEARANCE + 0.200),
        size=(0.280, 0.320, 0.240),
        col_name="02_Coupe_Powertrain_Drivetrain",
        mat=mat_registry.engine_block_w12
    )
    created_objects.append(rear_diff)

    # -------------------------------------------------------------------------
    # 5. DUAL SPORT EXHAUST SYSTEM (Downpipes, Mid-Muffler & Rear Silencers)
    # -------------------------------------------------------------------------
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # Full-length stainless exhaust pipe
        pipe = c.create_cylinder(
            f"POWERTRAIN_Sport_Exhaust_Pipe_{side}",
            location=(sign * 0.280, (c.FRONT_AXLE_Y + c.REAR_AXLE_Y)/2.0 - 0.200, c.GROUND_CLEARANCE + 0.120),
            radius=0.038,
            depth=2.850,
            rotation=(math.radians(90), 0, 0),
            vertices=16,
            col_name="02_Coupe_Powertrain_Drivetrain",
            mat=mat_registry.inconel_exhaust
        )
        created_objects.append(pipe)
        
        # Rear Acoustic Silencer Muffler Box
        muffler = c.create_box(
            f"POWERTRAIN_Rear_Silencer_Muffler_{side}",
            location=(sign * 0.450, c.REAR_BUMPER_Y + 0.450, c.GROUND_CLEARANCE + 0.180),
            size=(0.320, 0.480, 0.160),
            col_name="02_Coupe_Powertrain_Drivetrain",
            mat=mat_registry.inconel_exhaust
        )
        created_objects.append(muffler)

    print(f"[COUPE_CHASSIS] Assembled Continental GT chassis & W12 powertrain with {len(created_objects)} components.")
    return created_objects
