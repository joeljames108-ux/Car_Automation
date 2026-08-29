import * as THREE from "three";

export interface TireCompound { name: string; grip: number; wear: number; tempRange: [number, number]; color: number; treadPattern: "slick" | "semi" | "wet" | "all"; }

const COMPOUNDS: TireCompound[] = [
  { name: "Pirelli P Zero", grip: 1.0, wear: 1.0, tempRange: [80, 110], color: 0x1a1a1a, treadPattern: "slick" },
  { name: "Michelin Pilot Sport", grip: 0.95, wear: 1.2, tempRange: [70, 100], color: 0x1a1a1a, treadPattern: "semi" },
  { name: "Bridgestone Potenza", grip: 0.92, wear: 1.1, tempRange: [75, 105], color: 0x1a1a1a, treadPattern: "slick" },
  { name: "Continental SportContact", grip: 0.9, wear: 1.3, tempRange: [65, 95], color: 0x1a1a1a, treadPattern: "semi" },
  { name: "Dunlop SP Sport Maxx", grip: 0.88, wear: 1.4, tempRange: [60, 90], color: 0x1a1a1a, treadPattern: "all" },
  { name: "Pirelli P Zero Corsa", grip: 1.05, wear: 0.8, tempRange: [90, 120], color: 0x1a1a1a, treadPattern: "slick" },
  { name: "Michelin Pilot Sport Cup", grip: 1.1, wear: 0.6, tempRange: [95, 130], color: 0x1a1a1a, treadPattern: "slick" },
  { name: "Toyo Proxes R888R", grip: 0.98, wear: 0.9, tempRange: [85, 115], color: 0x1a1a1a, treadPattern: "semi" },
  { name: "Nitto NT01", grip: 0.97, wear: 0.85, tempRange: [80, 110], color: 0x1a1a1a, treadPattern: "semi" },
  { name: "Yokohama Advan A052", grip: 0.96, wear: 0.95, tempRange: [75, 105], color: 0x1a1a1a, treadPattern: "all" },
  { name: "Pirelli Cinturato Wet", grip: 0.7, wear: 1.5, tempRange: [40, 80], color: 0x222222, treadPattern: "wet" },
  { name: "Michelin Pilot Sport Rain", grip: 0.72, wear: 1.4, tempRange: [35, 75], color: 0x222222, treadPattern: "wet" },
];

export class AdvancedTireCompounds {
  getAllCompounds(): TireCompound[] { return [...COMPOUNDS]; }
  getCompound(name: string): TireCompound | undefined { return COMPOUNDS.find(c => c.name === name); }
  getWetCompounds(): TireCompound[] { return COMPOUNDS.filter(c => c.treadPattern === "wet"); }
  getDryCompounds(): TireCompound[] { return COMPOUNDS.filter(c => c.treadPattern !== "wet"); }

  buildTireMesh(compound: TireCompound, radius: number = 0.25, width: number = 0.12): THREE.Group {
    const grp = new THREE.Group();
    const tireMat = new THREE.MeshStandardMaterial({ color: compound.color, roughness: 0.85 });
    const tire = new THREE.Mesh(new THREE.TorusGeometry(radius, width * 0.3, 12, 48), tireMat);
    tire.rotation.x = Math.PI / 2;
    grp.add(tire);
    if (compound.treadPattern !== "slick") {
      const grooveCount = compound.treadPattern === "wet" ? 24 : 16;
      for (let i = 0; i < grooveCount; i++) {
        const a = (i / grooveCount) * Math.PI * 2;
        const groove = new THREE.Mesh(new THREE.BoxGeometry(0.002, width * 0.35, radius * 0.02), new THREE.MeshStandardMaterial({ color: 0x0f0f0f, roughness: 0.95 }));
        groove.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
        groove.rotation.y = a;
        grp.add(groove);
      }
    }
    return grp;
  }
}
