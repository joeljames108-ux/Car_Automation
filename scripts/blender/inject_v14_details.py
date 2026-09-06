import re
import sys

target_path = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\scripts\blender\refine_and_detail_interior_glbs.py"

with open(target_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Dashboards
replacements = [
    (
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_augmented_reality_hud_collimator\("Dash_AR_HUD_Collimator", \(-0.36, 0.18, 0.81\), mats=mats\)
    make_steering_column_telescopic_shroud\("Dash_Telescopic_Shroud", \(-0.36, 0.02, 0.64\), mats=mats\)
    make_fragrance_atomizer_flacon\("Dash_Glovebox_Perfume_Flacon", \(0.36, 0.02, 0.58\), mats=mats\)

    export_active_scene_to_glb\(output_path\)''',
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_augmented_reality_hud_collimator("Dash_AR_HUD_Collimator", (-0.36, 0.18, 0.81), mats=mats)
    make_steering_column_telescopic_shroud("Dash_Telescopic_Shroud", (-0.36, 0.02, 0.64), mats=mats)
    make_fragrance_atomizer_flacon("Dash_Glovebox_Perfume_Flacon", (0.36, 0.02, 0.58), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_passenger_cinema_screen_and_virtual_mirror_monitors("Dash_Exec_Cinema_Virtual", (0.0, 0.0, 0.74), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Exec_RibbonTweeter_L", (-dash_w * 0.47, 0.05, 0.79), (0, math.radians(45), 0), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Exec_RibbonTweeter_R", (dash_w * 0.47, 0.05, 0.79), (0, math.radians(-45), 0), mats=mats)

    export_active_scene_to_glb(output_path)'''
    ),
    (
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_augmented_reality_hud_collimator\("Dash_Sport_AR_HUD_Collimator", \(-0.36, 0.18, 0.81\), mats=mats\)
    make_steering_column_telescopic_shroud\("Dash_Sport_Telescopic_Shroud", \(-0.36, 0.02, 0.64\), mats=mats\)

    export_active_scene_to_glb\(output_path\)''',
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_augmented_reality_hud_collimator("Dash_Sport_AR_HUD_Collimator", (-0.36, 0.18, 0.81), mats=mats)
    make_steering_column_telescopic_shroud("Dash_Sport_Telescopic_Shroud", (-0.36, 0.02, 0.64), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_passenger_cinema_screen_and_virtual_mirror_monitors("Dash_Sport_Cinema_Virtual", (0.0, 0.0, 0.73), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Sport_RibbonTweeter_L", (-dash_w * 0.47, 0.05, 0.78), (0, math.radians(45), 0), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Sport_RibbonTweeter_R", (dash_w * 0.47, 0.05, 0.78), (0, math.radians(-45), 0), mats=mats)

    export_active_scene_to_glb(output_path)'''
    ),
    (
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_augmented_reality_hud_collimator\("Dash_Hyper_AR_HUD_Collimator", \(-0.42, 0.18, 0.87\), mats=mats\)
    make_steering_column_telescopic_shroud\("Dash_Hyper_Telescopic_Shroud", \(-0.42, 0.02, 0.64\), mats=mats\)

    export_active_scene_to_glb\(output_path\)''',
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_augmented_reality_hud_collimator("Dash_Hyper_AR_HUD_Collimator", (-0.42, 0.18, 0.87), mats=mats)
    make_steering_column_telescopic_shroud("Dash_Hyper_Telescopic_Shroud", (-0.42, 0.02, 0.64), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_passenger_cinema_screen_and_virtual_mirror_monitors("Dash_Hyper_Cinema_Virtual", (0.0, 0.0, 0.75), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Hyper_RibbonTweeter_L", (-dash_w * 0.48, 0.06, 0.81), (0, math.radians(45), 0), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Hyper_RibbonTweeter_R", (dash_w * 0.48, 0.06, 0.81), (0, math.radians(-45), 0), mats=mats)

    export_active_scene_to_glb(output_path)'''
    ),
    (
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_tourbillon_multi_axis_escapement\("Dash_Classic_Tourbillon", \(0.04, -0.075, 0.77\), mats=mats\)
    make_steering_column_telescopic_shroud\("Dash_Classic_Telescopic_Shroud", \(-0.25, -0.02, 0.62\), mats=mats\)

    export_active_scene_to_glb\(output_path\)''',
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_tourbillon_multi_axis_escapement("Dash_Classic_Tourbillon", (0.04, -0.075, 0.77), mats=mats)
    make_steering_column_telescopic_shroud("Dash_Classic_Telescopic_Shroud", (-0.25, -0.02, 0.62), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_a_pillar_ribbon_tweeter_pod("Dash_Classic_RibbonTweeter_L", (-dash_w * 0.46, 0.05, 0.76), (0, math.radians(45), 0), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("Dash_Classic_RibbonTweeter_R", (dash_w * 0.46, 0.05, 0.76), (0, math.radians(-45), 0), mats=mats)

    export_active_scene_to_glb(output_path)'''
    ),
    (
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_tourbillon_multi_axis_escapement\("GT_Dash_Tourbillon_Escapement", \(0.05, 0.06, 0.825\), mats=mats\)
    make_augmented_reality_hud_collimator\("GT_Dash_AR_HUD_Collimator", \(-0.36, 0.18, 0.82\), mats=mats\)
    make_steering_column_telescopic_shroud\("GT_Dash_Steering_Shroud", \(-0.36, 0.02, 0.64\), mats=mats\)

    export_active_scene_to_glb\(output_path\)''',
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_tourbillon_multi_axis_escapement("GT_Dash_Tourbillon_Escapement", (0.05, 0.06, 0.825), mats=mats)
    make_augmented_reality_hud_collimator("GT_Dash_AR_HUD_Collimator", (-0.36, 0.18, 0.82), mats=mats)
    make_steering_column_telescopic_shroud("GT_Dash_Steering_Shroud", (-0.36, 0.02, 0.64), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_passenger_cinema_screen_and_virtual_mirror_monitors("GT_Dash_Cinema_Virtual", (0.0, 0.0, 0.75), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("GT_Dash_RibbonTweeter_L", (-dash_w * 0.47, 0.05, 0.79), (0, math.radians(45), 0), mats=mats)
    make_a_pillar_ribbon_tweeter_pod("GT_Dash_RibbonTweeter_R", (dash_w * 0.47, 0.05, 0.79), (0, math.radians(-45), 0), mats=mats)

    export_active_scene_to_glb(output_path)'''
    ),
    # 2. Center Consoles
    (
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_haptic_rotary_command_dial\("Console_Haptic_MMI_Dial", \(0.0, 0.08, 0.315\), mats=mats\)
    make_rear_vip_refrigerated_bar_cabinet\("Console_Rear_VIP_Refrigerated_Bar", \(0.0, -0.72, 0.16\), mats=mats\)

    export_active_scene_to_glb\(output_path\)''',
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_haptic_rotary_command_dial("Console_Haptic_MMI_Dial", (0.0, 0.08, 0.315), mats=mats)
    make_rear_vip_refrigerated_bar_cabinet("Console_Rear_VIP_Refrigerated_Bar", (0.0, -0.72, 0.16), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_inductive_phone_charging_station("Console_Inductive_Phone_Station", (0.0, 0.44, 0.315), mats=mats)

    export_active_scene_to_glb(output_path)'''
    ),
    (
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_footwell_night_navigation_gooseneck\("Console_GT3_Nav_Gooseneck", \(-0.11, 0.35, 0.28\), mats=mats\)

    export_active_scene_to_glb\(output_path\)''',
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_footwell_night_navigation_gooseneck("Console_GT3_Nav_Gooseneck", (-0.11, 0.35, 0.28), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_pit_radio_comms_and_ptt_assembly("Console_GT3_Pit_Radio_Comms", (0.08, -0.22, 0.28), mats=mats)

    export_active_scene_to_glb(output_path)'''
    ),
    # 3. Steering Wheels
    (
        r'''def build_sport_steering_wheel\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "    export_active_scene_to_glb(output_path)",
            "    # v14.0 Ultimate Additions\n    make_steering_column_quick_release_spline_hub(\"Steer_Sport_Quick_Release\", (0.0, 0.04, 0.0), mats=mats)\n\n    export_active_scene_to_glb(output_path)"
        )
    ),
    (
        r'''def build_gt3_yoke_steering_wheel\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "    export_active_scene_to_glb(output_path)",
            "    # v14.0 Ultimate Additions\n    make_steering_column_quick_release_spline_hub(\"Steer_Yoke_Quick_Release\", (0.0, 0.04, 0.0), mats=mats)\n\n    export_active_scene_to_glb(output_path)"
        )
    ),
    (
        r'''def build_luxury_3spoke_wheel\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "    export_active_scene_to_glb(output_path)",
            "    # v14.0 Ultimate Additions\n    make_steering_column_quick_release_spline_hub(\"Steer_Luxury_Quick_Release\", (0.0, 0.04, 0.0), mats=mats)\n\n    export_active_scene_to_glb(output_path)"
        )
    ),
    (
        r'''def build_suede_carbon_steering_wheel\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "    export_active_scene_to_glb(output_path)",
            "    # v14.0 Ultimate Additions\n    make_steering_column_quick_release_spline_hub(\"Steer_Suede_Quick_Release\", (0.0, 0.04, 0.0), mats=mats)\n\n    export_active_scene_to_glb(output_path)"
        )
    ),
    (
        r'''def build_formula_steering_wheel\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "    export_active_scene_to_glb(output_path)",
            "    # v14.0 Ultimate Additions\n    make_steering_column_quick_release_spline_hub(\"Steer_Formula_Quick_Release\", (0.0, 0.04, 0.0), mats=mats)\n\n    export_active_scene_to_glb(output_path)"
        )
    ),
    # 4. Seats
    (
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_3d_knitted_perforated_seat_accent\("Seat_Executive_3DKnit_Cushion", \(0.0, 0.05, 0.395\), size=\(0.32, 0.38, 0.015\), mats=mats, accent_mat="anodized_petrol_blue"\)
    make_b_pillar_seatbelt_height_adjuster\("Seat_Executive_BPillar_Adjuster_v13", \(-0.38, -0.22, 0.85\), mats=mats\)

    export_active_scene_to_glb\(output_path\)''',
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_3d_knitted_perforated_seat_accent("Seat_Executive_3DKnit_Cushion", (0.0, 0.05, 0.395), size=(0.32, 0.38, 0.015), mats=mats, accent_mat="anodized_petrol_blue")
    make_b_pillar_seatbelt_height_adjuster("Seat_Executive_BPillar_Adjuster_v13", (-0.38, -0.22, 0.85), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_pneumatic_lumbar_air_harness("Seat_Exec_Lumbar_Harness", (0.0, -0.16, 0.65), mats=mats)
    make_ottoman_calf_rest_and_footrest_assembly("Seat_Exec_Ottoman_Calf_Rest", (0.0, 0.38, 0.22), mats=mats)

    export_active_scene_to_glb(output_path)'''
    ),
    (
        r'''def build_race_carbon_seat\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "    export_active_scene_to_glb(output_path)",
            "    # v14.0 Ultimate Additions\n    make_pneumatic_lumbar_air_harness(\"Seat_Race_Lumbar_Harness\", (0.0, -0.12, 0.55), mats=mats)\n\n    export_active_scene_to_glb(output_path)"
        )
    ),
    (
        r'''def build_sport_bucket_seat\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "    export_active_scene_to_glb(output_path)",
            "    # v14.0 Ultimate Additions\n    make_pneumatic_lumbar_air_harness(\"Seat_Sport_Lumbar_Harness\", (0.0, -0.12, 0.55), mats=mats)\n\n    export_active_scene_to_glb(output_path)"
        )
    ),
    (
        r'''def build_luxury_massage_seat\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "    export_active_scene_to_glb(output_path)",
            "    # v14.0 Ultimate Additions\n    make_pneumatic_lumbar_air_harness(\"Seat_Massage_Lumbar_Harness\", (0.0, -0.16, 0.65), mats=mats)\n    make_ottoman_calf_rest_and_footrest_assembly(\"Seat_Massage_Ottoman_Calf_Rest\", (0.0, 0.38, 0.22), mats=mats)\n\n    export_active_scene_to_glb(output_path)"
        )
    ),
    # 5. Pedals
    (
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_footwell_night_navigation_gooseneck\("Pedal_Footwell_Nav_Gooseneck", \(-0.24, -0.05, 0.15\), mats=mats\)

    export_active_scene_to_glb\(output_path\)''',
        r'''    # v13.0 Ultimate Craftsmanship Additions
    make_footwell_night_navigation_gooseneck("Pedal_Footwell_Nav_Gooseneck", (-0.24, -0.05, 0.15), mats=mats)

    # v14.0 Ultimate Bespoke & Aerospace Additions
    make_motorsport_heel_rest_plate_and_footrest("Pedal_Race_Heel_Rest_System", (0.0, -0.12, 0.02), mats=mats)

    export_active_scene_to_glb(output_path)'''
    ),
    # 6. Roof
    (
        r'''def build_starlight_roof\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "    export_active_scene_to_glb(output_path)",
            "    # v14.0 Ultimate Additions\n    make_smart_glass_roof_segments_and_grab_handles(\"Roof_SmartGlass_GrabHandles\", (0.0, 0.0, 0.02), mats=mats)\n\n    export_active_scene_to_glb(output_path)"
        )
    ),
    # 7. Door Cards
    (
        r'''def build_executive_door_cards\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "make_door_pocket_waterfall_ambient_guide(f\"Door_Waterfall_Ambient_{side}\", (dx - sign * 0.040, 0.05, 0.25), mats=mats)",
            "make_door_pocket_waterfall_ambient_guide(f\"Door_Waterfall_Ambient_{side}\", (dx - sign * 0.040, 0.05, 0.25), mats=mats)\n        make_door_concealed_umbrella_system(f\"Door_Concealed_Umbrella_{side}\", (dx - sign * 0.02, 0.38, 0.35), mats=mats)"
        )
    ),
    (
        r'''def build_sport_door_cards\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "make_door_pocket_waterfall_ambient_guide(f\"Door_Sport_Waterfall_Ambient_{side}\", (dx - sign * 0.040, 0.05, 0.25), mats=mats)",
            "make_door_pocket_waterfall_ambient_guide(f\"Door_Sport_Waterfall_Ambient_{side}\", (dx - sign * 0.040, 0.05, 0.25), mats=mats)\n        make_door_concealed_umbrella_system(f\"Door_Sport_Concealed_Umbrella_{side}\", (dx - sign * 0.02, 0.38, 0.35), mats=mats)"
        )
    ),
    # 8. Complete Cockpits
    (
        r'''def build_complete_luxury_executive_cockpit\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "make_3d_knitted_perforated_seat_accent(\"Cockpit_Pass_3DKnit\", (0.38, 0.0, 0.375), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"anodized_petrol_blue\")",
            "make_3d_knitted_perforated_seat_accent(\"Cockpit_Pass_3DKnit\", (0.38, 0.0, 0.375), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"anodized_petrol_blue\")\n\n    # v14.0 Ultimate Bespoke & Aerospace Additions\n    make_passenger_cinema_screen_and_virtual_mirror_monitors(\"Cockpit_Exec_Cinema_Virtual\", (0.0, 0.52, 0.74), mats=mats)\n    make_smart_glass_roof_segments_and_grab_handles(\"Cockpit_Exec_SmartGlass_GrabHandles\", (0.0, 0.0, 1.35), mats=mats)\n    make_pneumatic_lumbar_air_harness(\"Cockpit_Driver_Lumbar_Harness\", (-0.38, -0.16, 0.65), mats=mats)\n    make_pneumatic_lumbar_air_harness(\"Cockpit_Pass_Lumbar_Harness\", (0.38, -0.16, 0.65), mats=mats)\n    make_ottoman_calf_rest_and_footrest_assembly(\"Cockpit_Pass_Ottoman\", (0.38, 0.36, 0.22), mats=mats)\n    make_door_concealed_umbrella_system(\"Cockpit_Door_Umbrella_L\", (-0.74, 0.38, 0.35), mats=mats)\n    make_door_concealed_umbrella_system(\"Cockpit_Door_Umbrella_R\", (0.74, 0.38, 0.35), mats=mats)\n    make_inductive_phone_charging_station(\"Cockpit_Exec_Inductive_Phone\", (0.0, 0.35, 0.405), mats=mats)\n    make_a_pillar_ribbon_tweeter_pod(\"Cockpit_Exec_RibbonTweeter_L\", (-0.68, 0.50, 0.79), (0, math.radians(40), 0), mats=mats)\n    make_a_pillar_ribbon_tweeter_pod(\"Cockpit_Exec_RibbonTweeter_R\", (0.68, 0.50, 0.79), (0, math.radians(-40), 0), mats=mats)"
        )
    ),
    (
        r'''def build_complete_gt3_cockpit\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "make_3d_knitted_perforated_seat_accent(\"GT3_Cockpit_Seat_3DKnit\", (-0.38, -0.05, 0.295), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"anodized_red\")",
            "make_3d_knitted_perforated_seat_accent(\"GT3_Cockpit_Seat_3DKnit\", (-0.38, -0.05, 0.295), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"anodized_red\")\n\n    # v14.0 Ultimate Bespoke & Aerospace Additions\n    make_pit_radio_comms_and_ptt_assembly(\"Cockpit_GT3_Pit_Radio\", (0.08, -0.22, 0.315), mats=mats)\n    make_motorsport_heel_rest_plate_and_footrest(\"Cockpit_GT3_Heel_Rest\", (-0.38, 0.40, 0.145), mats=mats)\n    make_steering_column_quick_release_spline_hub(\"Cockpit_GT3_Quick_Release\", (-0.38, 0.38, 0.72), mats=mats)\n    make_passenger_cinema_screen_and_virtual_mirror_monitors(\"Cockpit_GT3_Virtual_Mirrors\", (0.0, 0.52, 0.74), mats=mats)"
        )
    ),
    (
        r'''def build_executive_theater_cockpit\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "make_rear_vip_refrigerated_bar_cabinet(\"Theater_VIP_Refrigerated_Bar\", (0.0, -0.65, 0.28), mats=mats)",
            "make_rear_vip_refrigerated_bar_cabinet(\"Theater_VIP_Refrigerated_Bar\", (0.0, -0.65, 0.28), mats=mats)\n\n    # v14.0 Ultimate Bespoke & Aerospace Additions\n    make_smart_glass_roof_segments_and_grab_handles(\"Theater_SmartGlass\", (0.0, 0.0, 1.35), mats=mats)\n    make_pneumatic_lumbar_air_harness(\"Theater_Driver_Lumbar\", (-0.38, -0.16, 0.65), mats=mats)\n    make_pneumatic_lumbar_air_harness(\"Theater_Pass_Lumbar\", (0.38, -0.16, 0.65), mats=mats)\n    make_ottoman_calf_rest_and_footrest_assembly(\"Theater_Pass_Ottoman\", (0.38, 0.36, 0.22), mats=mats)\n    make_door_concealed_umbrella_system(\"Theater_Door_Umbrella_L\", (-0.74, 0.38, 0.35), mats=mats)\n    make_door_concealed_umbrella_system(\"Theater_Door_Umbrella_R\", (0.74, 0.38, 0.35), mats=mats)\n    make_inductive_phone_charging_station(\"Theater_Inductive_Phone\", (0.0, 0.35, 0.405), mats=mats)\n    make_a_pillar_ribbon_tweeter_pod(\"Theater_RibbonTweeter_L\", (-0.68, 0.50, 0.79), (0, math.radians(40), 0), mats=mats)\n    make_a_pillar_ribbon_tweeter_pod(\"Theater_RibbonTweeter_R\", (0.68, 0.50, 0.79), (0, math.radians(-40), 0), mats=mats)"
        )
    ),
    (
        r'''def build_hypercar_halo_cockpit\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "make_3d_knitted_perforated_seat_accent(\"Halo_Pass_3DKnit\", (0.36, -0.06, 0.295), size=(0.30, 0.36, 0.015), mats=mats, accent_mat=\"synthetic_ruby\")",
            "make_3d_knitted_perforated_seat_accent(\"Halo_Pass_3DKnit\", (0.36, -0.06, 0.295), size=(0.30, 0.36, 0.015), mats=mats, accent_mat=\"synthetic_ruby\")\n\n    # v14.0 Ultimate Bespoke & Aerospace Additions\n    make_steering_column_quick_release_spline_hub(\"Halo_Quick_Release\", (-0.36, 0.38, 0.72), mats=mats)\n    make_passenger_cinema_screen_and_virtual_mirror_monitors(\"Halo_Virtual_Mirrors\", (0.0, 0.52, 0.74), mats=mats)\n    make_inductive_phone_charging_station(\"Halo_Inductive_Phone\", (0.0, 0.35, 0.405), mats=mats)\n    make_motorsport_heel_rest_plate_and_footrest(\"Halo_Heel_Rest\", (-0.36, 0.40, 0.145), mats=mats)"
        )
    ),
    (
        r'''def build_quantum_hyperblade_cockpit\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "make_3d_knitted_perforated_seat_accent(\"Quantum_Pass_3DKnit\", (0.38, -0.06, 0.325), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"hud_projection_cyan\")",
            "make_3d_knitted_perforated_seat_accent(\"Quantum_Pass_3DKnit\", (0.38, -0.06, 0.325), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"hud_projection_cyan\")\n\n    # v14.0 Ultimate Bespoke & Aerospace Additions\n    make_passenger_cinema_screen_and_virtual_mirror_monitors(\"Quantum_Virtual_Mirrors\", (0.0, 0.52, 0.74), mats=mats)\n    make_smart_glass_roof_segments_and_grab_handles(\"Quantum_SmartGlass\", (0.0, 0.0, 1.35), mats=mats)\n    make_inductive_phone_charging_station(\"Quantum_Inductive_Phone\", (0.0, 0.35, 0.405), mats=mats)\n    make_a_pillar_ribbon_tweeter_pod(\"Quantum_RibbonTweeter_L\", (-0.68, 0.50, 0.79), (0, math.radians(40), 0), mats=mats)\n    make_a_pillar_ribbon_tweeter_pod(\"Quantum_RibbonTweeter_R\", (0.68, 0.50, 0.79), (0, math.radians(-40), 0), mats=mats)"
        )
    ),
    (
        r'''def build_bespoke_atelier_cockpit\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "make_3d_knitted_perforated_seat_accent(\"Atelier_Pass_3DKnit\", (0.38, -0.04, 0.325), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"damascus_steel\")",
            "make_3d_knitted_perforated_seat_accent(\"Atelier_Pass_3DKnit\", (0.38, -0.04, 0.325), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"damascus_steel\")\n\n    # v14.0 Ultimate Bespoke & Aerospace Additions\n    make_smart_glass_roof_segments_and_grab_handles(\"Atelier_SmartGlass\", (0.0, 0.0, 1.35), mats=mats)\n    make_pneumatic_lumbar_air_harness(\"Atelier_Driver_Lumbar\", (-0.38, -0.16, 0.65), mats=mats)\n    make_pneumatic_lumbar_air_harness(\"Atelier_Pass_Lumbar\", (0.38, -0.16, 0.65), mats=mats)\n    make_ottoman_calf_rest_and_footrest_assembly(\"Atelier_Pass_Ottoman\", (0.38, 0.36, 0.22), mats=mats)\n    make_door_concealed_umbrella_system(\"Atelier_Door_Umbrella_L\", (-0.74, 0.38, 0.35), mats=mats)\n    make_door_concealed_umbrella_system(\"Atelier_Door_Umbrella_R\", (0.74, 0.38, 0.35), mats=mats)\n    make_inductive_phone_charging_station(\"Atelier_Inductive_Phone\", (0.0, 0.35, 0.405), mats=mats)\n    make_a_pillar_ribbon_tweeter_pod(\"Atelier_RibbonTweeter_L\", (-0.68, 0.50, 0.79), (0, math.radians(40), 0), mats=mats)\n    make_a_pillar_ribbon_tweeter_pod(\"Atelier_RibbonTweeter_R\", (0.68, 0.50, 0.79), (0, math.radians(-40), 0), mats=mats)"
        )
    ),
    (
        r'''def build_coachbuilt_vip_salon\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "make_3d_knitted_perforated_seat_accent(\"VIP_Pass_3DKnit\", (0.38, -0.04, 0.325), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"copper_woven_mesh\")",
            "make_3d_knitted_perforated_seat_accent(\"VIP_Pass_3DKnit\", (0.38, -0.04, 0.325), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"copper_woven_mesh\")\n\n    # v14.0 Ultimate Bespoke & Aerospace Additions\n    make_smart_glass_roof_segments_and_grab_handles(\"VIP_Salon_SmartGlass\", (0.0, 0.0, 1.35), mats=mats)\n    make_pneumatic_lumbar_air_harness(\"VIP_Salon_Driver_Lumbar\", (-0.38, -0.16, 0.65), mats=mats)\n    make_pneumatic_lumbar_air_harness(\"VIP_Salon_Pass_Lumbar\", (0.38, -0.16, 0.65), mats=mats)\n    make_ottoman_calf_rest_and_footrest_assembly(\"VIP_Salon_Ottoman\", (0.38, 0.36, 0.22), mats=mats)\n    make_door_concealed_umbrella_system(\"VIP_Salon_Umbrella_L\", (-0.74, 0.38, 0.35), mats=mats)\n    make_door_concealed_umbrella_system(\"VIP_Salon_Umbrella_R\", (0.74, 0.38, 0.35), mats=mats)\n    make_inductive_phone_charging_station(\"VIP_Salon_Inductive_Phone\", (0.0, 0.35, 0.405), mats=mats)\n    make_a_pillar_ribbon_tweeter_pod(\"VIP_Salon_RibbonTweeter_L\", (-0.68, 0.50, 0.79), (0, math.radians(40), 0), mats=mats)\n    make_a_pillar_ribbon_tweeter_pod(\"VIP_Salon_RibbonTweeter_R\", (0.68, 0.50, 0.79), (0, math.radians(-40), 0), mats=mats)"
        )
    ),
    (
        r'''def build_endurance_gt3_cockpit\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "make_3d_knitted_perforated_seat_accent(\"Endurance_Driver_3DKnit\", (-0.38, -0.05, 0.295), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"anodized_petrol_blue\")",
            "make_3d_knitted_perforated_seat_accent(\"Endurance_Driver_3DKnit\", (-0.38, -0.05, 0.295), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"anodized_petrol_blue\")\n\n    # v14.0 Ultimate Bespoke & Aerospace Additions\n    make_pit_radio_comms_and_ptt_assembly(\"Endurance_Pit_Radio\", (0.08, -0.22, 0.315), mats=mats)\n    make_motorsport_heel_rest_plate_and_footrest(\"Endurance_Heel_Rest\", (-0.38, 0.40, 0.145), mats=mats)\n    make_steering_column_quick_release_spline_hub(\"Endurance_Quick_Release\", (-0.38, 0.38, 0.72), mats=mats)\n    make_passenger_cinema_screen_and_virtual_mirror_monitors(\"Endurance_Virtual_Mirrors\", (0.0, 0.52, 0.74), mats=mats)"
        )
    ),
    (
        r'''def build_hypercar_carbon_cockpit\(output_path\):.*?export_active_scene_to_glb\(output_path\)''',
        lambda m: m.group(0).replace(
            "make_3d_knitted_perforated_seat_accent(\"HyperCarbon_Pass_3DKnit\", (0.38, -0.05, 0.295), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"anodized_petrol_blue\")",
            "make_3d_knitted_perforated_seat_accent(\"HyperCarbon_Pass_3DKnit\", (0.38, -0.05, 0.295), size=(0.32, 0.38, 0.015), mats=mats, accent_mat=\"anodized_petrol_blue\")\n\n    # v14.0 Ultimate Bespoke & Aerospace Additions\n    make_steering_column_quick_release_spline_hub(\"HyperCarbon_Quick_Release\", (-0.38, 0.38, 0.72), mats=mats)\n    make_motorsport_heel_rest_plate_and_footrest(\"HyperCarbon_Heel_Rest\", (-0.38, 0.40, 0.145), mats=mats)\n    make_passenger_cinema_screen_and_virtual_mirror_monitors(\"HyperCarbon_Virtual_Mirrors\", (0.0, 0.52, 0.74), mats=mats)\n    make_inductive_phone_charging_station(\"HyperCarbon_Inductive_Phone\", (0.0, 0.35, 0.405), mats=mats)"
        )
    ),
]

count = 0
for pat, repl in replacements:
    flags = re.DOTALL
    if callable(repl):
        new_content, n = re.subn(pat, repl, content, flags=flags)
    else:
        new_content, n = re.subn(pat, repl, content, count=1, flags=flags)
    if n > 0:
        content = new_content
        count += n
    else:
        print(f"[WARN] Pattern failed to match: {pat[:60]}...")

with open(target_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"[COMPLETE] Applied {count}/{len(replacements)} injection blocks successfully into refine_and_detail_interior_glbs.py!")
