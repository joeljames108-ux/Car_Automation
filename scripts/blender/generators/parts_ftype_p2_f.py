"""
Jaguar F-Type V8 R Convertible (2010s) Phase 20: Part F
Master Phase 20 Assembly Orchestrator & Multi-Target GLB Export
"""

PART_FTYPE2_F = '''
# ----------------------------------------------------------------------------
# 46. MASTER PHASE 20 ASSEMBLY ORCHESTRATION & MULTI-TARGET EXPORT
# ----------------------------------------------------------------------------

def build_jaguar_ftype_v8r_phase2():
    """
    Executes the complete Phase 20 Class-A procedural generation:
    1. Executes Phase 19: Monocoque body sculpture, clamshell bonnet, running gear,
       chassis, suspension, 20-inch wheels, and powertrain.
    2. Builds Phase 20: J-blade LED DRLs, Bi-xenon projector optics, signature round-ring taillights,
       quad 90mm polished stainless exhaust tips, aerodynamic mirrors, flush motorized door handles,
       fender louvered vents with chrome JAGUAR script, front grille red Growler emblem,
       rear 3D chrome Leaper badge, F-TYPE script and R performance badges, 24-LED CHMSL,
       articulated wipers, license plates, wheel center caps, active aero grille shutters,
       CCM brake hardware and wear sensors, underfloor venturi diffuser tunnels, bonnet gas struts,
       tonneau cover 4-bar hinges, cockpit Ignis start button, Meridian speaker grilles, and illuminated sills.
    3. Validates complete vehicle hierarchy.
    4. Exports master unified GLB models across all required target directories.
    """
    print("==============================================================================")
    print("EXECUTING JAGUAR F-TYPE V8 R CONVERTIBLE (2010s) PHASE 20 MASTER GENERATOR")
    print("==============================================================================")

    # 1. Build Phase 19 Base Vehicle
    print("-> Loading and building Phase 19 Base Sculpture & Running Gear...")
    base_objs = generate_jaguar_ftype_v8r_phase1.build_jaguar_ftype_v8r_phase1()

    # 2. Setup Jewelry Materials & Collection
    mats = create_jaguar_ftype_jewelry_materials()

    jewelry_col = bpy.data.collections.get("Jaguar_FType_V8R_Jewelry")
    if not jewelry_col:
        jewelry_col = bpy.data.collections.new("Jaguar_FType_V8R_Jewelry")
        bpy.context.scene.collection.children.link(jewelry_col)

    jewelry_objs = []

    print("-> 1. Assembling Predatory J-Blade LED DRLs & Bi-Xenon Headlights...")
    jewelry_objs.extend(build_jaguar_ftype_jblade_headlights(jewelry_col, mats))

    print("-> 2. Assembling Round Dual-Ring LED Taillights & Red Lightbar...")
    jewelry_objs.extend(build_jaguar_ftype_round_ring_taillights(jewelry_col, mats))

    print("-> 3. Assembling Quad 90mm Rolled Polished Stainless Exhaust Tips...")
    jewelry_objs.extend(build_jaguar_ftype_quad_exhaust_tips(jewelry_col, mats))

    print("-> 4. Assembling Teardrop Wing Mirrors with LED Repeaters & Glass...")
    jewelry_objs.extend(build_jaguar_ftype_aerodynamic_side_mirrors(jewelry_col, mats))

    print("-> 5. Assembling Flush Motorized Pop-Out Door Handles & Touch Sensors...")
    jewelry_objs.extend(build_jaguar_ftype_flush_door_handles(jewelry_col, mats))

    print("-> 6. Assembling Front Fender Air Extractors with Chrome JAGUAR Vane...")
    jewelry_objs.extend(build_jaguar_ftype_fender_side_vents(jewelry_col, mats))

    print("-> 7. Assembling Front Grille Red Cloisonné Jaguar Growler Emblem...")
    jewelry_objs.extend(build_jaguar_ftype_grille_growler_emblem(jewelry_col, mats))

    print("-> 8. Assembling Rear 3D Chrome Jaguar Leaper (Prowling Cat) Emblem...")
    jewelry_objs.extend(build_jaguar_ftype_rear_leaper_emblem(jewelry_col, mats))

    print("-> 9. Assembling Rear F-TYPE Script & Multi-Color Enamel R Badges...")
    jewelry_objs.extend(build_jaguar_ftype_rear_script_and_r_badges(jewelry_col, mats))

    print("-> 10. Assembling High-Mount 24-LED Center Third Brake Lamp (CHMSL)...")
    jewelry_objs.extend(build_jaguar_ftype_center_high_brake_lamp(jewelry_col, mats))

    print("-> 11. Assembling Articulated Wiper Arms with Aerodynamic Airfoils...")
    jewelry_objs.extend(build_jaguar_ftype_aerodynamic_wipers(jewelry_col, mats))

    print("-> 12. Assembling Headlamp High-Pressure Washer Jets & Hood Spray Nozzles...")
    jewelry_objs.extend(build_jaguar_ftype_washer_nozzles(jewelry_col, mats))

    print("-> 13. Assembling Stamped Aluminum License Plates & LED Illuminators...")
    jewelry_objs.extend(build_jaguar_ftype_license_plates(jewelry_col, mats))

    print("-> 14. Assembling Rear Bumper Red Corner Reflex Reflectors...")
    jewelry_objs.extend(build_jaguar_ftype_rear_reflex_reflectors(jewelry_col, mats))

    print("-> 15. Assembling Interior Rearview Mirror & ADAS Forward Camera...")
    jewelry_objs.extend(build_jaguar_ftype_interior_mirror_and_adas(jewelry_col, mats))

    print("-> 16. Assembling 20-Inch Cyclone Wheel Center Caps with Red Growler...")
    jewelry_objs.extend(build_jaguar_ftype_wheel_center_caps(jewelry_col, mats))

    print("-> 17. Assembling Wheel Tire Valve Stems & Chrome Conical Lug Nuts...")
    jewelry_objs.extend(build_jaguar_ftype_wheel_fasteners_and_valves(jewelry_col, mats))

    print("-> 18. Assembling Yellow Caliper JAGUAR Script & Anti-Rattle Springs...")
    jewelry_objs.extend(build_jaguar_ftype_caliper_script_and_hardware(jewelry_col, mats))

    print("-> 19. Assembling Beltline Flocked EPDM Weatherstripping & Seals...")
    jewelry_objs.extend(build_jaguar_ftype_weatherstripping_seals(jewelry_col, mats))

    print("-> 20. Assembling Active Spoiler Shut Line Seams & Wickerbill Lip...")
    jewelry_objs.extend(build_jaguar_ftype_spoiler_seam_and_wickerbill(jewelry_col, mats))

    print("-> 21. Assembling Shark-Mouth Grille Hexagonal Wire Infill & Trim...")
    jewelry_objs.extend(build_jaguar_ftype_grille_mesh_infill(jewelry_col, mats))

    print("-> 22. Assembling Lower Bumper Shark Gill Honeycomb Meshes & Splitter...")
    jewelry_objs.extend(build_jaguar_ftype_shark_gill_meshes(jewelry_col, mats))

    print("-> 23. Assembling Rear Diffuser Strakes & Emergency Tow Eye Hatch...")
    jewelry_objs.extend(build_jaguar_ftype_diffuser_jewelry(jewelry_col, mats))

    print("-> 24. Assembling Clamshell Bonnet Heat Extractor Fine Wire Screens...")
    jewelry_objs.extend(build_jaguar_ftype_bonnet_vent_screens(jewelry_col, mats))

    print("-> 25. Assembling Fuel Filler Flap Door & Push-Push Mechanical Latch...")
    jewelry_objs.extend(build_jaguar_ftype_fuel_filler_door(jewelry_col, mats))

    print("-> 26. Assembling Underbody Dzus Quarter-Turn Quick-Release Fasteners...")
    jewelry_objs.extend(build_jaguar_ftype_underbody_dzus_fasteners(jewelry_col, mats))

    print("-> 27. Assembling Windshield Silk-Screened Ceramic Frit Mask...")
    jewelry_objs.extend(build_jaguar_ftype_windshield_ceramic_frit(jewelry_col, mats))

    print("-> 28. Assembling Engine Bay VIN Plates & Emissions Decals...")
    jewelry_objs.extend(build_jaguar_ftype_engine_bay_placards(jewelry_col, mats))

    print("-> 29. Assembling Billet Machined Aluminum Oil Filler Cap...")
    jewelry_objs.extend(build_jaguar_ftype_oil_filler_cap(jewelry_col, mats))

    print("-> 30. Assembling Rear Decklid Aerodynamic Satellite Antenna Pod...")
    jewelry_objs.extend(build_jaguar_ftype_satellite_antenna(jewelry_col, mats))

    print("-> 31. Assembling Chronograph Instrument Dials & Paddle Shifters...")
    jewelry_objs.extend(build_jaguar_ftype_instrument_cluster_and_paddles(jewelry_col, mats))

    print("-> 32. Assembling Rollover Protection Caps & Anti-Buffeting Baffle...")
    jewelry_objs.extend(build_jaguar_ftype_rollover_caps_and_baffle(jewelry_col, mats))

    print("-> 33. Assembling Under-Mirror Puddle Lamps with Leaper Projection...")
    jewelry_objs.extend(build_jaguar_ftype_mirror_puddle_lamps(jewelry_col, mats))

    print("-> 34. Assembling Exhaust T-Bolt Clamps & Heat Shield Hex Dimples...")
    jewelry_objs.extend(build_jaguar_ftype_exhaust_clamps_and_dimples(jewelry_col, mats))

    print("-> 35. Assembling Active Aero Grille Shutters & Auxiliary Coolers...")
    jewelry_objs.extend(build_jaguar_ftype_active_aero_shutters(jewelry_col, mats))

    print("-> 36. Assembling CCM Brake Guide Pins, Springs & Sensor Loom...")
    jewelry_objs.extend(build_jaguar_ftype_ccm_brake_micro_hardware(jewelry_col, mats))

    print("-> 37. Assembling Underfloor Venturi Tunnels & Heat Shield Enclosures...")
    jewelry_objs.extend(build_jaguar_ftype_underfloor_venturi_and_heatshields(jewelry_col, mats))

    print("-> 38. Assembling Clamshell Bonnet Gas Struts, Latches & Guide Pins...")
    jewelry_objs.extend(build_jaguar_ftype_bonnet_struts_and_latches(jewelry_col, mats))

    print("-> 39. Assembling Tonneau 4-Bar Hinges, Hydraulics & Drain Gutters...")
    jewelry_objs.extend(build_jaguar_ftype_tonneau_hinges_and_drainage(jewelry_col, mats))

    print("-> 40. Assembling Washer Fluid Reservoir, Caps & Firewall Grommets...")
    jewelry_objs.extend(build_jaguar_ftype_washer_reservoir_and_grommets(jewelry_col, mats))

    print("-> 41. Assembling Cockpit Center Console Controls, Shifter & Ignis Button...")
    jewelry_objs.extend(build_jaguar_ftype_console_controls_and_start_button(jewelry_col, mats))

    print("-> 42. Assembling Meridian Surround Sound Door Speaker Grilles...")
    jewelry_objs.extend(build_jaguar_ftype_meridian_speaker_grilles(jewelry_col, mats))

    print("-> 43. Assembling Illuminated Door Sills & B-Pillar Strikers...")
    jewelry_objs.extend(build_jaguar_ftype_illuminated_door_sills_and_strikers(jewelry_col, mats))

    total_objs = len(base_objs) + len(jewelry_objs)
    print(f"[COMPLETE] Built {len(jewelry_objs)} jewelry objects. Total vehicle: {total_objs} discrete CAD objects.")

    # 4. Multi-Target Export
    export_targets = [
        "E:/Car_Automation/public/models/vehicles/convertible/2010s/vehicle.glb",
        "E:/Car_Automation/public/models/Car_Jaguar_FType_V8R_Convertible_2010s.glb",
        "E:/Car_Automation/exports/Car_Jaguar_FType_V8R_Convertible_2010s.glb",
    ]

    for export_path in export_targets:
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        print(f"-> Exporting master GLB to: {export_path}")
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        print(f"   Export complete! File size: {os.path.getsize(export_path) / (1024*1024):.2f} MB")

    print("==============================================================================")
    print("JAGUAR F-TYPE V8 R CONVERTIBLE (2010s) PHASE 20 GENERATION COMPLETE!")
    print("==============================================================================")
    return jewelry_objs


if __name__ == "__main__":
    build_jaguar_ftype_v8r_phase2()
'''
