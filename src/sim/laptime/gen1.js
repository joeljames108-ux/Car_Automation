var fs=require("fs");
function W(f,c){fs.writeFileSync("src/sim/laptime/"+f,c);console.log(f+":"+c.split("
").length+" lines");}
function A(f,c){fs.appendFileSync("src/sim/laptime/"+f,c);}

// ============================================
// CIRCUIT DATABASE — SPA, MONZA, SILVERSTONE, SUZUKA, MONACO, INTERLAGOS, COTA, NURBURGRING
// ============================================
var db = [];
function push(s){db.push(s);}

push("// === ULTRA-DETAILED CIRCUIT DATABASE ===");
push("");
push("export interface DetailedCorner {");
push("  name: string; number: number; type: string; direction: string;");
push("  radiusM: number; radiusOuterM: number; arcLengthM: number; arcDegrees: number;");
push("  entrySpeedF1Kmh: number; apexSpeedF1Kmh: number; exitSpeedF1Kmh: number;");
push("  entrySpeedGT3Kmh: number; apexSpeedGT3Kmh: number; exitSpeedGT3Kmh: number;");
push("  camberDegrees: number; elevationChangeM: number; elevationGradientPct: number;");
push("  surfaceGrip: number; surfaceType: string;");
push("  hasKerbInside: boolean; hasKerbOutside: boolean;");
push("  kerbTypeInside: string; kerbTypeOutside: string;");
push("  kerbRideabilityInside: number; kerbRideabilityOutside: number;");
push("  isDRSActivation: boolean; isDRSDetection: boolean;");
push("  overtakingDifficulty: number; trackWidthM: number;");
push("  drainageQuality: number; sunExposure: number; bumpSeverity: number;");
push("  runoffType: string; runoffDistanceM: number;");
push("  safetyCarProbability: number; cornerDifficultyIndex: number;");
push("  bestOvertakeOpportunity: boolean;");
push("}");
