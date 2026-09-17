"""
=============================================================================
APEX ENGINEER: 24 ARCHITECTURES × 7 ERAS (168 VEHICLES) CAD BLUEPRINTS
=============================================================================
Contains precise real-world dimensions, architectural styles, greenhouse profiles,
lighting signatures, aerodynamic packages, and color palettes for all 168 reference cars.
=============================================================================
"""

# Era-specific lighting, trim, and wheel aesthetics
ERA_STYLING_RULES = {
    "1970s": {
        "headlight_style": "round_sealed_beam",  # or dual_round
        "taillight_style": "rectangular_lens",
        "trim_type": "chrome",
        "grille_depth": 0.08,
        "sharpness": 0.25, # Boxy folded-paper
        "wheel_diameter_m": 0.58,
        "rim_diameter_in": 14,
        "default_color": (0.75, 0.42, 0.10, 1.0), # Vintage Mustard / Ochre
        "metallic": 0.4,
        "clearcoat": 0.5,
    },
    "1980s": {
        "headlight_style": "popup_or_box_flush", # Pop-up or flush rectangular
        "taillight_style": "ribbed_horizontal",
        "trim_type": "black_polyurethane",
        "grille_depth": 0.05,
        "sharpness": 0.35, # Wedge era
        "wheel_diameter_m": 0.62,
        "rim_diameter_in": 15,
        "default_color": (0.85, 0.10, 0.12, 1.0), # Alpine Crimson / Red
        "metallic": 0.7,
        "clearcoat": 0.8,
    },
    "1990s": {
        "headlight_style": "polycarbonate_flush",
        "taillight_style": "integrated_wraparound",
        "trim_type": "body_color",
        "grille_depth": 0.04,
        "sharpness": 0.70, # Smooth biodesign curves
        "wheel_diameter_m": 0.64,
        "rim_diameter_in": 17,
        "default_color": (0.06, 0.26, 0.18, 1.0), # British Racing Green / Emerald
        "metallic": 0.85,
        "clearcoat": 0.95,
    },
    "2000s": {
        "headlight_style": "projector_quad",
        "taillight_style": "crystal_lens",
        "trim_type": "satin_aluminum",
        "grille_depth": 0.06,
        "sharpness": 0.60, # Taut creases & high beltlines
        "wheel_diameter_m": 0.67,
        "rim_diameter_in": 18,
        "default_color": (0.78, 0.82, 0.86, 1.0), # Titanium Silver Metallic
        "metallic": 0.92,
        "clearcoat": 1.0,
    },
    "2010s": {
        "headlight_style": "angular_led_drl",
        "taillight_style": "sculpted_3d_led",
        "trim_type": "gloss_black",
        "grille_depth": 0.08,
        "sharpness": 0.80, # Sharp angular surface facets
        "wheel_diameter_m": 0.70,
        "rim_diameter_in": 19,
        "default_color": (0.04, 0.18, 0.48, 1.0), # Deep Sapphire Metallic Blue
        "metallic": 0.92,
        "clearcoat": 1.0,
    },
    "2020s": {
        "headlight_style": "matrix_lightbar",
        "taillight_style": "continuous_lightbar",
        "trim_type": "dark_chrome",
        "grille_depth": 0.03, # Flush aero/EV
        "sharpness": 0.85,
        "wheel_diameter_m": 0.73,
        "rim_diameter_in": 20,
        "default_color": (0.12, 0.14, 0.16, 1.0), # Satin Nero Carbon / Slate Grey
        "metallic": 0.95,
        "clearcoat": 1.0,
    },
    "future": {
        "headlight_style": "cyber_laser_blade",
        "taillight_style": "holographic_aero_fin",
        "trim_type": "forged_carbon",
        "grille_depth": 0.01, # Completely seamless flow channels
        "sharpness": 0.95,
        "wheel_diameter_m": 0.76,
        "rim_diameter_in": 22,
        "default_color": (0.88, 0.94, 0.98, 1.0), # Crystalline Polar Pearl
        "metallic": 0.98,
        "clearcoat": 1.0,
    },
}

# Blueprint catalog for all 168 vehicles [length_m, width_m, height_m, wheelbase_m, ground_clearance_m, hood_ratio, cabin_ratio, fastback_rake_deg, aero_wing_type]
VEHICLE_BLUEPRINTS = {
    # -------------------------------------------------------------------------
    # 1. SEDAN (3-Box Executive Touring Architecture)
    # -------------------------------------------------------------------------
    ("sedan", "1970s"): {
        "car_name": "Mercedes-Benz S-Class (W116)",
        "dims": (4.960, 1.870, 1.430, 2.865, 0.140),
        "hood_ratio": 0.33, "cabin_ratio": 0.45, "deck_ratio": 0.22, "fastback_rake": 20,
        "front_grille": "mercedes_classic_chrome", "headlights": "rectangular_flush_amber", "aero": "double_chrome_bumpers_ribbed_lights",
        "color": (0.55, 0.58, 0.62, 1.0), # Astral Silver Metallic
    },
    ("sedan", "1980s"): {
        "car_name": "Mercedes-Benz 190E 2.3-16 (W201)",
        "dims": (4.430, 1.706, 1.361, 2.665, 0.130),
        "hood_ratio": 0.30, "cabin_ratio": 0.48, "deck_ratio": 0.22, "fastback_rake": 20,
        "front_grille": "mercedes_classic_chrome", "headlights": "rectangular_flush", "aero": "cosworth_rear_wing_side_cladding",
        "color": (0.12, 0.12, 0.14, 1.0), # Blue-Black Metallic 199
    },
    ("sedan", "1990s"): {
        "car_name": "BMW 5 Series (E39)",
        "dims": (4.775, 1.800, 1.435, 2.830, 0.120),
        "hood_ratio": 0.32, "cabin_ratio": 0.46, "deck_ratio": 0.22, "fastback_rake": 24,
        "front_grille": "bmw_rounded_kidney", "headlights": "quad_halo_under_glass", "aero": "subtle_decklid_lip_underbody_tray",
        "color": (0.08, 0.14, 0.24, 1.0), # Oxford Green / Orient Blue
    },
    ("sedan", "2000s"): {
        "car_name": "Audi RS6 Sedan (C6)",
        "dims": (4.928, 1.889, 1.456, 2.846, 0.115),
        "hood_ratio": 0.33, "cabin_ratio": 0.45, "deck_ratio": 0.22, "fastback_rake": 26,
        "front_grille": "audi_singleframe", "headlights": "xenon_projector_drl_strip", "aero": "widebody_box_flares_oval_exhaust",
        "color": (0.24, 0.26, 0.28, 1.0), # Daytona Grey Pearl
    },
    ("sedan", "2010s"): {
        "car_name": "Alfa Romeo Giulia Quadrifoglio",
        "dims": (4.639, 1.873, 1.426, 2.820, 0.100),
        "hood_ratio": 0.34, "cabin_ratio": 0.44, "deck_ratio": 0.22, "fastback_rake": 28,
        "front_grille": "alfa_scudetto_shield", "headlights": "bixenon_led_projector", "aero": "active_carbon_front_splitter_diffuser",
        "color": (0.82, 0.05, 0.08, 1.0), # Rosso Competizione
    },
    ("sedan", "2020s"): {
        "car_name": "Honda Civic Sedan (11th Gen)",
        "dims": (4.674, 1.801, 1.415, 2.735, 0.135),
        "hood_ratio": 0.29, "cabin_ratio": 0.49, "deck_ratio": 0.22, "fastback_rake": 30,
        "front_grille": "civic_honeycomb_trapezoid", "headlights": "inverted_l_led_drl", "aero": "integrated_ducktail_curtains",
        "color": (0.35, 0.38, 0.42, 1.0), # Sonic Gray Pearl
    },
    ("sedan", "future"): {
        "car_name": "Audi Grandsphere Concept",
        "dims": (5.350, 2.000, 1.390, 3.190, 0.135),
        "hood_ratio": 0.22, "cabin_ratio": 0.56, "deck_ratio": 0.22, "fastback_rake": 36,
        "front_grille": "digital_light_surface", "headlights": "laser_eye_projectors", "aero": "morphing_boat_tail_canopy",
        "color": (0.92, 0.94, 0.96, 1.0), # Celestial Pearlescent
    },

    # -------------------------------------------------------------------------
    # 2. HATCHBACK (2-Box Compact Agile Urban Platform)
    # -------------------------------------------------------------------------
    ("hatchback", "1970s"): {
        "car_name": "Volkswagen Golf GTI Mk1",
        "dims": (3.705, 1.610, 1.390, 2.400, 0.140),
        "hood_ratio": 0.26, "cabin_ratio": 0.60, "deck_ratio": 0.14, "fastback_rake": 12,
        "front_grille": "vw_horizontal_red_stripe", "headlights": "round_single", "aero": "black_chin_spoiler_wheelarch_trims",
        "color": (0.88, 0.08, 0.08, 1.0), # Mars Red
    },
    ("hatchback", "1980s"): {
        "car_name": "Peugeot 205 GTi",
        "dims": (3.705, 1.572, 1.355, 2.420, 0.135),
        "hood_ratio": 0.27, "cabin_ratio": 0.59, "deck_ratio": 0.14, "fastback_rake": 16,
        "front_grille": "peugeot_slotted_lion", "headlights": "trapezoid_flush", "aero": "plastic_fender_extensions_c_pillar_slats",
        "color": (0.90, 0.90, 0.92, 1.0), # Alpine White / Miami Blue
    },
    ("hatchback", "1990s"): {
        "car_name": "Honda Civic Type R (EK9)",
        "dims": (4.180, 1.695, 1.360, 2.620, 0.130),
        "hood_ratio": 0.28, "cabin_ratio": 0.58, "deck_ratio": 0.14, "fastback_rake": 20,
        "front_grille": "honda_mesh_red_h", "headlights": "polycarbonate_wraparound", "aero": "roofline_spoiler_front_lip",
        "color": (0.94, 0.94, 0.90, 1.0), # Championship White
    },
    ("hatchback", "2000s"): {
        "car_name": "Renault Clio V6 Phase 2",
        "dims": (3.841, 1.830, 1.356, 2.510, 0.125),
        "hood_ratio": 0.24, "cabin_ratio": 0.60, "deck_ratio": 0.16, "fastback_rake": 22,
        "front_grille": "renault_rhombus_split", "headlights": "projector_twin_lenses", "aero": "massive_mid_engine_sidepods_wide_fenders",
        "color": (0.08, 0.22, 0.65, 1.0), # Illiade Blue Metallic
    },
    ("hatchback", "2010s"): {
        "car_name": "Ford Focus RS Mk3",
        "dims": (4.390, 1.823, 1.470, 2.648, 0.120),
        "hood_ratio": 0.29, "cabin_ratio": 0.56, "deck_ratio": 0.15, "fastback_rake": 25,
        "front_grille": "ford_trapezoid_mesh", "headlights": "bixenon_led_brows", "aero": "functional_biplane_rear_wing_twin_diffusers",
        "color": (0.06, 0.45, 0.85, 1.0), # Nitrous Blue Quad-Coat
    },
    ("hatchback", "2020s"): {
        "car_name": "Toyota GR Yaris",
        "dims": (3.995, 1.805, 1.455, 2.560, 0.124),
        "hood_ratio": 0.27, "cabin_ratio": 0.58, "deck_ratio": 0.15, "fastback_rake": 28,
        "front_grille": "toyota_gr_matrix_mesh", "headlights": "triple_led_projector", "aero": "carbon_composite_roof_widebody_haunches",
        "color": (0.85, 0.05, 0.08, 1.0), # Emotional Red II / Pure White
    },
    ("hatchback", "future"): {
        "car_name": "Hyundai N Vision 74",
        "dims": (4.952, 1.995, 1.331, 2.905, 0.110),
        "hood_ratio": 0.32, "cabin_ratio": 0.52, "deck_ratio": 0.16, "fastback_rake": 30,
        "front_grille": "parametric_pixel_intake", "headlights": "quad_pixel_led", "aero": "massive_cyberpunk_swan_neck_wing_side_channels",
        "color": (0.16, 0.18, 0.20, 1.0), # Stealth Dark Titanium
    },

    # -------------------------------------------------------------------------
    # 3. COUPE (2-Door Fixed-Roof Aerodynamic Silhouette)
    # -------------------------------------------------------------------------
    ("coupe", "1970s"): {
        "car_name": "Datsun 240Z",
        "dims": (4.140, 1.630, 1.280, 2.305, 0.135),
        "hood_ratio": 0.40, "cabin_ratio": 0.42, "deck_ratio": 0.18, "fastback_rake": 28,
        "front_grille": "sugar_scoop_recessed", "headlights": "round_recessed_buckets", "aero": "ducktail_rear_spoiler_front_chin",
        "color": (0.88, 0.42, 0.08, 1.0), # Safari Gold / Monte Carlo Red
    },
    ("coupe", "1980s"): {
        "car_name": "Audi Quattro",
        "dims": (4.404, 1.722, 1.346, 2.524, 0.130),
        "hood_ratio": 0.36, "cabin_ratio": 0.46, "deck_ratio": 0.18, "fastback_rake": 26,
        "front_grille": "audi_4_rings_black_mesh", "headlights": "dual_rectangular_sealed", "aero": "boxy_blistered_rally_fenders_bootlid_wing",
        "color": (0.92, 0.08, 0.10, 1.0), # Mars Red / Tornado Red
    },
    ("coupe", "1990s"): {
        "car_name": "Toyota Supra A80",
        "dims": (4.520, 1.810, 1.275, 2.550, 0.120),
        "hood_ratio": 0.38, "cabin_ratio": 0.44, "deck_ratio": 0.18, "fastback_rake": 30,
        "front_grille": "large_central_intercooler_mouth", "headlights": "triple_polycarbonate_pod", "aero": "iconic_high_hoop_rear_spoiler",
        "color": (0.85, 0.06, 0.08, 1.0), # Renaissance Red
    },
    ("coupe", "2000s"): {
        "car_name": "Nissan Skyline GT-R (R34) / GT-R (R35)",
        "dims": (4.655, 1.895, 1.370, 2.780, 0.110),
        "hood_ratio": 0.35, "cabin_ratio": 0.46, "deck_ratio": 0.19, "fastback_rake": 30,
        "front_grille": "gtr_aeroblade_bumper", "headlights": "lightning_vertical_lenses", "aero": "quad_round_afterburner_tails_carbon_diffuser",
        "color": (0.75, 0.78, 0.82, 1.0), # Ultimate Silver 4-stage
    },
    ("coupe", "2010s"): {
        "car_name": "BMW M4 GTS (F82)",
        "dims": (4.698, 1.870, 1.383, 2.812, 0.105),
        "hood_ratio": 0.36, "cabin_ratio": 0.46, "deck_ratio": 0.18, "fastback_rake": 28,
        "front_grille": "bmw_m_double_slat_black", "headlights": "adaptive_led_iconic_rings", "aero": "acid_orange_splitter_carbon_wing",
        "color": (0.28, 0.30, 0.32, 1.0), # Frozen Dark Grey Metallic
    },
    ("coupe", "2020s"): {
        "car_name": "Maserati MC20",
        "dims": (4.669, 1.965, 1.224, 2.700, 0.110),
        "hood_ratio": 0.28, "cabin_ratio": 0.48, "deck_ratio": 0.24, "fastback_rake": 32,
        "front_grille": "low_slung_trident_mouth", "headlights": "slender_led_projector", "aero": "butterfly_doors_carbon_undertray",
        "color": (0.92, 0.94, 0.98, 1.0), # Bianco Audace
    },
    ("coupe", "future"): {
        "car_name": "Polestar Synergy Concept",
        "dims": (4.560, 2.020, 1.070, 2.800, 0.085),
        "hood_ratio": 0.24, "cabin_ratio": 0.50, "deck_ratio": 0.26, "fastback_rake": 38,
        "front_grille": "flow_through_front_splitter", "headlights": "dual_blade_laser_optics", "aero": "canopy_glass_floating_aerofoils",
        "color": (0.95, 0.95, 0.96, 1.0), # Ultra Satin White
    },

    # -------------------------------------------------------------------------
    # 4. SUPERCAR (Mid-Engine Exotic Lightweight Sculpture)
    # -------------------------------------------------------------------------
    ("supercar", "1970s"): {
        "car_name": "Lamborghini Countach LP400",
        "dims": (4.140, 1.890, 1.070, 2.450, 0.105),
        "hood_ratio": 0.22, "cabin_ratio": 0.44, "deck_ratio": 0.34, "fastback_rake": 36,
        "front_grille": "low_wedge_splitter", "headlights": "pop_up_dual_wedge", "aero": "scissor_doors_periscopio_roof_naca_ducts",
        "color": (0.92, 0.78, 0.05, 1.0), # Giallo Fly Yellow
    },
    ("supercar", "1980s"): {
        "car_name": "Ferrari F40",
        "dims": (4.358, 1.970, 1.124, 2.450, 0.100),
        "hood_ratio": 0.26, "cabin_ratio": 0.40, "deck_ratio": 0.34, "fastback_rake": 34,
        "front_grille": "twin_naca_louvred_bumper", "headlights": "pop_up_plus_lexan_driving", "aero": "massive_integrated_rear_wing_lexan_slats",
        "color": (0.86, 0.05, 0.06, 1.0), # Rosso Corsa
    },
    ("supercar", "1990s"): {
        "car_name": "McLaren F1",
        "dims": (4.287, 1.820, 1.140, 2.718, 0.100),
        "hood_ratio": 0.24, "cabin_ratio": 0.48, "deck_ratio": 0.28, "fastback_rake": 32,
        "front_grille": "low_aero_nostril_intakes", "headlights": "quad_polycarbonate_pods", "aero": "central_driver_seat_dihedral_doors_roof_scoop",
        "color": (0.65, 0.68, 0.72, 1.0), # Magnesium Silver
    },
    ("supercar", "2000s"): {
        "car_name": "Ford GT (2005)",
        "dims": (4.643, 1.953, 1.125, 2.710, 0.105),
        "hood_ratio": 0.28, "cabin_ratio": 0.44, "deck_ratio": 0.28, "fastback_rake": 30,
        "front_grille": "dual_hood_cooling_nostrils", "headlights": "modernized_vertical_projector", "aero": "cantilever_doors_rear_diffuser",
        "color": (0.08, 0.22, 0.72, 1.0), # Midnight Blue with White Le Mans Stripes
    },
    ("supercar", "2010s"): {
        "car_name": "Ferrari 458 Italia",
        "dims": (4.527, 1.937, 1.213, 2.650, 0.100),
        "hood_ratio": 0.26, "cabin_ratio": 0.46, "deck_ratio": 0.28, "fastback_rake": 32,
        "front_grille": "aeroelastic_winglets_mouth", "headlights": "swept_back_led_fender_strips", "aero": "glass_engine_bonnet_triple_exhaust",
        "color": (0.88, 0.06, 0.08, 1.0), # Rosso Scuderia
    },
    ("supercar", "2020s"): {
        "car_name": "Lamborghini Revuelto",
        "dims": (4.947, 2.033, 1.160, 2.779, 0.095),
        "hood_ratio": 0.26, "cabin_ratio": 0.46, "deck_ratio": 0.28, "fastback_rake": 34,
        "front_grille": "y_shaped_aerodynamic_channels", "headlights": "y_blade_drl_projectors", "aero": "flying_buttress_exposed_v12_active_wing",
        "color": (0.94, 0.35, 0.05, 1.0), # Arancio Apodis Orange
    },
    ("supercar", "future"): {
        "car_name": "McMurtry Spéirling",
        "dims": (3.500, 1.700, 1.020, 2.000, 0.060),
        "hood_ratio": 0.22, "cabin_ratio": 0.50, "deck_ratio": 0.28, "fastback_rake": 36,
        "front_grille": "vacuum_fan_ground_effect_shroud", "headlights": "narrow_matrix_led_bars", "aero": "twin_downforce_fans_active_skirt_seals",
        "color": (0.08, 0.09, 0.10, 1.0), # Pure Carbon Stealth
    },

    # -------------------------------------------------------------------------
    # 5. HYPERCAR (Pinnacle Carbon Monocoque Megawatt Platform)
    # -------------------------------------------------------------------------
    ("hypercar", "1970s"): {
        "car_name": "Porsche 917 Living Legend",
        "dims": (4.780, 2.020, 1.100, 2.300, 0.090),
        "hood_ratio": 0.22, "cabin_ratio": 0.44, "deck_ratio": 0.34, "fastback_rake": 36,
        "front_grille": "low_drag_endurance_prow", "headlights": "dual_vertical_endurance_clusters", "aero": "longtail_speedster_canopy",
        "color": (0.88, 0.05, 0.06, 1.0), # Salzburg Red & White #23
    },
    ("hypercar", "1980s"): {
        "car_name": "Porsche 959",
        "dims": (4.260, 1.840, 1.280, 2.272, 0.120),
        "hood_ratio": 0.32, "cabin_ratio": 0.44, "deck_ratio": 0.24, "fastback_rake": 28,
        "front_grille": "flush_fender_integrated_cooling", "headlights": "faired_in_911_projectors", "aero": "integrated_rear_whale_tail_awd_aerobody",
        "color": (0.80, 0.82, 0.86, 1.0), # Polar Silver Metallic
    },
    ("hypercar", "1990s"): {
        "car_name": "Mercedes-Benz CLK GTR",
        "dims": (4.855, 1.950, 1.164, 2.670, 0.085),
        "hood_ratio": 0.28, "cabin_ratio": 0.40, "deck_ratio": 0.32, "fastback_rake": 32,
        "front_grille": "mercedes_sl_four_lamp_facade", "headlights": "twin_oval_projector_lenses", "aero": "gt1_chassis_roof_snorkel_massive_rear_wing",
        "color": (0.75, 0.77, 0.80, 1.0), # Brilliant Silver Metallic
    },
    ("hypercar", "2000s"): {
        "car_name": "Bugatti Veyron 16.4",
        "dims": (4.462, 1.998, 1.204, 2.710, 0.100),
        "hood_ratio": 0.26, "cabin_ratio": 0.44, "deck_ratio": 0.30, "fastback_rake": 30,
        "front_grille": "bugatti_horseshoe_polished", "headlights": "quad_projector_matrix", "aero": "dual_roof_air_scoops_active_hydraulic_airbrake",
        "color": (0.08, 0.12, 0.22, 1.0), # Two-Tone French Racing Blue & Black
    },
    ("hypercar", "2010s"): {
        "car_name": "Porsche 918 Spyder",
        "dims": (4.643, 1.940, 1.167, 2.730, 0.095),
        "hood_ratio": 0.28, "cabin_ratio": 0.44, "deck_ratio": 0.28, "fastback_rake": 32,
        "front_grille": "quad_point_aero_mesh", "headlights": "led_matrix_projectors", "aero": "top_exit_inconel_exhaust_active_rear_wing",
        "color": (0.78, 0.80, 0.84, 1.0), # Liquid Metal Silver
    },
    ("hypercar", "2020s"): {
        "car_name": "Bugatti Chiron Pur Sport",
        "dims": (4.544, 2.038, 1.212, 2.711, 0.090),
        "hood_ratio": 0.28, "cabin_ratio": 0.44, "deck_ratio": 0.28, "fastback_rake": 32,
        "front_grille": "horseshoe_enlarged_splitters", "headlights": "quad_gem_ice_cube_leds", "aero": "fixed_1_9m_carbon_wing_magnesium_wheels",
        "color": (0.05, 0.55, 0.90, 1.0), # Jaune Molsheim / French Blue
    },
    ("hypercar", "future"): {
        "car_name": "Koenigsegg Jesko Attack",
        "dims": (4.610, 2.030, 1.210, 2.700, 0.085),
        "hood_ratio": 0.25, "cabin_ratio": 0.47, "deck_ratio": 0.28, "fastback_rake": 34,
        "front_grille": "active_front_underbody_flaps", "headlights": "integrated_vortex_led_blades", "aero": "top_mounted_active_swan_neck_wing_diffuser",
        "color": (0.92, 0.94, 0.96, 1.0), # Crystal White Pearl with Orange Accents
    },

    # -------------------------------------------------------------------------
    # 6. RACE_FORMULA (Open-Wheel Single-Seater High Downforce Archetype)
    # -------------------------------------------------------------------------
    ("race_formula", "1970s"): {
        "car_name": "Lotus 79 (Ground Effect F1)",
        "dims": (4.420, 2.150, 0.950, 2.743, 0.045),
        "hood_ratio": 0.40, "cabin_ratio": 0.25, "deck_ratio": 0.35, "fastback_rake": 15,
        "front_grille": "chisel_nose_cone", "headlights": "none_cockpit_only", "aero": "sidepod_venturi_ground_effect_skirts_wide_rear_wing",
        "color": (0.05, 0.05, 0.05, 1.0), # John Player Special Black & Gold
    },
    ("race_formula", "1980s"): {
        "car_name": "McLaren MP4/4 (1988)",
        "dims": (4.394, 2.134, 0.940, 2.875, 0.040),
        "hood_ratio": 0.42, "cabin_ratio": 0.24, "deck_ratio": 0.34, "fastback_rake": 18,
        "front_grille": "needle_nose_air_scoops", "headlights": "none_cockpit_only", "aero": "ultra_low_cockpit_twin_turbo_sidepods_wide_cascade_wing",
        "color": (0.95, 0.95, 0.95, 1.0), # Marlboro Red & White
    },
    ("race_formula", "1990s"): {
        "car_name": "Williams FW14B (Active Suspension F1)",
        "dims": (4.450, 2.140, 0.960, 2.921, 0.040),
        "hood_ratio": 0.44, "cabin_ratio": 0.24, "deck_ratio": 0.32, "fastback_rake": 20,
        "front_grille": "raised_droop_nose", "headlights": "none_cockpit_only", "aero": "airbox_snorkel_curved_sidepod_bargeboards",
        "color": (0.08, 0.18, 0.55, 1.0), # Canon Yellow, Blue & White
    },
    ("race_formula", "2000s"): {
        "car_name": "Ferrari F2004",
        "dims": (4.545, 1.796, 0.959, 3.050, 0.035),
        "hood_ratio": 0.45, "cabin_ratio": 0.22, "deck_ratio": 0.33, "fastback_rake": 22,
        "front_grille": "stepped_high_nose_twin_keel", "headlights": "none_cockpit_only", "aero": "chimney_stacks_flip_ups_periscope_exhaust",
        "color": (0.88, 0.04, 0.05, 1.0), # Rosso Scuderia
    },
    ("race_formula", "2010s"): {
        "car_name": "Red Bull RB9 (Blown Diffuser F1)",
        "dims": (5.000, 1.800, 0.950, 3.400, 0.035),
        "hood_ratio": 0.46, "cabin_ratio": 0.20, "deck_ratio": 0.34, "fastback_rake": 24,
        "front_grille": "vanity_panel_high_nose", "headlights": "none_cockpit_only", "aero": "blown_diffuser_exhaust_complex_front_cascade_wings",
        "color": (0.05, 0.08, 0.28, 1.0), # Matte Midnight Blue & Yellow
    },
    ("race_formula", "2020s"): {
        "car_name": "Red Bull RB19 (Ground Effect F1)",
        "dims": (5.500, 2.000, 0.950, 3.600, 0.035),
        "hood_ratio": 0.48, "cabin_ratio": 0.18, "deck_ratio": 0.34, "fastback_rake": 26,
        "front_grille": "narrow_low_slung_nosecone", "headlights": "none_cockpit_only", "aero": "halo_titanium_undercut_sidepod_venturi_tunnels_drs",
        "color": (0.06, 0.08, 0.24, 1.0), # Matte Oracle Navy Blue
    },
    ("race_formula", "future"): {
        "car_name": "Formula E Gen3 Evo",
        "dims": (5.016, 1.700, 1.023, 2.970, 0.045),
        "hood_ratio": 0.42, "cabin_ratio": 0.22, "deck_ratio": 0.36, "fastback_rake": 30,
        "front_grille": "aerodynamic_wedge_nose", "headlights": "recessed_led_winglet_strips", "aero": "delta_wing_chassis_open_wheel_wake_deflectors",
        "color": (0.12, 0.14, 0.18, 1.0), # Stealth Carbon with Electric Cyan Accents
    },

    # -------------------------------------------------------------------------
    # 7. GT3_RACING (Homologated Widebody Endurance Racing Machine)
    # -------------------------------------------------------------------------
    ("gt3_racing", "1970s"): {
        "car_name": "Porsche 911 Carrera RSR 3.0",
        "dims": (4.235, 1.850, 1.300, 2.272, 0.090),
        "hood_ratio": 0.34, "cabin_ratio": 0.44, "deck_ratio": 0.22, "fastback_rake": 28,
        "front_grille": "large_front_oil_cooler_inlet", "headlights": "round_sealed_beam", "aero": "massive_mary_stuart_rear_ducktail_wrap_flares",
        "color": (0.92, 0.92, 0.92, 1.0), # Grand Prix White with Blue Decals
    },
    ("gt3_racing", "1980s"): {
        "car_name": "BMW M3 E30 Sport Evolution",
        "dims": (4.345, 1.680, 1.370, 2.565, 0.100),
        "hood_ratio": 0.32, "cabin_ratio": 0.46, "deck_ratio": 0.22, "fastback_rake": 20,
        "front_grille": "bmw_m_black_kidneys", "headlights": "quad_round_projector", "aero": "box_flares_adjustable_front_splitter_rear_gurney",
        "color": (0.86, 0.08, 0.10, 1.0), # Misano Red / Brilliant Red
    },
    ("gt3_racing", "1990s"): {
        "car_name": "Dodge Viper GTS-R",
        "dims": (4.488, 1.924, 1.194, 2.443, 0.080),
        "hood_ratio": 0.42, "cabin_ratio": 0.38, "deck_ratio": 0.20, "fastback_rake": 28,
        "front_grille": "crosshair_mouth_driving_lights", "headlights": "twin_polycarbonate_faired", "aero": "double_bubble_roof_huge_gt_wing_side_exhaust",
        "color": (0.08, 0.18, 0.65, 1.0), # Viper GTS Blue with Twin White Racing Stripes
    },
    ("gt3_racing", "2000s"): {
        "car_name": "Aston Martin DBR9",
        "dims": (4.687, 1.978, 1.175, 2.740, 0.075),
        "hood_ratio": 0.38, "cabin_ratio": 0.42, "deck_ratio": 0.20, "fastback_rake": 26,
        "front_grille": "aston_v12_slatted_mouth", "headlights": "bixenon_projector_lenses", "aero": "carbon_front_splitter_fender_louvres_gt_wing",
        "color": (0.12, 0.45, 0.32, 1.0), # Aston Martin Racing Green
    },
    ("gt3_racing", "2010s"): {
        "car_name": "Porsche 911 GT3 R (991)",
        "dims": (4.604, 2.040, 1.250, 2.463, 0.070),
        "hood_ratio": 0.32, "cabin_ratio": 0.44, "deck_ratio": 0.24, "fastback_rake": 28,
        "front_grille": "central_radiator_air_extractor", "headlights": "led_endurance_yellow_markers", "aero": "swan_neck_rear_wing_fender_louvres_air_jacks",
        "color": (0.92, 0.94, 0.96, 1.0), # Motorsport Pure White
    },
    ("gt3_racing", "2020s"): {
        "car_name": "Mercedes-AMG GT3 Evo",
        "dims": (4.746, 2.049, 1.238, 2.630, 0.065),
        "hood_ratio": 0.38, "cabin_ratio": 0.42, "deck_ratio": 0.20, "fastback_rake": 28,
        "front_grille": "panamericana_vertical_slats", "headlights": "high_intensity_led_projectors", "aero": "extended_carbon_front_splitter_flics_swan_wing",
        "color": (0.65, 0.68, 0.72, 1.0), # Selenite Grey Metallic with Yellow Accents
    },
    ("gt3_racing", "future"): {
        "car_name": "Ferrari 499P Le Mans Hypercar",
        "dims": (5.000, 2.000, 1.050, 3.150, 0.060),
        "hood_ratio": 0.26, "cabin_ratio": 0.38, "deck_ratio": 0.36, "fastback_rake": 32,
        "front_grille": "lmh_flow_through_splitter", "headlights": "horizontal_laser_blade_strip", "aero": "central_shark_fin_dual_horizontal_wings_venturis",
        "color": (0.85, 0.04, 0.06, 1.0), # Rosso Le Mans with Giallo Modena Accents
    },
}

def get_blueprint_for(arch_id: str, era_id: str):
    """Retrieve the exact blueprint specification for an architecture and era"""
    # Key normalization
    arch_norm = arch_id.lower().replace("-", "_")
    era_norm = era_id.lower().replace("-", "_")
    
    # Direct lookup
    if (arch_norm, era_norm) in VEHICLE_BLUEPRINTS:
        return VEHICLE_BLUEPRINTS[(arch_norm, era_norm)]
    
    # Generic fallback based on architecture dimensions and era styling rules
    return None
