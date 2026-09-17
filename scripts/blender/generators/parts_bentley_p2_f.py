"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part F
Subsystem 44:
- Subsystem 44: Master Phase 22 Assembly Orchestrator, Geometric Audit & Multi-Target Showroom GLB Export
"""

PART_BENTLEY2_F = '''
# ----------------------------------------------------------------------------
# 44. SUBSYSTEM 44: MASTER PHASE 22 ORCHESTRATION & MULTI-TARGET GLB EXPORT
# ----------------------------------------------------------------------------

def build_bentley_continental_gt_speed_phase2():
    """
    Executes the complete Phase 22 Master Generation:
    1. Executes Phase 21: Monocoque body sculpture, W12 powertrain, active AWD,
       3-chamber air suspension, 48V Dynamic Ride, 22-inch Speed wheels, CSiC brakes.
    2. Builds Phase 22: All 42 micro-jewelry CAD subsystems.
    3. Audits vehicle geometric statistics.
    4. Exports unified master GLB models to all showroom and repository target paths.
    """
    print("=" * 80)
    print("CREWE AUTOMOTIVE CAD: BENTLEY CONTINENTAL GT SPEED (PHASE 22 COMPLETE)")
    print("Convertible Architecture · 2020s Era · Type 3S Masterpiece")
    print("=" * 80)

    # 1. Build Phase 21 Base Vehicle
    print("-> Loading and building Phase 21 Base Sculpture & Running Gear...")
    gen_dir = os.path.dirname(os.path.abspath(__file__))
    if gen_dir not in sys.path:
        sys.path.append(gen_dir)
    import generate_bentley_continental_gt_speed_phase1
    generate_bentley_continental_gt_speed_phase1.generate_bentley_continental_gt_speed_phase1()

    # 2. Master Jewelry Collection
    scene = bpy.context.scene
    col_name = "Bentley_Continental_GT_Speed_Jewelry"
    jewel_col = bpy.data.collections.get(col_name)
    if not jewel_col:
        jewel_col = bpy.data.collections.new(col_name)
        scene.collection.children.link(jewel_col)

    # 3. PBR Jewelry Materials Suite
    mats = create_bentley_jewelry_materials()

    # 4. Execute all 42 Phase 22 Micro-Jewelry Subsystems
    jewel_objs = []

    print("[1/42] Assembling Twin Cut-Crystal Matrix LED Headlamp Clusters...")
    jewel_objs.extend(build_bentley_cut_crystal_headlamps(jewel_col, mats))

    print("[2/42] Crafting Elliptical Cut-Crystal Jewel LED Taillamps & CHMSL...")
    jewel_objs.extend(build_bentley_cut_crystal_taillamps(jewel_col, mats))

    print("[3/42] Sculpting Flying 'B' Mascot & Cloisonné Winged 'B' Emblems...")
    jewel_objs.extend(build_bentley_mascot_and_emblems(jewel_col, mats))

    print("[4/42] Engraving Hand-Scripted Chrome 'Speed' & '12' Badges...")
    jewel_objs.extend(build_bentley_speed_and_w12_badges(jewel_col, mats))

    print("[5/42] Machining Mulliner Jewel-Knurled Fuel & Oil Filler Caps...")
    jewel_objs.extend(build_bentley_jewel_filler_caps(jewel_col, mats))

    print("[6/42] Sculpting Aerodynamic Teardrop Mirrors & Sweeping LED Repeaters...")
    jewel_objs.extend(build_bentley_door_mirrors(jewel_col, mats))

    print("[7/42] Installing Flush Motorized Pop-Out Handles & Puddle Lamps...")
    jewel_objs.extend(build_bentley_flush_door_handles(jewel_col, mats))

    print("[8/42] Fitting Mulliner Chrome Waistline Beltline Trim & Cowl Brightware...")
    jewel_objs.extend(build_bentley_waistline_brightware(jewel_col, mats))

    print("[9/42] Installing Dual Pantograph Wiper Arms & Heated Fan Jets...")
    jewel_objs.extend(build_bentley_wipers_and_washers(jewel_col, mats))

    print("[10/42] Fitting 22-Inch Speed Floating Self-Leveling Wheel Center Caps...")
    jewel_objs.extend(build_bentley_floating_wheel_center_caps(jewel_col, mats))

    print("[11/42] Installing Front Wing Matrix Air Extractors & Chrome Strakes...")
    jewel_objs.extend(build_bentley_wing_vents_and_strakes(jewel_col, mats))

    print("[12/42] Embedding Ultrasonic Parking Sensors & 360 Surround Cameras...")
    jewel_objs.extend(build_bentley_parking_sensors_and_cameras(jewel_col, mats))

    print("[13/42] Mounting Stamped British Number Plates & LED Illuminators...")
    jewel_objs.extend(build_bentley_license_plates(jewel_col, mats))

    print("[14/42] Installing Frameless Interior Mirror, ADAS Pod & HUD Well...")
    jewel_objs.extend(build_bentley_interior_mirror_and_adas(jewel_col, mats))

    print("[15/42] Detailing Speed Brake Caliper Retainers & 'BENTLEY' Relief Script...")
    jewel_objs.extend(build_bentley_caliper_jewelry_and_script(jewel_col, mats))

    print("[16/42] Bolting Tonneau Deck Stainless Garnish Rails & Latch Receptors...")
    jewel_objs.extend(build_bentley_tonneau_deck_brightware(jewel_col, mats))

    print("[17/42] Concealing Front ACC Radar Transceiver & Heated Wire Grid...")
    jewel_objs.extend(build_bentley_radar_and_acc_system(jewel_col, mats))

    print("[18/42] Installing Secondary Radiator Protective Stone Guard Screens...")
    jewel_objs.extend(build_bentley_stone_guard_screens(jewel_col, mats))

    print("[19/42] Fitting Cockpit Seat Belt Shoulder Guides & Chrome Buckles...")
    jewel_objs.extend(build_bentley_seat_belts_and_hardware(jewel_col, mats))

    print("[20/42] Installing Steering Knurled Thumbwheels & Column Shift Paddles...")
    jewel_objs.extend(build_bentley_steering_controls(jewel_col, mats))

    print("[21/42] Fitting Naim Audio Diamond-Machined Speaker Grilles & Halos...")
    jewel_objs.extend(build_bentley_naim_audio_jewelry(jewel_col, mats))

    print("[22/42] Installing Fuel Flap Articulated Hinge & Silicone Tether...")
    jewel_objs.extend(build_bentley_fuel_flap_mechanics(jewel_col, mats))

    print("[23/42] Detailing Exhaust Tip Spiral Rifling Liners & Thermal Bezels...")
    jewel_objs.extend(build_bentley_exhaust_detailing(jewel_col, mats))

    print("[24/42] Installing Illuminated Stainless Steel 'SPEED' Treadplates...")
    jewel_objs.extend(build_bentley_illuminated_treadplates(jewel_col, mats))

    print("[25/42] Fitting Rear Bumper Red Reflex Reflectors & Diffuser Fog Lamp...")
    jewel_objs.extend(build_bentley_rear_reflectors_and_fog(jewel_col, mats))

    print("[26/42] Applying Windshield Ceramic Frit Dot Matrix & Sunstrip Mask...")
    jewel_objs.extend(build_bentley_windshield_frit_mask(jewel_col, mats))

    print("[27/42] Crafting Breitling Analogue Clock Jewel Face on Veneer Panel...")
    jewel_objs.extend(build_bentley_breitling_clock(jewel_col, mats))

    print("[28/42] Embroidering Headrest 'Speed' Crests & Contrast Leather Piping...")
    jewel_objs.extend(build_bentley_seat_embroidery_and_piping(jewel_col, mats))

    print("[29/42] Installing Classic 'Organ Stop' Air Controls & Bullseye Vents...")
    jewel_objs.extend(build_bentley_organ_stop_vents(jewel_col, mats))

    print("[30/42] Mounting Aerodynamic Shark-Fin Telematics Antenna Pod...")
    jewel_objs.extend(build_bentley_shark_fin_antenna(jewel_col, mats))

    print("[31/42] Installing Wheel TPMS Valve Stems & Chrome Conical Lug Caps...")
    jewel_objs.extend(build_bentley_wheel_hardware_and_tpms(jewel_col, mats))

    print("[32/42] Crafting Center Console Dual Cup Holders & Ambient Halos...")
    jewel_objs.extend(build_bentley_cup_holders(jewel_col, mats))

    print("[33/42] Mounting B-Pillar Soft-Close Door Strikers & Step Lamps...")
    jewel_objs.extend(build_bentley_door_strikers_and_courtesy(jewel_col, mats))

    print("[34/42] Installing Bonnet Telescopic Gas Struts & Safety Latches...")
    jewel_objs.extend(build_bentley_bonnet_struts_and_latches(jewel_col, mats))

    print("[35/42] Installing Boot Power Lift Spindles & Emergency Latch...")
    jewel_objs.extend(build_bentley_boot_lid_mechanisms(jewel_col, mats))

    print("[36/42] Fitting Cowl Acoustic Debris Screen & Heated Washer Pipe...")
    jewel_objs.extend(build_bentley_cowl_screen_and_washer_plumbing(jewel_col, mats))

    print("[37/42] Connecting Brake Pad Wear Sensors & Harmonic Dampers...")
    jewel_objs.extend(build_bentley_brake_wear_sensors_and_dampers(jewel_col, mats))

    print("[38/42] Mounting Tire Air Deflector Spats & Underbody NACA Chutes...")
    jewel_objs.extend(build_bentley_air_deflector_spats(jewel_col, mats))

    print("[39/42] Fitting Under-Bonnet Acoustic Insulation Pad & Seals...")
    jewel_objs.extend(build_bentley_bonnet_insulation_and_seals(jewel_col, mats))

    print("[40/42] Installing Drilled Aluminum Speed Pedals & Footrest...")
    jewel_objs.extend(build_bentley_speed_sports_pedals(jewel_col, mats))

    print("[41/42] Mounting Interior Coat Hooks & Rear Leather Grab Straps...")
    jewel_objs.extend(build_bentley_interior_hooks_and_handles(jewel_col, mats))

    print("[42/42] Installing Glovebox Polished Chrome Push Button & Valet Lock...")
    jewel_objs.extend(build_bentley_glovebox_controls(jewel_col, mats))

    # 5. Full Vehicle Geometric Audit
    total_verts = 0
    total_faces = 0
    all_car_objects = []
    for col in scene.collection.children:
        if "Bentley" in col.name:
            for obj in col.objects:
                all_car_objects.append(obj)
                if obj.type == 'MESH':
                    total_verts += len(obj.data.vertices)
                    total_faces += len(obj.data.polygons)

    print("=" * 80)
    print(f"BENTLEY CONTINENTAL GT SPEED CONVERTIBLE MASTER CAD AUDIT:")
    print(f"  Total Vehicle Subsystem Objects: {len(all_car_objects)}")
    print(f"  Total Master Vertices:          {total_verts:,}")
    print(f"  Total Master Polygons/Faces:    {total_faces:,}")
    print("=" * 80)

    # 6. Multi-Target Master GLB Export
    cur_p = os.path.abspath(__file__)
    base_dir = os.path.dirname(cur_p)
    while base_dir and not os.path.exists(os.path.join(base_dir, "package.json")):
        parent = os.path.dirname(base_dir)
        if parent == base_dir:
            break
        base_dir = parent

    export_targets = [
        os.path.join(base_dir, "public", "models", "vehicles", "convertible", "2020s", "vehicle.glb"),
        os.path.join(base_dir, "public", "models", "Car_Bentley_Continental_GT_Speed_Complete.glb"),
        os.path.join(base_dir, "exports", "Car_Bentley_Continental_GT_Speed_Complete.glb"),
    ]

    # Select all car objects for export
    bpy.ops.object.select_all(action='DESELECT')
    for obj in all_car_objects:
        obj.select_set(True)

    for export_path in export_targets:
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        print(f"-> Exporting unified master GLB to: {export_path}")
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        if os.path.exists(export_path):
            fsize = os.path.getsize(export_path) / (1024 * 1024)
            print(f"   [SUCCESS] Exported {export_path} ({fsize:.2f} MB)")

    print("=" * 80)
    print("BENTLEY CONTINENTAL GT SPEED CONVERTIBLE (2020s) COMPLETE!")
    print("=" * 80)
    return jewel_objs


if __name__ == "__main__":
    build_bentley_continental_gt_speed_phase2()
'''
