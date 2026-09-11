"""
Bus PBR Material Library Factory (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
Production-grade PBR materials with procedural texture networks for realistic transit bus rendering.
"""

import bpy
import math

class BusMaterials:
    """Master PBR material registry with procedural texture networks for exterior and interior bus assets."""
    
    def __init__(self):
        self.materials = {}
        self._init_all_materials()

    def _create_pbr_mat(self, name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0,
                        transmission=0.0, ior=1.45, emission=None, emission_strength=1.0, alpha=1.0):
        """Core PBR material factory with Blender 4.x/5.x API compatibility."""
        mat = bpy.data.materials.get(name)
        if mat:
            self.materials[name] = mat
            return mat
            
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
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
            for attr in ('blend_method', 'shadow_method'):
                if hasattr(mat, attr):
                    try:
                        setattr(mat, attr, 'BLEND' if attr == 'blend_method' else 'HASHED')
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
        links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
        self.materials[name] = mat
        return mat

    def _create_paint_mat(self, name, base_color, metallic=0.45, roughness=0.18, clearcoat=0.90,
                          flake_scale=200.0, flake_intensity=0.03):
        """Automotive-grade metallic paint with procedural clearcoat flakes."""
        mat = self._create_pbr_mat(name, base_color, metallic=metallic, roughness=roughness, clearcoat=clearcoat)
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        bsdf = None
        for n in nodes:
            if n.type == 'BSDF_PRINCIPLED':
                bsdf = n
                break
        if not bsdf:
            return mat
            
        # Voronoi noise for micro-flake sparkles in the clearcoat
        tex_coord = nodes.new(type='ShaderNodeTexCoord')
        mapping = nodes.new(type='ShaderNodeMapping')
        mapping.inputs['Scale'].default_value = (flake_scale, flake_scale, flake_scale)
        links.new(tex_coord.outputs['Object'], mapping.inputs['Vector'])
        
        voronoi = nodes.new(type='ShaderNodeTexVoronoi')
        voronoi.feature = 'DISTANCE_TO_EDGE'
        voronoi.distance = 'EUCLIDEAN'
        voronoi.inputs['Scale'].default_value = flake_scale
        links.new(mapping.outputs['Vector'], voronoi.inputs['Vector'])
        
        # Mix a slight roughness variation for orange-peel effect
        noise = nodes.new(type='ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 80.0
        noise.inputs['Detail'].default_value = 8.0
        noise.inputs['Roughness'].default_value = 0.5
        links.new(mapping.outputs['Vector'], noise.inputs['Vector'])
        
        mix_rough = nodes.new(type='ShaderNodeMath')
        mix_rough.operation = 'ADD'
        mix_rough.inputs[0].default_value = roughness * 0.85
        mix_rough.inputs[1].default_value = 0.0
        links.new(noise.outputs['Fac'], mix_rough.inputs[1])
        
        links.new(mix_rough.outputs[0], bsdf.inputs['Roughness'])
        
        return mat

    def _create_emissive_led_mat(self, name, base_color, emission_color, emission_strength=10.0,
                                 grid_scale=40.0, flicker=False):
        """LED matrix material with procedural pixel grid pattern."""
        mat = self._create_pbr_mat(name, base_color, metallic=0.10, roughness=0.20,
                                   emission=emission_color, emission_strength=emission_strength)
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        bsdf = None
        for n in nodes:
            if n.type == 'BSDF_PRINCIPLED':
                bsdf = n
                break
        if not bsdf:
            return mat
            
        # Procedural LED pixel grid using brick texture
        tex_coord = nodes.new(type='ShaderNodeTexCoord')
        
        brick = nodes.new(type='ShaderNodeTexBrick')
        brick.inputs['Scale'].default_value = grid_scale
        brick.inputs['Brick Width'].default_value = 0.48
        brick.inputs['Mortar Size'].default_value = 0.05
        if 'Row Height' in brick.inputs:
            brick.inputs['Row Height'].default_value = 0.48
        links.new(tex_coord.outputs['UV'], brick.inputs['Vector'])
        
        # Use brick pattern as emission mask
        ramp = nodes.new(type='ShaderNodeMapRange')
        ramp.inputs['From Min'].default_value = 0.1
        ramp.inputs['From Max'].default_value = 0.3
        ramp.inputs['To Min'].default_value = 0.0
        ramp.inputs['To Max'].default_value = 1.0
        links.new(brick.outputs['Fac'], ramp.inputs['Value'])
        
        # Multiply emission by pattern
        emit_mix = nodes.new(type='ShaderNodeMixRGB')
        emit_mix.blend_type = 'MULTIPLY'
        emit_mix.inputs[1].default_value = emission_color
        emit_mix.inputs[2].default_value = (1.0, 1.0, 1.0, 1.0)
        links.new(ramp.outputs[0], emit_mix.inputs['Fac'])
        
        if 'Emission Color' in bsdf.inputs:
            links.new(emit_mix.outputs[0], bsdf.inputs['Emission Color'])
        
        return mat

    def _create_glass_mat(self, name, base_color, tint_strength=0.92, ior=1.52):
        """Advanced glass with Fresnel reflection, tint, and subtle refraction."""
        mat = self._create_pbr_mat(name, base_color, metallic=0.05, roughness=0.03,
                                   transmission=tint_strength, ior=ior, alpha=0.38)
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        bsdf = None
        for n in nodes:
            if n.type == 'BSDF_PRINCIPLED':
                bsdf = n
                break
        if not bsdf:
            return mat
            
        # Add subtle noise for surface imperfections / rain spots
        tex_coord = nodes.new(type='ShaderNodeTexCoord')
        noise = nodes.new(type='ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 250.0
        noise.inputs['Detail'].default_value = 4.0
        noise.inputs['Roughness'].default_value = 0.3
        links.new(tex_coord.outputs['Object'], noise.inputs['Vector'])
        
        # Very subtle roughness variation
        ramp = nodes.new(type='ShaderNodeMapRange')
        ramp.inputs['From Min'].default_value = 0.4
        ramp.inputs['From Max'].default_value = 0.6
        ramp.inputs['To Min'].default_value = 0.01
        ramp.inputs['To Max'].default_value = 0.08
        links.new(noise.outputs['Fac'], ramp.inputs['Value'])
        links.new(ramp.outputs[0], bsdf.inputs['Roughness'])
        
        return mat

    def _create_rubber_mat(self, name, base_color, roughness=0.82):
        """Rubber / elastomer with micro-texture noise."""
        mat = self._create_pbr_mat(name, base_color, metallic=0.0, roughness=roughness)
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        bsdf = None
        for n in nodes:
            if n.type == 'BSDF_PRINCIPLED':
                bsdf = n
                break
        if not bsdf:
            return mat
            
        tex_coord = nodes.new(type='ShaderNodeTexCoord')
        noise = nodes.new(type='ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 120.0
        noise.inputs['Detail'].default_value = 6.0
        noise.inputs['Roughness'].default_value = 0.7
        links.new(tex_coord.outputs['Object'], noise.inputs['Vector'])
        
        # Subtle roughness variation
        ramp = nodes.new(type='ShaderNodeMapRange')
        ramp.inputs['From Min'].default_value = 0.3
        ramp.inputs['From Max'].default_value = 0.7
        ramp.inputs['To Min'].default_value = roughness - 0.08
        ramp.inputs['To Max'].default_value = roughness + 0.05
        links.new(noise.outputs['Fac'], ramp.inputs['Value'])
        links.new(ramp.outputs[0], bsdf.inputs['Roughness'])
        
        return mat

    def _create_fabric_mat(self, name, base_color, pattern_scale=50.0):
        """Transit seat fabric with woven pattern texture."""
        mat = self._create_pbr_mat(name, base_color, metallic=0.05, roughness=0.80)
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        bsdf = None
        for n in nodes:
            if n.type == 'BSDF_PRINCIPLED':
                bsdf = n
                break
        if not bsdf:
            return mat
            
        tex_coord = nodes.new(type='ShaderNodeTexCoord')
        
        # Woven fabric pattern using dual-direction wave textures
        voronoi_h = nodes.new(type='ShaderNodeTexVoronoi')
        voronoi_h.feature = 'DISTANCE_TO_EDGE'
        voronoi_h.inputs['Scale'].default_value = pattern_scale
        voronoi_h.inputs['Randomness'].default_value = 0.0
        mapping_h = nodes.new(type='ShaderNodeMapping')
        mapping_h.inputs['Scale'].default_value = (1.0, 3.0, 1.0)
        links.new(tex_coord.outputs['UV'], mapping_h.inputs['Vector'])
        links.new(mapping_h.outputs['Vector'], voronoi_h.inputs['Vector'])
        
        voronoi_v = nodes.new(type='ShaderNodeTexVoronoi')
        voronoi_v.feature = 'DISTANCE_TO_EDGE'
        voronoi_v.inputs['Scale'].default_value = pattern_scale
        voronoi_v.inputs['Randomness'].default_value = 0.0
        mapping_v = nodes.new(type='ShaderNodeMapping')
        mapping_v.inputs['Scale'].default_value = (3.0, 1.0, 1.0)
        links.new(tex_coord.outputs['UV'], mapping_v.inputs['Vector'])
        links.new(mapping_v.outputs['Vector'], voronoi_v.inputs['Vector'])
        
        # Combine weave
        mix_weave = nodes.new(type='ShaderNodeMixRGB')
        mix_weave.blend_type = 'OVERLAY'
        mix_weave.inputs[1].default_value = (0.5, 0.5, 0.5, 1.0)
        mix_weave.inputs[2].default_value = (0.5, 0.5, 0.5, 1.0)
        mix_weave.inputs['Fac'].default_value = 0.5
        links.new(voronoi_h.outputs['Distance'], mix_weave.inputs['Color1'])
        links.new(voronoi_v.outputs['Distance'], mix_weave.inputs['Color2'])
        
        # Roughness from weave
        ramp = nodes.new(type='ShaderNodeMapRange')
        ramp.inputs['From Min'].default_value = 0.0
        ramp.inputs['From Max'].default_value = 0.5
        ramp.inputs['To Min'].default_value = 0.65
        ramp.inputs['To Max'].default_value = 0.92
        links.new(mix_weave.outputs[0], ramp.inputs['Value'])
        links.new(ramp.outputs[0], bsdf.inputs['Roughness'])
        
        return mat

    def _create_metal_mat(self, name, base_color, metallic=0.90, roughness=0.30, brushed=True):
        """Brushed/cast metal with anisotropic-like noise pattern."""
        mat = self._create_pbr_mat(name, base_color, metallic=metallic, roughness=roughness)
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        bsdf = None
        for n in nodes:
            if n.type == 'BSDF_PRINCIPLED':
                bsdf = n
                break
        if not bsdf:
            return mat
            
        tex_coord = nodes.new(type='ShaderNodeTexCoord')
        
        # Brushed metal: anisotropic noise pattern
        noise = nodes.new(type='ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 200.0
        noise.inputs['Detail'].default_value = 4.0
        noise.inputs['Roughness'].default_value = 0.2
        mapping = nodes.new(type='ShaderNodeMapping')
        mapping.inputs['Scale'].default_value = (8.0, 1.0, 1.0) if brushed else (1.0, 1.0, 1.0)
        links.new(tex_coord.outputs['Object'], mapping.inputs['Vector'])
        links.new(mapping.outputs['Vector'], noise.inputs['Vector'])
        
        ramp = nodes.new(type='ShaderNodeMapRange')
        ramp.inputs['From Min'].default_value = 0.3
        ramp.inputs['From Max'].default_value = 0.7
        ramp.inputs['To Min'].default_value = roughness - 0.10
        ramp.inputs['To Max'].default_value = roughness + 0.08
        links.new(noise.outputs['Fac'], ramp.inputs['Value'])
        links.new(ramp.outputs[0], bsdf.inputs['Roughness'])
        
        return mat

    def _init_all_materials(self):
        # =====================================================================
        # 1. EXTERIOR FLEET BODYWORK & PAINT (Automotive-Grade with Flakes)
        # =====================================================================
        self.body_cyan = self._create_paint_mat(
            "Mat_BusFleetCyan", (0.00, 0.96, 0.83, 1.0),
            metallic=0.45, roughness=0.18, clearcoat=0.90, flake_scale=250.0
        )
        self.body_white = self._create_paint_mat(
            "Mat_BusFleetWhite", (0.92, 0.94, 0.96, 1.0),
            metallic=0.15, roughness=0.22, clearcoat=0.85, flake_scale=200.0
        )
        self.body_dark_accent = self._create_pbr_mat(
            "Mat_BusDarkAccent", (0.06, 0.08, 0.11, 1.0),
            metallic=0.20, roughness=0.35, clearcoat=0.60
        )
        self.trim_satin_black = self._create_pbr_mat(
            "Mat_DarkSatinTrim", (0.04, 0.04, 0.05, 1.0),
            metallic=0.05, roughness=0.65
        )
        
        # =====================================================================
        # 2. GLAZING & OPTICAL GLASS (Fresnel + Imperfections)
        # =====================================================================
        self.glass_tinted = self._create_glass_mat(
            "Mat_TransitOpticalGlass", (0.75, 0.88, 0.95, 1.0),
            tint_strength=0.92, ior=1.52
        )
        self.glass_frit = self._create_pbr_mat(
            "Mat_WindshieldFrittedBorder", (0.02, 0.02, 0.03, 1.0),
            metallic=0.05, roughness=0.45
        )
        
        # =====================================================================
        # 3. LED LIGHTING (Procedural Pixel Grid Pattern)
        # =====================================================================
        self.led_destination = self._create_emissive_led_mat(
            "Mat_LED_DestinationMatrix", (0.02, 0.02, 0.03, 1.0),
            emission_color=(1.00, 0.72, 0.05, 1.0), emission_strength=12.0, grid_scale=40.0
        )
        self.led_headlight = self._create_pbr_mat(
            "Mat_LED_HeadlightMatrix", (0.95, 0.98, 1.00, 1.0),
            metallic=0.90, roughness=0.10,
            emission=(0.95, 0.98, 1.00, 1.0), emission_strength=10.0
        )
        self.led_taillight = self._create_pbr_mat(
            "Mat_LED_TaillightTower", (0.90, 0.02, 0.02, 1.0),
            metallic=0.60, roughness=0.15,
            emission=(1.00, 0.02, 0.02, 1.0), emission_strength=8.0
        )
        self.led_amber_marker = self._create_pbr_mat(
            "Mat_LED_MarkerAmber", (0.98, 0.55, 0.02, 1.0),
            metallic=0.40, roughness=0.20,
            emission=(1.00, 0.60, 0.02, 1.0), emission_strength=6.5
        )
        
        # =====================================================================
        # 4. HEAVY DUTY CHASSIS, POWERTRAIN & BATTERY (Brushed Metal)
        # =====================================================================
        self.chassis_steel = self._create_metal_mat(
            "Mat_SteelChassisFrame", (0.18, 0.20, 0.23, 1.0),
            metallic=0.85, roughness=0.40, brushed=True
        )
        self.battery_aluminum = self._create_metal_mat(
            "Mat_BatteryEnclosureAlum", (0.70, 0.73, 0.76, 1.0),
            metallic=0.92, roughness=0.28, brushed=True
        )
        self.emotor_orange_harness = self._create_pbr_mat(
            "Mat_HighVoltageOrange", (0.95, 0.35, 0.02, 1.0),
            metallic=0.05, roughness=0.40
        )
        
        # =====================================================================
        # 5. WHEELS, BRAKES & SUSPENSION (Tire Tread + Alloy Detail)
        # =====================================================================
        self.tire_rubber = self._create_rubber_mat(
            "Mat_HeavyDutyTireRubber", (0.05, 0.05, 0.06, 1.0),
            roughness=0.88
        )
        self.alloy_wheel = self._create_metal_mat(
            "Mat_ForgedAlloyBusWheel", (0.85, 0.87, 0.90, 1.0),
            metallic=0.95, roughness=0.20, brushed=True
        )
        self.brake_rotor = self._create_metal_mat(
            "Mat_CommercialBrakeRotor", (0.35, 0.36, 0.38, 1.0),
            metallic=0.80, roughness=0.45, brushed=False
        )
        self.brake_caliper = self._create_pbr_mat(
            "Mat_CommercialCaliper", (0.12, 0.14, 0.18, 1.0),
            metallic=0.60, roughness=0.40
        )
        self.air_suspension_rubber = self._create_rubber_mat(
            "Mat_AirBellowRubber", (0.03, 0.03, 0.04, 1.0),
            roughness=0.75
        )
        
        # =====================================================================
        # 6. INTERIOR TRANSIT ELEMENTS (Fabric Weave + Safety Yellow)
        # =====================================================================
        self.seat_fabric = self._create_fabric_mat(
            "Mat_InteriorTransitFabric", (0.10, 0.22, 0.48, 1.0),
            pattern_scale=60.0
        )
        self.grab_rail_yellow = self._create_paint_mat(
            "Mat_SafetyGrabRailYellow", (0.95, 0.82, 0.02, 1.0),
            metallic=0.20, roughness=0.25, clearcoat=0.70, flake_scale=100.0
        )
        self.cockpit_dash = self._create_rubber_mat(
            "Mat_DriverCockpitDash", (0.08, 0.09, 0.11, 1.0),
            roughness=0.60
        )
        self.mirror_chrome = self._create_metal_mat(
            "Mat_OpticalMirrorChrome", (0.95, 0.95, 0.96, 1.0),
            metallic=0.98, roughness=0.02, brushed=False
        )
        
        # =====================================================================
        # 7. FLOOR & INTERIOR SURFACES
        # =====================================================================
        self.floor_deck = self._create_pbr_mat(
            "Mat_FloorDeck_Rubber", (0.12, 0.12, 0.13, 1.0),
            metallic=0.0, roughness=0.78
        )
        self.dashboard_screen = self._create_pbr_mat(
            "Mat_DashboardScreen", (0.01, 0.01, 0.02, 1.0),
            metallic=0.3, roughness=0.05,
            emission=(0.15, 0.35, 0.60, 1.0), emission_strength=3.0
        )
        self.interior_ceiling = self._create_pbr_mat(
            "Mat_InteriorCeilingPanel", (0.88, 0.89, 0.91, 1.0),
            metallic=0.0, roughness=0.70
        )

    def get(self, name):
        return self.materials.get(name)
