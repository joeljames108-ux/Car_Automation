"""
Sedan Master PBR Material Factory (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Shaders
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
    alpha=1.0,
    emission=None,
    emission_strength=1.0,
    specular=0.5
):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    out = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    mat.node_tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if 'Alpha' in bsdf.inputs:
        bsdf.inputs['Alpha'].default_value = alpha
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = specular
    elif 'Specular' in bsdf.inputs:
        bsdf.inputs['Specular'].default_value = specular
        
    # Clearcoat support for Principled BSDF v1 and v2
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = clearcoat
        if 'Coat Roughness' in bsdf.inputs:
            bsdf.inputs['Coat Roughness'].default_value = clearcoat_roughness
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat
        if 'Clearcoat Roughness' in bsdf.inputs:
            bsdf.inputs['Clearcoat Roughness'].default_value = clearcoat_roughness
            
    # Transmission / Glass
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission
        
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
                
    if transmission > 0.05 or alpha < 1.0:
        if hasattr(mat, "blend_method"):
            mat.blend_method = 'BLEND'
            
    return mat

class SedanMaterials:
    def __init__(self):
        self.materials = {}
        self.init_all()

    def init_all(self):
        # 1. Primary Exterior Paint: Executive Tanzanite Blue Metallic
        self.materials["paint"] = build_pbr_material(
            "Mat_Sedan_Paint_TanzaniteBlue",
            (0.010, 0.040, 0.150, 1.0),
            metallic=0.94,
            roughness=0.07,
            clearcoat=1.0,
            clearcoat_roughness=0.012,
            specular=0.9
        )
        
        # 2. Dark Carbon Fiber Aero Trim
        self.materials["carbon"] = build_pbr_material(
            "Mat_Sedan_Carbon_Fiber_Satin",
            (0.025, 0.025, 0.028, 1.0),
            metallic=0.25,
            roughness=0.20,
            clearcoat=0.85,
            clearcoat_roughness=0.03
        )
        
        # 3. High Gloss Piano Black (Shadowline B-Pillars, Grille surround, Trim)
        self.materials["gloss_black"] = build_pbr_material(
            "Mat_Sedan_Piano_Gloss_Black",
            (0.006, 0.006, 0.008, 1.0),
            metallic=0.15,
            roughness=0.03,
            clearcoat=1.0
        )
        
        # 4. Matte Black Synthetic Polymer (Rocker covers, inner liners)
        self.materials["matte_black"] = build_pbr_material(
            "Mat_Sedan_Matte_Composite",
            (0.035, 0.035, 0.038, 1.0),
            metallic=0.02,
            roughness=0.75
        )
        
        # 5. Mirror Chrome / Polished Platinum
        self.materials["chrome"] = build_pbr_material(
            "Mat_Sedan_Chrome_Mirror",
            (0.96, 0.96, 0.98, 1.0),
            metallic=1.0,
            roughness=0.015,
            clearcoat=1.0
        )
        
        # 6. Optical Dielectric Glass (Windshield, Front Windows)
        self.materials["glass_clear"] = build_pbr_material(
            "Mat_Sedan_Glass_Dielectric",
            (0.92, 0.96, 1.0, 0.20),
            roughness=0.01,
            transmission=0.95,
            ior=1.52,
            alpha=0.20
        )
        
        # 7. Privacy Tint Glazing (Rear Windows, Panoramic Roof, Backlite)
        self.materials["glass_tint"] = build_pbr_material(
            "Mat_Sedan_Glass_PrivacyTint",
            (0.06, 0.08, 0.12, 0.65),
            roughness=0.01,
            transmission=0.75,
            ior=1.52,
            alpha=0.65
        )
        
        # 8. Performance Tire Radial Rubber
        self.materials["tire"] = build_pbr_material(
            "Mat_Sedan_Tire_Rubber_Radial",
            (0.022, 0.022, 0.024, 1.0),
            metallic=0.00,
            roughness=0.85
        )
        
        # 9. 20" Forged Turbine Machined Rim Alloy
        self.materials["rim_alloy"] = build_pbr_material(
            "Mat_Sedan_Forged_Rim_Alloy",
            (0.88, 0.89, 0.92, 1.0),
            metallic=0.98,
            roughness=0.09,
            clearcoat=0.9
        )
        
        # 10. Carbon-Ceramic Drilled Brake Rotors
        self.materials["rotor"] = build_pbr_material(
            "Mat_Sedan_CarbonCeramic_Rotor",
            (0.35, 0.35, 0.37, 1.0),
            metallic=0.88,
            roughness=0.28
        )
        
        # 11. Brembo Gloss Red Caliper
        self.materials["caliper"] = build_pbr_material(
            "Mat_Sedan_Brembo_Red_Caliper",
            (0.90, 0.02, 0.02, 1.0),
            metallic=0.40,
            roughness=0.08,
            clearcoat=1.0
        )
        
        # 12. Matrix LED Projector Headlamp Optics
        self.materials["led_projector"] = build_pbr_material(
            "Mat_Sedan_LED_Projector_White",
            (1.0, 1.0, 1.0, 1.0),
            roughness=0.04,
            emission=(1.0, 1.0, 1.0, 1.0),
            emission_strength=30.0
        )
        
        # 13. Ice-Blue DRL Daytime Lightguide
        self.materials["drl_ice_blue"] = build_pbr_material(
            "Mat_Sedan_DRL_Ice_Blue",
            (0.35, 0.85, 1.0, 1.0),
            roughness=0.04,
            emission=(0.35, 0.85, 1.0, 1.0),
            emission_strength=20.0
        )
        
        # 14. OLED Ruby Taillight Array
        self.materials["oled_tail"] = build_pbr_material(
            "Mat_Sedan_OLED_Ruby_Taillight",
            (1.0, 0.01, 0.01, 1.0),
            roughness=0.04,
            emission=(1.0, 0.01, 0.01, 1.0),
            emission_strength=24.0
        )
        
        # 15. LED Amber Dynamic Turn Signal
        self.materials["led_amber"] = build_pbr_material(
            "Mat_Sedan_LED_Amber_Indicator",
            (1.0, 0.50, 0.02, 1.0),
            roughness=0.05,
            emission=(1.0, 0.50, 0.02, 1.0),
            emission_strength=18.0
        )
        
        # 16. Optical Headlight Outer Lens
        self.materials["lens"] = build_pbr_material(
            "Mat_Sedan_Optical_Lens_Glass",
            (1.0, 1.0, 1.0, 0.12),
            roughness=0.005,
            transmission=0.98,
            alpha=0.12
        )
        
        # 17. Interior Nappa Leather (Charcoal / Ebony)
        self.materials["leather_charcoal"] = build_pbr_material(
            "Mat_Sedan_Nappa_Leather_Charcoal",
            (0.045, 0.045, 0.050, 1.0),
            roughness=0.55,
            specular=0.3
        )
        
        # 18. Interior Cognac Tan Leather (Contrast stitching / seat centers)
        self.materials["leather_cognac"] = build_pbr_material(
            "Mat_Sedan_Nappa_Leather_Cognac",
            (0.38, 0.18, 0.08, 1.0),
            roughness=0.52,
            specular=0.35
        )
        
        # 19. Curved Digital OLED Cockpit Displays
        self.materials["screen"] = build_pbr_material(
            "Mat_Sedan_Digital_Cockpit_Screen",
            (0.05, 0.18, 0.35, 1.0),
            roughness=0.12,
            emission=(0.08, 0.32, 0.65, 1.0),
            emission_strength=6.0
        )
        
        # 20. Titanium Quad Exhaust Tips
        self.materials["exhaust_titanium"] = build_pbr_material(
            "Mat_Sedan_Titanium_Exhaust",
            (0.68, 0.62, 0.56, 1.0),
            metallic=0.96,
            roughness=0.15,
            clearcoat=0.7
        )
        
        # 21. High Strength Structural Steel Chassis
        self.materials["chassis_steel"] = build_pbr_material(
            "Mat_Sedan_Structural_Steel",
            (0.18, 0.20, 0.22, 1.0),
            metallic=0.92,
            roughness=0.32
        )
        
        # 22. Extruded Billet Aluminum (Subframes, Wishbones, Engine Block)
        self.materials["billet_aluminum"] = build_pbr_material(
            "Mat_Sedan_Billet_Aluminum",
            (0.72, 0.74, 0.76, 1.0),
            metallic=0.95,
            roughness=0.22
        )
        
        # 23. Valve Cover Fire Red
        self.materials["engine_red"] = build_pbr_material(
            "Mat_Sedan_Engine_FireRed",
            (0.85, 0.04, 0.04, 1.0),
            metallic=0.30,
            roughness=0.25,
            clearcoat=0.8
        )
        
        # 24. Ambient Cyan LED Strip
        self.materials["ambient_cyan"] = build_pbr_material(
            "Mat_Sedan_Ambient_LED_Cyan",
            (0.10, 0.90, 1.0, 1.0),
            roughness=0.10,
            emission=(0.10, 0.90, 1.0, 1.0),
            emission_strength=12.0
        )

    def get(self, key):
        return self.materials.get(key)
