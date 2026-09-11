"""
Hilux Powertrain Assembly (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Constructs the 2.8L 1GD-FTV turbo-diesel engine, common-rail injection, VGT turbocharger,
intercooler, radiator & fan, battery & ancillaries, 6-speed transmission, transfer case,
2-piece driveshaft, and full stainless steel exhaust system with DPF & polished tip.
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
from hilux_common import (
    create_bmesh_object,
    assign_material,
    apply_bevel_and_weighted_normals,
    create_box,
    bmesh_create_cube,
    bmesh_create_cylinder,
    bmesh_create_sphere,
    bmesh_create_torus,
    mat_trans,
    mat_rot_x,
    mat_rot_y,
    mat_rot_z,
    mat_scale,
    FRONT_AXLE_Y,
    REAR_AXLE_Y,
    HUB_Z
)

def build_powertrain(materials):
    mat_engine = materials.get("Mat_EngineBlock_CastAlum")
    mat_head = materials.get("Mat_EngineHead_Cover")
    mat_turbo = materials.get("Mat_Turbocharger_Inconel")
    mat_exhaust = materials.get("Mat_Exhaust_Stainless")
    mat_tip = materials.get("Mat_Exhaust_PolishedTip")
    mat_radiator = materials.get("Mat_Radiator_Alum")
    mat_steel = materials.get("Mat_Driveshaft_Steel")
    mat_trim = materials.get("Mat_DarkComposite_Trim")
    mat_satin = materials.get("Mat_SatinBlack_Trim")
    mat_zinc = materials.get("Mat_Hardware_ZincBolt")
    
    col_name = "10_Powertrain_Interior"
    objects = []
    
    # Engine Bay Center: Y = +1.60m, Z = 0.65m, X = 0.0m
    
    # -------------------------------------------------------------
    # 1. 2.8L 1GD-FTV Inline-4 Turbo Diesel Engine Block & Head
    # -------------------------------------------------------------
    bm_eng = bmesh.new()
    
    # Cast Aluminum Engine Block (Length ~0.55m, Width ~0.38m, Height ~0.35m)
    bmesh_create_cube(
        bm_eng,
        size=0.10,
        matrix=mat_trans(0.0, 1.62, 0.62) @ mat_scale(3.8, 5.5, 3.5)
    )
    
    # Stamped Lower Oil Pan Sump
    bmesh_create_cube(
        bm_eng,
        size=0.08,
        matrix=mat_trans(0.0, 1.58, 0.42) @ mat_scale(3.2, 4.8, 1.4)
    )
    
    # Front Timing Cover & Accessory Belt Pulleys
    # Crankshaft Harmonic Damper Pulley
    bmesh_create_cylinder(
        bm_eng,
        radius=0.085,
        depth=0.045,
        segments=16,
        matrix=mat_trans(0.0, 1.92, 0.52) @ mat_rot_x(90)
    )
    # Alternator Pulley (Driver side)
    bmesh_create_cylinder(
        bm_eng,
        radius=0.048,
        depth=0.065,
        segments=14,
        matrix=mat_trans(0.18, 1.90, 0.68) @ mat_rot_x(90)
    )
    # A/C Compressor Pulley (Passenger side)
    bmesh_create_cylinder(
        bm_eng,
        radius=0.058,
        depth=0.065,
        segments=14,
        matrix=mat_trans(-0.18, 1.90, 0.48) @ mat_rot_x(90)
    )
    # Serpentine Drive Belt Loop
    bmesh_create_cube(
        bm_eng,
        size=0.012,
        matrix=mat_trans(0.0, 1.93, 0.58) @ mat_scale(34.0, 0.8, 24.0)
    )
    
    obj_eng = create_bmesh_object("POWERTRAIN_EngineBlock", col_name, bm_eng)
    assign_material(obj_eng, mat_engine)
    apply_bevel_and_weighted_normals(obj_eng, width=0.003, segments=2)
    objects.append(obj_eng)

    # Polymer Composite Valve Cover & D-4D Intake Manifold
    bm_cover = bmesh.new()
    bmesh_create_cube(
        bm_cover,
        size=0.08,
        matrix=mat_trans(0.0, 1.62, 0.84) @ mat_scale(3.4, 5.4, 1.2)
    )
    # 4 Fuel Injectors & Common Rail Tube
    bmesh_create_cylinder(
        bm_cover,
        radius=0.014,
        depth=0.46,
        segments=12,
        matrix=mat_trans(-0.12, 1.62, 0.86) @ mat_rot_x(90)
    )
    for inj_y in [1.44, 1.56, 1.68, 1.80]:
        bmesh_create_cylinder(
            bm_cover,
            radius=0.010,
            depth=0.08,
            segments=8,
            matrix=mat_trans(-0.04, inj_y, 0.89)
        )
    # Oil Filler Cap (Yellow/Black)
    bmesh_create_cylinder(
        bm_cover,
        radius=0.028,
        depth=0.022,
        segments=12,
        matrix=mat_trans(0.10, 1.80, 0.91)
    )
    obj_cover = create_bmesh_object("POWERTRAIN_ValveCover_D4D", col_name, bm_cover)
    assign_material(obj_cover, mat_head)
    apply_bevel_and_weighted_normals(obj_cover, width=0.002, segments=2)
    objects.append(obj_cover)

    # -------------------------------------------------------------
    # 2. Variable Geometry Turbocharger (VGT) & Intercooler Piping
    # Mounted to exhaust side (driver/left side) at Y = +1.60m, Z = 0.62m
    # -------------------------------------------------------------
    bm_turbo = bmesh.new()
    # Inconel Turbine Housing (Volute snail)
    bmesh_create_torus(
        bm_turbo,
        major_radius=0.075,
        minor_radius=0.032,
        major_segments=16,
        minor_segments=8,
        matrix=mat_trans(0.24, 1.60, 0.62) @ mat_rot_y(90)
    )
    # Aluminum Compressor Housing
    bmesh_create_cylinder(
        bm_turbo,
        radius=0.068,
        depth=0.08,
        segments=16,
        matrix=mat_trans(0.28, 1.68, 0.62) @ mat_rot_y(90)
    )
    # Wastegate Electronic Actuator Canister
    bmesh_create_cylinder(
        bm_turbo,
        radius=0.028,
        depth=0.07,
        segments=10,
        matrix=mat_trans(0.26, 1.54, 0.72)
    )
    obj_turbo = create_bmesh_object("POWERTRAIN_Turbocharger_VGT", col_name, bm_turbo)
    assign_material(obj_turbo, mat_turbo)
    objects.append(obj_turbo)

    # -------------------------------------------------------------
    # 3. Heavy-Duty Radiator, Intercooler & Viscous Cooling Fan
    # -------------------------------------------------------------
    bm_cooling = bmesh.new()
    # Front-Mounted Air-to-Air Intercooler Core (behind lower grille at Y = +2.22m)
    bmesh_create_cube(
        bm_cooling,
        size=0.04,
        matrix=mat_trans(0.0, 2.22, 0.55) @ mat_scale(15.0, 1.5, 6.0)
    )
    # Main Engine Cooling Aluminum Radiator Core (Y = +2.12m)
    bmesh_create_cube(
        bm_cooling,
        size=0.05,
        matrix=mat_trans(0.0, 2.12, 0.72) @ mat_scale(15.5, 1.2, 9.5)
    )
    # Upper & Lower Radiator Coolant Hoses
    bmesh_create_cylinder(
        bm_cooling,
        radius=0.025,
        depth=0.28,
        segments=12,
        matrix=mat_trans(-0.20, 1.95, 0.88) @ mat_rot_x(45)
    )
    bmesh_create_cylinder(
        bm_cooling,
        radius=0.025,
        depth=0.28,
        segments=12,
        matrix=mat_trans(0.20, 1.95, 0.48) @ mat_rot_x(-45)
    )
    # Viscous Fan Shroud & Multi-Blade Fan
    bmesh_create_cylinder(
        bm_cooling,
        radius=0.22,
        depth=0.06,
        segments=20,
        matrix=mat_trans(0.0, 2.04, 0.65) @ mat_rot_x(90)
    )
    obj_cooling = create_bmesh_object("POWERTRAIN_Radiator_Cooling", col_name, bm_cooling)
    assign_material(obj_cooling, mat_radiator)
    apply_bevel_and_weighted_normals(obj_cooling, width=0.003, segments=2)
    objects.append(obj_cooling)

    # -------------------------------------------------------------
    # 4. Engine Bay Ancillaries (Battery, Air Filter Box, Brake Booster, Reservoirs)
    # -------------------------------------------------------------
    bm_aux = bmesh.new()
    # Heavy-Duty 12V Battery with Terminal Clamps (Driver side front corner)
    bmesh_create_cube(
        bm_aux,
        size=0.05,
        matrix=mat_trans(0.52, 1.95, 0.88) @ mat_scale(3.8, 5.4, 4.4)
    )
    # Air Cleaner Box with Intake Snorkel (Passenger side)
    bmesh_create_cube(
        bm_aux,
        size=0.06,
        matrix=mat_trans(-0.52, 1.82, 0.88) @ mat_scale(4.2, 5.0, 4.0)
    )
    # Vacuum Brake Booster & Master Cylinder with Translucent Reservoir
    bmesh_create_cylinder(
        bm_aux,
        radius=0.11,
        depth=0.08,
        segments=16,
        matrix=mat_trans(0.48, 1.05, 0.96) @ mat_rot_x(90)
    )
    # Windshield Washer Fluid Reservoir (Blue cap)
    bmesh_create_cube(
        bm_aux,
        size=0.04,
        matrix=mat_trans(-0.54, 2.10, 0.78) @ mat_scale(3.2, 3.8, 5.5)
    )
    obj_aux = create_bmesh_object("POWERTRAIN_EngineAncillaries", col_name, bm_aux)
    assign_material(obj_aux, mat_trim)
    objects.append(obj_aux)

    # -------------------------------------------------------------
    # 5. 6-Speed Automatic Transmission (AC60F) & Transfer Case
    # Runs rearward from engine: Y = +1.35m back to Y = +0.55m
    # -------------------------------------------------------------
    bm_trans = bmesh.new()
    # Bellhousing (Bell-shaped flange bolted to back of block)
    bmesh_create_cylinder(
        bm_trans,
        radius=0.21,
        depth=0.18,
        segments=20,
        matrix=mat_trans(0.0, 1.28, 0.58) @ mat_rot_x(90)
    )
    # Transmission Main Case
    bmesh_create_cube(
        bm_trans,
        size=0.08,
        matrix=mat_trans(0.0, 0.95, 0.54) @ mat_scale(3.4, 6.2, 3.2)
    )
    # Transmission Oil Sump Pan
    bmesh_create_cube(
        bm_trans,
        size=0.05,
        matrix=mat_trans(0.0, 0.95, 0.38) @ mat_scale(4.8, 7.8, 1.0)
    )
    # 2-Speed Part-Time 4WD Transfer Case
    bmesh_create_cube(
        bm_trans,
        size=0.08,
        matrix=mat_trans(-0.08, 0.52, 0.52) @ mat_scale(3.5, 3.2, 3.2)
    )
    obj_trans = create_bmesh_object("POWERTRAIN_Transmission_4WD", col_name, bm_trans)
    assign_material(obj_trans, mat_engine)
    apply_bevel_and_weighted_normals(obj_trans, width=0.003, segments=2)
    objects.append(obj_trans)

    # -------------------------------------------------------------
    # 6. Front & Rear Steel Propeller Driveshafts
    # -------------------------------------------------------------
    bm_shafts = bmesh.new()
    # Front Driveshaft (transfer case forward to front diff)
    bmesh_create_cylinder(
        bm_shafts,
        radius=0.032,
        depth=0.88,
        segments=14,
        matrix=mat_trans(-0.12, 1.02, 0.44) @ mat_rot_x(82)
    )
    # Rear 2-Piece Driveshaft with Center Carrier Bearing
    # Front section (transfer case to center bearing at Y = 0.00m)
    bmesh_create_cylinder(
        bm_shafts,
        radius=0.040,
        depth=0.52,
        segments=14,
        matrix=mat_trans(0.0, 0.26, 0.48) @ mat_rot_x(90)
    )
    # Center Support Bearing Bracket
    bmesh_create_cylinder(
        bm_shafts,
        radius=0.065,
        depth=0.06,
        segments=14,
        matrix=mat_trans(0.0, 0.00, 0.48) @ mat_rot_x(90)
    )
    # Rear section (center bearing to rear axle differential pumpkin at Y = -1.54m)
    bmesh_create_cylinder(
        bm_shafts,
        radius=0.042,
        depth=1.54,
        segments=16,
        matrix=mat_trans(0.0, -0.77, 0.44) @ mat_rot_x(93)
    )
    # Universal Joint Yokes (Flanges at each end)
    for uy in [0.52, 0.00, -1.50]:
        bmesh_create_cylinder(
            bm_shafts,
            radius=0.055,
            depth=0.045,
            segments=12,
            matrix=mat_trans(0.0, uy, 0.44) @ mat_rot_x(90)
        )
    obj_shafts = create_bmesh_object("POWERTRAIN_Driveshafts_4WD", col_name, bm_shafts)
    assign_material(obj_shafts, mat_steel)
    objects.append(obj_shafts)

    # -------------------------------------------------------------
    # 7. Complete Stainless Steel Exhaust System with DPF & Polished Tip
    # -------------------------------------------------------------
    bm_exh = bmesh.new()
    
    # Downpipe from turbocharger (Y = +1.55m down to underbody Y = +0.90m)
    bmesh_create_cylinder(
        bm_exh,
        radius=0.038,
        depth=0.72,
        segments=14,
        matrix=mat_trans(0.24, 1.25, 0.52) @ mat_rot_x(55)
    )
    # Diesel Particulate Filter (DPF) & Catalyst Canister (under front cab floor)
    bmesh_create_cylinder(
        bm_exh,
        radius=0.095,
        depth=0.55,
        segments=16,
        matrix=mat_trans(0.26, 0.45, 0.40) @ mat_rot_x(90)
    )
    # Intermediate Exhaust Pipe running back along right side of driveshaft
    bmesh_create_cylinder(
        bm_exh,
        radius=0.038,
        depth=1.10,
        segments=14,
        matrix=mat_trans(0.26, -0.40, 0.40) @ mat_rot_x(90)
    )
    # Large Oval Stainless Steel Muffler (under bed front)
    bmesh_create_cube(
        bm_exh,
        size=0.08,
        matrix=mat_trans(0.28, -1.15, 0.44) @ mat_scale(2.8, 7.5, 1.8)
    )
    # Over-Axle Kick-Up Pipe (arching up over rear axle at Y = -1.54m)
    bmesh_create_cylinder(
        bm_exh,
        radius=0.036,
        depth=0.65,
        segments=12,
        matrix=mat_trans(0.32, -1.65, 0.52) @ mat_rot_x(95)
    )
    # Tailpipe running to passenger rear side
    bmesh_create_cylinder(
        bm_exh,
        radius=0.036,
        depth=0.55,
        segments=12,
        matrix=mat_trans(0.42, -2.15, 0.42) @ mat_rot_z(25) @ mat_rot_x(90)
    )
    obj_exh = create_bmesh_object("POWERTRAIN_Exhaust_System", col_name, bm_exh)
    assign_material(obj_exh, mat_exhaust)
    apply_bevel_and_weighted_normals(obj_exh, width=0.003, segments=2)
    objects.append(obj_exh)

    # Polished Stainless Steel Exhaust Tip (Turned-down side exit behind right rear wheel)
    bm_tip = bmesh.new()
    bmesh_create_cylinder(
        bm_tip,
        radius=0.045,
        depth=0.18,
        segments=16,
        matrix=mat_trans(0.68, -2.32, 0.38) @ mat_rot_z(35) @ mat_rot_x(105)
    )
    obj_tip = create_bmesh_object("POWERTRAIN_Exhaust_PolishedTip", col_name, bm_tip)
    assign_material(obj_tip, mat_tip)
    objects.append(obj_tip)

    print(f"[HILUX] Powertrain & Exhaust generated with {len(objects)} objects.")
    return objects
