// ============================================================================
// GETLAYERS.AI — ONE-PROMPT AI WORKFLOW & MCP PROMPT ENGINE
// ============================================================================
// Implements the GetLayers.ai paradigm:
// Every 3D vehicle state, shader, lighting setup, and exploded/cutaway configuration
// can be synthesized into an ultra-refined, reproducible AI prompt and JSON Layer Spec.
// ============================================================================

export interface GetLayersPromptTemplate {
  id: string;
  title: string;
  category: 'supercar' | 'motorsport' | 'cutaway' | 'aerodynamics' | 'luxury';
  mood: string;
  prompt: string;
  tags: string[];
}

export const GETLAYERS_PROMPT_TEMPLATES: GetLayersPromptTemplate[] = [
  {
    id: 'apex_gt3_track_weapon',
    title: 'Apex GT3 Track Weapon',
    category: 'motorsport',
    mood: 'High-Downforce Motorsport Aggression',
    tags: ['GT3', 'Swan-Neck Wing', 'Forged Wheels', 'Carbon Splitter'],
    prompt: `Generate a photorealistic 3D competition hypercar in Three.js with stamped G2 automotive bodywork. Features a low-drag wedge front nose with 3D radiator cavities, carbon dive planes, front fender pressure-relief louvers, 19-inch forged pocketed Y-spoke wheels wrapped in 680mm crowned tires with directional tread sipes, exposed swan-neck dual-element rear wing, and a multi-channel venturi rear diffuser. Studio lighting: cold directional rim lights, overhead softbox reflection strips, and high-contrast clearcoat reflections on Apex Blue paint.`,
  },
  {
    id: 'cutaway_powertrain_anatomy',
    title: 'Hypercar Cutaway & Powertrain Anatomy',
    category: 'cutaway',
    mood: 'Technical Engineering Disassembly',
    tags: ['/cutaway', '/exploded', 'Twin-Turbo', 'Internal CAD'],
    prompt: `Construct an interactive WebGL 3D mechanical cutaway viewport of a twin-turbocharged flat-plane V8 powertrain. Using Three.js local clipping planes, slice through the cylinder block and transaxle casing to expose reciprocating forged pistons, titanium valve springs, helical transmission gearsets, and billet turbo impellers. Overlay animated 60 FPS Catmull-Rom particle streamlines visualizing coolant, oil, intake boost air, and high-velocity exhaust gas flow paths with interactive /exploded and /anatomy HUD controls.`,
  },
  {
    id: 'le_mans_night_stint',
    title: 'Le Mans 24H Night Stint',
    category: 'motorsport',
    mood: 'Endurance Nocturne & Glowing Thermals',
    tags: ['Endurance', 'Glowing CCM Brakes', 'Exhaust Flame', 'Anamorphic Bloom'],
    prompt: `Render a prototype Le Mans Hypercar during a high-speed nocturnal stint. Features high-intensity laser projector headlights with anamorphic cyan bloom, glowing orange-hot carbon-ceramic brake discs behind forged magnesium wheels, Inconel exhaust headers emitting faint thermal radiation, and dynamic rain mist particles swirling through underbody venturi tunnels against an Obsidian Black asphalt ground plane.`,
  },
  {
    id: 'wind_tunnel_cfd_diagnostic',
    title: 'Wind Tunnel CFD Aerodynamics',
    category: 'aerodynamics',
    mood: 'Aero Diagnostic & Velocity Fields',
    tags: ['CFD', 'Streamlines', 'Active Aero', 'Ground Effects'],
    prompt: `Design a virtual aerodynamic wind tunnel testing environment for a modular sports car. Feature real-time animated flow particles cascading over the double-bubble roof, laminar flow boundary layers across the scalloped coke-bottle doors, and high-velocity vortex shedding behind the rear diffuser strakes. Include an interactive toggle for active aero DRS flaps and front splitter pitch angles with live downforce and drag coefficients telemetry.`,
  },
  {
    id: 'bespoke_monolithic_luxury',
    title: 'Bespoke Monolithic Luxury Exhibition',
    category: 'luxury',
    mood: 'Architectural Elegance & Brushed Metals',
    tags: ['Liquid Metal', 'Alcantara', 'Double-Bubble', 'Studio Cyclorama'],
    prompt: `Create a minimalist architectural luxury automotive showroom featuring a bespoke grand tourer on a brushed titanium circular podium. Highlights include multi-stage liquid silver paint with 95% metallic clearcoat, champagne gold forged centerlock wheels, a tinted panoramic cockpit canopy revealing diamond-quilted Alcantara seating, and subtle warm tungsten spotlights creating razor-sharp specular reflection ribbons along the vehicle's shoulder crease.`,
  },
];

export class GetLayersPromptEngine {
  /**
   * Generates a customized AI prompt based on current scene state.
   */
  public static generateLivePrompt(params: {
    paintColor: string;
    gradientName: string;
    scenePresetName: string;
    activeModes: string[];
    visibleLayers: string[];
    wheelFinish: string;
  }): string {
    const modesText = params.activeModes.length > 0 ? `Active inspection modes: ${params.activeModes.join(', ')}.` : 'Standard cinematic beauty orbit.';
    const layersText = `Enabled subsystem layers: ${params.visibleLayers.join(', ')}.`;

    return `Create a cinematic 3D automotive experience in Three.js referencing GetLayers.ai standards.
Vehicle Specification:
- Bodywork: Stamped G2 automotive surfaces with ${params.paintColor} clearcoat finish.
- Wheels: 19-inch forged motorsport rims in ${params.wheelFinish} with crowned directional tires.
- Environment: "${params.scenePresetName}" studio environment paired with the "${params.gradientName}" procedural WebGL gradient backdrop.
- Architecture: ${layersText}
- Interaction: ${modesText}
- Lighting: Multi-point automotive studio rig with overhead reflection softbox, contact shadow ground occlusion, and ACES Filmic tone mapping.`;
  }

  /**
   * Generates full GetLayers JSON Spec export.
   */
  public static generateLayerSpecJson(params: Record<string, unknown>): string {
    return JSON.stringify(
      {
        version: 'getlayers.ai/spec/v1',
        generator: 'Antigravity Modular Vehicle Simulator',
        timestamp: new Date().toISOString(),
        metadata: {
          license: 'MIT / GetLayers Inspired',
          targetRuntime: 'Three.js / WebGL 2.0',
        },
        spec: params,
      },
      null,
      2
    );
  }
}
