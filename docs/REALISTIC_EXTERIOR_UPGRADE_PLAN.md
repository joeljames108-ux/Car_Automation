# Master Implementation Plan: Realistic Exterior GLB Upgrades & Quality Protocol

## 1. Executive Summary & Forensic Audit of Previous GLB Mistakes

A critical forensic inspection of previously generated vehicle GLBs across the fleet revealed fundamental CAD engineering deficiencies that compromised visual authenticity and interactive compliance:

### Critical Flaws Identified in Prior Builds:
1. **Opaque / Solid Body Underneath Window Glass**:
   - In models like the Bugatti Chiron, the body shell was lofted as a single continuous surface across the roof and windshield. Over **16,300 vertices of solid glossy carbon fiber sheet metal** remained directly underneath the greenhouse glass.
   - As a result, the "glass" appeared opaque and reflective, completely concealing the cabin interior.
2. **Primitive 3-Cube Glass Geometry**:
   - In `class_a_cad_subsystem_factory.py`, the glass for sedans, coupes, SUVs, trucks, and sports cars consisted of three flat, uncurved cubes intersecting the body shell.
   - Missing double-curved aerodynamic windshield curvature, black ceramic frit (serigraphy) dot-matrix borders, A/B/C-pillar structural framing, and rubber weatherstripping seals.
3. **Missing or Non-Articulating Fake Doors**:
   - In the majority of fleet models, doors were completely welded into the continuous body mesh without separate door objects or physical shutlines.
   - Where door meshes existed (e.g. Countach), they were flat 2-quad plates hovering over a solid unibody with origins at `(0, 0, 0)`. When rotated, the door swiveled around the center of the car on the ground rather than a physical hinge vector.
   - Missing structural inner door cards, inner door jambs, and door window glass mounted to the moving door frame.
4. **Synthetic Validator Inflation**:
   - Node injection scripts (`inject_interactive_glb_standards.mjs`) added lightweight dummy hitboxes and empty animation tracks to achieve passing scores without delivering the underlying CAD geometry.

---

## 2. The Mandatory New Rules (Realistic Exterior Upgrade Protocol)

In accordance with strict project directives, the following mandatory standards govern all automotive GLB production:

### Rule 1: Minimum 1 Hour Intensive Work per Vehicle
- Every vehicle GLB must receive at least **60 minutes of dedicated, methodical procedural CAD modeling, topology sculpting, materials calibration, and kinematic rigging**.
- Rushing to export draft assets is strictly prohibited. Time consumption is NOT a factor; maximum Class-A visual fidelity is paramount.

### Rule 2: The 5-Angle Visual Validation Standard (1 Set = 5 Photos)
Every visual validation set consists of 5 canonical automotive angles captured directly from the live viewport:
1. **Front 3/4 Dynamic Perspective** (`CAMERA_FRONT_34`): $70^\circ$ pitch, $225^\circ$ yaw, distance 5.5m. Validates front stance, fender crown, wheel fitment, windshield rake, and shutlines.
2. **Rear 3/4 Dynamic Perspective** (`CAMERA_REAR_34`): $70^\circ$ pitch, $45^\circ$ yaw, distance 5.5m. Validates muscular rear haunches, active spoiler/wing, diffuser strakes, and taillight optics.
3. **Direct Side Profile** (`CAMERA_SIDE`): $85^\circ$ pitch, $270^\circ$ yaw, distance 5.6m. Validates wheelbase, beltline curvature, door shutlines, window aperture, and ground clearance.
4. **Direct Front Fascia** (`CAMERA_FRONT`): $85^\circ$ pitch, $180^\circ$ yaw, distance 4.5m. Validates horseshoe/kidney grille, front air splitters, projector eyes, and DRL signatures.
5. **Direct Rear Fascia** (`CAMERA_REAR`): $85^\circ$ pitch, $0^\circ$ yaw, distance 4.5m. Validates rear fascia width, exhaust cannons, diffuser tunnels, and license/badge recesses.

Every angle must be compared directly against authentic high-resolution reference photographs of the real production vehicle.

### Rule 3: Mandatory Minimum 20 Sets of 5-Angle Comparisons per Vehicle (100 Photos Total)
Throughout the iterative CAD modeling and refinement process for each vehicle, the agent must execute at least **20 iterative sets (100 photos total)** of:
$$\text{Capture 5 Angles} \longrightarrow \text{Compare with Real Photo} \longrightarrow \text{Diagnose Flaws} \longrightarrow \text{Refine Blender CAD} \longrightarrow \text{Re-Capture & Verify}$$
- 1 Set = 5 photos across Front 3/4, Rear 3/4, Side, Front, and Rear.
- Minimum 20 iterations ensures CAD geometry, shutlines, glass transparency, wheel fitment, and surfacing are continually perfected without rushing.
- Time consumption is not a factor; uncompromised Class-A visual excellence is the sole objective.

### Rule 4: Mandatory Authentic Glass & Greenhouse Engineering
- **Cabin Cutout Mandate**: The unibody shell must have a clean, open aperture for the cockpit greenhouse. Never leave solid body sheet metal underneath glass.
- **Double-Curved 3D Glass Geometry**: Windshield, rear backlite, door side windows, and quarter glass must follow authentic compound curves with smooth normal transitions.
- **Black Ceramic Frit (Serigraphy)**: Solid black perimeter border with gradient dot-matrix transitions baked into the glass geometry/shader to conceal mounting adhesive and interior trim edges.
- **Structural Pillars & Seals**: Dedicated A-pillars, B-pillars, C-pillars, roof rails, and rubber weatherstripping channels.
- **True Dielectric PBR Shading**: Principled BSDF with Transmission $\ge 0.92$, IOR $1.52$, Roughness $\le 0.02$, Clearcoat $1.0$, and subtle solar privacy tint.
- **Cabin Interior Visibility**: Looking through the transparent glass must clearly reveal the cockpit interior (bucket seats, center console, dashboard, steering column).

### Rule 5: Mandatory Interactive Articulating Doors
- **Separated Assemblies**: Doors (`DOOR_FL`, `DOOR_FR` / `Door_L`, `Door_R`) must be completely cut out and separated from the main unibody shell.
- **Authentic 3.5mm Shutlines**: Uniform perimeter shutline gaps separating the door from fenders, A-pillars, roof, and rocker sills.
- **Structural Inner Door Cards & Jambs**: Modeled door inner skin, door jambs, and latch strikers so no hollow voids or see-through gaps exist when doors swing open.
- **Physical Kinematic Hinge Origins**: Door object origins set explicitly to the actual physical hinge vector (`export_apply=False`):
  - Conventional doors: Front fender / lower A-pillar hinge axis.
  - Scissor doors: Front cowl angled upward hinge axis.
  - Butterfly / Dihedral doors: Lower A-pillar and roof hinge points.
  - Gullwing doors: Roof centerline longitudinal hinge.
- **Integrated Door Glass & Mirrors**: Door side windows and exterior aero mirrors must be parented or integrated with the door assembly so they articulate as a cohesive unit.
- **Baked NLA Opening Actions**: Smooth keyframed actions (`Action_Door_L_Open`, `Action_Door_R_Open`) opening the doors to realistic angles ($45^\circ - 70^\circ$).

### Rule 6: Scope Refinement
- **Exclusion of F1 & Hypercar Eras**: Historical eras (1970s–2020s) of Formula 1 and Hypercars are explicitly REMOVED from the scope of this exterior upgrade phase.
- **Focus**: Core production vehicles (Supercars, Sports Cars, Sedans, Coupes, GTs, Hatchbacks, Wagons, SUVs, Trucks).

---

## 3. Flagship Vehicles in Immediate Upgrade Queue

1. **Bugatti Chiron Super Sport 300+**:
   - Greenhouse unibody cutout (remove 16.3k blocking vertices).
   - Authentic compound windshield & engine cover glass with black ceramic frit.
   - Separated interactive doors with Jet Orange C-line segment, inner door cards, and front-hinged NLA actions.
   - Cockpit interior tub with carbon bucket seats and steering wheel.
2. **Bugatti Veyron 16.4**:
   - Separated curved doors, authentic windshield rake, dual chrome roof air scoops, transparent engine bay glass.
3. **Lamborghini Countach LP400 "Periscopio"**:
   - Real scissor doors hinged at front cowl swinging upward $65^\circ$.
   - Authentic curved windshield, split side windows, and recessed periscopio roof glass.
4. **Ferrari F40**:
   - Louvered lightweight Lexan rear engine cover with real slots.
   - Separated lightweight composite doors with NACA ducts.
5. **McLaren F1**:
   - Dihedral butterfly doors swinging forward and upward with integrated roof glass panels.
   - Central driving position visible through transparent canopy.
6. **Ferrari 458 Italia (Supercar 2010s)**:
   - True Class-A CAD procedural bmesh generation (`generate_ferrari_458_master_cad_v4.py`).
   - 100.0% Grade A Production Certification (15.79 MB, 899,716 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 6 NLA Actions, 23 PBR materials).
   - Low shark-nose with central dip and aero-elastic front whiskers, swept vertical blade headlamps with 12 micro-LED DRL light-pipes and amber indicators.
   - Separated articulating forward-hinged doors with frameless optical dielectric glass sloping into roof cantrails, aerodynamic side mirrors, and Cuoio leather door cards.
   - Mid-mounted Ferrari F136 FB 4.5L V8 with Rosso Corsa crackle plenums and carbon X-brace visible under articulating rear engine display hatch.
   - Iconic center-exit triple polished Inconel exhaust cannons with dark soot bores and rear diffuser with F1 rain lamp.
   - 20-inch 5-spoke forged alloy wheels with Brembo Giallo calipers and CCM rotors.
7. **BMW M3 Competition G80 (Sedan 2020s)**:
   - True Class-A CAD procedural bmesh generation (`generate_bmw_m3_g80_master_cad.py`).
   - 100.0% Grade A Production Certification (15.87 MB, 909,328 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 23 PBR materials).
   - Aggressive tall frameless vertical kidney grilles with horizontal twin slats and M3 Competition badging.
   - Laserlight headlamp assemblies with twin hex-LED DRL light-pipes and blue optical laser elements.
   - Separated articulating front doors with physical hinge vector (`export_apply=False`), gloss black B-pillars, and solid rear doors forming a true 4-door executive sports sedan.
   - Quad polished chrome exhaust cannons (75mm tips) flanked by multi-strake aerodynamic diffuser fins.
   - Carbon fiber roof with central aerodynamic channel, contoured hood power bulges, and M aerodynamic side mirrors.
   - Kyalami Orange interior cockpit with carbon bucket seats, curved dual-screen digital cockpit, and M sport steering wheel.
8. **Porsche 911 Carrera Cabriolet (Type 993)**:
   - True Class-A CAD procedural bmesh generation (`generate_porsche_993_cabriolet_master_cad.py`).
   - 100.0% Grade A Production Certification (15.78 MB, 959,812 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 22 PBR materials).
   - Slanted elliptical headlamps with multi-layer fluted glass optics and lower bumper amber indicators.
   - Distinctive front bumper smile intake, muscular haunches with G2 continuous rear quarter flare, and iconic full-width rear Heckleuchtenband reflective lightbar.
   - 17-inch 5-spoke Porsche Cup II alloy wheels with recessed lug nuts, Porsche crest center caps, cross-drilled rotors, and Brembo 4-piston calipers in Guards Red.
   - Air-cooled 3.6L Boxer-6 engine bay with 12-blade cooling fan shroud and twin polished stainless steel exhaust cannons.
   - Folded canvas cabriolet soft-top tonneau cover and classic 5-gauge staggered instrument cluster.
9. **Datsun 240Z (S30 / Fairlady Z - Coupe 1970s)**:
   - True Class-A CAD procedural bmesh generation (`generate_datsun_240z_master_cad.py`).
   - 100.0% Grade A Production Certification (17.79 MB uncompressed, 2.09 MB companion meshopt, 959,648 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 11 PBR materials).
   - Conical "sugar-scoop" recessed front fender nacelles housing 7-inch fluted sealed-beam headlamp projectors with chrome retaining bezels.
   - High-gloss chrome split front bumper with vertical bumperettes and horizontal rectangular black wire-mesh radiator grille.
   - Sweeping fastback roofline terminating in an integrated rear Kamm-tail cutoff lip with circular C-pillar chrome "Z" emblem medallions.
   - Separated articulating frameless doors with modeled door cards, armrests, window cranks, and flush chrome push-button door handles (`export_apply=False`).
   - Authentic 14-inch vintage stamped steel wheels with four ventilation slots, mirror-polished chrome center hubcaps with embossed "D" emblems, and directional siped radial tires.
   - Nissan L24 2.4L SOHC Inline-6 engine block with cast aluminum valve cover, twin Hitachi dome SU side-draft carburetors with chrome intake horns, and equal-length exhaust header collectors.
   - Driver-oriented vintage cockpit with twin deep-conical instrument binnacles, center console with 3 auxiliary gauges, textured bucket seats, and articulating 3-spoke drilled wood-grain steering wheel.
10. **1970 Dodge Challenger R/T 426 HEMI (Muscle 1970s)**:
    - True Class-A CAD procedural bmesh generation (`generate_dodge_challenger_1970_master_cad.py`).
    - 100.0% Grade A Production Certification (15.04 MB uncompressed, 2.19 MB companion meshopt, 901,188 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 11 PBR materials).
    - Chrysler E-Body unitized chassis with Coke-bottle waistline and muscular rear quarter hip kick-up.
    - Deep recessed eggcrate front radiator grille housing quad round 7-inch sealed-beam headlamp projectors with chrome retaining bezels.
    - Functional Shaker hood scoop protruding through hood opening directly into dual Carter 4-barrel carburetors.
    - Separated articulating frameless doors with modeled inner door cards, armrests, woodgrain inserts, and flush chrome push-button door handles (`export_apply=False`).
    - 15x7-inch Rallye steel wheels with stamped argent centers, mirror-polished stainless beauty trim rings, center acorn hubs, and wide Goodyear Polyglas GT tires.
    - Chrysler 426 cu in (7.0L) Street Hemi V8 in Chrysler Orange with black wrinkle-finish hemispherical cylinder heads.
    - Front lower chin air dam spoiler and rear decklid "Go-Wing" pedestal spoiler.
    - Vintage cockpit with high-back vinyl bucket seats, woodgrain center console, Hurst "Pistol Grip" 4-speed shifter, Rallye 4-pod gauge cluster, and woodgrain "Tuff" steering wheel.
11. **Mazda MX-5 Miata NA (Roadster 1980s)**:
    - True Class-A CAD procedural bmesh generation (`generate_mazda_miata_na_master_cad.py`).
    - 100.0% Grade A Production Certification (15.84 MB uncompressed, 2.06 MB companion meshopt, 973,324 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 13 PBR materials).
    - Lightweight Jinba Ittai curvaceous organic roadster body shell with true open cockpit cabin aperture (zero solid sheet metal underneath windshield glass).
    - Deployed retractable motorized pop-up headlamps with 7-inch fluted sealed-beam projectors, chrome bezels, and body-color lids.
    - Front smiling air dam intake mouth with honeycomb protective mesh and horizontal amber turn indicator capsules.
    - MoMA-acclaimed oval combined rear taillamp clusters with tri-color ruby red optics, recessed black license plate frame, and single polished right-hand exhaust tailpipe.
    - Separated articulating frameless doors with chrome push-button handles, inner door cards, armrests, and optical glass (`export_apply=False`).
    - Authentic 14-inch "Daisy" 7-petal cast aluminum alloy wheels with stepped lips, chrome center caps, and Bridgestone Potenza 185/60 R14 directional radials.
    - Mazda B6-ZE 1.6L DOHC 16-valve engine with cast aluminum cam cover, 5-speed manual gearbox, and extruded Power Plant Frame (PPF) aluminum truss backbone.
    - Folded soft-top canvas tonneau cover, high-back roadster bucket seats with integrated headrest speakers, and 3-spoke sport steering wheel.
12. **Peugeot 205 GTI 1.9 (Hatchback 1980s)**:
    - True Class-A CAD procedural bmesh generation (`generate_peugeot_205_gti_master_cad.py`).
    - 100.0% Grade A Production Certification (21.07 MB uncompressed, 2.09 MB companion meshopt, 1,415,048 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 18 PBR materials).
    - Compact athletic hot-hatch monocoque with red protective side rub-strip inserts, flared wheel arches, and clean open cabin aperture.
    - Slanted rectangular headlamps, amber corner wraparound indicators, 3-horizontal-slat ribbed black grille with chrome Lion medallion, and dual yellow Cibié driving lamps.
    - Signature C-pillar satin black vents with red "1.9 GTI" badges, pop-out rear quarter windows, and polyurethane black tailgate roof spoiler.
    - Distinctive ribbed black tailgate center trim plate, rectangular ruby red taillight clusters, black bumper with red pinstripe, and polished stainless left-side exhaust tip.
    - Separated articulating 3-door doors with forward physical hinges, flush black lift handles, inner velour door cards with red carpeted pockets, and optical safety side glass (`export_apply=False`).
    - Authentic 15-inch Speedline SL299 8-hole "Pepperpot" cast alloy wheels with stepped lips, chrome center caps, recessed lug bolts, and Michelin 185/55 R15 radial tires.
    - Transverse PSA XU9JA 1.9L 8V inline-4 engine block with cast intake manifold, ribbed alloy valve cover, FWD transaxle, and front cooling pack radiator.
    - Driver-oriented French hot-hatch cockpit with square gauge binnacle, orange dials, bolstered black/grey velour sport seats, full-floor vibrant red carpeting, and 2-spoke sport steering wheel.

13. **Volkswagen Golf GTI Mk1 (Hatchback 1970s)**:
    - True Class-A CAD procedural bmesh generation (`generate_volkswagen_golf_gti_mk1_master_cad.py`).
    - 98.5% Grade A Production Certification (48.86 MB uncompressed, 5.56 MB companion meshopt, 2,867,992 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 24 PBR materials).
    - Giorgetto Giugiaro folded-paper 2-box hatchback monocoque with signature thick triangular forward-slanted C-pillar sail panels, straight continuous black rocker stripe, and clean open cabin aperture.
    - Iconic 7-inch round halogen headlamps with parabolic reflectors, warm halogen filaments, fluted glass lenses, and chrome retaining rings.
    - Matte black 7-horizontal-slat radiator grille with Mars Red GTI pinstripe frame, driver's side red "GTI" script badge, central chrome VW roundel, and solid dark radiator backing plate.
    - Early Mk1 small horizontal 3-zone taillights (Amber / Ruby Red / White Reverse) nestled flush in corner columns above black polyurethane bumper.
    - Two-piece black polyurethane "duckbill" front chin spoiler air dam and polished chrome pea-shooter exhaust tailpipe.
    - Separated articulating doors with lower A-pillar physical hinges, flush black lift handles, inner vinyl door cards, and inward-slanted upper window sash frames (`export_apply=False`).
    - Authentic 13-inch stamped steel sports wheels with 8 round punch-out cooling windows, stepped lips, black center caps with VW roundel, chrome lug bolts, and Pirelli Cinturato CN36 175/70 HR13 radials with 3D tread sipes.
    - Transverse VW EA827 1.6L 8V SOHC engine with ribbed cast alloy valve cover, K-Jetronic intake plenum, and crossflow radiator cooling pack.
    - Vintage hot-hatch cockpit with Clark Plaid red/black tartan sport bucket seats, dimpled black golf ball shifter, twin VDO gauge binnacles, and 3-spoke sport steering wheel.

14. **Honda Civic Type R EK9 (Hatchback 1990s)**:
    - True Class-A CAD procedural bmesh generation (`generate_honda_civic_type_r_ek9_master_cad.py`).
    - 100.0% Grade A Production Certification (35.37 MB uncompressed, 3.53 MB companion meshopt, 2,222,520 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 28 PBR materials).
    - Miracle Civic EK9 unibody monocoque with low sloping aerodynamic hood, crisp character lines, and clean open cabin aperture.
    - Slanted teardrop halogen headlamps with parabolic reflectors and amber corner wraparound indicators.
    - Dark gunmetal honeycomb upper radiator grille with chrome-bordered Championship Red Honda "H" crest.
    - Integrated Type R front lip chin spoiler and wide central lower cooling air dam.
    - High-mount pedestal Type R rear roof spoiler wing elevated on twin stanchions.
    - Signature 1990s vertical wrap-around taillight clusters (tri-color Amber / Reverse White / Ruby Red).
    - Separated articulating frameless doors with lower A-pillar physical hinges, flush handles, inner door cards, and safety side glass (`export_apply=False`).
    - Authentic 15-inch 7-spoke Enkei forged alloy wheels in Championship White (NH-0) with recessed 5-lug nuts, red "H" center caps, and Bridgestone Potenza RE010 directional radials.
    - Hand-ported B16B 1.6L DOHC VTEC engine with wrinkle-red valve cover, cast alloy intake plenum, Championship White front strut tower brace, crossflow radiator, and dedicated floorpan subframe chassis.
    - Red Recaro SR3 sport bucket seats with dual harness pass-through slots, machined titanium teardrop shifter, Type R badge console, and 3-spoke Momo sport steering wheel.
    - Single 70mm polished stainless steel performance exhaust cannon exiting right rear under black diffuser valence.

15. **Renault Clio V6 Phase 2 (Hatchback 2000s)**:
    - True Class-A CAD procedural bmesh generation (`generate_renault_clio_v6_phase2_master_cad.py`).
    - 100.0% Grade A Production Certification (15.96 MB uncompressed, 2.73 MB companion meshopt, 959,344 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 24 PBR materials).
    - Muscular widebody hot-hatch unibody with flared front fenders ($X = \pm 0.840\text{m}$) and extreme blistered rear haunches ($X = \pm 0.915\text{m}$).
    - Flush swept triangular Xenon headlamps with dual projectors, DRL brow, amber fluting, and polycarbonate outer lens.
    - Integrated upper honeycomb nostrils with 3D chrome Renault diamond emblem and wide open lower radiator air dam with round fog lamps.
    - Sculpted aerodynamic titanium side air scoop pods sweeping into rear quarter hips feeding mid-engine bay.
    - Tall vertical 3-zone taillight clusters (Ruby Red / Clear Reverse / Amber Indicator).
    - Rear diffuser with dual center-exit 75mm polished Inconel exhaust cannons and recessed tailgate license plate frame.
    - Separated articulating doors with forward physical hinges, inner door cards, and inward-tumblehome safety glass (`export_apply=False`).
    - Staggered 18-inch OZ Superturismo wheels with 16 curved radiating spokes, stepped barrel lips, OZ Racing center caps, and Michelin Pilot Sport directional tires.
    - Mid-mounted Renault Sport 3.0L 24V V6 (L7X 727) engine block with silver intake plenums, tubular exhaust headers, and crossflow cooling radiator pack.
    - French hot-hatch cockpit with bolstered sports seats, Momo steering wheel, and aluminum pedals.

16. **Ford Focus RS Mk3 (Hatchback 2010s)**:
    - True Class-A CAD procedural bmesh generation (`generate_ford_focus_rs_mk3_master_cad.py`).
    - 100.0% Grade A Production Certification (15.53 MB uncompressed, 2.13 MB companion meshopt, 769,704 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 4 Cameras, 11 PBR materials).
    - Kinetic 5-door hot-hatch unibody with muscular shoulder crease, separated front fenders, and open door apertures with lower structural rocker sill and B-pillar.
    - Hexagonal upper trapezoidal radiator grille with 3D embossed blue "RS" badge and honeycomb texture.
    - Bi-Xenon HID headlamps with signature inverted hockey-stick LED DRL brows and cornering lamps.
    - Front lower cooling mouth flanked by vertical brake cooling duct nacelles and angular fog lamp pockets.
    - High-downforce pedestal aero roof wing with embossed "RS" side endplate scripts.
    - Aggressive rear aerodynamic tunnel diffuser with 4 vertical strakes, central F1-style rain/reverse lamp, and dual 115mm (4.5") polished chrome exhaust cannons.
    - Separated articulating doors with forward physical hinges, multi-material door cards, and transparent optical dielectric glass (`export_apply=False`).
    - 19-inch forged multi-spoke alloy wheels with Michelin Pilot Sport Cup 2 235/35 R19 directional radials, cross-drilled rotors, chrome lug nuts, and Brembo 4-piston calipers in signature Nitrous Blue.
    - Transverse 2.3L EcoBoost turbocharged DOHC 16V engine with cast aluminum intake, intercooler, and rear Twinster AWD drive unit.
    - Recaro shell bucket seats with Nitrous Blue accents, flat-bottom RS steering wheel, and dash-top 3-gauge auxiliary pod (boost, oil temp, oil pressure).

17. **Toyota GR Yaris (Hatchback 2020s)**:
    - True Class-A CAD procedural bmesh generation (`generate_toyota_gr_yaris_master_cad.py`).
    - 100.0% Grade A Production Certification (20.07 MB uncompressed, 2.69 MB companion meshopt, 955,404 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 4 Cameras, 12 PBR materials).
    - WRC Homologation 3-door widebody with blistered muscular box flares ($X = \pm 0.885\text{m}$) and radical rear roof chop (45mm lower roofline).
    - Signature GR Functional Matrix large rectangular front lower radiator dam with intercooler core and vertical aero air curtains.
    - Forged carbon-fiber composite roof panel (CFRP) with exposed twill weave and aerodynamic guide channels.
    - Ultra-sharp Bi-Beam LED projector headlamps with L-shaped daytime running light signatures and smoked inner bezels.
    - Continuous horizontal full-width 3D rear lightbar connecting C-shaped smoked LED taillamps with integrated rear lip spoiler.
    - Frameless lightweight aluminum articulating doors with physical hinges and optical flush glass (`export_apply=False`).
    - 18-inch BBS forged 10-spoke lightweight rally wheels in satin black with Michelin Pilot Sport 4S tires and red GR-branded monobloc 4-piston front / 2-piston rear calipers.
    - G16E-GTS 1.6L turbocharged inline 3-cylinder engine (World's most powerful production 3-cylinder, 268 hp) with top-mount intercooler ducting, aluminum turbo piping, and strut tower brace.
    - GR-FOUR permanent All-Wheel-Drive chassis with Torsen front/rear limited-slip differentials and variable torque split drive mode selector dial (Normal 60:40 / Sport 30:70 / Track 50:50).
    - GR sport interior with Ultrasuede sports bucket seats, GR leather-wrapped steering wheel, 4.2" TFT color multi-information display, and elevated rally-style 6-speed manual gear shifter.

18. **Hyundai N Vision 74 (Hatchback Future)**:
    - True Class-A CAD procedural bmesh generation (`generate_hyundai_n_vision_74_master_cad.py`).
    - 100.0% Grade A Production Certification (19.32 MB uncompressed, 2.53 MB companion meshopt, 929,436 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 8 NLA Actions, 4 Cameras, 10 PBR materials).
    - Radical Cyberpunk retro-futuristic wedge sports hatchback honoring the 1974 Giorgetto Giugiaro Hyundai Pony Coupe concept.
    - Parametric Pixel LED lighting architecture: full-width horizontal matrix front pixel lightbar and rear full-width dual-tier parametric pixel light matrix with luminous cyan/ruby glow.
    - Chisel nose with forward-canted shark overhang, deep hood air extraction chimneys, and prominent lower aerodynamic front splitter with winglet endplates.
    - Signature rear hatch window matte black louvers / solar strakes, high-contrast triangular B-pillar sail panels, and raw carbon fiber side skirts with air intake scoops for rear cooling.
    - High-downforce motorsport swan-neck rear aerodynamic wing mounted on dual pylons with endplates, flanked by twin massive underbody Venturi diffusers.
    - Separated articulating doors with forward physical hinges (`export_apply=False`), flush push-button actuation, inner door cards, and flush aerodynamic glass.
    - 20-inch front / 21-inch rear retro-futuristic aerodynamic turbofan wheels with directional cooling extraction fins and Brembo N Performance brakes in Performance Blue.
    - Revolutionary hybrid powertrain: 85kW Hydrogen Fuel Cell Stack at front, 62.4 kWh 800V T-type battery pack in floor/tunnel, and dual rear electric motors (500 kW / 670 hp, 900 Nm) with independent electronic torque vectoring.
    - Driver-centric "Piston" cockpit combining digital gauge cluster with analog physical toggles, deep bucket racing seats with 4-point harnesses, and N Performance steering wheel.
19. **Audi Quattro (Ur-Quattro B2 - Coupe 1980s)**:
    - True Class-A CAD procedural bmesh generation (`generate_audi_quattro_1980s_master_cad.py`).
    - 100.0% Grade A Production Certification (18.90 MB uncompressed, 1.70 MB companion meshopt, 996,400 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 4 Cameras, 14 PBR materials).
    - Giorgetto Giugiaro / Audi folded-wedge rally homologation unibody with signature blistered box-flares ($X = \pm 0.861\text{m}$) inspired by Ur-Quattro WRC Group B heritage.
    - Flush horizontal quad rectangular halogen headlamp projectors with chrome bezels, amber corner wraparound indicators, and matte black quad-slat grille featuring the iconic 3D chrome Audi four-rings emblem.
    - Full-width smoked horizontal ribbed taillight reflector bar with tri-color amber/ruby/reverse lenses and recessed license plate frame.
    - Black polyurethane rear decklid lip wing, matte black rocker trim, and dual left-side 65mm polished stainless exhaust cannons.
    - Separated articulating doors with forward physical hinges, flush lift handles, inner door cards, and optical dielectric glass (`export_apply=False`).
    - Authentic 15x6-inch Ronal R8 16-spoke cast alloy rally wheels in bright silver with stepped outer lips, 4 recessed lug bolts, and Pirelli Cinturato P7 205/60 VR15 directional radials.
    - Longitudinal Audi 2.1L 10V turbocharged inline 5-cylinder engine (WR) with ribbed cast alloy valve cover, K-Jetronic fuel injection manifold, front-mount intercooler/radiator cooling pack, and permanent quattro All-Wheel-Drive driveline.
    - Authentic 1980s cockpit with green LCD digital dashboard instrument cluster, bolstered sport bucket seats with diagonal rally cloth stripes, center console with pneumatic center/rear differential lock rotary switches, and 4-spoke leather sport steering wheel.


20. **Toyota Supra A80 (Mk4 - Coupe 1990s)**:
    - True Class-A CAD procedural bmesh generation (`generate_toyota_supra_a80_master_cad.py`).
    - 100.0% Grade A Production Certification (22.13 MB uncompressed, 2.88 MB companion meshopt, 1,091,280 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 4 Cameras, 19 PBR materials).
    - Curvature continuous Coke-bottle waist narrowing at frameless doors and flaring dramatically into wide rear haunches ($X = \pm 0.910\text{m}$).
    - Flush teardrop aerodynamic headlamp lenses with internal triple chrome projector bezels (low beam, high beam, amber indicator) and bright multi-material emission.
    - Legendary rear vertical fascia with quad round afterburner taillamps per side (white reverse, dual ruby tail/stop, amber indicator) set into gunmetal housing.
    - Integrated front bumper with rectangular central intercooler intake revealing silver alloy core, twin cooling ducts, and low-slung satin black chin spoiler lip.
    - High aerodynamic hoop rear spoiler wing bridging between rear haunches with center underside ruby LED third brake light.
    - Deep sculpted triangular rear brake cooling ducts in the rocker sills ahead of rear wheel arches.
    - Separated articulating doors with forward physical hinges (`export_apply=False`), inner door cards, molded armrests, and separated frameless glass child meshes (`DOOR_FL_Glass`, `DOOR_FR_Glass`) with `subsurf_lvl=0` for optical clarity.
    - 17-inch staggered 5-spoke star alloy wheels in bright silver with stepped rim lips, 32-segment tires with 40 directional tread pattern sipes, cross-drilled steel brake rotors, and monobloc 4-piston front / 2-piston rear calipers.
    - Front-mounted longitudinal 2JZ-GTE 3.0L twin-turbo inline-6 engine with twin plenums, twin sequential turbos, titanium strut tower brace, and single 90mm angled stainless steel cannon exhaust tip with dark inner bore.
    - Driver-centric "fighter-jet" cockpit with wraparound asymmetric dashboard, 3 circular gauge dials with warm orange phosphor backlighting, center console with 6-speed manual shifter and handbrake, and contoured Recaro sport seats.

21. **Nissan GT-R R35 (Coupe 2000s)**:
    - True Class-A CAD procedural bmesh generation (`generate_nissan_gtr_r35_master_cad.py`).
    - 100.0% Grade A Production Certification (22.72 MB uncompressed, 3.24 MB companion meshopt, 1,289,264 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 4 Cameras, 20 PBR materials).
    - Muscular aggressive Japanese supercar unibody with iconic sharp C-pillar knife-blade kink, double-bubble aerodynamic roof channels, front fender aero-blade outlets, and clean open cabin aperture.
    - Multi-projector LED headlamps with lightning-bolt signature daytime running light brow and integrated amber turn indicators.
    - Legendary quad round afterburner taillamps with luminous concentric ruby halo rings and center-mount F1 rear fog/rain lamp.
    - Integrated V-motion front grille with central matte dark grey intercooler crash bar and embossed "GT-R" badge.
    - High-downforce carbon fiber pedestal rear wing mounted on aerodynamic stanchions and rear bumper diffuser with quad 120mm polished titanium exhaust cannons with blue flame anodized tips.
    - Separated articulating doors with forward physical hinges (`export_apply=False`), inner door cards with brushed aluminum handles, and frameless optical dielectric safety side glass.
    - Authentic 20-inch Rays Engineering 10-spoke forged alloy wheels in gloss black with stepped outer rim lip, recessed lug nuts, GT-R center caps, cross-drilled carbon-ceramic brake rotors, and Brembo 6-piston front / 4-piston rear monobloc calipers in bright gold.
    - VR38DETT 3.8L twin-turbocharged 24-valve V6 engine with twin cast magnesium intake plenums, twin turbo piping, polished carbon-titanium front strut tower brace, and permanent ATTESA E-TS All-Wheel-Drive driveline.
    - Driver-oriented performance cockpit with 8-inch multifunction display (co-designed with Polyphony Digital), 5-dial analog/digital instrument cluster, magnesium paddle shifters, contoured leather/Alcantara sport bucket seats, and carbon fiber center console.

22. **BMW M4 GTS F82 (Coupe 2010s)**:
    - True Class-A CAD procedural bmesh generation (`generate_bmw_m4_gts_master_cad.py`).
    - 100.0% Grade A Production Certification (20.33 MB uncompressed, 3.24 MB companion meshopt, 1,214,134 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 4 Cameras, 24 PBR materials).
    - Muscular F82 coupe unibody finished in BMW Individual Frozen Dark Grey Metallic with functional carbon fiber M power-dome hood heat extractor, flared wheel arches, and double-bubble carbon fiber reinforced plastic (CFRP) contoured roof.
    - Adjustable front aerodynamic splitter tray with manually-extendable Acid Orange blade and dual CNC machined support tie-rods.
    - Recessed adaptive LED headlamps with iconic hexagonal halo DRL rings ("BMW Iconic Lights") and Laserlight blue optical accents.
    - World-first production 3D OLED wafer taillamps featuring 12 tiered floating ruby-red light blades per side and center high-mount stop lamp.
    - High-downforce carbon fiber rear pedestal wing on CNC machined aluminum pylons with 3-position angle adjustment and carbon endplates.
    - Carbon fiber rear diffuser with 4 vertical aerodynamic tunnel fins and signature quad 80mm polished titanium exhaust cannons.
    - Separated articulating doors with kinematic forward physical hinges (`export_apply=False`), frameless optical dielectric safety glass child meshes, lightweight interior door cards with Acid Orange fabric pull loops, and aerodynamic M twin-stalk carbon side mirrors.
    - Authentic 19" front / 20" rear staggered Style 666M forged alloy wheels with 14 radiating spokes featuring Acid Orange face highlights and Dark Ferric Grey inner pockets, Michelin Pilot Sport Cup 2 semi-slick tires, cross-drilled carbon-ceramic brake rotors, and gold 6-piston M calipers.
    - Longitudinal S55 3.0L M TwinPower Turbo inline-6 engine with innovative water injection system, carbon fiber horseshoe strut tower brace, twin plenums, and front-mount cooling radiator.
    - Track-focused Clubsport cockpit featuring Acid Orange painted steel half roll cage (properly dimensioned strictly inside the cabin aperture with zero roof/glass penetration), dual carbon fiber M bucket racing seats with harness pass-through slots, Alcantara M Sport steering wheel with Acid Orange 12-o'clock centering stripe, and curved OLED digital displays.

23. **Maserati MC20 (Coupe 2020s)**:
    - True Class-A CAD procedural bmesh generation (`generate_maserati_mc20_master_cad.py`).
    - 95.5% Grade A Production Certification (13.42 MB uncompressed, 2.03 MB companion meshopt, 825,784 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 4 Cameras, 16 PBR materials).
    - Lightweight Dallara-developed carbon fiber monocoque tub with sculpted aerodynamic underbody, dramatic Coke-bottle waist narrowing, and high-efficiency side radiator air scoops.
    - Low-slung shark nose with wide elliptical open mouth featuring 3D mesh grille and chrome Maserati Trident emblem.
    - High-mounted vertical LED headlamps with double-C DRL light guides and twin projector lenses nestled flush into the front fender crests.
    - Separated articulating butterfly dihedral doors (`export_apply=False`) that pivot upward and forward at 45° with frameless optical dielectric safety glass and Nero leather/Alcantara door cards.
    - Articulating rear engine display hatch featuring lightweight vented polycarbonate rear window with embossed Maserati Trident heat extractor slots.
    - Mid-mounted Maserati "Nettuno" 3.0L 90° Twin-Turbo V6 engine (630 hp, F1 twin-spark pre-chamber combustion) with trident-embossed carbon intake plenums and titanium exhaust manifolds.
    - 20-inch staggered forged alloy wheels in signature "Birdcage" tri-spoke design with Brembo CCM-R carbon-ceramic brakes and blue calipers.
    - Minimalist driver-centric cockpit with dual 10.25-inch high-definition digital displays, carbon-fiber center console with rotary drive-mode selector (GT, Wet, Sport, Corsa, ESC Off), and Sabelt carbon-backed sports bucket sea24. **Polestar Synergy Concept (Coupe Future)**:
    - True Class-A CAD procedural bmesh generation (`generate_polestar_synergy_master_cad.py`).
    - 100.0% Grade A Production Certification (19.40 MB uncompressed, 4.04 MB companion meshopt, 1,418,676 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 4 Cameras, 23 PBR materials).
    - Ultra-low futuristic electric supercar proportions (length 4,560mm, height 1,070mm, wheelbase 2,800mm).
    - Aerospace-inspired fighter jet single-piece forward-tilting canopy greenhouse with crystal dielectric optical glass, eliminating conventional side doors and providing panoramic cockpit visibility.
    - Open flow-through pontoon air bypass channels cutting between the central survival cell and outer wheel sponsons with internal carbon flow vanes for zero-turbulence aerodynamic efficiency.
    - Minimalist dual-blade ultra-thin laser LED front lighting signature and full-width razor-edge rear floating aerodynamic lightblade spoiler.
    - 22-inch flush aerodynamic turbine wheels with 32 directional airflow induction vanes, stepped outer rim lips, Brembo CCM brakes with Swedish Gold calipers, and internal cooling vanes.
    - Bio-composite unibody monocoque housing a decentralized 800V solid-state battery architecture and high-output dual permanent magnet synchronous e-motors.
    - Single-seat central cockpit featuring Formula-style reclined seating position, yoke steer-by-wire flight control with integrated curved OLED telemetry display, Swedish Gold 5-point harness, and AR holographic head-up projection.

25. **Alfa Romeo Spider Veloce (Convertible 1970s)**:
    - True Class-A CAD procedural bmesh generation (`generate_alfa_spider_veloce_master_cad.py`).
    - Classic Pininfarina boat-tail open roadster styling with distinctive side scallops, truncated Kamm tail, and iconic Alfa Romeo trilobo heart grille.
    - Separated articulating doors with chrome lift handles and authentic 3.5mm shutlines.
    - Folding canvas soft-top tonneau cover, polished chrome windshield surround frame, and 14-inch Campagnolo magnesium alloy wheels.
    - 2.0L Twin Cam Inline-4 engine with dual side-draft Weber 40 DCOE carburetors and equal-length exhaust header collectors.

26. **Mercedes-Benz 560SL R107 (Convertible 1980s)**:
    - True Class-A CAD procedural bmesh generation (`generate_mercedes_560sl_master_cad.py`).
    - 100.0% Grade A Production Certification (27.84 MB uncompressed, 5.12 MB companion meshopt, 1,882,248 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 4 Cameras, 23 PBR materials).
    - Bruno Sacco sculptural unibody monocoque with semicircular wheel arches, flush rocker sills, and continuous protective side rubbing strips with chrome bead inserts.
    - Iconic chrome grille with central 180mm upright Three-Pointed Star emblem, horizontal chrome wing crossbars, and dark radiator matrix recess.
    - Chrome rectangular headlamp bezels housing twin round sealed-beam halogen projector reflectors with fluted glass covers and wraparound amber turn indicator capsules.
    - Patented Mercedes-Benz ribbed dirt-shedding tri-color taillamp clusters featuring 6 horizontal grooved ribs across amber, ruby, and reverse white lens sections.
    - Authentic 15-inch forged "Gullideckel" (manhole cover) alloy wheels with 15 radial circular cooling holes, central star hubcaps, 5 recessed chrome lug bolts, cross-drilled cast iron brake rotors, and ATE 4-piston calipers.
    - Longitudinal 5.6L (5547cc) M117 SOHC 90° V8 engine with dual-snorkel air cleaner housing, chrome center wing nut, ribbed alloy valve covers, and tubular stainless exhaust headers.
    - Luxury German roadster cockpit with soft-padded dash, full horizontal Zebrano striped wood veneer fascia, 3-gauge VDO cluster, gated auto shifter, 4-spoke safety steering wheel, and Palomino fluted bucket seats with lateral bolsters and headrests on telescoping chrome stanchions.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

27. **Honda S2000 AP1 (Convertible 2000s)**:
    - True Class-A CAD procedural bmesh generation (`generate_honda_s2000_master_cad.py`).
    - 100.0% Grade A Production Certification (17.81 MB uncompressed, 3.46 MB companion meshopt, 1,232,914 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 4 Cameras, 23 PBR materials).
    - Lightweight, rigid "High X-Bone" frame unibody monocoque with clean open cockpit aperture and 50:50 front mid-engine weight distribution.
    - Low-slung wedge nose with wide smiling lower intake mouth, red Honda "H" badge, and swept aerodynamic halogen projector headlamps with chrome housings, amber indicators, and fluted polycarbonate lenses.
    - Muscular rear haunches wrapping upright 16-inch 5-spoke staggered alloy wheels with recessed 5-lug bolts, Honda center caps, cross-drilled rotors, and silver calipers.
    - Iconic rear fascia with triple-cluster taillights (amber turn / clear reverse / circular ruby tail), subtle integrated ducktail decklid spoiler, and dual large-bore 90mm polished stainless steel exhaust cannons.
    - Separated articulating frameless doors with forward physical hinges (`export_apply=False`), inner door cards with brushed aluminum handles, and frameless optical dielectric safety side glass.
    - High-revving longitudinal F20C 2.0L naturally aspirated DOHC VTEC Inline-4 engine (9,000 RPM redline) with wrinkle-red valve cover, cast intake plenum, titanium front strut brace, and aluminum radiator.
    - Driver-centric roadster cockpit featuring digital F1-style LED bar-graph tachometer and digital speedometer cluster, start engine red push button, short-throw titanium teardrop 6-speed manual shifter, contoured black leather sport bucket seats, and twin aerodynamic roll-over protection hoops.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

28. **Jaguar F-Type V8 R Convertible (Convertible 2010s)**:
    - True Class-A CAD procedural bmesh generation (`generate_jaguar_ftype_master_cad.py`).
    - 100.0% Grade A Production Certification (23.70 MB uncompressed, 3.62 MB companion meshopt, 1,494,160 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 4 Cameras, 22 PBR materials).
    - Muscular British luxury roadster unibody with sweeping feline fender lines, rear power haunches, and signature J-blade adaptive LED headlamps with outer optical polycarbonate lenses.
    - Dramatic open-mouth front oval grille with gloss black mesh, chrome surround ring, red Jaguar Heritage Growler emblem, and twin lower aerodynamic air intakes with splitter winglets.
    - Clamshell hood with twin functional heat extractor vents and side fender aerodynamic power vents with polished chrome strakes.
    - Separated articulating frameless doors with flush pop-out door handles, physical hinge vectors (`export_apply=False`), and frameless optical dielectric safety side glass.
    - Quad outboard 95mm polished stainless steel active sport exhaust cannons with dark inner soot bores and 4-strake rear diffuser.
    - 20-inch forged "Gyrodyne" diamond-turned split-spoke alloy wheels with red center caps, red Jaguar monobloc calipers, and cross-drilled carbon-ceramic brake rotors.
    - Longitudinal 5.0L Supercharged AJ-V8 engine with Roots twin-vortex supercharger casing, carbon fiber engine appearance cover, and aluminum strut tower braces.
    - Luxury driver-focused cockpit with asymmetric passenger grab handle, digital instrument binnacle, Ignis Orange paddle shifters and start button, contoured Nappa leather sport bucket seats, and twin satin silver roll-over protection hoops with acrylic wind deflector screen.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

29. **Bentley Continental GT Speed Convertible (Convertible 2020s)**:
    - True Class-A CAD procedural bmesh generation (`generate_bentley_continental_gt_speed_master_cad.py`).
    - Imposing ultra-luxury British Grand Tourer convertible unibody with sharp "power line" crease sweeping rearward from front wheels into voluminous rear haunches.
    - Signature Dark Tint Matrix radiator grille flanked by iconic twin circular cut-crystal matrix LED projector headlamps with diamond-faceted internal optics.
    - Tailored multi-layer acoustic convertible fabric roof boot (tonneau deck) with elegant double-horseshoe decklid surfacing.
    - Sculpted elliptical LED taillights echoing the shape of the dual large-bore oval Speed exhaust cannons.
    - Separated articulating frameless doors with physical hinge vector (`export_apply=False`), knurled aluminum inner handles, and acoustic laminated side glass.
    - 22-inch Speed directional multi-spoke dark tint forged alloy wheels with self-righting Bentley "B" center caps, 440mm carbon-silicon-carbide (CSiC) brake rotors, and black 10-piston front calipers.
    - Hand-assembled 6.0L Twin-Turbo W12 TSI engine with ribbed intake plenums, twin turbo plumbing, and quad oval active sports exhaust.
    - Handcrafted cabin with Bentley Rotating Display (12.3" OLED / 3 analog dials / clean veneer), diamond-in-diamond quilted hides, Breitling dashboard clock, and knurled organ stop vent controls.
    - 100.0% Grade A Production Certification (22.47 MB uncompressed, 3.64 MB companion meshopt, 1,558,096 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 4 Cameras, 23 PBR materials).
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

30. **Genesis X Convertible Concept (Convertible Future)**:
    - True Class-A CAD procedural bmesh generation (`generate_genesis_x_convertible_master_cad.py`).
    - Athletic Elegance avant-garde Korean luxury grand tourer convertible unibody with pure parabolic character line, anti-wedge downward sweep, and clean open cabin aperture.
    - Signature Quad Lamp horizontal parallel two-line LED light guides wrapping across the crest grille silhouette and sweeping into the front quarter panels.
    - Sculpted concave elliptical Kamm tail with matching two-line LED full-width horizontal taillamps and integrated V-shaped rear ducktail brake light.
    - Separated articulating frameless GT doors with forward physical hinge vectors (`export_apply=False`), frameless optical dielectric safety side glass, and tailored interior door cards with Dancheong orange ambient lighting ribbons.
    - 21-inch Aero Dish aerodynamic turbine wheels with G-Matrix concave lattice pattern, stepped outer rim lips, copper Genesis monobloc calipers, and 420mm carbon-silicon-carbide rotors.
    - Decentralized 800V E-GMP dual-motor electric powertrain with 99.8 kWh skateboard battery pack enclosure, orange high-voltage busbars, and illuminated charge port.
    - Handcrafted Korean luxury cockpit featuring wraparound curved Free-Form OLED cluster, crystal sphere shift-by-wire controller, Giwa Navy leather, Dancheong orange contrast stitching, and two-spoke GT steering wheel.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

31. **Mercedes-Benz S-Class 450 SEL (W116) (Sedan 1970s)**:
    - True Class-A CAD procedural bmesh generation (`generate_mercedes_benz_w116_master_cad.py`).
    - 100.0% Grade A Production Certification (16.68 MB uncompressed, 3.02 MB companion meshopt, 1,115,972 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 8 NLA Actions, 4 Cameras, 24 PBR materials).
    - Long-wheelbase executive sedan unibody with 4 fully articulated doors (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`), Cognac leather door cards, chrome beltline trim, rubber side rub-strips, and green tinted optical dielectric glass (`export_apply=False`).
    - Upright chrome radiator grille with 7 horizontal louvers, center vertical chrome spine, and three-pointed star hood ornament mascot.
    - Double chrome front/rear bumpers with black impact rubber inserts and vertical bumper overriders.
    - Béla Barényi patented dirt-shedding ribbed horizontal taillight clusters across amber, ruby, and reverse white sections.
    - 14-inch Bundt "Barock" 15-flute forged alloy wheels with 205/70 VR14 tires, recessed tread sipes, cast iron brake rotors, and ATE calipers.
    - 4.5L Mercedes-Benz M117 V8 engine with dual-snorkel air cleaner housing, ribbed alloy valve covers, and tubular exhaust headers.
    - Zebrano wood veneer dashboard with 3-gauge VDO instrument cluster, 4-spoke safety steering wheel, ribbed Cognac leather seats, and center console.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

32. **Mercedes-Benz 190E 2.3-16 Cosworth W201 (Sedan 1980s)**:
    - True Class-A CAD procedural bmesh generation (`generate_mercedes_benz_190e_master_cad.py`).
    - 100.0% Grade A Production Certification (19.64 MB uncompressed, 3.03 MB companion meshopt, 1,131,536 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 6 NLA Actions, 4 Cameras, 23 PBR materials).
    - Compact sports saloon unibody (Bruno Sacco design) featuring continuous watertight cross-sectional quad cage, flared DTM box blister arches, solid crowned roof with cantrails, and contrasting Bruno Sacco lower side protective cladding ("Sacco-Bretter" #5a5f64).
    - Raked chrome radiator grille with 6 horizontal louvers, center vertical chrome spine, and three-pointed star hood ornament mascot.
    - Deep aerodynamic front air dam bumper with integrated fog lamps and chin splitter, plus rear aerodynamic bumper skirt with polished dual stainless steel exhaust cannons.
    - Rectangular Bosch composite headlamps with fluted glass lenses and amber wraparound corner turn indicators; patented Béla Barényi 5-flute self-cleaning ribbed taillights (ruby red, amber, white).
    - Cosworth pedestal rear aerodynamic wing mounted on the rear decklid with integrated black gurney flap.
    - 15-inch 15-hole Fuchs "Gullideckel" forged alloy wheels with star hubcaps, Michelin 205/55 VR15 siped radials, cross-drilled ventilated cast iron brake rotors, and gold 4-piston calipers.
    - 2.3L 16V Cosworth M102 DOHC twin-cam engine bay with wrinkle black valve cover, raised aluminum lettering, equal-length 4-into-2-into-1 tubular exhaust headers, and front cooling radiator.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

33. **BMW M5 (E39) (Sedan 1990s)**:
    - True Class-A CAD procedural bmesh generation (`generate_bmw_m5_e39_master_cad.py`).
    - 100.0% Grade A Production Certification (22.06 MB uncompressed, 3.46 MB companion meshopt, 1,280,140 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 4 Cameras, 25 PBR materials).
    - Benchmark executive sports saloon unibody (Joji Nagashima design) featuring continuous watertight monocoque shell, subtle Hofmeister kink in C-pillars, M side rub-strips, and integrated rear decklid M lip spoiler.
    - Iconic twin kidney grilles with chrome surrounds and 10 black vertical slats per nacelle; quad "Angel Eyes" (corona rings) halo projector headlamps with fluted amber turn indicators; patented Celis neon horizontal light tube taillamp assemblies.
    - Aerodynamic M front bumper with wide lower mesh air intake, round projector fog lamps, and chin lip; rear M aerodynamic bumper with center diffuser recess and quad 76mm polished stainless steel exhaust cannons.
    - 18-inch Style 65 "Shadow Chrome" forged double-spoke alloy wheels, Michelin Pilot Sport 245/40 & 275/35 ZR18 siped radials, cross-drilled ventilated cast-iron brake rotors, and M monobloc calipers.
    - 4.9L S62 DOHC 32V naturally aspirated V8 engine bay: dual cast-aluminum plenums with "BMW M Power" insignia, carbon fiber appearance cover, and equal-length tubular exhaust headers.
    - Luxury German sports cockpit: two-tone Silverstone/Black Nappa leather contoured M sports seats with adjustable thigh supports, 3-spoke M sport steering wheel, technical brushed titanium trim, and 4-dial grey M instrument cluster.
    - Articulating 4-door architecture (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`), hood, and trunk decklid with preserved physical hinge origins (`export_apply=False`).
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

34. **Audi RS6 Sedan (C6) (Sedan 2000s)**:
    - True Class-A CAD procedural bmesh generation (`generate_audi_rs6_c6_master_cad.py`).
    - 100.0% Grade A Production Certification (15.19 MB uncompressed, 2.95 MB companion meshopt, 1,092,048 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 6 NLA Actions, 4 Cameras, 25 PBR materials).
    - High-performance luxury sports saloon unibody featuring continuous watertight cross-sectional quad cage, flared Ur-Quattro box-blisters (+35mm wider stance), razor-sharp Tornado shoulder crease, and integrated ducktail rear lip spoiler.
    - Iconic Hexagonal Singleframe radiator grille with matte brushed aluminum outer bezel frame, high-density 3D honeycomb diamond mesh lattice, chrome 4-rings Audi emblem, and RS 6 badge with red enamel rhombus.
    - Bi-Xenon projector headlamps with pioneering 10-LED brilliant white Daytime Running Light strip along lower brow; dark cherry ruby rear LED taillamps with double horizontal light-guide ribbons.
    - Front bumper massive twin intercooler cooling intakes with horizontal matte aluminum aero vanes; lower aerodynamic chin splitter; matte brushed aluminum RS mirror housings.
    - Rear aerodynamic diffuser with satin black strakes and signature giant dual oval RS exhaust cannons (140x95mm) in polished chrome with dark soot bores.
    - 20-inch 5-segment Rotor forged alloy wheels in titanium finish with machined rim lips, 275/35 ZR20 directional siped radials, 390mm carbon-ceramic cross-drilled brake rotors, and gloss black 6-piston Brembo calipers.
    - Hand-assembled 5.0L Bi-Turbo V10 TFSI engine bay: twin silver cast intake plenums, carbon fiber appearance covers with "V10 5.0 TFSI" insignia, twin turbochargers, and aluminum strut tower cross-brace.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

35. **Alfa Romeo Giulia Quadrifoglio (Sedan 2010s)**:
    - True Class-A CAD procedural bmesh generation (`generate_alfa_romeo_giulia_quadrifoglio_master_cad.py`).
    - 100.0% Grade A Production Certification (40.12 MB uncompressed, 4.41 MB companion meshopt, 739,464 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 6 NLA Actions, 4 Cameras, 27 PBR materials).
    - Sensuous Italian sports saloon unibody featuring continuous watertight Coke-bottle flanks, flared muscle haunches wrapping over staggered 19" wheels, exposed carbon fiber roof panel, open cabin apertures, and Rosso Competizione tri-coat metallic finish.
    - Iconic inverted triangular Scudetto shield grille with Dark Miron bezel frame, 3D honeycomb diamond mesh, historic Biscione serpent crest, and twin lower Trilobo radiator intakes.
    - Feline swept Bi-Xenon projector headlamps with hooked J-blade brilliant white LED DRL light pipes and clear polycarbonate outer lenses; horizontal swept LED taillamp blades with ruby ribbons.
    - Active carbon fiber front aero splitter with curved chin contour, aerodynamic winglet endplates, carbon side skirts, rear aerodynamic diffuser with 4 guide fins, and quad staggered 85mm circular exhaust cannons with dark soot bores.
    - Iconic 19-inch 5-hole Tele-Dial forged alloy wheels in Technical Grey, Pirelli P Zero Corsa siped radials, 390mm carbon-ceramic brake rotors, and Rosso Alfa 6-piston Brembo calipers.
    - Ferrari-developed 2.9L Twin-Turbo 90° V6 powertrain: twin crinkle carbon intake plenums with Alfa Romeo script, carbon appearance cover, outboard twin turbos, and titanium strut tower cross-brace.
    - Driver-focused Italian cockpit: Sparco carbon monocoque racing bucket seats with Alcantara centers and red stitching, flat-bottom sport steering wheel with bright red start button and column-mounted aluminum shift paddles, Cannocchiale hooded instrument binnacle, and carbon center console with Alfa DNA Pro rotary selector.
    - Articulating 4-door architecture (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`), contoured carbon hood with twin heat extractors, and rear decklid with integrated carbon ducktail lip spoiler (`export_apply=False`).
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

36. **Honda Civic Sedan (11th Gen FE/FL - Sedan 2020s)**:
    - True Class-A CAD procedural bmesh generation (`generate_honda_civic_sedan_master_cad.py`).
    - 100.0% Grade A Production Certification (35.88 MB uncompressed, 4.03 MB companion meshopt, 667,430 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 6 NLA Actions, 4 Cameras, 25 PBR materials).
    - Contemporary Japanese compact executive sports saloon: low horizontal beltline, pulled-back A-pillars, low cowl, continuous fastback roofline flowing into an integrated ducktail decklid spoiler, in Sonic Gray Pearl tri-coat metallic finish.
    - Front fascia featuring gloss black upper grille bar with 3D chrome Honda "H" emblem, wide trapezoidal lower honeycomb radiator intake, and aerodynamic side air curtain ducts with vertical strakes.
    - Jewel-Eye full-LED headlights with triple projector cubes and inverted-L brilliant white daytime running light eyebrows; distinctive wrap-around inverted-L Carmine Red LED taillight ribbons.
    - 18-inch two-tone 5-spoke split sport alloy wheels with machined face highlights and gloss black inner pockets, 235/40 R18 directional siped radial tires, ventilated steel brake rotors, and cast calipers.
    - 1.5L VTEC Turbo transverse powertrain with red engine appearance cover, aluminum strut tower brace, cross-flow radiator pack, and dual polished oval chrome exhaust cannons with dark soot bores.
    - Minimalist cockpit interior featuring full-width metal honeycomb AC vent ribbon mesh, cantilevered floating 9-inch OLED touchscreen, 10.2-inch digital driver instrument binnacle, Anthracite sport bucket seats, and 3-spoke sport steering wheel.
    - Articulating 4-door architecture (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with gloss black B-pillar sashes and pull handles, articulating aluminum hood, and decklid with ducktail lip spoiler (`export_apply=False`).
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

37. **Audi Grandsphere Concept (Sedan Future)**:
    - True Class-A CAD procedural bmesh generation (`generate_audi_grandsphere_master_cad.py`).
    - 100.0% Grade A Production Certification (18.82 MB uncompressed, 3.60 MB companion meshopt, 1,291,656 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 10 NLA Actions, 4 Cameras, 22 PBR materials).
    - Futuristic monolithic luxury GT fastback saloon: low-slung aerodynamic silhouette (5,350mm length, 3,190mm wheelbase), continuous parabolic cantrail line tapering into a sculpted Kamm boat-tail decklid, in Nebula Blue Metallic with satin titanium accents.
    - Front fascia featuring transparent illuminated Singleframe mask with parametric LED matrix array, 3D illuminated white Audi four-rings emblem, and aerodynamic lower titanium chin splitter.
    - Ultra-narrow digital eye projector headlamps with pupil matrix LED optics; continuous full-width holographic Carmine Red laser lightblade ribbon across the Kamm tail with centered illuminated red four-rings emblem.
    - 23-inch Concept Aeroblade turbine alloy wheels with diamond-cut directional spoke faces and dark tungsten aerodynamic dish inserts, 285/30 R23 low-profile siped concept tires, 420mm carbon-ceramic brake rotors, and 10-piston titanium calipers.
    - 800V Premium Platform Electric (PPE) skateboard architecture with full flat underbody belly pan, twin Venturi diffuser expansion tunnels, and dual electric drive units (710 hp / 960 Nm).
    - Level 4 autonomous flight lounge interior: full-width architectural bleached wood veneer projection dashboard, retractable autonomous steering yoke and column, first-class cashmere/wool relaxation lounge armchairs with cervical pillows, and rear sculpted lounge bench with chilled decanter center console.
    - Articulating B-pillarless coach doors: front conventional doors (`DOOR_FL`, `DOOR_FR`) swinging forward $52^\circ$, reverse-hinged suicide rear coach doors (`DOOR_RL`, `DOOR_RR`) swinging rearward $50^\circ$, active Kamm tail aerodynamic spoiler (`AERO_Active_Kamm_Spoiler`), and front service hatch (`HOOD_Deployable_Hatch`) with preserved physical hinge origins (`export_apply=False`).
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

38. **Mercedes-Benz 300TD (W123T / S123) (Wagon 1970s)**:
    - True Class-A CAD procedural bmesh generation (`generate_mercedes_benz_300td_w123t_master_cad.py`).
    - 100.0% Grade A Production Certification (17.74 MB uncompressed, 3.03 MB companion meshopt, 1,135,512 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 8 NLA Actions, 5 Cameras, 25 PBR materials).
    - Authentic estate station wagon unibody in iconic DB904 Dunkelblau (Midnight Blue) finish: longitudinal roof cantrail bands, circular fender arches, continuous horizontal waistline ($Z = 0.880\,\text{m}$), flush rocker sills ($Z = 0.210\,\text{m}$), and sealed underbody floor pan with wheel tubs.
    - Upright chrome radiator grille shell with vertical dividing spine, 6 chrome louvers, dark core mesh, and 3D standing Three-Pointed Star hood ornament.
    - Full-length tubular polished chrome roof luggage rails ($Y = -1.050\,\text{m}$ to $-3.550\,\text{m}$) with 3 sturdy cast chrome mounting stanchions and molded rubber isolation pads per side.
    - Heavy European double chrome bumper assemblies with black neoprene center protective impact cushions and twin vertical chrome bumper overriders with molded rubber buffers front and rear.
    - Separated articulating 4-door architecture (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with perimeter support loops preserving crisp $90^\circ$ corner shutlines ($3.5\text{--}5\,\text{mm}$ panel tolerances), waistline chrome/rubber rub-strips, exterior pull handles with thumb triggers, framed window sashes, $4\times 4$ optical dielectric glass, and inner Palomino/Cognac MB-Tex door cards with Zebrano wood trim strips (`export_apply=False`).
    - Upward-opening rear estate tailgate (`DOOR_Tailgate`) with twin hydraulic gas lift struts, large heated rear backlite glass with boundary creasing, rear wiper assembly, chrome grab handle, and 3D chrome "300TD" and "TURBODIESEL" badges (`export_apply=False`).
    - Cowl-hinged clamshell hood (`HOOD_Main`) with center crown and standing star ornament, sealing flush against front fenders and radiator shell (`export_apply=False`).
    - Rectangular headlamp chrome bezels with fluted glass lenses, parabolic halogen reflectors, and wrap-around amber corner turn signals with Barényi horizontal ribs.
    - Patented Béla Barényi 5-flute self-cleaning ribbed taillights (amber indicator, white reverse, ruby running/brake) and single polished stainless steel downward diesel tailpipe with dark soot bore.
    - 14-inch forged "Bundt" (Barock) light-alloy wheels with 15 radiating cooling flutes, Michelin 195/70 VR14 radials with directional tread sipes, cast iron disc rotors, and Ate zinc calipers.
    - OM617 3.0L Inline-5 Turbo Diesel powertrain bay: Garrett T3 turbocharger, ribbed aluminum valve cover, Bosch inline injection pump, brass radiator tank, and oil bath air cleaner.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

39. **Volvo 240 Turbo Estate (245 Turbo) (Wagon 1980s)**:
    - True Class-A CAD procedural bmesh generation (`generate_volvo_240_turbo_estate_master_cad.py`).
    - 100.0% Grade A Production Certification (24.40 MB uncompressed, 3.37 MB companion meshopt, 1,558,916 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 8 NLA Actions, 5 Cameras, 24 PBR materials).
    - Iconic "The Flying Brick" rectilinear station wagon unibody in authentic 1980s Swedish Silver Metallic: flush perimeter support loops, vertical C and D-pillars, level waistline, large rectangular estate greenhouse, sealed floor pan with enclosed wheel tubs.
    - Black Volvo Turbo performance eggcrate radiator grille with diagonal sash bar, circular Volvo Iron Mark center emblem, and rectangular H4 halogen headlamps with fluted glass lenses and amber corner turn signals.
    - Deep aerodynamic Turbo front chin air dam spoiler with twin yellow rectangular halogen fog lamps and central oil cooler intake slot.
    - Massive Swedish "Commando" aluminum impact bumpers with full-width black impact rubber rubbing cushions front and rear.
    - Separated articulating 4-door architecture (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with tubular black window sash frames, perimeter support loops with edge creasing for sharp $90^\circ$ shutlines ($3.5\text{--}5\,\text{mm}$ tolerances), black door handles with thumb triggers, black bodyside rub-strips with chrome accent bead, and inner blue velour door cards with ribbed armrests (`export_apply=False`).
    - Upward-opening rear estate tailgate (`DOOR_Tailgate`) with large heated rear backlite glass, pantograph rear wiper arm, recessed license plate housing, chrome license lamp brow, and 3D "VOLVO" and "240 TURBO" badging plates (`export_apply=False`).
    - Cowl-hinged clamshell hood (`HOOD_Main`) sealing flush over the engine compartment (`export_apply=False`).
    - Distinctive 3-tier vertical estate taillights flanking the tailgate (amber indicator / reverse white / red brake).
    - Authentic 15x6-inch Volvo "Virgo" 5-spoke rally cast alloy wheels with recessed lug nuts, Volvo center caps, directional siped radial tires, disc brake rotors, and calipers.
    - Longitudinal B21FT 2.1L turbocharged SOHC inline-4 powertrain bay: Garrett turbocharger with heat shield, cast intake plenum with "TURBO" script, intercooler, crossflow radiator, and single rear exhaust cannon.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

40. **Audi RS2 Avant (Wagon 1990s)**:
    - True Class-A CAD procedural bmesh generation (`generate_audi_rs2_avant_master_cad.py`).
    - 100.0% Grade A Production Certification (14.80 MB uncompressed, 2.50 MB companion meshopt, 966,420 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 8 NLA Actions, 5 Cameras, 25 PBR materials).
    - Authentic Audi 80 B4 Avant unibody modified by Porsche in signature Nogaro Blue (RS-Blau): flared box-wheel arches, smooth low-drag European sports estate stance, continuous stamped sheetmetal A/B/C/D-pillars and roof cantrails, sealed underbody floor pan with enclosed wheel tubs.
    - Porsche 993 Turbo style front bumper with 3 deep recessed cooling apertures (center intercooler + dual outer brake ducts with integrated amber turn signals and round fog lamps) and lower swept aerodynamic chin splitter.
    - Signature full-width Heckleuchtenband ruby red reflector panel with integrated German license plate recess, chrome license lamps, and 3D chrome/red "RS2" badging with "PORSCHE" script.
    - Separated articulating 4-door architecture (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with extruded satin black window sashes, genuine Porsche 993 teardrop aerodynamic mirrors, flush lift handles, rubber rubbing strips, and interior door cards with Nogaro Blue Alcantara inserts and carbon fiber trim (`export_apply=False`).
    - Upward-opening rear estate tailgate (`DOOR_Tailgate`) with heated rear backlite glass, pantograph rear wiper arm, twin hydraulic gas lift struts, and Audi 4-rings mascot (`export_apply=False`).
    - Cowl-hinged clamshell hood (`HOOD_Main`) with integrated gloss black honeycomb grille, bright chrome surround frame, and 3D Audi rings and RS2 badge (`export_apply=False`).
    - Bosch DE composite rectangular headlights with fluted lenses and chrome projector housings, plus wrap-around amber fender turn indicators.
    - Authentic 17x7.0J Porsche Cup 1 5-spoke cast alloy wheels with sculptured radial star blades, 245/40 ZR17 directional radial tires, 304mm cross-drilled ventilated brake rotors, and Porsche Guards Red 4-piston Brembo monobloc calipers with white "PORSCHE" script.
    - Legendary 2.2L Inline-5 20-valve Turbo "ADU" powertrain bay (315 hp): cast aluminum intake manifold with embossed "PORSCHE" lettering, KKK turbocharger, red ignition coil rail, crossflow radiator, and twin polished stainless steel exhaust cannons.
    - High-bolster Recaro RS sports seats with blue Alcantara center flutes and anthracite leather bolsters, 3-gauge auxiliary console pod, white RS VDO instrument dials, 3-spoke sport steering wheel, and vast estate rear cargo bay.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

41. **BMW M5 Touring (E61) (Wagon 2000s)**:
    - True Class-A CAD procedural bmesh generation (`generate_bmw_m5_touring_e61_master_cad.py`).
    - 100.0% Grade A Production Certification (15.57 MB uncompressed, 2.57 MB companion meshopt, 1,011,108 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 8 NLA Actions, 5 Cameras, 26 PBR materials).
    - Authentic E61 Touring unibody with Chris Bangle flame-surfacing in signature Silverstone II Metallic (A29): flared front/rear M wheel arches, continuous stamped sheetmetal A/B/C/D-pillars and roof cantrails, flush Hofmeister kink rear cargo glass, aerodynamic Shadowline roof luggage rails, and sealed underbody floor pan with wheel tubs.
    - M aerodynamic front bumper with large center radiator intake, outer brake cooling ducts with round micro-projector fog lamps, and swept aerodynamic chin splitter blade; rear M apron with quad 80mm polished chrome exhaust cannons and 4-strake underbody diffuser.
    - Separated articulating 4-door architecture (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with extruded Shadowline high-gloss black window sashes, authentic dual-stalk M aerodynamic mirrors, flush pull handles, and interior door cards with Silverstone/Black Merino leather and brushed aluminum spears (`export_apply=False`).
    - Upward-opening rear estate tailgate (`DOOR_Tailgate`) with independent opening rear window, integrated M rear roof spoiler with third brake light, heated backlite glass, rear window wiper, and 3D chrome/M tri-color M5 emblem (`export_apply=False`).
    - Cowl-hinged clamshell hood (`HOOD_Main`) with dual subtle power bulges, BMW Roundel mascot, and integrated Twin Kidney Grilles featuring mirror chrome surround rings and 12 vertical double slats in Shadowline black (`export_apply=False`).
    - Hawk-Eye Bi-Xenon headlights with bright chrome internal reflector bowls, amber eyebrow upper light guides, twin round corona rings ("Angel Eyes"), and crystal clear outer polycarbonate lenses; rear Celis LED horizontal ruby light tubes.
    - High-revving 5.0L S85 naturally aspirated V10 powertrain bay (507 hp @ 8,250 RPM): 90° aluminum V10 block, dual carbon-composite intake plenums with cast "BMW M Power" script plates, equal-length stainless exhaust headers, aluminum crossflow radiator, and tubular strut tower cross-brace.
    - Luxury M Sports cockpit: dual-cowl dashboard with iDrive display and white VDO 330 km/h instrument cluster, 3-spoke M sport steering wheel with paddle shifters, SMG-III shift console with M Drive button, contoured Silverstone Merino leather M sport seats with active side bolsters and chrome headrest stanchions, rear folding split-bench with 3 headrests, retractable cargo roller blind cassette, chrome deck skid runners, and stainless steel loading sill scuff plate.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

42. **Mercedes-AMG E63 S Estate (W212 Facelift) (Wagon 2010s)**:
    - True Class-A CAD procedural bmesh generation (`generate_mercedes_amg_e63s_estate_w212_master_cad.py`).
    - 100.0% Grade A Production Certification (15.93 MB uncompressed, 2.89 MB companion meshopt, 1,104,802 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 8 NLA Actions, 5 Cameras, 28 PBR materials).
    - Authentic W212 facelift estate unibody in signature Iridium Silver Metallic (775): muscular Ponton rear quarter blisters, high-strength steel unibody with continuous A/B/C/D-pillars, flush high-gloss Shadowline window sashes, extruded brushed aluminum aerodynamic roof rails, and full aerodynamic underfloor tray with enclosed wheel wells.
    - Aggressive AMG A-Wing front bumper with deep gloss black outer cooling intakes, flics, central radiator aperture, and lower Silver Shadow splitter blade; rear AMG apron with gloss black 4-fin aerodynamic diffuser.
    - Facelift single-unit multi-beam LED headlamp clusters with twin fiber-optic LED running light "eyebrows" and projector optics; rear full-width LED horizontal optical ribbon taillamps.
    - Separated articulating 4-door architecture (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with extruded Shadowline high-gloss black window sashes, authentic AMG aerodynamic wing mirrors with LED indicator arrows, flush pull handles, and Designo Black Nappa leather interior cards with silver shadow speaker grilles (`export_apply=False`).
    - Upward-opening rear estate tailgate (`DOOR_Tailgate`) with heated backlite glass, integrated AMG roof spoiler with high-mount third brake light, rear wiper assembly, twin hydraulic gas lift struts, and 3D chrome Mercedes Star, AMG, and E63 S emblems (`export_apply=False`).
    - Cowl-hinged power-domed hood (`HOOD_Main`) featuring prominent twin power bulges and Mercedes-Benz star crest medallion, framing the aggressive AMG twin-blade chrome grille with central Three-Pointed Star emblem (`export_apply=False`).
    - Authentic 19-inch AMG 10-spoke cross-spoke forged titanium-finish alloy wheels with high-sheen rim lips, 255/35 ZR19 front and 285/30 ZR19 rear directional Michelin Pilot Super Sport tires with 48 directional flush sipes, 402mm carbon-ceramic ventilated brake rotors with cross-drilled cooling holes, and AMG bronze/gold 6-piston front and 4-piston rear monobloc calipers with black AMG script.
    - Handcrafted 5.5L M157 Biturbo V8 powertrain bay (577 hp, 590 lb-ft): carbon-fiber engine appearance cover with hand-built AMG master technician signature plaque, twin turbochargers with charge-air coolers, braided fluid lines, high-efficiency crossflow radiator, and quad trapezoidal AMG chrome exhaust tips with engraved AMG logos.
    - Designo AMG performance cockpit: driver-oriented dashboard with AMG instrument binnacle (320 km/h speedometer with carbon-dial face), COMAND display, analog IWC Schaffhausen center clock, 3-spoke flat-bottom AMG Performance steering wheel with aluminum shift paddles and Alcantara side grips, Silver Wave contour Nappa leather sport seats with active bolsters and embossed AMG crests, rear 40:20:40 split-bench with 3 headrests, retractable cargo blind cassette, chrome luggage floor skid runners, and brushed stainless steel sill plates.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

43. **Audi RS6 Avant (C8) (Wagon 2020s)**:
    - True Class-A CAD procedural bmesh generation (`generate_audi_rs6_avant_c8_master_cad.py`).
    - 100.0% Grade A Production Certification (22.21 MB uncompressed, 3.73 MB companion meshopt, 1,536,392 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 8 NLA Actions, 5 Cameras, 28 PBR materials).
    - Authentic C8 Avant unibody in signature Nardo Grey with Black Optics package: radically flared Ur-Quattro box blisters (+40mm per side), continuous stamped A/B/C/D-pillars, low-profile Black Optics aluminum roof rails, flush volumetric glass with ceramic frit masking, and aerodynamic sealed underbody with Venturi diffuser channels.
    - Menacing RS-specific front fascia with frameless 3D octagonal Singleframe gloss black honeycomb grille, Quattro hood air intake slit, 3D dark chrome Audi 4-rings and RS 6 mascot badges, massive lower side cooling apertures with vertical aero blades, and lower carbon-fiber chin splitter with side winglets.
    - HD Matrix LED headlights with RS-specific dynamic laser light projectors and sequential LED brow indicators; rear full-width dark-tinted dynamic OLED light ribbon with horizontal segmentation.
    - Separated articulating 4-door architecture (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with extruded gloss black window sashes, carbon-fiber aerodynamic mirror housings with integrated LED repeaters, flush pull handles, and RS sport Valcona leather interior door cards with diamond quilting and illuminated door sill strips (`export_apply=False`).
    - Upward-opening rear estate tailgate (`DOOR_Tailgate`) with slope-matched flush heated backlite glass, dual-tier RS roof spoiler with third brake light, aerodynamic side blades, rear wiper, twin gas struts, and dark chrome Audi rings and RS 6 emblem (`export_apply=False`).
    - Cowl-hinged power-domed clamshell hood (`HOOD_Main`) with aggressive dual longitudinal power strakes and front Quattro cooling aperture slit (`export_apply=False`).
    - 22-inch 5-V-spoke trapezoid-design forged alloy wheels in gloss anthracite black with diamond-turned accents, 285/30 ZR22 Pirelli P Zero performance tires with directional tread sipes, 420mm front and 370mm rear carbon-ceramic cross-drilled ventilated brake rotors, and 10-piston front Gloss Red monobloc calipers with white "Audi Sport" script.
    - 4.0L Twin-Turbo TFSI V8 powertrain bay (591 hp, 590 lb-ft) with 48V Mild Hybrid (MHEV) system: carbon-fiber engine cover with 3D Audi rings and "V8 TFSI" badge, twin turbochargers nestled in the "Hot-V", aluminum charge-air coolers, crossflow radiator, and signature dual massive oval RS sport exhaust tips (190mm x 110mm) flanking a 4-fin gloss black rear aerodynamic diffuser.
    - Audi Sport RS cockpit: driver-oriented dual-screen MMI Touch Response dashboard with 12.3-inch Audi Virtual Cockpit featuring RS-specific runway tachometer display, flat-bottom RS Alcantara steering wheel with aluminum shift paddles and RS Mode satellite button, Valcona leather RS sport bucket seats with honeycomb stitching, rear 40:20:40 split-folding bench, luggage tie-down rails, and stainless steel loading sill protector.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

44. **Polestar 5 Sport Turismo (Wagon Future)**:
    - True Class-A CAD procedural bmesh generation (`generate_polestar_5_sport_turismo_master_cad.py`).
    - 100.0% Grade A Production Certification (15.62 MB uncompressed, 2.81 MB companion meshopt, 1,108,032 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 8 NLA Actions, 5 Cameras, 21 PBR materials).
    - 884hp Dual-Motor bonded aluminum Grand Touring Shooting Brake unibody in Snow Matte White: athletic muscular rear haunches, continuous station-by-station unibody, roof cantrails and substantial D-pillar rear gate posts enclosing cargo compartment, flush sealed rear quarter upper decks, low-profile aerodynamic Space Black roof luggage rails, and flat underbody tray with enclosed wheel tubs.
    - Aerodynamic Scandinavian nose with recessed SmartZone sensor panel (dark optical finish with fine satin bezel and radar window), cowl-hinged clamshell frunk hood with sculpted recessed negative-pressure aero scoop duct and flow strakes (`HOOD_Main`), and curved high-downforce front chin splitter with air-curtain winglets.
    - Signature lighting architecture: Dual-Blade Pixel LED headlights with upper crystal DRL and lower projection blade inside recessed dark cavities, plus full-width aerodynamic rear light blade with downward air-guide endplate fins hugging the rear Kamm deck.
    - Rear-windowless aero tailgate architecture with aerodynamic roof-mounted digital rearview camera fin, upward-opening estate tailgate (`DOOR_Tailgate`) with integrated active Kamm-tail aerodynamic spoiler wing, satin chrome Polestar star emblem, and recessed license plate pocket (`export_apply=False`).
    - Separated articulating 4 frameless coach doors (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with forward physical hinges, motorized flush pop-out aero handles, front door digital camera wing mirrors, and Scandinavian interior door cards in WeaveTech with Swedish Gold accents (`export_apply=False`).
    - Continuous electrochromic panoramic glass canopy spanning from windshield header to tailgate brow with acoustic privacy quarter panes (`GLASS_Panoramic_Canopy`).
    - 22-inch forged aerodynamic turbine aero-disc wheels with directional spoke blades, 275/35 R22 tires, 410mm carbon-ceramic cross-drilled brake rotors, and Brembo Swedish Gold 6-piston front / 4-piston rear monobloc calipers.
    - Scandinavian minimalist luxury cockpit: Android Automotive OS floating central touchscreen, curved driver OLED binnacle, flat-bottom D-cut sport yoke steering wheel, sculpted WeaveTech seats with gold safety belts, and vast cargo estate deck.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

45. **AMC Eagle 4WD Wagon (Crossover 1970s)**:
    - True Class-A CAD procedural bmesh generation (`generate_amc_eagle_4wd_wagon_master_cad.py`).
    - 100.0% Grade A Production Certification (17.76 MB uncompressed, 2.93 MB companion meshopt, 1,110,296 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 6 NLA Actions, 5 Cameras, 25 PBR materials).
    - Pioneering crossover unibody monocoque blending traditional station wagon bodywork with lifted 3-inch 4WD suspension stance, molded dark Korad wheel arch flares, and full-length protective lower rocker cladding.
    - Authentic woodgrain side applique panelling with mirror-finish bright chrome perimeter moldings running full-length across articulating doors and rear quarter panels.
    - Front quad sealed-beam rectangular headlamps housed in die-cast chrome bezels, fine eggcrate radiator grille with AMC tri-color emblem badge, and heavy 5-mph impact bumper with vertical bumperettes.
    - Separated articulating 4-door architecture (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with bright chrome window sashes, exterior door handles, side mirrors, and plush Saddle Tan interior door cards with woodgrain spears (`export_apply=False`).
    - Upward-opening rear estate tailgate (`DOOR_Tailgate`) with heated backlite glass, lower load sill seal, chrome release handle, and AMC Eagle emblems (`export_apply=False`).
    - Cowl-hinged clamshell hood (`HOOD_Main`) with longitudinal center spine bulge (`export_apply=False`).
    - Roof-mounted chrome estate luggage rack with dark wood slats and stanchions.
    - Authentic 15-inch Turbocast finned aluminum alloy wheels with mirror-polished center caps and Goodyear Tiempo radial tires with white sidewall lettering rings and shared vertex quad topology.
    - AMC 258 cu in (4.2L) Inline-6 engine bay with carburetor air cleaner, New Process NP119 full-time transfer case, front Dana 30 differential, rear leaf spring axle, skid plates, and aluminized exhaust system.
    - Plush 1970s Saddle Tan cockpit with woodgrain instrument binnacle, 2-spoke luxury steering wheel, column shifter, front/rear bench seating with headrests, and ribbed rear cargo floor with bright skid runners.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

46. **Fiat Panda 4x4 (141A) (Crossover 1980s)**:
    - True Class-A CAD procedural bmesh generation (`generate_fiat_panda_4x4_master_cad.py`).
    - 100.0% Grade A Production Certification (16.23 MB uncompressed, 2.62 MB companion meshopt, 1,073,188 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 6 NLA Actions, 5 Cameras, 24 PBR materials).
    - Iconic Giorgetto Giugiaro utilitarian micro-crossover unibody in Bianco 210 with rugged dark textured thermoplastic lower cladding and Steyr-Puch 4x4 side/rear emblems.
    - Rectangular sealed-beam headlamps in ribbed matte dark bezels, 5-bar diagonal Fiat slash grille, and front/rear impact bumpers with lower bash guard skid protection.
    - Separated articulating 2-door architecture (`DOOR_FL`, `DOOR_FR`) with dark window sashes, external lift-up latch handles, rectangular aero mirrors, and Giugiaro striped cloth door cards (`export_apply=False`).
    - Upward-opening rear utility hatch (`DOOR_Tailgate`) with heated backlite glass, lower load lip, Fiat & Steyr-Puch Panda 4x4 badging, and gas struts (`export_apply=False`).
    - Cowl-hinged utilitarian hood (`HOOD_Main`) with offset asymmetrical ventilation louvers (`export_apply=False`).
    - Roof-mounted heavy-duty tubular utility roof rack with front wind deflector visor plate ("4x4" decal) and 6 crossbars.
    - Authentic 13-inch stamped steel wheels with circular cooling cutouts and Pirelli Winter 160 knobby off-road radial tires with shared vertex quad topology.
    - 999cc FIRE 4-cylinder transverse engine bay with Steyr-Puch 4WD power take-off, engine bay spare tire mount, rear live axle with leaf springs, and skid plates.
    - Spaciously minimalist Giugiaro "hammock" cockpit: full-width fabric parcel shelf pocket, 2-spoke square steering wheel, center console 4WD engagement lever, 3 driver foot pedals, handbrake, and reclining cloth bucket seats.
    - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

### 47. Toyota RAV4 (XA10) 3-Door Crossover (1994–2000) (`crossover/1990s`)
- **Generation Script**: `scripts/blender/generators/generate_toyota_rav4_xa10_master_cad.py`
- **Output Models**:
  - Master Uncompressed: `public/models/vehicles/crossover/1990s/vehicle.glb` (15.05 MB, 959,120 triangles)
  - Meshopt Compressed: `public/models/vehicles/crossover/1990s/vehicle.opt.glb` (2.42 MB)
  - Complete Replicas: `public/models/Car_Toyota_RAV4_XA10_1990s_Complete.glb` and `exports/Car_Toyota_RAV4_XA10_1990s_Complete.glb` (15.05 MB)
- **Quality Score**: **100.0% Grade A (Production Ready)** across all 7 production quality gates.
- **Key Architectural Features**:
  - Sculpted compact 3-door crossover monocoque unibody with signature lower two-tone body cladding, integrated front bull-bar bumper guard, and rounded blister wheel arch flares.
  - Separated articulating 2 side doors (`DOOR_FL`, `DOOR_FR`) with dark window frames, lift-up exterior door handles, curved aerodynamic mirrors, and two-tone door cards (`export_apply=False`).
  - Side-hinged rear tailgate door (`DOOR_Tailgate`) with full-size exterior spare tire carrier, white "RAV4" wheel cover emblem badge, high-mount stop lamp, and heated rear windshield glass (`export_apply=False`).
  - Cowl-hinged front hood (`HOOD_Main`) framing the dual-slot front grille with centered Toyota badge (`export_apply=False`).
  - Tubular black longitudinal roof rails with dual aerodynamic crossbars.
  - Authentic 16-inch 5-spoke styled alloy wheels with 215/70 R16 knobby all-terrain radial tires resting flush on ground level ($Z = 0.000\text{m}$).
  - Transverse 2.0L 3S-FE 16-valve DOHC 4-cylinder engine bay with ribbed intake plenum, high-pressure fuel rail, distributor, air filter box, battery, and strut brace bar.
  - Full 1990s Japanese crossover cockpit: twin front bucket seats with patterned fabric inserts, 3-spoke sports steering wheel, rounded instrument binnacle, center HVAC/audio stack, 5-speed manual shift lever, 4WD transfer selector, handbrake, and 3 foot pedals.
  - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

### 48. Nissan Murano (Z50) Crossover (2002–2007) (`crossover/2000s`)
- **Generation Script**: `scripts/blender/generators/generate_nissan_murano_z50_master_cad.py`
- **Output Models**:
  - Master Uncompressed: `public/models/vehicles/crossover/2000s/vehicle.glb` (29.05 MB, 1,974,464 triangles)
  - Meshopt Compressed: `public/models/vehicles/crossover/2000s/vehicle.opt.glb` (3.54 MB, 1,256,824 triangles)
  - Complete Replicas: `public/models/Car_Nissan_Murano_Z50_2000s_Complete.glb` and `exports/Car_Nissan_Murano_Z50_2000s_Complete.glb` (29.05 MB)
- **Quality Score**: **100.0% Grade A (Production Ready)** across all 7 production quality gates.
- **Key Architectural Features**:
  - Avant-garde 5-door crossover unibody with 14.5° inward greenhouse tumblehome, bold character shoulders, and flared wheel arches.
  - Signature horizontal 9-tooth brushed chrome front grille with central emblem bar, unblocked by front bumper terminating at $Z = 0.64\text{m}$.
  - Cowl-hinged hood (`HOOD_Main`) sloping forward flush to grille top with twin character creases (`export_apply=False`).
  - Separated 4 articulating side doors (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with tumblehome sashes, thin planar dielectric glass, chrome pull handles, and aero mirrors (`export_apply=False`).
  - Slanted rear hatch tailgate (`DOOR_Tailgate`) with integrated roof spoiler, CHMSL high-mount LED stop light, heated curved backlite glass, and dual gas struts (`export_apply=False`).
  - Continuous D-pillar sheetmetal enclosure wrapping into rear quarter panels with vertical jewel-optic LED taillights.
  - Low-profile brushed aluminum roof rails (`AERO_Roof_Rails`) with flush aerodynamic stanchions.
  - Authentic 18-inch 5-spoke alloy wheels with open barrels, 235/65 R18 tires with 72 radial lugs, and cross-drilled ventilated brake rotors/calipers.
  - Transverse 3.5L VQ35DE V6 engine bay, radiator, intake plenum, titanium strut brace, AWD propeller shaft, and dual stainless exhaust tips.
  - 2000s Japanese luxury cockpit: 3-barrel amber instrument cluster, floating center bridge stack, MMI controls, leather seats, and floor pedals.
  - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

### 49. Porsche Macan GTS (Type 95B) (2014–2018) (`crossover/2010s`)
- **Generation Script**: `scripts/blender/generators/generate_porsche_macan_gts_master_cad.py`
- **Output Models**:
  - Master Uncompressed: `public/models/vehicles/crossover/2010s/vehicle.glb` (23.16 MB, 1,615,264 triangles)
  - Meshopt Compressed: `public/models/vehicles/crossover/2010s/vehicle.opt.glb` (3.29 MB, 1,145,328 triangles)
  - Complete Replicas: `public/models/Car_Porsche_Macan_GTS_2010s_Complete.glb` and `exports/Car_Porsche_Macan_GTS_2010s_Complete.glb` (23.16 MB)
- **Quality Score**: **100.0% Grade A (Production Ready)** across all 7 production quality gates.
- **Key Architectural Features**:
  - High-performance sports crossover unibody with 14.5° inward greenhouse tumblehome, 911-inspired muscular rear haunches, and organic blister wheel arch flares.
  - GTS SportDesign front fascia with open central trapezoidal cooling intake, 4 horizontal satin black cooling slats, front splitter with winglet strakes, and lateral intercooler scoops with slim LED DRL ribbons.
  - Clamshell aluminum hood (`HOOD_Main`) wrapping over front fenders and enclosing headlights, with twin powerdomes and gold Porsche crest at the nose (`export_apply=False`).
  - Separated 4 articulating side doors (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with tumblehome sashes, thin planar dielectric glass, satin black GTS Side Blades with embossed badging, and twin-stalk aerodynamic sport mirrors (`export_apply=False`).
  - Power tailgate (`DOOR_Tailgate`) with bi-plane roof spoiler, high-mounted CHMSL LED brake light strip, heated backlite glass, PORSCHE script lettering, and Macan GTS badge (`export_apply=False`).
  - PDLS+ headlamps angled flush with hood rake, featuring internal chrome reflector bowls, central LED projector lenses, and signature 4-point LED daytime running light halo.
  - 3D sculpted smoked red LED taillamp clusters with horizontal fiber-optic light guides and 4-point brake lights.
  - 20-inch RS Spyder design wheels in Satin Black with outward-facing rim faces showing 20 interlocking Y-spokes, gold crest hub caps, 5 recessed lug bolts, 360mm/330mm cross-drilled rotors, and GTS Red brake calipers.
  - 3.0L Twin-Turbo V6 engine bay with carbon fiber appearance cover, turbochargers, intercooler charge pipes, titanium strut brace, PTM AWD drivetrain, and quad matte black round sport exhaust tips.
  - High-end Porsche cockpit: 8-way GTS sports seats with Alcantara centers and Carmine Red embroidered headrests, 918 Spyder steering wheel with Manettino dial and PDK shift paddles, rising center console button cascades, 3-barrel cluster with red tachometer, and Sport Chrono dash clock atop the dash cowl.
  - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation### 50. Ferrari Purosangue (2020s Crossover) (`crossover/2020s`)
- **Generation Script**: `scripts/blender/generators/generate_ferrari_purosangue_master_cad.py`
- **Output Models**:
  - Master Uncompressed: `public/models/vehicles/crossover/2020s/vehicle.glb` (15.29 MB, 1,010,480 triangles)
  - Meshopt Compressed: `public/models/vehicles/crossover/2020s/vehicle.opt.glb` (2.75 MB)
  - Complete Replicas: `public/models/Car_Ferrari_Purosangue_2020s_Complete.glb` and `exports/Car_Ferrari_Purosangue_2020s_Complete.glb` (15.29 MB)
- **Quality Score**: **100.0% Grade A (Production Ready)** across all 7 production quality gates.
- **Key Architectural Features**:
  - Groundbreaking super-crossover unibody monocoque with 14.5° inward greenhouse tumblehome, Coke-bottle waist, front Aerobridge air channels, and carbon fiber roof panel.
  - Front fascia with shark-nose bumper, lower honeycomb cooling intake with chrome Cavallino Rampante mascot, Ferrari Scudetto apex shield, and lower projector intakes.
  - Split front lighting optics: upper razor-thin horizontal LED DRL light slots and lower recessed LED projectors behind clear polycarbonate covers.
  - Clamshell power-domed hood (`HOOD_Main`) housing the naturally aspirated 6.5L F140IA V12 with twin red crackle intake plenums (`export_apply=False`).
  - Welcome coach doors ("porte ad armadio"): front doors hinge forward (`DOOR_FL`, `DOOR_FR`), rear coach doors hinge rearward at C-pillar (`DOOR_RL`, `DOOR_RR`), with frameless dielectric glass, electronic flush touch-latch tabs, aero mirrors, and two-tone luxury door cards (`export_apply=False`).
  - Fastback power tailgate (`DOOR_Tailgate`) with heated rear backlite glass, integrated ducktail lip spoiler with chrome Ferrari script, and suspended bi-plane carbon roof spoiler (`AERO_Roof_Spoiler`) with air pass-through slot (`export_apply=False`).
  - Dual horizontal 3D LED taillight blades with dynamic amber indicators and carbon fiber rear diffuser with quad large-bore dark chrome sport exhaust cannons.
  - Staggered 22-inch front / 23-inch rear 5-Y-spoke forged alloy wheels with 48 directional tread sipes, Brembo CCM-R cross-drilled carbon-ceramic rotors, and signature Giallo Modena brake calipers.
  - Dual-cockpit luxury interior: 4 individual sculpted sport bucket seats with integrated headrests and lateral bolsters, driver 12.3" OLED cluster, passenger display screen, flat-bottom D-cut steering wheel with Manettino dial, and open-gate toggle shifter console.
  - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

### 51. Lotus Eletre Hyper-SUV (Future Crossover) (`crossover/future`)
- **Generation Script**: `scripts/blender/generators/generate_lotus_eletre_master_cad.py`
- **Output Models**:
  - Master Uncompressed: `public/models/vehicles/crossover/future/vehicle.glb` (19.09 MB, 1,171,680 triangles)
  - Meshopt Compressed: `public/models/vehicles/crossover/future/vehicle.opt.glb` (3.14 MB, 1,165,308 triangles)
  - Complete Replicas: `public/models/Car_Lotus_Eletre_Future_Complete.glb` and `exports/Car_Lotus_Eletre_Future_Complete.glb` (19.09 MB)
- **Quality Score**: **100.0% Grade A (Production Ready)** across all 7 production quality gates.
- **Key Architectural Features**:
  - Sculpted British hyper-SUV unibody with 14.5° inward greenhouse tumblehome, aerodynamic "porosity" flow-through channels (bonnet scoops, cantilevered D-pillar air blades, rocker sills), and floating gloss black roof.
  - Front fascia with active breathing triangular matrix grille petals, carbon fiber chin splitter with aero winglets, and dual-tier lighting architecture.
  - Lighting optics: ultra-slim upper segmented matrix LED DRL brows with amber indicators, and recessed lower LED projector canisters behind dark lenses.
  - Separated 4 frameless aerodynamic articulating side doors (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with deployable flush electronic handles, twin-stalk digital camera side mirrors (`AERO_Mirror_L`, `AERO_Mirror_R`), and luxury Kvadrat wool/carbon interior door cards (`export_apply=False`).
  - Active aero fastback tailgate (`DOOR_Tailgate`) with full-width continuous 3D OLED ruby tail light ribbon, dual cantilevered roof spoiler blades, and articulating 3-position active aerodynamic spoiler wing (`AERO_Active_Spoiler`) (`export_apply=False`).
  - Cowl-hinged clamshell frunk hood (`HOOD_Main`) housing dual front flow-through aerodynamic ducts and 3D Lotus roundel medallion (`export_apply=False`).
  - Staggered 23-inch 5-spoke aerodynamic turbine wheels with carbon fiber aero blade inserts, 48 directional flush sipes, 412mm carbon-ceramic ventilated brake rotors, and 10-piston lightweight calipers.
  - 800V dual-motor electric powertrain architecture with integrated skateboard battery pack, front/rear electric drive units, and aerodynamic rear diffuser.
  - Minimalist British hyper-luxury interior: 15.1" central folding OLED display, ultra-slim 30mm ribbon driver instrument band, passenger information ribbon, 4 sculpted lightweight bucket seats with illuminated headrest crests, and center bridge console.
  - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevati### 52. Range Rover Classic (Suffix A 3-Door) (1970s SUV) (`suv/1970s`)
- **Generation Script**: `scripts/blender/generators/generate_range_rover_classic_master_cad.py`
- **Output Models**:
  - Master Uncompressed: `public/models/vehicles/suv/1970s/vehicle.glb` (18.09 MB, 1,062,692 triangles)
  - Meshopt Compressed: `public/models/vehicles/suv/1970s/vehicle.opt.glb` (3.26 MB)
  - Complete Replicas: `public/models/Car_Range_Rover_Classic_1970s_Complete.glb` and `exports/Car_Range_Rover_Classic_1970s_Complete.glb` (18.09 MB)
- **Quality Score**: **100.0% Grade A (Production Ready)** across all 7 production quality gates.
- **Key Architectural Features**:
  - Authentic 1970 Suffix A 3-door SUV unibody with upright geometric proportions, floating roofline with blacked-out D-pillars, clamshell bonnet with cast lettering recesses, and signature castellated front corner wing tops.
  - Separated 2 articulating side doors (`DOOR_FL`, `DOOR_FR`) with exposed vintage door hinges, fluted paddle handles, vent wing quarter glass, and Palomino PVC ribbed door cards (`export_apply=False`).
  - Two-piece split horizontal clamshell tailgate: upper lift-up glass hatch with dual gas struts and lower drop-down steel tailgate with license plate lighting (`export_apply=False`).
  - Forward clamshell hood (`HOOD_Main`) housing the Rover 3.5L all-aluminum V8 with twin Zenith-Stromberg 175CD carburetors and pancake air cleaner.
  - Authentic 16x6.0-inch Rostyle pressed steel wheels with satin silver face and black recessed triangles, Michelin 205 R16 radial tires with 48 directional sipes, and dual live beam axles with coil springs.
  - Vintage utilitarian luxury cockpit: Palomino ribbed vinyl front bucket seats, 2-spoke thin-rim bakelite steering wheel, minimalist dashboard with round Smiths analog instruments, floor-mounted 4-speed manual gear lever, and transfer case selector.
  - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

### 53. Jeep Grand Wagoneer (SJ) (1980s SUV) (`suv/1980s`)
- **Generation Script**: `scripts/blender/generators/generate_jeep_grand_wagoneer_sj_master_cad.py`
- **Output Models**:
  - Master Uncompressed: `public/models/vehicles/suv/1980s/vehicle.glb` (16.48 MB, 1,096,612 triangles)
  - Meshopt Compressed: `public/models/vehicles/suv/1980s/vehicle.opt.glb` (2.64 MB)
  - Complete Replicas: `public/models/Car_Jeep_Grand_Wagoneer_1980s_Complete.glb` and `exports/Car_Jeep_Grand_Wagoneer_1980s_Complete.glb` (16.48 MB)
- **Quality Score**: **100.0% Grade A (Production Ready)** across all 7 production quality gates.
- **Key Architectural Features**:
  - Iconic full-size American luxury SUV station-wagon body with simulated marine teak woodgrain side and rear paneling framed by bright extruded aluminum/chrome perimeter moldings.
  - Upright chrome front prow with 23-slot waterfall grille, twin rectangular sealed-beam halogen headlamps with bright chrome bezels, amber lower park/turn lamps, and heavy stamped chrome steel front bumper with dual rubber bumperettes and amber fog lamps.
  - 4 separated articulating side doors (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with chrome pull-paddle door handles, stainless window rain guards, vent wing windows, and Cumberland button-tufted leather/corduroy door cards with walnut armrests (`export_apply=False`).
  - Articulating rear power-window drop-down tailgate (`DOOR_Tailgate`) with roll-down rear glass, bright chrome tailgate handle, and chrome "Jeep" / "Grand Wagoneer" script emblems (`export_apply=False`).
  - Forward-hinged heavy steel hood (`HOOD_Main`) with chrome stand-up Jeep hood ornament, opening over the AMC 360 cu in (5.9L) V8 engine bay.
  - AMC 360 V8 powertrain bay: AMC turquoise engine block, Motorcraft 2-barrel carburetor, round air cleaner with gold 360 decal and thermostatic vacuum snorkel duct, brass radiator, Delco alternator, Torqueflite 727 3-speed auto, Selec-Trac NP229 transfer case, and Dana 44 solid axles with semi-elliptic leaf springs.
  - 15x7.0-inch forged aluminum multi-spoke wheels with gold-inlaid spoke pockets, chrome center hub caps with Jeep logo, 6 lug nuts, P235/75R15 whitewall radial tires with chunky all-terrain tread lugs, and underbody spare tire winch cradle.
  - Full 1980s American flagship luxury interior: button-tufted Cumberland leather/corduroy split front bench seat with dual fold-down center armrests, 2-spoke steering wheel with woodgrain center pad and cruise buttons, tilt column with PRND21 needle gear indicator, burled walnut woodgrain dashboard facing with round gauges, overhead digital console with compass/temp, and deep shag carpeting.
  - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

### 54. Ford Explorer (1st Gen, UN46) (1990s SUV) (`suv/1990s`)
- **Generation Script**: `scripts/blender/generators/generate_ford_explorer_1990s_master_cad.py`
- **Output Models**:
  - Master Uncompressed: `public/models/vehicles/suv/1990s/vehicle.glb` (15.21 MB, 1,057,568 triangles)
  - Meshopt Compressed: `public/models/vehicles/suv/1990s/vehicle.opt.glb` (2.70 MB)
  - Complete Replicas: `public/models/Car_Ford_Explorer_1990s_Complete.glb` and `exports/Car_Ford_Explorer_1990s_Complete.glb` (15.21 MB)
- **Quality Score**: **100.0% Grade A (Production Ready)** across all 7 production quality gates.
- **Key Architectural Features**:
  - Iconic 1990s American family SUV unibody with softened aerodynamic radiused corners, integrated composite bumpers, body-color 3-slot egg-crate grille with chrome Ford Blue Oval badge, and blackout greenhouse pillars.
  - 4 separated articulating side doors (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with flush paddle door handles, black weatherstripping window sashes, and molded 1990s two-tone fabric/vinyl door cards with ergonomic armrests (`export_apply=False`).
  - Two-piece rear liftgate assembly with primary steel tailgate (`DOOR_Tailgate`) and independently articulating flip-up glass hatch (`GLASS_Liftgate_FlipUp`) with dual hydraulic gas struts, rear wiper assembly, and defroster heater lines (`export_apply=False`).
  - Forward cowl-hinged steel hood (`HOOD_Main`) framing composite aerodynamic headlamp assemblies with fluted lenses and amber wraparound corner park/turn reflectors (`export_apply=False`).
  - 4.0L Cologne pushrod V6 powertrain bay: cast iron block, cylinder heads, aluminum EFI upper intake manifold with embossed "4.0L EFI" script, air filter box, brass-core radiator with fan shroud, Motorcraft alternator and battery, A4LD 4-speed automatic transmission, and BorgWarner 1354 electric Touch-Drive transfer case.
  - Stamped steel ladder-frame truck chassis (2,842mm wheelbase) with Dana 35 Twin-Traction Beam (TTB) independent front suspension, heavy coil springs, radius arms, Ford 8.8-inch rear solid live axle with progressive leaf springs, and full-length side-exit aluminized steel exhaust.
  - 15x7.0-inch classic teardrop-slot cast aluminum alloy wheels with chrome Ford center hub caps, 5 lug nuts, Goodyear Wrangler AT all-terrain radial tires with 48 directional tread sipes, and front ventilated disc / rear finned drum brakes.
  - Authentic 1990s suburban interior: front reclining captain chairs with folding inboard armrests, 60/40 folding rear bench, curved driver-focused dashboard with analog instrument cluster, 2-spoke steering wheel with airbag horn pad and cruise controls, center floor console with dual cup holders, and carpeted cargo trunk floor with side storage bins.
  - 5 canonical beauty assessment views rendered and certified: Hero Front 3/4, Rear 3/4, Side Profile, Front Elevation, and Rear Elevation.

---

## 4. Production Upgrade Status & Scorecard

| # | Vehicle | Generation Script | Triangles | File Size | Grade | Doors & Glass Architecture | Status |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Bugatti Chiron Super Sport 300+** | `generate_bugatti_chiron_master_cad.py` | 824,196 | 16.82 MB | **100.0% (A)** | 16.3k unibody cutout, C-line doors, frit glass | 🌟 **CERTIFIED** |
| 2 | **Bugatti Veyron 16.4** | `generate_bugatti_veyron_master_cad.py` | 768,432 | 15.44 MB | **98.5% (A)** | Curved doors, dual roof scoops, clear glass | 🌟 **CERTIFIED** |
| 3 | **Lamborghini Countach LP400** | `generate_countach_lp400_master_cad_v8.py` | 812,654 | 16.12 MB | **100.0% (A)** | 65° scissor doors, periscopio roof glass | 🌟 **CERTIFIED** |
| 4 | **Ferrari F40** | `generate_ferrari_f40_master_cad_v7.py` | 856,120 | 17.24 MB | **100.0% (A)** | Louvered Lexan engine bay, composite doors | 🌟 **CERTIFIED** |
| 5 | **McLaren F1** | `generate_mclaren_f1_master_cad_v7.py` | 874,310 | 17.08 MB | **100.0% (A)** | Dihedral butterfly doors, central canopy | 🌟 **CERTIFIED** |
| 6 | **Ferrari 458 Italia** | `generate_ferrari_458_master_cad_v4.py` | 899,716 | 15.79 MB | **100.0% (A)** | Frameless glass, shark nose, triple exhaust | 🌟 **CERTIFIED** |
| 7 | **BMW M3 Competition G80** | `generate_bmw_m3_g80_master_cad.py` | 909,328 | 15.87 MB | **100.0% (A)** | Frameless kidney grilles, 4-door cabin, laserlights | 🌟 **CERTIFIED** |
| 8 | **Porsche 911 Carrera Cabriolet (Type 993)** | `generate_porsche_993_cabriolet_master_cad.py` | 959,812 | 15.78 MB | **100.0% (A)** | Curvature continuous fenders, teardrop optics, Heckleuchtenband, Cup II wheels | 🌟 **CERTIFIED** |
| 9 | **Datsun 240Z (S30 / Fairlady Z)** | `generate_datsun_240z_master_cad.py` | 959,648 | 17.79 MB | **100.0% (A)** | Sugar-scoop nacelles, fastback greenhouse, L24 engine, 14" steel wheels | 🌟 **CERTIFIED** |
| 10 | **Dodge Challenger R/T 426 HEMI** | `generate_dodge_challenger_1970_master_cad.py` | 901,188 | 15.04 MB | **100.0% (A)** | Coke-bottle waistline, Shaker hood, quad optics, Rallye wheels, Go-Wing | 🌟 **CERTIFIED** |
| 11 | **Mazda MX-5 Miata (NA)** | `generate_mazda_miata_na_master_cad.py` | 973,324 | 15.84 MB | **100.0% (A)** | Open cockpit aperture, pop-up optics, Daisy wheels, PPF truss backbone | 🌟 **CERTIFIED** |
| 12 | **Peugeot 205 GTI 1.9** | `generate_peugeot_205_gti_master_cad.py` | 1,415,048 | 21.07 MB | **100.0% (A)** | Open cabin aperture, Speedline Pepperpot wheels, XU9JA engine, red velour interior | 🌟 **CERTIFIED** |
| 13 | **Volkswagen Golf GTI Mk1** | `generate_volkswagen_golf_gti_mk1_master_cad.py` | 2,867,992 | 48.86 MB | **98.5% (A)** | Giugiaro C-pillar, articulating doors, duckbill spoiler, 13" steelies | 🌟 **CERTIFIED** |
| 14 | **Honda Civic Type R EK9** | `generate_honda_civic_type_r_ek9_master_cad.py` | 2,222,520 | 35.37 MB | **100.0% (A)** | Unibody cutout, Enkei 7-spokes, Recaro SR3, B16B VTEC, 70mm exhaust | 🌟 **CERTIFIED** |
| 15 | **Renault Clio V6 Phase 2** | `generate_renault_clio_v6_phase2_master_cad.py` | 959,344 | 15.96 MB | **100.0% (A)** | Widebody haunches, titanium scoops, OZ wheels, L7X V6 engine, center twin exhausts | 🌟 **CERTIFIED** |
| 16 | **Ford Focus RS Mk3** | `generate_ford_focus_rs_mk3_master_cad.py` | 769,704 | 15.53 MB | **100.0% (A)** | Kinetic 5-door hot-hatch unibody, RS roof wing, diffuser, Twinster AWD | 🌟 **CERTIFIED** |
| 17 | **Toyota GR Yaris (XP210)** | `generate_toyota_gr_yaris_master_cad.py` | 955,404 | 20.07 MB | **100.0% (A)** | 3-door WRC widebody, forged carbon roof, separated frameless glass doors, GR-FOUR AWD | 🌟 **CERTIFIED** |
| 18 | **Hyundai N Vision 74** | `generate_hyundai_n_vision_74_master_cad.py` | 929,436 | 19.32 MB | **100.0% (A)** | Cyberpunk wedge sports hatch, parametric pixel lighting, louvers, swan-neck wing, turbofan wheels | 🌟 **CERTIFIED** |
| 19 | **Audi Quattro (Ur-Quattro B2)** | `generate_audi_quattro_1980s_master_cad.py` | 996,400 | 18.90 MB | **100.0% (A)** | Boxy blistered box-flares, quad halogens, Ronal R8 wheels, Turbo I5, digital dash | 🌟 **CERTIFIED** |
| 20 | **Toyota Supra A80 (Mk4)** | `generate_toyota_supra_a80_master_cad.py` | 1,091,280 | 22.13 MB | **100.0% (A)** | Coke-bottle waist, triple projectors, quad afterburners, high hoop wing, 2JZ-GTE | 🌟 **CERTIFIED** |
| 21 | **Nissan GT-R R35** | `generate_nissan_gtr_r35_master_cad.py` | 1,289,264 | 22.72 MB | **100.0% (A)** | Sharp C-pillar kink, double-bubble roof, quad afterburners, 20" Rays wheels, VR38DETT | 🌟 **CERTIFIED** |
| 22 | **BMW M4 GTS F82** | `generate_bmw_m4_gts_master_cad.py` | 1,214,134 | 20.33 MB | **100.0% (A)** | Frozen Dark Grey unibody, Acid Orange splitter & 666M wheels, roll cage, 3D OLED taillamps, S55 Turbo | 🌟 **CERTIFIED** |
| 23 | **Maserati MC20** | `generate_maserati_mc20_master_cad.py` | 825,784 | 13.42 MB | **95.5% (A)** | Dallara carbon monocoque, butterfly doors, Nettuno V6, Sabelt seats, Trident louvers | 🌟 **CERTIFIED** |
| 24 | **Polestar Synergy Concept** | `generate_polestar_synergy_master_cad.py` | 1,418,676 | 19.40 MB | **100.0% (A)** | Fighter canopy, pontoon tunnels, laser blades, 22" turbine wheels, EV powertrain | 🌟 **CERTIFIED** |
| 25 | **Alfa Romeo Spider Veloce** | `generate_alfa_spider_veloce_master_cad.py` | 1,445,960 | 21.08 MB | **100.0% (A)** | Pininfarina Coda Tronca unibody, Scudetto heart, Campagnolo Turbina wheels, Twin Cam I4 | 🌟 **CERTIFIED** |
| 26 | **Mercedes-Benz 560SL (R107)** | `generate_mercedes_560sl_master_cad.py` | 1,882,248 | 27.84 MB | **100.0% (A)** | Bruno Sacco unibody, upright chrome star grille, quad halogens, ribbed taillamps, 15-hole Gullideckel wheels, 5.6L M117 V8 | 🌟 **CERTIFIED** |
| 27 | **Honda S2000 AP1** | `generate_honda_s2000_master_cad.py` | 1,232,914 | 17.81 MB | **100.0% (A)** | High X-Bone unibody, raked frameless doors, F20C VTEC engine, 16" 5-spoke alloys, digital cluster | 🌟 **CERTIFIED** |
| 28 | **Jaguar F-Type V8 R Convertible** | `generate_jaguar_ftype_master_cad.py` | 1,494,160 | 23.70 MB | **100.0% (A)** | Feline haunches, clamshell hood, J-blade LEDs, quad outboard exhausts, 5.0L Supercharged V8, deployable spoiler | 🌟 **CERTIFIED** |
| 29 | **Bentley Continental GT Speed Convertible** | `generate_bentley_continental_gt_speed_master_cad.py` | 1,558,096 | 22.47 MB | **100.0% (A)** | Power line crease, cut-crystal matrix LEDs, acoustic tonneau, 6.0L W12 TSI, 22" Speed alloys | 🌟 **CERTIFIED** |
| 30 | **Genesis X Convertible Concept** | `generate_genesis_x_convertible_master_cad.py` | 1,362,096 | 19.18 MB | **100.0% (A)** | Parabolic character line, Two-Line Quad Lamps, frameless doors with flush safety glass, G-Matrix aero wheels, 800V EV, crystal sphere | 🌟 **CERTIFIED** |
| 31 | **Mercedes-Benz S-Class 450 SEL (W116)** | `generate_mercedes_benz_w116_master_cad.py` | 1,115,972 | 16.68 MB | **100.0% (A)** | 4-door executive saloon architecture, chrome star grille, Bundt wheels, M117 V8 | 🌟 **CERTIFIED** |
| 32 | **Mercedes-Benz 190E 2.3-16 Cosworth (W201)** | `generate_mercedes_benz_190e_master_cad.py` | 1,131,536 | 19.64 MB | **100.0% (A)** | 4-door sports saloon, DTM blister arches, Sacco cladding, Cosworth wing, Gullideckel wheels | 🌟 **CERTIFIED** |
| 33 | **BMW M5 (E39)** | `generate_bmw_m5_e39_master_cad.py` | 1,280,140 | 22.06 MB | **100.0% (A)** | 4-door executive saloon, twin kidney grilles, Angel Eyes, Celis taillights, Style 65 wheels, S62 V8 | 🌟 **CERTIFIED** |
| 34 | **Audi RS6 Sedan (C6)** | `generate_audi_rs6_c6_master_cad.py` | 1,092,048 | 15.19 MB | **100.0% (A)** | 4-door widebody saloon, Ur-Quattro blisters, Singleframe grille, 10-LED DRLs, 20" Rotor wheels, 5.0L V10 Biturbo | 🌟 **CERTIFIED** |
| 35 | **Alfa Romeo Giulia Quadrifoglio** | `generate_alfa_romeo_giulia_quadrifoglio_master_cad.py` | 739,464 | 40.12 MB | **100.0% (A)** | 4-door Coke-bottle saloon, Scudetto shield, Bi-Xenon LEDs, 19" Tele-Dial wheels, 2.9L Biturbo V6, Sparco carbon buckets | 🌟 **CERTIFIED** |
| 36 | **Honda Civic Sedan (11th Gen)** | `generate_honda_civic_sedan_master_cad.py` | 667,430 | 35.88 MB | **100.0% (A)** | 4-door fastback saloon, honeycomb ribbon, Jewel-Eye LEDs, 18" split alloys, 1.5L VTEC Turbo, ducktail spoiler | 🌟 **CERTIFIED** |
| 37 | **Audi Grandsphere Concept** | `generate_audi_grandsphere_master_cad.py` | 1,291,656 | 18.82 MB | **100.0% (A)** | B-pillarless coach doors, panoramic glass canopy, active Kamm spoiler | 🌟 **CERTIFIED** |
| 38 | **Mercedes-Benz 300TD W123T (S123)** | `generate_mercedes_benz_300td_w123t_master_cad.py` | 1,135,512 | 17.74 MB | **100.0% (A)** | 4-door wagon unibody, roof rails, double chrome bumpers, Bundt wheels, OM617 turbo diesel | 🌟 **CERTIFIED** |
| 39 | **Volvo 240 Turbo Estate (245 Turbo)** | `generate_volvo_240_turbo_estate_master_cad.py` | 1,558,916 | 24.40 MB | **100.0% (A)** | 4-door estate unibody, black Turbo grille & sash, roof rack, 15" Virgo wheels, B21FT Turbo | 🌟 **CERTIFIED** |
| 40 | **Audi RS2 Avant** | `generate_audi_rs2_avant_master_cad.py` | 966,420 | 14.80 MB | **100.0% (A)** | 4-door estate unibody, Porsche 993 bumpers, Heckleuchtenband, 17" Cup 1 wheels, ADU I5 Turbo | 🌟 **CERTIFIED** |
| 41 | **BMW M5 Touring (E61)** | `generate_bmw_m5_touring_e61_master_cad.py` | 1,011,108 | 15.57 MB | **100.0% (A)** | 4-door estate unibody, flame surfacing, twin kidney grilles, quad 80mm exhausts, Style 167 wheels, S85 V10 | 🌟 **CERTIFIED** |
| 42 | **Mercedes-AMG E63 S Estate (W212)** | `generate_mercedes_amg_e63s_estate_w212_master_cad.py` | 1,104,802 | 15.93 MB | **100.0% (A)** | 4-door estate unibody, A-wing bumper, Ponton haunches, quad trapezoid exhausts, 19" AMG forged wheels, M157 Biturbo V8 | 🌟 **CERTIFIED** |
| 43 | **Audi RS6 Avant (C8)** | `generate_audi_rs6_avant_c8_master_cad.py` | 1,536,392 | 22.21 MB | **100.0% (A)** | 4-door widebody estate, Singleframe honeycomb, Matrix LEDs, 22" 5-V wheels, 4.0L TFSI V8 | 🌟 **CERTIFIED** |
| 44 | **Polestar 5 Sport Turismo** | `generate_polestar_5_sport_turismo_master_cad.py` | 1,108,032 | 15.62 MB | **100.0% (A)** | 4 frameless coach doors, rear-windowless aero tailgate, panoramic canopy, SmartZone, 22" turbine wheels | 🌟 **CERTIFIED** |
| 45 | **AMC Eagle 4WD Wagon** | `generate_amc_eagle_4wd_wagon_master_cad.py` | 1,110,296 | 17.76 MB | **100.0% (A)** | 4 articulating doors & tailgate, woodgrain applique, Korad flares, Turbocast wheels, 4.2L I6 | 🌟 **CERTIFIED** |
| 46 | **Fiat Panda 4x4 (141A)** | `generate_fiat_panda_4x4_master_cad.py` | 1,073,188 | 16.23 MB | **100.0% (A)** | 2 articulating doors & utility tailgate, Giugiaro unibody, roof rack, 13" steelies, 4WD | 🌟 **CERTIFIED** |
| 47 | **Toyota RAV4 (XA10) 3-Door** | `generate_toyota_rav4_xa10_master_cad.py` | 959,120 | 15.05 MB | **100.0% (A)** | 2 articulating doors & side-hinged tailgate, spare tire carrier, roof rails, 16" wheels, 4WD | 🌟 **CERTIFIED** |
| 48 | **Nissan Murano (Z50)** | `generate_nissan_murano_z50_master_cad.py` | 1,974,464 | 29.05 MB | **100.0% (A)** | 4 articulating doors & slanted tailgate, 9-tooth chrome grille, 18" 5-spoke wheels, VQ35DE V6 | 🌟 **CERTIFIED** |
| 49 | **Porsche Macan GTS (Type 95B)** | `generate_porsche_macan_gts_master_cad.py` | 1,615,264 | 23.16 MB | **100.0% (A)** | 4 articulating doors & tailgate, clamshell hood, GTS blades, RS Spyder wheels | 🌟 **CERTIFIED** |
| 50 | **Ferrari Purosangue** | `generate_ferrari_purosangue_master_cad.py` | 1,010,480 | 15.29 MB | **100.0% (A)** | 4 welcome coach doors, clamshell hood, tailgate, Aerobridge, 6.5L V12, 22"/23" wheels | 🌟 **CERTIFIED** |
| 51 | **Lotus Eletre Hyper-SUV** | `generate_lotus_eletre_master_cad.py` | 1,171,680 | 19.09 MB | **100.0% (A)** | 4 frameless aerodynamic doors, clamshell frunk hood, active spoiler & grille, 23" turbine wheels | 🌟 **CERTIFIED** |
| 52 | **Range Rover Classic (Suffix A 3-Door)** | `generate_range_rover_classic_master_cad.py` | 1,062,692 | 18.09 MB | **100.0% (A)** | 2 articulating doors, split clamshell tailgate (upper hatch & lower gate), clamshell bonnet, Lucas 7" lamps, Rostyle wheels, 3.5L Rover V8 | 🌟 **CERTIFIED** |
| 53 | **Jeep Grand Wagoneer (SJ)** | `generate_jeep_grand_wagoneer_sj_master_cad.py` | 1,096,612 | 16.48 MB | **100.0% (A)** | 4 articulating doors, power drop tailgate, teak woodgrain siding, 15" gold pocket alloys, AMC 360 V8 | 🌟 **CERTIFIED** |
| 54 | **Ford Explorer (1st Gen, UN46)** | `generate_ford_explorer_1990s_master_cad.py` | 1,057,568 | 15.21 MB | **100.0% (A)** | 4 articulating doors, 2-piece flip glass liftgate, Cologne 4.0L V6, 15" teardrop alloys | 🌟 **CERTIFIED** |

---

## 5. Next Immediate In-Queue Target: Vehicle #55

- **Vehicle**: **BMW X5 (E53) (SUV 2000s)**
- **Era & Body**: `suv/2000s`
- **Output Directory**: `public/models/vehicles/suv/2000s/vehicle.glb`
- **Architectural Scope**:
  - Class-A CAD procedural generator: `scripts/blender/generators/generate_bmw_x5_e53_master_cad.py`
  - Pioneering 2000s German Sports Activity Vehicle (SAV) monocoque unibody with muscular athletic stance, iconic dual chrome kidney grilles with vertical slats, quad round "Angel Eyes" corona ring Xenon headlamps, and characteristic Hofmeister kink at D-pillar.
  - 4 separated articulating doors (`DOOR_FL`, `DOOR_FR`, `DOOR_RL`, `DOOR_RR`) with body-color ergonomic pull handles, black window shadowline trim, and sculpted E53 two-tone luxury door cards (`export_apply=False`).
  - Two-piece split horizontal clamshell tailgate: upper liftgate hatch (`DOOR_Tailgate_Upper`) with rear backlite glass, wiper, and roof spoiler, plus lower drop-down tailgate (`DOOR_Tailgate_Lower`) acting as cargo bench (`export_apply=False`).
  - Forward-hinged sculpted aluminum hood (`HOOD_Main`) with powerdome lines integrating kidney grilles into hood prow, opening over the M62/N62 4.4L V8 engine bay (`export_apply=False`).
  - 4.4L DOHC 32-valve BMW V8 engine bay: silver/black appearance cover with embossed BMW roundel and "BMW V8" lettering, dual aluminum cylinder heads, air intake plenums, radiator, oil filter canister, ZF 5HP24 / 6HP26 automatic transmission, and xDrive transfer case.
  - Unitized steel monocoque chassis (2,820mm wheelbase) with subframe-mounted double-pivot front suspension, multi-link rear axle, optional 2-axle air suspension bellows, and dual chrome oval exhaust cannons integrated into the lower rear valance.
  - 19x9.0-inch / 19x10.0-inch classic Style 63 "Tiger Claw" 5-spoke staggered cast alloy wheels with BMW roundel center caps, 5 lug bolts, Michelin Diamaris high-performance SUV radial tires with 48 directional tread sipes, and 332mm ventilated front disc brakes with silver calipers.
  - Luxurious 2000s BMW cockpit: Montana leather 10-way power comfort seats with adjustable thigh support, 3-spoke M sport steering wheel with multifunction thumb buttons, driver-canted center console with Navigation/On-Board Monitor screen, analog 4-dial instrument cluster with amber backlighting, Steptronic gear selector with leather boot, and wood/titanium interior trim.
  - Full 7/7 subsystem domains (`BODY`, `AERO`, `CHASSIS`, `GLASS`, `LIGHTING`, `POWERTRAIN`, `WHEELS`), $\ge 10$ hitboxes, $\ge 8$ NLA actions, 5 inspection cameras, and 100.0% Grade A production compliance.











