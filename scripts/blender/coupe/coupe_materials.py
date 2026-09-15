"""
Bentley Continental GT II Coupe (2011) Material Shader Factory (Blender 5.2 LTS)
Principled BSDF v2 PBR Photorealistic Automotive Material Matrix
"""

import bpy

class CoupeMaterialRegistry:
    """Registry holding all calibrated PBR shaders for the Bentley Continental GT II."""
    def __init__(self):
        self.body_red           = self._create_paint_st_james_red()
        self.body_blue          = self._create_paint_monaco_blue()
        self.trim_satin_black   = self._create_pbr_mat("Mat_Satin_Black_Trim", (0.022, 0.022, 0.024, 1.0), metallic=0.20, roughness=0.55)
        self.trim_piano_black   = self._create_pbr_mat("Mat_Piano_Gloss_Black", (0.010, 0.010, 0.012, 1.0), metallic=0.10, roughness=0.04, coat=1.0)
        self.matrix_chrome      = self._create_pbr_mat("Mat_Bright_Matrix_Chrome", (0.96, 0.96, 0.98, 1.0), metallic=1.0, roughness=0.04, coat=1.0)
        self.matrix_mesh        = self._create_pbr_mat("Mat_Dark_Matrix_Mesh", (0.04, 0.04, 0.05, 1.0), metallic=0.85, roughness=0.35)
        
        # Glass & Optical Elements
        # Executive Obsidian Privacy Glass: Deep reflective obsidian gloss concealing interior completely
        self.glass_clear        = self._create_privacy_glass_mat("Mat_Optical_Glass_Clear", (0.012, 0.014, 0.018, 1.0), roughness=0.04, coat=1.0)
        self.glass_tint         = self._create_privacy_glass_mat("Mat_Optical_Glass_Tint", (0.010, 0.012, 0.016, 1.0), roughness=0.04, coat=1.0)
        self.glass_frit         = self._create_pbr_mat("Mat_Ceramic_Frit_Black", (0.010, 0.010, 0.012, 1.0), metallic=0.0, roughness=0.85)

        # Crystal Optical Lenses for Jewel Headlamps & Ruby Taillights
        self.polycarb_lens      = self._create_glass_mat("Mat_Polycarb_Lens", (0.98, 0.98, 1.0, 1.0), transmission=0.96, roughness=0.02, alpha=0.18)
        self.smoked_ruby_lens   = self._create_glass_mat("Mat_Smoked_Ruby_Lens", (0.45, 0.02, 0.03, 1.0), transmission=0.82, roughness=0.03, alpha=0.45)
        
        # Emissive Lighting Optics
        self.led_headlight_core = self._create_emissive_mat("Mat_Jewel_Headlamp_Core", (1.0, 1.0, 1.0, 1.0), (1.0, 1.0, 1.0, 1.0), 22.0)
        self.led_halo_drl       = self._create_emissive_mat("Mat_Crystal_DRL_Halo", (0.92, 0.97, 1.0, 1.0), (0.88, 0.96, 1.0, 1.0), 18.0)
        self.led_taillight_ruby = self._create_emissive_mat("Mat_Ruby_Taillight_Ring", (0.90, 0.02, 0.03, 1.0), (1.0, 0.012, 0.018, 1.0), 18.0)
        self.led_amber_turn     = self._create_emissive_mat("Mat_Amber_LED_Indicator", (1.0, 0.45, 0.0, 1.0), (1.0, 0.40, 0.0, 1.0), 14.0)
        self.led_reverse_white  = self._create_emissive_mat("Mat_Reverse_LED_White", (1.0, 1.0, 1.0, 1.0), (1.0, 1.0, 1.0, 1.0), 15.0)
        
        # Running Gear & Mechanics
        self.alloy_diamond_cut  = self._create_pbr_mat("Mat_DiamondCut_Alloy", (0.90, 0.91, 0.93, 1.0), metallic=0.96, roughness=0.18, coat=0.85)
        self.alloy_dark_pocket  = self._create_pbr_mat("Mat_Alloy_Dark_Pocket", (0.08, 0.08, 0.09, 1.0), metallic=0.80, roughness=0.45)
        self.carbon_rotor       = self._create_pbr_mat("Mat_CarbonCeramic_Rotor", (0.32, 0.32, 0.34, 1.0), metallic=0.72, roughness=0.32)
        self.brembo_caliper_red = self._create_pbr_mat("Mat_Red_Brembo_Caliper", (0.78, 0.04, 0.05, 1.0), metallic=0.70, roughness=0.20, coat=1.0)
        self.tire_rubber        = self._create_pbr_mat("Mat_Tire_Rubber", (0.028, 0.028, 0.030, 1.0), metallic=0.0, roughness=0.85)
        self.suspension_aluminum = self._create_pbr_mat("Mat_Suspension_Aluminum", (0.72, 0.73, 0.75, 1.0), metallic=0.92, roughness=0.25)
        self.suspension_air_spring = self._create_pbr_mat("Mat_Suspension_AirSpring", (0.04, 0.04, 0.05, 1.0), metallic=0.0, roughness=0.75)
        self.inconel_exhaust    = self._create_pbr_mat("Mat_Inconel_Exhaust", (0.88, 0.88, 0.90, 1.0), metallic=0.98, roughness=0.06, coat=1.0)
        
        # Chassis & Powertrain
        self.chassis_steel      = self._create_pbr_mat("Mat_Chassis_Structure", (0.24, 0.25, 0.27, 1.0), metallic=0.80, roughness=0.40)
        self.engine_block_w12   = self._create_pbr_mat("Mat_EngineBlock_W12", (0.55, 0.56, 0.58, 1.0), metallic=0.88, roughness=0.28)
        self.intake_manifold    = self._create_pbr_mat("Mat_Intake_Manifold_Chrome", (0.92, 0.92, 0.94, 1.0), metallic=0.98, roughness=0.10, coat=0.90)
        
        # Grand Touring Luxury Cockpit
        self.leather_saddle     = self._create_pbr_mat("Mat_Saddle_Tan_Leather", (0.46, 0.25, 0.12, 1.0), metallic=0.0, roughness=0.58)
        self.leather_beluga     = self._create_pbr_mat("Mat_Beluga_Black_Leather", (0.025, 0.025, 0.028, 1.0), metallic=0.0, roughness=0.62)
        self.burr_walnut        = self._create_pbr_mat("Mat_Burr_Walnut_Veneer", (0.22, 0.08, 0.03, 1.0), metallic=0.05, roughness=0.12, coat=1.0)
        self.knurled_chrome     = self._create_pbr_mat("Mat_Knurled_Chrome", (0.95, 0.95, 0.96, 1.0), metallic=1.0, roughness=0.14)
        self.breitling_clock    = self._create_emissive_mat("Mat_Breitling_Clock", (0.96, 0.96, 0.96, 1.0), (0.96, 0.95, 0.90, 1.0), 3.5)
        self.display_screen     = self._create_emissive_mat("Mat_Cockpit_Display", (0.05, 0.06, 0.08, 1.0), (0.25, 0.50, 0.90, 1.0), 2.5)

    def _set_socket(self, bsdf, names, value):
        for n in names:
            if n in bsdf.inputs:
                bsdf.inputs[n].default_value = value
                return True
        return False

    def _create_pbr_mat(self, name, base_color, metallic=0.0, roughness=0.5, coat=0.0):
        mat = bpy.data.materials.get(name)
        if mat:
            return mat
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if not bsdf:
            bsdf = mat.node_tree.nodes.new(type="ShaderNodeBsdfPrincipled")
        self._set_socket(bsdf, ["Base Color"], base_color)
        self._set_socket(bsdf, ["Metallic"], metallic)
        self._set_socket(bsdf, ["Roughness"], roughness)
        self._set_socket(bsdf, ["Coat Weight", "Clearcoat Weight", "Clearcoat"], coat)
        if coat > 0.0:
            self._set_socket(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.025)
        return mat

    def _create_paint_st_james_red(self):
        """Iconic Bentley St. James Red high-gloss metallic clearcoat."""
        name = "Mat_Bentley_StJames_Red"
        mat = bpy.data.materials.get(name)
        if mat:
            return mat
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if not bsdf:
            bsdf = mat.node_tree.nodes.new(type="ShaderNodeBsdfPrincipled")
        self._set_socket(bsdf, ["Base Color"], (0.68, 0.035, 0.065, 1.0))
        self._set_socket(bsdf, ["Metallic"], 0.88)
        self._set_socket(bsdf, ["Roughness"], 0.16)
        self._set_socket(bsdf, ["Coat Weight", "Clearcoat Weight", "Clearcoat"], 1.0)
        self._set_socket(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.02)
        self._set_socket(bsdf, ["IOR"], 1.50)
        return mat

    def _create_paint_monaco_blue(self):
        """Bentley Monaco Blue deep royal metallic."""
        name = "Mat_Bentley_Monaco_Blue"
        mat = bpy.data.materials.get(name)
        if mat:
            return mat
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if not bsdf:
            bsdf = mat.node_tree.nodes.new(type="ShaderNodeBsdfPrincipled")
        self._set_socket(bsdf, ["Base Color"], (0.015, 0.045, 0.16, 1.0))
        self._set_socket(bsdf, ["Metallic"], 0.90)
        self._set_socket(bsdf, ["Roughness"], 0.15)
        self._set_socket(bsdf, ["Coat Weight", "Clearcoat Weight", "Clearcoat"], 1.0)
        self._set_socket(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.02)
        return mat

    def _create_glass_mat(self, name, base_color, transmission=0.94, roughness=0.02, alpha=0.25):
        mat = bpy.data.materials.get(name)
        if mat:
            return mat
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if not bsdf:
            bsdf = mat.node_tree.nodes.new(type="ShaderNodeBsdfPrincipled")
        self._set_socket(bsdf, ["Base Color"], base_color)
        self._set_socket(bsdf, ["Transmission Weight", "Transmission"], transmission)
        self._set_socket(bsdf, ["Roughness"], roughness)
        self._set_socket(bsdf, ["IOR"], 1.52)
        self._set_socket(bsdf, ["Alpha"], alpha)
        self._set_socket(bsdf, ["Coat Weight", "Clearcoat Weight", "Clearcoat"], 1.0)
        self._set_socket(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.01)
        
        # Viewport Transparency Settings for Blender 5.x EEVEE Next
        if hasattr(mat, "blend_method"):
            mat.blend_method = 'BLEND'
        if hasattr(mat, "surface_render_method"):
            mat.surface_render_method = 'BLENDED'
        if hasattr(mat, "shadow_method"):
            mat.shadow_method = 'NONE'
        return mat

    def _create_privacy_glass_mat(self, name, base_color, roughness=0.015, coat=1.0):
        """Executive Obsidian Privacy Glass: Reflective, mirror-like gloss that fully conceals interior."""
        mat = bpy.data.materials.get(name)
        if mat:
            return mat
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if not bsdf:
            bsdf = mat.node_tree.nodes.new(type="ShaderNodeBsdfPrincipled")
        self._set_socket(bsdf, ["Base Color"], base_color)
        self._set_socket(bsdf, ["Metallic"], 0.12)
        self._set_socket(bsdf, ["Roughness"], roughness)
        self._set_socket(bsdf, ["IOR"], 1.54)
        self._set_socket(bsdf, ["Specular IOR Level", "Specular"], 0.95)
        self._set_socket(bsdf, ["Coat Weight", "Clearcoat Weight", "Clearcoat"], coat)
        self._set_socket(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.01)
        self._set_socket(bsdf, ["Transmission Weight", "Transmission"], 0.0)
        self._set_socket(bsdf, ["Alpha"], 1.0)
        
        # Opaque high-gloss rendering for flawless reflection and no sorting artifacts
        if hasattr(mat, "blend_method"):
            mat.blend_method = 'OPAQUE'
        if hasattr(mat, "surface_render_method"):
            mat.surface_render_method = 'DITHERED'
        if hasattr(mat, "shadow_method"):
            mat.shadow_method = 'OPAQUE'
        return mat

    def _create_emissive_mat(self, name, base_color, emission_color, strength=15.0):
        mat = bpy.data.materials.get(name)
        if mat:
            return mat
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if not bsdf:
            bsdf = mat.node_tree.nodes.new(type="ShaderNodeBsdfPrincipled")
        self._set_socket(bsdf, ["Base Color"], base_color)
        self._set_socket(bsdf, ["Metallic"], 0.0)
        self._set_socket(bsdf, ["Roughness"], 0.10)
        self._set_socket(bsdf, ["Emission Color", "Emission"], emission_color)
        self._set_socket(bsdf, ["Emission Strength"], strength)
        return mat
