// ─────────────────────────────────────────────────────────────────────────────
// Apex AI Knowledge Database
// Maps every control label → tutorial explanation, impact areas, AI tip, & danger zone
// ─────────────────────────────────────────────────────────────────────────────

export type ImpactArea =
  | "power" | "torque" | "weight" | "cost" | "handling"
  | "aero" | "reliability" | "efficiency" | "comfort"
  | "safety" | "noise" | "cooling" | "braking" | "speed"
  | "grip" | "durability" | "luxury" | "emissions" | "manufacturing";

export interface ApexKnowledgeEntry {
  tutorial: string;
  impacts: ImpactArea[];
  tip: string;
  dangerZone?: string;
}

// Fuzzy-match lookup: normalizes label → key for flexible matching
function normalizeKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/\s+/g, "");
}

const KNOWLEDGE_DB: Record<string, ApexKnowledgeEntry> = {

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE — Architecture
  // ═══════════════════════════════════════════════════════════════════════════

  bore: {
    tutorial: "The cylinder bore is the internal diameter of each cylinder. Larger bores allow bigger valves and better breathing at high RPM, favoring top-end power. Smaller bores promote better combustion efficiency and lower emissions.",
    impacts: ["power", "torque", "efficiency", "emissions", "reliability"],
    tip: "For a high-revving track engine, increase bore for better airflow. For fuel economy, keep bore moderate and use a longer stroke instead.",
    dangerZone: "Bore >100mm on small blocks risks thin cylinder walls and overheating.",
  },

  stroke: {
    tutorial: "The piston stroke is the distance each piston travels inside the cylinder. Longer strokes produce more torque at lower RPM (undersquare), while shorter strokes allow higher RPM and peak power (oversquare).",
    impacts: ["torque", "power", "efficiency", "noise", "reliability"],
    tip: "Pair long stroke with turbocharging for massive low-end torque. Short stroke suits naturally aspirated high-RPM screamer engines.",
    dangerZone: "Very long strokes (>100mm) dramatically increase piston speed, risking mechanical failure at high RPM.",
  },

  rodlength: {
    tutorial: "Connecting rod length affects the angle at which force is applied to the crankshaft. Longer rods reduce side-loading on cylinder walls, improving durability and reducing friction. Shorter rods increase piston acceleration.",
    impacts: ["power", "reliability", "efficiency"],
    tip: "Longer rods generally improve reliability and reduce piston ring wear. Match rod ratio (rod length / stroke) around 1.6–1.8 for balanced performance.",
  },

  compressionratio: {
    tutorial: "Compression ratio is how much the air-fuel mixture is squeezed before ignition. Higher ratios extract more energy per cycle (better efficiency and power), but increase knock risk and require higher octane fuel.",
    impacts: ["power", "efficiency", "reliability", "emissions"],
    tip: "For naturally aspirated engines, push compression to 11–13:1 for best power. For turbocharged engines, keep it at 8.5–10:1 to avoid knock.",
    dangerZone: "Above 14:1 with forced induction is extremely dangerous — expect severe knock and potential engine damage.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE — Internals
  // ═══════════════════════════════════════════════════════════════════════════

  crankshaft: {
    tutorial: "The crankshaft converts linear piston motion into rotational energy. Material choice affects weight, strength, and cost. Forged steel is the performance standard; billet is the ultimate race-grade option.",
    impacts: ["power", "weight", "cost", "reliability", "durability"],
    tip: "Forged steel is the best cost-to-performance ratio. Only use billet for extreme motorsport builds where every gram and every RPM counts.",
  },

  pistons: {
    tutorial: "Pistons compress the air-fuel mixture and transmit combustion force to the crankshaft. Forged pistons handle higher temperatures and pressures than cast ones, essential for forced induction.",
    impacts: ["power", "reliability", "weight", "cost"],
    tip: "Always use forged pistons with turbocharging. Cast pistons are fine for low-stress naturally aspirated engines to save cost.",
    dangerZone: "Cast pistons with boost pressures above 1.0 bar will likely crack under thermal stress.",
  },

  valvetrain: {
    tutorial: "The valvetrain controls intake and exhaust valve timing. DOHC (dual overhead cam) allows more valves and variable timing for better breathing. OHV (overhead valve) is simpler and more compact but limits RPM.",
    impacts: ["power", "torque", "cost", "reliability", "efficiency"],
    tip: "DOHC with variable valve timing (VVT) gives the best all-around performance. OHV works well for low-RPM torque monsters.",
  },

  camduration: {
    tutorial: "Cam duration is how long (in crankshaft degrees) each valve stays open. Longer duration improves high-RPM breathing and top-end power, but sacrifices low-end torque and idle quality.",
    impacts: ["power", "torque", "efficiency", "noise"],
    tip: "For street cars, keep duration under 280°. Track builds benefit from 290–320°. Above 320° expect very rough idle and poor drivability.",
    dangerZone: "Duration above 330° makes the engine nearly undriveable on the street.",
  },

  camlift: {
    tutorial: "Cam lift is how far the valve opens. More lift allows more air into the cylinder at high RPM, increasing power. Too much lift risks valve-to-piston contact and valve float.",
    impacts: ["power", "torque", "reliability"],
    tip: "Increase lift gradually with matching valve springs. More lift without stronger springs causes valve float at high RPM.",
    dangerZone: "Lift above 14mm without upgraded springs and retainers risks catastrophic valve float.",
  },

  camtiming: {
    tutorial: "Cam timing (advance/retard) shifts when valves open relative to piston position. Advancing intake timing boosts low-end torque. Retarding it favors high-RPM power.",
    impacts: ["power", "torque", "efficiency"],
    tip: "A small advance (+2–4°) is great for daily driving torque. Retard timing for high-RPM track use. Variable cam timing (VVT) gives you both.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE — Induction & Fuel
  // ═══════════════════════════════════════════════════════════════════════════

  intake: {
    tutorial: "The intake system feeds air to the engine. Natural aspiration (NA) relies on atmospheric pressure. Turbocharging and supercharging force more air in, dramatically increasing power output.",
    impacts: ["power", "torque", "cost", "weight", "reliability", "efficiency"],
    tip: "Turbocharging gives the best power-per-dollar. Supercharging provides instant response with no lag. NA is simplest and most reliable.",
  },

  fuelsystem: {
    tutorial: "The fuel system determines how fuel is delivered. Multi-point injection (MPI) sprays into intake ports. Direct injection (DI) sprays directly into cylinders for better atomization, power, and efficiency.",
    impacts: ["power", "efficiency", "emissions", "cost"],
    tip: "Direct injection is superior for turbocharged engines. For budget builds, MPI is proven and reliable.",
  },

  afr: {
    tutorial: "Air-Fuel Ratio (AFR) is the proportion of air to fuel in the combustion mix. Stoichiometric (14.7:1) is chemically ideal. Richer mixtures (lower AFR ~12:1) cool combustion and make more power. Leaner mixtures (higher AFR ~16:1) save fuel.",
    impacts: ["power", "efficiency", "reliability", "emissions"],
    tip: "Run 12.5–13.0:1 under full boost for safety. 14.7:1 for cruising. Never go leaner than 15:1 under load — detonation risk.",
    dangerZone: "AFR above 16:1 under load causes lean detonation which melts pistons.",
  },

  ignitiontiming: {
    tutorial: "Ignition timing controls when the spark fires relative to piston position. More advance means the spark fires earlier, giving combustion more time to build pressure. Too much advance causes knock.",
    impacts: ["power", "efficiency", "reliability"],
    tip: "Advance timing in small increments (1–2° at a time) until you hear knock, then back off 2°. That's your safe maximum.",
    dangerZone: "Timing above 35° on turbocharged engines will almost certainly cause severe knock and engine damage.",
  },

  boostpressure: {
    tutorial: "Boost pressure is how much extra air pressure the turbo/supercharger forces into the engine above atmospheric pressure. More boost = more air = more power, but also more stress on everything.",
    impacts: ["power", "torque", "reliability", "cooling", "cost"],
    tip: "For reliability, stay under 1.5 bar on stock internals. With forged internals, you can safely push 2.0–2.5 bar. Beyond that requires race-grade everything.",
    dangerZone: "Above 2.5 bar requires extensive cooling, forged internals, and race fuel. Above 3.5 bar is extreme — expect halved engine lifespan.",
  },

  turbosize: {
    tutorial: "Turbo size determines how much air the turbocharger can flow. Larger turbos produce more peak power but spool slower (more turbo lag). Smaller turbos spool quickly for instant response but cap out earlier.",
    impacts: ["power", "torque", "reliability", "weight", "cost"],
    tip: "Match turbo size to your RPM range. A turbo that spools at 3000 RPM feels great on the street. One that doesn't wake up until 5000 RPM is frustrating.",
  },

  rpmlimiter: {
    tutorial: "The RPM limiter is the electronic ceiling that prevents the engine from over-revving. Higher limits allow more peak power but increase mechanical stress. Lower limits protect the engine.",
    impacts: ["power", "reliability", "durability"],
    tip: "Set the limiter 500 RPM above peak power RPM. Going higher just adds stress without gaining power.",
    dangerZone: "Limiters above 9000 RPM require race-grade valvetrain components. Above 11000 RPM is exotic territory.",
  },

  coolingradiator: {
    tutorial: "Radiator size determines cooling capacity. Larger radiators dissipate more heat, keeping the engine in its optimal temperature range. Undersized radiators lead to overheating under sustained load.",
    impacts: ["reliability", "cooling", "weight", "cost"],
    tip: "Always oversize your radiator for turbocharged builds. A $120 bigger radiator is far cheaper than a blown engine.",
  },

  oilcooler: {
    tutorial: "Oil coolers maintain oil temperature within optimal range. Hot oil loses viscosity and can't protect engine bearings. Essential for high-performance and track applications.",
    impacts: ["reliability", "cooling", "cost", "weight"],
    tip: "If you're doing any sustained high-load driving (track days, towing), an oil cooler is mandatory.",
  },

  intercoolersize: {
    tutorial: "The intercooler cools compressed air from the turbo before it enters the engine. Cooler air is denser, making more power and reducing knock risk. Larger intercoolers cool better but add weight and piping length.",
    impacts: ["power", "reliability", "weight", "cooling"],
    tip: "Size your intercooler generously. Heat soak is the #1 reason turbocharged cars lose power on hot days or after multiple pulls.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE — Electric / Hybrid
  // ═══════════════════════════════════════════════════════════════════════════

  batterychemistry: {
    tutorial: "Battery chemistry determines energy density, charge speed, weight, cost, and lifespan. Lithium-ion (NMC) offers great energy density. LFP (iron phosphate) is safer and longer-lasting but heavier. Solid-state is cutting-edge.",
    impacts: ["weight", "cost", "reliability", "efficiency", "safety"],
    tip: "NMC is the best all-around choice for EVs. LFP is better for budget vehicles prioritizing longevity over range.",
  },

  batterycapacity: {
    tutorial: "Battery capacity (kWh) determines how much energy the car can store, directly affecting range. Larger batteries add significant weight but extend range. Finding the right balance is critical.",
    impacts: ["weight", "cost", "efficiency", "speed"],
    tip: "Every extra kWh adds roughly 6–8 kg of weight. Sometimes a smaller, lighter battery with better efficiency gives better overall performance.",
  },

  motortype: {
    tutorial: "Electric motor type affects power delivery, efficiency, and cost. Permanent magnet motors are efficient at all speeds. Induction motors are robust and cheaper but less efficient at low loads.",
    impacts: ["power", "torque", "efficiency", "cost", "weight"],
    tip: "Permanent magnet synchronous motors (PMSM) are the gold standard for performance EVs. Induction motors work well for budget builds.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VEHICLE — Platform & Chassis
  // ═══════════════════════════════════════════════════════════════════════════

  platform: {
    tutorial: "The platform defines the vehicle's fundamental architecture — front-engine, mid-engine, or rear-engine, and the drivetrain layout (FWD/RWD/AWD). This is the most consequential design decision.",
    impacts: ["handling", "weight", "grip", "cost", "speed"],
    tip: "Mid-engine RWD offers the best weight distribution for handling. Front-engine AWD is best for all-weather performance. FWD is most cost-effective.",
  },

  drivetraindrivetype: {
    tutorial: "Drivetrain layout determines which wheels receive engine power (FWD, RWD, or AWD). Each option dramatically alters acceleration launch traction, corner exit behavior, weight, driveline efficiency, and vehicle cost.",
    impacts: ["grip", "handling", "weight", "cost", "efficiency", "speed"],
    tip: "AWD delivers 0-60 launches and all-weather traction. RWD offers uncorrupted steering and power-oversteer thrills. FWD minimizes weight and cost.",
  },

  fwd: {
    tutorial: "Front-Wheel Drive puts engine power through the steering wheels. It is lightweight, efficient, and cheap to produce. Under hard acceleration, weight transfers to the rear, reducing front tire traction.",
    impacts: ["weight", "cost", "efficiency", "handling"],
    tip: "Keep high-power FWD builds under 300 HP to avoid severe torque steer and power understeer on corner exit.",
  },

  rwd: {
    tutorial: "Rear-Wheel Drive isolates front tires for pure steering while rear tires handle acceleration. Hard acceleration transfers weight onto the rear axle, increasing traction.",
    impacts: ["handling", "grip", "speed"],
    tip: "RWD is the classic sports car standard. Pair with a Limited-Slip Differential (LSD) for optimal corner-exit acceleration.",
  },

  awd: {
    tutorial: "All-Wheel Drive routes engine torque to both axles. Provides maximum standing-start launch grip by using the entire contact patch of all four tires, but adds ~75kg and mechanical drag.",
    impacts: ["grip", "speed", "weight", "cost", "efficiency"],
    tip: "Essential for 0-60 times under 3.5 seconds or high-horsepower builds >500 HP.",
  },

  engineplacementposition: {
    tutorial: "Engine placement (Front, Mid, or Rear) dictates vehicle center of gravity and polar moment of inertia. It determines front/rear weight balance, turn-in agility, braking stability, and slide recovery.",
    impacts: ["handling", "weight", "grip", "braking", "speed"],
    tip: "Mid-engine gives lightning-fast turn-in and near-50/50 balance. Front-engine gives predictable understeer. Rear-engine gives unrivaled rear launch traction.",
  },

  frontengine: {
    tutorial: "Engine is positioned ahead or over the front axle. Produces a front-heavy weight distribution (55-62% front), ensuring predictable, stable handling and strong front-axle highway tracking.",
    impacts: ["handling", "comfort", "safety"],
    tip: "Set front brake bias slightly higher (62-65%) to account for forward weight transfer under heavy braking.",
  },

  midengine: {
    tutorial: "Engine is mounted between the front and rear axles behind the passenger cabin. Centralizes heavy mass near the center of gravity, dramatically lowering polar moment of inertia for razor-sharp turn-in agility.",
    impacts: ["handling", "grip", "speed", "cost"],
    tip: "The gold standard for supercars. Gives 44/56 weight balance and high cornering speeds, but watch out for snap oversteer at the limits.",
  },

  rearengine: {
    tutorial: "Engine is mounted behind the rear axle. Under acceleration, mass transfers directly onto the rear tires for unmatched launch traction. Creates a rear-heavy 38/62 weight bias.",
    impacts: ["grip", "speed", "handling", "braking"],
    tip: "Rear engine layouts launch harder than RWD front-engine cars. Be cautious with lift-off oversteer in high-speed turns.",
  },

  chassis: {
    tutorial: "The chassis is the structural skeleton of the car. Steel unibody is cheapest but heaviest. Aluminum spaceframe saves weight at moderate cost. Carbon fiber tub is the lightest but most expensive.",
    impacts: ["weight", "cost", "handling", "safety", "manufacturing"],
    tip: "Aluminum spaceframe is the sweet spot for most performance cars. Carbon tub only makes sense for supercars where cost is no object.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VEHICLE — Suspension
  // ═══════════════════════════════════════════════════════════════════════════

  frontsuspension: {
    tutorial: "Front suspension type determines how the front wheels connect to the chassis and move over bumps. Double wishbone allows precise camber control. MacPherson strut is simpler and cheaper but less adjustable.",
    impacts: ["handling", "comfort", "cost", "weight", "grip"],
    tip: "Double wishbone is superior for track use due to better camber control during cornering. MacPherson is fine for road cars.",
  },

  rearsuspension: {
    tutorial: "Rear suspension affects traction, handling balance, and ride comfort. Multi-link offers the most tuning adjustability. Solid axle is simple and strong but less refined.",
    impacts: ["handling", "comfort", "grip", "cost", "weight"],
    tip: "Multi-link rear suspension gives the best handling adjustability. Use it for any car where handling matters.",
  },

  springratef: {
    tutorial: "Front spring rate determines how stiff the front suspension is. Stiffer springs reduce body roll and improve turn-in response, but make the ride harsher and reduce front grip on bumpy surfaces.",
    impacts: ["handling", "comfort", "grip"],
    tip: "As a rule, front springs should be 5–15% stiffer than rears for a neutral handling balance. Too stiff = understeer on bumps.",
    dangerZone: "Spring rates above 200 N/mm make the car very harsh on the street and can actually reduce grip on rough tracks.",
  },

  springrater: {
    tutorial: "Rear spring rate controls rear suspension stiffness. Softer rears improve traction on exit. Stiffer rears reduce squat under acceleration but can cause snap oversteer.",
    impacts: ["handling", "comfort", "grip"],
    tip: "Rear springs slightly softer than fronts give a neutral, forgiving balance. Increase rear stiffness for more rotation (oversteer tendency).",
  },

  damperf: {
    tutorial: "Front dampers control how quickly the front springs compress and rebound. More damping reduces oscillation and body movement. Too much damping makes the car skip over bumps instead of absorbing them.",
    impacts: ["handling", "comfort", "grip"],
    tip: "Start at 50–60% damping and adjust from there. More damping = more stability but less grip on rough surfaces.",
  },

  damperr: {
    tutorial: "Rear dampers control how the rear of the car responds to bumps and weight transfer. They directly affect traction on corner exit and stability under braking.",
    impacts: ["handling", "comfort", "grip"],
    tip: "Slightly less rear damping than front promotes rear grip. Increase rear damping to calm an oversteering car.",
  },

  rideheight: {
    tutorial: "Ride height is the gap between the car's underbody and the ground. Lower ride height improves aerodynamics and lowers the center of gravity for better handling, but reduces ground clearance.",
    impacts: ["aero", "handling", "comfort", "speed"],
    tip: "Lower is better for performance, but make sure you clear speed bumps and track curbs. 80–120mm is a good track range.",
    dangerZone: "Below 60mm risks scraping the underbody on any surface imperfection.",
  },

  camberf: {
    tutorial: "Front camber is the inward tilt of the front wheels. Negative camber improves cornering grip by keeping more tire in contact with the road during turns. Too much reduces straight-line braking grip.",
    impacts: ["handling", "grip", "braking"],
    tip: "Street cars: -0.5° to -1.5°. Track cars: -2.0° to -3.5°. More than -4° eats tires and hurts braking.",
    dangerZone: "Camber beyond -4° causes excessive inner tire wear and reduced braking performance.",
  },

  camberr: {
    tutorial: "Rear camber is the inward tilt of the rear wheels. Negative rear camber improves rear cornering grip and stability. Too much reduces traction on corner exit.",
    impacts: ["handling", "grip"],
    tip: "Keep rear camber 0.3–0.5° less negative than front for a stable, predictable balance.",
  },

  antirollbarf: {
    tutorial: "The front anti-roll bar (sway bar) connects the left and right front wheels. A stiffer bar reduces body roll but transfers more load to the outside wheel, which can cause understeer.",
    impacts: ["handling", "comfort"],
    tip: "Stiffer front ARB = less body roll but more understeer. Soften the front bar to reduce understeer.",
  },

  antirollbarr: {
    tutorial: "The rear anti-roll bar affects how much the rear of the car rolls in corners. A stiffer rear bar reduces body roll but can cause oversteer by unloading the inside rear wheel.",
    impacts: ["handling", "comfort"],
    tip: "Stiffen the rear ARB to rotate the car more (reduce understeer). Be careful — too much causes snap oversteer on lift-off.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VEHICLE — Brakes & Wheels
  // ═══════════════════════════════════════════════════════════════════════════

  brakediscmaterial: {
    tutorial: "Brake disc material determines heat capacity, weight, and cost. Cast iron is standard. Carbon-ceramic is lighter and handles heat better but costs 10× more. Suited for track and supercars.",
    impacts: ["braking", "weight", "cost", "durability"],
    tip: "Carbon-ceramic brakes only make sense for frequent track use or supercars. For road use, quality steel discs are fine.",
  },

  caliperpistons: {
    tutorial: "More caliper pistons distribute clamping force more evenly across the brake pad. 2-piston is basic, 4-piston is performance standard, 6-piston is for heavy/fast cars, 8-piston is race-grade.",
    impacts: ["braking", "cost", "weight"],
    tip: "4-piston monobloc calipers are the sweet spot for most performance cars. 6-piston is worth it for cars over 1600kg or 400hp.",
  },

  brakedisc: {
    tutorial: "Brake disc diameter affects heat absorption and braking torque. Larger discs dissipate heat better and provide stronger braking, but are heavier and need bigger wheels to fit.",
    impacts: ["braking", "weight", "cost"],
    tip: "Match disc size to wheel diameter. 330mm discs need at least 17\" wheels. 380mm+ needs 19\" wheels minimum.",
  },

  brakepad: {
    tutorial: "Brake pad compound determines the friction characteristics. Aggressive compounds (high %) grip harder when hot but are noisy and wear quickly. Mild compounds (low %) are quiet and long-lasting but fade under hard use.",
    impacts: ["braking", "noise", "durability", "cost"],
    tip: "Use aggressive pads (70–80%) for track use. 40–50% compound is ideal for spirited street driving without excessive noise.",
  },

  brakebias: {
    tutorial: "Brake bias determines how much braking force goes to the front vs rear wheels. More front bias (higher %) provides stable, understeer-on-brakes behavior. More rear bias improves rotation but risks lock-up.",
    impacts: ["braking", "handling", "safety"],
    tip: "60–65% front bias is the safe default. Trail-braking enthusiasts may prefer 55–58% for a more rotatable car under braking.",
    dangerZone: "Front bias below 50% is extremely dangerous — rear wheels will lock first, causing spin.",
  },

  wheeldia: {
    tutorial: "Wheel diameter affects ride comfort, grip, braking space, and aesthetics. Larger wheels allow bigger brakes and look sporty, but are heavier and have thinner tires with a harsher ride.",
    impacts: ["handling", "comfort", "weight", "cost", "braking"],
    tip: "18\" is the sweet spot for most performance cars — big enough for good brakes, small enough for decent tire sidewall.",
  },

  wheelwidth: {
    tutorial: "Wider wheels allow wider tires, which means more contact patch and more grip. However, wider wheels add weight, increase rolling resistance, and can cause clearance issues.",
    impacts: ["grip", "handling", "weight", "aero", "efficiency"],
    tip: "Match wheel width to tire width. A 255mm tire needs roughly 8.5–9\" wide wheel. Going wider than the tire wastes potential grip.",
  },

  tirepressure: {
    tutorial: "Tire pressure affects the contact patch shape, grip level, tire wear, and ride comfort. Lower pressure increases grip but causes more tire flex and heat. Higher pressure improves efficiency but reduces grip.",
    impacts: ["grip", "handling", "comfort", "efficiency", "durability"],
    tip: "For track: run 1.8–2.2 bar hot. For street: 2.2–2.6 bar cold. Check pressures when tires are hot on track to fine-tune.",
  },

  tirecompound: {
    tutorial: "Tire compound determines the rubber's grip level and durability. Softer compounds (slicks, semi-slicks) offer maximum grip but wear quickly. Harder compounds (all-season) last longer but have less grip.",
    impacts: ["grip", "handling", "cost", "durability", "noise"],
    tip: "Semi-slick tires are the ultimate street-legal track tire. Use all-season only for daily drivers or bad weather.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VEHICLE — Transmission
  // ═══════════════════════════════════════════════════════════════════════════

  gearboxtype: {
    tutorial: "The gearbox transmits engine power to the wheels. Manual is lightest and most engaging. Dual-clutch (DCT) is fastest-shifting. Automatic (torque converter) is smoothest. CVT is most efficient.",
    impacts: ["weight", "cost", "power", "efficiency", "handling"],
    tip: "DCT is the performance king — lightning-fast shifts with no power interruption. Manual is lighter and more fun. Avoid CVT for anything performance-oriented.",
  },

  finaldrive: {
    tutorial: "The final drive ratio is the last gear reduction before the wheels. A higher ratio (numerically larger, e.g., 4.5) gives more acceleration but lower top speed. A lower ratio (e.g., 3.0) gives higher top speed but slower acceleration.",
    impacts: ["speed", "torque", "efficiency"],
    tip: "For track use, use a shorter (higher number) final drive to keep the engine in the power band. For top speed, use a taller (lower number) ratio.",
  },

  differential: {
    tutorial: "The differential splits power between the driven wheels. An open diff is simple but lets the unloaded wheel spin. LSD (limited slip) sends power to the wheel with grip. Active diffs are electronically controlled.",
    impacts: ["handling", "grip", "cost", "weight"],
    tip: "LSD is essential for any performance car. Torsen type is maintenance-free. Clutch-type LSD is adjustable but needs periodic service.",
  },

  diffpreload: {
    tutorial: "Differential preload is the initial clamping force in a limited-slip diff. Higher preload makes the diff lock up earlier, sending power to both wheels sooner. Lower preload keeps the diff more open.",
    impacts: ["handling", "grip"],
    tip: "Higher preload = more mechanical grip on corner exit. But too much makes the car push (understeer) in tight corners. 30–50% is a good starting point.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VEHICLE — Electronics
  // ═══════════════════════════════════════════════════════════════════════════

  abs: {
    tutorial: "Anti-lock braking system (ABS) prevents wheel lock-up during hard braking, allowing you to steer while braking. Essential for wet conditions and panic stops.",
    impacts: ["braking", "safety", "handling"],
    tip: "Always enable ABS for road cars. Even race cars benefit from ABS in most conditions. Only disable for very advanced drift setups.",
  },

  launchcontrol: {
    tutorial: "Launch control manages wheelspin during standing starts for maximum acceleration. It holds RPM at the optimal launch point and modulates traction as you release the clutch.",
    impacts: ["speed", "grip", "reliability"],
    tip: "Launch control gives the most consistent 0-60 times. But frequent use puts extra stress on the drivetrain and clutch.",
  },

  tractioncontrol: {
    tutorial: "Traction control (TC) reduces engine power or applies brakes when it detects wheelspin. Higher settings intervene more aggressively. At 0%, the system is off. At 100%, it's maximum intervention.",
    impacts: ["grip", "safety", "speed", "handling"],
    tip: "For wet conditions, run 70–90% TC. For dry track, 30–50% lets you use some slip for faster lap times. 0% is for experts only.",
  },

  stabilitycontrol: {
    tutorial: "Electronic Stability Control (ESC) detects and reduces loss of traction. It automatically brakes individual wheels to prevent oversteer and understeer. Higher settings are more restrictive.",
    impacts: ["safety", "handling"],
    tip: "Keep ESC on for road driving — it saves lives. For track use, reduce to 30–50% to allow more car rotation without full slides.",
  },

  ecumap: {
    tutorial: "The ECU map is a pre-programmed set of engine parameters (fuel, timing, boost) optimized for different driving scenarios. Eco mode prioritizes fuel savings. Track mode maximizes power.",
    impacts: ["power", "efficiency", "reliability", "emissions"],
    tip: "Use Eco for commuting, Sport for spirited driving, and Track for maximum performance on circuit. Track mode reduces engine protection margins.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERIOR
  // ═══════════════════════════════════════════════════════════════════════════

  seattype: {
    tutorial: "Seat type affects weight, comfort, and lateral support. Standard seats are comfortable but heavy. Sport seats add bolstering. Full bucket seats lock you in place but sacrifice comfort.",
    impacts: ["weight", "comfort", "safety", "cost", "handling"],
    tip: "For track days, bucket seats with harness points keep you firmly in place during high-G cornering. For luxury, opt for heated/ventilated comfort seats.",
  },

  seatmaterial: {
    tutorial: "Seat material affects weight, comfort, luxury perception, and durability. Cloth is lightest and cheapest. Leather adds luxury feel. Alcantara provides grip and a sporty feel.",
    impacts: ["weight", "cost", "comfort", "luxury"],
    tip: "Alcantara is the choice of race teams — it grips your suit and doesn't get slippery when wet. Leather screams luxury.",
  },

  seatcount: {
    tutorial: "The number of seats affects weight, interior space, and vehicle purpose. Two seats maximize weight savings for a sports car. Four or five seats make it practical for family use.",
    impacts: ["weight", "cost", "comfort"],
    tip: "Every seat you remove saves 15–25kg. For a dedicated track car, go with two. For a GT car, keep four.",
  },

  dashboardmaterial: {
    tutorial: "Dashboard material affects perceived quality, weight, and cost. Plastic is cheapest. Carbon fiber is lightest but most expensive. Wood and leather feel premium.",
    impacts: ["weight", "cost", "luxury"],
    tip: "Carbon fiber dashboard saves several kg over plastic but costs 5× more. It's about priorities.",
  },

  screensize: {
    tutorial: "Infotainment screen size affects the user experience, weight, and luxury perception. Larger screens are more functional but heavier and more expensive.",
    impacts: ["weight", "cost", "luxury", "comfort"],
    tip: "10–12\" is the sweet spot for usability. Larger screens are impressive but add unnecessary weight for track-focused cars.",
  },

  speakers: {
    tutorial: "Audio speaker count affects sound quality, weight, and cost. More speakers enable more immersive surround sound but add weight. A high-quality 8-speaker system outperforms a mediocre 16-speaker one.",
    impacts: ["weight", "cost", "luxury", "comfort"],
    tip: "Quality over quantity — 6–8 premium speakers beat 20 cheap ones. For track cars, delete audio entirely to save 8–15kg.",
  },

  ambientlighting: {
    tutorial: "Ambient lighting creates atmosphere inside the cabin with LED strips. More lighting adds luxury perception but increases cost and draws power. Zero ambient lighting is raw and race-focused.",
    impacts: ["luxury", "cost", "comfort"],
    tip: "Subtle ambient lighting dramatically increases luxury perception. A little goes a long way — 40–60% is the sweet spot.",
  },

  sounddeadening: {
    tutorial: "Sound deadening material reduces road noise, engine noise, and vibration in the cabin. More deadening increases comfort and luxury but adds significant weight (up to 20kg at full).",
    impacts: ["weight", "comfort", "luxury", "noise"],
    tip: "For luxury cars, maximize sound deadening. For track cars, remove it all — every kg matters. For GT cars, use 40–60%.",
    dangerZone: "Full sound deadening adds 15–20kg. On a 1000kg lightweight sports car, that's nearly 2% of total weight.",
  },

  rollcage: {
    tutorial: "A roll cage is a framework of metal tubes inside the cabin that protects occupants in a rollover. Required for motorsport. Adds significant weight but dramatically improves chassis rigidity and safety.",
    impacts: ["safety", "weight", "handling", "cost"],
    tip: "For any track use, at least a half cage is recommended. A full FIA-spec cage adds ~40kg but can save your life.",
  },

  racingharness: {
    tutorial: "A multi-point racing harness replaces the standard seatbelt, holding the driver firmly in position during high-G forces. Required for motorsport alongside a bucket seat and HANS device.",
    impacts: ["safety", "comfort"],
    tip: "Always pair racing harnesses with bucket seats and a roll cage. A harness without a cage can be more dangerous in a rollover.",
  },

  harnesspoints: {
    tutorial: "Harness point count (4, 5, or 6) determines how securely the driver is held. 4-point is basic. 5-point adds an anti-submarine strap. 6-point is the FIA standard for maximum safety.",
    impacts: ["safety"],
    tip: "6-point harnesses are the gold standard for circuit racing. 4-point is adequate for track days and hillclimbs.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AERO LAB
  // ═══════════════════════════════════════════════════════════════════════════

  diffuserangle: {
    tutorial: "The rear diffuser angle controls how aggressively air accelerates under the car's rear. Steeper angles generate more downforce (ground effect) but risk flow separation, causing sudden downforce loss.",
    impacts: ["aero", "handling", "speed"],
    tip: "Keep diffuser angle under 12° for reliable, attached flow. Between 12–18° requires careful design. Above 18° risks sudden separation.",
    dangerZone: "Diffuser angles above 18° will likely cause flow separation, making downforce inconsistent and unpredictable.",
  },

  diffuserchannels: {
    tutorial: "Diffuser channels (or strakes) divide the diffuser into sections, helping maintain organized airflow and preventing cross-flow. More channels improve diffuser efficiency at the cost of complexity.",
    impacts: ["aero", "cost", "manufacturing"],
    tip: "3–5 channels is optimal for most applications. More channels help at high speeds but add manufacturing complexity.",
  },

  diffuserlength: {
    tutorial: "Diffuser length determines how gradually the air expands. Longer diffusers allow gentler expansion (lower angle for same exit area), reducing separation risk. But they require more underbody real estate.",
    impacts: ["aero", "handling"],
    tip: "Longer is generally better for attached flow. If packaging is tight, increase channels or add vortex generators instead.",
  },

  rearwingangleofattack: {
    tutorial: "Rear wing angle of attack (AoA) is how steeply the wing is tilted into the airflow. More angle generates more downforce but also more drag. It's the primary downforce vs. top speed trade-off.",
    impacts: ["aero", "speed", "handling", "grip"],
    tip: "For high-speed tracks with long straights, use 3–8°. For tight, technical tracks, use 12–20°. Above 25° adds more drag than useful downforce.",
  },

  rearwingspan: {
    tutorial: "Rear wing span is the width of the wing element. A wider wing generates more downforce but also creates stronger tip vortices. Endplates help manage these vortices.",
    impacts: ["aero", "handling"],
    tip: "Match wing span to car width for best efficiency. Wider-than-car wings look dramatic but may not be street legal.",
  },

  splitterextension: {
    tutorial: "The front splitter is a flat plate extending forward from the bumper. It creates a high-pressure zone above and low-pressure below, generating front downforce. More extension = more downforce and more drag.",
    impacts: ["aero", "handling", "speed"],
    tip: "60–120mm of splitter extension is effective for most cars. Pair with dive planes for even more front downforce on track builds.",
    dangerZone: "Excessive splitter extension (>200mm) makes the car very sensitive to ride height changes and is prone to ground contact.",
  },

  bodyshape: {
    tutorial: "Body shape streamlining (0–100%) controls how aerodynamically optimized the overall body form is. Higher values mean a sleeker, lower-drag shape but may limit interior space and styling freedom.",
    impacts: ["aero", "speed", "efficiency"],
    tip: "For GT cars, aim for 60–80% streamlining. For track specials, push to 90%+. For city cars where styling matters more, 30–50% is fine.",
  },

  activegrileshutters: {
    tutorial: "Active grille shutters close the front grille openings at highway speeds when cooling isn't needed, reducing drag significantly. They open automatically when the engine needs cooling.",
    impacts: ["aero", "efficiency", "cooling"],
    tip: "Active grille shutters can improve highway fuel economy by 2–3%. They're cheap, light, and effective — always worth adding.",
  },

  activerearwing: {
    tutorial: "An active rear wing adjusts its angle automatically based on speed and braking. It deploys as an air brake and adjusts downforce levels for different speeds, giving you the best of both worlds.",
    impacts: ["aero", "braking", "handling", "speed"],
    tip: "Active aero is the holy grail — maximum downforce in corners, minimum drag on straights. Worth the cost and complexity.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTERIOR
  // ═══════════════════════════════════════════════════════════════════════════

  bodytype: {
    tutorial: "Body type determines the car's fundamental shape — coupe, sedan, SUV, convertible, etc. Each has different aerodynamic properties, weight, interior space, and market appeal.",
    impacts: ["aero", "weight", "cost", "speed", "comfort"],
    tip: "Coupes have the best aerodynamics. Sedans balance practicality and aero. SUVs are heavy and draggy but popular.",
  },

  paintfinish: {
    tutorial: "Paint finish affects appearance, durability, and cost. Metallic and pearl finishes look premium but cost more. Matte finishes are trendy but require special care. Solid colors are cheapest.",
    impacts: ["cost", "luxury"],
    tip: "Pearl and metallic finishes add perceived value without much weight. Great for luxury positioning.",
  },

  spoilertype: {
    tutorial: "The spoiler disrupts airflow over the rear of the car to reduce lift (or add downforce). A lip spoiler is subtle. A GT wing is aggressive. Each has different aero effects.",
    impacts: ["aero", "handling", "speed", "weight"],
    tip: "A subtle lip spoiler reduces rear lift with minimal drag penalty. GT wings add real downforce but significant drag.",
  },

  bodykit: {
    tutorial: "A body kit modifies the car's external panels for improved aerodynamics or aesthetics. Widebody kits allow wider tires. Aero kits add splitters, canards, and diffuser elements.",
    impacts: ["aero", "weight", "cost", "grip"],
    tip: "Widebody kits allow fitting much wider tires, which dramatically improves grip. Aero kits improve downforce at high speed.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MANUFACTURING
  // ═══════════════════════════════════════════════════════════════════════════

  framematerial: {
    tutorial: "Frame material is the primary structural material of the car's chassis frame. Steel is cheapest but heaviest. Aluminum is lighter but costs more. Carbon fiber is lightest but very expensive and hard to repair.",
    impacts: ["weight", "cost", "safety", "manufacturing", "durability"],
    tip: "High-strength steel offers the best safety-to-cost ratio. Aluminum saves 30–40% weight. Carbon fiber saves 50–60% but at 5–10× the cost.",
  },

  process: {
    tutorial: "The manufacturing process determines how the car is built — hand-built, semi-automated, fully robotic, etc. More automation reduces defects and labor costs but requires massive upfront investment.",
    impacts: ["cost", "manufacturing", "reliability"],
    tip: "For low-volume (<500/year), hand-building with jigs is most cost-effective. For volume production (>5000/year), robotic assembly pays for itself quickly.",
  },

  factorytier: {
    tutorial: "Factory tier represents the sophistication of your manufacturing facility. Higher-tier factories have better tooling, climate control, and quality systems, producing better cars at higher cost.",
    impacts: ["cost", "manufacturing", "reliability"],
    tip: "Match factory tier to your target market. A budget car doesn't need a Tier 1 facility, but a luxury car absolutely does.",
  },

  automationlevel: {
    tutorial: "Automation level is the percentage of manufacturing done by robots vs. humans. More automation improves consistency and reduces labor cost but increases capital expenditure.",
    impacts: ["cost", "manufacturing", "reliability"],
    tip: "70–85% automation is the sweet spot for most production cars. 100% automation removes the human touch needed for premium fit-and-finish.",
  },

  qclevel: {
    tutorial: "Quality control level determines how rigorously each car is inspected and tested. Higher QC catches more defects but slows production and adds cost per unit.",
    impacts: ["reliability", "cost", "manufacturing"],
    tip: "Luxury and performance brands need the highest QC — a single defect destroys brand reputation. Budget cars can get by with standard QC.",
  },

  batchsize: {
    tutorial: "Batch size is how many units are produced in each manufacturing run. Larger batches reduce per-unit cost through economies of scale. Smaller batches allow more customization and flexibility.",
    impacts: ["cost", "manufacturing"],
    tip: "For limited-edition models, small batches (50–200) create exclusivity. For volume models, batches of 1000+ minimize per-unit costs.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INFOTAINMENT / ELECTRONICS
  // ═══════════════════════════════════════════════════════════════════════════

  datalogging: {
    tutorial: "Data logging records engine, chassis, and driver inputs in real-time for later analysis. Essential for development and track use. Adds weight and cost from sensors and hardware.",
    impacts: ["weight", "cost", "reliability"],
    tip: "Always enable data logging during development. The insights gained far outweigh the minimal weight and cost penalty.",
  },

  navigation: {
    tutorial: "Built-in GPS navigation adds convenience but also cost and weight. With smartphone integration (Android Auto / Apple CarPlay), built-in nav is less critical than it once was.",
    impacts: ["cost", "weight", "luxury", "comfort"],
    tip: "For budget builds, skip built-in nav and rely on phone-based navigation. For luxury cars, integrated nav is expected.",
  },

  premiumaudio: {
    tutorial: "Premium audio systems use higher-quality speakers, amplifiers, and signal processing for superior sound quality. Brands like Bose, Harman Kardon, and Bang & Olufsen are common upgrades.",
    impacts: ["weight", "cost", "luxury", "comfort"],
    tip: "Premium audio adds 5–10kg and $500–2000 in cost but significantly increases perceived vehicle quality and luxury rating.",
  },

  climatecontrol: {
    tutorial: "Climate control automatically maintains cabin temperature. Basic systems have manual controls. Dual-zone and quad-zone systems let different passengers set different temperatures.",
    impacts: ["comfort", "cost", "weight", "luxury"],
    tip: "Dual-zone climate is the minimum for any car positioned as premium. For track-only cars, delete climate control to save weight.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERAL — Cross-cutting
  // ═══════════════════════════════════════════════════════════════════════════

  wheelaero: {
    tutorial: "Wheel aerodynamics affect turbulence around the wheel wells — one of the biggest drag sources on a car. Aero discs and wheel covers smooth the airflow, reducing drag significantly.",
    impacts: ["aero", "speed", "efficiency", "braking", "cooling"],
    tip: "Aero wheel covers can reduce drag by Cd 0.005–0.015, meaningfully improving top speed and fuel economy. But they restrict brake cooling.",
  },

  steeringwheel: {
    tutorial: "Steering wheel type affects driver feel, weight, and aesthetics. A flat-bottom wheel is sporty and provides more legroom. A full round wheel is traditional. A butterfly wheel is race-inspired.",
    impacts: ["weight", "comfort", "luxury", "handling"],
    tip: "Flat-bottom steering wheels are the most popular choice for sports cars — they look great and improve knee clearance for heel-toe downshifts.",
  },

  pedalset: {
    tutorial: "Pedal set material and design affect feel, weight, and aesthetics. Aluminum pedals are lighter and more sporty. Rubber pedals provide better wet grip. Adjustable pedals suit different driver heights.",
    impacts: ["weight", "comfort", "safety"],
    tip: "Aluminum sport pedals with rubber inserts give the best of both worlds — sporty look with good grip.",
  },

  trimfinish: {
    tutorial: "Interior trim finish affects the visual and tactile quality of the cabin. Matte is understated. Gloss is premium but shows fingerprints. Brushed aluminum is sporty. Satin is the modern luxury standard.",
    impacts: ["luxury", "cost"],
    tip: "Satin finish is currently the most popular luxury trend — it looks premium without the fingerprint issues of glossy surfaces.",
  },

  fireextinguisher: {
    tutorial: "A fire extinguisher is a mandatory safety item for any motorsport use. Even for track days, it's strongly recommended. Adds about 2–3kg but could save your life and your car.",
    impacts: ["safety", "weight"],
    tip: "Mount the fire extinguisher within arm's reach of the driver. A 2kg dry powder unit is the minimum for track use.",
  },

  windownet: {
    tutorial: "A window net prevents the driver's arms from exiting the car during a rollover. Required by many racing organizations. Critical safety equipment for open-cockpit or roll-cage-equipped cars.",
    impacts: ["safety"],
    tip: "Window nets are cheap, light, and can prevent serious arm injuries. Required for most sanctioned racing series.",
  },
};

// Build a normalized lookup map for fast access
const LOOKUP_MAP = new Map<string, ApexKnowledgeEntry>();
for (const [key, entry] of Object.entries(KNOWLEDGE_DB)) {
  LOOKUP_MAP.set(key, entry);
}

/**
 * Look up knowledge entry by label text.
 * Performs fuzzy matching by normalizing the label (removing spaces, punctuation, lowering).
 */
export function getApexKnowledge(label: string): ApexKnowledgeEntry | null {
  const normalized = normalizeKey(label);

  // Direct match
  if (LOOKUP_MAP.has(normalized)) {
    return LOOKUP_MAP.get(normalized)!;
  }

  // Partial / alias matching — try key fragments
  for (const [key, entry] of LOOKUP_MAP.entries()) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return entry;
    }
  }

  return null;
}

/**
 * Get all impact areas from an entry as styled badge data
 */
export function getImpactBadges(impacts: ImpactArea[]): { label: string; color: string }[] {
  const IMPACT_COLORS: Record<ImpactArea, string> = {
    power: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    torque: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    weight: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    cost: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    handling: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    aero: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    reliability: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    efficiency: "bg-green-500/20 text-green-300 border-green-500/30",
    comfort: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    safety: "bg-red-500/20 text-red-300 border-red-500/30",
    noise: "bg-amber-500/20 text-amber-300 border-violet-500/30",
    cooling: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    braking: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    speed: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    grip: "bg-lime-500/20 text-lime-300 border-lime-500/30",
    durability: "bg-amber-500/20 text-amber-300 border-indigo-500/30",
    luxury: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
    emissions: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    manufacturing: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };

  return impacts.map((impact) => ({
    label: impact.charAt(0).toUpperCase() + impact.slice(1),
    color: IMPACT_COLORS[impact] || "bg-base-800 text-slate-400 border-base-700",
  }));
}
