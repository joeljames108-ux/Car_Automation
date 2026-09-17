"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part H
Subsystem 37:
- Subsystem 37: Master Phase 21 Assembly Orchestrator, Zero-Offset Validation & GLB Export
"""

PART_BENTLEY_H = '''
# ----------------------------------------------------------------------------
# 37. SUBSYSTEM 37: MASTER ASSEMBLY ORCHESTRATION & DUAL-MODE GLB EXPORT
# ----------------------------------------------------------------------------

def setup_bentley_studio_lighting():
    """Configures high-end automotive studio lighting array for rich reflections."""
    lights_data = [
        ("Key_Front_Left", (3.2, 4.0, 3.8), 2200, 2.5),
        ("Key_Front_Right", (-3.2, 4.0, 3.8), 2200, 2.5),
        ("Rim_Rear_High", (0.0, -5.2, 4.2), 3000, 3.0),
        ("Fill_Left_Haunch", (4.2, -1.2, 2.2), 1500, 2.0),
        ("Fill_Right_Haunch", (-4.2, -1.2, 2.2), 1500, 2.0),
        ("Underbody_Bounce", (0.0, 0.0, -0.4), 600, 4.0),
    ]
    light_col = bpy.data.collections.new("Studio_Lighting")
    bpy.context.scene.collection.children.link(light_col)

    for l_name, l_pos, l_pwr, l_rad in lights_data:
        light = bpy.data.lights.new(name=l_name, type='AREA')
        light.energy = l_pwr
        light.size = l_rad
        light.color = (0.97, 0.98, 1.0)
        l_obj = bpy.data.objects.new(l_name, light)
        l_obj.location = l_pos
        # Point toward vehicle center
        dir_vec = Vector((0, 0, 0.6)) - Vector(l_pos)
        l_obj.rotation_euler = dir_vec.to_track_quat('-Z', 'Y').to_euler()
        light_col.objects.link(l_obj)


def generate_bentley_continental_gt_speed_phase1():
    """Master generation orchestrator for Bentley Continental GT Speed Convertible Phase 21."""
    print("=" * 80)
    print("CREWE AUTOMOTIVE CAD: GENERATING BENTLEY CONTINENTAL GT SPEED (PHASE 21)")
    print("Convertible Architecture · 2020s Era · Type 3S Masterpiece")
    print("=" * 80)

    # 1. Clean existing scene objects
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0

    # 2. Master Collection
    col_name = "Bentley_Continental_GT_Speed_Phase1"
    car_col = bpy.data.collections.new(col_name)
    scene.collection.children.link(car_col)

    # 3. PBR Materials Suite
    mats = create_bentley_pbr_materials()

    # 4. Execute all 35 Precision CAD Subsystems
    all_objs = []
    print("[1/35] Building 44-Station Monocoque Superformed Body Shell...")
    all_objs.extend(build_bentley_monocoque_body_shell(car_col, mats))

    print("[2/35] Sculpting Continental Long Bonnet with Flying 'B' Center Spine...")
    all_objs.extend(build_bentley_bonnet_and_power_creases(car_col, mats))

    print("[3/35] Building Matrix Radiator Grille & Front Bumper Valance...")
    all_objs.extend(build_bentley_matrix_grille_and_bumper(car_col, mats))

    print("[4/35] Crafting 4-Layer Z-Fold Soft-Top Tonneau & Acoustic Windshield...")
    all_objs.extend(build_bentley_soft_top_tonneau_and_windshield(car_col, mats))

    print("[5/35] Constructing Enclosed Front & Rear Wheelhouse Tubs & Belly Pan...")
    all_objs.extend(build_bentley_wheelhouse_tubs_and_belly_pan(car_col, mats))

    print("[6/35] Forging 22-Inch 'Speed' Alloy Wheels & Pirelli P Zero Tires...")
    all_objs.extend(build_bentley_speed_wheels_and_tires(car_col, mats))

    print("[7/35] Engineering 440mm CSiC Rotors & 10-Piston Red Monobloc Calipers...")
    all_objs.extend(build_bentley_csic_brakes_and_calipers(car_col, mats))

    print("[8/35] Assembling 6.0L Twin-Turbo W12 TSI Engine & Twin Intercoolers...")
    all_objs.extend(build_bentley_w12_powertrain(car_col, mats))

    print("[9/35] Installing 8-Speed Dual-Clutch Gearbox & Active AWD Driveline...")
    all_objs.extend(build_bentley_transmission_and_awd(car_col, mats))

    print("[10/35] Fitting 3-Chamber Adaptive Air Suspension & Double Wishbones...")
    all_objs.extend(build_bentley_air_suspension(car_col, mats))

    print("[11/35] Installing 48V Active Dynamic Ride Anti-Roll & All-Wheel Steering...")
    all_objs.extend(build_bentley_active_roll_and_aws(car_col, mats))

    print("[12/35] Fabricating Speed Elliptical Exhaust & Valved Rear Muffler...")
    all_objs.extend(build_bentley_speed_exhaust_system(car_col, mats))

    print("[13/35] Installing Underbody Aerodynamic Belly Pan & Rear Diffuser...")
    all_objs.extend(build_bentley_underbody_aero(car_col, mats))

    print("[14/35] Crafting Grand Tourer Cockpit Seats & Flying Wing Dashboard...")
    all_objs.extend(build_bentley_cockpit_silhouette(car_col, mats))

    print("[15/35] Fabricating Front Lower Matrix Scoops & Chrome Blades...")
    all_objs.extend(build_bentley_front_lower_aero_scoops(car_col, mats))

    print("[16/35] Reinforcing Structural Aluminum Sills, Intrusion Beams & Crash Boxes...")
    all_objs.extend(build_bentley_structural_safety_elements(car_col, mats))

    print("[17/35] Installing Rear Active Deployable Spoiler & Scissor Actuators...")
    all_objs.extend(build_bentley_active_rear_spoiler(car_col, mats))

    print("[18/35] Mounting Strut Tower V-Brace & Structural Firewall...")
    all_objs.extend(build_bentley_strut_bracing_and_firewall(car_col, mats))

    print("[19/35] Installing 90L Saddle Fuel Tank & Thermal Radiation Shields...")
    all_objs.extend(build_bentley_fuel_tank_and_shields(car_col, mats))

    print("[20/35] Fitting Trunk Well, Dual AGM Batteries & Roof Hydraulics...")
    all_objs.extend(build_bentley_trunk_well_and_electrical(car_col, mats))

    print("[21/35] Mounting Front Aero Splitter Winglets & CSiC Brake Ducts...")
    all_objs.extend(build_bentley_splitter_and_cooling_ducts(car_col, mats))

    print("[22/35] Bolting Cast Aluminum Subframes & Tunnel Shear Plate...")
    all_objs.extend(build_bentley_subframe_cradles(car_col, mats))

    print("[23/35] Installing Multi-Radiator Cooling Pack & Dual Fans...")
    all_objs.extend(build_bentley_radiator_cooling_pack(car_col, mats))

    print("[24/35] Routing 48V High-Voltage Busbars & DC-DC Inverter...")
    all_objs.extend(build_bentley_48v_electrical_architecture(car_col, mats))

    print("[25/35] Installing Active Deployable Rollover Protection Hoops...")
    all_objs.extend(build_bentley_rollover_protection(car_col, mats))

    print("[26/35] Mounting 4-Corner Articulating Ride Height Sensors...")
    all_objs.extend(build_bentley_ride_height_sensors(car_col, mats))

    print("[27/35] Fitting Structural Fender Aprons & Acoustic Liners...")
    all_objs.extend(build_bentley_fender_aprons_and_liners(car_col, mats))

    print("[28/35] Installing Ground-Effect Strakes, Deflectors & eLSD Scoop...")
    all_objs.extend(build_bentley_ground_effects_and_diffusers(car_col, mats))

    print("[29/35] Engineering Vacuum Brake Booster, ABS Unit & Hardlines...")
    all_objs.extend(build_bentley_brake_hydraulics_and_abs(car_col, mats))

    print("[30/35] Installing Propshaft Safety Hoops & Tunnel Baffles...")
    all_objs.extend(build_bentley_tunnel_baffles_and_safety_hoops(car_col, mats))

    print("[31/35] Mounting EVAP Carbon Canister & Vapor Lines...")
    all_objs.extend(build_bentley_evap_canister_system(car_col, mats))

    print("[32/35] Installing Twin Induction Airboxes & Ram-Air Snorkels...")
    all_objs.extend(build_bentley_air_intake_boxes_and_snorkels(car_col, mats))

    print("[33/35] Installing 48V Dynamic Ride ECU & Actuator Power Looms...")
    all_objs.extend(build_bentley_48v_dynamic_ride_ecu(car_col, mats))

    print("[34/35] Installing Aero Wind Deflector & Tonneau Electric Latches...")
    all_objs.extend(build_bentley_wind_deflector_and_latches(car_col, mats))

    print("[35/35] Bolting Forged Towing Hardware & Chassis Transport Eyes...")
    all_objs.extend(build_bentley_tow_hardware_and_lashing(car_col, mats))

    # 5. Studio Lighting Setup
    setup_bentley_studio_lighting()

    # 6. Geometric Statistics & Validation
    total_verts = 0
    total_faces = 0
    for obj in car_col.objects:
        if obj.type == 'MESH':
            total_verts += len(obj.data.vertices)
            total_faces += len(obj.data.polygons)

    print("=" * 80)
    print(f"BENTLEY CONTINENTAL GT SPEED PHASE 21 GEOMETRIC AUDIT:")
    print(f"  Total Subsystem Objects: {len(car_col.objects)}")
    print(f"  Total Vertices:          {total_verts:,}")
    print(f"  Total Polygons/Faces:    {total_faces:,}")
    print("=" * 80)

    # 7. Dual-Mode Master GLB Export
    cur_p = os.path.abspath(__file__)
    base_dir = os.path.dirname(cur_p)
    while base_dir and not os.path.exists(os.path.join(base_dir, "package.json")):
        parent = os.path.dirname(base_dir)
        if parent == base_dir:
            break
        base_dir = parent
    export_paths = [
        os.path.join(base_dir, "exports", "Car_Bentley_Continental_GT_Speed_Phase1.glb"),
        os.path.join(base_dir, "public", "models", "Car_Bentley_Continental_GT_Speed_Phase1.glb"),
    ]

    # Select all car objects for export
    bpy.ops.object.select_all(action='DESELECT')
    for obj in car_col.objects:
        obj.select_set(True)

    for out_p in export_paths:
        os.makedirs(os.path.dirname(out_p), exist_ok=True)
        print(f"[EXPORT] Writing GLB: {out_p}")
        bpy.ops.export_scene.gltf(
            filepath=out_p,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_yup=True
        )
        if os.path.exists(out_p):
            fsize = os.path.getsize(out_p) / (1024 * 1024)
            print(f"[SUCCESS] Exported {out_p} ({fsize:.2f} MB)")

    print("=" * 80)
    print("BENTLEY CONTINENTAL GT SPEED PHASE 21 COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    generate_bentley_continental_gt_speed_phase1()
'''
