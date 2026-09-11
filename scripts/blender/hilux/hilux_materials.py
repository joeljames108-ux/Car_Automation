"""
Hilux Master PBR Material Factory (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Defines 45+ Principled BSDF v2 materials with authentic physical properties.
"""

import bpy

def build_pbr_material(
    name,
    base_color,
    metallic=0.0,
    roughness=0.5,
    clearcoat=0.0,
    clearcoat_roughness=0.03,
    transmission=0.0,
    ior=1.5,
    emission=None,
    emission_strength=1.0,
    blend_method='OPAQUE',
    shadow_method='OPAQUE'
):
    """Factory helper to build or update a Principled BSDF PBR material."""
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    
    # Compatibility with Principled BSDF v1 (Blender <4.0) and v2 (Blender 4.x / 5.x)
    # Clearcoat
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = clearcoat
        if 'Coat Roughness' in bsdf.inputs:
            bsdf.inputs['Coat Roughness'].default_value = clearcoat_roughness
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat
        if 'Clearcoat Roughness' in bsdf.inputs:
            bsdf.inputs['Clearcoat Roughness'].default_value = clearcoat_roughness
            
    # Transmission
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission
        
    # IOR
    if 'IOR' in bsdf.inputs:
        bsdf.inputs['IOR'].default_value = ior
        
    # Emission
    if emission:
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emission
            bsdf.inputs['Emission Strength'].default_value = emission_strength
        elif 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = emission
            if 'Emission Strength' in bsdf.inputs:
                bsdf.inputs['Emission Strength'].default_value = emission_strength
                
    out = nodes.new(type='ShaderNodeOutputMaterial')
    mat.node_tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    
    # Transparency settings for Eevee / Viewport
    if transmission > 0.1 or blend_method != 'OPAQUE':
        if hasattr(mat, "blend_method"):
            mat.blend_method = blend_method if blend_method != 'OPAQUE' else 'BLEND'
        if hasattr(mat, "shadow_method"):
            mat.shadow_method = shadow_method if shadow_method != 'OPAQUE' else 'HASHED'
            
    return mat

class HiluxMaterials:
    """Registry holding all compiled materials for the HiLux build."""
    def __init__(self):
        self.materials = {}
        self.init_all()

    def init_all(self):
        # 1. Body Exterior Paint: 2025 Toyota Super White / Platinum Pearl (Blueprint Spec)
        self.materials["Mat_Hilux_OxideBronze"] = build_pbr_material(
            "Mat_Hilux_OxideBronze",
            (0.92, 0.93, 0.95, 1.0),
            metallic=0.06,
            roughness=0.14,
            clearcoat=1.0,
            clearcoat_roughness=0.02
        )
        
        # 1B. Metallic Bronze alternative
        self.materials["Mat_Hilux_SuperWhite"] = self.materials["Mat_Hilux_OxideBronze"]
        
        # 2. Dark Composite Trim (Fender flares, rock slider pads, mud flaps, bed caps)
        self.materials["Mat_DarkComposite_Trim"] = build_pbr_material(
            "Mat_DarkComposite_Trim",
            (0.04, 0.04, 0.04, 1.0),
            metallic=0.05,
            roughness=0.72
        )
        
        # 3. Satin Black Trim (Pillars, window frames, roof ditch moldings)
        self.materials["Mat_SatinBlack_Trim"] = build_pbr_material(
            "Mat_SatinBlack_Trim",
            (0.025, 0.025, 0.025, 1.0),
            metallic=0.20,
            roughness=0.45
        )
        
        # 4. Dark Chrome Grille Accent Bar
        self.materials["Mat_DarkChrome_Grille"] = build_pbr_material(
            "Mat_DarkChrome_Grille",
            (0.35, 0.35, 0.38, 1.0),
            metallic=0.92,
            roughness=0.15
        )
        
        # 5. Piano Black Grille Slats / Louvers
        self.materials["Mat_PianoBlack_Grille"] = build_pbr_material(
            "Mat_PianoBlack_Grille",
            (0.015, 0.015, 0.018, 1.0),
            metallic=0.10,
            roughness=0.08,
            clearcoat=0.9
        )
        
        # 6. Optical Clear Glass (Windshield, front door windows)
        self.materials["Mat_OpticalGlass_Clear"] = build_pbr_material(
            "Mat_OpticalGlass_Clear",
            (0.10, 0.12, 0.14, 1.0),
            transmission=0.20,
            roughness=0.02,
            ior=1.52,
            clearcoat=1.0,
            blend_method='BLEND'
        )
        
        # 7. Optical Privacy Tint Glass (Rear doors, rear cabin window)
        self.materials["Mat_OpticalGlass_Privacy"] = build_pbr_material(
            "Mat_OpticalGlass_Privacy",
            (0.06, 0.07, 0.08, 1.0),
            transmission=0.12,
            roughness=0.02,
            ior=1.52,
            clearcoat=1.0,
            blend_method='BLEND'
        )
        
        # 8. Headlamp Outer Lens (Polycarbonate)
        self.materials["Mat_OpticalGlass_Headlamp"] = build_pbr_material(
            "Mat_OpticalGlass_Headlamp",
            (0.98, 0.99, 1.0, 1.0),
            transmission=0.98,
            roughness=0.01,
            ior=1.58,
            blend_method='BLEND'
        )
        
        # 9. Taillamp Outer Lens (Deep Red Polycarbonate)
        self.materials["Mat_OpticalGlass_Taillamp"] = build_pbr_material(
            "Mat_OpticalGlass_Taillamp",
            (0.85, 0.02, 0.02, 1.0),
            transmission=0.88,
            roughness=0.03,
            ior=1.55,
            blend_method='BLEND'
        )
        
        # 10. LED Headlight DRL Brow
        self.materials["Mat_LED_Headlight_DRL"] = build_pbr_material(
            "Mat_LED_Headlight_DRL",
            (1.0, 1.0, 1.0, 1.0),
            emission=(1.0, 1.0, 1.0, 1.0),
            emission_strength=12.0
        )
        
        # 11. LED Projector High/Low Beam
        self.materials["Mat_LED_Projector_Beam"] = build_pbr_material(
            "Mat_LED_Projector_Beam",
            (0.92, 0.96, 1.0, 1.0),
            emission=(0.95, 0.98, 1.0, 1.0),
            emission_strength=25.0
        )
        
        # 12. LED Taillight Stop / Brake Light Pipe
        self.materials["Mat_LED_Taillight_Stop"] = build_pbr_material(
            "Mat_LED_Taillight_Stop",
            (1.0, 0.02, 0.02, 1.0),
            emission=(1.0, 0.01, 0.01, 1.0),
            emission_strength=15.0
        )
        
        # 13. LED Reverse Lamp
        self.materials["Mat_LED_Reverse"] = build_pbr_material(
            "Mat_LED_Reverse",
            (0.95, 0.95, 0.95, 1.0),
            emission=(1.0, 1.0, 1.0, 1.0),
            emission_strength=8.0
        )
        
        # 14. LED Turn Signal Amber
        self.materials["Mat_LED_TurnAmber"] = build_pbr_material(
            "Mat_LED_TurnAmber",
            (1.0, 0.45, 0.02, 1.0),
            emission=(1.0, 0.40, 0.01, 1.0),
            emission_strength=10.0
        )
        
        # 15. Chrome Parabolic Reflector
        self.materials["Mat_Reflector_Chrome"] = build_pbr_material(
            "Mat_Reflector_Chrome",
            (0.95, 0.95, 0.95, 1.0),
            metallic=0.98,
            roughness=0.06
        )
        
        # 16. Black Plastic Lamp Housing
        self.materials["Mat_BlackPlastic_Housing"] = build_pbr_material(
            "Mat_BlackPlastic_Housing",
            (0.03, 0.03, 0.03, 1.0),
            metallic=0.02,
            roughness=0.80
        )
        
        # 17. Hydroformed Steel Chassis Frame
        self.materials["Mat_SteelChassis_Black"] = build_pbr_material(
            "Mat_SteelChassis_Black",
            (0.05, 0.05, 0.06, 1.0),
            metallic=0.82,
            roughness=0.45
        )
        
        # 18. Machined Alloy Wheel Face
        self.materials["Mat_Alloy_Machined"] = build_pbr_material(
            "Mat_Alloy_Machined",
            (0.86, 0.88, 0.90, 1.0),
            metallic=0.95,
            roughness=0.16,
            clearcoat=0.6
        )
        
        # 19. Dark Gunmetal Wheel Pocket
        self.materials["Mat_Alloy_DarkGunmetal"] = build_pbr_material(
            "Mat_Alloy_DarkGunmetal",
            (0.16, 0.17, 0.18, 1.0),
            metallic=0.90,
            roughness=0.32
        )
        
        # 20. Tire Rubber (Tread & Sidewall)
        self.materials["Mat_Tire_Rubber"] = build_pbr_material(
            "Mat_Tire_Rubber",
            (0.045, 0.045, 0.045, 1.0),
            metallic=0.00,
            roughness=0.88
        )
        
        # 21. Ventilated Brake Rotor
        self.materials["Mat_Brake_Rotor_Vented"] = build_pbr_material(
            "Mat_Brake_Rotor_Vented",
            (0.55, 0.56, 0.58, 1.0),
            metallic=0.85,
            roughness=0.28
        )
        
        # 22. Brake Caliper Cast
        self.materials["Mat_Brake_Caliper_Cast"] = build_pbr_material(
            "Mat_Brake_Caliper_Cast",
            (0.20, 0.21, 0.22, 1.0),
            metallic=0.70,
            roughness=0.55
        )
        
        # 23. Rear Heavy Duty Brake Drum
        self.materials["Mat_Brake_Drum_Cast"] = build_pbr_material(
            "Mat_Brake_Drum_Cast",
            (0.15, 0.15, 0.16, 1.0),
            metallic=0.65,
            roughness=0.60
        )
        
        # 24. Front Coil Spring Powdercoat
        self.materials["Mat_Suspension_Coil"] = build_pbr_material(
            "Mat_Suspension_Coil",
            (0.08, 0.09, 0.10, 1.0),
            metallic=0.80,
            roughness=0.25
        )
        
        # 25. Tokico / Bilstein Shock Body Blue
        self.materials["Mat_Suspension_ShockBody"] = build_pbr_material(
            "Mat_Suspension_ShockBody",
            (0.05, 0.25, 0.65, 1.0),
            metallic=0.85,
            roughness=0.28
        )
        
        # 26. Rear Leaf Spring Pack Steel
        self.materials["Mat_Suspension_LeafPack"] = build_pbr_material(
            "Mat_Suspension_LeafPack",
            (0.12, 0.12, 0.13, 1.0),
            metallic=0.75,
            roughness=0.52
        )
        
        # 27. Cast Steel Control Arms & Knuckle
        self.materials["Mat_Suspension_CastArm"] = build_pbr_material(
            "Mat_Suspension_CastArm",
            (0.18, 0.18, 0.19, 1.0),
            metallic=0.80,
            roughness=0.48
        )
        
        # 28. Differential Pumpkin & Axle Tube
        self.materials["Mat_Differential_CastIron"] = build_pbr_material(
            "Mat_Differential_CastIron",
            (0.10, 0.10, 0.11, 1.0),
            metallic=0.70,
            roughness=0.62
        )
        
        # 29. Steel Propeller Shafts
        self.materials["Mat_Driveshaft_Steel"] = build_pbr_material(
            "Mat_Driveshaft_Steel",
            (0.30, 0.32, 0.34, 1.0),
            metallic=0.88,
            roughness=0.35
        )
        
        # 30. 2.8L Diesel Engine Block Cast Aluminum
        self.materials["Mat_EngineBlock_CastAlum"] = build_pbr_material(
            "Mat_EngineBlock_CastAlum",
            (0.62, 0.64, 0.66, 1.0),
            metallic=0.90,
            roughness=0.40
        )
        
        # 31. Engine Valve Cover D-4D
        self.materials["Mat_EngineHead_Cover"] = build_pbr_material(
            "Mat_EngineHead_Cover",
            (0.05, 0.05, 0.05, 1.0),
            metallic=0.10,
            roughness=0.65
        )
        
        # 32. Turbocharger Turbine Inconel
        self.materials["Mat_Turbocharger_Inconel"] = build_pbr_material(
            "Mat_Turbocharger_Inconel",
            (0.42, 0.38, 0.32, 1.0),
            metallic=0.85,
            roughness=0.42
        )
        
        # 33. Exhaust Downpipe & Stainless Muffler
        self.materials["Mat_Exhaust_Stainless"] = build_pbr_material(
            "Mat_Exhaust_Stainless",
            (0.58, 0.55, 0.50, 1.0),
            metallic=0.92,
            roughness=0.30
        )
        
        # 34. Exhaust Polished Tip
        self.materials["Mat_Exhaust_PolishedTip"] = build_pbr_material(
            "Mat_Exhaust_PolishedTip",
            (0.88, 0.88, 0.90, 1.0),
            metallic=0.98,
            roughness=0.08
        )
        
        # 35. Aluminum Radiator Core
        self.materials["Mat_Radiator_Alum"] = build_pbr_material(
            "Mat_Radiator_Alum",
            (0.70, 0.72, 0.74, 1.0),
            metallic=0.94,
            roughness=0.32
        )
        
        # 36. Front Skid Plate Stamped Aluminum
        self.materials["Mat_SkidPlate_Alum"] = build_pbr_material(
            "Mat_SkidPlate_Alum",
            (0.75, 0.76, 0.78, 1.0),
            metallic=0.92,
            roughness=0.36
        )
        
        # 37. Textured Spray-on Bedliner
        self.materials["Mat_BedLiner_Rough"] = build_pbr_material(
            "Mat_BedLiner_Rough",
            (0.035, 0.035, 0.035, 1.0),
            metallic=0.02,
            roughness=0.92
        )
        
        # 38. Interior Black Leather Bolsters & Trim
        self.materials["Mat_Interior_LeatherBlack"] = build_pbr_material(
            "Mat_Interior_LeatherBlack",
            (0.08, 0.08, 0.08, 1.0),
            metallic=0.02,
            roughness=0.68
        )
        
        # 39. Interior Fabric Charcoal Seat Inserts
        self.materials["Mat_Interior_FabricCharcoal"] = build_pbr_material(
            "Mat_Interior_FabricCharcoal",
            (0.12, 0.12, 0.13, 1.0),
            metallic=0.00,
            roughness=0.85
        )
        
        # 40. Interior Soft-touch Dashboard
        self.materials["Mat_Interior_DashboardBlack"] = build_pbr_material(
            "Mat_Interior_DashboardBlack",
            (0.05, 0.05, 0.05, 1.0),
            metallic=0.01,
            roughness=0.78
        )
        
        # 41. Interior Satin Silver Accent Trim
        self.materials["Mat_Interior_SilverTrim"] = build_pbr_material(
            "Mat_Interior_SilverTrim",
            (0.80, 0.82, 0.84, 1.0),
            metallic=0.92,
            roughness=0.22
        )
        
        # 42. Touchscreen & Gauge Display
        self.materials["Mat_Interior_ScreenDisplay"] = build_pbr_material(
            "Mat_Interior_ScreenDisplay",
            (0.01, 0.02, 0.04, 1.0),
            emission=(0.10, 0.25, 0.60, 1.0),
            emission_strength=2.2
        )
        
        # 43. Mirror Reflective Chrome
        self.materials["Mat_Mirror_Chrome"] = build_pbr_material(
            "Mat_Mirror_Chrome",
            (0.96, 0.96, 0.96, 1.0),
            metallic=1.0,
            roughness=0.01
        )
        
        # 44. Badge Chrome Emblem
        self.materials["Mat_Emblem_Chrome"] = build_pbr_material(
            "Mat_Emblem_Chrome",
            (0.92, 0.92, 0.94, 1.0),
            metallic=0.98,
            roughness=0.05
        )
        
        # 45. Zinc-Plated Hardware Bolts
        self.materials["Mat_Hardware_ZincBolt"] = build_pbr_material(
            "Mat_Hardware_ZincBolt",
            (0.50, 0.52, 0.55, 1.0),
            metallic=0.92,
            roughness=0.30
        )
        
        # 46. Aero Sport Bar Dark Composite
        self.materials["Mat_SportBar_Composite"] = build_pbr_material(
            "Mat_SportBar_Composite",
            (0.03, 0.03, 0.035, 1.0),
            metallic=0.15,
            roughness=0.55
        )
        
        print(f"[HILUX] Initialized {len(self.materials)} PBR materials.")

    def get(self, name):
        return self.materials.get(name) or bpy.data.materials.get(name)
