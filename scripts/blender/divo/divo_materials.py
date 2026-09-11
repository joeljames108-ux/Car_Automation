"""
Bugatti Divo PBR Material Library Factory (Blender 4.x / 5.x)
High-Fidelity Track-Focused Hypercar Procedural Architecture
"""

import bpy

class DivoMaterials:
    """Master PBR material registry for Bugatti Divo bodywork, exposed carbon, 3D OLED lights, and W16 powertrain."""
    
    def __init__(self):
        self.materials = {}
        self._init_all_materials()

    def _create_pbr_mat(self, name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, transmission=0.0, ior=1.45, emission=None, emission_strength=1.0, alpha=1.0):
        mat = bpy.data.materials.get(name)
        if mat:
            self.materials[name] = mat
            return mat
            
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        nodes.clear()
        
        bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
        bsdf.inputs['Base Color'].default_value = base_color
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Roughness'].default_value = roughness
        
        if 'Clearcoat Weight' in bsdf.inputs:
            bsdf.inputs['Clearcoat Weight'].default_value = clearcoat
        elif 'Clearcoat' in bsdf.inputs:
            bsdf.inputs['Clearcoat'].default_value = clearcoat
            
        if 'Transmission Weight' in bsdf.inputs:
            bsdf.inputs['Transmission Weight'].default_value = transmission
        elif 'Transmission' in bsdf.inputs:
            bsdf.inputs['Transmission'].default_value = transmission
            
        if 'IOR' in bsdf.inputs:
            bsdf.inputs['IOR'].default_value = ior
            
        if 'Alpha' in bsdf.inputs:
            bsdf.inputs['Alpha'].default_value = alpha
            
        if alpha < 1.0 or transmission > 0.0:
            if hasattr(mat, 'blend_method'):
                try:
                    mat.blend_method = 'BLEND'
                except Exception:
                    pass
                    
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
        self.materials[name] = mat
        return mat

    def _init_all_materials(self):
        # 1. Bugatti Divo Signature Exterior Finishes
        self.divo_titanium_grey = self._create_pbr_mat(
            "Mat_DivoMatteTitaniumGrey", (0.28, 0.30, 0.34, 1.0), # Matte Titanium Grey body shell
            metallic=0.88, roughness=0.35, clearcoat=0.40
        )
        self.divo_racing_blue = self._create_pbr_mat(
            "Mat_DivoRacingBlueTurquoise", (0.00, 0.85, 0.95, 1.0), # Divo Racing Blue / Turquoise aero accents
            metallic=0.45, roughness=0.15, clearcoat=1.00
        )
        self.carbon_gloss = self._create_pbr_mat(
            "Mat_ExposedCarbonTwill_Gloss", (0.04, 0.04, 0.05, 1.0), # 2x2 Twill High Gloss Carbon Fiber
            metallic=0.30, roughness=0.18, clearcoat=1.00
        )
        self.carbon_satin = self._create_pbr_mat(
            "Mat_ExposedCarbon_Satin", (0.03, 0.03, 0.04, 1.0), # Underbody Splitter & Diffuser Satin Carbon
            metallic=0.15, roughness=0.48
        )
        self.horseshoe_chrome = self._create_pbr_mat(
            "Mat_BugattiHorseshoeChrome", (0.92, 0.94, 0.96, 1.0), # Iconic Horseshoe Grille Bezel
            metallic=0.98, roughness=0.08
        )

        # 2. Lighting & 3D Printed Fin Optics
        self.led_headlight_crystal = self._create_pbr_mat(
            "Mat_DivoLED_HeadlightCrystal", (0.95, 0.98, 1.00, 1.0), # Ultra-slim C-blade LED projector
            metallic=0.90, roughness=0.08,
            emission=(0.95, 0.98, 1.00, 1.0), emission_strength=14.0
        )
        self.oled_taillight_fin = self._create_pbr_mat(
            "Mat_Divo3D_OLED_TaillightFin", (0.95, 0.02, 0.04, 1.0), # 3D Printed 44-Fin OLED Matrix Ruby Red
            metallic=0.50, roughness=0.10,
            emission=(1.00, 0.02, 0.03, 1.0), emission_strength=18.0
        )
        self.drl_turquoise_accent = self._create_pbr_mat(
            "Mat_DivoDRL_TurquoiseAccent", (0.00, 0.90, 1.00, 1.0), # Illuminated turquoise accent blades
            metallic=0.30, roughness=0.12,
            emission=(0.00, 0.90, 1.00, 1.0), emission_strength=8.0
        )

        # 3. Greenhouse & Canopy Glazing
        self.canopy_glass = self._create_pbr_mat(
            "Mat_HypercarCanopyGlass", (0.80, 0.90, 0.96, 1.0), # Lightweight acoustic laminated tinted glass
            metallic=0.05, roughness=0.02, transmission=0.94, ior=1.52, alpha=0.32
        )
        self.engine_bay_glass = self._create_pbr_mat(
            "Mat_W16_EngineCoverGlass", (0.88, 0.92, 0.96, 1.0), # Heat-resistant borosilicate glass
            metallic=0.05, roughness=0.02, transmission=0.95, ior=1.52, alpha=0.25
        )

        # 4. 8.0L Quad-Turbo W16 Powertrain & Quad Titanium Exhaust
        self.w16_engine_block = self._create_pbr_mat(
            "Mat_W16_BilletAluminumBlock", (0.75, 0.77, 0.80, 1.0), # Machined billet engine block & intake manifolds
            metallic=0.94, roughness=0.22
        )
        self.w16_carbon_covers = self._create_pbr_mat(
            "Mat_W16_CarbonValveCovers", (0.05, 0.05, 0.06, 1.0), # W16 1500HP carbon engine covers
            metallic=0.35, roughness=0.20, clearcoat=0.95
        )
        self.turbo_compressor = self._create_pbr_mat(
            "Mat_QuadTurboCompressorHousing", (0.82, 0.84, 0.88, 1.0), # Quad BorgWarner turbochargers
            metallic=0.95, roughness=0.18
        )
        self.titanium_exhaust = self._create_pbr_mat(
            "Mat_TitaniumQuadExhaustTips", (0.55, 0.58, 0.65, 1.0), # 3D printed titanium quad exhaust with blue heat tint
            metallic=0.96, roughness=0.25
        )

        # 5. Wheels, Brakes & Aerodynamic Blades
        self.divo_wheel_rim = self._create_pbr_mat(
            "Mat_DivoAeroForgedWheel", (0.12, 0.13, 0.15, 1.0), # Staggered forged alloy rim
            metallic=0.95, roughness=0.18, clearcoat=0.60
        )
        self.divo_wheel_turquoise = self._create_pbr_mat(
            "Mat_DivoWheelTurquoisePinstripe", (0.00, 0.85, 0.95, 1.0), # Directional aero-blade blue highlight
            metallic=0.60, roughness=0.20, clearcoat=0.80
        )
        self.pilot_sport_cup2 = self._create_pbr_mat(
            "Mat_MichelinPilotSportCup2", (0.04, 0.04, 0.045, 1.0), # Ultra-high performance track tire rubber
            metallic=0.00, roughness=0.86
        )
        self.carbon_ceramic_rotor = self._create_pbr_mat(
            "Mat_CarbonCeramicMatrixRotor", (0.22, 0.22, 0.24, 1.0), # 420mm drilled carbon ceramic disc
            metallic=0.55, roughness=0.42
        )
        self.divo_brake_caliper = self._create_pbr_mat(
            "Mat_DivoBrakeCaliperTurquoise", (0.00, 0.85, 0.95, 1.0), # Monobloc 8-piston front caliper in Divo blue
            metallic=0.40, roughness=0.15, clearcoat=0.90
        )

        # 6. Bespoke Asymmetric Alcantara/Leather Interior
        self.alcantara_grey = self._create_pbr_mat(
            "Mat_DivoAlcantaraGrey", (0.12, 0.13, 0.15, 1.0), # Driver & passenger matte Alcantara upholstery
            metallic=0.02, roughness=0.92
        )
        self.leather_divo_blue = self._create_pbr_mat(
            "Mat_DivoFrenchRacingBlueLeather", (0.00, 0.65, 0.85, 1.0), # Asymmetric driver cockpit blue leather
            metallic=0.08, roughness=0.65
        )
        self.interior_matte_carbon = self._create_pbr_mat(
            "Mat_InteriorMatteCarbonTub", (0.05, 0.05, 0.06, 1.0), # Structural carbon cockpit spine & console
            metallic=0.20, roughness=0.50
        )
        self.mirror_chrome = self._create_pbr_mat(
            "Mat_HypercarOpticalMirror", (0.96, 0.96, 0.98, 1.0), # Optical rear-view glass
            metallic=0.98, roughness=0.01
        )

    def get(self, name):
        return self.materials.get(name)
