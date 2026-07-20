// Generates 1000+ track-weapon cars and inserts them into Supabase via REST API.
// Run: node scripts/seed-cars.mjs

import { readFileSync } from "fs";

const env = readFileSync(".env", "utf8");
const getUrl = (n) => { const m = env.match(new RegExp(`^${n}=(.+)$`, "m")); return m ? m[1].trim() : null; };
const SUPA_URL = getUrl("VITE_SUPABASE_URL");
const ANON = getUrl("VITE_SUPABASE_ANON_KEY");

if (!SUPA_URL || !ANON) { console.error("Missing env"); process.exit(1); }

const TABLE = `${SUPA_URL}/rest/v1/competitors`;
const HEADERS = {
  "apikey": ANON,
  "Authorization": `Bearer ${ANON}`,
  "Content-Type": "application/json",
  "Prefer": "return=minimal,resolution=ignore-duplicates",
};

const BRANDS = [
  ["Ferrari","Italy","V12/V8 Twin-Turbo","RWD",1],
  ["Porsche","Germany","Flat-6 Twin-Turbo","RWD",2],
  ["McLaren","UK","V8 Twin-Turbo","RWD",1],
  ["Lamborghini","Italy","V10/V12 NA","AWD",1],
  ["Bugatti","France","W16 Quad-Turbo","AWD",1],
  ["Koenigsegg","Sweden","V8 Twin-Turbo","RWD",1],
  ["Pagani","Italy","V12 Twin-Turbo (AMG)","RWD",1],
  ["Aston Martin","UK","V12 Twin-Turbo","RWD",2],
  ["Mercedes-AMG","Germany","V8 Twin-Turbo / V12","RWD",2],
  ["BMW M","Germany","I6 Twin-Turbo / V8","RWD",3],
  ["Audi Sport","Germany","V10 / V8 Twin-Turbo","AWD",3],
  ["Nissan","Japan","V6 Twin-Turbo","AWD",3],
  ["Toyota","Japan","I6 Twin-Turbo / V10","RWD",3],
  ["Honda","Japan","V6 / I4 Turbo","FWD",4],
  ["Mazda","Japan","Rotary / I4 Turbo","RWD",4],
  ["Subaru","Japan","Flat-4 Turbo","AWD",4],
  ["Mitsubishi","Japan","I4 Turbo","AWD",4],
  ["Chevrolet","USA","V8 LS / LT","RWD",3],
  ["Ford","USA","V8 Supercharged / Coyote","RWD",3],
  ["Dodge","USA","V8 / V10","RWD",3],
  ["Cadillac","USA","V8 Twin-Turbo / LS","RWD",3],
  ["Corvette","USA","V8 LT","RWD",2],
  ["Shelby","USA","V8 Supercharged","RWD",2],
  ["Lexus","Japan","V10 / V8","RWD",3],
  ["Acura","Japan","I4 Turbo / V6","FWD",4],
  ["Lotus","UK","I4 / V6 Supercharged","RWD",2],
  ["Caterham","UK","I4 Ford","RWD",4],
  ["Morgan","UK","V6 / I4","RWD",4],
  ["Noble","UK","V6 Twin-Turbo","RWD",2],
  ["Radical","UK","V8 / I4","RWD",4],
  ["Ariel","UK","I4 / V8","RWD",4],
  ["BAC","UK","I4 Cosworth","RWD",4],
  ["Zenvo","Denmark","V8 Supercharged","RWD",1],
  ["Rimac","Croatia","Quad E-Motors","AWD",1],
  ["Pininfarina","Italy","Quad E-Motors","AWD",1],
  ["W Motors","UAE","V6 Twin-Turbo","RWD",1],
  ["Spyker","Netherlands","V8 Audi","RWD",2],
  ["Toyota GR","Japan","I3 Turbo / Flat-6","RWD",4],
  ["Suzuki","Japan","I4 Turbo","AWD",4],
  ["Daihatsu","Japan","I3 Turbo","FWD",4],
  ["Ruf","Germany","Flat-6 Turbo","RWD",2],
  ["9ff","Germany","Flat-6 Turbo","RWD",2],
  ["Gemballa","Germany","Flat-6 Turbo","RWD",2],
  ["Brabus","Germany","V8/V12 Twin-Turbo","RWD",2],
  ["Alpina","Germany","V8/I6 Twin-Turbo","AWD",3],
  ["Alpine","France","I4 Turbo / V6","RWD",4],
  ["Renaultsport","France","I4 Turbo","FWD",4],
  ["Peugeot Sport","France","I4 Turbo","FWD",4],
  ["Maserati","Italy","V8 Twin-Turbo","RWD",3],
  ["Alfa Romeo","Italy","V6 Twin-Turbo / V4","RWD",3],
  ["Lancia","Italy","I4 Turbo","AWD",4],
  ["Volvo","Sweden","I4/I5 Turbo","AWD",4],
  ["KTM","Austria","I4 Audi","RWD",4],
  ["Wiesmann","Germany","V8 Twin-Turbo","RWD",3],
  ["De Tomaso","Italy","V8 Ford","RWD",3],
  ["Panoz","USA","V8 LS","RWD",3],
  ["Saleen","USA","V8 Supercharged","RWD",2],
  ["Hennessey","USA","V8 Twin-Turbo","RWD",1],
  ["SSC","USA","V8 Twin-Turbo","RWD",1],
  ["Trion","USA","V8 Twin-Turbo","RWD",1],
  ["Rezvani","USA","I4 Turbo / V8","RWD",3],
];

const TIERS = {
  1: ["Jesko","Regera","Gemera","Chiron","Veyron","Centenario","Sian","Veneno","Huayra","Zonda","R","Senna","Speedtail","P1","Evija","Nevera","Battista","Valkyrie","One:1","Agera","CCX","Vitesse","Super Sport","Pur Sport","Tuatara","Venom F5","Nemesis","Stradale","Aperta","Speciale","SVJ","Ultimae","Revuelto","Countach","LM"],
  2: ["GT3","GT3 RS","GT2 RS","Turbo S","GT RS","Spyder","Cup","ClubSport","GT R","GT R Pro","Black Series","CSL","GTS","Competizione","Performante","Superleggera","Vantage","DBS","DB11","Vanquish","Bullitt","GT500","ZR1","Z06","ZL1","GT-R","NSX","LFA","RC F","Viper","SRT","Demon","Hellcat","Continental","Wraith","Mulsanne"],
  3: ["M3","M4","M5","M6","M2","M8","RS3","RS4","RS5","S4","S5","S6","S7","S8","C 43","C 63","E 63","A 45","IS F","Stinger GT","Type R","Civic R","Integra R","Megane R","Clio R","Cooper JCW","Giulia","Stelvio","Quadrifoglio","Ghibli","Levante","MC20","Grecale","GranTurismo","Coupe","Roadster","SV","N","N Line"],
  4: ["Type R","Si","ST","RS","GTI","R","N","Track","Cup","Sport","ClubSport","Exige","Elise","Evora","Seven","620R","360R","R500","Atom","Nomad","Raptor","Mono","GTM","SR1","SR3","SR8","RX-7","RX-8","MX-5","86","BRZ","GR86","GR Corolla","Yaris GR","Impreza","WRX","STI","Lancer","Evo","Silvia","180SX","Skyline","Supra","AE86","Celica","MR2","GT86"],
};

const SUFFIXES = ["","","","","R","S","RS","GT","Sport","Track","Edition","Limited","Final","Anniversary","Heritage","LM","CSL","CS","GTS","Cup","Speciale","Pista","Stradale","Veloce","Widebody","Competition","Pack","Performance","ClubSport","GT4","GT3","LM"];

function rng(s){let x=s|0;return()=>{x=(x*1664525+1013904223)|0;return((x>>>0)%1e6)/1e6};}
const pick=(a,r)=>a[Math.floor(r()*a.length)];
const range=(lo,hi,r)=>Math.floor(lo+r()*(hi-lo+1));
const r1=v=>Math.round(v*10)/10;
const r2=v=>Math.round(v*100)/100;

function gen(){
  const r=rng(20260720);
  const out=[];
  for(const[brand,country,eng,drive,tier]of BRANDS){
    const count=tier===1?range(10,18,r):tier===2?range(18,28,r):tier===3?range(20,30,r):range(14,24,r);
    for(let i=0;i<count;i++){
      const base=pick(TIERS[tier],r), suf=pick(SUFFIXES,r);
      const year=range(1995,2025,r);
      const model=(base+(suf?" "+suf:"")).trim();
      let power,torque,weight,topSpeed,accel,accel200,qm,brake,latG,price,nurb;
      if(tier===1){
        if(r()<0.15){power=range(1000,1900,r);torque=range(1500,2400,r);weight=range(1500,2200,r);topSpeed=range(350,490,r);accel=r1(1.8+r()*1);accel200=r1(4+r()*2.5);}
        else{power=range(700,1600,r);torque=range(700,1600,r);weight=range(1100,1900,r);topSpeed=range(330,530,r);accel=r1(2.2+r());accel200=r1(5.5+r()*3);}
        qm=r1(8.4+r()*1.6);brake=range(26,32,r);latG=r2(1.1+r()*0.4);price=range(800,5000,r)*1000;nurb=r()<0.35?r2(380+r()*45):null;
      }else if(tier===2){
        power=range(450,850,r);torque=range(500,1000,r);weight=range(1200,1800,r);topSpeed=range(290,380,r);accel=r1(2.6+r()*1.2);accel200=r1(7+r()*4);qm=r1(9.5+r()*1.5);brake=range(28,35,r);latG=r2(1+r()*0.35);price=range(120,800,r)*1000;nurb=r()<0.3?r2(405+r()*35):null;
      }else if(tier===3){
        power=range(300,650,r);torque=range(350,800,r);weight=range(1300,2000,r);topSpeed=range(250,330,r);accel=r1(3.2+r()*1.8);accel200=r1(9+r()*6);qm=r1(10.5+r()*2);brake=range(31,40,r);latG=r2(0.9+r()*0.3);price=range(40,250,r)*1000;nurb=r()<0.2?r2(430+r()*40):null;
      }else{
        power=range(150,450,r);torque=range(180,500,r);weight=range(800,1400,r);topSpeed=range(200,300,r);accel=r1(3.8+r()*3);accel200=null;qm=r1(11.5+r()*3);brake=range(33,45,r);latG=r2(0.85+r()*0.3);price=range(25,150,r)*1000;nurb=r()<0.15?r2(450+r()*50):null;
      }
      out.push({company:brand.trim(),country,model,year,image_url:null,power_hp:power,torque_nm:torque,weight_kg:weight,top_speed_kmh:topSpeed,accel_0_100:accel,accel_0_200:accel200,quarter_mile:qm,braking_100_0:brake,lateral_g:latG,drivetrain:drive,engine_desc:eng,price_usd:price,nurburgring_lap:nurb,laguna_seca_lap:null,top_gear_track_lap:null,description:`${eng} · ${drive} · ${power} hp`});
    }
  }
  return out;
}

async function insertBatch(rows){
  const res = await fetch(TABLE,{method:"POST",headers:HEADERS,body:JSON.stringify(rows)});
  if(!res.ok){const t=await res.text();throw new Error(`HTTP ${res.status}: ${t}`);}
  return rows.length;
}

const all=gen();
console.error(`Generated ${all.length} cars. Inserting in batches of 100...`);
const BATCH=100;
let done=0;
for(let i=0;i<all.length;i+=BATCH){
  const batch=all.slice(i,i+BATCH);
  await insertBatch(batch);
  done+=batch.length;
  console.error(`Inserted ${done}/${all.length}`);
}
console.error("Done.");
