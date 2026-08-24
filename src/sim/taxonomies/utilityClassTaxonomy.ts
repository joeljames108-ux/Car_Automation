// ===================================================================
// UTILITY & SPECIALTY VEHICLE CLASS TAXONOMY
// ===================================================================
// Comprehensive definitions for 25+ consumer, commercial, motorsport,
// and powertrain specialty classes.
// ===================================================================

export type UtilityClassCategory =
  | "CONSUMER_PASSENGER"
  | "COMMERCIAL_FLEET"
  | "MOTORSPORT_RACING"
  | "POWERTRAIN_SPECIALTY";

export type UtilityClassId =
  | "CITY_CAR"
  | "HATCHBACK"
  | "SEDAN"
  | "WAGON"
  | "COUPE"
  | "CONVERTIBLE"
  | "SUV"
  | "CROSSOVER_CUV"
  | "PICKUP_TRUCK"
  | "MINIVAN"
  | "COMMERCIAL_VAN"
  | "OFFROAD_4X4"
  | "LIMOUSINE"
  | "SPORTS_CAR"
  | "GRAND_TOURER"
  | "MUSCLE_CAR"
  | "COMMERCIAL_TAXI"
  | "POLICE_INTERCEPTOR"
  | "AMBULANCE_EMERGENCY"
  | "FIRE_COMMAND"
  | "RALLY_CAR"
  | "FORMULA_MONOPOSTO"
  | "TOURING_CAR_TCR"
  | "GT3_RACE_CAR"
  | "DRIFT_CAR"
  | "ELECTRIC_VEHICLE_BEV"
  | "PLUG_IN_HYBRID_PHEV"
  | "HYDROGEN_FUEL_CELL_FCEV";

export interface UtilityClassSpecification {
  id: UtilityClassId;
  displayName: string;
  category: UtilityClassCategory;
  passengerCapacity: number;
  cargoVolumeLiters: number;
  towingCapacityKg: number;
  typicalDragCoefficientCd: number;
  typicalFrontalAreaM2: number;
  drivetrainLayout: "FWD" | "RWD" | "AWD" | "4WD_LOW_RANGE" | "QUAD_MOTOR_TV";
  minimumSafetyNcapStars: number;
  description: string;
}

export const MASTER_UTILITY_CLASSES: Record<UtilityClassId, UtilityClassSpecification> = {
  CITY_CAR: {
    id: "CITY_CAR",
    displayName: "Urban City Car",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 4,
    cargoVolumeLiters: 220,
    towingCapacityKg: 0,
    typicalDragCoefficientCd: 0.32,
    typicalFrontalAreaM2: 2.0,
    drivetrainLayout: "FWD",
    minimumSafetyNcapStars: 4,
    description: "Ultra-compact vehicle designed for narrow city streets and easy parking.",
  },
  HATCHBACK: {
    id: "HATCHBACK",
    displayName: "Compact Hatchback",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 5,
    cargoVolumeLiters: 380,
    towingCapacityKg: 800,
    typicalDragCoefficientCd: 0.30,
    typicalFrontalAreaM2: 2.15,
    drivetrainLayout: "FWD",
    minimumSafetyNcapStars: 5,
    description: "Versatile 5-door hatchback balancing practical cargo space and tight handling.",
  },
  SEDAN: {
    id: "SEDAN",
    displayName: "Executive Sedan",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 5,
    cargoVolumeLiters: 480,
    towingCapacityKg: 1200,
    typicalDragCoefficientCd: 0.25,
    typicalFrontalAreaM2: 2.25,
    drivetrainLayout: "RWD",
    minimumSafetyNcapStars: 5,
    description: "Classic 3-box sedan combining aerodynamic efficiency, comfort, and status.",
  },
  WAGON: {
    id: "WAGON",
    displayName: "Sport Wagon / Estate",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 5,
    cargoVolumeLiters: 620,
    towingCapacityKg: 1800,
    typicalDragCoefficientCd: 0.28,
    typicalFrontalAreaM2: 2.30,
    drivetrainLayout: "AWD",
    minimumSafetyNcapStars: 5,
    description: "Long-roof wagon offering SUV utility with low sports sedan center of gravity.",
  },
  COUPE: {
    id: "COUPE",
    displayName: "Sport Coupe",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 4,
    cargoVolumeLiters: 320,
    towingCapacityKg: 0,
    typicalDragCoefficientCd: 0.27,
    typicalFrontalAreaM2: 2.10,
    drivetrainLayout: "RWD",
    minimumSafetyNcapStars: 4,
    description: "Sleek 2-door sloping roofline coupe optimized for style and dynamic handling.",
  },
  CONVERTIBLE: {
    id: "CONVERTIBLE",
    displayName: "Roadster / Convertible",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 2,
    cargoVolumeLiters: 200,
    towingCapacityKg: 0,
    typicalDragCoefficientCd: 0.35,
    typicalFrontalAreaM2: 2.05,
    drivetrainLayout: "RWD",
    minimumSafetyNcapStars: 4,
    description: "Open-top soft or hardtop roadster engineered for open-air driving thrill.",
  },
  SUV: {
    id: "SUV",
    displayName: "Full-Size SUV",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 7,
    cargoVolumeLiters: 850,
    towingCapacityKg: 3500,
    typicalDragCoefficientCd: 0.36,
    typicalFrontalAreaM2: 2.85,
    drivetrainLayout: "AWD",
    minimumSafetyNcapStars: 5,
    description: "Commanding 3-row high ground clearance vehicle built for towing and utility.",
  },
  CROSSOVER_CUV: {
    id: "CROSSOVER_CUV",
    displayName: "Compact Crossover (CUV)",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 5,
    cargoVolumeLiters: 520,
    towingCapacityKg: 1500,
    typicalDragCoefficientCd: 0.31,
    typicalFrontalAreaM2: 2.45,
    drivetrainLayout: "AWD",
    minimumSafetyNcapStars: 5,
    description: "Car-based unibody crossover offering elevated seating position and family practicality.",
  },
  PICKUP_TRUCK: {
    id: "PICKUP_TRUCK",
    displayName: "Full-Size Pickup Truck",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 5,
    cargoVolumeLiters: 1500, // Bed volume
    towingCapacityKg: 5000,
    typicalDragCoefficientCd: 0.42,
    typicalFrontalAreaM2: 3.10,
    drivetrainLayout: "4WD_LOW_RANGE",
    minimumSafetyNcapStars: 5,
    description: "Ladder-frame workhorse truck with open cargo bed and extreme towing capacity.",
  },
  MINIVAN: {
    id: "MINIVAN",
    displayName: "Family Minivan / MPV",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 8,
    cargoVolumeLiters: 1100,
    towingCapacityKg: 1600,
    typicalDragCoefficientCd: 0.32,
    typicalFrontalAreaM2: 2.70,
    drivetrainLayout: "FWD",
    minimumSafetyNcapStars: 5,
    description: "Sliding door multi-purpose vehicle maximizing interior cabin space and ergonomics.",
  },
  COMMERCIAL_VAN: {
    id: "COMMERCIAL_VAN",
    displayName: "High-Roof Cargo Van",
    category: "COMMERCIAL_FLEET",
    passengerCapacity: 2,
    cargoVolumeLiters: 12000,
    towingCapacityKg: 3000,
    typicalDragCoefficientCd: 0.44,
    typicalFrontalAreaM2: 3.40,
    drivetrainLayout: "RWD",
    minimumSafetyNcapStars: 4,
    description: "Commercial logistics van engineered for heavy payload capacity and durability.",
  },
  OFFROAD_4X4: {
    id: "OFFROAD_4X4",
    displayName: "Extreme 4x4 Off-Roader",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 5,
    cargoVolumeLiters: 700,
    towingCapacityKg: 3200,
    typicalDragCoefficientCd: 0.48,
    typicalFrontalAreaM2: 2.90,
    drivetrainLayout: "4WD_LOW_RANGE",
    minimumSafetyNcapStars: 4,
    description: "Rigid axle, triple locking differential off-road vehicle for harsh terrain.",
  },
  LIMOUSINE: {
    id: "LIMOUSINE",
    displayName: "Coachbuilt Limousine",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 6,
    cargoVolumeLiters: 550,
    towingCapacityKg: 0,
    typicalDragCoefficientCd: 0.31,
    typicalFrontalAreaM2: 2.50,
    drivetrainLayout: "AWD",
    minimumSafetyNcapStars: 5,
    description: "Extended wheelbase limousine featuring executive partition glass and luxury lounge.",
  },
  SPORTS_CAR: {
    id: "SPORTS_CAR",
    displayName: "Lightweight Sports Car",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 2,
    cargoVolumeLiters: 180,
    towingCapacityKg: 0,
    typicalDragCoefficientCd: 0.32,
    typicalFrontalAreaM2: 1.95,
    drivetrainLayout: "RWD",
    minimumSafetyNcapStars: 4,
    description: "Sub-1200kg driver-focused sports car prioritizing telepathic steering and feedback.",
  },
  GRAND_TOURER: {
    id: "GRAND_TOURER",
    displayName: "High-Speed Grand Tourer (GT)",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 4,
    cargoVolumeLiters: 400,
    towingCapacityKg: 0,
    typicalDragCoefficientCd: 0.28,
    typicalFrontalAreaM2: 2.20,
    drivetrainLayout: "RWD",
    minimumSafetyNcapStars: 5,
    description: "Front-mid engine 2+2 grand tourer engineered for effortless 300+ km/h cruising.",
  },
  MUSCLE_CAR: {
    id: "MUSCLE_CAR",
    displayName: "American V8 Muscle Car",
    category: "CONSUMER_PASSENGER",
    passengerCapacity: 4,
    cargoVolumeLiters: 380,
    towingCapacityKg: 0,
    typicalDragCoefficientCd: 0.36,
    typicalFrontalAreaM2: 2.35,
    drivetrainLayout: "RWD",
    minimumSafetyNcapStars: 4,
    description: "High-displacement V8 rear-wheel drive muscle car built for quarter-mile acceleration.",
  },
  COMMERCIAL_TAXI: {
    id: "COMMERCIAL_TAXI",
    displayName: "Metropolitan Taxi",
    category: "COMMERCIAL_FLEET",
    passengerCapacity: 5,
    cargoVolumeLiters: 500,
    towingCapacityKg: 0,
    typicalDragCoefficientCd: 0.31,
    typicalFrontalAreaM2: 2.30,
    drivetrainLayout: "FWD",
    minimumSafetyNcapStars: 5,
    description: "High-durability commercial taxi with wheelchair access ramps and low operating cost.",
  },
  POLICE_INTERCEPTOR: {
    id: "POLICE_INTERCEPTOR",
    displayName: "Police Pursuit Interceptor",
    category: "COMMERCIAL_FLEET",
    passengerCapacity: 5,
    cargoVolumeLiters: 480,
    towingCapacityKg: 1500,
    typicalDragCoefficientCd: 0.34,
    typicalFrontalAreaM2: 2.40,
    drivetrainLayout: "AWD",
    minimumSafetyNcapStars: 5,
    description: "Reinforced suspension & bull-bar police cruiser equipped with pursuit electronics.",
  },
  AMBULANCE_EMERGENCY: {
    id: "AMBULANCE_EMERGENCY",
    displayName: "Emergency Medical Ambulance",
    category: "COMMERCIAL_FLEET",
    passengerCapacity: 4,
    cargoVolumeLiters: 8000,
    towingCapacityKg: 2500,
    typicalDragCoefficientCd: 0.50,
    typicalFrontalAreaM2: 3.60,
    drivetrainLayout: "RWD",
    minimumSafetyNcapStars: 5,
    description: "Heavy-duty medical ambulance equipped with life support systems and siren bars.",
  },
  FIRE_COMMAND: {
    id: "FIRE_COMMAND",
    displayName: "Fire Department Command Unit",
    category: "COMMERCIAL_FLEET",
    passengerCapacity: 5,
    cargoVolumeLiters: 1200,
    towingCapacityKg: 4000,
    typicalDragCoefficientCd: 0.45,
    typicalFrontalAreaM2: 3.20,
    drivetrainLayout: "4WD_LOW_RANGE",
    minimumSafetyNcapStars: 5,
    description: "Heavy emergency response 4x4 command vehicle with HazMat comms suites.",
  },
  RALLY_CAR: {
    id: "RALLY_CAR",
    displayName: "WRC Rally Spec",
    category: "MOTORSPORT_RACING",
    passengerCapacity: 2,
    cargoVolumeLiters: 50,
    towingCapacityKg: 0,
    typicalDragCoefficientCd: 0.38,
    typicalFrontalAreaM2: 2.20,
    drivetrainLayout: "AWD",
    minimumSafetyNcapStars: 5,
    description: "FIA homologated WRC rally car with long-travel suspension and anti-lag turbo.",
  },
  FORMULA_MONOPOSTO: {
    id: "FORMULA_MONOPOSTO",
    displayName: "Single-Seater Formula Car",
    category: "MOTORSPORT_RACING",
    passengerCapacity: 1,
    cargoVolumeLiters: 0,
    towingCapacityKg: 0,
    typicalDragCoefficientCd: 0.75,
    typicalFrontalAreaM2: 1.40,
    drivetrainLayout: "RWD",
    minimumSafetyNcapStars: 5,
    description: "Open-wheel single-seater race car with halo protection and extreme wing downforce.",
  },
  TOURING_CAR_TCR: {
    id: "TOURING_CAR_TCR",
    displayName: "TCR Touring Race Car",
    category: "MOTORSPORT_RACING",
    passengerCapacity: 1,
    cargoVolumeLiters: 0,
    towingCapacityKg: 0,
    typicalDragCoefficientCd: 0.34,
    typicalFrontalAreaM2: 2.15,
    drivetrainLayout: "FWD",
    minimumSafetyNcapStars: 5,
    description: "Production-based TCR race car with sequential gearbox and widebody track kit.",
  },
  GT3_RACE_CAR: {
    id: "GT3_RACE_CAR",
    displayName: "FIA GT3 Endurance Race Car",
    category: "MOTORSPORT_RACING",
    passengerCapacity: 1,
    cargoVolumeLiters: 0,
    towingCapacityKg: 0,
    typicalDragCoefficientCd: 0.45,
    typicalFrontalAreaM2: 2.10,
    drivetrainLayout: "RWD",
    minimumSafetyNcapStars: 5,
    description: "Carbon monocoque GT3 race car with Bosch race ABS, traction control & aero diffuser.",
  },
  DRIFT_CAR: {
    id: "DRIFT_CAR",
    displayName: "Pro Formula Drift Spec",
    category: "MOTORSPORT_RACING",
    passengerCapacity: 1,
    cargoVolumeLiters: 0,
    towingCapacityKg: 0,
    typicalDragCoefficientCd: 0.40,
    typicalFrontalAreaM2: 2.10,
    drivetrainLayout: "RWD",
    minimumSafetyNcapStars: 4,
    description: "1000+ HP drift machine with Wisefab 70-degree steering lock angle kit.",
  },
  ELECTRIC_VEHICLE_BEV: {
    id: "ELECTRIC_VEHICLE_BEV",
    displayName: "Battery Electric Vehicle (BEV)",
    category: "POWERTRAIN_SPECIALTY",
    passengerCapacity: 5,
    cargoVolumeLiters: 550,
    towingCapacityKg: 1600,
    typicalDragCoefficientCd: 0.21,
    typicalFrontalAreaM2: 2.30,
    drivetrainLayout: "QUAD_MOTOR_TV",
    minimumSafetyNcapStars: 5,
    description: "Pure electric vehicle with floor-mounted battery pack and instant torque motor vectoring.",
  },
  PLUG_IN_HYBRID_PHEV: {
    id: "PLUG_IN_HYBRID_PHEV",
    displayName: "Plug-in Hybrid (PHEV)",
    category: "POWERTRAIN_SPECIALTY",
    passengerCapacity: 5,
    cargoVolumeLiters: 440,
    towingCapacityKg: 1800,
    typicalDragCoefficientCd: 0.26,
    typicalFrontalAreaM2: 2.35,
    drivetrainLayout: "AWD",
    minimumSafetyNcapStars: 5,
    description: "Dual-powertrain PHEV combining ICE range extension with 80km pure EV driving mode.",
  },
  HYDROGEN_FUEL_CELL_FCEV: {
    id: "HYDROGEN_FUEL_CELL_FCEV",
    displayName: "Hydrogen Fuel Cell (FCEV)",
    category: "POWERTRAIN_SPECIALTY",
    passengerCapacity: 5,
    cargoVolumeLiters: 420,
    towingCapacityKg: 1000,
    typicalDragCoefficientCd: 0.24,
    typicalFrontalAreaM2: 2.30,
    drivetrainLayout: "AWD",
    minimumSafetyNcapStars: 5,
    description: "Zero-emission fuel cell electric vehicle powered by 700-bar compressed hydrogen gas.",
  },
};
